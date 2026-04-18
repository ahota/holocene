import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { worldToScreen } from '../../utils/math';
import { events } from '../../data/events';

interface Props {
  centerYear: number;
  zoom: number;
  onScroll: (deltaX: number, screenWidth: number) => void;
  onZoom: (delta: number, zoomCenterYear: number, screenWidth: number) => void;
  onZoomTo: (targetZoom: number, zoomCenterYear: number, screenWidth: number) => void;
  todayHE: number;
  margin: number;
}

/**
 * Performance-optimized canvas component with adaptive margins and smooth fading.
 */
export default function TimelineCanvas({
  centerYear,
  zoom,
  onScroll,
  onZoom,
  onZoomTo,
  todayHE,
  margin,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [lastPointerX, setLastPointerX] = useState<number | null>(null);
  const [hasMoved, setHasMoved] = useState(false);

  // Constants for fading logic (matches useTimeline's calculation)
  const MARGIN_UNIT = 32;
  const LABEL_PADDING = 24;

  const adaptiveMargins = useMemo(() => {
    const dpr = window.devicePixelRatio || 1;
    const gutter = MARGIN_UNIT * (dpr > 1.5 ? 1 : 0.8);
    const fadeZone = MARGIN_UNIT;
    return { gutter, fadeZone, innerBound: margin };
  }, [margin]);

  const getEffectiveWidth = (width: number) => width - 2 * adaptiveMargins.innerBound;

  const screenToWorld = useCallback(
    (screenX: number, width: number) => {
      const effectiveWidth = getEffectiveWidth(width);
      const relativeX = screenX - adaptiveMargins.innerBound;
      return (relativeX - effectiveWidth / 2) / zoom + centerYear;
    },
    [centerYear, zoom, adaptiveMargins]
  );

  const getEdgeOpacity = useCallback((x: number, width: number) => {
    const { gutter, fadeZone } = adaptiveMargins;
    if (x < gutter || x > width - gutter) return 0;
    if (x < gutter + fadeZone) return (x - gutter) / fadeZone;
    if (x > width - (gutter + fadeZone)) return (width - gutter - x) / fadeZone;
    return 1;
  }, [adaptiveMargins]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const effectiveWidth = getEffectiveWidth(width);

    if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    }

    ctx.clearRect(0, 0, width, height);
    
    // Background baseline - Increased contrast
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Adaptive Ticking
    let interval = 1000;
    if (zoom > 0.5) interval = 100;
    if (zoom > 5) interval = 10;
    if (zoom > 50) interval = 1;

    const startYear = Math.floor(screenToWorld(0, width) / interval) * interval;
    const endYear = Math.ceil(screenToWorld(width, width) / interval) * interval;

    ctx.textAlign = 'center';
    ctx.font = '10px monospace';

    for (let year = startYear; year <= endYear; year += interval) {
      if (year > todayHE) continue;

      const x = worldToScreen(year, centerYear, zoom, effectiveWidth) + adaptiveMargins.innerBound;
      const opacity = getEdgeOpacity(x, width);
      
      // Reset state for each item to prevent transparency leak
      ctx.globalAlpha = opacity;
      if (opacity <= 0) continue;

      const isMillennium = year % 1000 === 0;
      const isCentury = year % 100 === 0;

      ctx.beginPath();
      ctx.moveTo(x, height / 2 - (isMillennium ? 25 : isCentury ? 15 : 8));
      ctx.lineTo(x, height / 2 + (isMillennium ? 25 : isCentury ? 15 : 8));
      // Increased contrast for lines
      ctx.strokeStyle = isMillennium ? '#999' : isCentury ? '#666' : '#444';
      ctx.stroke();

      if (isMillennium || (zoom > 2 && isCentury) || zoom > 20) {
        ctx.fillStyle = isMillennium ? '#fff' : '#aaa';
        ctx.fillText(year.toString(), x, height / 2 + (isMillennium ? 40 : 30));
      }
    }

    // Historical Events
    events.forEach((event) => {
      const eventYear = event.isToday ? todayHE : event.year;
      const x = worldToScreen(eventYear, centerYear, zoom, effectiveWidth) + adaptiveMargins.innerBound;
      const opacity = getEdgeOpacity(x, width);
      
      ctx.globalAlpha = opacity;
      if (opacity <= 0) return;

      const isToday = event.isToday || eventYear >= todayHE;
      
      ctx.beginPath();
      ctx.arc(x, height / 2, isToday ? 5 : 4, 0, Math.PI * 2);
      ctx.fillStyle = isToday ? '#ff0000' : '#ffffff';
      ctx.fill();

      const shouldShowLabel = zoom > 5 || event.importance >= 3 || (zoom > 1 && event.importance >= 2);
      if (shouldShowLabel || isToday) {
        ctx.fillStyle = isToday ? '#ff4444' : '#ffffff';
        ctx.font = isToday ? 'bold 12px sans-serif' : '11px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(event.title, x + 12, height / 2 - 15);
        
        if (zoom > 1 || isToday) {
          ctx.fillStyle = '#888';
          ctx.font = '10px monospace';
          ctx.fillText(`${Math.floor(eventYear)} HE`, x + 12, height / 2 + 5);
        }
      }
    });
    
    ctx.globalAlpha = 1.0;
  }, [centerYear, zoom, screenToWorld, todayHE, adaptiveMargins, getEdgeOpacity]);

  useEffect(() => {
    draw();
    window.addEventListener('resize', draw);
    return () => window.removeEventListener('resize', draw);
  }, [draw]);

  const handlePointerDown = (e: React.PointerEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.setPointerCapture(e.pointerId);
    setIsDragging(true);
    setLastPointerX(e.clientX);
    setHasMoved(false);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isDragging && lastPointerX !== null) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      const deltaX = e.clientX - lastPointerX;
      
      // Increased movement threshold slightly for noisy touch sensors
      if (Math.abs(deltaX) > 0.5) {
        onScroll(deltaX, rect.width);
        setLastPointerX(e.clientX);
        setHasMoved(true);
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    const canvas = canvasRef.current;
    if (canvas && e.pointerId !== undefined) {
      try { canvas.releasePointerCapture(e.pointerId); } catch(e) {}
    }
    setIsDragging(false);
    setLastPointerX(null);
  };

  const handleClick = (e: React.MouseEvent) => {
    if (hasMoved) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const effectiveWidth = getEffectiveWidth(rect.width);

    for (const event of events) {
      const eventYear = event.isToday ? todayHE : event.year;
      const x = worldToScreen(eventYear, centerYear, zoom, effectiveWidth) + adaptiveMargins.innerBound;
      const y = rect.height / 2;
      const dist = Math.sqrt(Math.pow(x - mouseX, 2) + Math.pow(y - mouseY, 2));
      
      // Larger hit area for mobile fingers
      if (dist < 25) {
        alert(`${event.title}\n\n${event.description}\nYear: ${Math.floor(eventYear)} HE`);
        break;
      }
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const mouseX = e.clientX - rect.left;
    const zoomCenterYear = screenToWorld(mouseX, rect.width);
    onZoom(-e.deltaY, zoomCenterYear, rect.width);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const mouseX = e.clientX - rect.left;
    const zoomCenterYear = screenToWorld(mouseX, rect.width);
    onZoomTo(zoom * 2, zoomCenterYear, rect.width);
  };

  return (
    <div 
      ref={containerRef} 
      style={{ 
        width: '100%', 
        height: '400px', 
        margin: '2rem 0',
        touchAction: 'none', // Critical to prevent browser scroll during drag
      }}
    >
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onClick={handleClick}
        onWheel={handleWheel}
        onDoubleClick={handleDoubleClick}
        style={{
          width: '100%',
          height: '100%',
          cursor: isDragging ? 'grabbing' : 'grab',
          touchAction: 'none',
        }}
      />
    </div>
  );
}
