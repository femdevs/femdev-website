const { default: IPInfoExpress, } = require('ipinfo-express');
const { LruCache } = require('node-ipinfo');
const { RequestHandler } = require('express');
require('dotenv').config();

module.exports = {
    infoMiddleware: IPInfoExpress({
        token: process.env.IPINFO_AT,
        cache: new LruCache({ max: 1000, maxAge: 1000 * 60 * 60 * 24 }),
        timeout: 15_000,
    }),
    /**
     * @type {RequestHandler}
     */
    checkLocation: async (req, res, next) => {
        req.Sentry.startSpan(
            { op: "IPInfoCheck", name: "IP Info Check Handler", data: { path: req.path } },
            () => {
                if (req.ipinfo.bogon) return next();
                if (req.ipinfo.error) throw new Error(error)
                if (['RU', 'CN', 'KP'].includes(req.ipinfo.country) || (req.ipinfo.country == 'US' && req.ipinfo.region == 'California')) return res.render(`misc/location_denial.pug`, req.getErrPage(451, { path: req.path }))
                return next();
            }
        );

    },
}