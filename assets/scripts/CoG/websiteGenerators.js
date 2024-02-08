//@ts-nocheck
// Disclamer Function for usage in special windows
/** @param {string?} disclamer */
function disclamer(disclamer) {
    if (typeof disclamer !== "string") return;
    let reason;
    switch (disclamer) {
        case "ep":
            reason = "Epileptic Triggers including flashing lights"
            break;
        case "lag":
            reason = "Lag-causing function calls"
            break;
        case "bug":
            reason = "Buggy code and/or Beta pages"
            break;
        default:
            throw new TypeError("Disclaimer Type isn't valid");
    }
    return confirm([
        'Warning!',
        `By opening this window type, you understand the fact that this may happen:`,
        reason,
        `To continue, press OK. Otherwise, press cancel`
    ].join('\n'));
}

/**
* @copyright GNU GENERAL PUBLIC LICENSE (v3)
*/

/**
 * @description This function Generates a window using a required "version" value and an optional "width" and "height" value
 * @param {number | string} version The window "version"
 * @param {number | 300} width The width of the window
 * @param {number | 300} height The height of the window
 * @author sparty182020
 */
async function genwin(version, width, height) {
    const varnum = 6
    version = Math.floor(Number(version))
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
        6: [150, 150]
    }
    if (width < mindem[version][0] || height < mindem[version][1]) throw new RangeError("Dimensions value is invalid");
    const nw = window.open('about:blank', '', `height:500,width:500`)
    nw.resizeTo(width, height)
    const { style: bodyareastyle } = nw.document.body
    // Writes Styleing Function
    const writeStyles = () => {
        const buttonElement = nw.document.createElement('button')
        buttonElement.innerText = "Press This Button To Close The Window"
        bodyareastyle.fontFamily = 'monospace, Comic Sans MS, cursive, sans-serif, serif'
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
            fontFamily: 'initial'
        })
        buttonElement.onclick = function () { nw.close() }
        nw.document.body.insertAdjacentElement('afterbegin', buttonElement)
        const cStyle = nw.document.createElement('style')
        cStyle.innerHTML = `html {\n\toverflow: hidden;\n}\n\nbody > * {\n\t-webkit-touch-callout: none;\n\t-webkit-user-select: none;\n\t-khtml-user-select: none;\n\t-moz-user-select: none;\n\t-ms-user-select: none;\n\tuser-select: none;\n\tfont-size: 32px;\n\tfont-weight: bolder;\n}\n\nbutton {\n\tbackground: linear-gradient(45deg, red, blue);\n\tborder: 0px solid transparent;\n\tborder-radius: 16px;\n\tpadding: 16px;\n\tmargin: 8px;\n\tposition: fixed;\n\tleft: 50%;\n\ttop: 50%;\n\ttransform: translate(-50%, -50%);\n\tfont-family: initial;\n\tfont-size: 12px;\n}`
        nw.document.getElementsByTagName('head')[0].insertAdjacentElement('beforeend', cStyle)
    }
    const p = nw.document.createElement('p')
    // Finds the website version from list
    switch (version) {
        case 1:
            if (!disclamer('ep')) return;
            // 1 -> mouseMove Black and White Background Switch
            p.innerText = "Move Your Mouse"
            nw.document.body.insertAdjacentElement('beforeend', p)
            nw.document.onmousemove = () => Object.assign(nw.document.body.style, (nw.document.body.style.backgroundColor == 'black') ? {backgroundColor: 'white',color: 'black'} : {backgroundColor: 'black',color: 'white'})
            break
        case 2:
            // 2 -> Click Counter
            p.innerText = "Counter = 0"
            p.id = "counter";
            nw.document.body.insertAdjacentElement('beforeend', p)
            let i = 0
            const incr = () => i++
            nw.document.onclick = _ => {
                const counter = incr()
                nw.document.getElementById('counter').innerText = `Counter = ${counter}`;
            }
            break;
        case 3:
            // 3 -> Random Number
            const { floor: f, random: r } = Math
            p.innerText = `Your Number is: ${(() => f(r() * 100_000))()}`
            nw.document.body.insertAdjacentElement('beforeend', p)
            break;
        case 4:
            // 4 -> Random Name
            const randname = function () {
                const { floor: f, random: r } = Math
                return new Array(f(r() * 5) + 3).map(() => (f(r() * 22) + 10).toString(32)).join('');
            }
            p.innerText = `Your name is: ${randname()}`
            nw.document.body.insertAdjacentElement('beforeend', p)
            break;
        case 5:
            // 5 -> Random Color
            const thex = (() => `#${Math.floor(Math.random() * (16**6)).toString(16)}`)();
            p.innerText = `Your color is ${thex}`;
            nw.document.body.style.background = thex;
            nw.document.body.insertAdjacentElement('beforeend', p)
            break;
        case 6:
            // 6 -> Blank
            const fillerEle = nw.document.createElement('p')
            fillerEle.innerText = String.fromCharCode(0x200b)
            nw.document.body.insertAdjacentElement('afterbegin', fillerEle)
            break;
        default:
            throw new RangeError('Bad Version, but in the switch case statement');
    }
    // Writes The Styles
    writeStyles()
}