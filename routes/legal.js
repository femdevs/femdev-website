const router = require('express').Router();
const { aprilFools } = require('../functions/utilities');

// Legal Pages including Privacy Policy and Terms and Conditions

router
    .get('/privacy', (req, res) => {
        res
            .setHeader('Max-Age', 60 * 60 * 24 * 30)
            .setHeader('Cache-Control', 'public')
            .setHeader('Content-Type', 'text/html; charset=utf-8')
            .render(
                `legal/privacy.pug`,
                {
                    meta: {
                        title: 'Privacy Policy',
                        desc: 'Privacy Policy',
                        url: 'https://thefemdevs.com/legal/privacy',
                    }
                }
            );
    })
    .get('/terms', (req, res) => {
        res
            .setHeader('Max-Age', 60 * 60 * 24 * 30)
            .setHeader('Cache-Control', 'public')
            .setHeader('Content-Type', 'text/html; charset=utf-8')
            .render(
                `legal/TaC.pug`,
                {
                    meta: {
                        title: 'Terms and Conditions',
                        desc: 'Terms and Conditions',
                        url: 'https://thefemdevs.com/legal/terms',
                    }
                }
            );
    })
    .get('/cookies', (req, res) => {
        res
            .setHeader('Max-Age', 60 * 60 * 24 * 30)
            .setHeader('Cache-Control', 'public')
            .setHeader('Content-Type', 'text/html; charset=utf-8')
            .render(
                `legal/cookies.pug`,
                {
                    meta: {
                        title: 'Cookie Policy',
                        desc: 'Cookie Policy',
                        url: 'https://thefemdevs.com/legal/cookies',
                    }
                }
            );
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

        if (allowedMethods[methodUsed]) return next();
        res.status(405).render(
            `${aprilFools() ? 'aprilfools/' : ''}misc/405.pug`,
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