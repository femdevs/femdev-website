//@ts-nocheck
/**
* @copyright GNU GENERAL PUBLIC LICENSE (v3)
*/

class Converters {
    static stbi = (x) => x.split('').map(c => String(c).charCodeAt(0).toString(2)).join(' ')
    static bits = (x) => x.split(' ').map(c => String.fromCharCode(parseInt(c, 2).toString(10))).join('')
    static sth = (x) => x.split('').map(c => String(c).charCodeAt(0).toString(16)).join(' ')
    static hts = (x) => x.split(' ').map(c => String.fromCharCode(parseInt(c, 16).toString(10))).join('')
    static stb32 = (x) => x.split('').map(c => String(c).charCodeAt(0).toString(32)).join(' ')
    static b32ts = (x) => x.split(' ').map(c => String.fromCharCode(parseInt(c, 32).toString(10))).join('')
}