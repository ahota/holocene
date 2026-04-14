# 2026-04-13-holocene-timeline-design

## Overview
An interactive timeline visualization of the Holocene calendar (Human Era/HE), where 0 HE is 10,001 BC and the current year is 12026 HE. The application features a dramatic "odometer" reveal and a performance-optimized, zoomable canvas timeline of human history.

## Visual Style: Modern Minimalist
- **Colors:** Deep black background (#000), high-contrast white text (#FFF).
- **Typography:** Bold, clean sans-serif for the year; monospace for technical tick labels.
- **Atmosphere:** Focus on space and scale, emphasizing the vastness of the 12,000-year epoch.

## Key Features & Interaction

### 1. The Odometer Reveal
- **Initial View:** A centered heading "the year is" above a large "2026".
- **Visual Tension:** The "2026" is positioned within a 5-digit fixed-width container, making it appear visually off-center to the right.
- **Animation Sequence:**
    - 1.5-second pause.
    - Animation begins slowly, rolling the ones place.
    - Accelerates rapidly as tens, hundreds, and thousands begin to roll.
    - Speed peaks to cover the 10,000-year gap.
    - Decelerates as it approaches 12026, with the "1" having appeared on the far left.
- **Final State:** "12026" is perfectly centered.

### 2. Adaptive Canvas Timeline
- **Rendering:** HTML5 Canvas for high-performance 60fps interaction.
- **Initial Position:** "Today" (current day of 12026 HE) is centered. The current year (12026 HE) start tick is visible near the left edge.
- **Physical Strip Interaction:**
    - The timeline is a single "object" the user drags.
    - Dragging right moves the strip right, moving "Today" off-screen and revealing the past from the left.
- **Adaptive Ticking (LOD):**
    - Zoom Level 1 (Close): Individual years, decades, centuries.
    - Zoom Level N (Medium): Centuries and millennia.
    - Max Zoom (Epoch): Millennia markers, showing the full 0–12026 HE span.
- **Logarithmic Zoom:** A slider and double-click zoom mechanism centered on the cursor/date.

### 3. Historical Milestones (Hybrid Source)
- **Data:** Hardcoded `events.ts` for core milestones (Agriculture, Writing, Rome, etc.), extensible via JSON.
- **Rendering:** Small vertical markers on the canvas. Labels appear/fade based on available screen real estate to prevent overlap.
- **Detail View:** Minimalist overlay on click/hover.

## Technical Architecture

### Component Breakdown
- `App`: State owner (Year, Zoom, Scroll Offset).
- `Odometer`: 5-reel vertical digit roll animation.
- `Timeline`: Canvas engine with `requestAnimationFrame` loop.
- `ZoomSlider`: Logarithmic input synced with canvas scale.

### Data Model
```typescript
interface HistoryEvent {
  year: number; // HE
  title: string;
  description: string;
  importance: number; // 1-3 for adaptive labeling
}
```

### Coordinate System
- **World Space:** 1 unit = 1 year.
- **Screen Space:** `x = (year - centerYear) * pixelsPerYear + screenWidth / 2`.
- **Zoom:** `pixelsPerYear` scales logarithmically from 1 year/screen to 12026 years/screen.

## Testing & Validation
- **Logic:** Unit tests for world-to-screen transforms and odometer digit sequencing.
- **Performance:** Stress test with 100+ events and rapid zooming on mobile/low-end devices.
- **Visuals:** Manual verification of the "off-center to centered" transition.
