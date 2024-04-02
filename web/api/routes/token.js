const router = require('express').Router();
const TokenManager = require('../../../functions/crypto');
const crypto = require('crypto');

router
    .post('/create', async (req, res) => {
        if (!(await req.checkPermissions(req, res, { multi: false, perm: 'Global::Token.Create', allowMgr: true }))) return;
        const connection = await req.Database.pool.connect();
        const { firebaseuid } = req.body
        if (!firebaseuid) return res.status(400).json({ error: 'No firebaseuid provided' });
        const generatedToken = TokenManager.generate(`${firebaseuid}.${userRows[0].displayname}:${crypto.randomBytes(16).toString('base64url')}`);
        req.Database.emit('token', { generatedToken, firebaseuid });
        res.status(201).json({ token: generatedToken })
        connection.release();
        // const {associatedfirebaseuid: FirebaseUser} = rows[0];
        // AdminApp.auth().getUser(FirebaseUser)
    })
    .delete('/delete', async (req, res) => {
        if (!(await req.checkPermissions(req, res, { multi: false, perm: 'Global::Token.Delete', allowMgr: true }))) return;
        const connection = await req.Database.pool.connect();
        const { token: tokenToDelete } = req.body
        if (!tokenToDelete) return res.sendError(10);
        const { rows: tokenRows } = await connection.query(`SELECT * FROM public.APITokens WHERE token = '${tokenToDelete}'`)
        if (tokenRows.length == 0) return res.sendError(21);
        if (res.headersSent) return;
        await connection.query(`DELETE FROM public.APITokens WHERE token = '${tokenToDelete}'`).catch(_ => res.sendError(21))
        if (res.headersSent) return;
        await connection.query(`DELETE FROM public.apiUsage WHERE apiToken = '${tokenToDelete}'`).catch(_ => res.sendError(21))
        if (res.headersSent) return;
        res.status(200).json({ message: 'Token deleted' })
        connection.release();
    })
    .get('/list', async (req, res) => {
        if (!(await req.checkPermissions(req, res, { multi: false, perm: 'Global::Token.ReadAll', allowMgr: true }))) return;
        const connection = await req.Database.pool.connect();
        const { rows: tokens } = (await connection.query(`SELECT * FROM public.APITokens`))
        const formattedTokens = []
        for (const tokenData of tokens) {
            const { rows: [user] } = (await connection.query(`SELECT * FROM public.users WHERE firebaseuid = '${tokenData.associatedfirebaseuid}' LIMIT 1`))
            formattedTokens.push({
                token: tokenData.token,
                username: user.displayname,
                firebaseuid: user.firebaseuid,
            })
        }
        res.status(200).json(formattedTokens)
        connection.release();
    })
    .get('/info', async (req, res) => {
        if (req.query.token && !(await req.checkPermissions(req, res, { multi: false, perm: 'Global::Token.Read', allowMgr: true }))) return;
        const connection = await req.Database.pool.connect();
        const [_, token] = req.headers['authorization'].split(' ');
        const { rows } = await connection.query(`SELECT * FROM public.APITokens WHERE token = '${req.query.token || token}'`)
        if (rows.length == 0) return res.sendError(18)
        const { rows: userRows } = await connection.query(`SELECT * FROM public.users WHERE firebaseuid = '${rows[0].associatedfirebaseuid}'`)
        if (userRows.length == 0) return res.sendError(18);
        await connection.release();
        res.status(200).json({
            token: rows[0].token,
            username: userRows[0].displayName,
            firebaseuid: userRows[0].firebaseuid,
        })
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