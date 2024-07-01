const session = require('express-session');
const MemoryStore = require('memorystore')(session);

module.exports = session(
	{
		secret: require('crypto').randomBytes(32).toString('base64url'),
		saveUninitialized: true,
		resave: false,
		cookie: {
			domain: process.env.NODE_ENV === 'production' ? 'thefemdevs.com' : 'localhost',
			maxAge: 36e5,
			secure: 'auto',
			sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
		},
		store: new MemoryStore({ checkPeriod: 360_000, stale: false }),
	},
);
