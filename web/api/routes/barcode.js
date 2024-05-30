const router = require('express').Router();
const barcode = require('bwip-js');

router
	.get('/gen/:codec', async (req, res) => {
		if (!(await req.checkPermissions(req, res, { multi: false, perm: 'Barcode::Generate', allowMgr: true }))) return;
		const { content } = req.query;
		if (!content) return res.sendError(6);
		const fmat = req.headers['x-format'] === 'svg';
		try {
			const BCDO = await barcode[`to${fmat ? 'SVG' : 'Buffer'}`]({
				bcid: req.params.codec,
				text: content,
				scale: 3,
				includetext: true,
				textxalign: 'center',
				textsize: 16,
				textyoffset: 10,
				paddingheight: 2,
				paddingwidth: 2,
				backgroundcolor: 'FFFFFF',
				color: '000000',
				barcolor: '000000',
			});
			if (BCDO instanceof Buffer) res.setHeader('Content-Disposition', 'inline; filename="barcode.png"');
			res
				.setHeader('Content-Type', `image/${fmat ? 'svg+xml' : 'png'}`)
				.send(BCDO);
		} catch (err) {
			res.sendError(0);
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
