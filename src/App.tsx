import React, { useState, useCallback, useRef, useEffect } from 'react';
import Odometer from './components/Odometer/Odometer';
import TimelineCanvas from './components/Timeline/TimelineCanvas';
import ZoomSlider from './components/ZoomSlider/ZoomSlider';
import { useTimeline } from './components/Timeline/useTimeline';
import { useEventLoader } from './hooks/useEventLoader';
import { currentHEYear, worldToScreen } from './utils/math';
import { HistoryEvent } from './data/events';
import { CANVAS_HEIGHT_PX } from './constants';
import { COLOR, SHADOW, ANIM_MS, Z } from './theme';

export default function App() {
  const [revealDone, setRevealDone] = useState(false);
  const [initialHE] = useState(() => Math.floor(currentHEYear()));
  const { centerYear, zoom, setZoom, scroll, zoomDelta, zoomTo, TODAY, INNER_BOUND } = useTimeline(currentHEYear());
  const events = useEventLoader(centerYear, zoom, window.innerWidth, INNER_BOUND);

  const [selectedEvent, setSelectedEvent] = useState<HistoryEvent | null>(null);
  const [popupAnchor, setPopupAnchor] = useState<{ year: number, yOffset: number, xOffset: number, baseY: number } | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const dismissTimerRef = useRef<number | null>(null);
  const timelineWrapperRef = useRef<HTMLDivElement | null>(null);

  const handleEventClick = useCallback((event: HistoryEvent, year: number, yOffset: number, xOffset: number) => {
    if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
    const baseY = timelineWrapperRef.current?.getBoundingClientRect().top ?? 0;
    setSelectedEvent(event);
    setPopupAnchor({ year, yOffset, xOffset, baseY });
    setShowPopup(true);
  }, []);

  const handleDismiss = useCallback(() => {
    if (!showPopup) return;
    setShowPopup(false);
    dismissTimerRef.current = window.setTimeout(() => {
      setSelectedEvent(null);
      setPopupAnchor(null);
    }, ANIM_MS.popup);
  }, [showPopup]);

  const sw = window.innerWidth;
  const effectiveWidth = sw - 2 * INNER_BOUND;
  const popupX = popupAnchor ? worldToScreen(popupAnchor.year, centerYear, zoom, effectiveWidth) + INNER_BOUND + popupAnchor.xOffset : 0;
  const popupY = popupAnchor ? popupAnchor.baseY + CANVAS_HEIGHT_PX / 2 + popupAnchor.yOffset : 0;
  const popupWidth = 280;
  const clampedX = Math.max(popupWidth / 2 + 10, Math.min(window.innerWidth - popupWidth / 2 - 10, popupX));

  useEffect(() => {
    if (showPopup && (popupX < 20 || popupX > window.innerWidth - 20)) {
      handleDismiss();
    }
  }, [popupX, showPopup, handleDismiss]);

  return (
    <div
      className="app"
      style={{ backgroundColor: COLOR.bg, color: COLOR.fg, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}
      onPointerDown={() => handleDismiss()}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', transition: `all ${ANIM_MS.reveal}ms ease-in-out`, transform: revealDone ? 'translateY(-25vh)' : 'translateY(0)', position: 'relative', zIndex: Z.reveal, pointerEvents: revealDone ? 'none' : 'auto' }}>
        <h1 style={{ fontWeight: 300, marginBottom: '2rem', letterSpacing: '0.1rem', textTransform: 'lowercase', color: COLOR.muted, fontSize: '1rem' }}>the year is</h1>
        <Odometer targetYear={initialHE} initialYear={new Date().getFullYear()} onComplete={() => setRevealDone(true)} />
        <div style={{ marginTop: '2rem', opacity: revealDone ? 0.5 : 0, transition: `opacity ${ANIM_MS.reveal}ms ease-in`, fontFamily: 'monospace', fontSize: '0.8rem', letterSpacing: '2px' }}>human era (HE)</div>
      </div>

      {revealDone && (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', animation: `fadeIn ${ANIM_MS.fadeIn}ms ease-out forwards` }}>
          <div ref={timelineWrapperRef} style={{ position: 'relative', width: '100%', margin: '2rem 0' }} onPointerDown={(e) => e.stopPropagation()}>
            <TimelineCanvas
              centerYear={centerYear}
              zoom={zoom}
              events={events}
              onScroll={scroll}
              onZoom={zoomDelta}
              onZoomTo={zoomTo}
              todayHE={TODAY}
              margin={INNER_BOUND}
              onEventClick={handleEventClick}
            />
          </div>
          <ZoomSlider zoom={zoom} onZoomChange={setZoom} todayHE={TODAY} margin={INNER_BOUND} />
          <div style={{ position: 'fixed', bottom: '20px', opacity: 0.3, fontFamily: 'monospace', fontSize: '0.7rem', pointerEvents: 'none' }}>scroll or drag to explore the past</div>
        </div>
      )}

      {selectedEvent && (
        <div
          style={{
            position: 'absolute',
            left: clampedX,
            top: popupY,
            transform: 'translate(-50%, -100%) translateY(-10px)',
            backgroundColor: COLOR.surface,
            border: `1px solid ${COLOR.border}`,
            padding: '1rem',
            width: `${popupWidth}px`,
            zIndex: Z.popup,
            boxShadow: SHADOW.popup,
            animation: `${showPopup ? 'popIn' : 'popOut'} ${ANIM_MS.popup}ms ease-out forwards`,
            pointerEvents: 'auto',
          }}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <div style={{ fontWeight: 800, fontSize: '0.9rem', marginBottom: '0.5rem', color: COLOR.fg }}>{selectedEvent.title}</div>
          <div style={{ fontSize: '0.75rem', color: COLOR.body, lineHeight: 1.4 }}>{selectedEvent.description}</div>
          <div style={{ marginTop: '0.8rem', fontSize: '0.7rem', color: COLOR.dim, fontFamily: 'monospace' }}>Year: {Math.floor(selectedEvent.isToday ? TODAY : selectedEvent.year)} HE</div>
          <div style={{
            position: 'absolute',
            bottom: '-6px',
            left: `calc(50% + ${popupX - clampedX}px)`,
            transform: 'translateX(-50%) rotate(45deg)',
            width: '10px',
            height: '10px',
            backgroundColor: COLOR.surface,
            borderRight: `1px solid ${COLOR.border}`,
            borderBottom: `1px solid ${COLOR.border}`,
            display: Math.abs(popupX - clampedX) > popupWidth / 2 - 5 ? 'none' : 'block'
          }} />
        </div>
      )}
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes popIn {
          from { opacity: 0; transform: translate(-50%, -100%) translateY(0px) scale(0.95); }
          to { opacity: 1; transform: translate(-50%, -100%) translateY(-10px) scale(1); }
        }
        @keyframes popOut {
          from { opacity: 1; transform: translate(-50%, -100%) translateY(-10px) scale(1); }
          to { opacity: 0; transform: translate(-50%, -100%) translateY(0px) scale(0.95); }
        }
      `}</style>
    </div>
  );
}
