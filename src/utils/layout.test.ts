import { describe, it, expect } from 'vitest';
import { calculateLabelLevels, getLabelGeometry, shouldShowYear } from './layout';
import { HistoryEvent } from '../data/events';

describe('calculateLabelLevels', () => {
  const mockMeasure = (text: string) => text.length * 8;
  const levels = [-15, 15, -30, 30, -45];
  const today = 12026;

  it('assigns levels stably regardless of order in input array', () => {
    const events: HistoryEvent[] = [
      { year: 10000, title: 'Event A', importance: 3, description: '' },
      { year: 10005, title: 'Event B', importance: 3, description: '' },
    ];

    const res1 = calculateLabelLevels(events, 10, today, mockMeasure, 20, levels);
    const res2 = calculateLabelLevels([...events].reverse(), 10, today, mockMeasure, 20, levels);

    expect(res1.get(events[0])).toBe(res2.get(events[0]));
    expect(res1.get(events[1])).toBe(res2.get(events[1]));
  });

  it('prevents overlap on the same level', () => {
    const events: HistoryEvent[] = [
      { year: 10000, title: 'Long Event Name', importance: 3, description: '' },
      { year: 10001, title: 'B', importance: 3, description: '' },
    ];

    // zoom = 1px per year. Event A and B are 1px apart.
    // Event A width = 15 chars * 8 = 120px.
    // They definitely overlap if on same level.
    const res = calculateLabelLevels(events, 1, today, mockMeasure, 20, levels);
    
    expect(res.get(events[0])).not.toBe(res.get(events[1]));
  });

  it('prioritizes importance', () => {
    const events: HistoryEvent[] = [
      { year: 10000, title: 'Important', importance: 3, description: '' },
      { year: 10000, title: 'Less So', importance: 1, description: '' },
    ];

    // At zoom 3, importance 1 should be hidden (zoom <= 5 and importance < 2)
    const res = calculateLabelLevels(events, 3, today, mockMeasure, 20, levels);
    
    // Important should get the first level
    expect(res.get(events[0])).toBe(levels[0]);
    // Less So should be hidden
    expect(res.has(events[1])).toBe(false);
  });
});

describe('shouldShowYear', () => {
  it('shows year above zoom 1', () => {
    expect(shouldShowYear(2, false)).toBe(true);
    expect(shouldShowYear(0.5, false)).toBe(false);
  });

  it('always shows year for today', () => {
    expect(shouldShowYear(0.1, true)).toBe(true);
  });
});

describe('getLabelGeometry', () => {
  it('drops the year line and shrinks the hit rect when hasYear is false', () => {
    const withYear = getLabelGeometry(-35, true, 100);
    const noYear = getLabelGeometry(-35, false, 100);

    expect(withYear.yearY).not.toBeNull();
    expect(noYear.yearY).toBeNull();
    expect(withYear.hitRect.h).toBeGreaterThan(noYear.hitRect.h);
  });

  it('hit rect width grows linearly with text width', () => {
    const a = getLabelGeometry(0, true, 50);
    const b = getLabelGeometry(0, true, 150);
    expect(b.hitRect.w - a.hitRect.w).toBe(100);
  });

  it('places title baseline at the assigned level', () => {
    expect(getLabelGeometry(70, false, 100).titleY).toBe(70);
  });
});
