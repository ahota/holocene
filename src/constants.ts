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
