const router = require('express').Router();

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