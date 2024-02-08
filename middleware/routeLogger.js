const responseTime = require('response-time');
const Chalk = require('chalk');
const crypto = require('crypto');

class CC {
    static chalk = new Chalk.Instance({ level: 3 });
    static chalkPrep = this.chalk.underline.bold;
    static status(code) {
        code = String(code);
        switch (code.at(0)) {
            case '5':
                return this.chalkPrep.rgb(120, 0, 0)(code)
            case '4':
                return this.chalkPrep.yellow(code)
            case '3':
                return this.chalkPrep.rgb(65, 105, 225)(code)
            case '2':
            case '1':
                return this.chalkPrep.rgb(0, 150, 0)(code)
            default:
                return this.chalkPrep.rgb(255, 255, 255)(code)
        }
    };
    static path = this.chalk.rgb(0, 0, 139);
    static method(method) {
        switch (method) {
            case 'GET':
                return this.chalkPrep.rgb(0, 150, 0)(method);
            case 'POST':
                return this.chalkPrep.rgb(0, 0, 139)(method);
            case 'PUT':
                return this.chalkPrep.yellow(method);
            case 'DELETE':
                return this.chalkPrep.rgb(120, 0, 0)(method);
            case 'PATCH':
                return this.chalkPrep.rgb(255, 0, 255)(method);
            case 'HEAD':
                return this.chalkPrep.rgb(65, 105, 225)(method);
            case 'OPTIONS':
                return this.chalkPrep.rgb(255, 120, 0)(method);
            case 'TRACE':
                return this.chalkPrep.rgb(0, 191, 255)(method);
            case 'CONNECT':
                return this.chalkPrep.rgb(100, 255, 100)(method);
            default:
                return this.chalkPrep.rgb(255, 255, 255)(method);
        }
    };
    static resTime(t) {
        if (t <= 100) return this.chalkPrep.rgb(0, 190, 0)(`${t}ms`);
        if (t <= 200) return this.chalkPrep.rgb(0, 150, 0)(`${t}ms`);
        if (t <= 300) return this.chalkPrep.yellow(`${t}ms`);
        if (t <= 400) return this.chalkPrep.rgb(250, 120, 120)(`${t}ms`);
        if (t <= 500) return this.chalkPrep.rgb(120, 0, 0)(`${t}ms`);
        if (t <= 600) return this.chalkPrep.rgb(255, 0, 255)(`${t}ms`);
        if (t <= 700) return this.chalkPrep.rgb(0, 191, 255)(`${t}ms`);
        if (t <= 800) return this.chalkPrep.rgb(0, 0, 139)(`${t}ms`);
        if (t <= 900) return this.chalkPrep.rgb(65, 105, 225)(`${t}ms`);
        if (t <= 1000) return this.chalkPrep.rgb(255, 255, 255)(`${t}ms`);
        return this.chalkPrep.rgb(120, 120, 120)(`${t}ms`);
    };
    static bytes(bytes) {
        if (bytes == 0) return this.chalk.gray(`0 bytes`);
        if (bytes <= 100_000) return this.chalk.rgb(0, 190, 0)(`${new Intl.NumberFormat('en-US').format(bytes)} bytes`);
        if (bytes <= 500_000) return this.chalk.rgb(0, 150, 0)(`${new Intl.NumberFormat('en-US').format(bytes)} bytes`);
        if (bytes <= 1_000_000) return this.chalk.yellow(`${new Intl.NumberFormat('en-US').format(bytes)} bytes`);
        if (bytes <= 5_000_000) return this.chalk.rgb(250, 120, 120)(`${new Intl.NumberFormat('en-US').format(bytes)} bytes`);
        if (bytes <= 10_000_000) return this.chalk.rgb(120, 0, 0)(`${new Intl.NumberFormat('en-US').format(bytes)} bytes`);

    }
}

/** @type {import('express').RequestHandler} */ module.exports = function (mreq, mres, next) {
    return responseTime((req, res, time) => {
        const data = {
            ip: ['::1', '127.0.0.1'].includes(mreq.ip.replace('::ffff:', '')) ? 'localhost' : (mreq.ip || 'unknown').replace('::ffff:', ''),
            method: req.method,
            url: new URL(mreq.originalUrl, 'https://thefemdevs.com/').pathname,
            status: res.statusCode,
            time: time.toFixed(2),
            bytes: Number(res.getHeader('Content-Length')) | 0,
        }
        const coloredData = {
            ip: CC.chalk.grey(data.ip),
            date: CC.chalk.bold(new Intl.DateTimeFormat('en-us', { year: "numeric", month: "short", day: "numeric", hour: "numeric", minute: "numeric", second: "numeric", weekday: "short", timeZone: "America/Detroit", timeZoneName: undefined }).format(new Date())),
            method: CC.method(data.method),
            url: CC.path(data.url),
            status: CC.status(data.status),
            time: CC.resTime(data.time),
            bytes: CC.bytes(data.bytes),
        }
        console.log(`${coloredData.ip} [${coloredData.date}] ${coloredData.method} ${coloredData.url} ${coloredData.status} ${coloredData.time} (${coloredData.bytes})`)
        mreq.reqLogs.push({ ...data, ip: crypto.createHash('ssl3-sha1').update(data.ip).digest('base64url') });
    })(mreq, mres, next)
}