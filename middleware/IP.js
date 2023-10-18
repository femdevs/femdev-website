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
                // Russia, China, North Korea
                if (req.ipinfo.bogon) return next();
                if (req.ipinfo.error) return res.sendError(500);
                if (['RU', 'CN', 'KP'].includes(req.ipinfo.country) || (req.ipinfo.country == 'US' && req.ipinfo.region == 'California')) return res.render(
                    `misc/403.pug`,
                    {
                        errData: {
                            path: req.path,
                        },
                        meta: {
                            title: `451 - Forbidden for Legal Reasons`,
                            desc: `Location Denied`,
                            url: `https://thefemdevs.com/errors/location`
                        }
                    }
                )
                return next();
            }
        );

    },
}