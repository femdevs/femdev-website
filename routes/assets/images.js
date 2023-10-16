const router = require('express').Router();

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
        ]
        const selection = options[Math.floor(Math.random() * options.length)]
        res
            .setHeader('Cache-Control', 'no-store')
            .setHeader(`Content-Type`, `image/svg+xml`)
            .sendFile(`${process.cwd()}/assets/media/logos/${selection}.svg`)
    })
    .get('/icon/:name', (req, res) => {
        res
            .setHeader('Cache-Control', 'public, max-age 10800, max-stale 10800, stale-if-error 86400, no-transform, immutable')
            .setHeader(`Content-Type`, `image/svg+xml`)
            .sendFile(`${process.cwd()}/assets/media/logos/${req.params.name.toLowerCase()}.svg`)
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
        res.sendFile(`${process.cwd()}/assets/media/images/custom-icon.png`)
    })
    .get('/team/:name', (req, res) => {
        res
            .setHeader('Cache-Control', 'public, max-age 10800, max-stale 10800, stale-if-error 86400, no-transform')
            .setHeader(`Content-Type`, `image/webp`)
            .sendFile(`${process.cwd()}/assets/media/team_avatars/${req.params.name.toLowerCase()}.webp`)
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
            `${req.aprilFools()}misc/405.pug`,
            {
                errData: {
                    path,
                    allowedMethods: Object.keys(allowedMethods).map(m => m.toUpperCase()).join(', '),
                    methodUsed: methodUsed,
                },
                meta: {
                    title: '405 - Method Not Allowed',
                    desc: '405 - Method Not Allowed',
                    url: 'https://thefemdevs.com/errors/405',
                }
            }
        );
    })

module.exports = router;