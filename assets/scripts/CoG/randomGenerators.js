/**
* @copyright GNU GENERAL PUBLIC LICENSE (v3)
*/

class RandomGenerators {
    static ranNum(m=10) {
        if (m < 1) throw new RangeError('max must be at least 1');
        return Math.round(Math.random() * m);
    }

    static bRanNum(a=1,m=10) {
        if (a <= 1) throw new RangeError("Both number and max must be greater than 1");
        return new Array(a).map(() => this.ranNum(m))
    }
    
    static randHex(p='') {
        const { floor: f, random: r } = Math
        return `${p}${f(r()* (16**6)).toString(16)}`
    }
    
    static bRandHex(a=1,p='') {
        if (a <= 1) throw new RangeError('amount must be greater than one');
        return new Array(a).map(() => this.randHex(p))
    }
    
    static customNumberGenerator(m=0,u=100) {
        if ([u,m].some(v => v <= 0)) throw new RangeError("Both min and max need to be above 0");
        if (m >= u) throw new RangeError("min must be less than max");
        if (u > 100_000) throw new RangeError(`max must be less than 100,000`);
        return Math.round(Math.random()*Number(u) - Number(m)) + Number(m)
    }
}