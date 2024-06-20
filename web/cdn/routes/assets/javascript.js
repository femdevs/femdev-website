const router = require('express').Router();
const UJS = require('uglify-js');
const fs = require('fs');

const UglifyConfig = {
	mangle: { toplevel: true, eval: true },
	output: { comments: false, semicolons: true, ascii_only: true, quote_style: 2 },
};

router
	.get('/ga', (req, res) => {
		const output = UJS.minify(fs.readFileSync(`${process.cwd()}/assets/scripts/Other/GoogleAnalytics.js`, 'utf8'), UglifyConfig);
		res
			.setHeader('Cache-Control', 'public, max-age=31536000')
			.setHeader('Content-Type', 'application/javascript')
			.send(output.code);
	})
	.get("/fs/:file", (req, res) => {
		const { file } = req.params;
		const output = UJS.minify(fs.readFileSync(`${process.cwd()}/assets/scripts/File-Specific/${file}.js`, 'utf8'), UglifyConfig);
		res
			.setHeader('Content-Type', 'application/javascript')
			.send(output.code);
	})
	.get("/cg/:file", (req, res) => {
		const { file } = req.params;

		const output = UJS.minify(fs.readFileSync(`${process.cwd()}/assets/scripts/CoG/${file}.js`, 'utf8'), UglifyConfig);
		res
			.setHeader('Content-Type', 'application/javascript')
			.send(output.code);
	})
	.get("/o/:file", (req, res) => {
		const { file } = req.params;
		const output = UJS.minify(fs.readFileSync(`${process.cwd()}/assets/scripts/Other/${file}.js`, 'utf8'), UglifyConfig);
		res
			.setHeader('Content-Type', 'application/javascript')
			.send(output.code);
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
