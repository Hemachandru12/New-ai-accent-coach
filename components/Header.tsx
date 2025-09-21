import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="w-full text-center py-6 mb-4">
      <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-emerald-400">
        Pronunciation Coach AI
      </h1>
      <p className="text-slate-400 mt-2 text-lg">
        Get instant feedback on your English pronunciation.
      </p>
    </header>
  );
};
