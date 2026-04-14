import { describe, it, expect } from 'vitest';
import { worldToScreen } from './math';

describe('worldToScreen', () => {
  it('centers the current year when offset is 0', () => {
    const screenX = worldToScreen(12026, 12026, 10, 1000);
    expect(screenX).toBe(500);
  });

  it('shifts correctly based on zoom', () => {
    // 1 year to the left, zoom=10px per year
    const screenX = worldToScreen(12025, 12026, 10, 1000);
    expect(screenX).toBe(490);
  });

  it('handles negative years (before 0 HE)', () => {
    const screenX = worldToScreen(-1, 0, 10, 1000);
    expect(screenX).toBe(490);
  });
});
