const { testIPBlacklisted } = require('../functions/database');
const { aprilFools } = require('../functions/utilities');
const crypto = require('crypto');

const hash = (data) => {
    let currentHash = data;
    crypto.getHashes().forEach(hashAlg => { currentHash = crypto.createHash(hashAlg).update(currentHash).digest('base64url') })
    return crypto.createHash('id-rsassa-pkcs1-v1_5-with-sha3-512').update(currentHash).digest('base64url');
}

const IBC = async (req, res, next) => {
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
    const [isBlacklisted, reason] = await testIPBlacklisted(hash(ip));
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

module.exports = IBC;