import { HistoryEvent } from '../data/events';

export interface AssignedEvent extends HistoryEvent {
  level: number;
}

// Single source of truth for label drawing/hit-test geometry. All offsets are
// measured from the marker (x = marker.x, y = canvas baseline = height/2).
const CONNECTOR_X = 12;
const TEXT_X = 20;
const BRACKET_TOP_OFFSET = -10;
const BRACKET_BOTTOM_NO_YEAR = 4;
const BRACKET_BOTTOM_WITH_YEAR = 16;
const CENTER_Y_NO_YEAR = -2;
const CENTER_Y_WITH_YEAR = 4;
const YEAR_BASELINE_OFFSET = 12;
const HIT_TOP_OFFSET = -12;
const HIT_LEFT_GAP = 8;
const HIT_RIGHT_PAD = 10;
const LABEL_HEIGHT_NO_YEAR = 16;
const LABEL_HEIGHT_WITH_YEAR = 32;

export interface LabelGeometry {
  /** Y offset (from baseline) where the leader meets the horizontal connector. */
  centerYOffset: number;
  /** X offset (from marker x) for the vertical bracket / connector hinge. */
  connectorX: number;
  /** Y offsets (from baseline) for the top and bottom of the vertical bracket. */
  bracketTop: number;
  bracketBottom: number;
  /** X offset (from marker x) for the title and year text. */
  textX: number;
  /** Y offset (from baseline) for the title baseline. */
  titleY: number;
  /** Y offset for the year baseline (null when no year is drawn). */
  yearY: number | null;
  /** Hit rectangle relative to (markerX, baseline). */
  hitRect: { x: number; y: number; w: number; h: number };
}

/** True when the year line should appear under the title. */
export function shouldShowYear(zoom: number, isToday: boolean): boolean {
  return zoom > 1 || isToday;
}

/**
 * Computes label geometry for a given level. `textWidth` is the max of the
 * title and year measurements at the appropriate font.
 */
export function getLabelGeometry(level: number, hasYear: boolean, textWidth: number): LabelGeometry {
  return {
    centerYOffset: level + (hasYear ? CENTER_Y_WITH_YEAR : CENTER_Y_NO_YEAR),
    connectorX: CONNECTOR_X,
    bracketTop: level + BRACKET_TOP_OFFSET,
    bracketBottom: level + (hasYear ? BRACKET_BOTTOM_WITH_YEAR : BRACKET_BOTTOM_NO_YEAR),
    textX: TEXT_X,
    titleY: level,
    yearY: hasYear ? level + YEAR_BASELINE_OFFSET : null,
    hitRect: {
      x: CONNECTOR_X,
      y: level + HIT_TOP_OFFSET,
      w: HIT_LEFT_GAP + textWidth + HIT_RIGHT_PAD,
      h: hasYear ? LABEL_HEIGHT_WITH_YEAR : LABEL_HEIGHT_NO_YEAR,
    },
  };
}

/**
 * Calculates stable vertical levels for event labels to prevent overlapping.
 * 
 * Stability is achieved by:
 * 1. Sorting events by importance and year (independent of visibility).
 * 2. Using absolute year-based coordinates for collision detection (independent of scroll).
 * 3. Processing all events in the provided list.
 */
export function calculateLabelLevels(
  events: HistoryEvent[],
  zoom: number,
  todayHE: number,
  measureText: (text: string, isToday: boolean) => number,
  minPadding: number,
  levels: number[]
): Map<HistoryEvent, number> {
  const assignments = new Map<HistoryEvent, number>();
  
  // 1. Sort by Priority (isToday, Importance) and then Year for stability
  const sorted = [...events].sort((a, b) => {
    // Today always comes first
    const aIsToday = a.isToday || (a.year >= todayHE);
    const bIsToday = b.isToday || (b.year >= todayHE);
    if (aIsToday && !bIsToday) return -1;
    if (!aIsToday && bIsToday) return 1;

    // Then Importance (lower number = higher priority)
    if (a.importance !== b.importance) {
      return a.importance - b.importance;
    }

    // Then Year
    return a.year - b.year;
  });

  // Track occupied ranges per level: [startYearSpace, endYearSpace]
  // We work in "year * zoom" space which is equivalent to pixels but center-independent.
  const occupiedRanges = new Map<number, { start: number; end: number }[]>();
  levels.forEach(l => occupiedRanges.set(l, []));

  const dotOffset = 20; // Pixels from dot to label start (accounting for connector and padding)

  for (const event of sorted) {
    const isToday = event.isToday || event.year >= todayHE;
    
    // Check if we should even show a label
    const shouldShowLabel = zoom > 5 || event.importance <= 1 || (zoom > 1 && event.importance <= 2);
    if (!shouldShowLabel && !isToday) continue;

    const textWidth = measureText(event.title, isToday);
    const yearWidth = shouldShowYear(zoom, isToday) ? measureText(`${Math.floor(event.year)} HE`, false) : 0;
    const labelWidth = Math.max(textWidth, yearWidth) + minPadding;
    
    // yearX is the pixel position if centerYear was 0
    const yearX = event.year * zoom;
    const startX = yearX + dotOffset;
    const endX = startX + labelWidth;

    let selectedY: number | null = null;
    
    for (const y of levels) {
      const ranges = occupiedRanges.get(y)!;
      const hasOverlap = ranges.some(r => startX < r.end && endX > r.start);
      
      if (!hasOverlap) {
        selectedY = y;
        break;
      }
    }

    if (selectedY !== null) {
      assignments.set(event, selectedY);
      occupiedRanges.get(selectedY)!.push({ start: startX, end: endX });
    } else if (isToday) {
      // Fallback for Today: force it on the first level if it somehow failed
      // (though with enough levels this shouldn't happen)
      assignments.set(event, levels[0]);
    }
  }

  return assignments;
}
