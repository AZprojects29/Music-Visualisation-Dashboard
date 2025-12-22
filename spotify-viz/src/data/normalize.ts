import type { RawStreamingEvent, StreamingEvent } from './types';

function isAudioTrack(event: RawStreamingEvent): boolean {
  // Exclude podcasts
  if (event.episode_name || event.episode_show_name || event.spotify_episode_uri) {
    return false;
  }

  // Exclude audiobooks
  if (event.audiobook_title) {
    return false;
  }

  // Must have a track name
  if (!event.master_metadata_track_name) {
    return false;
  }

  return true;
}

export function normalizeEvent(raw: RawStreamingEvent): StreamingEvent | null {
  if (!isAudioTrack(raw)) {
    return null;
  }

  const date = new Date(raw.ts);

  return {
    ts: date,
    year: date.getFullYear(),
    month: date.getMonth() + 1, // 1-12
    track: raw.master_metadata_track_name!,
    artist: raw.master_metadata_album_artist_name || 'Unknown Artist',
    album: raw.master_metadata_album_album_name || 'Unknown Album',
    msPlayed: raw.ms_played,
    skipped: raw.skipped,
    shuffle: raw.shuffle,
    platform: raw.platform,
  };
}

export function normalizeAllEvents(raw: RawStreamingEvent[]): StreamingEvent[] {
  const normalized: StreamingEvent[] = [];

  for (const event of raw) {
    const normalizedEvent = normalizeEvent(event);
    if (normalizedEvent) {
      normalized.push(normalizedEvent);
    }
  }

  return normalized;
}
