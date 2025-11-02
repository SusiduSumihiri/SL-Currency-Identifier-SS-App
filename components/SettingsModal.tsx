import React, { useContext, useState, useEffect, useCallback, useRef } from 'react';
import { SettingsContext } from '../contexts/SettingsContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { settings, updateSettings } = useContext(SettingsContext);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const populateVoiceList = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      // Filter for English voices for better consistency
      const englishVoices = availableVoices.filter(voice => voice.lang.startsWith('en'));
      setVoices(englishVoices.length > 0 ? englishVoices : availableVoices);
    };

    populateVoiceList();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = populateVoiceList;
    }
  }, []);
  
  // Handle keyboard events for closing the modal
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      modalRef.current?.focus();
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const handleOverlayClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  }, [onClose]);

  if (!isOpen) return null;

  const handleRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newRate = parseFloat(e.target.value);
    updateSettings({ rate: newRate });
  };

  const handleVoiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateSettings({ voiceURI: e.target.value });
  };
  
  const testSpeech = () => {
      if (!('speechSynthesis' in window)) return;
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance('This is a test of the current voice settings.');
      utterance.rate = settings.rate;
      const selectedVoice = voices.find(v => v.voiceURI === settings.voiceURI);
      if (selectedVoice) {
          utterance.voice = selectedVoice;
      }
      window.speechSynthesis.speak(utterance);
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 transition-opacity"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
    >
      <div
        ref={modalRef}
        className="bg-gray-800 rounded-2xl shadow-xl w-full max-w-md m-4 p-6 border border-gray-700 text-white transform transition-all"
        tabIndex={-1}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 id="settings-title" className="text-2xl font-bold text-cyan-400">Settings</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500"
            aria-label="Close settings"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        <div className="space-y-6">
          {/* Speech Rate Setting */}
          <div>
            <label htmlFor="rate-slider" className="block text-lg font-medium text-gray-300 mb-2">
              Speech Speed: <span className="font-bold text-cyan-300">{settings.rate.toFixed(1)}x</span>
            </label>
            <input
              id="rate-slider"
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={settings.rate}
              onChange={handleRateChange}
              className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
          </div>

          {/* Voice Selection Setting */}
          <div>
            <label htmlFor="voice-select" className="block text-lg font-medium text-gray-300 mb-2">
              Voice
            </label>
            <select
              id="voice-select"
              value={settings.voiceURI ?? ''}
              onChange={handleVoiceChange}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-cyan-500 focus:border-cyan-500"
              disabled={voices.length === 0}
            >
              {voices.length > 0 ? (
                voices.map((voice) => (
                  <option key={voice.voiceURI} value={voice.voiceURI}>
                    {voice.name} ({voice.lang})
                  </option>
                ))
              ) : (
                <option>Loading voices...</option>
              )}
            </select>
          </div>
          
          <button onClick={testSpeech} className="w-full py-2 px-4 bg-cyan-600 hover:bg-cyan-700 rounded-lg font-semibold transition">Test Voice</button>

        </div>

        <div className="mt-8 pt-6 border-t border-gray-700">
            <h3 className="text-xl font-semibold text-gray-400 mb-3">About this App</h3>
            <div className="text-gray-400 space-y-2">
                <p>Developed by W G Susidu Sumihiri</p>
                <p>Undergraduate, University of Sri Jayewardenepura</p>
                <p>
                    <a 
                        href="https://x.com/Susindusumihir1" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-cyan-400 hover:underline"
                    >
                        X: @Susindusumihir1
                    </a>
                </p>
            </div>
        </div>

      </div>
    </div>
  );
};

export default SettingsModal;