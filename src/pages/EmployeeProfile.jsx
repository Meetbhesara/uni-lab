import React, { useState, useEffect } from 'react';
import {
    Box, Container, VStack, HStack, Heading, Text, Card, CardBody,
    Avatar, Badge, SimpleGrid, Icon, Divider, Button, Tag, TagLabel,
    Skeleton, Alert, AlertIcon, AlertDescription, Image, Flex, Wrap, WrapItem,
    Tabs, TabList, TabPanels, Tab, TabPanel
} from '@chakra-ui/react';
import {
    FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaIdCard, FaFilePdf,
    FaExclamationTriangle, FaSignOutAlt, FaHardHat, FaFileAlt,
    FaExternalLinkAlt, FaCar, FaUser
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import EmployeeExpenses from '../components/EmployeeExpenses';

const BASE_URL = 'http://localhost:5001';

// Document card component
const DocCard = ({ label, doc, icon }) => {
    if (!doc?.url) return (
        <Box p={4} borderRadius="xl" bg="gray.50" border="1px dashed" borderColor="gray.200" textAlign="center" opacity={0.5}>
            <Icon as={icon || FaFileAlt} w={6} h={6} color="gray.300" mb={1} />
            <Text fontSize="xs" color="gray.400">{label}</Text>
            <Text fontSize="10px" color="gray.300">Not uploaded</Text>
        </Box>
    );

    const url = `${BASE_URL}${doc.url}`;
    const isPdf = doc.name?.toLowerCase().endsWith('.pdf');

    return (
        <Box
            p={4} borderRadius="xl" bg="white" border="1px solid" borderColor="blue.100"
            boxShadow="sm" _hover={{ boxShadow: 'md', borderColor: 'blue.300' }}
            transition="all 0.2s" cursor="pointer"
            onClick={() => window.open(url, '_blank')}
        >
            <HStack spacing={3}>
                <Box w={10} h={10} borderRadius="lg" bg={isPdf ? 'red.50' : 'blue.50'}
                    display="flex" alignItems="center" justifyContent="center" flexShrink={0}>
                    <Icon as={isPdf ? FaFilePdf : FaIdCard} w={5} h={5} color={isPdf ? 'red.400' : 'blue.400'} />
                </Box>
                <Box flex={1} minW={0}>
                    <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase" letterSpacing="wide">{label}</Text>
                    <Text fontSize="sm" fontWeight="semibold" color="gray.800" noOfLines={1}>{doc.name}</Text>
                </Box>
                <Icon as={FaExternalLinkAlt} w={3} h={3} color="gray.300" />
            </HStack>
        </Box>
    );
};

const InfoRow = ({ label, value, icon }) => {
    if (!value) return null;
    return (
        <HStack spacing={3} align="start">
            <Box w={7} h={7} borderRadius="lg" bg="blue.50" display="flex" alignItems="center" justifyContent="center" flexShrink={0} mt={0.5}>
                <Icon as={icon} w={3.5} h={3.5} color="blue.500" />
            </Box>
            <Box>
                <Text fontSize="10px" fontWeight="bold" color="gray.400" textTransform="uppercase" letterSpacing="wide">{label}</Text>
                <Text fontSize="sm" fontWeight="semibold" color="gray.700">{value}</Text>
            </Box>
        </HStack>
    );
};

const EmployeeProfile = () => {
    const navigate = useNavigate();
    const [employee, setEmployee] = useState(null);
    const [loading, setLoading] = useState(true);
    const [unauthorized, setUnauthorized] = useState(false);
    const [sessionExpiry, setSessionExpiry] = useState(null);

    const doLogout = (reason = '') => {
        localStorage.removeItem('employeeToken');
        localStorage.removeItem('employeeData');
        navigate('/employee/login', { state: { reason } });
    };

    useEffect(() => {
        const token = localStorage.getItem('employeeToken');
        if (!token) { navigate('/employee/login'); return; }

        // ── Midnight Auto-Logout ──────────────────────────────────────────
        const scheduleMidnightLogout = () => {
            const now = new Date();
            const midnight = new Date();
            midnight.setHours(24, 0, 0, 0); // next midnight
            const msUntilMidnight = midnight.getTime() - now.getTime();

            // Format "Session until midnight"
            setSessionExpiry('midnight');

            const timer = setTimeout(() => {
                doLogout('expired');
            }, msUntilMidnight);

            return timer;
        };

        let midnightTimer = scheduleMidnightLogout();

        // Hourly safety-check (in case tab is idle through midnight)
        const hourlyCheck = setInterval(() => {
            const now = new Date();
            const isAfterMidnight = now.getHours() === 0 && now.getMinutes() < 5;
            if (isAfterMidnight) {
                clearTimeout(midnightTimer);
                doLogout('expired');
            }
        }, 60 * 60 * 1000); // every hour

        return () => {
            clearTimeout(midnightTimer);
            clearInterval(hourlyCheck);
        };
        // ─────────────────────────────────────────────────────────────────
    }, [navigate]);

    useEffect(() => {
        const token = localStorage.getItem('employeeToken');
        const cached = localStorage.getItem('employeeData');

        if (!token) return;

        // Load cached immediately for instant render
        if (cached) {
            try { setEmployee(JSON.parse(cached)); setLoading(false); } catch (e) { console.error(e); }
        }

        // Fetch fresh from API
        const fetchProfile = async () => {
            try {
                const res = await api.get('/employee-auth/profile', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.data.success) {
                    setEmployee(res.data.data);
                    localStorage.setItem('employeeData', JSON.stringify(res.data.data));
                }
            } catch (err) {
                if (err.response?.status === 401 || err.response?.status === 403) {
                    setUnauthorized(true);
                    localStorage.removeItem('employeeToken');
                    localStorage.removeItem('employeeData');
                }
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleLogout = () => doLogout('manual');

    if (loading && !employee) return (
        <Box minH="100vh" bg="gray.100" p={6}>
            <Container maxW="container.lg">
                <VStack spacing={4}>
                    <Skeleton height="60px" borderRadius="xl" />
                    <Skeleton height="200px" borderRadius="2xl" />
                    <Skeleton height="120px" borderRadius="2xl" />
                    <Skeleton height="160px" borderRadius="2xl" />
                </VStack>
            </Container>
        </Box>
    );

    if (unauthorized) return (
        <Box minH="100vh" bg="gray.100" display="flex" alignItems="center" justifyContent="center">
            <Alert status="error" maxW="400px" borderRadius="2xl" flexDirection="column" py={8} px={6} textAlign="center">
                <AlertIcon boxSize={8} mb={3} />
                <AlertDescription fontWeight="bold" mb={4}>Session expired. Please login again.</AlertDescription>
                <Button colorScheme="red" borderRadius="xl" onClick={() => navigate('/employee/login')}>Login Again</Button>
            </Alert>
        </Box>
    );

    if (!employee) return null;

    const formatAddress = (addr) => {
        if (!addr) return null;
        const parts = [addr.street, addr.city, addr.pincode].filter(Boolean);
        return parts.length ? parts.join(', ') : null;
    };

    const documents = [
        { label: 'Aadhaar Card', doc: employee.aadharCard, icon: FaIdCard },
        { label: 'PAN Card', doc: employee.panCard, icon: FaIdCard },
        { label: 'Voter ID', doc: employee.voterId, icon: FaIdCard },
        { label: 'Driving License', doc: employee.drivingLicense, icon: FaCar },
    ];
    const uploadedDocs = documents.filter(d => d.doc?.url);

    return (
        <Box minH="100vh" bg="gray.100">
            {/* ── Header Bar ── */}
            <Box bgGradient="linear(to-r, gray.900, blue.900)" px={6} py={3} boxShadow="md" position="sticky" top={0} zIndex={100}>
                <Container maxW="container.lg">
                    <HStack justify="space-between">
                        {/* Left: Logo + Employee Name */}
                        <HStack spacing={3}>
                            <Box w={8} h={8} borderRadius="lg" bgGradient="linear(to-br, orange.400, orange.600)"
                                display="flex" alignItems="center" justifyContent="center" flexShrink={0}>
                                <Icon as={FaHardHat} w={4} h={4} color="white" />
                            </Box>
                            <Box>
                                <Text color="whiteAlpha.600" fontSize="10px" fontWeight="bold" textTransform="uppercase" letterSpacing="wider" lineHeight={1}>
                                    Employee Portal
                                </Text>
                                <Text color="white" fontWeight="bold" fontSize="sm" lineHeight={1.3}>
                                    👋 {employee.name}
                                </Text>
                            </Box>
                        </HStack>

                        {/* Right: Session info + Sign out */}
                        <HStack spacing={3}>
                            {sessionExpiry && (
                                <HStack spacing={1} bg="whiteAlpha.100" border="1px solid" borderColor="whiteAlpha.200"
                                    px={3} py={1} borderRadius="full" display={{ base: 'none', sm: 'flex' }}>
                                    <Box w={1.5} h={1.5} borderRadius="full" bg="green.400" />
                                    <Text color="whiteAlpha.600" fontSize="xs">Session until {sessionExpiry}</Text>
                                </HStack>
                            )}
                            <Button
                                size="sm" variant="ghost" color="whiteAlpha.700"
                                leftIcon={<FaSignOutAlt />} onClick={handleLogout}
                                _hover={{ color: 'white', bg: 'whiteAlpha.100' }}
                                borderRadius="lg"
                            >
                                Sign Out
                            </Button>
                        </HStack>
                    </HStack>
                </Container>
            </Box>

            <Container maxW="container.lg" py={7}>
                <VStack spacing={5} align="stretch">

                    {/* Profile Hero Card */}
                    <Card borderRadius="2xl" boxShadow="xl" overflow="hidden">
                        <Box bgGradient="linear(135deg, blue.900, indigo.800)" px={8} py={8}>
                            <HStack spacing={6} align="center">
                                <Box position="relative">
                                    {employee.photo?.url ? (
                                        <Image
                                            src={`${BASE_URL}${employee.photo.url}`}
                                            alt={employee.name}
                                            w="100px" h="100px"
                                            borderRadius="2xl"
                                            objectFit="cover"
                                            border="3px solid"
                                            borderColor="whiteAlpha.300"
                                            boxShadow="0 8px 32px rgba(0,0,0,0.4)"
                                        />
                                    ) : (
                                        <Avatar
                                            name={employee.name}
                                            size="xl"
                                            borderRadius="2xl"
                                            border="3px solid"
                                            borderColor="whiteAlpha.300"
                                            boxShadow="0 8px 32px rgba(0,0,0,0.4)"
                                        />
                                    )}
                                    <Box position="absolute" bottom={-1} right={-1} w={4} h={4}
                                        bg="green.400" borderRadius="full" border="2px solid white" />
                                </Box>
                                <Box flex={1}>
                                    <Heading size="lg" color="white" fontWeight="800">{employee.name}</Heading>
                                    <HStack mt={1} spacing={2} flexWrap="wrap">
                                        <Tag size="sm" bg="whiteAlpha.200" color="white" borderRadius="full">
                                            <Icon as={FaPhoneAlt} w={2.5} h={2.5} mr={1} />
                                            <TagLabel>{employee.phone}</TagLabel>
                                        </Tag>
                                        {employee.email && (
                                            <Tag size="sm" bg="whiteAlpha.200" color="white" borderRadius="full">
                                                <Icon as={FaEnvelope} w={2.5} h={2.5} mr={1} />
                                                <TagLabel>{employee.email}</TagLabel>
                                            </Tag>
                                        )}
                                    </HStack>
                                    <HStack mt={3} spacing={2}>
                                        <Badge bg="orange.500" color="white" borderRadius="full" px={3} py={1} fontSize="xs">
                                            🏗️ Field Employee
                                        </Badge>
                                        <Badge bg="green.500" color="white" borderRadius="full" px={3} py={1} fontSize="xs">
                                            ✅ Verified
                                        </Badge>
                                    </HStack>
                                </Box>
                            </HStack>
                        </Box>
                    </Card>

                    <Tabs variant="enclosed" colorScheme="blue" background="white" borderRadius="xl" boxShadow="sm">
                        <TabList px={4} pt={4} borderBottom="1px" borderColor="gray.100">
                            <Tab fontWeight="bold" _selected={{ color: 'blue.600', bg: 'blue.50', borderColor: 'blue.200', borderBottomColor: 'transparent' }}>My Profile Details</Tab>
                            <Tab fontWeight="bold" _selected={{ color: 'orange.600', bg: 'orange.50', borderColor: 'orange.200', borderBottomColor: 'transparent' }}>Day Expense & Attendance</Tab>
                        </TabList>

                        <TabPanels>
                            <TabPanel p={6} bg="gray.50" borderBottomRadius="xl">
                                <VStack spacing={5} align="stretch">
                                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
                                        {/* Personal Details */}
                                        <Card borderRadius="2xl" boxShadow="sm" border="1px" borderColor="gray.200">
                                            <CardBody p={6}>
                                                <HStack mb={4}>
                                                    <Box w={7} h={7} borderRadius="lg" bg="blue.500" display="flex" alignItems="center" justifyContent="center">
                                                        <Icon as={FaUser} w={3.5} h={3.5} color="white" />
                                                    </Box>
                                                    <Heading size="sm" color="gray.700">Personal Details</Heading>
                                                </HStack>
                                                <VStack spacing={3} align="stretch">
                                                    <InfoRow label="Phone" value={employee.phone} icon={FaPhoneAlt} />
                                                    <InfoRow label="Email" value={employee.email} icon={FaEnvelope} />
                                                    {formatAddress(employee.addressLine1) && (
                                                        <InfoRow label="Primary Address" value={formatAddress(employee.addressLine1)} icon={FaMapMarkerAlt} />
                                                    )}
                                                    {formatAddress(employee.addressLine2) && (
                                                        <InfoRow label="Alternate Address" value={formatAddress(employee.addressLine2)} icon={FaMapMarkerAlt} />
                                                    )}
                                                </VStack>
                                            </CardBody>
                                        </Card>

                                        {/* Emergency Contact */}
                                        <Card borderRadius="2xl" boxShadow="sm" border="1px" borderColor="gray.200">
                                            <CardBody p={6}>
                                                <HStack mb={4}>
                                                    <Box w={7} h={7} borderRadius="lg" bg="red.500" display="flex" alignItems="center" justifyContent="center">
                                                        <Icon as={FaExclamationTriangle} w={3.5} h={3.5} color="white" />
                                                    </Box>
                                                    <Heading size="sm" color="gray.700">Emergency Contact</Heading>
                                                </HStack>
                                                {employee.emergencyContact?.name || employee.emergencyContact?.phone ? (
                                                    <VStack spacing={3} align="stretch">
                                                        <InfoRow label="Name" value={employee.emergencyContact?.name} icon={FaUser} />
                                                        <InfoRow label="Phone" value={employee.emergencyContact?.phone} icon={FaPhoneAlt} />
                                                    </VStack>
                                                ) : (
                                                    <Box textAlign="center" py={6} opacity={0.4}>
                                                        <Icon as={FaUser} w={8} h={8} color="gray.300" />
                                                        <Text fontSize="sm" color="gray.400" mt={2}>No emergency contact added</Text>
                                                    </Box>
                                                )}
                                            </CardBody>
                                        </Card>
                                    </SimpleGrid>

                                    {/* Documents Section */}
                                    <Card borderRadius="2xl" boxShadow="sm" border="1px" borderColor="gray.200">
                                        <CardBody p={6}>
                                            <HStack mb={1}>
                                                <Box w={7} h={7} borderRadius="lg" bg="purple.500" display="flex" alignItems="center" justifyContent="center">
                                                    <Icon as={FaFileAlt} w={3.5} h={3.5} color="white" />
                                                </Box>
                                                <Heading size="sm" color="gray.700">My Documents</Heading>
                                                <Tag size="sm" colorScheme="purple" borderRadius="full" ml={1}>
                                                    {uploadedDocs.length} / {documents.length}
                                                </Tag>
                                            </HStack>
                                            <Text fontSize="xs" color="gray.400" mb={4} ml={9}>Click any document to open / download</Text>
                                            <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={3}>
                                                {documents.map(d => (
                                                    <DocCard key={d.label} label={d.label} doc={d.doc} icon={d.icon} />
                                                ))}
                                            </SimpleGrid>
                                        </CardBody>
                                    </Card>
                                </VStack>
                            </TabPanel>

                            <TabPanel p={6} bg="gray.50" borderBottomRadius="xl">
                                <EmployeeExpenses />
                            </TabPanel>
                        </TabPanels>
                    </Tabs>
                </VStack>
            </Container>
        </Box>
    );
};

export default EmployeeProfile;
