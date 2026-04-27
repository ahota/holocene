/**
 * True when an era band's on-screen pixel width is wide enough to
 * comfortably show its label without crowding adjacent markers.
 */
export function shouldShowEraLabel(
  bandWidthPx: number,
  threshold: number = 80,
): boolean {
  return bandWidthPx >= threshold;
}
