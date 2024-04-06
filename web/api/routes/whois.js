const router = require('express').Router();
const dns = require('dns');
const whois = require('whoiser');

class WhoisContact {
    constructor(data) {
        const safeSetter = (k, inp, d = 'Unknown') => this[k] = (inp[k]) ? inp[k] : d;
        const keys = ['name', 'organization', 'street', 'city', 'state', 'postalCode', 'country', 'phone', 'fax', 'email'];
        keys.forEach(k => safeSetter(k, data));
    }
}

class WhoisData {
    constructor(data) {
        const safeSetter = (k, inp, d = 'Unknown') => this[k] = (inp[k]) ? inp[k] : d;
        const keys = ['domainName', 'registrar', 'creationDate', 'expirationDate', 'updatedDate'];
        keys.forEach(k => safeSetter(k, data));
        this.registrant = new WhoisContact(data.registrant);
        this.admin = new WhoisContact(data.admin);
        this.tech = new WhoisContact(data.tech);
        this.billing = new WhoisContact(data.billing);
        this.status = [];
        const statusMap = new Map()
            .set('clienthold', 'Client Hold')
            .set('serverhold', 'Server Hold')
            .set('clientrenewprohibited', 'Client Renew Prohibited')
            .set('serverrenewprohibited', 'Server Renew Prohibited')
            .set('clientupdateprohibited', 'Client Update Prohibited')
            .set('serverupdateprohibited', 'Server Update Prohibited')
            .set('clientdeleteprohibited', 'Client Delete Prohibited')
            .set('serverdeleteprohibited', 'Server Delete Prohibited')
            .set('clienttransferprohibited', 'Client Transfer Prohibited')
            .set('servertransferprohibited', 'Server Transfer Prohibited')
        Array.from(data.status).forEach((s) => this.status.push(statusMap.get(s.split(' ')[0].toLowerCase()) || `Unknown Declaration: ${s}`));
    }
}

class Domain {
    constructor(baseDomain) {
        const tempDomain = new URL(`https://${baseDomain}/`).hostname.split('.');
        if (tempDomain.length < 2) throw 'Invalid domain';
        const tempCoreDomain = tempDomain.slice(-2);
        if (tempCoreDomain.some(v => v.length < 2)) throw 'Invalid domain';
        this.baseDomain = tempCoreDomain.join('.');
        this.requestedDomain = baseDomain;
        this.subdomain = this.baseDomain !== this.requestedDomain;
    }
}

class DNS {
    constructor() {
        this.A = ""
        this.AAAA = ""
        this.CAA = []
        this.CNAME = ""
        this.MX = []
        this.NS = []
        this.PTR = []
        this.SOA = {}
        this.SRV = []
        this.TXT = []
    }
    newRecord(type, data) {
        switch (type) {
            case 'A': return this.A = data;
            case 'AAAA': return this.AAAA = data;
            case 'CAA': return this.CAA.push(data);
            case 'CNAME': return this.CNAME = data;
            case 'MX': return this.MX.push(data);
            case 'NS': return this.NS.push(data);
            case 'PTR': return this.PTR.push(data);
            case 'SOA': return this.SOA = data;
            case 'SRV': return this.SRV.push(data);
            case 'TXT': return this.TXT.push(data);
            default: return;
        }
    }
}

router
    .get('/dns', async (req, res) => {
        if (!(await req.checkPermissions(req, res, { multi: true, perm: ['Whois::DNS', 'Whois::Full'], allowMgr: true }))) return;
        const reqDomain = req.headers['x-domain'];
        if (!reqDomain) return res.sendError(8);
        const domain = await new Promise((g, b) => { try { g(new Domain(reqDomain)); } catch (e) { b(e); } }).catch(_ => res.sendError(9));
        if (res.headersSent) return;
        const Resolver = new dns.Resolver();
        Resolver.setServers(['1.1.1.1', '1.0.0.1', '8.8.8.8', '8.8.4.4'])
        const recordTypes = ['A', 'AAAA', 'CAA', 'CNAME', 'MX', 'NS', 'PTR', 'SOA', 'SRV', 'TXT'];
        const DNSdata = new DNS();
        const DNSCallback = (d) => {
            const [err, res, rt] = d;
            let data = res;
            if (err) return
            switch (rt) {
                case 'TXT':
                    data = res.map(([txt]) => txt);
                    break;
                case 'SOA': return DNSdata.newRecord('SOA', res);
            }
            if (data) data.forEach(d => DNSdata.newRecord(rt, d));
        }
        await new Promise((g, b) => {
            Promise
                .all(
                    recordTypes.map(rt => new Promise((ok, _fail) => {
                        try {
                            Resolver.resolve(domain.requestedDomain, rt, (err, res) => ok([err, res, rt]));
                        } catch (e) {
                            ok([e, null, rt]);
                        }
                    }))
                )
                .then(data => data.forEach((d) => DNSCallback(d)), b)
                .finally(() => g());
        })
        res.status(200).json(DNSdata);
    })
    .get('/whois', async (req, res) => {
        if (!(await req.checkPermissions(req, res, { multi: true, perm: ['Whois::Whois', 'Whois::Full'], allowMgr: true }))) return;
        const reqDomain = req.headers['x-domain'];
        if (!reqDomain) return res.sendError(8);
        const domain = await new Promise((g, b) => { try { g(new Domain(reqDomain)); } catch (e) { b(e); } }).catch(_ => res.sendError(9));
        if (res.headersSent) return;
        const whoisData = await whois(domain.baseDomain);
        Object.entries(whoisData).forEach(([_, mv]) => (typeof mv === 'object' && !Array.isArray(mv)) ? Object.entries(mv).forEach(([k, v]) => whoisData[k] = v) : null);
        const getUserData = (s) => Object.fromEntries(['Name', 'Organization', 'Street', 'City', 'State/Province', 'Postal Code', 'Country', 'Phone', 'Fax', 'Email'].map(k => [k.toLowerCase(), whoisData[`${s} ${k}`]]));
        res.status(200).json(new WhoisData({
            registrant: getUserData('Registrant'),
            admin: getUserData('Admin'),
            tech: getUserData('Tech'),
            billing: getUserData('Billing'),
            domainName: whoisData["Domain Name"],
            registrar: whoisData["Registrar"],
            creationDate: whoisData["Creation Date"],
            expirationDate: whoisData["Expiry Date"],
            updatedDate: whoisData["Updated Date"],
            status: whoisData["Domain Status"],
        }));
    })
    .get('/full', async (req, res) => {
        if (!(await req.checkPermissions(req, res, { multi: false, perm: 'Whois::Full', allowMgr: true }))) return;
        const reqDomain = req.headers['x-domain'];
        if (!reqDomain) return res.sendError(8);
        const domain = await new Promise((g, b) => { try { g(new Domain(reqDomain)); } catch (e) { b(e); } }).catch(_ => res.sendError(9));
        if (res.headersSent) return;
        const Resolver = new dns.Resolver();
        Resolver.setServers(['1.1.1.1', '1.0.0.1', '8.8.8.8', '8.8.4.4'])
        const recordTypes = ['A', 'AAAA', 'CAA', 'CNAME', 'MX', 'NS', 'PTR', 'SOA', 'SRV', 'TXT'];
        const DNSdata = new DNS();
        const DNSCallback = (d) => {
            const [err, res, rt] = d;
            let data = res;
            if (err) return
            switch (rt) {
                case 'TXT':
                    data = res.map(([txt]) => txt);
                    break;
                case 'SOA': return DNSdata.newRecord('SOA', res);
            }
            if (data) data.forEach(d => DNSdata.newRecord(rt, d));
        }
        await new Promise((g, b) => {
            Promise
                .all(
                    recordTypes.map(rt => new Promise((ok, _fail) => {
                        try {
                            Resolver.resolve(domain.requestedDomain, rt, (err, res) => ok([err, res, rt]));
                        } catch (e) {
                            ok([e, null, rt]);
                        }
                    }))
                )
                .then(data => data.forEach((d) => DNSCallback(d)), b)
                .finally(() => g());
        })
        const whoisData = await whois(domain.baseDomain);
        Object.entries(whoisData).forEach(([_, mv]) => (typeof mv === 'object' && !Array.isArray(mv)) ? Object.entries(mv).forEach(([k, v]) => whoisData[k] = v) : null);
        const getUserData = (s) => Object.fromEntries(['Name', 'Organization', 'Street', 'City', 'State/Province', 'Postal Code', 'Country', 'Phone', 'Fax', 'Email'].map(k => [k.toLowerCase(), whoisData[`${s} ${k}`]]));
        res.status(200).json({
            whois: new WhoisData(
                {
                    registrant: getUserData('Registrant'),
                    admin: getUserData('Admin'),
                    tech: getUserData('Tech'),
                    billing: getUserData('Billing'),
                    domainName: whoisData["Domain Name"],
                    registrar: whoisData["Registrar"],
                    creationDate: whoisData["Creation Date"],
                    expirationDate: whoisData["Expiry Date"],
                    updatedDate: whoisData["Updated Date"],
                    status: whoisData["Domain Status"],
                }
            ),
            dns: Object.fromEntries(
                Array
                    .from(Object.entries(DNSdata))
                    .sort(([x, _x], [y, _y]) => Intl.Collator({ language: 'en_us' }).compare(x, y))
            )
        });
    })

module.exports = router;