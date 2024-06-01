/* eslint-disable camelcase */
const router = require('express').Router();
const SpotifyWebApi = require("spotify-web-api-node");
const spotifyApi = new SpotifyWebApi({
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    redirectUri: process.env.SPOTIFY_REDIRECT_URI,
});
spotifyApi.setAccessToken(process.env.SPOTIFY_ACCESS_TOKEN);
spotifyApi.setRefreshToken(process.env.SPOTIFY_REFRESH_TOKEN);
const refresh = () => spotifyApi.refreshAccessToken().then(({ body: { access_token } }) => spotifyApi.setAccessToken(access_token));
setInterval(refresh, 3e5);
refresh();
router
    .get("/now-playing", async (req, res) => {
        res.json(await spotifyApi.getMyCurrentPlaybackState({}).then(data => {
            const { body } = data;
            if (!new Object(body).hasOwnProperty('item')) return { isPlaying: false };
            const { name, album, artists, external_urls } = body.item;
            const song = {
                name,
                album: album.name,
                artists: artists.map(artist => artist.name),
                url: external_urls.spotify,
            };
            return {
                isPlaying: true,
                song,
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
