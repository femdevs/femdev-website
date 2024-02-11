const app = require('express')();
const http = require('http');
const cors = require('cors');
const vhost = require('vhost');
const crypto = require('crypto');
const Admin = require('firebase-admin');
require('dotenv').config();

//- Middleware
const IPM = require('./middleware/IP'); //? IP Middleware
const SM = require('./middleware/session'); //? Session Manager
const TRACE = require('./middleware/traceHandler'); //? Tracing Middleware
const RL = require('./middleware/routeLogger'); //? Route Logger
const Headers = require('./middleware/headers'); //? Header Setter
const EPR = require('./middleware/errorPages') //? Error Page Renderer
const four0four = require('./middleware/404'); //? 404 Handler
const errPages = require('./middleware/errpages')

const reqLogs = [];

/**
 * @type {Map<String, Map<String, any>|String>}
 * @desciption
 * Used to store data throughout requests
 */
const Persistance = new Map()
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
            reqLogs,
            Persistance,
            AdminApp,
            auth: AdminApp.auth(),
            Database,
            Formatter,
            getErrPage: (c, d) => errPages.get(c).call(d),
            checkPerms: (userbit, ...neededPerms) => (Formatter.permissionBitToReadable(userbit).some(['admin', 'owner'].includes)) ? true : neededPerms.some(Formatter.permissionBitToReadable(userbit).includes)
        })
        next();
    })
    .use(RL)
    .use(IPM.infoMiddleware)
    .use(SM)
    .use(IPM.checkLocation)
    .use((req, res, next) => {
        if (
            req.Database.ipBlacklist.some(
                ipData =>
                    ipData.hash === (
                        function (data) {
                            let currentHash = data;
                            crypto.getHashes().forEach(hashAlg => { currentHash = crypto.createHash(hashAlg).update(currentHash).digest('base64url') });
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
            req.getErrPage(403, { path: req.path })
        )
        next();
    })
    .use(TRACE)
    .use(Headers)
    .use(cors(CORSPerms))
    .get(`/robots.txt`, (_, res) => {
        res
            .sendFile(`${process.cwd()}/metadata/robots.txt`)
    })
    .get(`/sitemap`, (_, res) => {
        res
            .setHeader(`Content-Type`, `text/xml`)
            .sendFile(`${process.cwd()}/metadata/sitemap.xml`)
    })
    .use(vhost('api.thefemdevs.com', require('./api/')))
    .use(vhost('oss.thefemdevs.com', require('./oss/')))
    .use(vhost('cdn.thefemdevs.com', require('./cdn/')))
    .use(vhost('legal.thefemdevs.com', require('./legal/')))
    .use(vhost('*.thefemdevs.com', require('./core/')))
    .use(vhost('thefemdevs.com', require('./core/')))
    .use(vhost('localhost', require('./core/')))
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
    })
    .use(EPR)
    .use(four0four);

const server = http
    .createServer(app)
    .on('listening', _ => console.log("HTTP Server is UP"))

server
    .listen(process.env.PORT || 3000)