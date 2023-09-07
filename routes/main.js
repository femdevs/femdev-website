const router = require('express').Router();
const pg = require('pg')

const pool = new pg.Pool({
    max: 10,
    host: 'db.xbrshjvntcletdswsxtq.supabase.co',
    port: 6543,
    database: 'postgres',
    user: 'postgres',
    password: 'sparty182020RootAccess',
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
    query_timeout: 2000,
    allowExitOnIdle: true,
})

const newClient = (async () => pool.connect())
const closeClient = (async (client) => client.release(true))

router
    .get('/team', async (req, res) => {
        const client = await newClient();
        let staffRoles = {};
        const { rows: data } = await client.query('SELECT * FROM public.staff ORDER BY id ASC')
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
        closeClient(client)
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