module.exports = (page) => {
    const router = require('express').Router();

    router
        .get('/js/:file', (req, res) => res.sendFile(`${process.cwd()}/web/pages/assets/${page}/js/${req.params.file}.js`))
        .get('/css/:file', (req, res) => res.sendFile(`${process.cwd()}/web/pages/assets/${page}/css/${req.params.file}.css`))
        .get('/img/:file', (req, res) => res.sendFile(`${process.cwd()}/web/pages/assets/${page}/img/${req.params.file}`));

    return router;
}