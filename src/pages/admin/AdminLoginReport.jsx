import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
    Box, Container, Heading, Text, SimpleGrid, Icon, Spinner, FormControl, FormLabel,
    Input, Button, Flex, useToast, Table, Thead, Tbody, Tr, Th, Td, Badge, Avatar,
    Stack, HStack, VStack, InputGroup, InputLeftElement, Tooltip, Tabs, TabList,
    TabPanels, Tab, TabPanel, AlertDialog, AlertDialogBody, AlertDialogFooter,
    AlertDialogHeader, AlertDialogContent, AlertDialogOverlay, IconButton, Switch,
    Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter,
    ModalCloseButton, Center, Card, CardBody, Tag, TagLabel
} from '@chakra-ui/react';
import {
    FiClock, FiUserPlus, FiUsers, FiSearch, FiPhone, FiMail, FiBriefcase,
    FiCalendar, FiTrash2, FiShield, FiUser, FiActivity, FiEdit2, FiRefreshCw,
    FiLock, FiCheckCircle, FiXCircle, FiSliders
} from 'react-icons/fi';
import { RiVipCrownFill } from 'react-icons/ri';
import { MdAdminPanelSettings } from 'react-icons/md';
import { useSearchParams } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { hasPermission } from '../../utils/permissions';
import ModulePermissionBar from '../../components/admin/ModulePermissionBar';
import AdminPersonalLoginReport from '../../components/admin/AdminPersonalLoginReport';
import AdminLoginReportView from '../../components/admin/AdminLoginReportView';

const AdminLoginReport = () => {
    const { user, createAdmin } = useAuth();
    const toast = useToast();

    // Permissions
    const canReadAttendance = hasPermission(user, 'loginReport_attendance', 'read') ||
        (user?.permissions?.loginReport_attendance === undefined && (user?.isSuperAdmin || hasPermission(user, 'loginReport', 'read')));
    
    const canReadCreateAdmin = hasPermission(user, 'loginReport_createAdmin', 'read') ||
        (user?.permissions?.loginReport_createAdmin === undefined && (user?.isSuperAdmin || hasPermission(user, 'loginReport', 'read')));
    
    const canWriteCreateAdmin = hasPermission(user, 'loginReport_createAdmin', 'write') ||
        (user?.permissions?.loginReport_createAdmin === undefined && (user?.isSuperAdmin || hasPermission(user, 'loginReport', 'write')));

    // Admin Accounts Permissions
    const canReadAdmins = hasPermission(user, 'loginReport_admins', 'read') ||
        (user?.permissions?.loginReport_admins === undefined && (
            hasPermission(user, 'loginReport_accounts', 'read') ||
            hasPermission(user, 'dashboard_admins', 'read') ||
            user?.isSuperAdmin ||
            hasPermission(user, 'loginReport', 'read')
        ));

    const canWriteAdmins = hasPermission(user, 'loginReport_admins', 'write') ||
        (user?.permissions?.loginReport_admins === undefined && (
            hasPermission(user, 'loginReport_accounts', 'write') ||
            hasPermission(user, 'dashboard_admins', 'write') ||
            user?.isSuperAdmin ||
            hasPermission(user, 'loginReport', 'write')
        ));

    // Registered Users Permissions
    const canReadUsers = hasPermission(user, 'loginReport_users', 'read') ||
        (user?.permissions?.loginReport_users === undefined && (
            hasPermission(user, 'loginReport_accounts', 'read') ||
            hasPermission(user, 'dashboard_users', 'read') ||
            user?.isSuperAdmin ||
            hasPermission(user, 'loginReport', 'read')
        ));

    const canWriteUsers = hasPermission(user, 'loginReport_users', 'write') ||
        (user?.permissions?.loginReport_users === undefined && (
            hasPermission(user, 'loginReport_accounts', 'write') ||
            hasPermission(user, 'dashboard_users', 'write') ||
            user?.isSuperAdmin ||
            hasPermission(user, 'loginReport', 'write')
        ));

    const canReadAccounts = canReadAdmins || canReadUsers;
    const canWriteAccounts = canWriteAdmins || canWriteUsers;

    // State for Accounts Management
    const [admins, setAdmins] = useState([]);
    const [adminsLoading, setAdminsLoading] = useState(true);
    const [adminSearch, setAdminSearch] = useState('');

    const [users, setUsers] = useState([]);
    const [usersLoading, setUsersLoading] = useState(true);
    const [userSearch, setUserSearch] = useState('');

    const [searchParams, setSearchParams] = useSearchParams();
    const [activeTab, setActiveTab] = useState(0);
    const [attendanceViewMode, setAttendanceViewMode] = useState('personal'); // 'personal' | 'matrix'

    // Create Admin Form state
    const defaultPermissions = {
        dashboard: { read: true, write: true },
        loginReport: { read: true, write: true },
        loginReport_attendance: { read: true, write: true },
        loginReport_createAdmin: { read: true, write: true },
        loginReport_admins: { read: true, write: true },
        loginReport_users: { read: true, write: true },
        products: { read: true, write: true },
        enquiries: { read: true, write: true },
        vehicleMaster: { read: true, write: true },
        employeeMaster: { read: true, write: true },
        companyMaster: { read: true, write: true },
        clientMaster: { read: true, write: true },
        siteMaster: { read: true, write: true },
        scheduleMaster: { read: true, write: true },
        instrumentMaster: { read: true, write: true },
        employeeExpense: { read: true, write: true },
        otherServices: { read: true, write: true }
    };

    const [adminForm, setAdminForm] = useState({
        name: '',
        email: '',
        phone: '',
        isSuperAdmin: false,
        permissions: defaultPermissions
    });
    const [adminCreating, setAdminCreating] = useState(false);

    // Edit Admin Modal state
    const [editAdminModal, setEditAdminModal] = useState({ isOpen: false, admin: null });
    const [editForm, setEditForm] = useState({ _id: '', name: '', email: '', phone: '', isSuperAdmin: false });
    const [editLoading, setEditLoading] = useState(false);

    // Edit User Modal state
    const [editUserModal, setEditUserModal] = useState({ isOpen: false, user: null });
    const [editUserForm, setEditUserForm] = useState({
        _id: '',
        name: '',
        contactPersonName: '',
        companyName: '',
        email: '',
        phone: '',
        gstNumber: '',
        address: ''
    });
    const [editUserLoading, setEditUserLoading] = useState(false);

    // Delete Account Confirmation state
    const [deleteAccountModal, setDeleteAccountModal] = useState({ isOpen: false, user: null, type: '' });
    const [isDeleting, setIsDeleting] = useState(false);
    const cancelRef = useRef();

    // Fetch Accounts Data
    const fetchAccountsData = useCallback(async () => {
        setAdminsLoading(true);
        setUsersLoading(true);
        try {
            const [adminsRes, usersRes] = await Promise.allSettled([
                api.get('/auth/admins'),
                api.get('/auth/users')
            ]);

            if (adminsRes.status === 'fulfilled') {
                const aData = adminsRes.value.data.admins || adminsRes.value.data || [];
                setAdmins(Array.isArray(aData) ? aData : []);
            }
            if (usersRes.status === 'fulfilled') {
                const uData = usersRes.value.data.users || usersRes.value.data || [];
                setUsers(Array.isArray(uData) ? uData : []);
            }
        } catch (err) {
            console.error('Error fetching accounts in LoginReport:', err);
        } finally {
            setAdminsLoading(false);
            setUsersLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAccountsData();
    }, [fetchAccountsData]);

    // Handle Create Admin
    const handleCreateAdmin = async () => {
        if (!adminForm.name || !adminForm.email || !adminForm.phone) {
            return toast({ title: 'Please fill all required fields', status: 'error', duration: 2500 });
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adminForm.email)) {
            return toast({ title: 'Enter a valid email address', status: 'error', duration: 2500 });
        }
        const clean10 = adminForm.phone.replace(/\D/g, '').slice(-10);
        if (clean10.length !== 10) {
            return toast({ title: 'Enter a valid 10-digit mobile number', status: 'error', duration: 2500 });
        }

        setAdminCreating(true);
        try {
            const res = await createAdmin(adminForm.name, adminForm.email, clean10, adminForm.permissions, adminForm.isSuperAdmin);
            if (res.success) {
                toast({
                    title: '✅ Admin Account Created!',
                    description: `Credentials generated for ${adminForm.name}.`,
                    status: 'success',
                    duration: 3500
                });
                setAdminForm({ name: '', email: '', phone: '', isSuperAdmin: false, permissions: defaultPermissions });
                fetchAccountsData();
                // Switch to accounts tab
                const accountsIdx = tabConfig.findIndex(t => t.id === 'accounts');
                if (accountsIdx !== -1) setActiveTab(accountsIdx);
            } else {
                toast({ title: 'Failed to create admin', description: res.message || res.msg, status: 'error' });
            }
        } catch (error) {
            toast({ title: 'Error', description: error.message || 'Server error', status: 'error' });
        } finally {
            setAdminCreating(false);
        }
    };

    // Edit Admin Handlers
    const handleOpenEditAdmin = (admin) => {
        setEditForm({
            _id: admin._id,
            name: admin.name || '',
            email: admin.email || '',
            phone: admin.phone || '',
            isSuperAdmin: !!admin.isSuperAdmin
        });
        setEditAdminModal({ isOpen: true, admin });
    };

    const handleUpdateAdmin = async () => {
        if (!editForm.name || !editForm.email || !editForm.phone) {
            return toast({ title: 'Please fill all fields', status: 'error', duration: 2500 });
        }
        const clean10 = editForm.phone.replace(/\D/g, '').slice(-10);
        if (clean10.length !== 10) {
            return toast({ title: 'Enter a valid 10-digit phone number', status: 'error', duration: 2500 });
        }
        setEditLoading(true);
        try {
            const res = await api.put(`/auth/admins/${editForm._id}`, {
                name: editForm.name,
                email: editForm.email,
                phone: clean10,
                isSuperAdmin: editForm.isSuperAdmin
            });
            if (res.data.success) {
                toast({ title: 'Admin Details Updated', status: 'success', duration: 2500 });
                setEditAdminModal({ isOpen: false, admin: null });
                fetchAccountsData();
            }
        } catch (err) {
            toast({ title: 'Update failed', description: err.response?.data?.message || err.message, status: 'error' });
        } finally {
            setEditLoading(false);
        }
    };

    // Edit User Handlers
    const handleOpenEditUser = (u) => {
        setEditUserForm({
            _id: u._id,
            name: u.name || '',
            contactPersonName: u.contactPersonName || '',
            companyName: u.companyName || '',
            email: u.email || '',
            phone: u.phone || '',
            gstNumber: u.gstNumber || '',
            address: u.address || ''
        });
        setEditUserModal({ isOpen: true, user: u });
    };

    const handleUpdateUser = async () => {
        setEditUserLoading(true);
        try {
            const res = await api.put(`/auth/users/${editUserForm._id}`, editUserForm);
            if (res.data.success) {
                toast({ title: 'User Account Updated', status: 'success', duration: 2500 });
                setEditUserModal({ isOpen: false, user: null });
                fetchAccountsData();
            }
        } catch (err) {
            toast({ title: 'Failed to update user', description: err.response?.data?.message || err.message, status: 'error' });
        } finally {
            setEditUserLoading(false);
        }
    };

    // Toggle User Status
    const handleToggleUserStatus = async (targetUser) => {
        try {
            const newStatus = targetUser.status === 'Active' ? 'Inactive' : 'Active';
            const res = await api.put(`/auth/users/${targetUser._id}`, { status: newStatus });
            if (res.data.success) {
                toast({
                    title: `User ${newStatus}`,
                    description: `${targetUser.name || targetUser.companyName} is now ${newStatus.toLowerCase()}.`,
                    status: 'info',
                    duration: 2000
                });
                fetchAccountsData();
            }
        } catch (err) {
            toast({ title: 'Failed to update status', status: 'error', duration: 2000 });
        }
    };

    // Delete Account Handlers
    const handleDeleteAccount = async () => {
        if (!deleteAccountModal.user) return;
        setIsDeleting(true);
        try {
            const endpoint = deleteAccountModal.type === 'admins'
                ? `/auth/admins/${deleteAccountModal.user._id}`
                : `/auth/users/${deleteAccountModal.user._id}`;
            const res = await api.delete(endpoint);
            if (res.data.success) {
                toast({
                    title: 'Account Deleted',
                    description: 'Account and associated credentials removed.',
                    status: 'success',
                    duration: 2500
                });
                setDeleteAccountModal({ isOpen: false, user: null, type: '' });
                fetchAccountsData();
            }
        } catch (err) {
            toast({ title: 'Delete Failed', description: err.response?.data?.message || err.message, status: 'error' });
        } finally {
            setIsDeleting(false);
        }
    };

    const confirmDeleteAccount = (account, type) => {
        setDeleteAccountModal({ isOpen: true, user: account, type });
    };

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

    // Filtered lists
    const filteredAdmins = useMemo(() => {
        if (!adminSearch.trim()) return admins;
        const q = adminSearch.toLowerCase();
        return admins.filter(a =>
            (a.name || '').toLowerCase().includes(q) ||
            (a.email || '').toLowerCase().includes(q) ||
            (a.phone || '').includes(adminSearch)
        );
    }, [admins, adminSearch]);

    const filteredUsers = useMemo(() => {
        if (!userSearch.trim()) return users;
        const q = userSearch.toLowerCase();
        const cleanQ = userSearch.replace(/\D/g, '').slice(-10);
        return users.filter(u => {
            const userCleanPhone = (u.phone || '').replace(/\D/g, '').slice(-10);
            return (
                (u.name || '').toLowerCase().includes(q) ||
                (u.email || '').toLowerCase().includes(q) ||
                (u.phone || '').includes(q) ||
                (cleanQ && userCleanPhone.includes(cleanQ)) ||
                (u.companyName || '').toLowerCase().includes(q) ||
                (u.contactPersonName || '').toLowerCase().includes(q) ||
                (u.address || '').toLowerCase().includes(q) ||
                (u.gstNumber || '').toLowerCase().includes(q)
            );
        });
    }, [users, userSearch]);

    // Dynamic Tabs Configuration based on permissions
    const accountsLabel = (canReadAdmins && canReadUsers)
        ? `👥 User & Admin Accounts (${admins.length + users.length})`
        : canReadAdmins
        ? `👥 Admin Accounts (${admins.length})`
        : `👥 Registered Users (${users.length})`;

    const tabConfig = useMemo(() => [
        {
            id: 'attendance',
            label: '🕒 Login & Attendance Report',
            permission: 'loginReport_attendance',
            allowed: canReadAttendance
        },
        {
            id: 'createAdmin',
            label: '➕ Create Admin User',
            permission: 'loginReport_createAdmin',
            allowed: canReadCreateAdmin
        },
        {
            id: 'accounts',
            label: accountsLabel,
            permission: 'loginReport_accounts',
            allowed: canReadAccounts
        }
    ].filter(t => t.allowed), [canReadAttendance, canReadCreateAdmin, canReadAccounts, accountsLabel]);

    // Keep active tab in sync with URL search params
    useEffect(() => {
        const tabParam = searchParams.get('tab');
        if (tabParam && tabConfig.length > 0) {
            const foundIdx = tabConfig.findIndex(t => t.id === tabParam);
            if (foundIdx !== -1 && foundIdx !== activeTab) {
                setActiveTab(foundIdx);
            }
        }
    }, [searchParams, tabConfig]);

    const handleTabChange = (idx) => {
        setActiveTab(idx);
        if (tabConfig[idx]) {
            setSearchParams({ tab: tabConfig[idx].id }, { replace: true });
        }
    };

    useEffect(() => {
        if (activeTab >= tabConfig.length && tabConfig.length > 0) {
            setActiveTab(0);
        }
    }, [tabConfig.length, activeTab]);

    return (
        <Box py={{ base: 2, md: 4 }} w="full">
            <Container maxW={{ base: "full", xl: "7xl" }} px={{ base: 0, md: 4 }}>
                {/* Super Admin Module Permission Bar */}
                <ModulePermissionBar moduleGroupKey="loginReportGroup" />

                <Card variant="elevated" borderRadius="2xl" boxShadow="xl" bg="white" overflow="hidden" border="1px solid" borderColor="gray.100">
                    {/* Header Banner */}
                    <Box bgGradient="linear(to-r, purple.800, purple.600)" p={{ base: 5, md: 8 }} color="white">
                        <Stack direction={{ base: "column", md: "row" }} justify="space-between" align={{ base: "start", md: "center" }} spacing={4}>
                            <Box>
                                <HStack spacing={2} mb={1}>
                                    <Heading size="lg">Login Report & Account Administration</Heading>
                                    <Badge colorScheme="yellow" fontSize="xs" px={2.5} py={0.5} borderRadius="full">
                                        Staff Portal
                                    </Badge>
                                </HStack>
                                <Text opacity={0.9} fontSize="sm">
                                    Track staff login attendance history, provision new admin accounts, and review registered website users.
                                </Text>
                            </Box>

                            <HStack spacing={3}>
                                {user?.isSuperAdmin && (
                                    <Badge bg="whiteAlpha.300" color="white" px={3} py={1.5} borderRadius="xl" fontSize="xs" fontWeight="bold">
                                        👑 Super Admin Privileges Active
                                    </Badge>
                                )}
                            </HStack>
                        </Stack>
                    </Box>

                    <CardBody p={{ base: 4, md: 8 }}>
                        {tabConfig.length === 0 ? (
                            <Center py={14} bg="white" borderRadius="2xl" border="1px dashed" borderColor="gray.200">
                                <VStack spacing={3}>
                                    <Icon as={FiClock} w={10} h={10} color="orange.400" />
                                    <Text fontSize="md" fontWeight="bold" color="gray.600">No Authorized Sections Available</Text>
                                    <Text fontSize="xs" color="gray.400">Please contact your administrator to grant access to login report features.</Text>
                                </VStack>
                            </Center>
                        ) : (
                            <Tabs index={activeTab} onChange={handleTabChange} colorScheme="purple" variant="soft-rounded">
                                <TabList mb={6} justifyContent="center" bg="gray.50" p={2} borderRadius="2xl" border="1px solid" borderColor="gray.200" flexWrap="wrap" gap={2}>
                                    {tabConfig.map((tab) => (
                                        <Tab
                                            key={tab.id}
                                            fontWeight="bold"
                                            borderRadius="xl"
                                            px={{ base: 4, md: 6 }}
                                            py={2.5}
                                            fontSize={{ base: "xs", md: "sm" }}
                                            _selected={{ color: 'white', bg: 'purple.600', shadow: 'md' }}
                                        >
                                            {tab.label}
                                        </Tab>
                                    ))}
                                </TabList>

                                <TabPanels>
                                    {tabConfig.map((tab) => {
                                        // ══════════════ TAB 1: LOGIN & ATTENDANCE ══════════════
                                        if (tab.id === 'attendance') {
                                            return (
                                                <TabPanel key="attendance" p={0}>
                                                    {user?.isSuperAdmin && (
                                                        <Flex justify="flex-end" mb={4}>
                                                            <HStack bg="gray.100" p={1} borderRadius="xl">
                                                                <Button
                                                                    size="xs"
                                                                    borderRadius="lg"
                                                                    colorScheme={attendanceViewMode === 'personal' ? 'purple' : 'gray'}
                                                                    variant={attendanceViewMode === 'personal' ? 'solid' : 'ghost'}
                                                                    onClick={() => setAttendanceViewMode('personal')}
                                                                >
                                                                    Personal / Filter View
                                                                </Button>
                                                                <Button
                                                                    size="xs"
                                                                    borderRadius="lg"
                                                                    colorScheme={attendanceViewMode === 'matrix' ? 'purple' : 'gray'}
                                                                    variant={attendanceViewMode === 'matrix' ? 'solid' : 'ghost'}
                                                                    onClick={() => setAttendanceViewMode('matrix')}
                                                                >
                                                                    All Admins Attendance Table
                                                                </Button>
                                                            </HStack>
                                                        </Flex>
                                                    )}

                                                    {attendanceViewMode === 'matrix' && user?.isSuperAdmin ? (
                                                        <AdminLoginReportView />
                                                    ) : (
                                                        <AdminPersonalLoginReport user={user} />
                                                    )}
                                                </TabPanel>
                                            );
                                        }

                                        // ══════════════ TAB 2: CREATE ADMIN ══════════════
                                        if (tab.id === 'createAdmin') {
                                            return (
                                                <TabPanel key="createAdmin" p={0}>
                                                    <Box
                                                        p={{ base: 4, md: 6 }}
                                                        bg="purple.50"
                                                        borderRadius="2xl"
                                                        border="1px solid"
                                                        borderColor="purple.200"
                                                        mb={6}
                                                    >
                                                        <Flex align="center" gap={3} mb={4}>
                                                            <Box p={2.5} bg="purple.500" borderRadius="xl" color="white">
                                                                <Icon as={FiUserPlus} w={5} h={5} />
                                                            </Box>
                                                            <Box>
                                                                <Heading fontSize="md" fontWeight="800" color="purple.900">
                                                                    Provision New Administrator
                                                                </Heading>
                                                                <Text fontSize="xs" color="purple.700">
                                                                    Add a new administrator with secure WhatsApp OTP authentication and role privileges.
                                                                </Text>
                                                            </Box>
                                                        </Flex>

                                                        <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={4} alignItems="flex-end">
                                                            <FormControl isRequired isDisabled={!canWriteCreateAdmin}>
                                                                <FormLabel fontSize="xs" fontWeight="700" color="purple.900">Full Name</FormLabel>
                                                                <Input
                                                                    bg="white"
                                                                    placeholder="e.g. Rahul Sharma"
                                                                    value={adminForm.name}
                                                                    onChange={(e) => setAdminForm(p => ({ ...p, name: e.target.value }))}
                                                                    borderRadius="xl"
                                                                    focusBorderColor="purple.500"
                                                                />
                                                            </FormControl>

                                                            <FormControl isRequired isDisabled={!canWriteCreateAdmin}>
                                                                <FormLabel fontSize="xs" fontWeight="700" color="purple.900">Email Address</FormLabel>
                                                                <Input
                                                                    bg="white"
                                                                    type="email"
                                                                    placeholder="admin@uecivil.com"
                                                                    value={adminForm.email}
                                                                    onChange={(e) => setAdminForm(p => ({ ...p, email: e.target.value }))}
                                                                    borderRadius="xl"
                                                                    focusBorderColor="purple.500"
                                                                />
                                                            </FormControl>

                                                            <FormControl isRequired isDisabled={!canWriteCreateAdmin}>
                                                                <FormLabel fontSize="xs" fontWeight="700" color="purple.900">10-Digit Mobile (WhatsApp)</FormLabel>
                                                                <Input
                                                                    bg="white"
                                                                    placeholder="9876543210"
                                                                    value={adminForm.phone}
                                                                    onChange={(e) => setAdminForm(p => ({ ...p, phone: e.target.value.replace(/\D/g, '') }))}
                                                                    maxLength={10}
                                                                    borderRadius="xl"
                                                                    focusBorderColor="purple.500"
                                                                />
                                                            </FormControl>

                                                            <FormControl isDisabled={!canWriteCreateAdmin}>
                                                                <FormLabel fontSize="xs" fontWeight="700" mb={1} display="flex" alignItems="center" gap={1.5} color="purple.900">
                                                                    <Icon as={RiVipCrownFill} color={adminForm.isSuperAdmin ? "orange.500" : "gray.400"} />
                                                                    Super Admin Role
                                                                </FormLabel>
                                                                <Flex
                                                                    align="center"
                                                                    justify="space-between"
                                                                    h="40px"
                                                                    px={3}
                                                                    bg={adminForm.isSuperAdmin ? "purple.100" : "white"}
                                                                    borderRadius="xl"
                                                                    border="1px solid"
                                                                    borderColor={adminForm.isSuperAdmin ? "purple.300" : "gray.300"}
                                                                >
                                                                    <Text fontSize="xs" fontWeight="700" color={adminForm.isSuperAdmin ? "purple.800" : "gray.600"}>
                                                                        {adminForm.isSuperAdmin ? "Super Admin (ON)" : "Sub-Admin (OFF)"}
                                                                    </Text>
                                                                    <Switch
                                                                        colorScheme="purple"
                                                                        isChecked={!!adminForm.isSuperAdmin}
                                                                        onChange={(e) => setAdminForm(p => ({ ...p, isSuperAdmin: e.target.checked }))}
                                                                    />
                                                                </Flex>
                                                            </FormControl>
                                                        </SimpleGrid>

                                                        {canWriteCreateAdmin ? (
                                                            <Button
                                                                mt={5}
                                                                colorScheme="purple"
                                                                leftIcon={<Icon as={FiUserPlus} />}
                                                                isLoading={adminCreating}
                                                                loadingText="Creating Account..."
                                                                onClick={handleCreateAdmin}
                                                                borderRadius="xl"
                                                                px={8}
                                                                fontWeight="bold"
                                                                boxShadow="md"
                                                            >
                                                                + Create Admin Account
                                                            </Button>
                                                        ) : (
                                                            <Button
                                                                mt={5}
                                                                colorScheme="gray"
                                                                isDisabled
                                                                leftIcon={<Icon as={FiLock} />}
                                                                borderRadius="xl"
                                                            >
                                                                Read-Only (Creation Disabled)
                                                            </Button>
                                                        )}
                                                    </Box>
                                                </TabPanel>
                                            );
                                        }

                                        // ══════════════ TAB 3: USER & ADMIN ACCOUNTS ══════════════
                                        if (tab.id === 'accounts') {
                                            return (
                                                <TabPanel key="accounts" p={0}>
                                                    <Tabs variant="enclosed" colorScheme="purple" isLazy>
                                                        <Flex
                                                            px={6} pt={4} pb={2}
                                                            bg="purple.700"
                                                            borderRadius="2xl"
                                                            align="center"
                                                            justify="space-between"
                                                            wrap="wrap"
                                                            gap={4}
                                                            mb={4}
                                                        >
                                                            <Box>
                                                                <Heading fontSize="md" fontWeight="800" color="white">
                                                                    Account Directories
                                                                </Heading>
                                                                <Text fontSize="xs" color="whiteAlpha.800">
                                                                    Manage administrative personnel and registered client profiles.
                                                                </Text>
                                                            </Box>

                                                            <TabList borderBottom="none" gap={2}>
                                                                {canReadAdmins && (
                                                                    <Tab
                                                                        bg="whiteAlpha.200"
                                                                        color="white"
                                                                        _selected={{ bg: 'white', color: 'purple.800', fontWeight: '800', boxShadow: 'md' }}
                                                                        borderRadius="xl"
                                                                        py={2} px={4} fontSize="xs"
                                                                    >
                                                                        <Flex align="center" gap={2}>
                                                                            <Icon as={FiShield} />
                                                                            <Text>Admins</Text>
                                                                            <Badge colorScheme="purple" borderRadius="full" px={2}>{admins.length}</Badge>
                                                                        </Flex>
                                                                    </Tab>
                                                                )}
                                                                {canReadUsers && (
                                                                    <Tab
                                                                        bg="whiteAlpha.200"
                                                                        color="white"
                                                                        _selected={{ bg: 'white', color: 'purple.800', fontWeight: '800', boxShadow: 'md' }}
                                                                        borderRadius="xl"
                                                                        py={2} px={4} fontSize="xs"
                                                                    >
                                                                        <Flex align="center" gap={2}>
                                                                            <Icon as={FiUsers} />
                                                                            <Text>Registered Users</Text>
                                                                            <Badge colorScheme="blue" borderRadius="full" px={2}>{users.length}</Badge>
                                                                        </Flex>
                                                                    </Tab>
                                                                )}
                                                            </TabList>
                                                        </Flex>

                                                        <TabPanels>
                                                            {/* Sub-panel 1: Admins */}
                                                            {canReadAdmins && (
                                                                <TabPanel p={0} pt={2}>
                                                                    <Flex px={2} py={3} justify="space-between" align="center" mb={3} wrap="wrap" gap={3}>
                                                                        <Text fontSize="xs" fontWeight="700" color="purple.800">
                                                                            {filteredAdmins.length} {filteredAdmins.length === 1 ? 'Admin User' : 'Admin Users'}
                                                                        </Text>
                                                                        <HStack spacing={3} maxW={{ base: 'full', md: '420px' }} w="full" justify="flex-end">
                                                                            <InputGroup size="sm" maxW="280px" bg="white" borderRadius="lg" boxShadow="xs">
                                                                                <InputLeftElement pointerEvents="none">
                                                                                    <Icon as={FiSearch} color="gray.400" />
                                                                                </InputLeftElement>
                                                                                <Input
                                                                                    placeholder="Search admins..."
                                                                                    value={adminSearch}
                                                                                    onChange={(e) => setAdminSearch(e.target.value)}
                                                                                    borderRadius="lg"
                                                                                    borderColor="purple.200"
                                                                                    _focus={{ borderColor: 'purple.500', boxShadow: 'none' }}
                                                                                />
                                                                            </InputGroup>
                                                                            <Button
                                                                                size="sm"
                                                                                leftIcon={<FiRefreshCw />}
                                                                                variant="outline"
                                                                                colorScheme="purple"
                                                                                borderRadius="lg"
                                                                                isLoading={adminsLoading}
                                                                                onClick={fetchAccountsData}
                                                                            >
                                                                                Refresh
                                                                            </Button>
                                                                        </HStack>
                                                                    </Flex>

                                                                    <Box overflowX="auto" borderRadius="xl" border="1px solid" borderColor="gray.100" bg="white">
                                                                        <Table variant="simple" size="sm">
                                                                            <Thead bg="gray.50">
                                                                                <Tr>
                                                                                    <Th py={3} fontSize="10px" color="gray.500">#</Th>
                                                                                    <Th py={3} fontSize="10px" color="gray.500">ADMIN USER</Th>
                                                                                    <Th py={3} fontSize="10px" color="gray.500">CONTACT</Th>
                                                                                    <Th py={3} fontSize="10px" color="gray.500">ROLE</Th>
                                                                                    <Th py={3} fontSize="10px" color="gray.500">JOINED</Th>
                                                                                    {canWriteAdmins && <Th py={3} fontSize="10px" color="gray.500" textAlign="center">ACTIONS</Th>}
                                                                                </Tr>
                                                                            </Thead>
                                                                        <Tbody>
                                                                            {filteredAdmins.length === 0 ? (
                                                                                <Tr>
                                                                                    <Td colSpan={6} textAlign="center" py={12} color="gray.400">
                                                                                        <Flex direction="column" align="center" justify="center">
                                                                                            <Icon as={FiShield} w={10} h={10} mb={2} color="gray.300" />
                                                                                            <Text fontWeight="600">No admin users found</Text>
                                                                                            <Text fontSize="xs" mt={1}>
                                                                                                {adminSearch ? `No results for "${adminSearch}"` : 'No admin accounts created yet.'}
                                                                                            </Text>
                                                                                        </Flex>
                                                                                    </Td>
                                                                                </Tr>
                                                                            ) : (
                                                                                filteredAdmins.map((a, idx) => (
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
                                                                                                <Flex align="center" gap={1.5}>
                                                                                                    <Icon as={FiPhone} w={3.5} h={3.5} color="green.400" />
                                                                                                    <Text fontSize="xs" fontWeight="600" color="gray.700">{a.phone || '—'}</Text>
                                                                                                </Flex>
                                                                                                <Flex align="center" gap={1.5}>
                                                                                                    <Icon as={FiMail} w={3.5} h={3.5} color="blue.400" />
                                                                                                    <Text fontSize="xs" color="gray.500" noOfLines={1}>{a.email || '—'}</Text>
                                                                                                </Flex>
                                                                                            </Stack>
                                                                                        </Td>
                                                                                        <Td py={3}>
                                                                                            {a.isSuperAdmin ? (
                                                                                                <Badge
                                                                                                    colorScheme="yellow"
                                                                                                    bg="orange.100"
                                                                                                    color="orange.800"
                                                                                                    borderRadius="full"
                                                                                                    px={2.5}
                                                                                                    py={0.5}
                                                                                                    fontSize="10px"
                                                                                                    fontWeight="800"
                                                                                                    display="inline-flex"
                                                                                                    alignItems="center"
                                                                                                    gap={1}
                                                                                                    border="1px solid"
                                                                                                    borderColor="orange.300"
                                                                                                >
                                                                                                    <Icon as={RiVipCrownFill} color="orange.500" />
                                                                                                    SUPER ADMIN
                                                                                                </Badge>
                                                                                            ) : (
                                                                                                <Badge colorScheme="purple" borderRadius="full" px={2.5} py={0.5} fontSize="10px" fontWeight="800">
                                                                                                    SUB-ADMIN
                                                                                                </Badge>
                                                                                            )}
                                                                                        </Td>
                                                                                        <Td py={3}>
                                                                                            <Flex align="center" gap={1.5}>
                                                                                                <Icon as={FiCalendar} w={3.5} h={3.5} color="gray.400" />
                                                                                                <Text fontSize="xs" color="gray.500">{formatDate(a.createdAt)}</Text>
                                                                                            </Flex>
                                                                                        </Td>
                                                                                        {canWriteAdmins && (
                                                                                            <Td py={3} textAlign="center">
                                                                                                <HStack spacing={1} justify="center">
                                                                                                    <Tooltip label="Edit Admin Details" placement="top">
                                                                                                        <IconButton
                                                                                                            icon={<Icon as={FiEdit2} />}
                                                                                                            size="sm"
                                                                                                            colorScheme="purple"
                                                                                                            variant="ghost"
                                                                                                            borderRadius="lg"
                                                                                                            _hover={{ bg: 'purple.50', color: 'purple.600' }}
                                                                                                            onClick={() => handleOpenEditAdmin(a)}
                                                                                                            aria-label="Edit Admin"
                                                                                                        />
                                                                                                    </Tooltip>
                                                                                                    {user?._id !== a._id && (
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
                                                                                                    )}
                                                                                                </HStack>
                                                                                            </Td>
                                                                                        )}
                                                                                    </Tr>
                                                                                ))
                                                                            )}
                                                                        </Tbody>
                                                                    </Table>
                                                                </Box>
                                                            </TabPanel>
                                                            )}

                                                            {/* Sub-panel 2: Registered Users */}
                                                            {canReadUsers && (
                                                            <TabPanel p={0} pt={2}>
                                                                <Flex px={2} py={3} justify="space-between" align="center" mb={3} wrap="wrap" gap={3}>
                                                                    <Text fontSize="xs" fontWeight="700" color="gray.700">
                                                                        {filteredUsers.length} {filteredUsers.length === 1 ? 'Registered Client' : 'Registered Clients'}
                                                                    </Text>
                                                                    <HStack spacing={3} maxW={{ base: 'full', md: '420px' }} w="full" justify="flex-end">
                                                                        <InputGroup size="sm" maxW="280px" bg="white" borderRadius="lg" boxShadow="xs">
                                                                            <InputLeftElement pointerEvents="none">
                                                                                <Icon as={FiSearch} color="gray.400" />
                                                                            </InputLeftElement>
                                                                            <Input
                                                                                placeholder="Search users..."
                                                                                value={userSearch}
                                                                                onChange={(e) => setUserSearch(e.target.value)}
                                                                                borderRadius="lg"
                                                                                borderColor="gray.200"
                                                                                _focus={{ borderColor: 'blue.500', boxShadow: 'none' }}
                                                                            />
                                                                        </InputGroup>
                                                                        <Button
                                                                            size="sm"
                                                                            leftIcon={<FiRefreshCw />}
                                                                            variant="outline"
                                                                            colorScheme="blue"
                                                                            borderRadius="lg"
                                                                            isLoading={usersLoading}
                                                                            onClick={fetchAccountsData}
                                                                        >
                                                                            Refresh
                                                                        </Button>
                                                                    </HStack>
                                                                </Flex>

                                                                <Box overflowX="auto" borderRadius="xl" border="1px solid" borderColor="gray.100" bg="white">
                                                                    <Table variant="simple" size="sm">
                                                                        <Thead bg="gray.50">
                                                                            <Tr>
                                                                                <Th py={3} fontSize="10px" color="gray.500">#</Th>
                                                                                <Th py={3} fontSize="10px" color="gray.500">USER</Th>
                                                                                <Th py={3} fontSize="10px" color="gray.500">CONTACT</Th>
                                                                                <Th py={3} fontSize="10px" color="gray.500">COMPANY</Th>
                                                                                <Th py={3} fontSize="10px" color="gray.500">GST</Th>
                                                                                <Th py={3} fontSize="10px" color="gray.500">ADDRESS</Th>
                                                                                <Th py={3} fontSize="10px" color="gray.500">JOINED</Th>
                                                                                {canWriteUsers && <Th py={3} fontSize="10px" color="gray.500" textAlign="center">ACTIONS</Th>}
                                                                            </Tr>
                                                                        </Thead>
                                                                        <Tbody>
                                                                            {filteredUsers.length === 0 ? (
                                                                                <Tr>
                                                                                    <Td colSpan={8} textAlign="center" py={12} color="gray.400">
                                                                                        <Flex direction="column" align="center" justify="center">
                                                                                            <Icon as={FiUsers} w={10} h={10} mb={2} color="gray.300" />
                                                                                            <Text fontWeight="600">No registered users found</Text>
                                                                                            <Text fontSize="xs" mt={1}>
                                                                                                {userSearch ? `No results for "${userSearch}"` : 'Users who register on the website will appear here'}
                                                                                            </Text>
                                                                                        </Flex>
                                                                                    </Td>
                                                                                </Tr>
                                                                            ) : (
                                                                                filteredUsers.map((u, idx) => (
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
                                                                                                    bg={`${getColor(idx)}.500`}
                                                                                                    color="white"
                                                                                                    fontWeight="700"
                                                                                                    fontSize="xs"
                                                                                                />
                                                                                                <Stack spacing={0}>
                                                                                                    <Text fontWeight="700" fontSize="sm" color="gray.800">
                                                                                                        {u.contactPersonName || u.name || u.companyName || '—'}
                                                                                                    </Text>
                                                                                                    <Text fontSize="xs" color="gray.400">{u.email || '—'}</Text>
                                                                                                </Stack>
                                                                                            </Flex>
                                                                                        </Td>
                                                                                        <Td py={3}>
                                                                                            <Stack spacing={1}>
                                                                                                <Flex align="center" gap={1.5}>
                                                                                                    <Icon as={FiPhone} w={3.5} h={3.5} color="green.400" />
                                                                                                    <Text fontSize="xs" fontWeight="600" color="gray.700">{u.phone || '—'}</Text>
                                                                                                </Flex>
                                                                                                <Flex align="center" gap={1.5}>
                                                                                                    <Icon as={FiMail} w={3.5} h={3.5} color="blue.400" />
                                                                                                    <Text fontSize="xs" color="gray.500" noOfLines={1} maxW="180px">{u.email || '—'}</Text>
                                                                                                </Flex>
                                                                                            </Stack>
                                                                                        </Td>
                                                                                        <Td py={3}>
                                                                                            <Flex align="center" gap={1.5}>
                                                                                                <Icon as={FiBriefcase} w={3.5} h={3.5} color="orange.400" />
                                                                                                <Text fontSize="xs" fontWeight="600" color="gray.700" noOfLines={1} maxW="150px">
                                                                                                    {u.companyName || '—'}
                                                                                                </Text>
                                                                                            </Flex>
                                                                                        </Td>
                                                                                        <Td py={3}>
                                                                                            {u.gstNumber ? (
                                                                                                <Tag size="sm" colorScheme="green" borderRadius="full" px={2.5} py={0.5} bg="green.50" border="1px solid" borderColor="green.200">
                                                                                                    <TagLabel fontSize="10px" fontWeight="700" color="green.800" fontFamily="mono">{u.gstNumber}</TagLabel>
                                                                                                </Tag>
                                                                                            ) : (
                                                                                                <Text fontSize="xs" color="gray.400">—</Text>
                                                                                            )}
                                                                                        </Td>
                                                                                        <Td py={3}>
                                                                                            <Text fontSize="xs" color="gray.600" noOfLines={2} maxW="180px" title={u.address}>
                                                                                                {u.address || '—'}
                                                                                            </Text>
                                                                                        </Td>
                                                                                        <Td py={3}>
                                                                                            <Flex align="center" gap={1.5}>
                                                                                                <Icon as={FiCalendar} w={3.5} h={3.5} color="gray.400" />
                                                                                                <Text fontSize="xs" color="gray.500">{formatDate(u.createdAt)}</Text>
                                                                                            </Flex>
                                                                                        </Td>
                                                                                        {canWriteUsers && (
                                                                                            <Td py={3} textAlign="center">
                                                                                                <HStack spacing={1} justify="center">
                                                                                                    <Tooltip label="Edit User Details (✏️)" placement="top">
                                                                                                        <IconButton
                                                                                                            icon={<Icon as={FiEdit2} />}
                                                                                                            size="sm"
                                                                                                            colorScheme="blue"
                                                                                                            variant="ghost"
                                                                                                            borderRadius="lg"
                                                                                                            _hover={{ bg: 'blue.50', color: 'blue.600' }}
                                                                                                            onClick={() => handleOpenEditUser(u)}
                                                                                                            aria-label="Edit User"
                                                                                                        />
                                                                                                    </Tooltip>
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
                                                                                                </HStack>
                                                                                            </Td>
                                                                                        )}
                                                                                    </Tr>
                                                                                ))
                                                                            )}
                                                                        </Tbody>
                                                                    </Table>
                                                                </Box>
                                                            </TabPanel>
                                                            )}
                                                        </TabPanels>
                                                    </Tabs>
                                                </TabPanel>
                                            );
                                        }

                                        return null;
                                    })}
                                </TabPanels>
                            </Tabs>
                        )}
                    </CardBody>
                </Card>
            </Container>

            {/* ── Edit Admin Modal ── */}
            <Modal isOpen={editAdminModal.isOpen} onClose={() => setEditAdminModal({ isOpen: false, admin: null })} isCentered size="md">
                <ModalOverlay backdropFilter="blur(4px)" bg="blackAlpha.600" />
                <ModalContent borderRadius="2xl" p={2} boxShadow="2xl">
                    <ModalHeader display="flex" alignItems="center" gap={3} pb={2}>
                        <Box p={2.5} bg="purple.100" borderRadius="xl">
                            <Icon as={FiEdit2} color="purple.600" w={5} h={5} />
                        </Box>
                        <Box>
                            <Heading fontSize="lg" fontWeight="800" color="purple.700">Update Admin User</Heading>
                            <Text fontSize="xs" color="gray.500">Edit details and role privileges for this administrator.</Text>
                        </Box>
                    </ModalHeader>
                    <ModalCloseButton mt={3} mr={3} borderRadius="full" />
                    <ModalBody py={4}>
                        <Stack spacing={4}>
                            <FormControl isRequired>
                                <FormLabel fontSize="sm" fontWeight="700">Full Name</FormLabel>
                                <Input
                                    placeholder="Full Name"
                                    value={editForm.name}
                                    onChange={(e) => setEditForm(p => ({ ...p, name: e.target.value }))}
                                    borderRadius="lg"
                                />
                            </FormControl>
                            <FormControl isRequired>
                                <FormLabel fontSize="sm" fontWeight="700">Email Address</FormLabel>
                                <Input
                                    type="email"
                                    placeholder="admin@company.com"
                                    value={editForm.email}
                                    onChange={(e) => setEditForm(p => ({ ...p, email: e.target.value }))}
                                    borderRadius="lg"
                                />
                            </FormControl>
                            <FormControl isRequired>
                                <FormLabel fontSize="sm" fontWeight="700">Phone Number</FormLabel>
                                <Input
                                    placeholder="9876543210"
                                    value={editForm.phone}
                                    onChange={(e) => setEditForm(p => ({ ...p, phone: e.target.value.replace(/\D/g, '') }))}
                                    maxLength={10}
                                    borderRadius="lg"
                                />
                            </FormControl>
                            <FormControl
                                display="flex"
                                alignItems="center"
                                justifyContent="space-between"
                                p={3.5}
                                bg={editForm.isSuperAdmin ? "purple.50" : "gray.50"}
                                borderRadius="xl"
                                border="1px solid"
                                borderColor={editForm.isSuperAdmin ? "purple.200" : "gray.200"}
                            >
                                <Box>
                                    <FormLabel mb="0" fontSize="sm" fontWeight="700" display="flex" alignItems="center" gap={1.5}>
                                        <Icon as={RiVipCrownFill} color={editForm.isSuperAdmin ? "orange.500" : "gray.400"} />
                                        Super Admin Privileges
                                    </FormLabel>
                                    <Text fontSize="xs" color="gray.500">
                                        {editForm.isSuperAdmin ? 'Full administrative rights and account management.' : 'Standard sub-admin rights.'}
                                    </Text>
                                </Box>
                                <Switch
                                    colorScheme="purple"
                                    size="lg"
                                    isChecked={!!editForm.isSuperAdmin}
                                    onChange={(e) => setEditForm(p => ({ ...p, isSuperAdmin: e.target.checked }))}
                                />
                            </FormControl>
                        </Stack>
                    </ModalBody>
                    <ModalFooter gap={3} pt={2}>
                        <Button variant="outline" borderRadius="xl" onClick={() => setEditAdminModal({ isOpen: false, admin: null })}>
                            Cancel
                        </Button>
                        <Button colorScheme="purple" borderRadius="xl" isLoading={editLoading} onClick={handleUpdateAdmin}>
                            Save Changes
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* ── Edit User Modal ── */}
            <Modal isOpen={editUserModal.isOpen} onClose={() => setEditUserModal({ isOpen: false, user: null })} isCentered size="lg">
                <ModalOverlay backdropFilter="blur(5px)" bg="blackAlpha.600" />
                <ModalContent borderRadius="2xl" p={2} boxShadow="2xl">
                    <ModalHeader display="flex" alignItems="center" gap={3} pb={2}>
                        <Box p={2.5} bg="blue.100" borderRadius="xl">
                            <Icon as={FiEdit2} color="blue.600" w={5} h={5} />
                        </Box>
                        <Box>
                            <Heading fontSize="lg" fontWeight="800" color="blue.700">Update User Details</Heading>
                            <Text fontSize="xs" color="gray.500">Edit registered client information.</Text>
                        </Box>
                    </ModalHeader>
                    <ModalCloseButton mt={3} mr={3} borderRadius="full" />
                    <ModalBody py={4}>
                        <Stack spacing={4}>
                            <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4}>
                                <FormControl isRequired>
                                    <FormLabel fontSize="xs" fontWeight="700">Contact Person Name</FormLabel>
                                    <Input
                                        value={editUserForm.contactPersonName}
                                        onChange={(e) => setEditUserForm(p => ({ ...p, contactPersonName: e.target.value }))}
                                        borderRadius="lg"
                                    />
                                </FormControl>
                                <FormControl>
                                    <FormLabel fontSize="xs" fontWeight="700">Company Name</FormLabel>
                                    <Input
                                        value={editUserForm.companyName}
                                        onChange={(e) => setEditUserForm(p => ({ ...p, companyName: e.target.value }))}
                                        borderRadius="lg"
                                    />
                                </FormControl>
                            </SimpleGrid>
                            <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4}>
                                <FormControl isRequired>
                                    <FormLabel fontSize="xs" fontWeight="700">Phone Number</FormLabel>
                                    <Input
                                        value={editUserForm.phone}
                                        onChange={(e) => setEditUserForm(p => ({ ...p, phone: e.target.value.replace(/\D/g, '') }))}
                                        maxLength={10}
                                        borderRadius="lg"
                                    />
                                </FormControl>
                                <FormControl>
                                    <FormLabel fontSize="xs" fontWeight="700">Email Address</FormLabel>
                                    <Input
                                        type="email"
                                        value={editUserForm.email}
                                        onChange={(e) => setEditUserForm(p => ({ ...p, email: e.target.value }))}
                                        borderRadius="lg"
                                    />
                                </FormControl>
                            </SimpleGrid>
                            <FormControl>
                                <FormLabel fontSize="xs" fontWeight="700">GST Number</FormLabel>
                                <Input
                                    value={editUserForm.gstNumber}
                                    onChange={(e) => setEditUserForm(p => ({ ...p, gstNumber: e.target.value.toUpperCase() }))}
                                    borderRadius="lg"
                                />
                            </FormControl>
                        </Stack>
                    </ModalBody>
                    <ModalFooter gap={3} pt={2}>
                        <Button variant="outline" borderRadius="xl" onClick={() => setEditUserModal({ isOpen: false, user: null })}>
                            Cancel
                        </Button>
                        <Button colorScheme="blue" borderRadius="xl" isLoading={editUserLoading} onClick={handleUpdateUser}>
                            Save Changes
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* ── Delete Account Confirmation AlertDialog ── */}
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
                            Are you sure you want to permanently delete the account for{' '}
                            <Text as="span" fontWeight="800" color="gray.800">
                                {deleteAccountModal.user?.name || deleteAccountModal.user?.companyName || deleteAccountModal.user?.email}
                            </Text>?
                        </AlertDialogBody>
                        <AlertDialogFooter gap={3}>
                            <Button ref={cancelRef} onClick={() => setDeleteAccountModal({ isOpen: false, user: null, type: '' })} borderRadius="xl" size="sm">
                                Cancel
                            </Button>
                            <Button colorScheme="red" onClick={handleDeleteAccount} isLoading={isDeleting} borderRadius="xl" size="sm">
                                Yes, Remove Account
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
        </Box>
    );
};

export default AdminLoginReport;
