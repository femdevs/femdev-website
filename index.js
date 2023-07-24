const express = require('express');
const app = express();
const fs = require('fs');
const http = require('http');
const https = require('https');
const router = require('./routes/router');
require('dotenv').config();

fs.readdirSync(`${__dirname}/middleware`).forEach(file => {
    app.use(require(`./middleware/${file}`))
})

app.set('view engine', 'pug');

app.use('/', router);

if (process.env.NODE_ENV === 'production') http
    .createServer(app)
    .listen(3001, () => console.log('http server is up'));
else https
    .createServer({
        key: fs.readFileSync(`${__dirname}/internalSSL/server.key`),
        cert: fs.readFileSync(`${__dirname}/internalSSL/server.cert`)
    }, app)
    .listen(3001, () => console.log('https server is up'));

setInterval(() => fetch('https://thefemdevs.com'), 300000)