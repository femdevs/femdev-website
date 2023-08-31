const express = require('express')
const app = express();
const path = require('path');
const http = require('http')
const fs = require('fs')
const router = require('./routes/router');
require('dotenv').config();

fs.readdirSync(`${__dirname}/middleware`).forEach(file => {
    app.use(require(`./middleware/${file}`))
})

app.set('view engine', 'pug');
app.use(express.static(path.join(__dirname, 'assets')));

app.use('/', router);

http
    .createServer(app)
    .listen(3001, () => console.log('http server is up'));