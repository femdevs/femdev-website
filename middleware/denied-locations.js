/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @returns {void}
*/

module.exports = async function(req, res, next) {
    const ipInfo = (await fetch(`https://api.ipgeolocation.io/ipgeo?apiKey=545111450b5c4ec88874a33a59ac16eb&ip=${req.ip}`).then(res => {
        if (res.status === "423") return false
        else return res.json()
    }))
    if (!ipInfo) return next();
    else {
        switch (ipInfo.country_code2) {
            case 'KP':
            case 'CN':
            case 'RU':
                return res.render('misc/location_denial.pug')
            case 'US':
                if (ipInfo.state_prov === 'California') return res.render('misc/location_denial.pug');
                break;
            default:
                return next();
        }
    }
}