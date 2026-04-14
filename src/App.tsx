import React from 'react';

export default function App() {
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
      <h1 style={{ fontWeight: 300, marginBottom: '2rem' }}>the year is</h1>
      <div style={{ fontSize: '4rem', fontWeight: 'bold' }}>2026</div>
    </div>
  );
}
