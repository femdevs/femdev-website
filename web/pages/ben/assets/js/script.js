/** @type {Map<string, HTMLElement>} */
const Elements = new Map();

Elements
    .set('spotify', document.getElementById('spotify'))
    .set('discord', document.getElementById('discord'));

const load = async () => {
    const req = await fetch('https://api.lanyard.rest/v1/users/1158220643616182445');
    const importantData = {
        discord: {
            status: 'offline',
            activities: [],
        },
        spotify: {
            playing: false,
            track: {
                name: 'Nothing',
                album: 'Nothing',
                artists: [],
                url: 'https://open.spotify.com',
            },
        },
    };
    if (req.status === 200) {
        const { data } = await req.json();
        importantData.discord.status = data.discord_status === 'online' ? 'Online'
            : data.discord_status === 'dnd' ? 'Do Not Disturb'
                : data.discord_status === 'idle' ? 'Idle'
                    : 'Offline';
        importantData.discord.activities = data.activities
            .map(({ state, id }) => ({
                state,
                id,
            }))
            .filter(item => item.id !== 'spotify:1');
        if (data.spotify) {
            Object.assign(importantData.spotify, {
                playing: data.listening_to_spotify,
                track: {
                    name: data.spotify.song,
                    album: data.spotify.album,
                    artists: data.spotify.artist.split(';').map(art => art.trim()),
                    url: `https://open.spotify.com/track/${data.spotify.track_id}`,
                },
            });
        }
        let discordString = `${importantData.discord.status} `;
        if (importantData.discord.activities.length > 0)
            discordString += "- " + importantData.discord.activities[0].state;
        Elements.get('discord').innerText = discordString;
        let spotifyString = `${importantData.spotify.playing ? 'Playing' : 'Not Playing'} `;
        if (importantData.spotify.playing)
            spotifyString += `${importantData.spotify.track.name} by ${importantData.spotify.track.artists.slice(0, 2).join(', ')}`;
        Elements.get('spotify').innerText = spotifyString;
    };
};

load();

setInterval(async () => await load(), 5e3);
