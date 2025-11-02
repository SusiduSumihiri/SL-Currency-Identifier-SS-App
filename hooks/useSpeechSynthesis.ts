
import { useCallback } from 'react';

interface SpeechSynthesisHook {
  speak: (text: string) => void;
}

export const useSpeechSynthesis = (): SpeechSynthesisHook => {
  const speak = useCallback((text: string) => {
    if ('speechSynthesis' in window && text) {
      // Cancel any ongoing speech to prevent overlap
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      // Using a locale that is likely to be well-supported for English
      utterance.lang = 'en-US'; 
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      
      window.speechSynthesis.speak(utterance);
    } else {
      console.warn('Speech synthesis not supported or no text provided.');
    }
  }, []);

  return { speak };
};
