import React, { useState, useEffect } from 'react';
import {
    Box, Flex, VStack, Text, IconButton, useColorModeValue, Drawer, DrawerContent,
    useDisclosure, Icon, Link
} from '@chakra-ui/react';
import { FiHome, FiBox, FiMessageSquare, FiMenu, FiX, FiLogOut, FiGlobe, FiArrowLeft } from 'react-icons/fi'; // Using Fi icons as standard
import { Link as RouterLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const LinkItems = [
    { name: 'Dashboard', icon: FiHome, path: '/admin/dashboard' },
    { name: 'Products (Admin)', icon: FiBox, path: '/admin/products' },
    { name: 'Enquiries', icon: FiMessageSquare, path: '/admin/enquiries' },
];

const SidebarContent = ({ onClose, user, logout, navigate, ...rest }) => {
    return (
        <Box
            bg={useColorModeValue('white', 'gray.900')}
            borderRight="1px"
            borderRightColor={useColorModeValue('gray.200', 'gray.700')}
            w={{ base: 'full', md: 60 }}
            pos="fixed"
            h="full"
            display="flex"
            flexDirection="column"
            {...rest}>
            <Flex h="20" alignItems="center" mx="8" justify="space-between">
                <Text fontSize="2xl" fontFamily="monospace" fontWeight="bold">
                    Admin Panel
                </Text>
                <IconButton display={{ base: 'flex', md: 'none' }} onClick={onClose} variant="ghost" icon={<FiX />} aria-label="Close" />
            </Flex>

            {/* User Info Section */}
            <Box px="8" py="4" mb="4" borderBottom="1px" borderColor="gray.100">
                <Text fontSize="xs" color="gray.500" fontWeight="bold" textTransform="uppercase">Logged in as</Text>
                <Text fontWeight="bold" color="brand.600" noOfLines={1}>{user?.name || 'Admin'}</Text>
            </Box>

            <Box flex="1">
                {LinkItems.map((link) => (
                    <NavItem key={link.name} icon={link.icon} path={link.path}>
                        {link.name}
                    </NavItem>
                ))}
            </Box>

            {/* Public Navigation */}
            <Box px="4" mt={4} borderTop="1px" borderColor="gray.100" pt={4}>
                <Text fontSize="xs" fontWeight="bold" color="gray.400" mb={2} px={4}>QUICK LINKS</Text>
                <NavItem icon={FiGlobe} path="/">Home Page</NavItem>
                <NavItem icon={FiBox} path="/products">Public Products</NavItem>
            </Box>

            {/* Logout/Exit Button at Bottom */}
            <Box mt="auto" p="4" mx="4" mb="6">
                <Flex
                    align="center"
                    p="4"
                    borderRadius="lg"
                    role="group"
                    cursor="pointer"
                    _hover={{ bg: 'gray.100' }}
                    onClick={() => navigate('/')}>
                    <Icon mr="4" fontSize="16" as={FiArrowLeft} />
                    <Text fontWeight="bold">Go Out (Exit)</Text>
                </Flex>
                <Flex
                    align="center"
                    p="4"
                    borderRadius="lg"
                    role="group"
                    cursor="pointer"
                    color="red.500"
                    _hover={{
                        bg: 'red.50',
                        color: 'red.600',
                    }}
                    onClick={() => {
                        logout();
                        navigate('/login');
                    }}>
                    <Icon mr="4" fontSize="16" as={FiLogOut} />
                    <Text fontWeight="bold">Logout</Text>
                </Flex>
            </Box>
        </Box>
    );
};

const NavItem = ({ icon, children, path, ...rest }) => {
    const location = useLocation();
    const isActive = location.pathname.startsWith(path);

    return (
        <Link as={RouterLink} to={path} style={{ textDecoration: 'none' }} _focus={{ boxShadow: 'none' }}>
            <Flex
                align="center"
                p="4"
                mx="4"
                borderRadius="lg"
                role="group"
                cursor="pointer"
                bg={isActive ? 'brand.500' : 'transparent'}
                color={isActive ? 'white' : 'inherit'}
                _hover={{
                    bg: 'brand.400',
                    color: 'white',
                }}
                {...rest}>
                {icon && (
                    <Icon
                        mr="4"
                        fontSize="16"
                        _groupHover={{
                            color: 'white',
                        }}
                        as={icon}
                    />
                )}
                {children}
            </Flex>
        </Link>
    );
};

const MobileNav = ({ onOpen, ...rest }) => {
    return (
        <Flex
            ml={{ base: 0, md: 60 }}
            px={{ base: 4, md: 4 }}
            height="20"
            alignItems="center"
            bg={useColorModeValue('white', 'gray.900')}
            borderBottomWidth="1px"
            borderBottomColor={useColorModeValue('gray.200', 'gray.700')}
            justifyContent={{ base: 'space-between', md: 'flex-end' }}
            {...rest}>
            <IconButton
                display={{ base: 'flex', md: 'none' }}
                onClick={onOpen}
                variant="outline"
                aria-label="open menu"
                icon={<FiMenu />}
            />

            <Text
                display={{ base: 'flex', md: 'none' }}
                fontSize="2xl"
                fontFamily="monospace"
                fontWeight="bold">
                Admin
            </Text>
        </Flex>
    );
};

const AdminLayout = () => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const { user, logout, loading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading && (!user || !user.isAdmin)) {
            navigate('/');
        }
    }, [user, loading, navigate]);

    if (loading) return null;
    if (!user || !user.isAdmin) return null;

    return (
        <Box minH="100vh" bg={useColorModeValue('gray.100', 'gray.900')}>
            <SidebarContent
                user={user}
                logout={logout}
                navigate={navigate}
                onClose={() => onClose}
                display={{ base: 'none', md: 'block' }}
            />
            <Drawer
                autoFocus={false}
                isOpen={isOpen}
                placement="left"
                onClose={onClose}
                returnFocusOnClose={false}
                onOverlayClick={onClose}
                size="xs">
                <DrawerContent>
                    <SidebarContent
                        user={user}
                        logout={logout}
                        navigate={navigate}
                        onClose={onClose}
                    />
                </DrawerContent>
            </Drawer>
            {/* mobilenav */}
            <MobileNav onOpen={onOpen} />
            <Box ml={{ base: 0, md: 60 }} p={{ base: 3, md: 4 }}>
                <Outlet />
            </Box>
        </Box>
    );
};

export default AdminLayout;
