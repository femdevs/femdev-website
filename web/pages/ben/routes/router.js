const router = require('express').Router();

router
    .use('/', require('./core'))
    .use('/cdn', require('./cdn'))

module.exports = router;