const router = require('express').Router();

router
	.use('/auth', require('./auth'))
	.use('/', require('./core'));

module.exports = router;
