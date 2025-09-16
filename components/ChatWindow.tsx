import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, Agent, ModelProvider, Checkpoint, SettingsState } from '../types';
import { fetchOllamaModels, fetchLmStudioModels } from '../services/geminiService';
import Button from './Button';
import Icon from './Icon';

interface ChatWindowProps {
  activeAgents: Agent[];
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  checkpoints: Checkpoint[];
  onCreateCheckpoint: () => void;
  onRevertToCheckpoint: (id: string) => void;
  settings: SettingsState;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ activeAgents, messages, setMessages, checkpoints, onCreateCheckpoint, onRevertToCheckpoint, settings }) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [modelProvider, setModelProvider] = useState<ModelProvider>('gemini');
  const [selectedLocalModel, setSelectedLocalModel] = useState('');
  
  const [ollamaModels, setOllamaModels] = useState<string[]>([]);
  const [lmStudioModels, setLmStudioModels] = useState<string[]>([]);
  const [localModelStatus, setLocalModelStatus] = useState<Record<ModelProvider, string>>({
      gemini: 'Online',
      ollama: 'Detecting...',
      lmstudio: 'Detecting...'
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showCheckpoints, setShowCheckpoints] = useState(false);

  // Fetch local models on component mount and when settings change
  useEffect(() => {
    const detectServers = async () => {
      // Detect Ollama
      const oModels = await fetchOllamaModels(settings.ollamaUrl);
      setOllamaModels(oModels);
      setLocalModelStatus(prev => ({...prev, ollama: oModels.length > 0 ? `Online (${oModels.length} models)`: 'Server not found'}));
      if (oModels.length > 0 && modelProvider === 'ollama') setSelectedLocalModel(oModels[0]);
      
      // Detect LM Studio
      const lmModels = await fetchLmStudioModels(settings.lmstudioUrl);
      setLmStudioModels(lmModels);
      setLocalModelStatus(prev => ({...prev, lmstudio: lmModels.length > 0 ? `Online (${lmModels.length} models)`: 'Server not found'}));
      if (lmModels.length > 0 && modelProvider === 'lmstudio') setSelectedLocalModel(lmModels[0]);
    };
    detectServers();
  }, [settings, modelProvider]);


  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (input.trim() === '' || isLoading) return;

    const userMessage: ChatMessage = { id: Date.now().toString(), sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const thinkingMessageId = (Date.now() + 1).toString();
    const thinkingMessage: ChatMessage = {
      id: thinkingMessageId,
      sender: 'ai',
      agentName: activeAgents.map(a => a.name).join(', '),
      text: 'Thinking...',
      isThinking: true,
    };
    setMessages(prev => [...prev, thinkingMessage]);

    try {
      const activeSettings = {
        ...settings,
        ollamaModel: modelProvider === 'ollama' ? selectedLocalModel : settings.ollamaModel,
        lmstudioModel: modelProvider === 'lmstudio' ? selectedLocalModel : settings.lmstudioModel,
      }
      
      const result = await window.ipc.invoke('chat:generate', input, messages, activeAgents, modelProvider, activeSettings);

      if (result.success) {
        const finalMessage: ChatMessage = {
          id: thinkingMessageId,
          sender: 'ai',
          agentName: activeAgents.map(a => a.name).join(', '),
          text: result.response,
        };
        setMessages(prev => prev.map(m => m.id === thinkingMessageId ? finalMessage : m));
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error(error);
      const errorMessage: ChatMessage = {
        id: thinkingMessageId,
        sender: 'system',
        text: `Error: Could not get response from ${modelProvider}. Check console and settings.`,
        isError: true
      };
      setMessages(prev => prev.map(m => m.id === thinkingMessageId ? errorMessage : m));
    } finally {
      setIsLoading(false);
    }
  };

  const getMessageStyle = (msg: ChatMessage) => {
    switch (msg.sender) {
      case 'user':
        return 'bg-[#e0e0e0] dark:bg-gray-600 self-end';
      case 'ai':
        return 'bg-[#d6e4f0] dark:bg-blue-900 self-start';
      case 'system':
        return 'bg-[#fff8c4] dark:bg-gray-700 self-center text-center italic text-sm';
      default:
        return 'bg-gray-200 dark:bg-gray-800 self-start';
    }
  };
  
  const LocalModelSelector = () => {
      const models = modelProvider === 'ollama' ? ollamaModels : lmStudioModels;
      const status = localModelStatus[modelProvider] || 'Unknown';

      if (models.length === 0) {
          return <div className="text-sm p-1 text-gray-500 dark:text-gray-400">{status}</div>;
      }
      
      return (
          <select 
              value={selectedLocalModel} 
              onChange={(e) => setSelectedLocalModel(e.target.value)} 
              className="bg-white dark:bg-gray-800 border-2 border-gray-500 dark:border-gray-400 p-1 text-sm w-full"
          >
              {models.map(model => <option key={model} value={model}>{model}</option>)}
          </select>
      )
  };


  return (
    <div className="flex flex-col h-full bg-inherit text-lg text-black dark:text-gray-200">
      <div className="flex-grow p-4 overflow-y-auto flex flex-col space-y-4">
        {messages.map(msg => (
          <div key={msg.id} className={`p-3 max-w-[80%] rounded-md border-2 border-black dark:border-gray-500 ${getMessageStyle(msg)}`}>
            {msg.sender === 'ai' && <p className="font-bold text-sm text-blue-800 dark:text-blue-300">{msg.agentName}</p>}
            <p className="whitespace-pre-wrap">{msg.text}</p>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      {showCheckpoints && (
        <div className="p-2 border-y-2 border-gray-500 dark:border-gray-600 bg-gray-100 dark:bg-gray-800">
          <h4 className="font-bold mb-2">Checkpoints</h4>
          <ul className="max-h-32 overflow-y-auto text-sm space-y-1">
            {checkpoints.length === 0 && <li>No checkpoints created.</li>}
            {checkpoints.map(c => (
              <li key={c.id} className="flex justify-between items-center">
                <span>{c.id} - {c.timestamp.toLocaleTimeString()}</span>
                <Button onClick={() => onRevertToCheckpoint(c.id)} className="px-2 py-0 text-sm">Revert</Button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="p-2 border-t-2 border-gray-500 dark:border-gray-600 flex items-start space-x-2">
        <div className="flex-grow flex flex-col space-y-2">
           <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            className="w-full p-2 text-lg bg-white dark:bg-gray-800 border-2 border-gray-500 dark:border-gray-400 focus:outline-none focus:border-black dark:focus:border-white resize-none"
            placeholder="Type your message..."
            rows={2}
            disabled={isLoading}
          />
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1">
              <select value={modelProvider} onChange={(e) => setModelProvider(e.target.value as ModelProvider)} className="bg-white dark:bg-gray-800 border-2 border-gray-500 dark:border-gray-400 p-1 text-sm w-full">
                  <option value="gemini">Gemini 2.5 Flash</option>
                  <option value="ollama">Ollama (Local)</option>
                  <option value="lmstudio">LM Studio (Local)</option>
              </select>
              {(modelProvider === 'ollama' || modelProvider === 'lmstudio') && <div className="mt-1"><LocalModelSelector /></div>}
            </div>
            <div className="flex flex-col space-y-1">
                <Button onClick={() => setShowCheckpoints(!showCheckpoints)} className="px-2 text-sm">Checkpoints</Button>
                <Button onClick={onCreateCheckpoint} className="px-2 text-sm">Save Checkpoint</Button>
            </div>
          </div>
        </div>
        <Button onClick={handleSend} disabled={isLoading} className="h-[calc(100%-8px)]">
            <Icon name="send" />
        </Button>
      </div>
    </div>
  );
};

export default ChatWindow;