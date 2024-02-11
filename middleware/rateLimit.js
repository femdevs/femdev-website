const { RateLimiterMemory } = require('rate-limiter-flexible');

const RateLimiter = new RateLimiterMemory({
    points: 30,
    duration: 1,
})

module.exports = {
    main: (req, res, next) => RateLimiter
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
        ),
    assets: (req, res, next) => RateLimiter
        .consume(req.ip, 1)
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
}