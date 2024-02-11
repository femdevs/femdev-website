const router = require('express').Router();
const RateLimiter = require('../middleware/rateLimit')
require('dotenv').config();

const mainRoutes = require('./routes/router');

router
    .use(RateLimiter.main)
    .use('/', mainRoutes);

module.exports = router;