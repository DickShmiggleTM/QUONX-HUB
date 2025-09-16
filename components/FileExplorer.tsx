import React from 'react';
import { FileNode } from '../types';
import Icon from './Icon';

interface FileExplorerProps {
  fileSystemTree: FileNode | null;
  onFileSelect: (file: FileNode) => void;
  onSelectDirectory: () => void;
  onToggleNode: (path: string) => void;
}

interface FileEntryProps {
    node: FileNode;
    onFileSelect: (file: FileNode) => void;
    onToggleNode: (path: string) => void;
    depth: number;
}

const FileEntry: React.FC<FileEntryProps> = ({ node, onFileSelect, onToggleNode, depth }) => {
  const isDirectory = node.type === 'directory';

  const handleSelect = () => {
    if (!isDirectory) {
      onFileSelect(node);
    } else {
      onToggleNode(node.path);
    }
  }

  return (
    <div>
      <div 
        className="flex items-center p-1 cursor-pointer hover:bg-[#000080] hover:text-white dark:hover:bg-blue-800"
        style={{ paddingLeft: `${depth * 1.5}rem` }}
        onClick={handleSelect}
      >
        <span className="w-6">
            {isDirectory ? <Icon name={node.isOpen ? 'folder-open' : 'folder'} /> : <Icon name="file" />}
        </span>
        <span>{node.name}</span>
      </div>
      {isDirectory && node.isOpen && node.children && (
        <div>
          {node.children.map(child => (
            <FileEntry key={child.id} node={child} onFileSelect={onFileSelect} onToggleNode={onToggleNode} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

const FileExplorer: React.FC<FileExplorerProps> = ({ fileSystemTree, onFileSelect, onSelectDirectory, onToggleNode }) => {
  return (
    <div className="h-full overflow-y-auto bg-inherit text-lg text-black dark:text-gray-200">
      <button onClick={onSelectDirectory} className="w-full p-2 text-left bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600">
        Select Directory
      </button>
      {fileSystemTree && <FileEntry node={fileSystemTree} onFileSelect={onFileSelect} onToggleNode={onToggleNode} depth={0} />}
    </div>
  );
};

export default FileExplorer;
