const express = require('express');
const router = express.Router();
const Auth = require('firebase/auth');
const Admin = require('firebase-admin');
const Crypto = require('../../../../functions/crypto');
const { SQL } = require('sql-template-strings');

router
	.get('/login', async (req, res) => {
		res.render('auth/login.pug', {
			status: (await req.Database.getServerStatus()),
			meta: {
				title: 'Login',
				desc: 'Sign in to the FemDevs!',
				url: 'https://auth.thefemdevs.com/login',
				canonical: 'https://auth.thefemdevs.com/login',
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
						case 'auth/user-disabled': return res.render('auth/login.pug', {
							status: (await req.Database.getServerStatus()),
							meta: {
								title: 'Login',
								desc: 'Sign in to the FemDevs!',
								url: 'https://auth.thefemdevs.com/login',
								canonical: 'https://auth.thefemdevs.com/login',
							},
							error: 'Your account has been disabled',
						});
						case 'auth/user-not-found':
						case 'auth/wrong-password':
						case 'auth/invalid-credential':
							return res.render('auth/login.pug', {
								status: (await req.Database.getServerStatus()),
								meta: {
									title: 'Login',
									desc: 'Sign in to the FemDevs!',
									url: 'https://auth.thefemdevs.com/login',
									canonical: 'https://auth.thefemdevs.com/login',
								},
								error: 'We couldn\'t find an account with that email address and password',
							});
						default:
							// eslint-disable-next-line no-console
							console.log(error);
							return res.render('auth/login.pug', {
								status: (await req.Database.getServerStatus()),
								meta: {
									title: 'Login',
									desc: 'Sign in to the FemDevs!',
									url: 'https://auth.thefemdevs.com/login',
									canonical: 'https://auth.thefemdevs.com/login',
								},
								error: 'An unknown error occurred',
							});
					}
				});
			if (res.headersSent) return;
			if (!firebaseRes) return;
			const { user } = firebaseRes;
			if (!user) return;
			const connection = await req.Database.pool.connect();
			const { rows } = await connection.query(SQL`SELECT * FROM public.users WHERE firebaseuid = ${user.uid}`);
			if (rows.length === 0) return res.sendError(21);
			const { uid, email, photoURL, phoneNumber, emailVerified, disabled, metadata } = user;
			const userData = {
				uid,
				credentials: Crypto.generate(`${email}:${password}`),
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
			return res.redirect(req.query.redirect || '/');
		},
	)
	.get('/register', async (req, res) => {
		res.render('auth/register.pug', {
			status: (await req.Database.getServerStatus()),
			meta: {
				title: 'Register',
				desc: 'Join the FemDevs!',
				url: 'https://auth.thefemdevs.com/register',
				canonical: 'https://auth.thefemdevs.com/register',
			},
		});
	})
	.post('/register',
		express.urlencoded({
			extended: true,
			type: 'application/x-www-form-urlencoded',
		}),
		async (req, res) => {
			const { firstname, lastname, email, password } = req.body;
			/** @type {Auth.UserCredential} */
			const firebaseRes = await Auth.createUserWithEmailAndPassword(req.auth, email, password)
				.catch(async error => {
					switch (error.code) {
						case 'auth/email-already-in-use':
							return res.render('auth/register.pug', {
								status: (await req.Database.getServerStatus()),
								meta: {
									title: 'Register',
									desc: 'Join the FemDevs!',
									url: 'https://auth.thefemdevs.com/register',
									canonical: 'https://auth.thefemdevs.com/register',
								},
								error: 'An account with that email address already exists',
							});
						default:
							// eslint-disable-next-line no-console
							console.log(error);
							return res.render('auth/register.pug', {
								status: (await req.Database.getServerStatus()),
								meta: {
									title: 'Register',
									desc: 'Join the FemDevs!',
									url: 'https://auth.thefemdevs.com/register',
									canonical: 'https://auth.thefemdevs.com/register',
								},
								error: 'An unknown error occurred',
							});
					}
				});
			if (res.headersSent) return;
			if (!firebaseRes) return;
			const { user } = firebaseRes;
			if (!user) return;
			const connection = await req.Database.pool.connect();
			await connection.query(
				SQL`INSERT INTO public.users
				(firebaseuid, firstname, lastname, displayname, email, permissions)
				VALUES (${user.uid}, ${firstname}, ${lastname}, '', ${email}, '')`,
			);
			return res.redirect(req.query.redirect || '/');
		},
	)
	.get('/forgot', async (req, res) => {
		res.render('auth/forgotPassword.pug', {
			status: (await req.Database.getServerStatus()),
			meta: {
				title: 'Forgot Password',
				desc: 'Recover your account with the FemDevs!',
				url: 'https://auth.thefemdevs.com/forgot',
				canonical: 'https://auth.thefemdevs.com/forgot',
			},
		});
	})
	.post('/forgot',
		express.urlencoded({
			extended: true,
			type: 'application/x-www-form-urlencoded',
		}),
		async (req, res) => {
			const { email } = req.body;
			await Auth.sendPasswordResetEmail(req.auth, email, { handleCodeInApp: false })
				.catch(async error => {
					switch (error.code) {
						case 'auth/user-not-found':
							return res.render('auth/forgotPassword.pug', {
								status: (await req.Database.getServerStatus()),
								meta: {
									title: 'Forgot Password',
									desc: 'Recover your account with the FemDevs!',
									url: 'https://auth.thefemdevs.com/forgot',
									canonical: 'https://auth.thefemdevs.com/forgot',
								},
								error: 'We couldn\'t find an account with that email address',
							});
						default:
							// eslint-disable-next-line no-console
							console.log(error);
							return res.render('auth/forgotPassword.pug', {
								status: (await req.Database.getServerStatus()),
								meta: {
									title: 'Forgot Password',
									desc: 'Recover your account with the FemDevs!',
									url: 'https://auth.thefemdevs.com/forgot',
									canonical: 'https://auth.thefemdevs.com/forgot',
								},
								error: 'An unknown error occurred',
							});
					}
				});
			if (res.headersSent) return;
			return res.render('auth/forgotPasswordSent.pug', {
				status: (await req.Database.getServerStatus()),
				meta: {
					title: 'Forgot Password',
					desc: 'Recover your account with the FemDevs!',
					url: 'https://auth.thefemdevs.com/forgot',
					canonical: 'https://auth.thefemdevs.com/forgot',
				},
				returnURL: req.query.redirect || '/',
			});
		},
	)
	.get('/verify', async (req, res) => {
		if (!req.session.user?.uid) return res.redirect('/login');
		const { user } = req.session;
		const credString = Crypto.decode(user.credentials);
		const [email, password] = credString.split(':');
		await Auth.sendEmailVerification((await Auth.signInWithEmailAndPassword(req.auth, email, password)).user);
		if (res.headersSent) return;
		return res.render('auth/verifyEmailSent.pug', {
			status: (await req.Database.getServerStatus()),
			meta: {
				title: 'Verify Email',
				desc: 'Verify your email with the FemDevs!',
				url: 'https://auth.thefemdevs.com/verify',
				canonical: 'https://auth.thefemdevs.com/verify',
			},
			returnURL: req.query.redirect || '/',
		});
	})
	.get('/logout', async (req, res) => {
		req.session = Object.assign(req.session, {
			user: {},
		});
		res.redirect(req.query.redirect || '/');
	})
	.post('/logout',
		express.urlencoded({
			extended: true,
			type: 'application/x-www-form-urlencoded',
		}),
		async (req, res) => {
			req.session = Object.assign(req.session, {
				user: {},
			});
			res.redirect(req.query.redirect || '/');
		},
	)
	.get('/', async (req, res) => {
		res.render('auth/index.pug', {
			status: (await req.Database.getServerStatus()),
			meta: {
				title: 'Auth',
				desc: 'Authenticate with the FemDevs!',
				url: 'https://auth.thefemdevs.com/',
				canonical: 'https://auth.thefemdevs.com/',
			},
		});
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
