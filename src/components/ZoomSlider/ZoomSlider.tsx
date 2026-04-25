import React from 'react';
import { MAX_ZOOM } from '../../constants';

interface Props {
  zoom: number;
  onZoomChange: (zoom: number, screenWidth: number) => void;
  todayHE: number;
  margin: number;
}

const MIN_ZOOM_FLOOR = 0.01;

/**
 * Logarithmic zoom slider with dynamic range based on screen width, margins, and epoch length.
 */
export default function ZoomSlider({ zoom, onZoomChange, todayHE, margin }: Props) {
  const screenWidth = window.innerWidth;
  const effectiveWidth = screenWidth - 2 * margin;
  const minZoom = Math.max(MIN_ZOOM_FLOOR, effectiveWidth / todayHE);
  const maxZoom = MAX_ZOOM;

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
