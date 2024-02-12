const router = require('express').Router();
const fs = require('fs');

router
    .get('/icon', (req, res) => {
        const options = [
            'lightred',
            'red',
            'darkred',
            'lightorange',
            'orange',
            'darkorange',
            'yellow',
            'lightgreen',
            'green',
            'darkgreen',
            'lightblue',
            'blue',
            'darkblue',
            'lightpurple',
            'purple',
            'darkpurple',
            'lightpink',
            'pink',
            'darkpink',
            'default'
        ].map(i => fs.readFileSync(`${process.cwd()}/assets/media/logos/${i}.svg`, { encoding: 'utf-8' }))
        res
            .setHeader('Cache-Control', 'no-store')
            .setHeader('Expires', '0')
            .setHeader(`Content-Type`, `image/svg+xml`)
            .send(options.at(Math.floor(Math.random() * options.length)))
    })
    .get('/icon/:name', (req, res) => {
        res
            .setHeader('Cache-Control', 'public, max-age 10800, max-stale 10800, stale-if-error 86400, no-transform, immutable')
            .setHeader(`Content-Type`, `image/svg+xml`)
            .send(fs.readFileSync(`${process.cwd()}/assets/media/logos/${req.params.name.toLowerCase()}.svg`))
    })
    .get('/deficon', (req, res) => {
        res
            .setHeader('Cache-Control', 'public, max-age 10800, max-stale 10800, stale-if-error 86400, no-transform, immutable')
            .setHeader(`Content-Type`, `image/svg+xml`)
            .sendFile(`${process.cwd()}/assets/media/logos/default.svg`)
    })
    .get('/favicon.ico', (req, res) => {
        res
            .setHeader('Cache-Control', 'no-store')
            .setHeader(`Content-Type`, `image/svg+xml`)
            .sendFile(`${process.cwd()}/assets/media/logos/default.svg`)
    })
    .get('/cus', (req, res) => {
        res
            .setHeader('Cache-Control', 'no-store')
            .setHeader(`Content-Type`, `image/svg+xml`)
            .sendFile(`${process.cwd()}/assets/media/images/custom-icon.png`)
    })
    .get('/team/:id', async (req, res) => {
        const imgArrayBuffer = await fetch(`https://api.daad.wtf/discord/user/${req.params.id}/avatar`).then(r => r.arrayBuffer());
        const imgBuffer = Buffer.from(imgArrayBuffer);
        res
            .setHeader('Cache-Control', 'public, max-age 10800, max-stale 10800, stale-if-error 86400, no-transform, immutable')
            .setHeader(`Content-Type`, `image/png`)
            .send(imgBuffer)
    })
    .get('/static/:file', (req, res) => {
        res.sendFile(`${process.cwd()}/assets/media/images/${req.params.file}`);
    })
    .use((req, res, next) => {
        const { path, method } = req;
        const methodUsed = method.toUpperCase();
        let allowedMethods = router.stack.filter(r => r.route && r.route.path === path)
        if (allowedMethods.length == 0) return next();
        allowedMethods.map(r => r.route.stack[0])
        allowedMethods = { ...allowedMethods[0] }
        allowedMethods = allowedMethods.route.methods;
        if (req.method === 'OPTIONS') return res.setHeader('Allow', Object.keys(allowedMethods).map(m => m.toUpperCase()).join(', ')).setHeader('Access-Control-Allow-Methods', Object.keys(allowedMethods).map(m => m.toUpperCase()).join(', ')).status(204).send();
        if (allowedMethods[methodUsed]) return next();
        res.status(405).render(
            `misc/405.pug`,
            req.getErrPage(405, { path, allowedMethods, methodUsed })
        );
    })

module.exports = router;