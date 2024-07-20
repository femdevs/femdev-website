const xml = require('xml');
const yaml = require('yaml');

class Phone {
    constructor(data) {
        this.status = data.status || 'error';
        this.phone = data.phone || '';
        this.phoneValid = data.phone_valid || false;
        this.phoneType = data.phone_type || '';
        this.phoneRegion = data.phone_region || '';
        this.country = data.country || '';
        this.countryCode = data.country_code || '';
        this.countryPrefix = data.country_prefix || '';
        this.internationalNumber = data.international_number || '';
        this.localNumber = data.local_number || '';
        this.e164 = data.e164 || '';
        this.carrier = data.carrier || '';
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
        return xml({
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
