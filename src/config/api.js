/** Music API configuration. Song search and streaming use a public, unofficial JioSaavn API through a same-origin Vercel function. */
export const MUSIC_API_BASE_URL = import.meta.env.VITE_MUSIC_API_BASE_URL || '';

export async function fetchSongs() {
  if (!MUSIC_API_BASE_URL) return null;
  const response = await fetch(MUSIC_API_BASE_URL, { headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error('Music API failed: ' + response.status);
  const payload = await response.json();
  return Array.isArray(payload) ? payload : (payload.songs || payload.data || []);
}

export async function searchMusicSongs(searchTerm) {
  const params = new URLSearchParams({ q: searchTerm });
  const response = await fetch('/api/saavn-search?' + params.toString(), {
    headers: { Accept: 'application/json' }
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error || 'Music search failed');
  return payload.items || [];
}
