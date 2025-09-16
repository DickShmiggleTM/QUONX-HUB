import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { FileNode } from '../types';
import Button from './Button';

interface CodeEditorProps {
  file: FileNode | null;
}

const getLanguageFromFileName = (fileName: string): string => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
        case 'js':
        case 'jsx':
            return 'javascript';
        case 'ts':
        case 'tsx':
            return 'typescript';
        case 'py':
            return 'python';
        case 'java':
            return 'java';
        case 'c':
        case 'cpp':
            return 'csharp';
        case 'html':
            return 'html';
        case 'css':
            return 'css';
        case 'json':
            return 'json';
        case 'md':
            return 'markdown';
        default:
            return 'plaintext';
    }
};

const CodeEditor: React.FC<CodeEditorProps> = ({ file }) => {
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (file) {
      setIsLoading(true);
      window.fs.readFile(file.path)
        .then(fileContent => {
          setContent(fileContent);
        })
        .catch(err => {
          console.error("Failed to read file:", err);
          setContent(`Error reading file: ${err.message}`);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setContent('');
    }
  }, [file]);

  if (!file) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
        <p>Select a file to view its content.</p>
      </div>
    );
  }
  
  const handleSave = async () => {
    if (file) {
      try {
        await window.fs.writeFile(file.path, content);
        alert(`${file.name} saved!`);
      } catch (err) {
        console.error("Failed to save file:", err);
        alert(`Error saving file: ${err.message}`);
      }
    }
  };
  
  const handleDebug = () => {
    // In a real app, this would send the code to the AI for debugging.
    console.log(`Debugging ${file.name}`);
    alert(`AI is debugging ${file.name}! (Simulation)`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
        <p>Loading {file.name}...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#1e1e1e] text-black dark:text-gray-200 font-mono text-lg">
      <div className="flex-grow">
        <Editor
          height="100%"
          language={getLanguageFromFileName(file.name)}
          value={content}
          onChange={(value) => setContent(value || '')}
          theme={document.documentElement.classList.contains('dark') ? 'vs-dark' : 'light'}
          options={{
            minimap: { enabled: false },
            fontSize: 16,
            wordWrap: 'on',
            scrollBeyondLastLine: false,
          }}
        />
      </div>
      <div className="p-2 border-t-2 border-gray-300 dark:border-gray-600 flex space-x-2">
        <Button onClick={handleSave}>Save</Button>
        <Button onClick={handleDebug}>Autonomous Debug</Button>
      </div>
    </div>
  );
};

export default CodeEditor;