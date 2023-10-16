const router = require('express').Router();
const Cryptolens = require('cryptolens');

const TokenManager = require('../../functions/crypto');

router
    .post('/create', async (req, res) => {
        if (!req.headers['authorization']) return res.sendError(1);
        const [_, token] = req.headers['authorization'].split(' ');
        const connection = await req.Database.pool.connect();
        const { rows } = await connection.query(`SELECT * FROM public.APITokens WHERE token = '${token}'`)
        if (rows.length == 0) return res.sendError(2);
        const { associatedfirebaseuid: firebaseUserID } = rows[0];
        const { rows: userRows } = await connection.query(`SELECT * FROM public.users WHERE firebaseuid = '${firebaseUserID}'`)
        if (!req.checkPerms(userRows[0].permissions, 'developer', 'createTokens')) {
            connection.release();
            return res.sendError(12)
        };
        const { firebaseuid } = req.body
        if (!firebaseuid) return res.status(400).json({ error: 'No firebaseuid provided' });
        // if (!license) return res.status(400).json({ error: 'No license provided' });
        const { key } = await Cryptolens.Key.CreateKey(process.env.CRYPTOLENS_TOKEN, 21956, 0, '', false, null, false, 1)
        await Cryptolens.Key.Activate(process.env.CRYPTOLENS_TOKEN, 21956, key, 'Server')
        const generatedToken = TokenManager.generate({ firebaseuid, license: key, username: userRows[0].displayName });
        req.Database.emit('token', { generatedToken, firebaseuid, key });
        res.status(201).json({
            token: generatedToken,
            license: key,
        })
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
        if (!req.checkPerms(userRows[0].permissions, 'developer', 'deleteTokens')) {
            connection.release();
            return res.sendError(12)
        }
        const { token: tokenToDelete } = req.body
        if (!tokenToDelete) return res.sendError(8);
        const { rows: tokenRows } = await connection.query(`SELECT * FROM public.APITokens WHERE token = '${tokenToDelete}'`)
        if (tokenRows.length == 0) return res.sendError(9);
        await connection.query(`DELETE FROM public.APITokens WHERE token = '${tokenToDelete}'`)
        await connection.query(`DELETE FROM public.apiUsage WHERE apiToken = '${tokenToDelete}'`)
        Cryptolens.Key.BlockKey(process.env.CRYPTOLENS_TOKEN, 21956, tokenRows[0].licenseKey)
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
        if (!req.checkPerms(userRows[0].permissions, 'developer', 'admin', 'owner')) {
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
            if (userRows.length == 0) return res.sendError(500); // misc error
            const { permissions } = userRows[0];
            if (!req.checkPerms(permissions, 'developer', 'readTokens')) return res.sendError(12);
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
    .patch('/disable', async (req, res) => {
        if (!req.headers['authorization']) return res.sendError(1);
        const [_, token] = req.headers['authorization'].split(' ');
        const connection = await req.Database.pool.connect();
        const { rows } = await connection.query(`SELECT * FROM public.APITokens WHERE token = '${token}'`)
        if (rows.length == 0) return res.sendError(2);
        const { associatedfirebaseuid: firebaseUserID } = rows[0];
        const { rows: userRows } = await connection.query(`SELECT * FROM public.users WHERE firebaseuid = '${firebaseUserID}'`)
        if (!req.checkPerms(userRows[0].permissions)) {
            connection.release();
            return res.sendError(12)
        }
        const { token: tokenToDisable } = req.body
        if (!tokenToDisable) return res.sendError(8);
        const { rows: tokenRows } = await connection.query(`SELECT * FROM public.APITokens WHERE token = '${tokenToDisable}'`)
        if (tokenRows.length == 0) return res.sendError(9);
        Cryptolens.Key.Deactivate(process.env.CRYPTOLENS_TOKEN, 21956, tokenRows[0].licenseKey, 'Server')
        connection.release();
        res.status(200).json({ message: 'Token disabled' })
        connection.release();
    })
    .patch('/enable', async (req, res) => {
        if (!req.headers['authorization']) return res.sendError(1);
        const [_, token] = req.headers['authorization'].split(' ');
        const connection = await req.Database.pool.connect();
        const { rows } = await connection.query(`SELECT * FROM public.APITokens WHERE token = '${token}'`)
        if (rows.length == 0) return res.sendError(2);
        const { associatedfirebaseuid: firebaseUserID } = rows[0];
        const { rows: userRows } = await connection.query(`SELECT * FROM public.users WHERE firebaseuid = '${firebaseUserID}'`)
        if (!req.checkPerms(userRows[0].permissions)) {
            connection.release();
            return res.sendError(12)
        }
        const { token: tokenToEnable } = req.body
        if (!tokenToEnable) return res.sendError(8);
        const { rows: tokenRows } = await connection.query(`SELECT * FROM public.APITokens WHERE token = '${tokenToEnable}'`)
        if (tokenRows.length == 0) return res.sendError(9);
        Cryptolens.Key.Activate(process.env.CRYPTOLENS_TOKEN, 21956, tokenRows[0].licenseKey, 'Server')
        connection.release();
        res.status(200).json({ message: 'Token enabled' })
        connection.release();
    })
    .patch('/update', async (req, res) => {
        
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