const express = require('express');
const router = express.Router();
const fs = require('fs');
const mariadb = require('mariadb');

router.get('/transcript/:id', async (req, res) => {
    await mariadb.createConnection({
        host: '127.0.0.1',
        port: 3306,
        user: 'benpai',
        password: 'BenpaiIsCool',
        database: 'sanrio'
    }).then(connection => connection.query(`SELECT transcript FROM tickets WHERE id = ${req.params.id}`))
    .then(results => {
        if (results.length === 0) return
        res.send(fs.readFileSync(`/home/benpai/cdn/tickets/${results[0].transcript}.html`, 'utf8'))
    })
})

router.get('/discord', (req, res) => res.redirect('https://discord.gg/TQ722XTzxu'))

module.exports = router;