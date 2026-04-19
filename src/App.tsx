import React, { useState, useCallback, useRef } from 'react';
import Odometer from './components/Odometer/Odometer';
import TimelineCanvas from './components/Timeline/TimelineCanvas';
import ZoomSlider from './components/ZoomSlider/ZoomSlider';
import { useTimeline } from './components/Timeline/useTimeline';
import { currentHEYear } from './utils/math';
import { HistoryEvent } from './data/events';

/**
 * Main application component managing the initial reveal sequence
 * and Holocene timeline state.
 */
export default function App() {
  const [revealDone, setRevealDone] = useState(false);
  const [initialHE] = useState(() => Math.floor(currentHEYear()));
  const { centerYear, zoom, setZoom, scroll, zoomDelta, zoomTo, TODAY, INNER_BOUND } = useTimeline(currentHEYear());

  // Popup state management for smooth entry/exit animations
  const [displayedEvent, setDisplayedEvent] = useState<{ event: HistoryEvent; x: number } | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const dismissTimerRef = useRef<number | null>(null);

  const handleEventClick = useCallback((event: HistoryEvent, x: number) => {
    if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
    setDisplayedEvent({ event, x });
    setShowPopup(true);
  }, []);

  const handleDismiss = useCallback(() => {
    if (!showPopup) return;
    setShowPopup(false);
    dismissTimerRef.current = window.setTimeout(() => {
      setDisplayedEvent(null);
    }, 200); // Matches the animation duration
  }, [showPopup]);

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
      onClick={handleDismiss}
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
          <div 
            style={{ position: 'relative', width: '100%' }}
            onClick={(e) => e.stopPropagation()}
          >
            <TimelineCanvas
              centerYear={centerYear}
              zoom={zoom}
              onScroll={(dx, sw) => {
                scroll(dx, sw);
                handleDismiss();
              }}
              onZoom={(d, zc, sw) => {
                zoomDelta(d, zc, sw);
                handleDismiss();
              }}
              onZoomTo={(tz, zc, sw) => {
                zoomTo(tz, zc, sw);
                handleDismiss();
              }}
              todayHE={TODAY}
              margin={INNER_BOUND}
              onEventClick={handleEventClick}
            />

            {displayedEvent && (
              <div
                style={{
                  position: 'absolute',
                  left: displayedEvent.x,
                  top: '50%',
                  transform: 'translate(-50%, -100%) translateY(-20px)',
                  backgroundColor: '#111',
                  border: '1px solid #333',
                  padding: '1rem',
                  width: 'min(280px, 80vw)',
                  zIndex: 100,
                  boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                  animation: `${showPopup ? 'popIn' : 'popOut'} 0.2s ease-out forwards`,
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div style={{ fontWeight: 800, fontSize: '0.9rem', marginBottom: '0.5rem', color: '#fff' }}>
                  {displayedEvent.event.title}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#aaa', lineHeight: 1.4 }}>
                  {displayedEvent.event.description}
                </div>
                <div style={{ marginTop: '0.8rem', fontSize: '0.7rem', color: '#666', fontFamily: 'monospace' }}>
                  Year: {Math.floor(displayedEvent.event.isToday ? TODAY : displayedEvent.event.year)} HE
                </div>
                <div style={{
                  position: 'absolute',
                  bottom: '-6px',
                  left: '50%',
                  transform: 'translateX(-50%) rotate(45deg)',
                  width: '10px',
                  height: '10px',
                  backgroundColor: '#111',
                  borderRight: '1px solid #333',
                  borderBottom: '1px solid #333',
                }} />
              </div>
            )}
          </div>

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
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes popIn {
          from { opacity: 0; transform: translate(-50%, -100%) translateY(-10px) scale(0.95); }
          to { opacity: 1; transform: translate(-50%, -100%) translateY(-20px) scale(1); }
        }
        @keyframes popOut {
          from { opacity: 1; transform: translate(-50%, -100%) translateY(-20px) scale(1); }
          to { opacity: 0; transform: translate(-50%, -100%) translateY(-10px) scale(0.95); }
        }
      `}</style>
    </div>
  );
}
