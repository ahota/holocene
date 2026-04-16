import { useState, useCallback, useRef } from 'react';

/**
 * Custom hook to manage the timeline's camera state:
 * - centerYear: The year currently in the horizontal center of the viewport.
 * - zoom: The scale in pixels per year.
 */
export function useTimeline(initialYear: number) {
  const [centerYear, setCenterYear] = useState(initialYear);
  const [zoom, setZoom] = useState(10); // initial pixels per year

  const TODAY = 12026.3;
  const EPOCH_START = 0;
  
  // Store the initial half-width in years to allow the "Today at center" padding
  const initialHalfWidthRef = useRef<number | null>(null);

  /**
   * Clamps the view according to the following rules:
   * 1. 0 HE is the hard left limit for the viewport.
   * 2. Today is the right-most limit for the center of the screen (Today at center).
   * 3. As we zoom out, the future padding is reduced until Today hits the right edge.
   */
  const clampView = useCallback((year: number, currentZoom: number, screenWidth: number) => {
    const halfWidth = (screenWidth / 2) / currentZoom;
    
    // Initialize initialHalfWidth once we have a screenWidth
    if (initialHalfWidthRef.current === null && screenWidth > 0) {
      initialHalfWidthRef.current = halfWidth;
    }

    const padding = initialHalfWidthRef.current || halfWidth;
    let newCenter = year;

    // 1. Never scroll further into the future than Today at center
    if (newCenter > TODAY) {
      newCenter = TODAY;
    }

    // 2. As we zoom out, slide Today to the right edge if needed
    // The right-most year we can see is TODAY + padding (where padding is the initial half-width)
    if (newCenter + halfWidth > TODAY + padding) {
      newCenter = TODAY + padding - halfWidth;
    }

    // 3. 0 HE is the absolute left limit
    if (newCenter - halfWidth < EPOCH_START) {
      newCenter = EPOCH_START + halfWidth;
    }

    // 4. Final safety check: if zoomed out so far that the epoch fits, 
    // center it between edges (0 on left, Today on right)
    const totalEpochInPixels = (TODAY - EPOCH_START) * currentZoom;
    if (totalEpochInPixels <= screenWidth) {
      newCenter = (TODAY + EPOCH_START) / 2;
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
        const minZoom = screenWidth / TODAY;
        const newZoom = Math.max(minZoom, Math.min(1000, targetZoom));
        
        setCenterYear((prevCenter) => {
          const newCenter = zoomCenterYear - (zoomCenterYear - prevCenter) * (prevZoom / newZoom);
          return clampView(newCenter, newZoom, screenWidth);
        });
        
        return newZoom;
      });
    },
    [clampView, TODAY]
  );

  const zoomDelta = useCallback(
    (delta: number, zoomCenterYear: number, screenWidth: number) => {
      const factor = delta > 0 ? 1.1 : 0.9;
      zoomTo(zoom * factor, zoomCenterYear, screenWidth);
    },
    [zoom, zoomTo]
  );

  const handleZoomSlider = useCallback((newZoom: number, screenWidth: number) => {
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
