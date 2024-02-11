const leadRouter = require('express').Router();
const RateLimiter = require('../middleware/rateLimit')
require('dotenv').config();

const router = require('./routes/router');

leadRouter
    .use(RateLimiter.main)
    .use(router);

module.exports = leadRouter;