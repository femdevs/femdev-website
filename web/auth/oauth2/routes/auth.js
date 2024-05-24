const router = require('express').Router();

router
	.get('/info', (req, res) => {
		res.send('get OAuth2 Token Info');
	})
	.post('/create', (req, res) => {
		res.send('create OAuth2 Token');
	})
	.put('/refresh', (req, res) => {
		res.send('refresh OAuth2 Token');
	})
	.patch('/update', (req, res) => {
		res.send('update OAuth2 Token');
	})
	.delete('/revoke', (req, res) => {
		res.send('revoke OAuth2 Token');
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
