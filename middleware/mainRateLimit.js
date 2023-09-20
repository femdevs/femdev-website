const rateLimiter = require('express-rate-limit');

const baseLimiter = rateLimiter.rateLimit({
    windowMs: 1000,
    max: 10,
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
    skip: (req, _) => req.path.startsWith('/assets')
});

module.exports = baseLimiter;