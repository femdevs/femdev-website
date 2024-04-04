const router = require('express').Router();
const vhost = require('vhost')

router
    .use(vhost('mta-sts.thefemdevs.com', require('./mta-sts/')))

module.exports = router;