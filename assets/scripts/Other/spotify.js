/** @type {Map<string, HTMLElement>} */
const Elements = new Map();

[['spotify', ['', 'track', 'artist', 'album']], ['discord', ['', 'status', 'activity']]]
    .forEach(([name, keys]) => {
        const formattedKeys = keys.map(key => `${name}${key.charAt(0).toUpperCase()}${key.slice(1)}`);
        for (const key of formattedKeys) Elements.set(key, document.getElementById(key.toLowerCase()));
    });

class Discord {
    constructor() {
        this.status = 'offline';
        this.activities = [];
    }
    getString() {
        const customStatus = this.activities.find(item => item.type === 4);
        return [
            this.status,
            customStatus ? customStatus.state : this.activities[0]?.name || 'Nothing',
        ];
    }
    setStatus = (status) =>
        Object.assign(this, {
            status:
                status === 'online'
                    ? 'Online'
                    : status === 'dnd'
                        ? 'Do Not Disturb'
                        : status === 'idle'
                            ? 'Idle'
                            : 'Offline',
        })
    setActivities = (activities) => Object.assign(this, { activities });
}

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
            LF.format(this.song.artists.map(art => art.name)).replace(NoFeatRegex, '') || 'None',
            this.song.album.title.replace(NoFeatRegex, '') || 'None',
        ];
    }
    setPlaying = (playing) => Object.assign(this, { playing });
    setTrack = (song) => Object.assign(this, { song });
}

export const LoadData = async (user, id) => {
    const req = await fetch(`https://api.lanyard.rest/v1/users/${id}`);
    const spotifyReq = await fetch(`https://spotify.thefemdevs.com/playing/${user}`);
    const
        discord = new Discord(),
        spotify = new Spotify(),
        { data } = await req.json(),
        spotifyData = await spotifyReq.json();
    discord
        .setStatus(data.discord_status)
        .setActivities(data.activities);
    spotify
        .setPlaying(spotifyData.isPlaying)
        .setTrack(spotifyData.song);
    const
        DiscordString = discord.getString(),
        SpotifyString = spotify.getString();
    if (Elements.get('discord')) {
        ['Status', 'Activity']
            .forEach((item, index) => Elements.get(`discord${item}`).innerText = DiscordString[index]);
        Elements.get('discord').style.cursor = 'pointer';
        Elements.get('discord').onclick = () => window.open(`https://discord.com/users/${id}`, '_blank');
    }
    if (Elements.get('spotify')) {
        ['Track', 'Artist', 'Album']
            .forEach((item, index) => Elements.get(`spotify${item}`).innerText = SpotifyString[index]);
        Elements.get('spotify').style.cursor = SpotifyString[0] === 'Nothing' ? 'default' : 'pointer';
        Elements.get('spotify').onclick = () => window.open(spotify.song.track.url, '_blank');
    }
};