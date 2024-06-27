const router = require('express').Router();
const vhost = require('vhost');
require('dotenv').config();

router
	.use(
		require('./mail'),
		require('./auth'),
		require('./pages'),
		vhost('thefemdevs.com', require('./core/')),
		vhost('pay.thefemdevs.com', require('./pay')),
		vhost('www.thefemdevs.com', require('./core')),
		vhost('api.thefemdevs.com', require('./api/')),
		vhost('oss.thefemdevs.com', require('./oss/')),
		vhost('cdn.thefemdevs.com', require('./cdn/')),
		vhost('chat.thefemdevs.com', require('./chat/')),
		vhost('legal.thefemdevs.com', require('./legal/')),
		vhost('errors.thefemdevs.com', require('./errors/')),
		vhost('spotify.thefemdevs.com', require('./spotify/')),
		vhost('discord.thefemdevs.com', require('./discord/')),
		vhost('security.thefemdevs.com', require('./security/')),
		vhost('localhost', require(`./${process.env.LOCALHOST_PAGE || 'core'}`)),
		vhost('127.0.0.1', require(`./${process.env.LOCALHOST_PAGE || 'core'}`)),
	);

module.exports = router;
