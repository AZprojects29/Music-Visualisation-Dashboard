import { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { formatDuration } from '../../data/aggregations';

interface BarChartHorizontalProps {
  data: Array<{
    name: string;
    value: number;
    subtitle?: string;
  }>;
  valueLabel?: string;
  formatValue?: (value: number) => string;
  height?: number;
}

const SPOTIFY_GREEN = '#1DB954';
const CHART_GRAY = '#535353';

export function BarChartHorizontal({
  data,
  valueLabel = 'Value',
  formatValue = (v) => formatDuration(v),
  height = 400,
}: BarChartHorizontalProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-3 shadow-lg">
          <p className="text-white font-medium">{item.name}</p>
          {item.subtitle && (
            <p className="text-spotify-light-gray text-sm">{item.subtitle}</p>
          )}
          <p className="text-spotify-green font-bold mt-1">
            {valueLabel}: {formatValue(item.value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
        >
        <XAxis
          type="number"
          tickFormatter={(v) => formatValue(v)}
          tick={{ fill: '#B3B3B3', fontSize: 12 }}
          axisLine={{ stroke: '#535353' }}
          tickLine={{ stroke: '#535353' }}
        />
        <YAxis
          dataKey="name"
          type="category"
          width={isMobile ? 70 : 180}
          tick={{ fill: '#fff', fontSize: isMobile ? 10 : 12 }}
          axisLine={{ stroke: '#535353' }}
          tickLine={false}
          tickFormatter={(v) => {
            const maxLen = isMobile ? 12 : 25;
            return v.length > maxLen ? v.slice(0, maxLen - 3) + '...' : v;
          }}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
        <Bar dataKey="value" radius={[0, 4, 4, 0]}>
          {data.map((_, index) => (
            <Cell
              key={`cell-${index}`}
              fill={index === 0 ? SPOTIFY_GREEN : CHART_GRAY}
            />
          ))}
        </Bar>
      </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
