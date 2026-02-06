import React from 'react';
import { RoundResult, PlayerData } from '../../../shared/types';

interface ScoreboardProps {
  result: RoundResult;
  players: PlayerData[];
  playerId: string | null;
  winScore: number;
  timeoutPlayerIds: string[];
  onRequestTimeout: () => void;
  onCancelTimeout: () => void;
  onNextRound: () => void;
  onPlayAgain: () => void;
  isHost: boolean;
}

export default function Scoreboard({ result, players, playerId, winScore, timeoutPlayerIds, onRequestTimeout, onCancelTimeout, onNextRound, onPlayAgain, isHost }: ScoreboardProps) {
  const imposter = players.find((p) => p.id === result.imposterId);

  // Sort players by total score (descending)
  const sortedPlayers = [...players].sort(
    (a, b) => (result.totalScores[b.id] || 0) - (result.totalScores[a.id] || 0)
  );

  // Check if someone won
  const winner = sortedPlayers.find((p) => (result.totalScores[p.id] || 0) >= winScore);
  const gameOver = !!winner;

  return (
    <div data-testid="round-result" className="min-h-screen bg-gray-900 text-white p-6 flex flex-col">
      {/* Winner Banner */}
      {gameOver && winner && (
        <div className="mb-6 bg-yellow-600 bg-opacity-20 border-2 border-yellow-500 rounded-lg p-6 text-center">
          <div className="text-4xl mb-2">🏆</div>
          <h1 className="text-3xl font-bold mb-1" style={{ color: winner.color }}>
            {winner.name} Wins!
          </h1>
          <p className="text-gray-300">First to {winScore} points!</p>
        </div>
      )}

      {/* Round Result Summary */}
      <div className="mb-8 space-y-4">
        {!gameOver && <h1 className="text-3xl font-bold text-center mb-6">Round Results</h1>}

        {/* Imposter Reveal */}
        <div className="bg-gray-800 rounded-lg p-6 space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-lg text-gray-400">The imposter was:</span>
            <div className="flex items-center gap-2">
              {imposter && (
                <>
                  <div
                    className="w-8 h-8 rounded-full"
                    style={{ backgroundColor: imposter.color }}
                  />
                  <span className="text-xl font-bold">{imposter.name}</span>
                </>
              )}
            </div>
          </div>

          {/* Caught Status */}
          <div className="flex items-center gap-2">
            {result.imposterCaught ? (
              <>
                <span className="text-2xl">🎯</span>
                <span className="text-lg font-semibold text-green-400">Caught!</span>
              </>
            ) : (
              <>
                <span className="text-2xl">😎</span>
                <span className="text-lg font-semibold text-red-400">Got away!</span>
              </>
            )}
          </div>

          {/* Guess Result (if caught) */}
          {result.imposterCaught && result.imposterGuessCorrect !== null && (
            <div className="flex items-center gap-2">
              <span className="text-gray-400">Guessed the word:</span>
              {result.imposterGuessCorrect ? (
                <span className="text-lg font-semibold text-green-400">✓ Correct!</span>
              ) : (
                <span className="text-lg font-semibold text-red-400">✗ Wrong!</span>
              )}
            </div>
          )}

          {/* Secret Word */}
          <div className="pt-3 border-t border-gray-700">
            <span className="text-gray-400">The secret word was: </span>
            <span className="text-2xl font-bold text-blue-400">{result.secretWord}</span>
          </div>
        </div>
      </div>

      {/* Scoreboard */}
      <div className="flex-1 mb-6">
        <h2 className="text-2xl font-bold mb-4 text-center">Scoreboard</h2>
        <div data-testid="scoreboard" className="bg-gray-800 rounded-lg overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-[auto_1fr_auto_auto] gap-4 px-4 py-3 bg-gray-700 font-semibold text-sm">
            <div className="text-center">#</div>
            <div>Player</div>
            <div className="text-right">Round</div>
            <div className="text-right">Total</div>
          </div>

          {/* Player Rows */}
          {sortedPlayers.map((player, index) => {
            const roundPoints = result.scores[player.id] || 0;
            const totalPoints = result.totalScores[player.id] || 0;
            const isImposter = player.id === result.imposterId;
            const isWinner = gameOver && player.id === winner?.id;

            return (
              <div
                key={player.id}
                className={`grid grid-cols-[auto_1fr_auto_auto] gap-4 px-4 py-4 border-t border-gray-700 ${
                  isWinner ? 'bg-yellow-900 bg-opacity-30' : isImposter ? 'bg-red-900 bg-opacity-20' : ''
                }`}
              >
                {/* Rank */}
                <div className="text-center font-bold text-lg text-gray-400">
                  {index + 1}
                </div>

                {/* Player */}
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-full flex-shrink-0"
                    style={{ backgroundColor: player.color }}
                  />
                  <span className="font-semibold truncate">{player.name}</span>
                  {isImposter && (
                    <span className="text-xs bg-red-600 px-2 py-1 rounded">IMP</span>
                  )}
                  {isWinner && (
                    <span className="text-xs bg-yellow-600 px-2 py-1 rounded">👑</span>
                  )}
                </div>

                {/* Round Points */}
                <div className="text-right font-semibold">
                  {roundPoints > 0 && (
                    <span className="text-green-400">+{roundPoints}</span>
                  )}
                  {roundPoints === 0 && (
                    <span className="text-gray-500">0</span>
                  )}
                </div>

                {/* Total Points */}
                <div className="text-right font-bold text-xl">
                  {totalPoints}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Timeout Requests */}
      {!gameOver && timeoutPlayerIds.length > 0 && (
        <div className="mb-4 bg-yellow-900 bg-opacity-30 border border-yellow-600 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">⏸️</span>
            <span className="font-semibold text-yellow-400">Break requested</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {timeoutPlayerIds.map((id) => {
              const p = players.find((pl) => pl.id === id);
              return p ? (
                <span key={id} className="text-sm px-2 py-1 bg-yellow-800 bg-opacity-40 rounded" style={{ color: p.color }}>
                  {p.name}
                </span>
              ) : null;
            })}
          </div>
        </div>
      )}

      {/* Break Toggle (non-host, non-game-over) */}
      {!isHost && !gameOver && (
        <div className="mb-3">
          {playerId && timeoutPlayerIds.includes(playerId) ? (
            <button
              onClick={onCancelTimeout}
              className="w-full py-3 text-lg font-semibold bg-yellow-700 hover:bg-yellow-600 rounded-lg transition-all"
            >
              Cancel Break Request
            </button>
          ) : (
            <button
              onClick={onRequestTimeout}
              className="w-full py-3 text-lg font-semibold bg-gray-700 hover:bg-gray-600 rounded-lg transition-all"
            >
              Need a Break
            </button>
          )}
        </div>
      )}

      {/* Action Buttons */}
      {isHost && (
        <div className="space-y-3">
          {gameOver ? (
            <button
              data-testid="play-again"
              onClick={onPlayAgain}
              className="w-full py-4 text-xl font-bold bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg transition-all"
            >
              Back to Lobby
            </button>
          ) : (
            <button
              data-testid="next-round"
              onClick={onNextRound}
              className="w-full py-4 text-xl font-bold bg-green-600 hover:bg-green-700 active:bg-green-800 rounded-lg transition-all"
            >
              {timeoutPlayerIds.length > 0 ? 'Next Round (break requested!)' : 'Next Round'}
            </button>
          )}
        </div>
      )}

      {!isHost && (
        <div className="text-center text-gray-400 py-4">
          {gameOver
            ? 'Waiting for host to return to lobby...'
            : 'Waiting for host to start next round...'}
        </div>
      )}
    </div>
  );
}
