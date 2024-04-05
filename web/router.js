const router = require('express').Router();
const vhost = require('vhost')
require('dotenv').config()

router
    .use(require('./mail'))
    .use(require('./pages'))
    .use(vhost('thefemdevs.com', require('./core/')))
    .use(vhost('www.thefemdevs.com', require('./core')))
    .use(vhost('api.thefemdevs.com', require('./api/')))
    .use(vhost('oss.thefemdevs.com', require('./oss/')))
    .use(vhost('cdn.thefemdevs.com', require('./cdn/')))
    .use(vhost('pay.thefemdevs.com', require('./payment/')))
    .use(vhost('legal.thefemdevs.com', require('./legal/')))
    .use(vhost('errors.thefemdevs.com', require('./errors/')))
    .use(vhost('security.thefemdevs.com', require('./security/')))
    .use(vhost('localhost', require(`./${process.env.LOCALHOST_PAGE || 'core'}`)));

module.exports = router;