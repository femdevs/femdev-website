const router = require('express').Router();

router
    .get('/get', async (req, res) => {
        if (req.headers['x-uid'] && !(await req.checkPermissions(req, res, { multi: false, perm: 'Global::User.Read', allowMgr: true }))) return;
        const connection = await req.Database.pool.connect();
        const { rows } = await connection.query(`SELECT * FROM public.APITokens WHERE token = '${req.headers['authorization'].split(' ')[1]}'`)
        if (rows.length == 0) return res.sendError(4);
        const { associatedfirebaseuid: firebaseUserID } = rows[0];
        const { rows: DBUserData } = await connection.query(`SELECT * FROM public.users WHERE firebaseuid = '${req.headers['x-uid'] || firebaseUserID}'`)
        if (DBUserData.length == 0) return res.sendError(14);
        const firebaseUser = await req.FirebaseAdmin.auth().getUser(req.headers['x-uid'] || firebaseUserID)
        if (!firebaseUser) return res.sendError(14);
        const userData = Object.assign({}, firebaseUser, DBUserData[0]);
        return res.status(200).json({
            id: userData.uid,
            username: userData.displayName,
            fullName: `${userData.firstname} ${userData.lastname}`,
            email: userData.email,
            permissions: userData.permissions,
        })
    })
    .post('/create', async (req, res) => {
        if (!(await req.checkPermissions(req, res, { multi: false, perm: 'Global::User.Create', allowMgr: true }))) return;
        const { username, firstname, lastname, email, password } = req.body;
        if (!username || !firstname || !lastname || !email || !password) return res.sendError(10);
        const newUser = await req.auth
            .createUser({
                displayName: username,
                email,
                password,
            })
            .catch((err) => {
                console.error(err);
                return res.sendError(15);
            })
        if (res.headersSent) return;
        req.Database.emit('user', { uid: newUser.uid, displayName: username, firstname, lastname, email, permissions: '' })
        return res.status(201).json({
            user: newUser,
            username,
            fullName: `${firstname} ${lastname}`,
            email,
            permissions: '',
        })
    })
    .patch('/update', async (req, res) => {
        if (!(await req.checkPermissions(req, res, { multi: false, perm: 'Global::User.Write', allowMgr: true }))) return;
        const connection = await req.Database.pool.connect();
        const uid = req.headers['x-uid'];
        for (const [key, value] of Object.entries(req.body)) {
            switch (key) {
                default: if (res.headersSent) return; //! If the response has already been sent, returns to prevent an error
                case `displayname`:
                    req.auth.updateUser(uid, { displayName: value || null })
                        .catch(_ => req.sendError(16))
                    connection
                        .query(`UPDATE public.users SET displayname = '${value}' WHERE firebaseuid = '${uid}'`)
                    break;
                case `email`:
                    req.auth.updateUser(uid, { email: value })
                        .catch(_ => req.sendError(16))
                    connection
                        .query(`UPDATE public.users SET email = '${value}' WHERE firebaseuid = '${uid}'`)
                    break;
                case `password`:
                    req.auth.updateUser(uid, { password: value })
                        .catch(_ => req.sendError(16))
                    break;
                case `perms`:
                    connection
                        .query(`UPDATE public.users SET permissions = '${value}' WHERE firebaseuid = '${uid}'`)
                        .catch(_ => req.sendError(16))
                    break;
            }
        }
        const { rows: updatedDBUser } = await connection.query(`SELECT * FROM public.users WHERE firebaseuid = '${uid}'`)
        await connection.release();
        return res.status(200).json({
            id: uid,
            updatedUser: {
                ...req.auth.getUser(uid),
                ...updatedDBUser[0],
            }
        })
    })
    .delete('/delete', async (req, res) => {
        if (!(await req.checkPermissions(req, res, { multi: false, perm: 'Global::User.Delete', allowMgr: true }))) return;
        const connection = await req.Database.pool.connect();
        const uid = req.headers['x-uid'];
        await req.auth.deleteUser(uid)
            .catch(_ => req.sendError(17))
        if (res.headersSent) return;
        await connection.query(`DELETE FROM public.users WHERE firebaseuid = '${uid}'`)
            .catch(_ => req.sendError(17))
        if (res.headersSent) return;
        await connection.release();
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
        if (req.method === 'OPTIONS') return res.setHeader('Allow', Object.keys(allowedMethods).map(m => m.toUpperCase()).join(', ')).setHeader('Access-Control-Allow-Methods', Object.keys(allowedMethods).map(m => m.toUpperCase()).join(', ')).status(204).send();
        if (allowedMethods[methodUsed]) return next();
        res.status(405).render(
            `misc/405.pug`,
            req.getErrPage(405, { path, allowedMethods, methodUsed })
        );
    })

module.exports = router;