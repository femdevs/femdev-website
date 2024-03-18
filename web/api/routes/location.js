const router = require('express').Router();

const User = require('../../../functions/userMgr');

const fullDataToLocationData = (data) => {
    const info = data.results[0];
    return Object.assign({ address: { full: '', houseNumber: '', street: '', city: '', region: '', country: '', postalCode: '' }, pluscode: '', coords: { lat: '', lng: '' } }, {
        address: {
            full: info.formatted_address,
            houseNumber: info.address_components.filter(a => a.types.includes('street_number'))[0]?.long_name,
            street: info.address_components.filter(a => a.types.includes('route'))[0]?.long_name,
            city: info.address_components.filter(a => a.types.includes('locality'))[0].long_name,
            region: info.address_components.filter(a => a.types.includes('administrative_area_level_1'))[0].long_name,
            country: info.address_components.filter(a => a.types.includes('country'))[0].long_name,
            postalCode: info.address_components.filter(a => a.types.includes('postal_code'))[0].long_name,
        },
        pluscode: (data?.plus_code)?.global_code,
        coords: {
            lat: info.geometry.location.lat,
            lng: info.geometry.location.lng,
        }
    })
};

router
    .get('/coords', async (req, res) => {
        const connection = await req.Database.pool.connect();
        const [_, token] = req.headers['authorization'].split(' ');
        const { rows } = await connection.query(`SELECT * FROM public.APITokens WHERE token = '${token}'`)
        if (rows.length == 0) return res.sendError(5)
        const { rows: userRows } = await connection.query(`SELECT * FROM public.users WHERE firebaseuid = '${rows[0].associatedfirebaseuid}'`)
        if (userRows.length == 0) return res.sendError(0); // misc error
        const { permissions } = userRows[0];
        const mainUser = User.fromFullPermissionBitString(permissions)
        if (!mainUser.hasPermission('Location::Coord', true)) {
            connection.release();
            return res.sendError(12);
        }
        connection.release();
        const coordpair = req.headers['x-coords']
        if (!coordpair) return res.sendError(6)
        const results = await req.axiosReq('/json', {
            baseURL: 'https://maps.googleapis.com/maps/api/geocode',
            params: {
                key: process.env.GMAPS_API_KEY,
                latlng: coordpair,
            }
        })
        const data = JSON.parse(results.data)
        if (data.status == 'ZERO_RESULTS') return res.sendError(13)
        res.json({ data: fullDataToLocationData(data) });
    })
    .get('/pluscode', async (req, res) => {
        const connection = await req.Database.pool.connect();
        const [_, token] = req.headers['authorization'].split(' ');
        const { rows } = await connection.query(`SELECT * FROM public.APITokens WHERE token = '${token}'`)
        if (rows.length == 0) return res.sendError(5)
        const { rows: userRows } = await connection.query(`SELECT * FROM public.users WHERE firebaseuid = '${rows[0].associatedfirebaseuid}'`)
        if (userRows.length == 0) return res.sendError(0); // misc error
        const { permissions } = userRows[0];
        const mainUser = User.fromFullPermissionBitString(permissions)
        if (!mainUser.hasPermission('Location::Pluscode', true)) {
            connection.release();
            return res.sendError(12);
        }
        connection.release();
        const pluscode = req.headers['x-pluscode']
        if (!pluscode) return res.sendError(6)
        const results = await req.axiosReq('/json', {
            baseURL: 'https://maps.googleapis.com/maps/api/geocode',
            params: {
                key: process.env.GMAPS_API_KEY,
                address: pluscode,
            }
        })
        const data = JSON.parse(results.data)
        if (data.status == 'ZERO_RESULTS') return res.sendError(13)
        res.json({ data: fullDataToLocationData(data) });
    })
    .get('/address', async (req, res) => {
        const address = req.headers['x-address']
        if (!address) return res.sendError(6)
        const results = await req.axiosReq('/json', {
            baseURL: 'https://maps.googleapis.com/maps/api/geocode',
            params: {
                key: process.env.GMAPS_API_KEY,
                address,
            }
        })
        const data = JSON.parse(results.data)
        if (data.status == 'ZERO_RESULTS') return res.sendError(13)
        res.json({ data: fullDataToLocationData(data) });
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