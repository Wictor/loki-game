import { useState, useEffect } from 'react';
import { useGame } from './hooks/useGame';
import { Home } from './pages/Home';
import { Lobby } from './pages/Lobby';
import { RoleReveal } from './pages/RoleReveal';
import { GameBoard } from './pages/GameBoard';
import Voting from './pages/Voting';
import ImposterGuess from './pages/ImposterGuess';
import Scoreboard from './pages/Scoreboard';
import { IMPOSTER_GUESS_DURATION } from '../../shared/types';

export default function App() {
  const {
    state,
    connected,
    createGame,
    joinGame,
    toggleReady,
    startGame,
    submitStroke,
    submitVote,
    submitGuess,
    requestTimeout,
    cancelTimeout,
    nextRound,
    playAgain,
  } = useGame();

  const [hasVoted, setHasVoted] = useState(false);
  const [showRoleReveal, setShowRoleReveal] = useState(true);

  // Reset voting state when entering voting phase
  useEffect(() => {
    if (state.phase === 'VOTING') {
      setHasVoted(false);
    }
  }, [state.phase]);

  // Handle role reveal auto-transition
  useEffect(() => {
    if (state.phase === 'ROLE_REVEAL') {
      setShowRoleReveal(true);
    }
  }, [state.phase]);

  const handleRoleRevealComplete = () => {
    setShowRoleReveal(false);
  };

  const handleVote = (votedPlayerId: string) => {
    if (!hasVoted) {
      submitVote(votedPlayerId);
      setHasVoted(true);
    }
  };

  // Render error banner if present
  const renderError = () => {
    if (!state.error) return null;

    return (
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          backgroundColor: '#991B1B',
          color: '#FEE2E2',
          padding: '1rem',
          textAlign: 'center',
          zIndex: 1000,
          borderBottom: '2px solid #7F1D1D',
        }}
      >
        <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Error</div>
        <div>{state.error}</div>
      </div>
    );
  };

  // Phase-based routing
  const renderPage = () => {
    // No room code = Home page
    if (!state.roomCode) {
      return <Home onCreateGame={createGame} onJoinGame={joinGame} />;
    }

    // LOBBY phase
    if (state.phase === 'LOBBY') {
      return <Lobby state={state} onReady={toggleReady} onStart={startGame} />;
    }

    // ROLE_REVEAL phase
    if (state.phase === 'ROLE_REVEAL' && showRoleReveal) {
      return (
        <RoleReveal
          role={state.role}
          word={state.secretWord}
          onComplete={handleRoleRevealComplete}
        />
      );
    }

    // DRAWING phase (or after role reveal completes)
    if (state.phase === 'DRAWING' || (state.phase === 'ROLE_REVEAL' && !showRoleReveal)) {
      return <GameBoard state={state} onStrokeComplete={submitStroke} />;
    }

    // VOTING phase
    if (state.phase === 'VOTING') {
      return (
        <Voting
          players={state.players}
          currentPlayerId={state.playerId!}
          onVote={handleVote}
          votedPlayerIds={state.votedPlayerIds}
        />
      );
    }

    // IMPOSTER_GUESS phase
    if (state.phase === 'IMPOSTER_GUESS') {
      const isImposter = state.role === 'imposter';

      if (isImposter) {
        return (
          <ImposterGuess
            onGuess={submitGuess}
            timeLimit={IMPOSTER_GUESS_DURATION / 1000}
          />
        );
      } else {
        return (
          <div
            style={{
              minHeight: '100vh',
              backgroundColor: '#1a1a2e',
              color: '#fff',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '2rem',
            }}
          >
            <div style={{ textAlign: 'center', maxWidth: '500px' }}>
              <div style={{ fontSize: '4rem', marginBottom: '2rem' }}>⏳</div>
              <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                Imposter is Guessing
              </h1>
              <p style={{ fontSize: '1.125rem', color: '#aaa' }}>
                The caught imposter is trying to guess the secret word...
              </p>
            </div>
          </div>
        );
      }
    }

    // SCOREBOARD phase
    if (state.phase === 'SCOREBOARD' && state.roundResult) {
      return (
        <Scoreboard
          result={state.roundResult}
          players={state.players}
          playerId={state.playerId}
          winScore={state.winScore}
          timeoutPlayerIds={state.timeoutPlayerIds}
          onRequestTimeout={requestTimeout}
          onCancelTimeout={cancelTimeout}
          onNextRound={nextRound}
          onPlayAgain={playAgain}
          isHost={state.isHost}
        />
      );
    }

    // Fallback
    return (
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: '#111827',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>LOKI</h1>
          <p style={{ color: '#888' }}>
            {connected ? 'Connected' : 'Connecting...'}
          </p>
        </div>
      </div>
    );
  };

  return (
    <>
      {renderError()}
      {renderPage()}
    </>
  );
}
