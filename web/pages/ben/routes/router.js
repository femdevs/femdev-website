const router = require('express').Router();

router
	.use('/cdn', require('./cdn'))
	.use('/api', require('./api'))
	.use('/', require('./core'));

module.exports = router;
