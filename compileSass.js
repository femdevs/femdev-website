const sass = require('sass');
const fs = require('fs');

const getAllSassFiles = (directory = '.') => {
    const matchingFiles = [];
    const files = fs.readdirSync(directory, 'utf8');
    for (const file of files) {
        const fullFilePath = `${directory}/${file}`;
        if (file === 'node_modules' || file === '.git') continue;
        if (fs.lstatSync(fullFilePath).isDirectory()) matchingFiles.push(...getAllSassFiles(fullFilePath));
        if (file.endsWith('.scss') || file.endsWith('.sass')) matchingFiles.push(fullFilePath);
    }
    return matchingFiles;
};

const files = getAllSassFiles();

for (const file of files) {
    const result = sass.compile(file);
    fs.writeFileSync(file.replace(/(\.sass)|(\.scss)/gmi, '.css'), result.css);
}
