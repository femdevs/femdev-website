const router = require('express').Router();
require('dotenv').config();

const cdn = require('./cdn');
const assets = require('./assets/router');

router
	.use('/cdn', cdn)
	.use('/assets', assets)
	.get('/', (req, res) => {
		res.redirect(304, 'https://thefemdevs.com');
	});

module.exports = router;
