import { Agent, FileNode, SettingsState } from './types';

export const INITIAL_AGENTS: Agent[] = [
  {
    id: 'agent-1',
    name: 'Code-Monkey',
    role: 'Software Engineer',
    systemPrompt: 'You are an expert software engineer. You write clean, efficient, and well-documented TypeScript and React code. You follow instructions precisely.'
  },
  {
    id: 'agent-2',
    name: 'Doc-Hound',
    role: 'Technical Writer',
    systemPrompt: 'You are a technical writer. Your job is to analyze code and create clear, concise documentation in Markdown format. You are an expert in explaining complex technical concepts to any audience.'
  },
  {
    id: 'agent-3',
    name: 'Bug-Zapper',
    role: 'QA Engineer',
    systemPrompt: 'You are a QA engineer. You are an expert at finding bugs and vulnerabilities in code. When you find an issue, you provide a clear description, steps to reproduce, and a suggested fix.'
  }
];

export const DEFAULT_SETTINGS: SettingsState = {
    geminiModel: 'gemini-1.5-flash',
  ollamaUrl: 'http://localhost:11434',
  ollamaModel: 'llama3',
  lmstudioUrl: 'http://localhost:1234/v1',
  lmstudioModel: 'lmstudio-community/Meta-Llama-3-8B-Instruct-GGUF',
};


export const MOCK_FILE_SYSTEM: FileNode[] = [
  {
    id: 'root',
    name: 'my-ai-project',
    type: 'directory',
    path: '/my-ai-project',
    children: [
      {
        id: 'src',
        name: 'src',
        type: 'directory',
        path: '/my-ai-project/src',
        children: [
          {
            id: 'components',
            name: 'components',
            type: 'directory',
            path: '/my-ai-project/src/components',
            children: [
              {
                id: 'Button.tsx-mock',
                name: 'Button.tsx',
                type: 'file',
                path: '/my-ai-project/src/components/Button.tsx',
                content: `import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ children, className, ...props }) => {
  return (
    <button
      className={\`px-4 py-1 bg-[#c0c0c0] dark:bg-[#4a5568] border-t-2 border-l-2 border-white dark:border-gray-500 border-b-2 border-r-2 border-black text-black dark:text-white text-lg focus:outline-none active:border-b-white active:dark:border-b-gray-500 active:border-r-white active:dark:border-r-gray-500 active:border-t-black active:dark:border-t-black active:border-l-black disabled:text-gray-500 dark:disabled:text-gray-400 disabled:border-gray-500 disabled:active:border-gray-500 \${className}\`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
`
              }
            ]
          },
          {
            id: 'App.tsx-mock',
            name: 'App.tsx',
            type: 'file',
            path: '/my-ai-project/src/App.tsx',
            content: `// Main application component.`
          }
        ]
      },
      {
        id: 'package.json',
        name: 'package.json',
        type: 'file',
        path: '/my-ai-project/package.json',
        content: `{
  "name": "my-ai-project",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  }
}`
      }
    ]
  }
];
