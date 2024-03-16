const router = require('express').Router();

router
    .get('/', (_, res) => res.render('pages/alex/index.pug'))
    .get('/cdn', require('../functions/routeCDN')('alex'));

module.exports = router;