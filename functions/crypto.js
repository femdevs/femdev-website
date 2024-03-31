const crypto = require('crypto');
const { Buffer } = require('buffer');
const assert = require('assert/strict');
require('dotenv').config();

let cd = {
    hashAlgorithm: 'RSA-RIPEMD160',
    crypt: crypto.getCipherInfo("chacha20-poly1305"),
    encoding: 'base64url',
};

Object.assign(cd, Object.fromEntries(['key', 'iv'].map(k => [k, Buffer.from(process.env[`C_${k}`.toUpperCase()], cd.encoding)])))

class TokenManager {
    static generate = (id) => {
        const {iv, key, hashAlgorithm: ha, encoding: e} = cd
        const ed = crypto.createCipheriv(cd.crypt.name, key, iv).update(id)
        const ph = crypto.createHash(ha).update(ed).digest(e)
        const d = ed.toString(e)
        return `${d}.${ph}`
    }
    static verify = (token) => {
        const [d, ph] = token.split('.')
        const {iv, key, hashAlgorithm: ha, encoding: e} = cd
        const fd = Buffer.from(d, e)
        const pvh = crypto.createHash(ha).update(fd).digest(e)
        try {
            assert.equal(ph, pvh)
            crypto.createDecipheriv(cd.crypt.name, key, iv).update(fd).toString('utf-8')
        } catch (e) {
            return false
        }
        return true
    }
    static decode = (token) => {
        const [d, ph] = token.split('.')
        const {iv, key, hashAlgorithm: ha, encoding: e} = cd
        const fd = Buffer.from(d, e)
        const pvh = crypto.createHash(ha).update(fd).digest(e)
        assert.equal(ph, pvh)
        return crypto.createDecipheriv(cd.crypt.name, key, iv).update(fd).toString('utf-8')
    }
}

module.exports = TokenManager
