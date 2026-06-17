const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
    fs.readdir(dir, function(err, list) {
        if (err) return callback(err);
        let pending = list.length;
        if (!pending) return callback(null);
        list.forEach(function(file) {
            file = path.resolve(dir, file);
            fs.stat(file, function(err, stat) {
                if (stat && stat.isDirectory()) {
                    walk(file, function(err) {
                        if (!--pending) callback(null);
                    });
                } else {
                    if (file.endsWith('.tsx')) {
                        processFile(file);
                    }
                    if (!--pending) callback(null);
                }
            });
        });
    });
}

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    // 1. Replace background gradients for the banner
    // Matches: bg-gradient-to-r from-[color]-[num] to-[color]-[num]
    const gradientRegex = /bg-gradient-to-r from-[a-z]+-\d+ to-[a-z]+-\d+/g;
    if (gradientRegex.test(content)) {
        content = content.replace(gradientRegex, 'bg-gradient-to-r from-blue-700 to-indigo-800');
        changed = true;
    }

    // 2. Replace subtitle text color in banner
    // Often it's `text-emerald-100`, `text-teal-100`, `text-indigo-100` etc. inside the banner.
    // Let's be careful not to replace text colors outside the banner, but since it's just `text-*-100 mt-1`, it's usually the subtitle.
    const subtitleRegex = /className="text-[a-z]+-100 mt-1"/g;
    if (subtitleRegex.test(content)) {
        content = content.replace(subtitleRegex, 'className="text-blue-100 mt-1"');
        changed = true;
    }
    
    // Also `text-[color]-100/90` or similar
    const subtitleRegex2 = /className="text-[a-z]+-100\/[0-9]+ mt-1/g;
    if (subtitleRegex2.test(content)) {
        content = content.replace(subtitleRegex2, 'className="text-blue-100/90 mt-1');
        changed = true;
    }

    // 3. Optional: standardizing the wrapper div if it's not present. We'll skip that for now to avoid breaking JSX.

    if (changed) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated theme in: ${path.relative(process.cwd(), filePath)}`);
    }
}

const pagesDir = path.join(__dirname, 'resources', 'js', 'pages');
walk(pagesDir, (err) => {
    if (err) console.error(err);
    else console.log('Done replacing gradients!');
});
