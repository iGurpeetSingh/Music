function firstLink(list) {
  if (!Array.isArray(list)) return '';
  const ranked = [...list].sort((a, b) => {
    const score = value => parseInt(String(value?.quality || '').match(/\d+/)?.[0] || '0', 10);
    return score(b) - score(a);
  });
  return ranked.find(item => item?.url || item?.link)?.url || ranked.find(item => item?.url || item?.link)?.link || '';
}

function firstImage(list) {
  if (!Array.isArray(list)) return '';
  const ranked = [...list].sort((a, b) => {
    const score = value => parseInt(String(value?.quality || '').match(/\d+/)?.[0] || '0', 10);
    return score(b) - score(a);
  });
  return ranked.find(item => item?.link)?.link || '';
}

function normalizeSong(song) {
  const artists = song.artists?.primary?.map(artist => artist.name).filter(Boolean).join(', ');
  const fallbackArtist = song.primaryArtists || song.artist || song.artists || 'Unknown artist';
  return {
    id: String(song.id || song.song_id || song.perma_url || Math.random()),
    title: song.name || song.title || song.song || 'Unknown title',
    artist: artists || fallbackArtist,
    album: song.album?.name || song.album || 'JioSaavn',
    duration: Number(song.duration || 0),
    cover: firstImage(song.image) || song.imageUrl || song.song_image || '',
    audioUrl: firstLink(song.downloadUrl) || song.downloadUrl || song.media_url || song.url || '',
    genre: song.language || 'Music'
  };
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const query = String(req.query?.q || '').trim();
  if (query.length < 2) {
    return res.status(400).json({ error: 'Search query must contain at least 2 characters.' });
  }

  const endpoints = [
    'https://saavn.dev/api/search/songs?query=' + encodeURIComponent(query) + '&page=0&limit=30',
    'https://saavn.sumit.co/api/search/songs?query=' + encodeURIComponent(query) + '&page=0&limit=30'
  ];

  const errors = [];
  for (const endpoint of endpoints) {
    try {
      const upstream = await fetch(endpoint, { headers: { Accept: 'application/json' } });
      if (!upstream.ok) {
        errors.push('Music provider returned ' + upstream.status);
        continue;
      }
      const payload = await upstream.json();
      const rawSongs = payload?.data?.results || payload?.data || payload?.results || payload?.songs || [];
      const items = (Array.isArray(rawSongs) ? rawSongs : []).map(normalizeSong)
        .filter(song => song.title && song.audioUrl);
      if (!items.length) {
        errors.push('No playable songs returned by this provider');
        continue;
      }
      res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
      return res.status(200).json({ items, source: 'JioSaavn' });
    } catch (error) {
      errors.push(error.message || 'Provider request failed');
    }
  }

  return res.status(502).json({
    error: 'Music search is temporarily unavailable. Please try again in a moment.',
    details: errors
  });
}
