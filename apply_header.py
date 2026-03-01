import os
import re

public_dir = r"e:\antiG\ecampus-school-website\public"
index_file = os.path.join(public_dir, 'index.html')

with open(index_file, 'r', encoding='utf-8') as f:
    index_content = f.read()

start_marker = '<!-- Classic Site Header -->'
end_marker = '<script src="assets/js/classic-header.js"></script>'

start_idx = index_content.find(start_marker)
end_idx = index_content.find(end_marker) + len(end_marker)

classic_header_html = index_content[start_idx:end_idx]

updated_count = 0

for root, dirs, files in os.walk(public_dir):
    if 'assets' in dirs:
        dirs.remove('assets')
    if 'components' in dirs:
        dirs.remove('components')
    
    for file in files:
        if file.endswith('.html') and file != 'index.html':
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
                
            original_content = content
            
            # Remove modern-header CSS link if any
            content = re.sub(r'<link\s+rel="stylesheet"\s+href="assets/css/premium-header\.css">', '', content)
            
            # Find and replace old header
            # Find <header id="global-header">...
            content = re.sub(r'<header[^>]*id="(?:global-header|classic-header)"[^>]*>.*?</header>', classic_header_html, content, flags=re.DOTALL)
            content = re.sub(r'<header\s+class="site-header[^>]*>.*?</header>', classic_header_html, content, flags=re.DOTALL)
            content = re.sub(r'<div w3-include-html="components/classic-header\.html"></div>', classic_header_html, content, flags=re.DOTALL)

            if content != original_content:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f"Updated {file}")
                updated_count += 1

print(f"Total updated: {updated_count}")
