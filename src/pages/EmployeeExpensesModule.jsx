import React, { useState, useEffect, useMemo } from 'react';
import {
    Box, Container, VStack, HStack, Text, Heading, SimpleGrid, Card, CardBody, 
    Button, IconButton, Icon, Badge, Select, Input, InputGroup, InputLeftElement, 
    Table, Thead, Tbody, Tr, Th, Td, TableContainer, Divider, useToast, 
    Tabs, TabList, TabPanels, Tab, TabPanel, FormControl, FormLabel,
    Flex, Spinner, Center, Tooltip, CloseButton, Image, List, ListItem, ListIcon
} from '@chakra-ui/react';
import { 
    FaMoneyBillWave, FaExchangeAlt, FaPlus, FaTrash, 
    FaUserTie, FaCheckCircle, FaEdit, FaRupeeSign, FaArrowRight,
    FaCalendarAlt, FaUtensils, FaGasPump, FaBuilding, FaCamera, FaFileAlt, FaFolderOpen
} from 'react-icons/fa';
import api from '../api/axios';

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
        files: { photos: [], data: [], dailyReports: [] } 
    }]);
    const [notes, setNotes] = useState('');

    // Files State
    const [files, setFiles] = useState({ photos: [], data: [], dailyReports: [] });
    const [previews, setPreviews] = useState({ photos: [], data: [], dailyReports: [] });

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
    const addOtherExpense = () => setOtherExpenses([...otherExpenses, { expenseName: '', amount: '' }]);
    const removeOtherExpense = (idx) => setOtherExpenses(otherExpenses.filter((_, i) => i !== idx));
    const updateOtherExpense = (idx, field, val) => {
        const updated = [...otherExpenses];
        updated[idx][field] = val;
        setOtherExpenses(updated);
    };

    const addClientSite = () => setClientSites([...clientSites, { clientId: '', siteId: '', files: { photos: [], data: [], dailyReports: [] } }]);
    const removeClientSite = (idx) => setClientSites(clientSites.filter((_, i) => i !== idx));
    const updateClientSite = (idx, field, val) => {
        const updated = [...clientSites];
        updated[idx][field] = val;
        if (field === 'clientId') updated[idx].siteId = ''; 
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

    const handleSubmit = async () => {
        if (!selectedEmployeeId) {
            toast({ title: 'Select Employee', status: 'warning', position: 'top' });
            return;
        }

        setIsSaving(true);
        try {
            const formData = new FormData();
            formData.append('employeeId', selectedEmployeeId);
            formData.append('date', date);
            formData.append('notes', notes);
            formData.append('expenses', JSON.stringify(standardExpenses));
            formData.append('otherExpensesList', JSON.stringify(otherExpenses.filter(e => e.expenseName && e.amount)));
            // Format allocations for backend
            const allocations = clientSites.filter(cs => cs.clientId && cs.siteId);
            formData.append('clientSites', JSON.stringify(allocations.map(a => ({ clientId: a.clientId, siteId: a.siteId }))));

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
                
                site.files.photos.forEach(f => formData.append(`site_${idx}_photos`, f));
                site.files.dailyReports.forEach(f => formData.append(`site_${idx}_dailyReports`, f));
                site.files.data.forEach(f => formData.append(`site_${idx}_data`, f));
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
                }, 1000);
                
                // 3. Reset form
                setStandardExpenses({ breakfast: '', lunch: '', dinner: '', petrol: '' });
                setOtherExpenses([]);
                setClientSites([{ clientId: '', siteId: '', files: { photos: [], data: [], dailyReports: [] } }]);
                setNotes('');
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
                                placeholder="Choose Employee" 
                                value={selectedEmployeeId} 
                                onChange={(e) => setSelectedEmployeeId(e.target.value)}
                                borderRadius="xl"
                            >
                                {employees.map(e => (
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
                                <SimpleGrid columns={2} spacing={4} w="full">
                                    <FormControl>
                                        <FormLabel fontSize="xs" fontWeight="bold">Breakfast</FormLabel>
                                        <InputGroup>
                                            <InputLeftElement><Icon as={FaRupeeSign} color="gray.400" fontSize="xs" /></InputLeftElement>
                                            <Input type="number" value={standardExpenses.breakfast} onChange={(e) => setStandardExpenses({...standardExpenses, breakfast: e.target.value})} borderRadius="lg" placeholder="0" />
                                        </InputGroup>
                                    </FormControl>
                                    <FormControl>
                                        <FormLabel fontSize="xs" fontWeight="bold">Lunch</FormLabel>
                                        <InputGroup>
                                            <InputLeftElement><Icon as={FaRupeeSign} color="gray.400" fontSize="xs" /></InputLeftElement>
                                            <Input type="number" value={standardExpenses.lunch} onChange={(e) => setStandardExpenses({...standardExpenses, lunch: e.target.value})} borderRadius="lg" placeholder="0" />
                                        </InputGroup>
                                    </FormControl>
                                    <FormControl>
                                        <FormLabel fontSize="xs" fontWeight="bold">Dinner</FormLabel>
                                        <InputGroup>
                                            <InputLeftElement><Icon as={FaRupeeSign} color="gray.400" fontSize="xs" /></InputLeftElement>
                                            <Input type="number" value={standardExpenses.dinner} onChange={(e) => setStandardExpenses({...standardExpenses, dinner: e.target.value})} borderRadius="lg" placeholder="0" />
                                        </InputGroup>
                                    </FormControl>
                                    <FormControl>
                                        <FormLabel fontSize="xs" fontWeight="bold">Petrol</FormLabel>
                                        <InputGroup>
                                            <InputLeftElement><Icon as={FaGasPump} color="gray.400" fontSize="xs" /></InputLeftElement>
                                            <Input type="number" value={standardExpenses.petrol} onChange={(e) => setStandardExpenses({...standardExpenses, petrol: e.target.value})} borderRadius="lg" placeholder="0" />
                                        </InputGroup>
                                    </FormControl>
                                </SimpleGrid>
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
                                    <HStack key={idx} w="full" bg="gray.50" p={2} borderRadius="xl">
                                        <Input placeholder="Expense Name" value={row.expenseName} onChange={(e) => updateOtherExpense(idx, 'expenseName', e.target.value)} bg="white" size="sm" borderRadius="lg" />
                                        <InputGroup size="sm" maxW="150px">
                                            <InputLeftElement><Icon as={FaRupeeSign} color="gray.400" /></InputLeftElement>
                                            <Input type="number" placeholder="Amount" value={row.amount} onChange={(e) => updateOtherExpense(idx, 'amount', e.target.value)} bg="white" borderRadius="lg" />
                                        </InputGroup>
                                        <IconButton size="sm" colorScheme="red" variant="ghost" icon={<FaTrash />} onClick={() => removeOtherExpense(idx)} />
                                    </HStack>
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
                                {clientSites.map((row, idx) => (
                                    <VStack key={idx} w="full" bg="gray.50" p={4} borderRadius="xl" align="stretch" borderLeft="4px solid" borderColor="purple.300">
                                        <HStack align="flex-end">
                                            <FormControl flex={1}>
                                                <FormLabel fontSize="10px" fontWeight="bold">Client</FormLabel>
                                                <Select size="sm" placeholder="Select Client" value={row.clientId} onChange={(e) => updateClientSite(idx, 'clientId', e.target.value)} bg="white" borderRadius="lg">
                                                    {clients.map(c => <option key={c._id} value={c._id}>{c.clientName}</option>)}
                                                </Select>
                                            </FormControl>
                                            <FormControl flex={1}>
                                                <FormLabel fontSize="10px" fontWeight="bold">Site</FormLabel>
                                                <Select size="sm" placeholder="Select Site" value={row.siteId} onChange={(e) => updateClientSite(idx, 'siteId', e.target.value)} bg="white" borderRadius="lg">
                                                    {sites.filter(s => s.client === row.clientId || s.client?._id === row.clientId).map(s => (
                                                        <option key={s._id} value={s._id}>{s.siteName}</option>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                            {clientSites.length > 1 && (
                                                <IconButton size="sm" colorScheme="red" variant="ghost" icon={<FaTrash />} onClick={() => removeClientSite(idx)} />
                                            )}
                                        </HStack>
                                        
                                        {/* Site Specific Uploads */}
                                        <SimpleGrid columns={3} spacing={3} pt={2}>
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
                                        </SimpleGrid>
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
                                    _hover={{ transform: 'translateY(-2px)' }}
                                >
                                    Submit Daily Expenses
                                </Button>
                            </VStack>
                        </CardBody>
                    </Card>
                </VStack>
            </SimpleGrid>
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
        </VStack>
    );
};

export default EmployeeExpensesModule;
