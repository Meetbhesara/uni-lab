import React, { useState, useEffect } from 'react';
import {
    Box, Flex, VStack, Text, IconButton, useColorModeValue, Drawer, DrawerContent,
    useDisclosure, Icon, Link, Collapse
} from '@chakra-ui/react';
import {
    FiHome, FiBox, FiMessageSquare, FiMenu, FiX, FiLogOut,
    FiGlobe, FiArrowLeft, FiFileText, FiLock, FiSettings, FiLayers, FiBriefcase,
    FiChevronDown, FiChevronRight, FiClock
} from 'react-icons/fi';
import { FaBuilding, FaUserTie } from 'react-icons/fa';
import { Link as RouterLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { hasPermission } from '../../utils/permissions';
import { useRealtimeSync } from '../../utils/useRealtimeSync';
import Header from '../Header';
import CompanyDocShareWidget from './CompanyDocShareWidget';

const LinkItems = [
    { name: 'Dashboard', icon: FiHome, path: '/admin/dashboard', permissionKey: 'dashboard' },
    { name: 'Unique Survey', icon: FiLayers, path: '/services?view=masters', permissionKey: null },
    { 
        name: 'Unique Lab Instruments', 
        icon: FiBox, 
        path: '/unique-lab-instruments', 
        permissionCheck: (user) => hasPermission(user, 'products', 'read') || hasPermission(user, 'enquiries', 'read')
    },
    { name: 'WhatsApp', icon: FiSettings, path: '/admin/whatsapp-settings', permissionKey: null },
];

/* ── Bottom tabs shown on mobile only ──────────────────────── */
const MobileBottomTabs = [
    { name: 'Home', icon: FiHome, path: '/admin/dashboard' },
    { name: 'Survey', icon: FiLayers, path: '/services?view=masters' },
    { 
        name: 'Instruments', 
        icon: FiBox, 
        path: '/unique-lab-instruments',
        permissionCheck: (user) => hasPermission(user, 'products', 'read') || hasPermission(user, 'enquiries', 'read')
    },
    { name: 'Public', icon: FiGlobe, path: '/' },
];

const SidebarContent = ({ onClose, user, logout, navigate, ...rest }) => {
    return (
        <Box
            bg={useColorModeValue('white', 'gray.900')}
            borderRight="1px"
            borderRightColor={useColorModeValue('gray.200', 'gray.700')}
            w={{ base: 'full', md: '240px' }}
            h="100%"
            zIndex={90}
            flexShrink={0}
            display="flex"
            flexDirection="column"
            overflowY="auto"
            sx={{
                scrollbarWidth: 'none',
                '&::-webkit-scrollbar': { display: 'none' }
            }}
            {...rest}>
            <Flex h="14" alignItems="center" mx="4" justify="space-between" flexShrink={0}>
                <Text fontSize="lg" fontFamily="monospace" fontWeight="bold" color="brand.600">
                    Admin Panel
                </Text>
                <IconButton
                    display={{ base: 'flex', md: 'none' }}
                    onClick={onClose}
                    variant="ghost"
                    icon={<FiX />}
                    aria-label="Close"
                    size="sm"
                />
            </Flex>

            {/* User Info Section */}
            <Box px="4" py="2.5" mb="1" borderBottom="1px" borderColor="gray.100" flexShrink={0}>
                <Text fontSize="10px" color="gray.400" fontWeight="800" textTransform="uppercase" letterSpacing="wider">Logged in as</Text>
                <Text fontWeight="bold" color="brand.600" fontSize="sm" noOfLines={1}>{user?.name || 'Admin'}</Text>
                {!user?.isSuperAdmin && !user?.permissions && (
                    <Text mt={1} color="red.500" fontSize="xs" fontWeight="bold" bg="red.50" p={1.5} borderRadius="md" border="1px solid" borderColor="red.200">
                        ⚠️ OUTDATED TOKEN.<br />Please log out and log in again!
                    </Text>
                )}
            </Box>

            <Box flex="1" py="1.5" overflowY="auto" sx={{ scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } }}>
                {LinkItems.map((link) => {
                    if (link.permissionCheck && !link.permissionCheck(user)) return null;
                    if (link.permissionKey && !hasPermission(user, link.permissionKey, 'read')) return null;
                    if (link.isGroup) {
                        return (
                            <NavGroup key={link.name} item={link} user={user} onClose={onClose} />
                        );
                    }
                    return (
                        <NavItem key={link.name} icon={link.icon} path={link.path} onClose={onClose}>
                            {link.name}
                        </NavItem>
                    );
                })}
                {(!user?.permissions || user?.permissions?.loginReport?.read !== false || user?.isSuperAdmin) && (
                    <NavItem icon={FiClock} path="/admin/login-report" onClose={onClose}>
                        Login Report
                    </NavItem>
                )}
                {user?.isSuperAdmin && (
                    <NavItem icon={FiLock} path="/admin/permissions" onClose={onClose}>
                        Permissions
                    </NavItem>
                )}
                {(!user?.permissions || user?.permissions?.employeeMaster?.read !== false || user?.isSuperAdmin) && (
                    <NavItem icon={FaUserTie} path="/admin/employee-master" onClose={onClose}>
                        Employee Master
                    </NavItem>
                )}
                {(!user?.permissions || user?.permissions?.companyMaster?.read !== false || user?.isSuperAdmin) && (
                    <NavItem icon={FaBuilding} path="/admin/our-company" onClose={onClose}>
                        Our Company
                    </NavItem>
                )}
            </Box>

            {/* Logout/Exit Buttons */}
            <Box p="2" mx="2" mb="2" mt="auto" borderTop="1px" borderColor="gray.100" flexShrink={0}>
                <Flex
                    align="center"
                    py="2"
                    px="3"
                    borderRadius="md"
                    role="group"
                    cursor="pointer"
                    _hover={{ bg: 'gray.100' }}
                    onClick={() => navigate('/')}>
                    <Icon mr="3" fontSize="16" as={FiArrowLeft} />
                    <Text fontWeight="bold" fontSize="sm">Exit Admin</Text>
                </Flex>
                <Flex
                    align="center"
                    py="2"
                    px="3"
                    borderRadius="md"
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

const NavGroup = ({ item, user, onClose }) => {
    const location = useLocation();
    const isChildActive = (item.subItems || []).some(sub => 
        location.pathname === sub.path || location.pathname.startsWith(sub.path)
    );
    const [isOpen, setIsOpen] = useState(isChildActive);

    useEffect(() => {
        if (isChildActive) {
            setIsOpen(true);
        }
    }, [isChildActive]);

    const permittedSubItems = (item.subItems || []).filter(sub => 
        !sub.permissionKey || hasPermission(user, sub.permissionKey, 'read')
    );

    if (permittedSubItems.length === 0) return null;

    return (
        <Box mb={1}>
            <Flex
                align="center"
                justify="space-between"
                p="3"
                mx="3"
                borderRadius="lg"
                role="group"
                cursor="pointer"
                bg={isChildActive ? 'brand.50' : 'transparent'}
                color={isChildActive ? 'brand.600' : 'gray.700'}
                _hover={{ bg: isChildActive ? 'brand.100' : 'gray.100', color: 'brand.600' }}
                onClick={() => setIsOpen(!isOpen)}
                transition="all 0.15s"
            >
                <Flex align="center">
                    <Icon mr="3" fontSize="16" as={item.icon} color={isChildActive ? 'brand.600' : 'gray.500'} />
                    <Text fontSize="sm" fontWeight={isChildActive ? '700' : '600'}>
                        {item.name}
                    </Text>
                </Flex>
                <Icon
                    as={FiChevronDown}
                    transition="transform 0.2s"
                    transform={isOpen ? 'rotate(0deg)' : 'rotate(-90deg)'}
                    fontSize="14px"
                    color={isChildActive ? 'brand.600' : 'gray.400'}
                />
            </Flex>

            <Collapse in={isOpen} animateOpacity>
                <VStack align="stretch" spacing={1} mt={1} pl={4} pr={1}>
                    {permittedSubItems.map((sub) => {
                        const isSubActive = location.pathname === sub.path || location.pathname.startsWith(sub.path);
                        return (
                            <Link
                                key={sub.name}
                                as={RouterLink}
                                to={sub.path}
                                style={{ textDecoration: 'none' }}
                                _focus={{ boxShadow: 'none' }}
                                onClick={onClose}
                            >
                                <Flex
                                    align="center"
                                    py="2.5"
                                    px="3"
                                    mx="3"
                                    borderRadius="lg"
                                    role="group"
                                    cursor="pointer"
                                    bg={isSubActive ? 'brand.500' : 'transparent'}
                                    color={isSubActive ? 'white' : 'gray.600'}
                                    _hover={{ bg: isSubActive ? 'brand.600' : 'gray.100', color: isSubActive ? 'white' : 'brand.600' }}
                                    transition="all 0.15s"
                                >
                                    <Icon mr="2.5" fontSize="14" as={sub.icon} color={isSubActive ? 'white' : 'gray.400'} />
                                    <Text fontSize="xs" fontWeight={isSubActive ? '700' : '500'}>
                                        {sub.name}
                                    </Text>
                                </Flex>
                            </Link>
                        );
                    })}
                </VStack>
            </Collapse>
        </Box>
    );
};

const NavItem = ({ icon, children, path, onClose, ...rest }) => {
    const location = useLocation();
    const currentFull = location.pathname + location.search;
    const isExactMatch = currentFull === path;
    const isBasePathMatch = !path.includes('?') && path !== '/' && location.pathname.startsWith(path);
    const isServicesDefault = path === '/services?view=masters' && location.pathname === '/services' && !location.search.includes('view=public');
    const isActive = isExactMatch || isBasePathMatch || isServicesDefault;

    return (
        <Link as={RouterLink} to={path} style={{ textDecoration: 'none' }} _focus={{ boxShadow: 'none' }} onClick={onClose}>
            <Flex
                align="center"
                py="2"
                px="3"
                mx="2"
                my="0.5"
                borderRadius="lg"
                role="group"
                cursor="pointer"
                bg={isActive ? 'brand.500' : 'transparent'}
                color={isActive ? 'white' : 'inherit'}
                _hover={{ bg: isActive ? 'brand.600' : 'brand.50', color: isActive ? 'white' : 'brand.600' }}
                transition="all 0.15s"
                {...rest}>
                {icon && (
                    <Icon mr="2.5" fontSize="15" as={icon} />
                )}
                <Text fontSize="xs" fontWeight={isActive ? '700' : '600'}>{children}</Text>
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
                if (tab.permissionCheck && !tab.permissionCheck(user)) return null;
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
    const mainBg = useColorModeValue('gray.100', 'gray.900');
    const contentRef = React.useRef(null);

    useEffect(() => {
        if (!loading && (!user || !user.isAdmin)) {
            navigate('/');
        }
    }, [user, loading, navigate]);

    // Live Background Sync
    useEffect(() => {
        if (refreshUser) refreshUser();
        if (contentRef.current) {
            contentRef.current.scrollTo({ top: 0, behavior: 'instant' });
        }
    }, [location.pathname]);

    useRealtimeSync(user);

    if (loading) return null;
    if (!user || !user.isAdmin) return null;

    return (
        <Flex direction="column" h="100vh" maxH="100vh" overflow="hidden" bg={mainBg}>
            {/* Horizontal Header at top — flexShrink 0, zero gap */}
            <Box flexShrink={0} zIndex={1000}>
                <Header />
            </Box>

            {/* Main Admin Area: Vertical Sidebar attached directly to horizontal header + independent scrollable content */}
            <Flex flex="1" minH="0" overflow="hidden" position="relative">
                {/* Vertical Sidebar — directly attached to horizontal header with 0 space */}
                <SidebarContent
                    user={user}
                    logout={logout}
                    navigate={navigate}
                    onClose={() => onClose}
                    display={{ base: 'none', md: 'flex' }}
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

                {/* Main Content Area — scrolls independently */}
                <Box
                    ref={contentRef}
                    id="admin-main-scroll-container"
                    flex="1"
                    minW="0"
                    h="100%"
                    overflowY="auto"
                    display="flex"
                    flexDirection="column"
                >
                    {/* Mobile top header bar */}
                    <MobileTopBar onOpen={onOpen} />

                    {/* Main Content */}
                    <Box
                        p={{ base: 3, md: 5 }}
                        pb={{ base: '90px', md: 6 }}
                        flex="1"
                    >
                        <Box maxW="100%">
                            <Outlet />
                        </Box>
                    </Box>
                </Box>
            </Flex>

            {/* Mobile bottom tab navigation */}
            <MobileBottomNav user={user} />

            {/* Quick Action: Share Company Documents (WhatsApp) */}
            <CompanyDocShareWidget />
        </Flex>
    );
};

export default AdminLayout;
