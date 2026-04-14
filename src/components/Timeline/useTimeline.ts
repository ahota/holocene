import { useState, useCallback } from 'react';

/**
 * Custom hook to manage the timeline's camera state:
 * - centerYear: The year currently in the horizontal center of the viewport.
 * - zoom: The scale in pixels per year.
 */
export function useTimeline(initialYear: number) {
  const [centerYear, setCenterYear] = useState(initialYear);
  const [zoom, setZoom] = useState(10); // pixels per year

  const scroll = useCallback(
    (deltaX: number) => {
      setCenterYear((prev) => prev - deltaX / zoom);
    },
    [zoom]
  );

  const zoomTo = useCallback(
    (targetZoom: number, zoomCenterYear: number) => {
      setZoom((prevZoom) => {
        const newZoom = Math.max(0.1, Math.min(1000, targetZoom));
        // Maintain the zoomCenterYear position on screen
        setCenterYear((prevCenter) => {
          return zoomCenterYear - (zoomCenterYear - prevCenter) * (prevZoom / newZoom);
        });
        return newZoom;
      });
    },
    []
  );

  const zoomDelta = useCallback(
    (delta: number, zoomCenterYear: number) => {
      const factor = delta > 0 ? 1.1 : 0.9;
      zoomTo(zoom * factor, zoomCenterYear);
    },
    [zoom, zoomTo]
  );

  return {
    centerYear,
    setCenterYear,
    zoom,
    setZoom,
    scroll,
    zoomTo,
    zoomDelta,
  };
}
