const router = require('express').Router();

const User = require('../../../functions/userMgr');

router
    .get('/def', async (req, res) => {
        const connection = await req.Database.pool.connect();
        const [_, token] = req.headers['authorization'].split(' ');
        const { rows } = await connection.query(`SELECT * FROM public.APITokens WHERE token = '${token}'`)
        if (rows.length == 0) return res.sendError(5)
        const { rows: userRows } = await connection.query(`SELECT * FROM public.users WHERE firebaseuid = '${rows[0].associatedfirebaseuid}'`)
        if (userRows.length == 0) return res.sendError(0); // misc error
        const { permissions } = userRows[0];
        const mainUser = User.fromFullPermissionBitString(permissions)
        if (!mainUser.hasPermission('Dictionary::Definition', true)) {
            connection.release();
            return res.sendError(12);
        }
        connection.release();
        const word = req.headers['x-word'];
        if (!word) return res.sendError(6)
        const { data } = await req.axiosReq(
            `/${word}`,
            {
                baseURL: 'https://www.dictionaryapi.com/api/v3/references/collegiate/json',
                params: {
                    key: process.env.DAK,
                }
            })
        res.json({defs: JSON.parse(data)[0].shortdef})
    })
    .get('/syn', async (req, res) => {
        const connection = await req.Database.pool.connect();
        const [_, token] = req.headers['authorization'].split(' ');
        const { rows } = await connection.query(`SELECT * FROM public.APITokens WHERE token = '${token}'`)
        if (rows.length == 0) return res.sendError(5)
        const { rows: userRows } = await connection.query(`SELECT * FROM public.users WHERE firebaseuid = '${rows[0].associatedfirebaseuid}'`)
        if (userRows.length == 0) return res.sendError(0); // misc error
        const { permissions } = userRows[0];
        const mainUser = User.fromFullPermissionBitString(permissions)
        if (!mainUser.hasPermission('Dictionary::Synonym', true)) {
            connection.release();
            return res.sendError(12);
        }
        connection.release();
        const word = req.headers['x-word'];
        if (!word) return res.sendError(6)
        const { data } = await req.axiosReq(
            `/${word}`,
            {
                baseURL: 'https://www.dictionaryapi.com/api/v3/references/thesaurus/json/',
                params: {
                    key: process.env.TAK,
                },
            })
        const syns = JSON.parse(data)[0].meta.syns.reduce((acc, curr) => [...acc, ...curr], [])
        res.json({syns})
    })
    .get('/ant', async (req, res) => {
        const connection = await req.Database.pool.connect();
        const [_, token] = req.headers['authorization'].split(' ');
        const { rows } = await connection.query(`SELECT * FROM public.APITokens WHERE token = '${token}'`)
        if (rows.length == 0) return res.sendError(5)
        const { rows: userRows } = await connection.query(`SELECT * FROM public.users WHERE firebaseuid = '${rows[0].associatedfirebaseuid}'`)
        if (userRows.length == 0) return res.sendError(0); // misc error
        const { permissions } = userRows[0];
        const mainUser = User.fromFullPermissionBitString(permissions)
        if (!mainUser.hasPermission('Dictionary::Antonym', true)) {
            connection.release();
            return res.sendError(12);
        }
        connection.release();
        const word = req.headers['x-word'];
        if (!word) return res.sendError(6)
        const { data } = await req.axiosReq(
            `/${word}`,{
                baseURL: 'https://www.dictionaryapi.com/api/v3/references/thesaurus/json/',
                params: {
                    key: process.env.TAK,
                }
            })
        res.json({ants: JSON.parse(data)[0].meta.ants.reduce((acc, curr) => [...acc, ...curr], [])})
    })
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