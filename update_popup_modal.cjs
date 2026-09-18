const fs = require('fs');
const path = 'd:/uni-eng/uni-fro/src/pages/EmployeeExpensesModule.jsx';
let content = fs.readFileSync(path, 'utf8');

const isCrlf = content.includes('\r\n');
content = content.replace(/\r\n/g, '\n');

// 1. Add monthStats state and useEffect inside DailyReportSection
const targetState = `    const [selectedDetailEntry, setSelectedDetailEntry] = useState(null);
    const { isOpen: isDetailOpen, onOpen: onDetailOpen, onClose: onDetailClose } = useDisclosure();`;

const replacementState = `    const [selectedDetailEntry, setSelectedDetailEntry] = useState(null);
    const { isOpen: isDetailOpen, onOpen: onDetailOpen, onClose: onDetailClose } = useDisclosure();

    // ── Monthly Stats for Selected Employee Modal ──────────────────
    const [monthStats, setMonthStats] = useState({ credit: 0, debit: 0, expense: 0, currentBalance: 0, loading: false });

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
                    api.get(\`/employee-expense/admin/\${empObjectId}\`).catch(() => ({ data: { success: false } })),
                    api.get(\`/employee-transfer\`).catch(() => ({ data: { success: false } })),
                    empObj ? Promise.resolve({ data: { success: true, data: empObj } }) : api.get(\`/employee-master/\${empObjectId}\`).catch(() => ({ data: { success: false } }))
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
                }
            } catch (err) {
                if (isMounted) setMonthStats(prev => ({ ...prev, loading: false }));
            }
        };

        fetchMonthTotals();
        return () => { isMounted = false; };
    }, [selectedDetailEntry, employees]);`;

if (content.includes(targetState)) {
    content = content.replace(targetState, replacementState);
    console.log('1. monthStats state & useEffect added');
} else {
    console.log('1. targetState not found or already added');
}

// 2. Replace the modal code with the rich, comprehensive popup modal
const modalRegex = /\{\/\* Expense Detail Modal \*\/\}[\s\S]*?<\/Modal>/;

const newModalCode = `{/* Expense Detail Modal */}
            <Modal isOpen={isDetailOpen} onClose={onDetailClose} size="2xl" isCentered scrollBehavior="inside">
                <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(5px)" />
                <ModalContent borderRadius="2xl" overflow="hidden" shadow="2xl" maxW={{ base: '95vw', md: '780px' }}>
                    {(() => {
                        if (!selectedDetailEntry) return null;

                        const opName = extractOperative(selectedDetailEntry);
                        const helpersStr = extractHelpers(selectedDetailEntry);
                        const clientName = extractClient(selectedDetailEntry);
                        const siteName = extractSite(selectedDetailEntry);

                        // Find matching schedule for vehicle, instruments, group allocations
                        const entryDateKey = toLocalDateKey(selectedDetailEntry.date);
                        const matchingSchedule = (allSchedules || []).find(s => {
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
                            }
                            return false;
                        });

                        const details = selectedDetailEntry.details || {};

                        // Merged single list for Breakfast, Lunch, Dinner, Fuel, and Other Expenses
                        const mergedExpenses = [];
                        if (Number(details.breakfast) > 0) mergedExpenses.push({ label: 'Breakfast', amount: Number(details.breakfast), icon: '🍳' });
                        if (Number(details.lunch) > 0) mergedExpenses.push({ label: 'Lunch', amount: Number(details.lunch), icon: '🍱' });
                        if (Number(details.dinner) > 0) mergedExpenses.push({ label: 'Dinner', amount: Number(details.dinner), icon: '🍽️' });
                        if (Number(details.petrol) > 0) {
                            const fuelLbl = details.fuelType ? 'Fuel (' + details.fuelType + ')' : 'Fuel / Petrol';
                            mergedExpenses.push({ label: fuelLbl, amount: Number(details.petrol), icon: '⛽' });
                        }
                        if (Array.isArray(details.otherExpensesList)) {
                            details.otherExpensesList.forEach(oe => {
                                const name = oe.expenseName || oe.particulars || oe.name || 'Misc Expense';
                                const amt = Number(oe.amount) || 0;
                                if (amt > 0 || name.trim()) {
                                    mergedExpenses.push({ label: name, amount: amt, icon: '🏷️' });
                                }
                            });
                        }

                        const totalMergedExp = mergedExpenses.reduce((s, e) => s + (e.amount || 0), 0);

                        // Peer transfers
                        const givenTo = Array.isArray(details.givenTo) ? details.givenTo : [];
                        const receivedFrom = Array.isArray(details.receivedFrom) ? details.receivedFrom : [];

                        // Day balance & difference
                        const dayCredit = Number(selectedDetailEntry.totalCredit) || 0;
                        const dayDebit = Number(selectedDetailEntry.totalDebit) || 0;
                        const dayDiff = dayCredit - dayDebit;

                        // Date display string
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
                                    <VStack align="stretch" spacing={2}>
                                        <HStack justify="space-between" align="center" flexWrap="wrap" gap={2}>
                                            <HStack spacing={3}>
                                                <Flex w={9} h={9} borderRadius="xl" bg="whiteAlpha.200" align="center" justify="center" backdropFilter="blur(4px)">
                                                    <Icon as={FaCalendarAlt} color="white" />
                                                </Flex>
                                                <Box>
                                                    <Text fontSize="lg" fontWeight="900" lineHeight="short" letterSpacing="tight">
                                                        {fullDateStr}
                                                    </Text>
                                                    <Text fontSize="xs" color="whiteAlpha.800" fontWeight="600">
                                                        Employee: <Text as="span" color="yellow.300" fontWeight="800">{selectedDetailEntry.empName}</Text>
                                                    </Text>
                                                </Box>
                                            </HStack>
                                            {selectedDetailEntry.attendance && selectedDetailEntry.attendance !== '-' && (
                                                <Badge colorScheme={selectedDetailEntry.attendance === 'Present' ? 'green' : 'red'} variant="solid" px={3} py={1} borderRadius="full" fontSize="xs" fontWeight="800">
                                                    {selectedDetailEntry.attendance === 'Present' ? '✓ Present' : selectedDetailEntry.attendance}
                                                </Badge>
                                            )}
                                        </HStack>

                                        {/* Operative, Helper, Client, Site Badges */}
                                        <Flex flexWrap="wrap" gap={1.5} pt={1}>
                                            {opName && opName !== '—' && (
                                                <Badge bg="whiteAlpha.200" color="white" px={2.5} py={0.5} borderRadius="md" fontSize="10px" textTransform="none">
                                                    👤 Operative: <Text as="span" fontWeight="800" color="cyan.200">{opName}</Text>
                                                </Badge>
                                            )}
                                            {helpersStr && helpersStr !== '—' && (
                                                <Badge bg="whiteAlpha.200" color="white" px={2.5} py={0.5} borderRadius="md" fontSize="10px" textTransform="none">
                                                    🤝 Helper: <Text as="span" fontWeight="800" color="green.200">{helpersStr}</Text>
                                                </Badge>
                                            )}
                                            {clientName && clientName !== '—' && (
                                                <Badge bg="whiteAlpha.200" color="white" px={2.5} py={0.5} borderRadius="md" fontSize="10px" textTransform="none">
                                                    🏢 Client: <Text as="span" fontWeight="800" color="purple.200">{clientName}</Text>
                                                </Badge>
                                            )}
                                            {siteName && siteName !== '—' && (
                                                <Badge bg="whiteAlpha.200" color="white" px={2.5} py={0.5} borderRadius="md" fontSize="10px" textTransform="none">
                                                    📍 Site: <Text as="span" fontWeight="800" color="yellow.200">{siteName}</Text>
                                                </Badge>
                                            )}
                                        </Flex>
                                    </VStack>
                                </ModalHeader>
                                <ModalCloseButton color="white" mt={2} />

                                <ModalBody p={5} bg="gray.50">
                                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                                        {/* ══════ LEFT COLUMN ══════ */}
                                        <VStack spacing={4} align="stretch">
                                            {/* 1. Merged Daily Expenses Breakdown */}
                                            <Box bg="white" p={4} borderRadius="xl" border="1px solid" borderColor="gray.200" shadow="sm">
                                                <HStack justify="space-between" mb={3} borderBottom="1px solid" borderColor="gray.100" pb={2}>
                                                    <HStack spacing={2}>
                                                        <Icon as={FaUtensils} color="orange.500" />
                                                        <Text fontSize="xs" fontWeight="800" color="gray.700" textTransform="uppercase">
                                                            Daily Expenses
                                                        </Text>
                                                    </HStack>
                                                    <Badge colorScheme="orange" variant="subtle" borderRadius="full" fontSize="10px">
                                                        Total: ₹{totalMergedExp.toLocaleString('en-IN')}
                                                    </Badge>
                                                </HStack>

                                                {mergedExpenses.length > 0 ? (
                                                    <VStack align="stretch" spacing={2}>
                                                        {mergedExpenses.map((item, idx) => (
                                                            <HStack key={idx} justify="space-between" p={2} bg="gray.50" borderRadius="lg" fontSize="xs">
                                                                <HStack spacing={2}>
                                                                    <Text fontSize="sm">{item.icon}</Text>
                                                                    <Text color="gray.700" fontWeight="600">{item.label}</Text>
                                                                </HStack>
                                                                <Text fontWeight="800" color="gray.900">₹{item.amount.toLocaleString('en-IN')}</Text>
                                                            </HStack>
                                                        ))}
                                                    </VStack>
                                                ) : (
                                                    <Text fontSize="xs" color="gray.400" fontStyle="italic" py={2} textAlign="center">
                                                        No food, travel or other expenses logged.
                                                    </Text>
                                                )}
                                            </Box>

                                            {/* 2. Peer Transfers */}
                                            <Box bg="white" p={4} borderRadius="xl" border="1px solid" borderColor="gray.200" shadow="sm">
                                                <HStack spacing={2} mb={3} borderBottom="1px solid" borderColor="gray.100" pb={2}>
                                                    <Icon as={FaExchangeAlt} color="blue.500" />
                                                    <Text fontSize="xs" fontWeight="800" color="gray.700" textTransform="uppercase">
                                                        Peer Transfers
                                                    </Text>
                                                </HStack>

                                                <VStack align="stretch" spacing={2.5}>
                                                    {givenTo.length > 0 && (
                                                        <Box>
                                                            <Text fontSize="10px" fontWeight="800" color="red.500" textTransform="uppercase" mb={1.5}>
                                                                🔴 Money Given (Debit)
                                                            </Text>
                                                            <VStack align="stretch" spacing={1.5}>
                                                                {givenTo.map((g, idx) => (
                                                                    <HStack key={idx} justify="space-between" p={2} bg="red.50" borderRadius="lg" fontSize="xs" border="1px solid" borderColor="red.100">
                                                                        <Text color="red.800" fontWeight="600">To: {g.employeeName}</Text>
                                                                        <Text fontWeight="800" color="red.700">₹{Number(g.amount || 0).toLocaleString('en-IN')}</Text>
                                                                    </HStack>
                                                                ))}
                                                            </VStack>
                                                        </Box>
                                                    )}

                                                    {receivedFrom.length > 0 && (
                                                        <Box>
                                                            <Text fontSize="10px" fontWeight="800" color="green.600" textTransform="uppercase" mb={1.5}>
                                                                🟢 Money Received (Credit)
                                                            </Text>
                                                            <VStack align="stretch" spacing={1.5}>
                                                                {receivedFrom.map((r, idx) => (
                                                                    <HStack key={idx} justify="space-between" p={2} bg="green.50" borderRadius="lg" fontSize="xs" border="1px solid" borderColor="green.100">
                                                                        <Text color="green.800" fontWeight="600">From: {r.employeeName}</Text>
                                                                        <Text fontWeight="800" color="green.700">₹{Number(r.amount || 0).toLocaleString('en-IN')}</Text>
                                                                    </HStack>
                                                                ))}
                                                            </VStack>
                                                        </Box>
                                                    )}

                                                    {givenTo.length === 0 && receivedFrom.length === 0 && (
                                                        <Text fontSize="xs" color="gray.400" fontStyle="italic" py={1} textAlign="center">
                                                            No peer transfers for this day.
                                                        </Text>
                                                    )}
                                                </VStack>
                                            </Box>
                                        </VStack>

                                        {/* ══════ RIGHT COLUMN ══════ */}
                                        <VStack spacing={4} align="stretch">
                                            {/* 3. Today's Credit, Debit & Net Difference */}
                                            <Box bg="white" p={4} borderRadius="xl" border="1px solid" borderColor="gray.200" shadow="sm">
                                                <HStack spacing={2} mb={3} borderBottom="1px solid" borderColor="gray.100" pb={2}>
                                                    <Icon as={FaMoneyBillWave} color="purple.500" />
                                                    <Text fontSize="xs" fontWeight="800" color="gray.700" textTransform="uppercase">
                                                        Today's Financial Summary
                                                    </Text>
                                                </HStack>

                                                <SimpleGrid columns={3} spacing={2} textAlign="center" mb={2}>
                                                    <Box p={2.5} bg="green.50" borderRadius="lg" border="1px solid" borderColor="green.100">
                                                        <Text fontSize="9px" fontWeight="800" color="green.600" textTransform="uppercase">Credit</Text>
                                                        <Text fontSize="sm" fontWeight="900" color="green.700">₹{dayCredit.toLocaleString('en-IN')}</Text>
                                                    </Box>

                                                    <Box p={2.5} bg="red.50" borderRadius="lg" border="1px solid" borderColor="red.100">
                                                        <Text fontSize="9px" fontWeight="800" color="red.500" textTransform="uppercase">Debit</Text>
                                                        <Text fontSize="sm" fontWeight="900" color="red.700">₹{dayDebit.toLocaleString('en-IN')}</Text>
                                                    </Box>

                                                    <Box p={2.5} bg={dayDiff >= 0 ? 'blue.50' : 'orange.50'} borderRadius="lg" border="1px solid" borderColor={dayDiff >= 0 ? 'blue.100' : 'orange.100'}>
                                                        <Text fontSize="9px" fontWeight="800" color={dayDiff >= 0 ? 'blue.600' : 'orange.600'} textTransform="uppercase">Difference</Text>
                                                        <Text fontSize="sm" fontWeight="900" color={dayDiff >= 0 ? 'blue.700' : 'orange.700'}>
                                                            {dayDiff >= 0 ? '+₹' + dayDiff.toLocaleString('en-IN') : '-₹' + Math.abs(dayDiff).toLocaleString('en-IN')}
                                                        </Text>
                                                    </Box>
                                                </SimpleGrid>
                                            </Box>

                                            {/* 4. Remarks & Notes */}
                                            <Box bg="white" p={4} borderRadius="xl" border="1px solid" borderColor="gray.200" shadow="sm">
                                                <HStack spacing={2} mb={2} borderBottom="1px solid" borderColor="gray.100" pb={2}>
                                                    <Icon as={FaFileAlt} color="teal.500" />
                                                    <Text fontSize="xs" fontWeight="800" color="gray.700" textTransform="uppercase">
                                                        Remarks & Notes
                                                    </Text>
                                                </HStack>

                                                <VStack align="stretch" spacing={2} fontSize="xs">
                                                    {selectedDetailEntry.attendanceRemark && (
                                                        <Box bg="blue.50" p={2} borderRadius="md" border="1px solid" borderColor="blue.100">
                                                            <Text fontSize="10px" fontWeight="700" color="blue.700">Attendance Remark:</Text>
                                                            <Text color="gray.800">{selectedDetailEntry.attendanceRemark}</Text>
                                                        </Box>
                                                    )}
                                                    {details.notes && (
                                                        <Box bg="yellow.50" p={2} borderRadius="md" border="1px solid" borderColor="yellow.100">
                                                            <Text fontSize="10px" fontWeight="700" color="orange.700">Submission Notes:</Text>
                                                            <Text color="gray.800">{details.notes}</Text>
                                                        </Box>
                                                    )}
                                                    {selectedDetailEntry.workLocation && (
                                                        <HStack justify="space-between" bg="gray.50" p={2} borderRadius="md">
                                                            <Text color="gray.500" fontWeight="600">Work Location:</Text>
                                                            <Badge colorScheme="purple">{selectedDetailEntry.workLocation}</Badge>
                                                        </HStack>
                                                    )}
                                                    {!selectedDetailEntry.attendanceRemark && !details.notes && !selectedDetailEntry.workLocation && (
                                                        <Text color="gray.400" fontStyle="italic" py={1} textAlign="center">
                                                            No remarks recorded.
                                                        </Text>
                                                    )}
                                                </VStack>
                                            </Box>

                                            {/* 5. Schedule & Equipment Allocation */}
                                            <Box bg="white" p={4} borderRadius="xl" border="1px solid" borderColor="gray.200" shadow="sm">
                                                <HStack spacing={2} mb={2} borderBottom="1px solid" borderColor="gray.100" pb={2}>
                                                    <Icon as={FaTools} color="indigo.500" />
                                                    <Text fontSize="xs" fontWeight="800" color="gray.700" textTransform="uppercase">
                                                        Equipment & Allocations
                                                    </Text>
                                                </HStack>

                                                <VStack align="stretch" spacing={2} fontSize="xs">
                                                    {/* Vehicle */}
                                                    <HStack justify="space-between" bg="gray.50" p={2} borderRadius="md">
                                                        <HStack spacing={2}>
                                                            <Text>🚗</Text>
                                                            <Text color="gray.600" fontWeight="600">Vehicle:</Text>
                                                        </HStack>
                                                        <Text fontWeight="700" color="gray.800" textAlign="right">
                                                            {matchingSchedule?.vehicle?.vehicleNumber
                                                                ? matchingSchedule.vehicle.vehicleNumber + ' (' + (matchingSchedule.vehicle.vehicleName || 'Vehicle') + ')'
                                                                : 'Not Allocated'}
                                                        </Text>
                                                    </HStack>

                                                    {/* Instruments */}
                                                    <Box bg="gray.50" p={2} borderRadius="md">
                                                        <HStack justify="space-between" mb={matchingSchedule?.instruments?.length > 0 ? 1 : 0}>
                                                            <HStack spacing={2}>
                                                                <Text>🛠️</Text>
                                                                <Text color="gray.600" fontWeight="600">Instruments:</Text>
                                                            </HStack>
                                                            <Badge colorScheme={matchingSchedule?.instruments?.length > 0 ? 'blue' : 'gray'}>
                                                                {(matchingSchedule?.instruments?.length || 0) + ' Assigned'}
                                                            </Badge>
                                                        </HStack>
                                                        {matchingSchedule?.instruments?.length > 0 ? (
                                                            <VStack align="stretch" spacing={1} pl={6} pt={1}>
                                                                {matchingSchedule.instruments.map((inst, iIdx) => (
                                                                    <Text key={iIdx} fontSize="11px" color="gray.700">
                                                                        • <Text as="span" fontWeight="700">{inst.instrumentName || 'Instrument'}</Text> {inst.serialNo ? '(' + inst.serialNo + ')' : ''} {inst.model ? '[' + inst.model + ']' : ''}
                                                                    </Text>
                                                                ))}
                                                            </VStack>
                                                        ) : (
                                                            <Text fontSize="11px" color="gray.400" pl={6}>No instruments assigned.</Text>
                                                        )}
                                                    </Box>

                                                    {/* Group / Schedule Type */}
                                                    <HStack justify="space-between" bg="gray.50" p={2} borderRadius="md">
                                                        <HStack spacing={2}>
                                                            <Text>👥</Text>
                                                            <Text color="gray.600" fontWeight="600">Group / Type:</Text>
                                                        </HStack>
                                                        <Badge colorScheme="purple">
                                                            {matchingSchedule?.monthGroupId ? 'Group #' + matchingSchedule.monthGroupId : (matchingSchedule?.scheduleType || 'Standard')}
                                                        </Badge>
                                                    </HStack>
                                                </VStack>
                                            </Box>

                                            {/* 6. Current Month Totals */}
                                            <Box bg="gradient" bgGradient="linear(to-br, blue.50, indigo.50)" p={4} borderRadius="xl" border="1px solid" borderColor="blue.100" shadow="sm">
                                                <HStack justify="space-between" mb={2} borderBottom="1px solid" borderColor="blue.100" pb={2}>
                                                    <HStack spacing={2}>
                                                        <Icon as={FaCalendarAlt} color="blue.600" />
                                                        <Text fontSize="xs" fontWeight="800" color="blue.900" textTransform="uppercase">
                                                            {monthName + ' Overview'}
                                                        </Text>
                                                    </HStack>
                                                    {monthStats.loading && <Spinner size="xs" color="blue.500" />}
                                                </HStack>

                                                <SimpleGrid columns={3} spacing={2} textAlign="center">
                                                    <Box p={2} bg="white" borderRadius="md" shadow="2xs">
                                                        <Text fontSize="9px" fontWeight="700" color="green.600" textTransform="uppercase">Month Credit</Text>
                                                        <Text fontSize="xs" fontWeight="900" color="green.700">₹{monthStats.credit.toLocaleString('en-IN')}</Text>
                                                    </Box>

                                                    <Box p={2} bg="white" borderRadius="md" shadow="2xs">
                                                        <Text fontSize="9px" fontWeight="700" color="red.500" textTransform="uppercase">Month Debit</Text>
                                                        <Text fontSize="xs" fontWeight="900" color="red.700">₹{monthStats.debit.toLocaleString('en-IN')}</Text>
                                                    </Box>

                                                    <Box p={2} bg="white" borderRadius="md" shadow="2xs">
                                                        <Text fontSize="9px" fontWeight="700" color="blue.600" textTransform="uppercase">Current Balance</Text>
                                                        <Text fontSize="xs" fontWeight="900" color={monthStats.currentBalance >= 0 ? 'blue.700' : 'red.600'}>
                                                            ₹{monthStats.currentBalance.toLocaleString('en-IN')}
                                                        </Text>
                                                    </Box>
                                                </SimpleGrid>
                                            </Box>
                                        </VStack>
                                    </SimpleGrid>
                                </ModalBody>

                                <ModalFooter bg="gray.100" py={3} px={6} borderTop="1px solid" borderColor="gray.200" justify="space-between">
                                    <Text fontSize="xs" color="gray.500">
                                        Click anywhere outside or press Esc to dismiss
                                    </Text>
                                    <Button size="sm" colorScheme="blue" onClick={onDetailClose} px={6} borderRadius="lg">
                                        Close
                                    </Button>
                                </ModalFooter>
                            </>
                        );
                    })()}
                </ModalContent>
            </Modal>`;

if (modalRegex.test(content)) {
    content = content.replace(modalRegex, newModalCode);
    console.log('2. Detail Modal replaced successfully');
} else {
    console.log('2. modalRegex did not match');
}

if (isCrlf) {
    content = content.replace(/\n/g, '\r\n');
}

fs.writeFileSync(path, content, 'utf8');
console.log('EmployeeExpensesModule.jsx written successfully');
