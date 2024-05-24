//@ts-nocheck
/**
 * This function Generates a window using a required "version" value and an optional "width" and "height" value
 * @param {number | string} version The window "version"
 * @param {number | 300} width The width of the window
 * @param {number | 300} height The height of the window
 * @author sparty182020
 */
async function genwin(version, width, height) {
	const varnum = 6;
	version = Math.floor(Number(version));
	// Checks if the version is correct
	if (version <= 0 || version > varnum) throw new RangeError(`Bad Version\n\n Version must be between 0 and ${varnum}`);
	if (isNaN(width)) width = 300;
	if (isNaN(height)) height = 300;
	var mindem = {
		1: [250, 250],
		2: [300, 100],
		3: [300, 100],
		4: [300, 100],
		5: [300, 100],
		6: [150, 150],
	};
	if (width < mindem[version][0] || height < mindem[version][1]) throw new RangeError("Dimensions value is invalid");
	const nw = window.open('about:blank', '', `height:500,width:500`);
	nw.resizeTo(width, height);
	const { style: bodyareastyle } = nw.document.body;
	// Writes Styleing Function
	const writeStyles = () => {
		const buttonElement = nw.document.createElement('button');
		buttonElement.innerText = "Press This Button To Close The Window";
		bodyareastyle.fontFamily = 'monospace, Comic Sans MS, cursive, sans-serif, serif';
		Object.assign(buttonElement.style, {
			background: 'linear-gradient(45deg,red,blue)',
			border: '0px solid transparent',
			borderRadius: '16px',
			padding: '16px',
			margin: '8px',
			position: 'fixed',
			left: '50%',
			top: '50%',
			transform: 'translate(-50%,-50%)',
			fontFamily: 'initial',
		});
		buttonElement.onclick = function () { nw.close(); };
		nw.document.body.insertAdjacentElement('afterbegin', buttonElement);
		const cStyle = nw.document.createElement('style');
		cStyle.innerHTML = `
html {
	overflow: hidden;
}

body > * {
	-webkit-touch-callout: none;
	-webkit-user-select: none;
	-khtml-user-select: none;
	-moz-user-select: none;
	-ms-user-select: none;
	user-select: none;
	font-size: 32px;
	font-weight: bolder;
}

button {
	background: linear-gradient(45deg, red, blue);
	border: 0px solid transparent;
	border-radius: 16px;
	padding: 16px;
	margin: 8px;
	position: fixed;
	left: 50%;
	top: 50%;
	transform: translate(-50%, -50%);
	font-family: initial;
	font-size: 12px;
}`;
		nw.document.getElementsByTagName('head')[0].insertAdjacentElement('beforeend', cStyle);
	};
	const paragraph = nw.document.createElement('p');
	// Finds the website version from list
	switch (version) {
		case 1:
			// 1 -> mouseMove Black and White Background Switch
			paragraph.innerText = "Move Your Mouse";
			nw.document.body.insertAdjacentElement('beforeend', paragraph);
			nw.document.onmousemove = () => Object.assign(
				nw.document.body.style,
				(nw.document.body.style.backgroundColor === 'black')
					? { backgroundColor: 'white', color: 'black' }
					: { backgroundColor: 'black', color: 'white' });
			break;
		case 2:
			// 2 -> Click Counter
			paragraph.innerText = "Counter = 0";
			paragraph.id = "counter";
			nw.document.body.insertAdjacentElement('beforeend', paragraph);
			let index = 0;
			const incr = () => index++;
			nw.document.onclick = _ => {
				const counter = incr();
				nw.document.getElementById('counter').innerText = `Counter = ${counter}`;
			};
			break;
		case 3:
			// 3 -> Random Number
			paragraph.innerText = `Your Number is: ${(() => Math.floor(Math.random() * 1e6))()}`;
			nw.document.body.insertAdjacentElement('beforeend', paragraph);
			break;
		case 4:
			// 4 -> Random Name
			const randname = () => new Array(Math.floor(Math.random() * 5) + 3)
				.map(() => (Math.floor(Math.random() * 22) + 10).toString(32)).join('');
			paragraph.innerText = `Your name is: ${randname()}`;
			nw.document.body.insertAdjacentElement('beforeend', paragraph);
			break;
		case 5:
			// 5 -> Random Color
			const thex = (() => `#${Math.floor(Math.random() * (16 ** 6)).toString(16)}`)();
			paragraph.innerText = `Your color is ${thex}`;
			nw.document.body.style.background = thex;
			nw.document.body.insertAdjacentElement('beforeend', paragraph);
			break;
		case 6:
			// 6 -> Blank
			const fillerEle = nw.document.createElement('p');
			fillerEle.innerText = String.fromCharCode(0x200b);
			nw.document.body.insertAdjacentElement('afterbegin', fillerEle);
			break;
		default:
			throw new RangeError('Bad Version, but in the switch case statement');
	}
	// Writes The Styles
	writeStyles();
}
