const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'public');
const targetText = '123 Education Boulevard, Knowledge City, 10001';
const replacementText = 'Sector 62, Knowledge Park III, Noida, Uttar Pradesh 201301, India';

// Also capture multi-line variations
const targetRegex1 = /123 Education Boulevard,\s*Knowledge City,\s*10001/gs;
const targetRegex2 = /123 Education Boulevard,<br>\s*Knowledge City, 10001/gs;

function replaceInFile(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let initialContent = content;

        content = content.replace(targetRegex1, replacementText);
        content = content.replace(targetRegex2, replacementText);
        content = content.replace(/123 Education Boulevard/g, 'Sector 62, Knowledge Park III');
        content = content.replace(/Knowledge City, 10001/g, 'Noida, Uttar Pradesh 201301, India');

        // Let's also handle "123 Education Boulevard" independently just in case
        if (content !== initialContent) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`Updated: ${path.basename(filePath)}`);
        }
    } catch (err) {
        console.error(`Error reading/writing ${filePath}:`, err);
    }
}

function processDirectory(dir) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDirectory(fullPath);
        } else if (fullPath.endsWith('.html')) {
            replaceInFile(fullPath);
        }
    }
}

console.log('Starting address replacement...');
processDirectory(directoryPath);
processDirectory(path.join(__dirname, 'components')) || true; // Just in case
console.log('Replacement complete.');
