const xml = require('xml');
const yaml = require('yaml');

class Quote {
    constructor(data) {
        this.quotes = data.quote;
        this.author = data.author;
        this.tags = data.tags;
    }
    get JSON() {
        return JSON.stringify({
            quotes: this.quotes,
            author: this.author,
            tags: this.tags,
        });
    }
    get XML() {
        return xml({
            quotes: this.quotes,
            author: this.author,
            tags: this.tags,
        });
    }
    get YAML() {
        return yaml.stringify({
            quotes: this.quotes,
            author: this.author,
            tags: this.tags,
        });
    }
}

module.exports = Quote;
