import { PlayerData } from '../../../shared/types';
import { ColorBadge } from './ColorBadge';

interface PlayerListProps {
  players: PlayerData[];
  currentPlayerId?: string;
  showReady?: boolean;
}

export function PlayerList({ players, currentPlayerId, showReady = false }: PlayerListProps) {
  return (
    <div className="space-y-2" data-testid="player-list">
      {players.map((player) => {
        const isCurrentPlayer = player.id === currentPlayerId;

        return (
          <div
            key={player.id}
            className={`flex items-center gap-3 p-3 rounded-lg bg-gray-800 ${
              isCurrentPlayer ? 'ring-2 ring-blue-500 shadow-lg shadow-blue-500/20' : ''
            }`}
          >
            <ColorBadge color={player.color} size="md" />

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-white truncate">
                  {player.name}
                </span>
                {player.isHost && (
                  <span className="text-xs px-2 py-0.5 bg-yellow-600 text-white rounded-full">
                    HOST
                  </span>
                )}
              </div>
            </div>

            {showReady && (
              <div className="flex items-center">
                {player.isReady ? (
                  <span className="text-green-500 text-xl">✓</span>
                ) : (
                  <span className="text-gray-500 text-sm">...</span>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
