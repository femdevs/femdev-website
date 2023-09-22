const express = require('express');
const router = express.Router();

//- Middleware
const APIAuth = require('../../middleware/APITokenMgr');

//- Functions
const errorResponse = require('../../src/errorResponse');

//- Routes
const auth = require('./auth');
const user = require('./user');
const crypto = require('./crypto');
const token = require('./token');

router
    .use((req, res, next) => { res.sendError = (code) => res.status(errorResponse(code).httpCode).json({ code: errorResponse(code).code, message: errorResponse(code).message }); next(); })
    .use(APIAuth)
    .use(express.json())
    .use('/auth', auth)
    .use('/user', user)
    .use('/crypto', crypto)
    .use('/token', token)
    .use((req, res, next) => {
        const { path } = req;
        const methodUsed = req.method.toUpperCase();
        let allowedMethods = router.stack.filter(r => r.route && r.route.path === path)
        if (allowedMethods.length == 0) return next();
        allowedMethods.map(r => r.route.stack[0])
        allowedMethods = { ...allowedMethods[0] }
        allowedMethods = allowedMethods.route.methods;
        if (allowedMethods[methodUsed]) return next();
        res.status(405).render(
            `${aprilFools() ? 'aprilfools/' : ''}misc/405.pug`,
            {
                errData: {
                    path,
                    allowedMethods: Object.keys(allowedMethods).map(m => m.toUpperCase()).join(', '),
                    methodUsed: methodUsed,
                },
                meta: {
                    title: '405 - Method Not Allowed',
                    desc: '405 - Method Not Allowed',
                    url: 'https://thefemdevs.com/errors/405',
                }
            }
        );
    })

module.exports = router;