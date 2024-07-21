const xml = require('xml');
const yaml = require('yaml');
const Base = require('./base');

class Quote {
    constructor(data) {
        this.quote = data.quote;
        this.author = data.author;
        this.tags = data.tags;
    }
    get JSON() {
        return JSON.stringify({
            quote: this.quote,
            author: this.author,
            tags: this.tags,
        });
    }
    get XML() {
        const res = new Base.Response('Quote');
        res
            .add(new Base.SimpleObj('quote', this.quote))
            .add(new Base.SimpleObj('author', this.author))
            .add(new Base.SimpleObj('tags', this.tags.join(', ')));
        return xml(res.XML);
    }
    get YAML() {
        return yaml.stringify({
            quote: this.quote,
            author: this.author,
            tags: this.tags,
        });
    }
}

module.exports = Quote;
