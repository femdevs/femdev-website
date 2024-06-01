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
    const req = await fetch('https://api.lanyard.rest/v1/users/1158220643616182445');
    if (req.status === 200) {
        const discord = new Discord();
        const spotify = new Spotify();
        const { data } = await req.json();
        switch (data.discord_status) {
            case 'online':
                discord.status = 'Online';
                break;
            case 'dnd':
                discord.status = 'Do Not Disturb';
                break;
            case 'idle':
                discord.status = 'Idle';
                break;
            default:
                discord.status = 'Offline';
                break;
        }
        discord.activities = data.activities.filter(item => item.id !== 'spotify:1');
        const spotifyData = await fetch('https://ben.thefemdevs.com/api/now-playing').then(res => res.json());
        spotify.playing = spotifyData.isPlaying;
        spotify.track = spotifyData.song ?? {};
        Elements.get('discord').innerText = discord.getString();
        Elements.get('spotify').innerText = spotify.getString();
    };
};

load();

setInterval(async () => await load(), 5e3);
