const router = require('express').Router();

router
	.get('/', async (req, res) => res.render(
		'pages/mayuazael/index.pug',
		{
			status: (await req.Database.getServerStatus()),
			meta: {
				title: 'Mayuazael\'s Website',
				desc: 'The official website for mayuazael!',
				url: 'https://mayuazael.thefemdevs.com',
			},
		},
	))
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
	})
	.use((req, res, _) => res.status(404).render("misc/404.pug", req.getErrPage(404, { path: req.path })));

module.exports = router;
