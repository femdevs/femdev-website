import { LoadData as load } from "https://cdn.thefemdevs.com/assets/js/o/spotify";
const { random, floor } = Math;

document.addEventListener(
    'DOMContentLoaded', // Only triggers once the page is fully loaded - prevents errors
    async () => {
        await load('nezha', '1109887155720945664');
        setInterval(async () => await load('nezha', '1109887155720945664'), 1e3);
        const charCodes = {
            start: 32, // Start: 32 (space)
            end: 126, // End: 126 (tilde)
            rand() { return floor(random() * (this.start - this.end + 1)) + this.start; },
        };
        setInterval((function () {
            const elements = Array.from(document.querySelectorAll('span.ScrollingASCII'));
            for (const element of elements) {
                let newText = '', index = 0;
                while (index < element.textContent.length) {
                    newText += String.fromCharCode(charCodes.rand());
                    index++;
                }
                element.textContent = newText;
            }
        }), 1e2);
    },
);
