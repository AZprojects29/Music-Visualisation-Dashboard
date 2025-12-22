import { AnimatedCounter } from './AnimatedCounter';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  accent?: boolean;
  animate?: boolean;
  formatValue?: (value: number) => string;
}

export function StatCard({
  title,
  value,
  subtitle,
  accent = false,
  animate = true,
  formatValue,
}: StatCardProps) {
  const isNumeric = typeof value === 'number';

  return (
    <div className="bg-spotify-gray rounded-xl p-6">
      <p className="text-spotify-light-gray text-sm font-medium mb-2">{title}</p>
      <p
        className={`text-3xl font-bold ${
          accent ? 'text-spotify-green' : 'text-white'
        }`}
      >
        {isNumeric && animate ? (
          <AnimatedCounter
            value={value}
            formatValue={formatValue || ((v) => v.toLocaleString())}
          />
        ) : (
          value
        )}
      </p>
      {subtitle && (
        <p className="text-spotify-light-gray text-sm mt-1">{subtitle}</p>
      )}
    </div>
  );
}
