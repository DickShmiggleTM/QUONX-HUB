import React from 'react';
import { SettingsState } from '../types';
import Button from './Button';

interface SettingsProps {
  settings: SettingsState;
  setSettings: React.Dispatch<React.SetStateAction<SettingsState>>;
}

const Settings: React.FC<SettingsProps> = ({ settings, setSettings }) => {

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };
  
  const handleTestConnection = async (url: string, type: 'Ollama' | 'LM Studio') => {
      let endpoint = type === 'Ollama' ? `${url}/api/tags` : `${url}/models`;
      try {
          const response = await fetch(endpoint);
          if(response.ok) {
              alert(`${type} connection successful!`);
          } else {
              alert(`${type} server responded with status ${response.status}. Check the URL.`);
          }
      } catch (error) {
          alert(`Failed to connect to ${type}. Ensure the server is running and the URL is correct.`);
      }
  }

  return (
    <div className="p-4 h-full flex flex-col text-lg bg-inherit text-black dark:text-gray-200 space-y-6">
      <h3 className="text-xl border-b-2 border-gray-400 dark:border-gray-600">Model Settings</h3>

      {/* Gemini Settings */}
      <div className="space-y-2">
        <h4 className="font-bold text-lg">Google Gemini</h4>
        <div className="flex flex-col space-y-1">
          <label htmlFor="geminiModel" className="text-sm">Model Name</label>
          <input
            type="text"
            id="geminiModel"
            name="geminiModel"
            value={settings.geminiModel}
            onChange={handleInputChange}
            className="p-1 bg-white dark:bg-gray-800 border-2 border-gray-500 dark:border-gray-400 focus:outline-none"
          />
        </div>
      </div>

      {/* Ollama Settings */}
      <div className="space-y-2">
        <h4 className="font-bold text-lg">Ollama</h4>
        <div className="flex flex-col space-y-1">
          <label htmlFor="ollamaUrl" className="text-sm">Server URL</label>
          <input
            type="text"
            id="ollamaUrl"
            name="ollamaUrl"
            value={settings.ollamaUrl}
            onChange={handleInputChange}
            className="p-1 bg-white dark:bg-gray-800 border-2 border-gray-500 dark:border-gray-400 focus:outline-none"
          />
        </div>
        <Button className="px-2 text-sm" onClick={() => handleTestConnection(settings.ollamaUrl, 'Ollama')}>
            Test Connection
        </Button>
      </div>
      
      {/* LM Studio Settings */}
      <div className="space-y-2">
        <h4 className="font-bold text-lg">LM Studio</h4>
         <div className="flex flex-col space-y-1">
          <label htmlFor="lmstudioUrl" className="text-sm">Server URL (v1)</label>
          <input
            type="text"
            id="lmstudioUrl"
            name="lmstudioUrl"
            value={settings.lmstudioUrl}
            onChange={handleInputChange}
            className="p-1 bg-white dark:bg-gray-800 border-2 border-gray-500 dark:border-gray-400 focus:outline-none"
          />
        </div>
        <Button className="px-2 text-sm" onClick={() => handleTestConnection(settings.lmstudioUrl, 'LM Studio')}>
            Test Connection
        </Button>
      </div>
      
       <div className="text-xs pt-4 border-t border-gray-400 dark:border-gray-600 text-gray-600 dark:text-gray-400">
            <p>Changes are saved automatically as you type. Make sure your local servers are running and accessible from this application.</p>
       </div>
    </div>
  );
};

export default Settings;
