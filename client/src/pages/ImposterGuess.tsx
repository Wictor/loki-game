import React, { useState, useEffect } from 'react';

interface ImposterGuessProps {
  onGuess: (word: string) => void;
  timeLimit: number;
}

export default function ImposterGuess({ onGuess, timeLimit }: ImposterGuessProps) {
  const [guess, setGuess] = useState('');
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(timeLimit);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        const next = Math.max(0, prev - 1);
        if (next === 0 && !hasSubmitted) {
          handleSubmit();
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [hasSubmitted]);

  const handleSubmit = () => {
    if (hasSubmitted) return;
    setHasSubmitted(true);
    onGuess(guess.trim());
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && guess.trim() && !hasSubmitted) {
      handleSubmit();
    }
  };

  return (
    <div data-testid="imposter-guess-phase" className="min-h-screen bg-red-950 text-white p-6 flex flex-col items-center justify-center">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="text-6xl mb-4">😱</div>
          <h1 className="text-4xl font-bold text-red-400">You've been caught!</h1>
          <p className="text-xl text-red-300">Guess the secret word for bonus points!</p>
        </div>

        {/* Timer */}
        <div className="text-center">
          <div className="inline-block bg-red-900 border-2 border-red-600 rounded-lg px-6 py-3">
            <div className="text-3xl font-bold">
              {Math.floor(timeRemaining / 60)}:{String(timeRemaining % 60).padStart(2, '0')}
            </div>
            <div className="text-sm text-red-300">Time remaining</div>
          </div>
        </div>

        {/* Input Section */}
        {!hasSubmitted ? (
          <div className="space-y-4">
            <input
              type="text"
              data-testid="imposter-guess-input"
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter your guess..."
              className="w-full px-4 py-4 text-lg bg-red-900 border-2 border-red-600 rounded-lg text-white placeholder-red-400 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500"
              autoFocus
            />
            <button
              data-testid="submit-guess"
              onClick={handleSubmit}
              disabled={!guess.trim()}
              className={`w-full py-4 text-xl font-bold rounded-lg transition-all ${
                guess.trim()
                  ? 'bg-red-600 hover:bg-red-700 active:bg-red-800 text-white'
                  : 'bg-gray-700 text-gray-500 cursor-not-allowed'
              }`}
            >
              Submit Guess
            </button>
          </div>
        ) : (
          <div className="bg-red-900 border border-red-600 rounded-lg p-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <svg className="w-6 h-6 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-lg font-semibold">Guess submitted!</span>
            </div>
            <p className="text-red-300">Waiting for results...</p>
          </div>
        )}
      </div>
    </div>
  );
}
