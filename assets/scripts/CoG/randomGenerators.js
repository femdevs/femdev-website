/**
* @copyright GNU GENERAL PUBLIC LICENSE (v3)
*/

class RandomGenerators {
    static ranNum(max=10) {
        if (max < 1) throw new RangeError('max must be at least 1');
        return Math.round(Math.random() * max);
    }

    static bRanNum(amount=1,max=10) {
        if (amount <= 1) throw new RangeError("Both number and max must be greater than 1");
        let bnum = "s"
        for (let i = 0; i < amount; i++) bnum += `.${this.ranNum(max)}`;
        return bnum.split('s.').join('').split('.')
    }
    
    static randHex(prefix='') {
        return `${prefix}${Math.floor(Math.random()*Math.pow(16,6)).toString(16)}`
    }
    
    static bRandHex(amount=1,prefix='') {
        if (amount <= 1) throw new RangeError('amount must be greater than one');
        let hexRaw = 's'
        for (let i = 0; i < amount; i++) hexRaw += `.${this.randHex(prefix)}`;
        return hexRaw.split('s.').join('').split('.')
    }
    
    static customNumberGenerator(min=0,max=100) {
        if (max <= 0 || min <= 0) throw new RangeError("Both min and max need to be above 0");
        if (!(min < max)) throw new RangeError("min must be less than max");
        if (max > Math.pow(10,6)) throw new RangeError(`max must be less than ${Math.pow(10,6)}`);
        const fmax = Number(max) - Number(min)
        return Math.round(Math.random()*fmax) + Number(min)
    }
}