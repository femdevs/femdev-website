/** @type {Map<string, HTMLElement>} */
const Elements = new Map();

Elements
    .set('spotify', document.getElementById('spotify'))
    .set('discord', document.getElementById('discord'));

class Discord {
    constructor() {
        this.status = 'offline';
        this.activities = [];
    }
    getString() {
        return `${this.status} - ${this.activities[0]?.state || 'No Activities'}`;
    }
}

class Spotify {
    constructor() {
        this.playing = false;
        this.track = {
            name: 'Nothing',
            album: 'Nothing',
            artists: [],
            url: 'https://open.spotify.com',
        };
    }
    getString() {
        return this.playing
            ? `${this.track.name} by ${this.track.artists.slice(0, 2).join(', ')}`
            : 'Not Playing';
    }
}

const load = async () => {
    const req = await fetch('https://api.lanyard.rest/v1/users/1112774630416076850');
    if (req.status === 200) {
        const discord = new Discord();
        const spotify = new Spotify();
        const { data } = await req.json();
        discord.status = data.discord_status === 'online' ? 'Online'
            : data.discord_status === 'dnd' ? 'Do Not Disturb'
                : data.discord_status === 'idle' ? 'Idle'
                    : 'Offline';
        discord.activities = data.activities
            .filter(item => item.id !== 'spotify:1');
        if (data.spotify) {
            spotify.playing = data.listening_to_spotify;
            spotify.track = {
                name: data.spotify.song,
                album: data.spotify.album,
                artists: data.spotify.artist.split(';').map(art => art.trim()),
                url: `https://open.spotify.com/track/${data.spotify.track_id}`,
            };
        }
        Elements.get('discord').innerText = discord.getString();
        Elements.get('spotify').innerText = spotify.getString();
    };
};

load();

setInterval(async () => await load(), 5e3);
