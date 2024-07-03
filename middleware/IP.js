const { default: IPInfoExpress } = require('ipinfo-express');
const { LruCache } = require('node-ipinfo');
require('dotenv').config();

module.exports = {
	infoMiddleware: IPInfoExpress({
		token: process.env.IPINFO_AT,
		cache: new LruCache({
			max: 1e3, // 1000 items
			ttl: 864e5, // 1 day
			disposeAfter: 6048e5, // 1 week
		}),
		timeout: 15e3, // 15 seconds
	}),
	/**
	 * Check if the user is from a location that is not allowed to access the website
	 * @type {import('express').RequestHandler}
	 */
	checkLocation: async (req, res, next) => (req.ipinfo.bogon)
		? next()
		: (req.ipinfo.error)
			? new Error(req.ipinfo.error)
			: (['RU', 'CN', 'KP'].includes(req.ipinfo.country) || (req.ipinfo.country === 'US' && req.ipinfo.region === 'California'))
				? res.render("misc/location_denial.pug", req.getErrPage(451, { path: req.path }))
				: next(),
};
