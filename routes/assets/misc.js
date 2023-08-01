const router = require('express').Router();
const fs = require('fs');

router.get(`/robots.txt`, (req, res) => {
    res
        .sendFile(`${process.cwd()}/metadata/robots.txt`)
});

router.get(`/sitemap`, (req, res) => {
    res
        .setHeader(`Content-Type`, `text/xml`)
        .sendFile(`${process.cwd()}/metadata/sitemap.xml`)
});

router.get(`/thumbnail`, (req, res) => {
    res
        .setHeader('Cache-Control', 'no-cache')
        .redirect("https://cdn.discordapp.com/attachments/999266213697945652/1081273691867992124/image.png")
});

router.use((req, res, next) => {
    const { path, method } = req;
    const methodUsed = method.toUpperCase();
    let allowedMethods = router.stack
        .filter(r => r.route && r.route.path === path)
    if (allowedMethods.length == 0) return next();

    // find the allowed methods for the path
    allowedMethods
        .map(r => r.route.stack[0])
    allowedMethods = {...allowedMethods[0]}
    allowedMethods = allowedMethods.route.methods;

    if (allowedMethods[methodUsed]) {
        return next();
    } else {
        res.status(405).render(
            `misc/405.pug`,
            {
                title: '405 - Method Not Allowed',
                path,
                allowedMethods: Object.keys(allowedMethods).map(m => m.toUpperCase()).join(', '),
                methodUsed: methodUsed
            }
        );
    }
})

module.exports = router;