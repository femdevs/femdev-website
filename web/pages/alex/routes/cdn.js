const router = require('express').Router();

router
    .get('/img/:file', (req, res) => res.sendFile(`${__dirname}/../assets/imgs/${req.params.file}`))
    .get('/js/:file', (req, res) => res.sendFile(`${__dirname}/../assets/imgs/${req.params.file}.js`))
    .get('/css/:file', (req, res) => res.sendFile(`${__dirname}/../assets/imgs/${req.params.file}.css`))

module.exports = router