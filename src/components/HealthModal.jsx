import React, { useState, useEffect } from 'react';
import {
    Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton, ModalFooter,
    Box, Flex, Text, Button, Badge, SimpleGrid, Progress, Table, Thead, Tbody, Tr, Th, Td,
    Spinner, HStack, Icon, Divider, VStack, Code
} from '@chakra-ui/react';
import { FiCpu, FiDatabase, FiHardDrive, FiMessageCircle, FiActivity, FiZap, FiCheckCircle, FiAlertTriangle, FiRefreshCw } from 'react-icons/fi';
import api from '../api/axios';

const HealthModal = ({ isOpen, onClose }) => {
    const [healthData, setHealthData] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchHealth = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/health');
            if (res.data && res.data.success) {
                setHealthData(res.data);
            }
        } catch (err) {
            console.error('Failed to fetch system health:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchHealth();
        }
    }, [isOpen]);

    const metrics = healthData?.metrics;
    const aiDiag = healthData?.aiDiagnostics;

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="4xl" scrollBehavior="inside" isCentered>
            <ModalOverlay backdropFilter="blur(6px)" bg="blackAlpha.600" />
            <ModalContent borderRadius="2xl" overflow="hidden" boxShadow="2xl">
                <ModalHeader bg="gray.900" color="white" p={5}>
                    <Flex align="center" justify="space-between" pr={6}>
                        <HStack spacing={3}>
                            <Box p={2.5} bg="green.500" borderRadius="xl" color="white">
                                <FiActivity size={22} />
                            </Box>
                            <VStack align="start" spacing={0}>
                                <HStack spacing={2}>
                                    <Text fontSize="lg" fontWeight="bold">Server, DB & API Health Monitor</Text>
                                    <Badge colorScheme="green" variant="solid" borderRadius="full" px={2}>LIVE</Badge>
                                </HStack>
                                <Text fontSize="xs" color="gray.400">Real-time RAM, Database Latency, NAS Storage & API Speed Analytics</Text>
                            </VStack>
                        </HStack>
                        <Button size="sm" colorScheme="brand" leftIcon={<FiRefreshCw />} isLoading={loading} onClick={fetchHealth} borderRadius="lg">
                            Refresh
                        </Button>
                    </Flex>
                </ModalHeader>
                <ModalCloseButton color="white" top={5} right={5} />

                <ModalBody p={6} bg="gray.50">
                    {loading && !healthData ? (
                        <Flex justify="center" align="center" py={12} flexDir="column" gap={3}>
                            <Spinner size="xl" color="brand.500" thickness="4px" />
                            <Text fontSize="sm" color="gray.500" fontWeight="bold">Analyzing server telemetry & database latency...</Text>
                        </Flex>
                    ) : metrics ? (
                        <VStack spacing={6} align="stretch">

                            {/* 1. Core Health Cards */}
                            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
                                
                                {/* RAM Usage */}
                                <Box bg="white" p={4} borderRadius="xl" border="1px solid" borderColor="gray.200" boxShadow="sm">
                                    <Flex align="center" justify="space-between" mb={2}>
                                        <HStack spacing={2} color="purple.600">
                                            <FiCpu />
                                            <Text fontSize="xs" fontWeight="bold" color="gray.600">SERVER RAM</Text>
                                        </HStack>
                                        <Badge colorScheme={metrics.memory.usagePercent > 80 ? "red" : "purple"} fontSize="10px">
                                            {metrics.memory.usagePercent}% USED
                                        </Badge>
                                    </Flex>
                                    <Text fontSize="lg" fontWeight="900" color="gray.800">{metrics.memory.used}</Text>
                                    <Text fontSize="10px" color="gray.500" mb={2}>Total: {metrics.memory.total} | Free: {metrics.memory.free}</Text>
                                    <Progress value={metrics.memory.usagePercent} size="xs" colorScheme={metrics.memory.usagePercent > 80 ? "red" : "purple"} borderRadius="full" />
                                </Box>

                                {/* MongoDB Ping */}
                                <Box bg="white" p={4} borderRadius="xl" border="1px solid" borderColor="gray.200" boxShadow="sm">
                                    <Flex align="center" justify="space-between" mb={2}>
                                        <HStack spacing={2} color="green.600">
                                            <FiDatabase />
                                            <Text fontSize="xs" fontWeight="bold" color="gray.600">DATABASE LATENCY</Text>
                                        </HStack>
                                        <Badge colorScheme={metrics.database.connected ? "green" : "red"} fontSize="10px">
                                            {metrics.database.state}
                                        </Badge>
                                    </Flex>
                                    <Text fontSize="lg" fontWeight="900" color="gray.800">
                                        {metrics.database.pingMs !== null ? `${metrics.database.pingMs} ms` : 'N/A'}
                                    </Text>
                                    <Text fontSize="10px" color="gray.500" noOfLines={1} title={metrics.database.host}>
                                        Host: {metrics.database.host}
                                    </Text>
                                </Box>

                                {/* WhatsApp Session Status */}
                                <Box bg="white" p={4} borderRadius="xl" border="1px solid" borderColor="gray.200" boxShadow="sm">
                                    <Flex align="center" justify="space-between" mb={2}>
                                        <HStack spacing={2} color="whatsapp.600">
                                            <FiMessageCircle />
                                            <Text fontSize="xs" fontWeight="bold" color="gray.600">WHATSAPP SESSION</Text>
                                        </HStack>
                                        <Badge colorScheme={metrics.whatsapp.activeSessionsCount > 0 ? "whatsapp" : "orange"} fontSize="10px">
                                            {metrics.whatsapp.activeSessionsCount > 0 ? "ONLINE" : "OFFLINE"}
                                        </Badge>
                                    </Flex>
                                    <Text fontSize="lg" fontWeight="900" color="gray.800">
                                        {metrics.whatsapp.activeSessionsCount} Active
                                    </Text>
                                    <Text fontSize="10px" color="gray.500">
                                        Session: {metrics.whatsapp.sessions?.[0]?.sessionId || 'system_default'}
                                    </Text>
                                </Box>

                                {/* NAS / Storage Check */}
                                <Box bg="white" p={4} borderRadius="xl" border="1px solid" borderColor="gray.200" boxShadow="sm">
                                    <Flex align="center" justify="space-between" mb={2}>
                                        <HStack spacing={2} color="blue.600">
                                            <FiHardDrive />
                                            <Text fontSize="xs" fontWeight="bold" color="gray.600">STORAGE / NAS</Text>
                                        </HStack>
                                        <Badge colorScheme={metrics.storage.accessible ? "blue" : "red"} fontSize="10px">
                                            {metrics.storage.accessible ? "READ / WRITE" : "LOCKED"}
                                        </Badge>
                                    </Flex>
                                    <Text fontSize="sm" fontWeight="800" color="gray.800" noOfLines={1}>
                                        {metrics.storage.environment}
                                    </Text>
                                    <Text fontSize="10px" color="gray.500" noOfLines={1} title={metrics.storage.targetPath}>
                                        Path: {metrics.storage.targetPath}
                                    </Text>
                                </Box>

                            </SimpleGrid>

                            {/* 2. AI Optimization Insights */}
                            {aiDiag && (
                                <Box bg="white" p={5} borderRadius="xl" border="1px solid" borderColor="purple.200" boxShadow="sm">
                                    <Flex align="center" justify="space-between" mb={3}>
                                        <HStack spacing={2} color="purple.700">
                                            <FiZap />
                                            <Text fontSize="sm" fontWeight="bold">AI PERFORMANCE & OPTIMIZATION ADVISOR</Text>
                                        </HStack>
                                        <Badge colorScheme="purple" variant="subtle" fontSize="10px" px={2} borderRadius="md">
                                            {aiDiag.mode}
                                        </Badge>
                                    </Flex>
                                    <VStack align="stretch" spacing={2} bg="purple.50/50" p={4} borderRadius="lg" border="1px solid" borderColor="purple.100">
                                        {aiDiag.recommendations.split('\n\n').map((paragraph, pIdx) => (
                                            <Text key={pIdx} fontSize="xs" color="gray.700" lineHeight="1.5">
                                                {paragraph}
                                            </Text>
                                        ))}
                                    </VStack>
                                </Box>
                            )}

                            {/* 3. API Performance & Speed Breakdown */}
                            <Box bg="white" p={5} borderRadius="xl" border="1px solid" borderColor="gray.200" boxShadow="sm">
                                <Flex align="center" justify="space-between" mb={3}>
                                    <HStack spacing={2} color="brand.600">
                                        <FiActivity />
                                        <Text fontSize="sm" fontWeight="bold">API ENDPOINT RESPONSE SPEED (FAST vs SLOW)</Text>
                                    </HStack>
                                    <Badge colorScheme="brand" variant="subtle" fontSize="10px" px={2}>
                                        {metrics.apiPerformance.totalTrackedRoutes} Tracked Routes
                                    </Badge>
                                </Flex>

                                <Box overflowX="auto" maxH="250px">
                                    <Table size="sm" variant="simple">
                                        <Thead bg="gray.50" sticky top={0} zIndex={1}>
                                            <Tr>
                                                <Th fontSize="10px">METHOD & ROUTE PATH</Th>
                                                <Th fontSize="10px">REQUESTS</Th>
                                                <Th fontSize="10px">AVG RESPONSE</Th>
                                                <Th fontSize="10px">SPEED CATEGORY</Th>
                                                <Th fontSize="10px">STATUS</Th>
                                            </Tr>
                                        </Thead>
                                        <Tbody>
                                            {metrics.apiPerformance.routes.length === 0 ? (
                                                <Tr>
                                                    <Td colSpan={5} textAlign="center" py={6} color="gray.400" fontSize="xs">
                                                        No API requests tracked yet. Navigate through pages to capture speed benchmarks.
                                                    </Td>
                                                </Tr>
                                            ) : (
                                                metrics.apiPerformance.routes.map((r, idx) => (
                                                    <Tr key={idx} _hover={{ bg: 'gray.50' }}>
                                                        <Td fontWeight="bold" fontSize="xs">
                                                            <HStack spacing={2}>
                                                                <Badge size="xs" colorScheme={r.method === 'GET' ? 'blue' : r.method === 'POST' ? 'green' : 'orange'}>
                                                                    {r.method}
                                                                </Badge>
                                                                <Code fontSize="11px" bg="transparent" color="gray.700">{r.path}</Code>
                                                            </HStack>
                                                        </Td>
                                                        <Td fontSize="xs" fontWeight="bold" color="gray.600">{r.count}</Td>
                                                        <Td fontSize="xs" fontWeight="bold" color={r.avgMs > 400 ? 'red.500' : r.avgMs > 100 ? 'orange.500' : 'green.600'}>
                                                            {r.avgMs} ms
                                                        </Td>
                                                        <Td>
                                                            <Badge
                                                                fontSize="10px"
                                                                px={2}
                                                                borderRadius="md"
                                                                colorScheme={r.speed === 'FAST' ? 'green' : r.speed === 'MODERATE' ? 'orange' : 'red'}
                                                            >
                                                                {r.speed === 'FAST' ? '🟢 FAST (<100ms)' : r.speed === 'MODERATE' ? '🟡 MODERATE' : '🔴 SLOW (>400ms)'}
                                                            </Badge>
                                                        </Td>
                                                        <Td fontSize="xs">
                                                            <Badge size="xs" variant="outline" colorScheme={r.lastStatus < 400 ? 'green' : 'red'}>
                                                                {r.lastStatus}
                                                            </Badge>
                                                        </Td>
                                                    </Tr>
                                                ))
                                            )}
                                        </Tbody>
                                    </Table>
                                </Box>
                            </Box>

                        </VStack>
                    ) : null}
                </ModalBody>

                <ModalFooter bg="white" borderTop="1px solid" borderColor="gray.100">
                    <Button variant="ghost" mr={3} onClick={onClose} size="sm">
                        Close
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default HealthModal;
