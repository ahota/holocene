import { useState, useCallback } from 'react';

/**
 * Custom hook to manage the timeline's camera state:
 * - centerYear: The year currently in the horizontal center of the viewport.
 * - zoom: The scale in pixels per year.
 */
export function useTimeline(initialYear: number) {
  const [centerYear, setCenterYear] = useState(initialYear);
  const [zoom, setZoom] = useState(10); // pixels per year

  /**
   * Adjusts the centerYear based on pixel delta.
   */
  const scroll = useCallback(
    (deltaX: number) => {
      setCenterYear((prev) => prev - deltaX / zoom);
    },
    [zoom]
  );

  return {
    centerYear,
    setCenterYear,
    zoom,
    setZoom,
    scroll,
  };
}
