const crypto = require('crypto');

class CSPReport {
    /**
     * @param {{'blocked-uri': string, disposition: string, 'document-uri': string, 'effective-directive': string, 'original-policy': string, referrer: string, 'script-sample': string, 'violated-directive': string, 'status-code': number, timeStamp: string, reportId: string}} data
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
        this.timestamp = new Date().toISOString();
        this.reportId = crypto.randomBytes(16).toString('base64url');
    }
}

class CSP {
    static process = (data) => new CSPReport(data);
}

module.exports = CSPReport;