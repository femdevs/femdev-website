class Response {
    constructor(type) {
        this.type = type;
        this.data = [];
    }
    add(obj) {
        this.data.push(obj.XML);
        return this;
    }
    get XML() {
        return {
            res: [
                {
                    header: [
                        new SimpleObj('Created', new Date().toISOString()).XML,
                        new SimpleObj('Type', this.type).XML,
                    ],
                },
                {
                    data: this.data,
                },
            ],
        };
    }
}

class Obj {
    constructor(type, key, value) {
        this.type = type;
        this.key = key;
        this.value = value;
    }
}

class ExtendedObj extends Obj {
    constructor(key) {
        super('extended', key, []);
    }
    add(obj) {
        this.value.push(obj.XML);
        return this;
    }
    get XML() {
        return {
            object: [
                { _attr: { type: 'extended' } },
                { key: this.key },
                { value: this.value },
            ],
        };
    }
}

class SimpleObj extends Obj {
    constructor(key, value) {
        super('simple', key, value);
    }
    get XML() {
        return {
            object: {
                _attr: {
                    type: 'simple',
                    key: this.key,
                    value: this.value,
                },
            },
        };
    }
}

module.exports = { Response, Obj, ExtendedObj, SimpleObj };
