# Partitioned History Loader Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Efficiently scale markers by splitting data into 2,000-year chunks and fetching them on-demand.

**Architecture:** Build-time script partitions a master JSON into files stored in `public/data/`. A `useEventLoader` hook monitors the viewport and fetches missing chunks via `fetch()`, merging them into a local cache.

**Tech Stack:** Node.js (for script), React (for hook), Standard Browser Fetch API.

---

### Task 1: Data Migration & Build Script

**Files:**
- Create: `src/data/all_events.json`
- Create: `scripts/partition-data.js`
- Modify: `package.json`
- Modify: `.gitignore`

- [ ] **Step 1: Create master `all_events.json`**
(Copy the contents from the current `src/data/events.ts` but as a pure JSON array)

- [ ] **Step 2: Create `scripts/partition-data.js`**
```javascript
const fs = require('fs');
const path = require('path');

const CHUNK_SIZE = 2000;
const masterFile = path.join(__dirname, '../src/data/all_events.json');
const outputDir = path.join(__dirname, '../public/data');

if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

const events = JSON.parse(fs.readFileSync(masterFile, 'utf8'));
const chunks = {};

events.forEach(event => {
  const chunkIndex = Math.floor(event.year / CHUNK_SIZE) * CHUNK_SIZE;
  if (!chunks[chunkIndex]) chunks[chunkIndex] = [];
  chunks[chunkIndex].push(event);
});

Object.keys(chunks).forEach(index => {
  fs.writeFileSync(
    path.join(outputDir, `events_${index}.json`),
    JSON.stringify(chunks[index], null, 2)
  );
});
console.log(`Partitioned into ${Object.keys(chunks).length} chunks.`);
```

- [ ] **Step 3: Update `package.json` and `.gitignore`**
Add `"partition": "node scripts/partition-data.js"` to scripts. Add `/public/data/*.json` to `.gitignore`.

- [ ] **Step 4: Run script and verify output**
Run: `npm run partition`
Expected: Files like `public/data/events_0.json` and `public/data/events_10000.json` are created.

- [ ] **Step 5: Commit**
```bash
git add .
git commit -m "feat: add build-time data partitioning script"
```

---

### Task 2: The `useEventLoader` Hook

**Files:**
- Create: `src/hooks/useEventLoader.ts`

- [ ] **Step 1: Implement `useEventLoader` logic**
```typescript
import { useState, useEffect, useCallback, useRef } from 'react';
import { HistoryEvent } from '../data/events';

export function useEventLoader(centerYear: number, zoom: number, screenWidth: number, innerBound: number) {
  const [loadedEvents, setLoadedEvents] = useState<HistoryEvent[]>([]);
  const fetchedChunks = useRef(new Set<number>());

  const fetchChunk = useCallback(async (index: number) => {
    if (fetchedChunks.current.has(index)) return;
    fetchedChunks.current.add(index);
    try {
      const response = await fetch(`/data/events_${index}.json`);
      if (!response.ok) return;
      const data: HistoryEvent[] = await response.json();
      setLoadedEvents(prev => [...prev, ...data]);
    } catch (e) {
      console.error(`Failed to load chunk ${index}`, e);
    }
  }, []);

  useEffect(() => {
    const halfWidth = (screenWidth / 2) / zoom;
    const startYear = centerYear - halfWidth;
    const endYear = centerYear + halfWidth;

    const CHUNK_SIZE = 2000;
    const startChunk = Math.floor(startYear / CHUNK_SIZE) * CHUNK_SIZE;
    const endChunk = Math.floor(endYear / CHUNK_SIZE) * CHUNK_SIZE;

    for (let i = startChunk; i <= endChunk; i += CHUNK_SIZE) {
      // Clamp to known range if necessary, or just rely on 404 handling
      if (i >= 0 && i <= 12000) fetchChunk(i);
    }
  }, [centerYear, zoom, screenWidth, fetchChunk]);

  return loadedEvents;
}
```

- [ ] **Step 2: Commit**
```bash
git add src/hooks/useEventLoader.ts
git commit -m "feat: implement on-demand history loader hook"
```

---

### Task 3: Integration & Cleanup

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/components/Timeline/TimelineCanvas.tsx`
- Delete: `src/data/events.ts` (if no longer needed for types)

- [ ] **Step 1: Update `App.tsx` to use the hook**
Pass `loadedEvents` from `useEventLoader` into `TimelineCanvas`.

- [ ] **Step 2: Update `TimelineCanvas.tsx`**
Remove the internal `import { events }` and use the passed `events` prop exclusively.

- [ ] **Step 3: Final Verification**
Start `npm run dev` and scroll through the timeline. Verify that `Network` tab shows new JSON files loading as you move.

- [ ] **Step 4: Commit**
```bash
git commit -m "feat: integrate partitioned loader and clean up static data"
```
