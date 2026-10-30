export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'YOUTUBE_API_KEY is missing from Vercel Environment Variables.' });
  }

  const query = String(req.query?.q || '').trim();
  if (query.length < 2) {
    return res.status(400).json({ error: 'Search query must contain at least 2 characters.' });
  }

  try {
    const params = new URLSearchParams({
      part: 'snippet',
      type: 'video',
      maxResults: '25',
      regionCode: 'IN',
      q: query,
      key: apiKey
    });

    const youtubeResponse = await fetch('https://www.googleapis.com/youtube/v3/search?' + params.toString());
    const payload = await youtubeResponse.json();

    if (!youtubeResponse.ok) {
      const message = payload.error?.message || 'YouTube search failed.';
      return res.status(youtubeResponse.status).json({ error: message });
    }

    const items = (payload.items || []).map(item => ({
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

    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
    return res.status(200).json({ items });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Unable to search YouTube right now.' });
  }
}
