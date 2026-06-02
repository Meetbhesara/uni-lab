import React, { useState, useEffect, useCallback } from 'react';
import {
    Box, Container, VStack, HStack, Text, Heading, Badge, Button, IconButton,
    Icon, Input, Select, Table, Thead, Tbody, Tr, Th, Td, TableContainer,
    Card, CardBody, SimpleGrid, Flex, Spinner, Center, useToast,
    Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter,
    ModalCloseButton, useDisclosure, Tooltip, Tag, Divider, InputGroup, InputLeftElement
} from '@chakra-ui/react';
import {
    FaFileInvoiceDollar, FaEye, FaCheckCircle, FaClock, FaSearch,
    FaCalendarAlt, FaUser, FaBuilding, FaMapMarkerAlt, FaFilter,
    FaFileAlt, FaCamera, FaFilePdf, FaSyncAlt, FaDownload
} from 'react-icons/fa';
import api from '../../api/axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

// ── Helpers ─────────────────────────────────────────────────────────────────
const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
};

// Row color coding by ledger type and schedule type
const rowStyle = (s) => {
    if (s.isMonthGroup || s.scheduleType === 'MONTH') {
        return { bg: 'blue.50', border: 'blue.400', hoverBg: 'blue.100' };
    }
    if (s.ledger === 'Full Day') return { bg: 'green.50', border: 'green.300', hoverBg: 'green.100' };
    if (s.ledger === 'Half Day') return { bg: 'orange.50', border: 'orange.300', hoverBg: 'orange.100' };
    return { bg: 'white', border: 'gray.200', hoverBg: 'gray.50' };
};

// ── Main Component ────────────────────────────────────────────────────────────
const InvoiceReport = () => {
    const toast = useToast();
    const { isOpen, onOpen, onClose } = useDisclosure();

    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(false);
    const [updatingId, setUpdatingId] = useState(null);
    const [viewTarget, setViewTarget] = useState(null);

    // Filters
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterLedger, setFilterLedger] = useState('');
    const [filterDateFrom, setFilterDateFrom] = useState('');
    const [filterDateTo, setFilterDateTo] = useState('');

    // Fetch VISIT schedules
    const fetchVisitSchedules = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filterDateFrom) params.append('startDate', filterDateFrom);
            if (filterDateTo) params.append('endDate', filterDateTo);
            if (filterStatus) params.append('invoiceStatus', filterStatus);

            const res = await api.get(`/schedule-master?${params.toString()}`);
            if (res.data.success) {
                const rawData = res.data.data;
                const groupedData = [];
                const monthGroups = {};

                rawData.forEach(s => {
                    if (s.scheduleType === 'MONTH') {
                        if (!s.monthGroupId) return; // STRICT: Ignore legacy month schedules without a group ID to ensure accurate reporting
                        
                        const groupId = s.monthGroupId;
                        const groupKey = `${s.client?._id}-${s.site?._id}-${groupId}`;
                        
                        if (!monthGroups[groupKey]) {
                            // First occurrence of this contract
                            monthGroups[groupKey] = { ...s };
                            monthGroups[groupKey].isMonthGroup = true;
                            monthGroups[groupKey].groupedDates = [s.scheduleDate];
                            monthGroups[groupKey].allExpenses = s.employeeExpenses || [];
                            monthGroups[groupKey].allDocuments = s.uploadedDocuments || [];
                        } else {
                            // Merge subsequent days into the group
                            monthGroups[groupKey].groupedDates.push(s.scheduleDate);
                            if (s.employeeExpenses) {
                                monthGroups[groupKey].allExpenses = [
                                    ...monthGroups[groupKey].allExpenses,
                                    ...s.employeeExpenses
                                ];
                            }
                            if (s.uploadedDocuments) {
                                monthGroups[groupKey].allDocuments = [
                                    ...monthGroups[groupKey].allDocuments,
                                    ...s.uploadedDocuments
                                ];
                            }
                        }
                    } else if (s.scheduleType === 'VISIT' || !s.scheduleType) {
                        groupedData.push(s);
                    }
                });

                // Convert groups back to array and merge with visits
                Object.values(monthGroups).forEach(mg => {
                    // Pre-sort grouped dates to avoid sorting during render
                    mg.groupedDates.sort((a, b) => new Date(a) - new Date(b));
                    groupedData.push(mg);
                });

                // Sort the final array by scheduleDate
                groupedData.sort((a, b) => new Date(b.scheduleDate) - new Date(a.scheduleDate));

                setSchedules(groupedData);
            }
        } catch (err) {
            toast({ title: 'Failed to load schedules', status: 'error', duration: 3000 });
        } finally {
            setLoading(false);
        }
    }, [filterDateFrom, filterDateTo, filterStatus]);

    useEffect(() => { fetchVisitSchedules(); }, [fetchVisitSchedules]);

    // Mark invoice as completed / revert to pending
    const toggleInvoiceStatus = async (schedule) => {
        const next = schedule.invoiceStatus === 'Completed' ? 'Pending' : 'Completed';
        setUpdatingId(schedule._id);
        try {
            await api.patch(`/schedule-master/invoice-status/${schedule._id}`, { invoiceStatus: next });
            setSchedules(prev =>
                prev.map(s => s._id === schedule._id ? { ...s, invoiceStatus: next } : s)
            );
            toast({ title: `Bill marked as ${next}`, status: next === 'Completed' ? 'success' : 'info', duration: 2000 });
        } catch {
            toast({ title: 'Update failed', status: 'error', duration: 2000 });
        } finally {
            setUpdatingId(null);
        }
    };

    // Filter logic based on schedule type
    const validSchedules = schedules.filter(s => {
        if (s.isMonthGroup || s.scheduleType === 'MONTH') {
            // For MONTH schedules: Show them immediately (Scheduled, Paused, Completed). Only hide if Rejected.
            if (s.dayStatus === 'Rejected') return false;
            return true;
        } else {
            // For VISIT schedules (or undefined):
            // 1. MUST be Full Day or Half Day
            if (s.ledger !== 'Full Day' && s.ledger !== 'Half Day') return false;
            // 2. MUST be explicitly marked as Completed
            if (s.dayStatus !== 'Completed') return false;
            return true;
        }
    });

    // Filter client-side by search text and ledger
    const displayed = validSchedules.filter(s => {
        const q = search.toLowerCase();
        const matchSearch = !q ||
            s.client?.clientName?.toLowerCase().includes(q) ||
            s.site?.siteName?.toLowerCase().includes(q) ||
            s.operative?.name?.toLowerCase().includes(q);
        const matchLedger = !filterLedger || s.ledger === filterLedger;
        return matchSearch && matchLedger;
    });

    const stats = {
        total: validSchedules.length,
        pending: validSchedules.filter(s => s.invoiceStatus !== 'Completed').length,
        completed: validSchedules.filter(s => s.invoiceStatus === 'Completed').length,
        fullDay: validSchedules.filter(s => s.ledger === 'Full Day').length,
        halfDay: validSchedules.filter(s => s.ledger === 'Half Day').length,
    };

    return (
        <Box py={6} bg="gray.50" minH="100vh">
            <Container maxW="container.xl">
                <VStack spacing={6} align="stretch">

                    {/* ── Header ── */}
                    <Flex align="center" justify="space-between" bg="white" p={6} borderRadius="2xl" shadow="sm" border="1px solid" borderColor="gray.100">
                        <HStack spacing={4}>
                            <Box bgGradient="linear(to-br, blue.600, purple.600)" p={3} borderRadius="xl" color="white">
                                <Icon as={FaFileInvoiceDollar} w={6} h={6} />
                            </Box>
                            <VStack align="start" spacing={0}>
                                <Heading size="lg" bgGradient="linear(to-r, blue.600, purple.600)" bgClip="text">Invoice Report</Heading>
                                <Text color="gray.500" fontSize="sm">Track & generate invoices for all VISIT site schedules</Text>
                            </VStack>
                        </HStack>
                        <IconButton
                            icon={<FaSyncAlt />}
                            colorScheme="blue"
                            variant="ghost"
                            borderRadius="full"
                            onClick={fetchVisitSchedules}
                            isLoading={loading}
                            aria-label="Refresh"
                        />
                    </Flex>

                    {/* ── Stats Cards ── */}
                    <SimpleGrid columns={{ base: 2, md: 5 }} spacing={4}>
                        {[
                            { label: 'Total Visits', value: stats.total, color: 'blue', icon: FaBuilding },
                            { label: 'Pending Bills', value: stats.pending, color: 'orange', icon: FaClock },
                            { label: 'Completed Bills', value: stats.completed, color: 'green', icon: FaCheckCircle },
                            { label: 'Full Day', value: stats.fullDay, color: 'teal', icon: FaCalendarAlt },
                            { label: 'Half Day', value: stats.halfDay, color: 'purple', icon: FaCalendarAlt },
                        ].map(({ label, value, color, icon }) => (
                            <Card key={label} borderRadius="xl" shadow="sm" border="1px solid" borderColor={`${color}.100`} bg={`${color}.50`}>
                                <CardBody p={4}>
                                    <HStack justify="space-between">
                                        <VStack align="start" spacing={0}>
                                            <Text fontSize="xs" color={`${color}.600`} fontWeight="bold" textTransform="uppercase">{label}</Text>
                                            <Heading size="xl" color={`${color}.700`}>{value}</Heading>
                                        </VStack>
                                        <Icon as={icon} w={7} h={7} color={`${color}.300`} />
                                    </HStack>
                                </CardBody>
                            </Card>
                        ))}
                    </SimpleGrid>

                    {/* ── Filters ── */}
                    <Card borderRadius="2xl" shadow="sm" border="1px solid" borderColor="gray.100">
                        <CardBody p={5}>
                            <SimpleGrid columns={{ base: 1, md: 5 }} spacing={4} alignItems="flex-end">
                                <InputGroup>
                                    <InputLeftElement><Icon as={FaSearch} color="gray.400" /></InputLeftElement>
                                    <Input
                                        placeholder="Search client, site, operative..."
                                        value={search}
                                        onChange={e => setSearch(e.target.value)}
                                        borderRadius="xl"
                                        bg="gray.50"
                                    />
                                </InputGroup>
                                <Select placeholder="All Bill Status" value={filterStatus} onChange={e => setFilterStatus(e.target.value)} borderRadius="xl" bg="gray.50">
                                    <option value="Pending">Pending</option>
                                    <option value="Completed">Completed</option>
                                </Select>
                                <Select placeholder="All Ledger Types" value={filterLedger} onChange={e => setFilterLedger(e.target.value)} borderRadius="xl" bg="gray.50">
                                    <option value="Full Day">Full Day</option>
                                    <option value="Half Day">Half Day</option>
                                </Select>
                                <Input type="date" placeholder="From Date" value={filterDateFrom} onChange={e => setFilterDateFrom(e.target.value)} borderRadius="xl" bg="gray.50" />
                                <Input type="date" placeholder="To Date" value={filterDateTo} onChange={e => setFilterDateTo(e.target.value)} borderRadius="xl" bg="gray.50" />
                            </SimpleGrid>
                        </CardBody>
                    </Card>

                    {/* ── Table ── */}
                    <Card borderRadius="2xl" shadow="sm" border="1px solid" borderColor="gray.100" overflow="hidden">
                        {/* Legend */}
                        <Box px={6} pt={4} pb={2}>
                            <HStack spacing={4}>
                                <Text fontSize="xs" fontWeight="bold" color="gray.500">LEGEND:</Text>
                                <HStack spacing={1}>
                                    <Box w={3} h={3} bg="green.300" borderRadius="sm" />
                                    <Text fontSize="xs" color="gray.600">Full Day</Text>
                                </HStack>
                                <HStack spacing={1}>
                                    <Box w={3} h={3} bg="orange.300" borderRadius="sm" />
                                    <Text fontSize="xs" color="gray.600">Half Day</Text>
                                </HStack>
                                <HStack spacing={1}>
                                    <Box w={3} h={3} bg="blue.400" borderRadius="sm" />
                                    <Text fontSize="xs" color="gray.600">Month Contract</Text>
                                </HStack>
                                <HStack spacing={1}>
                                    <Box w={3} h={3} bg="gray.200" borderRadius="sm" />
                                    <Text fontSize="xs" color="gray.600">No Ledger</Text>
                                </HStack>
                                <Text fontSize="xs" color="gray.400" ml="auto">{displayed.length} records shown</Text>
                            </HStack>
                        </Box>
                        <Divider />
                        <CardBody p={0}>
                            {loading ? (
                                <Center py={16}><Spinner size="xl" color="blue.500" thickness="4px" /></Center>
                            ) : displayed.length === 0 ? (
                                <Center py={16}>
                                    <VStack spacing={3}>
                                        <Icon as={FaFileInvoiceDollar} w={12} h={12} color="gray.200" />
                                        <Text color="gray.400" fontSize="lg">No VISIT schedules found</Text>
                                        <Text color="gray.300" fontSize="sm">Try adjusting your filters or date range</Text>
                                    </VStack>
                                </Center>
                            ) : (
                                <TableContainer>
                                    <Table variant="simple" size="sm">
                                        <Thead bg="gray.50">
                                            <Tr>
                                                <Th py={4} color="gray.500" fontSize="10px">#</Th>
                                                <Th py={4} color="gray.500" fontSize="10px">CLIENT</Th>
                                                <Th py={4} color="gray.500" fontSize="10px">SITE</Th>
                                                <Th py={4} color="gray.500" fontSize="10px">OPERATIVE</Th>
                                                <Th py={4} color="gray.500" fontSize="10px">SCHEDULE DATE</Th>
                                                <Th py={4} color="gray.500" fontSize="10px">LEDGER TYPE</Th>
                                                <Th py={4} color="gray.500" fontSize="10px">BILL STATUS</Th>
                                                <Th py={4} color="gray.500" fontSize="10px">ACTIONS</Th>
                                            </Tr>
                                        </Thead>
                                        <Tbody>
                                            {displayed.map((s, idx) => {
                                                const { bg, border, hoverBg } = rowStyle(s);
                                                const isPending = s.invoiceStatus !== 'Completed';
                                                return (
                                                    <Tr
                                                        key={s._id || idx}
                                                        bg={bg}
                                                        _hover={{ bg: hoverBg, transition: 'background 0.15s' }}
                                                        borderLeft="4px solid"
                                                        borderLeftColor={border}
                                                    >
                                                        <Td py={3} color="gray.400" fontSize="xs">{idx + 1}</Td>
                                                        <Td py={3}>
                                                            <HStack spacing={2}>
                                                                <Icon as={FaBuilding} color="blue.400" w={3} h={3} />
                                                                <Text fontSize="sm" fontWeight="bold" color="gray.800">{s.client?.clientName || '—'}</Text>
                                                            </HStack>
                                                        </Td>
                                                        <Td py={3}>
                                                            <HStack spacing={2}>
                                                                <Icon as={FaMapMarkerAlt} color="teal.400" w={3} h={3} />
                                                                <Text fontSize="sm" color="gray.700">{s.site?.siteName || '—'}</Text>
                                                            </HStack>
                                                        </Td>
                                                        <Td py={3}>
                                                            <HStack spacing={2}>
                                                                <Icon as={FaUser} color="purple.400" w={3} h={3} />
                                                                <Text fontSize="sm" color="gray.700">{s.operative?.name || <Text as="span" color="gray.300">Unassigned</Text>}</Text>
                                                            </HStack>
                                                        </Td>
                                                        <Td py={3}>
                                                            <VStack align="start" spacing={1}>
                                                                {s.isMonthGroup ? (
                                                                    <Badge colorScheme="blue" fontSize="8px" variant="solid">MONTH CONTRACT {s.monthGroupId ? `(ID:${s.monthGroupId})` : ''}</Badge>
                                                                ) : (
                                                                    <Badge colorScheme="purple" fontSize="8px" variant="solid">DAILY VISIT</Badge>
                                                                )}
                                                                <Text fontSize="xs" fontFamily="mono" color="gray.600">
                                                                    {s.isMonthGroup && s.groupedDates.length > 1
                                                                        ? `${formatDate(s.groupedDates[0])} to ${formatDate(s.groupedDates[s.groupedDates.length - 1])}`
                                                                        : formatDate(s.scheduleDate)}
                                                                </Text>
                                                            </VStack>
                                                        </Td>
                                                        <Td py={3}>
                                                            {s.ledger ? (
                                                                <Badge
                                                                    colorScheme={s.ledger === 'Full Day' ? 'green' : s.ledger === 'Half Day' ? 'orange' : 'gray'}
                                                                    variant="solid"
                                                                    borderRadius="full"
                                                                    px={3}
                                                                    fontSize="10px"
                                                                >
                                                                    {s.ledger}
                                                                </Badge>
                                                            ) : (
                                                                <Text fontSize="xs" color="gray.300">—</Text>
                                                            )}
                                                        </Td>
                                                        <Td py={3}>
                                                            <Badge
                                                                colorScheme={isPending ? 'orange' : 'green'}
                                                                variant="subtle"
                                                                borderRadius="full"
                                                                px={3}
                                                                py={1}
                                                                fontSize="10px"
                                                                fontWeight="black"
                                                            >
                                                                {isPending ? '⏳ Pending' : '✅ Completed'}
                                                            </Badge>
                                                        </Td>
                                                        <Td py={3}>
                                                            <HStack spacing={2}>
                                                                {/* View Documents */}
                                                                <Tooltip label="View Documents" placement="top">
                                                                    <IconButton
                                                                        aria-label="View Documents"
                                                                        icon={<FaEye />}
                                                                        size="sm"
                                                                        colorScheme="teal"
                                                                        variant="ghost"
                                                                        borderRadius="full"
                                                                        onClick={() => {
                                                                            setViewTarget({
                                                                                ...s,
                                                                                uploadedDocuments: s.isMonthGroup ? s.allDocuments : s.uploadedDocuments
                                                                            });
                                                                            onOpen();
                                                                        }}
                                                                    />
                                                                </Tooltip>
                                                                {/* Generate / Mark Invoice */}
                                                                <Tooltip label={isPending ? 'Mark as Completed' : 'Revert to Pending'} placement="top">
                                                                    <Button
                                                                        size="xs"
                                                                        colorScheme={isPending ? 'green' : 'orange'}
                                                                        variant={isPending ? 'solid' : 'outline'}
                                                                        borderRadius="full"
                                                                        leftIcon={isPending ? <FaFileInvoiceDollar /> : <FaClock />}
                                                                        isLoading={updatingId === s._id}
                                                                        onClick={() => toggleInvoiceStatus(s)}
                                                                        px={3}
                                                                        fontSize="10px"
                                                                    >
                                                                        {isPending ? 'Generate Invoice' : 'Revert'}
                                                                    </Button>
                                                                </Tooltip>
                                                            </HStack>
                                                        </Td>
                                                    </Tr>
                                                );
                                            })}
                                        </Tbody>
                                    </Table>
                                </TableContainer>
                            )}
                        </CardBody>
                    </Card>
                </VStack>
            </Container>

            {/* ── Documents View Modal ── */}
            <Modal isOpen={isOpen} onClose={onClose} size="3xl" isCentered motionPreset="slideInBottom">
                <ModalOverlay backdropFilter="blur(8px)" bg="blackAlpha.600" />
                <ModalContent borderRadius="3xl" overflow="hidden" boxShadow="2xl">
                    <ModalHeader p={0}>
                        <Box bgGradient="linear(to-r, blue.700, purple.600)" p={6} color="white">
                            <HStack spacing={4}>
                                <Icon as={FaFileAlt} w={6} h={6} />
                                <VStack align="start" spacing={0}>
                                    <Text fontWeight="black" fontSize="md">{viewTarget?.client?.clientName} — {viewTarget?.site?.siteName}</Text>
                                    <Text fontSize="xs" opacity={0.8}>
                                        {viewTarget?.operative?.name || 'Unassigned'} • {formatDate(viewTarget?.scheduleDate)}
                                    </Text>
                                </VStack>
                            </HStack>
                        </Box>
                    </ModalHeader>
                    <ModalCloseButton color="white" top={4} right={4} />
                    <ModalBody p={6}>
                        {viewTarget && (() => {
                            const docs = viewTarget.uploadedDocuments || [];
                            const photos = docs.filter(d => d.url?.includes('/photos/'));
                            const reports = docs.filter(d => d.url?.includes('/Daily_report/'));
                            const data = docs.filter(d => d.url?.includes('/data/'));
                            
                            // Combine drawing and others if any
                            const drawing = docs.filter(d => d.url?.includes('/drawing/'));
                            
                            // Function to format exact date and time as requested
                            const formatDateTime = (dateStr) => {
                                if (!dateStr) return '—';
                                const d = new Date(dateStr);
                                const dd = String(d.getDate()).padStart(2, '0');
                                const mm = String(d.getMonth() + 1).padStart(2, '0');
                                const yyyy = d.getFullYear();
                                const hh = String(d.getHours()).padStart(2, '0');
                                const min = String(d.getMinutes()).padStart(2, '0');
                                const ss = String(d.getSeconds()).padStart(2, '0');
                                return `${dd}/${mm}/${yyyy} ${hh}:${min}:${ss}`;
                            };

                            if (docs.length === 0) {
                                return (
                                    <Center py={10}>
                                        <VStack spacing={3}>
                                            <Icon as={FaFileAlt} w={12} h={12} color="gray.200" />
                                            <Text color="gray.400">No documents uploaded for this schedule</Text>
                                        </VStack>
                                    </Center>
                                );
                            }

                            return (
                                <VStack spacing={5} align="stretch">
                                    {[
                                        { label: 'Photos', files: photos, color: 'pink', icon: FaCamera },
                                        { label: 'Daily Reports', files: reports, color: 'blue', icon: FaFilePdf },
                                        { label: 'Data Files', files: data, color: 'teal', icon: FaFileAlt },
                                        { label: 'Drawings', files: drawing, color: 'orange', icon: FaFileAlt },
                                    ].map(({ label, files, color, icon }) => files && files.length > 0 && (
                                        <Box key={label}>
                                            <Text fontSize="10px" fontWeight="black" color={`${color}.500`} textTransform="uppercase" mb={2}>
                                                {label} ({files.length})
                                            </Text>
                                            <VStack spacing={2} align="stretch">
                                                {files.map((doc, i) => (
                                                    <HStack
                                                        key={i}
                                                        p={3}
                                                        bg={`${color}.50`}
                                                        borderRadius="xl"
                                                        border="1px solid"
                                                        borderColor={`${color}.100`}
                                                        justify="space-between"
                                                    >
                                                        <HStack spacing={3}>
                                                            <Icon as={icon} color={`${color}.500`} />
                                                            <VStack align="start" spacing={0}>
                                                                <Text fontSize="sm" fontWeight="bold" color="gray.700">{doc.name}</Text>
                                                                <Text fontSize="xs" color="gray.400">{formatDateTime(doc.uploadedAt)}</Text>
                                                            </VStack>
                                                        </HStack>
                                                        <IconButton
                                                            as="a"
                                                            href={`${API_BASE_URL}${doc.url}`}
                                                            target="_blank"
                                                            icon={<FaDownload />}
                                                            size="sm"
                                                            colorScheme={color}
                                                            variant="ghost"
                                                            borderRadius="full"
                                                            aria-label="Download"
                                                        />
                                                    </HStack>
                                                ))}
                                            </VStack>
                                        </Box>
                                    ))}
                                </VStack>
                            );
                        })()}
                    </ModalBody>
                    <ModalFooter>
                        <Button colorScheme="blue" borderRadius="full" px={8} onClick={onClose}>Close</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
};

export default InvoiceReport;
