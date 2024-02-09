const router = require('express').Router();
require('dotenv').config();

const mainRoutes = require('./routes/router');

router
    .use('/', mainRoutes);

module.exports = router;