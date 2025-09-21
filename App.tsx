import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { PronunciationCard } from './components/PronunciationCard';
import { WordSelector } from './components/WordSelector';
import { AccentSelector } from './components/AccentSelector';
import { InteractiveAlphabetBackground } from './components/InteractiveAlphabetBackground';

const PRACTICE_WORDS = ["Exquisite", "Phenomenon", "Schedule", "Worcestershire", "Colonel"];

const App: React.FC = () => {
  const [currentWord, setCurrentWord] = useState<string>(PRACTICE_WORDS[0]);
  const [accent, setAccent] = useState<string>('en-US');

  const handleWordSelect = useCallback((word: string) => {
    setCurrentWord(word);
  }, []);

  const handleAccentSelect = useCallback((accentCode: string) => {
    setAccent(accentCode);
  }, []);

  return (
    <div className="min-h-screen font-sans flex flex-col items-center p-4 sm:p-6 relative overflow-hidden">
      <InteractiveAlphabetBackground />
      <div className="relative z-10 w-full flex flex-col items-center">
        <Header />
        <main className="w-full max-w-2xl mx-auto flex flex-col items-center gap-8 flex-grow">
          <div className="w-full flex flex-col sm:flex-row gap-4">
            <WordSelector words={PRACTICE_WORDS} selectedWord={currentWord} onSelect={handleWordSelect} />
            <AccentSelector selectedAccent={accent} onSelect={handleAccentSelect} />
          </div>
          <PronunciationCard word={currentWord} accent={accent} key={`${currentWord}-${accent}`} />
        </main>
        <footer className="w-full text-center p-4 mt-8">
          <p className="text-sm text-slate-500">&copy; 2024 Pronunciation Coach AI. Perfect your accent with AI.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;