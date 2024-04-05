const router = require('express').Router();

router
    .get('/', (req, res) => {
        res.render(
            'admin/public/index.pug',
            {
                title: 'Admin',
                description: 'FemDevs Admin Panel',
            }
        )
    })

module.exports = router;