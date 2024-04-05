const router = require('express').Router();

router
    .use('/', require('./core'))
    .use('/auth', require('./auth'))

module.exports = router;