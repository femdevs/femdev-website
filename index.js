const app = require('express')()
const http = require('http');
require('dotenv').config();

const router = require('./routes/router');

app
    .set('view engine', 'pug')
    .use('/', router);

http
    .createServer(app)
    .listen(3001, () => console.log('http server is up'));