const { RateLimiterMemory } = require('rate-limiter-flexible');
/**
 * @param {RateLimiterMemory} rateLimiter
 * @returns {import('express').RequestHandler}
 */
module.exports = (rateLimiter) => (function (req, res, next) {
    rateLimiter
        .consume(req.ip, (req.originalUrl.startsWith('/assets') ? 1 : 2))
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