const router = require('express').Router();
const { aprilFools } = require('../../functions/utilities');

router
    .get('/current', async (req, res) => {
        let lat, lon;
        if (req.headers['x-city']) {
            const AxiosRes = await req.axiosReq(`/json`, {
                baseURL: 'https://maps.googleapis.com/maps/api/geocode',
                params: {
                    address: req.headers['x-city'],
                    key: process.env.GMAPS_API_KEY,
                }
            })
            const data = JSON.parse(AxiosRes.data)
            if (data.status == 'ZERO_RESULTS') return res.sendError(13)
            lat = data.results[0].geometry.location.lat
            lon = data.results[0].geometry.location.lng
        } else if (req.query.lat && req.query.lon) {
            [lat, lon] = req.headers['x-coords'].split(',')
        } else return res.sendError(4)
        const AxiosRes = await req.axiosReq(`/weather`, {
            baseURL: 'https://api.openweathermap.org/data/2.5',
            params: {
                appid: process.env.OPEN_WEATHER_API_KEY,
                mode: 'json',
                units: 'imperial',
                lat,
                lon
            }
        })
        if (AxiosRes.status == 400) return res.sendError(13)
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