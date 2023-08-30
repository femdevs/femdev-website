const router = require('express').Router();
const fs = require('fs');

router.get('/static/:file', (req, res) => {
    const file = req.params.file;
    res.sendFile(`${process.cwd()}/assets/media/audio/${file}`);
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