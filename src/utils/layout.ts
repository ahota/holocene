import { HistoryEvent } from '../data/events';

export interface AssignedEvent extends HistoryEvent {
  level: number;
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

    // Then Importance (higher first)
    if (a.importance !== b.importance) {
      return b.importance - a.importance;
    }

    // Then Year
    return a.year - b.year;
  });

  // Track occupied ranges per level: [startYearSpace, endYearSpace]
  // We work in "year * zoom" space which is equivalent to pixels but center-independent.
  const occupiedRanges = new Map<number, { start: number; end: number }[]>();
  levels.forEach(l => occupiedRanges.set(l, []));

  const dotOffset = 12; // Pixels from dot to label start

  for (const event of sorted) {
    const isToday = event.isToday || event.year >= todayHE;
    
    // Check if we should even show a label
    const shouldShowLabel = zoom > 5 || event.importance >= 3 || (zoom > 1 && event.importance >= 2);
    if (!shouldShowLabel && !isToday) continue;

    const textWidth = measureText(event.title, isToday);
    const yearWidth = (zoom > 1 || isToday) ? measureText(`${Math.floor(event.year)} HE`, false) : 0;
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
