import type { RawStreamingEvent } from './types';

const DATA_FILES = [
  '/data/Streaming_History_Audio_2019-2021_0.json',
  '/data/Streaming_History_Audio_2021-2024_1.json',
  '/data/Streaming_History_Audio_2024-2025_2.json',
];

export async function loadAllStreamingData(): Promise<RawStreamingEvent[]> {
  const allEvents: RawStreamingEvent[] = [];

  const results = await Promise.all(
    DATA_FILES.map(async (file) => {
      try {
        const response = await fetch(file);
        if (!response.ok) {
          console.warn(`Failed to load ${file}: ${response.statusText}`);
          return [];
        }
        const data: RawStreamingEvent[] = await response.json();
        return data;
      } catch (error) {
        console.warn(`Error loading ${file}:`, error);
        return [];
      }
    })
  );

  for (const events of results) {
    allEvents.push(...events);
  }

  // Sort by timestamp
  allEvents.sort((a, b) => new Date(a.ts).getTime() - new Date(b.ts).getTime());

  return allEvents;
}
