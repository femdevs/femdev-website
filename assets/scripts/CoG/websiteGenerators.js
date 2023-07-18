//@ts-nocheck
// Disclamer Function for usage in special windows
/**
 * 
 * @param {string?} disclamer 
 */
function disclamer(disclamer = null) {
    if (disclamer == null || typeof disclamer !== "string") return;
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
            console.error(TypeError("Disclaimer Type isn't valid"))
            return;
    }
    const disclamerPrompt = confirm(
        `WARNING!
By opening this window type, you understand the fact that this may happen:
${reason}
To continue, press OK. Otherwise, press cancel`
    )
    return disclamerPrompt;
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
    const {style: bodyareastyle} = nw.document.body
    // Writes Styleing Function
    const writeStyles = () => {
        const buttonElement = nw.document.createElement('button')
        buttonElement.innerText = "Press This Button To Close The Window"
        bodyareastyle.fontFamily = 'monospace, Comic Sans MS, cursive, sans-serif, serif'
        buttonElement.style.background = 'linear-gradient(45deg,red,blue)'
        buttonElement.style.border = '0px solid transparent'
        buttonElement.style.borderRadius = '16px'
        buttonElement.style.padding = '16px'
        buttonElement.style.margin = '8px'
        buttonElement.style.position = 'fixed'
        buttonElement.style.left = `50%`
        buttonElement.style.top = '50%'
        buttonElement.style.transform = 'translate(-50%,-50%)'
        buttonElement.style.fontFamily = 'initial'
        buttonElement.onclick = function() {nw.close()}
        nw.document.body.insertAdjacentElement('afterbegin', buttonElement)
        const cStyle = nw.document.createElement('style')
        cStyle.innerHTML = `html {
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
}`
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
            const baw = () => {
                if (nw.document.body.style.backgroundColor == 'black') {
                    nw.document.body.style.backgroundColor = 'white'
                    nw.document.body.style.color = 'black'
                    return;
                }
                nw.document.body.style.backgroundColor = 'black'
                nw.document.body.style.color = 'white'
            }
            nw.document.onmousemove = baw
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
                nw.document.getElementById('counter')
                    .innerText = `Counter = ${counter}`;
            }
            break;
        case 3:
            // 3 -> Random Number
            const randnum = () => Math.round(Math.random() * Math.pow(10, 6))
            p.innerText = `Your Number is: ${randnum()}`
            nw.document.body.insertAdjacentElement('beforeend', p)
            break;
        case 4:
            // 4 -> Random Name
            const randname = function () {
                let name = ''
                const letters = Math.floor(
                    Math.random() * 5
                ) + 3;
                for (let i = 0; i < letters; i++) {
                    const lettergen = (
                        Math.floor(
                            Math.random() * 22
                        ) + 10
                    ).toString(32);
                    name += lettergen;
                }
                return name;
            }
            p.innerText = `Your name is: ${randname()}`
            nw.document.body.insertAdjacentElement('beforeend', p)
            break;
        case 5:
            // 5 -> Random Color
            const hgen = () => `#${Math.floor(Math.random() * Math.pow(16, 6)).toString(16)}`
            const thex = hgen();
            p.innerText = `Your color is ${thex}`;
            nw.document.body.style.background = thex;
            nw.document.body.insertAdjacentElement('beforeend', p)
            break;
        case 6:
            // 6 -> Blank
            const fillerEle = nw.document.createElement('p')
            fillerEle.innerText = "&#8203;"
            nw.document.body.insertAdjacentElement('afterbegin', fillerEle)
            break;
        default:
            throw new RangeError('Bad Version, but in the switch case statement');
    }
    // Writes The Styles
    writeStyles()
}