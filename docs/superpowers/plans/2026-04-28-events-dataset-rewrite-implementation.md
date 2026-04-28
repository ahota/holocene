# Events Dataset Rewrite Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use
> superpowers:subagent-driven-development (recommended) or
> superpowers:executing-plans to implement this plan task-by-task.
> Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rewrite `src/data/all_events.json` and populate
`src/data/eras.ts` to deliver the museum-placard voice, the new
inverted importance tiers, the 9-band era list, and the curation rules
specified in the design doc.

**Architecture:** Two-phase rollout. Phase 1 flips the importance
numbering convention coordinated across renderer code and the existing
dataset (no behavior change at this checkpoint — the render still
produces the same picture, just with the literal numbers swapped).
Phase 2 populates the era data. Phases 3–7 curate events tier-by-tier
with frequent commits and visual verification at each meaningful
checkpoint.

**Tech Stack:** TypeScript, React, Vite, Vitest, plain JSON master
file, Node script for chunk partitioning.

**Spec:** `docs/superpowers/specs/2026-04-28-events-dataset-rewrite-design.md`

**Companion notes:** `docs/superpowers/notes/2026-04-28-events-curation-context.md`
captures the original voice rationale and direct user quotes.
`docs/TODO.md` lists deferred work (catchier-titles polish, fog
re-enable, sub-band era layer).

---

## File structure

Files modified across this plan:

- `src/utils/layout.ts` — flip importance gate (line 114) and sort
  comparator (line 96) (Phase 1).
- `src/utils/layout.test.ts` — invert importance values in fixtures
  (Phase 1).
- `src/data/events.ts` — update `HistoryEvent.importance` doc comment
  (Phase 1).
- `src/data/eras.ts` — populate `ERAS` array with 9-band list
  (Phase 2).
- `src/data/all_events.json` — invert existing importance values
  (Phase 1), then full curation rewrite (Phases 3–7).

No new files. `npm run partition` regenerates the chunked files in
`public/data/` (gitignored).

---

## Phase 1: Flip importance numbering convention

Convention change: 3 = always-shown / 1 = close-zoom-only **becomes**
1 = always-shown / 3 = close-zoom-only.

All four files update in one coordinated commit so the codebase stays
in working state and rendered output is unchanged. The existing
dataset has 86 entries at `importance: 3`, 47 at `importance: 2`, and
1 at `importance: 1` (the synthetic "Present Day" marker). After this
phase: 86 entries at `importance: 1`, 47 at `importance: 2`, and 1 at
`importance: 1` (Today, where the value happens to mean the same thing
under both systems).

### Task 1.1: Baseline checks

**Files:** none modified — verifying current state.

- [ ] **Step 1: Confirm tests pass before changes.**

  Run: `npx vitest run src/utils/layout.test.ts`

  Expected: all tests pass.

- [ ] **Step 2: Confirm dev server starts and the timeline renders
  the current dataset.**

  Run: `npm run partition && npm run dev`

  Open the browser to the printed URL. Confirm:
  - Annometer reveal works.
  - Timeline scrolls and zooms.
  - Existing event labels are visible (zoomed out: 86 always; zoomed
    in: more appear).

  Stop the dev server. (Used only for the baseline check.)

### Task 1.2: Update doc comment on `HistoryEvent.importance`

**Files:**
- Modify: `src/data/events.ts`

- [ ] **Step 1: Replace the doc comment.**

  Replace the current `importance` line with the block below.
  Current code (line 5):

  ```ts
  importance: number; // 1-3 for adaptive labeling
  ```

  Replace with:

  ```ts
  /**
   * Tier of importance, drives label visibility:
   *   1 = trajectory toward Type 1 civilization (always shown)
   *   2 = cultural anchor (visible at zoom > 1)
   *   3 = quiet texture (visible only at zoom > 5)
   */
  importance: number;
  ```

  (Don't commit — bundle with the rest of Phase 1 below.)

### Task 1.3: Flip importance gate in `calculateLabelLevels`

**Files:**
- Modify: `src/utils/layout.ts:114`

- [ ] **Step 1: Replace the gate expression.**

  Current code (line 114):

  ```ts
  const shouldShowLabel = zoom > 5 || event.importance >= 3 || (zoom > 1 && event.importance >= 2);
  ```

  Replace with:

  ```ts
  const shouldShowLabel = zoom > 5 || event.importance <= 1 || (zoom > 1 && event.importance <= 2);
  ```

### Task 1.4: Flip importance sort order

**Files:**
- Modify: `src/utils/layout.ts:95-97`

- [ ] **Step 1: Reverse the importance comparator inside the sort.**

  Current code (line 95-97):

  ```ts
  if (a.importance !== b.importance) {
    return b.importance - a.importance;
  }
  ```

  Replace with:

  ```ts
  if (a.importance !== b.importance) {
    return a.importance - b.importance;
  }
  ```

### Task 1.5: Invert importance values in test fixtures

**Files:**
- Modify: `src/utils/layout.test.ts`

- [ ] **Step 1: Invert the fixture importance values and update the
  inline comment.**

  Three importance values appear in the test file. Under old numbering
  the test asserted "importance 1 is hidden at zoom 3"; the assertion
  must read the same way under new numbering.

  Current test (`prioritizes importance`, lines 37-50):

  ```ts
  it('prioritizes importance', () => {
    const events: HistoryEvent[] = [
      { year: 10000, title: 'Important', importance: 3, description: '' },
      { year: 10000, title: 'Less So', importance: 1, description: '' },
    ];

    // At zoom 3, importance 1 should be hidden (zoom <= 5 and importance < 2)
    const res = calculateLabelLevels(events, 3, today, mockMeasure, 20, levels);

    // Important should get the first level
    expect(res.get(events[0])).toBe(levels[0]);
    // Less So should be hidden
    expect(res.has(events[1])).toBe(false);
  });
  ```

  Replace with:

  ```ts
  it('prioritizes importance', () => {
    const events: HistoryEvent[] = [
      { year: 10000, title: 'Important', importance: 1, description: '' },
      { year: 10000, title: 'Less So', importance: 3, description: '' },
    ];

    // At zoom 3, importance 3 should be hidden (zoom <= 5 and importance > 2)
    const res = calculateLabelLevels(events, 3, today, mockMeasure, 20, levels);

    // Important should get the first level
    expect(res.get(events[0])).toBe(levels[0]);
    // Less So should be hidden
    expect(res.has(events[1])).toBe(false);
  });
  ```

  The other tests (`assigns levels stably`, `prevents overlap`) use
  `importance: 3` for both events — under new numbering these should
  become `importance: 1`. Update both fixtures (lines 12-13 and 25-26)
  by changing `importance: 3` to `importance: 1`. Test logic stays
  intact (both events same tier, so layout still places them).

### Task 1.6: Invert importance values in the existing master JSON

**Files:**
- Modify: `src/data/all_events.json`

- [ ] **Step 1: Replace `"importance": 3` with `"importance": 1`
  globally.**

  Run from the repo root:

  ```bash
  sed -i 's/"importance": 3/"importance": 1/g' src/data/all_events.json
  ```

  This swaps 86 entries. The 47 entries at `"importance": 2` stay
  unchanged. The single entry at `"importance": 1` (Today) stays at 1
  (the value coincidentally means the same thing in both systems for
  Today, which is special-cased via `isToday: true`).

- [ ] **Step 2: Sanity-check the counts.**

  Run:

  ```bash
  jq '[.[].importance] | group_by(.) | map({importance: .[0], count: length})' src/data/all_events.json
  ```

  Expected output (order may vary):

  ```json
  [
    { "importance": 1, "count": 87 },
    { "importance": 2, "count": 47 }
  ]
  ```

  87 = 86 trajectory-tier (was 3) + 1 Today (was 1, stays 1).

### Task 1.7: Verify Phase 1 leaves the project in working state

**Files:** none modified.

- [ ] **Step 1: Run vitest.**

  Run: `npx vitest run`

  Expected: all tests pass.

- [ ] **Step 2: Run type check + Vite build.**

  Run: `npm run build`

  Expected: build succeeds, no type errors.

- [ ] **Step 3: Re-run partition and dev server. Visual check.**

  Run: `npm run partition && npm run dev`

  Open the browser. Confirm rendered output is **unchanged** from the
  baseline check (Task 1.1, Step 2). Same labels visible at the same
  zoom levels. Same number of markers. Hover/click behavior intact.

  Stop the dev server.

### Task 1.8: Commit Phase 1

- [ ] **Step 1: Stage and commit all Phase 1 changes.**

  ```bash
  git add src/data/events.ts src/data/all_events.json \
          src/utils/layout.ts src/utils/layout.test.ts
  git commit -m "$(cat <<'EOF'
  flip importance numbering: 1=top, 3=texture

  +claude
  EOF
  )"
  ```

---

## Phase 2: Populate the eras list

Replace the empty `ERAS: Era[] = []` with the 9-band hybrid sequence
from the spec.

### Task 2.1: Populate `eras.ts`

**Files:**
- Modify: `src/data/eras.ts`

- [ ] **Step 1: Replace the empty `ERAS` declaration.**

  Current code (line 14):

  ```ts
  export const ERAS: Era[] = [];
  ```

  Replace the whole declaration plus the comment block above it
  (lines 9-14) with:

  ```ts
  /**
   * Era spans rendered as faint horizontal bands behind the timeline
   * rule. Boundaries use Near-Eastern conventional dates as canonical
   * (the band is for orientation, not historiographical truth).
   * Information era end is dynamic — tracks today via TODAY_HE so the
   * band always reaches the present.
   */
  const TODAY_HE = new Date().getFullYear() + 10000;

  export const ERAS: Era[] = [
    { name: 'Stone Age', start: 0, end: 5000 },
    { name: 'Copper Age', start: 5000, end: 6700 },
    { name: 'Bronze Age', start: 6700, end: 8800 },
    { name: 'Iron Age', start: 8800, end: 9500 },
    { name: 'Classical Antiquity', start: 9500, end: 10500 },
    { name: 'Middle Ages', start: 10500, end: 11400 },
    { name: 'Early Modern', start: 11400, end: 11760 },
    { name: 'Industrial', start: 11760, end: 11970 },
    { name: 'Information', start: 11970, end: TODAY_HE },
  ];
  ```

### Task 2.2: Verify eras render

- [ ] **Step 1: Build, then visual test.**

  Run: `npm run build && npm run partition && npm run dev`

  Open the browser. Confirm:
  - At full-epoch zoom, all 9 bands are visible behind the timeline
    rule, non-overlapping.
  - Stone Age is widest, Information is narrowest.
  - Era labels (e.g. "BRONZE AGE") appear in verdigris uppercase
    when a band's on-screen width exceeds ~80px.
  - Bands disappear cleanly at the edge gutters (not abruptly cut).
  - Today marker still anchors at the right edge of the Information
    band.

  Stop the dev server.

### Task 2.3: Commit Phase 2

- [ ] **Step 1: Stage and commit.**

  ```bash
  git add src/data/eras.ts
  git commit -m "$(cat <<'EOF'
  populate eras with 9-band hybrid list

  +claude
  EOF
  )"
  ```

---

## Phase 3: Cuts and bracket-event removals

Apply the per-entry dispositions from the spec's curation rules
section. This phase only **removes** entries; rewrites and additions
follow in later phases.

### Task 3.1: Cut era-start markers and bracket entries

**Files:**
- Modify: `src/data/all_events.json`

- [ ] **Step 1: Delete the following entries by their `(year, title)`
  pair.** Use a JSON-aware editor or a `jq` filter. Each line below
  is one entry to remove.

  - (5000, "Copper Age Starts")
  - (6700, "Bronze Age Starts")
  - (8800, "Iron Age Starts")
  - (10000, "Common Era Begins")
  - (10500, "Middle Ages Begin")
  - (10500, "The Dark Ages")
  - (11400, "The Renaissance")
  - (11700, "The Enlightenment")
  - (11760, "Industrial Revolution Begins")
  - (11970, "Information Age Starts")

  After deletion, 134 − 10 = 124 entries remain.

  Sample `jq` filter (run from repo root):

  ```bash
  jq '[ .[] | select(
    not (
      (.year == 5000 and .title == "Copper Age Starts") or
      (.year == 6700 and .title == "Bronze Age Starts") or
      (.year == 8800 and .title == "Iron Age Starts") or
      (.year == 10000 and .title == "Common Era Begins") or
      (.year == 10500 and .title == "Middle Ages Begin") or
      (.year == 10500 and .title == "The Dark Ages") or
      (.year == 11400 and .title == "The Renaissance") or
      (.year == 11700 and .title == "The Enlightenment") or
      (.year == 11760 and .title == "Industrial Revolution Begins") or
      (.year == 11970 and .title == "Information Age Starts")
    )
  ) ]' src/data/all_events.json > /tmp/all_events.json && \
    mv /tmp/all_events.json src/data/all_events.json
  ```

- [ ] **Step 2: Confirm count.**

  Run: `jq 'length' src/data/all_events.json`

  Expected: `124`.

### Task 3.2: Cut WWI/WWII/Cold War bracket entries

**Files:**
- Modify: `src/data/all_events.json`

- [ ] **Step 1: Delete the bracket entries that will be replaced.**

  Cuts:
  - (11914, "World War I Begins")
  - (11918, "World War I Ends")
  - (11939, "World War II Begins")
  - (11945, "World War II Ends")
  - (11947, "Cold War Begins")
  - (11991, "Cold War Ends")

  Same `jq` pattern as Task 3.1 step 1. After this, 124 − 6 = 118
  entries remain.

- [ ] **Step 2: Confirm count.**

  Run: `jq 'length' src/data/all_events.json`

  Expected: `118`.

### Task 3.3: Verify and commit Phase 3

- [ ] **Step 1: Build + visual check.**

  Run: `npm run build && npm run partition && npm run dev`

  Open the browser. Confirm:
  - Era bands fill the visual gaps where era-start markers used to
    sit (the bands now do that orientation work).
  - WWI/WWII/Cold War markers are gone; the modern timeline has
    visible empty space where they were (will be filled in Phase 4).
  - No console errors, no rendering glitches.

  Stop the dev server.

- [ ] **Step 2: Commit.**

  ```bash
  git add src/data/all_events.json
  git commit -m "$(cat <<'EOF'
  cut era-start and bracket events

  +claude
  EOF
  )"
  ```

---

## Phase 4: Tier 1 (trajectory) curation

Audit and finalize the top tier — events that move humanity along the
arc toward Type 1 civilization, plus brushes with great filters that
shaped what we survived.

Each addition / rewrite below is one JSON entry to insert into
`src/data/all_events.json`. Append entries at the end of the array;
order within the JSON does not affect rendering (the layout engine
sorts by importance, then year). Match the existing JSON formatting
(2-space indent, double-quoted keys/values).

> **Starter-copy convention.** Pre-written JSON entries in this and
> later phases are *starter copy* — an honest first draft of title,
> description, year, and importance. Before each phase commit, the
> curator should verify dates against authoritative sources and
> refine any copy that doesn't quite land in voice. Description
> length must stay ≤ 180 chars; title length ≤ 50 chars (target
> ≤ 30). The pre-written entries respect those limits; trims during
> refinement should keep them inside.

### Task 4.1: Add WWI/WWII/Cold War replacement events

**Files:**
- Modify: `src/data/all_events.json`

- [ ] **Step 1: Add the four replacement entries.**

  ```json
  {
    "year": 11914,
    "title": "Assassination at Sarajevo",
    "description": "A Bosnian Serb shoots an archduke on a Sarajevo street. The gunshot triggers four years of trench warfare and twenty million dead.",
    "importance": 1
  },
  {
    "year": 11942,
    "title": "Auschwitz",
    "description": "Industrial-scale mass murder begins at a converted Polish camp. Six million Jews and millions of others die before the war ends.",
    "importance": 1
  },
  {
    "year": 11945,
    "title": "Hiroshima",
    "description": "A single bomb destroys a city. The atomic age begins, and humanity now possesses the means to end itself in an afternoon.",
    "importance": 1
  },
  {
    "year": 11989,
    "title": "Fall of the Berlin Wall",
    "description": "East Berliners breach the wall to cheering crowds. The Cold War ends without the nuclear exchange both sides had spent forty years preparing.",
    "importance": 1
  }
  ```

  Volume: +4 entries (118 → 122).

### Task 4.2: Add Kardashev / great-filter additions

**Files:**
- Modify: `src/data/all_events.json`

- [ ] **Step 1: Add the following entries.**

  ```json
  {
    "year": 11859,
    "title": "Carrington Event",
    "description": "A solar storm overwhelms telegraph wires worldwide; sparks fly from operators' equipment. A storm of that size today would crash the modern grid.",
    "importance": 1
  },
  {
    "year": 11908,
    "title": "Tunguska Event",
    "description": "A meteor airbursts over Siberian forest, flattening 2,000 square kilometers of trees. No crater, no impactor recovered, no fatalities — by luck of geography.",
    "importance": 1
  },
  {
    "year": 11942,
    "title": "First Nuclear Chain Reaction",
    "description": "Beneath a Chicago squash court, scientists sustain the first controlled nuclear chain reaction. Energy capture at a new order of magnitude — and a new kind of weapon.",
    "importance": 1
  },
  {
    "year": 11957,
    "title": "Sputnik",
    "description": "A small radio-emitting sphere reaches orbit, becoming the first human-made object to circle Earth. Humanity has stepped off the planet.",
    "importance": 1
  },
  {
    "year": 11962,
    "title": "Cuban Missile Crisis",
    "description": "Soviet missiles in Cuba bring the United States and the USSR to within hours of nuclear exchange. Closest documented brush with self-extinction.",
    "importance": 1
  },
  {
    "year": 12012,
    "title": "Voyager Crosses the Heliopause",
    "description": "A 1977 spacecraft becomes the first human-made object to enter interstellar space. It carries a golden record of who we were when we sent it.",
    "importance": 1
  }
  ```

  Volume: +6 entries (122 → 128).

### Task 4.3: Audit existing tier-1 entries; demote where appropriate

**Files:**
- Modify: `src/data/all_events.json`

After Phase 1's flip, all 86 events that used to be `importance: 3`
are now `importance: 1`. Many of them genuinely meet the new tier-1
bar (trajectory toward Type 1 / great-filter brush). Some are
cultural anchors that should be `importance: 2` under the new
definitions.

- [ ] **Step 1: Read the spec's tier definitions and tier exemplars
  carefully.**

  Open
  `docs/superpowers/specs/2026-04-28-events-dataset-rewrite-design.md`.
  Re-read the **Importance tiers** section.

- [ ] **Step 2: Walk every entry currently at `importance: 1` and
  decide.**

  For each entry: does the event measurably move humanity along the
  Type 1 arc, or constitute a brush with a great filter? If yes,
  keep at `importance: 1`. If it is a cultural anchor (broad
  resonance, but not arc-shaping), demote to `importance: 2`.

  Candidates likely to demote (representative; final call is
  per-entry judgment):

  - "Founding of Rome" (9224) — cultural anchor, not Kardashev step.
  - "Hanging Gardens of Babylon" (9401) — cultural anchor / mystique.
  - "Temple of Artemis" (9451) — cultural anchor.
  - "Statue of Zeus at Olympia" (9566) — cultural anchor.
  - "Mausoleum at Halicarnassus" (9651) — cultural anchor.
  - "Colossus and Pharos" (9721) — cultural anchor.
  - "Charlemagne's Coronation" (10800) — political pivot, cultural.
  - "First Sea Circumnavigation" (11522) — likely stays tier 1
    (physical reach), but borderline.
  - "Spanish Golden Age" (11600) — cut entirely (per empire-peak
    rule, Phase 5).
  - "Dutch Golden Age" (11650) — same, cut entirely.
  - "Death of Genghis Khan" (11227) — cultural anchor of an empire,
    not Kardashev directly. Demote to 2.
  - "British Empire Peak" (11920) — cut entirely (empire-peak rule).
  - "First French Empire Peak" (11812) — cut entirely (empire-peak
    rule).

  The voice rule still applies; demotion does not change a placard's
  copy unless rewriting also produces a stronger voice.

- [ ] **Step 3: Apply demotions and any cuts.**

  For each entry kept but demoted: change `"importance": 1` to
  `"importance": 2`.

  For each entry to cut entirely (per empire-peak rule), delete the
  entry. Empire-peak cuts that produce no replacement at this stage:

  - (11600, "Spanish Golden Age")
  - (11650, "Dutch Golden Age")
  - (11920, "British Empire Peak")
  - (11812, "First French Empire Peak")
  - (11500, "Aztec Empire Peak")  — cut; replacement in Phase 5.
  - (11500, "Inca Empire Peak")  — cut; replacement in Phase 5.
  - (11500, "Ottoman Empire Peak")  — cut; replacement in Phase 5.
  - (8600, "Zenith of the Pharaohs")  — cut; existing entries
    around it (Tutankhamun, Burial of Tutankhamun, Code of
    Hammurabi) carry the era.

- [ ] **Step 4: Confirm count and tier counts.**

  Run:

  ```bash
  jq '[.[].importance] | group_by(.) | map({importance: .[0], count: length})' src/data/all_events.json
  jq 'length' src/data/all_events.json
  ```

  Expected, approximately:
  - `importance: 1` count: 50–60 (target tier 1 volume).
  - `importance: 2` count: 60–75 (some tier-1 → tier-2 demotions
    plus existing 47 entries minus any further cuts).
  - Total: ~120–125.

  Exact numbers depend on per-entry judgment; the targets are
  ranges, not absolutes.

### Task 4.4: Verify and commit Phase 4

- [ ] **Step 1: Build + visual check.**

  Run: `npm run build && npm run partition && npm run dev`

  Open the browser. Confirm:
  - At full-epoch zoom, tier-1 trajectory events visible — fewer
    than before, but the ones present feel weighty.
  - At moderate zoom, tier-2 cultural anchors fill in around them.
  - New events (Sarajevo, Hiroshima, Auschwitz, Berlin Wall, Sputnik,
    Voyager, etc.) appear at the correct positions on the timeline.
  - Click each new event; popup renders correctly with title +
    description + year.

  Stop the dev server.

- [ ] **Step 2: Commit.**

  ```bash
  git add src/data/all_events.json
  git commit -m "$(cat <<'EOF'
  curate tier 1 — trajectory and filter events

  +claude
  EOF
  )"
  ```

---

## Phase 5: Tier 2 (cultural anchors) curation

Audit existing tier-2 entries, rewrite empire peaks as defining
moments where possible, and start the coverage push.

### Task 5.1: Rewrite empire-peak entries as defining moments

**Files:**
- Modify: `src/data/all_events.json`

- [ ] **Step 1: For each empire-peak entry, decide rewrite or cut.**

  The empire-peak rule (spec): rewrite as a specific defining act, or
  cut. Replacement is not required for every cut. Below are
  pre-written rewrites for the empire peaks worth saving; cut the
  rest unconditionally.

  **Rewrites to apply.** For each, find the existing entry at the
  given `(year, title)` and replace it (year and importance may
  change):

  ```json
  {
    "year": 7670,
    "title": "Sargon Unites the City-States",
    "description": "An Akkadian conqueror joins Sumer's quarreling cities under one rule. The first multi-city empire in human history.",
    "importance": 1
  }
  ```
  Replaces: (7670, "Akkadian Empire").

  ```json
  {
    "year": 9479,
    "title": "Cyrus's Cylinder",
    "description": "A Persian king issues a clay-cylinder decree on the conquest of Babylon, releasing captives and restoring local gods. Read by some as the first declaration of religious tolerance.",
    "importance": 1
  }
  ```
  Replaces: (9480, "Achaemenid Persian Empire").

  ```json
  {
    "year": 9700,
    "title": "Library of Ashurbanipal",
    "description": "An Assyrian king assembles tens of thousands of clay tablets at Nineveh — the first systematic library, copying everything its agents could find across the empire.",
    "importance": 2
  }
  ```
  Replaces: (9700, "Assyrian Empire Peak").

  ```json
  {
    "year": 10330,
    "title": "Aryabhata Calculates Pi",
    "description": "An Indian mathematician computes π to four decimals and proposes that Earth rotates on its axis. Among the founding works of the Gupta golden age.",
    "importance": 2
  }
  ```
  Replaces: (10320, "Gupta Empire Golden Age").

  ```json
  {
    "year": 10650,
    "title": "Foreign Envoys at Chang'an",
    "description": "Tang China's capital becomes the most cosmopolitan city on Earth — Persian, Korean, and Sogdian quarters trading silk, poetry, and Buddhist sutras.",
    "importance": 2
  }
  ```
  Replaces: (10650, "Tang Dynasty Peak").

  ```json
  {
    "year": 11529,
    "title": "Suleiman Besieges Vienna",
    "description": "Ottoman cannons reach the gates of Vienna, the deepest Ottoman push into Europe. Suleiman withdraws; the boundary holds for the next two centuries.",
    "importance": 2
  }
  ```
  Replaces: (11500, "Ottoman Empire Peak"). (Already cut in Task 4.3
  Step 3 — add this entry as a new addition.)

  **Cuts (no replacement):**
  - (11500, "Aztec Empire Peak") — already cut in Task 4.3.
    Replacement deferred to Task 5.2 coverage push.
  - (11500, "Inca Empire Peak") — already cut. Replacement
    deferred to Task 5.2.
  - (11600, "Spanish Golden Age") — already cut.
  - (11650, "Dutch Golden Age") — already cut.
  - (11812, "First French Empire Peak") — already cut.
  - (11920, "British Empire Peak") — already cut.

### Task 5.2: Coverage push — add events from underrepresented regions

**Files:**
- Modify: `src/data/all_events.json`

- [ ] **Step 1: Add the entries below.** Each is a high-confidence,
  on-voice candidate for one of the underrepresented regions called
  out in the spec. Match existing JSON formatting.

  **Sub-Saharan Africa** (target: 4-6 entries).

  ```json
  {
    "year": 9500,
    "title": "Nok Terracottas",
    "description": "Iron-working farmers on the Jos Plateau shape life-sized terracotta heads with precise human features. The earliest figurative sculpture from sub-Saharan Africa.",
    "importance": 2
  },
  {
    "year": 10350,
    "title": "Aksum's Obelisks",
    "description": "Stone slabs taller than five-story buildings rise over the highlands of what is now Ethiopia, marking royal tombs of one of antiquity's great trade empires.",
    "importance": 2
  },
  {
    "year": 11324,
    "title": "Mansa Musa's Hajj",
    "description": "The king of Mali crosses the Sahara to Mecca with a caravan of slaves and gold so vast it depresses the price of gold across Egypt for a decade.",
    "importance": 2
  },
  {
    "year": 11300,
    "title": "Great Zimbabwe",
    "description": "Drystone walls thirty feet high enclose a southern African capital of trade in gold, ivory, and Chinese porcelain — built without mortar.",
    "importance": 2
  }
  ```

  **Polynesia** (target: 2-3 entries beyond existing Hawaii).

  ```json
  {
    "year": 7000,
    "title": "Lapita Pottery Dispersal",
    "description": "A distinctive geometric pottery style spreads across the western Pacific, marking the deep-time precursor to the great Polynesian voyages still millennia away.",
    "importance": 2
  },
  {
    "year": 11280,
    "title": "Maori Reach New Zealand",
    "description": "Polynesian voyagers cross thousands of miles of southern ocean to reach a temperate land previously empty of humans, the last large landmass in the habitable world to be settled.",
    "importance": 2
  }
  ```

  **Pre-Columbian Americas (beyond Maya)** (target: 3-5 entries).

  ```json
  {
    "year": 6900,
    "title": "Caral",
    "description": "Pyramids and sunken plazas rise in a Peruvian valley with no pottery, no metallurgy, no writing — the oldest known city in the Americas.",
    "importance": 2
  },
  {
    "year": 8500,
    "title": "Olmec Colossal Heads",
    "description": "Mesoamerican carvers shape basalt boulders, some weighing twenty tons, into helmeted human heads. Each one is a portrait; we don't know whose.",
    "importance": 2
  },
  {
    "year": 11050,
    "title": "Cahokia",
    "description": "An earthwork city on the Mississippi swells past 20,000 people. Its central pyramid covers more ground than the Great Pyramid of Giza.",
    "importance": 2
  }
  ```

  **South Asia (beyond Indus + Gupta)** (target: 2-3 entries).

  ```json
  {
    "year": 9740,
    "title": "Ashoka's Pillars",
    "description": "An Indian emperor renounces conquest after a brutal war and inscribes edicts of nonviolence on stone columns across his realm. The earliest decree of state-sponsored compassion.",
    "importance": 2
  },
  {
    "year": 10510,
    "title": "Nalanda",
    "description": "A monastic university in Bihar grows to ten thousand students from across Asia, with libraries so vast their burning later takes months.",
    "importance": 2
  }
  ```

  **Southeast Asia** (target: 2 entries).

  ```json
  {
    "year": 10825,
    "title": "Borobudur",
    "description": "Two million stone blocks rise on a Javanese plain into the largest Buddhist monument ever built — a stepped mandala that pilgrims circumambulate from base to summit.",
    "importance": 2
  },
  {
    "year": 11150,
    "title": "Angkor Wat",
    "description": "Khmer builders raise a temple complex larger than any cathedral in Europe, oriented to the western horizon and the setting sun, then encode the Hindu cosmos in its layout.",
    "importance": 2
  }
  ```

  **China beyond existing entries** (target: 3-4 more).

  ```json
  {
    "year": 11020,
    "title": "First Paper Money",
    "description": "Song-dynasty Sichuan merchants begin trading with printed promissory notes called jiaozi. Currency cuts loose from metal — abstraction enabling planetary trade centuries later.",
    "importance": 1
  },
  {
    "year": 11040,
    "title": "Bi Sheng's Movable Type",
    "description": "A Song printer carves individual characters into clay and fires them, then composes pages by arrangement. Four hundred years before Gutenberg.",
    "importance": 2
  },
  {
    "year": 11405,
    "title": "Zheng He's Voyages",
    "description": "Ming China sends fleets of treasure ships — some five times the length of Columbus's vessels — as far as East Africa, then voluntarily destroys them.",
    "importance": 2
  }
  ```

  **Steppe / Mongol** (target: 1-2 more).

  ```json
  {
    "year": 11241,
    "title": "Mongol Wave Reaches Liegnitz",
    "description": "Mongol cavalry crushes a combined European force at Legnica in modern Poland, then turns home for a succession crisis. Western Europe survives by accident.",
    "importance": 2
  }
  ```

  Total additions in this step: ~17 entries.

### Task 5.3: Verify and commit Phase 5

- [ ] **Step 1: Confirm count.**

  Run: `jq 'length' src/data/all_events.json`

  Expected: roughly 135-140 (Phase 4 left ~120-125; Phase 5 added
  ~17 minus any cuts in Task 5.1).

- [ ] **Step 2: Build + visual check.**

  Run: `npm run build && npm run partition && npm run dev`

  Open the browser. Confirm:
  - New tier-2 entries from underrepresented regions render at the
    expected positions.
  - At moderate zoom, geographic distribution looks more balanced
    than before.
  - Click a few new entries; popups render correctly.
  - No collision artifacts; labels still don't overlap.

  Stop the dev server.

- [ ] **Step 3: Commit.**

  ```bash
  git add src/data/all_events.json
  git commit -m "$(cat <<'EOF'
  curate tier 2 — cultural anchors and coverage

  +claude
  EOF
  )"
  ```

---

## Phase 6: Tier 3 (texture) curation

Introduce the new texture tier. Currently zero events live here. The
volume target is ~30-50.

### Task 6.1: Add tier-3 texture entries

**Files:**
- Modify: `src/data/all_events.json`

- [ ] **Step 1: Add the entries below as a starter set.**

  Each is a specific on-voice moment whose implication is real but
  narrow. Visible only at zoom > 5.

  ```json
  {
    "year": 7950,
    "title": "Phaistos Disc",
    "description": "A clay disc spiral-stamped with 241 symbols is fired in Minoan Crete. The script appears nowhere else, and no one has read it.",
    "importance": 3
  },
  {
    "year": 11054,
    "title": "Crab Nebula Supernova",
    "description": "Chinese astronomers note a guest star bright enough to be visible by day for weeks. Their notes are how modern astronomers date the explosion now expanding as the Crab Nebula.",
    "importance": 3
  },
  {
    "year": 11680,
    "title": "Stradivari's First Violin",
    "description": "A Cremonese artisan crafts an instrument no one since has been able to reproduce, despite three centuries of measurement and copying. The technique died with him.",
    "importance": 3
  },
  {
    "year": 11783,
    "title": "First Hot-Air Balloon",
    "description": "Two Frenchmen rise over Paris in a Montgolfier brothers' linen-and-paper balloon. The first time humans leave the ground untethered.",
    "importance": 3
  },
  {
    "year": 11879,
    "title": "Edison's First Bulb",
    "description": "A carbonized bamboo filament glows for forty hours in a Menlo Park laboratory. Light that doesn't burn anything visible.",
    "importance": 3
  }
  ```

  Volume: +5. The full target (~30-50 entries) requires further
  research; the candidates below are starting points the curator can
  expand using the same voice and tier rules.

- [ ] **Step 2: Optional — add 25-45 more tier-3 entries.**

  Sources to draw from:
  - Less-famous cultural artifacts paralleling the tier-2 set.
  - Specific scientific observations / discoveries with narrow
    impact (early astronomical notes, individual scientific firsts).
  - Specific minor inventions (paper umbrella, printing press
    individual books, individual artworks).
  - Specific natural events that didn't reshape humanity (regional
    eruptions, individual famines, individual eclipses recorded).

  Voice rule still applies. Match the existing tier-3 candidates'
  cadence: specific object/moment first, quietly-stated narrow
  implication second.

  This step is research-driven; the plan does not pre-write all
  candidates. Keep adding until the tier-3 count reaches at least 30.

### Task 6.2: Reclassify existing entries to tier 3 where appropriate

**Files:**
- Modify: `src/data/all_events.json`

- [ ] **Step 1: For each existing entry that's currently tagged
  `importance: 2` but reads as quiet texture rather than cultural
  anchor, demote to `importance: 3`.**

  Likely reclassifications (per spec discussion):
  - "Antarctic Winter-over" (11899) — physical-reach moment but
    narrower than full tier 1; could go tier 3 (texture) or tier 1
    (Type-1-progression). Curator's call.
  - "Hero's Steam Engine" (10060) — likely stays tier 1 (filter-
    adjacent / undeployed Kardashev step). Verify against the spec.
  - "Dodo Bird Extinction" (11662) — borderline. Could be tier 1
    (extinction-wave precursor) or tier 3 (modest texture).
  - Cut entirely: "Amelia Earhart Disappears" (11937) — celebrity
    trivia, no on-voice implication.

- [ ] **Step 2: Confirm tier counts.**

  Run:

  ```bash
  jq '[.[].importance] | group_by(.) | map({importance: .[0], count: length})' src/data/all_events.json
  jq 'length' src/data/all_events.json
  ```

  Expected:
  - `importance: 1` count: ~50-60.
  - `importance: 2` count: ~50-70.
  - `importance: 3` count: 30-50.
  - Total: 150-180.

  These are targets, not strict bounds. Final counts depend on
  per-entry judgment.

### Task 6.3: Verify and commit Phase 6

- [ ] **Step 1: Build + visual check at multiple zoom levels.**

  Run: `npm run build && npm run partition && npm run dev`

  Open the browser. Specifically test the three-tier visibility:

  1. Zoom to full epoch — only tier-1 (always-shown) labels visible.
  2. Zoom in moderately (e.g. 1000-year span) — tier-1 + tier-2
     labels visible.
  3. Zoom in tight (single-decade span) — all three tiers visible,
     including new tier-3 textures.
  4. Drag-pan across all eras; tier-3 events should appear and
     disappear smoothly with zoom changes.
  5. Click a tier-3 entry; popup positions correctly.

  Stop the dev server.

- [ ] **Step 2: Commit.**

  ```bash
  git add src/data/all_events.json
  git commit -m "$(cat <<'EOF'
  curate tier 3 — quiet textures

  +claude
  EOF
  )"
  ```

---

## Phase 7: Density curve (deep-past fill)

Add ~8-12 carefully-chosen pre-5000 HE entries (per the spec's "light
hybrid C" density choice).

### Task 7.1: Add pre-5000 HE events

**Files:**
- Modify: `src/data/all_events.json`

- [ ] **Step 1: Add the following entries as a starter set.**

  ```json
  {
    "year": 1000,
    "title": "Younger Dryas Closes",
    "description": "A 1,200-year cold snap ends abruptly. Global temperatures stabilize near modern values, opening the climatic window in which agriculture becomes possible.",
    "importance": 1
  },
  {
    "year": 1500,
    "title": "Natufian Burials at Eynan",
    "description": "Hunter-gatherers in the Levant bury their dead with ground-stone tools and shell ornaments — among the first evidence of permanent settlements before farming.",
    "importance": 3
  },
  {
    "year": 1900,
    "title": "First Farmed Wheat",
    "description": "Foragers in southeastern Anatolia cultivate emmer and einkorn wheat, replacing wild gathering with deliberate planting. The slowest-motion revolution in human history begins.",
    "importance": 1
  },
  {
    "year": 2200,
    "title": "Earliest Pottery in East Asia",
    "description": "Jōmon foragers on the Japanese archipelago fire clay vessels for boiling — among the oldest known pottery anywhere, predating sedentism in their own region.",
    "importance": 2
  },
  {
    "year": 2800,
    "title": "Domestication of Goats",
    "description": "Herders in the Zagros Mountains tame the bezoar ibex into a pliable food and clothing source. Cheese and yogurt emerge as preservation strategies for milk.",
    "importance": 2
  },
  {
    "year": 3800,
    "title": "Domestication of Sheep",
    "description": "Herders in the Fertile Crescent tame mouflon into wool-bearing sheep. Textile manufacture becomes a continuous resource rather than a hunting outcome.",
    "importance": 2
  },
  {
    "year": 4200,
    "title": "Earliest Cave Art at Magura",
    "description": "Bulgarian artists paint dancing figures and astronomical observations using bat guano as pigment. Among the latest cave-art traditions, surviving into the Copper Age.",
    "importance": 3
  }
  ```

  Volume: +8 entries. Total dataset target: 158-188 events.

### Task 7.2: Verify and commit Phase 7

- [ ] **Step 1: Build + final visual sweep.**

  Run: `npm run build && npm run partition && npm run dev`

  Open the browser. Confirm:
  - Pan all the way left to year 0. The deep-past now has visible
    placards alongside the existing 8.2 kiloyear / Storegga / etc.
    The Stone Age band has population.
  - Scroll right through every era band. No empty stretches of
    timeline (modulo era-band-only regions you intentionally left
    sparse).
  - All three importance tiers behave correctly across scroll/zoom
    range.

  Stop the dev server.

- [ ] **Step 2: Commit.**

  ```bash
  git add src/data/all_events.json
  git commit -m "$(cat <<'EOF'
  curate deep past — pre-5000 HE fill

  +claude
  EOF
  )"
  ```

---

## Phase 8: Final verification

### Task 8.1: Final counts and tier balance

- [ ] **Step 1: Confirm tier balance.**

  Run:

  ```bash
  jq '[.[].importance] | group_by(.) | map({importance: .[0], count: length})' src/data/all_events.json
  jq 'length' src/data/all_events.json
  ```

  Expected (rough targets — ranges OK, exact numbers driven by
  per-entry judgment):
  - `importance: 1`: 50-65.
  - `importance: 2`: 55-75.
  - `importance: 3`: 30-50.
  - Total: 150-180.

  If outside ranges, revisit the relevant phase before claiming
  done.

### Task 8.2: Run all tests

- [ ] **Step 1: Vitest.**

  Run: `npx vitest run`

  Expected: all tests pass.

- [ ] **Step 2: Type check + Vite build.**

  Run: `npm run build`

  Expected: build succeeds.

### Task 8.3: Full visual sweep

- [ ] **Step 1: Final manual test.**

  Run: `npm run partition && npm run dev`

  Walk the timeline end-to-end at multiple zoom levels:

  1. Full-epoch view: tier-1 labels only; era bands all 9 visible.
  2. Pan left to year 0; verify Stone Age band starts there, deep-
     past placards present.
  3. Slowly zoom in while panning right; tier-2 then tier-3 labels
     appear progressively.
  4. Dense regions (post-11000 HE): no label collisions, popup
     positioning correct on click.
  5. Today marker still anchors to current HE year; Information era
     band reaches it.
  6. Annometer reveal still plays correctly on first load.

  Stop the dev server.

### Task 8.4: Done

- [ ] **Step 1: Final commit if any pending changes.**

  Run: `git status`

  If clean: phase complete.

  If untracked or modified files remain: review and commit.

The rewrite is complete. Deferred work — catchier titles, fog
re-enable, sub-band era layer — lives in `docs/TODO.md` and is out of
scope for this plan.
