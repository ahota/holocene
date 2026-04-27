# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Interactive timeline visualization of the Holocene / Human Era (HE) calendar. `0 HE = 10,001 BC`, so the current year is roughly `current CE year + 10,000`. The app opens with an annometer reveal animating from the CE year to the HE year, then transitions to a draggable, zoomable canvas timeline of historical events.

`GEMINI.md` is the spec/style document for this repo. Read it for design intent and the coding/git conventions (120-col limit, comments explain *why*, 50/72 commit messages in imperative lowercase, DRY/KISS, never commit without a visual or interactive test).

## Commit conventions

The rules in `GEMINI.md` apply, with two clarifications for Claude:

- **Subject is enough.** Aim for commits small and focused enough that the 50-char imperative-lowercase subject fully describes the change. Use a body only when crucial details or complexities can't fit; if you do, keep it to as few concise bullet points as possible (wrap at 72).
- **Co-author line.** End the message with a blank line followed by `+claude` (this replaces Gemini's `+gemini` line — do not include both).

## Commands

```bash
npm run dev          # vite dev server
npm run build        # tsc (typecheck) + vite build
npm test             # vitest run (single pass)
npm run partition    # rebuild public/data/*.json from src/data/all_events.json
```

Single test: `npx vitest run src/utils/layout.test.ts` (add `-t "substring"` to filter by test name). `npx vitest` alone runs in watch mode.

`public/data/*.json` is gitignored. After editing `src/data/all_events.json` you **must** run `npm run partition` or the dev server will serve stale chunks (or 404 entirely on a fresh checkout).

## Architecture

### Coordinate systems and HE math

- Years are stored in HE throughout. `currentHEYear()` (`src/utils/math.ts`) returns a fractional HE year (CE year + 10000 + sub-year progress).
- `worldToScreen(year, centerYear, zoom, screenWidth)` converts HE years to pixel x. `zoom` is literally pixels-per-year.
- Layout uses two distinct spaces — keep them straight:
  - **Pixel space** (`worldToScreen`) — depends on `centerYear`, used for actual rendering.
  - **`year * zoom` space** — scroll-independent, used by `calculateLabelLevels` so label assignments stay stable while panning.

### Camera state — `useTimeline` (`src/components/Timeline/useTimeline.ts`)

Single source of truth for `centerYear` and `zoom`. Exposes `scroll`, `zoomTo`, `zoomDelta`, and a slider-friendly `setZoom`. `clampView` enforces:
1. If the whole epoch (`0..TODAY_HE`) fits on screen at the current zoom, the view locks to the midpoint.
2. The right edge cannot pan past today (`+ initialHalfWidth` of breathing room).
3. The left edge cannot pan before `0 HE`.

`initialHalfWidthRef` captures the half-width at first valid render and is reused as padding so the clamp doesn't get tighter as the user zooms in.

### Rendering — `TimelineCanvas` (`src/components/Timeline/TimelineCanvas.tsx`)

Plain HTML canvas (no React per-frame rerenders). Notable:
- DPR-aware resize on each draw; `ctx.scale(dpr, dpr)` only on dimension change.
- Tick interval is selected from zoom (`1000 / 100 / 10 / 1` years).
- `getEdgeOpacity` fades markers and labels in a `gutter + fadeZone` band so the canvas appears to dissolve into the page margins. `adaptiveMargins.innerBound` comes from `getInnerBound(screenWidth)` in `src/constants.ts` and is passed in as the `margin` prop.
- Hit detection is run on `pointerup` only when the pointer hasn't moved >5px (so dragging never opens a popup). It tests both the marker dot and the label rectangle, and reports an anchor offset (`yOffset`, `xOffset`) used by `App.tsx` to position the popup.

### Label collision — `calculateLabelLevels` (`src/utils/layout.ts`)

The non-obvious piece of the renderer. Goals: labels (a) don't overlap, (b) keep the same vertical level frame-to-frame as you scroll/zoom. Algorithm:
1. Sort events by priority: `isToday` first, then `importance` desc, then `year` asc. The order is independent of the viewport, which is what makes assignments stable.
2. For each event, compute its label range in `year * zoom` space and walk the supplied `levels` array (vertical offsets) until one has no overlap.
3. Drop labels for low-importance events at low zoom (`shouldShowLabel` rule). `isToday` always gets a level even if every level is full.

If you change the levels array in `TimelineCanvas`, mirror it in tests. Order matters — the first level that fits wins.

### Data loading — `useEventLoader` (`src/hooks/useEventLoader.ts`)

History is split into 2,000-year chunks at build time (`scripts/partition-data.js`) and served as static JSON from `/data/events_<start>.json` (chunks `0 .. 12000`). The hook computes the visible HE range from `centerYear`/`zoom`/screen width, expands by one buffer chunk on each side, and fetches anything not already in `fetchedChunks`. A failed fetch is *not* retried this session (chunks above `12000` legitimately don't exist).

Chunks accumulate in component state; they're never evicted. This is fine because the full master file is small.

### App-level glue — `App.tsx`

Two-phase UI gated by `revealDone`: annometer first, then timeline. The popup for a clicked event is rendered by `App` (not the canvas) so it can sit above the timeline DOM and animate in/out. Popup x is `worldToScreen(...) + INNER_BOUND + xOffset`, then clamped to keep the 280px box on-screen; the little arrow under the popup hides itself when the clamp would otherwise detach it from the marker. The popup auto-dismisses if the anchored event scrolls outside the visible band.

## Conventions specific to this repo

- Constants live in `src/constants.ts`. `MARGIN_UNIT`, `LABEL_PADDING`, and `getInnerBound(screenWidth)` are shared between layout, canvas, and the zoom slider — change them in one place.
- `ZoomSlider` derives `minZoom` so the full epoch fits the effective width; `maxZoom = 1000`. Mapping is logarithmic (`log(z) ↔ slider 0..100`).
- Co-located tests: `*.test.ts` next to the source file. Tests use Vitest's globals via explicit imports (`import { describe, it, expect } from 'vitest'`).
- See `docs/superpowers/specs/` and `docs/superpowers/plans/` for the original design specs and implementation plans — useful context when revisiting an area.
