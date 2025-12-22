import { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  getDailyListening,
  getMonthlyListening,
  formatDuration,
} from '../data/aggregations';
import { LineChartTime } from '../components/charts/LineChartTime';
import { AnimatedCounter } from '../components/AnimatedCounter';

export function Listening() {
  const { filteredEvents, timeRange } = useApp();

  // Use daily data for short ranges, monthly for longer ones
  const useMonthly = useMemo(() => {
    if (timeRange.type === 'past4weeks') return false;
    if (timeRange.type === 'past6months') return true;
    if (timeRange.type === 'past1year') return true;
    if (timeRange.type === 'lifetime') return true;
    // For specific year, use monthly
    return true;
  }, [timeRange]);

  const chartData = useMemo(() => {
    if (useMonthly) {
      const monthly = getMonthlyListening(filteredEvents);
      return monthly.map((m) => ({
        date: m.month,
        value: m.msPlayed,
      }));
    } else {
      const daily = getDailyListening(filteredEvents);
      return daily.map((d) => ({
        date: d.date,
        value: d.msPlayed,
      }));
    }
  }, [filteredEvents, useMonthly]);

  const totalMs = useMemo(
    () => filteredEvents.reduce((sum, e) => sum + e.msPlayed, 0),
    [filteredEvents]
  );

  const avgPerDay = useMemo(() => {
    if (chartData.length === 0) return 0;
    const totalDays = useMonthly ? chartData.length * 30 : chartData.length;
    return totalMs / totalDays;
  }, [chartData, totalMs, useMonthly]);

  const peakPeriod = useMemo(() => {
    if (chartData.length === 0) return null;
    return chartData.reduce((max, curr) =>
      curr.value > max.value ? curr : max
    );
  }, [chartData]);

  if (filteredEvents.length === 0) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-white mb-8">Listening Over Time</h1>
        <p className="text-spotify-light-gray">No data for this time period.</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-8">Listening Over Time</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-spotify-gray rounded-xl p-6">
          <p className="text-spotify-light-gray text-sm mb-2">Total Time</p>
          <p className="text-2xl font-bold text-spotify-green">
            <AnimatedCounter
              value={Math.round(totalMs / 60000)}
              formatValue={(v) => formatDuration(v * 60000)}
            />
          </p>
        </div>
        <div className="bg-spotify-gray rounded-xl p-6">
          <p className="text-spotify-light-gray text-sm mb-2">Daily Average</p>
          <p className="text-2xl font-bold text-white">
            {formatDuration(avgPerDay)}
          </p>
        </div>
        {peakPeriod && (
          <div className="bg-spotify-gray rounded-xl p-6">
            <p className="text-spotify-light-gray text-sm mb-2">
              Peak {useMonthly ? 'Month' : 'Day'}
            </p>
            <p className="text-2xl font-bold text-white">
              {formatDuration(peakPeriod.value)}
            </p>
            <p className="text-spotify-light-gray text-sm mt-1">
              {peakPeriod.date}
            </p>
          </div>
        )}
      </div>

      <div className="bg-spotify-gray rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-6">
          {useMonthly ? 'Monthly' : 'Daily'} Listening Trends
        </h2>
        <LineChartTime
          data={chartData}
          valueLabel="Listening Time"
          formatValue={(v) => formatDuration(v)}
          height={350}
        />
      </div>
    </div>
  );
}
