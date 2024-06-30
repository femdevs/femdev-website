const router = require('express').Router();
const { SQL } = require('sql-template-strings');
const User = require('../../../functions/userMgr');
const Admin = require('firebase-admin');

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
		if (!UserPermissions.hasPermission('Global::User.ReadAll', true)) return res.sendError(0);
		const connection = await req.Database.pool.connect();
		/** @type {Admin.auth.Auth} */
		const AdminAuth = req.AdminApp.auth();
		const { rows } = await connection.query(SQL`SELECT * FROM public.users`);
		const formattedUsers = [];
		for (const user of rows) {
			const { firebaseuid: uid } = user;
			const firebaseUser = await AdminAuth.getUser(uid);
			formattedUsers.push({
				id: user.id,
				uid,
				name: {
					first: user.firstname,
					last: user.lastname,
					display: user.displayname,
				},
				contact: {
					email: {
						address: firebaseUser.email,
						verified: firebaseUser.emailVerified,
					},
					phone: {
						number: firebaseUser.phoneNumber,
					},
				},
				photoURL: firebaseUser.photoURL,
				disabled: firebaseUser.disabled,
				creationTime: firebaseUser.metadata.creationTime,
				lastSignInTime: firebaseUser.metadata.lastSignInTime,
				permissions: User.fromFullPermissionBitString(user.permissions).getActivePerms(),
			});
		}
		connection.release();
		res.render(
			'admin/private/users/index.pug',
			{
				users: formattedUsers.sort((userA, userB) => userA.id - userB.id),
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
	.get('/delete/:id', async (req, res) => {
		if (!req.session.user) return res.redirect('/auth/login');
		const UserPermissions = User.fromFullPermissionBitString(req.session.user.permissions);
		if (!UserPermissions.hasPermission('Global::User.Delete', true)) return res.sendError(0);
		const connection = await req.Database.pool.connect();
		/** @type {Admin.auth.Auth} */
		const AdminAuth = req.AdminApp.auth();
		const { rows } = await connection.query(SQL`SELECT * FROM public.users WHERE id = ${req.params.id}`);
		if (rows.length === 0) return res.sendError(21);
		const { firebaseuid: uid } = rows[0];
		await AdminAuth.deleteUser(uid);
		const { rows: tokenRows } = await connection.query(SQL`SELECT * FROM public.apitokens WHERE associatedfirebaseuid = ${uid}`);
		if (tokenRows.length > 0) {
			await connection.query(SQL`DELETE FROM public.apitokens WHERE associatedfirebaseuid = ${uid}`);
			await connection.query(SQL`DELETE FROM public.apiusage WHERE apitoken = ${tokenRows[0].token}`);
		}
		await connection.query(SQL`DELETE FROM public.users WHERE id = ${req.params.id}`);
		connection.release();
		res.status(200).end();
	})
	.get('/disable/:id', async (req, res) => {
		if (!req.session.user) return res.redirect('/auth/login');
		const UserPermissions = User.fromFullPermissionBitString(req.session.user.permissions);
		if (!UserPermissions.hasPermission('Global::User.Write', true)) return res.sendError(0);
		const connection = await req.Database.pool.connect();
		/** @type {Admin.auth.Auth} */
		const AdminAuth = req.AdminApp.auth();
		const { rows } = await connection.query(SQL`SELECT * FROM public.users WHERE id = ${req.params.id}`);
		if (rows.length === 0) return res.sendError(21);
		const { firebaseuid: uid } = rows[0];
		await AdminAuth.updateUser(uid, { disabled: true });
		connection.release();
		res.status(200).end();
	})
	.get('/enable/:id', async (req, res) => {
		if (!req.session.user) return res.redirect('/auth/login');
		const UserPermissions = User.fromFullPermissionBitString(req.session.user.permissions);
		if (!UserPermissions.hasPermission('Global::User.Write', true)) return res.sendError(0);
		const connection = await req.Database.pool.connect();
		/** @type {Admin.auth.Auth} */
		const AdminAuth = req.AdminApp.auth();
		const { rows } = await connection.query(SQL`SELECT * FROM public.users WHERE id = ${req.params.id}`);
		if (rows.length === 0) return res.sendError(21);
		const { firebaseuid: uid } = rows[0];
		await AdminAuth.updateUser(uid, { disabled: false });
		connection.release();
		res.status(200).end();
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
