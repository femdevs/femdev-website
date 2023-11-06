module.exports = class {
    static _c = require('node:crypto')
    static _dCrypt = { h: { alg: 'RSA-RIPEMD160' }, c: { alg: 'chacha20-poly1305', s: { k: 32, iv: 12 } } }
    static _dEnc = 'base64url'
    static _dbobj = () => ({ _a: '', _b: '', _c: '', _d: '', _e: '' })
    static _h = () => this._c.createHash(this._dCrypt.h.alg)
    static _enc = (x, y) => this._c.createCipheriv(this._dCrypt.c.alg, x, y)
    static _dec = (x, y) => this._c.createDecipheriv(this._dCrypt.c.alg, x, y)
    static _sttd(a, b, _e = new Array(0)) {
        Object.keys(this._dbobj()).forEach((k) => { if (!new Object(JSON.parse(Buffer.from(a, b).toString('utf-8'))).hasOwnProperty(k)) _e.push(`Missing ${k} value`) })
        return (_e.length > 0) ? _e.forEach(console.error) : JSON.parse(Buffer.from(a, b).toString('utf-8'));
    }
    static e(d) {
        const
            _d = this._dbobj,
            _in = Buffer.from(d),
            _giv = this._c.randomBytes(this._dCrypt.c.s.iv),
            _k = this._c.randomBytes(this._dCrypt.c.s.k)
        _d._c = this._h().update(_in).digest(this._dEnc)
        _d._a = _giv.toString(this._dEnc)
        _d._b = _k.toString(this._dEnc)
        const _encdata = this._enc(_k, _giv).update(_in)
        _d._d = this._h().update(_encdata).digest(this._dEnc)
        _d._e = _encdata.toString(this._dEnc)
        return Buffer.from(JSON.stringify(_d), 'utf8').toString(this._dEnc)
    }
    static d(d) {
        const _d = this._sttd(d, this._dEnc)
        if (!_d) return;
        const _fd = Buffer.from(_d._e, this._dEnc)
        const _psvh = this._h().update(_fd).digest(this._dEnc);
        if (!(_d._d == _psvh)) throw new TypeError("The Post-Verification Checksum failed to resolve to the provided data")
        const
            _giv = Buffer.from(_d._a, this._dEnc),
            _k = Buffer.from(_d._b, this._dEnc),
            _outData = this._dec(_k, _giv).update(_fd),
            _pevh = this._h().update(_outData).digest(this._dEnc);
        if (!(_d._c == _pevh)) throw new TypeError("The Pre-Verification Checksum failed to resolve to the provided data")
        const _out = _outData.toString('utf-8')
        return _out
    }
}