import React, { useState, useEffect } from 'react';
import {
    Box, Flex, Text, Heading, VStack, HStack, Select, Spinner, Table, Thead, Tbody, Tr, Th, Td, Badge, Button, Icon, useToast, Tooltip, Input
} from '@chakra-ui/react';
import { FiDownload, FiUserCheck, FiCalendar, FiClock, FiAlertCircle } from 'react-icons/fi';
import api from '../../api/axios';

const AdminLoginReportView = () => {
    const [month, setMonth] = useState(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    });
    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState([]);
    const [daysInMonth, setDaysInMonth] = useState(30);
    const [evaluateUpToDay, setEvaluateUpToDay] = useState(30);
    const [searchQuery, setSearchQuery] = useState('');
    const toast = useToast();

    useEffect(() => {
        fetchReport();
    }, [month]);

    const fetchReport = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/auth/admin-login-report?month=${month}`);
            if (res.data.success) {
                setReportData(res.data.data);
                setDaysInMonth(res.data.daysInMonth);
                setEvaluateUpToDay(res.data.evaluateUpToDay);
            }
        } catch (err) {
            console.error('Failed to load admin login report:', err);
            toast({
                title: "Error loading report",
                description: err.response?.data?.message || "Could not fetch admin login attendance",
                status: "error",
                duration: 3000,
                isClosable: true
            });
        } finally {
            setLoading(false);
        }
    };

    const getDayHeaderInfo = (dayNum) => {
        if (!month) return { dateStr: `${dayNum}`, dayName: '', csvHeader: `${dayNum}` };
        const [year, m] = month.split('-');
        const dateObj = new Date(parseInt(year), parseInt(m) - 1, dayNum);
        const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
        const dateStr = dateObj.toLocaleDateString('en-US', { day: '2-digit', month: 'short' });
        const csvHeader = `${dateStr} (${dayName})`;
        return { dateStr, dayName, csvHeader };
    };

    const handleExportCSV = () => {
        if (!reportData.length) return;

        // Build headers
        const dayHeaders = Array.from({ length: daysInMonth }, (_, i) => getDayHeaderInfo(i + 1).csvHeader).join(',');
        let csv = `Admin Name,Email,Phone,Present Days,Absent Days,Attendance %,${dayHeaders}\n`;

        reportData.forEach(admin => {
            const dayStatuses = admin.dailyAttendance.map(d => {
                if (d.status === 'Present') return `Present (${d.firstLogin})`;
                return d.status;
            }).join(',');
            
            const clean = (val) => `"${String(val || '').replace(/"/g, '""')}"`;
            csv += `${clean(admin.name)},${clean(admin.email)},${clean(admin.phone)},${admin.presentDays},${admin.absentDays},${admin.attendancePercentage}%,${dayStatuses}\n`;
        });

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `Admin_Login_Attendance_Report_${month}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleExportExcelColor = () => {
        if (!reportData.length) return;

        let html = `
        <html xmlns:x="urn:schemas-microsoft-com:office:excel">
        <head>
            <meta charset="utf-8">
            <style>
                table { border-collapse: collapse; width: 100%; font-family: Arial, sans-serif; }
                th { background-color: #4C51BF; color: #FFFFFF; font-weight: bold; border: 1px solid #2D3748; padding: 10px; text-align: center; }
                td { border: 1px solid #CBD5E0; padding: 8px; text-align: center; font-size: 12px; }
                .present { background-color: #C6F6D5; color: #22543D; font-weight: bold; }
                .absent { background-color: #FED7D7; color: #742A2A; font-weight: bold; }
                .notjoined { background-color: #EDF2F7; color: #718096; }
                .upcoming { background-color: #F7FAFC; color: #A0AEC0; }
                .name-col { text-align: left; font-weight: bold; background-color: #F8FAFC; }
            </style>
        </head>
        <body>
            <h2>Admin Login Attendance Report (${month})</h2>
            <p>Note: At least 1 daily login is required for Present status. Super Admins are excluded from attendance evaluation.</p>
            <table>
                <thead>
                    <tr>
                        <th style="width: 50px;">#</th>
                        <th style="width: 200px; text-align: left;">Admin Name</th>
                        <th style="width: 180px; text-align: left;">Email / Phone</th>
                        <th style="width: 80px;">Present</th>
                        <th style="width: 80px;">Absent</th>
                        <th style="width: 80px;">Rate</th>`;

        for (let i = 1; i <= daysInMonth; i++) {
            const { dateStr, dayName } = getDayHeaderInfo(i);
            const dayLabel = `${dateStr}<br/><span style="font-size: 10px; color: #E9D8FD;">${dayName}</span>`;
            html += `<th style="width: 95px;">${dayLabel}</th>`;
        }

        html += `   </tr>
                </thead>
                <tbody>`;

        const filtered = reportData.filter(a => 
            a.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
            a.email?.toLowerCase().includes(searchQuery.toLowerCase())
        );

        filtered.forEach((admin, idx) => {
            html += `
                    <tr>
                        <td style="font-weight: bold;">${idx + 1}</td>
                        <td class="name-col">${admin.name}</td>
                        <td style="text-align: left;">${admin.email || ''}<br/>${admin.phone || ''}</td>
                        <td style="color: #276749; font-weight: bold; background-color: #F0FFF4;">${admin.presentDays}</td>
                        <td style="color: #9B2C2C; font-weight: bold; background-color: #FFF5F5;">${admin.absentDays}</td>
                        <td style="font-weight: bold;">${admin.attendancePercentage}%</td>`;

            admin.dailyAttendance.forEach(d => {
                let cellClass = 'upcoming';
                let content = '-';
                if (d.status === 'Present') {
                    cellClass = 'present';
                    content = `PRESENT<br/><span style="font-size: 10px; color: #234E52;">In: ${d.firstLogin}<br/>Out: ${d.logoutTime || d.lastLogin}</span>`;
                } else if (d.status === 'Absent') {
                    cellClass = 'absent';
                    content = 'ABSENT';
                } else if (d.status === 'Not Joined') {
                    cellClass = 'notjoined';
                    content = 'N/A';
                }
                html += `<td class="${cellClass}">${content}</td>`;
            });

            html += `</tr>`;
        });

        html += `</tbody></table></body></html>`;

        const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `Admin_Login_Attendance_${month}.xls`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const filteredData = reportData.filter(a => 
        a.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        a.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.phone?.includes(searchQuery)
    );

    return (
        <Box bg="white" p={{ base: 4, md: 6 }} borderRadius="2xl" boxShadow="md" border="1px" borderColor="gray.100">
            <Flex justify="space-between" align={{ base: 'start', md: 'center' }} direction={{ base: 'column', md: 'row' }} mb={6} gap={4}>
                <VStack align="start" spacing={1}>
                    <HStack>
                        <Icon as={FiUserCheck} color="purple.600" w={6} h={6} />
                        <Heading size="md" color="gray.800">Admin Login Attendance Report</Heading>
                    </HStack>
                    <Text fontSize="xs" color="gray.500" fontWeight="medium">
                        Tracks daily presence when administrators log in. At least 1 login per day is required for Present status. Super Admins are exempted.
                    </Text>
                </VStack>

                <HStack spacing={3} wrap="wrap">
                    <HStack bg="gray.50" px={3} py={1} borderRadius="lg" border="1px" borderColor="gray.200">
                        <Icon as={FiCalendar} color="gray.500" />
                        <Input
                            type="month"
                            size="sm"
                            variant="unstyled"
                            value={month}
                            onChange={(e) => setMonth(e.target.value)}
                            fontWeight="bold"
                            color="purple.700"
                        />
                    </HStack>

                    <Button
                        size="sm"
                        colorScheme="green"
                        leftIcon={<FiDownload />}
                        onClick={handleExportExcelColor}
                        boxShadow="sm"
                        _hover={{ transform: 'translateY(-1px)', boxShadow: 'md' }}
                    >
                        Export Colorful Excel (.xls)
                    </Button>
                </HStack>
            </Flex>

            <Flex mb={4} justify="space-between" align="center">
                <Input
                    placeholder="Search admin by name, email, or phone..."
                    size="sm"
                    maxW="300px"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    borderRadius="lg"
                />
                <Text fontSize="xs" color="gray.500">
                    Showing {filteredData.length} Administrator(s)
                </Text>
            </Flex>

            {loading ? (
                <Flex justify="center" align="center" py={12}>
                    <Spinner size="xl" color="purple.600" thickness="4px" />
                </Flex>
            ) : filteredData.length === 0 ? (
                <Box p={8} textAlign="center" bg="gray.50" borderRadius="xl" border="1px dashed" borderColor="gray.300">
                    <Icon as={FiAlertCircle} w={8} h={8} color="gray.400" mb={2} />
                    <Text fontWeight="bold" color="gray.600">No Regular Admin Users Found</Text>
                    <Text fontSize="xs" color="gray.400">Regular administrator accounts will appear here. Super Admins are excluded as per report rules.</Text>
                </Box>
            ) : (
                <Box overflowX="auto" border="1px" borderColor="gray.200" borderRadius="xl">
                    <Table size="sm" variant="simple">
                        <Thead bg="purple.700">
                            <Tr>
                                <Th color="white" py={3} minW="180px">Administrator</Th>
                                <Th color="white" py={3} textAlign="center" w="80px">Present</Th>
                                <Th color="white" py={3} textAlign="center" w="80px">Absent</Th>
                                <Th color="white" py={3} textAlign="center" w="80px">Rate</Th>
                                {Array.from({ length: daysInMonth }, (_, i) => {
                                    const { dateStr, dayName } = getDayHeaderInfo(i + 1);
                                    return (
                                        <Th key={i} color="white" py={2} px={1} textAlign="center" minW="85px">
                                            <VStack spacing={0}>
                                                <Text fontSize="11px" fontWeight="extrabold" lineHeight="1.2">{dateStr}</Text>
                                                <Text fontSize="9px" color="purple.200" fontWeight="bold">{dayName}</Text>
                                            </VStack>
                                        </Th>
                                    );
                                })}
                            </Tr>
                        </Thead>
                        <Tbody>
                            {filteredData.map(admin => (
                                <Tr key={admin._id} _hover={{ bg: "gray.50" }}>
                                    <Td py={3} borderRight="1px" borderColor="gray.100" bg="white" position="sticky" left={0} zIndex={1} boxShadow="2px 0 5px rgba(0,0,0,0.03)">
                                        <VStack align="start" spacing={0}>
                                            <Text fontWeight="bold" fontSize="xs" color="gray.800">{admin.name}</Text>
                                            <Text fontSize="9px" color="gray.500">{admin.email || admin.phone}</Text>
                                        </VStack>
                                    </Td>
                                    <Td textAlign="center" fontWeight="extrabold" color="green.600" bg="green.50">
                                        {admin.presentDays}
                                    </Td>
                                    <Td textAlign="center" fontWeight="extrabold" color="red.600" bg="red.50">
                                        {admin.absentDays}
                                    </Td>
                                    <Td textAlign="center" fontWeight="bold">
                                        <Badge colorScheme={admin.attendancePercentage >= 75 ? "green" : admin.attendancePercentage >= 50 ? "orange" : "red"}>
                                            {admin.attendancePercentage}%
                                        </Badge>
                                    </Td>
                                    {admin.dailyAttendance.map(d => {
                                        if (d.status === 'Present') {
                                            return (
                                                <Td key={d.day} textAlign="center" bg="green.50" borderRight="1px" borderColor="green.100" p={1.5}>
                                                    <Tooltip label={`Login Time: ${d.firstLogin} | Logout Time: ${d.logoutTime || d.lastLogin} (${d.loginCount} session${d.loginCount > 1 ? 's' : ''})`}>
                                                        <Box>
                                                            <Badge colorScheme="green" fontSize="9px" px={1.5} py={0.5} borderRadius="md" mb={1}>
                                                                PRESENT
                                                            </Badge>
                                                            <VStack spacing={0.5} align="center">
                                                                <HStack justify="center" spacing={1}>
                                                                    <Icon as={FiClock} w={2.5} h={2.5} color="green.700" />
                                                                    <Text fontSize="8px" fontWeight="extrabold" color="green.800">In: {d.firstLogin}</Text>
                                                                </HStack>
                                                                <HStack justify="center" spacing={1}>
                                                                    <Icon as={FiClock} w={2.5} h={2.5} color={d.logoutTime?.includes('Active') ? 'blue.600' : 'red.600'} />
                                                                    <Text fontSize="8px" fontWeight="extrabold" color={d.logoutTime?.includes('Active') ? 'blue.700' : 'red.700'}>
                                                                        Out: {d.logoutTime || d.lastLogin}
                                                                    </Text>
                                                                </HStack>
                                                            </VStack>
                                                        </Box>
                                                    </Tooltip>
                                                </Td>
                                            );
                                        } else if (d.status === 'Absent') {
                                            return (
                                                <Td key={d.day} textAlign="center" bg="red.50" borderRight="1px" borderColor="red.100">
                                                    <Badge colorScheme="red" fontSize="9px" px={1.5} py={0.5} borderRadius="md">
                                                        ABSENT
                                                    </Badge>
                                                </Td>
                                            );
                                        } else if (d.status === 'Not Joined') {
                                            return (
                                                <Td key={d.day} textAlign="center" bg="gray.50" borderRight="1px" borderColor="gray.100">
                                                    <Text fontSize="9px" color="gray.400" fontStyle="italic">N/A</Text>
                                                </Td>
                                            );
                                        } else {
                                            return (
                                                <Td key={d.day} textAlign="center" bg="gray.50" borderRight="1px" borderColor="gray.100">
                                                    <Text fontSize="10px" color="gray.300">—</Text>
                                                </Td>
                                            );
                                        }
                                    })}
                                </Tr>
                            ))}
                        </Tbody>
                    </Table>
                </Box>
            )}
        </Box>
    );
};

export default AdminLoginReportView;
