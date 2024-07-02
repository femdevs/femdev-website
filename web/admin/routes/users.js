const express = require('express');
const router = express.Router();
const { SQL } = require('sql-template-strings');
const User = require('../../../functions/userMgr');
const Admin = require('firebase-admin');
const Auth = require('firebase/auth');

router
	.get('/', async (req, res) => {
		if (!req.session.user?.uid)
			return res.redirect(`https://auth.thefemdevs.com/login?redirect=${encodeURIComponent('https://admin.thefemdevs.com/users')}`);
		const currentUser = {
			loggedIn: true,
			user: {
				name: {
					first: req.session.user.name.first,
					last: req.session.user.name.first,
					display: req.session.user.name.display,
					initials: req.session.user.name.first[0] + req.session.user.name.last[0],
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
					title: 'Users | Admin Panel',
					desc: 'The admin panel for the FemDevs!',
					url: 'https://admin.thefemdevs.com/users',
					canonical: 'https://admin.thefemdevs.com/users',
				},
				currentUser,
			},
		);
	})
	.get('/delete/:id', async (req, res) => {
		if (!req.session.user?.uid)
			return res.redirect(`https://auth.thefemdevs.com/login?redirect=${encodeURIComponent('https://admin.thefemdevs.com/users')}`);
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
		if (!req.session.user?.uid)
			return res.redirect(`https://auth.thefemdevs.com/login?redirect=${encodeURIComponent('https://admin.thefemdevs.com/users')}`);
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
		if (!req.session.user?.uid)
			return res.redirect(`https://auth.thefemdevs.com/login?redirect=${encodeURIComponent('https://admin.thefemdevs.com/users')}`);
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
	.get('/create', async (req, res) => {
		if (!req.session.user?.uid)
			return res.redirect(`https://auth.thefemdevs.com/login?redirect=${encodeURIComponent('https://admin.thefemdevs.com/users/create')}`);
		const currentUser = {
			loggedIn: true,
			user: {
				name: {
					first: req.session.user.name.first,
					last: req.session.user.name.first,
					display: req.session.user.name.display,
					initials: req.session.user.name.first[0] + req.session.user.name.last[0],
				},
				email: req.session.user.contact.email,
			},
		};
		const UserPermissions = User.fromFullPermissionBitString(req.session.user.permissions);
		if (!UserPermissions.hasPermission('Global::User.Create', true)) return res.sendError(0);
		res.render(
			'admin/private/users/create.pug',
			{
				status: (await req.Database.getServerStatus()),
				meta: {
					title: 'Create User | Admin Panel',
					desc: 'The admin panel for the FemDevs!',
					url: 'https://admin.thefemdevs.com/users/create',
					canonical: 'https://admin.thefemdevs.com/users/create',
				},
				currentUser,
			},
		);
	})
	.post('/create',
		express.urlencoded({
			extended: true,
			type: 'application/x-www-form-urlencoded',
		}),
		async (req, res) => {
			if (!req.session.user?.uid)
				return res.redirect(`https://auth.thefemdevs.com/login?redirect=${encodeURIComponent('https://admin.thefemdevs.com/users/create')}`);
			const { firstname, lastname, displayname, email, password, permissions } = req.body;
			const phone = req.body?.phone || null;
			/** @type {Auth.UserCredential} */
			const firebaseRes = await Auth.createUserWithEmailAndPassword(req.auth, email, password)
				.catch(async error => {
					switch (error.code) {
						case 'auth/user-disabled': return res.render('admin/auth/login.pug', {
							status: (await req.Database.getServerStatus()),
							meta: {
								title: 'Login | Admin Panel',
								desc: 'The admin panel for the FemDevs!',
								url: 'https://admin.thefemdevs.com/login',
								canonical: 'https://admin.thefemdevs.com/login',
							},
							error: 'Your account has been disabled',
						});
						case 'auth/user-not-found':
						case 'auth/wrong-password':
						case 'auth/invalid-credential':
							return res.render('admin/auth/login.pug', {
								status: (await req.Database.getServerStatus()),
								meta: {
									title: 'Login | Admin Panel',
									desc: 'The admin panel for the FemDevs!',
									url: 'https://admin.thefemdevs.com/login',
									canonical: 'https://admin.thefemdevs.com/login',
								},
								error: 'We couldn\'t find an account with that email address and password',
							});
						default:
							// eslint-disable-next-line no-console
							console.log(error);
							return res.render('admin/auth/login.pug', {
								status: (await req.Database.getServerStatus()),
								meta: {
									title: 'Login | Admin Panel',
									desc: 'The admin panel for the FemDevs!',
									url: 'https://admin.thefemdevs.com/login',
									canonical: 'https://admin.thefemdevs.com/login',
								},
								error: 'An unknown error occurred',
							});
					}
				});
			if (!firebaseRes) return;
			const { user } = firebaseRes;
			/** @type {Admin.auth.Auth} */
			const AdminAuth = req.AdminApp.auth();
			AdminAuth.updateUser(user.uid, 
				{
					displayName: displayname,
					phoneNumber: phone || null,
				},
			);
			if (!user) return;
			const connection = await req.Database.pool.connect();
			await connection.query(
				SQL`INSERT INTO public.users
				(firebaseuid, firstname, lastname, displayname, email, permissions)
				VALUES (${user.uid}, ${firstname}, ${lastname}, ${displayname}, ${email}, ${permissions})`,
			);
			const { uid, photoURL, phoneNumber, emailVerified, disabled, metadata } = user;
			return res.redirect('/users');
		},
	)
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
