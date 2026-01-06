import type { RawStreamingEvent } from './types';

interface DataFileConfig {
  path: string;
  label?: string; // Optional label for display (e.g., "2020-2022")
}

interface DataConfig {
  autoDetect: {
    enabled: boolean;
    pattern: string;
  };
  files: DataFileConfig[];
}

const DEFAULT_CONFIG: DataConfig = {
  autoDetect: { enabled: true, pattern: 'Streaming_History_Audio_' },
  files: [],
};

async function loadConfig(): Promise<DataConfig> {
  try {
    const response = await fetch('/data/data-config.json');
    if (!response.ok) {
      console.warn('No data-config.json found, using default config');
      return DEFAULT_CONFIG;
    }
    const config: DataConfig = await response.json();
    return config;
  } catch (error) {
    console.warn('Error loading data-config.json:', error);
    return DEFAULT_CONFIG;
  }
}

export async function loadAllStreamingData(): Promise<RawStreamingEvent[]> {
  const config = await loadConfig();
  const allEvents: RawStreamingEvent[] = [];

  if (config.files.length === 0) {
    console.warn('No data files configured in data-config.json');
    return allEvents;
  }

  const filePaths = config.files.map((f) => `/data/${f.path}`);

  const results = await Promise.all(
    filePaths.map(async (file) => {
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

// Export config loader for potential use in UI
export { loadConfig };
export type { DataConfig, DataFileConfig };
