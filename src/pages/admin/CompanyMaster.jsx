import React, { useState, useEffect } from 'react';
import {
    Box, Container, Heading, Text, SimpleGrid, Icon, Stack, Flex, Button, Card, CardBody,
    FormControl, FormLabel, Input, VStack, useToast, Image, HStack, IconButton,
    Tabs, TabList, TabPanels, Tab, TabPanel, Table, Thead, Tbody, Tr, Th, Td, Wrap,
    useDisclosure, AlertDialog, AlertDialogBody, AlertDialogFooter, AlertDialogHeader, AlertDialogContent, AlertDialogOverlay,
    Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
    Checkbox, Badge, InputGroup, InputLeftElement, InputRightElement, Spinner
} from '@chakra-ui/react';
import {
    FaBuilding, FaCloudUploadAlt, FaTrash, FaEdit, FaEye,
    FaWhatsapp, FaFilePdf, FaCheckCircle
} from 'react-icons/fa';
import {
    FiPhone, FiMail, FiMapPin, FiUser, FiFileText, FiPlus,
    FiExternalLink, FiBriefcase, FiCheckCircle, FiRefreshCw, FiLayers
} from 'react-icons/fi';
import api from '../../api/axios';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001')
    .replace(/\/api\/?$/, '')
    .replace(/\/$/, '');

const CompanyMaster = () => {
    const toast = useToast();
    const [isLoading, setIsLoading] = useState(false);

    // Form File states
    const [logoFile, setLogoFile] = useState(null);
    const [udyamFile, setUdyamFile] = useState(null);
    const [panFile, setPanFile] = useState(null);
    const [gstFile, setGstFile] = useState(null);
    const [cancelledChequeFile, setCancelledChequeFile] = useState(null);
    const [stampFile, setStampFile] = useState(null);
    const [otherDocFile, setOtherDocFile] = useState(null);

    // Multiple Other Statutory Documents (Company-wise)
    const [existingOtherDocs, setExistingOtherDocs] = useState([]);

    // ─── Company-Wise Catalogs Management State ─────────────────────────────
    const [existingCatalogs, setExistingCatalogs] = useState([]);
    const [queuedCatalogs, setQueuedCatalogs] = useState([]);
    const [catalogInput, setCatalogInput] = useState({ title: '', file: null });

    // Global catalogs fallback
    const [catalogs, setCatalogs] = useState([]);

    // ─── WhatsApp Share Modal State ─────────────────────────────────────────
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [shareTargetCompany, setShareTargetCompany] = useState(null);
    const [isSendingShareWhatsapp, setIsSendingShareWhatsapp] = useState(false);
    const [isFetchingShareClient, setIsFetchingShareClient] = useState(false);
    const [shareClientAutoFilled, setShareClientAutoFilled] = useState(false);
    const [selectedShareDocs, setSelectedShareDocs] = useState(new Set());
    const [selectedShareCatalogs, setSelectedShareCatalogs] = useState(new Set());
    const [shareForm, setShareForm] = useState({
        phone: '',
        companyName: '',
        contactPersonName: '',
        email: '',
        gstNumber: '',
        address: '',
        customMessage: '',
        includeStatutoryDetails: true,
        includeBankDetails: true
    });

    const [companies, setCompanies] = useState([]);
    const [editId, setEditId] = useState(null);
    const [viewCompanyModal, setViewCompanyModal] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState(0);

    const [existingDocs, setExistingDocs] = useState({
        logo: '', udyamDoc: '', panCardDoc: '', gstDoc: '', cancelledChequeDoc: '', companyStamp: '', otherDoc: ''
    });
    const [removeFlags, setRemoveFlags] = useState({
        logo: false, udyamDoc: false, panCardDoc: false, gstDoc: false, cancelledChequeDoc: false, companyStamp: false, otherDoc: false
    });

    const { isOpen: isConfirmOpen, onOpen: onConfirmOpen, onClose: onConfirmClose } = useDisclosure();
    const cancelRef = React.useRef();

    const [formData, setFormData] = useState({
        companyName: '',
        address: '',
        state: '',
        pincode: '',
        udyamNumber: '',
        gstin: '',
        contactNo: '',
        email: '',
        panCardNumber: '',
        invoicePrefix: '',
        otherDocTitle: '',
        bankDetails: {
            accountHolderName: '',
            bankName: '',
            accountNumber: '',
            ifscCode: ''
        }
    });

    // Deduplication helper for otherDocs: guarantees unique titles and unique URLs
    const getUniqueOtherDocs = (otherDocs, legacyDoc, legacyDocTitle) => {
        const list = Array.isArray(otherDocs) ? [...otherDocs] : [];
        if (legacyDoc && !list.some(od => od.url === legacyDoc)) {
            list.push({ title: legacyDocTitle || 'Other Document', url: legacyDoc });
        }
        const seenUrls = new Set();
        const seenTitles = new Set();
        const result = [];
        for (const od of list) {
            if (!od || !od.url) continue;
            const cleanUrl = od.url.trim().toLowerCase();
            const cleanTitle = (od.title || '').trim().toLowerCase();
            if (seenUrls.has(cleanUrl) || seenTitles.has(cleanTitle)) continue;
            seenUrls.add(cleanUrl);
            seenTitles.add(cleanTitle);
            result.push(od);
        }
        return result;
    };

    const resetFiles = () => {
        setLogoFile(null);
        setUdyamFile(null);
        setPanFile(null);
        setGstFile(null);
        setCancelledChequeFile(null);
        setStampFile(null);
        setOtherDocFile(null);
        setExistingOtherDocs([]);
        setExistingCatalogs([]);
        setQueuedCatalogs([]);
        setCatalogInput({ title: '', file: null });
        setExistingDocs({
            logo: '', udyamDoc: '', panCardDoc: '', gstDoc: '', cancelledChequeDoc: '', companyStamp: '', otherDoc: ''
        });
        setRemoveFlags({
            logo: false, udyamDoc: false, panCardDoc: false, gstDoc: false, cancelledChequeDoc: false, companyStamp: false, otherDoc: false
        });
    };

    // Clean reset for adding a brand-new company
    const handleAddNew = () => {
        setEditId(null);
        setFormData({
            companyName: '',
            address: '',
            state: '',
            pincode: '',
            udyamNumber: '',
            gstin: '',
            contactNo: '',
            email: '',
            panCardNumber: '',
            invoicePrefix: '',
            otherDocTitle: '',
            bankDetails: {
                accountHolderName: '',
                bankName: '',
                accountNumber: '',
                ifscCode: ''
            }
        });
        resetFiles();
        setActiveTab(0);
        toast({
            title: "✨ Clean Form Ready",
            description: "New company form has been cleanly reset. No previous documents or catalogs attached.",
            status: "info",
            duration: 2000,
            isClosable: true
        });
    };

    const fetchCompanies = async () => {
        try {
            const res = await api.get('/company-master');
            if (res.data.success) {
                setCompanies(res.data.data || []);
            }
        } catch (err) {
            console.error("Failed to fetch companies", err);
        }
    };

    const fetchCatalogs = async () => {
        try {
            const res = await api.get('/catalogs');
            if (res.data?.success) {
                setCatalogs(res.data.data || []);
            }
        } catch (err) {
            console.error("Failed to fetch catalogs", err);
        }
    };

    useEffect(() => {
        fetchCompanies();
        fetchCatalogs();
    }, []);

    const filteredCompanies = companies.filter(c =>
        c.companyName?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (['accountHolderName', 'bankName', 'accountNumber', 'ifscCode'].includes(name)) {
            setFormData(prev => ({
                ...prev,
                bankDetails: {
                    ...prev.bankDetails,
                    [name]: value
                }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    // ─── Company-Specific Catalogs Helper (Deduplicated) ────────────────────
    const getCompanyCatalogs = (comp) => {
        if (!comp) return [];
        const list = Array.isArray(comp.catalogs) && comp.catalogs.length > 0
            ? comp.catalogs
            : catalogs.filter(cat =>
                comp.companyName &&
                cat.description &&
                cat.description.toLowerCase().includes(comp.companyName.toLowerCase().trim())
            );
        const seenUrls = new Set();
        const seenTitles = new Set();
        const unique = [];
        for (const c of list) {
            const url = c.url || c.pdfUrl;
            if (!url) continue;
            const cleanUrl = url.trim().toLowerCase();
            const cleanTitle = (c.title || '').trim().toLowerCase();
            if (seenUrls.has(cleanUrl) || seenTitles.has(cleanTitle)) continue;
            seenUrls.add(cleanUrl);
            seenTitles.add(cleanTitle);
            unique.push({ ...c, url: url, pdfUrl: url });
        }
        return unique;
    };

    const handleAddQueuedCatalog = () => {
        if (!catalogInput.title.trim()) {
            return toast({ title: "Enter Catalog Title", status: "warning", duration: 2500 });
        }
        if (!catalogInput.file) {
            return toast({ title: "Please choose a catalog PDF or image file", status: "warning", duration: 2500 });
        }
        const newCat = {
            id: Date.now() + Math.random(),
            title: catalogInput.title.trim().toUpperCase(),
            file: catalogInput.file,
            fileName: catalogInput.file.name,
            fileSize: (catalogInput.file.size / (1024 * 1024)).toFixed(2) + ' MB'
        };
        setQueuedCatalogs(prev => [...prev, newCat]);
        setCatalogInput({ title: '', file: null });
        toast({ title: `Added "${newCat.title}" to catalog queue`, status: "info", duration: 1800 });
    };

    const handleRemoveQueuedCatalog = (id) => {
        setQueuedCatalogs(prev => prev.filter(c => c.id !== id));
    };

    const handleRemoveExistingCatalog = async (catIdOrUrl, title) => {
        if (!window.confirm(`Are you sure you want to remove catalog "${title || 'this catalog'}" from this company?`)) {
            return;
        }
        try {
            if (editId) {
                const payload = {
                    remove_catalog_url: catIdOrUrl
                };
                if (typeof catIdOrUrl === 'string' && catIdOrUrl.length === 24) {
                    payload.remove_catalog_id = catIdOrUrl;
                }
                const res = await api.put(`/company-master/${editId}`, payload);
                if (res.data?.success) {
                    toast({ title: "✓ Catalog Removed", status: "info", duration: 2000 });
                    setExistingCatalogs(prev => prev.filter(c => (c._id !== catIdOrUrl && c.url !== catIdOrUrl)));
                    fetchCompanies();
                    return;
                }
            }
            setExistingCatalogs(prev => prev.filter(c => (c._id !== catIdOrUrl && c.url !== catIdOrUrl)));
        } catch (err) {
            toast({
                title: "Failed to remove catalog",
                description: err.response?.data?.message || err.message,
                status: "error",
                duration: 3000
            });
        }
    };

    // ─── WhatsApp Share Helpers (NO Logo, NO Stamp, ZERO Duplicates) ─────────
    const getAvailableShareDocs = (comp) => {
        if (!comp) return [];
        const docs = [];
        const seenUrls = new Set();
        const seenTitles = new Set();

        const addDoc = (key, title, url, badge) => {
            if (!url) return;
            const cleanUrl = url.trim().toLowerCase();
            const cleanTitle = title.trim().toLowerCase();
            if (seenUrls.has(cleanUrl) || seenTitles.has(cleanTitle)) return;
            seenUrls.add(cleanUrl);
            seenTitles.add(cleanTitle);
            docs.push({ key, title, url, badge });
        };

        // 1. Statutory documents only (NO logo and NO companyStamp)
        if (comp.gstDoc) addDoc('gstDoc', 'GST Registration Certificate', comp.gstDoc, comp.gstin || 'GSTIN');
        if (comp.panCardDoc) addDoc('panCardDoc', 'PAN Card Document', comp.panCardDoc, comp.panCardNumber || 'PAN');
        if (comp.udyamDoc) addDoc('udyamDoc', 'Udyam Registration Certificate', comp.udyamDoc, comp.udyamNumber || 'Udyam');
        if (comp.cancelledChequeDoc) addDoc('cancelledChequeDoc', 'Cancelled Cheque / Bank Proof', comp.cancelledChequeDoc, 'Cheque');

        // 2. Multiple Other Statutory Documents (strictly deduplicated)
        const otherDocs = getUniqueOtherDocs(comp.otherDocs, comp.otherDoc, comp.otherDocTitle);
        otherDocs.forEach((od, idx) => {
            addDoc(`otherDoc_${od._id || idx}`, od.title || `Other Document #${idx + 1}`, od.url, 'Other Doc');
        });

        return docs;
    };

    const getAvailableShareCatalogs = (comp) => {
        if (!comp) return [];
        const compCats = getCompanyCatalogs(comp);
        return compCats.map((c, idx) => ({
            _id: c._id || `comp_cat_${idx}`,
            title: c.title || `Catalog #${idx + 1}`,
            pdfUrl: c.url || c.pdfUrl || ''
        }));
    };

    const openShareModal = (company) => {
        if (!company) return;
        setShareTargetCompany(company);

        // Pre-select all statutory documents for THIS company (no logo, no stamp, no duplicates)
        const availDocs = getAvailableShareDocs(company);
        setSelectedShareDocs(new Set(availDocs.map(d => d.key)));

        // Pre-select all catalogs for THIS company (no duplicates)
        const compCats = getAvailableShareCatalogs(company);
        setSelectedShareCatalogs(new Set(compCats.map(c => c._id)));

        setShareForm({
            phone: '',
            companyName: '',
            contactPersonName: '',
            email: '',
            gstNumber: '',
            address: '',
            customMessage: '',
            includeStatutoryDetails: true,
            includeBankDetails: true
        });
        setShareClientAutoFilled(false);
        setIsShareModalOpen(true);
    };

    const toggleDocSelection = (key) => {
        setSelectedShareDocs(prev => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key);
            else next.add(key);
            return next;
        });
    };

    const toggleCatalogSelection = (id) => {
        setSelectedShareCatalogs(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const toggleSelectAllDocs = (docs) => {
        if (selectedShareDocs.size === docs.length) {
            setSelectedShareDocs(new Set());
        } else {
            setSelectedShareDocs(new Set(docs.map(d => d.key)));
        }
    };

    const toggleSelectAllCatalogs = (compCats) => {
        if (selectedShareCatalogs.size === compCats.length) {
            setSelectedShareCatalogs(new Set());
        } else {
            setSelectedShareCatalogs(new Set(compCats.map(c => c._id)));
        }
    };

    const handleSharePhoneChange = async (e) => {
        const rawDigits = e.target.value.replace(/\D/g, '');
        const clean10 = rawDigits.slice(-10);
        setShareForm(prev => {
            if (shareClientAutoFilled) {
                return {
                    ...prev,
                    phone: clean10,
                    companyName: '',
                    contactPersonName: '',
                    email: '',
                    gstNumber: '',
                    address: ''
                };
            }
            return { ...prev, phone: clean10 };
        });
        setShareClientAutoFilled(false);

        if (clean10.length === 10) {
            setIsFetchingShareClient(true);
            try {
                const res = await api.get(`/auth/phone/${clean10}`);
                const u = res.data?.user || res.data;
                if (u && (u._id || u.phone)) {
                    setShareForm(prev => ({
                        ...prev,
                        phone: clean10,
                        companyName: u.companyName || '',
                        contactPersonName: u.contactPersonName || u.name || '',
                        email: (u.email && !u.email.includes('noemail')) ? u.email : '',
                        gstNumber: u.gstNumber || '',
                        address: u.address || u.clientAddress || ''
                    }));
                    setShareClientAutoFilled(true);
                    toast({
                        title: '✓ Client Found!',
                        description: `Auto-filled details for ${u.contactPersonName || u.companyName || u.name || 'Client'}.`,
                        status: 'info',
                        duration: 2500,
                        isClosable: true
                    });
                }
            } catch {
                // not found
            } finally {
                setIsFetchingShareClient(false);
            }
        }
    };

    const buildShareMessageText = (comp) => {
        let caption = `*${comp.companyName.toUpperCase()}*\nOfficial Company Statutory Credentials & Documents\n\n`;

        if (shareForm.includeStatutoryDetails) {
            caption += `🏢 *Company Profile:*\n`;
            if (comp.gstin) caption += `• *GSTIN:* ${comp.gstin}\n`;
            if (comp.panCardNumber) caption += `• *PAN Card:* ${comp.panCardNumber}\n`;
            if (comp.udyamNumber) caption += `• *Udyam Reg:* ${comp.udyamNumber}\n`;
            if (comp.contactNo) caption += `• *Contact:* ${comp.contactNo}\n`;
            if (comp.email) caption += `• *Email:* ${comp.email}\n`;
            if (comp.address) caption += `• *Address:* ${comp.address}${comp.state ? ', ' + comp.state : ''}${comp.pincode ? ' - ' + comp.pincode : ''}\n`;
            caption += `\n`;
        }

        if (shareForm.includeBankDetails && comp.bankDetails?.accountNumber) {
            caption += `🏦 *Official Bank Account Details:*\n`;
            caption += `• *Account Name:* ${comp.bankDetails.accountHolderName || comp.companyName}\n`;
            caption += `• *Bank Name:* ${comp.bankDetails.bankName}\n`;
            caption += `• *Account No:* ${comp.bankDetails.accountNumber}\n`;
            caption += `• *IFSC Code:* ${comp.bankDetails.ifscCode}\n\n`;
        }

        const selectedDocsList = getAvailableShareDocs(comp).filter(d => selectedShareDocs.has(d.key));
        const availCats = getAvailableShareCatalogs(comp);
        const selectedCatsList = availCats.filter(c => selectedShareCatalogs.has(c._id));

        if (selectedDocsList.length > 0 || selectedCatsList.length > 0) {
            caption += `📎 *Attached Statutory Documents & Catalogs:*\n`;
            let itemNum = 1;
            selectedDocsList.forEach(d => {
                caption += `${itemNum++}. ${d.title}\n`;
            });
            selectedCatsList.forEach(c => {
                caption += `${itemNum++}. [Catalog] ${c.title}\n`;
            });
            caption += `\n`;
        }

        if (shareForm.customMessage?.trim()) {
            caption += `💬 *Note:* ${shareForm.customMessage.trim()}\n\n`;
        }

        caption += `🌐 *Website:* https://uecivil.com`;
        return caption;
    };

    const handleSendShareWhatsapp = async () => {
        const rawDigits = shareForm.phone.replace(/\D/g, '');
        const cleanPhone = rawDigits.slice(-10);
        if (cleanPhone.length !== 10) {
            return toast({ title: 'Enter a valid 10-digit phone number', status: 'warning', duration: 2500 });
        }
        if (!shareTargetCompany) return;

        const comp = shareTargetCompany;
        const selectedDocsList = getAvailableShareDocs(comp).filter(d => selectedShareDocs.has(d.key));
        const availCats = getAvailableShareCatalogs(comp);
        const selectedCatsList = availCats.filter(c => selectedShareCatalogs.has(c._id));

        const filesToSend = [
            ...selectedDocsList.filter(d => d.url).map(d => d.url),
            ...selectedCatsList.filter(c => c.pdfUrl).map(c => c.pdfUrl)
        ];
        const titlesToSend = [
            ...selectedDocsList.filter(d => d.url).map(d => `${d.title} - ${comp.companyName}`),
            ...selectedCatsList.filter(c => c.pdfUrl).map(c => `[Catalog] ${c.title}`)
        ];

        setIsSendingShareWhatsapp(true);
        try {
            const caption = buildShareMessageText(comp);
            const payload = {
                phone: cleanPhone,
                companyName: shareForm.companyName.trim() || comp.companyName,
                contactPersonName: shareForm.contactPersonName.trim(),
                email: shareForm.email.trim(),
                gstNumber: shareForm.gstNumber.trim().toUpperCase(),
                address: shareForm.address.trim(),
                pdfUrls: filesToSend,
                catalogTitles: titlesToSend,
                message: caption
            };

            const res = await api.post('/whatsapp/send-catalog', payload);
            if (res.data?.success) {
                toast({
                    title: '🚀 Company Details & Documents Shared!',
                    description: `Sent successfully to ${cleanPhone} on WhatsApp & synced with Google Contacts.`,
                    status: 'success',
                    duration: 4000,
                    isClosable: true
                });
                setIsShareModalOpen(false);
            } else {
                throw new Error(res.data?.error || 'Failed to dispatch WhatsApp message');
            }
        } catch (err) {
            toast({
                title: 'Send Failed',
                description: err.response?.data?.error || err.message,
                status: 'error',
                duration: 4000,
                isClosable: true
            });
        } finally {
            setIsSendingShareWhatsapp(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        onConfirmOpen();
    };

    const confirmSubmit = async () => {
        onConfirmClose();
        setIsLoading(true);
        try {
            const uploadData = new FormData();
            Object.keys(formData).forEach(key => {
                if (key === 'bankDetails') {
                    uploadData.append(key, JSON.stringify(formData[key]));
                } else {
                    uploadData.append(key, formData[key] || '');
                }
            });

            if (logoFile) uploadData.append('logo', logoFile);
            if (udyamFile) uploadData.append('udyamDoc', udyamFile);
            if (panFile) uploadData.append('panCardDoc', panFile);
            if (gstFile) uploadData.append('gstDoc', gstFile);
            if (cancelledChequeFile) uploadData.append('cancelledChequeDoc', cancelledChequeFile);
            if (stampFile) uploadData.append('companyStamp', stampFile);
            if (otherDocFile) uploadData.append('otherDoc', otherDocFile);

            // Existing other statutory documents
            uploadData.append('existingOtherDocs', JSON.stringify(existingOtherDocs));

            // Existing company catalogs
            uploadData.append('existingCatalogs', JSON.stringify(existingCatalogs));

            // Append queued catalogs directly to company upload
            if (queuedCatalogs.length > 0) {
                queuedCatalogs.forEach(qc => {
                    uploadData.append('catalogs', qc.file);
                });
                uploadData.append('catalogTitles', JSON.stringify(queuedCatalogs.map(qc => qc.title)));
            }

            Object.keys(removeFlags).forEach(key => {
                if (removeFlags[key]) {
                    uploadData.append(`remove_${key}`, 'true');
                }
            });

            let response;
            if (editId) {
                response = await api.put(`/company-master/${editId}`, uploadData);
            } else {
                response = await api.post('/company-master', uploadData);
            }

            if (response.data.success) {
                const savedCompany = response.data.data || {};
                const companyId = editId || savedCompany._id;

                // Also index in global /catalogs collection for searchability
                if (queuedCatalogs.length > 0) {
                    for (const qc of queuedCatalogs) {
                        try {
                            const cFormData = new FormData();
                            cFormData.append('title', qc.title);
                            cFormData.append('category', 'General');
                            cFormData.append('description', `Company Catalog - ${formData.companyName}`);
                            cFormData.append('pdf', qc.file);
                            if (companyId) cFormData.append('companyId', companyId);
                            await api.post('/catalogs', cFormData, {
                                headers: { 'Content-Type': 'multipart/form-data' }
                            });
                        } catch (cErr) {
                            console.error("Failed to upload catalog to global list", qc.title, cErr);
                        }
                    }
                    fetchCatalogs();
                }

                toast({
                    title: "✓ Success",
                    description: `Company record & ${queuedCatalogs.length > 0 ? `${queuedCatalogs.length} catalog(s)` : 'documents'} saved successfully!`,
                    status: "success",
                    duration: 3500,
                    isClosable: true
                });

                // Clean form reset after saving
                handleAddNew();
                fetchCompanies();
            }
        } catch (error) {
            toast({
                title: "Error",
                description: error.response?.data?.message || "Failed to store record",
                status: "error",
                duration: 3500
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (c) => {
        setEditId(c._id);
        const cleanOther = getUniqueOtherDocs(c.otherDocs, c.otherDoc, c.otherDocTitle);
        setExistingOtherDocs(cleanOther);
        setExistingCatalogs(getCompanyCatalogs(c));
        setQueuedCatalogs([]);
        setCatalogInput({ title: '', file: null });

        setExistingDocs({
            logo: c.logo || '',
            udyamDoc: c.udyamDoc || '',
            panCardDoc: c.panCardDoc || '',
            gstDoc: c.gstDoc || '',
            cancelledChequeDoc: c.cancelledChequeDoc || '',
            companyStamp: c.companyStamp || '',
            otherDoc: c.otherDoc || ''
        });

        setRemoveFlags({
            logo: false, udyamDoc: false, panCardDoc: false, gstDoc: false,
            cancelledChequeDoc: false, companyStamp: false, otherDoc: false
        });

        setFormData({
            companyName: c.companyName || '',
            address: c.address || '',
            state: c.state || '',
            pincode: c.pincode || '',
            udyamNumber: c.udyamNumber || '',
            gstin: c.gstin || '',
            contactNo: c.contactNo || '',
            email: c.email || '',
            panCardNumber: c.panCardNumber || '',
            invoicePrefix: c.invoicePrefix || '',
            otherDocTitle: c.otherDocTitle || '',
            bankDetails: {
                accountHolderName: c.bankDetails?.accountHolderName || '',
                bankName: c.bankDetails?.bankName || '',
                accountNumber: c.bankDetails?.accountNumber || '',
                ifscCode: c.bankDetails?.ifscCode || ''
            }
        });
        setActiveTab(0);
        toast({
            title: `Loaded ${c.companyName}`,
            description: `Editing details and company-specific documents.`,
            status: "info",
            duration: 2000
        });
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this company record?')) return;
        try {
            await api.delete(`/company-master/${id}`);
            toast({ title: 'Company Deleted', status: 'info', duration: 2000 });
            fetchCompanies();
            if (editId === id) handleAddNew();
        } catch (err) {
            toast({
                title: 'Error',
                description: err.response?.data?.message || 'Delete failed',
                status: 'error',
                duration: 3000
            });
        }
    };

    return (
        <Box py={{ base: 2, md: 4 }} w="full">
            <Container maxW={{ base: "full", xl: "7xl" }} px={{ base: 0, md: 4 }}>
                <Card variant="elevated" borderRadius="2xl" boxShadow="xl" bg="white" overflow="hidden" border="1px solid" borderColor="gray.100">
                    
                    {/* Header Banner */}
                    <Box bgGradient="linear(to-r, teal.700, teal.500)" p={{ base: 5, md: 8 }} color="white">
                        <Stack direction={{ base: "column", md: "row" }} justify="space-between" align="center" spacing={4}>
                            <Box>
                                <HStack spacing={2} mb={1}>
                                    <Heading size="lg">Company Master & Credentials</Heading>
                                    <Badge colorScheme="cyan" fontSize="xs" px={2.5} py={0.5} borderRadius="full">
                                        {companies.length} Registered
                                    </Badge>
                                </HStack>
                                <Text opacity={0.9} fontSize="sm">
                                    Manage company billing credentials, statutory documents & multiple PDF catalogs company-wise.
                                </Text>
                            </Box>
                            <HStack w={{ base: "full", md: "auto" }} spacing={3} wrap="wrap">
                                <Input
                                    bg="white" color="gray.800" placeholder="Search Company Name..." size="md" borderRadius="xl"
                                    w={{ base: "full", md: "240px" }} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                                    _focus={{ borderColor: "cyan.300", boxShadow: "0 0 0 1px #4fd1c5" }}
                                />
                                <Button
                                    colorScheme="green"
                                    leftIcon={<Icon as={FiPlus} />}
                                    onClick={handleAddNew}
                                    borderRadius="xl"
                                    fontWeight="bold"
                                    boxShadow="md"
                                >
                                    + Add New Company
                                </Button>
                            </HStack>
                        </Stack>

                        {/* Quick Company Selector Pills */}
                        {companies.length > 0 && (
                            <Box mt={5} pt={4} borderTop="1px solid" borderColor="whiteAlpha.300">
                                <Flex align="center" wrap="wrap" gap={2}>
                                    <Text fontSize="xs" fontWeight="bold" opacity={0.9} mr={1}>
                                        Select Company to Edit / View:
                                    </Text>
                                    <Button
                                        size="xs"
                                        borderRadius="full"
                                        colorScheme={!editId ? "cyan" : "whiteAlpha"}
                                        variant={!editId ? "solid" : "outline"}
                                        color={!editId ? "teal.900" : "white"}
                                        fontWeight="bold"
                                        leftIcon={<Icon as={FiPlus} />}
                                        onClick={handleAddNew}
                                    >
                                        New Company (Clean Form)
                                    </Button>
                                    {companies.map(c => {
                                        const cCats = getCompanyCatalogs(c);
                                        const isSelected = editId === c._id;
                                        return (
                                            <Button
                                                key={c._id}
                                                size="xs"
                                                borderRadius="full"
                                                colorScheme={isSelected ? "yellow" : "whiteAlpha"}
                                                variant={isSelected ? "solid" : "outline"}
                                                color={isSelected ? "gray.900" : "white"}
                                                fontWeight="bold"
                                                leftIcon={<Icon as={FaBuilding} />}
                                                onClick={() => handleEdit(c)}
                                            >
                                                {c.companyName} ({cCats.length} {cCats.length === 1 ? 'Catalog' : 'Catalogs'})
                                            </Button>
                                        );
                                    })}
                                </Flex>
                            </Box>
                        )}
                    </Box>

                    <CardBody p={{ base: 4, md: 8 }}>
                        <Tabs index={activeTab} onChange={(idx) => setActiveTab(idx)} colorScheme="teal" variant="soft-rounded">
                            <TabList mb={6} justifyContent="center" bg="gray.50" p={2} borderRadius="2xl" border="1px solid" borderColor="gray.200">
                                <Tab fontWeight="bold" borderRadius="xl" px={8} py={3} _selected={{ color: 'white', bg: 'teal.600', shadow: 'md' }}>
                                    📝 Company Form {editId ? `(Editing: ${formData.companyName || 'Company'})` : '(New Company)'}
                                </Tab>
                                <Tab fontWeight="bold" borderRadius="xl" px={8} py={3} _selected={{ color: 'white', bg: 'teal.600', shadow: 'md' }}>
                                    👁️ View & Manage Companies ({companies.length})
                                </Tab>
                            </TabList>

                            <TabPanels>
                                {/* ══════════════ TAB 1: FORM ══════════════ */}
                                <TabPanel p={0}>
                                    {/* Mode Indicator Banner */}
                                    <Box
                                        mb={6} p={4} borderRadius="2xl" border="1px solid"
                                        bg={editId ? "blue.50" : "green.50"}
                                        borderColor={editId ? "blue.200" : "green.200"}
                                    >
                                        <Flex justify="space-between" align="center" wrap="wrap" gap={3}>
                                            <HStack spacing={3}>
                                                <Icon as={editId ? FaEdit : FiCheckCircle} color={editId ? "blue.600" : "green.600"} w={5} h={5} />
                                                <Box>
                                                    <Text fontSize="sm" fontWeight="800" color={editId ? "blue.900" : "green.900"}>
                                                        {editId
                                                            ? `Editing Company: ${formData.companyName || 'Company'}`
                                                            : 'Creating New Company Record (Clean Blank Form)'}
                                                    </Text>
                                                    <Text fontSize="xs" color={editId ? "blue.700" : "green.700"}>
                                                        {editId
                                                            ? 'Updating details and attaching company-specific statutory documents & catalogs.'
                                                            : 'All fields and file queues are clean for this new company. No documents from other companies are attached.'}
                                                    </Text>
                                                </Box>
                                            </HStack>
                                            {editId ? (
                                                <Button size="xs" colorScheme="blue" variant="outline" onClick={handleAddNew}>
                                                    Switch to Add New (Clean Form)
                                                </Button>
                                            ) : (
                                                <Badge colorScheme="green" fontSize="xs" px={3} py={1} borderRadius="full">
                                                    ✨ Clean New Form
                                                </Badge>
                                            )}
                                        </Flex>
                                    </Box>

                                    <form onSubmit={handleSubmit}>
                                        <VStack spacing={8}>
                                            {/* 1. Basic Company Details */}
                                            <Box w="full" p={5} bg="gray.50/50" borderRadius="2xl" border="1px solid" borderColor="gray.200">
                                                <Flex align="center" gap={2} mb={4}>
                                                    <Icon as={FaBuilding} color="teal.600" />
                                                    <Text fontSize="md" fontWeight="bold" color="teal.800">1. Basic Company Details</Text>
                                                </Flex>
                                                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
                                                    <FormControl isRequired>
                                                        <FormLabel fontWeight="bold" fontSize="xs">Company Name</FormLabel>
                                                        <Input name="companyName" value={formData.companyName} onChange={handleChange} placeholder="e.g. Unique Engineering" borderRadius="xl" bg="white" />
                                                    </FormControl>
                                                    <FormControl>
                                                        <FormLabel fontWeight="bold" fontSize="xs">Official Email Address</FormLabel>
                                                        <Input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="company@uecivil.com" borderRadius="xl" bg="white" />
                                                    </FormControl>
                                                    <FormControl>
                                                        <FormLabel fontWeight="bold" fontSize="xs">Contact / Mobile Number</FormLabel>
                                                        <Input name="contactNo" value={formData.contactNo} onChange={handleChange} placeholder="9099160391" borderRadius="xl" bg="white" />
                                                    </FormControl>
                                                    <FormControl>
                                                        <FormLabel fontWeight="bold" fontSize="xs">State</FormLabel>
                                                        <Input name="state" value={formData.state} onChange={handleChange} placeholder="Gujarat" borderRadius="xl" bg="white" />
                                                    </FormControl>
                                                    <FormControl>
                                                        <FormLabel fontWeight="bold" fontSize="xs">Pincode</FormLabel>
                                                        <Input name="pincode" value={formData.pincode} onChange={handleChange} placeholder="380051" borderRadius="xl" bg="white" />
                                                    </FormControl>
                                                    <FormControl>
                                                        <FormLabel fontWeight="bold" fontSize="xs">Full Office / Billing Address</FormLabel>
                                                        <Input name="address" value={formData.address} onChange={handleChange} placeholder="Plot No, Industrial Estate, City..." borderRadius="xl" bg="white" />
                                                    </FormControl>
                                                </SimpleGrid>
                                            </Box>

                                            {/* 2. Registration & Tax Details */}
                                            <Box w="full" p={5} bg="gray.50/50" borderRadius="2xl" border="1px solid" borderColor="gray.200">
                                                <Flex align="center" gap={2} mb={4}>
                                                    <Icon as={FiFileText} color="purple.600" />
                                                    <Text fontSize="md" fontWeight="bold" color="purple.800">2. Registration & Tax Details</Text>
                                                </Flex>
                                                <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4}>
                                                    <FormControl>
                                                        <FormLabel fontWeight="bold" fontSize="xs">Udyam Number</FormLabel>
                                                        <Input name="udyamNumber" value={formData.udyamNumber} onChange={handleChange} placeholder="UDYAM-GJ-01-..." borderRadius="xl" bg="white" />
                                                    </FormControl>
                                                    <FormControl>
                                                        <FormLabel fontWeight="bold" fontSize="xs">GSTIN</FormLabel>
                                                        <Input name="gstin" value={formData.gstin} onChange={handleChange} placeholder="24CHHPK0829H2ZG" borderRadius="xl" bg="white" />
                                                    </FormControl>
                                                    <FormControl>
                                                        <FormLabel fontWeight="bold" fontSize="xs">PAN Card Number</FormLabel>
                                                        <Input name="panCardNumber" value={formData.panCardNumber} onChange={handleChange} placeholder="CHHPK0829H" borderRadius="xl" bg="white" />
                                                    </FormControl>
                                                    <FormControl>
                                                        <FormLabel fontWeight="bold" fontSize="xs">Invoice Prefix (e.g. UE, ULI)</FormLabel>
                                                        <Input name="invoicePrefix" value={formData.invoicePrefix} onChange={handleChange} placeholder="Prefix (e.g. UE)" borderRadius="xl" bg="white" />
                                                    </FormControl>
                                                </SimpleGrid>
                                            </Box>

                                            {/* 3. Bank Account Details */}
                                            <Box w="full" p={5} bg="gray.50/50" borderRadius="2xl" border="1px solid" borderColor="gray.200">
                                                <Flex align="center" gap={2} mb={4}>
                                                    <Icon as={FiBriefcase} color="blue.600" />
                                                    <Text fontSize="md" fontWeight="bold" color="blue.800">3. Bank Account Details</Text>
                                                </Flex>
                                                <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4}>
                                                    <FormControl>
                                                        <FormLabel fontWeight="bold" fontSize="xs">Account Holder Name</FormLabel>
                                                        <Input name="accountHolderName" value={formData.bankDetails?.accountHolderName} onChange={handleChange} placeholder="Account Holder" borderRadius="xl" bg="white" />
                                                    </FormControl>
                                                    <FormControl>
                                                        <FormLabel fontWeight="bold" fontSize="xs">Bank Name</FormLabel>
                                                        <Input name="bankName" value={formData.bankDetails?.bankName} onChange={handleChange} placeholder="e.g. Indusind Bank" borderRadius="xl" bg="white" />
                                                    </FormControl>
                                                    <FormControl>
                                                        <FormLabel fontWeight="bold" fontSize="xs">Account Number</FormLabel>
                                                        <Input name="accountNumber" value={formData.bankDetails?.accountNumber} onChange={handleChange} placeholder="Account Number" borderRadius="xl" bg="white" />
                                                    </FormControl>
                                                    <FormControl>
                                                        <FormLabel fontWeight="bold" fontSize="xs">IFSC Code</FormLabel>
                                                        <Input name="ifscCode" value={formData.bankDetails?.ifscCode} onChange={handleChange} placeholder="INDB0000330" borderRadius="xl" bg="white" />
                                                    </FormControl>
                                                </SimpleGrid>
                                            </Box>

                                            {/* 4. Company Statutory Documents (Photo / PDF) */}
                                            <Box w="full" p={5} bg="gray.50/50" borderRadius="2xl" border="1px solid" borderColor="gray.200">
                                                <Flex align="center" gap={2} mb={4}>
                                                    <Icon as={FiLayers} color="teal.600" />
                                                    <Text fontSize="md" fontWeight="bold" color="teal.800">4. Company Statutory Documents & Stamp</Text>
                                                </Flex>
                                                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                                                    {/* 1. Logo */}
                                                    <FormControl>
                                                        <FormLabel fontWeight="bold" fontSize="xs">1. Company Logo (Photo/Image)</FormLabel>
                                                        {existingDocs.logo && !removeFlags.logo ? (
                                                            <HStack p={3} border="1px solid" borderColor="teal.200" borderRadius="xl" bg="teal.50" justify="space-between">
                                                                <HStack spacing={2}>
                                                                    <Image src={`${API_BASE_URL}${existingDocs.logo}`} w="32px" h="32px" objectFit="contain" />
                                                                    <Button size="xs" colorScheme="teal" variant="ghost" leftIcon={<Icon as={FaEye} />} onClick={() => window.open(`${API_BASE_URL}${existingDocs.logo}`, '_blank')}>View Logo</Button>
                                                                </HStack>
                                                                <IconButton size="xs" colorScheme="red" variant="ghost" icon={<Icon as={FaTrash} />} title="Remove Logo" onClick={() => setRemoveFlags(prev => ({ ...prev, logo: true }))} />
                                                            </HStack>
                                                        ) : (
                                                            <Box p={4} border="2px dashed" borderColor="teal.200" borderRadius="xl" bg="teal.50" textAlign="center" cursor="pointer" onClick={() => document.getElementById('logo-upload').click()} _hover={{ bg: "teal.100" }}>
                                                                <input type="file" id="logo-upload" hidden onChange={(e) => setLogoFile(e.target.files[0])} accept="image/*" />
                                                                <Icon as={FaCloudUploadAlt} w={6} h={6} color="teal.500" mb={1} />
                                                                <Text fontSize="xs" fontWeight="bold" color="teal.700">{logoFile ? `Selected: ${logoFile.name}` : "Upload Logo Image"}</Text>
                                                            </Box>
                                                        )}
                                                    </FormControl>

                                                    {/* 2. Company Stamp */}
                                                    <FormControl>
                                                        <FormLabel fontWeight="bold" fontSize="xs">2. Company Stamp / Seal (Photo/Image)</FormLabel>
                                                        {existingDocs.companyStamp && !removeFlags.companyStamp ? (
                                                            <HStack p={3} border="1px solid" borderColor="purple.200" borderRadius="xl" bg="purple.50" justify="space-between">
                                                                <HStack spacing={2}>
                                                                    <Image src={`${API_BASE_URL}${existingDocs.companyStamp}`} w="32px" h="32px" objectFit="contain" />
                                                                    <Button size="xs" colorScheme="purple" variant="ghost" leftIcon={<Icon as={FaEye} />} onClick={() => window.open(`${API_BASE_URL}${existingDocs.companyStamp}`, '_blank')}>View Stamp</Button>
                                                                </HStack>
                                                                <IconButton size="xs" colorScheme="red" variant="ghost" icon={<Icon as={FaTrash} />} title="Remove Stamp" onClick={() => setRemoveFlags(prev => ({ ...prev, companyStamp: true }))} />
                                                            </HStack>
                                                        ) : (
                                                            <Box p={4} border="2px dashed" borderColor="purple.200" borderRadius="xl" bg="purple.50" textAlign="center" cursor="pointer" onClick={() => document.getElementById('stamp-upload').click()} _hover={{ bg: "purple.100" }}>
                                                                <input type="file" id="stamp-upload" hidden onChange={(e) => setStampFile(e.target.files[0])} accept="image/*" />
                                                                <Icon as={FaCloudUploadAlt} w={6} h={6} color="purple.500" mb={1} />
                                                                <Text fontSize="xs" fontWeight="bold" color="purple.700">{stampFile ? `Selected: ${stampFile.name}` : "Upload Stamp Photo"}</Text>
                                                            </Box>
                                                        )}
                                                    </FormControl>

                                                    {/* 3. Udyam Doc */}
                                                    <FormControl>
                                                        <FormLabel fontWeight="bold" fontSize="xs">3. Udyam Registration (PDF / Photo)</FormLabel>
                                                        {existingDocs.udyamDoc && !removeFlags.udyamDoc ? (
                                                            <HStack p={3} border="1px solid" borderColor="blue.200" borderRadius="xl" bg="blue.50" justify="space-between">
                                                                <HStack spacing={2}>
                                                                    <Badge colorScheme="blue">Saved Udyam</Badge>
                                                                    <Button size="xs" colorScheme="blue" variant="ghost" leftIcon={<Icon as={FaEye} />} onClick={() => window.open(`${API_BASE_URL}${existingDocs.udyamDoc}`, '_blank')}>View File</Button>
                                                                </HStack>
                                                                <IconButton size="xs" colorScheme="red" variant="ghost" icon={<Icon as={FaTrash} />} title="Remove Udyam Doc" onClick={() => setRemoveFlags(prev => ({ ...prev, udyamDoc: true }))} />
                                                            </HStack>
                                                        ) : (
                                                            <Box p={4} border="2px dashed" borderColor="blue.200" borderRadius="xl" bg="blue.50" textAlign="center" cursor="pointer" onClick={() => document.getElementById('udyam-upload').click()} _hover={{ bg: "blue.100" }}>
                                                                <input type="file" id="udyam-upload" hidden onChange={(e) => setUdyamFile(e.target.files[0])} accept="image/*,.pdf" />
                                                                <Icon as={FaCloudUploadAlt} w={6} h={6} color="blue.500" mb={1} />
                                                                <Text fontSize="xs" fontWeight="bold" color="blue.700">{udyamFile ? `Selected: ${udyamFile.name}` : "Upload Udyam Document"}</Text>
                                                            </Box>
                                                        )}
                                                    </FormControl>

                                                    {/* 4. PAN Card Doc */}
                                                    <FormControl>
                                                        <FormLabel fontWeight="bold" fontSize="xs">4. PAN Card (Photo / PDF)</FormLabel>
                                                        {existingDocs.panCardDoc && !removeFlags.panCardDoc ? (
                                                            <HStack p={3} border="1px solid" borderColor="orange.200" borderRadius="xl" bg="orange.50" justify="space-between">
                                                                <HStack spacing={2}>
                                                                    <Badge colorScheme="orange">Saved PAN</Badge>
                                                                    <Button size="xs" colorScheme="orange" variant="ghost" leftIcon={<Icon as={FaEye} />} onClick={() => window.open(`${API_BASE_URL}${existingDocs.panCardDoc}`, '_blank')}>View File</Button>
                                                                </HStack>
                                                                <IconButton size="xs" colorScheme="red" variant="ghost" icon={<Icon as={FaTrash} />} title="Remove PAN Card" onClick={() => setRemoveFlags(prev => ({ ...prev, panCardDoc: true }))} />
                                                            </HStack>
                                                        ) : (
                                                            <Box p={4} border="2px dashed" borderColor="orange.200" borderRadius="xl" bg="orange.50" textAlign="center" cursor="pointer" onClick={() => document.getElementById('pan-upload').click()} _hover={{ bg: "orange.100" }}>
                                                                <input type="file" id="pan-upload" hidden onChange={(e) => setPanFile(e.target.files[0])} accept="image/*,.pdf" />
                                                                <Icon as={FaCloudUploadAlt} w={6} h={6} color="orange.500" mb={1} />
                                                                <Text fontSize="xs" fontWeight="bold" color="orange.700">{panFile ? `Selected: ${panFile.name}` : "Upload PAN Card"}</Text>
                                                            </Box>
                                                        )}
                                                    </FormControl>

                                                    {/* 5. GST Doc */}
                                                    <FormControl>
                                                        <FormLabel fontWeight="bold" fontSize="xs">5. GST Certificate (Photo / PDF)</FormLabel>
                                                        {existingDocs.gstDoc && !removeFlags.gstDoc ? (
                                                            <HStack p={3} border="1px solid" borderColor="green.200" borderRadius="xl" bg="green.50" justify="space-between">
                                                                <HStack spacing={2}>
                                                                    <Badge colorScheme="green">Saved GST</Badge>
                                                                    <Button size="xs" colorScheme="green" variant="ghost" leftIcon={<Icon as={FaEye} />} onClick={() => window.open(`${API_BASE_URL}${existingDocs.gstDoc}`, '_blank')}>View File</Button>
                                                                </HStack>
                                                                <IconButton size="xs" colorScheme="red" variant="ghost" icon={<Icon as={FaTrash} />} title="Remove GST Cert" onClick={() => setRemoveFlags(prev => ({ ...prev, gstDoc: true }))} />
                                                            </HStack>
                                                        ) : (
                                                            <Box p={4} border="2px dashed" borderColor="green.200" borderRadius="xl" bg="green.50" textAlign="center" cursor="pointer" onClick={() => document.getElementById('gst-upload').click()} _hover={{ bg: "green.100" }}>
                                                                <input type="file" id="gst-upload" hidden onChange={(e) => setGstFile(e.target.files[0])} accept="image/*,.pdf" />
                                                                <Icon as={FaCloudUploadAlt} w={6} h={6} color="green.500" mb={1} />
                                                                <Text fontSize="xs" fontWeight="bold" color="green.700">{gstFile ? `Selected: ${gstFile.name}` : "Upload GST Certificate"}</Text>
                                                            </Box>
                                                        )}
                                                    </FormControl>

                                                    {/* 6. Cancelled Cheque Doc */}
                                                    <FormControl>
                                                        <FormLabel fontWeight="bold" fontSize="xs">6. Cancelled Cheque (Photo / PDF)</FormLabel>
                                                        {existingDocs.cancelledChequeDoc && !removeFlags.cancelledChequeDoc ? (
                                                            <HStack p={3} border="1px solid" borderColor="red.200" borderRadius="xl" bg="red.50" justify="space-between">
                                                                <HStack spacing={2}>
                                                                    <Badge colorScheme="red">Saved Cheque</Badge>
                                                                    <Button size="xs" colorScheme="red" variant="ghost" leftIcon={<Icon as={FaEye} />} onClick={() => window.open(`${API_BASE_URL}${existingDocs.cancelledChequeDoc}`, '_blank')}>View File</Button>
                                                                </HStack>
                                                                <IconButton size="xs" colorScheme="red" variant="ghost" icon={<Icon as={FaTrash} />} title="Remove Cheque" onClick={() => setRemoveFlags(prev => ({ ...prev, cancelledChequeDoc: true }))} />
                                                            </HStack>
                                                        ) : (
                                                            <Box p={4} border="2px dashed" borderColor="red.200" borderRadius="xl" bg="red.50" textAlign="center" cursor="pointer" onClick={() => document.getElementById('cheque-upload').click()} _hover={{ bg: "red.100" }}>
                                                                <input type="file" id="cheque-upload" hidden onChange={(e) => setCancelledChequeFile(e.target.files[0])} accept="image/*,.pdf" />
                                                                <Icon as={FaCloudUploadAlt} w={6} h={6} color="red.500" mb={1} />
                                                                <Text fontSize="xs" fontWeight="bold" color="red.700">{cancelledChequeFile ? `Selected: ${cancelledChequeFile.name}` : "Upload Cancelled Cheque"}</Text>
                                                            </Box>
                                                        )}
                                                    </FormControl>

                                                    {/* 7. Other Documents (Multiple Allowed, Deduplicated) */}
                                                    <FormControl gridColumn={{ base: "span 1", md: "span 2" }}>
                                                        <FormLabel fontWeight="bold" fontSize="xs">
                                                            7. Other Statutory Documents (Multiple Allowed: ISO, Trade License, Incorporation, MSME)
                                                        </FormLabel>
                                                        
                                                        {/* List of existing other documents */}
                                                        {existingOtherDocs.length > 0 && (
                                                            <VStack align="stretch" spacing={2} mb={3}>
                                                                {existingOtherDocs.map((od, idx) => (
                                                                    <HStack key={od._id || idx} p={2.5} border="1px solid" borderColor="purple.200" borderRadius="lg" bg="purple.50" justify="space-between">
                                                                        <HStack spacing={2}>
                                                                            <Badge colorScheme="purple">{od.title || `Doc #${idx + 1}`}</Badge>
                                                                            <Button size="xs" colorScheme="purple" variant="ghost" leftIcon={<Icon as={FaEye} />} onClick={() => window.open(`${API_BASE_URL}${od.url}`, '_blank')}>View</Button>
                                                                        </HStack>
                                                                        <IconButton size="xs" colorScheme="red" variant="ghost" icon={<Icon as={FaTrash} />} title="Remove this document" onClick={() => setExistingOtherDocs(prev => prev.filter((_, i) => i !== idx))} />
                                                                    </HStack>
                                                                ))}
                            </VStack>
                        )}

                        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={3} alignItems="center">
                            <Box gridColumn={{ base: "span 1", md: "span 2" }}>
                                <Input
                                    size="sm"
                                    borderRadius="lg"
                                    placeholder="New Document Title (e.g. ISO 9001 Certificate, MSME, Trade License)"
                                    name="otherDocTitle"
                                    value={formData.otherDocTitle || ''}
                                    onChange={handleChange}
                                    bg="white"
                                />
                            </Box>
                            <Box
                                p={2.5}
                                border="2px dashed"
                                borderColor={otherDocFile ? "purple.400" : "purple.200"}
                                borderRadius="xl"
                                bg={otherDocFile ? "purple.100" : "purple.50"}
                                textAlign="center"
                                cursor="pointer"
                                onClick={() => document.getElementById('other-doc-upload').click()}
                                _hover={{ bg: "purple.100" }}
                            >
                                <input type="file" id="other-doc-upload" hidden onChange={(e) => setOtherDocFile(e.target.files[0])} accept="image/*,.pdf" />
                                <Text fontSize="xs" fontWeight="bold" color="purple.800" isTruncated>
                                    {otherDocFile ? `Selected: ${otherDocFile.name}` : "+ Choose File to Upload"}
                                </Text>
                            </Box>
                        </SimpleGrid>
                    </FormControl>
                </SimpleGrid>
            </Box>

            {/* ════ 8. Company Catalogs & Product Brochures (Company-Wise) ════ */}
            <Box w="full" p={5} border="2px solid" borderColor="teal.300" borderRadius="2xl" bg="teal.50/40">
                <Flex justify="space-between" align="center" wrap="wrap" gap={2} mb={3}>
                    <HStack spacing={2}>
                        <Icon as={FaFilePdf} color="teal.600" w={5} h={5} />
                        <Text fontSize="md" fontWeight="bold" color="teal.900">
                            8. Company Catalogs & Product Brochures (Company-Wise)
                        </Text>
                    </HStack>
                    <Badge colorScheme={editId ? "teal" : "green"} borderRadius="full" px={3} py={1} fontSize="xs" fontWeight="bold">
                        {editId
                            ? `${existingCatalogs.length} Active for ${formData.companyName || 'This Company'}${queuedCatalogs.length > 0 ? ` • +${queuedCatalogs.length} Queued` : ''}`
                            : `✨ Clean New Form • 0 Active Catalogs${queuedCatalogs.length > 0 ? ` • +${queuedCatalogs.length} Queued` : ''}`}
                    </Badge>
                </Flex>

                <Text fontSize="xs" color="gray.600" mb={4}>
                    Add and manage product catalogs, testing brochures, and technical pamphlets specifically for this company. Each company maintains its own isolated catalogs list.
                </Text>

                {/* Existing Catalogs for this Company (when editing) */}
                {editId ? (
                    existingCatalogs.length > 0 ? (
                        <Box mb={4}>
                            <Text fontSize="xs" fontWeight="bold" color="gray.700" mb={2}>
                                Active Catalogs for {formData.companyName || 'This Company'} ({existingCatalogs.length}):
                            </Text>
                            <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} spacing={3}>
                                {existingCatalogs.map((cat, idx) => (
                                    <HStack key={cat._id || idx} p={3} bg="white" borderRadius="xl" border="1px solid" borderColor="teal.200" justify="space-between" shadow="xs">
                                        <VStack align="start" spacing={0} overflow="hidden" flex={1}>
                                            <Text fontSize="xs" fontWeight="bold" color="teal.900" isTruncated maxW="180px">{cat.title}</Text>
                                            <Text fontSize="10px" color="gray.500">
                                                {cat.uploadedAt ? new Date(cat.uploadedAt).toLocaleDateString() : 'Active Catalog'}
                                            </Text>
                                        </VStack>
                                        <HStack spacing={1}>
                                            <IconButton
                                                size="xs"
                                                colorScheme="teal"
                                                variant="ghost"
                                                icon={<Icon as={FaEye} />}
                                                title="View Catalog PDF"
                                                onClick={() => window.open(`${API_BASE_URL}${cat.url || cat.pdfUrl}`, '_blank')}
                                            />
                                            <IconButton
                                                size="xs"
                                                colorScheme="red"
                                                variant="ghost"
                                                icon={<Icon as={FaTrash} />}
                                                title="Remove Catalog"
                                                onClick={() => handleRemoveExistingCatalog(cat._id || cat.url, cat.title)}
                                            />
                                        </HStack>
                                    </HStack>
                                ))}
                            </SimpleGrid>
                        </Box>
                    ) : (
                        <Box mb={4} p={3} bg="white" borderRadius="xl" border="1px dashed" borderColor="teal.200" textAlign="center">
                            <Text fontSize="xs" color="gray.500">
                                No active catalogs attached to {formData.companyName || 'this company'} yet. Add documents below to attach.
                            </Text>
                        </Box>
                    )
                ) : (
                    <Box mb={4} p={3} bg="green.50" borderRadius="xl" border="1px dashed" borderColor="green.300" textAlign="center">
                        <Text fontSize="xs" color="green.800" fontWeight="600">
                            ✨ Brand New Company Form — Clean slate with 0 catalogs. You can queue catalogs below to save with this company.
                        </Text>
                    </Box>
                )}

                {/* Queued Catalogs to be saved */}
                {queuedCatalogs.length > 0 && (
                    <Box mb={4} p={3.5} bg="white" borderRadius="xl" border="2px dashed" borderColor="teal.400">
                        <Text fontSize="xs" fontWeight="bold" color="teal.800" mb={2}>
                            Queued Catalogs to Upload on Save ({queuedCatalogs.length}):
                        </Text>
                        <VStack align="stretch" spacing={2}>
                            {queuedCatalogs.map(qc => (
                                <HStack key={qc.id} p={2.5} bg="teal.50" borderRadius="lg" justify="space-between">
                                    <HStack spacing={2.5}>
                                        <Icon as={FaFilePdf} color="teal.600" />
                                        <VStack align="start" spacing={0}>
                                            <Text fontSize="xs" fontWeight="bold" color="teal.900">{qc.title}</Text>
                                            <Text fontSize="10px" color="gray.500">{qc.fileName} ({qc.fileSize})</Text>
                                        </VStack>
                                    </HStack>
                                    <IconButton
                                        size="xs"
                                        colorScheme="red"
                                        variant="ghost"
                                        icon={<Icon as={FaTrash} />}
                                        title="Remove from queue"
                                        onClick={() => handleRemoveQueuedCatalog(qc.id)}
                                    />
                                </HStack>
                            ))}
                        </VStack>
                    </Box>
                )}

                {/* Input Bar to Add Multiple Catalogs */}
                <Box p={3.5} bg="white" borderRadius="xl" border="1px solid" borderColor="gray.200">
                    <Text fontSize="xs" fontWeight="bold" color="gray.700" mb={2}>+ Add a Catalog / Brochure Document (Can add multiple):</Text>
                    <SimpleGrid columns={{ base: 1, md: 5 }} spacing={3} alignItems="center">
                        <Box gridColumn={{ base: "span 1", md: "span 2" }}>
                            <Input
                                size="sm"
                                borderRadius="lg"
                                placeholder="Catalog Title (e.g. TESTING INSTRUMENTS 2026)"
                                value={catalogInput.title}
                                onChange={e => setCatalogInput(p => ({ ...p, title: e.target.value.toUpperCase() }))}
                            />
                        </Box>
                        <Box gridColumn={{ base: "span 1", md: "span 2" }}>
                            <Box
                                p={2}
                                border="1px dashed"
                                borderColor={catalogInput.file ? "teal.400" : "gray.300"}
                                borderRadius="lg"
                                bg={catalogInput.file ? "teal.50" : "gray.50"}
                                textAlign="center"
                                cursor="pointer"
                                onClick={() => document.getElementById('company-new-catalog-input').click()}
                            >
                                <input
                                    type="file"
                                    id="company-new-catalog-input"
                                    hidden
                                    accept=".pdf,image/*"
                                    onChange={e => {
                                        if (e.target.files?.[0]) {
                                            const f = e.target.files[0];
                                            setCatalogInput(p => ({
                                                ...p,
                                                file: f,
                                                title: p.title || f.name.replace(/\.[^/.]+$/, '').toUpperCase()
                                            }));
                                        }
                                    }}
                                />
                                <Text fontSize="xs" fontWeight="bold" color={catalogInput.file ? "teal.700" : "gray.600"} isTruncated>
                                    {catalogInput.file ? `Selected: ${catalogInput.file.name}` : "Choose PDF or Image File..."}
                                </Text>
                            </Box>
                        </Box>
                        <Button
                            size="sm"
                            colorScheme="teal"
                            borderRadius="lg"
                            leftIcon={<Icon as={FiPlus} />}
                            onClick={handleAddQueuedCatalog}
                        >
                            Add to List
                        </Button>
                    </SimpleGrid>
                </Box>
            </Box>

            {/* Submit & Cancel Buttons */}
            <SimpleGrid columns={{ base: 1, md: editId ? 2 : 1 }} spacing={4} w="full">
                <Button
                    size="lg"
                    colorScheme="teal"
                    borderRadius="xl"
                    h="56px"
                    type="submit"
                    leftIcon={<FaBuilding />}
                    isLoading={isLoading}
                    boxShadow="lg"
                    fontWeight="bold"
                >
                    {editId ? 'Update Company Record & Catalogs' : 'Save New Company Record & Catalogs'}
                </Button>
                {editId && (
                    <Button
                        variant="outline"
                        colorScheme="gray"
                        borderRadius="xl"
                        h="56px"
                        onClick={handleAddNew}
                        leftIcon={<Icon as={FiRefreshCw} />}
                    >
                        Cancel Edit (Clean Form)
                    </Button>
                )}
            </SimpleGrid>
        </VStack>
    </form>
</TabPanel>

                                {/* ══════════════ TAB 2: VIEW COMPANIES & DOCUMENTS ══════════════ */}
                                <TabPanel p={0}>
                                    <Box mt={2} overflowX="auto">
                                        <Table variant="simple" bg="white" borderRadius="2xl" overflow="hidden">
                                            <Thead bg="gray.100">
                                                <Tr>
                                                    <Th>Company Name & Identity</Th>
                                                    <Th>Tax / Reg Details</Th>
                                                    <Th>Uploaded Statutory Docs</Th>
                                                    <Th>Company Catalogs</Th>
                                                    <Th textAlign="center">Actions</Th>
                                                </Tr>
                                            </Thead>
                                            <Tbody>
                                                {filteredCompanies.map(c => {
                                                    const compCats = getCompanyCatalogs(c);
                                                    const uniqueOther = getUniqueOtherDocs(c.otherDocs, c.otherDoc, c.otherDocTitle);
                                                    return (
                                                        <Tr key={c._id} _hover={{ bg: "gray.50" }}>
                                                            {/* Clean Company Column (NO raw upload image thumbnails in row) */}
                                                            <Td>
                                                                <HStack spacing={3}>
                                                                    <Box p={2.5} bg="teal.50" color="teal.600" borderRadius="xl" border="1px solid" borderColor="teal.100">
                                                                        <Icon as={FaBuilding} w={5} h={5} />
                                                                    </Box>
                                                                    <VStack align="start" spacing={1}>
                                                                        <Text fontSize="sm" fontWeight="800" color="teal.800">{c.companyName}</Text>
                                                                        <HStack spacing={1.5} wrap="wrap">
                                                                            {c.invoicePrefix && (
                                                                                <Badge colorScheme="purple" fontSize="10px">Prefix: {c.invoicePrefix}</Badge>
                                                                            )}
                                                                            {c.state && (
                                                                                <Badge colorScheme="gray" fontSize="10px">{c.state}</Badge>
                                                                            )}
                                                                        </HStack>
                                                                        <Text fontSize="11px" color="gray.500">{c.email || c.contactNo || '—'}</Text>
                                                                    </VStack>
                                                                </HStack>
                                                            </Td>

                                                            {/* Tax / Reg Details */}
                                                            <Td>
                                                                <VStack align="start" spacing={0.5} fontSize="xs">
                                                                    <Text fontWeight="600" color="gray.700">GST: <span style={{ fontFamily: 'monospace' }}>{c.gstin || '—'}</span></Text>
                                                                    <Text color="gray.500">PAN: <span style={{ fontFamily: 'monospace' }}>{c.panCardNumber || '—'}</span></Text>
                                                                    {c.udyamNumber && <Text color="gray.500" fontSize="10px" isTruncated maxW="150px">Udyam: {c.udyamNumber}</Text>}
                                                                </VStack>
                                                            </Td>

                                                            {/* Uploaded Statutory Documents (Strictly deduplicated, NO stamp/logo) */}
                                                            <Td>
                                                                <Wrap spacing={1.5} maxW="320px">
                                                                    {c.udyamDoc && (
                                                                        <Button size="xs" colorScheme="blue" variant="subtle" leftIcon={<Icon as={FaEye} />} onClick={() => window.open(`${API_BASE_URL}${c.udyamDoc}`, '_blank')}>
                                                                            Udyam
                                                                        </Button>
                                                                    )}
                                                                    {c.panCardDoc && (
                                                                        <Button size="xs" colorScheme="orange" variant="subtle" leftIcon={<Icon as={FaEye} />} onClick={() => window.open(`${API_BASE_URL}${c.panCardDoc}`, '_blank')}>
                                                                            PAN Card
                                                                        </Button>
                                                                    )}
                                                                    {c.gstDoc && (
                                                                        <Button size="xs" colorScheme="green" variant="subtle" leftIcon={<Icon as={FaEye} />} onClick={() => window.open(`${API_BASE_URL}${c.gstDoc}`, '_blank')}>
                                                                            GST Cert
                                                                        </Button>
                                                                    )}
                                                                    {c.cancelledChequeDoc && (
                                                                        <Button size="xs" colorScheme="red" variant="subtle" leftIcon={<Icon as={FaEye} />} onClick={() => window.open(`${API_BASE_URL}${c.cancelledChequeDoc}`, '_blank')}>
                                                                            Cheque
                                                                        </Button>
                                                                    )}
                                                                    {uniqueOther.map((od, idx) => (
                                                                        <Button key={od._id || idx} size="xs" colorScheme="teal" variant="subtle" leftIcon={<Icon as={FaEye} />} onClick={() => window.open(`${API_BASE_URL}${od.url}`, '_blank')}>
                                                                            {od.title || `Other Doc #${idx + 1}`}
                                                                        </Button>
                                                                    ))}
                                                                    {!c.udyamDoc && !c.panCardDoc && !c.gstDoc && !c.cancelledChequeDoc && uniqueOther.length === 0 && (
                                                                        <Text fontSize="xs" color="gray.400">0 Documents</Text>
                                                                    )}
                                                                </Wrap>
                                                            </Td>

                                                            {/* Company-Specific Catalogs Column (Only for this company, deduplicated) */}
                                                            <Td>
                                                                {compCats.length > 0 ? (
                                                                    <VStack align="start" spacing={1}>
                                                                        <Badge colorScheme="purple" borderRadius="md" px={2} py={0.5} fontSize="10px">
                                                                            {compCats.length} {compCats.length === 1 ? 'Catalog' : 'Catalogs'}
                                                                        </Badge>
                                                                        <Wrap spacing={1} maxW="200px">
                                                                            {compCats.map((cat, cIdx) => (
                                                                                <Button
                                                                                    key={cat._id || cIdx}
                                                                                    size="2xs"
                                                                                    colorScheme="purple"
                                                                                    variant="solid"
                                                                                    leftIcon={<Icon as={FaFilePdf} />}
                                                                                    onClick={() => window.open(`${API_BASE_URL}${cat.url || cat.pdfUrl}`, '_blank')}
                                                                                    title={`View ${cat.title} PDF`}
                                                                                >
                                                                                    {cat.title}
                                                                                </Button>
                                                                            ))}
                                                                        </Wrap>
                                                                    </VStack>
                                                                ) : (
                                                                    <Text fontSize="xs" color="gray.400">0 Catalogs</Text>
                                                                )}
                                                            </Td>

                                                            {/* Actions */}
                                                            <Td textAlign="center">
                                                                <HStack justify="center" spacing={1.5}>
                                                                    <Button
                                                                        size="xs"
                                                                        bg="#25D366"
                                                                        color="white"
                                                                        _hover={{ bg: "#128C7E", transform: "scale(1.02)" }}
                                                                        leftIcon={<Icon as={FaWhatsapp} />}
                                                                        fontWeight="bold"
                                                                        borderRadius="lg"
                                                                        boxShadow="0 2px 6px rgba(37, 211, 102, 0.3)"
                                                                        onClick={() => openShareModal(c)}
                                                                        title="Share Company Credentials & Documents on WhatsApp"
                                                                    >
                                                                        Share
                                                                    </Button>
                                                                    <IconButton
                                                                        size="sm"
                                                                        colorScheme="teal"
                                                                        variant="ghost"
                                                                        icon={<Icon as={FaEye} />}
                                                                        title="View Company Details"
                                                                        onClick={() => setViewCompanyModal(c)}
                                                                    />
                                                                    <IconButton
                                                                        size="sm"
                                                                        colorScheme="blue"
                                                                        variant="ghost"
                                                                        icon={<Icon as={FaEdit} />}
                                                                        title="Edit Company"
                                                                        onClick={() => handleEdit(c)}
                                                                    />
                                                                    <IconButton
                                                                        size="sm"
                                                                        colorScheme="red"
                                                                        variant="ghost"
                                                                        icon={<Icon as={FaTrash} />}
                                                                        title="Delete Company"
                                                                        onClick={() => handleDelete(c._id)}
                                                                    />
                                                                </HStack>
                                                            </Td>
                                                        </Tr>
                                                    );
                                                })}
                                            </Tbody>
                                        </Table>
                                    </Box>
                                </TabPanel>
                            </TabPanels>
                        </Tabs>
                    </CardBody>
                </Card>
            </Container>

            {/* ── View Company Details Modal (Includes Company-Wise Catalogs & Multiple Docs) ── */}
            <Modal isOpen={Boolean(viewCompanyModal)} onClose={() => setViewCompanyModal(null)} size="2xl" isCentered scrollBehavior="inside">
                <ModalOverlay backdropFilter="blur(6px)" bg="blackAlpha.600" />
                <ModalContent borderRadius="3xl" overflow="hidden" boxShadow="2xl">
                    <ModalHeader bg="teal.700" color="white" p={6}>
                        <Flex justify="space-between" align="center" wrap="wrap" gap={3}>
                            <HStack spacing={4}>
                                {viewCompanyModal?.logo ? (
                                    <Image src={`${API_BASE_URL}${viewCompanyModal.logo}`} w="48px" h="48px" objectFit="contain" bg="white" p={1} borderRadius="lg" />
                                ) : (
                                    <Box p={2.5} bg="whiteAlpha.200" borderRadius="xl">
                                        <Icon as={FaBuilding} w={7} h={7} color="white" />
                                    </Box>
                                )}
                                <VStack align="start" spacing={0}>
                                    <Heading size="md" color="white">{viewCompanyModal?.companyName}</Heading>
                                    <Text fontSize="xs" opacity={0.9}>Invoice Prefix: <b>{viewCompanyModal?.invoicePrefix || 'UE'}</b></Text>
                                </VStack>
                            </HStack>
                            <Button
                                size="sm"
                                bg="#25D366"
                                color="white"
                                _hover={{ bg: "#128C7E", transform: "scale(1.02)" }}
                                _active={{ bg: "#075E54" }}
                                leftIcon={<Icon as={FaWhatsapp} size={16} />}
                                fontWeight="bold"
                                borderRadius="xl"
                                mr={8}
                                boxShadow="0 2px 8px rgba(37, 211, 102, 0.4)"
                                onClick={() => openShareModal(viewCompanyModal)}
                            >
                                Share on WhatsApp
                            </Button>
                        </Flex>
                    </ModalHeader>
                    <ModalCloseButton color="white" top={6} right={6} />
                    <ModalBody p={6}>
                        {viewCompanyModal && (
                            <VStack spacing={6} align="stretch">
                                {/* Basic Company Info */}
                                <Box bg="gray.50" p={4} borderRadius="2xl" border="1px solid" borderColor="gray.200">
                                    <Text fontSize="xs" fontWeight="black" color="teal.700" textTransform="uppercase" mb={3}>📍 Company Profile</Text>
                                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3} fontSize="xs">
                                        <Box><Text color="gray.500">Address:</Text><Text fontWeight="bold">{viewCompanyModal.address || '—'}</Text></Box>
                                        <Box><Text color="gray.500">State & Pincode:</Text><Text fontWeight="bold">{viewCompanyModal.state || '—'} - {viewCompanyModal.pincode || '—'}</Text></Box>
                                        <Box><Text color="gray.500">Email:</Text><Text fontWeight="bold">{viewCompanyModal.email || '—'}</Text></Box>
                                        <Box><Text color="gray.500">Contact No:</Text><Text fontWeight="bold">{viewCompanyModal.contactNo || '—'}</Text></Box>
                                    </SimpleGrid>
                                </Box>

                                {/* Registration Numbers */}
                                <Box bg="purple.50" p={4} borderRadius="2xl" border="1px solid" borderColor="purple.200">
                                    <Text fontSize="xs" fontWeight="black" color="purple.700" textTransform="uppercase" mb={3}>📋 Registration & Tax Numbers</Text>
                                    <SimpleGrid columns={{ base: 1, md: 3 }} spacing={3} fontSize="xs">
                                        <Box><Text color="purple.600">GSTIN / UIN:</Text><Text fontWeight="extrabold">{viewCompanyModal.gstin || '—'}</Text></Box>
                                        <Box><Text color="purple.600">PAN Card No:</Text><Text fontWeight="extrabold">{viewCompanyModal.panCardNumber || '—'}</Text></Box>
                                        <Box><Text color="purple.600">Udyam No:</Text><Text fontWeight="extrabold">{viewCompanyModal.udyamNumber || '—'}</Text></Box>
                                    </SimpleGrid>
                                </Box>

                                {/* Bank Details */}
                                <Box bg="blue.50" p={4} borderRadius="2xl" border="1px solid" borderColor="blue.200">
                                    <Text fontSize="xs" fontWeight="black" color="blue.700" textTransform="uppercase" mb={3}>🏦 Bank Account Details</Text>
                                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3} fontSize="xs">
                                        <Box><Text color="blue.600">Account Holder Name:</Text><Text fontWeight="bold">{viewCompanyModal.bankDetails?.accountHolderName || '—'}</Text></Box>
                                        <Box><Text color="blue.600">Bank Name:</Text><Text fontWeight="bold">{viewCompanyModal.bankDetails?.bankName || '—'}</Text></Box>
                                        <Box><Text color="blue.600">Account Number:</Text><Text fontWeight="bold">{viewCompanyModal.bankDetails?.accountNumber || '—'}</Text></Box>
                                        <Box><Text color="blue.600">IFSC Code:</Text><Text fontWeight="bold">{viewCompanyModal.bankDetails?.ifscCode || '—'}</Text></Box>
                                    </SimpleGrid>
                                </Box>

                                {/* Document Attachments (Statutory Credentials, Deduplicated) */}
                                <Box bg="teal.50" p={4} borderRadius="2xl" border="1px solid" borderColor="teal.200">
                                    <Text fontSize="xs" fontWeight="black" color="teal.800" textTransform="uppercase" mb={3}>
                                        📁 Uploaded Statutory Documents & Certificates
                                    </Text>
                                    <Wrap spacing={3}>
                                        {viewCompanyModal.udyamDoc && (
                                            <Button size="sm" colorScheme="blue" variant="solid" leftIcon={<Icon as={FaEye} />} onClick={() => window.open(`${API_BASE_URL}${viewCompanyModal.udyamDoc}`, '_blank')}>
                                                View Udyam Certificate
                                            </Button>
                                        )}
                                        {viewCompanyModal.panCardDoc && (
                                            <Button size="sm" colorScheme="orange" variant="solid" leftIcon={<Icon as={FaEye} />} onClick={() => window.open(`${API_BASE_URL}${viewCompanyModal.panCardDoc}`, '_blank')}>
                                                View PAN Card
                                            </Button>
                                        )}
                                        {viewCompanyModal.gstDoc && (
                                            <Button size="sm" colorScheme="green" variant="solid" leftIcon={<Icon as={FaEye} />} onClick={() => window.open(`${API_BASE_URL}${viewCompanyModal.gstDoc}`, '_blank')}>
                                                View GST Certificate
                                            </Button>
                                        )}
                                        {viewCompanyModal.cancelledChequeDoc && (
                                            <Button size="sm" colorScheme="red" variant="solid" leftIcon={<Icon as={FaEye} />} onClick={() => window.open(`${API_BASE_URL}${viewCompanyModal.cancelledChequeDoc}`, '_blank')}>
                                                View Cancelled Cheque
                                            </Button>
                                        )}
                                        {getUniqueOtherDocs(viewCompanyModal.otherDocs, viewCompanyModal.otherDoc, viewCompanyModal.otherDocTitle).map((od, idx) => (
                                            <Button key={od._id || idx} size="sm" colorScheme="teal" variant="solid" leftIcon={<Icon as={FaEye} />} onClick={() => window.open(`${API_BASE_URL}${od.url}`, '_blank')}>
                                                View {od.title || `Other Document #${idx + 1}`}
                                            </Button>
                                        ))}
                                    </Wrap>
                                </Box>

                                {/* Company Catalogs & Brochures in View Modal (Company-Wise, Deduplicated) */}
                                {(() => {
                                    const modalCats = getCompanyCatalogs(viewCompanyModal);
                                    return (
                                        <Box bg="purple.50/60" p={4} borderRadius="2xl" border="1px solid" borderColor="purple.200">
                                            <Flex justify="space-between" align="center" mb={3} wrap="wrap" gap={2}>
                                                <Text fontSize="xs" fontWeight="black" color="purple.800" textTransform="uppercase">
                                                    📚 Company Product Catalogs & Brochures ({modalCats.length})
                                                </Text>
                                                {modalCats.length > 0 && (
                                                    <Button
                                                        size="xs"
                                                        bg="#25D366"
                                                        color="white"
                                                        _hover={{ bg: "#128C7E" }}
                                                        leftIcon={<Icon as={FaWhatsapp} />}
                                                        onClick={() => openShareModal(viewCompanyModal)}
                                                    >
                                                        Share Catalogs
                                                    </Button>
                                                )}
                                            </Flex>
                                            {modalCats.length === 0 ? (
                                                <Text fontSize="xs" color="gray.500">
                                                    No product catalogs uploaded for this company yet. You can attach multiple catalogs in the Form tab.
                                                </Text>
                                            ) : (
                                                <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={3}>
                                                    {modalCats.map((cat, idx) => (
                                                        <HStack
                                                            key={cat._id || idx}
                                                            p={3}
                                                            bg="white"
                                                            borderRadius="xl"
                                                            border="1px solid"
                                                            borderColor="purple.200"
                                                            justify="space-between"
                                                            shadow="xs"
                                                        >
                                                            <HStack spacing={2.5} overflow="hidden">
                                                                <Icon as={FaFilePdf} color="purple.600" w={5} h={5} />
                                                                <VStack align="start" spacing={0} overflow="hidden">
                                                                    <Text fontSize="xs" fontWeight="bold" color="purple.900" isTruncated maxW="180px">
                                                                        {cat.title}
                                                                    </Text>
                                                                    <Text fontSize="10px" color="gray.500">
                                                                        {cat.uploadedAt ? new Date(cat.uploadedAt).toLocaleDateString() : 'PDF Document'}
                                                                    </Text>
                                                                </VStack>
                                                            </HStack>
                                                            <Button
                                                                size="xs"
                                                                colorScheme="purple"
                                                                variant="outline"
                                                                leftIcon={<Icon as={FaEye} />}
                                                                onClick={() => window.open(`${API_BASE_URL}${cat.url || cat.pdfUrl}`, '_blank')}
                                                            >
                                                                View
                                                            </Button>
                                                        </HStack>
                                                    ))}
                                                </SimpleGrid>
                                            )}
                                        </Box>
                                    );
                                })()}
                            </VStack>
                        )}
                    </ModalBody>
                    <ModalFooter bg="gray.50" justify="space-between">
                        {viewCompanyModal && (
                            <Button
                                colorScheme="whatsapp"
                                bg="#25D366"
                                color="white"
                                _hover={{ bg: "#128C7E" }}
                                leftIcon={<Icon as={FaWhatsapp} />}
                                onClick={() => openShareModal(viewCompanyModal)}
                                borderRadius="xl"
                                px={5}
                            >
                                Share on WhatsApp
                            </Button>
                        )}
                        <Button borderRadius="full" onClick={() => setViewCompanyModal(null)}>Close</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* ── WhatsApp Direct Share Modal (Company Docs & Catalogs) ────── */}
            <Modal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} size="2xl" isCentered scrollBehavior="inside">
                <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
                <ModalContent borderRadius="2xl" overflow="hidden" boxShadow="2xl">
                    <ModalHeader bg="green.50" borderBottom="1px solid" borderColor="green.100" py={4} display="flex" alignItems="center" gap={3}>
                        <Box p={2.5} bg="#25D366" color="white" borderRadius="xl" display="flex" alignItems="center" justifyContent="center" boxShadow="0 2px 8px rgba(37,211,102,0.3)">
                            <Icon as={FaWhatsapp} w={6} h={6} />
                        </Box>
                        <Box>
                            <Heading fontSize="md" fontWeight="800" color="gray.800">
                                Share Company Documents & Catalogs
                            </Heading>
                            <Text fontSize="xs" color="gray.600" fontWeight="normal">
                                Direct WhatsApp dispatch to client with auto-sync to Google Contacts.
                            </Text>
                        </Box>
                    </ModalHeader>
                    <ModalCloseButton mt={3} mr={3} borderRadius="full" />

                    <ModalBody py={4}>
                        <VStack spacing={4} align="stretch">
                            {/* Company Summary Banner */}
                            {shareTargetCompany && (
                                <Box p={3} bg="gray.50" borderRadius="xl" border="1px solid" borderColor="gray.200">
                                    <Flex justify="space-between" align="center" mb={1.5}>
                                        <HStack spacing={2}>
                                            <Icon as={FaBuilding} color="teal.600" />
                                            <Text fontSize="sm" fontWeight="800" color="gray.800">
                                                {shareTargetCompany.companyName}
                                            </Text>
                                        </HStack>
                                        <Badge colorScheme="purple" borderRadius="full" px={2.5} py={0.5} fontSize="2xs">
                                            {selectedShareDocs.size} Doc(s) + {selectedShareCatalogs.size} Catalog(s) selected
                                        </Badge>
                                    </Flex>
                                    <Text fontSize="2xs" color="gray.500">
                                        {shareTargetCompany.address ? `${shareTargetCompany.address}, ${shareTargetCompany.state || ''}` : 'Official Company Profile'}
                                    </Text>
                                </Box>
                            )}

                            {/* Recipient Phone Input */}
                            <FormControl isRequired>
                                <FormLabel fontSize="xs" fontWeight="700" color="gray.700">
                                    Recipient WhatsApp Mobile Number (10 digits)
                                </FormLabel>
                                <InputGroup size="md">
                                    <InputLeftElement pointerEvents="none" color="gray.500" fontSize="xs" fontWeight="700">
                                        +91
                                    </InputLeftElement>
                                    <Input
                                        type="tel"
                                        maxLength={10}
                                        placeholder="9876543210"
                                        value={shareForm.phone}
                                        onChange={handleSharePhoneChange}
                                        borderRadius="lg"
                                        fontSize="sm"
                                        fontWeight="600"
                                        letterSpacing="wide"
                                        autoFocus
                                    />
                                    {isFetchingShareClient && (
                                        <InputRightElement>
                                            <Spinner size="sm" color="green.500" />
                                        </InputRightElement>
                                    )}
                                    {shareClientAutoFilled && (
                                        <InputRightElement>
                                            <Icon as={FiCheckCircle} color="green.500" w={5} h={5} />
                                        </InputRightElement>
                                    )}
                                </InputGroup>
                                {shareClientAutoFilled ? (
                                    <Text fontSize="2xs" color="green.600" fontWeight="600" mt={1}>
                                        ✓ Existing client found! Details auto-populated.
                                    </Text>
                                ) : (
                                    <Text fontSize="2xs" color="gray.400" mt={1}>
                                        Type 10 digits to search existing client records.
                                    </Text>
                                )}
                            </FormControl>

                            {/* Client Details */}
                            <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={3}>
                                <FormControl>
                                    <FormLabel fontSize="xs" fontWeight="700" color="gray.600">Client / Company Name</FormLabel>
                                    <InputGroup size="md">
                                        <InputLeftElement pointerEvents="none">
                                            <Icon as={FiBriefcase} color="gray.400" />
                                        </InputLeftElement>
                                        <Input
                                            placeholder="Client or Company Name"
                                            value={shareForm.companyName}
                                            onChange={e => setShareForm({ ...shareForm, companyName: e.target.value })}
                                            borderRadius="lg"
                                            fontSize="xs"
                                        />
                                    </InputGroup>
                                </FormControl>
                                <FormControl>
                                    <FormLabel fontSize="xs" fontWeight="700" color="gray.600">Contact Person Name</FormLabel>
                                    <InputGroup size="md">
                                        <InputLeftElement pointerEvents="none">
                                            <Icon as={FiUser} color="gray.400" />
                                        </InputLeftElement>
                                        <Input
                                            placeholder="Contact Person"
                                            value={shareForm.contactPersonName}
                                            onChange={e => setShareForm({ ...shareForm, contactPersonName: e.target.value })}
                                            borderRadius="lg"
                                            fontSize="xs"
                                        />
                                    </InputGroup>
                                </FormControl>
                            </SimpleGrid>

                            <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={3}>
                                <FormControl>
                                    <FormLabel fontSize="xs" fontWeight="700" color="gray.600">Email Address (Optional)</FormLabel>
                                    <InputGroup size="md">
                                        <InputLeftElement pointerEvents="none">
                                            <Icon as={FiMail} color="gray.400" />
                                        </InputLeftElement>
                                        <Input
                                            type="email"
                                            placeholder="client@example.com"
                                            value={shareForm.email}
                                            onChange={e => setShareForm({ ...shareForm, email: e.target.value })}
                                            borderRadius="lg"
                                            fontSize="xs"
                                        />
                                    </InputGroup>
                                </FormControl>
                                <FormControl>
                                    <FormLabel fontSize="xs" fontWeight="700" color="gray.600">GST Number (Optional)</FormLabel>
                                    <Input
                                        placeholder="24AAAAA0000A1Z5"
                                        value={shareForm.gstNumber}
                                        onChange={e => setShareForm({ ...shareForm, gstNumber: e.target.value.toUpperCase() })}
                                        borderRadius="lg"
                                        fontSize="xs"
                                    />
                                </FormControl>
                            </SimpleGrid>

                            <FormControl>
                                <FormLabel fontSize="xs" fontWeight="700" color="gray.600">Client Address (Optional)</FormLabel>
                                <InputGroup size="md">
                                    <InputLeftElement pointerEvents="none">
                                        <Icon as={FiMapPin} color="gray.400" />
                                    </InputLeftElement>
                                    <Input
                                        placeholder="Site or Office Address"
                                        value={shareForm.address}
                                        onChange={e => setShareForm({ ...shareForm, address: e.target.value })}
                                        borderRadius="lg"
                                        fontSize="xs"
                                    />
                                </InputGroup>
                            </FormControl>

                            {/* Credentials Include Toggles */}
                            <Box p={3} bg="purple.50" borderRadius="xl" border="1px solid" borderColor="purple.100">
                                <Text fontSize="xs" fontWeight="700" color="purple.900" mb={2}>
                                    Include Credentials in WhatsApp Text:
                                </Text>
                                <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={2}>
                                    <Checkbox
                                        colorScheme="purple"
                                        isChecked={shareForm.includeBankDetails}
                                        onChange={e => setShareForm({ ...shareForm, includeBankDetails: e.target.checked })}
                                    >
                                        <Text fontSize="xs" fontWeight="600" color="gray.700">Official Bank Account Details</Text>
                                    </Checkbox>
                                    <Checkbox
                                        colorScheme="purple"
                                        isChecked={shareForm.includeStatutoryDetails}
                                        onChange={e => setShareForm({ ...shareForm, includeStatutoryDetails: e.target.checked })}
                                    >
                                        <Text fontSize="xs" fontWeight="600" color="gray.700">GSTIN, PAN & Udyam Reg</Text>
                                    </Checkbox>
                                </SimpleGrid>
                            </Box>

                            {/* Statutory Documents Checkbox Selection (NO Logo, NO Stamp, ZERO Duplicates) */}
                            {shareTargetCompany && (() => {
                                const availDocs = getAvailableShareDocs(shareTargetCompany);
                                return (
                                    <Box p={3} bg="gray.50" borderRadius="xl" border="1px solid" borderColor="gray.200">
                                        <Flex justify="space-between" align="center" mb={2}>
                                            <Text fontSize="xs" fontWeight="700" color="gray.800">
                                                Attach Company Documents ({availDocs.filter(d => selectedShareDocs.has(d.key)).length}/{availDocs.length}):
                                            </Text>
                                            {availDocs.length > 0 && (
                                                <Button
                                                    size="2xs"
                                                    variant="ghost"
                                                    colorScheme="purple"
                                                    onClick={() => toggleSelectAllDocs(availDocs)}
                                                >
                                                    {selectedShareDocs.size === availDocs.length ? 'Deselect All' : 'Select All'}
                                                </Button>
                                            )}
                                        </Flex>
                                        {availDocs.length === 0 ? (
                                            <Text fontSize="xs" color="gray.500">No statutory documents uploaded for this company.</Text>
                                        ) : (
                                            <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={2}>
                                                {availDocs.map(doc => (
                                                    <Box
                                                        key={doc.key}
                                                        p={2}
                                                        bg="white"
                                                        borderRadius="lg"
                                                        border="1px solid"
                                                        borderColor={selectedShareDocs.has(doc.key) ? "purple.300" : "gray.200"}
                                                        boxShadow="xs"
                                                    >
                                                        <Flex align="center" justify="space-between">
                                                            <Checkbox
                                                                colorScheme="purple"
                                                                isChecked={selectedShareDocs.has(doc.key)}
                                                                onChange={() => toggleDocSelection(doc.key)}
                                                                size="sm"
                                                            >
                                                                <Text fontSize="xs" fontWeight="600" color="gray.800" noOfLines={1} title={doc.title}>
                                                                    {doc.title}
                                                                </Text>
                                                            </Checkbox>
                                                            {doc.url && (
                                                                <IconButton
                                                                    as="a"
                                                                    href={`${API_BASE_URL}${doc.url}`}
                                                                    target="_blank"
                                                                    icon={<FiExternalLink />}
                                                                    size="2xs"
                                                                    variant="ghost"
                                                                    colorScheme="teal"
                                                                    aria-label="Preview doc"
                                                                    title="Preview document"
                                                                />
                                                            )}
                                                        </Flex>
                                                    </Box>
                                                ))}
                                            </SimpleGrid>
                                        )}
                                    </Box>
                                );
                            })()}

                            {/* Product Catalogs Checkbox Selection (Company-Wise & Deduplicated) */}
                            {shareTargetCompany && (() => {
                                const availCats = getAvailableShareCatalogs(shareTargetCompany);
                                return (
                                    <Box p={3} bg="gray.50" borderRadius="xl" border="1px solid" borderColor="gray.200">
                                        <Flex justify="space-between" align="center" mb={2}>
                                            <Text fontSize="xs" fontWeight="700" color="gray.800">
                                                📚 Attach Product Catalogs for {shareTargetCompany.companyName} ({availCats.filter(c => selectedShareCatalogs.has(c._id)).length}/{availCats.length}):
                                            </Text>
                                            {availCats.length > 0 && (
                                                <Button
                                                    size="2xs"
                                                    variant="ghost"
                                                    colorScheme="purple"
                                                    onClick={() => toggleSelectAllCatalogs(availCats)}
                                                >
                                                    {selectedShareCatalogs.size === availCats.length ? 'Deselect All' : 'Select All'}
                                                </Button>
                                            )}
                                        </Flex>
                                        {availCats.length === 0 ? (
                                            <Text fontSize="xs" color="gray.500">No product catalogs attached to this company.</Text>
                                        ) : (
                                            <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={2}>
                                                {availCats.map(cat => (
                                                    <Box
                                                        key={cat._id}
                                                        p={2}
                                                        bg="white"
                                                        borderRadius="lg"
                                                        border="1px solid"
                                                        borderColor={selectedShareCatalogs.has(cat._id) ? "purple.300" : "gray.200"}
                                                        boxShadow="xs"
                                                    >
                                                        <Flex align="center" justify="space-between">
                                                            <Checkbox
                                                                colorScheme="purple"
                                                                isChecked={selectedShareCatalogs.has(cat._id)}
                                                                onChange={() => toggleCatalogSelection(cat._id)}
                                                                size="sm"
                                                            >
                                                                <Text fontSize="xs" fontWeight="600" color="gray.800" noOfLines={1} title={cat.title}>
                                                                    {cat.title}
                                                                </Text>
                                                            </Checkbox>
                                                            {cat.pdfUrl && (
                                                                <IconButton
                                                                    as="a"
                                                                    href={`${API_BASE_URL}${cat.pdfUrl}`}
                                                                    target="_blank"
                                                                    icon={<FaFilePdf />}
                                                                    size="2xs"
                                                                    variant="ghost"
                                                                    colorScheme="purple"
                                                                    aria-label="Preview catalog"
                                                                    title="Preview catalog"
                                                                />
                                                            )}
                                                        </Flex>
                                                    </Box>
                                                ))}
                                            </SimpleGrid>
                                        )}
                                    </Box>
                                );
                            })()}
                        </VStack>
                    </ModalBody>

                    <ModalFooter bg="gray.50" borderTop="1px solid" borderColor="gray.200" py={3}>
                        <HStack spacing={3} w="full" justify="space-between">
                            <Button variant="ghost" size="sm" onClick={() => setIsShareModalOpen(false)}>
                                Cancel
                            </Button>
                            <Button
                                colorScheme="whatsapp"
                                bg="#25D366"
                                color="white"
                                _hover={{ bg: "#128C7E" }}
                                leftIcon={<Icon as={FaWhatsapp} />}
                                size="md"
                                fontWeight="bold"
                                borderRadius="xl"
                                px={6}
                                isLoading={isSendingShareWhatsapp}
                                loadingText="Sending..."
                                onClick={handleSendShareWhatsapp}
                                boxShadow="0 2px 8px rgba(37,211,102,0.3)"
                            >
                                Dispatch on WhatsApp 🚀
                            </Button>
                        </HStack>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* Confirm Dialog */}
            <AlertDialog isOpen={isConfirmOpen} leastDestructiveRef={cancelRef} onClose={onConfirmClose}>
                <AlertDialogOverlay>
                    <AlertDialogContent borderRadius="2xl">
                        <AlertDialogHeader fontSize="lg" fontWeight="bold">
                            {editId ? 'Confirm Update' : 'Confirm New Company Registration'}
                        </AlertDialogHeader>
                        <AlertDialogBody>
                            Are you sure you want to {editId ? 'save changes to' : 'register'} <b>{formData.companyName || 'this company'}</b> with {queuedCatalogs.length} queued catalog(s)?
                        </AlertDialogBody>
                        <AlertDialogFooter>
                            <Button ref={cancelRef} onClick={onConfirmClose} borderRadius="xl">
                                Cancel
                            </Button>
                            <Button colorScheme="teal" onClick={confirmSubmit} ml={3} borderRadius="xl" fontWeight="bold">
                                Yes, Save Record
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
        </Box>
    );
};

export default CompanyMaster;
