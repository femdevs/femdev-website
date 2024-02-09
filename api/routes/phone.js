const router = require('express').Router();
require('dotenv').config();

router
    .get('/details', async (req, res) => {
        const numericalNumber = req.headers['x-number'].replace(/[^0-9]/gm, '')
        const AxiosRes = await req.axiosReq(`/verify`,
            {
                baseURL: 'https://api.veriphone.io/v2',
                params: {
                    default_country: 'US',
                    key: process.env.VERIPHONE_TOKEN,
                    phone: numericalNumber,
                }
            })
        if (AxiosRes.status == 404) return res.sendError(13)
        res.json(JSON.parse(AxiosRes.data))
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