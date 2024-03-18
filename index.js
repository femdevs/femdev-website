const app = require('express')();
const http = require('http');
const cors = require('cors');
const vhost = require('vhost');
const crypto = require('crypto');
const Admin = require('firebase-admin');
const { RateLimiterMemory } = require('rate-limiter-flexible');
require('dotenv').config();

//- Middleware
const IPM = require('./middleware/IP'); //? IP Middleware
const SM = require('./middleware/session'); //? Session Manager
const TRACE = require('./middleware/traceHandler'); //? Tracing Middleware
const RL = require('./middleware/routeLogger'); //? Route Logger
const Headers = require('./middleware/headers'); //? Header Setter
const errPages = require('./middleware/errpages'); //? Error Pages

const reqLogs = [];

/**
 * @type {Map<String, Map<String, any>|String>}
 * @desciption
 * Used to store data throughout requests
 */
const Persistance = new Map();

const RateLimiter = new RateLimiterMemory({
    points: 30,
    duration: 1,
})

class Formatter {
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

/** @type {cors.CorsOptions} */
const CORSPerms = {
    credentials: true,
    maxAge: 86400,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'TRACE', 'HEAD'],
    optionsSuccessStatus: 200,
    preflightContinue: true,
    exposedHeaders: ['X-Repo', 'X-Live-Deploy', 'X-Repository-License', 'X-OS', 'X-Node-Version', 'X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset', 'Retry-After', 'Content-Type', 'Content-Length', 'Content-Security-Policy', 'Cross-Origin-Opener-Policy', 'Cross-Origin-Embedder-Policy', 'Cross-Origin-Resource-Policy']
}

app
    .set('view engine', 'pug')
    .set('case sensitive routing', false)
    .set('trust proxy', true)
    .set('x-powered-by', false)
    .use((req, _, next) => {
        Object.assign(req, {
            reqLogs, Persistance, AdminApp, auth: AdminApp.auth(), Database, Formatter, RateLimitMem: RateLimiter,
            getErrPage: (c, d) => errPages.get(c)(d)
        })
        next();
    })
    .use(RL)
    .use(IPM.infoMiddleware)
    .use(SM)
    .use(IPM.checkLocation)
    .use((req, res, next) => {
        if (req.Database.ipBlacklist.some(ipData => ipData.hash === (_ => { let currentHash = ['::1', '127.0.0.1'].includes(req.ip.replace('::ffff:', '')) ? 'localhost' : (req.ip || 'unknown').replace('::ffff:', ''); crypto.getHashes().forEach(hashAlg => { currentHash = crypto.createHash(hashAlg).update(currentHash).digest('base64url') }); return crypto.createHash('id-rsassa-pkcs1-v1_5-with-sha3-512').update(currentHash).digest('base64url') })())) {
            return res.status(403).render(
                `misc/403.pug`,
                req.getErrPage(403, { path: req.path })
            )
        }
        next();
    })
    .use(TRACE)
    .use(Headers)
    .use(cors(CORSPerms))
    .use(require('./web/pages/router'))
    .use(vhost('api.thefemdevs.com', require('./web/api/')))
    .use(vhost('oss.thefemdevs.com', require('./web/oss/')))
    .use(vhost('cdn.thefemdevs.com', require('./web/cdn/')))
    .use(vhost('legal.thefemdevs.com', require('./web/legal/')))
    .use(vhost('errors.thefemdevs.com', require('./web/errors/')))
    .use(vhost('pay.thefemdevs.com', require('./web/payment/')))
    .use(vhost('security.thefemdevs.com', require('./web/security/')))
    .use(vhost('thefemdevs.com', require('./web/core/')))
    .use(vhost('www.thefemdevs.com', require('./web/core')))
    .use(vhost('localhost', require('./web/core/')))
    .use((req, res, next) => {
        const { path } = req;
        const methodUsed = req.method.toUpperCase();
        let allowedMethods = app._router.stack.filter(r => r.route && r.route.path === path)
        if (allowedMethods.length == 0) return next();
        allowedMethods.map(r => r.route.stack[0])
        allowedMethods = { ...allowedMethods[0] }
        allowedMethods = allowedMethods.route.methods;
        if (req.method === 'OPTIONS') return res.setHeader('Allow', Object.keys(allowedMethods).map(m => m.toUpperCase()).join(', ')).setHeader('Access-Control-Allow-Methods', Object.keys(allowedMethods).map(m => m.toUpperCase()).join(', ')).status(204).send();
        if (allowedMethods[methodUsed]) return next();
        res.status(405).render(
            `misc/405.pug`,
            req.getErrPage(405, { path, allowedMethods, methodUsed })
        );
    });

const server = http
    .createServer(app)
    .on('listening', _ => console.log("HTTP Server is UP"))

server
    .listen(process.env.PORT || 3000)