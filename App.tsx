import React, { useState, useCallback } from 'react';
import Window from './components/Window';
import StatusBar from './components/StatusBar';
import ChatWindow from './components/ChatWindow';
import AgentManager from './components/AgentManager';
import FileExplorer from './components/FileExplorer';
import CodeEditor from './components/CodeEditor';
import KnowledgeGraph from './components/KnowledgeGraph';
import SwarmManager from './components/SwarmManager';
import DocRag from './components/DocRag';
import Settings from './components/Settings'; // Import the new Settings component
import AnimatedBackground from './components/AnimatedBackground';
import { WindowInstance, AppWindow, ChatMessage, Agent, Checkpoint, SettingsState, FileNode } from './types';
import { INITIAL_AGENTS, DEFAULT_SETTINGS } from './constants';

const App: React.FC = () => {
  const [windows, setWindows] = useState<WindowInstance[]>([]);
  const [agents, setAgents] = useState<Agent[]>(INITIAL_AGENTS);
  const [activeAgents, setActiveAgents] = useState<Agent[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([]);
  const [fileSystemTree, setFileSystemTree] = useState<FileNode | null>(null);
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
  const [settings, setSettings] = useState<SettingsState>(DEFAULT_SETTINGS);

  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  React.useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const openWindow = (app: AppWindow) => {
    setWindows(prev => {
      const existingWindow = prev.find(w => w.app === app);
      if (existingWindow) {
        return bringToFront(existingWindow.id, prev);
      }
      const newWindow: WindowInstance = {
        id: `${app}-${Date.now()}`,
        app,
        title: app,
        isOpen: true,
        isMinimized: false,
        position: { x: 50 + prev.length * 20, y: 50 + prev.length * 20 },
        size: { width: 640, height: 480 },
        zIndex: Math.max(0, ...prev.map(w => w.zIndex)) + 1,
      };
      return [...prev, newWindow];
    });
  };

  const bringToFront = (id: string, currentWindows: WindowInstance[]): WindowInstance[] => {
    const maxZ = Math.max(0, ...currentWindows.map(w => w.zIndex));
    return currentWindows.map(w => {
      if (w.id === id) {
        return { ...w, zIndex: maxZ + 1, isMinimized: false };
      }
      return w;
    });
  };

  const handleFocus = useCallback((id: string) => {
    setWindows(prev => bringToFront(id, prev));
  }, []);

  const handleClose = (id: string) => {
    setWindows(prev => prev.filter(w => w.id !== id));
  };
  
  const handleMinimize = (id: string) => {
      setWindows(prev => prev.map(w => w.id === id ? { ...w, isMinimized: true } : w));
  };
  
  const handleToggle = (id: string) => {
      setWindows(prev => {
          const win = prev.find(w => w.id === id);
          if (!win) return prev;

          if (win.isMinimized) {
              // If it's minimized, restore and focus it.
              return bringToFront(id, prev);
          } else {
              // If it's not minimized, check if it's the top-most visible window.
              const topZ = Math.max(0, ...prev.filter(w => !w.isMinimized).map(w => w.zIndex));
              if (win.zIndex === topZ) {
                  // If it's already the active window, minimize it.
                  return prev.map(w => (w.id === id ? { ...w, isMinimized: true } : w));
              } else {
                  // If it's not the active window, just bring it to the front.
                  return bringToFront(id, prev);
              }
          }
      });
  };

  const handleSelectDirectory = async () => {
    try {
      const dirPath = await window.ipc.invoke('open-directory-dialog');
      if (dirPath) {
        const stats = await window.fs.stat(dirPath);
        setFileSystemTree({
          id: dirPath,
          name: dirPath.split(/[\\/]/).pop() || dirPath,
          type: 'directory',
          path: dirPath,
          children: [],
        });
      }
    } catch (error) {
      alert(`Error selecting directory: ${(error as Error).message}`);
    }
  };

  const handleToggleNode = async (nodePath: string) => {
    if (!fileSystemTree) return;

    const updateNode = async (node: FileNode): Promise<FileNode> => {
      if (node.path === nodePath) {
        if (node.type === 'directory' && (!node.children || node.children.length === 0)) {
          try {
            const files = await window.fs.readdir(node.path);
            const children = await Promise.all(
              files.map(async (file) => {
                const filePath = await window.path.join(node.path, file.name);
                const stats = await window.fs.stat(filePath);
                return {
                  id: filePath,
                  name: file.name,
                  type: stats.isDirectory() ? 'directory' : 'file',
                  path: filePath,
                  children: stats.isDirectory() ? [] : undefined,
                };
              })
            );
            return { ...node, children, isOpen: true };
          } catch (error) {
            alert(`Error reading directory "${node.name}": ${(error as Error).message}`);
            return { ...node, isOpen: false }; // Keep it closed on error
          }
        } else {
          return { ...node, isOpen: !node.isOpen };
        }
      }

      if (node.children) {
        const newChildren = await Promise.all(node.children.map(child => updateNode(child)));
        return { ...node, children: newChildren };
      }

      return node;
    };

    const newTree = await updateNode(fileSystemTree);
    setFileSystemTree(newTree);
  };
  
  const handleFileSelect = (file: FileNode) => {
    setSelectedFile(file);
    // Open editor or bring to front if already open
    const editorWindow = windows.find(w => w.app === AppWindow.CODE_EDITOR);
    if (editorWindow) {
      handleFocus(editorWindow.id);
    } else {
      openWindow(AppWindow.CODE_EDITOR);
    }
  };
  
  const handleCreateCheckpoint = () => {
    const newCheckpoint: Checkpoint = {
        id: `CP-${(checkpoints.length + 1).toString().padStart(3, '0')}`,
        timestamp: new Date(),
        messages: [...messages],
        activeAgents: [...activeAgents],
    };
    setCheckpoints(prev => [...prev, newCheckpoint]);
    setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'system', text: `Checkpoint "${newCheckpoint.id}" created.` }]);
  };
  
  const handleRevertToCheckpoint = (id: string) => {
    const checkpoint = checkpoints.find(c => c.id === id);
    if (checkpoint) {
        setMessages([...checkpoint.messages, {id: Date.now().toString(), sender: 'system', text: `Reverted to checkpoint "${checkpoint.id}".`}]);
        setActiveAgents(checkpoint.activeAgents);
    }
  };


  const getWindowContent = (app: AppWindow) => {
    switch (app) {
      case AppWindow.CHAT:
        return <ChatWindow 
                    messages={messages} 
                    setMessages={setMessages} 
                    activeAgents={activeAgents}
                    checkpoints={checkpoints}
                    onCreateCheckpoint={handleCreateCheckpoint}
                    onRevertToCheckpoint={handleRevertToCheckpoint}
                    settings={settings}
                />;
      case AppWindow.AGENT_MANAGER:
        return <AgentManager agents={agents} setAgents={setAgents} activeAgents={activeAgents} setActiveAgents={setActiveAgents} />;
      case AppWindow.FILE_EXPLORER:
        return <FileExplorer
                    fileSystemTree={fileSystemTree}
                    onFileSelect={handleFileSelect}
                    onSelectDirectory={handleSelectDirectory}
                    onToggleNode={handleToggleNode}
                />;
      case AppWindow.CODE_EDITOR:
        return <CodeEditor file={selectedFile} />;
      case AppWindow.KNOWLEDGE_GRAPH:
        return <KnowledgeGraph fileSystemTree={fileSystemTree} />;
      case AppWindow.SWARM_MANAGER:
        return <SwarmManager />;
      case AppWindow.DOC_RAG:
        return <DocRag />;
      case AppWindow.SETTINGS: // Render the new Settings component
        return <Settings settings={settings} setSettings={setSettings} />;
      default:
        return <div className="p-4">Component for {app} not implemented yet.</div>;
    }
  };

  return (
    <div className="font-display h-screen w-screen flex flex-col overflow-hidden bg-transparent">
      <main className="flex-grow relative isolate overflow-hidden psychedelic-bg">
        <AnimatedBackground />
        {windows.filter(w => !w.isMinimized).map(win => (
          <Window
            key={win.id}
            id={win.id}
            title={win.app === AppWindow.CODE_EDITOR && selectedFile ? `${win.title} - ${selectedFile.name}` : win.title}
            initialPosition={win.position}
            initialSize={win.size}
            zIndex={win.zIndex}
            onClose={() => handleClose(win.id)}
            onMinimize={() => handleMinimize(win.id)}
            onFocus={handleFocus}
          >
            {getWindowContent(win.app)}
          </Window>
        ))}
      </main>
      <StatusBar allWindows={windows} onToggle={handleToggle} onFocus={handleFocus} onToggleTheme={toggleTheme} onOpenApp={openWindow} />
    </div>
  );
};

export default App;
