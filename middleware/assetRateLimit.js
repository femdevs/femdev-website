const rateLimiter = require('express-rate-limit');

const assetsLimiter = rateLimiter.rateLimit({
    windowMs: 1000,
    max: 25,
    legacyHeaders: false,
    standardHeaders: true,
    handler: (_, res, ...args) => res
        .status(429)
        .render(
            `misc/429.pug`,
            {
                title: '429 - Too Many Requests',
                meta: {
                    title: '429 - Too Many Requests',
                    desc: '429 - Too Many Requests',
                    url: 'https://thefemdevs.com/errors/429'
                }
            }
        ),
});

module.exports = assetsLimiter;