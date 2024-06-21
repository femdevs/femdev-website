/** @type {Map<string, HTMLElement>} */
const Elements = new Map();

Elements
    .set('spotifyTrack', document.getElementById('spotifytrack'))
    .set('spotifyArtist', document.getElementById('spotifyartist'))
    .set('spotifyAlbum', document.getElementById('spotifyalbum'))
    .set('spotify', document.getElementById('spotify'))
    .set('discordStatus', document.getElementById('discordstatus'))
    .set('discordActivity', document.getElementById('discordactivity'))
    .set('discord', document.getElementById('discord'));

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
    setStatus(status) {
        switch (status) {
            case 'online': return Object.assign(this, { status: 'Online' });
            case 'dnd': return Object.assign(this, { status: 'Do Not Disturb' });
            case 'idle': return Object.assign(this, { status: 'Idle' });
            default: return Object.assign(this, { status: 'Offline' });
        }
    }
    setActivities(activities) {
        return Object.assign(this, { activities });
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
        const LF = new Intl.ListFormat('en-US', { style: 'long', type: 'conjunction' });
        const NoFeatRegex = / *\(.*(ft|feat|with).*\)/gmi;
        return [
            this.track.name.replace(NoFeatRegex, '') || 'Nothing',
            LF.format(this.track.artists).replace(NoFeatRegex, '') || 'None',
            this.track.album.replace(NoFeatRegex, '') || 'None',
        ];
    }
    setPlaying(playing) {
        return Object.assign(this, { playing });
    }
    setTrack(track) {
        return Object.assign(this, { track });
    }
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
        ['Status', 'Activity']
            .forEach((item, index) => Elements.get(`discord${item}`).innerText = DiscordString[index]);
        ['Track', 'Artist', 'Album']
            .forEach((item, index) => Elements.get(`spotify${item}`).innerText = SpotifyString[index]);
        Elements.get('discord').style.cursor = 'pointer';
        Elements.get('discord').onclick = () => window.open(`https://discord.com/users/${id}`, '_blank');
        Elements.get('spotify').style.cursor = SpotifyString[0] === 'Track: Nothing' ? 'default' : 'pointer';
        Elements.get('spotify').onclick = () => window.open(spotify.track.url, '_blank');
};