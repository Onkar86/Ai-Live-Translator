import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { Language, Message, ActiveSide } from './types';
import { SUPPORTED_LANGUAGES } from './constants';
import { translateText } from './services/geminiService';
import LanguageSelector from './components/LanguageSelector';
import ConversationBubble from './components/ConversationBubble';
import MicButton from './components/MicButton';
import TranslationInput from './components/TranslationInput';

// Fix: Add type definitions for Web Speech API to resolve TypeScript errors.
// These interfaces are not part of the standard TypeScript DOM library.
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: (event: SpeechRecognitionEvent) => void;
  onend: () => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  start: () => void;
  stop: () => void;
}

interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly [index: number]: SpeechRecognitionAlternative;
  readonly length: number;
}

interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

interface SpeechRecognitionResultList {
  readonly [index: number]: SpeechRecognitionResult;
  readonly length: number;
}

interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
  readonly message: string;
}

declare global {
  interface Window {
    SpeechRecognition: { new (): SpeechRecognition };
    webkitSpeechRecognition: { new (): SpeechRecognition };
  }
}

const App: React.FC = () => {
  const [sourceLang, setSourceLang] = useState<string>('en-US');
  const [targetLang, setTargetLang] = useState<string>('es-ES');
  const [conversation, setConversation] = useState<Message[]>([]);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [activeSide, setActiveSide] = useState<ActiveSide>('source');
  const [error, setError] = useState<string | null>(null);
  const [sourceInputText, setSourceInputText] = useState<string>('');
  const [targetInputText, setTargetInputText] = useState<string>('');

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const conversationEndRef = useRef<HTMLDivElement>(null);

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  useEffect(() => {
    if (!SpeechRecognition) {
      setError('Speech recognition is not supported in this browser.');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognitionRef.current = recognition;
  }, [SpeechRecognition]);

  useEffect(() => {
    conversationEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation]);

  const speak = useCallback((text: string, lang: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = 1;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    } else {
      setError('Text-to-speech is not supported in this browser.');
    }
  }, []);

  const handleTranslate = useCallback(async (text: string, fromLang: string, toLang: string, side: ActiveSide) => {
    const fromLangName = SUPPORTED_LANGUAGES.find(l => l.code === fromLang)?.name || fromLang;
    const toLangName = SUPPORTED_LANGUAGES.find(l => l.code === toLang)?.name || toLang;
    const messageId = Date.now();
    
    const newMessage: Message = {
      id: messageId,
      originalText: text,
      isTranslating: true,
      side: side,
    };
    
    setConversation(prev => [...prev, newMessage]);

    try {
      const translated = await translateText(text, fromLangName, toLangName);
      setConversation(prev => 
        prev.map(msg => 
          msg.id === messageId ? { ...msg, translatedText: translated, isTranslating: false } : msg
        )
      );
      speak(translated, toLang);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setConversation(prev => 
        prev.map(msg => 
          msg.id === messageId ? { ...msg, error: errorMessage, isTranslating: false } : msg
        )
      );
      setError(errorMessage);
    }
  }, [speak]);
  
  const handleTextTranslate = (side: ActiveSide) => {
    const textToTranslate = side === 'source' ? sourceInputText : targetInputText;
    if (!textToTranslate.trim() || isListening) return;

    const fromLang = side === 'source' ? sourceLang : targetLang;
    const toLang = side === 'source' ? targetLang : sourceLang;

    handleTranslate(textToTranslate, fromLang, toLang, side);

    if (side === 'source') {
        setSourceInputText('');
    } else {
        setTargetInputText('');
    }
  };

  const startListening = (side: ActiveSide) => {
    if (!recognitionRef.current || isListening) return;

    setActiveSide(side);
    const lang = side === 'source' ? sourceLang : targetLang;
    recognitionRef.current.lang = lang;

    recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      if (finalTranscript) {
        const fromLang = side === 'source' ? sourceLang : targetLang;
        const toLang = side === 'source' ? targetLang : sourceLang;
        handleTranslate(finalTranscript, fromLang, toLang, side);
      }
    };
    
    recognitionRef.current.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
      setError(`Speech recognition error: ${event.error}`);
      setIsListening(false);
    };

    recognitionRef.current.start();
    setIsListening(true);
  };
  
  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const handleMicClick = (side: ActiveSide) => {
    if (isListening) {
      stopListening();
    } else {
      startListening(side);
    }
  };

  const handleSwapLanguages = () => {
    const temp = sourceLang;
    setSourceLang(targetLang);
    setTargetLang(temp);
  };

  const getLangName = (code: string) => SUPPORTED_LANGUAGES.find(l => l.code === code)?.name || 'Unknown';

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white font-sans">
      <header className="p-4 border-b border-gray-700 text-center">
        <h1 className="text-3xl font-bold tracking-wider">Ai Live Translator</h1>
        <p className="text-gray-400 mt-1">Real-time conversation translation powered by AI</p>
      </header>

      {error && (
        <div className="bg-red-800 text-white p-3 text-center">
          <p>{error}</p>
          <button onClick={() => setError(null)} className="ml-4 font-bold">Dismiss</button>
        </div>
      )}

      <main className="flex-1 flex flex-col p-4 overflow-hidden">
        <div className="flex-1 overflow-y-auto pr-2">
            {conversation.length === 0 ? (
                 <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <p className="text-lg">Your translated conversation will appear here.</p>
                    <p>Tap a microphone or type below to begin.</p>
                </div>
            ) : (
                conversation.map(msg => (
                    <ConversationBubble 
                        key={msg.id} 
                        message={msg}
                        speak={speak}
                        targetLangCode={msg.side === 'source' ? targetLang : sourceLang}
                    />
                ))
            )}
            <div ref={conversationEndRef} />
        </div>
      </main>

      <footer className="bg-gray-800/50 backdrop-blur-sm p-4 border-t border-gray-700">
        <div className="grid grid-cols-2 md:grid-cols-3 items-start gap-4 max-w-4xl mx-auto">
          <div className="flex flex-col items-center justify-center gap-4">
            <LanguageSelector
                id="source-lang"
                label={getLangName(sourceLang)}
                selectedLanguage={sourceLang}
                onChange={(e) => setSourceLang(e.target.value)}
                languages={SUPPORTED_LANGUAGES}
            />
            <TranslationInput
                value={sourceInputText}
                onChange={(e) => setSourceInputText(e.target.value)}
                onTranslate={() => handleTextTranslate('source')}
                placeholder={`Type in ${getLangName(sourceLang)}...`}
                disabled={isListening}
            />
            <MicButton isListening={isListening && activeSide === 'source'} onClick={() => handleMicClick('source')} />
          </div>

          <div className="hidden md:flex justify-center items-center h-full pt-8">
            <button
                onClick={handleSwapLanguages}
                className="p-3 rounded-full bg-gray-600 hover:bg-gray-500 transition-transform duration-300 transform hover:rotate-180"
                aria-label="Swap languages"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
            </button>
          </div>
          
          <div className="flex flex-col items-center justify-center gap-4">
            <LanguageSelector
                id="target-lang"
                label={getLangName(targetLang)}
                selectedLanguage={targetLang}
                onChange={(e) => setTargetLang(e.target.value)}
                languages={SUPPORTED_LANGUAGES}
            />
            <TranslationInput
                value={targetInputText}
                onChange={(e) => setTargetInputText(e.target.value)}
                onTranslate={() => handleTextTranslate('target')}
                placeholder={`Type in ${getLangName(targetLang)}...`}
                disabled={isListening}
            />
             <MicButton isListening={isListening && activeSide === 'target'} onClick={() => handleMicClick('target')} />
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
