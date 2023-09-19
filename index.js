const app = require('express')()
const http = require('http');
require('dotenv').config();

const router = require('./routes/router');

app
    .set('view engine', 'pug')
    .use((_, res, next) => {
        res
            .setHeader('X-Repo', 'https://github.com/femdevs/femdev-website')
            .setHeader('X-Live-Deploy', 'https://thefemdevs.com')
            .setHeader('X-Repository-License', 'Affero General Public License v3.0 or newer (AGPL-3.0-or-later)')
            .setHeader('X-OS', process.platform)
            .setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'sha256-35hTAT/1IIz9Ti1xj6WCh7R3it0qLmomUINsgEpd+Rs=' 'sha256-PQZNDl5LndIkgsHUAmH1RgaNqm3741C7qMtglPA6Vcg='; style-src 'self' 'unsafe-inline' fonts.googleapis.com; img-src 'self' data: cdn.discordapp.com; font-src *; connect-src *; media-src *; object-src 'none'; child-src *; worker-src 'none'; frame-ancestors *; form-action 'self'; upgrade-insecure-requests; block-all-mixed-content; sandbox allow-forms allow-same-origin allow-scripts; base-uri 'self'; manifest-src 'self'; require-trusted-types-for 'script';")
            .setHeader('Cross-Origin-Opener-Policy', 'same-origin')
            .setHeader('Cross-Origin-Embedder-Policy', 'require-corp')
            .removeHeader('X-Powered-By');
        next();
    })
    
    .use('/', router);

http
    .createServer(app)
    .listen(3001, () => console.log('http server is up'));