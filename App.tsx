
import React from 'react';
import CurrencyScanner from './components/CurrencyScanner';

const App: React.FC = () => {
  return (
    <main className="bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-2xl text-center">
        <header className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-cyan-400">Currency Identifier</h1>
          <p className="text-lg text-gray-400 mt-2">For Sri Lankan Rupees (LKR)</p>
        </header>
        <CurrencyScanner />
        <footer className="mt-12 text-gray-500 text-sm">
          <p>Designed for accessibility. Point your camera at a note or coin.</p>
        </footer>
      </div>
    </main>
  );
};

export default App;
