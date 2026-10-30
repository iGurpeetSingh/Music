/** Music API configuration. YouTube searches are proxied through a Vercel serverless function so the API key stays server-side. */
export const MUSIC_API_BASE_URL = import.meta.env.VITE_MUSIC_API_BASE_URL || '';

export async function fetchSongs() {
  if (!MUSIC_API_BASE_URL) return null;
  const response = await fetch(MUSIC_API_BASE_URL, { headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error('Music API failed: ' + response.status);
  const payload = await response.json();
  return Array.isArray(payload) ? payload : (payload.songs || payload.data || []);
}

export async function searchYouTubeSongs(searchTerm) {
  const params = new URLSearchParams({ q: searchTerm });
  const response = await fetch('/api/youtube-search?' + params.toString(), {
    headers: { Accept: 'application/json' }
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error || 'YouTube search failed');
  return payload.items || [];
}
