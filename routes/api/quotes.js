const router = require('express').Router();
const { aprilFools } = require('../../functions/utilities');

router
    .get('/kanye', async (req, res) => {
        const { data } = await req.axiosReq('https://api.kanye.rest');
        res.json(JSON.parse(data));
    })
    .get('/ronswanson', async (req, res) => {
        const { data } = await req.axiosReq('https://ron-swanson-quotes.herokuapp.com/v2/quotes');
        res.json(JSON.parse(data));
    })
    .get('/random', async (req, res) => {
        const { data } = await req.axiosReq('https://api.quotable.io/random');
        res.json(JSON.parse(data));
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