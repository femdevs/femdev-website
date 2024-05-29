const router = require('express').Router();
const fs = require("fs");
const CCSS = new (require("clean-css"))({
	compatibility: 'ie9',
	fetch: true,
	level: 2,
	rebase: true,
});

router
	.get(`/d`, async (req, res) => {
		const output = await CCSS.minify(fs.readFileSync(`${process.cwd()}/assets/styles/Default.css`, 'utf8'));
		res
			.setHeader('Content-Type', 'text/css')
			.send(output.styles);
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
