import { AnimatedCounter } from './AnimatedCounter';
import type { StreakInfo } from '../data/aggregations';
import { Flame } from 'lucide-react';

interface StreakTrackerProps {
  streakInfo: StreakInfo;
}

export function StreakTracker({ streakInfo }: StreakTrackerProps) {
  const formatDateRange = (start: string | null, end: string | null) => {
    if (!start || !end) return 'N/A';
    const startDate = new Date(start).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    const endDate = new Date(end).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    return `${startDate} - ${endDate}`;
  };

  return (
    <div className="bg-spotify-gray rounded-xl p-6">
      <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
          <Flame size={22} className="text-orange-400" />
        </div>
        Listening Streaks
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Current Streak */}
        <div className="bg-zinc-800 rounded-lg p-4 text-center">
          <p className="text-spotify-light-gray text-sm mb-2">Current Streak</p>
          <p className="text-4xl font-bold text-spotify-green">
            <AnimatedCounter value={streakInfo.currentStreak} />
          </p>
          <p className="text-spotify-light-gray text-sm mt-1">
            {streakInfo.currentStreak === 1 ? 'day' : 'days'}
          </p>
        </div>

        {/* Longest Streak */}
        <div className="bg-zinc-800 rounded-lg p-4 text-center">
          <p className="text-spotify-light-gray text-sm mb-2">Longest Streak</p>
          <p className="text-4xl font-bold text-white">
            <AnimatedCounter value={streakInfo.longestStreak} />
          </p>
          <p className="text-spotify-light-gray text-sm mt-1">
            {streakInfo.longestStreak === 1 ? 'day' : 'days'}
          </p>
          {streakInfo.longestStreakStart && (
            <p className="text-zinc-500 text-xs mt-2">
              {formatDateRange(
                streakInfo.longestStreakStart,
                streakInfo.longestStreakEnd
              )}
            </p>
          )}
        </div>

        {/* Total Days */}
        <div className="bg-zinc-800 rounded-lg p-4 text-center">
          <p className="text-spotify-light-gray text-sm mb-2">Total Days Listened</p>
          <p className="text-4xl font-bold text-white">
            <AnimatedCounter value={streakInfo.totalDaysListened} />
          </p>
          <p className="text-spotify-light-gray text-sm mt-1">days</p>
        </div>

        {/* Average per Week */}
        <div className="bg-zinc-800 rounded-lg p-4 text-center">
          <p className="text-spotify-light-gray text-sm mb-2">Avg Days per Week</p>
          <p className="text-4xl font-bold text-white">
            {streakInfo.averagePerWeek.toFixed(1)}
          </p>
          <p className="text-spotify-light-gray text-sm mt-1">days/week</p>
        </div>
      </div>

      {/* Streak visualization */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-spotify-light-gray text-sm">Consistency Score</p>
          <p className="text-white font-medium">
            {Math.min(100, Math.round((streakInfo.averagePerWeek / 7) * 100))}%
          </p>
        </div>
        <div className="h-3 bg-zinc-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-spotify-green to-green-400 rounded-full transition-all duration-1000"
            style={{
              width: `${Math.min(100, (streakInfo.averagePerWeek / 7) * 100)}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
