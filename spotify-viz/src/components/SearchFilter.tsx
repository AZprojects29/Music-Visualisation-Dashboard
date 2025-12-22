import { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';

export function SearchFilter() {
  const { searchQuery, setSearchQuery, filteredEvents } = useApp();
  const [isExpanded, setIsExpanded] = useState(false);
  const [localQuery, setLocalQuery] = useState(searchQuery);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      setSearchQuery(localQuery);
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [localQuery, setSearchQuery]);

  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded]);

  const handleClear = () => {
    setLocalQuery('');
    setSearchQuery('');
  };

  const uniqueArtists = new Set(filteredEvents.map((e) => e.artist)).size;
  const matchedTracks = filteredEvents.length;

  return (
    <div className="relative">
      <div
        className={`flex items-center gap-2 transition-all duration-300 ${
          isExpanded ? 'w-80' : 'w-auto'
        }`}
      >
        {isExpanded ? (
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={localQuery}
              onChange={(e) => setLocalQuery(e.target.value)}
              placeholder="Search artists, tracks, albums..."
              className="w-full bg-spotify-gray text-white px-4 py-2 pl-10 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-spotify-green"
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-spotify-light-gray"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            {localQuery && (
              <button
                onClick={handleClear}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-spotify-light-gray hover:text-white"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        ) : (
          <button
            onClick={() => setIsExpanded(true)}
            className="flex items-center gap-2 px-4 py-2 bg-spotify-gray text-white rounded-full text-sm hover:bg-zinc-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            Search
          </button>
        )}

        {isExpanded && (
          <button
            onClick={() => {
              setIsExpanded(false);
              handleClear();
            }}
            className="px-3 py-2 text-spotify-light-gray hover:text-white text-sm"
          >
            Cancel
          </button>
        )}
      </div>

      {/* Search results indicator */}
      {searchQuery && (
        <div className="absolute top-full left-0 mt-2 bg-zinc-800 rounded-lg px-3 py-2 text-sm">
          <p className="text-spotify-light-gray">
            Filtering for "<span className="text-white">{searchQuery}</span>"
          </p>
          <p className="text-spotify-green text-xs mt-1">
            {matchedTracks.toLocaleString()} tracks • {uniqueArtists} artists
          </p>
        </div>
      )}
    </div>
  );
}
