import { SimulationNodeDatum, SimulationLinkDatum } from 'd3';

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export type Sender = 'user' | 'ai' | 'system';

export interface ChatMessage {
  id: string;
  sender: Sender;
  text: string;
  agentName?: string;
  isThinking?: boolean;
  isError?: boolean;
}

export interface Agent {
  id: string;
  name: string;
  role: string;
  systemPrompt: string;
}

export type ModelProvider = 'gemini' | 'ollama' | 'lmstudio';

export interface Checkpoint {
  id: string;
  timestamp: Date;
  messages: ChatMessage[];
  activeAgents: Agent[];
}

export interface SettingsState {
  geminiModel: string;
  ollamaUrl: string;
  ollamaModel: string; // This will now serve as the default/selected model
  lmstudioUrl: string;
  lmstudioModel: string; // This will now serve as the default/selected model
}

// Type for Ollama's /api/tags response
export interface OllamaTagResponse {
    models: {
        name: string;
        modified_at: string;
        size: number;
    }[];
}

// Type for OpenAI-compatible /v1/models response (LM Studio)
export interface LMStudioModelResponse {
    data: {
        id: string;
        object: string;
        created: number;
        owned_by: string;
    }[];
}


export type FileNodeType = 'file' | 'directory';

export interface FileNode {
  id: string;
  name: string;
  type: FileNodeType;
  content?: string;
  children?: FileNode[];
  path: string;
}

// For D3 graph. 
export interface GraphNode extends SimulationNodeDatum {
  id:string;
  name: string;
  type: FileNodeType;
}

export interface GraphLink extends SimulationLinkDatum<GraphNode> {
  source: string | GraphNode;
  target: string | GraphNode;
}

export enum AppWindow {
  FILE_EXPLORER = 'File Explorer',
  CHAT = 'AI Chat',
  AGENT_MANAGER = 'Agent Manager',
  SWARM_MANAGER = 'Swarm Manager',
  CODE_EDITOR = 'Code Editor',
  DOC_RAG = 'Doc/PDF RAG',
  KNOWLEDGE_GRAPH = 'Knowledge Graph',
  CODEBASE_INDEXING = 'Codebase Indexing',
  SETTINGS = 'Settings',
}

export interface WindowInstance {
  id: string;
  app: AppWindow;
  title: string;
  isOpen: boolean;
  isMinimized: boolean;
  position: Position;
  size: Size;
  zIndex: number;
}
