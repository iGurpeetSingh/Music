/** Add your API endpoint in .env as VITE_MUSIC_API_BASE_URL. Adapt this response mapping to your provider. Never expose private API keys in frontend code; proxy them through a backend/Worker. */
export const MUSIC_API_BASE_URL = import.meta.env.VITE_MUSIC_API_BASE_URL || '';
export async function fetchSongs() {
  if (!MUSIC_API_BASE_URL) return null;
  const response = await fetch(MUSIC_API_BASE_URL, { headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error('Music API failed: ' + response.status);
  const payload = await response.json();
  return Array.isArray(payload) ? payload : (payload.songs || payload.data || []);
}