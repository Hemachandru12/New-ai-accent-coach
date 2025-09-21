import { useState, useRef, useCallback } from 'react';

type RecorderState = 'idle' | 'permission_pending' | 'recording' | 'stopped';
type MimeType = 'audio/webm' | 'audio/ogg' | 'audio/wav' | 'audio/mp4';

const getSupportedMimeType = (): MimeType => {
    const types: MimeType[] = ['audio/webm', 'audio/ogg', 'audio/wav', 'audio/mp4'];
    for (const type of types) {
        if (MediaRecorder.isTypeSupported(type)) {
            return type;
        }
    }
    return 'audio/webm'; // fallback
}

export const useAudioRecorder = () => {
  const [recorderState, setRecorderState] = useState<RecorderState>('idle');
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    setError(null);
    setAudioBlob(null);
    setRecorderState('permission_pending');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = getSupportedMimeType();
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.onstart = () => {
        audioChunksRef.current = [];
        setRecorderState('recording');
      };

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        setAudioBlob(blob);
        setRecorderState('stopped');
        stream.getTracks().forEach(track => track.stop()); // Stop the mic stream
      };

      mediaRecorder.onerror = (event) => {
        console.error("MediaRecorder error:", event);
        setError("An error occurred during recording.");
        setRecorderState('idle');
      };

      mediaRecorder.start();

    } catch (err) {
      console.error("Error accessing microphone:", err);
      if (err instanceof Error && (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError')) {
          setError('Microphone permission denied. Please allow access in your browser settings.');
      } else {
          setError('Could not access the microphone. Please ensure it is connected and enabled.');
      }
      setRecorderState('idle');
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  }, []);
  
  const reset = useCallback(() => {
    setRecorderState('idle');
    setAudioBlob(null);
    setError(null);
  }, []);

  return { recorderState, audioBlob, error, startRecording, stopRecording, reset };
};
