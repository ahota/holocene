export interface Era {
  name: string;
  /** Inclusive HE start year. */
  start: number;
  /** Exclusive HE end year. */
  end: number;
}

/**
 * Era spans rendered as faint horizontal bands behind the timeline
 * rule. The next spec (events curation) populates this list by
 * converting the existing "begin/end" pair events into eras.
 */
export const ERAS: Era[] = [];
