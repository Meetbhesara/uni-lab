import React, { useState, useEffect } from 'react';
import {
    Box, Flex, VStack, HStack, Text, Heading, Button, Icon,
    Badge, useColorModeValue, Drawer, DrawerContent, DrawerOverlay,
    DrawerCloseButton, DrawerBody, useDisclosure, IconButton, Divider,
    Alert, AlertIcon, AlertTitle, AlertDescription, Tooltip
} from '@chakra-ui/react';
import {
    FiBox, FiMessageSquare, FiArrowLeft, FiMenu, FiShield,
    FiExternalLink, FiChevronRight, FiCheckCircle, FiLock
} from 'react-icons/fi';
import { FaBuilding } from 'react-icons/fa';
import { useNavigate, useSearchParams, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { hasPermission } from '../utils/permissions';
import AdminProducts from './admin/AdminProducts';
import AdminEnquiries from './admin/AdminEnquiries';

const UniqueLabInstrumentsPage = () => {
    const { user, loading } = useAuth();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const { isOpen: isMobileOpen, onOpen: onMobileOpen, onClose: onMobileClose } = useDisclosure();

    // Route guard: require admin authentication
    useEffect(() => {
        if (!loading && (!user || !user.isAdmin)) {
            navigate('/login');
        }
    }, [user, loading, navigate]);

    const canReadProducts = hasPermission(user, 'products', 'read');
    const canReadEnquiries = hasPermission(user, 'enquiries', 'read');
    const hasAnyAccess = canReadProducts || canReadEnquiries;

    // Active tab management: 'products' | 'enquiries'
    const tabParam = searchParams.get('tab');
    const getInitialTab = () => {
        if (tabParam === 'enquiries' && canReadEnquiries) return 'enquiries';
        if (tabParam === 'products' && canReadProducts) return 'products';
        if (canReadProducts) return 'products';
        if (canReadEnquiries) return 'enquiries';
        return 'products';
    };

    const [activeTab, setActiveTab] = useState(getInitialTab);

    useEffect(() => {
        if (tabParam === 'enquiries' && canReadEnquiries) {
            setActiveTab('enquiries');
        } else if (tabParam === 'products' && canReadProducts) {
            setActiveTab('products');
        } else if (!canReadProducts && canReadEnquiries) {
            setActiveTab('enquiries');
        } else if (canReadProducts && !canReadEnquiries) {
            setActiveTab('products');
        }
    }, [tabParam, canReadProducts, canReadEnquiries]);

    const handleSelectTab = (key) => {
        if (key === 'products' && !canReadProducts) return;
        if (key === 'enquiries' && !canReadEnquiries) return;
        setActiveTab(key);
        setSearchParams({ tab: key });
        onMobileClose();
    };

    const bgSidebar = useColorModeValue('white', 'gray.900');
    const borderColor = useColorModeValue('gray.200', 'gray.700');
    const pageBg = useColorModeValue('gray.100', 'gray.900');

    // Vertical navigation tabs definitions
    const verticalTabs = [
        {
            id: 'product',
            key: 'products',
            label: '1. Product',
            fullTitle: 'Product Catalog',
            subtitle: 'Stock, Pricing & Categories',
            icon: FiBox,
            allowed: canReadProducts,
            activeColorScheme: 'brand'
        },
        {
            id: 'enquiry',
            key: 'enquiries',
            label: '2. Enquiry',
            fullTitle: 'Enquiries & Quotations',
            subtitle: 'Leads, WhatsApp & Deals',
            icon: FiMessageSquare,
            allowed: canReadEnquiries,
            activeColorScheme: 'orange'
        }
    ];

    // Reusable vertical sidebar content
    const renderSidebarContent = (isDrawer = false) => (
        <Flex
            direction="column"
            h="full"
            w="full"
            p={4}
            bg={bgSidebar}
            borderRight={isDrawer ? 'none' : '1px solid'}
            borderColor={borderColor}
        >
            {/* Brand Logo & Header */}
            <Box pb={4} mb={4} borderBottom="1px solid" borderColor="gray.100">
                <HStack spacing={2.5} align="center" mb={1}>
                    <Box
                        p={2}
                        borderRadius="xl"
                        bg="brand.500"
                        color="white"
                        boxShadow="md"
                    >
                        <Icon as={FiBox} boxSize={5} />
                    </Box>
                    <Box>
                        <Heading
                            fontSize="md"
                            fontWeight="900"
                            letterSpacing="tight"
                            color="gray.800"
                            lineHeight="1.2"
                        >
                            Unique Lab
                        </Heading>
                        <Text fontSize="11px" fontWeight="bold" color="brand.600" textTransform="uppercase" letterSpacing="wider">
                            Instruments
                        </Text>
                    </Box>
                </HStack>
                <Badge colorScheme="purple" fontSize="9px" px={2} py={0.5} borderRadius="full" fontWeight="black" mt={1}>
                    Console Mode
                </Badge>
            </Box>

            {/* Navigation Label */}
            <Text
                fontSize="10px"
                fontWeight="800"
                color="gray.400"
                textTransform="uppercase"
                letterSpacing="wider"
                px={2}
                mb={2}
            >
                Vertical Navigation
            </Text>

            {/* The 3 Vertical Tabs (1-> Product, 2-> Enquiry, 3-> Admin) */}
            <VStack spacing={2} align="stretch" flex="1">
                {/* 1 -> Product Tab */}
                {(() => {
                    const tab = verticalTabs[0];
                    const isActive = activeTab === tab.key;
                    const isAllowed = tab.allowed;

                    return (
                        <Tooltip
                            key={tab.id}
                            label={!isAllowed ? 'Access restricted by administrator permissions' : ''}
                            isDisabled={isAllowed}
                            placement="right"
                        >
                            <Box
                                as="button"
                                onClick={() => handleSelectTab(tab.key)}
                                disabled={!isAllowed}
                                cursor={isAllowed ? 'pointer' : 'not-allowed'}
                                p={3}
                                borderRadius="xl"
                                textAlign="left"
                                w="full"
                                bg={isActive ? 'brand.500' : 'transparent'}
                                color={isActive ? 'white' : isAllowed ? 'gray.700' : 'gray.400'}
                                boxShadow={isActive ? 'md' : 'none'}
                                border="1px solid"
                                borderColor={isActive ? 'transparent' : 'gray.100'}
                                _hover={
                                    isAllowed && !isActive
                                        ? { bg: 'brand.50', color: 'brand.600', borderColor: 'brand.200', transform: 'translateX(3px)' }
                                        : {}
                                }
                                transition="all 0.15s ease-in-out"
                                opacity={isAllowed ? 1 : 0.6}
                            >
                                <HStack spacing={3}>
                                    <Box
                                        p={2}
                                        borderRadius="lg"
                                        bg={isActive ? 'whiteAlpha.200' : 'blue.50'}
                                        color={isActive ? 'white' : 'blue.600'}
                                        flexShrink={0}
                                    >
                                        <Icon as={isAllowed ? tab.icon : FiLock} boxSize={4} />
                                    </Box>
                                    <Box minW={0} flex={1}>
                                        <Text fontWeight={isActive ? '800' : '700'} fontSize="sm" lineHeight="1.2">
                                            {tab.label}
                                        </Text>
                                        <Text fontSize="10px" color={isActive ? 'whiteAlpha.900' : 'gray.400'} noOfLines={1} mt={0.5}>
                                            {tab.subtitle}
                                        </Text>
                                    </Box>
                                    {isActive && (
                                        <Icon as={FiChevronRight} boxSize={4} color="white" />
                                    )}
                                </HStack>
                            </Box>
                        </Tooltip>
                    );
                })()}

                {/* 2 -> Enquiry Tab */}
                {(() => {
                    const tab = verticalTabs[1];
                    const isActive = activeTab === tab.key;
                    const isAllowed = tab.allowed;

                    return (
                        <Tooltip
                            key={tab.id}
                            label={!isAllowed ? 'Access restricted by administrator permissions' : ''}
                            isDisabled={isAllowed}
                            placement="right"
                        >
                            <Box
                                as="button"
                                onClick={() => handleSelectTab(tab.key)}
                                disabled={!isAllowed}
                                cursor={isAllowed ? 'pointer' : 'not-allowed'}
                                p={3}
                                borderRadius="xl"
                                textAlign="left"
                                w="full"
                                bg={isActive ? 'orange.500' : 'transparent'}
                                color={isActive ? 'white' : isAllowed ? 'gray.700' : 'gray.400'}
                                boxShadow={isActive ? 'md' : 'none'}
                                border="1px solid"
                                borderColor={isActive ? 'transparent' : 'gray.100'}
                                _hover={
                                    isAllowed && !isActive
                                        ? { bg: 'orange.50', color: 'orange.600', borderColor: 'orange.200', transform: 'translateX(3px)' }
                                        : {}
                                }
                                transition="all 0.15s ease-in-out"
                                opacity={isAllowed ? 1 : 0.6}
                            >
                                <HStack spacing={3}>
                                    <Box
                                        p={2}
                                        borderRadius="lg"
                                        bg={isActive ? 'whiteAlpha.200' : 'orange.50'}
                                        color={isActive ? 'white' : 'orange.600'}
                                        flexShrink={0}
                                    >
                                        <Icon as={isAllowed ? tab.icon : FiLock} boxSize={4} />
                                    </Box>
                                    <Box minW={0} flex={1}>
                                        <Text fontWeight={isActive ? '800' : '700'} fontSize="sm" lineHeight="1.2">
                                            {tab.label}
                                        </Text>
                                        <Text fontSize="10px" color={isActive ? 'whiteAlpha.900' : 'gray.400'} noOfLines={1} mt={0.5}>
                                            {tab.subtitle}
                                        </Text>
                                    </Box>
                                    {isActive && (
                                        <Icon as={FiChevronRight} boxSize={4} color="white" />
                                    )}
                                </HStack>
                            </Box>
                        </Tooltip>
                    );
                })()}

                <Divider my={3} borderColor="gray.200" />

                {/* 3 -> Admin Button (Action to exit back to Admin Dashboard) */}
                <Box
                    as="button"
                    onClick={() => navigate('/admin/dashboard')}
                    p={3}
                    borderRadius="xl"
                    textAlign="left"
                    w="full"
                    bg="purple.50"
                    color="purple.700"
                    border="1.5px solid"
                    borderColor="purple.200"
                    boxShadow="sm"
                    _hover={{
                        bg: 'purple.600',
                        color: 'white',
                        borderColor: 'purple.600',
                        transform: 'translateX(3px)',
                        boxShadow: 'md'
                    }}
                    transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
                    role="group"
                >
                    <HStack spacing={3}>
                        <Box
                            p={2}
                            borderRadius="lg"
                            bg="purple.100"
                            color="purple.700"
                            _groupHover={{ bg: 'whiteAlpha.300', color: 'white' }}
                            flexShrink={0}
                            transition="all 0.2s"
                        >
                            <Icon as={FiShield} boxSize={4} />
                        </Box>
                        <Box minW={0} flex={1}>
                            <HStack spacing={1}>
                                <Text fontWeight="800" fontSize="sm" lineHeight="1.2">
                                    3. Admin Panel
                                </Text>
                            </HStack>
                            <Text fontSize="10px" opacity={0.8} noOfLines={1} mt={0.5}>
                                Return to Main Dashboard
                            </Text>
                        </Box>
                        <Icon
                            as={FiArrowLeft}
                            boxSize={4}
                            _groupHover={{ transform: 'translateX(-2px)' }}
                            transition="transform 0.2s"
                        />
                    </HStack>
                </Box>
            </VStack>

            {/* Bottom Footer Info in Sidebar */}
            <Box pt={4} mt="auto" borderTop="1px solid" borderColor="gray.100">
                <HStack justify="space-between" align="center">
                    <Box minW={0}>
                        <Text fontSize="10px" color="gray.400" fontWeight="bold">Logged in as</Text>
                        <Text fontSize="xs" fontWeight="bold" color="gray.700" noOfLines={1}>
                            {user?.name || 'Admin'}
                        </Text>
                    </Box>
                    <Button
                        size="xs"
                        variant="ghost"
                        colorScheme="gray"
                        leftIcon={<Icon as={FiArrowLeft} />}
                        onClick={() => navigate('/admin/dashboard')}
                        fontSize="10px"
                    >
                        Exit
                    </Button>
                </HStack>
            </Box>
        </Flex>
    );

    if (!hasAnyAccess) {
        return (
            <Box minH="100vh" bg={pageBg} p={8} display="flex" alignItems="center" justifyContent="center">
                <Alert
                    status="error"
                    variant="subtle"
                    flexDirection="column"
                    alignItems="center"
                    justifyContent="center"
                    textAlign="center"
                    maxW="500px"
                    p={8}
                    borderRadius="2xl"
                    boxShadow="lg"
                    bg="white"
                >
                    <AlertIcon boxSize="40px" mr={0} color="red.500" />
                    <AlertTitle mt={4} mb={2} fontSize="xl" fontWeight="black" color="red.800">
                        Access Restricted
                    </AlertTitle>
                    <AlertDescription color="gray.600" fontSize="sm">
                        You do not have permission to access the <strong>Unique Lab Instruments</strong> portal. Please contact your Super Administrator.
                    </AlertDescription>
                    <Button
                        mt={6}
                        colorScheme="purple"
                        borderRadius="xl"
                        leftIcon={<Icon as={FiArrowLeft} />}
                        onClick={() => navigate('/admin/dashboard')}
                    >
                        Return to Admin Dashboard
                    </Button>
                </Alert>
            </Box>
        );
    }

    return (
        <Flex minH="100vh" bg={pageBg}>
            {/* ── DESKTOP VERTICAL BAR (Left Side - Fixed 250px) ── */}
            <Box
                display={{ base: 'none', md: 'block' }}
                w="250px"
                minW="250px"
                position="sticky"
                top="0"
                h="100vh"
                zIndex="20"
                boxShadow="sm"
            >
                {renderSidebarContent(false)}
            </Box>

            {/* ── MOBILE DRAWER (For small screens) ── */}
            <Drawer isOpen={isMobileOpen} placement="left" onClose={onMobileClose} size="xs">
                <DrawerOverlay />
                <DrawerContent>
                    <DrawerCloseButton zIndex={10} />
                    <DrawerBody p={0}>
                        {renderSidebarContent(true)}
                    </DrawerBody>
                </DrawerContent>
            </Drawer>

            {/* ── MAIN CONTENT (Right Side - Full Width Table / Manager) ── */}
            <Box flex="1" minW="0" overflowX="hidden">
                {/* Mobile Top Navbar with Hamburger Toggle */}
                <Flex
                    display={{ base: 'flex', md: 'none' }}
                    align="center"
                    justify="space-between"
                    p={3}
                    bg="white"
                    borderBottom="1px solid"
                    borderColor="gray.200"
                    position="sticky"
                    top="0"
                    zIndex="30"
                    boxShadow="xs"
                >
                    <HStack spacing={2.5}>
                        <IconButton
                            icon={<FiMenu />}
                            variant="ghost"
                            size="sm"
                            aria-label="Open Navigation"
                            onClick={onMobileOpen}
                        />
                        <Text fontWeight="800" fontSize="sm" color="gray.800">
                            Unique Lab Instruments
                        </Text>
                    </HStack>
                    <HStack spacing={2}>
                        <Badge colorScheme={activeTab === 'products' ? 'blue' : 'orange'} borderRadius="full" px={2} py={0.5} fontSize="10px">
                            {activeTab === 'products' ? 'Product' : 'Enquiry'}
                        </Badge>
                        <IconButton
                            icon={<FiArrowLeft />}
                            size="sm"
                            colorScheme="purple"
                            variant="outline"
                            aria-label="Back to Admin"
                            onClick={() => navigate('/admin/dashboard')}
                            title="Back to Admin"
                        />
                    </HStack>
                </Flex>

                {/* Top Quick Status Header Bar (Desktop & Tablet) */}
                <Flex
                    display={{ base: 'none', md: 'flex' }}
                    align="center"
                    justify="space-between"
                    px={6}
                    py={3.5}
                    bg="white"
                    borderBottom="1px solid"
                    borderColor="gray.200"
                    boxShadow="xs"
                >
                    <HStack spacing={3}>
                        <Badge
                            colorScheme={activeTab === 'products' ? 'blue' : 'orange'}
                            px={3}
                            py={1}
                            borderRadius="lg"
                            fontSize="xs"
                            fontWeight="black"
                        >
                            {activeTab === 'products' ? '📦 ACTIVE: PRODUCT CATALOG' : '💬 ACTIVE: ENQUIRIES & QUOTATIONS'}
                        </Badge>
                        <Text fontSize="xs" color="gray.500" fontWeight="bold">
                            {activeTab === 'products' ? 'Manage product inventory, pricing and vendor details' : 'Review incoming enquiries, generate outbound quotations & track history'}
                        </Text>
                    </HStack>

                    <HStack spacing={3}>
                        <Button
                            size="sm"
                            variant="outline"
                            colorScheme="purple"
                            leftIcon={<Icon as={FiArrowLeft} />}
                            onClick={() => navigate('/admin/dashboard')}
                            borderRadius="xl"
                            fontWeight="bold"
                        >
                            Back to Admin Panel
                        </Button>
                    </HStack>
                </Flex>

                {/* Dynamic Table / Manager View */}
                <Box p={{ base: 3, md: 6 }}>
                    {/* 1. Product Table Component */}
                    <Box display={activeTab === 'products' ? 'block' : 'none'}>
                        {canReadProducts ? (
                            <AdminProducts />
                        ) : (
                            <Box p={8} bg="white" borderRadius="2xl" textAlign="center" boxShadow="sm">
                                <Text color="red.500" fontWeight="bold">You do not have permission to view Products.</Text>
                            </Box>
                        )}
                    </Box>

                    {/* 2. Enquiry Table Component */}
                    <Box display={activeTab === 'enquiries' ? 'block' : 'none'}>
                        {canReadEnquiries ? (
                            <AdminEnquiries />
                        ) : (
                            <Box p={8} bg="white" borderRadius="2xl" textAlign="center" boxShadow="sm">
                                <Text color="red.500" fontWeight="bold">You do not have permission to view Enquiries.</Text>
                            </Box>
                        )}
                    </Box>
                </Box>
            </Box>
        </Flex>
    );
};

export default UniqueLabInstrumentsPage;
