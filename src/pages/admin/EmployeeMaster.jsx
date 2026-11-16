import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
    Box, Container, Heading, Text, SimpleGrid, Icon, Stack, Flex, Button, Card, CardBody,
    FormControl, FormLabel, Input, VStack, useToast, Image, HStack, IconButton,
    Tabs, TabList, TabPanels, Tab, TabPanel, Table, Thead, Tbody, Tr, Th, Td, TableContainer, Wrap,
    Tooltip, Progress, Skeleton,
    useDisclosure, AlertDialog, AlertDialogBody, AlertDialogFooter, AlertDialogHeader, AlertDialogContent, AlertDialogOverlay,
    Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
    Checkbox, Badge, InputGroup, InputLeftElement, InputRightElement, Spinner, Select, Center, Divider, Avatar
} from '@chakra-ui/react';
import {
    FaUserTie, FaBuilding, FaCloudUploadAlt, FaFilePdf, FaFileImage, FaEye, FaPlus,
    FaCamera, FaMoneyBillWave, FaIdBadge, FaPhoneAlt, FaEnvelope, FaMapMarkerAlt,
    FaIdCard, FaTrash, FaCheckCircle, FaTimes, FaThLarge, FaList, FaEdit, FaUsers,
    FaFileExcel, FaCopy, FaPrint, FaCar, FaExternalLinkAlt
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
        addressLine1: { street: '', city: '', pincode: '' },
        addressLine2: { street: '', city: '', pincode: '' },
        emergencyContact: { name: '', phone: '' },
        bankName: '',
        accountName: '',
        accountNumber: '',
        confirmAccountNumber: '',
        ifscCode: '',
        salary: '',
        designation: '',
        paymentMode: 'Cash',
        paymentStatus: 'Pending',
        foodAllowance: 'Food',
        status: 'Active',
    });
    const [files, setFiles] = useState({
        photo: null,
        aadharCard: null,
        panCard: null,
        voterId: null,
        drivingLicense: null,
        bankDocuments: []
    });
    const [photoPreview, setPhotoPreview] = useState(null);
    const [existingDocs, setExistingDocs] = useState({
        aadharCard: null,
        panCard: null,
        voterId: null,
        drivingLicense: null,
        bankDocuments: []
    });
    const [sameAsAddress, setSameAsAddress] = useState(false);
    const [bankVerified, setBankVerified] = useState(false);
    const [bankVerifying, setBankVerifying] = useState(false);
    const [accountVerified, setAccountVerified] = useState(false);
    const [accountVerifying, setAccountVerifying] = useState(false);
    const [employees, setEmployees] = useState([]);
    const [editId, setEditId] = useState('');
    const [viewEmployee, setViewEmployee] = useState(null);
    const [selectedReportEmployee, setSelectedReportEmployee] = useState(null);
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

    useEffect(() => {
        fetchNextEmpId();
        fetchEmployees();
    }, []);

    useEffect(() => {
        if (employees.length > 0 && reportMonthFilter) {
            fetchAttendanceSummaries(employees, reportMonthFilter);
        }
    }, [employees, reportMonthFilter]);

    const handleSelectEmployee = (e) => {
        const id = e.target.value;
        setEditId(id);
        if (!id) {
            setFormData({
                name: '', email: '', phone: '',
                addressLine1: { street: '', city: '', pincode: '' },
                addressLine2: { street: '', city: '', pincode: '' },
                emergencyContact: { name: '', phone: '' },
                bankName: '', accountName: '', accountNumber: '', confirmAccountNumber: '', ifscCode: '',
                salary: '',
                designation: '',
                paymentMode: 'Cash',
                paymentStatus: 'Pending',
                foodAllowance: 'Food',
                status: 'Active',
            });
            setFiles({ photo: null, aadharCard: null, panCard: null, voterId: null, drivingLicense: null, bankDocuments: [] });
            setExistingDocs({ aadharCard: null, panCard: null, voterId: null, drivingLicense: null, bankDocuments: [] });
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
                addressLine1: emp.addressLine1 || { street: '', city: '', pincode: '' },
                addressLine2: emp.addressLine2 || { street: '', city: '', pincode: '' },
                emergencyContact: emp.emergencyContact || { name: '', phone: '' },
                bankName: emp.bankDetails?.bankName || '',
                accountName: emp.bankDetails?.accountName || '',
                accountNumber: emp.bankDetails?.accountNumber || '',
                confirmAccountNumber: emp.bankDetails?.accountNumber || '',
                ifscCode: emp.bankDetails?.ifscCode || '',
                salary: emp.salary || '',
                designation: emp.designation || '',
                paymentMode: emp.paymentMode || 'Cash',
                paymentStatus: emp.paymentStatus || 'Pending',
                foodAllowance: emp.foodAllowance || 'Food',
                status: emp.status || 'Active',
            });
            setPhotoPreview(emp.photo?.url ? `${API_BASE_URL}${emp.photo.url}` : null);
            setFiles({ photo: null, aadharCard: null, panCard: null, voterId: null, drivingLicense: null, bankDocuments: [] });
            setExistingDocs({
                aadharCard: emp.aadharCard || null,
                panCard: emp.panCard || null,
                voterId: emp.voterId || null,
                drivingLicense: emp.drivingLicense || null,
                bankDocuments: emp.bankDetails?.documents || []
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
        if (field === 'bankDocuments') {
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

    const removeBankDocument = (index) => {
        setFiles(prev => {
            const newDocs = [...(prev.bankDocuments || [])];
            newDocs.splice(index, 1);
            return { ...prev, bankDocuments: newDocs };
        });
    };

    const removeExistingBankDoc = (index) => {
        setExistingDocs(prev => {
            const newDocs = [...(prev.bankDocuments || [])];
            newDocs.splice(index, 1);
            return { ...prev, bankDocuments: newDocs };
        });
    };

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
            uploadData.append('designation', formData.designation);
            uploadData.append('paymentMode', formData.paymentMode || 'Cash');
            uploadData.append('paymentStatus', formData.paymentStatus || 'Pending');
            uploadData.append('foodAllowance', formData.foodAllowance || 'Food');
            uploadData.append('status', formData.status || 'Active');

            Object.keys(files).forEach(key => {
                if (Array.isArray(files[key])) {
                    files[key].forEach(f => uploadData.append(key, f));
                } else if (files[key]) {
                    uploadData.append(key, files[key]);
                }
            });

            if (editId) {
                uploadData.append('existingBankDocuments', JSON.stringify(existingDocs.bankDocuments || []));
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
                    addressLine1: { street: '', city: '', pincode: '' },
                    addressLine2: { street: '', city: '', pincode: '' },
                    emergencyContact: { name: '', phone: '' },
                    bankName: '',
                    accountName: '',
                    accountNumber: '',
                    ifscCode: '',
                    salary: '',
                    designation: '',
                    paymentMode: 'Cash',
                    paymentStatus: 'Pending',
                    foodAllowance: 'Food',
                    status: 'Active',
                });
                setFiles({ photo: null, aadharCard: null, panCard: null, voterId: null, drivingLicense: null, bankDocuments: [] });
                setExistingDocs({ aadharCard: null, panCard: null, voterId: null, drivingLicense: null, bankDocuments: [] });
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
                <FormLabel fontWeight="bold" fontSize="sm">{label}</FormLabel>
                <VStack align="stretch" spacing={2}>
                    <Box
                        p={4}
                        border="2px dashed"
                        borderColor={files[field] ? "green.200" : hasExisting ? "purple.200" : "blue.100"}
                        borderRadius="xl"
                        bg={files[field] ? "green.50" : hasExisting ? "purple.50" : "blue.50"}
                        textAlign="center"
                        cursor="pointer"
                        onClick={() => document.getElementById(`${field}-upload`).click()}
                        _hover={{ bg: files[field] ? "green.100" : hasExisting ? "purple.100" : "blue.100", borderColor: "blue.300" }}
                        transition="all 0.2s"
                    >
                        <input type="file" id={`${field}-upload`} hidden onChange={(e) => handleFileChange(e, field)} accept="image/*,.pdf" />
                        <Icon as={icon || FaCloudUploadAlt} w={6} h={6} color={files[field] ? "green.500" : hasExisting ? "purple.500" : "blue.500"} mb={2} />
                        <Text fontSize="xs" fontWeight="bold" color={files[field] ? "green.700" : hasExisting ? "purple.700" : "blue.700"} noOfLines={1}>
                            {files[field] ? `✓ ${files[field].name}` : hasExisting ? `Replace ${label}` : `Upload ${label}`}
                        </Text>
                    </Box>

                    {hasExisting && !files[field] && (
                        <Box 
                            p={2} 
                            bg="white" 
                            borderRadius="xl" 
                            border="1px solid" 
                            borderColor="purple.100" 
                            boxShadow="xs"
                            display="flex"
                            alignItems="center"
                            justifyContent="space-between"
                        >
                            <HStack spacing={2} minW={0}>
                                <Icon as={isPdf ? FaFilePdf : FaFileImage} color={isPdf ? "red.400" : "purple.400"} />
                                <Text fontSize="10px" fontWeight="bold" color="gray.600" isTruncated maxW="120px">
                                    {existingDocs[field].name || `Current ${label}`}
                                </Text>
                            </HStack>
                            <Button 
                                size="xs" 
                                colorScheme="purple" 
                                variant="outline" 
                                h="24px"
                                borderRadius="lg"
                                leftIcon={<Icon as={FaEye} />}
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

        {/* ── Desktop GroupBox 1: Personal Particulars & Photo ── */}
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
                    <Flex w="28px" h="28px" bg="blue.50" color="blue.600" borderRadius="md" align="center" justifyContent="center">
                        <Icon as={FaUserTie} fontSize="sm" />
                    </Flex>
                    <Box>
                        <Heading size="xs" color="gray.800" textTransform="uppercase" letterSpacing="0.5px">
                            1. Employee Particulars &amp; Profile
                        </Heading>
                        <Text fontSize="2xs" color="gray.500">Core identity, designation, compensation &amp; residential location</Text>
                    </Box>
                </HStack>
                {editId && (
                    <Badge colorScheme="purple" px={2.5} py={0.5} borderRadius="md" fontSize="xs">
                        Editing: {formData.name || 'Employee'}
                    </Badge>
                )}
            </Flex>

            <SimpleGrid columns={{ base: 1, md: 4 }} spacing={5} alignItems="flex-start">
                {/* ── Photo Upload Column (EXACT SAME POSITION PRESERVED) ── */}
                <Box textAlign="center" pt={1}>
                    <FormLabel fontWeight="bold" fontSize="xs" color="gray.700" textAlign="center" mb={2}>
                        Employee Photo
                    </FormLabel>
                    <Box
                        w="115px"
                        h="145px"
                        mx="auto"
                        borderRadius="xl"
                        border="2px dashed"
                        borderColor={photoPreview ? "green.400" : "blue.300"}
                        bg={photoPreview ? "transparent" : "blue.50"}
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        cursor="pointer"
                        overflow="hidden"
                        position="relative"
                        onClick={() => document.getElementById('photo-upload').click()}
                        _hover={{ borderColor: "blue.500", bg: "blue.100", transform: "scale(1.02)" }}
                        transition="all 0.2s"
                        boxShadow="xs"
                    >
                        <input type="file" id="photo-upload" hidden onChange={(e) => handleFileChange(e, 'photo')} accept="image/*" />
                        {photoPreview ? (
                            <Image src={photoPreview} alt="Preview" w="full" h="full" objectFit="cover" />
                        ) : (
                            <VStack spacing={1.5}>
                                <Icon as={FaCamera} w={6} h={6} color="blue.500" />
                                <Text fontSize="10px" color="blue.600" fontWeight="bold">Upload Photo</Text>
                            </VStack>
                        )}
                    </Box>
                    <Box mt={2}>
                        <Badge colorScheme="purple" variant="subtle" px={2} py={0.5} borderRadius="md" fontSize="xs" fontWeight="bold">
                            ID: {nextEmpId || '####'}
                        </Badge>
                    </Box>
                </Box>

                {/* ── Right Column: Aligned Desktop Fields ── */}
                <Box gridColumn={{ md: 'span 3' }}>
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3} mb={3}>
                        <FormControl isRequired>
                            <FormLabel fontWeight="bold" fontSize="xs" color="gray.700" mb={1}>Employee Full Name</FormLabel>
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
                                    placeholder="Enter full name" 
                                    value={formData.name} 
                                    onChange={(e) => handleChange(e, 'name')} 
                                />
                            </InputGroup>
                        </FormControl>
                        <FormControl isRequired>
                            <FormLabel fontWeight="bold" fontSize="xs" color="gray.700" mb={1}>Monthly Salary (₹)</FormLabel>
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
                                    placeholder="e.g. 25000" 
                                    value={formData.salary} 
                                    onChange={(e) => handleChange(e, 'salary')} 
                                />
                            </InputGroup>
                        </FormControl>
                    </SimpleGrid>

                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3} mb={3}>
                        <FormControl>
                            <FormLabel fontWeight="bold" fontSize="xs" color="gray.700" mb={1}>Designation / Role</FormLabel>
                            <InputGroup size="sm">
                                <InputLeftElement pointerEvents="none">
                                    <Icon as={FaIdBadge} color="blue.500" />
                                </InputLeftElement>
                                <Input 
                                    borderRadius="md" 
                                    borderColor="gray.300"
                                    bg="white"
                                    _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px #3182ce" }}
                                    h="36px"
                                    placeholder="e.g. Site Engineer / Surveyor" 
                                    value={formData.designation} 
                                    onChange={(e) => handleChange(e, 'designation')} 
                                />
                            </InputGroup>
                        </FormControl>
                        <FormControl isRequired>
                            <FormLabel fontWeight="bold" fontSize="xs" color="gray.700" mb={1}>Mobile Phone Number</FormLabel>
                            <InputGroup size="sm">
                                <InputLeftElement pointerEvents="none">
                                    <Icon as={FaPhoneAlt} color="blue.500" />
                                </InputLeftElement>
                                <Input 
                                    borderRadius="md" 
                                    borderColor="gray.300"
                                    bg="white"
                                    _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px #3182ce" }}
                                    h="36px"
                                    placeholder="10-digit mobile number" 
                                    value={formData.phone} 
                                    onChange={(e) => handleChange(e, 'phone')} 
                                />
                            </InputGroup>
                        </FormControl>
                    </SimpleGrid>

                    <SimpleGrid columns={{ base: 1, sm: 3 }} spacing={3} mb={3}>
                        <FormControl>
                            <FormLabel fontWeight="bold" fontSize="xs" color="gray.700" mb={1}>Email Address</FormLabel>
                            <InputGroup size="sm">
                                <InputLeftElement pointerEvents="none">
                                    <Icon as={FaEnvelope} color="blue.500" />
                                </InputLeftElement>
                                <Input 
                                    borderRadius="md" 
                                    borderColor="gray.300"
                                    bg="white"
                                    _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px #3182ce" }}
                                    h="36px"
                                    type="email" 
                                    placeholder="email@company.com" 
                                    value={formData.email} 
                                    onChange={(e) => handleChange(e, 'email')} 
                                    autoComplete="new-password" 
                                />
                            </InputGroup>
                        </FormControl>
                        <FormControl>
                            <FormLabel fontWeight="bold" fontSize="xs" color="gray.700" mb={1}>🍽️ Food Allowance</FormLabel>
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
                                <option value="Food">🍱 Food Included</option>
                                <option value="Without Food">🚫 Without Food</option>
                            </Select>
                        </FormControl>
                        <FormControl>
                            <FormLabel fontWeight="bold" fontSize="xs" color="gray.700" mb={1}>👤 Employee Status</FormLabel>
                            <Select
                                size="sm"
                                h="36px"
                                borderRadius="md"
                                borderColor="gray.300"
                                bg={formData.status === 'Active' ? 'green.50' : 'red.50'}
                                color={formData.status === 'Active' ? 'green.800' : 'red.800'}
                                fontWeight="bold"
                                _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px #3182ce" }}
                                value={formData.status || 'Active'}
                                onChange={(e) => handleChange(e, 'status')}
                            >
                                <option value="Active">✅ Active Record</option>
                                <option value="Deactive">❌ Deactive Record</option>
                            </Select>
                        </FormControl>
                    </SimpleGrid>

                    {/* ── Primary Residential Address (Desktop Sub-GroupBox) ── */}
                    <Box mt={3} p={3.5} bg="blue.50" borderRadius="lg" border="1px solid" borderColor="blue.100">
                        <Flex align="center" justify="space-between" mb={2}>
                            <HStack spacing={1.5}>
                                <Icon as={FaMapMarkerAlt} color="blue.600" fontSize="xs" />
                                <Text fontWeight="bold" fontSize="xs" color="blue.800" textTransform="uppercase" letterSpacing="0.3px">
                                    Primary Residential Address
                                </Text>
                            </HStack>
                            <Text fontSize="2xs" color="blue.600">Enter pincode for auto-city fill</Text>
                        </Flex>
                        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={2.5}>
                            <FormControl gridColumn={{ md: 'span 3' }}>
                                <Input 
                                    size="sm" 
                                    h="34px" 
                                    borderRadius="md" 
                                    bg="white" 
                                    borderColor="gray.300"
                                    placeholder="Street / Building / Flat No. / Area" 
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
                                    placeholder="6-Digit Pincode"
                                    maxLength={6}
                                    value={formData.addressLine1.pincode}
                                    onChange={(e) => handleChange(e, 'addressLine1', 'pincode')}
                                />
                                {pincodeLoading1 && <Text fontSize="2xs" color="blue.600" mt={0.5}>Fetching city...</Text>}
                            </FormControl>
                            <FormControl gridColumn={{ md: 'span 2' }}>
                                <Input 
                                    size="sm" 
                                    h="34px" 
                                    borderRadius="md" 
                                    bg="white" 
                                    borderColor="gray.300"
                                    placeholder="City (Auto-filled via pincode)" 
                                    value={formData.addressLine1.city} 
                                    onChange={(e) => handleChange(e, 'addressLine1', 'city')} 
                                />
                            </FormControl>
                        </SimpleGrid>
                    </Box>
                </Box>
            </SimpleGrid>
        </Box>

        {/* ── Desktop GroupBox 2: Identification & Statutory Documents ── */}
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
                    <Flex w="28px" h="28px" bg="indigo.50" color="indigo.600" borderRadius="md" align="center" justifyContent="center">
                        <Icon as={FaIdCard} fontSize="sm" />
                    </Flex>
                    <Box>
                        <Heading size="xs" color="gray.800" textTransform="uppercase" letterSpacing="0.5px">
                            2. Identification &amp; Statutory Document Proofs
                        </Heading>
                        <Text fontSize="2xs" color="gray.500">Government identity cards &amp; scanned proof copies (PDF / Image)</Text>
                    </Box>
                </HStack>
            </Flex>
            <SimpleGrid columns={{ base: 2, sm: 2, md: 4 }} spacing={3}>
                <FileUploadInput label="Aadhar Card" field="aadharCard" />
                <FileUploadInput label="PAN Card" field="panCard" />
                <FileUploadInput label="Voter ID" field="voterId" />
                <FileUploadInput label="Driving License" field="drivingLicense" />
            </SimpleGrid>
        </Box>

        {/* ── Desktop GroupBox 3: Secondary / Permanent Address ── */}
        <Box 
            bg="white" 
            borderWidth="1px" 
            borderColor="gray.200" 
            borderRadius="xl" 
            p={{ base: 4, md: 5 }} 
            boxShadow="xs"
        >
            <Flex align="center" justify="space-between" mb={sameAsAddress ? 0 : 3} pb={sameAsAddress ? 0 : 2} borderBottom={sameAsAddress ? 'none' : '1px solid'} borderColor="gray.100">
                <HStack spacing={2.5}>
                    <Flex w="28px" h="28px" bg="purple.50" color="purple.600" borderRadius="md" align="center" justifyContent="center">
                        <Icon as={FaMapMarkerAlt} fontSize="sm" />
                    </Flex>
                    <Box>
                        <Heading size="xs" color="gray.800" textTransform="uppercase" letterSpacing="0.5px">
                            3. Secondary / Permanent Address
                        </Heading>
                        <Text fontSize="2xs" color="gray.500">Native place / permanent home address if different from current residence</Text>
                    </Box>
                </HStack>
                <Checkbox 
                    colorScheme="blue" 
                    fontWeight="bold" 
                    fontSize="xs"
                    isChecked={sameAsAddress} 
                    onChange={handleCheckboxChange}
                >
                    Same as Primary Address
                </Checkbox>
            </Flex>
            {!sameAsAddress && (
                <Box pt={2}>
                    <SimpleGrid columns={{ base: 1, md: 3 }} spacing={2.5}>
                        <FormControl gridColumn={{ md: 'span 3' }}>
                            <Input 
                                size="sm" 
                                h="34px" 
                                borderRadius="md" 
                                bg="white" 
                                borderColor="gray.300"
                                placeholder="Secondary Street / Village / Area" 
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
                            {pincodeLoading2 && <Text fontSize="2xs" color="blue.500" mt={0.5}>Fetching city...</Text>}
                        </FormControl>
                        <FormControl gridColumn={{ md: 'span 2' }}>
                            <Input 
                                size="sm" 
                                h="34px" 
                                borderRadius="md" 
                                bg="white" 
                                borderColor="gray.300"
                                placeholder="City (Auto-filled via pincode)" 
                                value={formData.addressLine2.city} 
                                onChange={(e) => handleChange(e, 'addressLine2', 'city')} 
                            />
                        </FormControl>
                    </SimpleGrid>
                </Box>
            )}
        </Box>

        {/* ── Desktop GroupBox 4: Bank Details & Disbursement ── */}
        <Box 
            bg="white" 
            borderWidth="1px" 
            borderColor="green.200" 
            borderRadius="xl" 
            p={{ base: 4, md: 5 }} 
            boxShadow="xs"
        >
            <Flex align="center" justify="space-between" mb={3} pb={2} borderBottom="1px solid" borderColor="green.100">
                <HStack spacing={2.5}>
                    <Flex w="28px" h="28px" bg="green.50" color="green.600" borderRadius="md" align="center" justifyContent="center">
                        <Icon as={FaIdBadge} fontSize="sm" />
                    </Flex>
                    <Box>
                        <Heading size="xs" color="gray.800" textTransform="uppercase" letterSpacing="0.5px">
                            4. Bank Account &amp; Disbursement Credentials
                        </Heading>
                        <Text fontSize="2xs" color="gray.500">Bank IFSC validation, verified account credentials &amp; document proof</Text>
                    </Box>
                </HStack>
                {bankVerified && (
                    <Badge colorScheme="green" px={2} py={0.5} borderRadius="md" fontSize="xs">
                        ✓ Bank Verified
                    </Badge>
                )}
            </Flex>

            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={3} mb={3}>
                <FormControl>
                    <FormLabel fontWeight="bold" fontSize="xs" color="gray.700" mb={1}>IFSC Code</FormLabel>
                    <HStack spacing={1.5}>
                        <Input
                            size="sm"
                            h="36px"
                            borderRadius="md" 
                            bg="white" 
                            borderColor="gray.300"
                            placeholder="e.g. SBIN0001234"
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
                    <FormLabel fontWeight="bold" fontSize="xs" color="gray.700" mb={1}>Bank Name</FormLabel>
                    <Input 
                        size="sm"
                        h="36px"
                        borderRadius="md" 
                        bg="white" 
                        borderColor="gray.300"
                        placeholder="Auto-filled on IFSC verify" 
                        value={formData.bankName} 
                        onChange={(e) => handleChange(e, 'bankName')} 
                        readOnly={bankVerified} 
                    />
                </FormControl>
                <FormControl>
                    <FormLabel fontWeight="bold" fontSize="xs" color="gray.700" mb={1}>Account Holder Name</FormLabel>
                    <Input 
                        size="sm"
                        h="36px"
                        borderRadius="md" 
                        bg="white" 
                        borderColor="gray.300"
                        placeholder="Name as printed in passbook" 
                        value={formData.accountName} 
                        onChange={(e) => handleChange(e, 'accountName')} 
                    />
                </FormControl>
            </SimpleGrid>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3} mb={3}>
                <FormControl isRequired>
                    <FormLabel fontWeight="bold" fontSize="xs" color="gray.700" mb={1}>Account Number</FormLabel>
                    <Input
                        size="sm"
                        h="36px"
                        borderRadius="md" 
                        bg="white" 
                        borderColor="gray.300"
                        placeholder="Enter bank account number"
                        value={formData.accountNumber} 
                        onChange={(e) => handleChange(e, 'accountNumber')}
                        type="password"
                        fontWeight="mono"
                    />
                </FormControl>
                <FormControl isRequired>
                    <FormLabel fontWeight="bold" fontSize="xs" color="gray.700" mb={1}>Confirm Account Number</FormLabel>
                    <Input 
                        size="sm"
                        h="36px"
                        borderRadius="md" 
                        bg="white" 
                        borderColor="gray.300"
                        placeholder="Re-enter bank account number" 
                        value={formData.confirmAccountNumber} 
                        onChange={(e) => handleChange(e, 'confirmAccountNumber')} 
                        type="text" 
                        fontWeight="mono"
                    />
                </FormControl>
            </SimpleGrid>

            <FormControl mt={3}>
                <FormLabel fontWeight="bold" fontSize="xs" color="gray.700" mb={1}>
                    Bank Document Proof (Passbook / Cancelled Cheque / Statement)
                </FormLabel>
                <Box 
                    p={3} 
                    border="2px dashed" 
                    borderColor="green.300" 
                    borderRadius="lg" 
                    bg="green.50" 
                    textAlign="center" 
                    cursor="pointer" 
                    onClick={() => document.getElementById('bankDocuments-upload').click()} 
                    _hover={{ bg: "green.100", borderColor: "green.500" }}
                    transition="all 0.2s"
                >
                    <input type="file" id="bankDocuments-upload" multiple hidden onChange={(e) => handleFileChange(e, 'bankDocuments')} accept="image/*,.pdf" />
                    <HStack justify="center" spacing={2}>
                        <Icon as={FaCloudUploadAlt} w={5} h={5} color="green.600" />
                        <Text fontSize="xs" fontWeight="bold" color="green.700">Click to upload bank documents (Passbook / Cheque / PDF)</Text>
                    </HStack>
                </Box>
                
                {(existingDocs?.bankDocuments?.length > 0 || files?.bankDocuments?.length > 0) && (
                    <Wrap mt={2} spacing={2}>
                        {existingDocs?.bankDocuments?.map((doc, idx) => (
                            <HStack key={'ex-' + idx} px={2.5} py={1} bg="white" borderRadius="md" borderWidth="1px" borderColor="gray.200" boxShadow="2xs">
                                <Text fontSize="2xs" fontWeight="bold" color="gray.700" noOfLines={1} maxW="180px">📎 {doc.name || 'Existing Document'}</Text>
                                <Button size="xs" colorScheme="red" variant="ghost" h="18px" w="18px" minW="18px" p={0} onClick={() => removeExistingBankDoc(idx)}><FaTrash size="10px" /></Button>
                            </HStack>
                        ))}
                        {files?.bankDocuments?.map((file, idx) => (
                            <HStack key={'new-' + idx} px={2.5} py={1} bg="green.100" borderRadius="md" borderWidth="1px" borderColor="green.300" boxShadow="2xs">
                                <Text fontSize="2xs" fontWeight="bold" color="green.800" noOfLines={1} maxW="180px">📄 {file.name}</Text>
                                <Button size="xs" colorScheme="red" variant="ghost" h="18px" w="18px" minW="18px" p={0} onClick={() => removeBankDocument(idx)}><FaTrash size="10px" /></Button>
                            </HStack>
                        ))}
                    </Wrap>
                )}
            </FormControl>
        </Box>

        {/* ── Desktop GroupBox 5: Emergency Contact Particulars ── */}
        <Box 
            bg="white" 
            borderWidth="1px" 
            borderColor="red.200" 
            borderRadius="xl" 
            p={{ base: 4, md: 5 }} 
            boxShadow="xs"
        >
            <Flex align="center" justify="space-between" mb={3} pb={2} borderBottom="1px solid" borderColor="red.100">
                <HStack spacing={2.5}>
                    <Flex w="28px" h="28px" bg="red.50" color="red.600" borderRadius="md" align="center" justifyContent="center">
                        <Icon as={FaPhoneAlt} fontSize="sm" />
                    </Flex>
                    <Box>
                        <Heading size="xs" color="gray.800" textTransform="uppercase" letterSpacing="0.5px">
                            5. Emergency Contact Particulars
                        </Heading>
                        <Text fontSize="2xs" color="gray.500">Contact person name and phone number in case of emergency on site</Text>
                    </Box>
                </HStack>
            </Flex>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                <FormControl>
                    <FormLabel fontWeight="bold" fontSize="xs" color="gray.700" mb={1}>Contact Person Full Name</FormLabel>
                    <Input 
                        size="sm"
                        h="36px"
                        borderRadius="md" 
                        bg="white" 
                        borderColor="gray.300"
                        placeholder="Relative / Guardian Name" 
                        value={formData.emergencyContact.name} 
                        onChange={(e) => handleChange(e, 'emergencyContact', 'name')} 
                    />
                </FormControl>
                <FormControl>
                    <FormLabel fontWeight="bold" fontSize="xs" color="gray.700" mb={1}>Emergency Mobile Number</FormLabel>
                    <Input 
                        size="sm"
                        h="36px"
                        borderRadius="md" 
                        bg="white" 
                        borderColor="gray.300"
                        placeholder="Emergency contact mobile number" 
                        value={formData.emergencyContact.phone} 
                        onChange={(e) => handleChange(e, 'emergencyContact', 'phone')} 
                    />
                </FormControl>
            </SimpleGrid>
        </Box>

        {/* ── Desktop Command Bar / Action Toolbar ── */}
        <Box 
            bg="white" 
            p={4} 
            borderRadius="xl" 
            borderWidth="1px" 
            borderColor="gray.200" 
            boxShadow="sm"
        >
            <Flex direction={{ base: "column", sm: "row" }} justify="space-between" align="center" gap={3}>
                <HStack spacing={2}>
                    <Badge colorScheme="blue" variant="subtle" px={2} py={1} borderRadius="md" fontSize="xs">
                        * Required Fields
                    </Badge>
                    <Text fontSize="2xs" color="gray.500">Ensure bank IFSC &amp; account number match passbook proof</Text>
                </HStack>
                <HStack spacing={3} w={{ base: "full", sm: "auto" }}>
                    <Button
                        type="button"
                        variant="outline"
                        colorScheme="gray"
                        h="42px"
                        px={5}
                        borderRadius="lg"
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
                        h="42px"
                        px={7}
                        borderRadius="lg"
                        fontSize="sm"
                        fontWeight="bold"
                        leftIcon={<Icon as={FaIdBadge} />}
                        isLoading={isLoading}
                        boxShadow="md"
                        _hover={{ transform: "translateY(-1px)", boxShadow: "lg" }}
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
                                                                            onClick={() => setViewEmployee(emp)}
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
                                                                            onClick={() => handleSelectEmployee({ target: { value: emp._id } })}
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
                                                                            onClick={() => handleDelete(emp._id)}
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
                                                                    <Th fontSize="10px" fontWeight="black" color="gray.600">DESIGNATION</Th>
                                                                    <Th fontSize="10px" fontWeight="black" color="gray.600">PHONE</Th>
                                                                    <Th fontSize="10px" fontWeight="black" color="gray.600">FOOD</Th>
                                                                    <Th fontSize="10px" fontWeight="black" color="gray.600" textAlign="center">ACTIONS</Th>
                                                                </Tr>
                                                            </Thead>
                                                            <Tbody>
                                                                {filteredEmployees.map((emp, idx) => {
                                                                    return (
                                                                        <Tr key={emp._id} bg={idx % 2 === 0 ? "white" : "gray.50"} _hover={{ bg: "blue.50" }} transition="background 0.2s">
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
                                                                                {emp.designation ? (
                                                                                    <Badge colorScheme="purple" variant="subtle" borderRadius="full" px={2} fontSize="10px">
                                                                                        {emp.designation}
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
                                                                            <Td textAlign="center">
                                                                                <HStack justify="center" spacing={1.5}>
                                                                                    <IconButton aria-label="View" size="xs" colorScheme="teal" variant="solid" borderRadius="lg" icon={<Icon as={FaEye} />} onClick={() => setViewEmployee(emp)} />
                                                                                    <IconButton aria-label="Edit" size="xs" colorScheme="blue" variant="solid" borderRadius="lg" icon={<Icon as={FaEdit} />} onClick={() => handleSelectEmployee({ target: { value: emp._id } })} />
                                                                                    <IconButton aria-label="Delete" size="xs" colorScheme="red" variant="ghost" borderRadius="lg" icon={<Icon as={FaTrash} />} onClick={() => handleDelete(emp._id)} />
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

                        {/* Standardized Employee View Modal */}
                        <Modal isOpen={!!viewEmployee} onClose={() => setViewEmployee(null)} size="4xl" isCentered motionPreset="slideInBottom">
                            <ModalOverlay backdropFilter="blur(8px) grayscale(40%)" bg="blackAlpha.600" />
                            <ModalContent borderRadius="3xl" overflow="hidden" boxShadow="2xl" border="1px solid" borderColor="whiteAlpha.300" m={{ base: 3, md: 6 }}>
                                <ModalHeader p={0}>
                                    <Box bgGradient="linear(to-r, blue.800, blue.600)" p={{ base: 4, md: 6 }} color="white">
                                        <HStack justify="space-between" spacing={4}>
                                            <HStack spacing={3}>
                                                <Avatar
                                                    size="lg"
                                                    src={viewEmployee?.photo ? getFileUrl(viewEmployee.photo) : undefined}
                                                    name={viewEmployee?.name}
                                                    borderRadius="xl"
                                                    border="2px solid white"
                                                />
                                                <VStack align="start" spacing={0.5}>
                                                    <Heading size="md">{viewEmployee?.name}</Heading>
                                                    <Text fontSize="xs" opacity={0.8}>{viewEmployee?.empId} • {viewEmployee?.designation || 'Employee'}</Text>
                                                </VStack>
                                            </HStack>
                                            <ModalCloseButton position="static" borderRadius="full" />
                                        </HStack>
                                    </Box>
                                </ModalHeader>

                                <ModalBody p={{ base: 4, md: 8 }}>
                                    {viewEmployee && (
                                        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10}>
                                            <VStack align="start" spacing={6}>
                                                <Box w="full">
                                                    <Text fontSize="11px" fontWeight="black" color="blue.500" textTransform="uppercase" mb={3}>Personal & Contact</Text>
                                                    <VStack align="start" spacing={3}>
                                                        <Box>
                                                            <Text fontSize="9px" color="gray.400" fontWeight="bold">PHONE</Text>
                                                            <Text fontSize="sm" fontWeight="bold" color="gray.700">{viewEmployee.phone}</Text>
                                                        </Box>
                                                        <Box>
                                                            <Text fontSize="9px" color="gray.400" fontWeight="bold">EMAIL</Text>
                                                            <Text fontSize="sm" color="gray.700">{viewEmployee.email || 'N/A'}</Text>
                                                        </Box>
                                                    </VStack>
                                                </Box>
                                                <Box bg="red.50" p={4} borderRadius="2xl" border="1px dashed" borderColor="red.200" w="full">
                                                    <Text fontSize="10px" color="red.600" fontWeight="black">EMERGENCY CONTACT</Text>
                                                    <Text fontSize="sm" fontWeight="bold" color="red.800">{viewEmployee.emergencyContact?.name}</Text>
                                                    <Text fontSize="xs" color="red.700">{viewEmployee.emergencyContact?.phone}</Text>
                                                </Box>
                                            </VStack>

                                            <VStack align="start" spacing={6}>
                                                <Box bg="green.50" p={4} borderRadius="2xl" w="full" border="1px solid" borderColor="green.100">
                                                    <Text fontSize="10px" color="green.600" fontWeight="black">GROSS SALARY (CTC)</Text>
                                                    <Text fontSize="2xl" fontWeight="black" color="green.800">₹{parseFloat(viewEmployee.salary || 0).toLocaleString()}</Text>
                                                </Box>
                                                <Box w="full">
                                                    <Text fontSize="11px" fontWeight="black" color="orange.500" textTransform="uppercase" mb={3}>Bank Details</Text>
                                                    <VStack align="start" spacing={3} bg="orange.50" p={4} borderRadius="xl">
                                                        <Box>
                                                            <Text fontSize="9px" color="orange.600" fontWeight="bold">BANK</Text>
                                                            <Text fontSize="xs" fontWeight="bold">{viewEmployee.bankDetails?.bankName || 'N/A'}</Text>
                                                        </Box>
                                                        <Box>
                                                            <Text fontSize="9px" color="orange.600" fontWeight="bold">A/C NUMBER</Text>
                                                            <Text fontSize="xs" fontWeight="bold">{viewEmployee.bankDetails?.accountNumber || 'N/A'}</Text>
                                                        </Box>
                                                        <Box>
                                                            <Text fontSize="9px" color="orange.600" fontWeight="bold">IFSC CODE</Text>
                                                            <Text fontSize="xs" color="blue.600" fontWeight="bold">{viewEmployee.bankDetails?.ifscCode || 'N/A'}</Text>
                                                        </Box>
                                                    </VStack>
                                                </Box>
                                            </VStack>

                                            <VStack align="start" spacing={6}>
                                                <Box w="full">
                                                    <Text fontSize="11px" fontWeight="black" color="cyan.500" textTransform="uppercase" mb={3}>Address Details</Text>
                                                    <VStack align="start" spacing={4}>
                                                        <Box>
                                                            <Text fontSize="9px" color="gray.400" fontWeight="bold">CURRENT ADDRESS</Text>
                                                            <Text fontSize="xs" lineHeight="1.6" color="gray.700">
                                                                {viewEmployee.addressLine1?.street}, {viewEmployee.addressLine1?.city} - {viewEmployee.addressLine1?.pincode}
                                                            </Text>
                                                        </Box>
                                                        <Box>
                                                            <Text fontSize="9px" color="gray.400" fontWeight="bold">PERMANENT ADDRESS</Text>
                                                            <Text fontSize="xs" lineHeight="1.6" color="gray.700">
                                                                {viewEmployee.addressLine2?.street || 'Same'}, {viewEmployee.addressLine2?.city} - {viewEmployee.addressLine2?.pincode}
                                                            </Text>
                                                        </Box>
                                                    </VStack>
                                                </Box>
                                                <Box w="full">
                                                    <Text fontSize="11px" fontWeight="black" color="purple.500" textTransform="uppercase" mb={3}>KYC & Bank Documents</Text>
                                                    <Wrap spacing={2.5}>
                                                        {[
                                                            { field: 'aadharCard', label: 'AADHAAR', icon: FaIdCard, color: 'purple' },
                                                            { field: 'panCard', label: 'PAN CARD', icon: FaIdCard, color: 'blue' },
                                                            { field: 'voterId', label: 'VOTER ID', icon: FaIdBadge, color: 'teal' },
                                                            { field: 'drivingLicense', label: 'LICENSE', icon: FaCar, color: 'green' }
                                                        ].map(({ field, label, icon: DocIcon, color }) => {
                                                            const docData = viewEmployee[field];
                                                            const docUrl = getFileUrl(docData);
                                                            if (!docUrl) return null;
                                                            return (
                                                                <Button
                                                                    key={field}
                                                                    as="a"
                                                                    href={docUrl}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    size="xs"
                                                                    colorScheme={color}
                                                                    variant="solid"
                                                                    leftIcon={<Icon as={DocIcon} />}
                                                                    rightIcon={<Icon as={FaExternalLinkAlt} fontSize="8px" />}
                                                                    borderRadius="lg"
                                                                    fontWeight="bold"
                                                                    px={3}
                                                                    py={2}
                                                                    shadow="xs"
                                                                    _hover={{ transform: 'translateY(-1px)', shadow: 'sm' }}
                                                                    onClick={(e) => {
                                                                        if (window.innerWidth < 768) {
                                                                            e.preventDefault();
                                                                            window.open(docUrl, '_blank', 'noopener,noreferrer');
                                                                        }
                                                                    }}
                                                                >
                                                                    {label}
                                                                </Button>
                                                            );
                                                        })}
                                                        {/* Bank Documents if any */}
                                                        {Array.isArray(viewEmployee.bankDocuments) && viewEmployee.bankDocuments.map((doc, idx) => {
                                                            const docUrl = getFileUrl(doc);
                                                            if (!docUrl) return null;
                                                            return (
                                                                <Button
                                                                    key={`bank-doc-${idx}`}
                                                                    as="a"
                                                                    href={docUrl}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    size="xs"
                                                                    colorScheme="orange"
                                                                    variant="solid"
                                                                    leftIcon={<Icon as={FaFilePdf} />}
                                                                    rightIcon={<Icon as={FaExternalLinkAlt} fontSize="8px" />}
                                                                    borderRadius="lg"
                                                                    fontWeight="bold"
                                                                    px={3}
                                                                    py={2}
                                                                    shadow="xs"
                                                                    _hover={{ transform: 'translateY(-1px)', shadow: 'sm' }}
                                                                    onClick={(e) => {
                                                                        if (window.innerWidth < 768) {
                                                                            e.preventDefault();
                                                                            window.open(docUrl, '_blank', 'noopener,noreferrer');
                                                                        }
                                                                    }}
                                                                >
                                                                    BANK DOC {idx + 1}
                                                                </Button>
                                                            );
                                                        })}
                                                        {!viewEmployee.aadharCard && !viewEmployee.panCard && !viewEmployee.voterId && !viewEmployee.drivingLicense && (!viewEmployee.bankDocuments || viewEmployee.bankDocuments.length === 0) && (
                                                            <Text fontSize="xs" color="gray.400" fontStyle="italic">
                                                                No KYC documents uploaded for this employee.
                                                            </Text>
                                                        )}
                                                    </Wrap>
                                                </Box>
                                            </VStack>
                                        </SimpleGrid>
                                    )}
                                </ModalBody>
                                <ModalFooter bg="gray.50">
                                    <Button colorScheme="blue" px={10} borderRadius="full" shadow="lg" onClick={() => setViewEmployee(null)}>Close Profile</Button>
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
