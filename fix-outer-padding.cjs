const fs = require('fs');
const path = require('path');

function processDirectory(dir) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            processDirectory(fullPath);
        } else if (fullPath.endsWith('.tsx')) {
            processFile(fullPath);
        }
    }
}

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf-8');
    let changed = false;

    // Look for AppLayout followed by a div with p-4
    // We want to remove the padding from the container that wraps the banner.
    // The banner usually starts with `<div className="relative overflow-hidden bg-gradient-to-r`

    // Let's replace `p-4 md:p-8 ` or `p-4 sm:p-8 ` or `p-4 sm:p-8 space-y-6` if it's the main wrapper.
    
    // specifically target: <div className="p-4 md:p-8 ... bg-transparent"> or similar
    // It's safer to just do string replacement for the known bad wrapper classes in those specific files.
    
    const badClasses = [
        'className="p-4 md:p-8 min-h-screen',
        'className="p-4 md:p-8 bg-transparent min-h-screen',
        'className="p-4 sm:p-8 min-h-screen',
        'className="p-4 sm:p-8 bg-transparent min-h-screen',
    ];

    for (const badClass of badClasses) {
        if (content.includes(badClass)) {
            content = content.replace(badClass, badClass.replace(/p-4 (md|sm):p-8\s*/, ''));
            changed = true;
        }
    }

    if (changed) {
        fs.writeFileSync(filePath, content, 'utf-8');
        console.log('Fixed outer padding in:', filePath);
    }
}

processDirectory(path.join(__dirname, 'resources', 'js', 'pages'));
console.log('Done fixing outer padding!');
