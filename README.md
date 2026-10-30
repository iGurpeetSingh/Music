# Melodify — Music Dashboard

Responsive React + Vite music dashboard with a demo catalogue and functional HTML audio player.

## Run locally

```bash
npm install
npm run dev
```

## Features

- Responsive dark dashboard for desktop, tablet and mobile
- Search songs, artists, albums and genres
- Play/pause, previous/next, seek, volume, shuffle and repeat
- Favourites, queue, recently played and playlist creation
- Demo songs and direct audio streams for initial testing

## Connect your music API

Set `VITE_MUSIC_API_BASE_URL` in your local `.env` file. Update `src/config/api.js` response mapping if needed. The React UI expects a song array containing:

```js
{ id, title, artist, album, duration, cover, audioUrl, genre }
```

`audioUrl` must be a direct browser-playable audio stream, not simply a music service webpage. Your API host must allow CORS from your deployed domain. Do not place private API keys in frontend code; route private credentials through a backend or Cloudflare Worker.

With no API configured, demo tracks remain available.

## Build

```bash
npm run build
npm run preview
```
