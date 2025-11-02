import { useCallback, useContext } from 'react';
import { SettingsContext } from '../contexts/SettingsContext';

interface SpeechSynthesisHook {
  speak: (text: string) => void;
}

export const useSpeechSynthesis = (): SpeechSynthesisHook => {
  const { settings } = useContext(SettingsContext);

  const speak = useCallback((text: string) => {
    if ('speechSynthesis' in window && text) {
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US'; 
      utterance.rate = settings.rate;
      utterance.pitch = 1.0;

      // Find the selected voice and apply it
      const voices = window.speechSynthesis.getVoices();
      const selectedVoice = voices.find(voice => voice.voiceURI === settings.voiceURI);
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
      
      window.speechSynthesis.speak(utterance);
    } else {
      console.warn('Speech synthesis not supported or no text provided.');
    }
  }, [settings]);

  return { speak };
};
