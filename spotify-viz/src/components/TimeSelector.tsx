import { useApp } from '../context/AppContext';
import type { TimeRange, TimeRangeType } from '../data/types';

const baseRanges: { type: TimeRangeType; label: string }[] = [
  { type: 'past4weeks', label: 'Past 4 Weeks' },
  { type: 'past6months', label: 'Past 6 Months' },
  { type: 'past1year', label: 'Past Year' },
  { type: 'lifetime', label: 'Lifetime' },
];

export function TimeSelector() {
  const { timeRange, setTimeRange, availableYears } = useApp();

  const handleRangeClick = (range: TimeRange) => {
    setTimeRange(range);
  };

  const isActive = (type: TimeRangeType, year?: number) => {
    if (type === 'year') {
      return timeRange.type === 'year' && timeRange.year === year;
    }
    return timeRange.type === type;
  };

  return (
    <div className="flex flex-wrap gap-2">
      {baseRanges.map((range) => (
        <button
          key={range.type}
          onClick={() => handleRangeClick({ type: range.type, label: range.label })}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            isActive(range.type)
              ? 'bg-spotify-green text-black'
              : 'bg-spotify-gray text-white hover:bg-zinc-700'
          }`}
        >
          {range.label}
        </button>
      ))}

      {availableYears.length > 0 && (
        <div className="flex items-center gap-2 ml-2">
          <span className="text-spotify-light-gray text-sm">|</span>
          {availableYears.map((year) => (
            <button
              key={year}
              onClick={() =>
                handleRangeClick({ type: 'year', year, label: year.toString() })
              }
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                isActive('year', year)
                  ? 'bg-spotify-green text-black'
                  : 'bg-spotify-gray text-white hover:bg-zinc-700'
              }`}
            >
              {year}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
