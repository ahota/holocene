import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { worldToScreen } from '../../utils/math';
import { calculateLabelLevels, getLabelGeometry, shouldShowYear } from '../../utils/layout';
import { HistoryEvent } from '../../data/events';
import { Era } from '../../data/eras';
import { shouldShowEraLabel } from '../../utils/eraLayout';
import { MARGIN_UNIT, LABEL_PADDING, CANVAS_HEIGHT_PX, EPOCH_START } from '../../constants';
import { COLOR } from '../../theme';

interface Props {
  centerYear: number;
  zoom: number;
  events: HistoryEvent[];
  eras: Era[];
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
  eras,
  onScroll,
  onZoom,
  onZoomTo,
  todayHE,
  margin,
  onEventClick,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [lastPointerX, setLastPointerX] = useState<number | null>(null);
  const pointerDownXRef = useRef<number | null>(null);
  const hasMovedSignificantRef = useRef(false);

  const DRAG_THRESHOLD_PX = 5;
  const SCROLL_DELTA_THRESHOLD_PX = 0.5;

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
        ctx.font = isToday ? 'bold 12px "Inter", system-ui, sans-serif' : '11px "Inter", system-ui, sans-serif';
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

    // Era bands — faint strips above the baseline; render before
    // baseline/ticks so markers and labels stack on top.
    const eraBandY = height / 2 - 35;
    const eraBandH = 18;
    eras.forEach((era) => {
      const xStart = worldToScreen(era.start, centerYear, zoom, effectiveWidth) + adaptiveMargins.innerBound;
      const xEnd = worldToScreen(era.end, centerYear, zoom, effectiveWidth) + adaptiveMargins.innerBound;
      const bandWidth = xEnd - xStart;
      if (xEnd < 0 || xStart > width || bandWidth <= 0) return;

      // Apply edge-fade opacity using the band's center.
      const cx = (xStart + xEnd) / 2;
      ctx.globalAlpha = getEdgeOpacity(cx, width);
      if (ctx.globalAlpha <= 0) return;

      ctx.fillStyle = COLOR.eraBandBg;
      ctx.fillRect(xStart, eraBandY, bandWidth, eraBandH);
      ctx.strokeStyle = COLOR.hairline;
      ctx.lineWidth = 1;
      ctx.strokeRect(xStart, eraBandY, bandWidth, eraBandH);

      if (shouldShowEraLabel(bandWidth)) {
        ctx.font = '9px "JetBrains Mono", ui-monospace, monospace';
        ctx.fillStyle = COLOR.verdigris;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(era.name.toUpperCase(), cx, eraBandY + eraBandH / 2);
        ctx.textBaseline = 'alphabetic';
        ctx.textAlign = 'start';
      }
    });
    ctx.globalAlpha = 1.0;

    // Background baseline
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.strokeStyle = COLOR.hairline;
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
    ctx.font = '10px "JetBrains Mono", ui-monospace, monospace';

    for (let year = startYear; year <= endYear; year += interval) {
      if (year < EPOCH_START || year > todayHE) continue;
      const x = worldToScreen(year, centerYear, zoom, effectiveWidth) + adaptiveMargins.innerBound;
      const opacity = getEdgeOpacity(x, width);
      ctx.globalAlpha = opacity;
      if (opacity <= 0) continue;

      const isMillennium = year % 1000 === 0;
      const isCentury = year % 100 === 0;

      ctx.beginPath();
      ctx.moveTo(x, height / 2 - (isMillennium ? 25 : isCentury ? 15 : 8));
      ctx.lineTo(x, height / 2 + (isMillennium ? 25 : isCentury ? 15 : 8));
      ctx.strokeStyle = isMillennium ? COLOR.muted : isCentury ? COLOR.dim : COLOR.hairline;
      ctx.stroke();

      if (isMillennium || (zoom > 2 && isCentury) || zoom > 20) {
        ctx.fillStyle = isMillennium ? COLOR.text : COLOR.muted;
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
      if (isToday) {
        ctx.shadowBlur = 14;
        ctx.shadowColor = COLOR.bronzeGlow;
        ctx.fillStyle = COLOR.bronze;
      } else {
        ctx.fillStyle = COLOR.text;
      }
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.shadowColor = 'transparent';

      const selectedY = labelAssignments.get(event);
      if (selectedY !== undefined) {
        const hasYear = shouldShowYear(zoom, isToday);
        const yearLabel = `${Math.floor(eventYear)} HE`;

        ctx.font = isToday ? 'bold 12px "Inter", system-ui, sans-serif' : '11px "Inter", system-ui, sans-serif';
        const titleWidth = ctx.measureText(event.title).width;
        ctx.font = '10px "JetBrains Mono", ui-monospace, monospace';
        const yearWidth = hasYear ? ctx.measureText(yearLabel).width : 0;
        const g = getLabelGeometry(selectedY, hasYear, Math.max(titleWidth, yearWidth));
        const baseY = height / 2;

        ctx.beginPath();
        ctx.moveTo(x, baseY);
        ctx.lineTo(x, baseY + g.centerYOffset);
        ctx.lineTo(x + g.connectorX, baseY + g.centerYOffset);
        ctx.moveTo(x + g.connectorX, baseY + g.bracketTop);
        ctx.lineTo(x + g.connectorX, baseY + g.bracketBottom);
        ctx.strokeStyle = isToday ? COLOR.bronze : COLOR.hairline;
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.font = isToday ? 'bold 12px "Inter", system-ui, sans-serif' : '11px "Inter", system-ui, sans-serif';
        ctx.fillStyle = isToday ? COLOR.bronze : COLOR.text;
        ctx.textAlign = 'left';
        ctx.fillText(event.title, x + g.textX, baseY + g.titleY);

        if (g.yearY !== null) {
          ctx.fillStyle = COLOR.muted;
          ctx.font = '10px "JetBrains Mono", ui-monospace, monospace';
          ctx.fillText(yearLabel, x + g.textX, baseY + g.yearY);
        }
      }
    });
    
    ctx.globalAlpha = 1.0;
  }, [centerYear, zoom, events, eras, screenToWorld, todayHE, adaptiveMargins, getEdgeOpacity, labelAssignments]);

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
        const hasYear = shouldShowYear(zoom, isToday);

        ctx.font = isToday ? 'bold 12px "Inter", system-ui, sans-serif' : '11px "Inter", system-ui, sans-serif';
        const titleWidth = ctx.measureText(event.title).width;
        ctx.font = '10px "JetBrains Mono", ui-monospace, monospace';
        const yearWidth = hasYear ? ctx.measureText(`${Math.floor(eventYear)} HE`).width : 0;
        const g = getLabelGeometry(selectedY, hasYear, Math.max(titleWidth, yearWidth));

        const labelX = x + g.hitRect.x;
        const labelTop = y + g.hitRect.y;

        if (
          mouseX >= labelX &&
          mouseX <= labelX + g.hitRect.w &&
          mouseY >= labelTop &&
          mouseY <= labelTop + g.hitRect.h
        ) {
          // Anchor to the top-center of the label
          onEventClick(event, eventYear, g.hitRect.y, g.hitRect.x + g.hitRect.w / 2);
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
    pointerDownXRef.current = e.clientX;
    hasMovedSignificantRef.current = false;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isDragging && lastPointerX !== null) {
      const deltaX = e.clientX - lastPointerX;
      if (Math.abs(deltaX) > SCROLL_DELTA_THRESHOLD_PX) {
        const rect = canvasRef.current?.getBoundingClientRect();
        if (rect) onScroll(deltaX, rect.width);
        setLastPointerX(e.clientX);
        const downX = pointerDownXRef.current ?? e.clientX;
        if (Math.abs(e.clientX - downX) > DRAG_THRESHOLD_PX) hasMovedSignificantRef.current = true;
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    const canvas = canvasRef.current;
    if (canvas && e.pointerId !== undefined) {
      try { canvas.releasePointerCapture(e.pointerId); } catch(e) {}
    }
    if (!hasMovedSignificantRef.current) {
      triggerHitDetection(e.clientX, e.clientY);
    }
    setIsDragging(false);
    setLastPointerX(null);
    pointerDownXRef.current = null;
  };

  return (
    <div style={{ width: '100%', height: `${CANVAS_HEIGHT_PX}px`, touchAction: 'none' }}>
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
