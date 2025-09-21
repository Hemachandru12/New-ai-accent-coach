import React, { useState, useEffect } from 'react';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { getPronunciationFeedback } from '../services/geminiService';
import { PronunciationFeedback } from '../types';
import { MicIcon } from './icons/MicIcon';
import { StopIcon } from './icons/StopIcon';
import { LoaderIcon } from './icons/LoaderIcon';
import { FeedbackDisplay } from './FeedbackDisplay';
import { SpeakerIcon } from './icons/SpeakerIcon';

interface PronunciationCardProps {
  word: string;
  accent: string;
}

type CardState = 'idle' | 'recording' | 'loading' | 'feedback' | 'error';

export const PronunciationCard: React.FC<PronunciationCardProps> = ({ word, accent }) => {
  const { recorderState, audioBlob, error: recorderError, startRecording, stopRecording, reset } = useAudioRecorder();
  const [cardState, setCardState] = useState<CardState>('idle');
  const [feedback, setFeedback] = useState<PronunciationFeedback | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    const loadVoices = () => {
      // Filter for English voices, which is what this app is about
      setVoices(speechSynthesis.getVoices().filter(v => v.lang.startsWith('en')));
    };
    loadVoices();
    speechSynthesis.onvoiceschanged = loadVoices;
    
    // Cleanup function
    return () => {
      speechSynthesis.onvoiceschanged = null;
      // Stop any speech that is happening when the component unmounts
      speechSynthesis.cancel();
    };
  }, []);

  useEffect(() => {
    if (recorderState === 'recording') {
      setCardState('recording');
    } else if (recorderState === 'stopped' && audioBlob) {
      setCardState('loading');
      const processAudio = async () => {
        try {
          const result = await getPronunciationFeedback(word, audioBlob, accent);
          setFeedback(result);
          setCardState('feedback');
        } catch (err) {
          if (err instanceof Error) {
              setApiError(err.message);
          } else {
              setApiError("An unknown error occurred.");
          }
          setCardState('error');
        }
      };
      processAudio();
    }
  }, [recorderState, audioBlob, word, accent]);
  
  const handleRecordButtonClick = () => {
    if (cardState === 'recording') {
      stopRecording();
    } else {
      reset(); // Reset audio blob before starting a new recording
      setFeedback(null);
      setApiError(null);
      startRecording();
    }
  };

  const handleTryAgain = () => {
    setCardState('idle');
    setFeedback(null);
    setApiError(null);
    reset();
  };
  
  const handleListen = () => {
    if (isSpeaking || voices.length === 0) return;
    
    speechSynthesis.cancel(); // Cancel any previous speech

    const utterance = new SpeechSynthesisUtterance(word);
    
    // Find the best voice with a fallback strategy
    let selectedVoice = voices.find(v => v.lang === accent);
    if (!selectedVoice) {
      selectedVoice = voices.find(v => v.lang.startsWith(accent.substring(0,2)) && v.default);
    }
    if (!selectedVoice) {
      selectedVoice = voices.find(v => v.lang === 'en-US');
    }
     if (!selectedVoice) {
      selectedVoice = voices.find(v => v.lang.startsWith('en'));
    }

    utterance.voice = selectedVoice || null;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    speechSynthesis.speak(utterance);
  }
  
  const renderContent = () => {
    const finalError = apiError || recorderError;
    if (finalError) {
      return (
        <div className="text-center">
            <p className="text-rose-400 mb-4">{finalError}</p>
            <button onClick={handleTryAgain} className="bg-sky-600 hover:bg-sky-500 text-white font-bold py-2 px-4 rounded-full transition-colors">
                Try Again
            </button>
        </div>
      );
    }

    switch (cardState) {
      case 'loading':
        return (
          <div className="flex flex-col items-center justify-center gap-4 text-slate-400">
            <LoaderIcon className="w-12 h-12" />
            <p className="text-lg animate-pulse">Analyzing your pronunciation...</p>
            <p className="text-sm">This may take a moment.</p>
          </div>
        );
      case 'feedback':
        return feedback && <FeedbackDisplay feedback={feedback} onTryAgain={handleTryAgain} />;
      case 'recording':
      case 'idle':
      default:
        return (
          <div className="text-center">
            <div className="flex items-center justify-center gap-4 mb-2">
              <h2 className="text-5xl font-bold tracking-wider text-white">{word}</h2>
              <button 
                onClick={handleListen}
                disabled={isSpeaking || voices.length === 0}
                aria-label={`Listen to ${word}`}
                className="p-2 rounded-full text-slate-400 hover:bg-slate-700 hover:text-sky-300 disabled:text-slate-600 disabled:cursor-not-allowed transition-colors"
                >
                    <SpeakerIcon className={`w-8 h-8 ${isSpeaking ? 'text-sky-400 animate-pulse' : ''}`} />
              </button>
            </div>
            <p className="text-slate-400 mb-8">
              {cardState === 'recording' ? 'Recording... Click stop when you are done.' : 'Click the button and pronounce the word.'}
            </p>
          </div>
        );
    }
  };

  return (
    <div className="w-full flex flex-col items-center gap-8">
        <div className="w-full min-h-[300px] bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 p-8 flex items-center justify-center transition-all duration-300">
            {renderContent()}
        </div>
        {!feedback && (
          <button
            onClick={handleRecordButtonClick}
            disabled={cardState === 'loading'}
            className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ease-in-out shadow-lg
            ${cardState === 'recording' ? 'bg-rose-600 hover:bg-rose-500 animate-pulse' : 'bg-sky-600 hover:bg-sky-500'}
            ${cardState === 'loading' ? 'bg-slate-600 cursor-not-allowed' : ''}
            transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-sky-500/50`}
          >
            {cardState === 'recording' ? <StopIcon className="w-10 h-10" /> : <MicIcon className="w-10 h-10" />}
          </button>
        )}
    </div>
  );
};