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
import api from '../api/axios';

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
        if (!user) {
            onRegisterOpen();
        } else {
            if (cart.length > 0) {
                onEnquiryOpen();
            } else {
                navigate('/products');
            }
        }
    };

    return (
        <Box bg="white" boxShadow="md" position="sticky" top="0" zIndex="1000">
            {/* Top Bar for Contact Info */}
            <Box bg="brand.900" color="gray.300" py={2} px={8} fontSize="sm">
                <Flex justify="space-between" align="center" direction={{ base: 'column', md: 'row' }}>
                    <Flex gap={6}>
                        <Flex align="center" gap={2}>
                            <FaEnvelope /> <Text>contact@uniqueengineering.co</Text>
                        </Flex>
                        <Flex align="center" gap={2}>
                            <FaPhone /> <Text>+91 98765 43210</Text>
                        </Flex>
                    </Flex>
                    <Text>GST: 22AAAAA0000A1Z5</Text>
                </Flex>
            </Box>

            {/* Main Navbar */}
            <Flex py={4} px={8} justify="space-between" align="center">
                {/* Logo Section */}
                <Flex align="center" gap={4} as={RouterLink} to="/">
                    <Box w="50px" h="50px" bg="brand.500" borderRadius="md" display="flex" alignItems="center" justifyContent="center" color="white" fontWeight="bold">
                        UE
                    </Box>
                    <Box>
                        <Text fontSize="2xl" fontWeight="bold" color="brand.700" lineHeight="1">
                            Unique Engineering
                        </Text>
                        <Text fontSize="xs" color="gray.500" letterSpacing="widest">
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

                {/* Actions */}
                <Flex gap={4} align="center">
                    {/* Search Bar */}
                    <Box display={{ base: 'none', md: 'block' }}>
                        <FormControl>
                            <Input
                                placeholder="Search..."
                                size="sm"
                                borderRadius="full"
                                bg="gray.100"
                                border="none"
                                _focus={{ bg: "white", boxShadow: "outline" }}
                                value={searchTerm}
                                onChange={handleSearch}
                                width="200px"
                            />
                        </FormControl>
                    </Box>

                    {user && user.isAdmin && (
                        <Button as={RouterLink} to="/admin/dashboard" colorScheme="purple" size="sm">
                            Admin Panel
                        </Button>
                    )}
                    {user && (
                        <Button as={RouterLink} to="/products" variant="ghost" leftIcon={<FaShoppingCart />}>
                            Cart ({cart.length})
                        </Button>
                    )}
                    <Button colorScheme="orange" variant="accent" onClick={handleEnquiryClick}>
                        Make Enquiry
                    </Button>
                    {!user ? (
                        <Button variant="outline" onClick={onRegisterOpen}>Login</Button>
                    ) : (
                        <Flex align="center" gap={4}>
                            <Text fontWeight="bold" color="brand.600">Hi, {user.name}</Text>
                            <Button size="sm" variant="ghost" colorScheme="red" onClick={() => {
                                logout();
                                navigate('/');
                            }}>Logout</Button>
                        </Flex>
                    )}
                </Flex>
                {/* Mobile Menu Button */}
                <IconButton
                    display={{ base: 'flex', md: 'none' }}
                    icon={<FaBars />}
                    onClick={toggleNav}
                    variant="ghost"
                    aria-label="Open Navigation"
                    ml={2}
                />
            </Flex>

            {/* Mobile Navigation Dropdown */}
            {isNavOpen && (
                <Box bg="white" shadow="md" display={{ base: 'block', md: 'none' }} p={4}>
                    <Stack spacing={4}>
                        <RouterLink to="/" onClick={toggleNav}>Home</RouterLink>
                        <RouterLink to="/about" onClick={toggleNav}>About Us</RouterLink>
                        <RouterLink to="/products" onClick={toggleNav}>Products</RouterLink>
                        <RouterLink to="/contact" onClick={toggleNav}>Contact</RouterLink>
                    </Stack>
                </Box>
            )}

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
    const { clearCart, removeFromCart } = useCart();
    const { user } = useAuth();
    const [isSending, setIsSending] = React.useState(false);

    // Ensure cart is an array
    const safeCart = Array.isArray(cart) ? cart : [];

    const handleAction = async (type) => {
        setIsSending(true);
        const title = type === 'quotation' ? 'Formal Quotation Request' : 'General Enquiry';

        try {
            if (type === 'quotation') {
                // Quotation: Send HTML Content (Legacy/User Schema)
                const tableRows = safeCart.map(item => {
                    const product = item.productId || item.product || {};
                    return `
                    <tr>
                        <td style="border: 1px solid #ddd; padding: 8px;">${product.name || 'Unknown Product'}</td>
                        <td style="border: 1px solid #ddd; padding: 8px;">${item.quantity || 1}</td>
                    </tr>`;
                }).join('');

                const htmlContent = `
                    <h2>Quotation Request from ${user?.name}</h2>
                    <p>Email: ${user?.email}</p>
                    <p>Contact: ${user?.contact}</p>
                    <h3>Items:</h3>
                    <table style="width:100%; border-collapse: collapse;">
                        <thead>
                            <tr>
                                <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Product</th>
                                <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Quantity</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${tableRows}
                        </tbody>
                    </table>
                `;

                // Post strictly htmlContent as per user's QuotationSchema
                await api.post('/quotations', { htmlContent });

            } else {
                // Enquiry: Send Structured Data (New Schema)
                const enquiryData = {
                    Name: user?.name || 'Guest',
                    phone: user?.phone || user?.contact || 'N/A',
                    email: user?.email,
                    products: safeCart.map(item => {
                        const product = item.productId || item.product || {};
                        return {
                            productId: product._id || product.id,
                            quantity: item.quantity || 1
                        };
                    }),
                    status: 'Pending',
                    type: 'enquiry'
                };
                await api.post('/enquiries', enquiryData);
            }

            toast({ title: `${title} Sent!`, description: "Request received.", status: "success" });
            clearCart();
            onClose();
        } catch (error) {
            console.error(error);
            toast({ title: "Failed", description: "Could not send request.", status: "error" });
        } finally {
            setIsSending(false);
        }
    }

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
                                const product = item.product || item;
                                const mainImage = product.images?.[0] || product.photos?.[0] || null;

                                return (
                                    <Box key={idx} p={4} borderWidth="1px" borderRadius="lg" bg="gray.50">
                                        <Flex justify="space-between" align="center" gap={4}>
                                            <Image
                                                src={getImageUrl(mainImage)}
                                                boxSize="60px"
                                                objectFit="cover"
                                                borderRadius="md"
                                                fallbackSrc="https://via.placeholder.com/60"
                                            />
                                            <Box flex="1">
                                                <Text fontWeight="bold" noOfLines={1}>{product.name}</Text>
                                                <Text fontSize="sm" color="gray.600">Quantity: {item.quantity || 1}</Text>
                                            </Box>
                                            <IconButton
                                                icon={<FaTrash />}
                                                aria-label="Remove Item"
                                                size="sm"
                                                colorScheme="red"
                                                variant="ghost"
                                                onClick={() => removeFromCart(item._id || item.id)} // Prefer _id
                                            />
                                        </Flex>
                                    </Box>
                                )
                            })}
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
                                onClick={() => handleAction('enquiry')}
                                isLoading={isSending}
                            >
                                Make Enquiry
                            </Button>
                        </Stack>
                    </DrawerFooter>
                )}
            </DrawerContent>
        </Drawer>
    )
}

export default Header;
