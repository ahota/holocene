import React, { useRef, useEffect, useState, useCallback } from 'react';
import { worldToScreen } from '../../utils/math';
import { events } from '../../data/events';

interface Props {
  centerYear: number;
  zoom: number;
  onScroll: (deltaX: number) => void;
  onZoom: (delta: number, zoomCenterYear: number) => void;
  onZoomTo: (targetZoom: number, zoomCenterYear: number) => void;
}

/**
 * Performance-optimized canvas component with adaptive ticks and historical events.
 */
export default function TimelineCanvas({
  centerYear,
  zoom,
  onScroll,
  onZoom,
  onZoomTo,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [lastMouseX, setLastMouseX] = useState<number | null>(null);

  const screenToWorld = useCallback(
    (screenX: number, screenWidth: number) => {
      return (screenX - screenWidth / 2) / zoom + centerYear;
    },
    [centerYear, zoom]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const drawTicks = (width: number, height: number) => {
      ctx.strokeStyle = '#222';
      ctx.fillStyle = '#666';
      ctx.font = '10px monospace';
      ctx.textAlign = 'center';

      // Decide tick interval based on zoom (pixels per year)
      // 1, 10, 100, 1000
      let interval = 1000;
      if (zoom > 0.5) interval = 100;
      if (zoom > 5) interval = 10;
      if (zoom > 50) interval = 1;

      const startYear = Math.floor(screenToWorld(0, width) / interval) * interval;
      const endYear = Math.ceil(screenToWorld(width, width) / interval) * interval;

      for (let year = startYear; year <= endYear; year += interval) {
        const x = worldToScreen(year, centerYear, zoom, width);
        const isMillennium = year % 1000 === 0;
        const isCentury = year % 100 === 0;

        ctx.beginPath();
        ctx.moveTo(x, height / 2 - (isMillennium ? 20 : isCentury ? 10 : 5));
        ctx.lineTo(x, height / 2 + (isMillennium ? 20 : isCentury ? 10 : 5));
        ctx.stroke();

        if (isMillennium || (zoom > 2 && isCentury) || zoom > 20) {
          ctx.fillText(year.toString(), x, height / 2 + (isMillennium ? 35 : 25));
        }
      }
    };

    const drawEvents = (width: number, height: number) => {
      events.forEach((event) => {
        const x = worldToScreen(event.year, centerYear, zoom, width);
        if (x < -100 || x > width + 100) return;

        // Draw marker
        ctx.beginPath();
        ctx.arc(x, height / 2, 4, 0, Math.PI * 2);
        ctx.fillStyle = event.year === 12026.3 ? '#f00' : '#fff';
        ctx.fill();

        // Draw label if space allows or importance is high
        const shouldShowLabel = zoom > 10 || event.importance >= 3 || (zoom > 1 && event.importance >= 2);
        
        if (shouldShowLabel) {
          ctx.fillStyle = event.year === 12026.3 ? '#f00' : '#fff';
          ctx.font = 'bold 11px sans-serif';
          ctx.textAlign = 'left';
          ctx.fillText(event.title, x + 8, height / 2 - 10);
          
          if (zoom > 5) {
            ctx.font = '10px sans-serif';
            ctx.fillStyle = '#888';
            ctx.fillText(event.year.toFixed(0), x + 8, height / 2 + 5);
          }
        }
      });
    };

    const render = () => {
      ctx.clearRect(0, 0, rect.width, rect.height);
      
      // Horizontal baseline
      ctx.beginPath();
      ctx.moveTo(0, rect.height / 2);
      ctx.lineTo(rect.width, rect.height / 2);
      ctx.strokeStyle = '#111';
      ctx.stroke();

      drawTicks(rect.width, rect.height);
      drawEvents(rect.width, rect.height);
    };

    render();
  }, [centerYear, zoom, screenToWorld]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setLastMouseX(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && lastMouseX !== null) {
      const deltaX = e.clientX - lastMouseX;
      onScroll(deltaX);
      setLastMouseX(e.clientX);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setLastMouseX(null);
  };

  const handleWheel = (e: React.WheelEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const mouseX = e.clientX - rect.left;
    const zoomCenterYear = screenToWorld(mouseX, rect.width);
    onZoom(-e.deltaY, zoomCenterYear);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const mouseX = e.clientX - rect.left;
    const zoomCenterYear = screenToWorld(mouseX, rect.width);
    onZoomTo(zoom * 2, zoomCenterYear);
  };

  return (
    <canvas
      ref={canvasRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      onDoubleClick={handleDoubleClick}
      style={{
        width: '100%',
        height: '400px',
        cursor: isDragging ? 'grabbing' : 'grab',
        touchAction: 'none',
        background: '#000',
      }}
    />
  );
}
