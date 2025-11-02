import React, { useState } from 'react';
import CurrencyScanner from './components/CurrencyScanner';
import { SettingsProvider } from './contexts/SettingsContext';
import SettingsModal from './components/SettingsModal';
import { SettingsIcon } from './components/icons/SettingsIcon';

const App: React.FC = () => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <SettingsProvider>
      <main className="bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center p-4 font-sans relative">
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-3 bg-gray-700 rounded-full text-gray-300 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-400 transition"
            aria-label="Open settings"
          >
            <SettingsIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="w-full max-w-2xl text-center">
          <header className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-cyan-400">Currency Identifier</h1>
            <p className="text-lg text-gray-400 mt-2">For Sri Lankan Rupees (LKR)</p>
          </header>
          <CurrencyScanner />
        </div>

        <SettingsModal 
          isOpen={isSettingsOpen} 
          onClose={() => setIsSettingsOpen(false)} 
        />
      </main>
    </SettingsProvider>
  );
};

export default App;