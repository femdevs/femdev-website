const router = require('express').Router();

//- Functions
const errorResponse = k => require('../../../functions/errorResponse').get(k);
const User = require('../../../functions/userMgr');

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
	.all('*', (req, res, next) => {
		res.send("This route is not implemented yet.");
	})
	.use('/', require('./core'))
	.use('/auth', require('./auth'))
	.use('/tokens', require('./tokens'))
	.use('/users', require('./users'))
	.use('/logs', require('./logs'));

module.exports = router;
