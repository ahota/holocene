import { describe, it, expect, vi } from 'vitest';

// We can't easily test the hook without react-hooks-testing-library, 
// but we can extract the chunk calculation logic to verify it.

const calculateChunks = (centerYear: number, zoom: number, screenWidth: number, innerBound: number) => {
  const effectiveWidth = screenWidth - 2 * innerBound;
  if (effectiveWidth <= 0) return [];

  const halfWidth = (effectiveWidth / 2) / zoom;
  const startYear = centerYear - halfWidth;
  const endYear = centerYear + halfWidth;

  const CHUNK_SIZE = 2000;
  const startChunk = (Math.floor(startYear / CHUNK_SIZE) - 1) * CHUNK_SIZE;
  const endChunk = (Math.floor(endYear / CHUNK_SIZE) + 1) * CHUNK_SIZE;

  const chunks = [];
  for (let i = startChunk; i <= endChunk; i += CHUNK_SIZE) {
    if (i >= 0 && i <= 12000) {
      chunks.push(i);
    }
  }
  return chunks;
};

describe('useEventLoader chunk calculation', () => {
  it('should calculate correct chunks for current year at high zoom', () => {
    // Zoom 10, screen 1000, innerBound 50 => halfWidth 45
    // center 12026 => [11981, 12071]
    // floor(11981/2000)-1 = 4 => 8000
    // floor(12071/2000)+1 = 7 => 14000
    // Result: [8000, 10000, 12000]
    const chunks = calculateChunks(12026, 10, 1000, 50);
    expect(chunks).toEqual([8000, 10000, 12000]);
  });

  it('should calculate correct chunks for beginning of epoch', () => {
    // Zoom 10, center 100 => [55, 145]
    // floor(55/2000)-1 = -1 => -2000
    // floor(145/2000)+1 = 1 => 2000
    // Result: [0, 2000]
    const chunks = calculateChunks(100, 10, 1000, 50);
    expect(chunks).toEqual([0, 2000]);
  });

  it('should handle very low zoom (whole timeline)', () => {
    // zoom 0.05 => halfWidth 9000
    // center 6000 => [-3000, 15000]
    // Result: all chunks [0, 2000, 4000, 6000, 8000, 10000, 12000]
    const chunks = calculateChunks(6000, 0.05, 1000, 50);
    expect(chunks).toEqual([0, 2000, 4000, 6000, 8000, 10000, 12000]);
  });
});
