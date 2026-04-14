import React, { useRef, useEffect, useState, useCallback } from 'react';
import { worldToScreen } from '../../utils/math';

interface Props {
  centerYear: number;
  zoom: number;
  onScroll: (deltaX: number) => void;
  onZoom: (delta: number, zoomCenterYear: number) => void;
  onZoomTo: (targetZoom: number, zoomCenterYear: number) => void;
}

/**
 * Performance-optimized canvas component with interactive drag and zoom handling.
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

  // Screen to world (year) conversion
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

    const render = () => {
      ctx.clearRect(0, 0, rect.width, rect.height);
      ctx.strokeStyle = '#333';
      ctx.fillStyle = '#fff';
      ctx.font = '10px monospace';

      const todayYear = 12026.3;
      const todayX = worldToScreen(todayYear, centerYear, zoom, rect.width);

      ctx.beginPath();
      ctx.moveTo(todayX, rect.height / 2 - 30);
      ctx.lineTo(todayX, rect.height / 2 + 30);
      ctx.strokeStyle = '#f00';
      ctx.stroke();
      ctx.fillStyle = '#f00';
      ctx.fillText('today', todayX + 5, rect.height / 2 - 35);

      const startOfYearX = worldToScreen(12026, centerYear, zoom, rect.width);
      ctx.beginPath();
      ctx.moveTo(startOfYearX, rect.height / 2 - 15);
      ctx.lineTo(startOfYearX, rect.height / 2 + 15);
      ctx.strokeStyle = '#fff';
      ctx.stroke();
      ctx.fillStyle = '#fff';
      ctx.fillText('12026 HE', startOfYearX + 5, rect.height / 2 + 30);
    };

    render();
  }, [centerYear, zoom]);

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
    onZoomTo(zoom * 2, zoomCenterYear); // Zoom in by one step
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
        height: '300px',
        cursor: isDragging ? 'grabbing' : 'grab',
        touchAction: 'none',
        background: '#050505',
      }}
    />
  );
}
