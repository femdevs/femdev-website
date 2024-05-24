/** @type {Map<number,Function>} */ module.exports = new Map()
	.set(400, _ => (
		{
			meta: { title: `400 - Bad Request`, desc: `400 - Bad Request`, url: `https://thefemdevs.com/errors/400` },
		}
	))
	.set(401, data => (
		{
			errData: { code: data.status },
			meta: { title: `401 - Unauthorized`, desc: `401 - Unauthorized`, url: `https://thefemdevs.com/errors/401` },
		}
	))
	.set(403, _ => (
		{
			errData: { code: 403, reason: 'You are banned from accessing this website.' },
			meta: { title: `403 - Forbidden`, desc: `403 - Forbidden`, url: `https://thefemdevs.com/errors/403` },
		}
	))
	.set(404, _ => (
		{
			meta: { title: '404 - Page Not Found', desc: '404 - Page Not Found', url: 'https://thefemdevs.com/errors/404' },
		}
	))
	.set(405, data => (
		{
			errData: {
				path: data.path,
				allowedMethods: Object.keys(data.allowedMethods).map(verb => verb.toUpperCase()).join(', '),
				methodUsed: data.methodUsed,
			},
			meta: { title: '405 - Method Not Allowed', desc: '405 - Method Not Allowed', url: 'https://thefemdevs.com/errors/405' },
		}
	))
	.set(429, _ => (
		{
			meta: { title: '429 - Too Many Requests', desc: '429 - Too Many Requests', url: 'https://thefemdevs.com/errors/429' },
		}
	))
	.set(451, _ => (
		{
			meta: { title: `451 - Forbidden for Legal Reasons`, desc: `Location Denied`, url: `https://thefemdevs.com/errors/location` },
		}
	))
	.set(501, _ => (
		{
			meta: { title: `501 - Internal Server Error`, desc: `501 - Internal Server Error`, url: `https://thefemdevs.com/errors/501` },
		}
	));
