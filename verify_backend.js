import axios from 'axios';

// Configuration
const BASE_URL = 'https://uni-lab-bc.onrender.com/api';

async function runTest() {
    console.log("Starting Verification Script...");

    // Generate fresh user
    const stamp = Date.now();
    const userPayload = {
        name: `User ${stamp}`,
        email: `verify_${stamp}@example.com`,
        password: 'password123',
        phone: '9988776655' // Corrected key based on previous test
    };

    // 1. Register
    console.log(`\n1. Registering: ${userPayload.email}`);
    try {
        await axios.post(`${BASE_URL}/auth/register`, userPayload, {
            headers: { 'Content-Type': 'application/json' }
        });
        console.log("   - Registered.");
    } catch (error) {
        console.error("   ❌ Registration Failed:", error.response?.data || error.message);
        // If registration fails, we can't proceed easily
        return;
    }

    // 2. Login
    console.log("\n2. Logging in...");
    let userToken = "";
    try {
        const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
            email: userPayload.email,
            password: userPayload.password
        });
        userToken = loginRes.data.token;
        console.log("   - Logged in. Token received.");
    } catch (error) {
        console.error("   ❌ Login Failed:", error.response?.data || error.message);
        return;
    }

    // 3. Get Products
    console.log("\n3. Fetching Products...");
    let productId = "60d5ecb8b487343510c43d22"; // Default fallback
    try {
        const prodRes = await axios.get(`${BASE_URL}/products`);
        const products = prodRes.data.products || prodRes.data.data || prodRes.data || [];
        console.log(`   - Found ${products.length} products.`);

        if (products.length > 0) {
            productId = products[0]._id || products[0].id;
        }
    } catch (error) {
        console.log("   - Product fetch failed/empty (non-critical for specific tests):", error.message);
    }
    console.log(`   - Using Product ID: ${productId}`);

    // 3.5 Test Cart
    console.log("\n3.5 Testing Cart...");
    const sessionId = "test-session-" + Date.now();
    try {
        // Add to Cart (Guest)
        await axios.post(`${BASE_URL}/cart`, {
            productId,
            quantity: 5,
            sessionId
        });
        console.log("   - Added to Guest Cart.");

        // Fetch Cart (Guest)
        const cartRes = await axios.get(`${BASE_URL}/cart/${sessionId}`);
        const cartItems = cartRes.data.products || [];
        console.log(`   - Fetched Guest Cart. Items: ${cartItems.length}`);

        if (cartItems.length > 0 && cartItems[0].quantity === 5) {
            console.log("   - Cart Verification Passed.");
        } else {
            console.error("   ❌ Cart Verification Failed: Item missing or wrong qty.");
        }
    } catch (error) {
        console.error("   ❌ Cart Test Failed:", error.response?.data || error.message);
    }

    // 4. Send General Enquiry
    console.log("\n4. Sending General Enquiry...");
    try {
        const enquiryPayload = {
            Name: userPayload.name,
            phone: userPayload.phone,
            email: userPayload.email,
            products: [{ productId: productId, quantity: 2 }],
            status: 'Pending',
            type: 'enquiry'
        };
        await axios.post(`${BASE_URL}/enquiries`, enquiryPayload, {
            headers: { Authorization: `Bearer ${userToken}` }
        });
        console.log("   - Enquiry Sent.");
    } catch (error) {
        console.error("\n❌ Enquiry Failed. Response Data:");
        console.error(JSON.stringify(error.response?.data || error.message, null, 2));
    }

    // 5. Send Quotation (HTML)
    console.log("\n5. Sending Quotation Request (HTML)...");
    try {
        const htmlContent = `<h1>Quote for Test Product</h1><p>User: ${userPayload.email}</p>`;
        await axios.post(`${BASE_URL}/quotations`, { htmlContent }, {
            headers: { Authorization: `Bearer ${userToken}` }
        });
        console.log("   - Quotation Sent.");
    } catch (error) {
        console.error("   ❌ Quotation Failed:", error.response?.data || error.message);
    }

    console.log("\n--- Test Complete ---");
}

runTest();
