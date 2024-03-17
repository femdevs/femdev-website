const router = require('express').Router();

const CSP = require('./csp');
const Doc = require('./doc');
const Report = require('./report');

router
    .use('/doc', Doc)
    .use('/report', Report)
    .use('/csp', CSP);

module.exports = router;