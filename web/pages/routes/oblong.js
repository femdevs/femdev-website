const router = require('express').Router();

router
    .get('/', (_, res) => res.render('pages/oblong/index.pug'))
    .get('/cdn', require('../functions/routeCDN')('oblong'));

module.exports = router;