const router = require('express').Router();

router
    .get('/', (req, res) => {
        res.render(
            'admin/tokens/index.pug',
            {
                title: 'Tokens',
                description: 'Manage your tokens'
            }
        )
    })
    .post('/disable/:id', (req, res) => {})
    .post('/block/:id', (req, res) => {})
    .delete('/:id', (req, res) => {})
    .put('/:id', (req, res) => {})

module.exports = router;