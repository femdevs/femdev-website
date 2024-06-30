const express = require('express');
const router = express.Router();
const Auth = require('firebase/auth');
const { SQL } = require('sql-template-strings');

router
	.get('/login', async (req, res) => {
		res.render('admin/auth/login.pug', {
			status: (await req.Database.getServerStatus()),
			meta: {
				title: 'Login | Admin Panel',
				desc: 'The admin panel for the FemDevs!',
				url: 'https://admin.thefemdevs.com/login',
				canonical: 'https://admin.thefemdevs.com/login',
			},
		});
	})
	.post('/login',
		express.urlencoded({
			extended: true,
			type: 'application/x-www-form-urlencoded',
		}),
		async (req, res) => {
			const { username, password } = req.body;
			/** @type {Auth.UserCredential} */
			const firebaseRes = await Auth.signInWithEmailAndPassword(req.auth, username, password)
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
			if (!user) return;
			const connection = await req.Database.pool.connect();
			const { rows } = await connection.query(SQL`SELECT * FROM public.users WHERE firebaseuid = ${user.uid}`);
			if (rows.length === 0) return res.sendError(21);
			const { uid, email, photoURL, phoneNumber, emailVerified, disabled, metadata } = user;
			const userData = {
				uid,
				name: {
					first: rows[0].firstname,
					last: rows[0].lastname,
					display: rows[0].displayname,
				},
				contact: {
					email: {
						address: email,
						verified: emailVerified,
					},
					phone: {
						number: phoneNumber,
					},
				},
				photoURL,
				disabled,
				creationTime: metadata.creationTime,
				lastSignInTime: metadata.lastSignInTime,
				permissions: rows[0].permissions,
			};
			req.session = Object.assign(req.session, {
				user: userData,
			});
			return res.redirect('/');
		},
	)
	.get('/logout', (req, res) => {
		req.session = Object.assign(req.session, { user: {} });
		res.redirect('/');
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
