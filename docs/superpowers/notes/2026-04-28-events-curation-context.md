# Events Curation Context

Pre-brainstorm dump. Captures everything decided, observed, or surfaced
about the events list, voice, eras, and curation strategy through 2026-04-28
so the next session can pick up without rebuilding context.

## Related artifacts

- `docs/superpowers/specs/2026-04-26-holocene-theme-design.md` — locked
  theme spec, defines visuals (palette, typography, era bands, placard).
- `docs/superpowers/plans/2026-04-27-holocene-theme-implementation.md` —
  implementation plan for the theme. Already executed and merged.
- `CLAUDE.md` / `GEMINI.md` — project conventions (120-col, 50/72 commits,
  imperative lowercase, comments only for *why*, never commit without
  visual test, "+claude" coauthor).
- Memory: `events_no_rediscovery.md` — operational reminder of the
  no-rediscovery stance.

## Brief

Holocene timeline as a *museum-hall walk*: each event is an exhibit, the
user walks past as they scroll/zoom. Fog at the gutters represents the
unknown periphery (currently disabled pending tuning).

User's framing of the voice — direct quotes:

> "i want the whole timeline to evoke feelings of awe, wonder, intrigue,
> mystique, and curiosity. i want it to feel like walking through 4th
> dimension as if it were a hall in a museum, with fog clearing as you walk
> through it. the events are like exhibits in the hall, with a short
> description and date. the descriptions should be short and succinct, much
> like a museum placard."

> "i want the lack of poetry and flourish to be intentional, to build the
> sense of scale and grandeur. they are tiny little moments in the grand
> scheme of the epoch."

The voice is restrained, concrete, slightly clinical. Specific
object/moment + quietly-stated outsized implication. Not "the Bronze Age"
but "a bronze disc inlaid with gold stars and a crescent moon, buried in
Saxony — the oldest known depiction of the cosmos."

## Inclusion criteria

Earns a placard:

- Events that significantly impacted humanity's trajectory.
- Events emblematic of the epoch.
- Discovery/development events that are part of the path itself —
  agriculture, writing, the wheel, the steam engine, etc.

Does NOT earn a placard:

- **Modern rediscovery of buried artifacts.** Pompeii unearthed (1748 CE),
  Tutankhamun's tomb opened (1922), Lascaux (1940), Dead Sea Scrolls (1947),
  Skara Brae uncovered (1850). The corresponding *original* events
  (deposition, burial, building) ARE appropriate. User stance, direct
  quote: "i want the timeline to look like the single path through time
  that it really is. our rediscovery of things reshapes our view of the
  past, but the ideal is that we need no reshaping here. this path is what
  it always was and ever will be." Saved as memory entry.
- **Era-start markers.** Bronze Age Starts, Iron Age Starts, Copper Age
  Starts, Common Era Begins, Middle Ages Begin, etc. Era information is
  visual orientation handled by era bands (see Eras section), not by point
  markers.
- **"Begin / end" pair events.** Cold War Begins / Ends, WWI Begins / Ends,
  WWII Begins / Ends, Industrial Revolution Begins, The Renaissance, The
  Enlightenment, Information Age Starts. Encyclopedia-section-headers, not
  exhibits. Cut or rewrite as a single specific moment.
- **Encyclopedia-flat empire peaks.** "Spanish Golden Age — The Spanish
  Empire becomes a global superpower." Rewrite around a specific moment or
  cut.

## Tonal exemplars (already in voice — match these)

These have the right structure: specific object/moment with quietly-stated
implication.

- Skara Brae
- Newgrange
- Ggantija Temples
- Nebra Sky Disk
- Voynich Manuscript
- Antikythera Mechanism
- Storegga Landslide
- Samalas Eruption
- Polynesian Settlement of Hawaii
- Proto-Sinaitic Script

## Off-voice patterns (need cuts or rewrites)

### Begin / end pairs

Single biggest tonal landmine. The Renaissance bullet illustrates:

- Off voice: *"The Renaissance — Cultural and artistic rebirth starts in
  Italy."*
- In voice (illustrative): *"Brunelleschi's Dome — A Florentine goldsmith
  builds a dome no architect believes is possible, raising 4 million bricks
  without scaffolding."*

Pairs flagged in the current data:

- Cold War Begins / Cold War Ends
- World War I Begins / Ends
- World War II Begins / Ends
- Industrial Revolution Begins
- The Renaissance
- The Enlightenment
- Middle Ages Begin (also has near-duplicate "The Dark Ages" at year 10500
  — both should be reconsidered)
- Information Age Starts

For wars specifically: a single specific moment usually works (Sarajevo
assassination, Hiroshima, fall of the Berlin Wall) rather than the bracket
events.

### Era-start markers

Bronze Age Starts (6700), Iron Age Starts (8800), Copper Age Starts (5000),
Common Era Begins (10000). Convert to era bands instead of leaving as
markers. The era spans are what gets visual representation, via the new era
band feature.

### Empire-peak descriptions

Currently flat: "British Empire Peak — The largest empire in history reaches
its maximum territorial extent." Each one needs a specific anchoring moment
or it gets cut. Examples to address: Spanish Golden Age, British Empire
Peak, First French Empire Peak, Aztec/Inca Empire Peak, Ottoman Empire
Peak, Akkadian Empire, Achaemenid Persian Empire, Assyrian Empire Peak,
Tang Dynasty Peak, Gupta Empire Golden Age. Some have specific emblematic
moments (Suleiman besieges Vienna; Cyrus's Cylinder edict; the burning of
the library at Alexandria); others may not be salvageable in voice.

## Eras

Era bands are a separate visual concept defined by the theme spec: faint
warm-dark horizontal strips behind the timeline rule, labeled in verdigris
uppercase letter-spaced JetBrains Mono. Label renders only when the band's
on-screen width exceeds ~80px; otherwise the band remains without label.

Data lives in `src/data/eras.ts` — currently exports `Era[] = []`.

```ts
export interface Era {
  name: string;
  /** Inclusive HE start year. */
  start: number;
  /** Exclusive HE end year. */
  end: number;
}
```

Era candidates for the initial list (boundaries to be decided per era —
they're regional and gradual in reality, but the timeline needs concrete
HE ranges):

- Stone Age (Paleolithic / Mesolithic / Neolithic — possibly split)
- Copper Age
- Bronze Age
- Iron Age
- Antiquity / Classical
- Middle Ages
- Renaissance / Early Modern
- Industrial
- Information / Modern

Open: whether to split Stone Age into Mesolithic/Neolithic; whether
Antiquity overlaps with Iron Age (yes, regionally); whether to use
Eurocentric or Holocene-wide framing.

## Structural concerns

### Importance levels

`importance: number` typed 1–3 in `events.ts` but the JSON uses only 2 and
3 in practice (plus the synthetic Today=1). The renderer's adaptive label
rule:

```ts
zoom > 5 || importance >= 3 || (zoom > 1 && importance >= 2)
```

treats `1` as "minor curiosity, only render label when zoomed in close." No
events currently use this level.

Curation should introduce real 1s — dodo-bird-tier minor events that add
density at high zoom without crowding low zoom. Need exemplars for what an
"importance 1" event looks like in voice.

### Density distribution

Pre-5000 HE: ~8 events. 11000–12000 HE: dozens. The hall feels mostly
empty until modernity, then suddenly packed.

Two paths (open question):

- **Lean in.** Acknowledge "the further back, the thicker the mist; we
  know less." The fog overlay can do this work by getting visibly denser
  at low HE years (when re-enabled).
- **Push back.** Fill in pre-agriculture / Mesolithic / pre-iron-age
  events: Younger Dryas climate snap, megafauna extinctions, lake
  dwellings, earliest pottery, the 8.2 kiloyear event (already there),
  Storegga (already there).

### Coverage gaps

Conspicuous next to Europe's density:

- Africa beyond Egypt: Kush, Aksum, Mali, Great Zimbabwe.
- Pre-Columbian Americas beyond Maya: Olmec, Cahokia, Norte Chico,
  Tiwanaku, Moche.
- Polynesia: a single event (Hawaii) for an entire civilizational arc.
- China outside Great Wall / Tang / oracle bones (sparse).
- South / Southeast Asia (sparse).
- Australia / Oceania (essentially absent).

Open question: priority among these, or balance of all?

### Description length

Current entries vary ~50–150 characters. The placard renders Inter at
0.78rem with line-height 1.55, so longer descriptions wrap fine. Shorter
is more on-voice (museum-placard restraint). No hard cap exists yet —
worth deciding. Most in-voice exemplars hover around 120–160 chars.

## Data file structure

Master file: `src/data/all_events.json` (134 entries currently). Edited
manually. After edits, run `npm run partition` to regenerate the
2,000-year-chunked files in `public/data/` (gitignored, regenerated from
master). The dev server serves the chunks; without partitioning after a
master edit, the page serves stale or 404 chunks.

`HistoryEvent` interface in `src/data/events.ts`:

```ts
export interface HistoryEvent {
  year: number;       // HE
  title: string;
  description: string;
  importance: number; // 1–3 (only 2 and 3 used in practice)
  isToday?: boolean;
}
```

The "Present Day" event already has `isToday: true` (year 12026; renders
as the bronze "now" marker via `currentHEYear()` fractional position).

## Open questions for the next brainstorm

1. **Density curve.** Lean into the thinning (atmospheric mist toward 0 HE)
   or fill in (more pre-modern events)?
2. **Era list.** Which eras to include? What HE ranges? Single Stone Age
   or split (Mesolithic / Neolithic)?
3. **Begin/end pair handling.** For each affected entry: cut, or rewrite
   around a specific moment? Some pairs (WWI/WWII) have obvious anchoring
   moments (Sarajevo, Hiroshima, etc.); others (Information Age, Cold War)
   are diffuse and may just go.
4. **Empire-peak rewrites.** Each peak entry needs a specific anchoring
   moment (or gets cut). Source those?
5. **Coverage gap priorities.** Africa beyond Egypt? Polynesia?
   Pre-Columbian beyond Maya? All in proportion?
6. **Importance-1 exemplars.** What does an "importance 1" placard look
   like in this voice? Need 3–5 examples to anchor curation.
7. **Description length cap.** Hard cap at, say, 160 chars? Soft target?

## Notes

- The fog overlay component is preserved on disk but disabled in `App.tsx`
  pending visual tuning. Re-enable is two lines (re-add import and
  `<Fog />`). This is unrelated to events curation but flagged here for
  future-me's awareness.
- The annometer reveal was renamed from Odometer; Annometer is correct
  ("annus" = year). The visual mechanism (digit reels) is *still*
  legitimately odometer-like, so the GEMINI.md description ("flipping
  forward like an odometer") stays.
- The user works on this project on a personal-project cadence with
  significant gaps between sessions. Brainstorm mockups via the visual
  companion are useful but the server times out after 30 minutes of
  inactivity (need restart per session).
