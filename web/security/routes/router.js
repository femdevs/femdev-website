const router = require('express').Router();

const CSP = require('./csp');

router
    .use('/csp', CSP);

module.exports = router;