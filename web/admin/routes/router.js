const router = require('express').Router();

router
    .use('/', require('./core'))
    .use('/auth', require('./auth'))
    .use('/tokens', require('./tokens'))
    .use('/users', require('./users'))
    .use('/logs', require('./logs'))

module.exports = router;