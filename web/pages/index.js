const router = require('express').Router();
const vhost = require('vhost');

const alex = require('./alex/');
const ben = require('./ben/');
const oblong = require('./oblong/');

router
	.use(vhost('alex.thefemdevs.com', alex))
	.use(vhost('ben.thefemdevs.com', ben))
	.use(vhost('oblong.thefemdevs.com', oblong));

module.exports = router;
