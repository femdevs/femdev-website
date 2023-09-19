//- Packages
const router = require('express').Router();
const rateLimiter = require('express-rate-limit');
const session = require('express-session');
const MemoryStore = require('memorystore')(session);
const Sentry = require('@sentry/node');
const Tracing = require('@sentry/tracing');
const Intigrations = require('@sentry/integrations');

//- Routes
const website = require('./main');
const cdn = require('./cdn');
const legal = require('./legal');
const error = require('./errors');
const ab = require('./ab');
const assets = require('./assets/router');
const auth = require('./auth');

//- Functions
const { aprilFools } = require('../functions/utilities');

//- Sentry Initalization
Sentry.init({
    dsn: "https://90738d20a91d4f169081dfbea05bc8d4@o4504516705058816.ingest.sentry.io/4504771825303552",
    sampleRate: 1.0,
    serverName: "Main PC",
    integrations: [
        new Intigrations.ExtraErrorData({ depth: 10 }),
        new Intigrations.SessionTiming(),
        new Intigrations.Transaction(),
        new Intigrations.ReportingObserver(),
        new Intigrations.CaptureConsole({
            levels: ['error', 'critical', 'fatal', 'warn']
        }),
        new Sentry.Integrations.Http({
            tracing: true,
            breadcrumbs: true
        }),
        new Tracing.Integrations.Express({ router })
    ],
    // @ts-ignore
    environment: "MasterDevelopment",
    release: "v1.1.2-Private_Alpha",
    sendDefaultPii: true
});

//- Rate Limiters
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

//- Router setup
router
    .use(Sentry.Handlers.requestHandler({ transaction: true }))
    .use(Sentry.Handlers.tracingHandler())
    .use(session({ secret: 'secret123', saveUninitialized: true, resave: false, cookie: { maxAge: 86400000, httpOnly: true }, store: new MemoryStore({ checkPeriod: 86_400_000 }), }))
    .use(baseLimiter)
    .use('/assets', assetsLimiter)
    .use('/cdn', cdn)
    .use('/legal', legal)
    .use('/error', error)
    .use('/assets', assets)
    .use('/auth', auth)
    .use('/ab', ab)
    .use('/', website)
    .get(`/robots.txt`, (req, res) => {
        res
            .sendFile(`${process.cwd()}/metadata/robots.txt`)
    })
    .get(`/sitemap`, (req, res) => {
        res
            .setHeader(`Content-Type`, `text/xml`)
            .sendFile(`${process.cwd()}/metadata/sitemap.xml`)
    })
    .use((req, res, next) => {
        const { path } = req;
        const methodUsed = req.method.toUpperCase();
        let allowedMethods = router.stack.filter(r => r.route && r.route.path === path)
        if (allowedMethods.length == 0) return next();
        allowedMethods.map(r => r.route.stack[0])
        allowedMethods = { ...allowedMethods[0] }
        allowedMethods = allowedMethods.route.methods;
        if (allowedMethods[methodUsed]) return next();
        res.status(405).render(
            `${aprilFools() ? 'aprilfools/' : ''}misc/405.pug`,
            {
                errData: {
                    path,
                    allowedMethods: Object.keys(allowedMethods).map(m => m.toUpperCase()).join(', '),
                    methodUsed: methodUsed,
                },
                meta: {
                    title: '405 - Method Not Allowed',
                    desc: '405 - Method Not Allowed',
                    url: 'https://thefemdevs.com/errors/405',
                }
            }
        );
    })
    .use((err, req, res, _) => {
        switch (err.status) {
            case 401:
            case 403:
                res.status(err.status).render(
                    `${aprilFools() ? 'april-fools/' : ''}misc/401.pug`,
                    {
                        errData: {
                            path: req.path,
                            code: err.status,
                        },
                        meta: {
                            title: `401 - Unauthorized`,
                            desc: `401 - Unauthorized`,
                            url: `https://thefemdevs.com/errors/401`
                        }
                    }
                );
                break;
            // case 405:
            //     const allowedMethods = [];
            //     const methodUsed = req.method.toLowerCase();
            //     const { path } = req;
            //     router.stack.forEach((r) => {
            //         if (r.route && r.route.path === path) {
            //             allowedMethods.push(r.route.stack[0].method.toLowerCase());
            //         }
            //     })
            //     res.status(405).render(
            //         `${aprilFools() ? 'aprilfools/' : ''}misc/405.pug`,
            //         {
            //             errData: {
            //                 path,
            //                 allowedMethods: Object.keys(allowedMethods).map(m => m.toUpperCase()).join(', '),
            //                 methodUsed: methodUsed,
            //             },
            //             meta: {
            //                 title: '405 - Method Not Allowed',
            //                 desc: '405 - Method Not Allowed',
            //                 url: 'https://thefemdevs.com/errors/405',
            //             }
            //         }
            //     );
            case 404:
                break;
            default:
                const errorId = Sentry.captureException(err);
                console.log(err)
                res
                    .status(501)
                    .setHeader('X-Error-ID', errorId)
                    .render(
                        `${aprilFools() ? 'april-fools/' : ''}misc/501.pug`,
                        {
                            errData: {
                                errorId
                            },
                            meta: {
                                title: `501 - Internal Server Error`,
                                desc: `501 - Internal Server Error`,
                                url: `https://thefemdevs.com/errors/501`
                            }
                        }
                    )
                break;
        }
    })
    .use((req, res) => {
        res.status(404).render(
            `${aprilFools() ? 'april-fools/' : ''}misc/404.pug`,
            {
                errData: {
                    path: req.path,
                },
                meta: {
                    title: '404 - Page Not Found',
                    desc: '404 - Page Not Found',
                    url: 'https://thefemdevs.com/errors/404'
                }
            }
        );
    })
    .use(Sentry.Handlers.errorHandler());

module.exports = router;