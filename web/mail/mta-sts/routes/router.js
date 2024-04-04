const router = require('express').Router();

router
    .use('/.well-known', require('./well-known'))

module.exports = router;