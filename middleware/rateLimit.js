const { RateLimiterMemory } = require('rate-limiter-flexible');
const { RequestHandler } = require('express');
/**
 * @param {RateLimiterMemory} rateLimiter
 * @returns {RequestHandler}
 */
module.exports = (rateLimiter) => (function (req, res, next) {
    req.Sentry.startSpan(
        { op: "RateLimit", name: "Rate Limit Handler", data: { path: req.path } },
        async () => {
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
        }
    );
})