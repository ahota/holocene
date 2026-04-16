import React from 'react';

interface Props {
  zoom: number;
  onZoomChange: (zoom: number, screenWidth: number) => void;
}

/**
 * Logarithmic zoom slider to navigate from 1 year/screen to 12,026 years/screen.
 */
export default function ZoomSlider({ zoom, onZoomChange }: Props) {
  // Use a logarithmic scale for the slider (0 to 100 range)
  // Mapping 0-100 to a range of pixels per year
  const minZoom = 0.05; // Slightly less than 1280 / 12026
  const maxZoom = 1000;

  const toSliderValue = (z: number) => {
    return (
      (Math.log(z) - Math.log(minZoom)) /
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
        width: '300px',
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
        onChange={(e) => onZoomChange(fromSliderValue(parseFloat(e.target.value)), window.innerWidth)}
        style={{ width: '100%', accentColor: '#fff', cursor: 'pointer' }}
      />
      <div style={{ fontSize: '0.7rem', color: '#666', fontFamily: 'monospace' }}>
        zoom
      </div>
    </div>
  );
}
