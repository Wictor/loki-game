import { useEffect, useState, useCallback } from 'react';
import { Canvas } from '../components/Canvas';
import { GamePhase, PlayerData, Stroke, ServerMessage } from '../../../shared/types';
import { useWebSocket } from '../hooks/useWebSocket';
import { WS_URL } from '../lib/constants';

interface SharedScreenProps {
  roomCode?: string;
}

interface SpectatorState {
  phase: GamePhase;
  players: PlayerData[];
  strokes: Stroke[];
  activePlayerId: string | null;
  currentRound: number;
  connected: boolean;
}

export function SharedScreen({ roomCode }: SharedScreenProps) {
  const [state, setState] = useState<SpectatorState>({
    phase: 'LOBBY',
    players: [],
    strokes: [],
    activePlayerId: null,
    currentRound: 0,
    connected: false,
  });

  const { connected, connect, onMessage } = useWebSocket();

  const handleMessage = useCallback((msg: ServerMessage) => {
    setState((prev) => {
      const newState = { ...prev, connected: true };

      switch (msg.type) {
        case 'GAME_STARTING':
          newState.phase = 'ROLE_REVEAL';
          newState.players = msg.players;
          newState.strokes = [];
          newState.currentRound = 1;
          break;

        case 'TURN_START':
          newState.phase = 'DRAWING';
          newState.activePlayerId = msg.activePlayerId;
          newState.currentRound = msg.round;
          break;

        case 'STROKE_BROADCAST':
          newState.strokes = [...prev.strokes, msg.stroke];
          break;

        case 'VOTING_START':
          newState.phase = 'VOTING';
          newState.players = msg.players;
          break;

        case 'IMPOSTER_GUESS_PHASE':
          newState.phase = 'IMPOSTER_GUESS';
          break;

        case 'ROUND_RESULT':
          newState.phase = 'SCOREBOARD';
          newState.players = newState.players.map((player) => ({
            ...player,
            score: msg.result.totalScores[player.id] || player.score,
          }));
          break;

        case 'RETURN_TO_LOBBY':
          newState.phase = 'LOBBY';
          newState.players = msg.players;
          newState.strokes = [];
          newState.activePlayerId = null;
          newState.currentRound = 0;
          break;

        case 'PLAYER_JOINED':
          newState.players = msg.players;
          break;

        case 'PLAYER_LEFT':
          newState.players = msg.players;
          break;
      }

      return newState;
    });
  }, []);

  useEffect(() => {
    onMessage(handleMessage);
  }, [onMessage, handleMessage]);

  // Connect as spectator
  useEffect(() => {
    if (roomCode) {
      connect(WS_URL);
    }
  }, [roomCode, connect]);

  // Update connected state
  useEffect(() => {
    setState((prev) => ({ ...prev, connected }));
  }, [connected]);

  const activePlayer = state.players.find((p) => p.id === state.activePlayerId);

  const getPhaseDisplay = () => {
    switch (state.phase) {
      case 'LOBBY':
        return 'Waiting to Start';
      case 'ROLE_REVEAL':
        return 'Role Reveal';
      case 'DRAWING':
        return 'Drawing Phase';
      case 'VOTING':
        return 'Voting Phase';
      case 'IMPOSTER_GUESS':
        return 'Imposter Guessing';
      case 'SCOREBOARD':
        return 'Round Results';
      default:
        return 'Game';
    }
  };

  return (
    <div
      data-testid="shared-screen"
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
          padding: '2rem',
          backgroundColor: '#1a1a1a',
          borderBottom: '4px solid #333',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            maxWidth: '1200px',
            margin: '0 auto',
          }}
        >
          {/* Room Code */}
          <div>
            <div style={{ fontSize: '0.875rem', color: '#888', marginBottom: '0.25rem' }}>
              Room Code
            </div>
            <div
              style={{
                fontSize: '2rem',
                fontWeight: 'bold',
                letterSpacing: '0.2em',
                color: '#3B82F6',
              }}
            >
              {roomCode || '----'}
            </div>
          </div>

          {/* Phase Indicator */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.875rem', color: '#888', marginBottom: '0.25rem' }}>
              Phase
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{getPhaseDisplay()}</div>
          </div>

          {/* Connection Status */}
          <div style={{ textAlign: 'right' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                backgroundColor: state.connected ? '#1a3a1a' : '#3a1a1a',
                borderRadius: '8px',
              }}
            >
              <div
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  backgroundColor: state.connected ? '#2ECC71' : '#E74C3C',
                }}
              />
              <span style={{ fontSize: '0.875rem' }}>
                {state.connected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
        }}
      >
        {/* Turn Indicator (Drawing Phase) */}
        {state.phase === 'DRAWING' && activePlayer && (
          <div
            style={{
              marginBottom: '1rem',
              fontSize: '2rem',
              fontWeight: 'bold',
              color: activePlayer.color,
              textAlign: 'center',
            }}
          >
            {activePlayer.name}'s Turn
          </div>
        )}

        {/* Canvas */}
        {(state.phase === 'DRAWING' || state.strokes.length > 0) && (
          <div style={{ width: '100%', maxWidth: '900px', aspectRatio: '4/3' }}>
            <Canvas
              color="#fff"
              brushSize={3}
              enabled={false}
              onStrokeComplete={() => {}}
              strokes={state.strokes}
            />
          </div>
        )}

        {/* Lobby Message */}
        {state.phase === 'LOBBY' && state.players.length > 0 && (
          <div style={{ textAlign: 'center', fontSize: '1.5rem', color: '#888' }}>
            <div style={{ marginBottom: '2rem' }}>Waiting for game to start...</div>
            <div style={{ fontSize: '1rem' }}>
              {state.players.length} player{state.players.length !== 1 ? 's' : ''} in lobby
            </div>
          </div>
        )}

        {/* No Connection */}
        {!roomCode && (
          <div style={{ textAlign: 'center', fontSize: '1.5rem', color: '#666' }}>
            No room code provided
          </div>
        )}
      </div>

      {/* Player List Footer */}
      {state.players.length > 0 && state.phase !== 'LOBBY' && (
        <div
          style={{
            padding: '1.5rem 2rem',
            backgroundColor: '#1a1a1a',
            borderTop: '4px solid #333',
          }}
        >
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ fontSize: '0.875rem', color: '#888', marginBottom: '1rem' }}>
              Players
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                gap: '1rem',
              }}
            >
              {state.players.map((player) => (
                <div
                  key={player.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem',
                    backgroundColor:
                      state.activePlayerId === player.id ? '#2a2a2a' : '#1a1a1a',
                    border: `2px solid ${
                      state.activePlayerId === player.id ? player.color : '#333'
                    }`,
                    borderRadius: '8px',
                  }}
                >
                  <div
                    style={{
                      width: '16px',
                      height: '16px',
                      borderRadius: '50%',
                      backgroundColor: player.color,
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: '0.875rem',
                        fontWeight: state.activePlayerId === player.id ? 'bold' : 'normal',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {player.name}
                    </div>
                    {state.phase === 'SCOREBOARD' && (
                      <div style={{ fontSize: '0.75rem', color: '#888' }}>
                        Score: {player.score}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
