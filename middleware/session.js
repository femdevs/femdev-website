const session = require('express-session');
const MemoryStore = require('memorystore')(session);

module.exports = session(
	{
		secret: require('crypto').randomBytes(32).toString('base64url'),
		saveUninitialized: true,
		resave: false,
		cookie: { maxAge: 36 * (10 ** 5), secure: 'auto', sameSite: 'strict' },
		store: new MemoryStore({ checkPeriod: 360_000, stale: false }),
	},
);
