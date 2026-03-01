const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');

// Extract the header from index.html (the single source of truth crafted earlier)
const indexHtmlPaths = path.join(publicDir, 'index.html');
const indexHtmlContent = fs.readFileSync(indexHtmlPaths, 'utf8');

const headerStartStr = '<!-- Classic Site Header -->';
const headerEndStr = '<script src="assets/js/classic-header.js"></script>';
const startIndex = indexHtmlContent.indexOf(headerStartStr);
const endIndex = indexHtmlContent.indexOf(headerEndStr) + headerEndStr.length;

if (startIndex === -1 || endIndex === -1) {
    console.error("Could not find classic header snippet inside index.html");
    process.exit(1);
}

const classicHeaderBlock = indexHtmlContent.substring(startIndex, endIndex);

let updatedFiles = 0;

function processDirectory(directory) {
    const files = fs.readdirSync(directory);

    files.forEach(file => {
        const fullPath = path.join(directory, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            if (file !== 'assets' && file !== 'components') {
                processDirectory(fullPath);
            }
        } else if (file.endsWith('.html') && file !== 'index.html') { // Skip index as it already has it
            let content = fs.readFileSync(fullPath, 'utf8');
            let originalContent = content;

            // Strategy 1: Replace raw w3-include-html wrapper if injected previously
            content = content.replace(/<div w3-include-html="components\/classic-header\.html"><\/div>/g, classicHeaderBlock);

            // Strategy 2: Remove old new premium CSS links if present
            content = content.replace(/<link\s+rel="stylesheet"\s+href="assets\/css\/premium-header\.css">/g, '');

            // Strategy 3: Find existing header tags
            const headerRegex = /<header\s+[^>]*id="(?:global-header|classic-header)"[^>]*>[\s\S]*?<\/header>/i;
            const anotherRegex = /<header\s+class="site-header"[^>]*>[\s\S]*?<\/header>/i;

            if (headerRegex.test(content)) {
                content = content.replace(headerRegex, classicHeaderBlock);
            } else if (anotherRegex.test(content)) {
                content = content.replace(anotherRegex, classicHeaderBlock);
            }

            if (content !== originalContent) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log(`Updated header tightly mapped in -> ${file}`);
                updatedFiles++;
            }
        }
    });
}

processDirectory(publicDir);
console.log(`\nSuccessfully applied Classic Header universally across ${updatedFiles} files!`);
