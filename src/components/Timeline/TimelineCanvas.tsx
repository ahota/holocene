import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { worldToScreen } from '../../utils/math';
import { calculateLabelLevels } from '../../utils/layout';
import { HistoryEvent } from '../../data/events';
import { MARGIN_UNIT, LABEL_PADDING } from '../../constants';

interface Props {
  centerYear: number;
  zoom: number;
  events: HistoryEvent[];
  onScroll: (deltaX: number, screenWidth: number) => void;
  onZoom: (delta: number, zoomCenterYear: number, screenWidth: number) => void;
  onZoomTo: (targetZoom: number, zoomCenterYear: number, screenWidth: number) => void;
  todayHE: number;
  margin: number;
  onEventClick: (event: HistoryEvent, year: number, yOffset: number, xOffset: number) => void;
}

/**
 * Performance-optimized canvas component with adaptive margins and smart collision-aware labels.
 */
export default function TimelineCanvas({
  centerYear,
  zoom,
  events,
  onScroll,
  onZoom,
  onZoomTo,
  todayHE,
  margin,
  onEventClick,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [lastPointerX, setLastPointerX] = useState<number | null>(null);
  const [hasMovedSignificant, setHasMovedSignificant] = useState(false);

  const labelAssignments = useMemo(() => {
    // Note: We need a temporary ctx to measure text
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return new Map<HistoryEvent, number>();

    const levels = [-35, -70, -105, 70, 105, 140];

    return calculateLabelLevels(
      events,
      zoom,
      todayHE,
      (text, isToday) => {
        ctx.font = isToday ? 'bold 12px sans-serif' : '11px sans-serif';
        return ctx.measureText(text).width;
      },
      LABEL_PADDING,
      levels
    );
  }, [events, zoom, todayHE]);

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
    
    // Background baseline
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Ticks
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
      ctx.globalAlpha = opacity;
      if (opacity <= 0) continue;

      const isMillennium = year % 1000 === 0;
      const isCentury = year % 100 === 0;

      ctx.beginPath();
      ctx.moveTo(x, height / 2 - (isMillennium ? 25 : isCentury ? 15 : 8));
      ctx.lineTo(x, height / 2 + (isMillennium ? 25 : isCentury ? 15 : 8));
      ctx.strokeStyle = isMillennium ? '#999' : isCentury ? '#666' : '#444';
      ctx.stroke();

      if (isMillennium || (zoom > 2 && isCentury) || zoom > 20) {
        ctx.fillStyle = isMillennium ? '#fff' : '#aaa';
        ctx.fillText(year.toString(), x, height / 2 + (isMillennium ? 40 : 30));
      }
    }

    // Historical Events with stable collision-aware labels
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

      const selectedY = labelAssignments.get(event);
      if (selectedY !== undefined) {
        const hasYear = zoom > 1 || isToday;
        // The vertical center of the text group relative to selectedY
        // If hasYear, we have two lines of text (approx 24px total height)
        // Title is at selectedY, Year is at selectedY + 12.
        // Center is roughly selectedY + 4.
        const centerY = selectedY + (hasYear ? 4 : -2);

        ctx.beginPath();
        ctx.moveTo(x, height / 2);
        ctx.lineTo(x, height / 2 + centerY); // Vertical line to center height
        ctx.lineTo(x + 12, height / 2 + centerY); // Horizontal connector
        
        // Vertical bar "bracket" for the label group
        ctx.moveTo(x + 12, height / 2 + selectedY - 10);
        ctx.lineTo(x + 12, height / 2 + selectedY + (hasYear ? 16 : 4));
        
        ctx.strokeStyle = isToday ? 'rgba(255, 68, 68, 0.5)' : 'rgba(255, 255, 255, 0.25)';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.font = isToday ? 'bold 12px sans-serif' : '11px sans-serif';
        ctx.fillStyle = isToday ? '#ff4444' : '#ffffff';
        ctx.textAlign = 'left';
        ctx.fillText(event.title, x + 20, height / 2 + selectedY);
        
        if (hasYear) {
          ctx.fillStyle = '#888';
          ctx.font = '10px monospace';
          ctx.fillText(`${Math.floor(eventYear)} HE`, x + 20, height / 2 + selectedY + 12);
        }
      }
    });
    
    ctx.globalAlpha = 1.0;
  }, [centerYear, zoom, events, screenToWorld, todayHE, adaptiveMargins, getEdgeOpacity, labelAssignments]);

  useEffect(() => { draw(); }, [draw]);

  const triggerHitDetection = (clientX: number, clientY: number) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;

    const mouseX = clientX - rect.left;
    const mouseY = clientY - rect.top;
    const effectiveWidth = getEffectiveWidth(rect.width);

    for (const event of events) {
      const eventYear = event.isToday ? todayHE : event.year;
      const x = worldToScreen(eventYear, centerYear, zoom, effectiveWidth) + adaptiveMargins.innerBound;
      const y = rect.height / 2;
      
      // Marker hit detection
      const dist = Math.sqrt(Math.pow(x - mouseX, 2) + Math.pow(y - mouseY, 2));
      if (dist < 15) {
        // Anchor to the top of the dot (radius 5)
        onEventClick(event, eventYear, -5, 0);
        return true;
      }

      // Label hit detection
      const selectedY = labelAssignments.get(event);
      if (selectedY !== undefined) {
        const isToday = event.isToday || eventYear >= todayHE;
        ctx.font = isToday ? 'bold 12px sans-serif' : '11px sans-serif';
        const titleWidth = ctx.measureText(event.title).width;
        
        const hasYear = zoom > 1 || isToday;
        const yearWidth = hasYear ? ctx.measureText(`${Math.floor(eventYear)} HE`).width : 0;
        const textMaxWidth = Math.max(titleWidth, yearWidth);
        
        const labelX = x + 12; // Start of connector/bracket
        const labelWidth = 8 + textMaxWidth + 10; // bracket-to-text offset (8) + text + extra padding
        const labelHeight = hasYear ? 32 : 16;
        const labelTop = y + selectedY - 12;

        if (
          mouseX >= labelX && 
          mouseX <= labelX + labelWidth && 
          mouseY >= labelTop && 
          mouseY <= labelTop + labelHeight
        ) {
          // Anchor to the top-center of the label
          onEventClick(event, eventYear, selectedY - 12, 12 + labelWidth / 2);
          return true;
        }
      }
    }
    return false;
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.setPointerCapture(e.pointerId);
    setIsDragging(true);
    setLastPointerX(e.clientX);
    setHasMovedSignificant(false);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isDragging && lastPointerX !== null) {
      const deltaX = e.clientX - lastPointerX;
      if (Math.abs(deltaX) > 0.5) {
        const rect = canvasRef.current?.getBoundingClientRect();
        if (rect) onScroll(deltaX, rect.width);
        setLastPointerX(e.clientX);
        if (Math.abs(e.clientX - (lastPointerX || 0)) > 5) setHasMovedSignificant(true);
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    const canvas = canvasRef.current;
    if (canvas && e.pointerId !== undefined) {
      try { canvas.releasePointerCapture(e.pointerId); } catch(e) {}
    }
    if (!hasMovedSignificant) {
      triggerHitDetection(e.clientX, e.clientY);
    }
    setIsDragging(false);
    setLastPointerX(null);
  };

  return (
    <div ref={containerRef} style={{ width: '100%', height: '400px', touchAction: 'none' }}>
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onWheel={(e) => {
          const rect = canvasRef.current?.getBoundingClientRect();
          if (!rect) return;
          onZoom(-e.deltaY, screenToWorld(e.clientX - rect.left, rect.width), rect.width);
        }}
        onDoubleClick={(e) => {
          const rect = canvasRef.current?.getBoundingClientRect();
          if (!rect) return;
          onZoomTo(zoom * 2, screenToWorld(e.clientX - rect.left, rect.width), rect.width);
        }}
        style={{ width: '100%', height: '100%', cursor: isDragging ? 'grabbing' : 'grab', touchAction: 'none' }}
      />
    </div>
  );
}
