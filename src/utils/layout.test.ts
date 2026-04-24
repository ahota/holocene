import { describe, it, expect } from 'vitest';
import { calculateLabelLevels } from './layout';
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
