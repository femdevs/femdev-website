const router = require('express').Router();

const CSPData = require('../../../functions/security');

router
    .use(require('express').json({ type: ['application/csp-report', 'application/reports+json'] }))
    .post('/new', (req, res) => {
        switch (req.headers['content-type']) {
            case 'application/csp-report':
                // Firefox
                const data = new CSPData(req.body);
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

module.exports = router;