//- Packages
const router = require('express').Router();
require('dotenv').config();

//- Routes
const website = require('./main');
const legal = require('./legal');
const error = require('./errors');
const ab = require('./ab');
const OSSProject = require('../oss/routes/project');
const Payment = require('./pay/router')

//- Router setup
router
    .use('/ab', ab)
    .use('/legal', legal)
    .use('/error', error)
    .use('/oss-project', OSSProject)
    .use('/pay', Payment)
    .use('/', website)
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
    });

module.exports = router;