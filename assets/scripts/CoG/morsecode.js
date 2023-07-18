/**
* @copyright GNU GENERAL PUBLIC LICENSE (v3)
*/

// Morse Code Dictionary
const stmca = {
    a: ".-",
    b: "-...",
    c: "-.-.",
    d: "-..",
    e: ".",
    f: "..-.",
    g: "--.",
    h: "....",
    i: "..",
    j: ".---",
    k: "-.-",
    l: ".-..",
    m: "--",
    n: "-.",
    o: "---",
    p: ".--.",
    q: "--.-",
    r: ".-.",
    s: "...",
    t: "-",
    u: "..-",
    v: "...-",
    w: ".--",
    x: "-..-",
    y: "-.--",
    z: "--..",
    specials: {
        space: "/",
        period: ".-.-.-",
        comma: "--..--",
        dash: "-..-.",
        slash: "-....-",
        apostrophe: ".----.",
        qmark: "..--..",
        emark: "-.-.--",
        quote: ".-..-.",
        colon: "---...",
        equal: "-...-",
        add: ".-.-.",
        oper: "-.--.",
        cper: "-.--.-",
        ampersand: ".-...",
        at: ".--.-"
    },
    numbers: {
        zero: "-----",
        one: ".----",
        two: "..---",
        three: "...--",
        four: "....-",
        five: ".....",
        six: "-....",
        seven: "--...",
        eight: "---..",
        nine: "----.",
    }
}

// String to Morse Code
/**
 * 
 * @param {String} string 
 * @returns {String}
 */
function stmc(string) {
    let output = ''
    const splitstr = string
        .toLowerCase()
        .split('')
        .map(
            (char) => {
                switch (char) {
                    case "0":
                        char = stmca.numbers.zero
                        break;
                    case "1":
                        char = stmca.numbers.one
                        break;
                    case "2":
                        char = stmca.numbers.two
                        break;
                    case "3":
                        char = stmca.numbers.three
                        break;
                    case "4":
                        char = stmca.numbers.four
                        break;
                    case "5":
                        char = stmca.numbers.five
                        break;
                    case "6":
                        char = stmca.numbers.six
                        break;
                    case "7":
                        char = stmca.numbers.seven
                        break;
                    case "8":
                        char = stmca.numbers.eight
                        break;
                    case "9":
                        char = stmca.numbers.nine
                        break;
                    case " ":
                        char = stmca.specials.space
                        break;
                    case ".":
                        char = stmca.specials.period
                        break;
                    case ",":
                        char = stmca.specials.comma
                        break;
                    case "-":
                        char = stmca.specials.dash
                        break;
                    case "/":
                        char = stmca.specials.slash
                        break;
                    case "'":
                        char = stmca.specials.apostrophe
                        break;
                    case "?":
                        char = stmca.specials.qmark
                        break;
                    case "!":
                        char = stmca.specials.emark
                        break;
                    case "\"":
                        char = stmca.specials.quote
                        break;
                    case ":":
                        char = stmca.specials.colon
                        break;
                    case "=":
                        char = stmca.specials.equal
                        break;
                    case "+":
                        char = stmca.specials.add
                        break;
                    case "(":
                        char = stmca.specials.oper
                        break;
                    case ")":
                        char = stmca.specials.cper
                        break;
                    case "&":
                        char = stmca.specials.ampersand
                        break;
                    case "@":
                        char = stmca.specials.at
                        break;
                    case "a":
                        char = stmca.a
                        break;
                    case "b":
                        char = stmca.b
                        break;
                    case "c":
                        char = stmca.c
                        break;
                    case "d":
                        char = stmca.d
                        break;
                    case "e":
                        char = stmca.e
                        break;
                    case "f":
                        char = stmca.f
                        break;
                    case "g":
                        char = stmca.g
                        break;
                    case "h":
                        char = stmca.h
                        break;
                    case "i":
                        char = stmca.i
                        break;
                    case "j":
                        char = stmca.j
                        break;
                    case "k":
                        char = stmca.k
                        break;
                    case "l":
                        char = stmca.l
                        break;
                    case "m":
                        char = stmca.m
                        break;
                    case "n":
                        char = stmca.n
                        break;
                    case "o":
                        char = stmca.o
                        break;
                    case "p":
                        char = stmca.p
                        break;
                    case "q":
                        char = stmca.q
                        break;
                    case "r":
                        char = stmca.r
                        break;
                    case "s":
                        char = stmca.s
                        break;
                    case "t":
                        char = stmca.t
                        break;
                    case "u":
                        char = stmca.u
                        break;
                    case "v":
                        char = stmca.v
                        break;
                    case "w":
                        char = stmca.w
                        break;
                    case "x":
                        char = stmca.x
                        break;
                    case "y":
                        char = stmca.y
                        break;
                    case "z":
                        char = stmca.z
                        break;
                }
                return char
            }
        )
        .join(' ')
    return splitstr
}