const express = require('express');
const router = express.Router();
const axios = require('axios');

//- Middleware
const APIAuth = require('../../../middleware/APITokenMgr');

//- Functions
const errorResponse = k => require('../../../functions/errorResponse').get(k);
const User = require('../../../functions/userMgr');

//- Routes
const user = require('./user');
const mail = require('./mail');
const token = require('./token');
const facts = require('./facts');
const phone = require('./phone');
const whois = require('./whois');
const crypto = require('./crypto');
const quotes = require('./quotes');
const weather = require('./weather');
const barcode = require('./barcode');
const location = require('./location');
const password = require('./password');
const dictionary = require('./dictionary');
const minecraft = require('./minecraft/router');

const axiosReq = async (url, cfgs) => {
	const Axios = new axios.Axios({
		validateStatus: () => true,
	});
	const AxiosRes = await Axios.get(url, cfgs);
	if (AxiosRes.status >= 400) {
		return {
			status: AxiosRes.status,
			data: AxiosRes.data,
		};
	}
	return AxiosRes;
};

router
	.use((req, res, next) => {
		const sendClose = (res, code) => {
			const resp = errorResponse(code);
			delete resp.httpCode;
			res.status(errorResponse(code).httpCode).json(resp); 
			return false;
		};
		const checkPermissions = async (req, res, permData) => {
			const { multi, perm, allowMgr } = permData;
			const connection = await req.Database.pool.connect();
			const [_, token] = req.headers['authorization'].split(' ');
			const { rows } = await connection.query(`SELECT * FROM public.apitokens WHERE token = '${token}' LIMIT 1;`);
			if (rows.length < 1) return sendClose(res, 4);
			if (rows[0].disabled === true) return sendClose(res, 5);
			if (rows[0].blocked === true) return sendClose(res, 2);
			const { rows: userRows } = await connection.query(`SELECT * FROM public.users WHERE firebaseuid = '${rows[0].associatedfirebaseuid}'`);
			connection.release();
			if (userRows.length === 0) return sendClose(res, 0);
			const { permissions } = userRows[0];
			const user = User.fromFullPermissionBitString(permissions);
			return (multi)
				? user.hasPermissions(allowMgr, ...perm) ? true : sendClose(res, 12)
				: user.hasPermission(perm, allowMgr) ? true : sendClose(res, 12);
		};
		Object.assign(req, { checkPermissions, axiosReq });
		Object.assign(res, {
			sendClose,
			sendError: code =>
				res.status(errorResponse(code).httpCode)
					.json({ code: errorResponse(code).code, message: errorResponse(code).message }),
		});
		next();
	})
	.get('/', (_, res) => res.redirect(301, 'https://docs.api.thefemdevs.com'))
	.get('/robots.txt', (_, res) => res.setHeader('Content-Type', 'text/plain; charset=utf8').sendFile(`${__dirname}/meta/robots.txt`))
	.get('/sitemap', (_, res) => res.setHeader('Content-Type', 'text/xml; charset=utf8').sendFile(`${__dirname}/meta/sitemap.xml`))
	.use(APIAuth, express.json())
	.use('/user', user)
	.use('/mail', mail)
	.use('/token', token)
	.use('/facts', facts)
	.use('/phone', phone)
	.use('/whois', whois)
	.use('/crypto', crypto)
	.use('/quotes', quotes)
	.use('/weather', weather)
	.use('/barcode', barcode)
	.use('/location', location)
	.use('/password', password)
	.use('/minecraft', minecraft)
	.use('/dictionary', dictionary)
	.use((req, res, next) => {
		const { path } = req;
		const methodUsed = req.method.toUpperCase();
		let allowedMethods = router.stack.filter(routerObj => routerObj.route && routerObj.route.path === path);
		if (allowedMethods.length === 0) return next();
		allowedMethods.map(routerObj => routerObj.route.stack[0]);
		allowedMethods = { ...allowedMethods[0] };
		allowedMethods = allowedMethods.route.methods;
		if (req.method === 'OPTIONS')
			return res.setHeader('Allow', Object.keys(allowedMethods)
				.map(verb => verb.toUpperCase()).join(', '))
				.setHeader('Access-Control-Allow-Methods', Object.keys(allowedMethods).map(verb => verb.toUpperCase()).join(', '))
				.status(204)
				.send();
		if (allowedMethods[methodUsed]) return next();
		return res.status(405).render(
			"misc/405.pug",
			req.getErrPage(405, { path, allowedMethods, methodUsed }),
		);
	});

module.exports = router;
