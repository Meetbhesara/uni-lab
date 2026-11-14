import React, { useState, useEffect, useCallback } from 'react';
import {
    Box, Container, VStack, HStack, Heading, Text, Card, CardBody,
    Badge, SimpleGrid, Icon, Divider, Button, Flex, Tabs, TabList,
    TabPanels, Tab, TabPanel, Input, InputGroup, InputLeftElement,
    Select, Skeleton, Alert, AlertIcon, Table, Thead, Tbody, Tr, Th, Td,
    Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody,
    ModalCloseButton, ModalFooter, useToast, Tooltip, IconButton,
    Breadcrumb, BreadcrumbItem, BreadcrumbLink, Stat, StatLabel,
    StatNumber, StatHelpText, Tag, TagLabel
} from '@chakra-ui/react';
import {
    FiFileText, FiClock, FiCheckCircle, FiXCircle, FiSearch,
    FiDownload, FiEye, FiPrinter, FiRefreshCw, FiArrowRight,
    FiUser, FiShoppingBag, FiLayers, FiDollarSign, FiCalendar
} from 'react-icons/fi';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const BASE_URL = (import.meta.env.VITE_API_BASE_URL ? import.meta.env.VITE_API_BASE_URL : 'http://localhost:5001');

const cleanQuotationHtml = (html) => {
    if (!html) return html;
    let str = html
        .replace(/&bull;|&#8226;|&#x2022;/gi, '•')
        .replace(/&nbsp;/gi, ' ');

    const contiguousBlockRegex = /(?:<(div|p|span)[^>]*>\s*•?\s*Size\s*[:-]?(?:(?!<\/(div|p|span)>)[\s\S])*<\/(div|p|span)>\s*)+/gi;
    str = str.replace(contiguousBlockRegex, (match) => {
        const individualTags = match.match(/<(div|p|span)[^>]*>[\s\S]*?<\/(div|p|span)>/gi) || [];
        const items = [];
        individualTags.forEach(tagStr => {
            let inner = tagStr.replace(/^<(div|p|span)[^>]*>/i, '').replace(/<\/(div|p|span)>$/i, '').trim();
            const qtyMatch = inner.match(/\(Qty:\s*(\d+)\)/i);
            const qty = qtyMatch ? parseInt(qtyMatch[1], 10) : 1;
            inner = inner.replace(/\(Qty:\s*\d+\)/gi, '');
            const cleanSize = inner.replace(/^\s*•?\s*Size\s*(:-|:)?\s*/i, '').trim();
            if (cleanSize) {
                items.push(qty > 1 ? `${cleanSize} (Qty: ${qty})` : cleanSize);
            }
        });
        if (items.length === 0) return match;
        return `<div style="color: #6b21a8; font-weight: bold; font-size: 12px; margin-top: 3px; line-height: 1.3;">${items.join(', ')}</div>`;
    });

    return str;
};

const MyDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const toast = useToast();

    // Tabs: 0 = 'pending', 1 = 'completed'
    const [activeTabIndex, setActiveTabIndex] = useState(0);
    const activeTab = activeTabIndex === 0 ? 'pending' : 'completed';

    // Quotations State
    const [quotations, setQuotations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [pendingCount, setPendingCount] = useState(0);
    const [completedCount, setCompletedCount] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    // Modal Preview State
    const [selectedQuotation, setSelectedQuotation] = useState(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setPage(1);
        }, 350);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Fetch Quotations from backend
    const fetchQuotations = useCallback(async () => {
        try {
            setIsLoading(true);
            const res = await api.get('/quotations/my', {
                params: {
                    tab: activeTab,
                    page,
                    limit,
                    search: debouncedSearch || undefined
                }
            });

            if (res.data?.success) {
                setQuotations(res.data.data || []);
                setTotalItems(res.data.total || 0);
                setTotalPages(res.data.totalPages || 1);
                setPendingCount(res.data.pendingCount || 0);
                setCompletedCount(res.data.completedCount || 0);
            }
        } catch (err) {
            console.error('Failed to load user quotations:', err);
            toast({
                title: 'Unable to Load Quotations',
                description: err.response?.data?.msg || 'Could not fetch your quotations.',
                status: 'error',
                duration: 4000,
                isClosable: true
            });
            setQuotations([]);
        } finally {
            setIsLoading(false);
        }
    }, [activeTab, page, limit, debouncedSearch, toast]);

    useEffect(() => {
        fetchQuotations();
    }, [fetchQuotations]);

    const handleTabChange = (index) => {
        setActiveTabIndex(index);
        setPage(1);
    };

    const handleViewQuotation = (quote) => {
        setSelectedQuotation(quote);
        setIsPreviewOpen(true);
    };

    const handlePrintQuotation = (quote) => {
        if (!quote) return;
        if (quote.pdfPath) {
            const url = quote.pdfPath.startsWith('http') ? quote.pdfPath : `${BASE_URL}/${quote.pdfPath.replace(/^\/+/, '')}`;
            window.open(url, '_blank');
            return;
        }

        if (quote.htmlContent) {
            const win = window.open('', '_blank');
            if (win) {
                win.document.open();
                win.document.write(cleanQuotationHtml(quote.htmlContent));
                win.document.close();
                setTimeout(() => {
                    win.focus();
                    win.print();
                }, 400);
            }
        } else {
            toast({
                title: 'Quotation Document',
                description: 'HTML preview is not available for this record.',
                status: 'info'
            });
        }
    };

    const getStatusBadge = (status) => {
        const s = (status || 'Pending').toLowerCase();
        if (s === 'done' || s === 'completed' || s === 'processed') {
            return <Badge colorScheme="green" px={2.5} py={0.5} borderRadius="full" fontSize="xs">Done / Approved</Badge>;
        }
        if (s === 'reject' || s === 'rejected') {
            return <Badge colorScheme="red" px={2.5} py={0.5} borderRadius="full" fontSize="xs">Rejected</Badge>;
        }
        if (s === 'sent') {
            return <Badge colorScheme="blue" px={2.5} py={0.5} borderRadius="full" fontSize="xs">Sent / Active</Badge>;
        }
        if (s === 'pass') {
            return <Badge colorScheme="teal" px={2.5} py={0.5} borderRadius="full" fontSize="xs">Passed</Badge>;
        }
        return <Badge colorScheme="orange" px={2.5} py={0.5} borderRadius="full" fontSize="xs">Pending Review</Badge>;
    };

    const totalAllQuotes = pendingCount + completedCount;

    return (
        <Box bg="gray.50" minH="90vh" py={{ base: 6, md: 10 }}>
            <Container maxW="7xl">
                {/* Breadcrumb Header */}
                <Flex justify="space-between" align={{ base: 'start', md: 'center' }} mb={6} direction={{ base: 'column', md: 'row' }} gap={3}>
                    <Box>
                        <Breadcrumb fontSize="xs" color="gray.500" mb={1}>
                            <BreadcrumbItem>
                                <BreadcrumbLink as={RouterLink} to="/">Home</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbItem isCurrentPage color="brand.600" fontWeight="700">
                                <BreadcrumbLink>My Dashboard</BreadcrumbLink>
                            </BreadcrumbItem>
                        </Breadcrumb>
                        <HStack spacing={3} align="center">
                            <Heading size="lg" fontWeight="900" color="gray.800">
                                Customer Dashboard
                            </Heading>
                            <Badge colorScheme="brand" variant="subtle" borderRadius="full" px={2.5}>
                                Company Quotations
                            </Badge>
                        </HStack>
                        <Text fontSize="xs" color="gray.500" mt={1}>
                            Track official quotations, revisions, itemized pricing, and download official PDF copies.
                        </Text>
                    </Box>

                    <HStack spacing={3}>
                        <Button
                            as={RouterLink}
                            to="/my-profile"
                            variant="outline"
                            colorScheme="gray"
                            size="sm"
                            borderRadius="xl"
                            leftIcon={<FiUser />}
                        >
                            My Profile
                        </Button>
                        <IconButton
                            icon={<FiRefreshCw />}
                            aria-label="Refresh Quotations"
                            size="sm"
                            borderRadius="xl"
                            isLoading={isLoading}
                            onClick={fetchQuotations}
                        />
                    </HStack>
                </Flex>

                {/* Stat Cards Row */}
                <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={4} mb={8}>
                    <Card borderRadius="2xl" boxShadow="sm" border="1px solid" borderColor="gray.100" bg="white">
                        <CardBody p={5}>
                            <HStack justify="space-between" align="start">
                                <Box>
                                    <Text fontSize="xs" fontWeight="700" color="gray.500" textTransform="uppercase">
                                        Total Quotations
                                    </Text>
                                    <Heading size="lg" fontWeight="900" color="gray.800" mt={1}>
                                        {totalAllQuotes}
                                    </Heading>
                                    <Text fontSize="2xs" color="gray.400" mt={0.5}>
                                        All historical quotes received
                                    </Text>
                                </Box>
                                <Box p={3} bg="blue.50" color="blue.600" borderRadius="xl">
                                    <Icon as={FiLayers} boxSize={5} />
                                </Box>
                            </HStack>
                        </CardBody>
                    </Card>

                    <Card borderRadius="2xl" boxShadow="sm" border="1px solid" borderColor="orange.100" bg="white">
                        <CardBody p={5}>
                            <HStack justify="space-between" align="start">
                                <Box>
                                    <Text fontSize="xs" fontWeight="700" color="orange.600" textTransform="uppercase">
                                        Pending Quotations
                                    </Text>
                                    <Heading size="lg" fontWeight="900" color="orange.600" mt={1}>
                                        {pendingCount}
                                    </Heading>
                                    <Text fontSize="2xs" color="gray.400" mt={0.5}>
                                        Awaiting completion / in progress
                                    </Text>
                                </Box>
                                <Box p={3} bg="orange.50" color="orange.500" borderRadius="xl">
                                    <Icon as={FiClock} boxSize={5} />
                                </Box>
                            </HStack>
                        </CardBody>
                    </Card>

                    <Card borderRadius="2xl" boxShadow="sm" border="1px solid" borderColor="green.100" bg="white">
                        <CardBody p={5}>
                            <HStack justify="space-between" align="start">
                                <Box>
                                    <Text fontSize="xs" fontWeight="700" color="green.600" textTransform="uppercase">
                                        Completed / Done
                                    </Text>
                                    <Heading size="lg" fontWeight="900" color="green.600" mt={1}>
                                        {completedCount}
                                    </Heading>
                                    <Text fontSize="2xs" color="gray.400" mt={0.5}>
                                        Processed &amp; concluded quotes
                                    </Text>
                                </Box>
                                <Box p={3} bg="green.50" color="green.500" borderRadius="xl">
                                    <Icon as={FiCheckCircle} boxSize={5} />
                                </Box>
                            </HStack>
                        </CardBody>
                    </Card>

                    <Card borderRadius="2xl" boxShadow="sm" border="1px solid" borderColor="purple.100" bg="white">
                        <CardBody p={5}>
                            <HStack justify="space-between" align="start">
                                <Box>
                                    <Text fontSize="xs" fontWeight="700" color="purple.600" textTransform="uppercase">
                                        User Account
                                    </Text>
                                    <Heading size="sm" fontWeight="800" color="gray.800" mt={2} noOfLines={1}>
                                        {user?.companyName || user?.name || user?.phone || 'Customer'}
                                    </Heading>
                                    <Text fontSize="2xs" color="gray.400" mt={0.5}>
                                        Linked Phone: {user?.phone}
                                    </Text>
                                </Box>
                                <Box p={3} bg="purple.50" color="purple.600" borderRadius="xl">
                                    <Icon as={FiUser} boxSize={5} />
                                </Box>
                            </HStack>
                        </CardBody>
                    </Card>
                </SimpleGrid>

                {/* Main Quotations Card with Two Tabs & Pagination */}
                <Card borderRadius="3xl" boxShadow="lg" border="1px solid" borderColor="gray.100" bg="white">
                    <CardBody p={{ base: 4, md: 6 }}>
                        <Tabs
                            index={activeTabIndex}
                            onChange={handleTabChange}
                            variant="soft-rounded"
                            colorScheme="brand"
                        >
                            {/* Tabs Header & Search Filter */}
                            <Flex
                                direction={{ base: 'column', md: 'row' }}
                                justify="space-between"
                                align={{ base: 'stretch', md: 'center' }}
                                gap={4}
                                mb={6}
                                pb={4}
                                borderBottom="1px solid"
                                borderColor="gray.100"
                            >
                                <TabList bg="gray.100" p={1.5} borderRadius="2xl">
                                    <Tab
                                        borderRadius="xl"
                                        fontWeight="800"
                                        fontSize="sm"
                                        px={5}
                                        py={2}
                                    >
                                        ⏳ Pending Quotations ({pendingCount})
                                    </Tab>
                                    <Tab
                                        borderRadius="xl"
                                        fontWeight="800"
                                        fontSize="sm"
                                        px={5}
                                        py={2}
                                    >
                                        ✅ Done &amp; Rejected ({completedCount})
                                    </Tab>
                                </TabList>

                                <HStack spacing={3}>
                                    <InputGroup size="md" maxW={{ base: 'full', md: '280px' }}>
                                        <InputLeftElement pointerEvents="none" color="gray.400">
                                            <FiSearch />
                                        </InputLeftElement>
                                        <Input
                                            placeholder="Search by Ref No..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            borderRadius="xl"
                                        />
                                    </InputGroup>

                                    <Select
                                        size="md"
                                        w="110px"
                                        borderRadius="xl"
                                        value={limit}
                                        onChange={(e) => {
                                            setLimit(Number(e.target.value));
                                            setPage(1);
                                        }}
                                    >
                                        <option value={5}>5 / page</option>
                                        <option value={10}>10 / page</option>
                                        <option value={20}>20 / page</option>
                                    </Select>
                                </HStack>
                            </Flex>

                            {/* Tab Content */}
                            <TabPanels>
                                {/* TAB 1: PENDING QUOTATIONS */}
                                <TabPanel p={0}>
                                    {isLoading ? (
                                        <VStack spacing={4} py={8}>
                                            <Skeleton h="60px" w="full" borderRadius="xl" />
                                            <Skeleton h="60px" w="full" borderRadius="xl" />
                                            <Skeleton h="60px" w="full" borderRadius="xl" />
                                        </VStack>
                                    ) : quotations.length === 0 ? (
                                        <Box py={16} textAlign="center">
                                            <Box
                                                w={16} h={16} bg="orange.50" color="orange.500"
                                                borderRadius="2xl" display="flex" alignItems="center"
                                                justifyContent="center" mx="auto" mb={4}
                                            >
                                                <FiClock size={32} />
                                            </Box>
                                            <Heading size="md" color="gray.700" fontWeight="800">
                                                No Pending Quotations
                                            </Heading>
                                            <Text fontSize="sm" color="gray.500" maxW="md" mx="auto" mt={2}>
                                                You do not have any open or pending quotations under review. Any active quotations prepared by our team will appear here.
                                            </Text>
                                            <Button
                                                as={RouterLink}
                                                to="/products"
                                                mt={6}
                                                colorScheme="brand"
                                                size="sm"
                                                borderRadius="xl"
                                            >
                                                Browse Products &amp; Send Enquiry
                                            </Button>
                                        </Box>
                                    ) : (
                                        <VStack spacing={4} align="stretch">
                                            {quotations.map((quote) => (
                                                <QuotationCard
                                                    key={quote._id}
                                                    quote={quote}
                                                    onView={() => handleViewQuotation(quote)}
                                                    onPrint={() => handlePrintQuotation(quote)}
                                                    getStatusBadge={getStatusBadge}
                                                />
                                            ))}
                                        </VStack>
                                    )}
                                </TabPanel>

                                {/* TAB 2: COMPLETED & REJECTED */}
                                <TabPanel p={0}>
                                    {isLoading ? (
                                        <VStack spacing={4} py={8}>
                                            <Skeleton h="60px" w="full" borderRadius="xl" />
                                            <Skeleton h="60px" w="full" borderRadius="xl" />
                                            <Skeleton h="60px" w="full" borderRadius="xl" />
                                        </VStack>
                                    ) : quotations.length === 0 ? (
                                        <Box py={16} textAlign="center">
                                            <Box
                                                w={16} h={16} bg="gray.100" color="gray.500"
                                                borderRadius="2xl" display="flex" alignItems="center"
                                                justifyContent="center" mx="auto" mb={4}
                                            >
                                                <FiCheckCircle size={32} />
                                            </Box>
                                            <Heading size="md" color="gray.700" fontWeight="800">
                                                No History Quotations Found
                                            </Heading>
                                            <Text fontSize="sm" color="gray.500" maxW="md" mx="auto" mt={2}>
                                                Quotations that have been marked as Done or Rejected will be archived here for your records.
                                            </Text>
                                        </Box>
                                    ) : (
                                        <VStack spacing={4} align="stretch">
                                            {quotations.map((quote) => (
                                                <QuotationCard
                                                    key={quote._id}
                                                    quote={quote}
                                                    onView={() => handleViewQuotation(quote)}
                                                    onPrint={() => handlePrintQuotation(quote)}
                                                    getStatusBadge={getStatusBadge}
                                                />
                                            ))}
                                        </VStack>
                                    )}
                                </TabPanel>
                            </TabPanels>

                            {/* Pagination Controls */}
                            {totalItems > 0 && (
                                <Flex
                                    direction={{ base: 'column', sm: 'row' }}
                                    justify="space-between"
                                    align="center"
                                    mt={6}
                                    pt={4}
                                    borderTop="1px solid"
                                    borderColor="gray.100"
                                    gap={3}
                                >
                                    <Text fontSize="xs" color="gray.500">
                                        Showing <strong>{Math.min((page - 1) * limit + 1, totalItems)}</strong> to{' '}
                                        <strong>{Math.min(page * limit, totalItems)}</strong> of <strong>{totalItems}</strong> quotations
                                    </Text>

                                    <HStack spacing={2}>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            borderRadius="xl"
                                            isDisabled={page <= 1}
                                            onClick={() => setPage(p => Math.max(1, p - 1))}
                                        >
                                            Previous
                                        </Button>

                                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                                            .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                                            .map((p, idx, arr) => (
                                                <React.Fragment key={p}>
                                                    {idx > 0 && arr[idx - 1] !== p - 1 && (
                                                        <Text fontSize="xs" color="gray.400">...</Text>
                                                    )}
                                                    <Button
                                                        size="sm"
                                                        borderRadius="xl"
                                                        colorScheme={p === page ? 'brand' : 'gray'}
                                                        variant={p === page ? 'solid' : 'ghost'}
                                                        onClick={() => setPage(p)}
                                                    >
                                                        {p}
                                                    </Button>
                                                </React.Fragment>
                                            ))
                                        }

                                        <Button
                                            size="sm"
                                            variant="outline"
                                            borderRadius="xl"
                                            isDisabled={page >= totalPages}
                                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                        >
                                            Next
                                        </Button>
                                    </HStack>
                                </Flex>
                            )}
                        </Tabs>
                    </CardBody>
                </Card>
            </Container>

            {/* Quotation Detail / HTML Preview Modal */}
            <Modal isOpen={isPreviewOpen} onClose={() => setIsPreviewOpen(false)} size="4xl" scrollBehavior="inside">
                <ModalOverlay backdropFilter="blur(5px)" />
                <ModalContent borderRadius="3xl" overflow="hidden">
                    <ModalHeader bg="gray.50" borderBottom="1px solid" borderColor="gray.100" py={4}>
                        <Flex justify="space-between" align="center" pr={8}>
                            <HStack spacing={3}>
                                <Icon as={FiFileText} color="brand.600" boxSize={5} />
                                <Box>
                                    <Heading size="sm" color="gray.800" fontWeight="900">
                                        Quotation #{selectedQuotation?.refNo || 'N/A'}
                                    </Heading>
                                    <Text fontSize="2xs" color="gray.500">
                                        Sent: {selectedQuotation?.createdAt ? new Date(selectedQuotation.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                                    </Text>
                                </Box>
                            </HStack>
                            {getStatusBadge(selectedQuotation?.status)}
                        </Flex>
                    </ModalHeader>
                    <ModalCloseButton />

                    <ModalBody p={6} bg="white">
                        {selectedQuotation?.htmlContent ? (
                            <Box
                                border="1px solid"
                                borderColor="gray.200"
                                borderRadius="2xl"
                                p={4}
                                bg="white"
                                maxH="65vh"
                                overflowY="auto"
                                dangerouslySetInnerHTML={{ __html: cleanQuotationHtml(selectedQuotation.htmlContent) }}
                            />
                        ) : (
                            <VStack spacing={4} py={8} textAlign="center">
                                <Icon as={FiFileText} boxSize={12} color="gray.300" />
                                <Text fontWeight="700" color="gray.700">Official Quotation Document</Text>
                                <Text fontSize="xs" color="gray.500">
                                    Grand Total: ₹{Number(selectedQuotation?.grandTotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                </Text>
                            </VStack>
                        )}
                    </ModalBody>

                    <ModalFooter bg="gray.50" borderTop="1px solid" borderColor="gray.100" py={3}>
                        <HStack spacing={3}>
                            <Button
                                colorScheme="brand"
                                borderRadius="xl"
                                size="sm"
                                leftIcon={<FiPrinter />}
                                onClick={() => handlePrintQuotation(selectedQuotation)}
                            >
                                Print / Download PDF
                            </Button>
                            <Button
                                variant="ghost"
                                borderRadius="xl"
                                size="sm"
                                onClick={() => setIsPreviewOpen(false)}
                            >
                                Close
                            </Button>
                        </HStack>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
};

// Quotation Card Component for Dashboard
const QuotationCard = ({ quote, onView, onPrint, getStatusBadge }) => {
    const itemCount = quote.items?.length || 0;
    const formattedDate = quote.createdAt
        ? new Date(quote.createdAt).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        })
        : 'N/A';

    return (
        <Card
            borderRadius="2xl"
            border="1px solid"
            borderColor="gray.200"
            bg="white"
            boxShadow="sm"
            _hover={{ borderColor: 'brand.300', boxShadow: 'md' }}
            transition="all 0.2s ease"
        >
            <CardBody p={{ base: 4, md: 5 }}>
                <Flex
                    direction={{ base: 'column', md: 'row' }}
                    justify="space-between"
                    align={{ base: 'start', md: 'center' }}
                    gap={4}
                >
                    {/* Left: Quote Reference & Date */}
                    <HStack spacing={4} align="start">
                        <Box
                            w={12} h={12}
                            borderRadius="xl"
                            bg="brand.50"
                            color="brand.600"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            flexShrink={0}
                        >
                            <FiFileText size={22} />
                        </Box>
                        <Box>
                            <HStack spacing={2} align="center" wrap="wrap">
                                <Heading size="sm" fontWeight="900" color="gray.800">
                                    {quote.refNo || 'Quotation'}
                                </Heading>
                                {getStatusBadge(quote.status)}
                                {quote.isLatest === false && (
                                    <Badge colorScheme="gray" fontSize="2xs">Older Revision</Badge>
                                )}
                            </HStack>
                            <HStack spacing={3} color="gray.500" fontSize="xs" mt={1}>
                                <HStack spacing={1}>
                                    <FiCalendar />
                                    <Text>{formattedDate}</Text>
                                </HStack>
                                <Text>•</Text>
                                <HStack spacing={1}>
                                    <FiShoppingBag />
                                    <Text>{itemCount} Item{itemCount !== 1 ? 's' : ''}</Text>
                                </HStack>
                            </HStack>
                        </Box>
                    </HStack>

                    {/* Middle: Items Preview */}
                    <Box flex={1} maxW={{ base: 'full', md: '360px' }} display={{ base: 'none', lg: 'block' }}>
                        <Text fontSize="2xs" color="gray.400" fontWeight="700" textTransform="uppercase">
                            Items Included
                        </Text>
                        <Text fontSize="xs" color="gray.700" fontWeight="600" noOfLines={2}>
                            {quote.items?.map(it => {
                                const prodTitle = it.product?.title || it.product?.name || 'Instrument';
                                return `${prodTitle} (x${it.quantity})`;
                            }).join(', ') || 'No item details'}
                        </Text>
                    </Box>

                    {/* Right: Price & Action Buttons */}
                    <Flex
                        direction={{ base: 'row', md: 'row' }}
                        justify={{ base: 'space-between', md: 'flex-end' }}
                        align="center"
                        w={{ base: 'full', md: 'auto' }}
                        gap={4}
                    >
                        <Box textAlign={{ base: 'left', md: 'right' }}>
                            <Text fontSize="2xs" color="gray.400" fontWeight="700" textTransform="uppercase">
                                Total Amount
                            </Text>
                            <Text fontSize="lg" fontWeight="900" color="brand.600">
                                ₹{Number(quote.grandTotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </Text>
                            <Text fontSize="2xs" color="gray.400">
                                Incl. GST &amp; charges
                            </Text>
                        </Box>

                        <HStack spacing={2}>
                            <Button
                                size="sm"
                                variant="outline"
                                colorScheme="brand"
                                borderRadius="xl"
                                leftIcon={<FiEye />}
                                onClick={onView}
                            >
                                View
                            </Button>
                            <Button
                                size="sm"
                                colorScheme="brand"
                                borderRadius="xl"
                                leftIcon={<FiDownload />}
                                onClick={onPrint}
                            >
                                Print / PDF
                            </Button>
                        </HStack>
                    </Flex>
                </Flex>
            </CardBody>
        </Card>
    );
};

export default MyDashboard;
