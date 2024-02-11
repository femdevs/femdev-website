const router = require('express').Router()
require('dotenv').config()
const { default: StripeSDK } = require('stripe')
const StripeInstance = new StripeSDK(process.env.STRIPE)

router
    .get('/apiKey', async (req, res) => {
        const { protocol: p, hostname: h } = req;
        const session = await StripeInstance.checkout.sessions.create({
            mode: 'subscription',
            line_items: [
                {
                    price: 'price_1O3JKDBeqjdZxel2ZZNrskKf',
                    quantity: 1
                },
            ],
            custom_fields: [
                {
                    key: 'username',
                    label: {
                        custom: 'Username',
                        type: 'custom'
                    },
                    type: 'text',
                    text: {
                        maximum_length: 64
                    }
                },
                {
                    key: 'userid',
                    label: {
                        custom: 'Internal User ID',
                        type: 'custom'
                    },
                    type: 'text',
                    optional: true
                }
            ],
            success_url: `${p}://${h}${h === 'localhost' ? ':3000' : ''}/api/token/r/{CHECKOUT_SESSION_ID}`,
        })
        res.redirect(session.url)
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

module.exports = router