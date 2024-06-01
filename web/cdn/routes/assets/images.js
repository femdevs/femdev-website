const router = require('express').Router();
const fs = require('fs');

router
	.get('/icon', (req, res) => {
		const options = fs.readdirSync(`${process.cwd()}/assets/media/logos/`);
		res
			.setHeader('Cache-Control', 'no-store')
			.setHeader('Expires', '0')
			.setHeader("Content-Type", "image/svg+xml")
			.sendFile(`${process.cwd()}/assets/media/logos/${options.at(Math.floor(Math.random() * options.length))}`);
	})
	.get('/icon/:name', (req, res) => {
		res
			.setHeader('Cache-Control', 'public, max-age 10800, max-stale 10800, stale-if-error 86400, no-transform, immutable')
			.setHeader("Content-Type", "image/svg+xml")
			.send(fs.readFileSync(`${process.cwd()}/assets/media/logos/${req.params.name.toLowerCase()}.svg`));
	})
	.get('/deficon', (req, res) => {
		res
			.setHeader('Cache-Control', 'public, max-age 10800, max-stale 10800, stale-if-error 86400, no-transform, immutable')
			.setHeader("Content-Type", "image/svg+xml")
			.sendFile(`${process.cwd()}/assets/media/logos/default.svg`);
	})
	.get('/favicon.ico', (req, res) => {
		res
			.setHeader('Cache-Control', 'no-store')
			.setHeader("Content-Type", "image/svg+xml")
			.sendFile(`${process.cwd()}/assets/media/logos/default.svg`);
	})
	.get('/cus', (req, res) => {
		res
			.setHeader('Cache-Control', 'no-store')
			.setHeader("Content-Type", "image/png")
			.sendFile(`${process.cwd()}/assets/media/images/custom-icon.png`);
	})
	.get('/team/:id', async (req, res) => {
		const { id } = req.params;
		res
			.setHeader('Cache-Control', 'public, max-age 10800, max-stale 10800, stale-if-error 86400, no-transform, immutable')
			.setHeader("Content-Type", "image/png")
			.send(Buffer.from(await fetch(`https://api.daad.wtf/discord/user/${id}/avatar`).then(res => res.arrayBuffer())));
	})
	.get('/grav/:hash', async (req, res) => {
		const { hash } = req.params;
		const url = new URL(`/avatar/${hash}`, 'https://www.gravatar.com');
		url.search = (new URLSearchParams([['size', '800'], ['d', 'mp'], ['r', 'x'], ['d', 'retro']])).toString();
		res
			.setHeader('Cache-Control', 'no-store')
			.setHeader("Content-Type", "image/png")
			.send(Buffer.from(await fetch(url).then(res => res.arrayBuffer())));
	})
	.get('/static/:file', (req, res) => {
		res.sendFile(`${process.cwd()}/assets/media/images/${req.params.file}`);
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
