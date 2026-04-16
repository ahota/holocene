import React from 'react';

interface Props {
  zoom: number;
  onZoomChange: (zoom: number, screenWidth: number) => void;
  todayHE: number;
}

/**
 * Logarithmic zoom slider with dynamic range based on screen width and epoch length.
 */
export default function ZoomSlider({ zoom, onZoomChange, todayHE }: Props) {
  // Mapping 0-100 to a range of pixels per year
  const screenWidth = window.innerWidth;
  const minZoom = screenWidth / todayHE; // Zoom out to see exactly the full range
  const maxZoom = 1000;

  const toSliderValue = (z: number) => {
    return (
      (Math.log(Math.max(z, minZoom)) - Math.log(minZoom)) /
      (Math.log(maxZoom) - Math.log(minZoom))
    ) * 100;
  };

  const fromSliderValue = (v: number) => {
    return Math.exp(
      Math.log(minZoom) +
        (v / 100) * (Math.log(maxZoom) - Math.log(minZoom))
    );
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '40px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'min(300px, 80%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '10px',
      }}
    >
      <input
        type="range"
        min="0"
        max="100"
        value={toSliderValue(zoom)}
        onChange={(e) => onZoomChange(fromSliderValue(parseFloat(e.target.value)), screenWidth)}
        style={{ width: '100%', accentColor: '#fff', cursor: 'pointer' }}
      />
      <div style={{ fontSize: '0.7rem', color: '#666', fontFamily: 'monospace' }}>
        zoom
      </div>
    </div>
  );
}
