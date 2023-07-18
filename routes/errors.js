const { Router } = require('express')

const router = Router()

router.get('/401', (req, res) => {
    res.render(
        'misc/401.pug',
        {
            title: `401 - Unauthorized`,
            path: req.path,
            code: err.status

        }
    )
})
router.get('/404', (req, res) => {
    res.render(
        `misc/404.pug`,
        {
            title: '404 - Page Not Found',
            path: req.path
        }
    );
})
router.get('/405', (req, res) => {
    const { path } = req
    const allowedMethods = router.stack
        .filter(r => r.route && r.route.path === path)
        .map(r => r.route.stack[0].method.toUpperCase())
        .join(', ');
    const methodUsed = req.method.toUpperCase();
    res.render(
        `misc/405.pug`,
        {
            title: '405 - Method Not Allowed',
            path,
            allowedMethods,
            methodUsed
        }
    );
})
router.get('/429', (req, res) => {
    res.render(
        `misc/429.pug`,
        {
            title: '429 - Too Many Requests'
        }
    )
})
router.get('/501', (req, res) => {
    res.render(
        `misc/501.pug`,
        {
            title: `501 - Internal Server Error`,
            errorId: '000'
        }
    )
})

module.exports = router