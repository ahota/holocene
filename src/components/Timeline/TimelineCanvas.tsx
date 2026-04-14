import React, { useRef, useEffect } from 'react';
import { worldToScreen } from '../../utils/math';

interface Props {
  centerYear: number;
  zoom: number;
}

/**
 * Performance-optimized canvas component for rendering the scrolling timeline.
 */
export default function TimelineCanvas({ centerYear, zoom }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high-DPI displays
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const render = () => {
      ctx.clearRect(0, 0, rect.width, rect.height);
      
      // Styling
      ctx.strokeStyle = '#333';
      ctx.fillStyle = '#fff';
      ctx.font = '10px monospace';
      ctx.lineWidth = 1;

      // Draw Today's Marker (always centered initially)
      const todayYear = 12026.3; // Representing approx mid-April 2026
      const todayX = worldToScreen(todayYear, centerYear, zoom, rect.width);
      
      ctx.beginPath();
      ctx.moveTo(todayX, rect.height / 2 - 30);
      ctx.lineTo(todayX, rect.height / 2 + 30);
      ctx.strokeStyle = '#f00'; // Red for today
      ctx.stroke();
      ctx.fillStyle = '#f00';
      ctx.fillText('today', todayX + 5, rect.height / 2 - 35);

      // Draw 12026 Year Start Marker
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

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: '100%',
        height: '200px',
        cursor: 'grab',
        touchAction: 'none'
      }}
    />
  );
}
