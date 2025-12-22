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

  const buttonClass = (active: boolean) =>
    `px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
      active
        ? 'bg-spotify-green text-black'
        : 'bg-spotify-gray text-white hover:bg-zinc-700'
    }`;

  return (
    <div className="w-full">
      {/* Mobile: horizontal scroll with fade edges */}
      <div className="relative md:hidden overflow-hidden">
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex items-center gap-2 px-1">
            {baseRanges.map((range) => (
              <button
                key={range.type}
                onClick={() => handleRangeClick({ type: range.type, label: range.label })}
                className={buttonClass(isActive(range.type))}
              >
                {range.label}
              </button>
            ))}

            {availableYears.length > 0 && (
              <>
                <span className="text-spotify-light-gray text-sm">|</span>
                {availableYears.map((year) => (
                  <button
                    key={year}
                    onClick={() =>
                      handleRangeClick({ type: 'year', year, label: year.toString() })
                    }
                    className={buttonClass(isActive('year', year))}
                  >
                    {year}
                  </button>
                ))}
              </>
            )}
          </div>
        </div>
        <div className="time-fade-right"></div>
      </div>

      {/* Desktop: regular flex-wrap layout */}
      <div className="hidden md:flex flex-wrap gap-2">
        {baseRanges.map((range) => (
          <button
            key={range.type}
            onClick={() => handleRangeClick({ type: range.type, label: range.label })}
            className={buttonClass(isActive(range.type))}
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
                className={buttonClass(isActive('year', year))}
              >
                {year}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
