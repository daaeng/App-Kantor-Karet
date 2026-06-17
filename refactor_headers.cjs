const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'resources', 'js', 'pages');

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf-8');
    let original = content;

    // 1. Replace the top hero banner wrappers
    const topRegex = /<div className="relative overflow-hidden glass-panel border-0 border-b border-white\/40 dark:border-white\/10 pb-\d+ pt-12 rounded-none shadow-none">\s*<div className="absolute inset-0 bg-\[url\('\/img\/grid-pattern\.svg'\)\] opacity-10"><\/div>\s*<div className="relative z-10 px-6 w-full max-w-7xl mx-auto">/g;
    content = content.replace(topRegex, '<div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">');

    // 2. Replace the flex container to add border-b
    const flexRegex = /<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">/g;
    content = content.replace(flexRegex, '<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-slate-200 dark:border-zinc-800">');

    // 3. Replace the icon container
    const iconRegex = /<div className="p-3 glass-card\/20 rounded-xl backdrop-blur-md hidden sm:block">/g;
    content = content.replace(iconRegex, '<div className="p-3 bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-slate-200 dark:border-zinc-800 hidden sm:block">');

    // 4. Replace the bottom closing tags and Floating Content Area
    const bottomRegex = /<\/div>\s*<\/div>\s*\{\/\* Floating Content Area \*\/\}\s*<div className="px-6 w-full max-w-7xl mx-auto -mt-20 relative z-20 pb-24">/g;
    content = content.replace(bottomRegex, '');

    // 5. Some files might just have `</div>\n</div>\n<div className="px-6 w-full max-w-7xl mx-auto -mt-20 relative z-20 pb-24">` without the comment
    const bottomRegex2 = /<\/div>\s*<\/div>\s*<div className="px-6 w-full max-w-7xl mx-auto -mt-20 relative z-20 pb-\d+">/g;
    content = content.replace(bottomRegex2, '');

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf-8');
        console.log('Updated:', filePath);
    }
}

function walkDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walkDir(fullPath);
        } else if (fullPath.endsWith('.tsx')) {
            processFile(fullPath);
        }
    }
}

walkDir(pagesDir);
console.log('Done');
