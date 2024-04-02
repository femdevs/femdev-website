const router = require('express').Router();
const CCrypto = require('../../../modules/CCrypto');

router
    .get('/enc', async (req, res) => {
        if (!(await req.checkPermissions(req, res, { multi: false, perm: 'Cryptography::Encrypt', allowMgr: true }))) return;
        if (!req.query) return res.sendError(6)
        const { query: { data } } = req;
        if (!data) return res.sendError(6)
        try {
            return res.status(200).json({ data: CCrypto.encrypt(data) })
        } catch (err) {
            return res.sendError(12)
        }
    })
    .get('/dec', async (req, res) => {
        if (!(await req.checkPermissions(req, res, { multi: false, perm: 'Cryptography::Decrypt', allowMgr: true }))) return;
        if (!req.query) return res.sendError(6)
        const { query: { data } } = req;
        if (!data) return res.sendError(6)
        try {
            return res.status(200).json({ data: CCrypto.decrypt(data) })
        } catch (err) {
            return res.sendError(13)
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