import React from 'react';
import { PronunciationFeedback, FeedbackItem } from '../types';
import { CheckIcon } from './icons/CheckIcon';
import { XIcon } from './icons/XIcon';

interface FeedbackDisplayProps {
  feedback: PronunciationFeedback;
  onTryAgain: () => void;
}

const ScoreCircle: React.FC<{ score: number }> = ({ score }) => {
    const circumference = 2 * Math.PI * 45;
    const offset = circumference - (score / 100) * circumference;
    const colorClass = score >= 80 ? 'stroke-emerald-400' : score >= 50 ? 'stroke-amber-400' : 'stroke-rose-500';

    return (
        <div className="relative w-32 h-32">
            <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle className="text-slate-700" strokeWidth="10" stroke="currentColor" fill="transparent" r="45" cx="50" cy="50" />
                <circle
                    className={`${colorClass} transition-all duration-1000 ease-in-out`}
                    strokeWidth="10"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="45"
                    cx="50"
                    cy="50"
                    transform="rotate(-90 50 50)"
                />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-3xl font-bold">{score}</span>
        </div>
    );
};

const FeedbackItemCard: React.FC<{ item: FeedbackItem }> = ({ item }) => (
    <div className={`p-4 rounded-lg flex items-start gap-4 ${item.isCorrect ? 'bg-emerald-900/40' : 'bg-rose-900/40'}`}>
        <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-1 ${item.isCorrect ? 'bg-emerald-500' : 'bg-rose-500'}`}>
            {item.isCorrect ? <CheckIcon className="w-4 h-4" /> : <XIcon className="w-4 h-4" />}
        </div>
        <div>
            <p className="font-mono text-lg font-semibold text-white">{item.phoneme}</p>
            <p className="text-slate-300">{item.feedback}</p>
        </div>
    </div>
);


export const FeedbackDisplay: React.FC<FeedbackDisplayProps> = ({ feedback, onTryAgain }) => {
  return (
    <div className="w-full flex flex-col items-center gap-6 animate-fade-in text-center">
      <h3 className="text-2xl font-bold text-sky-300">Feedback Report</h3>
      
      <ScoreCircle score={feedback.overallScore} />

      <div className="w-full flex justify-around text-center bg-slate-900/50 p-3 rounded-lg">
          <div>
              <p className="text-sm text-slate-400">Your Pronunciation (IPA)</p>
              <p className="font-mono text-xl text-amber-300">{feedback.userPhonetic}</p>
          </div>
           <div>
              <p className="text-sm text-slate-400">Correct Pronunciation (IPA)</p>
              <p className="font-mono text-xl text-emerald-300">{feedback.correctPhonetic}</p>
          </div>
      </div>
      
      <div className="w-full text-left">
          <h4 className="text-lg font-semibold mb-3 text-slate-300">Detailed Analysis:</h4>
          <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
              {feedback.feedbackItems.map((item, index) => (
                  <FeedbackItemCard key={index} item={item} />
              ))}
          </div>
      </div>

       <div className="w-full bg-sky-900/50 p-4 rounded-lg">
          <h4 className="font-semibold text-sky-300">💡 General Tip</h4>
          <p className="text-slate-200">{feedback.generalTip}</p>
      </div>
      
      <button onClick={onTryAgain} className="bg-sky-600 hover:bg-sky-500 text-white font-bold py-2 px-6 rounded-full transition-colors mt-2">
        Try Again
      </button>
    </div>
  );
};
