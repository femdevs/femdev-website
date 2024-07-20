const router = require('express').Router();
const QuoteFormatter = require('../../../modules/api/quote');

router
	.get('/kanye', async (req, res) => {
		if (!(await req.checkPermissions(req, res, { multi: false, perm: 'Quote::Kanye', allowMgr: true }))) return;
		const { data } = await req.axiosReq('https://api.kanye.rest');
		const fData = new QuoteFormatter({
			quote: JSON.parse(data).quote,
			author: 'Kanye West',
			tags: [],
		});
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
	.get('/ronswanson', async (req, res) => {
		if (!(await req.checkPermissions(req, res, { multi: false, perm: 'Quote::RonSwanson', allowMgr: true }))) return;
		const { data } = await req.axiosReq('https://ron-swanson-quotes.herokuapp.com/v2/quotes');
		// res.send(JSON.parse(data)[0]);
		const fData = new QuoteFormatter({
			quote: JSON.parse(data)[0],
			author: 'Ron Swanson',
			tags: [],
		});
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
	.get('/random', async (req, res) => {
		if (!(await req.checkPermissions(req, res, { multi: false, perm: 'Quote::Random', allowMgr: true }))) return;
		const { data } = await req.axiosReq('https://api.quotable.io/random');
		const ResData = JSON.parse(data);
		const fData = new QuoteFormatter({
			quote: ResData.content,
			author: ResData.author,
			tags: ResData.tags,
		});
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
