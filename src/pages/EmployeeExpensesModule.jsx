import React, { useState, useEffect, useMemo } from 'react';
import {
    Box, Container, VStack, HStack, Text, Heading, SimpleGrid, Card, CardBody, 
    Button, IconButton, Icon, Badge, Select, Input, InputGroup, InputLeftElement, 
    Table, Thead, Tbody, Tr, Th, Td, TableContainer, Divider, useToast, 
    Tabs, TabList, TabPanels, Tab, TabPanel, FormControl, FormLabel,
    Flex, Spinner, Center, Tooltip, CloseButton, Image, List, ListItem, ListIcon,
    Popover, PopoverTrigger, PopoverContent, PopoverBody, PopoverArrow, Portal,
    Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
    useDisclosure, Switch, Alert, AlertIcon, AlertTitle, AlertDescription,
    Tag, TagLabel, TagLeftIcon
} from '@chakra-ui/react';
import { 
    FaMoneyBillWave, FaExchangeAlt, FaPlus, FaTrash, FaEye,
    FaUserTie, FaCheckCircle, FaEdit, FaRupeeSign, FaArrowRight,
    FaCalendarAlt, FaUtensils, FaGasPump, FaBuilding, FaCamera, FaFileAlt, FaFolderOpen, FaChartBar, FaCloudUploadAlt,
    FaPaperclip, FaUsers, FaChevronLeft, FaChevronRight, FaUserCheck, FaUserSlash, FaClipboardList,
    FaHome, FaWarehouse, FaChevronDown, FaChevronUp, FaBed,
    FaTools, FaCar, FaReceipt, FaFilePdf, FaDownload, FaExternalLinkAlt, FaInfoCircle, FaMapMarkerAlt
} from 'react-icons/fa';
import api from '../api/axios';
import AdminEmployeeExpenses from '../components/AdminEmployeeExpenses';
import ModulePermissionBar from '../components/admin/ModulePermissionBar';
import { useAuth } from '../context/AuthContext';
import { hasPermission } from '../utils/permissions';

const EmployeeExpensesModule = ({ isInsideServices = false }) => {
    const { user } = useAuth();
    
    const canReadModule = hasPermission(user, 'employeeExpense', 'read');
    const canReadTransfer = hasPermission(user, 'employeeExpense_transfer', 'read');
    const canWriteTransferCreate = hasPermission(user, 'employeeExpense_transfer_create', 'write');
    const canReadTransferView = hasPermission(user, 'employeeExpense_transfer_view', 'read');
    const canWriteTransferView = hasPermission(user, 'employeeExpense_transfer_view', 'write');
    const canReadTransferAttendance = hasPermission(user, 'employeeExpense_transfer_attendance', 'read');
    const canWriteTransferAttendance = hasPermission(user, 'employeeExpense_transfer_attendance', 'write');
    const canReadTransferCustomAccount = hasPermission(user, 'employeeExpense_transfer_customAccount', 'read');
    const canWriteTransferCustomAccount = hasPermission(user, 'employeeExpense_transfer_customAccount', 'write');
    const canReadDaily = hasPermission(user, 'employeeExpense_daily', 'read');
    const canWriteDaily = hasPermission(user, 'employeeExpense_daily', 'write');
    const canReadReport = hasPermission(user, 'employeeExpense_report', 'read');
    const canWriteReport = hasPermission(user, 'employeeExpense_report', 'write');

    const [employees, setEmployees] = useState([]);
    const [clients, setClients] = useState([]);
    const [sites, setSites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [fuelType, setFuelType] = useState('Petrol');
    const toast = useToast();

    const fetchData = async () => {
        setLoading(true);
        try {
            const [empRes, cliRes, siteRes] = await Promise.all([
                api.get('/employee-master'),
                api.get('/client-master'),
                api.get('/site-master')
            ]);
            if (empRes.data.success) setEmployees(empRes.data.data);
            if (cliRes.data.success) setClients(cliRes.data.data);
            if (siteRes.data.success) setSites(siteRes.data.data);
        } catch (error) {
            console.error("Failed to fetch data for Employee Expenses Module", error);
            toast({
                title: 'Error fetching data',
                description: error.message || 'Something went wrong',
                status: 'error',
                duration: 3000,
                position: 'top-right'
            });
        } finally {
            setLoading(false);
        }
    };

    const updateSingleEmployee = async () => {
        try {
            const empRes = await api.get('/employee-master');
            if (empRes.data.success) setEmployees(empRes.data.data);
        } catch (error) {
            console.error("Failed to refresh employees", error);
        }
    };

    useEffect(() => {
        if (canReadModule) {
            fetchData();
        }
    }, [canReadModule]);

    const tabs = useMemo(() => {
        const list = [];
        if (canReadTransfer) {
            list.push({
                key: 'transfer',
                label: 'Money Transfer',
                icon: FaExchangeAlt,
                component: <MoneyTransferSection 
                    employees={employees} 
                    onRefresh={fetchData} 
                    canWriteCreate={canWriteTransferCreate}
                    canReadView={canReadTransferView}
                    canWriteView={canWriteTransferView}
                    canReadAttendance={canReadTransferAttendance}
                    canWriteAttendance={canWriteTransferAttendance}
                    canReadCustomAccount={canReadTransferCustomAccount}
                    canWriteCustomAccount={canWriteTransferCustomAccount}
                />
            });
        }
        if (canReadDaily) {
            list.push({
                key: 'daily',
                label: 'Daily Expenses',
                icon: FaPlus,
                component: <DailyExpensesSection 
                    employees={employees} 
                    clients={clients} 
                    sites={sites} 
                    loading={loading}
                    onRefresh={fetchData} 
                    onUpdateEmployee={updateSingleEmployee}
                    canWrite={canWriteDaily}
                />
            });
        }
        if (canReadReport) {
            list.push({
                key: 'report',
                label: 'Daily Report',
                icon: FaChartBar,
                component: <DailyReportSection employees={employees} clients={clients} sites={sites} />
            });
        }
        return list;
    }, [
        canReadTransfer, canWriteTransferCreate, canReadTransferView, canWriteTransferView, 
        canReadTransferAttendance, canWriteTransferAttendance, canReadTransferCustomAccount, canWriteTransferCustomAccount,
        canReadDaily, canWriteDaily, canReadReport, employees, clients, sites, loading
    ]);

    if (!canReadModule) {
        return (
            <Box py={{ base: 4, md: 10 }} bg="gray.50" minH="100vh">
                <Container maxW="container.xl" px={{ base: 2, md: 4 }}>
                    <Center minH="40vh" bg="white" borderRadius="2xl" shadow="sm" p={8}>
                        <VStack spacing={4}>
                            <Icon as={FaUserSlash} w={12} h={12} color="red.400" />
                            <Text fontSize="lg" fontWeight="bold">Access Denied</Text>
                            <Text color="gray.500" textAlign="center">
                                You do not have permission to view the Employee Expenses module.
                            </Text>
                        </VStack>
                    </Center>
                </Container>
            </Box>
        );
    }

    return (
        <Box py={{ base: 4, md: 10 }} bg="gray.50" minH="100vh">
            <Container maxW="container.xl" px={{ base: 2, md: 4 }}>
                {!isInsideServices && <ModulePermissionBar moduleGroupKey="employeeExpenseGroup" />}
                <VStack spacing={{ base: 4, md: 8 }} align="stretch">
                    {/* Module Header */}
                    <Flex justify="space-between" align="center" bg="white" p={{ base: 4, md: 6 }} borderRadius="2xl" shadow="sm" border="1px solid" borderColor="gray.100" flexWrap="wrap" gap={3}>
                        <HStack spacing={{ base: 3, md: 4 }}>
                            <Box bg="blue.500" p={{ base: 2, md: 3 }} borderRadius="xl" color="white" flexShrink={0}>
                                <Icon as={FaMoneyBillWave} w={{ base: 5, md: 6 }} h={{ base: 5, md: 6 }} />
                            </Box>
                            <VStack align="start" spacing={0}>
                                <Heading size={{ base: 'md', md: 'lg' }}>Expenses Management</Heading>
                                <Text color="gray.500" fontSize={{ base: 'xs', md: 'sm' }}>Manage internal transfers and daily operational expenses.</Text>
                            </VStack>
                        </HStack>
                    </Flex>

                    {/* Navigation Tabs */}
                    {tabs.length === 0 ? (
                        <Box bg="white" p={10} borderRadius="2xl" textAlign="center" shadow="sm" border="1px solid" borderColor="gray.100">
                            <VStack spacing={3}>
                                <Icon as={FaUserSlash} w={10} h={10} color="orange.400" />
                                <Text fontSize="md" fontWeight="bold" color="gray.600">No Authorized Tabs Available</Text>
                                <Text fontSize="xs" color="gray.400">Please contact your administrator to grant access to the sub-sections of this module.</Text>
                            </VStack>
                        </Box>
                    ) : (
                        <Tabs variant="unstyled" defaultIndex={0} isLazy>
                            <Box overflowX="auto" pb={1}>
                                <TabList bg="white" p={1.5} borderRadius="2xl" shadow="sm" border="1px solid" borderColor="gray.100" display="inline-flex" minW="max-content">
                                    {tabs.map((t, idx) => (
                                        <Tab 
                                            key={t.key}
                                            _selected={{ bg: "blue.600", color: "white", shadow: "md" }} 
                                            borderRadius="xl" 
                                            px={{ base: 4, md: 8 }}
                                            py={{ base: 2, md: 3 }}
                                            fontWeight="bold" 
                                            color="gray.500"
                                            fontSize={{ base: 'sm', md: 'md' }}
                                            transition="all 0.3s"
                                            whiteSpace="nowrap"
                                        >
                                            <Icon as={t.icon} mr={{ base: 1, md: 2 }} /> {t.label}
                                        </Tab>
                                    ))}
                                </TabList>
                            </Box>

                            <TabPanels mt={8}>
                                {tabs.map((t, idx) => (
                                    <TabPanel key={t.key} p={0}>
                                        {t.component}
                                    </TabPanel>
                                ))}
                            </TabPanels>
                        </Tabs>
                    )}
                </VStack>
            </Container>
        </Box>
    );
};

// ── Daily Report Section ──────────────────────────────────────────────
const _getCurrFY = () => { const t = new Date(); return t.getMonth() < 3 ? t.getFullYear()-1 : t.getFullYear(); };

const DailyReportSection = ({ employees = [], clients = [], sites = [] }) => {
    const { user } = useAuth();
    const canReadLast5Days = hasPermission(user, 'employeeExpense_report_last5days', 'read');
    const canReadAdvanced = hasPermission(user, 'employeeExpense_report_advanced', 'read');

    const [data, setData]               = useState([]);
    const [allSchedules, setAllSchedules] = useState([]);
    const [allExpenses, setAllExpenses]   = useState([]);
    const [summaryLoading, setSummaryLoading] = useState(true);
    const [lastRefreshed, setLastRefreshed]   = useState(null);
    const [selectedDetailEntry, setSelectedDetailEntry] = useState(null);
    const { isOpen: isDetailOpen, onOpen: onDetailOpen, onClose: onDetailClose } = useDisclosure();

    // ── Monthly Stats & Live Data for Selected Employee Modal ──────────────────
    const [monthStats, setMonthStats] = useState({ credit: 0, debit: 0, expense: 0, currentBalance: 0, loading: false });
    const [selectedDetailExpenses, setSelectedDetailExpenses] = useState([]);
    const [selectedDetailTransfers, setSelectedDetailTransfers] = useState([]);

    const getFileHref = (file) => {
        if (!file) return '#';
        const raw = typeof file === 'string' ? file : (file.url || file.path || file.name || '');
        if (!raw) return '#';
        if (raw.startsWith('http://') || raw.startsWith('https://') || raw.startsWith('blob:') || raw.startsWith('data:')) {
            return raw;
        }
        const cleanPath = raw.startsWith('/') ? raw : '/' + raw;
        const base = api.defaults.baseURL || '';
        if (base.endsWith('/api') && cleanPath.startsWith('/api/')) {
            return cleanPath;
        }
        return `${base}${cleanPath}`;
    };

    const getFileName = (file, defaultName = 'File') => {
        if (!file) return defaultName;
        if (typeof file === 'string') {
            const parts = file.split(/[/\\]/);
            return parts[parts.length - 1] || defaultName;
        }
        return file.name || file.filename || file.originalName || defaultName;
    };

    useEffect(() => {
        if (!selectedDetailEntry) return;

        let isMounted = true;
        const fetchMonthTotals = async () => {
            setMonthStats(prev => ({ ...prev, loading: true }));
            try {
                // Find matching employee object
                const empObj = employees.find(e => 
                    String(e._id) === String(selectedDetailEntry.empId) || 
                    String(e.empId) === String(selectedDetailEntry.empId) || 
                    (e.name && e.name.trim().toLowerCase() === (selectedDetailEntry.empName || '').trim().toLowerCase())
                );
                const empObjectId = empObj ? empObj._id : selectedDetailEntry.empId;

                const [expRes, trRes, empRes] = await Promise.all([
                    api.get(`/employee-expense/admin/${empObjectId}`).catch(() => ({ data: { success: false } })),
                    api.get(`/employee-transfer`).catch(() => ({ data: { success: false } })),
                    empObj ? Promise.resolve({ data: { success: true, data: empObj } }) : api.get(`/employee-master/${empObjectId}`).catch(() => ({ data: { success: false } }))
                ]);

                const entryDt = new Date(selectedDetailEntry.date || new Date());
                const curM = entryDt.getMonth();
                const curY = entryDt.getFullYear();

                let mDebit = 0;
                let mCredit = 0;
                let mExpense = 0;

                if (expRes.data?.success && Array.isArray(expRes.data.data)) {
                    expRes.data.data.forEach(exp => {
                        const ed = new Date(exp.date);
                        if (ed.getMonth() === curM && ed.getFullYear() === curY) {
                            const expAmt = Number(exp.totalExpense) || 0;
                            mExpense += expAmt;
                            mDebit += expAmt;
                            (exp.creditDebit?.givenTo || []).forEach(g => { mDebit += (Number(g.amount) || 0); });
                            (exp.creditDebit?.receivedFrom || []).forEach(r => { mCredit += (Number(r.amount) || 0); });
                        }
                    });
                }

                if (trRes.data?.success && Array.isArray(trRes.data.data)) {
                    trRes.data.data.forEach(tr => {
                        const td = new Date(tr.date);
                        if (td.getMonth() === curM && td.getFullYear() === curY) {
                            const gId = String(tr.giver?._id || tr.giver);
                            const tId = String(tr.taker?._id || tr.taker);
                            const eIdStr = String(empObjectId);
                            if (gId === eIdStr) mDebit += (Number(tr.amount) || 0);
                            if (tId === eIdStr) mCredit += (Number(tr.amount) || 0);
                        }
                    });
                }

                const curBal = empRes.data?.data?.totalAmount || empObj?.totalAmount || 0;

                if (isMounted) {
                    setMonthStats({ credit: mCredit, debit: mDebit, expense: mExpense, currentBalance: curBal, loading: false });
                    if (expRes.data?.success && Array.isArray(expRes.data.data)) {
                        setSelectedDetailExpenses(expRes.data.data);
                    }
                    if (trRes.data?.success && Array.isArray(trRes.data.data)) {
                        setSelectedDetailTransfers(trRes.data.data);
                    }
                }
            } catch (err) {
                if (isMounted) setMonthStats(prev => ({ ...prev, loading: false }));
            }
        };

        fetchMonthTotals();
        return () => { isMounted = false; };
    }, [selectedDetailEntry, employees]);

    // ── Custom report state ──────────────────────────────────────
    const _today = new Date();
    const [reportType, setReportType]                     = useState('Ledger');
    const [selectedExpEmp, setSelectedExpEmp]             = useState({ id: '', name: '' });
    const [selectedFY, setSelectedFY]                     = useState('');
    const [selectedMonth, setSelectedMonth]               = useState('');
    const [fyPageStart, setFyPageStart]                   = useState(_getCurrFY());
    const [globalStartDate, setGlobalStartDate]           = useState(
        new Date(_today.getFullYear(), _today.getMonth(), 1).toISOString().split('T')[0]
    );
    const [globalEndDate, setGlobalEndDate]               = useState(
        _today.toISOString().split('T')[0]
    );
    const _todayStr = _today.toISOString().split('T')[0];
    const isAllEmp = ['Food','Fuel','ClientSite'].includes(reportType);

    const toLocalDateKey = (d) => {
        if (!d) return '';
        if (typeof d === 'string') {
            if (d.includes('T') || d.includes('Z')) {
                const dt = new Date(d);
                if (!isNaN(dt.getTime())) {
                    const y = dt.getFullYear();
                    const m = String(dt.getMonth() + 1).padStart(2, '0');
                    const day = String(dt.getDate()).padStart(2, '0');
                    return `${y}-${m}-${day}`;
                }
            }
            const clean = d.split('T')[0];
            if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) return clean;
        }
        const dt = new Date(d);
        if (isNaN(dt.getTime())) return String(d).split('T')[0];
        const y = dt.getFullYear();
        const m = String(dt.getMonth() + 1).padStart(2, '0');
        const day = String(dt.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    };

    const fmtDate = (d) => {
        if (!d) return '—';
        if (typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d)) {
            const [y, m, day] = d.split('-').map(Number);
            const dt = new Date(y, m - 1, day);
            return dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', weekday: 'short' });
        }
        const dt = new Date(d);
        if (isNaN(dt.getTime())) return String(d);
        return dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', weekday: 'short' });
    };
    const fmtAmt  = (n) => `₹${Number(n||0).toLocaleString('en-IN')}`;

    const attStyle = (s) => ({
        Present: { bg:'#f0fdf4', color:'#15803d', label:'✓ Present' },
        Absent:  { bg:'#fef2f2', color:'#dc2626', label:'✗ Absent'  },
        Leave:   { bg:'#fff7ed', color:'#c2410c', label:'◷ Leave'   },
    }[s] || { bg:'#f8fafc', color:'#94a3b8', label: s || '—' });

    const fetchSummary = async () => {
        if (!canReadLast5Days) return;
        setSummaryLoading(true);
        try {
            const [res, schRes, allExpRes] = await Promise.all([
                api.get('/employee-expense/report/daily-summary'),
                api.get('/schedule-master').catch(() => ({ data: { success: false } })),
                api.get('/employee-expense/all').catch(() => ({ data: { success: false } }))
            ]);
            if (res.data?.success) { 
                setData(res.data.data); 
                setLastRefreshed(new Date()); 
            }
            if (schRes?.data?.success && Array.isArray(schRes.data.data)) {
                setAllSchedules(schRes.data.data);
            }
            if (allExpRes?.data?.success && Array.isArray(allExpRes.data.data)) {
                setAllExpenses(allExpRes.data.data);
            }
        } catch (e) { console.error(e); }
        finally { setSummaryLoading(false); }
    };
    useEffect(() => { fetchSummary(); }, [canReadLast5Days]);

    const fmtMonthFn = (d) => { const y=d.getFullYear(), m=String(d.getMonth()+1).padStart(2,'0'), dd=String(d.getDate()).padStart(2,'0'); return `${y}-${m}-${dd}`; };

    const resolveClientName = (val) => {
        if (!val) return '';
        if (typeof val === 'object') {
            return val.clientName || val.name || resolveClientName(val._id || val.clientId);
        }
        const str = String(val).trim();
        const found = clients.find(c => String(c._id) === str || c.clientName === str);
        return found ? found.clientName : str;
    };

    const resolveSiteName = (val) => {
        if (!val) return '';
        if (typeof val === 'object') {
            return val.siteName || val.name || resolveSiteName(val._id || val.siteId);
        }
        const str = String(val).trim();
        const found = sites.find(s => String(s._id) === str || s.siteName === str);
        return found ? found.siteName : str;
    };

    const resolveEmployeeName = (val) => {
        if (!val) return '';
        if (typeof val === 'object') {
            return val.name || val.employeeName || resolveEmployeeName(val._id || val.employeeId);
        }
        const str = String(val).trim();
        const found = employees.find(e => String(e._id) === str || e.name === str);
        return found ? found.name : str;
    };

    const isSameEmployee = (valA, valB, empNameA, empNameB) => {
        const strA = String(valA || '').trim();
        const strB = String(valB || '').trim();
        const nameA = (empNameA || '').trim().toLowerCase();
        const nameB = (empNameB || '').trim().toLowerCase();

        if (strA && strB && strA === strB) return true;
        if (nameA && nameB && nameA === nameB) return true;

        const foundA = employees.find(e => String(e._id) === strA || String(e.empId) === strA || (e.name && e.name.trim().toLowerCase() === nameA));
        const foundB = employees.find(e => String(e._id) === strB || String(e.empId) === strB || (e.name && e.name.trim().toLowerCase() === nameB));

        if (foundA && foundB && String(foundA._id) === String(foundB._id)) return true;
        if (foundA && (String(foundA._id) === strB || String(foundA.empId) === strB || (foundA.name && foundA.name.trim().toLowerCase() === nameB))) return true;
        if (foundB && (String(foundB._id) === strA || String(foundB.empId) === strA || (foundB.name && foundB.name.trim().toLowerCase() === nameA))) return true;

        return false;
    };

    const getSchedulesWhereOperative = (entry) => {
        if (!allSchedules || allSchedules.length === 0) return [];
        const entryDateKey = toLocalDateKey(entry.date);

        return allSchedules.filter(s => {
            const sDateKey = toLocalDateKey(s.scheduleDate || s.date);
            if (sDateKey !== entryDateKey) return false;

            const opId = s.operative?._id || s.operative;
            const opName = s.operative?.name || (typeof s.operative === 'string' ? s.operative : '');
            return isSameEmployee(entry.empId, opId, entry.empName, opName);
        });
    };

    const getSchedulesWhereHelper = (entry) => {
        if (!allSchedules || allSchedules.length === 0) return [];
        const entryDateKey = toLocalDateKey(entry.date);

        return allSchedules.filter(s => {
            const sDateKey = toLocalDateKey(s.scheduleDate || s.date);
            if (sDateKey !== entryDateKey) return false;

            if (Array.isArray(s.helpers)) {
                return s.helpers.some(h => {
                    const hId = h?._id || h;
                    const hName = h?.name || (typeof h === 'string' ? h : '');
                    return isSameEmployee(entry.empId, hId, entry.empName, hName);
                });
            } else if (s.helper) {
                const hId = s.helper?._id || s.helper;
                const hName = s.helper?.name || (typeof s.helper === 'string' ? s.helper : '');
                return isSameEmployee(entry.empId, hId, entry.empName, hName);
            }
            return false;
        });
    };

    const extractOperative = (entry) => {
        const loc = (entry.workLocation || entry.details?.workLocation || '').trim();
        if (['Room', 'Godown', 'Office', 'Home'].includes(loc)) {
            return entry.empName || '—';
        }

        const opSchedules = getSchedulesWhereOperative(entry);
        if (opSchedules.length > 0) {
            return resolveEmployeeName(opSchedules[0].operative?._id || opSchedules[0].operative) || entry.empName || '—';
        }

        const hlpSchedules = getSchedulesWhereHelper(entry);
        if (hlpSchedules.length > 0) {
            return resolveEmployeeName(hlpSchedules[0].operative?._id || hlpSchedules[0].operative) || entry.empName || '—';
        }

        if (entry.operativeName && !/^[0-9a-fA-F]{24}$/.test(entry.operativeName.trim()) && entry.operativeName !== '—') {
            return entry.operativeName;
        }
        if (entry.operative?.name) return entry.operative.name;
        if (entry.operative && typeof entry.operative === 'string' && !/^[0-9a-fA-F]{24}$/.test(entry.operative) && entry.operative !== '—') {
            return entry.operative;
        }

        return entry.empName || '—';
    };

    const extractHelpers = (entry) => {
        const loc = (entry.workLocation || entry.details?.workLocation || '').trim();
        if (['Room', 'Godown', 'Office', 'Home'].includes(loc)) {
            return '';
        }

        let list = [];

        const opSchedules = getSchedulesWhereOperative(entry);
        opSchedules.forEach(s => {
            if (Array.isArray(s.helpers)) {
                s.helpers.forEach(h => list.push(resolveEmployeeName(h)));
            } else if (s.helper) {
                list.push(resolveEmployeeName(s.helper));
            }
        });

        const hlpSchedules = getSchedulesWhereHelper(entry);
        hlpSchedules.forEach(s => {
            if (Array.isArray(s.helpers)) {
                s.helpers.forEach(h => list.push(resolveEmployeeName(h)));
            } else if (s.helper) {
                list.push(resolveEmployeeName(s.helper));
            }
        });

        if (Array.isArray(entry.helpers) && entry.helpers.length > 0) {
            entry.helpers.forEach(h => list.push(resolveEmployeeName(h)));
        } else if (typeof entry.helpers === 'string' && entry.helpers.trim()) {
            list.push(resolveEmployeeName(entry.helpers));
        } else if (Array.isArray(entry.helperNames) && entry.helperNames.length > 0) {
            entry.helperNames.forEach(h => list.push(resolveEmployeeName(h)));
        } else if (Array.isArray(entry.details?.helpers) && entry.details.helpers.length > 0) {
            entry.details.helpers.forEach(h => list.push(resolveEmployeeName(h)));
        }

        if (Array.isArray(entry.clientSites)) {
            entry.clientSites.forEach(cs => {
                if (Array.isArray(cs.helpers)) {
                    cs.helpers.forEach(h => list.push(resolveEmployeeName(h)));
                } else if (cs.helper) {
                    list.push(resolveEmployeeName(cs.helper));
                }
            });
        }

        const opName = extractOperative(entry);
        const unique = [...new Set(list.filter(Boolean))].filter(h => 
            h.trim().toLowerCase() !== (opName || '').trim().toLowerCase()
        );
        return unique.join(', ');
    };

    const extractClient = (entry) => {
        const loc = (entry.workLocation || entry.details?.workLocation || '').trim();
        if (['Room', 'Godown', 'Office', 'Home'].includes(loc)) {
            return 'Office';
        }

        let clientsFound = [];

        const opSchedules = getSchedulesWhereOperative(entry);
        opSchedules.forEach(s => {
            const cName = s.client?.clientName || resolveClientName(s.client?._id || s.client);
            if (cName) clientsFound.push(cName);
        });

        const hlpSchedules = getSchedulesWhereHelper(entry);
        hlpSchedules.forEach(s => {
            const cName = s.client?.clientName || resolveClientName(s.client?._id || s.client);
            if (cName) clientsFound.push(cName);
        });

        if (Array.isArray(entry.clientSites) && entry.clientSites.length > 0) {
            entry.clientSites.forEach(cs => {
                if (cs.clientName) clientsFound.push(cs.clientName);
                else if (cs.clientId?.clientName) clientsFound.push(cs.clientId.clientName);
                else {
                    const cid = cs.clientId?._id || cs.clientId;
                    if (cid) clientsFound.push(resolveClientName(cid));
                }
            });
        }

        if (entry.clientNames && !/^[0-9a-fA-F]{24}$/.test(entry.clientNames.trim())) {
            clientsFound.push(entry.clientNames);
        } else if (entry.clientName && !/^[0-9a-fA-F]{24}$/.test(entry.clientName.trim())) {
            clientsFound.push(entry.clientName);
        }

        if (entry.clientId) clientsFound.push(resolveClientName(entry.clientId));
        if (entry.client) clientsFound.push(resolveClientName(entry.client));
        if (entry.details?.clientName) clientsFound.push(entry.details.clientName);

        const unique = [...new Set(clientsFound.filter(c => c && !/^[0-9a-fA-F]{24}$/.test(c.trim())))];
        if (unique.length > 0) return unique.join(', ');

        if (['Room', 'Godown', 'Office', 'Home'].some(k => (entry.siteNames || '').includes(k))) {
            return 'Office';
        }

        return '';
    };

    const extractSite = (entry) => {
        const loc = (entry.workLocation || entry.details?.workLocation || '').trim();
        if (['Room', 'Godown', 'Office', 'Home'].includes(loc)) {
            return loc;
        }

        let sitesFound = [];

        const opSchedules = getSchedulesWhereOperative(entry);
        opSchedules.forEach(s => {
            const sName = s.site?.siteName || resolveSiteName(s.site?._id || s.site);
            if (sName) sitesFound.push(sName);
        });

        const hlpSchedules = getSchedulesWhereHelper(entry);
        hlpSchedules.forEach(s => {
            const sName = s.site?.siteName || resolveSiteName(s.site?._id || s.site);
            if (sName) sitesFound.push(sName);
        });

        if (Array.isArray(entry.clientSites) && entry.clientSites.length > 0) {
            entry.clientSites.forEach(cs => {
                if (cs.siteName) sitesFound.push(cs.siteName);
                else if (cs.siteId?.siteName) sitesFound.push(cs.siteId.siteName);
                else {
                    const sid = cs.siteId?._id || cs.siteId;
                    if (sid) sitesFound.push(resolveSiteName(sid));
                }
            });
        }

        if (entry.siteNames && !/^[0-9a-fA-F]{24}$/.test(entry.siteNames.trim())) {
            sitesFound.push(entry.siteNames);
        } else if (entry.siteName && !/^[0-9a-fA-F]{24}$/.test(entry.siteName.trim())) {
            sitesFound.push(entry.siteName);
        }

        if (entry.siteId) sitesFound.push(resolveSiteName(entry.siteId));
        if (entry.site) sitesFound.push(resolveSiteName(entry.site));
        if (entry.details?.siteName) sitesFound.push(entry.details.siteName);
        if (entry.details?.siteNames) sitesFound.push(entry.details.siteNames);

        if (sitesFound.filter(Boolean).length === 0 && entry.workLocation) {
            return entry.workLocation;
        }

        const unique = [...new Set(sitesFound.filter(s => s && !/^[0-9a-fA-F]{24}$/.test(s.trim())))];
        if (unique.length > 0) return unique.join(', ');

        return loc || entry.siteNames || '';
    };

    const extractHasReport = (entry) => {
        if (entry.hasReport === true || entry.hasDailyReport === true || entry.hasExpenseReport === true) return true;
        if (entry.dailyReportsCount > 0 || entry.reportCount > 0 || entry.reportsCount > 0) return true;
        if (Array.isArray(entry.dailyReports) && entry.dailyReports.length > 0) return true;
        if (Array.isArray(entry.reports) && entry.reports.length > 0) return true;
        if (Array.isArray(entry.files?.dailyReports) && entry.files.dailyReports.length > 0) return true;
        if (Array.isArray(entry.files?.reports) && entry.files.reports.length > 0) return true;
        if (Array.isArray(entry.details?.files?.dailyReports) && entry.details.files.dailyReports.length > 0) return true;
        if (Array.isArray(entry.details?.dailyReports) && entry.details.dailyReports.length > 0) return true;
        if (Array.isArray(entry.details?.reports) && entry.details.reports.length > 0) return true;

        if (Array.isArray(entry.clientSites)) {
            const hasCsReport = entry.clientSites.some(cs => 
                (Array.isArray(cs.files?.dailyReports) && cs.files.dailyReports.length > 0) ||
                (Array.isArray(cs.files?.reports) && cs.files.reports.length > 0) ||
                (Array.isArray(cs.dailyReports) && cs.dailyReports.length > 0) ||
                (Array.isArray(cs.reports) && cs.reports.length > 0) ||
                cs.hasReport === true ||
                cs.hasDailyReport === true
            );
            if (hasCsReport) return true;
        }

        if (entry.details?.otherExpensesList?.some(oe => Array.isArray(oe.files) && oe.files.length > 0)) return true;

        const entryDateKey = toLocalDateKey(entry.date);
        const empIdStr = String(entry.empId || entry.employeeId || entry.employee || '').trim();
        const empNameStr = (entry.empName || '').trim().toLowerCase();

        // Check allExpenses for this employee and date
        if (Array.isArray(allExpenses) && allExpenses.length > 0) {
            const matchedExps = allExpenses.filter(exp => {
                const expDateKey = toLocalDateKey(exp.date);
                if (expDateKey !== entryDateKey) return false;
                const expEmpId = exp.employee?._id || exp.employee || exp.employeeId || '';
                const expEmpName = exp.employee?.name || exp.employeeName || (typeof exp.employee === 'string' && !/^[0-9a-fA-F]{24}$/.test(exp.employee) ? exp.employee : '');
                return isSameEmployee(entry.empId, expEmpId, entry.empName, expEmpName);
            });

            for (const exp of matchedExps) {
                if (exp.hasReport || exp.hasDailyReport || exp.hasExpenseReport) return true;
                if (Array.isArray(exp.dailyReports) && exp.dailyReports.length > 0) return true;
                if (Array.isArray(exp.reports) && exp.reports.length > 0) return true;
                if (Array.isArray(exp.files?.dailyReports) && exp.files.dailyReports.length > 0) return true;
                if (Array.isArray(exp.files?.reports) && exp.files.reports.length > 0) return true;
                if (Array.isArray(exp.clientSites)) {
                    const csHasRep = exp.clientSites.some(cs => 
                        (Array.isArray(cs.files?.dailyReports) && cs.files.dailyReports.length > 0) ||
                        (Array.isArray(cs.files?.reports) && cs.files.reports.length > 0) ||
                        (Array.isArray(cs.dailyReports) && cs.dailyReports.length > 0) ||
                        (Array.isArray(cs.reports) && cs.reports.length > 0) ||
                        (cs.files && Object.keys(cs.files).some(k => k.toLowerCase().includes('report') && cs.files[k]?.length > 0)) ||
                        cs.hasReport === true ||
                        cs.hasDailyReport === true
                    );
                    if (csHasRep) return true;
                }
            }
        }

        // Check schedule-master schedules for this operative and date
        const opSchedules = getSchedulesWhereOperative(entry);
        for (const s of opSchedules) {
            if (s.hasReport || s.hasDailyReport) return true;
            if (Array.isArray(s.files?.dailyReports) && s.files.dailyReports.length > 0) return true;
            if (Array.isArray(s.files?.reports) && s.files.reports.length > 0) return true;
            if (Array.isArray(s.dailyReports) && s.dailyReports.length > 0) return true;
            if (Array.isArray(s.reports) && s.reports.length > 0) return true;
            if (Array.isArray(s.documents)) {
                const hasDoc = s.documents.some(d => 
                    (typeof d === 'string' && (d.includes('Daily_report') || d.includes('dailyReport') || d.toLowerCase().includes('report'))) ||
                    (d && (d.category === 'Daily Report' || d.category === 'dailyReports' || d.url?.includes('Daily_report') || d.url?.includes('dailyReport') || d.name?.toLowerCase().includes('report')))
                );
                if (hasDoc) return true;
            }
        }

        return false;
    };

    const extractHasData = (entry) => {
        if (entry.hasDataFile === true || entry.hasData === true) return true;
        if (entry.dataFilesCount > 0 || entry.dataCount > 0 || entry.dataFileCount > 0) return true;
        if (Array.isArray(entry.dataFiles) && entry.dataFiles.length > 0) return true;
        if (Array.isArray(entry.data) && entry.data.length > 0) return true;
        if (Array.isArray(entry.files?.data) && entry.files.data.length > 0) return true;
        if (Array.isArray(entry.details?.files?.data) && entry.details.files.data.length > 0) return true;
        if (Array.isArray(entry.details?.dataFiles) && entry.details.dataFiles.length > 0) return true;
        if (Array.isArray(entry.details?.data) && entry.details.data.length > 0) return true;

        if (Array.isArray(entry.clientSites)) {
            const hasCsData = entry.clientSites.some(cs => 
                (Array.isArray(cs.files?.data) && cs.files.data.length > 0) ||
                (Array.isArray(cs.dataFiles) && cs.dataFiles.length > 0) ||
                (Array.isArray(cs.data) && cs.data.length > 0) ||
                cs.hasDataFile === true ||
                cs.hasData === true
            );
            if (hasCsData) return true;
        }

        const entryDateKey = toLocalDateKey(entry.date);

        // Check allExpenses for this employee and date
        if (Array.isArray(allExpenses) && allExpenses.length > 0) {
            const matchedExps = allExpenses.filter(exp => {
                const expDateKey = toLocalDateKey(exp.date);
                if (expDateKey !== entryDateKey) return false;
                const expEmpId = exp.employee?._id || exp.employee || exp.employeeId || '';
                const expEmpName = exp.employee?.name || exp.employeeName || (typeof exp.employee === 'string' && !/^[0-9a-fA-F]{24}$/.test(exp.employee) ? exp.employee : '');
                return isSameEmployee(entry.empId, expEmpId, entry.empName, expEmpName);
            });

            for (const exp of matchedExps) {
                if (exp.hasDataFile || exp.hasData) return true;
                if (Array.isArray(exp.dataFiles) && exp.dataFiles.length > 0) return true;
                if (Array.isArray(exp.data) && exp.data.length > 0) return true;
                if (Array.isArray(exp.files?.data) && exp.files.data.length > 0) return true;
                if (Array.isArray(exp.clientSites)) {
                    const csHasDat = exp.clientSites.some(cs => 
                        (Array.isArray(cs.files?.data) && cs.files.data.length > 0) ||
                        (Array.isArray(cs.dataFiles) && cs.dataFiles.length > 0) ||
                        (Array.isArray(cs.data) && cs.data.length > 0) ||
                        cs.hasDataFile === true ||
                        cs.hasData === true
                    );
                    if (csHasDat) return true;
                }
            }
        }

        // Check schedule-master schedules for this operative and date
        const opSchedules = getSchedulesWhereOperative(entry);
        for (const s of opSchedules) {
            if (s.hasDataFile || s.hasData) return true;
            if (Array.isArray(s.files?.data) && s.files.data.length > 0) return true;
            if (Array.isArray(s.dataFiles) && s.dataFiles.length > 0) return true;
            if (Array.isArray(s.data) && s.data.length > 0) return true;
            if (Array.isArray(s.documents)) {
                const hasDoc = s.documents.some(d => 
                    (typeof d === 'string' && (d.includes('/Data/') || d.toLowerCase().includes('data'))) ||
                    (d && (d.category === 'Data' || d.category === 'dataFiles' || d.url?.includes('/Data/') || d.name?.toLowerCase().includes('data')))
                );
                if (hasDoc) return true;
            }
        }

        return false;
    };

    const hasExpensesApplied = (entry) => {
        const d = entry.details || {};
        const hasFixed = (Number(d.breakfast) || 0) > 0 || 
                         (Number(d.lunch) || 0) > 0 || 
                         (Number(d.dinner) || 0) > 0 || 
                         (Number(d.petrol) || 0) > 0;
        if (hasFixed) return true;

        const hasOther = Array.isArray(d.otherExpensesList) && d.otherExpensesList.some(oe => (Number(oe.amount) || 0) > 0);
        if (hasOther) return true;

        if (extractHasReport(entry) || extractHasData(entry)) return true;

        if ((Number(entry.totalDebit) || 0) > 0 || (Number(entry.totalCredit) || 0) > 0 || (Number(entry.totalExpense) || 0) > 0) {
            return true;
        }

        const loc = (entry.workLocation || entry.details?.workLocation || '').trim();
        const inHouseKeywords = ['Room', 'Godown', 'Office', 'Home'];

        // If in-house location (Room, Godown, Office, Home)
        if (inHouseKeywords.includes(loc) || inHouseKeywords.some(k => (entry.siteNames || '').includes(k))) {
            return true;
        }

        // If employee is the operative on any schedule today, show their site row!
        const opSchedules = getSchedulesWhereOperative(entry);
        if (opSchedules.length > 0) {
            return true;
        }

        // If employee is ONLY a helper on a schedule today (and has no debit, credit, expenses, or reports),
        // they are already displayed inside the helper column of the Operative's schedule row.
        // Do NOT create a duplicate standalone row for them.
        const hlpSchedules = getSchedulesWhereHelper(entry);
        if (hlpSchedules.length > 0) {
            return false;
        }

        // If employee explicitly submitted clientSites
        if (Array.isArray(entry.clientSites) && entry.clientSites.length > 0 && entry.clientSites.some(cs => cs.clientId && cs.siteId)) {
            return true;
        }

        // If attendance is Present and employee has location / site / details
        if (entry.attendance === 'Present' && (loc || entry.siteNames)) {
            return true;
        }

        return false;
    };

    return (
        <VStack spacing={8} align="stretch">

            {/* ════════ SECTION 1 — Last 5 Days ════════ */}
            {canReadLast5Days && (
                <Box>
                    <Flex justify="space-between" align="center" mb={4} flexWrap="wrap" gap={3}>
                        <VStack align="start" spacing={0}>
                            <Heading size="sm" color="gray.800" fontWeight="800">⚡ Last 5 Days — All Employees</Heading>
                            <Text fontSize="xs" color="gray.400">
                                Auto-loaded · Dates ascending
                                {lastRefreshed && ` · ${lastRefreshed.toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'})}`}
                            </Text>
                        </VStack>
                        <Button size="sm" leftIcon={<Icon as={FaClipboardList}/>} colorScheme="blue" variant="outline" borderRadius="lg" onClick={fetchSummary} isLoading={summaryLoading}>
                            Refresh
                        </Button>
                    </Flex>

                    {summaryLoading ? (
                        <Center py={16}><Spinner size="lg" color="blue.400" thickness="3px" /></Center>
                    ) : !data.length ? (
                        <Center py={14}>
                            <VStack spacing={2}>
                                <Icon as={FaChartBar} w={9} h={9} color="gray.200"/>
                                <Text color="gray.400" fontSize="sm">No entries found in last 5 days</Text>
                            </VStack>
                        </Center>
                    ) : (
                        <VStack spacing={4} align="stretch">
                            {(() => {
                                const datesMap = {};
                                data.forEach((emp) => {
                                    // 1. Group emp.entries by date
                                    const empEntriesByDate = {};
                                    (emp.entries || []).forEach(e => {
                                        const dk = toLocalDateKey(e.date);
                                        if (!empEntriesByDate[dk]) {
                                            empEntriesByDate[dk] = { 
                                                ...e,
                                                empId: emp.empId,
                                                empName: emp.empName,
                                                totalDebit: Number(e.totalDebit) || 0,
                                                totalCredit: Number(e.totalCredit) || 0,
                                                clientSites: Array.isArray(e.clientSites) ? [...e.clientSites] : [],
                                                files: e.files ? { ...e.files } : {},
                                                details: e.details ? { ...e.details } : {},
                                                hasReport: e.hasReport || false,
                                                hasDataFile: e.hasDataFile || false
                                            };
                                        } else {
                                            empEntriesByDate[dk].totalDebit += (Number(e.totalDebit) || 0);
                                            empEntriesByDate[dk].totalCredit += (Number(e.totalCredit) || 0);
                                            if ((!empEntriesByDate[dk].attendance || empEntriesByDate[dk].attendance === '-') && e.attendance && e.attendance !== '-') {
                                                empEntriesByDate[dk].attendance = e.attendance;
                                            }
                                            if (!empEntriesByDate[dk].workLocation && (e.workLocation || e.details?.workLocation)) {
                                                empEntriesByDate[dk].workLocation = e.workLocation || e.details?.workLocation;
                                            }
                                            if (Array.isArray(e.clientSites)) {
                                                empEntriesByDate[dk].clientSites = [...empEntriesByDate[dk].clientSites, ...e.clientSites];
                                            }
                                            if (e.files) {
                                                empEntriesByDate[dk].files = { ...empEntriesByDate[dk].files, ...e.files };
                                            }
                                            if (e.hasReport || e.hasDailyReport || e.hasExpenseReport) {
                                                empEntriesByDate[dk].hasReport = true;
                                            }
                                            if (e.hasDataFile || e.hasData) {
                                                empEntriesByDate[dk].hasDataFile = true;
                                            }
                                        }
                                    });

                                    const activeDates = new Set(Object.keys(empEntriesByDate));
                                    (allSchedules || []).forEach(s => {
                                        const sDk = toLocalDateKey(s.scheduleDate || s.date);
                                        if (!sDk) return;
                                        const sOpId = s.operative?._id || s.operative;
                                        const sOpName = s.operative?.name || (typeof s.operative === 'string' ? s.operative : '');
                                        if (isSameEmployee(emp.empId, sOpId, emp.empName, sOpName)) {
                                            activeDates.add(sDk);
                                        }
                                    });

                                    activeDates.forEach(dk => {
                                        const dayEntry = empEntriesByDate[dk] || {
                                            empId: emp.empId,
                                            empName: emp.empName,
                                            date: dk,
                                            totalDebit: 0,
                                            totalCredit: 0,
                                            attendance: 'Present',
                                            details: {},
                                            files: {},
                                            clientSites: []
                                        };

                                        const opSchedules = (allSchedules || []).filter(s => {
                                            const sDateKey = toLocalDateKey(s.scheduleDate || s.date);
                                            if (sDateKey !== dk) return false;
                                            const opId = s.operative?._id || s.operative;
                                            const opName = s.operative?.name || (typeof s.operative === 'string' ? s.operative : '');
                                            return isSameEmployee(emp.empId, opId, emp.empName, opName);
                                        });

                                        const hlpSchedules = (allSchedules || []).filter(s => {
                                            const sDateKey = toLocalDateKey(s.scheduleDate || s.date);
                                            if (sDateKey !== dk) return false;
                                            if (Array.isArray(s.helpers)) {
                                                return s.helpers.some(h => isSameEmployee(emp.empId, h?._id || h, emp.empName, h?.name || (typeof h === 'string' ? h : '')));
                                            } else if (s.helper) {
                                                return isSameEmployee(emp.empId, s.helper?._id || s.helper, emp.empName, s.helper?.name || (typeof s.helper === 'string' ? s.helper : ''));
                                            }
                                            return false;
                                        });

                                        const assignments = [];

                                        if (opSchedules.length > 0) {
                                            opSchedules.forEach((s) => {
                                                const sClientName = s.client?.clientName || resolveClientName(s.client?._id || s.client) || '—';
                                                const sSiteName = s.site?.siteName || resolveSiteName(s.site?._id || s.site) || '—';

                                                let sHelperNames = [];
                                                if (Array.isArray(s.helpers)) {
                                                    s.helpers.forEach(h => sHelperNames.push(resolveEmployeeName(h)));
                                                } else if (s.helper) {
                                                    sHelperNames.push(resolveEmployeeName(s.helper));
                                                }
                                                const cleanHelpers = [...new Set(sHelperNames.filter(Boolean))].filter(h => h.toLowerCase() !== emp.empName.toLowerCase()).join(', ');

                                                const sHasRep = s.hasReport || s.hasDailyReport || (Array.isArray(s.files?.dailyReports) && s.files.dailyReports.length > 0) || (Array.isArray(s.dailyReports) && s.dailyReports.length > 0) || (Array.isArray(s.documents) && s.documents.some(d => (typeof d === 'string' && d.toLowerCase().includes('report')) || d?.category === 'Daily Report')) || extractHasReport(dayEntry);
                                                const sHasDat = s.hasDataFile || s.hasData || (Array.isArray(s.files?.data) && s.files.data.length > 0) || (Array.isArray(s.dataFiles) && s.dataFiles.length > 0) || (Array.isArray(s.documents) && s.documents.some(d => (typeof d === 'string' && d.toLowerCase().includes('data')) || d?.category === 'Data')) || extractHasData(dayEntry);

                                                assignments.push({
                                                    client: sClientName,
                                                    site: sSiteName,
                                                    helpers: cleanHelpers,
                                                    hasReport: sHasRep,
                                                    hasDataFile: sHasDat,
                                                    schedule: s
                                                });
                                            });
                                        } else if (hlpSchedules.length > 0) {
                                            if (hasExpensesApplied(dayEntry)) {
                                                hlpSchedules.forEach((s) => {
                                                    const sClientName = s.client?.clientName || resolveClientName(s.client?._id || s.client) || '—';
                                                    const sSiteName = s.site?.siteName || resolveSiteName(s.site?._id || s.site) || '—';
                                                    const sOpName = s.operative?.name || resolveEmployeeName(s.operative?._id || s.operative) || '—';

                                                    assignments.push({
                                                        operative: sOpName,
                                                        client: sClientName,
                                                        site: sSiteName,
                                                        helpers: emp.empName,
                                                        hasReport: extractHasReport(dayEntry),
                                                        hasDataFile: extractHasData(dayEntry),
                                                        schedule: s
                                                    });
                                                });
                                            }
                                        } else {
                                            if (hasExpensesApplied(dayEntry)) {
                                                const loc = (dayEntry.workLocation || dayEntry.details?.workLocation || '').trim();
                                                const inHouseKeywords = ['Room', 'Godown', 'Office', 'Home'];
                                                const isInHouse = inHouseKeywords.includes(loc) || inHouseKeywords.some(k => (dayEntry.siteNames || '').includes(k));

                                                assignments.push({
                                                    client: isInHouse ? 'Office' : (dayEntry.clientNames || dayEntry.clientName || '—'),
                                                    site: loc || dayEntry.siteNames || '—',
                                                    helpers: '',
                                                    hasReport: extractHasReport(dayEntry),
                                                    hasDataFile: extractHasData(dayEntry)
                                                });
                                            }
                                        }

                                        if (assignments.length > 0) {
                                            const rowItem = {
                                                ...dayEntry,
                                                empId: emp.empId,
                                                empName: emp.empName,
                                                rowKey: `${emp.empId}-${dk}`,
                                                assignments: assignments,
                                                totalDebit: dayEntry.totalDebit,
                                                totalCredit: dayEntry.totalCredit
                                            };

                                            if (!datesMap[dk]) datesMap[dk] = [];
                                            datesMap[dk].push(rowItem);
                                        }
                                    });
                                });

                                let sortedDateKeys = Object.keys(datesMap).sort((a, b) => new Date(b) - new Date(a)).slice(0, 5);
                                sortedDateKeys.reverse(); // Dates ascending as per header text

                                return sortedDateKeys.map((dateKey) => {
                                    const dateEntries = datesMap[dateKey];
                                    dateEntries.sort((a, b) => a.empName.localeCompare(b.empName));

                                    const totD = dateEntries.reduce((s,e)=>s+(e.totalDebit||0),0);
                                    const totC = dateEntries.reduce((s,e)=>s+(e.totalCredit||0),0);

                                    return (
                                        <Box key={dateKey} bg="white" borderRadius="2xl" border="1px solid" borderColor="gray.100" shadow="sm" overflow="hidden">
                                            {/* — Date header — */}
                                            <Flex px={4} py={2.5} bg="gray.50" borderBottom="1px solid" borderColor="gray.100" align="center" justify="space-between" flexWrap="wrap" gap={2}>
                                                <HStack spacing={3}>
                                                    <Flex w={8} h={8} borderRadius="md" bg="blue.500" align="center" justify="center" color="white" flexShrink={0}>
                                                        <Icon as={FaCalendarAlt} />
                                                    </Flex>
                                                    <Text fontWeight="800" fontSize="md" color="gray.800">{fmtDate(dateKey)}</Text>
                                                    <Badge colorScheme="blue" variant="subtle" borderRadius="full" fontSize="10px">{dateEntries.length} {dateEntries.length === 1 ? 'Employee' : 'Employees'}</Badge>
                                                </HStack>
                                            </Flex>

                                            {/* — Scrollable Table for Perfect Alignment — */}
                                            <Box overflowX="auto">
                                                {/* — Column headers — */}
                                                <Flex minW="900px" px={4} py={2} bg="gray.50" borderBottom="1px solid" borderColor="gray.100" align="center">
                                                    <Text flex="1.2" minW="140px" fontSize="9px" fontWeight="800" color="gray.500" textTransform="uppercase">Operative</Text>
                                                    <Text flex="1"   minW="130px" fontSize="9px" fontWeight="800" color="gray.500" textTransform="uppercase">Helper</Text>
                                                    <Text flex="1.2" minW="140px" fontSize="9px" fontWeight="800" color="gray.500" textTransform="uppercase">Client</Text>
                                                    <Text flex="1.2" minW="140px" fontSize="9px" fontWeight="800" color="gray.500" textTransform="uppercase">Site</Text>
                                                    <Text flex="0 0 75px" fontSize="9px" fontWeight="800" color="gray.500" textTransform="uppercase" textAlign="center">Report</Text>
                                                    <Text flex="0 0 75px" fontSize="9px" fontWeight="800" color="gray.500" textTransform="uppercase" textAlign="center">Data</Text>
                                                    <Text flex="0 0 85px" fontSize="9px" fontWeight="800" color="gray.500" textTransform="uppercase" textAlign="right">Credit</Text>
                                                    <Text flex="0 0 85px" fontSize="9px" fontWeight="800" color="gray.500" textTransform="uppercase" textAlign="right" ml={2}>Debit</Text>
                                                </Flex>

                                                {/* — Rows — */}
                                                {dateEntries.map((entry, idx) => {
                                                    const hasDebitOnly  = entry.totalDebit > 0 && entry.totalCredit === 0;
                                                    const hasCreditOnly = entry.totalCredit > 0 && entry.totalDebit === 0;
                                                    const opName = entry.empName;
                                                    const displayName = opName || '';
                                                    const initials = displayName.split(' ').filter(Boolean).map(w=>w[0]).join('').slice(0,2).toUpperCase();
                                                    const assignments = entry.assignments || [];

                                                    return (
                                                        <Flex
                                                            key={entry.rowKey || `${entry.empId}-${idx}`}
                                                            minW="900px"
                                                            px={4} py={assignments.length > 1 ? 3 : 2.5}
                                                            align="center"
                                                            bg={idx%2===0 ? 'white' : 'gray.50/50'}
                                                            borderLeft="3px solid"
                                                            borderLeftColor={hasDebitOnly ? 'red.400' : hasCreditOnly ? 'green.400' : 'transparent'}
                                                            borderBottom={idx < dateEntries.length-1 ? "1px solid" : "none"}
                                                            borderColor="gray.100"
                                                            _hover={{ bg:'blue.50/60' }}
                                                            transition="background 0.15s"
                                                            cursor="pointer"
                                                            onClick={() => {
                                                                setSelectedDetailEntry(entry);
                                                                onDetailOpen();
                                                            }}
                                                        >
                                                            {/* 1. Operative */}
                                                            <HStack flex="1.2" minW="140px" spacing={2} pr={2} overflow="hidden">
                                                                <Flex w={7} h={7} borderRadius="md" bg="blue.100" align="center" justify="center" color="blue.700" fontWeight="800" fontSize="11px" flexShrink={0}>
                                                                    {initials}
                                                                </Flex>
                                                                <VStack align="start" spacing={0} overflow="hidden">
                                                                    <Text fontSize="xs" fontWeight="800" color="gray.800" isTruncated>
                                                                        {opName}
                                                                    </Text>
                                                                    {assignments.length > 1 && (
                                                                        <Badge colorScheme="blue" variant="subtle" fontSize="9px" px={1.5} borderRadius="full">
                                                                            {assignments.length} Sites
                                                                        </Badge>
                                                                    )}
                                                                </VStack>
                                                            </HStack>

                                                            {/* 2. Helper (Partitioned per assignment) */}
                                                            <Box flex="1" minW="130px" pr={2}>
                                                                <VStack align="start" spacing={assignments.length > 1 ? 2 : 0} divider={assignments.length > 1 ? <Divider borderColor="gray.200" /> : null}>
                                                                    {assignments.map((asg, aIdx) => (
                                                                        <Text key={aIdx} fontSize="xs" color={asg.helpers ? "gray.800" : "gray.300"} fontWeight={asg.helpers ? "700" : "normal"} isTruncated minH={assignments.length > 1 ? "22px" : "auto"} display="flex" alignItems="center">
                                                                            {asg.helpers ? `🤝 ${asg.helpers}` : '—'}
                                                                        </Text>
                                                                    ))}
                                                                </VStack>
                                                            </Box>

                                                            {/* 3. Client (Partitioned per assignment) */}
                                                            <Box flex="1.2" minW="140px" pr={2}>
                                                                <VStack align="start" spacing={assignments.length > 1 ? 2 : 0} divider={assignments.length > 1 ? <Divider borderColor="gray.200" /> : null}>
                                                                    {assignments.map((asg, aIdx) => (
                                                                        <Text key={aIdx} fontSize="xs" fontWeight="700" color={asg.client && asg.client !== '—' ? "gray.800" : "gray.300"} isTruncated minH={assignments.length > 1 ? "22px" : "auto"} display="flex" alignItems="center">
                                                                            {asg.client && asg.client !== '—' ? `🏢 ${asg.client}` : '—'}
                                                                        </Text>
                                                                    ))}
                                                                </VStack>
                                                            </Box>

                                                            {/* 4. Site (Partitioned per assignment) */}
                                                            <Box flex="1.2" minW="140px" pr={2}>
                                                                <VStack align="start" spacing={assignments.length > 1 ? 2 : 0} divider={assignments.length > 1 ? <Divider borderColor="gray.200" /> : null}>
                                                                    {assignments.map((asg, aIdx) => (
                                                                        <Text key={aIdx} fontSize="xs" fontWeight="700" color={asg.site && asg.site !== '—' ? "blue.600" : "gray.400"} isTruncated minH={assignments.length > 1 ? "22px" : "auto"} display="flex" alignItems="center">
                                                                            {asg.site && asg.site !== '—' ? `📍 ${asg.site}` : '—'}
                                                                        </Text>
                                                                    ))}
                                                                </VStack>
                                                            </Box>

                                                            {/* 5. Report Checkmark (Aligned per assignment) */}
                                                            <Flex flex="0 0 75px" justify="center" align="center">
                                                                <VStack spacing={assignments.length > 1 ? 2 : 0} align="center" divider={assignments.length > 1 ? <Divider borderColor="transparent" /> : null}>
                                                                    {assignments.map((asg, aIdx) => (
                                                                        <Flex key={aIdx} minH={assignments.length > 1 ? "22px" : "auto"} align="center" justify="center">
                                                                            {asg.hasReport ? (
                                                                                <Badge colorScheme="green" variant="solid" borderRadius="full" px={2} py={0.5} fontSize="9px" fontWeight="800" display="inline-flex" alignItems="center" gap={1}>
                                                                                    <Icon as={FaCheckCircle} /> Yes
                                                                                </Badge>
                                                                            ) : (
                                                                                <Text fontSize="xs" color="gray.300">—</Text>
                                                                            )}
                                                                        </Flex>
                                                                    ))}
                                                                </VStack>
                                                            </Flex>

                                                            {/* 6. Data Checkmark (Aligned per assignment) */}
                                                            <Flex flex="0 0 75px" justify="center" align="center">
                                                                <VStack spacing={assignments.length > 1 ? 2 : 0} align="center" divider={assignments.length > 1 ? <Divider borderColor="transparent" /> : null}>
                                                                    {assignments.map((asg, aIdx) => (
                                                                        <Flex key={aIdx} minH={assignments.length > 1 ? "22px" : "auto"} align="center" justify="center">
                                                                            {asg.hasDataFile ? (
                                                                                <Badge colorScheme="blue" variant="solid" borderRadius="full" px={2} py={0.5} fontSize="9px" fontWeight="800" display="inline-flex" alignItems="center" gap={1}>
                                                                                    <Icon as={FaCheckCircle} /> Yes
                                                                                </Badge>
                                                                            ) : (
                                                                                <Text fontSize="xs" color="gray.300">—</Text>
                                                                            )}
                                                                        </Flex>
                                                                    ))}
                                                                </VStack>
                                                            </Flex>

                                                            {/* 7. Credit (Single employee day total) */}
                                                            <Text flex="0 0 85px" fontSize="xs" fontWeight="700" color={entry.totalCredit > 0 ? "green.600" : "gray.300"} textAlign="right">
                                                                {entry.totalCredit > 0 ? fmtAmt(entry.totalCredit) : '—'}
                                                            </Text>

                                                            {/* 8. Debit (Single employee day total) */}
                                                            <Text flex="0 0 85px" fontSize="xs" fontWeight="700" color={entry.totalDebit > 0 ? "red.500" : "gray.300"} textAlign="right" ml={2}>
                                                                {entry.totalDebit > 0 ? fmtAmt(entry.totalDebit) : '—'}
                                                            </Text>
                                                        </Flex>
                                                    );
                                                })}

                                                {/* — Daily Totals bar — */}
                                                {(totD > 0 || totC > 0) && (
                                                    <Flex px={4} py={2} bg="blue.50/40" borderTop="1px dashed" borderColor="blue.200" align="center" justify="space-between">
                                                        <HStack spacing={2}>
                                                            <Icon as={FaMoneyBillWave} color="blue.500" fontSize="xs"/>
                                                            <Text fontSize="xs" fontWeight="700" color="blue.700">Daily Total ({dateEntries.length} employees)</Text>
                                                        </HStack>
                                                        <HStack spacing={6}>
                                                            {totC > 0 && (
                                                                <HStack spacing={1}>
                                                                    <Text fontSize="xs" color="gray.500" fontWeight="600">Total Credit:</Text>
                                                                    <Text fontSize="xs" fontWeight="800" color="green.600">{fmtAmt(totC)}</Text>
                                                                </HStack>
                                                            )}
                                                            {totD > 0 && (
                                                                <HStack spacing={1}>
                                                                    <Text fontSize="xs" color="gray.500" fontWeight="600">Total Debit:</Text>
                                                                    <Text fontSize="xs" fontWeight="800" color="red.500">{fmtAmt(totD)}</Text>
                                                                </HStack>
                                                            )}
                                                        </HStack>
                                                    </Flex>
                                                )}
                                            </Box>
                                        </Box>
                                    );
                                });
                            })()}
                        </VStack>
                    )}
                </Box>
            )}

            {/* ════════ Divider ════════ */}
            {canReadLast5Days && canReadAdvanced && (
                <Flex align="center" gap={3}>
                    <Divider borderColor="gray.200" />
                    <Text fontSize="10px" color="gray.400" fontWeight="700" whiteSpace="nowrap" letterSpacing="widest">ADVANCED REPORTS</Text>
                    <Divider borderColor="gray.200" />
                </Flex>
            )}

            {/* ════════ SECTION 2 — Custom Reports ════════ */}
            {canReadAdvanced && (
                <Box bg="white" p={{ base:4, md:6 }} borderRadius="2xl" shadow="sm" border="1px solid" borderColor="gray.100">
                    <Heading size="sm" mb={5} color="gray.700">Custom Date Range &amp; Report Selection</Heading>
                    <Flex direction={{ base:'column', md:'row' }} gap={4} align={{ base:'stretch', md:'flex-end' }} mb={6} flexWrap="wrap">

                        {/* Financial Year */}
                        <FormControl w="auto">
                            <FormLabel fontWeight="bold" fontSize="sm">Financial Year</FormLabel>
                            <Popover placement="bottom-start">
                                <PopoverTrigger>
                                    <Button w="auto" minW="150px" bg="white" color="gray.800" _hover={{bg:'gray.50'}} borderRadius="md" shadow="sm" size="md" fontWeight="bold" border="1px solid" borderColor="gray.200" justifyContent="space-between" rightIcon={<Icon as={FaCalendarAlt} color="blue.500"/>}>
                                        <Box flex="1" textAlign="left">{selectedFY ? `${selectedFY}-${parseInt(selectedFY)+1} (FY)` : 'Custom Date'}</Box>
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent w="280px" borderRadius="2xl" shadow="2xl" border="1px solid" borderColor="gray.100" zIndex={100}>
                                    <PopoverBody p={4} maxH="350px" overflowY="auto">
                                        <HStack justify="space-between" mb={4} px={2}>
                                            <IconButton size="sm" variant="ghost" icon={<FaChevronLeft/>} onClick={()=>setFyPageStart(p=>p-12)}/>
                                            <Text fontWeight="bold" fontSize="sm">{fyPageStart} – {fyPageStart+11}</Text>
                                            <IconButton size="sm" variant="ghost" icon={<FaChevronRight/>} onClick={()=>setFyPageStart(p=>p+12)}/>
                                        </HStack>
                                        <SimpleGrid columns={2} spacing={2}>
                                            {Array.from({length:12},(_,i)=>fyPageStart+i).map(y=>(
                                                <Button key={y} size="sm" borderRadius="lg" colorScheme={selectedFY===y.toString()?'blue':'gray'} variant={selectedFY===y.toString()?'solid':'ghost'} onClick={()=>{setSelectedFY(y.toString());setSelectedMonth('');setGlobalStartDate(`${y}-04-01`);setGlobalEndDate(`${y+1}-03-31`);}}>
                                                    {y}-{y+1}
                                                </Button>
                                            ))}
                                        </SimpleGrid>
                                    </PopoverBody>
                                </PopoverContent>
                            </Popover>
                        </FormControl>

                        {/* Month */}
                        <FormControl w="auto">
                            <FormLabel fontWeight="bold" fontSize="sm">Month</FormLabel>
                            <Select bg="white" size="md" value={selectedMonth} onChange={e=>{
                                setSelectedMonth(e.target.value);
                                if(e.target.value){
                                    const mi=parseInt(e.target.value);
                                    let yr=new Date().getFullYear();
                                    if(selectedFY) yr=mi<3?parseInt(selectedFY)+1:parseInt(selectedFY);
                                    setGlobalStartDate(fmtMonthFn(new Date(yr,mi,1)));
                                    setGlobalEndDate(fmtMonthFn(new Date(yr,mi+1,0)));
                                }
                            }}>
                                <option value="">Custom Month</option>
                                {["January","February","March","April","May","June","July","August","September","October","November","December"].map((m,i)=>(
                                    <option key={i} value={i}>{m}</option>
                                ))}
                            </Select>
                        </FormControl>

                        {/* From */}
                        <FormControl w="auto">
                            <FormLabel fontWeight="bold" fontSize="sm">From Date</FormLabel>
                            <Input type="date" size="md" bg="white" value={globalStartDate} onChange={e=>{setGlobalStartDate(e.target.value);setSelectedFY('');setSelectedMonth('');}}/>
                        </FormControl>

                        {/* To */}
                        <FormControl w="auto">
                            <FormLabel fontWeight="bold" fontSize="sm">To Date</FormLabel>
                            <Input type="date" size="md" bg="white" value={globalEndDate} onChange={e=>{setGlobalEndDate(e.target.value||_todayStr);setSelectedFY('');setSelectedMonth('');}}/>
                        </FormControl>

                        {/* Report Type */}
                        <FormControl w="auto" flex={1}>
                            <FormLabel fontWeight="bold" fontSize="sm">Report Type</FormLabel>
                            <Select value={reportType} bg="white" size="md" onChange={e=>{
                                setReportType(e.target.value);
                                if(['Food','Fuel','ClientSite'].includes(e.target.value)) setSelectedExpEmp({id:'ALL',name:'All Employees'});
                                else setSelectedExpEmp({id:'',name:''});
                            }}>
                                <option value="Ledger">Employee Ledger</option>
                                <option value="Food">Global Food Report</option>
                                <option value="Fuel">Global Fuel Report</option>
                                <option value="ClientSite">Client &amp; Site Wise Report</option>
                                <option value="EmployeeSiteLedger">Employee Client &amp; Site Ledger</option>
                            </Select>
                        </FormControl>

                        {/* Employee */}
                        <FormControl w="auto" flex={1} isDisabled={isAllEmp}>
                            <FormLabel fontWeight="bold" fontSize="sm">Select Employee</FormLabel>
                            <Select placeholder={isAllEmp ? "All Employees Included" : "-- Select Employee --"} value={isAllEmp ? 'ALL' : selectedExpEmp.id} bg={isAllEmp ? 'gray.100' : 'white'} size="md" onChange={e=>{const emp=employees.find(x=>x._id===e.target.value);setSelectedExpEmp({id:emp?._id||'',name:emp?.name||''});}}>
                                {isAllEmp && <option value="ALL" hidden>All Employees</option>}
                                {employees.map(emp=>(<option key={emp._id} value={emp._id}>{emp.name}</option>))}
                            </Select>
                        </FormControl>
                    </Flex>

                    {/* Report Output */}
                    {((selectedExpEmp.id && selectedExpEmp.id !== 'ALL') || isAllEmp) ? (
                        <AdminEmployeeExpenses
                            employeeId={isAllEmp ? 'ALL' : selectedExpEmp.id}
                            employeeName={isAllEmp ? 'All Employees' : selectedExpEmp.name}
                            externalReportType={reportType}
                            globalStartDate={globalStartDate}
                            globalEndDate={globalEndDate}
                        />
                    ) : (
                        <Center py={12}>
                            <VStack spacing={2}>
                                <Icon as={FaChartBar} w={9} h={9} color="gray.200"/>
                                <Text color="gray.400" fontSize="sm">Select an employee to view their report</Text>
                            </VStack>
                        </Center>
                    )}
                </Box>
            )}

            {!canReadLast5Days && !canReadAdvanced && (
                <Center py={14} bg="white" borderRadius="2xl" shadow="sm" border="1px solid" borderColor="gray.100">
                    <VStack spacing={3}>
                        <Icon as={FaChartBar} w={10} h={10} color="orange.400" />
                        <Text fontSize="md" fontWeight="bold" color="gray.600">No Authorized Reports Available</Text>
                        <Text fontSize="xs" color="gray.400">Please contact your administrator to grant access to specific report sub-sections.</Text>
                    </VStack>
                </Center>
            )}

            {/* Expense Detail Modal */}
            <Modal isOpen={isDetailOpen} onClose={onDetailClose} size="3xl" isCentered scrollBehavior="inside">
                <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(6px)" />
                <ModalContent borderRadius="2xl" overflow="hidden" shadow="2xl" maxW={{ base: '95vw', md: '880px', lg: '960px' }}>
                    {(() => {
                        if (!selectedDetailEntry) return null;

                        const entryDateKey = toLocalDateKey(selectedDetailEntry.date);

                        // Find ALL schedules where this employee is Operative or Helper on this date
                        const allDaySchedules = (allSchedules || []).filter(s => {
                            const sDateKey = toLocalDateKey(s.scheduleDate || s.date);
                            if (sDateKey !== entryDateKey) return false;

                            const sOpId = s.operative?._id || s.operative;
                            const sOpName = s.operative?.name || (typeof s.operative === 'string' ? s.operative : '');
                            if (isSameEmployee(selectedDetailEntry.empId, sOpId, selectedDetailEntry.empName, sOpName)) return true;

                            if (Array.isArray(s.helpers)) {
                                return s.helpers.some(h => {
                                    const hId = h?._id || h;
                                    const hName = h?.name || (typeof h === 'string' ? h : '');
                                    return isSameEmployee(selectedDetailEntry.empId, hId, selectedDetailEntry.empName, hName);
                                });
                            } else if (s.helper) {
                                const hId = s.helper?._id || s.helper;
                                const hName = s.helper?.name || (typeof s.helper === 'string' ? s.helper : '');
                                return isSameEmployee(selectedDetailEntry.empId, hId, selectedDetailEntry.empName, hName);
                            }
                            return false;
                        });

                        const empObj = employees.find(e => 
                            String(e._id) === String(selectedDetailEntry.empId) || 
                            String(e.empId) === String(selectedDetailEntry.empId) || 
                            (e.name && e.name.trim().toLowerCase() === (selectedDetailEntry.empName || '').trim().toLowerCase())
                        );
                        const empObjectId = empObj ? empObj._id : selectedDetailEntry.empId;

                        const details = selectedDetailEntry.details || {};

                        // ── 1. PEER TRANSFERS (Peer to Peer) ──────────────────────────────────
                        const givenToList = [];
                        const receivedFromList = [];

                        // From selectedDetailEntry.details
                        if (Array.isArray(details.givenTo)) {
                            details.givenTo.forEach(g => {
                                if (Number(g.amount) > 0 || g.employeeName) {
                                    givenToList.push({
                                        employeeName: g.employeeName || resolveEmployeeName(g.employee || g.employeeId),
                                        amount: Number(g.amount) || 0,
                                        remark: g.remark || g.note || '',
                                        mode: g.mode || g.paymentMode || ''
                                    });
                                }
                            });
                        }
                        if (Array.isArray(details.receivedFrom)) {
                            details.receivedFrom.forEach(r => {
                                if (Number(r.amount) > 0 || r.employeeName) {
                                    receivedFromList.push({
                                        employeeName: r.employeeName || resolveEmployeeName(r.employee || r.employeeId),
                                        amount: Number(r.amount) || 0,
                                        remark: r.remark || r.note || '',
                                        mode: r.mode || r.paymentMode || ''
                                    });
                                }
                            });
                        }
                        if (Array.isArray(selectedDetailEntry.creditDebit?.givenTo)) {
                            selectedDetailEntry.creditDebit.givenTo.forEach(g => {
                                if (Number(g.amount) > 0) {
                                    givenToList.push({
                                        employeeName: g.employeeName || resolveEmployeeName(g.employee || g.employeeId),
                                        amount: Number(g.amount) || 0,
                                        remark: g.remark || '',
                                        mode: g.paymentMode || ''
                                    });
                                }
                            });
                        }
                        if (Array.isArray(selectedDetailEntry.creditDebit?.receivedFrom)) {
                            selectedDetailEntry.creditDebit.receivedFrom.forEach(r => {
                                if (Number(r.amount) > 0) {
                                    receivedFromList.push({
                                        employeeName: r.employeeName || resolveEmployeeName(r.employee || r.employeeId),
                                        amount: Number(r.amount) || 0,
                                        remark: r.remark || '',
                                        mode: r.paymentMode || ''
                                    });
                                }
                            });
                        }

                        // From selectedDetailTransfers
                        (selectedDetailTransfers || []).forEach(tr => {
                            const trDateKey = toLocalDateKey(tr.date);
                            if (trDateKey === entryDateKey) {
                                const gId = String(tr.giver?._id || tr.giver);
                                const tId = String(tr.taker?._id || tr.taker);
                                const eIdStr = String(empObjectId);
                                if (gId === eIdStr) {
                                    givenToList.push({
                                        employeeName: tr.taker?.name || resolveEmployeeName(tr.taker),
                                        amount: Number(tr.amount) || 0,
                                        remark: tr.remark || tr.note || '',
                                        mode: tr.paymentMode || ''
                                    });
                                }
                                if (tId === eIdStr) {
                                    receivedFromList.push({
                                        employeeName: tr.giver?.name || resolveEmployeeName(tr.giver),
                                        amount: Number(tr.amount) || 0,
                                        remark: tr.remark || tr.note || '',
                                        mode: tr.paymentMode || ''
                                    });
                                }
                            }
                        });

                        // Deduplicate
                        const uniqueGivenTo = [];
                        const seenGiven = new Set();
                        givenToList.forEach(item => {
                            const k = `${item.employeeName}-${item.amount}-${item.remark}`;
                            if (!seenGiven.has(k) && item.amount > 0) {
                                seenGiven.add(k);
                                uniqueGivenTo.push(item);
                            }
                        });

                        const uniqueReceivedFrom = [];
                        const seenReceived = new Set();
                        receivedFromList.forEach(item => {
                            const k = `${item.employeeName}-${item.amount}-${item.remark}`;
                            if (!seenReceived.has(k) && item.amount > 0) {
                                seenReceived.add(k);
                                uniqueReceivedFrom.push(item);
                            }
                        });

                        // ── 2. DAILY EXPENSES BREAKDOWN (Breakfast, Lunch, Dinner, Fuel, Other) ──
                        const matchedExp = (selectedDetailExpenses || []).find(exp => toLocalDateKey(exp.date) === entryDateKey) || {};

                        const bfAmt = Number(details.breakfast || matchedExp.breakfast || 0);
                        const lunchAmt = Number(details.lunch || matchedExp.lunch || 0);
                        const dinnerAmt = Number(details.dinner || matchedExp.dinner || 0);
                        const petrolAmt = Number(details.petrol || matchedExp.petrol || 0);
                        const fuelTypeStr = details.fuelType || matchedExp.fuelType || 'Petrol';

                        const expensesKVList = [];
                        if (bfAmt > 0) {
                            expensesKVList.push({ key: 'Breakfast', icon: '🍳', value: bfAmt, badgeColor: 'orange' });
                        }
                        if (lunchAmt > 0) {
                            expensesKVList.push({ key: 'Lunch', icon: '🍱', value: lunchAmt, badgeColor: 'green' });
                        }
                        if (dinnerAmt > 0) {
                            expensesKVList.push({ key: 'Dinner', icon: '🍽️', value: dinnerAmt, badgeColor: 'purple' });
                        }
                        if (petrolAmt > 0) {
                            expensesKVList.push({ key: `Fuel / Petrol (${fuelTypeStr})`, icon: '⛽', value: petrolAmt, badgeColor: 'blue' });
                        }

                        const otherList = Array.isArray(details.otherExpensesList) && details.otherExpensesList.length > 0 
                            ? details.otherExpensesList 
                            : (Array.isArray(matchedExp.otherExpensesList) ? matchedExp.otherExpensesList : []);

                        otherList.forEach(oe => {
                            const amt = Number(oe.amount) || 0;
                            const name = oe.expenseName || oe.particulars || oe.name || 'Misc Expense';
                            if (amt > 0 || name.trim()) {
                                expensesKVList.push({ key: name, icon: '🏷️', value: amt, badgeColor: 'teal' });
                            }
                        });

                        const totalDailyExp = expensesKVList.reduce((s, e) => s + (e.value || 0), 0);

                        // ── 3. DATA FILES & REPORT FILES (Client & Site Wise) ──────────────────
                        const siteDocsMap = {}; // Key: `${clientName}___${siteName}` => { clientName, siteName, reports: [], dataFiles: [], seenUrls: Set }

                        const registerDoc = (type, f, clientTag = '', siteTag = '') => {
                            if (!f) return;
                            const url = typeof f === 'string' ? f : (f.url || f.path || '');
                            if (!url) return;
                            const cName = (clientTag || 'General / Unassigned Client').trim();
                            const sName = (siteTag || 'General / Unassigned Site').trim();
                            const groupKey = `${cName}___${sName}`;

                            if (!siteDocsMap[groupKey]) {
                                siteDocsMap[groupKey] = {
                                    clientName: cName,
                                    siteName: sName,
                                    reports: [],
                                    dataFiles: [],
                                    seenUrls: new Set()
                                };
                            }

                            if (siteDocsMap[groupKey].seenUrls.has(url)) return;
                            siteDocsMap[groupKey].seenUrls.add(url);

                            const docItem = {
                                file: f,
                                url: url,
                                name: getFileName(f, type === 'report' ? 'Daily Report' : 'Data File'),
                                clientName: cName,
                                siteName: sName
                            };

                            if (type === 'report') {
                                siteDocsMap[groupKey].reports.push(docItem);
                            } else {
                                siteDocsMap[groupKey].dataFiles.push(docItem);
                            }
                        };

                        allDaySchedules.forEach(s => {
                            const cTag = s.client?.clientName || resolveClientName(s.client?._id || s.client) || '';
                            const sTag = s.site?.siteName || resolveSiteName(s.site?._id || s.site) || '';

                            (s.files?.dailyReports || []).forEach(f => registerDoc('report', f, cTag, sTag));
                            (s.dailyReports || []).forEach(f => registerDoc('report', f, cTag, sTag));
                            (s.documents || []).forEach(d => {
                                const dUrl = typeof d === 'string' ? d : (d.url || '');
                                const dCat = typeof d === 'object' ? d.category : '';
                                if (dCat === 'Daily Report' || dCat === 'dailyReports' || dUrl.includes('Daily_report') || dUrl.includes('dailyReport') || dUrl.toLowerCase().includes('report')) {
                                    registerDoc('report', d, cTag, sTag);
                                } else if (dCat === 'Data' || dCat === 'dataFiles' || dUrl.includes('/Data/') || dUrl.toLowerCase().includes('data')) {
                                    registerDoc('data', d, cTag, sTag);
                                }
                            });
                            (s.files?.data || []).forEach(f => registerDoc('data', f, cTag, sTag));
                            (s.dataFiles || []).forEach(f => registerDoc('data', f, cTag, sTag));
                        });

                        (selectedDetailEntry.clientSites || []).forEach(cs => {
                            const cTag = cs.clientName || resolveClientName(cs.clientId?._id || cs.clientId) || '';
                            const sTag = cs.siteName || resolveSiteName(cs.siteId?._id || cs.siteId) || '';

                            (cs.files?.dailyReports || []).forEach(f => registerDoc('report', f, cTag, sTag));
                            (cs.files?.reports || []).forEach(f => registerDoc('report', f, cTag, sTag));
                            (cs.dailyReports || []).forEach(f => registerDoc('report', f, cTag, sTag));
                            (cs.reports || []).forEach(f => registerDoc('report', f, cTag, sTag));

                            (cs.files?.data || []).forEach(f => registerDoc('data', f, cTag, sTag));
                            (cs.dataFiles || []).forEach(f => registerDoc('data', f, cTag, sTag));
                            (cs.data || []).forEach(f => registerDoc('data', f, cTag, sTag));
                        });

                        (matchedExp.clientSites || []).forEach(cs => {
                            const cTag = cs.clientName || resolveClientName(cs.clientId?._id || cs.clientId) || '';
                            const sTag = cs.siteName || resolveSiteName(cs.siteId?._id || cs.siteId) || '';

                            (cs.files?.dailyReports || []).forEach(f => registerDoc('report', f, cTag, sTag));
                            (cs.dailyReports || []).forEach(f => registerDoc('report', f, cTag, sTag));
                            (cs.files?.data || []).forEach(f => registerDoc('data', f, cTag, sTag));
                            (cs.dataFiles || []).forEach(f => registerDoc('data', f, cTag, sTag));
                        });

                        const fallbackClient = selectedDetailEntry.clientNames || (allDaySchedules[0]?.client?.clientName) || resolveClientName(allDaySchedules[0]?.client?._id || allDaySchedules[0]?.client) || 'General';
                        const fallbackSite = selectedDetailEntry.siteNames || (allDaySchedules[0]?.site?.siteName) || resolveSiteName(allDaySchedules[0]?.site?._id || allDaySchedules[0]?.site) || 'General Site';

                        (selectedDetailEntry.dailyReports || []).forEach(f => registerDoc('report', f, fallbackClient, fallbackSite));
                        (selectedDetailEntry.files?.dailyReports || []).forEach(f => registerDoc('report', f, fallbackClient, fallbackSite));
                        (selectedDetailEntry.files?.reports || []).forEach(f => registerDoc('report', f, fallbackClient, fallbackSite));
                        (details.files?.dailyReports || []).forEach(f => registerDoc('report', f, fallbackClient, fallbackSite));
                        (details.dailyReports || []).forEach(f => registerDoc('report', f, fallbackClient, fallbackSite));

                        (selectedDetailEntry.data || []).forEach(f => registerDoc('data', f, fallbackClient, fallbackSite));
                        (selectedDetailEntry.dataFiles || []).forEach(f => registerDoc('data', f, fallbackClient, fallbackSite));
                        (selectedDetailEntry.files?.data || []).forEach(f => registerDoc('data', f, fallbackClient, fallbackSite));
                        (details.files?.data || []).forEach(f => registerDoc('data', f, fallbackClient, fallbackSite));
                        (details.dataFiles || []).forEach(f => registerDoc('data', f, fallbackClient, fallbackSite));
                        (details.data || []).forEach(f => registerDoc('data', f, fallbackClient, fallbackSite));

                        const docGroups = Object.values(siteDocsMap).filter(g => g.reports.length > 0 || g.dataFiles.length > 0);
                        const totalDocsCount = docGroups.reduce((s, g) => s + g.reports.length + g.dataFiles.length, 0);

                        // ── 4. RIGHT SIDE: TODAY FINANCIALS & DIFFERENCE ──────────────────────
                        const dayCredit = Number(selectedDetailEntry.totalCredit) || 0;
                        const dayDebit = Number(selectedDetailEntry.totalDebit) || 0;
                        const dayDiff = dayCredit - dayDebit;

                        // ── 5. RIGHT SIDE: MONTH TOTAL CREDIT, DEBIT & DIFFERENCE ─────────────
                        const monthCredit = Number(monthStats.credit) || 0;
                        const monthDebit = Number(monthStats.debit) || 0;
                        const monthDiff = monthCredit - monthDebit;
                        const currentBalance = Number(monthStats.currentBalance) || 0;

                        // Date string
                        const dtObj = new Date(selectedDetailEntry.date);
                        const fullDateStr = isNaN(dtObj.getTime())
                            ? fmtDate(selectedDetailEntry.date)
                            : dtObj.toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'short', year: 'numeric' });

                        const monthName = isNaN(dtObj.getTime())
                            ? 'Current Month'
                            : dtObj.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

                        return (
                            <>
                                {/* ── Modal Header with Gradient & Meta Tags ── */}
                                <ModalHeader bgGradient="linear(to-r, blue.700, blue.900)" color="white" py={4} px={6}>
                                    <VStack align="stretch" spacing={2.5}>
                                        <HStack justify="space-between" align="center" flexWrap="wrap" gap={2}>
                                            <HStack spacing={3}>
                                                <Flex w={10} h={10} borderRadius="xl" bg="whiteAlpha.200" align="center" justify="center" backdropFilter="blur(4px)">
                                                    <Icon as={FaCalendarAlt} color="white" w={5} h={5} />
                                                </Flex>
                                                <Box>
                                                    <Text fontSize="lg" fontWeight="900" lineHeight="short" letterSpacing="tight">
                                                        {fullDateStr}
                                                    </Text>
                                                    <Text fontSize="xs" color="whiteAlpha.900" fontWeight="600">
                                                        Employee: <Text as="span" color="yellow.300" fontWeight="800">{selectedDetailEntry.empName}</Text>
                                                    </Text>
                                                </Box>
                                            </HStack>
                                        </HStack>

                                        {/* Quick Summary Badges */}
                                        <Flex flexWrap="wrap" gap={2} pt={1}>
                                            {allDaySchedules.length > 0 ? (
                                                allDaySchedules.map((sch, schIdx) => {
                                                    const sSite = sch.site?.siteName || resolveSiteName(sch.site?._id || sch.site) || 'Site';
                                                    const sClient = sch.client?.clientName || resolveClientName(sch.client?._id || sch.client) || '—';
                                                    let sHelpers = [];
                                                    if (Array.isArray(sch.helpers)) {
                                                        sch.helpers.forEach(h => sHelpers.push(resolveEmployeeName(h)));
                                                    } else if (sch.helper) {
                                                        sHelpers.push(resolveEmployeeName(sch.helper));
                                                    }
                                                    const hlpStr = sHelpers.filter(Boolean).join(', ');

                                                    return (
                                                        <Badge key={schIdx} bg="whiteAlpha.200" color="white" px={3} py={1} borderRadius="lg" fontSize="11px" textTransform="none" display="flex" alignItems="center" gap={1.5}>
                                                            <Text as="span" color="yellow.200" fontWeight="800">📍 Site {schIdx + 1}:</Text>
                                                            <Text as="span" fontWeight="700">{sSite}</Text>
                                                            <Text as="span" color="whiteAlpha.600">|</Text>
                                                            <Text as="span" color="purple.200">🏢 {sClient}</Text>
                                                            {hlpStr && (
                                                                <>
                                                                    <Text as="span" color="whiteAlpha.600">|</Text>
                                                                    <Text as="span" color="green.200">🤝 Helper: {hlpStr}</Text>
                                                                </>
                                                            )}
                                                        </Badge>
                                                    );
                                                })
                                            ) : (
                                                <Badge bg="whiteAlpha.200" color="white" px={3} py={1} borderRadius="lg" fontSize="11px" textTransform="none" display="flex" alignItems="center" gap={1.5}>
                                                    <Text as="span" color="yellow.200" fontWeight="800">🏠 In-House / Office:</Text>
                                                    <Text as="span" fontWeight="700">{selectedDetailEntry.workLocation || 'Office'}</Text>
                                                </Badge>
                                            )}
                                        </Flex>
                                    </VStack>
                                </ModalHeader>
                                <ModalCloseButton color="white" mt={2} />

                                <ModalBody p={5} bg="gray.50" maxH="75vh" overflowY="auto">
                                    <VStack spacing={4} align="stretch">

                                        {/* ════════════════════ SITE ALLOCATIONS & SCHEDULES ════════════════════ */}
                                        <Box bg="white" p={4} borderRadius="xl" border="1px solid" borderColor="gray.200" shadow="sm">
                                            <HStack justify="space-between" mb={3} borderBottom="1px solid" borderColor="gray.100" pb={2}>
                                                <HStack spacing={2}>
                                                    <Icon as={FaMapMarkerAlt} color="blue.600" />
                                                    <Text fontSize="xs" fontWeight="800" color="gray.700" textTransform="uppercase">
                                                        Site Allocations &amp; Schedule Details ({allDaySchedules.length})
                                                    </Text>
                                                </HStack>
                                                <Badge colorScheme="blue" variant="subtle" borderRadius="full" fontSize="10px">
                                                    {allDaySchedules.length} Assigned {allDaySchedules.length === 1 ? 'Site' : 'Sites'}
                                                </Badge>
                                            </HStack>

                                            {allDaySchedules.length > 0 ? (
                                                <SimpleGrid columns={{ base: 1, md: allDaySchedules.length > 1 ? 2 : 1 }} spacing={3}>
                                                    {allDaySchedules.map((sch, sIdx) => {
                                                        const sSiteName = sch.site?.siteName || resolveSiteName(sch.site?._id || sch.site) || 'Site';
                                                        const sSiteAddr = sch.site?.siteAddress || '';
                                                        const sClientName = sch.client?.clientName || resolveClientName(sch.client?._id || sch.client) || '—';
                                                        const sOpName = sch.operative?.name || resolveEmployeeName(sch.operative?._id || sch.operative) || '—';
                                                        
                                                        let sHelpers = [];
                                                        if (Array.isArray(sch.helpers)) {
                                                            sch.helpers.forEach(h => sHelpers.push(resolveEmployeeName(h)));
                                                        } else if (sch.helper) {
                                                            sHelpers.push(resolveEmployeeName(sch.helper));
                                                        }
                                                        const cleanHelpers = [...new Set(sHelpers.filter(Boolean))].join(', ');

                                                        const sVehObj = sch.vehicle;
                                                        const sVehNum = sVehObj?.vehicleNumber || (typeof sVehObj === 'string' ? sVehObj : '');
                                                        const sVehName = sVehObj?.vehicleName || sVehObj?.model || '';
                                                        const sVehDisp = sVehNum ? `${sVehNum}${sVehName ? ` (${sVehName})` : ''}` : 'No Vehicle Allocated';
                                                        const sVehPhoto = sVehObj && typeof sVehObj === 'object' ? (sVehObj.primaryPhotoUrl || (Array.isArray(sVehObj.vehiclePhotos) && sVehObj.vehiclePhotos[0]) || (Array.isArray(sVehObj.photos) && sVehObj.photos[0]) || sVehObj.photoUrl || sVehObj.photo || sVehObj.image) : null;
                                                        const sVehPhotoUrl = typeof sVehPhoto === 'string' ? sVehPhoto : (sVehPhoto?.url || sVehPhoto?.path || null);

                                                        const sInstList = Array.isArray(sch.instruments) ? sch.instruments : [];
                                                        const schGroupText = sch.monthGroupId ? `Group #${sch.monthGroupId}` : (sch.scheduleType || 'Standard Schedule');

                                                        return (
                                                            <Box key={sIdx} p={3.5} bg="gray.50" borderRadius="xl" border="1px solid" borderColor="gray.200">
                                                                <VStack align="stretch" spacing={2.5}>
                                                                    <Flex justify="space-between" align="start" gap={2}>
                                                                        <HStack spacing={2} overflow="hidden">
                                                                            <Icon as={FaMapMarkerAlt} color="red.500" flexShrink={0} />
                                                                            <VStack align="start" spacing={0} overflow="hidden">
                                                                                <Text fontSize="sm" fontWeight="800" color="gray.800" isTruncated>
                                                                                    {sSiteName}
                                                                                </Text>
                                                                                {sSiteAddr && (
                                                                                    <Text fontSize="10px" color="gray.500" isTruncated>{sSiteAddr}</Text>
                                                                                )}
                                                                            </VStack>
                                                                        </HStack>
                                                                        <Badge colorScheme="purple" variant="subtle" borderRadius="md" px={2} flexShrink={0}>
                                                                            🏢 {sClientName}
                                                                        </Badge>
                                                                    </Flex>

                                                                    <Divider borderColor="gray.200" />

                                                                    <SimpleGrid columns={2} spacing={2} fontSize="xs">
                                                                        <Box>
                                                                            <Text color="gray.500" fontSize="10px" fontWeight="700" textTransform="uppercase">Operative</Text>
                                                                            <Text fontWeight="700" color="blue.700" isTruncated>👤 {sOpName}</Text>
                                                                        </Box>
                                                                        <Box>
                                                                            <Text color="gray.500" fontSize="10px" fontWeight="700" textTransform="uppercase">Helper</Text>
                                                                            <Text fontWeight="700" color={cleanHelpers ? 'green.700' : 'gray.400'} isTruncated>
                                                                                🤝 {cleanHelpers || 'None'}
                                                                            </Text>
                                                                        </Box>
                                                                    </SimpleGrid>

                                                                    <SimpleGrid columns={2} spacing={2} fontSize="xs">
                                                                        <Box>
                                                                            <Text color="gray.500" fontSize="10px" fontWeight="700" textTransform="uppercase">Vehicle</Text>
                                                                            <HStack spacing={1.5} mt={0.5} align="center">
                                                                                {sVehPhotoUrl ? (
                                                                                    <Tooltip label="Click to view full vehicle photo" hasArrow>
                                                                                        <Box
                                                                                            as="button"
                                                                                            onClick={(e) => {
                                                                                                e.stopPropagation();
                                                                                                window.open(getFileHref(sVehPhotoUrl), '_blank');
                                                                                            }}
                                                                                            cursor="pointer"
                                                                                            borderRadius="md"
                                                                                            overflow="hidden"
                                                                                            border="1.5px solid"
                                                                                            borderColor="indigo.300"
                                                                                            _hover={{ transform: 'scale(1.1)', shadow: 'sm' }}
                                                                                            transition="all 0.15s"
                                                                                            flexShrink={0}
                                                                                        >
                                                                                            <Image
                                                                                                src={getFileHref(sVehPhotoUrl)}
                                                                                                alt={sVehNum || 'Vehicle'}
                                                                                                w={6}
                                                                                                h={6}
                                                                                                objectFit="cover"
                                                                                                fallback={<Flex w={6} h={6} bg="indigo.100" align="center" justify="center"><Icon as={FaCar} color="indigo.600" fontSize="xs"/></Flex>}
                                                                                            />
                                                                                        </Box>
                                                                                    </Tooltip>
                                                                                ) : (
                                                                                    <Flex w={5} h={5} borderRadius="sm" bg="indigo.50" align="center" justify="center" flexShrink={0}>
                                                                                        <Icon as={FaCar} color={sVehNum ? "indigo.600" : "gray.400"} fontSize="10px" />
                                                                                    </Flex>
                                                                                )}
                                                                                <VStack align="start" spacing={0} overflow="hidden">
                                                                                    <Text fontWeight="700" color={sVehNum ? 'indigo.700' : 'gray.400'} isTruncated fontSize="xs">
                                                                                        {sVehDisp}
                                                                                    </Text>
                                                                                    {sVehPhotoUrl && (
                                                                                        <Text
                                                                                            as="button"
                                                                                            fontSize="9px"
                                                                                            color="indigo.600"
                                                                                            fontWeight="700"
                                                                                            onClick={(e) => {
                                                                                                e.stopPropagation();
                                                                                                window.open(getFileHref(sVehPhotoUrl), '_blank');
                                                                                            }}
                                                                                            _hover={{ textDecoration: 'underline' }}
                                                                                            display="inline-flex"
                                                                                            alignItems="center"
                                                                                            gap={0.5}
                                                                                        >
                                                                                            <Icon as={FaCamera} fontSize="8px"/> View Photo
                                                                                        </Text>
                                                                                    )}
                                                                                </VStack>
                                                                            </HStack>
                                                                        </Box>
                                                                        <Box>
                                                                            <Text color="gray.500" fontSize="10px" fontWeight="700" textTransform="uppercase">Schedule Type</Text>
                                                                            <Badge colorScheme="purple" fontSize="9px" borderRadius="md" mt={0.5}>
                                                                                👥 {schGroupText}
                                                                            </Badge>
                                                                        </Box>
                                                                    </SimpleGrid>

                                                                    {/* Instruments */}
                                                                    <Box bg="white" p={2} borderRadius="lg" border="1px solid" borderColor="gray.200">
                                                                        <HStack justify="space-between" mb={sInstList.length > 0 ? 1 : 0}>
                                                                            <HStack spacing={1}>
                                                                                <Icon as={FaTools} color="orange.500" fontSize="xs" />
                                                                                <Text color="gray.700" fontSize="10px" fontWeight="700" textTransform="uppercase">Instruments</Text>
                                                                            </HStack>
                                                                            <Badge colorScheme={sInstList.length > 0 ? 'orange' : 'gray'} fontSize="9px" borderRadius="full">
                                                                                {sInstList.length} Assigned
                                                                            </Badge>
                                                                        </HStack>
                                                                        {sInstList.length > 0 ? (
                                                                            <VStack align="stretch" spacing={1.5} pl={1}>
                                                                                {sInstList.map((inst, iIdx) => {
                                                                                    const iPhoto = inst && typeof inst === 'object' ? (inst.primaryPhotoUrl || (Array.isArray(inst.photos) && inst.photos[0]) || (Array.isArray(inst.existingPhotos) && inst.existingPhotos[0]) || inst.photoUrl || inst.photo || inst.image) : null;
                                                                                    const iPhotoUrl = typeof iPhoto === 'string' ? iPhoto : (iPhoto?.url || iPhoto?.path || null);
                                                                                    const iName = inst.instrumentName || inst.name || 'Instrument';
                                                                                    const iSerial = inst.serialNo ? `[S/N: ${inst.serialNo}]` : '';

                                                                                    return (
                                                                                        <Flex key={iIdx} justify="space-between" align="center" p={1.5} bg="gray.50" borderRadius="md" border="1px solid" borderColor="gray.100">
                                                                                            <HStack spacing={2} overflow="hidden">
                                                                                                {iPhotoUrl ? (
                                                                                                    <Tooltip label="Click to view instrument photo" hasArrow>
                                                                                                        <Box
                                                                                                            as="button"
                                                                                                            onClick={(e) => {
                                                                                                                e.stopPropagation();
                                                                                                                window.open(getFileHref(iPhotoUrl), '_blank');
                                                                                                            }}
                                                                                                            cursor="pointer"
                                                                                                            borderRadius="md"
                                                                                                            overflow="hidden"
                                                                                                            border="1px solid"
                                                                                                            borderColor="orange.300"
                                                                                                            _hover={{ transform: 'scale(1.1)', shadow: 'sm' }}
                                                                                                            transition="all 0.15s"
                                                                                                            flexShrink={0}
                                                                                                        >
                                                                                                            <Image
                                                                                                                src={getFileHref(iPhotoUrl)}
                                                                                                                alt={iName}
                                                                                                                w={6}
                                                                                                                h={6}
                                                                                                                objectFit="cover"
                                                                                                                fallback={<Flex w={6} h={6} bg="orange.100" align="center" justify="center"><Icon as={FaTools} color="orange.600" fontSize="9px"/></Flex>}
                                                                                                            />
                                                                                                        </Box>
                                                                                                    </Tooltip>
                                                                                                ) : (
                                                                                                    <Flex w={5} h={5} borderRadius="sm" bg="orange.100" align="center" justify="center" flexShrink={0}>
                                                                                                        <Icon as={FaTools} color="orange.600" fontSize="9px" />
                                                                                                    </Flex>
                                                                                                )}
                                                                                                <VStack align="start" spacing={0} overflow="hidden">
                                                                                                    <Text fontSize="10px" fontWeight="700" color="gray.800" isTruncated>
                                                                                                        {iName}
                                                                                                    </Text>
                                                                                                    {iSerial && (
                                                                                                        <Text fontSize="9px" color="gray.500" fontWeight="600">{iSerial}</Text>
                                                                                                    )}
                                                                                                </VStack>
                                                                                            </HStack>
                                                                                            {iPhotoUrl && (
                                                                                                <Button
                                                                                                    size="xs"
                                                                                                    h="18px"
                                                                                                    px={1.5}
                                                                                                    colorScheme="orange"
                                                                                                    variant="ghost"
                                                                                                    fontSize="9px"
                                                                                                    leftIcon={<Icon as={FaExternalLinkAlt} fontSize="7px" />}
                                                                                                    onClick={(e) => {
                                                                                                        e.stopPropagation();
                                                                                                        window.open(getFileHref(iPhotoUrl), '_blank');
                                                                                                    }}
                                                                                                    flexShrink={0}
                                                                                                >
                                                                                                    Photo
                                                                                                </Button>
                                                                                            )}
                                                                                        </Flex>
                                                                                    );
                                                                                })}
                                                                            </VStack>
                                                                        ) : (
                                                                            <Text fontSize="10px" color="gray.400" fontStyle="italic">No instruments assigned.</Text>
                                                                        )}
                                                                    </Box>
                                                                </VStack>
                                                            </Box>
                                                        );
                                                    })}
                                                </SimpleGrid>
                                            ) : (
                                                <Box p={3} bg="gray.50" borderRadius="lg" border="1px dashed" borderColor="gray.300">
                                                    <HStack justify="space-between">
                                                        <HStack spacing={2}>
                                                            <Icon as={FaHome} color="gray.500" />
                                                            <Text fontSize="xs" fontWeight="700" color="gray.700">
                                                                In-House Activity ({selectedDetailEntry.workLocation || 'Office'})
                                                            </Text>
                                                        </HStack>
                                                        <Badge colorScheme="gray">In-House Staff</Badge>
                                                    </HStack>
                                                </Box>
                                            )}
                                        </Box>

                                        {/* ════════════════════ 2-COLUMN MAIN BODY ════════════════════ */}
                                        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={4} align="start">
                                            {/* ════════════════════ LEFT COLUMN ════════════════════ */}
                                            <VStack spacing={4} align="stretch">
                                                {/* 1. PEER TRANSFERS (Shown before Daily Expenses) */}
                                                <Box bg="white" p={4} borderRadius="xl" border="1px solid" borderColor="gray.200" shadow="sm">
                                                    <HStack justify="space-between" mb={3} borderBottom="1px solid" borderColor="gray.100" pb={2}>
                                                        <HStack spacing={2}>
                                                            <Icon as={FaExchangeAlt} color="blue.500" />
                                                            <Text fontSize="xs" fontWeight="800" color="gray.700" textTransform="uppercase">
                                                                Peer Transfers
                                                            </Text>
                                                        </HStack>
                                                        <Badge colorScheme="blue" variant="subtle" borderRadius="full" fontSize="10px">
                                                            {uniqueGivenTo.length + uniqueReceivedFrom.length} Transactions
                                                        </Badge>
                                                    </HStack>

                                                    <VStack align="stretch" spacing={3}>
                                                        {uniqueGivenTo.length > 0 && (
                                                            <Box>
                                                                <Text fontSize="10px" fontWeight="800" color="red.500" textTransform="uppercase" mb={1.5}>
                                                                    🔴 Money Given (Debit)
                                                                </Text>
                                                                <VStack align="stretch" spacing={1.5}>
                                                                    {uniqueGivenTo.map((g, idx) => (
                                                                        <HStack key={idx} justify="space-between" p={2.5} bg="red.50" borderRadius="lg" fontSize="xs" border="1px solid" borderColor="red.100">
                                                                            <VStack align="start" spacing={0} maxW="65%">
                                                                                <Text color="red.900" fontWeight="700" isTruncated>To: {g.employeeName}</Text>
                                                                                {g.remark && <Text fontSize="10px" color="red.700" isTruncated>{g.remark}</Text>}
                                                                            </VStack>
                                                                            <Text fontWeight="800" color="red.700" fontSize="sm">₹{Number(g.amount || 0).toLocaleString('en-IN')}</Text>
                                                                        </HStack>
                                                                    ))}
                                                                </VStack>
                                                            </Box>
                                                        )}

                                                        {uniqueReceivedFrom.length > 0 && (
                                                            <Box>
                                                                <Text fontSize="10px" fontWeight="800" color="green.600" textTransform="uppercase" mb={1.5}>
                                                                    🟢 Money Received (Credit)
                                                                </Text>
                                                                <VStack align="stretch" spacing={1.5}>
                                                                    {uniqueReceivedFrom.map((r, idx) => (
                                                                        <HStack key={idx} justify="space-between" p={2.5} bg="green.50" borderRadius="lg" fontSize="xs" border="1px solid" borderColor="green.100">
                                                                            <VStack align="start" spacing={0} maxW="65%">
                                                                                <Text color="green.900" fontWeight="700" isTruncated>From: {r.employeeName}</Text>
                                                                                {r.remark && <Text fontSize="10px" color="green.700" isTruncated>{r.remark}</Text>}
                                                                            </VStack>
                                                                            <Text fontWeight="800" color="green.700" fontSize="sm">₹{Number(r.amount || 0).toLocaleString('en-IN')}</Text>
                                                                        </HStack>
                                                                    ))}
                                                                </VStack>
                                                            </Box>
                                                        )}

                                                        {uniqueGivenTo.length === 0 && uniqueReceivedFrom.length === 0 && (
                                                            <Center py={3} bg="gray.50" borderRadius="lg" border="1px dashed" borderColor="gray.200">
                                                                <Text fontSize="xs" color="gray.400" fontStyle="italic">
                                                                    No peer transfers recorded for this day.
                                                                </Text>
                                                            </Center>
                                                        )}
                                                    </VStack>
                                                </Box>

                                                {/* 2. DAILY EXPENSES BREAKDOWN (Key-Value) */}
                                                <Box bg="white" p={4} borderRadius="xl" border="1px solid" borderColor="gray.200" shadow="sm">
                                                    <HStack justify="space-between" mb={3} borderBottom="1px solid" borderColor="gray.100" pb={2}>
                                                        <HStack spacing={2}>
                                                            <Icon as={FaUtensils} color="orange.500" />
                                                            <Text fontSize="xs" fontWeight="800" color="gray.700" textTransform="uppercase">
                                                                Daily Expenses (Key-Value)
                                                            </Text>
                                                        </HStack>
                                                        <Badge colorScheme="orange" variant="solid" borderRadius="full" px={2} py={0.5} fontSize="11px" fontWeight="800">
                                                            Total: ₹{totalDailyExp.toLocaleString('en-IN')}
                                                        </Badge>
                                                    </HStack>

                                                    {expensesKVList.length > 0 ? (
                                                        <VStack align="stretch" spacing={2}>
                                                            {expensesKVList.map((item, idx) => (
                                                                <Flex key={idx} justify="space-between" align="center" p={2.5} bg="gray.50" borderRadius="lg" border="1px solid" borderColor="gray.100">
                                                                    <HStack spacing={2.5} overflow="hidden">
                                                                        <Text fontSize="md">{item.icon}</Text>
                                                                        <Text color="gray.800" fontWeight="700" fontSize="xs" isTruncated>
                                                                            {item.key}
                                                                        </Text>
                                                                    </HStack>
                                                                    <Tag size="md" colorScheme={item.badgeColor || 'gray'} variant="subtle" borderRadius="md" fontWeight="800">
                                                                        ₹{item.value.toLocaleString('en-IN')}
                                                                    </Tag>
                                                                </Flex>
                                                            ))}
                                                        </VStack>
                                                    ) : (
                                                        <Center py={3} bg="gray.50" borderRadius="lg" border="1px dashed" borderColor="gray.200">
                                                            <Text fontSize="xs" color="gray.400" fontStyle="italic">
                                                                No food, fuel or other expenses logged for this date.
                                                            </Text>
                                                        </Center>
                                                    )}
                                                </Box>

                                                {/* 3. REPORT FILES & DATA FILES (Grouped Client & Site Wise) */}
                                                <Box bg="white" p={4} borderRadius="xl" border="1px solid" borderColor="gray.200" shadow="sm">
                                                    <HStack justify="space-between" mb={3} borderBottom="1px solid" borderColor="gray.100" pb={2}>
                                                        <HStack spacing={2}>
                                                            <Icon as={FaFolderOpen} color="teal.500" />
                                                            <Text fontSize="xs" fontWeight="800" color="gray.700" textTransform="uppercase">
                                                                Client &amp; Site Wise Documents ({totalDocsCount})
                                                            </Text>
                                                        </HStack>
                                                        <Badge colorScheme="teal" variant="subtle" borderRadius="full" fontSize="10px">
                                                            {docGroups.length} {docGroups.length === 1 ? 'Site Group' : 'Site Groups'}
                                                        </Badge>
                                                    </HStack>

                                                    {docGroups.length > 0 ? (
                                                        <VStack align="stretch" spacing={3}>
                                                            {docGroups.map((grp, gIdx) => (
                                                                <Box key={gIdx} p={3} bg="gray.50" borderRadius="xl" border="1px solid" borderColor="gray.200">
                                                                    {/* Client & Site Group Header */}
                                                                    <Flex justify="space-between" align="center" mb={2.5} flexWrap="wrap" gap={2}>
                                                                        <HStack spacing={2}>
                                                                            <Badge colorScheme="purple" px={2.5} py={0.5} borderRadius="md" fontSize="11px" fontWeight="800">
                                                                                🏢 {grp.clientName}
                                                                            </Badge>
                                                                            <Badge colorScheme="blue" px={2.5} py={0.5} borderRadius="md" fontSize="11px" fontWeight="800">
                                                                                📍 {grp.siteName}
                                                                            </Badge>
                                                                        </HStack>
                                                                        <Text fontSize="10px" color="gray.500" fontWeight="700">
                                                                            {grp.reports.length} Reports · {grp.dataFiles.length} Data Files
                                                                        </Text>
                                                                    </Flex>

                                                                    <VStack align="stretch" spacing={2}>
                                                                        {/* Reports */}
                                                                        {grp.reports.map((rf, rIdx) => (
                                                                            <HStack key={`rep-${rIdx}`} justify="space-between" p={2} bg="teal.50/70" borderRadius="lg" border="1px solid" borderColor="teal.100">
                                                                                <HStack spacing={2} overflow="hidden" flex={1} mr={2}>
                                                                                    <Icon as={FaFilePdf} color="teal.600" flexShrink={0} />
                                                                                    <VStack align="start" spacing={0} overflow="hidden">
                                                                                        <Text fontSize="xs" fontWeight="700" color="teal.950" isTruncated>
                                                                                            {rf.name}
                                                                                        </Text>
                                                                                        <Text fontSize="9px" color="teal.700" fontWeight="600">Daily Report File</Text>
                                                                                    </VStack>
                                                                                </HStack>
                                                                                <Button
                                                                                    size="xs"
                                                                                    colorScheme="teal"
                                                                                    variant="solid"
                                                                                    leftIcon={<Icon as={FaExternalLinkAlt} fontSize="9px" />}
                                                                                    onClick={() => window.open(getFileHref(rf.url), '_blank')}
                                                                                    borderRadius="md"
                                                                                    flexShrink={0}
                                                                                >
                                                                                    View
                                                                                </Button>
                                                                            </HStack>
                                                                        ))}

                                                                        {/* Data Files */}
                                                                        {grp.dataFiles.map((df, dIdx) => (
                                                                            <HStack key={`dat-${dIdx}`} justify="space-between" p={2} bg="blue.50/70" borderRadius="lg" border="1px solid" borderColor="blue.100">
                                                                                <HStack spacing={2} overflow="hidden" flex={1} mr={2}>
                                                                                    <Icon as={FaFolderOpen} color="blue.600" flexShrink={0} />
                                                                                    <VStack align="start" spacing={0} overflow="hidden">
                                                                                        <Text fontSize="xs" fontWeight="700" color="blue.950" isTruncated>
                                                                                            {df.name}
                                                                                        </Text>
                                                                                        <Text fontSize="9px" color="blue.700" fontWeight="600">Data File</Text>
                                                                                    </VStack>
                                                                                </HStack>
                                                                                <Button
                                                                                    size="xs"
                                                                                    colorScheme="blue"
                                                                                    variant="solid"
                                                                                    leftIcon={<Icon as={FaExternalLinkAlt} fontSize="9px" />}
                                                                                    onClick={() => window.open(getFileHref(df.url), '_blank')}
                                                                                    borderRadius="md"
                                                                                    flexShrink={0}
                                                                                >
                                                                                    View
                                                                                </Button>
                                                                            </HStack>
                                                                        ))}
                                                                    </VStack>
                                                                </Box>
                                                            ))}
                                                        </VStack>
                                                    ) : (
                                                        <Center py={4} bg="gray.50" borderRadius="lg" border="1px dashed" borderColor="gray.200">
                                                            <Text fontSize="xs" color="gray.400" fontStyle="italic">
                                                                No daily reports or data files uploaded for this date.
                                                            </Text>
                                                        </Center>
                                                    )}
                                                </Box>
                                            </VStack>

                                            {/* ════════════════════ RIGHT COLUMN ════════════════════ */}
                                            <VStack spacing={4} align="stretch">
                                                {/* 4. TODAY'S FINANCIAL SUMMARY (Credit, Debit & Difference) */}
                                                <Box bg="white" p={4} borderRadius="xl" border="1px solid" borderColor="gray.200" shadow="sm">
                                                    <HStack spacing={2} mb={3} borderBottom="1px solid" borderColor="gray.100" pb={2}>
                                                        <Icon as={FaMoneyBillWave} color="purple.500" />
                                                        <Text fontSize="xs" fontWeight="800" color="gray.700" textTransform="uppercase">
                                                            Today's Financial Summary
                                                        </Text>
                                                    </HStack>

                                                    <SimpleGrid columns={3} spacing={2.5} textAlign="center" mb={2}>
                                                        <Box p={3} bg="green.50" borderRadius="xl" border="1px solid" borderColor="green.200">
                                                            <Text fontSize="9px" fontWeight="800" color="green.600" textTransform="uppercase" letterSpacing="wider">Credit</Text>
                                                            <Text fontSize="md" fontWeight="900" color="green.700" mt={0.5}>₹{dayCredit.toLocaleString('en-IN')}</Text>
                                                        </Box>

                                                        <Box p={3} bg="red.50" borderRadius="xl" border="1px solid" borderColor="red.200">
                                                            <Text fontSize="9px" fontWeight="800" color="red.500" textTransform="uppercase" letterSpacing="wider">Debit</Text>
                                                            <Text fontSize="md" fontWeight="900" color="red.700" mt={0.5}>₹{dayDebit.toLocaleString('en-IN')}</Text>
                                                        </Box>

                                                        <Box p={3} bg={dayDiff >= 0 ? 'blue.50' : 'orange.50'} borderRadius="xl" border="1px solid" borderColor={dayDiff >= 0 ? 'blue.200' : 'orange.200'}>
                                                            <Text fontSize="9px" fontWeight="800" color={dayDiff >= 0 ? 'blue.600' : 'orange.600'} textTransform="uppercase" letterSpacing="wider">Difference</Text>
                                                            <Text fontSize="md" fontWeight="900" color={dayDiff >= 0 ? 'blue.700' : 'orange.700'} mt={0.5}>
                                                                {dayDiff >= 0 ? '+₹' + dayDiff.toLocaleString('en-IN') : '-₹' + Math.abs(dayDiff).toLocaleString('en-IN')}
                                                            </Text>
                                                        </Box>
                                                    </SimpleGrid>

                                                    <Flex justify="center" pt={1}>
                                                        <Badge colorScheme={dayDiff > 0 ? 'green' : dayDiff < 0 ? 'orange' : 'gray'} variant="subtle" px={2.5} py={0.5} borderRadius="full" fontSize="10px" fontWeight="700">
                                                            {dayDiff > 0 ? `Net Surplus: +₹${dayDiff.toLocaleString('en-IN')}` : dayDiff < 0 ? `Net Spent: -₹${Math.abs(dayDiff).toLocaleString('en-IN')}` : 'Balanced (₹0)'}
                                                        </Badge>
                                                    </Flex>
                                                </Box>

                                                {/* 5. MONTH TOTAL CREDIT, DEBIT & DIFFERENCE */}
                                                <Box bg="gradient" bgGradient="linear(to-br, blue.50, indigo.50)" p={4} borderRadius="xl" border="1px solid" borderColor="blue.200" shadow="sm">
                                                    <HStack justify="space-between" mb={3} borderBottom="1px solid" borderColor="blue.200" pb={2}>
                                                        <HStack spacing={2}>
                                                            <Icon as={FaCalendarAlt} color="blue.600" />
                                                            <Text fontSize="xs" fontWeight="800" color="blue.900" textTransform="uppercase">
                                                                {monthName} Financial Overview
                                                            </Text>
                                                        </HStack>
                                                        {monthStats.loading && <Spinner size="xs" color="blue.600" />}
                                                    </HStack>

                                                    <SimpleGrid columns={3} spacing={2} textAlign="center" mb={3}>
                                                        <Box p={2.5} bg="white" borderRadius="lg" shadow="xs" border="1px solid" borderColor="green.100">
                                                            <Text fontSize="9px" fontWeight="800" color="green.600" textTransform="uppercase">Month Credit</Text>
                                                            <Text fontSize="xs" fontWeight="900" color="green.700" mt={0.5}>₹{monthCredit.toLocaleString('en-IN')}</Text>
                                                        </Box>

                                                        <Box p={2.5} bg="white" borderRadius="lg" shadow="xs" border="1px solid" borderColor="red.100">
                                                            <Text fontSize="9px" fontWeight="800" color="red.500" textTransform="uppercase">Month Debit</Text>
                                                            <Text fontSize="xs" fontWeight="900" color="red.700" mt={0.5}>₹{monthDebit.toLocaleString('en-IN')}</Text>
                                                        </Box>

                                                        <Box p={2.5} bg="white" borderRadius="lg" shadow="xs" border="1px solid" borderColor={monthDiff >= 0 ? 'blue.100' : 'orange.100'}>
                                                            <Text fontSize="9px" fontWeight="800" color={monthDiff >= 0 ? 'blue.600' : 'orange.600'} textTransform="uppercase">Difference</Text>
                                                            <Text fontSize="xs" fontWeight="900" color={monthDiff >= 0 ? 'blue.700' : 'orange.700'} mt={0.5}>
                                                                {monthDiff >= 0 ? '+₹' + monthDiff.toLocaleString('en-IN') : '-₹' + Math.abs(monthDiff).toLocaleString('en-IN')}
                                                            </Text>
                                                        </Box>
                                                    </SimpleGrid>

                                                    <HStack justify="space-between" bg="white" p={2.5} borderRadius="lg" border="1px solid" borderColor="blue.200" shadow="xs">
                                                        <HStack spacing={1.5}>
                                                            <Icon as={FaMoneyBillWave} color="blue.600" fontSize="xs" />
                                                            <Text fontSize="11px" fontWeight="700" color="gray.700">Current Ledger Balance:</Text>
                                                        </HStack>
                                                        <Text fontSize="sm" fontWeight="900" color={currentBalance >= 0 ? 'blue.700' : 'red.600'}>
                                                            ₹{currentBalance.toLocaleString('en-IN')}
                                                        </Text>
                                                    </HStack>
                                                </Box>

                                                {/* 6. Remarks & Additional Notes */}
                                                {(details.notes || selectedDetailEntry.workLocation) && (
                                                    <Box bg="white" p={3.5} borderRadius="xl" border="1px solid" borderColor="gray.200" shadow="sm">
                                                        <HStack spacing={2} mb={2}>
                                                            <Icon as={FaInfoCircle} color="teal.500" />
                                                            <Text fontSize="11px" fontWeight="800" color="gray.700" textTransform="uppercase">
                                                                Remarks &amp; Additional Notes
                                                            </Text>
                                                        </HStack>
                                                        <VStack align="stretch" spacing={2} fontSize="xs">
                                                            {details.notes && (
                                                                <Box bg="yellow.50" p={2} borderRadius="md" border="1px solid" borderColor="yellow.100">
                                                                    <Text fontSize="10px" fontWeight="700" color="orange.700">Submission Notes:</Text>
                                                                    <Text color="gray.800">{details.notes}</Text>
                                                                </Box>
                                                            )}
                                                            {selectedDetailEntry.workLocation && (
                                                                <Box bg="purple.50" p={2} borderRadius="md" border="1px solid" borderColor="purple.100">
                                                                    <Text fontSize="10px" fontWeight="700" color="purple.700">Work Location:</Text>
                                                                    <Text color="gray.800">{selectedDetailEntry.workLocation}</Text>
                                                                </Box>
                                                            )}
                                                        </VStack>
                                                    </Box>
                                                )}
                                            </VStack>
                                        </SimpleGrid>
                                    </VStack>
                                </ModalBody>

                                <ModalFooter bg="gray.100" py={3} px={6} borderTop="1px solid" borderColor="gray.200" justify="space-between">
                                    <Text fontSize="xs" color="gray.500">
                                        Click outside or press Esc to close
                                    </Text>
                                    <Button size="sm" colorScheme="blue" onClick={onDetailClose} px={6} borderRadius="lg">
                                        Close
                                    </Button>
                                </ModalFooter>
                            </>
                        );
                    })()}
                </ModalContent>
            </Modal>

        </VStack>
    );
};

// ── Daily Expenses Module ──────────────────────────────────────────────

const DailyExpensesSection = ({ employees, clients, sites, loading, onRefresh, onUpdateEmployee, canWrite = true }) => {
    const toast = useToast();
    const [isSaving, setIsSaving] = useState(false);
    
    // Core State
    const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
    const selectedEmployee = employees.find(e => e._id === selectedEmployeeId);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [standardExpenses, setStandardExpenses] = useState({ breakfast: '', lunch: '', dinner: '', petrol: '' });
    const [otherExpenses, setOtherExpenses] = useState([]);
    const [clientSites, setClientSites] = useState([{ 
        clientId: '', 
        siteId: '', 
        ledger: '',
        quantity: 0,
        files: { photos: [], data: [], dailyReports: [], drawing: [] } 
    }]);
    const [notes, setNotes] = useState('');
    const [attendance, setAttendance] = useState('Present');
    const [attendanceRemark, setAttendanceRemark] = useState('');
    const [deletedExistingFiles, setDeletedExistingFiles] = useState([]);

    // New Fuel & Day Schedules State
    const [fuelType, setFuelType] = useState('Petrol');
    const [daySchedules, setDaySchedules] = useState([]);
    const [isFetchingSchedules, setIsFetchingSchedules] = useState(false);

    // Fetch Day Schedules on Date change
    const [committedExpenses, setCommittedExpenses] = useState([]);
    const [selectedExpenseForView, setSelectedExpenseForView] = useState(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);

    const isMatchingDate = (dateVal, targetDateStr) => {
        if (!dateVal || !targetDateStr) return false;
        
        const [year, month, day] = targetDateStr.split('-');
        const dStart = new Date();
        dStart.setFullYear(parseInt(year), parseInt(month) - 1, parseInt(day));
        dStart.setHours(0, 0, 0, 0);
        
        const nextDay = new Date(dStart);
        nextDay.setDate(dStart.getDate() + 1);

        const dObj = new Date(dateVal);
        return dObj >= dStart && dObj < nextDay;
    };

    const fetchCommittedExpenses = async () => {
        if (!selectedEmployeeId || !date) {
            setCommittedExpenses([]);
            return;
        }
        try {
            const res = await api.get(`/employee-expense/admin/${selectedEmployeeId}`);
            if (res.data.success) {
                const matched = res.data.data.filter(e => {
                    return isMatchingDate(e.date, date);
                });
                setCommittedExpenses(matched);
            }
        } catch (err) {
            console.error("Failed to fetch committed expenses", err);
            setCommittedExpenses([]);
        }
    };

    const handleDeleteExpense = async (expenseId) => {
        if (!window.confirm("Are you sure you want to delete this expense record? This will revert the employee's balance and reset schedule quantities.")) {
            return;
        }
        try {
            const res = await api.delete(`/employee-expense/${expenseId}`);
            if (res.data.success) {
                toast({
                    title: 'Expense Deleted',
                    description: res.data.message || 'The expense record was deleted successfully.',
                    status: 'success',
                    duration: 3000,
                    isClosable: true,
                });
                // Refresh the committed expenses list
                await fetchCommittedExpenses();
                // Also trigger parent callback to refresh details (if any)
                if (onRefresh) onRefresh();
            } else {
                toast({
                    title: 'Delete Failed',
                    description: res.data.message || 'Could not delete expense record.',
                    status: 'error',
                    duration: 4000,
                    isClosable: true,
                });
            }
        } catch (err) {
            console.error("Error deleting expense:", err);
            toast({
                title: 'Error',
                description: err.response?.data?.message || 'An error occurred while deleting the expense.',
                status: 'error',
                duration: 4000,
                isClosable: true,
            });
        }
    };

    useEffect(() => {
        if (!date) return;
        const fetchDaySchedules = async () => {
            setIsFetchingSchedules(true);
            setDaySchedules([]);
            try {
                const res = await api.get(`/schedule-master?date=${date}`);
                if (res.data.success) {
                    // Force strictly matching the date, since backend might return future dates if today is selected
                    const exactMatches = res.data.data.filter(s => {
                        return isMatchingDate(s.scheduleDate, date);
                    });
                    setDaySchedules(exactMatches);
                } else {
                    setDaySchedules([]);
                }
            } catch (err) {
                console.error("Failed to fetch day schedules", err);
                setDaySchedules([]);
            } finally {
                setIsFetchingSchedules(false);
            }
        };
        fetchDaySchedules();
    }, [date]);

    useEffect(() => {
        fetchCommittedExpenses();
    }, [selectedEmployeeId, date]);

    useEffect(() => {
        const handleRealtimeUpdate = () => {
            fetchData();
            // Re-run schedule fetch if available
            try {
                const fetchDaySchedulesFunc = async () => {
                    const res = await api.get('/schedule-master', { params: { date } });
                    if (res.data.success) {
                        setDaySchedules(res.data.data || []);
                    }
                };
                fetchDaySchedulesFunc();
            } catch (e) {}
            fetchCommittedExpenses();
        };
        window.addEventListener('app-realtime-update', handleRealtimeUpdate);
        return () => window.removeEventListener('app-realtime-update', handleRealtimeUpdate);
    }, [date, selectedEmployeeId]);

    // Filter employees down to scheduled operatives on this date (excluding rejected)
    const scheduledEmployees = useMemo(() => {
        const ids = new Set();
        daySchedules.forEach(s => {
            if (s.dayStatus === 'Rejected') return;
            
            if (s.operative?._id) ids.add(String(s.operative._id));
            else if (s.operative) ids.add(String(s.operative));
        });
        return employees.filter(e => ids.has(String(e._id)));
    }, [daySchedules, employees]);

    // All valid schedules for the selected employee on this day
    const employeeSchedules = useMemo(() => {
        if (!selectedEmployeeId) return [];
        const targetId = String(selectedEmployeeId);
        
        return daySchedules.filter(s => {
            if (s.dayStatus === 'Rejected') return false;
            
            const opId = String(s.operative?._id || s.operative || '');
            const isOp = opId === targetId;
            const isHelper = (s.helpers || []).some(h => String(h?._id || h) === targetId);
            return isOp || isHelper;
        });
    }, [daySchedules, selectedEmployeeId]);

    // Auto-mark Attendance based on schedule status (for current and past dates only)
    useEffect(() => {
        if (!date || !selectedEmployeeId) return;

        // If we have saved/committed expenses for this date, do NOT overwrite its saved attendance
        if (committedExpenses && committedExpenses.length > 0) return;

        const selectedDate = new Date(date);
        selectedDate.setHours(0, 0, 0, 0);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (selectedDate <= today) {
            if (employeeSchedules.length > 0) {
                const hasActive = employeeSchedules.some(s => s.dayStatus !== 'Rejected' && s.dayStatus !== 'Skipped');
                if (hasActive) {
                    setAttendance('Present');
                    setAttendanceRemark('');
                } else {
                    setAttendance('Absent');
                    setAttendanceRemark('Schedule was rejected or skipped');
                }
            } else {
                setAttendance('Absent');
                setAttendanceRemark('Unscheduled');
            }
        } else {
            // Future dates: default to Absent because the work day hasn't arrived/happened yet
            setAttendance('Absent');
            setAttendanceRemark('Future Date');
        }
    }, [employeeSchedules, date, selectedEmployeeId, committedExpenses]);

    // Active schedule fallback for headers and non-multiple logic
    const activeSchedule = employeeSchedules.length > 0 ? employeeSchedules[0] : null;

    // Prefill Client & Site when employeeSchedules or committedExpenses changes
    useEffect(() => {
        const getStrId = (val) => val?._id ? String(val._id) : String(val || '');
        
        if (employeeSchedules.length > 0) {
            setClientSites(prevSites => {
                return employeeSchedules.map((sch, idx) => {
                    const scheduleId = sch._id || '';
                    const clientId = sch.client?._id || sch.client;
                    const siteId = sch.site?._id || sch.site;
                    let ledger = sch.ledger || '';
                    let quantity = sch.quantity || 0;
                    
                    // Try to auto-prefill from committedExpenses
                    if (committedExpenses.length > 0) {
                        const matchedCs = committedExpenses.flatMap(e => e.clientSites).find(cs => {
                            if (scheduleId && cs.scheduleId && getStrId(cs.scheduleId) === String(scheduleId)) return true;
                            return getStrId(cs.siteId) === String(siteId) && getStrId(cs.clientId) === String(clientId);
                        });
                        if (matchedCs) {
                            if (!ledger && matchedCs.ledger) ledger = matchedCs.ledger;
                            if (matchedCs.quantity !== undefined) quantity = matchedCs.quantity;
                        }
                    }
                    
                    // Fallback to "Full Day" for VISIT schedules if no ledger is previously set
                    if (!ledger && sch.scheduleType === 'VISIT') {
                        ledger = 'Full Day';
                    }
                    
                    // Preserve existing files if the user is currently editing, otherwise start fresh
                    const existingRow = prevSites[idx];
                    const preserveFiles = existingRow && existingRow.scheduleId === scheduleId 
                        ? existingRow.files 
                        : { photos: [], data: [], dailyReports: [], drawing: [] };

                    return {
                        scheduleId,
                        clientId,
                        siteId,
                        ledger: existingRow?.ledger ? existingRow.ledger : ledger,
                        quantity: existingRow?.quantity ? existingRow.quantity : quantity,
                        files: preserveFiles
                    };
                });
            });
        } else {
            setClientSites([{
                scheduleId: '',
                clientId: '',
                siteId: '',
                ledger: '',
                quantity: '',
                files: { photos: [], data: [], dailyReports: [], drawing: [] }
            }]);
        }
    }, [employeeSchedules, committedExpenses]);

    // Prefill form states when committedExpenses changes (to support editing/overwriting)
    useEffect(() => {
        const isWithoutFood = selectedEmployee?.foodAllowance === 'Without Food';
        if (committedExpenses && committedExpenses.length > 0) {
            const exp = committedExpenses[0];
            setStandardExpenses({
                breakfast: !isWithoutFood && exp.expenses?.breakfast !== undefined ? String(exp.expenses.breakfast) : '',
                lunch: !isWithoutFood && exp.expenses?.lunch !== undefined ? String(exp.expenses.lunch) : '',
                dinner: !isWithoutFood && exp.expenses?.dinner !== undefined ? String(exp.expenses.dinner) : '',
                petrol: exp.expenses?.petrol !== undefined ? String(exp.expenses.petrol) : ''
            });
            if (exp.expenses?.fuelType) {
                setFuelType(exp.expenses.fuelType);
            } else if (exp.fuelType) {
                setFuelType(exp.fuelType);
            }
            setNotes(exp.notes || '');
            setAttendance(exp.attendance || 'Present');
            setAttendanceRemark(exp.attendanceRemark || '');

            // Load otherExpensesList
            if (Array.isArray(exp.otherExpensesList)) {
                setOtherExpenses(exp.otherExpensesList.map(oe => ({
                    expenseName: oe.expenseName || '',
                    amount: oe.amount !== undefined ? String(oe.amount) : '',
                    files: [],
                    previews: [],
                    existingFiles: oe.files || []
                })));
            } else {
                setOtherExpenses([]);
            }
            setDeletedExistingFiles([]);
        } else {
            // Reset to default/empty if no committed expense exists
            setStandardExpenses({ breakfast: '', lunch: '', dinner: '', petrol: '' });
            setFuelType('Petrol');
            setNotes('');
            setOtherExpenses([]);
            setDeletedExistingFiles([]);
            // Attendance will be auto-set by the attendance auto-mark effect
        }
    }, [committedExpenses]);

    // Automatically clear food expenses if selected employee is Without Food
    useEffect(() => {
        if (selectedEmployee?.foodAllowance === 'Without Food') {
            setStandardExpenses(prev => ({
                ...prev,
                breakfast: '',
                lunch: '',
                dinner: ''
            }));
            // Clear any newly uploaded food files/previews
            setExpenseFiles(prev => ({
                ...prev,
                breakfast: [],
                lunch: [],
                dinner: []
            }));
            setExpensePreviews(prev => ({
                ...prev,
                breakfast: [],
                lunch: [],
                dinner: []
            }));
        }
    }, [selectedEmployeeId, selectedEmployee?.foodAllowance]);

    // Files State
    const [files, setFiles] = useState({ photos: [], data: [], dailyReports: [] });
    const [previews, setPreviews] = useState({ photos: [], data: [], dailyReports: [] });
    const [expenseFiles, setExpenseFiles] = useState({ breakfast: [], lunch: [], dinner: [], petrol: [] });
    const [expensePreviews, setExpensePreviews] = useState({ breakfast: [], lunch: [], dinner: [], petrol: [] });

    // Computed Logic
    
    const totals = useMemo(() => {
        const stdTotal = Object.values(standardExpenses).reduce((acc, val) => acc + (Number(val) || 0), 0);
        const otherTotal = otherExpenses.reduce((acc, exp) => acc + (Number(exp.amount) || 0), 0);
        const total = stdTotal + otherTotal;
        const remaining = (selectedEmployee?.totalAmount || 0) - total;
        return { total, remaining };
    }, [standardExpenses, otherExpenses, selectedEmployee]);

    // Handlers
    const addOtherExpense = () => setOtherExpenses([...otherExpenses, { expenseName: '', amount: '', files: [], previews: [] }]);
    const removeOtherExpense = (idx) => setOtherExpenses(otherExpenses.filter((_, i) => i !== idx));
    const updateOtherExpense = (idx, field, val) => {
        const updated = [...otherExpenses];
        updated[idx][field] = val;
        setOtherExpenses(updated);
    };

    const addClientSite = () => setClientSites([...clientSites, { scheduleId: '', clientId: '', siteId: '', ledger: '', quantity: 0, files: { photos: [], data: [], dailyReports: [], drawing: [] } }]);
    const removeClientSite = (idx) => setClientSites(clientSites.filter((_, i) => i !== idx));
    const updateClientSite = (idx, field, val) => {
        const updated = [...clientSites];
        updated[idx][field] = val;
        if (field === 'clientId') {
            updated[idx].siteId = ''; 
            updated[idx].ledger = '';
            updated[idx].quantity = 0;
        }
        if (field === 'siteId') {
            const matchingSchedules = employeeSchedules.filter(s => {
                const sSiteId = s.site?._id || s.site;
                return sSiteId === val;
            });
            if (matchingSchedules.length > 0) {
                updated[idx].ledger = matchingSchedules[0].ledger || '';
                updated[idx].quantity = matchingSchedules[0].quantity || 0;
            } else {
                updated[idx].ledger = '';
                updated[idx].quantity = 0;
            }
        }
        setClientSites(updated);
    };

    const handleSiteFileChange = (idx, e, category) => {
        const selectedFiles = Array.from(e.target.files);
        const updated = [...clientSites];
        updated[idx].files[category] = [...updated[idx].files[category], ...selectedFiles];
        setClientSites(updated);
    };

    const removeSiteFile = (siteIdx, category, fileIdx) => {
        const updated = [...clientSites];
        updated[siteIdx].files[category] = updated[siteIdx].files[category].filter((_, i) => i !== fileIdx);
        setClientSites(updated);
    };

    const handleFileChange = (e, category) => {
        const selectedFiles = Array.from(e.target.files);
        setFiles(prev => ({ ...prev, [category]: [...prev[category], ...selectedFiles] }));

        // Generate previews for photos
        if (category === 'photos') {
            const newPreviews = selectedFiles.map(file => URL.createObjectURL(file));
            setPreviews(prev => ({ ...prev, photos: [...prev.photos, ...newPreviews] }));
        } else {
            setPreviews(prev => ({ ...prev, [category]: [...prev[category], ...selectedFiles.map(f => f.name)] }));
        }
    };

    const removeFile = (category, idx) => {
        setFiles(prev => ({ ...prev, [category]: prev[category].filter((_, i) => i !== idx) }));
        setPreviews(prev => ({ ...prev, [category]: prev[category].filter((_, i) => i !== idx) }));
    };

    const handleExpenseFileChange = (e, category) => {
        const selectedFiles = Array.from(e.target.files);
        setExpenseFiles(prev => ({ ...prev, [category]: [...prev[category], ...selectedFiles] }));

        const newPreviews = selectedFiles.map(file => {
            if (file.type.startsWith('image/')) return { type: 'image', url: URL.createObjectURL(file), name: file.name };
            return { type: 'doc', name: file.name };
        });
        setExpensePreviews(prev => ({ ...prev, [category]: [...prev[category], ...newPreviews] }));
    };

    const removeExpenseFile = (category, idx) => {
        setExpenseFiles(prev => ({ ...prev, [category]: prev[category].filter((_, i) => i !== idx) }));
        setExpensePreviews(prev => ({ ...prev, [category]: prev[category].filter((_, i) => i !== idx) }));
    };

    const handleOtherExpenseFileChange = (idx, e) => {
        const selectedFiles = Array.from(e.target.files);
        const updated = [...otherExpenses];
        if (!updated[idx].files) updated[idx].files = [];
        if (!updated[idx].previews) updated[idx].previews = [];
        
        updated[idx].files = [...updated[idx].files, ...selectedFiles];
        
        const newPreviews = selectedFiles.map(file => {
            if (file.type.startsWith('image/')) return { type: 'image', url: URL.createObjectURL(file), name: file.name };
            return { type: 'doc', name: file.name };
        });
        updated[idx].previews = [...updated[idx].previews, ...newPreviews];
        setOtherExpenses(updated);
    };

    const removeOtherExpenseFile = (rowIdx, fileIdx) => {
        const updated = [...otherExpenses];
        updated[rowIdx].files = updated[rowIdx].files.filter((_, i) => i !== fileIdx);
        updated[rowIdx].previews = updated[rowIdx].previews.filter((_, i) => i !== fileIdx);
        setOtherExpenses(updated);
    };

    const handleSubmit = async () => {
        if (!selectedEmployeeId) {
            toast({ title: 'Select Employee', status: 'warning', position: 'top' });
            return;
        }

        if (attendance === 'Absent' && !attendanceRemark) {
            toast({ title: 'Remark Required', description: 'Please explain the reason for absence', status: 'warning', position: 'top' });
            return;
        }

        setIsSaving(true);
        try {
            const formData = new FormData();
            formData.append('employeeId', selectedEmployeeId);
            formData.append('empId', selectedEmployee.empId);
            formData.append('date', date);
            formData.append('notes', notes);
            formData.append('attendance', attendance);
            formData.append('attendanceRemark', attendanceRemark);
            
            const isWithoutFood = selectedEmployee?.foodAllowance === 'Without Food';
            const cleanStandardExpenses = {
                breakfast: isWithoutFood ? '' : standardExpenses.breakfast,
                lunch: isWithoutFood ? '' : standardExpenses.lunch,
                dinner: isWithoutFood ? '' : standardExpenses.dinner,
                petrol: standardExpenses.petrol
            };
            formData.append('expenses', JSON.stringify(cleanStandardExpenses));
            formData.append('fuelType', fuelType);
            
            const otherExpsToSend = [];
            otherExpenses.forEach((exp, idx) => {
                if (exp.expenseName && exp.amount) {
                    const mappedIdx = otherExpsToSend.length;
                    // Filter out any deleted files from the existing files list
                    const filteredExistingFiles = (exp.existingFiles || []).filter(f => !deletedExistingFiles.includes(f.url || f));
                    otherExpsToSend.push({ 
                        expenseName: exp.expenseName, 
                        amount: exp.amount,
                        files: filteredExistingFiles
                    });
                    if (exp.files) {
                        exp.files.forEach(f => formData.append(`otherExpense_${mappedIdx}`, f));
                    }
                }
            });
            formData.append('otherExpensesList', JSON.stringify(otherExpsToSend));
            
            // Add deleted existing files
            formData.append('deletedExistingFiles', JSON.stringify(deletedExistingFiles));

            // Standard Expense Files
            Object.keys(expenseFiles).forEach(key => {
                expenseFiles[key].forEach(f => formData.append(`expense_${key}`, f));
            });
            // Format allocations for backend
            const allocations = clientSites.filter(cs => cs.clientId && cs.siteId);
            formData.append('clientSites', JSON.stringify(allocations.map(a => ({ scheduleId: a.scheduleId || '', clientId: a.clientId, siteId: a.siteId, ledger: a.ledger || '', quantity: Number(a.quantity) || 0 }))));

            // Add Files site-wise
            allocations.forEach((site, idx) => {
                const fullSite = sites.find(s => s._id === site.siteId);
                const fullClient = clients.find(c => c._id === site.clientId);
                if (fullSite) {
                    const cShortId = (fullClient?.clientId || 'unknown').toLowerCase();
                    const sName = (fullSite?.siteName || 'unknown').trim().replace(/[<>:"\/\\|?*]+/g, '_');
                    const sId = fullSite?.siteId || '0000';
                    formData.append(`site_${idx}_clientShortId`, cShortId);
                    formData.append(`site_${idx}_siteSubfolder`, `${sId}-${sName}`);
                }
                
                if (site.files.photos) site.files.photos.forEach(f => formData.append(`site_${idx}_photos`, f));
                if (site.files.dailyReports) site.files.dailyReports.forEach(f => formData.append(`site_${idx}_dailyReports`, f));
                if (site.files.data) site.files.data.forEach(f => formData.append(`site_${idx}_data`, f));
                if (site.files.drawing) site.files.drawing.forEach(f => formData.append(`site_${idx}_drawing`, f));
            });

            // Fallback metadata
            if (allocations[0]) {
                const client = clients.find(c => c._id === allocations[0].clientId);
                const site = sites.find(s => s._id === allocations[0].siteId);
                formData.append('clientShortId', (client?.clientId || 'unknown').toLowerCase());
                formData.append('siteSubfolder', `${site?.siteId || '0000'}-${(site?.siteName || 'unknown').trim().replace(/[<>:"\/\\|?*]+/g, '_')}`);
            }

            const res = await api.post('/employee-expense/admin/add-expense', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (res.data.success) {
                toast({ title: 'Expense Saved Successfully', status: 'success' });
                
                // 1. Update local state IMMEDIATELY for instant UI feedback
                if (res.data.updatedEmployee && onUpdateEmployee) {
                    onUpdateEmployee(res.data.updatedEmployee);
                }
                
                // 2. Wait a bit for the DB to stabilize before a full refresh
                setTimeout(() => {
                    onRefresh();
                    fetchCommittedExpenses();
                }, 1000);
                
                // 3. Clean up only file selection/preview states
                setExpenseFiles({ breakfast: [], lunch: [], dinner: [], petrol: [] });
                setExpensePreviews({ breakfast: [], lunch: [], dinner: [], petrol: [] });
                setFiles({ photos: [], data: [], dailyReports: [] });
                setPreviews({ photos: [], data: [], dailyReports: [] });
                setClientSites(prev => prev.map(cs => ({
                    ...cs,
                    files: { photos: [], data: [], dailyReports: [], drawing: [] }
                })));
                setOtherExpenses(prev => prev.map(oe => ({
                    ...oe,
                    files: [],
                    previews: []
                })));
                setDeletedExistingFiles([]);
            }
        } catch (err) {
            toast({ title: 'Error', description: err.response?.data?.message || 'Save failed', status: 'error' });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <VStack spacing={8} align="stretch">
            {!canWrite && (
                <Alert status="warning" borderRadius="2xl" shadow="md">
                    <AlertIcon />
                    <Box>
                        <AlertTitle>Read-Only Mode</AlertTitle>
                        <AlertDescription fontSize="xs">
                            You do not have write/modify permissions for daily expenses. Saving, adding, or deleting is disabled.
                        </AlertDescription>
                    </Box>
                </Alert>
            )}
            {/* Top Filter & Employee Balance Info */}
            <Card borderRadius="2xl" shadow="md" border="1px solid" borderColor="gray.100">
                <CardBody p={6}>
                    <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} align="flex-end">
                        <FormControl>
                            <FormLabel fontSize="sm" fontWeight="bold" color="gray.600">Select Date</FormLabel>
                            <InputGroup size="lg">
                                <InputLeftElement><Icon as={FaCalendarAlt} color="blue.400" /></InputLeftElement>
                                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} borderRadius="xl" />
                            </InputGroup>
                        </FormControl>

                        <FormControl>
                            <FormLabel fontSize="sm" fontWeight="bold" color="gray.600">Select Employee</FormLabel>
                            <Select 
                                size="lg" 
                                placeholder={isFetchingSchedules ? "Loading Employees..." : (scheduledEmployees.length > 0 ? "Choose Employee" : "No Employees Scheduled")} 
                                value={selectedEmployeeId} 
                                onChange={(e) => setSelectedEmployeeId(e.target.value)}
                                borderRadius="xl"
                                isDisabled={isFetchingSchedules || scheduledEmployees.length === 0}
                            >
                                {scheduledEmployees.map(e => (
                                    <option key={e._id} value={e._id}>{e.name} ({e.empId})</option>
                                ))}
                            </Select>
                        </FormControl>

                        {selectedEmployee && (
                            <Box bg="white" p={6} borderRadius="2xl" border="1px solid" borderColor="blue.100" pos="relative" shadow="sm">
                                {loading && (
                                    <Center pos="absolute" inset={0} bg="whiteAlpha.800" borderRadius="2xl" zIndex={1}>
                                        <Spinner size="md" color="blue.500" />
                                    </Center>
                                )}
                                <SimpleGrid columns={3} spacing={4} textAlign="center">
                                    <VStack align="center" spacing={1}>
                                        <Text fontSize="10px" fontWeight="black" color="gray.400" textTransform="uppercase">Current Balance</Text>
                                        <Heading size="md" color="blue.700">₹{selectedEmployee.totalAmount?.toLocaleString()}</Heading>
                                    </VStack>
                                    
                                    <VStack align="center" spacing={1} borderLeft="1px solid" borderRight="1px solid" borderColor="gray.100">
                                        <Text fontSize="10px" fontWeight="black" color="red.400" textTransform="uppercase">Today's Total</Text>
                                        <Heading size="md" color="red.600">- ₹{totals.total.toLocaleString()}</Heading>
                                    </VStack>

                                    <VStack align="center" spacing={1}>
                                        <Text fontSize="10px" fontWeight="black" color="green.400" textTransform="uppercase">New Balance</Text>
                                        <Heading size="md" color={totals.remaining >= 0 ? "green.600" : "red.600"}>
                                            ₹{totals.remaining.toLocaleString()}
                                        </Heading>
                                    </VStack>
                                </SimpleGrid>
                                
                                <Divider my={3} />
                                <Center>
                                    <Text fontSize="xs" color="gray.500" fontStyle="italic">
                                        Calculation: ₹{selectedEmployee.totalAmount?.toLocaleString()} (Current) - ₹{totals.total.toLocaleString()} (Expense) = ₹{totals.remaining.toLocaleString()} (Final)
                                    </Text>
                                </Center>
                            </Box>
                        )}
                    </SimpleGrid>
                </CardBody>
            </Card>

            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
                {/* Left Side: Expense Inputs */}
                <VStack spacing={8} align="stretch">
                    {/* Standard Expenses */}
                    <Card borderRadius="2xl" shadow="sm" border="1px solid" borderColor="gray.100">
                        <CardBody p={6}>
                            <Heading size="sm" mb={6} color="gray.700" display="flex" alignItems="center">
                                <Icon as={FaUtensils} mr={2} color="blue.500" /> Standard Meals & Travel
                            </Heading>
                            <VStack spacing={4}>
                                <VStack spacing={4} w="full" align="stretch">
                                    {['breakfast', 'lunch', 'dinner', 'petrol'].map((expName) => (
                                        <VStack key={expName} align="stretch" spacing={2} bg="gray.50" p={2} borderRadius="xl" border="1px solid" borderColor="gray.100">
                                            <HStack align="center" w="full" justify="space-between">
                                                <FormLabel fontSize="sm" fontWeight="bold" textTransform="capitalize" m={0} minW="80px">
                                                    {expName === 'petrol' ? 'Fuel' : expName}
                                                    {selectedEmployee?.foodAllowance === 'Without Food' && expName !== 'petrol' && (
                                                        <Badge ml={2} colorScheme="red" variant="subtle" borderRadius="full">Disabled</Badge>
                                                    )}
                                                </FormLabel>
                                                
                                                {expName === 'petrol' && (
                                                    <Select 
                                                        size="sm" 
                                                        w="100px" 
                                                        value={fuelType} 
                                                        onChange={(e) => setFuelType(e.target.value)} 
                                                        borderRadius="lg" 
                                                        bg="white"
                                                    >
                                                        <option value="Petrol">Petrol</option>
                                                        <option value="CNG">CNG</option>
                                                        <option value="Diesel">Diesel</option>
                                                    </Select>
                                                )}
                                                
                                                <HStack flex={1} maxW="200px">
                                                    <InputGroup size="sm">
                                                        <InputLeftElement><Icon as={expName === 'petrol' ? FaGasPump : FaRupeeSign} color="gray.400" fontSize="xs" /></InputLeftElement>
                                                        <Input 
                                                            type="number" 
                                                            value={standardExpenses[expName]} 
                                                            onChange={(e) => setStandardExpenses({...standardExpenses, [expName]: e.target.value})} 
                                                            borderRadius="lg" 
                                                            placeholder="0" 
                                                            bg="white" 
                                                            isDisabled={selectedEmployee?.foodAllowance === 'Without Food' && expName !== 'petrol'}
                                                        />
                                                    </InputGroup>
                                                </HStack>

                                                <Tooltip label={`Upload ${expName} bills/photos`}>
                                                    <IconButton
                                                        icon={<Icon as={FaCloudUploadAlt} />}
                                                        colorScheme="blue"
                                                        variant="outline"
                                                        size="sm"
                                                        borderRadius="lg"
                                                        onClick={() => document.getElementById(`upload-${expName}`).click()}
                                                        isDisabled={selectedEmployee?.foodAllowance === 'Without Food' && expName !== 'petrol'}
                                                    />
                                                </Tooltip>
                                                <input
                                                    type="file"
                                                    id={`upload-${expName}`}
                                                    hidden
                                                    multiple
                                                    onChange={(e) => handleExpenseFileChange(e, expName)}
                                                    accept="image/*,.pdf,.doc,.docx"
                                                />
                                            </HStack>
                                            {!(selectedEmployee?.foodAllowance === 'Without Food' && expName !== 'petrol') && committedExpenses && committedExpenses[0]?.expenseFiles?.[expName] && committedExpenses[0].expenseFiles[expName].length > 0 && (
                                                <HStack overflowX="auto" py={1} spacing={2} css={{ '&::-webkit-scrollbar': { height: '4px' } }}>
                                                    {committedExpenses[0].expenseFiles[expName].map((fileUrl, i) => {
                                                        if (deletedExistingFiles.includes(fileUrl)) return null;
                                                        const finalUrl = typeof fileUrl === 'string' && fileUrl.startsWith('/') ? fileUrl : '/' + fileUrl;
                                                        const isImage = /\.(jpg|jpeg|png|webp|gif)$/i.test(fileUrl);
                                                        return (
                                                            <Box key={`exist-${expName}-${i}`} position="relative" minW="40px" h="40px" borderRadius="md" overflow="hidden" border="1px solid" borderColor="green.200" flexShrink={0}>
                                                                {isImage ? (
                                                                    <Image src={`${api.defaults.baseURL}${finalUrl}`} w="full" h="full" objectFit="cover" />
                                                                ) : (
                                                                    <Center w="full" h="full" bg="green.50"><Icon as={FaFileAlt} color="green.500" /></Center>
                                                                )}
                                                                <IconButton
                                                                    aria-label="view file"
                                                                    icon={<Icon as={FaPaperclip} />} size="xs" colorScheme="blue"
                                                                    position="absolute" bottom={0} left={0} opacity={0.8}
                                                                    onClick={() => window.open(`${api.defaults.baseURL}${finalUrl}`, '_blank')}
                                                                />
                                                                <IconButton
                                                                    aria-label="remove existing file"
                                                                    icon={<Icon as={FaTrash} />} size="xs" colorScheme="red"
                                                                    position="absolute" top={0} right={0} opacity={0.8}
                                                                    onClick={() => {
                                                                        setDeletedExistingFiles(prev => [...prev, fileUrl]);
                                                                    }}
                                                                />
                                                            </Box>
                                                        );
                                                    })}
                                                </HStack>
                                            )}

                                            {expensePreviews[expName] && expensePreviews[expName].length > 0 && (
                                                <HStack overflowX="auto" py={1} spacing={2} css={{ '&::-webkit-scrollbar': { height: '4px' } }}>
                                                    {expensePreviews[expName].map((file, i) => (
                                                        <Box key={i} position="relative" minW="40px" h="40px" borderRadius="md" overflow="hidden" border="1px solid" borderColor="gray.200" flexShrink={0}>
                                                            {file.type === 'image' ? (
                                                                <Image src={file.url} w="full" h="full" objectFit="cover" />
                                                            ) : (
                                                                <Center w="full" h="full" bg="gray.100"><Icon as={FaFileAlt} color="blue.500" /></Center>
                                                            )}
                                                            <IconButton
                                                                aria-label="remove file"
                                                                icon={<Icon as={FaTrash} />} size="xs" colorScheme="red"
                                                                position="absolute" top={0} right={0} opacity={0.8}
                                                                onClick={() => removeExpenseFile(expName, i)}
                                                            />
                                                        </Box>
                                                    ))}
                                                </HStack>
                                            )}
                                        </VStack>
                                    ))}
                                </VStack>
                            </VStack>
                        </CardBody>
                    </Card>

                    {/* Other Expenses */}
                    <Card borderRadius="2xl" shadow="sm" border="1px solid" borderColor="gray.100">
                        <CardBody p={6}>
                            <HStack justify="space-between" mb={6}>
                                <Heading size="sm" color="gray.700" display="flex" alignItems="center">
                                    <Icon as={FaPlus} mr={2} color="green.500" /> Other Custom Expenses
                                </Heading>
                                <Button size="sm" colorScheme="green" variant="ghost" leftIcon={<FaPlus />} onClick={addOtherExpense}>Add Row</Button>
                            </HStack>
                            <VStack spacing={3}>
                                {otherExpenses.map((row, idx) => (
                                    <VStack key={idx} w="full" bg="gray.50" p={3} borderRadius="xl" align="stretch" border="1px solid" borderColor="gray.100">
                                        <HStack>
                                            <Input placeholder="Expense Name" value={row.expenseName} onChange={(e) => updateOtherExpense(idx, 'expenseName', e.target.value)} bg="white" size="sm" borderRadius="lg" />
                                            <InputGroup size="sm" maxW="150px">
                                                <InputLeftElement><Icon as={FaRupeeSign} color="gray.400" /></InputLeftElement>
                                                <Input type="number" placeholder="Amount" value={row.amount} onChange={(e) => updateOtherExpense(idx, 'amount', e.target.value)} bg="white" borderRadius="lg" />
                                            </InputGroup>
                                            <Tooltip label="Upload bills">
                                                <IconButton
                                                    size="sm"
                                                    aria-label="Upload file"
                                                    icon={<Icon as={FaCloudUploadAlt} />}
                                                    colorScheme="blue"
                                                    variant="outline"
                                                    onClick={() => document.getElementById(`upload-other-${idx}`).click()}
                                                />
                                            </Tooltip>
                                            <input
                                                type="file"
                                                id={`upload-other-${idx}`}
                                                hidden
                                                multiple
                                                onChange={(e) => handleOtherExpenseFileChange(idx, e)}
                                                accept="image/*,.pdf,.doc,.docx"
                                            />
                                            <IconButton size="sm" aria-label="remove row" colorScheme="red" variant="ghost" icon={<Icon as={FaTrash} />} onClick={() => removeOtherExpense(idx)} />
                                        </HStack>
                                        {/* Existing custom expense files */}
                                        {row.existingFiles && row.existingFiles.length > 0 && (
                                            <HStack overflowX="auto" pt={1} spacing={2} css={{ '&::-webkit-scrollbar': { height: '4px' } }}>
                                                {row.existingFiles.map((fileUrl, i) => {
                                                    if (deletedExistingFiles.includes(fileUrl)) return null;
                                                    const finalUrl = typeof fileUrl === 'string' && fileUrl.startsWith('/') ? fileUrl : '/' + fileUrl;
                                                    const isImage = /\.(jpg|jpeg|png|webp|gif)$/i.test(fileUrl);
                                                    return (
                                                        <Box key={`exist-other-${idx}-${i}`} position="relative" minW="40px" h="40px" borderRadius="md" overflow="hidden" border="1px solid" borderColor="green.200" flexShrink={0}>
                                                            {isImage ? (
                                                                <Image src={`${api.defaults.baseURL}${finalUrl}`} w="full" h="full" objectFit="cover" />
                                                            ) : (
                                                                <Center w="full" h="full" bg="green.50"><Icon as={FaFileAlt} color="green.500" /></Center>
                                                            )}
                                                            <IconButton
                                                                aria-label="view file"
                                                                icon={<Icon as={FaPaperclip} />} size="xs" colorScheme="blue"
                                                                position="absolute" bottom={0} left={0} opacity={0.8}
                                                                onClick={() => window.open(`${api.defaults.baseURL}${finalUrl}`, '_blank')}
                                                            />
                                                            <IconButton
                                                                aria-label="remove existing file"
                                                                icon={<Icon as={FaTrash} />} size="xs" colorScheme="red"
                                                                position="absolute" top={0} right={0} opacity={0.8}
                                                                onClick={() => {
                                                                    setDeletedExistingFiles(prev => [...prev, fileUrl]);
                                                                }}
                                                            />
                                                        </Box>
                                                    );
                                                })}
                                            </HStack>
                                        )}

                                        {row.previews && row.previews.length > 0 && (
                                            <HStack overflowX="auto" pt={1} spacing={2} css={{ '&::-webkit-scrollbar': { height: '4px' } }}>
                                                {row.previews.map((file, i) => (
                                                    <Box key={i} position="relative" minW="40px" h="40px" borderRadius="md" overflow="hidden" border="1px solid" borderColor="gray.200" flexShrink={0}>
                                                        {file.type === 'image' ? (
                                                            <Image src={file.url} w="full" h="full" objectFit="cover" />
                                                        ) : (
                                                            <Center w="full" h="full" bg="gray.100"><Icon as={FaFileAlt} color="blue.500" /></Center>
                                                        )}
                                                        <IconButton
                                                            aria-label="remove file"
                                                            icon={<Icon as={FaTrash} />} size="xs" colorScheme="red"
                                                            position="absolute" top={0} right={0} opacity={0.8}
                                                            onClick={() => removeOtherExpenseFile(idx, i)}
                                                        />
                                                    </Box>
                                                ))}
                                            </HStack>
                                        )}
                                    </VStack>
                                ))}
                                {otherExpenses.length === 0 && <Text fontSize="xs" color="gray.400" fontStyle="italic">No custom expenses added.</Text>}
                            </VStack>
                        </CardBody>
                    </Card>

                    <Card borderRadius="2xl" shadow="sm" border="1px solid" borderColor="gray.100">
                        <CardBody p={6}>
                            <HStack justify="space-between" mb={6}>
                                <Heading size="sm" color="gray.700" display="flex" alignItems="center">
                                    <Icon as={FaBuilding} mr={2} color="purple.500" /> Client & Site Allocation
                                </Heading>
                                <Button size="sm" colorScheme="purple" variant="ghost" leftIcon={<FaPlus />} onClick={addClientSite}>Add Site</Button>
                            </HStack>
                            <VStack spacing={6}>
                                {activeSchedule && activeSchedule.scheduleType && (
                                    <Box w="full" px={4} py={2} bg="purple.50" borderRadius="xl" border="1px solid" borderColor="purple.200">
                                        <Text fontSize="xs" color="purple.800" fontWeight="bold">
                                            🗓️ Schedule Type for selected date: <span style={{ textDecoration: 'underline' }}>{activeSchedule.scheduleType}</span>
                                        </Text>
                                    </Box>
                                )}
                                {clientSites.map((row, idx) => (
                                    <VStack key={idx} w="full" bg="gray.50" p={4} borderRadius="xl" align="stretch" borderLeft="4px solid"
                                        borderColor={
                                            (() => {
                                                const ms = row.scheduleId
                                                    ? employeeSchedules.find(s => s._id === row.scheduleId)
                                                    : employeeSchedules.find(s => (s.site?._id || s.site) === row.siteId);
                                                if (!ms?.scheduleType) return 'purple.300';
                                                if (ms.scheduleType === 'VISIT') return 'green.400';
                                                if (ms.scheduleType === 'MONTH') return 'blue.400';
                                                if (ms.scheduleType === 'TOPOGRAPHY SURVEY') return 'orange.400';
                                                if (ms.scheduleType === 'POINT MARKING') return 'teal.400';
                                                return 'purple.300';
                                            })()
                                        }
                                    >
                                        <HStack align="flex-end">
                                            <FormControl flex={1}>
                                                <FormLabel fontSize="10px" fontWeight="bold">Client</FormLabel>
                                                <Select size="sm" placeholder="Select Client" value={row.clientId} onChange={(e) => updateClientSite(idx, 'clientId', e.target.value)} bg="white" borderRadius="lg">
                                                    {(() => {
                                                        const scheduledClients = new Set();
                                                        employeeSchedules.forEach(s => {
                                                            const c = s?.client;
                                                            if (c) {
                                                                const cid = c._id || c;
                                                                if (cid) scheduledClients.add(String(cid));
                                                            }
                                                        });
                                                        const filtered = clients.filter(c => c && c._id && scheduledClients.has(String(c._id)));
                                                        return filtered.map(c => <option key={c._id} value={c._id}>{c.clientName}</option>);
                                                    })()}
                                                </Select>
                                            </FormControl>
                                            <FormControl flex={1}>
                                                <FormLabel fontSize="10px" fontWeight="bold">Site</FormLabel>
                                                <Select size="sm" placeholder="Select Site" value={row.siteId} onChange={(e) => updateClientSite(idx, 'siteId', e.target.value)} bg="white" borderRadius="lg">
                                                    {(() => {
                                                        const scheduledSites = new Set();
                                                        employeeSchedules.forEach(s => {
                                                            const site = s?.site;
                                                            if (site) {
                                                                const sid = site._id || site;
                                                                if (sid) scheduledSites.add(String(sid));
                                                            }
                                                        });
                                                        const baseSites = sites.filter(s => {
                                                            const c = s?.client;
                                                            const cid = c?._id || c;
                                                            return cid && row.clientId && String(cid) === String(row.clientId);
                                                        });
                                                        const filtered = baseSites.filter(s => s && s._id && scheduledSites.has(String(s._id)));
                                                        return filtered.map(s => (
                                                            <option key={s._id} value={s._id}>{s.siteName}</option>
                                                        ));
                                                    })()}
                                                </Select>
                                            </FormControl>
                                            <FormControl flex={1}>
                                                <FormLabel fontSize="10px" fontWeight="bold">Expenses Ledger</FormLabel>
                                                {(() => {
                                                    const matchingSchedule = row.scheduleId
                                                        ? employeeSchedules.find(s => s._id === row.scheduleId)
                                                        : employeeSchedules.find(s => (s.site?._id || s.site) === row.siteId);
                                                    const isVisit = matchingSchedule?.scheduleType === 'VISIT';
                                                    return isVisit ? (
                                                        <Select
                                                            size="sm"
                                                            placeholder="Select Ledger"
                                                            value={row.ledger}
                                                            onChange={(e) => updateClientSite(idx, 'ledger', e.target.value)}
                                                            bg="white"
                                                            borderRadius="lg"
                                                        >
                                                            <option value="Full Day">Full Day</option>
                                                            <option value="Half Day">Half Day</option>
                                                        </Select>
                                                    ) : (
                                                        <Tooltip label={matchingSchedule ? `Schedule type is '${matchingSchedule.scheduleType}' — ledger selection is not applicable` : 'No schedule found for this site'} placement="top">
                                                            <Select
                                                                size="sm"
                                                                placeholder="Not Applicable"
                                                                isDisabled
                                                                bg="gray.100"
                                                                borderRadius="lg"
                                                                opacity={0.6}
                                                                cursor="not-allowed"
                                                            />
                                                        </Tooltip>
                                                    );
                                                })()}
                                            </FormControl>
                                            {(() => {
                                                const ms = row.scheduleId
                                                    ? employeeSchedules.find(s => s._id === row.scheduleId)
                                                    : employeeSchedules.find(s => (s.site?._id || s.site) === row.siteId);
                                                return ms?.scheduleType === 'POINT MARKING' ? (
                                                    <FormControl flex={0.5} maxW="100px">
                                                        <FormLabel fontSize="10px" fontWeight="bold">Quantity</FormLabel>
                                                        <Input
                                                            size="sm"
                                                            type="number"
                                                            min="0"
                                                            value={row.quantity || ''}
                                                            onChange={(e) => updateClientSite(idx, 'quantity', e.target.value === '' ? '' : (Number(e.target.value) || 0))}
                                                            bg="white"
                                                            borderRadius="lg"
                                                            placeholder="Qty"
                                                        />
                                                    </FormControl>
                                                ) : null;
                                            })()}
                                            {clientSites.length > 1 && (
                                                <IconButton size="sm" colorScheme="red" variant="ghost" icon={<FaTrash />} onClick={() => removeClientSite(idx)} />
                                            )}
                                        </HStack>

                                        {/* Schedule Type Badge */}
                                        {(() => {
                                            const ms = row.scheduleId
                                                ? employeeSchedules.find(s => s._id === row.scheduleId)
                                                : employeeSchedules.find(s => (s.site?._id || s.site) === row.siteId);
                                            const typeColors = { 'VISIT': 'green', 'MONTH': 'blue', 'TOPOGRAPHY SURVEY': 'orange', 'POINT MARKING': 'teal' };
                                            const color = typeColors[ms?.scheduleType] || 'gray';
                                            return ms?.scheduleType ? (
                                                <HStack spacing={2} mb={1}>
                                                    <Badge colorScheme={color} variant="subtle" borderRadius="full" px={3} py={0.5} fontSize="10px" fontWeight="black">
                                                        {ms.scheduleType}
                                                    </Badge>
                                                    <Text fontSize="10px" color="gray.500">schedule type for this site</Text>
                                                    {ms.helpers && ms.helpers.length > 0 && (
                                                        <HStack ml={2} spacing={1} bg="pink.50" px={3} py={1} borderRadius="full" border="1px dashed" borderColor="pink.200">
                                                            <Icon as={FaUsers} color="pink.600" w={3} h={3} />
                                                            {ms.helpers.map((h, i) => (
                                                                <Badge key={i} colorScheme="pink" variant="solid" borderRadius="full" px={2} fontSize="9px" shadow="sm">
                                                                    {h.name || 'Helper'}
                                                                </Badge>
                                                            ))}
                                                        </HStack>
                                                    )}
                                                </HStack>
                                            ) : null;
                                        })()}

                                        {/* Site Specific Uploads */}
                                        {(() => {
                                            const getStrId = (val) => val?._id ? String(val._id) : String(val || '');
                                            const matchingClientSites = committedExpenses.flatMap(e => e.clientSites).filter(cs => {
                                                // If both have a scheduleId, they MUST match exactly.
                                                if (row.scheduleId && cs.scheduleId) {
                                                    return getStrId(cs.scheduleId) === String(row.scheduleId);
                                                }
                                                // If one has a scheduleId and the other doesn't, they do NOT match.
                                                if (row.scheduleId || cs.scheduleId) {
                                                    return false;
                                                }
                                                // Fallback: match by site and client ONLY if neither has a scheduleId.
                                                return getStrId(cs.siteId) === String(row.siteId) && getStrId(cs.clientId) === String(row.clientId);
                                            });
                                            
                                            const filterDeleted = (f) => !deletedExistingFiles.includes(f.url);
                                            
                                            const existingPhotos = matchingClientSites.flatMap(cs => cs.files?.photos || []).filter(filterDeleted);
                                            const existingReports = matchingClientSites.flatMap(cs => cs.files?.dailyReports || []).filter(filterDeleted);
                                            const existingData = matchingClientSites.flatMap(cs => cs.files?.data || []).filter(filterDeleted);
                                            const existingDrawing = matchingClientSites.flatMap(cs => cs.files?.drawing || []).filter(filterDeleted);
                                            
                                            return (
                                                <SimpleGrid columns={4} spacing={3} pt={2}>
                                                    <VStack align="start" spacing={1} width="full">
                                                        <Text fontSize="9px" fontWeight="black" color="blue.600">PHOTOS ({row.files.photos.length + existingPhotos.length})</Text>
                                                        <Input type="file" multiple accept="image/*" onChange={(e) => handleSiteFileChange(idx, e, 'photos')} size="xs" p={0} variant="unstyled" />
                                                        <VStack align="stretch" spacing={1} width="full" mt={1}>
                                                            {row.files.photos.map((file, fIdx) => (
                                                                <HStack key={fIdx} justify="space-between" bg="blue.50" px={2} py={1} borderRadius="md" border="1px solid" borderColor="blue.100" spacing={1}>
                                                                    <Icon as={FaCamera} color="blue.500" w={2.5} h={2.5} />
                                                                    <Text fontSize="9px" fontWeight="medium" color="blue.800" isTruncated flex={1}>{file.name}</Text>
                                                                    <IconButton 
                                                                        size="2xs" 
                                                                        icon={<Icon as={FaTrash} w={2} h={2} />} 
                                                                        colorScheme="red" 
                                                                        variant="ghost" 
                                                                        onClick={() => removeSiteFile(idx, 'photos', fIdx)}
                                                                        aria-label="Remove photo"
                                                                        minW="16px"
                                                                        h="16px"
                                                                    />
                                                                </HStack>
                                                            ))}
                                                            {existingPhotos.map((file, fIdx) => (
                                                                <HStack key={`ex-ph-${fIdx}`} justify="space-between" bg="gray.50" px={2} py={1} borderRadius="md" border="1px solid" borderColor="gray.200" spacing={1} title="Already uploaded">
                                                                    <Icon as={FaCamera} color="gray.400" w={2.5} h={2.5} />
                                                                    <Text cursor="pointer" onClick={() => window.open(`${api.defaults.baseURL}${file.url}`, '_blank')} fontSize="9px" fontWeight="medium" color="gray.600" isTruncated flex={1} _hover={{ textDecoration: 'underline' }}>{file.name}</Text>
                                                                    <IconButton 
                                                                        size="2xs" 
                                                                        icon={<Icon as={FaTrash} w={2} h={2} />} 
                                                                        colorScheme="red" 
                                                                        variant="ghost" 
                                                                        onClick={() => setDeletedExistingFiles(prev => [...prev, file.url])}
                                                                        aria-label="Delete existing photo"
                                                                        minW="16px"
                                                                        h="16px"
                                                                    />
                                                                </HStack>
                                                            ))}
                                                        </VStack>
                                                    </VStack>
                                                    <VStack align="start" spacing={1} width="full">
                                                        <Text fontSize="9px" fontWeight="black" color="orange.600">REPORTS ({row.files.dailyReports.length + existingReports.length})</Text>
                                                        <Input type="file" multiple accept=".pdf,.doc,.docx" onChange={(e) => handleSiteFileChange(idx, e, 'dailyReports')} size="xs" p={0} variant="unstyled" />
                                                        <VStack align="stretch" spacing={1} width="full" mt={1}>
                                                            {row.files.dailyReports.map((file, fIdx) => (
                                                                <HStack key={fIdx} justify="space-between" bg="orange.50" px={2} py={1} borderRadius="md" border="1px solid" borderColor="orange.100" spacing={1}>
                                                                    <Icon as={FaFileAlt} color="orange.500" w={2.5} h={2.5} />
                                                                    <Text fontSize="9px" fontWeight="medium" color="orange.800" isTruncated flex={1}>{file.name}</Text>
                                                                    <IconButton 
                                                                        size="2xs" 
                                                                        icon={<Icon as={FaTrash} w={2} h={2} />} 
                                                                        colorScheme="red" 
                                                                        variant="ghost" 
                                                                        onClick={() => removeSiteFile(idx, 'dailyReports', fIdx)}
                                                                        aria-label="Remove report"
                                                                        minW="16px"
                                                                        h="16px"
                                                                    />
                                                                </HStack>
                                                            ))}
                                                            {existingReports.map((file, fIdx) => (
                                                                <HStack key={`ex-rp-${fIdx}`} justify="space-between" bg="gray.50" px={2} py={1} borderRadius="md" border="1px solid" borderColor="gray.200" spacing={1} title="Already uploaded">
                                                                    <Icon as={FaFileAlt} color="gray.400" w={2.5} h={2.5} />
                                                                    <Text cursor="pointer" onClick={() => window.open(`${api.defaults.baseURL}${file.url}`, '_blank')} fontSize="9px" fontWeight="medium" color="gray.600" isTruncated flex={1} _hover={{ textDecoration: 'underline' }}>{file.name}</Text>
                                                                    <IconButton 
                                                                        size="2xs" 
                                                                        icon={<Icon as={FaTrash} w={2} h={2} />} 
                                                                        colorScheme="red" 
                                                                        variant="ghost" 
                                                                        onClick={() => setDeletedExistingFiles(prev => [...prev, file.url])}
                                                                        aria-label="Delete existing report"
                                                                        minW="16px"
                                                                        h="16px"
                                                                    />
                                                                </HStack>
                                                            ))}
                                                        </VStack>
                                                    </VStack>
                                                    <VStack align="start" spacing={1} width="full">
                                                        <Text fontSize="9px" fontWeight="black" color="purple.600">DATA ({row.files.data.length + existingData.length})</Text>
                                                        <Input type="file" multiple accept=".xls,.xlsx,.pdf" onChange={(e) => handleSiteFileChange(idx, e, 'data')} size="xs" p={0} variant="unstyled" />
                                                        <VStack align="stretch" spacing={1} width="full" mt={1}>
                                                            {row.files.data.map((file, fIdx) => (
                                                                <HStack key={fIdx} justify="space-between" bg="purple.50" px={2} py={1} borderRadius="md" border="1px solid" borderColor="purple.100" spacing={1}>
                                                                    <Icon as={FaFileAlt} color="purple.500" w={2.5} h={2.5} />
                                                                    <Text fontSize="9px" fontWeight="medium" color="purple.800" isTruncated flex={1}>{file.name}</Text>
                                                                    <IconButton 
                                                                        size="2xs" 
                                                                        icon={<Icon as={FaTrash} w={2} h={2} />} 
                                                                        colorScheme="red" 
                                                                        variant="ghost" 
                                                                        onClick={() => removeSiteFile(idx, 'data', fIdx)}
                                                                        aria-label="Remove data file"
                                                                        minW="16px"
                                                                        h="16px"
                                                                    />
                                                                </HStack>
                                                            ))}
                                                            {existingData.map((file, fIdx) => (
                                                                <HStack key={`ex-da-${fIdx}`} justify="space-between" bg="gray.50" px={2} py={1} borderRadius="md" border="1px solid" borderColor="gray.200" spacing={1} title="Already uploaded">
                                                                    <Icon as={FaFileAlt} color="gray.400" w={2.5} h={2.5} />
                                                                    <Text cursor="pointer" onClick={() => window.open(`${api.defaults.baseURL}${file.url}`, '_blank')} fontSize="9px" fontWeight="medium" color="gray.600" isTruncated flex={1} _hover={{ textDecoration: 'underline' }}>{file.name}</Text>
                                                                    <IconButton 
                                                                        size="2xs" 
                                                                        icon={<Icon as={FaTrash} w={2} h={2} />} 
                                                                        colorScheme="red" 
                                                                        variant="ghost" 
                                                                        onClick={() => setDeletedExistingFiles(prev => [...prev, file.url])}
                                                                        aria-label="Delete existing data file"
                                                                        minW="16px"
                                                                        h="16px"
                                                                    />
                                                                </HStack>
                                                            ))}
                                                        </VStack>
                                                    </VStack>
                                                    <VStack align="start" spacing={1} width="full">
                                                        <Text fontSize="9px" fontWeight="black" color="teal.600">DRAWING ({(row.files.drawing?.length || 0) + existingDrawing.length})</Text>
                                                        <Input type="file" multiple accept=".pdf,.dwg,.dxf,image/*" onChange={(e) => handleSiteFileChange(idx, e, 'drawing')} size="xs" p={0} variant="unstyled" />
                                                        <VStack align="stretch" spacing={1} width="full" mt={1}>
                                                            {(row.files.drawing || []).map((file, fIdx) => (
                                                                <HStack key={fIdx} justify="space-between" bg="teal.50" px={2} py={1} borderRadius="md" border="1px solid" borderColor="teal.100" spacing={1}>
                                                                    <Icon as={FaPaperclip} color="teal.500" w={2.5} h={2.5} />
                                                                    <Text fontSize="9px" fontWeight="medium" color="teal.800" isTruncated flex={1}>{file.name}</Text>
                                                                    <IconButton 
                                                                        size="2xs" 
                                                                        icon={<Icon as={FaTrash} w={2} h={2} />} 
                                                                        colorScheme="red" 
                                                                        variant="ghost" 
                                                                        onClick={() => removeSiteFile(idx, 'drawing', fIdx)}
                                                                        aria-label="Remove drawing"
                                                                        minW="16px"
                                                                        h="16px"
                                                                    />
                                                                </HStack>
                                                            ))}
                                                            {existingDrawing.map((file, fIdx) => (
                                                                <HStack key={`ex-dw-${fIdx}`} justify="space-between" bg="gray.50" px={2} py={1} borderRadius="md" border="1px solid" borderColor="gray.200" spacing={1} title="Already uploaded">
                                                                    <Icon as={FaPaperclip} color="gray.400" w={2.5} h={2.5} />
                                                                    <Text cursor="pointer" onClick={() => window.open(`${api.defaults.baseURL}${file.url}`, '_blank')} fontSize="9px" fontWeight="medium" color="gray.600" isTruncated flex={1} _hover={{ textDecoration: 'underline' }}>{file.name}</Text>
                                                                    <IconButton 
                                                                        size="2xs" 
                                                                        icon={<Icon as={FaTrash} w={2} h={2} />} 
                                                                        colorScheme="red" 
                                                                        variant="ghost" 
                                                                        onClick={() => setDeletedExistingFiles(prev => [...prev, file.url])}
                                                                        aria-label="Delete existing drawing"
                                                                        minW="16px"
                                                                        h="16px"
                                                                    />
                                                                </HStack>
                                                            ))}
                                                        </VStack>
                                                    </VStack>
                                                </SimpleGrid>
                                            );
                                        })()}
                                    </VStack>
                                ))}
                            </VStack>
                        </CardBody>
                    </Card>
                </VStack>

                {/* Right Side: File Uploads & Summary */}
                <VStack spacing={8} align="stretch">


                    <Card borderRadius="2xl" shadow="sm" border="1px solid" borderColor="gray.100" bg="blue.50">
                        <CardBody p={6}>
                            <VStack align="stretch" spacing={4}>
                                <Heading size="xs" color="blue.700">SUBMISSION NOTES</Heading>
                                <FormControl>
                                    <Input value={notes} onChange={(e) => setNotes(e.target.value)} bg="white" borderRadius="lg" placeholder="Enter remarks for today..." />
                                </FormControl>
                            </VStack>
                        </CardBody>
                    </Card>

                    {/* Final Summary & Submit */}
                    <Card borderRadius="2xl" bgGradient="linear(to-br, blue.600, blue.800)" color="white" shadow="xl">
                        <CardBody p={6}>
                            <VStack spacing={6} align="stretch">
                                <Heading size="md">Expense Summary</Heading>
                                <Box>
                                    <HStack justify="space-between" mb={2}>
                                        <Text opacity={0.8}>Calculated Total Expense</Text>
                                        <Text fontWeight="bold" fontSize="lg">₹{totals.total.toLocaleString()}</Text>
                                    </HStack>
                                    <Divider opacity={0.3} mb={2} />
                                    <HStack justify="space-between">
                                        <Text opacity={0.8}>Employee Remaining Balance</Text>
                                        <Text fontWeight="black" fontSize="xl" color={totals.remaining >= 0 ? "green.300" : "red.300"}>
                                            ₹{totals.remaining.toLocaleString()}
                                        </Text>
                                    </HStack>
                                </Box>

                                <FormControl>
                                    <FormLabel fontSize="sm" opacity={0.8}>Add Notes (Optional)</FormLabel>
                                    <Input value={notes} onChange={(e) => setNotes(e.target.value)} bg="whiteAlpha.200" border="none" _placeholder={{color: 'whiteAlpha.500'}} placeholder="Enter remarks here..." />
                                </FormControl>

                                <Button 
                                    size="lg" 
                                    colorScheme="green" 
                                    h="70px" 
                                    fontSize="xl" 
                                    borderRadius="xl" 
                                    shadow="2xl"
                                    leftIcon={<FaCheckCircle />}
                                    isLoading={isSaving}
                                    onClick={handleSubmit}
                                    isDisabled={!canWrite}
                                    _hover={{ transform: 'translateY(-2px)' }}
                                >
                                    Submit Daily Expenses
                                </Button>
                            </VStack>
                        </CardBody>
                    </Card>
                </VStack>
            </SimpleGrid>
            {/* Committed Daily Expenses History */}
            {selectedEmployeeId && (
                <Box mt={8}>
                    <HStack justify="space-between" mb={4} px={2}>
                        <VStack align="start" spacing={0}>
                            <Heading size="md" color="blue.700">Committed Daily Expenses</Heading>
                            <Text fontSize="xs" color="gray.400">Expense records already saved & committed for this employee on this date.</Text>
                        </VStack>
                        <Badge colorScheme="blue" fontSize="md" px={4} py={1} borderRadius="full">Saved Items: {committedExpenses.length}</Badge>
                    </HStack>

                    {committedExpenses.length === 0 ? (
                        <Center py={10} bg="white" borderRadius="2xl" border="1px dashed" borderColor="gray.200">
                            <VStack spacing={2}>
                                <Icon as={FaFileAlt} w={8} h={8} color="gray.300" />
                                <Text color="gray.400" fontSize="sm">No saved expense records found for this date.</Text>
                            </VStack>
                        </Center>
                    ) : (
                        <Card borderRadius="2xl" shadow="sm" border="1px solid" borderColor="gray.100" overflow="hidden">
                            <TableContainer overflowX="auto">
                                <Table variant="simple">
                                    <Thead bg="blue.50">
                                        <Tr>
                                            <Th color="blue.700">Client / Site Allocations</Th>
                                            <Th color="blue.700">Attendance</Th>
                                            <Th color="blue.700">Expenses Breakdown</Th>
                                            <Th isNumeric color="blue.700">Total Expense</Th>
                                            <Th textAlign="center" color="blue.700">View Details</Th>
                                        </Tr>
                                    </Thead>
                                    <Tbody bg="white">
                                        {committedExpenses.map((exp) => (
                                            <Tr key={exp._id} _hover={{ bg: "blue.50" }} transition="background 0.2s">
                                                <Td>
                                                    <VStack align="start" spacing={1}>
                                                        {exp.clientSites && exp.clientSites.map((cs, cIdx) => (
                                                            <HStack key={cIdx}>
                                                                <Badge colorScheme="teal" size="sm">Site {cIdx + 1}</Badge>
                                                                <Text fontSize="xs" fontWeight="bold">
                                                                    {cs.siteId?.siteName || cs.siteName || 'Unknown Site'} 
                                                                </Text>
                                                                {cs.ledger && (
                                                                    <Badge colorScheme={cs.ledger === 'Full Day' ? 'green' : 'orange'} size="xs" variant="outline" ml={1}>
                                                                        {cs.ledger}
                                                                    </Badge>
                                                                )}
                                                            </HStack>
                                                        ))}
                                                        {(!exp.clientSites || exp.clientSites.length === 0) && (
                                                            <Text fontSize="xs" color="gray.400">No site assigned</Text>
                                                        )}
                                                    </VStack>
                                                </Td>
                                                <Td>
                                                    <Badge colorScheme={exp.attendance === 'Present' ? 'green' : exp.attendance === 'Half Day' ? 'orange' : 'red'}>
                                                        {exp.attendance || 'Present'}
                                                    </Badge>
                                                    {exp.attendanceRemark && (
                                                        <Text fontSize="10px" color="gray.500" mt={1}>Reason: {exp.attendanceRemark}</Text>
                                                    )}
                                                </Td>
                                                <Td fontSize="xs">
                                                    <VStack align="start" spacing={0}>
                                                        {exp.expenses && (
                                                            <>
                                                                {Number(exp.expenses.breakfast) > 0 && <Text>Breakfast: ₹{Number(exp.expenses.breakfast).toLocaleString()}</Text>}
                                                                {Number(exp.expenses.lunch) > 0 && <Text>Lunch: ₹{Number(exp.expenses.lunch).toLocaleString()}</Text>}
                                                                {Number(exp.expenses.dinner) > 0 && <Text>Dinner: ₹{Number(exp.expenses.dinner).toLocaleString()}</Text>}
                                                                {Number(exp.expenses.petrol) > 0 && <Text>Fuel ({exp.expenses.fuelType || 'Petrol'}): ₹{Number(exp.expenses.petrol).toLocaleString()}</Text>}
                                                            </>
                                                        )}
                                                        {exp.otherExpensesList && exp.otherExpensesList.map((oe, oeIdx) => (
                                                            <Text key={oeIdx} color="purple.600">Other ({oe.particulars || 'Misc'}): ₹{Number(oe.amount).toLocaleString()}</Text>
                                                        ))}
                                                    </VStack>
                                                </Td>
                                                <Td isNumeric fontWeight="black" fontSize="lg" color="blue.600">₹{exp.totalExpense?.toLocaleString()}</Td>
                                                <Td>
                                                    <HStack justify="center" spacing={1}>
                                                        <IconButton 
                                                            size="sm" 
                                                            colorScheme="blue" 
                                                            variant="ghost" 
                                                            icon={<FaEye />} 
                                                            borderRadius="lg"
                                                            onClick={() => {
                                                                setSelectedExpenseForView(exp);
                                                                setIsViewModalOpen(true);
                                                            }}
                                                            aria-label="View Details"
                                                        />
                                                        <IconButton 
                                                            size="sm" 
                                                            colorScheme="red" 
                                                            variant="ghost" 
                                                            icon={<FaTrash />} 
                                                            borderRadius="lg"
                                                            onClick={() => handleDeleteExpense(exp._id)}
                                                            aria-label="Delete Expense"
                                                            isDisabled={!canWrite}
                                                        />
                                                    </HStack>
                                                </Td>
                                            </Tr>
                                        ))}
                                    </Tbody>
                                </Table>
                            </TableContainer>
                        </Card>
                    )}
                </Box>
            )}
            {/* Detailed Expense View Modal */}
            <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} size="xl" scrollBehavior="inside">
                <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(8px)" />
                <ModalContent borderRadius="3xl" overflow="hidden" shadow="2xl" border="1px solid" borderColor="gray.100">
                    <ModalHeader bg="blue.500" px={6} py={4}>
                        <HStack justify="space-between" align="center" width="full">
                            <VStack align="start" spacing={0}>
                                <Heading size="md" color="white">Daily Expense Sheet</Heading>
                                <Text fontSize="xs" color="whiteAlpha.800">
                                    Date: {selectedExpenseForView?.date ? new Date(selectedExpenseForView.date).toLocaleDateString() : ''}
                                </Text>
                            </VStack>
                            <Badge colorScheme="green" fontSize="sm" px={3} py={1} borderRadius="full">
                                Total: ₹{selectedExpenseForView?.totalExpense?.toLocaleString()}
                            </Badge>
                        </HStack>
                    </ModalHeader>
                    <ModalCloseButton color="white" top={4} right={4} />

                    <ModalBody p={6} bg="gray.50">
                        {selectedExpenseForView && (
                            <VStack spacing={6} align="stretch">
                                {/* Attendance Information Card */}
                                <Card borderRadius="2xl" border="1px solid" borderColor="gray.100" shadow="sm">
                                    <CardBody p={5}>
                                        <Heading size="xs" color="gray.500" mb={3} textTransform="uppercase" letterSpacing="wider">Attendance Status</Heading>
                                        <HStack justify="space-between">
                                            <HStack>
                                                <Icon as={FaCheckCircle} color="green.500" w={5} h={5} />
                                                <Text fontWeight="bold" fontSize="md">{selectedExpenseForView.attendance || 'Present'}</Text>
                                            </HStack>
                                            {selectedExpenseForView.attendanceRemark && (
                                                <Badge colorScheme="purple" px={3} py={1} borderRadius="lg">
                                                    Remark: {selectedExpenseForView.attendanceRemark}
                                                </Badge>
                                            )}
                                        </HStack>
                                    </CardBody>
                                </Card>

                                {/* Client / Site Allocation details */}
                                <Card borderRadius="2xl" border="1px solid" borderColor="gray.100" shadow="sm">
                                    <CardBody p={5}>
                                        <Heading size="xs" color="gray.500" mb={4} textTransform="uppercase" letterSpacing="wider">Client & Site Allocations</Heading>
                                        <VStack align="stretch" spacing={4} divider={<Divider />}>
                                            {selectedExpenseForView.clientSites && selectedExpenseForView.clientSites.map((cs, csIdx) => (
                                                <VStack key={csIdx} align="stretch" spacing={3}>
                                                    <HStack justify="space-between">
                                                        <VStack align="start" spacing={0.5}>
                                                            <Text fontSize="xs" fontWeight="bold" color="blue.500">Site {csIdx + 1}</Text>
                                                            <Text fontWeight="extrabold" fontSize="md">
                                                                {cs.siteId?.siteName || cs.siteName || 'Unknown Site'}
                                                            </Text>
                                                            <HStack spacing={2} mt={1}>
                                                                {cs.ledger && (
                                                                    <Badge colorScheme="purple" variant="subtle">
                                                                        Ledger: {cs.ledger}
                                                                    </Badge>
                                                                )}
                                                                {cs.quantity !== undefined && cs.quantity > 0 && (
                                                                    <Badge colorScheme="teal" variant="solid">
                                                                        Qty: {cs.quantity}
                                                                    </Badge>
                                                                )}
                                                            </HStack>
                                                        </VStack>
                                                        {cs.siteId?.siteId && (
                                                            <Badge colorScheme="blue" variant="subtle" borderRadius="md">
                                                                ID: {cs.siteId.siteId}
                                                            </Badge>
                                                        )}
                                                    </HStack>

                                                    {/* Uploaded files section for this site */}
                                                    <VStack align="start" spacing={2} bg="gray.100" p={3} borderRadius="xl">
                                                        <Text fontSize="xs" fontWeight="bold" color="gray.600">Attached Documents & Media:</Text>
                                                        
                                                        {/* Photos */}
                                                        {cs.files?.photos && cs.files.photos.length > 0 ? (
                                                            <VStack align="start" spacing={1} width="full">
                                                                 <Text fontSize="10px" fontWeight="bold" color="gray.500">📷 Photos ({cs.files.photos.length}):</Text>
                                                                 <HStack spacing={2} wrap="wrap">
                                                                     {cs.files.photos.map((photo, pIdx) => {
                                                                         const fileUrl = photo?.url || photo;
                                                                         const finalUrl = typeof fileUrl === 'string' && fileUrl.startsWith('/') ? fileUrl : '/' + fileUrl;
                                                                         return (
                                                                             <Button 
                                                                                 key={pIdx} 
                                                                                 size="xs" 
                                                                                 variant="outline" 
                                                                                 colorScheme="blue" 
                                                                                 leftIcon={<FaCamera />}
                                                                                 onClick={() => window.open(`${api.defaults.baseURL}${finalUrl}`, '_blank')}
                                                                             >
                                                                                 Photo {pIdx + 1}
                                                                             </Button>
                                                                         );
                                                                     })}
                                                                 </HStack>
                                                             </VStack>
                                                        ) : null}

                                                        {/* Reports */}
                                                        {cs.files?.dailyReports && cs.files.dailyReports.length > 0 ? (
                                                            <VStack align="start" spacing={1} width="full" mt={1}>
                                                                 <Text fontSize="10px" fontWeight="bold" color="gray.500">📋 Daily Reports ({cs.files.dailyReports.length}):</Text>
                                                                 <HStack spacing={2} wrap="wrap">
                                                                     {cs.files.dailyReports.map((report, rIdx) => {
                                                                         const fileUrl = report?.url || report;
                                                                         const finalUrl = typeof fileUrl === 'string' && fileUrl.startsWith('/') ? fileUrl : '/' + fileUrl;
                                                                         return (
                                                                             <Button 
                                                                                 key={rIdx} 
                                                                                 size="xs" 
                                                                                 variant="outline" 
                                                                                 colorScheme="teal" 
                                                                                 leftIcon={<FaFileAlt />}
                                                                                 onClick={() => window.open(`${api.defaults.baseURL}${finalUrl}`, '_blank')}
                                                                             >
                                                                                 Report {rIdx + 1}
                                                                             </Button>
                                                                         );
                                                                     })}
                                                                 </HStack>
                                                             </VStack>
                                                        ) : null}

                                                        {/* Drawings */}
                                                        {cs.files?.drawing && cs.files.drawing.length > 0 ? (
                                                            <VStack align="start" spacing={1} width="full" mt={1}>
                                                                 <Text fontSize="10px" fontWeight="bold" color="gray.500">🎨 Drawings ({cs.files.drawing.length}):</Text>
                                                                 <HStack spacing={2} wrap="wrap">
                                                                     {cs.files.drawing.map((dwg, dwgIdx) => {
                                                                         const fileUrl = dwg?.url || dwg;
                                                                         const finalUrl = typeof fileUrl === 'string' && fileUrl.startsWith('/') ? fileUrl : '/' + fileUrl;
                                                                         return (
                                                                             <Button 
                                                                                 key={dwgIdx} 
                                                                                 size="xs" 
                                                                                 variant="outline" 
                                                                                 colorScheme="purple" 
                                                                                 leftIcon={<FaFileAlt />}
                                                                                 onClick={() => window.open(`${api.defaults.baseURL}${finalUrl}`, '_blank')}
                                                                             >
                                                                                 Drawing {dwgIdx + 1}
                                                                             </Button>
                                                                         );
                                                                     })}
                                                                 </HStack>
                                                             </VStack>
                                                        ) : null}

                                                        {/* Data files */}
                                                        {cs.files?.data && cs.files.data.length > 0 ? (
                                                            <VStack align="start" spacing={1} width="full" mt={1}>
                                                                 <Text fontSize="10px" fontWeight="bold" color="gray.500">💾 Data Files ({cs.files.data.length}):</Text>
                                                                 <HStack spacing={2} wrap="wrap">
                                                                     {cs.files.data.map((dat, datIdx) => {
                                                                         const fileUrl = dat?.url || dat;
                                                                         const finalUrl = typeof fileUrl === 'string' && fileUrl.startsWith('/') ? fileUrl : '/' + fileUrl;
                                                                         return (
                                                                             <Button 
                                                                                 key={datIdx} 
                                                                                 size="xs" 
                                                                                 variant="outline" 
                                                                                 colorScheme="orange" 
                                                                                 leftIcon={<FaFileAlt />}
                                                                                 onClick={() => window.open(`${api.defaults.baseURL}${finalUrl}`, '_blank')}
                                                                             >
                                                                                 Data File {datIdx + 1}
                                                                             </Button>
                                                                         );
                                                                     })}
                                                                 </HStack>
                                                             </VStack>
                                                        ) : null}

                                                        {(!cs.files || 
                                                          (!cs.files.photos?.length && 
                                                           !cs.files.dailyReports?.length && 
                                                           !cs.files.drawing?.length && 
                                                           !cs.files.data?.length)) && (
                                                            <Text fontSize="10px" color="gray.500" fontStyle="italic">No files uploaded for this site allocation.</Text>
                                                        )}
                                                    </VStack>
                                                </VStack>
                                            ))}
                                            {(!selectedExpenseForView.clientSites || selectedExpenseForView.clientSites.length === 0) && (
                                                <Text fontSize="xs" color="gray.400" fontStyle="italic">No client/site allocation recorded.</Text>
                                            )}
                                        </VStack>
                                    </CardBody>
                                </Card>

                                {/* Expenses breakdown */}
                                <Card borderRadius="2xl" border="1px solid" borderColor="gray.100" shadow="sm">
                                    <CardBody p={5}>
                                        <Heading size="xs" color="gray.500" mb={4} textTransform="uppercase" letterSpacing="wider">Standard Expenses</Heading>
                                        <SimpleGrid columns={2} spacing={4}>
                                            <VStack align="start" spacing={1} p={3} bg="gray.100" borderRadius="xl" justify="space-between" h="full" minH="70px">
                                                <VStack align="start" spacing={0} w="full">
                                                    <Text fontSize="xs" color="gray.500">Breakfast</Text>
                                                    <Text fontWeight="black" fontSize="lg">₹{Number(selectedExpenseForView.expenses?.breakfast || 0).toLocaleString()}</Text>
                                                </VStack>
                                                {selectedExpenseForView.expenseFiles?.breakfast && selectedExpenseForView.expenseFiles.breakfast.length > 0 && (
                                                    <HStack spacing={1} wrap="wrap" mt={1}>
                                                        {selectedExpenseForView.expenseFiles.breakfast.map((f, fIdx) => {
                                                            const fileUrl = f?.url || f;
                                                            const finalUrl = typeof fileUrl === 'string' && fileUrl.startsWith('/') ? fileUrl : '/' + fileUrl;
                                                            return (
                                                                <Button 
                                                                    key={fIdx} 
                                                                    size="xs" 
                                                                    variant="solid" 
                                                                    colorScheme="blue" 
                                                                    fontSize="9px"
                                                                    height="18px"
                                                                    px={1.5}
                                                                    leftIcon={<Icon as={FaPaperclip} w={2} h={2} />}
                                                                    onClick={() => window.open(`${api.defaults.baseURL}${finalUrl}`, '_blank')}
                                                                >
                                                                    Bill {fIdx + 1}
                                                                </Button>
                                                            );
                                                        })}
                                                    </HStack>
                                                )}
                                            </VStack>
                                            <VStack align="start" spacing={1} p={3} bg="gray.100" borderRadius="xl" justify="space-between" h="full" minH="70px">
                                                <VStack align="start" spacing={0} w="full">
                                                    <Text fontSize="xs" color="gray.500">Lunch</Text>
                                                    <Text fontWeight="black" fontSize="lg">₹{Number(selectedExpenseForView.expenses?.lunch || 0).toLocaleString()}</Text>
                                                </VStack>
                                                {selectedExpenseForView.expenseFiles?.lunch && selectedExpenseForView.expenseFiles.lunch.length > 0 && (
                                                    <HStack spacing={1} wrap="wrap" mt={1}>
                                                        {selectedExpenseForView.expenseFiles.lunch.map((f, fIdx) => {
                                                            const fileUrl = f?.url || f;
                                                            const finalUrl = typeof fileUrl === 'string' && fileUrl.startsWith('/') ? fileUrl : '/' + fileUrl;
                                                            return (
                                                                <Button 
                                                                    key={fIdx} 
                                                                    size="xs" 
                                                                    variant="solid" 
                                                                    colorScheme="blue" 
                                                                    fontSize="9px"
                                                                    height="18px"
                                                                    px={1.5}
                                                                    leftIcon={<Icon as={FaPaperclip} w={2} h={2} />}
                                                                    onClick={() => window.open(`${api.defaults.baseURL}${finalUrl}`, '_blank')}
                                                                >
                                                                    Bill {fIdx + 1}
                                                                </Button>
                                                            );
                                                        })}
                                                    </HStack>
                                                )}
                                            </VStack>
                                            <VStack align="start" spacing={1} p={3} bg="gray.100" borderRadius="xl" justify="space-between" h="full" minH="70px">
                                                <VStack align="start" spacing={0} w="full">
                                                    <Text fontSize="xs" color="gray.500">Dinner</Text>
                                                    <Text fontWeight="black" fontSize="lg">₹{Number(selectedExpenseForView.expenses?.dinner || 0).toLocaleString()}</Text>
                                                </VStack>
                                                {selectedExpenseForView.expenseFiles?.dinner && selectedExpenseForView.expenseFiles.dinner.length > 0 && (
                                                    <HStack spacing={1} wrap="wrap" mt={1}>
                                                        {selectedExpenseForView.expenseFiles.dinner.map((f, fIdx) => {
                                                            const fileUrl = f?.url || f;
                                                            const finalUrl = typeof fileUrl === 'string' && fileUrl.startsWith('/') ? fileUrl : '/' + fileUrl;
                                                            return (
                                                                <Button 
                                                                    key={fIdx} 
                                                                    size="xs" 
                                                                    variant="solid" 
                                                                    colorScheme="blue" 
                                                                    fontSize="9px"
                                                                    height="18px"
                                                                    px={1.5}
                                                                    leftIcon={<Icon as={FaPaperclip} w={2} h={2} />}
                                                                    onClick={() => window.open(`${api.defaults.baseURL}${finalUrl}`, '_blank')}
                                                                >
                                                                    Bill {fIdx + 1}
                                                                </Button>
                                                            );
                                                        })}
                                                    </HStack>
                                                )}
                                            </VStack>
                                            <VStack align="start" spacing={1} p={3} bg="gray.100" borderRadius="xl" justify="space-between" h="full" minH="70px">
                                                <VStack align="start" spacing={0} w="full">
                                                    <Text fontSize="xs" color="gray.500">Fuel ({selectedExpenseForView.expenses?.fuelType || 'Petrol'})</Text>
                                                    <Text fontWeight="black" fontSize="lg">₹{Number(selectedExpenseForView.expenses?.petrol || 0).toLocaleString()}</Text>
                                                </VStack>
                                                {selectedExpenseForView.expenseFiles?.petrol && selectedExpenseForView.expenseFiles.petrol.length > 0 && (
                                                    <HStack spacing={1} wrap="wrap" mt={1}>
                                                        {selectedExpenseForView.expenseFiles.petrol.map((f, fIdx) => {
                                                            const fileUrl = f?.url || f;
                                                            const finalUrl = typeof fileUrl === 'string' && fileUrl.startsWith('/') ? fileUrl : '/' + fileUrl;
                                                            return (
                                                                <Button 
                                                                    key={fIdx} 
                                                                    size="xs" 
                                                                    variant="solid" 
                                                                    colorScheme="blue" 
                                                                    fontSize="9px"
                                                                    height="18px"
                                                                    px={1.5}
                                                                    leftIcon={<Icon as={FaPaperclip} w={2} h={2} />}
                                                                    onClick={() => window.open(`${api.defaults.baseURL}${finalUrl}`, '_blank')}
                                                                >
                                                                    Bill {fIdx + 1}
                                                                </Button>
                                                            );
                                                        })}
                                                    </HStack>
                                                )}
                                            </VStack>
                                        </SimpleGrid>

                                        {selectedExpenseForView.otherExpensesList && selectedExpenseForView.otherExpensesList.length > 0 && (
                                            <>
                                                <Heading size="xs" color="gray.500" mt={6} mb={3} textTransform="uppercase" letterSpacing="wider">Other/Custom Expenses</Heading>
                                                <VStack align="stretch" spacing={2}>
                                                    {selectedExpenseForView.otherExpensesList.map((oe, oeIdx) => (
                                                        <HStack key={oeIdx} justify="space-between" bg="purple.50" p={3} borderRadius="xl" border="1px solid" borderColor="purple.100">
                                                            <VStack align="start" spacing={0}>
                                                                <Text fontSize="xs" fontWeight="bold" color="purple.700">Particulars</Text>
                                                                <Text fontWeight="semibold" fontSize="sm">{oe.particulars || 'Misc'}</Text>
                                                            </VStack>
                                                            <Text fontWeight="black" color="purple.700">₹{Number(oe.amount || 0).toLocaleString()}</Text>
                                                        </HStack>
                                                    ))}
                                                </VStack>
                                            </>
                                        )}
                                    </CardBody>
                                </Card>

                                {/* Notes and Remarks */}
                                {selectedExpenseForView.notes && (
                                    <Card borderRadius="2xl" border="1px solid" borderColor="gray.100" shadow="sm">
                                        <CardBody p={5}>
                                            <Heading size="xs" color="gray.500" mb={2} textTransform="uppercase" letterSpacing="wider">Notes / Remarks</Heading>
                                            <Text fontSize="sm" color="gray.700" whiteSpace="pre-line">{selectedExpenseForView.notes}</Text>
                                        </CardBody>
                                    </Card>
                                )}
                            </VStack>
                        )}
                    </ModalBody>

                    <ModalFooter bg="white" borderTop="1px solid" borderColor="gray.100">
                        <Button colorScheme="blue" onClick={() => setIsViewModalOpen(false)} borderRadius="xl" px={6}>
                            Close
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </VStack>
    );
};

// ── Attendance Sub-Module for Unscheduled Employees ────────────────────────
const DAILY_EXPENSE_ITEMS = [
    { key: 'breakfast', label: 'Breakfast', icon: '🍳', color: 'yellow' },
    { key: 'lunch',     label: 'Lunch',     icon: '🍱', color: 'orange' },
    { key: 'dinner',   label: 'Dinner',    icon: '🍽️', color: 'purple' },
    { key: 'petrol',   label: 'Petrol',    icon: '⛽', color: 'blue'   },
];

const UnscheduledAttendancePanel = ({ employees, daySchedules, attendanceDate, canWrite = true, isLoading = false, onRefresh }) => {
    const toast = useToast();
    const [attendanceMap, setAttendanceMap]   = useState({});
    const [remarks, setRemarks]               = useState({});
    const [locationMap, setLocationMap]       = useState({});   // 'Home' | 'Godown' | ''
    const [expensesMap, setExpensesMap]       = useState({});   // { empId: { breakfast, lunch, dinner, petrol } }
    const [fuelTypeMap, setFuelTypeMap]       = useState({});   // { empId: 'Petrol'|'CNG'|'Diesel' }
    const [otherExpMap, setOtherExpMap]       = useState({});   // { empId: [{ expenseName, amount, files:[] }] }
    const [filePreviewMap, setFilePreviewMap] = useState({});   // { empId: { breakfast:[...], lunch:[...], ... } }
    const [expandedMap, setExpandedMap]       = useState({});   // show/hide expense row
    const [isSaving, setIsSaving]             = useState(false);
    const [savedAttendance, setSavedAttendance] = useState([]);
    const [adminLoggedInEmpIds, setAdminLoggedInEmpIds] = useState(new Set());
    const [isLinkedAdminMap, setIsLinkedAdminMap]       = useState({});
    const [isFetchingAttendance, setIsFetchingAttendance] = useState(true);

    // Compute IDs of all scheduled operatives + helpers
    const scheduledIds = useMemo(() => {
        const ids = new Set();
        daySchedules.forEach(s => {
            if (s.dayStatus === 'Rejected' || s.dayStatus === 'Skipped' || s.dayStatus === 'Paused') return;
            const opId = s.operative?._id || s.operative;
            if (opId) ids.add(String(opId));
            (s.helpers || []).forEach(h => {
                const hId = h._id || h;
                if (hId) ids.add(String(hId));
            });
        });
        return ids;
    }, [daySchedules]);

    // Employees NOT in the scheduler for this date — and who are Active
    const unscheduledEmployees = useMemo(() => {
        return employees.filter(e => {
            if (e.status === 'Deactive') return false;
            if (scheduledIds.has(String(e._id))) return false;
            const isAdmin = e.isLinkedAdmin || isLinkedAdminMap[String(e._id)];
            if (isAdmin && adminLoggedInEmpIds.has(String(e._id))) return false;
            return true;
        });
    }, [employees, scheduledIds, adminLoggedInEmpIds, isLinkedAdminMap]);

    // Fetch existing attendance for this date
    useEffect(() => {
        if (!attendanceDate) return;
        setIsFetchingAttendance(true);
        const fetchExisting = async () => {
            try {
                const res = await api.get(`/employee-expense/attendance?date=${attendanceDate}`);
                if (res.data.success) {
                    setSavedAttendance(res.data.data || []);
                    setAdminLoggedInEmpIds(new Set(res.data.adminLoggedInEmpIds || []));
                    setIsLinkedAdminMap(res.data.isLinkedAdminMap || {});
                    const map = {}; const rem = {}; const loc = {}; const exp = {};
                    (res.data.data || []).forEach(a => {
                        map[a.employeeId] = a.attendance;
                        rem[a.employeeId] = a.attendanceRemark || '';
                        loc[a.employeeId] = a.workLocation || '';
                        exp[a.employeeId] = a.expenses || { breakfast: 0, lunch: 0, dinner: 0, petrol: 0 };
                    });
                    setAttendanceMap(map);
                    setRemarks(rem);
                    setLocationMap(loc);
                    setExpensesMap(exp);
                }
            } catch (err) {
                // Silently handle
            } finally {
                setIsFetchingAttendance(false);
            }
        };
        fetchExisting();
    }, [attendanceDate]);

    const setStatus = (empId, status) => {
        setAttendanceMap(prev => ({ ...prev, [empId]: status }));
        // NOTE: location & expenses are independent — do NOT clear them on attendance change
    };
    const setRemark   = (empId, val) => setRemarks(prev => ({ ...prev, [empId]: val }));
    const setLocation = (empId, loc) => {
        const current = locationMap[empId] || '';
        if (current === loc) {
            // Check if expenses are empty before allowing unselect
            const exps = expensesMap[empId] || {};
            const otherExps = otherExpMap[empId] || [];
            const files = filePreviewMap[empId] || {};
            
            const hasExp = ['breakfast', 'lunch', 'dinner', 'petrol'].some(k => Number(exps[k]) > 0);
            const hasOther = otherExps.some(o => Number(o.amount) > 0 || (o.files && o.files.length > 0) || (o.expenseName && o.expenseName.trim() !== ''));
            const hasFiles = Object.values(files).some(arr => arr && arr.length > 0);
            
            if (!hasExp && !hasOther && !hasFiles) {
                setLocationMap(prev => ({ ...prev, [empId]: '' }));
                setExpandedMap(prev => ({ ...prev, [empId]: false }));
            } else {
                toast({
                    title: "Cannot unselect location",
                    description: "Please clear all expenses and files before unselecting the location.",
                    status: "warning",
                    position: "top-right",
                    duration: 3000
                });
            }
            return;
        }

        setLocationMap(prev => ({ ...prev, [empId]: loc }));

        if (loc === 'Home') {
            // When 'Home' is chosen: DO NOT allow expenses. Auto-collapse & reset expenses.
            setExpandedMap(prev => ({ ...prev, [empId]: false }));
            setExpensesMap(prev => ({ ...prev, [empId]: { breakfast: 0, lunch: 0, dinner: 0, petrol: 0 } }));
            setOtherExpMap(prev => ({ ...prev, [empId]: [] }));
            setFilePreviewMap(prev => ({ ...prev, [empId]: {} }));
        } else {
            // Auto-expand expense panel when Godown / Office / Room is chosen
            setExpandedMap(prev => ({ ...prev, [empId]: true }));
        }
    };
    const setExpenseItem = (empId, key, val) => {
        setExpensesMap(prev => ({ ...prev, [empId]: { ...(prev[empId] || {}), [key]: val } }));
    };
    const setFuelType = (empId, val) => setFuelTypeMap(prev => ({ ...prev, [empId]: val }));

    const getOtherExp = (empId) => otherExpMap[empId] || [];
    const addOtherExp = (empId) => {
        setOtherExpMap(prev => ({ ...prev, [empId]: [...(prev[empId] || []), { expenseName: '', amount: '', files: [] }] }));
    };
    const updateOtherExp = (empId, idx, field, val) => {
        setOtherExpMap(prev => {
            const rows = [...(prev[empId] || [])];
            rows[idx] = { ...rows[idx], [field]: val };
            return { ...prev, [empId]: rows };
        });
    };
    const removeOtherExp = (empId, idx) => {
        setOtherExpMap(prev => { const rows = [...(prev[empId] || [])]; rows.splice(idx, 1); return { ...prev, [empId]: rows }; });
    };
    const handleExpFile = (empId, expName, e) => {
        const files = Array.from(e.target.files);
        const previews = files.map(f => ({ name: f.name, type: f.type.startsWith('image') ? 'image' : 'file', url: URL.createObjectURL(f), file: f }));
        setFilePreviewMap(prev => ({ ...prev, [empId]: { ...(prev[empId] || {}), [expName]: [...((prev[empId] || {})[expName] || []), ...previews] } }));
    };
    const handleOtherFile = (empId, idx, e) => {
        const files = Array.from(e.target.files);
        const previews = files.map(f => ({ name: f.name, type: f.type.startsWith('image') ? 'image' : 'file', url: URL.createObjectURL(f), file: f }));
        setOtherExpMap(prev => {
            const rows = [...(prev[empId] || [])];
            rows[idx] = { ...rows[idx], files: [...(rows[idx].files || []), ...previews] };
            return { ...prev, [empId]: rows };
        });
    };
    const removeExpFile = (empId, expName, i) => {
        setFilePreviewMap(prev => { const k = { ...(prev[empId] || {}) }; k[expName] = (k[expName] || []).filter((_, j) => j !== i); return { ...prev, [empId]: k }; });
    };
    const toggleExpand = (empId) => {
        if (locationMap[empId] === 'Home') return;
        setExpandedMap(prev => ({ ...prev, [empId]: !prev[empId] }));
    };

    const handleSaveAttendance = async () => {
        const entries = unscheduledEmployees
            .filter(e => attendanceMap[e._id])
            .map(e => {
                const isHome = locationMap[e._id] === 'Home';
                return {
                    employeeId:       e._id,
                    date:             attendanceDate,
                    attendance:       attendanceMap[e._id],
                    attendanceRemark: remarks[e._id] || '',
                    workLocation:     locationMap[e._id] || '',
                    expenses:         isHome
                        ? { breakfast: 0, lunch: 0, dinner: 0, petrol: 0, fuelType: 'Petrol' }
                        : { ...(expensesMap[e._id] || { breakfast: 0, lunch: 0, dinner: 0, petrol: 0 }), fuelType: fuelTypeMap[e._id] || 'Petrol' },
                    otherExpensesList: isHome
                        ? []
                        : (otherExpMap[e._id] || []).map(r => ({ expenseName: r.expenseName, amount: Number(r.amount) || 0 }))
                };
            });

        if (entries.length === 0) {
            toast({ title: 'No Attendance Marked', description: 'Please mark attendance for at least one employee.', status: 'warning', position: 'top-right' });
            return;
        }

        setIsSaving(true);
        try {
            const res = await api.post('/employee-expense/bulk-attendance', { entries });
            if (res.data.success) {
                toast({ title: '✅ Attendance Saved', description: `${entries.length} record(s) saved successfully`, status: 'success', position: 'top-right', duration: 3000 });
                setSavedAttendance(res.data.data || entries);
                if (onRefresh) onRefresh();
            }
        } catch (err) {
            toast({ title: 'Error', description: err.response?.data?.message || 'Failed to save attendance', status: 'error', position: 'top-right' });
        } finally {
            setIsSaving(false);
        }
    };

    if (isFetchingAttendance || isLoading) {
        return (
            <Center py={10} bg="orange.50/40" borderRadius="2xl" border="1px dashed" borderColor="orange.200">
                <VStack spacing={3}>
                    <Spinner size="lg" color="orange.500" thickness="3.5px" speed="0.65s" />
                    <Text color="orange.700" fontWeight="bold" fontSize="xs">Loading Unscheduled Attendance Details...</Text>
                </VStack>
            </Center>
        );
    }

    if (unscheduledEmployees.length === 0) {
        return (
            <Center py={10} bg="green.50" borderRadius="2xl" border="1px dashed" borderColor="green.200">
                <VStack spacing={2}>
                    <Icon as={FaUserCheck} w={8} h={8} color="green.400" />
                    <Text color="green.600" fontWeight="bold" fontSize="sm">All employees are scheduled for this date!</Text>
                    <Text color="green.400" fontSize="xs">No unscheduled attendance to mark.</Text>
                </VStack>
            </Center>
        );
    }

    return (
        <Card borderRadius="2xl" shadow="md" border="1px solid" borderColor="orange.100" overflow="hidden">
            <CardBody p={0}>
                {!canWrite && (
                    <Alert status="warning" borderRadius="0">
                        <AlertIcon />
                        <Box>
                            <AlertTitle>Read-Only Mode</AlertTitle>
                            <AlertDescription fontSize="xs">
                                You do not have write/modify permissions for unscheduled attendance. Saving is disabled.
                            </AlertDescription>
                        </Box>
                    </Alert>
                )}
                <Box bg="linear-gradient(135deg, #f6ad55 0%, #ed8936 100%)" px={6} py={4}>
                    <HStack justify="space-between">
                        <HStack spacing={3}>
                            <Box bg="white" p={2} borderRadius="lg" shadow="sm">
                                <Icon as={FaClipboardList} color="orange.500" w={5} h={5} />
                            </Box>
                            <VStack align="start" spacing={0}>
                                <Heading size="sm" color="white">Unscheduled Employee Attendance</Heading>
                                <Text fontSize="xs" color="orange.100">Employees not assigned to any site today</Text>
                            </VStack>
                        </HStack>
                        <Badge bg="white" color="orange.600" fontSize="sm" px={3} py={1} borderRadius="full" fontWeight="black">
                            {unscheduledEmployees.length} Employees
                        </Badge>
                    </HStack>
                </Box>

                <Box p={4}>
                    <VStack spacing={3} align="stretch">
                        {unscheduledEmployees.map((emp, idx) => {
                            const status   = attendanceMap[emp._id] || '';
                            const location = locationMap[emp._id]   || '';
                            const expenses = expensesMap[emp._id]   || {};
                            const expanded = expandedMap[emp._id]   || false;
                            const saved    = savedAttendance.find(a => a.employeeId === emp._id);
                            const isPresent = status === 'Present';
                            const hasLocation = !!location;
                            const allowsExpenses = hasLocation && location !== 'Home';

                            return (
                                <Box
                                    key={emp._id}
                                    bg={idx % 2 === 0 ? 'white' : 'orange.50'}
                                    border="1px solid"
                                    borderColor={hasLocation ? 'orange.200' : 'gray.100'}
                                    borderRadius="xl"
                                    overflow="hidden"
                                    transition="all 0.2s"
                                    boxShadow={hasLocation ? 'sm' : 'none'}
                                >
                                    {/* ── Main Row ── */}
                                    <HStack px={4} py={3} spacing={3} wrap="wrap">
                                        {/* Dot + Name */}
                                        <HStack spacing={2} flex="1" minW="120px">
                                            <Box w={2} h={2} borderRadius="full" flexShrink={0}
                                                bg={status === 'Present' ? 'green.400' : status === 'Absent' ? 'red.400' : 'gray.200'}
                                            />
                                            <Text fontWeight="bold" fontSize="sm" color="gray.700">{emp.name}</Text>
                                            {saved && (
                                                <Badge colorScheme={saved.attendance === 'Present' ? 'green' : saved.attendance === 'Half Day' ? 'orange' : 'red'}
                                                    fontSize="9px" borderRadius="full" px={2}>Saved</Badge>
                                            )}
                                        </HStack>

                                        {/* Present / Absent Buttons */}
                                        <HStack spacing={2}>
                                            <Button
                                                size="xs" borderRadius="full" minW="52px"
                                                colorScheme={status === 'Present' ? 'green' : 'gray'}
                                                variant={status === 'Present' ? 'solid' : 'outline'}
                                                onClick={() => setStatus(emp._id, status === 'Present' ? '' : 'Present')}
                                                isDisabled={!canWrite}
                                            >
                                                {status === 'Present' ? '✓ P' : 'P'}
                                            </Button>
                                            <Button
                                                size="xs" borderRadius="full" minW="52px"
                                                colorScheme={status === 'Absent' ? 'red' : 'gray'}
                                                variant={status === 'Absent' ? 'solid' : 'outline'}
                                                onClick={() => setStatus(emp._id, status === 'Absent' ? '' : 'Absent')}
                                                isDisabled={!canWrite}
                                            >
                                                {status === 'Absent' ? '✓ A' : 'A'}
                                            </Button>
                                        </HStack>

                                        {/* HOME / GODOWN / OFFICE / ROOM — always visible, independent of attendance */}
                                        <HStack spacing={2}>
                                            <Button
                                                size="xs" borderRadius="full" minW="70px"
                                                leftIcon={<Icon as={FaHome} />}
                                                colorScheme={location === 'Home' ? 'blue' : 'gray'}
                                                variant={location === 'Home' ? 'solid' : 'outline'}
                                                onClick={() => setLocation(emp._id, 'Home')}
                                                isDisabled={!canWrite}
                                            >
                                                Home
                                            </Button>
                                            <Button
                                                size="xs" borderRadius="full" minW="76px"
                                                leftIcon={<Icon as={FaWarehouse} />}
                                                colorScheme={location === 'Godown' ? 'teal' : 'gray'}
                                                variant={location === 'Godown' ? 'solid' : 'outline'}
                                                onClick={() => setLocation(emp._id, 'Godown')}
                                                isDisabled={!canWrite}
                                            >
                                                Godown
                                            </Button>
                                            <Button
                                                size="xs" borderRadius="full" minW="70px"
                                                leftIcon={<Icon as={FaBuilding} />}
                                                colorScheme={location === 'Office' ? 'purple' : 'gray'}
                                                variant={location === 'Office' ? 'solid' : 'outline'}
                                                onClick={() => setLocation(emp._id, 'Office')}
                                                isDisabled={!canWrite}
                                            >
                                                Office
                                            </Button>
                                            <Button
                                                size="xs" borderRadius="full" minW="70px"
                                                leftIcon={<Icon as={FaBed} />}
                                                colorScheme={location === 'Room' ? 'pink' : 'gray'}
                                                variant={location === 'Room' ? 'solid' : 'outline'}
                                                onClick={() => setLocation(emp._id, 'Room')}
                                                isDisabled={!canWrite}
                                            >
                                                Room
                                            </Button>
                                        </HStack>

                                        {/* Remark */}
                                        <Input
                                            size="xs" borderRadius="lg" maxW="160px"
                                            placeholder="Remark..."
                                            value={remarks[emp._id] || ''}
                                            onChange={e => setRemark(emp._id, e.target.value)}
                                            isDisabled={!status || !canWrite}
                                        />

                                        {/* Expand expenses toggle — only when location is set and NOT Home */}
                                        {allowsExpenses && (
                                            <Tooltip label={expanded ? 'Hide expenses' : 'Add daily expenses'}>
                                                <Button
                                                    size="xs" variant="ghost"
                                                    colorScheme="orange"
                                                    rightIcon={<Icon as={expanded ? FaChevronUp : FaChevronDown} />}
                                                    onClick={() => toggleExpand(emp._id)}
                                                    isDisabled={!canWrite}
                                                >
                                                    Expenses
                                                </Button>
                                            </Tooltip>
                                        )}
                                    </HStack>

                                    {/* ── Expense Panel (collapsible) — only when allowsExpenses is true ── */}
                                    {allowsExpenses && expanded && (
                                        <Box mx={3} mb={3}>
                                            {/* Standard Meals & Travel */}
                                            <Card borderRadius="xl" shadow="sm" border="1px solid" borderColor="gray.100" mb={3}>
                                                <CardBody p={4}>
                                                    <Heading size="xs" mb={4} color="gray.700" display="flex" alignItems="center">
                                                        <Icon as={FaUtensils} mr={2} color="blue.500" /> Standard Meals &amp; Travel
                                                    </Heading>
                                                    <VStack spacing={3} align="stretch">
                                                        {['breakfast', 'lunch', 'dinner', 'petrol'].map(expName => (
                                                            <VStack key={expName} align="stretch" spacing={1} bg="gray.50" p={2} borderRadius="lg" border="1px solid" borderColor="gray.100">
                                                                <HStack align="center" w="full" justify="space-between">
                                                                    <FormLabel fontSize="sm" fontWeight="bold" textTransform="capitalize" m={0} minW="70px">
                                                                        {expName === 'petrol' ? 'Fuel' : expName}
                                                                    </FormLabel>
                                                                    {expName === 'petrol' && (
                                                                        <Select
                                                                            size="sm" w="90px"
                                                                            value={fuelTypeMap[emp._id] || 'Petrol'}
                                                                            onChange={e => setFuelType(emp._id, e.target.value)}
                                                                            borderRadius="lg" bg="white"
                                                                        >
                                                                            <option value="Petrol">Petrol</option>
                                                                            <option value="CNG">CNG</option>
                                                                            <option value="Diesel">Diesel</option>
                                                                        </Select>
                                                                    )}
                                                                    <HStack flex={1} maxW="160px">
                                                                        <InputGroup size="sm">
                                                                            <InputLeftElement>
                                                                                <Icon as={expName === 'petrol' ? FaGasPump : FaRupeeSign} color="gray.400" fontSize="xs" />
                                                                            </InputLeftElement>
                                                                            <Input
                                                                                type="number" placeholder="0" bg="white" borderRadius="lg"
                                                                                value={expenses[expName] === 0 || expenses[expName] === undefined ? '' : expenses[expName]}
                                                                                onChange={e => setExpenseItem(emp._id, expName, e.target.value === '' ? 0 : Number(e.target.value))}
                                                                                isDisabled={!canWrite}
                                                                            />
                                                                        </InputGroup>
                                                                    </HStack>
                                                                    <Tooltip label={`Upload ${expName} bills/photos`}>
                                                                        <IconButton
                                                                            icon={<Icon as={FaCloudUploadAlt} />}
                                                                            colorScheme="blue" variant="outline" size="sm" borderRadius="lg"
                                                                            onClick={() => document.getElementById(`uexp-${emp._id}-${expName}`).click()}
                                                                            isDisabled={!canWrite}
                                                                        />
                                                                    </Tooltip>
                                                                    <input type="file" id={`uexp-${emp._id}-${expName}`} hidden multiple
                                                                        onChange={e => handleExpFile(emp._id, expName, e)}
                                                                        accept="image/*,.pdf,.doc,.docx"
                                                                    />
                                                                </HStack>
                                                                {/* File previews */}
                                                                {((filePreviewMap[emp._id] || {})[expName] || []).length > 0 && (
                                                                    <HStack overflowX="auto" py={1} spacing={2}>
                                                                        {(filePreviewMap[emp._id][expName]).map((f, i) => (
                                                                            <Box key={i} position="relative" minW="36px" h="36px" borderRadius="md" overflow="hidden" border="1px solid" borderColor="gray.200" flexShrink={0}>
                                                                                {f.type === 'image'
                                                                                    ? <Image src={f.url} w="full" h="full" objectFit="cover" />
                                                                                    : <Center w="full" h="full" bg="gray.100"><Icon as={FaFileAlt} color="blue.500" /></Center>
                                                                                }
                                                                                <IconButton aria-label="view" icon={<Icon as={FaPaperclip} />} size="xs" colorScheme="blue"
                                                                                    position="absolute" bottom={0} left={0} opacity={0.85}
                                                                                    onClick={() => window.open(f.url, '_blank')}
                                                                                />
                                                                                <IconButton aria-label="remove" icon={<Icon as={FaTrash} />} size="xs" colorScheme="red"
                                                                                    position="absolute" top={0} right={0} opacity={0.85}
                                                                                    onClick={() => removeExpFile(emp._id, expName, i)}
                                                                                />
                                                                            </Box>
                                                                        ))}
                                                                    </HStack>
                                                                )}
                                                            </VStack>
                                                        ))}
                                                    </VStack>
                                                </CardBody>
                                            </Card>

                                            {/* Other Custom Expenses */}
                                            <Card borderRadius="xl" shadow="sm" border="1px solid" borderColor="gray.100">
                                                <CardBody p={4}>
                                                    <HStack justify="space-between" mb={3}>
                                                        <Heading size="xs" color="gray.700" display="flex" alignItems="center">
                                                            <Icon as={FaPlus} mr={2} color="green.500" /> Other Custom Expenses
                                                        </Heading>
                                                        <Button size="xs" colorScheme="green" variant="ghost" leftIcon={<FaPlus />}
                                                            onClick={() => addOtherExp(emp._id)} isDisabled={!canWrite}>
                                                            Add Row
                                                        </Button>
                                                    </HStack>
                                                    <VStack spacing={2}>
                                                        {getOtherExp(emp._id).length === 0 && (
                                                            <Text fontSize="xs" color="gray.400" textAlign="center" py={2}>No custom expenses added.</Text>
                                                        )}
                                                        {getOtherExp(emp._id).map((row, idx) => (
                                                            <VStack key={idx} w="full" bg="gray.50" p={2} borderRadius="lg" align="stretch" border="1px solid" borderColor="gray.100" spacing={1}>
                                                                <HStack>
                                                                    <Input placeholder="Expense Name" size="sm" bg="white" borderRadius="lg"
                                                                        value={row.expenseName}
                                                                        onChange={e => updateOtherExp(emp._id, idx, 'expenseName', e.target.value)}
                                                                        isDisabled={!canWrite}
                                                                    />
                                                                    <InputGroup size="sm" maxW="120px">
                                                                        <InputLeftElement><Icon as={FaRupeeSign} color="gray.400" /></InputLeftElement>
                                                                        <Input type="number" placeholder="Amount" bg="white" borderRadius="lg"
                                                                            value={row.amount}
                                                                            onChange={e => updateOtherExp(emp._id, idx, 'amount', e.target.value)}
                                                                            isDisabled={!canWrite}
                                                                        />
                                                                    </InputGroup>
                                                                    <Tooltip label="Upload bills">
                                                                        <IconButton size="sm" aria-label="upload"
                                                                            icon={<Icon as={FaCloudUploadAlt} />}
                                                                            colorScheme="blue" variant="outline" borderRadius="lg"
                                                                            onClick={() => document.getElementById(`uother-${emp._id}-${idx}`).click()}
                                                                            isDisabled={!canWrite}
                                                                        />
                                                                    </Tooltip>
                                                                    <input type="file" id={`uother-${emp._id}-${idx}`} hidden multiple
                                                                        onChange={e => handleOtherFile(emp._id, idx, e)}
                                                                        accept="image/*,.pdf,.doc,.docx"
                                                                    />
                                                                    <IconButton size="sm" aria-label="remove" colorScheme="red" variant="ghost"
                                                                        icon={<Icon as={FaTrash} />}
                                                                        onClick={() => removeOtherExp(emp._id, idx)}
                                                                        isDisabled={!canWrite}
                                                                    />
                                                                </HStack>
                                                                {/* File previews for other */}
                                                                {(row.files || []).length > 0 && (
                                                                    <HStack overflowX="auto" py={1} spacing={2}>
                                                                        {row.files.map((f, i) => (
                                                                            <Box key={i} position="relative" minW="36px" h="36px" borderRadius="md" overflow="hidden" border="1px solid" borderColor="gray.200" flexShrink={0}>
                                                                                {f.type === 'image'
                                                                                    ? <Image src={f.url} w="full" h="full" objectFit="cover" />
                                                                                    : <Center w="full" h="full" bg="gray.100"><Icon as={FaFileAlt} color="blue.500" /></Center>
                                                                                }
                                                                                <IconButton aria-label="view" icon={<Icon as={FaPaperclip} />} size="xs" colorScheme="blue"
                                                                                    position="absolute" bottom={0} left={0} opacity={0.85}
                                                                                    onClick={() => window.open(f.url, '_blank')}
                                                                                />
                                                                                <IconButton aria-label="remove" icon={<Icon as={FaTrash} />} size="xs" colorScheme="red"
                                                                                    position="absolute" top={0} right={0} opacity={0.85}
                                                                                    onClick={() => {
                                                                                        const newFiles = [...row.files];
                                                                                        newFiles.splice(i, 1);
                                                                                        updateOtherExp(emp._id, idx, 'files', newFiles);
                                                                                    }}
                                                                                />
                                                                            </Box>
                                                                        ))}
                                                                    </HStack>
                                                                )}
                                                            </VStack>
                                                        ))}
                                                    </VStack>
                                                </CardBody>
                                            </Card>
                                        </Box>
                                    )}
                                </Box>
                            );
                        })}
                    </VStack>

                    <Flex justify="flex-end" mt={4}>
                        <Button
                            colorScheme="orange"
                            leftIcon={<FaCheckCircle />}
                            borderRadius="xl"
                            shadow="md"
                            isLoading={isSaving}
                            loadingText="Saving..."
                            onClick={handleSaveAttendance}
                            isDisabled={!canWrite}
                        >
                            Save Attendance
                        </Button>
                    </Flex>
                </Box>
            </CardBody>
        </Card>
    );
};

// ── Money Transfer Module (Corrected Balance Logic) ────────────────────────
const MoneyTransferSection = ({ 
    employees, 
    onRefresh, 
    canWriteCreate = true,
    canReadView = true,
    canWriteView = true,
    canReadAttendance = true,
    canWriteAttendance = true,
    canReadCustomAccount = true,
    canWriteCustomAccount = true
}) => {
    const toast = useToast();
    const [stagedEntries, setStagedEntries] = useState([]);
    const [isSaving, setIsSaving] = useState(false);
    const [editIndex, setEditIndex] = useState(-1);
    
    const [transferDate, setTransferDate] = useState(new Date().toISOString().split('T')[0]);
    const [formData, setFormData] = useState({
        employee1: '',
        employee2: '',
        amount: ''
    });

    const [daySchedules, setDaySchedules] = useState([]);
    const [committedTransfers, setCommittedTransfers] = useState([]);
    const [transferAccounts, setTransferAccounts] = useState([]);
    const [newAccountName, setNewAccountName] = useState('');
    const [isAddingAccount, setIsAddingAccount] = useState(false);

    const isMatchingDate = (dateVal, targetDateStr) => {
        if (!dateVal || !targetDateStr) return false;
        
        const [year, month, day] = targetDateStr.split('-');
        const dStart = new Date();
        dStart.setFullYear(parseInt(year), parseInt(month) - 1, parseInt(day));
        dStart.setHours(0, 0, 0, 0);
        
        const nextDay = new Date(dStart);
        nextDay.setDate(dStart.getDate() + 1);

        const dObj = new Date(dateVal);
        return dObj >= dStart && dObj < nextDay;
    };

    const fetchTransferAccounts = async () => {
        try {
            const res = await api.get('/money-transfer-account');
            if (res.data.success) {
                setTransferAccounts(res.data.data || []);
            }
        } catch (err) {
            console.error("Failed to fetch transfer accounts", err);
        }
    };

    const handleAddTransferAccount = async () => {
        if (!newAccountName || !newAccountName.trim()) {
            toast({ title: 'Error', description: 'Please enter a name for the bank or custom account', status: 'error' });
            return;
        }
        setIsAddingAccount(true);
        try {
            const res = await api.post('/money-transfer-account', { name: newAccountName.trim() });
            if (res.data.success) {
                toast({ title: 'Account Added', description: `Added "${newAccountName.trim()}" starting with ₹0 balance.`, status: 'success' });
                setNewAccountName('');
                await fetchTransferAccounts();
                if (onRefresh) onRefresh();
            }
        } catch (err) {
            toast({ title: 'Error', description: err.response?.data?.message || 'Failed to add account', status: 'error' });
        } finally {
            setIsAddingAccount(false);
        }
    };

    const handleDeleteTransferAccount = async (id, name) => {
        if (!window.confirm(`Are you sure you want to remove custom account "${name}"?`)) return;
        try {
            const res = await api.delete(`/money-transfer-account/${id}`);
            if (res.data.success) {
                toast({ title: 'Account Removed', status: 'success' });
                await fetchTransferAccounts();
                if (onRefresh) onRefresh();
            }
        } catch (err) {
            toast({ title: 'Error', description: 'Failed to remove account', status: 'error' });
        }
    };

    const fetchCommittedTransfers = async () => {
        try {
            const res = await api.get('/employee-transfer');
            if (res.data.success) {
                const matched = res.data.data.filter(t => {
                    return isMatchingDate(t.date, transferDate);
                });
                setCommittedTransfers(matched);
            }
        } catch (err) {
            console.error("Failed to fetch committed transfers", err);
        }
    };

    useEffect(() => {
        fetchTransferAccounts();
    }, []);

    useEffect(() => {
        if (!transferDate) return;
        const fetchDaySchedules = async () => {
            try {
                const res = await api.get(`/schedule-master?date=${transferDate}`);
                if (res.data.success) {
                    const exactMatches = res.data.data.filter(s => {
                        return isMatchingDate(s.scheduleDate, transferDate);
                    });
                    setDaySchedules(exactMatches);
                } else {
                    setDaySchedules([]);
                }
            } catch (err) {
                console.error("Failed to fetch day schedules for transfer", err);
                setDaySchedules([]);
            }
        };
        fetchDaySchedules();
        fetchCommittedTransfers();
    }, [transferDate]);

    // Filter employees down to scheduled operatives on this date (excluding helpers)
    const scheduledEmployees = useMemo(() => {
        const ids = new Set();
        daySchedules.forEach(s => {
            if (s.operative?._id) ids.add(s.operative._id);
            else if (s.operative) ids.add(s.operative);
        });
        return employees.filter(e => ids.has(e._id));
    }, [daySchedules, employees]);

    // Compute Temporary Balances in Real-time
    const tempBalances = useMemo(() => {
        const balances = {};
        employees.forEach(emp => {
            balances[emp._id] = emp.totalAmount || 0;
        });
        transferAccounts.forEach(acc => {
            balances[acc._id] = acc.totalAmount || 0;
        });

        stagedEntries.forEach((entry, index) => {
            if (index === editIndex) return; 
            if (balances[entry.employee1] !== undefined) balances[entry.employee1] -= entry.amount;
            if (balances[entry.employee2] !== undefined) balances[entry.employee2] += entry.amount;
        });

        return balances;
    }, [employees, transferAccounts, stagedEntries, editIndex]);

    const handleAddEntry = () => {
        const { employee1, employee2, amount } = formData;
        const numAmount = Number(amount);
        
        if (!employee1 || !employee2 || !amount || !transferDate) {
            toast({ title: 'Error', description: 'Please fill all fields', status: 'error', position: 'top-right' });
            return;
        }

        if (numAmount <= 0) {
            toast({ title: 'Error', description: 'Amount must be greater than 0', status: 'error', position: 'top-right' });
            return;
        }

        if (employee1 === employee2) {
            toast({ title: 'Error', description: 'Sender and Receiver cannot be the same', status: 'error', position: 'top-right' });
            return;
        }

        const allEntities = [...employees, ...transferAccounts];
        const e1 = allEntities.find(e => e._id === employee1);
        const e2 = allEntities.find(e => e._id === employee2);

        const isE1Bank = transferAccounts.some(a => a._id === employee1);
        const isE2Bank = transferAccounts.some(a => a._id === employee2);

        const newEntry = {
            employee1,
            employee2,
            employee1Name: e1?.name ? `${e1.name}${isE1Bank ? ' (BANK)' : ''}` : '',
            employee2Name: e2?.name ? `${e2.name}${isE2Bank ? ' (BANK)' : ''}` : '',
            amount: numAmount,
            date: transferDate
        };

        if (editIndex > -1) {
            const updated = [...stagedEntries];
            updated[editIndex] = newEntry;
            setStagedEntries(updated);
            setEditIndex(-1);
            toast({ title: 'Entry Updated', status: 'info', duration: 2000 });
        } else {
            setStagedEntries([...stagedEntries, newEntry]);
            toast({ title: 'Entry Added', status: 'success', duration: 2000 });
        }
        
        setFormData({ employee1: '', employee2: '', amount: '' });
    };

    const handleEdit = (index) => {
        const entry = stagedEntries[index];
        setFormData({
            employee1: entry.employee1,
            employee2: entry.employee2,
            amount: entry.amount.toString()
        });
        setTransferDate(entry.date);
        setEditIndex(index);
    };

    const handleRemove = (index) => {
        setStagedEntries(stagedEntries.filter((_, i) => i !== index));
    };

    const handleSubmitAll = async () => {
        if (stagedEntries.length === 0) return;
        
        setIsSaving(true);
        try {
            const transfers = stagedEntries.map(e => ({
                giver: e.employee1,
                taker: e.employee2,
                amount: e.amount,
                date: e.date
            }));

            const res = await api.post('/employee-transfer/bulk', { transfers });
            if (res.data.success) {
                toast({ title: 'Success', description: `${stagedEntries.length} transfers saved`, status: 'success', isClosable: true });
                await onRefresh();
                await fetchCommittedTransfers();
                await fetchTransferAccounts();
                setStagedEntries([]);
            }
        } catch (err) {
            toast({ title: 'Error', description: err.response?.data?.message || 'Save failed', status: 'error' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteCommittedTransfer = async (transferId) => {
        if (!window.confirm("Are you sure you want to delete this transfer? This will revert the balances of the sender and receiver.")) {
            return;
        }

        try {
            const res = await api.delete(`/employee-transfer/${transferId}`);
            if (res.data.success) {
                toast({ title: 'Transfer Deleted', description: 'Reverted sender & receiver balances.', status: 'success' });
                await onRefresh();
                await fetchCommittedTransfers();
                await fetchTransferAccounts();
            }
        } catch (err) {
            toast({ title: 'Error', description: err.response?.data?.message || 'Delete failed', status: 'error' });
        }
    };

    return (
        <VStack spacing={8} align="stretch">
            {!canWriteCreate && (
                <Alert status="warning" borderRadius="2xl" shadow="md">
                    <AlertIcon />
                    <Box>
                        <AlertTitle>Read-Only Mode (Create Transfer)</AlertTitle>
                        <AlertDescription fontSize="xs">
                            You do not have write/modify permissions to create money transfers. Saving or adding staged transfers is disabled.
                        </AlertDescription>
                    </Box>
                </Alert>
            )}

            {/* Custom Accounts Management for Money Transfer */}
            {canReadCustomAccount && (
            <Card borderRadius="2xl" shadow="md" border="1px solid" borderColor="blue.100" bg="blue.50" overflow="hidden">
                <CardBody p={5}>
                    <VStack align="stretch" spacing={4}>
                        <Flex justify="space-between" align={{ base: 'start', md: 'center' }} direction={{ base: 'column', md: 'row' }} gap={4}>
                            <VStack align="start" spacing={1}>
                                <HStack>
                                    <Icon as={FaBuilding} color="blue.600" />
                                    <Text fontSize="md" fontWeight="black" color="blue.800">Custom Names / Bank Accounts (Starts with ₹0)</Text>
                                </HStack>
                                <Text fontSize="xs" color="blue.600">
                                    Add banks, petty cash, or custom names to use right inside Sender & Receiver without adding to Employee Master.
                                </Text>
                            </VStack>
                            <HStack spacing={2} w={{ base: 'full', md: 'auto' }}>
                                <Input
                                    placeholder="Enter Bank or Account Name..."
                                    value={newAccountName}
                                    onChange={(e) => setNewAccountName(e.target.value)}
                                    bg="white"
                                    size="md"
                                    borderRadius="xl"
                                    w={{ base: 'full', md: '260px' }}
                                    isDisabled={!canWriteCustomAccount}
                                />
                                <Button
                                    colorScheme="blue"
                                    size="md"
                                    borderRadius="xl"
                                    onClick={handleAddTransferAccount}
                                    isLoading={isAddingAccount}
                                    isDisabled={!canWriteCustomAccount}
                                    leftIcon={<FaPlus />}
                                    px={6}
                                >
                                    Add Account
                                </Button>
                            </HStack>
                        </Flex>

                        {transferAccounts.length > 0 && (
                            <Box pt={2} borderTop="1px dashed" borderColor="blue.200">
                                <Text fontSize="2xs" fontWeight="black" color="blue.700" textTransform="uppercase" mb={2}>Configured Custom Accounts / Banks:</Text>
                                <HStack spacing={2} flexWrap="wrap" gap={2}>
                                    {transferAccounts.map(acc => (
                                        <Badge
                                            key={acc._id}
                                            colorScheme="blue"
                                            variant="subtle"
                                            px={3}
                                            py={1.5}
                                            borderRadius="xl"
                                            fontSize="xs"
                                            display="flex"
                                            alignItems="center"
                                            gap={2}
                                            bg="white"
                                            border="1px solid"
                                            borderColor="blue.200"
                                            shadow="xs"
                                        >
                                            <Icon as={FaBuilding} color="blue.500" />
                                            <Text fontWeight="bold">{acc.name}</Text>
                                            <Text color={tempBalances[acc._id] >= 0 ? 'green.600' : 'red.500'} fontWeight="black">
                                                (₹{tempBalances[acc._id]?.toLocaleString()})
                                            </Text>
                                            {canWriteCustomAccount && (
                                                <Icon
                                                    as={FaTrash}
                                                    color="red.400"
                                                    cursor="pointer"
                                                    _hover={{ color: 'red.600' }}
                                                    onClick={() => handleDeleteTransferAccount(acc._id, acc.name)}
                                                    title="Remove account"
                                                />
                                            )}
                                        </Badge>
                                    ))}
                                </HStack>
                            </Box>
                        )}
                    </VStack>
                </CardBody>
            </Card>
            )}


            {/* Entry Form - One Row Layout */}
            <Card borderRadius="2xl" shadow="md" border="1px solid" borderColor="gray.100" overflow="hidden">
                <CardBody p={6} bg="white">
                    <VStack spacing={6} align="stretch">
                        <FormControl isRequired maxW="300px">
                            <FormLabel fontSize="xs" fontWeight="black" color="gray.500" textTransform="uppercase">Transaction Date (Applies to all entries below)</FormLabel>
                            <InputGroup size="lg">
                                <InputLeftElement><Icon as={FaCalendarAlt} color="blue.400" /></InputLeftElement>
                                <Input type="date" value={transferDate} onChange={(e) => setTransferDate(e.target.value)} borderRadius="xl" bg="gray.50" border="1px solid" borderColor="gray.200" />
                            </InputGroup>
                        </FormControl>

                        <Divider />

                        <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4} alignItems="flex-end" w="full">

                        <FormControl isRequired>
                            <FormLabel fontSize="xs" fontWeight="black" color="gray.500" textTransform="uppercase">
                                Sender {formData.employee1 && <Badge ml={2} colorScheme="red">Avail: ₹{tempBalances[formData.employee1]?.toLocaleString()}</Badge>}
                            </FormLabel>
                            <Select 
                                placeholder="Choose Sender" 
                                value={formData.employee1} 
                                onChange={(e) => setFormData({...formData, employee1: e.target.value})} 
                                borderRadius="xl"
                                size="lg"
                                bg="gray.50"
                                border="1px solid"
                                borderColor="gray.200"
                            >
                                {transferAccounts.map(a => (
                                    <option key={a._id} value={a._id} disabled={a._id === formData.employee2}>
                                        {a.name} (BANK) (₹{tempBalances[a._id]?.toLocaleString()})
                                    </option>
                                ))}
                                {employees.filter(e => e.status !== 'Deactive' || e._id === formData.employee1).map(e => (
                                    <option key={e._id} value={e._id} disabled={e._id === formData.employee2}>
                                        {e.name} (₹{tempBalances[e._id]?.toLocaleString()})
                                    </option>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl isRequired>
                            <FormLabel fontSize="xs" fontWeight="black" color="gray.500" textTransform="uppercase">
                                Receiver {formData.employee2 && <Badge ml={2} colorScheme="green">New Bal: ₹{tempBalances[formData.employee2]?.toLocaleString()}</Badge>}
                            </FormLabel>
                            <Select 
                                placeholder="Choose Receiver" 
                                value={formData.employee2} 
                                onChange={(e) => setFormData({...formData, employee2: e.target.value})} 
                                borderRadius="xl"
                                size="lg"
                                bg="gray.50"
                                border="1px solid"
                                borderColor="gray.200"
                            >
                                {transferAccounts.map(a => (
                                    <option key={a._id} value={a._id} disabled={a._id === formData.employee1}>
                                        {a.name} (BANK) (₹{tempBalances[a._id]?.toLocaleString()})
                                    </option>
                                ))}
                                {employees.filter(e => e.status !== 'Deactive' || e._id === formData.employee2).map(e => (
                                    <option key={e._id} value={e._id} disabled={e._id === formData.employee1}>
                                        {e.name} (₹{tempBalances[e._id]?.toLocaleString()})
                                    </option>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl isRequired>
                            <FormLabel fontSize="xs" fontWeight="black" color="gray.500" textTransform="uppercase">Amount (₹)</FormLabel>
                            <InputGroup size="lg">
                                <InputLeftElement><Icon as={FaRupeeSign} color="gray.400" /></InputLeftElement>
                                <Input type="number" placeholder="0" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} borderRadius="xl" bg="gray.50" border="1px solid" borderColor="gray.200" />
                            </InputGroup>
                        </FormControl>

                        <Button colorScheme="blue" size="lg" borderRadius="xl" onClick={handleAddEntry} leftIcon={editIndex > -1 ? <FaCheckCircle /> : <FaPlus />} isDisabled={!canWriteCreate} shadow="lg">
                            {editIndex > -1 ? 'Update' : 'Add'}
                        </Button>
                    </SimpleGrid>
                </VStack>
            </CardBody>
        </Card>

            {/* Entry Table */}
            {stagedEntries.length > 0 && (
                <Box>
                    <HStack justify="space-between" mb={4} px={2}>
                        <VStack align="start" spacing={0}>
                            <Heading size="md" color="gray.700">Transfer Summary</Heading>
                            <Text fontSize="xs" color="gray.400">Balances shown below are temporary previews.</Text>
                        </VStack>
                        <Badge colorScheme="blue" fontSize="md" px={4} py={1} borderRadius="full">Total Items: {stagedEntries.length}</Badge>
                    </HStack>

                    <Card borderRadius="2xl" shadow="sm" border="1px solid" borderColor="gray.100" overflow="hidden">
                        <TableContainer overflowX="auto">
                            <Table variant="simple">
                                <Thead bg="gray.50">
                                    <Tr>
                                        <Th color="gray.500">Date</Th>
                                        <Th color="gray.500">Employee From (Sender)</Th>
                                        <Th color="gray.500">Employee To (Receiver)</Th>
                                        <Th isNumeric color="gray.500">Amount</Th>
                                        <Th textAlign="center" color="gray.500">Actions</Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    {stagedEntries.map((entry, idx) => (
                                        <Tr key={idx} _hover={{ bg: "blue.50" }} transition="background 0.2s" opacity={editIndex === idx ? 0.5 : 1}>
                                            <Td fontSize="sm" fontWeight="medium">{new Date(entry.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</Td>
                                            <Td fontWeight="bold" color="red.500"><HStack><Icon as={FaUserTie} /><Text>{entry.employee1Name}</Text></HStack></Td>
                                            <Td fontWeight="bold" color="green.500"><HStack><Icon as={FaUserTie} /><Text>{entry.employee2Name}</Text></HStack></Td>
                                            <Td isNumeric fontWeight="black" fontSize="lg">₹{entry.amount.toLocaleString()}</Td>
                                            <Td>
                                                <HStack justify="center" spacing={4}>
                                                    <IconButton size="sm" colorScheme="blue" variant="ghost" icon={<FaEdit />} onClick={() => handleEdit(idx)} borderRadius="lg" isDisabled={!canWriteCreate || (editIndex > -1 && editIndex !== idx)} />
                                                    <IconButton size="sm" colorScheme="red" variant="ghost" icon={<FaTrash />} onClick={() => handleRemove(idx)} borderRadius="lg" isDisabled={!canWriteCreate || (editIndex > -1 && editIndex !== idx)} />
                                                </HStack>
                                            </Td>
                                        </Tr>
                                    ))}
                                </Tbody>
                            </Table>
                        </TableContainer>
                    </Card>

                    <Button mt={8} colorScheme="green" size="xl" w="full" h="70px" borderRadius="2xl" onClick={handleSubmitAll} isLoading={isSaving} isDisabled={!canWriteCreate} leftIcon={<FaCheckCircle />} fontSize="xl" shadow="2xl">
                        Save & Commit All {stagedEntries.length} Transfers
                    </Button>
                </Box>
            )}

            {/* ── Attendance Panel for Unscheduled Employees ── */}
            {canReadAttendance && (
                <UnscheduledAttendancePanel
                    employees={employees}
                    daySchedules={daySchedules}
                    attendanceDate={transferDate}
                    canWrite={canWriteAttendance}
                    onRefresh={onRefresh}
                />
            )}

            {/* Committed Transfers List */}
            {canReadView && (
                <Box mt={8} w="full">
                    <HStack justify="space-between" mb={4} px={2}>
                        <VStack align="start" spacing={0}>
                            <Heading size="md" color="teal.700">Committed Money Transfers</Heading>
                            <Text fontSize="xs" color="gray.400">Transfers already saved & recorded in the database for this date.</Text>
                        </VStack>
                        <Badge colorScheme="teal" fontSize="md" px={4} py={1} borderRadius="full">Saved Items: {committedTransfers.length}</Badge>
                    </HStack>

                    {committedTransfers.length === 0 ? (
                        <Center py={10} bg="white" borderRadius="2xl" border="1px dashed" borderColor="gray.200">
                            <VStack spacing={2}>
                                <Icon as={FaMoneyBillWave} w={8} h={8} color="gray.300" />
                                <Text color="gray.400" fontSize="sm">No saved transfers found for this date.</Text>
                            </VStack>
                        </Center>
                    ) : (
                        <Card borderRadius="2xl" shadow="sm" border="1px solid" borderColor="gray.100" overflow="hidden">
                            <TableContainer overflowX="auto">
                                <Table variant="simple">
                                    <Thead bg="teal.50">
                                        <Tr>
                                            <Th color="teal.700">Sender (From)</Th>
                                            <Th color="teal.700">Receiver (To)</Th>
                                            <Th isNumeric color="teal.700">Amount</Th>
                                            <Th textAlign="center" color="teal.700">Actions</Th>
                                        </Tr>
                                    </Thead>
                                    <Tbody bg="white">
                                        {committedTransfers.map((t) => (
                                            <Tr key={t._id} _hover={{ bg: "teal.50" }} transition="background 0.2s">
                                                <Td fontWeight="bold" color="red.500">
                                                    <HStack>
                                                        <Icon as={transferAccounts?.some(a => String(a._id) === String(t.giver?._id || t.giver)) ? FaBuilding : FaUserTie} />
                                                        <Text>{t.giver?.name || 'Unknown'}{transferAccounts?.some(a => String(a._id) === String(t.giver?._id || t.giver)) ? ' (BANK)' : ''}</Text>
                                                    </HStack>
                                                </Td>
                                                <Td fontWeight="bold" color="green.500">
                                                    <HStack>
                                                        <Icon as={transferAccounts?.some(a => String(a._id) === String(t.taker?._id || t.taker)) ? FaBuilding : FaUserTie} />
                                                        <Text>{t.taker?.name || 'Unknown'}{transferAccounts?.some(a => String(a._id) === String(t.taker?._id || t.taker)) ? ' (BANK)' : ''}</Text>
                                                    </HStack>
                                                </Td>
                                                <Td isNumeric fontWeight="black" fontSize="lg" color="teal.600">₹{t.amount?.toLocaleString()}</Td>
                                                <Td>
                                                    <HStack justify="center">
                                                        <IconButton
                                                            size="sm"
                                                            colorScheme="red"
                                                            variant="ghost"
                                                            icon={<Icon as={FaTrash} />}
                                                            aria-label="Delete Transfer"
                                                            onClick={() => handleDeleteCommittedTransfer(t._id)}
                                                            isDisabled={!canWriteView}
                                                            borderRadius="lg"
                                                        />
                                                    </HStack>
                                                </Td>
                                            </Tr>
                                        ))}
                                    </Tbody>
                                </Table>
                            </TableContainer>
                        </Card>
                    )}
                </Box>
            )}
        </VStack>
    );
};

export default EmployeeExpensesModule;
