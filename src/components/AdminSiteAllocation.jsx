import React, { useState, useEffect } from 'react';
import {
    Box, Table, Thead, Tbody, Tr, Th, Td, TableContainer,
    Button, Spinner, Center, Text, HStack, VStack, Icon, useToast, Heading, Flex
} from '@chakra-ui/react';
import { FaDownload, FaFileExcel, FaCalendarAlt, FaStar } from 'react-icons/fa';
import api from '../api/axios';

const AdminSiteAllocation = () => {
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [isFiltering, setIsFiltering] = useState(true);
    const toast = useToast();

    // Configuration flag for local vs NAS saving
    const useNas = false;

    useEffect(() => {
        fetchSchedules();
    }, [selectedMonth, selectedYear, isFiltering]);

    const fetchSchedules = async () => {
        setLoading(true);
        try {
            let url = '/schedule-master';
            if (isFiltering) {
                // We need to construct a range for the month
                const startDate = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-01`;
                const lastDay = new Date(selectedYear, selectedMonth, 0).getDate();
                const endDate = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${lastDay}`;
                url += `?startDate=${startDate}&endDate=${endDate}`;
            }
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
        let csvContent = "SR. NO.,DATE,sr. no.,DESCRIPASAN,work For Appley,Oprative Name,Helper name\n";

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
                const legacyOperative = sch.operativeName ? [sch.operativeName] : [];
                const allOperatives = [...(sch.operativeNames || []), ...legacyOperative];
                const operative = allOperatives.map(o => o.name).join(' | ');
                const helpers = (sch.helpers || []).map(h => h.name).join(' | ');

                // CSV: SR. NO.,DATE,sr. no.,DESCRIPASAN,work For Appley,Oprative Name,Helper name
                if (innerIdx === 0) {
                    csvContent += `${srNo},${dateLabel},${innerSrNo},${desc},${contact},${operative},${helpers}\n`;
                } else {
                    csvContent += `,,${innerSrNo},${desc},${contact},${operative},${helpers}\n`;
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
    const currentYear = new Date().getFullYear();
    const years = [currentYear - 1, currentYear, currentYear + 1];

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
                        <select 
                            style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #ccc', background: 'white' }}
                            value={selectedMonth} 
                            onChange={(e) => { setSelectedMonth(e.target.value); setIsFiltering(true); }}
                        >
                            {months.map((m, i) => (
                                <option key={i} value={i + 1}>{m}</option>
                            ))}
                        </select>
                        <select 
                            style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #ccc', background: 'white' }}
                            value={selectedYear} 
                            onChange={(e) => { setSelectedYear(e.target.value); setIsFiltering(true); }}
                        >
                            {years.map(y => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                        <Button colorScheme="blue" size="sm" variant={isFiltering ? "solid" : "outline"} onClick={() => setIsFiltering(!isFiltering)}>
                            {isFiltering ? "Filtered" : "All Records"}
                        </Button>
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
                        </Tr>
                    </Thead>
                    <Tbody>
                        {sortedDates.map((dKey, dIdx) => {
                            const dateSchs = groupedSchedules[dKey];
                            const dateLabel = new Date(dKey).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
                            return (
                                <React.Fragment key={dKey}>
                                    {dateSchs.map((sch, iIdx) => (
                                        <Tr key={sch._id}>
                                            {iIdx === 0 && (
                                                <>
                                                    <Td rowSpan={dateSchs.length} textAlign="center" fontWeight="bold">{dIdx + 1}</Td>
                                                    <Td rowSpan={dateSchs.length} textAlign="center" fontWeight="500">{dateLabel}</Td>
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
                                                <VStack align="start" spacing={1}>
                                                    {[...(sch.operativeNames || []), ...(sch.operativeName ? [sch.operativeName] : [])].map((o) => (
                                                        <HStack key={o._id} spacing={1}>
                                                            <Icon as={FaStar} color="orange.400" w={2} h={2} />
                                                            <Text fontSize="xs" color="blue.700" fontWeight="bold">{o.name}</Text>
                                                        </HStack>
                                                    ))}
                                                    {(sch.operativeNames?.length === 0 && !sch.operativeName) && <Text fontSize="xs" color="gray.400">—</Text>}
                                                </VStack>
                                            </Td>
                                            <Td>
                                                <VStack align="start" spacing={0}>
                                                    {(sch.helpers || []).map((h) => (
                                                        <Text key={h._id} fontSize="xs" color="gray.600">• {h.name}</Text>
                                                    ))}
                                                    {sch.helpers?.length === 0 && <Text fontSize="xs" color="gray.400">—</Text>}
                                                </VStack>
                                            </Td>
                                        </Tr>
                                    ))}
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
