const router = require('express').Router();
const express = require('express');

const Security = require('../../../functions/security');

router
    .post('/new', (req, res) => {
        switch (req.headers['content-type']) {
            case 'application/csp-report':
                // Firefox
                const body = JSON.parse(req.body);
                const data = Security.CSP.process(body);
                req.Database.SaveCSPReport(data);
                res.status(204).end();
                break;
            case 'application/reports+json':
                // Chrome
                for (const report of Array.from(req.body.replace(/\[|\]/g,'').split(',')).map(JSON.parse)) {
                    if (report['type'] !== 'csp-violation') continue;
                    const data = Security.CSP.process(report['body']);
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