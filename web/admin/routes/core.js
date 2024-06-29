const router = require('express').Router();

router
	.get('/', async (req, res) => {
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
			},
		);
	});

module.exports = router;
