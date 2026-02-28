$files = @(
    "404.html", "alumni.html", "calendar.html", 
    "careers.html", "facilities.html", "faq.html", 
    "privacy.html", "student-life.html", "terms.html", "login.html"
)

$indexPath = "public\index.html"
if (!(Test-Path $indexPath)) {
    Write-Host "index.html not found!"
    exit 1
}

$indexContent = Get-Content -Raw -Path $indexPath

# Extract the new footer from index.html
$footerMatch = [regex]::Match($indexContent, '(?s)<footer class="site-footer">.*?</footer>')
if ($footerMatch.Success) {
    $newFooter = $footerMatch.Value
} else {
    Write-Host "Could not find new footer in index.html"
    exit 1
}

foreach ($file in $files) {
    $filePath = "public\$file"
    if (Test-Path $filePath) {
        $content = Get-Content -Raw -Path $filePath
        $originalLength = $content.Length
        
        # Replace Footer
        $content = [regex]::Replace($content, '(?s)(?:<!-- Footer -->\s*)?<footer class="site-footer">.*?</footer>', $newFooter)
        
        # Replace Scripts
        $content = [regex]::Replace($content, '<script src="assets/js/main\.js"></script>', '<script src="assets/js/animations.js"></script>')
        
        Set-Content -Path $filePath -Value $content
        Write-Host "Updated $file (Original: $originalLength, New: $($content.Length))"
    } else {
        Write-Host "Skipping $file, not found."
    }
}
