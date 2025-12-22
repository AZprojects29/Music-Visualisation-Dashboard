import { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { getYearlyRecaps, formatDuration, formatNumber } from '../data/aggregations';

export function Yearly() {
  const { allEvents } = useApp();

  const recaps = useMemo(() => getYearlyRecaps(allEvents), [allEvents]);

  if (recaps.length === 0) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-white mb-8">Yearly Recaps</h1>
        <p className="text-spotify-light-gray">No listening data available.</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-8">Yearly Recaps</h1>

      <div className="space-y-6">
        {recaps.map((recap) => (
          <div key={recap.year} className="bg-spotify-gray rounded-xl p-6">
            <div className="flex items-center gap-4 mb-6">
              <h2 className="text-4xl font-bold text-spotify-green">{recap.year}</h2>
              <div className="h-px flex-1 bg-zinc-700" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <p className="text-spotify-light-gray text-sm mb-2">Total Listening Time</p>
                <p className="text-2xl font-bold text-white">
                  {formatDuration(recap.totalMsPlayed)}
                </p>
              </div>
              <div>
                <p className="text-spotify-light-gray text-sm mb-2">Tracks Played</p>
                <p className="text-2xl font-bold text-white">
                  {formatNumber(recap.totalTracks)}
                </p>
              </div>
              <div>
                <p className="text-spotify-light-gray text-sm mb-2">Unique Artists</p>
                <p className="text-2xl font-bold text-white">
                  {formatNumber(recap.uniqueArtists)}
                </p>
              </div>
              <div>
                <p className="text-spotify-light-gray text-sm mb-2">Avg per Day</p>
                <p className="text-2xl font-bold text-white">
                  {formatDuration(recap.totalMsPlayed / 365)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              {recap.topTrack && (
                <div className="bg-zinc-800 rounded-lg p-4">
                  <p className="text-spotify-green text-sm font-medium mb-2">
                    Top Track
                  </p>
                  <p className="text-white font-bold text-lg truncate">
                    {recap.topTrack.track}
                  </p>
                  <p className="text-spotify-light-gray text-sm truncate">
                    {recap.topTrack.artist}
                  </p>
                  <p className="text-spotify-light-gray text-sm mt-2">
                    {formatNumber(recap.topTrack.playCount)} plays •{' '}
                    {formatDuration(recap.topTrack.totalMsPlayed)}
                  </p>
                </div>
              )}

              {recap.topArtist && (
                <div className="bg-zinc-800 rounded-lg p-4">
                  <p className="text-spotify-green text-sm font-medium mb-2">
                    Top Artist
                  </p>
                  <p className="text-white font-bold text-lg truncate">
                    {recap.topArtist.artist}
                  </p>
                  <p className="text-spotify-light-gray text-sm mt-2">
                    {formatNumber(recap.topArtist.playCount)} tracks •{' '}
                    {formatDuration(recap.topArtist.totalMsPlayed)}
                  </p>
                  <p className="text-spotify-light-gray text-sm">
                    {recap.topArtist.percentage.toFixed(1)}% of listening time
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
