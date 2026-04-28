/**
 * Shared visual tokens. Use these in lieu of inline color or duration
 * literals so the palette and motion stay coherent across components.
 */

export const COLOR = {
  // page surfaces
  bg: '#15130f',
  bgReveal: '#000000',
  surface: '#2a2620',

  // text
  text: '#c9c3b4',
  muted: '#7a7466',
  dim: '#5a544a',

  // accents
  bronze: '#b88a4a',
  bronzeGlow: 'rgba(184,138,74,0.4)',
  verdigris: '#6a857d',

  // structure
  hairline: '#2c2a25',
  eraBandBg: '#1a1916',

  // placard
  placardTitle: '#d8d0bd',
  placardBody: '#b3ad9d',
  placardYear: '#8a8275',

} as const;

export const SHADOW = {
  popup:
    '0 8px 28px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.05)',
} as const;

export const ANIM_MS = {
  popup: 200,
  reveal: 1000,
  fadeIn: 1500,
  fogDrift: 50000,
} as const;

export const Z = {
  reveal: 10,
  popup: 100,
} as const;
