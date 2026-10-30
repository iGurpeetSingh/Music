# Melodify — Music Dashboard

Responsive React + Vite music dashboard with YouTube search and an immersive Now Playing screen.

## Run locally

```bash
npm install
npm run dev
```

## YouTube Data API v3

Set `VITE_YOUTUBE_API_KEY` in Vercel → Project → Settings → Environment Variables. Select the environments you deploy to, save, and redeploy. Enable YouTube Data API v3 in Google Cloud. Restrict the key to your deployed website's HTTP referrers and to YouTube Data API v3. Do not commit the real key to source control.

Search uses YouTube Data API v3 `search.list` and returns up to 25 videos. Selecting a result opens the immersive Now Playing view with an embedded YouTube player. The spinning artwork and animated waveform are visual UI elements; actual playback is provided by YouTube's embedded player and its controls.

## Optional custom music API

Set `VITE_MUSIC_API_BASE_URL` in `.env` and adapt `src/config/api.js` if you also want a separate catalogue endpoint. The expected song shape is `{ id, title, artist, album, duration, cover, audioUrl, genre }`. Audio URLs must be direct browser-playable streams. Keep private credentials on a backend or Cloudflare Worker.

## Build

```bash
npm run build
npm run preview
```
