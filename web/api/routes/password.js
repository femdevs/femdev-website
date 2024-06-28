const router = require('express').Router();
const crypto = require('crypto');

router
    .get('/gen', async (req, res) => {
        if (!(await req.checkPermissions(req, res, { multi: false, perm: 'Password::Generate', allowMgr: true }))) return;
        return res.json({
            password: (() => {
                const syntax = [0, 0, 0].map(_ => 'xxxxxx'.replace(/x/g, () => String.fromCharCode(crypto.randomInt(97, 123))).split(''));
                syntax[crypto.randomInt(0, 3)][crypto.randomInt(0, 6)] = String.fromCharCode(crypto.randomInt(65, 91));
                syntax[crypto.randomInt(0, 3)][crypto.randomInt(0, 6)] = crypto.randomInt(0, 10);
                return syntax.map(arr => arr.join('')).join('-');
            })(),
        });
    })
    .use((req, res, next) => {
        const { path } = req;
        const methodUsed = req.method.toUpperCase();
        let allowedMethods = router.stack.filter(routerObj => routerObj.route && routerObj.route.path === path);
        if (allowedMethods.length === 0) return next();
        allowedMethods.map(routerObj => routerObj.route.stack[0]);
        allowedMethods = { ...allowedMethods[0] };
        allowedMethods = allowedMethods.route.methods;
        if (req.method === 'OPTIONS')
            return res.setHeader('Allow', Object.keys(allowedMethods)
                .map(verb => verb.toUpperCase()).join(', '))
                .setHeader('Access-Control-Allow-Methods', Object.keys(allowedMethods).map(verb => verb.toUpperCase()).join(', '))
                .status(204)
                .send();
        if (allowedMethods[methodUsed]) return next();
        return res.status(405).render(
            "misc/405.pug",
            req.getErrPage(405, { path, allowedMethods, methodUsed }),
        );
    });

module.exports = router;
