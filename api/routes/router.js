const express = require('express');
const router = express.Router();
const axios = require('axios');

//- Middleware
const APIAuth = require('../../middleware/APITokenMgr');

//- Functions
const errorResponse = (k) => require('../../functions/errorResponse').get(k)

//- Routes
const user = require('./user');
const crypto = require('./crypto');
const token = require('./token');
const facts = require('./facts');
const location = require('./location');
const phone = require('./phone');
const weather = require('./weather');
const dictionary = require('./dictionary');
const quotes = require('./quotes');
const minecraft = require('./minecraft/router');

const axiosReq = async (url, cfgs) => {
    const Axios = new axios.Axios({
        validateStatus: () => true,
    })
    const AxiosRes = await Axios.get(url, cfgs);
    if (AxiosRes.status >= 400) return {
        status: AxiosRes.status,
        data: AxiosRes.data,
    }
    return AxiosRes;
}

router
    .use((req, res, next) => { req.axiosReq = axiosReq; res.sendError = (code) => res.status(errorResponse(code).httpCode).json({ code: errorResponse(code).code, message: errorResponse(code).message }); next(); })
    .get('/', (req, res) => res.redirect(301, 'https://docs.api.thefemdevs.com'))
    .use(APIAuth)
    .use(express.json())
    .use('/user', user)
    .use('/crypto', crypto)
    .use('/token', token)
    .use('/facts', facts)
    .use('/location', location)
    .use('/phone', phone)
    .use('/weather', weather)
    .use('/dictionary', dictionary)
    .use('/quotes', quotes)
    .use('/minecraft', minecraft)
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