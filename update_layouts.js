const fs = require('fs');
const path = require('path');

try {
    const publicDir = path.join(__dirname, 'public');
    const indexContent = fs.readFileSync(path.join(publicDir, 'index.html'), 'utf8');

    const headerMatch = indexContent.match(/<header class="site-header">[\s\S]*?<\/header>/);
    let footerMatch = indexContent.match(/<!-- Global Footer -->\s*<footer class="site-footer">[\s\S]*?<\/footer>/);
    if (!footerMatch) footerMatch = indexContent.match(/<footer class="site-footer">[\s\S]*?<\/footer>/);

    if (!headerMatch) throw new Error("Could not find header in index.html");
    if (!footerMatch) throw new Error("Could not find footer in index.html");

    const globalHeader = headerMatch[0];
    const globalFooter = footerMatch[0];

    // These files get both header and footer updated
    const filesToUpdate = [
        '404.html', 'about.html', 'academics.html', 'admissions.html', 'alumni.html',
        'calendar.html', 'careers.html', 'contact.html', 'facilities.html', 'faq.html',
        'gallery.html', 'notices.html', 'privacy.html', 'results.html', 'student-life.html',
        'terms.html', 'login.html'
    ];

    for (const file of filesToUpdate) {
        const filePath = path.join(publicDir, file);
        if (!fs.existsSync(filePath)) {
            console.log(`Skipping ${file}`);
            continue;
        }

        let content = fs.readFileSync(filePath, 'utf8');
        let changed = false;

        // update header except for login.html because it has a specialized transparent header
        if (file !== 'login.html') {
            const currentHeaderMatch = content.match(/<header class="site-header"[^>]*>[\s\S]*?<\/header>/);
            if (currentHeaderMatch && currentHeaderMatch[0] !== globalHeader) {
                content = content.replace(/<header class="site-header"[^>]*>[\s\S]*?<\/header>/, globalHeader);
                changed = true;
            }
        }

        // update footer (even for login.html if it had one, but login html doesn't have a footer, we just let it be if it does)
        const currentFooterMatch = content.match(/<footer class="site-footer"[^>]*>[\s\S]*?<\/footer>/);
        if (currentFooterMatch && currentFooterMatch[0] !== globalFooter) {
            content = content.replace(/(?:<!-- Global Footer -->\s*)?<footer class="site-footer"[^>]*>[\s\S]*?<\/footer>/, globalFooter);
            changed = true;
        }

        // update javascripts
        if (content.includes('assets/js/main.js')) {
            content = content.replace(/<script src="assets\/js\/main\.js"><\/script>/, '<script src="assets/js/animations.js"></script>\n    <script src="assets/js/data.js"></script>');
            changed = true;
        }

        if (changed) {
            fs.writeFileSync(filePath, content);
            console.log(`Updated ${file}`);
        } else {
            console.log(`No changes for ${file}`);
        }
    }
} catch (e) {
    console.error("Error occurred:");
    console.error(e);
    process.exit(1);
}
