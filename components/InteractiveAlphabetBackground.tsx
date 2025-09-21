import React, { useState, useEffect, useRef, useMemo } from 'react';

interface Letter {
  id: number;
  char: string;
  style: React.CSSProperties;
}

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LETTER_COUNT = 50;
const INTERACTION_RADIUS = 120;

export const InteractiveAlphabetBackground: React.FC = () => {
  const lettersRef = useRef<Array<HTMLSpanElement | null>>([]);

  const letters = useMemo<Letter[]>(() => {
    const generatedLetters: Letter[] = [];
    for (let i = 0; i < LETTER_COUNT; i++) {
      const char = ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
      const size = Math.random() * 20 + 10; // 10px to 30px
      const animationDuration = Math.random() * 20 + 15; // 15s to 35s
      const animationDelay = Math.random() * 10; // 0s to 10s
      const animationName = `float${Math.ceil(Math.random() * 3)}`;
      
      generatedLetters.push({
        id: i,
        char: char,
        style: {
          top: `${Math.random() * 100}%`,
          left: `${Math.random() * 100}%`,
          fontSize: `${size}px`,
          opacity: Math.random() * 0.15 + 0.05, // 0.05 to 0.2
          color: '#334155', // slate-700
          animationName,
          animationDuration: `${animationDuration}s`,
          animationDelay: `-${animationDelay}s`,
        },
      });
    }
    return generatedLetters;
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const mouseX = e.clientX;
      const mouseY = e.clientY;

      lettersRef.current.forEach((span) => {
        if (!span) return;
        const { left, top, width, height } = span.getBoundingClientRect();
        const spanX = left + width / 2;
        const spanY = top + height / 2;
        
        const distance = Math.sqrt(Math.pow(spanX - mouseX, 2) + Math.pow(spanY - mouseY, 2));

        if (distance < INTERACTION_RADIUS) {
          span.classList.add('glow');
        } else {
          span.classList.remove('glow');
        }
      });
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      {letters.map((letter, i) => (
        <span
          key={letter.id}
          // Fix: The ref callback should not return a value. Using a block body to prevent an implicit return.
          ref={(el) => { lettersRef.current[i] = el; }}
          className="alphabet-letter"
          style={letter.style}
        >
          {letter.char}
        </span>
      ))}
    </div>
  );
};
