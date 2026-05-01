# Events Curation State

Snapshot of the events-dataset state after the 2026-04-28 rewrite plus
follow-up cleanup passes. Companion to the pre-brainstorm note from
2026-04-28 and the design spec at
`docs/superpowers/specs/2026-04-28-events-dataset-rewrite-design.md`.

The spec is the canonical source of design intent; this note captures
the *applied state* — what's actually in the dataset, why specific
items were cut, and concrete examples per tier.

## Voice and tone

Museum placard. Restrained, concrete, slightly clinical. Each placard
pairs a specific object/moment with a quietly-stated outsized
implication. The lack of poetry is intentional — it builds the sense
of scale and grandeur. Tiny moments in the grand scheme of the epoch.

User's framing, verbatim:

> "i want the whole timeline to evoke feelings of awe, wonder,
> intrigue, mystique, and curiosity. i want it to feel like walking
> through 4th dimension as if it were a hall in a museum, with fog
> clearing as you walk through it."

> "i want the lack of poetry and flourish to be intentional, to build
> the sense of scale and grandeur. they are tiny little moments in
> the grand scheme of the epoch."

### In-voice exemplars

These should be the lodestars when writing or rewriting copy. The
shape: specific object/moment first, quietly-stated implication
second. No flourish, no narrator voice, no superlatives unless they
are factually load-bearing.

- *Skara Brae* — "A Neolithic village is buried under Scottish sand
  dunes, its stone furniture preserved intact for five thousand
  years."
- *Newgrange* — "A passage tomb is built in Ireland, its inner chamber
  aligned with razor precision to the winter solstice sunrise."
- *Nebra Sky Disk* — "A bronze disk inlaid with gold stars and a
  crescent moon is buried in Saxony — the oldest known depiction of
  the cosmos."
- *Antikythera Mechanism* — "Creation of an ancient Greek analog
  computer of high complexity." *(slightly off-voice; flat. Should
  probably be rewritten.)*
- *Polynesian Settlement of Hawaii* — "Navigators reading stars,
  swells, and birds sail thousands of miles of open ocean to reach
  the most remote island chain on Earth."
- *Phaistos Disc* — "A clay disc spiral-stamped with 241 symbols is
  fired in Minoan Crete. The script appears nowhere else, and no one
  has read it."
- *Storegga Landslide* — "A colossal underwater collapse off Norway
  sends a megatsunami crashing across the North Sea, swallowing
  coastal settlements."
- *Stradivari's First Violin* — "A Cremonese artisan crafts an
  instrument no one since has been able to reproduce, despite three
  centuries of measurement and copying. The technique died with him."

### Off-voice patterns to avoid

- **Bracket framing.** "The Renaissance — Cultural and artistic
  rebirth starts in Italy." Names a period, not a moment. Cut and
  replace with a specific anchoring moment, or let the era band carry
  it.
- **Encyclopedia flatness.** "British Empire Peak — The largest
  empire in history reaches its maximum territorial extent." Names a
  concept, not an event. Cut or rewrite around a defining act.
- **"Famous" as filler.** "A young king is laid to rest with
  legendary treasures." If the description needs *famous* or
  *legendary* to do work, the implication isn't landing on its own.
- **Topic-named war placards.** "WWI Begins" / "WWII Ends" name
  topics, not moments. Replace with the moment itself
  ("Assassination at Sarajevo", "Hiroshima") and let the description
  carry the implication.
- **Death-of-X framing.** "Death of Genghis Khan — The Mongol Empire
  reaches its peak expansion under his successors." The event is the
  death; the implication is about something later. Disjoint. Almost
  always cut.
- **Mythological/traditional dates without specificity.** "Founding
  of Rome — Traditional date for the founding of Rome by Romulus." A
  myth shaped as an entry. Borderline — keep only if the myth itself
  is part of the path.
- **Modern-rediscovery events.** Pompeii unearthed (1748), Tutankhamun
  opened (1922), Lascaux found (1940), Dead Sea Scrolls found
  (1947), Skara Brae uncovered (1850), Champollion deciphers Rosetta
  (1822). The *original* event (deposition, burial, building) is
  appropriate; our reading of it is not. Memory entry
  `events_no_rediscovery.md` codifies this.

### Length caps

| Field       | Soft target  | Hard cap  |
|-------------|--------------|-----------|
| Title       | ~30 chars    | 50 chars  |
| Description | 120–160 chars | 180 chars |

Title cap is set by collision math in `calculateLabelLevels` —
longer titles take more horizontal space and reduce events that fit
at a given zoom. Description cap is voice — above 180 reads as a
paragraph rather than a placard.

## Inclusion criteria

An event earns a placard if it does at least one of:

- shapes humanity's trajectory (path-defining),
- is emblematic of the epoch (representative cultural anchor),
- is part of the path of development itself (foundational tech or
  knowledge).

An event does not earn a placard if it is:

- an era-start marker (era bands handle these),
- a Begin/End bracket without a specific anchoring moment,
- an encyclopedia-flat empire peak,
- a modern rediscovery of a buried artifact,
- a death-of-X framing,
- a flat "civilization arose somewhere" entry that names a topic
  rather than a moment.

## Tier hierarchy

Lower number = higher render priority. The label-collision algorithm
sorts by importance ascending and assigns levels first-come-first-fit.

The visibility gate also cascades by tier:

```ts
zoom > 5 || importance <= 1 || (zoom > 1 && importance <= 2)
```

Tiers 0 and 1 are gated identically (always considered); the
distinction is who wins level slots when the screen is full. At low
zoom (~14 labels fit on a portrait phone), tier 0 reliably anchors
the view; tier 1 fills whatever leftover horizontal space the layout
finds.

| Tier | Bar                              | Volume target | Visibility |
|------|----------------------------------|---------------|------------|
| 0    | Pinned absolute-critical moments | ~10–14        | top sort priority; always considered |
| 1    | Trajectory toward Type 1 civ + great-filter brushes | ~30–50 | always considered |
| 2    | Cultural anchors with broad resonance | ~50–80 | zoom > 1 |
| 3    | Quiet textures with narrow but real implication | ~30–50 | zoom > 5 |

**Current state: 10 / 30 / 79 / 16 = 135 total.** Tier 3 is below
target; that's the natural place for future expansion.

### Tier purpose

Each tier has a distinct identity in the timeline narrative:

- **Tier 0 — what tells the human story in one glance.** If the user
  zooms all the way out and sees only tier 0, they should see a
  recognizable arc of the human era. Pinning exists because layout
  collision can drop labels at low zoom, and we want the screen
  budget at zoom-out spent on these specifically.
- **Tier 1 — the path toward Type 1 civilization, plus the filters
  that shaped what we survived.** Energy capture, planetary
  coordination, physical reach beyond Earth, foundational science.
  Brushes with great filters (climate, cosmic, civilizational
  collapse). Each entry should be answer-able to "is this a step
  along the long arc of civilizational scale?"
- **Tier 2 — what humans remember.** Cultural anchors, mystique
  objects, emblematic moments with broad resonance that aren't
  trajectory-shaping. The seven wonders at this tier earn slots
  individually, not as a set.
- **Tier 3 — what scales us up, or threatens to end us, in the
  small.** Specific moments with quietly meaningful implications at
  human scale, less broadly recognized than tiers 0–2. Texture, but
  earned. Curiosity-grade only fails the bar.

### Tier 0 — current entries (10)

| Year HE | Title                           | Why pinned |
|---------|---------------------------------|------------|
| 1900    | First Farmed Wheat              | agriculture begins; everything downstream depends on it |
| 4500    | Invention of the Wheel          | foundational tech |
| 6800    | Invention of Writing            | civilization-scale information persistence |
| 8350    | Bronze Age Collapse             | first major civilizational filter brush |
| 10947   | The Black Death                 | major filter brush, reshaped feudal world |
| 11450   | Gutenberg Printing Press        | information democratization |
| 11769   | Watt's Steam Engine             | industrial revolution anchor |
| 11945   | Hiroshima                       | atomic age; existential capacity |
| 11969   | Apollo 11 Moon Landing          | first leaving Earth |
| 11989   | World Wide Web Invention        | planetary information network |

Plus *Present Day* (year 12026, importance 1) — always shown via
`isToday: true` regardless of tier.

The modern cluster (Hiroshima → WWW spans 1945–1989 CE) is dense
enough that at extreme zoom-out only 1–2 of those four labels render
simultaneously due to pixel-space collision. That's an accepted
trade-off.

### Tier 1 — current entries (30)

Climate / cosmic filter brushes:
Younger Dryas Closes (350), 8.2 Kiloyear Event (1800), Storegga
Landslide (3500), Samalas Eruption (11257), Carrington Event (11859),
Tunguska Event (11908).

Energy / agriculture:
Domestication of Cattle (1600), Invention of the Plow (3500), Hero's
Steam Engine (10060).

Physical reach / transport:
First Sailboat (4500), Horse Domestication (5600), Polynesian
Settlement of Hawaii (11200), First Sea Circumnavigation (11522),
Sputnik (11957), Voyager Crosses the Heliopause (12012).

Planetary coordination / commerce:
The Silk Road Opens (9216), First Paper Money (11020).

Foundational math / science:
Invention of Zero (10500), Al-Khwarizmi's Algebra (10820), General
Relativity (11915), DNA Double Helix (11953), The Microchip (11958).

Medicine:
First Smallpox Vaccine (11796), Germ Theory (11865).

20th-c. great-filter set:
Assassination at Sarajevo (11914), Auschwitz (11942), First Nuclear
Chain Reaction (11942), Cuban Missile Crisis (11962), Fall of the
Berlin Wall (11989).

Special:
Present Day (12026, isToday).

### Tier 2 — sampled entries (79 total)

Coverage push for underrepresented regions (added in Phase 5):

- Sub-Saharan Africa: Nok Terracottas, Aksum's Obelisks, Mansa Musa's
  Hajj, Great Zimbabwe.
- Polynesia: Lapita Pottery Dispersal, Maori Reach New Zealand
  (Hawaii is at tier 1).
- Pre-Columbian Americas: Caral, Olmec Colossal Heads, Cahokia.
- South / Southeast Asia: Ashoka's Pillars, Nalanda, Borobudur,
  Angkor Wat.
- China beyond the existing 5: Bi Sheng's Movable Type, Zheng He's
  Voyages.
- Steppe / Mongol: Mongol Wave Reaches Liegnitz.

Empire-peak rewrites (replaced flat "X Empire Peak" with specific
moments):
Sargon Unites the City-States (Akkadian → tier 2), Cyrus's Cylinder
(Achaemenid Persian → tier 2), Library of Ashurbanipal (Assyrian → tier 2),
Aryabhata Calculates Pi (Gupta → tier 2), Foreign Envoys at Chang'an
(Tang → tier 2), Suleiman Besieges Vienna (Ottoman → tier 2).

Existing cultural anchors retained: Code of Hammurabi, Oracle Bones,
Thera Eruption, Eruption of Vesuvius, Burial of Tutankhamun, Founding
of Rome, Maya Civilization Decline, Polynesian moai cluster, Voynich
Manuscript, Dead Sea Scrolls Deposited, Taj Mahal, Copernican
Revolution, Watt-era science (Telescope), Industrial Age (First
Automobile, First Powered Flight, Amundsen → South Pole), ISS modules,
and others.

### Tier 3 — current entries (16)

| Year HE | Title                          |
|---------|--------------------------------|
| 1500    | Natufian Burials at Eynan      |
| 4200    | Earliest Cave Art at Magura    |
| 8050    | Phaistos Disc                  |
| 9416    | Thales Predicts an Eclipse     |
| 10832   | House of Wisdom                |
| 11054   | Crab Nebula Supernova          |
| 11503   | Mona Lisa Painted              |
| 11633   | Galileo's Heresy Trial         |
| 11666   | Newton's Annus Mirabilis       |
| 11680   | Stradivari's First Violin      |
| 11768   | Steller's Sea Cow Extinct      |
| 11783   | First Hot-Air Balloon          |
| 11879   | Edison's First Bulb            |
| 11899   | Antarctic Winter-over          |
| 11914   | Last Passenger Pigeon          |
| 11924   | First Air Circumnavigation     |

Below the spec target (30–50). Future expansion: more textures from
the deep past, scientific observations with narrow impact, individual
artwork creations, single-species extinction events.

## What was cut and why

### Era-start brackets (cut, era band carries the orientation)

- Bronze Age Starts (6700)
- Iron Age Starts (8800)
- Copper Age Starts (5000)
- Common Era Begins (10000)
- Middle Ages Begin (10500)
- The Dark Ages (10500)
- Industrial Revolution Begins (11760)
- Information Age Starts (11970)
- Neolithic Age Begins (year 0; missed in original cut, removed in
  follow-up)

### Period brackets (cut, replaced with specific moments)

- The Renaissance (11400) → era band; Gutenberg (already present),
  Copernican Revolution, Newton's Annus Mirabilis carry it.
- The Enlightenment (11700) → era band; specific moments may be added
  later.
- The Scientific Revolution (11652) → cut as a bracket; Newton's
  Annus Mirabilis, Copernican Revolution, Galileo's Heresy Trial
  carry it.

### War brackets (cut, replaced with anchoring moments)

| Cut                           | Replacement                                        |
|-------------------------------|----------------------------------------------------|
| WWI Begins (11914)            | Assassination at Sarajevo (11914, tier 1)         |
| WWI Ends (11918)              | (no replacement — Sarajevo carries it)            |
| WWII Begins (11939)           | (none)                                            |
| WWII Ends (11945)             | Hiroshima (tier 0) + Auschwitz (tier 1)           |
| Cold War Begins (11947)       | (none)                                            |
| Cold War Ends (11991)         | Fall of the Berlin Wall (11989, tier 1)           |

### Empire peaks (cut entirely, no replacement required)

- Zenith of the Pharaohs (8600)
- Aztec Empire Peak (11500)
- Inca Empire Peak (11500)
- Ottoman Empire Peak (11500) — replaced by Suleiman Besieges Vienna
- Spanish Golden Age (11600)
- Dutch Golden Age (11650)
- First French Empire Peak (11812)
- British Empire Peak (11920)

### Off-voice / encyclopedic / redundant

- Sabretooth Tiger Extinct (1) — flat; Smilodon was already mostly
  gone before the Holocene started.
- Walls of Jericho (1100) — flat encyclopedia copy.
- Stonehenge: The First Circle (7001) — three Stonehenge entries
  total; only "The Sarsen Arrival" kept.
- Stonehenge Phase 3 (7401) — same.
- Tutankhamun Takes the Throne (8669) — accession is filler; only
  the burial earns it.
- The seven-wonders cluster: Hanging Gardens of Babylon (9401),
  Temple of Artemis (9451), Statue of Zeus at Olympia (9566),
  Mausoleum at Halicarnassus (9651), Colossus and Pharos (9721) —
  reads as a checklist, not exhibits.
- Great Wall of China (9780) — duplicate; only Great Wall Completion
  kept.
- Rosetta Stone Carved (9805) — description leaked rediscovery
  framing ("later enabling the decipherment").
- Charlemagne's Coronation (10800) — flat, "Pope Leo III crowns…"
- Voyage of Leif Erikson (11000) — flat copy; same critique as
  Columbus (finding-already-inhabited-land framing).
- Rongorongo Script (11200) — speculative as independent writing;
  modern scholarship leans against pre-contact origin.
- Death of Genghis Khan (11227) — death-of-X framing.
- Amelia Earhart Disappears (11937) — celebrity-trivia, no on-voice
  implication.
- Champollion Reads the Stone (11822) — added by mistake during tier
  3 curation; violated the no-rediscovery rule.

### Eurocentric "discovery" framing

- Columbus Reaches the Americas (11492) — finding a hemisphere where
  multiple complex civilizations already lived isn't noteworthy in
  the way the framing implies. The Columbian Exchange is a process,
  not a moment; we don't anchor it.
- Vasco da Gama Rounds the Cape (11498) — same critique. Reaching
  India, which had been actively trading via the Indian Ocean for
  centuries, framed as "shattering Arab monopoly" centers Europe
  rather than the actual planetary commerce. Magellan-Elcano stays
  because circumnavigation is a physical-reach fact about the
  planet, not a discovery-of-inhabited-lands framing.

### Tier reclassifications worth noting

- Hero's Steam Engine: was tier 1, demoted to tier 2 in mid-rewrite,
  promoted back to tier 1 (spec exemplar — undeployed Kardashev step
  prefiguring industrial revolution by 1700 years).
- Antikythera Mechanism: spec lists as tier 2 exemplar; was at tier 1
  briefly during mid-rewrite, fixed.
- Göbekli Tepe (1001): was tier 1; demoted to tier 2 — cultural
  anchor and mystique, not Kardashev.
- Fall of Constantinople (11450): was tier 1; demoted to tier 2 —
  political pivot, not directly trajectory.
- Great Wall Completion (11644): was tier 1; demoted to tier 2 —
  defensive infrastructure.
- Çatalhöyük (Growth) (2600): was tier 1; demoted to tier 2 —
  proto-city is a cultural anchor, not Kardashev.
- Proto-Sinaitic Script (6500): was tier 1; demoted to tier 2 —
  redundant with cuneiform (Invention of Writing) at tier 0.
- Unification of Egypt (6900), Indus Valley Cities Rise (7650),
  Sargon Unites the City-States (7670): demoted to tier 2 — early
  civilizational rises are cultural anchors, not direct Kardashev.
- Cyrus's Cylinder (9479): was tier 1; demoted to tier 2 — early
  human-rights statement is cultural, not Kardashev.
- Fall of Western Rome (10476): was tier 1; demoted to tier 2 —
  political pivot, cultural significance.

## Era bands

Nine non-overlapping bands rendered as faint horizontal strips behind
the timeline rule. Boundaries use Near-Eastern conventional dates as
canonical (orientation, not historiographical truth).

```
Stone Age           0     →  5000   (5000 yr)
Copper Age          5000  →  6700   (1700 yr)
Bronze Age          6700  →  8800   (2100 yr)
Iron Age            8800  →  9500   ( 700 yr)
Classical Antiquity 9500  → 10500   (1000 yr)
Middle Ages        10500  → 11400   ( 900 yr)
Early Modern       11400  → 11760   ( 360 yr)
Industrial         11760  → 11970   ( 210 yr)
Information       11970  → today    (growing)
```

Information's `end` is dynamic (`TODAY_HE` from `constants.ts`) so
the band always reaches the present.

A second sub-band layer for shorter cultural ages (Nuclear, Space,
Atomic, Jet, etc.) is in `docs/TODO.md` as a maybe.

## Workflow

- Master file: `src/data/all_events.json` (manual edits).
- After edits: `npm run partition` regenerates the chunked files in
  `public/data/` (gitignored).
- Renderer reads chunks via `useEventLoader`; chunks accumulate in
  component state, never evicted.
- Visual / interactive test required before commit (per GEMINI.md).
- Commit conventions: 50/72, imperative lowercase subject, `+claude`
  trailer.

## Open improvements

- **Catchier titles** — polish pass on titles, working within the
  ≤50-char hard cap. Listed as will-do in `docs/TODO.md`.
- **Date precision** — several pre-written entries used approximate
  HE dates the curator should verify against authoritative sources.
  Specific suspects: Cyrus's Cylinder (9479 vs. canonical 9462),
  Aryabhata Calculates Pi (10330 vs. canonical 10499), Library of
  Ashurbanipal (9700 vs. canonical ~9351), Phaistos Disc (8050 vs.
  canonical ~8301), Lapita (7000 may be too early vs. canonical
  ~8500), First Farmed Wheat (1900 may be too late vs. canonical
  ~501–1501), Younger Dryas (already adjusted to 350 from initial
  1000).
- **Tier 3 expansion** — currently at 16, target 30–50.
- **Voice-rewrite candidates** — some retained tier-2 entries still
  read flat (e.g. Antikythera Mechanism, Founding of Rome, Maya
  Classic Period Peak, Height of Ancient Greece, Walls-of-Jericho-tier
  near-misses that survived). Worth a refresh pass alongside the
  catchier-titles work.
- **Fog overlay re-enable** — preserved on disk, currently disabled
  in `App.tsx` pending visual tuning. Listed as will-do in TODO.md.
