const app = require('express')()
const http = require('http');
require('dotenv').config();
const responseTime = require('response-time');

const router = require('./routes/router');
const Chalk = require('chalk')
const chalk = new Chalk.Instance({ level: 3 })

class ColorConverter {
    static status(code) {
        code = String(code);
        const chalkPrep = chalk.underline.bold;
        switch (code.at(0)) {
            case '5':
                return chalkPrep.rgb(120,0,0)(code)
            case '4':
                return chalkPrep.yellow(code)
            case '3':
                return chalkPrep.rgb(65,105,225)(code)
            case '2':
            case '1':
                return chalkPrep.rgb(0,150,0)(code)
            default:
                return chalkPrep.rgb(255,255,255)(code)
        }
    };
    static path = chalk.rgb(0,0,139);
    static method(method) {
        const chalkPrep = chalk.underline.bold;
        switch (method) {
            case 'GET':
                return chalkPrep.rgb(0,150,0)(method);
            case 'POST':
                return chalkPrep.rgb(0,0,139)(method);
            case 'PUT':
                return chalkPrep.yellow(method);
            case 'DELETE':
                return chalkPrep.rgb(120,0,0)(method);
            case 'PATCH':
                return chalkPrep.rgb(255,0,255)(method);
            case 'HEAD':
                return chalkPrep.rgb(65,105,225)(method);
            case 'OPTIONS':
                return chalkPrep.rgb(255,255,255)(method);
            default:
                return chalkPrep.rgb(255,255,255)(method);
        }
    };
    static resTime(t) {
        const chalkPrep = chalk.underline.bold;
        if (t <= 100) return chalkPrep.rgb(0,190,0)(`${t}ms`);
        if (t <= 200) return chalkPrep.rgb(0,150,0)(`${t}ms`);
        if (t <= 300) return chalkPrep.yellow(`${t}ms`);
        if (t <= 400) return chalkPrep.rgb(250,120,120)(`${t}ms`);
        if (t <= 500) return chalkPrep.rgb(120,0,0)(`${t}ms`);
        if (t <= 600) return chalkPrep.rgb(255,0,255)(`${t}ms`);
        if (t <= 700) return chalkPrep.rgb(0,191,255)(`${t}ms`);
        if (t <= 800) return chalkPrep.rgb(0,0,139)(`${t}ms`);
        if (t <= 900) return chalkPrep.rgb(65,105,225)(`${t}ms`);
        if (t <= 1000) return chalkPrep.rgb(255,255,255)(`${t}ms`);
        return chalkPrep.rgb(120,120,120)(`${t}ms`);
    };
    static bytes(bytes) {
        if (bytes == 0) return chalk.gray(`0 bytes`);
        if (bytes <= 100_000) return chalk.rgb(0,190,0)(`${bytes} bytes`);
        if (bytes <= 500_000) return chalk.rgb(0,150,0)(`${bytes} bytes`);
        if (bytes <= 1_000_000) return chalk.yellow(`${bytes} bytes`);
        if (bytes <= 5_000_000) return chalk.rgb(250,120,120)(`${bytes} bytes`);
        if (bytes <= 10_000_000) return chalk.rgb(120,0,0)(`${bytes} bytes`);

    }
}

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
    .use((mreq, mres, mnext) => responseTime((req, res, time) => {
        const data = {
            ip: chalk.gray(['::1','::ffff:'].includes(mreq.ip) ? 'localhost' : mreq.ip),
            date: chalk.bold(new Intl.DateTimeFormat('en-us', { year: "numeric", month: "short", day: "numeric", hour: "numeric", minute: "numeric", second: "numeric", weekday: "short", timeZone: "America/Detroit", timeZoneName: undefined }).format(new Date())),
            method: ColorConverter.method(req.method),
            url: ColorConverter.path(mreq.originalUrl),
            status: ColorConverter.status(res.statusCode),
            time: ColorConverter.resTime(time.toFixed(2)),
            bytes: ColorConverter.bytes(Number(res.getHeader('Content-Length')) | 0),
        }
        console.log(`${data.ip} [${data.date}] ${data.method} ${data.url} ${data.status} ${data.time} (${data.bytes})`)
    })(mreq, mres, mnext))
    .use('/', router);

http
    .createServer(app)
    .listen(3001, () => console.log('http server is up'));