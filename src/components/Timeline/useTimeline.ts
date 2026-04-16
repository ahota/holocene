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
  const EPOCH_START = 0;

  /**
   * Clamps the view so that:
   * 1. The right edge never shows years past TODAY.
   * 2. If zoomed all the way out, EPOCH_START is on the left and TODAY is on the right.
   */
  const clampView = useCallback((year: number, currentZoom: number, screenWidth: number) => {
    // Distance from center to edge in years
    const halfWidthInYears = (screenWidth / 2) / currentZoom;
    
    let newCenter = year;

    // 1. Right edge clamping (never past TODAY)
    if (newCenter + halfWidthInYears > TODAY) {
      newCenter = TODAY - halfWidthInYears;
    }

    // 2. Left edge clamping (never before EPOCH_START, unless zooming in close)
    // If the total epoch is smaller than the screen width at this zoom,
    // we should ideally lock the epoch to the screen edges.
    const totalEpochInPixels = (TODAY - EPOCH_START) * currentZoom;
    if (totalEpochInPixels <= screenWidth) {
      // Zoomed out far enough that the whole epoch fits (or more)
      // Center the epoch in the viewport? No, user wants TODAY on right, 0 on left.
      // So at max zoom out, center is (TODAY + EPOCH_START) / 2
      newCenter = (TODAY + EPOCH_START) / 2;
    } else if (newCenter - halfWidthInYears < EPOCH_START) {
      newCenter = EPOCH_START + halfWidthInYears;
    }

    return newCenter;
  }, []);

  const scroll = useCallback(
    (deltaX: number, screenWidth: number) => {
      setCenterYear((prev) => clampView(prev - deltaX / zoom, zoom, screenWidth));
    },
    [zoom, clampView]
  );

  const zoomTo = useCallback(
    (targetZoom: number, zoomCenterYear: number, screenWidth: number) => {
      setZoom((prevZoom) => {
        // Calculate min zoom such that the whole epoch fits the screen
        const minZoom = screenWidth / (TODAY - EPOCH_START);
        const newZoom = Math.max(minZoom, Math.min(1000, targetZoom));
        
        // Maintain the zoomCenterYear position on screen
        setCenterYear((prevCenter) => {
          const newCenter = zoomCenterYear - (zoomCenterYear - prevCenter) * (prevZoom / newZoom);
          return clampView(newCenter, newZoom, screenWidth);
        });
        
        return newZoom;
      });
    },
    [clampView]
  );

  const zoomDelta = useCallback(
    (delta: number, zoomCenterYear: number, screenWidth: number) => {
      const factor = delta > 0 ? 1.1 : 0.9;
      zoomTo(zoom * factor, zoomCenterYear, screenWidth);
    },
    [zoom, zoomTo]
  );

  const handleZoomSlider = useCallback((newZoom: number, screenWidth: number) => {
    // Zoom around the current center when using the slider
    zoomTo(newZoom, centerYear, screenWidth);
  }, [centerYear, zoomTo]);

  return {
    centerYear,
    setCenterYear: (y: number, sw: number) => setCenterYear(clampView(y, zoom, sw)),
    zoom,
    setZoom: handleZoomSlider,
    scroll,
    zoomTo,
    zoomDelta,
  };
}
