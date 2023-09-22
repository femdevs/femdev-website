const router = require('express').Router();
const crypto = require('crypto')
const { Buffer } = require('buffer')
require('dotenv').config()
const publicKey = crypto.createPublicKey(process.env.CRYPT_PUB);
const privateKey = crypto.createPrivateKey(process.env.CRYPT_PRIV);

router
    .get('/enc', async (req, res) => {
        const { query: { data } } = req;
        if (!data) return res.status(400).json({
            code: 3,
            message: 'No data provided',
            fatal: false,
        })
        try {
            const encrypted = crypto.publicEncrypt(publicKey, Buffer.from(data, 'utf8')).toString('base64url')
            return res.status(200).json({ data: encrypted })
        } catch (err) {
            return res.status(400).json({
                code: 4,
                message: 'Incorrect data provided',
                fatal: true,
            })
        }
    })
    .get('/dec', async (req, res) => {
        const { query: { data } } = req;
        if (!data) return res.status(400).json({
            code: 3,
            message: 'No data provided',
            fatal: false,
        })
        try {
            const decrypted = crypto.privateDecrypt(privateKey, Buffer.from(data, 'base64url')).toString('utf8')
            return res.status(200).json({ data: decrypted })
        } catch (err) {
            return res.status(400).json({
                code: 4,
                message: 'Incorrect data provided',
                fatal: true,
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