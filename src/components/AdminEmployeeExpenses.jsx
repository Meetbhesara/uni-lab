import React, { useState, useEffect } from 'react';
import {
    Box, Table, Thead, Tbody, Tr, Th, Td, TableContainer,
    Button, Spinner, Center, Text, HStack, VStack, Icon, useToast, Heading, Flex, IconButton,
    Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
    FormControl, FormLabel, Input, Select as ChakraSelect, SimpleGrid, useDisclosure,
    InputGroup, InputLeftElement, Divider, InputLeftAddon
} from '@chakra-ui/react';
import { FaDownload, FaFileExcel, FaPlus, FaTrash, FaCalendarAlt, FaClipboardCheck, FaMapMarkerAlt, FaCoffee, FaHamburger, FaUtensils, FaGasPump, FaStickyNote, FaMoneyBillWave, FaRupeeSign } from 'react-icons/fa';
import api from '../api/axios';

const AdminEmployeeExpenses = ({ employeeId, employeeName }) => {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); // 1-12
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [isFiltering, setIsFiltering] = useState(true); // Default to filter mode
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
        siteId: '',
        breakfast: '',
        lunch: '',
        dinner: '',
        petrol: '',
        notes: ''
    });

    const fetchExpenses = async () => {
        if (!employeeId) return;
        setLoading(true);
        try {
            const res = await api.get(`/employee-expense/admin/${employeeId}`);
            if (res.data.success) {
                setExpenses(res.data.data);
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

    const [otherExpenses, setOtherExpenses] = useState([]);
    const [givenTo, setGivenTo] = useState([]);
    const [receivedFrom, setReceivedFrom] = useState([]);

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

    const handleAddExpense = async () => {
        setSubmitting(true);
        try {
            const payload = {
                employeeId,
                date: expenseForm.date,
                attendance: expenseForm.attendance,
                siteId: expenseForm.siteId || null,
                expenses: {
                    breakfast: Number(expenseForm.breakfast) || 0,
                    lunch: Number(expenseForm.lunch) || 0,
                    dinner: Number(expenseForm.dinner) || 0,
                    petrol: Number(expenseForm.petrol) || 0
                },
                otherExpensesList: otherExpenses.map(o => ({ expenseName: o.expenseName, amount: Number(o.amount) })).filter(o => o.expenseName && o.amount),
                creditDebit: {
                    givenTo: givenTo.map(g => ({ employeeRef: g.employeeRef, amount: Number(g.amount) })).filter(g => g.employeeRef && g.amount),
                    receivedFrom: receivedFrom.map(r => ({ employeeRef: r.employeeRef, amount: Number(r.amount) })).filter(r => r.employeeRef && r.amount)
                },
                notes: expenseForm.notes
            };
            const res = await api.post('/employee-expense/admin/add-expense', payload);
            if (res.data.success) {
                toast({ title: 'Success', description: 'Expense added!', status: 'success', duration: 2000 });
                onClose();
                fetchExpenses();
                setExpenseForm({ date: new Date().toISOString().slice(0, 10), attendance: 'Present', siteId: '', breakfast: '', lunch: '', dinner: '', petrol: '', notes: '' });
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
        let csvContent = "SR. NO.,DATE,DESCRIPTION,CREDIT,DEBIT,TOTAL,ATENDES,SIDE WORK\n";

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
                    csvContent += `${sNum + 1},${dateStr},${item.desc},${item.cr},${item.dr},,${attendance},${sideWorkStr}\n`;
                } else {
                    csvContent += `,,${item.desc},${item.cr},${item.dr},,,\n`;
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

    // Simple year range (current - 2 to current + 1)
    const currentYear = new Date().getFullYear();
    const years = [currentYear - 2, currentYear - 1, currentYear, currentYear + 1];

    const filteredExpenses = !isFiltering 
        ? expenses 
        : expenses.filter(e => {
            const d = new Date(e.date);
            return (d.getMonth() + 1) === Number(selectedMonth) && d.getFullYear() === Number(selectedYear);
        });

    return (
        <Box bg="white" p={6} borderRadius="xl" shadow="md">
            <Flex justify="space-between" mb={6} align="center" flexWrap="wrap" gap={4}>
                <Heading size="md" color="gray.800">Expense Report: {employeeName}</Heading>
                
                <HStack spacing={4} flexWrap="wrap">
                    <HStack>
                        <Text fontSize="sm" fontWeight="bold" color="gray.600">Period:</Text>
                        <select 
                            style={{ padding: '4px 8px', borderRadius: '8px', border: '1px solid #ccc', background: 'white' }}
                            value={selectedMonth} 
                            onChange={(e) => { setSelectedMonth(e.target.value); setIsFiltering(true); }}
                        >
                            {months.map((m, i) => (
                                <option key={i} value={i + 1}>{m}</option>
                            ))}
                        </select>
                        <select 
                            style={{ padding: '4px 8px', borderRadius: '8px', border: '1px solid #ccc', background: 'white' }}
                            value={selectedYear} 
                            onChange={(e) => { setSelectedYear(e.target.value); setIsFiltering(true); }}
                        >
                            {years.map(y => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                        <Button size="xs" colorScheme="blue" variant="outline" onClick={() => setIsFiltering(!isFiltering)}>
                            {isFiltering ? "Show All History" : "Enable Month Filter"}
                        </Button>
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
                                
                                <FormControl mt={5}>
                                    <FormLabel fontWeight="bold" fontSize="sm" color="gray.600">Site (Optional)</FormLabel>
                                    <InputGroup>
                                        <InputLeftElement pointerEvents="none"><Icon as={FaMapMarkerAlt} color="purple.400" /></InputLeftElement>
                                        <ChakraSelect pl={10} name="siteId" placeholder="-- Select Site --" value={expenseForm.siteId} onChange={handleFormChange} bg="gray.50" _focus={{ bg: "white", borderColor: "purple.400" }}>
                                            {sites.map(s => <option key={s._id} value={s._id}>{s.siteName}</option>)}
                                        </ChakraSelect>
                                    </InputGroup>
                                </FormControl>
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

            {expenses.length === 0 ? (
                <Center p={10}><Text color="gray.500">No expenses recorded for this employee.</Text></Center>
            ) : filteredExpenses.length === 0 ? (
                <Center p={10}><Text color="gray.500">No expenses found for this month.</Text></Center>
            ) : (
                <TableContainer border="1px" borderColor="gray.300" borderRadius="md">
                <Table size="sm" variant="simple" sx={{ borderCollapse: 'collapse', 'th, td': { border: '1px solid black' } }}>
                    <Thead bg="gray.100">
                        <Tr>
                            <Th textAlign="center" border="1px solid black" fontSize="xs">SR. NO.</Th>
                            <Th textAlign="center" border="1px solid black" fontSize="xs">DATE</Th>
                            <Th border="1px solid black" fontSize="xs">DESCRIPASAN</Th>
                            <Th textAlign="center" border="1px solid black" fontSize="xs">CREDIT</Th>
                            <Th textAlign="center" border="1px solid black" fontSize="xs">DEBIT</Th>
                            <Th textAlign="center" border="1px solid black" fontSize="xs">TOTAL</Th>
                            <Th textAlign="center" border="1px solid black" fontSize="xs">ATENDES</Th>
                            <Th border="1px solid black" fontSize="xs">SIDE WORK</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {filteredExpenses.map((exp, expIdx) => {
                            const dateStr = new Date(exp.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
                            const attendance = exp.attendance === 'Present' ? 'P' : (exp.attendance === 'Half Day' ? 'HD' : 'A');
                            const attColor = attendance === 'P' ? 'green.400' : (attendance === 'HD' ? 'orange.400' : 'red.400');
                            
                            let sideWork = [];
                            if (exp.siteId) sideWork.push(exp.siteId.siteName);
                            if (exp.siteIds && exp.siteIds.length > 0) {
                                sideWork = sideWork.concat(exp.siteIds.map(s => s.siteName));
                            }

                            let credits = [];
                            let totalCr = 0;
                            if (exp.creditDebit?.receivedFrom) {
                                exp.creditDebit.receivedFrom.forEach(r => {
                                    credits.push({ desc: r.employeeRef?.name ? r.employeeRef.name.toUpperCase() : 'ADVANCE', cr: r.amount, dr: '' });
                                    totalCr += r.amount;
                                });
                            }

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
                                    debits.push({ desc: g.employeeRef?.name ? g.employeeRef.name.toUpperCase() : 'UNKNOWN', cr: '', dr: g.amount });
                                    totalDr += Number(g.amount);
                                });
                            }

                            const allItems = [...credits, ...debits];
                            if (allItems.length === 0) allItems.push({ desc: '', cr: '', dr: '' });

                            // We need exactly enough rowSpans to cover allItems + length of 3 summary rows
                            const totalSpan = allItems.length + 3;

                            return (
                                <React.Fragment key={exp._id}>
                                    {allItems.map((item, rowIdx) => (
                                        <Tr key={`${exp._id}-${rowIdx}`}>
                                            {rowIdx === 0 && (
                                                <>
                                                    <Td rowSpan={totalSpan} textAlign="center" fontWeight="bold">{expIdx + 1}</Td>
                                                    <Td rowSpan={totalSpan} textAlign="center">{dateStr}</Td>
                                                </>
                                            )}
                                            
                                            <Td fontSize="xs" fontWeight="500">{item.desc}</Td>
                                            <Td textAlign="center">{item.cr}</Td>
                                            <Td textAlign="center">{item.dr}</Td>
                                            
                                            {rowIdx === 0 && <Td rowSpan={allItems.length} border="0px"></Td>}

                                            {rowIdx === 0 && (
                                                <>
                                                    <Td rowSpan={totalSpan} textAlign="center">
                                                        <Box as="span" bg={attColor} color="white" px={3} py={1} display="inline-block" fontWeight="bold">
                                                            {attendance}
                                                        </Box>
                                                    </Td>
                                                    <Td rowSpan={totalSpan} verticalAlign="top" fontSize="xs">
                                                        <VStack align="start" spacing={1}>
                                                            {sideWork.map((s, i) => (
                                                                <Text key={i}>{i+1} {s.toUpperCase()}</Text>
                                                            ))}
                                                        </VStack>
                                                    </Td>
                                                </>
                                            )}
                                        </Tr>
                                    ))}
                                    
                                    {/* CR Summary Row */}
                                    <Tr>
                                        <Td borderRight="0px"></Td>
                                        <Td textAlign="center" bg="gray.100" fontWeight="bold" fontSize="xs">CR</Td>
                                        <Td textAlign="center" borderLeft="0px"></Td>
                                        <Td textAlign="center" bg="#00b050" color="white" fontWeight="bold">{totalCr}</Td>
                                    </Tr>
                                    
                                    {/* DR Summary Row */}
                                    <Tr>
                                        <Td borderRight="0px"></Td>
                                        <Td textAlign="center" bg="gray.100" fontWeight="bold" fontSize="xs">DR</Td>
                                        <Td textAlign="center" borderLeft="0px"></Td>
                                        <Td textAlign="center" bg="#ff0000" color="white" fontWeight="bold">{totalDr}</Td>
                                    </Tr>

                                    {/* Net Balance Row */}
                                    <Tr>
                                        <Td borderRight="0px"></Td>
                                        <Td textAlign="center" borderRight="0px"></Td>
                                        <Td textAlign="center" borderLeft="0px"></Td>
                                        <Td textAlign="center" bg="#00b0f0" color="white" fontWeight="bold">{totalCr - totalDr}</Td>
                                    </Tr>
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
