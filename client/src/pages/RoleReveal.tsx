import { useEffect } from 'react';
import { Role, ROLE_REVEAL_DURATION } from '../../../shared/types';

interface RoleRevealProps {
  role: Role | null;
  word: string | null;
  onComplete: () => void;
}

export function RoleReveal({ role, word, onComplete }: RoleRevealProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, ROLE_REVEAL_DURATION);

    return () => clearTimeout(timer);
  }, [onComplete]);

  const isArtist = role === 'artist';
  const bgColor = isArtist ? '#1a3a1a' : '#3a1a1a';
  const primaryColor = isArtist ? '#2ECC71' : '#E74C3C';
  const roleText = isArtist ? 'Artist' : 'IMPOSTER';
  const displayWord = isArtist ? word : '???';

  return (
    <div
      data-testid="role-reveal"
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: bgColor,
        padding: '2rem',
        animation: 'fadeIn 0.5s ease-in',
      }}
    >
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: scale(0.9); }
            to { opacity: 1; transform: scale(1); }
          }
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }
        `}
      </style>

      <h1
        style={{
          fontSize: '2rem',
          color: '#888',
          marginBottom: '2rem',
          textAlign: 'center',
        }}
      >
        Your Role
      </h1>

      <div
        style={{
          textAlign: 'center',
          animation: 'pulse 2s ease-in-out infinite',
        }}
      >
        <div
          style={{
            fontSize: '4rem',
            fontWeight: 'bold',
            color: primaryColor,
            marginBottom: '2rem',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            textShadow: `0 0 20px ${primaryColor}40`,
          }}
        >
          {roleText}
        </div>

        <div
          style={{
            fontSize: '3rem',
            fontWeight: 'bold',
            color: isArtist ? '#fff' : '#666',
            padding: '1rem 2rem',
            backgroundColor: isArtist ? '#2a4a2a' : '#4a2a2a',
            borderRadius: '12px',
            border: `3px solid ${primaryColor}`,
            minWidth: '200px',
            letterSpacing: displayWord === '???' ? '0.2em' : 'normal',
          }}
        >
          {displayWord}
        </div>
      </div>

      {isArtist && (
        <p
          style={{
            marginTop: '2rem',
            color: '#aaa',
            fontSize: '1.125rem',
            textAlign: 'center',
          }}
        >
          Draw this word without being too obvious!
        </p>
      )}

      {!isArtist && (
        <p
          style={{
            marginTop: '2rem',
            color: '#aaa',
            fontSize: '1.125rem',
            textAlign: 'center',
          }}
        >
          Blend in and figure out the secret word!
        </p>
      )}

      <div
        style={{
          marginTop: '3rem',
          fontSize: '0.875rem',
          color: '#666',
        }}
      >
        Game starting in {Math.ceil(ROLE_REVEAL_DURATION / 1000)}s...
      </div>
    </div>
  );
}
