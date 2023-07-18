//@ts-nocheck
class Counter {
    constructor() {
        this.ti = 0;
        this.ci = 0;
    }
    addMouseHit() {
        document.getElementById("click_counter").innerHTML = this.ci++;
    }
    addKeyHit() {
        document.getElementById("type_counter").innerHTML = this.ti++;
    }
}

const x = new Counter();

function load() {
    //Full Text Area
    document.onkeypress = function () {
        x.addKeyHit();
    };
    //Full Click Area
    document.onclick = function () {
        x.addMouseHit();
    };
}