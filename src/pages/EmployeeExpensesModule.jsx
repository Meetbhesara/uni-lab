import React, { useState, useEffect, useMemo } from 'react';
import {
    Box, Container, VStack, HStack, Text, Heading, SimpleGrid, Card, CardBody, 
    Button, IconButton, Icon, Badge, Select, Input, InputGroup, InputLeftElement, 
    Table, Thead, Tbody, Tr, Th, Td, TableContainer, Divider, useToast, 
    Tabs, TabList, TabPanels, Tab, TabPanel, FormControl, FormLabel,
    Flex, Spinner, Center, Tooltip, CloseButton, Image, List, ListItem, ListIcon,
    Popover, PopoverTrigger, PopoverContent, PopoverBody, PopoverArrow, Portal,
    Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
    useDisclosure, Switch
} from '@chakra-ui/react';
import { 
    FaMoneyBillWave, FaExchangeAlt, FaPlus, FaTrash, FaEye,
    FaUserTie, FaCheckCircle, FaEdit, FaRupeeSign, FaArrowRight,
    FaCalendarAlt, FaUtensils, FaGasPump, FaBuilding, FaCamera, FaFileAlt, FaFolderOpen, FaChartBar, FaCloudUploadAlt,
    FaPaperclip, FaUsers, FaChevronLeft, FaChevronRight, FaUserCheck, FaUserSlash, FaClipboardList
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
    const [reportType, setReportType] = useState('Ledger');
    
    // Default to Current Financial Year
    const getCurrentFY = () => {
        const today = new Date();
        return today.getMonth() < 3 ? today.getFullYear() - 1 : today.getFullYear();
    };
    
    const today = new Date();
    const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
    const currentDate = today.toISOString().split('T')[0];
    
    const [selectedFY, setSelectedFY] = useState('');
    const [selectedMonth, setSelectedMonth] = useState('');
    const [fyPageStart, setFyPageStart] = useState(Math.floor(getCurrentFY() / 12) * 12);
    const [globalStartDate, setGlobalStartDate] = useState(currentMonthStart);
    const [globalEndDate, setGlobalEndDate] = useState(currentDate);

    return (
        <Box py={{ base: 4, md: 10 }} bg="gray.50" minH="100vh">
            <Container maxW="container.xl" px={{ base: 2, md: 4 }}>
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
                    <Tabs variant="unstyled" defaultIndex={0} isLazy>
                        <Box overflowX="auto" pb={1}>
                        <TabList bg="white" p={1.5} borderRadius="2xl" shadow="sm" border="1px solid" borderColor="gray.100" display="inline-flex" minW="max-content">
                            <Tab 
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
                                <Icon as={FaExchangeAlt} mr={{ base: 1, md: 2 }} /> Money Transfer
                            </Tab>
                            <Tab 
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
                                <Icon as={FaPlus} mr={{ base: 1, md: 2 }} /> Daily Expenses
                            </Tab>
                            <Tab 
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
                                <Icon as={FaChartBar} mr={{ base: 1, md: 2 }} /> Daily Report
                            </Tab>
                        </TabList>
                        </Box>

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
                                <DailyReportSection employees={employees} />
                            </TabPanel>
                        </TabPanels>
                    </Tabs>
                </VStack>
            </Container>
        </Box>
    );
};

// ── Daily Report Section ──────────────────────────────────────────────
const _getCurrFY = () => { const t = new Date(); return t.getMonth() < 3 ? t.getFullYear()-1 : t.getFullYear(); };

const DailyReportSection = ({ employees = [] }) => {
    const [data, setData]               = useState([]);
    const [summaryLoading, setSummaryLoading] = useState(true);
    const [lastRefreshed, setLastRefreshed]   = useState(null);

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

    const fmtDate = (d) => new Date(d).toLocaleDateString('en-IN', { day:'2-digit', month:'short', weekday:'short' });
    const fmtAmt  = (n) => `₹${Number(n||0).toLocaleString('en-IN')}`;

    const attStyle = (s) => ({
        Present: { bg:'#f0fdf4', color:'#15803d', label:'✓ Present' },
        Absent:  { bg:'#fef2f2', color:'#dc2626', label:'✗ Absent'  },
        Leave:   { bg:'#fff7ed', color:'#c2410c', label:'◷ Leave'   },
    }[s] || { bg:'#f8fafc', color:'#94a3b8', label: s || '—' });

    const fetchSummary = async () => {
        setSummaryLoading(true);
        try {
            const res = await api.get('/employee-expense/report/daily-summary');
            if (res.data.success) { setData(res.data.data); setLastRefreshed(new Date()); }
        } catch (e) { console.error(e); }
        finally { setSummaryLoading(false); }
    };
    useEffect(() => { fetchSummary(); }, []);

    const fmtMonthFn = (d) => { const y=d.getFullYear(), m=String(d.getMonth()+1).padStart(2,'0'), dd=String(d.getDate()).padStart(2,'0'); return `${y}-${m}-${dd}`; };

    return (
        <VStack spacing={8} align="stretch">

            {/* ════════ SECTION 1 — Last 5 Days ════════ */}
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
                    <VStack spacing={3} align="stretch">
                        {data.map((emp) => {
                            const groupedMap = {};
                            (emp.entries || []).forEach(e => {
                                const dk = new Date(e.date).toISOString().split('T')[0];
                                if (!groupedMap[dk]) groupedMap[dk] = { ...e };
                                else {
                                    groupedMap[dk].totalDebit = (groupedMap[dk].totalDebit||0) + (e.totalDebit||0);
                                    groupedMap[dk].totalCredit = (groupedMap[dk].totalCredit||0) + (e.totalCredit||0);
                                    if ((!groupedMap[dk].attendance || groupedMap[dk].attendance === '-') && e.attendance && e.attendance !== '-') groupedMap[dk].attendance = e.attendance;
                                    if (e.siteNames && !groupedMap[dk].siteNames?.includes(e.siteNames)) groupedMap[dk].siteNames = groupedMap[dk].siteNames ? `${groupedMap[dk].siteNames} | ${e.siteNames}` : e.siteNames;
                                    if (groupedMap[dk].category !== e.category) groupedMap[dk].category = 'Combined';
                                }
                            });
                            const asc = Object.values(groupedMap).sort((a,b)=>new Date(a.date)-new Date(b.date));
                            const totD = asc.reduce((s,e)=>s+(e.totalDebit||0),0);
                            const totC = asc.reduce((s,e)=>s+(e.totalCredit||0),0);
                            const initials = emp.empName.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();

                            return (
                                <Box key={emp.empId} bg="white" borderRadius="xl" border="1px solid" borderColor="gray.100" shadow="sm" overflow="hidden">
                                    {/* — Employee header — */}
                                    <Flex px={4} py={2.5} bg="gray.50" borderBottom="1px solid" borderColor="gray.100" align="center" justify="space-between" flexWrap="wrap" gap={2}>
                                        <HStack spacing={3}>
                                            <Flex w={7} h={7} borderRadius="md" bg="blue.500" align="center" justify="center" color="white" fontWeight="800" fontSize="xs" flexShrink={0}>
                                                {initials}
                                            </Flex>
                                            <Text fontWeight="700" fontSize="sm" color="gray.800">{emp.empName}</Text>
                                            <Badge colorScheme="gray" variant="subtle" borderRadius="full" fontSize="9px">{asc.length} entries</Badge>
                                        </HStack>
                                    </Flex>

                                    {/* — Column headers — */}
                                    <Flex px={4} py={1.5} bg="gray.50" borderBottom="1px solid" borderColor="gray.100">
                                        <Text flex="0 0 100px" fontSize="9px" fontWeight="700" color="gray.400" textTransform="uppercase">Date</Text>
                                        <Text flex="0 0 90px"  fontSize="9px" fontWeight="700" color="gray.400" textTransform="uppercase">Attendance</Text>
                                        <Text flex={1}         fontSize="9px" fontWeight="700" color="gray.400" textTransform="uppercase">Site / Note</Text>
                                        <Text flex="0 0 80px"  fontSize="9px" fontWeight="700" color="gray.400" textTransform="uppercase" textAlign="right">Credit</Text>
                                        <Text flex="0 0 80px"  fontSize="9px" fontWeight="700" color="gray.400" textTransform="uppercase" textAlign="right" ml={2}>Debit</Text>
                                        <Text flex="0 0 65px"  fontSize="9px" fontWeight="700" color="gray.400" textTransform="uppercase" textAlign="center" ml={2}>Type</Text>
                                    </Flex>

                                    {/* — Rows — */}
                                    {asc.map((entry, idx) => {
                                        const att = attStyle(entry.attendance);
                                        const hasDebitOnly  = entry.totalDebit > 0 && entry.totalCredit === 0;
                                        const hasCreditOnly = entry.totalCredit > 0 && entry.totalDebit === 0;
                                        return (
                                            <Flex
                                                key={idx}
                                                px={4} py={2.5}
                                                align="center"
                                                bg={idx%2===0 ? 'white' : 'gray.50'}
                                                borderLeft="3px solid"
                                                borderLeftColor={hasDebitOnly ? 'red.300' : hasCreditOnly ? 'green.300' : 'transparent'}
                                                borderBottom={idx < asc.length-1 ? "1px solid" : "none"}
                                                borderColor="gray.50"
                                                _hover={{ bg:'blue.50' }}
                                                transition="background 0.15s"
                                                flexWrap={{ base:'wrap', md:'nowrap' }}
                                                gap={1}
                                            >
                                                <Text flex="0 0 100px" fontSize="xs" fontWeight="600" color="gray.700">{fmtDate(entry.date)}</Text>
                                                <Box flex="0 0 90px">
                                                    {entry.attendance && entry.attendance !== '-' ? (
                                                        <Box display="inline-flex" px={2} py={0.5} borderRadius="md" bg={att.bg} fontSize="10px" fontWeight="700" color={att.color} whiteSpace="nowrap">
                                                            {att.label}
                                                        </Box>
                                                    ) : <Text fontSize="xs" color="gray.300">—</Text>}
                                                </Box>
                                                <Box flex={1} minW={0}>
                                                    <Text fontSize="xs" color={entry.siteNames ? 'gray.600' : 'gray.300'} noOfLines={1}>
                                                        {entry.siteNames || '—'}
                                                    </Text>
                                                    {entry.attendanceRemark && !entry.attendanceRemark.toLowerCase().includes('auto-marked') && !entry.attendanceRemark.toLowerCase().includes('auto marked') && (
                                                        <Text fontSize="9px" color="orange.400">{entry.attendanceRemark}</Text>
                                                    )}
                                                </Box>
                                                <Text flex="0 0 80px" fontSize="xs" fontWeight="700" color={entry.totalCredit>0 ? 'green.500' : 'gray.200'} textAlign="right">
                                                    {entry.totalCredit>0 ? fmtAmt(entry.totalCredit) : '—'}
                                                </Text>
                                                <Text flex="0 0 80px" fontSize="xs" fontWeight="700" color={entry.totalDebit>0 ? 'red.500' : 'gray.200'} textAlign="right" ml={2}>
                                                    {entry.totalDebit>0 ? fmtAmt(entry.totalDebit) : '—'}
                                                </Text>
                                                <Box flex="0 0 65px" ml={2} textAlign="center">
                                                    <Badge colorScheme={entry.category==='Transfer' ? 'purple' : entry.category==='Combined' ? 'teal' : 'blue'} variant="subtle" borderRadius="md" fontSize="9px">
                                                        {entry.category==='Transfer' ? 'Transfer' : entry.category==='Combined' ? 'Combined' : 'Expense'}
                                                    </Badge>
                                                </Box>
                                            </Flex>
                                        );
                                    })}

                                    {/* — Totals footer — */}
                                    {(totD > 0 || totC > 0) && (
                                        <Flex px={4} py={2} bg="blue.50" borderTop="1px solid" borderColor="blue.100" align="center" justify="flex-end" gap={6}>
                                            <Text fontSize="10px" color="gray.500" fontWeight="600" flex={1}>5-Day Total</Text>
                                            {totC > 0 && <Text fontSize="xs" fontWeight="800" color="green.600">{fmtAmt(totC)} Credit</Text>}
                                            {totD > 0 && <Text fontSize="xs" fontWeight="800" color="red.500">{fmtAmt(totD)} Debit</Text>}
                                        </Flex>
                                    )}
                                </Box>
                            );
                        })}
                    </VStack>
                )}
            </Box>

            {/* ════════ Divider ════════ */}
            <Flex align="center" gap={3}>
                <Divider borderColor="gray.200" />
                <Text fontSize="10px" color="gray.400" fontWeight="700" whiteSpace="nowrap" letterSpacing="widest">ADVANCED REPORTS</Text>
                <Divider borderColor="gray.200" />
            </Flex>

            {/* ════════ SECTION 2 — Custom Reports ════════ */}
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

        </VStack>
    );
};

// ── Daily Expenses Module ──────────────────────────────────────────────

const DailyExpensesSection = ({ employees, clients, sites, loading, onRefresh, onUpdateEmployee }) => {
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

    useEffect(() => {
        if (!date) return;
        const fetchDaySchedules = async () => {
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
            }
        };
        fetchDaySchedules();
    }, [date]);

    useEffect(() => {
        fetchCommittedExpenses();
    }, [selectedEmployeeId, date]);

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
            return opId === targetId;
        });
    }, [daySchedules, selectedEmployeeId]);

    // Auto-mark Attendance based on schedule status (for current and past dates only)
    useEffect(() => {
        if (!date || !selectedEmployeeId) return;

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
                setAttendanceRemark('No schedule assigned');
            }
        }
    }, [employeeSchedules, date, selectedEmployeeId]);

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
                        ledger: existingRow?.ledger && existingRow.ledger !== '' ? existingRow.ledger : ledger,
                        quantity: existingRow?.quantity !== undefined ? existingRow.quantity : quantity,
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
                quantity: 0,
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
                                                            onChange={(e) => updateClientSite(idx, 'quantity', Number(e.target.value) || 0)}
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
const UnscheduledAttendancePanel = ({ employees, daySchedules, attendanceDate }) => {
    const toast = useToast();
    const [attendanceMap, setAttendanceMap] = useState({});
    const [remarks, setRemarks] = useState({});
    const [isSaving, setIsSaving] = useState(false);
    const [savedAttendance, setSavedAttendance] = useState([]);

    // Compute IDs of all scheduled operatives + helpers
    const scheduledIds = useMemo(() => {
        const ids = new Set();
        daySchedules.forEach(s => {
            const opId = s.operative?._id || s.operative;
            if (opId) ids.add(String(opId));
            (s.helpers || []).forEach(h => {
                const hId = h._id || h;
                if (hId) ids.add(String(hId));
            });
        });
        return ids;
    }, [daySchedules]);

    // Employees NOT in the scheduler for this date
    const unscheduledEmployees = useMemo(() => {
        return employees.filter(e => !scheduledIds.has(String(e._id)));
    }, [employees, scheduledIds]);

    // Fetch existing attendance for this date
    useEffect(() => {
        if (!attendanceDate) return;
        const fetchExisting = async () => {
            try {
                const res = await api.get(`/employee-expense/attendance?date=${attendanceDate}`);
                if (res.data.success) {
                    setSavedAttendance(res.data.data || []);
                    // Pre-fill map from saved
                    const map = {};
                    const rem = {};
                    (res.data.data || []).forEach(a => {
                        map[a.employeeId] = a.attendance;
                        rem[a.employeeId] = a.attendanceRemark || '';
                    });
                    setAttendanceMap(map);
                    setRemarks(rem);
                }
            } catch (err) {
                // Silently handle — attendance endpoint may not exist yet
            }
        };
        fetchExisting();
    }, [attendanceDate]);

    const setStatus = (empId, status) => {
        setAttendanceMap(prev => ({ ...prev, [empId]: status }));
    };

    const setRemark = (empId, val) => {
        setRemarks(prev => ({ ...prev, [empId]: val }));
    };

    const handleSaveAttendance = async () => {
        const entries = unscheduledEmployees
            .filter(e => attendanceMap[e._id])
            .map(e => ({
                employeeId: e._id,
                date: attendanceDate,
                attendance: attendanceMap[e._id],
                attendanceRemark: remarks[e._id] || ''
            }));

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
            }
        } catch (err) {
            toast({ title: 'Error', description: err.response?.data?.message || 'Failed to save attendance', status: 'error', position: 'top-right' });
        } finally {
            setIsSaving(false);
        }
    };

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

                <Box p={6}>
                    <TableContainer>
                        <Table size="sm" variant="simple">
                            <Thead>
                                <Tr bg="orange.50">
                                    <Th color="orange.700" fontSize="xs" fontWeight="black" py={3}>Employee Name</Th>
                                    <Th textAlign="center" color="orange.700" fontSize="xs" fontWeight="black" py={3}>
                                        <HStack justify="center" spacing={1}>
                                            <Icon as={FaUserCheck} color="green.500" />
                                            <Text>Present</Text>
                                        </HStack>
                                    </Th>
                                    <Th textAlign="center" color="orange.700" fontSize="xs" fontWeight="black" py={3}>
                                        <HStack justify="center" spacing={1}>
                                            <Icon as={FaUserSlash} color="red.400" />
                                            <Text>Absent</Text>
                                        </HStack>
                                    </Th>
                                    <Th color="orange.700" fontSize="xs" fontWeight="black" py={3}>Remark</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {unscheduledEmployees.map((emp, idx) => {
                                    const status = attendanceMap[emp._id] || '';
                                    const saved = savedAttendance.find(a => a.employeeId === emp._id);
                                    return (
                                        <Tr key={emp._id}
                                            bg={idx % 2 === 0 ? 'white' : 'orange.50'}
                                            _hover={{ bg: 'yellow.50' }}
                                            transition="background 0.15s"
                                        >
                                            <Td py={3}>
                                                <HStack spacing={2}>
                                                    <Box w={2} h={2} borderRadius="full"
                                                        bg={status === 'Present' ? 'green.400' : status === 'Absent' ? 'red.400' : 'gray.200'}
                                                    />
                                                    <Text fontWeight="bold" fontSize="sm" color="gray.700">{emp.name}</Text>
                                                    {saved && (
                                                        <Badge colorScheme={saved.attendance === 'Present' ? 'green' : saved.attendance === 'Half Day' ? 'orange' : 'red'}
                                                            fontSize="9px" borderRadius="full" px={2}>
                                                            Saved
                                                        </Badge>
                                                    )}
                                                </HStack>
                                            </Td>
                                            <Td textAlign="center">
                                                <Button
                                                    size="xs"
                                                    borderRadius="full"
                                                    colorScheme={status === 'Present' ? 'green' : 'gray'}
                                                    variant={status === 'Present' ? 'solid' : 'outline'}
                                                    onClick={() => setStatus(emp._id, status === 'Present' ? '' : 'Present')}
                                                    minW="60px"
                                                >
                                                    {status === 'Present' ? '✓ P' : 'P'}
                                                </Button>
                                            </Td>
                                            <Td textAlign="center">
                                                <Button
                                                    size="xs"
                                                    borderRadius="full"
                                                    colorScheme={status === 'Absent' ? 'red' : 'gray'}
                                                    variant={status === 'Absent' ? 'solid' : 'outline'}
                                                    onClick={() => setStatus(emp._id, status === 'Absent' ? '' : 'Absent')}
                                                    minW="60px"
                                                >
                                                    {status === 'Absent' ? '✓ A' : 'A'}
                                                </Button>
                                            </Td>
                                            <Td>
                                                <Input
                                                    size="xs"
                                                    placeholder="Optional remark..."
                                                    value={remarks[emp._id] || ''}
                                                    onChange={e => setRemark(emp._id, e.target.value)}
                                                    borderRadius="lg"
                                                    maxW="180px"
                                                    isDisabled={!status}
                                                />
                                            </Td>
                                        </Tr>
                                    );
                                })}
                            </Tbody>
                        </Table>
                    </TableContainer>

                    <Flex justify="flex-end" mt={4}>
                        <Button
                            colorScheme="orange"
                            leftIcon={<FaCheckCircle />}
                            borderRadius="xl"
                            shadow="md"
                            isLoading={isSaving}
                            loadingText="Saving..."
                            onClick={handleSaveAttendance}
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
            }
        } catch (err) {
            toast({ title: 'Error', description: err.response?.data?.message || 'Delete failed', status: 'error' });
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

                        <Button colorScheme="blue" size="lg" borderRadius="xl" onClick={handleAddEntry} leftIcon={editIndex > -1 ? <FaCheckCircle /> : <FaPlus />} shadow="lg">
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

            {/* ── Attendance Panel for Unscheduled Employees ── */}
            <UnscheduledAttendancePanel
                employees={employees}
                daySchedules={daySchedules}
                attendanceDate={transferDate}
            />

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
                        <TableContainer overflowX="auto">
                            <Table variant="simple">
                                <Thead bg="teal.50">
                                    <Tr>
                                        <Th color="teal.700">Employee From (Sender)</Th>
                                        <Th color="teal.700">Employee To (Receiver)</Th>
                                        <Th isNumeric color="teal.700">Amount</Th>
                                        <Th textAlign="center" color="teal.700">Actions</Th>
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
                                            <Td>
                                                <HStack justify="center">
                                                    <IconButton
                                                        size="sm"
                                                        colorScheme="red"
                                                        variant="ghost"
                                                        icon={<Icon as={FaTrash} />}
                                                        aria-label="Delete Transfer"
                                                        onClick={() => handleDeleteCommittedTransfer(t._id)}
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
        </VStack>
    );
};

export default EmployeeExpensesModule;
