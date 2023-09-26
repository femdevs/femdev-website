const router = require('express').Router();
const axios = require('axios');
require('dotenv').config();
const { aprilFools } = require('../../functions/utilities');

const axiosAPIClient = new axios.Axios(
    {
        baseURL: 'https://api.veriphone.io/v2',
        params: {
            default_country: 'US',
            key: process.env.VERIPHONE_TOKEN,
        },
        validateStatus: (s) => Number(String(s).at(0)) < 4,
    }
)

router
    .get('/details/:number', async (req, res) => {
        res.json((await axiosAPIClient.get(`/verify?phone=${req.params.number}`)).data)
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