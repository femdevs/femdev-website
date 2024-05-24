const router = require('express').Router();

router
	.get('/privacy', async (req, res) => {
		res
			.setHeader('Max-Age', 60 * 60 * 24 * 30)
			.setHeader('Cache-Control', 'public')
			.setHeader('Content-Type', 'text/html; charset=utf-8')
			.render(
				`legal/privacy.pug`,
				{
					status: (await req.Database.getServerStatus()),
					meta: {
						title: 'Privacy Policy',
						desc: 'Privacy Policy',
						url: 'https://thefemdevs.com/legal/privacy',
					},
				},
			);
	})
	.get('/terms', async (req, res) => {
		res
			.setHeader('Max-Age', 60 * 60 * 24 * 30)
			.setHeader('Cache-Control', 'public')
			.setHeader('Content-Type', 'text/html; charset=utf-8')
			.render(
				`legal/TaC.pug`,
				{
					status: (await req.Database.getServerStatus()),
					meta: {
						title: 'Terms and Conditions',
						desc: 'Terms and Conditions',
						url: 'https://thefemdevs.com/legal/terms',
					},
				},
			);
	})
	.get('/cookies', async (req, res) => {
		res
			.setHeader('Max-Age', 60 * 60 * 24 * 30)
			.setHeader('Cache-Control', 'public')
			.setHeader('Content-Type', 'text/html; charset=utf-8')
			.render(
				`legal/cookies.pug`,
				{
					status: (await req.Database.getServerStatus()),
					meta: {
						title: 'Cookie Policy',
						desc: 'Cookie Policy',
						url: 'https://thefemdevs.com/legal/cookies',
					},
				},
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
			`misc/405.pug`,
			req.getErrPage(405, { path, allowedMethods, methodUsed }),
		);
	});

module.exports = router;
