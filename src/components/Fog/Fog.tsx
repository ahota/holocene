import React from 'react';
import { COLOR, ANIM_MS } from '../../theme';
import './Fog.css';

/**
 * Drifting fog at the gutters. Each gutter is a narrow masked
 * container (mask is stationary, no per-frame cost) holding a wider
 * noise child that drifts horizontally via `transform: translate3d`
 * (GPU-only animation, no repaint). Honors prefers-reduced-motion to
 * pause the drift.
 */
export default function Fog() {
  return (
    <div
      className="fog-overlay"
      aria-hidden="true"
      style={{
        ['--fog-bg' as string]: COLOR.bg,
        ['--fog-drift' as string]: `${ANIM_MS.fogDrift}ms`,
      }}
    >
      <div className="fog-fade fog-fade-left" />
      <div className="fog-fade fog-fade-right" />
      <div className="fog-gutter fog-gutter-left">
        <div className="fog-noise fog-noise-back" />
        <div className="fog-noise fog-noise-front" />
      </div>
      <div className="fog-gutter fog-gutter-right">
        <div className="fog-noise fog-noise-back" />
        <div className="fog-noise fog-noise-front" />
      </div>
    </div>
  );
}
