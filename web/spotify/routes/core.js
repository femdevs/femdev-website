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
        res.json(await spotifyApi.getMyCurrentPlaybackState({}).then(data => {
            const { body } = data;
            if (!new Object(body).hasOwnProperty('item')) return {
                isPlaying: false,
                song: {
                    name: 'Nothing',
                    album: 'Nothing',
                    artists: ['None'],
                    url: 'https://open.spotify.com',
                },
            };
            const { name, album, artists, external_urls } = body.item;
            return {
                isPlaying: true,
                song: {
                    name: name,
                    album: album.name,
                    artists: artists.map(artist => artist.name),
                    url: external_urls.spotify,
                },
            };
        }));
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
