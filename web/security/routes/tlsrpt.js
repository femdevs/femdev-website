const router = require('express').Router();

class Report {
    constructor(orgName, startDate, endDate, contactInfo, reportId) {
        this.orgName = orgName || 'Unknown';
        this.startDate = startDate || new Date();
        this.endDate = endDate || new Date();
        this.contactInfo = contactInfo || 'Unknown';
        this.reportId = reportId || 'Unknown';
        this.policies = [];
    }
    addPolicy(policy) {
        this.policies.push(policy);
    }
}
class Policy {
    constructor(data) {
        this.type = data.policy['policy-type'] || 'Unknown';
        this.domain = data.policy['policy-domain'] || 'Unknown';
        this.host = data.policy['mx-host'] || 'Unknown';
        this.successes = data.summary['total-successful-session-count'] || 0;
        this.failures = data.summary['total-failure-session-count'] || 0;
        this.details = [];
        data['failure-details'].forEach(detail => this.addDetail(new FailureDetails(detail)));
    }
    addDetail(detail) {
        this.details.push(detail);
    }
}
class FailureDetails {
    constructor(details) {
        this.type = details['result-type'] || 'Unknown';
        this.outIP = details['sending-mta-ip'] || 'Unknown';
        this.inHost = details['receiving-mx-hostname'] || 'Unknown';
        this.inIP = details['receiving-ip'] || 'Unknown';
        this.failed = details['failed-session-count'] || 0;
        this.extraData = details['additional-information'] || 'Unknown';
        this.fCode = details['failure-reason-code'] || 'Unknown';
    }
}

router
    .use('/submit', require('express').json(), (req, res) => {
        const { body } = req;
        const report = new Report(
            body['organization-name'],
            body['date-range']['start-datetime'],
            body['date-range']['end-datetime'],
            body['contact-info'],
            body['report-id']
        );
        for (const policyData of body['policies']) {
            const policy = new Policy(policyData);
            policyData['failure-details'].forEach(detail => policy.addDetail(new FailureDetails(detail)));
            report.addPolicy(policy);
        }
        const JSONString = JSON.stringify(report);
        const Buffer = require('buffer').Buffer;
        req.Database.emit('tlsrpt', Buffer.from(JSONString).toString('base64'));
    })

module.exports = router;