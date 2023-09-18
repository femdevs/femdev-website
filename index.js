const express = require('express')
const app = express();
const path = require('path');
const http = require('http')
const router = require('./routes/router');
require('dotenv').config();

app
    .set('view engine', 'pug')
    .use((req, res, next) => {
        res
            .setHeader('X-Repo', 'https://github.com/femdevs/femdev-website')
            .setHeader('X-Live-Deploy', 'https://thefemdevs.com')
            .setHeader('X-Repository-License', 'Affero General Public License v3.0 or newer (AGPL-3.0-or-later)')
            .setHeader('X-OS', process.platform)
            .removeHeader('X-Powered-By')
        // .setHeader('X-Head', latestHead);
        next();
    })
    .use(express.static(path.join(__dirname, 'assets')))
    .use('/', router);

http
    .createServer(app)
    .listen(3001, () => console.log('http server is up'));