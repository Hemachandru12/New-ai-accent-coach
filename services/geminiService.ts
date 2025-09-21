import { GoogleGenAI, Type } from "@google/genai";
import { PronunciationFeedback } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const ACCENT_MAP: { [key: string]: string } = {
    'en-US': 'American English',
    'en-GB': 'British English',
    'en-AU': 'Australian English',
};


const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
        if (typeof reader.result === 'string') {
            resolve(reader.result.split(',')[1]);
        } else {
            reject(new Error("Failed to convert blob to base64"));
        }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};


export const getPronunciationFeedback = async (word: string, audioBlob: Blob, accent: string): Promise<PronunciationFeedback> => {
  const audioData = await blobToBase64(audioBlob);
  const accentName = ACCENT_MAP[accent] || 'standard American English';

  const prompt = `A non-native English speaker has recorded themselves saying the word: "${word}". Analyze their pronunciation from the audio provided. Compare it to a standard ${accentName} pronunciation. Provide a score, phonetic transcriptions, specific feedback on each phoneme, and a general tip for improvement. For the phonetic transcriptions, please provide the correct one for a standard ${accentName} accent.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: {
      parts: [
        { text: prompt },
        {
          inlineData: {
            mimeType: audioBlob.type,
            data: audioData,
          },
        },
      ],
    },
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          overallScore: { type: Type.INTEGER, description: 'A score from 0 to 100 on pronunciation accuracy.' },
          userPhonetic: { type: Type.STRING, description: 'The phonetic transcription of the user\'s pronunciation using IPA.' },
          correctPhonetic: { type: Type.STRING, description: `The correct standard ${accentName} phonetic transcription of the word "${word}" using IPA.` },
          feedbackItems: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                phoneme: { type: Type.STRING, description: 'The specific phoneme or sound being analyzed.' },
                feedback: { type: Type.STRING, description: 'Constructive feedback on this specific phoneme.' },
                isCorrect: { type: Type.BOOLEAN, description: 'Whether the user pronounced this phoneme correctly.' },
              },
            },
          },
          generalTip: { type: Type.STRING, description: 'A single, actionable tip for the user to improve their pronunciation of this word.' },
        },
      },
    },
  });

  try {
    const jsonString = response.text;
    const feedback = JSON.parse(jsonString);
    return feedback as PronunciationFeedback;
  } catch (error) {
    console.error("Error parsing Gemini response:", error);
    console.error("Raw response text:", response.text);
    throw new Error("Failed to parse the feedback from the AI. The response was not valid JSON.");
  }
};