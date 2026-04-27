import React from 'react';
import { COLOR, ANIM_MS } from '../../theme';
import './Fog.css';

/**
 * Drifting textured fog at the gutters. Sits above the timeline canvas
 * but below any open placard. Uses an SVG `feTurbulence` noise baked
 * into a data URL for the texture; honors prefers-reduced-motion to
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
      <div className="fog-noise" />
    </div>
  );
}
