import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import type { StreamingEvent, TimeRange } from '../data/types';
import { loadAllStreamingData } from '../data/loadData';
import { normalizeAllEvents } from '../data/normalize';
import { filterByTimeRange, getAvailableYears } from '../data/aggregations';

interface AppContextType {
  allEvents: StreamingEvent[];
  filteredEvents: StreamingEvent[];
  timeRange: TimeRange;
  setTimeRange: (range: TimeRange) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  availableYears: number[];
  isLoading: boolean;
  error: string | null;
}

const defaultTimeRange: TimeRange = {
  type: 'lifetime',
  label: 'Lifetime',
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [allEvents, setAllEvents] = useState<StreamingEvent[]>([]);
  const [timeRange, setTimeRange] = useState<TimeRange>(defaultTimeRange);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const rawData = await loadAllStreamingData();
        const normalized = normalizeAllEvents(rawData);
        setAllEvents(normalized);
        setError(null);
      } catch (err) {
        setError('Failed to load streaming data');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  const availableYears = useMemo(
    () => getAvailableYears(allEvents),
    [allEvents]
  );

  const filteredEvents = useMemo(() => {
    let events = filterByTimeRange(allEvents, timeRange);

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      events = events.filter(
        (event) =>
          event.track.toLowerCase().includes(query) ||
          event.artist.toLowerCase().includes(query) ||
          event.album.toLowerCase().includes(query)
      );
    }

    return events;
  }, [allEvents, timeRange, searchQuery]);

  const value: AppContextType = {
    allEvents,
    filteredEvents,
    timeRange,
    setTimeRange,
    searchQuery,
    setSearchQuery,
    availableYears,
    isLoading,
    error,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
