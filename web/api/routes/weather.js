const router = require('express').Router();

const User = require('../../../functions/userMgr');

router
    .get('/current', async (req, res) => {
        const connection = await req.Database.pool.connect();
        const [_, token] = req.headers['authorization'].split(' ');
        const { rows } = await connection.query(`SELECT * FROM public.APITokens WHERE token = '${token}'`)
        if (rows.length == 0) return res.sendError(5)
        const { rows: userRows } = await connection.query(`SELECT * FROM public.users WHERE firebaseuid = '${rows[0].associatedfirebaseuid}'`)
        if (userRows.length == 0) return res.sendError(0); // misc error
        const { permissions } = userRows[0];
        const mainUser = User.fromFullPermissionBitString(permissions)
        if (!mainUser.hasPermission('Weather::Current', true)) {
            connection.release();
            return res.sendError(12);
        }
        connection.release();
        let lat, lon;
        if (req.headers['x-city']) {
            const AxiosRes = await req.axiosReq(`/json`, {
                baseURL: 'https://maps.googleapis.com/maps/api/geocode',
                params: {
                    address: req.headers['x-city'],
                    key: process.env.GMAPS_API_KEY,
                }
            })
            const data = JSON.parse(AxiosRes.data)
            if (data.status == 'ZERO_RESULTS') return res.sendError(13)
            lat = data.results[0].geometry.location.lat
            lon = data.results[0].geometry.location.lng
        } else if (req.query.lat && req.query.lon) {
            [lat, lon] = req.headers['x-coords'].split(',')
        } else return res.sendError(4)
        const AxiosRes = await req.axiosReq(`/weather`, {
            baseURL: 'https://api.openweathermap.org/data/2.5',
            params: {
                appid: process.env.OPEN_WEATHER_API_KEY,
                mode: 'json',
                units: 'imperial',
                lat,
                lon
            }
        })
        if (AxiosRes.status == 400) return res.sendError(13)
        res.json(JSON.parse(AxiosRes.data))
    })
    .use((req, res, next) => {
        const { path } = req;
        const methodUsed = req.method.toUpperCase();
        let allowedMethods = router.stack.filter(r => r.route && r.route.path === path)
        if (allowedMethods.length == 0) return next();
        allowedMethods.map(r => r.route.stack[0])
        allowedMethods = { ...allowedMethods[0] }
        allowedMethods = allowedMethods.route.methods;
        if (req.method === 'OPTIONS') return res.setHeader('Allow', Object.keys(allowedMethods).map(m => m.toUpperCase()).join(', ')).setHeader('Access-Control-Allow-Methods', Object.keys(allowedMethods).map(m => m.toUpperCase()).join(', ')).status(204).send();
        if (allowedMethods[methodUsed]) return next();
        res.status(405).render(
            `misc/405.pug`,
            req.getErrPage(405, { path, allowedMethods, methodUsed })
        );
    })

module.exports = router;