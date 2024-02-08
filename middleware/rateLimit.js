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
                res
                    .setHeader('X-RateLimit-Limit', data.remainingPoints + data.consumedPoints)
                    .setHeader('X-RateLimit-Remaining', data.remainingPoints)
                    .setHeader('X-RateLimit-Reset', data.msBeforeNext);
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