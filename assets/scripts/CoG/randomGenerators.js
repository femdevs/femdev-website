/**
* @copyright GNU GENERAL PUBLIC LICENSE (v3)
*/

class RandomGenerators {
	static ranNum(max = 10) {
		if (max < 1) throw new RangeError('max must be at least 1');
		return Math.round(Math.random() * max);
	}

	static bRanNum(amount = 1, max = 10) {
		if (amount <= 1) throw new RangeError("Both number and max must be greater than 1");
		return new Array(amount).map(() => this.ranNum(max));
	}

	static randHex(prefix = '') {
		return `${prefix}${Math.floor(Math.random() * (16 ** 6)).toString(16)}`;
	}

	static bRandHex(amount = 1, prefix = '') {
		if (amount <= 1) throw new RangeError('amount must be greater than one');
		return new Array(amount).map(() => this.randHex(prefix));
	}

	static customNumberGenerator(min = 0, max = 100) {
		if ([min, max].some(v => v <= 0)) throw new RangeError("Both min and max need to be above 0");
		if (min >= max) throw new RangeError("min must be less than max");
		if (max > 100_000) throw new RangeError(`max must be less than 100,000`);
		return Math.round(Math.random() * Number(max) - Number(min)) + Number(min);
	}
}
