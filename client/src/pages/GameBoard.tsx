import { ClientGameState } from '../lib/gameState';
import { Stroke, PlayerData } from '../../../shared/types';
import { Canvas } from '../components/Canvas';
import { Timer } from '../components/Timer';

interface GameBoardProps {
  state: ClientGameState;
  onStrokeComplete: (stroke: Stroke) => void;
}

export function GameBoard({ state, onStrokeComplete }: GameBoardProps) {
  const currentPlayer = state.players.find((p) => p.id === state.playerId);
  const activePlayer = state.players.find((p) => p.id === state.activePlayerId);
  const isMyTurn = state.activePlayerId === state.playerId;

  // Calculate rounds
  const totalRounds = state.players.length;
  const roundLabel = `Round ${state.currentRound}/${totalRounds}`;

  // Get turn order with completion status
  const turnOrderDisplay = state.turnOrder.map((playerId) => {
    const player = state.players.find((p) => p.id === playerId);
    const hasDrawn = state.strokes.some((s) => s.playerId === playerId);
    const isActive = state.activePlayerId === playerId;
    return { player, hasDrawn, isActive };
  });

  return (
    <div
      data-testid="game-board"
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#0a0a0a',
        color: '#fff',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '1rem',
          backgroundColor: '#1a1a1a',
          borderBottom: '2px solid #333',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
          <div style={{ fontSize: '0.875rem', color: '#888', marginBottom: '0.25rem' }}>
            {roundLabel}
          </div>
          <div
            data-testid="turn-indicator"
            style={{
              fontSize: '1.25rem',
              fontWeight: 'bold',
              color: activePlayer?.color || '#fff',
            }}
          >
            {isMyTurn ? "Your Turn!" : `${activePlayer?.name}'s Turn`}
          </div>
        </div>

        {/* Timer - key forces reset on each turn change */}
        {state.activePlayerId && (
          <Timer
            key={`${state.activePlayerId}-${state.currentRound}`}
            duration={state.drawTimeLimit * 1000}
            onComplete={() => {
              // Timer completion handled by server
            }}
            label="Time Remaining"
          />
        )}
      </div>

      {/* Canvas Area */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
        }}
      >
        {isMyTurn ? (
          <div data-testid="canvas-active" style={{ width: '100%', maxWidth: '600px' }}>
            <Canvas
              color={currentPlayer?.color || '#fff'}
              brushSize={3}
              enabled={true}
              onStrokeComplete={onStrokeComplete}
              strokes={state.strokes}
            />
          </div>
        ) : (
          <div style={{ width: '100%', maxWidth: '600px' }}>
            <Canvas
              color="#fff"
              brushSize={3}
              enabled={false}
              onStrokeComplete={() => {}}
              strokes={state.strokes}
            />
            <div
              style={{
                textAlign: 'center',
                marginTop: '1rem',
                fontSize: '1.125rem',
                color: '#888',
              }}
            >
              Waiting for {activePlayer?.name}...
            </div>
          </div>
        )}
      </div>

      {/* Turn Order List */}
      <div
        style={{
          padding: '1rem',
          backgroundColor: '#1a1a1a',
          borderTop: '2px solid #333',
        }}
      >
        <div style={{ fontSize: '0.875rem', color: '#888', marginBottom: '0.5rem' }}>
          Turn Order:
        </div>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.5rem',
          }}
        >
          {turnOrderDisplay.map(({ player, hasDrawn, isActive }) => {
            if (!player) return null;

            return (
              <div
                key={player.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 0.75rem',
                  backgroundColor: isActive ? '#2a2a2a' : '#1a1a1a',
                  border: `2px solid ${isActive ? player.color : '#333'}`,
                  borderRadius: '8px',
                  opacity: hasDrawn ? 0.6 : 1,
                }}
              >
                <div
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: player.color,
                  }}
                />
                <span
                  style={{
                    fontSize: '0.875rem',
                    fontWeight: isActive ? 'bold' : 'normal',
                    textDecoration: hasDrawn ? 'line-through' : 'none',
                  }}
                >
                  {player.name}
                </span>
                {hasDrawn && (
                  <span style={{ fontSize: '0.75rem', color: '#2ECC71' }}>✓</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
