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
                    <Button colorScheme="orange" variant="accent" size="sm" onClick={handleEnquiryClick}>
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
    const { login, register } = useAuth();
    const navigate = useNavigate();
    const toast = useToast();
    const [mode, setMode] = React.useState('login');
    const [isLoading, setIsLoading] = React.useState(false);

    const [formData, setFormData] = React.useState({
        name: '', email: '', password: '', contact: ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleRegister = async () => {
        if (!formData.name || !formData.email || !formData.password || !formData.contact) {
            toast({ title: "Please fill all fields", status: "error" });
            return;
        }
        setIsLoading(true);
        const res = await register(formData.name, formData.email, formData.password, formData.contact);
        setIsLoading(false);

        if (res.success) {
            toast({ title: "Registration Successful!", description: "Please login with your credentials.", status: "success" });
            setMode('login');
            setFormData(prev => ({ ...prev, password: '' }));
        } else {
            toast({ title: "Registration Failed", description: res.message, status: "error" });
        }
    };

    const handleLogin = async () => {
        if (!formData.email || !formData.password) {
            toast({ title: "Please enter email and password", status: "error" });
            return;
        }
        setIsLoading(true);
        const res = await login(formData.email, formData.password);
        setIsLoading(false);

        if (res.success) {
            toast({ title: "Logged in successfully", status: "success" });
            onClose();
            setFormData({ name: '', email: '', password: '', contact: '' });

            // Check if user is admin and redirect
            const storedUser = JSON.parse(localStorage.getItem('user'));
            if (storedUser && storedUser.isAdmin) {
                navigate('/admin/dashboard');
            }
        } else {
            toast({ title: "Login Failed", description: res.message, status: "error" });
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} isCentered>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>{mode === 'login' ? 'Login' : 'Create Account'}</ModalHeader>
                <ModalCloseButton />
                <form onSubmit={(e) => { e.preventDefault(); mode === 'login' ? handleLogin() : handleRegister(); }}>
                    <ModalBody pb={6}>
                        <Stack spacing={4}>
                            {mode === 'register' && (
                                <>
                                    <FormControl isRequired>
                                        <FormLabel>Full Name</FormLabel>
                                        <Input name="name" placeholder="Enter your name" value={formData.name} onChange={handleInputChange} />
                                    </FormControl>
                                    <FormControl isRequired>
                                        <FormLabel>Contact Number</FormLabel>
                                        <Input name="contact" placeholder="Enter contact number" value={formData.contact} onChange={handleInputChange} />
                                    </FormControl>
                                </>
                            )}
                            <FormControl isRequired>
                                <FormLabel>Email Address</FormLabel>
                                <Input name="email" type="email" placeholder="Enter your email" value={formData.email} onChange={handleInputChange} />
                            </FormControl>
                            <FormControl isRequired>
                                <FormLabel>Password</FormLabel>
                                <Input name="password" type="password" placeholder="Enter password" value={formData.password} onChange={handleInputChange} />
                            </FormControl>
                            <Button type="submit" colorScheme="blue" width="full" mt={4} isLoading={isLoading}>
                                {mode === 'login' ? 'Login' : 'Register'}
                            </Button>
                            <Text fontSize="sm" textAlign="center" color="gray.600">
                                {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
                                <Button variant="link" colorScheme="orange" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
                                    {mode === 'login' ? 'Register' : 'Login'}
                                </Button>
                            </Text>
                        </Stack>
                    </ModalBody>
                </form>
            </ModalContent>
        </Modal>
    )
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
    const { user, phoneLogin, phoneRegister } = useAuth();
    const navigate = useNavigate();

    const [isSending, setIsSending] = React.useState(false);
    const [isCheckingPhone, setIsCheckingPhone] = React.useState(false);

    const [authStep, setAuthStep] = React.useState('phone'); // 'phone' | 'register'
    const [phoneInput, setPhoneInput] = React.useState('');

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

    const submitEnquiry = async (currentUser) => {
        setIsSending(true);
        try {
            const enquiryData = {
                companyName: currentUser.companyName || 'Guest',
                contactPersonName: currentUser.name || currentUser.contactPersonName || 'Guest',
                phone: currentUser.phone || phoneInput || 'N/A',
                email: currentUser.email || 'N/A',
                gstNumber: currentUser.gstNumber || '',
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
            return toast({ title: "Validation Error", description: "Please enter a valid phone number.", status: "error" });
        }

        setIsCheckingPhone(true);
        const res = await phoneLogin(phoneInput);
        setIsCheckingPhone(false);

        if (res.success) {
            toast({ title: "Verified", description: "Welcome back!", status: "success" });
            // By state rules, user is now truthy, UI flips to submit state
        } else {
            if (res.status === 404) {
                // Not found, so we move to register step
                setAuthStep('register');
            } else {
                toast({ title: "Login Failed", description: res.message, status: "error" });
            }
        }
    };

    const handleAction = async (e) => {
        e.preventDefault();

        if (user) {
            // Already logged in
            await submitEnquiry(user);
        } else if (authStep === 'phone') {
            await handlePhoneNext();
        } else if (authStep === 'register') {
            if (!formData.companyName.trim() && !formData.contactPersonName.trim()) {
                return toast({ title: "Validation Error", description: "Either Company Name or Contact Person Name is required.", status: "error" });
            }
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
                return toast({ title: "Validation Error", description: "Please enter a valid email address.", status: "error" });
            }

            setIsSending(true);
            const res = await phoneRegister({ phone: phoneInput, ...formData });
            if (res.success) {
                await submitEnquiry(res.user);
            } else {
                setIsSending(false);
                toast({ title: "Registration Failed", description: res.message, status: "error" });
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

                                {user ? (
                                    <Box p={4} borderWidth="1px" borderRadius="md" bg="green.50">
                                        <Text fontWeight="bold" color="green.700" mb={1}>Logged in successfully!</Text>
                                        <Text fontSize="sm"><b>Name:</b> {user.name || user.contactPersonName || user.companyName}</Text>
                                        <Text fontSize="sm"><b>Phone:</b> {user.phone}</Text>
                                        <Text fontSize="xs" color="gray.500" mt={2}>You can now submit your enquiry securely.</Text>
                                    </Box>
                                ) : authStep === 'phone' ? (
                                    <Stack spacing={3}>
                                        <Text fontSize="sm" color="gray.600">Please enter your phone number to login or register and send this enquiry.</Text>
                                        <FormControl isRequired>
                                            <FormLabel fontSize="sm" mb={1}>Phone Number</FormLabel>
                                            <Input size="md" type="tel" placeholder="9876543210" value={phoneInput} onChange={(e) => setPhoneInput(e.target.value)} />
                                        </FormControl>
                                    </Stack>
                                ) : (
                                    <Stack spacing={3}>
                                        <Box p={3} bg="blue.50" borderRadius="md" mb={2}>
                                            <Text fontSize="sm" fontWeight="bold">New Number Detected</Text>
                                            <Text fontSize="xs">Please complete a one-time registration for {phoneInput}</Text>
                                        </Box>
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
                                {user ? 'Submit Enquiry' : authStep === 'phone' ? 'Verify & Continue' : 'Register & Submit'}
                            </Button>
                        </Stack>
                    </DrawerFooter>
                )}
            </DrawerContent>
        </Drawer>
    )
}

export default Header;
