const responseTime = require('response-time');
const Chalk = require('chalk');
const crypto = require('crypto');

const chalk = new Chalk.Instance({ level: 3 });

class ColorConverter {
    static status(code) {
        code = String(code);
        const chalkPrep = chalk.underline.bold;
        switch (code.at(0)) {
            case '5':
                return chalkPrep.rgb(120, 0, 0)(code)
            case '4':
                return chalkPrep.yellow(code)
            case '3':
                return chalkPrep.rgb(65, 105, 225)(code)
            case '2':
            case '1':
                return chalkPrep.rgb(0, 150, 0)(code)
            default:
                return chalkPrep.rgb(255, 255, 255)(code)
        }
    };
    static path = chalk.rgb(0, 0, 139);
    static method(method) {
        const chalkPrep = chalk.underline.bold;
        switch (method) {
            case 'GET':
                return chalkPrep.rgb(0, 150, 0)(method);
            case 'POST':
                return chalkPrep.rgb(0, 0, 139)(method);
            case 'PUT':
                return chalkPrep.yellow(method);
            case 'DELETE':
                return chalkPrep.rgb(120, 0, 0)(method);
            case 'PATCH':
                return chalkPrep.rgb(255, 0, 255)(method);
            case 'HEAD':
                return chalkPrep.rgb(65, 105, 225)(method);
            case 'OPTIONS':
                return chalkPrep.rgb(255, 120, 0)(method);
            case 'TRACE':
                return chalkPrep.rgb(0, 191, 255)(method);
            case 'CONNECT':
                return chalkPrep.rgb(100, 255, 100)(method);
            default:
                return chalkPrep.rgb(255, 255, 255)(method);
        }
    };
    static resTime(t) {
        const chalkPrep = chalk.underline.bold;
        if (t <= 100) return chalkPrep.rgb(0, 190, 0)(`${t}ms`);
        if (t <= 200) return chalkPrep.rgb(0, 150, 0)(`${t}ms`);
        if (t <= 300) return chalkPrep.yellow(`${t}ms`);
        if (t <= 400) return chalkPrep.rgb(250, 120, 120)(`${t}ms`);
        if (t <= 500) return chalkPrep.rgb(120, 0, 0)(`${t}ms`);
        if (t <= 600) return chalkPrep.rgb(255, 0, 255)(`${t}ms`);
        if (t <= 700) return chalkPrep.rgb(0, 191, 255)(`${t}ms`);
        if (t <= 800) return chalkPrep.rgb(0, 0, 139)(`${t}ms`);
        if (t <= 900) return chalkPrep.rgb(65, 105, 225)(`${t}ms`);
        if (t <= 1000) return chalkPrep.rgb(255, 255, 255)(`${t}ms`);
        return chalkPrep.rgb(120, 120, 120)(`${t}ms`);
    };
    static bytes(bytes) {
        if (bytes == 0) return chalk.gray(`0 bytes`);
        if (bytes <= 100_000) return chalk.rgb(0, 190, 0)(`${new Intl.NumberFormat('en-US').format(bytes)} bytes`);
        if (bytes <= 500_000) return chalk.rgb(0, 150, 0)(`${new Intl.NumberFormat('en-US').format(bytes)} bytes`);
        if (bytes <= 1_000_000) return chalk.yellow(`${new Intl.NumberFormat('en-US').format(bytes)} bytes`);
        if (bytes <= 5_000_000) return chalk.rgb(250, 120, 120)(`${new Intl.NumberFormat('en-US').format(bytes)} bytes`);
        if (bytes <= 10_000_000) return chalk.rgb(120, 0, 0)(`${new Intl.NumberFormat('en-US').format(bytes)} bytes`);

    }
}

function middleware(mreq, mres, next) {
    return responseTime((req, res, time) => {
        const data = {
            ip: ['::1', '127.0.0.1'].includes(mreq.ip.replace('::ffff:', '')) ? 'localhost' : (mreq.ip || 'unknown').replace('::ffff:', ''),
            date: new Intl.DateTimeFormat('en-us', { year: "numeric", month: "short", day: "numeric", hour: "numeric", minute: "numeric", second: "numeric", weekday: "short", timeZone: "America/Detroit", timeZoneName: undefined }).format(new Date()),
            method: req.method,
            url: new URL(mreq.originalUrl, 'https://thefemdevs.com/').pathname,
            status: res.statusCode,
            time: time.toFixed(2),
            bytes: Number(res.getHeader('Content-Length')) | 0,
        }
        const coloredData = {
            ip: chalk.grey(data.ip),
            date: chalk.bold(data.date),
            method: ColorConverter.method(data.method),
            url: ColorConverter.path(data.url),
            status: ColorConverter.status(data.status),
            time: ColorConverter.resTime(data.time),
            bytes: ColorConverter.bytes(data.bytes),
        }
        const hashedData = {
            ...data,
            ip: crypto.createHash('ssl3-sha1').update(data.ip).digest('base64url'),
        }
        console.log(`${coloredData.ip} [${coloredData.date}] ${coloredData.method} ${coloredData.url} ${coloredData.status} ${coloredData.time} (${coloredData.bytes})`)
        mreq.Database.saveAccessLog(hashedData);
    })(mreq, mres, next)
}

module.exports = middleware