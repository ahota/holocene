# Holocene Theme Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use
> superpowers:subagent-driven-development (recommended) or
> superpowers:executing-plans to implement this plan task-by-task.
> Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement
`docs/superpowers/specs/2026-04-26-holocene-theme-design.md` end-to-end:
warm-dark palette, JetBrains Mono / Inter typography, annometer rename,
themed placard and slider, era bands, drifting fog overlay.

**Architecture:** Visual tokens centralize in `src/theme.ts` and feed
every component. A new `Fog` component handles the drifting-noise gutter
overlay. `Odometer` renames to `Annometer` (the device shows years, not
distance). Era bands render on the canvas alongside markers and ticks;
era data lives in a new `src/data/eras.ts` (initially empty — populated
by the next spec).

**Tech Stack:** React 18, TypeScript, Vite, Vitest. Google Fonts
(JetBrains Mono, Inter). HTML canvas. Pure CSS for fog (SVG
`feTurbulence` data URL + keyframes).

---

## Conventions

- Each task ends with a commit. Subject is 50-char imperative
  lowercase. Body bullets only when needed. End with blank line +
  `+claude` (per `CLAUDE.md` and `GEMINI.md`).
- Visual changes require a browser check before committing (per
  `GEMINI.md` "NEVER commit changes without performing a visual or
  interactive test first").
- Between tasks: `npm run build` (typecheck + Vite build) and
  `npm test` (Vitest single-pass) must succeed.
- Dev server (`npm run dev`) is assumed running on
  http://localhost:5173 throughout. Refresh between tasks for visual
  checks.

## File map

**Created:**
- `src/components/Annometer/Annometer.tsx` (renamed from Odometer)
- `src/components/Annometer/Annometer.css` (renamed from Odometer)
- `src/components/Fog/Fog.tsx`
- `src/components/Fog/Fog.css`
- `src/data/eras.ts`
- `src/utils/eraLayout.ts`
- `src/utils/eraLayout.test.ts`

**Deleted:**
- `src/components/Odometer/Odometer.tsx`
- `src/components/Odometer/Odometer.css`

**Modified:**
- `src/theme.ts`
- `src/App.tsx`
- `src/components/Timeline/TimelineCanvas.tsx`
- `src/components/ZoomSlider/ZoomSlider.tsx`
- `index.html`
- `CLAUDE.md`

---

## Task 1: Expand theme tokens and gate bg by reveal phase

**Files:**
- Modify: `src/theme.ts` (full token expansion)
- Modify: `src/App.tsx` (outer div bg conditional on `revealDone`,
  with CSS transition tied to `ANIM_MS.fadeIn`)

- [ ] **Step 1: Replace `src/theme.ts` content**

```ts
/**
 * Shared visual tokens. Use these in lieu of inline color or duration
 * literals so the palette and motion stay coherent across components.
 */

export const COLOR = {
  // page surfaces
  bg: '#15130f',
  bgReveal: '#000000',
  surface: '#2a2620',

  // text
  text: '#c9c3b4',
  muted: '#7a7466',
  dim: '#5a544a',

  // accents
  bronze: '#b88a4a',
  bronzeGlow: 'rgba(184,138,74,0.4)',
  verdigris: '#6a857d',

  // structure
  hairline: '#2c2a25',
  eraBandBg: '#1a1916',

  // placard
  placardTitle: '#d8d0bd',
  placardBody: '#b3ad9d',
  placardYear: '#8a8275',

  // legacy aliases (removed in Task 4 once App.tsx migrates)
  fg: '#c9c3b4',
  body: '#b3ad9d',
  border: '#2c2a25',
} as const;

export const SHADOW = {
  popup:
    '0 8px 28px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.05)',
} as const;

export const ANIM_MS = {
  popup: 200,
  reveal: 1000,
  fadeIn: 1500,
  fogDrift: 28000,
} as const;

export const Z = {
  reveal: 10,
  popup: 100,
} as const;
```

- [ ] **Step 2: Update App.tsx outer div for bg-phase logic**

In `src/App.tsx`, replace the outer `<div className="app">` opening
(currently around lines 54–57):

```tsx
<div
  className="app"
  style={{
    backgroundColor: revealDone ? COLOR.bg : COLOR.bgReveal,
    color: COLOR.text,
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    transition: `background-color ${ANIM_MS.fadeIn}ms ease-out`,
  }}
  onPointerDown={() => handleDismiss()}
>
```

- [ ] **Step 3: Verify build is clean**

```bash
npm run build
```

Expected: `tsc` succeeds; vite build emits assets; no errors.

- [ ] **Step 4: Verify tests still pass**

```bash
npm test
```

Expected: 14 tests pass across 3 files.

- [ ] **Step 5: Visual check**

Refresh http://localhost:5173. Verify:
- Initial reveal: page is pure black, chronometer digits are white.
- After the chronometer slides up (~7s), bg fades from `#000` to
  warm-dark (`#15130f`) over ~1.5s.
- Post-reveal bg is visibly different from pure black.

- [ ] **Step 6: Commit**

```bash
git add src/theme.ts src/App.tsx
git commit -m "$(cat <<'EOF'
expand theme palette and gate bg by reveal phase

+claude
EOF
)"
```

---

## Task 2: Load JetBrains Mono and Inter fonts

**Files:**
- Modify: `index.html` (add Google Fonts `<link>` tags)

- [ ] **Step 1: Edit `index.html`**

Add inside `<head>`, immediately after the `<meta name="viewport">`
line:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link
  href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=Inter:wght@400;500;600;700&display=swap"
  rel="stylesheet"
>
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

Expected: build succeeds.

- [ ] **Step 3: Visual check**

Refresh http://localhost:5173. Open DevTools Network tab; confirm
`fonts.googleapis.com/css2?...` and `fonts.gstatic.com/...` requests
succeed (200). The page renders as before — fonts aren't applied to
anything yet.

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "$(cat <<'EOF'
load jetbrains mono and inter fonts

+claude
EOF
)"
```

---

## Task 3: Rename Odometer to Annometer

**Files:**
- Move: `src/components/Odometer/Odometer.tsx` →
  `src/components/Annometer/Annometer.tsx`
- Move: `src/components/Odometer/Odometer.css` →
  `src/components/Annometer/Annometer.css`
- Modify: `src/components/Annometer/Annometer.tsx`
  (component name, CSS class names, aria-label, CSS import path)
- Modify: `src/components/Annometer/Annometer.css`
  (class names, font-family)
- Modify: `src/App.tsx` (import path + JSX tag)

- [ ] **Step 1: Rename the directory and files via git**

```bash
git mv src/components/Odometer src/components/Annometer
git mv src/components/Annometer/Odometer.tsx src/components/Annometer/Annometer.tsx
git mv src/components/Annometer/Odometer.css src/components/Annometer/Annometer.css
```

- [ ] **Step 2: Update `Annometer.tsx`**

Replace the file contents (was Odometer.tsx). Key changes: function
name `Odometer` → `Annometer`, CSS import `./Odometer.css` →
`./Annometer.css`, classNames `odometer-*` → `annometer-*`,
`aria-label` says "year". Full file:

```tsx
import React, { useState, useEffect, useRef, useMemo } from 'react';
import './Annometer.css';

interface Props {
  targetYear: number;
  initialYear: number;
  onComplete: () => void;
}

/**
 * A mechanical-style year readout with a "sliding down" reveal effect.
 */
export default function Annometer({
  targetYear,
  initialYear,
  onComplete,
}: Props) {
  const [current, setCurrent] = useState(initialYear);
  const startTime = useRef<number | null>(null);
  const animationDuration = 7000;
  const startDelay = 1500;

  useEffect(() => {
    const timer = setTimeout(() => {
      const step = (timestamp: number) => {
        if (!startTime.current) startTime.current = timestamp;
        const progress = Math.min((timestamp - startTime.current) / animationDuration, 1);

        // Quart-in-out easing
        const ease = progress < 0.5
            ? 8 * progress * progress * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 4) / 2;

        const val = initialYear + (targetYear - initialYear) * ease;

        if (progress < 1) {
          setCurrent(val);
          requestAnimationFrame(step);
        } else {
          setCurrent(targetYear);
          onComplete();
        }
      };
      requestAnimationFrame(step);
    }, startDelay);

    return () => clearTimeout(timer);
  }, [targetYear, initialYear, onComplete]);

  const standardDigits = useMemo(() => [0, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0], []);
  const digitsWithBlank = useMemo(() => [0, 9, 8, 7, 6, 5, 4, 3, 2, 1, ' '], []);
  const itemHeightPercent = 100 / 11;

  const offsets = useMemo(() => {
    const res = [0, 0, 0, 0, 0];
    for (let i = 4; i >= 0; i--) {
      const power = Math.pow(10, 4 - i);
      if (i === 4) {
        res[i] = (Math.floor(current) % 10) + (current % 1);
      } else {
        const pull = res[i + 1] > 9 ? res[i + 1] - 9 : 0;
        res[i] = (Math.floor(current / power) % 10) + pull;
      }
    }
    return res;
  }, [current]);

  return (
    <div className="annometer-container" aria-label={`The year is ${Math.floor(current)}`}>
      {offsets.map((offset, i) => {
        const reelDigits = i === 0 ? digitsWithBlank : standardDigits;
        const visualOffset = 10 - offset;

        return (
          <div key={i} className="reel-container">
            <div
              className="reel"
              style={{ transform: `translateY(${-visualOffset * itemHeightPercent}%)` }}
            >
              {reelDigits.map((digit, dIndex) => (
                <div
                  key={dIndex}
                  className="digit"
                  style={{ opacity: Math.max(0, 1 - Math.abs(dIndex - visualOffset) * 0.7) }}
                >
                  {digit}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 3: Update `Annometer.css`**

Replace contents:

```css
.annometer-container {
  display: flex;
  font-size: 5rem;
  font-weight: 800;
  height: 1.2em;
  overflow: hidden;
  justify-content: flex-end;
  width: 5ch;
  background-color: transparent;
  color: #fff;
  line-height: 1.2;
  font-family: "JetBrains Mono", ui-monospace, monospace;
}

.reel-container {
  position: relative;
  width: 1ch;
  height: 100%;
  overflow: visible;
  transition: opacity 0.5s ease-in-out;
}

.reel-container.hidden {
  opacity: 0;
}

.reel {
  display: flex;
  flex-direction: column;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  will-change: transform;
}

.digit {
  height: 1.2em;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: inherit;
  user-select: none;
}
```

- [ ] **Step 4: Update App.tsx import and JSX**

In `src/App.tsx`:
- Change `import Odometer from './components/Odometer/Odometer';` to
  `import Annometer from './components/Annometer/Annometer';`
- Change the JSX tag `<Odometer ... />` to `<Annometer ... />`

- [ ] **Step 5: Verify build and tests**

```bash
npm run build && npm test
```

Expected: typecheck passes; 14 tests pass.

- [ ] **Step 6: Visual check**

Refresh http://localhost:5173. Verify:
- The reveal still works: digits flip from current CE year to HE year.
- Digits render in JetBrains Mono (geometric mono, not the OS default).
- Aria label is correct (Inspect element on the container).

- [ ] **Step 7: Commit**

```bash
git add -A src/components/Annometer src/components/Odometer src/App.tsx
git commit -m "$(cat <<'EOF'
rename odometer to annometer

+claude
EOF
)"
```

---

## Task 4: Apply theme tokens to App shell

Drops the remaining inline color/duration literals from `App.tsx` in
favor of the new tokens. Restyles the placard. Themes the hint. Removes
legacy aliases (`fg`, `body`, `border`) from `theme.ts` once unused.

**Files:**
- Modify: `src/App.tsx` (eyebrow, HE subtitle, placard surface and
  typography, hint text)
- Modify: `src/theme.ts` (drop legacy `fg`, `body`, `border` after
  callers migrate)

- [ ] **Step 1: Update App.tsx `<h1>` ("the year is") and "human era (HE)" subtitle**

Both styled inside the chronometer div. Keep the existing spacing /
sizing; only change color tokens:

```tsx
<h1 style={{
  fontWeight: 300,
  marginBottom: '2rem',
  letterSpacing: '0.1rem',
  textTransform: 'lowercase',
  color: COLOR.muted,
  fontSize: '1rem',
  fontFamily: '"JetBrains Mono", ui-monospace, monospace',
}}>the year is</h1>
```

```tsx
<div style={{
  marginTop: '2rem',
  opacity: revealDone ? 0.5 : 0,
  transition: `opacity ${ANIM_MS.reveal}ms ease-in`,
  fontFamily: '"JetBrains Mono", ui-monospace, monospace',
  fontSize: '0.8rem',
  letterSpacing: '2px',
  color: COLOR.dim,
}}>human era (HE)</div>
```

- [ ] **Step 2: Update App.tsx hint text style**

The existing hint text "scroll or drag to explore the past":

```tsx
<div style={{
  position: 'fixed',
  bottom: '20px',
  fontFamily: '"JetBrains Mono", ui-monospace, monospace',
  fontSize: '0.6rem',
  pointerEvents: 'none',
  color: COLOR.dim,
  letterSpacing: '0.16em',
  textTransform: 'lowercase',
}}>scroll or drag to explore the past</div>
```

- [ ] **Step 3: Update App.tsx placard styles**

Replace the `<div>` rendering the popup (the `selectedEvent && (...)`
block, around lines 85–119). The structural elements stay the same;
only style values change:

```tsx
{selectedEvent && (
  <div
    style={{
      position: 'absolute',
      left: clampedX,
      top: popupY,
      transform: 'translate(-50%, -100%) translateY(-10px)',
      backgroundColor: COLOR.surface,
      borderLeft: `2px solid ${COLOR.bronze}`,
      padding: '1rem',
      width: `${popupWidth}px`,
      zIndex: Z.popup,
      boxShadow: SHADOW.popup,
      animation: `${showPopup ? 'popIn' : 'popOut'} ${ANIM_MS.popup}ms ease-out forwards`,
      pointerEvents: 'auto',
      fontFamily: '"Inter", system-ui, sans-serif',
    }}
    onPointerDown={(e) => e.stopPropagation()}
  >
    <div style={{
      fontWeight: 700,
      fontSize: '0.95rem',
      marginBottom: '0.5rem',
      color: COLOR.placardTitle,
      lineHeight: 1.2,
    }}>{selectedEvent.title}</div>
    <div style={{
      fontSize: '0.78rem',
      color: COLOR.placardBody,
      lineHeight: 1.55,
    }}>{selectedEvent.description}</div>
    <div style={{
      marginTop: '0.7rem',
      fontSize: '0.62rem',
      color: COLOR.placardYear,
      fontFamily: '"JetBrains Mono", ui-monospace, monospace',
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
    }}>{Math.floor(selectedEvent.isToday ? TODAY : selectedEvent.year)} HE</div>
    <div style={{
      position: 'absolute',
      bottom: '-6px',
      left: `calc(50% + ${popupX - clampedX}px)`,
      transform: 'translateX(-50%) rotate(45deg)',
      width: '10px',
      height: '10px',
      backgroundColor: COLOR.surface,
      display: Math.abs(popupX - clampedX) > popupWidth / 2 - 5 ? 'none' : 'block',
    }} />
  </div>
)}
```

The arrow no longer has visible borders — it's a square of the same
color as the surface, rotated. This reads as a continuation of the
placard rather than a tooltip notch.

- [ ] **Step 4: Verify no callers reference legacy aliases**

```bash
grep -rn "COLOR\.fg\|COLOR\.body\|COLOR\.border" src/
```

Expected: no matches. (If any remain, replace them with the explicit
tokens — `COLOR.text` for `fg`, `COLOR.placardBody` for `body`,
`COLOR.hairline` for `border` — and re-grep.)

- [ ] **Step 5: Drop legacy aliases from `src/theme.ts`**

Remove these three lines from the `COLOR` object:

```ts
  // legacy aliases (removed in Task 4 once App.tsx migrates)
  fg: '#c9c3b4',
  body: '#b3ad9d',
  border: '#2c2a25',
```

- [ ] **Step 6: Verify build and tests**

```bash
npm run build && npm test
```

- [ ] **Step 7: Visual check**

Refresh. Click an event marker to open the placard. Verify:
- Placard background is the warm dim surface (#2a2620).
- Bronze 2px rule on the left edge.
- Soft shadow plus a faint inner-top highlight (slight glow at the
  top edge, like light from above).
- Title is in Inter (humanist sans, not the OS default).
- Year footer is in JetBrains Mono uppercase letter-spaced.
- Arrow at bottom matches surface color, no visible border.
- "the year is" and "human era (HE)" use JetBrains Mono with the new
  muted/dim colors.
- Hint text at the bottom is JetBrains Mono lowercase, dim.

- [ ] **Step 8: Commit**

```bash
git add src/App.tsx src/theme.ts
git commit -m "$(cat <<'EOF'
apply theme tokens to app shell and placard

+claude
EOF
)"
```

---

## Task 5: Apply theme tokens to TimelineCanvas

Replaces every inline color literal in the canvas drawing with `COLOR`
tokens. Simplifies the marker color rule (uniform past, bronze today
with glow). Switches canvas font strings to Inter (titles) and
JetBrains Mono (years/ticks).

**Files:**
- Modify: `src/components/Timeline/TimelineCanvas.tsx`

- [ ] **Step 1: Add theme import**

At the top of `TimelineCanvas.tsx`, add:

```ts
import { COLOR } from '../../theme';
```

- [ ] **Step 2: Replace tick and baseline colors in `draw()`**

In the `draw` callback, replace:
- Background baseline `ctx.strokeStyle = '#333';` → `ctx.strokeStyle = COLOR.hairline;`
- Tick stroke `ctx.strokeStyle = isMillennium ? '#999' : isCentury ? '#666' : '#444';`
  → `ctx.strokeStyle = isMillennium ? COLOR.muted : isCentury ? COLOR.dim : COLOR.hairline;`
- Tick label `ctx.fillStyle = isMillennium ? '#fff' : '#aaa';`
  → `ctx.fillStyle = isMillennium ? COLOR.text : COLOR.muted;`
- Tick label font `ctx.font = '10px monospace';`
  → `ctx.font = '10px "JetBrains Mono", ui-monospace, monospace';`

- [ ] **Step 3: Update marker drawing**

Find the per-event block:

```ts
ctx.beginPath();
ctx.arc(x, height / 2, isToday ? 5 : 4, 0, Math.PI * 2);
ctx.fillStyle = isToday ? '#ff0000' : '#ffffff';
ctx.fill();
```

Replace with:

```ts
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
```

- [ ] **Step 4: Update connector / bracket lines and label fonts**

In the same per-event block where labels render, replace:

- Connector stroke
  `ctx.strokeStyle = isToday ? 'rgba(255, 68, 68, 0.5)' : 'rgba(255, 255, 255, 0.25)';`
  → `ctx.strokeStyle = isToday ? COLOR.bronze : COLOR.hairline;`
- Title font
  `ctx.font = isToday ? 'bold 12px sans-serif' : '11px sans-serif';`
  → `ctx.font = isToday ? 'bold 12px "Inter", system-ui, sans-serif' : '11px "Inter", system-ui, sans-serif';`
- Title fill `ctx.fillStyle = isToday ? '#ff4444' : '#ffffff';`
  → `ctx.fillStyle = isToday ? COLOR.bronze : COLOR.text;`
- Year font and fill (the `if (g.yearY !== null)` branch):
  `ctx.fillStyle = '#888';` → `ctx.fillStyle = COLOR.muted;`
  `ctx.font = '10px monospace';` → `ctx.font = '10px "JetBrains Mono", ui-monospace, monospace';`

- [ ] **Step 5: Update label-measurement font calls**

The `labelAssignments` `useMemo` and `triggerHitDetection` both
measure text by setting `ctx.font` first. Update both call sites:

- `ctx.font = isToday ? 'bold 12px sans-serif' : '11px sans-serif';`
  → `ctx.font = isToday ? 'bold 12px "Inter", system-ui, sans-serif' : '11px "Inter", system-ui, sans-serif';`
- `ctx.font = '10px monospace';`
  → `ctx.font = '10px "JetBrains Mono", ui-monospace, monospace';`

(Both occur inside `labelAssignments`'s closure and inside the draw
loop's hit-test path. Search-and-replace on the file is fine — there
are exactly two `'sans-serif'` and three `monospace` occurrences in
the canvas code.)

- [ ] **Step 6: Verify build and tests**

```bash
npm run build && npm test
```

Expected: clean.

- [ ] **Step 7: Visual check**

Refresh. Verify in the post-reveal timeline:
- Background is warm-dark, baseline is barely-there hairline.
- Year-tick numbers (e.g., 2000, 5000, ...) render in JetBrains Mono.
- Marker labels (event titles) render in Inter.
- Past markers are warm cream (`#c9c3b4`).
- Today marker is bronze with a soft glow. Connector under it is
  bronze (not the old desaturated red).
- Other connectors are subtle hairline lines.

- [ ] **Step 8: Commit**

```bash
git add src/components/Timeline/TimelineCanvas.tsx
git commit -m "$(cat <<'EOF'
apply theme tokens and fonts to timeline canvas

+claude
EOF
)"
```

---

## Task 6: Add eras data and render era bands

Pure-function era-band visibility threshold (testable). New empty
`eras.ts`. Canvas drawing of era bands: faint warm-dark strip with
verdigris label, behind the timeline rule.

**Files:**
- Create: `src/utils/eraLayout.ts`
- Create: `src/utils/eraLayout.test.ts`
- Create: `src/data/eras.ts`
- Modify: `src/components/Timeline/TimelineCanvas.tsx`
  (accept `eras` prop, draw era bands in `draw()`)
- Modify: `src/App.tsx` (pass `eras` prop to `TimelineCanvas`)

- [ ] **Step 1: Write failing test for `shouldShowEraLabel`**

Create `src/utils/eraLayout.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { shouldShowEraLabel } from './eraLayout';

describe('shouldShowEraLabel', () => {
  it('hides the label when the band is narrower than the threshold', () => {
    expect(shouldShowEraLabel(40, 80)).toBe(false);
  });

  it('shows the label when the band is at or above the threshold', () => {
    expect(shouldShowEraLabel(80, 80)).toBe(true);
    expect(shouldShowEraLabel(120, 80)).toBe(true);
  });

  it('uses 80 as the default threshold', () => {
    expect(shouldShowEraLabel(70)).toBe(false);
    expect(shouldShowEraLabel(80)).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run src/utils/eraLayout.test.ts
```

Expected: FAIL — `shouldShowEraLabel` is not defined.

- [ ] **Step 3: Implement `shouldShowEraLabel`**

Create `src/utils/eraLayout.ts`:

```ts
/**
 * True when an era band's on-screen pixel width is wide enough to
 * comfortably show its label without crowding adjacent markers.
 */
export function shouldShowEraLabel(
  bandWidthPx: number,
  threshold: number = 80,
): boolean {
  return bandWidthPx >= threshold;
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run src/utils/eraLayout.test.ts
```

Expected: PASS — 3 tests.

- [ ] **Step 5: Create `src/data/eras.ts`**

```ts
export interface Era {
  name: string;
  /** Inclusive HE start year. */
  start: number;
  /** Exclusive HE end year. */
  end: number;
}

/**
 * Era spans rendered as faint horizontal bands behind the timeline
 * rule. The next spec (events curation) populates this list by
 * converting the existing "begin/end" pair events into eras.
 */
export const ERAS: Era[] = [];
```

- [ ] **Step 6: Add `eras` prop to TimelineCanvas**

In `src/components/Timeline/TimelineCanvas.tsx`, update the `Props`
interface and import:

```ts
import { Era } from '../../data/eras';
import { shouldShowEraLabel } from '../../utils/eraLayout';
```

```ts
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
```

Add `eras` to the destructured params on the `export default function`.

- [ ] **Step 7: Render era bands in `draw()`**

Inside the `draw` callback, AFTER `ctx.clearRect(...)` and BEFORE the
"Background baseline" block, add:

```ts
// Era bands — faint strips above the baseline; render before
// baseline/ticks so markers and labels stack on top.
const eraBandY = height / 2 - 35;
const eraBandH = 18;
eras.forEach((era) => {
  const xStart = worldToScreen(era.start, centerYear, zoom, effectiveWidth) + adaptiveMargins.innerBound;
  const xEnd = worldToScreen(era.end, centerYear, zoom, effectiveWidth) + adaptiveMargins.innerBound;
  const bandWidth = xEnd - xStart;
  if (xEnd < 0 || xStart > width) return;

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
    ctx.font = '0.55rem "JetBrains Mono", ui-monospace, monospace';
    // Use a fixed pixel size since canvas font doesn't read rem.
    ctx.font = '9px "JetBrains Mono", ui-monospace, monospace';
    ctx.fillStyle = COLOR.verdigris;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(era.name.toUpperCase(), cx, eraBandY + eraBandH / 2);
    ctx.textBaseline = 'alphabetic';
  }
});
ctx.globalAlpha = 1.0;
```

Add `eras` to the dependency array of the `draw` `useCallback`.

- [ ] **Step 8: Pass `eras` from App.tsx**

In `src/App.tsx`, add:

```ts
import { ERAS } from './data/eras';
```

In the `<TimelineCanvas ... />` JSX, add:

```tsx
eras={ERAS}
```

- [ ] **Step 9: Verify build and tests**

```bash
npm run build && npm test
```

Expected: 17 tests pass (3 new in eraLayout.test.ts).

- [ ] **Step 10: Visual sanity check (with a temporary era)**

Add a temporary era to verify rendering:

```ts
// in src/data/eras.ts (TEMPORARY — revert before commit)
export const ERAS: Era[] = [
  { name: 'Bronze Age', start: 6700, end: 8800 },
];
```

Refresh. Zoom out so the Bronze Age era is visible. Verify:
- Faint warm-dark band sits above the baseline.
- Hairline border on top and bottom of the band.
- "BRONZE AGE" label in JetBrains Mono uppercase, verdigris color,
  letter-spaced.
- At low zoom (band narrow on screen), the label disappears but the
  band remains.
- Edge fog still works — the band fades at gutters.

Then revert `ERAS` to `[]`:

```ts
export const ERAS: Era[] = [];
```

- [ ] **Step 11: Commit**

```bash
git add src/utils/eraLayout.ts src/utils/eraLayout.test.ts src/data/eras.ts src/components/Timeline/TimelineCanvas.tsx src/App.tsx
git commit -m "$(cat <<'EOF'
add era bands and empty era data file

+claude
EOF
)"
```

---

## Task 7: Add the Fog overlay and integrate

CSS-only fog overlay component. Drifts horizontally; pauses on
`prefers-reduced-motion: reduce`. Renders only when `revealDone` is
true.

**Files:**
- Create: `src/components/Fog/Fog.tsx`
- Create: `src/components/Fog/Fog.css`
- Modify: `src/App.tsx` (render `<Fog />` inside the post-reveal block)

- [ ] **Step 1: Create `Fog.tsx`**

```tsx
import React from 'react';
import { COLOR } from '../../theme';
import './Fog.css';

/**
 * Drifting textured fog at the gutters. Sits above the timeline canvas
 * but below any open placard. Uses an SVG `feTurbulence` noise baked
 * into a data URL for the texture; honors prefers-reduced-motion to
 * pause the drift.
 */
export default function Fog() {
  return (
    <div
      className="fog-overlay"
      aria-hidden="true"
      style={{ ['--fog-bg' as string]: COLOR.bg }}
    >
      <div className="fog-noise" />
    </div>
  );
}
```

- [ ] **Step 2: Create `Fog.css`**

```css
.fog-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 3;
}

.fog-overlay::before,
.fog-overlay::after {
  content: "";
  position: absolute;
  top: 0;
  bottom: 0;
  width: 18%;
  pointer-events: none;
}

.fog-overlay::before {
  left: 0;
  background: linear-gradient(90deg, var(--fog-bg), transparent);
}

.fog-overlay::after {
  right: 0;
  background: linear-gradient(270deg, var(--fog-bg), transparent);
}

.fog-noise {
  position: absolute;
  top: 0;
  bottom: 0;
  left: -100%;
  width: 300%;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='280' height='280'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.6' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.79  0 0 0 0 0.76  0 0 0 0 0.7  0 0 0 0.6 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>");
  background-repeat: repeat;
  mix-blend-mode: screen;
  opacity: 0.18;
  -webkit-mask-image: linear-gradient(90deg, black 0%, transparent 18%, transparent 82%, black 100%);
          mask-image: linear-gradient(90deg, black 0%, transparent 18%, transparent 82%, black 100%);
  animation: fog-drift 28s linear infinite;
}

@keyframes fog-drift {
  from { transform: translateX(0); }
  to   { transform: translateX(-33.333%); }
}

@media (prefers-reduced-motion: reduce) {
  .fog-noise { animation: none; }
}
```

- [ ] **Step 3: Render Fog in App.tsx (post-reveal only)**

In `src/App.tsx`, add the import:

```ts
import Fog from './components/Fog/Fog';
```

Inside the `revealDone && (...)` block, add `<Fog />` as the first
child of the absolute-positioned div (so it sits behind the timeline
content but above the page bg). Specifically, add it right after the
opening tag of `<div style={{ position: 'absolute', top: 0, ... }}>`:

```tsx
{revealDone && (
  <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', animation: `fadeIn ${ANIM_MS.fadeIn}ms ease-out forwards` }}>
    <Fog />
    {/* existing TimelineCanvas wrapper, ZoomSlider, hint... */}
```

- [ ] **Step 4: Verify build and tests**

```bash
npm run build && npm test
```

- [ ] **Step 5: Visual check**

Refresh. Verify:
- During reveal: no fog visible (still pure black).
- Post-reveal: faint textured haze appears at the left and right
  gutters, drifting slowly.
- Markers near the gutters fade into mist (not just into a void).
- Drift loop is ~28s; barely perceptible.
- Open DevTools → Rendering → toggle "Emulate CSS media feature
  prefers-reduced-motion" to "reduce". Refresh. The noise should
  still be visible but no longer drifting.

- [ ] **Step 6: Commit**

```bash
git add src/components/Fog src/App.tsx
git commit -m "$(cat <<'EOF'
add drifting fog overlay

+claude
EOF
)"
```

---

## Task 8: Theme the ZoomSlider

**Files:**
- Modify: `src/components/ZoomSlider/ZoomSlider.tsx`

- [ ] **Step 1: Replace ZoomSlider styles**

Replace the JSX with the themed version. The component logic stays
identical; only the `<input>` and label styles change.

```tsx
import React from 'react';
import { MAX_ZOOM } from '../../constants';
import { COLOR } from '../../theme';

interface Props {
  zoom: number;
  onZoomChange: (zoom: number, screenWidth: number) => void;
  todayHE: number;
  margin: number;
}

const MIN_ZOOM_FLOOR = 0.01;

/**
 * Logarithmic zoom slider with dynamic range based on screen width,
 * margins, and epoch length.
 */
export default function ZoomSlider({ zoom, onZoomChange, todayHE, margin }: Props) {
  const screenWidth = window.innerWidth;
  const effectiveWidth = screenWidth - 2 * margin;
  const minZoom = Math.max(MIN_ZOOM_FLOOR, effectiveWidth / todayHE);
  const maxZoom = MAX_ZOOM;

  const toSliderValue = (z: number) =>
    ((Math.log(Math.max(z, minZoom)) - Math.log(minZoom)) /
      (Math.log(maxZoom) - Math.log(minZoom))) * 100;

  const fromSliderValue = (v: number) =>
    Math.exp(Math.log(minZoom) + (v / 100) * (Math.log(maxZoom) - Math.log(minZoom)));

  return (
    <div style={{
      position: 'fixed',
      bottom: '40px',
      left: '50%',
      transform: 'translateX(-50%)',
      width: 'min(300px, 80%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '10px',
    }}>
      <input
        type="range"
        min="0"
        max="100"
        value={toSliderValue(zoom)}
        onChange={(e) => onZoomChange(fromSliderValue(parseFloat(e.target.value)), screenWidth)}
        className="zoom-slider"
      />
      <div style={{
        fontSize: '0.6rem',
        color: COLOR.muted,
        fontFamily: '"JetBrains Mono", ui-monospace, monospace',
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
      }}>zoom</div>

      <style>{`
        .zoom-slider {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          height: 2px;
          background: ${COLOR.hairline};
          border-radius: 1px;
          outline: none;
          cursor: pointer;
        }
        .zoom-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 11px;
          height: 11px;
          border-radius: 50%;
          background: ${COLOR.bronze};
          box-shadow: 0 0 10px ${COLOR.bronzeGlow};
          cursor: pointer;
          border: none;
        }
        .zoom-slider::-moz-range-thumb {
          width: 11px;
          height: 11px;
          border-radius: 50%;
          background: ${COLOR.bronze};
          box-shadow: 0 0 10px ${COLOR.bronzeGlow};
          cursor: pointer;
          border: none;
        }
        .zoom-slider::-moz-range-track {
          background: ${COLOR.hairline};
          height: 2px;
          border-radius: 1px;
        }
      `}</style>
    </div>
  );
}
```

- [ ] **Step 2: Verify build and tests**

```bash
npm run build && npm test
```

- [ ] **Step 3: Visual check**

Refresh. Verify:
- Slider track is a thin hairline.
- Thumb is a small bronze circle with a soft glow.
- Label "ZOOM" below in JetBrains Mono uppercase, muted color,
  letter-spaced.
- Drag the thumb — it stays bronze and the timeline zooms.
- Test in Firefox if available — the `::-moz-*` rules cover that.

- [ ] **Step 4: Commit**

```bash
git add src/components/ZoomSlider/ZoomSlider.tsx
git commit -m "$(cat <<'EOF'
theme the zoom slider

+claude
EOF
)"
```

---

## Task 9: Update CLAUDE.md component references

**Files:**
- Modify: `CLAUDE.md` (rename component references; the
  visual-mechanism description in `GEMINI.md` ("flipping like an
  odometer") is correct as-is and stays)

- [ ] **Step 1: Update CLAUDE.md**

Two references to update in `CLAUDE.md`:

Line ~7 (project description):
```
The app opens with an annometer reveal animating from the CE year to the HE year, then transitions to a draggable, zoomable canvas timeline of historical events.
```

Line ~75 (App.tsx architecture note):
```
Two-phase UI gated by `revealDone`: annometer first, then timeline. The popup for a clicked event is rendered by `App` (not the canvas) so it can sit above the timeline DOM and animate in/out.
```

Also update any path references from `src/components/Odometer/` to
`src/components/Annometer/`. Search for both:

```bash
grep -n "Odometer\|odometer" CLAUDE.md
```

Replace `Odometer` (capital) with `Annometer`. For lowercase
`odometer`, replace with `annometer` ONLY when it refers to the
component; leave it when it refers to the visual mechanism (digit
reels). In practice: both lowercase references in CLAUDE.md refer to
the component, so replace both.

- [ ] **Step 2: Verify references gone**

```bash
grep -n "Odometer\|odometer" CLAUDE.md
```

Expected: no matches.

- [ ] **Step 3: Commit**

```bash
git add CLAUDE.md
git commit -m "$(cat <<'EOF'
update claude.md for annometer rename

+claude
EOF
)"
```

---

## Self-Review

Run this checklist after writing the plan:

1. **Spec coverage:** every section of
   `docs/superpowers/specs/2026-04-26-holocene-theme-design.md` maps
   to at least one task above:
   - Color tokens → Task 1, consumed in 4/5/6/7/8
   - Typography (fonts loaded) → Task 2; applied in 3/4/5/8
   - Motion tokens → Task 1 (`fogDrift` added); used in 7
   - Annometer reveal → Task 3 (rename) + Task 1 (bg phase)
   - Timeline canvas treatments → Task 5
   - Era bands → Task 6
   - Placard → Task 4
   - Fog overlay → Task 7
   - Slider → Task 8
   - Hint text → Task 4
   - prefers-reduced-motion → Task 7
   - File `src/data/eras.ts` → Task 6
   - File `src/components/Fog/Fog.tsx` → Task 7

2. **Placeholder scan:** no "TBD"/"TODO"/"add X" instructions. Code
   blocks are complete; commands are exact.

3. **Type consistency:** `Era` shape (`name`, `start`, `end`) defined
   in Task 6 step 5 and consumed identically in step 6 (TimelineCanvas
   `Props`) and step 8 (App.tsx import).
   `shouldShowEraLabel(bandWidthPx, threshold?)` signature consistent
   between test (step 1), implementation (step 3), and use site (step
   7).

4. **Sequencing:** legacy aliases in `theme.ts` (Task 1) are removed in
   Task 4 step 5 only after the App.tsx migration in steps 1–3 of Task
   4 has eliminated all consumers. Grep step 4 verifies before drop.

5. **Visual verification:** every visually-relevant task (1, 3, 4, 5,
   6, 7, 8) includes a "Visual check" step listing exactly what to
   look for. Tasks 2 and 9 are non-visual (font loading + docs).
