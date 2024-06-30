const router = require('express').Router();

router
	.get('/', async (req, res) => {
		const currentUser = {
			loggedIn: false,
			user: {
				name: {
					first: '',
					last: '',
					display: '',
				},
				email: '',
			},
		};
		if (req.session.user) {
			currentUser.loggedIn = true;
			const { user } = req.session;
			currentUser.user = {
				name: {
					first: user.name.first,
					last: user.name.first,
					display: user.name.display,
				},
				email: user.contact.email,
			};
		}
		res.render(
			'admin/public/index.pug',
			{
				status: (await req.Database.getServerStatus()),
				meta: {
					title: 'Admin Panel',
					desc: 'The admin panel for the FemDevs!',
					url: 'https://adminthefemdevs.com',
					canonical: 'https://admin.thefemdevs.com',
				},
				currentUser,
			},
		);
	});

module.exports = router;
