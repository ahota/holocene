import { useState, useCallback, useRef } from 'react';
import { currentHEYear } from '../../utils/math';

/**
 * Custom hook to manage the timeline's camera state with adaptive margins.
 */
export function useTimeline(initialYear: number) {
  const TODAY = currentHEYear();
  const EPOCH_START = 0;
  
  const MARGIN_UNIT = 32;
  const LABEL_PADDING = 24; // Extra space for labels at the edges
  
  const [centerYear, setCenterYear] = useState(initialYear);
  const [zoom, setZoom] = useState(10);

  const initialHalfWidthRef = useRef<number | null>(null);

  /**
   * Returns the absolute inner boundary where markers are 100% opaque.
   */
  const getInnerBound = useCallback((screenWidth: number) => {
    const scale = screenWidth < 600 ? 1 : 1.2;
    // gutter (margin_unit) + fadeZone (margin_unit) + labelPadding
    return (MARGIN_UNIT * 2 * scale) + LABEL_PADDING;
  }, []);

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
    const totalEpochInPixels = (TODAY - EPOCH_START) * currentZoom;
    if (totalEpochInPixels <= effectiveWidth) {
      return (TODAY + EPOCH_START) / 2;
    }

    // 2. Clamping
    if (newCenter > TODAY) newCenter = TODAY;
    if (newCenter + halfWidth > TODAY + padding) newCenter = TODAY + padding - halfWidth;
    if (newCenter - halfWidth < EPOCH_START) newCenter = EPOCH_START + halfWidth;

    return newCenter;
  }, [TODAY, getInnerBound]);

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
        const minZoom = effectiveWidth / TODAY;
        const newZoom = Math.max(minZoom, Math.min(1000, targetZoom));
        
        setCenterYear((prevCenter) => {
          const newCenter = zoomCenterYear - (zoomCenterYear - prevCenter) * (prevZoom / newZoom);
          return clampView(newCenter, newZoom, screenWidth);
        });
        
        return newZoom;
      });
    },
    [clampView, TODAY, getInnerBound]
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
    // Ensure we return the derived inner bound as the Margin for the UI
    INNER_BOUND: getInnerBound(window.innerWidth),
  };
}
