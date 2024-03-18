const router = require('express').Router();

router
    .get('/', async (req, res) => res.render(
        'pages/ben/index.pug',
        {
            status: (await req.Database.getServerStatus()),
            meta: {
                title: 'Benpai\'s Official Website',
                desc: 'The official website of Benpai!',
                url: 'https://ben.thefemdevs.com',
            }
        }
    ))
    .get('/cdn/img/:file', (req, res) => res.sendFile(`${process.cwd()}/web/pages/assets/ben/imgs/${req.params.file}`))
    .get('/cdn/js/:file', (req, res) => res.sendFile(`${process.cwd()}/web/pages/assets/ben/js/${req.params.file}.js`))
    .get('/cdn/css/:file', (req, res) => res.sendFile(`${process.cwd()}/web/pages/assets/ben/css/${req.params.file}.css`))
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
            `misc/405.pug`,
            req.getErrPage(405, { path, allowedMethods, methodUsed })
        );
    })

module.exports = router;