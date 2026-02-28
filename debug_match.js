const fs = require('fs');
try {
    const indexContent = fs.readFileSync('public/index.html', 'utf8');
    const headerMatch = indexContent.match(/<header class="site-header">[\s\S]*?<\/header>/);
    const footerMatch = indexContent.match(/<footer class="site-footer">[\s\S]*?<\/footer>/);
    const out = `Header length: ${headerMatch ? headerMatch[0].length : 'null'}\nFooter length: ${footerMatch ? footerMatch[0].length : 'null'}`;
    fs.writeFileSync('debug_output.txt', out);
} catch (e) {
    fs.writeFileSync('debug_output.txt', e.toString());
}
