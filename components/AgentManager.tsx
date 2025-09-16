import React from 'react';
import { Agent } from '../types';
import Button from './Button';

interface AgentManagerProps {
  agents: Agent[];
  setAgents: React.Dispatch<React.SetStateAction<Agent[]>>;
  activeAgents: Agent[];
  setActiveAgents: React.Dispatch<React.SetStateAction<Agent[]>>;
}

const AgentManager: React.FC<AgentManagerProps> = ({ agents, setAgents, activeAgents, setActiveAgents }) => {
  
  const toggleAgent = (agent: Agent) => {
    setActiveAgents(prev => 
      prev.some(a => a.id === agent.id) 
      ? prev.filter(a => a.id !== agent.id) 
      : [...prev, agent]
    );
  };
  
  const createNewAgent = () => {
    const newAgent: Agent = {
      id: `agent-${Date.now()}`,
      name: `New Agent ${agents.length + 1}`,
      role: 'General Purpose',
      systemPrompt: 'You are a helpful assistant.'
    };
    setAgents(prev => [...prev, newAgent]);
  };

  return (
    <div className="p-2 h-full flex flex-col text-lg bg-inherit text-black dark:text-gray-200">
      <h3 className="text-xl border-b-2 border-gray-400 dark:border-gray-600 mb-2">Agent Roster</h3>
      <div className="flex-grow overflow-y-auto space-y-2 pr-2">
        {agents.map(agent => (
          <div 
            key={agent.id} 
            className={`p-2 border-2 border-black dark:border-gray-500 cursor-pointer ${activeAgents.some(a => a.id === agent.id) ? 'bg-blue-300 dark:bg-blue-800' : 'bg-gray-100 dark:bg-gray-700'}`}
            onClick={() => toggleAgent(agent)}
          >
            <div className="font-bold flex items-center">
              <input type="checkbox" readOnly checked={activeAgents.some(a => a.id === agent.id)} className="mr-2 w-4 h-4"/>
              {agent.name}
            </div>
            <p className="text-sm italic pl-2 text-gray-700 dark:text-gray-400">{agent.role}</p>
          </div>
        ))}
      </div>
      <div className="mt-auto pt-2 border-t-2 border-gray-400 dark:border-gray-600">
        <Button onClick={createNewAgent}>Create New Agent</Button>
      </div>
    </div>
  );
};

export default AgentManager;