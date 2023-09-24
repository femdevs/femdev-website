const { aprilFools } = require(`../functions/util-fuctions`)

const router = require('express').Router();

router
    .get(`/400`, (req, res) => {
        res.render(
            `${aprilFools() ? 'april-fools/' : ''}misc/400.pug`,
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
            `${aprilFools() ? 'april-fools/' : ''}misc/401.pug`,
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
            `${aprilFools() ? 'april-fools/' : ''}misc/404.pug`,
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
            `${aprilFools() ? 'april-fools/' : ''}misc/405.pug`,
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
            `${aprilFools() ? 'april-fools/' : ''}misc/429.pug`,
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
            `${aprilFools() ? 'april-fools/' : ''}misc/501.pug`,
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
            `${aprilFools() ? 'april-fools/' : ''}misc/location_denial.pug`,
            {
                meta: {
                    title: `Location Denied`,
                    desc: `Location Denied`,
                    url: `https://thefemdevs.com/errors/location`
                }
            }
        );
    })
    .get(`/vpn`, (req, res) => {
        return res.render(
            `${aprilFools() ? 'april-fools/' : ''}misc/vpn_block.pug`,
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
            `${aprilFools() ? 'april-fools/' : ''}misc/vpn_block.pug`,
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
            `${aprilFools() ? 'april-fools/' : ''}misc/vpn_block.pug`,
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
            `${aprilFools() ? 'april-fools/' : ''}misc/vpn_block.pug`,
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
        let allowedMethods = router.stack
            .filter(r => r.route && r.route.path === path)
        if (allowedMethods.length == 0) return next();

        // find the allowed methods for the path
        allowedMethods
            .map(r => r.route.stack[0])
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

module.exports = router