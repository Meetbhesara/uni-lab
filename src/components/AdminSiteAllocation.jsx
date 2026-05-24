import React, { useState, useEffect } from 'react';
import {
    Box, Table, Thead, Tbody, Tr, Th, Td, TableContainer,
    Button, Spinner, Center, Text, HStack, VStack, Icon, useToast, Heading, Flex,
    Select, Popover, PopoverTrigger, PopoverContent, PopoverBody, SimpleGrid, IconButton
} from '@chakra-ui/react';
import { FaDownload, FaFileExcel, FaCalendarAlt, FaStar, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import api from '../api/axios';

const AdminSiteAllocation = () => {
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [yearPageStart, setYearPageStart] = useState(Math.floor(new Date().getFullYear() / 20) * 20);
    const toast = useToast();

    // Configuration flag for local vs NAS saving
    const useNas = false;

    useEffect(() => {
        fetchSchedules();
    }, [selectedMonth, selectedYear]);

    const fetchSchedules = async () => {
        setLoading(true);
        try {
            // Force month-wise filtering
            const startDate = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-01`;
            const lastDay = new Date(selectedYear, selectedMonth, 0).getDate();
            const endDate = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${lastDay}`;
            const url = `/schedule-master?startDate=${startDate}&endDate=${endDate}`;
            
            const res = await api.get(url);
            if (res.data.success) {
                setSchedules(res.data.data);
            }
        } catch (err) {
            console.error("Error fetching site allocations", err);
            toast({ title: 'Error loading allocation report', status: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async () => {
        if (useNas) {
            toast({ title: "NAS feature disabled currently per user request.", status: "info" });
            return;
        }

        // Generate CSV manually 
        let csvContent = "SR. NO.,DATE,sr. no.,DESCRIPASAN,work For Appley,Oprative Name,Helper name,Vehicle,Instruments\n";

        // Group by date for SR. NO. logic
        const groupedByDate = schedules.reduce((acc, curr) => {
            const dStr = new Date(curr.scheduleDate).toISOString().split('T')[0];
            if (!acc[dStr]) acc[dStr] = [];
            acc[dStr].push(curr);
            return acc;
        }, {});

        const sortedDates = Object.keys(groupedByDate).sort();

        sortedDates.forEach((dateKey, dateIdx) => {
            const dateSchedules = groupedByDate[dateKey];
            const dateLabel = new Date(dateKey).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
            
            dateSchedules.forEach((sch, innerIdx) => {
                const srNo = dateIdx + 1;
                const innerSrNo = innerIdx + 1;
                const desc = `"${(sch.site?.siteName || '').toUpperCase()} (${(sch.site?.siteAddress || '').toUpperCase()})"`;
                const contact = sch.workForAppley || sch.contactPerson || '';
                const operative = sch.operative?.name || '—';
                const helpers = (sch.helpers || []).map(h => h.name).join(' | ');

                const vehicle = sch.vehicle?.vehicleNumber || '—';
                const instruments = (sch.instruments || []).map(i => i.serialNo).join(' | ');

                // CSV: SR. NO.,DATE,sr. no.,DESCRIPASAN,work For Appley,Oprative Name,Helper name,Vehicle,Instruments
                if (innerIdx === 0) {
                    csvContent += `${srNo},${dateLabel},${innerSrNo},${desc},${contact},${operative},${helpers},${vehicle},${instruments}\n`;
                } else {
                    csvContent += `,,${innerSrNo},${desc},${contact},${operative},${helpers},${vehicle},${instruments}\n`;
                }
            });
        });

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `Site_Allocation_Report_${selectedMonth}_${selectedYear}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    // Calculate the 20 years to display based on the current page
    const displayYears = Array.from({ length: 20 }, (_, i) => yearPageStart + i);

    if (loading) return <Center p={20}><Spinner size="xl" /></Center>;

    // Group by date for rendering
    const groupedSchedules = schedules.reduce((acc, curr) => {
        const dStr = new Date(curr.scheduleDate).toISOString().split('T')[0];
        if (!acc[dStr]) acc[dStr] = [];
        acc[dStr].push(curr);
        return acc;
    }, {});
    const sortedDates = Object.keys(groupedSchedules).sort();

    return (
        <Box bg="white" p={6} borderRadius="xl" shadow="xl" w="full" overflow="visible">
            <Flex justify="space-between" mb={6} align="center" flexWrap="wrap" gap={4}>
                <HStack>
                    <Box bg="blue.500" p={2} borderRadius="lg">
                        <Icon as={FaCalendarAlt} color="white" />
                    </Box>
                    <Heading size="md" color="gray.800">Site Allocation Report</Heading>
                </HStack>
                
                <HStack spacing={4} flexWrap="wrap">
                    <HStack>
                        <Text fontSize="sm" fontWeight="bold" color="gray.600">Period:</Text>
                        <Select 
                            w="130px"
                            bg="white"
                            borderRadius="xl"
                            shadow="sm"
                            size="sm"
                            fontWeight="bold"
                            value={selectedMonth} 
                            onChange={(e) => setSelectedMonth(e.target.value)}
                        >
                            {months.map((m, i) => (
                                <option key={i} value={i + 1}>{m}</option>
                            ))}
                        </Select>
                        
                        <Popover placement="bottom-start" matchWidth={false}>
                            <PopoverTrigger>
                                <Button 
                                    w="110px"
                                    bg="white"
                                    borderRadius="xl"
                                    shadow="sm"
                                    size="sm"
                                    fontWeight="bold"
                                    rightIcon={<Icon as={FaCalendarAlt} color="blue.500" />}
                                >
                                    {selectedYear}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent w="280px" borderRadius="2xl" shadow="2xl" border="1px solid" borderColor="gray.100">
                                <PopoverBody p={4} maxH="350px" overflowY="auto" className="hide-scrollbar">
                                    <HStack justify="space-between" mb={4} px={2}>
                                        <IconButton size="sm" variant="ghost" icon={<FaChevronLeft />} onClick={() => setYearPageStart(prev => prev - 20)} />
                                        <Text fontWeight="bold" fontSize="sm" color="gray.700">
                                            {yearPageStart} - {yearPageStart + 19}
                                        </Text>
                                        <IconButton size="sm" variant="ghost" icon={<FaChevronRight />} onClick={() => setYearPageStart(prev => prev + 20)} />
                                    </HStack>
                                    <SimpleGrid columns={4} spacing={2}>
                                        {displayYears.map(y => (
                                            <Button 
                                                key={y} 
                                                size="sm" 
                                                borderRadius="lg"
                                                colorScheme={Number(selectedYear) === y ? "blue" : "gray"} 
                                                variant={Number(selectedYear) === y ? "solid" : "ghost"} 
                                                onClick={() => setSelectedYear(y)}
                                            >
                                                {y}
                                            </Button>
                                        ))}
                                    </SimpleGrid>
                                </PopoverBody>
                            </PopoverContent>
                        </Popover>
                    </HStack>

                    <Button colorScheme="green" leftIcon={<FaFileExcel />} onClick={handleDownload} size="sm">
                        Export Report
                    </Button>
                </HStack>
            </Flex>

            {schedules.length === 0 ? (
                <Center p={20} border="2px dashed" borderColor="gray.100" borderRadius="2xl">
                    <VStack>
                        <Icon as={FaCalendarAlt} w={10} h={10} color="gray.200" />
                        <Text color="gray.400">No sites allocated for this period.</Text>
                    </VStack>
                </Center>
            ) : (
                <TableContainer border="1px" borderColor="gray.300" borderRadius="xl" overflowX="auto" w="full">
                <Table size="sm" variant="simple" minW="1100px" sx={{ borderCollapse: 'collapse', 'th, td': { border: '1px solid #E2E8F0', py: 4, px: 4 } }}>
                    <Thead bg="gray.100">
                        <Tr>
                            <Th textAlign="center" color="gray.700" py={5} w="60px" borderColor="gray.300">SR. NO.</Th>
                            <Th textAlign="center" color="gray.700" py={5} w="150px" borderColor="gray.300">DATE</Th>
                            <Th textAlign="center" color="gray.700" py={5} w="60px" borderColor="gray.300">sr. no.</Th>
                            <Th color="gray.700" py={5} borderColor="gray.300">DESCRIPASAN</Th>
                            <Th color="gray.700" py={5} w="180px" borderColor="gray.300">work For Appley</Th>
                            <Th color="gray.700" py={5} w="200px" borderColor="gray.300">Operative Name</Th>
                            <Th color="gray.700" py={5} w="200px" borderColor="gray.300">Helper name</Th>
                            <Th color="gray.700" py={5} w="120px" borderColor="gray.300">Vehicle</Th>
                            <Th color="gray.700" py={5} w="180px" borderColor="gray.300">Instruments</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {sortedDates.map((dKey, dIdx) => {
                            const dateSchs = groupedSchedules[dKey];
                            const dateLabel = new Date(dKey).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
                            return (
                                <React.Fragment key={dKey}>
                                    {dateSchs.map((sch, iIdx) => {
                                        const isNewDateBlock = iIdx === 0 && dIdx !== 0;
                                        const borderTopVal = isNewDateBlock ? '4px solid #2D3748 !important' : undefined;
                                        
                                        return (
                                        <Tr key={sch._id} sx={{ 'td': { borderTop: borderTopVal } }}>
                                            {iIdx === 0 && (
                                                <>
                                                    <Td rowSpan={dateSchs.length} textAlign="center" fontWeight="bold">{dIdx + 1}</Td>
                                                    <Td rowSpan={dateSchs.length} textAlign="center" fontWeight="500" bg="gray.50">{dateLabel}</Td>
                                                </>
                                            )}
                                            <Td textAlign="center">{iIdx + 1}</Td>
                                            <Td fontWeight="bold" fontSize="xs">
                                                {(sch.site?.siteName || '').toUpperCase()}
                                                <Text as="span" display="block" color="gray.500" fontWeight="normal" fontSize="10px">
                                                    {(sch.site?.siteAddress || '').toUpperCase()}
                                                </Text>
                                            </Td>
                                            <Td fontSize="sm">{sch.workForAppley || sch.contactPerson || '—'}</Td>
                                            <Td>
                                                <HStack spacing={1}>
                                                    <Icon as={FaStar} color="orange.400" w={2} h={2} />
                                                    <Text fontSize="xs" color="blue.700" fontWeight="bold">{sch.operative?.name || '—'}</Text>
                                                </HStack>
                                            </Td>
                                            <Td>
                                                <VStack align="start" spacing={0}>
                                                    {(sch.helpers || []).map((h) => (
                                                        <Text key={h._id} fontSize="xs" color="gray.600">• {h.name}</Text>
                                                    ))}
                                                    {sch.helpers?.length === 0 && <Text fontSize="xs" color="gray.400">—</Text>}
                                                </VStack>
                                            </Td>
                                            <Td>
                                                <Text fontSize="xs" fontWeight="bold" color="red.600">{sch.vehicle?.vehicleNumber || '—'}</Text>
                                            </Td>
                                            <Td>
                                                <VStack align="start" spacing={0}>
                                                    {(sch.instruments || []).map((inst) => (
                                                        <Text key={inst._id} fontSize="10px" color="orange.600" fontWeight="bold">• {inst.serialNo}</Text>
                                                    ))}
                                                    {sch.instruments?.length === 0 && <Text fontSize="xs" color="gray.400">—</Text>}
                                                </VStack>
                                            </Td>
                                        </Tr>
                                        );
                                    })}
                                </React.Fragment>
                            );
                        })}
                    </Tbody>
                </Table>
            </TableContainer>
            )}
        </Box>
    );
};

export default AdminSiteAllocation;
