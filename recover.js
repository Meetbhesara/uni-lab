const fs = require('fs');
const path = require('path');

const historyDir = 'C:\\Users\\Meet\\AppData\\Roaming\\Code\\User\\History';
let found = [];

function search(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            search(fullPath);
        } else if (file === 'entries.json') {
            try {
                const content = fs.readFileSync(fullPath, 'utf8');
                const entries = JSON.parse(content);
                // The VS Code entries.json format has a resource property usually or the file itself is known.
                // Wait, entries.json usually looks like: { "version": 1, "resource": "file:///d%3A/uni-eng/uni-fro/src/pages/admin/InvoiceReport.jsx", "entries": [ ... ] }
                if (content.includes('InvoiceReport.jsx')) {
                    found.push({ path: fullPath, content: entries });
                }
            } catch (e) {}
        }
    }
}

search(historyDir);
console.log(JSON.stringify(found, null, 2));
