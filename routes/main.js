const router = require('express').Router();

router
    .get('/team', async (req, res) => {
        const client = await req.Database.pool.connect()
        let staffRoles = {};
        (await client.query('SELECT * FROM public.staff'))
            .rows
            .filter(staff => staff.isstaff)
            .sort((a, b) => a.id - b.id)
            .forEach((staff, i) => (staffRoles[staff.role] == undefined) ? (staffRoles[staff.role] = { [i]: staff }) : (staffRoles[staff.role][i] = staff))
        Object.keys(staffRoles).forEach(role => staffRoles[role].title = role)
        res.render(
            `${req.aprilFools()}main/team`,
            {
                staff: staffRoles,
                meta: {
                    title: 'FemDev Staff Team',
                    desc: 'Meet the FemDev Staff Team!',
                    url: 'https://thefemdevs.com/team',
                }
            }
        );
        client.release();
    })
    .get('/carrers', (req, res) => {
        res.render(
            `${req.aprilFools()}main/carrers.pug`,
            {
                meta: {
                    title: 'FemDev Carrers',
                    desc: 'Join the FemDev Team!',
                    url: 'https://thefemdevs.com/carrers',
                }
            }
        );
    })
    .get('/branding', (req, res) => {
        res.render(
            `${req.aprilFools()}main/branding.pug`,
            {
                meta: {
                    title: 'FemDev Branding',
                    desc: 'FemDev Branding',
                    url: 'https://thefemdevs.com/branding',
                }
            }
        );
    })
    .get('/products', (req, res) => {
        res.render(
            `${req.aprilFools()}main/products.pug`,
            {
                meta: {
                    title: 'FemDev Products',
                    desc: 'FemDev Products',
                    url: 'https://thefemdevs.com/products',
                }
            }
        );
    })
    .get('/about', (req, res) => {
        res.render(
            `${req.aprilFools()}main/about.pug`,
            {
                meta: {
                    title: 'About FemDev',
                    desc: 'About us, the FemDevs!',
                    url: 'https://thefemdevs.com/about',
                }
            }
        );
    })
    .get('/pds', (req, res) => {
        res.render(
            `${req.aprilFools()}main/poland.pug`,
            {
                file: 'pds',
                meta: {
                    title: 'Poland Destruction Simulator',
                    desc: 'Poland Destruction Simulator Game',
                    url: 'https://thefemdevs.com/pds',
                }
            }
        )
    })
    .get('/index', (req, res) => {
        res.render(
            `${req.aprilFools()}main/index.pug`,
            {
                meta: {
                    title: 'FemDevs Home Page',
                    desc: 'The home of the FemDevs!',
                    url: 'https://thefemdevs.com',
                }
            }
        );
    })
    .get('/redirect', (req, res) => {
        res.redirect(req.query.dest || '/');
    })
    .get(`/`, (req, res) => {
        res.render(
            `${req.aprilFools()}main/index.pug`,
            {
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

module.exports = router;