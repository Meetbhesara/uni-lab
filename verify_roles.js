import axios from 'axios';

const API_URL = 'http://localhost:5001';

const SUPER_ADMIN = {
    email: 'meetbhesara26@gmail.com',
    password: 'Meet@123'
};

const NORMAL_ADMIN = {
    name: 'Test Normal Admin',
    email: `test_admin_${Date.now()}@gmail.com`,
    password: 'password123',
    phone: '9876543210'
};

async function runTest() {
    try {
        console.log("=== STARTING PRICING & ROLE ACCESS TEST ===");

        // 1. Setup Normal Admin
        console.log(`\n1. Registering new Normal Admin: ${NORMAL_ADMIN.email}...`);
        await axios.post(`${API_URL}/api/auth/register`, NORMAL_ADMIN);
        const normalLogin = await axios.post(`${API_URL}/api/auth/login`, {
            email: NORMAL_ADMIN.email,
            password: NORMAL_ADMIN.password
        });
        const normalToken = normalLogin.data.token;
        console.log("   [✓] Normal Admin Logged In.");

        // 2. Login Super Admin
        console.log("\n2. Logging in Super Admin...");
        const superLogin = await axios.post(`${API_URL}/api/auth/login`, {
            email: SUPER_ADMIN.email,
            password: SUPER_ADMIN.password
        });
        const superToken = superLogin.data.token;
        console.log("   [✓] Super Admin Logged In.");

        // 3. Normal Admin Creates Product (Including Purchase Price)
        console.log("\n3. Normal Admin Creating Product with Purchase Price...");
        const productPayload = {
            name: "Role Test Product",
            description: "Testing visibility",
            sellingPriceStart: 1000,
            sellingPriceEnd: 1200,
            dealerPrice: 800,
            purchasePrice: 600, // KEY TEST
            vendor: "Test Vendor",
            alternativeNames: ["RTP-1"]
        };

        const createRes = await axios.post(`${API_URL}/api/products`, productPayload, {
            headers: { Authorization: `Bearer ${normalToken}` }
        });
        const productId = createRes.data._id;
        console.log(`   [✓] Product Created. ID: ${productId}`);

        // 4. Normal Admin Fetches Product (Should NOT see Purchase Price)
        console.log("\n4. Normal Admin Fetching Product...");
        const normalGet = await axios.get(`${API_URL}/api/products?search=Role Test Product`, {
            headers: { Authorization: `Bearer ${normalToken}` }
        });
        const pNormal = normalGet.data.find(p => p._id === productId);

        if (pNormal.purchasePrice === undefined) {
            console.log("   [PASS] Normal Admin CANNOT see Purchase Price.");
        } else {
            console.error(`   [FAIL] Normal Admin SAW Purchase Price: ${pNormal.purchasePrice}`);
        }
        console.log(`   (Seen Prices: Sell=${pNormal.sellingPriceStart}-${pNormal.sellingPriceEnd}, Dealer=${pNormal.dealerPrice})`);

        // 5. Super Admin Fetches Product (Should SEE Purchase Price)
        console.log("\n5. Super Admin Fetching Product...");
        const superGet = await axios.get(`${API_URL}/api/products?search=Role Test Product`, {
            headers: { Authorization: `Bearer ${superToken}` }
        });
        const pSuper = superGet.data.find(p => p._id === productId);

        if (pSuper.purchasePrice === 600) {
            console.log(`   [PASS] Super Admin SEES Purchase Price: ${pSuper.purchasePrice}`);
        } else {
            console.error(`   [FAIL] Super Admin saw Purchase Price: ${pSuper.purchasePrice} (Expected 600)`);
        }

        // 6. Normal Admin Updates Purchase Price (Blind Update)
        console.log("\n6. Normal Admin Updating Purchase Price to 650...");
        await axios.put(`${API_URL}/api/products/${productId}`, {
            purchasePrice: 650
        }, {
            headers: { Authorization: `Bearer ${normalToken}` }
        });
        console.log("   [✓] Update Request Sent.");

        // 7. Verify Update as Super Admin
        console.log("\n7. Verifying Update as Super Admin...");
        const superGet2 = await axios.get(`${API_URL}/api/products?search=Role Test Product`, {
            headers: { Authorization: `Bearer ${superToken}` }
        });
        const pSuper2 = superGet2.data.find(p => p._id === productId);

        if (pSuper2.purchasePrice === 650) {
            console.log(`   [PASS] Purchase Price updated to 650 successfully.`);
        } else {
            console.error(`   [FAIL] Purchase Price is: ${pSuper2.purchasePrice} (Expected 650)`);
        }

        // Cleanup
        console.log("\n8. Cleaning Up...");
        await axios.delete(`${API_URL}/api/products/${productId}`, {
            headers: { Authorization: `Bearer ${superToken}` }
        });
        console.log("   [✓] Test Product Deleted.");
        console.log("\n=== TEST COMPLETED SUCCESSFULLY ===");

    } catch (error) {
        console.error("\n[!!!] TEST FAILED [!!!]");
        if (error.response) {
            console.error("Status:", error.response.status);
            console.error("Data:", error.response.data);
        } else {
            console.error(error.message);
        }
    }
}

runTest();
