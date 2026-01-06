// Raw data structure from Spotify JSON export
export interface RawStreamingEvent {
  ts: string;
  platform: string;
  ms_played: number;
  conn_country: string;
  master_metadata_track_name: string | null;
  master_metadata_album_artist_name: string | null;
  master_metadata_album_album_name: string | null;
  spotify_track_uri: string | null;
  episode_name: string | null;
  episode_show_name: string | null;
  spotify_episode_uri: string | null;
  audiobook_title: string | null;
  shuffle: boolean;
  skipped: boolean;
  offline: boolean;
  reason_start: string;
  reason_end: string;
}

// Normalized streaming event structure
export interface StreamingEvent {
  ts: Date;
  year: number;
  month: number;
  track: string;
  artist: string;
  album: string;
  msPlayed: number;
  skipped: boolean;
  shuffle: boolean;
  platform: string;
}

// Time range options
export type TimeRangeType =
  | 'past4weeks'
  | 'past6months'
  | 'past1year'
  | 'year'
  | 'lifetime';

export interface TimeRange {
  type: TimeRangeType;
  year?: number; // Only used when type is 'year'
  label: string;
}

// Aggregation types
export interface TrackStats {
  track: string;
  artist: string;
  album: string;
  playCount: number;
  totalMsPlayed: number;
}

export interface ArtistStats {
  artist: string;
  playCount: number;
  totalMsPlayed: number;
  percentage: number;
}

export interface DailyListening {
  date: string;
  msPlayed: number;
  trackCount: number;
}

export interface MonthlyListening {
  month: string;
  year: number;
  msPlayed: number;
  trackCount: number;
}

export interface YearlyRecap {
  year: number;
  topTrack: TrackStats | null;
  topArtist: ArtistStats | null;
  totalMsPlayed: number;
  totalTracks: number;
  uniqueArtists: number;
}

export interface LifetimeStats {
  mostPlayedTrack: TrackStats | null;
  longestListeningDay: {
    date: string;
    msPlayed: number;
  } | null;
  shufflePercentage: number;
  skipRate: number;
  totalMinutes: number;
  totalTracks: number;
  totalArtists: number;
}