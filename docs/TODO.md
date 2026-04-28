# TODO

Project-level future work, classified loosely.

- **will-do** — committed, will happen on a future cycle.
- **maybe** — speculative, captured so it isn't lost.

## will-do

### Catchier event titles

After the events dataset rewrite (see
`superpowers/specs/2026-04-28-events-dataset-rewrite-design.md`)
lands curation, do a polish pass on titles. The 50-char hard cap is
already set by the rewrite spec; this pass is about *voice and punch*,
not length.

### Fog overlay re-enable

`Fog` component is preserved on disk but disabled in `App.tsx` pending
visual tuning (commit `37aa50d`). Once tuned, re-enable. Density
gradient denser toward 0 HE would reinforce the "deep past stays
sparser, fog clears as you walk forward" narrative from the rewrite
spec's density-curve choice.

## maybe

### Sub-band era layer for shorter cultural ages

Second era band row, visible only at closer zoom, for shorter cultural
periods that don't earn a full band — Nuclear Age, Space Age, Atomic
Age, Jet Age, etc. (mostly modern.)

Schema impact: `Era` extends with `tier: 1 | 2`, where tier 1 is the
existing always-visible band and tier 2 is the close-zoom-only band.
Renderer adds a second row with its own zoom-gated visibility.

Relevant only if curation surfaces enough sub-era moments to make the
second row earn its space; revisit after the rewrite lands.
