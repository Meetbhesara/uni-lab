import React, { useState, useEffect } from 'react';
import {
    Box, Flex, Text, Button, Heading, SimpleGrid, Badge,
    useToast, Spinner, Icon, Alert, AlertIcon, VStack, Center, Image
} from '@chakra-ui/react';
import { FiSmartphone, FiCheckCircle, FiXCircle, FiLoader, FiRefreshCw, FiInfo } from 'react-icons/fi';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const AdminWhatsappSettings = () => {
    const { user } = useAuth();
    const toast = useToast();

    // Session states
    const [systemStatus, setSystemStatus] = useState({ status: 'disconnected', qr: null });
    const [adminStatus, setAdminStatus] = useState({ status: 'disconnected', qr: null });

    const [loadingSystem, setLoadingSystem] = useState(false);
    const [loadingAdmin, setLoadingAdmin] = useState(false);

    // Super Admin states
    const [adminsList, setAdminsList] = useState([]);
    const [adminsStatus, setAdminsStatus] = useState({});
    const [loadingAdminAction, setLoadingAdminAction] = useState({});

    // Fetch list of all administrators (only for super admin)
    useEffect(() => {
        if (user?.isSuperAdmin) {
            const fetchAdmins = async () => {
                try {
                    const res = await api.get('/auth/admins');
                    setAdminsList(res.data || []);
                } catch (err) {
                    console.error("Error fetching admins:", err);
                }
            };
            fetchAdmins();
        }
    }, [user]);

    // Poll statuses every 3 seconds
    useEffect(() => {
        const fetchStatuses = async () => {
            try {
                // Fetch System Default Status
                const sysRes = await api.get('/whatsapp/status?sessionId=system_default');
                setSystemStatus(sysRes.data);

                // Fetch Personal Admin Status
                if (user?.id) {
                    const admRes = await api.get(`/whatsapp/status?sessionId=admin_${user.id}`);
                    setAdminStatus(admRes.data);
                }

                // If Super Admin, fetch all other admins' statuses
                if (user?.isSuperAdmin && adminsList.length > 0) {
                    const statuses = {};
                    await Promise.all(
                        adminsList.map(async (adm) => {
                            const id = adm._id || adm.id;
                            try {
                                const res = await api.get(`/whatsapp/status?sessionId=admin_${id}`);
                                statuses[id] = res.data;
                            } catch (e) {
                                statuses[id] = { status: 'disconnected', qr: null };
                            }
                        })
                    );
                    setAdminsStatus(statuses);
                }
            } catch (err) {
                console.error("Error fetching WhatsApp status:", err);
            }
        };

        fetchStatuses();
        const interval = setInterval(fetchStatuses, 3000);
        return () => clearInterval(interval);
    }, [user, adminsList]);

    const handleConnect = async (sessionId, setLoader) => {
        setLoader(true);
        try {
            await api.post('/whatsapp/connect', { sessionId });
            toast({
                title: "Initializing Connection",
                description: "Starting the WhatsApp initialization. Please wait for the QR code.",
                status: "info",
                duration: 4000,
                isClosable: true,
            });
        } catch (err) {
            toast({
                title: "Failed to Connect",
                description: err.response?.data?.error || err.message,
                status: "error",
                duration: 4000,
                isClosable: true,
            });
        } finally {
            setLoader(false);
        }
    };

    const handleDisconnect = async (sessionId, setLoader) => {
        setLoader(true);
        try {
            await api.post('/whatsapp/disconnect', { sessionId });
            toast({
                title: "Session Disconnected",
                description: "WhatsApp session credentials have been deleted.",
                status: "success",
                duration: 4000,
                isClosable: true,
            });
        } catch (err) {
            toast({
                title: "Failed to Disconnect",
                description: err.response?.data?.error || err.message,
                status: "error",
                duration: 4000,
                isClosable: true,
            });
        } finally {
            setLoader(false);
        }
    };

    const handleAdminActionConnect = async (adminId) => {
        setLoadingAdminAction(prev => ({ ...prev, [adminId]: true }));
        try {
            await api.post('/whatsapp/connect', { sessionId: `admin_${adminId}` });
            toast({
                title: "Session Initializing",
                description: "Starting the WhatsApp connection. Please wait for the QR code to load.",
                status: "info",
                duration: 4000,
                isClosable: true,
            });
        } catch (err) {
            toast({
                title: "Failed to Connect",
                description: err.response?.data?.error || err.message,
                status: "error",
                duration: 4000,
                isClosable: true,
            });
        } finally {
            setLoadingAdminAction(prev => ({ ...prev, [adminId]: false }));
        }
    };

    const handleAdminActionDisconnect = async (adminId) => {
        setLoadingAdminAction(prev => ({ ...prev, [adminId]: true }));
        try {
            await api.post('/whatsapp/disconnect', { sessionId: `admin_${adminId}` });
            toast({
                title: "Session Terminated",
                description: "WhatsApp session credentials purged successfully.",
                status: "success",
                duration: 4000,
                isClosable: true,
            });
        } catch (err) {
            toast({
                title: "Failed to Disconnect",
                description: err.response?.data?.error || err.message,
                status: "error",
                duration: 4000,
                isClosable: true,
            });
        } finally {
            setLoadingAdminAction(prev => ({ ...prev, [adminId]: false }));
        }
    };

    const renderStatusBadge = (status) => {
        switch (status) {
            case 'ready':
                return (
                    <Badge colorScheme="green" variant="solid" borderRadius="full" px={3} py={1} display="inline-flex" alignItems="center" gap={1}>
                        <Icon as={FiCheckCircle} /> Ready / Connected
                    </Badge>
                );
            case 'initializing':
                return (
                    <Badge colorScheme="blue" variant="solid" borderRadius="full" px={3} py={1} display="inline-flex" alignItems="center" gap={1.5}>
                        <Spinner size="xs" thickness="1.5px" speed="0.75s" /> Initializing
                    </Badge>
                );
            case 'qr':
                return (
                    <Badge colorScheme="purple" variant="solid" borderRadius="full" px={3} py={1} display="inline-flex" alignItems="center" gap={1}>
                        <Icon as={FiSmartphone} /> Waiting for Scan
                    </Badge>
                );
            case 'disconnected':
            default:
                return (
                    <Badge colorScheme="red" variant="solid" borderRadius="full" px={3} py={1} display="inline-flex" alignItems="center" gap={1}>
                        <Icon as={FiXCircle} /> Disconnected
                    </Badge>
                );
        }
    };

    const renderQRSection = (sessionState, sessionId, setLoader, loadingState) => {
        if (sessionState.status === 'qr' && sessionState.qr) {
            const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(sessionState.qr)}`;
            return (
                <VStack spacing={4} mt={4} p={4} bg="white" borderRadius="xl" border="1px" borderColor="gray.100" align="center">
                    <Text fontWeight="600" fontSize="sm" color="gray.600">Scan this QR code with your phone:</Text>
                    <Box p={3} bg="white" borderRadius="lg" boxShadow="md" border="1px solid" borderColor="gray.200">
                        <Image src={qrUrl} alt="WhatsApp QR Code" boxSize="250px" />
                    </Box>
                    <Text fontSize="xs" color="gray.400" textAlign="center">
                        {"Open WhatsApp on your phone → Linked Devices → Link a Device"}
                    </Text>
                </VStack>
            );
        }

        if (sessionState.status === 'initializing') {
            return (
                <Center h="200px" mt={4} flexDirection="column" gap={3}>
                    <Spinner size="lg" color="brand.500" thickness="3px" />
                    <Text fontSize="sm" color="gray.500">Starting browser environment...</Text>
                </Center>
            );
        }

        return null;
    };

    return (
        <Box p={{ base: 4, md: 6 }} pb={{ base: 12, md: 16 }}>
            <Flex direction="column" gap={2} mb={6}>
                <Heading size="lg" fontWeight="800" color="gray.800">
                    WhatsApp Connection Manager
                </Heading>
                <Text color="gray.500" fontSize="sm">
                    Configure multiple WhatsApp sender accounts. Default system notifications go through the System Default line, while personal admin operations route through your connected device.
                </Text>
            </Flex>

            <Alert status="info" borderRadius="2xl" mb={6} border="1px solid" borderColor="blue.100" bg="blue.50/50">
                <AlertIcon as={FiInfo} color="blue.500" />
                <Box>
                    <Text fontWeight="bold" fontSize="sm">How Routing Works</Text>
                    <Text fontSize="xs" color="gray.600" mt={0.5}>
                        • <strong>OTPs & Security Codes</strong>: Always routed through the <strong>System Default</strong> session.<br />
                        • <strong>Quotation & Product Sharing</strong>: Routed through your <strong>Personal Admin</strong> session if connected. Otherwise, it automatically falls back to the System Default.
                    </Text>
                </Box>
            </Alert>

            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
                {/* System Default WhatsApp */}
                <Box
                    bg="white"
                    p={6}
                    borderRadius="2xl"
                    boxShadow="sm"
                    border="1px"
                    borderColor="gray.200"
                    h="full"
                    display="flex"
                    flexDirection="column"
                    justifyContent="space-between"
                >
                    <Box>
                        <Flex justify="space-between" align="center" mb={4}>
                            <Text fontWeight="800" fontSize="sm" letterSpacing="wider" color="gray.400">
                                SYSTEM DEFAULT (FALLBACK & OTPS)
                            </Text>
                            {renderStatusBadge(systemStatus.status)}
                        </Flex>

                        <Heading size="md" color="gray.700" mb={2}>
                            General System Sender
                        </Heading>
                        <Text fontSize="sm" color="gray.500">
                            This line sends all automated OTPs, employee verification codes, and general system updates. Ensure this remains connected at all times.
                        </Text>

                        {renderQRSection(systemStatus, 'system_default', setLoadingSystem, loadingSystem)}
                    </Box>

                    <Flex gap={3} mt={6} pt={6} borderTop="1px" borderColor="gray.100">
                        {systemStatus.status === 'disconnected' ? (
                            <Button
                                colorScheme="brand"
                                onClick={() => handleConnect('system_default', setLoadingSystem)}
                                isLoading={loadingSystem}
                                w="full"
                                leftIcon={<Icon as={FiRefreshCw} />}
                            >
                                Connect WhatsApp
                            </Button>
                        ) : (
                            <Button
                                colorScheme="red"
                                variant="outline"
                                onClick={() => handleDisconnect('system_default', setLoadingSystem)}
                                isLoading={loadingSystem}
                                w="full"
                                leftIcon={<Icon as={FiXCircle} />}
                            >
                                Disconnect Session
                            </Button>
                        )}
                    </Flex>
                </Box>

                {/* Personal Admin WhatsApp */}
                <Box
                    bg="white"
                    p={6}
                    borderRadius="2xl"
                    boxShadow="sm"
                    border="1px"
                    borderColor="gray.200"
                    h="full"
                    display="flex"
                    flexDirection="column"
                    justifyContent="space-between"
                >
                    <Box>
                        <Flex justify="space-between" align="center" mb={4}>
                            <Text fontWeight="800" fontSize="sm" letterSpacing="wider" color="gray.400">
                                MY PERSONAL ACCOUNT
                            </Text>
                            {renderStatusBadge(adminStatus.status)}
                        </Flex>

                        <Heading size="md" color="gray.700" mb={2}>
                            {user?.name || 'Administrator'}
                        </Heading>
                        <Text fontSize="sm" color="gray.500">
                            Link your personal or business WhatsApp to send quotations and share product brochures directly from your own number when logged in.
                        </Text>

                        {user?.id && renderQRSection(adminStatus, `admin_${user.id}`, setLoadingAdmin, loadingAdmin)}
                    </Box>

                    <Flex gap={3} mt={6} pt={6} borderTop="1px" borderColor="gray.100">
                        {adminStatus.status === 'disconnected' ? (
                            <Button
                                colorScheme="purple"
                                onClick={() => handleConnect(`admin_${user.id}`, setLoadingAdmin)}
                                isLoading={loadingAdmin}
                                w="full"
                                leftIcon={<Icon as={FiRefreshCw} />}
                                disabled={!user?.id}
                            >
                                Connect My WhatsApp
                            </Button>
                        ) : (
                            <Button
                                colorScheme="red"
                                variant="outline"
                                onClick={() => handleDisconnect(`admin_${user.id}`, setLoadingAdmin)}
                                isLoading={loadingAdmin}
                                w="full"
                                leftIcon={<Icon as={FiXCircle} />}
                                disabled={!user?.id}
                            >
                                Disconnect My Account
                            </Button>
                        )}
                    </Flex>
                </Box>
            </SimpleGrid>

            {/* Super Admin Control Section */}
            {user?.isSuperAdmin && adminsList.length > 0 && (
                <Box mt={10} bg="white" p={6} borderRadius="2xl" boxShadow="sm" border="1px" borderColor="gray.200">
                    <Flex direction="column" gap={1} mb={6}>
                        <Heading size="md" color="gray.800" fontWeight="bold">
                            All Administrators Connection Status (Super Admin Control Panel)
                        </Heading>
                        <Text color="gray.500" fontSize="xs">
                            Monitor and manage WhatsApp sessions for all administrative users across the system. You can view scanner QR codes and control connections.
                        </Text>
                    </Flex>

                    <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={4}>
                        {adminsList
                            .filter((adm) => (adm._id || adm.id) !== user?.id)
                            .map((adm) => {
                                const id = adm._id || adm.id;
                            const statusObj = adminsStatus[id] || { status: 'disconnected', qr: null };
                            const isLoading = loadingAdminAction[id] || false;

                            return (
                                <Box
                                    key={id}
                                    p={5}
                                    borderRadius="2xl"
                                    border="1px"
                                    borderColor="gray.200"
                                    bg="gray.50/40"
                                    display="flex"
                                    flexDirection="column"
                                    justifyContent="space-between"
                                >
                                    <Box>
                                        <VStack align="start" spacing={3} mb={4} w="full">
                                            <Box>
                                                {renderStatusBadge(statusObj.status)}
                                            </Box>
                                            <VStack align="start" spacing={0.5} w="full">
                                                <Text fontWeight="800" color="gray.700" fontSize="sm" isTruncated maxW="100%">
                                                    {adm.name}
                                                </Text>
                                                <Text fontSize="xs" color="gray.500" isTruncated maxW="100%">
                                                    {adm.email}
                                                </Text>
                                                <Text fontSize="xs" color="gray.500">
                                                    {adm.phone}
                                                </Text>
                                            </VStack>
                                        </VStack>

                                        {renderQRSection(statusObj, `admin_${id}`, (val) => {}, false)}
                                    </Box>

                                    <Flex gap={2} mt={6} pt={4} borderTop="1px" borderColor="gray.200">
                                        {statusObj.status === 'disconnected' ? (
                                            <Button
                                                size="sm"
                                                colorScheme="purple"
                                                w="full"
                                                onClick={() => handleAdminActionConnect(id)}
                                                isLoading={isLoading}
                                                leftIcon={<Icon as={FiRefreshCw} />}
                                            >
                                                Start Connection
                                            </Button>
                                        ) : (
                                            <Button
                                                size="sm"
                                                colorScheme="red"
                                                variant="outline"
                                                w="full"
                                                onClick={() => handleAdminActionDisconnect(id)}
                                                isLoading={isLoading}
                                                leftIcon={<Icon as={FiXCircle} />}
                                            >
                                                Disconnect
                                            </Button>
                                        )}
                                    </Flex>
                                </Box>
                            );
                        })}
                    </SimpleGrid>
                </Box>
            )}
        </Box>
    );
};

export default AdminWhatsappSettings;
