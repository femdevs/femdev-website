//@ts-nocheck
/**
* @copyright GNU GENERAL PUBLIC LICENSE (v3)
*/

// String to binary
/**
 * @param {string} string
 */
function stbi(string) {
    return string.split('').map(char => String(char).charCodeAt(0).toString(2)).join(' ')
}

// Binary to string
function bits(binary) {
    return binary.split(' ').map(char => String.fromCharCode(parseInt(char, 2).toString(10))).join('')
}

// String to hex
function sth(string) {
    return string.split('').map(char => String(char).charCodeAt(0).toString(16)).join(' ')
}

// Hex to string
function hts(hex) {
    return hex.split(' ').map(char => String.fromCharCode(parseInt(char, 16).toString(10))).join('')
}

// String to Base32
function stb32(string) {
    return string.split('').map(char => String(char).charCodeAt(0).toString(32)).join(' ')
}

// Base32 to string
function b32ts(b32) {
    return b32.split(' ').map(char => String.fromCharCode(parseInt(char, 32).toString(10))).join('')
}