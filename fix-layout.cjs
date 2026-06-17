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

const colorMap = {
    'Pegawai': { bg: 'from-emerald-600 to-teal-800', text: 'text-emerald-100' },
    'Attendance': { bg: 'from-rose-600 to-pink-800', text: 'text-rose-100' },
    'UserManagements': { bg: 'from-indigo-600 to-violet-800', text: 'text-indigo-100' },
    'Roles': { bg: 'from-indigo-600 to-violet-800', text: 'text-indigo-100' },
    'Customers': { bg: 'from-fuchsia-600 to-pink-800', text: 'text-fuchsia-100' },
    'Kasbons': { bg: 'from-violet-600 to-purple-800', text: 'text-violet-100' },
    'Payroll': { bg: 'from-teal-600 to-emerald-800', text: 'text-teal-100' },
    'Inciseds': { bg: 'from-amber-600 to-orange-800', text: 'text-amber-100' },
    'Incisors': { bg: 'from-amber-600 to-orange-800', text: 'text-amber-100' },
    'Inventories': { bg: 'from-cyan-600 to-blue-800', text: 'text-cyan-100' },
    'Products': { bg: 'from-orange-600 to-red-800', text: 'text-orange-100' },
    'Administrasis': { bg: 'from-sky-600 to-blue-800', text: 'text-sky-100' },
    'Dashboard': { bg: 'from-blue-700 to-indigo-800', text: 'text-blue-100' },
    'RealEstate': { bg: 'from-blue-700 to-indigo-800', text: 'text-blue-100' },
    'Notas': { bg: 'from-slate-600 to-gray-800', text: 'text-slate-100' },
    'Pemberkasan': { bg: 'from-stone-600 to-neutral-800', text: 'text-stone-100' },
    'Produksi': { bg: 'from-amber-600 to-yellow-800', text: 'text-amber-100' },
    'Ppb': { bg: 'from-lime-600 to-emerald-800', text: 'text-lime-100' },
    'MasterProducts': { bg: 'from-pink-600 to-rose-800', text: 'text-pink-100' },
    'Requests': { bg: 'from-purple-600 to-fuchsia-800', text: 'text-purple-100' }
};

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    // Determine color based on directory
    let mappedColor = { bg: 'from-blue-700 to-indigo-800', text: 'text-blue-100' };
    for (const [dirName, colors] of Object.entries(colorMap)) {
        if (filePath.includes(`\\${dirName}\\`) || filePath.includes(`/${dirName}/`)) {
            mappedColor = colors;
            break;
        }
    }

    // 1. Restore colors
    const gradientRegex = /bg-gradient-to-r from-[a-z]+-\d+ to-[a-z]+-\d+/g;
    if (gradientRegex.test(content)) {
        content = content.replace(gradientRegex, `bg-gradient-to-r ${mappedColor.bg}`);
        changed = true;
    }

    const subtitleRegex = /className="text-[a-z]+-100 mt-1"/g;
    if (subtitleRegex.test(content)) {
        content = content.replace(subtitleRegex, `className="${mappedColor.text} mt-1"`);
        changed = true;
    }
    const subtitleRegex2 = /className="text-[a-z]+-100\/[0-9]+ mt-1"/g;
    if (subtitleRegex2.test(content)) {
        content = content.replace(subtitleRegex2, `className="${mappedColor.text}/90 mt-1"`);
        changed = true;
    }

    // 2. Fix Structure (Edge to Edge)
    // Remove wrapper: <div className="space-y-6 p-4 min-h-screen sm:p-8"> (or similar variations)
    // Sometimes it's <div className="p-4 md:p-8 bg-transparent min-h-screen..."> or <div className="space-y-6 p-4 min-h-screen">
    const wrapperStartRegex = /<div className="[^"]*(min-h-screen|p-4 sm:p-8|p-4 md:p-8)[^"]*">\s*(<div className="relative overflow-hidden bg-gradient-to-r)/;
    if (wrapperStartRegex.test(content)) {
        content = content.replace(wrapperStartRegex, "$2");
        
        // Find the last </div> before </AppLayout> and remove it
        // Regex trick: replace the LAST "</div>\n        </AppLayout>" with just "</AppLayout>"
        // Since regex doesn't easily do "last match", we use lastIndexOf
        const appLayoutEnd = '</AppLayout>';
        const lastAppLayoutIdx = content.lastIndexOf(appLayoutEnd);
        if (lastAppLayoutIdx !== -1) {
            // Find the </div> just before it
            const beforeAppLayout = content.substring(0, lastAppLayoutIdx);
            const lastDivIdx = beforeAppLayout.lastIndexOf('</div>');
            if (lastDivIdx !== -1) {
                content = content.substring(0, lastDivIdx) + content.substring(lastDivIdx + 6); // remove '</div>'
            }
        }
        changed = true;
    }

    // Remove `rounded-xl shadow-sm mb-6` from the banner class
    const roundedBannerRegex = /bg-gradient-to-r ([^"]+) rounded-xl shadow-sm mb-6/g;
    if (roundedBannerRegex.test(content)) {
        content = content.replace(roundedBannerRegex, "bg-gradient-to-r $1");
        changed = true;
    }
    const roundedBannerRegex2 = /bg-gradient-to-r ([^"]+) rounded-xl mb-6 shadow-sm/g;
    if (roundedBannerRegex2.test(content)) {
        content = content.replace(roundedBannerRegex2, "bg-gradient-to-r $1");
        changed = true;
    }

    // Ensure the container has padding: `<div className="w-full -mt-20` -> `<div className="px-4 sm:px-6 w-full -mt-20`
    const containerRegex = /<div className="w-full -mt-20/g;
    if (containerRegex.test(content)) {
        content = content.replace(containerRegex, '<div className="px-4 sm:px-6 lg:px-8 w-full -mt-20');
        changed = true;
    }

    if (changed) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated layout and color in: ${path.relative(process.cwd(), filePath)}`);
    }
}

const pagesDir = path.join(__dirname, 'resources', 'js', 'pages');
walk(pagesDir, (err) => {
    if (err) console.error(err);
    else console.log('Done fixing layout and colors!');
});
