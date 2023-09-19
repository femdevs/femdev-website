//- Packages
const router = require('express').Router();
const rateLimiter = require('express-rate-limit');
const session = require('express-session');
const MemoryStore = require('memorystore')(session);
const Sentry = require('@sentry/node');
const Tracing = require('@sentry/tracing');
const Intigrations = require('@sentry/integrations');
const responseTime = require('response-time');
const crypto = require('crypto');
const Chalk = require('chalk');
const cron = require('node-cron');

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
const { saveAccessLog, testIPBlacklisted } = require('../functions/database');

const chalk = new Chalk.Instance({ level: 3 });

const cookieSecrets = new Array(24).map((_) => crypto.randomBytes(32).toString('base64url'));

const ISMMS = new MemoryStore(
    {
        checkPeriod: 360_000,
        stale: false
    }
)

const ISM = session(
    {
        secret: cookieSecrets,
        saveUninitialized: true,
        resave: true,
        cookie: {
            maxAge: 360_000,
            secure: 'auto'
        },
        store: ISMMS
    }
)

const CSR = cron
    .schedule(
        '0 * * * *',
        function () { cookieSecrets.push(cookieSecrets.shift()) },
        {
            name: 'Cookie Secret Rotator',
            scheduled: true,
            recoverMissedExecutions: true,
            runOnInit: false,
            timezone: 'America/Detroit'
        }
    )

CSR.start();

const hash = (data) => {
    let currentHash = data;
    crypto.getHashes().forEach(hashAlg => { currentHash = crypto.createHash(hashAlg).update(currentHash).digest('base64url') })
    return crypto.createHash('id-rsassa-pkcs1-v1_5-with-sha3-512').update(currentHash).digest('base64url');
}

class ColorConverter {
    static status(code) {
        code = String(code);
        const chalkPrep = chalk.underline.bold;
        switch (code.at(0)) {
            case '5':
                return chalkPrep.rgb(120, 0, 0)(code)
            case '4':
                return chalkPrep.yellow(code)
            case '3':
                return chalkPrep.rgb(65, 105, 225)(code)
            case '2':
            case '1':
                return chalkPrep.rgb(0, 150, 0)(code)
            default:
                return chalkPrep.rgb(255, 255, 255)(code)
        }
    };
    static path = chalk.rgb(0, 0, 139);
    static method(method) {
        const chalkPrep = chalk.underline.bold;
        switch (method) {
            case 'GET':
                return chalkPrep.rgb(0, 150, 0)(method);
            case 'POST':
                return chalkPrep.rgb(0, 0, 139)(method);
            case 'PUT':
                return chalkPrep.yellow(method);
            case 'DELETE':
                return chalkPrep.rgb(120, 0, 0)(method);
            case 'PATCH':
                return chalkPrep.rgb(255, 0, 255)(method);
            case 'HEAD':
                return chalkPrep.rgb(65, 105, 225)(method);
            case 'OPTIONS':
                return chalkPrep.rgb(255, 255, 255)(method);
            default:
                return chalkPrep.rgb(255, 255, 255)(method);
        }
    };
    static resTime(t) {
        const chalkPrep = chalk.underline.bold;
        if (t <= 100) return chalkPrep.rgb(0, 190, 0)(`${t}ms`);
        if (t <= 200) return chalkPrep.rgb(0, 150, 0)(`${t}ms`);
        if (t <= 300) return chalkPrep.yellow(`${t}ms`);
        if (t <= 400) return chalkPrep.rgb(250, 120, 120)(`${t}ms`);
        if (t <= 500) return chalkPrep.rgb(120, 0, 0)(`${t}ms`);
        if (t <= 600) return chalkPrep.rgb(255, 0, 255)(`${t}ms`);
        if (t <= 700) return chalkPrep.rgb(0, 191, 255)(`${t}ms`);
        if (t <= 800) return chalkPrep.rgb(0, 0, 139)(`${t}ms`);
        if (t <= 900) return chalkPrep.rgb(65, 105, 225)(`${t}ms`);
        if (t <= 1000) return chalkPrep.rgb(255, 255, 255)(`${t}ms`);
        return chalkPrep.rgb(120, 120, 120)(`${t}ms`);
    };
    static bytes(bytes) {
        if (bytes == 0) return chalk.gray(`0 bytes`);
        if (bytes <= 100_000) return chalk.rgb(0, 190, 0)(`${new Intl.NumberFormat('en-US').format(bytes)} bytes`);
        if (bytes <= 500_000) return chalk.rgb(0, 150, 0)(`${new Intl.NumberFormat('en-US').format(bytes)} bytes`);
        if (bytes <= 1_000_000) return chalk.yellow(`${new Intl.NumberFormat('en-US').format(bytes)} bytes`);
        if (bytes <= 5_000_000) return chalk.rgb(250, 120, 120)(`${new Intl.NumberFormat('en-US').format(bytes)} bytes`);
        if (bytes <= 10_000_000) return chalk.rgb(120, 0, 0)(`${new Intl.NumberFormat('en-US').format(bytes)} bytes`);

    }
}

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
    .use((_, res, next) => {
        res
            .setHeader('X-Repo', 'https://github.com/femdevs/femdev-website')
            .setHeader('X-Live-Deploy', 'https://thefemdevs.com')
            .setHeader('X-Repository-License', 'Affero General Public License v3.0 or newer (AGPL-3.0-or-later)')
            .setHeader(
                'X-OS',
                process.platform == 'win32' ? 'Windows' :
                    process.platform == 'linux' ? 'Linux' :
                        process.platform == 'darwin' ? 'MacOS' :
                            'Other'
            )
            .setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'sha256-35hTAT/1IIz9Ti1xj6WCh7R3it0qLmomUINsgEpd+Rs=' 'sha256-PQZNDl5LndIkgsHUAmH1RgaNqm3741C7qMtglPA6Vcg='; style-src 'self' 'unsafe-inline' fonts.googleapis.com; img-src 'self' data: cdn.discordapp.com; font-src *; connect-src *; media-src *; object-src 'none'; child-src *; worker-src 'none'; frame-ancestors *; form-action 'self'; upgrade-insecure-requests; block-all-mixed-content; sandbox allow-forms allow-same-origin allow-scripts; base-uri 'self'; manifest-src 'self'; require-trusted-types-for 'script';")
            .setHeader('Cross-Origin-Opener-Policy', 'same-origin')
            .setHeader('Cross-Origin-Embedder-Policy', 'require-corp')
            .removeHeader('X-Powered-By');
        next();
    })
    .use(ISM)
    .use((mreq, mres, mnext) => responseTime((req, res, time) => {
        const data = {
            ip: chalk.gray(['::1', '127.0.0.1'].includes(mreq.ip.replace('::ffff:', '')) ? 'localhost' : (mreq.ip || 'unknown').replace('::ffff:', '')),
            date: chalk.bold(new Intl.DateTimeFormat('en-us', { year: "numeric", month: "short", day: "numeric", hour: "numeric", minute: "numeric", second: "numeric", weekday: "short", timeZone: "America/Detroit", timeZoneName: undefined }).format(new Date())),
            method: ColorConverter.method(req.method),
            url: ColorConverter.path(mreq.originalUrl),
            status: ColorConverter.status(res.statusCode),
            time: ColorConverter.resTime(time.toFixed(2)),
            bytes: ColorConverter.bytes(Number(res.getHeader('Content-Length')) | 0),
        }
        console.log(`${data.ip} [${data.date}] ${data.method} ${data.url} ${data.status} ${data.time} (${data.bytes})`)
        saveAccessLog({
            ip: hash(['::1', '127.0.0.1'].includes(mreq.ip.replace('::ffff:', '')) ? 'localhost' : (mreq.ip || 'unknown').replace('::ffff:', '')),
            date: new Intl.DateTimeFormat('en-us', { year: "numeric", month: "short", day: "numeric", hour: "numeric", minute: "numeric", second: "numeric", weekday: "short", timeZone: "America/Detroit", timeZoneName: undefined }).format(new Date()),
            method: req.method,
            url: mreq.originalUrl,
            status: res.statusCode,
            time: parseFloat(time.toFixed(2)),
            bytes: Number(res.getHeader('Content-Length')) | 0,
        });
    })(mreq, mres, mnext))
    .use(async (req, res, next) => {
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
        );
        const ip = ['::1', '127.0.0.1'].includes(req.ip.replace('::ffff:', '')) ? 'localhost' : (req.ip || 'unknown').replace('::ffff:', '')
        const [isBlacklisted, reason] = await testIPBlacklisted(hash(ip));
        if (isBlacklisted) {
            req.session.ipBanned = true;
            return res.status(403).render(
                `${aprilFools() ? 'april-fools/' : ''}misc/403.pug`,
                {
                    errData: {
                        path: req.path,
                        code: 403,
                        reason
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
    })
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