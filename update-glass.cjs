const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'resources', 'js', 'pages');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

let modifiedCount = 0;

walkDir(pagesDir, function(filePath) {
    if (filePath.endsWith('.tsx') && !filePath.includes('Welcome.tsx')) {
        let content = fs.readFileSync(filePath, 'utf8');
        let originalContent = content;

        // Replace Card background
        content = content.replace(/<Card className="([^"]*)bg-white([^"]*)"/g, '<Card className="$1glass-card$2"');
        
        // Replace Table backgrounds
        content = content.replace(/bg-white/g, 'glass-card');
        content = content.replace(/bg-gray-50/g, 'bg-white/5');
        content = content.replace(/bg-slate-50/g, 'bg-white/5');
        content = content.replace(/bg-slate-100/g, 'bg-white/10');
        content = content.replace(/bg-zinc-50/g, 'bg-white/5');
        content = content.replace(/bg-zinc-100/g, 'bg-white/10');
        
        // Fix up double glass-card if it happened
        content = content.replace(/glass-card\s+glass-card/g, 'glass-card');
        
        // For dark mode specific classes like dark:bg-zinc-950 or dark:bg-zinc-900, we should probably remove them or make them transparent
        content = content.replace(/dark:bg-zinc-950/g, 'dark:bg-black/20');
        content = content.replace(/dark:bg-zinc-900/g, 'dark:bg-black/20');
        content = content.replace(/dark:bg-zinc-800/g, 'dark:bg-black/40');
        content = content.replace(/dark:bg-gray-800/g, 'dark:bg-black/40');
        content = content.replace(/dark:bg-gray-900/g, 'dark:bg-black/20');
        
        if (content !== originalContent) {
            fs.writeFileSync(filePath, content, 'utf8');
            modifiedCount++;
        }
    }
});

console.log(`Modified ${modifiedCount} files.`);
