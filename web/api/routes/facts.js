const router = require('express').Router();

router
	.get('/chucknorris', async (req, res) => {
		if (!(await req.checkPermissions(req, res, { multi: false, perm: 'Facts::ChuckNorris', allowMgr: true }))) return;
		const { data } = await req.axiosReq('https://api.chucknorris.io/jokes/random');
		res.send(data.value);
	})
	.get('/dogs', async (req, res) => {
		if (!(await req.checkPermissions(req, res, { multi: false, perm: 'Facts::Dog', allowMgr: true }))) return;
		const { data } = await req.axiosReq('http://dog-api.kinduff.com/api/facts', { params: { number: 1 } });
		res.send(data.facts[0]);
	})
	.get('/cats', async (req, res) => {
		if (!(await req.checkPermissions(req, res, { multi: false, perm: 'Facts::Cat', allowMgr: true }))) return;
		const { data } = await req.axiosReq('https://meowfacts.herokuapp.com/');
		res.send(data.facts[0]);
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
