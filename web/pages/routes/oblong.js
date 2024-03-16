const router = require('express').Router();

router
    .get('/', (_, res) => res.render('pages/oblong/index.pug'))
    .get('/cdn/img/:file', (req, res) => res.sendFile(`${process.cwd()}/web/pages/assets/oblong/img/${req.params.file}`))
    .get('/cdn/js/:file', (req, res) => res.sendFile(`${process.cwd()}/web/pages/assets/oblong/js/${req.params.file}.js`))
    .get('/cdn/css/:file', (req, res) => res.sendFile(`${process.cwd()}/web/pages/assets/oblong/css/${req.params.file}.css`));

module.exports = router;