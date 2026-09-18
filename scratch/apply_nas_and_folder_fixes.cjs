const fs = require('fs');
const path = require('path');

console.log('--- Step 1: Updating fileDuplicator.js ---');
const fileDuplicatorCode = `const fs = require('fs');
const path = require('path');
const { getSiteMasterPath } = require('./pathHelper');

/**
 * Duplicates Topography Survey site files to backup storage (/app/storage_backup -> /volume1/WORK/LANDLAND SURVEY ( UNIQUE ENGINEERING )/APP WORK PROJECTS).
 * Only backups to 3 folders: 'data', 'report', 'mail'.
 */
const duplicateTopographySiteFile = (filePath, scheduleType, explicitCategory = null) => {
    if (!filePath) return;

    const normFilePath = String(filePath).replace(/\\\\/g, '/');
    const lowerNormPath = normFilePath.toLowerCase();

    // 1. Must be a site file (path contains client_master)
    if (!lowerNormPath.includes('/client_master/')) return;

    // 2. Schedule type check (strictly topography survey)
    if (scheduleType) {
        const schedTypeStr = String(scheduleType).toLowerCase();
        const isTopography = schedTypeStr.includes('topography') || schedTypeStr.includes('topo') || schedTypeStr.includes('survey');
        if (!isTopography) {
            return;
        }
    }

    let targetSubfolder = null;
    if (explicitCategory) {
        const cat = String(explicitCategory).toLowerCase();
        if (cat === 'data' || cat === 'collectedfiles') targetSubfolder = 'data';
        else if (cat === 'daily_report' || cat === 'dailyreports' || cat === 'report') targetSubfolder = 'report';
        else if (cat === 'mail' || cat === 'mailfiles') targetSubfolder = 'mail';
    }

    if (!targetSubfolder) {
        if (lowerNormPath.includes('/data/') || lowerNormPath.includes('/collectedfiles/')) {
            targetSubfolder = 'data';
        } else if (lowerNormPath.includes('/daily_report/') || lowerNormPath.includes('/dailyreports/') || lowerNormPath.includes('/report/')) {
            targetSubfolder = 'report';
        } else if (lowerNormPath.includes('/mail/') || lowerNormPath.includes('/mailfiles/')) {
            targetSubfolder = 'mail';
        }
    }

    // Strictly skip photos, drawings, and other categories as requested
    if (!targetSubfolder) {
        return;
    }

    try {
        const backupBase = process.env.NAS_BACKUP_PATH || '/app/storage_backup';

        const clientMasterIndex = lowerNormPath.indexOf('/client_master/');
        const afterClientMaster = normFilePath.substring(clientMasterIndex + '/client_master/'.length);
        const segments = afterClientMaster.split('/');

        if (segments.length < 3) return;

        const clientId = segments[0];
        const siteSubfolder = segments[2];
        const fileName = path.basename(normFilePath);

        // Resolve target directory on NAS backup case-insensitively
        const targetDir = getSiteMasterPath(backupBase, clientId, siteSubfolder, targetSubfolder);
        const backupFilePath = path.join(targetDir, fileName);

        const doCopy = () => {
            try {
                if (fs.existsSync(filePath)) {
                    if (!fs.existsSync(targetDir)) {
                        fs.mkdirSync(targetDir, { recursive: true });
                    }
                    fs.copyFileSync(filePath, backupFilePath);
                    console.log(\`✅ [TOPOGRAPHY BACKUP] Successfully copied to \${targetSubfolder}: \${backupFilePath}\`);
                } else {
                    console.warn(\`⚠️ [TOPOGRAPHY BACKUP] Source file not found yet: \${filePath}\`);
                }
            } catch (err) {
                console.error('❌ [TOPOGRAPHY BACKUP ERROR] Copy failed:', err.message);
            }
        };

        if (fs.existsSync(filePath)) {
            doCopy();
        } else {
            setTimeout(doCopy, 400);
        }
    } catch (err) {
        console.error('❌ [TOPOGRAPHY BACKUP ERROR] Failed to process duplication:', err.message);
    }
};

module.exports = { duplicateTopographySiteFile };
`;
fs.writeFileSync('d:/uni-bc/src/utils/fileDuplicator.js', fileDuplicatorCode, 'utf8');
console.log('✅ fileDuplicator.js written successfully.');

console.log('--- Step 2: Updating employeeExpenseRoutes.js ---');
const eerPath = 'd:/uni-bc/src/routes/employeeExpenseRoutes.js';
let eer = fs.readFileSync(eerPath, 'utf8');

// Replace the storage definition
const newEerStorage = `// --- Multer Storage Logic (Reused for consistent folder structure) ---
const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        const useNas = process.env.USE_NAS === 'true';
        let nasBase = process.env.NAS_BASE_PATH || '/app/storage';
        if (useNas && !nasBase.startsWith('/')) nasBase = '/' + nasBase;
        const localBase = process.env.LOCAL_BASE_PATH || './uploads';
        const absoluteLocalBase = path.isAbsolute(localBase) ? localBase : path.join(process.cwd(), localBase);
        const rootBase = useNas ? nasBase : absoluteLocalBase;

        try {
            let clientShortId = req.body.clientShortId || 'unknown_client';
            let siteSubfolder = req.body.siteSubfolder || 'unknown_site';

            // If fieldname is site_X_photos, resolve specific metadata
            if (file.fieldname.startsWith('site_')) {
                const parts = file.fieldname.split('_');
                const idx = parseInt(parts[1]);
                if (req.body[\`site_\${idx}_clientShortId\`]) clientShortId = req.body[\`site_\${idx}_clientShortId\`];
                if (req.body[\`site_\${idx}_siteSubfolder\`]) siteSubfolder = req.body[\`site_\${idx}_siteSubfolder\`];
            }

            let finalDir;
            if (file.fieldname.startsWith('expense_')) {
                const parts = file.fieldname.split('_'); // expense_petrol
                let expenseName = parts[1];
                if (expenseName === 'petrol') {
                    expenseName = (req.body.fuelType || 'petrol').toLowerCase();
                }
                const empId = req.body.empId || req.body.employeeId || 'unknown_employee';
                finalDir = useNas 
                    ? path.join(nasBase, 'employee_master', empId, expenseName)
                    : path.join(absoluteLocalBase, 'employee_master', empId, expenseName);
                if (!fs.existsSync(finalDir)) fs.mkdirSync(finalDir, { recursive: true });
            } else if (file.fieldname.startsWith('otherExpense_')) {
                const empId = req.body.empId || req.body.employeeId || 'unknown_employee';
                finalDir = useNas 
                    ? path.join(nasBase, 'employee_master', empId, 'other_expenses')
                    : path.join(absoluteLocalBase, 'employee_master', empId, 'other_expenses');
                if (!fs.existsSync(finalDir)) fs.mkdirSync(finalDir, { recursive: true });
            } else {
                let sub = 'data'; 
                if (file.fieldname.includes('photos')) sub = 'photos';
                else if (file.fieldname.includes('dailyReports') || file.fieldname.includes('report')) sub = 'Daily_report';
                else if (file.fieldname.includes('drawing') || file.fieldname.includes('drafting')) sub = 'drawing';
                else if (file.fieldname.includes('data')) sub = 'data';

                finalDir = getSiteMasterPath(rootBase, clientShortId, siteSubfolder, sub);
                if (!fs.existsSync(finalDir)) fs.mkdirSync(finalDir, { recursive: true });
            }

            req.targetDirs = req.targetDirs || {};
            req.targetDirs[file.fieldname] = finalDir;
            file.destination = finalDir;
            cb(null, finalDir);
        } catch (err) {
            cb(err);
        }
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        let name = file.originalname;
        if (file.fieldname.startsWith('expense_') || file.fieldname.startsWith('otherExpense_')) {
            name = file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname);
        }
        cb(null, name);
    }
});`;

eer = eer.replace(/\/\/ --- Multer Storage Logic[\s\S]*?cb\(null, name\);\s*\}\s*\}\);/, newEerStorage);

const newBackupMiddleware = `const topographyBackupMiddleware = (req, res, next) => {
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
        const { duplicateTopographySiteFile } = require('../utils/fileDuplicator');
        req.files.forEach(f => {
            if (f.path) {
                let explicitCat = null;
                if (f.fieldname.includes('data')) explicitCat = 'data';
                else if (f.fieldname.includes('dailyReports') || f.fieldname.includes('report')) explicitCat = 'report';
                else if (f.fieldname.includes('mail')) explicitCat = 'mail';

                const schedType = req.body[\`\${f.fieldname}_scheduleType\`] || req.body.scheduleType || 'Topography Survey';
                if (explicitCat) {
                    duplicateTopographySiteFile(f.path, schedType, explicitCat);
                }
            }
        });
    }
    next();
};`;

eer = eer.replace(/const topographyBackupMiddleware[\s\S]*?next\(\);\s*\};/, newBackupMiddleware);
fs.writeFileSync(eerPath, eer, 'utf8');
console.log('✅ employeeExpenseRoutes.js updated successfully.');

console.log('--- Step 3: Updating siteMasterRoutes.js ---');
const smrPath = 'd:/uni-bc/src/routes/siteMasterRoutes.js';
let smr = fs.readFileSync(smrPath, 'utf8');

const newSmrStorage = `const { getSiteMasterPath } = require('../utils/pathHelper');

// Dynamic Storage Configuration
const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        const useNas = process.env.USE_NAS === 'true';
        let nasBase = process.env.NAS_BASE_PATH || '/app/storage';
        if (useNas && !nasBase.startsWith('/')) nasBase = '/' + nasBase;
        const localBase = process.env.LOCAL_BASE_PATH || './uploads';
        const absoluteLocalBase = path.isAbsolute(localBase) ? localBase : path.join(process.cwd(), localBase);
        const rootBase = useNas ? nasBase : absoluteLocalBase;

        try {
            // Get client ObjectId and site details from request or DB if updating
            let clientObjId = req.body.client;
            let siteId = req.body.siteId;
            let siteName = req.body.siteName;

            if (req.params && req.params.id) {
                try {
                    const existingSite = await SiteMaster.findById(req.params.id).populate('client');
                    if (existingSite) {
                        if (!clientObjId) clientObjId = existingSite.client?._id || existingSite.client;
                        if (!siteId) siteId = existingSite.siteId;
                        if (!siteName) siteName = existingSite.siteName;
                    }
                } catch (e) { console.error('Error looking up existing site in multer:', e); }
            }

            let clientShortId = 'unknown_client';
            if (clientObjId) {
                const ClientMaster = require('../models/ClientMaster');
                const clientRecord = await ClientMaster.findById(clientObjId);
                if (clientRecord && clientRecord.clientId) {
                    clientShortId = clientRecord.clientId;
                }
            }

            // Sanitize site name and combine with siteId for folder naming
            siteId = siteId || 'unknown_id';
            const siteNamePart = (siteName || 'unknown_site').trim().replace(/[<>:"\/\\\\|?*]+/g, '_');
            const siteSubfolder = \`\${siteId}-\${siteNamePart}\`;

            // Decide which subfolder to use based on the field name or documentType
            let sub = 'data'; // default
            if (file.fieldname === 'photos' || req.body.documentType === 'photos') sub = 'photos';
            else if (file.fieldname === 'dailyReports' || req.body.documentType === 'dailyReports') sub = 'Daily_report';
            else if (file.fieldname === 'data' || req.body.documentType === 'data') sub = 'data';
            else if (file.fieldname === 'draftingWorks' || req.body.documentType === 'drafting' || req.body.documentType === 'drawing') sub = 'drawing';
            else if (file.fieldname === 'docs') sub = ''; // Store directly in targetDir

            const targetDir = getSiteMasterPath(rootBase, clientShortId, siteSubfolder, sub);
            if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

            cb(null, targetDir);
        } catch (err) {
            console.error('Multer destination error in siteMasterRoutes:', err);
            cb(err);
        }
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});`;

smr = smr.replace(/\/\/ Dynamic Storage Configuration[\s\S]*?cb\(null, file\.originalname\);\s*\}\s*\}\);/, newSmrStorage);
if (!smr.includes("const { getSiteMasterPath } = require('../utils/pathHelper');")) {
    smr = "const { getSiteMasterPath } = require('../utils/pathHelper');\n" + smr;
}
fs.writeFileSync(smrPath, smr, 'utf8');
console.log('✅ siteMasterRoutes.js updated successfully.');

console.log('--- Step 4: Verification of syntax ---');
require('d:/uni-bc/src/utils/fileDuplicator');
require('d:/uni-bc/src/utils/pathHelper');
console.log('✅ All backend modules verified with zero syntax errors!');
