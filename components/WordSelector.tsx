import React from 'react';

interface WordSelectorProps {
  words: string[];
  selectedWord: string;
  onSelect: (word: string) => void;
}

export const WordSelector: React.FC<WordSelectorProps> = ({ words, selectedWord, onSelect }) => {
  return (
    <div className="w-full sm:flex-1 bg-slate-800/50 p-4 rounded-xl shadow-lg border border-slate-700">
      <h2 className="text-lg font-semibold text-sky-300 mb-3 text-center">Practice Words</h2>
      <div className="flex flex-wrap justify-center gap-2">
        {words.map((word) => (
          <button
            key={word}
            onClick={() => onSelect(word)}
            className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 ease-in-out
              ${selectedWord === word 
                ? 'bg-sky-500 text-white shadow-md scale-105' 
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white'
              }`}
          >
            {word}
          </button>
        ))}
      </div>
    </div>
  );
};