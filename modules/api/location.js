const xml = require('xml');
const yaml = require('yaml');

class Location {
    constructor(data) {
        this.address = {
            full: data.address.full || '',
            houseNumber: data.address.houseNumber || '',
            street: data.address.street || '',
            city: data.address.city || '',
            region: data.address.region || '',
            country: data.address.country || '',
            postalCode: data.address.postalCode || '',
        };
        this.pluscode = data.pluscode || '';
        this.coords = {
            lat: data.coords.lat || 0,
            lng: data.coords.lng || 0,
        };
    }
    get JSON() {
        return JSON.stringify({
            address: this.address,
            pluscode: this.pluscode,
            coords: this.coords,
        });
    }
    get XML() {
        return xml({
            address: [
                { full: this.address.full },
                { houseNumber: this.address.houseNumber },
                { street: this.address.street },
                { city: this.address.city },
                { region: this.address.region },
                { country: this.address.country },
                { postalCode: this.address.postalCode },
            ],
            pluscode: this.pluscode,
            coords: this.coords,
        });
    }
    get YAML() {
        return yaml.stringify({
            address: this.address,
            pluscode: this.pluscode,
            coords: this.coords,
        });
    }
}

module.exports = Location;
