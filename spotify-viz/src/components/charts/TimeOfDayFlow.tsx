import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  PolarRadiusAxis,
} from 'recharts';
import { formatDuration } from '../../data/aggregations';
import type { TimeOfDayData, HourlyData } from '../../data/aggregations';
import { Sunrise, Sun, Sunset, Moon } from 'lucide-react';

interface TimeOfDayFlowProps {
  timeOfDayData: TimeOfDayData[];
  hourlyData: HourlyData[];
}

const PERIOD_COLORS: Record<string, string> = {
  'Morning (6AM-12PM)': '#f59e0b',
  'Afternoon (12PM-6PM)': '#1DB954',
  'Evening (6PM-12AM)': '#8b5cf6',
  'Night (12AM-6AM)': '#3b82f6',
};

const getPeriodIcon = (period: string, size: number = 20) => {
  const color = PERIOD_COLORS[period];
  switch (period) {
    case 'Morning (6AM-12PM)':
      return <Sunrise size={size} style={{ color }} />;
    case 'Afternoon (12PM-6PM)':
      return <Sun size={size} style={{ color }} />;
    case 'Evening (6PM-12AM)':
      return <Sunset size={size} style={{ color }} />;
    case 'Night (12AM-6AM)':
      return <Moon size={size} style={{ color }} />;
    default:
      return null;
  }
};

export function TimeOfDayFlow({ timeOfDayData, hourlyData }: TimeOfDayFlowProps) {
  const radarData = useMemo(() => {
    return hourlyData.map((h) => ({
      hour: h.label,
      value: h.msPlayed,
      fullMark: Math.max(...hourlyData.map((d) => d.msPlayed)),
    }));
  }, [hourlyData]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-3 shadow-lg">
          <p className="text-white font-medium">{payload[0].payload.hour}</p>
          <p className="text-spotify-green font-bold">
            {formatDuration(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  const maxPeriod = useMemo(() => {
    return timeOfDayData.reduce((max, curr) =>
      curr.msPlayed > max.msPlayed ? curr : max
    );
  }, [timeOfDayData]);

  return (
    <div className="space-y-8">
      {/* Period Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {timeOfDayData.map((period) => {
          const isMax = period.period === maxPeriod.period;
          return (
            <div
              key={period.period}
              className={`rounded-xl p-4 transition-all ${
                isMax
                  ? 'bg-gradient-to-br from-spotify-green/20 to-spotify-green/5 border border-spotify-green/30'
                  : 'bg-zinc-800'
              }`}
            >
              <div className="flex items-center gap-2 mb-3">
                {getPeriodIcon(period.period, 22)}
                <p className="text-white font-medium text-sm">
                  {period.period.split(' ')[0]}
                </p>
              </div>
              <p
                className={`text-2xl font-bold ${
                  isMax ? 'text-spotify-green' : 'text-white'
                }`}
              >
                {formatDuration(period.msPlayed)}
              </p>
              <p className="text-spotify-light-gray text-sm mt-1">
                {period.percentage.toFixed(1)}% of listening
              </p>
              <div className="mt-3 h-1.5 bg-zinc-700 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${period.percentage}%`,
                    backgroundColor: PERIOD_COLORS[period.period],
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Flow Visualization */}
      <div className="bg-zinc-800 rounded-xl p-6">
        <h4 className="text-white font-medium mb-4">Daily Listening Flow</h4>
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {timeOfDayData.map((period, index) => (
            <div key={period.period} className="flex items-center">
              <div
                className="rounded-lg px-4 py-3 text-center min-w-[100px] flex flex-col items-center"
                style={{ backgroundColor: `${PERIOD_COLORS[period.period]}20` }}
              >
                {getPeriodIcon(period.period, 24)}
                <p
                  className="text-lg font-bold mt-1"
                  style={{ color: PERIOD_COLORS[period.period] }}
                >
                  {period.percentage.toFixed(0)}%
                </p>
              </div>
              {index < timeOfDayData.length - 1 && (
                <div className="flex items-center mx-2">
                  <div className="w-8 h-0.5 bg-zinc-600" />
                  <div className="w-0 h-0 border-t-4 border-b-4 border-l-4 border-transparent border-l-zinc-600" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 24-Hour Radar Chart */}
      <div className="bg-zinc-800 rounded-xl p-6">
        <h4 className="text-white font-medium mb-4">24-Hour Listening Pattern</h4>
        <ResponsiveContainer width="100%" height={350}>
          <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="80%">
            <PolarGrid stroke="#535353" />
            <PolarAngleAxis
              dataKey="hour"
              tick={{ fill: '#B3B3B3', fontSize: 10 }}
            />
            <PolarRadiusAxis tick={false} axisLine={false} />
            <Radar
              name="Listening Time"
              dataKey="value"
              stroke="#1DB954"
              fill="#1DB954"
              fillOpacity={0.3}
              strokeWidth={2}
            />
            <Tooltip content={<CustomTooltip />} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Hourly Bar Chart */}
      <div className="bg-zinc-800 rounded-xl p-6">
        <h4 className="text-white font-medium mb-4">Hourly Breakdown</h4>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={hourlyData}>
            <XAxis
              dataKey="label"
              tick={{ fill: '#B3B3B3', fontSize: 10 }}
              axisLine={{ stroke: '#535353' }}
              tickLine={false}
              interval={2}
            />
            <YAxis hide />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="msPlayed" radius={[4, 4, 0, 0]}>
              {hourlyData.map((entry) => {
                let color = '#535353';
                if (entry.hour >= 6 && entry.hour < 12) color = PERIOD_COLORS['Morning (6AM-12PM)'];
                else if (entry.hour >= 12 && entry.hour < 18) color = PERIOD_COLORS['Afternoon (12PM-6PM)'];
                else if (entry.hour >= 18 && entry.hour < 24) color = PERIOD_COLORS['Evening (6PM-12AM)'];
                else color = PERIOD_COLORS['Night (12AM-6AM)'];
                return <Cell key={entry.hour} fill={color} />;
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
