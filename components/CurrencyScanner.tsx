import React, { useState, useCallback, useRef, useEffect } from 'react';
import { identifyCurrency } from '../services/geminiService';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { CameraOffIcon } from './icons/CameraOffIcon';

type Message = {
    text: string;
    type: 'success' | 'error' | 'info';
} | null;

type CameraPermission = 'pending' | 'granted' | 'denied';

// How often to capture a frame from the video to send for analysis
const SCAN_INTERVAL_MS = 2000;
// How long to pause scanning after a successful identification
const POST_DETECTION_PAUSE_MS = 5000;

const CurrencyScanner: React.FC = () => {
  const [message, setMessage] = useState<Message>({ text: 'Point your camera at a currency note or coin.', type: 'info' });
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [cameraPermission, setCameraPermission] = useState<CameraPermission>('pending');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isProcessingRef = useRef<boolean>(false); // Ref to avoid stale state in interval
  const lastResultRef = useRef<string | null>(null);
  
  const { speak } = useSpeechSynthesis();

  // This function captures a frame, sends it to the API, and handles the result
  const handleScan = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || videoRef.current.readyState < 2 || isProcessingRef.current) {
      return;
    }

    isProcessingRef.current = true;
    setIsProcessing(true);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');

    if (!context) {
      isProcessingRef.current = false;
      setIsProcessing(false);
      return;
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    const base64Image = dataUrl.split(',')[1];
    
    if (!base64Image) {
      isProcessingRef.current = false;
      setIsProcessing(false);
      return;
    }

    let pauseDuration = 0;
    try {
      const result = await identifyCurrency(base64Image, 'image/jpeg');
      
      if (result && result !== lastResultRef.current) {
        lastResultRef.current = result;

        if (result === 'FLIP_COIN') {
          const text = 'This appears to be the emblem side of a coin. Please flip the coin over.';
          setMessage({ text, type: 'info' });
          speak(text);
          pauseDuration = POST_DETECTION_PAUSE_MS;
        } else if (result === 'UNRECOGNIZABLE') {
           // We don't speak this to avoid being annoying during continuous scanning
           setMessage({ text: 'Currency not recognized. Please ensure the image is clear.', type: 'info' });
        } else {
          setMessage({ text: result, type: 'success' });
          speak(result);
          pauseDuration = POST_DETECTION_PAUSE_MS;
        }
      }
    } catch (err) {
      console.error(err);
      const errorMessage = 'Identification failed due to a system error.';
      if (lastResultRef.current !== errorMessage) {
        setMessage({ text: errorMessage, type: 'error' });
        speak(errorMessage);
        lastResultRef.current = errorMessage;
      }
    } finally {
        setTimeout(() => {
            isProcessingRef.current = false;
            setIsProcessing(false);
            if (pauseDuration > 0) {
              lastResultRef.current = null; // Allow re-scanning of the same note after pause
              setMessage({ text: 'Ready to scan again.', type: 'info' });
            }
        }, pauseDuration);
    }
  }, [speak]);

  // Effect to set up the camera stream
  useEffect(() => {
    let stream: MediaStream | null = null;
    const enableStream = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setCameraPermission('granted');
        setMessage({ text: 'Point your camera at a currency note or coin.', type: 'info' });
      } catch (err) {
        console.error("Error accessing camera: ", err);
        if (err instanceof Error && (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError')) {
            setCameraPermission('denied');
            setMessage({ text: 'Camera access denied. Please enable it in your browser settings to use the scanner.', type: 'error' });
        } else {
            setCameraPermission('denied');
            setMessage({ text: 'Could not access camera. Please ensure it is not in use by another application.', type: 'error' });
        }
      }
    };
    enableStream();
    
    return () => {
      stream?.getTracks().forEach(track => track.stop());
    };
  }, []);

  // Effect to run the scanning interval
  useEffect(() => {
    if (cameraPermission !== 'granted') {
      return; // Don't start scanning if camera isn't ready
    }

    const interval = setInterval(() => {
        handleScan();
    }, SCAN_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [handleScan, cameraPermission]);

  const getMessageStyles = () => {
      if (!message) return '';
      switch (message.type) {
          case 'success':
              return 'bg-green-900 border-green-700 text-green-300 text-2xl md:text-3xl font-bold';
          case 'error':
              return 'bg-red-900 border-red-700 text-red-300 text-xl';
          case 'info':
          default:
              return 'bg-cyan-800 border-cyan-600 text-cyan-200 text-xl';
      }
  };

  return (
    <div className="w-full flex flex-col items-center p-6 bg-gray-800 rounded-2xl shadow-lg border border-gray-700">
      <div className="w-full aspect-video bg-gray-700 rounded-lg flex items-center justify-center mb-6 overflow-hidden relative">
        {cameraPermission === 'granted' && (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
              aria-label="Live camera feed for currency identification"
            />
            {isProcessing && (
              <div className="absolute inset-0 bg-black bg-opacity-60 flex flex-col items-center justify-center">
                <SpinnerIcon className="w-12 h-12 text-cyan-400" />
                <p className="mt-4 text-lg font-semibold">Identifying...</p>
              </div>
            )}
          </>
        )}
        {cameraPermission === 'pending' && (
            <div className="flex flex-col items-center justify-center text-gray-400">
                <SpinnerIcon className="w-10 h-10 mb-4" />
                <p>Initializing camera...</p>
            </div>
        )}
        {cameraPermission === 'denied' && (
             <div className="flex flex-col items-center justify-center text-red-400 p-4">
                <CameraOffIcon className="w-12 h-12 mb-4" />
                <p className="text-center font-semibold text-lg">Camera Access Required</p>
             </div>
        )}
      </div>

      <div 
        aria-live="assertive" 
        aria-atomic="true"
        className="w-full h-24 flex items-center justify-center" // Fixed height to prevent layout shifts
      >
        {message && (
          <div className={`text-center p-4 rounded-lg w-full border transition-all duration-300 ${getMessageStyles()}`}>
              <p className="font-semibold">{message.text}</p>
          </div>
        )}
      </div>

      {/* Hidden canvas for capturing frames from the video */}
      <canvas ref={canvasRef} className="hidden" aria-hidden="true" />
    </div>
  );
};

export default CurrencyScanner;