const router = require('express').Router();

router
    .get('/ga', (req, res) => {
        res
            .setHeader('Content-Type', 'application/javascript')
            .setHeader('Cache-Control', 'public, max-age=31536000')
            .sendFile(`${process.cwd()}/assets/scripts/Other/GoogleAnalytics.min.js`);
    })
    .get(`/fs/:file`, (req, res) => {
        res.sendFile(`${process.cwd()}/assets/scripts/File-Specific/${req.params.file}`);
    })
    .get(`/cg/:file`, (req, res) => {
        res.sendFile(`${process.cwd()}/assets/scripts/CoG/${req.params.file}`);
    })
    .get(`/o/:file`, (req, res) => {
        res.sendFile(`${process.cwd()}/assets/scripts/Other/${req.params.file}`);
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

module.exports = router;