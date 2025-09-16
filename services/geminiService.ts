import { GoogleGenerativeAI, Content } from "@google/generative-ai";
import { ChatMessage, Agent, ModelProvider, SettingsState, OllamaTagResponse, LMStudioModelResponse } from '../types';

// This needs to be initialized in the main process where the environment variables are loaded.
let genAI;

const initializeGenAI = () => {
    if (!genAI && process.env.GEMINI_API_KEY) {
        genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    }
    return genAI;
}

/**
 * Fetches the list of available models from a running Ollama server.
 */
export const fetchOllamaModels = async (baseUrl: string): Promise<string[]> => {
    try {
        const response = await fetch(`${baseUrl}/api/tags`);
        if (!response.ok) throw new Error(`Ollama server returned status ${response.status}`);
        const data: OllamaTagResponse = await response.json();
        return data.models.map(model => model.name);
    } catch (error) {
        console.warn(`Could not fetch Ollama models from ${baseUrl}:`, (error as Error).message);
        return [];
    }
};

/**
 * Fetches the list of available models from a running LM Studio server.
 */
export const fetchLmStudioModels = async (baseUrl: string): Promise<string[]> => {
    try {
        // LM Studio uses an OpenAI-compatible endpoint
        const response = await fetch(`${baseUrl}/models`);
        if (!response.ok) throw new Error(`LM Studio server returned status ${response.status}`);
        const data: LMStudioModelResponse = await response.json();
        return data.data.map(model => model.id);
    } catch (error) {
        console.warn(`Could not fetch LM Studio models from ${baseUrl}:`, (error as Error).message);
        return [];
    }
};

/**
 * Generates a chat response from the selected AI provider.
 * This function should only be called from the main process.
 */
export const generateChatResponse = async (
  prompt: string,
  history: ChatMessage[],
  agents: Agent[],
  provider: ModelProvider,
  settings: SettingsState
): Promise<string> => {
  const systemPrompt = agents.map(a => a.systemPrompt).join('\n\n');

  // Common message format for OpenAI-compatible APIs (Ollama, LM Studio)
  const openAIMessages = [
      { role: 'system', content: systemPrompt },
      ...history.filter(m => m.sender === 'user' || m.sender === 'ai').map(m => ({
          role: m.sender === 'user' ? 'user' : 'assistant',
          content: m.text
      })),
      { role: 'user', content: prompt }
  ];

  switch (provider) {
    case 'ollama':
      const ollamaResponse = await fetch(`${settings.ollamaUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: settings.ollamaModel,
          messages: openAIMessages,
          stream: false
        }),
      });
      if (!ollamaResponse.ok) throw new Error(`Ollama request failed with status ${ollamaResponse.status}`);
      const ollamaData = await ollamaResponse.json();
      return ollamaData.message.content;

    case 'lmstudio':
      const lmStudioResponse = await fetch(`${settings.lmstudioUrl}/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: settings.lmstudioModel,
          messages: openAIMessages,
          stream: false,
        }),
      });
      if (!lmStudioResponse.ok) throw new Error(`LM Studio request failed with status ${lmStudioResponse.status}`);
      const lmStudioData = await lmStudioResponse.json();
      return lmStudioData.choices[0].message.content;

    case 'gemini':
    default:
      const ai = initializeGenAI();
      if (!ai) {
          throw new Error("GEMINI_API_KEY not configured. Please set it in your .env.local file.");
      }

      const model = ai.getGenerativeModel({
          model: settings.geminiModel,
          systemInstruction: systemPrompt,
      });

      const geminiHistory: Content[] = history
        .filter(m => m.sender === 'user' || m.sender === 'ai')
        .map(m => ({
            role: m.sender === 'user' ? 'user' : 'model',
            parts: [{ text: m.text }]
        }));

      const result = await model.generateContent({
          contents: [...geminiHistory, { role: 'user', parts: [{ text: prompt }] }]
      });

      return result.response.text();
  }
};
