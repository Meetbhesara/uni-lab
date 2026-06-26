import React, { useState, useEffect } from 'react';
import {
    Box, Table, Thead, Tbody, Tr, Th, Td, TableContainer,
    Button, Spinner, Center, Text, HStack, VStack, Icon, useToast, Heading, Flex, IconButton,
    Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
    FormControl, FormLabel, Input, Select as ChakraSelect, SimpleGrid, useDisclosure,
    InputGroup, InputLeftElement, Divider, InputLeftAddon, Badge,
    Popover, PopoverTrigger, PopoverContent, PopoverBody
} from '@chakra-ui/react';
import { FaDownload, FaFileExcel, FaPlus, FaTrash, FaCalendarAlt, FaClipboardCheck, FaMapMarkerAlt, FaCoffee, FaHamburger, FaUtensils, FaGasPump, FaStickyNote, FaMoneyBillWave, FaRupeeSign, FaPaperclip, FaChevronLeft, FaChevronRight, FaUsers } from 'react-icons/fa';
import api from '../api/axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

const AdminEmployeeExpenses = ({ employeeId, employeeName, externalReportType, globalStartDate, globalEndDate }) => {
    const [expenses, setExpenses] = useState([]);
    const [transfers, setTransfers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [employeeDetails, setEmployeeDetails] = useState(null);
    const [localStartDate, setLocalStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
    const [localEndDate, setLocalEndDate] = useState(new Date().toISOString().split('T')[0]);
    
    const startDate = globalStartDate !== undefined ? globalStartDate : localStartDate;
    const endDate = globalEndDate !== undefined ? globalEndDate : localEndDate;
    const [localReportType, setLocalReportType] = useState('Ledger');
    const [fuelFilter, setFuelFilter] = useState('ALL');
    const reportType = externalReportType || localReportType;
    const toast = useToast();

    // Configuration flag for local vs NAS saving
    const useNas = false;

    const [sites, setSites] = useState([]);
    const [employees, setEmployees] = useState([]);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [submitting, setSubmitting] = useState(false);
    const [expenseForm, setExpenseForm] = useState({
        date: new Date().toISOString().slice(0, 10),
        attendance: 'Present',
        breakfast: '',
        lunch: '',
        dinner: '',
        petrol: '',
        notes: '',
        attendanceRemark: ''
    });
    const [clientSites, setClientSites] = useState([{ 
        clientId: '', 
        siteId: '', 
        ledger: '',
        quantity: 0,
        files: { photos: [], data: [], dailyReports: [], drawing: [] } 
    }]);

    const [fuelType, setFuelType] = useState('Petrol');
    const [daySchedules, setDaySchedules] = useState([]);

    // Fetch Day Schedules on Date change inside modal
    useEffect(() => {
        if (!expenseForm.date || !isOpen) return;
        const fetchDaySchedules = async () => {
            try {
                const res = await api.get(`/schedule-master?date=${expenseForm.date}`);
                if (res.data.success) {
                    // Strictly filter to only schedules matching the selected date,
                    // preventing adjacent-date schedules from bleeding into this view.
                    const exactMatches = res.data.data.filter(s => {
                        if (!s.scheduleDate) return false;
                        const sDate = new Date(s.scheduleDate).toISOString().split('T')[0];
                        return sDate === expenseForm.date;
                    });
                    setDaySchedules(exactMatches);
                } else {
                    setDaySchedules([]);
                }
            } catch (err) {
                console.error("Failed to fetch day schedules inside admin modal", err);
                setDaySchedules([]);
            }
        };
        fetchDaySchedules();
    }, [expenseForm.date, isOpen]);

    const employeeSchedules = React.useMemo(() => {
        if (!employeeId) return [];
        return daySchedules.filter(s => {
            const opId = s.operative?._id || s.operative;
            return opId === employeeId;
        });
    }, [daySchedules, employeeId]);

    // Active schedule fallback for non-multiple calculations
    const activeSchedule = employeeSchedules.length > 0 ? employeeSchedules[0] : null;

    // Prefill Client & Site when employeeSchedules changes
    useEffect(() => {
        if (employeeSchedules.length > 0) {
            setClientSites(employeeSchedules.map(sch => ({
                clientId: sch.client?._id || sch.client,
                siteId: sch.site?._id || sch.site,
                ledger: sch.ledger || '',
                quantity: sch.quantity || 0,
                files: { photos: [], data: [], dailyReports: [], drawing: [] }
            })));
        } else {
            setClientSites([{
                clientId: '',
                siteId: '',
                ledger: '',
                quantity: 0,
                files: { photos: [], data: [], dailyReports: [], drawing: [] }
            }]);
        }
    }, [employeeSchedules]);

    const [otherExpenses, setOtherExpenses] = useState([]);
    const [givenTo, setGivenTo] = useState([]);
    const [receivedFrom, setReceivedFrom] = useState([]);

    // Total Calculation
    const totals = React.useMemo(() => {
        const stdTotal = (Number(expenseForm.breakfast) || 0) + 
                         (Number(expenseForm.lunch) || 0) + 
                         (Number(expenseForm.dinner) || 0) + 
                         (Number(expenseForm.petrol) || 0);
        const otherTotal = otherExpenses.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
        const total = stdTotal + otherTotal;
        const remaining = (employeeDetails?.totalAmount || 0) - total;
        return { stdTotal, otherTotal, total, remaining };
    }, [expenseForm, otherExpenses, employeeDetails]);

    const fetchExpenses = async () => {
        if (!employeeId) return;
        setLoading(true);
        try {
            if (employeeId === 'ALL') {
                const res = await api.get('/employee-expense/all');
                if (res.data.success) {
                    setExpenses(res.data.data);
                }
                setEmployeeDetails(null);
                setTransfers([]);
            } else {
                const [expRes, empRes, trRes] = await Promise.all([
                    api.get(`/employee-expense/admin/${employeeId}`),
                    api.get(`/employee-master/${employeeId}`),
                    api.get(`/employee-transfer`)
                ]);
                if (expRes.data.success) setExpenses(expRes.data.data);
                if (empRes.data.success) setEmployeeDetails(empRes.data.data);
                if (trRes.data.success) {
                    // Filter only transfers involving this employee
                    const myTransfers = trRes.data.data.filter(
                        t => (t.giver?._id || t.giver) === employeeId ||
                             (t.taker?._id || t.taker) === employeeId
                    );
                    setTransfers(myTransfers);
                }
            }
        } catch (err) {
            console.error("Error fetching employee expenses", err);
            toast({ title: 'Error loading expenses', status: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const fetchSites = async () => {
        try {
            const res = await api.get('/site-master');
            if (res.data.success) setSites(res.data.data);
        } catch (err) {
            console.error('Failed to fetch sites', err);
        }
    };

    const fetchEmployees = async () => {
        try {
            const res = await api.get('/employee-master');
            if (res.data.success) {
                // exclude current employee
                setEmployees(res.data.data.filter(e => e._id !== employeeId));
            }
        } catch (err) { console.error('Failed to fetch employees', err); }
    };

    useEffect(() => {
        fetchExpenses();
        fetchSites();
        fetchEmployees();
    }, [employeeId, toast]);



    const handleFormChange = (e) => {
        setExpenseForm({ ...expenseForm, [e.target.name]: e.target.value });
    };

    const addOtherExpenseRow = () => setOtherExpenses([...otherExpenses, { expenseName: '', amount: '' }]);
    const updateOtherExpense = (idx, field, val) => {
        const arr = [...otherExpenses];
        arr[idx][field] = val;
        setOtherExpenses(arr);
    };
    const removeOtherExpense = (idx) => setOtherExpenses(otherExpenses.filter((_, i) => i !== idx));

    const addGivenToRow = () => setGivenTo([...givenTo, { employeeRef: '', amount: '' }]);
    const updateGivenTo = (idx, field, val) => {
        const arr = [...givenTo];
        arr[idx][field] = val;
        setGivenTo(arr);
    };
    const removeGivenToRow = (idx) => setGivenTo(givenTo.filter((_, i) => i !== idx));

    const addReceivedFromRow = () => setReceivedFrom([...receivedFrom, { employeeRef: '', amount: '' }]);
    const updateReceivedFrom = (idx, field, val) => {
        const arr = [...receivedFrom];
        arr[idx][field] = val;
        setReceivedFrom(arr);
    };
    const removeReceivedFromRow = (idx) => setReceivedFrom(receivedFrom.filter((_, i) => i !== idx));

    const addClientSite = () => setClientSites([...clientSites, { clientId: '', siteId: '', ledger: '', quantity: 0, files: { photos: [], data: [], dailyReports: [], drawing: [] } }]);
    const removeClientSite = (idx) => setClientSites(clientSites.filter((_, i) => i !== idx));
    const updateClientSite = (idx, field, val) => {
        const updated = [...clientSites];
        updated[idx][field] = val;
        if (field === 'clientId') {
            updated[idx].siteId = ''; 
            updated[idx].ledger = '';
            updated[idx].quantity = 0;
        }
        if (field === 'siteId') {
            const matchingSchedules = employeeSchedules.filter(s => {
                const sSiteId = s.site?._id || s.site;
                return sSiteId === val;
            });
            if (matchingSchedules.length > 0) {
                updated[idx].ledger = matchingSchedules[0].ledger || '';
                updated[idx].quantity = matchingSchedules[0].quantity || 0;
            } else {
                updated[idx].ledger = '';
                updated[idx].quantity = 0;
            }
        }
        setClientSites(updated);
    };

    const handleSiteFileChange = (idx, e, category) => {
        const selectedFiles = Array.from(e.target.files);
        const updated = [...clientSites];
        updated[idx].files[category] = [...updated[idx].files[category], ...selectedFiles];
        setClientSites(updated);
    };

    const removeSiteFile = (siteIdx, category, fileIdx) => {
        const updated = [...clientSites];
        updated[siteIdx].files[category] = updated[siteIdx].files[category].filter((_, i) => i !== fileIdx);
        setClientSites(updated);
    };

    const handleAddExpense = async () => {
        if (!employeeId) return;
        setSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('employeeId', employeeId);
            formData.append('date', expenseForm.date);
            formData.append('attendance', expenseForm.attendance);
            formData.append('attendanceRemark', expenseForm.attendanceRemark);
            formData.append('notes', expenseForm.notes);
            formData.append('givenTo', JSON.stringify(givenTo.filter(g => g.employeeRef && g.amount)));
            formData.append('receivedFrom', JSON.stringify(receivedFrom.filter(r => r.employeeRef && r.amount)));
            
            // MAGIC INTERCEPTION: Bypass schema limits!
            let finalPetrol = 0;
            let interceptedOtherExpenses = [...otherExpenses];
            
            if (Number(expenseForm.petrol) > 0) {
                if (fuelType === 'Petrol') {
                    finalPetrol = Number(expenseForm.petrol);
                } else {
                    // Inject CNG or Diesel directly into other expenses!
                    interceptedOtherExpenses.push({ expenseName: fuelType, amount: Number(expenseForm.petrol) });
                }
            }

            formData.append('expenses', JSON.stringify({
                breakfast: Number(expenseForm.breakfast) || 0,
                lunch: Number(expenseForm.lunch) || 0,
                dinner: Number(expenseForm.dinner) || 0,
                petrol: finalPetrol
            }));
            formData.append('fuelType', fuelType);
            formData.append('otherExpensesList', JSON.stringify(interceptedOtherExpenses.map(o => ({ expenseName: o.expenseName, amount: Number(o.amount) })).filter(o => o.expenseName && o.amount)));
            
            // Format allocations for backend
            const allocations = clientSites.filter(cs => cs.clientId && cs.siteId);
            formData.append('clientSites', JSON.stringify(allocations.map(a => ({ clientId: a.clientId, siteId: a.siteId, ledger: a.ledger || '', quantity: Number(a.quantity) || 0 }))));

            // Add Files site-wise
            allocations.forEach((site, idx) => {
                const fullSite = sites.find(s => s._id === site.siteId);
                const fullClient = fullSite?.client;
                if (fullSite) {
                    const cShortId = (fullClient?.clientId || 'unknown').toLowerCase();
                    const sName = (fullSite?.siteName || 'unknown').trim().replace(/[^a-z0-9]/gi, '_').toLowerCase();
                    const sId = fullSite?.siteId || '0000';
                    formData.append(`site_${idx}_clientShortId`, cShortId);
                    formData.append(`site_${idx}_siteSubfolder`, `${sId}-${sName}`);
                }
                
                if (site.files.photos) site.files.photos.forEach(f => formData.append(`site_${idx}_photos`, f));
                if (site.files.dailyReports) site.files.dailyReports.forEach(f => formData.append(`site_${idx}_dailyReports`, f));
                if (site.files.data) site.files.data.forEach(f => formData.append(`site_${idx}_data`, f));
                if (site.files.drawing) site.files.drawing.forEach(f => formData.append(`site_${idx}_drawing`, f));
            });

            // Send metadata about the first site as fallback
            if (allocations[0]) {
                const fullSite = sites.find(s => s._id === allocations[0].siteId);
                const fullClient = fullSite?.client;
                formData.append('clientShortId', (fullClient?.clientId || 'unknown').toLowerCase());
                formData.append('siteSubfolder', `${fullSite?.siteId || '0000'}-${(fullSite?.siteName || 'unknown').trim().replace(/[^a-z0-9]/gi, '_').toLowerCase()}`);
            }

            const res = await api.post('/employee-expense/admin/add-expense', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (res.data.success) {
                toast({ title: 'Success', description: 'Expense added!', status: 'success', duration: 2000 });
                if (res.data.updatedEmployee) setEmployeeDetails(res.data.updatedEmployee);
                
                onClose();
                
                // Delay background refresh to prevent stale data race conditions
                setTimeout(() => {
                    fetchExpenses();
                }, 1000);

                setExpenseForm({ date: new Date().toISOString().slice(0, 10), attendance: 'Present', breakfast: '', lunch: '', dinner: '', petrol: '', notes: '' });
                setClientSites([{ clientId: '', siteId: '', ledger: '', quantity: 0, files: { photos: [], data: [], dailyReports: [], drawing: [] } }]);
                setOtherExpenses([]);
                setGivenTo([]);
                setReceivedFrom([]);
            }
        } catch (err) {
            toast({ title: 'Error', description: err.response?.data?.message || 'Failed to add', status: 'error' });
        } finally {
            setSubmitting(false);
        }
    };

    const handleDownload = async () => {
        if (useNas) {
            // Trigger backend call to save to NAS /volume1/work/employeename-expenses
            toast({ title: "NAS feature disabled currently per user request.", status: "info" });
            return;
        }

        if (reportType === 'ClientSite') {
            let csvContent = "SR. NO.,CLIENT NAME,SITE NAME,BREAKFAST,LUNCH,DINNER,FUEL,OTHER EXP.,TOTAL\n";
            const siteAgg = {};
            
            groupedByDate.forEach(g => {
                const exp = g.expense;
                if (!exp) return;
                
                const sitesToProcess = exp.clientSites && exp.clientSites.length > 0 
                    ? exp.clientSites 
                    : [null];
                    
                const n = sitesToProcess.length;
                
                sitesToProcess.forEach(cs => {
                    const cName = cs?.clientId?.clientName || 'Unspecified Client';
                    const sName = cs?.siteId?.siteName || 'Unspecified Site';
                    const key = `${cName}_${sName}`;
                    
                    if (!siteAgg[key]) {
                        siteAgg[key] = { clientName: cName, siteName: sName, breakfast: 0, lunch: 0, dinner: 0, fuel: 0, other: 0 };
                    }
                    
                    siteAgg[key].breakfast += (Number(exp.expenses?.breakfast) || 0) / n;
                    siteAgg[key].lunch += (Number(exp.expenses?.lunch) || 0) / n;
                    siteAgg[key].dinner += (Number(exp.expenses?.dinner) || 0) / n;
                    siteAgg[key].fuel += (Number(exp.expenses?.petrol) || 0) / n;
                    
                    if (exp.otherExpensesList && exp.otherExpensesList.length > 0) {
                        exp.otherExpensesList.forEach(other => {
                            const name = (other.expenseName || '').toLowerCase().trim();
                            const amount = Number(other.amount) || 0;
                            
                            if (amount > 0) {
                                const fraction = amount / n;
                                if (name.includes('petrol') || name === 'cng' || name.includes('cng') || name.includes('diesel') || name.includes('fuel')) {
                                    siteAgg[key].fuel += fraction;
                                } else {
                                    siteAgg[key].other += fraction;
                                }
                            }
                        });
                    }
                });
            });

            const aggArray = Object.values(siteAgg).map(s => ({
                ...s,
                total: s.breakfast + s.lunch + s.dinner + s.fuel + s.other
            })).filter(s => s.total > 0)
            .sort((a, b) => {
                const clientCmp = a.clientName.localeCompare(b.clientName);
                if (clientCmp !== 0) return clientCmp;
                return a.siteName.localeCompare(b.siteName);
            });

            let currentSrNo = 0;
            aggArray.forEach(site => {
                currentSrNo++;
                csvContent += `${currentSrNo},"${site.clientName}","${site.siteName}",${site.breakfast.toFixed(2)},${site.lunch.toFixed(2)},${site.dinner.toFixed(2)},${site.fuel.toFixed(2)},${site.other.toFixed(2)},${site.total.toFixed(2)}\n`;
            });

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.setAttribute("href", url);
            link.setAttribute("download", `${employeeName || 'Employee'}_ClientSite_Report.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            return;
        }

        if (reportType === 'EmployeeSiteLedger') {
            let csvContent = "SR. NO.,DATE,CLIENT NAME,SITE NAME,CREDIT,DEBIT,NET (Cr-Dr)\n";
            let currentSrNo = 0;
            let totalCr = 0;
            let totalDr = 0;

            const rows = [];
            groupedByDate.forEach(g => {
                const dateStr = new Date(g.dateKey).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
                
                if (g.expense) {
                    const exp = g.expense;
                    const sitesToProcess = exp.clientSites && exp.clientSites.length > 0 ? exp.clientSites : [null];
                    const n = sitesToProcess.length;
                    
                    let dayCredit = 0;
                    if (exp.creditDebit?.receivedFrom) {
                        exp.creditDebit.receivedFrom.forEach(r => dayCredit += (Number(r.amount) || 0));
                    }
                    if (g.transfers && g.transfers.length > 0) {
                        g.transfers.forEach(t => {
                            const isTaker = (t.taker?._id || t.taker) === employeeId;
                            if (isTaker) dayCredit += (Number(t.amount) || 0);
                        });
                    }

                    let dayDebit = 0;
                    const fixed = exp.expenses || {};
                    dayDebit += (Number(fixed.breakfast) || 0) + (Number(fixed.lunch) || 0) + (Number(fixed.dinner) || 0) + (Number(fixed.petrol) || 0);
                    if (exp.otherExpensesList) {
                        exp.otherExpensesList.forEach(o => dayDebit += (Number(o.amount) || 0));
                    }
                    if (exp.creditDebit?.givenTo) {
                        exp.creditDebit.givenTo.forEach(gOut => dayDebit += (Number(gOut.amount) || 0));
                    }
                    if (g.transfers && g.transfers.length > 0) {
                        g.transfers.forEach(t => {
                            const isGiver = (t.giver?._id || t.giver) === employeeId;
                            if (isGiver) dayDebit += (Number(t.amount) || 0);
                        });
                    }

                    sitesToProcess.forEach(cs => {
                        const cName = cs?.clientId?.clientName || 'Unspecified Client';
                        const sName = cs?.siteId?.siteName || 'Unspecified Site';
                        const splitCr = dayCredit / n;
                        const splitDr = dayDebit / n;
                        rows.push({
                            dateStr,
                            cName,
                            sName,
                            credit: Number(splitCr.toFixed(2)),
                            debit: Number(splitDr.toFixed(2)),
                            net: Number((splitCr - splitDr).toFixed(2))
                        });
                    });
                } else {
                    let credit = 0;
                    let debit = 0;
                    if (g.transfers && g.transfers.length > 0) {
                        g.transfers.forEach(t => {
                            const isTaker = (t.taker?._id || t.taker) === employeeId;
                            const isGiver = (t.giver?._id || t.giver) === employeeId;
                            if (isTaker) credit += (Number(t.amount) || 0);
                            if (isGiver) debit += (Number(t.amount) || 0);
                        });
                    }
                    rows.push({
                        dateStr,
                        cName: 'Unspecified Client',
                        sName: 'Unspecified Site',
                        credit,
                        debit,
                        net: credit - debit
                    });
                }
            });

            const filteredRows = rows.filter(r => r.credit > 0 || r.debit > 0 || r.cName !== 'Unspecified Client');

            let lastDate = '';
            let currentSr = 0;
            const finalRows = filteredRows.map(row => {
                const showDate = row.dateStr !== lastDate;
                if (row.dateStr) {
                    lastDate = row.dateStr;
                }
                if (showDate) {
                    currentSr++;
                }
                return {
                    ...row,
                    displayDate: showDate ? row.dateStr : '',
                    displaySrNo: currentSr
                };
            });

            finalRows.forEach(row => {
                totalCr += row.credit;
                totalDr += row.debit;
                csvContent += `${row.displayDate ? row.displaySrNo : ''},"${row.displayDate}","${row.cName}","${row.sName}",${row.credit.toFixed(2)},${row.debit.toFixed(2)},${row.net.toFixed(2)}\n`;
            });

            csvContent += `,,,GRAND TOTAL,${totalCr.toFixed(2)},${totalDr.toFixed(2)},${(totalCr - totalDr).toFixed(2)}\n`;

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.setAttribute("href", url);
            link.setAttribute("download", `${employeeName || 'Employee'}_SiteLedger_Report.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            return;
        }

        // Generate CSV manually based on filtered expenses
        let csvContent = "SR. NO.,DATE,DESCRIPTION,CREDIT,DEBIT,TOTAL,ATENDES,REMARK,SIDE WORK\n";

        filteredExpenses.forEach((exp, sNum) => {
            const dateStr = new Date(exp.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
            const attendance = exp.attendance === 'Present' ? 'P' : (exp.attendance === 'Half Day' ? 'HD' : 'A');
            
            const sites = exp.clientSites && exp.clientSites.length > 0 ? exp.clientSites : [null];
            const n = sites.length;

            // Aggregate Credits
            let credits = [];
            let totalCr = 0;
            if (exp.creditDebit?.receivedFrom) {
                exp.creditDebit.receivedFrom.forEach(r => {
                    const rAmount = Number(r.amount) || 0;
                    totalCr += rAmount;
                    sites.forEach(cs => {
                        const siteName = cs?.siteId?.siteName ? ` (${cs.siteId.siteName.toUpperCase()})` : '';
                        const allocatedCr = rAmount / n;
                        credits.push({
                            desc: `RECEIVED FROM ${(r.employeeRef?.name || 'Employee').toUpperCase()}${siteName}`,
                            cr: allocatedCr ? allocatedCr.toFixed(2) : '',
                            dr: '',
                            sideWork: cs?.siteId?.siteName ? `${cs.siteId.siteName}${cs.ledger ? ` [${cs.ledger.toUpperCase()}]` : ''}` : ''
                        });
                    });
                });
            }

            // Aggregate Debits
            let debits = [];
            let totalDr = 0;
            const fixed = exp.expenses || {};
            
            const pushSplitDebit = (baseDesc, amount) => {
                const numVal = Number(amount) || 0;
                if (!numVal) return;
                totalDr += numVal;
                sites.forEach(cs => {
                    const siteName = cs?.siteId?.siteName ? ` (${cs.siteId.siteName.toUpperCase()})` : '';
                    const allocatedDr = numVal / n;
                    debits.push({
                        desc: `${baseDesc}${siteName}`,
                        cr: '',
                        dr: allocatedDr ? allocatedDr.toFixed(2) : '',
                        sideWork: cs?.siteId?.siteName ? `${cs.siteId.siteName}${cs.ledger ? ` [${cs.ledger.toUpperCase()}]` : ''}` : ''
                    });
                });
            };

            pushSplitDebit('BREAK FAST', fixed.breakfast);
            pushSplitDebit('LUNCH', fixed.lunch);
            pushSplitDebit('DINNER', fixed.dinner);
            pushSplitDebit('PETROL', fixed.petrol);
            
            if (exp.otherExpensesList) {
                exp.otherExpensesList.forEach(o => {
                    pushSplitDebit(o.expenseName.toUpperCase(), o.amount);
                });
            }
            if (exp.creditDebit?.givenTo) {
                exp.creditDebit.givenTo.forEach(g => {
                    const gAmount = Number(g.amount) || 0;
                    totalDr += gAmount;
                    sites.forEach(cs => {
                        const siteName = cs?.siteId?.siteName ? ` (${cs.siteId.siteName.toUpperCase()})` : '';
                        const allocatedDr = gAmount / n;
                        debits.push({
                            desc: `GIVEN TO ${(g.employeeRef?.name || 'Employee').toUpperCase()}${siteName}`,
                            cr: '',
                            dr: allocatedDr ? allocatedDr.toFixed(2) : '',
                            sideWork: cs?.siteId?.siteName ? `${cs.siteId.siteName}${cs.ledger ? ` [${cs.ledger.toUpperCase()}]` : ''}` : ''
                        });
                    });
                });
            }

            const allItems = [...credits, ...debits];
            if (allItems.length === 0) allItems.push({ desc: 'NO TRANSACTIONS', cr: '', dr: '', sideWork: '' });

            // Map rows to CSV
            allItems.forEach((item, index) => {
                if (index === 0) {
                    csvContent += `${sNum + 1},${dateStr},"${item.desc}",${item.cr},${item.dr},,${attendance},"${exp.attendanceRemark || ''}","${item.sideWork || ''}"\n`;
                } else {
                    csvContent += `,, "${item.desc}",${item.cr},${item.dr},,,, "${item.sideWork || ''}"\n`;
                }
            });

            // Summary rows
            csvContent += `,,,,CR,${totalCr.toFixed(2)},,\n`;
            csvContent += `,,,,DR,${totalDr.toFixed(2)},,\n`;
            csvContent += `,,,,,${(totalCr - totalDr).toFixed(2)},,\n`;
        });

        // Download local
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `${employeeName || 'Employee'}_Expenses.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) {
        return <Center p={10}><Spinner size="xl" /></Center>;
    }



    // Always filter by date range
    const filteredExpenses = expenses.filter(e => {
        const d = new Date(e.date).toISOString().split('T')[0];
        const end = endDate || new Date().toISOString().split('T')[0];
        if (startDate && d < startDate) return false;
        if (d > end) return false;
        return true;
    });

    const filteredTransfers = transfers.filter(t => {
        const d = new Date(t.date).toISOString().split('T')[0];
        const end = endDate || new Date().toISOString().split('T')[0];
        if (startDate && d < startDate) return false;
        if (d > end) return false;
        return true;
    });

    // Group all records by calendar date (YYYY-MM-DD key)
    const toDateKey = (d) => new Date(d).toISOString().slice(0, 10);

    const dateMap = {};
    [...filteredExpenses.map(e => ({ ...e, _rowType: 'expense' })),
     ...filteredTransfers.map(t => ({ ...t, _rowType: 'transfer' }))
    ].forEach(row => {
        // If employeeId === 'ALL', group by both Date and Employee to prevent overwriting
        const empIdentifier = (row.employeeId?._id || row.employeeId || 'unknown').toString();
        const key = employeeId === 'ALL' ? `${toDateKey(row.date)}_${empIdentifier}` : toDateKey(row.date);
        
        if (!dateMap[key]) dateMap[key] = { dateKey: row.date, expense: null, transfers: [] };
        if (row._rowType === 'expense') dateMap[key].expense = row;
        else dateMap[key].transfers.push(row);
    });

    // Sort date groups chronologically
    const groupedByDate = Object.values(dateMap).sort((a, b) => new Date(a.dateKey) - new Date(b.dateKey));

    return (
        <Box bg="white" p={{ base: 3, md: 6 }} borderRadius="xl" shadow="md">
            <Flex justify="space-between" mb={{ base: 3, md: 6 }} align={{ base: 'flex-start', md: 'center' }} flexWrap="wrap" gap={3} direction={{ base: 'column', md: 'row' }}>
                <Heading size="md" color="gray.800" fontSize={{ base: 'sm', md: 'md' }}>Daily Report: {employeeName}</Heading>
                
                <Flex flexWrap="wrap" gap={2} align="center">
                    {!externalReportType && (
                        <HStack>
                            <Text fontSize="sm" fontWeight="bold" color="gray.600">Report:</Text>
                            <ChakraSelect 
                                w={{ base: '120px', md: '140px' }}
                                bg="white"
                                borderRadius="xl"
                                shadow="sm"
                                size="sm"
                                fontWeight="bold"
                                value={localReportType} 
                                onChange={(e) => setLocalReportType(e.target.value)}
                            >
                                <option value="Ledger">Full Ledger</option>
                                <option value="Food">Food Report</option>
                                <option value="Fuel">Fuel Report</option>
                            </ChakraSelect>
                        </HStack>
                    )}
                    
                    {reportType === 'Fuel' && (
                        <HStack>
                            <Text fontSize="sm" fontWeight="bold" color="gray.600">Fuel:</Text>
                            <ChakraSelect 
                                w={{ base: '100px', md: '120px' }}
                                bg="white"
                                borderRadius="xl"
                                shadow="sm"
                                size="sm"
                                fontWeight="bold"
                                value={fuelFilter} 
                                onChange={(e) => setFuelFilter(e.target.value)}
                            >
                                <option value="ALL">All Fuels</option>
                                <option value="Petrol">Petrol</option>
                                <option value="Diesel">Diesel</option>
                                <option value="CNG">CNG</option>
                            </ChakraSelect>
                        </HStack>
                    )}

                    {globalStartDate === undefined && <HStack>
                        <ChakraSelect
                            w={{ base: '130px', md: '150px' }}
                            bg="white"
                            borderRadius="xl"
                            shadow="sm"
                            size="sm"
                            fontWeight="bold"
                            onChange={(e) => {
                                if (e.target.value) {
                                    const year = parseInt(e.target.value);
                                    setLocalStartDate(`${year}-04-01`);
                                    setLocalEndDate(`${year + 1}-03-31`);
                                }
                            }}
                        >
                            <option value="">Custom Date</option>
                            {[...Array(5)].map((_, i) => {
                                const y = new Date().getFullYear() - 2 + i;
                                return <option key={y} value={y}>{y}-{y+1} (FY)</option>;
                            })}
                        </ChakraSelect>
                        
                        <Text fontSize="sm" fontWeight="bold" color="gray.600">From:</Text>
                        <Input 
                            type="date" 
                            size="sm" 
                            bg="white" 
                            borderRadius="xl"
                            shadow="sm"
                            value={localStartDate}
                            onChange={(e) => setLocalStartDate(e.target.value)}
                        />
                        <Text fontSize="sm" fontWeight="bold" color="gray.600">To:</Text>
                        <Input 
                            type="date" 
                            size="sm" 
                            bg="white" 
                            borderRadius="xl"
                            shadow="sm"
                            value={localEndDate}
                            onChange={(e) => setLocalEndDate(e.target.value || new Date().toISOString().split('T')[0])}
                        />
                    </HStack>}

                    {/* Add Record button removed as requested */}
                    <Button colorScheme="green" leftIcon={<FaFileExcel />} onClick={handleDownload} size="sm">
                        Export
                    </Button>
                </Flex>
            </Flex>

            {/* Modal for Adding Expense/Attendance */}
            <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
                <ModalOverlay backdropFilter="blur(5px)" />
                <ModalContent borderRadius="2xl" shadow="2xl">
                    <ModalHeader bgGradient="linear(to-r, purple.600, blue.500)" borderTopRadius="2xl" color="white" shadow="sm">
                        <HStack><Icon as={FaClipboardCheck} mr={2} /> <Text>Add Daily Record</Text></HStack>
                    </ModalHeader>
                    <ModalCloseButton color="white" mt={1} />
                    <ModalBody py={6} bg="gray.50">
                        <VStack spacing={6}>
                            {/* General Details Section */}
                            <Box w="full" bg="white" p={5} borderRadius="xl" shadow="sm" border="1px solid" borderColor="gray.100">
                                <Heading size="xs" textTransform="uppercase" color="purple.500" mb={4} letterSpacing="wider">Tracking Details</Heading>
                                <SimpleGrid columns={1} spacing={5} w="full">
                                    <FormControl>
                                        <FormLabel fontWeight="bold" fontSize="sm" color="gray.600">Date</FormLabel>
                                        <InputGroup>
                                            <InputLeftElement pointerEvents="none"><Icon as={FaCalendarAlt} color="purple.400" /></InputLeftElement>
                                            <Input type="date" name="date" value={expenseForm.date} onChange={handleFormChange} bg="gray.50" _focus={{ bg: "white", borderColor: "purple.400" }} />
                                        </InputGroup>
                                    </FormControl>
                                </SimpleGrid>
                                
                                <Box w="full" mt={4} bg="purple.50" p={5} borderRadius="xl" border="1px dashed" borderColor="purple.200">
                                    <Flex justify="space-between" align="center" mb={4}>
                                        <HStack><Icon as={FaMapMarkerAlt} color="purple.500" /><Heading size="xs" textTransform="uppercase" color="purple.700" letterSpacing="wider">Site Allocations & Files</Heading></HStack>
                                        <Button size="xs" colorScheme="purple" variant="solid" shadow="sm" leftIcon={<FaPlus />} onClick={addClientSite}>Add Site</Button>
                                    </Flex>
                                    <VStack spacing={5}>
                                        {activeSchedule && activeSchedule.ledger && (
                                            <Box w="full" px={4} py={2} bg="teal.50" borderRadius="md" border="1px solid" borderColor="teal.200">
                                                <Text fontSize="xs" color="teal.800" fontWeight="bold">
                                                    📅 Scheduled Ledger for selected date: <span style={{ textDecoration: 'underline' }}>{activeSchedule.ledger}</span>
                                                </Text>
                                            </Box>
                                        )}
                                        {clientSites.map((cs, idx) => (
                                            <VStack key={idx} w="full" bg="white" p={3} borderRadius="md" shadow="sm" align="stretch" borderLeft="4px solid" borderColor="purple.400">
                                                <HStack align="flex-end">
                                                    <FormControl size="sm">
                                                        <FormLabel fontSize="10px" fontWeight="bold">Client</FormLabel>
                                                        <ChakraSelect placeholder="Select Client" value={cs.clientId} onChange={e => updateClientSite(idx, 'clientId', e.target.value)} size="sm" variant="filled">
                                                            {(() => {
                                                                const scheduledClients = new Set();
                                                                employeeSchedules.forEach(s => {
                                                                    const c = s.client;
                                                                    if (c) {
                                                                        const cid = c?._id || c;
                                                                        if (cid) scheduledClients.add(String(cid));
                                                                    }
                                                                });
                                                                const baseClients = Array.from(new Set(sites.map(s => s?.client?._id || s?.client).filter(Boolean))).map(cId => {
                                                                    const cName = sites.find(s => (s.client?._id || s.client) === cId)?.client?.clientName || 'Client';
                                                                    return { _id: cId, clientName: cName };
                                                                });
                                                                const filtered = baseClients.filter(c => c && c._id && scheduledClients.has(String(c._id)));
                                                                return filtered.map(c => <option key={c._id} value={c._id}>{c.clientName}</option>);
                                                            })()}
                                                        </ChakraSelect>
                                                    </FormControl>
                                                    <FormControl size="sm">
                                                        <FormLabel fontSize="10px" fontWeight="bold">Site</FormLabel>
                                                        <ChakraSelect placeholder="Select Site" value={cs.siteId} onChange={e => updateClientSite(idx, 'siteId', e.target.value)} size="sm" variant="filled">
                                                            {(() => {
                                                                const scheduledSites = new Set();
                                                                employeeSchedules.forEach(s => {
                                                                    const site = s.site;
                                                                    if (site) {
                                                                        const sid = site?._id || site;
                                                                        if (sid) scheduledSites.add(String(sid));
                                                                    }
                                                                });
                                                                const baseSites = sites.filter(s => {
                                                                    const c = s.client;
                                                                    const cid = c?._id || c;
                                                                    return cid && cs.clientId && String(cid) === String(cs.clientId);
                                                                });
                                                                const filtered = baseSites.filter(s => s && s._id && scheduledSites.has(String(s._id)));
                                                                return filtered.map(s => (
                                                                    <option key={s._id} value={s._id}>{s.siteName}</option>
                                                                ));
                                                            })()}
                                                        </ChakraSelect>
                                                    </FormControl>
                                                    <FormControl size="sm">
                                                        <FormLabel fontSize="10px" fontWeight="bold">Ledger</FormLabel>
                                                        <ChakraSelect 
                                                            placeholder="Select Ledger" 
                                                            value={cs.ledger} 
                                                            onChange={e => updateClientSite(idx, 'ledger', e.target.value)} 
                                                            size="sm" 
                                                            variant="filled"
                                                        >
                                                            {(() => {
                                                                const options = new Set();
                                                                const matchingSchedules = employeeSchedules.filter(s => {
                                                                    const sSiteId = s.site?._id || s.site;
                                                                    return sSiteId === cs.siteId;
                                                                });
                                                                matchingSchedules.forEach(sch => {
                                                                    if (sch.ledger) options.add(sch.ledger);
                                                                });
                                                                if (options.size === 0) {
                                                                    const siteLedgerItems = sites.find(s => s._id === cs.siteId)?.ledgerItems || [];
                                                                    siteLedgerItems.forEach(item => {
                                                                        if (item.ledger) options.add(item.ledger);
                                                                    });
                                                                }
                                                                return Array.from(options).map(opt => {
                                                                    const isScheduled = matchingSchedules.some(sch => sch.ledger === opt);
                                                                    return (
                                                                        <option key={opt} value={opt}>
                                                                            {opt} {isScheduled ? '(Scheduled)' : ''}
                                                                        </option>
                                                                    );
                                                                });
                                                            })()}
                                                        </ChakraSelect>
                                                    </FormControl>
                                                    {(() => {
                                                        const ms = cs.scheduleId
                                                            ? employeeSchedules.find(s => s._id === cs.scheduleId)
                                                            : employeeSchedules.find(s => (s.site?._id || s.site) === cs.siteId);
                                                        return ms?.scheduleType === 'POINT MARKING' ? (
                                                            <FormControl size="sm" maxW="80px">
                                                                <FormLabel fontSize="10px" fontWeight="bold">Quantity</FormLabel>
                                                                <Input 
                                                                    type="number"
                                                                    min="0"
                                                                    value={cs.quantity || ''}
                                                                    onChange={e => updateClientSite(idx, 'quantity', Number(e.target.value) || 0)}
                                                                    size="sm"
                                                                    variant="filled"
                                                                    placeholder="Qty"
                                                                />
                                                            </FormControl>
                                                        ) : null;
                                                    })()}
                                                    {clientSites.length > 1 && <IconButton icon={<FaTrash />} size="sm" colorScheme="red" variant="ghost" onClick={() => removeClientSite(idx)} />}
                                                </HStack>
                                                
                                                {(() => {
                                                    const ms = cs.scheduleId
                                                        ? employeeSchedules.find(s => s._id === cs.scheduleId)
                                                        : employeeSchedules.find(s => (s.site?._id || s.site) === cs.siteId);
                                                    if (ms && ms.helpers && ms.helpers.length > 0) {
                                                        return (
                                                            <HStack mt={1} wrap="wrap" bg="pink.50" p={2} borderRadius="md" border="1px dashed" borderColor="pink.200">
                                                                <Icon as={FaUsers} color="pink.600" w={3} h={3} />
                                                                <Text fontSize="10px" fontWeight="bold" color="pink.700">Helpers Assigned:</Text>
                                                                {ms.helpers.map((h, i) => (
                                                                    <Badge key={i} colorScheme="pink" variant="solid" fontSize="10px" borderRadius="full" px={3} py={0.5} shadow="sm">
                                                                        {h.name || 'Helper'}
                                                                    </Badge>
                                                                ))}
                                                            </HStack>
                                                        );
                                                    }
                                                    return null;
                                                })()}

                                                {/* File Uploads per Site */}
                                                <SimpleGrid columns={4} spacing={2} pt={2}>
                                                    <VStack align="start" spacing={1}>
                                                        <Text fontSize="9px" fontWeight="black" color="blue.600">PHOTOS ({cs.files.photos.length})</Text>
                                                        <Input type="file" multiple accept="image/*" onChange={(e) => handleSiteFileChange(idx, e, 'photos')} size="xs" p={0} variant="unstyled" />
                                                    </VStack>
                                                    <VStack align="start" spacing={1}>
                                                        <Text fontSize="9px" fontWeight="black" color="orange.600">REPORTS ({cs.files.dailyReports.length})</Text>
                                                        <Input type="file" multiple accept=".pdf,.doc,.docx" onChange={(e) => handleSiteFileChange(idx, e, 'dailyReports')} size="xs" p={0} variant="unstyled" />
                                                    </VStack>
                                                    <VStack align="start" spacing={1}>
                                                        <Text fontSize="9px" fontWeight="black" color="purple.600">DATA ({cs.files.data.length})</Text>
                                                        <Input type="file" multiple accept=".xls,.xlsx,.pdf" onChange={(e) => handleSiteFileChange(idx, e, 'data')} size="xs" p={0} variant="unstyled" />
                                                    </VStack>
                                                    <VStack align="start" spacing={1}>
                                                        <Text fontSize="9px" fontWeight="black" color="teal.600">DRAWING ({cs.files.drawing?.length || 0})</Text>
                                                        <Input type="file" multiple accept=".pdf,.dwg,.dxf,image/*" onChange={(e) => handleSiteFileChange(idx, e, 'drawing')} size="xs" p={0} variant="unstyled" />
                                                    </VStack>
                                                </SimpleGrid>
                                            </VStack>
                                        ))}
                                    </VStack>
                                </Box>
                            </Box>

                            {/* Food & Travel Section */}
                            <Box w="full" bg="white" p={5} borderRadius="xl" shadow="sm" border="1px solid" borderColor="gray.100">
                                <Heading size="xs" textTransform="uppercase" color="blue.500" mb={4} letterSpacing="wider">Food & Fuel (₹)</Heading>
                                <SimpleGrid columns={2} spacing={5} w="full">
                                    <FormControl>
                                        <InputGroup size="sm">
                                            <InputLeftAddon bg="blue.50" color="blue.600"><Icon as={FaCoffee} mr={2} /> Breakfast</InputLeftAddon>
                                            <Input type="number" name="breakfast" value={expenseForm.breakfast} onChange={handleFormChange} placeholder="0" />
                                        </InputGroup>
                                    </FormControl>
                                    <FormControl>
                                        <InputGroup size="sm">
                                            <InputLeftAddon bg="blue.50" color="blue.600"><Icon as={FaHamburger} mr={2} /> Lunch</InputLeftAddon>
                                            <Input type="number" name="lunch" value={expenseForm.lunch} onChange={handleFormChange} placeholder="0" />
                                        </InputGroup>
                                    </FormControl>
                                    <FormControl>
                                        <InputGroup size="sm">
                                            <InputLeftAddon bg="blue.50" color="blue.600"><Icon as={FaUtensils} mr={2} /> Dinner</InputLeftAddon>
                                            <Input type="number" name="dinner" value={expenseForm.dinner} onChange={handleFormChange} placeholder="0" />
                                        </InputGroup>
                                    </FormControl>
                                    <FormControl>
                                        <HStack spacing={1}>
                                            <InputGroup size="sm">
                                                <InputLeftAddon bg="red.50" color="red.600"><Icon as={FaGasPump} mr={2} /> Fuel</InputLeftAddon>
                                                <Input type="number" name="petrol" value={expenseForm.petrol} onChange={handleFormChange} placeholder="0" />
                                            </InputGroup>
                                            <ChakraSelect 
                                                size="sm" 
                                                w="90px" 
                                                value={fuelType} 
                                                onChange={(e) => setFuelType(e.target.value)} 
                                                borderRadius="md" 
                                                bg="white"
                                            >
                                                <option value="Petrol">Petrol</option>
                                                <option value="CNG">CNG</option>
                                                <option value="Diesel">Diesel</option>
                                            </ChakraSelect>
                                        </HStack>
                                    </FormControl>
                                </SimpleGrid>
                            </Box>

                            {/* Dynamic Array Fields Start */}
                            <Box w="full" bg="gray.100" p={5} borderRadius="xl" border="1px dashed" borderColor="gray.300">
                                <Flex justify="space-between" align="center" mb={4}>
                                    <HStack><Icon as={FaStickyNote} color="gray.600" /><Heading size="xs" textTransform="uppercase" color="gray.700" letterSpacing="wider">Other Expenses</Heading></HStack>
                                    <Button size="xs" colorScheme="gray" variant="solid" shadow="sm" leftIcon={<FaPlus />} onClick={addOtherExpenseRow}>Add Row</Button>
                                </Flex>
                                <VStack spacing={3}>
                                    {otherExpenses.map((exp, idx) => (
                                        <HStack key={idx} w="full" bg="white" p={2} borderRadius="md" shadow="sm">
                                            <Input placeholder="Expense Name" value={exp.expenseName} onChange={e => updateOtherExpense(idx, 'expenseName', e.target.value)} size="sm" variant="filled" />
                                            <InputGroup size="sm" w="150px">
                                                <InputLeftElement><Icon as={FaRupeeSign} color="gray.400" size="xs" /></InputLeftElement>
                                                <Input placeholder="Amount" type="number" value={exp.amount} onChange={e => updateOtherExpense(idx, 'amount', e.target.value)} variant="filled" />
                                            </InputGroup>
                                            <IconButton icon={<FaTrash />} size="sm" colorScheme="red" variant="ghost" onClick={() => removeOtherExpense(idx)} />
                                        </HStack>
                                    ))}
                                    {otherExpenses.length === 0 && <Text fontSize="xs" color="gray.400" fontStyle="italic">No other expenses added yet.</Text>}
                                </VStack>
                            </Box>

                            <Box w="full" bg="orange.50" p={5} borderRadius="xl" border="1px dashed" borderColor="orange.200">
                                <Flex justify="space-between" align="center" mb={4}>
                                    <HStack><Icon as={FaMoneyBillWave} color="orange.500" /><Heading size="xs" textTransform="uppercase" color="orange.700" letterSpacing="wider">Money Given To Employee</Heading></HStack>
                                    <Button size="xs" colorScheme="orange" variant="solid" shadow="sm" leftIcon={<FaPlus />} onClick={addGivenToRow}>Add Row</Button>
                                </Flex>
                                <VStack spacing={3}>
                                    {givenTo.map((item, idx) => (
                                        <HStack key={idx} w="full" bg="white" p={2} borderRadius="md" shadow="sm">
                                            <ChakraSelect placeholder="Select Employee" value={item.employeeRef} onChange={e => updateGivenTo(idx, 'employeeRef', e.target.value)} size="sm" variant="filled">
                                                {employees.map(e => <option key={e._id} value={e._id}>{e.name}</option>)}
                                            </ChakraSelect>
                                            <InputGroup size="sm" w="150px">
                                                <InputLeftElement><Icon as={FaRupeeSign} color="gray.400" size="xs" /></InputLeftElement>
                                                <Input placeholder="Amount" type="number" value={item.amount} onChange={e => updateGivenTo(idx, 'amount', e.target.value)} variant="filled" />
                                            </InputGroup>
                                            <IconButton icon={<FaTrash />} size="sm" colorScheme="red" variant="ghost" onClick={() => removeGivenToRow(idx)} />
                                        </HStack>
                                    ))}
                                    {givenTo.length === 0 && <Text fontSize="xs" color="orange.300" fontStyle="italic">No advances given recorded.</Text>}
                                </VStack>
                            </Box>

                            <Box w="full" bg="teal.50" p={5} borderRadius="xl" border="1px dashed" borderColor="teal.200">
                                <Flex justify="space-between" align="center" mb={4}>
                                    <HStack><Icon as={FaMoneyBillWave} color="teal.500" /><Heading size="xs" textTransform="uppercase" color="teal.700" letterSpacing="wider">Money Received From Employee</Heading></HStack>
                                    <Button size="xs" colorScheme="teal" variant="solid" shadow="sm" leftIcon={<FaPlus />} onClick={addReceivedFromRow}>Add Row</Button>
                                </Flex>
                                <VStack spacing={3}>
                                    {receivedFrom.map((item, idx) => (
                                        <HStack key={idx} w="full" bg="white" p={2} borderRadius="md" shadow="sm">
                                            <ChakraSelect placeholder="Select Employee" value={item.employeeRef} onChange={e => updateReceivedFrom(idx, 'employeeRef', e.target.value)} size="sm" variant="filled">
                                                {employees.map(e => <option key={e._id} value={e._id}>{e.name}</option>)}
                                            </ChakraSelect>
                                            <InputGroup size="sm" w="150px">
                                                <InputLeftElement><Icon as={FaRupeeSign} color="gray.400" size="xs" /></InputLeftElement>
                                                <Input placeholder="Amount" type="number" value={item.amount} onChange={e => updateReceivedFrom(idx, 'amount', e.target.value)} variant="filled" />
                                            </InputGroup>
                                            <IconButton icon={<FaTrash />} size="sm" colorScheme="red" variant="ghost" onClick={() => removeReceivedFromRow(idx)} />
                                        </HStack>
                                    ))}
                                    {receivedFrom.length === 0 && <Text fontSize="xs" color="teal.300" fontStyle="italic">No money received recorded.</Text>}
                                </VStack>
                            </Box>
                            {/* Dynamic Array Fields End */}

                             {/* Live Summary Footer */}
                             <Box w="full" bg="blue.600" p={4} borderRadius="xl" shadow="inner" color="white" pos="relative">
                                {loading && <Center pos="absolute" inset={0} bg="blue.600" borderRadius="xl"><Spinner size="xs" /></Center>}
                                <HStack justify="space-between">
                                    <VStack align="start" spacing={0}>
                                        <Text fontSize="9px" opacity={0.8} fontWeight="bold">CURRENT: ₹{employeeDetails?.totalAmount?.toLocaleString() || 0}</Text>
                                        <HStack spacing={1}>
                                            <Icon as={FaRupeeSign} />
                                            <Heading size="md">{totals.total.toLocaleString()}</Heading>
                                        </HStack>
                                        <Text fontSize="9px" opacity={0.8} fontWeight="bold" color={totals.remaining < 0 ? "red.200" : "green.200"}>
                                            REMAINS: ₹{totals.remaining.toLocaleString()}
                                        </Text>
                                    </VStack>
                                    <HStack spacing={4} fontSize="xs" opacity={0.9}>
                                        <Text>Std: ₹{totals.stdTotal}</Text>
                                        <Text>Other: ₹{totals.otherTotal}</Text>
                                    </HStack>
                                </HStack>
                            </Box>

                            <FormControl bg="gray.100" p={4} borderRadius="xl">
                                <FormLabel fontWeight="bold" fontSize="sm" color="gray.700"><Icon as={FaStickyNote} mr={2} color="gray.500"/>Notes</FormLabel>
                                <Input name="notes" value={expenseForm.notes} onChange={handleFormChange} placeholder="Type any specific details or context here..." bg="white" _focus={{ borderColor: "purple.400" }} />
                            </FormControl>
                        </VStack>
                    </ModalBody>
                    <ModalFooter bg="white" borderBottomRadius="2xl" shadow="md">
                        <Button variant="ghost" mr={3} onClick={onClose} borderRadius="xl">Cancel</Button>
                        <Button colorScheme="purple" onClick={handleAddExpense} isLoading={submitting} borderRadius="xl" shadow="md" px={8} leftIcon={<FaClipboardCheck />}>Save Record</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {groupedByDate.length === 0 ? (
                <Center p={10}><Text color="gray.500">No records found for this period.</Text></Center>
            ) : reportType === 'Ledger' ? (
                <TableContainer border="1px" borderColor="gray.300" borderRadius="md" overflowX="auto">
                <Table size="sm" variant="simple" sx={{ borderCollapse: 'collapse', 'th, td': { border: '1px solid black' } }}>
                    <Thead bg="gray.100">
                        <Tr>
                            <Th textAlign="center" border="1px solid black" fontSize="xs">SR. NO.</Th>
                            <Th textAlign="center" border="1px solid black" fontSize="xs">DATE</Th>
                            <Th border="1px solid black" fontSize="xs">DESCRIPTION</Th>
                            <Th textAlign="center" border="1px solid black" fontSize="xs">CREDIT</Th>
                            <Th textAlign="center" border="1px solid black" fontSize="xs">DEBIT</Th>
                            <Th textAlign="center" border="1px solid black" fontSize="xs">TOTAL</Th>
                            <Th textAlign="center" border="1px solid black" fontSize="xs">ATENDES</Th>
                            <Th border="1px solid black" fontSize="xs">REMARK</Th>
                            <Th border="1px solid black" fontSize="xs">SIDE WORK</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {groupedByDate.map((group, groupIdx) => {
                            const dateStr = new Date(group.dateKey).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
                            const exp = group.expense;

                            // Attendance info (from expense record if exists)
                            const attendance = exp
                                ? (exp.attendance === 'Present' ? 'P' : exp.attendance === 'Half Day' ? 'HD' : 'A')
                                : '-';
                            const attColor = attendance === 'P' ? 'green.400' : attendance === 'HD' ? 'orange.400' : attendance === 'A' ? 'red.400' : 'gray.400';
                            const attRemark = exp?.attendanceRemark || '-';
                            const sideWork = exp?.clientSites?.map(cs => {
                                const siteName = cs.siteId?.siteName || '';
                                const ledgerPart = cs.ledger ? ` [${cs.ledger.toUpperCase()}]` : '';
                                return `${siteName}${ledgerPart}`;
                            }).filter(Boolean) || [];

                            // Build combined line items for this date
                            const allItems = [];
                            let totalCr = 0;
                            let totalDr = 0;
                            const sites = exp?.clientSites && exp.clientSites.length > 0 ? exp.clientSites : [null];
                            const n = sites.length;

                            // 1. Credits from expense receivedFrom
                            if (exp?.creditDebit?.receivedFrom) {
                                exp.creditDebit.receivedFrom.forEach(r => {
                                    const rAmount = Number(r.amount) || 0;
                                    totalCr += rAmount;
                                    sites.forEach(cs => {
                                        const siteSuffix = cs?.siteId?.siteName ? ` (${cs.siteId.siteName.toUpperCase()})` : '';
                                        const allocatedCr = rAmount / n;
                                        allItems.push({
                                            desc: `RECEIVED FROM ${r.employeeRef?.name?.toUpperCase() || 'EMPLOYEE'}${siteSuffix}`,
                                            cr: allocatedCr ? Number(allocatedCr.toFixed(2)) : 0,
                                            dr: 0,
                                            type: 'transfer-in'
                                        });
                                    });
                                });
                            }

                            // Helper for standard debits
                            const pushDebitItem = (baseDesc, amount, itemFiles) => {
                                const numVal = Number(amount) || 0;
                                if (!numVal) return;
                                totalDr += numVal;
                                sites.forEach(cs => {
                                    const siteSuffix = cs?.siteId?.siteName ? ` (${cs.siteId.siteName.toUpperCase()})` : '';
                                    const allocatedDr = numVal / n;
                                    allItems.push({
                                        desc: `${baseDesc}${siteSuffix}`,
                                        cr: 0,
                                        dr: allocatedDr ? Number(allocatedDr.toFixed(2)) : 0,
                                        type: 'expense',
                                        files: itemFiles
                                    });
                                });
                            };

                            // 2. Standard expense debits
                            const fixed = exp?.expenses || {};
                            const files = exp?.expenseFiles || {};
                            pushDebitItem('BREAK FAST', fixed.breakfast, files.breakfast);
                            pushDebitItem('LUNCH', fixed.lunch, files.lunch);
                            pushDebitItem('DINNER', fixed.dinner, files.dinner);
                            pushDebitItem('PETROL', fixed.petrol, files.petrol);

                            // 3. Other expenses
                            exp?.otherExpensesList?.forEach(o => {
                                pushDebitItem(o.expenseName.toUpperCase(), o.amount, o.files);
                            });

                            // 4. Debits from expense givenTo
                            if (exp?.creditDebit?.givenTo) {
                                exp.creditDebit.givenTo.forEach(g => {
                                    const gAmount = Number(g.amount) || 0;
                                    totalDr += gAmount;
                                    sites.forEach(cs => {
                                        const siteSuffix = cs?.siteId?.siteName ? ` (${cs.siteId.siteName.toUpperCase()})` : '';
                                        const allocatedDr = gAmount / n;
                                        allItems.push({
                                            desc: `GIVEN TO ${g.employeeRef?.name?.toUpperCase() || 'EMPLOYEE'}${siteSuffix}`,
                                            cr: 0,
                                            dr: allocatedDr ? Number(allocatedDr.toFixed(2)) : 0,
                                            type: 'transfer-out'
                                        });
                                    });
                                });
                            }

                            // 5. Transfer records (from EmployeeTransfer collection)
                            group.transfers.forEach(t => {
                                const isGiver = (t.giver?._id || t.giver) === employeeId;
                                const otherPerson = isGiver ? (t.taker?.name || 'Employee') : (t.giver?.name || 'Employee');
                                if (isGiver) {
                                    allItems.push({ desc: `Given To → ${otherPerson}`, cr: 0, dr: Number(t.amount), type: 'transfer-out', note: t.notes });
                                    totalDr += Number(t.amount);
                                } else {
                                    allItems.push({ desc: `← Received From ${otherPerson}`, cr: Number(t.amount), dr: 0, type: 'transfer-in', note: t.notes });
                                    totalCr += Number(t.amount);
                                }
                            });

                            if (allItems.length === 0) allItems.push({ desc: '-', cr: 0, dr: 0, type: 'expense' });

                            const totalSpan = allItems.length + 3; // items + CR + DR + NET

                            return (
                                <React.Fragment key={group.dateKey}>
                                    {allItems.map((item, itemIdx) => (
                                        <Tr key={`${group.dateKey}-${itemIdx}`}
                                            bg={item.type === 'transfer-out' ? 'orange.50' : item.type === 'transfer-in' ? 'teal.50' : 'white'}
                                        >
                                            {itemIdx === 0 && (
                                                <>
                                                    <Td rowSpan={totalSpan} textAlign="center" fontWeight="bold">{groupIdx + 1}</Td>
                                                    <Td rowSpan={totalSpan} textAlign="center">{dateStr}</Td>
                                                </>
                                            )}

                                            <Td fontSize="xs" fontWeight={item.type !== 'expense' ? 'bold' : '500'}
                                                color={item.type === 'transfer-out' ? 'orange.700' : item.type === 'transfer-in' ? 'teal.700' : 'gray.800'}
                                            >
                                                <HStack spacing={2}>
                                                    <Text>{item.desc}</Text>
                                                    {item.files && item.files.length > 0 && (
                                                        <HStack spacing={1}>
                                                            {item.files.map((f, i) => (
                                                                <a key={i} href={`${API_BASE_URL}${f.url}`} target="_blank" rel="noreferrer" title={f.name}>
                                                                    <Icon as={FaPaperclip} color="blue.500" w={3} h={3} _hover={{ color: "blue.700" }} cursor="pointer" />
                                                                </a>
                                                            ))}
                                                        </HStack>
                                                    )}
                                                </HStack>
                                                {item.note && <Text fontSize="9px" color="gray.400" fontWeight="normal" mt={1}>({item.note})</Text>}
                                            </Td>
                                            <Td textAlign="center" color="teal.700" fontWeight={item.cr ? 'bold' : 'normal'}>{item.cr || ''}</Td>
                                            <Td textAlign="center" color={item.type === 'transfer-out' ? 'orange.700' : 'red.700'} fontWeight={item.dr ? 'bold' : 'normal'}>{item.dr || ''}</Td>

                                            {itemIdx === 0 && <Td rowSpan={allItems.length} border="0px"></Td>}

                                            {itemIdx === 0 && (
                                                <>
                                                    <Td rowSpan={totalSpan} textAlign="center">
                                                        <Box as="span" bg={attColor} color="white" px={3} py={1} display="inline-block" fontWeight="bold" fontSize="xs">
                                                            {attendance}
                                                        </Box>
                                                    </Td>
                                                    <Td rowSpan={totalSpan} textAlign="center" fontSize="xs" color="red.600" fontWeight="bold">
                                                        {attRemark}
                                                    </Td>
                                                    <Td rowSpan={totalSpan} verticalAlign="top" fontSize="xs">
                                                        <VStack align="start" spacing={1}>
                                                            {exp?.clientSites?.map((cs, i) => {
                                                                const siteName = cs.siteId?.siteName || cs.siteName || 'Unknown Site';
                                                                const ledgerText = cs.ledger ? ` [${cs.ledger.toUpperCase()}]` : '';
                                                                const qtyText = cs.quantity ? ` (Qty: ${cs.quantity})` : '';
                                                                return (
                                                                    <Text key={i} fontWeight="semibold" color="gray.700">
                                                                        {i+1}. {siteName.toUpperCase()}{ledgerText}{qtyText}
                                                                    </Text>
                                                                );
                                                            })}
                                                            {(!exp?.clientSites || exp.clientSites.length === 0) && <Text>-</Text>}
                                                        </VStack>
                                                    </Td>
                                                </>
                                            )}
                                        </Tr>
                                    ))}

                                    <Tr bg="green.50">
                                        <Td></Td>
                                        <Td textAlign="center" bg="gray.100" fontWeight="bold" fontSize="xs">CR</Td>
                                        <Td></Td>
                                        <Td textAlign="center" bg="#00b050" color="white" fontWeight="bold">{totalCr || 0}</Td>
                                    </Tr>
                                    <Tr bg="red.50">
                                        <Td></Td>
                                        <Td textAlign="center" bg="gray.100" fontWeight="bold" fontSize="xs">DR</Td>
                                        <Td></Td>
                                        <Td textAlign="center" bg="#ff0000" color="white" fontWeight="bold">{totalDr || 0}</Td>
                                    </Tr>
                                    <Tr bg="blue.50">
                                        <Td></Td>
                                        <Td textAlign="center" fontWeight="bold" fontSize="xs">NET</Td>
                                        <Td></Td>
                                        <Td textAlign="center" bg="#00b0f0" color="white" fontWeight="bold">{totalCr - totalDr}</Td>
                                    </Tr>
                                    {/* Bold separator row between date groups */}
                                    {groupIdx < groupedByDate.length - 1 && (
                                        <Tr>
                                            <Td colSpan={9} p={0} borderTop="3px solid" borderColor="gray.700" bg="gray.700" height="3px"></Td>
                                        </Tr>
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </Tbody>
                </Table>
            </TableContainer>
            ) : reportType === 'Food' ? (
                <TableContainer border="1px" borderColor="gray.300" borderRadius="md" bg="white" overflowX="auto">
                    <Table size="sm" variant="simple" sx={{ borderCollapse: 'collapse', 'th, td': { border: '1px solid #CBD5E0' } }}>
                        <Thead bg="blue.50">
                            <Tr>
                                <Th textAlign="center" color="blue.900" fontSize="xs" fontWeight="bold">SR. NO.</Th>
                                <Th textAlign="center" color="blue.900" fontSize="xs" fontWeight="bold">DATE</Th>
                                <Th color="blue.900" fontSize="xs" fontWeight="bold">EMPLOYEE NAME</Th>
                                <Th textAlign="center" color="blue.900" fontSize="xs" fontWeight="bold">BREAKFAST</Th>
                                <Th textAlign="center" color="blue.900" fontSize="xs" fontWeight="bold">LUNCH</Th>
                                <Th textAlign="center" color="blue.900" fontSize="xs" fontWeight="bold">DINNER</Th>
                                <Th textAlign="center" color="blue.900" fontSize="xs" fontWeight="bold">TOTAL FOOD</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {(() => {
                                const dateCounts = {};
                                groupedByDate.forEach(g => {
                                    dateCounts[g.dateKey] = (dateCounts[g.dateKey] || 0) + 1;
                                });

                                let currentSrNo = 0;
                                let lastDateKey = null;

                                return groupedByDate.map((group, groupIdx) => {
                                    const dateStr = new Date(group.dateKey).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
                                    
                                    let isFirstOfDate = false;
                                    if (group.dateKey !== lastDateKey) {
                                        currentSrNo++;
                                        lastDateKey = group.dateKey;
                                        isFirstOfDate = true;
                                    }

                                    const span = dateCounts[group.dateKey];

                                    const exp = group.expense;
                                    const actualEmployeeName = exp?.employeeId?.name || employeeName;
                                    const breakfast = exp?.expenses?.breakfast || 0;
                                    const lunch = exp?.expenses?.lunch || 0;
                                    const dinner = exp?.expenses?.dinner || 0;
                                    const totalFood = Number(breakfast) + Number(lunch) + Number(dinner);

                                    return (
                                        <Tr key={groupIdx} _hover={{ bg: "gray.50" }}>
                                            {isFirstOfDate && (
                                                <Td rowSpan={span} textAlign="center" fontWeight="bold" color="gray.600" fontSize="md" verticalAlign="middle" bg="gray.50">{currentSrNo}</Td>
                                            )}
                                            {isFirstOfDate && (
                                                <Td rowSpan={span} textAlign="center" fontWeight="bold" color="blue.700" fontSize="md" verticalAlign="middle" bg="blue.50">{dateStr}</Td>
                                            )}
                                            <Td fontWeight="bold" color="gray.700" fontSize="sm">{actualEmployeeName}</Td>
                                            <Td textAlign="center" fontSize="sm" color="gray.700">₹{breakfast}</Td>
                                            <Td textAlign="center" fontSize="sm" color="gray.700">₹{lunch}</Td>
                                            <Td textAlign="center" fontSize="sm" color="gray.700">₹{dinner}</Td>
                                            <Td textAlign="center" fontWeight="bold" color="green.600" fontSize="sm">₹{totalFood}</Td>
                                        </Tr>
                                    );
                                });
                            })()}
                            <Tr bg="gray.100">
                                <Td colSpan={3} textAlign="right" fontWeight="bold" fontSize="md">GRAND TOTAL:</Td>
                                <Td textAlign="center" fontWeight="bold" fontSize="md">
                                    ₹{groupedByDate.reduce((sum, g) => sum + Number(g.expense?.expenses?.breakfast || 0), 0)}
                                </Td>
                                <Td textAlign="center" fontWeight="bold" fontSize="md">
                                    ₹{groupedByDate.reduce((sum, g) => sum + Number(g.expense?.expenses?.lunch || 0), 0)}
                                </Td>
                                <Td textAlign="center" fontWeight="bold" fontSize="md">
                                    ₹{groupedByDate.reduce((sum, g) => sum + Number(g.expense?.expenses?.dinner || 0), 0)}
                                </Td>
                                <Td textAlign="center" fontWeight="bold" fontSize="md" color="green.700">
                                    ₹{groupedByDate.reduce((sum, g) => sum + Number(g.expense?.expenses?.breakfast || 0) + Number(g.expense?.expenses?.lunch || 0) + Number(g.expense?.expenses?.dinner || 0), 0)}
                                </Td>
                            </Tr>
                        </Tbody>
                    </Table>
                </TableContainer>
            ) : reportType === 'Fuel' ? (
                <TableContainer border="1px" borderColor="gray.300" borderRadius="md" bg="white" overflowX="auto">
                    <Table size="sm" variant="simple" sx={{ borderCollapse: 'collapse', 'th, td': { border: '1px solid #CBD5E0' } }}>
                        <Thead bg="red.50">
                            <Tr>
                                <Th textAlign="center" color="red.900" fontSize="xs" fontWeight="bold">SR. NO.</Th>
                                <Th color="red.900" fontSize="xs" fontWeight="bold">EMPLOYEE NAME</Th>
                                <Th textAlign="center" color="red.900" fontSize="xs" fontWeight="bold">PETROL</Th>
                                <Th textAlign="center" color="red.900" fontSize="xs" fontWeight="bold">CNG</Th>
                                <Th textAlign="center" color="red.900" fontSize="xs" fontWeight="bold">DIESEL</Th>
                                <Th textAlign="center" color="red.900" fontSize="xs" fontWeight="bold">TOTAL</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {(() => {
                                const employeeAgg = {};
                                
                                groupedByDate.forEach(g => {
                                    const exp = g.expense;
                                    const empName = exp?.employeeId?.name || employeeName || 'Unknown Employee';
                                    
                                    if (!employeeAgg[empName]) {
                                        employeeAgg[empName] = { petrol: 0, cng: 0, diesel: 0, other: 0 };
                                    }
                                    
                                    // Check standard petrol field
                                    const stdPetrol = Number(exp?.expenses?.petrol) || 0;
                                    employeeAgg[empName].petrol += stdPetrol;
                                    
                                    // Check otherExpensesList for any mention of fuels
                                    if (exp?.otherExpensesList && exp.otherExpensesList.length > 0) {
                                        exp.otherExpensesList.forEach(other => {
                                            const name = (other.expenseName || '').toLowerCase().trim();
                                            const amount = Number(other.amount) || 0;
                                            
                                            if (amount > 0 && (name.includes('petrol') || name === 'cng' || name.includes('cng') || name.includes('diesel') || name.includes('fuel'))) {
                                                if (name.includes('petrol')) employeeAgg[empName].petrol += amount;
                                                else if (name.includes('cng') || name === 'cng') employeeAgg[empName].cng += amount;
                                                else if (name.includes('diesel')) employeeAgg[empName].diesel += amount;
                                                else employeeAgg[empName].other += amount;
                                            }
                                        });
                                    }
                                });

                                // Convert object to array and filter out employees with 0 total fuel (if fuelFilter applied, maybe filter further?)
                                let aggArray = Object.keys(employeeAgg).map(name => ({
                                    name,
                                    ...employeeAgg[name],
                                    total: employeeAgg[name].petrol + employeeAgg[name].cng + employeeAgg[name].diesel + employeeAgg[name].other
                                })).filter(emp => emp.total > 0);

                                if (fuelFilter !== 'ALL') {
                                    // If a specific filter is selected, we might want to only show employees who spent on that specific fuel
                                    aggArray = aggArray.filter(emp => {
                                        if (fuelFilter === 'Petrol') return emp.petrol > 0;
                                        if (fuelFilter === 'CNG') return emp.cng > 0;
                                        if (fuelFilter === 'Diesel') return emp.diesel > 0;
                                        return true;
                                    });
                                }

                                if (aggArray.length === 0) {
                                    return (
                                        <Tr>
                                            <Td colSpan={6} textAlign="center" py={8} color="gray.500" fontStyle="italic">
                                                No fuel records found for {fuelFilter === 'ALL' ? 'this period' : fuelFilter}.
                                            </Td>
                                        </Tr>
                                    );
                                }

                                let currentSrNo = 0;
                                return aggArray.map((emp, idx) => {
                                    currentSrNo++;
                                    return (
                                        <Tr key={idx} _hover={{ bg: "gray.50" }}>
                                            <Td textAlign="center" fontWeight="bold" color="gray.600" fontSize="md" bg="gray.50">{currentSrNo}</Td>
                                            <Td fontWeight="bold" color="gray.700" fontSize="sm">{emp.name}</Td>
                                            <Td textAlign="center" fontSize="sm" color="gray.700">₹{emp.petrol}</Td>
                                            <Td textAlign="center" fontSize="sm" color="gray.700">₹{emp.cng}</Td>
                                            <Td textAlign="center" fontSize="sm" color="gray.700">₹{emp.diesel}</Td>
                                            <Td textAlign="center" fontWeight="bold" color="red.600" fontSize="sm">₹{emp.total}</Td>
                                        </Tr>
                                    );
                                });
                            })()}
                            <Tr bg="gray.100">
                                <Td colSpan={2} textAlign="right" fontWeight="bold" fontSize="md">GRAND TOTAL:</Td>
                                <Td textAlign="center" fontWeight="bold" fontSize="md">
                                    ₹{(() => {
                                        let sum = 0;
                                        groupedByDate.forEach(g => {
                                            const exp = g.expense;
                                            sum += Number(exp?.expenses?.petrol) || 0;
                                            if (exp?.otherExpensesList) {
                                                exp.otherExpensesList.forEach(other => {
                                                    const name = (other.expenseName || '').toLowerCase().trim();
                                                    if (name.includes('petrol')) sum += (Number(other.amount) || 0);
                                                });
                                            }
                                        });
                                        return sum;
                                    })()}
                                </Td>
                                <Td textAlign="center" fontWeight="bold" fontSize="md">
                                    ₹{(() => {
                                        let sum = 0;
                                        groupedByDate.forEach(g => {
                                            const exp = g.expense;
                                            if (exp?.otherExpensesList) {
                                                exp.otherExpensesList.forEach(other => {
                                                    const name = (other.expenseName || '').toLowerCase().trim();
                                                    if (name.includes('cng') || name === 'cng') sum += (Number(other.amount) || 0);
                                                });
                                            }
                                        });
                                        return sum;
                                    })()}
                                </Td>
                                <Td textAlign="center" fontWeight="bold" fontSize="md">
                                    ₹{(() => {
                                        let sum = 0;
                                        groupedByDate.forEach(g => {
                                            const exp = g.expense;
                                            if (exp?.otherExpensesList) {
                                                exp.otherExpensesList.forEach(other => {
                                                    const name = (other.expenseName || '').toLowerCase().trim();
                                                    if (name.includes('diesel')) sum += (Number(other.amount) || 0);
                                                });
                                            }
                                        });
                                        return sum;
                                    })()}
                                </Td>
                                <Td textAlign="center" fontWeight="bold" fontSize="md" color="red.700">
                                    ₹{(() => {
                                        let sum = 0;
                                        groupedByDate.forEach(g => {
                                            const exp = g.expense;
                                            const stdPetrol = Number(exp?.expenses?.petrol) || 0;
                                            sum += stdPetrol;
                                            if (exp?.otherExpensesList && exp.otherExpensesList.length > 0) {
                                                exp.otherExpensesList.forEach(other => {
                                                    const name = (other.expenseName || '').toLowerCase().trim();
                                                    const amount = Number(other.amount) || 0;
                                                    if (amount > 0 && (name.includes('petrol') || name === 'cng' || name.includes('cng') || name.includes('diesel') || name.includes('fuel'))) {
                                                        sum += amount;
                                                    }
                                                });
                                            }
                                        });
                                        return sum;
                                    })()}
                                </Td>
                            </Tr>
                        </Tbody>
                    </Table>
                </TableContainer>
            ) : reportType === 'ClientSite' ? (
                <TableContainer border="1px" borderColor="gray.300" borderRadius="md" bg="white" overflowX="auto">
                    <Table size="sm" variant="simple" sx={{ borderCollapse: 'collapse', 'th, td': { border: '1px solid #CBD5E0' } }}>
                        <Thead bg="purple.50">
                            <Tr>
                                <Th textAlign="center" color="purple.900" fontSize="xs" fontWeight="bold" whiteSpace="nowrap">SR. NO.</Th>
                                <Th color="purple.900" fontSize="xs" fontWeight="bold">CLIENT NAME</Th>
                                <Th color="purple.900" fontSize="xs" fontWeight="bold">SITE NAME</Th>
                                <Th textAlign="center" color="purple.900" fontSize="xs" fontWeight="bold" whiteSpace="nowrap">BREAKFAST</Th>
                                <Th textAlign="center" color="purple.900" fontSize="xs" fontWeight="bold" whiteSpace="nowrap">LUNCH</Th>
                                <Th textAlign="center" color="purple.900" fontSize="xs" fontWeight="bold" whiteSpace="nowrap">DINNER</Th>
                                <Th textAlign="center" color="purple.900" fontSize="xs" fontWeight="bold" whiteSpace="nowrap">FUEL</Th>
                                <Th textAlign="center" color="purple.900" fontSize="xs" fontWeight="bold" whiteSpace="nowrap">OTHER EXP.</Th>
                                <Th textAlign="center" color="purple.900" fontSize="xs" fontWeight="bold" whiteSpace="nowrap">TOTAL</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {(() => {
                                const siteAgg = {};
                                
                                groupedByDate.forEach(g => {
                                    const exp = g.expense;
                                    if (!exp) return;
                                    
                                    const sitesToProcess = exp.clientSites && exp.clientSites.length > 0 
                                        ? exp.clientSites 
                                        : [null];
                                        
                                    const n = sitesToProcess.length;
                                    
                                    sitesToProcess.forEach(cs => {
                                        const cName = cs?.clientId?.clientName || 'Unspecified Client';
                                        const sName = cs?.siteId?.siteName || 'Unspecified Site';
                                        const key = `${cName}_${sName}`;
                                        
                                        if (!siteAgg[key]) {
                                            siteAgg[key] = { clientName: cName, siteName: sName, breakfast: 0, lunch: 0, dinner: 0, fuel: 0, other: 0 };
                                        }
                                        
                                        siteAgg[key].breakfast += (Number(exp.expenses?.breakfast) || 0) / n;
                                        siteAgg[key].lunch += (Number(exp.expenses?.lunch) || 0) / n;
                                        siteAgg[key].dinner += (Number(exp.expenses?.dinner) || 0) / n;
                                        siteAgg[key].fuel += (Number(exp.expenses?.petrol) || 0) / n;
                                        
                                        if (exp.otherExpensesList && exp.otherExpensesList.length > 0) {
                                            exp.otherExpensesList.forEach(other => {
                                                const name = (other.expenseName || '').toLowerCase().trim();
                                                const amount = Number(other.amount) || 0;
                                                
                                                if (amount > 0) {
                                                    const fraction = amount / n;
                                                    if (name.includes('petrol') || name === 'cng' || name.includes('cng') || name.includes('diesel') || name.includes('fuel')) {
                                                        siteAgg[key].fuel += fraction;
                                                    } else {
                                                        siteAgg[key].other += fraction;
                                                    }
                                                }
                                            });
                                        }
                                    });
                                });

                                const aggArray = Object.values(siteAgg).map(s => ({
                                    ...s,
                                    total: s.breakfast + s.lunch + s.dinner + s.fuel + s.other
                                })).filter(s => s.total > 0)
                                .sort((a, b) => {
                                    const clientCmp = a.clientName.localeCompare(b.clientName);
                                    if (clientCmp !== 0) return clientCmp;
                                    return a.siteName.localeCompare(b.siteName);
                                });

                                if (aggArray.length === 0) {
                                    return (
                                        <Tr>
                                            <Td colSpan={9} textAlign="center" py={8} color="gray.500" fontStyle="italic">
                                                No expenses found for this period.
                                            </Td>
                                        </Tr>
                                    );
                                }

                                let currentSrNo = 0;
                                return aggArray.map((site, idx) => {
                                    currentSrNo++;
                                    return (
                                        <Tr key={idx} _hover={{ bg: "gray.50" }}>
                                            <Td textAlign="center" fontWeight="bold" color="gray.600" fontSize="md" bg="gray.50" whiteSpace="nowrap">{currentSrNo}</Td>
                                            <Td fontWeight="bold" color="gray.700" fontSize="sm" maxW="250px" whiteSpace="normal" wordBreak="break-word">{site.clientName}</Td>
                                            <Td fontWeight="bold" color="gray.700" fontSize="sm" maxW="200px" whiteSpace="normal" wordBreak="break-word">{site.siteName}</Td>
                                            <Td textAlign="center" fontSize="sm" color="gray.700" whiteSpace="nowrap">₹{site.breakfast}</Td>
                                            <Td textAlign="center" fontSize="sm" color="gray.700" whiteSpace="nowrap">₹{site.lunch}</Td>
                                            <Td textAlign="center" fontSize="sm" color="gray.700" whiteSpace="nowrap">₹{site.dinner}</Td>
                                            <Td textAlign="center" fontSize="sm" color="gray.700" whiteSpace="nowrap">₹{site.fuel}</Td>
                                            <Td textAlign="center" fontSize="sm" color="gray.700" whiteSpace="nowrap">₹{site.other}</Td>
                                            <Td textAlign="center" fontWeight="bold" color="purple.600" fontSize="sm" whiteSpace="nowrap">₹{site.total}</Td>
                                        </Tr>
                                    );
                                });
                            })()}
                            <Tr bg="gray.100">
                                <Td colSpan={3} textAlign="right" fontWeight="bold" fontSize="md" whiteSpace="nowrap">GRAND TOTAL:</Td>
                                <Td textAlign="center" fontWeight="bold" fontSize="md" whiteSpace="nowrap">
                                    ₹{groupedByDate.reduce((sum, g) => sum + (Number(g.expense?.expenses?.breakfast) || 0), 0)}
                                </Td>
                                <Td textAlign="center" fontWeight="bold" fontSize="md" whiteSpace="nowrap">
                                    ₹{groupedByDate.reduce((sum, g) => sum + (Number(g.expense?.expenses?.lunch) || 0), 0)}
                                </Td>
                                <Td textAlign="center" fontWeight="bold" fontSize="md" whiteSpace="nowrap">
                                    ₹{groupedByDate.reduce((sum, g) => sum + (Number(g.expense?.expenses?.dinner) || 0), 0)}
                                </Td>
                                <Td textAlign="center" fontWeight="bold" fontSize="md" whiteSpace="nowrap">
                                    ₹{(() => {
                                        let sum = 0;
                                        groupedByDate.forEach(g => {
                                            const exp = g.expense;
                                            if (!exp) return;
                                            sum += Number(exp.expenses?.petrol) || 0;
                                            if (exp.otherExpensesList) {
                                                exp.otherExpensesList.forEach(other => {
                                                    const name = (other.expenseName || '').toLowerCase().trim();
                                                    const amount = Number(other.amount) || 0;
                                                    if (amount > 0) {
                                                        if (name.includes('petrol') || name === 'cng' || name.includes('cng') || name.includes('diesel') || name.includes('fuel')) {
                                                            sum += amount;
                                                        }
                                                    }
                                                });
                                            }
                                        });
                                        return sum;
                                    })()}
                                </Td>
                                <Td textAlign="center" fontWeight="bold" fontSize="md" whiteSpace="nowrap">
                                    ₹{(() => {
                                        let sum = 0;
                                        groupedByDate.forEach(g => {
                                            const exp = g.expense;
                                            if (!exp) return;
                                            if (exp.otherExpensesList) {
                                                exp.otherExpensesList.forEach(other => {
                                                    const name = (other.expenseName || '').toLowerCase().trim();
                                                    const amount = Number(other.amount) || 0;
                                                    if (amount > 0) {
                                                        if (!(name.includes('petrol') || name === 'cng' || name.includes('cng') || name.includes('diesel') || name.includes('fuel'))) {
                                                            sum += amount;
                                                        }
                                                    }
                                                });
                                            }
                                        });
                                        return sum;
                                    })()}
                                </Td>
                                <Td textAlign="center" fontWeight="bold" fontSize="md" color="purple.700" whiteSpace="nowrap">
                                    ₹{(() => {
                                        let sum = 0;
                                        groupedByDate.forEach(g => {
                                            const exp = g.expense;
                                            if (!exp) return;
                                            sum += (Number(exp.expenses?.breakfast) || 0) + (Number(exp.expenses?.lunch) || 0) + (Number(exp.expenses?.dinner) || 0) + (Number(exp.expenses?.petrol) || 0);
                                            if (exp.otherExpensesList) {
                                                exp.otherExpensesList.forEach(other => {
                                                    sum += Number(other.amount) || 0;
                                                });
                                            }
                                        });
                                        return sum;
                                    })()}
                                </Td>
                            </Tr>
                        </Tbody>
                    </Table>
                </TableContainer>
            ) : reportType === 'EmployeeSiteLedger' ? (() => {
                const rows = [];
                groupedByDate.forEach(g => {
                    const dateStr = new Date(g.dateKey).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
                    
                    if (g.expense) {
                        const exp = g.expense;
                        const sitesToProcess = exp.clientSites && exp.clientSites.length > 0 ? exp.clientSites : [null];
                        const n = sitesToProcess.length;
                        
                        let dayCredit = 0;
                        if (exp.creditDebit?.receivedFrom) {
                            exp.creditDebit.receivedFrom.forEach(r => dayCredit += (Number(r.amount) || 0));
                        }
                        if (g.transfers && g.transfers.length > 0) {
                            g.transfers.forEach(t => {
                                const isTaker = (t.taker?._id || t.taker) === employeeId;
                                if (isTaker) dayCredit += (Number(t.amount) || 0);
                            });
                        }

                        let dayDebit = 0;
                        const fixed = exp.expenses || {};
                        dayDebit += (Number(fixed.breakfast) || 0) + (Number(fixed.lunch) || 0) + (Number(fixed.dinner) || 0) + (Number(fixed.petrol) || 0);
                        if (exp.otherExpensesList) {
                            exp.otherExpensesList.forEach(o => dayDebit += (Number(o.amount) || 0));
                        }
                        if (exp.creditDebit?.givenTo) {
                            exp.creditDebit.givenTo.forEach(gOut => dayDebit += (Number(gOut.amount) || 0));
                        }
                        if (g.transfers && g.transfers.length > 0) {
                            g.transfers.forEach(t => {
                                const isGiver = (t.giver?._id || t.giver) === employeeId;
                                if (isGiver) dayDebit += (Number(t.amount) || 0);
                            });
                        }

                        sitesToProcess.forEach(cs => {
                            const cName = cs?.clientId?.clientName || 'Unspecified Client';
                            const sName = cs?.siteId?.siteName || 'Unspecified Site';
                            const splitCr = dayCredit / n;
                            const splitDr = dayDebit / n;
                            rows.push({
                                dateStr,
                                cName,
                                sName,
                                credit: Number(splitCr.toFixed(2)),
                                debit: Number(splitDr.toFixed(2)),
                                net: Number((splitCr - splitDr).toFixed(2))
                            });
                        });
                    } else {
                        let credit = 0;
                        let debit = 0;
                        if (g.transfers && g.transfers.length > 0) {
                            g.transfers.forEach(t => {
                                const isTaker = (t.taker?._id || t.taker) === employeeId;
                                const isGiver = (t.giver?._id || t.giver) === employeeId;
                                if (isTaker) credit += (Number(t.amount) || 0);
                                if (isGiver) debit += (Number(t.amount) || 0);
                            });
                        }
                        rows.push({
                            dateStr,
                            cName: 'Unspecified Client',
                            sName: 'Unspecified Site',
                            credit,
                            debit,
                            net: credit - debit
                        });
                    }
                });

                const filteredRows = rows.filter(r => r.credit > 0 || r.debit > 0 || r.cName !== 'Unspecified Client');

                const finalRows = [];
                let i = 0;
                let currentSr = 0;

                while (i < filteredRows.length) {
                    const currentDate = filteredRows[i].dateStr;
                    currentSr++;

                    let j = i;
                    while (j < filteredRows.length && filteredRows[j].dateStr === currentDate) {
                        j++;
                    }
                    const dateCount = j - i;

                    let k = i;
                    while (k < j) {
                        const currentClient = filteredRows[k].cName;
                        let l = k;
                        while (l < j && filteredRows[l].cName === currentClient) {
                            l++;
                        }
                        const clientCount = l - k;

                        for (let index = k; index < l; index++) {
                            finalRows.push({
                                ...filteredRows[index],
                                displaySrNo: currentSr,
                                dateRowSpan: index === i ? dateCount : 0,
                                clientRowSpan: index === k ? clientCount : 0
                            });
                        }
                        k = l;
                    }
                    i = j;
                }

                const totalCrSum = finalRows.reduce((sum, r) => sum + r.credit, 0);
                const totalDrSum = finalRows.reduce((sum, r) => sum + r.debit, 0);

                return (
                    <TableContainer border="1px" borderColor="gray.300" borderRadius="md" bg="white" overflowX="auto">
                        <Table size="sm" variant="simple" sx={{ borderCollapse: 'collapse', 'th, td': { border: '1px solid #CBD5E0' } }}>
                            <Thead bg="blue.50">
                                <Tr>
                                    <Th textAlign="center" color="blue.900" fontSize="xs" fontWeight="bold" whiteSpace="nowrap">SR. NO.</Th>
                                    <Th color="blue.900" fontSize="xs" fontWeight="bold" whiteSpace="nowrap">DATE</Th>
                                    <Th color="blue.900" fontSize="xs" fontWeight="bold">CLIENT NAME</Th>
                                    <Th color="blue.900" fontSize="xs" fontWeight="bold">SITE NAME</Th>
                                    <Th textAlign="center" color="green.700" fontSize="xs" fontWeight="bold" whiteSpace="nowrap">CREDIT</Th>
                                    <Th textAlign="center" color="red.700" fontSize="xs" fontWeight="bold" whiteSpace="nowrap">DEBIT</Th>
                                    <Th textAlign="center" color="blue.900" fontSize="xs" fontWeight="bold" whiteSpace="nowrap">NET (Cr-Dr)</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {finalRows.length === 0 ? (
                                    <Tr>
                                        <Td colSpan={7} textAlign="center" py={8} color="gray.500" fontStyle="italic">
                                            No ledger records found for this period.
                                        </Td>
                                    </Tr>
                                ) : (
                                    finalRows.map((row, idx) => (
                                        <Tr key={idx} _hover={{ bg: "gray.50" }}>
                                            {row.dateRowSpan > 0 && (
                                                <Td 
                                                    rowSpan={row.dateRowSpan} 
                                                    textAlign="center" 
                                                    fontWeight="bold" 
                                                    color="gray.600" 
                                                    fontSize="md" 
                                                    bg="gray.50" 
                                                    whiteSpace="nowrap"
                                                >
                                                    {row.displaySrNo}
                                                </Td>
                                            )}
                                            {row.dateRowSpan > 0 && (
                                                <Td 
                                                    rowSpan={row.dateRowSpan} 
                                                    fontWeight="bold" 
                                                    color="gray.700" 
                                                    fontSize="sm" 
                                                    whiteSpace="nowrap"
                                                >
                                                    {row.dateStr}
                                                </Td>
                                            )}
                                            {row.clientRowSpan > 0 && (
                                                <Td 
                                                    rowSpan={row.clientRowSpan} 
                                                    fontWeight="bold" 
                                                    color="gray.700" 
                                                    fontSize="sm" 
                                                    maxW="250px" 
                                                    whiteSpace="normal" 
                                                    wordBreak="break-word"
                                                >
                                                    {row.cName}
                                                </Td>
                                            )}
                                            <Td fontWeight="bold" color="gray.700" fontSize="sm" maxW="200px" whiteSpace="normal" wordBreak="break-word">{row.sName}</Td>
                                            <Td textAlign="center" fontWeight="bold" color="green.600" fontSize="sm" whiteSpace="nowrap">₹{row.credit}</Td>
                                            <Td textAlign="center" fontWeight="bold" color="red.600" fontSize="sm" whiteSpace="nowrap">₹{row.debit}</Td>
                                            <Td textAlign="center" fontWeight="bold" color={row.net >= 0 ? "blue.600" : "red.600"} fontSize="sm" whiteSpace="nowrap">
                                                {row.net >= 0 ? `+₹${row.net}` : `-₹${Math.abs(row.net)}`}
                                            </Td>
                                        </Tr>
                                    ))
                                )}
                                <Tr bg="gray.100">
                                    <Td colSpan={4} textAlign="right" fontWeight="bold" fontSize="md" whiteSpace="nowrap">GRAND TOTAL:</Td>
                                    <Td textAlign="center" fontWeight="bold" fontSize="md" color="green.700" whiteSpace="nowrap">
                                        ₹{Number(totalCrSum.toFixed(2))}
                                    </Td>
                                    <Td textAlign="center" fontWeight="bold" fontSize="md" color="red.700" whiteSpace="nowrap">
                                        ₹{Number(totalDrSum.toFixed(2))}
                                    </Td>
                                    <Td textAlign="center" fontWeight="bold" fontSize="md" color="blue.700" whiteSpace="nowrap">
                                        ₹{(totalCrSum - totalDrSum) >= 0 ? `+${(totalCrSum - totalDrSum).toFixed(2)}` : `-${Math.abs(totalCrSum - totalDrSum).toFixed(2)}`}
                                    </Td>
                                </Tr>
                            </Tbody>
                        </Table>
                    </TableContainer>
                );
            })() : null}
        </Box>
    );
};

export default AdminEmployeeExpenses;


