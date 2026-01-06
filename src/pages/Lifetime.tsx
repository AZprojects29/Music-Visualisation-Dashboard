import { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  getLifetimeStats,
  formatDuration,
  formatNumber,
  getTimeOfDayBreakdown,
  getHourlyBreakdown,
} from '../data/aggregations';
import { StatCard } from '../components/StatCard';
import { TimeOfDayFlow } from '../components/charts/TimeOfDayFlow';

export function Lifetime() {
  const { allEvents } = useApp();

  const stats = useMemo(() => getLifetimeStats(allEvents), [allEvents]);
  const timeOfDayData = useMemo(() => getTimeOfDayBreakdown(allEvents), [allEvents]);
  const hourlyData = useMemo(() => getHourlyBreakdown(allEvents), [allEvents]);

  if (allEvents.length === 0) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-white mb-8">Lifetime Stats</h1>
        <p className="text-spotify-light-gray">No listening data available.</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-8">Lifetime Stats</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Total Listening Time"
          value={stats.totalMinutes}
          formatValue={(v) => formatDuration(v * 60000)}
          accent
        />
        <StatCard
          title="Total Tracks Played"
          value={stats.totalTracks}
        />
        <StatCard
          title="Unique Artists"
          value={stats.totalArtists}
        />
      </div>

      {/* Time of Day Analysis */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-white mb-6">When Do You Listen?</h2>
        <TimeOfDayFlow timeOfDayData={timeOfDayData} hourlyData={hourlyData} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {stats.mostPlayedTrack && (
          <div className="bg-spotify-gray rounded-xl p-6">
            <p className="text-spotify-green text-sm font-medium mb-4">
              Most Played Track Ever
            </p>
            <p className="text-white font-bold text-2xl mb-2">
              {stats.mostPlayedTrack.track}
            </p>
            <p className="text-spotify-light-gray text-lg mb-4">
              {stats.mostPlayedTrack.artist}
            </p>
            <div className="flex gap-6 text-sm">
              <div>
                <p className="text-spotify-light-gray">Play Count</p>
                <p className="text-white font-bold text-xl">
                  {formatNumber(stats.mostPlayedTrack.playCount)}
                </p>
              </div>
              <div>
                <p className="text-spotify-light-gray">Total Time</p>
                <p className="text-white font-bold text-xl">
                  {formatDuration(stats.mostPlayedTrack.totalMsPlayed)}
                </p>
              </div>
            </div>
          </div>
        )}

        {stats.longestListeningDay && (
          <div className="bg-spotify-gray rounded-xl p-6">
            <p className="text-spotify-green text-sm font-medium mb-4">
              Longest Listening Day
            </p>
            <p className="text-white font-bold text-2xl mb-2">
              {formatDuration(stats.longestListeningDay.msPlayed)}
            </p>
            <p className="text-spotify-light-gray text-lg">
              {new Date(stats.longestListeningDay.date).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-spotify-gray rounded-xl p-6">
          <p className="text-spotify-light-gray text-sm mb-4">Shuffle Usage</p>
          <div className="flex items-end gap-4">
            <p className="text-4xl font-bold text-white">
              {stats.shufflePercentage.toFixed(1)}%
            </p>
            <p className="text-spotify-light-gray pb-1">of tracks played on shuffle</p>
          </div>
          <div className="mt-4 h-3 bg-zinc-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-spotify-green rounded-full transition-all"
              style={{ width: `${stats.shufflePercentage}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-sm text-spotify-light-gray">
            <span>Shuffle Off</span>
            <span>Shuffle On</span>
          </div>
        </div>

        <div className="bg-spotify-gray rounded-xl p-6">
          <p className="text-spotify-light-gray text-sm mb-4">Skip Rate</p>
          <div className="flex items-end gap-4">
            <p className="text-4xl font-bold text-white">
              {stats.skipRate.toFixed(1)}%
            </p>
            <p className="text-spotify-light-gray pb-1">of tracks were skipped</p>
          </div>
          <div className="mt-4 h-3 bg-zinc-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-red-500 rounded-full transition-all"
              style={{ width: `${stats.skipRate}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-sm text-spotify-light-gray">
            <span>Played</span>
            <span>Skipped</span>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-spotify-gray rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-6">Fun Facts</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="text-center p-4">
            <p className="text-3xl font-bold text-spotify-green mb-2">
              {Math.round(stats.totalMinutes / 60 / 24)}
            </p>
            <p className="text-spotify-light-gray">
              full days of music
            </p>
          </div>
          <div className="text-center p-4">
            <p className="text-3xl font-bold text-white mb-2">
              {Math.round(stats.totalTracks / stats.totalArtists)}
            </p>
            <p className="text-spotify-light-gray">
              avg tracks per artist
            </p>
          </div>
          <div className="text-center p-4">
            <p className="text-3xl font-bold text-white mb-2">
              {stats.totalTracks > 0 ? Math.round(stats.totalMinutes / stats.totalTracks) : 0}
            </p>
            <p className="text-spotify-light-gray">
              avg minutes per track
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
