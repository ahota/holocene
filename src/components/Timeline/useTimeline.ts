import { useState, useCallback, useRef } from 'react';
import { TODAY_HE, getInnerBound, EPOCH_START, INITIAL_ZOOM, MAX_ZOOM, LABEL_PADDING } from '../../constants';

/**
 * Custom hook to manage the timeline's camera state with adaptive margins.
 */
export function useTimeline(initialYear: number) {
  const [centerYear, setCenterYear] = useState(initialYear);
  const [zoom, setZoom] = useState(INITIAL_ZOOM);

  const initialHalfWidthRef = useRef<number | null>(null);

  const clampView = useCallback((year: number, currentZoom: number, screenWidth: number) => {
    const innerBound = getInnerBound(screenWidth);
    const effectiveWidth = screenWidth - 2 * innerBound;
    // Compact effective width — used for the lock-when-epoch-fits check, so
    // the view zooms out far enough to span almost the full screen.
    const compactEffective = screenWidth - 2 * LABEL_PADDING;
    if (compactEffective <= 0) return year;

    const halfWidth = (effectiveWidth / 2) / currentZoom;

    if (initialHalfWidthRef.current === null && effectiveWidth > 0) {
      initialHalfWidthRef.current = halfWidth;
    }

    const padding = initialHalfWidthRef.current || halfWidth;
    let newCenter = year;

    // 1. Lock scrolling if epoch fits the compact effective width
    const totalEpochInPixels = (TODAY_HE - EPOCH_START) * currentZoom;
    if (totalEpochInPixels <= compactEffective) {
      return (TODAY_HE + EPOCH_START) / 2;
    }

    // 2. Clamping (uses full innerBound so panning has graceful edge fade)
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
        // Min zoom uses LABEL_PADDING so the timeline extends close to the
        // screen edges when fully zoomed out (when panning isn't possible).
        const minZoom = (screenWidth - 2 * LABEL_PADDING) / TODAY_HE;
        const newZoom = Math.max(minZoom, Math.min(MAX_ZOOM, targetZoom));
        
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
