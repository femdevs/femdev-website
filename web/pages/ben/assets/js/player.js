class Spotify {
    constructor() {
        this.playing = false;
        this.song = {
            track: {
                title: 'Nothing playing',
                url: null,
            },
            album: {
                title: 'Nothing playing',
                /** @type {Array<{name: string, image: string, url: string}>} */
                artists: [],
                image: null,
            },
            /** @type {Array<{name: string, image: string, url: string}>} */
            artists: [],
            meta: {
                progress: {
                    start: 0,
                    end: 0,
                    current: 0,
                    percentage: 0,
                },
            },
        };
    }
    getString() {
        const LF = new Intl.ListFormat('en-US', { style: 'long', type: 'conjunction' });
        const NoFeatRegex = / *\(.*(ft|feat|with).*\)/gmi;
        return [
            this.song.track.title.replace(NoFeatRegex, '') || 'Nothing',
            LF.format(this.song.artists.map(art => art.name || 'None')).replace(NoFeatRegex, ''),
            this.song.album.title.replace(NoFeatRegex, '') || 'None',
        ];
    }
    setPlaying = playing => Object.assign(this, { playing });
    setTrack = song => Object.assign(this, { song });
}

async function fetchNowPlaying() {
    const response = await fetch('https://spotify.thefemdevs.com/playing/ben');
    const data = await response.json();

    const spotify = new Spotify();
    spotify.setPlaying(data.isPlaying);
    spotify.setTrack(spotify.playing);

    const AlbumCSS = `
.album-cover::before {
    background-image: url('https://via.placeholder.com/300');
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-size: cover;
    background-position: center;
    filter: blur(15px);
    z-index: 0;
}`;

    if (spotify.playing) {
        const strings = spotify.getString();
        document.getElementById('album-cover').src = spotify.song.album.image;
        document.getElementById('bg').innerHTML = AlbumCSS.replace(/(url\(.*\))/gmi, `url('${spotify.song.album.image}')`);
        document.getElementById('song-title').textContent = strings[0];
        document.getElementById('artist-name').textContent = strings[1];
        const pad = num => num.toString().padStart(2, '0');
        const currentTime = Math.floor(spotify.song.meta.progress.current / 1000);
        const duration = Math.floor((spotify.song.meta.progress.end - spotify.song.meta.progress.start) / 1000);
        document.getElementById('progress-bar').style.width = `${spotify.song.meta.progress.percentage}%`;
        document.getElementById('current-time').textContent = `${pad(Math.floor(currentTime / 60))}:${pad(currentTime % 60)}`;
        document.getElementById('duration-time').textContent = `${pad(Math.floor(duration / 60))}:${pad(duration % 60)}`;
    } else {
        document.getElementById('album-cover').src = 'https://via.placeholder.com/300';
        document.getElementById('bg').innerHTML = AlbumCSS;
        document.getElementById('song-title').textContent = 'Nothing';
        document.getElementById('artist-name').textContent = 'No One';
        document.getElementById('current-time').textContent = `--:--`;
        document.getElementById('duration-time').textContent = '--:--';
    }
}

setInterval(fetchNowPlaying, 1000); // Update every second
