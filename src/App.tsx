import React, { useState } from 'react';
import Odometer from './components/Odometer/Odometer';
import TimelineCanvas from './components/Timeline/TimelineCanvas';
import ZoomSlider from './components/ZoomSlider/ZoomSlider';
import { useTimeline } from './components/Timeline/useTimeline';
import { currentHEYear } from './utils/math';

/**
 * Main application component managing the initial reveal sequence
 * and Holocene timeline state.
 */
export default function App() {
  const [revealDone, setRevealDone] = useState(false);
  const [initialHE] = useState(() => Math.floor(currentHEYear()));
  const { centerYear, zoom, setZoom, scroll, zoomDelta, zoomTo, TODAY, INNER_BOUND } = useTimeline(currentHEYear());

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
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 1s ease-in-out',
          transform: revealDone ? 'translateY(-25vh)' : 'translateY(0)',
          position: 'relative',
          zIndex: 10,
        }}
      >
        <h1
          style={{
            fontWeight: 300,
            marginBottom: '2rem',
            letterSpacing: '0.1rem',
            textTransform: 'lowercase',
            color: '#888',
            fontSize: '1rem',
          }}
        >
          the year is
        </h1>
        <Odometer
          targetYear={initialHE}
          initialYear={new Date().getFullYear()}
          onComplete={() => setRevealDone(true)}
        />
        <div
          style={{
            marginTop: '2rem',
            opacity: revealDone ? 0.5 : 0,
            transition: 'opacity 1s ease-in',
            fontFamily: 'monospace',
            fontSize: '0.8rem',
            letterSpacing: '2px',
          }}
        >
          human era (HE)
        </div>
      </div>

      {revealDone && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'fadeIn 1.5s ease-out forwards',
          }}
        >
          <TimelineCanvas
            centerYear={centerYear}
            zoom={zoom}
            onScroll={scroll}
            onZoom={zoomDelta}
            onZoomTo={zoomTo}
            todayHE={TODAY}
            margin={INNER_BOUND}
          />

          <ZoomSlider zoom={zoom} onZoomChange={setZoom} todayHE={TODAY} margin={INNER_BOUND} />

          <div
            style={{
              position: 'fixed',
              bottom: '20px',
              opacity: 0.3,
              fontFamily: 'monospace',
              fontSize: '0.7rem',
              pointerEvents: 'none',
            }}
          >
            scroll or drag to explore the past
          </div>
        </div>
      )}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
