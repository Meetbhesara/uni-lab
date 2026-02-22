import React, { useState, useEffect } from 'react';
import { Box, Table, Thead, Tbody, Tr, Th, Td, Badge, Button, useToast, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton, Text, Tabs, TabList, TabPanels, Tab, TabPanel, Input, FormControl, FormLabel, Flex, VStack, HStack, Divider, NumberInput, NumberInputField, Image, Textarea, Checkbox, Stack, IconButton, SimpleGrid } from '@chakra-ui/react';
import { FiPlus, FiPrinter, FiTrash, FiDownload } from 'react-icons/fi';
import api from '../../api/axios';
import { DEMO_ENQUIRIES, DEMO_QUOTATIONS } from '../../data/mockData';

const AdminEnquiries = () => {
    const [enquiries, setEnquiries] = useState([]);
    const [quotations, setQuotations] = useState([]); // Active (Sent/Pending)
    const [processedQuotations, setProcessedQuotations] = useState([]); // Done/Rejected
    const [selectedEnquiry, setSelectedEnquiry] = useState(null);
    const [selectedQuotation, setSelectedQuotation] = useState(null);

    const getImageUrl = (path) => {
        if (!path) return 'https://via.placeholder.com/150';
        if (path.startsWith('http')) return path;
        const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
        return `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
    };

    // Quote Creation State
    const [isCreatingQuote, setIsCreatingQuote] = useState(false);
    const [quoteItems, setQuoteItems] = useState([]);
    const [quoteDiscount, setQuoteDiscount] = useState(0);
    const [quoteTotals, setQuoteTotals] = useState({ subtotal: 0, productGst: 0, gst: 0, total: 0, packaging: 0, packagingGst: 0 });
    const [isSubmittingQuote, setIsSubmittingQuote] = useState(false);

    // Custom Party Details
    const [quotePartyName, setQuotePartyName] = useState('');
    const [quoteAddress, setQuoteAddress] = useState('');
    const [quoteMobile, setQuoteMobile] = useState('');
    const [quoteEmail, setQuoteEmail] = useState('');


    // Policies State
    const DEFAULT_POLICIES = [
        { id: 'price', label: 'Price', value: 'The above quoted prices Ahmedabad Office.', isChecked: true },
        { id: 'payment', label: 'Payment', value: 'AFTER PRAFOMA INVOISE', isChecked: true },
        { id: 'validity', label: 'Validity', value: '10 Days From The Date Of This Offer.', isChecked: true },
        { id: 'delivery', label: 'Delivery', value: 'Ready Stock', isChecked: true },
        { id: 'tax', label: 'Tax', value: 'Tax will be Charged Extra if so applicable as per Govt. Rules', isChecked: true },
        { id: 'taxDetails', label: 'Tax Details', value: 'GST NO. 24AAGFU8457M1ZI    PAN NO. AAGFU8457M', isChecked: true }
    ];

    // Policies State: Load from LocalStorage or use Defaults
    const [policies, setPolicies] = useState(() => {
        try {
            const saved = localStorage.getItem('quotation_policies');
            return saved ? JSON.parse(saved) : DEFAULT_POLICIES;
        } catch (e) {
            return DEFAULT_POLICIES;
        }
    });

    // Save policies to LocalStorage whenever they change
    useEffect(() => {
        localStorage.setItem('quotation_policies', JSON.stringify(policies));
    }, [policies]);
    const [customNotes, setCustomNotes] = useState("(1) Payment After Performer Invoice\n(2) Transportation And Packing Charge Will be Extra As Per Actual");
    const [newPolicy, setNewPolicy] = useState({ label: '', value: '' });

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const isSuperAdmin = user.email === 'iatulkanak@gmail.com';

    const toast = useToast();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [enqRes, quoteRes] = await Promise.all([
                api.get('/enquiries'),
                api.get('/quotations')
            ]);

            // Normalize Enquiries
            const enqs = (Array.isArray(enqRes.data) ? enqRes.data : (enqRes.data.data || []));
            setEnquiries(enqs);

            // Normalize Quotations and Split
            const allQuotes = (Array.isArray(quoteRes.data) ? quoteRes.data : (quoteRes.data.data || []));
            setQuotations(allQuotes.filter(q => q.status !== 'Done' && q.status !== 'Reject'));
            setProcessedQuotations(allQuotes.filter(q => q.status === 'Done' || q.status === 'Reject'));

        } catch (error) {
            console.error("Backend unavailable, loading demo data");
            setEnquiries(DEMO_ENQUIRIES);
            setQuotations(DEMO_QUOTATIONS);
            toast({
                title: "Backend Unavailable",
                description: "Loaded demo data for visualization.",
                status: "info",
                duration: 5000,
                isClosable: true
            });
        }
    };

    const handleViewEnquiry = async (enq) => {
        setSelectedEnquiry(enq);
        setIsCreatingQuote(false);
        setQuoteItems([]);
        setQuoteDiscount(0);
        setQuoteTotals({ subtotal: 0, productGst: 0, gst: 0, total: 0, packaging: 0, packagingGst: 0 });

        setNewPolicy({ label: '', value: '' });

        // Mark as seen if not already
        if (!enq.isSeen) {
            try {
                await api.patch(`/enquiries/${enq._id}/seen`);
                // Update local state to remove red dot
                setEnquiries(prev => prev.map(e => e._id === enq._id ? { ...e, isSeen: true } : e));
            } catch (err) {
                console.error("Failed to mark as seen", err);
            }
        }

        setCustomNotes("(1) Payment After Performer Invoice\n(2) Transportation And Packing Charge Will be Extra As Per Actual");
    };

    const handleStatusUpdate = async (id, status) => {
        try {
            await api.put(`/quotations/${id}`, { status });
            toast({ title: `Quotation marked as ${status}`, status: "success" });
            fetchData();
        } catch (error) {
            console.error("Status update failed", error);
            toast({ title: "Failed to update status", status: "error" });
        }
    };

    const handleViewQuotation = (quote) => {
        setSelectedQuotation(quote);
    };

    const initCreateQuote = () => {
        if (!selectedEnquiry) return;
        setIsCreatingQuote(true);
        setIsSubmittingQuote(false);

        // Initialize custom party details
        setQuotePartyName(selectedEnquiry.Name || '');
        setQuoteEmail(selectedEnquiry.email || '');
        setQuoteMobile(selectedEnquiry.phone || '');
        setQuoteAddress(''); // Start empty

        // Initialize items from enquiry products
        const initialItems = (selectedEnquiry.products || []).map(p => {
            const product = p.productId || {};
            const endPrice = parseFloat(product.sellingPriceEnd);
            const startPrice = parseFloat(product.sellingPriceStart);
            const dealerPrice = parseFloat(product.dealerPrice) || 0;

            let defaultPrice = 0;
            if (!isNaN(endPrice) && endPrice > 0) defaultPrice = endPrice;
            else if (!isNaN(startPrice) && startPrice > 0) defaultPrice = startPrice;

            return {
                productId: p.productId,
                quantity: p.quantity,
                price: defaultPrice,
                gst: 18, // Default GST
                useDealerPrice: false,
                dealerPrice: dealerPrice,
                sellingPriceStart: startPrice || 0,
                sellingPriceEnd: endPrice || 0,
                calculatedSellingPrice: defaultPrice
            };
        });
        setQuoteItems(initialItems);
        setQuoteDiscount(0);
        setQuoteTotals({ subtotal: 0, productGst: 0, gst: 0, total: 0, packaging: 0, packagingGst: 0 });
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...quoteItems];
        // Allow string value for smooth typing, convert later for math
        newItems[index][field] = value;
        setQuoteItems(newItems);
        calculateTotals(newItems, quoteDiscount);
    };

    const handleRemoveItem = (index) => {
        const newItems = quoteItems.filter((_, i) => i !== index);
        setQuoteItems(newItems);
        calculateTotals(newItems, quoteDiscount);
    };

    const calculateTotals = (items, discount) => {
        let sub = 0;
        let gstAmt = 0;
        items.forEach(item => {
            const price = parseFloat(item.price) || 0;
            const gst = parseFloat(item.gst) || 0;
            const itemTotal = price * item.quantity;
            sub += itemTotal;
            gstAmt += itemTotal * (gst / 100);
        });

        setQuoteTotals(prev => {
            const packaging = prev.packaging || 0;
            const packagingGst = packaging * 0.18;
            const totalGst = gstAmt + packagingGst;
            const disc = parseFloat(discount !== undefined ? discount : quoteDiscount) || 0;
            const grandTotal = sub + packaging + totalGst - disc;

            return {
                ...prev,
                subtotal: sub,
                productGst: gstAmt,
                gst: totalGst,
                packagingGst,
                total: grandTotal
            };
        });
    };

    const togglePolicy = (id) => {
        setPolicies(policies.map(p => p.id === id ? { ...p, isChecked: !p.isChecked } : p));
    };

    const addCustomPolicy = () => {
        if (!newPolicy.label || !newPolicy.value) return;
        setPolicies([...policies, { id: `custom_${Date.now()}`, ...newPolicy, isChecked: true }]);
        setNewPolicy({ label: '', value: '' });
    };

    const generateHTML = (enquiry, items, totals, selectedPolicies, notes, refNo, discount, partyName, address, mobile, email) => {
        const date = new Date().toLocaleDateString('en-GB');

        const productRows = items.map((item, index) => {
            const product = item.productId;
            const specs = product?.details ? Object.entries(product.details).map(([k, v]) => `${k} :- ${v}`).join('<br/>') : '';
            const imgPath = product?.images?.[0] || product?.photos?.[0] || product?.image;
            const imgUrl = getImageUrl(imgPath);
            const price = parseFloat(item.price) || 0;
            const quantity = parseFloat(item.quantity) || 0;
            const total = price * quantity;

            return `
                <tr>
                    <td style="border: 1px solid black; text-align: center; vertical-align: middle;">${index + 1}</td>
                    <td style="border: 1px solid black; padding: 5px;">
                        <div style="display: flex; gap: 15px;">
                            <div style="width: 150px;">
                                <img src="${imgUrl}" style="width: 100%; border-radius: 4px;" />
                            </div>
                            <div style="flex: 1;">
                                <strong style="text-decoration: underline;">${product?.name || 'Product'}</strong><br/>
                                <div style="font-size: 13px; margin-top: 5px; color: #333;">
                                    ${specs}
                                </div>
                            </div>
                        </div>
                    </td>
                    <td style="border: 1px solid black; text-align: center; vertical-align: middle;">${quantity}</td>
                    <td style="border: 1px solid black; text-align: center; vertical-align: middle;">${item.gst}%</td>
                    <td style="border: 1px solid black; text-align: center; vertical-align: middle;">${price.toLocaleString()}</td>
                    <td style="border: 1px solid black; text-align: center; vertical-align: middle;">${total.toLocaleString()}</td>
                </tr>
            `;
        }).join('');

        const policyRows = selectedPolicies.filter(p => p.isChecked).map(p => `
            <tr>
                <td style="font-weight: bold; width: 120px; padding: 2px 0;">${p.label}</td>
                <td style="padding: 2px 0;">: ${p.value}</td>
            </tr>
        `).join('');

        const discountAmt = parseFloat(discount) || 0;
        const displayRefNo = refNo || 'XXXXXX-' + new Date().getFullYear();

        return `
            <div style="font-family: Arial, sans-serif; max-width: 800px; margin: auto; border: 2px solid black; padding: 10px;">
                <!-- Header -->
                <div style="border-bottom: 2px solid black; padding-bottom: 10px; margin-bottom: 10px;">
                    <div style="text-align: center; font-size: 15px; font-weight: bold; letter-spacing: 1px; margin-bottom: 6px;">II Shree Ganesh II</div>
                    <div style="text-align: center; color: #0076a3;">
                        <h1 style="margin: 0; font-size: 32px; font-weight: bold; white-space: nowrap; letter-spacing: 1px;">UNIQUE LAB INSTRUMENT</h1>
                    </div>
                </div>

                <div style="font-size: 12px; text-align: center; margin-bottom: 10px;">
                    Office : No:-SHOP NO -03 SIMANDHAR TENAMENT, MAKARBA RAILWAY CROSSING AHMEDABAD - 380051.<br/>
                    Email : uniqueengineeringcs@gmail.com , Mo : +91 9099160391, +91 9898835374
                </div>

                <!-- Party Info Section -->
                <div style="display: flex; border: 1px solid black; font-size: 13px;">
                    <div style="flex: 1; border-right: 1px solid black; padding: 5px;">
                        <strong>PARTY NAME:-</strong><br/>
                        <strong>M/s. ${partyName || ''}</strong><br/><br/>
                        Address : - ${address || ''}<br/>
                        Mobile No : - ${mobile || ''}<br/>
                        Email : - ${email || ''}
                    </div>
                    <div style="flex: 1; padding: 5px;">
                        Ref No:- ${displayRefNo}<br/>
                        Date :- ${date}<br/>
                        <strong>PAN NO. AAGFU8457M</strong><br/><br/>
                        <strong>GST NO. 24AAGFU8457M1ZI</strong>
                    </div>
                </div>

                <!-- Subject -->
                <div style="border: 1px solid black; border-top: none; padding: 5px; font-weight: bold; font-size: 14px;">
                    Subject : Quotation of Lab Instrument
                </div>

                <!-- Quotation Title -->
                <div style="text-align: center; font-weight: bold; font-size: 18px; margin-top: 5px;">Quotation</div>
                <div style="text-align: center; font-size: 13px; margin-bottom: 5px;">Respected sir We are send quotation as per your requirement</div>

                <!-- Main Table -->
                <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                    <thead>
                        <tr style="background: #f2f2f2;">
                            <th style="border: 1px solid black; padding: 5px; width: 40px;">Sr. No.</th>
                            <th style="border: 1px solid black; padding: 5px;">Description</th>
                            <th style="border: 1px solid black; padding: 5px; width: 50px;">Qty.</th>
                            <th style="border: 1px solid black; padding: 5px; width: 60px;">GST</th>
                            <th style="border: 1px solid black; padding: 5px; width: 80px;">Rate</th>
                            <th style="border: 1px solid black; padding: 5px; width: 100px;">Total Rs.</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${productRows}
                        <tr>
                            <td colspan="5" style="border: 1px solid black; text-align: right; padding: 5px; font-weight: bold;">SUB TOTAL</td>
                            <td style="border: 1px solid black; text-align: center; padding: 5px; font-weight: bold;">${totals.subtotal.toLocaleString()}.00</td>
                        </tr>
                        ${(totals.packaging || 0) > 0 ? `
                        <tr>
                            <td colspan="5" style="border: 1px solid black; text-align: right; padding: 5px; font-weight: bold;">Packaging &amp; Forwarding (18% GST Extra)</td>
                            <td style="border: 1px solid black; text-align: center; padding: 5px; font-weight: bold;">${(totals.packaging).toLocaleString()}.00</td>
                        </tr>` : ''}
                        <tr>
                            <td colspan="5" style="border: 1px solid black; text-align: right; padding: 5px; color: blue; text-decoration: underline;">Total GST</td>
                            <td style="border: 1px solid black; text-align: center; padding: 5px; font-weight: bold;">${totals.gst.toLocaleString()}.00</td>
                        </tr>
                        ${discountAmt > 0 ? `
                        <tr>
                            <td colspan="5" style="border: 1px solid black; text-align: right; padding: 5px; color: green; font-weight: bold;">Discount</td>
                            <td style="border: 1px solid black; text-align: center; padding: 5px; font-weight: bold; color: green;">- ${discountAmt.toLocaleString()}.00</td>
                        </tr>` : ''}
                        <tr>
                            <td colspan="5" style="border: 1px solid black; text-align: right; padding: 5px; font-weight: bold;">TOTAL</td>
                            <td style="border: 1px solid black; text-align: center; padding: 5px; font-weight: bold;">${totals.total.toLocaleString()}.00</td>
                        </tr>
                    </tbody>
                </table>

                <!-- Notes -->
                <div style="background: yellow; border: 1px solid black; border-top: none; padding: 5px; font-size: 12px; font-weight: bold; text-align: center;">
                    Note :- ${notes.split('\n').map(n => `(${n})`).join(' ')}
                </div>

                <!-- Terms & Conditions -->
                <div style="margin-top: 15px; font-size: 12px;">
                    <div style="text-align: center; font-weight: bold; text-decoration: underline; margin-bottom: 5px;">TERMS &amp; CONDITIONS</div>
                    <table style="width: 100%;">
                        ${policyRows}
                    </table>

                    <!-- Footer Section: Bank Details, QR, Signature -->
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 15px;">
                        <div style="line-height: 1.4;">
                            Bank Name :- Induslnd Bank<br/>
                            Branch Name :- PRAHLADNAGAR<br/>
                            Name :- UNIQUE LAB INSTRUMENT<br/>
                            A/C No.:- 259898835374<br/>
                            IFSC CODE :- INDB0000330
                        </div>
                        <div style="text-align: center;">
                            <img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=upi://pay?pa=pos.5345756@indus&pn=UNIQUE%20LAB%20INSTRUMENT" alt="Scan to Pay" style="width: 100px; height: 100px; border: 1px solid #ccc; padding: 5px;" />
                            <div style="font-size: 10px; font-weight: bold; margin-top: 4px;">Scan &amp; Pay</div>
                        </div>
                        <div style="text-align: right; font-weight: bold; align-self: flex-end;">
                            For. UNIQUE LAB INSTRUMENT
                        </div>
                    </div>
                </div>
            </div>
        `;
    };


    const submitQuote = async () => {
        if (isSubmittingQuote) return;

        // Validation: Check for missing prices
        const missingPrice = quoteItems.some(item => !item.price || parseFloat(item.price) <= 0);
        if (missingPrice) {
            toast({
                title: "Validation Error",
                description: "All products must have a valid Unit Price.",
                status: "error",
                duration: 4000,
                isClosable: true
            });
            return;
        }

        setIsSubmittingQuote(true);

        // Generate a temporary ref no for display (real one is created on backend)
        const year = new Date().getFullYear();
        const tempRefNo = `XXXXXX-${year}`;
        const discount = parseFloat(quoteDiscount) || 0;
        const htmlContent = generateHTML(
            selectedEnquiry, quoteItems, quoteTotals, policies, customNotes, tempRefNo, discount,
            quotePartyName, quoteAddress, quoteMobile, quoteEmail
        );

        const payload = {
            enquiryId: selectedEnquiry._id,
            items: quoteItems.map(i => {
                const pPrice = parseFloat(i.price) || 0;
                const pQuantity = parseFloat(i.quantity) || 0;
                const pGst = parseFloat(i.gst) || 0;
                return {
                    product: i.productId._id || i.productId,
                    quantity: pQuantity,
                    price: pPrice,
                    gst: pGst,
                    amount: (pPrice * pQuantity)
                };
            }),
            htmlContent,
            status: 'Sent',
            packaging: quoteTotals.packaging || 0,
            packagingGst: quoteTotals.packagingGst || 0,
            discount
        };

        try {
            const response = await api.post('/quotations', payload);
            // Now regenerate HTML with the actual ref number from backend
            if (response.data?.refNo) {
                const finalHtml = generateHTML(
                    selectedEnquiry, quoteItems, quoteTotals, policies, customNotes, response.data.refNo, discount,
                    quotePartyName, quoteAddress, quoteMobile, quoteEmail
                );
                await api.put(`/quotations/${response.data._id}`, { htmlContent: finalHtml });
            }

            fetchData();
            setEnquiries(prev => prev.map(e => e._id === selectedEnquiry._id ? { ...e, isSeen: true } : e));

            toast({ title: "Quotation Created & Saved", status: "success" });
            setSelectedEnquiry(null);
            setIsCreatingQuote(false);

        } catch (error) {
            console.error("Submit error", error);
            toast({ title: "Error creating quote", status: "error" });
        } finally {
            setIsSubmittingQuote(false);
        }
    };

    const downloadTallyXML = (quotation) => {
        const date = new Date(quotation.createdAt).toISOString().slice(0, 10).replace(/-/g, '');
        const partyName = (quotation.enquiryId?.Name || quotation.enquiry?.Name || "Cash").replace(/&/g, '&amp;');
        const voucherNumber = quotation._id.slice(-6).toUpperCase();

        let inventoryEntries = '';
        quotation.items.forEach(item => {
            const product = item.product || item.productId;
            const productName = (product?.name || "Unknown Product").replace(/&/g, '&amp;');
            const qty = item.quantity || 0;
            const rate = item.price || 0;
            const amount = qty * rate;

            inventoryEntries += `
                        <ALLINVENTORYENTRIES.LIST>
                            <STOCKITEMNAME>${productName}</STOCKITEMNAME>
                            <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
                            <RATE>${rate}/No</RATE>
                            <AMOUNT>-${amount}</AMOUNT> 
                            <ACTUALQTY> ${qty} No</ACTUALQTY>
                            <BILLEDQTY> ${qty} No</BILLEDQTY>
                            <ACCOUNTINGALLOCATIONS.LIST>
                                <LEDGERNAME>Sales</LEDGERNAME>
                                <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
                                <AMOUNT>-${amount}</AMOUNT>
                            </ACCOUNTINGALLOCATIONS.LIST>
                        </ALLINVENTORYENTRIES.LIST>`;
        });

        let ledgerEntries = '';

        if (quotation.packaging > 0) {
            ledgerEntries += `
                        <LEDGERENTRIES.LIST>
                            <LEDGERNAME>Packaging &amp; Forwarding</LEDGERNAME>
                            <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
                            <AMOUNT>-${quotation.packaging}</AMOUNT>
                        </LEDGERENTRIES.LIST>`;
        }

        if (quotation.gstTotal > 0 || quotation.packagingGst > 0) {
            const gstAmt = (quotation.gstTotal || 0);
            ledgerEntries += `
                        <LEDGERENTRIES.LIST>
                            <LEDGERNAME>Output GST</LEDGERNAME>
                            <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
                            <AMOUNT>-${gstAmt}</AMOUNT>
                        </LEDGERENTRIES.LIST>`;
        }

        const totalAmount = quotation.grandTotal || 0;

        const xmlContent = `<ENVELOPE>
    <HEADER>
        <TALLYREQUEST>Import Data</TALLYREQUEST>
    </HEADER>
    <BODY>
        <IMPORTDATA>
            <REQUESTDESC>
                <REPORTNAME>Vouchers</REPORTNAME>
                <STATICVARIABLES>
                    <SVCURRENTCOMPANY>Unique Lab Instrument</SVCURRENTCOMPANY>
                </STATICVARIABLES>
            </REQUESTDESC>
            <REQUESTDATA>
                <TALLYMESSAGE xmlns:UDF="TallyUDF">
                    <VOUCHER VCHTYPE="Sales" ACTION="Create" OBJVIEW="Invoice Voucher View">
                        <DATE>${date}</DATE>
                        <VOUCHERTYPENAME>Sales</VOUCHERTYPENAME>
                        <PARTYLEDGERNAME>${partyName}</PARTYLEDGERNAME>
                        <VOUCHERNUMBER>${voucherNumber}</VOUCHERNUMBER>
                        <PERSISTEDVIEW>Invoice Voucher View</PERSISTEDVIEW>
                        <FBTPAYMENTTYPE>Default</FBTPAYMENTTYPE>
                        ${inventoryEntries}
                        ${ledgerEntries}
                        <LEDGERENTRIES.LIST>
                            <LEDGERNAME>${partyName}</LEDGERNAME>
                            <ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>
                            <AMOUNT>-${totalAmount}</AMOUNT> 
                        </LEDGERENTRIES.LIST>
                    </VOUCHER>
                </TALLYMESSAGE>
            </REQUESTDATA>
        </IMPORTDATA>
    </BODY>
</ENVELOPE>`;

        const blob = new Blob([xmlContent], { type: 'application/xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `tally_invoice_${voucherNumber}.xml`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };


    return (
        <Box bg="white" p={{ base: 4, md: 6 }} borderRadius="2xl" boxShadow="sm" border="1px" borderColor="gray.100">
            <Flex justify="space-between" align={{ base: 'stretch', md: 'center' }} mb={8} direction={{ base: 'column', md: 'row' }} gap={4}>
                <Stack spacing={1}>
                    <Text fontSize={{ base: 'xl', md: '2xl' }} fontWeight="800" bgGradient="linear(to-r, brand.500, brand.700)" bgClip="text">
                        Enquiries & Quotations
                    </Text>
                    <Text fontSize="sm" color="gray.500">Respond to client requests and manage sales cycles.</Text>
                </Stack>
            </Flex>

            <Tabs colorScheme="brand" isLazy>
                <TabList>
                    <Tab fontWeight="bold">Incoming Enquiries</Tab>
                    <Tab fontWeight="bold">Outbound Quotations</Tab>
                    <Tab fontWeight="bold">Processed (History)</Tab>
                </TabList>

                <TabPanels>
                    <TabPanel p={0} pt={4}>
                        <Box overflowX="auto">
                            <Table variant="simple" minW="500px">
                                <Thead><Tr><Th>Date</Th><Th>Sender</Th><Th>Action</Th></Tr></Thead>
                                <Tbody>
                                    {enquiries.map(e => (
                                        <Tr key={e._id}>
                                            <Td fontSize="sm">
                                                <HStack>
                                                    {!e.isSeen && <Box w="8px" h="8px" bg="red.500" borderRadius="full" />}
                                                    <Text>{new Date(e.createdAt).toLocaleDateString('en-GB')}</Text>
                                                </HStack>
                                            </Td>
                                            <Td fontWeight="medium">{e.Name}</Td>
                                            <Td>
                                                <Button size="sm" onClick={() => handleViewEnquiry(e)}>View Details</Button>
                                            </Td>
                                        </Tr>
                                    ))}
                                    {enquiries.length === 0 && <Tr><Td colSpan={4}>No enquiries found.</Td></Tr>}
                                </Tbody>
                            </Table>
                        </Box>
                    </TabPanel>

                    <TabPanel p={0} pt={4}>
                        <Box overflowX="auto">
                            <Table variant="simple" minW="560px">
                                <Thead><Tr><Th>Date</Th><Th>Client</Th><Th>Status</Th><Th>Action</Th></Tr></Thead>
                                <Tbody>
                                    {quotations.map(q => (
                                        <Tr key={q._id}>
                                            <Td fontSize="sm">{new Date(q.createdAt).toLocaleDateString('en-GB')}</Td>
                                            <Td fontWeight="medium">{q.enquiryId?.Name || q.enquiry?.Name || 'Unknown'}</Td>
                                            <Td><Badge colorScheme="blue">{q.status}</Badge></Td>
                                            <Td>
                                                <HStack spacing={2}>
                                                    <Button size="xs" variant="outline" onClick={() => handleViewQuotation(q)}>View</Button>
                                                    <Button size="xs" colorScheme="green" onClick={() => handleStatusUpdate(q._id, 'Done')}>Done</Button>
                                                    <Button size="xs" colorScheme="red" onClick={() => handleStatusUpdate(q._id, 'Reject')}>Reject</Button>
                                                </HStack>
                                            </Td>
                                        </Tr>
                                    ))}
                                </Tbody>
                            </Table>
                        </Box>
                    </TabPanel>

                    <TabPanel p={0} pt={4}>
                        <Box overflowX="auto">
                            <Table variant="simple" minW="560px">
                                <Thead><Tr><Th>Date</Th><Th>Client</Th><Th>Status</Th><Th>Action</Th></Tr></Thead>
                                <Tbody>
                                    {processedQuotations.map(q => (
                                        <Tr key={q._id}>
                                            <Td fontSize="sm">{new Date(q.createdAt).toLocaleDateString('en-GB')}</Td>
                                            <Td fontWeight="medium">{q.enquiryId?.Name || q.enquiry?.Name || 'Unknown'}</Td>
                                            <Td><Badge colorScheme={q.status === 'Done' ? 'green' : 'red'}>{q.status}</Badge></Td>
                                            <Td>
                                                <Button size="sm" variant="outline" mr={2} onClick={() => handleViewQuotation(q)}>View Quote</Button>
                                                {q.status === 'Done' && (
                                                    <Button size="sm" colorScheme="purple" leftIcon={<FiDownload />} onClick={() => downloadTallyXML(q)}>Tally XML</Button>
                                                )}
                                            </Td>
                                        </Tr>
                                    ))}
                                    {processedQuotations.length === 0 && <Tr><Td colSpan={4}>No processed quotations.</Td></Tr>}
                                </Tbody>
                            </Table>
                        </Box>
                    </TabPanel>
                </TabPanels>
            </Tabs>

            {/* ENQUIRY DETAILS / CREATE QUOTE MODAL */}
            <Modal isOpen={!!selectedEnquiry} onClose={() => setSelectedEnquiry(null)} size={{ base: 'full', md: 'xl' }}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>
                        {isCreatingQuote ? 'Generate New Quotation' : 'Enquiry Details'}
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody pb={6}>
                        {selectedEnquiry && !isCreatingQuote && (
                            <VStack align="stretch" spacing={4}>
                                <Box bg="gray.50" p={4} borderRadius="md">
                                    <Text><strong>From:</strong> {selectedEnquiry.Name} ({selectedEnquiry.email})</Text>
                                    <Text><strong>Contact:</strong> {selectedEnquiry.phone}</Text>
                                    <Text mt={2}>{selectedEnquiry.message}</Text>
                                </Box>

                                <Text fontWeight="bold">Requested Products:</Text>
                                <Table size="sm" variant="simple">
                                    <Thead><Tr><Th>Image</Th><Th>Product</Th><Th isNumeric>Qty</Th></Tr></Thead>
                                    <Tbody>
                                        {(selectedEnquiry.products || []).map((p, i) => (
                                            <Tr key={i}>
                                                <Td>
                                                    <Image
                                                        src={getImageUrl(p.productId?.images?.[0] || p.productId?.photos?.[0] || p.productId?.image || p.product?.images?.[0] || p.product?.photos?.[0] || p.product?.image)}
                                                        boxSize="40px"
                                                        objectFit="cover"
                                                        borderRadius="md"
                                                        fallbackSrc="https://via.placeholder.com/50?text=No+Img"
                                                    />
                                                </Td>
                                                <Td>{p.productId?.name || p.productId?._id || 'Unknown'}</Td>
                                                <Td isNumeric>{p.quantity}</Td>
                                            </Tr>
                                        ))}
                                    </Tbody>
                                </Table>

                                <Flex justify="flex-end" pt={4}>
                                    {selectedEnquiry.status !== 'Processed' ? (
                                        <Button colorScheme="brand" onClick={initCreateQuote}>Create Quotation</Button>
                                    ) : (
                                        <Box textAlign="right">
                                            <Text color="green.500" fontStyle="italic" mb={2}>Quotation already sent.</Text>
                                            <Button size="sm" colorScheme="blue" variant="outline" onClick={initCreateQuote}>
                                                Create New / Update Quote
                                            </Button>
                                        </Box>
                                    )}
                                </Flex>
                            </VStack>
                        )}

                        {selectedEnquiry && isCreatingQuote && (
                            <VStack align="stretch" spacing={6}>
                                <Box border="1px solid" borderColor="gray.200" p={4} borderRadius="md" bg="blue.50">
                                    <Text fontWeight="bold" mb={3} color="brand.600">Party Details for Quotation</Text>
                                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                                        <FormControl>
                                            <FormLabel fontSize="xs" mb={1}>Party Name</FormLabel>
                                            <Input size="sm" bg="white" value={quotePartyName} onChange={(e) => setQuotePartyName(e.target.value)} />
                                        </FormControl>
                                        <FormControl>
                                            <FormLabel fontSize="xs" mb={1}>Mobile No</FormLabel>
                                            <Input size="sm" bg="white" value={quoteMobile} onChange={(e) => setQuoteMobile(e.target.value)} />
                                        </FormControl>
                                        <FormControl>
                                            <FormLabel fontSize="xs" mb={1}>Email</FormLabel>
                                            <Input size="sm" bg="white" value={quoteEmail} onChange={(e) => setQuoteEmail(e.target.value)} />
                                        </FormControl>
                                        <FormControl>
                                            <FormLabel fontSize="xs" mb={1}>Address</FormLabel>
                                            <Input size="sm" bg="white" value={quoteAddress} onChange={(e) => setQuoteAddress(e.target.value)} />
                                        </FormControl>
                                    </SimpleGrid>
                                </Box>

                                <Box>
                                    <Text fontWeight="bold" mb={3} color="brand.600">Products & Pricing</Text>
                                    {quoteItems.map((item, idx) => (
                                        <Box key={idx} border="1px" borderColor="gray.200" p={3} borderRadius="md">
                                            <HStack mb={2} spacing={3} justify="space-between">
                                                <HStack>
                                                    <Image
                                                        src={getImageUrl(item.productId?.images?.[0] || item.productId?.photos?.[0] || item.productId?.image || item.product?.images?.[0] || item.product?.photos?.[0] || item.product?.image)}
                                                        boxSize="40px"
                                                        objectFit="cover"
                                                        borderRadius="md"
                                                        fallbackSrc="https://via.placeholder.com/50?text=No+Img"
                                                    />
                                                    <Text fontWeight="bold" fontSize="sm">
                                                        {item.productId?.name || 'Product'} (Qty: {item.quantity})
                                                    </Text>
                                                </HStack>
                                                <Button size="sm" colorScheme="red" variant="ghost" onClick={() => handleRemoveItem(idx)}>
                                                    <FiTrash />
                                                </Button>
                                            </HStack>
                                            <Stack direction={{ base: 'column', md: 'row' }} spacing={3}>
                                                <FormControl isRequired>
                                                    <Flex justify="space-between" align="center" mb={1}>
                                                        <FormLabel fontSize="xs" mb={0}>Unit Price (₹)</FormLabel>
                                                        {isSuperAdmin && (
                                                            <Checkbox
                                                                size="sm"
                                                                colorScheme="brand"
                                                                isChecked={item.useDealerPrice}
                                                                onChange={(e) => {
                                                                    const isChecked = e.target.checked;
                                                                    const newItems = [...quoteItems];
                                                                    newItems[idx].useDealerPrice = isChecked;
                                                                    newItems[idx].price = isChecked ? newItems[idx].dealerPrice : newItems[idx].calculatedSellingPrice;
                                                                    setQuoteItems(newItems);
                                                                    calculateTotals(newItems, quoteDiscount);
                                                                }}
                                                            >
                                                                Use Dealer Price
                                                            </Checkbox>
                                                        )}
                                                    </Flex>
                                                    <Input
                                                        type="number"
                                                        value={item.price}
                                                        onChange={(e) => {
                                                            const val = parseFloat(e.target.value);
                                                            if (val < 0) return; // Prevent negative
                                                            handleItemChange(idx, 'price', e.target.value);
                                                        }}
                                                        onWheel={(e) => e.target.blur()} // Prevent scroll change
                                                        sx={{
                                                            '&::-webkit-inner-spin-button, &::-webkit-outer-spin-button': {
                                                                '-webkit-appearance': 'none',
                                                                margin: 0,
                                                            },
                                                            '&': {
                                                                '-moz-appearance': 'textfield',
                                                            },
                                                        }}
                                                        bg="white"
                                                    />
                                                    <Box mt={1} fontSize="10px" color="gray.500">
                                                        Sell: ₹{item.sellingPriceStart || 0} - {item.sellingPriceEnd > 0 ? `₹${item.sellingPriceEnd}` : 'N/A'}{isSuperAdmin ? ` | Dealer: ₹${item.dealerPrice || 0}` : ''}
                                                    </Box>
                                                </FormControl>
                                                <FormControl>
                                                    <FormLabel fontSize="xs">GST (%)</FormLabel>
                                                    <Input
                                                        type="number"
                                                        value={item.gst}
                                                        onChange={(e) => {
                                                            const val = parseFloat(e.target.value);
                                                            if (val < 0) return; // Prevent negative
                                                            handleItemChange(idx, 'gst', e.target.value);
                                                        }}
                                                        onWheel={(e) => e.target.blur()} // Prevent scroll change
                                                        sx={{
                                                            '&::-webkit-inner-spin-button, &::-webkit-outer-spin-button': {
                                                                '-webkit-appearance': 'none',
                                                                margin: 0,
                                                            },
                                                            '&': {
                                                                '-moz-appearance': 'textfield',
                                                            },
                                                        }}
                                                        bg="white"
                                                    />
                                                </FormControl>
                                                <Box alignSelf={{ base: 'flex-start', md: 'center' }}>
                                                    <Text fontSize="sm" fontWeight="bold" whiteSpace="nowrap">
                                                        Total: ₹{((parseFloat(item.price) || 0) * item.quantity).toLocaleString()}
                                                    </Text>
                                                </Box>
                                            </Stack>
                                        </Box>
                                    ))}
                                </Box>

                                <Divider />
                                <VStack align="flex-end">
                                    <Text>Subtotal: <strong>₹{quoteTotals.subtotal.toLocaleString()}</strong></Text>
                                    <Text>Total Tax: <strong>₹{quoteTotals.gst.toLocaleString()}</strong></Text>
                                    {parseFloat(quoteDiscount) > 0 && (
                                        <Text color="green.600">Discount: <strong>- ₹{parseFloat(quoteDiscount).toLocaleString()}</strong></Text>
                                    )}
                                    <Text fontSize="lg" color="brand.600">Grand Total: <strong>₹{quoteTotals.total.toLocaleString()}</strong></Text>
                                </VStack>

                                <Divider />
                                <Box>
                                    <Text fontWeight="bold" mb={2}>Quotation Notes (Yellow Bar):</Text>
                                    <Textarea
                                        fontSize="sm"
                                        placeholder="Enter notes (one per line)..."
                                        value={customNotes}
                                        onChange={(e) => setCustomNotes(e.target.value)}
                                    />
                                </Box>

                                <Box mt={4}>
                                    <Text fontWeight="bold" mb={3}>Terms & Conditions:</Text>
                                    <Stack spacing={2}>
                                        {policies.map(p => (
                                            <Flex key={p.id} align="center" gap={3} p={2} bg="gray.50" borderRadius="md">
                                                <Checkbox isChecked={p.isChecked} onChange={() => togglePolicy(p.id)} />
                                                <Box flex="1">
                                                    <Text fontSize="xs" fontWeight="bold">{p.label}</Text>
                                                    <Input
                                                        size="xs"
                                                        value={p.value}
                                                        onChange={(e) => {
                                                            const newPs = policies.map(item => item.id === p.id ? { ...item, value: e.target.value } : item);
                                                            setPolicies(newPs);
                                                        }}
                                                    />
                                                </Box>
                                                {p.id.startsWith('custom_') && (
                                                    <IconButton
                                                        size="xs"
                                                        icon={<FiTrash />}
                                                        colorScheme="red"
                                                        variant="ghost"
                                                        onClick={() => {
                                                            const newPs = policies.filter(item => item.id !== p.id);
                                                            setPolicies(newPs);
                                                        }}
                                                    />
                                                )}
                                            </Flex>
                                        ))}
                                    </Stack>

                                    <Box mt={4} border="1px dashed" borderColor="gray.300" p={3} borderRadius="md" bg="blue.50">
                                        <Text fontSize="xs" fontWeight="bold" mb={2}>Add Custom Policy (Will be set as Default):</Text>
                                        <Stack direction={{ base: 'column', md: 'row' }} spacing={2}>
                                            <Input size="sm" placeholder="Label (e.g. Warranty)" value={newPolicy.label} onChange={e => setNewPolicy({ ...newPolicy, label: e.target.value })} bg="white" />
                                            <Input size="sm" placeholder="Description..." value={newPolicy.value} onChange={e => setNewPolicy({ ...newPolicy, value: e.target.value })} bg="white" />
                                            <Button size="sm" colorScheme="blue" onClick={addCustomPolicy}>Add</Button>
                                        </Stack>
                                    </Box>
                                </Box>

                                <Divider />
                                <Box>
                                    <Text fontWeight="bold" mb={2}>Extra Charges & Discount:</Text>
                                    <SimpleGrid columns={2} spacing={4}>
                                        <FormControl>
                                            <FormLabel fontSize="xs">Packaging & Forwarding (₹)</FormLabel>
                                            <Input
                                                type="number"
                                                value={quoteTotals.packaging}
                                                onWheel={(e) => e.target.blur()}
                                                sx={{
                                                    '&::-webkit-inner-spin-button, &::-webkit-outer-spin-button': {
                                                        '-webkit-appearance': 'none',
                                                        margin: 0,
                                                    },
                                                    '&': {
                                                        '-moz-appearance': 'textfield',
                                                    },
                                                }}
                                                onChange={(e) => {
                                                    const valStr = e.target.value;
                                                    if (valStr === '') {
                                                        setQuoteTotals(prev => ({
                                                            ...prev,
                                                            packaging: '',
                                                            packagingGst: 0,
                                                            gst: prev.productGst,
                                                            total: prev.subtotal + prev.productGst - (parseFloat(quoteDiscount) || 0)
                                                        }));
                                                        return;
                                                    }
                                                    if (parseFloat(valStr) < 0) return;
                                                    const val = parseFloat(valStr);
                                                    const disc = parseFloat(quoteDiscount) || 0;
                                                    setQuoteTotals(prev => {
                                                        const sub = prev.subtotal || 0;
                                                        const productGst = prev.productGst || 0;
                                                        const packGst = val * 0.18;
                                                        const totalGst = productGst + packGst;
                                                        const grand = sub + val + totalGst - disc;
                                                        return {
                                                            ...prev,
                                                            packaging: val,
                                                            packagingGst: packGst,
                                                            gst: totalGst,
                                                            total: grand
                                                        };
                                                    });
                                                }}
                                            />
                                        </FormControl>
                                        <FormControl>
                                            <FormLabel fontSize="xs">Discount (₹)</FormLabel>
                                            <Input
                                                type="number"
                                                value={quoteDiscount}
                                                placeholder="0"
                                                onWheel={(e) => e.target.blur()}
                                                sx={{
                                                    '&::-webkit-inner-spin-button, &::-webkit-outer-spin-button': {
                                                        '-webkit-appearance': 'none',
                                                        margin: 0,
                                                    },
                                                    '&': {
                                                        '-moz-appearance': 'textfield',
                                                    },
                                                }}
                                                onChange={(e) => {
                                                    const valStr = e.target.value;
                                                    if (valStr === '') {
                                                        setQuoteDiscount('');
                                                        setQuoteTotals(prev => ({
                                                            ...prev,
                                                            total: prev.subtotal + (prev.packaging || 0) + prev.gst
                                                        }));
                                                        return;
                                                    }
                                                    if (parseFloat(valStr) < 0) return;
                                                    const disc = parseFloat(valStr);
                                                    setQuoteDiscount(disc);
                                                    setQuoteTotals(prev => ({
                                                        ...prev,
                                                        total: prev.subtotal + (prev.packaging || 0) + prev.gst - disc
                                                    }));
                                                }}
                                            />
                                        </FormControl>
                                    </SimpleGrid>
                                </Box>
                            </VStack>
                        )}
                    </ModalBody>
                    <ModalFooter>
                        {isCreatingQuote ? (
                            <>
                                <Button variant="ghost" mr={3} onClick={() => setIsCreatingQuote(false)}>Back</Button>
                                <Button colorScheme="green" onClick={submitQuote} isLoading={isSubmittingQuote} loadingText="Sending...">Send Quotation</Button>
                            </>
                        ) : (
                            <Button onClick={() => setSelectedEnquiry(null)}>Close</Button>
                        )}
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* QUOTE VIEW MODAL */}
            <Modal isOpen={!!selectedQuotation} onClose={() => setSelectedQuotation(null)} size={{ base: 'full', md: '4xl' }}>
                <ModalOverlay />
                <ModalContent bg="gray.100">
                    <ModalHeader>
                        <Flex justify="space-between" align="center" pr={8}>
                            <Text>Quotation Preview</Text>
                            <Button
                                size="sm"
                                leftIcon={<FiPrinter />}
                                colorScheme="blue"
                                onClick={() => {
                                    const win = window.open('', '_blank');
                                    win.document.write(`<html><head><style>@media print{button{display:none}}</style></head><body>`);
                                    win.document.write(selectedQuotation.htmlContent);
                                    win.document.write('</body></html>');
                                    win.document.close();
                                    win.print();
                                }}
                            >
                                Print Quotation
                            </Button>
                        </Flex>
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody pb={8}>
                        {selectedQuotation && (
                            <Box
                                bg="white"
                                p={4}
                                boxShadow="xl"
                                mx="auto"
                                dangerouslySetInnerHTML={{ __html: selectedQuotation.htmlContent }}
                            />
                        )}
                        {!selectedQuotation?.htmlContent && (
                            <Box textAlign="center" py={10} bg="white">
                                <Text>This is an old quotation without high-fidelity HTML content.</Text>
                                <Divider my={4} />
                                <VStack align="stretch" spacing={3} p={4}>
                                    <Text><strong>ID:</strong> {selectedQuotation?._id}</Text>
                                    <Text><strong>Client:</strong> {selectedQuotation?.enquiryId?.Name || selectedQuotation?.enquiry?.Name}</Text>
                                    <Divider />
                                    <Table size="sm">
                                        <Thead><Tr><Th>Image</Th><Th>Item</Th><Th isNumeric>Price</Th><Th isNumeric>Qty</Th><Th isNumeric>Total</Th></Tr></Thead>
                                        <Tbody>
                                            {(selectedQuotation?.items || []).map((item, i) => (
                                                <Tr key={i}>
                                                    <Td>
                                                        <Image
                                                            src={getImageUrl(item.product?.images?.[0] || item.product?.photos?.[0] || item.product?.image || item.productId?.images?.[0] || item.productId?.image)}
                                                            boxSize="30px"
                                                            objectFit="cover"
                                                            borderRadius="md"
                                                        />
                                                    </Td>
                                                    <Td>{item.product?.name || item.productId?.name || 'Item'}</Td>
                                                    <Td isNumeric>{item.price}</Td>
                                                    <Td isNumeric>{item.quantity}</Td>
                                                    <Td isNumeric>{(item.amount || 0).toLocaleString()}</Td>
                                                </Tr>
                                            ))}
                                        </Tbody>
                                    </Table>
                                    <Divider />
                                    <Flex justify="space-between" fontWeight="bold" fontSize="lg">
                                        <Text>Total Amount</Text>
                                        <Text>₹{(selectedQuotation?.totalAmount || 0).toLocaleString()}</Text>
                                    </Flex>
                                </VStack>
                            </Box>
                        )}
                    </ModalBody>
                    <ModalFooter>
                        <Button onClick={() => setSelectedQuotation(null)}>Close</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal >
        </Box >
    );
};

export default AdminEnquiries;
