const router = require('express').Router();
const axios = require('axios');
const { aprilFools } = require('../../functions/utilities');

const axiosAPIClient = new axios.Axios({
    validateStatus: (s) => Number(String(s).at(0)) < 4,
})

router
    .get('/chucknorris', async (req, res) => {
        const { data } = await axiosAPIClient.get('https://api.chucknorris.io/jokes/random');
        res.json(data);
    })
    .get('/dogs', async (req, res) => {
        const { data } = await axiosAPIClient.get('http://dog-api.kinduff.com/api/facts', { params: { number: 1 } });
        res.json(data);
    })
    .get('/cats', async (req, res) => {
        const { data } = await axiosAPIClient.get('https://meowfacts.herokuapp.com/');
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