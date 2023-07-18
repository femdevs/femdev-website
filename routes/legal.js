const express = require('express');
const router = express.Router();

// Legal Pages including Privacy Policy and Terms and Conditions

router.get('/privacy', (req, res) => {
    res
        .setHeader('Max-Age', 60 * 60 * 24 * 30)
        .setHeader('Cache-Control', 'public')
        .setHeader('Content-Type', 'text/html; charset=utf-8')
        .render(`legal/privacy.pug`, { title: 'Privacy Policy' });
});

router.get('/terms', (req, res) => {
    res
        .setHeader('Max-Age', 60 * 60 * 24 * 30)
        .setHeader('Cache-Control', 'public')
        .setHeader('Content-Type', 'text/html; charset=utf-8')
        .render(`legal/TaC.pug`, { title: 'Terms and Conditions' });
});

module.exports = router;