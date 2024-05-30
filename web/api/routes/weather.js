const router = require('express').Router();

router
	.get('/current', async (req, res) => {
		if (!(await req.checkPermissions(req, res, { multi: false, perm: 'Weather::Current', allowMgr: true }))) return;
		let lat, lon;
		if (req.headers['x-city']) {
			const AxiosRes = await req.axiosReq("/json", {
				baseURL: 'https://maps.googleapis.com/maps/api/geocode',
				params: {
					address: req.headers['x-city'],
					key: process.env.GMAPS_API_KEY,
				},
			});
			const data = JSON.parse(AxiosRes.data);
			if (data.status === 'ZERO_RESULTS') return res.sendError(13);
			lat = data.results[0].geometry.location.lat;
			lon = data.results[0].geometry.location.lng;
		} else if (req.query.lat && req.query.lon) [lat, lon] = req.headers['x-coords'].split(',');
		else return res.sendError(6);
		const AxiosRes = await req.axiosReq("/weather", {
			baseURL: 'https://api.openweathermap.org/data/2.5',
			params: {
				appid: process.env.OPEN_WEATHER_API_KEY,
				mode: 'json',
				units: 'imperial',
				lat,
				lon,
			},
		});
		if (AxiosRes.status === 400) return res.sendError(22);
		res.json(JSON.parse(AxiosRes.data));
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
			"misc/405.pug",
			req.getErrPage(405, { path, allowedMethods, methodUsed }),
		);
	});

module.exports = router;
