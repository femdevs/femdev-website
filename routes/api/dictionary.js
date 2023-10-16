const router = require('express').Router();
const axios = require('axios');

router
    .get('/def', async (req, res) => {
        const word = req.headers['x-word'];
        if (!word) return res.sendError(6)
        const { data } = await req.axiosReq(
            `/${word}`,
            {
                baseURL: 'https://www.dictionaryapi.com/api/v3/references/collegiate/json',
                params: {
                    key: process.env.DAK,
                }
            })
        res.json({defs: JSON.parse(data)[0].shortdef})
    })
    .get('/syn', async (req, res) => {
        const word = req.headers['x-word'];
        if (!word) return res.sendError(6)
        const { data } = await req.axiosReq(
            `/${word}`,
            {
                baseURL: 'https://www.dictionaryapi.com/api/v3/references/thesaurus/json/',
                params: {
                    key: process.env.TAK,
                },
            })
        const syns = JSON.parse(data)[0].meta.syns.reduce((acc, curr) => [...acc, ...curr], [])
        res.json({syns})
    })
    .get('/ant', async (req, res) => {
        const word = req.headers['x-word'];
        if (!word) return res.sendError(6)
        const { data } = await req.axiosReq(
            `/${word}`,{
                baseURL: 'https://www.dictionaryapi.com/api/v3/references/thesaurus/json/',
                params: {
                    key: process.env.TAK,
                }
            })
        res.json({ants: JSON.parse(data)[0].meta.ants.reduce((acc, curr) => [...acc, ...curr], [])})
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
            `${req.aprilFools()}misc/405.pug`,
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