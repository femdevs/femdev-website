const router = require('express').Router();

const CSPData = require('../../../functions/security');

router
    .use(require('express').json({ type: ['application/csp-report', 'application/reports+json'], inflate: true, strict: false, limit: '10mb' }))
    .post('/new', (req, res) => {
        console.log(req.headers['content-type'])
        console.log(req.body)
        switch (req.headers['content-type']) {
            case 'application/csp-report':
                // Firefox
                const data = new CSPData(req.body['csp-report']);
                req.Database.SaveCSPReport(data);
                res.status(204).end();
                break;
            case 'application/reports+json':
                // Chrome
                for (const report of Array.from(req.body)) {
                    if (report['type'] !== 'csp-violation') continue;
                    const data = new CSPData(report['body']);
                    req.Database.SaveCSPReport(data);
                }
                res.status(204).end();
                break;
            default:
                res.status(400).end();
                break;
        }
    })
    .use((req, res, next) => {
        const { path } = req;
        const methodUsed = req.method.toUpperCase();
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