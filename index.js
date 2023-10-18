const app = require('express')();
const Sentry = require('@sentry/node');
const Intigrations = require('@sentry/integrations');
const Profiling = require('@sentry/profiling-node');
const http = require('http');
const axios = require('axios');
const cron = require('node-cron');
const crypto = require('crypto');
const Admin = require('firebase-admin');
const { RateLimiterMemory } = require('rate-limiter-flexible');
require('dotenv').config();

//- Routers
const router = require('./routes/router');

const RateLimiter = new RateLimiterMemory({
    points: 30,
    duration: 1,
})

const integrations = [
    new Intigrations.ExtraErrorData({ depth: 10 }),
    new Intigrations.SessionTiming(),
    new Intigrations.Transaction(),
    new Intigrations.CaptureConsole({ levels: ['error', 'critical', 'fatal', 'warn'] }),
    new Sentry.Integrations.Http({ tracing: true, breadcrumbs: true }),
    new Sentry.Integrations.Express({ app }),
    new Sentry.Integrations.Postgres(),
]

if (process.env.NODE_ENV !== 'production') integrations.push(new Profiling.ProfilingIntegration())


Sentry.init({
    dsn: process.env.SENTRY_DSN,
    sampleRate: 1.0,
    tracesSampleRate: 1.0,
    profilesSampleRate: 1.0,
    serverName: require('os').hostname(),
    integrations,
    environment: process.env.NODE_ENV || 'development',
    release: require(`./package.json`).version,
    sendDefaultPii: true
});

//- Middleware
const IPM = require('./middleware/IP'); //? IP Middleware
const SM = require('./middleware/session'); //? Session Manager
const MRL = require('./middleware/rateLimit')(RateLimiter); //? Rate Limiter
const TRACE = require('./middleware/traceHandler'); //? Tracing Middleware
const RL = require('./middleware/routeLogger'); //? Route Logger
const Headers = require('./middleware/headers'); //? Header Setter
const EPR = require('./middleware/errorPages')(Sentry) //? Error Page Renderer
const four0four = require('./middleware/404'); //? 404 Handler

const reqLogs = [];
class Formatter {
    static perms = {
        readData: 1 << 0,   // 1
        readTokens: 1 << 1,   // 2
        readUsers: 1 << 2,   // 4
        writeData: 1 << 3,   // 8
        writeTokens: 1 << 4,   // 16
        writeUsers: 1 << 5,   // 32
        createData: 1 << 6,   // 64
        createTokens: 1 << 7,   // 128
        createUsers: 1 << 8,   // 256
        deleteData: 1 << 9,   // 512
        deleteTokens: 1 << 10,   // 1024
        deleteUsers: 1 << 11,   // 2048
        developer: 1 << 12,   // 4096
        admin: 1 << 13,   // 8192
        owner: 1 << 14,   // 16384
    }
    static permissionBitToReadable = (bit) => [...Object.entries(this.perms).filter(([_, value]) => (value & bit) === value).map(([key, _]) => key)]
    static permissionStringArrayToBit = (arr) => [...arr.map((perm) => this.perms[perm]).filter((perm) => perm !== undefined)].reduce((a, b) => a + b, 0);
    static formatDateTime = (v) => new Intl.DateTimeFormat('en-US', { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit", weekday: "long", timeZone: "America/Detroit", timeZoneName: "longGeneric" }).format(v)
    static formatDate = (v) => new Intl.DateTimeFormat('en-US', { year: "numeric", month: "long", day: "numeric", weekday: "long" }).format(v)
    static formatTime = (v) => new Intl.DateTimeFormat('en-US', { hour: "2-digit", minute: "2-digit", second: "2-digit", timeZone: "America/Detroit", timeZoneName: "shortOffset" }).format(v)
    static dobToAge = (dob) => Math.abs(new Date(Date.now() - new Date(dob).getTime()).getUTCFullYear() - 1970);
}

const FirebaseServiceAccount = JSON.parse(process.env.FIREBASE_SA);
const AdminApp = Admin.initializeApp({
    credential: Admin.credential.cert(FirebaseServiceAccount),
    databaseURL: `https://${FirebaseServiceAccount.projectId}-default-rtdb.firebaseio.com`
})

const Database = new (require('./functions/database'))();

setInterval(_ => (!reqLogs[0]) ? null : Database.emit('access', reqLogs.shift()), 500)

app
    .set('view engine', 'pug')
    .set('case sensitive routing', false)
    .set('trust proxy', true)
    .set('x-powered-by', false)
    .use(Sentry.Handlers.requestHandler({ transaction: true }))
    .use(Sentry.Handlers.tracingHandler())
    .use((req, _, next) => {
        req.reqLogs = reqLogs;
        req.Sentry = Sentry;
        req.FirebaseAdmin = AdminApp;
        req.auth = AdminApp.auth();
        req.Database = Database;
        req.Formatter = Formatter;
        req.checkPerms = (userbit, ...neededPerms) => (Formatter.permissionBitToReadable(userbit).some(['admin', 'owner'].includes)) ? true : neededPerms.some(Formatter.permissionBitToReadable(userbit).includes);
        next();
    })
    .use(RL)
    .use(IPM.infoMiddleware)
    .use(SM)
    .use(IPM.checkLocation)
    .use((req, res, next) => {
        Sentry.startSpan(
            { op: "IPBlacklistCheck", name: "IP Blacklist Check Handler", data: { path: req.path } },
            async () => {
                if (
                    req.Database.ipBlacklist.some(
                        ipData =>
                            ipData.hash === (
                                function (data) {
                                    let currentHash = data;
                                    crypto.getHashes().forEach(
                                        hashAlg => {
                                            currentHash = crypto
                                                .createHash(hashAlg)
                                                .update(currentHash)
                                                .digest('base64url')
                                        }
                                    );
                                    return crypto
                                        .createHash('id-rsassa-pkcs1-v1_5-with-sha3-512')
                                        .update(currentHash)
                                        .digest('base64url')
                                }
                            )(
                                ['::1', '127.0.0.1']
                                    .includes(req.ip.replace('::ffff:', '')) ?
                                    'localhost' :
                                    (req.ip || 'unknown').replace('::ffff:', '')
                            )

                    )
                ) return res.status(403).render(
                    `misc/403.pug`,
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
                next();
            }
        );
    })
    .use(TRACE)
    .use(MRL)
    .use(Headers)
    .use('/', router)
    .get(`/robots.txt`, (_, res) => {
        res
            .sendFile(`${process.cwd()}/metadata/robots.txt`)
    })
    .get(`/sitemap`, (_, res) => {
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
        if (req.method === 'OPTIONS') return res.setHeader('Allow', Object.keys(allowedMethods).map(m => m.toUpperCase()).join(', ')).setHeader('Access-Control-Allow-Methods', Object.keys(allowedMethods).map(m => m.toUpperCase()).join(', ')).status(204).send();
        if (allowedMethods[methodUsed]) return next();
        res.status(405).render(
            `misc/405.pug`,
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
    .use(Sentry.Handlers.errorHandler())
    .use(EPR)
    .use(four0four)

cron
    .schedule('*/5 * * * *', async () => {
        Database.emit('updateBlacklist')
        axios.default.post(
            'https://sentry.io/api/0/organizations/benpai/monitors/website-running-check/checkins/',
            { status: 'ok' },
            { headers: { Authorization: `Bearer ${process.env.SENTRY_API_TOKEN}` } }
        )
    })

http
    .createServer(app)
    .listen(3001, () => console.log('http server is up'));
