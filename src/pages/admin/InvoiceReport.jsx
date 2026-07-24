import React, { useState, useEffect, useCallback } from 'react';
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
    FaListUl, FaExclamationTriangle, FaMoneyBillWave
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
            if (idStr && idStr.startsWith('PRM/')) {
                const parts = idStr.split('/');
                const lastPart = parts[parts.length - 1];
                const num = parseInt(lastPart, 10);
                if (!isNaN(num) && num > maxNum) maxNum = num;
            }
        });
        const nextSeq = String(maxNum + 1).padStart(4, '0');
        return `PRM/${nextSeq}`;
    } else {
        schedulesList.forEach(s => {
            let idStr = s.finalInvoiceId || (s.invoiceType === 'final' ? s.invoiceDetails?.invoiceId : null);
            if (idStr && idStr.includes(fyStr) && idStr.includes(prefix)) {
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
        return { bg: 'red.50', border: 'red.400', hoverBg: 'red.100' };
    }
    if (sType === 'MONTH') {
        return { bg: 'blue.50', border: 'blue.400', hoverBg: 'blue.100' };
    }
    if (sType === 'POINT MARKING') {
        return { bg: 'purple.50', border: 'purple.400', hoverBg: 'purple.100' };
    }
    
    // VISIT / others: color based on ledger if present (Full Day = green, Half Day = orange)
    const ledgerVal = ledg || 'Full Day';
    if (ledgerVal === 'Full Day') return { bg: 'green.50', border: 'green.300', hoverBg: 'green.100' };
    if (ledgerVal === 'Half Day') return { bg: 'orange.50', border: 'orange.300', hoverBg: 'orange.100' };
    
    return { bg: 'white', border: 'gray.200', hoverBg: 'gray.50' };
};

// ── Main Component ────────────────────────────────────────────────────────────
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
    const [cashUpiModal, setCashUpiModal] = useState({
        isOpen: false,
        remark: '',
        isSubmitting: false
    });

    // Filters
    const [search, setSearch] = useState('');
    const [filterLedger, setFilterLedger] = useState('');
    const [filterDateFrom, setFilterDateFrom] = useState('');
    const [filterDateTo, setFilterDateTo] = useState('');

    // Fetch schedules
    const fetchVisitSchedules = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
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
                
                setSchedules(formattedSchedules);
                // Do not auto-select entries on load as per user request
                // setSelectedEntries(formattedSchedules.filter(s => s.invoiceStatus !== 'Completed').map(s => s._id));
            }
        } catch (err) {
            toast({ title: 'Failed to load schedules', status: 'error', duration: 3000 });
        } finally {
            setLoading(false);
        }
    }, [filterDateFrom, filterDateTo]);

    useEffect(() => { fetchVisitSchedules(); }, [fetchVisitSchedules]);

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
                fetchVisitSchedules();
            }
        };
        window.addEventListener('app-realtime-update', handleRealtimeUpdate);
        return () => window.removeEventListener('app-realtime-update', handleRealtimeUpdate);
    }, [fetchVisitSchedules]);

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

    // Filter logic based on documents
    const validSchedules = schedules.filter(s => {
        if (s.dayStatus === 'Rejected') return false;
        
        if (s.scheduleType === 'TOPOGRAPHY SURVEY') {
            return s.dayStatus === 'Completed';
        }
        
        if (s.scheduleType === 'MONTH' && s.endDate) {
            const end = new Date(s.endDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (end <= today) {
                return true;
            }
        }
        
        const hasCoreDocs = s.allDocuments && s.allDocuments.some(d => {
            // EXPLICITLY ignore Expense Receipts when determining if a schedule is ready for invoice
            if (d.category || d.url?.includes('employee_master') || d.url?.includes('expense_') || d.url?.includes('otherExpense_')) {
                return false;
            }

            const isPhoto = d.url?.includes('/photos/') || d.name?.toLowerCase().includes('photo') || (d.url?.includes('site_') && d.url?.includes('photos')) || d.url?.includes('/uploads/photos-');
            const isReport = d.url?.includes('/Daily_report/') || d.url?.includes('dailyReports') || d.name?.toLowerCase().includes('report');
            const isData = d.url?.includes('/data/') || d.url?.includes('dataFiles') || (d.url?.includes('site_') && d.url?.includes('data'));
            const isDrawing = d.url?.includes('/drawing/') || (d.url?.includes('site_') && d.url?.includes('drawing'));
            
            return isPhoto || isReport || isData || isDrawing;
        });
            
        return hasCoreDocs;
    });

    // Filter client-side by search text, ledger, and active tab status
    const displayed = validSchedules.filter(s => {
        const q = search.toLowerCase();
        const matchSearch = !q ||
            s.client?.clientName?.toLowerCase().includes(q) ||
            s.site?.siteName?.toLowerCase().includes(q) ||
            s.operative?.name?.toLowerCase().includes(q);
        const matchLedger = !filterLedger || s.ledger === filterLedger;
        
        const stat = s.invoiceStatus || 'Pending';
        const normalizedStat = (stat === 'Completed' || stat === 'Closed') ? 'Closed' : stat;
        const targetStatus = ['Pending', 'Proforma', 'Final', 'Closed'][activeTab];
        const matchTab = normalizedStat === targetStatus;

        return matchSearch && matchLedger && matchTab;
    });

    const stats = {
        total: validSchedules.length,
        pending: validSchedules.filter(s => s.invoiceStatus !== 'Completed' && s.invoiceStatus !== 'Closed').length,
        completed: validSchedules.filter(s => s.invoiceStatus === 'Completed' || s.invoiceStatus === 'Closed').length,
        fullDay: validSchedules.filter(s => s.ledger === 'Full Day').length,
        halfDay: validSchedules.filter(s => s.ledger === 'Half Day').length,
    };

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

            // Step 1: Try to find the best site ledger match using AMOUNT (most reliable unique key)
            // because the same ledger NAME may be reused across schedules while amounts differ
            const matchByAmount = entry.amount > 0
                ? siteLedgers.find(l => Number(l.amount) === Number(entry.amount))
                : null;

            // Step 2: Try to match by saved ledger NAME
            const matchByName = entry.ledger && entry.ledger.trim()
                ? siteLedgers.find(l => l.ledger === entry.ledger.trim())
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

            const matchedLedgerItem = matchByAmount || matchByName;
            const defaultHsnSac = matchedLedgerItem?.hsnSac || '';
            const defaultShortName = matchedLedgerItem?.shortName || '';
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

        // Determine next Invoice ID based on Financial Year and selected Company Prefix
        const initialCompany = freshCompanies.length > 0 ? freshCompanies[0] : null;
        const actualType = type === 'CASH_UPI' ? 'FINAL' : type;
        const nextInvoiceId = generateNextInvoiceId(schedules, actualType, initialCompany);

        const baseClient = entriesToInvoice[0].client;
        const baseSite = entriesToInvoice[0].site;

        setInvoiceForm({
            isOpen: true,
            type: actualType,
            paymentMode: type === 'CASH_UPI' ? 'Cash/UPI' : 'Credit',
            isCashUpi: type === 'CASH_UPI',
            includeDates: true,
            entries: entriesToInvoice,
            entryConfigs: initialConfigs,
            companyDetails: initialCompany,
            buyerDetails: {
                name: baseClient?.clientName || 'NA',
                address: baseClient?.clientAddress || 'NA',
                gstin: baseClient?.gstNo || 'NA',
                stateName: baseClient?.state || 'Gujarat',
                stateCode: '24',
                contactPerson: baseClient?.contactPerson?.name || 'NA',
                contact: baseClient?.contactPerson?.phone || (baseClient?.contactNumbers?.[0] || 'NA'),
            },
            shipToDetails: {
                name: baseClient?.clientName || baseSite?.siteName || 'NA',
                address: baseClient?.clientAddress || baseSite?.siteAddress || 'NA',
                gstin: baseClient?.gstNo || 'NA',
                stateName: baseSite?.stateName || baseClient?.state || 'Gujarat',
                stateCode: baseSite?.stateCode || '24',
                contactPerson: baseSite?.contactPersons?.[0]?.name || baseClient?.contactPerson?.name || 'NA',
                contact: baseSite?.contactPersons?.[0]?.phone || baseSite?.contactPhone || 'NA',
            },
            invoiceId: nextInvoiceId,
            description: '',
            targetGroup: null, // No longer bound to a single group
            gstType: ((baseSite?.stateCode || baseClient?.stateCode || '24') === '24') ? 'CGST_SGST' : 'IGST',
            gstPercentage: 18
        });
    };

    const handleSubmitInvoiceForm = async () => {
        try {
            setLoading(true);
            
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
                    generatedAt: new Date().toISOString()
                },
                pdfHtml
            });

            if (res.data.success) {
                toast({ title: 'Invoice Generated successfully!', status: 'success' });
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
            const closedDateStr = new Date().toISOString();
            const remarkText = cashUpiModal.remark.trim() || 'Paid via Cash / UPI';

            for (const entryId of selectedEntries) {
                await api.patch(`/schedule-master/invoice-status/${entryId}`, {
                    invoiceStatus: 'Closed',
                    paymentMode: 'Cash/UPI',
                    paymentRemark: remarkText,
                    closedDate: closedDateStr
                });
            }

            toast({
                title: 'Paid via Cash / UPI',
                description: `${selectedEntries.length} entries marked as paid & moved to Closed status on ${new Date(closedDateStr).toLocaleDateString('en-GB')}`,
                status: 'success',
                duration: 4000
            });

            setCashUpiModal({ isOpen: false, remark: '', isSubmitting: false });
            setSelectedGroup(null);
            setSelectedEntries([]);
            fetchVisitSchedules();
        } catch (err) {
            toast({ title: 'Failed to process Cash / UPI payment', status: 'error' });
            setCashUpiModal(prev => ({ ...prev, isSubmitting: false }));
        }
    };

    const handleStatusMove = async (group, newStatus) => {
        try {
            setLoading(true);
            const entriesToMove = group.entries.filter(e => selectedEntries.includes(e._id));
            if(entriesToMove.length === 0) {
                toast({title: 'No entries selected', status:'warning'});
                return;
            }
            for (const entry of entriesToMove) {
                await api.patch(`/schedule-master/invoice-status/${entry._id}`, { invoiceStatus: newStatus });
            }
            toast({ title: `Moved to ${newStatus}`, status: 'success' });
            setSelectedGroup(null);
            fetchVisitSchedules();
        } catch(e) {
            toast({ title: 'Error moving entries', status: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box py={6} bg="gray.50" minH="100vh">
            <Container maxW="container.xl">
                {!isInsideServices && <ModulePermissionBar moduleGroupKey="otherServicesGroup" subModuleFilterKey="invoiceReport" />}
                <VStack spacing={6} align="stretch">

                    {/* ── Header ── */}
                    <Flex align="center" justify="space-between" bg="white" p={6} borderRadius="2xl" shadow="sm" border="1px solid" borderColor="gray.100">
                        <HStack spacing={4}>
                            <Box bgGradient="linear(to-br, blue.600, purple.600)" p={3} borderRadius="xl" color="white">
                                <Icon as={FaFileInvoiceDollar} w={6} h={6} />
                            </Box>
                            <VStack align="start" spacing={0}>
                                <Heading size="lg" bgGradient="linear(to-r, blue.600, purple.600)" bgClip="text">Invoice Report</Heading>
                                <Text color="gray.500" fontSize="sm">Track & generate invoices grouped by client and site</Text>
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
                        />
                    </Flex>

                    {/* ── Stats Cards ── */}
                    <SimpleGrid columns={{ base: 2, md: 5 }} spacing={4}>
                        {[
                            { label: 'Total Visits', value: stats.total, color: 'blue', icon: FaBuilding },
                            { label: 'Pending Bills', value: stats.pending, color: 'orange', icon: FaClock },
                            { label: 'Completed Bills', value: stats.completed, color: 'green', icon: FaCheckCircle },
                            { label: 'Full Day', value: stats.fullDay, color: 'teal', icon: FaCalendarAlt },
                            { label: 'Half Day', value: stats.halfDay, color: 'purple', icon: FaCalendarAlt },
                        ].map(({ label, value, color, icon }) => (
                            <Card key={label} borderRadius="xl" shadow="sm" border="1px solid" borderColor={`${color}.100`} bg={`${color}.50`}>
                                <CardBody p={4}>
                                    <HStack justify="space-between">
                                        <VStack align="start" spacing={0}>
                                            <Text fontSize="xs" color={`${color}.600`} fontWeight="bold" textTransform="uppercase">{label}</Text>
                                            <Heading size="xl" color={`${color}.700`}>{value}</Heading>
                                        </VStack>
                                        <Icon as={icon} w={7} h={7} color={`${color}.300`} />
                                    </HStack>
                                </CardBody>
                            </Card>
                        ))}
                    </SimpleGrid>

                    {/* ── Tabs & Global Actions ── */}
                    <Flex justify="space-between" align="center">
                        <Tabs variant="soft-rounded" colorScheme="blue" index={activeTab} onChange={(idx) => { setActiveTab(idx); setSelectedGroup(null); setSelectedEntries([]); }}>
                            <TabList bg="white" p={2} borderRadius="xl" shadow="sm" border="1px solid" borderColor="gray.100">
                                <Tab fontWeight="bold">⏳ Pending</Tab>
                                <Tab fontWeight="bold">📄 Proforma</Tab>
                                <Tab fontWeight="bold">✅ Final Invoice</Tab>
                                <Tab fontWeight="bold">🔒 Closed</Tab>
                            </TabList>
                        </Tabs>
                        
                        {selectedEntries.length > 0 && (
                            <HStack bg="white" p={2} borderRadius="xl" shadow="sm" border="1px solid" borderColor="gray.100">
                                <HStack spacing={2} px={2} mr={2} borderRight="1px solid" borderColor="gray.200">
                                    <Text fontSize="sm" fontWeight="bold" color="blue.600">
                                        {selectedEntries.length} selected ({activeSelectedClientName})
                                    </Text>
                                    <Button size="xs" variant="ghost" colorScheme="red" onClick={() => setSelectedEntries([])}>Clear</Button>
                                </HStack>
                            </HStack>
                        )}
                    </Flex>

                    {/* ── Filters ── */}
                    <Card borderRadius="2xl" shadow="sm" border="1px solid" borderColor="gray.100">
                        <CardBody p={5}>
                            <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4} alignItems="flex-end">
                                <InputGroup>
                                    <InputLeftElement><Icon as={FaSearch} color="gray.400" /></InputLeftElement>
                                    <Input
                                        placeholder="Search client, site, operative..."
                                        value={search}
                                        onChange={e => setSearch(e.target.value)}
                                        borderRadius="xl"
                                        bg="gray.50"
                                    />
                                </InputGroup>
                                <Select placeholder="All Ledger Types" value={filterLedger} onChange={e => setFilterLedger(e.target.value)} borderRadius="xl" bg="gray.50">
                                    <option value="Full Day">Full Day</option>
                                    <option value="Half Day">Half Day</option>
                                </Select>
                                <Input type="date" placeholder="From Date" value={filterDateFrom} onChange={e => setFilterDateFrom(e.target.value)} borderRadius="xl" bg="gray.50" />
                                <Input type="date" placeholder="To Date" value={filterDateTo} onChange={e => setFilterDateTo(e.target.value)} borderRadius="xl" bg="gray.50" />
                            </SimpleGrid>
                        </CardBody>
                    </Card>

                    {/* ── Table ── */}
                    <Card borderRadius="2xl" shadow="sm" border="1px solid" borderColor="gray.100" overflow="hidden">
                        {/* Legend */}
                        <Box px={6} pt={4} pb={2}>
                            <HStack spacing={4}>
                                <Text fontSize="xs" fontWeight="bold" color="gray.500">LEGEND:</Text>
                                <HStack spacing={1}>
                                    <Box w={3} h={3} bg="green.300" borderRadius="sm" />
                                    <Text fontSize="xs" color="gray.600">Full Day Visit</Text>
                                </HStack>
                                <HStack spacing={1}>
                                    <Box w={3} h={3} bg="orange.300" borderRadius="sm" />
                                    <Text fontSize="xs" color="gray.600">Half Day Visit</Text>
                                </HStack>
                                <HStack spacing={1}>
                                    <Box w={3} h={3} bg="blue.400" borderRadius="sm" />
                                    <Text fontSize="xs" color="gray.600">Month Contract</Text>
                                </HStack>
                                <HStack spacing={1}>
                                    <Box w={3} h={3} bg="red.400" borderRadius="sm" />
                                    <Text fontSize="xs" color="gray.600">Topography Survey</Text>
                                </HStack>
                                <HStack spacing={1}>
                                    <Box w={3} h={3} bg="purple.400" borderRadius="sm" />
                                    <Text fontSize="xs" color="gray.600">Point Marking</Text>
                                </HStack>
                                <Text fontSize="xs" color="gray.400" ml="auto">{groupedGroups.length} entries listed</Text>
                            </HStack>
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
                                <TableContainer overflow="hidden" w="full">
                                    <Table variant="simple" size="sm" sx={{ 'th, td': { whiteSpace: 'normal', wordBreak: 'break-word' } }}>
                                        <Thead bg="gray.50">
                                            <Tr>
                                                <Th py={4} color="gray.500" fontSize="10px" w="50px">#</Th>
                                                <Th py={4} color="gray.500" fontSize="10px">CLIENT NAME</Th>
                                                <Th py={4} color="gray.500" fontSize="10px">SCHEDULE TYPE</Th>
                                                <Th py={4} color="gray.500" fontSize="10px" textAlign="center" w="160px">SITES & DATA</Th>
                                                <Th py={4} color="gray.500" fontSize="10px" w="150px">BILL STATUS</Th>
                                                <Th py={4} color="gray.500" fontSize="10px" textAlign="right" w="150px">ACTIONS</Th>
                                            </Tr>
                                        </Thead>
                                        <Tbody>
                                            {groupedGroups.map((group, idx) => {
                                                const totalCount = group.entries.length;
                                                const completedCount = group.entries.filter(e => e.invoiceStatus === 'Completed').length;
                                                const pendingCount = totalCount - completedCount;
                                                const isPending = group.status === 'Pending';
                                                const siteCount = group.siteGroups ? group.siteGroups.length : 1;
                                                
                                                const groupClientId = String(group.client?._id || group.client);
                                                const isDifferentClient = activeSelectedClientId && groupClientId !== activeSelectedClientId;

                                                // Color variables for main row based on schedule type
                                                const { bg, border, hoverBg } = rowStyle(group);

                                                return (
                                                    <Tr
                                                        key={group.groupId}
                                                        bg={bg}
                                                        opacity={isDifferentClient ? 0.35 : 1}
                                                        filter={isDifferentClient ? 'blur(1.2px) grayscale(70%)' : 'none'}
                                                        pointerEvents={isDifferentClient ? 'none' : 'auto'}
                                                        _hover={{ bg: isDifferentClient ? bg : hoverBg, transition: 'background 0.15s' }}
                                                        borderLeft="4px solid"
                                                        borderLeftColor={isDifferentClient ? 'gray.300' : border}
                                                        cursor={isDifferentClient ? 'not-allowed' : 'pointer'}
                                                        onClick={() => {
                                                            if (isDifferentClient) return;
                                                            setSelectedGroup(group);
                                                            setSelectedEntryForDocs(null);
                                                        }}
                                                    >
                                                        <Td py={4} color="gray.400" fontSize="xs">
                                                            {idx + 1}
                                                        </Td>
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
                                                        <Td py={4} textAlign="right" onClick={(e) => e.stopPropagation()}>
                                                            <HStack justify="flex-end" spacing={2}>
                                                                {activeTab === 2 && (
                                                                    <Button size="xs" colorScheme="gray" variant="solid" onClick={() => handleStatusMove(group, 'Closed')}>Mark Closed</Button>
                                                                )}
                                                                {activeTab === 3 && (
                                                                    <Badge colorScheme="gray">Archived</Badge>
                                                                )}
                                                                {(group.proformaInvoicePdf || group.finalInvoicePdf) && (
                                                                    <Tooltip label="View Generated Invoice PDF" placement="top">
                                                                        <IconButton
                                                                            as="a"
                                                                            href={`${API_BASE_URL}${group.finalInvoicePdf || group.proformaInvoicePdf}`}
                                                                            target="_blank"
                                                                            icon={<FaFilePdf />}
                                                                            size="sm"
                                                                            colorScheme="red"
                                                                            variant="solid"
                                                                            borderRadius="full"
                                                                        />
                                                                    </Tooltip>
                                                                )}
                                                                <IconButton
                                                                    aria-label="View Details"
                                                                    icon={<FaListUl />}
                                                                    size="sm"
                                                                    colorScheme="blue"
                                                                    variant="ghost"
                                                                    borderRadius="full"
                                                                    onClick={() => {
                                                                        setSelectedGroup(group);
                                                                        setSelectedEntryForDocs(null);
                                                                    }}
                                                                />
                                                            </HStack>
                                                        </Td>
                                                    </Tr>
                                                );
                                            })}
                                        </Tbody>
                                    </Table>
                                </TableContainer>
                            )}
                        </CardBody>
                    </Card>
                </VStack>
            </Container>

            {/* ── Group Details & Billing Checkbox Modal ── */}
            <Modal isOpen={!!selectedGroup} onClose={() => { setSelectedGroup(null); setSelectedEntryForDocs(null); }} size="5xl" isCentered scrollBehavior="inside" motionPreset="slideInBottom">
                <ModalOverlay backdropFilter="blur(8px)" bg="blackAlpha.600" />
                <ModalContent borderRadius="3xl" overflow="hidden" boxShadow="2xl" maxH="90vh">
                    <ModalHeader p={0}>
                        <Box bgGradient="linear(to-r, blue.700, purple.600)" p={6} color="white">
                            <HStack spacing={4}>
                                <Icon as={FaBuilding} w={7} h={7} />
                                <VStack align="start" spacing={0}>
                                    <Text fontWeight="black" fontSize="xl">
                                        {selectedGroup?.client?.clientName || 'Client Details'}
                                    </Text>
                                    <Text fontSize="xs" opacity={0.85}>
                                        {selectedGroup?.siteGroups?.length || 0} {selectedGroup?.siteGroups?.length === 1 ? 'Site' : 'Sites'} Available • {selectedGroup?.entries?.length || 0} Total Visit Entries
                                    </Text>
                                </VStack>
                            </HStack>
                        </Box>
                    </ModalHeader>
                    <ModalCloseButton color="white" top={4} right={4} />
                    <ModalBody p={6} maxH="75vh" overflowY="auto" bg="gray.50">
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
                                                    onClick={() => setCashUpiModal({ isOpen: true, remark: '', isSubmitting: false })}
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
            <Modal isOpen={invoiceForm.isOpen} onClose={() => setInvoiceForm(prev => ({ ...prev, isOpen: false }))} size="6xl" isCentered scrollBehavior="inside" motionPreset="slideInBottom">
                <ModalOverlay backdropFilter="blur(6px)" bg="blackAlpha.600" />
                <ModalContent borderRadius="2xl" maxH="90vh">
                    <ModalHeader bg={invoiceForm.type === 'PROFORMA' ? 'purple.500' : 'green.500'} color="white">
                        Configure {invoiceForm.type === 'PROFORMA' ? 'Proforma' : 'Final'} Invoice
                    </ModalHeader>
                    <ModalCloseButton color="white" />
                    <ModalBody p={6} maxH="75vh" overflowY="auto">
                        <VStack spacing={6} align="stretch">
                            <Box bg="white" p={4} borderRadius="xl" border="1px solid" borderColor="gray.200" shadow="sm">
                                <Text fontSize="md" fontWeight="black" mb={4} color="blue.700" textTransform="uppercase">1. Company & Description</Text>
                                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                                    <Box>
                                        <Text fontSize="sm" fontWeight="bold" mb={2} color="gray.700">Billing Company Selection</Text>
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
                                            size="md"
                                            borderRadius="xl"
                                        >
                                            {companies.length === 0 && <option value="">No Companies Found</option>}
                                            {companies.map(c => (
                                                <option key={c._id} value={c._id}>{c.companyName}</option>
                                            ))}
                                        </Select>
                                    </Box>
                                    <Box>
                                        <Text fontSize="sm" fontWeight="bold" mb={2} color="gray.700">Invoice No.</Text>
                                        <Input 
                                            value={invoiceForm.invoiceId} 
                                            onChange={(e) => setInvoiceForm(prev => ({ ...prev, invoiceId: e.target.value }))}
                                            bg="white"
                                            fontWeight="bold"
                                            color="blue.600"
                                            borderRadius="md"
                                        />
                                    </Box>
                                </SimpleGrid>

                                <Box mt={4} p={4} bg="blue.50" borderRadius="xl" border="1px solid" borderColor="blue.200">
                                    <Text fontSize="xs" fontWeight="black" color="blue.800" textTransform="uppercase" mb={2}>
                                        📅 Include Visit Schedule Date(s) in Item Description?
                                    </Text>
                                    <RadioGroup 
                                        value={invoiceForm.includeDates !== false ? 'yes' : 'no'} 
                                        onChange={(val) => setInvoiceForm(prev => ({ ...prev, includeDates: val === 'yes' }))}
                                    >
                                        <HStack spacing={6}>
                                            <Radio value="yes" colorScheme="blue">
                                                <Text fontSize="xs" fontWeight="bold" color="blue.900">YES — Include Visit Date(s) (e.g. DATE : 24/07/2026)</Text>
                                            </Radio>
                                            <Radio value="no" colorScheme="red">
                                                <Text fontSize="xs" fontWeight="bold" color="gray.700">NO — Omit Dates from Description</Text>
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
                                                                    const selectedLedger = entry.site?.ledgerItems?.find(l => l.ledger === e.target.value);
                                                                    setInvoiceForm(prev => ({
                                                                        ...prev,
                                                                        entryConfigs: {
                                                                            ...prev.entryConfigs,
                                                                            [entry._id]: { 
                                                                                ...conf, 
                                                                                ledger: e.target.value,
                                                                                ledgerName: e.target.value,
                                                                                rate: selectedLedger ? selectedLedger.amount : conf.rate,
                                                                                hsnSac: selectedLedger?.hsnSac || '',
                                                                                shortName: selectedLedger?.shortName || conf.shortName || ''
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
                    <ModalFooter bg="gray.50">
                        <Button variant="ghost" mr={3} onClick={() => setInvoiceForm(prev => ({ ...prev, isOpen: false }))}>Cancel</Button>
                        <Button 
                            colorScheme={invoiceForm.type === 'PROFORMA' ? 'purple' : 'green'} 
                            onClick={handleSubmitInvoiceForm}
                            isLoading={loading}
                        >
                            Submit & Generate {invoiceForm.type === 'PROFORMA' ? 'Proforma' : 'Final'}
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* ── Missing Site Ledger Instruction Modal Popup ── */}
            <Modal isOpen={missingLedgerSitesModal.isOpen} onClose={() => setMissingLedgerSitesModal({ isOpen: false, sites: [] })} size="lg" isCentered motionPreset="slideInBottom">
                <ModalOverlay backdropFilter="blur(6px)" bg="blackAlpha.600" />
                <ModalContent borderRadius="3xl" overflow="hidden" boxShadow="2xl">
                    <ModalHeader bg="orange.500" color="white" p={5}>
                        <HStack spacing={3}>
                            <Icon as={FaExclamationTriangle} w={6} h={6} />
                            <Text fontWeight="black" fontSize="lg">Action Required: Missing Site Ledgers</Text>
                        </HStack>
                    </ModalHeader>
                    <ModalCloseButton color="white" top={4} right={4} />
                    <ModalBody p={6}>
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
                    <ModalFooter bg="gray.50">
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
            {/* ── Cash / UPI Remark & Close Modal ── */}
            <Modal isOpen={cashUpiModal.isOpen} onClose={() => setCashUpiModal(prev => ({ ...prev, isOpen: false }))} size="md" isCentered scrollBehavior="inside" motionPreset="slideInBottom">
                <ModalOverlay backdropFilter="blur(6px)" bg="blackAlpha.600" />
                <ModalContent borderRadius="3xl" overflow="hidden" boxShadow="2xl" maxH="85vh">
                    <ModalHeader bg="teal.600" color="white" p={5}>
                        <HStack spacing={3}>
                            <Icon as={FaMoneyBillWave} w={6} h={6} />
                            <Text fontSize="lg" fontWeight="black">
                                Cash / UPI Payment Entry
                            </Text>
                        </HStack>
                    </ModalHeader>
                    <ModalCloseButton color="white" top={4} right={4} />
                    <ModalBody p={6}>
                        <VStack spacing={4} align="stretch">
                            <Box bg="teal.50" p={4} borderRadius="2xl" border="1px solid" borderColor="teal.100">
                                <Text fontSize="xs" fontWeight="bold" color="teal.800">
                                    {selectedEntries.length} Entry(ies) Selected for Client: <b>{activeSelectedClientName}</b>
                                </Text>
                                <Text fontSize="11px" color="teal.600" mt={1}>
                                    This action will mark the selected entries as paid via Cash/UPI and directly move them to <b>Closed</b> status.
                                </Text>
                            </Box>

                            <FormControl>
                                <FormLabel fontSize="xs" fontWeight="bold" color="gray.700">Closed Date</FormLabel>
                                <Input
                                    value={new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                    isReadOnly
                                    bg="gray.100"
                                    borderRadius="xl"
                                    fontWeight="bold"
                                    color="teal.700"
                                />
                            </FormControl>

                            <FormControl isRequired>
                                <FormLabel fontSize="xs" fontWeight="bold" color="gray.700">Payment Remark / Reference</FormLabel>
                                <Textarea
                                    placeholder="e.g. Received ₹5,000 via GPay ref #12345 / Cash received by site team"
                                    value={cashUpiModal.remark}
                                    onChange={(e) => setCashUpiModal(prev => ({ ...prev, remark: e.target.value }))}
                                    borderRadius="xl"
                                    rows={3}
                                />
                            </FormControl>
                        </VStack>
                    </ModalBody>
                    <ModalFooter bg="gray.50" p={4}>
                        <Button variant="ghost" mr={3} borderRadius="full" onClick={() => setCashUpiModal(prev => ({ ...prev, isOpen: false }))}>
                            Cancel
                        </Button>
                        <Button
                            colorScheme="teal"
                            borderRadius="full"
                            px={8}
                            isLoading={cashUpiModal.isSubmitting}
                            leftIcon={<FaCheckCircle />}
                            onClick={handleConfirmCashUpi}
                        >
                            Confirm & Close Entry
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
};

export default InvoiceReport;
