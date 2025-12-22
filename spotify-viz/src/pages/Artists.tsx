import { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { getTopArtists, formatDuration, formatNumber } from '../data/aggregations';
import { BarChartHorizontal } from '../components/charts/BarChartHorizontal';
import { BubbleChart } from '../components/charts/BubbleChart';

type ViewMode = 'bar' | 'bubble';

export function Artists() {
  const { filteredEvents } = useApp();
  const [limit, setLimit] = useState<10 | 25>(10);
  const [viewMode, setViewMode] = useState<ViewMode>('bubble');

  const topArtists = useMemo(
    () => getTopArtists(filteredEvents, limit),
    [filteredEvents, limit]
  );

  const chartData = useMemo(
    () =>
      topArtists.map((artist) => ({
        name: artist.artist,
        value: artist.totalMsPlayed,
        subtitle: `${artist.percentage.toFixed(1)}% of listening time`,
      })),
    [topArtists]
  );

  const bubbleData = useMemo(
    () =>
      topArtists.map((artist) => ({
        name: artist.artist,
        value: artist.totalMsPlayed,
        percentage: artist.percentage,
      })),
    [topArtists]
  );

  if (filteredEvents.length === 0) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-white mb-8">Top Artists</h1>
        <p className="text-spotify-light-gray">No data for this time period.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <h1 className="text-3xl font-bold text-white">Top Artists</h1>

        <div className="flex gap-4">
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('bubble')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                viewMode === 'bubble'
                  ? 'bg-spotify-green text-black'
                  : 'bg-spotify-gray text-white hover:bg-zinc-700'
              }`}
            >
              Bubbles
            </button>
            <button
              onClick={() => setViewMode('bar')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                viewMode === 'bar'
                  ? 'bg-spotify-green text-black'
                  : 'bg-spotify-gray text-white hover:bg-zinc-700'
              }`}
            >
              Bar Chart
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
        {viewMode === 'bubble' ? (
          <BubbleChart data={bubbleData} maxBubbles={limit} />
        ) : (
          <BarChartHorizontal
            data={chartData}
            valueLabel="Time Played"
            formatValue={(v) => formatDuration(v)}
            height={limit === 10 ? 450 : 900}
          />
        )}
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold text-white mb-4">Artist Breakdown</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {topArtists.slice(0, 10).map((artist, index) => (
            <div
              key={artist.artist}
              className="bg-spotify-gray rounded-lg p-4"
            >
              <div className="flex items-center gap-4 mb-3">
                <span
                  className={`text-2xl font-bold ${
                    index === 0 ? 'text-spotify-green' : 'text-spotify-light-gray'
                  }`}
                >
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">{artist.artist}</p>
                  <p className="text-spotify-light-gray text-sm">
                    {formatNumber(artist.playCount)} tracks played
                  </p>
                </div>
              </div>
              <div className="relative h-2 bg-zinc-700 rounded-full overflow-hidden">
                <div
                  className="absolute top-0 left-0 h-full bg-spotify-green rounded-full"
                  style={{ width: `${Math.min(artist.percentage * 2, 100)}%` }}
                />
              </div>
              <div className="flex justify-between mt-2 text-sm">
                <span className="text-spotify-light-gray">
                  {artist.percentage.toFixed(1)}% of total
                </span>
                <span className="text-white font-medium">
                  {formatDuration(artist.totalMsPlayed)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
