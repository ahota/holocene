import React, { useState } from 'react';
import Odometer from './components/Odometer/Odometer';

/**
 * Main application component managing the initial reveal sequence
 * and Holocene timeline state.
 */
export default function App() {
  const [revealDone, setRevealDone] = useState(false);

  return (
    <div
      className="app"
      style={{
        backgroundColor: '#000',
        color: '#fff',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <h1
        style={{
          fontWeight: 300,
          marginBottom: '2rem',
          letterSpacing: '0.1rem',
          textTransform: 'lowercase',
          color: '#888',
        }}
      >
        the year is
      </h1>
      <Odometer
        targetYear={12026}
        initialYear={2026}
        onComplete={() => setRevealDone(true)}
      />
      {revealDone && (
        <div
          style={{
            marginTop: '2rem',
            opacity: 0.5,
            transition: 'opacity 1s ease-in',
            fontFamily: 'monospace',
          }}
        >
          human era (HE)
        </div>
      )}
    </div>
  );
}
