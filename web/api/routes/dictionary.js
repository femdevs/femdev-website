const router = require('express').Router();

router
	.get('/def', async (req, res) => {
		if (!(await req.checkPermissions(req, res, { multi: false, perm: 'Dictionary::Definition', allowMgr: true }))) return;
		const word = req.headers['x-word'];
		if (!word) return res.sendError(8);
		const { data } = await req.axiosReq(
			`/${word}`,
			{
				baseURL: 'https://www.dictionaryapi.com/api/v3/references/collegiate/json',
				params: {
					key: process.env.DAK,
				},
			});
		res.json({defs: JSON.parse(data)[0].shortdef});
	})
	.get('/syn', async (req, res) => {
		if (!(await req.checkPermissions(req, res, { multi: false, perm: 'Dictionary::Synonym', allowMgr: true }))) return;
		const word = req.headers['x-word'];
		if (!word) return res.sendError(8);
		const { data } = await req.axiosReq(
			`/${word}`,
			{
				baseURL: 'https://www.dictionaryapi.com/api/v3/references/thesaurus/json/',
				params: {
					key: process.env.TAK,
				},
			});
		res.json({syns: JSON.parse(data)[0].meta.syns.reduce((acc, curr) => [...acc, ...curr], []).slice(0, 100)});
	})
	.get('/ant', async (req, res) => {
		if (!(await req.checkPermissions(req, res, { multi: false, perm: 'Dictionary::Antonym', allowMgr: true }))) return;
		const word = req.headers['x-word'];
		if (!word) return res.sendError(8);
		const { data } = await req.axiosReq(
			`/${word}`, {
				baseURL: 'https://www.dictionaryapi.com/api/v3/references/thesaurus/json/',
				params: {
					key: process.env.TAK,
				},
			});
		res.json({ants: JSON.parse(data)[0].meta.ants.reduce((acc, curr) => [...acc, ...curr], []).slice(0, 100)});
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
