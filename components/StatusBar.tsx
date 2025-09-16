import React, { useState } from 'react';
import { WindowInstance, AppWindow } from '../types';
import StartMenu from './StartMenu';

interface StatusBarProps {
    allWindows: WindowInstance[];
    onToggle: (id: string) => void;
    onFocus: (id: string) => void;
    onToggleTheme: () => void;
    onOpenApp: (app: AppWindow) => void;
}

const StatusBar: React.FC<StatusBarProps> = ({ allWindows, onToggle, onFocus, onToggleTheme, onOpenApp }) => {
  const [time, setTime] = useState(new Date());
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  React.useEffect(() => {
    const timerId = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timerId);
  }, []);
  
  // Find the maximum zIndex among all VISIBLE windows. This determines which window is active.
  const maxZIndex = Math.max(0, ...allWindows
      .filter(w => !w.isMinimized)
      .map(w => w.zIndex)
  );

  return (
    <div className="w-full bg-[#c0c0c0] dark:bg-[#2d3748] h-10 border-t-2 border-white dark:border-gray-500 flex items-center justify-between px-2 text-lg text-black dark:text-gray-200">
      <div className="flex items-center space-x-2 h-full">
         <div className="relative h-full flex items-center">
            <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`flex items-center h-[calc(100%-4px)] px-2 border-t-2 border-l-2 border-white dark:border-gray-500 border-b-2 border-r-2 border-black ${isMenuOpen ? 'border-b-white dark:border-b-gray-500 border-r-white dark:border-r-gray-500 border-t-black border-l-black' : ''}`}
            >
                <span className="font-bold text-xl mr-2">❖</span>
                <span className="font-bold">Menu</span>
            </button>
            {isMenuOpen && <StartMenu onOpen={onOpenApp} onClose={() => setIsMenuOpen(false)} />}
         </div>

        <div className="h-full border-l-2 border-black dark:border-gray-900 border-r-2 border-white dark:border-gray-500"></div>
        <div className="flex items-center space-x-1">
            {allWindows.map(win => {
                // A window's taskbar button should appear "pushed in" if the window is NOT minimized
                // AND it has the highest zIndex.
                const isActive = !win.isMinimized && win.zIndex === maxZIndex;
                
                return (
                    <button 
                        key={win.id} 
                        onClick={() => onToggle(win.id)}
                        className={`px-2 py-0.5 max-w-xs truncate border-t-2 border-l-2 border-white dark:border-gray-500 border-b-2 border-r-2 border-black dark:border-black ${isActive ? 'border-b-white dark:border-b-gray-500 border-r-white dark:border-r-gray-500 border-t-black border-l-black bg-gray-300 dark:bg-gray-600' : ''}`}
                    >
                        {win.title}
                    </button>
                );
            })}
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <button onClick={onToggleTheme} className="text-sm px-1 border-2 border-transparent">
          🎨
        </button>
        <div className="border-t-2 border-l-2 border-black dark:border-gray-900 border-b-2 border-r-2 border-white dark:border-gray-500 px-2 py-0.5">
            <span>{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>
    </div>
  );
};

export default StatusBar;