const crypto = require('node:crypto');
const assert = require('node:assert/strict');

const cryptoDefaults = {
    hashAlgorithm: 'RSA-RIPEMD160',
    crypt: crypto.getCipherInfo("chacha20-poly1305"),
    encoding: 'base64url',
};

class CCrypto {
    static encrypt(inputData) {
        const
            data = { iv: '', key: '', prehash: '', posthash: '', data: '' },
            input = Buffer.from(inputData),
            generatedIV = crypto.randomBytes(cryptoDefaults.crypt.ivLength),
            key = crypto.randomBytes(cryptoDefaults.crypt.keyLength)
        data.prehash = crypto
            .createHash(cryptoDefaults.hashAlgorithm)
            .update(input)
            .digest(cryptoDefaults.encoding)
        data.iv = generatedIV.toString(cryptoDefaults.encoding)
        data.key = key.toString(cryptoDefaults.encoding)
        const encdata = crypto
            .createCipheriv(cryptoDefaults.crypt.name, key, generatedIV)
            .update(input)
        data.posthash = crypto
            .createHash(cryptoDefaults.hashAlgorithm)
            .update(encdata)
            .digest(cryptoDefaults.encoding)
        data.data = encdata.toString(cryptoDefaults.encoding)
        return Buffer.from(JSON.stringify(data), 'utf8').toString(cryptoDefaults.encoding)
    }
    static decrypt(inputData) {
        const data = JSON.parse(Buffer.from(inputData, cryptoDefaults.encoding).toString('utf-8'))
        for (const key of Object.keys({ iv: '', key: '', prehash: '', posthash: '', data: '' })) {
            if (!Object.hasOwn(data, key)) assert.fail(`Missing ${key} value`)
        }
        const formattedData = Buffer.from(data.data, cryptoDefaults.encoding)
        const postVerificationHash = crypto
            .createHash(cryptoDefaults.hashAlgorithm)
            .update(formattedData)
            .digest(cryptoDefaults.encoding);
        assert.equal(data.posthash, postVerificationHash);
        const
            generatedIV = Buffer.from(data.iv, cryptoDefaults.encoding),
            key = Buffer.from(data.key, cryptoDefaults.encoding),
            outData = crypto
                .createDecipheriv(cryptoDefaults.crypt.name, key, generatedIV)
                .update(formattedData),
            preVerificationHash = crypto
                .createHash(cryptoDefaults.hashAlgorithm)
                .update(outData)
                .digest(cryptoDefaults.encoding);
        assert.equal(data.prehash, preVerificationHash);
        return outData.toString('utf-8')
    }
    static fullHash(inputData) {
        let currentHash = inputData;
        crypto.getHashes().forEach(hashAlg => { currentHash = crypto.createHash(hashAlg).update(currentHash).digest(cryptoDefaults.encoding) });
        return crypto
            .createHash('id-rsassa-pkcs1-v1_5-with-sha3-512')
            .update(currentHash)
            .digest('base64url')
    }
    
}

module.exports = CCrypto