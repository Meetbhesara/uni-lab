import React, { useState, useEffect } from 'react';
import {
    Box, Table, Thead, Tbody, Tr, Th, Td, TableContainer,
    Button, Spinner, Center, Text, HStack, VStack, Icon, useToast, Heading, Flex, IconButton,
    Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
    FormControl, FormLabel, Input, Select as ChakraSelect, SimpleGrid, useDisclosure,
    InputGroup, InputLeftElement, Divider, InputLeftAddon, Badge,
    Popover, PopoverTrigger, PopoverContent, PopoverBody
} from '@chakra-ui/react';
import { FaDownload, FaFileExcel, FaPlus, FaTrash, FaCalendarAlt, FaClipboardCheck, FaMapMarkerAlt, FaCoffee, FaHamburger, FaUtensils, FaGasPump, FaStickyNote, FaMoneyBillWave, FaRupeeSign, FaPaperclip, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import api from '../api/axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

const AdminEmployeeExpenses = ({ employeeId, employeeName }) => {
    const [expenses, setExpenses] = useState([]);
    const [transfers, setTransfers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [employeeDetails, setEmployeeDetails] = useState(null);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); // 1-12
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [yearPageStart, setYearPageStart] = useState(Math.floor(new Date().getFullYear() / 20) * 20);
    const toast = useToast();

    // Configuration flag for local vs NAS saving
    const useNas = false;

    const [sites, setSites] = useState([]);
    const [employees, setEmployees] = useState([]);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [submitting, setSubmitting] = useState(false);
    const [expenseForm, setExpenseForm] = useState({
        date: new Date().toISOString().slice(0, 10),
        attendance: 'Present',
        breakfast: '',
        lunch: '',
        dinner: '',
        petrol: '',
        notes: '',
        attendanceRemark: ''
    });
    const [clientSites, setClientSites] = useState([{ 
        clientId: '', 
        siteId: '', 
        files: { photos: [], data: [], dailyReports: [] } 
    }]);

    const [otherExpenses, setOtherExpenses] = useState([]);
    const [givenTo, setGivenTo] = useState([]);
    const [receivedFrom, setReceivedFrom] = useState([]);

    // Total Calculation
    const totals = React.useMemo(() => {
        const stdTotal = (Number(expenseForm.breakfast) || 0) + 
                         (Number(expenseForm.lunch) || 0) + 
                         (Number(expenseForm.dinner) || 0) + 
                         (Number(expenseForm.petrol) || 0);
        const otherTotal = otherExpenses.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
        const total = stdTotal + otherTotal;
        const remaining = (employeeDetails?.totalAmount || 0) - total;
        return { stdTotal, otherTotal, total, remaining };
    }, [expenseForm, otherExpenses, employeeDetails]);

    const fetchExpenses = async () => {
        if (!employeeId) return;
        setLoading(true);
        try {
            const [expRes, empRes, trRes] = await Promise.all([
                api.get(`/employee-expense/admin/${employeeId}`),
                api.get(`/employee-master/${employeeId}`),
                api.get(`/employee-transfer`)
            ]);
            if (expRes.data.success) setExpenses(expRes.data.data);
            if (empRes.data.success) setEmployeeDetails(empRes.data.data);
            if (trRes.data.success) {
                // Filter only transfers involving this employee
                const myTransfers = trRes.data.data.filter(
                    t => (t.giver?._id || t.giver) === employeeId ||
                         (t.taker?._id || t.taker) === employeeId
                );
                setTransfers(myTransfers);
            }
        } catch (err) {
            console.error("Error fetching employee expenses", err);
            toast({ title: 'Error loading expenses', status: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const fetchSites = async () => {
        try {
            const res = await api.get('/site-master');
            if (res.data.success) setSites(res.data.data);
        } catch (err) {
            console.error('Failed to fetch sites', err);
        }
    };

    const fetchEmployees = async () => {
        try {
            const res = await api.get('/employee-master');
            if (res.data.success) {
                // exclude current employee
                setEmployees(res.data.data.filter(e => e._id !== employeeId));
            }
        } catch (err) { console.error('Failed to fetch employees', err); }
    };

    useEffect(() => {
        fetchExpenses();
        fetchSites();
        fetchEmployees();
    }, [employeeId, toast]);



    const handleFormChange = (e) => {
        setExpenseForm({ ...expenseForm, [e.target.name]: e.target.value });
    };

    const addOtherExpenseRow = () => setOtherExpenses([...otherExpenses, { expenseName: '', amount: '' }]);
    const updateOtherExpense = (idx, field, val) => {
        const arr = [...otherExpenses];
        arr[idx][field] = val;
        setOtherExpenses(arr);
    };
    const removeOtherExpense = (idx) => setOtherExpenses(otherExpenses.filter((_, i) => i !== idx));

    const addGivenToRow = () => setGivenTo([...givenTo, { employeeRef: '', amount: '' }]);
    const updateGivenTo = (idx, field, val) => {
        const arr = [...givenTo];
        arr[idx][field] = val;
        setGivenTo(arr);
    };
    const removeGivenToRow = (idx) => setGivenTo(givenTo.filter((_, i) => i !== idx));

    const addReceivedFromRow = () => setReceivedFrom([...receivedFrom, { employeeRef: '', amount: '' }]);
    const updateReceivedFrom = (idx, field, val) => {
        const arr = [...receivedFrom];
        arr[idx][field] = val;
        setReceivedFrom(arr);
    };
    const removeReceivedFromRow = (idx) => setReceivedFrom(receivedFrom.filter((_, i) => i !== idx));

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

    const removeSiteFile = (siteIdx, category, fileIdx) => {
        const updated = [...clientSites];
        updated[siteIdx].files[category] = updated[siteIdx].files[category].filter((_, i) => i !== fileIdx);
        setClientSites(updated);
    };

    const handleAddExpense = async () => {
        if (!employeeId) return;
        setSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('employeeId', employeeId);
            formData.append('date', expenseForm.date);
            formData.append('attendance', expenseForm.attendance);
            formData.append('attendanceRemark', expenseForm.attendanceRemark);
            formData.append('notes', expenseForm.notes);
            formData.append('givenTo', JSON.stringify(givenTo.filter(g => g.employeeRef && g.amount)));
            formData.append('receivedFrom', JSON.stringify(receivedFrom.filter(r => r.employeeRef && r.amount)));
            formData.append('expenses', JSON.stringify({
                breakfast: Number(expenseForm.breakfast) || 0,
                lunch: Number(expenseForm.lunch) || 0,
                dinner: Number(expenseForm.dinner) || 0,
                petrol: Number(expenseForm.petrol) || 0
            }));
            formData.append('otherExpensesList', JSON.stringify(otherExpenses.map(o => ({ expenseName: o.expenseName, amount: Number(o.amount) })).filter(o => o.expenseName && o.amount)));
            
            // Format allocations for backend
            const allocations = clientSites.filter(cs => cs.clientId && cs.siteId);
            formData.append('clientSites', JSON.stringify(allocations.map(a => ({ clientId: a.clientId, siteId: a.siteId }))));

            // Add Files site-wise
            allocations.forEach((site, idx) => {
                const fullSite = sites.find(s => s._id === site.siteId);
                const fullClient = fullSite?.client;
                if (fullSite) {
                    const cShortId = (fullClient?.clientId || 'unknown').toLowerCase();
                    const sName = (fullSite?.siteName || 'unknown').trim().replace(/[^a-z0-9]/gi, '_').toLowerCase();
                    const sId = fullSite?.siteId || '0000';
                    formData.append(`site_${idx}_clientShortId`, cShortId);
                    formData.append(`site_${idx}_siteSubfolder`, `${sId}-${sName}`);
                }
                
                site.files.photos.forEach(f => formData.append(`site_${idx}_photos`, f));
                site.files.dailyReports.forEach(f => formData.append(`site_${idx}_dailyReports`, f));
                site.files.data.forEach(f => formData.append(`site_${idx}_data`, f));
            });

            // Send metadata about the first site as fallback
            if (allocations[0]) {
                const fullSite = sites.find(s => s._id === allocations[0].siteId);
                const fullClient = fullSite?.client;
                formData.append('clientShortId', (fullClient?.clientId || 'unknown').toLowerCase());
                formData.append('siteSubfolder', `${fullSite?.siteId || '0000'}-${(fullSite?.siteName || 'unknown').trim().replace(/[^a-z0-9]/gi, '_').toLowerCase()}`);
            }

            const res = await api.post('/employee-expense/admin/add-expense', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (res.data.success) {
                toast({ title: 'Success', description: 'Expense added!', status: 'success', duration: 2000 });
                if (res.data.updatedEmployee) setEmployeeDetails(res.data.updatedEmployee);
                
                onClose();
                
                // Delay background refresh to prevent stale data race conditions
                setTimeout(() => {
                    fetchExpenses();
                }, 1000);

                setExpenseForm({ date: new Date().toISOString().slice(0, 10), attendance: 'Present', breakfast: '', lunch: '', dinner: '', petrol: '', notes: '' });
                setClientSites([{ clientId: '', siteId: '', files: { photos: [], data: [], dailyReports: [] } }]);
                setOtherExpenses([]);
                setGivenTo([]);
                setReceivedFrom([]);
            }
        } catch (err) {
            toast({ title: 'Error', description: err.response?.data?.message || 'Failed to add', status: 'error' });
        } finally {
            setSubmitting(false);
        }
    };

    const handleDownload = async () => {
        if (useNas) {
            // Trigger backend call to save to NAS /volume1/work/employeename-expenses
            toast({ title: "NAS feature disabled currently per user request.", status: "info" });
            return;
        }

        // Generate CSV manually based on filtered expenses
        let csvContent = "SR. NO.,DATE,DESCRIPTION,CREDIT,DEBIT,TOTAL,ATENDES,REMARK,SIDE WORK\n";

        filteredExpenses.forEach((exp, sNum) => {
            const dateStr = new Date(exp.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
            const attendance = exp.attendance === 'Present' ? 'P' : (exp.attendance === 'Half Day' ? 'HD' : 'A');
            
            // Build Site list string
            let sideWork = [];
            if (exp.siteId) sideWork.push(exp.siteId.siteName);
            if (exp.siteIds && exp.siteIds.length > 0) {
                sideWork = sideWork.concat(exp.siteIds.map(s => s.siteName));
            }
            const sideWorkStr = sideWork.map((s, i) => `${i+1} ${s}`).join(' | ') || '';

            // Aggregate Credits
            let credits = [];
            let totalCr = 0;
            if (exp.creditDebit?.receivedFrom) {
                exp.creditDebit.receivedFrom.forEach(r => {
                    credits.push({ desc: r.employeeRef?.name || 'Advance', cr: r.amount, dr: '' });
                    totalCr += r.amount;
                });
            }

            // Aggregate Debits
            let debits = [];
            let totalDr = 0;
            const fixed = exp.expenses || {};
            if (fixed.breakfast) { debits.push({ desc: 'BREAK FAST', cr: '', dr: fixed.breakfast }); totalDr += Number(fixed.breakfast); }
            if (fixed.lunch) { debits.push({ desc: 'LUNCH', cr: '', dr: fixed.lunch }); totalDr += Number(fixed.lunch); }
            if (fixed.dinner) { debits.push({ desc: 'DINNER', cr: '', dr: fixed.dinner }); totalDr += Number(fixed.dinner); }
            if (fixed.petrol) { debits.push({ desc: 'PETROL', cr: '', dr: fixed.petrol }); totalDr += Number(fixed.petrol); }
            
            if (exp.otherExpensesList) {
                exp.otherExpensesList.forEach(o => {
                    debits.push({ desc: o.expenseName.toUpperCase(), cr: '', dr: o.amount });
                    totalDr += Number(o.amount);
                });
            }
            if (exp.creditDebit?.givenTo) {
                exp.creditDebit.givenTo.forEach(g => {
                    debits.push({ desc: g.employeeRef?.name || 'Unknown', cr: '', dr: g.amount });
                    totalDr += Number(g.amount);
                });
            }

            const allItems = [...credits, ...debits];
            if (allItems.length === 0) allItems.push({ desc: 'NO TRANSACTIONS', cr: '', dr: '' });

            const totalRows = allItems.length + 3; // +3 for CR, DR, Net Bal

            // Map rows to CSV
            allItems.forEach((item, index) => {
                if (index === 0) {
                    csvContent += `${sNum + 1},${dateStr},${item.desc},${item.cr},${item.dr},,${attendance},"${exp.attendanceRemark || ''}",${sideWorkStr}\n`;
                } else {
                    csvContent += `,,${item.desc},${item.cr},${item.dr},,,, \n`;
                }
            });

            // Summary rows
            csvContent += `,,,,CR,${totalCr},,\n`;
            csvContent += `,,,,DR,${totalDr},,\n`;
            csvContent += `,,,,,${totalCr - totalDr},,\n`;
        });

        // Download local
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `${employeeName || 'Employee'}_Expenses.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) {
        return <Center p={10}><Spinner size="xl" /></Center>;
    }

    // Hardcoded months for 12-month report
    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    // Calculate the 20 years to display based on the current page
    const displayYears = Array.from({ length: 20 }, (_, i) => yearPageStart + i);

    // Always filter by month and year
    const filteredExpenses = expenses.filter(e => {
        const d = new Date(e.date);
        return (d.getMonth() + 1) === Number(selectedMonth) && d.getFullYear() === Number(selectedYear);
    });

    const filteredTransfers = transfers.filter(t => {
        const d = new Date(t.date);
        return (d.getMonth() + 1) === Number(selectedMonth) && d.getFullYear() === Number(selectedYear);
    });

    // Group all records by calendar date (YYYY-MM-DD key)
    const toDateKey = (d) => new Date(d).toISOString().slice(0, 10);

    const dateMap = {};
    [...filteredExpenses.map(e => ({ ...e, _rowType: 'expense' })),
     ...filteredTransfers.map(t => ({ ...t, _rowType: 'transfer' }))
    ].forEach(row => {
        const key = toDateKey(row.date);
        if (!dateMap[key]) dateMap[key] = { dateKey: key, expense: null, transfers: [] };
        if (row._rowType === 'expense') dateMap[key].expense = row;
        else dateMap[key].transfers.push(row);
    });

    // Sort date groups chronologically
    const groupedByDate = Object.values(dateMap).sort((a, b) => new Date(a.dateKey) - new Date(b.dateKey));

    return (
        <Box bg="white" p={6} borderRadius="xl" shadow="md">
            <Flex justify="space-between" mb={6} align="center" flexWrap="wrap" gap={4}>
                <Heading size="md" color="gray.800">Expense Report: {employeeName}</Heading>
                
                <HStack spacing={4} flexWrap="wrap">
                    <HStack>
                        <Text fontSize="sm" fontWeight="bold" color="gray.600">Period:</Text>
                        <ChakraSelect 
                            w="130px"
                            bg="white"
                            borderRadius="xl"
                            shadow="sm"
                            size="sm"
                            fontWeight="bold"
                            value={selectedMonth} 
                            onChange={(e) => setSelectedMonth(e.target.value)}
                        >
                            {months.map((m, i) => (
                                <option key={i} value={i + 1}>{m}</option>
                            ))}
                        </ChakraSelect>
                        
                        <Popover placement="bottom-start" matchWidth={false}>
                            <PopoverTrigger>
                                <Button 
                                    w="110px"
                                    bg="white"
                                    borderRadius="xl"
                                    shadow="sm"
                                    size="sm"
                                    fontWeight="bold"
                                    rightIcon={<Icon as={FaCalendarAlt} color="blue.500" />}
                                >
                                    {selectedYear}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent w="280px" borderRadius="2xl" shadow="2xl" border="1px solid" borderColor="gray.100">
                                <PopoverBody p={4} maxH="350px" overflowY="auto" className="hide-scrollbar">
                                    <HStack justify="space-between" mb={4} px={2}>
                                        <IconButton size="sm" variant="ghost" icon={<FaChevronLeft />} onClick={() => setYearPageStart(prev => prev - 20)} />
                                        <Text fontWeight="bold" fontSize="sm" color="gray.700">
                                            {yearPageStart} - {yearPageStart + 19}
                                        </Text>
                                        <IconButton size="sm" variant="ghost" icon={<FaChevronRight />} onClick={() => setYearPageStart(prev => prev + 20)} />
                                    </HStack>
                                    <SimpleGrid columns={4} spacing={2}>
                                        {displayYears.map(y => (
                                            <Button 
                                                key={y} 
                                                size="sm" 
                                                borderRadius="lg"
                                                colorScheme={Number(selectedYear) === y ? "blue" : "gray"} 
                                                variant={Number(selectedYear) === y ? "solid" : "ghost"} 
                                                onClick={() => setSelectedYear(y)}
                                            >
                                                {y}
                                            </Button>
                                        ))}
                                    </SimpleGrid>
                                </PopoverBody>
                            </PopoverContent>
                        </Popover>
                    </HStack>

                    <Button colorScheme="purple" leftIcon={<FaPlus />} onClick={onOpen} size="sm">
                        Add Record
                    </Button>
                    <Button colorScheme="green" leftIcon={<FaFileExcel />} onClick={handleDownload} size="sm">
                        Export Filtered Sheet
                    </Button>
                </HStack>
            </Flex>

            {/* Modal for Adding Expense/Attendance */}
            <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
                <ModalOverlay backdropFilter="blur(5px)" />
                <ModalContent borderRadius="2xl" shadow="2xl">
                    <ModalHeader bgGradient="linear(to-r, purple.600, blue.500)" borderTopRadius="2xl" color="white" shadow="sm">
                        <HStack><Icon as={FaClipboardCheck} mr={2} /> <Text>Add Daily Record</Text></HStack>
                    </ModalHeader>
                    <ModalCloseButton color="white" mt={1} />
                    <ModalBody py={6} bg="gray.50">
                        <VStack spacing={6}>
                            {/* General Details Section */}
                            <Box w="full" bg="white" p={5} borderRadius="xl" shadow="sm" border="1px solid" borderColor="gray.100">
                                <Heading size="xs" textTransform="uppercase" color="purple.500" mb={4} letterSpacing="wider">Tracking Details</Heading>
                                <SimpleGrid columns={2} spacing={5} w="full">
                                    <FormControl>
                                        <FormLabel fontWeight="bold" fontSize="sm" color="gray.600">Date</FormLabel>
                                        <InputGroup>
                                            <InputLeftElement pointerEvents="none"><Icon as={FaCalendarAlt} color="purple.400" /></InputLeftElement>
                                            <Input type="date" name="date" value={expenseForm.date} onChange={handleFormChange} bg="gray.50" _focus={{ bg: "white", borderColor: "purple.400" }} />
                                        </InputGroup>
                                    </FormControl>
                                    <FormControl>
                                        <FormLabel fontWeight="bold" fontSize="sm" color="gray.600">Attendance</FormLabel>
                                        <InputGroup>
                                            <InputLeftElement pointerEvents="none"><Icon as={FaClipboardCheck} color="purple.400" /></InputLeftElement>
                                            <ChakraSelect pl={10} name="attendance" value={expenseForm.attendance} onChange={handleFormChange} bg="gray.50" _focus={{ bg: "white", borderColor: "purple.400" }}>
                                                <option value="Present">Present</option>
                                                <option value="Half Day">Half Day</option>
                                                <option value="Absent">Absent</option>
                                            </ChakraSelect>
                                        </InputGroup>
                                    </FormControl>
                                </SimpleGrid>

                                {expenseForm.attendance === 'Absent' && (
                                     <FormControl mt={4}>
                                         <FormLabel fontWeight="bold" fontSize="sm" color="gray.600">Reason for Absence</FormLabel>
                                         <Input 
                                             name="attendanceRemark" 
                                             value={expenseForm.attendanceRemark} 
                                             onChange={handleFormChange} 
                                             placeholder="Enter reason for absence..." 
                                             bg="gray.50"
                                         />
                                     </FormControl>
                                 )}
                                
                                <Box w="full" mt={4} bg="purple.50" p={5} borderRadius="xl" border="1px dashed" borderColor="purple.200">
                                    <Flex justify="space-between" align="center" mb={4}>
                                        <HStack><Icon as={FaMapMarkerAlt} color="purple.500" /><Heading size="xs" textTransform="uppercase" color="purple.700" letterSpacing="wider">Site Allocations & Files</Heading></HStack>
                                        <Button size="xs" colorScheme="purple" variant="solid" shadow="sm" leftIcon={<FaPlus />} onClick={addClientSite}>Add Site</Button>
                                    </Flex>
                                    <VStack spacing={5}>
                                        {clientSites.map((cs, idx) => (
                                            <VStack key={idx} w="full" bg="white" p={3} borderRadius="md" shadow="sm" align="stretch" borderLeft="4px solid" borderColor="purple.400">
                                                <HStack align="flex-end">
                                                    <FormControl size="sm">
                                                        <FormLabel fontSize="10px" fontWeight="bold">Client</FormLabel>
                                                        <ChakraSelect placeholder="Select Client" value={cs.clientId} onChange={e => updateClientSite(idx, 'clientId', e.target.value)} size="sm" variant="filled">
                                                            {Array.from(new Set(sites.map(s => s.client?._id || s.client))).map(cId => {
                                                                const clientName = sites.find(s => (s.client?._id || s.client) === cId)?.client?.clientName || 'Client';
                                                                return <option key={cId} value={cId}>{clientName}</option>
                                                            })}
                                                        </ChakraSelect>
                                                    </FormControl>
                                                    <FormControl size="sm">
                                                        <FormLabel fontSize="10px" fontWeight="bold">Site</FormLabel>
                                                        <ChakraSelect placeholder="Select Site" value={cs.siteId} onChange={e => updateClientSite(idx, 'siteId', e.target.value)} size="sm" variant="filled">
                                                            {sites.filter(s => (s.client?._id || s.client) === cs.clientId).map(s => (
                                                                <option key={s._id} value={s._id}>{s.siteName}</option>
                                                            ))}
                                                        </ChakraSelect>
                                                    </FormControl>
                                                    {clientSites.length > 1 && <IconButton icon={<FaTrash />} size="sm" colorScheme="red" variant="ghost" onClick={() => removeClientSite(idx)} />}
                                                </HStack>
                                                
                                                {/* File Uploads per Site */}
                                                <SimpleGrid columns={3} spacing={2} pt={2}>
                                                    <VStack align="start" spacing={1}>
                                                        <Text fontSize="9px" fontWeight="black" color="blue.600">PHOTOS ({cs.files.photos.length})</Text>
                                                        <Input type="file" multiple accept="image/*" onChange={(e) => handleSiteFileChange(idx, e, 'photos')} size="xs" p={0} variant="unstyled" />
                                                    </VStack>
                                                    <VStack align="start" spacing={1}>
                                                        <Text fontSize="9px" fontWeight="black" color="orange.600">REPORTS ({cs.files.dailyReports.length})</Text>
                                                        <Input type="file" multiple accept=".pdf,.doc,.docx" onChange={(e) => handleSiteFileChange(idx, e, 'dailyReports')} size="xs" p={0} variant="unstyled" />
                                                    </VStack>
                                                    <VStack align="start" spacing={1}>
                                                        <Text fontSize="9px" fontWeight="black" color="purple.600">DATA ({cs.files.data.length})</Text>
                                                        <Input type="file" multiple accept=".xls,.xlsx,.pdf" onChange={(e) => handleSiteFileChange(idx, e, 'data')} size="xs" p={0} variant="unstyled" />
                                                    </VStack>
                                                </SimpleGrid>
                                            </VStack>
                                        ))}
                                    </VStack>
                                </Box>
                            </Box>

                            {/* Food & Travel Section */}
                            <Box w="full" bg="white" p={5} borderRadius="xl" shadow="sm" border="1px solid" borderColor="gray.100">
                                <Heading size="xs" textTransform="uppercase" color="blue.500" mb={4} letterSpacing="wider">Food & Fuel (₹)</Heading>
                                <SimpleGrid columns={2} spacing={5} w="full">
                                    <FormControl>
                                        <InputGroup size="sm">
                                            <InputLeftAddon bg="blue.50" color="blue.600"><Icon as={FaCoffee} mr={2} /> Breakfast</InputLeftAddon>
                                            <Input type="number" name="breakfast" value={expenseForm.breakfast} onChange={handleFormChange} placeholder="0" />
                                        </InputGroup>
                                    </FormControl>
                                    <FormControl>
                                        <InputGroup size="sm">
                                            <InputLeftAddon bg="blue.50" color="blue.600"><Icon as={FaHamburger} mr={2} /> Lunch</InputLeftAddon>
                                            <Input type="number" name="lunch" value={expenseForm.lunch} onChange={handleFormChange} placeholder="0" />
                                        </InputGroup>
                                    </FormControl>
                                    <FormControl>
                                        <InputGroup size="sm">
                                            <InputLeftAddon bg="blue.50" color="blue.600"><Icon as={FaUtensils} mr={2} /> Dinner</InputLeftAddon>
                                            <Input type="number" name="dinner" value={expenseForm.dinner} onChange={handleFormChange} placeholder="0" />
                                        </InputGroup>
                                    </FormControl>
                                    <FormControl>
                                        <InputGroup size="sm">
                                            <InputLeftAddon bg="red.50" color="red.600"><Icon as={FaGasPump} mr={2} /> Petrol</InputLeftAddon>
                                            <Input type="number" name="petrol" value={expenseForm.petrol} onChange={handleFormChange} placeholder="0" />
                                        </InputGroup>
                                    </FormControl>
                                </SimpleGrid>
                            </Box>

                            {/* Dynamic Array Fields Start */}
                            <Box w="full" bg="gray.100" p={5} borderRadius="xl" border="1px dashed" borderColor="gray.300">
                                <Flex justify="space-between" align="center" mb={4}>
                                    <HStack><Icon as={FaStickyNote} color="gray.600" /><Heading size="xs" textTransform="uppercase" color="gray.700" letterSpacing="wider">Other Expenses</Heading></HStack>
                                    <Button size="xs" colorScheme="gray" variant="solid" shadow="sm" leftIcon={<FaPlus />} onClick={addOtherExpenseRow}>Add Row</Button>
                                </Flex>
                                <VStack spacing={3}>
                                    {otherExpenses.map((exp, idx) => (
                                        <HStack key={idx} w="full" bg="white" p={2} borderRadius="md" shadow="sm">
                                            <Input placeholder="Expense Name" value={exp.expenseName} onChange={e => updateOtherExpense(idx, 'expenseName', e.target.value)} size="sm" variant="filled" />
                                            <InputGroup size="sm" w="150px">
                                                <InputLeftElement><Icon as={FaRupeeSign} color="gray.400" size="xs" /></InputLeftElement>
                                                <Input placeholder="Amount" type="number" value={exp.amount} onChange={e => updateOtherExpense(idx, 'amount', e.target.value)} variant="filled" />
                                            </InputGroup>
                                            <IconButton icon={<FaTrash />} size="sm" colorScheme="red" variant="ghost" onClick={() => removeOtherExpense(idx)} />
                                        </HStack>
                                    ))}
                                    {otherExpenses.length === 0 && <Text fontSize="xs" color="gray.400" fontStyle="italic">No other expenses added yet.</Text>}
                                </VStack>
                            </Box>

                            <Box w="full" bg="orange.50" p={5} borderRadius="xl" border="1px dashed" borderColor="orange.200">
                                <Flex justify="space-between" align="center" mb={4}>
                                    <HStack><Icon as={FaMoneyBillWave} color="orange.500" /><Heading size="xs" textTransform="uppercase" color="orange.700" letterSpacing="wider">Money Given To Employee</Heading></HStack>
                                    <Button size="xs" colorScheme="orange" variant="solid" shadow="sm" leftIcon={<FaPlus />} onClick={addGivenToRow}>Add Row</Button>
                                </Flex>
                                <VStack spacing={3}>
                                    {givenTo.map((item, idx) => (
                                        <HStack key={idx} w="full" bg="white" p={2} borderRadius="md" shadow="sm">
                                            <ChakraSelect placeholder="Select Employee" value={item.employeeRef} onChange={e => updateGivenTo(idx, 'employeeRef', e.target.value)} size="sm" variant="filled">
                                                {employees.map(e => <option key={e._id} value={e._id}>{e.name}</option>)}
                                            </ChakraSelect>
                                            <InputGroup size="sm" w="150px">
                                                <InputLeftElement><Icon as={FaRupeeSign} color="gray.400" size="xs" /></InputLeftElement>
                                                <Input placeholder="Amount" type="number" value={item.amount} onChange={e => updateGivenTo(idx, 'amount', e.target.value)} variant="filled" />
                                            </InputGroup>
                                            <IconButton icon={<FaTrash />} size="sm" colorScheme="red" variant="ghost" onClick={() => removeGivenToRow(idx)} />
                                        </HStack>
                                    ))}
                                    {givenTo.length === 0 && <Text fontSize="xs" color="orange.300" fontStyle="italic">No advances given recorded.</Text>}
                                </VStack>
                            </Box>

                            <Box w="full" bg="teal.50" p={5} borderRadius="xl" border="1px dashed" borderColor="teal.200">
                                <Flex justify="space-between" align="center" mb={4}>
                                    <HStack><Icon as={FaMoneyBillWave} color="teal.500" /><Heading size="xs" textTransform="uppercase" color="teal.700" letterSpacing="wider">Money Received From Employee</Heading></HStack>
                                    <Button size="xs" colorScheme="teal" variant="solid" shadow="sm" leftIcon={<FaPlus />} onClick={addReceivedFromRow}>Add Row</Button>
                                </Flex>
                                <VStack spacing={3}>
                                    {receivedFrom.map((item, idx) => (
                                        <HStack key={idx} w="full" bg="white" p={2} borderRadius="md" shadow="sm">
                                            <ChakraSelect placeholder="Select Employee" value={item.employeeRef} onChange={e => updateReceivedFrom(idx, 'employeeRef', e.target.value)} size="sm" variant="filled">
                                                {employees.map(e => <option key={e._id} value={e._id}>{e.name}</option>)}
                                            </ChakraSelect>
                                            <InputGroup size="sm" w="150px">
                                                <InputLeftElement><Icon as={FaRupeeSign} color="gray.400" size="xs" /></InputLeftElement>
                                                <Input placeholder="Amount" type="number" value={item.amount} onChange={e => updateReceivedFrom(idx, 'amount', e.target.value)} variant="filled" />
                                            </InputGroup>
                                            <IconButton icon={<FaTrash />} size="sm" colorScheme="red" variant="ghost" onClick={() => removeReceivedFromRow(idx)} />
                                        </HStack>
                                    ))}
                                    {receivedFrom.length === 0 && <Text fontSize="xs" color="teal.300" fontStyle="italic">No money received recorded.</Text>}
                                </VStack>
                            </Box>
                            {/* Dynamic Array Fields End */}

                             {/* Live Summary Footer */}
                             <Box w="full" bg="blue.600" p={4} borderRadius="xl" shadow="inner" color="white" pos="relative">
                                {loading && <Center pos="absolute" inset={0} bg="blue.600" borderRadius="xl"><Spinner size="xs" /></Center>}
                                <HStack justify="space-between">
                                    <VStack align="start" spacing={0}>
                                        <Text fontSize="9px" opacity={0.8} fontWeight="bold">CURRENT: ₹{employeeDetails?.totalAmount?.toLocaleString() || 0}</Text>
                                        <HStack spacing={1}>
                                            <Icon as={FaRupeeSign} />
                                            <Heading size="md">{totals.total.toLocaleString()}</Heading>
                                        </HStack>
                                        <Text fontSize="9px" opacity={0.8} fontWeight="bold" color={totals.remaining < 0 ? "red.200" : "green.200"}>
                                            REMAINS: ₹{totals.remaining.toLocaleString()}
                                        </Text>
                                    </VStack>
                                    <HStack spacing={4} fontSize="xs" opacity={0.9}>
                                        <Text>Std: ₹{totals.stdTotal}</Text>
                                        <Text>Other: ₹{totals.otherTotal}</Text>
                                    </HStack>
                                </HStack>
                            </Box>

                            <FormControl bg="gray.100" p={4} borderRadius="xl">
                                <FormLabel fontWeight="bold" fontSize="sm" color="gray.700"><Icon as={FaStickyNote} mr={2} color="gray.500"/>Notes</FormLabel>
                                <Input name="notes" value={expenseForm.notes} onChange={handleFormChange} placeholder="Type any specific details or context here..." bg="white" _focus={{ borderColor: "purple.400" }} />
                            </FormControl>
                        </VStack>
                    </ModalBody>
                    <ModalFooter bg="white" borderBottomRadius="2xl" shadow="md">
                        <Button variant="ghost" mr={3} onClick={onClose} borderRadius="xl">Cancel</Button>
                        <Button colorScheme="purple" onClick={handleAddExpense} isLoading={submitting} borderRadius="xl" shadow="md" px={8} leftIcon={<FaClipboardCheck />}>Save Record</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {groupedByDate.length === 0 ? (
                <Center p={10}><Text color="gray.500">No records found for this period.</Text></Center>
            ) : (
                <TableContainer border="1px" borderColor="gray.300" borderRadius="md">
                <Table size="sm" variant="simple" sx={{ borderCollapse: 'collapse', 'th, td': { border: '1px solid black' } }}>
                    <Thead bg="gray.100">
                        <Tr>
                            <Th textAlign="center" border="1px solid black" fontSize="xs">SR. NO.</Th>
                            <Th textAlign="center" border="1px solid black" fontSize="xs">DATE</Th>
                            <Th border="1px solid black" fontSize="xs">DESCRIPTION</Th>
                            <Th textAlign="center" border="1px solid black" fontSize="xs">CREDIT</Th>
                            <Th textAlign="center" border="1px solid black" fontSize="xs">DEBIT</Th>
                            <Th textAlign="center" border="1px solid black" fontSize="xs">TOTAL</Th>
                            <Th textAlign="center" border="1px solid black" fontSize="xs">ATENDES</Th>
                            <Th border="1px solid black" fontSize="xs">REMARK</Th>
                            <Th border="1px solid black" fontSize="xs">SIDE WORK</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {groupedByDate.map((group, groupIdx) => {
                            const dateStr = new Date(group.dateKey).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
                            const exp = group.expense;

                            // Attendance info (from expense record if exists)
                            const attendance = exp
                                ? (exp.attendance === 'Present' ? 'P' : exp.attendance === 'Half Day' ? 'HD' : 'A')
                                : '-';
                            const attColor = attendance === 'P' ? 'green.400' : attendance === 'HD' ? 'orange.400' : attendance === 'A' ? 'red.400' : 'gray.400';
                            const attRemark = exp?.attendanceRemark || '-';
                            const sideWork = exp?.clientSites?.map(cs => cs.siteId?.siteName).filter(Boolean) || [];

                            // Build combined line items for this date
                            const allItems = [];
                            let totalCr = 0;
                            let totalDr = 0;

                            // 1. Credits from expense receivedFrom
                            if (exp?.creditDebit?.receivedFrom) {
                                exp.creditDebit.receivedFrom.forEach(r => {
                                    allItems.push({ desc: `RECEIVED FROM ${r.employeeRef?.name?.toUpperCase() || 'EMPLOYEE'}`, cr: Number(r.amount) || 0, dr: 0, type: 'transfer-in' });
                                    totalCr += Number(r.amount) || 0;
                                });
                            }

                            // 2. Standard expense debits
                            const fixed = exp?.expenses || {};
                            const files = exp?.expenseFiles || {};
                            if (fixed.breakfast) { allItems.push({ desc: 'BREAK FAST', cr: 0, dr: Number(fixed.breakfast), type: 'expense', files: files.breakfast }); totalDr += Number(fixed.breakfast); }
                            if (fixed.lunch)     { allItems.push({ desc: 'LUNCH', cr: 0, dr: Number(fixed.lunch), type: 'expense', files: files.lunch }); totalDr += Number(fixed.lunch); }
                            if (fixed.dinner)    { allItems.push({ desc: 'DINNER', cr: 0, dr: Number(fixed.dinner), type: 'expense', files: files.dinner }); totalDr += Number(fixed.dinner); }
                            if (fixed.petrol)    { allItems.push({ desc: 'PETROL', cr: 0, dr: Number(fixed.petrol), type: 'expense', files: files.petrol }); totalDr += Number(fixed.petrol); }

                            // 3. Other expenses
                            exp?.otherExpensesList?.forEach(o => {
                                allItems.push({ desc: o.expenseName.toUpperCase(), cr: 0, dr: Number(o.amount), type: 'expense', files: o.files });
                                totalDr += Number(o.amount);
                            });

                            // 4. Debits from expense givenTo
                            exp?.creditDebit?.givenTo?.forEach(g => {
                                allItems.push({ desc: `GIVEN TO ${g.employeeRef?.name?.toUpperCase() || 'EMPLOYEE'}`, cr: 0, dr: Number(g.amount), type: 'transfer-out' });
                                totalDr += Number(g.amount);
                            });

                            // 5. Transfer records (from EmployeeTransfer collection)
                            group.transfers.forEach(t => {
                                const isGiver = (t.giver?._id || t.giver) === employeeId;
                                const otherPerson = isGiver ? (t.taker?.name || 'Employee') : (t.giver?.name || 'Employee');
                                if (isGiver) {
                                    allItems.push({ desc: `Given To → ${otherPerson}`, cr: 0, dr: Number(t.amount), type: 'transfer-out', note: t.notes });
                                    totalDr += Number(t.amount);
                                } else {
                                    allItems.push({ desc: `← Received From ${otherPerson}`, cr: Number(t.amount), dr: 0, type: 'transfer-in', note: t.notes });
                                    totalCr += Number(t.amount);
                                }
                            });

                            if (allItems.length === 0) allItems.push({ desc: '-', cr: 0, dr: 0, type: 'expense' });

                            const totalSpan = allItems.length + 3; // items + CR + DR + NET

                            return (
                                <React.Fragment key={group.dateKey}>
                                    {allItems.map((item, itemIdx) => (
                                        <Tr key={`${group.dateKey}-${itemIdx}`}
                                            bg={item.type === 'transfer-out' ? 'orange.50' : item.type === 'transfer-in' ? 'teal.50' : 'white'}
                                        >
                                            {itemIdx === 0 && (
                                                <>
                                                    <Td rowSpan={totalSpan} textAlign="center" fontWeight="bold">{groupIdx + 1}</Td>
                                                    <Td rowSpan={totalSpan} textAlign="center">{dateStr}</Td>
                                                </>
                                            )}

                                            <Td fontSize="xs" fontWeight={item.type !== 'expense' ? 'bold' : '500'}
                                                color={item.type === 'transfer-out' ? 'orange.700' : item.type === 'transfer-in' ? 'teal.700' : 'gray.800'}
                                            >
                                                <HStack spacing={2}>
                                                    <Text>{item.desc}</Text>
                                                    {item.files && item.files.length > 0 && (
                                                        <HStack spacing={1}>
                                                            {item.files.map((f, i) => (
                                                                <a key={i} href={`${API_BASE_URL}${f.url}`} target="_blank" rel="noreferrer" title={f.name}>
                                                                    <Icon as={FaPaperclip} color="blue.500" w={3} h={3} _hover={{ color: "blue.700" }} cursor="pointer" />
                                                                </a>
                                                            ))}
                                                        </HStack>
                                                    )}
                                                </HStack>
                                                {item.note && <Text fontSize="9px" color="gray.400" fontWeight="normal" mt={1}>({item.note})</Text>}
                                            </Td>
                                            <Td textAlign="center" color="teal.700" fontWeight={item.cr ? 'bold' : 'normal'}>{item.cr || ''}</Td>
                                            <Td textAlign="center" color={item.type === 'transfer-out' ? 'orange.700' : 'red.700'} fontWeight={item.dr ? 'bold' : 'normal'}>{item.dr || ''}</Td>

                                            {itemIdx === 0 && <Td rowSpan={allItems.length} border="0px"></Td>}

                                            {itemIdx === 0 && (
                                                <>
                                                    <Td rowSpan={totalSpan} textAlign="center">
                                                        <Box as="span" bg={attColor} color="white" px={3} py={1} display="inline-block" fontWeight="bold" fontSize="xs">
                                                            {attendance}
                                                        </Box>
                                                    </Td>
                                                    <Td rowSpan={totalSpan} textAlign="center" fontSize="xs" color="red.600" fontWeight="bold">
                                                        {attRemark}
                                                    </Td>
                                                    <Td rowSpan={totalSpan} verticalAlign="top" fontSize="xs">
                                                        <VStack align="start" spacing={1}>
                                                            {sideWork.map((s, i) => <Text key={i}>{i+1} {s.toUpperCase()}</Text>)}
                                                        </VStack>
                                                    </Td>
                                                </>
                                            )}
                                        </Tr>
                                    ))}

                                    <Tr bg="green.50">
                                        <Td></Td>
                                        <Td textAlign="center" bg="gray.100" fontWeight="bold" fontSize="xs">CR</Td>
                                        <Td></Td>
                                        <Td textAlign="center" bg="#00b050" color="white" fontWeight="bold">{totalCr || 0}</Td>
                                    </Tr>
                                    <Tr bg="red.50">
                                        <Td></Td>
                                        <Td textAlign="center" bg="gray.100" fontWeight="bold" fontSize="xs">DR</Td>
                                        <Td></Td>
                                        <Td textAlign="center" bg="#ff0000" color="white" fontWeight="bold">{totalDr || 0}</Td>
                                    </Tr>
                                    <Tr bg="blue.50">
                                        <Td></Td>
                                        <Td textAlign="center" fontWeight="bold" fontSize="xs">NET</Td>
                                        <Td></Td>
                                        <Td textAlign="center" bg="#00b0f0" color="white" fontWeight="bold">{totalCr - totalDr}</Td>
                                    </Tr>
                                    {/* Bold separator row between date groups */}
                                    {groupIdx < groupedByDate.length - 1 && (
                                        <Tr>
                                            <Td colSpan={9} p={0} borderTop="3px solid" borderColor="gray.700" bg="gray.700" height="3px"></Td>
                                        </Tr>
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </Tbody>
                </Table>
            </TableContainer>
            )}
        </Box>
    );
};

export default AdminEmployeeExpenses;


