const router = require('express').Router();

router
    .use((req, res, next) => req.RateLimitMem.consume(req.ip, 2).then(({ remainingPoints: r, consumedPoints: c, msBeforeNext: m } = data) => { [['Limit', r + c], ['Remaining', r], ['Reset', m]].forEach(v => res.setHeader(`X-RateLimit-${v[0]}`, v[1])); next(); }, (_) => res.setHeader('Retry-After', 1000).status(429).render('misc/429.pug', req.getErrPage(429, {}))))
    .get('/robots.txt', (_, res) => res.setHeader('Content-Type', 'text/plain; charset=utf8').sendFile(`${__dirname}/meta/robots.txt`))
    .get('/sitemap', (_, res) => res.setHeader('Content-Type', 'text/xml; charset=utf8').sendFile(`${__dirname}/meta/sitemap.xml`))
    .use(require('./routes/router'))
    .use((req, res, next) => {
        const { path } = req;
        const methodUsed = req.method.toUpperCase();
        let allowedMethods = leadRouter.stack.filter(r => r.route && r.route.path === path)
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
    .use((err, req, res, _) => {
        console.log(err)
        res
            .status(501)
            .setHeader('X-Error-ID', '')
            .render(
                `misc/501.pug`,
                req.getErrPage(501, { errorId: '' })
            )
    })
    .use((req, res, _) => res.status(404).render(`misc/404.pug`, req.getErrPage(404, { path: req.path })));

module.exports = router;