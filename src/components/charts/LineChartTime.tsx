import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { formatDuration } from '../../data/aggregations';

interface LineChartTimeProps {
  data: Array<{
    date: string;
    value: number;
  }>;
  valueLabel?: string;
  formatValue?: (value: number) => string;
  height?: number;
  showArea?: boolean;
}

const SPOTIFY_GREEN = '#1DB954';

export function LineChartTime({
  data,
  valueLabel = 'Listening Time',
  formatValue = (v) => formatDuration(v),
  height = 300,
  showArea = true,
}: LineChartTimeProps) {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-3 shadow-lg">
          <p className="text-spotify-light-gray text-sm">{label}</p>
          <p className="text-spotify-green font-bold mt-1">
            {valueLabel}: {formatValue(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  const formatDate = (dateStr: string) => {
    if (dateStr.length === 7) {
      // Monthly format: YYYY-MM
      const [year, month] = dateStr.split('-');
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${monthNames[parseInt(month) - 1]} ${year.slice(2)}`;
    }
    // Daily format: YYYY-MM-DD
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const ChartComponent = showArea ? AreaChart : LineChart;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ChartComponent
        data={data}
        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
      >
        <defs>
          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={SPOTIFY_GREEN} stopOpacity={0.3} />
            <stop offset="95%" stopColor={SPOTIFY_GREEN} stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="date"
          tickFormatter={formatDate}
          tick={{ fill: '#B3B3B3', fontSize: 11 }}
          axisLine={{ stroke: '#535353' }}
          tickLine={{ stroke: '#535353' }}
          interval="preserveStartEnd"
          minTickGap={50}
        />
        <YAxis
          tickFormatter={(v) => {
            const hours = Math.round(v / 3600000);
            return hours > 0 ? `${hours}h` : '';
          }}
          tick={{ fill: '#B3B3B3', fontSize: 11 }}
          axisLine={{ stroke: '#535353' }}
          tickLine={false}
          width={45}
        />
        <Tooltip content={<CustomTooltip />} />
        {showArea ? (
          <Area
            type="monotone"
            dataKey="value"
            stroke={SPOTIFY_GREEN}
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorValue)"
          />
        ) : (
          <Line
            type="monotone"
            dataKey="value"
            stroke={SPOTIFY_GREEN}
            strokeWidth={2}
            dot={false}
          />
        )}
      </ChartComponent>
    </ResponsiveContainer>
  );
}
