const express = require('express');
const router = express.Router();

router.get('/discord', (req, res) => res.redirect('https://discord.gg/FgQvDW8jtr'))

module.exports = router;