import React, { useState, useEffect } from 'react';
import {
    Box, Container, VStack, HStack, Heading, Text, Card, CardBody,
    Avatar, Badge, SimpleGrid, Icon, Divider, Button, FormControl,
    FormLabel, Input, Textarea, useToast, Flex, InputGroup,
    InputLeftElement, InputRightElement, IconButton, Alert, AlertIcon,
    Breadcrumb, BreadcrumbItem, BreadcrumbLink, Spinner
} from '@chakra-ui/react';
import {
    FiUser, FiMail, FiPhone, FiMapPin, FiBriefcase, FiFileText,
    FiLock, FiEye, FiEyeOff, FiSave, FiCheckCircle, FiShield,
    FiArrowRight, FiClock, FiGrid
} from 'react-icons/fi';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const MyProfile = () => {
    const { user, setUser } = useAuth();
    const navigate = useNavigate();
    const toast = useToast();

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    // Profile form state
    const [profileData, setProfileData] = useState({
        name: '',
        contactPersonName: '',
        companyName: '',
        email: '',
        phone: '',
        gstNumber: '',
        address: ''
    });

    // Password form state
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                setIsLoading(true);
                const res = await api.get('/auth/me');
                if (res.data) {
                    const d = res.data;
                    setProfileData({
                        name: d.name || '',
                        contactPersonName: d.contactPersonName || d.name || '',
                        companyName: d.companyName || '',
                        email: d.email || '',
                        phone: d.phone || '',
                        gstNumber: d.gstNumber || '',
                        address: d.address || ''
                    });
                }
            } catch (err) {
                console.error('Error loading profile:', err);
                // Fall back to context user
                if (user) {
                    setProfileData({
                        name: user.name || '',
                        contactPersonName: user.contactPersonName || user.name || '',
                        companyName: user.companyName || '',
                        email: user.email || '',
                        phone: user.phone || '',
                        gstNumber: user.gstNumber || '',
                        address: user.address || ''
                    });
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserData();
    }, [user]);

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const res = await api.put('/auth/profile', {
                name: profileData.name || profileData.contactPersonName,
                contactPersonName: profileData.contactPersonName,
                companyName: profileData.companyName,
                email: profileData.email,
                gstNumber: profileData.gstNumber,
                address: profileData.address
            });

            if (res.data?.success) {
                toast({
                    title: 'Profile Updated!',
                    description: 'Your details have been saved successfully.',
                    status: 'success',
                    duration: 3500,
                    isClosable: true
                });
                if (res.data.user) {
                    setUser(prev => ({ ...prev, ...res.data.user }));
                    sessionStorage.setItem('user', JSON.stringify({ ...user, ...res.data.user }));
                }
            }
        } catch (err) {
            console.error(err);
            toast({
                title: 'Update Failed',
                description: err.response?.data?.msg || 'Could not update profile details.',
                status: 'error',
                duration: 4000,
                isClosable: true
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (newPassword.length < 6) {
            return toast({
                title: 'Weak Password',
                description: 'New password must be at least 6 characters long.',
                status: 'warning',
                duration: 3000
            });
        }
        if (newPassword !== confirmPassword) {
            return toast({
                title: 'Passwords Mismatch',
                description: 'New password and confirmation do not match.',
                status: 'error',
                duration: 3000
            });
        }

        setIsChangingPassword(true);
        try {
            const res = await api.put('/auth/change-password', {
                currentPassword,
                newPassword
            });

            if (res.data?.success) {
                toast({
                    title: 'Password Changed!',
                    description: 'Your new password is now active.',
                    status: 'success',
                    duration: 3500,
                    isClosable: true
                });
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
            }
        } catch (err) {
            console.error(err);
            toast({
                title: 'Change Password Failed',
                description: err.response?.data?.msg || 'Could not update password. Please check your current password.',
                status: 'error',
                duration: 4000,
                isClosable: true
            });
        } finally {
            setIsChangingPassword(false);
        }
    };

    if (isLoading) {
        return (
            <Box minH="70vh" py={20} display="flex" alignItems="center" justifyContent="center">
                <VStack spacing={4}>
                    <Spinner size="xl" color="brand.500" thickness="4px" />
                    <Text fontWeight="600" color="gray.500">Loading your profile...</Text>
                </VStack>
            </Box>
        );
    }

    const cleanDisplayPhone = (profileData.phone || user?.phone || '').replace(/\D/g, '').slice(-10);

    return (
        <Box bg="gray.50" minH="90vh" py={{ base: 6, md: 10 }}>
            <Container maxW="6xl">
                {/* Breadcrumb */}
                <Breadcrumb fontSize="xs" color="gray.500" mb={6}>
                    <BreadcrumbItem>
                        <BreadcrumbLink as={RouterLink} to="/">Home</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbItem>
                        <BreadcrumbLink as={RouterLink} to="/my-dashboard">Dashboard</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbItem isCurrentPage color="brand.600" fontWeight="700">
                        <BreadcrumbLink>My Profile</BreadcrumbLink>
                    </BreadcrumbItem>
                </Breadcrumb>

                {/* Hero Profile Banner */}
                <Card
                    borderRadius="3xl"
                    overflow="hidden"
                    boxShadow="xl"
                    border="1px solid"
                    borderColor="gray.100"
                    mb={8}
                    bg="white"
                >
                    <Box
                        h="120px"
                        bg="linear-gradient(135deg, #0076a3 0%, #004d6e 100%)"
                        position="relative"
                    />
                    <CardBody p={{ base: 6, md: 8 }} pt={0} position="relative">
                        <Flex
                            direction={{ base: 'column', md: 'row' }}
                            align={{ base: 'start', md: 'center' }}
                            justify="space-between"
                            gap={6}
                        >
                            <HStack spacing={5} mt="-50px" align={{ base: 'start', md: 'flex-end' }}>
                                <Avatar
                                    size="2xl"
                                    name={profileData.contactPersonName || profileData.name || 'User'}
                                    bg="brand.500"
                                    color="white"
                                    border="4px solid white"
                                    boxShadow="lg"
                                />
                                <Box pt={{ base: 2, md: 12 }}>
                                    <HStack spacing={2} align="center" wrap="wrap">
                                        <Heading size="lg" color="gray.800" fontWeight="900">
                                            {profileData.contactPersonName || profileData.name || 'Valued Customer'}
                                        </Heading>
                                        <Badge
                                            colorScheme={user?.isAdmin ? 'purple' : 'teal'}
                                            borderRadius="full"
                                            px={3}
                                            py={0.5}
                                            fontSize="xs"
                                            fontWeight="800"
                                        >
                                            {user?.isSuperAdmin ? 'SUPER ADMIN' : user?.isAdmin ? 'ADMIN' : 'VERIFIED CUSTOMER'}
                                        </Badge>
                                    </HStack>
                                    {profileData.companyName && (
                                        <HStack spacing={2} color="gray.600" mt={1}>
                                            <Icon as={FiBriefcase} />
                                            <Text fontWeight="600" fontSize="sm">{profileData.companyName}</Text>
                                        </HStack>
                                    )}
                                    <HStack spacing={4} color="gray.500" fontSize="xs" mt={2} wrap="wrap">
                                        <HStack spacing={1}>
                                            <Icon as={FiPhone} color="brand.500" />
                                            <Text fontWeight="bold">+91 {cleanDisplayPhone}</Text>
                                        </HStack>
                                        {profileData.email && !profileData.email.includes('@noemail.com') && (
                                            <HStack spacing={1}>
                                                <Icon as={FiMail} color="brand.500" />
                                                <Text>{profileData.email}</Text>
                                            </HStack>
                                        )}
                                    </HStack>
                                </Box>
                            </HStack>

                            <HStack spacing={3} alignSelf={{ base: 'stretch', md: 'center' }} mt={{ base: 4, md: 8 }}>
                                <Button
                                    as={RouterLink}
                                    to="/my-dashboard"
                                    colorScheme="brand"
                                    variant="solid"
                                    size="md"
                                    borderRadius="xl"
                                    leftIcon={<FiGrid />}
                                    boxShadow="md"
                                >
                                    My Dashboard
                                </Button>
                            </HStack>
                        </Flex>
                    </CardBody>
                </Card>

                {/* Main Content Grid */}
                <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={8}>
                    {/* Left 2 Cols: Profile Information Form */}
                    <Box gridColumn={{ base: '1', lg: 'span 2' }}>
                        <Card borderRadius="2xl" boxShadow="md" bg="white" border="1px solid" borderColor="gray.100">
                            <CardBody p={{ base: 6, md: 8 }}>
                                <HStack spacing={3} mb={6} align="center">
                                    <Box p={2.5} bg="brand.50" color="brand.600" borderRadius="xl">
                                        <Icon as={FiUser} boxSize={5} />
                                    </Box>
                                    <Box>
                                        <Heading size="md" color="gray.800" fontWeight="800">
                                            Account &amp; Business Details
                                        </Heading>
                                        <Text fontSize="xs" color="gray.500">
                                            Update your personal, business, and billing information for quotations and invoices.
                                        </Text>
                                    </Box>
                                </HStack>

                                <form onSubmit={handleProfileSubmit}>
                                    <VStack spacing={5} align="stretch">
                                        <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4}>
                                            <FormControl isRequired>
                                                <FormLabel fontSize="xs" fontWeight="800" color="gray.600" textTransform="uppercase">
                                                    Contact Person Name
                                                </FormLabel>
                                                <InputGroup>
                                                    <InputLeftElement pointerEvents="none" color="gray.400">
                                                        <FiUser />
                                                    </InputLeftElement>
                                                    <Input
                                                        value={profileData.contactPersonName}
                                                        onChange={(e) => setProfileData({ ...profileData, contactPersonName: e.target.value })}
                                                        placeholder="Enter your name"
                                                        borderRadius="xl"
                                                        fontWeight="600"
                                                    />
                                                </InputGroup>
                                            </FormControl>

                                            <FormControl>
                                                <FormLabel fontSize="xs" fontWeight="800" color="gray.600" textTransform="uppercase">
                                                    Company / Firm Name
                                                </FormLabel>
                                                <InputGroup>
                                                    <InputLeftElement pointerEvents="none" color="gray.400">
                                                        <FiBriefcase />
                                                    </InputLeftElement>
                                                    <Input
                                                        value={profileData.companyName}
                                                        onChange={(e) => setProfileData({ ...profileData, companyName: e.target.value })}
                                                        placeholder="e.g. Acme Engineering Ltd."
                                                        borderRadius="xl"
                                                        fontWeight="600"
                                                    />
                                                </InputGroup>
                                            </FormControl>
                                        </SimpleGrid>

                                        <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4}>
                                            <FormControl isRequired>
                                                <FormLabel fontSize="xs" fontWeight="800" color="gray.600" textTransform="uppercase">
                                                    Registered Mobile (Primary Login)
                                                </FormLabel>
                                                <InputGroup>
                                                    <InputLeftElement pointerEvents="none" color="gray.400">
                                                        <FiPhone />
                                                    </InputLeftElement>
                                                    <Input
                                                        value={`+91 ${cleanDisplayPhone}`}
                                                        isReadOnly
                                                        bg="gray.50"
                                                        color="gray.700"
                                                        borderRadius="xl"
                                                        fontWeight="bold"
                                                        cursor="not-allowed"
                                                    />
                                                    <InputRightElement color="green.500">
                                                        <FiCheckCircle />
                                                    </InputRightElement>
                                                </InputGroup>
                                                <Text fontSize="2xs" color="gray.400" mt={1}>
                                                    Mobile is verified and bound to your login credentials.
                                                </Text>
                                            </FormControl>

                                            <FormControl>
                                                <FormLabel fontSize="xs" fontWeight="800" color="gray.600" textTransform="uppercase">
                                                    Email Address
                                                </FormLabel>
                                                <InputGroup>
                                                    <InputLeftElement pointerEvents="none" color="gray.400">
                                                        <FiMail />
                                                    </InputLeftElement>
                                                    <Input
                                                        type="email"
                                                        value={profileData.email.includes('@noemail.com') ? '' : profileData.email}
                                                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                                        placeholder="client@example.com"
                                                        borderRadius="xl"
                                                        fontWeight="600"
                                                    />
                                                </InputGroup>
                                            </FormControl>
                                        </SimpleGrid>

                                        <FormControl>
                                            <FormLabel fontSize="xs" fontWeight="800" color="gray.600" textTransform="uppercase">
                                                GST Number (GSTIN)
                                            </FormLabel>
                                            <InputGroup>
                                                <InputLeftElement pointerEvents="none" color="gray.400">
                                                    <FiFileText />
                                                </InputLeftElement>
                                                <Input
                                                    value={profileData.gstNumber}
                                                    onChange={(e) => setProfileData({ ...profileData, gstNumber: e.target.value.toUpperCase() })}
                                                    placeholder="24AAAAA0000A1Z5"
                                                    maxLength={15}
                                                    borderRadius="xl"
                                                    fontWeight="bold"
                                                    letterSpacing="0.5px"
                                                />
                                            </InputGroup>
                                        </FormControl>

                                        <FormControl>
                                            <FormLabel fontSize="xs" fontWeight="800" color="gray.600" textTransform="uppercase">
                                                Billing &amp; Delivery Address
                                            </FormLabel>
                                            <Textarea
                                                value={profileData.address}
                                                onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                                                placeholder="Plot No., Road, Industrial Area, City, State, PIN"
                                                rows={3}
                                                borderRadius="xl"
                                                fontWeight="500"
                                            />
                                        </FormControl>

                                        <Box pt={2}>
                                            <Button
                                                type="submit"
                                                colorScheme="brand"
                                                size="lg"
                                                borderRadius="xl"
                                                isLoading={isSaving}
                                                leftIcon={<FiSave />}
                                                fontWeight="800"
                                                boxShadow="md"
                                                px={8}
                                            >
                                                Save Profile Changes
                                            </Button>
                                        </Box>
                                    </VStack>
                                </form>
                            </CardBody>
                        </Card>
                    </Box>

                    {/* Right 1 Col: Security / Change Password */}
                    <VStack spacing={6} align="stretch">
                        <Card borderRadius="2xl" boxShadow="md" bg="white" border="1px solid" borderColor="gray.100">
                            <CardBody p={6}>
                                <HStack spacing={3} mb={5} align="center">
                                    <Box p={2.5} bg="purple.50" color="purple.600" borderRadius="xl">
                                        <Icon as={FiShield} boxSize={5} />
                                    </Box>
                                    <Box>
                                        <Heading size="sm" color="gray.800" fontWeight="800">
                                            Account Security
                                        </Heading>
                                        <Text fontSize="2xs" color="gray.500">
                                            Manage your login password
                                        </Text>
                                    </Box>
                                </HStack>

                                <form onSubmit={handlePasswordChange}>
                                    <VStack spacing={4} align="stretch">
                                        <FormControl isRequired>
                                            <FormLabel fontSize="xs" fontWeight="700" color="gray.600">
                                                Current Password
                                            </FormLabel>
                                            <InputGroup size="md">
                                                <Input
                                                    type={showCurrent ? 'text' : 'password'}
                                                    placeholder="Enter existing password"
                                                    value={currentPassword}
                                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                                    borderRadius="xl"
                                                />
                                                <InputRightElement>
                                                    <IconButton
                                                        icon={showCurrent ? <FiEyeOff /> : <FiEye />}
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => setShowCurrent(p => !p)}
                                                        aria-label="Toggle password"
                                                    />
                                                </InputRightElement>
                                            </InputGroup>
                                        </FormControl>

                                        <FormControl isRequired>
                                            <FormLabel fontSize="xs" fontWeight="700" color="gray.600">
                                                New Password
                                            </FormLabel>
                                            <InputGroup size="md">
                                                <Input
                                                    type={showNew ? 'text' : 'password'}
                                                    placeholder="Min. 6 characters"
                                                    value={newPassword}
                                                    onChange={(e) => setNewPassword(e.target.value)}
                                                    borderRadius="xl"
                                                />
                                                <InputRightElement>
                                                    <IconButton
                                                        icon={showNew ? <FiEyeOff /> : <FiEye />}
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => setShowNew(p => !p)}
                                                        aria-label="Toggle password"
                                                    />
                                                </InputRightElement>
                                            </InputGroup>
                                        </FormControl>

                                        <FormControl isRequired>
                                            <FormLabel fontSize="xs" fontWeight="700" color="gray.600">
                                                Confirm New Password
                                            </FormLabel>
                                            <Input
                                                type={showNew ? 'text' : 'password'}
                                                placeholder="Re-enter new password"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                borderRadius="xl"
                                                size="md"
                                            />
                                        </FormControl>

                                        <Button
                                            type="submit"
                                            colorScheme="purple"
                                            size="md"
                                            borderRadius="xl"
                                            isLoading={isChangingPassword}
                                            leftIcon={<FiLock />}
                                            fontWeight="700"
                                            mt={2}
                                        >
                                            Update Password
                                        </Button>
                                    </VStack>
                                </form>
                            </CardBody>
                        </Card>

                        {/* Quick Navigation Card */}
                        <Card borderRadius="2xl" bg="linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)" border="1px solid" borderColor="blue.200" p={5}>
                            <VStack align="stretch" spacing={3}>
                                <HStack spacing={2} color="brand.700">
                                    <Icon as={FiGrid} boxSize={5} />
                                    <Heading size="xs" fontWeight="800">
                                        Company Quotations
                                    </Heading>
                                </HStack>
                                <Text fontSize="xs" color="gray.600">
                                    View all quotations, status updates, pricing, and download official quotation PDFs.
                                </Text>
                                <Button
                                    as={RouterLink}
                                    to="/my-dashboard"
                                    colorScheme="brand"
                                    size="sm"
                                    borderRadius="xl"
                                    rightIcon={<FiArrowRight />}
                                >
                                    Open My Dashboard
                                </Button>
                            </VStack>
                        </Card>
                    </VStack>
                </SimpleGrid>
            </Container>
        </Box>
    );
};

export default MyProfile;
