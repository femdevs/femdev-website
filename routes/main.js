const router = require('express').Router();
const mysql = require('mysql2')
const connection = mysql.createConnection('mysql://ksnjpp8wyrrxrswne5k6:pscale_pw_im6VHm18dotzbD8SGnfdQW1pPloWSfFFZMqwJtd1yXJ@aws.connect.psdb.cloud/fembot?ssl={"rejectUnauthorized":true}')


router.get(`/f/:file`, (req, res) => {
    const file = req.params.file;
    res.sendFile(`${process.cwd()}/assets/fonts/${file}`);
});

router
    .get('/products', (req, res) => {
        res.render(
            `main/products.pug`,
            {
                title: 'Products',
                page: 5,
            }
        );
    })
    .get('/about', (req, res) => {
        res.render(
            `main/about.pug`,
            {
                title: 'About',
                page: 4,
            }
        );
    })
    .get('/team', async (req, res) => {
        let staffRoles = {};
        await connection
            .promise()
            .query('SELECT * FROM femdevsStaff WHERE staff = 1')
            .then(([roles, _]) => {
                roles.forEach((staff, i) => {
                    if (staffRoles[staff.role] == undefined) {staffRoles[staff.role] = {}}
                    staffRoles[staff.role][i] = staff
                })
                Object.keys(staffRoles).forEach(role => staffRoles[role].title = role)
            })
            .catch(console.log)
        res.render('main/team', { title: 'Team', staff: staffRoles });
    })
    .get('/socials', (req, res) => {
        res.render(
            `main/socials.pug`,
            {
                title: 'Socials',
                page: 2,
                file: 'socials'
            }
        );
    })
    .get('/pds', (req, res) => {
        res.render(
            `main/poland.pug`,
            {
                title: "Poland Destruction Simulator",
                page: 3,
                file: 'pds'
            }
        )
    })
    .get('/index', (req, res) => {
        res.render(
            `main/index.pug`,
            {
                title: 'Homepage',
                page: 1,
                file: 'index'
            }
        );
    })
    .get(`/`, (req, res) => {
        res.render(
            `main/index.pug`,
            {
                title: 'Homepage',
                page: 1,
                file: 'index'
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

        if (allowedMethods[methodUsed]) {
            return next();
        } else {
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