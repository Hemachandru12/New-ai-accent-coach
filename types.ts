export interface FeedbackItem {
  phoneme: string;
  feedback: string;
  isCorrect: boolean;
}

export interface PronunciationFeedback {
  overallScore: number;
  userPhonetic: string;
  correctPhonetic: string;
  feedbackItems: FeedbackItem[];
  generalTip: string;
}
