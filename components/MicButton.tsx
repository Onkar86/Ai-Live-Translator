
import React from 'react';

interface MicButtonProps {
  isListening: boolean;
  onClick: () => void;
}

const MicIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8h-1a6 6 0 11-12 0H3a7.001 7.001 0 006 6.93V17H7a1 1 0 100 2h6a1 1 0 100-2h-2v-2.07z" clipRule="evenodd" />
  </svg>
);

const MicButton: React.FC<MicButtonProps> = ({ isListening, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`relative rounded-full p-6 transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-opacity-50 ${
        isListening
          ? 'bg-red-600 hover:bg-red-700 focus:ring-red-400'
          : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-400'
      }`}
      aria-label={isListening ? 'Stop listening' : 'Start listening'}
    >
      {isListening && <span className="absolute inset-0 bg-red-500 rounded-full animate-ping"></span>}
      <MicIcon />
    </button>
  );
};

export default MicButton;
