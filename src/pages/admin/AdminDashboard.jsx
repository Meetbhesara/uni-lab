import React, { useState, useEffect } from 'react';
import { Box, Heading, SimpleGrid, Stat, StatLabel, StatNumber, StatHelpText, Icon, Spinner, Text, FormControl, FormLabel, Input, Button, Flex, useToast } from '@chakra-ui/react';
import { FiBox, FiMessageSquare, FiClock, FiUserPlus } from 'react-icons/fi';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { DEMO_PRODUCTS, DEMO_ENQUIRIES } from '../../data/mockData';

const AdminDashboard = () => {
    const { createAdmin } = useAuth();
    const toast = useToast();

    const [stats, setStats] = useState({
        products: 0,
        totalEnquiries: 0,
        pendingEnquiries: 0,
        doneQuotations: 0,
        rejectedQuotations: 0
    });
    const [loading, setLoading] = useState(true);
    const [adminForm, setAdminForm] = useState({ name: '', email: '', phone: '' });
    const [adminLoading, setAdminLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            let pCount = 0;
            try {
                const prodRes = await api.get('/products');
                const pData = prodRes.data.products || prodRes.data.data || prodRes.data;
                pCount = Array.isArray(pData) ? pData.length : 0;
            } catch (err) {
                pCount = DEMO_PRODUCTS.length;
            }

            try {
                const [quoteRes, enqRes] = await Promise.all([
                    api.get('/quotations'),
                    api.get('/enquiries')
                ]);
                const qData = quoteRes.data.quotations || quoteRes.data.data || quoteRes.data || [];
                const eData = enqRes.data.enquiries || enqRes.data.data || enqRes.data || [];
                setStats({
                    products: pCount,
                    totalEnquiries: Array.isArray(eData) ? eData.length : 0,
                    pendingEnquiries: Array.isArray(eData) ? eData.filter(e => !e.isSeen).length : 0,
                    doneQuotations: Array.isArray(qData) ? qData.filter(q => q.status === 'Done').length : 0,
                    rejectedQuotations: Array.isArray(qData) ? qData.filter(q => q.status === 'Reject').length : 0,
                });
            } catch (err) {
                setStats({ products: pCount, totalEnquiries: DEMO_ENQUIRIES.length, pendingEnquiries: 0, doneQuotations: 0, rejectedQuotations: 0 });
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleCreateAdmin = async () => {
        if (!adminForm.name || !adminForm.email || !adminForm.phone) {
            return toast({ title: 'Please fill all fields', status: 'error', duration: 2500 });
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adminForm.email)) {
            return toast({ title: 'Enter a valid email', status: 'error', duration: 2500 });
        }
        if (adminForm.phone.length < 10) {
            return toast({ title: 'Enter a valid 10-digit phone number', status: 'error', duration: 2500 });
        }
        setAdminLoading(true);
        const res = await createAdmin(adminForm.name, adminForm.email, adminForm.phone);
        setAdminLoading(false);
        if (res.success) {
            toast({ title: '✅ Admin Created!', description: res.msg, status: 'success' });
            setAdminForm({ name: '', email: '', phone: '' });
        } else {
            toast({ title: 'Failed', description: res.message, status: 'error' });
        }
    };

    if (loading) {
        return (
            <Box h="100vh" display="flex" justifyContent="center" alignItems="center">
                <Spinner size="xl" color="brand.500" thickness="4px" />
            </Box>
        );
    }

    return (
        <Box>
            {/* Page Title */}
            <Box bg="white" p={{ base: 4, md: 6 }} borderRadius="2xl" boxShadow="sm" border="1px" borderColor="gray.100" mb={8}>
                <Heading fontSize={{ base: 'xl', md: '2xl' }} fontWeight="800" bgGradient="linear(to-r, brand.500, brand.700)" bgClip="text" mb={2}>
                    Dashboard Overview
                </Heading>
                <Text fontSize="sm" color="gray.500">Real-time performance metrics and business health.</Text>
            </Box>

            {/* Stats Grid */}
            <SimpleGrid columns={{ base: 1, md: 3, lg: 5 }} spacing={6} mb={10}>
                <Stat bg="white" p={6} borderRadius="lg" boxShadow="sm">
                    <Box display="flex" alignItems="center" mb={2} color="brand.500">
                        <Icon as={FiBox} w={6} h={6} mr={2} />
                        <StatLabel fontSize="sm" fontWeight="bold">Products</StatLabel>
                    </Box>
                    <StatNumber fontSize="3xl">{stats.products}</StatNumber>
                    <StatHelpText>Active products</StatHelpText>
                </Stat>

                <Stat bg="white" p={6} borderRadius="lg" boxShadow="sm">
                    <Box display="flex" alignItems="center" mb={2} color="blue.500">
                        <Icon as={FiMessageSquare} w={6} h={6} mr={2} />
                        <StatLabel fontSize="sm" fontWeight="bold">Total Enquiries</StatLabel>
                    </Box>
                    <StatNumber fontSize="3xl">{stats.totalEnquiries}</StatNumber>
                    <StatHelpText>All time count</StatHelpText>
                </Stat>

                <Stat bg="white" p={6} borderRadius="lg" boxShadow="sm">
                    <Box display="flex" alignItems="center" mb={2} color="orange.500">
                        <Icon as={FiMessageSquare} w={6} h={6} mr={2} />
                        <StatLabel fontSize="sm" fontWeight="bold">New Enquiries</StatLabel>
                    </Box>
                    <StatNumber fontSize="3xl">{stats.pendingEnquiries}</StatNumber>
                    <StatHelpText color="red.500">Action Required</StatHelpText>
                </Stat>

                <Stat bg="white" p={6} borderRadius="lg" boxShadow="sm">
                    <Box display="flex" alignItems="center" mb={2} color="green.500">
                        <Icon as={FiClock} w={6} h={6} mr={2} />
                        <StatLabel fontSize="sm" fontWeight="bold">Success (Done)</StatLabel>
                    </Box>
                    <StatNumber fontSize="3xl">{stats.doneQuotations}</StatNumber>
                    <StatHelpText>Closed deals</StatHelpText>
                </Stat>

                <Stat bg="white" p={6} borderRadius="lg" boxShadow="sm">
                    <Box display="flex" alignItems="center" mb={2} color="red.500">
                        <Icon as={FiClock} w={6} h={6} mr={2} />
                        <StatLabel fontSize="sm" fontWeight="bold">Rejected</StatLabel>
                    </Box>
                    <StatNumber fontSize="3xl">{stats.rejectedQuotations}</StatNumber>
                    <StatHelpText>Lost deals</StatHelpText>
                </Stat>
            </SimpleGrid>

            {/* Create Admin Card */}
            <Box bg="white" p={{ base: 4, md: 6 }} borderRadius="2xl" boxShadow="sm" border="1px" borderColor="purple.100">
                <Flex align="center" gap={3} mb={4}>
                    <Box p={2} bg="purple.100" borderRadius="lg">
                        <Icon as={FiUserPlus} color="purple.600" w={5} h={5} />
                    </Box>
                    <Box>
                        <Heading fontSize="lg" fontWeight="800" color="purple.700">Create Admin User</Heading>
                        <Text fontSize="xs" color="gray.500">Add a new admin or promote an existing user. They will login via Email + OTP on WhatsApp.</Text>
                    </Box>
                </Flex>

                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                    <FormControl isRequired>
                        <FormLabel fontSize="sm" fontWeight="700">Full Name</FormLabel>
                        <Input
                            placeholder="John Doe"
                            value={adminForm.name}
                            onChange={(e) => setAdminForm(p => ({ ...p, name: e.target.value }))}
                            borderRadius="lg"
                        />
                    </FormControl>
                    <FormControl isRequired>
                        <FormLabel fontSize="sm" fontWeight="700">Email Address</FormLabel>
                        <Input
                            type="email"
                            placeholder="admin@company.com"
                            value={adminForm.email}
                            onChange={(e) => setAdminForm(p => ({ ...p, email: e.target.value }))}
                            borderRadius="lg"
                        />
                    </FormControl>
                    <FormControl isRequired>
                        <FormLabel fontSize="sm" fontWeight="700">Phone Number</FormLabel>
                        <Input
                            placeholder="9876543210"
                            value={adminForm.phone}
                            onChange={(e) => setAdminForm(p => ({ ...p, phone: e.target.value.replace(/\D/g, '') }))}
                            maxLength={10}
                            borderRadius="lg"
                        />
                    </FormControl>
                </SimpleGrid>

                <Button
                    mt={4}
                    colorScheme="purple"
                    leftIcon={<Icon as={FiUserPlus} />}
                    isLoading={adminLoading}
                    loadingText="Creating..."
                    onClick={handleCreateAdmin}
                    borderRadius="lg"
                    px={8}
                >
                    Create Admin
                </Button>
            </Box>
        </Box>
    );
};

export default AdminDashboard;
