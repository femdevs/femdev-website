const router = require('express').Router();
const pg = require('pg')

const client = new pg.Client({
    host: 'db.xbrshjvntcletdswsxtq.supabase.co',
    port: 6543,
    database: 'postgres',
    user: 'postgres',
    password: 'sparty182020RootAccess',
    connectionTimeoutMillis: 5000
})

client.on('error', (err) => {
    if (err.code == 'ECONNRESET') client.connect()
    console.error(err)
})

client.connect()

router
    .get('/team', async (req, res) => {
        let staffRoles = {};
        const { rows: data } = await client.query('SELECT * FROM public.staff')
        data
            .filter(staff => staff.isStaff)
            .forEach((staff, i) => {
                if (staffRoles[staff.role] == undefined) { staffRoles[staff.role] = {} }
                staffRoles[staff.role][i] = staff
            })
        Object.keys(staffRoles).forEach(role => staffRoles[role].title = role)
        res.render(
            'main/team',
            {
                title: 'Team',
                staff: staffRoles,
            }
        );
    })
    .get('/carrers', (req, res) => {
        res.render(
            `main/carrers.pug`,
            {
                title: 'Carrers',
            }
        );
    })
    .get('/branding', (req, res) => {
        res.render(
            `main/branding.pug`,
            {
                title: 'Branding',
            }
        );
    })
    .get('/products', (req, res) => {
        res.render(
            `main/products.pug`,
            {
                title: 'Products',
            }
        );
    })
    .get('/about', (req, res) => {
        res.render(
            `main/about.pug`,
            {
                title: 'About',
            }
        );
    })
    .get('/pds', (req, res) => {
        res.render(
            `main/poland.pug`,
            {
                title: "Poland Destruction Simulator",
                file: 'pds',
            }
        )
    })
    .get('/socials', (req, res) => {
        res.render(
            `main/socials.pug`,
            {
                title: 'Socials',
                file: 'socials',
            }
        );
    })
    .get('/index', (req, res) => {
        res.render(
            `main/index.pug`,
            {
                title: 'Homepage',
                file: 'index',
            }
        );
    })
    .get(`/`, (req, res) => {
        res.render(
            `main/index.pug`,
            {
                title: 'Homepage',
                file: 'index',
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
        else {
            res.status(405).render(
                `misc/405.pug`,
                {
                    title: '405 - Method Not Allowed',
                    path,
                    allowedMethods: Object.keys(allowedMethods).map(m => m.toUpperCase()).join(', '),
                    methodUsed: methodUsed
                }
            );
        }
    })

module.exports = router;