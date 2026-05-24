import React, { useState, useEffect, useMemo } from 'react';
import {
    Box, Container, VStack, HStack, Text, Heading, SimpleGrid, Card, CardBody, 
    Button, IconButton, Icon, Badge, Select, Input, InputGroup, InputLeftElement, 
    Table, Thead, Tbody, Tr, Th, Td, TableContainer, Divider, useToast, 
    Tabs, TabList, TabPanels, Tab, TabPanel, FormControl, FormLabel,
    Flex, Spinner, Center, Tooltip, CloseButton, Image, List, ListItem, ListIcon,
    Popover, PopoverTrigger, PopoverContent, PopoverBody, PopoverArrow, Portal,
    Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton
} from '@chakra-ui/react';
import { 
    FaMoneyBillWave, FaExchangeAlt, FaPlus, FaTrash, FaEye,
    FaUserTie, FaCheckCircle, FaEdit, FaRupeeSign, FaArrowRight,
    FaCalendarAlt, FaUtensils, FaGasPump, FaBuilding, FaCamera, FaFileAlt, FaFolderOpen, FaChartBar, FaCloudUploadAlt
} from 'react-icons/fa';
import api from '../api/axios';
import AdminEmployeeExpenses from '../components/AdminEmployeeExpenses';

const EmployeeExpensesModule = () => {
    const [employees, setEmployees] = useState([]);
    const [clients, setClients] = useState([]);
    const [sites, setSites] = useState([]);
    const [loading, setLoading] = useState(false);

    const updateSingleEmployee = (updatedEmp) => {
        setEmployees(prev => prev.map(emp => emp._id === updatedEmp._id ? updatedEmp : emp));
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const [eRes, cRes, sRes] = await Promise.all([
                api.get('/employee-master?t=' + Date.now()),
                api.get('/client-master?t=' + Date.now()),
                api.get('/site-master?t=' + Date.now())
            ]);
            if (eRes.data.success) setEmployees(eRes.data.data);
            if (cRes.data.success) setClients(cRes.data.data);
            if (sRes.data.success) setSites(sRes.data.data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, []);

    const [selectedExpenseEmployee, setSelectedExpenseEmployee] = useState({ id: '', name: '' });

    return (
        <Box py={10} bg="gray.50" minH="100vh">
            <Container maxW="container.xl">
                <VStack spacing={8} align="stretch">
                    {/* Module Header */}
                    <Flex justify="space-between" align="center" bg="white" p={6} borderRadius="2xl" shadow="sm" border="1px solid" borderColor="gray.100">
                        <HStack spacing={4}>
                            <Box bg="blue.500" p={3} borderRadius="xl" color="white">
                                <Icon as={FaMoneyBillWave} w={6} h={6} />
                            </Box>
                            <VStack align="start" spacing={0}>
                                <Heading size="lg">Expenses Management</Heading>
                                <Text color="gray.500" fontSize="sm">Manage internal transfers and daily operational expenses.</Text>
                            </VStack>
                        </HStack>
                    </Flex>

                    {/* Navigation Tabs */}
                    <Tabs variant="unstyled" defaultIndex={0} isLazy>
                        <TabList bg="white" p={1.5} borderRadius="2xl" shadow="sm" border="1px solid" borderColor="gray.100" display="inline-flex">
                            <Tab 
                                _selected={{ bg: "blue.600", color: "white", shadow: "md" }} 
                                borderRadius="xl" 
                                px={8} 
                                py={3} 
                                fontWeight="bold" 
                                color="gray.500"
                                transition="all 0.3s"
                            >
                                <Icon as={FaExchangeAlt} mr={2} /> Money Transfer
                            </Tab>
                            <Tab 
                                _selected={{ bg: "blue.600", color: "white", shadow: "md" }} 
                                borderRadius="xl" 
                                px={8} 
                                py={3} 
                                fontWeight="bold" 
                                color="gray.500"
                                transition="all 0.3s"
                            >
                                <Icon as={FaPlus} mr={2} /> Daily Expenses
                            </Tab>
                            <Tab 
                                _selected={{ bg: "blue.600", color: "white", shadow: "md" }} 
                                borderRadius="xl" 
                                px={8} 
                                py={3} 
                                fontWeight="bold" 
                                color="gray.500"
                                transition="all 0.3s"
                            >
                                <Icon as={FaChartBar} mr={2} /> Daily Report
                            </Tab>
                        </TabList>

                        <TabPanels mt={8}>
                            <TabPanel p={0}>
                                <MoneyTransferSection employees={employees} onRefresh={fetchData} />
                            </TabPanel>
                            <TabPanel p={0}>
                                <DailyExpensesSection 
                                    employees={employees} 
                                    clients={clients} 
                                    sites={sites} 
                                    loading={loading}
                                    onRefresh={fetchData} 
                                    onUpdateEmployee={updateSingleEmployee}
                                />
                            </TabPanel>
                            <TabPanel p={0}>
                                <Box bg="white" p={6} borderRadius="2xl" shadow="sm" border="1px solid" borderColor="gray.100">
                                    <Heading size="sm" mb={5} color="gray.700">Select Employee to View Daily Report</Heading>
                                    <Select
                                        placeholder="-- Select Employee --"
                                        value={selectedExpenseEmployee.id}
                                        onChange={e => {
                                            const emp = employees.find(emp => emp._id === e.target.value);
                                            setSelectedExpenseEmployee({ id: emp?._id || '', name: emp?.name || '' });
                                        }}
                                        maxW="400px"
                                        mb={6}
                                    >
                                        {employees.map(emp => (
                                            <option key={emp._id} value={emp._id}>{emp.name}</option>
                                        ))}
                                    </Select>
                                    {selectedExpenseEmployee.id ? (
                                        <AdminEmployeeExpenses
                                            employeeId={selectedExpenseEmployee.id}
                                            employeeName={selectedExpenseEmployee.name}
                                        />
                                    ) : (
                                        <Center py={16}>
                                            <VStack spacing={3}>
                                                <Icon as={FaChartBar} w={10} h={10} color="gray.300" />
                                                <Text color="gray.400" fontSize="md">Select an employee to view their daily report</Text>
                                            </VStack>
                                        </Center>
                                    )}
                                </Box>
                            </TabPanel>
                        </TabPanels>
                    </Tabs>
                </VStack>
            </Container>
        </Box>
    );
};

// ── Daily Expenses Module ──────────────────────────────────────────────
const DailyExpensesSection = ({ employees, clients, sites, loading, onRefresh, onUpdateEmployee }) => {
    const toast = useToast();
    const [isSaving, setIsSaving] = useState(false);
    
    // Core State
    const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [standardExpenses, setStandardExpenses] = useState({ breakfast: '', lunch: '', dinner: '', petrol: '' });
    const [otherExpenses, setOtherExpenses] = useState([]);
    const [clientSites, setClientSites] = useState([{ 
        clientId: '', 
        siteId: '', 
        files: { photos: [], data: [], dailyReports: [], drawing: [] } 
    }]);
    const [notes, setNotes] = useState('');
    const [attendance, setAttendance] = useState('Present');
    const [attendanceRemark, setAttendanceRemark] = useState('');

    // New Fuel & Day Schedules State
    const [fuelType, setFuelType] = useState('Petrol');
    const [daySchedules, setDaySchedules] = useState([]);

    // Fetch Day Schedules on Date change
    const [committedExpenses, setCommittedExpenses] = useState([]);
    const [selectedExpenseForView, setSelectedExpenseForView] = useState(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);

    const fetchCommittedExpenses = async () => {
        if (!selectedEmployeeId || !date) {
            setCommittedExpenses([]);
            return;
        }
        try {
            const res = await api.get(`/employee-expense/admin/${selectedEmployeeId}`);
            if (res.data.success) {
                const matched = res.data.data.filter(e => {
                    const eDate = e.date ? new Date(e.date).toISOString().split('T')[0] : '';
                    return eDate === date;
                });
                setCommittedExpenses(matched);
            }
        } catch (err) {
            console.error("Failed to fetch committed expenses", err);
            setCommittedExpenses([]);
        }
    };

    useEffect(() => {
        if (!date) return;
        const fetchDaySchedules = async () => {
            try {
                const res = await api.get(`/schedule-master?date=${date}`);
                if (res.data.success) {
                    setDaySchedules(res.data.data);
                } else {
                    setDaySchedules([]);
                }
            } catch (err) {
                console.error("Failed to fetch day schedules", err);
                setDaySchedules([]);
            }
        };
        fetchDaySchedules();
    }, [date]);

    useEffect(() => {
        fetchCommittedExpenses();
    }, [selectedEmployeeId, date]);

    // Filter employees down to scheduled operatives/helpers on this date
    const scheduledEmployees = useMemo(() => {
        const ids = new Set();
        daySchedules.forEach(s => {
            if (s.operative?._id) ids.add(s.operative._id);
            else if (s.operative) ids.add(s.operative);
        });
        return employees.filter(e => ids.has(e._id));
    }, [daySchedules, employees]);

    // All schedules for the selected employee on this day
    const employeeSchedules = useMemo(() => {
        if (!selectedEmployeeId) return [];
        return daySchedules.filter(s => {
            const opId = s.operative?._id || s.operative;
            return opId === selectedEmployeeId;
        });
    }, [daySchedules, selectedEmployeeId]);

    // Active schedule fallback for headers and non-multiple logic
    const activeSchedule = employeeSchedules.length > 0 ? employeeSchedules[0] : null;

    // Prefill Client & Site when employeeSchedules changes
    useEffect(() => {
        if (employeeSchedules.length > 0) {
            setClientSites(employeeSchedules.map(sch => ({
                clientId: sch.client?._id || sch.client,
                siteId: sch.site?._id || sch.site,
                ledger: sch.ledger || '',
                files: { photos: [], data: [], dailyReports: [], drawing: [] }
            })));
        } else {
            setClientSites([{
                clientId: '',
                siteId: '',
                ledger: '',
                files: { photos: [], data: [], dailyReports: [], drawing: [] }
            }]);
        }
    }, [employeeSchedules]);

    // Files State
    const [files, setFiles] = useState({ photos: [], data: [], dailyReports: [] });
    const [previews, setPreviews] = useState({ photos: [], data: [], dailyReports: [] });
    const [expenseFiles, setExpenseFiles] = useState({ breakfast: [], lunch: [], dinner: [], petrol: [] });
    const [expensePreviews, setExpensePreviews] = useState({ breakfast: [], lunch: [], dinner: [], petrol: [] });

    // Computed Logic
    const selectedEmployee = employees.find(e => e._id === selectedEmployeeId);
    
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

    const addClientSite = () => setClientSites([...clientSites, { clientId: '', siteId: '', ledger: '', files: { photos: [], data: [], dailyReports: [], drawing: [] } }]);
    const removeClientSite = (idx) => setClientSites(clientSites.filter((_, i) => i !== idx));
    const updateClientSite = (idx, field, val) => {
        const updated = [...clientSites];
        updated[idx][field] = val;
        if (field === 'clientId') {
            updated[idx].siteId = ''; 
            updated[idx].ledger = '';
        }
        if (field === 'siteId') {
            const matchingSchedules = employeeSchedules.filter(s => {
                const sSiteId = s.site?._id || s.site;
                return sSiteId === val;
            });
            if (matchingSchedules.length > 0) {
                updated[idx].ledger = matchingSchedules[0].ledger || '';
            } else {
                updated[idx].ledger = '';
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
            formData.append('expenses', JSON.stringify(standardExpenses));
            formData.append('fuelType', fuelType);
            
            const otherExpsToSend = [];
            otherExpenses.forEach((exp, idx) => {
                if (exp.expenseName && exp.amount) {
                    const mappedIdx = otherExpsToSend.length;
                    otherExpsToSend.push({ expenseName: exp.expenseName, amount: exp.amount });
                    if (exp.files) {
                        exp.files.forEach(f => formData.append(`otherExpense_${mappedIdx}`, f));
                    }
                }
            });
            formData.append('otherExpensesList', JSON.stringify(otherExpsToSend));

            // Standard Expense Files
            Object.keys(expenseFiles).forEach(key => {
                expenseFiles[key].forEach(f => formData.append(`expense_${key}`, f));
            });
            // Format allocations for backend
            const allocations = clientSites.filter(cs => cs.clientId && cs.siteId);
            formData.append('clientSites', JSON.stringify(allocations.map(a => ({ clientId: a.clientId, siteId: a.siteId, ledger: a.ledger || '' }))));

            // Add Files site-wise
            allocations.forEach((site, idx) => {
                const fullSite = sites.find(s => s._id === site.siteId);
                const fullClient = clients.find(c => c._id === site.clientId);
                if (fullSite) {
                    const cShortId = (fullClient?.clientId || 'unknown').toLowerCase();
                    const sName = (fullSite?.siteName || 'unknown').trim().replace(/\s+/g, '_').replace(/[^a-z0-9]/gi, '_').toLowerCase();
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
                formData.append('siteSubfolder', `${site?.siteId || '0000'}-${(site?.siteName || 'unknown').trim().replace(/\s+/g, '_').replace(/[^a-z0-9]/gi, '_').toLowerCase()}`);
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
                // This prevents race conditions where the GET request might hit a stale read
                setTimeout(() => {
                    onRefresh();
                    fetchCommittedExpenses();
                }, 1000);
                
                // 3. Reset form
                setStandardExpenses({ breakfast: '', lunch: '', dinner: '', petrol: '' });
                setOtherExpenses([]);
                setClientSites([{ clientId: '', siteId: '', files: { photos: [], data: [], dailyReports: [], drawing: [] } }]);
                setNotes('');
                setAttendance('Present');
                setAttendanceRemark('');
            }
        } catch (err) {
            toast({ title: 'Error', description: err.response?.data?.message || 'Save failed', status: 'error' });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <VStack spacing={8} align="stretch">
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
                                placeholder={scheduledEmployees.length > 0 ? "Choose Employee" : "No Employees Scheduled"} 
                                value={selectedEmployeeId} 
                                onChange={(e) => setSelectedEmployeeId(e.target.value)}
                                borderRadius="xl"
                                isDisabled={scheduledEmployees.length === 0}
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
                                                        <Input type="number" value={standardExpenses[expName]} onChange={(e) => setStandardExpenses({...standardExpenses, [expName]: e.target.value})} borderRadius="lg" placeholder="0" bg="white" />
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
                                {activeSchedule && activeSchedule.ledger && (
                                    <Box w="full" px={4} py={2} bg="teal.50" borderRadius="xl" border="1px solid" borderColor="teal.200">
                                        <Text fontSize="xs" color="teal.800" fontWeight="bold">
                                            📅 Scheduled Ledger for selected date: <span style={{ textDecoration: 'underline' }}>{activeSchedule.ledger}</span>
                                        </Text>
                                    </Box>
                                )}
                                {clientSites.map((row, idx) => (
                                    <VStack key={idx} w="full" bg="gray.50" p={4} borderRadius="xl" align="stretch" borderLeft="4px solid" borderColor="purple.300">
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
                                                <FormLabel fontSize="10px" fontWeight="bold">Ledger</FormLabel>
                                                <Select 
                                                    size="sm" 
                                                    placeholder="Select Ledger" 
                                                    value={row.ledger} 
                                                    onChange={(e) => updateClientSite(idx, 'ledger', e.target.value)} 
                                                    bg="white" 
                                                    borderRadius="lg"
                                                >
                                                    {(() => {
                                                        const options = new Set();
                                                        const matchingSchedules = employeeSchedules.filter(s => {
                                                            const sSiteId = s.site?._id || s.site;
                                                            return sSiteId === row.siteId;
                                                        });
                                                        matchingSchedules.forEach(sch => {
                                                            if (sch.ledger) options.add(sch.ledger);
                                                        });
                                                        if (options.size === 0) {
                                                            const siteLedgerItems = sites.find(s => s._id === row.siteId)?.ledgerItems || [];
                                                            siteLedgerItems.forEach(item => {
                                                                if (item.ledger) options.add(item.ledger);
                                                            });
                                                        }
                                                        return Array.from(options).map(opt => {
                                                            const isScheduled = matchingSchedules.some(sch => sch.ledger === opt);
                                                            return (
                                                                <option key={opt} value={opt}>
                                                                    {opt} {isScheduled ? '(Scheduled)' : ''}
                                                                </option>
                                                            );
                                                        });
                                                    })()}
                                                </Select>
                                            </FormControl>
                                            {clientSites.length > 1 && (
                                                <IconButton size="sm" colorScheme="red" variant="ghost" icon={<FaTrash />} onClick={() => removeClientSite(idx)} />
                                            )}
                                        </HStack>
                                        
                                        {/* Site Specific Uploads */}
                                        <SimpleGrid columns={4} spacing={3} pt={2}>
                                            <VStack align="start" spacing={1}>
                                                <Text fontSize="9px" fontWeight="black" color="blue.600">PHOTOS ({row.files.photos.length})</Text>
                                                <Input type="file" multiple accept="image/*" onChange={(e) => handleSiteFileChange(idx, e, 'photos')} size="xs" p={0} variant="unstyled" />
                                            </VStack>
                                            <VStack align="start" spacing={1}>
                                                <Text fontSize="9px" fontWeight="black" color="orange.600">REPORTS ({row.files.dailyReports.length})</Text>
                                                <Input type="file" multiple accept=".pdf,.doc,.docx" onChange={(e) => handleSiteFileChange(idx, e, 'dailyReports')} size="xs" p={0} variant="unstyled" />
                                            </VStack>
                                            <VStack align="start" spacing={1}>
                                                <Text fontSize="9px" fontWeight="black" color="purple.600">DATA ({row.files.data.length})</Text>
                                                <Input type="file" multiple accept=".xls,.xlsx,.pdf" onChange={(e) => handleSiteFileChange(idx, e, 'data')} size="xs" p={0} variant="unstyled" />
                                            </VStack>
                                            <VStack align="start" spacing={1}>
                                                <Text fontSize="9px" fontWeight="black" color="teal.600">DRAWING ({row.files.drawing?.length || 0})</Text>
                                                <Input type="file" multiple accept=".pdf,.dwg,.dxf,image/*" onChange={(e) => handleSiteFileChange(idx, e, 'drawing')} size="xs" p={0} variant="unstyled" />
                                            </VStack>
                                        </SimpleGrid>
                                    </VStack>
                                ))}
                            </VStack>
                        </CardBody>
                    </Card>
                </VStack>

                {/* Right Side: File Uploads & Summary */}
                <VStack spacing={8} align="stretch">
                    {/* Attendance Tracking */}
                    <Card borderRadius="2xl" shadow="sm" border="1px solid" borderColor="gray.100">
                        <CardBody p={6}>
                            <VStack align="stretch" spacing={4}>
                                <Heading size="xs" color="blue.700" textTransform="uppercase">Attendance Status</Heading>
                                <FormControl>
                                    <Select 
                                        value={attendance} 
                                        onChange={(e) => setAttendance(e.target.value)}
                                        borderRadius="lg"
                                        bg="white"
                                    >
                                        <option value="Present">Present</option>
                                        <option value="Half Day">Half Day</option>
                                        <option value="Absent">Absent</option>
                                    </Select>
                                </FormControl>
                                
                                {attendance === 'Absent' && (
                                    <FormControl isRequired>
                                        <FormLabel fontSize="xs" fontWeight="bold">Reason for Absence</FormLabel>
                                        <Input 
                                            value={attendanceRemark} 
                                            onChange={(e) => setAttendanceRemark(e.target.value)} 
                                            bg="white" 
                                            borderRadius="lg" 
                                            placeholder="Why were you absent?" 
                                        />
                                    </FormControl>
                                )}
                            </VStack>
                        </CardBody>
                    </Card>

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
                            <TableContainer>
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
                                                    <HStack justify="center">
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
                                                                    {cs.files.photos.map((photo, pIdx) => (
                                                                        <Button 
                                                                            key={pIdx} 
                                                                            size="xs" 
                                                                            variant="outline" 
                                                                            colorScheme="blue" 
                                                                            leftIcon={<FaCamera />}
                                                                            onClick={() => window.open(`${api.defaults.baseURL?.replace('/api', '')}/${photo}`, '_blank')}
                                                                        >
                                                                            Photo {pIdx + 1}
                                                                        </Button>
                                                                    ))}
                                                                </HStack>
                                                            </VStack>
                                                        ) : null}

                                                        {/* Reports */}
                                                        {cs.files?.dailyReports && cs.files.dailyReports.length > 0 ? (
                                                            <VStack align="start" spacing={1} width="full" mt={1}>
                                                                <Text fontSize="10px" fontWeight="bold" color="gray.500">📋 Daily Reports ({cs.files.dailyReports.length}):</Text>
                                                                <HStack spacing={2} wrap="wrap">
                                                                    {cs.files.dailyReports.map((report, rIdx) => (
                                                                        <Button 
                                                                            key={rIdx} 
                                                                            size="xs" 
                                                                            variant="outline" 
                                                                            colorScheme="teal" 
                                                                            leftIcon={<FaFileAlt />}
                                                                            onClick={() => window.open(`${api.defaults.baseURL?.replace('/api', '')}/${report}`, '_blank')}
                                                                        >
                                                                            Report {rIdx + 1}
                                                                        </Button>
                                                                    ))}
                                                                </HStack>
                                                            </VStack>
                                                        ) : null}

                                                        {/* Drawings */}
                                                        {cs.files?.drawing && cs.files.drawing.length > 0 ? (
                                                            <VStack align="start" spacing={1} width="full" mt={1}>
                                                                <Text fontSize="10px" fontWeight="bold" color="gray.500">🎨 Drawings ({cs.files.drawing.length}):</Text>
                                                                <HStack spacing={2} wrap="wrap">
                                                                    {cs.files.drawing.map((dwg, dwgIdx) => (
                                                                        <Button 
                                                                            key={dwgIdx} 
                                                                            size="xs" 
                                                                            variant="outline" 
                                                                            colorScheme="purple" 
                                                                            leftIcon={<FaFileAlt />}
                                                                            onClick={() => window.open(`${api.defaults.baseURL?.replace('/api', '')}/${dwg}`, '_blank')}
                                                                        >
                                                                            Drawing {dwgIdx + 1}
                                                                        </Button>
                                                                    ))}
                                                                </HStack>
                                                            </VStack>
                                                        ) : null}

                                                        {/* Data files */}
                                                        {cs.files?.data && cs.files.data.length > 0 ? (
                                                            <VStack align="start" spacing={1} width="full" mt={1}>
                                                                <Text fontSize="10px" fontWeight="bold" color="gray.500">💾 Data Files ({cs.files.data.length}):</Text>
                                                                <HStack spacing={2} wrap="wrap">
                                                                    {cs.files.data.map((dat, datIdx) => (
                                                                        <Button 
                                                                            key={datIdx} 
                                                                            size="xs" 
                                                                            variant="outline" 
                                                                            colorScheme="orange" 
                                                                            leftIcon={<FaFileAlt />}
                                                                            onClick={() => window.open(`${api.defaults.baseURL?.replace('/api', '')}/${dat}`, '_blank')}
                                                                        >
                                                                            Data File {datIdx + 1}
                                                                        </Button>
                                                                    ))}
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
                                            <VStack align="start" spacing={0} p={3} bg="gray.100" borderRadius="xl">
                                                <Text fontSize="xs" color="gray.500">Breakfast</Text>
                                                <Text fontWeight="black" fontSize="lg">₹{Number(selectedExpenseForView.expenses?.breakfast || 0).toLocaleString()}</Text>
                                            </VStack>
                                            <VStack align="start" spacing={0} p={3} bg="gray.100" borderRadius="xl">
                                                <Text fontSize="xs" color="gray.500">Lunch</Text>
                                                <Text fontWeight="black" fontSize="lg">₹{Number(selectedExpenseForView.expenses?.lunch || 0).toLocaleString()}</Text>
                                            </VStack>
                                            <VStack align="start" spacing={0} p={3} bg="gray.100" borderRadius="xl">
                                                <Text fontSize="xs" color="gray.500">Dinner</Text>
                                                <Text fontWeight="black" fontSize="lg">₹{Number(selectedExpenseForView.expenses?.dinner || 0).toLocaleString()}</Text>
                                            </VStack>
                                            <VStack align="start" spacing={0} p={3} bg="gray.100" borderRadius="xl">
                                                <Text fontSize="xs" color="gray.500">Fuel ({selectedExpenseForView.expenses?.fuelType || 'Petrol'})</Text>
                                                <Text fontWeight="black" fontSize="lg">₹{Number(selectedExpenseForView.expenses?.petrol || 0).toLocaleString()}</Text>
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

// ── Money Transfer Module (Corrected Balance Logic) ────────────────────────
const MoneyTransferSection = ({ employees, onRefresh }) => {
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

    const fetchCommittedTransfers = async () => {
        try {
            const res = await api.get('/employee-transfer');
            if (res.data.success) {
                const matched = res.data.data.filter(t => {
                    const tDate = t.date ? new Date(t.date).toISOString().split('T')[0] : '';
                    return tDate === transferDate;
                });
                setCommittedTransfers(matched);
            }
        } catch (err) {
            console.error("Failed to fetch committed transfers", err);
        }
    };

    useEffect(() => {
        if (!transferDate) return;
        const fetchDaySchedules = async () => {
            try {
                const res = await api.get(`/schedule-master?date=${transferDate}`);
                if (res.data.success) {
                    setDaySchedules(res.data.data);
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

        stagedEntries.forEach((entry, index) => {
            if (index === editIndex) return; 
            if (balances[entry.employee1] !== undefined) balances[entry.employee1] -= entry.amount;
            if (balances[entry.employee2] !== undefined) balances[entry.employee2] += entry.amount;
        });

        return balances;
    }, [employees, stagedEntries, editIndex]);

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

        const e1 = employees.find(e => e._id === employee1);
        const e2 = employees.find(e => e._id === employee2);

        const newEntry = {
            employee1,
            employee2,
            employee1Name: e1?.name,
            employee2Name: e2?.name,
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
                // Refresh first
                await onRefresh();
                await fetchCommittedTransfers();
                // Then clear
                setStagedEntries([]);
            }
        } catch (err) {
            toast({ title: 'Error', description: err.response?.data?.message || 'Save failed', status: 'error' });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <VStack spacing={8} align="stretch">
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

                        <HStack spacing={4} align="flex-end" w="full" flexWrap="wrap">

                        <FormControl isRequired flex={2}>
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
                                {employees.map(e => (
                                    <option key={e._id} value={e._id} disabled={e._id === formData.employee2}>
                                        {e.name} (₹{tempBalances[e._id]?.toLocaleString()})
                                    </option>
                                ))}
                            </Select>
                        </FormControl>

                        <Box pb={3} color="gray.300"><Icon as={FaArrowRight} /></Box>

                        <FormControl isRequired flex={2}>
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
                                {employees.map(e => (
                                    <option key={e._id} value={e._id} disabled={e._id === formData.employee1}>
                                        {e.name} (₹{tempBalances[e._id]?.toLocaleString()})
                                    </option>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl isRequired flex={1}>
                            <FormLabel fontSize="xs" fontWeight="black" color="gray.500" textTransform="uppercase">Amount (₹)</FormLabel>
                            <InputGroup size="lg">
                                <InputLeftElement><Icon as={FaRupeeSign} color="gray.400" /></InputLeftElement>
                                <Input type="number" placeholder="0" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} borderRadius="xl" bg="gray.50" border="1px solid" borderColor="gray.200" />
                            </InputGroup>
                        </FormControl>

                        <Button colorScheme="blue" size="lg" px={10} borderRadius="xl" onClick={handleAddEntry} leftIcon={editIndex > -1 ? <FaCheckCircle /> : <FaPlus />} shadow="lg">
                            {editIndex > -1 ? 'Update' : 'Add'}
                        </Button>
                    </HStack>
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
                        <TableContainer>
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
                                                    <IconButton size="sm" colorScheme="blue" variant="ghost" icon={<FaEdit />} onClick={() => handleEdit(idx)} borderRadius="lg" isDisabled={editIndex > -1 && editIndex !== idx} />
                                                    <IconButton size="sm" colorScheme="red" variant="ghost" icon={<FaTrash />} onClick={() => handleRemove(idx)} borderRadius="lg" isDisabled={editIndex > -1 && editIndex !== idx} />
                                                </HStack>
                                            </Td>
                                        </Tr>
                                    ))}
                                </Tbody>
                            </Table>
                        </TableContainer>
                    </Card>

                    <Button mt={8} colorScheme="green" size="xl" w="full" h="70px" borderRadius="2xl" onClick={handleSubmitAll} isLoading={isSaving} leftIcon={<FaCheckCircle />} fontSize="xl" shadow="2xl">
                        Save & Commit All {stagedEntries.length} Transfers
                    </Button>
                </Box>
            )}

            {/* Committed Transfers List */}
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
                        <TableContainer>
                            <Table variant="simple">
                                <Thead bg="teal.50">
                                    <Tr>
                                        <Th color="teal.700">Employee From (Sender)</Th>
                                        <Th color="teal.700">Employee To (Receiver)</Th>
                                        <Th isNumeric color="teal.700">Amount</Th>
                                    </Tr>
                                </Thead>
                                <Tbody bg="white">
                                    {committedTransfers.map((t) => (
                                        <Tr key={t._id} _hover={{ bg: "teal.50" }} transition="background 0.2s">
                                            <Td fontWeight="bold" color="red.500">
                                                <HStack><Icon as={FaUserTie} /><Text>{t.giver?.name || 'Unknown'}</Text></HStack>
                                            </Td>
                                            <Td fontWeight="bold" color="green.500">
                                                <HStack><Icon as={FaUserTie} /><Text>{t.taker?.name || 'Unknown'}</Text></HStack>
                                            </Td>
                                            <Td isNumeric fontWeight="black" fontSize="lg" color="teal.600">₹{t.amount?.toLocaleString()}</Td>
                                        </Tr>
                                    ))}
                                </Tbody>
                            </Table>
                        </TableContainer>
                    </Card>
                )}
            </Box>
        </VStack>
    );
};

export default EmployeeExpensesModule;
