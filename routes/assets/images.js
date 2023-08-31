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
            .setHeader('Cache-Control', 'no-cache')
            .setHeader(`Content-Type`, `image/svg+xml`)
            .sendFile(`${process.cwd()}/assets/media/logos/${selection}.svg`)
    })
    .get('/deficon', (req, res) => {
        res
            .setHeader('Cache-Control', 'no-cache')
            .setHeader(`Content-Type`, `image/svg+xml`)
            .sendFile(`${process.cwd()}/assets/media/logos/default.svg`)
    })
    .get('/favicon.ico', (req, res) => {
        res
            .setHeader('Cache-Control', 'no-cache')
            .setHeader(`Content-Type`, `image/svg+xml`)
            .sendFile(`${process.cwd()}/assets/media/logos/icon`)
    })
    .get(`/bg`, (req, res) => {
        res
            .setHeader('Cache-Control', 'no-cache')
            .setHeader(`Content-Type`, `image/svg+xml`)
            .sendFile(`${process.cwd()}/assets/media/images/background.svg`)
    })
    .get('/static/:file', (req, res) => {
        const file = req.params.file;
        res.sendFile(`${process.cwd()}/assets/media/images/${file}`);
    })
    .use((req, res, next) => {
        const { path, method } = req;
        const methodUsed = method.toUpperCase();
        let allowedMethods = router.stack
            .filter(r => r.route && r.route.path === path)
        if (allowedMethods.length == 0) return next();

        // find the allowed methods for the path
        allowedMethods
            .map(r => r.route.stack[0])
        allowedMethods = { ...allowedMethods[0] }
        allowedMethods = allowedMethods.route.methods;

        if (allowedMethods[methodUsed]) {
            return next();
        } else {
            res.status(405).render(
                `misc/405.pug`,
                {
                    title: '405 - Method Not Allowed',
                    path,
                    allowedMethods: Object.keys(allowedMethods).map(m => m.toUpperCase()).join(', '),
                    methodUsed: methodUsed
                }
            );
        }
    })

module.exports = router;