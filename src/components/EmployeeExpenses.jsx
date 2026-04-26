import React, { useState, useEffect } from 'react';
import { 
    Box, Stack, Heading, Text, Button, FormControl, FormLabel, Input, 
    Select, SimpleGrid, Card, CardBody, HStack, VStack, Icon, useToast, 
    Divider, IconButton, Flex, Badge, Tag, InputGroup, InputLeftElement
} from '@chakra-ui/react';
import { FaPlus, FaTrash, FaSave, FaRupeeSign, FaCalendarAlt, FaBuilding } from 'react-icons/fa';
import api from '../api/axios';

const EmployeeExpenses = () => {
    const toast = useToast();
    const token = localStorage.getItem('employeeToken');
    const [loading, setLoading] = useState(false);
    
    const [sites, setSites] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [myExpenses, setMyExpenses] = useState([]);
    const [mySchedules, setMySchedules] = useState([]);

    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        siteIds: [],
        attendance: 'Present',
        expenses: {
            breakfast: '',
            lunch: '',
            dinner: '',
            petrol: ''
        },
        otherExpensesList: [],
        creditDebit: {
            givenTo: [],
            receivedFrom: []
        },
        notes: ''
    });

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                // Fetch Sites
                const siteRes = await api.get('/site-master');
                if (siteRes.data.success) {
                    setSites(siteRes.data.data);
                }

                // Fetch Employees
                const empRes = await api.get('/employee-master');
                if (empRes.data.success) {
                    setEmployees(empRes.data.data);
                }

                fetchMyExpenses();
                fetchMySchedules();
            } catch (err) {
                console.error("Failed to load generic data", err);
            }
        };
        fetchInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchMyExpenses = async () => {
        try {
            const res = await api.get('/employee-expense/my-expenses', {
                 headers: { Authorization: `Bearer ${token}` }
            });
            setMyExpenses(res.data.data || []);
        } catch (err) {
            console.error("Failed to fetch expenses", err);
        }
    }

    const fetchMySchedules = async () => {
        try {
            const empData = JSON.parse(localStorage.getItem('employeeData'));
            if (!empData?._id) return;
            const res = await api.get(`/schedule-master?employee=${empData._id}`);
            const now = new Date();
            now.setHours(0,0,0,0);
            const upcoming = (res.data?.data || []).filter(s => new Date(s.scheduleDate) >= now && s.status !== 'cancelled');
            setMySchedules(upcoming);
        } catch (err) {
            console.error("Failed to fetch schedules", err);
        }
    };

    const handleExpenseChange = (field, value) => {
        let cleanVal = value.toString().replace(/^0+(?=\d)/, '');
        setFormData(prev => ({
            ...prev,
            expenses: {
                ...prev.expenses,
                [field]: cleanVal
            }
        }));
    };

    const addSite = () => {
        setFormData(prev => ({ ...prev, siteIds: [...(prev.siteIds || []), ''] }));
    };

    const removeSite = (index) => {
        setFormData(prev => {
            const newList = [...(prev.siteIds || [])];
            newList.splice(index, 1);
            return { ...prev, siteIds: newList };
        });
    };

    const handleSiteChange = (index, value) => {
        setFormData(prev => {
            const newList = [...(prev.siteIds || [])];
            newList[index] = value;
            return { ...prev, siteIds: newList };
        });
    };

    const addOtherExpense = () => {
        setFormData(prev => ({ ...prev, otherExpensesList: [...prev.otherExpensesList, { expenseName: '', amount: '' }] }));
    };

    const removeOtherExpense = (index) => {
        setFormData(prev => {
            const newList = [...prev.otherExpensesList];
            newList.splice(index, 1);
            return { ...prev, otherExpensesList: newList };
        });
    };

    const handleOtherExpenseChange = (index, field, value) => {
        setFormData(prev => {
            const newList = [...prev.otherExpensesList];
            if (field === 'amount') newList[index][field] = value.toString().replace(/^0+(?=\d)/, '');
            else newList[index][field] = value;
            return { ...prev, otherExpensesList: newList };
        });
    };

    const addCreditDebit = (type) => {
        setFormData(prev => ({
            ...prev,
            creditDebit: {
                ...prev.creditDebit,
                [type]: [...prev.creditDebit[type], { employeeRef: '', amount: '' }]
            }
        }));
    };

    const removeCreditDebit = (type, index) => {
        setFormData(prev => {
            const newList = [...prev.creditDebit[type]];
            newList.splice(index, 1);
            return {
                ...prev,
                creditDebit: {
                    ...prev.creditDebit,
                    [type]: newList
                }
            };
        });
    };

    const handleCreditDebitChange = (type, index, field, value) => {
        setFormData(prev => {
            const newList = [...prev.creditDebit[type]];
            if (field === 'amount') {
                newList[index][field] = value.toString().replace(/^0+(?=\d)/, '');
            } else {
                newList[index][field] = value;
            }
            return {
                ...prev,
                creditDebit: {
                    ...prev.creditDebit,
                    [type]: newList
                }
            };
        });
    };

    const filteredExpenses = myExpenses.filter(exp => {
        if (!startDate && !endDate) return true;
        const eDate = new Date(exp.date);
        eDate.setHours(0,0,0,0);
        if (startDate && new Date(startDate) > eDate) return false;
        if (endDate && new Date(endDate) < eDate) return false;
        return true;
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/employee-expense', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast({
                title: "Saved Successfully",
                status: "success",
                duration: 2000
            });
            fetchMyExpenses();
            // Reset form partly
            setFormData({
                date: new Date().toISOString().split('T')[0],
                siteIds: [],
                attendance: 'Present',
                expenses: { breakfast: '', lunch: '', dinner: '', petrol: '' },
                otherExpensesList: [],
                creditDebit: { givenTo: [], receivedFrom: [] },
                notes: ''
            });
        } catch (err) {
            console.error(err);
            toast({
                title: "Error saving expenses",
                description: err.response?.data?.message || err.message,
                status: "error"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box>
            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6} alignItems="start">
                
                {/* ── Left Column: Form ── */}
                <VStack spacing={6} align="stretch" w="full">

                {/* ── Form Section ── */}
                <Card borderRadius="2xl" boxShadow="sm">
                    <CardBody p={6}>
                        <HStack mb={6}>
                            <Box w={7} h={7} borderRadius="lg" bg="orange.500" display="flex" alignItems="center" justifyContent="center">
                                <Icon as={FaRupeeSign} w={3.5} h={3.5} color="white" />
                            </Box>
                            <Heading size="md" color="gray.700">Add Daily Expense & Attendance</Heading>
                        </HStack>

                        <VStack as="form" onSubmit={handleSubmit} spacing={4} align="stretch">
                            <SimpleGrid columns={2} spacing={4}>
                                <FormControl isRequired>
                                    <FormLabel fontSize="sm">Date</FormLabel>
                                    <Input type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} />
                                </FormControl>
                                <FormControl isRequired>
                                    <FormLabel fontSize="sm">Attendance</FormLabel>
                                    <Select value={formData.attendance} onChange={(e) => setFormData({...formData, attendance: e.target.value})}>
                                        <option value="Present">Present</option>
                                        <option value="Half Day">Half Day</option>
                                        <option value="Absent">Absent</option>
                                    </Select>
                                </FormControl>
                            </SimpleGrid>

                            <Box bg="orange.50" p={4} borderRadius="xl" borderWidth="1px" borderColor="orange.100">
                                <HStack justify="space-between" mb={2}>
                                    <Heading size="xs" color="orange.800" textTransform="uppercase">Visited Sites</Heading>
                                    <Button size="xs" colorScheme="orange" variant="ghost" leftIcon={<FaPlus />} onClick={addSite}>Add Site</Button>
                                </HStack>
                                <VStack spacing={2} align="stretch">
                                    {(formData.siteIds || []).map((siteId, idx) => (
                                        <HStack key={idx}>
                                            <Select bg="white" size="sm" placeholder="Select Site" value={siteId} onChange={(e) => handleSiteChange(idx, e.target.value)}>
                                                {sites.map(site => (
                                                    <option key={site._id} value={site._id}>{site.siteName} - {site.client?.clientName || 'Unknown Client'}</option>
                                                ))}
                                            </Select>
                                            <IconButton size="sm" icon={<FaTrash />} colorScheme="red" variant="ghost" onClick={() => removeSite(idx)} />
                                        </HStack>
                                    ))}
                                    {(formData.siteIds?.length === 0 || !formData.siteIds) && <Text fontSize="xs" color="orange.600">No sites mapped to this expense record.</Text>}
                                </VStack>
                            </Box>

                            <Box bg="gray.50" p={4} borderRadius="xl" borderWidth="1px" borderColor="gray.200" shadow="sm">
                                <Heading size="xs" color="gray.600" mb={4} textTransform="uppercase" letterSpacing="wider">Daily Expenses</Heading>
                                <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
                                    <FormControl>
                                        <FormLabel fontSize="xs" mb={1} color="gray.600" fontWeight="bold">Breakfast</FormLabel>
                                        <InputGroup size="sm">
                                            <InputLeftElement pointerEvents="none" color="gray.400" fontSize="xs" children="₹" />
                                            <Input bg="white" type="number" min="0" value={formData.expenses.breakfast} onChange={(e) => handleExpenseChange('breakfast', e.target.value)} />
                                        </InputGroup>
                                    </FormControl>
                                    <FormControl>
                                        <FormLabel fontSize="xs" mb={1} color="gray.600" fontWeight="bold">Lunch</FormLabel>
                                        <InputGroup size="sm">
                                            <InputLeftElement pointerEvents="none" color="gray.400" fontSize="xs" children="₹" />
                                            <Input bg="white" type="number" min="0" value={formData.expenses.lunch} onChange={(e) => handleExpenseChange('lunch', e.target.value)} />
                                        </InputGroup>
                                    </FormControl>
                                    <FormControl>
                                        <FormLabel fontSize="xs" mb={1} color="gray.600" fontWeight="bold">Dinner</FormLabel>
                                        <InputGroup size="sm">
                                            <InputLeftElement pointerEvents="none" color="gray.400" fontSize="xs" children="₹" />
                                            <Input bg="white" type="number" min="0" value={formData.expenses.dinner} onChange={(e) => handleExpenseChange('dinner', e.target.value)} />
                                        </InputGroup>
                                    </FormControl>
                                    <FormControl>
                                        <FormLabel fontSize="xs" mb={1} color="gray.600" fontWeight="bold">Petrol/Commute</FormLabel>
                                        <InputGroup size="sm">
                                            <InputLeftElement pointerEvents="none" color="gray.400" fontSize="xs" children="₹" />
                                            <Input bg="white" type="number" min="0" value={formData.expenses.petrol} onChange={(e) => handleExpenseChange('petrol', e.target.value)} />
                                        </InputGroup>
                                    </FormControl>
                                </SimpleGrid>
                            </Box>

                            <Box bg="purple.50" p={4} borderRadius="xl" borderWidth="1px" borderColor="purple.100">
                                <HStack justify="space-between" mb={2}>
                                    <Heading size="xs" color="purple.800" textTransform="uppercase">Miscellaneous Expenses</Heading>
                                    <Button size="xs" colorScheme="purple" variant="ghost" leftIcon={<FaPlus />} onClick={addOtherExpense}>Add</Button>
                                </HStack>
                                <VStack spacing={2} align="stretch">
                                    {formData.otherExpensesList.map((item, idx) => (
                                        <HStack key={idx}>
                                            <Input bg="white" size="sm" placeholder="Expense Reason / Name" value={item.expenseName} onChange={(e) => handleOtherExpenseChange(idx, 'expenseName', e.target.value)} />
                                            <InputGroup size="sm" w="150px">
                                                <InputLeftElement pointerEvents="none" color="gray.400" fontSize="xs" children="₹" />
                                                <Input bg="white" placeholder="Amount" type="number" value={item.amount} onChange={(e) => handleOtherExpenseChange(idx, 'amount', e.target.value)} />
                                            </InputGroup>
                                            <IconButton size="sm" icon={<FaTrash />} colorScheme="red" variant="ghost" onClick={() => removeOtherExpense(idx)} />
                                        </HStack>
                                    ))}
                                    {formData.otherExpensesList.length === 0 && <Text fontSize="xs" color="purple.600">No other expenses</Text>}
                                </VStack>
                            </Box>

                            <Box bg="blue.50" p={4} borderRadius="xl" borderWidth="1px" borderColor="blue.100">
                                <HStack justify="space-between" mb={2}>
                                    <Heading size="xs" color="blue.800" textTransform="uppercase">Amount Given To</Heading>
                                    <Button size="xs" colorScheme="blue" variant="ghost" leftIcon={<FaPlus />} onClick={() => addCreditDebit('givenTo')}>Add</Button>
                                </HStack>
                                <VStack spacing={2} align="stretch">
                                    {formData.creditDebit.givenTo.map((item, idx) => (
                                        <HStack key={idx}>
                                            <Select bg="white" size="sm" placeholder="Select Employee" value={item.employeeRef} onChange={(e) => handleCreditDebitChange('givenTo', idx, 'employeeRef', e.target.value)}>
                                                {employees.map(emp => <option key={emp._id} value={emp._id}>{emp.name}</option>)}
                                            </Select>
                                            <InputGroup size="sm" w="150px">
                                                <InputLeftElement pointerEvents="none" color="gray.400" fontSize="xs" children="₹" />
                                                <Input bg="white" placeholder="Amount" type="number" value={item.amount} onChange={(e) => handleCreditDebitChange('givenTo', idx, 'amount', e.target.value)} />
                                            </InputGroup>
                                            <IconButton size="sm" icon={<FaTrash />} colorScheme="red" variant="ghost" onClick={() => removeCreditDebit('givenTo', idx)} />
                                        </HStack>
                                    ))}
                                    {formData.creditDebit.givenTo.length === 0 && <Text fontSize="xs" color="blue.600">No records</Text>}
                                </VStack>
                            </Box>

                            <Box bg="green.50" p={4} borderRadius="xl" borderWidth="1px" borderColor="green.100">
                                <HStack justify="space-between" mb={2}>
                                    <Heading size="xs" color="green.800" textTransform="uppercase">Amount Received From</Heading>
                                    <Button size="xs" colorScheme="green" variant="ghost" leftIcon={<FaPlus />} onClick={() => addCreditDebit('receivedFrom')}>Add</Button>
                                </HStack>
                                <VStack spacing={2} align="stretch">
                                    {formData.creditDebit.receivedFrom.map((item, idx) => (
                                        <HStack key={idx}>
                                            <Select bg="white" size="sm" placeholder="Select Employee" value={item.employeeRef} onChange={(e) => handleCreditDebitChange('receivedFrom', idx, 'employeeRef', e.target.value)}>
                                                {employees.map(emp => <option key={emp._id} value={emp._id}>{emp.name}</option>)}
                                            </Select>
                                            <InputGroup size="sm" w="150px">
                                                <InputLeftElement pointerEvents="none" color="gray.400" fontSize="xs" children="₹" />
                                                <Input bg="white" placeholder="Amount" type="number" value={item.amount} onChange={(e) => handleCreditDebitChange('receivedFrom', idx, 'amount', e.target.value)} />
                                            </InputGroup>
                                            <IconButton size="sm" icon={<FaTrash />} colorScheme="red" variant="ghost" onClick={() => removeCreditDebit('receivedFrom', idx)} />
                                        </HStack>
                                    ))}
                                    {formData.creditDebit.receivedFrom.length === 0 && <Text fontSize="xs" color="green.600">No records</Text>}
                                </VStack>
                            </Box>
                            <FormControl>
                                <FormLabel fontSize="sm">Notes</FormLabel>
                                <Input value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} placeholder="Any additional details..." />
                            </FormControl>

                            <Button mt={2} type="submit" colorScheme="orange" size="lg" isLoading={loading} leftIcon={<FaSave />}>
                                Save Daily Record
                            </Button>
                        </VStack>
                    </CardBody>
                </Card>
                </VStack>

                {/* ── History Section ── */}
                <Card borderRadius="2xl" boxShadow="sm" overflow="hidden">
                    <CardBody p={6} bg="gray.50" h="100%" overflowY="auto" maxH="800px">
                        {/* History Header & Filters */}
                        <VStack align="stretch" mb={6} spacing={4}>
                            <HStack>
                                <Box w={7} h={7} borderRadius="lg" bg="teal.500" display="flex" alignItems="center" justifyContent="center">
                                    <Icon as={FaCalendarAlt} w={3.5} h={3.5} color="white" />
                                </Box>
                                <Heading size="md" color="gray.700">My Expense History</Heading>
                            </HStack>
                            
                            <HStack bg="gray.100" p={3} borderRadius="lg" spacing={3} wrap={{ base: 'wrap', sm: 'nowrap' }}>
                                <FormControl>
                                    <FormLabel fontSize="10px" textTransform="uppercase" color="gray.500" mb={1}>Start Date</FormLabel>
                                    <Input size="sm" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} bg="white" />
                                </FormControl>
                                <FormControl>
                                    <FormLabel fontSize="10px" textTransform="uppercase" color="gray.500" mb={1}>End Date</FormLabel>
                                    <Input size="sm" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} bg="white" />
                                </FormControl>
                                <Button size="sm" colorScheme="gray" variant="outline" mt={{ base: 0, sm: 6 }}
                                    onClick={() => { setStartDate(''); setEndDate(''); }}>
                                    Clear
                                </Button>
                            </HStack>
                        </VStack>
                        
                        <VStack spacing={4} align="stretch">
                            {filteredExpenses.length === 0 ? (
                                <Text color="gray.500" textAlign="center" py={10}>No expense records found for this period.</Text>
                            ) : (
                                filteredExpenses.map(exp => (
                                    <Box key={exp._id} p={4} bg="white" borderRadius="xl" boxShadow="sm" borderWidth="1px" borderColor="gray.100">
                                        <HStack justify="space-between" mb={2}>
                                            <Tag colorScheme={exp.attendance === 'Present' ? 'green' : exp.attendance === 'Half Day' ? 'orange' : 'red'}>
                                                {exp.attendance}
                                            </Tag>
                                            <Text fontWeight="bold" fontSize="sm" color="gray.600">
                                                {new Date(exp.date).toLocaleDateString('en-IN', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                                            </Text>
                                        </HStack>
                                        {/* Backwards Compatibility for single site */
                                        exp.siteId && (
                                            <HStack mb={2}>
                                                <Icon as={FaBuilding} color="gray.400" w={3} h={3} />
                                                <Text fontSize="xs" color="gray.600" fontWeight="bold">{exp.siteId.siteName} ({exp.siteId.siteAddress || 'Unknown'})</Text>
                                            </HStack>
                                        )}
                                        {/* New multi site rendering */
                                        exp.siteIds && exp.siteIds.map((s, i) => (
                                            <HStack mb={2} key={i}>
                                                <Icon as={FaBuilding} color="gray.400" w={3} h={3} />
                                                <Text fontSize="xs" color="gray.600" fontWeight="bold">{s.siteName} ({s.siteAddress || 'Unknown'})</Text>
                                            </HStack>
                                        ))}
                                        
                                        <HStack justify="space-between" mt={3} pt={3} borderTop="1px" borderColor="gray.50">
                                            <VStack align="start" spacing={0}>
                                                <Text fontSize="10px" color="gray.400" textTransform="uppercase">Total Expenses</Text>
                                                <Text fontWeight="bold" color="orange.600">₹{Number(exp.expenses?.breakfast||0) + Number(exp.expenses?.lunch||0) + Number(exp.expenses?.dinner||0) + Number(exp.expenses?.petrol||0) + Number(exp.expenses?.other||0) + (exp.otherExpensesList?.reduce((a, b) => a + Number(b.amount||0), 0) || 0)}</Text>
                                            </VStack>
                                            
                                            <VStack align="end" spacing={0}>
                                                {exp.creditDebit?.givenTo?.length > 0 && <Text fontSize="xs" color="blue.600">Given: ₹{exp.creditDebit.givenTo.reduce((acc, curr) => acc + curr.amount, 0)}</Text>}
                                                {exp.creditDebit?.receivedFrom?.length > 0 && <Text fontSize="xs" color="green.600">Rcvd: ₹{exp.creditDebit.receivedFrom.reduce((acc, curr) => acc + curr.amount, 0)}</Text>}
                                            </VStack>
                                        </HStack>
                                    </Box>
                                ))
                            )}
                        </VStack>
                    </CardBody>
                </Card>
            </SimpleGrid>
        </Box>
    );
};

export default EmployeeExpenses;
