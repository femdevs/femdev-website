const router = require('express').Router();
require('dotenv').config();

const cdn = require('./cdn');
const assets = require('./assets/router');

router
    .use('/cdn', cdn)
    .use('/assets', assets)

module.exports = router;