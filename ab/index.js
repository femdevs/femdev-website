const leadRouter = require('express').Router();
require('dotenv').config();

const router = require('./routes/router');

leadRouter
    .use((req, res, next) => {
        req.RateLimitMem
            .consume(req.ip, 2)
            .then(
                (data) => {
                    const { remainingPoints: r, consumedPoints: c, msBeforeNext: m } = data;
                    res
                        .setHeader('X-RateLimit-Limit', r + c)
                        .setHeader('X-RateLimit-Remaining', r)
                        .setHeader('X-RateLimit-Reset', m);
                    next();
                },
                (rej) => {
                    res
                        .setHeader('Retry-After', 1000)
                        .status(429)
                        .render(
                            'misc/429.pug',
                            req.getErrPage(429, {})
                        )
                }
            )
    })
    .use(router)
    .use((req, res, next) => {
        const { path } = req;
        const methodUsed = req.method.toUpperCase();
        let allowedMethods = leadRouter.stack.filter(r => r.route && r.route.path === path)
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
    });

module.exports = leadRouter;