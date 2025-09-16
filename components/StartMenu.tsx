import React, { useEffect, useRef } from 'react';
import { AppWindow } from '../types';

interface StartMenuProps {
    onOpen: (app: AppWindow) => void;
    onClose: () => void;
}

const MENU_ITEMS = [
    { label: "File Explorer", app: AppWindow.FILE_EXPLORER },
    { label: "AI Chat", app: AppWindow.CHAT },
    { label: "Agent Manager", app: AppWindow.AGENT_MANAGER },
    { label: "Swarm Manager", app: AppWindow.SWARM_MANAGER },
    { label: "Code Editor", app: AppWindow.CODE_EDITOR },
    { label: "Doc/PDF RAG", app: AppWindow.DOC_RAG },
    { label: "Knowledge Graph", app: AppWindow.KNOWLEDGE_GRAPH },
    { label: "Codebase Indexing", app: AppWindow.CODEBASE_INDEXING },
    { label: "Settings", app: AppWindow.SETTINGS },
];

const StartMenu: React.FC<StartMenuProps> = ({ onOpen, onClose }) => {
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClose]);
    
    const handleItemClick = (app: AppWindow) => {
        onOpen(app);
        onClose();
    };

    return (
        <div 
            ref={menuRef}
            className="absolute bottom-full mb-1 left-0 w-64 bg-[#c0c0c0] dark:bg-[#2d3748] border-t-2 border-l-2 border-white dark:border-gray-500 border-b-2 border-r-2 border-black p-1 shadow-lg flex flex-col z-50"
        >
            <div className="flex items-center p-2 bg-gradient-to-t from-[#000080] to-[#1084d0] dark:from-[#00005a] dark:to-[#0c5ca5]">
                <span className="text-white text-2xl font-black italic">AI IDE</span>
            </div>
            <ul className="text-xl">
                {MENU_ITEMS.map(item => (
                    <li key={item.label}>
                        <button 
                            onClick={() => handleItemClick(item.app)}
                            className="w-full text-left p-2 hover:bg-[#000080] hover:text-white dark:hover:bg-blue-800 focus:outline-none"
                        >
                            {item.label}
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default StartMenu;
