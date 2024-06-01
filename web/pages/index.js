const router = require('express').Router();
const vhost = require('vhost');

const ben = require('./ben/');
const alex = require('./alex/');
const nezha = require('./nezha/');
const oblong = require('./oblong/');

router
	.use(vhost('ben.thefemdevs.com', ben))
	.use(vhost('alex.thefemdevs.com', alex))
	.use(vhost('nezha.thefemdevs.com', nezha))
	.use(vhost('oblong.thefemdevs.com', oblong));

module.exports = router;
