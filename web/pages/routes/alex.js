const router = require('express').Router();

router
    .get('/', (_, res) => res.render('pages/alex/index.pug'))
    .get('/cdn/img/:file', (req, res) => res.sendFile(`${process.cwd()}/web/pages/assets/alex/imgs/${req.params.file}`))
    .get('/cdn/js/:file', (req, res) => res.sendFile(`${process.cwd()}/web/pages/assets/alex/js/${req.params.file}.js`))
    .get('/cdn/css/:file', (req, res) => res.sendFile(`${process.cwd()}/web/pages/assets/alex/css/${req.params.file}.css`));

module.exports = router;