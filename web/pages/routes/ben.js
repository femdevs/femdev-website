const router = require('express').Router();

router
    .get('/', (_, res) => res.render('pages/ben/index.pug'))
    .get('/cdn', require('../functions/routeCDN')('ben'));

module.exports = router;