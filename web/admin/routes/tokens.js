const router = require('express').Router();
const { SQL } = require('sql-template-strings');
const User = require('../../../functions/userMgr');

router
	.get('/', async (req, res) => {
		if (!req.session.user) return res.redirect('/auth/login');
		const currentUser = {
			loggedIn: true,
			user: {
				name: {
					first: req.session.user.name.first,
					last: req.session.user.name.first,
					display: req.session.user.name.display,
				},
				email: req.session.user.contact.email,
			},
		};
		const UserPermissions = User.fromFullPermissionBitString(req.session.user.permissions);
		if (!UserPermissions.hasPermission('Global::Token.ReadAll', true)) return res.sendError(0);
		const connection = await req.Database.pool.connect();
		const { rows } = await connection.query('SELECT * FROM public.apitokens');
		const { rows: users } = await connection.query('SELECT * FROM public.users');
		const formattedTokens = [];
		for (const token of rows) {
			const userObj = users.find(user => user.firebaseuid === token.associatedfirebaseuid);
			formattedTokens.push(Object.assign({}, token, {
				user: {
					name: {
						first: userObj.firstname,
						last: userObj.lastname,
						display: userObj.displayname,
					},
					email: userObj.email,
				},
			}));
		}
		connection.release();
		res.render(
			'admin/private/tokens/index.pug',
			{
				tokens: formattedTokens.sort((tokenA, tokenB) => tokenA.id - tokenB.id),
				status: (await req.Database.getServerStatus()),
				meta: {
					title: 'Tokens | Admin Panel',
					desc: 'The admin panel for the FemDevs!',
					url: 'https://admin.thefemdevs.com/tokens',
					canonical: 'https://admin.thefemdevs.com/tokens',
				},
				currentUser,
			},
		);
	})
	.get('/disable/:id', async (req, res) => {
		const connection = await req.Database.pool.connect();
		const { id } = req.params;
		if (!id) return res.sendError(10);
		const { rows: tokenRows } = await connection.query(SQL`SELECT * FROM public.apitokens WHERE id = ${id}`);
		if (tokenRows.length === 0) return res.sendError(21);
		if (res.headersSent) return;
		await connection.query(SQL`UPDATE public.apitokens SET disabled = true WHERE token = ${tokenRows[0].token}`).catch(_ => res.sendError(21));
		if (res.headersSent) return;
		res.status(200).json({ message: 'Token disabled' });
		connection.release();
	})
	.get('/enable/:id', async (req, res) => {
		const connection = await req.Database.pool.connect();
		const { id } = req.params;
		if (!id) return res.sendError(10);
		const { rows: tokenRows } = await connection.query(SQL`SELECT * FROM public.apitokens WHERE id = ${id}`);
		if (tokenRows.length === 0) return res.sendError(21);
		if (res.headersSent) return;
		await connection.query(SQL`UPDATE public.apitokens SET disabled = false WHERE token = ${tokenRows[0].token}`).catch(_ => res.sendError(21));
		if (res.headersSent) return;
		res.status(200).json({ message: 'Token enabled' });
		connection.release();
	})
	.get('/block/:id', async (req, res) => {
		const connection = await req.Database.pool.connect();
		const { id } = req.params;
		if (!id) return res.sendError(10);
		const { rows: tokenRows } = await connection.query(SQL`SELECT * FROM public.apitokens WHERE id = ${id}`);
		if (tokenRows.length === 0) return res.sendError(21);
		if (res.headersSent) return;
		await connection.query(SQL`UPDATE public.apitokens SET blocked = true WHERE token = ${tokenRows[0].token}`).catch(_ => res.sendError(21));
		if (res.headersSent) return;
		res.status(200).json({ message: 'Token blocked' });
		connection.release();
	})
	.get('/unblock/:id', async (req, res) => {
		const connection = await req.Database.pool.connect();
		const { id } = req.params;
		if (!id) return res.sendError(10);
		const { rows: tokenRows } = await connection.query(SQL`SELECT * FROM public.apitokens WHERE id = ${id}`);
		if (tokenRows.length === 0) return res.sendError(21);
		if (res.headersSent) return;
		await connection.query(SQL`UPDATE public.apitokens SET blocked = false WHERE token = ${tokenRows[0].token}`).catch(_ => res.sendError(21));
		if (res.headersSent) return;
		res.status(200).json({ message: 'Token unblocked' });
		connection.release();
	})
	.get('/delete/:id', async (req, res) => {
		const connection = await req.Database.pool.connect();
		const { id } = req.params;
		if (!id) return res.sendError(10);
		const { rows: tokenRows } = await connection.query(SQL`SELECT * FROM public.apitokens WHERE id = ${id}`);
		if (tokenRows.length === 0) return res.sendError(21);
		if (res.headersSent) return;
		await connection.query(SQL`DELETE FROM public.apitokens WHERE token = ${tokenRows[0].token}`).catch(_ => res.sendError(21));
		if (res.headersSent) return;
		await connection.query(SQL`DELETE FROM public.apiusage WHERE apitoken = ${tokenRows[0].token}`).catch(_ => res.sendError(21));
		if (res.headersSent) return;
		res.status(200).json({ message: 'Token deleted' });
		connection.release();
	})
	.get('/create', (req, res) => { })
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
