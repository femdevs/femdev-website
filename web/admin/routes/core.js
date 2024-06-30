const router = require('express').Router();

router
	.get('/', async (req, res) => {
		const currentUser = {
			loggedIn: false,
			user: {
				name: {
					first: '',
					last: '',
					display: '',
				},
				email: '',
			},
		};
		if (req.session.user?.uid) {
			currentUser.loggedIn = true;
			const { user } = req.session;
			currentUser.user = {
				name: {
					first: user.name.first,
					last: user.name.first,
					display: user.name.display,
				},
				email: user.contact.email,
			};
		}
		res.render(
			'admin/public/index.pug',
			{
				status: (await req.Database.getServerStatus()),
				meta: {
					title: 'Admin Panel',
					desc: 'The admin panel for the FemDevs!',
					url: 'https://adminthefemdevs.com',
					canonical: 'https://admin.thefemdevs.com',
				},
				currentUser,
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
	});

module.exports = router;
