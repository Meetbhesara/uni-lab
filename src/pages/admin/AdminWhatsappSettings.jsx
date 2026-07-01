import React, { useState, useEffect } from 'react';
import {
    Box, Flex, Text, Button, Heading, SimpleGrid, Badge,
    useToast, Spinner, Icon, Alert, AlertIcon, VStack, Center, Image,
    FormControl, FormLabel, Input, Divider, IconButton,
    AlertDialog, AlertDialogBody, AlertDialogFooter, AlertDialogHeader, AlertDialogContent, AlertDialogOverlay, useDisclosure
} from '@chakra-ui/react';
import { FiSmartphone, FiCheckCircle, FiXCircle, FiLoader, FiRefreshCw, FiInfo, FiMapPin, FiSave, FiTrash2 } from 'react-icons/fi';
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

    // Geofencing boundary states (only for super admin)
    const [locationsList, setLocationsList] = useState([]);
    const [newLocName, setNewLocName] = useState('');
    const [newLocLat, setNewLocLat] = useState('');
    const [newLocLon, setNewLocLon] = useState('');
    const [newLocRadius, setNewLocRadius] = useState(200);
    const [loadingGeofence, setLoadingGeofence] = useState(false);
    const [savingGeofence, setSavingGeofence] = useState(false);

    // Delete confirmation state
    const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
    const [locationToDeleteIndex, setLocationToDeleteIndex] = useState(null);
    const cancelRef = React.useRef();

    // Fetch geofence configuration (only for super admin)
    useEffect(() => {
        if (user?.isSuperAdmin) {
            const fetchGeofence = async () => {
                setLoadingGeofence(true);
                try {
                    const res = await api.get('/auth/geofence');
                    setLocationsList(res.data.locations || []);
                } catch (err) {
                    console.error("Error fetching geofence settings:", err);
                } finally {
                    setLoadingGeofence(false);
                }
            };
            fetchGeofence();
        }
    }, [user]);

    const handleSaveAllLocations = async () => {
        setSavingGeofence(true);
        try {
            const res = await api.post('/auth/geofence', { locations: locationsList });
            toast({
                title: "Locations Saved",
                description: res.data.msg || "Authorized locations saved successfully.",
                status: "success",
                duration: 4000,
                isClosable: true,
            });
        } catch (err) {
            toast({
                title: "Failed to Save",
                description: err.response?.data?.msg || err.message,
                status: "error",
                duration: 4000,
                isClosable: true,
            });
        } finally {
            setSavingGeofence(false);
        }
    };

    const handleAddLocationLocally = () => {
        if (!newLocName.trim() || !newLocLat || !newLocLon || !newLocRadius) {
            toast({
                title: "Missing Fields",
                description: "Please enter name, latitude, longitude, and radius.",
                status: "warning",
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        const newLocation = {
            id: 'loc-' + Date.now(),
            name: newLocName.trim(),
            latitude: parseFloat(newLocLat),
            longitude: parseFloat(newLocLon),
            radius: parseInt(newLocRadius)
        };

        setLocationsList(prev => [...prev, newLocation]);

        // Reset fields
        setNewLocName('');
        setNewLocLat('');
        setNewLocLon('');
        setNewLocRadius(200);

        toast({
            title: "Location Added",
            description: "Added to the list. Click 'Save All Changes' below to persist to the database.",
            status: "info",
            duration: 4000,
            isClosable: true,
        });
    };

    const handleRemoveLocationLocally = async (indexToRemove) => {
        const updatedList = locationsList.filter((_, idx) => idx !== indexToRemove);
        setLocationsList(updatedList);
        try {
            await api.post('/auth/geofence', { locations: updatedList });
            toast({
                title: "Location Deleted",
                description: "Location removed and database updated.",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
        } catch (err) {
            toast({
                title: "Removed Locally",
                description: "Remember to click 'Save All Locations' to persist.",
                status: "info",
                duration: 3000,
                isClosable: true,
            });
        }
    };

    const handleFetchCurrentLocation = () => {
        if (!navigator.geolocation) {
            toast({
                title: "Not Supported",
                description: "Geolocation is not supported by your browser.",
                status: "warning",
                duration: 3000,
                isClosable: true,
            });
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setNewLocLat(position.coords.latitude);
                setNewLocLon(position.coords.longitude);
                toast({
                    title: "Location Captured",
                    description: "Coordinates populated.",
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                });
            },
            (error) => {
                toast({
                    title: "Permission Denied",
                    description: "Please allow location access to fetch coordinates.",
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                });
            },
            { enableHighAccuracy: true }
        );
    };

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
                                isDisabled={!user?.isSuperAdmin}
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
                                isDisabled={!user?.isSuperAdmin}
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

            {/* Geofencing Boundary Settings (Super Admin Only) */}
            {user?.isSuperAdmin && (
                <Box mt={10} bg="white" p={6} borderRadius="2xl" boxShadow="sm" border="1px" borderColor="gray.200">
                    <Flex justify="space-between" align="center" direction={{ base: 'column', sm: 'row' }} gap={4} mb={6}>
                        <VStack align="start" spacing={1}>
                            <Heading size="md" color="gray.800" fontWeight="bold" display="flex" alignItems="center" gap={2}>
                                <Icon as={FiMapPin} color="brand.500" /> Geofencing Settings (Multiple Locations)
                            </Heading>
                            <Text color="gray.500" fontSize="sm">
                                Configure and manage multiple office and site locations where non-superadmin users are allowed to log in.
                            </Text>
                        </VStack>
                    </Flex>

                    {loadingGeofence ? (
                        <Center py={8}>
                            <Spinner color="brand.500" thickness="3px" size="xl" />
                        </Center>
                    ) : (
                        <Box>
                            {/* Current Locations List */}
                            {locationsList.length === 0 ? (
                                <Alert status="warning" borderRadius="xl" mb={6}>
                                    <AlertIcon />
                                    No authorized locations configured. All non-superadmin check-ins will fail.
                                </Alert>
                            ) : (
                                <VStack align="stretch" spacing={3} mb={8}>
                                    <Text fontWeight="800" fontSize="xs" letterSpacing="wider" color="gray.400" textTransform="uppercase">
                                        Active Authorized Locations
                                    </Text>
                                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                                        {locationsList.map((loc, idx) => (
                                            <Flex
                                                key={loc.id || loc._id || idx}
                                                align="center"
                                                justify="space-between"
                                                p={4}
                                                bg="gray.50/80"
                                                borderRadius="2xl"
                                                border="1px"
                                                borderColor="gray.200"
                                            >
                                                <VStack align="start" spacing={1}>
                                                    <Text fontWeight="800" color="gray.800" fontSize="sm">
                                                        {loc.name}
                                                    </Text>
                                                    <Text fontSize="xs" color="gray.500" fontWeight="600">
                                                        Coords: {parseFloat(loc.latitude).toFixed(6)}, {parseFloat(loc.longitude).toFixed(6)}
                                                    </Text>
                                                    <Badge colorScheme="brand" variant="subtle" borderRadius="md" px={2} py={0.5} fontSize="10px">
                                                        Radius: {loc.radius} meters
                                                    </Badge>
                                                </VStack>
                                                <IconButton
                                                    size="sm"
                                                    colorScheme="red"
                                                    variant="ghost"
                                                    icon={<FiTrash2 />}
                                                    onClick={() => {
                                                        setLocationToDeleteIndex(idx);
                                                        onDeleteOpen();
                                                    }}
                                                    aria-label="Delete location"
                                                    borderRadius="xl"
                                                />
                                            </Flex>
                                        ))}
                                    </SimpleGrid>
                                </VStack>
                            )}

                            <Divider my={6} />

                            {/* Add Location Form */}
                            <VStack align="stretch" spacing={4} mb={6}>
                                <Text fontWeight="800" fontSize="xs" letterSpacing="wider" color="gray.400" textTransform="uppercase">
                                    Add New Office / Site Location
                                </Text>
                                <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4} align="end">
                                    <FormControl isRequired>
                                        <FormLabel fontSize="xs" fontWeight="700" color="gray.600">Location Name</FormLabel>
                                        <Input
                                            type="text"
                                            placeholder="e.g. Rajkot Head Office"
                                            value={newLocName}
                                            onChange={(e) => setNewLocName(e.target.value)}
                                            borderRadius="xl"
                                            borderColor="gray.200"
                                            _focus={{ borderColor: 'brand.500', boxShadow: '0 0 0 1px #3182ce' }}
                                        />
                                    </FormControl>

                                    <FormControl isRequired>
                                        <FormLabel fontSize="xs" fontWeight="700" color="gray.600">Latitude</FormLabel>
                                        <Input
                                            type="number"
                                            step="any"
                                            placeholder="e.g. 22.302368"
                                            value={newLocLat}
                                            onChange={(e) => setNewLocLat(e.target.value)}
                                            borderRadius="xl"
                                            borderColor="gray.200"
                                            _focus={{ borderColor: 'brand.500', boxShadow: '0 0 0 1px #3182ce' }}
                                        />
                                    </FormControl>

                                    <FormControl isRequired>
                                        <FormLabel fontSize="xs" fontWeight="700" color="gray.600">Longitude</FormLabel>
                                        <Input
                                            type="number"
                                            step="any"
                                            placeholder="e.g. 70.828682"
                                            value={newLocLon}
                                            onChange={(e) => setNewLocLon(e.target.value)}
                                            borderRadius="xl"
                                            borderColor="gray.200"
                                            _focus={{ borderColor: 'brand.500', boxShadow: '0 0 0 1px #3182ce' }}
                                        />
                                    </FormControl>

                                    <FormControl isRequired>
                                        <FormLabel fontSize="xs" fontWeight="700" color="gray.600">Allowed Radius (Meters)</FormLabel>
                                        <Input
                                            type="number"
                                            placeholder="e.g. 200"
                                            value={newLocRadius}
                                            onChange={(e) => setNewLocRadius(parseInt(e.target.value) || 0)}
                                            borderRadius="xl"
                                            borderColor="gray.200"
                                            _focus={{ borderColor: 'brand.500', boxShadow: '0 0 0 1px #3182ce' }}
                                        />
                                    </FormControl>
                                </SimpleGrid>

                                <Flex gap={3} justify="space-between" mt={2}>
                                    <Button
                                        leftIcon={<Icon as={FiMapPin} />}
                                        size="sm"
                                        colorScheme="purple"
                                        variant="outline"
                                        onClick={handleFetchCurrentLocation}
                                        borderRadius="xl"
                                    >
                                        Detect My Coordinates
                                    </Button>
                                    <Button
                                        colorScheme="purple"
                                        onClick={handleAddLocationLocally}
                                        borderRadius="xl"
                                        px={6}
                                    >
                                        Add Location
                                    </Button>
                                </Flex>
                            </VStack>

                            <Divider my={6} />

                            <Flex justify="flex-end">
                                <Button
                                    onClick={handleSaveAllLocations}
                                    colorScheme="brand"
                                    isLoading={savingGeofence}
                                    leftIcon={<Icon as={FiSave} />}
                                    px={8}
                                    borderRadius="xl"
                                    size="lg"
                                    shadow="md"
                                >
                                    Save All Changes
                                </Button>
                            </Flex>
                        </Box>
                    )}
                </Box>
            )}

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

            {/* Delete Location Confirmation Popup */}
            <AlertDialog
                isOpen={isDeleteOpen}
                leastDestructiveRef={cancelRef}
                onClose={onDeleteClose}
                isCentered
            >
                <AlertDialogOverlay>
                    <AlertDialogContent borderRadius="2xl">
                        <AlertDialogHeader fontSize="lg" fontWeight="bold" color="red.600">
                            Delete Geofence Location
                        </AlertDialogHeader>

                        <AlertDialogBody color="gray.600">
                            Are you sure you want to delete the location{' '}
                            <Text as="span" fontWeight="bold" color="gray.800">
                                {locationToDeleteIndex !== null && locationsList[locationToDeleteIndex]?.name}
                            </Text>
                            ? This location will be removed and changes will be saved to the database immediately.
                        </AlertDialogBody>

                        <AlertDialogFooter>
                            <Button ref={cancelRef} onClick={onDeleteClose} borderRadius="xl">
                                Cancel
                            </Button>
                            <Button
                                colorScheme="red"
                                onClick={() => {
                                    if (locationToDeleteIndex !== null) {
                                        handleRemoveLocationLocally(locationToDeleteIndex);
                                    }
                                    onDeleteClose();
                                }}
                                ml={3}
                                borderRadius="xl"
                            >
                                Delete
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
        </Box>
    );
};

export default AdminWhatsappSettings;
