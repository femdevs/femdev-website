const router = require('express').Router();
const vhost = require('vhost');

router
	.use(
		vhost('sparty18.com', require('./ben/')),
		vhost('ben.thefemdevs.com', require('./ben/')),
		vhost('auxiliaryfrfr.com', require('./alex/')),
		vhost('alex.thefemdevs.com', require('./alex/')),
		vhost('nezha.thefemdevs.com', require('./nezha/')),
		vhost('oblong.thefemdevs.com', require('./oblong/')),
		vhost('mayuazael.thefemdevs.com', require('./mayuazael/')),
	);

module.exports = router;
