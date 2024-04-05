const router = require('express').Router();

router
    .get('/login', (req, res) => res.render('auth/login'))
    .post('/login', (req, res) => {
        // Login logic here
    })
    .get('/logout', (req, res) => {
        // Logout logic here
    })
    .get('/verify', (req, res) => {
        // Verify email logic here
    })
    .get('/verify/:token', (req, res) => {
        // Verify token logic here
    })
    .post('/verify', (req, res) => {

    })

module.exports = router;