
import React from 'react';
import type { Message } from '../types';

interface ConversationBubbleProps {
  message: Message;
  speak: (text: string, lang: string) => void;
  targetLangCode: string;
}

const SpeakerIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M7 10v1a1 1 0 001 1h1a1 1 0 001-1v-1a1 1 0 00-1-1H8a1 1 0 00-1 1z" />
        <path fillRule="evenodd" d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3 1h10a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V6a1 1 0 011-1zm1 2a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1z" clipRule="evenodd" />
        <path d="M11 12H9a1 1 0 100 2h2a1 1 0 100-2z" />
    </svg>
);

const ConversationBubble: React.FC<ConversationBubbleProps> = ({ message, speak, targetLangCode }) => {
  const isSource = message.side === 'source';

  const handleSpeak = () => {
    if (message.translatedText) {
      const langToSpeak = isSource ? targetLangCode : message.originalText.split(' ')[0]; // This is a trick, needs better lang detection for target side
      speak(message.translatedText, targetLangCode);
    }
  };

  return (
    <div className={`flex w-full ${isSource ? 'justify-start' : 'justify-end'}`}>
      <div className={`max-w-xl w-full p-4 rounded-lg my-2 ${isSource ? 'bg-blue-900/50 text-left' : 'bg-gray-700 text-right'}`}>
        <p className="text-gray-300 text-md">{message.originalText}</p>
        <div className="border-t border-gray-600 my-2"></div>
        {message.isTranslating && <p className="text-sm text-yellow-400 italic">Translating...</p>}
        {message.error && <p className="text-sm text-red-400">{message.error}</p>}
        {message.translatedText && (
          <div className="flex items-center gap-2" style={{justifyContent: isSource ? 'flex-start' : 'flex-end'}}>
             <p className="text-lg font-semibold text-white">{message.translatedText}</p>
            <button
              onClick={handleSpeak}
              className="text-gray-400 hover:text-white transition-colors"
              aria-label="Speak translation"
            >
              <SpeakerIcon/>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationBubble;
