// Last updated: 2026-08-17T15:03:00.954Z
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
    Box, Container, VStack, HStack, Text, Heading, Badge, Button, IconButton,
    Icon, Input, Select, Table, Thead, Tbody, Tr, Th, Td, TableContainer,
    Card, CardBody, SimpleGrid, Flex, Spinner, Center, useToast,
    Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter,
    ModalCloseButton, useDisclosure, Tooltip, Tag, Divider, InputGroup, InputLeftElement,
    Checkbox, Tabs, TabList, Tab, TabPanels, TabPanel, Textarea, RadioGroup, Radio, GridItem,
    Alert, AlertIcon, AlertTitle, AlertDescription, Wrap, FormControl, FormLabel
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import {
    FaFileInvoiceDollar, FaEye, FaCheckCircle, FaClock, FaSearch,
    FaCalendarAlt, FaUser, FaBuilding, FaMapMarkerAlt, FaFilter,
    FaFileAlt, FaCamera, FaFilePdf, FaSyncAlt, FaDownload, FaEnvelope,
    FaListUl, FaExclamationTriangle, FaMoneyBillWave, FaTimes, FaPrint, FaWhatsapp,
    FaBell, FaHistory
} from 'react-icons/fa';
import api from '../../api/axios';
import ModulePermissionBar from '../../components/admin/ModulePermissionBar';
import { generateInvoiceHtml } from '../../utils/invoiceHtmlGenerator';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';


// ── Helpers ─────────────────────────────────────────────────────────────────
const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
};

// ── Financial Year & Invoice Numbering Helpers ─────────────────────────────
const getFinancialYearString = (dateObj = new Date()) => {
    const date = new Date(dateObj);
    const year = date.getFullYear();
    const month = date.getMonth(); // 0 = Jan, 3 = Apr
    let startYear, endYear;
    if (month >= 3) {
        startYear = year;
        endYear = year + 1;
    } else {
        startYear = year - 1;
        endYear = year;
    }
    return `${startYear}-${endYear.toString().slice(-2)}`;
};

const getCompanyPrefix = (companyDetails) => {
    if (!companyDetails) return 'UE';
    if (companyDetails.invoicePrefix && companyDetails.invoicePrefix.trim()) {
        return companyDetails.invoicePrefix.trim().toUpperCase();
    }
    const name = companyDetails.companyName || '';
    if (name.toUpperCase().includes('LAB')) return 'ULI';
    const words = name.split(' ').filter(w => w.trim().length > 0);
    const initials = words.map(w => w[0].toUpperCase()).join('');
    return initials || 'UE';
};

const generateNextInvoiceId = (schedulesList, type, companyDetails) => {
    const fyStr = getFinancialYearString(new Date());
    const prefix = getCompanyPrefix(companyDetails);
    let maxNum = 0;

    if (type === 'PROFORMA') {
        schedulesList.forEach(s => {
            let idStr = s.proformaInvoiceId || (s.invoiceType === 'proforma' ? s.invoiceDetails?.invoiceId : null);
            if (idStr && idStr.includes('PRM/')) {
                const parts = idStr.split('/');
                const lastPart = parts[parts.length - 1];
                const num = parseInt(lastPart, 10);
                if (!isNaN(num) && num > maxNum) maxNum = num;
            }
        });
        const nextSeq = String(maxNum + 1).padStart(4, '0');
        return `PRM/${prefix}/${nextSeq}`;
    } else {
        schedulesList.forEach(s => {
            let idStr = s.finalInvoiceId || (s.invoiceType === 'final' ? s.invoiceDetails?.invoiceId : null);
            if (idStr && idStr.includes(fyStr)) {
                const parts = idStr.split('/');
                const lastPart = parts[parts.length - 1];
                const num = parseInt(lastPart, 10);
                if (!isNaN(num) && num > maxNum) maxNum = num;
            }
        });
        const nextSeq = String(maxNum + 1).padStart(4, '0');
        return `${fyStr}/${prefix}/${nextSeq}`;
    }
};

// Row color coding by schedule type and ledger type (used for both main and sub-table rows)
const rowStyle = (s) => {
    const sType = s.scheduleType;
    let ledg = s.ledger;

    // If it's a grouped row, check the ledger of its first entry
    if (s.entries && s.entries.length > 0) {
        ledg = ledg || s.entries[0]?.ledger;
    }

    if (sType === 'TOPOGRAPHY SURVEY') {
        return { bg: 'white', border: 'gray.200', hoverBg: 'gray.50' };
    }
    if (sType === 'MONTH') {
        return { bg: 'white', border: 'gray.200', hoverBg: 'gray.50' };
    }
    if (sType === 'POINT MARKING') {
        return { bg: 'white', border: 'gray.200', hoverBg: 'gray.50' };
    }

    // VISIT / others: color based on ledger if present (Full Day = green, Half Day = orange)
    const ledgerVal = ledg || 'Full Day';
    if (ledgerVal === 'Full Day') return { bg: 'white', border: 'gray.200', hoverBg: 'gray.50' };
    if (ledgerVal === 'Half Day') return { bg: 'white', border: 'gray.200', hoverBg: 'gray.50' };

    return { bg: 'white', border: 'gray.200', hoverBg: 'gray.50' };
};

// ── Main Component ────────────────────────────────────────────────────────────
const calculateEntryAmount = (entry, invoiceDetails = null) => {
    if (!entry) return 0;
    const configs = invoiceDetails?.entryConfigs || entry?.invoiceDetails?.entryConfigs;
    if (configs) {
        const conf = configs[entry._id] || Object.values(configs).find(c => c.siteId === entry.site?._id || c.siteName === entry.site?.siteName);
        if (conf) {
            const r = Number(conf.rate || 0);
            const q = Number(conf.qty !== undefined ? conf.qty : 1);
            if (r > 0) return r * q;
        }
    }
    return Number(entry.amount || entry.grandTotal || 0);
};

const calculateInvoiceGrandTotal = (inv) => {
    if (!inv) return 0;
    const invDetails = inv.invoiceDetails;
    if (invDetails?.totalAmount && Number(invDetails.totalAmount) > 0) {
        return Number(invDetails.totalAmount);
    }
    if (invDetails?.grandTotal && Number(invDetails.grandTotal) > 0) {
        return Number(invDetails.grandTotal);
    }
    const entries = inv.entries || [];
    let subTotal = 0;
    if (invDetails?.entryConfigs) {
        Object.values(invDetails.entryConfigs).forEach(conf => {
            const r = Number(conf.rate || 0);
            const q = Number(conf.qty !== undefined ? conf.qty : 1);
            subTotal += r * q;
        });
    } else {
        entries.forEach(e => {
            subTotal += calculateEntryAmount(e, invDetails);
        });
    }
    if (subTotal > 0) {
        const gstPct = Number(invDetails?.gstPercentage !== undefined ? invDetails.gstPercentage : 18);
        const taxAmount = subTotal * (gstPct / 100);
        return subTotal + taxAmount;
    }
    return Number(inv.totalAmt || inv.grandTotal || inv.totalAmount || 0);
};

const InvoiceReport = ({ isInsideServices = false }) => {
    const toast = useToast();
    const navigate = useNavigate();

    // Missing Site Ledger Instruction Modal state
    const [missingLedgerSitesModal, setMissingLedgerSitesModal] = useState({ isOpen: false, sites: [] });

    // Group Details popup state
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [selectedEntryForDocs, setSelectedEntryForDocs] = useState(null);
    const [selectedEntries, setSelectedEntries] = useState([]);
    const [schedules, setSchedules] = useState([]);
    const tabCacheRef = useRef({});

    // Derived selected client ID for single-client selection enforcement & visual blur
    const activeSelectedClientId = React.useMemo(() => {
        if (!selectedEntries || selectedEntries.length === 0) return null;
        const firstEntry = schedules.find(s => selectedEntries.includes(s._id));
        if (!firstEntry) return null;
        return String(firstEntry.client?._id || firstEntry.client);
    }, [selectedEntries, schedules]);

    const activeSelectedClientName = React.useMemo(() => {
        if (!selectedEntries || selectedEntries.length === 0) return null;
        const firstEntry = schedules.find(s => selectedEntries.includes(s._id));
        if (!firstEntry) return null;
        return firstEntry.client?.clientName || 'Selected Client';
    }, [selectedEntries, schedules]);
    // Tabs & Invoice Form state
    const [activeTab, setActiveTab] = useState(0);
    const [closedPage, setClosedPage] = useState(1); // pagination for Closed tab
    const [companies, setCompanies] = useState([]);
    const [invoiceForm, setInvoiceForm] = useState({
        isOpen: false, type: '', entries: [], entryConfigs: {},
        companyDetails: null,
        invoiceId: '',
        buyerDetails: { name: '', address: '', gstin: '', stateName: '', stateCode: '24', contactPerson: '', contact: '' },
        shipToDetails: { name: '', address: '', gstin: '', stateName: '', stateCode: '24', contactPerson: '', contact: '' },
        description: '', targetGroup: null,
        gstType: 'CGST_SGST', gstPercentage: 18
    });

    const [loading, setLoading] = useState(false);
    const [updatingId, setUpdatingId] = useState(null);
    // ── Closed Tab Summary Stats (Total Closed, UPI Closed, CASH Closed) ──
    const closedSummaryStats = React.useMemo(() => {
        const closedSchedules = schedules.filter(s => s.invoiceStatus === 'Closed' || s.invoiceStatus === 'Completed' || s.closedDate);
        let totalAmt = 0;
        let upiAmt = 0;
        let cashAmt = 0;

        closedSchedules.forEach(s => {
            const amt = calculateEntryAmount(s, s.invoiceDetails);
            totalAmt += amt;
            const mode = (s.paymentMode || '').toUpperCase();
            if (mode.includes('UPI') || s.transactionNo) {
                upiAmt += amt;
            } else if (mode.includes('CASH') || s.receiverName) {
                cashAmt += amt;
            } else {
                upiAmt += amt;
            }
        });

        return { totalAmt, upiAmt, cashAmt, count: closedSchedules.length };
    }, [schedules]);

    const [cashUpiModal, setCashUpiModal] = useState({
        isOpen: false,
        mode: 'UPI', // 'UPI' or 'CASH'
        receiverName: '',
        transactionNo: '',
        paymentAmount: '',
        closedDate: new Date().toISOString().split('T')[0],
        remark: '',
        isSubmitting: false
    });

    // WhatsApp Send Modal State
    const [whatsappModal, setWhatsappModal] = useState({
        isOpen: false,
        phone: '',
        pdfUrl: '',
        invoiceId: '',
        invoiceType: 'proforma',
        clientName: '',
        isSending: false,
        additionalDocUrls: [] // selected doc URLs to send with invoice
    });

    const handleOpenWhatsappModal = (itemOrGroup) => {
        const clientObj = itemOrGroup.client || itemOrGroup.entries?.[0]?.client;
        const rawPhone = clientObj?.phone || clientObj?.contactNumbers?.[0] || clientObj?.contactPerson?.phone || itemOrGroup.buyerDetails?.phone || itemOrGroup.buyerDetails?.contact || '';
        const cleanPhone = (rawPhone || '').replace(/\D/g, '');
        
        const invId = itemOrGroup.finalInvoiceId || itemOrGroup.proformaInvoiceId || itemOrGroup.invoiceId || itemOrGroup.invoiceDetails?.invoiceId || '';
        const pdfUrl = itemOrGroup.finalInvoicePdf || itemOrGroup.proformaInvoicePdf || itemOrGroup.pdfUrl || itemOrGroup.invoiceDetails?.pdfUrl || null;
        
        const isFinal = Boolean(itemOrGroup.finalInvoicePdf || itemOrGroup.finalInvoiceId || itemOrGroup.invoiceStatus === 'Final' || itemOrGroup.invoiceStatus === 'Completed');
        const type = isFinal ? 'final' : 'proforma';

        if (!pdfUrl) {
            toast({ title: 'Invoice PDF Missing', description: 'No PDF found for this invoice. Please generate PDF first.', status: 'warning', duration: 3000 });
            return;
        }

        setWhatsappModal({
            isOpen: true,
            phone: cleanPhone,
            pdfUrl: pdfUrl,
            invoiceId: invId,
            invoiceType: type,
            clientName: clientObj?.clientName || itemOrGroup.buyerDetails?.name || 'Valued Client',
            isSending: false,
            additionalDocUrls: itemOrGroup.additionalDocUrls || []
        });
    };

    const handleSendWhatsappInvoice = async () => {
        const targetPhone = (whatsappModal.phone || '').trim();
        const cleanPhone = targetPhone.replace(/\D/g, '');
        
        if (!cleanPhone || cleanPhone.length < 10) {
            toast({ title: 'Invalid Phone Number', description: 'Please enter a valid 10-digit mobile number.', status: 'warning' });
            return;
        }

        setWhatsappModal(prev => ({ ...prev, isSending: true }));
        try {
            const res = await api.post('/whatsapp/send-invoice', {
                phone: targetPhone,
                pdfUrl: whatsappModal.pdfUrl,
                invoiceId: whatsappModal.invoiceId,
                invoiceType: whatsappModal.invoiceType,
                clientName: whatsappModal.clientName,
                additionalDocUrls: whatsappModal.additionalDocUrls || []
            });

            if (res.data.success) {
                toast({
                    title: 'WhatsApp Invoice Sent!',
                    description: res.data.msg || `Invoice PDF sent successfully to ${targetPhone}.`,
                    status: 'success',
                    duration: 4000
                });
                setWhatsappModal(prev => ({ ...prev, isOpen: false }));
            } else {
                toast({ title: 'Failed to Send', description: res.data.error || 'WhatsApp send failed', status: 'error' });
            }
        } catch (error) {
            console.error('[WhatsApp Send Error]', error);
            const errMsg = error.response?.data?.error || error.message || 'Error sending WhatsApp invoice';
            if (errMsg.includes('not ready')) {
                toast({
                    title: 'Admin WhatsApp Disconnected',
                    description: 'Your personal Admin WhatsApp line is not connected. Please connect your WhatsApp account in Admin WhatsApp Settings.',
                    status: 'warning',
                    duration: 6000
                });
            } else {
                toast({ title: 'WhatsApp Send Error', description: errMsg, status: 'error' });
            }
        } finally {
            setWhatsappModal(prev => ({ ...prev, isSending: false }));
        }
    };

    // Preview Modal State
    // ── Payment Reminder Follow-Up & Invoice Detail State ──
    const [selectedInvoiceDetail, setSelectedInvoiceDetail] = useState(null);
    const { isOpen: isFollowUpOpen, onOpen: onFollowUpOpen, onClose: onFollowUpClose } = useDisclosure();
    const [followUpTarget, setFollowUpTarget] = useState(null);
    const [followUpForm, setFollowUpForm] = useState({
        remark: '',
        nextFollowUpDate: ''
    });
    const [isSubmittingFollowUp, setIsSubmittingFollowUp] = useState(false);

    const handleOpenFollowUp = (inv, group = null) => {
        setFollowUpTarget({ inv, group });
        const defaultDate = new Date();
        defaultDate.setDate(defaultDate.getDate() + 7);
        setFollowUpForm({
            remark: '',
            nextFollowUpDate: defaultDate.toISOString().split('T')[0]
        });
        onFollowUpOpen();
    };

    const handleSubmitFollowUp = async () => {
        if (!followUpForm.remark.trim()) {
            toast({ title: 'Please enter a remark', status: 'warning', duration: 3000 });
            return;
        }
        if (!followUpForm.nextFollowUpDate) {
            toast({ title: 'Please select the next follow-up date', status: 'warning', duration: 3000 });
            return;
        }
        setIsSubmittingFollowUp(true);
        try {
            const userString = sessionStorage.getItem('user') || localStorage.getItem('user') || '{}';
            let user = {};
            try { user = JSON.parse(userString); } catch (e) { }
            let addedBy = user.name || user.contactPersonName || user.companyName;
            if (!addedBy && user.email) addedBy = user.email.split('@')[0];
            if (!addedBy) addedBy = 'Admin';

            const invId = followUpTarget?.inv?.invoiceId && followUpTarget.inv.invoiceId !== '—'
                ? followUpTarget.inv.invoiceId
                : (followUpTarget?.inv?.entries?.[0]?._id || followUpTarget?.inv?.invoiceKey);

            await api.post(`/schedule-master/invoice/${encodeURIComponent(invId)}/follow-up`, {
                remark: followUpForm.remark.trim(),
                nextFollowUpDate: followUpForm.nextFollowUpDate,
                addedBy
            });

            toast({
                title: '✅ Follow-up Saved!',
                description: `Next follow-up set for ${new Date(followUpForm.nextFollowUpDate).toLocaleDateString('en-GB')}`,
                status: 'success',
                duration: 4000
            });

            onFollowUpClose();
            fetchVisitSchedules(activeTab);
        } catch (err) {
            toast({ title: err.response?.data?.message || 'Failed to save follow-up', status: 'error', duration: 3000 });
        } finally {
            setIsSubmittingFollowUp(false);
        }
    };

    const [previewModal, setPreviewModal] = useState({
        isOpen: false,
        htmlContent: '',
        pdfUrl: '',
        title: '',
        type: ''
    });

    const handlePreviewInvoiceForm = () => {
        if (!invoiceForm.entries || invoiceForm.entries.length === 0) {
            toast({ title: 'No entries selected for preview', status: 'warning', duration: 2000 });
            return;
        }
        const html = generateInvoiceHtml(invoiceForm, invoiceForm.entries, invoiceForm.type);
        const isProforma = invoiceForm.type === 'PROFORMA';
        setPreviewModal({
            isOpen: true,
            htmlContent: html,
            pdfUrl: '',
            title: `${isProforma ? 'Proforma Invoice' : 'Tax Invoice'} Preview — ${invoiceForm.invoiceId || 'Draft'}`,
            type: invoiceForm.type
        });
    };

    const handlePreviewExistingPdf = (pdfUrl, invoiceId, type = 'Invoice', invoiceGroup = null) => {
        let group = invoiceGroup;
        
        // If invoiceGroup is not provided directly, search matching entries from schedules
        if (!group && (invoiceId || pdfUrl)) {
            const matchingEntries = schedules.filter(s => {
                const sInvId = s.finalInvoiceId || s.proformaInvoiceId || s.invoiceId || s.invoiceDetails?.invoiceId;
                const sPdf = s.finalInvoicePdf || s.proformaInvoicePdf || s.pdfUrl || s.invoiceDetails?.pdfUrl;
                return (invoiceId && sInvId === invoiceId) || (pdfUrl && sPdf === pdfUrl);
            });

            if (matchingEntries.length > 0) {
                const first = matchingEntries[0];
                const isTax = Boolean(first.finalInvoiceId || first.finalInvoicePdf || first.invoiceStatus === 'Final' || first.invoiceStatus === 'Completed' || first.invoiceStatus === 'Closed' || type.toLowerCase().includes('final') || type.toLowerCase().includes('tax'));
                group = {
                    invoiceId: invoiceId || first.finalInvoiceId || first.proformaInvoiceId || first.invoiceId || first.invoiceDetails?.invoiceId,
                    isTaxInvoice: isTax,
                    invoiceDetails: first.invoiceDetails || {},
                    entries: matchingEntries,
                    client: first.client
                };
            }
        }

        if (group && (group.invoiceDetails || group.entries?.length > 0)) {
            const isTax = group.isTaxInvoice || type.toLowerCase().includes('final') || type.toLowerCase().includes('tax');
            const formLike = {
                type: isTax ? 'TAX' : 'PROFORMA',
                invoiceId: group.invoiceId || invoiceId || 'INV-PREVIEW',
                companyDetails: group.invoiceDetails?.companyDetails || group.entries?.[0]?.invoiceDetails?.companyDetails || {},
                buyerDetails: group.invoiceDetails?.buyerDetails || group.entries?.[0]?.invoiceDetails?.buyerDetails || (group.client ? { name: group.client.clientName, address: group.client.clientAddress, gstin: group.client.gstNo } : {}),
                shipToDetails: group.invoiceDetails?.shipToDetails || group.entries?.[0]?.invoiceDetails?.shipToDetails || {},
                description: group.invoiceDetails?.description || group.entries?.[0]?.invoiceDetails?.description || '',
                entryConfigs: group.invoiceDetails?.entryConfigs || group.entries?.[0]?.invoiceDetails?.entryConfigs || {},
                gstType: group.invoiceDetails?.gstType || group.entries?.[0]?.invoiceDetails?.gstType || 'CGST_SGST',
                gstPercentage: group.invoiceDetails?.gstPercentage !== undefined ? group.invoiceDetails.gstPercentage : (group.entries?.[0]?.invoiceDetails?.gstPercentage || 18),
            };
            const entries = group.entries || [];
            const html = generateInvoiceHtml(formLike, entries, formLike.type);
            const fullPdfUrl = pdfUrl ? (pdfUrl.startsWith('http') ? pdfUrl : `${API_BASE_URL}${pdfUrl.startsWith('/') ? '' : '/'}${pdfUrl}`) : '';

            setPreviewModal({
                isOpen: true,
                htmlContent: html,
                pdfUrl: fullPdfUrl,
                title: `${formLike.type === 'TAX' ? 'Tax Invoice' : 'Proforma Invoice'} Preview — ${formLike.invoiceId || ''}`,
                type: formLike.type
            });
            return;
        }

        if (pdfUrl) {
            const fullUrl = pdfUrl.startsWith('http') ? pdfUrl : `${API_BASE_URL}${pdfUrl.startsWith('/') ? '' : '/'}${pdfUrl}`;
            setPreviewModal({
                isOpen: true,
                htmlContent: '',
                pdfUrl: fullUrl,
                title: `${type} Preview — ${invoiceId || ''}`,
                type: type
            });
            return;
        }

        toast({ title: 'Invoice Preview', description: 'No PDF or invoice details available to preview.', status: 'warning', duration: 3000 });
    };

    // Filters
    const [search, setSearch] = useState('');
    const [filterLedger, setFilterLedger] = useState('');
    const [filterDateFrom, setFilterDateFrom] = useState('');
    const [filterDateTo, setFilterDateTo] = useState('');

    // Payment Reminder Tab Filters & State
    const [reminderCompanyId, setReminderCompanyId] = useState('');
    const [reminderSearch, setReminderSearch] = useState('');
    const [reminderInvoiceTypeFilter, setReminderInvoiceTypeFilter] = useState('');
    const [reminderPaymentStatusFilter, setReminderPaymentStatusFilter] = useState('');
    const [expandedClientIds, setExpandedClientIds] = useState([]);
    // Client Invoices & Sites Popup Modal
    const [selectedClientModal, setSelectedClientModal] = useState(null);
    const [clientModalTab, setClientModalTab] = useState(0);
    // Site Detail Drawer
    const [siteDrawer, setSiteDrawer] = useState({ isOpen: false, entry: null, siteObj: null, clientObj: null, invoiceGroup: null });
    const [siteDrawerTab, setSiteDrawerTab] = useState(0);
    const [selectedDocUrls, setSelectedDocUrls] = useState(new Set()); // tracks checked docs in TAB 3

    const handleOpenSiteDrawer = (siteObj, invGroup = null, specificEntry = null) => {
        const siteKey = String(siteObj?._id || siteObj?.siteName || '').toLowerCase().trim();

        const entry = specificEntry ||
            invGroup?.entries?.find(e => String(e.site?._id || e.site?.siteName || '').toLowerCase().trim() === siteKey) ||
            invGroup?.entries?.[0] ||
            schedules.find(s => String(s.site?._id || s.site?.siteName || '').toLowerCase().trim() === siteKey);

        const clientObj = entry?.client || selectedClientModal?.clientObj || null;
        const matchedEntries = schedules.filter(s => String(s.site?._id || s.site?.siteName || '').toLowerCase().trim() === siteKey);

        const invoiceGroupObj = invGroup || (entry ? {
            invoiceKey: entry.finalInvoiceId || entry.proformaInvoiceId || entry._id,
            invoiceId: entry.finalInvoiceId || entry.proformaInvoiceId || entry.invoiceDetails?.invoiceId || '—',
            isTaxInvoice: Boolean(entry.finalInvoiceId || entry.finalInvoicePdf || entry.invoiceStatus === 'Final' || entry.invoiceStatus === 'Completed' || entry.invoiceStatus === 'Closed'),
            pdfUrl: entry.finalInvoicePdf || entry.proformaInvoicePdf || null,
            invoiceDetails: entry.invoiceDetails || null,
            generatedAt: entry.invoiceDetails?.generatedAt || entry.createdAt,
            entries: matchedEntries.length > 0 ? matchedEntries : [entry],
            sites: [siteObj || entry.site]
        } : null);

        setSiteDrawer({
            isOpen: true,
            entry: entry,
            siteObj: siteObj || entry?.site,
            clientObj: clientObj,
            invoiceGroup: invoiceGroupObj
        });
        setSiteDrawerTab(0);
        setSelectedDocUrls(new Set()); // reset doc checkboxes on fresh open
    };

    const handleSendWhatsappReminder = (siteEntry) => {
        const clientName = siteEntry.client?.clientName || 'Valued Client';
        const siteName = siteEntry.site?.siteName || 'N/A';
        const billDate = formatDate(siteEntry.invoiceDetails?.generatedAt || siteEntry.invoiceDetails?.invoiceDate || siteEntry.createdAt);
        const invDetails = siteEntry.invoiceDetails;
        let amount = calculateEntryAmount(siteEntry, invDetails);
        if (amount === 0) {
            amount = calculateInvoiceGrandTotal({ invoiceDetails: invDetails, entries: [siteEntry] });
        }
        const compName = siteEntry.invoiceDetails?.companyDetails?.companyName || 'Our Company';
        const phone = siteEntry.client?.phone || siteEntry.client?.contactNumbers?.[0] || siteEntry.client?.contactPerson?.phone || '';

        const isTaxInvoice = Boolean(siteEntry.finalInvoiceId || siteEntry.finalInvoicePdf || siteEntry.invoiceStatus === 'Final' || siteEntry.invoiceStatus === 'Completed' || siteEntry.invoiceStatus === 'Closed');

        const reminderType = isTaxInvoice ? '*TAX INVOICE PAYMENT REMINDER*' : '*PROFORMA INVOICE PAYMENT REMINDER*';
        const invoiceTypeLabel = isTaxInvoice ? 'Tax Invoice' : 'Proforma Invoice';
        const invNo = isTaxInvoice
            ? (siteEntry.finalInvoiceId || siteEntry.invoiceDetails?.invoiceId || 'N/A')
            : (siteEntry.proformaInvoiceId || siteEntry.invoiceDetails?.invoiceId || 'N/A');

        const message = `${reminderType}\n\n` +
            `Dear *${clientName}*,\n` +
            `This is a gentle payment reminder regarding your outstanding *${invoiceTypeLabel}*.\n\n` +
            `📋 *${invoiceTypeLabel} No:* ${invNo}\n` +
            `🏢 *Site:* ${siteName}\n` +
            `📅 *Date:* ${billDate}\n` +
            `💰 *Amount Due:* ₹${Number(amount).toLocaleString('en-IN')}\n` +
            `🏭 *Billed By:* ${compName}\n\n` +
            `Kindly arrange the payment at your earliest convenience. If already paid, please ignore this message.\n\n` +
            `Thank you!`;

        const cleanPhone = (phone || '').replace(/\D/g, '');
        const targetPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
        if (targetPhone) {
            const url = `https://wa.me/${targetPhone}?text=${encodeURIComponent(message)}`;
            window.open(url, '_blank');
        } else {
            toast({ title: 'Client Contact Missing', description: 'No mobile number found for this client.', status: 'warning', duration: 3000 });
        }
    };

    const tabStatusKeys = ['Pending', 'Proforma', 'Final', 'Reminder', 'Closed'];

    // Helper to derive accurate tab category matching backend logic
    const deriveScheduleTabStatus = (s) => {
        if (s.closedDate || s.invoiceStatus === 'Closed' || s.invoiceStatus === 'Completed') {
            return 'Closed';
        }
        if (s.finalInvoiceId || s.finalInvoicePdf || s.invoiceStatus === 'Final') {
            return 'Final';
        }
        if (s.proformaInvoiceId || s.proformaInvoicePdf || s.invoiceStatus === 'Proforma') {
            return 'Proforma';
        }
        return 'Pending';
    };

    // Fetch schedules tab-wise with instant cache & background SWR revalidation
    const fetchVisitSchedules = useCallback(async (tabIndex = activeTab, force = false) => {
        const currentTabIdx = typeof tabIndex === 'number' ? tabIndex : activeTab;
        const currentStatus = tabStatusKeys[currentTabIdx] || 'Pending';

        if (tabCacheRef.current[currentTabIdx] && !force) {
            setSchedules(tabCacheRef.current[currentTabIdx]);
            setLoading(false);
        } else {
            setLoading(true);
        }

        try {
            const params = new URLSearchParams();
            params.append('invoiceStatus', currentStatus);
            if (filterDateFrom) params.append('startDate', filterDateFrom);
            if (filterDateTo) params.append('endDate', filterDateTo);

            const res = await api.get(`/schedule-master?${params.toString()}`);
            if (res.data.success) {
                const rawData = res.data.data;

                // Map documents inline
                const formattedSchedules = rawData.map(s => {
                    let docs = s.uploadedDocuments || [];
                    if (s.scheduleType === 'TOPOGRAPHY SURVEY') {
                        docs = (s.draftingWorkFiles?.mailFiles || []).map(f => ({ ...f, isMail: true }));
                    }
                    return {
                        ...s,
                        allDocuments: docs
                    };
                });

                tabCacheRef.current[currentTabIdx] = formattedSchedules;
                setSchedules(formattedSchedules);
            }
        } catch (err) {
            if (!tabCacheRef.current[currentTabIdx]) {
                toast({ title: 'Failed to load schedules', status: 'error', duration: 3000 });
            }
        } finally {
            setLoading(false);
        }
    }, [activeTab, filterDateFrom, filterDateTo]);

    useEffect(() => { fetchVisitSchedules(activeTab); setClosedPage(1); }, [activeTab]);

    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                const res = await api.get('/company-master');
                if (res.data.success) {
                    setCompanies(res.data.data);
                }
            } catch (err) {
                console.error("Failed to fetch companies", err);
            }
        };
        fetchCompanies();
    }, []);

    useEffect(() => {
        const handleRealtimeUpdate = (e) => {
            const type = e.detail?.type;
            if (!type || ['schedule', 'expense'].includes(type)) {
                fetchVisitSchedules(activeTab);
            }
        };
        window.addEventListener('app-realtime-update', handleRealtimeUpdate);
        return () => window.removeEventListener('app-realtime-update', handleRealtimeUpdate);
    }, [activeTab, fetchVisitSchedules]);

    // Mark invoice as completed / revert to pending for a single schedule
    const toggleInvoiceStatus = async (schedule) => {
        const next = schedule.invoiceStatus === 'Completed' ? 'Pending' : 'Completed';
        setUpdatingId(schedule._id);
        try {
            await api.patch(`/schedule-master/invoice-status/${schedule._id}`, { invoiceStatus: next });

            setSchedules(prev => {
                const nextSchedules = prev.map(s => s._id === schedule._id ? { ...s, invoiceStatus: next } : s);

                // Keep popup group values synchronized in real-time
                if (selectedGroup) {
                    setSelectedGroup(prevGroup => {
                        const updatedEntries = prevGroup.entries.map(e => e._id === schedule._id ? { ...e, invoiceStatus: next } : e);
                        const hasPending = updatedEntries.some(e => e.invoiceStatus !== 'Completed');
                        return {
                            ...prevGroup,
                            entries: updatedEntries,
                            status: hasPending ? 'Pending' : 'Completed'
                        };
                    });
                }

                return nextSchedules;
            });

            toast({ title: `Bill marked as ${next}`, status: next === 'Completed' ? 'success' : 'info', duration: 2000 });
        } catch {
            toast({ title: 'Update failed', status: 'error', duration: 2000 });
        } finally {
            setUpdatingId(null);
        }
    };

    // Filter logic based on documents: Topography Survey requires at least 1 Mail file uploaded
    const validSchedules = useMemo(() => schedules.filter(s => {
        if (s.dayStatus === 'Rejected') return false;

        const isTopo = (s.scheduleType || '').toUpperCase().includes('TOPOGRAPHY');

        const hasMailFile = (s.draftingWorkFiles?.mailFiles && s.draftingWorkFiles.mailFiles.length > 0) ||
            (s.allDocuments && s.allDocuments.some(d => d.isMail || d.url?.includes('/drawing/') || d.url?.includes('/drafting/')));

        if (isTopo) return hasMailFile;

        if (s.scheduleType === 'MONTH' && s.endDate) {
            const end = new Date(s.endDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (end <= today) return true;
        }

        const hasCoreDocs = hasMailFile || (s.allDocuments && s.allDocuments.some(d => {
            if (d.category || d.url?.includes('employee_master') || d.url?.includes('expense_') || d.url?.includes('otherExpense_')) return false;
            const isPhoto = d.url?.includes('/photos/') || d.name?.toLowerCase().includes('photo') || (d.url?.includes('site_') && d.url?.includes('photos')) || d.url?.includes('/uploads/photos-');
            const isReport = d.url?.includes('/Daily_report/') || d.url?.includes('dailyReports') || d.name?.toLowerCase().includes('report');
            const isData = d.url?.includes('/data/') || d.url?.includes('dataFiles') || (d.url?.includes('site_') && d.url?.includes('data'));
            const isDrawing = d.url?.includes('/drawing/') || (d.url?.includes('site_') && d.url?.includes('drawing'));
            return isPhoto || isReport || isData || isDrawing;
        }));

        return hasCoreDocs;
    }), [schedules]);

    // Filter client-side by search text, ledger, and active tab status
    const displayed = useMemo(() => validSchedules.filter(s => {
        const q = search.toLowerCase();
        const matchSearch = !q ||
            s.client?.clientName?.toLowerCase().includes(q) ||
            s.site?.siteName?.toLowerCase().includes(q) ||
            s.operative?.name?.toLowerCase().includes(q);
        const matchLedger = !filterLedger || s.ledger === filterLedger;

        const targetStatus = tabStatusKeys[activeTab];
        const entryStatus = deriveScheduleTabStatus(s);
        const matchTab = activeTab === 3 || entryStatus === targetStatus;

        return matchSearch && matchLedger && matchTab;
    }), [validSchedules, search, filterLedger, activeTab]);

    // ─── Payment Reminder: derive payment status for a schedule entry ────────
    const derivePaymentStatus = (s) => {
        const isClosed = s.invoiceStatus === 'Closed' || s.invoiceStatus === 'Completed' || s.closedDate;
        if (isClosed) return 'PAID';
        const totalAmt = Number(s.invoiceDetails?.totalAmount || s.grandTotal || s.totalAmount || 0);
        const paidAmt = Number(s.paymentAmount || 0);
        if (paidAmt > 0 && paidAmt < totalAmt) return 'PARTIAL';
        const dueDate = s.invoiceDetails?.dueDate;
        if (dueDate && new Date(dueDate) < new Date()) return 'OVERDUE';
        return 'PENDING';
    };

    // Payment Reminder Tab Grouped Data — deduplicated by invoice, with combined-invoice support
    const reminderData = React.useMemo(() => {
        // Find all schedules with proforma or final invoices
        const invoicedSchedules = schedules.filter(s => {
            const hasInv = s.proformaInvoiceId || s.finalInvoiceId || s.invoiceDetails?.invoiceId || s.proformaInvoicePdf || s.finalInvoicePdf || ['Proforma', 'Final', 'Completed', 'Closed'].includes(s.invoiceStatus);
            if (!hasInv) return false;
            // Filter by company if selected
            if (reminderCompanyId) {
                const compDetails = s.invoiceDetails?.companyDetails;
                const selectedComp = companies.find(c => c._id === reminderCompanyId);
                if (compDetails?._id || compDetails?.id) {
                    if (String(compDetails._id || compDetails.id) !== String(reminderCompanyId)) return false;
                } else if (selectedComp) {
                    const compName = (compDetails?.companyName || '').toLowerCase();
                    if (compName && compName !== (selectedComp.companyName || '').toLowerCase()) return false;
                }
            }
            return true;
        });

        // STEP 1: Group entries by their ACTIVE invoice ID.
        // Rule: if finalInvoiceId exists, that is the active invoice (ignore proforma separately).
        // Combined invoices: multiple entries share the same finalInvoiceId or proformaInvoiceId.
        const invoiceMap = {}; // key: invoiceId string
        invoicedSchedules.forEach(s => {
            const activeInvId = s.finalInvoiceId || s.proformaInvoiceId || s.invoiceDetails?.invoiceId;
            const isTax = Boolean(s.finalInvoiceId || s.finalInvoicePdf || s.invoiceStatus === 'Final' || s.invoiceStatus === 'Completed' || s.invoiceStatus === 'Closed');
            const key = activeInvId || `entry-${s._id}`;
            if (!invoiceMap[key]) {
                invoiceMap[key] = {
                    invoiceKey: key,
                    invoiceId: activeInvId || '—',
                    isTaxInvoice: isTax,
                    pdfUrl: s.finalInvoicePdf || s.proformaInvoicePdf || null,
                    invoiceDetails: s.invoiceDetails || null,
                    generatedAt: s.invoiceDetails?.generatedAt || s.invoiceLockedAt || s.createdAt,
                    entries: []
                };
            }
            // Upgrade to tax if any entry has finalInvoiceId
            if (isTax) {
                invoiceMap[key].isTaxInvoice = true;
                invoiceMap[key].pdfUrl = s.finalInvoicePdf || invoiceMap[key].pdfUrl;
            }
            invoiceMap[key].entries.push(s);
        });

        // STEP 2: Group invoices by Client
        const clientMap = {};
        Object.values(invoiceMap).forEach(inv => {
            const firstEntry = inv.entries[0];
            const clientObj = firstEntry.client;
            const clientId = String(clientObj?._id || clientObj?.clientId || clientObj?.clientName || 'unknown');
            const clientName = clientObj?.clientName || 'Unknown Client';
            if (!clientMap[clientId]) {
                clientMap[clientId] = { clientId, clientName, clientObj, invoices: [] };
            }
            // Build per-invoice summary
            const sites = [];
            const siteKeys = new Set();
            inv.entries.forEach(e => {
                const sk = String(e.site?._id || e.site?.siteName || '');
                if (!siteKeys.has(sk)) { siteKeys.add(sk); sites.push(e.site); }
            });
            const totalAmt = calculateInvoiceGrandTotal(inv);
            // Derive combined payment status from all entries
            const statuses = inv.entries.map(e => derivePaymentStatus(e));
            let paymentStatus = 'PENDING';
            if (statuses.every(s => s === 'PAID')) paymentStatus = 'PAID';
            else if (statuses.some(s => s === 'PAID' || s === 'PARTIAL')) paymentStatus = 'PARTIAL';
            else if (statuses.some(s => s === 'OVERDUE')) paymentStatus = 'OVERDUE';
            const followUps = inv.entries.find(e => e.followUps && e.followUps.length > 0)?.followUps || [];
            const nextFollowUp = inv.entries.find(e => e.nextFollowUp)?.nextFollowUp || null;
            if (paymentStatus !== 'PAID') {
                clientMap[clientId].invoices.push({ ...inv, sites, totalAmt, paymentStatus, followUps, nextFollowUp });
            }
        });

        // STEP 3: Build final list, apply search + type + status filters
        const q = reminderSearch.toLowerCase().trim();
        return Object.values(clientMap).filter(group => group.invoices.length > 0).filter(group => {
            if (!q && !reminderInvoiceTypeFilter && !reminderPaymentStatusFilter) return true;
            const matchClient = !q || group.clientName.toLowerCase().includes(q);
            const matchInvoices = !q || group.invoices.some(inv =>
                inv.invoiceId.toLowerCase().includes(q) ||
                inv.sites.some(s => (s?.siteName || '').toLowerCase().includes(q))
            );
            // Apply type filter
            let typeOk = true;
            if (reminderInvoiceTypeFilter === 'TAX') typeOk = group.invoices.some(i => i.isTaxInvoice);
            if (reminderInvoiceTypeFilter === 'PROFORMA') typeOk = group.invoices.some(i => !i.isTaxInvoice);
            // Apply payment status filter
            let statusOk = true;
            if (reminderPaymentStatusFilter) statusOk = group.invoices.some(i => i.paymentStatus === reminderPaymentStatusFilter);
            return (matchClient || matchInvoices) && typeOk && statusOk;
        }).sort((a, b) => {
            // Sort: clients with OVERDUE first, then PENDING, then PARTIAL, then PAID
            const statusOrder = { OVERDUE: 0, PENDING: 1, PARTIAL: 2, PAID: 3 };
            const aWorst = Math.min(...a.invoices.map(i => statusOrder[i.paymentStatus] ?? 4));
            const bWorst = Math.min(...b.invoices.map(i => statusOrder[i.paymentStatus] ?? 4));
            return aWorst - bWorst;
        });
    }, [schedules, reminderCompanyId, reminderSearch, reminderInvoiceTypeFilter, reminderPaymentStatusFilter, companies]);

    // Reminder summary stats
    const reminderStats = React.useMemo(() => {
        const allInvoices = reminderData.flatMap(g => g.invoices);
        const totalBilled = allInvoices.reduce((s, i) => s + Number(i.totalAmt || 0), 0);
        const pending = allInvoices.filter(i => i.paymentStatus === 'PENDING' || i.paymentStatus === 'OVERDUE').reduce((s, i) => s + Number(i.totalAmt || 0), 0);
        const overdue = allInvoices.filter(i => i.paymentStatus === 'OVERDUE').length;
        const taxCount = allInvoices.filter(i => i.isTaxInvoice).length;
        const proformaCount = allInvoices.filter(i => !i.isTaxInvoice).length;
        return { totalBilled, pending, overdue, taxCount, proformaCount, total: allInvoices.length };
    }, [reminderData]);

    // Auto-expand all clients on Payment Reminder tab load
    useEffect(() => {
        if (activeTab === 3 && reminderData.length > 0 && expandedClientIds.length === 0) {
            setExpandedClientIds(reminderData.map(g => g.clientId));
        }
    }, [activeTab, reminderData]);

    const stats = useMemo(() => ({
        total: validSchedules.length,
        pending: validSchedules.filter(s => s.invoiceStatus !== 'Completed' && s.invoiceStatus !== 'Closed').length,
        completed: validSchedules.filter(s => s.invoiceStatus === 'Completed' || s.invoiceStatus === 'Closed').length,
        fullDay: validSchedules.filter(s => s.ledger === 'Full Day').length,
        halfDay: validSchedules.filter(s => s.ledger === 'Half Day').length,
    }), [validSchedules]);

    // Dynamic Grouping & Sorting logic
    const groupedGroups = React.useMemo(() => {
        const groups = {};
        displayed.forEach(s => {
            const clientId = s.client?._id || s.client;
            const siteId = s.site?._id || s.site;
            if (!clientId || !siteId) return;
            const sType = s.scheduleType || 'VISIT';

            // If the entry is part of a generated invoice, group by that invoice ID. 
            // This prevents multi-site invoices from splitting apart in the Proforma/Final tabs.
            const invId = s.invoiceDetails?.invoiceId || s.finalInvoiceId || s.proformaInvoiceId;
            let groupKey;

            if (activeTab > 0 && invId) {
                groupKey = `inv-${invId}`;
            } else if (activeTab === 4) {
                if (s.scheduleType === 'MONTH') {
                    // MONTH entries group by: client + the date they were CLOSED
                    // → All months closed together (same closedDate) = 1 row
                    // → Some months closed today, some closed later = separate rows
                    const dateRef = s.closedDate || s.scheduleDate;
                    const closedDay = dateRef
                        ? new Date(dateRef).toISOString().split('T')[0]
                        : 'unknown';
                    groupKey = `client-${clientId}-MONTH-closed-${closedDay}`;
                } else {
                    // Every other direct-closed entry gets its own row
                    // (closedDate is date-only so time-based grouping is impossible)
                    groupKey = `entry-${s._id}`;
                }
            } else {
                groupKey = `client-${clientId}`;
            }

            if (!groups[groupKey]) {
                groups[groupKey] = {
                    groupId: groupKey,
                    invoiceId: invId,
                    client: s.client,
                    entries: []
                };
            }
            groups[groupKey].entries.push(s);
        });

        const list = Object.values(groups);

        list.forEach(g => {
            // Sort entries date-wise ascending
            g.entries.sort((a, b) => new Date(a.scheduleDate) - new Date(b.scheduleDate));

            // Organize entries by site under this client
            const siteGroupsMap = {};
            g.entries.forEach(e => {
                const siteKey = e.site?._id || e.site?.siteName || 'unknown-site';
                if (!siteGroupsMap[siteKey]) {
                    siteGroupsMap[siteKey] = {
                        siteKey,
                        site: e.site,
                        entries: []
                    };
                }
                siteGroupsMap[siteKey].entries.push(e);
            });
            g.siteGroups = Object.values(siteGroupsMap);

            // Determine unique schedule types present under this client
            const typesSet = new Set();
            g.entries.forEach(e => {
                if (e.scheduleType === 'TOPOGRAPHY SURVEY') {
                    typesSet.add('Topography Survey');
                } else if (e.scheduleType === 'MONTH') {
                    typesSet.add('Month Contract');
                } else if (e.scheduleType === 'POINT MARKING') {
                    typesSet.add('Point Marking');
                } else {
                    typesSet.add('Visit');
                }
            });
            g.uniqueTypes = Array.from(typesSet);

            // Outer status is Pending if at least one entry inside is pending
            const hasPending = g.entries.some(e => e.invoiceStatus !== 'Completed');
            g.status = hasPending ? 'Pending' : 'Completed';

            // Find earliest pending date
            const pendingEntries = g.entries.filter(e => e.invoiceStatus !== 'Completed');
            if (pendingEntries.length > 0) {
                const sortedPending = [...pendingEntries].sort((a, b) => new Date(a.scheduleDate) - new Date(b.scheduleDate));
                g.earliestPendingDate = sortedPending[0].scheduleDate;
            } else {
                g.earliestPendingDate = null;
            }

            // Find latest entry date
            const sortedAll = [...g.entries].sort((a, b) => new Date(b.scheduleDate) - new Date(a.scheduleDate));
            g.latestEntryDate = sortedAll[0]?.scheduleDate || null;

            // Find PDFs and IDs
            g.proformaInvoicePdf = g.entries.find(e => e.proformaInvoicePdf)?.proformaInvoicePdf || null;
            g.finalInvoicePdf = g.entries.find(e => e.finalInvoicePdf)?.finalInvoicePdf || null;
            g.proformaInvoiceId = g.entries.find(e => e.proformaInvoiceId)?.proformaInvoiceId || null;
            g.finalInvoiceId = g.entries.find(e => e.finalInvoiceId)?.finalInvoiceId || null;

            // Find invoice generation timestamp for proper sorting
            g.latestInvoiceDate = g.entries.find(e => e.invoiceDetails?.generatedAt)?.invoiceDetails?.generatedAt || g.latestEntryDate;
        });

        // Sort: Pending groups first (ordered by earliestPendingDate asc), Completed groups next (ordered by latestInvoiceDate desc)
        list.sort((a, b) => {
            if (a.status === 'Pending' && b.status !== 'Pending') return -1;
            if (a.status !== 'Pending' && b.status === 'Pending') return 1;

            if (a.status === 'Pending' && b.status === 'Pending') {
                return new Date(a.earliestPendingDate) - new Date(b.earliestPendingDate);
            }

            return new Date(b.latestInvoiceDate) - new Date(a.latestInvoiceDate);
        });

        return list;
    }, [displayed, activeTab]);

    const validateAndPrepareGlobalInvoice = async (type) => {
        if (selectedEntries.length === 0) {
            toast({ title: 'No entries selected', status: 'warning', duration: 2000 });
            return;
        }

        const entriesToInvoice = schedules.filter(s => selectedEntries.includes(s._id));

        // Ensure all selected entries belong to the SAME client
        const firstClient = entriesToInvoice[0].client?._id || entriesToInvoice[0].client;
        const allSameClient = entriesToInvoice.every(e => (e.client?._id || e.client) === firstClient);

        if (!allSameClient) {
            toast({ title: 'Cannot generate invoice for multiple clients', description: 'Please select entries belonging to the same client.', status: 'error', duration: 5000 });
            return;
        }

        const initialConfigs = {};
        let failedSites = [];

        entriesToInvoice.forEach(entry => {
            const siteLedgers = entry.site?.ledgerItems || [];
            if (siteLedgers.length === 0) {
                if (!failedSites.includes(entry.site?.siteName)) failedSites.push(entry.site?.siteName || 'Unknown Site');
            }

            let defaultLedger = '';
            let defaultRate = 0;

            // Step 1: Try to find the best site ledger match using AMOUNT
            const matchByAmount = entry.amount > 0
                ? siteLedgers.find(l => Number(l.amount) === Number(entry.amount))
                : null;

            // Step 2: Try to match by saved ledger NAME (case-insensitive)
            const matchByName = entry.ledger && entry.ledger.trim()
                ? siteLedgers.find(l => (l.ledger || '').trim().toLowerCase() === entry.ledger.trim().toLowerCase())
                : null;

            if (matchByAmount) {
                // Amount match wins — this uniquely identifies which ledger was applied
                defaultLedger = matchByAmount.ledger;
                defaultRate = matchByAmount.amount;
            } else if (matchByName) {
                // Name matches but amount doesn't have a matching ledger → use name + entry amount
                defaultLedger = matchByName.ledger;
                defaultRate = entry.amount > 0 ? entry.amount : matchByName.amount;
            } else if (entry.ledger && entry.ledger.trim()) {
                // Ledger name was saved but doesn't exist in site master anymore → keep it
                defaultLedger = entry.ledger.trim();
                defaultRate = entry.amount || 0;
            } else if (siteLedgers.length > 0) {
                // Nothing matches → fallback to first site ledger
                defaultLedger = siteLedgers[0].ledger;
                defaultRate = siteLedgers[0].amount;
            }

            const matchedLedgerItem = matchByAmount || matchByName || (defaultLedger ? siteLedgers.find(l => (l.ledger || '').trim().toLowerCase() === defaultLedger.trim().toLowerCase()) : null) || siteLedgers[0];
            const defaultHsnSac = matchedLedgerItem?.hsnSac || '';
            const defaultShortName = matchedLedgerItem?.shortName || entry.shortName || '';
            const defaultLedgerName = defaultLedger || entry.ledger || entry.scheduleType || 'VISIT';

            initialConfigs[entry._id] = {
                ledger: defaultLedger,
                ledgerName: defaultLedgerName,
                shortName: defaultShortName,
                hsnSac: defaultHsnSac,
                rate: defaultRate,
                qty: 1,
                instrument: 'Total Station',
                extraDescription: ''
            };
        });

        if (failedSites.length > 0) {
            setMissingLedgerSitesModal({
                isOpen: true,
                sites: failedSites.map(name => ({ siteName: name }))
            });
            return;
        }

        // Fetch fresh company details from Company Master so latest stamp and logo are guaranteed
        let freshCompanies = companies;
        try {
            const compRes = await api.get('/company-master');
            if (compRes.data.success && compRes.data.data.length > 0) {
                freshCompanies = compRes.data.data;
                setCompanies(freshCompanies);
            }
        } catch (e) {
            console.error("Error fetching companies in validateAndPrepareGlobalInvoice", e);
        }

        // Grab existing details if available (e.g. from a previously generated Proforma)
        const existingDetails = entriesToInvoice.find(e => e.invoiceDetails)?.invoiceDetails;

        const baseClient = entriesToInvoice[0].client;
        const baseSite = entriesToInvoice[0].site;

        // Auto-fill Buyer Details from existing or fallback to Client Master
        const buyerDetailsObj = existingDetails?.buyerDetails || {
            name: baseClient?.clientName || 'NA',
            address: baseClient?.clientAddress || 'NA',
            gstin: baseClient?.gstNo || 'NA',
            stateName: baseClient?.state || 'Gujarat',
            stateCode: baseClient?.stateCode || '24',
            contactPerson: baseClient?.contactPerson?.name || 'NA',
            contact: baseClient?.contactPerson?.phone || (baseClient?.contactNumbers?.[0] || 'NA'),
        };

        // Auto-fill Ship To Details
        const shipToDetailsObj = existingDetails?.shipToDetails || { ...buyerDetailsObj };

        // Attempt to retain previously selected company or fallback to first
        let initialCompany = freshCompanies.length > 0 ? freshCompanies[0] : null;
        if (existingDetails?.companyDetails) {
            const matchedComp = freshCompanies.find(c => String(c._id) === String(existingDetails.companyDetails._id) || c.prefix === existingDetails.companyDetails.prefix);
            if (matchedComp) initialCompany = matchedComp;
        }

        // Determine next Invoice ID based on Financial Year and selected Company Prefix
        const actualType = type === 'CASH_UPI' ? 'FINAL' : type;
        const nextInvoiceId = generateNextInvoiceId(schedules, actualType, initialCompany);

        // Auto-fill Entry Configs (rates, items) from existing
        if (existingDetails?.entryConfigs) {
            Object.keys(existingDetails.entryConfigs).forEach(entryId => {
                if (initialConfigs[entryId]) {
                    initialConfigs[entryId] = { ...initialConfigs[entryId], ...existingDetails.entryConfigs[entryId] };
                }
            });
        }

        setInvoiceForm({
            isOpen: true,
            type: actualType,
            paymentMode: type === 'CASH_UPI' ? 'Cash/UPI' : 'Credit',
            isCashUpi: type === 'CASH_UPI',
            includeDates: true,
            entries: entriesToInvoice,
            entryConfigs: initialConfigs,
            companyDetails: initialCompany,
            buyerDetails: buyerDetailsObj,
            shipToDetails: shipToDetailsObj,
            invoiceId: nextInvoiceId,
            description: existingDetails?.description || '',
            targetGroup: null, // No longer bound to a single group
            gstType: existingDetails?.gstType || (((baseSite?.stateCode || baseClient?.stateCode || '24') === '24') ? 'CGST_SGST' : 'IGST'),
            gstPercentage: existingDetails?.gstPercentage || 18
        });
    };

    const handleSubmitInvoiceForm = async () => {
        try {
            setLoading(true);

            let subTotal = 0;
            Object.values(invoiceForm.entryConfigs || {}).forEach(conf => {
                const r = Number(conf.rate || 0);
                const q = Number(conf.qty !== undefined ? conf.qty : 1);
                subTotal += r * q;
            });
            const gstPct = Number(invoiceForm.gstPercentage || 18);
            const taxAmount = subTotal * (gstPct / 100);
            const totalAmount = subTotal + taxAmount;

            // Build the pdf HTML
            const pdfHtml = generateInvoiceHtml(invoiceForm, invoiceForm.entries, invoiceForm.type);

            // Call generate-invoice endpoint
            const res = await api.post('/schedule-master/generate-invoice', {
                entryIds: invoiceForm.entries.map(e => e._id),
                invoiceType: invoiceForm.type === 'PROFORMA' ? 'proforma' : 'final',
                invoiceId: invoiceForm.invoiceId,
                invoiceDetails: {
                    invoiceId: invoiceForm.invoiceId,
                    companyDetails: invoiceForm.companyDetails,
                    buyerDetails: invoiceForm.buyerDetails,
                    shipToDetails: invoiceForm.shipToDetails,
                    description: invoiceForm.description,
                    entryConfigs: invoiceForm.entryConfigs,
                    gstType: invoiceForm.gstType,
                    gstPercentage: invoiceForm.gstPercentage,
                    subTotal,
                    taxAmount,
                    totalAmount,
                    grandTotal: totalAmount,
                    generatedAt: new Date().toISOString()
                },
                pdfHtml
            });

            if (res.data.success) {
                toast({ title: 'Invoice Generated successfully!', status: 'success' });
                const returnedPdfUrl = res.data.data?.pdfUrl || pdfUrl;
                const invType = invoiceForm.type === 'PROFORMA' ? 'proforma' : 'final';
                const clientPhone = invoiceForm.buyerDetails?.contact || invoiceForm.buyerDetails?.phone || invoiceForm.entries?.[0]?.client?.phone || '';
                const cleanPhone = (clientPhone || '').replace(/\D/g, '');

                if (returnedPdfUrl) {
                    setTimeout(() => {
                        setWhatsappModal({
                            isOpen: true,
                            phone: cleanPhone,
                            pdfUrl: returnedPdfUrl,
                            invoiceId: invoiceForm.invoiceId,
                            invoiceType: invType,
                            clientName: invoiceForm.buyerDetails?.name || invoiceForm.buyerDetails?.companyName || 'Valued Client',
                            isSending: false
                        });
                    }, 500);
                }
            } else {
                toast({ title: 'Warning', description: res.data.message, status: 'warning' });
            }
            setInvoiceForm(prev => ({ ...prev, isOpen: false }));
            setSelectedGroup(null);
            setSelectedEntries([]); // Clear global selection state
            fetchVisitSchedules();
        } catch (error) {
            toast({ title: 'Failed to generate invoice', status: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmCashUpi = async () => {
        if (selectedEntries.length === 0) {
            toast({ title: 'No entries selected', status: 'warning' });
            return;
        }

        try {
            setCashUpiModal(prev => ({ ...prev, isSubmitting: true }));
            const closedDateIso = cashUpiModal.closedDate ? new Date(cashUpiModal.closedDate).toISOString() : new Date().toISOString();
            const amtNum = Number(cashUpiModal.paymentAmount) || 0;
            const modeStr = cashUpiModal.mode;
            const recStr = (cashUpiModal.receiverName || '').trim();
            const txStr = cashUpiModal.mode === 'UPI' ? (cashUpiModal.transactionNo || '').trim() : '';
            const endRemarkStr = (cashUpiModal.remark || '').trim();

            // Construct clean formatted summary remark
            let formattedRemark = `[${modeStr}]`;
            if (recStr) {
                formattedRemark += ` Receiver: ${recStr}`;
            }
            if (modeStr === 'UPI' && txStr) {
                formattedRemark += `${recStr ? ' |' : ''} Txn: ${txStr}`;
            }
            if (amtNum > 0) {
                formattedRemark += ` | Amount: ₹${amtNum.toLocaleString('en-IN')}`;
            }
            if (endRemarkStr) {
                formattedRemark += ` | Remark: ${endRemarkStr}`;
            }

            for (const entryId of selectedEntries) {
                await api.patch(`/schedule-master/invoice-status/${entryId}`, {
                    invoiceStatus: 'Closed',
                    paymentMode: modeStr,
                    receiverName: recStr,
                    transactionNo: txStr,
                    paymentAmount: amtNum,
                    paymentRemark: formattedRemark,
                    closedDate: closedDateIso
                });
            }

            toast({
                title: `Paid via ${modeStr}`,
                description: `${selectedEntries.length} entries marked as paid & moved to Closed status.`,
                status: 'success',
                duration: 4000
            });

            setCashUpiModal({
                isOpen: false,
                mode: 'UPI',
                receiverName: '',
                transactionNo: '',
                paymentAmount: '',
                closedDate: new Date().toISOString().split('T')[0],
                remark: '',
                isSubmitting: false
            });
            setSelectedGroup(null);
            setSelectedEntries([]);
            fetchVisitSchedules();
        } catch (err) {
            toast({ title: 'Failed to process payment', status: 'error' });
            setCashUpiModal(prev => ({ ...prev, isSubmitting: false }));
        }
    };

    const handleStatusMove = async (group, newStatus) => {
        try {
            setLoading(true);
            const entriesToMove = group.entries.filter(e => selectedEntries.includes(e._id));
            if (entriesToMove.length === 0) {
                toast({ title: 'No entries selected', status: 'warning' });
                return;
            }
            for (const entry of entriesToMove) {
                await api.patch(`/schedule-master/invoice-status/${entry._id}`, { invoiceStatus: newStatus });
            }
            toast({ title: `Moved to ${newStatus}`, status: 'success' });
            setSelectedGroup(null);
            fetchVisitSchedules();
        } catch (e) {
            toast({ title: 'Error moving entries', status: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box py={{ base: 3, md: 6 }} bg="gray.50" minH="100vh" pb={{ base: "90px", md: 10 }}>
            <Container maxW="container.xl" px={{ base: 2, sm: 3, md: 6 }}>
                {!isInsideServices && <ModulePermissionBar moduleGroupKey="otherServicesGroup" subModuleFilterKey="invoiceReport" />}
                <VStack spacing={{ base: 4, md: 6 }} align="stretch">

                    {/* ── Header ── */}
                    <Flex align="center" justify="space-between" bg="white" p={{ base: 4, sm: 5, md: 6 }} borderRadius="2xl" shadow="sm" border="1px solid" borderColor="gray.100">
                        <HStack spacing={{ base: 3, md: 4 }}>
                            <Box bgGradient="linear(to-br, blue.600, purple.600)" p={{ base: 2.5, md: 3 }} borderRadius="xl" color="white">
                                <Icon as={FaFileInvoiceDollar} w={{ base: 5, md: 6 }} h={{ base: 5, md: 6 }} />
                            </Box>
                            <VStack align="start" spacing={0}>
                                <Heading size={{ base: "md", md: "lg" }} bgGradient="linear(to-r, blue.600, purple.600)" bgClip="text">Invoice Report</Heading>
                                <Text color="gray.500" fontSize={{ base: "xs", md: "sm" }}>Track & generate invoices grouped by client and site</Text>
                            </VStack>
                        </HStack>
                        <IconButton
                            icon={<FaSyncAlt />}
                            colorScheme="blue"
                            variant="ghost"
                            borderRadius="full"
                            onClick={fetchVisitSchedules}
                            isLoading={loading}
                            aria-label="Refresh"
                            size={{ base: "sm", md: "md" }}
                        />
                    </Flex>

                    {/* ── Closed Tab Summary Stats Cards (When Closed Tab Active) ── */}
                    {activeTab === 4 ? (
                        <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={{ base: 2.5, md: 4 }}>
                            <Card borderRadius="2xl" shadow="sm" bg="black" color="white" border="1px solid" borderColor="gray.800">
                                <CardBody p={{ base: 3.5, md: 5 }}>
                                    <HStack justify="space-between">
                                        <VStack align="start" spacing={1}>
                                            <Text fontSize="xs" color="gray.400" fontWeight="bold" textTransform="uppercase" letterSpacing="wider">🔒 Total Amount Closed</Text>
                                            <Heading size={{ base: "md", md: "lg" }} color="white" fontWeight="900">₹{closedSummaryStats.totalAmt.toLocaleString('en-IN')}</Heading>
                                            <Badge colorScheme="green" variant="solid" borderRadius="full" px={2.5} fontSize="10px">{closedSummaryStats.count} Closed Invoices</Badge>
                                        </VStack>
                                        <Box bg="whiteAlpha.200" p={{ base: 2.5, md: 3 }} borderRadius="2xl">
                                            <Icon as={FaCheckCircle} w={{ base: 6, md: 8 }} h={{ base: 6, md: 8 }} color="emerald.400" />
                                        </Box>
                                    </HStack>
                                </CardBody>
                            </Card>

                            <Card borderRadius="2xl" shadow="sm" bg="gray.900" color="white" border="1px solid" borderColor="gray.800">
                                <CardBody p={{ base: 3.5, md: 5 }}>
                                    <HStack justify="space-between">
                                        <VStack align="start" spacing={1}>
                                            <Text fontSize="xs" color="purple.300" fontWeight="bold" textTransform="uppercase" letterSpacing="wider">💳 Closed with UPI</Text>
                                            <Heading size={{ base: "md", md: "lg" }} color="white" fontWeight="900">₹{closedSummaryStats.upiAmt.toLocaleString('en-IN')}</Heading>
                                            <Badge colorScheme="purple" variant="solid" borderRadius="full" px={2.5} fontSize="10px">UPI Transfer</Badge>
                                        </VStack>
                                        <Box bg="purple.900" p={{ base: 2.5, md: 3 }} borderRadius="2xl">
                                            <Icon as={FaMoneyBillWave} w={{ base: 6, md: 8 }} h={{ base: 6, md: 8 }} color="purple.300" />
                                        </Box>
                                    </HStack>
                                </CardBody>
                            </Card>

                            <Card borderRadius="2xl" shadow="sm" bg="gray.900" color="white" border="1px solid" borderColor="gray.800">
                                <CardBody p={{ base: 3.5, md: 5 }}>
                                    <HStack justify="space-between">
                                        <VStack align="start" spacing={1}>
                                            <Text fontSize="xs" color="teal.300" fontWeight="bold" textTransform="uppercase" letterSpacing="wider">💵 Closed with CASH</Text>
                                            <Heading size={{ base: "md", md: "lg" }} color="white" fontWeight="900">₹{closedSummaryStats.cashAmt.toLocaleString('en-IN')}</Heading>
                                            <Badge colorScheme="teal" variant="solid" borderRadius="full" px={2.5} fontSize="10px">Cash Received</Badge>
                                        </VStack>
                                        <Box bg="teal.900" p={{ base: 2.5, md: 3 }} borderRadius="2xl">
                                            <Icon as={FaMoneyBillWave} w={{ base: 6, md: 8 }} h={{ base: 6, md: 8 }} color="teal.300" />
                                        </Box>
                                    </HStack>
                                </CardBody>
                            </Card>
                        </SimpleGrid>
                    ) : (
                        <SimpleGrid columns={{ base: 2, sm: 3, md: 5 }} spacing={{ base: 2.5, md: 4 }}>
                            {[
                                { label: 'Total Visits', value: stats.total, color: 'blue', icon: FaBuilding },
                                { label: 'Pending Bills', value: stats.pending, color: 'orange', icon: FaClock },
                                { label: 'Completed Bills', value: stats.completed, color: 'green', icon: FaCheckCircle },
                                { label: 'Full Day', value: stats.fullDay, color: 'teal', icon: FaCalendarAlt },
                                { label: 'Half Day', value: stats.halfDay, color: 'purple', icon: FaCalendarAlt },
                            ].map(({ label, value, color, icon }) => (
                                <Card key={label} borderRadius="xl" shadow="sm" border="1px solid" borderColor={`${color}.100`} bg={`${color}.50`}>
                                    <CardBody p={{ base: 3, md: 4 }}>
                                        <HStack justify="space-between">
                                            <VStack align="start" spacing={0}>
                                                <Text fontSize="2xs" color={`${color}.600`} fontWeight="bold" textTransform="uppercase">{label}</Text>
                                                <Heading size={{ base: "md", md: "xl" }} color={`${color}.700`}>{value}</Heading>
                                            </VStack>
                                            <Icon as={icon} w={{ base: 5, md: 7 }} h={{ base: 5, md: 7 }} color={`${color}.300`} />
                                        </HStack>
                                    </CardBody>
                                </Card>
                            ))}
                        </SimpleGrid>
                    )}

                    {/* ── Tabs & Global Actions ── */}
                    <Flex justify="space-between" align={{ base: "stretch", md: "center" }} direction={{ base: "column", md: "row" }} gap={3}>
                        <Tabs variant="soft-rounded" colorScheme="blue" index={activeTab} onChange={(idx) => { setActiveTab(idx); setSelectedGroup(null); setSelectedEntries([]); }}>
                            <TabList
                                bg="white"
                                p={{ base: 1.5, md: 2 }}
                                borderRadius="xl"
                                shadow="sm"
                                border="1px solid"
                                borderColor="gray.100"
                                overflowX="auto"
                                whiteSpace="nowrap"
                                gap={{ base: 1, md: 2 }}
                                sx={{
                                    WebkitOverflowScrolling: 'touch',
                                    scrollbarWidth: 'none',
                                    '&::-webkit-scrollbar': { display: 'none' }
                                }}
                            >
                                <Tab fontWeight="bold" fontSize={{ base: "xs", md: "sm" }} px={{ base: 3, md: 4 }} py={{ base: 2, md: 2.5 }} flexShrink={0}>⏳ Pending</Tab>
                                <Tab fontWeight="bold" fontSize={{ base: "xs", md: "sm" }} px={{ base: 3, md: 4 }} py={{ base: 2, md: 2.5 }} flexShrink={0}>📄 Proforma</Tab>
                                <Tab fontWeight="bold" fontSize={{ base: "xs", md: "sm" }} px={{ base: 3, md: 4 }} py={{ base: 2, md: 2.5 }} flexShrink={0}>✅ Final Invoice</Tab>
                                <Tab fontWeight="bold" fontSize={{ base: "xs", md: "sm" }} px={{ base: 3, md: 4 }} py={{ base: 2, md: 2.5 }} flexShrink={0}>🔔 Payment Reminder</Tab>
                                <Tab fontWeight="bold" fontSize={{ base: "xs", md: "sm" }} px={{ base: 3, md: 4 }} py={{ base: 2, md: 2.5 }} flexShrink={0}>🔒 Closed</Tab>
                            </TabList>
                        </Tabs>

                        {selectedEntries.length > 0 && (
                            <HStack bg="white" p={2} borderRadius="xl" shadow="sm" border="1px solid" borderColor="gray.100" justify="space-between">
                                <HStack spacing={2} px={2} mr={2} borderRight="1px solid" borderColor="gray.200">
                                    <Text fontSize="sm" fontWeight="bold" color="blue.600">
                                        {selectedEntries.length} selected ({activeSelectedClientName})
                                    </Text>
                                    <Button size="xs" variant="ghost" colorScheme="red" onClick={() => setSelectedEntries([])}>Clear</Button>
                                </HStack>
                            </HStack>
                        )}
                    </Flex>

                    {/* ── Filters (For Pending, Proforma, Final, Closed tabs) ── */}
                    {activeTab !== 3 && (
                        <Card borderRadius="2xl" shadow="sm" border="1px solid" borderColor="gray.100">
                            <CardBody p={{ base: 3.5, md: 5 }}>
                                <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing={{ base: 3, md: 4 }} alignItems="flex-end">
                                    <InputGroup>
                                        <InputLeftElement><Icon as={FaSearch} color="gray.400" /></InputLeftElement>
                                        <Input
                                            placeholder="Search client, site, operative..."
                                            value={search}
                                            onChange={e => setSearch(e.target.value)}
                                            borderRadius="xl"
                                            bg="gray.50"
                                            fontSize="xs"
                                        />
                                    </InputGroup>
                                    <Select placeholder="All Ledger Types" value={filterLedger} onChange={e => setFilterLedger(e.target.value)} borderRadius="xl" bg="gray.50" fontSize="xs">
                                        <option value="Full Day">Full Day</option>
                                        <option value="Half Day">Half Day</option>
                                    </Select>
                                    <Input type="date" placeholder="From Date" value={filterDateFrom} onChange={e => setFilterDateFrom(e.target.value)} borderRadius="xl" bg="gray.50" fontSize="xs" />
                                    <Input type="date" placeholder="To Date" value={filterDateTo} onChange={e => setFilterDateTo(e.target.value)} borderRadius="xl" bg="gray.50" fontSize="xs" />
                                </SimpleGrid>
                            </CardBody>
                        </Card>
                    )}

                    {/* ── Payment Reminder Full UI ── */}
                    {activeTab === 3 ? (
                        <VStack align="stretch" spacing={5}>

                            {/* ── Dashboard Summary Cards ── */}
                            <SimpleGrid columns={{ base: 2, md: 5 }} spacing={3}>
                                {[
                                    { label: 'Total Billed', value: `₹${reminderStats.totalBilled.toLocaleString('en-IN')}`, color: 'purple', icon: FaMoneyBillWave },
                                    { label: 'Pending Amount', value: `₹${reminderStats.pending.toLocaleString('en-IN')}`, color: 'orange', icon: FaClock },
                                    { label: 'Tax Invoices', value: reminderStats.taxCount, color: 'green', icon: FaCheckCircle },
                                    { label: 'Proforma Invoices', value: reminderStats.proformaCount, color: 'blue', icon: FaFileAlt },
                                    { label: 'Overdue', value: reminderStats.overdue, color: 'red', icon: FaExclamationTriangle },
                                ].map(({ label, value, color, icon }) => (
                                    <Card key={label} borderRadius="2xl" shadow="sm" border="1px solid" borderColor={`${color}.100`} bg={`${color}.50`}>
                                        <CardBody p={4}>
                                            <HStack justify="space-between">
                                                <VStack align="start" spacing={0}>
                                                    <Text fontSize="10px" color={`${color}.600`} fontWeight="bold" textTransform="uppercase" letterSpacing="wide">{label}</Text>
                                                    <Text fontSize="xl" fontWeight="black" color={`${color}.700`}>{value}</Text>
                                                </VStack>
                                                <Icon as={icon} w={7} h={7} color={`${color}.200`} />
                                            </HStack>
                                        </CardBody>
                                    </Card>
                                ))}
                            </SimpleGrid>

                            {/* ── Filter / Search Bar ── */}
                            <Card borderRadius="2xl" shadow="sm" border="1px solid" borderColor="purple.100">
                                <CardBody p={4}>
                                    <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing={3} alignItems="flex-end">
                                        <InputGroup size="sm">
                                            <InputLeftElement pointerEvents="none"><Icon as={FaSearch} color="purple.400" /></InputLeftElement>
                                            <Input
                                                placeholder="Search client, site, invoice..."
                                                bg="white" borderRadius="xl" border="1px solid" borderColor="purple.200"
                                                value={reminderSearch}
                                                onChange={e => setReminderSearch(e.target.value)}
                                            />
                                        </InputGroup>
                                        <Select
                                            size="sm" bg="white" borderRadius="xl" border="1px solid" borderColor="purple.200"
                                            value={reminderInvoiceTypeFilter}
                                            onChange={e => setReminderInvoiceTypeFilter(e.target.value)}
                                        >
                                            <option value="">All Invoice Types</option>
                                            <option value="TAX">Tax Invoice</option>
                                            <option value="PROFORMA">Proforma Only</option>
                                        </Select>
                                        <Select
                                            size="sm" bg="white" borderRadius="xl" border="1px solid" borderColor="purple.200"
                                            value={reminderPaymentStatusFilter}
                                            onChange={e => setReminderPaymentStatusFilter(e.target.value)}
                                        >
                                            <option value="">All Payment Status</option>
                                            <option value="PENDING">Pending</option>
                                            <option value="PARTIAL">Partial</option>
                                            <option value="OVERDUE">Overdue</option>
                                            <option value="PAID">Paid</option>
                                        </Select>
                                        <Select
                                            size="sm" bg="white" borderRadius="xl" border="1px solid" borderColor="purple.200"
                                            value={reminderCompanyId}
                                            onChange={e => setReminderCompanyId(e.target.value)}
                                        >
                                            <option value="">All Companies</option>
                                            {companies.map(c => <option key={c._id} value={c._id}>{c.companyName}</option>)}
                                        </Select>
                                    </SimpleGrid>
                                </CardBody>
                            </Card>

                            {/* ── Client Cards ── */}
                            {loading ? (
                                <VStack spacing={3}>
                                    {[1, 2, 3].map(i => (
                                        <Card key={i} borderRadius="2xl" shadow="sm" border="1px solid" borderColor="gray.100" w="full">
                                            <CardBody p={5}>
                                                <HStack spacing={4}>
                                                    <Box w="48px" h="48px" borderRadius="2xl" bg="purple.100" />
                                                    <VStack align="start" flex={1} spacing={2}>
                                                        <Box h="14px" w="180px" bg="gray.200" borderRadius="md" />
                                                        <Box h="10px" w="120px" bg="gray.100" borderRadius="md" />
                                                    </VStack>
                                                    <Box h="14px" w="80px" bg="gray.200" borderRadius="md" />
                                                </HStack>
                                            </CardBody>
                                        </Card>
                                    ))}
                                </VStack>
                            ) : reminderData.length === 0 ? (
                                <Card borderRadius="2xl" shadow="sm" border="1px solid" borderColor="gray.100">
                                    <CardBody p={16} textAlign="center">
                                        <VStack spacing={4}>
                                            <Icon as={FaFileInvoiceDollar} w={14} h={14} color="purple.200" />
                                            <Text fontWeight="black" color="gray.500" fontSize="xl">No Payment Reminders</Text>
                                            <Text fontSize="sm" color="gray.400" maxW="360px">
                                                There are currently no clients with generated Proforma or Tax Invoices.
                                                {reminderCompanyId ? ' Try selecting a different company.' : ''}
                                            </Text>
                                        </VStack>
                                    </CardBody>
                                </Card>
                            ) : (
                                <VStack align="stretch" spacing={4}>
                                    <Text fontSize="xs" color="gray.400" fontWeight="bold">
                                        {reminderData.length} CLIENT{reminderData.length !== 1 ? 'S' : ''} • {reminderStats.total} INVOICE{reminderStats.total !== 1 ? 'S' : ''}
                                    </Text>
                                    {reminderData.map((group) => {
                                        const isExpanded = expandedClientIds.includes(group.clientId);
                                        const totalAmt = group.invoices.reduce((s, i) => s + Number(i.totalAmt || 0), 0);
                                        const pendingAmt = group.invoices.filter(i => i.paymentStatus !== 'PAID').reduce((s, i) => s + Number(i.totalAmt || 0), 0);
                                        const hasOverdue = group.invoices.some(i => i.paymentStatus === 'OVERDUE');
                                        const allPaid = group.invoices.every(i => i.paymentStatus === 'PAID');
                                        const siteCount = group.invoices.flatMap(i => i.sites).filter((s, idx, arr) => s && arr.findIndex(x => (x?._id || x?.siteName) === (s?._id || s?.siteName)) === idx).length;

                                        const unpaidInvs = group.invoices.filter(i => i.paymentStatus !== 'PAID' && (i.nextFollowUp || (i.followUps && i.followUps.length > 0)));
                                        let earliestDate = null;
                                        unpaidInvs.forEach(i => {
                                            let dStr = null;
                                            if (i.nextFollowUp) dStr = i.nextFollowUp;
                                            else if (i.followUps && i.followUps.length > 0) dStr = i.followUps[i.followUps.length - 1].nextFollowUpDate;
                                            if (dStr) {
                                                const d = new Date(dStr);
                                                if (!earliestDate || d < earliestDate) earliestDate = d;
                                            }
                                        });
                                        let nClientStr = null; let bClientCol = null; let nClientLabel = null;
                                        if (earliestDate) {
                                            nClientStr = formatDate(earliestDate);
                                            const todayStr = new Date().toISOString().split('T')[0];
                                            const fnStr = earliestDate.toISOString().split('T')[0];
                                            if (fnStr < todayStr) { bClientCol = 'red'; nClientLabel = 'OVERDUE'; }
                                            else if (fnStr === todayStr) { bClientCol = 'orange'; nClientLabel = 'TODAY'; }
                                            else { bClientCol = 'purple'; nClientLabel = 'UPCOMING'; }
                                        }

                                        const toggleExpand = () => setExpandedClientIds(prev =>
                                            prev.includes(group.clientId) ? prev.filter(id => id !== group.clientId) : [...prev, group.clientId]
                                        );

                                        return (
                                            <Card
                                                key={group.clientId}
                                                borderRadius="2xl"
                                                shadow="sm"
                                                border="1px solid"
                                                borderColor={hasOverdue ? 'red.200' : 'gray.200'}
                                                overflow="hidden"
                                                transition="all 0.2s"
                                                _hover={{ shadow: 'md' }}
                                            >
                                                {/* ── Client Header Row (Opens Popup Modal on Click) ── */}
                                                <CardBody
                                                    p={5}
                                                    bg={hasOverdue ? 'red.50' : 'white'}
                                                    cursor="pointer"
                                                    onClick={() => {
                                                        setSelectedClientModal(group);
                                                        setClientModalTab(0);
                                                    }}
                                                    _hover={{ bg: hasOverdue ? 'red.50' : 'gray.50' }}
                                                >
                                                    <Flex justify="space-between" align={{ base: "flex-start", sm: "center" }} direction={{ base: "column", sm: "row" }} wrap="wrap" gap={3}>
                                                        <HStack spacing={{ base: 3, md: 4 }} align="flex-start">
                                                            <Box
                                                                p={{ base: 2.5, md: 3 }}
                                                                bg={hasOverdue ? 'red.50' : 'gray.800'}
                                                                color={hasOverdue ? 'red.500' : 'white'}
                                                                borderRadius="xl"
                                                                boxShadow="sm"
                                                                mt={0.5}
                                                            >
                                                                <Icon as={FaBuilding} w={{ base: 4, md: 5 }} h={{ base: 4, md: 5 }} />
                                                            </Box>
                                                            <VStack align="start" spacing={0.5}>
                                                                <HStack spacing={2} wrap="wrap">
                                                                    <Text fontSize={{ base: "sm", md: "md" }} fontWeight="black" color="gray.800">
                                                                        {group.clientName}
                                                                    </Text>
                                                                    {hasOverdue && <Badge bg="red.50" color="red.600" borderRadius="full" px={2} fontSize="10px" border="1px solid" borderColor="red.200">⚠️ OVERDUE</Badge>}
                                                                    {allPaid && <Badge bg="green.50" color="green.600" borderRadius="full" px={2} fontSize="10px" border="1px solid" borderColor="green.200">✅ ALL PAID</Badge>}
                                                                    {earliestDate && (
                                                                        <Badge bg={hasOverdue ? 'red.500' : 'gray.700'} color="white" borderRadius="full" px={2.5} py={0.5} fontSize="10px" fontWeight="bold">
                                                                            🔔 FOLLOW-UP {nClientLabel}: {nClientStr}
                                                                        </Badge>
                                                                    )}
                                                                    <Badge bg="gray.100" color="gray.600" borderRadius="full" px={2.5} py={0.5} fontSize="10px" fontWeight="bold">
                                                                        {group.invoices.length} Invoice{group.invoices.length !== 1 ? 's' : ''}
                                                                    </Badge>
                                                                    <Badge bg="gray.100" color="gray.600" borderRadius="full" px={2.5} py={0.5} fontSize="10px" fontWeight="bold">
                                                                        {group.invoices.flatMap(i => i.sites).filter((s, idx, arr) => s && arr.findIndex(x => (x?._id || x?.siteName) === (s?._id || s?.siteName)) === idx).length} Site(s)
                                                                    </Badge>
                                                                </HStack>
                                                                {group.clientObj?.clientAddress && (
                                                                    <Text fontSize="2xs" color="gray.500" noOfLines={1}>
                                                                        📍 {group.clientObj.clientAddress}{group.clientObj?.state ? `, ${group.clientObj.state}` : ''}
                                                                    </Text>
                                                                )}
                                                                <HStack spacing={3} wrap="wrap">
                                                                    {(group.clientObj?.contactPerson?.phone || group.clientObj?.contactNumbers?.[0]) && (
                                                                        <Text fontSize="2xs" color="gray.500">📞 {group.clientObj?.contactPerson?.phone || group.clientObj?.contactNumbers?.[0]}</Text>
                                                                    )}
                                                                    {group.clientObj?.email && <Text fontSize="2xs" color="gray.500">✉️ {group.clientObj.email}</Text>}
                                                                </HStack>
                                                            </VStack>
                                                        </HStack>

                                                        <Flex justify={{ base: "space-between", sm: "flex-end" }} align="center" w={{ base: "full", sm: "auto" }} wrap="wrap" gap={{ base: 3, md: 6 }} pt={{ base: 2, sm: 0 }} borderTop={{ base: "1px dashed", sm: "none" }} borderColor="gray.200">
                                                            <HStack spacing={4}>
                                                                <VStack align="start" spacing={0}>
                                                                    <Text fontSize="2xs" fontWeight="bold" color="gray.500" textTransform="uppercase">Total Billed</Text>
                                                                    <Text fontSize={{ base: "sm", md: "lg" }} fontWeight="black" color="gray.800">₹{totalAmt.toLocaleString('en-IN')}</Text>
                                                                </VStack>
                                                                {pendingAmt > 0 && (
                                                                    <VStack align="start" spacing={0}>
                                                                        <Text fontSize="2xs" fontWeight="bold" color="gray.500" textTransform="uppercase">Pending</Text>
                                                                        <Text fontSize={{ base: "sm", md: "lg" }} fontWeight="black" color={hasOverdue ? 'red.600' : 'gray.800'}>₹{pendingAmt.toLocaleString('en-IN')}</Text>
                                                                    </VStack>
                                                                )}
                                                            </HStack>
                                                            <Button
                                                                size="xs"
                                                                bg={hasOverdue ? 'red.600' : 'gray.800'}
                                                                color="white"
                                                                _hover={{ bg: hasOverdue ? 'red.700' : 'black' }}
                                                                borderRadius="full"
                                                                leftIcon={<FaEye />}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setSelectedClientModal(group);
                                                                    setClientModalTab(0);
                                                                }}
                                                            >
                                                                View Invoices & Sites
                                                            </Button>
                                                        </Flex>
                                                    </Flex>
                                                </CardBody>
                                            </Card>
                                        );
                                    })}
                                </VStack>
                            )}

                            {/* ── Client Invoices & Sites Pop-Up Modal ── */}
                            <Modal
                                isOpen={!!selectedClientModal}
                                onClose={() => setSelectedClientModal(null)}
                                size="full"
                                isCentered
                                scrollBehavior="inside"
                                isLazy
                                unmountOnClose
                            >
                                <ModalOverlay bg="blackAlpha.700" />
                                <ModalContent maxW={{ base: "98vw", lg: "95vw", xl: "1480px" }} w="100%" borderRadius={{ base: "2xl", md: "3xl" }} overflow="hidden" maxH="94vh">
                                    {selectedClientModal && (() => {
                                        const group = selectedClientModal;
                                        const client = group.clientObj || {};
                                        const totalAmt = group.invoices.reduce((s, i) => s + Number(i.totalAmt || 0), 0);
                                        const pendingAmt = group.invoices.filter(i => i.paymentStatus !== 'PAID').reduce((s, i) => s + Number(i.totalAmt || 0), 0);
                                        const paidAmt = Math.max(0, totalAmt - pendingAmt);
                                        const allSites = group.invoices.flatMap(i => i.sites).filter((s, idx, arr) => s && arr.findIndex(x => (x?._id || x?.siteName) === (s?._id || s?.siteName)) === idx);

                                        return (
                                            <Tabs index={clientModalTab} onChange={(idx) => setClientModalTab(idx)} variant="enclosed" isLazy display="flex" flexDirection="column" h="full" flex={1} overflow="hidden">
                                                <ModalHeader p={0}>
                                                    <Box bg="gray.800" p={{ base: 4, md: 6 }} borderBottom="1px solid" borderColor="gray.900">
                                                        <Flex justify="space-between" align={{ base: "flex-start", md: "center" }} direction={{ base: "column", md: "row" }} wrap="wrap" gap={4}>
                                                            <HStack spacing={{ base: 3, md: 4 }}>
                                                                <Box p={{ base: 2.5, md: 3.5 }} bg="gray.700" color="white" borderRadius="2xl" shadow="sm" border="1px solid" borderColor="gray.600">
                                                                    <Icon as={FaBuilding} w={{ base: 5, md: 7 }} h={{ base: 5, md: 7 }} />
                                                                </Box>
                                                                <VStack align="start" spacing={1}>
                                                                    <HStack spacing={3} wrap="wrap">
                                                                        <Text fontWeight="black" fontSize={{ base: "lg", md: "2xl" }} color="white">{group.clientName}</Text>
                                                                        {client.clientId && (
                                                                            <Badge bg="gray.700" color="gray.200" borderRadius="full" px={2.5} py={0.5} fontSize="xs">
                                                                                ID: {client.clientId}
                                                                            </Badge>
                                                                        )}
                                                                    </HStack>
                                                                    <HStack spacing={{ base: 2, md: 4 }} wrap="wrap" fontSize="xs" color="gray.400" fontWeight="bold">
                                                                        {client.clientAddress && <Text>📍 {client.clientAddress}</Text>}
                                                                        {(client.contactPerson?.phone || client.contactNumbers?.[0]) && (
                                                                            <Text>📞 {client.contactPerson?.phone || client.contactNumbers?.[0]}</Text>
                                                                        )}
                                                                        {client.email && <Text>✉️ {client.email}</Text>}
                                                                        {client.gstNo && <Text>🧾 GST: {client.gstNo}</Text>}
                                                                    </HStack>
                                                                </VStack>
                                                            </HStack>

                                                            <HStack spacing={{ base: 2, md: 3 }} wrap="wrap" w={{ base: "full", md: "auto" }} justify={{ base: "space-between", md: "flex-end" }}>
                                                                <Box bg="gray.700" border="1px solid" borderColor="gray.600" px={{ base: 2.5, md: 4 }} py={{ base: 1.5, md: 2 }} borderRadius="xl" textAlign="center" flex={{ base: 1, md: "initial" }}>
                                                                    <Text fontSize="9px" textTransform="uppercase" color="gray.400" fontWeight="bold">Invoices</Text>
                                                                    <Text fontSize={{ base: "md", md: "lg" }} fontWeight="black" color="white">{group.invoices.length}</Text>
                                                                </Box>
                                                                <Box bg="gray.700" border="1px solid" borderColor="gray.600" px={{ base: 2.5, md: 4 }} py={{ base: 1.5, md: 2 }} borderRadius="xl" textAlign="center" flex={{ base: 1, md: "initial" }}>
                                                                    <Text fontSize="9px" textTransform="uppercase" color="gray.400" fontWeight="bold">Total Billed</Text>
                                                                    <Text fontSize={{ base: "sm", md: "lg" }} fontWeight="black" color="white">₹{totalAmt.toLocaleString('en-IN')}</Text>
                                                                </Box>
                                                                <Box bg={pendingAmt > 0 ? "red.600" : "green.600"} border="1px solid" borderColor={pendingAmt > 0 ? "red.500" : "green.500"} px={{ base: 2.5, md: 4 }} py={{ base: 1.5, md: 2 }} borderRadius="xl" textAlign="center" flex={{ base: 1, md: "initial" }}>
                                                                    <Text fontSize="9px" textTransform="uppercase" color="white" fontWeight="bold">Pending</Text>
                                                                    <Text fontSize={{ base: "sm", md: "lg" }} fontWeight="black" color="white">₹{pendingAmt.toLocaleString('en-IN')}</Text>
                                                                </Box>
                                                            </HStack>
                                                        </Flex>
                                                    </Box>
                                                    <Box bg="gray.50" px={{ base: 3, md: 6 }} pt={2} borderBottom="1px solid" borderColor="gray.200">
                                                        <TabList 
                                                            borderBottom="none"
                                                            overflowX="auto" 
                                                            overflowY="hidden"
                                                            whiteSpace="nowrap"
                                                            display="flex"
                                                            gap={2}
                                                            sx={{
                                                                WebkitOverflowScrolling: 'touch',
                                                                scrollbarWidth: 'none',
                                                                '&::-webkit-scrollbar': { display: 'none' }
                                                            }}
                                                        >
                                                            <Tab flexShrink={0} fontWeight="black" color="gray.500" fontSize={{ base: "xs", md: "sm" }} _selected={{ color: 'gray.800', bg: 'white', borderColor: 'gray.200', borderBottomColor: 'white' }}>
                                                                🧾 Invoices List ({group.invoices.length})
                                                            </Tab>
                                                            <Tab flexShrink={0} fontWeight="black" color="gray.500" fontSize={{ base: "xs", md: "sm" }} _selected={{ color: 'gray.800', bg: 'white', borderColor: 'gray.200', borderBottomColor: 'white' }}>
                                                                📍 Sites Breakdown ({allSites.length})
                                                            </Tab>
                                                        </TabList>
                                                    </Box>
                                                </ModalHeader>
                                                <ModalCloseButton color="white" top={4} right={4} />

                                                <ModalBody p={{ base: 3, md: 6 }} bg="gray.50" overflowY="auto" flex={1}>
                                                    <TabPanels>
                                                        {/* TAB 1: INVOICES LIST (ROW-WISE TABLE) */}
                                                        <TabPanel p={0}>
                                                            <VStack spacing={3} align="stretch">
                                                                <Box px={1} pb={1}>
                                                                    <Text fontSize="xs" color="gray.600" fontWeight="bold">
                                                                        💡 Click any row below to open the complete invoice details, line items, PDF preview & WhatsApp reminder.
                                                                    </Text>
                                                                </Box>
                                                                <TableContainer border="1.5px solid" borderColor="gray.300" borderRadius="2xl" bg="white" shadow="sm" overflowX="auto">
                                                                    <Table variant="simple" size="sm">
                                                                        <Thead bg="gray.100">
                                                                            <Tr borderBottom="2px solid" borderColor="gray.300">
                                                                                <Th py={3.5} color="gray.800" fontSize="11px" fontWeight="900" w="40px">#</Th>
                                                                                <Th py={3.5} color="gray.800" fontSize="11px" fontWeight="900">INVOICE NO.</Th>
                                                                                <Th py={3.5} color="gray.800" fontSize="11px" fontWeight="900">TYPE</Th>
                                                                                <Th py={3.5} color="gray.800" fontSize="11px" fontWeight="900">BILL DATE</Th>
                                                                                <Th py={3.5} color="gray.800" fontSize="11px" fontWeight="900">SITES COVERED</Th>
                                                                                <Th py={3.5} color="gray.800" fontSize="11px" fontWeight="900" textAlign="center">NEXT FOLLOW-UP</Th>
                                                                                <Th py={3.5} color="gray.800" fontSize="11px" fontWeight="900" textAlign="right">AMOUNT (₹)</Th>
                                                                                <Th py={3.5} color="gray.800" fontSize="11px" fontWeight="900" textAlign="right" whiteSpace="nowrap" minW="330px">ACTIONS</Th>
                                                                            </Tr>
                                                                        </Thead>
                                                                        <Tbody>
                                                                            {group.invoices.map((inv, invIdx) => {
                                                                                const psBadge = { PAID: { color: 'green', label: '✅ PAID' }, PARTIAL: { color: 'yellow', label: '🟡 PARTIAL' }, PENDING: { color: 'orange', label: '🟠 PENDING' }, OVERDUE: { color: 'red', label: '🔴 OVERDUE' } };
                                                                                const ps = psBadge[inv.paymentStatus] || psBadge.PENDING;
                                                                                const billDate = formatDate(inv.generatedAt || inv.entries?.[0]?.invoiceDetails?.generatedAt || inv.entries?.[0]?.createdAt);
                                                                                const invSites = inv.sites.filter((s, idx, arr) => s && arr.findIndex(x => (x?._id || x?.siteName) === (s?._id || s?.siteName)) === idx);
                                                                                const isCombined = invSites.length > 1;

                                                                                return (
                                                                                    <Tr
                                                                                        key={inv.invoiceKey || invIdx}
                                                                                        cursor="pointer"
                                                                                        borderBottom="1px solid"
                                                                                        borderColor="gray.200"
                                                                                        _hover={{ bg: "blue.50/60", transition: "background 0.15s" }}
                                                                                        onClick={() => setSelectedInvoiceDetail({ inv, group })}
                                                                                    >
                                                                                        <Td py={3.5} fontSize="xs" color="gray.500" fontWeight="bold">
                                                                                            {invIdx + 1}
                                                                                        </Td>
                                                                                        <Td py={3.5}>
                                                                                            <HStack spacing={2}>
                                                                                                <Icon as={FaFileInvoiceDollar} color={inv.isTaxInvoice ? 'blue.700' : 'blue.500'} w={4} h={4} />
                                                                                                <VStack align="start" spacing={0}>
                                                                                                    <Text fontSize="sm" fontWeight="900" color="gray.900">
                                                                                                        {inv.invoiceId && inv.invoiceId !== '—' ? inv.invoiceId : 'Direct Closed'}
                                                                                                    </Text>
                                                                                                    {isCombined && (
                                                                                                        <Text fontSize="10px" color="blue.700" fontWeight="bold">
                                                                                                            🔗 {invSites.length} Sites Combined
                                                                                                        </Text>
                                                                                                    )}
                                                                                                </VStack>
                                                                                            </HStack>
                                                                                        </Td>
                                                                                        <Td py={3.5}>
                                                                                            <Badge
                                                                                                bg={inv.isTaxInvoice ? 'blue.100' : inv.invoiceId && inv.invoiceId !== '—' ? 'purple.100' : 'gray.100'}
                                                                                                color={inv.isTaxInvoice ? 'blue.900' : inv.invoiceId && inv.invoiceId !== '—' ? 'purple.900' : 'gray.800'}
                                                                                                border="1px solid"
                                                                                                borderColor={inv.isTaxInvoice ? 'blue.400' : inv.invoiceId && inv.invoiceId !== '—' ? 'purple.400' : 'gray.400'}
                                                                                                borderRadius="full"
                                                                                                px={2.5}
                                                                                                py={0.5}
                                                                                                fontSize="10px"
                                                                                                fontWeight="900"
                                                                                            >
                                                                                                {inv.isTaxInvoice ? '🧾 TAX INVOICE' : inv.invoiceId && inv.invoiceId !== '—' ? '📄 PROFORMA' : '🔒 DIRECT CLOSED'}
                                                                                            </Badge>
                                                                                        </Td>
                                                                                        <Td py={3.5} fontSize="xs" fontWeight="bold" color="gray.800">
                                                                                            <HStack spacing={1.5}>
                                                                                                <Icon as={FaCalendarAlt} color="gray.500" w={3} h={3} />
                                                                                                <Text>{billDate}</Text>
                                                                                            </HStack>
                                                                                        </Td>
                                                                                        <Td py={3.5}>
                                                                                            <Wrap spacing={1}>
                                                                                                {invSites.map((site, si) => (
                                                                                                    <Tag key={si} size="sm" colorScheme="teal" borderRadius="full" fontSize="10px" fontWeight="extrabold">
                                                                                                        📍 {site?.siteName || 'Site'}
                                                                                                    </Tag>
                                                                                                ))}
                                                                                            </Wrap>
                                                                                        </Td>
                                                                                        <Td py={3.5} textAlign="center">
                                                                                            {(() => {
                                                                                                let nStr = '—'; let bCol = 'gray'; let nLabel = 'NO DATE';
                                                                                                let dStr = null;
                                                                                                if (inv.nextFollowUp) dStr = inv.nextFollowUp;
                                                                                                else if (inv.followUps && inv.followUps.length > 0) dStr = inv.followUps[inv.followUps.length - 1].nextFollowUpDate;
                                                                                                if (dStr) {
                                                                                                    const fD = new Date(dStr);
                                                                                                    nStr = formatDate(fD);
                                                                                                    const todayStr = new Date().toISOString().split('T')[0];
                                                                                                    const fnStr = fD.toISOString().split('T')[0];
                                                                                                    if (fnStr < todayStr) { bCol = 'red'; nLabel = 'OVERDUE'; }
                                                                                                    else if (fnStr === todayStr) { bCol = 'orange'; nLabel = 'TODAY'; }
                                                                                                    else { bCol = 'purple'; nLabel = 'UPCOMING'; }
                                                                                                }
                                                                                                return (
                                                                                                    <VStack spacing={0.5}>
                                                                                                        <Text fontSize="11px" fontWeight="bold" color={bCol === 'gray' ? 'gray.400' : 'gray.800'}>{nStr}</Text>
                                                                                                        {dStr && <Badge colorScheme={bCol} fontSize="9px" px={2} borderRadius="full">{nLabel}</Badge>}
                                                                                                    </VStack>
                                                                                                );
                                                                                            })()}
                                                                                        </Td>
                                                                                        <Td py={3.5} textAlign="right" fontSize="sm" fontWeight="900" color="gray.900">
                                                                                            ₹{Number(inv.totalAmt || 0).toLocaleString('en-IN')}
                                                                                        </Td>
                                                                                        <Td py={3.5} textAlign="right" onClick={(e) => e.stopPropagation()} whiteSpace="nowrap" minW="470px">
                                                                                            <HStack spacing={1.5} justify="flex-end">
                                                                                                <Button
                                                                                                    size="xs"
                                                                                                    bgGradient="linear(to-r, orange.500, red.500)"
                                                                                                    color="white"
                                                                                                    _hover={{ bgGradient: 'linear(to-r, orange.600, red.600)' }}
                                                                                                    borderRadius="lg"
                                                                                                    fontWeight="bold"
                                                                                                    leftIcon={<FaBell />}
                                                                                                    onClick={(e) => {
                                                                                                        e.stopPropagation();
                                                                                                        handleOpenFollowUp(inv, group);
                                                                                                    }}
                                                                                                >
                                                                                                    Follow-up ({inv.followUps?.length || 0})
                                                                                                </Button>
                                                                                                {/* WhatsApp Reminder */}
                                                                                                {inv.paymentStatus !== 'PAID' && (
                                                                                                    <Button
                                                                                                        size="xs"
                                                                                                        colorScheme="whatsapp"
                                                                                                        bg="#25D366"
                                                                                                        color="white"
                                                                                                        _hover={{ bg: '#128C7E' }}
                                                                                                        borderRadius="lg"
                                                                                                        fontWeight="bold"
                                                                                                        leftIcon={<FaWhatsapp />}
                                                                                                        onClick={(e) => {
                                                                                                            e.stopPropagation();
                                                                                                            const entry = inv.entries?.[0];
                                                                                                            if (entry) handleSendWhatsappReminder(entry);
                                                                                                            else toast({ title: 'No entry found', status: 'warning', duration: 2000 });
                                                                                                        }}
                                                                                                    >
                                                                                                        WA Reminder
                                                                                                    </Button>
                                                                                                )}
                                                                                                <Button
                                                                                                    size="xs"
                                                                                                    colorScheme="blue"
                                                                                                    variant="solid"
                                                                                                    borderRadius="lg"
                                                                                                    fontWeight="bold"
                                                                                                    rightIcon={<FaEye />}
                                                                                                    onClick={() => {
                                                                                                        const siteObj = inv.sites?.[0] || inv.entries?.[0]?.site;
                                                                                                        handleOpenSiteDrawer(siteObj, inv);
                                                                                                    }}
                                                                                                >
                                                                                                    View Details
                                                                                                </Button>
                                                                                                {!inv.isTaxInvoice ? (
                                                                                                    <Button
                                                                                                        size="xs"
                                                                                                        colorScheme="purple"
                                                                                                        variant="solid"
                                                                                                        borderRadius="lg"
                                                                                                        fontWeight="bold"
                                                                                                        leftIcon={<FaFileInvoiceDollar />}
                                                                                                        onClick={() => validateAndPrepareGlobalInvoice(inv.entries, 'FINAL')}
                                                                                                    >
                                                                                                        Generate Final Invoice
                                                                                                    </Button>
                                                                                                ) : (
                                                                                                    <Box minW="154px" h="24px" display="inline-block" />
                                                                                                )}
                                                                                                {inv.paymentStatus !== 'PAID' ? (
                                                                                                    <Button
                                                                                                        size="xs"
                                                                                                        colorScheme="green"
                                                                                                        variant="solid"
                                                                                                        borderRadius="lg"
                                                                                                        fontWeight="bold"
                                                                                                        leftIcon={<FaCheckCircle />}
                                                                                                        onClick={() => handleMarkInvoiceClosed(inv)}
                                                                                                    >
                                                                                                        Mark Closed
                                                                                                    </Button>
                                                                                                ) : (
                                                                                                    <Box minW="102px" h="24px" display="inline-block" />
                                                                                                )}
                                                                                            </HStack>
                                                                                        </Td>
                                                                                    </Tr>
                                                                                );
                                                                            })}
                                                                        </Tbody>
                                                                    </Table>
                                                                </TableContainer>
                                                            </VStack>
                                                        </TabPanel>
                                                        {/* TAB 2: SITES BREAKDOWN */}
                                                        <TabPanel p={0}>
                                                            <VStack spacing={4} align="stretch">
                                                                {allSites.map((site, si) => {
                                                                    const siteInvoices = group.invoices.filter(inv => inv.sites.some(s => (s?._id || s?.siteName) === (site?._id || site?.siteName)));
                                                                    const siteEntries = siteInvoices.flatMap(inv => inv.entries.filter(e => (e.site?._id || e.site?.siteName) === (site?._id || site?.siteName)));
                                                                    const siteTotal = siteEntries.reduce((s, e) => s + calculateEntryAmount(e), 0);

                                                                    return (
                                                                        <Card key={si} borderRadius="2xl" border="1px solid" borderColor="gray.200" bg="white" shadow="xs">
                                                                            <CardBody p={4}>
                                                                                <Flex justify="space-between" align="center" wrap="wrap" gap={2} mb={3}>
                                                                                    <HStack spacing={2}>
                                                                                        <Icon as={FaMapMarkerAlt} color="teal.500" w={4} h={4} />
                                                                                        <Text fontWeight="extrabold" fontSize="md" color="gray.800">
                                                                                            {site?.siteName || 'Site'}
                                                                                        </Text>
                                                                                        {site?.siteLocation && (
                                                                                            <Text fontSize="xs" color="gray.500">({site.siteLocation})</Text>
                                                                                        )}
                                                                                    </HStack>
                                                                                    <Badge colorScheme="teal" borderRadius="full" px={2.5} py={0.5} fontSize="xs" fontWeight="bold">
                                                                                        {siteInvoices.length} Invoice{siteInvoices.length !== 1 ? 's' : ''} • ₹{siteTotal.toLocaleString('en-IN')}
                                                                                    </Badge>
                                                                                </Flex>
                                                                                <TableContainer border="1px solid" borderColor="gray.200" borderRadius="xl">
                                                                                    <Table size="xs" variant="simple">
                                                                                        <Thead bg="gray.50">
                                                                                            <Tr>
                                                                                                <Th py={3} color="gray.500" fontSize="10px" w="40px">#</Th>
                                                                                                <Th py={3} color="gray.500" fontSize="10px">INVOICE NO.</Th>
                                                                                                <Th py={3} color="gray.500" fontSize="10px">TYPE</Th>
                                                                                                <Th py={3} color="gray.500" fontSize="10px">ENTRIES / VISITS</Th>
                                                                                                <Th py={3} color="gray.500" fontSize="10px" textAlign="right">AMOUNT (₹)</Th>
                                                                                                <Th py={3} color="gray.500" fontSize="10px" textAlign="center">STATUS</Th>
                                                                                                <Th py={3} color="gray.500" fontSize="10px" textAlign="right">ACTIONS</Th>
                                                                                            </Tr>
                                                                                        </Thead>
                                                                                        <Tbody>
                                                                                            {siteInvoices.map((inv, invIdx) => (
                                                                                                <Tr key={inv.invoiceKey || invIdx}>
                                                                                                    <Td py={3} color="gray.500">{invIdx + 1}</Td>
                                                                                                    <Td py={3} fontWeight="bold" color="blue.700">{inv.invoiceId || '—'}</Td>
                                                                                                    <Td py={3}>
                                                                                                        <Badge colorScheme={inv.isTaxInvoice ? 'green' : 'blue'} borderRadius="full" px={2} fontSize="9px">
                                                                                                            {inv.isTaxInvoice ? 'TAX' : 'PROFORMA'}
                                                                                                        </Badge>
                                                                                                    </Td>
                                                                                                    <Td py={3} color="gray.600">{inv.entries?.length || 0} visits</Td>
                                                                                                    <Td py={3} textAlign="right" fontWeight="bold" color="gray.800">₹{(inv.totalAmt || 0).toLocaleString('en-IN')}</Td>
                                                                                                    <Td py={3} textAlign="center">
                                                                                                        <Badge colorScheme={inv.paymentStatus === 'PAID' ? 'green' : 'orange'} borderRadius="full" px={2} fontSize="9px">
                                                                                                            {inv.paymentStatus || 'PENDING'}
                                                                                                        </Badge>
                                                                                                    </Td>
                                                                                                    <Td py={3} textAlign="right">
                                                                                                        <HStack justify="flex-end" spacing={1.5}>
                                                                                                            <IconButton
                                                                                                                icon={<FaEye />}
                                                                                                                size="xs"
                                                                                                                colorScheme="purple"
                                                                                                                variant="solid"
                                                                                                                borderRadius="md"
                                                                                                                aria-label="Preview Invoice"
                                                                                                                onClick={() => handlePreviewExistingPdf(
                                                                                                                    inv.pdfUrl,
                                                                                                                    inv.invoiceId,
                                                                                                                    inv.isTaxInvoice ? 'Tax Invoice' : 'Proforma Invoice',
                                                                                                                    inv
                                                                                                                )}
                                                                                                            />
                                                                                                            {inv.pdfUrl && (
                                                                                                                <IconButton
                                                                                                                    as="a"
                                                                                                                    href={inv.pdfUrl.startsWith('http') ? inv.pdfUrl : `${API_BASE_URL}${inv.pdfUrl.startsWith('/') ? '' : '/'}${inv.pdfUrl}`}
                                                                                                                    target="_blank"
                                                                                                                    icon={<FaFilePdf />}
                                                                                                                    size="xs"
                                                                                                                    colorScheme="red"
                                                                                                                    variant="solid"
                                                                                                                    borderRadius="md"
                                                                                                                    aria-label="Open PDF"
                                                                                                                />
                                                                                                            )}
                                                                                                        </HStack>
                                                                                                    </Td>
                                                                                                </Tr>
                                                                                            ))}
                                                                                        </Tbody>
                                                                                    </Table>
                                                                                </TableContainer>
                                                                            </CardBody>
                                                                        </Card>
                                                                    );
                                                                })}
                                                            </VStack>
                                                        </TabPanel>
                                                    </TabPanels>
                                                </ModalBody>
                                                <ModalFooter borderTop="1px solid" borderColor="gray.200" bg="white">
                                                    <Button size="sm" variant="ghost" borderRadius="xl" onClick={() => setSelectedClientModal(null)}>
                                                        Close
                                                    </Button>
                                                </ModalFooter>
                                            </Tabs>
                                        );
                                    })()}
                                </ModalContent>
                            </Modal>

                        </VStack>
                    ) : (
                        <Card borderRadius="2xl" shadow="sm" border="1px solid" borderColor="gray.100" overflow="hidden">
                            {/* Legend */}
                            <Box px={{ base: 3, md: 6 }} pt={4} pb={2}>
                                <Flex justify="space-between" align="center" wrap="wrap" gap={2}>
                                    <HStack spacing={{ base: 2, md: 4 }} wrap="wrap">
                                        <Text fontSize="xs" fontWeight="bold" color="gray.500">LEGEND:</Text>
                                        <HStack spacing={1}>
                                            <Box w={3} h={3} bg="green.300" borderRadius="sm" />
                                            <Text fontSize="xs" color="gray.600">Full Day</Text>
                                        </HStack>
                                        <HStack spacing={1}>
                                            <Box w={3} h={3} bg="orange.300" borderRadius="sm" />
                                            <Text fontSize="xs" color="gray.600">Half Day</Text>
                                        </HStack>
                                        <HStack spacing={1}>
                                            <Box w={3} h={3} bg="blue.400" borderRadius="sm" />
                                            <Text fontSize="xs" color="gray.600">Month</Text>
                                        </HStack>
                                        <HStack spacing={1}>
                                            <Box w={3} h={3} bg="red.400" borderRadius="sm" />
                                            <Text fontSize="xs" color="gray.600">Topography</Text>
                                        </HStack>
                                        <HStack spacing={1}>
                                            <Box w={3} h={3} bg="purple.400" borderRadius="sm" />
                                            <Text fontSize="xs" color="gray.600">Point Marking</Text>
                                        </HStack>
                                    </HStack>
                                    <Text fontSize="xs" color="gray.400" ml={{ base: 0, sm: "auto" }}>
                                        {activeTab === 4
                                            ? `${groupedGroups.length} entries · Page ${closedPage} of ${Math.max(1, Math.ceil(groupedGroups.length / 30))}`
                                            : `${groupedGroups.length} entries listed`
                                        }
                                    </Text>
                                </Flex>
                            </Box>
                            <Divider />
                            <CardBody p={0}>
                                {loading ? (
                                    <Center py={16}><Spinner size="xl" color="blue.500" thickness="4px" /></Center>
                                ) : groupedGroups.length === 0 ? (
                                    <Center py={16}>
                                        <VStack spacing={3}>
                                            <Icon as={FaFileInvoiceDollar} w={12} h={12} color="gray.200" />
                                            <Text color="gray.400" fontSize="lg">No schedules found</Text>
                                            <Text color="gray.300" fontSize="sm">Try adjusting your filters or date range</Text>
                                        </VStack>
                                    </Center>
                                ) : (
                                    <>
                                    {/* ── Mobile Card List View (Phones & Tablets) ── */}
                                    <VStack spacing={2.5} p={{ base: 2, sm: 3 }} align="stretch" display={{ base: "flex", lg: "none" }}>
                                        {(activeTab === 4
                                            ? groupedGroups.slice((closedPage - 1) * 30, closedPage * 30)
                                            : groupedGroups
                                        ).map((group, idx) => {
                                            const totalCount = group.entries.length;
                                            const completedCount = group.entries.filter(e => e.invoiceStatus === 'Completed').length;
                                            const pendingCount = totalCount - completedCount;
                                            const isPending = group.status === 'Pending';
                                            const siteCount = group.siteGroups ? group.siteGroups.length : 1;

                                            const groupClientId = String(group.client?._id || group.client);
                                            const groupTotalAmt = group.entries.reduce((sum, e) => sum + Number(e.paymentAmount || 0), 0);
                                            const paymentMode = group.entries.find(e => e.paymentMode)?.paymentMode || (group.entries.find(e => e.transactionNo)?.transactionNo ? 'UPI' : (group.entries.find(e => e.receiverName)?.receiverName ? 'CASH' : null));
                                            const receiverName = group.entries.find(e => e.receiverName)?.receiverName;
                                            const transactionNo = group.entries.find(e => e.transactionNo)?.transactionNo;
                                            const closedDate = group.entries.find(e => e.closedDate)?.closedDate;
                                            const isDifferentClient = activeSelectedClientId && groupClientId !== activeSelectedClientId;

                                            const { bg, border } = rowStyle(group);
                                            const rowBg = activeTab === 4 ? "white" : bg;

                                            // Date display
                                            const earliestDate = group.entries.reduce((min, e) => {
                                                const d = new Date(e.scheduleDate);
                                                return d < min ? d : min;
                                            }, new Date(group.entries[0]?.scheduleDate || Date.now()));
                                            const latestDate = group.entries.reduce((max, e) => {
                                                const d = new Date(e.scheduleDate);
                                                return d > max ? d : max;
                                            }, new Date(group.entries[0]?.scheduleDate || Date.now()));
                                            const dateDisplay = totalCount === 1
                                                ? formatDate(group.entries[0]?.scheduleDate)
                                                : `${formatDate(earliestDate)} – ${formatDate(latestDate)}`;

                                            // Unique sites
                                            const uniqueSites = group.siteGroups || [];

                                            return (
                                                <Card
                                                    key={group.groupId || idx}
                                                    borderRadius="xl"
                                                    border="1px solid"
                                                    borderColor={isDifferentClient ? 'gray.200' : border}
                                                    bg={rowBg}
                                                    shadow="sm"
                                                    opacity={isDifferentClient ? 0.4 : 1}
                                                    pointerEvents={isDifferentClient ? 'none' : 'auto'}
                                                    cursor={isDifferentClient ? 'not-allowed' : 'pointer'}
                                                    overflow="hidden"
                                                    _active={{ transform: 'scale(0.98)', transition: 'transform 0.1s' }}
                                                    onClick={() => {
                                                        if (isDifferentClient) return;
                                                        if (activeTab === 4) {
                                                            const siteObj = group.siteGroups?.[0]?.site || group.entries?.[0]?.site;
                                                            handleOpenSiteDrawer(siteObj, group);
                                                        } else {
                                                            setSelectedGroup(group);
                                                            setSelectedEntryForDocs(null);
                                                        }
                                                    }}
                                                >
                                                    {/* ── Coloured top accent bar ── */}
                                                    <Box
                                                        h="4px"
                                                        bgGradient={
                                                            activeTab === 4
                                                                ? 'linear(to-r, green.400, teal.400)'
                                                                : isPending
                                                                    ? 'linear(to-r, orange.400, red.400)'
                                                                    : 'linear(to-r, green.400, teal.400)'
                                                        }
                                                    />

                                                    <CardBody p={3}>
                                                        <VStack align="stretch" spacing={2}>
                                                            {/* ── Row 1: Serial + Client Name + Status Badge ── */}
                                                            <Flex justify="space-between" align="flex-start" gap={2}>
                                                                <HStack spacing={2} flex={1} minW={0}>
                                                                    <Box
                                                                        bg={activeTab === 4 ? 'green.100' : isPending ? 'orange.100' : 'green.100'}
                                                                        color={activeTab === 4 ? 'green.700' : isPending ? 'orange.700' : 'green.700'}
                                                                        borderRadius="md"
                                                                        px={1.5}
                                                                        py={0.5}
                                                                        fontSize="2xs"
                                                                        fontWeight="black"
                                                                        flexShrink={0}
                                                                    >
                                                                        #{activeTab === 4 ? (closedPage - 1) * 30 + idx + 1 : idx + 1}
                                                                    </Box>
                                                                    <VStack align="start" spacing={0} flex={1} minW={0}>
                                                                        <HStack spacing={1.5}>
                                                                            <Icon as={FaBuilding} color="blue.500" w={3} h={3} flexShrink={0} />
                                                                            <Text fontSize="sm" fontWeight="black" color="gray.800" noOfLines={1}>
                                                                                {group.client?.clientName || '—'}
                                                                            </Text>
                                                                        </HStack>
                                                                        {group.client?.clientAddress && (
                                                                            <Text fontSize="2xs" color="gray.500" noOfLines={1}>
                                                                                {group.client.clientAddress}
                                                                            </Text>
                                                                        )}
                                                                    </VStack>
                                                                </HStack>

                                                                {/* Status / Invoice badge */}
                                                                {activeTab === 4 ? (
                                                                    <VStack align="flex-end" spacing={0.5} flexShrink={0}>
                                                                        <Text fontSize="xs" fontWeight="900" color="gray.900" noOfLines={1} maxW="130px" textAlign="right">
                                                                            {group.finalInvoiceId || group.proformaInvoiceId || group.invoiceId || '🔒 DIRECT'}
                                                                        </Text>
                                                                        <Badge
                                                                            colorScheme={group.finalInvoiceId || group.finalInvoicePdf ? 'blue' : group.proformaInvoiceId || group.proformaInvoicePdf ? 'purple' : 'green'}
                                                                            variant="subtle" border="1px solid" borderRadius="full"
                                                                            px={1.5} py={0.2} fontSize="2xs" fontWeight="black"
                                                                        >
                                                                            {group.finalInvoiceId || group.finalInvoicePdf ? '🧾 TAX' : group.proformaInvoiceId || group.proformaInvoicePdf ? '📄 PRF' : '🔒 DIRECT'}
                                                                        </Badge>
                                                                    </VStack>
                                                                ) : (
                                                                    <Badge
                                                                        colorScheme={group.invoiceId ? 'purple' : isPending ? 'orange' : 'green'}
                                                                        variant="solid" borderRadius="full"
                                                                        px={2} py={0.5} fontSize="2xs" fontWeight="black" flexShrink={0}
                                                                    >
                                                                        {group.invoiceId ? `📄 ${group.invoiceId}` : isPending ? '⏳ Pending' : '✅ Done'}
                                                                    </Badge>
                                                                )}
                                                            </Flex>

                                                            {/* ── Row 2: Sites chips ── */}
                                                            {uniqueSites.length > 0 && (
                                                                <Flex gap={1} wrap="wrap">
                                                                    {uniqueSites.slice(0, 3).map((sg, si) => (
                                                                        <Badge
                                                                            key={si}
                                                                            colorScheme="teal"
                                                                            variant="subtle"
                                                                            borderRadius="full"
                                                                            px={2} py={0.5}
                                                                            fontSize="2xs"
                                                                            fontWeight="bold"
                                                                        >
                                                                            📍 {sg?.site?.siteName || sg?.siteName || 'Site'}
                                                                        </Badge>
                                                                    ))}
                                                                    {uniqueSites.length > 3 && (
                                                                        <Badge colorScheme="gray" variant="subtle" borderRadius="full" px={2} py={0.5} fontSize="2xs">
                                                                            +{uniqueSites.length - 3} more
                                                                        </Badge>
                                                                    )}
                                                                </Flex>
                                                            )}

                                                            {/* ── Row 3: Schedule types + Date + Entry count ── */}
                                                            <Flex justify="space-between" align="center" gap={2}>
                                                                <HStack spacing={1} wrap="wrap" flex={1}>
                                                                    {group.uniqueTypes?.map(t => (
                                                                        <Tag
                                                                            key={t} size="sm"
                                                                            colorScheme={t.includes('Topography') ? 'red' : t.includes('Month') ? 'blue' : t.includes('Point') ? 'purple' : 'green'}
                                                                            variant="subtle" fontSize="2xs" fontWeight="bold" borderRadius="full"
                                                                        >
                                                                            {t}
                                                                        </Tag>
                                                                    ))}
                                                                </HStack>
                                                                <VStack align="flex-end" spacing={0} flexShrink={0}>
                                                                    <HStack spacing={1}>
                                                                        <Icon as={FaCalendarAlt} color="gray.400" w={3} h={3} />
                                                                        <Text fontSize="2xs" color="gray.500" fontWeight="bold">{dateDisplay}</Text>
                                                                    </HStack>
                                                                    <Text fontSize="2xs" color="gray.400">
                                                                        {totalCount} {totalCount === 1 ? 'entry' : 'entries'}{pendingCount > 0 && activeTab !== 4 ? ` · ${pendingCount} pending` : ''}
                                                                    </Text>
                                                                </VStack>
                                                            </Flex>

                                                            {/* ── Row 4: Closed-tab payment info OR pending entry count ── */}
                                                            {activeTab === 4 ? (
                                                                <Flex justify="space-between" align="center" bg="green.50" p={2} borderRadius="lg" border="1px solid" borderColor="green.200">
                                                                    <VStack align="start" spacing={0.5}>
                                                                        <HStack spacing={1.5} wrap="wrap">
                                                                            {paymentMode && (
                                                                                <Badge colorScheme={paymentMode === 'UPI' ? 'purple' : 'teal'} variant="subtle" border="1px solid" borderRadius="full" px={2} py={0.5} fontSize="2xs" fontWeight="black">
                                                                                    {paymentMode === 'UPI' ? '💳 UPI' : '💵 CASH'}
                                                                                </Badge>
                                                                            )}
                                                                            {receiverName && (
                                                                                <Text fontSize="2xs" color="gray.600" fontWeight="bold">👤 {receiverName}</Text>
                                                                            )}
                                                                            {closedDate && (
                                                                                <Badge colorScheme="green" variant="solid" borderRadius="full" px={1.5} py={0.2} fontSize="2xs">
                                                                                    ✅ {formatDate(closedDate)}
                                                                                </Badge>
                                                                            )}
                                                                        </HStack>
                                                                    </VStack>
                                                                    <VStack align="flex-end" spacing={0}>
                                                                        <Text fontSize="2xs" color="gray.500" fontWeight="bold" textTransform="uppercase">Closed Amt</Text>
                                                                        <Text fontWeight="900" fontSize="sm" color="green.700">
                                                                            ₹{groupTotalAmt > 0 ? groupTotalAmt.toLocaleString('en-IN') : '—'}
                                                                        </Text>
                                                                    </VStack>
                                                                </Flex>
                                                            ) : (
                                                                isPending && pendingCount > 0 && (
                                                                    <Flex bg="orange.50" p={2} borderRadius="lg" border="1px solid" borderColor="orange.200" align="center" justify="space-between">
                                                                        <HStack spacing={1.5}>
                                                                            <Icon as={FaClock} color="orange.500" w={3} h={3} />
                                                                            <Text fontSize="2xs" color="orange.700" fontWeight="bold">
                                                                                {pendingCount} pending · {completedCount} completed
                                                                            </Text>
                                                                        </HStack>
                                                                        <Text fontSize="2xs" color="gray.400">{formatDate(group.earliestPendingDate)}</Text>
                                                                    </Flex>
                                                                )
                                                            )}

                                                            {/* ── Row 5: Action Buttons ── */}
                                                            <Flex justify="flex-end" align="center" pt={1} borderTop="1px dashed" borderColor="gray.200" gap={1.5} wrap="wrap" onClick={(e) => e.stopPropagation()}>
                                                                {(group.proformaInvoicePdf || group.finalInvoicePdf) && (
                                                                    <>
                                                                        <IconButton
                                                                            icon={<FaEye />} size="xs" colorScheme="purple" variant="solid"
                                                                            borderRadius="md" aria-label="Preview Invoice"
                                                                            onClick={() => handlePreviewExistingPdf(
                                                                                group.finalInvoicePdf || group.proformaInvoicePdf,
                                                                                group.finalInvoiceId || group.proformaInvoiceId,
                                                                                group.finalInvoicePdf ? 'Final Invoice' : 'Proforma Invoice',
                                                                                group
                                                                            )}
                                                                        />
                                                                        <IconButton
                                                                            as="a"
                                                                            href={`${API_BASE_URL}${group.finalInvoicePdf || group.proformaInvoicePdf}`}
                                                                            target="_blank"
                                                                            icon={<FaFilePdf />} size="xs" colorScheme="red" variant="solid"
                                                                            borderRadius="md" aria-label="Open PDF"
                                                                        />
                                                                        <IconButton
                                                                            icon={<FaWhatsapp />} size="xs" bg="#25D366" color="white"
                                                                            _hover={{ bg: '#128C7E' }} borderRadius="md" aria-label="Send WhatsApp"
                                                                            onClick={(e) => { e.stopPropagation(); handleOpenWhatsappModal(group); }}
                                                                        />
                                                                    </>
                                                                )}
                                                                <Button
                                                                    size="xs" colorScheme="gray" bg="gray.800" color="white"
                                                                    _hover={{ bg: 'gray.700' }} variant="solid" borderRadius="md"
                                                                    fontSize="2xs" leftIcon={<FaListUl />}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        if (activeTab === 4) {
                                                                            const siteObj = group.siteGroups?.[0]?.site || group.entries?.[0]?.site;
                                                                            handleOpenSiteDrawer(siteObj, group);
                                                                        } else {
                                                                            setSelectedGroup(group);
                                                                            setSelectedEntryForDocs(null);
                                                                        }
                                                                    }}
                                                                >
                                                                    Details
                                                                </Button>
                                                            </Flex>
                                                        </VStack>
                                                    </CardBody>
                                                </Card>
                                            );
                                        })}
                                    </VStack>


                                    {/* ── Desktop Table View (Laptops & Desktops) ── */}
                                    <TableContainer overflowX="auto" w="full" display={{ base: "none", lg: "block" }}>
                                        <Table variant="simple" size="sm" sx={{ 'th, td': { whiteSpace: 'normal', wordBreak: 'break-word' } }}>
                                            <Thead bg="blue.50" borderBottom="2px solid" borderColor="blue.200">
                                                <Tr>
                                                    <Th py={4} color="blue.800" fontSize="10px" w="40px" fontWeight="black">#</Th>
                                                    {activeTab === 4 ? (
                                                        <>
                                                            <Th py={4} color="blue.800" fontSize="10px" fontWeight="black">INVOICE NO. & TYPE</Th>
                                                            <Th py={4} color="blue.800" fontSize="10px" fontWeight="black">CLIENT NAME</Th>
                                                            <Th py={4} color="blue.800" fontSize="10px" fontWeight="black">SITES COVERED</Th>
                                                            <Th py={4} color="blue.800" fontSize="10px" textAlign="center" fontWeight="black">PAYMENT DETAILS</Th>
                                                            <Th py={4} color="blue.800" fontSize="10px" textAlign="center" fontWeight="black">CLOSED DATE</Th>
                                                            <Th py={4} color="blue.800" fontSize="10px" textAlign="right" fontWeight="black">CLOSED AMOUNT (₹)</Th>
                                                            <Th py={4} color="blue.800" fontSize="10px" textAlign="right" minW="200px" fontWeight="black">ACTIONS</Th>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Th py={4} color="blue.800" fontSize="10px" fontWeight="black">CLIENT NAME</Th>
                                                            <Th py={4} color="blue.800" fontSize="10px" fontWeight="black">SCHEDULE TYPE</Th>
                                                            <Th py={4} color="blue.800" fontSize="10px" textAlign="center" w="160px" fontWeight="black">SITES & DATA</Th>
                                                            <Th py={4} color="blue.800" fontSize="10px" w="150px" fontWeight="black">BILL STATUS</Th>
                                                            <Th py={4} color="blue.800" fontSize="10px" textAlign="right" w="150px" fontWeight="black">ACTIONS</Th>
                                                        </>
                                                    )}
                                                </Tr>
                                            </Thead>
                                            <Tbody>
                                                {(activeTab === 4
                                                    ? groupedGroups.slice((closedPage - 1) * 30, closedPage * 30)
                                                    : groupedGroups
                                                ).map((group, idx) => {
                                                    const totalCount = group.entries.length;
                                                    const completedCount = group.entries.filter(e => e.invoiceStatus === 'Completed').length;
                                                    const pendingCount = totalCount - completedCount;
                                                    const isPending = group.status === 'Pending';
                                                    const siteCount = group.siteGroups ? group.siteGroups.length : 1;

                                                    const groupClientId = String(group.client?._id || group.client);
                                                    const groupTotalAmt = group.entries.reduce((sum, e) => sum + Number(e.paymentAmount || 0), 0);
                                                    const paymentMode = group.entries.find(e => e.paymentMode)?.paymentMode || (group.entries.find(e => e.transactionNo)?.transactionNo ? 'UPI' : (group.entries.find(e => e.receiverName)?.receiverName ? 'CASH' : null));
                                                    const receiverName = group.entries.find(e => e.receiverName)?.receiverName;
                                                    const transactionNo = group.entries.find(e => e.transactionNo)?.transactionNo;
                                                    const closedDate = group.entries.find(e => e.closedDate)?.closedDate;
                                                    const isDifferentClient = activeSelectedClientId && groupClientId !== activeSelectedClientId;

                                                    const { bg, border, hoverBg } = rowStyle(group);
                                                    const rowBg = activeTab === 4 ? "white" : bg;
                                                    const rowHoverBg = activeTab === 4 ? "gray.50" : hoverBg;

                                                    return (
                                                        <Tr
                                                            key={group.groupId}
                                                            bg={rowBg}
                                                            opacity={isDifferentClient ? 0.35 : 1}
                                                            filter="none"
                                                            pointerEvents={isDifferentClient ? 'not-allowed' : 'auto'}
                                                            _hover={{ bg: isDifferentClient ? rowBg : rowHoverBg, transition: 'background 0.15s' }}
                                                            borderLeft="4px solid"
                                                            borderLeftColor={isDifferentClient ? 'gray.300' : border}
                                                            cursor={isDifferentClient ? 'not-allowed' : 'pointer'}
                                                            onClick={() => {
                                                                if (isDifferentClient) return;
                                                                if (activeTab === 4) {
                                                                    const siteObj = group.siteGroups?.[0]?.site || group.entries?.[0]?.site;
                                                                    handleOpenSiteDrawer(siteObj, group);
                                                                } else {
                                                                    setSelectedGroup(group);
                                                                    setSelectedEntryForDocs(null);
                                                                }
                                                            }}
                                                        >
                                                            <Td py={4} color="gray.400" fontSize="xs">
                                                                {activeTab === 4 ? (closedPage - 1) * 30 + idx + 1 : idx + 1}
                                                            </Td>
                                                            {activeTab === 4 ? (
                                                                <>
                                                                    {/* INVOICE NO. & TYPE */}
                                                                    <Td py={4}>
                                                                        <VStack align="start" spacing={1}>
                                                                            <Text fontSize="sm" fontWeight="900" color="gray.900">
                                                                                {group.finalInvoiceId || group.proformaInvoiceId || group.invoiceId || '🔒 DIRECT CLOSED'}
                                                                            </Text>
                                                                            <Badge
                                                                                colorScheme={group.finalInvoiceId || group.finalInvoicePdf ? 'blue' : group.proformaInvoiceId || group.proformaInvoicePdf ? 'purple' : 'green'}
                                                                                variant="subtle"
                                                                                border="1px solid"
                                                                                borderRadius="full"
                                                                                px={2}
                                                                                py={0.5}
                                                                                fontSize="9px"
                                                                                fontWeight="black"
                                                                            >
                                                                                {group.finalInvoiceId || group.finalInvoicePdf ? '🧾 TAX INVOICE' : group.proformaInvoiceId || group.proformaInvoicePdf ? '📄 PROFORMA' : '🔒 DIRECT CLOSED'}
                                                                            </Badge>
                                                                        </VStack>
                                                                    </Td>

                                                                    {/* CLIENT NAME */}
                                                                    <Td py={4}>
                                                                        <HStack spacing={2}>
                                                                            <Icon as={FaBuilding} color="blue.500" w={4} h={4} />
                                                                            <VStack align="start" spacing={0}>
                                                                                <Text fontSize="sm" fontWeight="black" color="gray.800">
                                                                                    {group.client?.clientName || '—'}
                                                                                </Text>
                                                                                {group.client?.clientAddress && (
                                                                                    <Text fontSize="10px" color="gray.500" noOfLines={1}>
                                                                                        {group.client.clientAddress}
                                                                                    </Text>
                                                                                )}
                                                                            </VStack>
                                                                        </HStack>
                                                                    </Td>

                                                                    {/* SITES COVERED */}
                                                                    <Td py={4}>
                                                                        <Wrap spacing={1}>
                                                                            {group.siteGroups?.map((s, si) => (
                                                                                <Tag key={si} size="sm" colorScheme="teal" variant="subtle" border="1px solid" borderRadius="full" fontSize="10px" fontWeight="extrabold">
                                                                                    📍 {s?.siteName || s?.site?.siteName || 'Site'}
                                                                                </Tag>
                                                                            )) || (
                                                                                    <Tag size="sm" colorScheme="teal" variant="subtle" border="1px solid" borderRadius="full" fontSize="10px" fontWeight="extrabold">
                                                                                        📍 {group.entries?.[0]?.site?.siteName || 'Site'}
                                                                                    </Tag>
                                                                                )}
                                                                        </Wrap>
                                                                    </Td>

                                                                    {/* PAYMENT DETAILS */}
                                                                    <Td py={4} textAlign="center">
                                                                        <VStack spacing={1} align="center">
                                                                            <Badge
                                                                                colorScheme={paymentMode === 'UPI' ? 'purple' : 'teal'}
                                                                                variant="subtle"
                                                                                border="1px solid"
                                                                                borderRadius="full"
                                                                                px={3}
                                                                                py={1}
                                                                                fontSize="10px"
                                                                                fontWeight="black"
                                                                            >
                                                                                {paymentMode === 'UPI' ? '💳 UPI' : paymentMode === 'CASH' ? '💵 CASH' : '💵 CASH/UPI'}
                                                                            </Badge>
                                                                            {receiverName && (
                                                                                <Text fontSize="9px" color="gray.600" fontWeight="bold">
                                                                                    👤 {receiverName}
                                                                                </Text>
                                                                            )}
                                                                            {transactionNo && (
                                                                                <Text fontSize="9px" color="gray.600" fontWeight="bold">
                                                                                    🔢 {transactionNo}
                                                                                </Text>
                                                                            )}
                                                                        </VStack>
                                                                    </Td>

                                                                    {/* CLOSED DATE — dedicated column */}
                                                                    <Td py={4} textAlign="center">
                                                                        {closedDate ? (
                                                                            <VStack spacing={0} align="center">
                                                                                <Badge
                                                                                    colorScheme="green"
                                                                                    variant="solid"
                                                                                    borderRadius="full"
                                                                                    px={3}
                                                                                    py={1}
                                                                                    fontSize="10px"
                                                                                    fontWeight="black"
                                                                                >
                                                                                    ✅ {formatDate(closedDate)}
                                                                                </Badge>
                                                                            </VStack>
                                                                        ) : (
                                                                            <Text fontSize="xs" color="gray.400">—</Text>
                                                                        )}
                                                                    </Td>

                                                                    {/* CLOSED AMOUNT (₹) */}
                                                                    <Td py={4} textAlign="right" fontWeight="900" fontSize="sm" color="gray.900">
                                                                        ₹{groupTotalAmt > 0 ? groupTotalAmt.toLocaleString('en-IN') : '—'}
                                                                    </Td>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Td py={4}>
                                                                        <HStack spacing={2}>
                                                                            <Icon as={FaBuilding} color="blue.500" w={4} h={4} />
                                                                            <VStack align="start" spacing={0}>
                                                                                <Text fontSize="sm" fontWeight="black" color="gray.800">
                                                                                    {group.client?.clientName || '—'}
                                                                                </Text>
                                                                                {group.client?.clientAddress && (
                                                                                    <Text fontSize="10px" color="gray.500" noOfLines={1}>
                                                                                        {group.client.clientAddress}
                                                                                    </Text>
                                                                                )}
                                                                            </VStack>
                                                                        </HStack>
                                                                    </Td>
                                                                    <Td py={4}>
                                                                        <Wrap spacing={1}>
                                                                            {group.uniqueTypes?.map(t => (
                                                                                <Tag
                                                                                    key={t}
                                                                                    size="sm"
                                                                                    colorScheme={t.includes('Topography') ? 'red' : t.includes('Month') ? 'blue' : t.includes('Point') ? 'purple' : 'green'}
                                                                                    variant="subtle"
                                                                                    fontSize="10px"
                                                                                    fontWeight="bold"
                                                                                    borderRadius="full"
                                                                                >
                                                                                    {t}
                                                                                </Tag>
                                                                            ))}
                                                                        </Wrap>
                                                                    </Td>
                                                                    <Td py={4} textAlign="center">
                                                                        <Badge colorScheme="teal" variant="solid" borderRadius="full" px={3} py={0.5} fontSize="11px">
                                                                            <Icon as={FaMapMarkerAlt} mr={1} w={3} h={3} />
                                                                            {siteCount} {siteCount === 1 ? 'Site' : 'Sites'} ({totalCount} entries)
                                                                        </Badge>
                                                                    </Td>
                                                                    <Td py={4}>
                                                                        <Badge
                                                                            colorScheme={group.invoiceId ? 'purple' : isPending ? 'orange' : 'green'}
                                                                            variant="solid"
                                                                            borderRadius="full"
                                                                            px={3}
                                                                            py={1}
                                                                            fontSize="10px"
                                                                            fontWeight="black"
                                                                        >
                                                                            {group.invoiceId ? `📄 ${group.invoiceId}` : isPending ? '⏳ Pending' : '✅ Completed'}
                                                                        </Badge>
                                                                    </Td>
                                                                </>
                                                            )}
                                                            <Td py={4} textAlign="right" onClick={(e) => e.stopPropagation()}>
                                                                <HStack justify="flex-end" spacing={1.5}>
                                                                    {(group.proformaInvoicePdf || group.finalInvoicePdf) && (
                                                                        <>
                                                                            <Tooltip label="Preview Invoice" placement="top">
                                                                                <IconButton
                                                                                    icon={<FaEye />}
                                                                                    size="xs"
                                                                                    colorScheme="purple"
                                                                                    variant="solid"
                                                                                    borderRadius="lg"
                                                                                    aria-label="Preview Invoice"
                                                                                    onClick={() => handlePreviewExistingPdf(
                                                                                        group.finalInvoicePdf || group.proformaInvoicePdf,
                                                                                        group.finalInvoiceId || group.proformaInvoiceId,
                                                                                        group.finalInvoicePdf ? 'Final Invoice' : 'Proforma Invoice'
                                                                                    )}
                                                                                />
                                                                            </Tooltip>
                                                                            <Tooltip label="Open PDF in New Tab" placement="top">
                                                                                <IconButton
                                                                                    as="a"
                                                                                    href={`${API_BASE_URL}${group.finalInvoicePdf || group.proformaInvoicePdf}`}
                                                                                    target="_blank"
                                                                                    icon={<FaFilePdf />}
                                                                                    size="xs"
                                                                                    colorScheme="red"
                                                                                    variant="solid"
                                                                                    borderRadius="lg"
                                                                                    aria-label="Open PDF"
                                                                                />
                                                                            </Tooltip>
                                                                            <Tooltip label="Send Invoice via WhatsApp" placement="top">
                                                                                <IconButton
                                                                                    icon={<FaWhatsapp />}
                                                                                    size="xs"
                                                                                    bg="#25D366"
                                                                                    color="white"
                                                                                    _hover={{ bg: '#128C7E' }}
                                                                                    borderRadius="lg"
                                                                                    aria-label="Send WhatsApp"
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation();
                                                                                        handleOpenWhatsappModal(group);
                                                                                    }}
                                                                                />
                                                                            </Tooltip>
                                                                        </>
                                                                    )}
                                                                    <Button
                                                                        size="xs"
                                                                        colorScheme="gray"
                                                                        bg="gray.800"
                                                                        color="white"
                                                                        _hover={{ bg: 'gray.700' }}
                                                                        variant="solid"
                                                                        borderRadius="lg"
                                                                        leftIcon={<FaListUl />}
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            if (activeTab === 4) {
                                                                                const siteObj = group.siteGroups?.[0]?.site || group.entries?.[0]?.site;
                                                                                handleOpenSiteDrawer(siteObj, group);
                                                                            } else {
                                                                                setSelectedGroup(group);
                                                                                setSelectedEntryForDocs(null);
                                                                            }
                                                                        }}
                                                                    >
                                                                        View Details
                                                                    </Button>
                                                                </HStack>
                                                            </Td>
                                                        </Tr>
                                                    );
                                                })}
                                            </Tbody>
                                        </Table>
                                    </TableContainer>

                                    {/* ── Closed Tab Pagination ── */}
                                    {activeTab === 4 && groupedGroups.length > 30 && (
                                        <Flex
                                            justify="center"
                                            align="center"
                                            py={4}
                                            px={{ base: 2, md: 6 }}
                                            borderTop="1px solid"
                                            borderColor="gray.100"
                                            bg="gray.50"
                                            gap={2}
                                            flexWrap="wrap"
                                        >
                                            {/* Prev */}
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                colorScheme="blue"
                                                borderRadius="xl"
                                                isDisabled={closedPage === 1}
                                                onClick={() => setClosedPage(p => Math.max(1, p - 1))}
                                            >
                                                ← Prev
                                            </Button>

                                            {/* Page number buttons */}
                                            {Array.from({ length: Math.ceil(groupedGroups.length / 30) }, (_, i) => i + 1).map(pg => (
                                                <Button
                                                    key={pg}
                                                    size="sm"
                                                    borderRadius="xl"
                                                    fontWeight="black"
                                                    colorScheme={pg === closedPage ? 'blue' : 'gray'}
                                                    variant={pg === closedPage ? 'solid' : 'ghost'}
                                                    onClick={() => setClosedPage(pg)}
                                                >
                                                    {pg}
                                                </Button>
                                            ))}

                                            {/* Next */}
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                colorScheme="blue"
                                                borderRadius="xl"
                                                isDisabled={closedPage >= Math.ceil(groupedGroups.length / 30)}
                                                onClick={() => setClosedPage(p => Math.min(Math.ceil(groupedGroups.length / 30), p + 1))}
                                            >
                                                Next →
                                            </Button>

                                            <Text fontSize="xs" color="gray.500" fontWeight="bold">
                                                Showing {((closedPage - 1) * 30) + 1}–{Math.min(closedPage * 30, groupedGroups.length)} of {groupedGroups.length}
                                            </Text>
                                        </Flex>
                                    )}
                                    </>
                                )}
                            </CardBody>
                        </Card>
                    )}
                </VStack>
            </Container>

                            {/* ── Site Detail Drawer ── */}
                            <Modal
                                isOpen={siteDrawer.isOpen}
                                onClose={() => setSiteDrawer(p => ({ ...p, isOpen: false }))}
                                size="5xl"
                                isCentered
                                scrollBehavior="inside"
                                isLazy
                                unmountOnClose
                            >
                                <ModalOverlay bg="blackAlpha.700" />
                                <ModalContent borderRadius="3xl" overflow="hidden" maxH="92vh">
                                    {siteDrawer.entry && (() => {
                                        const sd = siteDrawer;
                                        const inv = sd.invoiceGroup;
                                        const e0 = sd.entry;
                                        const site = sd.siteObj || {};
                                        const client = sd.clientObj || {};
                                        const totalAmt = inv?.totalAmt || e0?.invoiceDetails?.totalAmount || 0;
                                        const paidAmt = inv?.entries?.reduce((s, e) => s + Number(e.paymentAmount || 0), 0) || 0;
                                        const pendingAmt = Math.max(0, Number(totalAmt) - Number(paidAmt));
                                        const ps = inv?.paymentStatus || 'PENDING';
                                        const psBadge = { PAID: 'green', PARTIAL: 'yellow', PENDING: 'orange', OVERDUE: 'red' };
                                        const psLabel = { PAID: '✅ PAID', PARTIAL: '🟡 PARTIAL', PENDING: '🟠 PENDING', OVERDUE: '🔴 OVERDUE' };
                                        const isDirectClosed = (inv?.invoiceId === '—' || !inv?.invoiceId) && !inv?.pdfUrl;

                                        // Aggregate all documents across all entries in this invoice group
                                        const allEntries = inv?.entries || [e0];
                                        const allDocs = allEntries.flatMap(e => e.allDocuments || e.uploadedDocuments || []);
                                        const photos = allDocs.filter(d => d.url?.includes('/photos/') || d.url?.includes('photos') || d.name?.toLowerCase().match(/\.(jpe?g|png|gif|webp)$/i) || d.url?.includes('-photos'));
                                        const reports = allDocs.filter(d => d.url?.includes('/Daily_report/') || d.url?.includes('dailyReports') || d.name?.toLowerCase().includes('report'));
                                        const dataFiles = allDocs.filter(d => d.url?.includes('/data/') || d.name?.toLowerCase().match(/\.(dta|csv|xls|xlsx)$/i));
                                        const drawings = allDocs.filter(d => d.url?.includes('/drawing/') || d.name?.toLowerCase().match(/\.(dwg|dxf|pdf)$/i));
                                        const mailFiles = allEntries.flatMap(e => e.draftingWorkFiles?.mailFiles || []);
                                        const otherDocs = allDocs.filter(d => !photos.includes(d) && !reports.includes(d) && !dataFiles.includes(d) && !drawings.includes(d));

                                        const docCategories = [
                                            { label: '📷 Photos', files: photos, color: 'teal' },
                                            { label: '📄 Daily Reports', files: reports, color: 'blue' },
                                            { label: '📊 Data / Survey Files', files: dataFiles, color: 'purple' },
                                            { label: '📐 Drawings', files: drawings, color: 'orange' },
                                            { label: '📨 Mail / Final Files', files: mailFiles, color: 'green' },
                                            { label: '📎 Other Documents', files: otherDocs, color: 'gray' },
                                        ].filter(c => c.files.length > 0);

                                        let uniqueSites = [];
                                        if (inv?.siteGroups) {
                                            uniqueSites = inv.siteGroups.map(sg => sg.site).filter(Boolean);
                                        } else if (inv?.entries) {
                                            uniqueSites = inv.entries.map(e => e.site).filter((s, idx, arr) => s && arr.findIndex(x => (x?._id || x?.siteName) === (s?._id || s?.siteName)) === idx);
                                        } else if (inv?.sites) {
                                            uniqueSites = inv.sites.filter((s, idx, arr) => s && arr.findIndex(x => (x?._id || x?.siteName) === (s?._id || s?.siteName)) === idx);
                                        }
                                        if (uniqueSites.length === 0 && site.siteName) uniqueSites = [site];

                                        return (
                                            <Tabs index={siteDrawerTab} onChange={(idx) => setSiteDrawerTab(idx)} variant="enclosed" colorScheme="teal" isLazy display="flex" flexDirection="column" h="full" flex={1} overflow="hidden">
                                                <ModalHeader p={0}>
                                                    <Box bg="gray.800" p={{ base: 4, md: 6 }} borderBottom="1px solid" borderColor="gray.900">
                                                        <Flex justify="space-between" align="center" wrap="wrap" gap={3}>
                                                            <HStack spacing={4}>
                                                                <Box p={{ base: 2.5, md: 3.5 }} bg="gray.700" color="white" borderRadius="2xl" border="1px solid" borderColor="gray.600">
                                                                    <Icon as={FaMapMarkerAlt} w={{ base: 5, md: 7 }} h={{ base: 5, md: 7 }} />
                                                                </Box>
                                                                <VStack align="start" spacing={0.5}>
                                                                    <HStack spacing={2} wrap="wrap">
                                                                        <Text fontWeight="black" fontSize={{ base: "lg", md: "2xl" }} color="white">
                                                                            {uniqueSites.length > 1 ? `🏢 ${client.clientName || 'Client Details'} — ${uniqueSites.length} Sites Covered` : `📍 ${site.siteName || 'Site Details'}`}
                                                                        </Text>
                                                                        {site.siteId && uniqueSites.length === 1 && (
                                                                            <Badge bg="gray.700" color="gray.200" variant="solid" borderRadius="full" px={2.5}>
                                                                                ID: {site.siteId}
                                                                            </Badge>
                                                                        )}
                                                                        {isDirectClosed ? (
                                                                            <Badge colorScheme="gray" variant="solid" borderRadius="full" px={2.5} fontSize="xs">
                                                                                🔒 DIRECT CLOSED
                                                                            </Badge>
                                                                        ) : (
                                                                            <Badge colorScheme={inv?.isTaxInvoice ? 'green' : 'blue'} variant="solid" borderRadius="full" px={2.5} fontSize="xs">
                                                                                {inv?.isTaxInvoice ? '🧾 TAX INVOICE' : '📋 PROFORMA'}
                                                                            </Badge>
                                                                        )}
                                                                        <Badge colorScheme={psBadge[ps] || 'orange'} variant="solid" borderRadius="full" px={2.5} fontSize="xs">
                                                                            {psLabel[ps] || ps}
                                                                        </Badge>
                                                                    </HStack>
                                                                    <HStack spacing={3} wrap="wrap" fontSize="xs" color="gray.400" fontWeight="bold">
                                                                        <Text>🏢 Client: <Text as="span" color="white">{client.clientName || '—'}</Text></Text>
                                                                        {site.siteAddress && <Text>• 📍 {site.siteAddress}</Text>}
                                                                        {!isDirectClosed && inv?.invoiceId && inv.invoiceId !== '—' && <Text>• Invoice No: <Text as="span" color="white">{inv.invoiceId}</Text></Text>}
                                                                    </HStack>
                                                                </VStack>
                                                            </HStack>
                                                        </Flex>
                                                    </Box>
                                                    {/* Tabs List */}
                                                    <Box bg="gray.50" px={{ base: 3, md: 5 }} pt={2} borderBottom="1px solid" borderColor="gray.200">
                                                        <TabList 
                                                            borderBottom="none"
                                                            overflowX="auto" 
                                                            overflowY="hidden"
                                                            whiteSpace="nowrap" 
                                                            display="flex" 
                                                            gap={2} 
                                                            sx={{ 
                                                                WebkitOverflowScrolling: 'touch', 
                                                                scrollbarWidth: 'none', 
                                                                '&::-webkit-scrollbar': { display: 'none' } 
                                                            }}
                                                        >
                                                            <Tab flexShrink={0} fontWeight="black" color="gray.500" _selected={{ color: 'gray.800', bg: 'white', borderColor: 'gray.200', borderBottomColor: 'white' }} fontSize={{ base: "xs", md: "sm" }}>📍 Site & Work Overview</Tab>
                                                            <Tab flexShrink={0} fontWeight="black" color="gray.500" _selected={{ color: 'gray.800', bg: 'white', borderColor: 'gray.200', borderBottomColor: 'white' }} fontSize={{ base: "xs", md: "sm" }}>{isDirectClosed ? '💰 Payment Details' : '🧾 Invoice Details'}</Tab>
                                                            <Tab flexShrink={0} fontWeight="black" color="gray.500" _selected={{ color: 'gray.800', bg: 'white', borderColor: 'gray.200', borderBottomColor: 'white' }} fontSize={{ base: "xs", md: "sm" }}>
                                                                📁 Documents {docCategories.length > 0 ? `(${docCategories.reduce((s, c) => s + c.files.length, 0)})` : ''}
                                                                {selectedDocUrls.size > 0 && (
                                                                    <Badge ml={1} colorScheme="teal" borderRadius="full" fontSize="9px">{selectedDocUrls.size} ✓</Badge>
                                                                )}
                                                            </Tab>
                                                        </TabList>
                                                    </Box>
                                                </ModalHeader>
                                                <ModalCloseButton color="white" top={4} right={4} />
                                                <ModalBody p={{ base: 3, md: 6 }} overflowY="auto" bg="gray.50" flex={1}>
                                                    <TabPanels>
                                                        {/* TAB 1: OVERVIEW */}
                                                            <TabPanel p={0}>
                                                                <VStack spacing={5} align="stretch">
                                                                    {/* Site Details Card (First & Prominent) */}
                                                                    {uniqueSites.map((sObj, sIdx) => (
                                                                    <Card key={sIdx} borderRadius="2xl" variant="outline" border="2px solid" borderColor="teal.300" bg="white" shadow="sm">
                                                                        <CardBody p={5}>
                                                                            <Text fontSize="xs" fontWeight="black" color="teal.600" textTransform="uppercase" letterSpacing="wider" mb={3}>
                                                                                📍 Site Information — {sObj.siteName}
                                                                            </Text>
                                                                            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                                                                                {[
                                                                                    { label: 'Site Name', value: sObj.siteName },
                                                                                    { label: 'Site ID', value: sObj.siteId },
                                                                                    { label: 'Address', value: sObj.siteAddress },
                                                                                    { label: 'Location', value: sObj.siteLocation },
                                                                                    { label: 'State', value: sObj.stateName || sObj.state },
                                                                                    { label: 'State Code', value: sObj.stateCode },
                                                                                    { label: 'Work For', value: sObj.workForAppley },
                                                                                    { label: 'Status', value: sObj.status },
                                                                                ].filter(r => r.value).map(r => (
                                                                                    <Box key={r.label}>
                                                                                        <Text fontSize="10px" fontWeight="bold" color="gray.400" textTransform="uppercase">{r.label}</Text>
                                                                                        <Text fontSize="sm" fontWeight="bold" color="gray.700">{r.value}</Text>
                                                                                    </Box>
                                                                                ))}
                                                                            </SimpleGrid>
                                                                            {sObj.contactPersons?.length > 0 && (
                                                                                <Box mt={4} pt={3} borderTop="1px solid" borderColor="gray.100">
                                                                                    <Text fontSize="10px" fontWeight="bold" color="gray.400" textTransform="uppercase" mb={2}>Site Contact Persons</Text>
                                                                                    <Wrap spacing={2}>
                                                                                        {sObj.contactPersons.map((cp, ci) => (
                                                                                            <Tag key={ci} size="md" colorScheme="teal" borderRadius="full">
                                                                                                👤 {cp.name} {cp.phone ? `— 📞 ${cp.phone}` : ''}
                                                                                            </Tag>
                                                                                        ))}
                                                                                    </Wrap>
                                                                                </Box>
                                                                            )}
                                                                        </CardBody>
                                                                    </Card>
                                                                    ))}

                                                                    {/* Work entries for this site */}
                                                                    <Card borderRadius="2xl" variant="outline" border="1px solid" borderColor="blue.200" bg="white">
                                                                        <CardBody p={5}>
                                                                            <Text fontSize="xs" fontWeight="black" color="blue.600" textTransform="uppercase" letterSpacing="wider" mb={3}>📅 Work & Visit Entries ({allEntries.length})</Text>
                                                                            <VStack align="stretch" spacing={2}>
                                                                                {allEntries.map((entry, ei) => (
                                                                                    <HStack key={ei} spacing={3} p={3} bg="blue.50" borderRadius="xl">
                                                                                        <Icon as={FaCalendarAlt} color="blue.400" w={4} h={4} />
                                                                                        <VStack align="start" spacing={0} flex={1}>
                                                                                            <HStack spacing={2} wrap="wrap">
                                                                                                <Text fontSize="xs" fontWeight="bold" color="blue.800">{formatDate(entry.scheduleDate)}</Text>
                                                                                                <Tag size="sm" colorScheme="blue" variant="subtle" borderRadius="full" fontSize="10px">{entry.scheduleType || 'VISIT'}</Tag>
                                                                                                {entry.ledger && <Tag size="sm" colorScheme="gray" variant="subtle" borderRadius="full" fontSize="10px">{entry.ledger}</Tag>}
                                                                                            </HStack>
                                                                                            <Text fontSize="xs" color="gray.500">{entry.site?.siteName} {calculateEntryAmount(entry, inv?.invoiceDetails || entry.invoiceDetails) > 0 ? `• ₹${calculateEntryAmount(entry, inv?.invoiceDetails || entry.invoiceDetails).toLocaleString('en-IN')}` : ''}</Text>
                                                                                        </VStack>
                                                                                        <Badge colorScheme={entry.invoiceStatus === 'Closed' || entry.invoiceStatus === 'Completed' ? 'green' : 'orange'} fontSize="10px" borderRadius="full">
                                                                                            {entry.invoiceStatus || 'Pending'}
                                                                                        </Badge>
                                                                                    </HStack>
                                                                                ))}
                                                                            </VStack>
                                                                        </CardBody>
                                                                    </Card>

                                                                    {/* Client Info */}
                                                                    <Card borderRadius="2xl" variant="outline" border="1px solid" borderColor="purple.200" bg="white">
                                                                        <CardBody p={5}>
                                                                            <Text fontSize="xs" fontWeight="black" color="purple.600" textTransform="uppercase" letterSpacing="wider" mb={3}>🏢 Client Information</Text>
                                                                            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                                                                                {[
                                                                                    { label: 'Client Name', value: client.clientName },
                                                                                    { label: 'Client ID', value: client.clientId },
                                                                                    { label: 'Contact Person', value: client.contactPerson?.name },
                                                                                    { label: 'Contact Number', value: client.contactPerson?.phone || client.contactNumbers?.[0] },
                                                                                    { label: 'Email', value: client.email },
                                                                                    { label: 'GST No.', value: client.gstNo },
                                                                                    { label: 'PAN Card', value: client.panCard },
                                                                                    { label: 'Address', value: client.clientAddress },
                                                                                    { label: 'State', value: client.state },
                                                                                    { label: 'Pincode', value: client.pincode },
                                                                                ].filter(r => r.value).map(r => (
                                                                                    <Box key={r.label}>
                                                                                        <Text fontSize="10px" fontWeight="bold" color="gray.400" textTransform="uppercase">{r.label}</Text>
                                                                                        <Text fontSize="sm" fontWeight="semibold" color="gray.700">{r.value}</Text>
                                                                                    </Box>
                                                                                ))}
                                                                            </SimpleGrid>
                                                                        </CardBody>
                                                                    </Card>
                                                                </VStack>
                                                            </TabPanel>

                                                            {/* TAB 2: INVOICE */}
                                                            <TabPanel p={0}>
                                                                <VStack spacing={5} align="stretch">
                                                                    {/* Invoice Details Card */}
                                                                    {!isDirectClosed && (
                                                                    <Card borderRadius="2xl" variant="outline" border="1px solid" borderColor="purple.200">
                                                                        <CardBody p={6}>
                                                                            <HStack justify="space-between" mb={4}>
                                                                                <Text fontSize="xs" fontWeight="black" color="purple.600" textTransform="uppercase" letterSpacing="wider">🧾 Invoice Details</Text>
                                                                                <HStack spacing={2}>
                                                                                    <Badge colorScheme={inv?.isTaxInvoice ? 'green' : 'blue'} variant="solid" borderRadius="full" px={3} py={1} fontWeight="black">
                                                                                        {inv?.isTaxInvoice ? 'TAX INVOICE' : 'PROFORMA INVOICE'}
                                                                                    </Badge>
                                                                                    <Badge colorScheme={psBadge[ps] || 'orange'} variant="solid" borderRadius="full" px={3} py={1} fontWeight="black">
                                                                                        {psLabel[ps] || ps}
                                                                                    </Badge>
                                                                                </HStack>
                                                                            </HStack>
                                                                            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mb={5}>
                                                                                {[
                                                                                    { label: 'Invoice Number', value: inv?.invoiceId || '—' },
                                                                                    { label: 'Invoice Date', value: formatDate(inv?.generatedAt) },
                                                                                    { label: 'Due Date', value: formatDate(e0?.invoiceDetails?.dueDate) },
                                                                                    { label: 'GST Type', value: e0?.invoiceDetails?.gstType?.replace('_', '+') },
                                                                                    { label: 'GST %', value: e0?.invoiceDetails?.gstPercentage ? `${e0.invoiceDetails.gstPercentage}%` : null },
                                                                                    { label: 'Sites Included', value: `${uniqueSites.length} Site${uniqueSites.length !== 1 ? 's' : ''}` },
                                                                                ].filter(r => r.value).map(r => (
                                                                                    <Box key={r.label}>
                                                                                        <Text fontSize="10px" fontWeight="bold" color="gray.400" textTransform="uppercase">{r.label}</Text>
                                                                                        <Text fontSize="sm" fontWeight="bold" color="gray.700">{r.value}</Text>
                                                                                    </Box>
                                                                                ))}
                                                                            </SimpleGrid>
                                                                            <Divider mb={4} />
                                                                            {/* Amount Breakdown */}
                                                                            <VStack align="stretch" spacing={2}>
                                                                                <Flex justify="space-between">
                                                                                    <Text fontSize="sm" color="gray.500">Invoice Total</Text>
                                                                                    <Text fontSize="sm" fontWeight="black" color="purple.700">₹{Number(totalAmt).toLocaleString('en-IN')}</Text>
                                                                                </Flex>
                                                                                {paidAmt > 0 && (
                                                                                    <Flex justify="space-between">
                                                                                        <Text fontSize="sm" color="gray.500">Amount Paid</Text>
                                                                                        <Text fontSize="sm" fontWeight="black" color="green.600">₹{Number(paidAmt).toLocaleString('en-IN')}</Text>
                                                                                    </Flex>
                                                                                )}
                                                                                {pendingAmt > 0 && (
                                                                                    <Flex justify="space-between" pt={2} borderTop="2px solid" borderColor="orange.200">
                                                                                        <Text fontSize="sm" fontWeight="bold" color="orange.700">Pending Amount</Text>
                                                                                        <Text fontSize="lg" fontWeight="black" color={ps === 'OVERDUE' ? 'red.600' : 'orange.600'}>₹{Number(pendingAmt).toLocaleString('en-IN')}</Text>
                                                                                    </Flex>
                                                                                )}
                                                                            </VStack>
                                                                        </CardBody>
                                                                    </Card>
                                                                    )}

                                                                    {/* Payment History */}
                                                                    {allEntries.some(e => e.paymentRemark || e.paymentAmount) && (
                                                                        <Card borderRadius="2xl" variant="outline" border="1px solid" borderColor="green.200">
                                                                            <CardBody p={5}>
                                                                                <Text fontSize="xs" fontWeight="black" color="green.600" textTransform="uppercase" letterSpacing="wider" mb={3}>💰 Payment History</Text>
                                                                                <VStack align="stretch" spacing={2}>
                                                                                    {allEntries.filter(e => e.paymentRemark || e.paymentAmount).map((e, i) => (
                                                                                        <HStack key={i} p={3} bg="green.50" borderRadius="xl" spacing={3}>
                                                                                            <Icon as={FaMoneyBillWave} color="green.500" w={4} h={4} />
                                                                                            <VStack align="start" spacing={0} flex={1}>
                                                                                                {e.paymentAmount && <Text fontSize="sm" fontWeight="black" color="green.700">₹{Number(e.paymentAmount).toLocaleString('en-IN')} via {e.paymentMode || 'N/A'}</Text>}
                                                                                                {e.paymentRemark && <Text fontSize="xs" color="gray.500">{e.paymentRemark}</Text>}
                                                                                                {e.closedDate && <Text fontSize="xs" color="gray.400">Date: {formatDate(e.closedDate)}</Text>}
                                                                                            </VStack>
                                                                                        </HStack>
                                                                                    ))}
                                                                                </VStack>
                                                                            </CardBody>
                                                                        </Card>
                                                                    )}

                                                                    {/* Invoice Actions */}
                                                                    {!isDirectClosed && (
                                                                    <Card borderRadius="2xl" variant="outline" border="1px solid" borderColor="gray.200">
                                                                        <CardBody p={4}>
                                                                            <Text fontSize="xs" fontWeight="black" color="gray.500" textTransform="uppercase" letterSpacing="wider" mb={3}>Invoice Actions</Text>
                                                                            <HStack spacing={3} wrap="wrap">
                                                                                <Button
                                                                                    leftIcon={<FaEye />}
                                                                                    colorScheme="purple"
                                                                                    borderRadius="xl"
                                                                                    size="sm"
                                                                                    onClick={() => handlePreviewExistingPdf(inv?.pdfUrl, inv?.invoiceId, inv?.isTaxInvoice ? 'Tax Invoice' : 'Proforma Invoice', inv)}
                                                                                >
                                                                                    Preview Invoice
                                                                                </Button>
                                                                                {inv?.pdfUrl && (
                                                                                    <Button
                                                                                        as="a"
                                                                                        href={inv.pdfUrl.startsWith('http') ? inv.pdfUrl : `${API_BASE_URL}${inv.pdfUrl.startsWith('/') ? '' : '/'}${inv.pdfUrl}`}
                                                                                        target="_blank"
                                                                                        leftIcon={<FaFilePdf />}
                                                                                        colorScheme="red"
                                                                                        variant="outline"
                                                                                        borderRadius="xl"
                                                                                        size="sm"
                                                                                    >
                                                                                        Open PDF
                                                                                    </Button>
                                                                                )}

                                                                            </HStack>
                                                                        </CardBody>
                                                                    </Card>
                                                                    )}
                                                                </VStack>
                                                            </TabPanel>

                                                            {/* TAB 3: DOCUMENTS */}
                                                            <TabPanel p={0}>
                                                                {docCategories.length === 0 ? (
                                                                    <Card borderRadius="2xl" variant="outline" border="1px solid" borderColor="gray.200">
                                                                        <CardBody p={10} textAlign="center">
                                                                            <VStack spacing={3}>
                                                                                <Icon as={FaFileAlt} w={10} h={10} color="gray.200" />
                                                                                <Text color="gray.400" fontWeight="bold">No documents uploaded for this site</Text>
                                                                            </VStack>
                                                                        </CardBody>
                                                                    </Card>
                                                                ) : (
                                                                    <VStack spacing={4} align="stretch">
                                                                        {/* Selected count banner */}
                                                                        {selectedDocUrls.size > 0 && (
                                                                            <Flex align="center" justify="space-between" bg="teal.50" border="1px solid" borderColor="teal.200" borderRadius="xl" px={4} py={2.5}>
                                                                                <HStack spacing={2}>
                                                                                    <Icon as={FaCheckCircle} color="teal.500" />
                                                                                    <Text fontSize="sm" fontWeight="bold" color="teal.700">
                                                                                        {selectedDocUrls.size} document{selectedDocUrls.size !== 1 ? 's' : ''} selected — will be sent with WhatsApp reminder
                                                                                    </Text>
                                                                                </HStack>
                                                                                <Button size="xs" variant="ghost" colorScheme="teal" onClick={() => setSelectedDocUrls(new Set())}>
                                                                                    Clear All
                                                                                </Button>
                                                                            </Flex>
                                                                        )}

                                                                        {docCategories.map((cat) => {
                                                                            const catUrls = cat.files.map(f => f.url).filter(Boolean);
                                                                            const allSelected = catUrls.length > 0 && catUrls.every(u => selectedDocUrls.has(u));
                                                                            const someSelected = catUrls.some(u => selectedDocUrls.has(u));

                                                                            const toggleCatAll = () => {
                                                                                setSelectedDocUrls(prev => {
                                                                                    const next = new Set(prev);
                                                                                    if (allSelected) {
                                                                                        catUrls.forEach(u => next.delete(u));
                                                                                    } else {
                                                                                        catUrls.forEach(u => next.add(u));
                                                                                    }
                                                                                    return next;
                                                                                });
                                                                            };

                                                                            return (
                                                                                <Card key={cat.label} borderRadius="2xl" variant="outline" border="1px solid" borderColor={`${cat.color}.200`}>
                                                                                    <CardBody p={4}>
                                                                                        <HStack justify="space-between" mb={3}>
                                                                                            <HStack spacing={3}>
                                                                                                <Checkbox
                                                                                                    colorScheme={cat.color}
                                                                                                    isChecked={allSelected}
                                                                                                    isIndeterminate={someSelected && !allSelected}
                                                                                                    onChange={toggleCatAll}
                                                                                                    size="md"
                                                                                                />
                                                                                                <Text fontSize="xs" fontWeight="black" color={`${cat.color}.600`} textTransform="uppercase" letterSpacing="wider">
                                                                                                    {cat.label}
                                                                                                </Text>
                                                                                            </HStack>
                                                                                            <HStack spacing={2}>
                                                                                                {someSelected && (
                                                                                                    <Badge colorScheme="teal" borderRadius="full" px={2} fontSize="9px">
                                                                                                        {catUrls.filter(u => selectedDocUrls.has(u)).length} selected
                                                                                                    </Badge>
                                                                                                )}
                                                                                                <Badge colorScheme={cat.color} borderRadius="full" px={2}>{cat.files.length} file{cat.files.length !== 1 ? 's' : ''}</Badge>
                                                                                            </HStack>
                                                                                        </HStack>
                                                                                        <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={3}>
                                                                                            {cat.files.map((f, fi) => {
                                                                                                const isImage = f.url?.match(/\.(jpe?g|png|gif|webp)$/i) || f.name?.match(/\.(jpe?g|png|gif|webp)$/i);
                                                                                                const isPdf = f.url?.match(/\.pdf$/i) || f.name?.match(/\.pdf$/i);
                                                                                                const fileUrl = f.url?.startsWith('http') ? f.url : `${f.url}`;
                                                                                                const isChecked = !!f.url && selectedDocUrls.has(f.url);

                                                                                                const toggleDoc = (e) => {
                                                                                                    e.stopPropagation();
                                                                                                    if (!f.url) return;
                                                                                                    setSelectedDocUrls(prev => {
                                                                                                        const next = new Set(prev);
                                                                                                        if (next.has(f.url)) next.delete(f.url);
                                                                                                        else next.add(f.url);
                                                                                                        return next;
                                                                                                    });
                                                                                                };

                                                                                                return (
                                                                                                    <Box
                                                                                                        key={fi}
                                                                                                        borderRadius="xl"
                                                                                                        overflow="hidden"
                                                                                                        border="2px solid"
                                                                                                        borderColor={isChecked ? `${cat.color}.400` : `${cat.color}.100`}
                                                                                                        bg={isChecked ? `${cat.color}.50` : 'white'}
                                                                                                        shadow={isChecked ? 'md' : 'sm'}
                                                                                                        transition="all 0.15s"
                                                                                                        position="relative"
                                                                                                    >
                                                                                                        {/* Checkbox overlay top-left */}
                                                                                                        <Box
                                                                                                            position="absolute"
                                                                                                            top={2}
                                                                                                            left={2}
                                                                                                            zIndex={2}
                                                                                                            bg="white"
                                                                                                            borderRadius="md"
                                                                                                            p={0.5}
                                                                                                            shadow="sm"
                                                                                                            onClick={toggleDoc}
                                                                                                        >
                                                                                                            <Checkbox
                                                                                                                colorScheme={cat.color}
                                                                                                                isChecked={isChecked}
                                                                                                                onChange={toggleDoc}
                                                                                                                size="md"
                                                                                                            />
                                                                                                        </Box>

                                                                                                        {/* Thumbnail / icon area (click to open) */}
                                                                                                        <Box cursor="pointer" onClick={() => f.url && window.open(fileUrl, '_blank')}>
                                                                                                            {isImage ? (
                                                                                                                <Box h="80px" overflow="hidden">
                                                                                                                    <img src={fileUrl} alt={f.name} style={{ width: '100%', height: '80px', objectFit: 'cover' }} onError={e => { e.target.style.display = 'none'; }} />
                                                                                                                </Box>
                                                                                                            ) : (
                                                                                                                <Flex h="60px" align="center" justify="center" bg={isChecked ? `${cat.color}.100` : `${cat.color}.50`}>
                                                                                                                    <Icon as={isPdf ? FaFilePdf : FaFileAlt} w={8} h={8} color={`${cat.color}.400`} />
                                                                                                                </Flex>
                                                                                                            )}
                                                                                                            <Box p={2}>
                                                                                                                <Text fontSize="11px" fontWeight="bold" color="gray.700" noOfLines={1} title={f.name}>{f.name || 'Document'}</Text>
                                                                                                                {f.uploadedAt && <Text fontSize="10px" color="gray.400">{formatDate(f.uploadedAt)}</Text>}
                                                                                                            </Box>
                                                                                                        </Box>
                                                                                                    </Box>
                                                                                                );
                                                                                            })}
                                                                                        </SimpleGrid>
                                                                                    </CardBody>
                                                                                </Card>
                                                                            );
                                                                        })}
                                                                    </VStack>
                                                                )}
                                                            </TabPanel>
                                                    </TabPanels>
                                                </ModalBody>
                                                <ModalFooter borderTop="1px solid" borderColor="gray.200" bg="white" gap={2} wrap="wrap">
                                                    {!isDirectClosed && inv?.pdfUrl && (
                                                        <>
                                                            <Button size="sm" leftIcon={<FaEye />} colorScheme="purple" borderRadius="xl"
                                                                onClick={() => handlePreviewExistingPdf(inv.pdfUrl, inv.invoiceId, inv.isTaxInvoice ? 'Tax Invoice' : 'Proforma Invoice', inv)}>
                                                                Preview Invoice
                                                            </Button>
                                                            <Button 
                                                                as="a" 
                                                                href={inv.pdfUrl.startsWith('http') ? inv.pdfUrl : `${API_BASE_URL}${inv.pdfUrl.startsWith('/') ? '' : '/'}${inv.pdfUrl}`} 
                                                                target="_blank" 
                                                                size="sm" 
                                                                leftIcon={<FaFilePdf />} 
                                                                colorScheme="red" 
                                                                variant="outline" 
                                                                borderRadius="xl"
                                                            >
                                                                Open PDF
                                                            </Button>
                                                        </>
                                                    )}
                                                    {selectedDocUrls.size > 0 ? (
                                                        <Button
                                                            size="sm"
                                                            colorScheme="whatsapp"
                                                            borderRadius="xl"
                                                            leftIcon={<FaWhatsapp />}
                                                            onClick={() => {
                                                                if (!siteDrawer.entry) return;
                                                                handleOpenWhatsappModal({
                                                                    ...siteDrawer.invoiceGroup,
                                                                    additionalDocUrls: Array.from(selectedDocUrls)
                                                                });
                                                            }}
                                                        >
                                                            Send WhatsApp + {selectedDocUrls.size} Docs
                                                        </Button>
                                                    ) : null}
                                                    <Button size="sm" variant="ghost" borderRadius="xl" onClick={() => setSiteDrawer(p => ({ ...p, isOpen: false }))}>Close</Button>
                                                </ModalFooter>
                                            </Tabs>
                                        );
                                    })()}
                                </ModalContent>
                            </Modal>
            {/* ── Group Details & Billing Checkbox Modal ── */}
            <Modal isOpen={!!selectedGroup} onClose={() => { setSelectedGroup(null); setSelectedEntryForDocs(null); }} size="5xl" isCentered scrollBehavior="inside" isLazy unmountOnClose>
                <ModalOverlay bg="blackAlpha.700" />
                <ModalContent borderRadius={{ base: "2xl", md: "3xl" }} overflow="hidden" boxShadow="2xl" maxW={{ base: "98vw", lg: "5xl" }} maxH={{ base: "94vh", md: "90vh" }}>
                    <ModalHeader p={0}>
                        <Box bg="gray.800" p={{ base: 4, md: 6 }} borderBottom="1px solid" borderColor="gray.900">
                            <HStack spacing={{ base: 3, md: 4 }}>
                                <Box p={{ base: 2.5, md: 3.5 }} bg="gray.700" color="white" borderRadius="2xl" shadow="sm" border="1px solid" borderColor="gray.600">
                                    <Icon as={FaBuilding} w={{ base: 5, md: 7 }} h={{ base: 5, md: 7 }} />
                                </Box>
                                <VStack align="start" spacing={0}>
                                    <Text fontWeight="black" fontSize={{ base: "md", md: "xl" }} color="white">
                                        {selectedGroup?.client?.clientName || 'Client Details'}
                                    </Text>
                                    <Text fontSize="2xs" color="gray.400" fontWeight="bold">
                                        {selectedGroup?.siteGroups?.length || 0} {selectedGroup?.siteGroups?.length === 1 ? 'Site' : 'Sites'} Available • {selectedGroup?.entries?.length || 0} Total Visit Entries
                                    </Text>
                                </VStack>
                            </HStack>
                        </Box>
                    </ModalHeader>
                    <ModalCloseButton color="white" top={4} right={4} />
                    <ModalBody p={{ base: 3, sm: 4, md: 6 }} maxH={{ base: "80vh", md: "75vh" }} overflowY="auto" bg="gray.50">
                        {selectedGroup && (() => {
                            const modalClientId = String(selectedGroup.client?._id || selectedGroup.client);
                            const isModalClientMismatch = activeSelectedClientId && modalClientId !== activeSelectedClientId;

                            return (
                                <VStack spacing={6} align="stretch">
                                    {isModalClientMismatch && (
                                        <Alert status="warning" borderRadius="xl">
                                            <AlertIcon />
                                            <Box flex="1">
                                                <AlertTitle fontSize="xs" fontWeight="bold">Selection Locked to {activeSelectedClientName}</AlertTitle>
                                                <AlertDescription fontSize="xs" display="block">
                                                    You currently have entries selected for <b>{activeSelectedClientName}</b>. To select entries for <b>{selectedGroup.client?.clientName}</b>, clear your active selection first.
                                                </AlertDescription>
                                            </Box>
                                        </Alert>
                                    )}

                                    {/* Level 2: Loop over Sites for this Client */}
                                    {selectedGroup.siteGroups?.map((siteGroup, siteIdx) => {
                                        const siteObj = siteGroup.site || {};
                                        const siteName = siteObj.siteName || 'Site Details';
                                        const sitePendingCount = siteGroup.entries.filter(e => e.invoiceStatus !== 'Completed').length;

                                        return (
                                            <Card key={siteGroup.siteKey || siteIdx} borderRadius="2xl" variant="outline" shadow="sm" overflow="hidden" border="1px solid" borderColor="teal.200" bg="white">
                                                <Box bg="teal.50" px={5} py={3.5} borderBottom="1px solid" borderColor="teal.100">
                                                    <Flex justify="space-between" align="center">
                                                        <HStack spacing={3}>
                                                            <Icon as={FaMapMarkerAlt} color="teal.600" w={4} h={4} />
                                                            <VStack align="start" spacing={0}>
                                                                <Text fontWeight="extrabold" fontSize="md" color="teal.800">
                                                                    {siteName}
                                                                </Text>
                                                                {(siteObj.siteAddress || siteObj.stateName) && (
                                                                    <Text fontSize="xs" color="gray.500">
                                                                        {siteObj.siteAddress || siteObj.stateName}
                                                                    </Text>
                                                                )}
                                                            </VStack>
                                                        </HStack>
                                                        <HStack spacing={2}>
                                                            {(!siteObj.ledgerItems || siteObj.ledgerItems.length === 0) && (
                                                                <Badge colorScheme="red" variant="solid" borderRadius="full" px={3} py={0.5} fontSize="xs" fontWeight="bold">
                                                                    ⚠️ No Ledgers Configured (Go to Site Master)
                                                                </Badge>
                                                            )}
                                                            <Badge colorScheme="blue" borderRadius="full" px={3} py={0.5} fontSize="xs" fontWeight="bold">
                                                                {siteGroup.entries.length} Entries
                                                            </Badge>
                                                            {sitePendingCount > 0 ? (
                                                                <Badge colorScheme="orange" variant="solid" borderRadius="full" px={3} py={0.5} fontSize="xs" fontWeight="bold">
                                                                    ⏳ {sitePendingCount} Pending
                                                                </Badge>
                                                            ) : (
                                                                <Badge colorScheme="green" variant="solid" borderRadius="full" px={3} py={0.5} fontSize="xs" fontWeight="bold">
                                                                    ✅ All Completed
                                                                </Badge>
                                                            )}
                                                        </HStack>
                                                    </Flex>
                                                </Box>
                                                <CardBody p={0}>
                                                    {(() => {
                                                        const monthEntries = siteGroup.entries.filter(e => e.scheduleType === 'MONTH');
                                                        const otherEntries = siteGroup.entries.filter(e => e.scheduleType !== 'MONTH');

                                                        return (
                                                            <TableContainer overflow="hidden">
                                                                <Table size="sm" variant="simple">
                                                                    <Thead bg="gray.100">
                                                                        <Tr>
                                                                            <Th w="60px" py={3}>BILL</Th>
                                                                            <Th py={3}>Date / Details</Th>
                                                                            <Th py={3}>Operative</Th>
                                                                            <Th py={3}>Schedule Type</Th>
                                                                            <Th py={3}>Ledger Type</Th>
                                                                            <Th py={3} textAlign="right">Actions</Th>
                                                                        </Tr>
                                                                    </Thead>
                                                                    <Tbody>
                                                                        {/* 1. Month Contract Row (if present) */}
                                                                        {monthEntries.length > 0 && (() => {
                                                                            const firstMonth = monthEntries[0];
                                                                            const monthIds = monthEntries.map(e => e._id);
                                                                            const isAllMonthSelected = monthIds.every(id => selectedEntries.includes(id));
                                                                            const isSelected = selectedEntryForDocs?._id === firstMonth._id;

                                                                            return (
                                                                                <React.Fragment key="month-contract-row">
                                                                                    <Tr bg={isSelected ? 'blue.50' : 'blue.50/30'} _hover={{ bg: "blue.50" }}>
                                                                                        <Td py={3.5}>
                                                                                            <Checkbox
                                                                                                colorScheme="green"
                                                                                                isChecked={isAllMonthSelected}
                                                                                                isDisabled={isModalClientMismatch && !isAllMonthSelected}
                                                                                                onChange={(e) => {
                                                                                                    if (e.target.checked) {
                                                                                                        if (activeSelectedClientId && modalClientId !== activeSelectedClientId) {
                                                                                                            toast({
                                                                                                                title: 'Single Client Selection Only',
                                                                                                                description: `Selection is currently active for ${activeSelectedClientName}. Please clear selection before picking another client.`,
                                                                                                                status: 'warning',
                                                                                                                duration: 4000
                                                                                                            });
                                                                                                            return;
                                                                                                        }
                                                                                                        setSelectedEntries(prev => [...new Set([...prev, ...monthIds])]);
                                                                                                    } else {
                                                                                                        setSelectedEntries(prev => prev.filter(id => !monthIds.includes(id)));
                                                                                                    }
                                                                                                }}
                                                                                            />
                                                                                        </Td>
                                                                                        <Td py={3.5} fontWeight="extrabold" color="blue.800">
                                                                                            <VStack align="start" spacing={0}>
                                                                                                <Text fontSize="xs" fontWeight="extrabold">{siteName} (Month Contract)</Text>
                                                                                                {firstMonth.closedDate && (
                                                                                                    <Badge colorScheme="green" variant="subtle" fontSize="9px" borderRadius="full">
                                                                                                        Closed: {formatDate(firstMonth.closedDate)}
                                                                                                    </Badge>
                                                                                                )}
                                                                                                {firstMonth.paymentRemark && (
                                                                                                    <Text fontSize="9px" color="teal.600" italic noOfLines={1} title={firstMonth.paymentRemark}>
                                                                                                        💬 {firstMonth.paymentRemark}
                                                                                                    </Text>
                                                                                                )}
                                                                                            </VStack>
                                                                                        </Td>
                                                                                        <Td py={3.5}>
                                                                                            <Text fontSize="xs" color="gray.400">Monthly Contract</Text>
                                                                                        </Td>
                                                                                        <Td py={3.5}>
                                                                                            <Badge colorScheme="blue" variant="solid" borderRadius="full" px={3} py={0.5} fontSize="10px">
                                                                                                Month Contract
                                                                                            </Badge>
                                                                                        </Td>
                                                                                        <Td py={3.5}>
                                                                                            <Badge colorScheme="purple" variant="subtle" borderRadius="full" px={3} py={0.5} fontSize="10px">
                                                                                                {firstMonth.ledger || 'Month Contract'}
                                                                                            </Badge>
                                                                                        </Td>
                                                                                        <Td py={3.5} textAlign="right">
                                                                                            <Tooltip label={isSelected ? "Hide Documents" : "View Contract Documents"} placement="top">
                                                                                                <IconButton
                                                                                                    aria-label="Toggle Documents"
                                                                                                    icon={<FaEye />}
                                                                                                    size="xs"
                                                                                                    colorScheme="blue"
                                                                                                    variant={isSelected ? 'solid' : 'ghost'}
                                                                                                    borderRadius="full"
                                                                                                    onClick={() => setSelectedEntryForDocs(isSelected ? null : firstMonth)}
                                                                                                />
                                                                                            </Tooltip>
                                                                                        </Td>
                                                                                    </Tr>
                                                                                    {isSelected && (
                                                                                        <Tr bg="gray.50">
                                                                                            <Td colSpan={6} p={0} borderBottom="none">
                                                                                                {(() => {
                                                                                                    const docs = firstMonth.allDocuments || [];
                                                                                                    const photos = docs.filter(d => d.url?.includes('/photos/') || d.name?.toLowerCase().includes('photo') || d.url?.includes('site_') && d.url?.includes('photos') || d.url?.includes('/uploads/photos-'));
                                                                                                    const reports = docs.filter(d => d.url?.includes('/Daily_report/') || d.url?.includes('dailyReports') || d.name?.toLowerCase().includes('report'));
                                                                                                    const data = docs.filter(d => d.url?.includes('/data/') || d.url?.includes('dataFiles') || d.url?.includes('site_') && d.url?.includes('data'));
                                                                                                    const drawing = docs.filter(d => d.url?.includes('/drawing/') || d.url?.includes('/drafting/') || d.url?.includes('site_') && (d.url?.includes('drawing') || d.url?.includes('drafting')));
                                                                                                    const expenseReceipts = docs.filter(d => d.url?.includes('expense_') || d.url?.includes('otherExpense_') || d.category);
                                                                                                    const topographyMails = docs.filter(d => d.isMail || d.url?.includes('/drawing/') || d.url?.includes('/drafting/'));

                                                                                                    const formatDateTime = (dateStr) => {
                                                                                                        if (!dateStr) return '—';
                                                                                                        const d = new Date(dateStr);
                                                                                                        const dd = String(d.getDate()).padStart(2, '0');
                                                                                                        const mm = String(d.getMonth() + 1).padStart(2, '0');
                                                                                                        const yyyy = d.getFullYear();
                                                                                                        const hh = String(d.getHours()).padStart(2, '0');
                                                                                                        const min = String(d.getMinutes()).padStart(2, '0');
                                                                                                        const ss = String(d.getSeconds()).padStart(2, '0');
                                                                                                        return `${dd}/${mm}/${yyyy} ${hh}:${min}:${ss}`;
                                                                                                    };

                                                                                                    return (
                                                                                                        <Box p={5} bg="gray.100" borderTop="1px dashed" borderBottom="1px solid" borderColor="gray.200" boxShadow="inner">
                                                                                                            <Flex justify="space-between" align="center" mb={4}>
                                                                                                                <Text fontSize="xs" fontWeight="black" color="blue.600" textTransform="uppercase">
                                                                                                                    Uploaded Documents: Month Contract
                                                                                                                </Text>
                                                                                                            </Flex>

                                                                                                            {docs.length === 0 ? (
                                                                                                                <Center py={6} bg="white" borderRadius="xl" border="1px dashed" borderColor="gray.300">
                                                                                                                    <VStack spacing={2}>
                                                                                                                        <Icon as={FaFileAlt} w={8} h={8} color="gray.300" />
                                                                                                                        <Text color="gray.400" fontSize="sm">No documents found for this contract</Text>
                                                                                                                    </VStack>
                                                                                                                </Center>
                                                                                                            ) : (
                                                                                                                <VStack spacing={4} align="stretch">
                                                                                                                    {[
                                                                                                                        { label: 'Topography Final Mails', files: topographyMails, color: 'red', icon: FaEnvelope },
                                                                                                                        { label: 'Photos', files: photos, color: 'pink', icon: FaCamera },
                                                                                                                        { label: 'Daily Reports', files: reports, color: 'blue', icon: FaFilePdf },
                                                                                                                        { label: 'Data Files', files: data, color: 'teal', icon: FaFileAlt },
                                                                                                                        { label: 'Drawings', files: drawing, color: 'orange', icon: FaFileAlt },
                                                                                                                        { label: 'Expense Receipts', files: expenseReceipts, color: 'green', icon: FaFileInvoiceDollar },
                                                                                                                    ].map(({ label, files, color, icon }) => files && files.length > 0 && (
                                                                                                                        <Box key={label} bg="white" p={4} borderRadius="xl" border="1px solid" borderColor="gray.150" shadow="sm">
                                                                                                                            <Text fontSize="10px" fontWeight="black" color={`${color}.500`} textTransform="uppercase" mb={2}>
                                                                                                                                {label} ({files.length})
                                                                                                                            </Text>
                                                                                                                            <VStack spacing={2} align="stretch">
                                                                                                                                {files.map((doc, i) => (
                                                                                                                                    <HStack
                                                                                                                                        key={i}
                                                                                                                                        p={3}
                                                                                                                                        bg={`${color}.50`}
                                                                                                                                        borderRadius="xl"
                                                                                                                                        border="1px solid"
                                                                                                                                        borderColor={`${color}.100`}
                                                                                                                                        justify="space-between"
                                                                                                                                    >
                                                                                                                                        <HStack spacing={3}>
                                                                                                                                            <Icon as={icon} color={`${color}.500`} />
                                                                                                                                            <VStack align="start" spacing={0}>
                                                                                                                                                <Text fontSize="sm" fontWeight="bold" color="gray.700">{doc.name}</Text>
                                                                                                                                                <Text fontSize="xs" color="gray.400">{formatDateTime(doc.uploadedAt)}</Text>
                                                                                                                                            </VStack>
                                                                                                                                        </HStack>
                                                                                                                                        <IconButton
                                                                                                                                            as="a"
                                                                                                                                            href={`${API_BASE_URL}${doc.url}`}
                                                                                                                                            target="_blank"
                                                                                                                                            icon={<FaDownload />}
                                                                                                                                            size="sm"
                                                                                                                                            colorScheme={color}
                                                                                                                                            variant="ghost"
                                                                                                                                            borderRadius="full"
                                                                                                                                            aria-label="Download"
                                                                                                                                        />
                                                                                                                                    </HStack>
                                                                                                                                ))}
                                                                                                                            </VStack>
                                                                                                                        </Box>
                                                                                                                    ))}
                                                                                                                </VStack>
                                                                                                            )}
                                                                                                        </Box>
                                                                                                    );
                                                                                                })()}
                                                                                            </Td>
                                                                                        </Tr>
                                                                                    )}
                                                                                </React.Fragment>
                                                                            );
                                                                        })()}

                                                                        {/* 2. Individual Visit / Topography / Point Marking Rows */}
                                                                        {otherEntries.map((entry) => {
                                                                            const innerStyles = rowStyle(entry);
                                                                            const isSelected = selectedEntryForDocs?._id === entry._id;
                                                                            return (
                                                                                <React.Fragment key={entry._id}>
                                                                                    <Tr _hover={{ bg: innerStyles.hoverBg }} bg={isSelected ? 'gray.50' : 'transparent'}>
                                                                                        <Td py={3}>
                                                                                            <Checkbox
                                                                                                colorScheme="green"
                                                                                                isChecked={selectedEntries.includes(entry._id)}
                                                                                                isDisabled={isModalClientMismatch && !selectedEntries.includes(entry._id)}
                                                                                                onChange={(e) => {
                                                                                                    if (e.target.checked) {
                                                                                                        if (activeSelectedClientId && modalClientId !== activeSelectedClientId) {
                                                                                                            toast({
                                                                                                                title: 'Single Client Selection Only',
                                                                                                                description: `Selection is currently active for ${activeSelectedClientName}. Please clear selection before picking another client.`,
                                                                                                                status: 'warning',
                                                                                                                duration: 4000
                                                                                                            });
                                                                                                            return;
                                                                                                        }
                                                                                                        setSelectedEntries(prev => [...prev, entry._id]);
                                                                                                    } else {
                                                                                                        setSelectedEntries(prev => prev.filter(id => id !== entry._id));
                                                                                                    }
                                                                                                }}
                                                                                            />
                                                                                        </Td>
                                                                                        <Td py={3} fontWeight="bold" color="gray.700">
                                                                                            <VStack align="start" spacing={0}>
                                                                                                <Text fontSize="xs">{formatDate(entry.scheduleDate)}</Text>
                                                                                                {entry.closedDate && (
                                                                                                    <Badge colorScheme="green" variant="subtle" fontSize="9px" borderRadius="full">
                                                                                                        Closed: {formatDate(entry.closedDate)}
                                                                                                    </Badge>
                                                                                                )}
                                                                                                {entry.paymentRemark && (
                                                                                                    <Text fontSize="9px" color="teal.600" italic noOfLines={1} title={entry.paymentRemark}>
                                                                                                        💬 {entry.paymentRemark}
                                                                                                    </Text>
                                                                                                )}
                                                                                            </VStack>
                                                                                        </Td>
                                                                                        <Td py={3}>
                                                                                            {entry.operative?.name ? (
                                                                                                <HStack spacing={1}>
                                                                                                    <Icon as={FaUser} color="purple.400" w={3} h={3} />
                                                                                                    <Text fontSize="xs">{entry.operative.name}</Text>
                                                                                                </HStack>
                                                                                            ) : (
                                                                                                <Text fontSize="xs" color="gray.400">Unassigned</Text>
                                                                                            )}
                                                                                        </Td>
                                                                                        <Td py={3}>
                                                                                            <Badge size="xs" colorScheme={entry.scheduleType === 'TOPOGRAPHY SURVEY' ? 'red' : 'purple'}>
                                                                                                {entry.scheduleType === 'TOPOGRAPHY SURVEY' ? 'Topography Survey / Drafting' : entry.scheduleType || 'Visit'}
                                                                                            </Badge>
                                                                                        </Td>
                                                                                        <Td py={3}>
                                                                                            {entry.scheduleType === 'TOPOGRAPHY SURVEY' ? (
                                                                                                <Badge colorScheme="teal" variant="solid" borderRadius="full" px={2} fontSize="9px">
                                                                                                    Drafting Work
                                                                                                </Badge>
                                                                                            ) : (
                                                                                                <Badge
                                                                                                    colorScheme={(entry.ledger || 'Full Day') === 'Full Day' ? 'green' : 'orange'}
                                                                                                    variant="solid"
                                                                                                    borderRadius="full"
                                                                                                    px={2}
                                                                                                    fontSize="9px"
                                                                                                >
                                                                                                    {entry.ledger || 'Full Day'}
                                                                                                </Badge>
                                                                                            )}
                                                                                        </Td>
                                                                                        <Td py={3} textAlign="right">
                                                                                            <Tooltip label={isSelected ? "Hide Documents" : "View Entry Documents"} placement="top">
                                                                                                <IconButton
                                                                                                    aria-label="Toggle Entry Documents"
                                                                                                    icon={<FaEye />}
                                                                                                    size="xs"
                                                                                                    colorScheme="teal"
                                                                                                    variant={isSelected ? 'solid' : 'ghost'}
                                                                                                    borderRadius="full"
                                                                                                    onClick={() => setSelectedEntryForDocs(isSelected ? null : entry)}
                                                                                                />
                                                                                            </Tooltip>
                                                                                        </Td>
                                                                                    </Tr>
                                                                                    {isSelected && (
                                                                                        <Tr bg="gray.50">
                                                                                            <Td colSpan={6} p={0} borderBottom="none">
                                                                                                {(() => {
                                                                                                    const docs = entry.allDocuments || [];
                                                                                                    const photos = docs.filter(d => d.url?.includes('/photos/') || d.name?.toLowerCase().includes('photo') || d.url?.includes('site_') && d.url?.includes('photos') || d.url?.includes('/uploads/photos-'));
                                                                                                    const reports = docs.filter(d => d.url?.includes('/Daily_report/') || d.url?.includes('dailyReports') || d.name?.toLowerCase().includes('report'));
                                                                                                    const data = docs.filter(d => d.url?.includes('/data/') || d.url?.includes('dataFiles') || d.url?.includes('site_') && d.url?.includes('data'));
                                                                                                    const drawing = docs.filter(d => d.url?.includes('/drawing/') || d.url?.includes('site_') && d.url?.includes('drawing'));
                                                                                                    const expenseReceipts = docs.filter(d => d.url?.includes('expense_') || d.url?.includes('otherExpense_') || d.category);
                                                                                                    const topographyMails = docs.filter(d => d.isMail);

                                                                                                    const formatDateTime = (dateStr) => {
                                                                                                        if (!dateStr) return '—';
                                                                                                        const d = new Date(dateStr);
                                                                                                        const dd = String(d.getDate()).padStart(2, '0');
                                                                                                        const mm = String(d.getMonth() + 1).padStart(2, '0');
                                                                                                        const yyyy = d.getFullYear();
                                                                                                        const hh = String(d.getHours()).padStart(2, '0');
                                                                                                        const min = String(d.getMinutes()).padStart(2, '0');
                                                                                                        const ss = String(d.getSeconds()).padStart(2, '0');
                                                                                                        return `${dd}/${mm}/${yyyy} ${hh}:${min}:${ss}`;
                                                                                                    };

                                                                                                    return (
                                                                                                        <Box p={5} bg="gray.100" borderTop="1px dashed" borderBottom="1px solid" borderColor="gray.200" boxShadow="inner">
                                                                                                            <Flex justify="space-between" align="center" mb={4}>
                                                                                                                <Text fontSize="xs" fontWeight="black" color="blue.600" textTransform="uppercase">
                                                                                                                    Uploaded Documents: {formatDate(entry.scheduleDate)}
                                                                                                                </Text>
                                                                                                            </Flex>

                                                                                                            {docs.length === 0 ? (
                                                                                                                <Center py={6} bg="white" borderRadius="xl" border="1px dashed" borderColor="gray.300">
                                                                                                                    <VStack spacing={2}>
                                                                                                                        <Icon as={FaFileAlt} w={8} h={8} color="gray.300" />
                                                                                                                        <Text color="gray.400" fontSize="sm">No documents found for this schedule date</Text>
                                                                                                                    </VStack>
                                                                                                                </Center>
                                                                                                            ) : (
                                                                                                                <VStack spacing={4} align="stretch">
                                                                                                                    {[
                                                                                                                        { label: 'Topography Final Mails', files: topographyMails, color: 'red', icon: FaEnvelope },
                                                                                                                        { label: 'Photos', files: photos, color: 'pink', icon: FaCamera },
                                                                                                                        { label: 'Daily Reports', files: reports, color: 'blue', icon: FaFilePdf },
                                                                                                                        { label: 'Data Files', files: data, color: 'teal', icon: FaFileAlt },
                                                                                                                        { label: 'Drawings', files: drawing, color: 'orange', icon: FaFileAlt },
                                                                                                                        { label: 'Expense Receipts', files: expenseReceipts, color: 'green', icon: FaFileInvoiceDollar },
                                                                                                                    ].map(({ label, files, color, icon }) => files && files.length > 0 && (
                                                                                                                        <Box key={label} bg="white" p={4} borderRadius="xl" border="1px solid" borderColor="gray.150" shadow="sm">
                                                                                                                            <Text fontSize="10px" fontWeight="black" color={`${color}.500`} textTransform="uppercase" mb={2}>
                                                                                                                                {label} ({files.length})
                                                                                                                            </Text>
                                                                                                                            <VStack spacing={2} align="stretch">
                                                                                                                                {files.map((doc, i) => (
                                                                                                                                    <HStack
                                                                                                                                        key={i}
                                                                                                                                        p={3}
                                                                                                                                        bg={`${color}.50`}
                                                                                                                                        borderRadius="xl"
                                                                                                                                        border="1px solid"
                                                                                                                                        borderColor={`${color}.100`}
                                                                                                                                        justify="space-between"
                                                                                                                                    >
                                                                                                                                        <HStack spacing={3}>
                                                                                                                                            <Icon as={icon} color={`${color}.500`} />
                                                                                                                                            <VStack align="start" spacing={0}>
                                                                                                                                                <Text fontSize="sm" fontWeight="bold" color="gray.700">{doc.name}</Text>
                                                                                                                                                <Text fontSize="xs" color="gray.400">{formatDateTime(doc.uploadedAt)}</Text>
                                                                                                                                            </VStack>
                                                                                                                                        </HStack>
                                                                                                                                        <IconButton
                                                                                                                                            as="a"
                                                                                                                                            href={`${API_BASE_URL}${doc.url}`}
                                                                                                                                            target="_blank"
                                                                                                                                            icon={<FaDownload />}
                                                                                                                                            size="sm"
                                                                                                                                            colorScheme={color}
                                                                                                                                            variant="ghost"
                                                                                                                                            borderRadius="full"
                                                                                                                                            aria-label="Download"
                                                                                                                                        />
                                                                                                                                    </HStack>
                                                                                                                                ))}
                                                                                                                            </VStack>
                                                                                                                        </Box>
                                                                                                                    ))}
                                                                                                                </VStack>
                                                                                                            )}
                                                                                                        </Box>
                                                                                                    );
                                                                                                })()}
                                                                                            </Td>
                                                                                        </Tr>
                                                                                    )}
                                                                                </React.Fragment>
                                                                            );
                                                                        })}
                                                                    </Tbody>
                                                                </Table>
                                                            </TableContainer>
                                                        );
                                                    })()}
                                                </CardBody>
                                            </Card>
                                        );
                                    })}
                                </VStack>
                            );
                        })()}
                    </ModalBody>
                    <ModalFooter bg="gray.50" py={4} px={6} borderTop="1px solid" borderColor="gray.200">
                        <Flex w="full" justify="space-between" align="center" flexWrap="wrap" gap={3}>
                            <Box flex={1}>
                                {selectedEntries.length > 0 ? (
                                    <HStack spacing={2} flexWrap="wrap">
                                        <Badge colorScheme="blue" borderRadius="full" px={3} py={1} fontSize="xs" fontWeight="bold">
                                            {selectedEntries.length} Selected
                                        </Badge>

                                        {activeTab === 1 ? (
                                            /* Proforma Tab: ONLY Gen Final Invoice button */
                                            <Button
                                                size="sm"
                                                colorScheme="green"
                                                borderRadius="full"
                                                leftIcon={<FaCheckCircle />}
                                                onClick={() => validateAndPrepareGlobalInvoice('FINAL')}
                                            >
                                                Gen Final Invoice
                                            </Button>
                                        ) : (
                                            /* Pending / Other Tabs: Cash/UPI, Gen Proforma, Gen Final Invoice */
                                            <>
                                                <Button
                                                    size="sm"
                                                    colorScheme="teal"
                                                    borderRadius="full"
                                                    leftIcon={<FaMoneyBillWave />}
                                                    onClick={() => {
                                                        const selectedObjs = schedules.filter(s => selectedEntries.includes(s._id));
                                                        const totalSum = selectedObjs.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
                                                        setCashUpiModal({
                                                            isOpen: true,
                                                            mode: 'UPI',
                                                            receiverName: '',
                                                            transactionNo: '',
                                                            paymentAmount: totalSum > 0 ? String(totalSum) : '',
                                                            closedDate: new Date().toISOString().split('T')[0],
                                                            remark: '',
                                                            isSubmitting: false
                                                        });
                                                    }}
                                                >
                                                    Cash / UPI
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    colorScheme="purple"
                                                    borderRadius="full"
                                                    leftIcon={<FaFileInvoiceDollar />}
                                                    onClick={() => validateAndPrepareGlobalInvoice('PROFORMA')}
                                                >
                                                    Gen Proforma
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    colorScheme="green"
                                                    borderRadius="full"
                                                    leftIcon={<FaCheckCircle />}
                                                    onClick={() => validateAndPrepareGlobalInvoice('FINAL')}
                                                >
                                                    Gen Final Invoice
                                                </Button>
                                            </>
                                        )}
                                    </HStack>
                                ) : (
                                    <Text fontSize="xs" color="gray.500" fontWeight="bold">
                                        💡 Select entry checkboxes above to generate {activeTab === 1 ? 'Final Invoice' : 'Cash/UPI, Proforma, or Final Invoice'}
                                    </Text>
                                )}
                            </Box>
                            <Button colorScheme="gray" variant="solid" borderRadius="full" px={6} onClick={() => { setSelectedGroup(null); setSelectedEntryForDocs(null); }}>
                                Close
                            </Button>
                        </Flex>
                    </ModalFooter>
                </ModalContent>
            </Modal>
            <Modal isOpen={invoiceForm.isOpen} onClose={() => setInvoiceForm(prev => ({ ...prev, isOpen: false }))} size="6xl" isCentered scrollBehavior="inside" isLazy unmountOnClose>
                <ModalOverlay bg="blackAlpha.700" />
                <ModalContent borderRadius={{ base: "xl", md: "2xl" }} maxW={{ base: "98vw", lg: "6xl" }} maxH={{ base: "94vh", md: "90vh" }}>
                    <ModalHeader bg={invoiceForm.type === 'PROFORMA' ? 'purple.500' : 'green.500'} color="white" p={{ base: 3.5, md: 5 }} fontSize={{ base: "sm", md: "md" }}>
                        Configure {invoiceForm.type === 'PROFORMA' ? 'Proforma' : 'Final'} Invoice
                    </ModalHeader>
                    <ModalCloseButton color="white" top={{ base: 2, md: 3 }} right={{ base: 2, md: 3 }} />
                    <ModalBody p={{ base: 3, sm: 4, md: 6 }} maxH={{ base: "80vh", md: "75vh" }} overflowY="auto">
                        <VStack spacing={{ base: 4, md: 6 }} align="stretch">
                            <Box bg="white" p={{ base: 3, md: 4 }} borderRadius="xl" border="1px solid" borderColor="gray.200" shadow="sm">
                                <Text fontSize={{ base: "xs", md: "sm" }} fontWeight="black" mb={4} color="blue.700" textTransform="uppercase">1. Company & Description</Text>
                                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={{ base: 3, md: 6 }}>
                                    <Box>
                                        <Text fontSize="xs" fontWeight="bold" mb={1.5} color="gray.700">Billing Company Selection</Text>
                                        <Select
                                            value={invoiceForm.companyDetails?._id || ''}
                                            onChange={(e) => {
                                                const selected = companies.find(c => c._id === e.target.value);
                                                const newInvoiceId = generateNextInvoiceId(schedules, invoiceForm.type, selected);
                                                setInvoiceForm(prev => ({
                                                    ...prev,
                                                    companyDetails: selected || null,
                                                    invoiceId: newInvoiceId
                                                }));
                                            }}
                                            bg="white"
                                            size="sm"
                                            borderRadius="xl"
                                        >
                                            {companies.length === 0 && <option value="">No Companies Found</option>}
                                            {companies.map(c => (
                                                <option key={c._id} value={c._id}>{c.companyName}</option>
                                            ))}
                                        </Select>
                                    </Box>
                                    <Box>
                                        <Text fontSize="xs" fontWeight="bold" mb={1.5} color="gray.700">Invoice No.</Text>
                                        <Input
                                            value={invoiceForm.invoiceId}
                                            onChange={(e) => setInvoiceForm(prev => ({ ...prev, invoiceId: e.target.value }))}
                                            bg="white"
                                            fontWeight="bold"
                                            color="blue.600"
                                            borderRadius="xl"
                                            size="sm"
                                        />
                                    </Box>
                                </SimpleGrid>

                                <Box mt={4} p={{ base: 2.5, md: 4 }} bg="blue.50" borderRadius="xl" border="1px solid" borderColor="blue.200">
                                    <Text fontSize="2xs" fontWeight="black" color="blue.800" textTransform="uppercase" mb={2}>
                                        📅 Include Visit Schedule Date(s) in Item Description?
                                    </Text>
                                    <RadioGroup
                                        value={invoiceForm.includeDates !== false ? 'yes' : 'no'}
                                        onChange={(val) => setInvoiceForm(prev => ({ ...prev, includeDates: val === 'yes' }))}
                                    >
                                        <HStack spacing={{ base: 3, md: 6 }} wrap="wrap">
                                            <Radio value="yes" colorScheme="blue">
                                                <Text fontSize="xs" fontWeight="bold" color="blue.900">YES — Include Visit Date(s)</Text>
                                            </Radio>
                                            <Radio value="no" colorScheme="red">
                                                <Text fontSize="xs" fontWeight="bold" color="gray.700">NO — Omit Dates</Text>
                                            </Radio>
                                        </HStack>
                                    </RadioGroup>
                                </Box>
                            </Box>

                            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                                {/* Buyer Section */}
                                <Box bg="gray.50" p={5} borderRadius="xl" border="1px solid" borderColor="gray.200">
                                    <Text fontSize="md" fontWeight="black" mb={4} color="purple.700" textTransform="uppercase">Buyer (Bill To)</Text>
                                    <VStack spacing={3} align="stretch">
                                        <InputGroup size="sm">
                                            <InputLeftElement w="100px"><Text fontSize="xs" fontWeight="bold" color="gray.500">Name:</Text></InputLeftElement>
                                            <Input pl="100px" bg="white" value={invoiceForm.buyerDetails.name} onChange={(e) => setInvoiceForm(prev => ({ ...prev, buyerDetails: { ...prev.buyerDetails, name: e.target.value } }))} />
                                        </InputGroup>
                                        <InputGroup size="sm">
                                            <InputLeftElement w="100px"><Text fontSize="xs" fontWeight="bold" color="gray.500">Address:</Text></InputLeftElement>
                                            <Textarea pl="100px" bg="white" minH="80px" py={1} value={invoiceForm.buyerDetails.address} onChange={(e) => setInvoiceForm(prev => ({ ...prev, buyerDetails: { ...prev.buyerDetails, address: e.target.value } }))} />
                                        </InputGroup>
                                        <InputGroup size="sm">
                                            <InputLeftElement w="100px"><Text fontSize="xs" fontWeight="bold" color="gray.500">GSTIN/UIN:</Text></InputLeftElement>
                                            <Input pl="100px" bg="white" value={invoiceForm.buyerDetails.gstin} onChange={(e) => setInvoiceForm(prev => ({ ...prev, buyerDetails: { ...prev.buyerDetails, gstin: e.target.value } }))} />
                                        </InputGroup>
                                        <HStack spacing={2}>
                                            <InputGroup size="sm">
                                                <InputLeftElement w="100px"><Text fontSize="xs" fontWeight="bold" color="gray.500">State:</Text></InputLeftElement>
                                                <Input pl="100px" bg="white" value={invoiceForm.buyerDetails.stateName} onChange={(e) => setInvoiceForm(prev => ({ ...prev, buyerDetails: { ...prev.buyerDetails, stateName: e.target.value } }))} />
                                            </InputGroup>
                                            <InputGroup size="sm" w="150px">
                                                <InputLeftElement w="50px"><Text fontSize="xs" fontWeight="bold" color="gray.500">Code:</Text></InputLeftElement>
                                                <Input pl="50px" bg="white" value={invoiceForm.buyerDetails.stateCode} onChange={(e) => setInvoiceForm(prev => ({ ...prev, buyerDetails: { ...prev.buyerDetails, stateCode: e.target.value } }))} />
                                            </InputGroup>
                                        </HStack>
                                        <HStack spacing={2}>
                                            <InputGroup size="sm">
                                                <InputLeftElement w="100px"><Text fontSize="xs" fontWeight="bold" color="gray.500">Contact Person:</Text></InputLeftElement>
                                                <Input pl="100px" bg="white" value={invoiceForm.buyerDetails.contactPerson} onChange={(e) => setInvoiceForm(prev => ({ ...prev, buyerDetails: { ...prev.buyerDetails, contactPerson: e.target.value } }))} />
                                            </InputGroup>
                                            <InputGroup size="sm">
                                                <InputLeftElement w="80px"><Text fontSize="xs" fontWeight="bold" color="gray.500">Contact:</Text></InputLeftElement>
                                                <Input pl="80px" bg="white" value={invoiceForm.buyerDetails.contact} onChange={(e) => setInvoiceForm(prev => ({ ...prev, buyerDetails: { ...prev.buyerDetails, contact: e.target.value } }))} />
                                            </InputGroup>
                                        </HStack>
                                    </VStack>
                                </Box>

                                {/* Consignee Section */}
                                <Box bg="gray.50" p={5} borderRadius="xl" border="1px solid" borderColor="gray.200">
                                    <Text fontSize="md" fontWeight="black" mb={4} color="teal.700" textTransform="uppercase">Consignee (Ship To)</Text>
                                    <VStack spacing={3} align="stretch">
                                        <InputGroup size="sm">
                                            <InputLeftElement w="100px"><Text fontSize="xs" fontWeight="bold" color="gray.500">Name:</Text></InputLeftElement>
                                            <Input pl="100px" bg="white" value={invoiceForm.shipToDetails.name} onChange={(e) => setInvoiceForm(prev => ({ ...prev, shipToDetails: { ...prev.shipToDetails, name: e.target.value } }))} />
                                        </InputGroup>
                                        <InputGroup size="sm">
                                            <InputLeftElement w="100px"><Text fontSize="xs" fontWeight="bold" color="gray.500">Address:</Text></InputLeftElement>
                                            <Textarea pl="100px" bg="white" minH="80px" py={1} value={invoiceForm.shipToDetails.address} onChange={(e) => setInvoiceForm(prev => ({ ...prev, shipToDetails: { ...prev.shipToDetails, address: e.target.value } }))} />
                                        </InputGroup>
                                        <InputGroup size="sm">
                                            <InputLeftElement w="100px"><Text fontSize="xs" fontWeight="bold" color="gray.500">GSTIN/UIN:</Text></InputLeftElement>
                                            <Input pl="100px" bg="white" value={invoiceForm.shipToDetails.gstin} onChange={(e) => setInvoiceForm(prev => ({ ...prev, shipToDetails: { ...prev.shipToDetails, gstin: e.target.value } }))} />
                                        </InputGroup>
                                        <HStack spacing={2}>
                                            <InputGroup size="sm">
                                                <InputLeftElement w="100px"><Text fontSize="xs" fontWeight="bold" color="gray.500">State:</Text></InputLeftElement>
                                                <Input pl="100px" bg="white" value={invoiceForm.shipToDetails.stateName} onChange={(e) => setInvoiceForm(prev => ({ ...prev, shipToDetails: { ...prev.shipToDetails, stateName: e.target.value } }))} />
                                            </InputGroup>
                                            <InputGroup size="sm" w="150px">
                                                <InputLeftElement w="50px"><Text fontSize="xs" fontWeight="bold" color="gray.500">Code:</Text></InputLeftElement>
                                                <Input pl="50px" bg="white" value={invoiceForm.shipToDetails.stateCode} onChange={(e) => setInvoiceForm(prev => ({ ...prev, shipToDetails: { ...prev.shipToDetails, stateCode: e.target.value } }))} />
                                            </InputGroup>
                                        </HStack>
                                        <HStack spacing={2}>
                                            <InputGroup size="sm">
                                                <InputLeftElement w="100px"><Text fontSize="xs" fontWeight="bold" color="gray.500">Contact Person:</Text></InputLeftElement>
                                                <Input pl="100px" bg="white" value={invoiceForm.shipToDetails.contactPerson} onChange={(e) => setInvoiceForm(prev => ({ ...prev, shipToDetails: { ...prev.shipToDetails, contactPerson: e.target.value } }))} />
                                            </InputGroup>
                                            <InputGroup size="sm">
                                                <InputLeftElement w="80px"><Text fontSize="xs" fontWeight="bold" color="gray.500">Contact:</Text></InputLeftElement>
                                                <Input pl="80px" bg="white" value={invoiceForm.shipToDetails.contact} onChange={(e) => setInvoiceForm(prev => ({ ...prev, shipToDetails: { ...prev.shipToDetails, contact: e.target.value } }))} />
                                            </InputGroup>
                                        </HStack>
                                    </VStack>
                                </Box>
                            </SimpleGrid>

                            <Box bg="white" p={4} borderRadius="xl" border="1px solid" borderColor="gray.200" shadow="sm">
                                <Text fontSize="md" fontWeight="black" mb={4} color="orange.700" textTransform="uppercase">GST Configuration</Text>
                                <HStack spacing={6} align="center">
                                    <Box>
                                        <Text fontSize="sm" fontWeight="bold" mb={2} color="gray.700">GST Type</Text>
                                        <RadioGroup
                                            value={invoiceForm.gstType}
                                            onChange={(val) => setInvoiceForm(prev => ({
                                                ...prev,
                                                gstType: val,
                                                gstPercentage: 18  // always 18% total regardless of type
                                            }))}
                                        >
                                            <HStack spacing={6}>
                                                <Radio value="CGST_SGST" colorScheme="blue">
                                                    <Text fontWeight="semibold">CGST & SGST (Same State)</Text>
                                                </Radio>
                                                <Radio value="IGST" colorScheme="purple">
                                                    <Text fontWeight="semibold">IGST (Other State)</Text>
                                                </Radio>
                                            </HStack>
                                        </RadioGroup>
                                    </Box>
                                    <Box bg="blue.50" px={4} py={2} borderRadius="lg" border="1px solid" borderColor="blue.100">
                                        <Text fontSize="xs" color="blue.500" fontWeight="bold" textTransform="uppercase" mb={1}>Applicable Rate</Text>
                                        {invoiceForm.gstType === 'CGST_SGST' ? (
                                            <HStack spacing={3}>
                                                <Text fontSize="sm" fontWeight="black" color="blue.700">CGST 9% + SGST 9%</Text>
                                                <Badge colorScheme="blue" fontSize="sm" px={2}>= 18%</Badge>
                                            </HStack>
                                        ) : (
                                            <HStack spacing={3}>
                                                <Text fontSize="sm" fontWeight="black" color="purple.700">IGST 18%</Text>
                                                <Badge colorScheme="purple" fontSize="sm" px={2}>= 18%</Badge>
                                            </HStack>
                                        )}
                                    </Box>
                                </HStack>
                            </Box>

                            <Box mt={2}>
                                <Text fontSize="md" fontWeight="bold" mb={3} color="gray.700">Invoice Items (Select Ledgers & Quantities)</Text>
                                <TableContainer border="1px solid" borderColor="gray.200" borderRadius="lg">
                                    <Table size="sm" variant="simple">
                                        <Thead bg="gray.100">
                                            <Tr>
                                                <Th>Date</Th>
                                                <Th>Instrument</Th>
                                                <Th>Extra Desc.</Th>
                                                <Th>Service Ledger</Th>
                                                <Th>HSN/SAC</Th>
                                                <Th>Rate (₹)</Th>
                                                <Th>Qty</Th>
                                                <Th>Per (Unit)</Th>
                                                <Th isNumeric>Amount (₹)</Th>
                                            </Tr>
                                        </Thead>
                                        <Tbody>
                                            {invoiceForm.entries.map(entry => {
                                                const conf = invoiceForm.entryConfigs[entry._id] || {};
                                                return (
                                                    <Tr key={entry._id}>
                                                        <Td fontSize="xs" fontWeight="bold">{formatDate(entry.scheduleDate)}</Td>
                                                        <Td>
                                                            <Select
                                                                size="sm"
                                                                value={conf.instrument || 'Total Station'}
                                                                onChange={(e) => setInvoiceForm(prev => ({
                                                                    ...prev,
                                                                    entryConfigs: { ...prev.entryConfigs, [entry._id]: { ...conf, instrument: e.target.value } }
                                                                }))}
                                                            >
                                                                <option value="Total Station">Total Station</option>
                                                                <option value="DGPS">DGPS</option>
                                                                <option value="Auto Level">Auto Level</option>
                                                                <option value="Drone">Drone</option>
                                                                <option value="Other">Other</option>
                                                            </Select>
                                                        </Td>
                                                        <Td>
                                                            <Input
                                                                size="sm"
                                                                placeholder="e.g. LEVELING SURVEY"
                                                                w="130px"
                                                                value={conf.extraDescription || ''}
                                                                onChange={(e) => setInvoiceForm(prev => ({
                                                                    ...prev,
                                                                    entryConfigs: { ...prev.entryConfigs, [entry._id]: { ...conf, extraDescription: e.target.value } }
                                                                }))}
                                                            />
                                                        </Td>
                                                        <Td>
                                                            <Select
                                                                size="sm"
                                                                value={conf.ledger || ''}
                                                                onChange={(e) => {
                                                                    const val = e.target.value;
                                                                    const selectedLedger = entry.site?.ledgerItems?.find(l => (l.ledger || '').trim().toLowerCase() === val.trim().toLowerCase());
                                                                    setInvoiceForm(prev => ({
                                                                        ...prev,
                                                                        entryConfigs: {
                                                                            ...prev.entryConfigs,
                                                                            [entry._id]: {
                                                                                ...conf,
                                                                                ledger: val,
                                                                                ledgerName: val,
                                                                                rate: selectedLedger ? selectedLedger.amount : conf.rate,
                                                                                hsnSac: selectedLedger?.hsnSac || conf.hsnSac || '',
                                                                                shortName: selectedLedger?.shortName || ''
                                                                            }
                                                                        }
                                                                    }));
                                                                }}
                                                            >
                                                                {entry.site?.ledgerItems?.map(l => (
                                                                    <option key={l.ledger} value={l.ledger}>{l.ledger}</option>
                                                                ))}
                                                            </Select>
                                                        </Td>
                                                        <Td>
                                                            <Input
                                                                size="sm"
                                                                w="90px"
                                                                placeholder="e.g. 998349"
                                                                value={conf.hsnSac || ''}
                                                                onChange={(e) => setInvoiceForm(prev => ({
                                                                    ...prev,
                                                                    entryConfigs: { ...prev.entryConfigs, [entry._id]: { ...conf, hsnSac: e.target.value } }
                                                                }))}
                                                            />
                                                        </Td>
                                                        <Td>
                                                            <Input
                                                                size="sm"
                                                                type="number"
                                                                w="90px"
                                                                value={conf.rate || 0}
                                                                onChange={(e) => setInvoiceForm(prev => ({
                                                                    ...prev,
                                                                    entryConfigs: { ...prev.entryConfigs, [entry._id]: { ...conf, rate: Number(e.target.value) } }
                                                                }))}
                                                            />
                                                        </Td>
                                                        <Td>
                                                            <Input
                                                                size="sm"
                                                                type="number"
                                                                w="70px"
                                                                value={conf.qty || 0}
                                                                onChange={(e) => setInvoiceForm(prev => ({
                                                                    ...prev,
                                                                    entryConfigs: { ...prev.entryConfigs, [entry._id]: { ...conf, qty: Number(e.target.value) } }
                                                                }))}
                                                            />
                                                        </Td>
                                                        <Td>
                                                            <Input
                                                                size="sm"
                                                                w="70px"
                                                                placeholder="FD / HD"
                                                                value={conf.shortName || ''}
                                                                onChange={(e) => setInvoiceForm(prev => ({
                                                                    ...prev,
                                                                    entryConfigs: { ...prev.entryConfigs, [entry._id]: { ...conf, shortName: e.target.value } }
                                                                }))}
                                                            />
                                                        </Td>
                                                        <Td isNumeric fontWeight="bold" color="blue.600">
                                                            {conf.rate * conf.qty}
                                                        </Td>
                                                    </Tr>
                                                )
                                            })}
                                        </Tbody>
                                    </Table>
                                </TableContainer>
                            </Box>
                        </VStack>
                    </ModalBody>
                    <ModalFooter bg="gray.50" py={4} px={6}>
                        <Flex w="full" justify="space-between" align="center">
                            <Button
                                leftIcon={<FaEye />}
                                colorScheme="blue"
                                variant="outline"
                                borderRadius="full"
                                px={6}
                                onClick={handlePreviewInvoiceForm}
                            >
                                Preview Invoice
                            </Button>
                            <HStack spacing={3}>
                                <Button variant="ghost" borderRadius="full" onClick={() => setInvoiceForm(prev => ({ ...prev, isOpen: false }))}>Cancel</Button>
                                <Button
                                    colorScheme={invoiceForm.type === 'PROFORMA' ? 'purple' : 'green'}
                                    borderRadius="full"
                                    px={6}
                                    leftIcon={<FaCheckCircle />}
                                    onClick={handleSubmitInvoiceForm}
                                    isLoading={loading}
                                >
                                    Submit & Generate {invoiceForm.type === 'PROFORMA' ? 'Proforma' : 'Final'}
                                </Button>
                            </HStack>
                        </Flex>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* ── Invoice Preview Modal (HTML Live Preview & PDF Viewer) ── */}
            <Modal
                isOpen={previewModal.isOpen}
                onClose={() => setPreviewModal(prev => ({ ...prev, isOpen: false }))}
                size="6xl"
                isCentered
                scrollBehavior="inside"
                isLazy
                unmountOnClose
            >
                <ModalOverlay bg="blackAlpha.700" />
                <ModalContent borderRadius={{ base: "2xl", md: "3xl" }} overflow="hidden" boxShadow="2xl" maxW={{ base: "98vw", lg: "6xl" }} maxH="92vh">
                    <ModalHeader p={0}>
                        <Box bg="gray.800" p={{ base: 3.5, md: 5 }} borderBottom="1px solid" borderColor="gray.900">
                            <HStack justify="space-between" align="center" wrap="wrap" gap={2}>
                                <HStack spacing={{ base: 2.5, md: 3 }}>
                                    <Box p={{ base: 2, md: 2.5 }} bg="gray.700" color="white" borderRadius="xl" border="1px solid" borderColor="gray.600">
                                        <Icon as={FaFileInvoiceDollar} w={{ base: 5, md: 6 }} h={{ base: 5, md: 6 }} />
                                    </Box>
                                    <VStack align="start" spacing={0}>
                                        <Text fontWeight="black" fontSize={{ base: "sm", md: "lg" }} color="white">
                                            {previewModal.title || 'Invoice Preview'}
                                        </Text>
                                        <Text fontSize="2xs" opacity={0.85} color="white">
                                            Live Preview of Proforma / Tax Invoice Layout
                                        </Text>
                                    </VStack>
                                </HStack>
                                <Badge colorScheme="whiteAlpha" variant="solid" px={2.5} py={0.5} borderRadius="full" fontSize="2xs">
                                    👁️ PREVIEW MODE
                                </Badge>
                            </HStack>
                        </Box>
                    </ModalHeader>
                    <ModalCloseButton color="white" top={{ base: 2, md: 4 }} right={{ base: 2, md: 4 }} size={{ base: "sm", md: "lg" }} />
                    <ModalBody p={4} bg="gray.100" maxH="75vh">
                        {previewModal.htmlContent ? (
                            <Box bg="white" borderRadius="2xl" shadow="md" p={2} overflow="hidden" h="70vh">
                                <iframe
                                    title="Invoice Live Preview"
                                    srcDoc={previewModal.htmlContent}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        border: 'none',
                                        borderRadius: '12px'
                                    }}
                                />
                            </Box>
                        ) : previewModal.pdfUrl ? (
                            <Box bg="white" borderRadius="2xl" shadow="md" p={2} overflow="hidden" h="70vh">
                                <iframe
                                    title="Invoice PDF Preview"
                                    src={previewModal.pdfUrl}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        border: 'none',
                                        borderRadius: '12px'
                                    }}
                                />
                            </Box>
                        ) : (
                            <Center py={16}>
                                <Text color="gray.400">No preview content available</Text>
                            </Center>
                        )}
                    </ModalBody>
                    <ModalFooter bg="gray.50" py={4} px={6} borderTop="1px solid" borderColor="gray.200">
                        <Flex w="full" justify="space-between" align="center" gap={3}>
                            <HStack spacing={3}>
                                {previewModal.htmlContent && (
                                    <Button
                                        size="sm"
                                        leftIcon={<FaPrint />}
                                        colorScheme="blue"
                                        variant="subtle"
                                        borderRadius="full"
                                        onClick={() => {
                                            const iframe = document.querySelector('iframe[title="Invoice Live Preview"]');
                                            if (iframe && iframe.contentWindow) {
                                                iframe.contentWindow.print();
                                            }
                                        }}
                                    >
                                        Print Preview
                                    </Button>
                                )}
                            </HStack>
                            <HStack spacing={3}>
                                {invoiceForm.isOpen && previewModal.htmlContent && (
                                    <Button
                                        size="sm"
                                        colorScheme={invoiceForm.type === 'PROFORMA' ? 'purple' : 'green'}
                                        borderRadius="full"
                                        px={6}
                                        leftIcon={<FaCheckCircle />}
                                        isLoading={loading}
                                        onClick={async () => {
                                            setPreviewModal(prev => ({ ...prev, isOpen: false }));
                                            await handleSubmitInvoiceForm();
                                        }}
                                    >
                                        Submit & Generate {invoiceForm.type === 'PROFORMA' ? 'Proforma' : 'Final'}
                                    </Button>
                                )}
                                <Button
                                    size="sm"
                                    colorScheme="red"
                                    variant="solid"
                                    borderRadius="full"
                                    px={6}
                                    leftIcon={<FaTimes />}
                                    onClick={() => setPreviewModal(prev => ({ ...prev, isOpen: false }))}
                                >
                                    Close Preview
                                </Button>
                            </HStack>
                        </Flex>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* ── Missing Site Ledger Instruction Modal Popup ── */}
            <Modal isOpen={missingLedgerSitesModal.isOpen} onClose={() => setMissingLedgerSitesModal({ isOpen: false, sites: [] })} size="lg" isCentered isLazy unmountOnClose>
                <ModalOverlay bg="blackAlpha.700" />
                <ModalContent borderRadius={{ base: "2xl", md: "3xl" }} overflow="hidden" boxShadow="2xl" maxW={{ base: "96vw", md: "lg" }}>
                    <ModalHeader p={0}>
                        <Box bg="gray.800" p={{ base: 3.5, md: 5 }} borderBottom="1px solid" borderColor="gray.900">
                            <HStack spacing={{ base: 3, md: 4 }}>
                                <Box p={{ base: 2, md: 2.5 }} bg="gray.700" color="white" borderRadius="xl" border="1px solid" borderColor="gray.600">
                                    <Icon as={FaExclamationTriangle} w={{ base: 5, md: 6 }} h={{ base: 5, md: 6 }} color="orange.400" />
                                </Box>
                                <Text fontWeight="black" fontSize={{ base: "sm", md: "lg" }} color="white">Action Required: Missing Site Ledgers</Text>
                            </HStack>
                        </Box>
                    </ModalHeader>
                    <ModalCloseButton color="white" top={{ base: 2, md: 4 }} right={{ base: 2, md: 4 }} />
                    <ModalBody p={{ base: 3.5, md: 6 }}>
                        <VStack spacing={5} align="stretch">
                            <Alert status="warning" borderRadius="2xl" variant="subtle" bg="orange.50" border="1px solid" borderColor="orange.200">
                                <AlertIcon color="orange.500" />
                                <Box flex="1">
                                    <AlertTitle fontSize="sm" fontWeight="bold" color="orange.800">
                                        Invoice Cannot Be Generated Yet
                                    </AlertTitle>
                                    <AlertDescription fontSize="xs" color="orange.700">
                                        The selected site(s) do not have any configured ledgers or rates in Site Master.
                                    </AlertDescription>
                                </Box>
                            </Alert>

                            <Box>
                                <Text fontSize="xs" fontWeight="black" color="gray.500" textTransform="uppercase" mb={2}>
                                    Sites Needing Ledger Configuration:
                                </Text>
                                <VStack spacing={2} align="stretch">
                                    {missingLedgerSitesModal.sites.map((site, i) => (
                                        <HStack key={i} p={3} bg="gray.50" borderRadius="xl" border="1px solid" borderColor="gray.200" justify="space-between">
                                            <HStack spacing={2}>
                                                <Icon as={FaMapMarkerAlt} color="red.500" />
                                                <Text fontSize="sm" fontWeight="bold" color="gray.800">{site.siteName}</Text>
                                            </HStack>
                                            <Badge colorScheme="red" variant="solid" borderRadius="full" px={2.5} py={0.5} fontSize="10px">
                                                0 Ledgers Configured
                                            </Badge>
                                        </HStack>
                                    ))}
                                </VStack>
                            </Box>

                            <Box bg="blue.50" p={4} borderRadius="2xl" border="1px solid" borderColor="blue.100">
                                <Text fontSize="xs" fontWeight="black" color="blue.700" textTransform="uppercase" mb={2}>
                                    📋 Instructions to Fix:
                                </Text>
                                <VStack align="start" spacing={1.5} fontSize="xs" color="blue.900">
                                    <Text><b>Step 1:</b> Click the <b>"Go to Site Master"</b> button below.</Text>
                                    <Text><b>Step 2:</b> Locate and click <b>Edit</b> on the affected site(s).</Text>
                                    <Text><b>Step 3:</b> Scroll to <b>Ledger Items / Rates</b> section and add your required rates (e.g., Full Day, Half Day).</Text>
                                    <Text><b>Step 4:</b> Save the site details and return here to generate your invoice.</Text>
                                </VStack>
                            </Box>
                        </VStack>
                    </ModalBody>
                    <ModalFooter bg="gray.50" p={{ base: 3, md: 4 }}>
                        <Button variant="ghost" borderRadius="full" mr={3} onClick={() => setMissingLedgerSitesModal({ isOpen: false, sites: [] })}>
                            Dismiss
                        </Button>
                        <Button
                            colorScheme="orange"
                            borderRadius="full"
                            px={6}
                            leftIcon={<FaMapMarkerAlt />}
                            onClick={() => {
                                setMissingLedgerSitesModal({ isOpen: false, sites: [] });
                                if (isInsideServices) {
                                    window.location.href = '/services';
                                } else {
                                    navigate('/services');
                                }
                            }}
                        >
                            Go to Site Master
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
            {/* ── Cash / UPI Payment Entry Modal ── */}
            <Modal
                isOpen={cashUpiModal.isOpen}
                onClose={() => setCashUpiModal(prev => ({ ...prev, isOpen: false }))}
                size="lg"
                isCentered
                isLazy
                unmountOnClose
            >
                <ModalOverlay bg="blackAlpha.700" />
                <ModalContent borderRadius={{ base: "2xl", md: "3xl" }} overflow="hidden" boxShadow="2xl" maxW={{ base: "96vw", md: "lg" }}>
                    <ModalHeader p={0}>
                        <Box bg="gray.800" p={{ base: 3.5, md: 5 }} borderBottom="1px solid" borderColor="gray.900">
                            <HStack spacing={{ base: 3, md: 4 }}>
                                <Box p={{ base: 2, md: 2.5 }} bg="gray.700" color="white" borderRadius="xl" border="1px solid" borderColor="gray.600">
                                    <Icon as={FaMoneyBillWave} w={{ base: 5, md: 6 }} h={{ base: 5, md: 6 }} color="teal.400" />
                                </Box>
                                <VStack align="start" spacing={0}>
                                    <Text fontSize={{ base: "sm", md: "lg" }} fontWeight="black" color="white">
                                        Cash / UPI Payment Entry
                                    </Text>
                                    <Text fontSize="2xs" color="gray.400">
                                        Record payment details and mark entries as Closed
                                    </Text>
                                </VStack>
                            </HStack>
                        </Box>
                    </ModalHeader>
                    <ModalCloseButton color="white" top={{ base: 2, md: 4 }} right={{ base: 2, md: 4 }} />
                    <ModalBody p={{ base: 3.5, md: 6 }}>
                        <VStack spacing={4} align="stretch">
                            <Box bg="teal.50" p={{ base: 3, md: 4 }} borderRadius="2xl" border="1px solid" borderColor="teal.100">
                                <Text fontSize="xs" fontWeight="bold" color="teal.800">
                                    {selectedEntries.length} Entry(ies) Selected for Client: <b>{activeSelectedClientName}</b>
                                </Text>
                                <Text fontSize="2xs" color="teal.600" mt={1}>
                                    This action will record payment details and directly move selected entries to <b>Closed</b> status.
                                </Text>
                            </Box>

                            {/* 1. Payment Mode Radio Selector */}
                            <FormControl>
                                <FormLabel fontSize="xs" fontWeight="extrabold" color="gray.700">Select Payment Mode</FormLabel>
                                <RadioGroup
                                    value={cashUpiModal.mode}
                                    onChange={(val) => setCashUpiModal(prev => ({ ...prev, mode: val }))}
                                >
                                    <HStack spacing={{ base: 3, md: 6 }} bg="gray.50" p={3} borderRadius="xl" border="1px solid" borderColor="gray.200" wrap="wrap">
                                        <Radio value="UPI" colorScheme="purple" fontWeight="bold">
                                            📱 UPI (GPay / PhonePe / Paytm)
                                        </Radio>
                                        <Radio value="CASH" colorScheme="green" fontWeight="bold">
                                            💵 CASH Payment
                                        </Radio>
                                    </HStack>
                                </RadioGroup>
                            </FormControl>

                            {/* Conditional Rendering based on Payment Mode */}
                            {cashUpiModal.mode === 'UPI' ? (
                                <>
                                    {/* UPI Mode Fields */}
                                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={{ base: 3, md: 4 }}>
                                        <FormControl>
                                            <FormLabel fontSize="xs" fontWeight="bold" color="gray.700">Receiver Name</FormLabel>
                                            <Input
                                                size="sm"
                                                placeholder="e.g. Meet Bhesara / Account Name"
                                                value={cashUpiModal.receiverName}
                                                onChange={(e) => setCashUpiModal(prev => ({ ...prev, receiverName: e.target.value }))}
                                                borderRadius="xl"
                                            />
                                        </FormControl>

                                        <FormControl>
                                            <FormLabel fontSize="xs" fontWeight="bold" color="gray.700">Transaction No / Ref No</FormLabel>
                                            <Input
                                                size="sm"
                                                placeholder="e.g. UPI/1234567890/GPay"
                                                value={cashUpiModal.transactionNo}
                                                onChange={(e) => setCashUpiModal(prev => ({ ...prev, transactionNo: e.target.value }))}
                                                borderRadius="xl"
                                            />
                                        </FormControl>
                                    </SimpleGrid>

                                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={{ base: 3, md: 4 }}>
                                        <FormControl>
                                            <FormLabel fontSize="xs" fontWeight="bold" color="gray.700">Amount (₹)</FormLabel>
                                            <Input
                                                size="sm"
                                                type="number"
                                                placeholder="e.g. 5000"
                                                value={cashUpiModal.paymentAmount}
                                                onChange={(e) => setCashUpiModal(prev => ({ ...prev, paymentAmount: e.target.value }))}
                                                borderRadius="xl"
                                            />
                                        </FormControl>

                                        <FormControl>
                                            <FormLabel fontSize="xs" fontWeight="bold" color="gray.700">Payment Date</FormLabel>
                                            <Input
                                                size="sm"
                                                type="date"
                                                value={cashUpiModal.closedDate}
                                                onChange={(e) => setCashUpiModal(prev => ({ ...prev, closedDate: e.target.value }))}
                                                borderRadius="xl"
                                            />
                                        </FormControl>
                                    </SimpleGrid>
                                </>
                            ) : (
                                <>
                                    {/* CASH Mode Fields */}
                                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={{ base: 3, md: 4 }}>
                                        <FormControl>
                                            <FormLabel fontSize="xs" fontWeight="bold" color="gray.700">Apply Date / Closed Date</FormLabel>
                                            <Input
                                                size="sm"
                                                type="date"
                                                value={cashUpiModal.closedDate}
                                                onChange={(e) => setCashUpiModal(prev => ({ ...prev, closedDate: e.target.value }))}
                                                borderRadius="xl"
                                            />
                                        </FormControl>

                                        <FormControl>
                                            <FormLabel fontSize="xs" fontWeight="bold" color="gray.700">Receiver Name</FormLabel>
                                            <Input
                                                size="sm"
                                                placeholder="e.g. Collected by Site Engineer"
                                                value={cashUpiModal.receiverName}
                                                onChange={(e) => setCashUpiModal(prev => ({ ...prev, receiverName: e.target.value }))}
                                                borderRadius="xl"
                                            />
                                        </FormControl>
                                    </SimpleGrid>

                                    <FormControl>
                                        <FormLabel fontSize="xs" fontWeight="bold" color="gray.700">Amount (₹)</FormLabel>
                                        <Input
                                            size="sm"
                                            type="number"
                                            placeholder="e.g. 5000"
                                            value={cashUpiModal.paymentAmount}
                                            onChange={(e) => setCashUpiModal(prev => ({ ...prev, paymentAmount: e.target.value }))}
                                            borderRadius="xl"
                                        />
                                    </FormControl>
                                </>
                            )}

                            {/* End Remark (Common to both UPI and CASH) */}
                            <FormControl>
                                <FormLabel fontSize="xs" fontWeight="bold" color="gray.700">Payment Remark / End Remark</FormLabel>
                                <Textarea
                                    size="sm"
                                    placeholder="e.g. Additional remarks or notes regarding this payment"
                                    value={cashUpiModal.remark}
                                    onChange={(e) => setCashUpiModal(prev => ({ ...prev, remark: e.target.value }))}
                                    borderRadius="xl"
                                    rows={2}
                                />
                            </FormControl>
                        </VStack>
                    </ModalBody>
                    <ModalFooter bg="gray.50" p={{ base: 3, md: 4 }} borderTop="1px solid" borderColor="gray.200">
                        <Button variant="ghost" mr={3} borderRadius="full" onClick={() => setCashUpiModal(prev => ({ ...prev, isOpen: false }))}>
                            Cancel
                        </Button>
                        <Button
                            colorScheme="teal"
                            borderRadius="full"
                            px={{ base: 5, md: 8 }}
                            isLoading={cashUpiModal.isSubmitting}
                            leftIcon={<FaCheckCircle />}
                            onClick={handleConfirmCashUpi}
                        >
                            Confirm & Close Entry
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* ── Payment Follow-Up Modal ── */}
            <Modal isOpen={isFollowUpOpen} onClose={onFollowUpClose} size="xl" isCentered scrollBehavior="inside" isLazy unmountOnClose>
                <ModalOverlay bg="blackAlpha.700" />
                <ModalContent borderRadius={{ base: "2xl", md: "3xl" }} overflow="hidden" boxShadow="2xl" maxW={{ base: "96vw", md: "xl" }} maxH="90vh">
                    <ModalHeader p={0}>
                        <Box bg="gray.800" p={{ base: 3.5, md: 5 }} borderBottom="1px solid" borderColor="gray.900">
                            <HStack spacing={{ base: 3, md: 4 }}>
                                <Box p={{ base: 2, md: 2.5 }} bg="gray.700" color="white" borderRadius="xl" border="1px solid" borderColor="gray.600">
                                    <Icon as={FaHistory} w={{ base: 5, md: 6 }} h={{ base: 5, md: 6 }} color="purple.400" />
                                </Box>
                                <VStack align="start" spacing={0}>
                                    <Text fontWeight="black" fontSize={{ base: "sm", md: "lg" }} color="white">Payment Follow-up</Text>
                                    <Text fontSize="2xs" color="gray.400">
                                        Invoice: <b>{followUpTarget?.inv?.invoiceId || 'N/A'}</b> • {followUpTarget?.group?.clientName || followUpTarget?.inv?.clientName || 'Valued Client'}
                                    </Text>
                                </VStack>
                                <Box ml="auto">
                                    <Badge bg="gray.700" color="white" borderRadius="full" px={{ base: 2, md: 3 }} py={1} fontSize="2xs" fontWeight="bold" border="1px solid" borderColor="gray.600">
                                        ₹{Number(followUpTarget?.inv?.totalAmt || 0).toLocaleString('en-IN')}
                                    </Badge>
                                </Box>
                            </HStack>
                        </Box>
                    </ModalHeader>
                    <ModalCloseButton color="white" top={{ base: 2, md: 4 }} right={{ base: 2, md: 4 }} />
                    <ModalBody p={0} overflowY="auto">
                        {/* Add New Follow-Up Form */}
                        <Box p={{ base: 3.5, md: 5 }} bg="white">
                            <HStack mb={3} spacing={2}>
                                <FaBell color="#DD6B20" />
                                <Text fontWeight="extrabold" fontSize="sm" color="orange.700">
                                    Add New Payment Follow-up
                                </Text>
                            </HStack>
                            <VStack spacing={4} align="stretch">
                                <FormControl isRequired>
                                    <FormLabel fontSize="xs" fontWeight="bold" color="gray.700">
                                        📝 Follow-up Remark / Client Response
                                    </FormLabel>
                                    <Textarea
                                        placeholder="e.g. Spoke with Accounts team — payment of ₹14,000 promised by next Monday..."
                                        value={followUpForm.remark}
                                        onChange={(e) => setFollowUpForm(prev => ({ ...prev, remark: e.target.value }))}
                                        borderRadius="xl"
                                        rows={3}
                                        bg="gray.50"
                                        _focus={{ bg: 'white', borderColor: 'orange.400' }}
                                    />
                                </FormControl>

                                <FormControl isRequired>
                                    <FormLabel fontSize="xs" fontWeight="bold" color="gray.700">
                                        📅 Next Follow-up Date (Auto +7 Days Default)
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
                                py={{ base: 5, md: 6 }}
                                leftIcon={<FaBell />}
                                isLoading={isSubmittingFollowUp}
                                onClick={handleSubmitFollowUp}
                                _hover={{ bgGradient: 'linear(to-r, orange.600, red.600)' }}
                            >
                                Save Follow-up Remark
                            </Button>
                        </Box>

                        {/* Remark History Timeline */}
                        <Box p={{ base: 3.5, md: 5 }} bg="gray.50" borderTop="1px solid" borderColor="gray.200">
                            <HStack mb={3} spacing={2}>
                                <FaHistory color="#805AD5" />
                                <Text fontWeight="extrabold" fontSize="sm" color="purple.700">
                                    Remark History Timeline
                                </Text>
                                <Badge colorScheme="purple" borderRadius="full" fontSize="10px">
                                    {followUpTarget?.inv?.followUps?.length || 0} Total Remarks
                                </Badge>
                            </HStack>

                            {followUpTarget?.inv?.followUps?.length > 0 ? (
                                <VStack spacing={0} align="stretch">
                                    {[...followUpTarget.inv.followUps].reverse().map((fu, i, arr) => {
                                        const isFirst = i === 0;
                                        const addedAt = fu.addedAt
                                            ? new Date(fu.addedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                                            : 'N/A';
                                        const nextDate = fu.nextFollowUpDate
                                            ? new Date(fu.nextFollowUpDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                                            : 'N/A';
                                        return (
                                            <HStack key={i} spacing={0} align="stretch">
                                                {/* Timeline Node */}
                                                <VStack spacing={0} align="center" mr={3} minW="24px">
                                                    <Box
                                                        w="12px"
                                                        h="12px"
                                                        borderRadius="full"
                                                        mt={2}
                                                        bg={isFirst ? 'orange.500' : 'purple.400'}
                                                        border="2px solid"
                                                        borderColor={isFirst ? 'orange.200' : 'purple.200'}
                                                        flexShrink={0}
                                                    />
                                                    {i < arr.length - 1 && <Box w="2px" flex={1} bg="gray.200" minH="20px" />}
                                                </VStack>

                                                {/* Timeline Card */}
                                                <Box
                                                    flex={1}
                                                    p={3.5}
                                                    mb={2.5}
                                                    bg={isFirst ? 'orange.50' : 'white'}
                                                    borderRadius="xl"
                                                    border="1px solid"
                                                    borderColor={isFirst ? 'orange.200' : 'gray.200'}
                                                    shadow="2xs"
                                                >
                                                    <HStack justify="space-between" mb={1}>
                                                        <HStack spacing={2}>
                                                            <Badge
                                                                colorScheme={isFirst ? 'orange' : 'purple'}
                                                                borderRadius="full"
                                                                px={2}
                                                                fontSize="10px"
                                                                fontWeight="bold"
                                                            >
                                                                {isFirst ? '🔔 Latest' : `#${arr.length - i}`}
                                                            </Badge>
                                                            {fu.addedBy && (
                                                                <Text fontSize="xs" fontWeight="bold" color="gray.600">
                                                                    👤 {fu.addedBy}
                                                                </Text>
                                                            )}
                                                        </HStack>
                                                        <Text fontSize="10px" color="gray.400" fontWeight="bold">{addedAt}</Text>
                                                    </HStack>
                                                    <Text fontSize="sm" color="gray.800" fontWeight="medium" mb={1.5}>
                                                        💬 {fu.remark}
                                                    </Text>
                                                    {fu.nextFollowUpDate && (
                                                        <Text fontSize="xs" color="blue.600" fontWeight="extrabold">
                                                            📅 Next Follow-up: {nextDate}
                                                        </Text>
                                                    )}
                                                </Box>
                                            </HStack>
                                        );
                                    })}
                                </VStack>
                            ) : (
                                <Box py={8} textAlign="center" color="gray.500">
                                    <Text fontSize="sm" fontWeight="bold">No previous remarks yet.</Text>
                                    <Text fontSize="xs">Add your first follow-up note above to schedule the next reminder.</Text>
                                </Box>
                            )}
                        </Box>
                    </ModalBody>
                    <ModalFooter bg="gray.100" p={3} borderTop="1px solid" borderColor="gray.200">
                        <Button size="sm" variant="ghost" borderRadius="xl" onClick={onFollowUpClose}>
                            Close
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* ── WhatsApp Invoice Direct Send Modal ── */}
            <Modal isOpen={whatsappModal.isOpen} onClose={() => setWhatsappModal(prev => ({ ...prev, isOpen: false }))} isCentered size="md" isLazy unmountOnClose>
                <ModalOverlay bg="blackAlpha.700" />
                <ModalContent borderRadius={{ base: "2xl", md: "3xl" }} shadow="2xl" maxW={{ base: "96vw", md: "md" }}>
                    <ModalHeader bg="green.500" color="white" borderTopRadius="2xl" display="flex" alignItems="center" gap={2} p={{ base: 3.5, md: 4 }}>
                        <Icon as={FaWhatsapp} w={{ base: 5, md: 6 }} h={{ base: 5, md: 6 }} />
                        <VStack align="start" spacing={0}>
                            <Text fontSize={{ base: "sm", md: "lg" }} fontWeight="bold">Send Invoice via WhatsApp</Text>
                            <Text fontSize="2xs" fontWeight="normal" opacity={0.9}>
                                {whatsappModal.invoiceType === 'proforma' ? '📄 Proforma Invoice' : '🧾 Tax Invoice'} — {whatsappModal.invoiceId}
                            </Text>
                        </VStack>
                    </ModalHeader>
                    <ModalCloseButton color="white" top={{ base: 2, md: 3 }} right={{ base: 2, md: 3 }} />
                    <ModalBody py={{ base: 4, md: 6 }}>
                        <VStack spacing={4} align="stretch">
                            <Alert status="info" borderRadius="xl" fontSize="xs">
                                <AlertIcon />
                                PDF will be sent using your logged-in Admin WhatsApp session.
                            </Alert>
                            
                            <FormControl isRequired>
                                <FormLabel fontWeight="bold" fontSize="xs" color="gray.700">Phone Number</FormLabel>
                                <InputGroup>
                                    <InputLeftElement color="gray.400"><Icon as={FaWhatsapp} /></InputLeftElement>
                                    <Input
                                        type="tel"
                                        placeholder="Enter 10-digit mobile number"
                                        value={whatsappModal.phone}
                                        onChange={(e) => setWhatsappModal(prev => ({ ...prev, phone: e.target.value }))}
                                        borderRadius="xl"
                                        focusBorderColor="green.500"
                                        fontWeight="bold"
                                        fontSize="xs"
                                    />
                                </InputGroup>
                                <Text fontSize="2xs" color="gray.500" mt={1}>
                                    Recipient: {whatsappModal.clientName}
                                </Text>
                            </FormControl>

                            {/* Selected documents list */}
                            {whatsappModal.additionalDocUrls?.length > 0 && (
                                <Box border="1px solid" borderColor="teal.200" borderRadius="xl" p={3} bg="teal.50">
                                    <HStack mb={2} spacing={2}>
                                        <Icon as={FaCheckCircle} color="teal.500" w={4} h={4} />
                                        <Text fontSize="xs" fontWeight="black" color="teal.700" textTransform="uppercase" letterSpacing="wider">
                                            {whatsappModal.additionalDocUrls.length} document{whatsappModal.additionalDocUrls.length !== 1 ? 's' : ''} will be sent
                                        </Text>
                                    </HStack>
                                    <VStack align="stretch" spacing={1} maxH="120px" overflowY="auto">
                                        {whatsappModal.additionalDocUrls.map((url, i) => {
                                            const fname = url.split('/').pop() || `Document ${i + 1}`;
                                            const isPdf = url.match(/\.pdf$/i);
                                            return (
                                                <HStack key={i} spacing={2} px={2} py={1} bg="white" borderRadius="lg" border="1px solid" borderColor="teal.100">
                                                    <Icon as={isPdf ? FaFilePdf : FaFileAlt} color="teal.500" w={3} h={3} flexShrink={0} />
                                                    <Text fontSize="11px" color="gray.700" noOfLines={1} title={fname} flex={1}>{fname}</Text>
                                                </HStack>
                                            );
                                        })}
                                    </VStack>
                                </Box>
                            )}
                        </VStack>
                    </ModalBody>
                    <ModalFooter borderTop="1px solid" borderColor="gray.100" p={{ base: 3, md: 4 }}>
                        <Button variant="ghost" mr={3} borderRadius="xl" onClick={() => setWhatsappModal(prev => ({ ...prev, isOpen: false }))}>
                            Cancel
                        </Button>
                        <Button
                            colorScheme="whatsapp"
                            bg="#25D366"
                            color="white"
                            _hover={{ bg: '#128C7E' }}
                            leftIcon={<FaWhatsapp />}
                            isLoading={whatsappModal.isSending}
                            loadingText="Sending PDF..."
                            borderRadius="xl"
                            px={6}
                            onClick={handleSendWhatsappInvoice}
                        >
                            Apply
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

        </Box>
    );
};

export default InvoiceReport;
