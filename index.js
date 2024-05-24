require('dotenv').config();
const http = require('http');
const app = require('express')();
const Admin = require('firebase-admin');
const { createHash: ch, getHashes: gh } = require('crypto');
const { RateLimiterMemory } = require('rate-limiter-flexible');
const { WebSecurity, CSPObj, PermissionPolicy, ReportToGroup, ReportingEndpoint, Headers: headers } = require('@therealbenpai/zdcors');
//- Middleware
const IPM = require('./middleware/IP'); //? IP Middleware
const SM = require('./middleware/session'); //? Session Manager
const errPages = require('./middleware/errpages'); //? Error Pages
const wUtils = require('@therealbenpai/webutils');
const reqLogs = [];
/** @type {Map<String, Map<String, any>|String>} @desciption Used to store data throughout requests */
const Persistance = new Map();
const RateLimiter = new RateLimiterMemory({ points: 2400, duration: 60 })
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
const db = new (require('./functions/database'))();
const nf = (req, res, _) => res.status(404).render(`misc/404.pug`, req.getErrPage(404, { path: req.path }))
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
            Database: db, Formatter,
            RateLimitMem: RateLimiter,
            getErrPage: (c, d) => errPages.get(c)(d)
        })
        next();
    })
    .use(wUtils.Logger(console))
    .use(IPM.infoMiddleware)
    .use(SM)
    .use(IPM.checkLocation)
    .use((req, res, next) => {
        const
            lh = 'localhost',
            sip = req.ip || 'unknown',
            lif = x => x.replace('::ffff:', ''),
            ht = 'id-rsassa-pkcs1-v1_5-with-sha3-512'
        return (
            db.ipb.some(({ hash: h }) => h === wUtils.Crypt.Crypto.completeHash(lif(req.ip) ? lh : lif(sip), ht)))
            ? res.status(403).render(`misc/403.pug`, errPages.get(403)({ path: req.path }))
            : next();
    })
    .use(wUtils.Trace)
    .use(wUtils.Headers)
    .use(headers({
        CORS: WebSecurity.CORS({ maxAge: 86400, allowCredentials: true, allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'], allowHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-HTTP-Method-Override', 'Accept', 'Origin'] }, {}),
        CSP: WebSecurity.CSP(
            new CSPObj('imgSrc', false, [], false, true, []),
            new CSPObj('fontSrc', false, [], false, true, []),
            new CSPObj('mediaSrc', false, [], false, true, []),
            new CSPObj('childSrc', false, [], false, true, []),
            new CSPObj('objectSrc', true, [], false, false, []),
            new CSPObj('defaultSrc', false, [], false, true, []),
            new CSPObj('connectSrc', false, [], false, true, []),
            new CSPObj('formAction', false, [], true, false, []),
            new CSPObj('prefetchSrc', false, [], false, true, []),
            new CSPObj('manifestSrc', false, [], true, false, []),
            new CSPObj('reportTo', false, [], false, false, ['csp-ep']),
            new CSPObj('blockAllMixedContent', false, [], false, false, []),
            new CSPObj('upgradeInsecureRequests', false, [], false, false, []),
            new CSPObj('requireTrustedTypesFor', false, ['script'], false, false, []),
            new CSPObj('reportUri', false, [], false, false, ['https://security.thefemdevs.com/csp/new']),
            new CSPObj('baseUri', false, [], true, false, ['thefemdevs.com', 'security.thefemdevs.com', 'cdn.thefemdevs.com']),
            new CSPObj('scriptSrc', false, [], true, false, ['blob:', ...WebSecurity.CD('thefemdevs.com'), ...WebSecurity.CD('google.com'), ...WebSecurity.CD('fontawesome.com')]),
            new CSPObj('styleSrc', false, [], true, false, [].concat(WebSecurity.CD('google.com'), WebSecurity.CD('googleapis.com'), WebSecurity.CD('thefemdevs.com'), WebSecurity.CD('fontawesome.com'), WebSecurity.CD('cloudflare.com')),
            )),
        PermissionPolicy: WebSecurity.PermissionPolicy(
            new PermissionPolicy('hid', { none: true }),
            new PermissionPolicy('usb', { none: true }),
            new PermissionPolicy('midi', { none: true }),
            new PermissionPolicy('camera', { none: true }),
            new PermissionPolicy('serial', { none: true }),
            new PermissionPolicy('battery', { none: true }),
            new PermissionPolicy('gamepad', { none: true }),
            new PermissionPolicy('autoplay', { none: true }),
            new PermissionPolicy('webShare', { self: true }),
            new PermissionPolicy('bluetooth', { none: true }),
            new PermissionPolicy('gyroscope', { none: true }),
            new PermissionPolicy('fullscreen', { self: true }),
            new PermissionPolicy('magnetometer', { none: true }),
            new PermissionPolicy('accelerometer', { none: true }),
            new PermissionPolicy('idleDetection', { none: true }),
            new PermissionPolicy('browsingTopics', { none: true }),
            new PermissionPolicy('localFonts', { wildcard: true }),
            new PermissionPolicy('screenWakeLock', { none: true }),
            new PermissionPolicy('display-capture', { none: true }),
            new PermissionPolicy('document-domain', { none: true }),
            new PermissionPolicy('encrypted-media', { none: true }),
            new PermissionPolicy('windowManagement', { none: true }),
            new PermissionPolicy('xrSpacialTracking', { none: true }),
            new PermissionPolicy('ambientLightSensor', { none: true }),
            new PermissionPolicy('executionWhileNotRendered', { none: true }),
            new PermissionPolicy('executionWhileOutOfViewport', { none: true }),
            new PermissionPolicy('microphone', { self: true, domains: WebSecurity.CD('thefemdevs.com') }),
            new PermissionPolicy('storageAccess', { self: true, domains: WebSecurity.CD('thefemdevs.com') }),
            new PermissionPolicy('otpCredentials', { self: true, domains: WebSecurity.CD('thefemdevs.com') }),
            new PermissionPolicy('pictureInPicture', { self: true, domains: WebSecurity.CD('thefemdevs.com') }),
            new PermissionPolicy('speakerSelection', { self: true, domains: WebSecurity.CD('thefemdevs.com') }),
            new PermissionPolicy('identityCredentialsGet', { self: true, domains: WebSecurity.CD('thefemdevs.com') }),
            new PermissionPolicy('publickeyCredentialsGet', { self: true, domains: WebSecurity.CD('thefemdevs.com') }),
            new PermissionPolicy('publickeyCredentialsCreate', { self: true, domains: WebSecurity.CD('thefemdevs.com') }),
            new PermissionPolicy('payment', { self: true, domains: [].concat(WebSecurity.CD('thefemdevs.com'), WebSecurity.CD('stripe.com')) }),
            new PermissionPolicy('geolocation', { self: true, domains: [].concat(WebSecurity.CD('google.com'), WebSecurity.CD('googleapis.com'), WebSecurity.CD('thefemdevs.com')) }),
        ),
        ReportingEndpoints: WebSecurity.ReportingEndpoints(...Array.of(['csp-ep', 'csp/new'], ['doc-ep', 'doc/new'], ['default', 'report/new']).map(g => new ReportingEndpoint(...g))),
        HSTS: WebSecurity.HSTS({ ma: 31536000, iSD: true, pl: true }),
        ReportTo: WebSecurity.ReportTo(new ReportToGroup('csp-ep', 31536000, ['csp', 'report'].map(g => `https://security.thefemdevs.com/${g}/new`)))
    }))
    .use(require('./web/router'))
    .use((req, res, next) => {
        const
            { path } = req,
            mu = req.method.toUpperCase();
        let am = app._router.stack.filter(r => r.route && r.route.path === path)
        if (am.length == 0) return next();
        am = ({ ...(am.map(r => r.route.stack[0]))[0] }).route.methods;
        if (req.method === 'OPTIONS') return res
            .setHeader('Allow', Object.keys(am).map(m => m.toUpperCase()).join(', '))
            .setHeader('Access-Control-Allow-Methods', Object.keys(am).map(m => m.toUpperCase()).join(', '))
            .status(204).send();
        if (am[mu]) return next();
        res.status(405).render(`misc/405.pug`, errPages.get(405)({ path, allowedMethod: am, methodUsed: mu }))
    })
    .use((err, _, res, __) => {
        console.log(err)
        res
            .status(501)
            .setHeader('X-Error-ID', '')
            .render(`misc/501.pug`, errPages.get(501)({ errorId: '' }))
    })
    .use(nf)
http
    .createServer(app)
    .listen(process.env.PORT || 3000, _ => console.log("HTTP Server is UP"))