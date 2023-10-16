const RL = new (require('rate-limiter-flexible')).RateLimiterMemory({ points: 30, duration: 1 })

/**
 * @type {import('express').RequestHandler}
 */
module.exports = (req, res, next) => {
    req.Sentry.startSpan(
        { op: "RateLimit", name: "Rate Limit Handler", data: { path: req.path } },
        async () => {
            return RL
                .consume(req.ip, req.originalUrl.startsWith('/assets') ? 1 : 2)
                .then(
                    (data) => {
                        res
                            .setHeader('X-RateLimit-Limit', data.remainingPoints + data.consumedPoints)
                            .setHeader('X-RateLimit-Remaining', data.remainingPoints)
                            .setHeader('X-RateLimit-Reset', data.msBeforeNext);
                        next();
                    },
                    async (rej) => {
                        console.log(rej);
                        res
                            .setHeader('Retry-After', 1000)
                            .status(429)
                            .render(
                                `${req.aprilFools()}misc/429.pug`,
                                {
                                    meta: {
                                        title: '429 - Too Many Requests',
                                        desc: '429 - Too Many Requests',
                                        url: 'https://thefemdevs.com/errors/429',
                                    }
                                }
                            )
                    }
                )
        }
    );
};