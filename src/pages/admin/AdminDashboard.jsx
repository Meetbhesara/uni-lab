import React, { useState, useEffect, useRef } from 'react';
import {
    Box, Heading, SimpleGrid, Stat, StatLabel, StatNumber, StatHelpText,
    Icon, Spinner, Text, FormControl, FormLabel, Input, Button, Flex,
    useToast, Table, Thead, Tbody, Tr, Th, Td, Badge, Avatar, Stack,
    InputGroup, InputLeftElement, Tooltip, Tag, TagLabel, Tabs, TabList,
    TabPanels, Tab, TabPanel, AlertDialog, AlertDialogBody, AlertDialogFooter,
    AlertDialogHeader, AlertDialogContent, AlertDialogOverlay, IconButton
} from '@chakra-ui/react';
import { FiBox, FiMessageSquare, FiClock, FiUserPlus, FiUsers, FiSearch, FiPhone, FiMail, FiBriefcase, FiCalendar, FiTrash2, FiShield, FiUser } from 'react-icons/fi';
import { motion } from 'framer-motion';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { DEMO_PRODUCTS, DEMO_ENQUIRIES } from '../../data/mockData';
import { hasPermission } from '../../utils/permissions';


const MotionBox = motion(Box);

const AdminDashboard = () => {
    const { user, createAdmin } = useAuth();
    const toast = useToast();

    const canReadDashboard = hasPermission(user, 'dashboard', 'read');
    const canReadAdmins = hasPermission(user, 'dashboard_admins', 'read');
    const canWriteAdmins = hasPermission(user, 'dashboard_admins', 'write');
    const canReadUsers = hasPermission(user, 'dashboard_users', 'read');
    const canWriteUsers = hasPermission(user, 'dashboard_users', 'write');

    const [stats, setStats] = useState({
        products: 0,
        totalEnquiries: 0,
        pendingEnquiries: 0,
        doneQuotations: 0,
        rejectedQuotations: 0,
        totalUsers: 0
    });
    const [loading, setLoading] = useState(true);

    // Users state
    const [users, setUsers] = useState([]);
    const [usersLoading, setUsersLoading] = useState(true);
    const [userSearch, setUserSearch] = useState('');

    // Admins state
    const [admins, setAdmins] = useState([]);
    const [adminsLoading, setAdminsLoading] = useState(true);
    const [adminSearch, setAdminSearch] = useState('');

    // Delete modal state
    const [deleteAccountModal, setDeleteAccountModal] = useState({ isOpen: false, user: null, type: '' });
    const [isDeleting, setIsDeleting] = useState(false);
    const cancelRef = useRef();

    const defaultPermissions = {
        dashboard: { read: true, write: true },
        dashboard_admins: { read: true, write: true },
        dashboard_users: { read: true, write: true },
        products: { read: true, write: true },
        enquiries: { read: true, write: true },
        incomingEnquiries: { read: true, write: true },
        outboundQuotations: { read: true, write: true },
        processedHistory: { read: true, write: true },
        vehicleMaster: { read: true, write: true },
        vehicleMaster_form: { read: true, write: true },
        vehicleMaster_view: { read: true, write: true },
        employeeMaster: { read: true, write: true },
        employeeMaster_form: { read: true, write: true },
        employeeMaster_view: { read: true, write: true },
        clientMaster: { read: true, write: true },
        clientMaster_form: { read: true, write: true },
        clientMaster_view: { read: true, write: true },
        siteMaster: { read: true, write: true },
        siteMaster_form: { read: true, write: true },
        siteMaster_view: { read: true, write: true },
        scheduleMaster: { read: true, write: true },
        scheduleMaster_form: { read: true, write: true },
        scheduleMaster_view: { read: true, write: true },
        scheduleMaster_report: { read: true, write: true },
        instrumentMaster: { read: true, write: true },
        instrumentMaster_form: { read: true, write: true },
        instrumentMaster_view: { read: true, write: true },
        employeeExpense: { read: true, write: true },
        draftingWork: { read: true, write: true },
        invoiceReport: { read: true, write: true }
    };
    const [adminForm, setAdminForm] = useState({ name: '', email: '', phone: '', permissions: defaultPermissions });
    const [adminLoading, setAdminLoading] = useState(false);

    const fetchData = async () => {
        let pCount = 0;
        try {
            const prodRes = await api.get('/products');
            const pData = prodRes.data.products || prodRes.data.data || prodRes.data;
            pCount = Array.isArray(pData) ? pData.length : 0;
        } catch {
            pCount = DEMO_PRODUCTS.length;
        }

        try {
            const [quoteRes, enqRes] = await Promise.all([
                api.get('/quotations'),
                api.get('/enquiries')
            ]);
            const qData = quoteRes.data.quotations || quoteRes.data.data || quoteRes.data || [];
            const eData = enqRes.data.enquiries || enqRes.data.data || enqRes.data || [];
            setStats(prev => ({
                ...prev,
                products: pCount,
                totalEnquiries: Array.isArray(eData) ? eData.length : 0,
                pendingEnquiries: Array.isArray(eData) ? eData.filter(e => !e.isSeen).length : 0,
                doneQuotations: Array.isArray(qData) ? qData.filter(q => q.status === 'Done').length : 0,
                rejectedQuotations: Array.isArray(qData) ? qData.filter(q => q.status === 'Reject').length : 0,
            }));
        } catch {
            setStats(prev => ({ ...prev, products: pCount, totalEnquiries: DEMO_ENQUIRIES.length, pendingEnquiries: 0, doneQuotations: 0, rejectedQuotations: 0 }));
        } finally {
            setLoading(false);
        }
    };

    const fetchUsersAndAdmins = async () => {
        try {
            setUsersLoading(true);
            setAdminsLoading(true);
            const [uRes, aRes] = await Promise.all([
                api.get('/auth/users'),
                api.get('/auth/admins')
            ]);
            const uData = uRes.data.users || uRes.data || [];
            setUsers(Array.isArray(uData) ? uData : []);
            setStats(prev => ({ ...prev, totalUsers: uRes.data.total || uData.length }));

            const aData = aRes.data.admins || aRes.data || [];
            // Note: not take if isSuperAdmin=true then not show
            const cleanAdmins = (Array.isArray(aData) ? aData : []).filter(a => !a.isSuperAdmin);
            setAdmins(cleanAdmins);
        } catch (err) {
            console.error('Failed to fetch users/admins:', err);
        } finally {
            setUsersLoading(false);
            setAdminsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        fetchUsersAndAdmins();
    }, []);

    useEffect(() => {
        const handleRealtimeUpdate = () => {
            fetchData();
            fetchUsersAndAdmins();
        };
        window.addEventListener('app-realtime-update', handleRealtimeUpdate);
        return () => window.removeEventListener('app-realtime-update', handleRealtimeUpdate);
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
        const res = await createAdmin(adminForm.name, adminForm.email, adminForm.phone, adminForm.permissions);
        setAdminLoading(false);
        if (res.success) {
            toast({ title: '✅ Admin Created!', description: res.msg, status: 'success' });
            setAdminForm({ name: '', email: '', phone: '', permissions: defaultPermissions });
            fetchUsersAndAdmins();
        } else {
            toast({ title: 'Failed', description: res.message, status: 'error' });
        }
    };

    const confirmDeleteAccount = (account, type) => {
        setDeleteAccountModal({ isOpen: true, user: account, type });
    };

    const handleDeleteAccount = async () => {
        if (!deleteAccountModal.user) return;
        setIsDeleting(true);
        try {
            const res = await api.delete(`/auth/${deleteAccountModal.type}/${deleteAccountModal.user._id}`);
            if (res.data?.success || res.status === 200) {
                toast({
                    title: '✅ Account Removed',
                    description: `${deleteAccountModal.user.name || deleteAccountModal.user.contactPersonName || 'Account'} has been permanently deleted.`,
                    status: 'success'
                });
                fetchUsersAndAdmins();
                setDeleteAccountModal({ isOpen: false, user: null, type: '' });
            } else {
                toast({ title: 'Failed to delete account', description: res.data?.message || 'Error occurred', status: 'error' });
            }
        } catch (err) {
            toast({ title: 'Failed to delete account', description: err.response?.data?.message || err.message, status: 'error' });
        } finally {
            setIsDeleting(false);
        }
    };

    // Filter users by search
    const filteredUsers = users.filter(u => {
        if (!userSearch) return true;
        const q = userSearch.toLowerCase();
        return (
            (u.name || '').toLowerCase().includes(q) ||
            (u.email || '').toLowerCase().includes(q) ||
            (u.phone || '').includes(q) ||
            (u.companyName || '').toLowerCase().includes(q) ||
            (u.contactPersonName || '').toLowerCase().includes(q)
        );
    });

    // Filter admins by search
    const filteredAdmins = admins.filter(a => {
        if (!adminSearch) return true;
        const q = adminSearch.toLowerCase();
        return (
            (a.name || '').toLowerCase().includes(q) ||
            (a.email || '').toLowerCase().includes(q) ||
            (a.phone || '').includes(q)
        );
    });

    const formatDate = (dateStr) => {
        if (!dateStr) return '—';
        return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const getInitials = (u) => {
        const name = u.contactPersonName || u.name || u.companyName || '?';
        return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    };

    const AVATAR_COLORS = ['blue', 'teal', 'purple', 'orange', 'pink', 'cyan', 'green', 'red'];
    const getColor = (idx) => AVATAR_COLORS[idx % AVATAR_COLORS.length];

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
            <SimpleGrid columns={{ base: 2, md: 3, lg: 6 }} spacing={5} mb={10}>
                {[
                    { label: 'Products', value: stats.products, icon: FiBox, color: 'brand.500', help: 'Active catalog', bg: 'brand.50' },
                    { label: 'Total Enquiries', value: stats.totalEnquiries, icon: FiMessageSquare, color: 'blue.500', help: 'All time', bg: 'blue.50' },
                    { label: 'New Enquiries', value: stats.pendingEnquiries, icon: FiMessageSquare, color: 'orange.500', help: 'Action needed', bg: 'orange.50' },
                    { label: 'Success (Done)', value: stats.doneQuotations, icon: FiClock, color: 'green.500', help: 'Closed deals', bg: 'green.50' },
                    { label: 'Rejected', value: stats.rejectedQuotations, icon: FiClock, color: 'red.500', help: 'Lost deals', bg: 'red.50' },
                    { label: 'Registered Users', value: stats.totalUsers, icon: FiUsers, color: 'purple.500', help: 'Website clients', bg: 'purple.50' },
                ].map((s, i) => (
                    <MotionBox
                        key={s.label}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: i * 0.07 }}
                        bg="white"
                        p={5}
                        borderRadius="xl"
                        boxShadow="sm"
                        border="1px solid"
                        borderColor="gray.100"
                        _hover={{ boxShadow: 'md', transform: 'translateY(-2px)' }}
                        style={{ transition: 'all 0.2s' }}
                    >
                        <Flex align="center" mb={3} gap={2}>
                            <Box p={2} bg={s.bg} borderRadius="lg">
                                <Icon as={s.icon} w={4} h={4} color={s.color} />
                            </Box>
                        </Flex>
                        <Text fontSize="2xl" fontWeight="900" color="gray.800" lineHeight="1">{s.value}</Text>
                        <Text fontSize="xs" fontWeight="700" color="gray.600" mt={1}>{s.label}</Text>
                        <Text fontSize="10px" color="gray.400" mt={0.5}>{s.help}</Text>
                    </MotionBox>
                ))}
            </SimpleGrid>

            {/* Create Admin Card - Restricted to Super Admin */}
            {user?.isSuperAdmin && (
                <Box bg="white" p={{ base: 4, md: 6 }} borderRadius="2xl" boxShadow="sm" border="1px" borderColor="purple.100" mb={8}>
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
            )}

            {/* ── Admins & Registered Users Management (Separate Tabs) ────── */}
            <MotionBox
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                bg="white"
                borderRadius="2xl"
                boxShadow="sm"
                border="1px solid"
                borderColor="gray.100"
                overflow="hidden"
                mb={8}
            >
                <Tabs variant="enclosed" colorScheme="purple" isLazy>
                    <Flex
                        px={6} pt={5} pb={2}
                        bg="linear-gradient(135deg, #6B46C1 0%, #553C9A 100%)"
                        align="center"
                        justify="space-between"
                        wrap="wrap"
                        gap={4}
                    >
                        <Box>
                            <Heading fontSize="lg" fontWeight="800" color="white" mb={1}>
                                User & Admin Accounts
                            </Heading>
                            <Text fontSize="xs" color="whiteAlpha.800">
                                Separate view for internal administrators and registered website clients.
                            </Text>
                        </Box>

                        <TabList borderBottom="none" gap={2}>
                            <Tab
                                bg="whiteAlpha.200"
                                color="white"
                                _selected={{ bg: 'white', color: 'purple.700', fontWeight: '800', boxShadow: 'md' }}
                                borderRadius="xl"
                                py={2.5}
                                px={5}
                                fontSize="sm"
                                transition="all 0.2s"
                                border="none"
                            >
                                <Flex align="center" gap={2}>
                                    <Icon as={FiShield} w={4} h={4} />
                                    <Text>Admins</Text>
                                    <Badge bg={admins.length ? 'purple.500' : 'gray.400'} color="white" borderRadius="full" px={2}>
                                        {admins.length}
                                    </Badge>
                                </Flex>
                            </Tab>
                            <Tab
                                bg="whiteAlpha.200"
                                color="white"
                                _selected={{ bg: 'white', color: 'purple.700', fontWeight: '800', boxShadow: 'md' }}
                                borderRadius="xl"
                                py={2.5}
                                px={5}
                                fontSize="sm"
                                transition="all 0.2s"
                                border="none"
                            >
                                <Flex align="center" gap={2}>
                                    <Icon as={FiUsers} w={4} h={4} />
                                    <Text>Registered Users</Text>
                                    <Badge bg={filteredUsers.length ? 'blue.500' : 'gray.400'} color="white" borderRadius="full" px={2}>
                                        {users.length}
                                    </Badge>
                                </Flex>
                            </Tab>
                        </TabList>
                    </Flex>

                    <TabPanels p={0}>
                        {/* ── TAB 1: ADMINS PANEL (Excludes Super Admin) ── */}
                        <TabPanel p={0}>
                            <Box px={6} pt={4}>
                            </Box>
                            {!canReadAdmins ? (
                                <Flex direction="column" align="center" justify="center" py={16} color="gray.400">
                                    <Icon as={FiShield} w={12} h={12} mb={3} />
                                    <Text fontWeight="600">Access Restricted</Text>
                                    <Text fontSize="sm" mt={1}>You do not have read permissions for Admin Accounts.</Text>
                                </Flex>
                            ) : (
                                <>
                            <Flex px={6} py={3} bg="purple.50" align="center" justify="space-between" wrap="wrap" gap={3} borderBottom="1px solid" borderColor="purple.100">
                                <Text fontSize="xs" fontWeight="700" color="purple.800">
                                    {filteredAdmins.length} {filteredAdmins.length === 1 ? 'Admin User' : 'Admin Users'} (Excluding Super Admin)
                                </Text>
                                <InputGroup size="sm" maxW="240px" bg="white" borderRadius="lg" boxShadow="xs">
                                    <InputLeftElement pointerEvents="none">
                                        <Icon as={FiSearch} color="gray.400" />
                                    </InputLeftElement>
                                    <Input
                                        placeholder="Search admins..."
                                        value={adminSearch}
                                        onChange={e => setAdminSearch(e.target.value)}
                                        borderRadius="lg"
                                        borderColor="purple.200"
                                        _focus={{ borderColor: 'purple.500', boxShadow: 'none' }}
                                    />
                                </InputGroup>
                            </Flex>

                            {adminsLoading ? (
                                <Flex justify="center" align="center" py={16}>
                                    <Spinner size="lg" color="purple.500" thickness="3px" />
                                </Flex>
                            ) : filteredAdmins.length === 0 ? (
                                <Flex direction="column" align="center" justify="center" py={16} color="gray.400">
                                    <Icon as={FiShield} w={12} h={12} mb={3} />
                                    <Text fontWeight="600">No admin users found</Text>
                                    <Text fontSize="sm" mt={1}>
                                        {adminSearch ? `No results for "${adminSearch}"` : 'No sub-admin accounts created yet.'}
                                    </Text>
                                </Flex>
                            ) : (
                                <Box overflowX="auto">
                                    <Table variant="simple" size="sm">
                                        <Thead bg="gray.50">
                                            <Tr>
                                                <Th py={3} fontSize="10px" color="gray.500">#</Th>
                                                <Th py={3} fontSize="10px" color="gray.500">ADMIN USER</Th>
                                                <Th py={3} fontSize="10px" color="gray.500">CONTACT</Th>
                                                <Th py={3} fontSize="10px" color="gray.500">ROLE</Th>
                                                <Th py={3} fontSize="10px" color="gray.500">JOINED</Th>
                                                {user?.isSuperAdmin && <Th py={3} fontSize="10px" color="gray.500" textAlign="center">ACTIONS</Th>}
                                            </Tr>
                                        </Thead>
                                        <Tbody>
                                            {filteredAdmins.map((a, idx) => (
                                                <Tr
                                                    key={a._id || idx}
                                                    _hover={{ bg: 'purple.50' }}
                                                    transition="background 0.15s"
                                                    borderBottom="1px solid"
                                                    borderColor="gray.100"
                                                >
                                                    <Td py={3}>
                                                        <Text fontSize="xs" color="gray.400" fontWeight="600">{idx + 1}</Text>
                                                    </Td>
                                                    <Td py={3}>
                                                        <Flex align="center" gap={3}>
                                                            <Avatar
                                                                size="sm"
                                                                name={getInitials(a)}
                                                                bg={`${getColor(idx)}.500`}
                                                                color="white"
                                                                fontWeight="700"
                                                                fontSize="xs"
                                                            />
                                                            <Stack spacing={0}>
                                                                <Text fontWeight="700" fontSize="sm" color="gray.800">
                                                                    {a.name || '—'}
                                                                </Text>
                                                                <Text fontSize="xs" color="gray.400">{a.email}</Text>
                                                            </Stack>
                                                        </Flex>
                                                    </Td>
                                                    <Td py={3}>
                                                        <Stack spacing={1}>
                                                            <Flex align="center" gap={1}>
                                                                <Icon as={FiPhone} w={3} h={3} color="green.400" />
                                                                <Text fontSize="xs" fontWeight="600" color="gray.700">{a.phone || '—'}</Text>
                                                            </Flex>
                                                            <Flex align="center" gap={1}>
                                                                <Icon as={FiMail} w={3} h={3} color="blue.400" />
                                                                <Text fontSize="xs" color="gray.500" noOfLines={1}>{a.email || '—'}</Text>
                                                            </Flex>
                                                        </Stack>
                                                    </Td>
                                                    <Td py={3}>
                                                        <Badge colorScheme="purple" borderRadius="full" px={2.5} py={0.5} fontSize="10px" fontWeight="800">
                                                            SUB-ADMIN
                                                        </Badge>
                                                    </Td>
                                                    <Td py={3}>
                                                        <Flex align="center" gap={1}>
                                                            <Icon as={FiCalendar} w={3} h={3} color="gray.400" />
                                                            <Text fontSize="xs" color="gray.500">{formatDate(a.createdAt)}</Text>
                                                        </Flex>
                                                    </Td>
                                                    {user?.isSuperAdmin && (
                                                        <Td py={3} textAlign="center">
                                                            <Tooltip label="Remove Admin Account" placement="top">
                                                                <IconButton
                                                                    icon={<Icon as={FiTrash2} />}
                                                                    size="sm"
                                                                    colorScheme="red"
                                                                    variant="ghost"
                                                                    borderRadius="lg"
                                                                    _hover={{ bg: 'red.50', color: 'red.600' }}
                                                                    onClick={() => confirmDeleteAccount(a, 'admins')}
                                                                    aria-label="Delete Admin"
                                                                />
                                                            </Tooltip>
                                                        </Td>
                                                    )}
                                                </Tr>
                                            ))}
                                        </Tbody>
                                    </Table>
                                </Box>
                            )}
                            </>
                            )}
                        </TabPanel>

                        {/* ── TAB 2: REGISTERED USERS PANEL ── */}
                        <TabPanel p={0}>
                            <Box px={6} pt={4}>
                            </Box>
                            {!canReadUsers ? (
                                <Flex direction="column" align="center" justify="center" py={16} color="gray.400">
                                    <Icon as={FiUsers} w={12} h={12} mb={3} />
                                    <Text fontWeight="600">Access Restricted</Text>
                                    <Text fontSize="sm" mt={1}>You do not have read permissions for Registered Users.</Text>
                                </Flex>
                            ) : (
                                <>
                            <Flex px={6} py={3} bg="gray.50" align="center" justify="space-between" wrap="wrap" gap={3} borderBottom="1px solid" borderColor="gray.200">
                                <Text fontSize="xs" fontWeight="700" color="gray.700">
                                    {filteredUsers.length} {filteredUsers.length === 1 ? 'Registered Client' : 'Registered Clients'}
                                </Text>
                                <InputGroup size="sm" maxW="240px" bg="white" borderRadius="lg" boxShadow="xs">
                                    <InputLeftElement pointerEvents="none">
                                        <Icon as={FiSearch} color="gray.400" />
                                    </InputLeftElement>
                                    <Input
                                        placeholder="Search users..."
                                        value={userSearch}
                                        onChange={e => setUserSearch(e.target.value)}
                                        borderRadius="lg"
                                        borderColor="gray.200"
                                        _focus={{ borderColor: 'blue.500', boxShadow: 'none' }}
                                    />
                                </InputGroup>
                            </Flex>

                            {usersLoading ? (
                                <Flex justify="center" align="center" py={16}>
                                    <Spinner size="lg" color="purple.500" thickness="3px" />
                                </Flex>
                            ) : filteredUsers.length === 0 ? (
                                <Flex direction="column" align="center" justify="center" py={16} color="gray.400">
                                    <Icon as={FiUsers} w={12} h={12} mb={3} />
                                    <Text fontWeight="600">No registered users found</Text>
                                    <Text fontSize="sm" mt={1}>
                                        {userSearch ? `No results for "${userSearch}"` : 'Users who register on the website will appear here'}
                                    </Text>
                                </Flex>
                            ) : (
                                <Box overflowX="auto">
                                    <Table variant="simple" size="sm">
                                        <Thead bg="gray.50">
                                            <Tr>
                                                <Th py={3} fontSize="10px" color="gray.500">#</Th>
                                                <Th py={3} fontSize="10px" color="gray.500">USER</Th>
                                                <Th py={3} fontSize="10px" color="gray.500">CONTACT</Th>
                                                <Th py={3} fontSize="10px" color="gray.500">COMPANY</Th>
                                                <Th py={3} fontSize="10px" color="gray.500">GST</Th>
                                                <Th py={3} fontSize="10px" color="gray.500">JOINED</Th>
                                                {user?.isSuperAdmin && <Th py={3} fontSize="10px" color="gray.500" textAlign="center">ACTIONS</Th>}
                                            </Tr>
                                        </Thead>
                                        <Tbody>
                                            {filteredUsers.map((u, idx) => (
                                                <Tr
                                                    key={u._id || idx}
                                                    _hover={{ bg: 'blue.50' }}
                                                    transition="background 0.15s"
                                                    borderBottom="1px solid"
                                                    borderColor="gray.100"
                                                >
                                                    <Td py={3}>
                                                        <Text fontSize="xs" color="gray.400" fontWeight="600">{idx + 1}</Text>
                                                    </Td>
                                                    <Td py={3}>
                                                        <Flex align="center" gap={3}>
                                                            <Avatar
                                                                size="sm"
                                                                name={getInitials(u)}
                                                                bg={`${getColor(idx)}.400`}
                                                                color="white"
                                                                fontWeight="700"
                                                                fontSize="xs"
                                                            />
                                                            <Stack spacing={0}>
                                                                <Text fontWeight="700" fontSize="sm" color="gray.800">
                                                                    {u.contactPersonName || u.name || '—'}
                                                                </Text>
                                                                <Text fontSize="xs" color="gray.400">{u.email}</Text>
                                                            </Stack>
                                                        </Flex>
                                                    </Td>
                                                    <Td py={3}>
                                                        <Stack spacing={1}>
                                                            <Flex align="center" gap={1}>
                                                                <Icon as={FiPhone} w={3} h={3} color="green.400" />
                                                                <Text fontSize="xs" fontWeight="600" color="gray.700">{u.phone || '—'}</Text>
                                                            </Flex>
                                                            <Flex align="center" gap={1}>
                                                                <Icon as={FiMail} w={3} h={3} color="blue.400" />
                                                                <Text fontSize="xs" color="gray.500" noOfLines={1} maxW="160px">{u.email || '—'}</Text>
                                                            </Flex>
                                                        </Stack>
                                                    </Td>
                                                    <Td py={3}>
                                                        <Flex align="center" gap={1}>
                                                            <Icon as={FiBriefcase} w={3} h={3} color="orange.400" />
                                                            <Text fontSize="xs" fontWeight="600" color="gray.700" noOfLines={1} maxW="140px">
                                                                {u.companyName || '—'}
                                                            </Text>
                                                        </Flex>
                                                    </Td>
                                                    <Td py={3}>
                                                        {u.gstNumber ? (
                                                            <Tag size="sm" colorScheme="green" borderRadius="full">
                                                                <TagLabel fontSize="10px" fontWeight="700">{u.gstNumber}</TagLabel>
                                                            </Tag>
                                                        ) : (
                                                            <Text fontSize="xs" color="gray.400">—</Text>
                                                        )}
                                                    </Td>
                                                    <Td py={3}>
                                                        <Flex align="center" gap={1}>
                                                            <Icon as={FiCalendar} w={3} h={3} color="gray.400" />
                                                            <Text fontSize="xs" color="gray.500">{formatDate(u.createdAt)}</Text>
                                                        </Flex>
                                                    </Td>
                                                    {user?.isSuperAdmin && (
                                                        <Td py={3} textAlign="center">
                                                            <Tooltip label="Remove Client Account" placement="top">
                                                                <IconButton
                                                                    icon={<Icon as={FiTrash2} />}
                                                                    size="sm"
                                                                    colorScheme="red"
                                                                    variant="ghost"
                                                                    borderRadius="lg"
                                                                    _hover={{ bg: 'red.50', color: 'red.600' }}
                                                                    onClick={() => confirmDeleteAccount(u, 'users')}
                                                                    aria-label="Delete User"
                                                                />
                                                            </Tooltip>
                                                        </Td>
                                                    )}
                                                </Tr>
                                            ))}
                                        </Tbody>
                                    </Table>
                                </Box>
                            )}
                            </>
                            )}
                        </TabPanel>
                    </TabPanels>
                </Tabs>
            </MotionBox>

            {/* Delete Account Pop-up Confirmation (AlertDialog) */}
            <AlertDialog
                isOpen={deleteAccountModal.isOpen}
                leastDestructiveRef={cancelRef}
                onClose={() => setDeleteAccountModal({ isOpen: false, user: null, type: '' })}
                isCentered
            >
                <AlertDialogOverlay backdropFilter="blur(4px)" bg="blackAlpha.600">
                    <AlertDialogContent borderRadius="2xl" p={2} boxShadow="2xl">
                        <AlertDialogHeader fontSize="lg" fontWeight="800" color="red.600" display="flex" alignItems="center" gap={2}>
                            <Icon as={FiTrash2} w={6} h={6} />
                            Remove {deleteAccountModal.type === 'admins' ? 'Admin' : 'User'} Account?
                        </AlertDialogHeader>

                        <AlertDialogBody fontSize="sm" color="gray.600" py={4}>
                            Are you sure you want to permanently remove the account for{' '}
                            <Text as="span" fontWeight="800" color="gray.800">
                                {deleteAccountModal.user?.name || deleteAccountModal.user?.contactPersonName || deleteAccountModal.user?.companyName || deleteAccountModal.user?.email}
                            </Text>?
                            <Text mt={3} p={3} bg="red.50" borderRadius="xl" color="red.700" fontSize="xs" fontWeight="700" border="1px solid" borderColor="red.100">
                                ⚠️ This action cannot be undone. All access privileges associated with this account will be immediately revoked.
                            </Text>
                        </AlertDialogBody>

                        <AlertDialogFooter gap={3} pt={2}>
                            <Button ref={cancelRef} onClick={() => setDeleteAccountModal({ isOpen: false, user: null, type: '' })} borderRadius="xl" size="sm" px={5} fontWeight="600" variant="outline">
                                Cancel
                            </Button>
                            <Button
                                colorScheme="red"
                                onClick={handleDeleteAccount}
                                isLoading={isDeleting}
                                loadingText="Removing..."
                                borderRadius="xl"
                                size="sm"
                                px={6}
                                fontWeight="700"
                                boxShadow="sm"
                            >
                                Yes, Remove Account
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
        </Box>
    );
};

export default AdminDashboard;
