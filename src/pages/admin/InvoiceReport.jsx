import React, { useState, useEffect, useCallback } from 'react';
import {
    Box, Container, VStack, HStack, Text, Heading, Badge, Button, IconButton,
    Icon, Input, Select, Table, Thead, Tbody, Tr, Th, Td, TableContainer,
    Card, CardBody, SimpleGrid, Flex, Spinner, Center, useToast,
    Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter,
    ModalCloseButton, useDisclosure, Tooltip, Tag, Divider, InputGroup, InputLeftElement,
    Checkbox
} from '@chakra-ui/react';
import {
    FaFileInvoiceDollar, FaEye, FaCheckCircle, FaClock, FaSearch,
    FaCalendarAlt, FaUser, FaBuilding, FaMapMarkerAlt, FaFilter,
    FaFileAlt, FaCamera, FaFilePdf, FaSyncAlt, FaDownload, FaEnvelope,
    FaListUl
} from 'react-icons/fa';
import api from '../../api/axios';
import ModulePermissionBar from '../../components/admin/ModulePermissionBar';

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

// Row color coding by schedule type and ledger type (used for both main and sub-table rows)
const rowStyle = (s) => {
    const sType = s.scheduleType;
    let ledg = s.ledger;
    
    // If it's a grouped row, check the ledger of its first entry
    if (s.entries && s.entries.length > 0) {
        ledg = ledg || s.entries[0]?.ledger;
    }

    if (sType === 'TOPOGRAPHY SURVEY') {
        return { bg: 'red.50', border: 'red.400', hoverBg: 'red.100' };
    }
    if (sType === 'MONTH') {
        return { bg: 'blue.50', border: 'blue.400', hoverBg: 'blue.100' };
    }
    if (sType === 'POINT MARKING') {
        return { bg: 'purple.50', border: 'purple.400', hoverBg: 'purple.100' };
    }
    
    // VISIT / others: color based on ledger if present (Full Day = green, Half Day = orange)
    const ledgerVal = ledg || 'Full Day';
    if (ledgerVal === 'Full Day') return { bg: 'green.50', border: 'green.300', hoverBg: 'green.100' };
    if (ledgerVal === 'Half Day') return { bg: 'orange.50', border: 'orange.300', hoverBg: 'orange.100' };
    
    return { bg: 'white', border: 'gray.200', hoverBg: 'gray.50' };
};

// ── Main Component ────────────────────────────────────────────────────────────
const InvoiceReport = ({ isInsideServices = false }) => {
    const toast = useToast();

    
    // Group Details popup state
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [selectedEntryForDocs, setSelectedEntryForDocs] = useState(null);

    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(false);
    const [updatingId, setUpdatingId] = useState(null);

    // Filters
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterLedger, setFilterLedger] = useState('');
    const [filterDateFrom, setFilterDateFrom] = useState('');
    const [filterDateTo, setFilterDateTo] = useState('');

    // Fetch schedules
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
                
                // Map documents inline
                const formattedSchedules = rawData.map(s => {
                    let docs = s.uploadedDocuments || [];
                    if (s.scheduleType === 'TOPOGRAPHY SURVEY') {
                        docs = (s.draftingWorkFiles?.mailFiles || []).map(f => ({ ...f, isMail: true }));
                    }
                    return {
                        ...s,
                        allDocuments: docs
                    };
                });
                
                setSchedules(formattedSchedules);
            }
        } catch (err) {
            toast({ title: 'Failed to load schedules', status: 'error', duration: 3000 });
        } finally {
            setLoading(false);
        }
    }, [filterDateFrom, filterDateTo, filterStatus]);

    useEffect(() => { fetchVisitSchedules(); }, [fetchVisitSchedules]);

    // Mark invoice as completed / revert to pending for a single schedule
    const toggleInvoiceStatus = async (schedule) => {
        const next = schedule.invoiceStatus === 'Completed' ? 'Pending' : 'Completed';
        setUpdatingId(schedule._id);
        try {
            await api.patch(`/schedule-master/invoice-status/${schedule._id}`, { invoiceStatus: next });
            
            setSchedules(prev => {
                const nextSchedules = prev.map(s => s._id === schedule._id ? { ...s, invoiceStatus: next } : s);
                
                // Keep popup group values synchronized in real-time
                if (selectedGroup) {
                    setSelectedGroup(prevGroup => {
                        const updatedEntries = prevGroup.entries.map(e => e._id === schedule._id ? { ...e, invoiceStatus: next } : e);
                        const hasPending = updatedEntries.some(e => e.invoiceStatus !== 'Completed');
                        return {
                            ...prevGroup,
                            entries: updatedEntries,
                            status: hasPending ? 'Pending' : 'Completed'
                        };
                    });
                }
                
                return nextSchedules;
            });

            toast({ title: `Bill marked as ${next}`, status: next === 'Completed' ? 'success' : 'info', duration: 2000 });
        } catch {
            toast({ title: 'Update failed', status: 'error', duration: 2000 });
        } finally {
            setUpdatingId(null);
        }
    };

    // Filter logic based on documents
    const validSchedules = schedules.filter(s => {
        if (s.dayStatus === 'Rejected') return false;
        
        if (s.scheduleType === 'TOPOGRAPHY SURVEY') {
            return s.dayStatus === 'Completed';
        }
        
        if (s.scheduleType === 'MONTH' && s.endDate) {
            const end = new Date(s.endDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (end <= today) {
                return true;
            }
        }
        
        const hasCoreDocs = s.allDocuments && s.allDocuments.some(d => {
            // EXPLICITLY ignore Expense Receipts when determining if a schedule is ready for invoice
            if (d.category || d.url?.includes('employee_master') || d.url?.includes('expense_') || d.url?.includes('otherExpense_')) {
                return false;
            }

            const isPhoto = d.url?.includes('/photos/') || d.name?.toLowerCase().includes('photo') || (d.url?.includes('site_') && d.url?.includes('photos')) || d.url?.includes('/uploads/photos-');
            const isReport = d.url?.includes('/Daily_report/') || d.url?.includes('dailyReports') || d.name?.toLowerCase().includes('report');
            const isData = d.url?.includes('/data/') || d.url?.includes('dataFiles') || (d.url?.includes('site_') && d.url?.includes('data'));
            const isDrawing = d.url?.includes('/drawing/') || (d.url?.includes('site_') && d.url?.includes('drawing'));
            
            return isPhoto || isReport || isData || isDrawing;
        });
            
        return hasCoreDocs;
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

    // Dynamic Grouping & Sorting logic
    const groupedGroups = React.useMemo(() => {
        const groups = {};
        displayed.forEach(s => {
            const clientId = s.client?._id || s.client;
            const siteId = s.site?._id || s.site;
            if (!clientId || !siteId) return;
            const sType = s.scheduleType || 'VISIT';
            const groupKey = `${clientId}-${siteId}-${sType}`;
            if (!groups[groupKey]) {
                groups[groupKey] = {
                    groupId: groupKey,
                    client: s.client,
                    site: s.site,
                    scheduleType: sType,
                    entries: []
                };
            }
            groups[groupKey].entries.push(s);
        });

        const list = Object.values(groups);

        list.forEach(g => {
            // Sort entries date-wise ascending
            g.entries.sort((a, b) => new Date(a.scheduleDate) - new Date(b.scheduleDate));
            
            // Determine unique types present in this group
            const typesSet = new Set();
            g.entries.forEach(e => {
                if (e.scheduleType === 'TOPOGRAPHY SURVEY') {
                    typesSet.add('Topography Survey');
                    typesSet.add('Drafting Work');
                } else if (e.scheduleType === 'MONTH') {
                    typesSet.add('Month Contract');
                } else if (e.scheduleType === 'POINT MARKING') {
                    typesSet.add('Point Marking');
                } else {
                    typesSet.add('Visit');
                }
            });
            g.uniqueTypes = Array.from(typesSet);
            
            // Outer status is Pending if at least one entry inside is pending
            const hasPending = g.entries.some(e => e.invoiceStatus !== 'Completed');
            g.status = hasPending ? 'Pending' : 'Completed';
            
            // Find earliest pending date
            const pendingEntries = g.entries.filter(e => e.invoiceStatus !== 'Completed');
            if (pendingEntries.length > 0) {
                const sortedPending = [...pendingEntries].sort((a, b) => new Date(a.scheduleDate) - new Date(b.scheduleDate));
                g.earliestPendingDate = sortedPending[0].scheduleDate;
            } else {
                g.earliestPendingDate = null;
            }

            // Find latest entry date
            const sortedAll = [...g.entries].sort((a, b) => new Date(b.scheduleDate) - new Date(a.scheduleDate));
            g.latestEntryDate = sortedAll[0]?.scheduleDate || null;
        });

        // Sort: Pending groups first (ordered by earliestPendingDate asc), Completed groups next (ordered by latestEntryDate desc)
        list.sort((a, b) => {
            if (a.status === 'Pending' && b.status !== 'Pending') return -1;
            if (a.status !== 'Pending' && b.status === 'Pending') return 1;
            
            if (a.status === 'Pending' && b.status === 'Pending') {
                return new Date(a.earliestPendingDate) - new Date(b.earliestPendingDate);
            }
            
            return new Date(b.latestEntryDate) - new Date(a.latestEntryDate);
        });

        return list;
    }, [displayed]);

    return (
        <Box py={6} bg="gray.50" minH="100vh">
            <Container maxW="container.xl">
                {!isInsideServices && <ModulePermissionBar moduleGroupKey="otherServicesGroup" subModuleFilterKey="invoiceReport" />}
                <VStack spacing={6} align="stretch">

                    {/* ── Header ── */}
                    <Flex align="center" justify="space-between" bg="white" p={6} borderRadius="2xl" shadow="sm" border="1px solid" borderColor="gray.100">
                        <HStack spacing={4}>
                            <Box bgGradient="linear(to-br, blue.600, purple.600)" p={3} borderRadius="xl" color="white">
                                <Icon as={FaFileInvoiceDollar} w={6} h={6} />
                            </Box>
                            <VStack align="start" spacing={0}>
                                <Heading size="lg" bgGradient="linear(to-r, blue.600, purple.600)" bgClip="text">Invoice Report</Heading>
                                <Text color="gray.500" fontSize="sm">Track & generate invoices grouped by client and site</Text>
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
                                    <Text fontSize="xs" color="gray.600">Full Day Visit</Text>
                                </HStack>
                                <HStack spacing={1}>
                                    <Box w={3} h={3} bg="orange.300" borderRadius="sm" />
                                    <Text fontSize="xs" color="gray.600">Half Day Visit</Text>
                                </HStack>
                                <HStack spacing={1}>
                                    <Box w={3} h={3} bg="blue.400" borderRadius="sm" />
                                    <Text fontSize="xs" color="gray.600">Month Contract</Text>
                                </HStack>
                                <HStack spacing={1}>
                                    <Box w={3} h={3} bg="red.400" borderRadius="sm" />
                                    <Text fontSize="xs" color="gray.600">Topography Survey</Text>
                                </HStack>
                                <HStack spacing={1}>
                                    <Box w={3} h={3} bg="purple.400" borderRadius="sm" />
                                    <Text fontSize="xs" color="gray.600">Point Marking</Text>
                                </HStack>
                                <Text fontSize="xs" color="gray.400" ml="auto">{groupedGroups.length} entries listed</Text>
                            </HStack>
                        </Box>
                        <Divider />
                        <CardBody p={0}>
                            {loading ? (
                                <Center py={16}><Spinner size="xl" color="blue.500" thickness="4px" /></Center>
                            ) : groupedGroups.length === 0 ? (
                                <Center py={16}>
                                    <VStack spacing={3}>
                                        <Icon as={FaFileInvoiceDollar} w={12} h={12} color="gray.200" />
                                        <Text color="gray.400" fontSize="lg">No schedules found</Text>
                                        <Text color="gray.300" fontSize="sm">Try adjusting your filters or date range</Text>
                                    </VStack>
                                </Center>
                            ) : (
                                <TableContainer overflow="hidden" w="full">
                                    <Table variant="simple" size="sm" sx={{ 'th, td': { whiteSpace: 'normal', wordBreak: 'break-word' } }}>
                                        <Thead bg="gray.50">
                                            <Tr>
                                                <Th py={4} color="gray.500" fontSize="10px" w="50px">#</Th>
                                                <Th py={4} color="gray.500" fontSize="10px">CLIENT</Th>
                                                <Th py={4} color="gray.500" fontSize="10px">SITE</Th>
                                                <Th py={4} color="gray.500" fontSize="10px">SCHEDULE TYPE</Th>
                                                <Th py={4} color="gray.500" fontSize="10px" textAlign="center" w="180px">ENTRIES COUNT</Th>
                                                <Th py={4} color="gray.500" fontSize="10px" w="180px">EARLIEST PENDING DATE</Th>
                                                <Th py={4} color="gray.500" fontSize="10px" w="150px">BILL STATUS</Th>
                                                <Th py={4} color="gray.500" fontSize="10px" textAlign="right" w="150px">ACTIONS</Th>
                                            </Tr>
                                        </Thead>
                                        <Tbody>
                                            {groupedGroups.map((group, idx) => {
                                                const totalCount = group.entries.length;
                                                const completedCount = group.entries.filter(e => e.invoiceStatus === 'Completed').length;
                                                const pendingCount = totalCount - completedCount;
                                                const isPending = group.status === 'Pending';
                                                
                                                // Color variables for main row based on schedule type
                                                const { bg, border, hoverBg } = rowStyle(group);

                                                return (
                                                    <Tr
                                                        key={group.groupId}
                                                        bg={bg}
                                                        _hover={{ bg: hoverBg, transition: 'background 0.15s' }}
                                                        borderLeft="4px solid"
                                                        borderLeftColor={border}
                                                        cursor="pointer"
                                                        onClick={() => {
                                                            setSelectedGroup(group);
                                                            setSelectedEntryForDocs(null);
                                                        }}
                                                    >
                                                        <Td py={4} color="gray.400" fontSize="xs">
                                                            {idx + 1}
                                                        </Td>
                                                        <Td py={4}>
                                                            <HStack spacing={2}>
                                                                <Icon as={FaBuilding} color="blue.400" w={3} h={3} />
                                                                <Text fontSize="sm" fontWeight="bold" color="gray.800">
                                                                    {group.client?.clientName || '—'}
                                                                </Text>
                                                            </HStack>
                                                        </Td>
                                                        <Td py={4}>
                                                            <HStack spacing={2}>
                                                                <Icon as={FaMapMarkerAlt} color="teal.400" w={3} h={3} />
                                                                <Text fontSize="sm" color="gray.700" fontWeight="semibold">
                                                                    {group.site?.siteName || '—'}
                                                                </Text>
                                                            </HStack>
                                                        </Td>
                                                        <Td py={4}>
                                                            <Badge
                                                                colorScheme={group.scheduleType === 'TOPOGRAPHY SURVEY' ? 'red' : group.scheduleType === 'MONTH' ? 'blue' : group.scheduleType === 'POINT MARKING' ? 'purple' : 'green'}
                                                                variant="solid"
                                                                fontSize="10px"
                                                                textTransform="uppercase"
                                                                borderRadius="full"
                                                                px={3}
                                                            >
                                                                {group.scheduleType === 'TOPOGRAPHY SURVEY' ? 'Topography Survey' : group.scheduleType === 'MONTH' ? 'Month Contract' : group.scheduleType === 'POINT MARKING' ? 'Point Marking' : 'Visit'}
                                                            </Badge>
                                                        </Td>
                                                        <Td py={4} textAlign="center">
                                                            <Badge colorScheme="blue" variant="subtle" borderRadius="full" px={2.5} py={0.5}>
                                                                {totalCount} total ({completedCount} completed, {pendingCount} pending)
                                                            </Badge>
                                                        </Td>
                                                        <Td py={4}>
                                                            {isPending ? (
                                                                <Badge colorScheme="red" px={2} py={0.5} borderRadius="md" variant="subtle" fontFamily="mono">
                                                                    {formatDate(group.earliestPendingDate)}
                                                                </Badge>
                                                            ) : (
                                                                <Text fontSize="xs" color="gray.400" fontWeight="bold">All Completed</Text>
                                                            )}
                                                        </Td>
                                                        <Td py={4}>
                                                            <Badge
                                                                colorScheme={isPending ? 'orange' : 'green'}
                                                                variant="solid"
                                                                borderRadius="full"
                                                                px={3}
                                                                py={1}
                                                                fontSize="10px"
                                                                fontWeight="black"
                                                            >
                                                                {isPending ? '⏳ Pending' : '✅ Completed'}
                                                            </Badge>
                                                        </Td>
                                                        <Td py={4} textAlign="right" onClick={(e) => e.stopPropagation()}>
                                                            <HStack justify="flex-end" spacing={2}>
                                                                <IconButton
                                                                    aria-label="View Details"
                                                                    icon={<FaListUl />}
                                                                    size="sm"
                                                                    colorScheme="blue"
                                                                    variant="ghost"
                                                                    borderRadius="full"
                                                                    onClick={() => {
                                                                        setSelectedGroup(group);
                                                                        setSelectedEntryForDocs(null);
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
                            )}
                        </CardBody>
                    </Card>
                </VStack>
            </Container>

            {/* ── Group Details & Billing Checkbox Modal ── */}
            <Modal isOpen={!!selectedGroup} onClose={() => { setSelectedGroup(null); setSelectedEntryForDocs(null); }} size="4xl" isCentered motionPreset="slideInBottom">
                <ModalOverlay backdropFilter="blur(8px)" bg="blackAlpha.600" />
                <ModalContent borderRadius="3xl" overflow="hidden" boxShadow="2xl">
                    <ModalHeader p={0}>
                        <Box bgGradient="linear(to-r, blue.700, purple.600)" p={6} color="white">
                            <HStack spacing={4}>
                                <Icon as={FaFileInvoiceDollar} w={6} h={6} />
                                <VStack align="start" spacing={0}>
                                    <Text fontWeight="black" fontSize="lg">
                                        {selectedGroup?.client?.clientName} — {selectedGroup?.site?.siteName}
                                    </Text>
                                    <Text fontSize="xs" opacity={0.8}>
                                        Schedule Type: {selectedGroup?.scheduleType === 'TOPOGRAPHY SURVEY' ? 'Topography Survey' : selectedGroup?.scheduleType === 'MONTH' ? 'Month Contract' : selectedGroup?.scheduleType === 'POINT MARKING' ? 'Point Marking' : 'Visit'}
                                    </Text>
                                </VStack>
                            </HStack>
                        </Box>
                    </ModalHeader>
                    <ModalCloseButton color="white" top={4} right={4} />
                    <ModalBody p={6} maxH="70vh" overflowY="auto">
                        {selectedGroup && (
                            <VStack spacing={6} align="stretch">
                                <Text fontSize="xs" fontWeight="bold" color="blue.600" textTransform="uppercase">
                                    Individual Visit Entries (Date-wise Ascending)
                                </Text>
                                <TableContainer borderRadius="lg" border="1px solid" borderColor="gray.200" bg="white">
                                    <Table size="sm" variant="simple">
                                        <Thead bg="gray.100">
                                            <Tr>
                                                <Th w="80px" py={3}>BILL</Th>
                                                <Th py={3}>Date</Th>
                                                <Th py={3}>Operative</Th>
                                                <Th py={3}>Schedule Type</Th>
                                                <Th py={3}>Ledger Type</Th>
                                                <Th py={3} textAlign="right">Actions</Th>
                                            </Tr>
                                        </Thead>
                                        <Tbody>
                                            {selectedGroup.entries.map((entry) => {
                                                const isEntryCompleted = entry.invoiceStatus === 'Completed';
                                                const innerStyles = rowStyle(entry);
                                                const isSelected = selectedEntryForDocs?._id === entry._id;
                                                return (
                                                    <React.Fragment key={entry._id}>
                                                        <Tr _hover={{ bg: innerStyles.hoverBg }} bg={isSelected ? 'gray.50' : 'transparent'}>
                                                            <Td py={3}>
                                                                <Checkbox
                                                                    colorScheme="green"
                                                                    isChecked={isEntryCompleted}
                                                                    onChange={() => toggleInvoiceStatus(entry)}
                                                                    isDisabled={updatingId === entry._id}
                                                                />
                                                            </Td>
                                                            <Td py={3} fontWeight="bold" color="gray.700">
                                                                {formatDate(entry.scheduleDate)}
                                                            </Td>
                                                            <Td py={3}>
                                                                {entry.operative?.name ? (
                                                                    <HStack spacing={1}>
                                                                        <Icon as={FaUser} color="purple.400" w={3} h={3} />
                                                                        <Text fontSize="xs">{entry.operative.name}</Text>
                                                                    </HStack>
                                                                ) : (
                                                                    <Text fontSize="xs" color="gray.400">Unassigned</Text>
                                                                )}
                                                            </Td>
                                                            <Td py={3}>
                                                                <Badge size="xs" colorScheme={entry.scheduleType === 'TOPOGRAPHY SURVEY' ? 'red' : entry.scheduleType === 'MONTH' ? 'blue' : 'purple'}>
                                                                    {entry.scheduleType === 'TOPOGRAPHY SURVEY' ? 'Topography Survey / Drafting' : entry.scheduleType || 'Visit'}
                                                                </Badge>
                                                            </Td>
                                                            <Td py={3}>
                                                                {entry.scheduleType === 'TOPOGRAPHY SURVEY' ? (
                                                                    <Badge colorScheme="teal" variant="solid" borderRadius="full" px={2} fontSize="9px">
                                                                        Drafting Work
                                                                    </Badge>
                                                                ) : (
                                                                    <Badge
                                                                        colorScheme={(entry.ledger || 'Full Day') === 'Full Day' ? 'green' : 'orange'}
                                                                        variant="solid"
                                                                        borderRadius="full"
                                                                        px={2}
                                                                        fontSize="9px"
                                                                    >
                                                                        {entry.ledger || 'Full Day'}
                                                                    </Badge>
                                                                )}
                                                            </Td>
                                                            <Td py={3} textAlign="right">
                                                                <Tooltip label={isSelected ? "Hide Documents" : "View Entry Documents"} placement="top">
                                                                    <IconButton
                                                                        aria-label="Toggle Entry Documents"
                                                                        icon={<FaEye />}
                                                                        size="xs"
                                                                        colorScheme="teal"
                                                                        variant={isSelected ? 'solid' : 'ghost'}
                                                                        borderRadius="full"
                                                                        onClick={() => setSelectedEntryForDocs(isSelected ? null : entry)}
                                                                    />
                                                                </Tooltip>
                                                            </Td>
                                                        </Tr>
                                                        {isSelected && (
                                                            <Tr bg="gray.50">
                                                                <Td colSpan={6} p={0} borderBottom="none">
                                                                    {(() => {
                                                                        const docs = entry.allDocuments || [];
                                                                        const photos = docs.filter(d => d.url?.includes('/photos/') || d.name?.toLowerCase().includes('photo') || d.url?.includes('site_') && d.url?.includes('photos') || d.url?.includes('/uploads/photos-'));
                                                                        const reports = docs.filter(d => d.url?.includes('/Daily_report/') || d.url?.includes('dailyReports') || d.name?.toLowerCase().includes('report'));
                                                                        const data = docs.filter(d => d.url?.includes('/data/') || d.url?.includes('dataFiles') || d.url?.includes('site_') && d.url?.includes('data'));
                                                                        const drawing = docs.filter(d => d.url?.includes('/drawing/') || d.url?.includes('site_') && d.url?.includes('drawing'));
                                                                        const expenseReceipts = docs.filter(d => d.url?.includes('expense_') || d.url?.includes('otherExpense_') || d.category);
                                                                        const topographyMails = docs.filter(d => d.isMail);
                                                                        
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

                                                                        return (
                                                                            <Box p={5} bg="gray.100" borderTop="1px dashed" borderBottom="1px solid" borderColor="gray.200" boxShadow="inner">
                                                                                <Flex justify="space-between" align="center" mb={4}>
                                                                                    <Text fontSize="xs" fontWeight="black" color="blue.600" textTransform="uppercase">
                                                                                        Uploaded Documents: {formatDate(entry.scheduleDate)}
                                                                                    </Text>
                                                                                </Flex>
                                                                                
                                                                                {docs.length === 0 ? (
                                                                                    <Center py={6} bg="white" borderRadius="xl" border="1px dashed" borderColor="gray.300">
                                                                                        <VStack spacing={2}>
                                                                                            <Icon as={FaFileAlt} w={8} h={8} color="gray.300" />
                                                                                            <Text color="gray.400" fontSize="sm">No documents found for this schedule date</Text>
                                                                                        </VStack>
                                                                                    </Center>
                                                                                ) : (
                                                                                    <VStack spacing={4} align="stretch">
                                                                                        {[
                                                                                            { label: 'Topography Final Mails', files: topographyMails, color: 'red', icon: FaEnvelope },
                                                                                            { label: 'Photos', files: photos, color: 'pink', icon: FaCamera },
                                                                                            { label: 'Daily Reports', files: reports, color: 'blue', icon: FaFilePdf },
                                                                                            { label: 'Data Files', files: data, color: 'teal', icon: FaFileAlt },
                                                                                            { label: 'Drawings', files: drawing, color: 'orange', icon: FaFileAlt },
                                                                                            { label: 'Expense Receipts', files: expenseReceipts, color: 'green', icon: FaFileInvoiceDollar },
                                                                                        ].map(({ label, files, color, icon }) => files && files.length > 0 && (
                                                                                            <Box key={label} bg="white" p={4} borderRadius="xl" border="1px solid" borderColor="gray.150" shadow="sm">
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
                                                                                )}
                                                                            </Box>
                                                                        );
                                                                    })()}
                                                                </Td>
                                                            </Tr>
                                                        )}
                                                    </React.Fragment>
                                                );
                                            })}
                                        </Tbody>
                                    </Table>
                                </TableContainer>
                            </VStack>
                        )}
                    </ModalBody>
                    <ModalFooter>
                        <Button colorScheme="blue" borderRadius="full" px={8} onClick={() => { setSelectedGroup(null); setSelectedEntryForDocs(null); }}>Close</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
};

export default InvoiceReport;
