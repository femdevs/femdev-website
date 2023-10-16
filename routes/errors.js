const { aprilFools } = require(`../functions/util-fuctions`)

const router = require('express').Router();

router
    .get(`/400`, (req, res) => {
        res.render(
            `${req.aprilFools()}misc/400.pug`,
            {
                errData: {
                    path: req.path,
                },
                meta: {
                    title: `400 - Invalid Request`,
                    desc: `400 - Invalid Request`,
                    url: `https://thefemdevs.com/errors/400`
                }
            }
        )
    })
    .get(`/401`, (req, res) => {
        res.render(
            `${req.aprilFools()}misc/401.pug`,
            {
                errData: {
                    path: req.path,
                    code: 401,
                },
                meta: {
                    title: `401 - Unauthorized`,
                    desc: `401 - Unauthorized`,
                    url: `https://thefemdevs.com/errors/401`
                }
            }
        )
    })
    .get(`/404`, (req, res) => {
        res.render(
            `${req.aprilFools()}misc/404.pug`,
            {
                errData: {
                    path: req.path,
                },
                meta: {
                    title: `404 - Page Not Found`,
                    desc: `404 - Page Not Found`,
                    url: `https://thefemdevs.com/errors/404`
                }
            }
        );
    })
    .get(`/405`, (req, res) => {
        const { path } = req
        const allowedMethods = router.stack
            .filter(r => r.route && r.route.path === path)
            .map(r => r.route.stack[0].method.toUpperCase())
            .join(`, `);
        const methodUsed = req.method.toUpperCase();
        res.render(
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
    .get(`/429`, (req, res) => {
        res.render(
            `${req.aprilFools()}misc/429.pug`,
            {
                meta: {
                    title: `429 - Too Many Requests`,
                    desc: `429 - Too Many Requests`,
                    url: `https://thefemdevs.com/errors/429`
                }
            }
        )
    })
    .get(`/501`, (req, res) => {
        res.render(
            `${req.aprilFools()}misc/501.pug`,
            {
                errData: {
                    errorId: require(`../functions/util-fuctions`).Utils.Crypto.FullHash("Testing Error"),
                },
                meta: {
                    title: `501 - Internal Server Error`,
                    desc: `501 - Internal Server Error`,
                    url: `https://thefemdevs.com/errors/501`
                }
            }
        )
    })
    .get(`/location`, (req, res) => {
        return res.render(
            `${req.aprilFools()}misc/location_denial.pug`,
            {
                meta: {
                    title: `451 - Forbidden for Legal Reasons`,
                    desc: `Location Denied`,
                    url: `https://thefemdevs.com/errors/location`
                }
            }
        );
    })
    .get(`/vpn`, (req, res) => {
        return res.render(
            `${req.aprilFools()}misc/vpn_block.pug`,
            {
                meta: {
                    title: `VPN Blocked`,
                    desc: `VPN Blocked`,
                    url: `https://thefemdevs.com/errors/vpn`
                }
            }
        );
    })
    .get(`/proxy`, (req, res) => {
        return res.render(
            `${req.aprilFools()}misc/vpn_block.pug`,
            {
                meta: {
                    title: `VPN Blocked`,
                    desc: `VPN Blocked`,
                    url: `https://thefemdevs.com/errors/vpn`
                }
            }
        );
    })
    .get(`/tor`, (req, res) => {
        return res.render(
            `${req.aprilFools()}misc/vpn_block.pug`,
            {
                meta: {
                    title: `VPN Blocked`,
                    desc: `VPN Blocked`,
                    url: `https://thefemdevs.com/errors/vpn`
                }
            }
        );
    })
    .get(`/relay`, (req, res) => {
        return res.render(
            `${req.aprilFools()}misc/vpn_block.pug`,
            {
                meta: {
                    title: `VPN Blocked`,
                    desc: `VPN Blocked`,
                    url: `https://thefemdevs.com/errors/vpn`
                }
            }
        );
    })
    .use((req, res, next) => {
        const { path, method } = req;
        const methodUsed = method.toUpperCase();
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

module.exports = router