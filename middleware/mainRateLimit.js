const rateLimiter = require('express-rate-limit');

const baseLimiter = (req, res, next) => {
    req.Sentry.startSpan(
        { op: "RateLimit", name: "Rate Limit Handler", data: { path: req.path } },
        () => {
            return rateLimiter.rateLimit({
                windowMs: 1000,
                max: 25,
                legacyHeaders: false,
                standardHeaders: true,
                handler: (req, res, ...args) => {
                    res
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
                        )
                },
            })(req, res, next);
        }
    );
}

module.exports = baseLimiter;