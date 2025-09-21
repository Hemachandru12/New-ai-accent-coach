import React from 'react';

interface Accent {
  code: string;
  name: string;
}

const ACCENTS: Accent[] = [
  { code: 'en-US', name: 'American (US)' },
  { code: 'en-GB', name: 'British (UK)' },
  { code: 'en-AU', name: 'Australian (AU)' },
];

interface AccentSelectorProps {
  selectedAccent: string;
  onSelect: (accentCode: string) => void;
}

export const AccentSelector: React.FC<AccentSelectorProps> = ({ selectedAccent, onSelect }) => {
  return (
    <div className="w-full sm:flex-1 bg-slate-800/50 p-4 rounded-xl shadow-lg border border-slate-700">
      <h2 className="text-lg font-semibold text-sky-300 mb-3 text-center">Accent</h2>
      <div className="flex flex-wrap justify-center gap-2">
        {ACCENTS.map((accent) => (
          <button
            key={accent.code}
            onClick={() => onSelect(accent.code)}
            className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 ease-in-out
              ${selectedAccent === accent.code
                ? 'bg-sky-500 text-white shadow-md scale-105'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white'
              }`}
          >
            {accent.name}
          </button>
        ))}
      </div>
    </div>
  );
};