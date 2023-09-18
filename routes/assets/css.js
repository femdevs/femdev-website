const router = require('express').Router();
const { aprilFools } = require('../../functions/utilities');

router
    .get(`/d`, (req, res) => {
        res.sendFile(`${process.cwd()}/assets/stylesheets/general/combined.css`)
    })
    .get(`/c/:file`, (req, res) => {
        res.sendFile(`${process.cwd()}/assets/stylesheets/general/${req.params.file}.css`);
    })
    .get(`/f/:file`, (req, res) => {
        res.sendFile(`${process.cwd()}/assets/stylesheets/file-specific/${req.params.file}.css`);
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
            `${aprilFools() ? 'aprilfools/' : ''}misc/405.pug`,
            {
                path,
                allowedMethods: Object.keys(allowedMethods).map(m => m.toUpperCase()).join(', '),
                methodUsed: methodUsed,
                meta: {
                    title: '405 - Method Not Allowed',
                    desc: '405 - Method Not Allowed',
                    url: 'https://thefemdevs.com/errors/405',
                }
            }
        );
    })

module.exports = router;