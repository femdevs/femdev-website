/* eslint-disable camelcase */
const router = require('express').Router();
const SpotifyWebApi = require("spotify-web-api-node");
const spotifyApi = new SpotifyWebApi({
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    redirectUri: process.env.SPOTIFY_REDIRECT_URI,
});
const scopes = ["user-read-private", "user-read-currently-playing", "user-read-playback-state", "user-read-email"];
const authorizeURL = spotifyApi.createAuthorizeURL(scopes);

router
    .use('/auth', async (req, res) => {
        if (req.query.code)
            await spotifyApi.authorizationCodeGrant(req.query.code).then(data => res.json(data.body));
        else
            res.redirect(authorizeURL);
    })
    .get("/playing/:user", async (req, res) => {
        const { user } = req.params;
        const connection = await req.Database.pool.connect();
        const { rows: userRows } = await connection.query(`SELECT * FROM public.spotify;`);
        connection.release();
        const spotifyUser = userRows.find(row => row.user === user);
        if (!spotifyUser) return res.status(404).json({ error: 'User not found' });
        const { access, refresh } = spotifyUser;
        spotifyApi.setAccessToken(access);
        spotifyApi.setRefreshToken(refresh);
        const { body: { access_token: newAccess } } = await spotifyApi.refreshAccessToken();
        spotifyApi.setAccessToken(newAccess);
        const { body } = await spotifyApi.getMyCurrentPlaybackState({ market: 'US' });
        if (!new Object(body).hasOwnProperty('item')) return res.json({
            isPlaying: false,
            playing: {
                isPlaying: false,
                playing: {
                    track: {
                        title: 'Nothing playing',
                        url: null,
                    },
                    album: {
                        title: 'Nothing playing',
                        artists: [],
                        image: null,
                    },
                    artists: [],
                    meta: {
                        progress: {
                            start: 0,
                            end: 0,
                            current: 0,
                            percentage: 0,
                        },
                    },
                },
            },
        });
        /** @type {SpotifyApi.TrackObjectFull} */
        const item = body.item;
        const { name, album, artists, external_urls } = item;
        const data = {
            track: {
                title: name,
                url: external_urls.spotify,
            },
            album: {
                title: album.name,
                artists: [],
                image: album.images.find(sDat => sDat.width === 64e1).url,
            },
            artists: [],
            meta: {
                progress: {
                    start: Date.now() - body.progress_ms,
                    end: Date.now() + (body.item.duration_ms - body.progress_ms),
                    current: body.progress_ms,
                    percentage: (body.progress_ms / body.item.duration_ms) * 1e2,
                },
            },
        };
        for (const artist of artists) {
            data.artists.push(
                await spotifyApi.getArtist(artist.id)
                    .then(dat => ({
                        name: dat.body.name,
                        image: dat.body.images.find(({ width }) => width === 64e1).url,
                        url: dat.body.external_urls.spotify,
                    })),
            );
        }
        for (const albumArtist of album.artists) {
            data.album.artists.push(
                await spotifyApi.getArtist(albumArtist.id)
                    .then(dat => ({
                        name: dat.body.name,
                        image: dat.body.images.find(({ width }) => width === 64e1).url,
                        url: dat.body.external_urls.spotify,
                    })),
            );
        }
        const returnData = {
            isPlaying: true,
            playing: data,
        };
        res.json(returnData);
    })
    .use((req, res, next) => {
        const { path } = req;
        const methodUsed = req.method.toUpperCase();
        let allowedMethods = router.stack.filter(routerObj => routerObj.route && routerObj.route.path === path);
        if (allowedMethods.length === 0) return next();
        allowedMethods.map(routerObj => routerObj.route.stack[0]);
        allowedMethods = { ...allowedMethods[0] };
        allowedMethods = allowedMethods.route.methods;
        if (req.method === 'OPTIONS')
            return res.setHeader('Allow', Object.keys(allowedMethods)
                .map(verb => verb.toUpperCase()).join(', '))
                .setHeader('Access-Control-Allow-Methods', Object.keys(allowedMethods).map(verb => verb.toUpperCase()).join(', '))
                .status(204)
                .send();
        if (allowedMethods[methodUsed]) return next();
        return res.status(405).render(
            "misc/405.pug",
            req.getErrPage(405, { path, allowedMethods, methodUsed }),
        );
    });

module.exports = router;
