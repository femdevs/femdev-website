/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @returns {void}
*/

module.exports = async function (req, res, next) {
    const apiKeys = [
        "96974e5d2e404996b2846085f21128fa",
        "81bfa11d777842dc8fdf5fec4a6ea5b3"
    ]
    const ipInfo = (
        await fetch(
            `https://vpnapi.io/api/${req.ip}?key=${apiKeys[Math.floor(Math.random() * apiKeys.length)]}`
        ).then(
            res => res.json()
        )
    )
    if (ipInfo.message) return next();
    else if (Object.values(ipInfo.security).some(v => v === true)) return res
        .status(401)
        .render('misc/vpn_block.pug')
    else {
        switch (ipInfo.location.country_code) {
            case 'KP':
            case 'CN':
            case 'RU':
                return res
                    .status(451)
                    .render('misc/location_denial.pug')
            case 'US':
                if (ipInfo.location.region === 'California') return res
                    .status(451)
                    .render('misc/location_denial.pug');
            default:
                return next();
        }
    }
}