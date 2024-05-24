const router = require('express').Router();
const vhost = require('vhost');

router
	.use(vhost('auth.thefemdevs.com', require('./auth/')))
	.use(vhost('oauth2.thefemdevs.com', require('./oauth2/')));

module.exports = router;
