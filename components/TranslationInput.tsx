import React from 'react';

interface TranslationInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onTranslate: () => void;
  placeholder: string;
  disabled: boolean;
}

const SendIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
    </svg>
);

const TranslationInput: React.FC<TranslationInputProps> = ({ value, onChange, onTranslate, placeholder, disabled }) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (value.trim()) {
        onTranslate();
      }
    }
  };

  const handleSendClick = () => {
      if (value.trim()) {
          onTranslate();
      }
  };

  return (
    <div className="w-full relative">
      <textarea
        value={value}
        onChange={onChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2.5 pr-10 text-white resize-none focus:ring-blue-500 focus:border-blue-500 transition-colors"
        rows={2}
        disabled={disabled}
        aria-label={placeholder}
      />
      <button
        onClick={handleSendClick}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white disabled:text-gray-600 disabled:cursor-not-allowed transition-colors"
        aria-label="Translate text"
        disabled={!value.trim() || disabled}
      >
        <SendIcon />
      </button>
    </div>
  );
};

export default TranslationInput;
