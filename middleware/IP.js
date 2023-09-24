const { default: IPInfoExpress, } = require('ipinfo-express');
const { LruCache } = require('node-ipinfo')
require('dotenv').config();

const { aprilFools } = require('../functions/utilities');

const cache = new LruCache({ max: 1000, maxAge: 1000 * 60 * 60 * 24 })

const IPInfo = IPInfoExpress({
    token: process.env.IPINFO_AT,
    cache,
    timeout: 15_000,
})

const checkInfo = async (req, res, next) => {
    const info = req.ipinfo;
    // Russia, China, North Korea
    const blacklistedCountries = ['RU', 'CN', 'KP'];
    if (info.bogon) return next();
    if (info.error) return res.sendError(500);
    if (blacklistedCountries.includes(info.country) || (info.country == 'US' && info.region == 'California')) return res.render(
        `${aprilFools() ? 'april-fools/' : ''}misc/403.pug`,
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
    next();
}

module.exports = {
    infoMiddleware: IPInfo,
    checkInfo
}