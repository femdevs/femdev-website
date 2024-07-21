const xml = require('xml');
const yaml = require('yaml');
const Base = require('./base');

class Phone {
    constructor(data) {
        this.status = data.status ?? 'error';
        this.phone = data.phone ?? '';
        this.phoneValid = data.phone_valid ?? false;
        this.phoneType = data.phone_type ?? '';
        this.phoneRegion = data.phone_region ?? '';
        this.country = data.country ?? '';
        this.countryCode = data.country_code ?? '';
        this.countryPrefix = data.country_prefix ?? '';
        this.internationalNumber = data.international_number ?? '';
        this.localNumber = data.local_number ?? '';
        this.e164 = data.e164 ?? '';
        this.carrier = data.carrier ?? '';
    }
    get JSON() {
        return JSON.stringify({
            status: this.status,
            phone: this.phone,
            phoneValid: this.phoneValid,
            phoneType: this.phoneType,
            phoneRegion: this.phoneRegion,
            country: this.country,
            countryCode: this.countryCode,
            countryPrefix: this.countryPrefix,
            internationalNumber: this.internationalNumber,
            localNumber: this.localNumber,
            e164: this.e164,
            carrier: this.carrier,
        });
    }
    get XML() {
        const res = new Base.Response('Phone');
        res
            .add(new Base.SimpleObj('status', this.status))
            .add(new Base.SimpleObj('phone', this.phone))
            .add(new Base.SimpleObj('phoneValid', this.phoneValid))
            .add(new Base.SimpleObj('phoneType', this.phoneType))
            .add(new Base.SimpleObj('phoneRegion', this.phoneRegion))
            .add(new Base.SimpleObj('country', this.country))
            .add(new Base.SimpleObj('countryCode', this.countryCode))
            .add(new Base.SimpleObj('countryPrefix', this.countryPrefix))
            .add(new Base.SimpleObj('internationalNumber', this.internationalNumber))
            .add(new Base.SimpleObj('localNumber', this.localNumber))
            .add(new Base.SimpleObj('e164', this.e164))
            .add(new Base.SimpleObj('carrier', this.carrier));
        return xml(res.XML);
    }
    get YAML() {
        return yaml.stringify({
            status: this.status,
            phone: this.phone,
            phoneValid: this.phoneValid,
            phoneType: this.phoneType,
            phoneRegion: this.phoneRegion,
            country: this.country,
            countryCode: this.countryCode,
            countryPrefix: this.countryPrefix,
            internationalNumber: this.internationalNumber,
            localNumber: this.localNumber,
            e164: this.e164,
            carrier: this.carrier,
        });
    }
}

module.exports = Phone;
