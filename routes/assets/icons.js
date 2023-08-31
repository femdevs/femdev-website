const router = require('express').Router();

router
    .use((req, res, next) => {
        res
            .setHeader('Cache-Control', 'no-cache')
            .setHeader(`Content-Type`, `image/svg+xml`)
        next();
    })
    .get('/lightred', (req, res) => {
        res
            .sendFile(`${process.cwd()}/assets/media/logos/lightred.svg`)
    })
    .get('/red', (req, res) => {
        res
            .sendFile(`${process.cwd()}/assets/media/logos/red.svg`)
    })
    .get('/darkred', (req, res) => {
        res
            .sendFile(`${process.cwd()}/assets/media/logos/darkred.svg`)
    })
    .get('/lightorange', (req, res) => {
        res
            .sendFile(`${process.cwd()}/assets/media/logos/lightorange.svg`)
    })
    .get('/orange', (req, res) => {
        res
            .sendFile(`${process.cwd()}/assets/media/logos/orange.svg`)
    })
    .get('/darkorange', (req, res) => {
        res
            .sendFile(`${process.cwd()}/assets/media/logos/darkorange.svg`)
    })
    .get('/yellow', (req, res) => {
        res
            .sendFile(`${process.cwd()}/assets/media/logos/yellow.svg`)
    })
    .get('/lightgreen', (req, res) => {
        res
            .sendFile(`${process.cwd()}/assets/media/logos/lightgreen.svg`)
    })
    .get('/green', (req, res) => {
        res
            .sendFile(`${process.cwd()}/assets/media/logos/green.svg`)
    })
    .get('/darkgreen', (req, res) => {
        res
            .sendFile(`${process.cwd()}/assets/media/logos/dakrgreen.svg`)
    })
    .get('/lightblue', (req, res) => {
        res
            .sendFile(`${process.cwd()}/assets/media/logos/lightblue.svg`)
    })
    .get('/blue', (req, res) => {
        res
            .sendFile(`${process.cwd()}/assets/media/logos/blue.svg`)
    })
    .get('/darkblue', (req, res) => {
        res
            .sendFile(`${process.cwd()}/assets/media/logos/darkblue.svg`)
    })
    .get('/lightpurple', (req, res) => {
        res
            .sendFile(`${process.cwd()}/assets/media/logos/lightpurple.svg`)
    })
    .get('/purple', (req, res) => {
        res
            .sendFile(`${process.cwd()}/assets/media/logos/purple.svg`)
    })
    .get('/darkpurple', (req, res) => {
        res
            .sendFile(`${process.cwd()}/assets/media/logos/darkpurple.svg`)
    })
    .get('/lightpink', (req, res) => {
        res
            .sendFile(`${process.cwd()}/assets/media/logos/lightpink.svg`)
    })
    .get('/pink', (req, res) => {
        res
            .sendFile(`${process.cwd()}/assets/media/logos/pink.svg`)
    })
    .get('/darkpink', (req, res) => {
        res
            .sendFile(`${process.cwd()}/assets/media/logos/darkpink.svg`)
    })
    .get('/default', (req, res) => {
        res
            .sendFile(`${process.cwd()}/assets/media/logos/icon.svg`)
    })
    .get('/', (req, res) => {
        res
            .sendFile(`${process.cwd()}/assets/media/logos/icon.svg`)
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