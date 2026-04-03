import React, { useState } from 'react';
import {
    Box, Flex, Text, Button, Stack, useDisclosure,
    Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton,
    Drawer, DrawerBody, DrawerFooter, DrawerHeader, DrawerOverlay, DrawerContent, DrawerCloseButton,
    FormControl, FormLabel, Input, useToast, Image, IconButton
} from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { FaPhone, FaEnvelope, FaShoppingCart, FaTrash, FaBars, FaSearch } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';

const MotionBox = motion.create(Box);

const MobileNavLink = ({ to, children, onClick }) => (
    <Box
        as={RouterLink}
        to={to}
        onClick={onClick}
        px={4}
        py={3}
        fontWeight="bold"
        _hover={{ bg: 'brand.50', color: 'brand.500' }}
        borderBottom="1px"
        borderColor="gray.50"
        display="block"
    >
        {children}
    </Box>
);

const Header = () => {
    const { user, logout } = useAuth();
    const { cart } = useCart();
    const navigate = useNavigate();
    const location = useLocation();
    const { isOpen: isRegisterOpen, onOpen: onRegisterOpen, onClose: onRegisterClose } = useDisclosure();
    const { isOpen: isEnquiryOpen, onOpen: onEnquiryOpen, onClose: onEnquiryClose } = useDisclosure();
    const { isOpen: isNavOpen, onToggle: toggleNav } = useDisclosure();

    const [searchTerm, setSearchTerm] = useState('');

    // Sync search input with URL
    React.useEffect(() => {
        const params = new URLSearchParams(location.search);
        const q = params.get('search') || '';
        setSearchTerm(q);
    }, [location.search]);

    const handleSearch = (e) => {
        const val = e.target.value;
        setSearchTerm(val);
        // Navigate to search results
        navigate(`/products?search=${val}`);
    };

    const handleEnquiryClick = () => {
        if (cart.length > 0) {
            onEnquiryOpen();
        } else {
            navigate('/products');
        }
    };

    return (
        <Box bg="white" boxShadow="md" position="sticky" top="0" zIndex="1000">
            {/* Top Bar for Contact Info - hidden on mobile */}
            <Box bg="brand.900" color="gray.300" py={2} px={{ base: 4, md: 8 }} fontSize="sm" display={{ base: 'none', md: 'block' }}>
                <Flex justify="space-between" align="center">
                    <Flex gap={6}>
                        <Flex align="center" gap={2}>
                            <FaEnvelope /> <Text>contact@uniqueengineering.com</Text>
                        </Flex>
                        <Flex align="center" gap={2}>
                            <FaPhone /> <Text>+91 98765 43210</Text>
                        </Flex>
                    </Flex>
                    <Text>GST: 22AAAAA0000A1Z5</Text>
                </Flex>
            </Box>

            {/* Main Navbar */}
            <Flex py={{ base: 3, md: 4 }} px={{ base: 4, md: 8 }} justify="space-between" align="center">
                {/* Logo Section */}
                <Flex align="center" gap={{ base: 2, md: 4 }} as={RouterLink} to="/">
                    <Box w={{ base: "40px", md: "50px" }} h={{ base: "40px", md: "50px" }} bg="brand.500" borderRadius="md" display="flex" alignItems="center" justifyContent="center" color="white" fontWeight="bold" flexShrink={0}>
                        UE
                    </Box>
                    <Box>
                        <Text fontSize={{ base: 'md', sm: 'xl', md: '2xl' }} fontWeight="bold" color="brand.700" lineHeight="1" noOfLines={1}>
                            Unique Engineering
                        </Text>
                        <Text fontSize={{ base: '9px', md: 'xs' }} color="gray.500" letterSpacing="widest">
                            CIVIL & INSTRUMENTAL
                        </Text>
                    </Box>
                </Flex>

                {/* Navigation Links */}
                <Flex display={{ base: 'none', md: 'flex' }} gap={8} align="center">
                    <RouterLink to="/">Home</RouterLink>
                    <RouterLink to="/about">About Us</RouterLink>
                    <RouterLink to="/products">Products</RouterLink>
                    <RouterLink to="/contact">Contact</RouterLink>
                </Flex>

                {/* Actions - Desktop */}
                <Flex display={{ base: 'none', lg: 'flex' }} gap={4} align="center">
                    {/* Search Bar */}
                    <Box>
                        <FormControl>
                            <Input
                                placeholder="Search products..."
                                size="sm"
                                borderRadius="full"
                                bg="gray.100"
                                border="none"
                                _focus={{ bg: "white", boxShadow: "outline" }}
                                value={searchTerm}
                                onChange={handleSearch}
                                width="180px"
                            />
                        </FormControl>
                    </Box>

                    {user && user.isAdmin && (
                        <Button as={RouterLink} to="/admin/dashboard" colorScheme="purple" size="sm">
                            Admin
                        </Button>
                    )}
                    <Button as={RouterLink} to="/products" variant="ghost" size="sm" leftIcon={<FaShoppingCart />}>
                        Cart ({cart.reduce((acc, item) => acc + (Number(item.quantity) || 1), 0)})
                    </Button>
                    <Button id="enquiry-cart-btn" colorScheme="orange" variant="accent" size="sm" onClick={handleEnquiryClick}>
                        Enquiry
                    </Button>
                    {!user ? (
                        <Button variant="outline" size="sm" onClick={onRegisterOpen}>Admin Login</Button>
                    ) : (
                        <Flex align="center" gap={3}>
                            <Text fontWeight="bold" fontSize="sm" color="brand.600" noOfLines={1}>Hi, {user.name.split(' ')[0]}</Text>
                            <Button size="xs" variant="ghost" colorScheme="red" onClick={() => {
                                logout();
                                navigate('/');
                            }}>Logout</Button>
                        </Flex>
                    )}
                </Flex>

                {/* Mobile Icons Header */}
                <Flex display={{ base: 'flex', lg: 'none' }} align="center" gap={2}>
                    <IconButton
                        icon={<FaShoppingCart />}
                        aria-label="Cart"
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate('/products')}
                    />
                    <IconButton
                        icon={<FaBars />}
                        onClick={toggleNav}
                        variant="ghost"
                        aria-label="Open Navigation"
                        size="sm"
                    />
                </Flex>
            </Flex>

            {/* Mobile Navigation Dropdown */}
            <AnimatePresence>
                {isNavOpen && (
                    <MotionBox
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        overflow="hidden"
                        bg="white"
                        shadow="xl"
                        display={{ base: 'block', lg: 'none' }}
                        borderTop="1px"
                        borderColor="gray.50"
                    >
                        <Stack spacing={0} p={4}>
                            <MobileNavLink to="/" onClick={toggleNav}>Home</MobileNavLink>
                            <MobileNavLink to="/about" onClick={toggleNav}>About Us</MobileNavLink>
                            <MobileNavLink to="/products" onClick={toggleNav}>Products</MobileNavLink>
                            <MobileNavLink to="/contact" onClick={toggleNav}>Contact</MobileNavLink>

                            <Box py={4} px={4}>
                                <FormControl mb={4}>
                                    <Input
                                        placeholder="Search products..."
                                        size="md"
                                        borderRadius="lg"
                                        bg="gray.50"
                                        value={searchTerm}
                                        onChange={handleSearch}
                                    />
                                </FormControl>

                                <Stack spacing={3}>
                                    <Button colorScheme="orange" w="full" onClick={() => { handleEnquiryClick(); toggleNav(); }}>
                                        Make Enquiry
                                    </Button>

                                    {user && user.isAdmin && (
                                        <Button as={RouterLink} to="/admin/dashboard" colorScheme="purple" w="full" onClick={toggleNav}>
                                            Admin Dashboard
                                        </Button>
                                    )}

                                    {!user ? (
                                        <Button variant="outline" w="full" onClick={() => { onRegisterOpen(); toggleNav(); }}>
                                            Admin Login
                                        </Button>
                                    ) : (
                                        <Button variant="ghost" colorScheme="red" w="full" onClick={() => { logout(); toggleNav(); navigate('/'); }}>
                                            Logout
                                        </Button>
                                    )}
                                </Stack>
                            </Box>
                        </Stack>
                    </MotionBox>
                )}
            </AnimatePresence>

            {/* Register/Login Modal */}
            <AuthModal isOpen={isRegisterOpen} onClose={onRegisterClose} />

            {/* Enquiry Drawer (Slider) */}
            <EnquiryDrawer isOpen={isEnquiryOpen} onClose={onEnquiryClose} cart={cart} />

        </Box>
    );
};

const AuthModal = ({ isOpen, onClose }) => {
    const { sendAdminOtp, verifyAdminOtp } = useAuth();
    const navigate = useNavigate();
    const toast = useToast();
    const [step, setStep] = React.useState('email'); // 'email' | 'otp'
    const [isLoading, setIsLoading] = React.useState(false);
    const [email, setEmail] = React.useState('');
    const [otp, setOtp] = React.useState('');

    const resetAndClose = () => {
        setStep('email'); setEmail(''); setOtp('');
        onClose();
    };

    const handleSendOtp = async () => {
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return toast({ title: 'Enter a valid email', status: 'error', duration: 2500 });
        }
        setIsLoading(true);
        const res = await sendAdminOtp(email);
        setIsLoading(false);

        if (res.success) {
            toast({ 
                title: '✅ OTP Sent!', 
                description: res.msg || 'Check your WhatsApp for the 4-digit code.', 
                status: 'success',
                duration: res.msg?.includes('Dev Mode') ? 6000 : 3000
            });
            setStep('otp');
        } else {
            toast({ title: 'Failed', description: res.message, status: 'error' });
        }
    };

    const handleVerifyOtp = async () => {
        if (!/^\d{4}$/.test(otp)) {
            return toast({ title: 'Enter the 4-digit OTP', status: 'error', duration: 2500 });
        }
        setIsLoading(true);
        const res = await verifyAdminOtp(email, otp);
        setIsLoading(false);

        if (res.success && res.user?.isAdmin) {
            toast({ title: `Welcome, ${res.user.name || 'Admin'}!`, status: 'success' });
            resetAndClose();
            navigate('/admin/dashboard');
        } else {
            toast({ title: 'Incorrect OTP', description: res.message || 'Try again.', status: 'error' });
            setOtp('');
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={resetAndClose} isCentered size="sm">
            <ModalOverlay backdropFilter="blur(6px)" bg="blackAlpha.400" />
            <ModalContent borderRadius="2xl" overflow="hidden" boxShadow="2xl">
                {/* Header bar */}
                <Box bg="blue.700" px={6} py={4}>
                    <Text fontWeight="800" color="white" fontSize="lg">🔐 Admin Login</Text>
                    <Text fontSize="xs" color="blue.200" mt={1}>
                        {step === 'email' ? 'Enter your admin email to receive an OTP on WhatsApp.' : `Enter the OTP sent to your phone for ${email}`}
                    </Text>
                </Box>
                <ModalCloseButton color="white" top={3} right={3} />

                <Box p={6}>
                    {step === 'email' && (
                        <Stack spacing={4}>
                            <FormControl isRequired>
                                <FormLabel fontSize="sm" fontWeight="700" color="gray.700">Admin Email</FormLabel>
                                <Input
                                    type="email"
                                    placeholder="admin@uniqueengineering.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSendOtp()}
                                    size="lg"
                                    borderRadius="xl"
                                    focusBorderColor="blue.500"
                                />
                            </FormControl>
                            <Button
                                colorScheme="blue" w="full" size="lg" borderRadius="xl"
                                isLoading={isLoading} loadingText="Checking..."
                                onClick={handleSendOtp}
                            >
                                Send OTP
                            </Button>
                        </Stack>
                    )}

                    {step === 'otp' && (
                        <Stack spacing={4}>
                            <Box p={3} bg="blue.50" borderRadius="lg" border="1px solid" borderColor="blue.100">
                                <Text fontSize="xs" color="blue.700" fontWeight="700">OTP sent to WhatsApp</Text>
                                <Text fontSize="xs" color="gray.600" mt={0.5}>Check the WhatsApp linked to your admin account. (OTP also in backend console if WhatsApp offline)</Text>
                            </Box>
                            <FormControl isRequired>
                                <FormLabel fontSize="sm" fontWeight="700" color="gray.700">4-Digit OTP</FormLabel>
                                <Input
                                    placeholder="• • • •"
                                    maxLength={4}
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                    onKeyDown={(e) => e.key === 'Enter' && handleVerifyOtp()}
                                    letterSpacing="0.5em"
                                    fontSize="2xl"
                                    textAlign="center"
                                    size="lg"
                                    borderRadius="xl"
                                    focusBorderColor="green.500"
                                />
                            </FormControl>
                            <Button
                                colorScheme="green" w="full" size="lg" borderRadius="xl"
                                isLoading={isLoading} loadingText="Verifying..."
                                onClick={handleVerifyOtp}
                            >
                                Verify & Enter Panel
                            </Button>
                            <Button variant="ghost" size="sm" colorScheme="blue" onClick={() => { setStep('email'); setOtp(''); }}>
                                ← Use different email
                            </Button>
                        </Stack>
                    )}
                </Box>
            </ModalContent>
        </Modal>
    );
}

// Helper for images
const getImageUrl = (path) => {
    if (!path) return 'https://via.placeholder.com/150';
    if (path.startsWith('http')) return path;
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
    return `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
};

const EnquiryDrawer = ({ isOpen, onClose, cart = [] }) => {
    const toast = useToast();
    const { clearCart, removeFromCart, updateQuantity } = useCart();
    const { user, phoneLogin, phoneRegister, sendOtp, verifyOtp } = useAuth();
    const navigate = useNavigate();

    const [isSending, setIsSending] = React.useState(false);
    const [isCheckingPhone, setIsCheckingPhone] = React.useState(false);

    const [authStep, setAuthStep] = React.useState('phone'); // 'phone' | 'otp' | 'register'
    const [phoneInput, setPhoneInput] = React.useState('');
    const [otpInput, setOtpInput] = React.useState('');

    const [adminClientStatus, setAdminClientStatus] = React.useState('none'); // 'none' | 'found' | 'notfound'
    const [showFullAdminForm, setShowFullAdminForm] = React.useState(false);

    const [formData, setFormData] = React.useState({
        companyName: '',
        contactPersonName: '',
        email: '',
        gstNumber: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const safeCart = Array.isArray(cart) ? cart : [];

    // Auto-fill for admin mode when phone number is entered
    React.useEffect(() => {
        const fetchUserData = async () => {
            const cleanPhone = phoneInput.replace(/\D/g, '');
            // Only auto-fill if Admin is logged in and phone is exactly 10 digits
            if (user?.isAdmin && cleanPhone.length === 10) {
                setIsCheckingPhone(true);
                try {
                    const res = await api.get(`/auth/phone/${cleanPhone}`);
                    if (res.data) {
                        const userData = res.data;
                        const hasEmail = !!userData.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email);
                        setFormData({
                            companyName: userData.companyName || '',
                            contactPersonName: userData.contactPersonName || userData.name || '',
                            email: userData.email || '',
                            gstNumber: userData.gstNumber || ''
                        });
                        setAdminClientStatus('found');
                        // Force show form if critical details like email are missing
                        if (!hasEmail) {
                            setShowFullAdminForm(true);
                            toast({
                                title: "Incomplete Details",
                                description: "This client is missing an email address. Please provide it before submitting.",
                                status: "warning",
                                duration: 4000,
                                isClosable: true
                            });
                        } else {
                            setShowFullAdminForm(false);
                            toast({
                                title: "Client Details Loaded",
                                description: `Ready to submit for ${userData.contactPersonName || userData.companyName}`,
                                status: "success",
                                duration: 2000,
                                position: "top"
                            });
                        }
                    }
                } catch (err) {
                    if (err.response?.status === 404) {
                        setAdminClientStatus('notfound');
                        setShowFullAdminForm(true);
                        setFormData({ companyName: '', contactPersonName: '', email: '', gstNumber: '' });
                    }
                } finally {
                    setIsCheckingPhone(false);
                }
            } else if (user?.isAdmin && cleanPhone.length < 10) {
                setAdminClientStatus('none');
                setShowFullAdminForm(false);
            }
        };
        fetchUserData();
    }, [phoneInput, user?.isAdmin]);

    const submitEnquiry = async (caller) => {
        setIsSending(true);
        try {
            // Priority Check: If admin is logged in, use formData + phoneInput instead of admin profile details.
            // If normal user, use their profile.
            const isAdm = caller && caller.isAdmin;

            const finalCompanyName = isAdm ? formData.companyName : (caller.companyName || 'Guest');
            const finalContactPerson = isAdm ? formData.contactPersonName : (caller.name || caller.contactPersonName || 'Guest');
            const finalPhone = isAdm ? phoneInput : (caller.phone || phoneInput || 'N/A');
            const finalEmail = isAdm ? formData.email : (caller.email || 'N/A');
            const finalGst = isAdm ? formData.gstNumber : (caller.gstNumber || '');

            const enquiryData = {
                companyName: finalCompanyName,
                contactPersonName: finalContactPerson,
                phone: finalPhone,
                email: finalEmail,
                gstNumber: finalGst,
                products: safeCart.map(item => {
                    const product = item.productId || item.product || {};
                    return {
                        productId: product._id || product.id,
                        quantity: Number(item.quantity) || 1
                    };
                }),
                status: 'Pending',
                type: 'enquiry',
                sessionId: localStorage.getItem('sessionId') || ''
            };

            await api.post('/enquiries', enquiryData);
            toast({ title: `Enquiry Sent!`, description: "Thank you! We will get back to you shortly.", status: "success" });

            await clearCart();
            onClose();

            // Reset localized states
            setAuthStep('phone');
            setPhoneInput('');
            setFormData({ companyName: '', contactPersonName: '', email: '', gstNumber: '' });

            navigate('/products');
        } catch (error) {
            console.error(error);
            toast({ title: "Failed", description: "Could not send request.", status: "error" });
        } finally {
            setIsSending(false);
        }
    };

    const handlePhoneNext = async () => {
        if (!/^\d{10,}$/.test(phoneInput.replace(/\D/g, ''))) {
            return toast({ title: "Validation Error", description: "Please enter a valid 10-digit phone number.", status: "error" });
        }

        setIsCheckingPhone(true);
        const res = await sendOtp(phoneInput);
        setIsCheckingPhone(false);

        if (res.success) {
            toast({ title: "OTP Sent", description: "Verification code sent to your WhatsApp!", status: "success" });
            setAuthStep('otp');
        } else {
            if (res.status === 404) {
                toast({ title: "Registration", description: "Welcome! Please enter your details below.", status: "success" });
                setAuthStep('register');
            } else {
                toast({ title: "Failed", description: res.message || "Could not send OTP", status: "error" });
            }
        }
    };

    const handleVerifyOtp = async () => {
        if (!/^\d{4,6}$/.test(otpInput.replace(/\D/g, ''))) {
            return toast({ title: "Validation Error", description: "Please enter a valid OTP code.", status: "error" });
        }

        setIsCheckingPhone(true);
        const res = await verifyOtp(phoneInput, otpInput);
        setIsCheckingPhone(false);

        if (res.success) {
            toast({ title: "Verified", description: "Login successful!", status: "success" });
            if (!res.user || (!res.user.companyName && !res.user.contactPersonName)) {
                setAuthStep('register');
            }
        } else {
            toast({ title: "Verification Failed", description: res.message, status: "error" });
        }
    };

    const handleAction = async (e) => {
        e.preventDefault();

        if (user && !user.isAdmin) {
            // Already logged in as a normal user, submit using profile
            await submitEnquiry(user);
        } else if (user && user.isAdmin) {
            // Admin is logged in, they must provide client details
            const cleanPhone = phoneInput.replace(/\D/g, '');
            if (cleanPhone.length < 10) {
                return toast({ title: "Validation Error", description: "Please enter a valid 10-digit phone number.", status: "error" });
            }
            if (!formData.companyName.trim() && !formData.contactPersonName.trim()) {
                setShowFullAdminForm(true);
                return toast({ title: "Validation Error", description: "Either Company Name or Contact Person Name is required.", status: "error" });
            }
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
                setShowFullAdminForm(true);
                return toast({ title: "Validation Error", description: "A valid email address is required for enquiry submission.", status: "error" });
            }
            await submitEnquiry(user);
        } else if (authStep === 'phone') {
            await handlePhoneNext();
        } else if (authStep === 'otp') {
            await handleVerifyOtp();
        } else if (authStep === 'register') {
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
                return toast({ title: "Validation Error", description: "Please enter a valid email address.", status: "error" });
            }

            // --- Pre-validate for Admin Keywords (Generic check) ---
            const lowerEmail = formData.email.toLowerCase();
            if (lowerEmail.includes('uniqueengineering93@gmail.com') || lowerEmail.includes('iatulkanak@gmail.com')) {
                return toast({ title: "Restricted", description: "This administrative email cannot be used for client enquiries.", status: "error" });
            }

            setIsSending(true);
            const res = await phoneRegister({ phone: phoneInput, ...formData });
            if (res.success) {
                await submitEnquiry(res.user);
            } else {
                setIsSending(false);
                const isEmailErr = res.message?.toLowerCase().includes('admin') || res.message?.toLowerCase().includes('associated');
                toast({ 
                    title: isEmailErr ? "Registration Restricted" : "Registration Failed", 
                    description: res.message, 
                    status: "error" 
                });
            }
        }
    };

    return (
        <Drawer isOpen={isOpen} placement="right" onClose={onClose} size={{ base: 'full', md: 'md' }}>
            <DrawerOverlay />
            <DrawerContent>
                <DrawerCloseButton />
                <DrawerHeader borderBottomWidth="1px">Your Enquiry Cart</DrawerHeader>

                <DrawerBody>
                    {safeCart.length === 0 ? (
                        <Flex h="100%" justify="center" align="center" direction="column" color="gray.500">
                            <FaShoppingCart size="40px" />
                            <Text mt={4}>Your cart is empty</Text>
                            <Button mt={4} variant="link" colorScheme="orange" onClick={onClose}>Browse Products</Button>
                        </Flex>
                    ) : (
                        <Stack spacing={4}>
                            {safeCart.map((item, idx) => {
                                let product = item;
                                if (item.productId && typeof item.productId === 'object') {
                                    product = item.productId;
                                } else if (item.product && typeof item.product === 'object') {
                                    product = item.product;
                                }
                                const mainImage = product.images?.[0] || product.photos?.[0] || null;

                                return (
                                    <Box key={idx} p={4} borderWidth="1px" borderRadius="lg" bg="gray.50">
                                        <Flex justify="space-between" align="center" gap={4}>
                                            <Image
                                                src={getImageUrl(mainImage)}
                                                boxSize="60px"
                                                objectFit="contain"
                                                borderRadius="md"
                                                bg="white"
                                                fallbackSrc="https://via.placeholder.com/60"
                                            />
                                            <Box flex="1">
                                                <Text fontWeight="bold" noOfLines={1}>{product.name}</Text>
                                                <Flex align="center" gap={2} mt={1}>
                                                    <Text fontSize="sm" color="gray.600">Qty:</Text>
                                                    <Input
                                                        type="number"
                                                        size="sm"
                                                        w="70px"
                                                        min={1}
                                                        value={item.quantity === '' ? '' : (item.quantity || 1)}
                                                        onChange={(e) => updateQuantity(product._id || product.id, e.target.value)}
                                                        onBlur={(e) => {
                                                            if (!e.target.value || parseInt(e.target.value) < 1) {
                                                                updateQuantity(product._id || product.id, 1);
                                                            }
                                                        }}
                                                    />
                                                </Flex>
                                            </Box>
                                            <IconButton
                                                icon={<FaTrash />}
                                                aria-label="Remove Item"
                                                size="sm"
                                                colorScheme="red"
                                                variant="ghost"
                                                onClick={() => removeFromCart(item._id || item.id)}
                                            />
                                        </Flex>
                                    </Box>
                                )
                            })}

                            <Box mt={6} as="form" id="enquiry-form" onSubmit={handleAction}>
                                <Text fontWeight="bold" fontSize="lg" mb={4} borderBottom="2px" borderColor="brand.500" display="inline-block">
                                    {user ? "Your Details" : "Verify & Send"}
                                </Text>

                                {user && !user.isAdmin ? (
                                    <Box p={4} borderWidth="1px" borderRadius="md" bg="green.50">
                                        <Text fontWeight="bold" color="green.700" mb={1}>Logged in successfully!</Text>
                                        <Text fontSize="sm"><b>Name:</b> {user.name || user.contactPersonName || user.companyName}</Text>
                                        <Text fontSize="sm"><b>Phone:</b> {user.phone}</Text>
                                        <Text fontSize="xs" color="gray.500" mt={2}>You can now submit your enquiry securely.</Text>
                                    </Box>
                                ) : (user && user.isAdmin) ? (
                                    <Stack spacing={3}>
                                        <Box p={3} bg="purple.50" borderRadius="md" border="1px" borderColor="purple.200">
                                            <Text fontSize="sm" fontWeight="bold" color="purple.700">Admin Mode</Text>
                                            <Text fontSize="xs" color="purple.600">Enter client mobile to find or add them.</Text>
                                        </Box>
                                        <FormControl isRequired>
                                            <FormLabel fontSize="sm" mb={1}>Client Phone Number</FormLabel>
                                            <Input size="sm" type="tel" placeholder="9876543210" value={phoneInput} onChange={(e) => setPhoneInput(e.target.value)} />
                                        </FormControl>

                                        {adminClientStatus === 'found' && !showFullAdminForm && (
                                            <Box p={4} bg="green.50" borderRadius="xl" border="2px dashed" borderColor="green.300" textAlign="center">
                                                <Text fontWeight="bold" color="green.800" fontSize="md">Ready to Submit</Text>
                                                <Text fontSize="sm" mt={1}>Client: <b>{formData.companyName || formData.contactPersonName}</b></Text>
                                                <Text fontSize="xs" color="gray.600">{formData.email}</Text>
                                                <Button size="xs" variant="link" colorScheme="blue" mt={2} onClick={() => setShowFullAdminForm(true)}>Update Details</Button>
                                            </Box>
                                        )}

                                        {adminClientStatus === 'notfound' && (
                                            <Box p={2} bg="orange.50" borderRadius="md" border="1px" borderColor="orange.200">
                                                <Text fontSize="xs" fontWeight="bold" color="orange.800">New Client - Please register below</Text>
                                            </Box>
                                        )}

                                        {(showFullAdminForm || (adminClientStatus === 'notfound' && phoneInput.length >= 10)) && (
                                            <Stack spacing={3} p={2} borderLeft="2px" borderColor="purple.100" ml={1}>
                                                <FormControl>
                                                    <FormLabel fontSize="sm" mb={1}>Client Company Name</FormLabel>
                                                    <Input size="sm" placeholder="e.g. Unique Engineering" name="companyName" value={formData.companyName} onChange={handleChange} />
                                                </FormControl>
                                                <FormControl>
                                                    <FormLabel fontSize="sm" mb={1}>Client Contact Person</FormLabel>
                                                    <Input size="sm" placeholder="e.g. John Doe" name="contactPersonName" value={formData.contactPersonName} onChange={handleChange} />
                                                </FormControl>
                                                <FormControl isRequired>
                                                    <FormLabel fontSize="sm" mb={1}>Client Email Address</FormLabel>
                                                    <Input size="sm" type="email" name="email" placeholder="client@company.com" value={formData.email} onChange={handleChange} />
                                                </FormControl>
                                                <FormControl>
                                                    <FormLabel fontSize="sm" mb={1}>Client GST Number (Optional)</FormLabel>
                                                    <Input size="sm" name="gstNumber" placeholder="22AAAAA0000A1Z5" value={formData.gstNumber} onChange={handleChange} />
                                                </FormControl>
                                            </Stack>
                                        )}
                                    </Stack>
                                ) : authStep === 'phone' ? (
                                    <Stack spacing={3}>
                                        <Text fontSize="sm" color="gray.600">Please enter your phone number to receive a verification OTP on WhatsApp.</Text>
                                        <FormControl isRequired>
                                            <FormLabel fontSize="sm" mb={1}>Phone Number</FormLabel>
                                            <Input size="md" type="tel" placeholder="9876543210" value={phoneInput} onChange={(e) => setPhoneInput(e.target.value)} />
                                        </FormControl>
                                    </Stack>
                                ) : authStep === 'otp' ? (
                                    <Stack spacing={3}>
                                        <Text fontSize="sm" color="gray.600">We have sent a verification code to WhatsApp number **{phoneInput}**.</Text>
                                        <FormControl isRequired>
                                            <FormLabel fontSize="sm" mb={1}>Enter 4-Digit OTP</FormLabel>
                                            <Input size="md" placeholder="1234" maxLength={4} value={otpInput} onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))} />
                                        </FormControl>
                                        <Button size="xs" variant="link" colorScheme="blue" alignSelf="flex-start" onClick={handlePhoneNext}>Resend OTP</Button>
                                    </Stack>
                                ) : (
                                    <Stack spacing={3}>
                                        <Box p={3} bg="blue.50" borderRadius="md" mb={2}>
                                            <Text fontSize="sm" fontWeight="bold">New Number Detected</Text>
                                            <Text fontSize="xs">Please complete a one-time registration for {phoneInput}</Text>
                                        </Box>
                                        <FormControl isRequired>
                                            <FormLabel fontSize="sm" mb={1}>Phone Number</FormLabel>
                                            <Input size="sm" bg="gray.50" value={phoneInput} isReadOnly />
                                        </FormControl>
                                        <FormControl>
                                            <FormLabel fontSize="sm" mb={1}>Company Name</FormLabel>
                                            <Input size="sm" placeholder="e.g. Unique Engineering" name="companyName" value={formData.companyName} onChange={handleChange} />
                                        </FormControl>

                                        <FormControl>
                                            <FormLabel fontSize="sm" mb={1}>Contact Person Name</FormLabel>
                                            <Input size="sm" placeholder="e.g. John Doe" name="contactPersonName" value={formData.contactPersonName} onChange={handleChange} />
                                        </FormControl>

                                        <FormControl isRequired>
                                            <FormLabel fontSize="sm" mb={1}>Email Address</FormLabel>
                                            <Input size="sm" type="email" name="email" placeholder="you@company.com" value={formData.email} onChange={handleChange} />
                                        </FormControl>

                                        <FormControl>
                                            <FormLabel fontSize="sm" mb={1}>GST Number (Optional)</FormLabel>
                                            <Input size="sm" name="gstNumber" placeholder="22AAAAA0000A1Z5" value={formData.gstNumber} onChange={handleChange} />
                                        </FormControl>
                                    </Stack>
                                )}
                            </Box>
                        </Stack>
                    )}
                </DrawerBody>

                {safeCart.length > 0 && (
                    <DrawerFooter borderTopWidth="1px">
                        <Stack w="100%" spacing={3}>
                            <Button
                                colorScheme="blue"
                                size="lg"
                                w="full"
                                type="submit"
                                form="enquiry-form"
                                isLoading={isCheckingPhone || isSending}
                                loadingText={isCheckingPhone ? 'Checking...' : 'Sending...'}
                            >
                                {user ? 'Submit Enquiry' : authStep === 'phone' ? 'Verify & Continue' : authStep === 'otp' ? 'Validate OTP' : 'Register & Submit'}
                            </Button>
                        </Stack>
                    </DrawerFooter>
                )}
            </DrawerContent>
        </Drawer>
    )
}

export default Header;
