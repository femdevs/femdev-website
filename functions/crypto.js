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

class TokenManager {
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

module.exports = TokenManager
