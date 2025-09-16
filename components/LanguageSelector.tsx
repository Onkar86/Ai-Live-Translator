
import React from 'react';
import type { Language } from '../types';

interface LanguageSelectorProps {
  id: string;
  selectedLanguage: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  languages: Language[];
  label: string;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ id, selectedLanguage, onChange, languages, label }) => {
  return (
    <div className="flex flex-col items-center">
      <label htmlFor={id} className="text-sm font-medium text-gray-400 mb-2">
        {label}
      </label>
      <select
        id={id}
        value={selectedLanguage}
        onChange={onChange}
        className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default LanguageSelector;
