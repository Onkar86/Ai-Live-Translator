
export interface Language {
  code: string;
  name: string;
}

export interface Message {
  id: number;
  originalText: string;
  translatedText?: string;
  isTranslating: boolean;
  error?: string;
  side: 'source' | 'target';
}

export type ActiveSide = 'source' | 'target';
