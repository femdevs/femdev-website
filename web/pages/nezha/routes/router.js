const router = require('express').Router();

router
	.use('/cdn', require('./cdn'))
	.use('/', require('./core'));

module.exports = router;
