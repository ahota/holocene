import { describe, it, expect } from 'vitest';
import { shouldShowEraLabel } from './eraLayout';

describe('shouldShowEraLabel', () => {
  it('hides the label when the band is narrower than the threshold', () => {
    expect(shouldShowEraLabel(40, 80)).toBe(false);
  });

  it('shows the label when the band is at or above the threshold', () => {
    expect(shouldShowEraLabel(80, 80)).toBe(true);
    expect(shouldShowEraLabel(120, 80)).toBe(true);
  });

  it('uses 80 as the default threshold', () => {
    expect(shouldShowEraLabel(70)).toBe(false);
    expect(shouldShowEraLabel(80)).toBe(true);
  });
});
