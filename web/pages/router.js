const router = require('express').Router();
const vhost = require('vhost');

const alex = require('./routes/alex');
const ben = require('./routes/ben');
const oblong = require('./routes/oblong');

router
    .use(vhost('alex.thefemdevs.com', alex))
    .use(vhost('ben.thefemdevs.com', ben))
    .use(vhost('oblong.thefemdevs.com', oblong));

module.exports = router;
