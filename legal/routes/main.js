const router = require('express').Router();

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