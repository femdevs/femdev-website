const express = require('express');
const router = express.Router();

// Legal Pages including Privacy Policy and Terms and Conditions

router.get('/privacy', (req, res) => {
    res
        .setHeader('Max-Age', 60 * 60 * 24 * 30)
        .setHeader('Cache-Control', 'public')
        .setHeader('Content-Type', 'text/html; charset=utf-8')
        .render(`legal/privacy.pug`, { title: 'Privacy Policy' });
});

router.get('/terms', (req, res) => {
    res
        .setHeader('Max-Age', 60 * 60 * 24 * 30)
        .setHeader('Cache-Control', 'public')
        .setHeader('Content-Type', 'text/html; charset=utf-8')
        .render(`legal/TaC.pug`, { title: 'Terms and Conditions' });
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