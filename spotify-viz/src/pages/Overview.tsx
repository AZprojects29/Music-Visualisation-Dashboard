import { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { StatCard } from '../components/StatCard';
import { getOverviewStats, formatNumber, formatDate, formatDuration } from '../data/aggregations';

export function Overview() {
  const { filteredEvents } = useApp();

  const stats = useMemo(() => getOverviewStats(filteredEvents), [filteredEvents]);

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-8">Overview</h1>

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

      {stats.totalTracks === 0 && (
        <div className="mt-12 text-center">
          <p className="text-spotify-light-gray text-lg">
            No listening data found for this time period.
          </p>
          <p className="text-zinc-500 mt-2">
            Try selecting a different time range.
          </p>
        </div>
      )}
    </div>
  );
}
