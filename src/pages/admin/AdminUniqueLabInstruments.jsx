import React, { useState, useEffect } from 'react';
import {
    Box, Flex, VStack, HStack, Text, Heading, Badge, Button, Icon,
    Alert, AlertIcon, AlertTitle, AlertDescription, Tooltip, useColorModeValue
} from '@chakra-ui/react';
import { FiBox, FiMessageSquare, FiLock, FiCheckCircle, FiChevronRight, FiLayers } from 'react-icons/fi';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { hasPermission } from '../../utils/permissions';
import AdminProducts from './AdminProducts';
import AdminEnquiries from './AdminEnquiries';

const AdminUniqueLabInstruments = () => {
    const { user } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    const canReadProducts = hasPermission(user, 'products', 'read');
    const canReadEnquiries = hasPermission(user, 'enquiries', 'read');
    const hasAnyAccess = canReadProducts || canReadEnquiries;

    // Determine initial active tab based on URL param and user permissions
    const tabParam = searchParams.get('tab');
    const getInitialTab = () => {
        if (tabParam === 'enquiries' && canReadEnquiries) return 'enquiries';
        if (tabParam === 'products' && canReadProducts) return 'products';
        if (canReadProducts) return 'products';
        if (canReadEnquiries) return 'enquiries';
        return 'products'; // Fallback
    };

    const [activeTab, setActiveTab] = useState(getInitialTab);

    // Sync tab when URL param or permissions change
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

    const handleSelectTab = (tabKey) => {
        if (tabKey === 'products' && !canReadProducts) return;
        if (tabKey === 'enquiries' && !canReadEnquiries) return;
        setActiveTab(tabKey);
        setSearchParams({ tab: tabKey });
    };

    // If user lacks permissions for both modules
    if (!hasAnyAccess) {
        return (
            <Box p={{ base: 4, md: 8 }} maxW="1200px" mx="auto">
                <Alert
                    status="error"
                    variant="subtle"
                    flexDirection="column"
                    alignItems="center"
                    justifyContent="center"
                    textAlign="center"
                    p={8}
                    borderRadius="2xl"
                    boxShadow="md"
                    bg="red.50"
                    border="1px solid"
                    borderColor="red.200"
                >
                    <AlertIcon boxSize="40px" mr={0} color="red.500" />
                    <AlertTitle mt={4} mb={2} fontSize="xl" fontWeight="black" color="red.800">
                        Access Restricted
                    </AlertTitle>
                    <AlertDescription maxW="md" color="red.700" fontSize="sm">
                        You do not currently have permission to access the <strong>Unique Lab Instruments</strong> portal (Products or Enquiries). Please contact a Super Administrator to grant you access.
                    </AlertDescription>
                    <Button
                        mt={6}
                        colorScheme="red"
                        variant="outline"
                        borderRadius="xl"
                        onClick={() => navigate('/admin/dashboard')}
                    >
                        Return to Dashboard
                    </Button>
                </Alert>
            </Box>
        );
    }

    const tabs = [
        {
            key: 'products',
            label: 'Products',
            title: 'Products Catalog',
            subtitle: 'Stock, Pricing, Categories & Vendors',
            icon: FiBox,
            colorScheme: 'brand',
            allowed: canReadProducts,
            activeBg: 'linear-gradient(135deg, #3182ce 0%, #2b6cb0 100%)',
            activeColor: 'white'
        },
        {
            key: 'enquiries',
            label: 'Enquiries',
            title: 'Customer Enquiries',
            subtitle: 'Quotations, Requests & Processed Deals',
            icon: FiMessageSquare,
            colorScheme: 'orange',
            allowed: canReadEnquiries,
            activeBg: 'linear-gradient(135deg, #dd6b20 0%, #c05621 100%)',
            activeColor: 'white'
        }
    ];

    return (
        <Box>
            {/* Top Page Header Banner */}
            <Box
                bg="white"
                p={{ base: 4, md: 6 }}
                borderRadius="2xl"
                boxShadow="sm"
                border="1px solid"
                borderColor="gray.100"
                mb={6}
            >
                <Flex
                    justify="space-between"
                    align={{ base: 'flex-start', md: 'center' }}
                    direction={{ base: 'column', md: 'row' }}
                    gap={4}
                >
                    <Box>
                        <HStack spacing={2} mb={1} wrap="wrap">
                            <Badge
                                colorScheme="purple"
                                bg="purple.50"
                                color="purple.700"
                                px={3}
                                py={0.5}
                                borderRadius="full"
                                fontSize="xs"
                                fontWeight="black"
                                letterSpacing="wider"
                                border="1px solid"
                                borderColor="purple.200"
                            >
                                INDUSTRIAL & LAB EQUIPMENT
                            </Badge>
                            {canReadProducts && (
                                <Badge colorScheme="blue" borderRadius="full" px={2.5} py={0.5} fontSize="10px" fontWeight="bold">
                                    ✓ Products Active
                                </Badge>
                            )}
                            {canReadEnquiries && (
                                <Badge colorScheme="orange" borderRadius="full" px={2.5} py={0.5} fontSize="10px" fontWeight="bold">
                                    ✓ Enquiries Active
                                </Badge>
                            )}
                            {user?.isSuperAdmin && (
                                <Badge colorScheme="teal" borderRadius="full" px={2.5} py={0.5} fontSize="10px" fontWeight="bold">
                                    ★ Super Admin
                                </Badge>
                            )}
                        </HStack>
                        <Heading
                            fontSize={{ base: 'xl', md: '2xl', lg: '3xl' }}
                            fontWeight="900"
                            bgGradient="linear(to-r, blue.600, purple.600, orange.500)"
                            bgClip="text"
                            lineHeight="1.2"
                        >
                            Unique Lab Instruments
                        </Heading>
                        <Text fontSize="sm" color="gray.500" mt={1}>
                            Unified management console for industrial testing instruments, inventory catalog, and client quotation requests.
                        </Text>
                    </Box>
                </Flex>
            </Box>

            {/* Main Content Layout with Vertical Navigation Tabs */}
            <Flex
                direction={{ base: 'column', lg: 'row' }}
                align="flex-start"
                gap={6}
            >
                {/* ── Vertical Tabs Navigation Sidebar (Desktop & Mobile) ── */}
                <Box
                    w={{ base: 'full', lg: '280px', xl: '300px' }}
                    flexShrink={0}
                    position={{ base: 'static', lg: 'sticky' }}
                    top="24px"
                    zIndex={2}
                >
                    <Box
                        bg="white"
                        p={3}
                        borderRadius="2xl"
                        boxShadow="sm"
                        border="1px solid"
                        borderColor="gray.100"
                    >
                        <Text
                            fontSize="10px"
                            fontWeight="800"
                            color="gray.400"
                            textTransform="uppercase"
                            letterSpacing="wider"
                            px={3}
                            pt={2}
                            pb={3}
                        >
                            Module Navigation
                        </Text>

                        <VStack spacing={2} align="stretch">
                            {tabs.map((tab) => {
                                const isActive = activeTab === tab.key;
                                const isAllowed = tab.allowed;

                                return (
                                    <Tooltip
                                        key={tab.key}
                                        label={!isAllowed ? 'Access restricted by administrator permissions' : ''}
                                        isDisabled={isAllowed}
                                        placement="right"
                                        hasArrow
                                    >
                                        <Box
                                            as="button"
                                            onClick={() => handleSelectTab(tab.key)}
                                            disabled={!isAllowed}
                                            cursor={isAllowed ? 'pointer' : 'not-allowed'}
                                            p={3.5}
                                            borderRadius="xl"
                                            textAlign="left"
                                            w="full"
                                            position="relative"
                                            overflow="hidden"
                                            transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
                                            bg={isActive ? tab.activeBg : 'transparent'}
                                            color={isActive ? tab.activeColor : isAllowed ? 'gray.700' : 'gray.400'}
                                            boxShadow={isActive ? '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' : 'none'}
                                            border="1px solid"
                                            borderColor={isActive ? 'transparent' : 'gray.100'}
                                            _hover={
                                                isAllowed && !isActive
                                                    ? { bg: 'gray.50', borderColor: 'gray.200', transform: 'translateX(2px)' }
                                                    : {}
                                            }
                                            opacity={isAllowed ? 1 : 0.6}
                                        >
                                            <Flex align="center" justify="space-between">
                                                <HStack spacing={3} minW={0}>
                                                    <Box
                                                        p={2.5}
                                                        borderRadius="lg"
                                                        bg={isActive ? 'whiteAlpha.200' : isAllowed ? (tab.key === 'products' ? 'blue.50' : 'orange.50') : 'gray.100'}
                                                        color={isActive ? 'white' : isAllowed ? (tab.key === 'products' ? 'blue.600' : 'orange.600') : 'gray.400'}
                                                        flexShrink={0}
                                                        boxShadow={isActive ? 'none' : 'xs'}
                                                    >
                                                        <Icon as={isAllowed ? tab.icon : FiLock} w={5} h={5} />
                                                    </Box>
                                                    <Box minW={0}>
                                                        <HStack spacing={1.5} align="center">
                                                            <Text
                                                                fontWeight="900"
                                                                fontSize="sm"
                                                                lineHeight="1.2"
                                                                noOfLines={1}
                                                            >
                                                                {tab.title}
                                                            </Text>
                                                            {!isAllowed && (
                                                                <Icon as={FiLock} w={3} h={3} color="red.400" />
                                                            )}
                                                        </HStack>
                                                        <Text
                                                            fontSize="11px"
                                                            mt={0.5}
                                                            color={isActive ? 'whiteAlpha.900' : 'gray.400'}
                                                            noOfLines={1}
                                                        >
                                                            {tab.subtitle}
                                                        </Text>
                                                    </Box>
                                                </HStack>

                                                <Icon
                                                    as={FiChevronRight}
                                                    w={4}
                                                    h={4}
                                                    color={isActive ? 'white' : 'gray.300'}
                                                    opacity={isActive ? 1 : 0.5}
                                                    flexShrink={0}
                                                />
                                            </Flex>
                                        </Box>
                                    </Tooltip>
                                );
                            })}
                        </VStack>

                        {/* Quick Information Box */}
                        <Box
                            mt={4}
                            p={3.5}
                            borderRadius="xl"
                            bg="gray.50"
                            border="1px dashed"
                            borderColor="gray.200"
                        >
                            <HStack spacing={2} mb={1}>
                                <Icon as={FiLayers} color="purple.500" w={3.5} h={3.5} />
                                <Text fontSize="11px" fontWeight="bold" color="gray.700">
                                    Quick Tip
                                </Text>
                            </HStack>
                            <Text fontSize="10px" color="gray.500" lineHeight="1.4">
                                Switch vertically between the <strong>Products Catalog</strong> and <strong>Customer Enquiries</strong> without losing your search filters or pending updates.
                            </Text>
                        </Box>
                    </Box>
                </Box>

                {/* ── Main Tab Content Area (Right Side) ── */}
                <Box flex="1" minW={0} w="full">
                    {/* Products Tab Component */}
                    <Box display={activeTab === 'products' ? 'block' : 'none'}>
                        {canReadProducts ? (
                            <AdminProducts />
                        ) : (
                            <Box p={8} bg="white" borderRadius="2xl" border="1px" borderColor="red.100" textAlign="center">
                                <Icon as={FiLock} w={8} h={8} color="red.400" mb={3} />
                                <Heading size="sm" color="red.700" mb={1}>Products Module Restricted</Heading>
                                <Text fontSize="xs" color="gray.500">You do not have permission to view product catalog.</Text>
                            </Box>
                        )}
                    </Box>

                    {/* Enquiries Tab Component */}
                    <Box display={activeTab === 'enquiries' ? 'block' : 'none'}>
                        {canReadEnquiries ? (
                            <AdminEnquiries />
                        ) : (
                            <Box p={8} bg="white" borderRadius="2xl" border="1px" borderColor="red.100" textAlign="center">
                                <Icon as={FiLock} w={8} h={8} color="red.400" mb={3} />
                                <Heading size="sm" color="red.700" mb={1}>Enquiries Module Restricted</Heading>
                                <Text fontSize="xs" color="gray.500">You do not have permission to view enquiries and quotations.</Text>
                            </Box>
                        )}
                    </Box>
                </Box>
            </Flex>
        </Box>
    );
};

export default AdminUniqueLabInstruments;
