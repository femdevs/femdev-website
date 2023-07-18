// About Me animation
let i = 0;
const speed = 50;
const text = 'About Me'

function animation() {
    const element = document.getElementById('aboutme')
    if (i < text.length) {
        if (text[i-1] == ' ') {
            const ct = element.innerText
            const nt = ct + " " + text[i]
            element.innerText = nt
            i++
            setTimeout(animation, speed);
        } else {
            const ct = element.innerText
            const nt = ct + text[i]
            element.innerText = nt
            i++;
            setTimeout(animation, speed);
        }
    }
}

animation()