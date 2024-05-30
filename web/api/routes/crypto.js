const router = require('express').Router();
const webUtils = require("@therealbenpai/webutils");

router
	.get('/enc', async (req, res) => {
		if (!(await req.checkPermissions(req, res, { multi: false, perm: 'Cryptography::Encrypt', allowMgr: true }))) return;
		if (!req.query) return res.sendError(6);
		const { query: { data } } = req;
		if (!data) return res.sendError(6);
		return Promise.resolve(webUtils.Crypt.Auto.encrypt(data)).then(
			data => res.status(200).send(data),
			err => res.sendError(12),
		);
	})
	.get('/dec', async (req, res) => {
		if (!(await req.checkPermissions(req, res, { multi: false, perm: 'Cryptography::Decrypt', allowMgr: true }))) return;
		if (!req.query) return res.sendError(6);
		const { query: { data } } = req;
		if (!data) return res.sendError(6);
		return Promise.resolve(webUtils.Crypt.Auto.decrypt(data))
			.then(
				data => res.status(200).send(data),
				err => res.sendError(13),
			);
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
