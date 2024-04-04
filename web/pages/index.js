const router = require('express').Router();
const vhost = require('vhost');

const alex = require('./alex/');
const ben = require('./ben/');
const oblong = require('./oblong/');

router
    .use((req, res, next) => req.RateLimitMem.consume(req.ip, 2).then(({ remainingPoints: r, consumedPoints: c, msBeforeNext: m } = data) => { [['Limit', r + c], ['Remaining', r], ['Reset', m]].forEach(v => res.setHeader(`X-RateLimit-${v[0]}`, v[1])); next(); }, (_) => res.setHeader('Retry-After', 1000).status(429).render('misc/429.pug', req.getErrPage(429, {}))))
    .use(vhost('alex.thefemdevs.com', alex))
    .use(vhost('ben.thefemdevs.com', ben))
    .use(vhost('oblong.thefemdevs.com', oblong));

module.exports = router;
