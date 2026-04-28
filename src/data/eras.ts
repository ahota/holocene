import { TODAY_HE } from '../constants';

export interface Era {
  name: string;
  /** Inclusive HE start year. */
  start: number;
  /** Exclusive HE end year. */
  end: number;
}

/**
 * Era spans rendered as faint horizontal bands behind the timeline
 * rule. Boundaries use Near-Eastern conventional dates as canonical
 * (the band is for orientation, not historiographical truth).
 * Information era end tracks today via the canonical TODAY_HE.
 */
export const ERAS: Era[] = [
  { name: 'Stone Age', start: 0, end: 5000 },
  { name: 'Copper Age', start: 5000, end: 6700 },
  { name: 'Bronze Age', start: 6700, end: 8800 },
  { name: 'Iron Age', start: 8800, end: 9500 },
  { name: 'Classical Antiquity', start: 9500, end: 10500 },
  { name: 'Middle Ages', start: 10500, end: 11400 },
  { name: 'Early Modern', start: 11400, end: 11760 },
  { name: 'Industrial', start: 11760, end: 11970 },
  { name: 'Information', start: 11970, end: TODAY_HE },
];
