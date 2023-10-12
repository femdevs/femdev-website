//- Packages
const router = require('express').Router();
const Sentry = require('@sentry/node');
const Intigrations = require('@sentry/integrations');
const Profiling = require('@sentry/profiling-node');
const cron = require('node-cron');
const crypto = require('crypto');
const os = require('os');
require('dotenv').config();

//- Routes
const website = require('./main');
const cdn = require('./cdn');
const legal = require('./legal');
const error = require('./errors');
const ab = require('./ab');
const OSSProject = require('./project');
const assets = require('./assets/router');
const api = require('./api/router');

//- Functions
const { aprilFools } = require('../functions/utilities');
const Database = require('../functions/database');

//- Middleware
const IPM = require('../middleware/IP'); //? IP Middleware
const SM = require('../middleware/session'); //? Session Manager
const MRL = require('../middleware/mainRateLimit'); //? Main Rate Limiter
const TRACE = require('../middleware/traceHandler'); //? Tracing Middleware
const RL = require('../middleware/routeLogger'); //? Route Logger
const EPR = require('../middleware/errorPages'); //? Error Page Renderer
const Headers = require('../middleware/headers'); //? Header Setter
const four0four = require('../middleware/404'); //? 404 Handler

let blacklistedIPAddresses = [];

//- Sentry Initalization
Sentry.init({
    dsn: process.env.SENTRY_DSN,
    sampleRate: 1.0,
    tracesSampleRate: 1.0,
    profilesSampleRate: 1.0,
    serverName: os.hostname(),
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
        new Sentry.Integrations.Express({ router }),
        new Profiling.ProfilingIntegration(),
        new Sentry.Integrations.Postgres(),
    ],
    // @ts-ignore
    environment: process.env.NODE_ENV || 'development',
    release: require('../package.json').version,
    sendDefaultPii: true
});


//- Router setup
router
    //- Key Middleware
    .use(Sentry.Handlers.requestHandler({ transaction: true }))
    .use(Sentry.Handlers.tracingHandler())
    .use((req, _, next) => {
        req.Sentry = Sentry;
        next();
    })
    .use(RL)
    .use(IPM.infoMiddleware)
    .use(SM)
    .use(IPM.checkLocation)
    .use((req, res, next) => {
        req.Sentry.startSpan(
            { op: "IPBlacklistCheck", name: "IP Blacklist Check Handler", data: { path: req.path } },
            async () => {
                const hash = (data) => {
                    let currentHash = data;
                    crypto.getHashes().forEach(hashAlg => { currentHash = crypto.createHash(hashAlg).update(currentHash).digest('base64url') })
                    return crypto.createHash('id-rsassa-pkcs1-v1_5-with-sha3-512').update(currentHash).digest('base64url');
                }
                if (req.session.ipBanned) return res.status(403).render(
                    `${aprilFools() ? 'april-fools/' : ''}misc/403.pug`,
                    {
                        errData: {
                            path: req.path,
                            code: 403,
                            reason: 'You are banned from accessing this website.'
                        },
                        meta: {
                            title: `403 - Forbidden`,
                            desc: `403 - Forbidden`,
                            url: `https://thefemdevs.com/errors/403`
                        }
                    }
                )
                const ip = ['::1', '127.0.0.1'].includes(req.ip.replace('::ffff:', '')) ? 'localhost' : (req.ip || 'unknown').replace('::ffff:', '')
                if (blacklistedIPAddresses.includes(hash(ip))) {
                    req.session.ipBanned = true;
                    return res.status(403).render(
                        `${aprilFools() ? 'april-fools/' : ''}misc/403.pug`,
                        {
                            errData: {
                                path: req.path,
                                code: 403,
                                reason: 'You are banned from accessing this website.',
                            },
                            meta: {
                                title: `403 - Forbidden`,
                                desc: `403 - Forbidden`,
                                url: `https://thefemdevs.com/errors/403`
                            }
                        }
                    )
                }
                next();
            }
        );
    })
    .use(TRACE)
    .use(MRL)
    .use(Headers)
    //- Routes
    .use('/ab', ab)
    .use('/api', api)
    .use('/cdn', cdn)
    .use('/legal', legal)
    .use('/error', error)
    .use('/oss-project', OSSProject)
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
        if (req.method === 'OPTIONS') return res.setHeader('Allow', Object.keys(allowedMethods).map(m => m.toUpperCase()).join(', ')).setHeader('Access-Control-Allow-Methods', Object.keys(allowedMethods).map(m => m.toUpperCase()).join(', ')).status(204).send();
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
    .use(EPR)
    .use(four0four)
    .use(Sentry.Handlers.errorHandler());

cron
    .schedule(
        '*/5 * * * *',
        async () => {
            Sentry.startSpan({ op: "IPBlacklistUpdate", name: "IP Blacklist Updater" }, async () => {
                const connection = await Database.Pool.connect();
                blacklistedIPAddresses = (await connection.query(`SELECT ipHash FROM public.websiteblacklist WHERE active = 1`)).rows.map(r => r.iphash);
                connection.release();
                Sentry.captureCheckIn({ monitorSlug: 'website-running-check', status: 'ok', duration: 1000 })
                return;
            });
        },
        {
            runOnInit: true,
            timezone: 'America/Detroit',
            scheduled: true
        }
    )

module.exports = router;