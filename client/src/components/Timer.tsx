import { useEffect, useState, useRef } from 'react';

interface TimerProps {
  duration: number; // ms
  onComplete: () => void;
  label?: string;
}

export function Timer({ duration, onComplete, label }: TimerProps) {
  const startTimeRef = useRef(Date.now());
  const [remaining, setRemaining] = useState(duration);
  const completedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    startTimeRef.current = Date.now();
    completedRef.current = false;
    setRemaining(duration);

    const tick = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const left = Math.max(0, duration - elapsed);
      setRemaining(left);

      if (left <= 0 && !completedRef.current) {
        completedRef.current = true;
        onCompleteRef.current();
      }
    };

    const interval = setInterval(tick, 100);

    return () => clearInterval(interval);
  }, [duration]);

  const seconds = Math.ceil(remaining / 1000);
  const percentage = (remaining / duration) * 100;

  // Color transitions: green -> yellow -> red
  let color = '#2ECC71'; // green
  if (percentage < 30) {
    color = '#E74C3C'; // red
  } else if (percentage < 60) {
    color = '#F39C12'; // yellow/orange
  }

  return (
    <div data-testid="timer" style={{ textAlign: 'center', padding: '1rem' }}>
      {label && (
        <div style={{ fontSize: '0.875rem', color: '#888', marginBottom: '0.5rem' }}>
          {label}
        </div>
      )}

      {/* Circular progress */}
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <svg width="80" height="80" viewBox="0 0 80 80">
          {/* Background circle */}
          <circle
            cx="40"
            cy="40"
            r="35"
            fill="none"
            stroke="#333"
            strokeWidth="6"
          />
          {/* Progress circle */}
          <circle
            cx="40"
            cy="40"
            r="35"
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 35}`}
            strokeDashoffset={`${2 * Math.PI * 35 * (1 - percentage / 100)}`}
            transform="rotate(-90 40 40)"
            style={{ transition: 'stroke 0.3s ease' }}
          />
        </svg>

        {/* Seconds in center */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color,
            transition: 'color 0.3s ease',
          }}
        >
          {seconds}
        </div>
      </div>

      {/* Progress bar below */}
      <div
        style={{
          width: '100%',
          maxWidth: '200px',
          height: '6px',
          backgroundColor: '#333',
          borderRadius: '3px',
          overflow: 'hidden',
          margin: '0.5rem auto 0',
        }}
      >
        <div
          style={{
            width: `${percentage}%`,
            height: '100%',
            backgroundColor: color,
            transition: 'width 0.1s linear, background-color 0.3s ease',
          }}
        />
      </div>
    </div>
  );
}
