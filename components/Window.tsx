import React, { useState, useRef } from 'react';
import { useDraggable } from '../hooks/useDraggable';
import { Position, Size } from '../types';
import Icon from './Icon';

interface WindowProps {
  id: string;
  children: React.ReactNode;
  title: string;
  initialPosition: Position;
  initialSize: Size;
  zIndex: number;
  onClose: () => void;
  onMinimize: () => void;
  onFocus: (id: string) => void;
}

const Window: React.FC<WindowProps> = ({ id, children, title, initialPosition, initialSize, zIndex, onClose, onMinimize, onFocus }) => {
  const { position, elementRef, onMouseDown: onDragStart } = useDraggable(initialPosition, onFocus, id);
  const [size, setSize] = useState(initialSize);

  const resizeRef = useRef(false);
  const resizeOffset = useRef({ x: 0, y: 0 });

  const onResizeMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
      onFocus(id);
      resizeRef.current = true;
      resizeOffset.current = {
        x: e.clientX,
        y: e.clientY
      };

      const handleMouseMove = (event: MouseEvent) => {
        if (!resizeRef.current) return;
        const dx = event.clientX - resizeOffset.current.x;
        const dy = event.clientY - resizeOffset.current.y;
        setSize(prevSize => ({
          width: Math.max(200, prevSize.width + dx),
          height: Math.max(150, prevSize.height + dy),
        }));
        resizeOffset.current = { x: event.clientX, y: event.clientY };
      };

      const handleMouseUp = () => {
        resizeRef.current = false;
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };

      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
  };
  
  const RetroButton = ({ onClick, children }: {onClick: (e: React.MouseEvent<HTMLButtonElement>) => void, children: React.ReactNode}) => (
      <button onClick={onClick} className="w-6 h-6 bg-[#c0c0c0] dark:bg-gray-500 border-t-2 border-l-2 border-white dark:border-gray-400 border-b-2 border-r-2 border-black flex items-center justify-center text-black dark:text-white font-bold active:border-b-white active:dark:border-b-gray-400 active:border-r-white active:dark:border-r-gray-400 active:border-t-black active:border-l-black">
          {children}
      </button>
  );

  return (
    <div
      ref={elementRef}
      className="absolute bg-[#c0c0c0] dark:bg-[#2d3748] border-t-2 border-l-2 border-white dark:border-gray-500 border-b-2 border-r-2 border-black p-1 shadow-lg flex flex-col"
      style={{
        top: `${position.y}px`,
        left: `${position.x}px`,
        width: `${size.width}px`,
        height: `${size.height}px`,
        zIndex,
      }}
      onMouseDown={() => onFocus(id)}
    >
      <div
        className="flex items-center justify-between bg-gradient-to-r from-[#000080] to-[#1084d0] dark:from-[#00005a] dark:to-[#0c5ca5] text-white p-1 cursor-move"
        onMouseDown={onDragStart}
      >
        <h2 className="text-lg tracking-wider">{title}</h2>
        <div className="flex items-center space-x-1">
            <RetroButton onClick={onMinimize}><Icon name="minimize" /></RetroButton>
            <RetroButton onClick={onClose}><Icon name="close" /></RetroButton>
        </div>
      </div>
      <div className="flex-grow p-1 bg-white dark:bg-[#1a202c] border-t-2 border-l-2 border-gray-500 dark:border-gray-700 overflow-auto">
        {children}
      </div>
      <div className="resize-handle" onMouseDown={onResizeMouseDown}></div>
    </div>
  );
};

export default Window;