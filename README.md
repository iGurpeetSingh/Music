# Melodify — Music Dashboard

Responsive React + Vite music dashboard with live song search and an immersive Now Playing screen.

## Run locally

```bash
npm install
npm run dev
```

## Music search and playback

Song search is served through the Vercel serverless route `/api/saavn-search`. It uses the public, unofficial JioSaavn-compatible API and returns song title, artist, artwork, and available audio stream URLs. Selecting a result opens the full-screen player and plays the returned audio stream using the browser's native audio element.

No YouTube API key or Vercel environment variable is required for this integration. The upstream service is unofficial and may occasionally be unavailable or change its response format; the server route includes a secondary provider fallback.

## Optional custom music catalogue

Set `VITE_MUSIC_API_BASE_URL` in `.env` if you also want a separate catalogue endpoint. Expected song shape: `{ id, title, artist, album, duration, cover, audioUrl, genre }`. Audio URLs must be direct browser-playable streams. Keep private credentials on a backend or Cloudflare Worker.

## Build

```bash
npm run build
npm run preview
```
