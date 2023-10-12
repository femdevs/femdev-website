const app = require('express')();
const Sentry = require('@sentry/node');
const Intigrations = require('@sentry/integrations');
const Profiling = require('@sentry/profiling-node');
const http = require('http');
const axios = require('axios');
const cron = require('node-cron');
const crypto = require('crypto');
const Admin = require('firebase-admin');
require('dotenv').config();

//- Routers
const router = require('./routes/router');

//- Middleware
const IPM = require('./middleware/IP'); //? IP Middleware
const SM = require('./middleware/session'); //? Session Manager
const MRL = require('./middleware/rateLimit') //? Main Rate Limiter
const TRACE = require('./middleware/traceHandler'); //? Tracing Middleware
const RL = require('./middleware/routeLogger'); //? Route Logger
const Headers = require('./middleware/headers'); //? Header Setter
const EPR = require('./middleware/errorPages'); //? Error Page Renderer
const four0four = require('./middleware/404'); //? 404 Handler

let blacklistedIPAddresses = [];

Sentry.init({
    dsn: process.env.SENTRY_DSN,
    sampleRate: 1.0,
    tracesSampleRate: 1.0,
    profilesSampleRate: 1.0,
    serverName: require('os').hostname(),
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
        new Sentry.Integrations.Express({ app }),
        new Profiling.ProfilingIntegration(),
        new Sentry.Integrations.Postgres(),
    ],
    // @ts-ignore
    environment: process.env.NODE_ENV || 'development',
    release: require('../package.json').version,
    sendDefaultPii: true
});

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
    static permissionBitToReadable(bit) {
        const permissions = [];
        Object.entries(this.perms).forEach(([key, value]) => {
            if ((value & bit) === value) permissions.push(key);
        })
        return permissions;
    }
    static permissionStringArrayToBit(string) {
        const bitArray = [];
        string.forEach((permission) => {
            const bit = this.perms[permission];
            if (bit) bitArray.push(bit);
        })
        return bitArray.reduce((a, b) => a + b, 0);
    }
    static formatDateTime = new Intl.DateTimeFormat('en-US', { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit", weekday: "long", timeZone: "America/Detroit", timeZoneName: "longGeneric" }).format;
    static formatDate = new Intl.DateTimeFormat('en-US', { year: "numeric", month: "long", day: "numeric", weekday: "long" }).format;
    static formatTime = new Intl.DateTimeFormat('en-US', { hour: "2-digit", minute: "2-digit", second: "2-digit", timeZone: "America/Detroit", timeZoneName: "shortOffset" }).format;
    static dobToAge(dob) {
        const date = new Date(dob);
        const diff = Date.now() - date.getTime();
        const age = new Date(diff);
        return Math.abs(age.getUTCFullYear() - 1970);
    }
}

const FirebaseServiceAccount = JSON.parse(process.env.FIREBASE_SA);
const AdminApp = Admin.initializeApp({
    credential: Admin.credential.cert(FirebaseServiceAccount),
    databaseURL: `https://${FirebaseServiceAccount.projectId}-default-rtdb.firebaseio.com`
})

const db = require('./functions/database');

app
    .set('view engine', 'pug')
    .set('case sensitive routing', false)
    .set('trust proxy', true)
    .set('x-powered-by', false)
    .use(Sentry.Handlers.requestHandler({ transaction: true }))
    .use(Sentry.Handlers.tracingHandler())
    .use((req, _, next) => {
        req.Sentry = Sentry;
        req.FirebaseAdmin = AdminApp;
        req.auth = AdminApp.auth();
        req.Database = new db();
        req.Formatter = Formatter;
        req.checkPerms = function (userbit, ...neededPerms) {
            const userPerms = Formatter.permissionBitToReadable(userbit);
            if (userPerms.includes('owner') || userPerms.includes('admin')) return true;
            return neededPerms.some(perm => userPerms.includes(perm));
        };
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
    .use('/', router)
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
    .use(EPR)
    .use(four0four)
    .use(Sentry.Handlers.errorHandler());

cron
    .schedule('*/5 * * * *', async () => {
        const connection = await new db().pool.connect();
        blacklistedIPAddresses = (await connection.query(`SELECT ipHash FROM public.websiteblacklist WHERE active = 1`)).rows.map(r => r.iphash);
        connection.release();
        axios.default.post(
            'https://sentry.io/api/0/organizations/benpai/monitors/website-running-check/checkins/',
            { status: 'ok' },
            { headers: { Authorization: `Bearer ${process.env.SENTRY_API_TOKEN}` } }
        )
    })

http
    .createServer(app)
    .listen(3001, () => console.log('http server is up'));
