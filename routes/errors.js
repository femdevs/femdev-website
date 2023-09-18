const { aprilFools } = require(`../src/util-fuctions`)

const router = require('express').Router();

router.get(`/400`, (req, res) => {
    res.render(
        `${aprilFools() ? 'april-fools/' : ''}misc/400.pug`,
        {
            title: `400 - Invalid Request`,
            path: req.path,
            meta: {
                title: `400 - Invalid Request`,
                desc: `400 - Invalid Request`,
                url: `https://thefemdevs.com/errors/400`
            }
        }
    )
})

router.get(`/401`, (req, res) => {
    res.render(
        `${aprilFools() ? 'april-fools/' : ''}misc/401.pug`,
        {
            title: `401 - Unauthorized`,
            path: req.path,
            meta: {
                title: `401 - Unauthorized`,
                desc: `401 - Unauthorized`,
                url: `https://thefemdevs.com/errors/401`
            }
        }
    )
})

router.get(`/404`, (req, res) => {
    res.render(
        `${aprilFools() ? 'april-fools/' : ''}misc/404.pug`,
        {
            title: `404 - Page Not Found`,
            path: req.path,
            meta: {
                title: `404 - Page Not Found`,
                desc: `404 - Page Not Found`,
                url: `https://thefemdevs.com/errors/404`
            }
        }
    );
})

router.get(`/405`, (req, res) => {
    const { path } = req
    const allowedMethods = router.stack
        .filter(r => r.route && r.route.path === path)
        .map(r => r.route.stack[0].method.toUpperCase())
        .join(`, `);
    const methodUsed = req.method.toUpperCase();
    res.render(
        `${aprilFools() ? 'april-fools/' : ''}misc/405.pug`,
        {
            title: `405 - Method Not Allowed`,
            path,
            allowedMethods,
            methodUsed,
            meta: {
                title: `405 - Method Not Allowed`,
                desc: `405 - Method Not Allowed`,
                url: `https://thefemdevs.com/errors/405`
            }
        }
    );
})

router.get(`/429`, (req, res) => {
    res.render(
        `${aprilFools() ? 'april-fools/' : ''}misc/429.pug`,
        {
            title: `429 - Too Many Requests`,
            meta: {
                title: `429 - Too Many Requests`,
                desc: `429 - Too Many Requests`,
                url: `https://thefemdevs.com/errors/429`
            }
        }
    )
})

router.get(`/501`, (req, res) => {
    res.render(
        `${aprilFools() ? 'april-fools/' : ''}misc/501.pug`,
        {
            title: `501 - Internal Server Error`,
            errorId: require(`../src/util-fuctions`).Utils.Crypto.FullHash("Testing Error"),
            meta: {
                title: `501 - Internal Server Error`,
                desc: `501 - Internal Server Error`,
                url: `https://thefemdevs.com/errors/501`
            }
        }
    )
})

router.get(`/location`, (req, res) => {
    return res.render(
        `${aprilFools() ? 'april-fools/' : ''}misc/location_denial.pug`,
        {
            title: `Location Denied`,
            meta: {
                title: `Location Denied`,
                desc: `Location Denied`,
                url: `https://thefemdevs.com/errors/location`
            }
        }
    );
})

router.get(`/vpn`, (req, res) => {
    return res.render(
        `${aprilFools() ? 'april-fools/' : ''}misc/vpn_block.pug`,
        {
            title: `VPN Blocked`,
            meta: {
                title: `VPN Blocked`,
                desc: `VPN Blocked`,
                url: `https://thefemdevs.com/errors/vpn`
            }
        }
    );
})

router.get(`/proxy`, (req, res) => {
    return res.render(
        `${aprilFools() ? 'april-fools/' : ''}misc/vpn_block.pug`,
        {
            title: `VPN Blocked`,
            meta: {
                title: `VPN Blocked`,
                desc: `VPN Blocked`,
                url: `https://thefemdevs.com/errors/vpn`
            }
        }
    );
})

router.get(`/tor`, (req, res) => {
    return res.render(
        `${aprilFools() ? 'april-fools/' : ''}misc/vpn_block.pug`,
        {
            title: `VPN Blocked`,
            meta: {
                title: `VPN Blocked`,
                desc: `VPN Blocked`,
                url: `https://thefemdevs.com/errors/vpn`
            }
        }
    );
})

router.get(`/relay`, (req, res) => {
    return res.render(
        `${aprilFools() ? 'april-fools/' : ''}misc/vpn_block.pug`,
        {
            title: `VPN Blocked`,
            meta: {
                title: `VPN Blocked`,
                desc: `VPN Blocked`,
                url: `https://thefemdevs.com/errors/vpn`
            }
        }
    );
})

router.use((req, res, next) => {
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
                title: '405 - Method Not Allowed',
                path,
                allowedMethods: Object.keys(allowedMethods).map(m => m.toUpperCase()).join(', '),
                methodUsed: methodUsed
            }
        );
})

module.exports = router