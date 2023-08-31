const router = require('express').Router();
const fs = require('fs');
const icons = require('./icons');

router.use('/icons', icons);

router.get('/favicon.ico', (req, res) => {
    res
        .setHeader('Cache-Control', 'no-cache')
        .setHeader(`Content-Type`, `image/svg+xml`)
        .sendFile(`${process.cwd()}/assets/media/logos/icon`)
});

router.get(`/bg`, (req, res) => {
    res
        .setHeader('Cache-Control', 'no-cache')
        .setHeader(`Content-Type`, `image/svg+xml`)
        .sendFile(`${process.cwd()}/assets/media/images/background.svg`)
});

router.get('/static/:file', (req, res) => {
    const file = req.params.file;
    res.sendFile(`${process.cwd()}/assets/media/images/${file}`);
});

router.use((req, res, next) => {
    const { path, method } = req;
    const methodUsed = method.toUpperCase();
    let allowedMethods = router.stack
        .filter(r => r.route && r.route.path === path)
    if (allowedMethods.length == 0) return next();

    // find the allowed methods for the path
    allowedMethods
        .map(r => r.route.stack[0])
    allowedMethods = {...allowedMethods[0]}
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