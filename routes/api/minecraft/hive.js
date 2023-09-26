const router = require('express').Router();
const axios = require('axios');
const { aprilFools } = require('../../../functions/utilities');

const axiosAPIClient = new axios.Axios({
    baseURL: 'https://api.playhive.com/v0',
    validateStatus: (s) => Number(String(s).at(0)) < 4,
})

router
    .get('/leaderboard', async (req, res) => {
        const game = req.headers['x-game']
        if (!game) return res.status(400).json({ error: 'Missing game header' })
        const { data } = await axiosAPIClient.get(`/game/all/${game}`)
        res.json(data)
    })
    .get('/player', async (req, res) => {
        const player = req.headers['x-player']
        const game = req.headers['x-game'] ?? 'all'
        if (!player) return res.status(400).json({ error: 'Missing player header' })
        const { data } = await axiosAPIClient.get(`/game/all/${game}/${player}`)
        res.json(data)
    })
    .get('/maps', async (req, res) => {
        const game = req.headers['x-game']
        if (!game) return res.status(400).json({ error: 'Missing game header' })
        const { data } = await axiosAPIClient.get(`/game/map/${game}`)
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