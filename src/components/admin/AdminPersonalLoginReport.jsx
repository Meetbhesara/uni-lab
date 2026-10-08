import React, { useState, useEffect, useMemo } from 'react';
import {
    Box, Flex, VStack, HStack, Text, Heading, Badge, Button, Icon,
    SimpleGrid, Spinner, Input, Tooltip, IconButton, Avatar,
    Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter,
    ModalCloseButton, useDisclosure, Divider, Select, InputGroup, InputLeftElement
} from '@chakra-ui/react';
import {
    FiCalendar, FiClock, FiCheckCircle, FiXCircle, FiRefreshCw,
    FiChevronLeft, FiChevronRight, FiUser, FiActivity, FiInfo, FiLogIn, FiLogOut,
    FiCheck, FiCircle, FiSearch, FiFilter, FiUsers
} from 'react-icons/fi';
import { RiVipCrownFill } from 'react-icons/ri';
import { MdAdminPanelSettings } from 'react-icons/md';
import api from '../../api/axios';

const AdminPersonalLoginReport = ({ user }) => {
    const now = new Date();
    const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const todayDayNum = now.getDate();

    const [month, setMonth] = useState(currentMonthStr);
    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState([]);
    const [daysInMonth, setDaysInMonth] = useState(30);
    const [evaluateUpToDay, setEvaluateUpToDay] = useState(30);
    const [selectedDayDetail, setSelectedDayDetail] = useState(null);
    const { isOpen: isDetailOpen, onOpen: onDetailOpen, onClose: onDetailClose } = useDisclosure();

    const isCurrentMonth = month === currentMonthStr;

    // Fetch report data on month change
    useEffect(() => {
        fetchReport();
    }, [month]);

    const fetchReport = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/auth/admin-login-report?month=${month}&includeSuperAdmin=true`);
            if (res.data && res.data.success) {
                setReportData(res.data.data || []);
                setDaysInMonth(res.data.daysInMonth || 30);
                setEvaluateUpToDay(res.data.evaluateUpToDay || 30);
            }
        } catch (err) {
            console.error('Failed to load admin login attendance report:', err);
        } finally {
            setLoading(false);
        }
    };

    // Super Admin detection & admin filtering states
    const isSuperAdmin = Boolean(
        user?.isSuperAdmin ||
        user?.role === 'superadmin' ||
        user?.role === 'superAdmin' ||
        user?.role === 'SuperAdmin' ||
        (user?.role && String(user?.role).toLowerCase().includes('super'))
    );
    const [selectedAdminId, setSelectedAdminId] = useState('');

    // Active record being viewed (selected admin for Super Admin, or current logged-in user)
    const activeRecord = useMemo(() => {
        if (!reportData.length) return null;
        if (isSuperAdmin && selectedAdminId) {
            const found = reportData.find(a => String(a._id) === String(selectedAdminId));
            if (found) return found;
        }
        // Default to logged-in user
        return reportData.find(a =>
            (user?._id && String(a._id) === String(user._id)) ||
            (user?.id && String(a._id) === String(user.id)) ||
            (user?.email && a.email && a.email.toLowerCase() === user.email.toLowerCase()) ||
            (user?.phone && a.phone && a.phone === user.phone)
        ) || reportData[0] || null;
    }, [user, reportData, isSuperAdmin, selectedAdminId]);

    // Check if viewing own personal record
    const isViewingSelf = useMemo(() => {
        if (!user || !activeRecord) return true;
        return (
            (user._id && String(activeRecord._id) === String(user._id)) ||
            (user.id && String(activeRecord._id) === String(user.id)) ||
            (user.email && activeRecord.email && activeRecord.email.toLowerCase() === user.email.toLowerCase())
        );
    }, [user, activeRecord]);

    // Handle Month Navigation
    const handlePrevMonth = () => {
        const [y, m] = month.split('-').map(Number);
        const prevDate = new Date(y, m - 2, 1);
        setMonth(`${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`);
    };

    const handleNextMonth = () => {
        const [y, m] = month.split('-').map(Number);
        const nextDate = new Date(y, m, 1);
        setMonth(`${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}`);
    };

    // Helper: day info
    const getDayInfo = (dayNum) => {
        if (!month) return { dateStr: `${dayNum}`, dayName: '', isSunday: false };
        const [year, m] = month.split('-').map(Number);
        const dateObj = new Date(year, m - 1, dayNum);
        const isSunday = dateObj.getDay() === 0;
        const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
        const dateStr = dateObj.toLocaleDateString('en-US', { day: '2-digit', month: 'short' });
        const fullDateStr = dateObj.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        return { dateStr, dayName, isSunday, fullDateStr };
    };

    // Build day items with real-time active status and detailed session mappings
    const dayItems = useMemo(() => {
        const list = [];
        const attendanceMap = new Map();
        if (activeRecord && Array.isArray(activeRecord.dailyAttendance)) {
            activeRecord.dailyAttendance.forEach(d => {
                attendanceMap.set(d.day, d);
            });
        }

        for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
            const { dateStr, dayName, isSunday, fullDateStr } = getDayInfo(dayNum);
            const isToday = isCurrentMonth && dayNum === todayDayNum;
            const isFuture = isCurrentMonth && dayNum > todayDayNum;
            const backendDay = attendanceMap.get(dayNum);

            const hasBackendLogin = Boolean(
                backendDay && (
                    backendDay.status === 'Present' ||
                    (backendDay.firstLogin && backendDay.firstLogin !== '-' && backendDay.firstLogin !== '—') ||
                    (backendDay.loginCount && Number(backendDay.loginCount) > 0) ||
                    (Array.isArray(backendDay.sessions) && backendDay.sessions.length > 0)
                )
            );

            let status = 'Absent';
            let isCurrentActiveSession = false;

            if (isFuture) {
                status = 'Upcoming';
            } else if (isToday) {
                if (hasBackendLogin) {
                    status = 'Present';
                    const rawSess = Array.isArray(backendDay?.sessions) ? backendDay.sessions : [];
                    isCurrentActiveSession = isViewingSelf || rawSess.some(s => s.isActive || s.logoutTime?.includes('Active') || !s.rawLogoutAt);
                } else {
                    // Point 2: If today is not logged in yet, show pending state TODAY ONLY
                    status = 'Pending';
                    isCurrentActiveSession = false;
                }
            } else {
                // Past days without login remain Absent
                if (backendDay?.status === 'Not Joined') {
                    status = 'Not Joined';
                } else {
                    status = hasBackendLogin ? 'Present' : 'Absent';
                }
            }

            let firstLogin = null;
            let logoutTime = null;
            let lastLogin = null;
            let loginCount = 0;
            let sessions = [];

            if (status === 'Present') {
                firstLogin = (backendDay?.firstLogin && backendDay.firstLogin !== '-' && backendDay.firstLogin !== '—')
                    ? backendDay.firstLogin
                    : (isToday && isViewingSelf ? 'Active' : null);
                logoutTime = (backendDay?.logoutTime && backendDay.logoutTime !== '-' && backendDay.logoutTime !== '—')
                    ? backendDay.logoutTime
                    : null;
                lastLogin = (backendDay?.lastLogin && backendDay.lastLogin !== '-' && backendDay.lastLogin !== '—')
                    ? backendDay.lastLogin
                    : null;

                let rawSessions = backendDay?.sessions || [];
                sessions = Array.isArray(rawSessions) ? [...rawSessions] : [];

                if (isToday && isViewingSelf && sessions.length > 0) {
                    const lastIdx = sessions.length - 1;
                    if (!sessions[lastIdx].rawLogoutAt) {
                        sessions[lastIdx] = {
                            ...sessions[lastIdx],
                            isActive: true,
                            logoutTime: 'Active (Logged In)'
                        };
                    }
                }

                // Fallback: If sessions array is empty but status is Present
                if (sessions.length === 0 && (firstLogin || (isToday && isViewingSelf))) {
                    const isActiveSessionNow = isToday && (isViewingSelf || isCurrentActiveSession);
                    sessions.push({
                        sessionNumber: 1,
                        loginTime: firstLogin || (isActiveSessionNow ? 'Active' : '—'),
                        logoutTime: isActiveSessionNow ? 'Active (Logged In)' : (logoutTime || lastLogin || '—'),
                        isActive: isActiveSessionNow,
                        duration: '—',
                        ipAddress: ''
                    });
                }

                // Ensure every session has a proper logout time and duration
                sessions = sessions.map((s, idx) => {
                    const isLast = idx === sessions.length - 1;
                    const isAct = (isToday && isViewingSelf && isLast && !s.rawLogoutAt) || s.isActive || s.logoutTime === 'Active (Logged In)';
                    
                    let outTime = s.logoutTime;
                    if (isAct) {
                        outTime = 'Active (Logged In)';
                    } else if (!outTime || outTime === '-' || outTime === '—') {
                        if (s.rawLastActiveAt) {
                            try {
                                outTime = new Date(s.rawLastActiveAt).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: true });
                            } catch(e) {}
                        }
                    }

                    // calculate duration if missing
                    let dur = s.duration;
                    if (!dur || dur === '—') {
                        try {
                            const start = new Date(s.rawLoginAt).getTime();
                            const end = isAct ? Date.now() : new Date(s.rawLogoutAt || s.rawLastActiveAt).getTime();
                            if (!isNaN(start) && !isNaN(end) && end >= start) {
                                const diffM = Math.round((end - start) / 60000);
                                const h = Math.floor(diffM / 60);
                                const m = diffM % 60;
                                dur = h > 0 ? `${h}h ${m}m` : `${m}m`;
                            }
                        } catch(e) {}
                    }

                    return {
                        ...s,
                        sessionNumber: s.sessionNumber || idx + 1,
                        logoutTime: outTime || '—',
                        duration: dur || '—',
                        isActive: isAct
                    };
                });

                loginCount = Math.max(backendDay?.loginCount || 0, sessions.length, 1);
            } else {
                // Point 3: If not logged in yet, strictly 0 logins and empty sessions
                sessions = [];
                firstLogin = null;
                logoutTime = null;
                lastLogin = null;
                loginCount = 0;
            }

            // Calculate session summary counts
            const loginTimesCount = sessions.length;
            const logoutTimesCount = sessions.filter(s => s.logoutTime && s.logoutTime !== '-' && s.logoutTime !== '—' && s.logoutTime !== 'Active (Logged In)' && !s.isActive).length;
            const activeSessionsCount = sessions.filter(s => s.isActive || s.logoutTime === 'Active (Logged In)').length;

            list.push({
                day: dayNum,
                dateStr,
                dayName,
                fullDateStr,
                isSunday,
                isToday,
                isFuture,
                status,
                firstLogin,
                logoutTime,
                lastLogin,
                loginCount,
                sessions,
                loginTimesCount,
                logoutTimesCount,
                activeSessionsCount,
                isCurrentActiveSession
            });
        }
        return list;
    }, [daysInMonth, month, activeRecord, isCurrentMonth, todayDayNum, isViewingSelf]);

    // Recalculate stats with current live status
    const stats = useMemo(() => {
        const present = dayItems.filter(d => d.status === 'Present').length;
        const absent = dayItems.filter(d => d.status === 'Absent').length;
        const pending = dayItems.filter(d => d.status === 'Pending').length;
        const totalEvaluated = Math.max(1, present + absent);
        const rate = Math.min(100, Math.round((present / totalEvaluated) * 100));
        return {
            presentDays: present,
            absentDays: absent,
            pendingDays: pending,
            attendancePercentage: rate
        };
    }, [dayItems]);

    const todayItem = useMemo(() => {
        return dayItems.find(d => d.isToday) || null;
    }, [dayItems]);

    const handleOpenDetail = (dayItem) => {
        setSelectedDayDetail(dayItem);
        onDetailOpen();
    };

    return (
        <Box
            bg="white"
            p={{ base: 4, md: 6 }}
            borderRadius="2xl"
            boxShadow="sm"
            border="1px solid"
            borderColor="gray.100"
            mt={8}
            overflow="hidden"
        >
            {/* ── Top Header Bar ─────────────────────────────────────────── */}
            <Flex
                justify="space-between"
                align={{ base: 'flex-start', md: 'center' }}
                direction={{ base: 'column', md: 'row' }}
                gap={4}
                mb={6}
                pb={4}
                borderBottom="1px solid"
                borderColor="gray.100"
            >
                <HStack spacing={3.5} align="center">
                    <Box
                        p={2.5}
                        borderRadius="xl"
                        bg={activeRecord?.isSuperAdmin ? 'yellow.50' : 'purple.50'}
                        color={activeRecord?.isSuperAdmin ? 'yellow.600' : 'purple.600'}
                        border="1px solid"
                        borderColor={activeRecord?.isSuperAdmin ? 'yellow.200' : 'purple.200'}
                        flexShrink={0}
                    >
                        <Icon as={activeRecord?.isSuperAdmin ? RiVipCrownFill : MdAdminPanelSettings} boxSize={6} />
                    </Box>
                    <Box>
                        <HStack spacing={2} wrap="wrap">
                            <Heading fontSize={{ base: 'md', md: 'lg' }} fontWeight="900" color="gray.800">
                                {isSuperAdmin && !isViewingSelf
                                    ? `${activeRecord?.name || 'Admin'}'s Login & Attendance Report`
                                    : 'My Login & Attendance Report'
                                }
                            </Heading>
                            <Badge
                                colorScheme={activeRecord?.isSuperAdmin ? 'yellow' : 'purple'}
                                fontSize="10px"
                                px={2}
                                py={0.5}
                                borderRadius="full"
                                fontWeight="black"
                            >
                                {activeRecord?.isSuperAdmin ? 'SUPER ADMIN' : 'ADMIN'}
                            </Badge>
                            {isCurrentMonth && (isViewingSelf || dayItems.some(d => d.isToday && d.isCurrentActiveSession)) && (
                                <Badge colorScheme="green" variant="solid" fontSize="10px" px={2} py={0.5} borderRadius="full" fontWeight="black">
                                    ● CURRENT SESSION ACTIVE
                                </Badge>
                            )}
                        </HStack>
                        <Text fontSize="xs" color="gray.500" mt={0.5}>
                            {isSuperAdmin && !isViewingSelf
                                ? <>Daily login history, logout timestamps &amp; session activity for <strong>{activeRecord?.name || activeRecord?.email}</strong>.</>
                                : <>Personal daily login history, logout timestamps &amp; active session monitoring for <strong>{user?.name || user?.email}</strong>.</>
                            }
                        </Text>
                    </Box>
                </HStack>

                {/* Month Picker & Controls */}
                <HStack spacing={2} align="center" flexShrink={0} wrap="wrap">
                    <IconButton
                        icon={<FiChevronLeft />}
                        size="sm"
                        variant="ghost"
                        aria-label="Previous Month"
                        onClick={handlePrevMonth}
                        title="Previous Month"
                    />
                    <HStack
                        bg="gray.50"
                        px={3}
                        py={1.5}
                        borderRadius="xl"
                        border="1px solid"
                        borderColor="gray.200"
                    >
                        <Icon as={FiCalendar} color="purple.600" />
                        <Input
                            type="month"
                            size="xs"
                            variant="unstyled"
                            value={month}
                            onChange={(e) => setMonth(e.target.value)}
                            fontWeight="800"
                            color="purple.800"
                            w="115px"
                            cursor="pointer"
                        />
                    </HStack>
                    <IconButton
                        icon={<FiChevronRight />}
                        size="sm"
                        variant="ghost"
                        aria-label="Next Month"
                        onClick={handleNextMonth}
                        title="Next Month"
                    />
                    <Tooltip label="Refresh attendance data">
                        <IconButton
                            icon={<FiRefreshCw />}
                            size="sm"
                            variant="outline"
                            colorScheme="purple"
                            aria-label="Refresh"
                            onClick={fetchReport}
                            isLoading={loading}
                        />
                    </Tooltip>
                </HStack>
            </Flex>

            {/* ── Super Admin Filter (Simple Selection Box Only) ────────── */}
            {isSuperAdmin && reportData.length > 0 && (
                <HStack spacing={3} mb={5} align="center">
                    <Text fontSize="xs" fontWeight="bold" color="gray.700" whiteSpace="nowrap">
                        Filter Admin:
                    </Text>
                    <Select
                        size="sm"
                        maxW={{ base: 'full', md: '300px' }}
                        bg="white"
                        borderRadius="xl"
                        borderColor="purple.200"
                        _focus={{ borderColor: 'purple.500', boxShadow: '0 0 0 1px #805ad5' }}
                        fontWeight="bold"
                        color="gray.800"
                        value={activeRecord?._id || ''}
                        onChange={(e) => setSelectedAdminId(e.target.value)}
                    >
                        {reportData.map(a => {
                            const isSelf = user && (String(a._id) === String(user._id || user.id) || a.email?.toLowerCase() === user.email?.toLowerCase());
                            const roleLabel = a.isSuperAdmin ? 'Super Admin' : 'Admin';
                            return (
                                <option key={a._id} value={a._id}>
                                    {a.name || 'Admin'} ({roleLabel}){isSelf ? ' — [YOU]' : ''}
                                </option>
                            );
                        })}
                    </Select>
                </HStack>
            )}

            {/* ── Personal KPI Summary Stats ─────────────────────────────── */}
            <SimpleGrid columns={{ base: 2, sm: 2, md: 4 }} spacing={4} mb={6}>
                <Box p={3.5} bg="green.50" borderRadius="xl" border="1px solid" borderColor="green.100">
                    <Text fontSize="10px" fontWeight="800" color="green.600" textTransform="uppercase" letterSpacing="wider">
                        Days Present
                    </Text>
                    <HStack spacing={2} align="baseline" mt={1}>
                        <Text fontSize="2xl" fontWeight="900" color="green.700" lineHeight="1">
                            {stats.presentDays}
                        </Text>
                        <Text fontSize="xs" color="green.600" fontWeight="bold">Days</Text>
                    </HStack>
                </Box>

                <Box p={3.5} bg="red.50" borderRadius="xl" border="1px solid" borderColor="red.100">
                    <Text fontSize="10px" fontWeight="800" color="red.600" textTransform="uppercase" letterSpacing="wider">
                        Days Absent
                    </Text>
                    <HStack spacing={2} align="baseline" mt={1}>
                        <Text fontSize="2xl" fontWeight="900" color="red.700" lineHeight="1">
                            {stats.absentDays}
                        </Text>
                        <Text fontSize="xs" color="red.600" fontWeight="bold">Days</Text>
                    </HStack>
                </Box>

                <Box p={3.5} bg="purple.50" borderRadius="xl" border="1px solid" borderColor="purple.100">
                    <Text fontSize="10px" fontWeight="800" color="purple.600" textTransform="uppercase" letterSpacing="wider">
                        Attendance Rate
                    </Text>
                    <HStack spacing={2} align="baseline" mt={1}>
                        <Text fontSize="2xl" fontWeight="900" color="purple.700" lineHeight="1">
                            {stats.attendancePercentage}%
                        </Text>
                        <Text fontSize="xs" color="purple.600" fontWeight="bold">Active</Text>
                    </HStack>
                </Box>

                <Box p={3.5} bg={todayItem?.status === 'Pending' ? 'yellow.50' : 'teal.50'} borderRadius="xl" border="1px solid" borderColor={todayItem?.status === 'Pending' ? 'yellow.200' : 'teal.100'}>
                    <Text fontSize="10px" fontWeight="800" color={todayItem?.status === 'Pending' ? 'yellow.700' : 'teal.600'} textTransform="uppercase" letterSpacing="wider">
                        Today's Status
                    </Text>
                    <HStack spacing={1.5} align="center" mt={1}>
                        <Box
                            w="8px"
                            h="8px"
                            borderRadius="full"
                            bg={
                                !isCurrentMonth
                                    ? 'gray.400'
                                    : todayItem?.isCurrentActiveSession || isViewingSelf
                                    ? 'teal.500'
                                    : todayItem?.status === 'Present'
                                    ? 'green.500'
                                    : todayItem?.status === 'Pending'
                                    ? 'yellow.500'
                                    : 'red.500'
                            }
                        />
                        <Text
                            fontSize="sm"
                            fontWeight="900"
                            color={
                                !isCurrentMonth
                                    ? 'gray.600'
                                    : todayItem?.isCurrentActiveSession || isViewingSelf
                                    ? 'teal.800'
                                    : todayItem?.status === 'Present'
                                    ? 'green.800'
                                    : todayItem?.status === 'Pending'
                                    ? 'yellow.800'
                                    : 'red.800'
                            }
                            noOfLines={1}
                        >
                            {!isCurrentMonth
                                ? 'Historical Data'
                                : todayItem?.isCurrentActiveSession || isViewingSelf
                                ? 'Active Session'
                                : todayItem?.status === 'Present'
                                ? 'Logged Out Today'
                                : todayItem?.status === 'Pending'
                                ? 'Pending (Not Logged In)'
                                : 'Absent'}
                        </Text>
                    </HStack>
                </Box>
            </SimpleGrid>

            {/* ── SQUARE-TYPE DAYS GRID (ZERO Horizontal Scrollbar) ──────── */}
            {loading ? (
                <Flex justify="center" align="center" py={12}>
                    <VStack spacing={2}>
                        <Spinner size="lg" color="purple.600" thickness="3px" />
                        <Text fontSize="xs" color="gray.500" fontWeight="bold">Loading your personal attendance...</Text>
                    </VStack>
                </Flex>
            ) : (
                <Box w="full" overflow="hidden">
                    <Flex justify="space-between" align="center" mb={3} wrap="wrap" gap={2}>
                        <Text fontSize="11px" fontWeight="800" color="gray.400" textTransform="uppercase" letterSpacing="wider">
                            Daily Calendar View ({daysInMonth} Days) — Click any day to view login &amp; logout session history
                        </Text>
                        <HStack spacing={3} fontSize="10px" color="gray.500" fontWeight="bold">
                            <HStack spacing={1}>
                                <Box w="10px" h="10px" borderRadius="xs" bg="green.100" border="1px solid" borderColor="green.300" />
                                <Text>Present</Text>
                            </HStack>
                            <HStack spacing={1}>
                                <Box w="10px" h="10px" borderRadius="xs" bg="red.100" border="1px solid" borderColor="red.300" />
                                <Text>Absent</Text>
                            </HStack>
                            <HStack spacing={1}>
                                <Box w="10px" h="10px" borderRadius="xs" bg="yellow.100" border="1px solid" borderColor="yellow.400" />
                                <Text>Pending (Today)</Text>
                            </HStack>
                            <HStack spacing={1}>
                                <Box w="10px" h="10px" borderRadius="xs" bg="teal.100" border="1px solid" borderColor="teal.400" />
                                <Text>Active Today</Text>
                            </HStack>
                        </HStack>
                    </Flex>

                    {/* Responsive Grid: 10 per row on xl, 7 on lg, 5 on md, 3 on sm, 2 on base */}
                    <SimpleGrid
                        columns={{ base: 2, sm: 3, md: 5, lg: 7, xl: 10 }}
                        spacing={3}
                        w="full"
                    >
                        {dayItems.map((d) => {
                            const isPresent = d.status === 'Present';
                            const isPending = d.status === 'Pending';
                            const isSunday = d.isSunday;
                            const isToday = d.isToday;
                            const isFuture = d.isFuture;

                            let cardBg = 'white';
                            let cardBorder = 'gray.200';

                            if (isToday) {
                                if (isViewingSelf || d.isCurrentActiveSession) {
                                    cardBg = 'teal.50';
                                    cardBorder = 'teal.400';
                                } else if (isPresent) {
                                    cardBg = 'green.50';
                                    cardBorder = 'green.200';
                                } else if (isPending) {
                                    cardBg = 'yellow.50';
                                    cardBorder = 'yellow.400';
                                } else {
                                    cardBg = 'red.50';
                                    cardBorder = 'red.200';
                                }
                            } else if (isPresent) {
                                cardBg = 'green.50';
                                cardBorder = 'green.200';
                            } else if (isFuture) {
                                cardBg = 'gray.50';
                                cardBorder = 'gray.100';
                            } else {
                                cardBg = 'red.50';
                                cardBorder = 'red.200';
                            }

                            return (
                                <Box
                                    key={d.day}
                                    as="button"
                                    onClick={() => handleOpenDetail(d)}
                                    textAlign="left"
                                    p={3}
                                    borderRadius="2xl"
                                    bg={cardBg}
                                    border="1.5px solid"
                                    borderColor={cardBorder}
                                    boxShadow={
                                        isToday
                                            ? isPending
                                                ? '0 0 0 2px rgba(236, 201, 75, 0.4), 0 4px 6px -1px rgba(0, 0, 0, 0.08)'
                                                : '0 0 0 2px rgba(49, 151, 149, 0.25), 0 4px 6px -1px rgba(0, 0, 0, 0.08)'
                                            : 'xs'
                                    }
                                    transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
                                    _hover={{
                                        transform: 'translateY(-2px)',
                                        boxShadow: 'md',
                                        borderColor: isToday ? (isPending ? 'yellow.500' : 'teal.500') : isPresent ? 'green.400' : 'purple.300'
                                    }}
                                    position="relative"
                                    display="flex"
                                    flexDirection="column"
                                    justifyContent="space-between"
                                    minH="120px"
                                    cursor="pointer"
                                >
                                    {/* Top Row: Date & Day Badge */}
                                    <Flex justify="space-between" align="center" mb={1.5}>
                                        <Text fontSize="xs" fontWeight="900" color="gray.800" lineHeight="1">
                                            {d.dateStr}
                                        </Text>
                                        <HStack spacing={1}>
                                            {isToday && (
                                                <Badge
                                                    colorScheme={isPending ? 'yellow' : 'teal'}
                                                    variant="solid"
                                                    fontSize="8px"
                                                    px={1.5}
                                                    py={0.2}
                                                    borderRadius="full"
                                                    fontWeight="black"
                                                >
                                                    TODAY
                                                </Badge>
                                            )}
                                            <Badge
                                                colorScheme="gray"
                                                fontSize="8px"
                                                px={1}
                                                py={0.2}
                                                borderRadius="sm"
                                                fontWeight="bold"
                                            >
                                                {d.dayName}
                                            </Badge>
                                        </HStack>
                                    </Flex>

                                    {/* Center: Status Badge */}
                                    <Box my={1} textAlign="center">
                                        {isPresent ? (
                                            <Badge
                                                colorScheme="green"
                                                variant="solid"
                                                fontSize="9px"
                                                px={2}
                                                py={0.5}
                                                borderRadius="md"
                                                fontWeight="black"
                                                w="full"
                                                textAlign="center"
                                            >
                                                ✓ PRESENT
                                            </Badge>
                                        ) : isPending ? (
                                            <Badge
                                                colorScheme="yellow"
                                                variant="solid"
                                                bg="yellow.400"
                                                color="yellow.900"
                                                fontSize="8.5px"
                                                px={1.5}
                                                py={0.5}
                                                borderRadius="md"
                                                fontWeight="black"
                                                w="full"
                                                textAlign="center"
                                            >
                                                ⏳ PENDING
                                            </Badge>
                                        ) : isFuture ? (
                                            <Badge
                                                colorScheme="gray"
                                                variant="subtle"
                                                fontSize="8px"
                                                px={1.5}
                                                py={0.5}
                                                borderRadius="md"
                                                fontWeight="bold"
                                                color="gray.400"
                                            >
                                                UPCOMING
                                            </Badge>
                                        ) : (
                                            <Badge
                                                colorScheme="red"
                                                variant="solid"
                                                fontSize="8px"
                                                px={1.5}
                                                py={0.5}
                                                borderRadius="md"
                                                fontWeight="black"
                                                w="full"
                                                textAlign="center"
                                            >
                                                ✗ ABSENT
                                            </Badge>
                                        )}
                                    </Box>

                                    {/* Bottom Row: In & Out timestamps */}
                                    <Box mt={1} pt={1.5} borderTop="1px dashed" borderColor={isToday ? (isPending ? 'yellow.300' : 'teal.200') : isPresent ? 'green.200' : 'gray.200'}>
                                        {isPresent ? (
                                            <VStack spacing={0.5} align="stretch">
                                                <HStack spacing={1} justify="space-between">
                                                    <Text fontSize="9px" color="gray.500" fontWeight="bold">In:</Text>
                                                    <Text fontSize="9px" fontWeight="black" color="green.800" noOfLines={1}>
                                                        {d.firstLogin || 'Active'}
                                                    </Text>
                                                </HStack>

                                                <HStack spacing={1} justify="space-between">
                                                    <Text fontSize="9px" color="gray.500" fontWeight="bold">Out:</Text>
                                                    {isToday && (isViewingSelf || d.isCurrentActiveSession) ? (
                                                        <Badge colorScheme="green" fontSize="7px" px={1} py={0} borderRadius="sm" fontWeight="black">
                                                            ACTIVE NOW
                                                        </Badge>
                                                    ) : (
                                                        <Text fontSize="9px" fontWeight="black" color={d.logoutTime ? 'purple.700' : 'gray.500'} noOfLines={1}>
                                                            {d.logoutTime || d.lastLogin || '—'}
                                                        </Text>
                                                    )}
                                                </HStack>

                                                {/* Number of sessions indicator */}
                                                {d.sessions && d.sessions.length > 1 && (
                                                    <Badge
                                                        colorScheme="purple"
                                                        variant="subtle"
                                                        fontSize="7.5px"
                                                        px={1}
                                                        py={0.2}
                                                        borderRadius="sm"
                                                        textAlign="center"
                                                        fontWeight="black"
                                                        w="full"
                                                        mt={0.5}
                                                    >
                                                        {d.sessions.length} SESSIONS
                                                    </Badge>
                                                )}
                                            </VStack>
                                        ) : isPending ? (
                                            <VStack spacing={0.5} align="center">
                                                <Text fontSize="9px" color="yellow.800" textAlign="center" fontWeight="bold">
                                                    Pending Login
                                                </Text>
                                                <Badge colorScheme="yellow" fontSize="7.5px" px={1} py={0} borderRadius="sm" fontWeight="black">
                                                    LOGIN COUNT: 0
                                                </Badge>
                                            </VStack>
                                        ) : (
                                            <VStack spacing={0.5} align="center">
                                                <Text fontSize="9px" color="gray.400" textAlign="center" fontStyle="italic">
                                                    {isFuture ? 'Future Day' : 'Absent'}
                                                </Text>
                                                {!isFuture && (
                                                    <Badge colorScheme="red" fontSize="7px" px={1} py={0} borderRadius="sm" fontWeight="bold">
                                                        LOGINS: 0
                                                    </Badge>
                                                )}
                                            </VStack>
                                        )}
                                    </Box>
                                </Box>
                            );
                        })}
                    </SimpleGrid>
                </Box>
            )}

            {/* ── Day Details Modal (Login & Logout Time Mapping & Counters) ────────────────── */}
            <Modal isOpen={isDetailOpen} onClose={onDetailClose} isCentered size={{ base: 'sm', md: 'lg' }}>
                <ModalOverlay backdropFilter="blur(4px)" bg="blackAlpha.600" />
                <ModalContent borderRadius="2xl" overflow="hidden" boxShadow="2xl">
                    <ModalHeader
                        bg={
                            selectedDayDetail?.status === 'Pending'
                                ? 'linear-gradient(135deg, #d97706 0%, #b45309 100%)'
                                : selectedDayDetail?.isToday && (isViewingSelf || selectedDayDetail?.isCurrentActiveSession)
                                ? 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)'
                                : selectedDayDetail?.status === 'Present'
                                ? 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)'
                                : 'linear-gradient(135deg, #6b21a8 0%, #4c1d95 100%)'
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
                                            {selectedDayDetail?.dateStr}
                                        </Text>
                                        {selectedDayDetail?.isToday && (
                                            <Badge
                                                colorScheme={selectedDayDetail?.status === 'Pending' ? 'yellow' : 'teal'}
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
                                        {activeRecord && (
                                            <Badge colorScheme={activeRecord.isSuperAdmin ? 'yellow' : 'purple'} variant="subtle" fontSize="9px" px={2} py={0.2} borderRadius="full" fontWeight="bold">
                                                {activeRecord.name}
                                            </Badge>
                                        )}
                                    </HStack>
                                    <Text fontSize="xs" fontWeight="medium" opacity={0.9} mt={0.5}>
                                        {selectedDayDetail?.fullDateStr}
                                    </Text>
                                </Box>
                            </HStack>

                            <Badge
                                colorScheme={
                                    selectedDayDetail?.status === 'Present'
                                        ? 'green'
                                        : selectedDayDetail?.status === 'Pending'
                                        ? 'yellow'
                                        : selectedDayDetail?.isFuture
                                        ? 'gray'
                                        : 'red'
                                }
                                fontSize="xs"
                                px={3}
                                py={1}
                                borderRadius="full"
                                fontWeight="black"
                                variant="solid"
                            >
                                {selectedDayDetail?.status === 'Present'
                                    ? '✓ PRESENT'
                                    : selectedDayDetail?.status === 'Pending'
                                    ? '⏳ PENDING'
                                    : selectedDayDetail?.status}
                            </Badge>
                        </Flex>
                    </ModalHeader>
                    <ModalCloseButton color="white" top={4} right={4} />

                    <ModalBody p={5}>
                        {selectedDayDetail && (
                            <VStack spacing={4} align="stretch">
                                {/* ── Top Metric Cards: Number of Logins & Logouts ── */}
                                <SimpleGrid columns={{ base: 3, sm: 3 }} spacing={3}>
                                    {/* Number of Login Time */}
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
                                            {selectedDayDetail.status === 'Present' ? (selectedDayDetail.loginCount || selectedDayDetail.loginTimesCount || 0) : 0}
                                        </Text>
                                        <Text fontSize="9px" fontWeight="bold" color="green.600" mt={1}>
                                            {selectedDayDetail.status === 'Present' && selectedDayDetail.loginCount > 0 ? `${selectedDayDetail.loginCount} Login Record(s)` : 'Login Count = 0'}
                                        </Text>
                                    </Box>

                                    {/* Number of Logout Time */}
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
                                            {selectedDayDetail.status === 'Present' ? (selectedDayDetail.logoutTimesCount ?? (selectedDayDetail.logoutTime && selectedDayDetail.logoutTime !== '-' ? 1 : 0)) : 0}
                                        </Text>
                                        <Text fontSize="9px" fontWeight="bold" color="purple.600" mt={1}>
                                            Logout Record(s)
                                        </Text>
                                    </Box>

                                    {/* Active Sessions State */}
                                    <Box
                                        p={3}
                                        bg={
                                            selectedDayDetail.status === 'Pending'
                                                ? 'yellow.50'
                                                : (selectedDayDetail.isToday && isViewingSelf) || selectedDayDetail.isCurrentActiveSession
                                                ? 'teal.50'
                                                : 'gray.50'
                                        }
                                        borderRadius="xl"
                                        border="1.5px solid"
                                        borderColor={
                                            selectedDayDetail.status === 'Pending'
                                                ? 'yellow.300'
                                                : (selectedDayDetail.isToday && isViewingSelf) || selectedDayDetail.isCurrentActiveSession
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
                                                selectedDayDetail.status === 'Pending'
                                                    ? 'yellow.700'
                                                    : (selectedDayDetail.isToday && isViewingSelf) || selectedDayDetail.isCurrentActiveSession
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
                                                selectedDayDetail.status === 'Pending'
                                                    ? 'yellow.800'
                                                    : (selectedDayDetail.isToday && isViewingSelf) || selectedDayDetail.isCurrentActiveSession
                                                    ? 'teal.800'
                                                    : 'gray.700'
                                            }
                                            lineHeight="1.2"
                                            mt={1}
                                        >
                                            {selectedDayDetail.isCurrentActiveSession
                                                ? 'Active Now'
                                                : selectedDayDetail.status === 'Present'
                                                ? 'Completed'
                                                : selectedDayDetail.status === 'Pending'
                                                ? 'Pending Login'
                                                : selectedDayDetail.status === 'Upcoming'
                                                ? 'Upcoming'
                                                : 'Absent'}
                                        </Text>
                                        <Badge
                                            mt={1}
                                            colorScheme={
                                                selectedDayDetail.isCurrentActiveSession
                                                    ? 'teal'
                                                    : selectedDayDetail.status === 'Present'
                                                    ? 'purple'
                                                    : selectedDayDetail.status === 'Pending'
                                                    ? 'yellow'
                                                    : 'gray'
                                            }
                                            fontSize="8px"
                                            px={1.5}
                                            py={0.2}
                                            borderRadius="full"
                                            fontWeight="bold"
                                        >
                                            {selectedDayDetail.isCurrentActiveSession
                                                ? 'LIVE SESSION'
                                                : selectedDayDetail.status === 'Present'
                                                ? 'CLOSED'
                                                : selectedDayDetail.status === 'Pending'
                                                ? 'AWAITING LOGIN'
                                                : 'NO LOGIN'}
                                        </Badge>
                                    </Box>
                                </SimpleGrid>

                                <Divider borderColor="gray.100" />

                                {/* ── Session Mapping: List of all Login Time & Logout Time ── */}
                                <Box>
                                    <Flex justify="space-between" align="center" mb={3}>
                                        <HStack spacing={2} align="center">
                                            <Icon as={FiClock} color="purple.600" boxSize={4} />
                                            <Heading fontSize="xs" fontWeight="900" color="gray.800" textTransform="uppercase" letterSpacing="wider">
                                                Login &amp; Logout Time Mapping
                                            </Heading>
                                        </HStack>
                                        <Badge colorScheme="purple" fontSize="10px" px={2} py={0.5} borderRadius="full" fontWeight="bold">
                                            {selectedDayDetail.sessions?.length || 0} Session{selectedDayDetail.sessions?.length === 1 ? '' : 's'}
                                        </Badge>
                                    </Flex>

                                    {selectedDayDetail.sessions && selectedDayDetail.sessions.length > 0 ? (
                                        <VStack spacing={3} align="stretch">
                                            {selectedDayDetail.sessions.map((sess, idx) => {
                                                const isSessionActive = sess.isActive || sess.logoutTime === 'Active (Logged In)';
                                                const isCompleted = !isSessionActive && sess.logoutTime && sess.logoutTime !== '-' && sess.logoutTime !== '—';

                                                return (
                                                    <Box
                                                        key={sess.sessionNumber || idx}
                                                        p={3.5}
                                                        borderRadius="xl"
                                                        border="1.5px solid"
                                                        borderColor={isSessionActive ? 'teal.300' : 'gray.200'}
                                                        bg={isSessionActive ? 'teal.50' : 'white'}
                                                        boxShadow="xs"
                                                        transition="all 0.2s"
                                                        _hover={{
                                                            borderColor: isSessionActive ? 'teal.500' : 'purple.300',
                                                            boxShadow: 'sm'
                                                        }}
                                                    >
                                                        {/* Top Row: Session Number & Duration */}
                                                        <Flex justify="space-between" align="center" mb={2.5}>
                                                            <HStack spacing={2}>
                                                                <Badge
                                                                    colorScheme={isSessionActive ? 'teal' : 'purple'}
                                                                    variant="solid"
                                                                    fontSize="11px"
                                                                    px={2.5}
                                                                    py={0.5}
                                                                    borderRadius="md"
                                                                    fontWeight="900"
                                                                >
                                                                    Session #{sess.sessionNumber || idx + 1}
                                                                </Badge>
                                                                {sess.duration && sess.duration !== '—' && (
                                                                    <HStack spacing={1} bg="gray.100" px={2} py={0.5} borderRadius="md">
                                                                        <Icon as={FiClock} boxSize={3} color="gray.600" />
                                                                        <Text fontSize="10px" fontWeight="bold" color="gray.700">
                                                                            Duration: {sess.duration}
                                                                        </Text>
                                                                    </HStack>
                                                                )}
                                                            </HStack>

                                                            {isSessionActive ? (
                                                                <Badge colorScheme="green" variant="solid" fontSize="9px" px={2} py={0.5} borderRadius="full" fontWeight="black">
                                                                    ● ACTIVE NOW
                                                                </Badge>
                                                            ) : isCompleted ? (
                                                                <Badge colorScheme="gray" variant="subtle" fontSize="9px" px={2} py={0.5} borderRadius="md" fontWeight="bold">
                                                                    ✓ LOGGED OUT
                                                                </Badge>
                                                            ) : (
                                                                <Badge colorScheme="orange" variant="subtle" fontSize="9px" px={2} py={0.5} borderRadius="md" fontWeight="bold">
                                                                    IN PROGRESS
                                                                </Badge>
                                                            )}
                                                        </Flex>

                                                        {/* 2-Column Grid: Login Time (In) & Logout Time (Out) */}
                                                        <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={2.5}>
                                                            {/* Login Time */}
                                                            <Box
                                                                p={2.5}
                                                                bg="green.50"
                                                                borderRadius="lg"
                                                                border="1px solid"
                                                                borderColor="green.200"
                                                            >
                                                                <HStack spacing={1.5} align="center" mb={0.5}>
                                                                    <Icon as={FiLogIn} color="green.600" boxSize={3.5} />
                                                                    <Text fontSize="10px" fontWeight="800" color="green.700" textTransform="uppercase">
                                                                        Login Time (In)
                                                                    </Text>
                                                                </HStack>
                                                                <Text fontSize="sm" fontWeight="900" color="green.900" pl={5}>
                                                                    {sess.loginTime || '—'}
                                                                </Text>
                                                            </Box>

                                                            {/* Logout Time */}
                                                            <Box
                                                                p={2.5}
                                                                bg={isSessionActive ? 'teal.50' : 'purple.50'}
                                                                borderRadius="lg"
                                                                border="1px solid"
                                                                borderColor={isSessionActive ? 'teal.200' : 'purple.200'}
                                                            >
                                                                <HStack spacing={1.5} align="center" mb={0.5}>
                                                                    <Icon as={FiLogOut} color={isSessionActive ? 'teal.600' : 'purple.600'} boxSize={3.5} />
                                                                    <Text
                                                                        fontSize="10px"
                                                                        fontWeight="800"
                                                                        color={isSessionActive ? 'teal.700' : 'purple.700'}
                                                                        textTransform="uppercase"
                                                                    >
                                                                        Logout Time (Out)
                                                                    </Text>
                                                                </HStack>
                                                                {isSessionActive ? (
                                                                    <HStack spacing={1.5} pl={5}>
                                                                        <Box w="6px" h="6px" borderRadius="full" bg="green.500" />
                                                                        <Text fontSize="sm" fontWeight="900" color="teal.800">
                                                                            Active (Logged In)
                                                                        </Text>
                                                                    </HStack>
                                                                ) : (
                                                                    <Text fontSize="sm" fontWeight="900" color="purple.900" pl={5}>
                                                                        {sess.logoutTime && sess.logoutTime !== '-' ? sess.logoutTime : '—'}
                                                                    </Text>
                                                                )}
                                                            </Box>
                                                        </SimpleGrid>

                                                        {/* IP Address info if available */}
                                                        {sess.ipAddress && sess.ipAddress !== '' && (
                                                            <Flex justify="flex-end" mt={1.5}>
                                                                <Text fontSize="9px" color="gray.400">
                                                                    Network IP: {sess.ipAddress === '::1' ? '127.0.0.1 (Local)' : sess.ipAddress}
                                                                </Text>
                                                            </Flex>
                                                        )}
                                                    </Box>
                                                );
                                            })}
                                        </VStack>
                                    ) : (
                                        <Box
                                            p={6}
                                            textAlign="center"
                                            bg={selectedDayDetail.status === 'Pending' ? 'yellow.50' : 'gray.50'}
                                            borderRadius="xl"
                                            border="1px dashed"
                                            borderColor={selectedDayDetail.status === 'Pending' ? 'yellow.300' : 'gray.200'}
                                        >
                                            <Icon
                                                as={FiClock}
                                                boxSize={8}
                                                color={selectedDayDetail.status === 'Pending' ? 'yellow.500' : 'gray.300'}
                                                mb={2}
                                            />
                                            <Badge
                                                colorScheme={selectedDayDetail.status === 'Pending' ? 'yellow' : 'red'}
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
                                                color={selectedDayDetail.status === 'Pending' ? 'yellow.800' : 'gray.600'}
                                            >
                                                {selectedDayDetail.status === 'Pending'
                                                    ? 'Not Logged In Yet Today (Pending)'
                                                    : selectedDayDetail.status === 'Absent'
                                                    ? 'Not Logged In (Absent)'
                                                    : 'No login sessions recorded for this day'}
                                            </Text>
                                            <Text
                                                fontSize="10px"
                                                color={selectedDayDetail.status === 'Pending' ? 'yellow.700' : 'gray.400'}
                                                mt={1}
                                            >
                                                {selectedDayDetail.status === 'Pending'
                                                    ? 'Attendance for today is currently Pending until an admin login occurs. Login count is 0.'
                                                    : selectedDayDetail.isFuture
                                                    ? 'This is an upcoming date.'
                                                    : 'Status is Absent because no admin login occurred on this day. Login count is 0.'}
                                            </Text>
                                        </Box>
                                    )}
                                </Box>

                                {/* ── Helpful Informational Footer Note ── */}
                                <Box p={3} bg="blue.50" borderRadius="xl" border="1px solid" borderColor="blue.100">
                                    <HStack spacing={2} align="center">
                                        <Icon as={FiInfo} color="blue.600" />
                                        <Text fontSize="xs" color="blue.700" fontWeight="bold">Session Time Tracking</Text>
                                    </HStack>
                                    <Text fontSize="11px" color="blue.600" mt={1}>
                                        Each time you log in, a new session is mapped with its exact start time. When you log out via the admin menu, the logout timestamp and duration are recorded immediately.
                                    </Text>
                                </Box>
                            </VStack>
                        )}
                    </ModalBody>

                    <ModalFooter p={4} bg="gray.50">
                        <Button w="full" size="sm" colorScheme="gray" onClick={onDetailClose} borderRadius="xl" fontWeight="bold">
                            Close
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
};

export default AdminPersonalLoginReport;
