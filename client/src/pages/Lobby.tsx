import { useState } from 'react';
import { ClientGameState } from '../lib/gameState';
import { GameSettings, MIN_PLAYERS } from '../../../shared/types';
import { PlayerList } from '../components/PlayerList';

const CATEGORIES = [
  'random', 'animals', 'food', 'objects', 'places', 'actions',
  'vehicles', 'professions', 'nature', 'sports', 'movies & tv',
  'music', 'clothing',
];

const DRAW_TIME_OPTIONS = [10, 15, 20, 30];
const WIN_SCORE_OPTIONS = [5, 10, 15, 20];

interface LobbyProps {
  state: ClientGameState;
  onReady: () => void;
  onStart: (settings: GameSettings) => void;
}

export function Lobby({ state, onReady, onStart }: LobbyProps) {
  const [category, setCategory] = useState('random');
  const [drawTime, setDrawTime] = useState(20);
  const [canvasMode, setCanvasMode] = useState<'shared' | 'individual'>('shared');
  const [winScore, setWinScore] = useState(10);

  const currentPlayer = state.players.find(p => p.id === state.playerId);
  const allReady = state.players.length >= MIN_PLAYERS && state.players.every(p => p.isReady);
  const canStart = state.isHost && allReady;

  const handleStartGame = () => {
    onStart({
      category,
      drawTimeLimit: drawTime,
      rounds: 2,
      canvasMode,
      winScore,
    });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-md mx-auto space-y-6">
        {/* Room Code Section */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">Game Lobby</h1>
          <div className="bg-gray-800 rounded-lg p-6 space-y-2">
            <p className="text-sm text-gray-400">Share this code!</p>
            <div
              className="text-4xl font-bold tracking-wider text-blue-400"
              data-testid="room-code"
            >
              {state.roomCode}
            </div>
          </div>
        </div>

        {/* Player Count */}
        <div className="text-center">
          <p className="text-sm text-gray-400">
            {state.players.length}/8 players
          </p>
        </div>

        {/* Player List */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Players</h2>
          <PlayerList
            players={state.players}
            currentPlayerId={state.playerId || undefined}
            showReady={true}
          />
        </div>

        {/* Game Settings (Host Only) */}
        {state.isHost && (
          <div className="space-y-5 bg-gray-800 rounded-lg p-4">
            <h2 className="text-lg font-semibold">Game Settings</h2>

            {/* Category */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Category</label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${
                      category === cat
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Draw Time */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Time per drawing</label>
              <div className="flex gap-2">
                {DRAW_TIME_OPTIONS.map((t) => (
                  <button
                    key={t}
                    onClick={() => setDrawTime(t)}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                      drawTime === t
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                    }`}
                  >
                    {t}s
                  </button>
                ))}
              </div>
            </div>

            {/* Game Mode */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Game mode</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setCanvasMode('shared')}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                    canvasMode === 'shared'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                  }`}
                >
                  Shared Canvas
                </button>
                <button
                  onClick={() => setCanvasMode('individual')}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                    canvasMode === 'individual'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                  }`}
                >
                  Individual
                </button>
              </div>
            </div>

            {/* Score to Win */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Score to win</label>
              <div className="flex gap-2">
                {WIN_SCORE_OPTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => setWinScore(s)}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                      winScore === s
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3">
          {/* Ready Button */}
          <button
            onClick={onReady}
            data-testid="ready-btn"
            className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
              currentPlayer?.isReady
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-gray-700 hover:bg-gray-600 text-white'
            }`}
          >
            {currentPlayer?.isReady ? 'Ready!' : 'Not Ready'}
          </button>

          {/* Start Game Button (Host Only) */}
          {state.isHost && (
            <button
              onClick={handleStartGame}
              disabled={!canStart}
              data-testid="start-game"
              className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
                canStart
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-gray-700 text-gray-500 cursor-not-allowed'
              }`}
            >
              Start Game
            </button>
          )}
        </div>

        {/* Info Messages */}
        {state.isHost && !allReady && (
          <div className="text-center text-sm text-gray-400">
            {state.players.length < MIN_PLAYERS
              ? `Need at least ${MIN_PLAYERS} players to start`
              : 'Waiting for all players to ready up...'}
          </div>
        )}

        {/* Error Display */}
        {state.error && (
          <div className="bg-red-900/50 border border-red-700 rounded-lg p-3 text-sm text-red-200">
            {state.error}
          </div>
        )}
      </div>
    </div>
  );
}
