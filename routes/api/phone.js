const router = require('express').Router();
require('dotenv').config();
const { aprilFools } = require('../../functions/utilities');

router
    .get('/details/:number', async (req, res) => {
        const AxiosRes = await req.axiosReq
            .get(`/verify?phone=${req.params.number}`,
            {
                baseURL: 'https://api.veriphone.io/v2',
                params: {
                    default_country: 'US',
                    key: process.env.VERIPHONE_TOKEN,
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