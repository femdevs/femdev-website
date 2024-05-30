const router = require('express').Router();

router
	.get('/400', (req, res) => {
		const { path } = req;
		res.render(
			"misc/400.pug",
			req.getErrPage(400, { path }),
		);
	})
	.get("/401", (req, res) => {
		const { path } = req;
		res.render(
			"misc/401.pug",
			req.getErrPage(401, { path }),
		);
	})
	.get("/404", (req, res) => {
		const { path } = req;
		res.render(
			"misc/404.pug",
			req.getErrPage(404, { path }),
		);
	})
	.get("/405", (req, res) => {
		const { path, method } = req;
		const methodUsed = method.toUpperCase();
		let allowedMethods = router.stack.filter(routerData => routerData.route && routerData.route.path === path);
		if (allowedMethods.length === 0) return next();
		allowedMethods.map(routerData => routerData.route.stack[0]);
		allowedMethods = { ...allowedMethods[0] };
		allowedMethods = allowedMethods.route.methods;
		res.render(
			"misc/405.pug",
			req.getErrPage(405, { path, allowedMethods, methodUsed }),
		);
	})
	.get("/429", (req, res) => {
		const { path } = req;
		res.render(
			"misc/429.pug",
			req.getErrPage(429, { path }),
		);
	})
	.get("/501", (req, res) => {
		res.render(
			"misc/501.pug",
			req.getErrPage(501, { errorId: require('../../../functions/crypto').completeHash('Testing Error') }),
		);
	})
	.get("/location", (req, res) => {
		const { path } = req;
		return res.render(
			"misc/location_denial.pug",
			req.getErrPage(451, { path }),
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
