const fs = require('fs');
const path = require('path');

function replaceInDir(dir) {
    const files = fs.readdirSync(dir);
    for (const f of files) {
        const p = path.join(dir, f);
        if (fs.statSync(p).isDirectory()) {
            replaceInDir(p);
        } else if (p.endsWith('.js')) {
            let content = fs.readFileSync(p, 'utf8');
            if (content.includes('networkidle0')) {
                // Changing networkidle0 to networkidle2 to prevent hanging when 1 or 2 requests are stuck
                content = content.replace(/waitUntil:\s*['"`]networkidle0['"`]/g, "waitUntil: 'networkidle2'");
                fs.writeFileSync(p, content);
                console.log('Fixed', p);
            }
        }
    }
}

replaceInDir('D:\\uni-bc\\src\\controllers');
console.log('Done');
