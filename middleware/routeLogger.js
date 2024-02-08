const responseTime = require('response-time');
const Chalk = require('chalk');
const crypto = require('crypto');

class CC {
    static chalk = new Chalk.Instance({ level: 3 });
    /** @type {Map<string,Chalk.Chalk>} */
    static colors = new Map()
        .set('dr', CC.chalk.rgb(120, 0, 0))
        .set('lr', CC.chalk.rgb(250, 120, 120))
        .set('o', CC.chalk.rgb(255, 120, 0))
        .set('y', CC.chalk.yellow)
        .set('dg', CC.chalk.rgb(0, 150, 0))
        .set('lg', CC.chalk.rgb(0, 190, 0))
        .set('bg', CC.chalk.rgb(100, 255, 0))
        .set('db', CC.chalk.rgb(0, 0, 139))
        .set('lb', CC.chalk.rgb(65, 105, 225))
        .set('bb', CC.chalk.rgb(0, 191, 255))
        .set('p', CC.chalk.rgb(255, 0, 255))
        .set('pi', CC.chalk.rgb(255, 105, 180))
        .set('w', CC.chalk.rgb(255, 255, 255))
        .set('g', CC.chalk.rgb(120, 120, 120))
        .set('b', CC.chalk.rgb(0, 0, 0));
    static CPrep = (color) => CC.colors.get(color).bold.underline;
    /** @type {Map<string, Map<string,Chalk.Chalk>>} */
    static Dict = new Map()
        .set('status', (new Map()
            .set('1', CC.CPrep('dg'))
            .set('2', CC.CPrep('dg'))
            .set('3', CC.CPrep('lb'))
            .set('4', CC.CPrep('y'))
            .set('5', CC.CPrep('dr'))
            .set('default', CC.CPrep('w'))))
        .set('method', (new Map()
            .set('GET', CC.CPrep('dg'))
            .set('POST', CC.CPrep('db'))
            .set('PUT', CC.CPrep('y'))
            .set('DELETE', CC.CPrep('dr'))
            .set('PATCH', CC.CPrep('p'))
            .set('HEAD', CC.CPrep('lb'))
            .set('OPTIONS', CC.CPrep('o'))
            .set('TRACE', CC.CPrep('bb'))
            .set('CONNECT', CC.CPrep('bg'))))
        .set('resTime', (new Map()
            .set('0', CC.CPrep('lg'))
            .set('1', CC.CPrep('dg'))
            .set('2', CC.CPrep('y'))
            .set('3', CC.CPrep('dr'))
            .set('4', CC.CPrep('dr'))
            .set('5', CC.CPrep('p'))
            .set('6', CC.CPrep('bb'))
            .set('7', CC.CPrep('db'))
            .set('8', CC.CPrep('lb'))
            .set('9', CC.CPrep('w'))
            .set('10', CC.CPrep('g'))))
        .set('bytes', (new Map()
            .set('0', CC.colors.get('g'))
            .set('1', CC.colors.get('lg'))
            .set('2', CC.colors.get('dg'))
            .set('3', CC.colors.get('y'))
            .set('4', CC.colors.get('lr'))
            .set('5', CC.colors.get('dr'))
            .set('-1', CC.colors.get('w'))))
    static status = (code) => (CC.Dict.get('status').get(String(code).at(0)))(code);
    static path = (CC.colors.get('db'));
    static method = (method) => (CC.Dict.get('method').get(method))(method);
    static resTime = (t) => (CC.Dict.get('resTime').get(String(Math.min(Math.floor(t / 100), 10))))(`${t}ms`)
    static bytes = (bytes) => (CC.Dict.get('bytes').get(String([0, 1, 5, 10, 50, 100].findIndex((v) => ((Math.ceil(Number(bytes) / (10 ** 5))) <= v)))))(`${new Intl.NumberFormat('en-US').format(bytes)} bytes`);
}

/** @type {import('express').RequestHandler} */
module.exports = function (mreq, mres, next) {
    return responseTime((req, res, time) => {
        const data = {
            ip: ['::1', '127.0.0.1'].includes(mreq.ip.replace('::ffff:', '')) ? 'localhost' : (mreq.ip || 'unknown').replace('::ffff:', ''),
            method: req.method,
            url: new URL(mreq.originalUrl, 'https://thefemdevs.com/').pathname,
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
            }] ${CC.method(data.method)
            } ${CC.path(data.url)
            } ${CC.status(data.status)
            } ${CC.resTime(data.time)
            } (${CC.bytes(data.bytes)
            })`
        )
        mreq.reqLogs.push({ ...data, ip: crypto.createHash('ssl3-sha1').update(data.ip).digest('base64url') });
    })(mreq, mres, next)
}