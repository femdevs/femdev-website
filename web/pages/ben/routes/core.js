const router = require('express').Router();



router
	.get('/', async (req, res) => {
		res.render(
			'pages/ben/index.pug',
			{
				meta: {
					title: "Benpai's Official Website",
					desc: 'The official website of Benpai!',
					url: 'https://ben.thefemdevs.com',
					canonical: 'https://ben.thefemdevs.com',
				},
			},
		);
	})
	.get('/player', async (req, res) => {
		res.render(
			'pages/ben/player.pug',
			{
				meta: {
					title: "Benpai's Music Player",
					desc: 'A live updating music player for what Benpai is currently listening to!',
					url: 'https://ben.thefemdevs.com/player',
					canonical: 'https://ben.thefemdevs.com/player',
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
			"misc/405.pug",
			req.getErrPage(405, { path, allowedMethods, methodUsed }),
		);
	})
	.use((req, res, _) => res.status(404).render("misc/404.pug", req.getErrPage(404, { path: req.path })));

module.exports = router;
