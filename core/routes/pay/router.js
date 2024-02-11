const express = require('express')
const router = express.Router()
const { default: StripeSDK } = require('stripe')
const StripeInstance = new StripeSDK('sk_test_51O2gfrBeqjdZxel2weZc8YAOTGvnj15TCZzoFjr1kuM8nzvpAI7lGsXPW1mqamRXTZ3VWoISpdhTRUtC2v29Nf2l00JHlh2VkX')
const TokenManager = require('../../../functions/crypto');

const payment = require('./pay')
const api = require('./api')

router
    .use('/', payment)
    .use('/api', api)
    .use('/wh', express.json({ verify: (req, _, buffer, enc) => (req['rawBody'] = buffer) }))
    .post('/wh', async (req, res) => {
        try {
            const event = await new Promise((res, _) => res()).then(_ => StripeInstance.webhooks.constructEvent(req['rawBody'], req.headers['stripe-signature'], process.env.STRIPE_WH_SECRET)).catch(console.error)
            switch (event?.type) {
                case 'checkout.session.completed':
                    const subscription = await StripeInstance.subscriptions.retrieve(event.data.object.subscription);
                    if (subscription.plan.product === 'prod_Or1MwoQmDIagRW') {
                        const username = event.data.object.custom_fields.find((v) => v.key === 'username').text.value;
                        const generatedToken = TokenManager.generate({ username: username, subscription: subscription.items.data[0].id });
                        req.Persistance.get('pendingTokens').set(event.data.object.id, generatedToken)
                        res.status(201)
                        // req.Database.emit('token', { generatedToken, firebaseuid: rows[0].firebaseuid, sub: subscription.items.data[0].id });
                        // connection.query(`UPDATE public.users SET stripeuser = '${event.data.object.customer}' WHERE firebaseuid = '${rows[0].firebaseuid}'`)
                    }
                    break;
                default:
                    res.status(204)
            }
            res.send()
        }
        catch (e) {
            console.error(e)
        }
    })
    .use((req, res, n) => {
        const { path } = req;
        const methodUsed = req.method.toUpperCase();
        let allowedMethods = router.stack.filter(r => r.route && r.route.path === path)
        if (allowedMethods.length == 0) return n();
        allowedMethods.map(r => r.route.stack[0])
        allowedMethods = { ...allowedMethods[0] }
        allowedMethods = allowedMethods.route.methods;
        if (req.method === 'OPTIONS') return res.setHeader('Allow', Object.keys(allowedMethods).map(m => m.toUpperCase()).join(', ')).setHeader('Access-Control-Allow-Methods', Object.keys(allowedMethods).map(m => m.toUpperCase()).join(', ')).status(204).send();
        if (allowedMethods[methodUsed]) return n();
        res.status(405).render(
            `misc/405.pug`,
            req.getErrPage(405, { path, allowedMethods, methodUsed })
        );
    })

module.exports = router