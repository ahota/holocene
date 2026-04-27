import React from 'react';
import { MAX_ZOOM } from '../../constants';
import { COLOR } from '../../theme';

interface Props {
  zoom: number;
  onZoomChange: (zoom: number, screenWidth: number) => void;
  todayHE: number;
  margin: number;
}

const MIN_ZOOM_FLOOR = 0.01;

/**
 * Logarithmic zoom slider with dynamic range based on screen width,
 * margins, and epoch length.
 */
export default function ZoomSlider({ zoom, onZoomChange, todayHE, margin }: Props) {
  const screenWidth = window.innerWidth;
  const effectiveWidth = screenWidth - 2 * margin;
  const minZoom = Math.max(MIN_ZOOM_FLOOR, effectiveWidth / todayHE);
  const maxZoom = MAX_ZOOM;

  const toSliderValue = (z: number) =>
    ((Math.log(Math.max(z, minZoom)) - Math.log(minZoom)) /
      (Math.log(maxZoom) - Math.log(minZoom))) * 100;

  const fromSliderValue = (v: number) =>
    Math.exp(Math.log(minZoom) + (v / 100) * (Math.log(maxZoom) - Math.log(minZoom)));

  return (
    <div style={{
      position: 'fixed',
      bottom: '40px',
      left: '50%',
      transform: 'translateX(-50%)',
      width: 'min(300px, 80%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '10px',
    }}>
      <input
        type="range"
        min="0"
        max="100"
        value={toSliderValue(zoom)}
        onChange={(e) => onZoomChange(fromSliderValue(parseFloat(e.target.value)), screenWidth)}
        className="zoom-slider"
      />
      <div style={{
        fontSize: '0.6rem',
        color: COLOR.muted,
        fontFamily: '"JetBrains Mono", ui-monospace, monospace',
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
      }}>zoom</div>

      <style>{`
        .zoom-slider {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          height: 2px;
          background: ${COLOR.hairline};
          border-radius: 1px;
          outline: none;
          cursor: pointer;
        }
        .zoom-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 11px;
          height: 11px;
          border-radius: 50%;
          background: ${COLOR.bronze};
          box-shadow: 0 0 10px ${COLOR.bronzeGlow};
          cursor: pointer;
          border: none;
        }
        .zoom-slider::-moz-range-thumb {
          width: 11px;
          height: 11px;
          border-radius: 50%;
          background: ${COLOR.bronze};
          box-shadow: 0 0 10px ${COLOR.bronzeGlow};
          cursor: pointer;
          border: none;
        }
        .zoom-slider::-moz-range-track {
          background: ${COLOR.hairline};
          height: 2px;
          border-radius: 1px;
        }
      `}</style>
    </div>
  );
}
