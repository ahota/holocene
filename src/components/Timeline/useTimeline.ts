import { useState, useCallback, useRef } from 'react';
import { TODAY_HE, getInnerBound } from '../../constants';

/**
 * Custom hook to manage the timeline's camera state with adaptive margins.
 */
export function useTimeline(initialYear: number) {
  const EPOCH_START = 0;
  
  const [centerYear, setCenterYear] = useState(initialYear);
  const [zoom, setZoom] = useState(10);

  const initialHalfWidthRef = useRef<number | null>(null);

  const clampView = useCallback((year: number, currentZoom: number, screenWidth: number) => {
    const innerBound = getInnerBound(screenWidth);
    const effectiveWidth = screenWidth - 2 * innerBound;
    if (effectiveWidth <= 0) return year;

    const halfWidth = (effectiveWidth / 2) / currentZoom;
    
    if (initialHalfWidthRef.current === null && effectiveWidth > 0) {
      initialHalfWidthRef.current = halfWidth;
    }

    const padding = initialHalfWidthRef.current || halfWidth;
    let newCenter = year;

    // 1. Lock scrolling if epoch fits
    const totalEpochInPixels = (TODAY_HE - EPOCH_START) * currentZoom;
    if (totalEpochInPixels <= effectiveWidth) {
      return (TODAY_HE + EPOCH_START) / 2;
    }

    // 2. Clamping
    if (newCenter > TODAY_HE) newCenter = TODAY_HE;
    if (newCenter + halfWidth > TODAY_HE + padding) newCenter = TODAY_HE + padding - halfWidth;
    if (newCenter - halfWidth < EPOCH_START) newCenter = EPOCH_START + halfWidth;

    return newCenter;
  }, [getInnerBound]);

  const scroll = useCallback(
    (deltaX: number, screenWidth: number) => {
      setCenterYear((prev) => clampView(prev - deltaX / zoom, zoom, screenWidth));
    },
    [zoom, clampView]
  );

  const zoomTo = useCallback(
    (targetZoom: number, zoomCenterYear: number, screenWidth: number) => {
      setZoom((prevZoom) => {
        const innerBound = getInnerBound(screenWidth);
        const effectiveWidth = screenWidth - 2 * innerBound;
        const minZoom = effectiveWidth / TODAY_HE;
        const newZoom = Math.max(minZoom, Math.min(1000, targetZoom));
        
        setCenterYear((prevCenter) => {
          const newCenter = zoomCenterYear - (zoomCenterYear - prevCenter) * (prevZoom / newZoom);
          return clampView(newCenter, newZoom, screenWidth);
        });
        
        return newZoom;
      });
    },
    [clampView, getInnerBound]
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
    TODAY: TODAY_HE,
    INNER_BOUND: getInnerBound(window.innerWidth),
  };
}
