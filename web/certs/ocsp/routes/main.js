
const http = require('http');
const async = require('async');
const crypto = require('crypto');
const { OCSPRequest, OCSPResponse, ResponseData, BasicOCSPResponse } = require('asn1.js-rfc2560');
const { Certificate: Cert, Name } = require('asn1.js-rfc5280');

class OCSPUtils {
    static digest = {
        '1.3.14.3.2.26': 'sha1',
        '2.16.840.1.101.3.4.2.1': 'sha256'
    }
    static digestRev = {
        sha1: '1.3.14.3.2.26',
        sha256: '2.16.840.1.101.3.4.2.1'
    }
    static signRev = {
        sha1WithRSAEncryption: [1, 2, 840, 113549, 1, 1, 5],
        sha256WithRSAEncryption: [1, 2, 840, 113549, 1, 1, 11],
        sha384WithRSAEncryption: [1, 2, 840, 113549, 1, 1, 12],
        sha512WithRSAEncryption: [1, 2, 840, 113549, 1, 1, 13]
    }
    static toDER(raw, what) {
        const derm = raw.toString().match(new RegExp(`-----BEGIN ${what}-----([^-]*)-----END ${what}-----`));
        return derm
            ? Buffer.from(derm[1].replace(/[\r\n]/g, ''), 'base64')
            : (typeof raw === 'string')
                ? Buffer.from(raw)
                : raw;
    }
}

// ---------------------------

class Server {
    constructor(options) {
        this.options = Object.assign({ nextUpdate: 24 * 3600 * 1e3 }, options);
        this.key = this.options.key;
        this.cert = Cert.decode(OCSPUtils.toDER(this.options.cert, 'CERTIFICATE'), 'der').tbsCertificate;
        const h = (d, v) => crypto.createHash(d).update(v).digest('hex');
        this.certID = Object.fromEntries(Object.keys(OCSPUtils.digest).map(d => [d, { issuerNameHash: h(d, Name.encode(this.cert.subject, 'der')), issuerKeyHash: h(d, this.cert.subjectPublicKeyInfo.subjectPublicKey.data) }]));
        this.certs = {};
    }
    addCert(serial, status, info) {
        this.certs[serial.toString(16)] = { type: status, value: info };
    }
    getResponses(req, cb) {
        async.map(
            req.tbsRequest.requestList,
            (req, cb) => this.getResponse(req, cb),
            (err, responses) => {
                if (err) return cb(err);
                const tbsResponseData = {
                    version: 'v1',
                    responderID: { type: 'byKey', value: this.certID.sha1.issuerKeyHash },
                    producedAt: new Date(),
                    responses
                }
                cb(null, OCSPResponse.encode({ responseStatus: 'successful', responseBytes: { responseType: 'id-pkix-ocsp-basic', response: BasicOCSPResponse.encode({ tbsResponseData, signatureAlgorithm: { algorithm: OCSPUtils.signRev.sha512WithRSAEncryption }, signature: { unused: 0, data: crypto.createSign('sha512WithRSAEncryption').update(ResponseData.encode(tbsResponseData, 'der')).sign(this.key) } }, 'der') } }, 'der'))
            });
    }
    getResponse(req, cb) {
        const rqcert = req.reqCert
        const digestId = req.reqCert.hashAlgorithm.algorithm.join('.');
        if (!OCSPUtils.digest[digestId]) return cb(new Error(`Unknown digest: ${digestId}`));
        const crt = this.certID[OCSPUtils.digest[digestId]]
        if (!crt) return cb(new Error(`No pre-generated CertID for digest: ${OCSPUtils.digest[digestId]}`));
        if (crt.issuerNameHash.toString('hex') !== rqcert.issuerNameHash.toString('hex')) return cb(new Error('Issuer name mismatch'));
        if (crt.issuerKeyHash.toString('hex') !== rqcert.issuerKeyHash.toString('hex')) return cb(new Error('Issuer key mismatch'));
        cb(null, {
            certId: rqcert,
            certStatus: this.certs[rqcert.serialNumber.toString(16)] || { type: 'unknown', value: null },
            thisUpdate: new Date(),
            nextUpdate: new Date(+new Date() + this.options.nextUpdate)
        });
    }
}

const srv = new Server({ key: OCSPUtils.toDER(key, 'RSA PRIVATE KEY'), cert: OCSPUtils.toDER(cert, 'CERTIFICATE') });

const middleware = (req, res) => {
    if (req.method !== 'POST' || req.headers['content-type'] !== 'application/ocsp-request') return res.status(400).send();
    const done = (out) => res.setHeader('Content-Type', 'application/ocsp-response').setHeader('Content-Length', out.length).send(out);
    req.on('end', () => {
        try {
            srv.getResponses(OCSPRequest.decode(req.body, 'der'), (err, responses) => (err) ? res.status(404).send() : done(responses));
        } catch {
            return done(OCSPResponse.encode({ responseStatus: 'malformed_request' }, 'der'));
        }
    })
}