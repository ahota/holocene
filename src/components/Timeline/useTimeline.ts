import { useState, useCallback } from 'react';

/**
 * Custom hook to manage the timeline's camera state:
 * - centerYear: The year currently in the horizontal center of the viewport.
 * - zoom: The scale in pixels per year.
 */
export function useTimeline(initialYear: number) {
  const [centerYear, setCenterYear] = useState(initialYear);
  const [zoom, setZoom] = useState(10); // pixels per year

  const TODAY = 12026.3;

  const clampYear = useCallback((year: number) => {
    // Prevent scrolling into the future
    return Math.min(TODAY, year);
  }, []);

  const scroll = useCallback(
    (deltaX: number) => {
      setCenterYear((prev) => clampYear(prev - deltaX / zoom));
    },
    [zoom, clampYear]
  );

  const zoomTo = useCallback(
    (targetZoom: number, zoomCenterYear: number) => {
      setZoom((prevZoom) => {
        const newZoom = Math.max(0.1, Math.min(1000, targetZoom));
        
        // Maintain the zoomCenterYear position on screen
        setCenterYear((prevCenter) => {
          const newCenter = zoomCenterYear - (zoomCenterYear - prevCenter) * (prevZoom / newZoom);
          return clampYear(newCenter);
        });
        
        return newZoom;
      });
    },
    [clampYear]
  );

  const zoomDelta = useCallback(
    (delta: number, zoomCenterYear: number) => {
      const factor = delta > 0 ? 1.1 : 0.9;
      zoomTo(zoom * factor, zoomCenterYear);
    },
    [zoom, zoomTo]
  );

  const handleZoomSlider = useCallback((newZoom: number) => {
    setZoom(prevZoom => {
      const target = Math.max(0.1, Math.min(1000, newZoom));
      // When using slider, zoom around the centerYear
      return target;
    });
  }, []);

  return {
    centerYear,
    setCenterYear: (y: number) => setCenterYear(clampYear(y)),
    zoom,
    setZoom: handleZoomSlider,
    scroll,
    zoomTo,
    zoomDelta,
  };
}
