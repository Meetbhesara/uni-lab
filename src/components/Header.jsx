import React, { useState } from 'react';
import {
    Box, Flex, Text, Button, Stack, useDisclosure, Badge,
    Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton,
    Drawer, DrawerBody, DrawerFooter, DrawerHeader, DrawerOverlay, DrawerContent, DrawerCloseButton,
    FormControl, FormLabel, Input, useToast, Image, IconButton, Divider, VStack, Textarea,
    Tooltip, HStack, Link,
    Menu, MenuButton, MenuList, MenuItem, MenuDivider,
    InputGroup, InputLeftAddon, InputLeftElement, InputRightElement, Alert, AlertIcon, AlertDescription
} from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { FaPhone, FaEnvelope, FaShoppingCart, FaTrash, FaBars, FaSearch, FaYoutube, FaInstagram } from 'react-icons/fa';
import {
    FiMoreVertical, FiLogIn, FiLogOut, FiShield, FiUser, FiLock,
    FiPhone, FiMail, FiCheckCircle, FiEye, FiEyeOff, FiArrowLeft, FiKey, FiGrid,
    FiBriefcase, FiMapPin, FiFileText
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';

// Social Media Links
export const SOCIAL_LINKS = {
    youtube: 'https://www.youtube.com/@UECIVIL', // Official YouTube channel URL
    instagram: '',                              // Leave empty until official link is provided
};

const MotionBox = motion.create(Box);

// Social Media Header Icon with rich branded hover states & micro-interactions
const SocialHeaderIcon = ({ platform, href, isDark = false, size = "28px" }) => {
    const isYoutube = platform === 'youtube';
    const label = isYoutube ? 'Watch on YouTube' : 'Follow on Instagram';
    const IconComponent = isYoutube ? FaYoutube : FaInstagram;
    
    // Official Branding Colors
    const ytBrand = "#FF0000";
    const igGradient = "radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)";

    if (isDark) {
        return (
            <Tooltip label={label} hasArrow placement="bottom" bg="gray.800" color="white" fontSize="xs" borderRadius="md">
                <Link
                    href={href}
                    isExternal
                    aria-label={label}
                    title={label}
                    display="inline-flex"
                    alignItems="center"
                    justifyContent="center"
                    w={size}
                    h={size}
                    borderRadius="full"
                    bg={isYoutube ? "rgba(255, 0, 0, 0.18)" : "rgba(225, 48, 108, 0.18)"}
                    color={isYoutube ? "#FF4D4D" : "#FF6584"}
                    border="1px solid"
                    borderColor={isYoutube ? "rgba(255, 77, 77, 0.45)" : "rgba(255, 101, 132, 0.45)"}
                    transition="all 0.25s cubic-bezier(0.4, 0, 0.2, 1)"
                    _hover={{
                        bg: isYoutube ? ytBrand : igGradient,
                        color: "white",
                        borderColor: "transparent",
                        transform: "translateY(-2px) scale(1.12)",
                        boxShadow: isYoutube 
                            ? "0 4px 14px rgba(255, 0, 0, 0.6)" 
                            : "0 4px 14px rgba(225, 48, 108, 0.6)"
                    }}
                    _active={{
                        transform: "scale(0.95)"
                    }}
                >
                    <IconComponent size={parseInt(size) > 28 ? "16px" : "14px"} />
                </Link>
            </Tooltip>
        );
    }

    return (
        <Tooltip label={label} hasArrow placement="bottom" bg="gray.800" color="white" fontSize="xs" borderRadius="md">
            <Link
                href={href}
                isExternal
                aria-label={label}
                title={label}
                display="inline-flex"
                alignItems="center"
                justifyContent="center"
                w={size}
                h={size}
                borderRadius="full"
                bg={isYoutube ? "red.50" : "pink.50"}
                color={isYoutube ? "#FF0000" : "#E4405F"}
                border="1px solid"
                borderColor={isYoutube ? "red.200" : "pink.200"}
                transition="all 0.25s cubic-bezier(0.4, 0, 0.2, 1)"
                _hover={{
                    bg: isYoutube ? ytBrand : igGradient,
                    color: "white",
                    borderColor: "transparent",
                    transform: "translateY(-2px) scale(1.12)",
                    boxShadow: isYoutube 
                        ? "0 4px 14px rgba(255, 0, 0, 0.4)" 
                        : "0 4px 14px rgba(225, 48, 108, 0.4)"
                }}
                _active={{
                    transform: "scale(0.95)"
                }}
            >
                <IconComponent size={parseInt(size) > 28 ? "16px" : "14px"} />
            </Link>
        </Tooltip>
    );
};

const NavLinkItem = ({ to, children, isActive }) => (
    <Box
        as={RouterLink}
        to={to}
        px={3.5}
        py={1.5}
        borderRadius="full"
        fontWeight={isActive ? "800" : "600"}
        fontSize="sm"
        color={isActive ? "brand.600" : "gray.700"}
        bg={isActive ? "brand.50" : "transparent"}
        borderWidth="1.5px"
        borderColor={isActive ? "brand.300" : "transparent"}
        boxShadow={isActive ? "0 2px 8px rgba(0, 102, 204, 0.15)" : "none"}
        _hover={{
            color: "brand.600",
            bg: isActive ? "brand.50" : "gray.50",
            textDecoration: "none"
        }}
        transition="all 0.2s ease"
        display="inline-flex"
        alignItems="center"
        gap={1.5}
    >
        {children}
        {isActive && (
            <Box w="6px" h="6px" borderRadius="full" bg="brand.500" />
        )}
    </Box>
);

const MobileNavLink = ({ to, children, onClick, isActive }) => (
    <Box
        as={RouterLink}
        to={to}
        onClick={onClick}
        px={4}
        py={3}
        borderRadius="xl"
        fontWeight={isActive ? "800" : "600"}
        fontSize="sm"
        color={isActive ? "brand.600" : "gray.700"}
        bg={isActive ? "brand.50" : "transparent"}
        borderLeft="4px solid"
        borderColor={isActive ? "brand.500" : "transparent"}
        borderBottom="1px"
        borderBottomColor={isActive ? "brand.100" : "gray.50"}
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        transition="all 0.15s ease"
        _hover={{
            bg: isActive ? "brand.50" : "gray.50",
            color: "brand.600",
            textDecoration: "none"
        }}
    >
        <Text>{children}</Text>
        {isActive && (
            <Badge
                bg="brand.500"
                color="white"
                borderRadius="full"
                px={2.5}
                py={0.5}
                fontSize="2xs"
                fontWeight="800"
                letterSpacing="0.5px"
                textTransform="uppercase"
            >
                Current
            </Badge>
        )}
    </Box>
);

const Header = () => {
    const toast = useToast();
    const { user, logout } = useAuth();
    const { cart, clearCart } = useCart();
    const navigate = useNavigate();
    const location = useLocation();
    const { isOpen: isRegisterOpen, onOpen: onRegisterOpen, onClose: onRegisterClose } = useDisclosure();
    const { isOpen: isEnquiryOpen, onOpen: onEnquiryOpen, onClose: onEnquiryClose } = useDisclosure();
    const { isOpen: isNavOpen, onToggle: toggleNav } = useDisclosure();

    const [authModalInitialPhone, setAuthModalInitialPhone] = useState('');
    const [authOrigin, setAuthOrigin] = useState('cart'); // 'cart' | 'nav'
    const handleOpenAuth = (phoneToPrefill = '', origin = 'cart') => {
        setAuthModalInitialPhone(phoneToPrefill);
        setAuthOrigin(origin);
        onRegisterOpen();
    };

    const [searchTerm, setSearchTerm] = useState('');

    const isActiveLink = (path) => {
        if (path === '/') {
            return location.pathname === '/';
        }
        return location.pathname.startsWith(path);
    };

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
                    <Flex align="center" gap={4}>
                        <Text fontSize="xs" color="gray.300">GST: 22AAAAA0000A1Z5</Text>
                        <Box h="14px" w="1px" bg="whiteAlpha.400" />
                        <HStack spacing={2} align="center">
                            <Text fontSize="xs" fontWeight="700" color="gray.300" letterSpacing="0.5px">
                                Follow Us:
                            </Text>
                            {SOCIAL_LINKS.youtube && (
                                <SocialHeaderIcon platform="youtube" href={SOCIAL_LINKS.youtube} isDark={true} size="28px" />
                            )}
                            {SOCIAL_LINKS.instagram && (
                                <SocialHeaderIcon platform="instagram" href={SOCIAL_LINKS.instagram} isDark={true} size="28px" />
                            )}
                        </HStack>
                    </Flex>
                </Flex>
            </Box>

            {/* Main Navbar */}
            <Flex py={{ base: 3, md: 4 }} px={{ base: 4, md: 8 }} justify="space-between" align="center">
                {/* Logo Section */}
                <Flex align="center" gap={{ base: 2, md: 4 }} as={RouterLink} to="/">
                    <Image 
                        src="/uni-logo.svg" 
                        alt="Unique Engineering Logo" 
                        w={{ base: "40px", md: "50px" }} 
                        h={{ base: "40px", md: "50px" }} 
                        flexShrink={0} 
                    />
                    <Box>
                        <Text fontSize={{ base: 'xl', sm: '2xl', md: '3xl' }} fontWeight="900" color="#0D3F66" lineHeight="1.0" noOfLines={1} letterSpacing="1px">
                            UNIQUE
                        </Text>
                        <Text fontSize={{ base: '8px', md: 'xs' }} color="#6B7C87" letterSpacing="3px" fontWeight="700">
                            ENGINEERING
                        </Text>
                    </Box>
                </Flex>

                {/* Navigation Links - Desktop & Tablet */}
                <Flex display={{ base: 'none', lg: 'flex' }} gap={{ lg: 2, xl: 3 }} align="center">
                    <NavLinkItem to="/" isActive={isActiveLink('/')}>Home</NavLinkItem>
                    <NavLinkItem to="/about" isActive={isActiveLink('/about')}>About Us</NavLinkItem>
                    <NavLinkItem to="/products" isActive={isActiveLink('/product')}>Products</NavLinkItem>
                    <NavLinkItem to="/services" isActive={isActiveLink('/services')}>Services</NavLinkItem>
                    <NavLinkItem to="/contact" isActive={isActiveLink('/contact')}>Contact</NavLinkItem>
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
                    {/* Three Dots More Menu (Contains Login) */}
                    <Menu isLazy placement="bottom-end">
                        <MenuButton
                            as={IconButton}
                            icon={<FiMoreVertical size={18} />}
                            variant="outline"
                            size="sm"
                            borderRadius="xl"
                            borderColor="gray.300"
                            aria-label="Account Options"
                            _hover={{ bg: 'brand.50', borderColor: 'brand.400' }}
                            title="Account & Login"
                        />
                        <MenuList zIndex={9999} boxShadow="2xl" borderRadius="2xl" p={2} minW="210px" border="1px solid" borderColor="gray.100">
                            {!user ? (
                                <MenuItem
                                    icon={<FiLogIn size={16} color="#0076a3" />}
                                    fontWeight="700"
                                    color="brand.600"
                                    borderRadius="xl"
                                    py={2.5}
                                    onClick={() => handleOpenAuth('', 'nav')}
                                >
                                    Login
                                </MenuItem>
                            ) : (
                                <>
                                    <Box px={3} py={2} bg="gray.50" borderRadius="xl" mb={1.5}>
                                        <Text fontSize="10px" color="gray.400" fontWeight="800" textTransform="uppercase" letterSpacing="wider">LOGGED IN AS</Text>
                                        <Text fontWeight="800" fontSize="sm" color="gray.800" noOfLines={1}>{user.name || user.phone}</Text>
                                        <Badge colorScheme={user.isAdmin ? 'purple' : 'green'} fontSize="2xs" mt={1} borderRadius="full" px={2}>
                                            {user.isSuperAdmin ? 'SUPER ADMIN' : user.isAdmin ? 'ADMIN' : 'CUSTOMER'}
                                        </Badge>
                                    </Box>
                                    <MenuItem
                                        icon={<FiGrid size={16} color="#0076a3" />}
                                        fontWeight="700"
                                        color="brand.600"
                                        borderRadius="xl"
                                        py={2}
                                        onClick={() => navigate('/my-dashboard')}
                                    >
                                        My Dashboard
                                    </MenuItem>
                                    <MenuItem
                                        icon={<FiUser size={16} color="#2B6CB0" />}
                                        fontWeight="700"
                                        borderRadius="xl"
                                        py={2}
                                        onClick={() => navigate('/my-profile')}
                                    >
                                        My Profile
                                    </MenuItem>
                                    {user.isAdmin && (
                                        <MenuItem
                                            icon={<FiShield size={16} color="#805AD5" />}
                                            fontWeight="700"
                                            color="brand.600"
                                            borderRadius="xl"
                                            py={2}
                                            onClick={() => navigate('/admin/dashboard')}
                                        >
                                            Admin Dashboard
                                        </MenuItem>
                                    )}
                                    <MenuDivider my={1} />
                                    <MenuItem
                                        icon={<FiLogOut size={16} color="#E53E3E" />}
                                        fontWeight="700"
                                        color="red.600"
                                        borderRadius="xl"
                                        py={2}
                                        onClick={() => {
                                            logout();
                                            navigate('/');
                                        }}
                                    >
                                        Logout
                                    </MenuItem>
                                </>
                            )}
                        </MenuList>
                    </Menu>

                    {user && (
                        <Flex align="center" gap={2} ml={1}>
                            <Text fontWeight="bold" fontSize="sm" color="brand.600" noOfLines={1}>Hi, {(user.name || 'User').split(' ')[0]}</Text>
                        </Flex>
                    )}
                </Flex>

                {/* Mobile Icons Header */}
                <Flex display={{ base: 'flex', lg: 'none' }} align="center" gap={1.5}>
                    {location.pathname === '/' && (
                        <Badge
                            display={{ base: 'none', sm: 'inline-flex' }}
                            bg="brand.50"
                            color="brand.600"
                            border="1px solid"
                            borderColor="brand.300"
                            borderRadius="full"
                            px={2.5}
                            py={0.5}
                            fontSize="2xs"
                            fontWeight="800"
                            letterSpacing="0.5px"
                        >
                            Home
                        </Badge>
                    )}
                    {SOCIAL_LINKS.youtube && (
                        <Box display={{ base: 'inline-flex', md: 'none' }}>
                            <SocialHeaderIcon platform="youtube" href={SOCIAL_LINKS.youtube} isDark={false} size="32px" />
                        </Box>
                    )}
                    {SOCIAL_LINKS.instagram && (
                        <Box display={{ base: 'inline-flex', md: 'none' }}>
                            <SocialHeaderIcon platform="instagram" href={SOCIAL_LINKS.instagram} isDark={false} size="32px" />
                        </Box>
                    )}
                    <IconButton
                        icon={<FaShoppingCart />}
                        aria-label="Cart"
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate('/products')}
                    />

                    {/* Three Dots Menu Button on Mobile */}
                    <Menu isLazy placement="bottom-end">
                        <MenuButton
                            as={IconButton}
                            icon={<FiMoreVertical size={18} />}
                            variant="ghost"
                            size="sm"
                            borderRadius="full"
                            aria-label="Account Menu"
                        />
                        <MenuList zIndex={9999} boxShadow="2xl" borderRadius="2xl" p={2} minW="200px">
                            {!user ? (
                                <MenuItem
                                    icon={<FiLogIn size={16} color="#0076a3" />}
                                    fontWeight="700"
                                    color="brand.600"
                                    borderRadius="xl"
                                    py={2.5}
                                    onClick={() => handleOpenAuth('', 'nav')}
                                >
                                    Login
                                </MenuItem>
                            ) : (
                                <>
                                    <Box px={3} py={2} bg="gray.50" borderRadius="xl" mb={1.5}>
                                        <Text fontSize="10px" color="gray.400" fontWeight="800" textTransform="uppercase">LOGGED IN AS</Text>
                                        <Text fontWeight="800" fontSize="sm" color="gray.800" noOfLines={1}>{user.name || user.phone}</Text>
                                        <Badge colorScheme={user.isAdmin ? 'purple' : 'green'} fontSize="2xs" mt={1}>
                                            {user.isSuperAdmin ? 'SUPER ADMIN' : user.isAdmin ? 'ADMIN' : 'CUSTOMER'}
                                        </Badge>
                                    </Box>
                                    <MenuItem
                                        icon={<FiGrid size={16} color="#0076a3" />}
                                        fontWeight="700"
                                        color="brand.600"
                                        borderRadius="xl"
                                        py={2}
                                        onClick={() => navigate('/my-dashboard')}
                                    >
                                        My Dashboard
                                    </MenuItem>
                                    <MenuItem
                                        icon={<FiUser size={16} color="#2B6CB0" />}
                                        fontWeight="700"
                                        borderRadius="xl"
                                        py={2}
                                        onClick={() => navigate('/my-profile')}
                                    >
                                        My Profile
                                    </MenuItem>
                                    {user.isAdmin && (
                                        <MenuItem
                                            icon={<FiShield size={16} color="#805AD5" />}
                                            fontWeight="700"
                                            color="purple.600"
                                            borderRadius="xl"
                                            py={2}
                                            onClick={() => navigate('/admin/dashboard')}
                                        >
                                            Admin Dashboard
                                        </MenuItem>
                                    )}
                                    <MenuDivider my={1} />
                                    <MenuItem
                                        icon={<FiLogOut size={16} color="#E53E3E" />}
                                        fontWeight="700"
                                        color="red.600"
                                        borderRadius="xl"
                                        py={2}
                                        onClick={() => {
                                            logout();
                                            navigate('/');
                                        }}
                                    >
                                        Logout
                                    </MenuItem>
                                </>
                            )}
                        </MenuList>
                    </Menu>

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
                        <Stack spacing={1} p={3}>
                            <MobileNavLink to="/" isActive={isActiveLink('/')} onClick={toggleNav}>Home</MobileNavLink>
                            <MobileNavLink to="/about" isActive={isActiveLink('/about')} onClick={toggleNav}>About Us</MobileNavLink>
                            <MobileNavLink to="/products" isActive={isActiveLink('/product')} onClick={toggleNav}>Products</MobileNavLink>
                            <MobileNavLink to="/services" isActive={isActiveLink('/services')} onClick={toggleNav}>Services</MobileNavLink>
                            <MobileNavLink to="/contact" isActive={isActiveLink('/contact')} onClick={toggleNav}>Contact</MobileNavLink>

                            {/* Social Channels in Drawer */}
                            {(SOCIAL_LINKS.youtube || SOCIAL_LINKS.instagram) && (
                                <Box p={3} my={2} bg="gray.50" borderRadius="xl" border="1px solid" borderColor="gray.100">
                                    <Text fontSize="xs" fontWeight="700" color="gray.600" mb={2.5} textTransform="uppercase" letterSpacing="0.5px">
                                        Follow Unique Engineering
                                    </Text>
                                    <Flex gap={2}>
                                        {SOCIAL_LINKS.youtube && (
                                            <Button
                                                as="a"
                                                href={SOCIAL_LINKS.youtube}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                size="sm"
                                                flex="1"
                                                leftIcon={<FaYoutube color="#FF0000" size="18px" />}
                                                bg="white"
                                                border="1px solid"
                                                borderColor="red.200"
                                                color="gray.700"
                                                _hover={{
                                                    bg: "red.50",
                                                    borderColor: "red.400",
                                                    transform: "translateY(-1px)",
                                                    boxShadow: "sm"
                                                }}
                                                fontSize="xs"
                                                fontWeight="700"
                                            >
                                                Watch on YouTube
                                            </Button>
                                        )}
                                        {SOCIAL_LINKS.instagram && (
                                            <Button
                                                as="a"
                                                href={SOCIAL_LINKS.instagram}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                size="sm"
                                                flex="1"
                                                leftIcon={<FaInstagram color="#E4405F" size="18px" />}
                                                bg="white"
                                                border="1px solid"
                                                borderColor="pink.200"
                                                color="gray.700"
                                                _hover={{
                                                    bg: "pink.50",
                                                    borderColor: "pink.400",
                                                    transform: "translateY(-1px)",
                                                    boxShadow: "sm"
                                                }}
                                                fontSize="xs"
                                                fontWeight="700"
                                            >
                                                Instagram
                                            </Button>
                                        )}
                                    </Flex>
                                </Box>
                            )}

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
                                        <Button variant="outline" w="full" onClick={() => { handleOpenAuth('', 'nav'); toggleNav(); }}>
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

            {/* Enquiry Drawer (Slider) */}
            <EnquiryDrawer
                isOpen={isEnquiryOpen}
                onClose={onEnquiryClose}
                cart={cart}
                onOpenAuth={handleOpenAuth}
            />

            {/* Single Unified Register/Login Modal */}
            <AuthModal
                isOpen={isRegisterOpen}
                onClose={() => {
                    setAuthModalInitialPhone('');
                    onRegisterClose();
                    if (authOrigin === 'cart' && cart.length > 0 && !user) {
                        onEnquiryOpen();
                    }
                }}
                initialPhone={authModalInitialPhone}
                disallowAdmin={authOrigin === 'cart'}
                onLoginSuccess={async (loggedInUser) => {
                    setAuthModalInitialPhone('');
                    onRegisterClose();
                    if (authOrigin === 'nav') {
                        if (loggedInUser?.isAdmin || loggedInUser?.isSuperAdmin) {
                            navigate('/admin/dashboard');
                        } else {
                            navigate('/my-dashboard');
                        }
                    } else if (authOrigin === 'cart') {
                        if (cart && cart.length > 0 && !loggedInUser?.isAdmin) {
                            try {
                                const enquiryData = {
                                    companyName: loggedInUser.companyName || loggedInUser.name || 'Client',
                                    contactPersonName: loggedInUser.contactPersonName || loggedInUser.name || 'Client',
                                    phone: loggedInUser.phone,
                                    email: loggedInUser.email || `${loggedInUser.phone}@client.com`,
                                    gstNumber: loggedInUser.gstNumber || '',
                                    address: loggedInUser.address || '',
                                    products: cart.map(item => {
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
                                await clearCart();
                                toast({
                                    title: "Enquiry Sent!",
                                    description: "Thank you! We will get back to you shortly.",
                                    status: "success",
                                    duration: 5000,
                                    isClosable: true
                                });
                                navigate('/products');
                            } catch (err) {
                                console.error("Enquiry submission error:", err);
                                onEnquiryOpen();
                            }
                        } else {
                            onEnquiryOpen();
                        }
                    }
                }}
            />

        </Box>
    );
};

const AuthModal = ({ isOpen, onClose, initialPhone = '', onLoginSuccess, disallowAdmin = false }) => {
    const {
        checkPhone, sendAdminMobileOtp, verifyAdminMobileOtp,
        loginWithPassword, setUserPassword, setup2FA, verifyEnable2FA, login2FA, resetWithBackup
    } = useAuth();
    const navigate = useNavigate();
    const toast = useToast();

    // Steps: 'phone' | 'admin-email' | 'admin-otp' | 'user-password' | 'user-set-password' | 'mfa' | 'mfa-setup' | 'reset-backup'
    const [step, setStep] = React.useState('phone');
    const [isLoading, setIsLoading] = React.useState(false);

    // Form fields
    const [phone, setPhone] = React.useState('');
    const [cleanPhone, setCleanPhone] = React.useState('');
    const [email, setEmail] = React.useState('');
    const [otp, setOtp] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [confirmPassword, setConfirmPassword] = React.useState('');
    const [showPassword, setShowPassword] = React.useState(false);
    const [name, setName] = React.useState('');
    const [companyName, setCompanyName] = React.useState('');
    const [address, setAddress] = React.useState('');
    const [gstNumber, setGstNumber] = React.useState('');
    const [userName, setUserName] = React.useState('');

    // MFA / 2FA states
    const [mfaCode, setMfaCode] = React.useState('');
    const [qrCode, setQrCode] = React.useState('');
    const [is2FAEnabled, setIs2FAEnabled] = React.useState(false);
    const [backupCodeInput, setBackupCodeInput] = React.useState('');
    const [resetLoading, setResetLoading] = React.useState(false);

    // Rate Limiter Error Message
    const [rateLimitError, setRateLimitError] = React.useState('');

    const resetAndClose = () => {
        setStep('phone');
        setPhone('');
        setCleanPhone('');
        setEmail('');
        setOtp('');
        setPassword('');
        setConfirmPassword('');
        setShowPassword(false);
        setName('');
        setCompanyName('');
        setAddress('');
        setGstNumber('');
        setUserName('');
        setMfaCode('');
        setQrCode('');
        setIs2FAEnabled(false);
        setBackupCodeInput('');
        setRateLimitError('');
        onClose();
    };

    // Helper: compute 10 digits
    const getCleanDigits = (val) => (val || '').replace(/\D/g, '').slice(-10);

    // Reset states when modal closes
    React.useEffect(() => {
        if (!isOpen) {
            setStep('phone');
            setPhone('');
            setCleanPhone('');
            setEmail('');
            setOtp('');
            setPassword('');
            setConfirmPassword('');
            setShowPassword(false);
            setName('');
            setCompanyName('');
            setAddress('');
            setGstNumber('');
            setUserName('');
            setMfaCode('');
            setQrCode('');
            setIs2FAEnabled(false);
            setBackupCodeInput('');
            setRateLimitError('');
        }
    }, [isOpen]);

    // Auto-prefill and advance to password or registration when initialPhone is provided from Cart
    React.useEffect(() => {
        if (isOpen && initialPhone) {
            const digits = getCleanDigits(initialPhone);
            setPhone(digits);
            if (digits.length === 10) {
                setIsLoading(true);
                setRateLimitError('');
                checkPhone(digits).then(res => {
                    setIsLoading(false);
                    if (!res) return;
                    if (res.status === 429) {
                        setRateLimitError(res.msg || 'Too many attempts. For security, please wait 15 minutes before trying again.');
                        return;
                    }
                    if (!res.success) {
                        toast({ title: 'Error Checking Mobile', description: res.msg, status: 'error', duration: 4000 });
                        return;
                    }
                    setCleanPhone(res.phone || digits);
                    if (res.requiresVerification || res.role === 'admin' || res.isAdmin) {
                        if (disallowAdmin) {
                            toast({
                                title: 'Admin Account Not Allowed',
                                description: 'Administrative accounts cannot submit customer enquiries. Please use your customer mobile number or log in via Admin Login in the menu.',
                                status: 'error',
                                duration: 5000,
                                isClosable: true
                            });
                            resetAndClose();
                            return;
                        }
                        setStep('admin-email');
                    } else {
                        setUserName(res.name || res.contactPersonName || '');
                        if (res.name) setName(res.name);
                        if (res.companyName) setCompanyName(res.companyName);
                        if (res.address) setAddress(res.address);
                        if (res.gstNumber) setGstNumber(res.gstNumber);

                        if (res.hasPassword) {
                            setStep('user-password');
                        } else {
                            setStep('user-set-password');
                        }
                    }
                }).catch(() => setIsLoading(false));
            }
        }
    }, [isOpen, initialPhone]);

    // Step 1: Check Mobile Number
    const handlePhoneSubmit = async () => {
        const digits = getCleanDigits(phone);
        if (!digits || digits.length !== 10) {
            return toast({
                title: 'Invalid Mobile Number',
                description: 'Please enter a valid 10-digit mobile number.',
                status: 'warning',
                duration: 3000
            });
        }

        setIsLoading(true);
        setRateLimitError('');
        const res = await checkPhone(digits);
        setIsLoading(false);

        if (res.status === 429) {
            setRateLimitError(res.msg || 'Too many attempts. For security, please wait 15 minutes before trying again.');
            return;
        }

        if (!res.success) {
            return toast({
                title: 'Error Checking Mobile',
                description: res.msg || 'Unable to verify mobile number.',
                status: 'error',
                duration: 4000
            });
        }

        setCleanPhone(res.phone || digits);

        if (res.requiresVerification || res.role === 'admin' || res.isAdmin) {
            if (disallowAdmin) {
                return toast({
                    title: 'Admin Account Not Allowed',
                    description: 'Administrative accounts cannot submit customer enquiries. Please use your customer mobile number or log in via Admin Login in the menu.',
                    status: 'error',
                    duration: 5000,
                    isClosable: true
                });
            }
            setStep('admin-email');
        } else {
            setUserName(res.name || res.contactPersonName || '');
            if (res.name) setName(res.name);
            if (res.companyName) setCompanyName(res.companyName);
            if (res.address) setAddress(res.address);
            if (res.gstNumber) setGstNumber(res.gstNumber);

            if (res.hasPassword) {
                setStep('user-password');
            } else {
                setStep('user-set-password');
            }
        }
    };

    // Step 2A: Admin Email Verification & WhatsApp OTP Request
    const handleAdminEmailSubmit = async () => {
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return toast({ title: 'Enter a valid email address', status: 'warning', duration: 3000 });
        }

        setIsLoading(true);
        setRateLimitError('');
        const res = await sendAdminMobileOtp(cleanPhone, email);
        setIsLoading(false);

        if (res.status === 429) {
            setRateLimitError(res.msg || 'Too many attempts. For security, please wait 15 minutes before trying again.');
            return;
        }

        if (!res.success) {
            return toast({
                title: res.status === 403 ? 'Access Restricted' : 'Verification Failed',
                description: res.msg || 'Access restricted: Verification failed.',
                status: 'error',
                duration: 5000
            });
        }

        toast({
            title: '✅ OTP Sent!',
            description: res.msg || `Verification OTP sent to WhatsApp linked to +91 ${cleanPhone}`,
            status: 'success',
            duration: 4500
        });

        setIs2FAEnabled(Boolean(res.is2FAEnabled));
        setStep('admin-otp');
    };

    // Step 2A-OTP: Verify Admin OTP
    const handleAdminOtpSubmit = async () => {
        if (!/^\d{4}$/.test(otp)) {
            return toast({ title: 'Enter 4-digit OTP', status: 'warning', duration: 2500 });
        }

        setIsLoading(true);
        setRateLimitError('');
        const res = await verifyAdminMobileOtp(cleanPhone, email, otp);
        setIsLoading(false);

        if (res.status === 429) {
            setRateLimitError(res.msg || 'Too many attempts. For security, please wait 15 minutes before trying again.');
            return;
        }

        if (res.success) {
            toast({
                title: `Welcome back${res.user?.name ? `, ${res.user.name}` : ''}!`,
                description: 'Logged in successfully.',
                status: 'success',
                duration: 3500
            });
            resetAndClose();
            if (onLoginSuccess) {
                onLoginSuccess(res.user);
            } else if (res.user?.isAdmin || res.user?.isSuperAdmin) {
                navigate('/admin/dashboard');
            } else {
                navigate('/my-dashboard');
            }
        } else {
            toast({
                title: 'Invalid OTP',
                description: res.msg || 'Incorrect or expired OTP. Please try again.',
                status: 'error',
                duration: 4000
            });
            setOtp('');
        }
    };

    // Step 2B: User Password Login
    const handleUserPasswordLogin = async () => {
        if (!password) {
            return toast({ title: 'Enter Password', status: 'warning', duration: 2500 });
        }

        setIsLoading(true);
        setRateLimitError('');
        const res = await loginWithPassword(cleanPhone, password);
        setIsLoading(false);

        if (res.status === 429) {
            setRateLimitError(res.msg || 'Too many attempts. For security, please wait 15 minutes before trying again.');
            return;
        }

        if (res.success) {
            toast({
                title: `Welcome back${res.user?.name ? `, ${res.user.name}` : ''}!`,
                description: 'You are now logged in.',
                status: 'success',
                duration: 3500
            });
            resetAndClose();
            if (onLoginSuccess) {
                onLoginSuccess(res.user);
            } else {
                navigate('/my-dashboard');
            }
        } else {
            toast({
                title: 'Login Failed',
                description: res.msg || 'Incorrect password. Please try again.',
                status: 'error',
                duration: 4000
            });
        }
    };

    // Step 2B-Set: User Set Password (New User Registration)
    const handleUserSetPassword = async () => {
        if (!companyName || !companyName.trim()) {
            return toast({
                title: 'Company Name Required',
                description: 'Please enter your Company / Firm name to register.',
                status: 'warning',
                duration: 4000
            });
        }
        if (!password || password.length < 6) {
            return toast({ title: 'Password Too Short', description: 'Password must be at least 6 characters long.', status: 'warning' });
        }
        if (password !== confirmPassword) {
            return toast({ title: 'Passwords Do Not Match', description: 'Please re-enter matching passwords.', status: 'warning' });
        }

        setIsLoading(true);
        setRateLimitError('');
        const res = await setUserPassword(cleanPhone, password, name, companyName.trim(), address.trim(), gstNumber.trim(), email.trim());
        setIsLoading(false);

        if (res.status === 429) {
            setRateLimitError(res.msg || 'Too many attempts. For security, please wait 15 minutes before trying again.');
            return;
        }

        if (res.success) {
            toast({
                title: '✅ Password Saved!',
                description: 'Your account is secured and you are now logged in.',
                status: 'success',
                duration: 4000
            });
            resetAndClose();
            if (onLoginSuccess) {
                onLoginSuccess(res.user);
            } else {
                navigate('/my-dashboard');
            }
        } else {
            toast({
                title: 'Error Setting Password',
                description: res.msg || 'Failed to save password.',
                status: 'error',
                duration: 4000
            });
        }
    };

    // MFA Handlers for Admins
    const handleMfaLogin = async () => {
        if (!/^\d{6}$/.test(mfaCode)) {
            return toast({ title: 'Enter 6-digit code', status: 'warning' });
        }
        setIsLoading(true);
        const res = await login2FA(email, mfaCode);
        setIsLoading(false);

        if (res.success) {
            toast({ title: 'Authenticated!', status: 'success' });
            resetAndClose();
            if (onLoginSuccess) {
                onLoginSuccess(res.user);
            } else {
                navigate('/admin/dashboard');
            }
        } else {
            toast({ title: 'Invalid Code', description: res.message, status: 'error' });
        }
    };

    const handleStartMfaSetup = async () => {
        setIsLoading(true);
        const res = await setup2FA(email);
        setIsLoading(false);
        if (res.success) {
            setQrCode(res.qrCode);
            setStep('mfa-setup');
        } else {
            toast({ title: 'Error', description: res.message, status: 'error' });
        }
    };

    const handleCompleteMfaSetup = async () => {
        if (!/^\d{6}$/.test(mfaCode)) {
            return toast({ title: 'Enter 6-digit code from app', status: 'warning' });
        }
        setIsLoading(true);
        const res = await verifyEnable2FA(email, mfaCode);
        setIsLoading(false);
        if (res.success) {
            toast({ title: 'Google Authenticator Enabled!', status: 'success' });
            setStep('mfa');
        } else {
            toast({ title: 'Verification Failed', description: res.message, status: 'error' });
        }
    };

    const handleResetWithBackup = async () => {
        if (!backupCodeInput) return toast({ title: 'Enter Master Code', status: 'warning' });
        setResetLoading(true);
        const res = await resetWithBackup(email, backupCodeInput);
        setResetLoading(false);
        if (res.success) {
            toast({ title: '2FA Reset Successful!', description: 'You can now scan a new QR code.', status: 'success' });
            setBackupCodeInput('');
            await handleStartMfaSetup();
        } else {
            toast({ title: 'Failed', description: res.message || 'Invalid Master Code', status: 'error' });
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={resetAndClose} isCentered size="md">
            <ModalOverlay bg="blackAlpha.700" />
            <ModalContent borderRadius="3xl" overflow="hidden" boxShadow="2xl">
                {/* Header Banner */}
                <Box
                    bg="linear-gradient(135deg, #0076a3 0%, #004d6e 100%)"
                    px={6} py={5} color="white"
                >
                    <HStack spacing={3} align="center">
                        <Box p={2.5} bg="whiteAlpha.200" borderRadius="xl">
                            {step.startsWith('admin') ? (
                                <FiShield size={24} color="#90CDF4" />
                            ) : step === 'user-password' ? (
                                <FiKey size={24} color="#90CDF4" />
                            ) : step === 'user-set-password' ? (
                                <FiLock size={24} color="#9AE6B4" />
                            ) : (
                                <FiPhone size={24} color="#63B3ED" />
                            )}
                        </Box>
                        <Box>
                            <HStack spacing={2} align="center">
                                <Text fontWeight="900" fontSize="lg" letterSpacing="tight">
                                    {step === 'phone' && 'Welcome! Login or Register'}
                                    {step === 'admin-email' && 'Security Verification'}
                                    {step === 'admin-otp' && 'WhatsApp OTP Verification'}
                                    {step === 'user-password' && 'Account Login'}
                                    {step === 'user-set-password' && 'Create Your Password'}
                                    {step === 'mfa' && 'Google Authenticator'}
                                    {step === 'mfa-setup' && 'Setup Google Authenticator'}
                                    {step === 'reset-backup' && 'Master Code Recovery'}
                                </Text>
                            </HStack>
                            <Text fontSize="xs" opacity={0.85} mt={0.5}>
                                {step === 'phone' && 'Enter your 10-digit mobile number to proceed.'}
                                {step === 'admin-email' && 'Confirm your registered email address to proceed.'}
                                {step === 'admin-otp' && `Enter 4-digit code sent to WhatsApp for +91 ${cleanPhone}.`}
                                {step === 'user-password' && `Enter password for +91 ${cleanPhone}.`}
                                {step === 'user-set-password' && 'One-time setup: secure your account with a password.'}
                                {step === 'mfa' && 'Enter the 6-digit code from Google Authenticator.'}
                                {step === 'mfa-setup' && 'Scan QR code with your authenticator app.'}
                                {step === 'reset-backup' && 'Enter master recovery code to reset 2FA.'}
                            </Text>
                        </Box>
                    </HStack>
                </Box>
                <ModalCloseButton color="white" top={4} right={4} />

                <Box p={6}>
                    {/* Rate Limiter Warning Banner */}
                    {rateLimitError && (
                        <Alert status="error" borderRadius="xl" mb={4} variant="subtle" border="1px solid" borderColor="red.300">
                            <AlertIcon />
                            <Box flex="1">
                                <Text fontSize="xs" fontWeight="bold" color="red.800">
                                    ⏳ Rate Limit Active (15-Min Window)
                                </Text>
                                <AlertDescription fontSize="xs" color="red.700" display="block">
                                    {rateLimitError}
                                </AlertDescription>
                            </Box>
                        </Alert>
                    )}

                    {/* ───────────────── STEP 1: PHONE NUMBER ───────────────── */}
                    {step === 'phone' && (
                        <Stack spacing={4}>
                            <FormControl isRequired>
                                <FormLabel fontSize="xs" fontWeight="800" color="gray.600" textTransform="uppercase" letterSpacing="0.5px">
                                    Mobile Number
                                </FormLabel>
                                <InputGroup size="lg">
                                    <InputLeftAddon fontWeight="800" bg="gray.100" color="gray.700" borderRadius="xl">
                                        🇮🇳 +91
                                    </InputLeftAddon>
                                    <Input
                                        type="tel"
                                        placeholder="98988 35374"
                                        value={phone}
                                        onChange={(e) => {
                                            setPhone(e.target.value);
                                            setRateLimitError('');
                                        }}
                                        onKeyDown={(e) => e.key === 'Enter' && handlePhoneSubmit()}
                                        fontWeight="bold"
                                        letterSpacing="1px"
                                        borderRadius="xl"
                                        autoFocus
                                    />
                                </InputGroup>
                                <Text fontSize="2xs" color="gray.400" mt={1.5}>
                                    Clean 10-digit format (e.g. +91 98988 35374 or 09898835374)
                                </Text>
                            </FormControl>

                            <Button
                                colorScheme="brand"
                                size="lg"
                                borderRadius="xl"
                                py={6}
                                fontWeight="800"
                                isLoading={isLoading}
                                onClick={handlePhoneSubmit}
                                boxShadow="md"
                            >
                                Continue →
                            </Button>
                        </Stack>
                    )}

                    {/* ─────────────── STEP 2A: EMAIL VERIFICATION ─────────────── */}
                    {step === 'admin-email' && (
                        <Stack spacing={4}>
                            <Box p={3} bg="blue.50" borderRadius="xl" border="1px solid" borderColor="blue.200">
                                <HStack spacing={2} mb={1}>
                                    <FiShield color="#0076a3" />
                                    <Text fontSize="xs" fontWeight="800" color="blue.900">
                                        Account Verification
                                    </Text>
                                </HStack>
                                <Text fontSize="xs" color="blue.800">
                                    Mobile: <strong>+91 {cleanPhone}</strong>. For security, please enter your registered email address to receive your verification code.
                                </Text>
                            </Box>

                            <FormControl isRequired>
                                <FormLabel fontSize="xs" fontWeight="800" color="gray.600" textTransform="uppercase">
                                    Registered Email Address
                                </FormLabel>
                                <Input
                                    type="email"
                                    placeholder="name@example.com"
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        setRateLimitError('');
                                    }}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAdminEmailSubmit()}
                                    size="lg"
                                    borderRadius="xl"
                                    autoFocus
                                />
                            </FormControl>

                            <Button
                                colorScheme="brand"
                                size="lg"
                                borderRadius="xl"
                                py={6}
                                fontWeight="800"
                                isLoading={isLoading}
                                onClick={handleAdminEmailSubmit}
                            >
                                Send WhatsApp OTP →
                            </Button>

                            <Button
                                variant="ghost"
                                size="sm"
                                colorScheme="gray"
                                onClick={() => setStep('phone')}
                                leftIcon={<FiArrowLeft />}
                            >
                                Change Mobile Number
                            </Button>
                        </Stack>
                    )}

                    {/* ─────────────── STEP 2A-OTP: ADMIN OTP ENTRY ─────────────── */}
                    {step === 'admin-otp' && (
                        <Stack spacing={4}>
                            <Box p={3} bg="green.50" borderRadius="xl" border="1px solid" borderColor="green.200">
                                <HStack spacing={2} mb={1}>
                                    <FiCheckCircle color="#2F855A" />
                                    <Text fontSize="xs" fontWeight="800" color="green.800">
                                        OTP Dispatched
                                    </Text>
                                </HStack>
                                <Text fontSize="xs" color="green.700">
                                    We sent a 4-digit OTP to your WhatsApp linked to <strong>+91 {cleanPhone}</strong> for <strong>{email}</strong>.
                                </Text>
                            </Box>

                            <FormControl isRequired>
                                <FormLabel fontSize="xs" fontWeight="800" color="gray.600" textTransform="uppercase">
                                    Enter 4-Digit OTP
                                </FormLabel>
                                <Input
                                    placeholder="• • • •"
                                    maxLength={4}
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAdminOtpSubmit()}
                                    textAlign="center"
                                    fontSize="2xl"
                                    letterSpacing="0.4em"
                                    fontWeight="900"
                                    size="lg"
                                    borderRadius="xl"
                                    autoFocus
                                />
                            </FormControl>

                            <Button
                                colorScheme="brand"
                                size="lg"
                                borderRadius="xl"
                                py={6}
                                fontWeight="800"
                                isLoading={isLoading}
                                onClick={handleAdminOtpSubmit}
                            >
                                Verify &amp; Continue →
                            </Button>

                            {is2FAEnabled && (
                                <Button
                                    variant="outline"
                                    colorScheme="orange"
                                    size="sm"
                                    borderRadius="xl"
                                    onClick={() => setStep('mfa')}
                                >
                                    🔑 Or Login with Google Authenticator
                                </Button>
                            )}

                            <HStack justify="space-between">
                                <Button
                                    variant="link"
                                    size="xs"
                                    color="gray.500"
                                    onClick={() => setStep('admin-email')}
                                    leftIcon={<FiArrowLeft />}
                                >
                                    Change Email
                                </Button>
                                <Button
                                    variant="link"
                                    size="xs"
                                    color="purple.600"
                                    onClick={handleAdminEmailSubmit}
                                    isLoading={isLoading}
                                >
                                    Resend OTP
                                </Button>
                            </HStack>
                        </Stack>
                    )}

                    {/* ─────────────── STEP 2B: USER PASSWORD LOGIN ─────────────── */}
                    {step === 'user-password' && (
                        <Stack spacing={4}>
                            <Box p={3} bg="blue.50" borderRadius="xl" border="1px solid" borderColor="blue.200">
                                <Text fontSize="sm" fontWeight="800" color="blue.800">
                                    Welcome back{userName ? `, ${userName}` : ''}!
                                </Text>
                                <Text fontSize="xs" color="blue.600">
                                    Mobile: <strong>+91 {cleanPhone}</strong>
                                </Text>
                            </Box>

                            <FormControl isRequired>
                                <FormLabel fontSize="xs" fontWeight="800" color="gray.600" textTransform="uppercase">
                                    Your Password
                                </FormLabel>
                                <InputGroup size="lg">
                                    <Input
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Enter your password"
                                        value={password}
                                        onChange={(e) => {
                                            setPassword(e.target.value);
                                            setRateLimitError('');
                                        }}
                                        onKeyDown={(e) => e.key === 'Enter' && handleUserPasswordLogin()}
                                        borderRadius="xl"
                                        autoFocus
                                    />
                                    <InputRightElement>
                                        <IconButton
                                            icon={showPassword ? <FiEyeOff /> : <FiEye />}
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setShowPassword(p => !p)}
                                            aria-label="Toggle password visibility"
                                        />
                                    </InputRightElement>
                                </InputGroup>
                            </FormControl>

                            <Button
                                colorScheme="brand"
                                size="lg"
                                borderRadius="xl"
                                py={6}
                                fontWeight="800"
                                isLoading={isLoading}
                                onClick={handleUserPasswordLogin}
                            >
                                Login →
                            </Button>

                            <Button
                                variant="link"
                                size="xs"
                                color="gray.500"
                                onClick={() => setStep('phone')}
                                leftIcon={<FiArrowLeft />}
                            >
                                Use Different Mobile Number
                            </Button>
                        </Stack>
                    )}

                    {/* ─────────────── STEP 2B-SET: NEW USER REGISTRATION & PASSWORD SETUP ─────────────── */}
                    {step === 'user-set-password' && (
                        <Stack spacing={3.5}>
                            <Box p={3} bg="green.50" borderRadius="xl" border="1px solid" borderColor="green.200">
                                <HStack spacing={2} mb={1}>
                                    <FiLock color="#276749" />
                                    <Text fontSize="xs" fontWeight="800" color="green.800">
                                        New Account Setup
                                    </Text>
                                    <Badge colorScheme="green" fontSize="2xs" borderRadius="full">NEW USER</Badge>
                                </HStack>
                                <Text fontSize="xs" color="green.700">
                                    Mobile: <strong>+91 {cleanPhone}</strong>. Please provide your company details and create a password to set up your account.
                                </Text>
                            </Box>

                            {/* 1. Company Name (Required) */}
                            <FormControl isRequired>
                                <FormLabel fontSize="xs" fontWeight="800" color="gray.700" textTransform="uppercase" letterSpacing="0.5px">
                                    Company / Firm Name <Text as="span" color="red.500">*</Text>
                                </FormLabel>
                                <InputGroup size="md">
                                    <InputLeftElement pointerEvents="none" color="gray.400">
                                        <FiBriefcase />
                                    </InputLeftElement>
                                    <Input
                                        placeholder="e.g. Acme Engineering Works"
                                        value={companyName}
                                        onChange={(e) => setCompanyName(e.target.value)}
                                        borderRadius="xl"
                                        fontWeight="600"
                                        autoFocus
                                    />
                                </InputGroup>
                            </FormControl>

                            {/* 2. Contact Person Name */}
                            <FormControl>
                                <FormLabel fontSize="xs" fontWeight="800" color="gray.600" textTransform="uppercase">
                                    Contact Person Name
                                </FormLabel>
                                <InputGroup size="md">
                                    <InputLeftElement pointerEvents="none" color="gray.400">
                                        <FiUser />
                                    </InputLeftElement>
                                    <Input
                                        placeholder="Your full name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        borderRadius="xl"
                                        fontWeight="500"
                                    />
                                </InputGroup>
                            </FormControl>

                            {/* 2B. Email Address (Optional) */}
                            <FormControl>
                                <FormLabel fontSize="xs" fontWeight="800" color="gray.600" textTransform="uppercase">
                                    Email Address (Optional)
                                </FormLabel>
                                <InputGroup size="md">
                                    <InputLeftElement pointerEvents="none" color="gray.400">
                                        <FiMail />
                                    </InputLeftElement>
                                    <Input
                                        type="email"
                                        placeholder="company@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        borderRadius="xl"
                                        fontWeight="500"
                                    />
                                </InputGroup>
                            </FormControl>

                            {/* 3. GST Number of Company */}
                            <FormControl>
                                <FormLabel fontSize="xs" fontWeight="800" color="gray.600" textTransform="uppercase">
                                    Company GST No
                                </FormLabel>
                                <InputGroup size="md">
                                    <InputLeftElement pointerEvents="none" color="gray.400">
                                        <FiFileText />
                                    </InputLeftElement>
                                    <Input
                                        placeholder="e.g. 24AAAAA0000A1Z5"
                                        maxLength={15}
                                        value={gstNumber}
                                        onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
                                        borderRadius="xl"
                                        fontWeight="600"
                                        letterSpacing="0.5px"
                                    />
                                </InputGroup>
                            </FormControl>

                            {/* 4. Company Address */}
                            <FormControl>
                                <FormLabel fontSize="xs" fontWeight="800" color="gray.600" textTransform="uppercase">
                                    Company Address
                                </FormLabel>
                                <InputGroup size="md">
                                    <InputLeftElement pointerEvents="none" color="gray.400">
                                        <FiMapPin />
                                    </InputLeftElement>
                                    <Input
                                        placeholder="Plot/Street, Industrial Area, City, State"
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        borderRadius="xl"
                                        fontWeight="500"
                                    />
                                </InputGroup>
                            </FormControl>

                            {/* 5. Create Password */}
                            <FormControl isRequired>
                                <FormLabel fontSize="xs" fontWeight="800" color="gray.700" textTransform="uppercase">
                                    Create Password <Text as="span" color="red.500">*</Text>
                                </FormLabel>
                                <InputGroup size="md">
                                    <Input
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Minimum 6 characters"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        borderRadius="xl"
                                    />
                                    <InputRightElement>
                                        <IconButton
                                            icon={showPassword ? <FiEyeOff /> : <FiEye />}
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setShowPassword(p => !p)}
                                            aria-label="Toggle password"
                                        />
                                    </InputRightElement>
                                </InputGroup>
                            </FormControl>

                            {/* 6. Confirm Password */}
                            <FormControl isRequired>
                                <FormLabel fontSize="xs" fontWeight="800" color="gray.700" textTransform="uppercase">
                                    Confirm Password <Text as="span" color="red.500">*</Text>
                                </FormLabel>
                                <Input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Re-enter password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleUserSetPassword()}
                                    size="md"
                                    borderRadius="xl"
                                />
                            </FormControl>

                            <Button
                                colorScheme="green"
                                size="lg"
                                borderRadius="xl"
                                py={6}
                                fontWeight="800"
                                isLoading={isLoading}
                                onClick={handleUserSetPassword}
                                boxShadow="md"
                                mt={1}
                            >
                                Register &amp; Continue →
                            </Button>

                            <Button
                                variant="link"
                                size="xs"
                                color="gray.500"
                                onClick={() => setStep('phone')}
                                leftIcon={<FiArrowLeft />}
                            >
                                Use Different Mobile Number
                            </Button>
                        </Stack>
                    )}

                    {/* ─────────────── MFA TOTP / RECOVERY ─────────────── */}
                    {step === 'mfa' && (
                        <Stack spacing={4}>
                            <FormControl isRequired>
                                <FormLabel fontSize="sm" fontWeight="700">Google Authenticator Code</FormLabel>
                                <Input
                                    placeholder="000000"
                                    maxLength={6}
                                    value={mfaCode}
                                    onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                                    onKeyDown={(e) => e.key === 'Enter' && handleMfaLogin()}
                                    textAlign="center" fontSize="2xl" letterSpacing="0.2em"
                                    size="lg" borderRadius="xl"
                                    autoFocus
                                />
                            </FormControl>
                            <Button colorScheme="purple" w="full" size="lg" borderRadius="xl" isLoading={isLoading} onClick={handleMfaLogin}>
                                Verify &amp; Login
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => setStep('admin-otp')}>← Back to WhatsApp OTP</Button>
                            <Divider />
                            <Box textAlign="center">
                                <Button variant="link" colorScheme="red" size="xs" onClick={() => { setBackupCodeInput(''); setStep('reset-backup'); }}>
                                    🔄 Reset 2FA using Master Code
                                </Button>
                            </Box>
                        </Stack>
                    )}

                    {step === 'mfa-setup' && (
                        <VStack spacing={4}>
                            <Box border="4px solid" borderColor="gray.100" p={2} borderRadius="lg">
                                <Image src={qrCode} alt="MFA QR Code" />
                            </Box>
                            <Text fontSize="xs" textAlign="center" color="gray.600">
                                Scan with Google Authenticator, then enter 6-digit code.
                            </Text>
                            <Input
                                placeholder="000000"
                                maxLength={6}
                                value={mfaCode}
                                onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                                textAlign="center" size="lg" borderRadius="xl"
                            />
                            <Button colorScheme="purple" w="full" onClick={handleCompleteMfaSetup} isLoading={isLoading}>
                                Confirm &amp; Enable
                            </Button>
                            <Button variant="ghost" size="xs" onClick={() => setStep('admin-otp')}>Cancel Setup</Button>
                        </VStack>
                    )}

                    {step === 'reset-backup' && (
                        <Stack spacing={4}>
                            <Box bg="blue.50" border="1px solid" borderColor="blue.300" borderRadius="xl" p={3}>
                                <Text fontSize="xs" fontWeight="700" color="blue.700">🔐 Master Recovery</Text>
                                <Text fontSize="xs" color="blue.600" mt={1}>
                                    Enter master recovery code to reset 2FA settings.
                                </Text>
                            </Box>
                            <FormControl isRequired>
                                <FormLabel fontSize="sm" fontWeight="700">Master Recovery Code</FormLabel>
                                <Input
                                    placeholder="Enter Master Code"
                                    type="password"
                                    value={backupCodeInput}
                                    onChange={(e) => setBackupCodeInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleResetWithBackup()}
                                    textAlign="center" fontSize="xl"
                                    size="lg" borderRadius="xl"
                                />
                            </FormControl>
                            <Button colorScheme="blue" w="full" size="lg" borderRadius="xl" isLoading={resetLoading} onClick={handleResetWithBackup}>
                                Reset 2FA Now
                            </Button>
                            <Button variant="link" size="xs" onClick={() => setStep('admin-otp')}>← Back</Button>
                        </Stack>
                    )}
                </Box>
            </ModalContent>
        </Modal>
    );
};

// Helper for images
const getImageUrl = (path) => {
    if (!path) return 'https://via.placeholder.com/150';
    if (path.startsWith('http')) return path;
    // Use relative path so Vite proxy works on mobile (no hardcoded localhost)
    if (import.meta.env.VITE_API_BASE_URL) {
        const base = import.meta.env.VITE_API_BASE_URL.replace(/\/$/, '');
        const cleanPath = path.startsWith('/') ? path : `/${path}`;
        return `${base}${cleanPath}`;
    }
    return path.startsWith('/') ? path : `/${path}`;
};

const EnquiryDrawer = ({ isOpen, onClose, cart = [], onOpenAuth }) => {
    const toast = useToast();
    const { clearCart, removeFromCart, updateQuantity } = useCart();
    const { user, checkPhone } = useAuth();
    const navigate = useNavigate();

    const [isSending, setIsSending] = React.useState(false);
    const [isCheckingPhone, setIsCheckingPhone] = React.useState(false);
    const [adminPhoneBlockedError, setAdminPhoneBlockedError] = React.useState('');

    const [phoneInput, setPhoneInput] = React.useState('');
    const [adminClientStatus, setAdminClientStatus] = React.useState('none'); // 'none' | 'found' | 'notfound'
    const [showFullAdminForm, setShowFullAdminForm] = React.useState(false);

    const [formData, setFormData] = React.useState({
        companyName: '',
        contactPersonName: '',
        email: '',
        gstNumber: '',
        address: ''
    });

    const pendingSubmitRef = React.useRef(false);

    // Reset flow when drawer is opened
    React.useEffect(() => {
        if (isOpen) {
            setPhoneInput('');
            setAdminPhoneBlockedError('');
            pendingSubmitRef.current = false;
        }
    }, [isOpen]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const safeCart = Array.isArray(cart) ? cart : [];

    // Auto-submit enquiry immediately after successful customer login from cart!
    React.useEffect(() => {
        if (pendingSubmitRef.current && user && !user.isAdmin && safeCart.length > 0) {
            pendingSubmitRef.current = false;
            submitEnquiry(user);
        }
    }, [user, safeCart]);

    // Auto-fill for admin mode when phone number is entered
    React.useEffect(() => {
        const fetchUserData = async () => {
            const rawDigits = phoneInput.replace(/\D/g, '');
            const cleanPhone = rawDigits.slice(-10);
            // Auto-fill if Admin is logged in and phone has at least 10 digits (extracting core 10 digits)
            if (user?.isAdmin && cleanPhone.length === 10) {
                setIsCheckingPhone(true);
                try {
                    const res = await api.get(`/auth/phone/${cleanPhone}`);
                    if (res.data) {
                        const userData = res.data?.user || res.data;
                        const hasEmail = !!userData.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email);
                        setFormData({
                            companyName: userData.companyName || '',
                            contactPersonName: userData.contactPersonName || userData.name || '',
                            email: userData.email || '',
                            gstNumber: userData.gstNumber || '',
                            address: userData.address || userData.clientAddress || ''
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
                                description: `Ready to submit for ${userData.contactPersonName || userData.companyName || userData.name}`,
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
                        setFormData({ 
                            companyName: '', 
                            contactPersonName: '', 
                            email: `${cleanPhone}@gmail.com`, 
                            gstNumber: '',
                            address: '' 
                        });
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
            const rawPhone = isAdm ? phoneInput : (caller.phone || phoneInput || 'N/A');
            const clean10 = rawPhone !== 'N/A' ? (rawPhone.replace(/\D/g, '').slice(-10) || rawPhone) : 'N/A';

            const finalCompanyName = isAdm ? formData.companyName : (caller.companyName || 'Guest');
            const finalContactPerson = isAdm ? formData.contactPersonName : (caller.name || caller.contactPersonName || 'Guest');
            const finalPhone = clean10;
            const finalEmail = isAdm ? formData.email : (caller.email || 'N/A');
            const finalGst = isAdm ? formData.gstNumber : (caller.gstNumber || '');
            const finalAddress = isAdm ? formData.address : (caller.address || formData.address || '');

            const enquiryData = {
                companyName: finalCompanyName,
                contactPersonName: finalContactPerson,
                phone: finalPhone,
                email: finalEmail,
                gstNumber: finalGst,
                address: finalAddress,
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
            setPhoneInput('');
            setFormData({ companyName: '', contactPersonName: '', email: '', gstNumber: '', address: '' });

            navigate('/products');
        } catch (error) {
            console.error(error);
            toast({ title: "Failed", description: "Could not send request.", status: "error" });
        } finally {
            setIsSending(false);
        }
    };

    const handleAction = async (e) => {
        e.preventDefault();

        if (user && !user.isAdmin) {
            // Already logged in as a normal user, submit using profile
            await submitEnquiry(user);
        } else if (user && user.isAdmin) {
            // Admin is logged in, they must provide client details
            const cleanPhone = phoneInput.replace(/\D/g, '').slice(-10);
            if (cleanPhone.length !== 10) {
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
        } else {
            // Customer is NOT logged in: validate 10 digits and check phone status
            const cleanPhone = phoneInput.replace(/\D/g, '').slice(-10);
            if (!cleanPhone || cleanPhone.length !== 10) {
                return toast({
                    title: "Mobile Number Required",
                    description: "Please enter your 10-digit mobile number.",
                    status: "warning",
                    duration: 3000
                });
            }

            setAdminPhoneBlockedError('');
            setIsCheckingPhone(true);
            try {
                const res = await checkPhone(cleanPhone);
                setIsCheckingPhone(false);

                if (!res || !res.success) {
                    return toast({
                        title: "Error Checking Number",
                        description: res?.msg || "Unable to verify phone number.",
                        status: "error",
                        duration: 4000
                    });
                }

                // Strictly disallow administrative accounts from submitting customer enquiries!
                if (res.isAdmin || res.role === 'admin' || res.requiresVerification) {
                    const blockMsg = "Administrative phone numbers cannot be used for customer enquiries. Please enter a customer mobile number.";
                    setAdminPhoneBlockedError(blockMsg);
                    return toast({
                        title: "Admin Number Not Allowed",
                        description: blockMsg,
                        status: "error",
                        duration: 6000,
                        isClosable: true
                    });
                }

                pendingSubmitRef.current = true;
                onClose(); // Close the drawer smoothly so login modal is centered with zero blur!
                if (onOpenAuth) {
                    onOpenAuth(cleanPhone, 'cart');
                }
            } catch (err) {
                setIsCheckingPhone(false);
                return toast({
                    title: "Error",
                    description: "Failed to verify phone number. Please try again.",
                    status: "error",
                    duration: 3000
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
                                const mainImage = product.localImages?.[0] || product.images?.[0] || product.photos?.[0] || null;

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
                                    <Box p={4} borderWidth="1px" borderRadius="xl" bg="green.50" borderColor="green.200">
                                        <HStack spacing={2} mb={2}>
                                            <FiCheckCircle color="#2F855A" size={18} />
                                            <Text fontWeight="bold" color="green.800" fontSize="sm">
                                                Verified Customer Details
                                            </Text>
                                        </HStack>
                                        <Stack spacing={1.5} fontSize="sm">
                                            <Text><b>Company:</b> {user.companyName || user.name || 'N/A'}</Text>
                                            {user.contactPersonName && <Text><b>Contact Person:</b> {user.contactPersonName}</Text>}
                                            <Text><b>Phone:</b> +91 {user.phone}</Text>
                                            {user.address && <Text><b>Delivery Address:</b> {user.address}</Text>}
                                            {user.gstNumber && <Text><b>GST:</b> {user.gstNumber}</Text>}
                                        </Stack>
                                        <Text fontSize="xs" color="gray.500" mt={2}>
                                            Your enquiry will be submitted securely from your account.
                                        </Text>
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

                                        {(showFullAdminForm || (adminClientStatus === 'notfound' && phoneInput.replace(/\D/g, '').length >= 10)) && (
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
                                                <FormControl>
                                                    <FormLabel fontSize="sm" mb={1}>Client Address (Optional)</FormLabel>
                                                    <Textarea size="sm" rows={2} name="address" placeholder="e.g. 123 Industrial Area, City, State" value={formData.address || ''} onChange={handleChange} />
                                                </FormControl>
                                            </Stack>
                                        )}
                                    </Stack>
                                ) : (
                                    <Stack spacing={3}>
                                        <Box p={3} bg="blue.50" borderRadius="xl" border="1px solid" borderColor="blue.100">
                                            <Text fontSize="xs" color="blue.800" lineHeight="1.5">
                                                Please enter your 10-digit mobile number below to proceed with your enquiry.
                                            </Text>
                                        </Box>
                                        <FormControl isRequired isInvalid={!!adminPhoneBlockedError}>
                                            <FormLabel fontSize="xs" fontWeight="800" color="gray.700" textTransform="uppercase" letterSpacing="0.5px">
                                                Phone Number
                                            </FormLabel>
                                            <InputGroup size="md">
                                                <InputLeftAddon fontWeight="800" bg="gray.100" color="gray.700" borderRadius="xl">
                                                    🇮🇳 +91
                                                </InputLeftAddon>
                                                <Input
                                                    type="tel"
                                                    placeholder="9876543210"
                                                    maxLength={10}
                                                    value={phoneInput}
                                                    onChange={(e) => {
                                                        setPhoneInput(e.target.value.replace(/\D/g, ''));
                                                        setAdminPhoneBlockedError('');
                                                    }}
                                                    borderRadius="xl"
                                                    fontWeight="bold"
                                                    letterSpacing="1px"
                                                    autoFocus
                                                />
                                            </InputGroup>
                                        </FormControl>

                                        {adminPhoneBlockedError && (
                                            <Alert status="error" borderRadius="xl" variant="subtle" border="1px solid" borderColor="red.300" py={2.5}>
                                                <AlertIcon />
                                                <Box flex="1">
                                                    <Text fontSize="xs" fontWeight="bold" color="red.800">
                                                        Admin Number Not Allowed
                                                    </Text>
                                                    <AlertDescription fontSize="xs" color="red.700" display="block" mt={0.5}>
                                                        {adminPhoneBlockedError}
                                                    </AlertDescription>
                                                </Box>
                                            </Alert>
                                        )}

                                        <Text fontSize="2xs" color="gray.500">
                                            If your account already exists, you will enter your password on the next screen. If you are a new customer, you will quickly register your company details.
                                        </Text>
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
                                loadingText={isCheckingPhone ? 'Checking Number...' : (user ? 'Submitting Enquiry...' : 'Opening Login...')}
                                borderRadius="xl"
                                fontWeight="800"
                            >
                                {user ? 'Submit Enquiry' : 'Verify & Continue →'}
                            </Button>
                        </Stack>
                    </DrawerFooter>
                )}
            </DrawerContent>
        </Drawer>
    )
}

export default Header;
