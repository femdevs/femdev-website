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

const chalk = new Chalk.Instance({ level: 3 })

const hash = (data) => {
    let currentHash = data;
    crypto.getHashes().forEach(hashAlg => {currentHash = crypto.createHash(hashAlg).update(currentHash).digest('base64url')})
    return crypto.createHash('id-rsassa-pkcs1-v1_5-with-sha3-512').update(currentHash).digest('base64url');
}

class ColorConverter {
    static status(code) {
        code = String(code);
        const chalkPrep = chalk.underline.bold;
        switch (code.at(0)) {
            case '5':
                return chalkPrep.rgb(120,0,0)(code)
            case '4':
                return chalkPrep.yellow(code)
            case '3':
                return chalkPrep.rgb(65,105,225)(code)
            case '2':
            case '1':
                return chalkPrep.rgb(0,150,0)(code)
            default:
                return chalkPrep.rgb(255,255,255)(code)
        }
    };
    static path = chalk.rgb(0,0,139);
    static method(method) {
        const chalkPrep = chalk.underline.bold;
        switch (method) {
            case 'GET':
                return chalkPrep.rgb(0,150,0)(method);
            case 'POST':
                return chalkPrep.rgb(0,0,139)(method);
            case 'PUT':
                return chalkPrep.yellow(method);
            case 'DELETE':
                return chalkPrep.rgb(120,0,0)(method);
            case 'PATCH':
                return chalkPrep.rgb(255,0,255)(method);
            case 'HEAD':
                return chalkPrep.rgb(65,105,225)(method);
            case 'OPTIONS':
                return chalkPrep.rgb(255,255,255)(method);
            default:
                return chalkPrep.rgb(255,255,255)(method);
        }
    };
    static resTime(t) {
        const chalkPrep = chalk.underline.bold;
        if (t <= 100) return chalkPrep.rgb(0,190,0)(`${t}ms`);
        if (t <= 200) return chalkPrep.rgb(0,150,0)(`${t}ms`);
        if (t <= 300) return chalkPrep.yellow(`${t}ms`);
        if (t <= 400) return chalkPrep.rgb(250,120,120)(`${t}ms`);
        if (t <= 500) return chalkPrep.rgb(120,0,0)(`${t}ms`);
        if (t <= 600) return chalkPrep.rgb(255,0,255)(`${t}ms`);
        if (t <= 700) return chalkPrep.rgb(0,191,255)(`${t}ms`);
        if (t <= 800) return chalkPrep.rgb(0,0,139)(`${t}ms`);
        if (t <= 900) return chalkPrep.rgb(65,105,225)(`${t}ms`);
        if (t <= 1000) return chalkPrep.rgb(255,255,255)(`${t}ms`);
        return chalkPrep.rgb(120,120,120)(`${t}ms`);
    };
    static bytes(bytes) {
        if (bytes == 0) return chalk.gray(`0 bytes`);
        if (bytes <= 100_000) return chalk.rgb(0,190,0)(`${new Intl.NumberFormat('en-US').format(bytes)} bytes`);
        if (bytes <= 500_000) return chalk.rgb(0,150,0)(`${new Intl.NumberFormat('en-US').format(bytes)} bytes`);
        if (bytes <= 1_000_000) return chalk.yellow(`${new Intl.NumberFormat('en-US').format(bytes)} bytes`);
        if (bytes <= 5_000_000) return chalk.rgb(250,120,120)(`${new Intl.NumberFormat('en-US').format(bytes)} bytes`);
        if (bytes <= 10_000_000) return chalk.rgb(120,0,0)(`${new Intl.NumberFormat('en-US').format(bytes)} bytes`);

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
    .use(session({ secret: 'secret123', saveUninitialized: true, resave: false, cookie: { maxAge: 86400000, httpOnly: true }, store: new MemoryStore({ checkPeriod: 86_400_000 }), }))
    .use((mreq, mres, mnext) => responseTime((req, res, time) => {
        const data = {
            ip: chalk.gray(mreq.ip == '::1' ? 'localhost' : mreq.ip.replace('::ffff:', '')),
            date: chalk.bold(new Intl.DateTimeFormat('en-us', { year: "numeric", month: "short", day: "numeric", hour: "numeric", minute: "numeric", second: "numeric", weekday: "short", timeZone: "America/Detroit", timeZoneName: undefined }).format(new Date())),
            method: ColorConverter.method(req.method),
            url: ColorConverter.path(mreq.originalUrl),
            status: ColorConverter.status(res.statusCode),
            time: ColorConverter.resTime(time.toFixed(2)),
            bytes: ColorConverter.bytes(Number(res.getHeader('Content-Length')) | 0),
        }
        console.log(`${data.ip} [${data.date}] ${data.method} ${data.url} ${data.status} ${data.time} (${data.bytes})`)
        saveAccessLog({
            ip: hash(mreq.ip == '::1' ? 'localhost' : mreq.ip.replace('::ffff:', '')),
            date: new Intl.DateTimeFormat('en-us', { year: "numeric", month: "short", day: "numeric", hour: "numeric", minute: "numeric", second: "numeric", weekday: "short", timeZone: "America/Detroit", timeZoneName: undefined }).format(new Date()),
            method: req.method,
            url: mreq.originalUrl,
            status: res.statusCode,
            time: parseFloat(time.toFixed(2)),
            bytes: Number(res.getHeader('Content-Length')) | 0,
        });
    })(mreq, mres, mnext))
    .use(async (req, res, next) => {
        const ip = req.ip == '::1' ? 'localhost' : req.ip.replace('::ffff:', '')
        const [isBlacklisted, reason] = await testIPBlacklisted(hash(ip));
        if (isBlacklisted) return res.status(403).render(
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
        );
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