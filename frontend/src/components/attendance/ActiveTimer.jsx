import React, { useState, useEffect } from 'react';

export default function ActiveTimer({ clockInTime }) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (!clockInTime) {
      setElapsedSeconds(0);
      return;
    }

    const calculateElapsed = () => {
      const start = new Date(clockInTime).getTime();
      const now = Date.now();
      const diff = Math.max(0, Math.floor((now - start) / 1000));
      setElapsedSeconds(diff);
    };

    calculateElapsed();
    const interval = setInterval(calculateElapsed, 1000);

    return () => clearInterval(interval);
  }, [clockInTime]);

  const hours = String(Math.floor(elapsedSeconds / 3600)).padStart(2, '0');
  const minutes = String(Math.floor((elapsedSeconds % 3600) / 60)).padStart(2, '0');
  const seconds = String(elapsedSeconds % 60).padStart(2, '0');

  const formattedTime = `${hours}:${minutes}:${seconds}`;

  return (
    <span
      data-testid="timer-active-session"
      id="timer-active-session"
      style={{
        fontFamily: 'monospace',
        fontWeight: 700,
        fontSize: '1.75rem',
        letterSpacing: '0.08em',
        color: 'var(--accent-emerald)',
        textShadow: '0 0 12px rgba(16, 185, 129, 0.4)'
      }}
    >
      {formattedTime}
    </span>
  );
}
