const express = require('express');
const router = express.Router();

router
	.get('/mta-sts.txt', (req, res) => {
		res.sendFile(`${process.cwd()}/public/mta-sts.txt`);
	});

module.exports = router;
