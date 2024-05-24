const router = require('express').Router();
require('dotenv').config();
const { default: StripeSDK } = require('stripe');
const StripeInstance = new StripeSDK(process.env.STRIPE);

router
	.get('/token/r/:id', async (req, res) => {
		const session = await StripeInstance.checkout.sessions.retrieve(req.params.id);
		if (!session) return res.status(400).send();
		// const customer = session.customer;
		// const subscription = await StripeInstance.subscriptions.retrieve(session.subscription)
		// const connection = await req.Database.pool.connect()
		// const { rows: user } = await connection.query('SELECT * FROM public.users WHERE stripeuser = $1', [customer])
		// eslint-disable-next-line max-len
		// const { rows: tokens } = await connection.query('SELECT * FROM public.apitokens WHERE associatedfirebaseuid = $1 AND stripesub = $2', [user[0].firebaseuid, subscription.items.data[0].id])
		// const {token} = tokens[0]
		// connection.release()
		const token = req.Persistance.get('pendingTokens').get(req.params.id);
		if (!token) return res.status(400).send();
		res.status(200).json({token});
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
			`misc/405.pug`,
			req.getErrPage(405, { path, allowedMethods, methodUsed }),
		);
	});

module.exports = router;
