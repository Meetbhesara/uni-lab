import React, { useState, useEffect } from 'react';
import { Box, Heading, SimpleGrid, Stat, StatLabel, StatNumber, StatHelpText, Icon } from '@chakra-ui/react';
import { FiBox, FiUsers, FiMessageSquare, FiClock } from 'react-icons/fi';
import api from '../../api/axios';
import { DEMO_PRODUCTS, DEMO_ENQUIRIES } from '../../data/mockData';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        products: 0,
        totalEnquiries: 0,
        pendingEnquiries: 0,
        doneQuotations: 0,
        rejectedQuotations: 0
    });

    useEffect(() => {
        const fetchData = async () => {
            let pCount = 0;
            let eCount = 0;

            // Fetch Products
            try {
                const prodRes = await api.get('/products');
                // Support multiple API structures: Array, { data: [] }, { products: [] }
                const pData = prodRes.data.products || prodRes.data.data || prodRes.data;
                pCount = Array.isArray(pData) ? pData.length : 0;
                console.log("Dashboard Products:", pCount, pData);
            } catch (err) {
                console.error("Dashboard Product Fetch Error:", err);
                pCount = DEMO_PRODUCTS.length;
            }

            // Fetch Enquiries & Quotations
            try {
                const [quoteRes, enqRes] = await Promise.all([
                    api.get('/quotations'),
                    api.get('/enquiries')
                ]);

                const qData = quoteRes.data.quotations || quoteRes.data.data || quoteRes.data || [];
                const eData = enqRes.data.enquiries || enqRes.data.data || enqRes.data || [];

                const pendingEnqCount = Array.isArray(eData) ? eData.filter(e => !e.isSeen).length : 0;

                const doneQuotes = Array.isArray(qData) ? qData.filter(q => q.status === 'Done').length : 0;
                const rejectedQuotes = Array.isArray(qData) ? qData.filter(q => q.status === 'Reject').length : 0;

                setStats({
                    products: pCount,
                    totalEnquiries: Array.isArray(eData) ? eData.length : 0,
                    pendingEnquiries: pendingEnqCount,
                    doneQuotations: doneQuotes,
                    rejectedQuotations: rejectedQuotes
                });
            } catch (err) {
                console.error("Dashboard Enquiry Fetch Error:", err);
                setStats({
                    products: pCount,
                    totalEnquiries: DEMO_ENQUIRIES.length,
                    pendingEnquiries: 0,
                    doneQuotations: 0,
                    rejectedQuotations: 0
                });
            }
        };
        fetchData();
    }, []);

    return (
        <Box>
            <Heading mb={6}>Dashboard Overview</Heading>
            <SimpleGrid columns={{ base: 1, md: 3, lg: 5 }} spacing={6}>
                <Stat bg="white" p={6} borderRadius="lg" boxShadow="sm">
                    <Box display="flex" alignItems="center" mb={2} color="brand.500">
                        <Icon as={FiBox} w={6} h={6} mr={2} />
                        <StatLabel fontSize="sm" fontWeight="bold">Total Products</StatLabel>
                    </Box>
                    <StatNumber fontSize="3xl">{stats.products}</StatNumber>
                    <StatHelpText>Active products</StatHelpText>
                </Stat>

                <Stat bg="white" p={6} borderRadius="lg" boxShadow="sm">
                    <Box display="flex" alignItems="center" mb={2} color="blue.500">
                        <Icon as={FiMessageSquare} w={6} h={6} mr={2} />
                        <StatLabel fontSize="sm" fontWeight="bold">Total Enquiries</StatLabel>
                    </Box>
                    <StatNumber fontSize="3xl">{stats.totalEnquiries}</StatNumber>
                    <StatHelpText>All time count</StatHelpText>
                </Stat>

                <Stat bg="white" p={6} borderRadius="lg" boxShadow="sm">
                    <Box display="flex" alignItems="center" mb={2} color="orange.500">
                        <Icon as={FiMessageSquare} w={6} h={6} mr={2} />
                        <StatLabel fontSize="sm" fontWeight="bold">New Enquiries</StatLabel>
                    </Box>
                    <StatNumber fontSize="3xl">{stats.pendingEnquiries}</StatNumber>
                    <StatHelpText color="red.500">Action Required</StatHelpText>
                </Stat>

                <Stat bg="white" p={6} borderRadius="lg" boxShadow="sm">
                    <Box display="flex" alignItems="center" mb={2} color="green.500">
                        <Icon as={FiClock} w={6} h={6} mr={2} />
                        <StatLabel fontSize="sm" fontWeight="bold">Success (Done)</StatLabel>
                    </Box>
                    <StatNumber fontSize="3xl">{stats.doneQuotations}</StatNumber>
                    <StatHelpText>Closed deals</StatHelpText>
                </Stat>

                <Stat bg="white" p={6} borderRadius="lg" boxShadow="sm">
                    <Box display="flex" alignItems="center" mb={2} color="red.500">
                        <Icon as={FiClock} w={6} h={6} mr={2} />
                        <StatLabel fontSize="sm" fontWeight="bold">Rejected</StatLabel>
                    </Box>
                    <StatNumber fontSize="3xl">{stats.rejectedQuotations}</StatNumber>
                    <StatHelpText>Lost deals</StatHelpText>
                </Stat>
            </SimpleGrid>
        </Box>
    );
};

export default AdminDashboard;
