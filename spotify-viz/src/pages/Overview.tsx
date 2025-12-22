import { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { StatCard } from '../components/StatCard';
import {
  getOverviewStats,
  getTopArtists,
  getTopTracks,
  getDayOfWeekBreakdown,
  getTimeOfDayBreakdown,
  formatNumber,
  formatDate,
  formatDuration,
} from '../data/aggregations';

export function Overview() {
  const { filteredEvents } = useApp();

  const stats = useMemo(() => getOverviewStats(filteredEvents), [filteredEvents]);
  const topArtist = useMemo(() => getTopArtists(filteredEvents, 1)[0], [filteredEvents]);
  const topTrack = useMemo(() => getTopTracks(filteredEvents, 1)[0], [filteredEvents]);
  const dayOfWeek = useMemo(() => getDayOfWeekBreakdown(filteredEvents), [filteredEvents]);
  const timeOfDay = useMemo(() => getTimeOfDayBreakdown(filteredEvents), [filteredEvents]);

  // Find favorite day and time
  const favoriteDay = useMemo(() => {
    if (dayOfWeek.length === 0) return null;
    return dayOfWeek.reduce((max, d) => (d.msPlayed > max.msPlayed ? d : max));
  }, [dayOfWeek]);

  const favoriteTime = useMemo(() => {
    if (timeOfDay.length === 0) return null;
    return timeOfDay.reduce((max, t) => (t.msPlayed > max.msPlayed ? t : max));
  }, [timeOfDay]);

  // Fun facts calculations
  const funFacts = useMemo(() => {
    const totalMs = filteredEvents.reduce((sum, e) => sum + e.msPlayed, 0);
    const totalHours = totalMs / (1000 * 60 * 60);
    const avgTrackLength = filteredEvents.length > 0 ? totalMs / filteredEvents.length : 0;

    return {
      movies: Math.floor(totalHours / 2), // Avg movie is 2 hours
      marathons: (totalHours / 42.195).toFixed(1), // Marathon pace ~1hr per 4km, full marathon
      flights: (totalHours / 8).toFixed(1), // Avg long-haul flight
      sleepNights: Math.floor(totalHours / 8),
      avgTrackLength: Math.round(avgTrackLength / 1000), // in seconds
      uniqueTracks: new Set(filteredEvents.map(e => `${e.track}-${e.artist}`)).size,
      uniqueAlbums: new Set(filteredEvents.map(e => e.album)).size,
    };
  }, [filteredEvents]);

  if (stats.totalTracks === 0) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-white mb-8">Overview</h1>
        <div className="mt-12 text-center">
          <p className="text-spotify-light-gray text-lg">
            No listening data found for this time period.
          </p>
          <p className="text-zinc-500 mt-2">
            Try selecting a different time range.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-white">Overview</h1>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Listening Time"
          value={stats.totalMinutes}
          formatValue={(v) => formatDuration(v * 60000)}
          accent
        />
        <StatCard
          title="Tracks Played"
          value={formatNumber(stats.totalTracks)}
        />
        <StatCard
          title="Unique Artists"
          value={formatNumber(stats.uniqueArtists)}
        />
        <StatCard
          title="Listening Period"
          value={
            stats.firstDate && stats.lastDate
              ? `${formatDate(stats.firstDate)} - ${formatDate(stats.lastDate)}`
              : 'No data'
          }
          subtitle={
            stats.firstDate && stats.lastDate
              ? `${Math.ceil((stats.lastDate.getTime() - stats.firstDate.getTime()) / (1000 * 60 * 60 * 24))} days`
              : undefined
          }
        />
      </div>

      {/* Top Artist & Track Spotlight */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {topArtist && (
          <div className="bg-gradient-to-br from-spotify-green/20 to-spotify-green/5 border border-spotify-green/30 rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-spotify-green/10 rounded-full blur-3xl" />
            <p className="text-spotify-green text-sm font-semibold uppercase tracking-wider mb-2">
              #1 Artist
            </p>
            <h3 className="text-2xl font-bold text-white mb-1 truncate">
              {topArtist.artist}
            </h3>
            <p className="text-spotify-light-gray">
              {formatDuration(topArtist.totalMsPlayed)} listened
            </p>
            <div className="mt-4 flex items-center gap-4">
              <div className="bg-spotify-green/20 rounded-full px-3 py-1">
                <span className="text-spotify-green text-sm font-medium">
                  {topArtist.percentage.toFixed(1)}% of your time
                </span>
              </div>
              <span className="text-zinc-500 text-sm">
                {formatNumber(topArtist.playCount)} plays
              </span>
            </div>
          </div>
        )}

        {topTrack && (
          <div className="bg-gradient-to-br from-purple-500/20 to-purple-500/5 border border-purple-500/30 rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl" />
            <p className="text-purple-400 text-sm font-semibold uppercase tracking-wider mb-2">
              #1 Track
            </p>
            <h3 className="text-2xl font-bold text-white mb-1 truncate">
              {topTrack.track}
            </h3>
            <p className="text-spotify-light-gray truncate">
              {topTrack.artist}
            </p>
            <div className="mt-4 flex items-center gap-4">
              <div className="bg-purple-500/20 rounded-full px-3 py-1">
                <span className="text-purple-400 text-sm font-medium">
                  {formatNumber(topTrack.playCount)} plays
                </span>
              </div>
              <span className="text-zinc-500 text-sm">
                {formatDuration(topTrack.totalMsPlayed)} total
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Day of Week & Time of Day */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Day of Week Chart */}
        <div className="bg-spotify-gray rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">Listening by Day</h3>
          <div className="space-y-3">
            {dayOfWeek.map((day) => {
              const maxMs = Math.max(...dayOfWeek.map((d) => d.msPlayed));
              const width = maxMs > 0 ? (day.msPlayed / maxMs) * 100 : 0;
              const isMax = day.msPlayed === maxMs && maxMs > 0;

              return (
                <div key={day.day} className="flex items-center gap-3">
                  <span className={`w-12 text-sm ${isMax ? 'text-spotify-green font-semibold' : 'text-spotify-light-gray'}`}>
                    {day.day.slice(0, 3)}
                  </span>
                  <div className="flex-1 h-6 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isMax ? 'bg-spotify-green' : 'bg-zinc-600'
                      }`}
                      style={{ width: `${width}%` }}
                    />
                  </div>
                  <span className={`text-sm w-16 text-right ${isMax ? 'text-spotify-green font-semibold' : 'text-zinc-500'}`}>
                    {formatDuration(day.msPlayed)}
                  </span>
                </div>
              );
            })}
          </div>
          {favoriteDay && (
            <p className="mt-4 text-sm text-spotify-light-gray">
              You listen most on <span className="text-spotify-green font-medium">{favoriteDay.day}s</span>
            </p>
          )}
        </div>

        {/* Time of Day Breakdown */}
        <div className="bg-spotify-gray rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">When You Listen</h3>
          <div className="grid grid-cols-2 gap-4">
            {timeOfDay.map((time) => {
              const isMax = favoriteTime?.period === time.period;
              const icons: Record<string, string> = {
                'Morning (6AM-12PM)': '🌅',
                'Afternoon (12PM-6PM)': '☀️',
                'Evening (6PM-12AM)': '🌆',
                'Night (12AM-6AM)': '🌙',
              };

              return (
                <div
                  key={time.period}
                  className={`p-4 rounded-xl transition-all ${
                    isMax
                      ? 'bg-spotify-green/20 border border-spotify-green/30'
                      : 'bg-zinc-800'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{icons[time.period]}</span>
                    <span className={`text-sm font-medium ${isMax ? 'text-spotify-green' : 'text-spotify-light-gray'}`}>
                      {time.period.split(' ')[0]}
                    </span>
                  </div>
                  <p className={`text-xl font-bold ${isMax ? 'text-white' : 'text-zinc-400'}`}>
                    {time.percentage.toFixed(0)}%
                  </p>
                  <p className="text-xs text-zinc-500">
                    {formatDuration(time.msPlayed)}
                  </p>
                </div>
              );
            })}
          </div>
          {favoriteTime && (
            <p className="mt-4 text-sm text-spotify-light-gray">
              Peak listening: <span className="text-spotify-green font-medium">{favoriteTime.period}</span>
            </p>
          )}
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-spotify-gray rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-white">{formatNumber(funFacts.uniqueTracks)}</p>
          <p className="text-spotify-light-gray text-sm">Unique Tracks</p>
        </div>
        <div className="bg-spotify-gray rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-white">{formatNumber(funFacts.uniqueAlbums)}</p>
          <p className="text-spotify-light-gray text-sm">Unique Albums</p>
        </div>
        <div className="bg-spotify-gray rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-white">{funFacts.avgTrackLength}s</p>
          <p className="text-spotify-light-gray text-sm">Avg Track Length</p>
        </div>
        <div className="bg-spotify-gray rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-white">
            {stats.firstDate && stats.lastDate
              ? Math.round(stats.totalTracks / Math.max(1, Math.ceil((stats.lastDate.getTime() - stats.firstDate.getTime()) / (1000 * 60 * 60 * 24))))
              : 0}
          </p>
          <p className="text-spotify-light-gray text-sm">Tracks per Day</p>
        </div>
      </div>

      {/* Fun Facts */}
      <div className="bg-gradient-to-r from-zinc-800 to-zinc-900 rounded-xl p-6 border border-zinc-700">
        <h3 className="text-lg font-bold text-white mb-4">Put Your Listening Into Perspective</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🎬</span>
            <div>
              <p className="text-xl font-bold text-white">{funFacts.movies}</p>
              <p className="text-zinc-400 text-sm">Movies you could watch</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-3xl">✈️</span>
            <div>
              <p className="text-xl font-bold text-white">{funFacts.flights}</p>
              <p className="text-zinc-400 text-sm">Long-haul flights</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-3xl">😴</span>
            <div>
              <p className="text-xl font-bold text-white">{funFacts.sleepNights}</p>
              <p className="text-zinc-400 text-sm">Full nights of sleep</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-3xl">🏃</span>
            <div>
              <p className="text-xl font-bold text-white">{funFacts.marathons}</p>
              <p className="text-zinc-400 text-sm">Marathon run times</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
