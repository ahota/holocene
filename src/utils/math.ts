/**
 * Returns the current year in the Holocene calendar (Human Era).
 * 0 HE = 10,001 BC.
 */
export function currentHEYear(): number {
  const now = new Date();
  const yearCE = now.getFullYear();
  const startOfYear = new Date(yearCE, 0, 1);
  const endOfYear = new Date(yearCE + 1, 0, 1);
  const progress = (now.getTime() - startOfYear.getTime()) / (endOfYear.getTime() - startOfYear.getTime());
  return yearCE + 10000 + progress;
}

/**
 * Transforms world coordinates (years) to screen coordinates (pixels).
...

 * @param year The year to transform.
 * @param centerYear The year currently in the center of the viewport.
 * @param pixelsPerYear The current zoom level (scale).
 * @param screenWidth The width of the viewport.
 * @returns The x-coordinate on the screen.
 */
export function worldToScreen(
  year: number,
  centerYear: number,
  pixelsPerYear: number,
  screenWidth: number
): number {
  return (year - centerYear) * pixelsPerYear + screenWidth / 2;
}
