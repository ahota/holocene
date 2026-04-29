# 2026-04-28-events-dataset-rewrite-design

## Overview

Rewrite `src/data/all_events.json` and populate `src/data/eras.ts` to
turn the timeline into a museum hall whose exhibits earn their place by
voice and significance, not by encyclopedia coverage.

The schema (`HistoryEvent`, `Era`) is unchanged structurally; only the
doc comment on `HistoryEvent.importance` changes to reflect a flipped
numbering. Two small renderer code changes accompany the data rewrite.

This spec builds on the prior session's pre-brainstorm notes at
`docs/superpowers/notes/2026-04-28-events-curation-context.md`. That
file remains the canonical record of voice rationale and direct user
quotes; the spec below assumes its content and does not duplicate it.

## Voice and inclusion criteria

Voice is the museum placard: restrained, concrete, slightly clinical.
Specific object/moment plus a quietly-stated outsized implication. The
lack of poetry is intentional — it builds the sense of scale.

An event earns a placard if it does at least one of:

- shapes humanity's trajectory,
- is emblematic of the epoch,
- is part of the path of development itself.

An event does not earn a placard if it is:

- a modern *rediscovery* of a buried artifact (the path is what it
  always was; we don't render our knowledge of the path),
- an era-start marker (era bands handle these),
- a Begin/End bracket without a specific anchoring moment,
- an encyclopedia-flat empire peak ("Spanish Empire becomes a global
  superpower").

## Importance tiers

Lower number = higher render priority. The label-collision algorithm
sorts by importance ascending and assigns levels first-come-first-fit;
tier 0 wins all priority contests, then tier 1, etc. The visibility
gate also opens up by tier: tiers 0–1 are always considered, tier 2
appears at moderate zoom, tier 3 at close zoom.

+-------+-----------------------------+-----------+----------------+
| Tier  | Bar                         | Volume    | Visibility     |
+=======+=============================+===========+================+
| 0     | Absolute critical moments   | ~10–14    | pinned (top    |
|       | of human history. Pinned    |           | sort priority; |
|       | so the screen-capacity      |           | always         |
|       | budget at low zoom is       |           | considered)    |
|       | spent on these first.       |           |                |
+-------+-----------------------------+-----------+----------------+
| 1     | Trajectory of humankind     | ~35–50    | always         |
|       | toward Type 1 civilization  |           | considered     |
|       | on the Kardashev scale —    |           |                |
|       | energy capture, planetary   |           |                |
|       | coordination, physical      |           |                |
|       | reach beyond Earth — and    |           |                |
|       | brushes with great filters  |           |                |
|       | that shaped what we         |           |                |
|       | survived.                   |           |                |
+-------+-----------------------------+-----------+----------------+
| 2     | Emblematic specific moment  | ~50–75    | zoom > 1       |
|       | with broad cultural         |           |                |
|       | resonance, not              |           |                |
|       | trajectory-shaping.         |           |                |
+-------+-----------------------------+-----------+----------------+
| 3     | On-voice moment that        | ~30–50    | zoom > 5       |
|       | quietly but meaningfully    |           |                |
|       | impacts humanity. Texture,  |           |                |
|       | but earned.                 |           |                |
+-------+-----------------------------+-----------+----------------+

Total target: ~140–180 events.

The voice rule applies equally across all four tiers. What differs is
the scope of the implication, not its quality. The renderer treats
tiers 0 and 1 identically through the gate (`importance <= 1`); the
distinction surfaces in the sort comparator (`a.importance -
b.importance` ascending), which determines who wins level slots when
the screen runs out.

### Tier exemplars

Tier 1: Hero's Steam Engine (10060 HE) — 1700-year detour off the
type-1 ramp; first overwintering on Antarctica (11899 HE) — humans
occupy every continent; 8.2 kiloyear event (1800 HE) and Storegga
Landslide (3500 HE) — climate brushes; first controlled nuclear chain
reaction (Chicago Pile, 11942 HE); Cuban Missile Crisis (11962 HE) —
closest documented brush with self-extinction; Voyager 1 crosses
heliopause (12012 HE).

Tier 2: Antikythera Mechanism, Voynich Manuscript, Phaistos Disc,
Stradivari's first violin, Crab Nebula supernova recording, Cyrus's
Cylinder, Taj Mahal completion. Cultural anchors and mystique objects.

Tier 3: Genuinely small textures with on-voice quality. Less broadly
recognized moments whose implication is real but narrow. Curation
will surface candidates; the bar is the voice rule.

## Curation rules

### Begin/End rule

Each Begin/End or "X Starts" entry becomes one specific anchoring
moment, or zero placards. Bracket events never survive as-is. Titles
name the *moment*, not the *period*.

Concrete dispositions for current entries:

+------------------------------+----------------------------------+
| Current entry                | Disposition                      |
+==============================+==================================+
| Bronze Age Starts            | Cut. Era band carries.           |
+------------------------------+----------------------------------+
| Iron Age Starts              | Cut. Era band carries.           |
+------------------------------+----------------------------------+
| Copper Age Starts            | Cut. Era band carries.           |
+------------------------------+----------------------------------+
| Common Era Begins            | Cut. CE/BC is a calendar         |
|                              | transition, not an era           |
|                              | boundary; subsumed visually by   |
|                              | the surrounding Antiquity band.  |
+------------------------------+----------------------------------+
| Middle Ages Begin            | Cut. Era band carries.           |
+------------------------------+----------------------------------+
| The Dark Ages                | Cut. Era band carries.           |
+------------------------------+----------------------------------+
| Information Age Starts       | Cut. Era band carries.           |
+------------------------------+----------------------------------+
| Industrial Revolution Begins | Cut. Era band carries; Watt's    |
|                              | Steam Engine (11769) covers the  |
|                              | inflection.                      |
+------------------------------+----------------------------------+
| The Renaissance              | Cut. Era band carries; Gutenberg |
|                              | / Copernicus / Taj Mahal already |
|                              | inside the period.               |
+------------------------------+----------------------------------+
| The Enlightenment            | Cut. Era band carries; specific  |
|                              | moments may be added during      |
|                              | curation.                        |
+------------------------------+----------------------------------+
| WWI Begins / WWI Ends        | Replace pair with one moment.    |
|                              | Strongest candidate: Sarajevo    |
|                              | assassination (11914 HE),        |
|                              | titled by moment ("Assassination |
|                              | at Sarajevo"), not by war.       |
+------------------------------+----------------------------------+
| WWII Begins / WWII Ends      | Replace pair with two moments,   |
|                              | each titled by moment: Hiroshima |
|                              | (11945) and the Holocaust. Each  |
|                              | earns its place independently.   |
+------------------------------+----------------------------------+
| Cold War Begins / Cold War   | Cut pair. Replace with one       |
| Ends                         | anchored moment (fall of the     |
|                              | Berlin Wall, 11989 HE) or cut    |
|                              | entirely.                        |
+------------------------------+----------------------------------+

### Empire-peak rule

Same shape as Begin/End: rewrite each as a specific defining act, or
cut. **Replacement is not required for every cut.** Some empire-peaks
do not earn a placard at all; that is acceptable.

### Coverage push

Voice bar still gates absolutely. During curation, deliberately go
looking for on-voice moments from underrepresented regions:

- Sub-Saharan Africa (currently 0 events)
- Polynesia beyond Hawaii (currently 1 event)
- Pre-Columbian Americas beyond Maya (currently 0 dedicated events)
- South Asia beyond Indus + Gupta (currently 2 events)
- Southeast Asia (currently 0 dedicated events)
- China beyond the existing 5 entries
- Steppe / Mongol (currently 1 event)
- Aboriginal Australia (currently 0; may not survive bar)

No quotas. Whatever survives the voice bar gets in.

## Density curve

Light hybrid: add ~8–12 carefully-chosen pre-5000-HE placards. Accept
that the deep past stays sparser than modernity. Fog overlay (when
re-enabled — see `docs/TODO.md`) reinforces the narrative that the
deep past is genuinely thinner because we know less.

Pre-5000 HE goes from ~8 events to ~16–20. Modern density (post-11000
HE) drops modestly as Begin/End cuts and tier-1 → tier-2
reclassifications take effect — many currently-tagged importance-3
events under the old numbering were trajectory-shaping in name only
and read as cultural anchors under the new tier-1 bar.

## Eras

Era bands are non-overlapping (renderer constraint:
`TimelineCanvas.tsx` renders all bands at one fixed `eraBandY`).
The 9-band hybrid sequence:

+---------------------+-------+-------+---------+
| Era                 | Start | End   | Span    |
+=====================+=======+=======+=========+
| Stone Age           | 0     | 5000  | 5000 yr |
+---------------------+-------+-------+---------+
| Copper Age          | 5000  | 6700  | 1700 yr |
+---------------------+-------+-------+---------+
| Bronze Age          | 6700  | 8800  | 2100 yr |
+---------------------+-------+-------+---------+
| Iron Age            | 8800  | 9500  | 700 yr  |
+---------------------+-------+-------+---------+
| Classical Antiquity | 9500  | 10500 | 1000 yr |
+---------------------+-------+-------+---------+
| Middle Ages         | 10500 | 11400 | 900 yr  |
+---------------------+-------+-------+---------+
| Early Modern        | 11400 | 11760 | 360 yr  |
+---------------------+-------+-------+---------+
| Industrial          | 11760 | 11970 | 210 yr  |
+---------------------+-------+-------+---------+
| Information         | 11970 | today | growing |
+---------------------+-------+-------+---------+

Boundaries use Near-Eastern conventional dates as canonical. Ages were
regional and gradual in reality; the simplification is acceptable
because the band is for orientation, not historiographical truth.
Individual placards inside a band can acknowledge regional variation
in their descriptions.

The Information era end is dynamic; it tracks today rather than being
hardcoded:

```ts
const TODAY_HE = new Date().getFullYear() + 10000;
// ...
{ name: 'Information', start: 11970, end: TODAY_HE }
```

Stone Age starts at 0 because `clampView` in `useTimeline.ts` already
prevents panning before 0 HE; that is the leftmost extent the user can
ever reach.

## Length caps

+-------------+--------------+----------+
| Field       | Soft target  | Hard cap |
+=============+==============+==========+
| Title       | ~30 chars    | 50 chars |
+-------------+--------------+----------+
| Description | 120–160      | 180      |
|             | chars        | chars    |
+-------------+--------------+----------+

Title cap is set primarily by `calculateLabelLevels` collision math —
longer titles take more horizontal space and reduce how many events
fit at a given zoom. The 50-char hard cap is the constraint; the
~30-char soft target is the goal. The polished-titles pass listed in
`docs/TODO.md` will tighten further within these limits.

180 chars fits all current in-voice exemplars. Below ~80 starts to
feel truncated; above ~180 reads as a paragraph rather than a placard.

## Schema and code changes

`HistoryEvent` (`src/data/events.ts`) is structurally unchanged. Only
the doc comment on `importance` updates to reflect the flipped
numbering:

```ts
export interface HistoryEvent {
  year: number;        // HE
  title: string;       // ≤ 50 chars (target ≤ 30)
  description: string; // ≤ 180 chars (target 120–160)
  importance: number;  // 0=pinned, 1=trajectory, 2=cultural anchor
                       // (zoom>1), 3=texture (zoom>5)
  isToday?: boolean;
}
```

`Era` (`src/data/eras.ts`) is unchanged. The currently empty
`ERAS: Era[] = []` becomes the 9-band list above.

Two renderer code changes accompany the data rewrite:

1. **Importance gate** in `TimelineCanvas.tsx`:

   ```ts
   // before: 3 = always shown, 1 = close-zoom only
   zoom > 5 || importance >= 3 || (zoom > 1 && importance >= 2)
   // after: 1 = always shown, 3 = close-zoom only
   zoom > 5 || importance <= 1 || (zoom > 1 && importance <= 2)
   ```

2. **Importance sort** in `calculateLabelLevels`
   (`src/utils/layout.ts`) — currently sorts events by `importance
   desc`; flip to `importance asc` so higher-priority (smaller-numbered)
   events still get level assignments first. Test fixtures in
   `src/utils/layout.test.ts` will need their importance values
   inverted in lockstep.

## Workflow

Editing path is unchanged. `src/data/all_events.json` is the master
file, edited manually. After edits, `npm run partition` regenerates
the chunked files in `public/data/` (gitignored). `useEventLoader`
fetches chunks on demand, accumulates them in component state, never
evicts.

For this rewrite specifically, the practical sequence is:

1. Apply renderer code changes (importance gate + sort flip + test
   fixture invert) so the data work proceeds against the right rules.
2. Populate `eras.ts` with the 9-band list.
3. Curate the events JSON top-down by tier: tier 1 first
   (trajectory), then tier 2, then tier 3. Cut and rewrite as the
   rules above dictate; pull in coverage-gap candidates as the work
   progresses.
4. Run `npm run partition` after each meaningful checkpoint to keep
   the dev server and browser in sync.

## Testing

- `npm run build` — type check and Vite build.
- `npx vitest run` — confirm `calculateLabelLevels` tests pass after
  the importance-sort flip and fixture invert.
- **Visual / interactive test required before commit** (per
  GEMINI.md):
  1. Era bands render at the 9 spans, full-epoch view.
  2. Era labels appear / disappear at the expected zoom widths.
  3. Tier 1 events visible at all zooms.
  4. Tier 2 events visible at moderate+ zoom.
  5. Tier 3 events visible only at close zoom.
  6. No labels overlap at any zoom; collision algorithm holds.
  7. Popup positioning correct for new events at all densities.

## Deferred work

See `docs/TODO.md` for project-level future work, including the
sub-band era layer (zoom-revealed second row for shorter ages), the
catchier-titles polish pass, and the fog overlay re-enable. None of
these block this rewrite.
