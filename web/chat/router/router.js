const router = require('express').Router();
require('dotenv').config();

router
	.use('/', require('./core'));

module.exports = router;
