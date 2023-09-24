const crypto = require('crypto');
const { Buffer } = require('buffer');
require('dotenv').config();

const privateKey = crypto.createPrivateKey(process.env.CRYPT_PRIV);

class TokenManager {
    static generate = (data) => {
        const stringPayload = JSON.stringify(data);
        const payloadBuffer = Buffer.from(stringPayload, 'utf8');
        const hashedPayload = crypto
            .createHash('ssl3-sha1')
            .update(payloadBuffer)
            .digest('base64url');
        const signedPayload = crypto
            .createSign('ssl3-sha1')
            .update(Buffer.from(hashedPayload, 'base64url'))
            .end()
            .sign(privateKey, 'base64url')
        const hashedSignedPayload = crypto
            .createHash('id-rsassa-pkcs1-v1_5-with-sha3-224')
            .update(Buffer.from(signedPayload, 'base64url'))
            .digest('base64url');
        return `${hashedPayload}.${hashedSignedPayload}`;
    }
    static verify = (token) => {
        const [hashedPayload, hashedSignedPayloadA] = token.split('.');
        const signedPayload = crypto
            .createSign('ssl3-sha1')
            .update(Buffer.from(hashedPayload, 'base64url'))
            .end()
            .sign(privateKey, 'base64url')
        const hashedSignedPayloadB = crypto
            .createHash('id-rsassa-pkcs1-v1_5-with-sha3-224')
            .update(Buffer.from(signedPayload, 'base64url'))
            .digest('base64url');
        return hashedSignedPayloadA === hashedSignedPayloadB;
    }
}

module.exports = TokenManager
