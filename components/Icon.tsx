import React from 'react';

interface IconProps {
  name: 'file' | 'folder' | 'folder-open' | 'close' | 'send' | 'minimize';
  className?: string;
}

const ICONS: Record<IconProps['name'], React.ReactNode> = {
  file: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-black dark:text-white">
      <path d="M4 1H10L13 4V15H4V1Z" fill="#FFF" stroke="currentColor" strokeWidth="1"/>
      <path d="M9 1H10L13 4H12V5H9V1Z" fill="currentColor" />
    </svg>
  ),
  folder: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-black dark:text-white">
      <path d="M1 3H7L8 5H15V13H1V3Z" fill="#FFD700" stroke="currentColor" strokeWidth="1"/>
    </svg>
  ),
  'folder-open': (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-black dark:text-white">
        <path d="M1 5H15V13H1V5Z" fill="#FFD700" stroke="currentColor" strokeWidth="1"/>
        <path d="M2 5L3 3H8L7 5H2Z" fill="#FFD700" stroke="currentColor" strokeWidth="1"/>
    </svg>
  ),
  close: (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M1 1L11 11M1 11L11 1" stroke="currentColor" strokeWidth="2"/>
    </svg>
  ),
  minimize: (
     <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M2 7H10" stroke="currentColor" strokeWidth="2"/>
    </svg>
  ),
  send: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-black dark:text-white">
        <path d="M2 21L23 12L2 3V10L17 12L2 14V21Z" fill="currentColor"/>
    </svg>
  ),
};

const Icon: React.FC<IconProps> = ({ name, className }) => {
  return <span className={className}>{ICONS[name]}</span>;
};

export default Icon;