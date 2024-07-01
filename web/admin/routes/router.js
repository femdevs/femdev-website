const router = require('express').Router();

//- Functions
const errorResponse = k => require('../../../functions/errorResponse').get(k);

router
	.use((req, res, next) => {
		const sendClose = (res, code) => {
			const resp = errorResponse(code);
			delete resp.httpCode;
			res.status(errorResponse(code).httpCode).json(resp); 
			return false;
		};
		Object.assign(res, {
			sendClose,
			sendError: code =>
				res.status(errorResponse(code).httpCode)
					.json({ code: errorResponse(code).code, message: errorResponse(code).message }),
		});
		next();
	})
	.use('/tokens', require('./tokens'))
	.use('/users', require('./users'))
	.use('/logs', require('./logs'))
	.use('/', require('./core'));

module.exports = router;
