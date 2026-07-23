'use client';

import { useState, useRef, useCallback } from 'react';

type RecorderStatus = 'idle' | 'requesting-permission' | 'recording' | 'stopped' | 'error';

export function useVoiceRecorder() {
  const [status, setStatus] = useState<RecorderStatus>('idle');
  const [error, setError] = useState<string>('');
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const startRecording = useCallback(async () => {
    setError('');
    setAudioBlob(null);
    setStatus('requesting-permission');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        setStatus('stopped');

        // Stop the mic stream to turn off the browser recording indicator
        streamRef.current?.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      };

      mediaRecorder.start();
      setStatus('recording');
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Nta bushobozi bwo kubona mikoro';
      setError(message);
      setStatus('error');
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && status === 'recording') {
      mediaRecorderRef.current.stop();
    }
  }, [status]);

  const reset = useCallback(() => {
    setStatus('idle');
    setError('');
    setAudioBlob(null);
    audioChunksRef.current = [];
  }, []);

  return {
    status,
    error,
    audioBlob,
    startRecording,
    stopRecording,
    reset,
  };
}
