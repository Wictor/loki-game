import React, { useState, useEffect } from 'react';
import { PlayerData, VOTING_DURATION } from '../../../shared/types';

interface VotingProps {
  players: PlayerData[];
  currentPlayerId: string;
  onVote: (votedPlayerId: string) => void;
  votedPlayerIds: string[];
}

export default function Voting({ players, currentPlayerId, onVote, votedPlayerIds }: VotingProps) {
  const [hasVoted, setHasVoted] = useState(false);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(VOTING_DURATION / 1000);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleVote = (playerId: string) => {
    if (hasVoted) return;
    setSelectedPlayerId(playerId);
    setHasVoted(true);
    onVote(playerId);
  };

  const votablePlayers = players.filter((p) => p.id !== currentPlayerId);
  const totalPlayers = players.length;
  const votesCast = votedPlayerIds.length;

  return (
    <div data-testid="voting-phase" className="min-h-screen bg-gray-900 text-white p-6 flex flex-col">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">Who is the Imposter?</h1>
        <div className="text-xl font-semibold text-red-400">
          {Math.floor(timeRemaining / 60)}:{String(timeRemaining % 60).padStart(2, '0')}
        </div>
        <div className="text-sm text-gray-400 mt-2">
          {votesCast}/{totalPlayers} votes cast
        </div>
      </div>

      {/* Voting Status */}
      {hasVoted && (
        <div className="bg-green-900 border border-green-600 rounded-lg p-4 mb-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <svg className="w-6 h-6 text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span className="text-lg font-semibold">Vote cast!</span>
          </div>
          <p className="text-gray-300">Waiting for others...</p>
        </div>
      )}

      {/* Player List */}
      <div className="flex-1 space-y-3">
        {votablePlayers.map((player) => (
          <button
            key={player.id}
            data-testid={`vote-${player.name}`}
            onClick={() => handleVote(player.id)}
            disabled={hasVoted}
            className={`w-full flex items-center gap-4 p-4 rounded-lg transition-all ${
              hasVoted
                ? selectedPlayerId === player.id
                  ? 'bg-blue-900 border-2 border-blue-500'
                  : 'bg-gray-800 opacity-50 cursor-not-allowed'
                : 'bg-gray-800 hover:bg-gray-700 active:bg-gray-600 border-2 border-transparent hover:border-gray-600'
            }`}
          >
            {/* Color Badge */}
            <div
              className="w-12 h-12 rounded-full flex-shrink-0"
              style={{ backgroundColor: player.color }}
            />

            {/* Player Name */}
            <span className="text-xl font-semibold flex-1 text-left">{player.name}</span>

            {/* Selected Indicator */}
            {hasVoted && selectedPlayerId === player.id && (
              <svg className="w-6 h-6 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
