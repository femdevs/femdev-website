const crypto = require('crypto');
const { Buffer } = require('buffer');
const assert = require('assert/strict');
require('dotenv').config();

const cd = {
	ha: 'RSA-RIPEMD160',
	crypt: crypto.getCipherInfo("chacha20-poly1305"),
	encoding: 'base64url',
};

Object.assign(cd, Object.fromEntries(['key', 'iv'].map(k => [k, Buffer.from(process.env[`C_${k}`.toUpperCase()], cd.encoding)])));

class CryptographyData {
	constructor() {
		this.iv = '';
		this.key = '';
		this.prehash = '';
		this.posthash = '';
		this.data = '';
	}
}

class Cryptography {
	static encrypt(inputData) {
		
		const data = new CryptographyData();
		data.prehash = crypto.createHash(cd.ha).update(Buffer.from(inputData)).digest(cd.encoding);
		data.iv = crypto.randomBytes(cd.crypt.ivLength).toString(cd.encoding);
		data.key = crypto.randomBytes(cd.crypt.keyLength).toString(cd.encoding);
		const encdata = crypto.createCipheriv(
			cd.crypt.name,
			Buffer.from(data.key, cd.encoding),
			Buffer.from(data.iv, cd.encoding),
		)
			.update(Buffer.from(inputData));
		data.posthash = crypto.createHash(cd.ha).update(encdata).digest(cd.encoding);
		data.data = encdata.toString(cd.encoding);
		return Buffer.from(JSON.stringify(data), 'utf8').toString(cd.encoding);
	}
	static decrypt(inputData) {
		const data = JSON.parse(Buffer.from(inputData, cd.encoding).toString('utf-8'));
		Object.keys({ iv: '', key: '', prehash: '', posthash: '', data: '' })
			.forEach(key => !Object.hasOwn(data, key) ? assert.fail(`Missing ${key} value`) : false);
		const obj = new CryptographyData();
		for (const key of Object.keys(obj)) {
			if (!Object.hasOwn(data, key)) assert.fail(`Missing ${key} value`);
			obj[key] = data[key];
		}
		assert.equal(obj.posthash, crypto.createHash(cd.ha).update(Buffer.from(obj.data, cd.encoding)).digest(cd.encoding));
		const outData = crypto.createDecipheriv(
			cd.crypt.name,
			Buffer.from(obj.key, cd.encoding),
			Buffer.from(obj.iv, cd.encoding),
		)
			.update(Buffer.from(obj.data, cd.encoding));
		assert.equal(data.prehash, crypto.createHash(cd.ha).update(outData).digest(cd.encoding));
		return outData.toString('utf-8');
	}
	static generate = id => {
		const { iv, key, ha, encoding } = cd;
		const ed = crypto.createCipheriv(cd.crypt.name, key, iv).update(id);
		return `${ed.toString(encoding)}.${crypto.createHash(ha).update(ed).digest(encoding)}`;
	};
	static verify = token => {
		const [data, header] = token.split('.');
		const { iv, key, ha, encoding } = cd;
		try {
			assert.equal(header, crypto.createHash(ha).update(Buffer.from(data, encoding)).digest(encoding));
			crypto.createDecipheriv(cd.crypt.name, key, iv).update(Buffer.from(data, encoding)).toString('utf-8');
		} catch (err) {
			return false;
		}
		return true;
	};
	static decode = token => {
		const st = token.split('.');
		const { iv, key, ha, encoding } = cd;
		const fd = Buffer.from(st[0], encoding);
		const vh = crypto.createHash(ha).update(fd).digest(encoding);
		assert.equal(st[1], vh instanceof Buffer ? vh.toString(encoding) : vh);
		return crypto.createDecipheriv(cd.crypt.name, key, iv).update(fd).toString('utf-8');
	};
	static completeHash = (data, fa = 'id-rsassa-pkcs1-v1_5-with-sha3-512') => {
		const hash = crypto
			.createHash(fa)
			.update(
				crypto.getHashes()
					.reduce((hash, alg) => crypto.createHash(alg).update(hash).digest(), data),
			)
			.digest(cd.encoding);
		return hash instanceof Buffer ? hash.toString(cd.encoding) : hash;
	};
}



module.exports = Cryptography;
