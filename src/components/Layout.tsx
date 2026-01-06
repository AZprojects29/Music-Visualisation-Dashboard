import { Outlet } from 'react-router-dom';
import { Navigation } from './Navigation';
import { TimeSelector } from './TimeSelector';
import { SearchFilter } from './SearchFilter';
import { useApp } from '../context/AppContext';

export function Layout() {
  const { isLoading, error, timeRange, searchQuery } = useApp();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-spotify-dark flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-spotify-green border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-spotify-light-gray">Loading your listening history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-spotify-dark flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-2">{error}</p>
          <p className="text-spotify-light-gray text-sm">
            Make sure the JSON files are in the /public/data folder
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-spotify-dark">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
        <div className="mb-6 md:mb-8">
          {/* Mobile: stack vertically, TimeSelector takes full width */}
          <div className="flex flex-col gap-4 md:flex-row md:flex-wrap md:items-start md:justify-between">
            <div className="min-w-0 w-full md:w-auto">
              <TimeSelector />
              <p className="text-spotify-light-gray text-sm mt-3">
                Viewing: {timeRange.label}
                {searchQuery && (
                  <span className="text-spotify-green ml-2">
                    • Filtered by "{searchQuery}"
                  </span>
                )}
              </p>
            </div>
            <SearchFilter />
          </div>
        </div>
        <Outlet />
      </main>
    </div>
  );
}
