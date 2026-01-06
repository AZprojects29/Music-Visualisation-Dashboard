import { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { getTopTracks, formatDuration, formatNumber } from '../data/aggregations';
import { BarChartHorizontal } from '../components/charts/BarChartHorizontal';

type SortBy = 'totalMsPlayed' | 'playCount';

export function Tracks() {
  const { filteredEvents } = useApp();
  const [sortBy, setSortBy] = useState<SortBy>('totalMsPlayed');
  const [limit, setLimit] = useState<10 | 25>(10);

  const topTracks = useMemo(
    () => getTopTracks(filteredEvents, limit, sortBy),
    [filteredEvents, limit, sortBy]
  );

  const chartData = useMemo(
    () =>
      topTracks.map((track) => ({
        name: track.track,
        value: sortBy === 'totalMsPlayed' ? track.totalMsPlayed : track.playCount,
        subtitle: track.artist,
      })),
    [topTracks, sortBy]
  );

  if (filteredEvents.length === 0) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-white mb-8">Top Tracks</h1>
        <p className="text-spotify-light-gray">No data for this time period.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <h1 className="text-3xl font-bold text-white">Top Tracks</h1>

        <div className="flex gap-4">
          <div className="flex gap-2">
            <button
              onClick={() => setSortBy('totalMsPlayed')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                sortBy === 'totalMsPlayed'
                  ? 'bg-spotify-green text-black'
                  : 'bg-spotify-gray text-white hover:bg-zinc-700'
              }`}
            >
              By Time
            </button>
            <button
              onClick={() => setSortBy('playCount')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                sortBy === 'playCount'
                  ? 'bg-spotify-green text-black'
                  : 'bg-spotify-gray text-white hover:bg-zinc-700'
              }`}
            >
              By Plays
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setLimit(10)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                limit === 10
                  ? 'bg-spotify-green text-black'
                  : 'bg-spotify-gray text-white hover:bg-zinc-700'
              }`}
            >
              Top 10
            </button>
            <button
              onClick={() => setLimit(25)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                limit === 25
                  ? 'bg-spotify-green text-black'
                  : 'bg-spotify-gray text-white hover:bg-zinc-700'
              }`}
            >
              Top 25
            </button>
          </div>
        </div>
      </div>

      <div className="bg-spotify-gray rounded-xl p-6">
        <BarChartHorizontal
          data={chartData}
          valueLabel={sortBy === 'totalMsPlayed' ? 'Time Played' : 'Play Count'}
          formatValue={
            sortBy === 'totalMsPlayed'
              ? (v) => formatDuration(v)
              : (v) => `${formatNumber(v)} plays`
          }
          height={limit === 10 ? 450 : 900}
        />
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold text-white mb-4">Track Details</h2>
        <div className="space-y-2">
          {topTracks.map((track, index) => (
            <div
              key={`${track.track}-${track.artist}`}
              className="bg-spotify-gray rounded-lg p-4 flex items-center gap-4"
            >
              <span
                className={`text-2xl font-bold w-8 ${
                  index === 0 ? 'text-spotify-green' : 'text-spotify-light-gray'
                }`}
              >
                {index + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate">{track.track}</p>
                <p className="text-spotify-light-gray text-sm truncate">
                  {track.artist} • {track.album}
                </p>
              </div>
              <div className="text-right">
                <p className="text-white font-medium">
                  {formatDuration(track.totalMsPlayed)}
                </p>
                <p className="text-spotify-light-gray text-sm">
                  {formatNumber(track.playCount)} plays
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
