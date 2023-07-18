const crypto = require('crypto')
const { Buffer } = require('buffer')
const { semiKey, semiIV } = require('../config/config.json')

function semiEnc(data, key=semiKey, iv=semiIV) {
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key,'hex'), Buffer.from(iv, 'hex'))
    let encrypted = cipher.update(data, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    return encrypted
}

function semiDec(data, key=semiKey, iv=semiIV) {
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key,'hex'), Buffer.from(iv, 'hex'))
    let decrypted = decipher.update(data, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    return decrypted
}

function keypair(passkey) {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
        modulusLength: 2048,
        publicKeyEncoding: {
            type: 'spki',
            format: 'pem'
        },
        privateKeyEncoding: {
            type: 'pkcs8',
            format: 'pem',
            cipher: 'aes-256-cbc',
            passphrase: passkey
        }
    })
    return { publicKey, privateKey }
}

module.exports = {
    semiEnc,
    semiDec,
    keypair
}