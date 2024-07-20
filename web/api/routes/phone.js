const router = require('express').Router();
const PhoneFormatter = require('../../../modules/api/phone');
require('dotenv').config();

router
	.get('/details', async (req, res) => {
		if (!(await req.checkPermissions(req, res, { multi: false, perm: 'Phone::Lookup', allowMgr: true }))) return;
		const numericalNumber = req.headers['x-number'].replace(/[^0-9]/gm, '');
		const AxiosRes = await req.axiosReq("/verify",
			{
				baseURL: 'https://api.veriphone.io/v2',
				params: {
					// eslint-disable-next-line camelcase
					default_country: 'US',
					key: process.env.VERIPHONE_TOKEN,
					phone: numericalNumber,
				},
			});
		if (AxiosRes.status === 404) return res.sendError(22);
		const fData = new PhoneFormatter(AxiosRes.data);
		switch (req.query.type) {
			case 'xml':
				return res
					.setHeader('Content-Type', 'application/xml')
					.send(fData.XML);
			case 'yaml':
				return res
					.setHeader('Content-Type', 'application/yaml')
					.send(fData.YAML);
			case 'json':
			default:
				return res.json(fData.JSON);
		}
	})
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
