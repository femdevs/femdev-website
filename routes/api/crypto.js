const router = require('express').Router();
const crypto = require('crypto')
const { Buffer } = require('buffer')
const { semiKey, semiIV } = require('../../config/config.json')

function semiEnc(data, key = semiKey, iv = semiIV) {
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key, 'hex'), Buffer.from(iv, 'hex'))
    let encrypted = cipher.update(data, 'utf8', 'base64url')
    encrypted += cipher.final('base64url')
    return encrypted
}

function semiDec(data, key = semiKey, iv = semiIV) {
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key, 'hex'), Buffer.from(iv, 'hex'))
    let decrypted = decipher.update(data, 'baseb4url', 'utf8')
    decrypted += decipher.final('utf8')
    return decrypted
}

router
    .get('/enc', async (req, res) => {
        const { query: { data } } = req;
        if (!data) return res.status(400).json({
            code: 3,
            message: 'No data provided',
            fatal: false,
        })
        try {
            const encrypted = semiEnc(data);
            return res.json({ data: encrypted })
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
            const decrypted = semiDec(data);
            return res.json({ data: decrypted })
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