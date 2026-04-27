# 2026-04-26-holocene-theme-design

## Overview

Replace the current high-contrast monochrome look with a warm, dim,
"museum hall in fog" theme that supports the project brief: awe, wonder,
mystique, and intentional restraint. The chronometer reveal stays stark
to anchor the "stepping into the hall" beat; everything that fades up
beneath it adopts the new palette.

This spec covers color tokens, typography, fog treatment, marker / era
treatment, placard styling, chronometer integration, and minor UI
elements (slider, hint). It does not change the timeline's data model,
scroll/zoom behavior, layout math, or event content. Event curation is
a separate spec.

## Design tokens

### Color (locked palette)

Warm-dark base with a verdigris secondary for archival cues and bronze
for "today/now."

+----------------+------------------------+----------------------------------+
| Token          | Value                  | Use                              |
+================+========================+==================================+
| `bg`           | `#15130f`              | Page background once the         |
|                |                        | timeline has faded up            |
+----------------+------------------------+----------------------------------+
| `bgReveal`     | `#000000`              | Background during the            |
|                |                        | chronometer reveal               |
+----------------+------------------------+----------------------------------+
| `surface`      | `#2a2620`              | Placards (lighter than `bg`,     |
|                |                        | visually elevated)               |
+----------------+------------------------+----------------------------------+
| `text`         | `#c9c3b4`              | Body text, default marker        |
|                |                        | color, post-reveal chronometer   |
|                |                        | year                             |
+----------------+------------------------+----------------------------------+
| `muted`        | `#7a7466`              | Secondary labels, eyebrows,      |
|                |                        | year subtitles under markers     |
+----------------+------------------------+----------------------------------+
| `dim`          | `#5a544a`              | Tertiary text — HE subtitle,     |
|                |                        | hint, faded affordances          |
+----------------+------------------------+----------------------------------+
| `bronze`       | `#b88a4a`              | Today marker, placard left       |
|                |                        | rule, slider thumb               |
+----------------+------------------------+----------------------------------+
| `bronzeGlow`   | `rgba(184,138,74,0.4)` | Today marker / slider thumb glow |
+----------------+------------------------+----------------------------------+
| `verdigris`    | `#6a857d`              | Era band labels, archival        |
|                |                        | hairlines                        |
+----------------+------------------------+----------------------------------+
| `hairline`     | `#2c2a25`              | 1px dividers, baseline, slider   |
|                |                        | track                            |
+----------------+------------------------+----------------------------------+
| `eraBandBg`    | `#1a1916`              | Era band fill                    |
+----------------+------------------------+----------------------------------+
| `placardTitle` | `#d8d0bd`              | Placard title text               |
+----------------+------------------------+----------------------------------+
| `placardBody`  | `#b3ad9d`              | Placard body text                |
+----------------+------------------------+----------------------------------+
| `placardYear`  | `#8a8275`              | Placard year footer              |
+----------------+------------------------+----------------------------------+

The chronometer text color during the reveal is `#ffffff` on
`bgReveal`. After reveal completes, the bg transitions to `bg` and the
year text recolors from `#ffffff` to `text`.

### Typography

Two faces, used semantically:

- **JetBrains Mono** (400, 500, 700) — *measurement*: chronometer year,
  eyebrows ("the year is", "human era (HE)"), year labels under markers,
  era band labels, year ticks on the timeline rule, slider label, hint
  text.
- **Inter** (400, 500, 600, 700) — *description*: marker labels (event
  titles), placard title, placard body text.

Loaded via Google Fonts at the document level. Fallbacks:
`ui-monospace, monospace` for JetBrains; `system-ui, sans-serif` for
Inter. The Odometer's current generic `monospace` family is replaced by
JetBrains Mono.

### Motion

+------------+------------+------------------------------------------------+
| Token      | Value (ms) | Use                                            |
+============+============+================================================+
| `popup`    | 200        | Placard appear / dismiss (existing)            |
+------------+------------+------------------------------------------------+
| `reveal`   | 1000       | Chronometer slide-up (existing)                |
+------------+------------+------------------------------------------------+
| `fadeIn`   | 1500       | Timeline fade-up; `bg` transition window       |
|            |            | (existing)                                     |
+------------+------------+------------------------------------------------+
| `fogDrift` | 28000      | Fog noise drift loop                           |
+------------+------------+------------------------------------------------+

## Component treatments

### Chronometer reveal

Behavior unchanged. Visual updates:

- Digit font: JetBrains Mono.
- During the reveal, page bg is `bgReveal` (#000) and digits are
  `#ffffff` (current behavior).
- When the reveal completes, the chronometer slides up; over `fadeIn`
  ms the page bg transitions to `bg` while the timeline fades in
  beneath. The chronometer year text recolors from `#ffffff` to `text`
  over the same window.
- The "the year is" eyebrow and "human era (HE)" subtitle adopt
  palette colors (`muted` and `dim` respectively) throughout.

### Timeline canvas

Background: `bg`. Baseline and minor ticks: `hairline`. Major
(millennium) ticks: `muted`, with year-number labels in JetBrains Mono.

**Markers** (`TimelineCanvas.tsx:160–163`): a single rule. Past markers
fill `text`. Today fills `bronze` with a soft glow (set `shadowBlur`
and `shadowColor` to `bronzeGlow`-equivalent before drawing the dot,
then reset). No per-importance coloring; importance still drives label
visibility via the existing `shouldShowYear` rule and the
`calculateLabelLevels` priority sort.

**Marker labels**: title in Inter; year subtitle in JetBrains Mono
`muted`. Connector and bracket lines: `hairline` (replacing the current
`rgba(255,255,255,0.25)`); the today variant uses a desaturated bronze.

### Era bands

New visual element. A faint horizontal strip rendered behind the
timeline rule, vertically offset slightly above the baseline, spanning
the year range of each era. Each band is filled `eraBandBg`, hairlined
top and bottom in `hairline`, and labeled in JetBrains Mono uppercase
letter-spaced `verdigris`.

- **Implementation**: drawn on the canvas (not DOM) so the band scrolls
  and zooms in lockstep with markers and ticks.
- **Label visibility**: the band label renders only when its on-screen
  width exceeds a threshold (default ~80px) so labels don't crowd at
  low zoom. When hidden, the band itself remains.
- **Data**: a new `src/data/eras.ts` exports an array of `{ name:
  string; start: number; end: number }`. The initial list is
  intentionally empty; population happens in the events-curation spec
  where the existing "Bronze Age Starts" / "Iron Age Starts" event
  entries are converted into era bands.

### Placard (popup)

The popup graduates from a tooltip-styled element to a deliberate
placard:

- Surface: `surface`.
- Border-left: 2px solid `bronze`.
- Box-shadow: `0 8px 28px rgba(0,0,0,0.55)`.
- Inner highlight: `inset 0 1px 0 rgba(255,255,255,0.05)` — reads as
  light from above.
- Title: Inter 700, color `placardTitle`.
- Body: Inter 400, color `placardBody`.
- Year footer: JetBrains Mono uppercase letter-spaced, color
  `placardYear`.
- Bottom arrow keeps current behavior, fill matches `surface`.

### Fog overlay

Drifting textured fog at the gutters. Implementation: a non-interactive
overlay element above the canvas, behind any open placard, with two
layered effects:

1. **Linear fade gutters** (existing logic preserved):
   `linear-gradient(90deg, bg, transparent)` on the left ~18%, mirrored
   on the right.
2. **Noise texture**: an SVG `feTurbulence` baked into a data URL
   background-image, repeating, with `mix-blend-mode: screen` and a
   `mask-image` clipping it to the gutter regions. CSS `transform:
   translateX(...)` animates the noise layer over `fogDrift` ms for a
   slow horizontal drift.

Tuning relative to the brainstorm demo: longer loop (28s vs 14s), lower
opacity (~0.18 vs 0.28), wider mask falloff. The fog reads as "mist at
the periphery"; it does not draw the eye.

The fog overlay is hidden during the chronometer reveal. It appears
together with the timeline.

**Reduced motion**: respect `prefers-reduced-motion: reduce` by freezing
the noise translation. The textured layer remains visible; only the
animation pauses.

### Slider

- Track: 2px `hairline`, fully rounded.
- Thumb: 11px circle filled `bronze`, with `bronzeGlow` box-shadow.
- Label "zoom": JetBrains Mono uppercase letter-spaced `muted`,
  centered below the track.

Implementation note: starts as a styled native `input[type=range]`
(cross-browser thumb selectors). If pseudo-element styling proves
brittle, fall back to a custom div-based thumb on a hairline track with
pointer events. Visual target is locked either way.

### Hint text

"scroll or drag to explore the past" — JetBrains Mono lowercase, `dim`,
fixed at the bottom of the viewport, with mild letter-spacing. Existing
position and behavior retained.

## Code organization

**Files updated**:

- `src/theme.ts` — expand from the current `{COLOR, SHADOW, ANIM_MS,
  Z}` set to include every token in the table above. Keep the existing
  API shape (named exports, `as const` literals); rename existing
  tokens only where the new names are clearly better (`COLOR.bg`
  already matches; `COLOR.muted` exists). Add `COLOR.bgReveal`,
  `COLOR.bronze`, `COLOR.bronzeGlow`, `COLOR.verdigris`,
  `COLOR.hairline`, `COLOR.eraBandBg`, `COLOR.placardTitle/Body/Year`,
  and `ANIM_MS.fogDrift`.
- `src/components/Odometer/Odometer.css` — replace generic `monospace`
  with `"JetBrains Mono", ui-monospace, monospace`.
- `src/App.tsx` — apply tokens to remaining inline styles; coordinate
  the bg-color transition between reveal and post-reveal phases (driven
  by the existing `revealDone` flag).
- `src/components/Timeline/TimelineCanvas.tsx` — palette-driven colors
  throughout (drop the inline `'#ff0000'`, `'#ffffff'`,
  `'rgba(255,255,255,0.25)'`, etc.); marker color rule simplification
  (uniform past, bronze today with glow); year-tick label colors and
  font; era band rendering pass.
- `src/components/ZoomSlider/ZoomSlider.tsx` — themed slider track,
  thumb, and label.
- `index.html` — Google Fonts `<link>` for JetBrains Mono and Inter.

**Files added**:

- `src/components/Fog/Fog.tsx` — fog overlay component. CSS-only effect
  (noise data URL + drift keyframes); accepts no props in v1. Lives in
  the timeline view only.
- `src/data/eras.ts` — era definitions and the `Era` type. Initial
  export is `[]`; populated by the events-curation spec.

## Out of scope

- **Event curation.** Voice/style overhaul of the events list and the
  conversion of "begin / end" pairs into era bands — separate spec,
  immediately follows.
- **Resize reactivity.** The previously identified `window.innerWidth`
  non-reactive reads are unchanged here.
- **Gutter label overflow.** Labels that extend beyond the visible
  width are a layout problem; addressed in a future layout-focused
  pass.
- **Mobile / touch tuning** beyond what already works. Fog and palette
  will function correctly on mobile; revisit if testing surfaces
  issues.

## Open questions

- **Slider implementation strategy** — native styled vs. div-based.
  Decide during implementation; visual target is locked.
- **Era band label threshold** — default ~80px on-screen band width
  before showing the label. Tunable.
- **Fog GPU cost on low-end devices** — profile after first build. The
  `prefers-reduced-motion` path provides a built-in escape hatch.

## Spec self-review

1. **Placeholder scan**: No "TBD" or "TODO" remaining. The empty
   `eras.ts` initial export is a deliberate handoff to the curation
   spec, not a placeholder.
2. **Internal consistency**: Every token referenced in the component
   sections appears in the token table. The marker color rule (uniform
   past, bronze today) is stated identically in *Timeline canvas* and
   *Component treatments*. The chronometer reveal's two-phase palette
   is consistent across the *Chronometer reveal* and *Color* sections.
3. **Scope check**: Single coherent theme pass — palette, typography,
   fog, era bands, placard, slider, hint, chronometer integration.
   Sized for one implementation plan. Event curation explicitly cleaved
   off.
4. **Ambiguity check**: "Bronze" applies only to today/now markers, the
   placard left rule, and the slider thumb. "Verdigris" applies only to
   era band labels (and to any future archival hairlines; nothing else
   qualifies in v1). Hairline elsewhere is `hairline` color.
