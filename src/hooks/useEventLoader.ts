import { useState, useEffect, useCallback, useRef } from 'react';
import { HistoryEvent } from '../data/events';

/**
 * Hook to load history events in 2,000-year chunks based on the current viewport.
 * Caches already-fetched chunks to avoid redundant network requests.
 */
export function useEventLoader(centerYear: number, zoom: number, screenWidth: number, innerBound: number) {
  const [loadedEvents, setLoadedEvents] = useState<HistoryEvent[]>([]);
  const fetchedChunks = useRef(new Set<number>());

  const fetchChunk = useCallback(async (index: number) => {
    if (fetchedChunks.current.has(index)) return;
    
    fetchedChunks.current.add(index);
    try {
      const response = await fetch(`/data/events_${index}.json`);
      if (!response.ok) {
        // If not found, we don't need to try again for this session
        return;
      }
      const data: HistoryEvent[] = await response.json();
      setLoadedEvents(prev => [...prev, ...data]);
    } catch (e) {
      console.error(`Failed to load chunk ${index}`, e);
      // Optional: remove from fetchedChunks to allow retry, 
      // but usually 404 or network error means it's not available.
    }
  }, []);

  useEffect(() => {
    const effectiveWidth = screenWidth - 2 * innerBound;
    if (effectiveWidth <= 0) return;

    const halfWidth = (effectiveWidth / 2) / zoom;
    const startYear = centerYear - halfWidth;
    const endYear = centerYear + halfWidth;

    const CHUNK_SIZE = 2000;
    // Buffer by 1 chunk on each side as per design spec
    const startChunk = (Math.floor(startYear / CHUNK_SIZE) - 1) * CHUNK_SIZE;
    const endChunk = (Math.floor(endYear / CHUNK_SIZE) + 1) * CHUNK_SIZE;

    for (let i = startChunk; i <= endChunk; i += CHUNK_SIZE) {
      // Data is partitioned in [0, 2000, 4000, 6000, 8000, 10000, 12000]
      if (i >= 0 && i <= 12000) {
        fetchChunk(i);
      }
    }
  }, [centerYear, zoom, screenWidth, innerBound, fetchChunk]);

  return loadedEvents;
}
