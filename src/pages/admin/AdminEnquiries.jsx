import React, { useState, useEffect } from 'react';
import { Box, Table, Thead, Tbody, Tr, Th, Td, Badge, Button, useToast, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton, Text, Tabs, TabList, TabPanels, Tab, TabPanel, Input, FormControl, FormLabel, Flex, VStack, HStack, Divider, NumberInput, NumberInputField, Image, Textarea, Checkbox, Stack, IconButton, SimpleGrid, useDisclosure, Select, InputGroup, InputLeftElement, Spinner, Heading, Tooltip, Tag, TagLabel, TagLeftIcon, Avatar, AvatarBadge } from '@chakra-ui/react';
import { FiPlus, FiPrinter, FiTrash, FiDownload, FiSearch, FiCheck, FiX, FiEye, FiEdit, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { FaWhatsapp, FaChevronLeft, FaClock, FaBell, FaHistory, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import api from '../../api/axios';
import { DEMO_ENQUIRIES, DEMO_QUOTATIONS } from '../../data/mockData';
import ModulePermissionBar from '../../components/admin/ModulePermissionBar';
import { hasPermission } from '../../utils/permissions';



const AdminEnquiries = () => {
    const [enquiries, setEnquiries] = useState([]);
    const [quotations, setQuotations] = useState([]); // Active (Sent/Pending)
    const [processedQuotations, setProcessedQuotations] = useState([]); // Done/Rejected
    const [selectedEnquiry, setSelectedEnquiry] = useState(null);
    const [selectedQuotation, setSelectedQuotation] = useState(null);
    const [sendingWhatsappId, setSendingWhatsappId] = useState(null);
    const [allProducts, setAllProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Search & Pagination States
    const [enquirySearch, setEnquirySearch] = useState('');
    const [activeSearch, setActiveSearch] = useState('');
    const [historySearch, setHistorySearch] = useState('');
    const [whatsappSearch, setWhatsappSearch] = useState('');

    const [enquiryPage, setEnquiryPage] = useState(1);
    const [activePage, setActivePage] = useState(1);
    const [historyPage, setHistoryPage] = useState(1);
    const [whatsappPage, setWhatsappPage] = useState(1);
    const ITEMS_PER_PAGE = 20;

    // Status Confirmation State
    const { isOpen: isStatusConfirmOpen, onOpen: onStatusConfirmOpen, onClose: onStatusConfirmClose } = useDisclosure();
    const [statusConfirmData, setStatusConfirmData] = useState({ id: null, status: '' });

    // Delete Confirmation State
    const { isOpen: isDeleteConfirmOpen, onOpen: onDeleteConfirmOpen, onClose: onDeleteConfirmClose } = useDisclosure();
    const [deleteTarget, setDeleteTarget] = useState({ type: '', id: null });
    const [isDeleting, setIsDeleting] = useState(false);

    // ── Unified Follow-up Modal State (history + add form combined) ──────────
    const { isOpen: isFollowUpOpen, onOpen: onFollowUpOpen, onClose: onFollowUpClose } = useDisclosure();
    const [followUpTarget, setFollowUpTarget] = useState(null); // The quotation/enquiry being followed up / viewed
    const [followUpTargetType, setFollowUpTargetType] = useState('quotation'); // 'quotation' | 'enquiry'
    const [followUpForm, setFollowUpForm] = useState({
        remark: '',
        nextFollowUpDate: ''
    });
    const [isSubmittingFollowUp, setIsSubmittingFollowUp] = useState(false);

    // Legacy refs kept for backward compat — unified modal handles both
    const isHistoryOpen = false;
    const onHistoryClose = () => {};
    const historyTarget = null;

    const getImageUrl = (path) => {
        if (!path) return 'https://via.placeholder.com/150';
        if (path.startsWith('http')) return path;
        const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
        return `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
    };

    // Quote Creation State
    const [isCreatingQuote, setIsCreatingQuote] = useState(false);
    const [isGlobalDealerPrice, setIsGlobalDealerPrice] = useState(false);
    const [quoteItems, setQuoteItems] = useState([]);
    const [quoteDiscount, setQuoteDiscount] = useState(0);
    const [quoteTotals, setQuoteTotals] = useState({ subtotal: 0, productGst: 0, gst: 0, total: 0, packaging: 0, packagingGst: 0 });
    const [isSubmittingQuote, setIsSubmittingQuote] = useState(false);

    // Custom Party Details
    const [quotePartyName, setQuotePartyName] = useState('');
    const [quoteContactPerson, setQuoteContactPerson] = useState('');
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
    
    // Product Picker Modal State
    const { isOpen: isPickerOpen, onOpen: onPickerOpen, onClose: onPickerClose } = useDisclosure();
    const [pickerCategory, setPickerCategory] = useState(null);
    const [pickerSearch, setPickerSearch] = useState('');

    const PRODUCT_CATEGORIES = [
        { id: "CEMENT,CONCRETE & AGGREGAT TESTING EQUIPMENT", title: "Cement, Concrete & Aggregate" },
        { id: "SOIL TESTING EQUIPMENT", title: "Soil Testing Equipment" },
        { id: "BITUMIN TESTING EQUPMENT", title: "Bitumen Testing Equipment" },
        { id: "Construction Machinery", title: "Construction Machinery" },
        { id: "SURVEY & MEASURING INSTRUMENT", title: "Survey & Measuring Instruments" },
        { id: "SAFETY PRODUCTS", title: "Safety Products" }
    ];

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const isSuperAdmin = user.isSuperAdmin || user.email === 'iatulkanak@gmail.com';
    const canShowDealerPrice = hasPermission(user, 'showDealerPrice', 'read');


    const toast = useToast();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [enqRes, quoteRes, prodRes] = await Promise.all([
                api.get('/enquiries'),
                api.get('/quotations'),
                api.get('/products')
            ]);

            // Normalize Products
            const prods = (Array.isArray(prodRes.data) ? prodRes.data : (prodRes.data.data || []));
            setAllProducts(prods);

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
        } finally {
            setLoading(false);
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

    const handleStatusUpdate = (type, id, status) => {
        setStatusConfirmData({ type, id, status });
        onStatusConfirmOpen();
    };

    const confirmStatusUpdate = async () => {
        const { type, id, status } = statusConfirmData;
        try {
            const endpoint = type === 'enquiry' ? `/enquiries/${id}` : `/quotations/${id}`;
            await api.put(endpoint, { status });
            toast({ 
                title: `Success`, 
                description: `Quotation has been moved to ${status} status.`, 
                status: "success",
                duration: 3000,
                isClosable: true
            });
            onStatusConfirmClose();
            fetchData();
        } catch (error) {
            console.error("Status update failed", error);
            toast({ title: "Failed to update status", status: "error" });
        }
    };

    const handleDeleteRequest = (type, id) => {
        setDeleteTarget({ type, id });
        onDeleteConfirmOpen();
    };

    const confirmDelete = async () => {
        const { type, id } = deleteTarget;
        setIsDeleting(true);
        try {
            const endpoint = type === 'enquiry' ? `/enquiries/${id}` : `/quotations/${id}`;
            await api.delete(endpoint);
            toast({ 
                title: "Deleted!", 
                description: `${type.charAt(0).toUpperCase() + type.slice(1)} has been removed.`, 
                status: "success" 
            });
            onDeleteConfirmClose();
            fetchData();
        } catch (error) {
            console.error("Delete failed", error);
            toast({ title: "Failed to delete", status: "error" });
        } finally {
            setIsDeleting(false);
        }
    };

    const handleViewQuotation = (quote) => {
        setSelectedQuotation(quote);
    };

    // ── Open Unified Follow-up Modal (history + form) ────────────────────────
    const handleOpenFollowUp = (target, type = 'quotation') => {
        setFollowUpTarget(target);
        setFollowUpTargetType(type);
        // Default next follow-up date = today + 2 days
        const defaultDate = new Date();
        defaultDate.setDate(defaultDate.getDate() + 2);
        setFollowUpForm({
            remark: '',
            nextFollowUpDate: defaultDate.toISOString().split('T')[0]
        });
        onFollowUpOpen();
    };

    // ── Submit Follow-up ─────────────────────────────────────────────────────
    const handleSubmitFollowUp = async () => {
        if (!followUpForm.remark.trim()) {
            toast({ title: 'Please enter a remark', status: 'warning' });
            return;
        }
        if (!followUpForm.nextFollowUpDate) {
            toast({ title: 'Please select the next follow-up date', status: 'warning' });
            return;
        }
        setIsSubmittingFollowUp(true);
        try {
            const userString = sessionStorage.getItem('user') || localStorage.getItem('user') || '{}';
            const user = JSON.parse(userString);
            // Extract the most readable name possible
            let addedBy = user.name || user.contactPersonName || user.companyName;
            if (!addedBy && user.email) {
                // If no name fields exist, use the email prefix (e.g. iatulkanak@gmail.com -> iatulkanak)
                addedBy = user.email.split('@')[0];
            }
            if (!addedBy) addedBy = 'Admin';

            const url = followUpTargetType === 'enquiry'
                ? `/enquiries/${followUpTarget._id}/follow-up`
                : `/quotations/${followUpTarget._id}/follow-up`;

            await api.post(url, {
                remark: followUpForm.remark.trim(),
                nextFollowUpDate: followUpForm.nextFollowUpDate,
                addedBy,
                newStatus: followUpForm.newStatus || undefined
            });
            toast({
                title: '✅ Follow-up Added!',
                description: `Next follow-up set for ${new Date(followUpForm.nextFollowUpDate).toLocaleDateString('en-GB')}`,
                status: 'success',
                duration: 4000
            });
            onFollowUpClose();
            fetchData(); // Refresh quotations
        } catch (err) {
            toast({ title: err.response?.data?.msg || 'Failed to add follow-up', status: 'error' });
        } finally {
            setIsSubmittingFollowUp(false);
        }
    };

    // Legacy stub — no longer opens a separate modal, unified modal handles history
    const handleOpenHistory = (quotation) => {
        handleOpenFollowUp(quotation);
    };

    const initCreateQuote = () => {
        if (!selectedEnquiry) return;
        setIsCreatingQuote(true);
        setIsSubmittingQuote(false);
        setIsGlobalDealerPrice(false);

        // --- Find last quotation to copy previous prices ---
        const allEnqQuotes = [...quotations, ...processedQuotations]
            .filter(q => q.enquiry?._id === selectedEnquiry._id)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        const lastQuote = allEnqQuotes.length > 0 ? allEnqQuotes[0] : null;

        // Initialize custom party details - Don't pre-fill 'Guest' if that's the default name
        const initialName = (selectedEnquiry.Name === 'Guest' || !selectedEnquiry.Name) ? '' : selectedEnquiry.Name;
        const initialCompanyName = (selectedEnquiry.companyName === 'Guest' || !selectedEnquiry.companyName) ? '' : selectedEnquiry.companyName;

        setQuotePartyName(initialCompanyName || initialName || '');
        setQuoteContactPerson(selectedEnquiry.contactPersonName || '');
        setQuoteEmail(selectedEnquiry.email && selectedEnquiry.email !== 'N/A' ? selectedEnquiry.email : '');
        setQuoteMobile(selectedEnquiry.phone && selectedEnquiry.phone !== 'N/A' ? selectedEnquiry.phone : '');
        setQuoteAddress(''); // Start empty

        // Initialize items
        let initialItems = [];

        if (lastQuote) {
            // If updating, take everything from the last quote as the base
            initialItems = lastQuote.items.map(i => {
                const product = i.product || i.productId || {};
                const endPrice = parseFloat(product.sellingPriceEnd) || 0;
                const startPrice = parseFloat(product.sellingPriceStart) || 0;
                const dealerPrice = parseFloat(product.dealerPrice) || 0;

                return {
                    productId: product,
                    quantity: i.quantity || 1,
                    price: i.price || 0,
                    gst: i.gst || 18,
                    dealerPrice: dealerPrice,
                    sellingPriceStart: startPrice,
                    sellingPriceEnd: endPrice,
                    calculatedSellingPrice: i.price || 0,
                    size: i.size || '',
                    selectedSizes: Array.isArray(i.selectedSizes) ? i.selectedSizes : []
                };
            });

            // Also check if any items from the enquiry are NOT in the last quote (unlikely but possible)
            (selectedEnquiry.products || []).forEach(p => {
                const pId = p.productId?._id || p.productId;
                const alreadyIn = initialItems.some(ii => (ii.productId?._id || ii.productId) === pId);
                if (!alreadyIn) {
                    const product = p.productId || {};
                    initialItems.push({
                        productId: product,
                        quantity: p.quantity || 1,
                        price: parseFloat(product.sellingPriceEnd) || parseFloat(product.sellingPriceStart) || 0,
                        gst: 18,
                        dealerPrice: parseFloat(product.dealerPrice) || 0,
                        sellingPriceStart: parseFloat(product.sellingPriceStart) || 0,
                        sellingPriceEnd: parseFloat(product.sellingPriceEnd) || 0,
                        calculatedSellingPrice: parseFloat(product.sellingPriceEnd) || parseFloat(product.sellingPriceStart) || 0
                    });
                }
            });
        } else {
            // First time creating quote - use enquiry products
            initialItems = (selectedEnquiry.products || []).map(p => {
                const product = p.productId || {};
                const endPrice = parseFloat(product.sellingPriceEnd) || 0;
                const startPrice = parseFloat(product.sellingPriceStart) || 0;
                const dealerPrice = parseFloat(product.dealerPrice) || 0;

                let defaultPrice = endPrice > 0 ? endPrice : (startPrice > 0 ? startPrice : 0);

                return {
                    productId: product,
                    quantity: p.quantity || 1,
                    price: defaultPrice,
                    gst: 18,
                    dealerPrice: dealerPrice,
                    sellingPriceStart: startPrice,
                    sellingPriceEnd: endPrice,
                    calculatedSellingPrice: defaultPrice,
                    size: p.size || '',
                    selectedSizes: Array.isArray(p.selectedSizes) ? p.selectedSizes : []
                };
            });
        }
        
        const prevDiscount = lastQuote ? (lastQuote.discount || 0) : 0;
        setQuoteItems(initialItems);
        setQuoteDiscount(prevDiscount);
        
        // Pass packaging if we want it too
        calculateTotals(initialItems, prevDiscount, lastQuote?.packaging || 0);
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

    const handleAddNewItem = (productId) => {
        if (!productId) return;
        const product = allProducts.find(p => p._id === productId || p.id === productId);
        if (!product) return;

        // Check if already in quoteItems
        if (quoteItems.some(i => (i.productId?._id || i.productId) === productId)) {
            toast({ title: "Product already in list", status: "warning" });
            return;
        }

        const endPrice = parseFloat(product.sellingPriceEnd);
        const startPrice = parseFloat(product.sellingPriceStart);
        const dealerPrice = parseFloat(product.dealerPrice) || 0;

        let defaultPrice = 0;
        if (!isNaN(endPrice) && endPrice > 0) defaultPrice = endPrice;
        else if (!isNaN(startPrice) && startPrice > 0) defaultPrice = startPrice;

        const newItem = {
            productId: product,
            quantity: 1,
            price: defaultPrice,
            gst: 18,
            dealerPrice: dealerPrice,
            sellingPriceStart: startPrice || 0,
            sellingPriceEnd: endPrice || 0,
            calculatedSellingPrice: defaultPrice,
            size: (Array.isArray(product.sizes) && product.sizes.length > 0) ? product.sizes[0].size : ''
        };

        const updatedItems = [...quoteItems, newItem];
        setQuoteItems(updatedItems);
        calculateTotals(updatedItems, quoteDiscount);
    };

    const calculateTotals = (items, discount, packagingOverride) => {
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
            const packaging = packagingOverride !== undefined ? packagingOverride : (prev.packaging || 0);
            const packagingGst = packaging * 0.18;
            const totalGst = gstAmt + packagingGst;
            const disc = parseFloat(discount !== undefined ? discount : quoteDiscount) || 0;
            const grandTotal = sub + packaging + totalGst - disc;

            return {
                ...prev,
                subtotal: sub,
                productGst: gstAmt,
                gst: totalGst,
                packaging: packaging,
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

    const generateHTML = (enquiry, items, totals, selectedPolicies, notes, refNo, discount, partyName, address, mobile, email, contactPerson) => {
        const date = new Date().toLocaleDateString('en-GB');

        const productRows = items.map((item, index) => {
            const product = item.productId;
            const specs = product?.details ? Object.entries(product.details).map(([k, v]) => `${k} :- ${v}`).join('<br/>') : '';
            const imgPath = product?.images?.[0] || product?.photos?.[0] || product?.image;
            const imgUrl = getImageUrl(imgPath);
            const price = parseFloat(item.price) || 0;
            const quantity = parseFloat(item.quantity) || 0;
            const total = price * quantity;

            let sizeHtml = '';
            if (Array.isArray(item.selectedSizes) && item.selectedSizes.length > 0) {
                sizeHtml = item.selectedSizes.map(s => `<div style="color: #6b21a8; font-weight: bold; font-size: 12px; margin-top: 3px; line-height: 1.3;">• Size: ${s.size} &nbsp;&nbsp;(Qty: ${s.quantity || 1})</div>`).join('');
            } else if (item.size) {
                sizeHtml = `<div style="color: #6b21a8; font-weight: bold; font-size: 12px; margin-top: 3px; line-height: 1.3;">• Size: ${item.size}</div>`;
            }

            return `
                <tr>
                    <td style="border: 1px solid black; text-align: center; vertical-align: middle;">${index + 1}</td>
                    <td style="border: 1px solid black; padding: 5px;">
                        <div style="display: flex; gap: 15px;">
                            <div style="width: 150px; height: 150px; min-width: 150px; display: flex; align-items: center; justify-content: center; background: #fff; border: 1px solid #eee; border-radius: 4px; overflow: hidden;">
                                <img src="${imgUrl}" style="max-width: 100%; max-height: 100%; object-fit: contain;" />
                            </div>
                            <div style="flex: 1;">
                                <strong style="text-decoration: underline;">${product?.name || 'Product'}</strong>
                                ${sizeHtml}
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

        const isRevised = displayRefNo.includes('(R');
        // Quotation Title
        const quoteTitle = isRevised ? 'Revised Quotation' : 'Quotation';

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
                        <strong>M/s. ${partyName || ''}</strong><br/>
                        ${contactPerson ? `Contact Person : ${contactPerson}<br/>` : ''}<br/>
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
                <div style="text-align: center; font-weight: bold; font-size: 18px; margin-top: 5px;">${quoteTitle}</div>
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
                            <img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&amp;data=upi://pay?pa=pos.5345756@indus&amp;pn=UNIQUE%20LAB%20INSTRUMENT" alt="Scan to Pay" style="width: 100px; height: 100px; border: 1px solid #ccc; padding: 5px;" />
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
            quotePartyName, quoteAddress, quoteMobile, quoteEmail, quoteContactPerson
        );

        const payload = {
            enquiryId: selectedEnquiry._id,
            partyName: quotePartyName,
            contactPerson: quoteContactPerson,
            email: quoteEmail,
            phone: quoteMobile,
            address: quoteAddress,
            items: quoteItems.map(i => {
                const pPrice = parseFloat(i.price) || 0;
                const pQuantity = parseFloat(i.quantity) || 0;
                const pGst = parseFloat(i.gst) || 0;
                return {
                    product: i.productId._id || i.productId,
                    quantity: pQuantity,
                    price: pPrice,
                    gst: pGst,
                    amount: (pPrice * pQuantity),
                    size: i.size || '',
                    selectedSizes: i.selectedSizes || []
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
                    quotePartyName, quoteAddress, quoteMobile, quoteEmail, quoteContactPerson
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

    const handleSendWhatsApp = async (q) => {
        const phoneNumber = q.mobile || q.enquiryId?.phone || q.enquiry?.phone;
        if (!phoneNumber || phoneNumber.replace(/\D/g, '').length < 10) {
             return toast({ title: "No valid 10-digit phone number found", status: "warning" });
        }
        setSendingWhatsappId(q._id);
        try {
            const clientName = q.partyName || q.enquiryId?.Name || q.enquiry?.Name || 'Client';
            const message = `Hello *${clientName}*,\n\nHere is your *Quotation* from *Uni-BC*.\n\n*Reference:* ${q.refNo || 'N/A'}\n*Date:* ${new Date(q.createdAt).toLocaleDateString('en-GB')}\n*Grand Total:* ₹${q.grandTotal || '0'}\n\nThank you!`;
            
            await api.post('/whatsapp/send-quotation', {
                quotationId: q._id,
                phone: phoneNumber,
                message: message
            });
            toast({ title: "Quotation sent on WhatsApp!", status: "success" });
        } catch (e) {
            console.error(e);
            toast({ title: "Failed to send", status: "error" });
        } finally {
            setSendingWhatsappId(null);
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


    const baseEnquiries = enquiries.filter(e => e.type !== 'whatsapp');
    const baseWhatsappLogs = enquiries.filter(e => e.type === 'whatsapp');

    const filteredEnquiries = baseEnquiries.filter(e => {
        const term = enquirySearch.toLowerCase();
        return (e.Name || '').toLowerCase().includes(term) ||
               (e.email || '').toLowerCase().includes(term) ||
               (e.phone || '').toLowerCase().includes(term);
    });

    const filteredWhatsappLogs = baseWhatsappLogs.filter(e => {
        const term = whatsappSearch.toLowerCase();
        return (e.Name || '').toLowerCase().includes(term) ||
               (e.phone || '').toLowerCase().includes(term);
    });

    const filteredQuotations = quotations.filter(q => {
        const term = activeSearch.toLowerCase();
        const clientName = q.partyName || q.enquiryId?.Name || q.enquiry?.Name || '';
        const refNo = q.refNo || '';
        return clientName.toLowerCase().includes(term) || refNo.toLowerCase().includes(term);
    });

    const filteredHistory = processedQuotations.filter(q => {
        const term = historySearch.toLowerCase();
        const clientName = q.partyName || q.enquiryId?.Name || q.enquiry?.Name || '';
        const refNo = q.refNo || '';
        return clientName.toLowerCase().includes(term) || refNo.toLowerCase().includes(term);
    });

    const paginatedEnquiries = filteredEnquiries.slice((enquiryPage - 1) * ITEMS_PER_PAGE, enquiryPage * ITEMS_PER_PAGE);
    const paginatedQuotations = filteredQuotations.slice((activePage - 1) * ITEMS_PER_PAGE, activePage * ITEMS_PER_PAGE);
    const paginatedHistory = filteredHistory.slice((historyPage - 1) * ITEMS_PER_PAGE, historyPage * ITEMS_PER_PAGE);
    const paginatedWhatsappLogs = filteredWhatsappLogs.slice((whatsappPage - 1) * ITEMS_PER_PAGE, whatsappPage * ITEMS_PER_PAGE);

    const PaginationControls = ({ currentPage, totalItems, onPageChange }) => {
        const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
        if (totalPages <= 1) return null;

        const startItem = (currentPage - 1) * ITEMS_PER_PAGE + 1;
        const endItem = Math.min(currentPage * ITEMS_PER_PAGE, totalItems);

        const getPageNumbers = () => {
            const pages = [];
            const maxPagesToShow = 5;
            let startPage = Math.max(1, currentPage - 2);
            let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

            if (endPage - startPage < maxPagesToShow - 1) {
                startPage = Math.max(1, endPage - maxPagesToShow + 1);
            }

            for (let i = startPage; i <= endPage; i++) {
                pages.push(i);
            }
            return pages;
        };

        return (
            <Flex justify="space-between" align="center" mt={4} pt={4} borderTop="1px" borderColor="gray.100" wrap="wrap" gap={3}>
                <Text fontSize="xs" color="gray.500" fontWeight="600">
                    Showing <Text as="span" color="gray.800" fontWeight="bold">{startItem}</Text> to <Text as="span" color="gray.800" fontWeight="bold">{endItem}</Text> of <Text as="span" color="brand.600" fontWeight="bold">{totalItems}</Text> entries
                </Text>
                <HStack spacing={1}>
                    <Button
                        size="xs"
                        variant="outline"
                        isDisabled={currentPage === 1}
                        onClick={() => onPageChange(currentPage - 1)}
                        borderRadius="md"
                        px={2}
                    >
                        <FiChevronLeft style={{ marginRight: 2 }} /> Prev
                    </Button>
                    {getPageNumbers().map(p => (
                        <Button
                            key={p}
                            size="xs"
                            colorScheme={p === currentPage ? 'brand' : 'gray'}
                            variant={p === currentPage ? 'solid' : 'ghost'}
                            onClick={() => onPageChange(p)}
                            borderRadius="md"
                            minW="28px"
                            fontWeight={p === currentPage ? 'bold' : 'normal'}
                        >
                            {p}
                        </Button>
                    ))}
                    <Button
                        size="xs"
                        variant="outline"
                        isDisabled={currentPage === totalPages}
                        onClick={() => onPageChange(currentPage + 1)}
                        borderRadius="md"
                        px={2}
                    >
                        Next <FiChevronRight style={{ marginLeft: 2 }} />
                    </Button>
                </HStack>
            </Flex>
        );
    };

    return (
        <Box bg="white" p={{ base: 4, md: 6 }} borderRadius="2xl" boxShadow="sm" border="1px" borderColor="gray.100">
            <ModulePermissionBar moduleGroupKey="enquiriesGroup" />
            <Flex justify="space-between" align={{ base: 'stretch', md: 'center' }} mb={8} direction={{ base: 'column', md: 'row' }} gap={4}>
                <Stack spacing={1}>
                    <Text fontSize={{ base: 'xl', md: '2xl' }} fontWeight="800" bgGradient="linear(to-r, brand.500, brand.700)" bgClip="text">
                        Enquiries & Quotations
                    </Text>
                    <Text fontSize="sm" color="gray.500">Respond to client requests and manage sales cycles.</Text>
                </Stack>
            </Flex>

            {/* Stat Cards */}
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={5} mb={8}>
                <Box p={5} bg="blue.50" borderRadius="2xl" border="1px" borderColor="blue.100">
                    <VStack align="start" spacing={1}>
                        <Text fontSize="sm" color="blue.600" fontWeight="bold" textTransform="uppercase">New Enquiries</Text>
                        <Heading size="xl" color="blue.800">{enquiries.filter(e => !e.isSeen).length}</Heading>
                        <Text fontSize="xs" color="blue.500">Unseen client requests in inbox</Text>
                    </VStack>
                </Box>
                <Box p={5} bg="orange.50" borderRadius="2xl" border="1px" borderColor="orange.100">
                    <VStack align="start" spacing={1}>
                        <Text fontSize="sm" color="orange.600" fontWeight="bold" textTransform="uppercase">Active Quotations</Text>
                        <Heading size="xl" color="orange.800">{quotations.length}</Heading>
                        <Text fontSize="xs" color="orange.500">Sent quotes awaiting client decision</Text>
                    </VStack>
                </Box>
                <Box p={5} bg="green.50" borderRadius="2xl" border="1px" borderColor="green.100">
                    <VStack align="start" spacing={1}>
                        <Text fontSize="sm" color="green.600" fontWeight="bold" textTransform="uppercase">Successful Sales</Text>
                        <Heading size="xl" color="green.800">{processedQuotations.filter(q => q.status === 'Done').length}</Heading>
                        <Text fontSize="xs" color="green.500">Approved orders synced with billing</Text>
                    </VStack>
                </Box>
            </SimpleGrid>

            <Tabs colorScheme="brand" isLazy>
                <TabList>
                    <Tab fontWeight="bold">
                        Incoming Enquiries
                        {baseEnquiries.some(e => !e.isSeen) && (
                            <Badge ml={2} colorScheme="red" borderRadius="full">NEW</Badge>
                        )}
                    </Tab>
                    <Tab fontWeight="bold">Outbound Quotations</Tab>
                    <Tab fontWeight="bold">Processed (History)</Tab>
                    <Tab fontWeight="bold" color="green.600">
                        <HStack spacing={1}>
                            <FaWhatsapp />
                            <Text>WhatsApp Logs</Text>
                        </HStack>
                    </Tab>
                </TabList>

                {loading ? (
                    <Flex justify="center" align="center" py={20}>
                        <Spinner size="xl" color="brand.500" thickness="4px" />
                    </Flex>
                ) : (
                <TabPanels>
                    <TabPanel p={0} pt={4}>
                        <Flex justify="space-between" mb={4} align="center">
                            <InputGroup maxW="350px" size="sm">
                                <InputLeftElement pointerEvents="none">
                                    <FiSearch color="gray.400" />
                                </InputLeftElement>
                                <Input 
                                    placeholder="Search by sender name or contact..." 
                                    borderRadius="xl"
                                    value={enquirySearch}
                                    onChange={(e) => {
                                        setEnquirySearch(e.target.value);
                                        setEnquiryPage(1);
                                    }}
                                />
                            </InputGroup>
                        </Flex>
                        <Box overflowX="auto" border="1px" borderColor="gray.100" borderRadius="xl">
                            <Table variant="simple" minW="500px">
                                <Thead bg="gray.50">
                                    <Tr>
                                        <Th>Date</Th>
                                        <Th>Sender</Th>
                                        <Th>Requested Items</Th>
                                        <Th textAlign="right">Action</Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    {paginatedEnquiries.map(e => (
                                        <Tr key={e._id} _hover={{ bg: "gray.50" }}>
                                            <Td fontSize="sm">
                                                <HStack>
                                                    {!e.isSeen && <Box w="8px" h="8px" bg="red.500" borderRadius="full" />}
                                                    <Text>{new Date(e.createdAt).toLocaleDateString('en-GB')}</Text>
                                                </HStack>
                                            </Td>
                                            <Td>
                                                <VStack align="start" spacing={0}>
                                                    <Text fontWeight="bold" color="gray.800">{e.Name}</Text>
                                                    <Text fontSize="xs" color="gray.500">{e.email && e.email !== 'N/A' ? e.email : ''}</Text>
                                                    <Text fontSize="xs" color="gray.500">{e.phone && e.phone !== 'N/A' ? e.phone : ''}</Text>
                                                </VStack>
                                            </Td>
                                            <Td>
                                                <Badge colorScheme="purple">{(e.products || []).length} items requested</Badge>
                                            </Td>
                                            <Td textAlign="right">
                                                <HStack spacing={2} justify="flex-end">
                                                    <Button size="sm" colorScheme="brand" leftIcon={<FiEye />} onClick={() => handleViewEnquiry(e)}>View Details</Button>
                                                    <IconButton 
                                                        aria-label="Delete" 
                                                        icon={<FiTrash />} 
                                                        size="sm" 
                                                        colorScheme="red" 
                                                        variant="ghost" 
                                                        onClick={() => handleDeleteRequest('enquiry', e._id)}
                                                    />
                                                </HStack>
                                            </Td>
                                        </Tr>
                                    ))}
                                    {filteredEnquiries.length === 0 && <Tr><Td colSpan={4} textAlign="center" py={4} color="gray.500">No enquiries found.</Td></Tr>}
                                </Tbody>
                            </Table>
                        </Box>
                        <PaginationControls currentPage={enquiryPage} totalItems={filteredEnquiries.length} onPageChange={setEnquiryPage} />
                    </TabPanel>

                    <TabPanel p={0} pt={4}>
                        <Flex justify="space-between" mb={4} align="center">
                            <InputGroup maxW="350px" size="sm">
                                <InputLeftElement pointerEvents="none">
                                    <FiSearch color="gray.400" />
                                </InputLeftElement>
                                <Input 
                                    placeholder="Search by client or Ref No..." 
                                    borderRadius="xl"
                                    value={activeSearch}
                                    onChange={(e) => {
                                        setActiveSearch(e.target.value);
                                        setActivePage(1);
                                    }}
                                />
                            </InputGroup>
                        </Flex>
                        <Box overflowX="auto" border="1px" borderColor="gray.100" borderRadius="xl">
                            <Table variant="simple" minW="560px">
                                <Thead bg="gray.50">
                                    <Tr>
                                        <Th>Date</Th>
                                        <Th>Ref No.</Th>
                                        <Th>Client</Th>
                                        <Th>Total Value</Th>
                                        <Th>Status</Th>
                                        <Th>Next Follow-up</Th>
                                        <Th textAlign="right">Action</Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                {(() => {
                                    // Pre-calculate the latest quotation ID for each enquiry so we know which ones are active
                                    const latestIdsMap = new Map();
                                    quotations.forEach(q => {
                                        const enqId = q.enquiry?._id || q.enquiryId?._id || q.enquiry || q.enquiryId;
                                        const key = typeof enqId === 'object' ? enqId.toString() : String(enqId);
                                        if (!latestIdsMap.has(key)) {
                                            latestIdsMap.set(key, q);
                                        } else {
                                            if (new Date(q.createdAt) > new Date(latestIdsMap.get(key).createdAt)) {
                                                latestIdsMap.set(key, q);
                                            }
                                        }
                                    });
                                    const latestQuotationIds = new Set(Array.from(latestIdsMap.values()).map(q => q._id));

                                    return paginatedQuotations.map(q => {
                                        let refSuffix = '';
                                        if (q.refNo) {
                                            const lowerRef = q.refNo.toLowerCase();
                                            if (lowerRef.includes('(r')) {
                                                refSuffix = q.refNo.substring(lowerRef.indexOf('(r'));
                                            }
                                        }
                                        const clientName = q.partyName || q.enquiryId?.Name || q.enquiry?.Name || 'Unknown';
                                        const totalAmt = q.grandTotal || q.totalAmount || 0;
                                        
                                        const nextDate = q.nextFollowUp 
                                            ? new Date(q.nextFollowUp)
                                            : q.firstFollowUpDate
                                            ? new Date(q.firstFollowUpDate)
                                            : (q.status === 'Done' || q.status === 'Reject')
                                            ? null
                                            : new Date(new Date(q.createdAt).getTime() + (2 * 24 * 60 * 60 * 1000));
                                        
                                        const today = new Date(); today.setHours(0,0,0,0);
                                        const isOverdue = nextDate && nextDate <= today;
                                        const followUpCount = q.followUps?.length || 0;
                                        
                                        const isAbsoluteLatest = latestQuotationIds.has(q._id);

                                        let rowBgColor = "transparent";
                                        let hoverBgColor = "gray.50";
                                        if (isAbsoluteLatest) {
                                            if (nextDate) {
                                                const isToday = nextDate.toDateString() === new Date().toDateString();
                                                const isPast = nextDate < today;
                                                
                                                if (isToday) {
                                                    rowBgColor = "orange.50";
                                                    hoverBgColor = "orange.100";
                                                } else if (isPast) {
                                                    rowBgColor = "red.50";
                                                    hoverBgColor = "red.100";
                                                } else {
                                                    hoverBgColor = "orange.50";
                                                }
                                            } else {
                                                hoverBgColor = "orange.50";
                                            }
                                        }

                                        return (
                                            <Tr
                                                key={q._id}
                                                bg={rowBgColor}
                                                cursor={isAbsoluteLatest ? "pointer" : "not-allowed"}
                                                _hover={{ bg: hoverBgColor, boxShadow: isAbsoluteLatest ? "0 1px 4px rgba(0,0,0,0.07)" : "none" }}
                                                transition="background 0.15s"
                                                opacity={isAbsoluteLatest ? 1 : 0.65}
                                                onClick={(e) => {
                                                    // Don't open popup if user clicked a button/icon inside the row
                                                    if (e.target.closest('button') || e.target.closest('[role="button"]')) return;
                                                    
                                                    if (!isAbsoluteLatest) {
                                                        toast({
                                                            title: "Cannot Follow-up Old Revision",
                                                            description: "Follow-ups can only be set on the latest revised quotation for this enquiry.",
                                                            status: "warning",
                                                            duration: 4000,
                                                            position: "top"
                                                        });
                                                        return;
                                                    }
                                                    handleOpenFollowUp(q);
                                                }}
                                                title={isAbsoluteLatest ? "Click to add follow-up" : "This is an old revision. Follow-up is disabled."}
                                            >
                                                <Td fontSize="sm">{new Date(q.createdAt).toLocaleDateString('en-GB')}</Td>
                                                <Td fontSize="xs" fontWeight="bold" color="gray.600">{q.refNo || 'N/A'}</Td>
                                                <Td>
                                                    <VStack align="start" spacing={0}>
                                                        <Text fontWeight="medium">{clientName} <Text as="span" color="red.500" fontWeight="bold">{refSuffix}</Text></Text>
                                                        <Text fontSize="xs" color="gray.500">{q.mobile || q.enquiryId?.phone || q.enquiry?.phone || ''}</Text>
                                                    </VStack>
                                                </Td>
                                                <Td fontWeight="bold" color="gray.700">₹{totalAmt.toLocaleString('en-IN')}</Td>
                                                <Td><Badge colorScheme="blue">{q.status}</Badge></Td>
                                                <Td>
                                                    <VStack align="start" spacing={0}>
                                                        {nextDate ? (
                                                            <Badge
                                                                colorScheme={isOverdue ? 'red' : 'orange'}
                                                                variant={isOverdue ? 'solid' : 'subtle'}
                                                                borderRadius="full"
                                                                fontSize="10px"
                                                                px={2}
                                                            >
                                                                {isOverdue ? '🔴 DUE: ' : '📅 '}
                                                                {nextDate.toLocaleDateString('en-GB')}
                                                            </Badge>
                                                        ) : (
                                                            <Badge colorScheme="gray" fontSize="10px" borderRadius="full" px={2}>Not Set</Badge>
                                                        )}
                                                        {followUpCount > 0 && (
                                                            <Text fontSize="9px" color="gray.400">{followUpCount} follow-up{followUpCount > 1 ? 's' : ''} done</Text>
                                                        )}
                                                    </VStack>
                                                </Td>
                                                <Td textAlign="right" onClick={(e) => e.stopPropagation()}>
                                                    <HStack spacing={2} justify="flex-end">
                                                        <IconButton 
                                                            aria-label="View" 
                                                            icon={<FiEye />} 
                                                            size="xs" 
                                                            variant="outline" 
                                                            onClick={() => handleViewQuotation(q)} 
                                                        />
                                                        <IconButton 
                                                            aria-label="Edit" 
                                                            icon={<FiEdit />} 
                                                            size="xs" 
                                                            colorScheme="blue" 
                                                            variant="outline" 
                                                            onClick={() => {
                                                                const enq = q.enquiryId || q.enquiry;
                                                                if (enq) {
                                                                    setSelectedEnquiry(enq);
                                                                    setTimeout(() => initCreateQuote(), 50);
                                                                }
                                                            }}
                                                        />
                                                        <Button 
                                                            size="xs" 
                                                            bg="#25D366" 
                                                            color="white" 
                                                            _hover={{ bg: "#128C7E" }} 
                                                            leftIcon={<FaWhatsapp />} 
                                                            isLoading={sendingWhatsappId === q._id} 
                                                            isDisabled={!!sendingWhatsappId} 
                                                            onClick={() => handleSendWhatsApp(q)}
                                                        >
                                                            WhatsApp
                                                        </Button>
                                                        <IconButton 
                                                            aria-label="Accept" 
                                                            icon={<FiCheck />} 
                                                            size="xs" 
                                                            colorScheme="green" 
                                                            onClick={() => handleStatusUpdate('quotation', q._id, 'Done')} 
                                                        />
                                                        <IconButton 
                                                            aria-label="Reject" 
                                                            icon={<FiX />} 
                                                            size="xs" 
                                                            colorScheme="red" 
                                                            onClick={() => handleStatusUpdate('quotation', q._id, 'Reject')} 
                                                        />
                                                        <IconButton 
                                                            aria-label="Delete" 
                                                            icon={<FiTrash />} 
                                                            size="xs" 
                                                            colorScheme="red" 
                                                            variant="ghost" 
                                                            onClick={() => handleDeleteRequest('quotation', q._id)}
                                                        />
                                                    </HStack>
                                                </Td>
                                            </Tr>
                                        );
                                    });
                                })()}
                                </Tbody>
                            </Table>
                        </Box>
                        <PaginationControls currentPage={activePage} totalItems={filteredQuotations.length} onPageChange={setActivePage} />
                    </TabPanel>

                    <TabPanel p={0} pt={4}>
                        <Flex justify="space-between" mb={4} align="center">
                            <InputGroup maxW="350px" size="sm">
                                <InputLeftElement pointerEvents="none">
                                    <FiSearch color="gray.400" />
                                </InputLeftElement>
                                <Input 
                                    placeholder="Search by client or Ref No..." 
                                    borderRadius="xl"
                                    value={historySearch}
                                    onChange={(e) => {
                                        setHistorySearch(e.target.value);
                                        setHistoryPage(1);
                                    }}
                                />
                            </InputGroup>
                        </Flex>
                        <Box overflowX="auto" border="1px" borderColor="gray.100" borderRadius="xl">
                            <Table variant="simple" minW="560px">
                                <Thead bg="gray.50">
                                    <Tr>
                                        <Th>Date</Th>
                                        <Th>Ref No.</Th>
                                        <Th>Client</Th>
                                        <Th>Total Value</Th>
                                        <Th>Status</Th>
                                        <Th textAlign="right">Action</Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    {paginatedHistory.map(q => {
                                        let refSuffix = '';
                                        if (q.refNo) {
                                            const lowerRef = q.refNo.toLowerCase();
                                            if (lowerRef.includes('(r')) {
                                                refSuffix = q.refNo.substring(lowerRef.indexOf('(r'));
                                            }
                                        }
                                        const clientName = q.partyName || q.enquiryId?.Name || q.enquiry?.Name || 'Unknown';
                                        const totalAmt = q.grandTotal || q.totalAmount || 0;

                                        return (
                                            <Tr key={q._id} _hover={{ bg: "gray.50" }}>
                                                <Td fontSize="sm">{new Date(q.createdAt).toLocaleDateString('en-GB')}</Td>
                                                <Td fontSize="xs" fontWeight="bold" color="gray.600">{q.refNo || 'N/A'}</Td>
                                                <Td>
                                                    <VStack align="start" spacing={0}>
                                                        <Text fontWeight="medium">{clientName} <Text as="span" color="red.500" fontWeight="bold">{refSuffix}</Text></Text>
                                                        <Text fontSize="xs" color="gray.500">{q.mobile || q.enquiryId?.phone || q.enquiry?.phone || ''}</Text>
                                                    </VStack>
                                                </Td>
                                                <Td fontWeight="bold" color="gray.700">₹{totalAmt.toLocaleString('en-IN')}</Td>
                                                <Td><Badge colorScheme={q.status === 'Done' ? 'green' : 'red'}>{q.status === 'Done' ? 'Accepted' : 'Rejected'}</Badge></Td>
                                                <Td textAlign="right">
                                                    <HStack spacing={2} justify="flex-end">
                                                        <Button size="sm" variant="outline" leftIcon={<FiEye />} onClick={() => handleViewQuotation(q)}>View Quote</Button>
                                                        {q.status === 'Done' && (
                                                            <Button size="sm" colorScheme="purple" leftIcon={<FiDownload />} onClick={() => downloadTallyXML(q)}>Tally XML</Button>
                                                        )}
                                                        <IconButton 
                                                            aria-label="Delete" 
                                                            icon={<FiTrash />} 
                                                            size="sm" 
                                                            colorScheme="red" 
                                                            variant="ghost" 
                                                            onClick={() => handleDeleteRequest('quotation', q._id)}
                                                        />
                                                    </HStack>
                                                </Td>
                                            </Tr>
                                        );
                                    })}
                                    {filteredHistory.length === 0 && <Tr><Td colSpan={6} textAlign="center" py={4} color="gray.500">No processed quotations found.</Td></Tr>}
                                </Tbody>
                            </Table>
                        </Box>
                        <PaginationControls currentPage={historyPage} totalItems={filteredHistory.length} onPageChange={setHistoryPage} />
                    </TabPanel>

                    {/* WhatsApp Logs Tab Panel */}
                    <TabPanel p={0} pt={4}>
                        <Flex justify="space-between" mb={4} align="center">
                            <InputGroup maxW="350px" size="sm">
                                <InputLeftElement pointerEvents="none">
                                    <FiSearch color="gray.400" />
                                </InputLeftElement>
                                <Input 
                                    placeholder="Search by client name or phone..." 
                                    borderRadius="xl"
                                    value={whatsappSearch}
                                    onChange={(e) => {
                                        setWhatsappSearch(e.target.value);
                                        setWhatsappPage(1);
                                    }}
                                />
                            </InputGroup>
                        </Flex>
                        <Box overflowX="auto" border="1px" borderColor="gray.100" borderRadius="xl">
                            <Table variant="simple" minW="500px">
                                <Thead bg="green.50">
                                    <Tr>
                                        <Th>Date</Th>
                                        <Th>Client Name & Contact</Th>
                                        <Th>Products Sent</Th>
                                        <Th>Next Follow-Up</Th>
                                        <Th textAlign="right">Action</Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    {paginatedWhatsappLogs.map(e => (
                                        <Tr key={e._id} _hover={{ bg: "gray.50" }}>
                                            <Td fontSize="sm">
                                                {new Date(e.createdAt).toLocaleDateString('en-GB')}
                                            </Td>
                                            <Td>
                                                <VStack align="start" spacing={0}>
                                                    <Text fontWeight="bold" color="gray.800">{e.Name}</Text>
                                                    <Text fontSize="xs" color="gray.500">{e.email && e.email !== 'N/A' ? e.email : ''}</Text>
                                                    <Text fontSize="xs" color="gray.500">{e.phone && e.phone !== 'N/A' ? e.phone : ''}</Text>
                                                </VStack>
                                            </Td>
                                            <Td>
                                                <Badge colorScheme="green">{(e.products || []).length} products sent</Badge>
                                            </Td>
                                            <Td>
                                                {(() => {
                                                    if (e.status === 'Done' || e.status === 'Reject') {
                                                        return <Badge colorScheme={e.status === 'Done' ? 'green' : 'red'}>{e.status}</Badge>;
                                                    }
                                                    
                                                    const followUpDate = e.nextFollowUp 
                                                        ? new Date(e.nextFollowUp)
                                                        : e.firstFollowUpDate
                                                        ? new Date(e.firstFollowUpDate)
                                                        : new Date(new Date(e.createdAt).getTime() + (2 * 24 * 60 * 60 * 1000));

                                                    const dateZero = new Date(followUpDate).setHours(0,0,0,0);
                                                    const todayZero = new Date().setHours(0,0,0,0);
                                                    const isOverdue = dateZero < todayZero;
                                                    const isToday = dateZero === todayZero;

                                                    return (
                                                        <VStack align="start" spacing={1}>
                                                            <Text fontSize="sm" fontWeight="bold">
                                                                {followUpDate.toLocaleDateString('en-GB')}
                                                            </Text>
                                                            {isOverdue && <Badge colorScheme="red" variant="solid" fontSize="10px">OVERDUE</Badge>}
                                                            {isToday && <Badge colorScheme="orange" variant="solid" fontSize="10px">TODAY</Badge>}
                                                        </VStack>
                                                    );
                                                })()}
                                            </Td>
                                            <Td textAlign="right">
                                                <HStack spacing={2} justify="flex-end">
                                                    <IconButton 
                                                        aria-label="View Details" 
                                                        icon={<FiEye />} 
                                                        size="xs" 
                                                        variant="outline" 
                                                        onClick={() => handleViewEnquiry(e)} 
                                                    />
                                                    <Button 
                                                        size="xs" 
                                                        colorScheme="brand" 
                                                        variant="outline"
                                                        onClick={() => handleOpenFollowUp(e, 'enquiry')}
                                                    >
                                                        Follow-up {e.followUps?.length > 0 ? `(${e.followUps.length})` : ''}
                                                    </Button>
                                                    <IconButton 
                                                        aria-label="Done" 
                                                        icon={<FiCheck />} 
                                                        size="xs" 
                                                        colorScheme="green" 
                                                        onClick={() => handleStatusUpdate('enquiry', e._id, 'Done')} 
                                                    />
                                                    <IconButton 
                                                        aria-label="Reject" 
                                                        icon={<FiX />} 
                                                        size="xs" 
                                                        colorScheme="red" 
                                                        onClick={() => handleStatusUpdate('enquiry', e._id, 'Reject')} 
                                                    />
                                                    <IconButton 
                                                        aria-label="Delete" 
                                                        icon={<FiTrash />} 
                                                        size="xs" 
                                                        colorScheme="red" 
                                                        variant="ghost" 
                                                        onClick={() => handleDeleteRequest('enquiry', e._id)}
                                                    />
                                                </HStack>
                                            </Td>
                                        </Tr>
                                    ))}
                                    {filteredWhatsappLogs.length === 0 && <Tr><Td colSpan={4} textAlign="center" py={4} color="gray.500">No WhatsApp logs found.</Td></Tr>}
                                </Tbody>
                            </Table>
                        </Box>
                        <PaginationControls currentPage={whatsappPage} totalItems={filteredWhatsappLogs.length} onPageChange={setWhatsappPage} />
                    </TabPanel>
                </TabPanels>
                )}
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
                                                        objectFit="contain"
                                                        borderRadius="md"
                                                        bg="white"
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
                                            <FormLabel fontSize="xs" mb={1}>Contact Person (Optional)</FormLabel>
                                            <Input size="sm" bg="white" value={quoteContactPerson} onChange={(e) => setQuoteContactPerson(e.target.value)} />
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
                                    <Flex justify="space-between" align="center" mb={3}>
                                        <Text fontWeight="bold" color="brand.600">Products & Pricing</Text>
                                        {(isSuperAdmin || canShowDealerPrice) && (

                                            <Checkbox
                                                colorScheme="brand"
                                                isChecked={isGlobalDealerPrice}
                                                onChange={(e) => {
                                                    const isChecked = e.target.checked;
                                                    setIsGlobalDealerPrice(isChecked);
                                                    const newItems = quoteItems.map(item => ({
                                                        ...item,
                                                        price: isChecked ? (item.dealerPrice || 0) : item.calculatedSellingPrice
                                                    }));
                                                    setQuoteItems(newItems);
                                                    calculateTotals(newItems, quoteDiscount);
                                                }}
                                            >
                                                Use Dealer Price for All Items
                                            </Checkbox>
                                        )}
                                    </Flex>
                                    {quoteItems.map((item, idx) => (
                                        <Box key={idx} border="1px" borderColor="gray.200" p={3} borderRadius="md">
                                            <HStack mb={2} spacing={3} justify="space-between">
                                                <HStack>
                                                    <Image
                                                        src={getImageUrl(item.productId?.images?.[0] || item.productId?.photos?.[0] || item.productId?.image || item.product?.images?.[0] || item.product?.photos?.[0] || item.product?.image)}
                                                        boxSize="40px"
                                                        objectFit="contain"
                                                        borderRadius="md"
                                                        bg="white"
                                                        fallbackSrc="https://via.placeholder.com/50?text=No+Img"
                                                    />
                                                    <VStack align="start" spacing={0} w="full">
                                                        <Text fontWeight="bold" fontSize="sm">
                                                            {item.productId?.name || item.product?.name || 'Product'}
                                                        </Text>
                                                        {Array.isArray(item.productId?.sizes) && item.productId.sizes.length > 0 && (
                                                            <VStack align="start" spacing={1.5} mt={2} p={2.5} bg="purple.50/80" borderRadius="md" border="1px solid" borderColor="purple.200" w="full">
                                                                <Text fontSize="10px" fontWeight="bold" color="purple.700" letterSpacing="wider">SELECT SIZES & QUANTITIES:</Text>
                                                                {item.productId.sizes.map((s, sKey) => {
                                                                    const selectedArr = Array.isArray(item.selectedSizes) ? item.selectedSizes : [];
                                                                    const found = selectedArr.find(ss => ss.size === s.size);
                                                                    const isChecked = !!found;
                                                                    const currentQty = found ? found.quantity : 1;

                                                                    return (
                                                                        <Flex key={sKey} align="center" justify="space-between" w="full" gap={2}>
                                                                            <Checkbox
                                                                                size="sm"
                                                                                colorScheme="purple"
                                                                                isChecked={isChecked}
                                                                                onChange={(e) => {
                                                                                    let nextArr = [...selectedArr];
                                                                                    if (e.target.checked) {
                                                                                        nextArr.push({ size: s.size, quantity: 1 });
                                                                                    } else {
                                                                                        nextArr = nextArr.filter(ss => ss.size !== s.size);
                                                                                    }
                                                                                    const accumulatedQty = nextArr.reduce((sum, ss) => sum + (Number(ss.quantity) || 1), 0);
                                                                                    handleItemChange(idx, 'selectedSizes', nextArr);
                                                                                    handleItemChange(idx, 'quantity', accumulatedQty > 0 ? accumulatedQty : 1);
                                                                                }}
                                                                            >
                                                                                <Text fontSize="xs" fontWeight="600">{s.size}</Text>
                                                                            </Checkbox>

                                                                            {isChecked && (
                                                                                <HStack spacing={1}>
                                                                                    <Text fontSize="10px" color="gray.600" fontWeight="bold">Qty:</Text>
                                                                                    <Input
                                                                                        type="number"
                                                                                        size="xs"
                                                                                        w="55px"
                                                                                        min={1}
                                                                                        onWheel={(e) => e.target.blur()}
                                                                                        value={currentQty}
                                                                                        onChange={(e) => {
                                                                                            const raw = e.target.value;
                                                                                            const val = raw === '' ? '' : Math.max(0, parseInt(raw) || 0);
                                                                                            const nextArr = selectedArr.map(ss =>
                                                                                                ss.size === s.size ? { ...ss, quantity: val } : ss
                                                                                            );
                                                                                            const accumulatedQty = nextArr.reduce((sum, ss) => sum + (parseInt(ss.quantity) || 0), 0);
                                                                                            handleItemChange(idx, 'selectedSizes', nextArr);
                                                                                            handleItemChange(idx, 'quantity', accumulatedQty);
                                                                                        }}
                                                                                        onBlur={(e) => {
                                                                                            if (!e.target.value || parseInt(e.target.value) < 1) {
                                                                                                const nextArr = selectedArr.map(ss =>
                                                                                                    ss.size === s.size ? { ...ss, quantity: 1 } : ss
                                                                                                );
                                                                                                const accumulatedQty = nextArr.reduce((sum, ss) => sum + (parseInt(ss.quantity) || 1), 0);
                                                                                                handleItemChange(idx, 'selectedSizes', nextArr);
                                                                                                handleItemChange(idx, 'quantity', accumulatedQty);
                                                                                            }
                                                                                        }}
                                                                                        bg="white"
                                                                                    />
                                                                                </HStack>
                                                                            )}
                                                                        </Flex>
                                                                    );
                                                                })}
                                                            </VStack>
                                                        )}
                                                    </VStack>
                                                </HStack>
                                                <HStack>
                                                    <Text fontSize="xs" fontWeight="bold">Qty:</Text>
                                                    <Input
                                                        size="xs"
                                                        type="number"
                                                        w="60px"
                                                        value={item.quantity}
                                                        isReadOnly={Array.isArray(item.selectedSizes) && item.selectedSizes.length > 0}
                                                        bg={Array.isArray(item.selectedSizes) && item.selectedSizes.length > 0 ? "purple.50" : "white"}
                                                        onChange={(e) => handleItemChange(idx, 'quantity', parseFloat(e.target.value) || 0)}
                                                    />
                                                    <Button size="sm" colorScheme="red" variant="ghost" onClick={() => handleRemoveItem(idx)}>
                                                        <FiTrash />
                                                    </Button>
                                                </HStack>
                                            </HStack>
                                            <Stack direction={{ base: 'column', md: 'row' }} spacing={3}>
                                                <FormControl isRequired>
                                                    <Flex justify="space-between" align="center" mb={1}>
                                                        <FormLabel fontSize="xs" mb={0}>Unit Price (₹)</FormLabel>
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
                                                        {(isSuperAdmin || canShowDealerPrice) && isGlobalDealerPrice
                                                            ? `Dealer: ₹${item.dealerPrice || 0}`
                                                            : `Sell: ₹${item.sellingPriceStart || 0} - ${item.sellingPriceEnd > 0 ? `₹${item.sellingPriceEnd}` : 'N/A'}`
                                                        }
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

                                    {/* Add New Item to Quotation */}
                                    <Box mt={4} p={3} border="1px dashed" borderColor="brand.300" borderRadius="md" bg="orange.50">
                                        <Text fontSize="xs" fontWeight="bold" mb={2} color="orange.700">Add Another Item to this Quotation:</Text>
                                        <Stack direction={{ base: 'column', md: 'row' }} spacing={2}>
                                            <Button 
                                                leftIcon={<FiPlus />} 
                                                colorScheme="orange" 
                                                size="sm" 
                                                onClick={() => {
                                                    setPickerCategory(null);
                                                    onPickerOpen();
                                                }}
                                            >
                                                Select Product from Categories
                                            </Button>
                                            
                                            <FormControl flex="1">
                                                <Select 
                                                    size="sm" 
                                                    placeholder="Or quick select product..." 
                                                    bg="white"
                                                    onChange={(e) => handleAddNewItem(e.target.value)}
                                                    value=""
                                                >
                                                    {allProducts
                                                        .filter(p => !quoteItems.some(qi => (qi.productId?._id || qi.productId) === p._id))
                                                        .map(p => (
                                                            <option key={p._id} value={p._id}>{p.name}</option>
                                                        ))
                                                    }
                                                </Select>
                                            </FormControl>
                                        </Stack>
                                    </Box>
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
                                    win.document.write(`<html><head><style>@media print{ * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; } button{display:none} img { max-width: 100%; height: auto; } }</style></head><body>`);
                                    win.document.write(selectedQuotation.htmlContent);
                                    win.document.write(`
                                        <script>
                                            window.onload = function() {
                                                setTimeout(function() {
                                                    window.print();
                                                }, 500);
                                            };
                                        </script>
                                    </body></html>`);
                                    win.document.close();
                                    win.focus();
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
                                                            objectFit="contain"
                                                            bg="white"
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
            </Modal>
            {/* Quotation Status Confirmation Modal */}
            <Modal isOpen={isStatusConfirmOpen} onClose={onStatusConfirmClose} isCentered size="sm">
                <ModalOverlay backdropFilter="blur(4px)" />
                <ModalContent borderRadius="2xl" p={2}>
                    <ModalHeader borderBottomWidth="0px">
                        Confirm Action
                    </ModalHeader>
                    <ModalBody>
                        <Text fontSize="md">
                            Are you sure you want to mark this quotation as <b>{statusConfirmData.status}</b>? 
                            This will move it to the Processed tab.
                        </Text>
                    </ModalBody>
                    <ModalFooter borderTopWidth="0px" gap={3}>
                        <Button variant="ghost" onClick={onStatusConfirmClose} borderRadius="xl">Cancel</Button>
                        <Button 
                            colorScheme={statusConfirmData.status === 'Done' ? 'green' : 'red'} 
                            borderRadius="xl" 
                            px={8}
                            onClick={confirmStatusUpdate}
                        >
                            Yes, Mark as {statusConfirmData.status}
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
            {/* Generic Delete Confirmation Modal */}
            <Modal isOpen={isDeleteConfirmOpen} onClose={onDeleteConfirmClose} isCentered size="sm">
                <ModalOverlay backdropFilter="blur(4px)" />
                <ModalContent borderRadius="2xl" p={2}>
                    <ModalHeader borderBottomWidth="0px">
                        Confirm Deletion
                    </ModalHeader>
                    <ModalBody>
                        <Text fontSize="md">
                            Are you sure you want to delete this <b>{deleteTarget.type}</b>? 
                            This action is permanent and cannot be undone.
                        </Text>
                    </ModalBody>
                    <ModalFooter borderTopWidth="0px" gap={3}>
                        <Button variant="ghost" onClick={onDeleteConfirmClose} borderRadius="xl">Cancel</Button>
                        <Button 
                            colorScheme="red" 
                            borderRadius="xl" 
                            px={8}
                            isLoading={isDeleting}
                            loadingText="Deleting..."
                            onClick={confirmDelete}
                        >
                            Delete Forever
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* PRODUCT PICKER MODAL */}
            <Modal isOpen={isPickerOpen} onClose={onPickerClose} size="4xl" scrollBehavior="inside">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>
                        <HStack justify="space-between" pr={10}>
                            <Text>Select Product</Text>
                            {pickerCategory && (
                                <Button size="xs" variant="ghost" leftIcon={<FaChevronLeft />} onClick={() => setPickerCategory(null)}>
                                    Back to Categories
                                </Button>
                            )}
                        </HStack>
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody p={6}>
                        {!pickerCategory ? (
                            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                                {PRODUCT_CATEGORIES.map(cat => (
                                    <Box 
                                        key={cat.id} 
                                        p={6} 
                                        border="1px solid" 
                                        borderColor="gray.200" 
                                        borderRadius="xl" 
                                        cursor="pointer"
                                        _hover={{ bg: 'brand.50', borderColor: 'brand.200', transform: 'translateY(-2px)' }}
                                        transition="all 0.2s"
                                        onClick={() => setPickerCategory(cat.id)}
                                        textAlign="center"
                                    >
                                        <Text fontWeight="800" fontSize="md">{cat.title}</Text>
                                        <Text fontSize="xs" color="gray.500" mt={2}>
                                            {allProducts.filter(p => p.category === cat.id).length} Products
                                        </Text>
                                    </Box>
                                ))}
                                <Box 
                                    p={6} 
                                    border="1px solid" 
                                    borderColor="gray.200" 
                                    borderRadius="xl" 
                                    cursor="pointer"
                                    _hover={{ bg: 'gray.100' }}
                                    onClick={() => setPickerCategory('OTHER')}
                                    textAlign="center"
                                >
                                    <Text fontWeight="800" fontSize="md">Other / Uncategorized</Text>
                                    <Text fontSize="xs" color="gray.500" mt={2}>
                                        {allProducts.filter(p => !PRODUCT_CATEGORIES.some(cat => cat.id === p.category)).length} Products
                                    </Text>
                                </Box>
                            </SimpleGrid>
                        ) : (
                            <VStack align="stretch" spacing={4}>
                                <InputGroup>
                                    <InputLeftElement pointerEvents="none">
                                        <FiSearch color="gray.300" />
                                    </InputLeftElement>
                                    <Input 
                                        placeholder="Search products in this category..." 
                                        bg="gray.50" 
                                        value={pickerSearch}
                                        onChange={(e) => setPickerSearch(e.target.value)}
                                    />
                                </InputGroup>

                                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                                    {allProducts
                                        .filter(p => pickerCategory === 'OTHER' 
                                            ? !PRODUCT_CATEGORIES.some(cat => cat.id === p.category)
                                            : p.category === pickerCategory
                                        )
                                        .filter(p => p.name.toLowerCase().includes(pickerSearch.toLowerCase()))
                                        .map(p => (
                                            <Box 
                                                key={p._id} 
                                                p={3} 
                                                borderWidth="1px" 
                                                borderRadius="lg" 
                                                _hover={{ bg: 'green.50', borderColor: 'green.200' }}
                                                cursor="pointer"
                                                onClick={() => {
                                                    handleAddNewItem(p._id);
                                                    onPickerClose();
                                                }}
                                            >
                                                <Flex align="center" gap={3}>
                                                    <Image 
                                                        src={getImageUrl(p.images?.[0] || p.photos?.[0] || p.image)} 
                                                        boxSize="50px" 
                                                        objectFit="contain" 
                                                        borderRadius="md"
                                                        fallbackSrc="https://via.placeholder.com/50"
                                                    />
                                                    <Box flex="1">
                                                        <Text fontWeight="bold" fontSize="sm" noOfLines={2}>{p.name}</Text>
                                                        <Text fontSize="xs" color="gray.500">₹{p.sellingPriceStart?.toLocaleString()} - ₹{p.sellingPriceEnd?.toLocaleString()}</Text>
                                                    </Box>
                                                    <FiPlus color="green" />
                                                </Flex>
                                            </Box>
                                        ))
                                    }
                                </SimpleGrid>
                                {allProducts.filter(p => pickerCategory === 'OTHER' ? !PRODUCT_CATEGORIES.some(cat => cat.id === p.category) : p.category === pickerCategory).length === 0 && (
                                    <Text textAlign="center" py={10} color="gray.500">No products found in this category.</Text>
                                )}
                            </VStack>
                        )}
                    </ModalBody>
                </ModalContent>
            </Modal>

            {/* ─── Unified Follow-up Modal (History + Add Form) ─────────────────── */}
            <Modal isOpen={isFollowUpOpen} onClose={onFollowUpClose} size="xl" isCentered motionPreset="slideInBottom" scrollBehavior="inside">
                <ModalOverlay backdropFilter="blur(8px)" bg="blackAlpha.700" />
                <ModalContent borderRadius="3xl" overflow="hidden" boxShadow="2xl" maxH="90vh">
                    <ModalHeader p={0}>
                        <Box bgGradient="linear(to-r, orange.500, purple.600)" p={5} color="white">
                            <HStack spacing={3}>
                                <Box bg="whiteAlpha.300" p={2} borderRadius="xl">
                                    <FaHistory size={20} />
                                </Box>
                                <VStack align="start" spacing={0}>
                                    <Text fontWeight="black" fontSize="lg">Follow-up</Text>
                                    <Text fontSize="xs" opacity={0.85}>
                                        {followUpTargetType === 'quotation' 
                                            ? `${followUpTarget?.refNo} — ${followUpTarget?.enquiry?.companyName || followUpTarget?.enquiry?.Name || 'Client'}`
                                            : `WhatsApp Log — ${followUpTarget?.companyName || followUpTarget?.Name || 'Client'}`}
                                    </Text>
                                </VStack>
                                <Box ml="auto">
                                    <Badge bg="whiteAlpha.300" color="white" borderRadius="full" px={3} py={1} fontSize="xs">
                                        {followUpTarget?.status || 'Pending'}
                                    </Badge>
                                </Box>
                            </HStack>
                        </Box>
                    </ModalHeader>
                    <ModalCloseButton color="white" top={4} right={4} />
                    <ModalBody p={0} overflowY="auto">
                        {/* ── ADD NEW FOLLOW-UP FORM (TOP) ─────────────────────────────────────── */}
                        <Box p={5}>
                            <HStack mb={4} spacing={2}>
                                <FaBell color="#DD6B20" />
                                <Text fontWeight="bold" fontSize="sm" color="orange.700">
                                    Add New Follow-up
                                </Text>
                            </HStack>
                            <VStack spacing={4} align="stretch">
                                {/* Remark */}
                                <FormControl isRequired>
                                    <FormLabel fontSize="sm" fontWeight="bold" color="gray.700">
                                        📝 Remark
                                    </FormLabel>
                                    <Textarea
                                        placeholder="e.g. Called client — they need 2 more days to review pricing..."
                                        value={followUpForm.remark}
                                        onChange={(e) => setFollowUpForm(prev => ({ ...prev, remark: e.target.value }))}
                                        borderRadius="xl"
                                        rows={3}
                                        bg="gray.50"
                                        _focus={{ bg: 'white', borderColor: 'orange.400' }}
                                    />
                                </FormControl>

                                {/* Next Follow-up Date */}
                                <FormControl isRequired>
                                    <FormLabel fontSize="sm" fontWeight="bold" color="gray.700">
                                        📅 Next Follow-up Date
                                    </FormLabel>
                                    <Input
                                        type="date"
                                        value={followUpForm.nextFollowUpDate}
                                        min={new Date().toISOString().split('T')[0]}
                                        onChange={(e) => setFollowUpForm(prev => ({ ...prev, nextFollowUpDate: e.target.value }))}
                                        borderRadius="xl"
                                        bg="gray.50"
                                        _focus={{ bg: 'white', borderColor: 'orange.400' }}
                                    />
                                </FormControl>
                            </VStack>
                            
                            <Button
                                mt={5}
                                w="full"
                                bgGradient="linear(to-r, orange.500, red.500)"
                                color="white"
                                borderRadius="xl"
                                py={6}
                                leftIcon={<FaBell />}
                                isLoading={isSubmittingFollowUp}
                                onClick={handleSubmitFollowUp}
                                _hover={{ bgGradient: 'linear(to-r, orange.600, red.600)' }}
                            >
                                Save Follow-up
                            </Button>
                        </Box>

                        {/* ── HISTORY SECTION (BOTTOM) ───────────────────────────────────────────── */}
                        <Box p={5} bg="gray.50" borderTop="1px solid" borderColor="gray.200">
                            <HStack mb={3} spacing={2}>
                                <FaHistory color="#805AD5" />
                                <Text fontWeight="bold" fontSize="sm" color="purple.700">
                                    Remark History
                                </Text>
                                <Badge colorScheme="purple" borderRadius="full" fontSize="10px">
                                    {followUpTarget?.followUps?.length || 0} total
                                </Badge>
                            </HStack>

                            {followUpTarget?.followUps?.length > 0 ? (
                                <VStack spacing={0} align="stretch">
                                    {[...followUpTarget.followUps].reverse().map((fu, i, arr) => {
                                        const isFirst = i === 0;
                                        const addedAt = fu.addedAt
                                            ? new Date(fu.addedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' })
                                            : 'N/A';
                                        const nextDate = fu.nextFollowUpDate
                                            ? new Date(fu.nextFollowUpDate).toLocaleDateString('en-GB')
                                            : 'N/A';
                                        return (
                                            <HStack key={i} spacing={0} align="stretch">
                                                {/* Timeline dot + line */}
                                                <VStack spacing={0} align="center" mr={3} minW="24px">
                                                    <Box
                                                        w="12px" h="12px" borderRadius="full" mt={2}
                                                        bg={isFirst ? 'orange.500' : 'purple.400'}
                                                        border="2px solid"
                                                        borderColor={isFirst ? 'orange.200' : 'purple.200'}
                                                        flexShrink={0}
                                                    />
                                                    {i < arr.length - 1 && <Box w="2px" flex={1} bg="gray.200" minH="20px" />}
                                                </VStack>
                                                {/* Card */}
                                                <Box
                                                    flex={1} p={3} mb={2}
                                                    bg={isFirst ? 'orange.50' : 'white'}
                                                    borderRadius="xl"
                                                    border="1px solid"
                                                    borderColor={isFirst ? 'orange.200' : 'gray.100'}
                                                >
                                                    <HStack justify="space-between" mb={1}>
                                                        <Badge
                                                            colorScheme={isFirst ? 'orange' : 'purple'}
                                                            borderRadius="full" px={2} fontSize="10px"
                                                        >
                                                            {isFirst ? '🔔 Latest' : `#${arr.length - i}`}
                                                        </Badge>
                                                        <Text fontSize="xs" color="gray.400">{addedAt}</Text>
                                                    </HStack>
                                                    <Text fontSize="sm" color="gray.800" fontWeight="medium" mb={1}>
                                                        💬 {fu.remark}
                                                    </Text>
                                                    <HStack spacing={4} flexWrap="wrap">
                                                        <Text fontSize="xs" color="blue.600" fontWeight="bold">
                                                            📅 Next: {nextDate}
                                                        </Text>
                                                        {fu.addedBy && (
                                                            <Text fontSize="xs" color="gray.500">
                                                                👤 {fu.addedBy}
                                                            </Text>
                                                        )}
                                                    </HStack>
                                                </Box>
                                            </HStack>
                                        );
                                    })}
                                </VStack>
                            ) : (
                                <VStack py={6} spacing={2} color="gray.400">
                                    <FaHistory size={28} />
                                    <Text fontSize="sm" fontWeight="bold">No follow-ups recorded yet.</Text>
                                    <Text fontSize="xs">Add the first follow-up above.</Text>
                                </VStack>
                            )}
                        </Box>
                    </ModalBody>
                    <ModalFooter p={4} borderTop="1px solid" borderColor="gray.100">
                        <Button variant="ghost" borderRadius="full" w="full" onClick={onFollowUpClose}>Close</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

        </Box>
    );
};

export default AdminEnquiries;

