//@ts-nocheck
/**
* @copyright GNU GENERAL PUBLIC LICENSE (v3)
*/

class Converters {
	static stbi= val => val.split('').map(char => String(char).charCodeAt(0).toString(2)).join(' ');
	static bits= val => val.split(' ').map(char => String.fromCharCode(parseInt(char, 2).toString(10))).join('');
	static sth= val => val.split('').map(char => String(char).charCodeAt(0).toString(16)).join(' ');
	static hts= val => val.split(' ').map(char => String.fromCharCode(parseInt(char, 16).toString(10))).join('');
	static stb32= val => val.split('').map(char => String(char).charCodeAt(0).toString(32)).join(' ');
	static b32ts= val => val.split(' ').map(char => String.fromCharCode(parseInt(char, 32).toString(10))).join('');
}
