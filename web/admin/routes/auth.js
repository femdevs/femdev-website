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
		// Logout logic here
	});

module.exports = router;
