class CustomMath {
    static devideWithRemainder = (a, b) => [Math.floor(a / b), a % b];
    static collatz = (sn = 5, mi = 100) => {
        if (sn <= 0) throw new SyntaxError('Starting Number must be greater than 0');
        let i = 0, f = false, mn = sn, cn = sn
        while (i < mi) {
            cn = (cn % 2 == 1) ? (cn * 3) + 1 : cn / 2;
            ++i;
            mn = Math.max(mn, cn);
            if (cn == 4) { f = true; break }
        }
        return { i, f, mn, cn };
    }
}

class Timer {
    static #timesettings = {
        locale: 'en-US',
        options: {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            weekday: "long",
            timeZone: "America/Detroit",
            timeZoneName: "longGeneric",
        }
    }
    static timestamp = v => new Intl.DateTimeFormat(this.#timesettings.locale, this.#timesettings.options).format(v)
    static elapsedTime = (timestamp) => isNaN(timestamp) ? TypeError("Timestamp must be a number") : Object.entries({ year: Math.floor(Math.floor(timestamp) / (60 ** 2) / 24 / 30 / 12), month: Math.floor(Math.floor(timestamp) / (60 ** 2) / 24 / 30) % 12, day: Math.floor(Math.floor(timestamp) / (60 ** 2) / 24) % 30, hour: Math.floor(Math.floor(timestamp) / (60 ** 2)) % 24, minute: Math.floor(Math.floor(timestamp) / 60) % 60, second: Math.floor(timestamp) % 60 }).map(([key, value]) => value !== 0 ? `${value} ${key}${value == 1 ? '' : 's'}` : null).filter(value => value !== null).join(', ')
    static stringToMilliseconds = (timeString) => typeof timeString !== 'string' ? TypeError("Time String must be a string") : timeString.split(' ').map(value => { switch (value.slice(-1)) { case 'w': return value.slice(0, -1) * 604800000; case 'd': return value.slice(0, -1) * 86400000; case 'h': return value.slice(0, -1) * 3600000; case 'm': return value.slice(0, -1) * 60000; case 's': return value.slice(0, -1) * 1000; } }).reduce((a, b) => a + b, 0);
    static stringToSeconds = (timeString) => this.stringToMilliseconds(timeString) / 1000;
    static unixTime = (date) => (!(date instanceof Date) && typeof date !== 'number') ? TypeError("Date must be a Date object") : Math.round(date.getTime() / 1000)
}

class Converter {
    static stringToBinary = (string) => string.split('').map(char => String(char).charCodeAt(0).toString(2)).join(' ')
    static binaryToString = (binary) => binary.split(' ').map(char => String.fromCharCode(parseInt(char, 2).toString(10))).join('')
    static stringToHex = (string) => string.split('').map(char => String(char).charCodeAt(0).toString(16)).join(' ')
    static hexToString = (hex) => hex.split(' ').map(char => String.fromCharCode(parseInt(char, 16).toString(10))).join('')
    static stringToBase32 = (string) => string.split('').map(char => String(char).charCodeAt(0).toString(32)).join(' ')
    static base32ToString = (base32) => base32.split(' ').map(char => String.fromCharCode(parseInt(char, 32).toString(10))).join('')
}

class RandomGenerators {
    static ranNum = (max = 10) => Math.round(Math.random() * Math.max(max, 1))
    static bRanNum = (amount = 1, max = 10) => new Array(Math.max(amount, 1)).map(() => this.ranNum(max))
    static randHex = (prefix = '') => `${prefix}${Math.floor(Math.random() * Math.pow(16, 6)).toString(16)}`
    static bRandHex = (amount = 1, prefix = '') => new Array(Math.max(amount, 1)).map(() => this.randHex(prefix))
    static customNumberGenerator = (min = 0, max = 100) => Math.round(Math.random() * Number(max) - Number(min)) + Number(min);
    static UUID = _ => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) { const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8); return v.toString(16); });
    static randomString = (length = 10) => Array(length).map(_ => (Math.random() * 36 | 0).toString(36)).join('')
}

class Formatter {
    static formatNumber = (v) => new Intl.NumberFormat('en-US').format(v)
    static relativeTime = (v = new Date()) => new Intl.RelativeTimeFormat('en-US', { style: 'long' }).format(v)
    static formatCurrency = (v) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v)
    static list = (v) => new Intl.ListFormat('en-US', { style: 'long', type: 'conjunction' }).format(v)
    static sort = (a, b) => Intl.Collator('en-US', { caseFirst: 'upper', numeric: true }).compare(a, b)
}

class ArrayAndJSON {
    static combineArrays = (array1, array2) => Array.from(array1).concat(array2)
    static combineJSON = (json1, json2) => Object.assign({}, json1, json2)
    static arrayToJSON = (array) => Object.fromEntries(Array.from(array).entries())
    static JSONToArray = (json, keys = false) => (keys) ? Object.entries(json) : Object.values(json)
    static arrayToSet = (array) => new Set(array)
    static setToArray = (set) => Array.from(set.values())
    static JSONToMap = (JSON) => new Map(Object.entries(JSON))
    static mapToJSON = (map) => Object.fromEntries(map.entries())
    static #privateArrayRandomizer = (array) => array.sort(() => Math.random() > 0.5 ? 1 : -1)
    static arrayRandomizer = (array, iterations = 25) => {
        let newArray = array;
        for (const _ in new Array(iterations)) newArray = this.#privateArrayRandomizer(newArray);
        return newArray;
    }
}

module.exports = class Utils {
    static CustomMath = CustomMath
    static Time = Timer
    static Converter = Converter
    static Random = RandomGenerators
    static Formatter = Formatter
    static ArrayAndJSON = ArrayAndJSON
    get CustomMath() { return CustomMath }
    set CustomMath(_) { throw new ReferenceError('CustomMath is Read-Only') }
    get Time() { return Timer }
    set Time(_) { throw new ReferenceError('Time is Read-Only') }
    get Converter() { return Converter }
    set Converter(_) { throw new ReferenceError('Converter is Read-Only') }
    get Random() { return RandomGenerators }
    set Random(_) { throw new ReferenceError('Random is Read-Only') }
    get Formatter() { return Formatter }
    set Formatter(_) { throw new ReferenceError('Formatter is Read-Only') }
    get ArrayAndJSON() { return ArrayAndJSON }
    set ArrayAndJSON(_) { throw new ReferenceError('ArrayAndJSON is Read-Only') }
}