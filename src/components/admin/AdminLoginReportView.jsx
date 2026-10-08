import React, { useState, useEffect, useMemo } from 'react';
import {
    Box, Flex, Text, Heading, VStack, HStack, Spinner, Table, Thead, Tbody, Tr, Th, Td,
    Badge, Button, Icon, useToast, Tooltip, Input, Divider,
    Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter,
    ModalCloseButton, useDisclosure, SimpleGrid
} from '@chakra-ui/react';
import { FiDownload, FiCalendar, FiClock, FiAlertCircle, FiSearch, FiRefreshCw, FiLogIn, FiLogOut, FiActivity } from 'react-icons/fi';
import { MdAdminPanelSettings } from 'react-icons/md';
import { RiVipCrownFill } from 'react-icons/ri';
import api from '../../api/axios';

const AdminLoginReportView = () => {
    const [month, setMonth] = useState(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    });
    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState([]);
    const [superAdminData, setSuperAdminData] = useState([]);
    const [daysInMonth, setDaysInMonth] = useState(30);
    const [evaluateUpToDay, setEvaluateUpToDay] = useState(30);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('all');
    const toast = useToast();

    useEffect(() => {
        fetchReport();
    }, [month]);

    const fetchReport = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/auth/admin-login-report?month=${month}&includeSuperAdmin=true`);
            if (res.data.success) {
                const allData = res.data.data || [];
                setSuperAdminData(allData.filter(a => a.isSuperAdmin));
                setReportData(allData.filter(a => !a.isSuperAdmin));
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
        }
        setLoading(false);
    };


    const [selectedCellDetail, setSelectedCellDetail] = useState(null);
    const { isOpen: isCellOpen, onOpen: onCellOpen, onClose: onCellClose } = useDisclosure();

    const now = new Date();
    const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const todayDayNum = now.getDate();
    const isCurrentMonth = month === currentMonthStr;

    const getDisplayData = () => {
        const combinedAll = [
            ...superAdminData.map(a => ({ ...a, _isSuperAdmin: true })),
            ...reportData.map(a => ({ ...a, _isSuperAdmin: false }))
        ];
        let base = activeTab === 'superadmin'
            ? superAdminData.map(a => ({ ...a, _isSuperAdmin: true }))
            : activeTab === 'admin'
                ? reportData.map(a => ({ ...a, _isSuperAdmin: false }))
                : combinedAll;
        if (!searchQuery.trim()) return base;
        const q = searchQuery.toLowerCase();
        return base.filter(a =>
            a.name?.toLowerCase().includes(q) ||
            a.email?.toLowerCase().includes(q) ||
            a.phone?.includes(searchQuery)
        );
    };

    const getDayHeaderInfo = (dayNum) => {
        if (!month) return { dateStr: `${dayNum}`, dayName: '', csvHeader: `${dayNum}` };
        const [year, m] = month.split('-');
        const dateObj = new Date(parseInt(year), parseInt(m) - 1, dayNum);
        const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
        const dateStr = dateObj.toLocaleDateString('en-US', { day: '2-digit', month: 'short' });
        const fullDateStr = dateObj.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        const csvHeader = `${dateStr} (${dayName})`;
        return { dateStr, dayName, fullDateStr, csvHeader };
    };

    const rawFilteredData = getDisplayData();

    // Process attendance to ensure:
    // 1. Previous day without login -> Absent
    // 2. Today without login -> Pending
    // 3. Login count is strictly 0 when not logged in
    const processedData = useMemo(() => {
        return rawFilteredData.map(admin => {
            const processedAttendance = (admin.dailyAttendance || []).map(d => {
                const isToday = isCurrentMonth && d.day === todayDayNum;
                const isFuture = isCurrentMonth && d.day > todayDayNum;
                const hasLogin = Boolean(
                    d.status === 'Present' ||
                    (d.firstLogin && d.firstLogin !== '-' && d.firstLogin !== '—') ||
                    (d.loginCount && Number(d.loginCount) > 0) ||
                    (Array.isArray(d.sessions) && d.sessions.length > 0)
                );

                let computedStatus = 'Absent';
                if (isFuture) {
                    computedStatus = 'Upcoming';
                } else if (isToday) {
                    computedStatus = hasLogin ? 'Present' : 'Pending';
                } else if (d.status === 'Not Joined') {
                    computedStatus = 'Not Joined';
                } else {
                    computedStatus = hasLogin ? 'Present' : 'Absent';
                }

                const loginCount = computedStatus === 'Present'
                    ? Math.max(Number(d.loginCount) || 0, d.sessions?.length || 0, 1)
                    : 0;

                return {
                    ...d,
                    computedStatus,
                    isToday,
                    isFuture,
                    hasLogin,
                    loginCount,
                    sessions: Array.isArray(d.sessions) ? d.sessions : []
                };
            });

            const presentDays = processedAttendance.filter(d => d.computedStatus === 'Present').length;
            const absentDays = processedAttendance.filter(d => d.computedStatus === 'Absent').length;
            const pendingDays = processedAttendance.filter(d => d.computedStatus === 'Pending').length;
            const totalEvaluated = presentDays + absentDays;
            const attendancePercentage = totalEvaluated > 0 ? Math.round((presentDays / totalEvaluated) * 100) : 0;

            return {
                ...admin,
                dailyAttendance: processedAttendance,
                presentDays,
                absentDays,
                pendingDays,
                attendancePercentage
            };
        });
    }, [rawFilteredData, isCurrentMonth, todayDayNum, month, currentMonthStr]);

    const totalPresent = processedData.reduce((s, a) => s + (a.presentDays || 0), 0);
    const totalAbsent = processedData.reduce((s, a) => s + (a.absentDays || 0), 0);
    const avgRate = processedData.length
        ? Math.round(processedData.reduce((s, a) => s + (a.attendancePercentage || 0), 0) / processedData.length)
        : 0;
    const tabs = [
        { key: 'all', label: `All (${superAdminData.length + reportData.length})`, color: 'purple' },
        { key: 'superadmin', label: `Super Admins (${superAdminData.length})`, color: 'yellow' },
        { key: 'admin', label: `Admins (${reportData.length})`, color: 'blue' },
    ];

    const handleOpenCellDetail = (admin, d) => {
        const { dateStr, dayName, fullDateStr } = getDayHeaderInfo(d.day);
        setSelectedCellDetail({
            adminName: admin.name,
            role: admin._isSuperAdmin ? 'Super Admin' : 'Admin',
            isSuperAdmin: admin._isSuperAdmin,
            email: admin.email,
            phone: admin.phone,
            day: d.day,
            dateStr,
            dayName,
            fullDateStr,
            status: d.computedStatus,
            loginCount: d.loginCount,
            firstLogin: d.firstLogin,
            logoutTime: d.logoutTime || d.lastLogin,
            sessions: d.sessions || [],
            isToday: d.isToday
        });
        onCellOpen();
    };

    const handleExportCSV = () => {
        if (!processedData.length) return;
        const dayHeaders = Array.from({ length: daysInMonth }, (_, i) => getDayHeaderInfo(i + 1).csvHeader).join(',');
        let csv = `Role,Admin Name,Email,Phone,Present Days,Absent Days,Attendance %,${dayHeaders}\n`;
        processedData.forEach(admin => {
            const dayStatuses = (admin.dailyAttendance || []).map(d => {
                if (d.computedStatus === 'Present') return `Present (${d.firstLogin})`;
                if (d.computedStatus === 'Pending') return 'Pending (Login Count: 0)';
                if (d.computedStatus === 'Absent') return 'Absent (Login Count: 0)';
                if (d.computedStatus === 'Not Joined') return 'Not Joined';
                return '-';
            }).join(',');
            const clean = (val) => `"${String(val || '').replace(/"/g, '""')}"`;
            const role = admin._isSuperAdmin ? 'Super Admin' : 'Admin';
            csv += `${clean(role)},${clean(admin.name)},${clean(admin.email)},${clean(admin.phone)},${admin.presentDays ?? 'N/A'},${admin.absentDays ?? 'N/A'},${admin.attendancePercentage != null ? admin.attendancePercentage + '%' : 'N/A'},${dayStatuses}\n`;
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
        if (!processedData.length) return;
        let html = `
        <html xmlns:x="urn:schemas-microsoft-com:office:excel">
        <head><meta charset="utf-8"><style>
            table { border-collapse: collapse; width: 100%; font-family: Arial, sans-serif; }
            th { background-color: #4C51BF; color: #FFFFFF; font-weight: bold; border: 1px solid #2D3748; padding: 10px; text-align: center; }
            td { border: 1px solid #CBD5E0; padding: 8px; text-align: center; font-size: 12px; }
            .present { background-color: #C6F6D5; color: #22543D; font-weight: bold; }
            .pending { background-color: #FEFCBF; color: #744210; font-weight: bold; }
            .absent { background-color: #FED7D7; color: #742A2A; font-weight: bold; }
            .notjoined { background-color: #EDF2F7; color: #718096; }
            .upcoming { background-color: #F7FAFC; color: #A0AEC0; }
            .name-col { text-align: left; font-weight: bold; background-color: #F8FAFC; }
            .sa-row { background-color: #FFFFF0; }
        </style></head>
        <body>
            <h2>Admin Login Attendance Report (${month})</h2>
            <p>⭐ Super Admins included. At least 1 daily login = Present. Unlogged today = Pending.</p>
            <table><thead><tr>
                <th style="width:50px;">#</th>
                <th style="width:80px;">Role</th>
                <th style="width:200px;text-align:left;">Admin Name</th>
                <th style="width:180px;text-align:left;">Email / Phone</th>
                <th style="width:80px;">Present</th>
                <th style="width:80px;">Absent</th>
                <th style="width:80px;">Rate</th>`;
        for (let i = 1; i <= daysInMonth; i++) {
            const { dateStr, dayName } = getDayHeaderInfo(i);
            html += `<th style="width:95px;">${dateStr}<br/><span style="font-size:10px;color:#E9D8FD;">${dayName}</span></th>`;
        }
        html += `</tr></thead><tbody>`;
        processedData.forEach((admin, idx) => {
            const roleLabel = admin._isSuperAdmin ? '⭐ Super Admin' : '🔵 Admin';
            const rowClass = admin._isSuperAdmin ? 'sa-row' : '';
            html += `<tr class="${rowClass}">
                <td style="font-weight:bold;">${idx + 1}</td>
                <td style="font-size:11px;font-weight:bold;">${roleLabel}</td>
                <td class="name-col">${admin.name}</td>
                <td style="text-align:left;">${admin.email || ''}<br/>${admin.phone || ''}</td>
                <td style="color:#276749;font-weight:bold;background-color:#F0FFF4;">${admin.presentDays ?? 'N/A'}</td>
                <td style="color:#9B2C2C;font-weight:bold;background-color:#FFF5F5;">${admin.absentDays ?? 'N/A'}</td>
                <td style="font-weight:bold;">${admin.attendancePercentage != null ? admin.attendancePercentage + '%' : 'N/A'}</td>`;
            (admin.dailyAttendance || []).forEach(d => {
                let cellClass = 'upcoming'; let content = '-';
                if (d.computedStatus === 'Present') {
                    cellClass = 'present'; content = `PRESENT<br/><span style="font-size:10px;">In:${d.firstLogin}<br/>Out:${d.logoutTime || d.lastLogin}</span>`;
                } else if (d.computedStatus === 'Pending') {
                    cellClass = 'pending'; content = 'PENDING<br/><span style="font-size:9px;">Logins: 0</span>';
                } else if (d.computedStatus === 'Absent') {
                    cellClass = 'absent'; content = 'ABSENT<br/><span style="font-size:9px;">Logins: 0</span>';
                } else if (d.computedStatus === 'Not Joined') {
                    cellClass = 'notjoined'; content = 'N/A';
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

    return (
        <Box bg="white" p={{ base: 4, md: 6 }} borderRadius="2xl" boxShadow="md" border="1px" borderColor="gray.100">

            {/* ── Header ─────────────────────────────────────── */}
            <Flex justify="space-between" align={{ base: 'start', md: 'center' }} direction={{ base: 'column', md: 'row' }} mb={5} gap={4}>
                <VStack align="start" spacing={1}>
                    <HStack>
                        <Icon as={MdAdminPanelSettings} color="purple.600" w={6} h={6} />
                        <Heading size="md" color="gray.800">Admin Login Attendance Report</Heading>
                    </HStack>
                    <Text fontSize="xs" color="gray.500" fontWeight="medium">
                        Tracks daily admin &amp; super admin presence. At least 1 login per day = Present.
                    </Text>
                </VStack>
                <HStack spacing={2} wrap="wrap">
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
                    <Tooltip label="Refresh data">
                        <Button size="sm" variant="outline" colorScheme="purple" onClick={fetchReport} isLoading={loading}>
                            <Icon as={FiRefreshCw} />
                        </Button>
                    </Tooltip>
                    <Button size="sm" colorScheme="teal" leftIcon={<FiDownload />} onClick={handleExportCSV} variant="outline" boxShadow="sm">
                        CSV
                    </Button>
                    <Button size="sm" colorScheme="green" leftIcon={<FiDownload />} onClick={handleExportExcelColor} boxShadow="sm" _hover={{ transform: 'translateY(-1px)', boxShadow: 'md' }}>
                        Colorful Excel
                    </Button>
                </HStack>
            </Flex>

            {/* ── Summary Stats ─────────────────────────────── */}
            {!loading && processedData.length > 0 && (
                <HStack mb={4} spacing={3} wrap="wrap">
                    <Box px={4} py={2} borderRadius="xl" bg="purple.50" border="1px" borderColor="purple.100">
                        <Text fontSize="10px" color="purple.500" fontWeight="800" textTransform="uppercase" letterSpacing="wide">People</Text>
                        <Text fontWeight="extrabold" fontSize="lg" color="purple.700">{processedData.length}</Text>
                    </Box>
                    <Box px={4} py={2} borderRadius="xl" bg="green.50" border="1px" borderColor="green.100">
                        <Text fontSize="10px" color="green.500" fontWeight="800" textTransform="uppercase" letterSpacing="wide">Total Present Days</Text>
                        <Text fontWeight="extrabold" fontSize="lg" color="green.700">{totalPresent}</Text>
                    </Box>
                    <Box px={4} py={2} borderRadius="xl" bg="red.50" border="1px" borderColor="red.100">
                        <Text fontSize="10px" color="red.500" fontWeight="800" textTransform="uppercase" letterSpacing="wide">Total Absent Days</Text>
                        <Text fontWeight="extrabold" fontSize="lg" color="red.700">{totalAbsent}</Text>
                    </Box>
                    <Box px={4} py={2} borderRadius="xl" bg="blue.50" border="1px" borderColor="blue.100">
                        <Text fontSize="10px" color="blue.500" fontWeight="800" textTransform="uppercase" letterSpacing="wide">Avg Attendance</Text>
                        <Text fontWeight="extrabold" fontSize="lg" color="blue.700">{avgRate}%</Text>
                    </Box>
                </HStack>
            )}

            {/* ── Filter Tabs ───────────────────────────────── */}
            <HStack spacing={2} mb={4} wrap="wrap">
                {tabs.map(tab => (
                    <Button
                        key={tab.key}
                        size="xs"
                        borderRadius="full"
                        colorScheme={tab.color}
                        variant={activeTab === tab.key ? 'solid' : 'outline'}
                        onClick={() => setActiveTab(tab.key)}
                        fontWeight="700"
                        leftIcon={tab.key === 'superadmin' ? <RiVipCrownFill /> : undefined}
                    >
                        {tab.label}
                    </Button>
                ))}
            </HStack>

            {/* ── Search ────────────────────────────────────── */}
            <Flex mb={4} justify="space-between" align="center" gap={3} wrap="wrap">
                <HStack bg="gray.50" px={3} py={1.5} borderRadius="lg" border="1px" borderColor="gray.200" flex="1" maxW="320px">
                    <Icon as={FiSearch} color="gray.400" />
                    <Input
                        placeholder="Search by name, email or phone..."
                        size="sm"
                        variant="unstyled"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </HStack>
                <Text fontSize="xs" color="gray.500" fontWeight="medium">
                    Showing <strong>{processedData.length}</strong> record(s)
                </Text>
            </Flex>

            {/* ── Legend ────────────────────────────────────── */}
            <HStack spacing={4} mb={3} wrap="wrap">
                <HStack spacing={1}>
                    <Icon as={RiVipCrownFill} color="yellow.500" w={3} h={3} />
                    <Text fontSize="10px" color="gray.600" fontWeight="bold">Super Admin</Text>
                </HStack>
                <HStack spacing={1}>
                    <Box w={3} h={3} borderRadius="sm" bg="purple.500" />
                    <Text fontSize="10px" color="gray.600" fontWeight="bold">Admin</Text>
                </HStack>
                <HStack spacing={1}>
                    <Box w={3} h={3} borderRadius="sm" bg="green.200" />
                    <Text fontSize="10px" color="gray.600" fontWeight="bold">Present</Text>
                </HStack>
                <HStack spacing={1}>
                    <Box w={3} h={3} borderRadius="sm" bg="yellow.300" />
                    <Text fontSize="10px" color="gray.600" fontWeight="bold">Pending (Today)</Text>
                </HStack>
                <HStack spacing={1}>
                    <Box w={3} h={3} borderRadius="sm" bg="red.200" />
                    <Text fontSize="10px" color="gray.600" fontWeight="bold">Absent</Text>
                </HStack>
            </HStack>

            <Divider mb={4} />

            {/* ── Table ─────────────────────────────────────── */}
            {loading ? (
                <Flex justify="center" align="center" py={12}>
                    <VStack>
                        <Spinner size="xl" color="purple.600" thickness="4px" />
                        <Text fontSize="sm" color="gray.500">Loading attendance data...</Text>
                    </VStack>
                </Flex>
            ) : processedData.length === 0 ? (
                <Box p={8} textAlign="center" bg="gray.50" borderRadius="xl" border="1px dashed" borderColor="gray.300">
                    <Icon as={FiAlertCircle} w={8} h={8} color="gray.400" mb={2} />
                    <Text fontWeight="bold" color="gray.600">No Records Found</Text>
                    <Text fontSize="xs" color="gray.400" mt={1}>
                        {searchQuery ? 'No results match your search.' : 'No admin login data available for this month.'}
                    </Text>
                </Box>
            ) : (
                <Box overflowX="auto" border="1px" borderColor="gray.200" borderRadius="xl">
                    <Table size="sm" variant="simple">
                        <Thead>
                            <Tr>
                                <Th bg="purple.700" color="white" py={3} minW="200px" position="sticky" left={0} zIndex={3}>
                                    Administrator
                                </Th>
                                <Th bg="purple.700" color="white" py={3} textAlign="center" w="80px">Present</Th>
                                <Th bg="purple.700" color="white" py={3} textAlign="center" w="80px">Absent</Th>
                                <Th bg="purple.700" color="white" py={3} textAlign="center" w="80px">Rate</Th>
                                {Array.from({ length: daysInMonth }, (_, i) => {
                                    const { dateStr, dayName } = getDayHeaderInfo(i + 1);
                                    return (
                                        <Th key={i} py={2} px={1} textAlign="center" minW="85px" bg="purple.700" color="white">
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
                            {processedData.map((admin, rowIdx) => {
                                const isSA = admin._isSuperAdmin;
                                return (
                                    <Tr key={admin._id || rowIdx} _hover={{ bg: isSA ? 'yellow.50' : 'gray.50' }} bg={isSA ? 'yellow.50' : 'white'}>
                                        <Td py={3} borderRight="1px" borderColor={isSA ? 'yellow.200' : 'gray.100'} bg={isSA ? 'yellow.50' : 'white'} position="sticky" left={0} zIndex={1} boxShadow="2px 0 5px rgba(0,0,0,0.03)">
                                            <HStack spacing={2} align="center">
                                                {isSA
                                                    ? <Icon as={RiVipCrownFill} color="yellow.500" w={4} h={4} flexShrink={0} />
                                                    : <Icon as={MdAdminPanelSettings} color="purple.400" w={4} h={4} flexShrink={0} />
                                                }
                                                <VStack align="start" spacing={0}>
                                                    <HStack spacing={1}>
                                                        <Text fontWeight="bold" fontSize="xs" color={isSA ? 'yellow.800' : 'gray.800'}>{admin.name}</Text>
                                                        {isSA && <Badge colorScheme="yellow" fontSize="7px" px={1} py={0} borderRadius="sm">SUPER</Badge>}
                                                    </HStack>
                                                    <Text fontSize="9px" color="gray.500">{admin.email || admin.phone}</Text>
                                                </VStack>
                                            </HStack>
                                        </Td>
                                        <Td textAlign="center" fontWeight="extrabold" color="green.600" bg="green.50">
                                            {admin.presentDays ?? <Text color="gray.300">—</Text>}
                                        </Td>
                                        <Td textAlign="center" fontWeight="extrabold" color="red.600" bg="red.50">
                                            {admin.absentDays ?? <Text color="gray.300">—</Text>}
                                        </Td>
                                        <Td textAlign="center" fontWeight="bold">
                                            {admin.attendancePercentage != null ? (
                                                <Badge colorScheme={admin.attendancePercentage >= 75 ? 'green' : admin.attendancePercentage >= 50 ? 'orange' : 'red'}>
                                                    {admin.attendancePercentage}%
                                                </Badge>
                                            ) : <Text fontSize="9px" color="gray.400">N/A</Text>}
                                        </Td>
                                        {(admin.dailyAttendance || []).map(d => {
                                            if (d.computedStatus === 'Present') {
                                                return (
                                                    <Td
                                                        key={d.day}
                                                        textAlign="center"
                                                        bg={isSA ? 'green.100' : 'green.50'}
                                                        borderRight="1px"
                                                        borderColor="green.100"
                                                        p={1.5}
                                                        cursor="pointer"
                                                        onClick={() => handleOpenCellDetail(admin, d)}
                                                        _hover={{ transform: 'scale(1.02)', bg: 'green.100' }}
                                                        transition="all 0.15s"
                                                    >
                                                        <Tooltip label={`Click to view details | Login Count: ${d.loginCount} | In: ${d.firstLogin} | Out: ${d.logoutTime || d.lastLogin}`}>
                                                            <Box>
                                                                <Badge colorScheme="green" fontSize="9px" px={1.5} py={0.5} borderRadius="md" mb={1}>PRESENT</Badge>
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
                                            } else if (d.computedStatus === 'Pending') {
                                                return (
                                                    <Td
                                                        key={d.day}
                                                        textAlign="center"
                                                        bg="yellow.50"
                                                        borderRight="1px"
                                                        borderColor="yellow.200"
                                                        p={1.5}
                                                        cursor="pointer"
                                                        onClick={() => handleOpenCellDetail(admin, d)}
                                                        _hover={{ transform: 'scale(1.02)', bg: 'yellow.100' }}
                                                        transition="all 0.15s"
                                                    >
                                                        <Tooltip label="Click to view details | Login Count = 0 (Pending - Not logged in yet today)">
                                                            <Box>
                                                                <Badge colorScheme="yellow" bg="yellow.400" color="yellow.900" fontSize="8.5px" px={1.5} py={0.5} borderRadius="md" mb={0.5} fontWeight="black">
                                                                    ⏳ PENDING
                                                                </Badge>
                                                                <Text fontSize="8px" color="yellow.800" fontWeight="bold">
                                                                    LOGIN: 0
                                                                </Text>
                                                            </Box>
                                                        </Tooltip>
                                                    </Td>
                                                );
                                            } else if (d.computedStatus === 'Absent') {
                                                return (
                                                    <Td
                                                        key={d.day}
                                                        textAlign="center"
                                                        bg="red.50"
                                                        borderRight="1px"
                                                        borderColor="red.100"
                                                        p={1.5}
                                                        cursor="pointer"
                                                        onClick={() => handleOpenCellDetail(admin, d)}
                                                        _hover={{ transform: 'scale(1.02)', bg: 'red.100' }}
                                                        transition="all 0.15s"
                                                    >
                                                        <Tooltip label="Click to view details | Login Count = 0 (Absent - No login recorded)">
                                                            <Box>
                                                                <Badge colorScheme="red" fontSize="9px" px={1.5} py={0.5} borderRadius="md">
                                                                    ABSENT
                                                                </Badge>
                                                                <Text fontSize="7.5px" color="red.600" fontWeight="bold" mt={0.5}>
                                                                    LOGINS: 0
                                                                </Text>
                                                            </Box>
                                                        </Tooltip>
                                                    </Td>
                                                );
                                            } else if (d.computedStatus === 'Not Joined') {
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
                                );
                            })}
                        </Tbody>
                    </Table>
                </Box>
            )}

            {/* ── Day Details Modal (Pop-up) ─────────────────────────────────── */}
            <Modal isOpen={isCellOpen} onClose={onCellClose} isCentered size={{ base: 'sm', md: 'lg' }}>
                <ModalOverlay backdropFilter="blur(4px)" bg="blackAlpha.600" />
                <ModalContent borderRadius="2xl" overflow="hidden" boxShadow="2xl">
                    <ModalHeader
                        bg={
                            selectedCellDetail?.status === 'Pending'
                                ? 'linear-gradient(135deg, #d97706 0%, #b45309 100%)'
                                : selectedCellDetail?.status === 'Present'
                                ? 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)'
                                : 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)'
                        }
                        color="white"
                        py={4}
                        px={5}
                    >
                        <Flex justify="space-between" align="center" pr={8}>
                            <HStack spacing={3} align="center">
                                <Box p={2} bg="whiteAlpha.200" borderRadius="xl">
                                    <Icon as={FiCalendar} boxSize={5} />
                                </Box>
                                <Box>
                                    <HStack spacing={2} align="center">
                                        <Text fontSize="lg" fontWeight="black" lineHeight="1.2">
                                            {selectedCellDetail?.dateStr}
                                        </Text>
                                        {selectedCellDetail?.isToday && (
                                            <Badge
                                                colorScheme={selectedCellDetail?.status === 'Pending' ? 'yellow' : 'teal'}
                                                variant="solid"
                                                fontSize="10px"
                                                px={2}
                                                py={0.5}
                                                borderRadius="full"
                                                fontWeight="black"
                                            >
                                                TODAY
                                            </Badge>
                                        )}
                                        <Badge
                                            colorScheme={selectedCellDetail?.isSuperAdmin ? 'yellow' : 'purple'}
                                            variant="subtle"
                                            fontSize="9px"
                                            px={2}
                                            py={0.2}
                                            borderRadius="full"
                                            fontWeight="bold"
                                        >
                                            {selectedCellDetail?.adminName}
                                        </Badge>
                                    </HStack>
                                    <Text fontSize="xs" fontWeight="medium" opacity={0.9} mt={0.5}>
                                        {selectedCellDetail?.fullDateStr || `${selectedCellDetail?.dateStr} (${selectedCellDetail?.dayName})`}
                                    </Text>
                                </Box>
                            </HStack>

                            <Badge
                                colorScheme={
                                    selectedCellDetail?.status === 'Present'
                                        ? 'green'
                                        : selectedCellDetail?.status === 'Pending'
                                        ? 'yellow'
                                        : 'red'
                                }
                                fontSize="xs"
                                px={3}
                                py={1}
                                borderRadius="full"
                                fontWeight="black"
                                variant="solid"
                            >
                                {selectedCellDetail?.status === 'Present'
                                    ? '✓ PRESENT'
                                    : selectedCellDetail?.status === 'Pending'
                                    ? '⏳ PENDING'
                                    : '✗ ABSENT'}
                            </Badge>
                        </Flex>
                    </ModalHeader>
                    <ModalCloseButton color="white" top={4} right={4} />

                    <ModalBody p={5}>
                        {selectedCellDetail && (
                            <VStack spacing={4} align="stretch">
                                {/* Top Metric Cards: Login Count & Logouts */}
                                <SimpleGrid columns={{ base: 3, sm: 3 }} spacing={3}>
                                    {/* Login Count */}
                                    <Box
                                        p={3}
                                        bg="green.50"
                                        borderRadius="xl"
                                        border="1.5px solid"
                                        borderColor="green.200"
                                        textAlign="center"
                                    >
                                        <HStack spacing={1} justify="center" mb={1} color="green.700">
                                            <Icon as={FiLogIn} boxSize={3.5} />
                                            <Text fontSize="10px" fontWeight="800" textTransform="uppercase" letterSpacing="wider">
                                                Login Count
                                            </Text>
                                        </HStack>
                                        <Text fontSize="2xl" fontWeight="900" color="green.800" lineHeight="1">
                                            {selectedCellDetail.status === 'Present' ? (selectedCellDetail.loginCount || 1) : 0}
                                        </Text>
                                        <Text fontSize="9px" fontWeight="bold" color="green.600" mt={1}>
                                            {selectedCellDetail.status === 'Present' && selectedCellDetail.loginCount > 0 ? `${selectedCellDetail.loginCount} Login Record(s)` : 'Login Count = 0'}
                                        </Text>
                                    </Box>

                                    {/* Number of Logouts */}
                                    <Box
                                        p={3}
                                        bg="purple.50"
                                        borderRadius="xl"
                                        border="1.5px solid"
                                        borderColor="purple.200"
                                        textAlign="center"
                                    >
                                        <HStack spacing={1} justify="center" mb={1} color="purple.700">
                                            <Icon as={FiLogOut} boxSize={3.5} />
                                            <Text fontSize="10px" fontWeight="800" textTransform="uppercase" letterSpacing="wider">
                                                Total Logouts
                                            </Text>
                                        </HStack>
                                        <Text fontSize="2xl" fontWeight="900" color="purple.800" lineHeight="1">
                                            {selectedCellDetail.status === 'Present' ? (selectedCellDetail.sessions?.filter(s => s.logoutTime && s.logoutTime !== '-' && s.logoutTime !== '—' && !s.isActive)?.length || (selectedCellDetail.logoutTime && selectedCellDetail.logoutTime !== '-' ? 1 : 0)) : 0}
                                        </Text>
                                        <Text fontSize="9px" fontWeight="bold" color="purple.600" mt={1}>
                                            Logout Record(s)
                                        </Text>
                                    </Box>

                                    {/* Status State */}
                                    <Box
                                        p={3}
                                        bg={
                                            selectedCellDetail.status === 'Pending'
                                                ? 'yellow.50'
                                                : selectedCellDetail.status === 'Present'
                                                ? 'teal.50'
                                                : 'gray.50'
                                        }
                                        borderRadius="xl"
                                        border="1.5px solid"
                                        borderColor={
                                            selectedCellDetail.status === 'Pending'
                                                ? 'yellow.300'
                                                : selectedCellDetail.status === 'Present'
                                                ? 'teal.300'
                                                : 'gray.200'
                                        }
                                        textAlign="center"
                                    >
                                        <HStack
                                            spacing={1}
                                            justify="center"
                                            mb={1}
                                            color={
                                                selectedCellDetail.status === 'Pending'
                                                    ? 'yellow.700'
                                                    : selectedCellDetail.status === 'Present'
                                                    ? 'teal.700'
                                                    : 'gray.600'
                                            }
                                        >
                                            <Icon as={FiActivity} boxSize={3.5} />
                                            <Text fontSize="10px" fontWeight="800" textTransform="uppercase" letterSpacing="wider">
                                                Status
                                            </Text>
                                        </HStack>
                                        <Text
                                            fontSize="xs"
                                            fontWeight="900"
                                            color={
                                                selectedCellDetail.status === 'Pending'
                                                    ? 'yellow.800'
                                                    : selectedCellDetail.status === 'Present'
                                                    ? 'teal.800'
                                                    : 'gray.700'
                                            }
                                            lineHeight="1.2"
                                            mt={1}
                                        >
                                            {selectedCellDetail.status === 'Present'
                                                ? 'Present'
                                                : selectedCellDetail.status === 'Pending'
                                                ? 'Pending Login'
                                                : 'Absent'}
                                        </Text>
                                        <Badge
                                            mt={1}
                                            colorScheme={
                                                selectedCellDetail.status === 'Present'
                                                    ? 'green'
                                                    : selectedCellDetail.status === 'Pending'
                                                    ? 'yellow'
                                                    : 'red'
                                            }
                                            fontSize="8px"
                                            px={1.5}
                                            py={0.2}
                                            borderRadius="full"
                                            fontWeight="bold"
                                        >
                                            {selectedCellDetail.status === 'Present'
                                                ? 'ACTIVE / LOGGED IN'
                                                : selectedCellDetail.status === 'Pending'
                                                ? 'AWAITING LOGIN'
                                                : 'NO LOGIN'}
                                        </Badge>
                                    </Box>
                                </SimpleGrid>

                                <Divider borderColor="gray.100" />

                                {/* Session Mapping or Empty State */}
                                <Box>
                                    <Flex justify="space-between" align="center" mb={3}>
                                        <HStack spacing={2} align="center">
                                            <Icon as={FiClock} color="purple.600" boxSize={4} />
                                            <Heading fontSize="xs" fontWeight="900" color="gray.800" textTransform="uppercase" letterSpacing="wider">
                                                Login &amp; Logout Time Mapping
                                            </Heading>
                                        </HStack>
                                        <Badge colorScheme="purple" fontSize="10px" px={2} py={0.5} borderRadius="full" fontWeight="bold">
                                            {selectedCellDetail.status === 'Present' ? (selectedCellDetail.sessions?.length || 1) : 0} Session(s)
                                        </Badge>
                                    </Flex>

                                    {selectedCellDetail.status === 'Present' ? (
                                        selectedCellDetail.sessions && selectedCellDetail.sessions.length > 0 ? (
                                            <VStack spacing={2.5} align="stretch">
                                                {selectedCellDetail.sessions.map((sess, idx) => (
                                                    <Box
                                                        key={idx}
                                                        p={3}
                                                        borderRadius="xl"
                                                        border="1px solid"
                                                        borderColor="gray.200"
                                                        bg="white"
                                                        boxShadow="xs"
                                                    >
                                                        <Flex justify="space-between" align="center" mb={2}>
                                                            <Badge colorScheme="purple" fontSize="10px" px={2} py={0.5} borderRadius="md" fontWeight="bold">
                                                                Session #{sess.sessionNumber || idx + 1}
                                                            </Badge>
                                                            {sess.duration && sess.duration !== '—' && (
                                                                <Text fontSize="10px" color="gray.600" fontWeight="bold">
                                                                    Duration: {sess.duration}
                                                                </Text>
                                                            )}
                                                        </Flex>
                                                        <SimpleGrid columns={2} spacing={2}>
                                                            <Box p={2} bg="green.50" borderRadius="md">
                                                                <Text fontSize="9px" fontWeight="bold" color="green.700">Login (In)</Text>
                                                                <Text fontSize="xs" fontWeight="black" color="green.900">{sess.loginTime || selectedCellDetail.firstLogin || '—'}</Text>
                                                            </Box>
                                                            <Box p={2} bg="purple.50" borderRadius="md">
                                                                <Text fontSize="9px" fontWeight="bold" color="purple.700">Logout (Out)</Text>
                                                                <Text fontSize="xs" fontWeight="black" color="purple.900">{sess.logoutTime || selectedCellDetail.logoutTime || '—'}</Text>
                                                            </Box>
                                                        </SimpleGrid>
                                                    </Box>
                                                ))}
                                            </VStack>
                                        ) : (
                                            <Box p={3} borderRadius="xl" border="1px solid" borderColor="green.200" bg="green.50">
                                                <SimpleGrid columns={2} spacing={2}>
                                                    <Box p={2} bg="white" borderRadius="md">
                                                        <Text fontSize="9px" fontWeight="bold" color="green.700">First Login (In)</Text>
                                                        <Text fontSize="xs" fontWeight="black" color="green.900">{selectedCellDetail.firstLogin || '—'}</Text>
                                                    </Box>
                                                    <Box p={2} bg="white" borderRadius="md">
                                                        <Text fontSize="9px" fontWeight="bold" color="purple.700">Logout / Last Active</Text>
                                                        <Text fontSize="xs" fontWeight="black" color="purple.900">{selectedCellDetail.logoutTime || '—'}</Text>
                                                    </Box>
                                                </SimpleGrid>
                                            </Box>
                                        )
                                    ) : (
                                        <Box
                                            p={6}
                                            textAlign="center"
                                            bg={selectedCellDetail.status === 'Pending' ? 'yellow.50' : 'gray.50'}
                                            borderRadius="xl"
                                            border="1px dashed"
                                            borderColor={selectedCellDetail.status === 'Pending' ? 'yellow.300' : 'gray.200'}
                                        >
                                            <Icon
                                                as={FiClock}
                                                boxSize={8}
                                                color={selectedCellDetail.status === 'Pending' ? 'yellow.500' : 'gray.300'}
                                                mb={2}
                                            />
                                            <Badge
                                                colorScheme={selectedCellDetail.status === 'Pending' ? 'yellow' : 'red'}
                                                fontSize="10px"
                                                px={2.5}
                                                py={0.5}
                                                borderRadius="md"
                                                mb={2}
                                                fontWeight="black"
                                            >
                                                LOGIN COUNT = 0
                                            </Badge>
                                            <Text
                                                fontSize="xs"
                                                fontWeight="bold"
                                                color={selectedCellDetail.status === 'Pending' ? 'yellow.800' : 'gray.600'}
                                            >
                                                {selectedCellDetail.status === 'Pending'
                                                    ? 'Not Logged In Yet Today (Pending)'
                                                    : 'Not Logged In (Absent)'}
                                            </Text>
                                            <Text
                                                fontSize="10px"
                                                color={selectedCellDetail.status === 'Pending' ? 'yellow.700' : 'gray.400'}
                                                mt={1}
                                            >
                                                {selectedCellDetail.status === 'Pending'
                                                    ? 'Attendance for today is currently Pending until an admin login occurs. Login count is 0.'
                                                    : 'Status is Absent because no admin login occurred on this day. Login count is 0.'}
                                            </Text>
                                        </Box>
                                    )}
                                </Box>
                            </VStack>
                        )}
                    </ModalBody>

                    <ModalFooter p={4} bg="gray.50">
                        <Button w="full" size="sm" colorScheme="gray" onClick={onCellClose} borderRadius="xl" fontWeight="bold">
                            Close
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
};

export default AdminLoginReportView;
