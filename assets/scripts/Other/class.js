// Notice: Requires converter.js and morsecode.js to work due to the functions being in there

// Classes
class ConvertedText {
    constructor(string) {
        this.raw = string
        this.morse = stmc(string)
        this.binary = stbi(string)
        this.hex = sth(string)
        this.base32 = stb32(string)
    }
}