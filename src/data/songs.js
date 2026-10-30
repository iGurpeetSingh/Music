const covers = {
  amber: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=640&auto=format&fit=crop&q=85',
  blue: 'https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=640&auto=format&fit=crop&q=85',
  purple: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=640&auto=format&fit=crop&q=85',
  green: 'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=640&auto=format&fit=crop&q=85',
  rose: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=640&auto=format&fit=crop&q=85',
  ocean: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=640&auto=format&fit=crop&q=85'
};
const audio = [1,2,3,4,5,6,7,8].map(n => 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-' + n + '.mp3');
const rows = [
 ['Midnight City','M83','Hurry Up, We’re Dreaming','amber','Electronic','3:58'],
 ['Golden Hour','JVKE','this is what ____ feels like','rose','Pop','3:29'],
 ['Ocean Eyes','Billie Eilish','dont smile at me','blue','Indie','3:20'],
 ['Sunset Lover','Petit Biscuit','Presence','green','Electronic','3:57'],
 ['After Dark','Mr.Kitty','Time','purple','Synthwave','4:17'],
 ['The Nights','Avicii','The Days / Nights','ocean','Dance','2:56'],
 ['Blinding Lights','The Weeknd','After Hours','blue','Pop','3:20'],
 ['Experience','Ludovico Einaudi','In A Time Lapse','ocean','Classical','5:15'],
 ['Heat Waves','Glass Animals','Dreamland','rose','Indie','3:59'],
 ['A Moment Apart','ODESZA','A Moment Apart','amber','Electronic','3:54'],
 ['Night Changes','One Direction','FOUR','blue','Pop','3:46'],
 ['Intro','The xx','xx','purple','Alternative','2:07']
];
export const demoSongs = rows.map((r,i) => ({ id:String(i+1), title:r[0], artist:r[1], album:r[2], cover:covers[r[3]], genre:r[4], duration:r[5], audioUrl:audio[i%audio.length] }));
export const playlists = [
 {id:'p1',title:'Late Night Vibes',subtitle:'For the quiet hours',cover:covers.purple,songIds:['1','5','8','10']},
 {id:'p2',title:'Feel Good',subtitle:'A little joy, on repeat',cover:covers.rose,songIds:['2','6','7','9']},
 {id:'p3',title:'Focus Flow',subtitle:'Find your frequency',cover:covers.green,songIds:['4','8','10','12']},
 {id:'p4',title:'Electronic Dreams',subtitle:'Lose yourself in sound',cover:covers.amber,songIds:['1','4','5','10']}
];
export const artists = [
 {name:'The Weeknd',genre:'Pop · R&B',image:'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=320&auto=format&fit=crop&q=85'},
 {name:'Billie Eilish',genre:'Alternative pop',image:'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=320&auto=format&fit=crop&q=85'},
 {name:'Avicii',genre:'Electronic',image:'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=320&auto=format&fit=crop&q=85'},
 {name:'JVKE',genre:'Pop',image:'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=320&auto=format&fit=crop&q=85'}
];