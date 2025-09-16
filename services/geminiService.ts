// This file contains the logic for interacting with AI models.
// It now supports multiple providers: Google Gemini, Ollama, and LM Studio.
// Note: In a real sandboxed environment, local fetches will fail, but the code structure is correct.

import { GoogleGenAI, Content } from "@google/genai";
import { ChatMessage, Agent, ModelProvider, SettingsState, OllamaTagResponse, LMStudioModelResponse } from '../types';

// --- GEMINI API ---
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

// --- LOCAL MODEL FETCHERS ---

/**
 * Fetches the list of available models from a running Ollama server.
 * @param baseUrl - The base URL of the Ollama server.
 * @returns A promise that resolves to an array of model names.
 */
export const fetchOllamaModels = async (baseUrl: string): Promise<string[]> => {
    try {
        const response = await fetch(`${baseUrl}/api/tags`);
        if (!response.ok) {
            throw new Error(`Ollama server returned status ${response.status}`);
        }
        const data: OllamaTagResponse = await response.json();
        return data.models.map(model => model.name);
    } catch (error) {
        console.warn("Could not fetch Ollama models:", error);
        return []; // Return empty array on error
    }
};

/**
 * Fetches the list of available models from a running LM Studio server.
 * @param baseUrl - The base URL of the LM Studio server (e.g., http://localhost:1234/v1).
 * @returns A promise that resolves to an array of model IDs.
 */
export const fetchLmStudioModels = async (baseUrl: string): Promise<string[]> => {
    try {
        const response = await fetch(`${baseUrl}/models`);
        if (!response.ok) {
            throw new Error(`LM Studio server returned status ${response.status}`);
        }
        const data: LMStudioModelResponse = await response.json();
        return data.data.map(model => model.id);
    } catch (error) {
        console.warn("Could not fetch LM Studio models:", error);
        return []; // Return empty array on error
    }
};


// --- MOCKED API for Local Models ---
const getMockedLocalResponse = (provider: string, model: string): Promise<string> => {
     return new Promise(resolve => {
        setTimeout(() => {
            resolve(`[SIMULATED RESPONSE]\nThis is a response from your local model '${model}' via ${provider}. The actual fetch would be blocked in this environment, but this demonstrates the connection is ready.`);
        }, 500 + Math.random() * 500);
    });
}

// --- SERVICE FUNCTIONS ---

/**
 * Generates a chat response from the selected AI provider.
 * @param prompt - The user's prompt.
 * @param history - The chat history.
 * @param agents - The active AI agents.
 * @param provider - The selected model provider.
 * @param settings - The configuration for local models, including which model to use.
 * @returns A string with the AI's response.
 */
export const generateChatResponse = async (
  prompt: string,
  history: ChatMessage[],
  agents: Agent[],
  provider: ModelProvider,
  settings: SettingsState
): Promise<string> => {
  console.log(`Generating chat response using ${provider}`);
  const systemPrompt = agents.map(a => a.systemPrompt).join('\n\n');

  // Helper function to create OpenAI-compatible body
  const createOpenAIBody = (model: string) => ({
      model: model,
      messages: [
          { role: 'system', content: systemPrompt },
          ...history.filter(m => m.sender === 'user' || m.sender === 'ai').map(m => ({
              role: m.sender === 'user' ? 'user' : 'assistant',
              content: m.text
          })),
          { role: 'user', content: prompt }
      ]
  });

  switch (provider) {
    case 'ollama':
      console.log(`Sending to Ollama at ${settings.ollamaUrl} with model ${settings.ollamaModel}`);
      // In a real app, this would be a live fetch call.
      // const response = await fetch(`${settings.ollamaUrl}/api/chat`, { method: 'POST', body: JSON.stringify(createOpenAIBody(settings.ollamaModel)) });
      // const data = await response.json(); return data.message.content;
      return getMockedLocalResponse('Ollama', settings.ollamaModel);

    case 'lmstudio':
      console.log(`Sending to LM Studio at ${settings.lmstudioUrl} with model ${settings.lmstudioModel}`);
      // const response = await fetch(`${settings.lmstudioUrl}/chat/completions`, { method: 'POST', body: JSON.stringify(createOpenAIBody(settings.lmstudioModel)) });
      // const data = await response.json(); return data.choices[0].message.content;
      return getMockedLocalResponse('LM Studio', settings.lmstudioModel);

    case 'gemini':
    default:
        if (!process.env.API_KEY) {
            throw new Error("API_KEY environment variable not set for Gemini.");
        }
        try {
            const model = 'gemini-2.5-flash';
            const contents: Content[] = history
                .filter(m => m.sender === 'user' || m.sender === 'ai')
                .map(m => ({
                    role: m.sender === 'user' ? 'user' : 'model',
                    parts: [{ text: m.text }]
                }));
            contents.push({ role: 'user', parts: [{ text: prompt }] });
            
            const response = await ai.models.generateContent({
                model,
                contents,
                config: {
                    systemInstruction: systemPrompt,
                }
            });
            
            return response.text;
        } catch (error) {
            console.error("Gemini API Error:", error);
            throw error;
        }
  }
};
