const router = require('express').Router();
const Cryptolens = require('cryptolens');
const { aprilFools } = require('../../functions/utilities');

const TokenManager = require('../../src/crypto');

// const AdminApp = Admin.initializeApp({
//     credential: Admin.credential.cert(JSON.parse(process.env.FIREBASE_SA)),
//     databaseURL: `https://thefemdevs-default-rtdb.firebaseio.com`
// })

router
    .post('/create', async (req, res) => {
        if (!req.headers['authorization']) return res.sendError(1);
        const [_, token] = req.headers['authorization'].split(' ');
        const connection = await req.Database.getConnection();
        const [rows] = await connection.query(`SELECT * FROM APITokens WHERE token = '${token}'`)
        if (rows.length == 0) return res.sendError(2);
        const [userRows] = await connection.query(`SELECT * FROM users WHERE firebaseUID = '${rows[0].associatedFirebaseUID}'`)
        if (userRows.length == 0) return res.sendError(13);
        if (!req.checkPerms(userRows[0].permissions, 'developer', 'createTokens')) return res.sendError(12);
        const { firebaseUID } = req.body
        if (!firebaseUID) return res.status(400).json({ error: 'No firebaseUID provided' });
        // if (!license) return res.status(400).json({ error: 'No license provided' });
        const { key } = await Cryptolens.Key.CreateKey(process.env.CRYPTOLENS_TOKEN, 21956)
        const generatedToken = TokenManager.generate({ firebaseUID, license: key, username: userRows[0].displayName });
        await connection.query(`INSERT INTO APITokens (token, associatedFirebaseUID, licenseKey) VALUES ('${generatedToken}', '${firebaseUID}', '${key}')`)
        await connection.query(`INSERT INTO apiUsage (apiToken, totalUses) VALUES ('${generatedToken}', 0)`)
        res.status(201).json({
            token: generatedToken,
            license: key,
        })
        req.Database.closeConnection(connection);
        // const {associatedFirebaseUID: FirebaseUser} = rows[0];
        // AdminApp.auth().getUser(FirebaseUser)
    })
    .delete('/delete', async (req, res) => {
        // using the above function, delete the token, and revoke the license
        if (!req.headers['authorization']) return res.sendError(1);
        const [_, token] = req.headers['authorization'].split(' ');
        const connection = await req.Database.getConnection();
        const [rows] = await connection.query(`SELECT * FROM APITokens WHERE token = '${token}'`)
        if (rows.length == 0) return res.sendError(2);
        const [userRows] = await connection.query(`SELECT * FROM users WHERE firebaseUID = '${rows[0].associatedFirebaseUID}'`)
        if (userRows.length == 0) return res.sendError(13);
        if (!req.checkPerms(userRows[0].permissions, 'developer', 'deleteTokens')) return res.sendError(12);
        const { token: tokenToDelete } = req.body
        if (!tokenToDelete) return res.sendError(8);
        const [tokenRows] = await connection.query(`SELECT * FROM APITokens WHERE token = '${tokenToDelete}'`)
        if (tokenRows.length == 0) return res.sendError(9);
        await connection.query(`DELETE FROM APITokens WHERE token = '${tokenToDelete}'`)
        await connection.query(`DELETE FROM apiUsage WHERE apiToken = '${tokenToDelete}'`)
        Cryptolens.Key.BlockKey(process.env.CRYPTOLENS_TOKEN, tokenRows[0].licenseKey)
        res.status(200).json({ message: 'Token deleted' })
        req.Database.closeConnection(connection);
    })
    .get('/list', async (req, res) => {
        // using the above function, list all tokens
        if (!req.headers['authorization']) return res.sendError(1);
        const [_, token] = req.headers['authorization'].split(' ');
        const connection = await req.Database.getConnection();
        const [rows] = await connection.query(`SELECT * FROM APITokens WHERE token = '${token}'`)
        if (rows.length == 0) return res.sendError(2);
        const [userRows] = await connection.query(`SELECT * FROM users WHERE firebaseUID = '${rows[0].associatedFirebaseUID}'`)
        if (userRows.length == 0) return res.sendError(13);
        if (!req.checkPerms(userRows[0].permissions, 'developer', 'admin', 'owner')) return res.sendError(12);
        const tokens  = (await connection.query(`SELECT * FROM APITokens`))[0]
        const formattedTokens = []
        for (const tokenData of tokens) {
            const [user] = (await connection.query(`SELECT * FROM users WHERE firebaseUID = '${tokenData.associatedFirebaseUID}' LIMIT 1`))[0]
            formattedTokens.push({
                token: tokenData.token,
                license: tokenData.licenseKey,
                username: user.displayname,
                firebaseUID: user.firebaseUID,
            })
        }
        res.status(200).json(formattedTokens)
        req.Database.closeConnection(connection);
    })
    .get('/info', async (req, res) => {
        const connection = await req.Database.getConnection();
        const [_, token] = req.headers['authorization'].split(' ');
        if (req.query.token) {
            const [rows] = await connection.query(`SELECT * FROM APITokens WHERE token = '${token}'`)
            if (rows.length == 0) return res.sendError(5)
            const [userRows] = await connection.query(`SELECT * FROM users WHERE firebaseUID = '${rows[0].associatedFirebaseUID}'`)
            if (userRows.length == 0) return res.sendError(500); // misc error
            const { permissions } = userRows[0];
            if (!req.checkPerms(permissions, 'developer', 'readTokens')) return res.sendError(12);
            const { token: tokenToLookup } = req.query;
            const [tokenRows] = await connection.query(`SELECT * FROM APITokens WHERE token = '${tokenToLookup}'`)
            if (tokenRows.length == 0) return res.sendError(13)
            const [user] = (await connection.query(`SELECT * FROM users WHERE firebaseUID = '${tokenRows[0].associatedFirebaseUID}' LIMIT 1`))[0]
            await req.Database.closeConnection(connection);
            return res.status(200).json({
                token: tokenRows[0].token,
                license: tokenRows[0].licenseKey,
                username: user.displayName,
                firebaseUID: user.firebaseUID,
            })
        } else {
            const [rows] = await connection.query(`SELECT * FROM APITokens WHERE token = '${token}'`)
            if (rows.length == 0) return res.sendError(5)
            const [userRows] = await connection.query(`SELECT * FROM users WHERE firebaseUID = '${rows[0].associatedFirebaseUID}'`)
            if (userRows.length == 0) return res.sendError(13);
            await req.Database.closeConnection(connection);
            res.status(200).json({
                token: rows[0].token,
                license: rows[0].licenseKey,
                username: userRows[0].displayName,
                firebaseUID: userRows[0].firebaseUID,
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