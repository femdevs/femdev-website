const router = require('express').Router();
const { getConnection, closeConnection } = require('../../functions/database');

router
    .get('/get', async (req, res) => {
        if (!req.headers['authorization']) return res.sendError(1);
        const [_, token] = req.headers['authorization'].split(' ');
        const connection = await getConnection();
        const [rows] = await connection.query(`SELECT * FROM APITokens WHERE token = '${token}'`)
        if (rows.length == 0) return res.sendError(2);
        const holderUser = {
            name: 'John Doe',
            username: 'johndoe',
            id: 38741239462978,
            picture: '',
            flags: 0
        }
        closeConnection(connection);
        return res.json(holderUser)
    })
    .post('/create', async (req, res) => {
        res
            .status(501)
            .send('Not implemented yet')
    })
    .patch('/update', async (req, res) => {
        res
            .status(501)
            .send('Not implemented yet')
    })
    .delete('/delete', async (req, res) => {
        res
            .status(501)
            .send('Not implemented yet')
    })
    .use((req, res, next) => {
        const { path } = req;
        const methodUsed = req.method.toUpperCase();
        let allowedMethods = router.stack.filter(r => r.route && r.route.path === path)
        if (allowedMethods.length == 0) return next();
        allowedMethods.map(r => r.route.stack[0])
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

module.exports = router;