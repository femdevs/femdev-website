const express = require('express')
const app = express();
const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');
const router = require('./routes/router');
require('dotenv').config();

fs.readdirSync(`${__dirname}/middleware`).forEach(file => {
    app.use(require(`./middleware/${file}`))
})

app.set('view engine', 'pug');
app.use(express.static(path.join(__dirname, 'assets')));

app.use('/', router);

https
    .createServer({
        key: fs.readFileSync(`/etc/letsencrypt/live/thefemdevs.com/privkey.pem`),
        cert: fs.readFileSync(`/etc/letsencrypt/live/thefemdevs.com/fullchain.pem`)
    }, app)
    .listen(443, () => console.log('https server is up'));