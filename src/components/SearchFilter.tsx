import { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Search, X } from 'lucide-react';

export function SearchFilter() {
  const { searchQuery, setSearchQuery, filteredEvents } = useApp();
  const [isExpanded, setIsExpanded] = useState(false);
  const [localQuery, setLocalQuery] = useState(searchQuery);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
          isExpanded ? 'w-96' : 'w-auto'
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
              className="w-full bg-zinc-900 text-white px-4 py-2 pl-10 rounded-lg text-sm border border-zinc-600 focus:outline-none focus:border-spotify-green transition-colors"
            />
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
            />
            {localQuery && (
              <button
                onClick={handleClear}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            )}
          </div>
        ) : (
          <button
            onClick={() => setIsExpanded(true)}
            className="flex items-center justify-start gap-3 w-40 px-4 py-2 bg-transparent text-zinc-400 rounded-lg text-sm border border-zinc-600 hover:border-zinc-400 hover:text-white transition-colors"
          >
            <Search size={16} />
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
