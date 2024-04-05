const router = require('express').Router();

router
    .use('/', require('./core'))

module.exports = router;