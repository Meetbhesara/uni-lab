import React, { useState, useEffect } from 'react';
import {
    Box, Flex, VStack, Text, IconButton, useColorModeValue, Drawer, DrawerContent,
    useDisclosure, Icon, Link
} from '@chakra-ui/react';
import {
    FiHome, FiBox, FiMessageSquare, FiMenu, FiX, FiLogOut,
    FiGlobe, FiArrowLeft, FiFileText, FiLock, FiSettings
} from 'react-icons/fi';
import { Link as RouterLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { hasPermission } from '../../utils/permissions';
import { useRealtimeSync } from '../../utils/useRealtimeSync';

const LinkItems = [
    { name: 'Dashboard', icon: FiHome, path: '/admin/dashboard', permissionKey: 'dashboard' },
    { name: 'Login Report', icon: FiFileText, path: '/admin/login-report', permissionKey: null },
    { name: 'Products', icon: FiBox, path: '/admin/products', permissionKey: 'products' },
    { name: 'Enquiries', icon: FiMessageSquare, path: '/admin/enquiries', permissionKey: 'enquiries' },
    { name: 'WhatsApp', icon: FiSettings, path: '/admin/whatsapp-settings', permissionKey: null },
];

/* ── Bottom tabs shown on mobile only ──────────────────────── */
const MobileBottomTabs = [
    { name: 'Home', icon: FiHome, path: '/admin/dashboard' },
    { name: 'Products', icon: FiBox, path: '/admin/products' },
    { name: 'Enquiries', icon: FiMessageSquare, path: '/admin/enquiries' },
    { name: 'Public', icon: FiGlobe, path: '/' },
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
            <Flex h="16" alignItems="center" mx="6" justify="space-between">
                <Text fontSize="xl" fontFamily="monospace" fontWeight="bold" color="brand.600">
                    Admin Panel
                </Text>
                <IconButton
                    display={{ base: 'flex', md: 'none' }}
                    onClick={onClose}
                    variant="ghost"
                    icon={<FiX />}
                    aria-label="Close"
                />
            </Flex>

            {/* User Info Section */}
            <Box px="6" py="3" mb="2" borderBottom="1px" borderColor="gray.100">
                <Text fontSize="10px" color="gray.400" fontWeight="800" textTransform="uppercase" letterSpacing="wider">Logged in as</Text>
                <Text fontWeight="bold" color="brand.600" fontSize="sm" noOfLines={1}>{user?.name || 'Admin'}</Text>
                {!user?.isSuperAdmin && !user?.permissions && (
                    <Text mt={2} color="red.500" fontSize="xs" fontWeight="bold" bg="red.50" p={2} borderRadius="md" border="1px solid" borderColor="red.200">
                        ⚠️ OUTDATED TOKEN.<br />Please log out and log in again!
                    </Text>
                )}
            </Box>

            <Box flex="1" overflowY="auto" py="2">
                {LinkItems.map((link) => {
                    if (link.permissionKey && !hasPermission(user, link.permissionKey, 'read')) return null;
                    return (
                        <NavItem key={link.name} icon={link.icon} path={link.path} onClose={onClose}>
                            {link.name}
                        </NavItem>
                    );
                })}
                {user?.isSuperAdmin && (
                    <NavItem icon={FiLock} path="/admin/permissions" onClose={onClose}>
                        Permissions
                    </NavItem>
                )}
            </Box>

            {/* Quick Links */}
            <Box px="3" mt={2} borderTop="1px" borderColor="gray.100" pt={3} pb={1}>
                <Text fontSize="10px" fontWeight="800" color="gray.400" mb={1} px={3} letterSpacing="wider">QUICK LINKS</Text>
                <NavItem icon={FiGlobe} path="/" onClose={onClose}>Home Page</NavItem>
                <NavItem icon={FiBox} path="/products" onClose={onClose}>Public Products</NavItem>
            </Box>

            {/* Logout/Exit Buttons */}
            <Box mt="auto" p="3" mx="3" mb="4">
                <Flex
                    align="center"
                    p="3"
                    borderRadius="lg"
                    role="group"
                    cursor="pointer"
                    _hover={{ bg: 'gray.100' }}
                    onClick={() => navigate('/')}>
                    <Icon mr="3" fontSize="16" as={FiArrowLeft} />
                    <Text fontWeight="bold" fontSize="sm">Exit Admin</Text>
                </Flex>
                <Flex
                    align="center"
                    p="3"
                    borderRadius="lg"
                    role="group"
                    cursor="pointer"
                    color="red.500"
                    _hover={{ bg: 'red.50', color: 'red.600' }}
                    onClick={() => { logout(); navigate('/'); }}>
                    <Icon mr="3" fontSize="16" as={FiLogOut} />
                    <Text fontWeight="bold" fontSize="sm">Logout</Text>
                </Flex>
            </Box>
        </Box>
    );
};

const NavItem = ({ icon, children, path, onClose, ...rest }) => {
    const location = useLocation();
    const isActive = location.pathname.startsWith(path) && path !== '/';

    return (
        <Link as={RouterLink} to={path} style={{ textDecoration: 'none' }} _focus={{ boxShadow: 'none' }} onClick={onClose}>
            <Flex
                align="center"
                p="3"
                mx="3"
                borderRadius="lg"
                role="group"
                cursor="pointer"
                bg={isActive ? 'brand.500' : 'transparent'}
                color={isActive ? 'white' : 'inherit'}
                _hover={{ bg: isActive ? 'brand.600' : 'brand.50', color: isActive ? 'white' : 'brand.600' }}
                transition="all 0.15s"
                {...rest}>
                {icon && (
                    <Icon mr="3" fontSize="16" as={icon} />
                )}
                <Text fontSize="sm" fontWeight={isActive ? '700' : '500'}>{children}</Text>
            </Flex>
        </Link>
    );
};

const MobileTopBar = ({ onOpen }) => {
    return (
        <Flex
            display={{ base: 'flex', md: 'none' }}
            px={4}
            height="14"
            alignItems="center"
            bg={useColorModeValue('white', 'gray.900')}
            borderBottomWidth="1px"
            borderBottomColor={useColorModeValue('gray.200', 'gray.700')}
            justifyContent="space-between"
            position="sticky"
            top="0"
            zIndex="100"
            boxShadow="sm">
            <Text fontSize="xl" fontFamily="monospace" fontWeight="bold" color="brand.600">
                Admin
            </Text>
            <IconButton
                onClick={onOpen}
                variant="ghost"
                aria-label="Open menu"
                icon={<FiMenu />}
                size="md"
            />
        </Flex>
    );
};

/* ── Mobile Bottom Navigation — always fixed at bottom on mobile ── */
const MobileBottomNav = ({ user }) => {
    const location = useLocation();
    const navigate = useNavigate();

    const tabs = [
        ...MobileBottomTabs,
        ...(user?.isSuperAdmin ? [{ name: 'Perms', icon: FiLock, path: '/admin/permissions' }] : [])
    ];

    return (
        <Box
            display={{ base: 'flex', md: 'none' }}
            as="nav"
            position="fixed"
            bottom="0"
            left="0"
            right="0"
            zIndex="1200"
            bg="white"
            borderTop="1px solid"
            borderColor="gray.200"
            boxShadow="0 -4px 24px rgba(0,0,0,0.10)"
            pb="env(safe-area-inset-bottom, 0px)"
            justify="space-around"
            align="center"
            py={1}
        >
            {tabs.map((tab) => {
                const isActive =
                    tab.path === '/'
                        ? location.pathname === '/'
                        : location.pathname.startsWith(tab.path);
                return (
                    <Flex
                        key={tab.name}
                        as="button"
                        direction="column"
                        align="center"
                        justify="center"
                        gap="1px"
                        px={3}
                        py={2}
                        borderRadius="xl"
                        cursor="pointer"
                        border="none"
                        bg={isActive ? 'brand.50' : 'transparent'}
                        color={isActive ? 'brand.500' : 'gray.400'}
                        onClick={() => navigate(tab.path)}
                        flex="1"
                        minH="52px"
                        transition="all 0.15s"
                        _hover={{ bg: 'brand.50', color: 'brand.500' }}
                        _active={{ transform: 'scale(0.95)' }}
                    >
                        <Icon as={tab.icon} boxSize={5} />
                        <Text
                            fontSize="9px"
                            fontWeight={isActive ? '800' : '600'}
                            letterSpacing="0.02em"
                            lineHeight="1.2"
                            mt="2px"
                        >
                            {tab.name}
                        </Text>
                    </Flex>
                );
            })}
        </Box>
    );
};

const AdminLayout = () => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const { user, logout, loading, refreshUser } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (!loading && (!user || !user.isAdmin)) {
            navigate('/');
        }
    }, [user, loading, navigate]);

    // Live Background Sync
    useEffect(() => {
        if (refreshUser) refreshUser();
    }, [location.pathname]);

    useRealtimeSync(user);

    if (loading) return null;
    if (!user || !user.isAdmin) return null;

    return (
        <Box minH="100vh" bg={useColorModeValue('gray.100', 'gray.900')}>
            {/* Sidebar — desktop only */}
            <SidebarContent
                user={user}
                logout={logout}
                navigate={navigate}
                onClose={() => onClose}
                display={{ base: 'none', md: 'block' }}
            />

            {/* Drawer — mobile sidebar overlay */}
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

            {/* Mobile top header bar */}
            <MobileTopBar onOpen={onOpen} />

            {/* Main Content — extra bottom padding on mobile so bottom nav never covers content */}
            <Box
                ml={{ base: 0, md: 60 }}
                p={{ base: 3, md: 5 }}
                overflowX="hidden"
                minH={{ base: 'auto', md: 'calc(100vh - 80px)' }}
                pb={{ base: '80px', md: 5 }}>
                <Box maxW="100%" overflowX="auto">
                    <Outlet />
                </Box>
            </Box>

            {/* Mobile bottom tab navigation */}
            <MobileBottomNav user={user} />
        </Box>
    );
};

export default AdminLayout;
