const { default: IPInfoExpress, } = require('ipinfo-express');
const { LruCache } = require('node-ipinfo');
const crypto = require('crypto');
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

const IBC = async (req, res, next) => {
    const hash = (data) => {
        let currentHash = data;
        crypto.getHashes().forEach(hashAlg => { currentHash = crypto.createHash(hashAlg).update(currentHash).digest('base64url') })
        return crypto.createHash('id-rsassa-pkcs1-v1_5-with-sha3-512').update(currentHash).digest('base64url');
    }
    if (req.session.ipBanned) return res.status(403).render(
        `${aprilFools() ? 'april-fools/' : ''}misc/403.pug`,
        {
            errData: {
                path: req.path,
                code: 403,
                reason: 'You are banned from accessing this website.'
            },
            meta: {
                title: `403 - Forbidden`,
                desc: `403 - Forbidden`,
                url: `https://thefemdevs.com/errors/403`
            }
        }
    );
    const ip = ['::1', '127.0.0.1'].includes(req.ip.replace('::ffff:', '')) ? 'localhost' : (req.ip || 'unknown').replace('::ffff:', '')
    const [isBlacklisted, reason] = await req.Database.testIPBlacklisted(hash(ip));
    if (isBlacklisted) {
        req.session.ipBanned = true;
        return res.status(403).render(
            `${aprilFools() ? 'april-fools/' : ''}misc/403.pug`,
            {
                errData: {
                    path: req.path,
                    code: 403,
                    reason
                },
                meta: {
                    title: `403 - Forbidden`,
                    desc: `403 - Forbidden`,
                    url: `https://thefemdevs.com/errors/403`
                }
            }
        )
    }
    next();
}

module.exports = {
    infoMiddleware: IPInfo,
    checkLocation: checkInfo,
    ipBlacklist: IBC,
}