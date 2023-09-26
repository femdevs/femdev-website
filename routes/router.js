//- Packages
const router = require('express').Router();
const Sentry = require('@sentry/node');
const Tracing = require('@sentry/tracing');
const Intigrations = require('@sentry/integrations');
require('dotenv').config();

//- Routes
const website = require('./main');
const cdn = require('./cdn');
const legal = require('./legal');
const error = require('./errors');
const ab = require('./ab');
const assets = require('./assets/router');
const api = require('./api/router');

//- Functions
const { aprilFools } = require('../functions/utilities');

//- Middleware
const IPM = require('../middleware/IP'); // IP Middleware
const SM = require('../middleware/session'); // Session Manager
const MRL = require('../middleware/mainRateLimit'); // Main Rate Limiter
const ARL = require('../middleware/assetRateLimit'); // Asset Rate Limiter
const RL = require('../middleware/routeLogger'); // Route Logger
const EPR = require('../middleware/errorPages'); // Error Page Renderer
const IBC = require('../middleware/ipBlacklist'); // IP Blacklist Checker
const Headers = require('../middleware/headers'); // Header Setter
const four0four = require('../middleware/404'); // 404 Handler

//- Sentry Initalization
Sentry.init({
    dsn: process.env.SENTRY_DSN,
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

//- Router setup
router
    //- Key Middleware
    .use(SM)
    .use(Sentry.Handlers.requestHandler({ transaction: true }))
    .use(Sentry.Handlers.tracingHandler())
    .use(IPM.infoMiddleware)
    .use(IPM.checkInfo)
    .use(Headers)
    .use(RL)
    .use(IBC)
    .use(MRL)
    .use('/assets', ARL)
    //- Routes
    .use('/ab', ab)
    .use('/api', api)
    .use('/cdn', cdn)
    .use('/legal', legal)
    .use('/error', error)
    .use('/assets', assets)
    .use('/', website)
    //- Static Files
    .get(`/robots.txt`, (req, res) => {
        res
            .sendFile(`${process.cwd()}/metadata/robots.txt`)
    })
    .get(`/sitemap`, (req, res) => {
        res
            .setHeader(`Content-Type`, `text/xml`)
            .sendFile(`${process.cwd()}/metadata/sitemap.xml`)
    })
    //- 405 Handler
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
    //- Error Handler
    .use((err, req, res, next) => EPR(err,req, res, next, Sentry))
    .use(four0four)
    .use(Sentry.Handlers.errorHandler());

module.exports = router;