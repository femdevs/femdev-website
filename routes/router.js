const router = require('express').Router();
const rateLimiter = require('express-rate-limit');
const Sentry = require('@sentry/node');
const Tracing = require('@sentry/tracing');
const Intigrations = require('@sentry/integrations');
const website = require('./main');
const cdn = require('./cdn');
const legal = require('./legal');
const error = require('./errors');
const ab = require('./ab');
const assets = require('./assets/router');
const auth = require('./auth/router');

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

router.use(Sentry.Handlers.requestHandler({ transaction: true }));
router.use(Sentry.Handlers.tracingHandler());
router.use(baseLimiter);
router.use('/assets', assetsLimiter)
router.use('/cdn', cdn);
router.use('/legal', legal);
router.use('/error', error);
router.use('/assets', assets);
router.use('/auth', auth);
router.use('/ab', ab);
router.use('/', website);

router.use((err, req, res, _) => {
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
});

router.use((req, res) => {
    res.status(404).render(
        `misc/404.pug`,
        {
            title: '404 - Page Not Found',
            path: req.path
        }
    );
})

module.exports = router;