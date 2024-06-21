import { LoadData as load } from "https://cdn.thefemdevs.com/assets/js/o/spotify";

await load('nezha', '1109887155720945664');

setInterval(async () => await load('nezha', '1109887155720945664'), 1e3);

const startCharCode = 32; // Start with ASCII code 32 (space)
const endCharCode = 126; // End with ASCII code 126 (tilde)

function getRandomAsciiCharacter() {
    const randomCharCode = Math.floor(Math.random() * (endCharCode - startCharCode + 1)) + startCharCode;
    return String.fromCharCode(randomCharCode);
}

function updateAsciiElements() {
    const elements = document.querySelectorAll('span.ScrollingASCII');

    elements.forEach(element => {
        let newText = '';
        for (let i = 0; i < element.textContent.length; i++) {
            newText += getRandomAsciiCharacter();
        }
        element.textContent = newText;
    });
}
// Change character every 100 milliseconds
setInterval(updateAsciiElements, 5);