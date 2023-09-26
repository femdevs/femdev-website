const router = require('express').Router();
const axios = require('axios');
const { aprilFools } = require('../../functions/utilities');

const axiosAPIClient = new axios.Axios({
    baseURL: 'https://deckofcardsapi.com/api/deck',
    validateStatus: (s) => Number(String(s).at(0)) < 4,
})

router
    .get('/new', async (req, res) => {
        const deckCount = req.query.deck_count || 1;
        const { data } = await axiosAPIClient.get(`/deck/new/shuffle/?deck_count=${deckCount}`);
        res.json(data);
    })
    .get('/shuffle', async (req, res) => {
        const deckId = req.headers['x-deck-id'];
        if (!deckId) return res.status(400).json({ error: 'Missing deck_id header' });
        const { data } = await axiosAPIClient.get(`/deck/${deckId}/shuffle/`);
        res.json(data);
    })
    .get('/draw', async (req, res) => {
        const deckId = req.headers['x-deck-id'];
        const cardsCount = req.query.count || 1;
        if (!deckId) return res.status(400).json({ error: 'Missing deck_id header' });
        const { data } = await axiosAPIClient.get(`/deck/${deckId}/draw/`, { params: { count: cardsCount } });
        res.json(data);
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