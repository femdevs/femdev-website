class Page {
    constructor() {
        this.evm = new Map();
        this.evm.set("context", true)
        this.evm.set("devTools", true)
    }
}