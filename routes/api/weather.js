const router = require('express').Router();
const axios = require('axios');
const { aprilFools } = require('../../functions/utilities');

const axiosAPIClient = new axios.Axios({
    baseURL: 'https://api.openweathermap.org/data/2.5',
    params: {
        appid: process.env.OPEN_WEATHER_API_KEY,
        mode: 'json',
        units: 'imperial'
    },
    validateStatus: (s) => Number(String(s).at(0)) < 4,
})

router
    .get('/current', async (req, res) => {
        const { lat, lon } = req.query;
        if (!lat || !lon) return res.status(400).json({ error: 'Missing lat or lon query' })
        const { data } = await axiosAPIClient.get(`/weather`, {
            params: {
                lat,
                lon
            }
        })
        res.json(data)
    })
    .get('/forecast', async (req, res) => {
        const { lat, lon } = req.query;
        if (!lat || !lon) return res.status(400).json({ error: 'Missing lat or lon query' })
        const { data } = await axiosAPIClient.get(`/forecast`, {
            params: {
                lat,
                lon
            }
        })
        res.json(data)
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