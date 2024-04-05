const responseTime = require('response-time');
const Chalk = require('chalk');
const crypto = require('crypto');

class CC {
    static chalk = new Chalk.Instance({ level: 3 });
    /** @type {Map<string,Chalk.Chalk>} */
    static colors = new Map()
        .set('dr', this.chalk.rgb(120, 0, 0))
        .set('lr', this.chalk.rgb(250, 120, 120))
        .set('o', this.chalk.rgb(255, 120, 0))
        .set('y', this.chalk.yellow)
        .set('dg', this.chalk.rgb(0, 150, 0))
        .set('lg', this.chalk.rgb(0, 190, 0))
        .set('bg', this.chalk.rgb(100, 255, 0))
        .set('db', this.chalk.rgb(0, 0, 139))
        .set('lb', this.chalk.rgb(65, 105, 225))
        .set('bb', this.chalk.rgb(0, 191, 255))
        .set('p', this.chalk.rgb(255, 0, 255))
        .set('pi', this.chalk.rgb(255, 105, 180))
        .set('w', this.chalk.rgb(255, 255, 255))
        .set('g', this.chalk.rgb(120, 120, 120))
        .set('b', this.chalk.rgb(0, 0, 0));
    static CPrep = (color) => this.colors.get(color).bold.underline;
    /** @type {Map<string, Map<string, Chalk.Chalk>>} */
    static Dict = new Map()
        .set('status', (new Map()
            .set('1', this.CPrep('dg'))
            .set('2', this.CPrep('dg'))
            .set('3', this.CPrep('lb'))
            .set('4', this.CPrep('y'))
            .set('5', this.CPrep('dr'))
            .set('default', this.CPrep('w'))))
        .set('method', (new Map()
            .set('GET', this.CPrep('dg'))
            .set('POST', this.CPrep('db'))
            .set('PUT', this.CPrep('y'))
            .set('DELETE', this.CPrep('dr'))
            .set('PATCH', this.CPrep('p'))
            .set('HEAD', this.CPrep('lb'))
            .set('OPTIONS', this.CPrep('o'))
            .set('TRACE', this.CPrep('bb'))
            .set('CONNECT', this.CPrep('bg'))))
        .set('resTime', (new Map()
            .set('0', this.CPrep('lg'))
            .set('1', this.CPrep('dg'))
            .set('2', this.CPrep('y'))
            .set('3', this.CPrep('dr'))
            .set('4', this.CPrep('dr'))
            .set('5', this.CPrep('p'))
            .set('6', this.CPrep('bb'))
            .set('7', this.CPrep('db'))
            .set('8', this.CPrep('lb'))
            .set('9', this.CPrep('w'))
            .set('10', this.CPrep('g'))))
        .set('bytes', (new Map()
            .set('0', this.colors.get('g'))
            .set('1', this.colors.get('lg'))
            .set('2', this.colors.get('dg'))
            .set('3', this.colors.get('y'))
            .set('4', this.colors.get('lr'))
            .set('5', this.colors.get('dr'))
            .set('-1', this.colors.get('w'))))
    static status = (code) => (this.Dict.get('status').get(String(code).at(0)))(code);
    static path = (this.colors.get('db'));
    static method = (method) => (this.Dict.get('method').get(method))(method);
    static resTime = (t) => (this.Dict.get('resTime').get(String(Math.min(Math.floor(t / 100), 10))))(`${t}ms`)
    static bytes = (bytes) => (this.Dict.get('bytes').get(String([0, 1, 5, 10, 50, 100].findIndex((v) => ((Math.ceil(Number(bytes) / (10 ** 5))) <= v)))))(`${new Intl.NumberFormat('en-US').format(bytes)} bytes`);
}

/** @type {import('express').RequestHandler} */
module.exports = function (mreq, mres, next) {
    return responseTime((req, res, time) => {
        const data = {
            ip: ['::1', '127.0.0.1'].includes(mreq.ip.replace('::ffff:', '')) ? 'localhost' : (mreq.ip || 'unknown').replace('::ffff:', ''),
            method: req.method,
            url: new URL(mreq.originalUrl, `${mreq.protocol}://${mreq.hostname}`).pathname,
            status: res.statusCode,
            time: time.toFixed(2),
            bytes: String(res.getHeader('Content-Length') || 0),
        }
        console.log(
            `${(CC.colors.get('lg'))(data.ip)
            } [${CC.chalk.bold(new Intl.DateTimeFormat('en-us', {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "numeric",
                second: "numeric",
                weekday: "short",
                timeZone: "America/Detroit",
                timeZoneName: undefined
            }).format(new Date()))
            }] ${[CC.method(data.method),CC.path(data.url),CC.status(data.status),CC.resTime(data.time)].join(' ')} (${CC.bytes(data.bytes)})`
        )
        mreq.reqLogs.push({ ...data, ip: crypto.createHash('ssl3-sha1').update(data.ip).digest('base64url') });
    })(mreq, mres, next)
}