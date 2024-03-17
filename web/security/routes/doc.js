const router = require('express').Router();

router
    .post('/new', (req, res) => {
        res.status(204).end();
    });

module.exports = router;