import { useState, useCallback, useRef } from 'react';
import { currentHEYear } from '../../utils/math';

/**
 * Custom hook to manage the timeline's camera state.
 */
export function useTimeline(initialYear: number) {
  const TODAY = currentHEYear();
  const EPOCH_START = 0;
  
  const [centerYear, setCenterYear] = useState(initialYear);
  const [zoom, setZoom] = useState(10);

  const initialHalfWidthRef = useRef<number | null>(null);

  const clampView = useCallback((year: number, currentZoom: number, screenWidth: number) => {
    const halfWidth = (screenWidth / 2) / currentZoom;
    
    if (initialHalfWidthRef.current === null && screenWidth > 0) {
      initialHalfWidthRef.current = halfWidth;
    }

    const padding = initialHalfWidthRef.current || halfWidth;
    let newCenter = year;

    // Never scroll further into the future than Today at center
    if (newCenter > TODAY) {
      newCenter = TODAY;
    }

    // As we zoom out, slide Today to the right edge
    if (newCenter + halfWidth > TODAY + padding) {
      newCenter = TODAY + padding - halfWidth;
    }

    // 0 HE is the absolute left limit
    if (newCenter - halfWidth < EPOCH_START) {
      newCenter = EPOCH_START + halfWidth;
    }

    // If zoomed out so far that the epoch fits, center it
    const totalEpochInPixels = (TODAY - EPOCH_START) * currentZoom;
    if (totalEpochInPixels <= screenWidth) {
      newCenter = (TODAY + EPOCH_START) / 2;
    }

    return newCenter;
  }, [TODAY]);

  const scroll = useCallback(
    (deltaX: number, screenWidth: number) => {
      setCenterYear((prev) => clampView(prev - deltaX / zoom, zoom, screenWidth));
    },
    [zoom, clampView]
  );

  const zoomTo = useCallback(
    (targetZoom: number, zoomCenterYear: number, screenWidth: number) => {
      setZoom((prevZoom) => {
        // Range is 0 to TODAY
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
    TODAY,
  };
}
