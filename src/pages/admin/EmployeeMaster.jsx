import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
    Box, Container, Heading, Text, SimpleGrid, Icon, Stack, Flex, Button, Card, CardBody,
    FormControl, FormLabel, Input, VStack, useToast, Image, HStack, IconButton,
    Tabs, TabList, TabPanels, Tab, TabPanel, Table, Thead, Tbody, Tr, Th, Td, TableContainer, Wrap,
    Tooltip, Progress, Skeleton,
    useDisclosure, AlertDialog, AlertDialogBody, AlertDialogFooter, AlertDialogHeader, AlertDialogContent, AlertDialogOverlay,
    Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
    Checkbox, Badge, InputGroup, InputLeftElement, InputRightElement, Spinner, Select, Center, Divider, Avatar,
    Textarea
} from '@chakra-ui/react';
import {
    FaUserTie, FaBuilding, FaCloudUploadAlt, FaFilePdf, FaFileImage, FaEye, FaPlus,
    FaCamera, FaMoneyBillWave, FaIdBadge, FaPhoneAlt, FaEnvelope, FaMapMarkerAlt,
    FaIdCard, FaTrash, FaCheckCircle, FaTimes, FaThLarge, FaList, FaEdit, FaUsers,
    FaFileExcel, FaCopy, FaPrint, FaCar, FaExternalLinkAlt, FaHeartbeat, FaBriefcase,
    FaFileAlt, FaShieldAlt, FaMedkit, FaRing, FaBirthdayCake, FaTint, FaVenusMars, FaCodeBranch,
    FaSitemap, FaLaptop, FaUserShield, FaCalendarAlt, FaChartLine, FaCalendarCheck, FaMoneyCheckAlt, FaDownload
} from 'react-icons/fa';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { hasPermission } from '../../utils/permissions';
import AdminLoginReportView from '../../components/admin/AdminLoginReportView';
import ModulePermissionBar from '../../components/admin/ModulePermissionBar';

export const getFileUrl = (docOrPath) => {
    if (!docOrPath) return '';
    let rawPath = typeof docOrPath === 'object' ? (docOrPath.url || '') : docOrPath;
    if (typeof rawPath !== 'string' || !rawPath) return '';
    if (rawPath.startsWith('http://') || rawPath.startsWith('https://') || rawPath.startsWith('blob:') || rawPath.startsWith('data:')) {
        return rawPath;
    }
    const cleanPath = rawPath.startsWith('/') ? rawPath : '/' + rawPath;
    if (import.meta.env.VITE_API_BASE_URL) {
        const base = import.meta.env.VITE_API_BASE_URL.replace(/\/$/, '');
        if (base.endsWith('/api') && cleanPath.startsWith('/api/')) {
            return base + cleanPath.slice(4);
        }
        return base + cleanPath;
    }
    return cleanPath;
};

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '')
    .replace(/\/api\/?$/, '')
    .replace(/\/$/, '');

const EmployeeMaster = ({ isInsideServices = false }) => {

    const toast = useToast();
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [pincodeLoading1, setPincodeLoading1] = useState(false);
    const [pincodeLoading2, setPincodeLoading2] = useState(false);
    const [nextEmpId, setNextEmpId] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        company: '',
        branch: '',
        dob: '',
        bloodGroup: '',
        gender: '',
        maritalStatus: 'Single',
        marriageDate: '',
        joiningDate: '',
        reportedTo: '',
        insuranceNumber: '',
        insuranceProvider: '',
        insuranceExpiry: '',
        mediclaimNumber: '',
        mediclaimProvider: '',
        mediclaimExpiry: '',
        issuedItems: '',
        companyRemarks: '',
        addressLine1: { street: '', city: '', pincode: '' },
        addressLine2: { street: '', city: '', pincode: '' },
        emergencyContact: { name: '', phone: '' },
        bankName: '',
        accountName: '',
        accountNumber: '',
        confirmAccountNumber: '',
        ifscCode: '',
        salary: '',
        salaryDate: '',
        salaryStartDate: '',
        salaryEndDate: '',
        salaryIncrementDate: '',
        previousSalary: '',
        designation: '',
        paymentMode: 'Cash',
        paymentStatus: 'Pending',
        foodAllowance: 'Food',
        status: 'Active',
        aadharNumber: '',
        panNumber: '',
        voterIdNumber: '',
        drivingLicenseNumber: '',
    });
    const [files, setFiles] = useState({
        photo: null,
        aadharCard: null,
        panCard: null,
        voterId: null,
        drivingLicense: null,
        resume: null,
        joiningLetter: null,
        salarySlips: [],
        bankDocuments: [],
        insuranceDocs: [],
        mediclaimDocs: [],
        companyItemDocs: []
    });
    const [photoPreview, setPhotoPreview] = useState(null);
    const [existingDocs, setExistingDocs] = useState({
        aadharCard: null,
        panCard: null,
        voterId: null,
        drivingLicense: null,
        resume: null,
        resumes: [],
        joiningLetter: null,
        joiningLetters: [],
        salarySlips: [],
        bankDocuments: [],
        insuranceDocs: [],
        mediclaimDocs: [],
        companyItemDocs: []
    });
    const [companyList, setCompanyList] = useState([]);
    const [branchList, setBranchList] = useState([
        'Head Office', 'Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Gandhinagar', 'Mumbai', 'Site Office'
    ]);
    const [isAddCompanyOpen, setIsAddCompanyOpen] = useState(false);
    const [newCompanyName, setNewCompanyName] = useState('');
    const [isAddBranchOpen, setIsAddBranchOpen] = useState(false);
    const [newBranchName, setNewBranchName] = useState('');

    const calculateAge = (dobString) => {
        if (!dobString) return null;
        const dob = new Date(dobString);
        if (isNaN(dob.getTime())) return null;
        const today = new Date();
        let age = today.getFullYear() - dob.getFullYear();
        const m = today.getMonth() - dob.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
            age--;
        }
        return age >= 0 ? age : null;
    };
    const [sameAsAddress, setSameAsAddress] = useState(false);
    const [bankVerified, setBankVerified] = useState(false);
    const [bankVerifying, setBankVerifying] = useState(false);
    const [accountVerified, setAccountVerified] = useState(false);
    const [accountVerifying, setAccountVerifying] = useState(false);
    const [employees, setEmployees] = useState([]);
    const [editId, setEditId] = useState('');
    const [viewEmployee, setViewEmployee] = useState(null);
    const [activeProfileTab, setActiveProfileTab] = useState('personal');
    const salarySlipInputRef = useRef(null);
    const [isIncrementModalOpen, setIsIncrementModalOpen] = useState(false);
    const [incrementForm, setIncrementForm] = useState({
        newSalary: '',
        incrementAmount: '',
        incrementDate: new Date().toISOString().split('T')[0],
        remarks: ''
    });
    const [isSubmittingIncrement, setIsSubmittingIncrement] = useState(false);
    const [isUpdatingSalaryDate, setIsUpdatingSalaryDate] = useState(false);
    const [isUploadingSlip, setIsUploadingSlip] = useState(false);
    const [isSavingSalaryPeriod, setIsSavingSalaryPeriod] = useState(false);
    const [isUpdatingCurrentPayout, setIsUpdatingCurrentPayout] = useState(false);
    const [salaryPeriodState, setSalaryPeriodState] = useState({
        startDate: '',
        endDate: '',
        disbursementDate: ''
    });

    useEffect(() => {
        if (viewEmployee) {
            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const lastDay = new Date(year, today.getMonth() + 1, 0).getDate();
            const defaultStart = `${year}-${month}-01`;
            const defaultEnd = `${year}-${month}-${String(lastDay).padStart(2, '0')}`;
            const defaultDisburse = `${year}-${month}-05`;

            setSalaryPeriodState({
                startDate: viewEmployee.salaryStartDate || defaultStart,
                endDate: viewEmployee.salaryEndDate || defaultEnd,
                disbursementDate: viewEmployee.salaryDate || defaultDisburse
            });
        }
    }, [viewEmployee?._id, viewEmployee?.salaryStartDate, viewEmployee?.salaryEndDate, viewEmployee?.salaryDate]);

    // Calculate active salary period where deactive dates are excluded from service
    const calculateActiveSalaryPeriod = (emp, customStart, customEnd) => {
        if (!emp) return { startDate: '', endDate: '', totalDays: 0, deactiveDays: 0, activeDays: 0, baseSalary: 0, payableSalary: 0 };
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const lastDay = new Date(year, today.getMonth() + 1, 0).getDate();

        const startStr = customStart || emp.salaryStartDate || `${year}-${month}-01`;
        const endStr = customEnd || emp.salaryEndDate || `${year}-${month}-${String(lastDay).padStart(2, '0')}`;

        const startDate = new Date(startStr);
        const endDate = new Date(endStr);

        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()) || startDate > endDate) {
            const base = Number(emp.salary) || 0;
            return {
                startDate: startStr,
                endDate: endStr,
                totalDays: 30,
                deactiveDays: 0,
                activeDays: 30,
                baseSalary: base,
                payableSalary: base
            };
        }

        const diffTime = Math.abs(endDate - startDate);
        const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

        const history = Array.isArray(emp.statusHistory) && emp.statusHistory.length > 0
            ? [...emp.statusHistory].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
            : [];

        let deactiveDays = 0;
        const cur = new Date(startDate);
        while (cur <= endDate) {
            let dayStatus = emp.status || 'Active';
            if (history.length > 0) {
                const curEndOfDay = new Date(cur.getFullYear(), cur.getMonth(), cur.getDate(), 23, 59, 59);
                const applicable = history.filter(h => new Date(h.timestamp) <= curEndOfDay);
                if (applicable.length > 0) {
                    dayStatus = applicable[applicable.length - 1].status;
                } else {
                    dayStatus = history[0].status;
                }
            }
            if (dayStatus === 'Deactive') {
                deactiveDays++;
            }
            cur.setDate(cur.getDate() + 1);
        }

        const activeDays = Math.max(0, totalDays - deactiveDays);
        const baseSalary = Number(emp.salary) || 0;
        const payableSalary = totalDays > 0 ? Math.round((baseSalary / totalDays) * activeDays) : 0;

        return {
            startDate: startStr,
            endDate: endStr,
            totalDays,
            deactiveDays,
            activeDays,
            baseSalary,
            payableSalary
        };
    };

    const calculateTotalPayAmount = (emp) => {
        if (!emp) return { totalPaid: 0, paidMonthsCount: 0, pendingAmount: 0, pendingMonthsCount: 0 };
        const payments = Array.isArray(emp.monthlyPayments) ? emp.monthlyPayments : [];
        let totalPaid = 0;
        let paidMonthsCount = 0;
        let pendingAmount = 0;
        let pendingMonthsCount = 0;

        payments.forEach(p => {
            const base = Number(emp.salary || 0);
            const present = p.presentDays !== null && p.presentDays !== undefined ? Number(p.presentDays) : null;
            const upad = Number(p.upad || 0);
            const incentive = Number(p.incentive || 0);
            let amount = 0;
            if (p.payableAmount !== undefined && p.payableAmount !== null) {
                amount = Number(p.payableAmount);
            } else if (present !== null) {
                amount = Math.round((base / 30) * present) - upad + incentive;
            } else {
                amount = base - upad + incentive;
            }

            if (p.paymentStatus === 'Done') {
                totalPaid += Math.max(0, amount);
                paidMonthsCount++;
            } else {
                pendingAmount += Math.max(0, amount);
                pendingMonthsCount++;
            }
        });

        return { totalPaid, paidMonthsCount, pendingAmount, pendingMonthsCount };
    };

    const handleSaveSalaryPeriod = async () => {
        if (!viewEmployee?._id) return;
        setIsSavingSalaryPeriod(true);
        try {
            const res = await api.put(`/employee-master/${viewEmployee._id}/salary-date`, {
                salaryStartDate: salaryPeriodState.startDate,
                salaryEndDate: salaryPeriodState.endDate,
                salaryDate: salaryPeriodState.disbursementDate
            });
            if (res.data.success) {
                toast({
                    title: "Salary Period Saved",
                    description: `Period: ${salaryPeriodState.startDate} to ${salaryPeriodState.endDate} | Disbursement Date: ${salaryPeriodState.disbursementDate}`,
                    status: "success",
                    duration: 3000
                });
                setViewEmployee(prev => ({
                    ...prev,
                    salaryStartDate: salaryPeriodState.startDate,
                    salaryEndDate: salaryPeriodState.endDate,
                    salaryDate: salaryPeriodState.disbursementDate
                }));
                fetchEmployees();
            }
        } catch (err) {
            toast({
                title: "Error",
                description: err.response?.data?.message || "Failed to save salary period",
                status: "error",
                duration: 3000
            });
        } finally {
            setIsSavingSalaryPeriod(false);
        }
    };

    const handleToggleCurrentMonthPayout = async (currentStatus, targetMode) => {
        if (!viewEmployee?._id) return;
        setIsUpdatingCurrentPayout(true);
        const today = new Date();
        const currentMonthKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
        const nextStatus = currentStatus === 'Done' ? 'Pending' : 'Done';
        const mode = targetMode || viewEmployee.paymentMode || 'Cash';

        try {
            const res = await api.put(`/employee-master/${viewEmployee._id}/monthly-payment`, {
                month: currentMonthKey,
                paymentStatus: nextStatus,
                paymentMode: mode
            });
            if (res.data.success) {
                toast({
                    title: nextStatus === 'Done' ? "Marked as Paid" : "Marked as Pending",
                    description: `Payout status for ${currentMonthKey} updated to ${nextStatus}`,
                    status: nextStatus === 'Done' ? "success" : "info",
                    duration: 2500
                });
                setViewEmployee(prev => {
                    if (!prev) return prev;
                    const payments = Array.isArray(prev.monthlyPayments) ? [...prev.monthlyPayments] : [];
                    const idx = payments.findIndex(p => p.month === currentMonthKey);
                    if (idx > -1) {
                        payments[idx] = { ...payments[idx], paymentStatus: nextStatus, paymentMode: mode };
                    } else {
                        payments.push({
                            month: currentMonthKey,
                            paymentStatus: nextStatus,
                            paymentMode: mode,
                            presentDays: null,
                            absentDays: null,
                            upad: 0,
                            incentive: 0
                        });
                    }
                    return { ...prev, monthlyPayments: payments, paymentStatus: nextStatus };
                });
                fetchEmployees();
            }
        } catch (err) {
            toast({
                title: "Error",
                description: err.response?.data?.message || "Failed to update payout status",
                status: "error",
                duration: 3000
            });
        } finally {
            setIsUpdatingCurrentPayout(false);
        }
    };

    const handleAddSalaryIncrement = async () => {
        if (!viewEmployee?._id) return;
        if (!incrementForm.newSalary && !incrementForm.incrementAmount) {
            toast({ title: "Validation Error", description: "Please enter new salary or increment amount", status: "warning", duration: 2500 });
            return;
        }
        setIsSubmittingIncrement(true);
        try {
            const res = await api.put(`/employee-master/${viewEmployee._id}/salary-increment`, incrementForm);
            if (res.data.success) {
                toast({ title: "Salary Revised", description: res.data.message || "Increment recorded successfully", status: "success", duration: 3000 });
                setViewEmployee(res.data.data);
                setIsIncrementModalOpen(false);
                fetchEmployees();
            }
        } catch (err) {
            toast({ title: "Error", description: err.response?.data?.message || "Failed to revise salary", status: "error", duration: 3000 });
        } finally {
            setIsSubmittingIncrement(false);
        }
    };

    const handleQuickUpdateSalaryDate = async (newDate) => {
        if (!viewEmployee?._id || !newDate) return;
        setIsUpdatingSalaryDate(true);
        try {
            const res = await api.put(`/employee-master/${viewEmployee._id}/salary-date`, { salaryDate: newDate });
            if (res.data.success) {
                toast({ title: "Salary Date Updated", description: `Disbursement date set to "${newDate}"`, status: "success", duration: 2000 });
                setViewEmployee(prev => ({ ...prev, salaryDate: newDate }));
                fetchEmployees();
            }
        } catch (err) {
            toast({ title: "Error", description: err.response?.data?.message || "Failed to update salary date", status: "error", duration: 3000 });
        } finally {
            setIsUpdatingSalaryDate(false);
        }
    };

    const handleQuickUploadSalarySlip = async (e) => {
        const selectedFiles = e.target.files;
        if (!selectedFiles || selectedFiles.length === 0 || !viewEmployee?._id) return;
        setIsUploadingSlip(true);
        const slipData = new FormData();
        Array.from(selectedFiles).forEach(f => {
            slipData.append('salarySlips', f);
        });
        slipData.append('empId', viewEmployee.empId || '');
        try {
            const res = await api.post(`/employee-master/${viewEmployee._id}/salary-slips`, slipData);
            if (res.data.success) {
                toast({ title: "Salary Slip Uploaded", description: res.data.message || "Slip added successfully", status: "success", duration: 3000 });
                setViewEmployee(res.data.data);
                fetchEmployees();
            }
        } catch (err) {
            toast({ title: "Upload Failed", description: err.response?.data?.message || "Could not upload salary slip", status: "error", duration: 3000 });
        } finally {
            setIsUploadingSlip(false);
            if (salarySlipInputRef.current) salarySlipInputRef.current.value = '';
        }
    };

    const joiningLetterInputRef = useRef(null);
    const [isUploadingJoiningLetter, setIsUploadingJoiningLetter] = useState(false);

    const handleQuickUploadJoiningLetter = async (e) => {
        const file = e.target.files?.[0];
        if (!file || !viewEmployee?._id) return;
        setIsUploadingJoiningLetter(true);
        const data = new FormData();
        data.append('joiningLetter', file);
        data.append('empId', viewEmployee.empId || '');
        try {
            const res = await api.post(`/employee-master/${viewEmployee._id}/joining-letter`, data);
            if (res.data.success) {
                toast({ title: "Joining Letter Uploaded", description: "Official joining letter attached successfully", status: "success", duration: 3000 });
                setViewEmployee(res.data.data);
                fetchEmployees();
            }
        } catch (err) {
            toast({ title: "Upload Failed", description: err.response?.data?.message || "Could not upload joining letter", status: "error", duration: 3000 });
        } finally {
            setIsUploadingJoiningLetter(false);
            if (joiningLetterInputRef.current) joiningLetterInputRef.current.value = '';
        }
    };
    const [selectedReportEmployee, setSelectedReportEmployee] = useState(null);

    const handleOpenEmployeeDetail = (emp) => {
        setViewEmployee(emp);
        setActiveProfileTab('personal');
    };
    const [attendanceDetailList, setAttendanceDetailList] = useState([]);
    const [attendanceDetailLoading, setAttendanceDetailLoading] = useState(false);

    const handleRowClick = async (emp) => {
        if (emp.status === 'Deactive') {
            const proceed = window.confirm(`Notice: ${emp.name} is DEACTIVATED.\n\nDo you want to view their attendance details?`);
            if (!proceed) return;
        }

        setSelectedReportEmployee(emp);
        setAttendanceDetailLoading(true);
        try {
            const res = await api.get(`/employee-master/${emp._id}/attendance-detail?month=${reportMonthFilter}`);
            if (res.data.success) {
                setAttendanceDetailList(res.data.data);
            }
        } catch (err) {
            console.error("Failed to fetch detailed attendance", err);
            setAttendanceDetailList([]);
        } finally {
            setAttendanceDetailLoading(false);
        }
    };

    const handleToggleShowInReport = async (empId, newValue) => {
        try {
            const res = await api.put(`/employee-master/${empId}`, { showInPaymentReport: newValue });
            if (res.data.success) {
                setEmployees(prev => prev.map(e => e._id === empId ? { ...e, showInPaymentReport: newValue } : e));
                toast({ title: 'Success', description: `Employee visibility updated.`, status: 'success', duration: 2000 });
            }
        } catch (err) {
            toast({ title: 'Error', description: 'Failed to update visibility', status: 'error', duration: 2000 });
        }
    };

    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768 ? 'card' : 'table');
    const [employeeViewSubTab, setEmployeeViewSubTab] = useState('active'); // 'active' or 'deactive'
    const { isOpen: isConfirmOpen, onOpen: onConfirmOpen, onClose: onConfirmClose } = useDisclosure();
    const cancelRef = React.useRef();

    const tabConfig = [
        { id: 'form', label: 'Form', permission: 'employeeMaster_form' },
        { id: 'view', label: 'View', permission: 'employeeMaster_view' },
        { id: 'payment', label: 'Payment Report', permission: 'employeeMaster_payment' },
        { id: 'adminReport', label: 'Admin Login Report', permission: 'employeeMaster_adminReport' },
    ].filter(tab => hasPermission(user, tab.permission, 'read'));
    const [employeeActiveTab, setEmployeeActiveTab] = useState(0);

    const [reportSearchQuery, setReportSearchQuery] = useState('');
    const [reportPaymentModeFilter, setReportPaymentModeFilter] = useState('All');
    const [reportPaymentStatusFilter, setReportPaymentStatusFilter] = useState('All');
    const [reportMonthFilter, setReportMonthFilter] = useState(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    });
    const [reportFoodFilter, setReportFoodFilter] = useState('All');
    // Cache of { [empId_month]: { present, absent, halfDay, totalRecorded } }
    const [attendanceCache, setAttendanceCache] = useState({});
    const [attendanceLoading, setAttendanceLoading] = useState(false);

    const fetchAttendanceSummaries = async (empList, month) => {
        if (!empList?.length || !month) return;
        setAttendanceLoading(true);
        try {
            const res = await api.post('/employee-master/attendance-summaries', {
                employeeIds: empList.map(e => e._id),
                month
            });
            if (res.data?.data) {
                const cache = {};
                Object.entries(res.data.data).forEach(([empId, summary]) => {
                    cache[`${empId}_${month}`] = summary;
                });
                setAttendanceCache(prev => ({ ...prev, ...cache }));
            }
        } catch (err) {
            console.error("Error fetching bulk attendance summaries:", err);
        } finally {
            setAttendanceLoading(false);
        }
    };

    const baseSearchedEmployees = employees.filter(emp =>
        emp.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.empId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.phone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.designation?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const activeEmployeesCount = baseSearchedEmployees.filter(emp => emp.status !== 'Deactive').length;
    const deactiveEmployeesCount = baseSearchedEmployees.filter(emp => emp.status === 'Deactive').length;

    const filteredEmployees = baseSearchedEmployees.filter(emp => {
        if (employeeViewSubTab === 'active') return emp.status !== 'Deactive';
        if (employeeViewSubTab === 'deactive') return emp.status === 'Deactive';
        return true;
    });

    const fetchNextEmpId = async () => {
        try {
            const res = await api.get('/employee-master/next-id');
            if (res.data.success) setNextEmpId(res.data.nextEmpId);
        } catch (err) { console.error('Failed to fetch next emp id', err); }
    };

    const fetchEmployees = async () => {
        try {
            const res = await api.get('/employee-master');
            if (res.data.success) setEmployees(res.data.data);
        } catch (err) { console.error(err); }
    };

    const fetchCompanies = async () => {
        try {
            const res = await api.get('/company-master');
            if (res.data?.success && Array.isArray(res.data.data)) {
                const names = res.data.data.map(c => c.companyName).filter(Boolean);
                setCompanyList(prev => Array.from(new Set([...prev, ...names])));
            }
        } catch (err) {
            console.error('Failed to fetch companies for employee dropdown:', err);
        }
    };

    useEffect(() => {
        fetchNextEmpId();
        fetchEmployees();
        fetchCompanies();
    }, []);

    useEffect(() => {
        if (employees?.length > 0) {
            const empCompanies = employees.map(e => e.company).filter(Boolean);
            if (empCompanies.length > 0) {
                setCompanyList(prev => Array.from(new Set([...prev, ...empCompanies])));
            }
            const empBranches = employees.map(e => e.branch).filter(Boolean);
            if (empBranches.length > 0) {
                setBranchList(prev => Array.from(new Set([...prev, ...empBranches])));
            }
        }
    }, [employees]);

    useEffect(() => {
        if (employees.length > 0 && reportMonthFilter) {
            fetchAttendanceSummaries(employees, reportMonthFilter);
        }
    }, [employees, reportMonthFilter]);

    const handleAddCompany = () => {
        const trimmed = (newCompanyName || '').trim();
        if (!trimmed) {
            toast({ title: 'Please enter company name', status: 'warning', duration: 2000 });
            return;
        }
        setCompanyList(prev => Array.from(new Set([...prev, trimmed])));
        setFormData(prev => ({ ...prev, company: trimmed }));
        setNewCompanyName('');
        setIsAddCompanyOpen(false);
        toast({ title: 'Company Added & Selected', description: `"${trimmed}"`, status: 'success', duration: 2000 });
    };

    const handleAddBranch = () => {
        const trimmed = (newBranchName || '').trim();
        if (!trimmed) {
            toast({ title: 'Please enter branch name', status: 'warning', duration: 2000 });
            return;
        }
        setBranchList(prev => Array.from(new Set([...prev, trimmed])));
        setFormData(prev => ({ ...prev, branch: trimmed }));
        setNewBranchName('');
        setIsAddBranchOpen(false);
        toast({ title: 'Branch Added & Selected', description: `"${trimmed}"`, status: 'success', duration: 2000 });
    };

    const handleSelectEmployee = (e) => {
        const id = e.target.value;
        setEditId(id);
        if (!id) {
            setFormData({
                name: '', email: '', phone: '',
                company: '', branch: '',
                dob: '', bloodGroup: '', gender: '',
                maritalStatus: 'Single', marriageDate: '',
                joiningDate: '',
                reportedTo: '',
                insuranceNumber: '', insuranceProvider: '', insuranceExpiry: '',
                mediclaimNumber: '', mediclaimProvider: '', mediclaimExpiry: '',
                issuedItems: '', companyRemarks: '',
                addressLine1: { street: '', city: '', pincode: '' },
                addressLine2: { street: '', city: '', pincode: '' },
                emergencyContact: { name: '', phone: '' },
                bankName: '', accountName: '', accountNumber: '', confirmAccountNumber: '', ifscCode: '',
                salary: '',
                salaryDate: '',
                salaryStartDate: '',
                salaryEndDate: '',
                salaryIncrementDate: '',
                previousSalary: '',
                designation: '',
                paymentMode: 'Cash',
                paymentStatus: 'Pending',
                foodAllowance: 'Food',
                status: 'Active',
                aadharNumber: '',
                panNumber: '',
                voterIdNumber: '',
                drivingLicenseNumber: '',
            });
            setFiles({
                photo: null, aadharCard: null, panCard: null, voterId: null, drivingLicense: null,
                resume: null, joiningLetter: null, salarySlips: [], bankDocuments: [], insuranceDocs: [], mediclaimDocs: [], companyItemDocs: []
            });
            setExistingDocs({
                aadharCard: null, panCard: null, voterId: null, drivingLicense: null,
                resume: null, resumes: [], joiningLetter: null, joiningLetters: [], salarySlips: [], bankDocuments: [], insuranceDocs: [], mediclaimDocs: [], companyItemDocs: []
            });
            setPhotoPreview(null);
            setSameAsAddress(false);
            setBankVerified(false);
            fetchNextEmpId();
            return;
        }

        const emp = employees.find(e => e._id === id);
        if (emp) {
            setNextEmpId(emp.empId);
            setFormData({
                name: emp.name || '',
                email: emp.email || '',
                phone: emp.phone || '',
                company: emp.company || '',
                branch: emp.branch || '',
                dob: emp.dob || '',
                bloodGroup: emp.bloodGroup || '',
                gender: emp.gender || '',
                maritalStatus: emp.maritalStatus || 'Single',
                marriageDate: emp.marriageDate || '',
                joiningDate: emp.joiningDate || '',
                reportedTo: emp.reportedTo || '',
                insuranceNumber: emp.companyItems?.insuranceNumber || '',
                insuranceProvider: emp.companyItems?.insuranceProvider || '',
                insuranceExpiry: emp.companyItems?.insuranceExpiry || '',
                mediclaimNumber: emp.companyItems?.mediclaimNumber || '',
                mediclaimProvider: emp.companyItems?.mediclaimProvider || '',
                mediclaimExpiry: emp.companyItems?.mediclaimExpiry || '',
                issuedItems: emp.companyItems?.issuedItems || '',
                companyRemarks: emp.companyItems?.remarks || '',
                addressLine1: emp.addressLine1 || { street: '', city: '', pincode: '' },
                addressLine2: emp.addressLine2 || { street: '', city: '', pincode: '' },
                emergencyContact: emp.emergencyContact || { name: '', phone: '' },
                bankName: emp.bankDetails?.bankName || '',
                accountName: emp.bankDetails?.accountName || '',
                accountNumber: emp.bankDetails?.accountNumber || '',
                confirmAccountNumber: emp.bankDetails?.accountNumber || '',
                ifscCode: emp.bankDetails?.ifscCode || '',
                salary: emp.salary || '',
                salaryDate: emp.salaryDate || '',
                salaryStartDate: emp.salaryStartDate || '',
                salaryEndDate: emp.salaryEndDate || '',
                salaryIncrementDate: emp.salaryIncrementDate || '',
                previousSalary: emp.previousSalary || '',
                designation: emp.designation || '',
                paymentMode: emp.paymentMode || 'Cash',
                paymentStatus: emp.paymentStatus || 'Pending',
                foodAllowance: emp.foodAllowance || 'Food',
                status: emp.status || 'Active',
                aadharNumber: emp.aadharNumber || '',
                panNumber: emp.panNumber || '',
                voterIdNumber: emp.voterIdNumber || '',
                drivingLicenseNumber: emp.drivingLicenseNumber || '',
            });
            setPhotoPreview(emp.photo?.url ? `${API_BASE_URL}${emp.photo.url}` : null);
            setFiles({
                photo: null, aadharCard: null, panCard: null, voterId: null, drivingLicense: null,
                resume: null, joiningLetter: null, salarySlips: [], bankDocuments: [], insuranceDocs: [], mediclaimDocs: [], companyItemDocs: []
            });
            setExistingDocs({
                aadharCard: emp.aadharCard || null,
                panCard: emp.panCard || null,
                voterId: emp.voterId || null,
                drivingLicense: emp.drivingLicense || null,
                resume: emp.resume || null,
                resumes: emp.resumes || [],
                joiningLetter: emp.joiningLetter || null,
                joiningLetters: emp.joiningLetters || [],
                salarySlips: emp.salarySlips || [],
                bankDocuments: emp.bankDetails?.documents || [],
                insuranceDocs: emp.insuranceDocs || [],
                mediclaimDocs: emp.mediclaimDocs || [],
                companyItemDocs: emp.companyItemDocs || []
            });
            if (emp.bankDetails?.ifscCode) setBankVerified(true);
            const formIdx = tabConfig.findIndex(t => t.id === 'form');
            if (formIdx !== -1) setEmployeeActiveTab(formIdx);
        }
    };

    const fetchCityByPincode = async (pincode, addressField, setLoadingFn) => {
        if (pincode.length !== 6) return;
        setLoadingFn(true);
        try {
            const res = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
            const data = await res.json();
            if (data[0].Status === 'Success') {
                const city = data[0].PostOffice[0].District;
                setFormData(prev => ({
                    ...prev,
                    [addressField]: { ...prev[addressField], city }
                }));
                if (sameAsAddress && addressField === 'addressLine1') {
                    setFormData(prev => ({
                        ...prev,
                        addressLine2: { ...prev.addressLine2, city }
                    }));
                }
            }
        } catch (err) {
            console.log('Pincode lookup failed', err);
        } finally {
            setLoadingFn(false);
        }
    };

    const handleChange = (e, field, subfield) => {
        const { value } = e.target;
        if (subfield) {
            setFormData(prev => ({
                ...prev,
                [field]: { ...prev[field], [subfield]: value }
            }));
            if (sameAsAddress && field === 'addressLine1') {
                setFormData(prev => ({
                    ...prev,
                    addressLine2: { ...prev.addressLine2, [subfield]: value }
                }));
            }
            if (subfield === 'pincode') {
                const setter = field === 'addressLine1' ? setPincodeLoading1 : setPincodeLoading2;
                if (value.length === 6) fetchCityByPincode(value, field, setter);
            }
        } else {
            setFormData(prev => ({ ...prev, [field]: value }));
            if (['ifscCode', 'accountNumber', 'confirmAccountNumber'].includes(field)) {
                setBankVerified(false);
            }
        }
    };

    const handleFileChange = (e, field) => {
        if (['bankDocuments', 'salarySlips', 'insuranceDocs', 'mediclaimDocs', 'companyItemDocs'].includes(field)) {
            const selectedFiles = Array.from(e.target.files);
            setFiles(prev => ({ ...prev, [field]: [...(prev[field] || []), ...selectedFiles] }));
        } else {
            const file = e.target.files[0];
            setFiles(prev => ({ ...prev, [field]: file }));
            if (field === 'photo' && file) {
                const reader = new FileReader();
                reader.onload = (ev) => setPhotoPreview(ev.target.result);
                reader.readAsDataURL(file);
            }
        }
    };

    const removeFileItem = (field, index) => {
        setFiles(prev => {
            const newArr = [...(prev[field] || [])];
            newArr.splice(index, 1);
            return { ...prev, [field]: newArr };
        });
    };

    const removeExistingDocItem = (field, index) => {
        setExistingDocs(prev => {
            const newArr = [...(prev[field] || [])];
            newArr.splice(index, 1);
            return { ...prev, [field]: newArr };
        });
    };

    const removeSingleExistingDoc = (field) => {
        setExistingDocs(prev => ({ ...prev, [field]: null }));
    };

    const removeSingleNewFile = (field) => {
        setFiles(prev => ({ ...prev, [field]: null }));
    };

    const removeBankDocument = (index) => removeFileItem('bankDocuments', index);
    const removeExistingBankDoc = (index) => removeExistingDocItem('bankDocuments', index);

    const handleCheckboxChange = (e) => {
        const checked = e.target.checked;
        setSameAsAddress(checked);
        if (checked) {
            setFormData(prev => ({
                ...prev,
                addressLine2: { ...prev.addressLine1 }
            }));
        }
    };

    const handleVerifyBank = async () => {
        if (!formData.ifscCode || formData.ifscCode.length < 11) {
            toast({ title: 'Enter valid IFSC code (11 chars)', status: 'warning', duration: 2000 });
            return;
        }
        setBankVerifying(true);
        try {
            const res = await fetch(`https://ifsc.razorpay.com/${formData.ifscCode.toUpperCase()}`);
            if (res.ok) {
                const data = await res.json();
                setFormData(prev => ({ ...prev, bankName: data.BANK }));
                setBankVerified(true);
                toast({ title: 'Bank Verified ✓', description: `${data.BANK} - ${data.BRANCH}`, status: 'success', duration: 3000 });
            } else {
                setBankVerified(false);
                toast({ title: 'Invalid IFSC Code', status: 'error', duration: 2000 });
            }
        } catch {
            toast({ title: 'Verification failed', status: 'error', duration: 2000 });
        } finally {
            setBankVerifying(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this employee record?')) return;
        try {
            const res = await api.delete(`/employee-master/${id}`);
            if (res.data.success) {
                toast({ title: 'Success', description: 'Employee record deleted', status: 'success', duration: 3000 });
                fetchEmployees();
            }
        } catch (err) {
            toast({ title: 'Error', description: err.response?.data?.message || 'Delete failed', status: 'error', duration: 3000 });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name || !formData.phone || !formData.salary || !formData.accountNumber) {
            toast({ title: 'Please fill all required fields, including Bank Account', status: 'error', duration: 3000 });
            return;
        }

        if (formData.accountNumber !== formData.confirmAccountNumber) {
            toast({ title: 'Account numbers do not match', status: 'error', duration: 3000 });
            return;
        }

        onConfirmOpen();
    };

    const confirmSubmit = async () => {
        onConfirmClose();
        setIsLoading(true);
        try {
            let currentEmpId = nextEmpId;
            if (!editId && !currentEmpId) {
                // Fetch next ID on the fly if it is empty to prevent sending empty empId
                const res = await api.get('/employee-master/next-id');
                if (res.data.success) {
                    currentEmpId = res.data.nextEmpId;
                    setNextEmpId(currentEmpId);
                }
            }

            const uploadData = new FormData();
            uploadData.append('name', formData.name);
            uploadData.append('email', formData.email);
            uploadData.append('phone', formData.phone);
            uploadData.append('company', formData.company || '');
            uploadData.append('branch', formData.branch || '');
            uploadData.append('dob', formData.dob || '');
            uploadData.append('bloodGroup', formData.bloodGroup || '');
            uploadData.append('gender', formData.gender || '');
            uploadData.append('maritalStatus', formData.maritalStatus || 'Single');
            uploadData.append('marriageDate', formData.marriageDate || '');
            uploadData.append('joiningDate', formData.joiningDate || '');
            uploadData.append('reportedTo', formData.reportedTo || '');
            uploadData.append('companyItems', JSON.stringify({
                insuranceNumber: formData.insuranceNumber || '',
                insuranceProvider: formData.insuranceProvider || '',
                insuranceExpiry: formData.insuranceExpiry || '',
                mediclaimNumber: formData.mediclaimNumber || '',
                mediclaimProvider: formData.mediclaimProvider || '',
                mediclaimExpiry: formData.mediclaimExpiry || '',
                issuedItems: formData.issuedItems || '',
                remarks: formData.companyRemarks || '',
            }));
            uploadData.append('addressLine1', JSON.stringify(formData.addressLine1));
            uploadData.append('addressLine2', JSON.stringify(formData.addressLine2));
            uploadData.append('emergencyContact', JSON.stringify(formData.emergencyContact));
            uploadData.append('empId', currentEmpId);
            uploadData.append('bankDetails', JSON.stringify({
                bankName: formData.bankName,
                accountName: formData.accountName,
                accountNumber: formData.accountNumber,
                ifscCode: formData.ifscCode,
            }));
            uploadData.append('salary', formData.salary);
            uploadData.append('salaryDate', formData.salaryDate || '');
            uploadData.append('salaryStartDate', formData.salaryStartDate || '');
            uploadData.append('salaryEndDate', formData.salaryEndDate || '');
            uploadData.append('salaryIncrementDate', formData.salaryIncrementDate || '');
            uploadData.append('previousSalary', formData.previousSalary || '');
            uploadData.append('designation', formData.designation);
            uploadData.append('paymentMode', formData.paymentMode || 'Cash');
            uploadData.append('paymentStatus', formData.paymentStatus || 'Pending');
            uploadData.append('foodAllowance', formData.foodAllowance || 'Food');
            uploadData.append('status', formData.status || 'Active');
            uploadData.append('aadharNumber', formData.aadharNumber || '');
            uploadData.append('panNumber', formData.panNumber || '');
            uploadData.append('voterIdNumber', formData.voterIdNumber || '');
            uploadData.append('drivingLicenseNumber', formData.drivingLicenseNumber || '');

            Object.keys(files).forEach(key => {
                if (Array.isArray(files[key])) {
                    files[key].forEach(f => uploadData.append(key, f));
                } else if (files[key]) {
                    uploadData.append(key, files[key]);
                }
            });

            if (editId) {
                uploadData.append('existingBankDocuments', JSON.stringify(existingDocs.bankDocuments || []));
                uploadData.append('existingResume', JSON.stringify(existingDocs.resume || null));
                uploadData.append('existingResumes', JSON.stringify(existingDocs.resumes || []));
                uploadData.append('existingJoiningLetter', JSON.stringify(existingDocs.joiningLetter || null));
                uploadData.append('existingJoiningLetters', JSON.stringify(existingDocs.joiningLetters || []));
                uploadData.append('existingSalarySlips', JSON.stringify(existingDocs.salarySlips || []));
                uploadData.append('existingInsuranceDocs', JSON.stringify(existingDocs.insuranceDocs || []));
                uploadData.append('existingMediclaimDocs', JSON.stringify(existingDocs.mediclaimDocs || []));
                uploadData.append('existingCompanyItemDocs', JSON.stringify(existingDocs.companyItemDocs || []));
            }

            let response;
            if (editId) {
                response = await api.put(`/employee-master/${editId}`, uploadData);
            } else {
                response = await api.post('/employee-master', uploadData);
            }

            if (response.data.success) {
                toast({ title: editId ? "Updated" : "Success", description: editId ? "Employee record updated successfully" : "Employee record stored successfully", status: "success", duration: 3000 });
                setFormData({
                    name: '',
                    email: '',
                    phone: '',
                    company: '',
                    branch: '',
                    dob: '',
                    bloodGroup: '',
                    gender: '',
                    maritalStatus: 'Single',
                    marriageDate: '',
                    joiningDate: '',
                    reportedTo: '',
                    insuranceNumber: '',
                    insuranceProvider: '',
                    insuranceExpiry: '',
                    mediclaimNumber: '',
                    mediclaimProvider: '',
                    mediclaimExpiry: '',
                    issuedItems: '',
                    companyRemarks: '',
                    addressLine1: { street: '', city: '', pincode: '' },
                    addressLine2: { street: '', city: '', pincode: '' },
                    emergencyContact: { name: '', phone: '' },
                    bankName: '',
                    accountName: '',
                    accountNumber: '',
                    confirmAccountNumber: '',
                    ifscCode: '',
                    salary: '',
                    salaryDate: '',
                    salaryStartDate: '',
                    salaryEndDate: '',
                    salaryIncrementDate: '',
                    previousSalary: '',
                    designation: '',
                    paymentMode: 'Cash',
                    paymentStatus: 'Pending',
                    foodAllowance: 'Food',
                    status: 'Active',
                    aadharNumber: '',
                    panNumber: '',
                    voterIdNumber: '',
                    drivingLicenseNumber: '',
                });
                setFiles({
                    photo: null, aadharCard: null, panCard: null, voterId: null, drivingLicense: null,
                    resume: null, joiningLetter: null, salarySlips: [], bankDocuments: [], insuranceDocs: [], mediclaimDocs: [], companyItemDocs: []
                });
                setExistingDocs({
                    aadharCard: null, panCard: null, voterId: null, drivingLicense: null,
                    resume: null, resumes: [], joiningLetter: null, joiningLetters: [], salarySlips: [], bankDocuments: [], insuranceDocs: [], mediclaimDocs: [], companyItemDocs: []
                });
                setPhotoPreview(null);
                setSameAsAddress(false);
                setBankVerified(false);
                setEditId('');
                fetchNextEmpId();
                fetchEmployees();
                const viewIdx = tabConfig.findIndex(t => t.id === 'view');
                if (viewIdx !== -1) setEmployeeActiveTab(viewIdx);
            }
        } catch (error) {
            toast({ title: "Error", description: error.response?.data?.message || "Failed to store record", status: "error", duration: 3000 });
        } finally {
            setIsLoading(false);
        }
    };

    const FileUploadInput = ({ label, field, icon }) => {
        const hasExisting = existingDocs && existingDocs[field] && existingDocs[field].url;
        const isPdf = hasExisting && existingDocs[field].name?.toLowerCase().endsWith('.pdf');

        return (
            <FormControl>
                <FormLabel fontWeight="600" fontSize="xs" color="gray.700" mb={1} noOfLines={1}>{label}</FormLabel>
                <VStack align="stretch" spacing={1.5}>
                    <Box
                        h="36px"
                        px={2.5}
                        border="1px dashed"
                        borderColor={files[field] ? "blue.400" : hasExisting ? "green.300" : "gray.300"}
                        borderRadius="md"
                        bg={files[field] ? "blue.50" : hasExisting ? "green.50" : "white"}
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        cursor="pointer"
                        onClick={() => document.getElementById(`${field}-upload`).click()}
                        _hover={{ bg: "gray.50", borderColor: "blue.400" }}
                        transition="all 0.15s"
                    >
                        <input type="file" id={`${field}-upload`} hidden onChange={(e) => handleFileChange(e, field)} accept="image/*,.pdf" />
                        <HStack spacing={1.5} justify="center" maxW="full">
                            <Icon as={icon || FaCloudUploadAlt} w={3.5} h={3.5} color={files[field] ? "blue.500" : hasExisting ? "green.600" : "gray.500"} flexShrink={0} />
                            <Text fontSize="xs" fontWeight="500" color={files[field] ? "blue.700" : hasExisting ? "green.700" : "gray.600"} noOfLines={1}>
                                {files[field] ? files[field].name : hasExisting ? `Replace ${label}` : `Upload ${label}`}
                            </Text>
                        </HStack>
                    </Box>

                    {hasExisting && !files[field] && (
                        <Box 
                            px={2}
                            py={1}
                            bg="gray.50" 
                            borderRadius="md" 
                            border="1px solid" 
                            borderColor="gray.200" 
                            display="flex"
                            alignItems="center"
                            justifyContent="space-between"
                        >
                            <HStack spacing={1.5} minW={0}>
                                <Icon as={isPdf ? FaFilePdf : FaFileImage} color={isPdf ? "red.500" : "blue.500"} fontSize="xs" flexShrink={0} />
                                <Text fontSize="2xs" fontWeight="500" color="gray.700" isTruncated maxW="110px">
                                    {existingDocs[field].name || `${label}`}
                                </Text>
                            </HStack>
                            <Button 
                                size="xs" 
                                colorScheme="gray" 
                                variant="outline" 
                                h="20px"
                                px={1.5}
                                fontSize="2xs"
                                borderRadius="md"
                                leftIcon={<Icon as={FaEye} fontSize="10px" />}
                                onClick={(e) => { 
                                    e.stopPropagation(); 
                                    const docUrl = getFileUrl(existingDocs[field]);
                                    if (docUrl) window.open(docUrl, '_blank', 'noopener,noreferrer'); 
                                }}
                            >
                                View
                            </Button>
                        </Box>
                    )}
                </VStack>
            </FormControl>
        );
    };

    const MultiDocUploader = ({ label, field, icon, colorScheme = "blue", accept = ".pdf,image/*" }) => {
        const newFilesList = files[field] || [];
        const existingList = existingDocs[field] || [];
        const totalCount = existingList.length + newFilesList.length;

        return (
            <FormControl>
                <Flex justify="space-between" align="center" mb={1} minH="18px">
                    <FormLabel fontWeight="600" fontSize="xs" color="gray.700" mb={0} noOfLines={1}>
                        {label}
                    </FormLabel>
                    {totalCount > 0 && (
                        <Badge colorScheme={colorScheme} variant="subtle" fontSize="2xs" px={1.5} py={0.5} borderRadius="full" flexShrink={0}>
                            {totalCount} {totalCount === 1 ? 'file' : 'files'}
                        </Badge>
                    )}
                </Flex>
                <Box
                    h="36px"
                    px={2.5}
                    border="1px dashed"
                    borderColor={totalCount > 0 ? `${colorScheme}.300` : `${colorScheme}.200`}
                    borderRadius="md"
                    bg="white"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    cursor="pointer"
                    onClick={() => document.getElementById(`${field}-upload`).click()}
                    _hover={{ bg: `${colorScheme}.50`, borderColor: `${colorScheme}.400` }}
                    transition="all 0.15s"
                >
                    <input
                        type="file"
                        id={`${field}-upload`}
                        multiple
                        hidden
                        onChange={(e) => handleFileChange(e, field)}
                        accept={accept}
                    />
                    <HStack justify="center" spacing={1.5} maxW="full">
                        <Icon as={icon || FaCloudUploadAlt} w={3.5} h={3.5} color={`${colorScheme}.500`} flexShrink={0} />
                        <Text fontSize="xs" fontWeight="500" color="gray.600" noOfLines={1}>
                            {totalCount > 0 ? `+ Add More Files` : `Upload ${label}`}
                        </Text>
                    </HStack>
                </Box>

                {totalCount > 0 && (
                    <Wrap mt={1.5} spacing={1.5}>
                        {existingList.map((doc, idx) => {
                            const docUrl = getFileUrl(doc);
                            return (
                                <HStack
                                    key={'ex-' + idx}
                                    px={2}
                                    py={0.5}
                                    h="24px"
                                    bg="white"
                                    borderRadius="md"
                                    borderWidth="1px"
                                    borderColor="gray.200"
                                    spacing={1}
                                >
                                    <Icon as={FaFilePdf} color="red.500" fontSize="10px" flexShrink={0} />
                                    <Text fontSize="2xs" fontWeight="500" color="gray.700" noOfLines={1} maxW="110px">
                                        {doc.name || `File ${idx + 1}`}
                                    </Text>
                                    {docUrl && (
                                        <IconButton
                                            aria-label="View doc"
                                            size="xs"
                                            colorScheme="gray"
                                            variant="ghost"
                                            h="16px"
                                            w="16px"
                                            minW="16px"
                                            p={0}
                                            icon={<FaEye size="9px" />}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                window.open(docUrl, '_blank', 'noopener,noreferrer');
                                            }}
                                        />
                                    )}
                                    <IconButton
                                        aria-label="Remove doc"
                                        size="xs"
                                        colorScheme="red"
                                        variant="ghost"
                                        h="16px"
                                        w="16px"
                                        minW="16px"
                                        p={0}
                                        icon={<FaTrash size="9px" />}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removeExistingDocItem(field, idx);
                                        }}
                                    />
                                </HStack>
                            );
                        })}
                        {newFilesList.map((file, idx) => (
                            <HStack
                                key={'new-' + idx}
                                px={2}
                                py={0.5}
                                h="24px"
                                bg={`${colorScheme}.50`}
                                borderRadius="md"
                                borderWidth="1px"
                                borderColor={`${colorScheme}.200`}
                                spacing={1}
                            >
                                <Icon as={FaCheckCircle} color={`${colorScheme}.500`} fontSize="10px" flexShrink={0} />
                                <Text fontSize="2xs" fontWeight="500" color={`${colorScheme}.700`} noOfLines={1} maxW="110px">
                                    {file.name}
                                </Text>
                                <IconButton
                                    aria-label="Remove new file"
                                    size="xs"
                                    colorScheme="red"
                                    variant="ghost"
                                    h="16px"
                                    w="16px"
                                    minW="16px"
                                    p={0}
                                    icon={<FaTrash size="9px" />}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        removeFileItem(field, idx);
                                    }}
                                />
                            </HStack>
                        ))}
                    </Wrap>
                )}
            </FormControl>
        );
    };

    const ResumeUploadBlock = () => {
        const hasExisting = existingDocs?.resume && existingDocs.resume.url;
        const isNew = files?.resume;
        const docUrl = hasExisting ? getFileUrl(existingDocs.resume) : null;

        return (
            <FormControl>
                <FormLabel fontWeight="600" fontSize="xs" color="gray.700" mb={1} noOfLines={1}>
                    📄 Resume / Curriculum Vitae
                </FormLabel>
                <Box
                    h="36px"
                    px={2.5}
                    border="1px dashed"
                    borderColor={isNew ? "green.300" : hasExisting ? "blue.300" : "blue.200"}
                    borderRadius="md"
                    bg={isNew ? "green.50" : "white"}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    cursor="pointer"
                    onClick={() => document.getElementById('resume-upload').click()}
                    _hover={{ bg: "blue.50", borderColor: "blue.400" }}
                    transition="all 0.15s"
                >
                    <input
                        type="file"
                        id="resume-upload"
                        hidden
                        onChange={(e) => handleFileChange(e, 'resume')}
                        accept=".pdf,.doc,.docx,image/*"
                    />
                    <HStack justify="center" spacing={1.5} maxW="full">
                        <Icon as={FaFileAlt} w={3.5} h={3.5} color={isNew ? "green.500" : "blue.500"} flexShrink={0} />
                        <Text fontSize="xs" fontWeight="500" color={isNew ? "green.700" : "gray.600"} noOfLines={1}>
                            {isNew ? files.resume.name : hasExisting ? (existingDocs.resume.name || 'Current Resume') : 'Upload Resume (PDF / Word)'}
                        </Text>
                    </HStack>
                </Box>

                {(hasExisting || isNew) && (
                    <Wrap mt={1.5} spacing={1.5}>
                        {hasExisting && !isNew && (
                            <HStack px={2} py={0.5} h="24px" bg="white" borderRadius="md" borderWidth="1px" borderColor="gray.200" spacing={1}>
                                <Icon as={FaFilePdf} color="red.500" fontSize="10px" flexShrink={0} />
                                <Text fontSize="2xs" fontWeight="500" color="gray.700" noOfLines={1} maxW="130px">
                                    {existingDocs.resume.name || 'Current_Resume.pdf'}
                                </Text>
                                {docUrl && (
                                    <Button
                                        size="xs"
                                        colorScheme="blue"
                                        variant="outline"
                                        h="16px"
                                        px={1.5}
                                        fontSize="2xs"
                                        leftIcon={<FaEye size="9px" />}
                                        onClick={() => window.open(docUrl, '_blank', 'noopener,noreferrer')}
                                    >
                                        View
                                    </Button>
                                )}
                                <IconButton
                                    aria-label="Delete resume"
                                    size="xs"
                                    colorScheme="red"
                                    variant="ghost"
                                    h="16px"
                                    w="16px"
                                    minW="16px"
                                    p={0}
                                    icon={<FaTrash size="9px" />}
                                    onClick={() => removeSingleExistingDoc('resume')}
                                />
                            </HStack>
                        )}
                        {isNew && (
                            <HStack px={2} py={0.5} h="24px" bg="green.50" borderRadius="md" borderWidth="1px" borderColor="green.200" spacing={1}>
                                <Icon as={FaCheckCircle} color="green.500" fontSize="10px" flexShrink={0} />
                                <Text fontSize="2xs" fontWeight="500" color="green.700" noOfLines={1} maxW="130px">
                                    {files.resume.name}
                                </Text>
                                <IconButton
                                    aria-label="Remove new resume"
                                    size="xs"
                                    colorScheme="red"
                                    variant="ghost"
                                    h="16px"
                                    w="16px"
                                    minW="16px"
                                    p={0}
                                    icon={<FaTrash size="9px" />}
                                    onClick={() => removeSingleNewFile('resume')}
                                />
                            </HStack>
                        )}
                    </Wrap>
                )}
            </FormControl>
        );
    };

    const renderKycViewCard = ({ itemNumber, title, cardNo, doc, icon }) => {
        const docUrl = getFileUrl(doc);
        const fileName = doc?.name || (typeof doc === 'string' ? doc.split('/').pop() : '');
        const isPdf = fileName.toLowerCase().endsWith('.pdf') || (docUrl && docUrl.toLowerCase().includes('.pdf'));

        return (
            <Box 
                p={3.5} 
                bg="white" 
                borderRadius="xl" 
                border="1px solid" 
                borderColor="gray.200"
                display="flex"
                flexDirection="column"
                justifyContent="space-between"
            >
                <Box>
                    <Flex justify="space-between" align="center" mb={2}>
                        <HStack spacing={1.5}>
                            <Icon as={icon} color="gray.600" fontSize="xs" />
                            <Text fontSize="xs" fontWeight="700" color="gray.800">
                                {itemNumber}. {title}
                            </Text>
                        </HStack>
                        <Badge colorScheme="gray" variant="subtle" fontSize="2xs" px={1.5} py={0.5} borderRadius="md">
                            KYC
                        </Badge>
                    </Flex>

                    <Box mb={2.5} p={2} bg="gray.50" borderRadius="md" border="1px solid" borderColor="gray.200">
                        <Text fontSize="9px" color="gray.500" fontWeight="bold" textTransform="uppercase">
                            DOCUMENT NUMBER:
                        </Text>
                        <Text fontSize="xs" fontWeight="700" color="gray.800" fontFamily="mono" letterSpacing="0.5px">
                            {cardNo || 'Not entered'}
                        </Text>
                    </Box>
                </Box>

                <Box pt={1}>
                    {docUrl ? (
                        <VStack align="stretch" spacing={2}>
                            {!isPdf && (
                                <Box 
                                    h="70px" 
                                    borderRadius="md" 
                                    overflow="hidden" 
                                    border="1px solid" 
                                    borderColor="gray.200"
                                    bg="gray.50"
                                    cursor="pointer"
                                    onClick={() => window.open(docUrl, '_blank', 'noopener,noreferrer')}
                                    _hover={{ opacity: 0.85 }}
                                    title="Click to view full image"
                                >
                                    <Image src={docUrl} alt={title} w="full" h="full" objectFit="cover" />
                                </Box>
                            )}
                            <Button
                                as="a"
                                href={docUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                size="xs"
                                h="28px"
                                colorScheme="blue"
                                variant="outline"
                                borderRadius="md"
                                fontWeight="600"
                                leftIcon={<Icon as={isPdf ? FaFilePdf : FaEye} fontSize="11px" />}
                                rightIcon={<Icon as={FaExternalLinkAlt} fontSize="8px" />}
                                w="full"
                            >
                                View {isPdf ? 'PDF' : 'Image'}
                            </Button>
                        </VStack>
                    ) : (
                        <Box py={2} textAlign="center" bg="gray.50" borderRadius="md" border="1px dashed" borderColor="gray.200">
                            <Text fontSize="2xs" color="gray.400" fontWeight="500">
                                No file attached
                            </Text>
                        </Box>
                    )}
                </Box>
            </Box>
        );
    };

    const getMonthlyPayment = (emp, month) => {
        return emp.monthlyPayments?.find(p => p.month === month) || { paymentMode: 'Cash', paymentStatus: 'Pending', presentDays: null, absentDays: null, upad: 0, incentive: 0 };
    };

    // Returns total days in the given YYYY-MM string
    const getDaysInMonth = (monthStr) => {
        if (!monthStr) return 30;
        const [y, m] = monthStr.split('-').map(Number);
        return new Date(y, m, 0).getDate();
    };

    const exportPaymentReportToExcel = () => {
        const month = reportMonthFilter;
        const reportRows = employees.filter(emp => {
            const monthData = getMonthlyPayment(emp, month);
            const matchesSearch = emp.name?.toLowerCase().includes(reportSearchQuery.toLowerCase()) || emp.empId?.toLowerCase().includes(reportSearchQuery.toLowerCase());
            const matchesMode = reportPaymentModeFilter === 'All' || monthData.paymentMode === reportPaymentModeFilter;
            const matchesStatus = reportPaymentStatusFilter === 'All' || monthData.paymentStatus === reportPaymentStatusFilter;
            const matchesFood = reportFoodFilter === 'All' || emp.foodAllowance === reportFoodFilter;
            const isHidden = emp.showInPaymentReport === false;
            return matchesSearch && matchesMode && matchesStatus && matchesFood && !isHidden;
        });

        const totalSalary = reportRows.reduce((acc, emp) => acc + parseFloat(emp.salary || 0), 0);
        let totalPayable = 0;

        let tableHtml = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
        <head>
            <meta charset="utf-8" />
            <style>
                table { border-collapse: collapse; width: 100%; font-family: 'Segoe UI', Arial, sans-serif; }
                th { background-color: #1e3a8a; color: #ffffff; font-weight: bold; padding: 12px 10px; border: 1px solid #94a3b8; text-align: center; font-size: 12px; }
                td { padding: 8px 10px; border: 1px solid #cbd5e1; font-size: 11px; vertical-align: middle; }
                .row-even { background-color: #ffffff; }
                .row-odd { background-color: #f8fafc; }
                .row-done { background-color: #ecfdf5; }
                .row-deactive { background-color: #fef2f2; }
                .badge-green { background-color: #dcfce7; color: #15803d; font-weight: bold; padding: 4px 8px; border-radius: 4px; }
                .badge-orange { background-color: #fef9c3; color: #a16207; font-weight: bold; padding: 4px 8px; border-radius: 4px; }
                .badge-red { background-color: #fee2e2; color: #b91c1c; font-weight: bold; padding: 4px 8px; border-radius: 4px; }
                .money { font-weight: bold; color: #0f172a; text-align: right; }
                .title-banner { background-color: #0f172a; color: #f8fafc; font-size: 16px; font-weight: bold; padding: 15px; text-align: center; border: 2px solid #334155; }
            </style>
        </head>
        <body>
            <table>
                <tr>
                    <td colspan="17" class="title-banner">EMPLOYEE MONTHLY PAYMENT REPORT — ${month}</td>
                </tr>
                <tr>
                    <td colspan="17" style="background-color: #e2e8f0; font-weight: bold; padding: 8px; color: #1e293b;">Generated On: ${new Date().toLocaleDateString()} | Total Employees: ${reportRows.length}</td>
                </tr>
                <tr></tr>
                <tr>
                    <th>SR. NO.</th>
                    <th>Month</th>
                    <th>Employee ID</th>
                    <th>Employee Name</th>
                    <th>Bank A/C No</th>
                    <th>IFSC Code</th>
                    <th>Monthly Salary (₹)</th>
                    <th>Total Days</th>
                    <th>Present</th>
                    <th>Absent</th>
                    <th>Per Day Salary (₹)</th>
                    <th>UPAD (₹)</th>
                    <th>Incentive (₹)</th>
                    <th>Payable Salary (₹)</th>
                    <th>Payment Mode</th>
                    <th>Payment Status</th>
                    <th>Employee Status</th>
                </tr>
        `;

        reportRows.forEach((emp, idx) => {
            const monthData = getMonthlyPayment(emp, month);
            const totalDays = getDaysInMonth(month);
            const salary = parseFloat(emp.salary || 0);
            const perDay = totalDays > 0 ? (salary / totalDays) : 0;
            const attCache = attendanceCache[`${emp._id}_${month}`];
            const present = attCache ? attCache.present : (monthData.presentDays ?? totalDays);
            const absent = attCache ? attCache.absent : (monthData.absentDays ?? 0);
            const upad = monthData.upad ?? 0;
            const incentive = monthData.incentive ?? 0;
            const payable = (perDay * present) - upad + incentive;
            totalPayable += payable;

            const isDone = monthData.paymentStatus === 'Done';
            const isDeactive = emp.status === 'Deactive';
            const rowClass = isDeactive ? 'row-deactive' : isDone ? 'row-done' : (idx % 2 === 0 ? 'row-even' : 'row-odd');

            const payStatusBadge = isDone ? 'badge-green' : 'badge-orange';
            const empStatusBadge = isDeactive ? 'badge-red' : 'badge-green';

            tableHtml += `
                <tr class="${rowClass}">
                    <td style="text-align: center; font-weight: bold;">${idx + 1}</td>
                    <td style="text-align: center;">${month}</td>
                    <td style="text-align: center; font-weight: bold; color: #2563eb;">${emp.empId || ''}</td>
                    <td style="font-weight: bold;">${emp.name || ''}</td>
                    <td style="font-family: monospace;">&nbsp;${emp.bankDetails?.accountNumber || '—'}</td>
                    <td style="text-align: center;">${emp.bankDetails?.ifscCode || '—'}</td>
                    <td class="money">₹${salary.toLocaleString('en-IN')}</td>
                    <td style="text-align: center;">${totalDays}</td>
                    <td style="text-align: center; font-weight: bold; color: #16a34a;">${present}</td>
                    <td style="text-align: center; font-weight: bold; color: ${absent > 0 ? '#dc2626' : '#16a34a'};">${absent}</td>
                    <td class="money">₹${perDay.toFixed(2)}</td>
                    <td class="money" style="color: #9333ea;">₹${upad.toLocaleString('en-IN')}</td>
                    <td class="money" style="color: #16a34a;">₹${incentive.toLocaleString('en-IN')}</td>
                    <td class="money" style="font-size: 12px; color: #16a34a;">₹${payable.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                    <td style="text-align: center;">${monthData.paymentMode}</td>
                    <td style="text-align: center;"><span class="${payStatusBadge}">${monthData.paymentStatus}</span></td>
                    <td style="text-align: center;"><span class="${empStatusBadge}">${emp.status || 'Active'}</span></td>
                </tr>
            `;
        });

        tableHtml += `
                <tr style="background-color: #cbd5e1; font-weight: bold; font-size: 13px;">
                    <td colspan="6" style="text-align: right; padding: 10px; color: #0f172a;">TOTALS:</td>
                    <td class="money" style="font-size: 13px; color: #0f172a;">₹${totalSalary.toLocaleString('en-IN')}</td>
                    <td colspan="6"></td>
                    <td class="money" style="font-size: 13px; color: #15803d;">₹${totalPayable.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                    <td colspan="3"></td>
                </tr>
            </table>
        </body>
        </html>
        `;

        const blob = new Blob([tableHtml], { type: 'application/vnd.ms-excel;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `Employee_Payment_Report_${month}.xls`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const exportPaymentReportToCSV = () => {
        const month = reportMonthFilter;
        const reportRows = employees.filter(emp => {
            const monthData = getMonthlyPayment(emp, month);
            const matchesSearch = emp.name?.toLowerCase().includes(reportSearchQuery.toLowerCase()) || emp.empId?.toLowerCase().includes(reportSearchQuery.toLowerCase());
            const matchesMode = reportPaymentModeFilter === 'All' || monthData.paymentMode === reportPaymentModeFilter;
            const matchesStatus = reportPaymentStatusFilter === 'All' || monthData.paymentStatus === reportPaymentStatusFilter;
            const matchesFood = reportFoodFilter === 'All' || emp.foodAllowance === reportFoodFilter;
            const isHidden = emp.showInPaymentReport === false;
            return matchesSearch && matchesMode && matchesStatus && matchesFood && !isHidden;
        });

        const headers = ['SR. NO.', 'Month', 'Employee ID', 'Name', 'Bank A/C No', 'IFSC Code', 'Monthly Salary (INR)', 'Total Days', 'Present', 'Absent', 'Per Day Salary', 'UPAD', 'Incentive', 'Payable Salary', 'Payment Mode', 'Payment Status', 'Employee Status'];
        const rows = reportRows.map((emp, idx) => {
            const monthData = getMonthlyPayment(emp, month);
            const totalDays = getDaysInMonth(month);
            const salary = parseFloat(emp.salary || 0);
            const perDay = totalDays > 0 ? (salary / totalDays) : 0;
            const attCache = attendanceCache[`${emp._id}_${month}`];
            const present = attCache ? attCache.present : (monthData.presentDays ?? totalDays);
            const absent = attCache ? attCache.absent : (monthData.absentDays ?? 0);
            const upad = monthData.upad ?? 0;
            const incentive = monthData.incentive ?? 0;
            const payable = (perDay * present) - upad + incentive;
            return [
                idx + 1,
                month,
                emp.empId || '',
                emp.name || '',
                emp.bankDetails?.accountNumber || '',
                emp.bankDetails?.ifscCode || '',
                salary,
                totalDays,
                present,
                absent,
                perDay.toFixed(2),
                upad,
                incentive,
                payable.toFixed(2),
                monthData.paymentMode,
                monthData.paymentStatus,
                emp.status || 'Active',
            ];
        });

        // BOM for Excel UTF-8 support
        const BOM = '\uFEFF';
        const csvContent = BOM + [headers.join(','), ...rows.map(r => r.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `Employee_Payment_Report_${month}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const exportBankExcel = () => {
        const month = reportMonthFilter;
        const reportRows = employees.filter(emp => {
            const monthData = getMonthlyPayment(emp, month);
            const matchesSearch = emp.name?.toLowerCase().includes(reportSearchQuery.toLowerCase()) || emp.empId?.toLowerCase().includes(reportSearchQuery.toLowerCase());
            const matchesMode = reportPaymentModeFilter === 'All' || monthData.paymentMode === reportPaymentModeFilter;
            const matchesStatus = reportPaymentStatusFilter === 'All' || monthData.paymentStatus === reportPaymentStatusFilter;
            const matchesFood = reportFoodFilter === 'All' || emp.foodAllowance === reportFoodFilter;
            const isHidden = emp.showInPaymentReport === false;
            return matchesSearch && matchesMode && matchesStatus && matchesFood && !isHidden;
        });

        const validRows = reportRows.filter(emp => emp.bankDetails?.accountNumber);
        if (validRows.length === 0) {
            toast({
                title: "No Data",
                description: "No employees with bank details found in the current filtered list.",
                status: "warning",
                duration: 3000,
                position: "bottom-right",
                isClosable: true
            });
            return;
        }

        toast({
            title: "Exporting Bank Excel",
            description: `Exporting bank details for ${validRows.length} employees.`,
            status: "info",
            duration: 2000,
            position: "bottom-right",
            isClosable: true
        });

        // Format date as DD-MM-YYYY
        const today = new Date();
        const valueDate = today.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-');

        const debitAccount = '201000478211';

        // Helper to get short month name
        const getMonthName = (monthStr) => {
            if (!monthStr) return '';
            const [y, m] = monthStr.split('-');
            const date = new Date(y, parseInt(m) - 1, 1);
            return date.toLocaleString('en-US', { month: 'short' }).toUpperCase();
        };
        const getYear = (monthStr) => {
            if (!monthStr) return '';
            return monthStr.split('-')[0];
        };

        const yearMonth = month.replace('-', '');
        const narration = `Salary for ${getMonthName(month)} ${getYear(month)}`.slice(0, 20);

        const headersList = [
            { name: 'Transaction Type', width: 130, align: 'left' },
            { name: 'Beneficiary Code', width: 120, align: 'left' },
            { name: 'Value Date', width: 100, align: 'left' },
            { name: 'Debit A/C Number', width: 140, align: 'left' },
            { name: 'Transaction Amount', width: 130, align: 'left' },
            { name: 'Beneficiary Name', width: 180, align: 'left' },
            { name: 'Beneficiary A/c No.', width: 150, align: 'center' },
            { name: 'IFSC Code', width: 110, align: 'center' },
            { name: 'Bene Email ID', width: 180, align: 'left' },
            { name: 'bene Mobile No', width: 120, align: 'left' },
            { name: 'Customer Ref No.', width: 130, align: 'left' },
            { name: 'Payment Narration', width: 180, align: 'left' }
        ];

        let tableHtml = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
        <head>
            <meta charset="utf-8" />
            <style>
                table { border-collapse: collapse; width: 100%; font-family: Calibri, Arial, sans-serif; }
                th { background-color: #C55A11; color: #FFFFFF; font-weight: bold; border: 1px solid #7F7F7F; text-align: left; font-size: 11pt; padding: 12px 10px; white-space: normal; }
                td { border: 1px solid #7F7F7F; font-size: 11pt; padding: 8px 10px; vertical-align: middle; white-space: nowrap; color: #000000; text-align: left; }
                .text { mso-number-format:"\\@"; }
            </style>
        </head>
        <body>
            <table>
                <thead>
                    <tr>
                        ${headersList.map(h => `<th width="${h.width}" style="background-color: #C55A11; color: #FFFFFF; font-weight: bold; padding: 12px 10px; border: 1px solid #7F7F7F; text-align: ${h.align}; font-size: 11pt; white-space: normal;">${h.name}</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
        `;

        validRows.forEach((emp) => {
            const monthData = getMonthlyPayment(emp, month);
            const totalDays = getDaysInMonth(month);
            const salary = parseFloat(emp.salary || 0);
            const perDay = totalDays > 0 ? (salary / totalDays) : 0;
            const attCache = attendanceCache[`${emp._id}_${month}`];
            const present = attCache ? attCache.present : (monthData.presentDays ?? totalDays);
            const upad = monthData.upad ?? 0;
            const incentive = monthData.incentive ?? 0;
            const payable = (perDay * present) - upad + incentive;
            const amount = Math.round(payable);

            const bankAccount = emp.bankDetails?.accountNumber || '';
            const ifsc = emp.bankDetails?.ifscCode || '';
            const cleanEmpId = (emp.empId || '').replace(/[^a-zA-Z0-9]/g, '');
            const customerRef = `${yearMonth}${cleanEmpId}`.slice(0, 15);

            let txType = 'N';
            if (ifsc.toUpperCase().startsWith('INDB')) {
                txType = 'I';
            } else if (amount >= 200000) {
                txType = 'R';
            } else {
                txType = 'N';
            }

            let cleanPhone = emp.phone ? emp.phone.replace(/\D/g, '') : '';
            if (cleanPhone.startsWith('0')) {
                cleanPhone = cleanPhone.substring(1);
            }
            if (cleanPhone && !cleanPhone.startsWith('91')) {
                cleanPhone = '91' + cleanPhone;
            }
            cleanPhone = cleanPhone.slice(0, 12);

            const emailVal = emp.email ? emp.email.slice(0, 70) : '';

            tableHtml += `
                <tr>
                    <td>${txType}</td>
                    <td></td>
                    <td class="text">${valueDate}</td>
                    <td class="text">${debitAccount}</td>
                    <td style="font-weight: bold;" class="text">${amount}</td>
                    <td>${(emp.name || '').toUpperCase().slice(0, 35)}</td>
                    <td style="text-align: center;" class="text">${bankAccount}</td>
                    <td style="text-align: center;" class="text">${ifsc}</td>
                    <td>${emailVal}</td>
                    <td class="text">${cleanPhone}</td>
                    <td class="text">${customerRef}</td>
                    <td>${narration}</td>
                </tr>
            `;
        });

        tableHtml += `
                </tbody>
            </table>
        </body>
        </html>
        `;

        const blob = new Blob([tableHtml], { type: 'application/vnd.ms-excel;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `salary.xls`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const UpadInputCell = ({ empId, initialUpad, onSave }) => {
        const [val, setVal] = useState(initialUpad ?? 0);

        useEffect(() => {
            setVal(initialUpad ?? 0);
        }, [initialUpad]);

        const handleBlurOrSubmit = () => {
            const numVal = parseFloat(val) || 0;
            if (numVal !== (initialUpad ?? 0)) {
                onSave(empId, 'upad', numVal);
            }
        };

        return (
            <VStack spacing={1} align="center">
                <Text fontSize="9px" color="purple.600" fontWeight="extrabold" letterSpacing="0.5px">UPAD (₹)</Text>
                <Input
                    size="sm"
                    h="28px"
                    w="85px"
                    textAlign="center"
                    fontWeight="bold"
                    fontSize="xs"
                    color="purple.800"
                    bg="purple.50"
                    borderColor="purple.200"
                    borderRadius="lg"
                    _hover={{ borderColor: "purple.400", bg: "purple.100" }}
                    _focus={{ borderColor: "purple.600", bg: "white", boxShadow: "0 0 0 1px #805AD5" }}
                    value={val}
                    onChange={(e) => setVal(e.target.value)}
                    onBlur={handleBlurOrSubmit}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.target.blur();
                        }
                    }}
                />
            </VStack>
        );
    };

    const IncentiveInputCell = ({ empId, initialIncentive, onSave }) => {
        const [val, setVal] = useState(initialIncentive ?? 0);

        useEffect(() => {
            setVal(initialIncentive ?? 0);
        }, [initialIncentive]);

        const handleBlurOrSubmit = () => {
            const numVal = parseFloat(val) || 0;
            if (numVal !== (initialIncentive ?? 0)) {
                onSave(empId, 'incentive', numVal);
            }
        };

        return (
            <VStack spacing={1} align="center">
                <Text fontSize="9px" color="green.600" fontWeight="extrabold" letterSpacing="0.5px">INCENTIVE (₹)</Text>
                <Input
                    size="sm"
                    h="28px"
                    w="85px"
                    textAlign="center"
                    fontWeight="bold"
                    fontSize="xs"
                    color="green.800"
                    bg="green.50"
                    borderColor="green.200"
                    borderRadius="lg"
                    _hover={{ borderColor: "green.400", bg: "green.100" }}
                    _focus={{ borderColor: "green.600", bg: "white", boxShadow: "0 0 0 1px #38A169" }}
                    value={val}
                    onChange={(e) => setVal(e.target.value)}
                    onBlur={handleBlurOrSubmit}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.target.blur();
                        }
                    }}
                />
            </VStack>
        );
    };

    const handleUpdatePaymentField = async (employeeId, field, value) => {
        try {
            const res = await api.put(`/employee-master/${employeeId}/monthly-payment`, {
                month: reportMonthFilter,
                [field]: value
            });
            if (res.data.success) {
                toast.closeAll();
                toast({
                    title: "Updated",
                    description: field === 'upad' ? `UPAD saved as ₹${value.toLocaleString()}` : field === 'incentive' ? `Incentive saved as ₹${value.toLocaleString()}` : `Payment details updated.`,
                    status: "success",
                    duration: 1500,
                    position: "bottom-right",
                    isClosable: true
                });
                fetchEmployees();
            }
        } catch (error) {
            toast.closeAll();
            toast({ title: "Error", description: error.response?.data?.message || "Failed to update record", status: "error", duration: 3000, position: "bottom-right" });
        }
    };

    return (
        <Box py={{ base: 3, md: 5 }} bg="gray.100" minH="100vh">
            <Container maxW="100%" px={{ base: 2, md: 4 }}>
                {!isInsideServices && <ModulePermissionBar moduleGroupKey="employeeMasterGroup" />}
                <Card variant="elevated" borderRadius="2xl" boxShadow="xl" bg="white" overflow="hidden">
                    <Box bgGradient="linear(to-r, blue.700, blue.600)" p={{ base: 4, md: 6 }} color="white">
                        <Stack direction={{ base: "column", md: "row" }} justify="space-between" align={{ base: "stretch", md: "center" }} spacing={4}>
                            <Box>
                                <HStack spacing={2.5}>
                                    <Icon as={FaUserTie} fontSize={{ base: "xl", md: "2xl" }} color="blue.200" />
                                    <Heading size={{ base: "md", md: "lg" }}>{editId ? 'Edit Employee' : 'Employee Master'}</Heading>
                                </HStack>
                                <Text opacity={0.85} fontSize={{ base: "xs", md: "sm" }} mt={1}>
                                    Manage company employee records, documents & payouts
                                </Text>
                            </Box>
                            <Flex direction={{ base: "column", sm: "row" }} align="center" gap={2} w={{ base: "full", md: "auto" }}>
                                <Input
                                    bg="white"
                                    color="gray.800"
                                    placeholder="Search Name, ID, Phone..."
                                    size="sm"
                                    borderRadius="xl"
                                    w={{ base: "full", sm: "220px", md: "260px" }}
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        const viewIdx = tabConfig.findIndex(t => t.id === 'view');
                                        if (viewIdx !== -1 && employeeActiveTab !== viewIdx) {
                                            setEmployeeActiveTab(viewIdx);
                                        }
                                    }}
                                    onClick={() => {
                                        const viewIdx = tabConfig.findIndex(t => t.id === 'view');
                                        if (viewIdx !== -1 && employeeActiveTab !== viewIdx) {
                                            setEmployeeActiveTab(viewIdx);
                                        }
                                    }}
                                />
                                <Button
                                    colorScheme="green"
                                    size="sm"
                                    w={{ base: "full", sm: "auto" }}
                                    leftIcon={<Icon as={FaPlus} />}
                                    onClick={() => {
                                        handleSelectEmployee({ target: { value: '' } });
                                        const formIdx = tabConfig.findIndex(t => t.id === 'form');
                                        if (formIdx !== -1) setEmployeeActiveTab(formIdx);
                                    }}
                                    borderRadius="xl"
                                    fontWeight="bold"
                                    shadow="md"
                                >
                                    Add New
                                </Button>
                            </Flex>
                        </Stack>
                    </Box>
                    <CardBody p={{ base: 3, md: 5 }}>
                        {tabConfig.length === 0 ? (
                            <Center py={14} bg="white" borderRadius="2xl" border="1px dashed" borderColor="gray.200">
                                <VStack spacing={3}>
                                    <Icon as={FaUserTie} w={10} h={10} color="orange.400" />
                                    <Text fontSize="md" fontWeight="bold" color="gray.600">No Authorized Sections Available</Text>
                                    <Text fontSize="xs" color="gray.400">Please contact your administrator to grant access to employee master features.</Text>
                                </VStack>
                            </Center>
                        ) : (
                            <Tabs index={employeeActiveTab} onChange={(idx) => setEmployeeActiveTab(idx)} colorScheme="blue" variant="soft-rounded" isLazy lazyBehavior="unmount">
                                <TabList
                                    mb={6}
                                    overflowX="auto"
                                    py={2}
                                    px={{ base: 2, md: 3 }}
                                    bg="gray.50"
                                    borderRadius="2xl"
                                    border="1px solid"
                                    borderColor="gray.200"
                                    display="flex"
                                    justifyContent={{ base: "flex-start", md: "center" }}
                                    whiteSpace="nowrap"
                                    sx={{
                                        WebkitOverflowScrolling: 'touch',
                                        '&::-webkit-scrollbar': { display: 'none' },
                                        scrollbarWidth: 'none'
                                    }}
                                >
                                    {tabConfig.map((tab) => (
                                        <Tab
                                            key={tab.id}
                                            fontWeight="bold"
                                            fontSize={{ base: "xs", md: "sm" }}
                                            borderRadius="xl"
                                            px={{ base: 4, md: 6 }}
                                            py={{ base: 2, md: 2.5 }}
                                            flexShrink={0}
                                            _selected={{ color: 'white', bg: 'blue.600', shadow: 'md' }}
                                        >
                                            {tab.label}
                                        </Tab>
                                    ))}
                                </TabList>

                                <TabPanels>
                                    {/* ── Tab 1: Form ── */}
                                    {tabConfig.some(t => t.id === 'form') && (
                                        <TabPanel p={0}>
                                    <form onSubmit={handleSubmit} onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}>
    <VStack spacing={5} align="stretch">

        {/* ── GroupBox 1: Core Identity & Work Assignment ── */}
        <Box 
            bg="white" 
            borderWidth="1px" 
            borderColor="gray.200" 
            borderRadius="xl" 
            p={{ base: 4, md: 5 }} 
            boxShadow="xs"
        >
            <Flex align="center" justify="space-between" mb={4} pb={2} borderBottom="1px solid" borderColor="gray.100">
                <HStack spacing={2.5}>
                    <Flex w="30px" h="30px" bg="blue.50" color="blue.600" borderRadius="lg" align="center" justifyContent="center">
                        <Icon as={FaUserTie} fontSize="sm" />
                    </Flex>
                    <Box>
                        <Heading size="xs" color="gray.800" fontWeight="700" letterSpacing="0.3px">
                            1. Employee Particulars &amp; Work Assignment
                        </Heading>
                    </Box>
                </HStack>
                {editId && (
                    <Badge colorScheme="blue" variant="subtle" px={2.5} py={0.5} borderRadius="md" fontSize="xs">
                        Editing: {formData.name || 'Employee'}
                    </Badge>
                )}
            </Flex>

            <SimpleGrid columns={{ base: 1, md: 4 }} spacing={5} alignItems="flex-start">
                {/* ── Photo Upload Column ── */}
                <Box textAlign="center" pt={1}>
                    <FormLabel fontWeight="600" fontSize="xs" color="gray.600" textAlign="center" mb={2}>
                        📷 Employee Photo
                    </FormLabel>
                    <Box
                        w="115px"
                        h="145px"
                        mx="auto"
                        borderRadius="md"
                        border="1px dashed"
                        borderColor={photoPreview ? "blue.400" : "blue.200"}
                        bg={photoPreview ? "transparent" : "blue.50"}
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        cursor="pointer"
                        overflow="hidden"
                        position="relative"
                        onClick={() => document.getElementById('photo-upload').click()}
                        _hover={{ borderColor: "blue.500", bg: "blue.100" }}
                        transition="all 0.15s"
                    >
                        <input type="file" id="photo-upload" hidden onChange={(e) => handleFileChange(e, 'photo')} accept="image/*" />
                        {photoPreview ? (
                            <Image src={photoPreview} alt="Preview" w="full" h="full" objectFit="cover" />
                        ) : (
                            <VStack spacing={1.5}>
                                <Icon as={FaCamera} w={5} h={5} color="blue.500" />
                                <Text fontSize="10px" color="blue.600" fontWeight="600">Upload Photo</Text>
                            </VStack>
                        )}
                    </Box>
                    <Box mt={2}>
                        <Badge colorScheme="purple" variant="subtle" px={2} py={0.5} borderRadius="md" fontSize="xs" fontWeight="600">
                            ID: {nextEmpId || '####'}
                        </Badge>
                    </Box>
                </Box>

                {/* ── Right Column: Fields ── */}
                <Box gridColumn={{ md: 'span 3' }}>
                    <SimpleGrid columns={{ base: 1, md: 3 }} spacing={3} mb={3}>
                        <FormControl isRequired>
                            <FormLabel fontWeight="600" fontSize="xs" color="gray.700" mb={1}>👤 Employee Full Name</FormLabel>
                            <InputGroup size="sm">
                                <InputLeftElement pointerEvents="none">
                                    <Icon as={FaUserTie} color="blue.500" />
                                </InputLeftElement>
                                <Input 
                                    borderRadius="md" 
                                    borderColor="gray.300"
                                    bg="white"
                                    _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px #3182ce" }}
                                    h="36px"
                                    value={formData.name} 
                                    onChange={(e) => handleChange(e, 'name')} 
                                />
                            </InputGroup>
                        </FormControl>
                        <FormControl isRequired>
                            <FormLabel fontWeight="600" fontSize="xs" color="gray.700" mb={1}>💰 Monthly Salary (₹)</FormLabel>
                            <InputGroup size="sm">
                                <InputLeftElement pointerEvents="none">
                                    <Icon as={FaMoneyBillWave} color="green.500" />
                                </InputLeftElement>
                                <Input 
                                    borderRadius="md" 
                                    borderColor="gray.300"
                                    bg="white"
                                    _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px #3182ce" }}
                                    h="36px"
                                    type="number" 
                                    value={formData.salary} 
                                    onChange={(e) => handleChange(e, 'salary')} 
                                />
                            </InputGroup>
                        </FormControl>
                        <FormControl>
                            <FormLabel fontWeight="600" fontSize="xs" color="gray.700" mb={1}>🗓️ Salary Date (Disbursement)</FormLabel>
                            <Input
                                type="date"
                                size="sm"
                                h="36px"
                                borderRadius="md"
                                borderColor="gray.300"
                                bg="white"
                                _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px #3182ce" }}
                                value={formData.salaryDate || ''}
                                onChange={(e) => handleChange(e, 'salaryDate')}
                            />
                        </FormControl>
                    </SimpleGrid>

                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3} mb={3}>
                        <FormControl>
                            <FormLabel fontWeight="600" fontSize="xs" color="gray.700" mb={1}>💼 Designation / Role</FormLabel>
                            <InputGroup size="sm">
                                <InputLeftElement pointerEvents="none">
                                    <Icon as={FaIdBadge} color="purple.500" />
                                </InputLeftElement>
                                <Input 
                                    borderRadius="md" 
                                    borderColor="gray.300"
                                    bg="white"
                                    _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px #3182ce" }}
                                    h="36px"
                                    value={formData.designation} 
                                    onChange={(e) => handleChange(e, 'designation')} 
                                />
                            </InputGroup>
                        </FormControl>
                        <FormControl isRequired>
                            <FormLabel fontWeight="600" fontSize="xs" color="gray.700" mb={1}>📱 Mobile Phone Number</FormLabel>
                            <InputGroup size="sm">
                                <InputLeftElement pointerEvents="none">
                                    <Icon as={FaPhoneAlt} color="teal.500" />
                                </InputLeftElement>
                                <Input 
                                    borderRadius="md" 
                                    borderColor="gray.300"
                                    bg="white"
                                    _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px #3182ce" }}
                                    h="36px"
                                    value={formData.phone} 
                                    onChange={(e) => handleChange(e, 'phone')} 
                                />
                            </InputGroup>
                        </FormControl>
                    </SimpleGrid>

                    <SimpleGrid columns={{ base: 1, sm: 3 }} spacing={3} mb={3}>
                        <FormControl>
                            <FormLabel fontWeight="600" fontSize="xs" color="gray.700" mb={1}>✉️ Email Address</FormLabel>
                            <InputGroup size="sm">
                                <InputLeftElement pointerEvents="none">
                                    <Icon as={FaEnvelope} color="blue.400" />
                                </InputLeftElement>
                                <Input 
                                    borderRadius="md" 
                                    borderColor="gray.300"
                                    bg="white"
                                    _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px #3182ce" }}
                                    h="36px"
                                    type="email" 
                                    value={formData.email} 
                                    onChange={(e) => handleChange(e, 'email')} 
                                    autoComplete="new-password" 
                                />
                            </InputGroup>
                        </FormControl>
                        <FormControl>
                            <FormLabel fontWeight="600" fontSize="xs" color="gray.700" mb={1}>🍽️ Food Allowance</FormLabel>
                            <Select
                                size="sm"
                                h="36px"
                                borderRadius="md"
                                borderColor="gray.300"
                                bg="white"
                                _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px #3182ce" }}
                                value={formData.foodAllowance || 'Food'}
                                onChange={(e) => handleChange(e, 'foodAllowance')}
                            >
                                <option value="Food">Food Included</option>
                                <option value="Without Food">Without Food</option>
                            </Select>
                        </FormControl>
                        <FormControl>
                            <FormLabel fontWeight="600" fontSize="xs" color="gray.700" mb={1}>🟢 Employee Status</FormLabel>
                            <Select
                                size="sm"
                                h="36px"
                                borderRadius="md"
                                borderColor="gray.300"
                                bg="white"
                                fontWeight="600"
                                _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px #3182ce" }}
                                value={formData.status || 'Active'}
                                onChange={(e) => handleChange(e, 'status')}
                            >
                                <option value="Active">Active Record</option>
                                <option value="Deactive">Deactive Record</option>
                            </Select>
                        </FormControl>
                    </SimpleGrid>

                    {/* Company & Branch Selection — No "ADD NEW" in company */}
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3} mb={3}>
                        <FormControl>
                            <FormLabel fontWeight="600" fontSize="xs" color="gray.700" mb={1}>
                                🏢 Company
                            </FormLabel>
                            <Select
                                size="sm"
                                h="36px"
                                borderRadius="md"
                                borderColor="gray.300"
                                bg="white"
                                _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px #3182ce" }}
                                value={formData.company}
                                onChange={(e) => handleChange(e, 'company')}
                            >
                                <option value="">Select Company</option>
                                {companyList.map((comp, idx) => (
                                    <option key={idx} value={comp}>{comp}</option>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl>
                            <Flex justify="space-between" align="center" mb={1}>
                                <FormLabel fontWeight="600" fontSize="xs" color="gray.700" mb={0}>
                                    📍 Branch / Location
                                </FormLabel>
                                <Button
                                    size="2xs"
                                    colorScheme="purple"
                                    variant="ghost"
                                    leftIcon={<Icon as={FaPlus} fontSize="9px" />}
                                    onClick={() => setIsAddBranchOpen(true)}
                                >
                                    + Add Branch
                                </Button>
                            </Flex>
                            <Select
                                size="sm"
                                h="36px"
                                borderRadius="md"
                                borderColor="gray.300"
                                bg="white"
                                _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px #3182ce" }}
                                value={formData.branch}
                                onChange={(e) => {
                                    if (e.target.value === '__ADD_NEW__') {
                                        setIsAddBranchOpen(true);
                                    } else {
                                        handleChange(e, 'branch');
                                    }
                                }}
                            >
                                <option value="">Select Branch</option>
                                {branchList.map((br, idx) => (
                                    <option key={idx} value={br}>{br}</option>
                                ))}
                                <option value="__ADD_NEW__">+ Add New Branch...</option>
                            </Select>
                        </FormControl>
                    </SimpleGrid>

                    {/* Requirement 7: Report by [id-name] & Date of Joining */}
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3} mb={1}>
                        <FormControl>
                            <FormLabel fontWeight="600" fontSize="xs" color="gray.700" mb={1}>
                                👔 Reporting To / Manager
                            </FormLabel>
                            <Select
                                size="sm"
                                h="36px"
                                borderRadius="md"
                                borderColor="gray.300"
                                bg="white"
                                _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px #3182ce" }}
                                value={formData.reportedTo}
                                onChange={(e) => handleChange(e, 'reportedTo')}
                            >
                                <option value="">None (Top Level Management / Self-Reporting)</option>
                                {employees
                                    .filter(e => !editId || e._id !== editId)
                                    .map(e => {
                                        const formattedVal = `[${e.empId || '----'} - ${e.name}]`;
                                        return (
                                            <option key={e._id} value={formattedVal}>
                                                {formattedVal} {e.designation ? `— ${e.designation}` : ''} {e.company ? `(${e.company})` : ''}
                                            </option>
                                        );
                                    })
                                }
                            </Select>
                        </FormControl>

                        <FormControl>
                            <FormLabel fontWeight="600" fontSize="xs" color="gray.700" mb={1}>
                                📅 Date of Joining
                            </FormLabel>
                            <Input
                                size="sm"
                                type="date"
                                h="36px"
                                borderRadius="md"
                                borderColor="gray.300"
                                bg="white"
                                _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px #3182ce" }}
                                value={formData.joiningDate}
                                onChange={(e) => handleChange(e, 'joiningDate')}
                            />
                        </FormControl>
                    </SimpleGrid>
                </Box>
            </SimpleGrid>
        </Box>

        {/* ── GroupBox 2: Personal Demographics & Family Particulars ── */}
        <Box 
            bg="white" 
            borderWidth="1px" 
            borderColor="gray.200" 
            borderRadius="xl" 
            p={{ base: 4, md: 5 }} 
            boxShadow="xs"
        >
            <Flex align="center" justify="space-between" mb={3} pb={2} borderBottom="1px solid" borderColor="gray.100">
                <HStack spacing={2.5}>
                    <Flex w="30px" h="30px" bg="purple.50" color="purple.600" borderRadius="lg" align="center" justifyContent="center">
                        <Icon as={FaUsers} fontSize="sm" />
                    </Flex>
                    <Box>
                        <Heading size="xs" color="gray.800" fontWeight="700" letterSpacing="0.3px">
                            2. Personal Demographics &amp; Family Particulars
                        </Heading>
                    </Box>
                </HStack>
            </Flex>

            <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing={3} mb={formData.maritalStatus === 'Married' ? 3 : 0}>
                {/* Gender */}
                <FormControl>
                    <FormLabel fontWeight="600" fontSize="xs" color="gray.700" mb={1}>
                        ⚧ Gender
                    </FormLabel>
                    <Select
                        size="sm"
                        h="36px"
                        borderRadius="md"
                        borderColor="gray.300"
                        bg="white"
                        _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px #3182ce" }}
                        value={formData.gender}
                        onChange={(e) => handleChange(e, 'gender')}
                    >
                        <option value="">Select Gender</option>
                        <option value="Male">👨 Male</option>
                        <option value="Female">👩 Female</option>
                        <option value="Other">🧑 Other</option>
                    </Select>
                </FormControl>

                {/* Date of Birth */}
                <FormControl>
                    <Flex justify="space-between" align="center" mb={1}>
                        <FormLabel fontWeight="600" fontSize="xs" color="gray.700" mb={0}>
                            🎂 Date of Birth (DOB)
                        </FormLabel>
                        {formData.dob && calculateAge(formData.dob) !== null && (
                            <Badge colorScheme="green" variant="subtle" fontSize="2xs" px={2} py={0.5} borderRadius="full">
                                {calculateAge(formData.dob)} yrs old
                            </Badge>
                        )}
                    </Flex>
                    <Input 
                        size="sm"
                        h="36px"
                        borderRadius="md" 
                        borderColor="gray.300"
                        bg="white"
                        _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px #3182ce" }}
                        type="date"
                        value={formData.dob}
                        onChange={(e) => handleChange(e, 'dob')}
                        max={new Date().toISOString().split('T')[0]}
                    />
                </FormControl>

                {/* Blood Group */}
                <FormControl>
                    <FormLabel fontWeight="600" fontSize="xs" color="gray.700" mb={1}>
                        🩸 Blood Group
                    </FormLabel>
                    <Select
                        size="sm"
                        h="36px"
                        borderRadius="md"
                        borderColor="gray.300"
                        bg="white"
                        _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px #3182ce" }}
                        value={formData.bloodGroup}
                        onChange={(e) => handleChange(e, 'bloodGroup')}
                    >
                        <option value="">Select Blood Group</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                    </Select>
                </FormControl>

                {/* Marital Status */}
                <FormControl>
                    <FormLabel fontWeight="600" fontSize="xs" color="gray.700" mb={1}>
                        💍 Marital Status
                    </FormLabel>
                    <Select
                        size="sm"
                        h="36px"
                        borderRadius="md"
                        borderColor="gray.300"
                        bg="white"
                        _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px #3182ce" }}
                        value={formData.maritalStatus || 'Single'}
                        onChange={(e) => handleChange(e, 'maritalStatus')}
                    >
                        <option value="Single">Single</option>
                        <option value="Married">Married</option>
                        <option value="Divorced">Divorced</option>
                        <option value="Widowed">Widowed</option>
                    </Select>
                </FormControl>
            </SimpleGrid>

            {/* If Married -> Marriage Date (optional) */}
            {formData.maritalStatus === 'Married' && (
                <Box p={3} bg="pink.50" borderRadius="md" border="1px dashed" borderColor="pink.200">
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3} alignItems="center">
                        <FormControl>
                            <Flex justify="space-between" align="center" mb={1}>
                                <FormLabel fontWeight="600" fontSize="xs" color="pink.800" mb={0}>
                                    📅 Marriage / Anniversary Date
                                </FormLabel>
                                <Badge colorScheme="pink" variant="subtle" fontSize="2xs" px={1.5} py={0.5} borderRadius="md">
                                    Optional
                                </Badge>
                            </Flex>
                            <Input 
                                size="sm"
                                h="36px"
                                borderRadius="md" 
                                borderColor="pink.300"
                                bg="white"
                                _focus={{ borderColor: "pink.500", boxShadow: "0 0 0 1px #ed64a6" }}
                                type="date"
                                value={formData.marriageDate}
                                onChange={(e) => handleChange(e, 'marriageDate')}
                                max={new Date().toISOString().split('T')[0]}
                            />
                        </FormControl>
                        <Box pt={{ base: 0, md: 5 }}>
                            <Text fontSize="2xs" color="pink.700">
                                ℹ️ Used for anniversary greetings and family records.
                            </Text>
                        </Box>
                    </SimpleGrid>
                </Box>
            )}
        </Box>

        {/* ── GroupBox 3: Company Items, Insurance & Mediclaim ── */}
        <Box 
            bg="white" 
            borderWidth="1px" 
            borderColor="gray.200" 
            borderRadius="xl" 
            p={{ base: 4, md: 5 }} 
            boxShadow="xs"
        >
            <Flex align="center" justify="space-between" mb={3} pb={2} borderBottom="1px solid" borderColor="gray.100">
                <HStack spacing={2.5}>
                    <Flex w="30px" h="30px" bg="teal.50" color="teal.600" borderRadius="lg" align="center" justifyContent="center">
                        <Icon as={FaShieldAlt} fontSize="sm" />
                    </Flex>
                    <Box>
                        <Heading size="xs" color="gray.800" fontWeight="700" letterSpacing="0.3px">
                            3. Company Assets, Insurance &amp; Mediclaim
                        </Heading>
                    </Box>
                </HStack>
            </Flex>

            <VStack spacing={3.5} align="stretch">
                {/* ── Subsection A: Insurance Policy & Documents ── */}
                <Box p={3.5} bg="gray.50" borderRadius="lg" border="1px solid" borderColor="gray.200">
                    <Flex align="center" justify="space-between" mb={2.5}>
                        <HStack spacing={2}>
                            <Icon as={FaShieldAlt} color="blue.600" fontSize="xs" />
                            <Text fontWeight="600" fontSize="xs" color="blue.800">
                                🛡️ Corporate Accidental / Term Insurance
                            </Text>
                        </HStack>
                    </Flex>
                    <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing={3} alignItems="flex-start">
                        <FormControl>
                            <FormLabel fontSize="xs" fontWeight="600" color="gray.700" mb={1} noOfLines={1}>Policy Number</FormLabel>
                            <Input
                                size="sm"
                                h="36px"
                                borderRadius="md"
                                bg="white"
                                borderColor="gray.300"
                                value={formData.insuranceNumber}
                                onChange={(e) => handleChange(e, 'insuranceNumber')}
                            />
                        </FormControl>
                        <FormControl>
                            <FormLabel fontSize="xs" fontWeight="600" color="gray.700" mb={1} noOfLines={1}>Insurance Provider</FormLabel>
                            <Input
                                size="sm"
                                h="36px"
                                borderRadius="md"
                                bg="white"
                                borderColor="gray.300"
                                value={formData.insuranceProvider}
                                onChange={(e) => handleChange(e, 'insuranceProvider')}
                            />
                        </FormControl>
                        <FormControl>
                            <FormLabel fontSize="xs" fontWeight="600" color="gray.700" mb={1} noOfLines={1}>Policy Expiry Date</FormLabel>
                            <Input
                                size="sm"
                                h="36px"
                                borderRadius="md"
                                bg="white"
                                borderColor="gray.300"
                                type="date"
                                value={formData.insuranceExpiry}
                                onChange={(e) => handleChange(e, 'insuranceExpiry')}
                            />
                        </FormControl>
                        <MultiDocUploader
                            label="Insurance Documents"
                            field="insuranceDocs"
                            icon={FaShieldAlt}
                            colorScheme="blue"
                        />
                    </SimpleGrid>
                </Box>

                {/* ── Subsection B: Mediclaim Policy & Documents ── */}
                <Box p={3.5} bg="gray.50" borderRadius="lg" border="1px solid" borderColor="gray.200">
                    <Flex align="center" justify="space-between" mb={2.5}>
                        <HStack spacing={2}>
                            <Icon as={FaMedkit} color="green.600" fontSize="xs" />
                            <Text fontWeight="600" fontSize="xs" color="green.800">
                                🏥 Health Mediclaim &amp; Cards
                            </Text>
                        </HStack>
                    </Flex>
                    <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing={3} alignItems="flex-start">
                        <FormControl>
                            <FormLabel fontSize="xs" fontWeight="600" color="gray.700" mb={1} noOfLines={1}>Mediclaim / Card No.</FormLabel>
                            <Input
                                size="sm"
                                h="36px"
                                borderRadius="md"
                                bg="white"
                                borderColor="gray.300"
                                value={formData.mediclaimNumber}
                                onChange={(e) => handleChange(e, 'mediclaimNumber')}
                            />
                        </FormControl>
                        <FormControl>
                            <FormLabel fontSize="xs" fontWeight="600" color="gray.700" mb={1} noOfLines={1}>Mediclaim Provider / TPA</FormLabel>
                            <Input
                                size="sm"
                                h="36px"
                                borderRadius="md"
                                bg="white"
                                borderColor="gray.300"
                                value={formData.mediclaimProvider}
                                onChange={(e) => handleChange(e, 'mediclaimProvider')}
                            />
                        </FormControl>
                        <FormControl>
                            <FormLabel fontSize="xs" fontWeight="600" color="gray.700" mb={1} noOfLines={1}>Mediclaim Expiry Date</FormLabel>
                            <Input
                                size="sm"
                                h="36px"
                                borderRadius="md"
                                bg="white"
                                borderColor="gray.300"
                                type="date"
                                value={formData.mediclaimExpiry}
                                onChange={(e) => handleChange(e, 'mediclaimExpiry')}
                            />
                        </FormControl>
                        <MultiDocUploader
                            label="Mediclaim Cards &amp; Docs"
                            field="mediclaimDocs"
                            icon={FaMedkit}
                            colorScheme="green"
                        />
                    </SimpleGrid>
                </Box>

                {/* ── Subsection C: Company Issued Items / Assets ── */}
                <Box p={3.5} bg="gray.50" borderRadius="lg" border="1px solid" borderColor="gray.200">
                    <Flex align="center" justify="space-between" mb={2.5}>
                        <HStack spacing={2}>
                            <Icon as={FaLaptop} color="teal.600" fontSize="xs" />
                            <Text fontWeight="600" fontSize="xs" color="teal.800">
                                💻 Company Issued Items &amp; Assets
                            </Text>
                        </HStack>
                    </Flex>
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3} alignItems="flex-start">
                        <FormControl>
                            <FormLabel fontSize="xs" fontWeight="600" color="gray.700" mb={1} noOfLines={1}>
                                List of Company Items Handed Over
                            </FormLabel>
                            <Textarea
                                size="sm"
                                borderRadius="md"
                                bg="white"
                                borderColor="gray.300"
                                placeholder="Laptop, SIM, safety gear, tools..."
                                rows={2}
                                value={formData.issuedItems}
                                onChange={(e) => handleChange(e, 'issuedItems')}
                            />
                        </FormControl>
                        <Box>
                            <MultiDocUploader
                                label="Item Handover Slips &amp; Documents"
                                field="companyItemDocs"
                                icon={FaLaptop}
                                colorScheme="teal"
                            />
                        </Box>
                    </SimpleGrid>
                </Box>
            </VStack>
        </Box>

        {/* ── GroupBox 4: Career & Statutory Documents (Resume, Salary Slips, KYC) ── */}
        <Box 
            bg="white" 
            borderWidth="1px" 
            borderColor="gray.200" 
            borderRadius="xl" 
            p={{ base: 4, md: 5 }} 
            boxShadow="xs"
        >
            <Flex align="center" justify="space-between" mb={3} pb={2} borderBottom="1px solid" borderColor="gray.100">
                <HStack spacing={2.5}>
                    <Flex w="30px" h="30px" bg="orange.50" color="orange.600" borderRadius="lg" align="center" justifyContent="center">
                        <Icon as={FaBriefcase} fontSize="sm" />
                    </Flex>
                    <Box>
                        <Heading size="xs" color="gray.800" fontWeight="700" letterSpacing="0.3px">
                            4. Career Credentials, Salary Slips &amp; Statutory KYC Documents
                        </Heading>
                    </Box>
                </HStack>
            </Flex>

            {/* Resume, Joining Letter and Salary Slip / Bank Statement Uploader */}
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={3} mb={4} p={3.5} bg="gray.50" borderRadius="lg" border="1px solid" borderColor="gray.200" alignItems="flex-start">
                <ResumeUploadBlock />
                <FileUploadInput
                    label="Joining Letter (PDF)"
                    field="joiningLetter"
                    accept=".pdf,.png,.jpg,.jpeg"
                    isRequired={false}
                />
                <MultiDocUploader
                    label="Salary Slips &amp; Bank Statements"
                    field="salarySlips"
                    icon={FaMoneyBillWave}
                    colorScheme="orange"
                />
            </SimpleGrid>

            {/* Statutory KYC Cards */}
            <Text fontSize="xs" fontWeight="600" color="gray.700" mb={2}>💳 Government Identity Cards (KYC Proofs &amp; Numbers):</Text>
            <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing={3}>
                <Box p={3} bg="gray.50" borderRadius="md" border="1px solid" borderColor="gray.200">
                    <FormLabel fontSize="xs" fontWeight="600" color="gray.700" mb={1}>
                        💳 Aadhaar Card No.
                    </FormLabel>
                    <Input
                        size="sm"
                        h="34px"
                        borderRadius="md"
                        bg="white"
                        borderColor="gray.300"
                        placeholder="12-digit Aadhaar No."
                        value={formData.aadharNumber}
                        onChange={(e) => handleChange(e, 'aadharNumber')}
                        maxLength={14}
                        mb={2}
                    />
                    <FileUploadInput label="Aadhaar File" field="aadharCard" />
                </Box>
                <Box p={3} bg="gray.50" borderRadius="md" border="1px solid" borderColor="gray.200">
                    <FormLabel fontSize="xs" fontWeight="600" color="gray.700" mb={1}>
                        💳 PAN Card No.
                    </FormLabel>
                    <Input
                        size="sm"
                        h="34px"
                        borderRadius="md"
                        bg="white"
                        borderColor="gray.300"
                        placeholder="10-digit PAN No."
                        value={formData.panNumber}
                        onChange={(e) => handleChange(e, 'panNumber')}
                        textTransform="uppercase"
                        maxLength={10}
                        mb={2}
                    />
                    <FileUploadInput label="PAN File" field="panCard" />
                </Box>
                <Box p={3} bg="gray.50" borderRadius="md" border="1px solid" borderColor="gray.200">
                    <FormLabel fontSize="xs" fontWeight="600" color="gray.700" mb={1}>
                        💳 Voter ID No.
                    </FormLabel>
                    <Input
                        size="sm"
                        h="34px"
                        borderRadius="md"
                        bg="white"
                        borderColor="gray.300"
                        placeholder="Voter ID No."
                        value={formData.voterIdNumber}
                        onChange={(e) => handleChange(e, 'voterIdNumber')}
                        textTransform="uppercase"
                        mb={2}
                    />
                    <FileUploadInput label="Voter File" field="voterId" />
                </Box>
                <Box p={3} bg="gray.50" borderRadius="md" border="1px solid" borderColor="gray.200">
                    <FormLabel fontSize="xs" fontWeight="600" color="gray.700" mb={1}>
                        🚗 Driving License No.
                    </FormLabel>
                    <Input
                        size="sm"
                        h="34px"
                        borderRadius="md"
                        bg="white"
                        borderColor="gray.300"
                        placeholder="DL Number"
                        value={formData.drivingLicenseNumber}
                        onChange={(e) => handleChange(e, 'drivingLicenseNumber')}
                        textTransform="uppercase"
                        mb={2}
                    />
                    <FileUploadInput label="License File" field="drivingLicense" />
                </Box>
            </SimpleGrid>
        </Box>

        {/* ── GroupBox 5: Residential Addresses ── */}
        <Box 
            bg="white" 
            borderWidth="1px" 
            borderColor="gray.200" 
            borderRadius="xl" 
            p={{ base: 4, md: 5 }} 
            boxShadow="xs"
        >
            <Flex align="center" justify="space-between" mb={3} pb={2} borderBottom="1px solid" borderColor="gray.100">
                <HStack spacing={2.5}>
                    <Flex w="30px" h="30px" bg="blue.50" color="blue.600" borderRadius="lg" align="center" justifyContent="center">
                        <Icon as={FaMapMarkerAlt} fontSize="sm" />
                    </Flex>
                    <Box>
                        <Heading size="xs" color="gray.800" fontWeight="700" letterSpacing="0.3px">
                            5. Residential &amp; Native Addresses
                        </Heading>
                    </Box>
                </HStack>
                <Checkbox 
                    colorScheme="blue" 
                    fontWeight="600" 
                    fontSize="xs"
                    isChecked={sameAsAddress} 
                    onChange={handleCheckboxChange}
                >
                    Permanent is Same as Primary Address
                </Checkbox>
            </Flex>

            {/* Primary Address */}
            <Box p={3.5} bg="gray.50" borderRadius="lg" border="1px solid" borderColor="gray.200" mb={sameAsAddress ? 0 : 3}>
                <Flex align="center" justify="space-between" mb={2}>
                    <HStack spacing={1.5}>
                        <Icon as={FaMapMarkerAlt} color="blue.600" fontSize="xs" />
                        <Text fontWeight="600" fontSize="xs" color="blue.800">
                            🏠 Primary / Current Residence Address
                        </Text>
                    </HStack>
                </Flex>
                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={2.5}>
                    <FormControl gridColumn={{ md: 'span 3' }}>
                        <Input 
                            size="sm" 
                            h="34px" 
                            borderRadius="md" 
                            bg="white" 
                            borderColor="gray.300"
                            placeholder="Street address, building, area" 
                            value={formData.addressLine1.street} 
                            onChange={(e) => handleChange(e, 'addressLine1', 'street')} 
                        />
                    </FormControl>
                    <FormControl>
                        <Input
                            size="sm"
                            h="34px"
                            borderRadius="md" 
                            bg="white" 
                            borderColor="gray.300"
                            placeholder="Pincode"
                            maxLength={6}
                            value={formData.addressLine1.pincode}
                            onChange={(e) => handleChange(e, 'addressLine1', 'pincode')}
                        />
                        {pincodeLoading1 && <Text fontSize="2xs" color="blue.600" mt={0.5}>Fetching district...</Text>}
                    </FormControl>
                    <FormControl gridColumn={{ md: 'span 2' }}>
                        <Input 
                            size="sm" 
                            h="34px" 
                            borderRadius="md" 
                            bg="white" 
                            borderColor="gray.300"
                            placeholder="City / District" 
                            value={formData.addressLine1.city} 
                            onChange={(e) => handleChange(e, 'addressLine1', 'city')} 
                        />
                    </FormControl>
                </SimpleGrid>
            </Box>

            {/* Secondary Address (if not same) */}
            {!sameAsAddress && (
                <Box p={3.5} bg="gray.50" borderRadius="lg" border="1px solid" borderColor="gray.200">
                    <Flex align="center" justify="space-between" mb={2}>
                        <HStack spacing={1.5}>
                            <Icon as={FaMapMarkerAlt} color="purple.600" fontSize="xs" />
                            <Text fontWeight="600" fontSize="xs" color="purple.800">
                                🏡 Secondary / Permanent Native Address
                            </Text>
                        </HStack>
                    </Flex>
                    <SimpleGrid columns={{ base: 1, md: 3 }} spacing={2.5}>
                        <FormControl gridColumn={{ md: 'span 3' }}>
                            <Input 
                                size="sm" 
                                h="34px" 
                                borderRadius="md" 
                                bg="white" 
                                borderColor="gray.300"
                                placeholder="Secondary street, village, area" 
                                value={formData.addressLine2.street} 
                                onChange={(e) => handleChange(e, 'addressLine2', 'street')} 
                            />
                        </FormControl>
                        <FormControl>
                            <Input
                                size="sm"
                                h="34px"
                                borderRadius="md" 
                                bg="white" 
                                borderColor="gray.300"
                                placeholder="Pincode"
                                maxLength={6}
                                value={formData.addressLine2.pincode}
                                onChange={(e) => handleChange(e, 'addressLine2', 'pincode')}
                            />
                            {pincodeLoading2 && <Text fontSize="2xs" color="blue.600" mt={0.5}>Fetching district...</Text>}
                        </FormControl>
                        <FormControl gridColumn={{ md: 'span 2' }}>
                            <Input 
                                size="sm" 
                                h="34px" 
                                borderRadius="md" 
                                bg="white" 
                                borderColor="gray.300"
                                placeholder="City / District" 
                                value={formData.addressLine2.city} 
                                onChange={(e) => handleChange(e, 'addressLine2', 'city')} 
                            />
                        </FormControl>
                    </SimpleGrid>
                </Box>
            )}
        </Box>

        {/* ── GroupBox 6: Bank Account & Disbursement Credentials ── */}
        <Box 
            bg="white" 
            borderWidth="1px" 
            borderColor="gray.200" 
            borderRadius="xl" 
            p={{ base: 4, md: 5 }} 
            boxShadow="xs"
        >
            <Flex align="center" justify="space-between" mb={3} pb={2} borderBottom="1px solid" borderColor="gray.100">
                <HStack spacing={2.5}>
                    <Flex w="30px" h="30px" bg="green.50" color="green.600" borderRadius="lg" align="center" justifyContent="center">
                        <Icon as={FaIdBadge} fontSize="sm" />
                    </Flex>
                    <Box>
                        <Heading size="xs" color="gray.800" fontWeight="700" letterSpacing="0.3px">
                            6. Bank Account &amp; Disbursement Credentials
                        </Heading>
                    </Box>
                </HStack>
                {bankVerified && (
                    <Badge colorScheme="green" px={2} py={0.5} borderRadius="md" fontSize="xs">
                        ✓ Verified
                    </Badge>
                )}
            </Flex>

            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={3} mb={3}>
                <FormControl>
                    <FormLabel fontWeight="600" fontSize="xs" color="gray.700" mb={1}>🏦 IFSC Code</FormLabel>
                    <HStack spacing={1.5}>
                        <Input
                            size="sm"
                            h="36px"
                            borderRadius="md" 
                            bg="white" 
                            borderColor="gray.300"
                            placeholder="IFSC Code"
                            value={formData.ifscCode}
                            onChange={(e) => handleChange(e, 'ifscCode')}
                            textTransform="uppercase"
                            maxLength={11}
                            fontWeight="mono"
                        />
                        <Button
                            type="button"
                            size="sm"
                            h="36px"
                            colorScheme={bankVerified ? 'green' : 'blue'}
                            variant={bankVerified ? 'solid' : 'outline'}
                            onClick={handleVerifyBank}
                            isLoading={bankVerifying}
                            minW="75px"
                            fontSize="xs"
                            borderRadius="md"
                        >
                            {bankVerified ? '✓ Verified' : 'Verify'}
                        </Button>
                    </HStack>
                </FormControl>
                <FormControl>
                    <FormLabel fontWeight="600" fontSize="xs" color="gray.700" mb={1}>🏛️ Bank Name</FormLabel>
                    <Input 
                        size="sm"
                        h="36px"
                        borderRadius="md" 
                        bg="white" 
                        borderColor="gray.300"
                        placeholder="Bank Name" 
                        value={formData.bankName} 
                        onChange={(e) => handleChange(e, 'bankName')} 
                        readOnly={bankVerified} 
                    />
                </FormControl>
                <FormControl>
                    <FormLabel fontWeight="600" fontSize="xs" color="gray.700" mb={1}>👤 Account Holder Name</FormLabel>
                    <Input 
                        size="sm"
                        h="36px"
                        borderRadius="md" 
                        bg="white" 
                        borderColor="gray.300"
                        placeholder="Account Holder Name" 
                        value={formData.accountName} 
                        onChange={(e) => handleChange(e, 'accountName')} 
                    />
                </FormControl>
            </SimpleGrid>

            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={3} alignItems="flex-start">
                <FormControl isRequired>
                    <FormLabel fontWeight="600" fontSize="xs" color="gray.700" mb={1} noOfLines={1}>🔢 Account Number</FormLabel>
                    <Input
                        size="sm"
                        h="36px"
                        borderRadius="md" 
                        bg="white" 
                        borderColor="gray.300"
                        placeholder="Account Number"
                        value={formData.accountNumber} 
                        onChange={(e) => handleChange(e, 'accountNumber')}
                        type="password"
                        fontWeight="mono"
                    />
                </FormControl>
                <FormControl isRequired>
                    <FormLabel fontWeight="600" fontSize="xs" color="gray.700" mb={1} noOfLines={1}>🔒 Confirm Account Number</FormLabel>
                    <Input 
                        size="sm"
                        h="36px"
                        borderRadius="md" 
                        bg="white" 
                        borderColor="gray.300"
                        placeholder="Confirm Account Number" 
                        value={formData.confirmAccountNumber} 
                        onChange={(e) => handleChange(e, 'confirmAccountNumber')} 
                        type="text" 
                        fontWeight="mono"
                    />
                </FormControl>
                <MultiDocUploader
                    label="Bank Proof (Passbook / Cheque)"
                    field="bankDocuments"
                    icon={FaCloudUploadAlt}
                    colorScheme="green"
                />
            </SimpleGrid>
        </Box>

        {/* ── GroupBox 7: Emergency Contact Particulars ── */}
        <Box 
            bg="white" 
            borderWidth="1px" 
            borderColor="gray.200" 
            borderRadius="xl" 
            p={{ base: 4, md: 5 }} 
            boxShadow="xs"
        >
            <Flex align="center" justify="space-between" mb={3} pb={2} borderBottom="1px solid" borderColor="gray.100">
                <HStack spacing={2.5}>
                    <Flex w="30px" h="30px" bg="red.50" color="red.600" borderRadius="lg" align="center" justifyContent="center">
                        <Icon as={FaPhoneAlt} fontSize="sm" />
                    </Flex>
                    <Box>
                        <Heading size="xs" color="gray.800" fontWeight="700" letterSpacing="0.3px">
                            7. Emergency Contact Particulars
                        </Heading>
                    </Box>
                </HStack>
            </Flex>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                <FormControl>
                    <FormLabel fontWeight="600" fontSize="xs" color="gray.700" mb={1}>👤 Contact Person Name</FormLabel>
                    <Input 
                        size="sm"
                        h="36px"
                        borderRadius="md" 
                        bg="white" 
                        borderColor="gray.300"
                        placeholder="Contact Person Name" 
                        value={formData.emergencyContact.name} 
                        onChange={(e) => handleChange(e, 'emergencyContact', 'name')} 
                    />
                </FormControl>
                <FormControl>
                    <FormLabel fontWeight="600" fontSize="xs" color="gray.700" mb={1}>📞 Emergency Mobile Number</FormLabel>
                    <Input 
                        size="sm"
                        h="36px"
                        borderRadius="md" 
                        bg="white" 
                        borderColor="gray.300"
                        placeholder="Emergency Mobile Number" 
                        value={formData.emergencyContact.phone} 
                        onChange={(e) => handleChange(e, 'emergencyContact', 'phone')} 
                    />
                </FormControl>
            </SimpleGrid>
        </Box>

        {/* ── Command Bar / Action Toolbar ── */}
        <Box 
            bg="white" 
            p={4} 
            borderRadius="xl" 
            borderWidth="1px" 
            borderColor="gray.200" 
            boxShadow="xs"
        >
            <Flex direction={{ base: "column", sm: "row" }} justify="space-between" align="center" gap={3}>
                <HStack spacing={2}>
                    <Badge colorScheme="blue" variant="subtle" px={2} py={1} borderRadius="md" fontSize="xs">
                        * Required Fields
                    </Badge>
                </HStack>
                <HStack spacing={3} w={{ base: "full", sm: "auto" }}>
                    <Button
                        type="button"
                        variant="outline"
                        colorScheme="gray"
                        h="38px"
                        px={5}
                        borderRadius="md"
                        fontSize="sm"
                        onClick={() => {
                            handleSelectEmployee({ target: { value: '' } });
                        }}
                    >
                        Reset / Clear
                    </Button>
                    <Button
                        type="submit"
                        colorScheme="blue"
                        h="38px"
                        px={7}
                        borderRadius="md"
                        fontSize="sm"
                        fontWeight="600"
                        isLoading={isLoading}
                        boxShadow="sm"
                    >
                        {editId ? 'Update Employee Record' : 'Save Employee Record'}
                    </Button>
                </HStack>
            </Flex>
        </Box>

    </VStack>
</form>
                                </TabPanel>
                            )}

                                {/* ── Tab 2: View (List) ── */}
                                {tabConfig.some(t => t.id === 'view') && (
                                    <TabPanel p={0}>
                                        <Box mt={2}>
                                            {/* Controls Header: Sub-tabs + View Switcher */}
                                            <Flex
                                                direction={{ base: "column", md: "row" }}
                                                justify="space-between"
                                                align={{ base: "stretch", md: "center" }}
                                                mb={5}
                                                gap={3}
                                                bg="white"
                                                p={{ base: 3, md: 4 }}
                                                borderRadius="2xl"
                                                border="1px solid"
                                                borderColor="gray.200"
                                                shadow="xs"
                                            >
                                                {/* Sub-tabs: Active vs Deactive */}
                                                <HStack spacing={2} overflowX="auto" pb={{ base: 1, md: 0 }}>
                                                    <Button
                                                        size="sm"
                                                        borderRadius="xl"
                                                        colorScheme={employeeViewSubTab === 'active' ? 'blue' : 'gray'}
                                                        variant={employeeViewSubTab === 'active' ? 'solid' : 'ghost'}
                                                        onClick={() => setEmployeeViewSubTab('active')}
                                                        leftIcon={<Icon as={FaCheckCircle} />}
                                                        shadow={employeeViewSubTab === 'active' ? 'sm' : 'none'}
                                                        fontSize="xs"
                                                        fontWeight="bold"
                                                        px={4}
                                                    >
                                                        Active ({activeEmployeesCount})
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        borderRadius="xl"
                                                        colorScheme={employeeViewSubTab === 'deactive' ? 'red' : 'gray'}
                                                        variant={employeeViewSubTab === 'deactive' ? 'solid' : 'ghost'}
                                                        onClick={() => setEmployeeViewSubTab('deactive')}
                                                        leftIcon={<Icon as={FaTimes} />}
                                                        shadow={employeeViewSubTab === 'deactive' ? 'sm' : 'none'}
                                                        fontSize="xs"
                                                        fontWeight="bold"
                                                        px={4}
                                                    >
                                                        Deactive ({deactiveEmployeesCount})
                                                    </Button>
                                                </HStack>

                                                {/* Right: View Switcher (1 -> Cards, 2 -> Table) */}
                                                <Flex justify={{ base: "space-between", md: "flex-end" }} align="center" gap={3}>
                                                    <Text fontSize="xs" fontWeight="bold" color="gray.500" display={{ base: "block", sm: "none" }}>
                                                        View Mode:
                                                    </Text>
                                                    <HStack spacing={1} bg="gray.100" p={1} borderRadius="xl" border="1px solid" borderColor="gray.200">
                                                        <Button
                                                            size="sm"
                                                            borderRadius="lg"
                                                            colorScheme={viewMode === 'card' ? 'blue' : 'gray'}
                                                            variant={viewMode === 'card' ? 'solid' : 'ghost'}
                                                            onClick={() => setViewMode('card')}
                                                            leftIcon={<Icon as={FaThLarge} />}
                                                            fontSize="xs"
                                                            fontWeight="bold"
                                                            px={3.5}
                                                            shadow={viewMode === 'card' ? 'sm' : 'none'}
                                                        >
                                                            📱 Cards
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            borderRadius="lg"
                                                            colorScheme={viewMode === 'table' ? 'blue' : 'gray'}
                                                            variant={viewMode === 'table' ? 'solid' : 'ghost'}
                                                            onClick={() => setViewMode('table')}
                                                            leftIcon={<Icon as={FaList} />}
                                                            fontSize="xs"
                                                            fontWeight="bold"
                                                            px={3.5}
                                                            shadow={viewMode === 'table' ? 'sm' : 'none'}
                                                        >
                                                            📊 Table
                                                        </Button>
                                                    </HStack>
                                                </Flex>
                                            </Flex>

                                            {/* Option 1: Card View */}
                                            {viewMode === 'card' ? (
                                                <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} spacing={{ base: 3.5, md: 4 }}>
                                                    {filteredEmployees.map(emp => {
                                                        const isDeactive = emp.status === 'Deactive';
                                                        return (
                                                            <Card
                                                                key={emp._id}
                                                                borderRadius="2xl"
                                                                border="1.5px solid"
                                                                borderColor={isDeactive ? "red.200" : "gray.200"}
                                                                bg={isDeactive ? "red.50" : "white"}
                                                                _hover={{ shadow: 'lg', borderColor: isDeactive ? "red.400" : "blue.400", transform: 'translateY(-2px)' }}
                                                                transition="all 0.2s"
                                                                overflow="hidden"
                                                            >
                                                                <CardBody p={4}>
                                                                    {/* Header: Avatar + Name + ID + Status */}
                                                                    <Flex justify="space-between" align="flex-start" mb={3}>
                                                                        <HStack spacing={3} align="center" flex={1} mr={2}>
                                                                            <Avatar
                                                                                size="md"
                                                                                src={emp.photo ? getFileUrl(emp.photo) : undefined}
                                                                                name={emp.name}
                                                                                borderRadius="xl"
                                                                                border="2px solid"
                                                                                borderColor={isDeactive ? "red.400" : "blue.500"}
                                                                            />
                                                                            <Box flex={1} minW={0}>
                                                                                <Text fontWeight="black" fontSize="sm" color="gray.800" isTruncated>
                                                                                    {emp.name}
                                                                                </Text>
                                                                                <HStack spacing={1.5} mt={0.5} wrap="wrap">
                                                                                    <Badge colorScheme="blue" fontSize="9px" borderRadius="md" px={1.5}>
                                                                                        {emp.empId || 'EMP'}
                                                                                    </Badge>
                                                                                    {emp.designation && (
                                                                                        <Badge colorScheme="purple" variant="subtle" fontSize="9px" borderRadius="md" px={1.5} isTruncated maxW="120px">
                                                                                            {emp.designation}
                                                                                        </Badge>
                                                                                    )}
                                                                                </HStack>
                                                                            </Box>
                                                                        </HStack>
                                                                        <Badge
                                                                            colorScheme={isDeactive ? "red" : "green"}
                                                                            variant="solid"
                                                                            fontSize="9px"
                                                                            borderRadius="full"
                                                                            px={2}
                                                                            py={0.5}
                                                                        >
                                                                            {isDeactive ? 'Deactive' : 'Active'}
                                                                        </Badge>
                                                                    </Flex>

                                                                    {/* Details Grid */}
                                                                    <Box bg={isDeactive ? "white" : "gray.50"} p={2.5} borderRadius="xl" border="1px solid" borderColor={isDeactive ? "red.100" : "gray.100"} mb={3.5}>
                                                                        <SimpleGrid columns={2} spacing={2} mb={2}>
                                                                            <Box>
                                                                                <Text fontSize="9px" color="gray.400" fontWeight="bold">SALARY</Text>
                                                                                <Text fontSize="xs" fontWeight="black" color="green.700">
                                                                                    ₹{parseFloat(emp.salary || 0).toLocaleString()}/mo
                                                                                </Text>
                                                                            </Box>
                                                                            <Box>
                                                                                <Text fontSize="9px" color="gray.400" fontWeight="bold">FOOD ALLOWANCE</Text>
                                                                                <Text fontSize="10px" fontWeight="bold" color="gray.700">
                                                                                    {emp.foodAllowance === 'Without Food' ? '🚫 No Food' : '🍱 Food Inc.'}
                                                                                </Text>
                                                                            </Box>
                                                                        </SimpleGrid>
                                                                        <VStack align="stretch" spacing={1} pt={1} borderTop="1px dashed" borderColor="gray.200">
                                                                            {emp.phone && (
                                                                                <HStack fontSize="xs" color="gray.700" as="a" href={`tel:${emp.phone}`} _hover={{ color: "blue.600" }}>
                                                                                    <Icon as={FaPhoneAlt} color="blue.500" w={3} h={3} />
                                                                                    <Text fontSize="11px" fontWeight="medium">{emp.phone}</Text>
                                                                                </HStack>
                                                                            )}
                                                                            {emp.email && (
                                                                                <HStack fontSize="xs" color="gray.700" as="a" href={`mailto:${emp.email}`} _hover={{ color: "blue.600" }}>
                                                                                    <Icon as={FaEnvelope} color="blue.500" w={3} h={3} />
                                                                                    <Text fontSize="11px" fontWeight="medium" isTruncated>{emp.email}</Text>
                                                                                </HStack>
                                                                            )}
                                                                            {emp.company && (
                                                                                <HStack fontSize="xs" color="gray.700">
                                                                                    <Icon as={FaBuilding} color="blue.500" w={3} h={3} />
                                                                                    <Text fontSize="11px" fontWeight="bold" isTruncated>{emp.company}{emp.branch ? ` • ${emp.branch}` : ''}</Text>
                                                                                </HStack>
                                                                            )}
                                                                            {emp.reportedTo && (
                                                                                <HStack fontSize="xs" color="gray.600">
                                                                                    <Icon as={FaSitemap} color="purple.500" w={3} h={3} />
                                                                                    <Text fontSize="10px" isTruncated>Rep: <Text as="span" fontWeight="bold" color="purple.700">{emp.reportedTo}</Text></Text>
                                                                                </HStack>
                                                                            )}
                                                                            {emp.bankDetails?.accountNumber && (
                                                                                <HStack fontSize="10px" color="gray.500">
                                                                                    <Text fontWeight="bold">🏦 A/C:</Text>
                                                                                    <Text fontFamily="mono">{emp.bankDetails.accountNumber}</Text>
                                                                                </HStack>
                                                                            )}
                                                                        </VStack>
                                                                    </Box>

                                                                    {/* Actions Footer */}
                                                                    <Flex justify="space-between" align="center" gap={2} pt={1}>
                                                                        <Button
                                                                            size="xs"
                                                                            colorScheme="teal"
                                                                            variant="solid"
                                                                            borderRadius="lg"
                                                                            leftIcon={<Icon as={FaEye} />}
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                handleOpenEmployeeDetail(emp);
                                                                            }}
                                                                            flex={1}
                                                                            h="30px"
                                                                            fontSize="11px"
                                                                            fontWeight="bold"
                                                                        >
                                                                            View
                                                                        </Button>
                                                                        <Button
                                                                            size="xs"
                                                                            colorScheme="blue"
                                                                            variant="solid"
                                                                            borderRadius="lg"
                                                                            leftIcon={<Icon as={FaEdit} />}
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                handleSelectEmployee({ target: { value: emp._id } });
                                                                            }}
                                                                            flex={1}
                                                                            h="30px"
                                                                            fontSize="11px"
                                                                            fontWeight="bold"
                                                                        >
                                                                            Edit
                                                                        </Button>
                                                                        <IconButton
                                                                            size="xs"
                                                                            colorScheme="red"
                                                                            variant="ghost"
                                                                            borderRadius="lg"
                                                                            icon={<Icon as={FaTrash} />}
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                handleDelete(emp._id);
                                                                            }}
                                                                            aria-label="Delete employee"
                                                                            h="30px"
                                                                            w="30px"
                                                                        />
                                                                    </Flex>
                                                                </CardBody>
                                                            </Card>
                                                        );
                                                    })}
                                                </SimpleGrid>
                                            ) : (
                                                /* Option 2: Table View */
                                                <Box overflow="hidden" w="full" bg="white" borderRadius="2xl" boxShadow="sm" border="1px solid" borderColor="gray.200">
                                                    <TableContainer overflowX="auto" sx={{ WebkitOverflowScrolling: 'touch' }}>
                                                        <Table variant="simple" size="sm">
                                                            <Thead bg="gray.50">
                                                                <Tr>
                                                                    <Th fontSize="10px" fontWeight="black" color="gray.600">ID</Th>
                                                                    <Th fontSize="10px" fontWeight="black" color="gray.600">EMPLOYEE</Th>
                                                                    <Th fontSize="10px" fontWeight="black" color="gray.600">COMPANY / BRANCH</Th>
                                                                    <Th fontSize="10px" fontWeight="black" color="gray.600">DESIGNATION</Th>
                                                                    <Th fontSize="10px" fontWeight="black" color="gray.600">REPORTED TO</Th>
                                                                    <Th fontSize="10px" fontWeight="black" color="gray.600">PHONE</Th>
                                                                    <Th fontSize="10px" fontWeight="black" color="gray.600">FOOD</Th>
                                                                    <Th fontSize="10px" fontWeight="black" color="gray.600" textAlign="center">ACTIONS</Th>
                                                                </Tr>
                                                            </Thead>
                                                            <Tbody>
                                                                {filteredEmployees.map((emp, idx) => {
                                                                    return (
                                                                        <Tr 
                                                                            key={emp._id} 
                                                                            bg={idx % 2 === 0 ? "white" : "gray.50"} 
                                                                            _hover={{ bg: "blue.50", cursor: "pointer" }} 
                                                                            transition="background 0.15s"
                                                                            onClick={() => handleOpenEmployeeDetail(emp)}
                                                                        >
                                                                            <Td fontWeight="bold" color="blue.600" fontSize="xs">{emp.empId || 'EMP'}</Td>
                                                                            <Td>
                                                                                <HStack spacing={2.5}>
                                                                                    <Avatar size="xs" src={emp.photo ? getFileUrl(emp.photo) : undefined} name={emp.name} />
                                                                                    <Box>
                                                                                        <Text fontWeight="bold" fontSize="xs" color="gray.800">{emp.name}</Text>
                                                                                        {emp.email && <Text fontSize="10px" color="gray.500">{emp.email}</Text>}
                                                                                    </Box>
                                                                                </HStack>
                                                                            </Td>
                                                                            <Td>
                                                                                <VStack align="start" spacing={0.5}>
                                                                                    <Text fontSize="xs" fontWeight="bold" color="gray.800" noOfLines={1}>
                                                                                        {emp.company || '—'}
                                                                                    </Text>
                                                                                    {emp.branch && (
                                                                                        <Badge colorScheme="purple" variant="subtle" fontSize="9px" borderRadius="md" px={1.5}>
                                                                                            📍 {emp.branch}
                                                                                        </Badge>
                                                                                    )}
                                                                                </VStack>
                                                                            </Td>
                                                                            <Td>
                                                                                {emp.designation ? (
                                                                                    <Badge colorScheme="purple" variant="subtle" borderRadius="full" px={2} fontSize="10px">
                                                                                        {emp.designation}
                                                                                    </Badge>
                                                                                ) : (
                                                                                    <Text fontSize="10px" color="gray.400">—</Text>
                                                                                )}
                                                                            </Td>
                                                                            <Td>
                                                                                {emp.reportedTo ? (
                                                                                    <Badge colorScheme="blue" variant="outline" fontSize="10px" borderRadius="md" px={1.5} maxW="150px" isTruncated>
                                                                                        {emp.reportedTo}
                                                                                    </Badge>
                                                                                ) : (
                                                                                    <Text fontSize="10px" color="gray.400">—</Text>
                                                                                )}
                                                                            </Td>
                                                                            <Td fontSize="xs" fontWeight="medium">{emp.phone || '—'}</Td>
                                                                            <Td>
                                                                                <Badge colorScheme={emp.foodAllowance === 'Without Food' ? 'gray' : 'green'} fontSize="9px" borderRadius="md">
                                                                                    {emp.foodAllowance === 'Without Food' ? 'No Food' : 'Food'}
                                                                                </Badge>
                                                                            </Td>
                                                                            <Td textAlign="center" onClick={(e) => e.stopPropagation()}>
                                                                                <HStack justify="center" spacing={1.5}>
                                                                                    <IconButton 
                                                                                        aria-label="View" 
                                                                                        size="xs" 
                                                                                        colorScheme="teal" 
                                                                                        variant="solid" 
                                                                                        borderRadius="lg" 
                                                                                        icon={<Icon as={FaEye} />} 
                                                                                        onClick={(e) => {
                                                                                            e.stopPropagation();
                                                                                            handleOpenEmployeeDetail(emp);
                                                                                        }} 
                                                                                    />
                                                                                    <IconButton 
                                                                                        aria-label="Edit" 
                                                                                        size="xs" 
                                                                                        colorScheme="blue" 
                                                                                        variant="solid" 
                                                                                        borderRadius="lg" 
                                                                                        icon={<Icon as={FaEdit} />} 
                                                                                        onClick={(e) => {
                                                                                            e.stopPropagation();
                                                                                            handleSelectEmployee({ target: { value: emp._id } });
                                                                                        }} 
                                                                                    />
                                                                                    <IconButton 
                                                                                        aria-label="Delete" 
                                                                                        size="xs" 
                                                                                        colorScheme="red" 
                                                                                        variant="ghost" 
                                                                                        borderRadius="lg" 
                                                                                        icon={<Icon as={FaTrash} />} 
                                                                                        onClick={(e) => {
                                                                                            e.stopPropagation();
                                                                                            handleDelete(emp._id);
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
                                                </Box>
                                            )}

                                            {filteredEmployees.length === 0 && (
                                                <Center p={10} bg="white" borderRadius="2xl" border="1px dashed" borderColor="gray.200" mt={3}>
                                                    <VStack spacing={2}>
                                                        <Icon as={FaUsers} w={8} h={8} color="gray.300" />
                                                        <Text color="gray.500" fontSize="sm" fontWeight="medium">No employees found matching "{searchQuery}"</Text>
                                                    </VStack>
                                                </Center>
                                            )}
                                        </Box>
                                    </TabPanel>
                                )}

                                {/* ── Tab 3: Payment Report ── */}
                                {tabConfig.some(t => t.id === 'payment') && (
                                    <TabPanel p={0}>
                                    {(() => {
                                        const reportFiltered = employees.filter(emp => {
                                            const monthData = getMonthlyPayment(emp, reportMonthFilter);
                                            const matchesSearch = emp.name?.toLowerCase().includes(reportSearchQuery.toLowerCase()) || emp.empId?.toLowerCase().includes(reportSearchQuery.toLowerCase());
                                            const matchesMode = reportPaymentModeFilter === 'All' || monthData.paymentMode === reportPaymentModeFilter;
                                            const matchesPayStatus = reportPaymentStatusFilter === 'All' || monthData.paymentStatus === reportPaymentStatusFilter;
                                            const matchesFood = reportFoodFilter === 'All' || emp.foodAllowance === reportFoodFilter;
                                            const isHidden = emp.showInPaymentReport === false;
                                            return matchesSearch && matchesMode && matchesPayStatus && matchesFood && !isHidden;
                                        });
                                        return (
                                            <VStack spacing={5} align="stretch" mt={4}>
                                                {/* Summary Stats */}
                                                <SimpleGrid columns={{ base: 2, md: 4 }} spacing={3}>
                                                    <Box bgGradient="linear(to-br, blue.500, blue.700)" p={4} borderRadius="2xl" color="white" boxShadow="md">
                                                        <Text fontSize="10px" fontWeight="black" opacity={0.8} textTransform="uppercase">Monthly Payout</Text>
                                                        <Heading size="md" mt={1}>₹{employees.reduce((a, e) => a + parseFloat(e.salary || 0), 0).toLocaleString()}</Heading>
                                                        <Text fontSize="10px" opacity={0.7} mt={1}>{employees.length} Employees · {reportMonthFilter}</Text>
                                                    </Box>
                                                    <Box bgGradient="linear(to-br, green.500, green.700)" p={4} borderRadius="2xl" color="white" boxShadow="md">
                                                        <Text fontSize="10px" fontWeight="black" opacity={0.8} textTransform="uppercase">Disbursed ✅</Text>
                                                        <Heading size="md" mt={1}>₹{employees.filter(e => getMonthlyPayment(e, reportMonthFilter).paymentStatus === 'Done').reduce((a, e) => a + parseFloat(e.salary || 0), 0).toLocaleString()}</Heading>
                                                        <Text fontSize="10px" opacity={0.7} mt={1}>{employees.filter(e => getMonthlyPayment(e, reportMonthFilter).paymentStatus === 'Done').length} Paid</Text>
                                                    </Box>
                                                    <Box bgGradient="linear(to-br, orange.400, orange.600)" p={4} borderRadius="2xl" color="white" boxShadow="md">
                                                        <Text fontSize="10px" fontWeight="black" opacity={0.8} textTransform="uppercase">Pending ⏳</Text>
                                                        <Heading size="md" mt={1}>₹{employees.filter(e => getMonthlyPayment(e, reportMonthFilter).paymentStatus !== 'Done').reduce((a, e) => a + parseFloat(e.salary || 0), 0).toLocaleString()}</Heading>
                                                        <Text fontSize="10px" opacity={0.7} mt={1}>{employees.filter(e => getMonthlyPayment(e, reportMonthFilter).paymentStatus !== 'Done').length} Pending</Text>
                                                    </Box>
                                                    <Box bgGradient="linear(to-br, purple.500, purple.700)" p={4} borderRadius="2xl" color="white" boxShadow="md">
                                                        <Text fontSize="10px" fontWeight="black" opacity={0.8} textTransform="uppercase">Staff Status</Text>
                                                        <Heading size="md" mt={1}>✅ {employees.filter(e => e.status === 'Active').length} Active</Heading>
                                                        <Text fontSize="10px" opacity={0.8} mt={1}>❌ Deactive: {employees.filter(e => e.status === 'Deactive').length} | Total: {employees.length}</Text>
                                                    </Box>
                                                </SimpleGrid>

                                                {/* Filter Bar */}
                                                <Box bg="gray.50" p={4} borderRadius="2xl" border="1px solid" borderColor="gray.100">
                                                    <Text fontSize="xs" fontWeight="bold" color="gray.500" mb={3} textTransform="uppercase">🔍 Filter & Export — {reportMonthFilter}</Text>
                                                    <SimpleGrid columns={{ base: 2, md: 5 }} spacing={3} alignItems="flex-end">
                                                        <Box>
                                                            <Text fontSize="10px" fontWeight="bold" color="gray.500" mb={1}>MONTH</Text>
                                                            <Input
                                                                type="month"
                                                                bg="white"
                                                                size="sm"
                                                                borderRadius="lg"
                                                                value={reportMonthFilter}
                                                                onChange={(e) => setReportMonthFilter(e.target.value)}
                                                            />
                                                        </Box>
                                                        <Box>
                                                            <Text fontSize="10px" fontWeight="bold" color="gray.500" mb={1}>SEARCH</Text>
                                                            <Input
                                                                bg="white"
                                                                placeholder="Name / ID..."
                                                                size="sm"
                                                                borderRadius="lg"
                                                                value={reportSearchQuery}
                                                                onChange={(e) => setReportSearchQuery(e.target.value)}
                                                            />
                                                        </Box>
                                                        <Box>
                                                            <Text fontSize="10px" fontWeight="bold" color="gray.500" mb={1}>PAY MODE</Text>
                                                            <Select bg="white" size="sm" borderRadius="lg" value={reportPaymentModeFilter} onChange={(e) => setReportPaymentModeFilter(e.target.value)}>
                                                                <option value="All">All Modes</option>
                                                                <option value="Cash">💵 Cash</option>
                                                                <option value="Cheque">✍️ Cheque</option>
                                                                <option value="UPI">📱 UPI</option>
                                                            </Select>
                                                        </Box>
                                                        <Box>
                                                            <Text fontSize="10px" fontWeight="bold" color="gray.500" mb={1}>PAY STATUS</Text>
                                                            <Select bg="white" size="sm" borderRadius="lg" value={reportPaymentStatusFilter} onChange={(e) => setReportPaymentStatusFilter(e.target.value)}>
                                                                <option value="All">All Status</option>
                                                                <option value="Pending">⏳ Pending</option>
                                                                <option value="Done">✅ Done</option>
                                                            </Select>
                                                        </Box>
                                                    </SimpleGrid>
                                                    <HStack mt={3} spacing={2.5} justify="flex-end" wrap="wrap">
                                                        <Button leftIcon={<Icon as={FaFileExcel} />} colorScheme="green" variant="solid" borderRadius="xl" onClick={exportPaymentReportToExcel} size="sm" shadow="sm">
                                                            Export Colorful Excel (.xls)
                                                        </Button>
                                                        <Button leftIcon={<Icon as={FaFileExcel} />} colorScheme="orange" variant="solid" borderRadius="xl" onClick={exportBankExcel} size="sm" shadow="sm">
                                                            Download salary.xls
                                                        </Button>
                                                        <Button leftIcon={<Icon as={FaCopy} />} colorScheme="blue" variant="outline" borderRadius="xl" onClick={exportPaymentReportToCSV} size="sm">
                                                            Export CSV
                                                        </Button>
                                                        <Button leftIcon={<Icon as={FaPrint} />} colorScheme="purple" variant="solid" borderRadius="xl" onClick={() => window.print()} size="sm">
                                                            Print
                                                        </Button>
                                                    </HStack>
                                                </Box>

                                                {/* Integrated Table & Footer Container */}
                                                <Box bg="white" borderRadius="2xl" border="1px solid" borderColor="gray.200" boxShadow="sm" overflow="hidden">
                                                    <Box overflowX="auto" w="full" sx={{
                                                        '&::-webkit-scrollbar': { height: '8px' },
                                                        '&::-webkit-scrollbar-track': { bg: 'gray.50' },
                                                        '&::-webkit-scrollbar-thumb': { bg: 'blue.200', borderRadius: 'full' },
                                                        '&::-webkit-scrollbar-thumb:hover': { bg: 'blue.300' }
                                                    }}>
                                                        <Table variant="simple" size="sm" sx={{ 'th, td': { px: { base: 2, md: 2.5 }, py: 3 } }}>
                                                            <Thead>
                                                                <Tr bgGradient="linear(to-r, blue.600, blue.800)">
                                                                    <Th color="white" py={4} fontSize="10px" whiteSpace="nowrap">#</Th>
                                                                    <Th color="white" py={4} fontSize="10px" whiteSpace="nowrap">EMPLOYEE</Th>
                                                                    <Th color="white" py={4} fontSize="10px" whiteSpace="nowrap">BANK ACCOUNT DETAILS</Th>
                                                                    <Th color="white" py={4} fontSize="10px" whiteSpace="nowrap">SALARY / DAYS</Th>
                                                                    <Th color="white" py={4} fontSize="10px" textAlign="center" whiteSpace="nowrap">PRESENT</Th>
                                                                    <Th color="white" py={4} fontSize="10px" textAlign="center" whiteSpace="nowrap">PENDING</Th>
                                                                    <Th color="white" py={4} fontSize="10px" textAlign="center" whiteSpace="nowrap">ABSENT</Th>
                                                                    <Th color="white" py={4} fontSize="10px" textAlign="center" whiteSpace="nowrap">UPAD</Th>
                                                                    <Th color="white" py={4} fontSize="10px" textAlign="center" whiteSpace="nowrap">INCENTIVE</Th>
                                                                    <Th color="white" py={4} fontSize="10px" isNumeric whiteSpace="nowrap">PAYABLE</Th>
                                                                    <Th color="white" py={4} fontSize="10px" whiteSpace="nowrap">PAY TYPE</Th>
                                                                    <Th color="white" py={4} fontSize="10px" whiteSpace="nowrap">STATUS</Th>
                                                                </Tr>
                                                            </Thead>
                                                            <Tbody>
                                                                {reportFiltered.length === 0 ? (
                                                                    <Tr>
                                                                        <Td colSpan={12} textAlign="center" py={10} color="gray.400">
                                                                            <VStack spacing={2}>
                                                                                <Icon as={FaUsers} w={8} h={8} color="gray.200" />
                                                                                <Text fontSize="sm">No records match current filters</Text>
                                                                            </VStack>
                                                                        </Td>
                                                                    </Tr>
                                                                ) : reportFiltered.map((emp, idx) => {
                                                                    const monthData = getMonthlyPayment(emp, reportMonthFilter);
                                                                    const isDone = monthData.paymentStatus === 'Done';
                                                                    const isDeactive = emp.status === 'Deactive';
                                                                    const rowBg = isDeactive ? 'red.50' : isDone ? 'green.50' : idx % 2 === 0 ? 'white' : 'gray.50';
                                                                    const totalDays = getDaysInMonth(reportMonthFilter);
                                                                    const salary = parseFloat(emp.salary || 0);
                                                                    const perDay = totalDays > 0 ? salary / totalDays : 0;
                                                                    const upad = monthData.upad ?? 0;
                                                                    const incentive = monthData.incentive ?? 0;
                                                                    // Pull from real attendance cache
                                                                    const attCache = attendanceCache[`${emp._id}_${reportMonthFilter}`];
                                                                    const present = attCache ? attCache.present : null;
                                                                    const pending = attCache ? attCache.pending : null;
                                                                    const absent = attCache ? attCache.absent : null;
                                                                    const effectivePresent = present !== null ? present : totalDays;
                                                                    const payable = (perDay * effectivePresent) - upad + incentive;
                                                                    return (
                                                                        <Tr key={emp._id} bg={rowBg} _hover={{ bg: isDone ? 'green.100' : isDeactive ? 'red.100' : 'blue.50' }} transition="background 0.15s" onClick={() => handleRowClick(emp)} cursor="pointer">
                                                                            <Td fontSize="xs" fontWeight="bold" color="gray.500" whiteSpace="nowrap">{idx + 1}</Td>
                                                                            {/* Employee */}
                                                                            <Td py={3}>
                                                                                <HStack spacing={2.5}>
                                                                                    <Avatar size="sm" src={emp.photo?.url ? `${API_BASE_URL}${emp.photo.url}` : undefined} name={emp.name} />
                                                                                    <VStack align="start" spacing={0.5}>
                                                                                        <HStack spacing={1.5} wrap="wrap">
                                                                                            <Text fontSize="xs" fontWeight="bold" color="gray.800">{emp.name}</Text>
                                                                                            <Badge colorScheme="blue" variant="subtle" fontSize="9px">{emp.empId}</Badge>
                                                                                            {isDeactive ? (
                                                                                                <HStack spacing={1}>
                                                                                                    <Badge colorScheme="red" variant="solid" fontSize="8px" px={1.5} borderRadius="sm">Deactive</Badge>
                                                                                                    <Button size="xs" colorScheme={emp.showInPaymentReport !== false ? 'green' : 'gray'} variant="outline" height="18px" fontSize="9px" px={2} onClick={(e) => { e.stopPropagation(); handleToggleShowInReport(emp._id, emp.showInPaymentReport === false ? true : false); }}>
                                                                                                        {emp.showInPaymentReport !== false ? 'Hide from Report' : 'Show in Report'}
                                                                                                    </Button>
                                                                                                </HStack>
                                                                                            ) : null}
                                                                                        </HStack>
                                                                                        {emp.phone && <Text fontSize="10px" color="gray.500">📱 {emp.phone}</Text>}
                                                                                    </VStack>
                                                                                </HStack>
                                                                            </Td>
                                                                            {/* Bank Details */}
                                                                            <Td py={3}>
                                                                                {emp.bankDetails?.accountNumber || emp.bankDetails?.ifscCode ? (
                                                                                    <Box bg="whiteAlpha.800" p={2} borderRadius="lg" border="1px solid" borderColor="gray.200" minW="140px" shadow="2xs">
                                                                                        {emp.bankDetails?.bankName && (
                                                                                            <Text fontSize="10px" fontWeight="800" color="blue.600" textTransform="uppercase" mb={0.5}>
                                                                                                🏦 {emp.bankDetails.bankName}
                                                                                            </Text>
                                                                                        )}
                                                                                        <Text fontSize="xs" fontFamily="mono" fontWeight="800" color="gray.800" letterSpacing="0.5px">
                                                                                            A/C: {emp.bankDetails?.accountNumber || '—'}
                                                                                        </Text>
                                                                                        {emp.bankDetails?.ifscCode && (
                                                                                            <Badge colorScheme="purple" variant="subtle" fontSize="9px" borderRadius="sm" mt={1}>
                                                                                                IFSC: {emp.bankDetails.ifscCode}
                                                                                            </Badge>
                                                                                        )}
                                                                                    </Box>
                                                                                ) : (
                                                                                    <Badge colorScheme="orange" variant="subtle" fontSize="10px" py={1} px={2} borderRadius="md">
                                                                                        ⚠️ No Bank Details
                                                                                    </Badge>
                                                                                )}
                                                                            </Td>
                                                                            {/* Salary Breakdown */}
                                                                            <Td py={3}>
                                                                                <VStack align="stretch" spacing={1} minW="95px">
                                                                                    <HStack justify="space-between">
                                                                                        <Text fontSize="9px" color="gray.400" fontWeight="bold">SALARY</Text>
                                                                                        <Text fontSize="xs" fontWeight="black" color="green.700">₹{salary.toLocaleString()}</Text>
                                                                                    </HStack>
                                                                                    <HStack justify="space-between">
                                                                                        <Text fontSize="9px" color="gray.400" fontWeight="bold">TOTAL DAYS</Text>
                                                                                        <Badge colorScheme="gray" variant="subtle" fontSize="9px">{totalDays}d</Badge>
                                                                                    </HStack>
                                                                                    <HStack justify="space-between">
                                                                                        <Text fontSize="9px" color="gray.400" fontWeight="bold">PER DAY</Text>
                                                                                        <Text fontSize="xs" fontWeight="bold" color="blue.600">₹{perDay.toFixed(1)}</Text>
                                                                                    </HStack>
                                                                                </VStack>
                                                                            </Td>
                                                                            {/* Present — from real attendance */}
                                                                            <Td py={3} textAlign="center">
                                                                                {attendanceLoading ? (
                                                                                    <Badge colorScheme="gray" variant="subtle" fontSize="9px">…</Badge>
                                                                                ) : present !== null ? (
                                                                                    <Badge colorScheme="green" variant="solid" fontSize="xs" px={2.5} py={0.5} borderRadius="md">
                                                                                        {present}
                                                                                    </Badge>
                                                                                ) : (
                                                                                    <Badge colorScheme="gray" variant="outline" fontSize="9px">No Data</Badge>
                                                                                )}
                                                                            </Td>
                                                                            {/* Pending — from real attendance */}
                                                                            <Td py={3} textAlign="center">
                                                                                {attendanceLoading ? (
                                                                                    <Badge colorScheme="gray" variant="subtle" fontSize="9px">…</Badge>
                                                                                ) : isDeactive ? (
                                                                                    <Badge colorScheme="red" variant="solid" fontSize="xs" px={2.5} py={0.5} borderRadius="md">Deactive</Badge>
                                                                                ) : pending !== null ? (
                                                                                    <Badge colorScheme="orange" variant="solid" fontSize="xs" px={2.5} py={0.5} borderRadius="md">
                                                                                        {pending}
                                                                                    </Badge>
                                                                                ) : (
                                                                                    <Badge colorScheme="gray" variant="outline" fontSize="9px">No Data</Badge>
                                                                                )}
                                                                            </Td>
                                                                            {/* Absent — from real attendance */}
                                                                            <Td py={3} textAlign="center">
                                                                                {attendanceLoading ? (
                                                                                    <Badge colorScheme="gray" variant="subtle" fontSize="9px">…</Badge>
                                                                                ) : absent !== null ? (
                                                                                    <Badge colorScheme={absent > 0 ? 'red' : 'green'} variant="solid" fontSize="xs" px={2.5} py={0.5} borderRadius="md">
                                                                                        {absent}
                                                                                    </Badge>
                                                                                ) : (
                                                                                    <Badge colorScheme="gray" variant="outline" fontSize="9px">No Data</Badge>
                                                                                )}
                                                                            </Td>
                                                                            {/* UPAD - editable */}
                                                                            <Td py={3} onClick={(e) => e.stopPropagation()}>
                                                                                <UpadInputCell empId={emp._id} initialUpad={upad} onSave={handleUpdatePaymentField} />
                                                                            </Td>
                                                                            {/* INCENTIVE - editable */}
                                                                            <Td py={3} onClick={(e) => e.stopPropagation()}>
                                                                                <IncentiveInputCell empId={emp._id} initialIncentive={incentive} onSave={handleUpdatePaymentField} />
                                                                            </Td>
                                                                            {/* Payable */}
                                                                            <Td py={3} isNumeric>
                                                                                <VStack align="flex-end" spacing={0.5}>
                                                                                    <Text fontSize="9px" color="gray.400" fontWeight="bold">PAYABLE</Text>
                                                                                    <Text fontSize="sm" fontWeight="black" color={isDone ? 'green.600' : 'orange.600'}>
                                                                                        ₹{payable.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                                                                    </Text>
                                                                                </VStack>
                                                                            </Td>
                                                                            {/* Pay Mode */}
                                                                            <Td whiteSpace="nowrap" onClick={(e) => e.stopPropagation()}>
                                                                                <Select
                                                                                    size="xs"
                                                                                    borderRadius="lg"
                                                                                    value={monthData.paymentMode}
                                                                                    onChange={(e) => handleUpdatePaymentField(emp._id, 'paymentMode', e.target.value)}
                                                                                    onClick={(e) => e.stopPropagation()}
                                                                                    w="90px"
                                                                                    fontSize="xs"
                                                                                    bg={monthData.paymentMode === 'UPI' ? 'purple.50' : monthData.paymentMode === 'Cheque' ? 'orange.50' : 'blue.50'}
                                                                                    border="1px solid"
                                                                                    borderColor={monthData.paymentMode === 'UPI' ? 'purple.200' : monthData.paymentMode === 'Cheque' ? 'orange.200' : 'blue.200'}
                                                                                >
                                                                                    <option value="Cash">💵 Cash</option>
                                                                                    <option value="Cheque">✍️ Cheque</option>
                                                                                    <option value="UPI">📱 UPI</option>
                                                                                </Select>
                                                                            </Td>
                                                                            {/* Pay Status */}
                                                                            <Td whiteSpace="nowrap" onClick={(e) => e.stopPropagation()}>
                                                                                <Select
                                                                                    size="xs"
                                                                                    borderRadius="lg"
                                                                                    value={monthData.paymentStatus}
                                                                                    onChange={(e) => handleUpdatePaymentField(emp._id, 'paymentStatus', e.target.value)}
                                                                                    onClick={(e) => e.stopPropagation()}
                                                                                    w="100px"
                                                                                    fontSize="xs"
                                                                                    fontWeight="bold"
                                                                                    color={isDone ? 'green.700' : 'orange.700'}
                                                                                    bg={isDone ? 'green.50' : 'orange.50'}
                                                                                    border="1px solid"
                                                                                    borderColor={isDone ? 'green.200' : 'orange.200'}
                                                                                >
                                                                                    <option value="Pending">⏳ Pending</option>
                                                                                    <option value="Done">✅ Done</option>
                                                                                </Select>
                                                                            </Td>
                                                                        </Tr>
                                                                    );
                                                                })}
                                                            </Tbody>
                                                        </Table>
                                                    </Box>

                                                    {reportFiltered.length > 0 && (
                                                        <Box bg="blue.50" p={3.5} borderTop="1px solid" borderColor="blue.100">
                                                            <HStack justify="space-between" wrap="wrap" spacing={4}>
                                                                <Text fontSize="xs" color="blue.700" fontWeight="bold">
                                                                    Showing {reportFiltered.length} of {employees.length} employees · Month: {reportMonthFilter}
                                                                </Text>
                                                                <Text fontSize="xs" color="blue.700" fontWeight="bold">
                                                                    Total: ₹{reportFiltered.reduce((a, e) => a + parseFloat(e.salary || 0), 0).toLocaleString()}
                                                                </Text>
                                                            </HStack>
                                                        </Box>
                                                    )}
                                                </Box>
                                            </VStack>
                                        );
                                    })()}
                                </TabPanel>
                            )}

                            {/* ── Tab 4: Admin Login Report ── */}
                            {tabConfig.some(t => t.id === 'adminReport') && (
                                <TabPanel pt={6}>
                                    <AdminLoginReportView />
                                </TabPanel>
                            )}

                            </TabPanels>
                        </Tabs>
                    )}

                        {/* Standardized Employee Detail View Modal */}
                        <Modal isOpen={!!viewEmployee} onClose={() => setViewEmployee(null)} size="5xl" isCentered motionPreset="slideInBottom" scrollBehavior="inside">
                            <ModalOverlay backdropFilter="blur(8px) grayscale(40%)" bg="blackAlpha.600" />
                            <ModalContent borderRadius="2xl" overflow="hidden" boxShadow="2xl" border="1px solid" borderColor="gray.200" m={{ base: 3, md: 6 }}>
                                <ModalHeader p={0}>
                                    {/* ── Top Profile Header: Deep Slate-Navy Executive Banner ── */}
                                    <Box bgGradient="linear(to-r, #0F172A, #1E3A8A)" p={{ base: 4, md: 5 }} color="white">
                                        <Flex justify="space-between" align="flex-start" gap={4}>
                                            <HStack spacing={4} align="center" flex={1}>
                                                <Avatar
                                                    size="lg"
                                                    w="70px"
                                                    h="70px"
                                                    src={viewEmployee?.photo ? getFileUrl(viewEmployee.photo) : undefined}
                                                    name={viewEmployee?.name}
                                                    bg="blue.500"
                                                    color="white"
                                                    fontWeight="800"
                                                    borderRadius="xl"
                                                    border="2px solid"
                                                    borderColor="blue.300"
                                                    boxShadow="0 4px 12px rgba(0, 0, 0, 0.25)"
                                                />
                                                <VStack align="start" spacing={2} flex={1}>
                                                    {/* Row 1: Name, Highlighted ID Pill, Designation */}
                                                    <HStack spacing={2.5} wrap="wrap" align="center">
                                                        <Heading size="md" fontWeight="800" color="white" letterSpacing="0.2px" textTransform="capitalize">
                                                            {viewEmployee?.name}
                                                        </Heading>
                                                        <Badge
                                                            bg="blue.500"
                                                            color="white"
                                                            border="1px solid"
                                                            borderColor="blue.300"
                                                            fontSize="11px"
                                                            px={2.5}
                                                            py={0.5}
                                                            borderRadius="md"
                                                            fontFamily="mono"
                                                            fontWeight="800"
                                                            letterSpacing="0.5px"
                                                            boxShadow="sm"
                                                        >
                                                            ID: {viewEmployee?.empId || 'EMP'}
                                                        </Badge>
                                                        <Badge
                                                            bg="whiteAlpha.200"
                                                            color="blue.100"
                                                            border="1px solid"
                                                            borderColor="whiteAlpha.300"
                                                            fontSize="11px"
                                                            px={2.5}
                                                            py={0.5}
                                                            borderRadius="md"
                                                            fontWeight="700"
                                                            textTransform="capitalize"
                                                        >
                                                            {viewEmployee?.designation || 'Staff'}
                                                        </Badge>
                                                    </HStack>

                                                    {/* Row 2: Company, Branch, Phone, Email interactive glass pills */}
                                                    <Flex wrap="wrap" align="center" gap={2} fontSize="xs">
                                                        <HStack
                                                            spacing={1.5}
                                                            bg="whiteAlpha.150"
                                                            px={2.5}
                                                            py={1}
                                                            borderRadius="md"
                                                            border="1px solid"
                                                            borderColor="whiteAlpha.200"
                                                            _hover={{ bg: "whiteAlpha.250" }}
                                                            transition="all 0.15s"
                                                        >
                                                            <Icon as={FaBuilding} fontSize="11px" color="blue.200" />
                                                            <Text color="blue.100" fontSize="11px">Company:</Text>
                                                            <Text fontWeight="700" color="white">{viewEmployee?.company || 'N/A'}</Text>
                                                        </HStack>

                                                        <HStack
                                                            spacing={1.5}
                                                            bg="whiteAlpha.150"
                                                            px={2.5}
                                                            py={1}
                                                            borderRadius="md"
                                                            border="1px solid"
                                                            borderColor="whiteAlpha.200"
                                                            _hover={{ bg: "whiteAlpha.250" }}
                                                            transition="all 0.15s"
                                                        >
                                                            <Icon as={FaCodeBranch} fontSize="11px" color="blue.200" />
                                                            <Text color="blue.100" fontSize="11px">Branch:</Text>
                                                            <Text fontWeight="700" color="white">{viewEmployee?.branch || 'N/A'}</Text>
                                                        </HStack>

                                                        <HStack
                                                            spacing={1.5}
                                                            bg="whiteAlpha.150"
                                                            px={2.5}
                                                            py={1}
                                                            borderRadius="md"
                                                            border="1px solid"
                                                            borderColor="whiteAlpha.200"
                                                            _hover={{ bg: "whiteAlpha.250" }}
                                                            transition="all 0.15s"
                                                        >
                                                            <Icon as={FaPhoneAlt} fontSize="10px" color="green.300" />
                                                            <Text fontWeight="700" color="white" fontFamily="mono">
                                                                {viewEmployee?.phone || '—'}
                                                            </Text>
                                                        </HStack>

                                                        {viewEmployee?.email && (
                                                            <HStack
                                                                spacing={1.5}
                                                                bg="whiteAlpha.150"
                                                                px={2.5}
                                                                py={1}
                                                                borderRadius="md"
                                                                border="1px solid"
                                                                borderColor="whiteAlpha.200"
                                                                _hover={{ bg: "whiteAlpha.250" }}
                                                                transition="all 0.15s"
                                                            >
                                                                <Icon as={FaEnvelope} fontSize="10px" color="blue.200" />
                                                                <Text color="white" fontWeight="500">{viewEmployee.email}</Text>
                                                            </HStack>
                                                        )}
                                                    </Flex>
                                                </VStack>
                                            </HStack>

                                            <ModalCloseButton
                                                position="static"
                                                borderRadius="full"
                                                bg="whiteAlpha.200"
                                                color="white"
                                                _hover={{ bg: "whiteAlpha.300" }}
                                            />
                                        </Flex>

                                        {/* ── Status Strip: Food Allowance, Employee Status, Reported To ── */}
                                        <Box
                                            mt={3.5}
                                            px={3.5}
                                            py={2}
                                            bg="blackAlpha.300"
                                            borderRadius="lg"
                                            border="1px solid"
                                            borderColor="whiteAlpha.200"
                                        >
                                            <SimpleGrid columns={{ base: 1, sm: 3 }} spacing={3} alignItems="center">
                                                <HStack spacing={2}>
                                                    <Text fontSize="11px" fontWeight="600" color="blue.100" textTransform="uppercase">
                                                        Food Allowance:
                                                    </Text>
                                                    <Badge
                                                        bg={viewEmployee?.foodAllowance === 'Without Food' ? 'gray.600' : 'green.500'}
                                                        color="white"
                                                        fontSize="10px"
                                                        px={2.5}
                                                        py={0.5}
                                                        borderRadius="full"
                                                        fontWeight="700"
                                                    >
                                                        {viewEmployee?.foodAllowance === 'Without Food' ? 'Without Food' : 'Food Included'}
                                                    </Badge>
                                                </HStack>

                                                <HStack spacing={2}>
                                                    <Text fontSize="11px" fontWeight="600" color="blue.100" textTransform="uppercase">
                                                        Status:
                                                    </Text>
                                                    <Badge
                                                        bg={viewEmployee?.status === 'Active' ? 'green.500' : 'red.500'}
                                                        color="white"
                                                        fontSize="10px"
                                                        px={2.5}
                                                        py={0.5}
                                                        borderRadius="full"
                                                        fontWeight="700"
                                                        display="inline-flex"
                                                        alignItems="center"
                                                        gap={1.5}
                                                    >
                                                        <Box w={1.5} h={1.5} borderRadius="full" bg="white" />
                                                        {viewEmployee?.status || 'Active'}
                                                    </Badge>
                                                </HStack>

                                                <HStack spacing={2}>
                                                    <Text fontSize="11px" fontWeight="600" color="blue.100" textTransform="uppercase">
                                                        Report To:
                                                    </Text>
                                                    <HStack spacing={1.5}>
                                                        <Icon as={FaSitemap} fontSize="11px" color="blue.200" />
                                                        <Text fontSize="xs" fontWeight="700" color="white" isTruncated maxW="180px">
                                                            {viewEmployee?.reportedTo || 'Top Management'}
                                                        </Text>
                                                    </HStack>
                                                </HStack>
                                            </SimpleGrid>
                                        </Box>
                                    </Box>

                                    {/* ── Below Header: 6 Buttons ── */}
                                    <Box px={{ base: 3, md: 5 }} py={2.5} bg="gray.50" borderBottom="1px solid" borderColor="gray.200">
                                        <SimpleGrid columns={{ base: 2, sm: 3, md: 6 }} spacing={2}>
                                            {[
                                                { id: 'personal', num: '1', label: 'personal', icon: FaUserTie },
                                                { id: 'work', num: '2', label: 'work', icon: FaBriefcase },
                                                { id: 'payouts', num: '3', label: 'payouts', icon: FaIdCard },
                                                { id: 'documents', num: '4', label: 'documents', icon: FaFileAlt },
                                                { id: 'bank', num: '5', label: 'bank', icon: FaBuilding },
                                                { id: 'salary', num: '6', label: 'salary', icon: FaMoneyBillWave },
                                            ].map((btn) => {
                                                const isActive = activeProfileTab === btn.id;
                                                return (
                                                    <Button
                                                        key={btn.id}
                                                        size="sm"
                                                        h="34px"
                                                        leftIcon={<Icon as={btn.icon} fontSize="xs" color={isActive ? "white" : "gray.500"} />}
                                                        variant={isActive ? 'solid' : 'outline'}
                                                        bg={isActive ? 'blue.600' : 'white'}
                                                        color={isActive ? 'white' : 'gray.700'}
                                                        borderColor={isActive ? 'blue.600' : 'gray.300'}
                                                        borderRadius="md"
                                                        fontWeight="700"
                                                        fontSize="xs"
                                                        textTransform="capitalize"
                                                        boxShadow={isActive ? 'sm' : 'none'}
                                                        _hover={{
                                                            bg: isActive ? 'blue.700' : 'gray.50',
                                                            borderColor: isActive ? 'blue.700' : 'gray.400',
                                                        }}
                                                        onClick={() => setActiveProfileTab(btn.id)}
                                                    >
                                                        {btn.num}. {btn.label}
                                                    </Button>
                                                );
                                            })}
                                        </SimpleGrid>
                                    </Box>
                                </ModalHeader>

                                <ModalBody p={{ base: 4, md: 6 }}>
                                    {viewEmployee && (
                                        <Box>
                                            {/* 1. PERSONAL TAB */}
                                            {activeProfileTab === 'personal' && (
                                                <VStack spacing={3.5} align="stretch">
                                                    {/* ── Items 1 to 6: Personal Particulars ── */}
                                                    <Box bg="gray.50" p={3.5} borderRadius="xl" border="1px solid" borderColor="gray.200">
                                                        <Text fontSize="xs" fontWeight="700" color="gray.700" textTransform="uppercase" mb={3} letterSpacing="0.3px">
                                                            Personal Particulars (1 - 6)
                                                        </Text>
                                                        <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={3}>
                                                            {/* 1. Name */}
                                                            <Box bg="white" p={3} borderRadius="lg" border="1px solid" borderColor="gray.200">
                                                                <HStack spacing={1.5} mb={1}>
                                                                    <Icon as={FaUserTie} color="gray.500" fontSize="11px" />
                                                                    <Text fontSize="10px" color="gray.500" fontWeight="700">1. NAME</Text>
                                                                </HStack>
                                                                <Text fontWeight="700" color="gray.800" fontSize="sm">
                                                                    {viewEmployee.name || '—'}
                                                                </Text>
                                                            </Box>

                                                            {/* 2. Married status if yes then date */}
                                                            <Box bg="white" p={3} borderRadius="lg" border="1px solid" borderColor="gray.200">
                                                                <HStack spacing={1.5} mb={1}>
                                                                    <Icon as={FaRing} color="gray.500" fontSize="11px" />
                                                                    <Text fontSize="10px" color="gray.500" fontWeight="700">2. MARRIED STATUS &amp; DATE</Text>
                                                                </HStack>
                                                                <HStack spacing={2} wrap="wrap">
                                                                    <Badge
                                                                        colorScheme="gray"
                                                                        variant="subtle"
                                                                        fontSize="xs"
                                                                        px={2}
                                                                        py={0.5}
                                                                        borderRadius="md"
                                                                        fontWeight="600"
                                                                    >
                                                                        {viewEmployee.maritalStatus || 'Single'}
                                                                    </Badge>
                                                                    {viewEmployee.maritalStatus === 'Married' && (
                                                                        <Text fontSize="xs" fontWeight="600" color="gray.700">
                                                                            📅 Date: {viewEmployee.marriageDate || 'Not specified'}
                                                                        </Text>
                                                                    )}
                                                                </HStack>
                                                            </Box>

                                                            {/* 3. Date of birth */}
                                                            <Box bg="white" p={3} borderRadius="lg" border="1px solid" borderColor="gray.200">
                                                                <HStack spacing={1.5} mb={1}>
                                                                    <Icon as={FaBirthdayCake} color="gray.500" fontSize="11px" />
                                                                    <Text fontSize="10px" color="gray.500" fontWeight="700">3. DATE OF BIRTH</Text>
                                                                </HStack>
                                                                <Text fontWeight="700" color="gray.800" fontSize="xs">
                                                                    {viewEmployee.dob ? (
                                                                        <>
                                                                            {viewEmployee.dob}{' '}
                                                                            <Badge colorScheme="gray" variant="subtle" fontSize="2xs" px={1.5} py={0.5} borderRadius="md" ml={1}>
                                                                                {calculateAge(viewEmployee.dob)} yrs old
                                                                            </Badge>
                                                                        </>
                                                                    ) : '—'}
                                                                </Text>
                                                            </Box>

                                                            {/* 4. Birth group (Blood Group) */}
                                                            <Box bg="white" p={3} borderRadius="lg" border="1px solid" borderColor="gray.200">
                                                                <HStack spacing={1.5} mb={1}>
                                                                    <Icon as={FaTint} color="gray.500" fontSize="11px" />
                                                                    <Text fontSize="10px" color="gray.500" fontWeight="700">4. BIRTH GROUP (BLOOD)</Text>
                                                                </HStack>
                                                                {viewEmployee.bloodGroup ? (
                                                                    <Badge colorScheme="gray" variant="subtle" fontSize="xs" px={2} py={0.5} borderRadius="md" fontWeight="600">
                                                                        🩸 {viewEmployee.bloodGroup}
                                                                    </Badge>
                                                                ) : (
                                                                    <Text fontWeight="600" color="gray.400">—</Text>
                                                                )}
                                                            </Box>

                                                            {/* 5. Gender */}
                                                            <Box bg="white" p={3} borderRadius="lg" border="1px solid" borderColor="gray.200">
                                                                <HStack spacing={1.5} mb={1}>
                                                                    <Icon as={FaVenusMars} color="gray.500" fontSize="11px" />
                                                                    <Text fontSize="10px" color="gray.500" fontWeight="700">5. GENDER</Text>
                                                                </HStack>
                                                                <Text fontWeight="600" color="gray.800" fontSize="xs">
                                                                    {viewEmployee.gender ? (viewEmployee.gender === 'Male' ? 'Male' : viewEmployee.gender === 'Female' ? 'Female' : 'Other') : '—'}
                                                                </Text>
                                                            </Box>

                                                            {/* 6. Mail ID */}
                                                            <Box bg="white" p={3} borderRadius="lg" border="1px solid" borderColor="gray.200">
                                                                <HStack spacing={1.5} mb={1}>
                                                                    <Icon as={FaEnvelope} color="gray.500" fontSize="11px" />
                                                                    <Text fontSize="10px" color="gray.500" fontWeight="700">6. MAIL ID</Text>
                                                                </HStack>
                                                                <Text fontWeight="600" color="gray.800" isTruncated fontSize="xs">
                                                                    {viewEmployee.email || '—'}
                                                                </Text>
                                                            </Box>
                                                        </SimpleGrid>
                                                    </Box>

                                                    {/* ── Items 7 to 10: KYC Cards - Number & Image/PDF ── */}
                                                    <Box bg="gray.50" p={3.5} borderRadius="xl" border="1px solid" borderColor="gray.200">
                                                        <Text fontSize="xs" fontWeight="700" color="gray.700" textTransform="uppercase" mb={3} letterSpacing="0.3px">
                                                            Identity Cards — Number &amp; File (7 - 10)
                                                        </Text>
                                                        <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing={3}>
                                                            {/* 7. Aadhaar Card */}
                                                            {renderKycViewCard({
                                                                itemNumber: '7',
                                                                title: 'Aadhaar Card',
                                                                cardNo: viewEmployee.aadharNumber,
                                                                doc: viewEmployee.aadharCard,
                                                                icon: FaIdCard,
                                                            })}

                                                            {/* 8. PAN Card */}
                                                            {renderKycViewCard({
                                                                itemNumber: '8',
                                                                title: 'PAN Card',
                                                                cardNo: viewEmployee.panNumber,
                                                                doc: viewEmployee.panCard,
                                                                icon: FaIdCard,
                                                            })}

                                                            {/* 9. Voter ID */}
                                                            {renderKycViewCard({
                                                                itemNumber: '9',
                                                                title: 'Voter ID',
                                                                cardNo: viewEmployee.voterIdNumber,
                                                                doc: viewEmployee.voterId,
                                                                icon: FaIdBadge,
                                                            })}

                                                            {/* 10. Driving License */}
                                                            {renderKycViewCard({
                                                                itemNumber: '10',
                                                                title: 'Driving License',
                                                                cardNo: viewEmployee.drivingLicenseNumber,
                                                                doc: viewEmployee.drivingLicense,
                                                                icon: FaCar,
                                                            })}
                                                        </SimpleGrid>
                                                    </Box>

                                                    {/* ── Residential Addresses & Emergency Contact ── */}
                                                    <SimpleGrid columns={{ base: 1, md: 3 }} spacing={3}>
                                                        <Box p={3} bg="white" borderRadius="lg" border="1px solid" borderColor="gray.200">
                                                            <Text fontSize="10px" fontWeight="700" color="gray.500" textTransform="uppercase">Primary Residence</Text>
                                                            <Text fontSize="xs" color="gray.700" fontWeight="500" mt={1}>
                                                                {viewEmployee.addressLine1?.street || '—'}, {viewEmployee.addressLine1?.city || '—'} - {viewEmployee.addressLine1?.pincode || '—'}
                                                            </Text>
                                                        </Box>
                                                        <Box p={3} bg="white" borderRadius="lg" border="1px solid" borderColor="gray.200">
                                                            <Text fontSize="10px" fontWeight="700" color="gray.500" textTransform="uppercase">Permanent Native</Text>
                                                            <Text fontSize="xs" color="gray.700" fontWeight="500" mt={1}>
                                                                {viewEmployee.addressLine2?.street || 'Same as primary'}, {viewEmployee.addressLine2?.city || '—'} - {viewEmployee.addressLine2?.pincode || '—'}
                                                            </Text>
                                                        </Box>
                                                        <Box p={3} bg="white" borderRadius="lg" border="1px solid" borderColor="gray.200">
                                                            <Text fontSize="10px" fontWeight="700" color="gray.500" textTransform="uppercase">Emergency Contact</Text>
                                                            <Text fontSize="xs" color="gray.800" fontWeight="600" mt={1}>
                                                                {viewEmployee.emergencyContact?.name || '—'} {viewEmployee.emergencyContact?.phone ? `• ${viewEmployee.emergencyContact.phone}` : ''}
                                                            </Text>
                                                        </Box>
                                                    </SimpleGrid>
                                                </VStack>
                                            )}

                                            {/* 2. WORK TAB */}
                                            {activeProfileTab === 'work' && (
                                                <VStack spacing={3.5} align="stretch">
                                                    {/* ── Items 1 to 4: Core Work Details ── */}
                                                    <Box bg="gray.50" p={3.5} borderRadius="xl" border="1px solid" borderColor="gray.200">
                                                        <Text fontSize="xs" fontWeight="700" color="gray.700" textTransform="uppercase" mb={3} letterSpacing="0.3px">
                                                            Work &amp; Employment Details (1 - 4)
                                                        </Text>
                                                        <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing={3}>
                                                            {/* 1. Designation */}
                                                            <Box bg="white" p={3} borderRadius="lg" border="1px solid" borderColor="gray.200">
                                                                <HStack spacing={1.5} mb={1}>
                                                                    <Icon as={FaBriefcase} color="gray.500" fontSize="11px" />
                                                                    <Text fontSize="10px" color="gray.500" fontWeight="700">1. DESIGNATION</Text>
                                                                </HStack>
                                                                <Text fontWeight="700" color="gray.800" fontSize="sm">
                                                                    {viewEmployee.designation || 'Staff'}
                                                                </Text>
                                                            </Box>

                                                            {/* 2. Report To */}
                                                            <Box bg="white" p={3} borderRadius="lg" border="1px solid" borderColor="gray.200">
                                                                <HStack spacing={1.5} mb={1}>
                                                                    <Icon as={FaSitemap} color="gray.500" fontSize="11px" />
                                                                    <Text fontSize="10px" color="gray.500" fontWeight="700">2. REPORT TO</Text>
                                                                </HStack>
                                                                <Text fontWeight="700" color="gray.800" fontSize="xs" isTruncated title={viewEmployee.reportedTo || 'Top Management'}>
                                                                    {viewEmployee.reportedTo || 'Top Management'}
                                                                </Text>
                                                            </Box>

                                                            {/* 3. Joining Date */}
                                                            <Box bg="white" p={3} borderRadius="lg" border="1px solid" borderColor="gray.200">
                                                                <HStack spacing={1.5} mb={1}>
                                                                    <Icon as={FaCalendarAlt} color="gray.500" fontSize="11px" />
                                                                    <Text fontSize="10px" color="gray.500" fontWeight="700">3. JOINING DATE</Text>
                                                                </HStack>
                                                                <Text fontWeight="700" color="gray.800" fontSize="xs">
                                                                    {viewEmployee.joiningDate || (viewEmployee.createdAt ? new Date(viewEmployee.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—')}
                                                                </Text>
                                                            </Box>

                                                            {/* 4. ID */}
                                                            <Box bg="white" p={3} borderRadius="lg" border="1px solid" borderColor="gray.200">
                                                                <HStack spacing={1.5} mb={1}>
                                                                    <Icon as={FaIdBadge} color="gray.500" fontSize="11px" />
                                                                    <Text fontSize="10px" color="gray.500" fontWeight="700">4. ID</Text>
                                                                </HStack>
                                                                <Badge colorScheme="blue" variant="subtle" fontSize="xs" px={2} py={0.5} borderRadius="md" fontFamily="mono" fontWeight="700">
                                                                    {viewEmployee.empId || viewEmployee._id?.substring(0, 8)?.toUpperCase() || '—'}
                                                                </Badge>
                                                            </Box>
                                                        </SimpleGrid>
                                                    </Box>

                                                    {/* Issued Assets / Hardware */}
                                                    <Box p={3.5} bg="white" borderRadius="lg" border="1px solid" borderColor="gray.200">
                                                        <Text fontSize="10px" fontWeight="700" color="gray.500" textTransform="uppercase" mb={1}>
                                                            Company Issued Hardware &amp; Assets
                                                        </Text>
                                                        <Text fontSize="xs" color="gray.800" fontWeight="500">
                                                            {viewEmployee.companyItems?.issuedItems || 'No assets recorded as handed over.'}
                                                        </Text>
                                                    </Box>
                                                </VStack>
                                            )}

                                            {/* 3. PAYOUTS TAB */}
                                            {activeProfileTab === 'payouts' && (
                                                <VStack spacing={4} align="stretch">
                                                    {/* Hidden File Input for Quick Salary Slip Upload */}
                                                    <input
                                                        type="file"
                                                        ref={salarySlipInputRef}
                                                        onChange={handleQuickUploadSalarySlip}
                                                        multiple
                                                        accept=".pdf,.png,.jpg,.jpeg"
                                                        style={{ display: 'none' }}
                                                    />

                                                    {/* ── Items 2, 3 & 5: Salary Overview Cards ── */}
                                                    <SimpleGrid columns={{ base: 1, md: 3 }} spacing={3.5}>
                                                        {/* 2. Monthly Salary */}
                                                        <Box bg="white" p={3.5} borderRadius="lg" border="1px solid" borderColor="gray.200">
                                                            <HStack spacing={1.5} mb={1}>
                                                                <Icon as={FaMoneyBillWave} color="gray.500" fontSize="12px" />
                                                                <Text fontSize="10px" color="gray.500" fontWeight="700">2. MONTHLY SALARY</Text>
                                                            </HStack>
                                                            <Heading size="md" color="gray.800" mt={0.5}>
                                                                ₹{parseFloat(viewEmployee.salary || 0).toLocaleString()}
                                                            </Heading>
                                                            <Text fontSize="2xs" color="gray.500" mt={1}>
                                                                Fixed regular monthly compensation
                                                            </Text>
                                                        </Box>

                                                        {/* 3. Year Salary */}
                                                        <Box bg="white" p={3.5} borderRadius="lg" border="1px solid" borderColor="gray.200">
                                                            <HStack spacing={1.5} mb={1}>
                                                                <Icon as={FaMoneyCheckAlt} color="gray.500" fontSize="12px" />
                                                                <Text fontSize="10px" color="gray.500" fontWeight="700">3. YEAR SALARY (ANNUAL CTC)</Text>
                                                            </HStack>
                                                            <Heading size="md" color="gray.800" mt={0.5}>
                                                                ₹{(parseFloat(viewEmployee.salary || 0) * 12).toLocaleString()}
                                                            </Heading>
                                                            <Text fontSize="2xs" color="gray.500" mt={1}>
                                                                Gross annualized package (12 months)
                                                            </Text>
                                                        </Box>

                                                        {/* 5. Salary Date (Easy Interaction) */}
                                                        <Box bg="white" p={3.5} borderRadius="lg" border="1px solid" borderColor="gray.200">
                                                            <HStack justify="space-between" align="center" mb={1}>
                                                                <HStack spacing={1.5}>
                                                                    <Icon as={FaCalendarCheck} color="gray.500" fontSize="12px" />
                                                                    <Text fontSize="10px" color="gray.500" fontWeight="700">5. SALARY DISBURSEMENT DATE</Text>
                                                                </HStack>
                                                                {isUpdatingSalaryDate && <Spinner size="xs" color="blue.500" />}
                                                            </HStack>
                                                            <Box mt={1}>
                                                                <Input
                                                                    type="date"
                                                                    size="xs"
                                                                    h="28px"
                                                                    fontWeight="700"
                                                                    color="blue.700"
                                                                    bg="gray.50"
                                                                    borderRadius="md"
                                                                    borderColor="gray.300"
                                                                    _hover={{ borderColor: "blue.400" }}
                                                                    _focus={{ borderColor: "blue.600", bg: "white" }}
                                                                    value={viewEmployee.salaryDate || ''}
                                                                    onChange={(e) => handleQuickUpdateSalaryDate(e.target.value)}
                                                                    isDisabled={isUpdatingSalaryDate}
                                                                />
                                                            </Box>
                                                            <Text fontSize="2xs" color="gray.500" mt={1}>
                                                                Select exact disbursement date (e.g. 2026-11-05)
                                                            </Text>
                                                        </Box>
                                                    </SimpleGrid>

                                                    {/* ── Item 4: Salary Increment Date & Added to Previous Salary ── */}
                                                    <Box bg="gray.50" p={3.5} borderRadius="xl" border="1px solid" borderColor="gray.200">
                                                        <Flex justify="space-between" align="center" wrap="wrap" gap={2} mb={3}>
                                                            <HStack spacing={1.5}>
                                                                <Icon as={FaChartLine} color="gray.600" fontSize="xs" />
                                                                <Text fontSize="xs" fontWeight="700" color="gray.700" textTransform="uppercase">
                                                                    4. Salary Increment Date &amp; Added to Previous Salary
                                                                </Text>
                                                            </HStack>
                                                            <Button
                                                                size="xs"
                                                                h="28px"
                                                                colorScheme="blue"
                                                                variant="solid"
                                                                borderRadius="md"
                                                                fontWeight="700"
                                                                leftIcon={<Icon as={FaPlus} fontSize="9px" />}
                                                                onClick={() => {
                                                                    setIncrementForm({
                                                                        newSalary: '',
                                                                        incrementAmount: '',
                                                                        incrementDate: new Date().toISOString().split('T')[0],
                                                                        remarks: ''
                                                                    });
                                                                    setIsIncrementModalOpen(true);
                                                                }}
                                                            >
                                                                + Add / Revise Salary
                                                            </Button>
                                                        </Flex>

                                                        {/* Increment Metrics Row */}
                                                        <SimpleGrid columns={{ base: 1, sm: 3 }} spacing={3}>
                                                            {/* Increment Date */}
                                                            <Box bg="white" p={3} borderRadius="lg" border="1px solid" borderColor="gray.200">
                                                                <Text fontSize="10px" color="gray.500" fontWeight="700" textTransform="uppercase">
                                                                    Last Increment Date
                                                                </Text>
                                                                <Text fontSize="xs" fontWeight="700" color="gray.800" mt={1}>
                                                                    {viewEmployee.salaryIncrementDate ? `📅 ${viewEmployee.salaryIncrementDate}` : (viewEmployee.joiningDate ? `Initial Joined (${viewEmployee.joiningDate})` : 'Initial Joining')}
                                                                </Text>
                                                            </Box>

                                                            {/* Previous Salary */}
                                                            <Box bg="white" p={3} borderRadius="lg" border="1px solid" borderColor="gray.200">
                                                                <Text fontSize="10px" color="gray.500" fontWeight="700" textTransform="uppercase">
                                                                    Previous Salary
                                                                </Text>
                                                                <Text fontSize="xs" fontWeight="700" color="gray.800" mt={1}>
                                                                    {viewEmployee.previousSalary ? `₹${parseFloat(viewEmployee.previousSalary).toLocaleString()} / mo` : '— (Base Salary)'}
                                                                </Text>
                                                            </Box>

                                                            {/* Salary Added / Increment */}
                                                            <Box bg="white" p={3} borderRadius="lg" border="1px solid" borderColor="gray.200">
                                                                <Text fontSize="10px" color="gray.500" fontWeight="700" textTransform="uppercase">
                                                                    Salary Added to Previous
                                                                </Text>
                                                                {viewEmployee.previousSalary && viewEmployee.salary > viewEmployee.previousSalary ? (
                                                                    <HStack spacing={1.5} mt={1}>
                                                                        <Badge colorScheme="green" variant="subtle" fontSize="xs" fontWeight="bold" px={2} py={0.5} borderRadius="md">
                                                                            +₹{(parseFloat(viewEmployee.salary) - parseFloat(viewEmployee.previousSalary)).toLocaleString()}
                                                                        </Badge>
                                                                        <Text fontSize="2xs" color="green.700" fontWeight="bold">
                                                                            (+{(((viewEmployee.salary - viewEmployee.previousSalary) / viewEmployee.previousSalary) * 100).toFixed(1)}%)
                                                                        </Text>
                                                                    </HStack>
                                                                ) : (
                                                                    <Text fontSize="xs" fontWeight="600" color="gray.500" mt={1}>
                                                                        No previous increment logged
                                                                    </Text>
                                                                )}
                                                            </Box>
                                                        </SimpleGrid>

                                                        {/* Historical Salary Revisions Table (if present) */}
                                                        {Array.isArray(viewEmployee.salaryHistory) && viewEmployee.salaryHistory.length > 0 && (
                                                            <Box mt={3} bg="white" borderRadius="lg" border="1px solid" borderColor="gray.200" overflow="hidden">
                                                                <TableContainer maxH="160px" overflowY="auto">
                                                                    <Table size="xs" variant="simple">
                                                                        <Thead bg="gray.100">
                                                                            <Tr>
                                                                                <Th fontSize="9px">INCREMENT DATE</Th>
                                                                                <Th fontSize="9px">PREVIOUS SALARY</Th>
                                                                                <Th fontSize="9px">REVISED SALARY</Th>
                                                                                <Th fontSize="9px">SALARY ADDED</Th>
                                                                                <Th fontSize="9px">REMARKS</Th>
                                                                            </Tr>
                                                                        </Thead>
                                                                        <Tbody>
                                                                            {viewEmployee.salaryHistory.map((hist, hIdx) => (
                                                                                <Tr key={hIdx}>
                                                                                    <Td fontSize="xs" fontWeight="600">{hist.date}</Td>
                                                                                    <Td fontSize="xs">₹{parseFloat(hist.previousSalary || 0).toLocaleString()}</Td>
                                                                                    <Td fontSize="xs" fontWeight="bold" color="blue.700">₹{parseFloat(hist.newSalary || 0).toLocaleString()}</Td>
                                                                                    <Td fontSize="xs">
                                                                                        <Badge colorScheme="green" variant="subtle" fontSize="2xs" px={1.5} py={0.5} borderRadius="sm">
                                                                                            +₹{parseFloat(hist.incrementAmount || 0).toLocaleString()} {hist.percentage ? `(+${hist.percentage}%)` : ''}
                                                                                        </Badge>
                                                                                    </Td>
                                                                                    <Td fontSize="2xs" color="gray.600">{hist.remarks || 'Salary Revision'}</Td>
                                                                                </Tr>
                                                                            ))}
                                                                        </Tbody>
                                                                    </Table>
                                                                </TableContainer>
                                                            </Box>
                                                        )}
                                                    </Box>

                                                    {/* ── Item 1: Old Salary Slips ── */}
                                                    <Box bg="gray.50" p={3.5} borderRadius="xl" border="1px solid" borderColor="gray.200">
                                                        <Flex justify="space-between" align="center" wrap="wrap" gap={2} mb={3}>
                                                            <HStack spacing={1.5}>
                                                                <Icon as={FaFileAlt} color="gray.600" fontSize="xs" />
                                                                <Text fontSize="xs" fontWeight="700" color="gray.700" textTransform="uppercase">
                                                                    1. Old Salary Slips &amp; Documents ({Array.isArray(viewEmployee.salarySlips) ? viewEmployee.salarySlips.length : 0})
                                                                </Text>
                                                            </HStack>
                                                            <Button
                                                                size="xs"
                                                                h="28px"
                                                                colorScheme="blue"
                                                                variant="outline"
                                                                borderRadius="md"
                                                                fontWeight="600"
                                                                leftIcon={<Icon as={FaCloudUploadAlt} fontSize="11px" />}
                                                                isLoading={isUploadingSlip}
                                                                onClick={() => salarySlipInputRef.current?.click()}
                                                            >
                                                                + Upload Salary Slip
                                                            </Button>
                                                        </Flex>

                                                        {Array.isArray(viewEmployee.salarySlips) && viewEmployee.salarySlips.length > 0 ? (
                                                            <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={3}>
                                                                {viewEmployee.salarySlips.map((doc, idx) => {
                                                                    const docUrl = getFileUrl(doc);
                                                                    if (!docUrl) return null;
                                                                    const fileName = doc?.name || doc?.title || `Salary Slip #${idx + 1}`;
                                                                    const isPdf = fileName.toLowerCase().endsWith('.pdf') || docUrl.toLowerCase().includes('.pdf');
                                                                    return (
                                                                        <Box
                                                                            key={`slip-${idx}`}
                                                                            p={3}
                                                                            bg="white"
                                                                            borderRadius="lg"
                                                                            border="1px solid"
                                                                            borderColor="gray.200"
                                                                            display="flex"
                                                                            flexDirection="column"
                                                                            justify="space-between"
                                                                        >
                                                                            <HStack spacing={2} mb={2}>
                                                                                <Icon as={isPdf ? FaFilePdf : FaFileImage} color={isPdf ? "red.500" : "blue.500"} fontSize="sm" />
                                                                                <Text fontSize="xs" fontWeight="700" color="gray.800" isTruncated title={fileName}>
                                                                                    {doc.title || `Salary Slip #${idx + 1}`}
                                                                                </Text>
                                                                            </HStack>
                                                                            <HStack spacing={2} pt={1}>
                                                                                <Button
                                                                                    as="a"
                                                                                    href={docUrl}
                                                                                    target="_blank"
                                                                                    rel="noopener noreferrer"
                                                                                    size="xs"
                                                                                    h="26px"
                                                                                    colorScheme="blue"
                                                                                    variant="outline"
                                                                                    borderRadius="md"
                                                                                    leftIcon={<Icon as={FaEye} fontSize="10px" />}
                                                                                    flex={1}
                                                                                >
                                                                                    View
                                                                                </Button>
                                                                                <Button
                                                                                    as="a"
                                                                                    href={docUrl}
                                                                                    download={fileName}
                                                                                    target="_blank"
                                                                                    rel="noopener noreferrer"
                                                                                    size="xs"
                                                                                    h="26px"
                                                                                    colorScheme="gray"
                                                                                    variant="ghost"
                                                                                    borderRadius="md"
                                                                                    leftIcon={<Icon as={FaDownload} fontSize="10px" />}
                                                                                >
                                                                                    Save
                                                                                </Button>
                                                                            </HStack>
                                                                        </Box>
                                                                    );
                                                                })}
                                                            </SimpleGrid>
                                                        ) : (
                                                            <Box py={4} textAlign="center" bg="white" borderRadius="lg" border="1px dashed" borderColor="gray.300">
                                                                <Text fontSize="xs" color="gray.500" fontWeight="500">
                                                                    No previous salary slips on record.
                                                                </Text>
                                                                <Button
                                                                    size="xs"
                                                                    mt={2}
                                                                    colorScheme="blue"
                                                                    variant="ghost"
                                                                    leftIcon={<Icon as={FaPlus} fontSize="9px" />}
                                                                    onClick={() => salarySlipInputRef.current?.click()}
                                                                >
                                                                    Click here to upload past payslips
                                                                </Button>
                                                            </Box>
                                                        )}
                                                    </Box>

                                                    {/* ── Recorded Payout Ledger ── */}
                                                    <Box bg="white" borderRadius="xl" border="1px solid" borderColor="gray.200" overflow="hidden">
                                                        <Box px={3.5} py={2.5} bg="gray.50" borderBottom="1px solid" borderColor="gray.200">
                                                            <Text fontSize="10px" fontWeight="700" color="gray.600" textTransform="uppercase">
                                                                Monthly Payout History Ledger ({Array.isArray(viewEmployee.monthlyPayments) ? viewEmployee.monthlyPayments.length : 0} Records)
                                                            </Text>
                                                        </Box>
                                                        <TableContainer>
                                                            <Table size="sm" variant="simple">
                                                                <Thead bg="gray.50">
                                                                    <Tr>
                                                                        <Th fontSize="10px">MONTH</Th>
                                                                        <Th fontSize="10px">MODE</Th>
                                                                        <Th fontSize="10px">STATUS</Th>
                                                                        <Th fontSize="10px">DAYS (P/A)</Th>
                                                                        <Th fontSize="10px">UPAD (ADV)</Th>
                                                                        <Th fontSize="10px">INCENTIVE</Th>
                                                                    </Tr>
                                                                </Thead>
                                                                <Tbody>
                                                                    {Array.isArray(viewEmployee.monthlyPayments) && viewEmployee.monthlyPayments.length > 0 ? (
                                                                        viewEmployee.monthlyPayments.map((p, pIdx) => (
                                                                            <Tr key={pIdx}>
                                                                                <Td fontWeight="bold" fontSize="xs">{p.month}</Td>
                                                                                <Td fontSize="xs">
                                                                                    <Badge colorScheme="gray" variant="subtle" fontSize="2xs">
                                                                                        {p.paymentMode || 'Cash'}
                                                                                    </Badge>
                                                                                </Td>
                                                                                <Td fontSize="xs">
                                                                                    <Badge colorScheme={p.paymentStatus === 'Done' ? 'green' : 'orange'} fontSize="2xs">
                                                                                        {p.paymentStatus === 'Done' ? '✅ Paid' : '⏳ Pending'}
                                                                                    </Badge>
                                                                                </Td>
                                                                                <Td fontSize="xs">{p.presentDays ?? '—'} / {p.absentDays ?? '—'}</Td>
                                                                                <Td fontSize="xs" color="gray.700" fontWeight="bold">{p.upad ? `₹${p.upad}` : '—'}</Td>
                                                                                <Td fontSize="xs" color="green.700" fontWeight="bold">{p.incentive ? `₹${p.incentive}` : '—'}</Td>
                                                                            </Tr>
                                                                        ))
                                                                    ) : (
                                                                        <Tr>
                                                                            <Td colSpan={6} textAlign="center" py={5} color="gray.500" fontSize="xs">
                                                                                No monthly payout records yet. Records are generated in the Monthly Payout Report tab.
                                                                            </Td>
                                                                        </Tr>
                                                                    )}
                                                                </Tbody>
                                                            </Table>
                                                        </TableContainer>
                                                    </Box>
                                                </VStack>
                                            )}

                                            {/* 4. DOCUMENTS TAB */}
                                            {activeProfileTab === 'documents' && (
                                                <VStack spacing={4} align="stretch">
                                                    {/* Hidden File Input for Quick Joining Letter Upload */}
                                                    <input
                                                        type="file"
                                                        ref={joiningLetterInputRef}
                                                        onChange={handleQuickUploadJoiningLetter}
                                                        accept=".pdf,.png,.jpg,.jpeg"
                                                        style={{ display: 'none' }}
                                                    />

                                                    {/* ── Primary Documents Grid (1 to 4) ── */}
                                                    <Box bg="gray.50" p={3.5} borderRadius="xl" border="1px solid" borderColor="gray.200">
                                                        <Text fontSize="xs" fontWeight="700" color="gray.700" textTransform="uppercase" mb={3} letterSpacing="0.3px">
                                                            Core Employment &amp; Policy Documents (1 - 4)
                                                        </Text>
                                                        <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={3.5}>
                                                            {/* 1. Resume */}
                                                            <Box bg="white" p={3.5} borderRadius="lg" border="1px solid" borderColor="gray.200" display="flex" flexDirection="column" justify="space-between">
                                                                <Box>
                                                                    <Flex justify="space-between" align="center" mb={2}>
                                                                        <HStack spacing={1.5}>
                                                                            <Icon as={FaFileAlt} color="gray.600" fontSize="xs" />
                                                                            <Text fontSize="xs" fontWeight="700" color="gray.800">
                                                                                1. RESUME / CV
                                                                            </Text>
                                                                        </HStack>
                                                                        <Badge
                                                                            colorScheme={viewEmployee.resume && getFileUrl(viewEmployee.resume) ? "blue" : "gray"}
                                                                            variant="subtle"
                                                                            fontSize="2xs"
                                                                            px={1.5}
                                                                            py={0.5}
                                                                            borderRadius="md"
                                                                        >
                                                                            {viewEmployee.resume && getFileUrl(viewEmployee.resume) ? "Attached" : "Not Attached"}
                                                                        </Badge>
                                                                    </Flex>
                                                                    <Text fontSize="2xs" color="gray.500" mb={3}>
                                                                        Candidate CV &amp; Career Portfolio
                                                                    </Text>
                                                                </Box>

                                                                <Box pt={1}>
                                                                    {viewEmployee.resume && getFileUrl(viewEmployee.resume) ? (
                                                                        <VStack align="stretch" spacing={2}>
                                                                            <Button
                                                                                as="a"
                                                                                href={getFileUrl(viewEmployee.resume)}
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                                size="xs"
                                                                                h="28px"
                                                                                colorScheme="blue"
                                                                                variant="solid"
                                                                                borderRadius="md"
                                                                                leftIcon={<Icon as={FaEye} fontSize="10px" />}
                                                                                rightIcon={<Icon as={FaExternalLinkAlt} fontSize="8px" />}
                                                                                w="full"
                                                                            >
                                                                                View Resume
                                                                            </Button>
                                                                            <Button
                                                                                as="a"
                                                                                href={getFileUrl(viewEmployee.resume)}
                                                                                download="resume"
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                                size="xs"
                                                                                h="26px"
                                                                                colorScheme="gray"
                                                                                variant="outline"
                                                                                borderRadius="md"
                                                                                leftIcon={<Icon as={FaDownload} fontSize="10px" />}
                                                                                w="full"
                                                                            >
                                                                                Download File
                                                                            </Button>
                                                                        </VStack>
                                                                    ) : (
                                                                        <Box py={3} textAlign="center" bg="gray.50" borderRadius="md" border="1px dashed" borderColor="gray.300">
                                                                            <Text fontSize="2xs" color="gray.400" fontWeight="500">
                                                                                No resume on record
                                                                            </Text>
                                                                        </Box>
                                                                    )}
                                                                </Box>
                                                            </Box>

                                                            {/* 2. Mediclaim */}
                                                            <Box bg="white" p={3.5} borderRadius="lg" border="1px solid" borderColor="gray.200" display="flex" flexDirection="column" justify="space-between">
                                                                <Box>
                                                                    <Flex justify="space-between" align="center" mb={2}>
                                                                        <HStack spacing={1.5}>
                                                                            <Icon as={FaMedkit} color="gray.600" fontSize="xs" />
                                                                            <Text fontSize="xs" fontWeight="700" color="gray.800">
                                                                                2. MEDICLAIM
                                                                            </Text>
                                                                        </HStack>
                                                                        <Badge
                                                                            colorScheme={(Array.isArray(viewEmployee.mediclaimDocs) && viewEmployee.mediclaimDocs.length > 0) || viewEmployee.companyItems?.mediclaimNumber ? "blue" : "gray"}
                                                                            variant="subtle"
                                                                            fontSize="2xs"
                                                                            px={1.5}
                                                                            py={0.5}
                                                                            borderRadius="md"
                                                                        >
                                                                            {(Array.isArray(viewEmployee.mediclaimDocs) && viewEmployee.mediclaimDocs.length > 0) || viewEmployee.companyItems?.mediclaimNumber ? "Active / Attached" : "Not Attached"}
                                                                        </Badge>
                                                                    </Flex>
                                                                    <Box mb={2} p={2} bg="gray.50" borderRadius="md" border="1px solid" borderColor="gray.200" fontSize="2xs">
                                                                        <Text color="gray.500" fontWeight="bold">CARD NO: <Text as="span" color="gray.800" fontFamily="mono">{viewEmployee.companyItems?.mediclaimNumber || '—'}</Text></Text>
                                                                        <Text color="gray.500">PROVIDER: <Text as="span" color="gray.800" fontWeight="600">{viewEmployee.companyItems?.mediclaimProvider || '—'}</Text></Text>
                                                                    </Box>
                                                                </Box>

                                                                <Box pt={1}>
                                                                    {Array.isArray(viewEmployee.mediclaimDocs) && viewEmployee.mediclaimDocs.length > 0 ? (
                                                                        <VStack align="stretch" spacing={1.5}>
                                                                            {viewEmployee.mediclaimDocs.map((doc, idx) => {
                                                                                const docUrl = getFileUrl(doc);
                                                                                if (!docUrl) return null;
                                                                                return (
                                                                                    <Button
                                                                                        key={`med-${idx}`}
                                                                                        as="a"
                                                                                        href={docUrl}
                                                                                        target="_blank"
                                                                                        rel="noopener noreferrer"
                                                                                        size="xs"
                                                                                        h="26px"
                                                                                        colorScheme="blue"
                                                                                        variant="outline"
                                                                                        borderRadius="md"
                                                                                        leftIcon={<Icon as={FaFilePdf} fontSize="10px" />}
                                                                                        rightIcon={<Icon as={FaExternalLinkAlt} fontSize="8px" />}
                                                                                    >
                                                                                        View Card #{idx + 1}
                                                                                    </Button>
                                                                                );
                                                                            })}
                                                                        </VStack>
                                                                    ) : (
                                                                        <Box py={3} textAlign="center" bg="gray.50" borderRadius="md" border="1px dashed" borderColor="gray.300">
                                                                            <Text fontSize="2xs" color="gray.400" fontWeight="500">
                                                                                No mediclaim doc attached
                                                                            </Text>
                                                                        </Box>
                                                                    )}
                                                                </Box>
                                                            </Box>

                                                            {/* 3. Insurance */}
                                                            <Box bg="white" p={3.5} borderRadius="lg" border="1px solid" borderColor="gray.200" display="flex" flexDirection="column" justify="space-between">
                                                                <Box>
                                                                    <Flex justify="space-between" align="center" mb={2}>
                                                                        <HStack spacing={1.5}>
                                                                            <Icon as={FaShieldAlt} color="gray.600" fontSize="xs" />
                                                                            <Text fontSize="xs" fontWeight="700" color="gray.800">
                                                                                3. INSURANCE
                                                                            </Text>
                                                                        </HStack>
                                                                        <Badge
                                                                            colorScheme={(Array.isArray(viewEmployee.insuranceDocs) && viewEmployee.insuranceDocs.length > 0) || viewEmployee.companyItems?.insuranceNumber ? "blue" : "gray"}
                                                                            variant="subtle"
                                                                            fontSize="2xs"
                                                                            px={1.5}
                                                                            py={0.5}
                                                                            borderRadius="md"
                                                                        >
                                                                            {(Array.isArray(viewEmployee.insuranceDocs) && viewEmployee.insuranceDocs.length > 0) || viewEmployee.companyItems?.insuranceNumber ? "Active / Attached" : "Not Attached"}
                                                                        </Badge>
                                                                    </Flex>
                                                                    <Box mb={2} p={2} bg="gray.50" borderRadius="md" border="1px solid" borderColor="gray.200" fontSize="2xs">
                                                                        <Text color="gray.500" fontWeight="bold">POLICY NO: <Text as="span" color="gray.800" fontFamily="mono">{viewEmployee.companyItems?.insuranceNumber || '—'}</Text></Text>
                                                                        <Text color="gray.500">PROVIDER: <Text as="span" color="gray.800" fontWeight="600">{viewEmployee.companyItems?.insuranceProvider || '—'}</Text></Text>
                                                                    </Box>
                                                                </Box>

                                                                <Box pt={1}>
                                                                    {Array.isArray(viewEmployee.insuranceDocs) && viewEmployee.insuranceDocs.length > 0 ? (
                                                                        <VStack align="stretch" spacing={1.5}>
                                                                            {viewEmployee.insuranceDocs.map((doc, idx) => {
                                                                                const docUrl = getFileUrl(doc);
                                                                                if (!docUrl) return null;
                                                                                return (
                                                                                    <Button
                                                                                        key={`ins-${idx}`}
                                                                                        as="a"
                                                                                        href={docUrl}
                                                                                        target="_blank"
                                                                                        rel="noopener noreferrer"
                                                                                        size="xs"
                                                                                        h="26px"
                                                                                        colorScheme="blue"
                                                                                        variant="outline"
                                                                                        borderRadius="md"
                                                                                        leftIcon={<Icon as={FaFilePdf} fontSize="10px" />}
                                                                                        rightIcon={<Icon as={FaExternalLinkAlt} fontSize="8px" />}
                                                                                    >
                                                                                        View Policy #{idx + 1}
                                                                                    </Button>
                                                                                );
                                                                            })}
                                                                        </VStack>
                                                                    ) : (
                                                                        <Box py={3} textAlign="center" bg="gray.50" borderRadius="md" border="1px dashed" borderColor="gray.300">
                                                                            <Text fontSize="2xs" color="gray.400" fontWeight="500">
                                                                                No insurance doc attached
                                                                            </Text>
                                                                        </Box>
                                                                    )}
                                                                </Box>
                                                            </Box>

                                                            {/* 4. Joining Letter */}
                                                            <Box bg="white" p={3.5} borderRadius="lg" border="1px solid" borderColor="gray.200" display="flex" flexDirection="column" justify="space-between">
                                                                <Box>
                                                                    <Flex justify="space-between" align="center" mb={2}>
                                                                        <HStack spacing={1.5}>
                                                                            <Icon as={FaCalendarAlt} color="gray.600" fontSize="xs" />
                                                                            <Text fontSize="xs" fontWeight="700" color="gray.800">
                                                                                4. JOINING LETTER
                                                                            </Text>
                                                                        </HStack>
                                                                        <Badge
                                                                            colorScheme={viewEmployee.joiningLetter && getFileUrl(viewEmployee.joiningLetter) ? "green" : "orange"}
                                                                            variant="subtle"
                                                                            fontSize="2xs"
                                                                            px={1.5}
                                                                            py={0.5}
                                                                            borderRadius="md"
                                                                        >
                                                                            {viewEmployee.joiningLetter && getFileUrl(viewEmployee.joiningLetter) ? "Attached & Ready" : "Pending Upload"}
                                                                        </Badge>
                                                                    </Flex>
                                                                    <Text fontSize="2xs" color="gray.500" mb={3}>
                                                                        Official Appointment / Joining Letter
                                                                    </Text>
                                                                </Box>

                                                                <Box pt={1}>
                                                                    {viewEmployee.joiningLetter && getFileUrl(viewEmployee.joiningLetter) ? (
                                                                        <VStack align="stretch" spacing={2}>
                                                                            <Button
                                                                                as="a"
                                                                                href={getFileUrl(viewEmployee.joiningLetter)}
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                                size="xs"
                                                                                h="28px"
                                                                                colorScheme="blue"
                                                                                variant="solid"
                                                                                borderRadius="md"
                                                                                leftIcon={<Icon as={FaFilePdf} fontSize="10px" />}
                                                                                rightIcon={<Icon as={FaExternalLinkAlt} fontSize="8px" />}
                                                                                w="full"
                                                                            >
                                                                                View Joining Letter
                                                                            </Button>
                                                                            <HStack spacing={1.5}>
                                                                                <Button
                                                                                    as="a"
                                                                                    href={getFileUrl(viewEmployee.joiningLetter)}
                                                                                    download="joining_letter"
                                                                                    target="_blank"
                                                                                    rel="noopener noreferrer"
                                                                                    size="xs"
                                                                                    h="26px"
                                                                                    colorScheme="gray"
                                                                                    variant="outline"
                                                                                    borderRadius="md"
                                                                                    leftIcon={<Icon as={FaDownload} fontSize="10px" />}
                                                                                    flex={1}
                                                                                >
                                                                                    Save PDF
                                                                                </Button>
                                                                                <Button
                                                                                    size="xs"
                                                                                    h="26px"
                                                                                    colorScheme="gray"
                                                                                    variant="ghost"
                                                                                    borderRadius="md"
                                                                                    isLoading={isUploadingJoiningLetter}
                                                                                    onClick={() => joiningLetterInputRef.current?.click()}
                                                                                >
                                                                                    Replace
                                                                                </Button>
                                                                            </HStack>
                                                                        </VStack>
                                                                    ) : (
                                                                        <VStack align="stretch" spacing={2}>
                                                                            <Box py={2} px={1} textAlign="center" bg="gray.50" borderRadius="md" border="1px dashed" borderColor="gray.300">
                                                                                <Text fontSize="2xs" color="gray.500" fontWeight="500">
                                                                                    Joining letter PDF pending
                                                                                </Text>
                                                                            </Box>
                                                                            <Button
                                                                                size="xs"
                                                                                h="28px"
                                                                                colorScheme="blue"
                                                                                variant="solid"
                                                                                borderRadius="md"
                                                                                fontWeight="700"
                                                                                leftIcon={<Icon as={FaCloudUploadAlt} fontSize="12px" />}
                                                                                isLoading={isUploadingJoiningLetter}
                                                                                onClick={() => joiningLetterInputRef.current?.click()}
                                                                                w="full"
                                                                            >
                                                                                + Upload Joining Letter (PDF)
                                                                            </Button>
                                                                        </VStack>
                                                                    )}
                                                                </Box>
                                                            </Box>
                                                        </SimpleGrid>
                                                    </Box>

                                                </VStack>
                                            )}

                                            {/* 5. BANK TAB */}
                                            {activeProfileTab === 'bank' && (
                                                <VStack spacing={4} align="stretch">
                                                    <Box bg="green.50" p={4} borderRadius="2xl" border="1px solid" borderColor="green.100">
                                                        <Flex justify="space-between" align="center" mb={3}>
                                                            <Text fontSize="xs" fontWeight="black" color="green.800" textTransform="uppercase">
                                                                🏦 Banking &amp; Disbursement Particulars
                                                            </Text>
                                                            {viewEmployee.bankDetails?.verified && (
                                                                <Badge colorScheme="green" fontSize="2xs" px={2} py={0.5} borderRadius="full">
                                                                    ✓ Verified Bank Account
                                                                </Badge>
                                                            )}
                                                        </Flex>
                                                        <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={4} fontSize="xs">
                                                            <Box>
                                                                <Text fontSize="10px" color="gray.500" fontWeight="bold">BANK NAME</Text>
                                                                <Text fontWeight="bold" color="gray.800">{viewEmployee.bankDetails?.bankName || 'N/A'}</Text>
                                                            </Box>
                                                            <Box>
                                                                <Text fontSize="10px" color="gray.500" fontWeight="bold">ACCOUNT HOLDER NAME</Text>
                                                                <Text fontWeight="bold" color="gray.800">{viewEmployee.bankDetails?.accountName || 'N/A'}</Text>
                                                            </Box>
                                                            <Box>
                                                                <Text fontSize="10px" color="gray.500" fontWeight="bold">ACCOUNT NUMBER</Text>
                                                                <Text fontWeight="black" color="green.800" fontSize="sm">{viewEmployee.bankDetails?.accountNumber || 'N/A'}</Text>
                                                            </Box>
                                                            <Box>
                                                                <Text fontSize="10px" color="gray.500" fontWeight="bold">IFSC CODE</Text>
                                                                <Text fontWeight="bold" color="blue.600">{viewEmployee.bankDetails?.ifscCode || 'N/A'}</Text>
                                                            </Box>
                                                            <Box>
                                                                <Text fontSize="10px" color="gray.500" fontWeight="bold">VERIFICATION STATUS</Text>
                                                                <Badge colorScheme={viewEmployee.bankDetails?.verified ? 'green' : 'gray'} fontSize="2xs" mt={0.5}>
                                                                    {viewEmployee.bankDetails?.verified ? 'Verified Online' : 'Standard / Self Attested'}
                                                                </Badge>
                                                            </Box>
                                                        </SimpleGrid>
                                                    </Box>

                                                    {/* Bank Proof Documents */}
                                                    <Box p={4} bg="gray.50" borderRadius="2xl" border="1px solid" borderColor="gray.200">
                                                        <Text fontSize="xs" fontWeight="black" color="gray.700" textTransform="uppercase" mb={2}>
                                                            📄 Bank Proof (Passbook / Cheque Copy)
                                                        </Text>
                                                        {Array.isArray(viewEmployee.bankDetails?.documents) && viewEmployee.bankDetails.documents.length > 0 ? (
                                                            <Wrap spacing={2}>
                                                                {viewEmployee.bankDetails.documents.map((doc, idx) => {
                                                                    const docUrl = getFileUrl(doc);
                                                                    if (!docUrl) return null;
                                                                    return (
                                                                        <Button
                                                                            key={idx}
                                                                            as="a"
                                                                            href={docUrl}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            size="sm"
                                                                            colorScheme="green"
                                                                            leftIcon={<Icon as={FaFilePdf} />}
                                                                            rightIcon={<Icon as={FaExternalLinkAlt} fontSize="8px" />}
                                                                            borderRadius="xl"
                                                                        >
                                                                            View Bank Proof #{idx + 1}
                                                                        </Button>
                                                                    );
                                                                })}
                                                            </Wrap>
                                                        ) : (
                                                            <Text fontSize="xs" color="gray.500">No bank passbook or cancelled cheque copy uploaded.</Text>
                                                        )}
                                                    </Box>
                                                </VStack>
                                            )}

                                            {/* 6. SALARY TAB */}
                                            {activeProfileTab === 'salary' && (() => {
                                                const periodCalc = calculateActiveSalaryPeriod(
                                                    viewEmployee,
                                                    salaryPeriodState.startDate,
                                                    salaryPeriodState.endDate
                                                );
                                                const totalPay = calculateTotalPayAmount(viewEmployee);
                                                const today = new Date();
                                                const currentMonthKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
                                                const currentMonthRecord = Array.isArray(viewEmployee.monthlyPayments)
                                                    ? viewEmployee.monthlyPayments.find(p => p.month === currentMonthKey)
                                                    : null;
                                                const currentStatus = currentMonthRecord ? currentMonthRecord.paymentStatus : (viewEmployee.paymentStatus || 'Pending');
                                                const currentMode = currentMonthRecord ? currentMonthRecord.paymentMode : (viewEmployee.paymentMode || 'Cash');

                                                // Net payable for current month taking deactive days into account:
                                                const currentUpad = Number(currentMonthRecord?.upad || 0);
                                                const currentIncentive = Number(currentMonthRecord?.incentive || 0);
                                                const currentNetPayable = Math.max(0, periodCalc.payableSalary - currentUpad + currentIncentive);

                                                const prevSal = Number(viewEmployee.previousSalary || 0);
                                                const curSal = Number(viewEmployee.salary || 0);
                                                const incrementDiff = curSal - prevSal;
                                                const incrementPercent = prevSal > 0 ? ((incrementDiff / prevSal) * 100).toFixed(1) : 0;

                                                return (
                                                    <VStack spacing={3.5} align="stretch">
                                                        {/* ── TOP METRIC CARDS: 2. Monthly Salary, 4. Total Pay Amount, 6. Current Payout Quick Status ── */}
                                                        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={3}>
                                                            {/* 2. Monthly Salary */}
                                                            <Box bg="white" p={3.5} borderRadius="lg" border="1px solid" borderColor="gray.200" shadow="xs">
                                                                <HStack justify="space-between" mb={1}>
                                                                    <HStack spacing={1.5}>
                                                                        <Icon as={FaMoneyBillWave} color="gray.500" fontSize="12px" />
                                                                        <Text fontSize="10px" color="gray.500" fontWeight="700">2. MONTHLY SALARY</Text>
                                                                    </HStack>
                                                                    <Badge colorScheme="blue" variant="subtle" fontSize="2xs">Active Base</Badge>
                                                                </HStack>
                                                                <Heading size="md" color="gray.800" fontWeight="800" mt={1}>
                                                                    ₹{curSal.toLocaleString()}
                                                                    <Text as="span" fontSize="xs" fontWeight="normal" color="gray.500"> / month</Text>
                                                                </Heading>
                                                                <HStack spacing={2} mt={2} fontSize="2xs" color="gray.600">
                                                                    <Text>Daily: <strong>₹{(curSal / 30).toFixed(0)}</strong></Text>
                                                                    <Text>•</Text>
                                                                    <Text>Hourly (8h): <strong>₹{(curSal / 240).toFixed(0)}</strong></Text>
                                                                    <Text>•</Text>
                                                                    <Badge colorScheme={viewEmployee.foodAllowance === 'Without Food' ? 'gray' : 'green'} fontSize="2xs">
                                                                        {viewEmployee.foodAllowance || 'Food'}
                                                                    </Badge>
                                                                </HStack>
                                                            </Box>

                                                            {/* 4. Total Pay Amount */}
                                                            <Box bg="white" p={3.5} borderRadius="lg" border="1px solid" borderColor="gray.200" shadow="xs">
                                                                <HStack justify="space-between" mb={1}>
                                                                    <HStack spacing={1.5}>
                                                                        <Icon as={FaMoneyCheckAlt} color="gray.500" fontSize="12px" />
                                                                        <Text fontSize="10px" color="gray.500" fontWeight="700">4. TOTAL PAY AMOUNT</Text>
                                                                    </HStack>
                                                                    <Badge colorScheme="green" variant="subtle" fontSize="2xs">{totalPay.paidMonthsCount} Cycles Paid</Badge>
                                                                </HStack>
                                                                <Heading size="md" color="green.700" fontWeight="800" mt={1}>
                                                                    ₹{totalPay.totalPaid.toLocaleString()}
                                                                </Heading>
                                                                <HStack spacing={2} mt={2} fontSize="2xs" color="gray.600">
                                                                    <Text>Cumulative disbursed total</Text>
                                                                    {totalPay.pendingAmount > 0 && (
                                                                        <>
                                                                            <Text>•</Text>
                                                                            <Text color="orange.600">Pending: <strong>₹{totalPay.pendingAmount.toLocaleString()}</strong></Text>
                                                                        </>
                                                                    )}
                                                                </HStack>
                                                            </Box>

                                                            {/* 6. Monthly Salary Payout Status Header Card */}
                                                            <Box bg="white" p={3.5} borderRadius="lg" border="1px solid" borderColor="gray.200" shadow="xs">
                                                                <HStack justify="space-between" mb={1}>
                                                                    <HStack spacing={1.5}>
                                                                        <Icon as={FaCalendarCheck} color="gray.500" fontSize="12px" />
                                                                        <Text fontSize="10px" color="gray.500" fontWeight="700">6. MONTHLY PAYOUT STATUS</Text>
                                                                    </HStack>
                                                                    <Badge colorScheme={currentStatus === 'Done' ? 'green' : 'orange'} fontSize="2xs" px={2} py={0.5} borderRadius="full">
                                                                        {currentStatus === 'Done' ? '✅ DONE (PAID)' : '⏳ PENDING'}
                                                                    </Badge>
                                                                </HStack>
                                                                <HStack justify="space-between" align="baseline" mt={1}>
                                                                    <Heading size="md" color="gray.800" fontWeight="800">
                                                                        ₹{currentNetPayable.toLocaleString()}
                                                                    </Heading>
                                                                    <Text fontSize="2xs" color="gray.500">{currentMonthKey}</Text>
                                                                </HStack>
                                                                <HStack spacing={2} mt={2} justify="space-between" align="center">
                                                                    <HStack spacing={1} fontSize="2xs" color="gray.600">
                                                                        <Text>Mode: <strong>{currentMode}</strong></Text>
                                                                        <Text>•</Text>
                                                                        <Text>Disburse: <strong>{viewEmployee.salaryDate || 'Not set'}</strong></Text>
                                                                    </HStack>
                                                                    <Button
                                                                        size="2xs"
                                                                        colorScheme={currentStatus === 'Done' ? 'orange' : 'green'}
                                                                        variant={currentStatus === 'Done' ? 'outline' : 'solid'}
                                                                        isLoading={isUpdatingCurrentPayout}
                                                                        onClick={() => handleToggleCurrentMonthPayout(currentStatus, currentMode)}
                                                                        h="22px"
                                                                        fontSize="10px"
                                                                        px={2}
                                                                    >
                                                                        {currentStatus === 'Done' ? 'Mark Pending' : 'Mark as Paid'}
                                                                    </Button>
                                                                </HStack>
                                                            </Box>
                                                        </SimpleGrid>

                                                        {/* ── 1. SALARY DATE (START TO END DATE & DEACTIVE DATE NOT CONSIDERED) ── */}
                                                        <Box bg="white" borderRadius="lg" border="1px solid" borderColor="gray.200" overflow="hidden" shadow="xs">
                                                            <Box px={3.5} py={2.5} bg="gray.50" borderBottom="1px solid" borderColor="gray.200">
                                                                <Flex justify="space-between" align="center" wrap="wrap" gap={2}>
                                                                    <HStack spacing={2}>
                                                                        <Icon as={FaCalendarAlt} color="blue.600" fontSize="13px" />
                                                                        <Text fontSize="11px" fontWeight="700" color="gray.800" textTransform="uppercase">
                                                                            1. Salary Date Period & Active Calculation (Deactive Dates Excluded)
                                                                        </Text>
                                                                    </HStack>
                                                                    <Badge colorScheme="blue" variant="subtle" fontSize="2xs">
                                                                        Exact Dates • Pro-Rata Active Service
                                                                    </Badge>
                                                                </Flex>
                                                            </Box>

                                                            <Box p={3.5}>
                                                                {/* Period Controls & Exact Date Pickers */}
                                                                <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing={3} mb={3}>
                                                                    <FormControl>
                                                                        <FormLabel fontSize="10px" fontWeight="700" color="gray.500" mb={1} textTransform="uppercase">
                                                                            Salary Period Start Date
                                                                        </FormLabel>
                                                                        <Input
                                                                            type="date"
                                                                            size="xs"
                                                                            h="30px"
                                                                            borderRadius="md"
                                                                            borderColor="gray.300"
                                                                            bg="white"
                                                                            fontWeight="600"
                                                                            value={salaryPeriodState.startDate}
                                                                            onChange={(e) => setSalaryPeriodState(prev => ({ ...prev, startDate: e.target.value }))}
                                                                        />
                                                                    </FormControl>

                                                                    <FormControl>
                                                                        <FormLabel fontSize="10px" fontWeight="700" color="gray.500" mb={1} textTransform="uppercase">
                                                                            Salary Period End Date
                                                                        </FormLabel>
                                                                        <Input
                                                                            type="date"
                                                                            size="xs"
                                                                            h="30px"
                                                                            borderRadius="md"
                                                                            borderColor="gray.300"
                                                                            bg="white"
                                                                            fontWeight="600"
                                                                            value={salaryPeriodState.endDate}
                                                                            onChange={(e) => setSalaryPeriodState(prev => ({ ...prev, endDate: e.target.value }))}
                                                                        />
                                                                    </FormControl>

                                                                    <FormControl>
                                                                        <FormLabel fontSize="10px" fontWeight="700" color="gray.500" mb={1} textTransform="uppercase">
                                                                            Salary Disbursement Date
                                                                        </FormLabel>
                                                                        <Input
                                                                            type="date"
                                                                            size="xs"
                                                                            h="30px"
                                                                            borderRadius="md"
                                                                            borderColor="gray.300"
                                                                            bg="white"
                                                                            fontWeight="600"
                                                                            value={salaryPeriodState.disbursementDate}
                                                                            onChange={(e) => setSalaryPeriodState(prev => ({ ...prev, disbursementDate: e.target.value }))}
                                                                        />
                                                                    </FormControl>

                                                                    <FormControl display="flex" flexDirection="column" justifyContent="flex-end">
                                                                        <Button
                                                                            size="xs"
                                                                            h="30px"
                                                                            colorScheme="blue"
                                                                            isLoading={isSavingSalaryPeriod}
                                                                            leftIcon={<Icon as={FaCalendarCheck} />}
                                                                            onClick={handleSaveSalaryPeriod}
                                                                        >
                                                                            Save Period & Date
                                                                        </Button>
                                                                    </FormControl>
                                                                </SimpleGrid>

                                                                {/* Breakdown Summary Grid */}
                                                                <SimpleGrid columns={{ base: 2, md: 4 }} spacing={3} p={3} bg="gray.50" borderRadius="md" border="1px solid" borderColor="gray.200">
                                                                    <Box>
                                                                        <Text fontSize="10px" color="gray.500" fontWeight="700">TOTAL CYCLE DAYS</Text>
                                                                        <Text fontSize="md" fontWeight="800" color="gray.800" mt={0.5}>
                                                                            {periodCalc.totalDays} Days
                                                                        </Text>
                                                                        <Text fontSize="2xs" color="gray.500">{periodCalc.startDate} to {periodCalc.endDate}</Text>
                                                                    </Box>

                                                                    <Box>
                                                                        <Text fontSize="10px" color="gray.500" fontWeight="700">DEACTIVE DAYS EXCLUDED</Text>
                                                                        <HStack spacing={1.5} mt={0.5}>
                                                                            <Text fontSize="md" fontWeight="800" color={periodCalc.deactiveDays > 0 ? "red.600" : "green.600"}>
                                                                                {periodCalc.deactiveDays} Days
                                                                            </Text>
                                                                            {periodCalc.deactiveDays > 0 && (
                                                                                <Badge colorScheme="red" fontSize="2xs">Excluded</Badge>
                                                                            )}
                                                                        </HStack>
                                                                        <Text fontSize="2xs" color={periodCalc.deactiveDays > 0 ? "red.500" : "gray.500"}>
                                                                            {periodCalc.deactiveDays > 0 ? "Not considered in payable salary" : "0 deactive days during period"}
                                                                        </Text>
                                                                    </Box>

                                                                    <Box>
                                                                        <Text fontSize="10px" color="gray.500" fontWeight="700">NET ACTIVE SERVICE DAYS</Text>
                                                                        <Text fontSize="md" fontWeight="800" color="blue.700" mt={0.5}>
                                                                            {periodCalc.activeDays} Days
                                                                        </Text>
                                                                        <Text fontSize="2xs" color="gray.500">
                                                                            {periodCalc.totalDays > 0 ? `${((periodCalc.activeDays / periodCalc.totalDays) * 100).toFixed(0)}% active service ratio` : ''}
                                                                        </Text>
                                                                    </Box>

                                                                    <Box>
                                                                        <Text fontSize="10px" color="gray.500" fontWeight="700">CALCULATED PAYABLE BASE</Text>
                                                                        <Text fontSize="md" fontWeight="800" color="green.700" mt={0.5}>
                                                                            ₹{periodCalc.payableSalary.toLocaleString()}
                                                                        </Text>
                                                                        <Text fontSize="2xs" color="gray.500">
                                                                            {periodCalc.deactiveDays > 0 ? `(₹${curSal}/mo / ${periodCalc.totalDays}d) × ${periodCalc.activeDays}d` : `Full base salary`}
                                                                        </Text>
                                                                    </Box>
                                                                </SimpleGrid>

                                                                {periodCalc.deactiveDays > 0 && (
                                                                    <Box mt={2.5} p={2} bg="orange.50" borderRadius="md" border="1px dashed" borderColor="orange.300">
                                                                        <Text fontSize="2xs" color="orange.800">
                                                                            <strong>⚠️ Deactivation Notice:</strong> Employee has {periodCalc.deactiveDays} deactive day(s) inside this evaluation cycle. All deactive dates are excluded from the payable calculation.
                                                                        </Text>
                                                                    </Box>
                                                                )}
                                                            </Box>
                                                        </Box>

                                                        {/* ── 3. SALARY LIST (ITEMIZED DISBURSEMENT BREAKDOWN & LEDGER) ── */}
                                                        <Box bg="white" borderRadius="lg" border="1px solid" borderColor="gray.200" overflow="hidden" shadow="xs">
                                                            <Box px={3.5} py={2.5} bg="gray.50" borderBottom="1px solid" borderColor="gray.200">
                                                                <Flex justify="space-between" align="center" wrap="wrap" gap={2}>
                                                                    <HStack spacing={2}>
                                                                        <Icon as={FaList} color="gray.600" fontSize="13px" />
                                                                        <Text fontSize="11px" fontWeight="700" color="gray.800" textTransform="uppercase">
                                                                            3. Salary List & Disbursement Ledger ({Array.isArray(viewEmployee.monthlyPayments) ? viewEmployee.monthlyPayments.length : 0} Records)
                                                                        </Text>
                                                                    </HStack>
                                                                    <Text fontSize="2xs" color="gray.500">Month-by-month payout breakdown</Text>
                                                                </Flex>
                                                            </Box>

                                                            <TableContainer maxH="240px" overflowY="auto">
                                                                <Table size="xs" variant="simple">
                                                                    <Thead bg="gray.50" position="sticky" top={0} zIndex={1}>
                                                                        <Tr>
                                                                            <Th fontSize="9px" color="gray.500">MONTH / CYCLE</Th>
                                                                            <Th fontSize="9px" color="gray.500">BASE SALARY</Th>
                                                                            <Th fontSize="9px" color="gray.500">DAYS (P / A)</Th>
                                                                            <Th fontSize="9px" color="gray.500">UPAD (ADVANCE)</Th>
                                                                            <Th fontSize="9px" color="gray.500">INCENTIVE</Th>
                                                                            <Th fontSize="9px" color="gray.500">NET PAYABLE</Th>
                                                                            <Th fontSize="9px" color="gray.500">MODE</Th>
                                                                            <Th fontSize="9px" color="gray.500">PAYOUT STATUS</Th>
                                                                            <Th fontSize="9px" color="gray.500" textAlign="center">ACTION</Th>
                                                                        </Tr>
                                                                    </Thead>
                                                                    <Tbody>
                                                                        {/* Current Active Cycle Preview Row if not already saved in monthlyPayments */}
                                                                        {!Array.isArray(viewEmployee.monthlyPayments) || !viewEmployee.monthlyPayments.some(p => p.month === currentMonthKey) ? (
                                                                            <Tr bg="blue.50">
                                                                                <Td fontSize="xs" fontWeight="700" color="blue.800">
                                                                                    <HStack spacing={1}>
                                                                                        <Badge colorScheme="blue" fontSize="2xs">Active</Badge>
                                                                                        <Text>{currentMonthKey}</Text>
                                                                                    </HStack>
                                                                                </Td>
                                                                                <Td fontSize="xs" fontWeight="600">₹{curSal.toLocaleString()}</Td>
                                                                                <Td fontSize="xs">
                                                                                    <Text fontSize="2xs" color="gray.600">
                                                                                        {periodCalc.activeDays}d active {periodCalc.deactiveDays > 0 ? `(${periodCalc.deactiveDays}d deactive excl.)` : ''}
                                                                                    </Text>
                                                                                </Td>
                                                                                <Td fontSize="xs" color="red.600">₹0</Td>
                                                                                <Td fontSize="xs" color="green.600">₹0</Td>
                                                                                <Td fontSize="xs" fontWeight="700" color="blue.900">
                                                                                    ₹{periodCalc.payableSalary.toLocaleString()}
                                                                                </Td>
                                                                                <Td fontSize="xs">
                                                                                    <Badge colorScheme="gray" variant="subtle" fontSize="2xs">
                                                                                        {viewEmployee.paymentMode || 'Cash'}
                                                                                    </Badge>
                                                                                </Td>
                                                                                <Td fontSize="xs">
                                                                                    <Badge colorScheme={currentStatus === 'Done' ? 'green' : 'orange'} fontSize="2xs">
                                                                                        {currentStatus === 'Done' ? '✅ Paid' : '⏳ Pending'}
                                                                                    </Badge>
                                                                                </Td>
                                                                                <Td textAlign="center">
                                                                                    <Button
                                                                                        size="2xs"
                                                                                        colorScheme={currentStatus === 'Done' ? 'orange' : 'green'}
                                                                                        variant="solid"
                                                                                        h="20px"
                                                                                        fontSize="9px"
                                                                                        px={2}
                                                                                        isLoading={isUpdatingCurrentPayout}
                                                                                        onClick={() => handleToggleCurrentMonthPayout(currentStatus, currentMode)}
                                                                                    >
                                                                                        {currentStatus === 'Done' ? 'Set Pending' : 'Mark Paid'}
                                                                                    </Button>
                                                                                </Td>
                                                                            </Tr>
                                                                        ) : null}

                                                                        {/* Existing Historical Rows */}
                                                                        {Array.isArray(viewEmployee.monthlyPayments) && viewEmployee.monthlyPayments.length > 0 ? (
                                                                            viewEmployee.monthlyPayments.map((p, pIdx) => {
                                                                                const base = Number(viewEmployee.salary || 0);
                                                                                const present = p.presentDays !== null && p.presentDays !== undefined ? Number(p.presentDays) : null;
                                                                                const upad = Number(p.upad || 0);
                                                                                const incentive = Number(p.incentive || 0);
                                                                                let calcNet = 0;
                                                                                if (p.payableAmount !== undefined && p.payableAmount !== null) {
                                                                                    calcNet = Number(p.payableAmount);
                                                                                } else if (present !== null) {
                                                                                    calcNet = Math.round((base / 30) * present) - upad + incentive;
                                                                                } else {
                                                                                    calcNet = base - upad + incentive;
                                                                                }
                                                                                const isPaid = p.paymentStatus === 'Done';

                                                                                return (
                                                                                    <Tr key={pIdx} _hover={{ bg: "gray.50" }}>
                                                                                        <Td fontSize="xs" fontWeight="700" color="gray.800">
                                                                                            {p.month}
                                                                                        </Td>
                                                                                        <Td fontSize="xs" fontWeight="600">₹{base.toLocaleString()}</Td>
                                                                                        <Td fontSize="xs">
                                                                                            {present !== null ? (
                                                                                                <HStack spacing={1} fontSize="2xs">
                                                                                                    <Text color="green.700" fontWeight="600">{present} P</Text>
                                                                                                    <Text color="gray.400">/</Text>
                                                                                                    <Text color="red.600" fontWeight="600">{p.absentDays || 0} A</Text>
                                                                                                </HStack>
                                                                                            ) : (
                                                                                                <Text fontSize="2xs" color="gray.500">Standard (30d)</Text>
                                                                                            )}
                                                                                        </Td>
                                                                                        <Td fontSize="xs" color="red.600">
                                                                                            {upad > 0 ? `-₹${upad.toLocaleString()}` : '₹0'}
                                                                                        </Td>
                                                                                        <Td fontSize="xs" color="green.600">
                                                                                            {incentive > 0 ? `+₹${incentive.toLocaleString()}` : '₹0'}
                                                                                        </Td>
                                                                                        <Td fontSize="xs" fontWeight="700" color="gray.900">
                                                                                            ₹{Math.max(0, calcNet).toLocaleString()}
                                                                                        </Td>
                                                                                        <Td fontSize="xs">
                                                                                            <Badge colorScheme="gray" variant="subtle" fontSize="2xs">
                                                                                                {p.paymentMode || 'Cash'}
                                                                                            </Badge>
                                                                                        </Td>
                                                                                        <Td fontSize="xs">
                                                                                            <Badge colorScheme={isPaid ? 'green' : 'orange'} fontSize="2xs">
                                                                                                {isPaid ? '✅ Paid' : '⏳ Pending'}
                                                                                            </Badge>
                                                                                        </Td>
                                                                                        <Td textAlign="center">
                                                                                            <Button
                                                                                                size="2xs"
                                                                                                colorScheme={isPaid ? 'orange' : 'green'}
                                                                                                variant="ghost"
                                                                                                h="20px"
                                                                                                fontSize="9px"
                                                                                                px={1.5}
                                                                                                onClick={async () => {
                                                                                                    const nextStat = isPaid ? 'Pending' : 'Done';
                                                                                                    try {
                                                                                                        const res = await api.put(`/employee-master/${viewEmployee._id}/monthly-payment`, {
                                                                                                            month: p.month,
                                                                                                            paymentStatus: nextStat
                                                                                                        });
                                                                                                        if (res.data.success) {
                                                                                                            setViewEmployee(prev => {
                                                                                                                const updated = prev.monthlyPayments.map((item, idx) => idx === pIdx ? { ...item, paymentStatus: nextStat } : item);
                                                                                                                return { ...prev, monthlyPayments: updated };
                                                                                                            });
                                                                                                            fetchEmployees();
                                                                                                        }
                                                                                                    } catch (err) {}
                                                                                                }}
                                                                                            >
                                                                                                {isPaid ? 'Set Pending' : 'Set Paid'}
                                                                                            </Button>
                                                                                        </Td>
                                                                                    </Tr>
                                                                                );
                                                                            })
                                                                        ) : null}
                                                                    </Tbody>
                                                                </Table>
                                                            </TableContainer>
                                                        </Box>

                                                        {/* ── 5. INCREMENT (SALARY INCREMENT DATE, REVISION & ADDED TO PREVIOUS) ── */}
                                                        <Box bg="white" borderRadius="lg" border="1px solid" borderColor="gray.200" overflow="hidden" shadow="xs">
                                                            <Box px={3.5} py={2.5} bg="gray.50" borderBottom="1px solid" borderColor="gray.200">
                                                                <Flex justify="space-between" align="center" wrap="wrap" gap={2}>
                                                                    <HStack spacing={2}>
                                                                        <Icon as={FaChartLine} color="purple.600" fontSize="13px" />
                                                                        <Text fontSize="11px" fontWeight="700" color="gray.800" textTransform="uppercase">
                                                                            5. Salary Increment & Revision Breakdown
                                                                        </Text>
                                                                    </HStack>
                                                                    <Button
                                                                        size="2xs"
                                                                        colorScheme="purple"
                                                                        leftIcon={<Icon as={FaPlus} />}
                                                                        h="22px"
                                                                        fontSize="10px"
                                                                        px={2.5}
                                                                        onClick={() => {
                                                                            setIncrementForm({
                                                                                newSalary: '',
                                                                                incrementAmount: '',
                                                                                incrementDate: new Date().toISOString().split('T')[0],
                                                                                remarks: ''
                                                                            });
                                                                            setIsIncrementModalOpen(true);
                                                                        }}
                                                                    >
                                                                        Log Increment
                                                                    </Button>
                                                                </Flex>
                                                            </Box>

                                                            <Box p={3.5}>
                                                                <SimpleGrid columns={{ base: 2, md: 4 }} spacing={3} mb={3}>
                                                                    <Box p={2.5} bg="gray.50" borderRadius="md" border="1px solid" borderColor="gray.200">
                                                                        <Text fontSize="10px" color="gray.500" fontWeight="700">PREVIOUS SALARY</Text>
                                                                        <Text fontSize="sm" fontWeight="700" color="gray.700" mt={0.5}>
                                                                            ₹{prevSal > 0 ? prevSal.toLocaleString() : '0'}
                                                                        </Text>
                                                                        <Text fontSize="2xs" color="gray.400">Before last revision</Text>
                                                                    </Box>

                                                                    <Box p={2.5} bg="gray.50" borderRadius="md" border="1px solid" borderColor="gray.200">
                                                                        <Text fontSize="10px" color="gray.500" fontWeight="700">CURRENT REVISED SALARY</Text>
                                                                        <Text fontSize="sm" fontWeight="800" color="gray.900" mt={0.5}>
                                                                            ₹{curSal.toLocaleString()}
                                                                        </Text>
                                                                        <Text fontSize="2xs" color="gray.400">Active package</Text>
                                                                    </Box>

                                                                    <Box p={2.5} bg="gray.50" borderRadius="md" border="1px solid" borderColor="gray.200">
                                                                        <Text fontSize="10px" color="gray.500" fontWeight="700">SALARY ADDED</Text>
                                                                        <Text fontSize="sm" fontWeight="800" color={incrementDiff > 0 ? "green.600" : "gray.600"} mt={0.5}>
                                                                            {incrementDiff > 0 ? `+₹${incrementDiff.toLocaleString()}` : '₹0'}
                                                                        </Text>
                                                                        <Text fontSize="2xs" color="gray.500">
                                                                            {incrementDiff > 0 ? `+${incrementPercent}% increase` : 'No increase logged yet'}
                                                                        </Text>
                                                                    </Box>

                                                                    <Box p={2.5} bg="gray.50" borderRadius="md" border="1px solid" borderColor="gray.200">
                                                                        <Text fontSize="10px" color="gray.500" fontWeight="700">INCREMENT DATE</Text>
                                                                        <Text fontSize="sm" fontWeight="700" color="purple.700" mt={0.5}>
                                                                            {viewEmployee.salaryIncrementDate || 'Not recorded'}
                                                                        </Text>
                                                                        <Text fontSize="2xs" color="gray.400">Exact revision date</Text>
                                                                    </Box>
                                                                </SimpleGrid>

                                                                {/* Salary Revision History Table */}
                                                                {Array.isArray(viewEmployee.salaryHistory) && viewEmployee.salaryHistory.length > 0 ? (
                                                                    <Box border="1px solid" borderColor="gray.200" borderRadius="md" overflow="hidden">
                                                                        <TableContainer maxH="160px" overflowY="auto">
                                                                            <Table size="xs" variant="simple">
                                                                                <Thead bg="gray.50">
                                                                                    <Tr>
                                                                                        <Th fontSize="9px">REVISION DATE</Th>
                                                                                        <Th fontSize="9px">PREVIOUS</Th>
                                                                                        <Th fontSize="9px">REVISED NEW</Th>
                                                                                        <Th fontSize="9px">ADDED SALARY</Th>
                                                                                        <Th fontSize="9px">GROWTH %</Th>
                                                                                        <Th fontSize="9px">REMARKS</Th>
                                                                                    </Tr>
                                                                                </Thead>
                                                                                <Tbody>
                                                                                    {viewEmployee.salaryHistory.map((h, hIdx) => (
                                                                                        <Tr key={hIdx}>
                                                                                            <Td fontSize="xs" fontWeight="700">{h.date}</Td>
                                                                                            <Td fontSize="xs">₹{Number(h.previousSalary || 0).toLocaleString()}</Td>
                                                                                            <Td fontSize="xs" fontWeight="700" color="purple.800">₹{Number(h.newSalary || 0).toLocaleString()}</Td>
                                                                                            <Td fontSize="xs" fontWeight="700" color="green.700">+₹{Number(h.incrementAmount || 0).toLocaleString()}</Td>
                                                                                            <Td fontSize="xs">
                                                                                                <Badge colorScheme="green" fontSize="2xs">+{h.percentage}%</Badge>
                                                                                            </Td>
                                                                                            <Td fontSize="2xs" color="gray.600">{h.remarks || '-'}</Td>
                                                                                        </Tr>
                                                                                    ))}
                                                                                </Tbody>
                                                                            </Table>
                                                                        </TableContainer>
                                                                    </Box>
                                                                ) : (
                                                                    <Text fontSize="2xs" color="gray.500">No previous salary increment revisions recorded. Use "Log Increment" to record revisions.</Text>
                                                                )}
                                                            </Box>
                                                        </Box>

                                                        {/* ── 6. MONTHLY SALARY PAYOUT STATUS & DETAILS ── */}
                                                        <Box bg="white" borderRadius="lg" border="1px solid" borderColor="gray.200" overflow="hidden" shadow="xs">
                                                            <Box px={3.5} py={2.5} bg="gray.50" borderBottom="1px solid" borderColor="gray.200">
                                                                <Flex justify="space-between" align="center" wrap="wrap" gap={2}>
                                                                    <HStack spacing={2}>
                                                                        <Icon as={FaCalendarCheck} color="green.600" fontSize="13px" />
                                                                        <Text fontSize="11px" fontWeight="700" color="gray.800" textTransform="uppercase">
                                                                            6. Current Month Payout Status & Disbursal Controls ({currentMonthKey})
                                                                        </Text>
                                                                    </HStack>
                                                                    <Badge colorScheme={currentStatus === 'Done' ? 'green' : 'orange'} fontSize="2xs" px={2.5} py={0.5} borderRadius="full">
                                                                        {currentStatus === 'Done' ? '✅ Status: Paid (Done)' : '⏳ Status: Pending'}
                                                                    </Badge>
                                                                </Flex>
                                                            </Box>

                                                            <Box p={3.5}>
                                                                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={3} mb={3}>
                                                                    <Box p={2.5} bg="gray.50" borderRadius="md" border="1px solid" borderColor="gray.200">
                                                                        <Text fontSize="10px" color="gray.500" fontWeight="700">NET CURRENT PAYABLE</Text>
                                                                        <Heading size="md" color="gray.900" mt={1}>
                                                                            ₹{currentNetPayable.toLocaleString()}
                                                                        </Heading>
                                                                        <Text fontSize="2xs" color="gray.500" mt={0.5}>
                                                                            Base (deactive excluded) {currentUpad > 0 ? `- ₹${currentUpad} upad` : ''} {currentIncentive > 0 ? `+ ₹${currentIncentive} bonus` : ''}
                                                                        </Text>
                                                                    </Box>

                                                                    <Box p={2.5} bg="gray.50" borderRadius="md" border="1px solid" borderColor="gray.200">
                                                                        <Text fontSize="10px" color="gray.500" fontWeight="700">PAYMENT DISBURSEMENT MODE</Text>
                                                                        <Select
                                                                            size="xs"
                                                                            h="28px"
                                                                            mt={1}
                                                                            fontWeight="700"
                                                                            borderRadius="md"
                                                                            borderColor="gray.300"
                                                                            bg="white"
                                                                            value={currentMode}
                                                                            onChange={async (e) => {
                                                                                const newMode = e.target.value;
                                                                                try {
                                                                                    const res = await api.put(`/employee-master/${viewEmployee._id}/monthly-payment`, {
                                                                                        month: currentMonthKey,
                                                                                        paymentMode: newMode
                                                                                    });
                                                                                    if (res.data.success) {
                                                                                        setViewEmployee(prev => {
                                                                                            const payments = Array.isArray(prev.monthlyPayments) ? [...prev.monthlyPayments] : [];
                                                                                            const idx = payments.findIndex(p => p.month === currentMonthKey);
                                                                                            if (idx > -1) payments[idx] = { ...payments[idx], paymentMode: newMode };
                                                                                            else payments.push({ month: currentMonthKey, paymentMode: newMode, paymentStatus: currentStatus });
                                                                                            return { ...prev, monthlyPayments: payments, paymentMode: newMode };
                                                                                        });
                                                                                        fetchEmployees();
                                                                                    }
                                                                                } catch (err) {}
                                                                            }}
                                                                        >
                                                                            <option value="Bank">Bank Transfer (NEFT/IMPS)</option>
                                                                            <option value="Cash">Cash Handover</option>
                                                                            <option value="UPI">UPI / GPay / PhonePe</option>
                                                                            <option value="Cheque">Bank Cheque</option>
                                                                        </Select>
                                                                        <Text fontSize="2xs" color="gray.400" mt={0.5}>Change mode instantly</Text>
                                                                    </Box>

                                                                    <Box p={2.5} bg="gray.50" borderRadius="md" border="1px solid" borderColor="gray.200">
                                                                        <Text fontSize="10px" color="gray.500" fontWeight="700">1-CLICK STATUS ACTION</Text>
                                                                        <Button
                                                                            size="xs"
                                                                            h="28px"
                                                                            mt={1}
                                                                            w="100%"
                                                                            colorScheme={currentStatus === 'Done' ? 'orange' : 'green'}
                                                                            variant={currentStatus === 'Done' ? 'outline' : 'solid'}
                                                                            isLoading={isUpdatingCurrentPayout}
                                                                            leftIcon={<Icon as={currentStatus === 'Done' ? FaTimes : FaCheckCircle} />}
                                                                            onClick={() => handleToggleCurrentMonthPayout(currentStatus, currentMode)}
                                                                        >
                                                                            {currentStatus === 'Done' ? 'Change to Pending' : 'Mark Month as Paid'}
                                                                        </Button>
                                                                        <Text fontSize="2xs" color="gray.400" mt={0.5}>
                                                                            {currentStatus === 'Done' ? 'Marked complete for this cycle' : 'Click when salary is disbursed'}
                                                                        </Text>
                                                                    </Box>
                                                                </SimpleGrid>

                                                                {/* Bank Reference Bar */}
                                                                <Flex p={2.5} bg="gray.50" borderRadius="md" border="1px solid" borderColor="gray.200" justify="space-between" align="center" wrap="wrap" gap={2}>
                                                                    <HStack spacing={3} fontSize="xs">
                                                                        <HStack spacing={1}>
                                                                            <Text fontSize="10px" color="gray.500" fontWeight="700">BANK:</Text>
                                                                            <Text fontWeight="700" color="gray.800">{viewEmployee.bankDetails?.bankName || 'Not Set'}</Text>
                                                                        </HStack>
                                                                        <Text color="gray.300">•</Text>
                                                                        <HStack spacing={1}>
                                                                            <Text fontSize="10px" color="gray.500" fontWeight="700">A/C NO:</Text>
                                                                            <Text fontWeight="700" color="gray.800">{viewEmployee.bankDetails?.accountNumber || 'Not Set'}</Text>
                                                                        </HStack>
                                                                        <Text color="gray.300">•</Text>
                                                                        <HStack spacing={1}>
                                                                            <Text fontSize="10px" color="gray.500" fontWeight="700">IFSC:</Text>
                                                                            <Text fontWeight="700" color="blue.700">{viewEmployee.bankDetails?.ifscCode || 'Not Set'}</Text>
                                                                        </HStack>
                                                                    </HStack>
                                                                    <Button
                                                                        size="2xs"
                                                                        variant="link"
                                                                        colorScheme="blue"
                                                                        onClick={() => setActiveProfileTab('bank')}
                                                                    >
                                                                        Open Bank Tab →
                                                                    </Button>
                                                                </Flex>
                                                            </Box>
                                                        </Box>
                                                    </VStack>
                                                );
                                            })()}
                                        </Box>
                                    )}
                                </ModalBody>
                                <ModalFooter bg="gray.50" borderTop="1px solid" borderColor="gray.200">
                                    <HStack spacing={3}>
                                        <Button
                                            size="sm"
                                            colorScheme="blue"
                                            variant="outline"
                                            leftIcon={<Icon as={FaEdit} />}
                                            borderRadius="xl"
                                            onClick={() => {
                                                const idToEdit = viewEmployee?._id;
                                                setViewEmployee(null);
                                                if (idToEdit) handleSelectEmployee({ target: { value: idToEdit } });
                                            }}
                                        >
                                            Edit Employee
                                        </Button>
                                        <Button colorScheme="blue" size="sm" px={6} borderRadius="xl" shadow="md" onClick={() => setViewEmployee(null)}>
                                            Close
                                        </Button>
                                    </HStack>
                                </ModalFooter>
                            </ModalContent>
                        </Modal>

                        {/* Quick Add Company Modal */}
                        <Modal isOpen={isAddCompanyOpen} onClose={() => setIsAddCompanyOpen(false)} isCentered size="md">
                            <ModalOverlay backdropFilter="blur(4px)" />
                            <ModalContent borderRadius="2xl">
                                <ModalHeader borderBottom="1px solid" borderColor="gray.100" py={3}>
                                    <HStack spacing={2}>
                                        <Icon as={FaBuilding} color="blue.600" />
                                        <Text fontSize="md" fontWeight="bold">Add New Company / Entity</Text>
                                    </HStack>
                                </ModalHeader>
                                <ModalCloseButton />
                                <ModalBody py={4}>
                                    <FormControl isRequired>
                                        <FormLabel fontSize="xs" fontWeight="bold">Company Name</FormLabel>
                                        <Input
                                            placeholder="e.g. Unique Precision Instruments Pvt Ltd"
                                            value={newCompanyName}
                                            onChange={(e) => setNewCompanyName(e.target.value)}
                                            autoFocus
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    handleAddCompany();
                                                }
                                            }}
                                        />
                                    </FormControl>
                                </ModalBody>
                                <ModalFooter borderTop="1px solid" borderColor="gray.100" py={3}>
                                    <Button variant="ghost" size="sm" mr={2} onClick={() => setIsAddCompanyOpen(false)}>Cancel</Button>
                                    <Button colorScheme="blue" size="sm" onClick={handleAddCompany}>Add &amp; Select Company</Button>
                                </ModalFooter>
                            </ModalContent>
                        </Modal>

                        {/* Quick Add Branch Modal */}
                        <Modal isOpen={isAddBranchOpen} onClose={() => setIsAddBranchOpen(false)} isCentered size="md">
                            <ModalOverlay backdropFilter="blur(4px)" />
                            <ModalContent borderRadius="2xl">
                                <ModalHeader borderBottom="1px solid" borderColor="gray.100" py={3}>
                                    <HStack spacing={2}>
                                        <Icon as={FaCodeBranch} color="purple.600" />
                                        <Text fontSize="md" fontWeight="bold">Add New Branch / Location</Text>
                                    </HStack>
                                </ModalHeader>
                                <ModalCloseButton />
                                <ModalBody py={4}>
                                    <FormControl isRequired>
                                        <FormLabel fontSize="xs" fontWeight="bold">Branch Name</FormLabel>
                                        <Input
                                            placeholder="e.g. Surat Branch / Site Office"
                                            value={newBranchName}
                                            onChange={(e) => setNewBranchName(e.target.value)}
                                            autoFocus
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    handleAddBranch();
                                                }
                                            }}
                                        />
                                    </FormControl>
                                </ModalBody>
                                <ModalFooter borderTop="1px solid" borderColor="gray.100" py={3}>
                                    <Button variant="ghost" size="sm" mr={2} onClick={() => setIsAddBranchOpen(false)}>Cancel</Button>
                                    <Button colorScheme="purple" size="sm" onClick={handleAddBranch}>Add &amp; Select Branch</Button>
                                </ModalFooter>
                            </ModalContent>
                        </Modal>

                        {/* Date-Wise Attendance Detail Modal */}
                        <Modal isOpen={!!selectedReportEmployee} onClose={() => setSelectedReportEmployee(null)} size="3xl" isCentered motionPreset="slideInBottom">
                            <ModalOverlay backdropFilter="blur(8px) grayscale(40%)" bg="blackAlpha.600" />
                            <ModalContent borderRadius="3xl" overflow="hidden" boxShadow="2xl" border="1px solid" borderColor="whiteAlpha.300">
                                <ModalHeader p={0}>
                                    <Box bgGradient="linear(to-r, purple.800, purple.600)" p={6} color="white">
                                        <HStack justify="space-between" spacing={4}>
                                            <HStack spacing={4}>
                                                <Avatar
                                                    size="md"
                                                    src={selectedReportEmployee?.photo?.url ? `${API_BASE_URL}${selectedReportEmployee.photo.url}` : undefined}
                                                    name={selectedReportEmployee?.name}
                                                    borderRadius="xl"
                                                    border="2px solid white"
                                                />
                                                <VStack align="start" spacing={0}>
                                                    <Heading size="sm">Attendance Detail: {selectedReportEmployee?.name}</Heading>
                                                    <Text fontSize="xs" opacity={0.8}>{selectedReportEmployee?.empId} • {reportMonthFilter}</Text>
                                                </VStack>
                                            </HStack>
                                            <ModalCloseButton position="static" borderRadius="full" />
                                        </HStack>
                                    </Box>
                                </ModalHeader>

                                <ModalBody p={6} maxH="60vh" overflowY="auto">
                                    {attendanceDetailLoading ? (
                                        <Center py={10}>
                                            <VStack spacing={3}>
                                                <Spinner size="xl" color="purple.500" thickness="4px" />
                                                <Text color="gray.500" fontSize="sm" fontWeight="bold">Fetching attendance records...</Text>
                                            </VStack>
                                        </Center>
                                    ) : (
                                        <Table variant="simple" size="sm">
                                            <Thead>
                                                <Tr bg="gray.100">
                                                    <Th fontSize="10px">DATE</Th>
                                                    <Th fontSize="10px">DAY</Th>
                                                    <Th fontSize="10px">ATTENDANCE</Th>
                                                    <Th fontSize="10px">SITES WORKED</Th>
                                                    <Th fontSize="10px">REMARK / NOTES</Th>
                                                </Tr>
                                            </Thead>
                                            <Tbody>
                                                {attendanceDetailList.length === 0 ? (
                                                    <Tr>
                                                        <Td colSpan={5} textAlign="center" py={6} color="gray.400">
                                                            No logs found for this month.
                                                        </Td>
                                                    </Tr>
                                                ) : (
                                                    attendanceDetailList.map((row) => {
                                                        const att = row.attendance;
                                                        const scheme = att === 'Present' ? 'green' : 
                                                                       att === 'Absent' ? 'red' : 
                                                                       att === 'Half Day' ? 'orange' : 
                                                                       att === 'Scheduled' ? 'blue' : 'gray';
                                                        return (
                                                            <Tr key={row.date} _hover={{ bg: "gray.50" }} transition="background 0.1s">
                                                                <Td fontSize="xs" fontWeight="semibold">{row.date.split('-')[2]}-{row.date.split('-')[1]}-{row.date.split('-')[0]}</Td>
                                                                <Td fontSize="xs" fontWeight="semibold" color="gray.600">{row.dayName}</Td>
                                                                <Td>
                                                                    <Badge colorScheme={scheme} variant="solid" fontSize="10px" px={2} py={0.5} borderRadius="md">
                                                                        {att}
                                                                    </Badge>
                                                                </Td>
                                                                <Td fontSize="xs" maxW="200px" isTruncated title={row.sites}>{row.sites || '—'}</Td>
                                                                <Td fontSize="xs" color="gray.600" maxW="250px" isTruncated title={row.remark}>{row.remark}</Td>
                                                            </Tr>
                                                        );
                                                    })
                                                )}
                                            </Tbody>
                                        </Table>
                                    )}
                                </ModalBody>
                                <ModalFooter bg="gray.50" justify="flex-end">
                                    <Button colorScheme="purple" px={10} borderRadius="full" shadow="lg" onClick={() => setSelectedReportEmployee(null)}>Close</Button>
                                </ModalFooter>
                            </ModalContent>
                        </Modal>

                        {/* Salary Revision / Increment Modal */}
                        <Modal isOpen={isIncrementModalOpen} onClose={() => setIsIncrementModalOpen(false)} isCentered size="md">
                            <ModalOverlay backdropFilter="blur(4px)" />
                            <ModalContent borderRadius="xl">
                                <ModalHeader borderBottom="1px solid" borderColor="gray.100" py={3}>
                                    <HStack spacing={2}>
                                        <Icon as={FaChartLine} color="blue.600" />
                                        <Text fontSize="md" fontWeight="bold">Revise Salary / Add Increment</Text>
                                    </HStack>
                                </ModalHeader>
                                <ModalCloseButton />
                                <ModalBody py={4}>
                                    {viewEmployee && (
                                        <VStack spacing={3.5} align="stretch">
                                            <Box p={3} bg="gray.50" borderRadius="md" border="1px solid" borderColor="gray.200">
                                                <HStack justify="space-between">
                                                    <Text fontSize="xs" color="gray.600">Current Monthly Salary:</Text>
                                                    <Text fontSize="sm" fontWeight="800" color="gray.800">
                                                        ₹{parseFloat(viewEmployee.salary || 0).toLocaleString()}
                                                    </Text>
                                                </HStack>
                                            </Box>

                                            <FormControl isRequired>
                                                <FormLabel fontSize="xs" fontWeight="bold">New Monthly Salary (₹)</FormLabel>
                                                <Input
                                                    type="number"
                                                    size="sm"
                                                    borderRadius="md"
                                                    placeholder="e.g. 25000"
                                                    value={incrementForm.newSalary}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        const currSal = parseFloat(viewEmployee.salary || 0);
                                                        const newSal = parseFloat(val);
                                                        const diff = !isNaN(newSal) ? newSal - currSal : '';
                                                        setIncrementForm(prev => ({
                                                            ...prev,
                                                            newSalary: val,
                                                            incrementAmount: diff > 0 ? diff : ''
                                                        }));
                                                    }}
                                                />
                                            </FormControl>

                                            <FormControl>
                                                <FormLabel fontSize="xs" fontWeight="bold">Or Salary Added to Previous (+₹)</FormLabel>
                                                <Input
                                                    type="number"
                                                    size="sm"
                                                    borderRadius="md"
                                                    placeholder="e.g. 5000"
                                                    value={incrementForm.incrementAmount}
                                                    onChange={(e) => {
                                                        const diff = e.target.value;
                                                        const currSal = parseFloat(viewEmployee.salary || 0);
                                                        const addAmount = parseFloat(diff);
                                                        const newSal = !isNaN(addAmount) ? currSal + addAmount : '';
                                                        setIncrementForm(prev => ({
                                                            ...prev,
                                                            incrementAmount: diff,
                                                            newSalary: newSal !== '' ? newSal : ''
                                                        }));
                                                    }}
                                                />
                                            </FormControl>

                                            {/* Live Preview Banner */}
                                            {incrementForm.newSalary && parseFloat(incrementForm.newSalary) > parseFloat(viewEmployee.salary || 0) && (
                                                <Box p={2.5} bg="green.50" borderRadius="md" border="1px solid" borderColor="green.200">
                                                    <Text fontSize="xs" color="green.900" fontWeight="bold">
                                                        📈 ₹{parseFloat(viewEmployee.salary || 0).toLocaleString()} ➔ ₹{parseFloat(incrementForm.newSalary).toLocaleString()} (+₹{(parseFloat(incrementForm.newSalary) - parseFloat(viewEmployee.salary || 0)).toLocaleString()})
                                                    </Text>
                                                    <Text fontSize="2xs" color="green.700">
                                                        That is a {(((parseFloat(incrementForm.newSalary) - parseFloat(viewEmployee.salary || 0)) / parseFloat(viewEmployee.salary || 1)) * 100).toFixed(1)}% salary increment
                                                    </Text>
                                                </Box>
                                            )}

                                            <FormControl isRequired>
                                                <FormLabel fontSize="xs" fontWeight="bold">Effective Increment Date</FormLabel>
                                                <Input
                                                    type="date"
                                                    size="sm"
                                                    borderRadius="md"
                                                    value={incrementForm.incrementDate}
                                                    onChange={(e) => setIncrementForm(prev => ({ ...prev, incrementDate: e.target.value }))}
                                                />
                                            </FormControl>

                                            <FormControl>
                                                <FormLabel fontSize="xs" fontWeight="bold">Reason / Remarks</FormLabel>
                                                <Input
                                                    size="sm"
                                                    borderRadius="md"
                                                    placeholder="e.g. Annual Appraisal, Promotion, Performance Bonus"
                                                    value={incrementForm.remarks}
                                                    onChange={(e) => setIncrementForm(prev => ({ ...prev, remarks: e.target.value }))}
                                                />
                                            </FormControl>
                                        </VStack>
                                    )}
                                </ModalBody>
                                <ModalFooter borderTop="1px solid" borderColor="gray.100" py={3}>
                                    <Button variant="ghost" size="sm" mr={2} onClick={() => setIsIncrementModalOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button
                                        colorScheme="blue"
                                        size="sm"
                                        isLoading={isSubmittingIncrement}
                                        onClick={handleAddSalaryIncrement}
                                    >
                                        Save Increment
                                    </Button>
                                </ModalFooter>
                            </ModalContent>
                        </Modal>

                        {/* Mandatory Submission Confirmation */}
                        <AlertDialog
                            isOpen={isConfirmOpen}
                            leastDestructiveRef={cancelRef}
                            onClose={onConfirmClose}
                            isCentered
                        >
                            <AlertDialogOverlay>
                                <AlertDialogContent borderRadius="2xl" mx={4}>
                                    <AlertDialogHeader fontSize="lg" fontWeight="bold">
                                        Confirm Employee Registration
                                    </AlertDialogHeader>
                                    <AlertDialogBody>
                                        Are you sure you want to {editId ? 'update' : 'register'} <strong>{formData.name}</strong>?
                                        <br /><br />
                                        Please ensure the <strong>Account Number</strong> and <strong>IFSC Code</strong> are correct as these cannot be easily changed later.
                                    </AlertDialogBody>
                                    <AlertDialogFooter>
                                        <Button ref={cancelRef} onClick={onConfirmClose} borderRadius="full">
                                            Go Back
                                        </Button>
                                        <Button colorScheme="blue" onClick={confirmSubmit} ml={3} borderRadius="full" px={10} shadow="md">
                                            Confirm & Save
                                        </Button>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialogOverlay>
                        </AlertDialog>

                    </CardBody>
                </Card>
            </Container>
        </Box>
    );
};

export default EmployeeMaster;
