/* eslint-disable id-length */
const xml = require('xml');
const yaml = require('yaml');

class Contact {
    constructor(data) {
        this.name = data.name || 'Unknown';
        this.organization = data.organization || 'Unknown';
        this.street = data.street || 'Unknown';
        this.city = data.city || 'Unknown';
        this.state = data.state || 'Unknown';
        this.postalCode = data.postalCode || 'Unknown';
        this.country = data.country || 'Unknown';
        this.phone = data.phone || 'Unknown';
        this.fax = data.fax || 'Unknown';
        this.email = data.email || 'Unknown';
    }
    get JSON() {
        return {
            name: this.name,
            organization: this.organization,
            street: this.street,
            city: this.city,
            state: this.state,
            postalCode: this.postalCode,
            country: this.country,
            phone: this.phone,
            fax: this.fax,
            email: this.email,
        };
    }
    get XML() {
        return [
            { name: this.name },
            { organization: this.organization },
            { street: this.street },
            { city: this.city },
            { state: this.state },
            { postalCode: this.postalCode },
            { country: this.country },
            { phone: this.phone },
            { fax: this.fax },
            { email: this.email },
        ];
    }
}



class DNS {
    constructor(data) {
        this.SOA = data.SOA || {};
        this.A = data.A || '';
        this.CAA = data.CAA || [];
        this.CNAME = data.CNAME || '';
        this.SRV = data.SRV || [];
        this.AAAA = data.AAAA || '';
        this.PTR = data.PTR || [];
        this.TXT = data.TXT || [];
        this.NS = data.NS || [];
        this.MX = data.MX || [];
    }
    get JSON() {
        return {
            SOA: this.SOA,
            A: this.A,
            CAA: this.CAA,
            CNAME: this.CNAME,
            SRV: this.SRV,
            AAAA: this.AAAA,
            PTR: this.PTR,
            TXT: this.TXT,
            NS: this.NS,
            MX: this.MX,
        };
    }
    get XML() {
        return xml(this.XMLData);
    }
    get XMLData() {
        return [
            {
                SOA: [
                    { nsname: this.SOA.nsname },
                    { serial: this.SOA.serial },
                    { expire: this.SOA.expire },
                    { minttl: this.SOA.minttl },
                    { retry: this.SOA.retry },
                    { refresh: this.SOA.refresh },
                    { hostmaster: this.SOA.hostmaster },
                ],
            },
            { A: this.A },
            {
                CAA: this.CAA.map(rec => (
                    rec.iodef
                        ? { iodef: rec.iodef }
                        : { main: rec.main, wild: rec.wild, issuer: rec.issuer }
                )),
            },
            { CNAME: this.CNAME },
            { SRV: this.SRV.map(rec => ({ record: rec })) },
            { AAAA: this.AAAA },
            { PTR: this.PTR.map(rec => ({ record: rec })) },
            { TXT: this.TXT.map(rec => ({ record: rec })) },
            { NS: this.NS.map(rec => ({ record: rec })) },
            { MX: this.MX.map(rec => ({ priority: rec.priority, exchange: rec.exchange })) },
        ];
    }
    get YAML() {
        return yaml.stringify(this.JSON);
    }
}

class WHOIS {
    constructor(data) {
        this.expirationDate = data.expirationDate || 'Unknown';
        this.billing = new Contact(data.billing);
        this.registrar = data.registrar || 'Unknown';
        this.admin = new Contact(data.admin);
        this.domainName = data.domainName || 'Unknown';
        this.creationDate = data.creationDate || 'Unknown';
        this.tech = new Contact(data.tech);
        this.updatedDate = data.updatedDate || 'Unknown';
        this.registrant = new Contact(data.registrant);
        this.status = data.status || [];
    }
    get JSON() {
        return {
            expirationDate: this.expirationDate,
            billing: this.billing.JSON,
            registrar: this.registrar,
            admin: this.admin.JSON,
            domainName: this.domainName,
            creationDate: this.creationDate,
            tech: this.tech.JSON,
            updatedDate: this.updatedDate,
            registrant: this.registrant.JSON,
            status: this.status,
        };
    }
    get XML() {
        return xml(this.XMLData);
    }
    get XMLData() {
        return [
            { expirationDate: this.expirationDate },
            { billing: this.billing.XML },
            { registrar: this.registrar },
            { admin: this.admin.XML },
            { domainName: this.domainName },
            { creationDate: this.creationDate },
            { tech: this.tech.XML },
            { updatedDate: this.updatedDate },
            { registrant: this.registrant.XML },
            { status: this.status },
        ];
    }
    get YAML() {
        return yaml.stringify(this.JSON);
    }
}

class Full {
    constructor(data) {
        this.WHOIS = new WHOIS(data.whois);
        this.DNS = new DNS(data.dns);
    }
    get JSON() {
        return {
            whois: this.WHOIS.JSON,
            dns: this.DNS.JSON,
        };
    }
    get XML() {
        return xml({
            full: [
                { whois: this.WHOIS.XMLData },
                { dns: this.DNS.XMLData },
            ],
        });
    }
    get YAML() { }
}

class Crypto {
    static DNS = DNS;
    static WHOIS = WHOIS;
    static Full = Full;
}

module.exports = Crypto;
