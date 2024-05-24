const
	router = require('express').Router(),
	fullDataToLocationData = ({ results: [info] }) =>
		Object.assign(
			{
				address: {
					full: '',
					houseNumber: '',
					street: '',
					city: '',
					region: '',
					country: '',
					postalCode: '',
				},
				pluscode: '',
				coords: {
					lat: '',
					lng: '',
				},
			},
			{
				address: {
					full: info.formatted_address,
					houseNumber: info.address_components.filter(({ types }) => types.includes('street_number'))[0]?.long_name,
					street: info.address_components.filter(({ types }) => types.includes('route'))[0]?.long_name,
					city: info.address_components.filter(({ types }) => types.includes('locality'))[0].long_name,
					region: info.address_components.filter(({ types }) => types.includes('administrative_area_level_1'))[0].long_name,
					country: info.address_components.filter(({ types }) => types.includes('country'))[0].long_name,
					postalCode: info.address_components.filter(({ types }) => types.includes('postal_code'))[0].long_name,
				},
				pluscode: (data?.plus_code)?.global_code,
				coords: info.geometry.location,
			},
		);

router
	.get('/coords', async (req, res) => {
		if (!(await req.checkPermissions(req, res, { multi: false, perm: 'Location::Coord', allowMgr: true }))) return;
		if (!req.headers['x-coords']) return res.sendError(6);
		const results = await req.axiosReq('/json', {
			baseURL: 'https://maps.googleapis.com/maps/api/geocode',
			params: {
				key: process.env.GMAPS_API_KEY,
				latlng: req.headers['x-coords'],
			},
		});
		const data = JSON.parse(results.data);
		if (data.status === 'ZERO_RESULTS') return res.sendError(13);
		res.json({ data: fullDataToLocationData(data) });
	})
	.get('/pluscode', async (req, res) => {
		if (!(await req.checkPermissions(req, res, { multi: false, perm: 'Location::Pluscode', allowMgr: true }))) return;
		const pluscode = req.headers['x-pluscode'];
		if (!pluscode) return res.sendError(6);
		const results = await req.axiosReq('/json', {
			baseURL: 'https://maps.googleapis.com/maps/api/geocode',
			params: {
				key: process.env.GMAPS_API_KEY,
				address: pluscode,
			},
		});
		const data = JSON.parse(results.data);
		if (data.status === 'ZERO_RESULTS') return res.sendError(13);
		res.json({ data: fullDataToLocationData(data) });
	})
	.get('/address', async (req, res) => {
		if (!(await req.checkPermissions(req, res, { multi: false, perm: 'Location::Address', allowMgr: true }))) return;
		const address = req.headers['x-address'];
		if (!address) return res.sendError(6);
		const results = await req.axiosReq('/json', {
			baseURL: 'https://maps.googleapis.com/maps/api/geocode',
			params: {
				key: process.env.GMAPS_API_KEY,
				address,
			},
		});
		const data = JSON.parse(results.data);
		if (data.status === 'ZERO_RESULTS') return res.sendError(13);
		res.json({ data: fullDataToLocationData(data) });
	})
	.use((req, res, next) => {
		const { path } = req;
		const methodUsed = req.method.toUpperCase();
		let allowedMethods = router.stack.filter(routerObj => routerObj.route && routerObj.route.path === path);
		if (allowedMethods.length === 0) return next();
		allowedMethods.map(routerObj => routerObj.route.stack[0]);
		allowedMethods = { ...allowedMethods[0] };
		allowedMethods = allowedMethods.route.methods;
		if (req.method === 'OPTIONS')
			return res.setHeader('Allow', Object.keys(allowedMethods)
				.map(verb => verb.toUpperCase()).join(', '))
				.setHeader('Access-Control-Allow-Methods', Object.keys(allowedMethods).map(verb => verb.toUpperCase()).join(', '))
				.status(204)
				.send();
		if (allowedMethods[methodUsed]) return next();
		return res.status(405).render(
			`misc/405.pug`,
			req.getErrPage(405, { path, allowedMethods, methodUsed }),
		);
	});

module.exports = router;
