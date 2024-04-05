const crypto = require('crypto');
const { Buffer } = require('buffer');
const assert = require('assert/strict');
require('dotenv').config();

let cd = {
    ha: 'RSA-RIPEMD160',
    crypt: crypto.getCipherInfo("chacha20-poly1305"),
    e: 'base64url',
};

Object.assign(cd, Object.fromEntries(['key', 'iv'].map(k => [k, Buffer.from(process.env[`C_${k}`.toUpperCase()], cd.e)])))

class CryptographyData {
    constructor() {
        this.iv = ''
        this.key = ''
        this.prehash = ''
        this.posthash = ''
        this.data = ''
    }
}

class Cryptography {
    static encrypt(inputData) {
        const data = new CryptographyData();
        data.prehash = crypto.createHash(cd.ha).update(Buffer.from(inputData)).digest(cd.e)
        data.iv = crypto.randomBytes(cd.crypt.ivLength).toString(cd.e)
        data.key = crypto.randomBytes(cd.crypt.keyLength).toString(cd.e)
        const encdata = crypto.createCipheriv(cd.crypt.name, Buffer.from(data.key, cd.e), Buffer.from(data.iv, cd.e)).update(Buffer.from(inputData))
        data.posthash = crypto.createHash(cd.ha).update(encdata).digest(cd.e)
        data.data = encdata.toString(cd.e)
        return Buffer.from(JSON.stringify(data), 'utf8').toString(cd.e)
    }
    static decrypt(inputData) {
        const data = JSON.parse(Buffer.from(inputData, cd.e).toString('utf-8'))
        Object.keys({ iv: '', key: '', prehash: '', posthash: '', data: '' }).forEach(key => !Object.hasOwn(data, key) ? assert.fail(`Missing ${key} value`) : false)
        const obj = new CryptographyData()
        for (const key of Object.keys(obj)) {
            if (!Object.hasOwn(data, key)) assert.fail(`Missing ${key} value`)
            obj[key] = data[key]
        }
        assert.equal(obj.posthash, crypto.createHash(cd.ha).update(Buffer.from(obj.data, cd.e)).digest(cd.e));
        const outData = crypto.createDecipheriv(cd.crypt.name, Buffer.from(obj.key, cd.e), Buffer.from(obj.iv, cd.e)).update(Buffer.from(obj.data, cd.e));
        assert.equal(data.prehash, crypto.createHash(cd.ha).update(outData).digest(cd.e));
        return outData.toString('utf-8')
    }
    static generate = (id) => {
        const { iv, key, ha, e } = cd
        const ed = crypto.createCipheriv(cd.crypt.name, key, iv).update(id)
        return `${ed.toString(e)}.${crypto.createHash(ha).update(ed).digest(e)}`
    }
    static verify = (token) => {
        const [d, h] = token.split('.')
        const { iv, key, ha, e } = cd
        try {
            assert.equal(h, crypto.createHash(ha).update(Buffer.from(d, e)).digest(e))
            crypto.createDecipheriv(cd.crypt.name, key, iv).update(Buffer.from(d, e)).toString('utf-8')
        } catch (e) {
            return false
        }
        return true
    }
    static decode = (token) => {
        const st = token.split('.')
        const { iv, key, ha, e } = cd
        const fd = Buffer.from(st[0], e)
        const vh = crypto.createHash(ha).update(fd).digest(e)
        assert.equal(st[1], vh instanceof Buffer ? vh.toString(e) : vh)
        return crypto.createDecipheriv(cd.crypt.name, key, iv).update(fd).toString('utf-8')
    }
    static completeHash = (d, fa = 'id-rsassa-pkcs1-v1_5-with-sha3-512') => {
        const hash = crypto.createHash(fa).update(crypto.getHashes().reduce((x, y) => crypto.createHash(y).update(x).digest(), d)).digest(cd.e)
        return hash instanceof Buffer ? hash.toString(cd.e) : hash
    }
}



module.exports = Cryptography;
