const router = require('express').Router();
const axios = require('axios');
const { aprilFools } = require('../../functions/utilities');

const dictionaryAxiosAPIClient = new axios.Axios({
    baseURL: 'https://www.dictionaryapi.com/api/v3/references/collegiate/json/',
    params: {
        key: process.env.DAK,
    },
    validateStatus: (s) => Number(String(s).at(0)) < 4,
})

const theosaurusAxiosAPIClient = new axios.Axios({
    baseURL: 'https://www.dictionaryapi.com/api/v3/references/thesaurus/json/',
    params: {
        key: process.env.TAK,
    },
    validateStatus: (s) => Number(String(s).at(0)) < 4,
})

router
    .get('/def/:word', async (req, res) => {
        const { data: { meta: data } } = await dictionaryAxiosAPIClient.get(`/${req.params.word}`)
        res.json(data)
    })
    .get('/syn/:word', async (req, res) => {
        const { data: { meta: { syns } } } = await theosaurusAxiosAPIClient.get(`/${req.params.word}`)
        res.json(syns)
    })
    .get('/ant/:word', async (req, res) => {
        const { data: { meta: { ants } } } = await theosaurusAxiosAPIClient.get(`/${req.params.word}`)
        res.json(ants)
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