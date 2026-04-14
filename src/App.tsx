import React, { useState } from 'react';
import Odometer from './components/Odometer/Odometer';
import TimelineCanvas from './components/Timeline/TimelineCanvas';
import ZoomSlider from './components/ZoomSlider/ZoomSlider';
import { useTimeline } from './components/Timeline/useTimeline';

/**
 * Main application component managing the initial reveal sequence
 * and Holocene timeline state.
 */
export default function App() {
  const [revealDone, setRevealDone] = useState(false);
  const { centerYear, zoom, setZoom, scroll, zoomDelta, zoomTo } = useTimeline(12026.3);

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
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {!revealDone ? (
        <>
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
        </>
      ) : (
        <div
          style={{
            width: '100%',
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'fadeIn 1s ease-out',
          }}
        >
          <div
            style={{
              position: 'fixed',
              top: '10%',
              textAlign: 'center',
            }}
          >
            <h1 style={{ fontWeight: 300, fontSize: '1rem', color: '#888' }}>
              the year is
            </h1>
            <div style={{ fontSize: '4rem', fontWeight: 800 }}>12026</div>
          </div>

          <TimelineCanvas
            centerYear={centerYear}
            zoom={zoom}
            onScroll={scroll}
            onZoom={zoomDelta}
            onZoomTo={zoomTo}
          />

          <ZoomSlider zoom={zoom} onZoomChange={(z) => setZoom(z)} />
          
          <div
            style={{
              position: 'fixed',
              bottom: '20px',
              opacity: 0.3,
              fontFamily: 'monospace',
              fontSize: '0.7rem',
            }}
          >
            scroll or drag to explore the past
          </div>
        </div>
      )}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
