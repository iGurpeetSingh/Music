/** Add your API endpoint in .env as VITE_MUSIC_API_BASE_URL. Adapt this response mapping to your provider. Never expose private API keys in frontend code; proxy them through a backend/Worker. */
export const MUSIC_API_BASE_URL = import.meta.env.VITE_MUSIC_API_BASE_URL || '';
export async function fetchSongs() {
  if (!MUSIC_API_BASE_URL) return null;
  const response = await fetch(MUSIC_API_BASE_URL, { headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error('Music API failed: ' + response.status);
  const payload = await response.json();
  return Array.isArray(payload) ? payload : (payload.songs || payload.data || []);
}

export const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY || '';

export async function searchYouTubeSongs(searchTerm) {
  if (!YOUTUBE_API_KEY) throw new Error('VITE_YOUTUBE_API_KEY is missing');
  const params = new URLSearchParams({
    part: 'snippet',
    type: 'video',
    videoCategoryId: '10',
    maxResults: '25',
    q: searchTerm,
    key: YOUTUBE_API_KEY
  });
  const response = await fetch('https://www.googleapis.com/youtube/v3/search?' + params.toString());
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error?.message || 'YouTube search failed');
  return (payload.items || []).map(item => ({
    id: item.id.videoId,
    videoId: item.id.videoId,
    title: item.snippet.title,
    artist: item.snippet.channelTitle,
    album: 'YouTube',
    cover: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url || '',
    genre: 'YouTube',
    duration: '',
    audioUrl: ''
  }));
}
