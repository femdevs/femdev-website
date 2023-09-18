const router = require('express').Router();

const css = require('./css');
const images = require('./images');
const javascript = require('./javascript');
const font = require('./font');
const audio = require('./audio');
const misc = require('./misc');

router
    .use('/css', css)
    .use('/images', images)
    .use('/js', javascript)
    .use('/f', font)
    .use('/audio', audio)
    .use('/misc', misc)
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

        if (allowedMethods[methodUsed]) return next();
        res.status(405).render(
            `misc/405.pug`,
            {
                title: '405 - Method Not Allowed',
                path,
                allowedMethods: Object.keys(allowedMethods).map(m => m.toUpperCase()).join(', '),
                methodUsed: methodUsed
            }
        );
    })

module.exports = router;