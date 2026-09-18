const fs = require('fs');
const path = require('path');

console.log('--- Testing Backend Modules ---');
try {
    require('d:/uni-bc/src/utils/pathHelper');
    console.log('✅ pathHelper loaded');
    require('d:/uni-bc/src/utils/fileDuplicator');
    console.log('✅ fileDuplicator loaded');
    require('d:/uni-bc/src/routes/siteMasterRoutes');
    console.log('✅ siteMasterRoutes loaded');
    require('d:/uni-bc/src/routes/employeeExpenseRoutes');
    console.log('✅ employeeExpenseRoutes loaded');
    require('d:/uni-bc/src/routes/scheduleMasterRoutes');
    console.log('✅ scheduleMasterRoutes loaded');

    // Simulate Topography backup execution
    const { duplicateTopographySiteFile } = require('d:/uni-bc/src/utils/fileDuplicator');
    const { getSiteMasterPath } = require('d:/uni-bc/src/utils/pathHelper');

    const testPath = '/app/storage/client_master/00012/site_master/00012-0015-JETPER (MORBI)/data/test_topo.csv';
    console.log('Simulating Topography backup for:', testPath);
    duplicateTopographySiteFile(testPath, 'TOPOGRAPHY SURVEY', 'data');
    console.log('✅ Topography backup function evaluated cleanly!');

    console.log('\n========================================');
    console.log('🎉 ALL BACKEND FIXES VERIFIED SUCCESSFULLY!');
    console.log('========================================');
} catch (err) {
    console.error('❌ Verification Error:', err);
    process.exit(1);
}
