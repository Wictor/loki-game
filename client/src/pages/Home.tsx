import { useState } from 'react';

interface HomeProps {
  onCreateGame: (name: string) => void;
  onJoinGame: (name: string, roomCode: string) => void;
}

export function Home({ onCreateGame, onJoinGame }: HomeProps) {
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [showJoin, setShowJoin] = useState(false);

  const handleCreateGame = () => {
    if (playerName.trim()) {
      onCreateGame(playerName.trim());
    }
  };

  const handleJoinGame = () => {
    if (playerName.trim() && roomCode.trim()) {
      onJoinGame(playerName.trim(), roomCode.trim().toUpperCase());
    }
  };

  const handleRoomCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase().slice(0, 4);
    setRoomCode(value);
  };

  const isNameValid = playerName.trim().length > 0;
  const isJoinValid = isNameValid && roomCode.trim().length === 4;

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        {/* Title */}
        <div className="text-center">
          <h1 className="text-5xl font-bold mb-2">LOKI</h1>
          <p className="text-gray-400 text-lg">Fake Artist Goes to New York</p>
        </div>

        {/* Player Name Input */}
        <div>
          <label className="block text-sm text-gray-400 mb-2">Player Name</label>
          <input
            type="text"
            data-testid="player-name"
            placeholder="Enter your name"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            className="w-full px-4 py-4 text-lg bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-gray-700"></div>
          <div className="flex-1 h-px bg-gray-700"></div>
        </div>

        {/* Create Game Button */}
        <button
          data-testid="create-game"
          onClick={handleCreateGame}
          disabled={!isNameValid}
          className="w-full py-4 text-lg font-semibold bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed rounded-lg transition-colors"
        >
          Create Game
        </button>

        {/* Or */}
        <div className="text-center text-gray-500 text-sm">or</div>

        {/* Join Game Toggle / Section */}
        {!showJoin ? (
          <button
            onClick={() => isNameValid && setShowJoin(true)}
            disabled={!isNameValid}
            className="w-full py-4 text-lg font-semibold bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            Join Game
          </button>
        ) : (
          <div className="space-y-4">
            <input
              type="text"
              data-testid="room-code-input"
              placeholder="Room Code (4 letters)"
              value={roomCode}
              onChange={handleRoomCodeChange}
              autoFocus
              maxLength={4}
              className="w-full px-4 py-4 text-lg text-center uppercase tracking-widest bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowJoin(false);
                  setRoomCode('');
                }}
                className="flex-1 py-4 text-lg font-semibold bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              >
                Back
              </button>
              <button
                data-testid="join-game"
                onClick={handleJoinGame}
                disabled={!isJoinValid}
                className="flex-1 py-4 text-lg font-semibold bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                Join
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
