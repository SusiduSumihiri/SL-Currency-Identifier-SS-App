import React, { useState, useCallback, useRef } from 'react';
import { identifyCurrency } from '../services/geminiService';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { fileToBase64 } from '../utils/imageUtils';
import { CameraIcon } from './icons/CameraIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';

type Message = {
    text: string;
    type: 'success' | 'error' | 'info';
} | null;

const CurrencyScanner: React.FC = () => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [message, setMessage] = useState<Message>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { speak } = useSpeechSynthesis();

  const resetState = () => {
    setImagePreview(null);
    setMessage(null);
    setIsLoading(false);
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const handleImageChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    resetState();
    setIsLoading(true);

    try {
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);

      const { base64, mimeType } = await fileToBase64(file);
      const identificationResult = await identifyCurrency(base64, mimeType);
      
      if (identificationResult === 'FLIP_COIN') {
          const instructionText = 'This appears to be the emblem side of a coin. Please flip the coin over and try again.';
          setMessage({ text: instructionText, type: 'info' });
          speak(instructionText);
      } else if (identificationResult === 'UNRECOGNIZABLE') {
          const errorText = 'Could not recognize Sri Lankan currency. Please try again with a clearer image.';
          setMessage({ text: errorText, type: 'error' });
          speak(errorText);
      } else {
          setMessage({ text: identificationResult, type: 'success' });
          speak(identificationResult);
      }
    } catch (err) {
      console.error(err);
      const errorMessage = 'Identification failed due to a system error. Please try again.';
      setMessage({ text: errorMessage, type: 'error' });
      speak(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [speak]);

  return (
    <div className="w-full flex flex-col items-center p-6 bg-gray-800 rounded-2xl shadow-lg border border-gray-700">
      <div className="w-full aspect-video bg-gray-700 rounded-lg flex items-center justify-center mb-6 overflow-hidden relative">
        {imagePreview && <img src={imagePreview} alt="Currency preview" className="object-contain w-full h-full" />}
        {!imagePreview && !isLoading && (
          <div className="text-gray-400 flex flex-col items-center">
            <CameraIcon className="w-16 h-16 mb-2" />
            <span className="text-lg">Image preview will appear here</span>
          </div>
        )}
        {isLoading && (
          <div className="absolute inset-0 bg-black bg-opacity-60 flex flex-col items-center justify-center">
            <SpinnerIcon className="w-12 h-12 text-cyan-400" />
            <p className="mt-4 text-lg font-semibold">Identifying...</p>
          </div>
        )}
      </div>

      {message && !isLoading && (
        <div className={`text-center my-4 p-4 rounded-lg w-full border ${
            message.type === 'success' ? 'bg-green-900 border-green-700' :
            message.type === 'error' ? 'bg-red-900 border-red-700' :
            'bg-amber-800 border-amber-600'
        }`}>
            <p className={`font-semibold ${
                message.type === 'success' ? 'text-2xl md:text-3xl font-bold text-green-300' :
                message.type === 'error' ? 'text-xl text-red-300' :
                'text-xl text-amber-200'
            }`}>{message.text}</p>
        </div>
      )}

      <div className="w-full mt-4">
        <input
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleImageChange}
          className="hidden"
          id="currency-input"
          ref={fileInputRef}
          disabled={isLoading}
        />
        {message || imagePreview ? (
             <button
                onClick={resetState}
                className="w-full text-lg font-bold py-4 px-6 bg-gray-600 hover:bg-gray-500 text-white rounded-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-gray-400 disabled:bg-gray-700 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                Identify Another
            </button>
        ) : (
            <label
              htmlFor="currency-input"
              className={`w-full flex items-center justify-center text-lg font-bold py-4 px-6 rounded-xl transition-all duration-300 focus:outline-none focus:ring-4 ${isLoading ? 'bg-cyan-800 text-gray-400 cursor-not-allowed' : 'bg-cyan-600 hover:bg-cyan-500 text-white cursor-pointer focus:ring-cyan-400'}`}
            >
              <CameraIcon className="w-6 h-6 mr-3" />
              Tap to Identify Currency
            </label>
        )}
      </div>
    </div>
  );
};

export default CurrencyScanner;
