const leadRouter = require('express').Router();
const RateLimiter = require('../middleware/rateLimit')
require('dotenv').config();

const router = require('./routes/router');

leadRouter
    .use(RateLimiter.assets)
    .use(router);

module.exports = leadRouter;