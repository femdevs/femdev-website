const router = require('express').Router();
const fs = require('fs');

router
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
        let allowedMethods = router.stack
            .filter(r => r.route && r.route.path === path)
        if (allowedMethods.length == 0) return next();

        // find the allowed methods for the path
        allowedMethods
            .map(r => r.route.stack[0])
        allowedMethods = { ...allowedMethods[0] }
        allowedMethods = allowedMethods.route.methods;

        if (allowedMethods[methodUsed]) return next();
        res.status(405).render(
            `misc/405.pug`,
            {
                title: '405 - Method Not Allowed',
                path,
                allowedMethods: Object.keys(allowedMethods).map(m => m.toUpperCase()).join(', '),
                methodUsed: methodUsed
            }
        );
    })

module.exports = router;