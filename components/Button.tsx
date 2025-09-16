import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ children, className, ...props }) => {
  return (
    <button
      className={`px-4 py-1 bg-[#c0c0c0] dark:bg-[#4a5568] border-t-2 border-l-2 border-white dark:border-gray-500 border-b-2 border-r-2 border-black text-black dark:text-white text-lg focus:outline-none active:border-b-white active:dark:border-b-gray-500 active:border-r-white active:dark:border-r-gray-500 active:border-t-black active:dark:border-t-black active:border-l-black disabled:text-gray-500 dark:disabled:text-gray-400 disabled:border-gray-500 disabled:active:border-gray-500 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;