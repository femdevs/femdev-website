const router = require('express').Router();
const fs = require('fs');
const showdown = require('showdown');

showdown.setFlavor('github');

router
    .get('/terms/:id', (req, res) => {
        const converter = new showdown.Converter({
            omitExtraWLInCodeBlocks: true,
            simplifiedAutoLink: true,
            excludeTrailingPunctuationFromURLs: true,
            tasklists: true,
            openLinksInNewWindow: true,
        });
        const { id } = req.params;
        if (!fs.existsSync(`${process.cwd()}/assets/documents/legal/terms/${id}.txt`))
            return res.status(404).render(
                "misc/404.pug",
                req.getErrPage(404, { id }),
            );
        res
            .setHeader('Content-Type', 'text/html; charset=utf8')
            .send(converter.makeHtml(fs.readFileSync(`${process.cwd()}/assets/documents/legal/terms/${id}.txt`, 'utf8')));
    })
    .use((req, res, next) => {
        const { path } = req;
        const methodUsed = req.method.toUpperCase();
        let allowedMethods = router.stack.filter(routerObj => routerObj.route && routerObj.route.path === path);
        if (allowedMethods.length === 0) return next();
        allowedMethods.map(routerObj => routerObj.route.stack[0]);
        allowedMethods = { ...allowedMethods[0] };
        allowedMethods = allowedMethods.route.methods;
        if (req.method === 'OPTIONS')
            return res.setHeader('Allow', Object.keys(allowedMethods)
                .map(verb => verb.toUpperCase()).join(', '))
                .setHeader('Access-Control-Allow-Methods', Object.keys(allowedMethods).map(verb => verb.toUpperCase()).join(', '))
                .status(204)
                .send();
        if (allowedMethods[methodUsed]) return next();
        return res.status(405).render(
            "misc/405.pug",
            req.getErrPage(405, { path, allowedMethods, methodUsed }),
        );
    });

module.exports = router;
