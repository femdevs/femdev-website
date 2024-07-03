const router = require('express').Router();
const vhost = require('vhost');

router
	.use(vhost('sparty18.com', require('./ben/')))
	.use(vhost('ben.thefemdevs.com', require('./ben/')))
	.use(vhost('auxiliaryfrfr.com', require('./alex/')))
	.use(vhost('alex.thefemdevs.com', require('./alex/')))
	.use(vhost('nezha.thefemdevs.com', require('./nezha/')))
	.use(vhost('oblong.thefemdevs.com', require('./oblong/')));

module.exports = router;
