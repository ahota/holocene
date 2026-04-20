# 2026-04-19-partitioned-history-loader-design

## Overview
As the Holocene timeline scales to hundreds or thousands of markers, shipping a single monolithic data file becomes inefficient. This design implements a static partitioning strategy where history is divided into 2,000-year chunks, fetched on-demand by the client as the user scrolls.

## Data Strategy: Static Partitioning
- **Source of Truth:** A master `src/data/all_events.json` containing all milestones.
- **Distribution:** A build-time script splits this master file into chunks stored in `public/data/events_<start_year>.json`.
- **Chunk Size:** 2,000 years per file (e.g., `events_0.json`, `events_2000.json`, ..., `events_12000.json`).
- **Format:** Standard JSON arrays of `HistoryEvent` objects.

## Architecture

### 1. The Pre-build Script (`scripts/partition-data.js`)
- **Input:** `src/data/all_events.json`.
- **Logic:** 
  - Validates event years.
  - Groups events into 2,000-year bins based on `Math.floor(year / 2000) * 2000`.
  - Sorts events within each bin by year.
- **Output:** Writes JSON files to `public/data/`.

### 2. The `useEventLoader` Hook
- **State:**
  - `loadedEvents`: A Map or combined array of all events fetched during the session.
  - `pendingChunks`: A set of chunk IDs currently being fetched to avoid duplicate requests.
- **Logic:**
  - **Trigger:** Re-evaluates whenever `centerYear` or `zoom` changes.
  - **Visibility Calculation:**
    - Determines the visible year range: `[centerYear - halfWidth, centerYear + halfWidth]`.
    - Identifies which 2,000-year chunks overlap with this range (including 1 buffer chunk on either side).
  - **Fetching:**
    - Checks if identified chunks are already in `loadedEvents`.
    - Fetches missing chunks via `fetch('/data/events_<year>.json')`.
  - **Integration:** Merges new events into the `loadedEvents` state, which is then passed to the `TimelineCanvas`.

## User Experience & Performance
- **Zero Latency Scrolling:** By fetching buffer chunks ahead of the viewport, the user should rarely see a "blank" timeline while scrolling.
- **Caching:** Browser-level caching of static JSON files ensures that returning to a previously viewed era is instantaneous.
- **Minimal Initial Payload:** The initial app load only requires the first chunk (10,000–12,000 HE), significantly reducing time-to-interactive.

## Spec Self-Review
1. **Placeholder scan:** None. Master file path and chunk naming are explicit.
2. **Internal consistency:** The chunking logic (2,000 years) is consistent across the script and hook.
3. **Scope check:** Focused purely on data delivery.
4. **Ambiguity check:** Defined "Today" as part of the 12,000 chunk for implementation clarity.
