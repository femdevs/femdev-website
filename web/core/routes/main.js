const router = require('express').Router();

router
    .get('/team', async (req, res) => {
        const client = await req.Database.pool.connect()
        let staffRoles = {};
        const responses = (await client.query('SELECT * FROM public.staff')).rows.filter(staff => staff.isstaff).sort((a, b) => a.id - b.id);
        responses.forEach(staff => staffRoles[staff.role] = staffRoles[staff.role] || {});
        responses.forEach((staff, i) => Object.assign(staffRoles[staff.role], { [i]: { ...staff, avatarUrl: `https://cdn.thefemdevs.com/assets/images/team/${staff.userid}` } }))
        Object.keys(staffRoles).forEach(role => staffRoles[role].title = role)
        res.render(
            `main/team.pug`,
            {
                staff: staffRoles,
                status: (await req.Database.getServerStatus()),
                meta: {
                    title: 'FemDev Staff Team',
                    desc: 'A complete and comprehensive list of the entire FemDev Staff Team!',
                    url: 'https://thefemdevs.com/team',
                }
            }
        );
        client.release();
    })
    .get('/careers', async (req, res) => {
        res.render(
            `main/careers.pug`,
            {
                status: (await req.Database.getServerStatus()),
                meta: {
                    title: 'FemDev Careers',
                    desc: 'Join the FemDev Team!',
                    url: 'https://thefemdevs.com/careers',
                }
            }
        );
    })
    .get('/branding', async (req, res) => {
        res.render(
            `main/branding.pug`,
            {
                status: (await req.Database.getServerStatus()),
                meta: {
                    title: 'FemDev Branding',
                    desc: 'The branding assets of the FemDevs!',
                    url: 'https://thefemdevs.com/branding',
                }
            }
        );
    })
    .get('/products', async (req, res) => {
        res.render(
            `main/products.pug`,
            {
                status: (await req.Database.getServerStatus()),
                meta: {
                    title: 'FemDev Products',
                    desc: 'The products we offer here at FemDevs!',
                    url: 'https://thefemdevs.com/products',
                }
            }
        );
    })
    .get('/about', async (req, res) => {
        res.render(
            `main/about.pug`,
            {
                status: (await req.Database.getServerStatus()),
                meta: {
                    title: 'About FemDev',
                    desc: 'About us, the FemDevs!',
                    url: 'https://thefemdevs.com/about',
                }
            }
        );
    })
    .get('/pds', async (req, res) => {
        res.render(
            `main/poland.pug`,
            {
                file: 'pds',
                status: (await req.Database.getServerStatus()),
                meta: {
                    title: 'Poland Destruction Simulator',
                    desc: 'Poland Destruction Simulator Game',
                    url: 'https://thefemdevs.com/pds',
                }
            }
        )
    })
    .get('/index', async (req, res) => {
        res.render(
            `main/index.pug`,
            {
                status: (await req.Database.getServerStatus()).toString(),
                meta: {
                    title: 'FemDevs Home Page',
                    desc: 'The home of the FemDevs!',
                    url: 'https://thefemdevs.com',
                }
            }
        );
    })
    .get('/redirect', (req, res) => {
        const { dest } = req.query;
        const allowedHosts = [
            'x.com',
            'twitter.com',
            'discord.com',
            'thefemdevs.com',
            'github.com',
            'tiktok.com',
            'discord.gg',
            'instagram.com',
            'reddit.com',
            'femboyland.eu'
        ]
        if (!allowedHosts.some(host => new URL(dest).hostname == host)) return res.status(400).send('Invalid destination URL');
        res.redirect(dest);
    })
    .get(`/`, async (req, res) => {
        res.render(
            `main/index.pug`,
            {
                status: (await req.Database.getServerStatus()),
                meta: {
                    title: 'FemDevs Home Page',
                    desc: 'The home of the FemDevs!',
                    url: 'https://thefemdevs.com',
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