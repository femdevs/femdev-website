const crypto = require('crypto');

class CSPReport {
    /**
     * @param {{'blocked-uri': string, disposition: string, 'document-uri': string, 'effective-directive': string, 'original-policy': string, referrer: string, 'script-sample': string, 'violated-directive': string, 'status-code': number}} data
    */
    constructor(data) {
        this.blockedURI = data['blocked-uri'];
        this.disposition = data.disposition;
        this.documentURI = data['document-uri'];
        this.effectiveDirective = data['effective-directive'];
        this.originalPolicy = data['original-policy'];
        this.referrer = data.referrer;
        this.scriptSample = data['script-sample'];
        this.violatedDirective = data['violated-directive'];
        this.statusCode = data['status-code'];
        this.reportId = crypto.randomBytes(16).toString('base64url');
    }
}

module.exports = CSPReport;