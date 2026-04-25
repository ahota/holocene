import { currentHEYear } from './utils/math';

export const MARGIN_UNIT = 32;
export const LABEL_PADDING = 24;

/**
 * Returns the absolute inner boundary where markers are 100% opaque.
 */
export function getInnerBound(screenWidth: number): number {
  const scale = screenWidth < 600 ? 1 : 1.2;
  return (MARGIN_UNIT * 2 * scale) + LABEL_PADDING;
}

export const TODAY_HE = currentHEYear();

export const EPOCH_START = 0;
export const INITIAL_ZOOM = 10;
export const MAX_ZOOM = 1000;

export const CHUNK_SIZE = 2000;
// Largest chunk start year that could contain events. Derived from today so
// adding events past 14000 HE (in CE 4000+) extends coverage automatically.
export const MAX_CHUNK_START = Math.floor(TODAY_HE / CHUNK_SIZE) * CHUNK_SIZE;
