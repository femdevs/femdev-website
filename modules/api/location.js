const xml = require('xml');
const yaml = require('yaml');
const Base = require('./base');

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
        this.plusCode = data.pluscode || '';
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
        const res = new Base.Response('Location');
        res
            .add(new Base.ExtendedObj('address')
                .add(new Base.SimpleObj('full', this.address.full))
                .add(new Base.SimpleObj('houseNumber', this.address.houseNumber))
                .add(new Base.SimpleObj('street', this.address.street))
                .add(new Base.SimpleObj('city', this.address.city))
                .add(new Base.SimpleObj('region', this.address.region))
                .add(new Base.SimpleObj('country', this.address.country))
                .add(new Base.SimpleObj('postalCode', this.address.postalCode)),
            )
            .add(new Base.SimpleObj('plusCode', this.plusCode))
            .add(new Base.ExtendedObj('coords')
                .add(new Base.SimpleObj('lat', this.coords.lat))
                .add(new Base.SimpleObj('lng', this.coords.lng)),
            );
        return xml(res.XML);
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
