const router = require('express').Router();
const rateLimiter = require('express-rate-limit');
const Sentry = require('@sentry/node');
const Tracing = require('@sentry/tracing');
const Intigrations = require('@sentry/integrations');
const session = require('express-session');
const MemoryStore = require('memorystore')(session);
const website = require('./main');
const cdn = require('./cdn');
const legal = require('./legal');
const error = require('./errors');
const ab = require('./ab');
const assets = require('./assets/router');
const auth = require('./auth');

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

const baseLimiter = rateLimiter.rateLimit({
    windowMs: 1000,
    max: 10,
    legacyHeaders: false,
    standardHeaders: true,
    handler: (_, res, ...args) => res.status(429).render(`misc/429.pug`, { title: '429 - Too Many Requests' }),
    skip: (req, _) => req.path.startsWith('/assets')
});

const assetsLimiter = rateLimiter.rateLimit({
    windowMs: 1000,
    max: 25,
    legacyHeaders: false,
    standardHeaders: true,
    handler: (_, res, ...args) => res.status(429).render(`misc/429.pug`, { title: '429 - Too Many Requests' }),
});

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
    .use((err, req, res, _) => {
        switch (err.status) {
            case 401:
            case 403:
                res.status(err.status).render(
                    `misc/401.pug`,
                    {
                        title: `401 - Unauthorized`,
                        path: req.path,
                        code: err.status
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
            //         `misc/405.pug`,
            //         {
            //             title: '405 - Method Not Allowed',
            //             path,
            //             allowedMethods: allowedMethods.forEach(m => m.toUpperCase()),
            //             methodUsed: methodUsed.toUpperCase()
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
                        `misc/501.pug`,
                        {
                            title: `501 - Internal Server Error`,
                            errorId
                        }
                    )
                break;
        }
    })
    .use((req, res) => {
        res.status(404).render(
            `misc/404.pug`,
            {
                title: '404 - Page Not Found',
                path: req.path
            }
        );
    })

module.exports = router;