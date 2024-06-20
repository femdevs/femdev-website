import load from 'https://cdn.thefemdevs.com/assets/js/o/spotify';

await load('alex', '1112774630416076850');

setInterval(async () => await load('alex', '1112774630416076850'), 1e3);