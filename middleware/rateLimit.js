const { RateLimiterMemory } = require('rate-limiter-flexible');

const baseRateLimiter = new RateLimiterMemory({
    points: 10,
    duration: 1,
})

const assetRateLimiter = new RateLimiterMemory({
    points: 20,
    duration: 1,
})

const baseLimiter = (req, res, next) => {
    req.Sentry.startSpan(
        { op: "RateLimit", name: "Rate Limit Handler", data: { path: req.path } },
        async () => {
            (req.originalUrl.startsWith('/assets') ? assetRateLimiter : baseRateLimiter)
                .consume(req.ip)
                .then((data) => {
                    //success
                    res
                        .setHeader('X-RateLimit-Limit', data.remainingPoints + data.consumedPoints)
                        .setHeader('X-RateLimit-Remaining', data.remainingPoints)
                        .setHeader('X-RateLimit-Reset', data.msBeforeNext);
                    next();
                })
                .catch((rej) => {
                    //failure
                    res
                        .setHeader('Retry-After', 1000)
                        .status(429)
                        .render(
                            'misc/429.pug',
                            {
                                meta: {
                                    title: '429 - Too Many Requests',
                                    desc: '429 - Too Many Requests',
                                    url: 'https://thefemdevs.com/errors/429',
                                }
                            }
                        )
                })
        }
    );
}

module.exports = baseLimiter;