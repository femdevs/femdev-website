const express = require('express');
const router = express.Router();
const { SQL } = require('sql-template-strings');
const User = require('../../../functions/userMgr');

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
			let user;
			try {
				user = await req.auth.signInWithEmailAndPassword(username, password);
			} catch (error) {
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
						console.log(error);
						return res.sendError(0);
				}
			}
			const connection = await req.Database.pool.connect();
			const { rows } = await connection.query(SQL`SELECT * FROM public.users WHERE firebaseuid = ${user.uid}`);
			if (rows.length === 0) return res.sendError(21);
			const userPermissions = await User.fromFullPermissionBitString(rows[0].permissions);
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
				permissions: userPermissions,
			};
			req.session.user = userData;
		},
	)
	.get('/logout', (req, res) => {
		// Logout logic here
	});

module.exports = router;
