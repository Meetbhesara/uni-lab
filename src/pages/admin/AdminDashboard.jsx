import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Box, Heading, SimpleGrid, Stat, StatLabel, StatNumber, StatHelpText,
    Icon, Spinner, Text, FormControl, FormLabel, Input, Button, Flex,
    useToast, Table, Thead, Tbody, Tr, Th, Td, Badge, Avatar, Stack, HStack, VStack,
    InputGroup, InputLeftElement, InputRightElement, Tooltip, Tag, TagLabel, Tabs, TabList,
    TabPanels, Tab, TabPanel, AlertDialog, AlertDialogBody, AlertDialogFooter,
    AlertDialogHeader, AlertDialogContent, AlertDialogOverlay, IconButton,
    Skeleton, SkeletonText, Switch, Modal, ModalOverlay, ModalContent,
    ModalHeader, ModalBody, ModalFooter, ModalCloseButton, Textarea,
    Checkbox, Select, Image, Divider
} from '@chakra-ui/react';
import { FiBox, FiMessageSquare, FiClock, FiUserPlus, FiUsers, FiSearch, FiPhone, FiMail, FiBriefcase, FiCalendar, FiTrash2, FiShield, FiUser, FiActivity, FiEdit2, FiMapPin, FiBookOpen, FiUploadCloud, FiFileText, FiDownload, FiCheckCircle, FiExternalLink, FiCheck, FiLayers, FiAlertCircle, FiCopy, FiShare2, FiPaperclip } from 'react-icons/fi';
import { FaWhatsapp, FaBuilding, FaCopy, FaFilePdf } from 'react-icons/fa';
import { RiVipCrownFill } from 'react-icons/ri';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { DEMO_PRODUCTS, DEMO_ENQUIRIES } from '../../data/mockData';
import { hasPermission } from '../../utils/permissions';
import HealthModal from '../../components/HealthModal';
import AdminPersonalLoginReport from '../../components/admin/AdminPersonalLoginReport';


const MotionBox = motion(Box);

const AdminDashboard = () => {
    const { user, createAdmin } = useAuth();
    const navigate = useNavigate();
    const toast = useToast();

    const canReadDashboard = hasPermission(user, 'dashboard', 'read');
    const canReadAdmins = hasPermission(user, 'dashboard_admins', 'read');
    const canWriteAdmins = hasPermission(user, 'dashboard_admins', 'write');
    const canReadUsers = hasPermission(user, 'dashboard_users', 'read');
    const canWriteUsers = hasPermission(user, 'dashboard_users', 'write');

    const [stats, setStats] = useState({
        products: 0,
        totalEnquiries: 0,
        pendingEnquiries: 0,
        doneQuotations: 0,
        rejectedQuotations: 0,
        totalUsers: 0,
        companies: 0
    });
    // statsLoading tracks individual stat cards (not full page block)
    const [statsLoading, setStatsLoading] = useState(true);

    // Users state
    const [users, setUsers] = useState([]);
    const [usersLoading, setUsersLoading] = useState(true);
    const [userSearch, setUserSearch] = useState('');

    // Admins state
    const [admins, setAdmins] = useState([]);
    const [adminsLoading, setAdminsLoading] = useState(true);
    const [adminSearch, setAdminSearch] = useState('');

    const [isHealthOpen, setIsHealthOpen] = useState(false);

    // Delete modal state
    const [deleteAccountModal, setDeleteAccountModal] = useState({ isOpen: false, user: null, type: '' });
    const [isDeleting, setIsDeleting] = useState(false);
    const cancelRef = useRef();
    // Debounce ref for realtime listener
    const realtimeDebounceRef = useRef(null);

    const defaultPermissions = {
        dashboard: { read: true, write: true },
        dashboard_admins: { read: true, write: true },
        dashboard_users: { read: true, write: true },
        products: { read: true, write: true },
        enquiries: { read: true, write: true },
        incomingEnquiries: { read: true, write: true },
        outboundQuotations: { read: true, write: true },
        processedHistory: { read: true, write: true },
        vehicleMaster: { read: true, write: true },
        vehicleMaster_form: { read: true, write: true },
        vehicleMaster_view: { read: true, write: true },
        employeeMaster: { read: true, write: true },
        employeeMaster_form: { read: true, write: true },
        employeeMaster_view: { read: true, write: true },
        clientMaster: { read: true, write: true },
        clientMaster_form: { read: true, write: true },
        clientMaster_view: { read: true, write: true },
        siteMaster: { read: true, write: true },
        siteMaster_form: { read: true, write: true },
        siteMaster_view: { read: true, write: true },
        scheduleMaster: { read: true, write: true },
        scheduleMaster_form: { read: true, write: true },
        scheduleMaster_view: { read: true, write: true },
        scheduleMaster_report: { read: true, write: true },
        instrumentMaster: { read: true, write: true },
        instrumentMaster_form: { read: true, write: true },
        instrumentMaster_view: { read: true, write: true },
        employeeExpense: { read: true, write: true },
        draftingWork: { read: true, write: true },
        invoiceReport: { read: true, write: true }
    };
    const [adminForm, setAdminForm] = useState({ name: '', email: '', phone: '', isSuperAdmin: false, permissions: defaultPermissions });
    const [adminLoading, setAdminLoading] = useState(false);

    // Edit Admin Modal state
    const [editAdminModal, setEditAdminModal] = useState({ isOpen: false, admin: null });
    const [editForm, setEditForm] = useState({ _id: '', name: '', email: '', phone: '', isSuperAdmin: false });
    const [editLoading, setEditLoading] = useState(false);

    // Edit User Modal state
    const [editUserModal, setEditUserModal] = useState({ isOpen: false, user: null });
    const [editUserForm, setEditUserForm] = useState({
        _id: '',
        name: '',
        contactPersonName: '',
        companyName: '',
        email: '',
        phone: '',
        gstNumber: '',
        address: ''
    });
    const [editUserLoading, setEditUserLoading] = useState(false);

    // ─── Catalogs Management State ──────────────────────────────────────────
    const [catalogs, setCatalogs] = useState([]);
    const [catalogsLoading, setCatalogsLoading] = useState(false);
    const [catalogSearch, setCatalogSearch] = useState('');
    const [selectedCatalogIds, setSelectedCatalogIds] = useState(new Set());

    // Add Catalog Modal State
    const [isAddCatalogOpen, setIsAddCatalogOpen] = useState(false);
    const [catalogForm, setCatalogForm] = useState({
        title: '',
        category: 'General',
        description: '',
        file: null
    });
    const [isUploadingCatalog, setIsUploadingCatalog] = useState(false);

    // WhatsApp Catalog Share Modal State
    const [isWhatsappCatalogOpen, setIsWhatsappCatalogOpen] = useState(false);
    const [whatsappCatalogTarget, setWhatsappCatalogTarget] = useState([]);
    const [isWhatsappSending, setIsWhatsappSending] = useState(false);
    const [isFetchingClient, setIsFetchingClient] = useState(false);
    const [clientAutoFilled, setClientAutoFilled] = useState(false);
    const [whatsappClientForm, setWhatsappClientForm] = useState({
        phone: '',
        companyName: '',
        contactPersonName: '',
        email: '',
        gstNumber: '',
        address: '',
        customMessage: ''
    });

    // WhatsApp Delivery Acknowledgement Modal State
    const [whatsappAckModal, setWhatsappAckModal] = useState({
        isOpen: false,
        phone: '',
        clientName: '',
        companyName: '',
        catalogs: [],
        time: ''
    });

    // ─── Company Master & Statutory Documents State ───────────────────────────
    const [companies, setCompanies] = useState([]);
    const [companiesLoading, setCompaniesLoading] = useState(false);
    const [selectedCompanyId, setSelectedCompanyId] = useState(null);
    const [selectedDocKeys, setSelectedDocKeys] = useState(new Set());

    // Upload Document Modal State
    const [isUploadDocModalOpen, setIsUploadDocModalOpen] = useState(false);
    const [uploadDocTarget, setUploadDocTarget] = useState({
        companyId: '',
        docType: 'gstDoc',
        otherDocTitle: '',
        file: null,
        previewUrl: null
    });
    const [isUploadingCompanyDoc, setIsUploadingCompanyDoc] = useState(false);

    // WhatsApp Company Share Modal State
    const [isWhatsappCompanyOpen, setIsWhatsappCompanyOpen] = useState(false);
    const [whatsappCompanyTarget, setWhatsappCompanyTarget] = useState(null);
    const [isSendingCompanyWhatsapp, setIsSendingCompanyWhatsapp] = useState(false);
    const [isFetchingCompanyClient, setIsFetchingCompanyClient] = useState(false);
    const [companyClientAutoFilled, setCompanyClientAutoFilled] = useState(false);
    const [whatsappCompanyForm, setWhatsappCompanyForm] = useState({
        phone: '',
        companyName: '',
        contactPersonName: '',
        email: '',
        gstNumber: '',
        address: '',
        customMessage: '',
        includeBankDetails: true,
        includeStatutoryDetails: true
    });

    const getFileUrl = (filePath) => {
        if (!filePath) return '';
        if (filePath.startsWith('http://') || filePath.startsWith('https://')) return filePath;
        const base = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001').replace(/\/api\/?$/, '').replace(/\/$/, '');
        const clean = filePath.startsWith('/') ? filePath : `/${filePath}`;
        return `${base}${clean}`;
    };

    const fetchCatalogs = useCallback(async () => {
        setCatalogsLoading(true);
        try {
            const res = await api.get('/catalogs');
            if (res.data?.success) {
                const list = res.data.data || [];
                setCatalogs(list);
                setStats(p => ({ ...p, catalogs: list.length }));
            }
        } catch (err) {
            console.error('Error fetching catalogs:', err);
        } finally {
            setCatalogsLoading(false);
        }
    }, []);

    const handleUploadCatalog = async (e) => {
        e?.preventDefault();
        if (!catalogForm.title.trim()) {
            return toast({ title: 'Catalog title is required', status: 'warning', duration: 2500 });
        }
        if (!catalogForm.file) {
            return toast({ title: 'Please select a catalog file (PDF, JPG, PNG)', status: 'warning', duration: 2500 });
        }

        setIsUploadingCatalog(true);
        try {
            const formData = new FormData();
            formData.append('title', catalogForm.title.trim().toUpperCase());
            formData.append('category', 'General');
            formData.append('description', catalogForm.description.trim());
            formData.append('pdf', catalogForm.file);

            const res = await api.post('/catalogs', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (res.data?.success) {
                toast({
                    title: '✅ Catalog Uploaded!',
                    description: `"${catalogForm.title}" has been uploaded successfully.`,
                    status: 'success',
                    duration: 3000
                });
                setIsAddCatalogOpen(false);
                setCatalogForm({ title: '', category: 'General', description: '', file: null });
                fetchCatalogs();
            }
        } catch (err) {
            toast({
                title: 'Upload Failed',
                description: err.response?.data?.message || err.message,
                status: 'error',
                duration: 3500
            });
        } finally {
            setIsUploadingCatalog(false);
        }
    };

    const handleDeleteCatalog = async (id, title) => {
        if (!window.confirm(`Are you sure you want to delete the catalog "${title}"?`)) return;
        try {
            const res = await api.delete(`/catalogs/${id}`);
            if (res.data?.success) {
                toast({ title: 'Catalog Deleted', status: 'success', duration: 2000 });
                fetchCatalogs();
            }
        } catch (err) {
            toast({ title: 'Delete Failed', description: err.response?.data?.message || err.message, status: 'error' });
        }
    };

    const toggleCatalogSelection = (id) => {
        setSelectedCatalogIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const openWhatsappModalForCatalog = (catalog) => {
        setWhatsappCatalogTarget([catalog]);
        setWhatsappClientForm({
            phone: '',
            companyName: '',
            contactPersonName: '',
            email: '',
            gstNumber: '',
            address: '',
            customMessage: ''
        });
        setClientAutoFilled(false);
        setIsWhatsappCatalogOpen(true);
    };

    const openWhatsappModalForSelected = () => {
        const selectedList = catalogs.filter(c => selectedCatalogIds.has(c._id));
        if (selectedList.length === 0) {
            return toast({ title: 'Please select at least one catalog to share', status: 'warning', duration: 2500 });
        }
        setWhatsappCatalogTarget(selectedList);
        setWhatsappClientForm({
            phone: '',
            companyName: '',
            contactPersonName: '',
            email: '',
            gstNumber: '',
            address: '',
            customMessage: ''
        });
        setClientAutoFilled(false);
        setIsWhatsappCatalogOpen(true);
    };

    const handleWhatsappPhoneChange = async (e) => {
        const raw = e.target.value.replace(/\D/g, '').slice(0, 10);
        
        // If the form was previously auto-filled by an existing client and the number is changing,
        // clear the client details so old client data doesn't remain.
        setWhatsappClientForm(prev => {
            if (clientAutoFilled) {
                return {
                    phone: raw,
                    companyName: '',
                    contactPersonName: '',
                    email: '',
                    gstNumber: '',
                    address: '',
                    customMessage: prev.customMessage || ''
                };
            }
            return { ...prev, phone: raw };
        });
        setClientAutoFilled(false);

        if (raw.length === 10) {
            setIsFetchingClient(true);
            try {
                const res = await api.get(`/auth/phone/${raw}`);
                const u = res.data?.user || res.data;
                if (u && (u._id || u.phone)) {
                    setWhatsappClientForm(prev => ({
                        ...prev,
                        phone: raw,
                        companyName: u.companyName || '',
                        contactPersonName: u.contactPersonName || u.name || '',
                        email: (u.email && !u.email.includes('noemail')) ? u.email : '',
                        gstNumber: u.gstNumber || '',
                        address: u.address || u.clientAddress || ''
                    }));
                    setClientAutoFilled(true);
                    toast({
                        title: '✓ Client Found!',
                        description: `Auto-filled details for ${u.contactPersonName || u.companyName || u.name || 'Client'}.`,
                        status: 'info',
                        duration: 2500,
                        isClosable: true
                    });
                } else {
                    // Not in DB; reset fields so old client details are cleared
                    setWhatsappClientForm(prev => ({
                        phone: raw,
                        companyName: '',
                        contactPersonName: '',
                        email: '',
                        gstNumber: '',
                        address: '',
                        customMessage: prev.customMessage || ''
                    }));
                    setClientAutoFilled(false);
                }
            } catch (_) {
                // Not in DB yet; reset fields so old client details are cleared
                setWhatsappClientForm(prev => ({
                    phone: raw,
                    companyName: '',
                    contactPersonName: '',
                    email: '',
                    gstNumber: '',
                    address: '',
                    customMessage: prev.customMessage || ''
                }));
                setClientAutoFilled(false);
            } finally {
                setIsFetchingClient(false);
            }
        }
    };

    const handleSendCatalogWhatsapp = async () => {
        const cleanPhone = whatsappClientForm.phone.replace(/\D/g, '');
        if (cleanPhone.length < 10) {
            return toast({ title: 'Enter a valid 10-digit phone number', status: 'warning', duration: 2500 });
        }
        if (whatsappCatalogTarget.length === 0) {
            return toast({ title: 'No catalog selected to send', status: 'warning', duration: 2500 });
        }

        setIsWhatsappSending(true);
        try {
            const payload = {
                phone: cleanPhone,
                companyName: whatsappClientForm.companyName.trim(),
                contactPersonName: whatsappClientForm.contactPersonName.trim(),
                email: whatsappClientForm.email.trim(),
                gstNumber: whatsappClientForm.gstNumber.trim().toUpperCase(),
                address: whatsappClientForm.address.trim(),
                catalogIds: whatsappCatalogTarget.map(c => c._id),
                pdfUrls: whatsappCatalogTarget.map(c => c.pdfUrl),
                catalogTitles: whatsappCatalogTarget.map(c => c.title),
                message: whatsappClientForm.customMessage.trim()
            };

            const res = await api.post('/whatsapp/send-catalog', payload);
            if (res.data?.success) {
                const isSent = res.data?.whatsappSent !== false;
                if (!isSent) {
                    toast({
                        title: '⚠️ Catalog Processed',
                        description: res.data?.whatsappError || 'Client contact was synced to Google Contacts, but WhatsApp delivery failed.',
                        status: 'warning',
                        duration: 4000,
                        isClosable: true
                    });
                } else {
                    toast({
                        title: '✅ Catalog Sent on WhatsApp!',
                        description: `Dispatched to +91 ${cleanPhone}`,
                        status: 'success',
                        duration: 3000,
                        isClosable: true
                    });
                }
                setIsWhatsappCatalogOpen(false);
                setSelectedCatalogIds(new Set());
                fetchAllDashboardData();
            } else {
                toast({
                    title: 'Send Failed',
                    description: res.data?.error || 'Could not send catalog',
                    status: 'error',
                    duration: 3500
                });
            }
        } catch (err) {
            toast({
                title: 'Send Failed',
                description: err.response?.data?.error || err.message,
                status: 'error',
                duration: 3500
            });
        } finally {
            setIsWhatsappSending(false);
        }
    };

    // ─── Company Master & Statutory Documents Handlers ───────────────────────
    const fetchCompanies = useCallback(async () => {
        setCompaniesLoading(true);
        try {
            const res = await api.get('/company-master');
            if (res.data?.success) {
                const list = res.data.data || [];
                setCompanies(list);
                setStats(p => ({ ...p, companies: list.length }));
                setSelectedCompanyId(prev => (prev && list.some(c => c._id === prev)) ? prev : (list[0]?._id || null));
            }
        } catch (err) {
            console.error('Error fetching companies:', err);
        } finally {
            setCompaniesLoading(false);
        }
    }, []);

    const handleCopyText = (text, label) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        toast({
            title: `✓ Copied ${label}!`,
            description: text,
            status: 'info',
            duration: 1800,
            isClosable: true
        });
    };

    const getDocDefinition = (company, docKey) => {
        if (!company) return null;
        if (typeof docKey === 'string' && docKey.startsWith('otherDoc_')) {
            const found = (company.otherDocs || []).find((d, idx) => `otherDoc_${d._id || idx}` === docKey);
            if (found) {
                return {
                    key: docKey,
                    title: found.title || 'Other Statutory Document',
                    shortTitle: found.title || 'Other Document',
                    badgeLabel: 'Document',
                    badgeValue: found.title || 'Attached Document',
                    url: found.url || '',
                    colorScheme: 'purple',
                    icon: FiFileText,
                    isMultipleOtherDoc: true,
                    otherDocId: found._id,
                    otherDocIndex: (company.otherDocs || []).indexOf(found)
                };
            }
        }
        switch (docKey) {
            case 'gstDoc':
                return {
                    key: 'gstDoc',
                    title: 'GST Registration Certificate',
                    shortTitle: 'GST Certificate',
                    badgeLabel: 'GSTIN',
                    badgeValue: company.gstin || '',
                    url: company.gstDoc || '',
                    colorScheme: 'green',
                    icon: FiFileText
                };
            case 'panCardDoc':
                return {
                    key: 'panCardDoc',
                    title: 'PAN Card Document',
                    shortTitle: 'PAN Card',
                    badgeLabel: 'PAN Number',
                    badgeValue: company.panCardNumber || '',
                    url: company.panCardDoc || '',
                    colorScheme: 'orange',
                    icon: FiFileText
                };
            case 'udyamDoc':
                return {
                    key: 'udyamDoc',
                    title: 'Udyam Registration Certificate',
                    shortTitle: 'Udyam Certificate',
                    badgeLabel: 'Udyam Reg',
                    badgeValue: company.udyamNumber || '',
                    url: company.udyamDoc || '',
                    colorScheme: 'blue',
                    icon: FiFileText
                };
            case 'otherDoc':
                return {
                    key: 'otherDoc',
                    title: company.otherDocTitle || 'Other Statutory Document',
                    shortTitle: company.otherDocTitle || 'Other Document',
                    badgeLabel: 'Document',
                    badgeValue: company.otherDocTitle || 'Attached Document',
                    url: company.otherDoc || '',
                    colorScheme: 'purple',
                    icon: FiFileText
                };
            case 'cancelledChequeDoc':
                return {
                    key: 'cancelledChequeDoc',
                    title: 'Cancelled Cheque / Bank Proof',
                    shortTitle: 'Cancelled Cheque',
                    badgeLabel: 'Bank Account',
                    badgeValue: company.bankDetails?.accountNumber ? `${company.bankDetails.bankName || 'Bank'}: ${company.bankDetails.accountNumber}` : '',
                    url: company.cancelledChequeDoc || '',
                    colorScheme: 'red',
                    icon: FiFileText
                };
            case 'companyStamp':
                return {
                    key: 'companyStamp',
                    title: 'Official Company Stamp',
                    shortTitle: 'Company Stamp',
                    badgeLabel: 'Official Stamp',
                    badgeValue: 'Authorized Seal',
                    url: company.companyStamp || '',
                    colorScheme: 'teal',
                    icon: FiCheckCircle
                };
            case 'logo':
                return {
                    key: 'logo',
                    title: 'Official Company Logo',
                    shortTitle: 'Company Logo',
                    badgeLabel: 'Brand Identity',
                    badgeValue: company.invoicePrefix ? `Prefix: ${company.invoicePrefix}` : 'Brand Identity',
                    url: company.logo || '',
                    colorScheme: 'cyan',
                    icon: FiCheckCircle
                };
            default:
                return null;
        }
    };

    const getAvailableUploadDocTypes = (comp, currentDocType = '', isReplace = false) => {
        if (!comp) {
            return [{ value: 'otherDoc', label: 'Other Statutory Document / Certificate (Add Multiple)' }];
        }

        const FIXED_DOCS = [
            { value: 'gstDoc', label: 'GST Registration Certificate (gstDoc)', field: 'gstDoc' },
            { value: 'panCardDoc', label: 'PAN Card Document (panCardDoc)', field: 'panCardDoc' },
            { value: 'udyamDoc', label: 'Udyam Registration Certificate (udyamDoc)', field: 'udyamDoc' },
            { value: 'cancelledChequeDoc', label: 'Cancelled Cheque / Bank Proof (cancelledChequeDoc)', field: 'cancelledChequeDoc' },
        ];

        const options = [];
        FIXED_DOCS.forEach(doc => {
            const isAlreadyUploaded = Boolean(comp[doc.field]);
            // Only show if NOT uploaded yet, OR if user specifically clicked "Replace" on this exact document
            if (!isAlreadyUploaded || (isReplace && currentDocType === doc.value)) {
                options.push(doc);
            }
        });

        // "Other Documents" stays in the dropdown ALWAYS because multiple other documents can be uploaded!
        options.push({
            value: 'otherDoc',
            label: 'Other Statutory Document / Certificate (Add Multiple)'
        });

        return options;
    };

    const openUploadDocModal = (companyId, docType = null, isReplace = false) => {
        const targetCompId = companyId || selectedCompanyId || (companies[0]?._id || '');
        const comp = companies.find(c => c._id === targetCompId);
        const availableOptions = getAvailableUploadDocTypes(comp, docType, isReplace);

        let initialDocType = docType;
        if (!initialDocType || !availableOptions.some(o => o.value === initialDocType)) {
            initialDocType = availableOptions[0]?.value || 'otherDoc';
        }

        setUploadDocTarget({
            companyId: targetCompId,
            docType: initialDocType,
            isReplace,
            otherDocTitle: '',
            file: null,
            previewUrl: null
        });
        setIsUploadDocModalOpen(true);
    };

    const handleUploadCompanyDoc = async (e) => {
        e?.preventDefault?.();
        if (!uploadDocTarget.companyId) {
            return toast({ title: 'Please select a company', status: 'warning', duration: 2500 });
        }
        if (!uploadDocTarget.file) {
            return toast({ title: 'Please select a document file (PDF, JPG, PNG, WEBP)', status: 'warning', duration: 2500 });
        }
        if (uploadDocTarget.docType === 'otherDoc' && !uploadDocTarget.otherDocTitle?.trim()) {
            return toast({ title: 'Please enter a name / title for the document', status: 'warning', duration: 2500 });
        }

        const comp = companies.find(c => c._id === uploadDocTarget.companyId);

        setIsUploadingCompanyDoc(true);
        try {
            const formData = new FormData();
            if (comp?.companyName) {
                formData.append('companyName', comp.companyName);
            }
            formData.append(uploadDocTarget.docType, uploadDocTarget.file);
            if (uploadDocTarget.docType === 'otherDoc' && uploadDocTarget.otherDocTitle.trim()) {
                formData.append('otherDocTitle', uploadDocTarget.otherDocTitle.trim());
            }

            const res = await api.put(`/company-master/${uploadDocTarget.companyId}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (res.data?.success) {
                toast({
                    title: '✅ Document Uploaded Successfully!',
                    description: 'Company record has been updated with the document.',
                    status: 'success',
                    duration: 3000,
                    isClosable: true
                });
                setIsUploadDocModalOpen(false);
                setUploadDocTarget({ companyId: '', docType: 'gstDoc', otherDocTitle: '', file: null, previewUrl: null });
                fetchCompanies();
            } else {
                throw new Error(res.data?.message || 'Failed to upload document');
            }
        } catch (err) {
            toast({
                title: 'Upload Failed',
                description: err.response?.data?.message || err.message,
                status: 'error',
                duration: 3500,
                isClosable: true
            });
        } finally {
            setIsUploadingCompanyDoc(false);
        }
    };

    const handleRemoveCompanyDoc = async (companyId, docKey, docTitle) => {
        if (!window.confirm(`Are you sure you want to remove "${docTitle || 'this document'}" from this company?`)) {
            return;
        }
        try {
            const payload = {};
            if (typeof docKey === 'string' && docKey.startsWith('otherDoc_')) {
                const comp = companies.find(c => c._id === companyId);
                const found = (comp?.otherDocs || []).find((d, idx) => `otherDoc_${d._id || idx}` === docKey);
                if (found?._id) {
                    payload.remove_otherDoc_id = found._id;
                } else if (found) {
                    payload.remove_otherDoc_index = (comp?.otherDocs || []).indexOf(found);
                }
            } else {
                payload[`remove_${docKey}`] = 'true';
                if (docKey === 'otherDoc') {
                    payload.otherDocTitle = '';
                }
            }
            const res = await api.put(`/company-master/${companyId}`, payload);
            if (res.data?.success) {
                toast({
                    title: '✓ Document Removed',
                    description: `${docTitle || 'Document'} has been removed from this company.`,
                    status: 'info',
                    duration: 2500,
                    isClosable: true
                });
                setSelectedDocKeys(prev => {
                    const next = new Set(prev);
                    next.delete(docKey);
                    return next;
                });
                fetchCompanies();
            } else {
                throw new Error(res.data?.message || 'Failed to remove document');
            }
        } catch (err) {
            toast({
                title: 'Failed to remove document',
                description: err.response?.data?.message || err.message,
                status: 'error',
                duration: 3500,
                isClosable: true
            });
        }
    };

    const toggleCompanyDocSelection = (key) => {
        setSelectedDocKeys(prev => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key);
            else next.add(key);
            return next;
        });
    };

    const openWhatsappModalForCompanyDoc = (company, docKey) => {
        const docDef = getDocDefinition(company, docKey);
        setWhatsappCompanyTarget({
            company,
            docs: docDef ? [docDef] : []
        });
        setWhatsappCompanyForm({
            phone: '',
            companyName: '',
            contactPersonName: '',
            email: '',
            gstNumber: '',
            address: '',
            customMessage: '',
            includeBankDetails: true,
            includeStatutoryDetails: true
        });
        setCompanyClientAutoFilled(false);
        setIsWhatsappCompanyOpen(true);
    };

    const openWhatsappModalForSelectedCompanyDocs = (company) => {
        if (!company) return;
        const keys = Array.from(selectedDocKeys);
        if (keys.length === 0) {
            return toast({ title: 'Please select at least one document to share', status: 'warning', duration: 2500 });
        }
        const docs = keys.map(k => getDocDefinition(company, k)).filter(Boolean);
        setWhatsappCompanyTarget({ company, docs });
        setWhatsappCompanyForm({
            phone: '',
            companyName: '',
            contactPersonName: '',
            email: '',
            gstNumber: '',
            address: '',
            customMessage: '',
            includeBankDetails: true,
            includeStatutoryDetails: true
        });
        setCompanyClientAutoFilled(false);
        setIsWhatsappCompanyOpen(true);
    };

    const openWhatsappModalForCompanyAll = (company) => {
        if (!company) return;
        const docKeys = ['gstDoc', 'panCardDoc', 'udyamDoc', 'cancelledChequeDoc'];
        const activeDocs = docKeys
            .map(key => getDocDefinition(company, key))
            .filter(d => d && (d.url || d.badgeValue));

        // Multiple other documents: collect from company.otherDocs array
        if (Array.isArray(company.otherDocs)) {
            company.otherDocs.forEach((od, idx) => {
                if (od.url) {
                    activeDocs.push({
                        key: `otherDoc_${od._id || idx}`,
                        title: od.title || `Other Document #${idx + 1}`,
                        shortTitle: od.title || `Other Doc #${idx + 1}`,
                        badgeLabel: 'Document',
                        badgeValue: od.title || 'Other Statutory Document',
                        url: od.url,
                        colorScheme: 'purple',
                        icon: FiFileText,
                        isMultipleOtherDoc: true,
                        otherDocId: od._id,
                        otherDocIndex: idx
                    });
                }
            });
        }

        // Include legacy single otherDoc if not in array
        if (company.otherDoc && !activeDocs.some(d => d.url === company.otherDoc)) {
            activeDocs.push({
                key: 'otherDoc',
                title: company.otherDocTitle || 'Other Statutory Document',
                shortTitle: company.otherDocTitle || 'Other Document',
                badgeLabel: 'Document',
                badgeValue: company.otherDocTitle || 'Other Document',
                url: company.otherDoc,
                colorScheme: 'purple',
                icon: FiFileText,
                isMultipleOtherDoc: false
            });
        }

        setWhatsappCompanyTarget({
            company,
            docs: activeDocs
        });
        setWhatsappCompanyForm({
            phone: '',
            companyName: '',
            contactPersonName: '',
            email: '',
            gstNumber: '',
            address: '',
            customMessage: '',
            includeBankDetails: true,
            includeStatutoryDetails: true
        });
        setCompanyClientAutoFilled(false);
        setIsWhatsappCompanyOpen(true);
    };

    const handleWhatsappCompanyPhoneChange = async (e) => {
        const raw = e.target.value.replace(/\D/g, '').slice(0, 10);
        setWhatsappCompanyForm(prev => {
            if (companyClientAutoFilled) {
                return {
                    ...prev,
                    phone: raw,
                    companyName: '',
                    contactPersonName: '',
                    email: '',
                    gstNumber: '',
                    address: ''
                };
            }
            return { ...prev, phone: raw };
        });
        setCompanyClientAutoFilled(false);

        if (raw.length === 10) {
            setIsFetchingCompanyClient(true);
            try {
                const res = await api.get(`/auth/phone/${raw}`);
                const u = res.data?.user || res.data;
                if (u && (u._id || u.phone)) {
                    setWhatsappCompanyForm(prev => ({
                        ...prev,
                        phone: raw,
                        companyName: u.companyName || '',
                        contactPersonName: u.contactPersonName || u.name || '',
                        email: (u.email && !u.email.includes('noemail')) ? u.email : '',
                        gstNumber: u.gstNumber || '',
                        address: u.address || u.clientAddress || ''
                    }));
                    setCompanyClientAutoFilled(true);
                    toast({
                        title: '✓ Client Found!',
                        description: `Auto-filled details for ${u.contactPersonName || u.companyName || u.name || 'Client'}.`,
                        status: 'info',
                        duration: 2500,
                        isClosable: true
                    });
                } else {
                    setWhatsappCompanyForm(prev => ({
                        ...prev,
                        phone: raw,
                        companyName: '',
                        contactPersonName: '',
                        email: '',
                        gstNumber: '',
                        address: ''
                    }));
                    setCompanyClientAutoFilled(false);
                }
            } catch (_) {
                setWhatsappCompanyForm(prev => ({
                    ...prev,
                    phone: raw,
                    companyName: '',
                    contactPersonName: '',
                    email: '',
                    gstNumber: '',
                    address: ''
                }));
                setCompanyClientAutoFilled(false);
            } finally {
                setIsFetchingCompanyClient(false);
            }
        }
    };

    const handleSendCompanyWhatsapp = async () => {
        const cleanPhone = whatsappCompanyForm.phone.replace(/\D/g, '');
        if (cleanPhone.length < 10) {
            return toast({ title: 'Enter a valid 10-digit phone number', status: 'warning', duration: 2500 });
        }
        if (!whatsappCompanyTarget || !whatsappCompanyTarget.company) {
            return toast({ title: 'No company selected', status: 'warning', duration: 2500 });
        }

        const comp = whatsappCompanyTarget.company;
        const docs = whatsappCompanyTarget.docs || [];
        const filesToSend = docs.filter(d => d.url).map(d => d.url);
        const titlesToSend = docs.filter(d => d.url).map(d => `${d.title} - ${comp.companyName}`);

        setIsSendingCompanyWhatsapp(true);
        try {
            let caption = `*${comp.companyName.toUpperCase()}*\nOfficial Company Statutory Credentials & Documents\n\n`;

            if (whatsappCompanyForm.includeStatutoryDetails) {
                caption += `🏢 *Company Profile:*\n`;
                if (comp.gstin) caption += `• *GSTIN:* ${comp.gstin}\n`;
                if (comp.panCardNumber) caption += `• *PAN Card:* ${comp.panCardNumber}\n`;
                if (comp.udyamNumber) caption += `• *Udyam Reg:* ${comp.udyamNumber}\n`;
                if (comp.contactNo) caption += `• *Contact:* ${comp.contactNo}\n`;
                if (comp.email) caption += `• *Email:* ${comp.email}\n`;
                if (comp.address) caption += `• *Address:* ${comp.address}${comp.state ? ', ' + comp.state : ''}${comp.pincode ? ' - ' + comp.pincode : ''}\n`;
                caption += `\n`;
            }

            if (whatsappCompanyForm.includeBankDetails && comp.bankDetails?.accountNumber) {
                caption += `🏦 *Official Bank Account Details:*\n`;
                caption += `• *Account Name:* ${comp.bankDetails.accountHolderName || comp.companyName}\n`;
                caption += `• *Bank Name:* ${comp.bankDetails.bankName}\n`;
                caption += `• *Account No:* ${comp.bankDetails.accountNumber}\n`;
                caption += `• *IFSC Code:* ${comp.bankDetails.ifscCode}\n\n`;
            }

            if (docs.length > 0) {
                caption += `📎 *Attached Documents (${docs.length}):*\n`;
                docs.forEach((d, i) => {
                    caption += `${i + 1}. ${d.title}${d.badgeValue ? ` [${d.badgeValue}]` : ''}\n`;
                });
                caption += `\n`;
            }

            if (whatsappCompanyForm.customMessage?.trim()) {
                caption += `💬 *Note:* ${whatsappCompanyForm.customMessage.trim()}\n\n`;
            }

            caption += `🌐 *Website:* https://uecivil.com`;

            const payload = {
                phone: cleanPhone,
                companyName: whatsappCompanyForm.companyName.trim() || comp.companyName,
                contactPersonName: whatsappCompanyForm.contactPersonName.trim(),
                email: whatsappCompanyForm.email.trim(),
                gstNumber: whatsappCompanyForm.gstNumber.trim().toUpperCase(),
                address: whatsappCompanyForm.address.trim(),
                pdfUrls: filesToSend,
                catalogTitles: titlesToSend,
                message: caption
            };

            const res = await api.post('/whatsapp/send-catalog', payload);
            if (res.data?.success) {
                toast({
                    title: '🚀 Company Details Shared!',
                    description: `Sent successfully to ${cleanPhone} on WhatsApp.`,
                    status: 'success',
                    duration: 4000,
                    isClosable: true
                });
                setIsWhatsappCompanyOpen(false);
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
            setIsSendingCompanyWhatsapp(false);
        }
    };

    // ─── SINGLE PARALLEL FETCH: All 5 endpoints fire at once ───────────────────
    const fetchAllDashboardData = useCallback(async () => {
        setStatsLoading(true);
        setUsersLoading(true);
        setAdminsLoading(true);

        // Fire requests simultaneously — no waiting between rounds
        const [prodRes, quoteRes, enqRes, usersRes, adminsRes, compRes, catRes] = await Promise.allSettled([
            api.get('/products/count'),          // returns { count: N } — tiny payload
            api.get('/quotations/stats'),         // returns { total, done, rejected } — tiny payload
            api.get('/enquiries/stats'),          // returns { total, unseen } — tiny payload
            api.get('/auth/users'),               // full list needed for table display
            api.get('/auth/admins'),              // full list needed for table display
            api.get('/company-master'),           // internal company master list
            api.get('/catalogs')                  // active catalogs list
        ]);

        if (catRes.status === 'fulfilled' && catRes.value.data?.success) {
            const list = catRes.value.data.data || [];
            setCatalogs(list);
            setStats(p => ({ ...p, catalogs: list.length }));
        }
        setCatalogsLoading(false);

        if (compRes.status === 'fulfilled' && compRes.value.data?.success && Array.isArray(compRes.value.data.data)) {
            const cList = compRes.value.data.data;
            setCompanies(cList);
            setSelectedCompanyId(prev => (prev && cList.some(c => c._id === prev)) ? prev : (cList[0]?._id || null));
        }
        setCompaniesLoading(false);

        // ── Stats ──────────────────────────────────────────────────────────────
        const productCount = prodRes.status === 'fulfilled'
            ? (prodRes.value.data.count ?? DEMO_PRODUCTS.length)
            : DEMO_PRODUCTS.length;

        const qStats = quoteRes.status === 'fulfilled' && quoteRes.value.data.success
            ? quoteRes.value.data
            : { done: 0, rejected: 0 };

        const eStats = enqRes.status === 'fulfilled' && enqRes.value.data.success
            ? enqRes.value.data
            : { total: DEMO_ENQUIRIES.length, unseen: 0 };

        const companyCount = compRes.status === 'fulfilled' && compRes.value.data?.success && Array.isArray(compRes.value.data.data)
            ? compRes.value.data.data.length
            : 0;

        // ── Users & Admins ─────────────────────────────────────────────────────
        let totalUsers = 0;
        if (usersRes.status === 'fulfilled') {
            const uData = usersRes.value.data.users || usersRes.value.data || [];
            const uArr = Array.isArray(uData) ? uData : [];
            setUsers(uArr);
            totalUsers = usersRes.value.data.total || uArr.length;
        }

        if (adminsRes.status === 'fulfilled') {
            const aData = adminsRes.value.data.admins || adminsRes.value.data || [];
            setAdmins(Array.isArray(aData) ? aData : []);
        }

        // ── Commit all stats in one setState call ──────────────────────────────
        setStats({
            products: productCount,
            totalEnquiries: eStats.total ?? 0,
            pendingEnquiries: eStats.unseen ?? 0,
            doneQuotations: qStats.done ?? 0,
            rejectedQuotations: qStats.rejected ?? 0,
            totalUsers,
            companies: companyCount
        });

        setStatsLoading(false);
        setUsersLoading(false);
        setAdminsLoading(false);
    }, []);

    useEffect(() => {
        fetchAllDashboardData();
    }, [fetchAllDashboardData]);

    // ─── DEBOUNCED REALTIME LISTENER ────────────────────────────────────────────
    // Prevents re-fetching on every rapid SSE push — waits 1.5s of silence
    useEffect(() => {
        const handleRealtimeUpdate = () => {
            if (realtimeDebounceRef.current) clearTimeout(realtimeDebounceRef.current);
            realtimeDebounceRef.current = setTimeout(() => {
                fetchAllDashboardData();
            }, 1500);
        };
        window.addEventListener('app-realtime-update', handleRealtimeUpdate);
        return () => {
            window.removeEventListener('app-realtime-update', handleRealtimeUpdate);
            if (realtimeDebounceRef.current) clearTimeout(realtimeDebounceRef.current);
        };
    }, [fetchAllDashboardData]);

    const handleCreateAdmin = async () => {
        if (!adminForm.name || !adminForm.email || !adminForm.phone) {
            return toast({ title: 'Please fill all fields', status: 'error', duration: 2500 });
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adminForm.email)) {
            return toast({ title: 'Enter a valid email', status: 'error', duration: 2500 });
        }
        if (adminForm.phone.length < 10) {
            return toast({ title: 'Enter a valid 10-digit phone number', status: 'error', duration: 2500 });
        }
        setAdminLoading(true);
        const res = await createAdmin(adminForm.name, adminForm.email, adminForm.phone, adminForm.permissions, adminForm.isSuperAdmin);
        setAdminLoading(false);
        if (res.success) {
            toast({ title: '✅ Admin Created!', description: res.msg || 'Admin account created successfully', status: 'success' });
            setAdminForm({ name: '', email: '', phone: '', isSuperAdmin: false, permissions: defaultPermissions });
            fetchAllDashboardData();
        } else {
            toast({ title: 'Failed', description: res.message || res.msg, status: 'error' });
        }
    };

    const handleOpenEditAdmin = (admin) => {
        setEditForm({
            _id: admin._id,
            name: admin.name || '',
            email: admin.email || '',
            phone: admin.phone || '',
            isSuperAdmin: !!admin.isSuperAdmin
        });
        setEditAdminModal({ isOpen: true, admin });
    };

    const handleUpdateAdmin = async () => {
        if (!editForm.name || !editForm.email || !editForm.phone) {
            return toast({ title: 'Please fill all fields', status: 'error', duration: 2500 });
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editForm.email)) {
            return toast({ title: 'Enter a valid email', status: 'error', duration: 2500 });
        }
        if (editForm.phone.length < 10) {
            return toast({ title: 'Enter a valid 10-digit phone number', status: 'error', duration: 2500 });
        }
        setEditLoading(true);
        try {
            const res = await api.put(`/auth/admins/${editForm._id}`, {
                name: editForm.name,
                email: editForm.email,
                phone: editForm.phone,
                isSuperAdmin: editForm.isSuperAdmin
            });
            if (res.data?.success || res.status === 200) {
                toast({
                    title: '✅ Admin Updated!',
                    description: res.data?.msg || 'Admin account updated successfully',
                    status: 'success'
                });
                setEditAdminModal({ isOpen: false, admin: null });
                fetchAllDashboardData();
            } else {
                toast({
                    title: 'Update Failed',
                    description: res.data?.msg || res.data?.message || 'Could not update admin',
                    status: 'error'
                });
            }
        } catch (err) {
            toast({
                title: 'Update Failed',
                description: err.response?.data?.msg || err.response?.data?.message || err.message,
                status: 'error'
            });
        } finally {
            setEditLoading(false);
        }
    };

    const handleOpenEditUser = (u) => {
        setEditUserForm({
            _id: u._id,
            name: u.name || '',
            contactPersonName: u.contactPersonName || u.name || '',
            companyName: u.companyName || '',
            email: u.email || '',
            phone: u.phone || '',
            gstNumber: u.gstNumber || '',
            address: u.address || ''
        });
        setEditUserModal({ isOpen: true, user: u });
    };

    const handleUpdateUser = async () => {
        if (!editUserForm.phone) {
            return toast({ title: 'Phone number is required', status: 'error', duration: 2500 });
        }
        if (editUserForm.phone.length < 10) {
            return toast({ title: 'Enter a valid 10-digit phone number', status: 'error', duration: 2500 });
        }
        if (editUserForm.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editUserForm.email)) {
            return toast({ title: 'Enter a valid email address', status: 'error', duration: 2500 });
        }

        setEditUserLoading(true);
        try {
            const payload = {
                name: editUserForm.name.trim() || editUserForm.contactPersonName.trim(),
                contactPersonName: editUserForm.contactPersonName.trim(),
                companyName: editUserForm.companyName.trim(),
                email: editUserForm.email.trim(),
                phone: editUserForm.phone.trim(),
                gstNumber: editUserForm.gstNumber.trim().toUpperCase(),
                address: editUserForm.address.trim()
            };

            const res = await api.put(`/auth/users/${editUserForm._id}`, payload);
            if (res.data?.success || res.status === 200) {
                toast({
                    title: '✅ User Updated!',
                    description: res.data?.msg || 'User details updated & synced to Google Contacts successfully',
                    status: 'success'
                });
                setEditUserModal({ isOpen: false, user: null });
                fetchAllDashboardData();
            } else {
                toast({
                    title: 'Update Failed',
                    description: res.data?.msg || res.data?.message || 'Could not update user',
                    status: 'error'
                });
            }
        } catch (err) {
            toast({
                title: 'Update Failed',
                description: err.response?.data?.msg || err.response?.data?.message || err.message,
                status: 'error'
            });
        } finally {
            setEditUserLoading(false);
        }
    };

    const confirmDeleteAccount = (account, type) => {
        setDeleteAccountModal({ isOpen: true, user: account, type });
    };

    const handleDeleteAccount = async () => {
        if (!deleteAccountModal.user) return;
        setIsDeleting(true);
        try {
            const res = await api.delete(`/auth/${deleteAccountModal.type}/${deleteAccountModal.user._id}`);
            if (res.data?.success || res.status === 200) {
                toast({
                    title: '✅ Account Removed',
                    description: `${deleteAccountModal.user.name || deleteAccountModal.user.contactPersonName || 'Account'} has been permanently deleted.`,
                    status: 'success'
                });
                fetchAllDashboardData();
                setDeleteAccountModal({ isOpen: false, user: null, type: '' });
            } else {
                toast({ title: 'Failed to delete account', description: res.data?.message || 'Error occurred', status: 'error' });
            }
        } catch (err) {
            toast({ title: 'Failed to delete account', description: err.response?.data?.message || err.message, status: 'error' });
        } finally {
            setIsDeleting(false);
        }
    };

    // Filter users by search
    const filteredUsers = users.filter(u => {
        if (!userSearch) return true;
        const q = userSearch.toLowerCase();
        return (
            (u.name || '').toLowerCase().includes(q) ||
            (u.email || '').toLowerCase().includes(q) ||
            (u.phone || '').includes(q) ||
            (u.companyName || '').toLowerCase().includes(q) ||
            (u.contactPersonName || '').toLowerCase().includes(q)
        );
    });

    // Filter admins by search
    const filteredAdmins = admins.filter(a => {
        if (!adminSearch) return true;
        const q = adminSearch.toLowerCase();
        return (
            (a.name || '').toLowerCase().includes(q) ||
            (a.email || '').toLowerCase().includes(q) ||
            (a.phone || '').includes(q)
        );
    });

    const formatDate = (dateStr) => {
        if (!dateStr) return '—';
        return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const getInitials = (u) => {
        const name = u.contactPersonName || u.name || u.companyName || '?';
        return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    };

    const AVATAR_COLORS = ['blue', 'teal', 'purple', 'orange', 'pink', 'cyan', 'green', 'red'];
    const getColor = (idx) => AVATAR_COLORS[idx % AVATAR_COLORS.length];

    // No full-page blocking spinner — page renders immediately with skeletons

    return (
        <Box>

            {/* Page Title & Health Button */}
            <Box bg="white" p={{ base: 4, md: 6 }} borderRadius="2xl" boxShadow="sm" border="1px" borderColor="gray.100" mb={8}>
                <Flex align="center" justify="space-between" wrap="wrap" gap={4}>
                    <Box>
                        <Heading fontSize={{ base: 'xl', md: '2xl' }} fontWeight="800" bgGradient="linear(to-r, brand.500, brand.700)" bgClip="text" mb={1}>
                            Dashboard Overview
                        </Heading>
                        <Text fontSize="sm" color="gray.500">Real-time performance metrics and business health.</Text>
                    </Box>
                    <Button
                        leftIcon={<FiActivity />}
                        colorScheme="purple"
                        bgGradient="linear(to-r, purple.600, brand.600)"
                        color="white"
                        _hover={{ bgGradient: "linear(to-r, purple.700, brand.700)", transform: "translateY(-1px)" }}
                        shadow="md"
                        borderRadius="xl"
                        px={6}
                        size="md"
                        onClick={() => setIsHealthOpen(true)}
                    >
                        Server & AI Health Monitor ✨
                    </Button>
                </Flex>
            </Box>

            {/* Stats Grid — renders immediately, numbers fill in as data arrives */}
            <SimpleGrid columns={{ base: 2, md: 3, lg: 6 }} spacing={5} mb={10}>
                {[
                    { label: 'Products', value: stats.products, icon: FiBox, color: 'brand.500', help: 'Inventory items', bg: 'brand.50', path: '/admin/products' },
                    { label: 'Catalogs', value: stats.catalogs || catalogs.length, icon: FiBookOpen, color: 'teal.500', help: 'WhatsApp brochures', bg: 'teal.50' },
                    { label: 'Total Enquiries', value: stats.totalEnquiries, icon: FiMessageSquare, color: 'blue.500', help: 'All time', bg: 'blue.50', path: '/admin/enquiries' },
                    { label: 'New Enquiries', value: stats.pendingEnquiries, icon: FiMessageSquare, color: 'orange.500', help: 'Action needed', bg: 'orange.50', path: '/admin/enquiries' },
                    { label: 'Success (Done)', value: stats.doneQuotations, icon: FiClock, color: 'green.500', help: 'Closed deals', bg: 'green.50', path: '/admin/enquiries' },
                    { label: 'Registered Users', value: stats.totalUsers, icon: FiUsers, color: 'purple.500', help: 'Website clients', bg: 'purple.50' },
                ].map((s, i) => (
                    <MotionBox
                        key={s.label}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35, delay: i * 0.05 }}
                        bg="white"
                        p={5}
                        borderRadius="xl"
                        boxShadow="sm"
                        border="1px solid"
                        borderColor="gray.100"
                        cursor={s.path ? 'pointer' : 'default'}
                        onClick={() => s.path && navigate(s.path)}
                        _hover={{ boxShadow: 'md', transform: 'translateY(-2px)' }}
                        style={{ transition: 'all 0.2s' }}
                    >
                        <Flex align="center" mb={3} gap={2}>
                            <Box p={2} bg={s.bg} borderRadius="lg">
                                <Icon as={s.icon} w={4} h={4} color={s.color} />
                            </Box>
                        </Flex>
                        {statsLoading ? (
                            <>
                                <Skeleton height="28px" width="60px" borderRadius="md" mb={2} />
                                <Skeleton height="12px" width="80px" borderRadius="md" mb={1} />
                                <Skeleton height="10px" width="55px" borderRadius="md" />
                            </>
                        ) : (
                            <>
                                <Text fontSize="2xl" fontWeight="900" color="gray.800" lineHeight="1">{s.value}</Text>
                                <Text fontSize="xs" fontWeight="700" color="gray.600" mt={1}>{s.label}</Text>
                                <Text fontSize="10px" color="gray.400" mt={0.5}>{s.help}</Text>
                            </>
                        )}
                    </MotionBox>
                ))}
            </SimpleGrid>

            {/* Create Admin Card - Restricted to Super Admin */}
            {user?.isSuperAdmin && (
                <Box bg="white" p={{ base: 4, md: 6 }} borderRadius="2xl" boxShadow="sm" border="1px" borderColor="purple.100" mb={8}>
                    <Flex align="center" gap={3} mb={4}>
                        <Box p={2} bg="purple.100" borderRadius="lg">
                            <Icon as={FiUserPlus} color="purple.600" w={5} h={5} />
                        </Box>
                        <Box>
                            <Heading fontSize="lg" fontWeight="800" color="purple.700">Create Admin User</Heading>
                            <Text fontSize="xs" color="gray.500">Add a new admin or promote an existing user. They will login via Email + OTP on WhatsApp.</Text>
                        </Box>
                    </Flex>

                    <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={4} alignItems="flex-end">
                        <FormControl isRequired>
                            <FormLabel fontSize="sm" fontWeight="700">Full Name</FormLabel>
                            <Input
                                placeholder="John Doe"
                                value={adminForm.name}
                                onChange={(e) => setAdminForm(p => ({ ...p, name: e.target.value }))}
                                borderRadius="lg"
                            />
                        </FormControl>
                        <FormControl isRequired>
                            <FormLabel fontSize="sm" fontWeight="700">Email Address</FormLabel>
                            <Input
                                type="email"
                                placeholder="admin@company.com"
                                value={adminForm.email}
                                onChange={(e) => setAdminForm(p => ({ ...p, email: e.target.value }))}
                                borderRadius="lg"
                            />
                        </FormControl>
                        <FormControl isRequired>
                            <FormLabel fontSize="sm" fontWeight="700">Phone Number</FormLabel>
                            <Input
                                placeholder="9876543210"
                                value={adminForm.phone}
                                onChange={(e) => setAdminForm(p => ({ ...p, phone: e.target.value.replace(/\D/g, '') }))}
                                maxLength={10}
                                borderRadius="lg"
                            />
                        </FormControl>
                        <FormControl display="flex" flexDirection="column" justifyContent="flex-end">
                            <FormLabel fontSize="sm" fontWeight="700" mb={1} display="flex" alignItems="center" gap={1.5}>
                                <Icon as={RiVipCrownFill} color={adminForm.isSuperAdmin ? "orange.500" : "gray.400"} />
                                Super Admin Role
                            </FormLabel>
                            <Flex
                                align="center"
                                justify="space-between"
                                h="40px"
                                px={3}
                                bg={adminForm.isSuperAdmin ? "purple.50" : "gray.50"}
                                borderRadius="lg"
                                border="1px solid"
                                borderColor={adminForm.isSuperAdmin ? "purple.300" : "gray.200"}
                                transition="all 0.2s"
                            >
                                <Text fontSize="xs" fontWeight="700" color={adminForm.isSuperAdmin ? "purple.700" : "gray.600"}>
                                    {adminForm.isSuperAdmin ? "Super Admin (ON)" : "Sub-Admin (OFF)"}
                                </Text>
                                <Switch
                                    colorScheme="purple"
                                    isChecked={!!adminForm.isSuperAdmin}
                                    onChange={(e) => setAdminForm(p => ({ ...p, isSuperAdmin: e.target.checked }))}
                                />
                            </Flex>
                        </FormControl>
                    </SimpleGrid>

                    <Button
                        mt={4}
                        colorScheme="purple"
                        leftIcon={<Icon as={FiUserPlus} />}
                        isLoading={adminLoading}
                        loadingText="Creating..."
                        onClick={handleCreateAdmin}
                        borderRadius="lg"
                        px={8}
                    >
                        Create Admin
                    </Button>
                </Box>
            )}

            {/* ── Product Catalogs & WhatsApp Sharing Management Section ────── */}
            <MotionBox
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.25 }}
                bg="white"
                borderRadius="2xl"
                boxShadow="sm"
                border="1px solid"
                borderColor="gray.100"
                overflow="hidden"
                mb={8}
            >
                {/* Header Gradient Banner */}
                <Flex
                    px={6} py={5}
                    bg="linear-gradient(135deg, #0F2027 0%, #203A43 50%, #2C5364 100%)"
                    align="center"
                    justify="space-between"
                    wrap="wrap"
                    gap={4}
                >
                    <HStack spacing={3}>
                        <Box p={2.5} bg="whiteAlpha.200" borderRadius="xl" backdropFilter="blur(5px)">
                            <Icon as={FiBookOpen} color="#25D366" w={6} h={6} />
                        </Box>
                        <Box>
                            <HStack spacing={2} align="center">
                                <Heading fontSize="lg" fontWeight="800" color="white">
                                    Product Catalogs & Brochures
                                </Heading>
                                <Badge bg="#25D366" color="white" borderRadius="full" px={2.5} py={0.5} fontSize="xs">
                                    {catalogs.length} Active
                                </Badge>
                            </HStack>
                            <Text fontSize="xs" color="whiteAlpha.800" mt={0.5}>
                                Upload PDF & Image Catalogs (PDF, JPG, PNG). Send directly to clients on WhatsApp with auto-fill & Google Contacts sync.
                            </Text>
                        </Box>
                    </HStack>

                    <HStack spacing={3} wrap="wrap">
                        {selectedCatalogIds.size > 0 && (
                            <Button
                                bg="#25D366"
                                color="white"
                                _hover={{ bg: "#128C7E", transform: "translateY(-1px)" }}
                                _active={{ bg: "#075E54" }}
                                size="sm"
                                borderRadius="xl"
                                px={4}
                                fontWeight="700"
                                leftIcon={<FaWhatsapp size={16} />}
                                onClick={openWhatsappModalForSelected}
                                boxShadow="0 4px 14px rgba(37, 211, 102, 0.4)"
                            >
                                Send ({selectedCatalogIds.size}) on WhatsApp
                            </Button>
                        )}
                        <Button
                            bg="white"
                            color="gray.800"
                            _hover={{ bg: "gray.100", transform: "translateY(-1px)" }}
                            size="sm"
                            borderRadius="xl"
                            px={4}
                            fontWeight="700"
                            leftIcon={<Icon as={FiUploadCloud} color="teal.500" />}
                            onClick={() => {
                                setCatalogForm({ title: '', category: 'General', description: '', file: null });
                                setIsAddCatalogOpen(true);
                            }}
                            boxShadow="md"
                        >
                            Upload Catalog
                        </Button>
                    </HStack>
                </Flex>

                {/* Search Bar & Stats */}
                <Box p={4} bg="gray.50/60" borderBottom="1px solid" borderColor="gray.100">
                    <Flex justify="space-between" align="center" direction={{ base: 'column', sm: 'row' }} gap={3}>
                        <HStack spacing={2}>
                            <Text fontSize="xs" fontWeight="700" color="gray.600">
                                Catalogs Available ({catalogs.length})
                            </Text>
                        </HStack>

                        <InputGroup size="sm" maxW={{ base: 'full', sm: '320px' }}>
                            <InputLeftElement pointerEvents="none">
                                <Icon as={FiSearch} color="gray.400" />
                            </InputLeftElement>
                            <Input
                                placeholder="Search catalog title..."
                                value={catalogSearch}
                                onChange={e => setCatalogSearch(e.target.value)}
                                borderRadius="lg"
                                bg="white"
                            />
                        </InputGroup>
                    </Flex>
                </Box>

                {/* Catalog Cards Grid */}
                <Box p={6}>
                    {catalogsLoading ? (
                        <SimpleGrid columns={{ base: 1, sm: 2, lg: 3, xl: 4 }} spacing={5}>
                            {[1, 2, 3, 4].map(n => (
                                <Box key={n} p={4} border="1px solid" borderColor="gray.100" borderRadius="xl">
                                    <Skeleton height="120px" borderRadius="lg" mb={3} />
                                    <Skeleton height="18px" width="80%" mb={2} />
                                    <Skeleton height="12px" width="50%" />
                                </Box>
                            ))}
                        </SimpleGrid>
                    ) : (() => {
                        const filtered = catalogs.filter(c => {
                            if (!catalogSearch.trim()) return true;
                            const q = catalogSearch.toLowerCase();
                            return (c.title || '').toLowerCase().includes(q) ||
                                (c.description || '').toLowerCase().includes(q);
                        });

                        if (filtered.length === 0) {
                            return (
                                <Flex p={10} flexDir="column" align="center" justify="center" border="1px dashed" borderColor="gray.200" borderRadius="xl">
                                    <Icon as={FiBookOpen} w={10} h={10} color="gray.300" mb={3} />
                                    <Text fontWeight="700" color="gray.600" fontSize="md">No Catalogs Found</Text>
                                    <Text color="gray.400" fontSize="xs" mb={4}>Upload your first catalog or brochure to share directly with clients via WhatsApp.</Text>
                                    <Button
                                        size="sm"
                                        colorScheme="teal"
                                        borderRadius="lg"
                                        leftIcon={<FiUploadCloud />}
                                        onClick={() => setIsAddCatalogOpen(true)}
                                    >
                                        Upload Catalog Now
                                    </Button>
                                </Flex>
                            );
                        }

                        return (
                            <SimpleGrid columns={{ base: 1, sm: 2, lg: 3, xl: 4 }} spacing={5}>
                                {filtered.map(cat => {
                                    const isSelected = selectedCatalogIds.has(cat._id);
                                    const isImg = (cat.pdfUrl || '').match(/\.(jpg|jpeg|png|webp)$/i);
                                    const fullUrl = getFileUrl(cat.pdfUrl);

                                    return (
                                        <Box
                                            key={cat._id}
                                            p={4}
                                            borderRadius="xl"
                                            border="2px solid"
                                            borderColor={isSelected ? "teal.400" : "gray.100"}
                                            bg={isSelected ? "teal.50/20" : "white"}
                                            boxShadow="sm"
                                            _hover={{ boxShadow: "md", transform: "translateY(-3px)", borderColor: isSelected ? "teal.500" : "gray.200" }}
                                            transition="all 0.2s"
                                            display="flex"
                                            flexDirection="column"
                                            justifyContent="space-between"
                                        >
                                            <Box>
                                                {/* Top Row: Checkbox + Size */}
                                                <Flex justify="space-between" align="center" mb={3}>
                                                    <Checkbox
                                                        colorScheme="teal"
                                                        isChecked={isSelected}
                                                        onChange={() => toggleCatalogSelection(cat._id)}
                                                    />
                                                    {cat.fileSize && (
                                                        <Badge colorScheme="teal" variant="subtle" fontSize="2xs" borderRadius="md" px={2} py={0.5} fontWeight="700">
                                                            {cat.fileSize}
                                                        </Badge>
                                                    )}
                                                </Flex>

                                                {/* Thumbnail / Document Banner */}
                                                <Box
                                                    h="110px"
                                                    borderRadius="lg"
                                                    bg="gray.50"
                                                    mb={3}
                                                    overflow="hidden"
                                                    display="flex"
                                                    alignItems="center"
                                                    justifyContent="center"
                                                    position="relative"
                                                    border="1px solid"
                                                    borderColor="gray.100"
                                                    cursor="pointer"
                                                    onClick={() => window.open(fullUrl, '_blank')}
                                                >
                                                    {isImg ? (
                                                        <Image
                                                            src={fullUrl}
                                                            alt={cat.title}
                                                            objectFit="cover"
                                                            w="full"
                                                            h="full"
                                                            fallback={
                                                                <Flex align="center" justify="center" direction="column" color="gray.400">
                                                                    <Icon as={FiFileText} w={8} h={8} />
                                                                    <Text fontSize="2xs" mt={1}>Catalog Image</Text>
                                                                </Flex>
                                                            }
                                                        />
                                                    ) : (
                                                        <Flex align="center" justify="center" direction="column" color="red.500">
                                                            <Icon as={FiFileText} w={10} h={10} />
                                                            <Text fontSize="2xs" fontWeight="700" color="gray.600" mt={1}>
                                                                PDF DOCUMENT
                                                            </Text>
                                                        </Flex>
                                                    )}
                                                </Box>

                                                {/* Title (Capital Letters) & Description */}
                                                <Text fontWeight="800" fontSize="sm" color="gray.800" textTransform="uppercase" letterSpacing="0.02em" noOfLines={2} mb={1}>
                                                    {cat.title}
                                                </Text>
                                                {cat.description && (
                                                    <Text fontSize="xs" color="gray.500" noOfLines={2} mb={2}>
                                                        {cat.description}
                                                    </Text>
                                                )}
                                                <HStack spacing={1} fontSize="2xs" color="gray.400" mb={3}>
                                                    <Icon as={FiCalendar} />
                                                    <Text>{new Date(cat.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</Text>
                                                </HStack>
                                            </Box>

                                            {/* Action Buttons */}
                                            <Box pt={2} borderTop="1px solid" borderColor="gray.100">
                                                <Button
                                                    w="full"
                                                    size="sm"
                                                    bg="#25D366"
                                                    color="white"
                                                    _hover={{ bg: "#128C7E", transform: "scale(1.02)" }}
                                                    _active={{ bg: "#075E54" }}
                                                    leftIcon={<FaWhatsapp size={16} />}
                                                    onClick={() => openWhatsappModalForCatalog(cat)}
                                                    mb={2}
                                                    fontWeight="700"
                                                    borderRadius="lg"
                                                    boxShadow="0 2px 8px rgba(37, 211, 102, 0.3)"
                                                >
                                                    Send on WhatsApp
                                                </Button>

                                                <HStack spacing={2}>
                                                    <Button
                                                        flex={1}
                                                        size="xs"
                                                        variant="outline"
                                                        colorScheme="blue"
                                                        borderRadius="md"
                                                        leftIcon={<FiExternalLink />}
                                                        onClick={() => window.open(fullUrl, '_blank')}
                                                    >
                                                        View / Download
                                                    </Button>
                                                    <IconButton
                                                        size="xs"
                                                        variant="ghost"
                                                        colorScheme="red"
                                                        icon={<FiTrash2 />}
                                                        aria-label="Delete catalog"
                                                        onClick={() => handleDeleteCatalog(cat._id, cat.title)}
                                                    />
                                                </HStack>
                                            </Box>
                                        </Box>
                                    );
                                })}
                            </SimpleGrid>
                        );
                    })()}
                </Box>
            </MotionBox>

            {/* ── Company Statutory Documents & WhatsApp Sharing Management Section ────── */}
            <MotionBox
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.28 }}
                bg="white"
                borderRadius="2xl"
                boxShadow="sm"
                border="1px solid"
                borderColor="gray.100"
                overflow="hidden"
                mb={8}
            >
                {/* Header Gradient Banner */}
                <Flex
                    px={6} py={5}
                    bg="linear-gradient(135deg, #1A365D 0%, #2A4365 50%, #1A202C 100%)"
                    align="center"
                    justify="space-between"
                    wrap="wrap"
                    gap={4}
                >
                    <HStack spacing={3}>
                        <Box p={2.5} bg="whiteAlpha.200" borderRadius="xl" backdropFilter="blur(5px)">
                            <Icon as={FaBuilding} color="#38B2AC" w={6} h={6} />
                        </Box>
                        <Box>
                            <HStack spacing={2} align="center">
                                <Heading fontSize="lg" fontWeight="800" color="white">
                                    Company Statutory Documents & Credentials
                                </Heading>
                                <Badge bg="#38B2AC" color="white" borderRadius="full" px={2.5} py={0.5} fontSize="xs">
                                    {companies.length} Companies
                                </Badge>
                            </HStack>
                            <Text fontSize="xs" color="whiteAlpha.800" mt={0.5}>
                                Company-wise GST, Udyam, PAN Card, Cancelled Cheque & Bank Details. View, upload, and share directly via WhatsApp.
                            </Text>
                        </Box>
                    </HStack>

                    <HStack spacing={3} wrap="wrap">
                        {(() => {
                            const activeComp = companies.find(c => c._id === selectedCompanyId) || companies[0];
                            if (!activeComp) return null;
                            return (
                                <>
                                    {selectedDocKeys.size > 0 && (
                                        <Button
                                            bg="#25D366"
                                            color="white"
                                            _hover={{ bg: "#128C7E", transform: "translateY(-1px)" }}
                                            _active={{ bg: "#075E54" }}
                                            size="sm"
                                            borderRadius="xl"
                                            px={4}
                                            fontWeight="700"
                                            leftIcon={<FaWhatsapp size={16} />}
                                            onClick={() => openWhatsappModalForSelectedCompanyDocs(activeComp)}
                                            boxShadow="0 4px 14px rgba(37, 211, 102, 0.4)"
                                        >
                                            Send Selected ({selectedDocKeys.size}) on WhatsApp
                                        </Button>
                                    )}

                                    <Button
                                        bg="whiteAlpha.200"
                                        color="white"
                                        _hover={{ bg: "whiteAlpha.300", transform: "translateY(-1px)" }}
                                        size="sm"
                                        borderRadius="xl"
                                        px={4}
                                        fontWeight="700"
                                        leftIcon={<FaWhatsapp size={16} />}
                                        onClick={() => openWhatsappModalForCompanyAll(activeComp)}
                                    >
                                        Share Full Profile on WhatsApp
                                    </Button>
                                </>
                            );
                        })()}

                        <Button
                            bg="teal.500"
                            color="white"
                            _hover={{ bg: "teal.600", transform: "translateY(-1px)" }}
                            size="sm"
                            borderRadius="xl"
                            px={4}
                            fontWeight="700"
                            leftIcon={<FiUploadCloud />}
                            onClick={() => openUploadDocModal(selectedCompanyId, null, false)}
                        >
                            Upload Document
                        </Button>

                        <Button
                            as={RouterLink}
                            to="/our-company"
                            variant="outline"
                            color="white"
                            borderColor="whiteAlpha.400"
                            _hover={{ bg: "whiteAlpha.200" }}
                            size="sm"
                            borderRadius="xl"
                            px={3}
                            fontWeight="600"
                            leftIcon={<FiExternalLink />}
                        >
                            Manage Companies
                        </Button>
                    </HStack>
                </Flex>

                {/* Company Selector Tab Bar */}
                <Box p={6}>
                    {companiesLoading ? (
                        <Flex justify="center" align="center" py={12}>
                            <Spinner size="lg" color="teal.500" thickness="3px" />
                        </Flex>
                    ) : companies.length === 0 ? (
                        <Flex direction="column" align="center" justify="center" py={12} color="gray.400">
                            <Icon as={FaBuilding} w={12} h={12} mb={3} opacity={0.4} />
                            <Text fontWeight="700" color="gray.600" fontSize="sm">No Companies Configured</Text>
                            <Text fontSize="xs" mt={1}>Add your company details to upload and share statutory documents.</Text>
                            <Button
                                as={RouterLink}
                                to="/our-company"
                                mt={4}
                                size="sm"
                                colorScheme="teal"
                                borderRadius="xl"
                                leftIcon={<Icon as={FaBuilding} />}
                            >
                                Setup Company Master
                            </Button>
                        </Flex>
                    ) : (
                        (() => {
                            const activeCompany = companies.find(c => c._id === selectedCompanyId) || companies[0];

                            return (
                                <VStack align="stretch" spacing={6}>
                                    {/* Company Pills & Active Switcher */}
                                    <Flex justify="space-between" align="center" wrap="wrap" gap={3} pb={4} borderBottom="1px solid" borderColor="gray.100">
                                        <HStack spacing={2} wrap="wrap">
                                            <Text fontSize="xs" fontWeight="700" color="gray.500" mr={1}>
                                                Select Company:
                                            </Text>
                                            {companies.map(c => {
                                                const isSelected = c._id === activeCompany?._id;
                                                return (
                                                    <Button
                                                        key={c._id}
                                                        size="sm"
                                                        borderRadius="xl"
                                                        fontWeight="700"
                                                        variant={isSelected ? "solid" : "outline"}
                                                        colorScheme={isSelected ? "teal" : "gray"}
                                                        bg={isSelected ? "teal.600" : "white"}
                                                        color={isSelected ? "white" : "gray.700"}
                                                        borderColor={isSelected ? "teal.600" : "gray.200"}
                                                        leftIcon={<Icon as={FaBuilding} />}
                                                        onClick={() => {
                                                            setSelectedCompanyId(c._id);
                                                            setSelectedDocKeys(new Set());
                                                        }}
                                                        boxShadow={isSelected ? "0 2px 8px rgba(56, 178, 172, 0.35)" : "none"}
                                                    >
                                                        {c.companyName || 'Unnamed Company'}
                                                    </Button>
                                                );
                                            })}
                                        </HStack>

                                        {selectedDocKeys.size > 0 && (
                                            <Button
                                                size="xs"
                                                variant="ghost"
                                                colorScheme="red"
                                                onClick={() => setSelectedDocKeys(new Set())}
                                            >
                                                Clear Selection ({selectedDocKeys.size})
                                            </Button>
                                        )}
                                    </Flex>

                                    {/* Selected Company Details Strip */}
                                    {activeCompany && (
                                        <Box bg="gray.50" p={5} borderRadius="xl" border="1px solid" borderColor="gray.200">
                                            <Flex justify="space-between" align="start" wrap="wrap" gap={4}>
                                                <Box flex="1" minW="260px">
                                                    <HStack spacing={2} align="center" mb={1}>
                                                        <Heading size="sm" color="gray.800" fontWeight="800">
                                                            {activeCompany.companyName}
                                                        </Heading>
                                                        {activeCompany.invoicePrefix && (
                                                            <Badge colorScheme="purple" borderRadius="md" px={2}>
                                                                Prefix: {activeCompany.invoicePrefix}
                                                            </Badge>
                                                        )}
                                                    </HStack>
                                                    <Text fontSize="xs" color="gray.600">
                                                        📍 {activeCompany.address || 'Address not specified'}
                                                        {activeCompany.state ? `, ${activeCompany.state}` : ''}
                                                        {activeCompany.pincode ? ` - ${activeCompany.pincode}` : ''}
                                                    </Text>
                                                    <HStack spacing={4} mt={2} fontSize="xs" color="gray.500" wrap="wrap">
                                                        {activeCompany.contactNo && (
                                                            <HStack spacing={1}>
                                                                <Icon as={FiPhone} />
                                                                <Text>{activeCompany.contactNo}</Text>
                                                            </HStack>
                                                        )}
                                                        {activeCompany.email && (
                                                            <HStack spacing={1}>
                                                                <Icon as={FiMail} />
                                                                <Text>{activeCompany.email}</Text>
                                                            </HStack>
                                                        )}
                                                    </HStack>
                                                </Box>

                                                {/* Quick Copy Badges */}
                                                <HStack spacing={2} wrap="wrap" justify={{ base: "start", md: "end" }}>
                                                    {activeCompany.gstin && (
                                                        <Tag size="md" colorScheme="green" borderRadius="lg" cursor="pointer" onClick={() => handleCopyText(activeCompany.gstin, 'GSTIN')}>
                                                            <TagLabel fontWeight="700">GSTIN: {activeCompany.gstin}</TagLabel>
                                                            <Icon as={FiCopy} ml={1.5} />
                                                        </Tag>
                                                    )}
                                                    {activeCompany.panCardNumber && (
                                                        <Tag size="md" colorScheme="orange" borderRadius="lg" cursor="pointer" onClick={() => handleCopyText(activeCompany.panCardNumber, 'PAN Card')}>
                                                            <TagLabel fontWeight="700">PAN: {activeCompany.panCardNumber}</TagLabel>
                                                            <Icon as={FiCopy} ml={1.5} />
                                                        </Tag>
                                                    )}
                                                    {activeCompany.udyamNumber && (
                                                        <Tag size="md" colorScheme="blue" borderRadius="lg" cursor="pointer" onClick={() => handleCopyText(activeCompany.udyamNumber, 'Udyam No')}>
                                                            <TagLabel fontWeight="700">Udyam: {activeCompany.udyamNumber}</TagLabel>
                                                            <Icon as={FiCopy} ml={1.5} />
                                                        </Tag>
                                                    )}
                                                    {activeCompany.bankDetails?.accountNumber && (
                                                        <Tag size="md" colorScheme="teal" borderRadius="lg" cursor="pointer" onClick={() => handleCopyText(activeCompany.bankDetails?.accountNumber, 'Bank Account')}>
                                                            <TagLabel fontWeight="700">A/C: {activeCompany.bankDetails?.accountNumber} ({activeCompany.bankDetails?.ifscCode || ''})</TagLabel>
                                                            <Icon as={FiCopy} ml={1.5} />
                                                        </Tag>
                                                    )}
                                                </HStack>
                                            </Flex>
                                        </Box>
                                    )}

                                    {/* Statutory Documents Cards Grid: ONLY show GST, Udyam, PAN, Cheque (and any uploaded other docs) IF AVAILABLE */}
                                    {(() => {
                                        const CORE_KEYS = ['gstDoc', 'udyamDoc', 'panCardDoc', 'cancelledChequeDoc'];

                                        // Only show fixed documents that are ACTUALLY AVAILABLE / uploaded in this company!
                                        const availableCoreDocs = CORE_KEYS
                                            .map(key => getDocDefinition(activeCompany, key))
                                            .filter(doc => doc && Boolean(doc.url));

                                        // Multiple other documents: collect from activeCompany.otherDocs array
                                        const allOtherDocsList = [];
                                        if (Array.isArray(activeCompany.otherDocs)) {
                                            activeCompany.otherDocs.forEach((od, idx) => {
                                                if (od.url) {
                                                    allOtherDocsList.push({
                                                        key: `otherDoc_${od._id || idx}`,
                                                        title: od.title || `Other Document #${idx + 1}`,
                                                        shortTitle: od.title || `Other Doc #${idx + 1}`,
                                                        badgeLabel: 'Document',
                                                        badgeValue: od.title || 'Other Statutory Document',
                                                        url: od.url,
                                                        colorScheme: 'purple',
                                                        icon: FiFileText,
                                                        isMultipleOtherDoc: true,
                                                        otherDocId: od._id,
                                                        otherDocIndex: idx
                                                    });
                                                }
                                            });
                                        }

                                        // Include legacy single otherDoc if not in array
                                        if (activeCompany.otherDoc && !allOtherDocsList.some(d => d.url === activeCompany.otherDoc)) {
                                            allOtherDocsList.unshift({
                                                key: 'otherDoc',
                                                title: activeCompany.otherDocTitle || 'Other Statutory Document',
                                                shortTitle: activeCompany.otherDocTitle || 'Other Document',
                                                badgeLabel: 'Document',
                                                badgeValue: activeCompany.otherDocTitle || 'Other Document',
                                                url: activeCompany.otherDoc,
                                                colorScheme: 'purple',
                                                icon: FiFileText,
                                                isMultipleOtherDoc: false
                                            });
                                        }

                                        const allAvailableDocs = [...availableCoreDocs, ...allOtherDocsList];

                                        if (allAvailableDocs.length === 0) {
                                            return (
                                                <Box
                                                    p={8}
                                                    textAlign="center"
                                                    bg="white"
                                                    borderRadius="2xl"
                                                    border="2px dashed"
                                                    borderColor="gray.200"
                                                >
                                                    <Icon as={FaBuilding} w={10} h={10} color="teal.400" mb={3} opacity={0.7} />
                                                    <Heading size="xs" color="gray.700" fontWeight="700" mb={1}>
                                                        No Statutory Documents Uploaded Yet for {activeCompany.companyName}
                                                    </Heading>
                                                    <Text fontSize="xs" color="gray.500" maxW="480px" mx="auto" mb={4}>
                                                        Only available documents are displayed. Upload GST Registration Certificate, Udyam Certificate, PAN Card, or other company documents to view and share directly via WhatsApp.
                                                    </Text>
                                                    <Button
                                                        size="sm"
                                                        colorScheme="teal"
                                                        borderRadius="xl"
                                                        leftIcon={<FiUploadCloud />}
                                                        onClick={() => openUploadDocModal(activeCompany._id, null, false)}
                                                    >
                                                        Upload Document (GST / Udyam / PAN / Other)
                                                    </Button>
                                                </Box>
                                            );
                                        }

                                        return (
                                            <SimpleGrid columns={{ base: 1, sm: 2, md: 3, xl: 4 }} spacing={4}>
                                                {allAvailableDocs.map(doc => {
                                                    const isUploaded = Boolean(doc.url);
                                                    const isSelected = selectedDocKeys.has(doc.key);
                                                    const fullDocUrl = isUploaded ? getFileUrl(doc.url) : '';
                                                    const isPdf = isUploaded && doc.url.toLowerCase().includes('.pdf');

                                                    return (
                                                        <Box
                                                            key={doc.key}
                                                            border="1px solid"
                                                            borderColor={isSelected ? "teal.400" : "gray.200"}
                                                            borderRadius="xl"
                                                            p={3}
                                                            bg="white"
                                                            boxShadow={isSelected ? "0 4px 12px rgba(56, 178, 172, 0.2)" : "xs"}
                                                            transition="all 0.2s ease"
                                                            _hover={{ borderColor: "teal.400", transform: "translateY(-2px)", boxShadow: "sm" }}
                                                            display="flex"
                                                            flexDirection="column"
                                                            justifyContent="space-between"
                                                        >
                                                            <Box>
                                                                {/* Card Header & Checkbox */}
                                                                <Flex justify="space-between" align="center" mb={2}>
                                                                    <HStack spacing={1.5}>
                                                                        <Checkbox
                                                                            size="sm"
                                                                            colorScheme="teal"
                                                                            isChecked={isSelected}
                                                                            onChange={() => toggleCompanyDocSelection(doc.key)}
                                                                        />
                                                                        <Badge colorScheme={doc.colorScheme} borderRadius="md" px={1.5} py={0.5} fontSize="3xs" fontWeight="700">
                                                                            {doc.shortTitle.toUpperCase()}
                                                                        </Badge>
                                                                    </HStack>
                                                                    <Badge
                                                                        colorScheme={isPdf ? "red" : "green"}
                                                                        variant="subtle"
                                                                        borderRadius="full"
                                                                        px={2}
                                                                        py={0.5}
                                                                        fontSize="3xs"
                                                                        fontWeight="bold"
                                                                    >
                                                                        {isPdf ? 'PDF' : 'IMAGE'}
                                                                    </Badge>
                                                                </Flex>

                                                                {/* Compact Document Preview Box */}
                                                                <Box
                                                                    h="76px"
                                                                    bg={isPdf ? "red.50" : "gray.50"}
                                                                    borderRadius="lg"
                                                                    overflow="hidden"
                                                                    mb={2.5}
                                                                    display="flex"
                                                                    alignItems="center"
                                                                    justifyContent="center"
                                                                    position="relative"
                                                                    border="1px solid"
                                                                    borderColor={isPdf ? "red.100" : "gray.200"}
                                                                    cursor="pointer"
                                                                    _hover={{ bg: isPdf ? "red.100" : "gray.100" }}
                                                                    onClick={() => window.open(fullDocUrl, '_blank')}
                                                                >
                                                                    {isPdf ? (
                                                                        <HStack spacing={2} color="red.500">
                                                                            <Icon as={FaFilePdf} w={6} h={6} />
                                                                            <VStack align="start" spacing={0}>
                                                                                <Text fontSize="2xs" fontWeight="800" color="gray.700" textTransform="uppercase">
                                                                                    PDF Certificate
                                                                                </Text>
                                                                                <Text fontSize="3xs" color="gray.400">
                                                                                    Click to View
                                                                                </Text>
                                                                            </VStack>
                                                                        </HStack>
                                                                    ) : (
                                                                        <Image
                                                                            src={fullDocUrl}
                                                                            alt={doc.title}
                                                                            objectFit="contain"
                                                                            w="full"
                                                                            h="full"
                                                                            maxH="76px"
                                                                            p={1.5}
                                                                            fallback={
                                                                                <Flex align="center" justify="center" direction="column" color="gray.400">
                                                                                    <Icon as={FiFileText} w={6} h={6} />
                                                                                    <Text fontSize="3xs" mt={0.5}>Document Image</Text>
                                                                                </Flex>
                                                                            }
                                                                        />
                                                                    )}
                                                                </Box>

                                                                {/* Document Title & Badge Value */}
                                                                <Text fontWeight="800" fontSize="xs" color="gray.800" noOfLines={1} mb={1} title={doc.title}>
                                                                    {doc.title}
                                                                </Text>
                                                                {doc.badgeValue ? (
                                                                    <HStack spacing={1} mb={2}>
                                                                        <Tag size="sm" colorScheme={doc.colorScheme} borderRadius="md" variant="subtle" maxW="full">
                                                                            <TagLabel fontSize="3xs" fontWeight="700" isTruncated>
                                                                                {doc.badgeLabel}: {doc.badgeValue}
                                                                            </TagLabel>
                                                                        </Tag>
                                                                        <IconButton
                                                                            size="2xs"
                                                                            variant="ghost"
                                                                            icon={<FiCopy />}
                                                                            aria-label="Copy identifier"
                                                                            onClick={() => handleCopyText(doc.badgeValue, doc.badgeLabel)}
                                                                        />
                                                                    </HStack>
                                                                ) : (
                                                                    <Text fontSize="3xs" color="gray.400" mb={2} fontStyle="italic">
                                                                        Attached Document
                                                                    </Text>
                                                                )}
                                                            </Box>

                                                            {/* Action Buttons: Clean Single Row with Simple WhatsApp Icon Button */}
                                                            <Box pt={2.5} borderTop="1px solid" borderColor="gray.100">
                                                                <HStack spacing={1.5}>
                                                                    <Button
                                                                        flex={1}
                                                                        size="xs"
                                                                        variant="outline"
                                                                        colorScheme="blue"
                                                                        borderRadius="lg"
                                                                        leftIcon={<FiExternalLink />}
                                                                        onClick={() => window.open(fullDocUrl, '_blank')}
                                                                    >
                                                                        View
                                                                    </Button>
                                                                    <Button
                                                                        flex={1}
                                                                        size="xs"
                                                                        variant="outline"
                                                                        colorScheme="teal"
                                                                        borderRadius="lg"
                                                                        leftIcon={<FiUploadCloud />}
                                                                        onClick={() => {
                                                                            if (doc.isMultipleOtherDoc || doc.key.startsWith('otherDoc')) {
                                                                                openUploadDocModal(activeCompany._id, 'otherDoc', false);
                                                                            } else {
                                                                                openUploadDocModal(activeCompany._id, doc.key, true);
                                                                            }
                                                                        }}
                                                                    >
                                                                        {doc.isMultipleOtherDoc || doc.key.startsWith('otherDoc') ? 'Add' : 'Replace'}
                                                                    </Button>
                                                                    <Tooltip label="Send on WhatsApp" hasArrow placement="top">
                                                                        <IconButton
                                                                            size="xs"
                                                                            bg="#25D366"
                                                                            color="white"
                                                                            _hover={{ bg: "#128C7E", transform: "scale(1.08)" }}
                                                                            _active={{ bg: "#075E54" }}
                                                                            borderRadius="lg"
                                                                            icon={<FaWhatsapp size={13} />}
                                                                            aria-label="Send on WhatsApp"
                                                                            boxShadow="0 2px 6px rgba(37, 211, 102, 0.3)"
                                                                            onClick={() => openWhatsappModalForCompanyDoc(activeCompany, doc.key)}
                                                                        />
                                                                    </Tooltip>
                                                                    <Tooltip label="Remove Document" hasArrow placement="top">
                                                                        <IconButton
                                                                            size="xs"
                                                                            variant="ghost"
                                                                            colorScheme="red"
                                                                            borderRadius="lg"
                                                                            icon={<FiTrash2 size={13} />}
                                                                            aria-label="Remove document"
                                                                            title="Remove document from company"
                                                                            onClick={() => handleRemoveCompanyDoc(activeCompany._id, doc.key, doc.title)}
                                                                        />
                                                                    </Tooltip>
                                                                </HStack>
                                                            </Box>
                                                        </Box>
                                                    );
                                                })}
                                            </SimpleGrid>
                                        );
                                    })()}
                                </VStack>
                            );
                        })()
                    )}
                </Box>
            </MotionBox>

            {/* ── Admins & Registered Users Management (Separate Tabs) ────── */}
            <MotionBox
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                bg="white"
                borderRadius="2xl"
                boxShadow="sm"
                border="1px solid"
                borderColor="gray.100"
                overflow="hidden"
                mb={8}
            >
                <Tabs variant="enclosed" colorScheme="purple" isLazy>
                    <Flex
                        px={6} pt={5} pb={2}
                        bg="linear-gradient(135deg, #6B46C1 0%, #553C9A 100%)"
                        align="center"
                        justify="space-between"
                        wrap="wrap"
                        gap={4}
                    >
                        <Box>
                            <Heading fontSize="lg" fontWeight="800" color="white" mb={1}>
                                User & Admin Accounts
                            </Heading>
                            <Text fontSize="xs" color="whiteAlpha.800">
                                Separate view for internal administrators and registered website clients.
                            </Text>
                        </Box>

                        <TabList borderBottom="none" gap={2}>
                            <Tab
                                bg="whiteAlpha.200"
                                color="white"
                                _selected={{ bg: 'white', color: 'purple.700', fontWeight: '800', boxShadow: 'md' }}
                                borderRadius="xl"
                                py={2.5}
                                px={5}
                                fontSize="sm"
                                transition="all 0.2s"
                                border="none"
                            >
                                <Flex align="center" gap={2}>
                                    <Icon as={FiShield} w={4} h={4} />
                                    <Text>Admins</Text>
                                    <Badge bg={admins.length ? 'purple.500' : 'gray.400'} color="white" borderRadius="full" px={2}>
                                        {admins.length}
                                    </Badge>
                                </Flex>
                            </Tab>
                            <Tab
                                bg="whiteAlpha.200"
                                color="white"
                                _selected={{ bg: 'white', color: 'purple.700', fontWeight: '800', boxShadow: 'md' }}
                                borderRadius="xl"
                                py={2.5}
                                px={5}
                                fontSize="sm"
                                transition="all 0.2s"
                                border="none"
                            >
                                <Flex align="center" gap={2}>
                                    <Icon as={FiUsers} w={4} h={4} />
                                    <Text>Registered Users</Text>
                                    <Badge bg={filteredUsers.length ? 'blue.500' : 'gray.400'} color="white" borderRadius="full" px={2}>
                                        {users.length}
                                    </Badge>
                                </Flex>
                            </Tab>
                        </TabList>
                    </Flex>

                    <TabPanels p={0}>
                        {/* ── TAB 1: ADMINS PANEL (Excludes Super Admin) ── */}
                        <TabPanel p={0}>
                            <Box px={6} pt={4}>
                            </Box>
                            {!canReadAdmins ? (
                                <Flex direction="column" align="center" justify="center" py={16} color="gray.400">
                                    <Icon as={FiShield} w={12} h={12} mb={3} />
                                    <Text fontWeight="600">Access Restricted</Text>
                                    <Text fontSize="sm" mt={1}>You do not have read permissions for Admin Accounts.</Text>
                                </Flex>
                            ) : (
                                <>
                            <Flex px={6} py={3} bg="purple.50" align="center" justify="space-between" wrap="wrap" gap={3} borderBottom="1px solid" borderColor="purple.100">
                                <Text fontSize="xs" fontWeight="700" color="purple.800">
                                    {filteredAdmins.length} {filteredAdmins.length === 1 ? 'Admin User' : 'Admin Users'}
                                </Text>
                                <InputGroup size="sm" maxW="240px" bg="white" borderRadius="lg" boxShadow="xs">
                                    <InputLeftElement pointerEvents="none">
                                        <Icon as={FiSearch} color="gray.400" />
                                    </InputLeftElement>
                                    <Input
                                        placeholder="Search admins..."
                                        value={adminSearch}
                                        onChange={e => setAdminSearch(e.target.value)}
                                        borderRadius="lg"
                                        borderColor="purple.200"
                                        _focus={{ borderColor: 'purple.500', boxShadow: 'none' }}
                                    />
                                </InputGroup>
                            </Flex>

                            {adminsLoading ? (
                                <Flex justify="center" align="center" py={16}>
                                    <Spinner size="lg" color="purple.500" thickness="3px" />
                                </Flex>
                            ) : filteredAdmins.length === 0 ? (
                                <Flex direction="column" align="center" justify="center" py={16} color="gray.400">
                                    <Icon as={FiShield} w={12} h={12} mb={3} />
                                    <Text fontWeight="600">No admin users found</Text>
                                    <Text fontSize="sm" mt={1}>
                                        {adminSearch ? `No results for "${adminSearch}"` : 'No sub-admin accounts created yet.'}
                                    </Text>
                                </Flex>
                            ) : (
                                <Box overflowX="auto">
                                    <Table variant="simple" size="sm">
                                        <Thead bg="gray.50">
                                            <Tr>
                                                <Th py={3} fontSize="10px" color="gray.500">#</Th>
                                                <Th py={3} fontSize="10px" color="gray.500">ADMIN USER</Th>
                                                <Th py={3} fontSize="10px" color="gray.500">CONTACT</Th>
                                                <Th py={3} fontSize="10px" color="gray.500">ROLE</Th>
                                                <Th py={3} fontSize="10px" color="gray.500">JOINED</Th>
                                                {user?.isSuperAdmin && <Th py={3} fontSize="10px" color="gray.500" textAlign="center">ACTIONS</Th>}
                                            </Tr>
                                        </Thead>
                                        <Tbody>
                                            {filteredAdmins.map((a, idx) => (
                                                <Tr
                                                    key={a._id || idx}
                                                    _hover={{ bg: 'purple.50' }}
                                                    transition="background 0.15s"
                                                    borderBottom="1px solid"
                                                    borderColor="gray.100"
                                                >
                                                    <Td py={3}>
                                                        <Text fontSize="xs" color="gray.400" fontWeight="600">{idx + 1}</Text>
                                                    </Td>
                                                    <Td py={3}>
                                                        <Flex align="center" gap={3}>
                                                            <Avatar
                                                                size="sm"
                                                                name={getInitials(a)}
                                                                bg={`${getColor(idx)}.500`}
                                                                color="white"
                                                                fontWeight="700"
                                                                fontSize="xs"
                                                            />
                                                            <Stack spacing={0}>
                                                                <Text fontWeight="700" fontSize="sm" color="gray.800">
                                                                    {a.name || '—'}
                                                                </Text>
                                                                <Text fontSize="xs" color="gray.400">{a.email}</Text>
                                                            </Stack>
                                                        </Flex>
                                                    </Td>
                                                    <Td py={3}>
                                                        <Stack spacing={1}>
                                                            <Flex align="center" gap={1}>
                                                                <Icon as={FiPhone} w={3} h={3} color="green.400" />
                                                                <Text fontSize="xs" fontWeight="600" color="gray.700">{a.phone || '—'}</Text>
                                                            </Flex>
                                                            <Flex align="center" gap={1}>
                                                                <Icon as={FiMail} w={3} h={3} color="blue.400" />
                                                                <Text fontSize="xs" color="gray.500" noOfLines={1}>{a.email || '—'}</Text>
                                                            </Flex>
                                                        </Stack>
                                                    </Td>
                                                    <Td py={3}>
                                                        {a.isSuperAdmin ? (
                                                            <Badge
                                                                colorScheme="yellow"
                                                                bg="orange.100"
                                                                color="orange.800"
                                                                borderRadius="full"
                                                                px={2.5}
                                                                py={0.5}
                                                                fontSize="10px"
                                                                fontWeight="800"
                                                                display="inline-flex"
                                                                alignItems="center"
                                                                gap={1}
                                                                border="1px solid"
                                                                borderColor="orange.300"
                                                            >
                                                                <Icon as={RiVipCrownFill} color="orange.500" />
                                                                SUPER ADMIN
                                                            </Badge>
                                                        ) : (
                                                            <Badge colorScheme="purple" borderRadius="full" px={2.5} py={0.5} fontSize="10px" fontWeight="800">
                                                                SUB-ADMIN
                                                            </Badge>
                                                        )}
                                                    </Td>
                                                    <Td py={3}>
                                                        <Flex align="center" gap={1}>
                                                            <Icon as={FiCalendar} w={3} h={3} color="gray.400" />
                                                            <Text fontSize="xs" color="gray.500">{formatDate(a.createdAt)}</Text>
                                                        </Flex>
                                                    </Td>
                                                    {user?.isSuperAdmin && (
                                                        <Td py={3} textAlign="center">
                                                            <HStack spacing={1} justify="center">
                                                                <Tooltip label="Edit Admin Details" placement="top">
                                                                    <IconButton
                                                                        icon={<Icon as={FiEdit2} />}
                                                                        size="sm"
                                                                        colorScheme="purple"
                                                                        variant="ghost"
                                                                        borderRadius="lg"
                                                                        _hover={{ bg: 'purple.50', color: 'purple.600' }}
                                                                        onClick={() => handleOpenEditAdmin(a)}
                                                                        aria-label="Edit Admin"
                                                                    />
                                                                </Tooltip>
                                                                <Tooltip label="Remove Admin Account" placement="top">
                                                                    <IconButton
                                                                        icon={<Icon as={FiTrash2} />}
                                                                        size="sm"
                                                                        colorScheme="red"
                                                                        variant="ghost"
                                                                        borderRadius="lg"
                                                                        _hover={{ bg: 'red.50', color: 'red.600' }}
                                                                        onClick={() => confirmDeleteAccount(a, 'admins')}
                                                                        aria-label="Delete Admin"
                                                                    />
                                                                </Tooltip>
                                                            </HStack>
                                                        </Td>
                                                    )}
                                                </Tr>
                                            ))}
                                        </Tbody>
                                    </Table>
                                </Box>
                            )}
                            </>
                            )}
                        </TabPanel>

                        {/* ── TAB 2: REGISTERED USERS PANEL ── */}
                        <TabPanel p={0}>
                            <Box px={6} pt={4}>
                            </Box>
                            {!canReadUsers ? (
                                <Flex direction="column" align="center" justify="center" py={16} color="gray.400">
                                    <Icon as={FiUsers} w={12} h={12} mb={3} />
                                    <Text fontWeight="600">Access Restricted</Text>
                                    <Text fontSize="sm" mt={1}>You do not have read permissions for Registered Users.</Text>
                                </Flex>
                            ) : (
                                <>
                            <Flex px={6} py={3} bg="gray.50" align="center" justify="space-between" wrap="wrap" gap={3} borderBottom="1px solid" borderColor="gray.200">
                                <Text fontSize="xs" fontWeight="700" color="gray.700">
                                    {filteredUsers.length} {filteredUsers.length === 1 ? 'Registered Client' : 'Registered Clients'}
                                </Text>
                                <InputGroup size="sm" maxW="240px" bg="white" borderRadius="lg" boxShadow="xs">
                                    <InputLeftElement pointerEvents="none">
                                        <Icon as={FiSearch} color="gray.400" />
                                    </InputLeftElement>
                                    <Input
                                        placeholder="Search users..."
                                        value={userSearch}
                                        onChange={e => setUserSearch(e.target.value)}
                                        borderRadius="lg"
                                        borderColor="gray.200"
                                        _focus={{ borderColor: 'blue.500', boxShadow: 'none' }}
                                    />
                                </InputGroup>
                            </Flex>

                            {usersLoading ? (
                                <Flex justify="center" align="center" py={16}>
                                    <Spinner size="lg" color="purple.500" thickness="3px" />
                                </Flex>
                            ) : filteredUsers.length === 0 ? (
                                <Flex direction="column" align="center" justify="center" py={16} color="gray.400">
                                    <Icon as={FiUsers} w={12} h={12} mb={3} />
                                    <Text fontWeight="600">No registered users found</Text>
                                    <Text fontSize="sm" mt={1}>
                                        {userSearch ? `No results for "${userSearch}"` : 'Users who register on the website will appear here'}
                                    </Text>
                                </Flex>
                            ) : (
                                <Box overflowX="auto">
                                    <Table variant="simple" size="sm">
                                        <Thead bg="gray.50">
                                            <Tr>
                                                <Th py={3} fontSize="10px" color="gray.500">#</Th>
                                                <Th py={3} fontSize="10px" color="gray.500">USER</Th>
                                                <Th py={3} fontSize="10px" color="gray.500">CONTACT</Th>
                                                <Th py={3} fontSize="10px" color="gray.500">COMPANY</Th>
                                                <Th py={3} fontSize="10px" color="gray.500">GST</Th>
                                                <Th py={3} fontSize="10px" color="gray.500">ADDRESS</Th>
                                                <Th py={3} fontSize="10px" color="gray.500">JOINED</Th>
                                                {(user?.isSuperAdmin || canWriteUsers) && <Th py={3} fontSize="10px" color="gray.500" textAlign="center">ACTIONS</Th>}
                                            </Tr>
                                        </Thead>
                                        <Tbody>
                                            {filteredUsers.map((u, idx) => (
                                                <Tr
                                                    key={u._id || idx}
                                                    _hover={{ bg: 'blue.50' }}
                                                    transition="background 0.15s"
                                                    borderBottom="1px solid"
                                                    borderColor="gray.100"
                                                >
                                                    <Td py={3}>
                                                        <Text fontSize="xs" color="gray.400" fontWeight="600">{idx + 1}</Text>
                                                    </Td>
                                                    <Td py={3}>
                                                        <Flex align="center" gap={3}>
                                                            <Avatar
                                                                size="sm"
                                                                name={getInitials(u)}
                                                                bg={`${getColor(idx)}.400`}
                                                                color="white"
                                                                fontWeight="700"
                                                                fontSize="xs"
                                                            />
                                                            <Stack spacing={0}>
                                                                <Text fontWeight="700" fontSize="sm" color="gray.800">
                                                                    {u.contactPersonName || u.name || '—'}
                                                                </Text>
                                                                <Text fontSize="xs" color="gray.400">{u.email}</Text>
                                                            </Stack>
                                                        </Flex>
                                                    </Td>
                                                    <Td py={3}>
                                                        <Stack spacing={1}>
                                                            <Flex align="center" gap={1}>
                                                                <Icon as={FiPhone} w={3} h={3} color="green.400" />
                                                                <Text fontSize="xs" fontWeight="600" color="gray.700">{u.phone || '—'}</Text>
                                                            </Flex>
                                                            <Flex align="center" gap={1}>
                                                                <Icon as={FiMail} w={3} h={3} color="blue.400" />
                                                                <Text fontSize="xs" color="gray.500" noOfLines={1} maxW="160px">{u.email || '—'}</Text>
                                                            </Flex>
                                                        </Stack>
                                                    </Td>
                                                    <Td py={3}>
                                                        <Flex align="center" gap={1}>
                                                            <Icon as={FiBriefcase} w={3} h={3} color="orange.400" />
                                                            <Text fontSize="xs" fontWeight="600" color="gray.700" noOfLines={1} maxW="140px">
                                                                {u.companyName || '—'}
                                                            </Text>
                                                        </Flex>
                                                    </Td>
                                                    <Td py={3}>
                                                        {u.gstNumber ? (
                                                            <Tag size="sm" colorScheme="green" borderRadius="full">
                                                                <TagLabel fontSize="10px" fontWeight="700">{u.gstNumber}</TagLabel>
                                                            </Tag>
                                                        ) : (
                                                            <Text fontSize="xs" color="gray.400">—</Text>
                                                        )}
                                                    </Td>
                                                    <Td py={3}>
                                                        <Text fontSize="xs" color="gray.600" noOfLines={2} maxW="150px" title={u.address}>
                                                            {u.address || '—'}
                                                        </Text>
                                                    </Td>
                                                    <Td py={3}>
                                                        <Flex align="center" gap={1}>
                                                            <Icon as={FiCalendar} w={3} h={3} color="gray.400" />
                                                            <Text fontSize="xs" color="gray.500">{formatDate(u.createdAt)}</Text>
                                                        </Flex>
                                                    </Td>
                                                    {(user?.isSuperAdmin || canWriteUsers) && (
                                                        <Td py={3} textAlign="center">
                                                            <HStack spacing={1} justify="center">
                                                                <Tooltip label="Edit User Details (✏️)" placement="top">
                                                                    <IconButton
                                                                        icon={<Icon as={FiEdit2} />}
                                                                        size="sm"
                                                                        colorScheme="blue"
                                                                        variant="ghost"
                                                                        borderRadius="lg"
                                                                        _hover={{ bg: 'blue.50', color: 'blue.600' }}
                                                                        onClick={() => handleOpenEditUser(u)}
                                                                        aria-label="Edit User"
                                                                    />
                                                                </Tooltip>
                                                                {user?.isSuperAdmin && (
                                                                    <Tooltip label="Remove Client Account" placement="top">
                                                                        <IconButton
                                                                            icon={<Icon as={FiTrash2} />}
                                                                            size="sm"
                                                                            colorScheme="red"
                                                                            variant="ghost"
                                                                            borderRadius="lg"
                                                                            _hover={{ bg: 'red.50', color: 'red.600' }}
                                                                            onClick={() => confirmDeleteAccount(u, 'users')}
                                                                            aria-label="Delete User"
                                                                        />
                                                                    </Tooltip>
                                                                )}
                                                            </HStack>
                                                        </Td>
                                                    )}
                                                </Tr>
                                            ))}
                                        </Tbody>
                                    </Table>
                                </Box>
                            )}
                            </>
                            )}
                        </TabPanel>
                    </TabPanels>
                </Tabs>
            </MotionBox>

            {/* Personal Login & Attendance Report (Rendered below inside Dashboard at last) */}
            {user?.isAdmin && (
                <AdminPersonalLoginReport user={user} />
            )}

            {/* Delete Account Pop-up Confirmation (AlertDialog) */}
            <AlertDialog
                isOpen={deleteAccountModal.isOpen}
                leastDestructiveRef={cancelRef}
                onClose={() => setDeleteAccountModal({ isOpen: false, user: null, type: '' })}
                isCentered
            >
                <AlertDialogOverlay backdropFilter="blur(4px)" bg="blackAlpha.600">
                    <AlertDialogContent borderRadius="2xl" p={2} boxShadow="2xl">
                        <AlertDialogHeader fontSize="lg" fontWeight="800" color="red.600" display="flex" alignItems="center" gap={2}>
                            <Icon as={FiTrash2} w={6} h={6} />
                            Remove {deleteAccountModal.type === 'admins' ? 'Admin' : 'User'} Account?
                        </AlertDialogHeader>

                        <AlertDialogBody fontSize="sm" color="gray.600" py={4}>
                            Are you sure you want to permanently remove the account for{' '}
                            <Text as="span" fontWeight="800" color="gray.800">
                                {deleteAccountModal.user?.name || deleteAccountModal.user?.contactPersonName || deleteAccountModal.user?.companyName || deleteAccountModal.user?.email}
                            </Text>?
                            <Text mt={3} p={3} bg="red.50" borderRadius="xl" color="red.700" fontSize="xs" fontWeight="700" border="1px solid" borderColor="red.100">
                                ⚠️ This action cannot be undone. All access privileges associated with this account will be immediately revoked.
                            </Text>
                        </AlertDialogBody>

                        <AlertDialogFooter gap={3} pt={2}>
                            <Button ref={cancelRef} onClick={() => setDeleteAccountModal({ isOpen: false, user: null, type: '' })} borderRadius="xl" size="sm" px={5} fontWeight="600" variant="outline">
                                Cancel
                            </Button>
                            <Button
                                colorScheme="red"
                                onClick={handleDeleteAccount}
                                isLoading={isDeleting}
                                loadingText="Removing..."
                                borderRadius="xl"
                                size="sm"
                                px={6}
                                fontWeight="700"
                                boxShadow="sm"
                            >
                                Yes, Remove Account
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>

            {/* Edit Admin Modal */}
            <Modal
                isOpen={editAdminModal.isOpen}
                onClose={() => setEditAdminModal({ isOpen: false, admin: null })}
                isCentered
                size="md"
            >
                <ModalOverlay backdropFilter="blur(4px)" bg="blackAlpha.600" />
                <ModalContent borderRadius="2xl" p={2} boxShadow="2xl">
                    <ModalHeader display="flex" alignItems="center" gap={3} pb={2}>
                        <Box p={2.5} bg="purple.100" borderRadius="xl">
                            <Icon as={FiEdit2} color="purple.600" w={5} h={5} />
                        </Box>
                        <Box>
                            <Heading fontSize="lg" fontWeight="800" color="purple.700">Update Admin User</Heading>
                            <Text fontSize="xs" color="gray.500" fontWeight="normal">Edit details and role privileges for this administrator.</Text>
                        </Box>
                    </ModalHeader>
                    <ModalCloseButton mt={3} mr={3} borderRadius="full" />

                    <ModalBody py={4}>
                        <Stack spacing={4}>
                            <FormControl isRequired>
                                <FormLabel fontSize="sm" fontWeight="700">Full Name</FormLabel>
                                <Input
                                    placeholder="Full Name"
                                    value={editForm.name}
                                    onChange={(e) => setEditForm(p => ({ ...p, name: e.target.value }))}
                                    borderRadius="lg"
                                    focusBorderColor="purple.500"
                                />
                            </FormControl>

                            <FormControl isRequired>
                                <FormLabel fontSize="sm" fontWeight="700">Email Address</FormLabel>
                                <Input
                                    type="email"
                                    placeholder="admin@company.com"
                                    value={editForm.email}
                                    onChange={(e) => setEditForm(p => ({ ...p, email: e.target.value }))}
                                    borderRadius="lg"
                                    focusBorderColor="purple.500"
                                />
                            </FormControl>

                            <FormControl isRequired>
                                <FormLabel fontSize="sm" fontWeight="700">Phone Number</FormLabel>
                                <Input
                                    placeholder="9876543210"
                                    value={editForm.phone}
                                    onChange={(e) => setEditForm(p => ({ ...p, phone: e.target.value.replace(/\D/g, '') }))}
                                    maxLength={10}
                                    borderRadius="lg"
                                    focusBorderColor="purple.500"
                                />
                            </FormControl>

                            <FormControl
                                display="flex"
                                alignItems="center"
                                justifyContent="space-between"
                                p={3.5}
                                bg={editForm.isSuperAdmin ? "purple.50" : "gray.50"}
                                borderRadius="xl"
                                border="1px solid"
                                borderColor={editForm.isSuperAdmin ? "purple.200" : "gray.200"}
                                transition="all 0.2s"
                            >
                                <Box>
                                    <FormLabel htmlFor="edit-superadmin-toggle" mb="0" fontSize="sm" fontWeight="700" color={editForm.isSuperAdmin ? "purple.800" : "gray.700"} display="flex" alignItems="center" gap={1.5} cursor="pointer">
                                        <Icon as={RiVipCrownFill} color={editForm.isSuperAdmin ? "orange.500" : "gray.400"} />
                                        Super Admin Privileges
                                    </FormLabel>
                                    <Text fontSize="xs" color="gray.500">
                                        {editForm.isSuperAdmin ? 'Full administrative rights and account management.' : 'Standard sub-admin rights.'}
                                    </Text>
                                </Box>
                                <Switch
                                    id="edit-superadmin-toggle"
                                    colorScheme="purple"
                                    size="lg"
                                    isChecked={!!editForm.isSuperAdmin}
                                    onChange={(e) => setEditForm(p => ({ ...p, isSuperAdmin: e.target.checked }))}
                                />
                            </FormControl>
                        </Stack>
                        {/* Google Contact Sync Result */}
                        {whatsappAckModal.googleContactResult && (
                            <Box mt={3} p={3} bg={whatsappAckModal.googleContactResult.success ? (whatsappAckModal.googleContactResult.added ? 'green.50' : 'blue.50') : 'orange.50'} borderRadius="xl" border="1px solid" borderColor={whatsappAckModal.googleContactResult.success ? (whatsappAckModal.googleContactResult.added ? 'green.200' : 'blue.200') : 'orange.200'}>
                                <Text fontWeight="700" fontSize="sm" color={whatsappAckModal.googleContactResult.success ? (whatsappAckModal.googleContactResult.added ? 'green.700' : 'blue.700') : 'orange.700'} mb={2}>
                                    {whatsappAckModal.googleContactResult.success
                                        ? (whatsappAckModal.googleContactResult.added ? '✅ Google Contact Created' : '📝 Google Contact Updated')
                                        : '⚠️ Google Contact Sync'}
                                </Text>
                                {whatsappAckModal.googleContactResult.fieldChanges?.addedFields?.length > 0 && (
                                    <Box mb={2}>
                                        <Text fontSize="xs" fontWeight="600" color="green.600" mb={1}>🆕 Newly Added:</Text>
                                        {whatsappAckModal.googleContactResult.fieldChanges.addedFields.map((f, i) => (
                                            <HStack key={i} spacing={2} mb={1} pl={2}>
                                                <Badge colorScheme="green" fontSize="xs">{f.field}</Badge>
                                                <Text fontSize="xs" color="gray.600">{f.value}</Text>
                                            </HStack>
                                        ))}
                                    </Box>
                                )}
                                {whatsappAckModal.googleContactResult.fieldChanges?.updatedFields?.length > 0 && (
                                    <Box>
                                        <Text fontSize="xs" fontWeight="600" color="blue.600" mb={1}>✏️ Updated Fields:</Text>
                                        {whatsappAckModal.googleContactResult.fieldChanges.updatedFields.map((f, i) => (
                                            <Box key={i} pl={2} mb={1}>
                                                <Badge colorScheme="blue" fontSize="xs">{f.field}</Badge>
                                                <HStack spacing={1} fontSize="xs" mt={0.5}>
                                                    <Text color="red.400" textDecoration="line-through">{f.before}</Text>
                                                    <Text color="gray.400">→</Text>
                                                    <Text color="green.600" fontWeight="600">{f.after}</Text>
                                                </HStack>
                                            </Box>
                                        ))}
                                    </Box>
                                )}
                                {whatsappAckModal.googleContactResult.success &&
                                 !whatsappAckModal.googleContactResult.fieldChanges?.addedFields?.length &&
                                 !whatsappAckModal.googleContactResult.fieldChanges?.updatedFields?.length && (
                                    <Text fontSize="xs" color="gray.500">All fields already up to date.</Text>
                                )}
                                {!whatsappAckModal.googleContactResult.success && (whatsappAckModal.googleContactResult.error || whatsappAckModal.googleContactResult.reason) && (
                                    <Text fontSize="xs" color="orange.600">{whatsappAckModal.googleContactResult.error || whatsappAckModal.googleContactResult.reason}</Text>
                                )}
                            </Box>
                        )}
                    </ModalBody>

                    <ModalFooter gap={3} pt={2}>
                        <Button
                            variant="outline"
                            borderRadius="xl"
                            size="md"
                            px={5}
                            fontWeight="600"
                            onClick={() => setEditAdminModal({ isOpen: false, admin: null })}
                        >
                            Cancel
                        </Button>
                        <Button
                            colorScheme="purple"
                            borderRadius="xl"
                            size="md"
                            px={6}
                            fontWeight="700"
                            isLoading={editLoading}
                            loadingText="Updating..."
                            onClick={handleUpdateAdmin}
                            boxShadow="md"
                        >
                            Save Changes
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* Edit User Modal */}
            <Modal
                isOpen={editUserModal.isOpen}
                onClose={() => setEditUserModal({ isOpen: false, user: null })}
                isCentered
                size="lg"
            >
                <ModalOverlay backdropFilter="blur(5px)" bg="blackAlpha.600" />
                <ModalContent borderRadius="2xl" p={2} boxShadow="2xl">
                    <ModalHeader display="flex" alignItems="center" gap={3} pb={2}>
                        <Box p={2.5} bg="blue.100" borderRadius="xl">
                            <Icon as={FiEdit2} color="blue.600" w={5} h={5} />
                        </Box>
                        <Box>
                            <Heading fontSize="lg" fontWeight="800" color="blue.700">Update User Details</Heading>
                            <Text fontSize="xs" color="gray.500" fontWeight="normal">Edit client information and automatically sync to Google Contacts.</Text>
                        </Box>
                    </ModalHeader>
                    <ModalCloseButton mt={3} mr={3} borderRadius="full" />

                    <ModalBody py={4}>
                        <Stack spacing={4}>
                            <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4}>
                                <FormControl isRequired>
                                    <FormLabel fontSize="xs" fontWeight="700" color="gray.600">Contact Person Name</FormLabel>
                                    <InputGroup size="md">
                                        <InputLeftElement pointerEvents="none">
                                            <Icon as={FiUser} color="gray.400" />
                                        </InputLeftElement>
                                        <Input
                                            placeholder="Contact Person"
                                            value={editUserForm.contactPersonName}
                                            onChange={(e) => setEditUserForm(p => ({ ...p, contactPersonName: e.target.value }))}
                                            borderRadius="lg"
                                            focusBorderColor="blue.500"
                                        />
                                    </InputGroup>
                                </FormControl>

                                <FormControl>
                                    <FormLabel fontSize="xs" fontWeight="700" color="gray.600">Company Name</FormLabel>
                                    <InputGroup size="md">
                                        <InputLeftElement pointerEvents="none">
                                            <Icon as={FiBriefcase} color="gray.400" />
                                        </InputLeftElement>
                                        <Input
                                            placeholder="e.g. Acme Industries"
                                            value={editUserForm.companyName}
                                            onChange={(e) => setEditUserForm(p => ({ ...p, companyName: e.target.value }))}
                                            borderRadius="lg"
                                            focusBorderColor="blue.500"
                                        />
                                    </InputGroup>
                                </FormControl>
                            </SimpleGrid>

                            <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4}>
                                <FormControl isRequired>
                                    <FormLabel fontSize="xs" fontWeight="700" color="gray.600">Phone Number</FormLabel>
                                    <InputGroup size="md">
                                        <InputLeftElement pointerEvents="none">
                                            <Icon as={FiPhone} color="gray.400" />
                                        </InputLeftElement>
                                        <Input
                                            placeholder="9876543210"
                                            value={editUserForm.phone}
                                            onChange={(e) => setEditUserForm(p => ({ ...p, phone: e.target.value.replace(/\D/g, '') }))}
                                            maxLength={10}
                                            borderRadius="lg"
                                            focusBorderColor="blue.500"
                                        />
                                    </InputGroup>
                                </FormControl>

                                <FormControl>
                                    <FormLabel fontSize="xs" fontWeight="700" color="gray.600">Email Address</FormLabel>
                                    <InputGroup size="md">
                                        <InputLeftElement pointerEvents="none">
                                            <Icon as={FiMail} color="gray.400" />
                                        </InputLeftElement>
                                        <Input
                                            type="email"
                                            placeholder="client@company.com"
                                            value={editUserForm.email}
                                            onChange={(e) => setEditUserForm(p => ({ ...p, email: e.target.value }))}
                                            borderRadius="lg"
                                            focusBorderColor="blue.500"
                                        />
                                    </InputGroup>
                                </FormControl>
                            </SimpleGrid>

                            <FormControl>
                                <FormLabel fontSize="xs" fontWeight="700" color="gray.600">GST Number</FormLabel>
                                <Input
                                    placeholder="e.g. 24AAAAA0000A1Z5"
                                    value={editUserForm.gstNumber}
                                    onChange={(e) => setEditUserForm(p => ({ ...p, gstNumber: e.target.value.toUpperCase() }))}
                                    borderRadius="lg"
                                    focusBorderColor="blue.500"
                                    maxLength={15}
                                />
                            </FormControl>

                            <FormControl>
                                <FormLabel fontSize="xs" fontWeight="700" color="gray.600">Client Address</FormLabel>
                                <Textarea
                                    placeholder="Full billing or office address..."
                                    value={editUserForm.address}
                                    onChange={(e) => setEditUserForm(p => ({ ...p, address: e.target.value }))}
                                    borderRadius="lg"
                                    focusBorderColor="blue.500"
                                    rows={3}
                                    fontSize="sm"
                                />
                            </FormControl>
                        </Stack>
                    </ModalBody>

                    <ModalFooter gap={3} pt={2}>
                        <Button
                            variant="outline"
                            borderRadius="xl"
                            size="md"
                            px={5}
                            fontWeight="600"
                            onClick={() => setEditUserModal({ isOpen: false, user: null })}
                        >
                            Cancel
                        </Button>
                        <Button
                            colorScheme="blue"
                            borderRadius="xl"
                            size="md"
                            px={6}
                            fontWeight="700"
                            isLoading={editUserLoading}
                            loadingText="Updating..."
                            onClick={handleUpdateUser}
                            boxShadow="md"
                            leftIcon={<Icon as={FiEdit2} />}
                        >
                            Update User
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* ── ADD NEW CATALOG MODAL ── */}
            <Modal isOpen={isAddCatalogOpen} onClose={() => setIsAddCatalogOpen(false)} isCentered size="lg">
                <ModalOverlay backdropFilter="blur(5px)" bg="blackAlpha.600" />
                <ModalContent borderRadius="2xl" p={2} boxShadow="2xl">
                    <ModalHeader display="flex" alignItems="center" gap={3} pb={2}>
                        <Box p={2.5} bg="teal.100" borderRadius="xl">
                            <Icon as={FiUploadCloud} color="teal.600" w={5} h={5} />
                        </Box>
                        <Box>
                            <Heading fontSize="lg" fontWeight="800" color="teal.700">Upload New Catalog</Heading>
                            <Text fontSize="xs" color="gray.500" fontWeight="normal">Add PDF brochures or product catalog images to share with clients.</Text>
                        </Box>
                    </ModalHeader>
                    <ModalCloseButton mt={3} mr={3} borderRadius="full" />

                    <ModalBody py={4}>
                        <Stack spacing={4}>
                            <FormControl isRequired>
                                <FormLabel fontSize="xs" fontWeight="700" color="gray.600">Catalog Title (Capital Letters)</FormLabel>
                                <Input
                                    placeholder="E.G. CIVIL ENGINEERING LAB INSTRUMENTS"
                                    value={catalogForm.title}
                                    onChange={e => setCatalogForm({ ...catalogForm, title: e.target.value.toUpperCase() })}
                                    textTransform="uppercase"
                                    borderRadius="lg"
                                    focusBorderColor="teal.500"
                                    fontWeight="600"
                                />
                            </FormControl>

                            <FormControl>
                                <FormLabel fontSize="xs" fontWeight="700" color="gray.600">Description / Highlights</FormLabel>
                                <Textarea
                                    rows={2}
                                    placeholder="Brief summary of instruments included in this catalog..."
                                    value={catalogForm.description}
                                    onChange={e => setCatalogForm({ ...catalogForm, description: e.target.value })}
                                    borderRadius="lg"
                                    focusBorderColor="teal.500"
                                    fontSize="sm"
                                />
                            </FormControl>

                            <FormControl isRequired>
                                <FormLabel fontSize="xs" fontWeight="700" color="gray.600">Catalog File (PDF, JPG, JPEG, PNG)</FormLabel>
                                <Box
                                    border="2px dashed"
                                    borderColor={catalogForm.file ? "teal.400" : "gray.300"}
                                    bg={catalogForm.file ? "teal.50/30" : "gray.50"}
                                    p={6}
                                    borderRadius="xl"
                                    textAlign="center"
                                    cursor="pointer"
                                    position="relative"
                                    _hover={{ borderColor: "teal.400" }}
                                >
                                    <Input
                                        type="file"
                                        accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"
                                        position="absolute"
                                        top={0}
                                        left={0}
                                        w="full"
                                        h="full"
                                        opacity={0}
                                        cursor="pointer"
                                        onChange={e => {
                                            if (e.target.files?.[0]) {
                                                setCatalogForm(p => ({ ...p, file: e.target.files[0] }));
                                            }
                                        }}
                                    />
                                    {catalogForm.file ? (
                                        <VStack spacing={1}>
                                            <Icon as={FiCheckCircle} color="teal.500" w={8} h={8} />
                                            <Text fontWeight="700" fontSize="sm" color="gray.700">{catalogForm.file.name}</Text>
                                            <Text fontSize="xs" color="gray.500">{(catalogForm.file.size / (1024 * 1024)).toFixed(2)} MB</Text>
                                        </VStack>
                                    ) : (
                                        <VStack spacing={1}>
                                            <Icon as={FiUploadCloud} color="gray.400" w={8} h={8} />
                                            <Text fontWeight="600" fontSize="sm" color="gray.700">Click or Drag & Drop File</Text>
                                            <Text fontSize="xs" color="gray.400">PDF, JPG, PNG, DOC up to 50MB</Text>
                                        </VStack>
                                    )}
                                </Box>
                            </FormControl>
                        </Stack>
                    </ModalBody>

                    <ModalFooter gap={3} pt={2}>
                        <Button variant="outline" borderRadius="xl" onClick={() => setIsAddCatalogOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            colorScheme="teal"
                            borderRadius="xl"
                            isLoading={isUploadingCatalog}
                            loadingText="Uploading..."
                            onClick={handleUploadCatalog}
                            leftIcon={<FiUploadCloud />}
                        >
                            Upload Catalog
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* ── WHATSAPP CATALOG SHARE MODAL (WITH PHONE LOOKUP & GOOGLE CONTACTS SYNC) ── */}
            <Modal isOpen={isWhatsappCatalogOpen} onClose={() => setIsWhatsappCatalogOpen(false)} isCentered size="lg">
                <ModalOverlay backdropFilter="blur(5px)" bg="blackAlpha.600" />
                <ModalContent borderRadius="2xl" p={2} boxShadow="2xl">
                    <ModalHeader display="flex" alignItems="center" gap={3} pb={2}>
                        <Box p={2.5} bg="#25D366" borderRadius="xl" color="white">
                            <FaWhatsapp size={22} />
                        </Box>
                        <Box>
                            <Heading fontSize="lg" fontWeight="800" color="gray.800">Send Catalog via WhatsApp</Heading>
                            <Text fontSize="xs" color="gray.500" fontWeight="normal">
                                Enter 10-digit number to auto-fill client details & sync automatically to Google Contacts.
                            </Text>
                        </Box>
                    </ModalHeader>
                    <ModalCloseButton mt={3} mr={3} borderRadius="full" />

                    <ModalBody py={4}>
                        <Stack spacing={4}>
                            {/* Selected Catalogs Banner */}
                            <Box p={3} bg="gray.50" borderRadius="xl" border="1px solid" borderColor="gray.100">
                                <Text fontSize="xs" fontWeight="700" color="gray.600" mb={1}>
                                    Sharing {whatsappCatalogTarget.length} Catalog(s):
                                </Text>
                                <HStack spacing={2} wrap="wrap">
                                    {whatsappCatalogTarget.map((c, i) => (
                                        <Badge key={i} colorScheme="teal" borderRadius="md" px={2} py={1} fontSize="xs">
                                            📖 {c.title}
                                        </Badge>
                                    ))}
                                </HStack>
                            </Box>

                            {/* Phone Input with Auto-Fill Trigger */}
                            <FormControl isRequired>
                                <FormLabel fontSize="xs" fontWeight="700" color="gray.700">Mobile Number (10 Digits)</FormLabel>
                                <InputGroup size="md">
                                    <InputLeftElement pointerEvents="none">
                                        <Text fontSize="sm" fontWeight="700" color="gray.400">+91</Text>
                                    </InputLeftElement>
                                    <Input
                                        type="tel"
                                        placeholder="9876543210"
                                        maxLength={10}
                                        value={whatsappClientForm.phone}
                                        onChange={handleWhatsappPhoneChange}
                                        borderRadius="lg"
                                        focusBorderColor="#25D366"
                                        fontWeight="700"
                                        letterSpacing="wide"
                                    />
                                    {isFetchingClient && (
                                        <InputRightElement>
                                            <Spinner size="sm" color="green.500" />
                                        </InputRightElement>
                                    )}
                                    {clientAutoFilled && (
                                        <InputRightElement>
                                            <Icon as={FiCheckCircle} color="green.500" w={5} h={5} />
                                        </InputRightElement>
                                    )}
                                </InputGroup>
                                {clientAutoFilled && (
                                    <Text fontSize="2xs" color="green.600" fontWeight="600" mt={1}>
                                        ✓ Existing client found! Details have been automatically populated.
                                    </Text>
                                )}
                            </FormControl>

                            {/* Auto-filled / Editable Client Details */}
                            <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4}>
                                <FormControl>
                                    <FormLabel fontSize="xs" fontWeight="700" color="gray.600">Company Name</FormLabel>
                                    <InputGroup size="md">
                                        <InputLeftElement pointerEvents="none">
                                            <Icon as={FiBriefcase} color="gray.400" />
                                        </InputLeftElement>
                                        <Input
                                            placeholder="e.g. ABC Construction Ltd"
                                            value={whatsappClientForm.companyName}
                                            onChange={e => setWhatsappClientForm({ ...whatsappClientForm, companyName: e.target.value })}
                                            borderRadius="lg"
                                            focusBorderColor="#25D366"
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
                                            value={whatsappClientForm.contactPersonName}
                                            onChange={e => setWhatsappClientForm({ ...whatsappClientForm, contactPersonName: e.target.value })}
                                            borderRadius="lg"
                                            focusBorderColor="#25D366"
                                        />
                                    </InputGroup>
                                </FormControl>
                            </SimpleGrid>

                            <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4}>
                                <FormControl>
                                    <FormLabel fontSize="xs" fontWeight="700" color="gray.600">Email Address (Optional)</FormLabel>
                                    <InputGroup size="md">
                                        <InputLeftElement pointerEvents="none">
                                            <Icon as={FiMail} color="gray.400" />
                                        </InputLeftElement>
                                        <Input
                                            type="email"
                                            placeholder="client@gmail.com"
                                            value={whatsappClientForm.email}
                                            onChange={e => setWhatsappClientForm({ ...whatsappClientForm, email: e.target.value })}
                                            borderRadius="lg"
                                            focusBorderColor="#25D366"
                                        />
                                    </InputGroup>
                                </FormControl>

                                <FormControl>
                                    <FormLabel fontSize="xs" fontWeight="700" color="gray.600">GST Number (Optional)</FormLabel>
                                    <Input
                                        placeholder="24AAAAA0000A1Z5"
                                        value={whatsappClientForm.gstNumber}
                                        onChange={e => setWhatsappClientForm({ ...whatsappClientForm, gstNumber: e.target.value.toUpperCase() })}
                                        borderRadius="lg"
                                        focusBorderColor="#25D366"
                                        maxLength={15}
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
                                        value={whatsappClientForm.address}
                                        onChange={e => setWhatsappClientForm({ ...whatsappClientForm, address: e.target.value })}
                                        borderRadius="lg"
                                        focusBorderColor="#25D366"
                                    />
                                </InputGroup>
                            </FormControl>

                            <FormControl>
                                <FormLabel fontSize="xs" fontWeight="700" color="gray.600">Custom WhatsApp Greeting Note (Optional)</FormLabel>
                                <Textarea
                                    rows={2}
                                    placeholder="Add any special note (or leave blank for standard professional message)..."
                                    value={whatsappClientForm.customMessage}
                                    onChange={e => setWhatsappClientForm({ ...whatsappClientForm, customMessage: e.target.value })}
                                    borderRadius="lg"
                                    focusBorderColor="#25D366"
                                    fontSize="sm"
                                />
                            </FormControl>

                            <Box p={3} bg="green.50" borderRadius="xl" border="1px solid" borderColor="green.200">
                                <HStack spacing={2.5} align="start">
                                    <Icon as={FiCheckCircle} color="green.600" w={4} h={4} mt={0.5} />
                                    <Box>
                                        <Text fontSize="xs" color="green.800" fontWeight="700">
                                            Safe Google Contacts Sync (Duplicate Protection)
                                        </Text>
                                        <Text fontSize="2xs" color="green.700" mt={0.5}>
                                            If this client already exists in Google Contacts, their details are safely updated — NO duplicate contact will ever be created.
                                        </Text>
                                    </Box>
                                </HStack>
                            </Box>
                        </Stack>
                    </ModalBody>

                    <ModalFooter gap={3} pt={2}>
                        <Button variant="outline" borderRadius="xl" onClick={() => setIsWhatsappCatalogOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            bg="#25D366"
                            color="white"
                            _hover={{ bg: "#128C7E" }}
                            _active={{ bg: "#075E54" }}
                            borderRadius="xl"
                            isLoading={isWhatsappSending}
                            loadingText="Sending WhatsApp..."
                            onClick={handleSendCatalogWhatsapp}
                            leftIcon={<FaWhatsapp size={18} />}
                            boxShadow="0 4px 12px rgba(37, 211, 102, 0.4)"
                            fontWeight="700"
                        >
                            Send Catalog Now
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* ── WHATSAPP SEND ACKNOWLEDGEMENT / CONFIRMATION MODAL ── */}
            <Modal isOpen={whatsappAckModal.isOpen} onClose={() => setWhatsappAckModal(p => ({ ...p, isOpen: false }))} isCentered size="md">
                <ModalOverlay backdropFilter="blur(5px)" bg="blackAlpha.600" />
                <ModalContent borderRadius="2xl" p={2} boxShadow="2xl">
                    <ModalHeader display="flex" alignItems="center" gap={3} pb={2}>
                        <Box p={2.5} bg={whatsappAckModal.whatsappSent === false ? 'orange.100' : 'green.100'} borderRadius="xl">
                            <Icon as={whatsappAckModal.whatsappSent === false ? FiAlertCircle : FiCheckCircle} color={whatsappAckModal.whatsappSent === false ? 'orange.600' : 'green.600'} w={6} h={6} />
                        </Box>
                        <Box>
                            <Heading fontSize="lg" fontWeight="800" color={whatsappAckModal.whatsappSent === false ? 'orange.700' : 'green.700'}>
                                {whatsappAckModal.whatsappSent === false ? 'Catalog Processed (WhatsApp Not Sent)' : 'Catalog Sent Successfully!'}
                            </Heading>
                            <Text fontSize="xs" color="gray.500" fontWeight="normal">
                                {whatsappAckModal.whatsappSent === false ? 'WhatsApp dispatch failed, but client synced to Google Contacts.' : 'Dispatched via WhatsApp & synced to Google Contacts.'}
                            </Text>
                        </Box>
                    </ModalHeader>
                    <ModalCloseButton mt={3} mr={3} borderRadius="full" />

                    <ModalBody py={4}>
                        <Stack spacing={3}>
                            {whatsappAckModal.whatsappSent === false && (
                                <Box p={3} bg="orange.50" borderRadius="xl" border="1px solid" borderColor="orange.200">
                                    <HStack spacing={2} align="start">
                                        <Icon as={FiAlertCircle} color="orange.600" mt={0.5} />
                                        <Box fontSize="xs">
                                            <Text fontWeight="700" color="orange.800">WhatsApp Delivery Notice:</Text>
                                            <Text color="orange.700" fontSize="2xs" mt={0.5}>
                                                {whatsappAckModal.whatsappError || 'WhatsApp message could not be sent (connection timeout / session unlinked).'}
                                            </Text>
                                        </Box>
                                    </HStack>
                                </Box>
                            )}

                            <Box p={3.5} bg="gray.50" borderRadius="xl" border="1px solid" borderColor="gray.200">
                                <SimpleGrid columns={2} spacing={2} fontSize="xs">
                                    <Box>
                                        <Text color="gray.500" fontWeight="600">Client Phone:</Text>
                                        <Text fontWeight="800" color="gray.800" fontSize="sm">+91 {whatsappAckModal.phone}</Text>
                                    </Box>
                                    <Box>
                                        <Text color="gray.500" fontWeight="600">Dispatched At:</Text>
                                        <Text fontWeight="700" color="gray.700">{whatsappAckModal.time}</Text>
                                    </Box>
                                    {(whatsappAckModal.clientName || whatsappAckModal.companyName) && (
                                        <Box gridColumn="span 2" mt={1}>
                                            <Text color="gray.500" fontWeight="600">Client Name / Company:</Text>
                                            <Text fontWeight="700" color="gray.800">{[whatsappAckModal.clientName, whatsappAckModal.companyName].filter(Boolean).join(' • ')}</Text>
                                        </Box>
                                    )}
                                </SimpleGrid>
                            </Box>

                            <Box>
                                <Text fontSize="xs" fontWeight="700" color="gray.600" mb={1.5}>
                                    Sent Catalogs ({whatsappAckModal.catalogs.length}):
                                </Text>
                                <Stack spacing={1.5}>
                                    {whatsappAckModal.catalogs.map((title, idx) => (
                                        <Flex key={idx} align="center" gap={2} p={2} bg="teal.50" borderRadius="lg" border="1px solid" borderColor="teal.100">
                                            <Icon as={FiCheck} color="teal.600" />
                                            <Text fontSize="xs" fontWeight="700" color="teal.900">{title}</Text>
                                        </Flex>
                                    ))}
                                </Stack>
                            </Box>

                            {/* ── GOOGLE CONTACTS SYNC RESULT BREAKDOWN ── */}
                            {whatsappAckModal.googleContactResult && (
                                <Box p={3.5} bg="blue.50" borderRadius="xl" border="1px solid" borderColor="blue.200">
                                    <Flex justify="space-between" align="center" mb={2}>
                                        <Text fontWeight="700" color="blue.800" fontSize="xs">
                                            Google Contacts Sync Details
                                        </Text>
                                        <Badge 
                                            colorScheme={whatsappAckModal.googleContactResult.added ? 'green' : (whatsappAckModal.googleContactResult.updated ? 'blue' : 'gray')} 
                                            fontSize="2xs" 
                                            borderRadius="full" 
                                            px={2}
                                        >
                                            {whatsappAckModal.googleContactResult.added ? '🆕 New Contact Created' : (whatsappAckModal.googleContactResult.updated ? '🔄 Contact Details Updated' : 'Synced')}
                                        </Badge>
                                    </Flex>

                                    {whatsappAckModal.googleContactResult.contactName && (
                                        <Text fontSize="xs" fontWeight="700" color="gray.800" mb={2}>
                                            Contact: <Text as="span" color="blue.700">{whatsappAckModal.googleContactResult.contactName}</Text>
                                        </Text>
                                    )}

                                    {whatsappAckModal.googleContactResult.fieldChanges && (
                                        <>
                                            {whatsappAckModal.googleContactResult.fieldChanges.addedFields?.length > 0 && (
                                                <Box mb={2}>
                                                    <Text fontWeight="700" color="green.700" fontSize="2xs" mb={1}>🆕 Newly Added Fields:</Text>
                                                    {whatsappAckModal.googleContactResult.fieldChanges.addedFields.map((f, i) => (
                                                        <HStack key={i} spacing={2} mb={1} pl={1}>
                                                            <Badge colorScheme="green" fontSize="2xs">{f.field}</Badge>
                                                            <Text fontSize="2xs" color="gray.700">{f.value}</Text>
                                                        </HStack>
                                                    ))}
                                                </Box>
                                            )}

                                            {whatsappAckModal.googleContactResult.fieldChanges.updatedFields?.length > 0 && (
                                                <Box mb={2}>
                                                    <Text fontWeight="700" color="blue.700" fontSize="2xs" mb={1}>✏️ Overwritten / Updated Fields:</Text>
                                                    {whatsappAckModal.googleContactResult.fieldChanges.updatedFields.map((f, i) => (
                                                        <Box key={i} mb={1.5} pl={1}>
                                                            <Badge colorScheme="blue" fontSize="2xs" mb={0.5}>{f.field}</Badge>
                                                            <HStack spacing={1} fontSize="2xs">
                                                                <Text color="red.500" textDecoration="line-through">{f.before}</Text>
                                                                <Text color="gray.400">→</Text>
                                                                <Text color="green.600" fontWeight="700">{f.after}</Text>
                                                            </HStack>
                                                        </Box>
                                                    ))}
                                                </Box>
                                            )}

                                            {(!whatsappAckModal.googleContactResult.fieldChanges.addedFields || whatsappAckModal.googleContactResult.fieldChanges.addedFields.length === 0) &&
                                             (!whatsappAckModal.googleContactResult.fieldChanges.updatedFields || whatsappAckModal.googleContactResult.fieldChanges.updatedFields.length === 0) &&
                                             whatsappAckModal.googleContactResult.success && (
                                                <Text color="gray.600" fontSize="2xs">✅ Existing contact found — all fields already up to date (0 duplicates created).</Text>
                                            )}
                                        </>
                                    )}
                                </Box>
                            )}

                            <Box p={3} bg="green.50" borderRadius="xl" border="1px solid" borderColor="green.200">
                                <HStack spacing={2} align="start">
                                    <Icon as={FiCheckCircle} color="green.600" mt={0.5} />
                                    <Box fontSize="xs">
                                        <Text fontWeight="700" color="green.800">Verification & Phone Identity:</Text>
                                        <Text color="green.700" fontSize="2xs" mt={0.5}>
                                            • Phone number used as identity key (guaranteed no duplicate contact created).
                                        </Text>
                                        <Text color="green.700" fontSize="2xs">
                                            • Contact display name & ID formatted with EU- prefix.
                                        </Text>
                                    </Box>
                                </HStack>
                            </Box>
                        </Stack>
                    </ModalBody>

                    <ModalFooter pt={2}>
                        <Button
                            w="full"
                            colorScheme="green"
                            borderRadius="xl"
                            onClick={() => setWhatsappAckModal(p => ({ ...p, isOpen: false }))}
                            fontWeight="700"
                        >
                            Understood & Done
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* ── UPLOAD / REPLACE COMPANY STATUTORY DOCUMENT MODAL ── */}
            <Modal isOpen={isUploadDocModalOpen} onClose={() => setIsUploadDocModalOpen(false)} isCentered size="md">
                <ModalOverlay backdropFilter="blur(5px)" bg="blackAlpha.600" />
                <ModalContent borderRadius="2xl" p={2} boxShadow="2xl">
                    <ModalHeader display="flex" alignItems="center" gap={3} pb={2}>
                        <Box p={2.5} bg="teal.100" borderRadius="xl">
                            <Icon as={FiUploadCloud} color="teal.600" w={5} h={5} />
                        </Box>
                        <Box>
                            <Heading fontSize="lg" fontWeight="800" color="teal.700">Upload Company Document</Heading>
                            <Text fontSize="xs" color="gray.500" fontWeight="normal">Attach statutory PDF or image certificates to your company record.</Text>
                        </Box>
                    </ModalHeader>
                    <ModalCloseButton mt={3} mr={3} borderRadius="full" />

                    <form onSubmit={handleUploadCompanyDoc}>
                        <ModalBody py={4}>
                            <Stack spacing={4}>
                                <FormControl isRequired>
                                    <FormLabel fontSize="xs" fontWeight="700" color="gray.600">Company</FormLabel>
                                    <Select
                                        value={uploadDocTarget.companyId}
                                        onChange={e => {
                                            const nextCompanyId = e.target.value;
                                            const nextComp = companies.find(c => c._id === nextCompanyId);
                                            const avail = getAvailableUploadDocTypes(nextComp, uploadDocTarget.docType, uploadDocTarget.isReplace);
                                            const nextDocType = avail.some(o => o.value === uploadDocTarget.docType)
                                                ? uploadDocTarget.docType
                                                : (avail[0]?.value || 'otherDoc');
                                            setUploadDocTarget(prev => ({
                                                ...prev,
                                                companyId: nextCompanyId,
                                                docType: nextDocType
                                            }));
                                        }}
                                        borderRadius="lg"
                                        focusBorderColor="teal.500"
                                        fontWeight="600"
                                    >
                                        {companies.map(c => (
                                            <option key={c._id} value={c._id}>
                                                {c.companyName}
                                            </option>
                                        ))}
                                    </Select>
                                </FormControl>

                                <FormControl isRequired>
                                    <FormLabel fontSize="xs" fontWeight="700" color="gray.600">
                                        Document Type {uploadDocTarget.isReplace && uploadDocTarget.docType !== 'otherDoc' ? '(Replacing Document)' : ''}
                                    </FormLabel>
                                    <Select
                                        value={uploadDocTarget.docType}
                                        onChange={e => setUploadDocTarget({ ...uploadDocTarget, docType: e.target.value })}
                                        borderRadius="lg"
                                        focusBorderColor="teal.500"
                                        fontWeight="600"
                                    >
                                        {getAvailableUploadDocTypes(
                                            companies.find(c => c._id === uploadDocTarget.companyId),
                                            uploadDocTarget.docType,
                                            uploadDocTarget.isReplace
                                        ).map(opt => (
                                            <option key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </option>
                                        ))}
                                    </Select>
                                </FormControl>

                                {uploadDocTarget.docType === 'otherDoc' && (
                                    <FormControl isRequired>
                                        <FormLabel fontSize="xs" fontWeight="700" color="gray.600">Document Title / Name</FormLabel>
                                        <Input
                                            placeholder="e.g. ISO 9001 Certificate, Certificate of Incorporation, Trade License, MSME"
                                            value={uploadDocTarget.otherDocTitle || ''}
                                            onChange={e => setUploadDocTarget({ ...uploadDocTarget, otherDocTitle: e.target.value })}
                                            borderRadius="lg"
                                            focusBorderColor="teal.500"
                                            size="sm"
                                            fontWeight="600"
                                        />
                                        <Text fontSize="2xs" color="gray.500" mt={1}>
                                            💡 You can upload multiple other documents for this company. Each upload adds another document to the list.
                                        </Text>
                                    </FormControl>
                                )}

                                <FormControl isRequired>
                                    <FormLabel fontSize="xs" fontWeight="700" color="gray.600">Select Document File</FormLabel>
                                    <Box
                                        border="2px dashed"
                                        borderColor={uploadDocTarget.file ? "teal.400" : "gray.300"}
                                        borderRadius="xl"
                                        p={4}
                                        textAlign="center"
                                        bg={uploadDocTarget.file ? "teal.50" : "gray.50"}
                                        cursor="pointer"
                                        _hover={{ borderColor: "teal.500", bg: "teal.50" }}
                                        onClick={() => document.getElementById('companyDocFileInput')?.click()}
                                    >
                                        <input
                                            id="companyDocFileInput"
                                            type="file"
                                            accept=".pdf,.jpg,.jpeg,.png,.webp,.svg,application/pdf,image/*"
                                            style={{ display: 'none' }}
                                            onChange={e => {
                                                const f = e.target.files[0];
                                                if (f) {
                                                    setUploadDocTarget(prev => ({
                                                        ...prev,
                                                        file: f,
                                                        previewUrl: f.type.startsWith('image/') ? URL.createObjectURL(f) : null
                                                    }));
                                                }
                                            }}
                                        />
                                        {uploadDocTarget.file ? (
                                            <VStack spacing={1}>
                                                <Icon as={FiCheckCircle} color="teal.500" w={8} h={8} />
                                                <Text fontSize="xs" fontWeight="700" color="teal.800" noOfLines={1}>
                                                    {uploadDocTarget.file.name}
                                                </Text>
                                                <Text fontSize="2xs" color="gray.500">
                                                    {(uploadDocTarget.file.size / (1024 * 1024)).toFixed(2)} MB • Click to change
                                                </Text>
                                            </VStack>
                                        ) : (
                                            <VStack spacing={1}>
                                                <Icon as={FiUploadCloud} color="gray.400" w={8} h={8} />
                                                <Text fontSize="xs" fontWeight="700" color="gray.600">
                                                    Click to Browse Document
                                                </Text>
                                                <Text fontSize="2xs" color="gray.400">
                                                    Accepts PDF, JPG, PNG, WEBP (Max 10MB)
                                                </Text>
                                            </VStack>
                                        )}
                                    </Box>
                                </FormControl>
                            </Stack>
                        </ModalBody>

                        <ModalFooter gap={3} pt={2}>
                            <Button
                                variant="outline"
                                borderRadius="xl"
                                onClick={() => setIsUploadDocModalOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                colorScheme="teal"
                                borderRadius="xl"
                                px={6}
                                fontWeight="700"
                                isLoading={isUploadingCompanyDoc}
                                loadingText="Uploading..."
                                leftIcon={<FiUploadCloud />}
                            >
                                Upload & Save
                            </Button>
                        </ModalFooter>
                    </form>
                </ModalContent>
            </Modal>

            {/* ── WHATSAPP COMPANY DOCUMENTS & CREDENTIALS SHARE MODAL ── */}
            <Modal isOpen={isWhatsappCompanyOpen} onClose={() => setIsWhatsappCompanyOpen(false)} isCentered size="lg">
                <ModalOverlay backdropFilter="blur(5px)" bg="blackAlpha.600" />
                <ModalContent borderRadius="2xl" p={2} boxShadow="2xl">
                    <ModalHeader display="flex" alignItems="center" gap={3} pb={2}>
                        <Box p={2.5} bg="#25D366" borderRadius="xl">
                            <Icon as={FaWhatsapp} color="white" w={6} h={6} />
                        </Box>
                        <Box>
                            <Heading fontSize="lg" fontWeight="800" color="gray.800">
                                Send Company Documents via WhatsApp
                            </Heading>
                            <Text fontSize="xs" color="gray.500" fontWeight="normal">
                                Enter 10-digit number to auto-fill client details & sync automatically to Google Contacts.
                            </Text>
                        </Box>
                    </ModalHeader>
                    <ModalCloseButton mt={3} mr={3} borderRadius="full" />

                    <ModalBody py={3}>
                        <Stack spacing={4}>
                            {/* Selected Company & Documents Badge Container */}
                            <Box p={3} bg="gray.50" borderRadius="xl" border="1px solid" borderColor="gray.200">
                                <Flex justify="space-between" align="center" mb={2}>
                                    <HStack spacing={1.5}>
                                        <Icon as={FaBuilding} color="teal.600" />
                                        <Text fontSize="xs" fontWeight="800" color="gray.800">
                                            {whatsappCompanyTarget?.company?.companyName}
                                        </Text>
                                    </HStack>
                                    <Badge colorScheme="teal" borderRadius="full" px={2} fontSize="2xs">
                                        {whatsappCompanyTarget?.docs?.length || 0} Document(s) Attached
                                    </Badge>
                                </Flex>
                                <HStack spacing={1.5} wrap="wrap">
                                    {whatsappCompanyTarget?.docs?.map((d, i) => (
                                        <Tag key={i} size="sm" colorScheme={d.url ? "teal" : "gray"} borderRadius="md">
                                            <TagLabel fontSize="2xs" fontWeight="700">
                                                {d.url ? '📎 ' : '📝 '}{d.title}
                                            </TagLabel>
                                        </Tag>
                                    ))}
                                </HStack>
                            </Box>

                            {/* Options to include Bank and Statutory Details */}
                            <Box p={3} bg="teal.50" borderRadius="xl" border="1px solid" borderColor="teal.100">
                                <Text fontSize="xs" fontWeight="700" color="teal.900" mb={2}>
                                    Include Credentials in WhatsApp Message:
                                </Text>
                                <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={2}>
                                    <Checkbox
                                        colorScheme="teal"
                                        isChecked={whatsappCompanyForm.includeBankDetails}
                                        onChange={e => setWhatsappCompanyForm({ ...whatsappCompanyForm, includeBankDetails: e.target.checked })}
                                    >
                                        <Text fontSize="xs" fontWeight="600" color="gray.700">Official Bank Details</Text>
                                    </Checkbox>
                                    <Checkbox
                                        colorScheme="teal"
                                        isChecked={whatsappCompanyForm.includeStatutoryDetails}
                                        onChange={e => setWhatsappCompanyForm({ ...whatsappCompanyForm, includeStatutoryDetails: e.target.checked })}
                                    >
                                        <Text fontSize="xs" fontWeight="600" color="gray.700">GSTIN, PAN & Udyam</Text>
                                    </Checkbox>
                                </SimpleGrid>
                            </Box>

                            {/* Phone Input with Auto-Fill Trigger */}
                            <FormControl isRequired>
                                <FormLabel fontSize="xs" fontWeight="700" color="gray.700">Mobile Number (10 Digits) *</FormLabel>
                                <InputGroup size="md">
                                    <InputLeftElement pointerEvents="none">
                                        <Text fontSize="sm" fontWeight="700" color="gray.400">+91</Text>
                                    </InputLeftElement>
                                    <Input
                                        type="tel"
                                        placeholder="9876543210"
                                        maxLength={10}
                                        value={whatsappCompanyForm.phone}
                                        onChange={handleWhatsappCompanyPhoneChange}
                                        borderRadius="lg"
                                        focusBorderColor="#25D366"
                                        fontWeight="700"
                                        letterSpacing="wide"
                                    />
                                    {isFetchingCompanyClient && (
                                        <InputRightElement>
                                            <Spinner size="sm" color="green.500" />
                                        </InputRightElement>
                                    )}
                                    {companyClientAutoFilled && (
                                        <InputRightElement>
                                            <Icon as={FiCheckCircle} color="green.500" w={5} h={5} />
                                        </InputRightElement>
                                    )}
                                </InputGroup>
                                {companyClientAutoFilled && (
                                    <Text fontSize="2xs" color="green.600" fontWeight="600" mt={1}>
                                        ✓ Existing client found! Details have been automatically populated.
                                    </Text>
                                )}
                            </FormControl>

                            {/* Auto-filled / Editable Client Details */}
                            <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={3}>
                                <FormControl>
                                    <FormLabel fontSize="xs" fontWeight="700" color="gray.600">Company Name</FormLabel>
                                    <InputGroup size="md">
                                        <InputLeftElement pointerEvents="none">
                                            <Icon as={FiBriefcase} color="gray.400" />
                                        </InputLeftElement>
                                        <Input
                                            placeholder="Client Company"
                                            value={whatsappCompanyForm.companyName}
                                            onChange={e => setWhatsappCompanyForm({ ...whatsappCompanyForm, companyName: e.target.value })}
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
                                            value={whatsappCompanyForm.contactPersonName}
                                            onChange={e => setWhatsappCompanyForm({ ...whatsappCompanyForm, contactPersonName: e.target.value })}
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
                                            value={whatsappCompanyForm.email}
                                            onChange={e => setWhatsappCompanyForm({ ...whatsappCompanyForm, email: e.target.value })}
                                            borderRadius="lg"
                                            fontSize="xs"
                                        />
                                    </InputGroup>
                                </FormControl>

                                <FormControl>
                                    <FormLabel fontSize="xs" fontWeight="700" color="gray.600">GST Number (Optional)</FormLabel>
                                    <Input
                                        placeholder="24AAAAA0000A1Z5"
                                        value={whatsappCompanyForm.gstNumber}
                                        onChange={e => setWhatsappCompanyForm({ ...whatsappCompanyForm, gstNumber: e.target.value.toUpperCase() })}
                                        borderRadius="lg"
                                        fontSize="xs"
                                    />
                                </FormControl>
                            </SimpleGrid>

                            <FormControl>
                                <FormLabel fontSize="xs" fontWeight="700" color="gray.600">Client Address (Optional)</FormLabel>
                                <Input
                                    placeholder="Site or Office Address"
                                    value={whatsappCompanyForm.address}
                                    onChange={e => setWhatsappCompanyForm({ ...whatsappCompanyForm, address: e.target.value })}
                                    borderRadius="lg"
                                    fontSize="xs"
                                />
                            </FormControl>

                            <FormControl>
                                <FormLabel fontSize="xs" fontWeight="700" color="gray.600">Custom WhatsApp Greeting Note (Optional)</FormLabel>
                                <Textarea
                                    rows={2}
                                    placeholder="Add any special note (e.g. Please find attached our company GST & Bank credentials for vendor registration)..."
                                    value={whatsappCompanyForm.customMessage}
                                    onChange={e => setWhatsappCompanyForm({ ...whatsappCompanyForm, customMessage: e.target.value })}
                                    borderRadius="lg"
                                    fontSize="xs"
                                />
                            </FormControl>
                        </Stack>
                    </ModalBody>

                    <ModalFooter gap={3} pt={2}>
                        <Button
                            variant="outline"
                            borderRadius="xl"
                            onClick={() => setIsWhatsappCompanyOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            bg="#25D366"
                            color="white"
                            _hover={{ bg: "#128C7E" }}
                            borderRadius="xl"
                            px={6}
                            fontWeight="700"
                            leftIcon={<FaWhatsapp size={18} />}
                            isLoading={isSendingCompanyWhatsapp}
                            loadingText="Dispatching..."
                            onClick={handleSendCompanyWhatsapp}
                            boxShadow="0 2px 10px rgba(37, 211, 102, 0.4)"
                        >
                            Send Documents on WhatsApp
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* Health & AI Diagnostics Modal */}
            <HealthModal isOpen={isHealthOpen} onClose={() => setIsHealthOpen(false)} />
        </Box>
    );
};

export default AdminDashboard;
