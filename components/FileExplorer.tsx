import React, { useState } from 'react';
import { FileNode } from '../types';
import Icon from './Icon';

interface FileExplorerProps {
  fileSystem: FileNode[];
  onFileSelect: (file: FileNode) => void;
}

const FileEntry: React.FC<{ node: FileNode; onFileSelect: (file: FileNode) => void; depth: number }> = ({ node, onFileSelect, depth }) => {
  const [isOpen, setIsOpen] = useState(true);
  const isDirectory = node.type === 'directory';

  const handleToggle = () => {
    if (isDirectory) {
      setIsOpen(!isOpen);
    }
  };
  
  const handleSelect = () => {
    if (!isDirectory) {
      onFileSelect(node);
    }
  }

  return (
    <div>
      <div 
        className="flex items-center p-1 cursor-pointer hover:bg-[#000080] hover:text-white dark:hover:bg-blue-800"
        style={{ paddingLeft: `${depth * 1.5}rem` }}
        onClick={isDirectory ? handleToggle : handleSelect}
        onDoubleClick={isDirectory ? handleToggle : undefined}
      >
        <span className="w-6">
            {isDirectory ? <Icon name={isOpen ? 'folder-open' : 'folder'} /> : <Icon name="file" />}
        </span>
        <span>{node.name}</span>
      </div>
      {isDirectory && isOpen && node.children && (
        <div>
          {node.children.map(child => (
            <FileEntry key={child.id} node={child} onFileSelect={onFileSelect} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

const FileExplorer: React.FC<FileExplorerProps> = ({ fileSystem, onFileSelect }) => {
  return (
    <div className="h-full overflow-y-auto bg-inherit text-lg text-black dark:text-gray-200">
      {fileSystem.map(node => (
        <FileEntry key={node.id} node={node} onFileSelect={onFileSelect} depth={0} />
      ))}
    </div>
  );
};

export default FileExplorer;
