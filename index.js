require('dotenv').config();
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const Admin = require('firebase-admin');
const { RateLimiterMemory } = require('rate-limiter-flexible');
const { WebSecurity, CSPObj, PermissionPolicy, ReportToGroup, ReportingEndpoint, Headers: headers } = require('@therealbenpai/zdcors');
const csl = console;
//- Middleware
const IPM = require('./middleware/IP'); //? IP Middleware
const SM = require('./middleware/session'); //? Session Manager
const errPages = require('./middleware/errpages'); //? Error Pages
const wUtils = require('@therealbenpai/webutils');
const reqLogs = [];
/** @type {Map<String, Map<String, any>|String>} @desciption Used to store data throughout requests */
const Persistance = new Map();
const RateLimiter = new RateLimiterMemory({ points: 2400, duration: 60 });
class Formatter {
	static formatDateTime = v =>
		new Intl.DateTimeFormat('en-US', {
			year: "numeric",
			month: "long",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
			second: "2-digit",
			weekday: "long",
			timeZone: "America/Detroit",
			timeZoneName: "longGeneric",
		})
			.format(v);
	static formatDate = v => new Intl.DateTimeFormat('en-US', { year: "numeric", month: "long", day: "numeric", weekday: "long" }).format(v);
	static formatTime = v => new Intl.DateTimeFormat('en-US', {
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
		timeZone: "America/Detroit",
		timeZoneName: "shortOffset",
	})
		.format(v);
	static dobToAge = dob => Math.abs(new Date(Date.now() - new Date(dob).getTime()).getUTCFullYear() - 1970);
}
const FirebaseServiceAccount = JSON.parse(process.env.FIREBASE_SA);
const AdminApp = Admin.initializeApp({
	credential: Admin.credential.cert(FirebaseServiceAccount),
	databaseURL: `https://${FirebaseServiceAccount.projectId}-default-rtdb.firebaseio.com`,
});
const db = new (require('./functions/database'))();
const nf = (req, res, _) => res.status(404).render("misc/404.pug", req.getErrPage(404, { path: req.path }));
app
	.set('view engine', 'pug')
	.set('case sensitive routing', false)
	.set('trust proxy', true)
	.set('x-powered-by', false)
	.use(
		// -- Divider -- //
		(req, _, next) => {
			Object.assign(req, {
				reqLogs,
				Persistance,
				AdminApp,
				auth: AdminApp.auth(),
				Database: db,
				Formatter,
				RateLimitMem: RateLimiter,
				getErrPage: (code, data) => errPages.get(code)(data),
			});
			next();
		},
		// -- Divider -- //
		wUtils.Logger(csl),
		// -- Divider -- //
		IPM.infoMiddleware,
		// -- Divider -- //
		SM,
		// -- Divider -- //
		IPM.checkLocation,
		// -- Divider -- //
		(req, res, next) => {
			const
				lh = 'localhost',
				sip = req.ip || 'unknown',
				lif = data => data.replace('::ffff:', ''),
				ht = 'id-rsassa-pkcs1-v1_5-with-sha3-512';
			return (
				db.ipb.some(({ hash }) => hash === wUtils.Crypt.Crypto.completeHash(lif(req.ip) ? lh : lif(sip), ht)))
				? res.status(403).render("misc/403.pug", errPages.get(403)({ path: req.path }))
				: next();
		},
		// -- Divider -- //
		wUtils.Trace,
		// -- Divider -- //
		wUtils.Headers,
		// -- Divider -- //
		headers({
			CORS: WebSecurity.CORS({
				maxAge: 86400,
				allowCredentials: true,
				allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
				allowHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-HTTP-Method-Override', 'Accept', 'Origin'],
			}, {
				embedderPolicy: 'unsafe-none',
				resourcePolicy: 'cross-origin',
				openerPolicy: 'same-origin',
			}),
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
				new CSPObj('styleSrc', false, ['unsafe-inline'], false, true, []),
				new CSPObj('upgradeInsecureRequests', false, [], false, false, []),
				new CSPObj('reportUri', false, [], false, false, ['https://security.thefemdevs.com/csp/new']),
				new CSPObj('baseUri', false, [], true, false, ['thefemdevs.com', 'security.thefemdevs.com', 'cdn.thefemdevs.com']),
				new CSPObj('scriptSrc', false, [], true, false,
					['blob:', ['thefemdevs.com', 'google.com', 'fontawesome.com'].map(WebSecurity.CD)].flat(2),
				),
			),
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
				new PermissionPolicy('geolocation', { self: true, domains: ['googleapis.com', 'thefemdevs.com'].map(WebSecurity.CD) }),
				new PermissionPolicy('payment', { self: true, domains: [WebSecurity.CD('thefemdevs.com'), WebSecurity.CD('stripe.com')] }),
			),
			ReportingEndpoints: WebSecurity.ReportingEndpoints(
				...Array.of(['csp-ep', 'csp/new'], ['doc-ep', 'doc/new'], ['default', 'report/new']).map(([v1, v2]) => new ReportingEndpoint(v1, v2)),
			),
			HSTS: WebSecurity.HSTS({ ma: 31536000, iSD: true, pl: true }),
			ReportTo: WebSecurity.ReportTo(
				new ReportToGroup('csp-ep', 31536000, ['csp', 'report'].map(val => `https://security.thefemdevs.com/${val}/new`)),
			),
		}),
		// -- Divider -- //
		require('./web/router'),
		// -- Divider -- //
		(req, res, next) => {
			const
				{ path } = req,
				mu = req.method.toUpperCase();
			let am = app._router.stack.filter(router => router.route && router.route.path === path);
			if (am.length === 0) return next();
			am = ({ ...(am.map(router => router.route.stack[0]))[0] }).route.methods;
			if (req.method === 'OPTIONS') {
				return res
					.setHeader('Allow', Object.keys(am).map(verb => verb.toUpperCase()).join(', '))
					.setHeader('Access-Control-Allow-Methods', Object.keys(am).map(verb => verb.toUpperCase()).join(', '))
					.status(204).send();
			}
			if (am[mu]) return next();
			return res.status(405).render("misc/405.pug", errPages.get(405)({ path, allowedMethod: am, methodUsed: mu }));
		},
		// -- Divider -- //
		(err, req, res, next) => {
			csl.error(err);
			res
				.status(501)
				.setHeader('X-Error-ID', '')
				.render("misc/501.pug", errPages.get(501)({ errorId: '' }));
		},
		// -- Divider -- //
		nf,
	);

server
	.listen(process.env.PORT || 3000, () => csl.log("HTTP Server is UP"));

module.exports = server;
