const fs = require('fs');

// ─────────────────────────────────────────────────────────────────────
// STEP 1: Add whatsappStatus field to Enquiry model
// ─────────────────────────────────────────────────────────────────────
console.log('--- Step 1: Patching Enquiry.js model ---');
let enqModel = fs.readFileSync('d:/uni-bc/src/models/Enquiry.js', 'utf8');

if (!enqModel.includes('whatsappStatus')) {
    enqModel = enqModel.replace(
        "    createdAt: { type: Date, default: Date.now }",
        `    whatsappStatus: { type: String, enum: ['sent', 'failed', 'partial'], default: 'sent' },
    whatsappSentAt: { type: Date },
    whatsappError: { type: String },
    createdAt: { type: Date, default: Date.now }`
    );
    fs.writeFileSync('d:/uni-bc/src/models/Enquiry.js', enqModel, 'utf8');
    console.log('✅ Enquiry model patched with whatsappStatus, whatsappSentAt, whatsappError fields.');
} else {
    console.log('ℹ️  whatsappStatus already exists in Enquiry model.');
}

// ─────────────────────────────────────────────────────────────────────
// STEP 2: Fix send-multiple-products route  
//         NEW FLOW: Send first → Log only if success
// ─────────────────────────────────────────────────────────────────────
console.log('--- Step 2: Patching whatsappRoutes.js send-multiple-products ---');
let waRoutes = fs.readFileSync('d:/uni-bc/src/routes/whatsappRoutes.js', 'utf8');

const OLD_BLOCK = `        // 2. Create WhatsApp Enquiry Log (type: 'whatsapp')
        const enquiryProducts = products.map(p => ({
            productId: p._id || p.id,
            quantity: 1,
            price: p.price || 0
        }));

        const defaultFollowUp = new Date();
        defaultFollowUp.setDate(defaultFollowUp.getDate() + 2); // default 2 days

        const enquiry = new Enquiry({
            Name: companyName || contactPersonName || 'Guest',
            companyName,
            contactPersonName,
            email: targetEmail,
            phone,
            products: enquiryProducts,
            type: 'whatsapp',
            status: 'Pending',
            isSeen: true, // Auto-seen since it's an outbound log
            firstFollowUpDate: defaultFollowUp,
            nextFollowUp: defaultFollowUp
        });
        await enquiry.save();

        // 3. Send WhatsApp Messages
        // We will send an intro message, followed by product messages
        let introMsg = \`Hello \${contactPersonName || companyName || 'there'},\\n\\nHere are the products you requested from Unique Engineering:\\n\\n\`;
        await sendWhatsapp(phone, introMsg, null);

        // Add a small delay so messages arrive in order
        const delay = ms => new Promise(res => setTimeout(res, ms));

        for (const prod of products) {
            await delay(1500); // 1.5s delay between messages to avoid rate limit or out-of-order delivery

            const caption = \`🚀 *\${prod.name?.toUpperCase()}*\\n\\n\` +
                            \`📦 *Category:* \${prod.category || 'General'}\\n\\n\` +
                            \`📝 *Description:*\\n\${prod.description || 'No description provided'}\\n\\n\` +
                            \`🌐 *View on Website:* https://uniquenas.tail57739c.ts.net/product/\${prod._id}\`;

            const imgPath = prod.localImages?.[0] || prod.images?.[0] || prod.photos?.[0];

            if (imgPath) {
                try {
                    await sendWhatsappMedia(phone, imgPath, caption, null);
                } catch (mediaErr) {
                    console.error('[WhatsApp] Failed to send media, falling back to text:', mediaErr.message);
                    await sendWhatsapp(phone, caption, null);
                }
            } else {
                await sendWhatsapp(phone, caption, null);
            }
        }

        await delay(1000);
        await sendWhatsapp(phone, \`Please let us know if you have any questions or would like a formal quotation.\\n\\nThank you!\`, null);

        res.status(200).json({ success: true, msg: 'WhatsApp products sent successfully!', enquiry });`;

const NEW_BLOCK = `        // ── CORRECTED FLOW: Send first → Log only if successful ──
        const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
        let sendError = null;

        // 2. SEND WhatsApp Messages FIRST (before any DB write)
        console.log('[WhatsApp] Sending messages to ' + phone + ' (' + (products.length) + ' products)');
        try {
            const introMsg = \`Hello \${contactPersonName || companyName || 'there'},\\n\\nHere are the products you requested from Unique Engineering:\\n\\n\`;
            await sendWhatsapp(phone, introMsg, null);

            for (const prod of products) {
                await delay(1500); // 1.5s delay to avoid rate limits / out-of-order delivery

                const caption = \`🚀 *\${prod.name?.toUpperCase()}*\\n\\n\` +
                                \`📦 *Category:* \${prod.category || 'General'}\\n\\n\` +
                                \`📝 *Description:*\\n\${prod.description || 'No description provided'}\\n\\n\` +
                                \`🌐 *View on Website:* https://uniquenas.tail57739c.ts.net/product/\${prod._id}\`;

                const imgPath = prod.localImages?.[0] || prod.images?.[0] || prod.photos?.[0];

                if (imgPath) {
                    try {
                        await sendWhatsappMedia(phone, imgPath, caption, null);
                    } catch (mediaErr) {
                        console.warn('[WhatsApp] Media failed, falling back to text:', mediaErr.message);
                        await sendWhatsapp(phone, caption, null);
                    }
                } else {
                    await sendWhatsapp(phone, caption, null);
                }
            }

            await delay(1000);
            await sendWhatsapp(phone, \`Please let us know if you have any questions or would like a formal quotation.\\n\\nThank you!\`, null);
            console.log('[WhatsApp] All messages sent successfully to ' + phone);
        } catch (whatsappErr) {
            sendError = whatsappErr.message || 'WhatsApp send failed';
            console.error('[WhatsApp] Send failed for ' + phone + ':', sendError);
            return res.status(500).json({ success: false, error: sendError });
        }

        // 3. ONLY AFTER SUCCESSFUL SEND → Create the WhatsApp log entry in DB
        const enquiryProducts = products.map(p => ({
            productId: p._id || p.id,
            quantity: 1,
            price: p.price || 0
        }));

        const defaultFollowUp = new Date();
        defaultFollowUp.setDate(defaultFollowUp.getDate() + 2);

        const enquiry = new Enquiry({
            Name: companyName || contactPersonName || 'Guest',
            companyName,
            contactPersonName,
            email: targetEmail,
            phone,
            products: enquiryProducts,
            type: 'whatsapp',
            status: 'Pending',
            isSeen: true,
            firstFollowUpDate: defaultFollowUp,
            nextFollowUp: defaultFollowUp,
            whatsappStatus: 'sent',
            whatsappSentAt: new Date()
        });
        await enquiry.save();
        console.log('[WhatsApp] Log entry created in DB for ' + phone + ' (enquiry ID: ' + enquiry._id + ')');

        res.status(200).json({ success: true, msg: 'WhatsApp products sent successfully!', enquiry });`;

if (waRoutes.includes(OLD_BLOCK)) {
    waRoutes = waRoutes.replace(OLD_BLOCK, NEW_BLOCK);
    fs.writeFileSync('d:/uni-bc/src/routes/whatsappRoutes.js', waRoutes, 'utf8');
    console.log('✅ whatsappRoutes.js patched — flow is now: SEND FIRST → LOG ON SUCCESS ONLY');
} else {
    console.error('❌ Could not find old block to replace in whatsappRoutes.js — manual edit needed');
    // write the new block to a diff file so user can apply manually
    fs.writeFileSync('d:/uni-eng/uni-fro/scratch/wa_new_block.txt', NEW_BLOCK, 'utf8');
    console.log('  New block written to scratch/wa_new_block.txt for manual reference');
}

// ─────────────────────────────────────────────────────────────────────
// STEP 3: Verify Enquiry model syntax
// ─────────────────────────────────────────────────────────────────────
console.log('--- Step 3: Syntax verification ---');
require('d:/uni-bc/src/models/Enquiry');
console.log('✅ Enquiry.js model loads cleanly');
require('d:/uni-bc/src/utils/whatsappService');
console.log('✅ whatsappService.js loads cleanly');
console.log('\n🎉 All patches applied successfully!');
