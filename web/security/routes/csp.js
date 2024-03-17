const router = require('express').Router();

const Security = require('../../../functions/security');

router
    .post('/new', (req, res) => {
        if (req.headers['content-type'] !== 'application/csp-report') return res.status(400).send('Invalid Content-Type');
        if (!req.body) return res.status(400).send('Invalid Request Body');
        const data = Security.CSP.process(req.body);
        req.Database.SaveCSPReport(data);
        res.status(204).end();
    })

module.exports = router;