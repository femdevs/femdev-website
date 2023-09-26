const router = require('express').Router();
const axios = require('axios');
const { aprilFools } = require('../../functions/utilities');

const axiosAPIClient = new axios.Axios({
    baseURL: 'https://maps.googleapis.com/maps/api/geocode',
    params: {
        key: process.env.GMAPS_API_KEY,
    },
    transformResponse: function (r) {return JSON.parse(r)},
    validateStatus: (s) => Number(String(s).at(0)) < 4,
})

router
    .get('/coords', async (req, res) => {
        const results = await axiosAPIClient.get('/json', {
            params: {
                address: `${req.query.lat},${req.query.lng}`,
            }
        })
        const {data} = results
        if (data.status == 'ZERO_RESULTS') return res.json({ error: 'No results found.' });
        res.json({data});
    })
    .get('/pluscode', async (req, res) => {
        const results = await axiosAPIClient.get('/json', {
            params: {
                address: req.query.address,
            }
        })
        const {data} = results
        if (data.status == 'ZERO_RESULTS') return res.json({ error: 'No results found.' });
        res.json({data});
    })
    .get('/address', async (req, res) => {
        const results = await axiosAPIClient.get('/json', {
            params: {
                address: req.query.address
            }
        })
        const {data} = results
        if (data.status == 'ZERO_RESULTS') return res.json({ error: 'No results found.' });
        res.json({data});
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