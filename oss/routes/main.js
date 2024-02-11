const router = require('express').Router();

router
    .get('/code-of-conduct', async (req, res) => {
        res.render(
            `oss/codeOfConduct.pug`,
            {
                status: (await req.Database.getServerStatus()),
                meta: {
                    title: 'Code of Conduct',
                    desc: 'Code of Conduct',
                    url: 'https://oss.thefemdevs.com/code-of-conduct',
                }
            }
        );
    })
    .get('/contributing', async (req, res) => {
        res.render(
            `oss/contributing.pug`,
            {
                status: (await req.Database.getServerStatus()),
                meta: {
                    title: 'Contributing',
                    desc: 'Contributing',
                    url: 'https://oss.thefemdevs.com/contributing',
                }
            }
        );
    })
    .get('/license', async (req, res) => {
        res.render(
            `oss/license.pug`,
            {
                status: (await req.Database.getServerStatus()),
                meta: {
                    title: 'License',
                    desc: 'License',
                    url: 'https://oss.thefemdevs.com/license',
                }
            }
        );
    })
    .get('/security', async (req, res) => {
        res.render(
            `oss/security.pug`,
            {
                status: (await req.Database.getServerStatus()),
                meta: {
                    title: 'Security',
                    desc: 'Security',
                    url: 'https://oss.thefemdevs.com/security',
                }
            }
        );
    })
    .get('/contributors', async (req, res) => {
        res.render(
            `oss/contributors.pug`,
            {
                status: (await req.Database.getServerStatus()),
                meta: {
                    title: 'Contributors',
                    desc: 'Contributors',
                    url: 'https://oss.thefemdevs.com/contributors',
                }
            }
        );
    })
    .get('/', async (req, res) => {
        res.render(
            `oss/index.pug`,
            {
                status: (await req.Database.getServerStatus()),
                meta: {
                    title: 'Open Source Software',
                    desc: 'Open Source Software',
                    url: 'https://oss.thefemdevs.com/',
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
            `misc/405.pug`,
            req.getErrPage(405, { path, allowedMethods, methodUsed })
        );
    })

module.exports = router;