/* eslint-disable id-length */
const router = require('express').Router();

const routes = require('./routes/router');

router
	.use((req, res, next) =>
		req.RateLimitMem.consume(req.ip, 2)
			.then(
				({ remainingPoints: r, consumedPoints: c, msBeforeNext: m } = data) => {
					[['Limit', r + c], ['Remaining', r], ['Reset', m]].forEach(v => res.setHeader(`X-RateLimit-${v[0]}`, v[1]));
					next();
				},
				_ => res.setHeader('Retry-After', 1000).status(429).render('misc/429.pug', req.getErrPage(429, {})),
			),
	)
	.get('/robots.txt', (req, res) => res.setHeader('Content-Type', 'text/plain; charset=utf8').sendFile(`${__dirname}/meta/robots.txt`))
	.get('/sitemap', (req, res) => res.setHeader('Content-Type', 'text/xml; charset=utf8').sendFile(`${__dirname}/meta/sitemap.xml`))
	.use(routes);

module.exports = router;
