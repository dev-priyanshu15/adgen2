import { useEffect, useState } from 'react';

const statusMessages = [
  'Analyzing product…',
  'Crafting headlines…',
  'Generating variations…',
  'Scoring engagement…',
  'Polishing copy…',
  'Almost there…',
];

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message }: LoadingStateProps) {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((i) => (i + 1) % statusMessages.length);
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-20">
      <div
        className="p-12 rounded-lg border"
        style={{
          background: 'var(--surface)',
          borderColor: 'var(--border-raw)',
        }}
      >
        <div className="flex flex-col items-center justify-center gap-6 text-center">
          {/* Glitch brand text */}
          <span
            className="glitch-text"
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 18,
              fontWeight: 700,
              letterSpacing: '0.14em',
              color: 'var(--accent)',
            }}
          >
            ADGENIUS
          </span>

          {/* Progress bar */}
          <div
            style={{
              width: '100%',
              maxWidth: 260,
              height: 2,
              borderRadius: 1,
              background: 'var(--surface2)',
              overflow: 'hidden',
            }}
          >
            <div className="progress-fill" />
          </div>

          {/* Cycling status text */}
          <p
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11,
              letterSpacing: '0.06em',
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              minHeight: 16,
            }}
          >
            {message || statusMessages[msgIndex]}
          </p>
        </div>
      </div>
    </div>
  );
}
