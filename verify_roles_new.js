import axios from 'axios';

const API_URL = 'http://localhost:5001';

const SUPER_ADMIN = {
    name: 'Super Admin',
    email: 'super@admin.com',
    password: 'superpassword',
    phone: '9999999999'
};

const NORMAL_ADMIN = {
    name: 'Normal Admin',
    email: 'normal@admin.com',
    password: 'normalpassword',
    phone: '8888888888'
};

async function runTest() {
    try {
        console.log("=== STARTING PRICING & ROLE ACCESS TEST (NEW EMAILS) ===");

        // 1. Register/Login Super Admin
        console.log("\n1.1 Registering/Logging in Super Admin...");
        try {
            await axios.post(`${API_URL}/api/auth/register`, SUPER_ADMIN);
            console.log("    Registered Super Admin");
        } catch (e) { console.log("    Super Admin already exists (expected)"); }

        const superLogin = await axios.post(`${API_URL}/api/auth/login`, {
            email: SUPER_ADMIN.email,
            password: SUPER_ADMIN.password
        });
        const superToken = superLogin.data.token;
        console.log("   [✓] Super Admin Logged In.");

        // 2. Register/Login Normal Admin
        console.log("\n1.2 Registering/Logging in Normal Admin...");
        try {
            await axios.post(`${API_URL}/api/auth/register`, NORMAL_ADMIN);
            console.log("    Registered Normal Admin");
        } catch (e) { console.log("    Normal Admin already exists (expected)"); }

        const normalLogin = await axios.post(`${API_URL}/api/auth/login`, {
            email: NORMAL_ADMIN.email,
            password: NORMAL_ADMIN.password
        });
        const normalToken = normalLogin.data.token;
        console.log("   [✓] Normal Admin Logged In.");


        // 3. Normal Admin Creates Product (Including Purchase Price)
        console.log("\n3. Normal Admin Creating Product with Purchase Price...");
        const productData = {
            name: "New Role Widget",
            description: "Testing visibility",
            sellingPriceStart: 1000,
            sellingPriceEnd: 1200,
            dealerPrice: 800,
            purchasePrice: 600, // KEY TEST
            vendor: "Test Vendor",
            alternativeNames: ["NRW-1"]
        };

        const createRes = await axios.post(`${API_URL}/api/products`, productData, {
            headers: { Authorization: `Bearer ${normalToken}` }
        });
        const productId = createRes.data._id;
        console.log(`   [✓] Product Created. ID: ${productId}`);

        // 4. Normal Admin Fetches Product (Should NOT see Purchase Price)
        console.log("\n4. Normal Admin Fetching Product...");
        const normalGet = await axios.get(`${API_URL}/api/products?search=New Role Widget`, {
            headers: { Authorization: `Bearer ${normalToken}` }
        });
        const pNormal = normalGet.data.find(p => p._id === productId);

        if (pNormal.purchasePrice === undefined) {
            console.log("   [PASS] Normal Admin CANNOT see Purchase Price.");
        } else {
            console.error(`   [FAIL] Normal Admin SAW Purchase Price: ${pNormal.purchasePrice}`);
        }

        // 5. Super Admin Fetches Product (Should SEE Purchase Price)
        console.log("\n5. Super Admin Fetching Product...");
        const superGet = await axios.get(`${API_URL}/api/products?search=New Role Widget`, {
            headers: { Authorization: `Bearer ${superToken}` }
        });
        const pSuper = superGet.data.find(p => p._id === productId);

        if (pSuper.purchasePrice === 600) {
            console.log(`   [PASS] Super Admin SEES Purchase Price: ${pSuper.purchasePrice}`);
        } else {
            console.error(`   [FAIL] Super Admin saw Purchase Price: ${pSuper.purchasePrice} (Expected 600)`);
        }

        // Cleanup
        console.log("\n6. Cleaning Up...");
        await axios.delete(`${API_URL}/api/products/${productId}`, {
            headers: { Authorization: `Bearer ${superToken}` }
        });
        console.log("   [✓] Cleanup Complete.");
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
