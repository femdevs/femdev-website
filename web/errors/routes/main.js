const router = require('express').Router();

router
    .get('/400', (req, res) => {
        const { path } = req;
        res.render(
            `misc/400.pug`,
            req.getErrPage(400, { path })
        )
    })
    .get(`/401`, (req, res) => {
        const { path } = req;
        res.render(
            `misc/401.pug`,
            req.getErrPage(401, { path })
        )
    })
    .get(`/404`, (req, res) => {
        const { path } = req;
        res.render(
            `misc/404.pug`,
            req.getErrPage(404, { path })
        );
    })
    .get(`/405`, (req, res) => {
        const { path } = req
        const allowedMethods = router.stack
            .filter(r => r.route && r.route.path === path)
            .map(r => r.route.stack[0].method.toUpperCase())
            .join(`, `);
        const methodUsed = req.method.toUpperCase();
        res.render(
            `misc/405.pug`,
            req.getErrPage(405, { path, allowedMethods, methodUsed })
        );
    })
    .get(`/429`, (req, res) => {
        const { path } = req;
        res.render(
            `misc/429.pug`,
            req.getErrPage(429, { path })
        )
    })
    .get(`/501`, (req, res) => {
        res.render(
            `misc/501.pug`,
            req.getErrPage(501, { errorId: require(`../../functions/util-fuctions`).Utils.Crypto.FullHash("Testing Error") })
        )
    })
    .get(`/location`, (req, res) => {
        const { path } = req;
        return res.render(
            `misc/location_denial.pug`,
            req.getErrPage(451, { path })
        );
    })
    .use((req, res, next) => {
        const { path, method } = req;
        const methodUsed = method.toUpperCase();
        let allowedMethods = router.stack.filter(r => r.route && r.route.path === path)
        if (allowedMethods.length == 0) return next();
        allowedMethods.map(r => r.route.stack[0])
        allowedMethods = { ...allowedMethods[0] }
        allowedMethods = allowedMethods.route.methods;
        if (req.method === 'OPTIONS') return res.setHeader('Allow', Object.keys(allowedMethods).map(m => m.toUpperCase()).join(', ')).setHeader('Access-Control-Allow-Methods', Object.keys(allowedMethods).map(m => m.toUpperCase()).join(', ')).status(204).send();
        if (allowedMethods[methodUsed]) return next();
        res.status(405).render(
            `misc/405.pug`,
            req.getErrPage(405, { path, allowedMethods, methodUsed })
        );
    })

module.exports = router