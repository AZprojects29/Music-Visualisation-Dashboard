import type {
  StreamingEvent,
  TimeRange,
  TrackStats,
  ArtistStats,
  DailyListening,
  MonthlyListening,
  YearlyRecap,
  LifetimeStats,
} from './types';

// Filter events by time range
export function filterByTimeRange(
  events: StreamingEvent[],
  range: TimeRange
): StreamingEvent[] {
  const now = new Date();

  switch (range.type) {
    case 'past4weeks': {
      const cutoff = new Date(now);
      cutoff.setDate(cutoff.getDate() - 28);
      return events.filter((e) => e.ts >= cutoff);
    }
    case 'past6months': {
      const cutoff = new Date(now);
      cutoff.setMonth(cutoff.getMonth() - 6);
      return events.filter((e) => e.ts >= cutoff);
    }
    case 'past1year': {
      const cutoff = new Date(now);
      cutoff.setFullYear(cutoff.getFullYear() - 1);
      return events.filter((e) => e.ts >= cutoff);
    }
    case 'year': {
      if (range.year === undefined) return events;
      return events.filter((e) => e.year === range.year);
    }
    case 'lifetime':
    default:
      return events;
  }
}

// Get all unique years from events
export function getAvailableYears(events: StreamingEvent[]): number[] {
  const years = new Set(events.map((e) => e.year));
  return Array.from(years).sort((a, b) => b - a);
}

// Get top tracks by play count or listening time
export function getTopTracks(
  events: StreamingEvent[],
  limit: number = 10,
  sortBy: 'playCount' | 'totalMsPlayed' = 'totalMsPlayed'
): TrackStats[] {
  const trackMap = new Map<string, TrackStats>();

  for (const event of events) {
    const key = `${event.track}|||${event.artist}`;
    const existing = trackMap.get(key);

    if (existing) {
      existing.playCount++;
      existing.totalMsPlayed += event.msPlayed;
    } else {
      trackMap.set(key, {
        track: event.track,
        artist: event.artist,
        album: event.album,
        playCount: 1,
        totalMsPlayed: event.msPlayed,
      });
    }
  }

  const tracks = Array.from(trackMap.values());
  tracks.sort((a, b) => b[sortBy] - a[sortBy]);

  return tracks.slice(0, limit);
}

// Get top artists by listening time
export function getTopArtists(
  events: StreamingEvent[],
  limit: number = 10
): ArtistStats[] {
  const artistMap = new Map<string, { playCount: number; totalMsPlayed: number }>();
  let totalMs = 0;

  for (const event of events) {
    totalMs += event.msPlayed;
    const existing = artistMap.get(event.artist);

    if (existing) {
      existing.playCount++;
      existing.totalMsPlayed += event.msPlayed;
    } else {
      artistMap.set(event.artist, {
        playCount: 1,
        totalMsPlayed: event.msPlayed,
      });
    }
  }

  const artists: ArtistStats[] = Array.from(artistMap.entries()).map(
    ([artist, stats]) => ({
      artist,
      playCount: stats.playCount,
      totalMsPlayed: stats.totalMsPlayed,
      percentage: totalMs > 0 ? (stats.totalMsPlayed / totalMs) * 100 : 0,
    })
  );

  artists.sort((a, b) => b.totalMsPlayed - a.totalMsPlayed);

  return artists.slice(0, limit);
}

// Get daily listening data
export function getDailyListening(events: StreamingEvent[]): DailyListening[] {
  const dayMap = new Map<string, { msPlayed: number; trackCount: number }>();

  for (const event of events) {
    const dateStr = event.ts.toISOString().split('T')[0];
    const existing = dayMap.get(dateStr);

    if (existing) {
      existing.msPlayed += event.msPlayed;
      existing.trackCount++;
    } else {
      dayMap.set(dateStr, {
        msPlayed: event.msPlayed,
        trackCount: 1,
      });
    }
  }

  const daily: DailyListening[] = Array.from(dayMap.entries()).map(
    ([date, stats]) => ({
      date,
      msPlayed: stats.msPlayed,
      trackCount: stats.trackCount,
    })
  );

  daily.sort((a, b) => a.date.localeCompare(b.date));

  return daily;
}

// Get monthly listening data
export function getMonthlyListening(events: StreamingEvent[]): MonthlyListening[] {
  const monthMap = new Map<string, { year: number; msPlayed: number; trackCount: number }>();

  for (const event of events) {
    const key = `${event.year}-${String(event.month).padStart(2, '0')}`;
    const existing = monthMap.get(key);

    if (existing) {
      existing.msPlayed += event.msPlayed;
      existing.trackCount++;
    } else {
      monthMap.set(key, {
        year: event.year,
        msPlayed: event.msPlayed,
        trackCount: 1,
      });
    }
  }

  const monthly: MonthlyListening[] = Array.from(monthMap.entries()).map(
    ([month, stats]) => ({
      month,
      year: stats.year,
      msPlayed: stats.msPlayed,
      trackCount: stats.trackCount,
    })
  );

  monthly.sort((a, b) => a.month.localeCompare(b.month));

  return monthly;
}

// Get yearly recaps
export function getYearlyRecaps(events: StreamingEvent[]): YearlyRecap[] {
  const years = getAvailableYears(events);

  return years.map((year) => {
    const yearEvents = events.filter((e) => e.year === year);
    const topTracks = getTopTracks(yearEvents, 1);
    const topArtists = getTopArtists(yearEvents, 1);
    const uniqueArtists = new Set(yearEvents.map((e) => e.artist)).size;

    return {
      year,
      topTrack: topTracks[0] || null,
      topArtist: topArtists[0] || null,
      totalMsPlayed: yearEvents.reduce((sum, e) => sum + e.msPlayed, 0),
      totalTracks: yearEvents.length,
      uniqueArtists,
    };
  });
}

// Get lifetime stats
export function getLifetimeStats(events: StreamingEvent[]): LifetimeStats {
  const topTracks = getTopTracks(events, 1);
  const dailyListening = getDailyListening(events);

  // Find longest listening day
  let longestDay: { date: string; msPlayed: number } | null = null;
  for (const day of dailyListening) {
    if (!longestDay || day.msPlayed > longestDay.msPlayed) {
      longestDay = { date: day.date, msPlayed: day.msPlayed };
    }
  }

  const totalMs = events.reduce((sum, e) => sum + e.msPlayed, 0);
  const shuffleCount = events.filter((e) => e.shuffle).length;
  const skipCount = events.filter((e) => e.skipped).length;
  const uniqueArtists = new Set(events.map((e) => e.artist)).size;

  return {
    mostPlayedTrack: topTracks[0] || null,
    longestListeningDay: longestDay,
    shufflePercentage: events.length > 0 ? (shuffleCount / events.length) * 100 : 0,
    skipRate: events.length > 0 ? (skipCount / events.length) * 100 : 0,
    totalMinutes: Math.round(totalMs / 60000),
    totalTracks: events.length,
    totalArtists: uniqueArtists,
  };
}

// Get overview stats
export function getOverviewStats(events: StreamingEvent[]) {
  const totalMs = events.reduce((sum, e) => sum + e.msPlayed, 0);
  const uniqueArtists = new Set(events.map((e) => e.artist)).size;

  let firstDate: Date | null = null;
  let lastDate: Date | null = null;

  if (events.length > 0) {
    const sorted = [...events].sort((a, b) => a.ts.getTime() - b.ts.getTime());
    firstDate = sorted[0].ts;
    lastDate = sorted[sorted.length - 1].ts;
  }

  return {
    totalMinutes: Math.round(totalMs / 60000),
    totalTracks: events.length,
    uniqueArtists,
    firstDate,
    lastDate,
  };
}

// Format milliseconds to readable time
export function formatDuration(ms: number): string {
  const totalMinutes = Math.round(ms / 60000);

  if (totalMinutes < 60) {
    return `${totalMinutes} min`;
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours < 24) {
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }

  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;

  return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days} days`;
}

// Format large numbers with commas
export function formatNumber(n: number): string {
  return n.toLocaleString();
}

// Format date
export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// Streak calculation
export interface StreakInfo {
  currentStreak: number;
  longestStreak: number;
  longestStreakStart: string | null;
  longestStreakEnd: string | null;
  totalDaysListened: number;
  averagePerWeek: number;
}

export function getStreakInfo(events: StreamingEvent[]): StreakInfo {
  if (events.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      longestStreakStart: null,
      longestStreakEnd: null,
      totalDaysListened: 0,
      averagePerWeek: 0,
    };
  }

  const dailyListening = getDailyListening(events);
  const listeningDates = new Set(dailyListening.map((d) => d.date));
  const sortedDates = Array.from(listeningDates).sort();

  if (sortedDates.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      longestStreakStart: null,
      longestStreakEnd: null,
      totalDaysListened: 0,
      averagePerWeek: 0,
    };
  }

  // Calculate streaks
  let currentStreak = 0;
  let longestStreak = 0;
  let longestStreakStart: string | null = null;
  let longestStreakEnd: string | null = null;
  let tempStreakStart = sortedDates[0];
  let tempStreak = 1;

  // Check if current streak includes today
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  for (let i = 1; i < sortedDates.length; i++) {
    const prevDate = new Date(sortedDates[i - 1]);
    const currDate = new Date(sortedDates[i]);
    const diffDays = Math.round(
      (currDate.getTime() - prevDate.getTime()) / 86400000
    );

    if (diffDays === 1) {
      tempStreak++;
    } else {
      if (tempStreak > longestStreak) {
        longestStreak = tempStreak;
        longestStreakStart = tempStreakStart;
        longestStreakEnd = sortedDates[i - 1];
      }
      tempStreakStart = sortedDates[i];
      tempStreak = 1;
    }
  }

  // Check final streak
  if (tempStreak > longestStreak) {
    longestStreak = tempStreak;
    longestStreakStart = tempStreakStart;
    longestStreakEnd = sortedDates[sortedDates.length - 1];
  }

  // Calculate current streak (must include today or yesterday)
  const lastListeningDate = sortedDates[sortedDates.length - 1];
  if (lastListeningDate === today || lastListeningDate === yesterday) {
    currentStreak = 1;
    for (let i = sortedDates.length - 2; i >= 0; i--) {
      const currDate = new Date(sortedDates[i + 1]);
      const prevDate = new Date(sortedDates[i]);
      const diffDays = Math.round(
        (currDate.getTime() - prevDate.getTime()) / 86400000
      );
      if (diffDays === 1) {
        currentStreak++;
      } else {
        break;
      }
    }
  }

  // Calculate average days per week
  const firstDate = new Date(sortedDates[0]);
  const lastDate = new Date(sortedDates[sortedDates.length - 1]);
  const totalWeeks = Math.max(
    1,
    (lastDate.getTime() - firstDate.getTime()) / (7 * 86400000)
  );
  const averagePerWeek = sortedDates.length / totalWeeks;

  return {
    currentStreak,
    longestStreak,
    longestStreakStart,
    longestStreakEnd,
    totalDaysListened: sortedDates.length,
    averagePerWeek: Math.round(averagePerWeek * 10) / 10,
  };
}

// Time of day analysis
export interface TimeOfDayData {
  period: string;
  msPlayed: number;
  trackCount: number;
  percentage: number;
}

export function getTimeOfDayBreakdown(events: StreamingEvent[]): TimeOfDayData[] {
  const periods = {
    'Morning (6AM-12PM)': { msPlayed: 0, trackCount: 0 },
    'Afternoon (12PM-6PM)': { msPlayed: 0, trackCount: 0 },
    'Evening (6PM-12AM)': { msPlayed: 0, trackCount: 0 },
    'Night (12AM-6AM)': { msPlayed: 0, trackCount: 0 },
  };

  for (const event of events) {
    const hour = event.ts.getHours();
    let period: keyof typeof periods;

    if (hour >= 6 && hour < 12) {
      period = 'Morning (6AM-12PM)';
    } else if (hour >= 12 && hour < 18) {
      period = 'Afternoon (12PM-6PM)';
    } else if (hour >= 18 && hour < 24) {
      period = 'Evening (6PM-12AM)';
    } else {
      period = 'Night (12AM-6AM)';
    }

    periods[period].msPlayed += event.msPlayed;
    periods[period].trackCount++;
  }

  const totalMs = events.reduce((sum, e) => sum + e.msPlayed, 0);

  return Object.entries(periods).map(([period, data]) => ({
    period,
    msPlayed: data.msPlayed,
    trackCount: data.trackCount,
    percentage: totalMs > 0 ? (data.msPlayed / totalMs) * 100 : 0,
  }));
}

// Hourly breakdown for detailed analysis
export interface HourlyData {
  hour: number;
  label: string;
  msPlayed: number;
  trackCount: number;
}

export function getHourlyBreakdown(events: StreamingEvent[]): HourlyData[] {
  const hours: { msPlayed: number; trackCount: number }[] = Array(24)
    .fill(null)
    .map(() => ({ msPlayed: 0, trackCount: 0 }));

  for (const event of events) {
    const hour = event.ts.getHours();
    hours[hour].msPlayed += event.msPlayed;
    hours[hour].trackCount++;
  }

  return hours.map((data, hour) => ({
    hour,
    label: `${hour.toString().padStart(2, '0')}:00`,
    msPlayed: data.msPlayed,
    trackCount: data.trackCount,
  }));
}

// Day of week breakdown
export interface DayOfWeekData {
  day: string;
  dayIndex: number;
  msPlayed: number;
  trackCount: number;
  percentage: number;
}

export function getDayOfWeekBreakdown(events: StreamingEvent[]): DayOfWeekData[] {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayData: { msPlayed: number; trackCount: number }[] = Array(7)
    .fill(null)
    .map(() => ({ msPlayed: 0, trackCount: 0 }));

  for (const event of events) {
    const dayIndex = event.ts.getDay();
    dayData[dayIndex].msPlayed += event.msPlayed;
    dayData[dayIndex].trackCount++;
  }

  const totalMs = events.reduce((sum, e) => sum + e.msPlayed, 0);

  return dayData.map((data, index) => ({
    day: days[index],
    dayIndex: index,
    msPlayed: data.msPlayed,
    trackCount: data.trackCount,
    percentage: totalMs > 0 ? (data.msPlayed / totalMs) * 100 : 0,
  }));
}
