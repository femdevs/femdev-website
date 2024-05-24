const router = require('express').Router();
const dns = require('dns');
const whois = require('whoiser');

class WhoisContact {
	constructor(data) {
		const safeSetter = (k, inp, def = 'Unknown') => this[k] = (inp[k]) ? inp[k] : def;
		const keys = ['name', 'organization', 'street', 'city', 'state', 'postalCode', 'country', 'phone', 'fax', 'email'];
		keys.forEach(k => safeSetter(k, data));
	}
}

class WhoisData {
	constructor(data) {
		const safeSetter = (k, inp, def = 'Unknown') => this[k] = (inp[k]) ? inp[k] : def;
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
			.set('servertransferprohibited', 'Server Transfer Prohibited');
		Array.from(data.status)
			.forEach(status => this.status.push(statusMap.get(status.split(' ')[0].toLowerCase()) || `Unknown Declaration: ${status}`));
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
		// eslint-disable-next-line id-length
		this.A = "";
		this.AAAA = "";
		this.CAA = [];
		this.CNAME = "";
		this.MX = [];
		this.NS = [];
		this.PTR = [];
		this.SOA = {};
		this.SRV = [];
		this.TXT = [];
	}
	newRecord(type, data) {
		switch (type) {
			// eslint-disable-next-line id-length
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
		const domain =
			await new Promise((ok, fail) => { try { ok(new Domain(reqDomain)); } catch (err) { fail(err); } }).catch(_ => res.sendError(9));
		if (res.headersSent) return;
		const Resolver = new dns.Resolver();
		Resolver.setServers(['1.1.1.1', '1.0.0.1', '8.8.8.8', '8.8.4.4']);
		const recordTypes = ['A', 'AAAA', 'CAA', 'CNAME', 'MX', 'NS', 'PTR', 'SOA', 'SRV', 'TXT'];
		const DNSdata = new DNS();
		const DNSCallback = dat => {
			const [err, res, rt] = dat;
			let data = res;
			if (err) return;
			switch (rt) {
				case 'TXT':
					data = res.map(([txt]) => txt);
					break;
				case 'SOA': return DNSdata.newRecord('SOA', res);
			}
			if (data) data.forEach(intData => DNSdata.newRecord(rt, intData));
		};
		await new Promise((ok, fail) => {
			Promise
				.all(
					recordTypes.map(rt => new Promise((ok, _fail) => {
						try {
							Resolver.resolve(domain.requestedDomain, rt, (err, res) => ok([err, res, rt]));
						} catch (err) {
							ok([err, null, rt]);
						}
					})),
				)
				.then(data => data.forEach(intData => DNSCallback(intData)), fail)
				.finally(() => ok());
		});
		const filteredCAAList = [];
		DNSdata.CAA
			.forEach(
				v => (
					!filteredCAAList.includes(v.issue || v.issuewild)
					&& (v.issue || v.issuewild)
				)
					? filteredCAAList.push(v.issue || v.issuewild)
					: null,
			);
		DNSdata.CAA = filteredCAAList.map(k => {
			const CAARecords = DNSdata.CAA.filter(v => k === (v.issue || v.issuewild));
			return { issuer: k, wild: CAARecords.some(v => Boolean(v.issuewild)), main: CAARecords.some(v => Boolean(v.issue)) };
		}).concat([{ iodef: DNSdata.CAA.find(v => Boolean(v.iodef)).iodef }]).filter(v => v !== null);
		res.status(200).json(
			Object.fromEntries(Array.from(
				Object.entries(DNSdata)).sort(([val1, _], [val2, __]) => Intl.Collator({ language: 'en_us' }).compare(val1, val2),
				)),
		);
	})
	.get('/whois', async (req, res) => {
		if (!(await req.checkPermissions(req, res, { multi: true, perm: ['Whois::Whois', 'Whois::Full'], allowMgr: true }))) return;
		const reqDomain = req.headers['x-domain'];
		if (!reqDomain) return res.sendError(8);
		const domain =
			await new Promise((ok, fail) => { try { ok(new Domain(reqDomain)); } catch (err) { fail(err); } }).catch(_ => res.sendError(9));
		if (res.headersSent) return;
		const whoisData = await whois(domain.baseDomain);
		Object.entries(whoisData)
			.forEach(([_, mv]) => (typeof mv === 'object' && !Array.isArray(mv)) ? Object.entries(mv).forEach(([k, v]) => whoisData[k] = v) : null);
		const getUserData = sect =>
			Object.fromEntries([
				'Name',
				'Organization',
				'Street',
				'City',
				'State/Province',
				'Postal Code',
				'Country',
				'Phone',
				'Fax',
				'Email',
			]
				.map(k => [k.toLowerCase(), whoisData[`${sect} ${k}`]]),
			);
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
		const domain =
			await new Promise((ok, fail) => { try { ok(new Domain(reqDomain)); } catch (err) { fail(err); } }).catch(_ => res.sendError(9));
		if (res.headersSent) return;
		const Resolver = new dns.Resolver();
		Resolver.setServers(['1.1.1.1', '1.0.0.1', '8.8.8.8', '8.8.4.4']);
		const recordTypes = ['A', 'AAAA', 'CAA', 'CNAME', 'MX', 'NS', 'PTR', 'SOA', 'SRV', 'TXT'];
		const DNSdata = new DNS();
		const DNSCallback = dat => {
			const [err, res, rt] = dat;
			let data = res;
			if (err) return;
			switch (rt) {
				case 'TXT':
					data = res.map(([txt]) => txt);
					break;
				case 'SOA': return DNSdata.newRecord('SOA', res);
			}
			if (data) data.forEach(intData => DNSdata.newRecord(rt, intData));
		};
		await new Promise((ok, fail) => {
			Promise
				.all(
					recordTypes.map(rt => new Promise((ok, _fail) => {
						try {
							Resolver.resolve(domain.requestedDomain, rt, (err, res) => ok([err, res, rt]));
						} catch (err) {
							ok([err, null, rt]);
						}
					})),
				)
				.then(data => data.forEach(intData => DNSCallback(intData)), fail)
				.finally(() => ok());
		});
		const whoisData = await whois(domain.baseDomain);
		Object.entries(whoisData)
			.forEach(([_, mv]) => (typeof mv === 'object' && !Array.isArray(mv)) ? Object.entries(mv).forEach(([k, v]) => whoisData[k] = v) : null);
		const getUserData = sect =>
			Object.fromEntries([
				'Name',
				'Organization',
				'Street',
				'City',
				'State/Province',
				'Postal Code',
				'Country',
				'Phone',
				'Fax',
				'Email',
			]
				.map(k => [k.toLowerCase(), whoisData[`${sect} ${k}`]]),
			);
		const filteredCAAList = [];
		DNSdata.CAA
			.forEach(
				v => (
					!filteredCAAList.includes(v.issue || v.issuewild)
					&& (v.issue || v.issuewild)
				)
					? filteredCAAList.push(v.issue || v.issuewild)
					: null,
			);
		DNSdata.CAA = filteredCAAList.map(k => {
			const CAARecords = DNSdata.CAA.filter(v => k === (v.issue || v.issuewild));
			return { issuer: k, wild: CAARecords.some(v => Boolean(v.issuewild)), main: CAARecords.some(v => Boolean(v.issue)) };
		}).concat([{ iodef: DNSdata.CAA.find(v => Boolean(v.iodef)).iodef }]).filter(v => v !== null);
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
				},
			),
			dns: Object.fromEntries(Array.from(
				Object.entries(DNSdata)).sort(([val1, _], [val2, __]) => Intl.Collator({ language: 'en_us' }).compare(val1, val2),
				)),
		});
	});

module.exports = router;
