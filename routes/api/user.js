const router = require('express').Router();
const { aprilFools } = require('../../functions/utilities');

router
    .get('/get', async (req, res) => {
        if (!req.headers['authorization']) return res.sendError(1);
        const [_, token] = req.headers['authorization'].split(' ');
        const connection = await req.Database.getConnection();
        const [rows] = await connection.query(`SELECT * FROM APITokens WHERE token = '${token}'`)
        if (rows.length == 0) return res.sendError(2);
        const { associatedFirebaseUID: firebaseUserID } = rows[0];
        const [DBUserData] = await connection.query(`SELECT * FROM users WHERE firebaseUID = '${firebaseUserID}'`)
        if (req.headers['x-uid']) {
            if (!req.checkPerms(DBUserData[0].permissions, 'developer', 'readUsers')) {
                res.sendError(12);
                return req.Database.closeConnection(connection);
            }
            const [userRows] = await connection.query(`SELECT * FROM users WHERE firebaseUID = '${req.headers['x-uid']}'`)
            if (userRows.length == 0) return res.sendError(13);
            const userData = await req.FirebaseAdmin.auth().getUser(req.headers['x-uid']);
            if (!userData) return res.sendError(13);
            return res.status(200).json({
                id: userData.uid,
                username: userRows[0].displayname,
                fullName: `${userRows[0].firstname} ${userRows[0].lastname}`,
                email: userData.email,
                permissions: userRows[0].permissions,
            })
        } else {
            const userData = await req.FirebaseAdmin.auth().getUser(firebaseUserID);
            return res.status(200).json({
                id: userData.uid,
                username: userData.displayName,
                fullName: `${DBUserData[0].firstname} ${DBUserData[0].lastname}`,
                email: userData.email,
                permissions: DBUserData[0].permissions,
            })
        }
    })
    .post('/create', async (req, res) => {
        if (!req.headers['authorization']) return res.sendError(1);
        const [_, token] = req.headers['authorization'].split(' ');
        const connection = await req.Database.getConnection();
        const [rows] = await connection.query(`SELECT * FROM APITokens WHERE token = '${token}'`)
        if (rows.length == 0) return res.sendError(2);
        const { associatedFirebaseUID: firebaseUserID } = rows[0];
        const [APIUser] = await connection.query(`SELECT * FROM users WHERE firebaseUID = '${firebaseUserID}'`)
        if (!req.checkPerms(APIUser[0].permissions, 'developer', 'createUsers')) {
            res.sendError(12);
            return req.Database.closeConnection(connection);
        }
        const { username, firstname, lastname, email, password } = req.body;
        if (!username || !firstname || !lastname || !email || !password) return res.sendError(8);
        const newUser = await req.auth
            .createUser({
                displayName: username,
                email,
                password,
            })
            .catch((err) => {
                console.error(err);
                return res.sendError(500);
            })
        await connection.query(`INSERT INTO users (firebaseUID, displayname, firstname, lastname, email) VALUES ('${newUser.uid}', '${username}', '${firstname}', '${lastname}', '${email}')`)
        await req.Database.closeConnection(connection);
        return res.status(201).json({
            user: newUser,
            username,
            fullName: `${firstname} ${lastname}`,
            email,
            permissions: 0,
        })
    })
    .patch('/update', async (req, res) => {
        if (!req.headers['authorization']) return res.sendError(1);
        const [_, token] = req.headers['authorization'].split(' ');
        const connection = await req.Database.getConnection();
        const [rows] = await connection.query(`SELECT * FROM APITokens WHERE token = '${token}'`)
        if (rows.length == 0) return res.sendError(2);
        const { associatedFirebaseUID: firebaseUserID } = rows[0];
        const [APIUser] = await connection.query(`SELECT * FROM users WHERE firebaseUID = '${firebaseUserID}'`)
        if (!req.checkPerms(APIUser[0].permissions, 'developer', 'writeUsers')) {
            res.sendError(12);
            return req.Database.closeConnection(connection);
        }
        const uid = req.headers['x-uid'];
        for (const [key, value] of Object.entries(req.body)) {
            switch (key) {
                case `displayname`:
                    req.auth.updateUser(uid, { displayName: value || null })
                        .catch(_ => req.sendError(500))
                    connection
                        .query(`UPDATE users SET displayname = '${value}' WHERE firebaseUID = '${uid}'`)
                    break;
                case `email`:
                    req.auth.updateUser(uid, { email: value })
                        .catch(_ => req.sendError(500))
                    connection
                        .query(`UPDATE users SET email = '${value}' WHERE firebaseUID = '${uid}'`)
                    break;
                case `password`:
                    req.auth.updateUser(uid, { password: value })
                        .catch(_ => req.sendError(500))
                    break;
                case `perms`:
                    connection
                        .query(`UPDATE users SET permissions = '${value}' WHERE firebaseUID = '${uid}'`)
                        .catch(_ => req.sendError(500))
                    break;
            }
        }
        const [updatedDBUser] = await connection.query(`SELECT * FROM users WHERE firebaseUID = '${uid}'`)
        await req.Database.closeConnection(connection);
        return res.status(200).json({
            id: uid,
            updatedUser: {
                ...req.auth.getUser(uid),
                ...updatedDBUser[0],
            }
        })
    })
    .delete('/delete', async (req, res) => {
        if (!req.headers['authorization']) return res.sendError(1);
        const [_, token] = req.headers['authorization'].split(' ');
        const connection = await req.Database.getConnection();
        const [rows] = await connection.query(`SELECT * FROM APITokens WHERE token = '${token}'`)
        if (rows.length == 0) return res.sendError(2);
        const { associatedFirebaseUID: firebaseUserID } = rows[0];
        const [APIUser] = await connection.query(`SELECT * FROM users WHERE firebaseUID = '${firebaseUserID}'`)
        if (!req.checkPerms(APIUser[0].permissions, 'developer', 'deleteUsers')) {
            res.sendError(12);
            return req.Database.closeConnection(connection);
        }
        const uid = req.headers['x-uid'];
        await req.auth.deleteUser(uid)
            .catch(_ => req.sendError(500))
        await connection.query(`DELETE FROM users WHERE firebaseUID = '${uid}'`)
            .catch(_ => req.sendError(500))
        await req.Database.closeConnection(connection);
        return res.status(200).json({
            id: uid,
            deleted: true,
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