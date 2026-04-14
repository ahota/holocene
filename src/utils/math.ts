/**
 * Transforms world coordinates (years) to screen coordinates (pixels).
 *
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
