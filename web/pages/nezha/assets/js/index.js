import { LoadData as load } from "https://cdn.thefemdevs.com/assets/js/o/spotify";

document.addEventListener(
    'DOMContentLoaded', // Only triggers once the page is fully loaded - prevents errors
    async () => {
        await load('nezha', '1109887155720945664');
        setInterval(async () => await load('nezha', '1109887155720945664'), 1e3);
        const getRandChar = () => {
            const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?~ ';
            return chars[Math.floor(Math.random() * chars.length)];
        };
        setInterval((function () {
            const elements = Array.from(document.querySelectorAll('span.ScrollingASCII'));
            for (const element of elements) {
                let newText = '', index = 0;
                while (index < element.textContent.length) {
                    newText += getRandChar();
                    index++;
                }
                element.textContent = newText;
            }
        }), 67);
    },
);
