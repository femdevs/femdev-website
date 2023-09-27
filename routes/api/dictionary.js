const router = require('express').Router();
const axios = require('axios');
const { aprilFools } = require('../../functions/utilities');

router
    .get('/def/:word', async (req, res) => {
        const { data } = await req.axiosReq(
            `/${req.params.word}`,
            {
                baseURL: 'https://www.dictionaryapi.com/api/v3/references/collegiate/json',
                params: {
                    key: process.env.DAK,
                }
            })
        res.json({defs: JSON.parse(data)[0].shortdef})
    })
    .get('/syn/:word', async (req, res) => {
        const { data } = await req.axiosReq(
            `/${req.params.word}`,
            {
                baseURL: 'https://www.dictionaryapi.com/api/v3/references/thesaurus/json/',
                params: {
                    key: process.env.TAK,
                },
            })
        const syns = JSON.parse(data)[0].meta.syns.reduce((acc, curr) => [...acc, ...curr], [])
        res.json({syns})
    })
    .get('/ant/:word', async (req, res) => {
        const { data } = await req.axiosReq(
            `/${req.params.word}`,{
                baseURL: 'https://www.dictionaryapi.com/api/v3/references/thesaurus/json/',
                params: {
                    key: process.env.TAK,
                }
            })
        res.json({ants: JSON.parse(data)[0].meta.ants})
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