import React, { useState, useEffect } from 'react';
import { FileNode } from '../types';
import Button from './Button';

interface CodeEditorProps {
  file: FileNode | null;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ file }) => {
  const [content, setContent] = useState('');

  useEffect(() => {
    setContent(file?.content || '');
  }, [file]);

  if (!file) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
        <p>Select a file to view its content.</p>
      </div>
    );
  }
  
  const handleSave = () => {
    // In a real app, this would save the file to the filesystem.
    console.log(`Saving ${file.name} with content:\n${content}`);
    alert(`${file.name} saved! (Check console)`);
  };
  
  const handleDebug = () => {
    // In a real app, this would send the code to the AI for debugging.
    console.log(`Debugging ${file.name}`);
    alert(`AI is debugging ${file.name}! (Simulation)`);
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#1e1e1e] text-black dark:text-gray-200 font-mono text-lg">
      <div className="flex-grow relative">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="absolute top-0 left-0 w-full h-full p-2 bg-transparent resize-none border-0 outline-none leading-relaxed"
          spellCheck="false"
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