const router = require('express').Router();

router
	.get('/login', (req, res) => res.render('auth/login'))
	.post('/login', (req, res) => {
		const { username, password } = req.body;
		// Login logic here
	})
	.get('/logout', (req, res) => {
		// Logout logic here
	});

module.exports = router;
