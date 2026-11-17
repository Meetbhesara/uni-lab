import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Box, Heading, SimpleGrid, Icon, Text, Button, Flex,
    Skeleton
} from '@chakra-ui/react';
import {
    FiBox, FiMessageSquare, FiClock, FiUsers, FiActivity
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { DEMO_PRODUCTS, DEMO_ENQUIRIES } from '../../data/mockData';
import HealthModal from '../../components/HealthModal';

const MotionBox = motion(Box);

const AdminDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [stats, setStats] = useState({
        products: 0,
        totalEnquiries: 0,
        pendingEnquiries: 0,
        doneQuotations: 0,
        rejectedQuotations: 0,
        totalUsers: 0
    });
    const [statsLoading, setStatsLoading] = useState(true);
    const [isHealthOpen, setIsHealthOpen] = useState(false);

    // Debounce ref for realtime listener
    const realtimeDebounceRef = useRef(null);

    // ─── PARALLEL FETCH: Fast stats retrieval ───────────────────────────────────
    const fetchAllDashboardData = useCallback(async () => {
        setStatsLoading(true);

        const [prodRes, quoteRes, enqRes, usersRes] = await Promise.allSettled([
            api.get('/products/count'),
            api.get('/quotations/stats'),
            api.get('/enquiries/stats'),
            api.get('/auth/users')
        ]);

        const productCount = prodRes.status === 'fulfilled'
            ? (prodRes.value.data.count ?? DEMO_PRODUCTS.length)
            : DEMO_PRODUCTS.length;

        const qStats = quoteRes.status === 'fulfilled' && quoteRes.value.data.success
            ? quoteRes.value.data
            : { done: 0, rejected: 0 };

        const eStats = enqRes.status === 'fulfilled' && enqRes.value.data.success
            ? enqRes.value.data
            : { total: DEMO_ENQUIRIES.length, unseen: 0 };

        let totalUsers = 0;
        if (usersRes.status === 'fulfilled') {
            const uData = usersRes.value.data.users || usersRes.value.data || [];
            const uArr = Array.isArray(uData) ? uData : [];
            totalUsers = usersRes.value.data.total || uArr.length;
        }

        setStats({
            products: productCount,
            totalEnquiries: eStats.total ?? 0,
            pendingEnquiries: eStats.unseen ?? 0,
            doneQuotations: qStats.done ?? 0,
            rejectedQuotations: qStats.rejected ?? 0,
            totalUsers
        });

        setStatsLoading(false);
    }, []);

    useEffect(() => {
        fetchAllDashboardData();
    }, [fetchAllDashboardData]);

    // Debounced realtime listener
    useEffect(() => {
        const handleRealtimeUpdate = () => {
            if (realtimeDebounceRef.current) clearTimeout(realtimeDebounceRef.current);
            realtimeDebounceRef.current = setTimeout(() => {
                fetchAllDashboardData();
            }, 1500);
        };
        window.addEventListener('app-realtime-update', handleRealtimeUpdate);
        return () => {
            window.removeEventListener('app-realtime-update', handleRealtimeUpdate);
            if (realtimeDebounceRef.current) clearTimeout(realtimeDebounceRef.current);
        };
    }, [fetchAllDashboardData]);

    return (
        <Box py={2}>
            {/* Page Title & Health Button */}
            <Box bg="white" p={{ base: 4, md: 6 }} borderRadius="2xl" boxShadow="sm" border="1px" borderColor="gray.100" mb={6}>
                <Flex align="center" justify="space-between" wrap="wrap" gap={4}>
                    <Box>
                        <Heading fontSize={{ base: 'xl', md: '2xl' }} fontWeight="800" bgGradient="linear(to-r, brand.500, brand.700)" bgClip="text" mb={1}>
                            Dashboard Overview
                        </Heading>
                        <Text fontSize="sm" color="gray.500">Real-time performance metrics and business health.</Text>
                    </Box>
                    <Button
                        leftIcon={<FiActivity />}
                        colorScheme="purple"
                        bgGradient="linear(to-r, purple.600, brand.600)"
                        color="white"
                        _hover={{ bgGradient: "linear(to-r, purple.700, brand.700)", transform: "translateY(-1px)" }}
                        shadow="md"
                        borderRadius="xl"
                        px={6}
                        size="md"
                        onClick={() => setIsHealthOpen(true)}
                    >
                        Server & AI Health Monitor ✨
                    </Button>
                </Flex>
            </Box>

            {/* Stats Grid */}
            <SimpleGrid columns={{ base: 2, md: 3, lg: 5 }} spacing={5} mb={8}>
                {[
                    { label: 'Products', value: stats.products, icon: FiBox, color: 'brand.500', help: 'Inventory items', bg: 'brand.50', path: '/unique-lab-instruments?tab=products' },
                    { label: 'Total Enquiries', value: stats.totalEnquiries, icon: FiMessageSquare, color: 'blue.500', help: 'All time', bg: 'blue.50', path: '/unique-lab-instruments?tab=enquiries' },
                    { label: 'New Enquiries', value: stats.pendingEnquiries, icon: FiMessageSquare, color: 'orange.500', help: 'Action needed', bg: 'orange.50', path: '/unique-lab-instruments?tab=enquiries' },
                    { label: 'Success (Done)', value: stats.doneQuotations, icon: FiClock, color: 'green.500', help: 'Closed deals', bg: 'green.50', path: '/unique-lab-instruments?tab=enquiries' },
                    { label: 'Registered Users', value: stats.totalUsers, icon: FiUsers, color: 'purple.500', help: 'Website clients', bg: 'purple.50', path: '/admin/login-report?tab=accounts' },
                ].map((s, i) => (
                    <MotionBox
                        key={s.label}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35, delay: i * 0.05 }}
                        bg="white"
                        p={5}
                        borderRadius="xl"
                        boxShadow="sm"
                        border="1px solid"
                        borderColor="gray.100"
                        cursor="pointer"
                        onClick={() => s.path && navigate(s.path)}
                        _hover={{ boxShadow: 'md', transform: 'translateY(-2px)', borderColor: 'purple.200' }}
                        style={{ transition: 'all 0.2s' }}
                    >
                        <Flex align="center" mb={3} gap={2}>
                            <Box p={2} bg={s.bg} borderRadius="lg">
                                <Icon as={s.icon} w={4} h={4} color={s.color} />
                            </Box>
                        </Flex>
                        {statsLoading ? (
                            <>
                                <Skeleton height="28px" width="60px" borderRadius="md" mb={2} />
                                <Skeleton height="12px" width="80px" borderRadius="md" mb={1} />
                                <Skeleton height="10px" width="55px" borderRadius="md" />
                            </>
                        ) : (
                            <>
                                <Text fontSize="2xl" fontWeight="900" color="gray.800" lineHeight="1">{s.value}</Text>
                                <Text fontSize="xs" fontWeight="700" color="gray.600" mt={1}>{s.label}</Text>
                                <Text fontSize="10px" color="gray.400" mt={0.5}>{s.help}</Text>
                            </>
                        )}
                    </MotionBox>
                ))}
            </SimpleGrid>

            {/* Health & AI Diagnostics Modal */}
            <HealthModal isOpen={isHealthOpen} onClose={() => setIsHealthOpen(false)} />
        </Box>
    );
};

export default AdminDashboard;
