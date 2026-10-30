import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity, Album, ArrowRight, AudioLines, Bell, ChevronDown, ChevronLeft,
  ChevronRight, CircleHelp, Compass, Disc3, Heart, Home, ListMusic, Menu,
  Music2, Pause, Play, Plus, Repeat, Search, Shuffle, SkipBack, SkipForward,
  SlidersHorizontal, Volume2, X, Ellipsis
} from 'lucide-react';
import { demoSongs, playlists, artists } from './data/songs';
import { fetchSongs } from './config/api';

const navigation = [
  { title: 'MENU', links: [{ name: 'Home', icon: Home }, { name: 'Explore', icon: Compass }, { name: 'Discover', icon: Activity }, { name: 'Albums', icon: Album }] },
  { title: 'YOUR LIBRARY', links: [{ name: 'Recently Played', icon: Disc3 }, { name: 'Favourite Songs', icon: Heart }, { name: 'Your Playlists', icon: ListMusic }] }
];

const formatTime = (seconds = 0) => {
  if (!Number.isFinite(seconds)) return '0:00';
  return Math.floor(seconds / 60) + ':' + String(Math.floor(seconds % 60)).padStart(2, '0');
};

export default function App() {
  const [songs, setSongs] = useState(demoSongs);
  const [currentId, setCurrentId] = useState('1');
  const [playing, setPlaying] = useState(false);
  const [view, setView] = useState('Home');
  const [query, setQuery] = useState('');
  const [genre, setGenre] = useState('All');
  const [favorites, setFavorites] = useState(['2', '5']);
  const [userPlaylists, setUserPlaylists] = useState(playlists);
  const [activePlaylist, setActivePlaylist] = useState(null);
  const [queue, setQueue] = useState(demoSongs.map(song => song.id));
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [volume, setVolume] = useState(75);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [mobileNav, setMobileNav] = useState(false);
  const [showQueue, setShowQueue] = useState(false);
  const [toast, setToast] = useState('');
  const audioRef = useRef(null);
  const toastTimer = useRef(null);
  const currentSong = songs.find(song => song.id === currentId) || songs[0];

  function notify(message) {
    setToast(message);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(''), 2400);
  }

  useEffect(() => {
    let active = true;
    fetchSongs().then(remote => {
      if (!active || !Array.isArray(remote) || !remote.length) return;
      const mapped = remote.map((song, index) => ({
        id: String(song.id == null ? index + 1 : song.id),
        title: song.title || song.name || 'Untitled track',
        artist: song.artist || song.artists || 'Unknown artist',
        album: song.album || 'Single',
        duration: song.duration || '0:00',
        cover: song.cover || song.artwork || demoSongs[index % demoSongs.length].cover,
        audioUrl: song.audioUrl || song.audio_url || song.url || '',
        genre: song.genre || 'Other'
      }));
      setSongs(mapped);
      setQueue(mapped.map(song => song.id));
      setCurrentId(mapped[0].id);
    }).catch(() => notify('Music API unavailable — demo songs are loaded.'));
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume / 100;
    if (playing && currentSong && currentSong.audioUrl) {
      audio.play().catch(() => {
        setPlaying(false);
        notify('Could not play this audio URL. Check that it is a direct playable stream.');
      });
    } else {
      audio.pause();
    }
  }, [playing, currentId, volume, currentSong]);

  function advance(direction) {
    const ids = queue.length ? queue : songs.map(song => song.id);
    const currentIndex = Math.max(0, ids.indexOf(currentId));
    const nextIndex = shuffle
      ? Math.floor(Math.random() * ids.length)
      : (currentIndex + direction + ids.length) % ids.length;
    setCurrentId(ids[nextIndex] || (songs[0] && songs[0].id));
    setProgress(0);
    setPlaying(true);
  }

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return undefined;
    const onTime = () => setProgress(audio.currentTime || 0);
    const onMeta = () => setDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
    const onEnded = () => {
      if (repeat) {
        audio.currentTime = 0;
        audio.play().catch(() => setPlaying(false));
      } else {
        advance(1);
      }
    };
    const onError = () => {
      if (playing) {
        setPlaying(false);
        notify('Audio stream could not be loaded.');
      }
    };
    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('loadedmetadata', onMeta);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);
    return () => {
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('loadedmetadata', onMeta);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
    };
  }, [repeat, queue, shuffle, currentId, playing]);

  useEffect(() => {
    const onKey = event => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        document.querySelector('.search-box input')?.focus();
      }
      if (event.code === 'Space' && !['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) {
        event.preventDefault();
        setPlaying(value => !value);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  function playSong(song, list = null) {
    if (!song) return;
    if (list && list.length) setQueue(list.map(item => typeof item === 'string' ? item : item.id));
    if (song.id === currentId) setPlaying(value => !value);
    else {
      setCurrentId(song.id);
      setPlaying(true);
      setProgress(0);
    }
  }

  function previousSong() {
    if (audioRef.current && audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
      return;
    }
    advance(-1);
  }

  function toggleFavorite(id) {
    setFavorites(list => list.includes(id) ? list.filter(item => item !== id) : [...list, id]);
  }

  function createPlaylist() {
    const name = window.prompt('Enter a name for your playlist');
    if (!name || !name.trim()) return;
    const playlist = {
      id: 'custom-' + Date.now(), title: name.trim(), subtitle: 'Created by you',
      cover: songs[0] && songs[0].cover, songIds: []
    };
    setUserPlaylists(list => [playlist, ...list]);
    notify('Playlist created successfully');
  }

  function addToPlaylist(song) {
    const names = userPlaylists.map(playlist => playlist.title).join('\n');
    const name = window.prompt('Add "' + song.title + '" to which playlist? Enter its name:\n' + names);
    if (!name || !name.trim()) return;
    const selected = userPlaylists.find(item => item.title.toLowerCase() === name.trim().toLowerCase());
    if (!selected) return notify('Playlist not found');
    setUserPlaylists(list => list.map(item => {
      if (item.id !== selected.id) return item;
      return { ...item, songIds: [...new Set([...item.songIds, song.id])] };
    }));
    notify('Song added to playlist');
  }

  const genres = ['All', ...new Set(songs.map(song => song.genre).filter(Boolean))];
  const filteredSongs = useMemo(() => {
    let list = [...songs];
    if (view === 'Favourite Songs') list = list.filter(song => favorites.includes(song.id));
    if (view === 'Recently Played') list = list.filter(song => queue.includes(song.id)).slice(0, 8);
    if (activePlaylist) list = list.filter(song => activePlaylist.songIds.includes(song.id));
    if (genre !== 'All') list = list.filter(song => song.genre === genre);
    if (query.trim()) {
      const term = query.toLowerCase();
      list = list.filter(song => [song.title, song.artist, song.album, song.genre]
        .some(value => String(value).toLowerCase().includes(term)));
    }
    return list;
  }, [songs, view, favorites, queue, activePlaylist, genre, query]);

  const isHome = view === 'Home' && !activePlaylist && !query;
  function chooseView(name) {
    setView(name);
    setActivePlaylist(null);
    setGenre('All');
    setMobileNav(false);
  }

  return (
    <div className="app-shell">
      <aside className={'sidebar ' + (mobileNav ? 'sidebar-open' : '')}>
        <div className="brand"><span className="brand-mark"><AudioLines size={22}/></span><span>melo<span className="brand-accent">dify.</span></span></div>
        <div className="sidebar-scroll">
          {navigation.map(group => <div className="nav-group" key={group.title}>
            <p className="nav-heading">{group.title}</p>
            {group.links.map(item => <button key={item.name} className={'nav-link ' + (view === item.name && !activePlaylist ? 'active' : '')} onClick={() => chooseView(item.name)}><item.icon size={18}/><span>{item.name}</span></button>)}
          </div>)}
          <div className="nav-group">
            <div className="nav-heading-row"><p className="nav-heading">PLAYLISTS</p><button className="icon-button small" onClick={createPlaylist} aria-label="Create playlist"><Plus size={16}/></button></div>
            {userPlaylists.map(playlist => <button key={playlist.id} className={'nav-link playlist-nav ' + (activePlaylist && activePlaylist.id === playlist.id ? 'active' : '')} onClick={() => { setActivePlaylist(playlist); setView('Your Playlists'); setGenre('All'); setMobileNav(false); }}><span className="playlist-dot" style={{backgroundImage:'url(' + playlist.cover + ')'}}/><span>{playlist.title}</span></button>)}
          </div>
        </div>
        <div className="sidebar-bottom">
          <div className="upgrade-card"><div className="upgrade-icon"><AudioLines size={18}/></div><strong>Music sounds better together.</strong><p>Your next favourite song is just a click away.</p><button onClick={() => chooseView('Explore')}>Explore music <ChevronRight size={15}/></button></div>
          <button className="nav-link"><CircleHelp size={18}/> Help &amp; support</button>
        </div>
      </aside>

      {mobileNav && <button aria-label="Close navigation" className="mobile-scrim" onClick={() => setMobileNav(false)}/>}

      <main className="main-area">
        <header className="topbar">
          <div className="topbar-left">
            <button className="icon-button mobile-menu" onClick={() => setMobileNav(true)} aria-label="Open menu"><Menu/></button>
            <button className="icon-button back-button" onClick={() => chooseView('Home')} aria-label="Go home"><ChevronLeft/></button>
            <button className="icon-button back-button" onClick={() => notify('You are up to date')} aria-label="Forward"><ChevronRight/></button>
            <div className="search-box"><Search size={18}/><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search songs, artists, albums..." aria-label="Search music"/>{query && <button onClick={() => setQuery('')} aria-label="Clear search"><X size={15}/></button>}<kbd>⌘ K</kbd></div>
          </div>
          <div className="topbar-right"><button className="icon-button notification" onClick={() => notify('You are all caught up')} aria-label="Notifications"><Bell size={19}/><i/></button><div className="profile"><div className="avatar">G</div><div className="profile-text"><strong>Gurpeet</strong><span>Free account</span></div><ChevronDown size={15}/></div></div>
        </header>

        <div className="content-scroll">
          {isHome && <section className="hero-banner">
            <img src="https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=1600&auto=format&fit=crop&q=90" alt="Night sky and stars" className="hero-image"/>
            <div className="hero-overlay"/>
            <div className="hero-content"><span className="eyebrow"><span className="live-dot"/> YOUR DAILY SOUNDTRACK</span><h1>Feel every<br/><em>moment.</em></h1><p>The right music can change everything.<br className="desktop-only"/> Find your sound, find your flow.</p><div className="hero-actions"><button className="primary-button" onClick={() => playSong(songs[0], songs)}><Play size={16} fill="currentColor"/> Start listening</button><button className="ghost-button" onClick={() => chooseView('Explore')}>Explore playlists <ArrowRight size={15}/></button></div></div>
            <div className="hero-note"><span>NOW TRENDING</span><strong>Beyond the ordinary.</strong></div>
          </section>}

          {isHome && <section className="section-block">
            <div className="section-heading"><div><span className="section-kicker">MADE FOR YOU</span><h2>Pick up where you left off</h2></div><button className="text-link" onClick={() => chooseView('Recently Played')}>See all <ChevronRight size={16}/></button></div>
            <div className="quick-grid">{songs.slice(0,6).map(song => <button className="quick-card" key={song.id} onClick={() => playSong(song, songs)}><img src={song.cover} alt=""/><span>{song.title}</span><span className="quick-play"><Play size={15} fill="currentColor"/></span></button>)}</div>
          </section>}

          {isHome && <section className="section-block">
            <div className="section-heading"><div><span className="section-kicker">HANDPICKED FOR YOU</span><h2>Made for your mood</h2></div><button className="text-link" onClick={() => chooseView('Explore')}>View all <ChevronRight size={16}/></button></div>
            <div className="playlist-grid">{userPlaylists.slice(0,4).map((playlist,index) => <button className="playlist-card" key={playlist.id} onClick={() => { setActivePlaylist(playlist); setView('Your Playlists'); }}><div className="playlist-art"><img src={playlist.cover} alt=""/><span className="art-number">0{index+1}</span><span className="playlist-play"><Play fill="currentColor" size={20}/></span></div><strong>{playlist.title}</strong><p>{playlist.subtitle}</p></button>)}</div>
          </section>}

          <section className="section-block songs-section">
            <div className="section-heading"><div><span className="section-kicker">{isHome ? 'THE SOUND OF NOW' : 'YOUR MUSIC'}</span><h2>{(activePlaylist && activePlaylist.title) || (isHome ? 'Trending this week' : (query ? 'Search results' : view))}</h2></div><button className="text-link" onClick={() => { setQuery(''); setActivePlaylist(null); chooseView('Explore'); }}>Browse all <ChevronRight size={16}/></button></div>
            <div className="filter-row"><div className="genre-pills">{genres.map(item => <button key={item} className={genre === item ? 'genre-pill selected' : 'genre-pill'} onClick={() => setGenre(item)}>{item}</button>)}</div><button className="filter-button" onClick={() => setShowQueue(value => !value)}><SlidersHorizontal size={15}/> {showQueue ? 'Hide queue' : 'Show queue'}</button></div>
            <div className="track-table">
              <div className="track-header"><span>#</span><span>TITLE</span><span>ALBUM</span><span>GENRE</span><span>TIME</span><span/></div>
              {filteredSongs.map((song,index) => <div className={'track-row ' + (currentId === song.id ? 'track-active' : '')} key={song.id}>
                <button className="track-index" onClick={() => playSong(song, filteredSongs)}>{currentId === song.id && playing ? <AudioLines size={17}/> : <><span>{String(index+1).padStart(2,'0')}</span><Play className="index-play" size={15} fill="currentColor"/></>}</button>
                <button className="track-title" onClick={() => playSong(song, filteredSongs)}><img src={song.cover} alt=""/><span><strong>{song.title}</strong><small>{song.artist}</small></span></button>
                <span className="track-album">{song.album}</span><span className="track-genre">{song.genre}</span><span className="track-duration">{song.duration}</span>
                <div className="track-actions"><button className={favorites.includes(song.id) ? 'track-action liked' : 'track-action'} onClick={() => toggleFavorite(song.id)} aria-label="Toggle favourite"><Heart size={16} fill={favorites.includes(song.id) ? 'currentColor' : 'none'}/></button><button className="track-action" onClick={() => addToPlaylist(song)} aria-label="Add to playlist"><Plus size={17}/></button><button className="track-action" onClick={() => notify(song.title + ' · ' + song.artist)} aria-label="More options"><Ellipsis size={18}/></button></div>
              </div>)}
              {filteredSongs.length === 0 && <div className="empty-state"><Music2 size={30}/><strong>No songs found</strong><span>Try another search or choose a different category.</span><button className="text-link" onClick={() => { setQuery(''); setGenre('All'); setActivePlaylist(null); }}>Clear filters</button></div>}
            </div>
          </section>

          {showQueue && <section className="section-block queue-panel"><div className="section-heading"><div><span className="section-kicker">UP NEXT</span><h2>Your listening queue</h2></div><button className="text-link" onClick={() => setShowQueue(false)}>Close <X size={15}/></button></div>{queue.map(id => songs.find(song => song.id === id)).filter(Boolean).map(song => <button className="queue-item" key={song.id} onClick={() => playSong(song)}><img src={song.cover} alt=""/><span><b>{song.title}</b><small>{song.artist}</small></span><Play size={15}/></button>)}</section>}

          {isHome && <section className="section-block artists-section"><div className="section-heading"><div><span className="section-kicker">FAN FAVOURITES</span><h2>Popular artists</h2></div><button className="text-link" onClick={() => chooseView('Discover')}>Discover artists <ChevronRight size={16}/></button></div><div className="artist-grid">{artists.map(artist => <button className="artist-card" key={artist.name} onClick={() => { setQuery(artist.name); setView('Discover'); }}><img src={artist.image} alt={artist.name}/><strong>{artist.name}</strong><span>{artist.genre}</span></button>)}</div></section>}

          <footer className="footer"><div className="footer-brand"><AudioLines size={17}/> melodify.</div><span>Made for the love of music.</span><span>© 2026 Melodify</span></footer>
        </div>
      </main>

      <div className="player-bar">
        <audio ref={audioRef} src={(currentSong && currentSong.audioUrl) || ''} preload="metadata"/>
        <div className="player-song"><img src={currentSong && currentSong.cover} alt=""/><div><strong>{(currentSong && currentSong.title) || 'Choose a song'}</strong><span>{(currentSong && currentSong.artist) || 'Your music awaits'}</span></div><button className={favorites.includes(currentId) ? 'track-action liked' : 'track-action'} onClick={() => currentSong && toggleFavorite(currentId)} aria-label="Favourite current song"><Heart size={17} fill={favorites.includes(currentId) ? 'currentColor' : 'none'}/></button></div>
        <div className="player-center">
          <div className="player-controls"><button className={shuffle ? 'control-active' : 'control-muted'} onClick={() => setShuffle(value => !value)} aria-label="Shuffle"><Shuffle size={17}/></button><button onClick={previousSong} aria-label="Previous song"><SkipBack size={19} fill="currentColor"/></button><button className="main-play" onClick={() => currentSong && setPlaying(value => !value)} aria-label={playing ? 'Pause' : 'Play'}>{playing ? <Pause size={19} fill="currentColor"/> : <Play size={19} fill="currentColor"/>}</button><button onClick={() => advance(1)} aria-label="Next song"><SkipForward size={19} fill="currentColor"/></button><button className={repeat ? 'control-active' : 'control-muted'} onClick={() => setRepeat(value => !value)} aria-label="Repeat"><Repeat size={17}/></button></div>
          <div className="progress-row"><span>{formatTime(progress)}</span><input aria-label="Song progress" type="range" min="0" max={duration || 100} value={Math.min(progress,duration || 100)} onChange={event => { const value = Number(event.target.value); setProgress(value); if (audioRef.current) audioRef.current.currentTime = value; }} style={{'--progress':(duration ? progress/duration*100 : 0) + '%'}}/><span>{formatTime(duration)}</span></div>
        </div>
        <div className="player-extra"><button className="control-muted" onClick={() => setShowQueue(value => !value)} aria-label="Toggle queue"><ListMusic size={18}/></button><Volume2 size={18} className="volume-icon"/><input aria-label="Volume" className="volume-range" type="range" min="0" max="100" value={volume} onChange={event => setVolume(Number(event.target.value))} style={{'--progress':volume + '%'}}/></div>
      </div>
      {toast && <div className="toast"><span className="toast-dot"/> {toast}</div>}
    </div>
  );
}