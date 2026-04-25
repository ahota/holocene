/**
 * Shared visual tokens. Use these in lieu of inline color or duration literals
 * so the palette and motion stay coherent across components.
 */

export const COLOR = {
  bg: '#000',
  fg: '#fff',
  muted: '#888',     // headings/labels (60% emphasis)
  body: '#aaa',      // secondary body text
  dim: '#666',       // tertiary / hint text
  border: '#333',    // 1px hairlines
  surface: '#111',   // popup background
} as const;

export const SHADOW = {
  popup: '0 10px 30px rgba(0,0,0,0.5)',
} as const;

export const ANIM_MS = {
  popup: 200,
  reveal: 1000,
  fadeIn: 1500,
} as const;

export const Z = {
  reveal: 10,
  popup: 100,
} as const;
