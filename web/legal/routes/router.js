const router = require('express').Router();
require('dotenv').config();

const main = require('./main')

router
    .use('/', main)

module.exports = router;