const router = require('express').Router();
const User = require('../../../functions/userMgr');
const TokenManager = require('../../../functions/crypto');
const crypto = require('crypto');


router
    .post('/create', async (req, res) => {
        if (!req.headers['authorization']) return res.sendError(1);
        const [_, token] = req.headers['authorization'].split(' ');
        const connection = await req.Database.pool.connect();
        const { rows } = await connection.query(`SELECT * FROM public.APITokens WHERE token = '${token}'`)
        if (rows.length == 0) return res.sendError(2);
        const { associatedfirebaseuid: firebaseUserID } = rows[0];
        const { rows: userRows } = await connection.query(`SELECT * FROM public.users WHERE firebaseuid = '${firebaseUserID}'`)
        const mainUser = User.fromFullPermissionBitString(userRows[0].permissions)
        if (!mainUser.hasPermission('Global::Token.Create', true)) {
            connection.release();
            return res.sendError(12)
        };
        const { firebaseuid } = req.body
        if (!firebaseuid) return res.status(400).json({ error: 'No firebaseuid provided' });
        const generatedToken = TokenManager.generate(`${firebaseuid}.${userRows[0].displayname}:${crypto.randomBytes(16).toString('base64url')}`);
        req.Database.emit('token', { generatedToken, firebaseuid });
        res.status(201).json({token: generatedToken})
        connection.release();
        // const {associatedfirebaseuid: FirebaseUser} = rows[0];
        // AdminApp.auth().getUser(FirebaseUser)
    })
    .delete('/delete', async (req, res) => {
        if (!req.headers['authorization']) return res.sendError(1);
        const [_, token] = req.headers['authorization'].split(' ');
        const connection = await req.Database.pool.connect();
        const { rows } = await connection.query(`SELECT * FROM public.APITokens WHERE token = '${token}'`)
        if (rows.length == 0) return res.sendError(2);
        const { associatedfirebaseuid: firebaseUserID } = rows[0];
        const { rows: userRows } = await connection.query(`SELECT * FROM public.users WHERE firebaseuid = '${firebaseUserID}'`)
        const mainUser = User.fromFullPermissionBitString(userRows[0].permissions)
        if (!mainUser.hasPermission('Global::Token.Delete', true)) {
            connection.release();
            return res.sendError(12)
        }
        const { token: tokenToDelete } = req.body
        if (!tokenToDelete) return res.sendError(8);
        const { rows: tokenRows } = await connection.query(`SELECT * FROM public.APITokens WHERE token = '${tokenToDelete}'`)
        if (tokenRows.length == 0) return res.sendError(9);
        await connection.query(`DELETE FROM public.APITokens WHERE token = '${tokenToDelete}'`)
        await connection.query(`DELETE FROM public.apiUsage WHERE apiToken = '${tokenToDelete}'`)
        res.status(200).json({ message: 'Token deleted' })
        connection.release();
    })
    .get('/list', async (req, res) => {
        if (!req.headers['authorization']) return res.sendError(1);
        const [_, token] = req.headers['authorization'].split(' ');
        const connection = await req.Database.pool.connect();
        const { rows } = await connection.query(`SELECT * FROM public.APITokens WHERE token = '${token}'`)
        if (rows.length == 0) return res.sendError(2);
        const { associatedfirebaseuid: firebaseUserID } = rows[0];
        const { rows: userRows } = await connection.query(`SELECT * FROM public.users WHERE firebaseuid = '${firebaseUserID}'`)
        const mainUser = User.fromFullPermissionBitString(userRows[0].permissions)
        if (!mainUser.hasPermission('Global::Token.ReadAll', true)) {
            connection.release();
            return res.sendError(12)
        }
        const { rows: tokens } = (await connection.query(`SELECT * FROM public.APITokens`))
        const formattedTokens = []
        for (const tokenData of tokens) {
            const { rows: [user] } = (await connection.query(`SELECT * FROM public.users WHERE firebaseuid = '${tokenData.associatedfirebaseuid}' LIMIT 1`))
            formattedTokens.push({
                token: tokenData.token,
                license: tokenData.licenseKey,
                username: user.displayname,
                firebaseuid: user.firebaseuid,
            })
        }
        res.status(200).json(formattedTokens)
        connection.release();
    })
    .get('/info', async (req, res) => {
        const connection = await req.Database.pool.connect();
        const [_, token] = req.headers['authorization'].split(' ');
        if (req.query.token) {
            const { rows } = await connection.query(`SELECT * FROM public.APITokens WHERE token = '${token}'`)
            if (rows.length == 0) return res.sendError(5)
            const { rows: userRows } = await connection.query(`SELECT * FROM public.users WHERE firebaseuid = '${rows[0].associatedfirebaseuid}'`)
            if (userRows.length == 0) return res.sendError(0); // misc error
            const { permissions } = userRows[0];
            const mainUser = User.fromFullPermissionBitString(permissions)
            if (!mainUser.hasPermission('Global::Token.Read', true)) return res.sendError(12);
            const { token: tokenToLookup } = req.query;
            const { rows: tokenRows } = await connection.query(`SELECT * FROM public.APITokens WHERE token = '${tokenToLookup}'`)
            if (tokenRows.length == 0) return res.sendError(13)
            const { rows: [user] } = (await connection.query(`SELECT * FROM public.users WHERE firebaseuid = '${tokenRows[0].associatedfirebaseuid}' LIMIT 1`))
            await connection.release();
            return res.status(200).json({
                token: tokenRows[0].token,
                license: tokenRows[0].licenseKey,
                username: user.displayName,
                firebaseuid: user.firebaseuid,
            })
        } else {
            const { rows } = await connection.query(`SELECT * FROM public.APITokens WHERE token = '${token}'`)
            if (rows.length == 0) return res.sendError(5)
            const { rows: userRows } = await connection.query(`SELECT * FROM public.users WHERE firebaseuid = '${rows[0].associatedfirebaseuid}'`)
            if (userRows.length == 0) return res.sendError(13);
            await connection.release();
            res.status(200).json({
                token: rows[0].token,
                license: rows[0].licenseKey,
                username: userRows[0].displayName,
                firebaseuid: userRows[0].firebaseuid,
            })
        }
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