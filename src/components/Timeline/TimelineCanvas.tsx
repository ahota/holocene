import React, { useRef, useEffect, useState, useCallback } from 'react';
import { worldToScreen } from '../../utils/math';
import { events } from '../../data/events';

interface Props {
  centerYear: number;
  zoom: number;
  onScroll: (deltaX: number, screenWidth: number) => void;
  onZoom: (delta: number, zoomCenterYear: number, screenWidth: number) => void;
  onZoomTo: (targetZoom: number, zoomCenterYear: number, screenWidth: number) => void;
  todayHE: number;
}

/**
 * Performance-optimized canvas component with unified Pointer Events for mouse and touch.
 */
export default function TimelineCanvas({
  centerYear,
  zoom,
  onScroll,
  onZoom,
  onZoomTo,
  todayHE,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [lastPointerX, setLastPointerX] = useState<number | null>(null);
  const [hasMoved, setHasMoved] = useState(false);

  const screenToWorld = useCallback(
    (screenX: number, screenWidth: number) => {
      return (screenX - screenWidth / 2) / zoom + centerYear;
    },
    [centerYear, zoom]
  );

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    }

    ctx.clearRect(0, 0, width, height);
    
    // Background baseline
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Adaptive Ticking Logic
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

      const x = worldToScreen(year, centerYear, zoom, width);
      const isMillennium = year % 1000 === 0;
      const isCentury = year % 100 === 0;

      ctx.beginPath();
      ctx.moveTo(x, height / 2 - (isMillennium ? 25 : isCentury ? 15 : 8));
      ctx.lineTo(x, height / 2 + (isMillennium ? 25 : isCentury ? 15 : 8));
      ctx.strokeStyle = isMillennium ? '#666' : isCentury ? '#333' : '#222';
      ctx.stroke();

      if (isMillennium || (zoom > 2 && isCentury) || zoom > 20) {
        ctx.fillStyle = isMillennium ? '#fff' : '#888';
        ctx.fillText(year.toString(), x, height / 2 + (isMillennium ? 40 : 30));
      }
    }

    // Historical Events
    events.forEach((event) => {
      // Use dynamic today for "Present Day" event
      const eventYear = event.isToday ? todayHE : event.year;
      
      const x = worldToScreen(eventYear, centerYear, zoom, width);
      if (x < -200 || x > width + 200) return;

      const isToday = event.isToday || eventYear >= todayHE;
      
      ctx.beginPath();
      ctx.arc(x, height / 2, isToday ? 5 : 4, 0, Math.PI * 2);
      ctx.fillStyle = isToday ? '#f00' : '#fff';
      ctx.fill();

      const shouldShowLabel = zoom > 5 || event.importance >= 3 || (zoom > 1 && event.importance >= 2);
      if (shouldShowLabel || isToday) {
        ctx.fillStyle = isToday ? '#f00' : '#fff';
        ctx.font = isToday ? 'bold 12px sans-serif' : '11px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(event.title, x + 10, height / 2 - 15);
        
        if (zoom > 1 || isToday) {
          ctx.fillStyle = '#666';
          ctx.font = '10px monospace';
          ctx.fillText(`${Math.floor(eventYear)} HE`, x + 10, height / 2 + 5);
        }
      }
    });
  }, [centerYear, zoom, screenToWorld, todayHE]);

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
      
      if (Math.abs(deltaX) > 1) {
        onScroll(deltaX, rect.width);
        setLastPointerX(e.clientX);
        setHasMoved(true);
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.releasePointerCapture(e.pointerId);
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
    const width = rect.width;

    for (const event of events) {
      const eventYear = event.isToday ? todayHE : event.year;
      const x = worldToScreen(eventYear, centerYear, zoom, width);
      const y = rect.height / 2;
      const dist = Math.sqrt(Math.pow(x - mouseX, 2) + Math.pow(y - mouseY, 2));
      
      if (dist < 20) {
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
    <div ref={containerRef} style={{ width: '100%', height: '400px', margin: '2rem 0' }}>
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
