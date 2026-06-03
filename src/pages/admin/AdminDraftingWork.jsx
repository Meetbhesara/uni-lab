import React, { useState, useEffect } from 'react';
import {
    Box, Container, Heading, Text, Flex, VStack, HStack, Icon, Tabs, TabList, TabPanels, Tab, TabPanel, Button, Input, Select, Table, Thead, Tbody, Tr, Th, Td, Badge, IconButton, Card, CardBody, SimpleGrid, Progress, Avatar, Divider, useColorModeValue, useToast, Checkbox, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, useDisclosure, Spinner, FormControl, FormLabel
} from '@chakra-ui/react';
import {
    FaFolderOpen, FaUpload, FaSearch, FaFilter, FaEye, FaDownload, FaHistory, FaTasks, FaCheckCircle, FaClock, FaFilePdf, FaFileImage, FaFileAlt, FaTrash, FaEnvelope, FaMapMarkedAlt, FaArrowLeft
} from 'react-icons/fa';
import axios from 'axios';

// Use environment variable for real NAS deployment
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
const API_URL = API_BASE_URL.endsWith('/api') ? API_BASE_URL : `${API_BASE_URL}/api`;

const AdminDraftingWork = () => {
    const bgColor = useColorModeValue('gray.50', 'gray.900');
    const cardBg = useColorModeValue('white', 'gray.800');
    const toast = useToast();

    const [documents, setDocuments] = useState([]);
    const [topoSurveys, setTopoSurveys] = useState([]);
    const [loading, setLoading] = useState(false);
    
    const [clientOptions, setClientOptions] = useState([]);
    const [siteOptions, setSiteOptions] = useState([]);

    const [filterSearch, setFilterSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterClient, setFilterClient] = useState('');
    const [filterSite, setFilterSite] = useState('');
    const [filterDate, setFilterDate] = useState('');
    const [filterScheduleDate, setFilterScheduleDate] = useState(new Date().toISOString().split('T')[0]);

    // Tracking Tab State
    const [trackedDocId, setTrackedDocId] = useState('');
    const [uploadTrackingFile, setUploadTrackingFile] = useState(null);
    const [uploadingRevision, setUploadingRevision] = useState(false);
    const [activeTab, setActiveTab] = useState(0);
    const [selectedDocsForMail, setSelectedDocsForMail] = useState([]);
    const [isMovingToMail, setIsMovingToMail] = useState(false);

    // Drafting Work Modal State
    const { isOpen: isDraftingOpen, onOpen: onDraftingOpen, onClose: onDraftingClose } = useDisclosure();
    const [selectedSurvey, setSelectedSurvey] = useState(null);
    const [surveyReceivedDocs, setSurveyReceivedDocs] = useState([]);
    const [uploadingCategory, setUploadingCategory] = useState(null);
    const [selectedCollectedFileForConversion, setSelectedCollectedFileForConversion] = useState('');
    const [draftingFiles, setDraftingFiles] = useState({});

    const handleSurveyClick = async (survey) => {
        setSelectedSurvey(survey);
        setDraftingFiles(survey.draftingWorkFiles || {});
        setSurveyReceivedDocs([]); // reset
        
        // Fetch specifically for this site to avoid global date filter missing past files
        if (survey.client?._id && survey.site?._id) {
            try {
                // Pass scheduleDate and scheduleId to ensure we ONLY get documents for this specific survey date and EXACT schedule, avoiding other surveys on the same site!
                const formattedDate = survey.scheduleDate ? new Date(survey.scheduleDate).toISOString().split('T')[0] : '';
                const res = await axios.get(`${API_URL}/site-master/all-documents?client=${survey.client._id}&site=${survey.site._id}&scheduleDate=${formattedDate}&scheduleId=${survey._id}`);
                if (res.data.success) {
                    // Only get documents specifically uploaded via the Employee app (source: EmployeeExpense)
                    const received = res.data.data.filter(d => ['Received', 'Done', 'Converted'].includes(d.status) && d.source === 'EmployeeExpense').map(doc => ({
                        _id: doc._id,
                        name: doc.documentName,
                        url: doc.documentUrl,
                        isGlobalDoc: true,
                        source: doc.source,
                        expenseId: doc.expenseId,
                        status: doc.status,
                        uploadedAt: doc.receivedDate
                    }));
                    setSurveyReceivedDocs(received);
                }
            } catch (e) {
                console.error("Failed to fetch site docs for topography", e);
            }
        }
    };

    const handleDraftingFileUpload = async (e, category) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        if (category === 'convertedFiles' && !selectedCollectedFileForConversion) {
            toast({ title: 'Please select an original Collected File first', status: 'warning' });
            e.target.value = null;
            return;
        }

        setUploadingCategory(category);
        const formData = new FormData();
        Array.from(files).forEach(f => formData.append(category, f));
        // Append client and site info for NAS storage
        formData.append('clientShortId', selectedSurvey.client?.clientId || 'unknown');
        formData.append('siteSubfolder', `${selectedSurvey.site?.siteId || '0000'}-${(selectedSurvey.site?.siteName || 'unknown').replace(/\s+/g, '_')}`);

        try {
            const res = await axios.post(`${API_URL}/schedule-master/drafting-work/${selectedSurvey._id}`, formData);
            if (res.data.success) {
                setDraftingFiles(res.data.data);
                toast({ title: 'Files uploaded', status: 'success' });
                fetchDrafts(); // Refresh main table quietly
                
                if (category === 'convertedFiles' && selectedCollectedFileForConversion) {
                    const originalDoc = surveyReceivedDocs.find(d => d._id === selectedCollectedFileForConversion);
                    if (originalDoc) {
                        await updateStatus(originalDoc._id, originalDoc.source, originalDoc.expenseId, 'Done', null);
                        // Update its status in the frontend state so it disappears from Select Box but stays in Collected List
                        setSurveyReceivedDocs(prev => prev.map(d => d._id === selectedCollectedFileForConversion ? { ...d, status: 'Done' } : d));
                        setSelectedCollectedFileForConversion(''); // reset
                    }
                }
            }
        } catch (error) {
            toast({ title: 'Upload failed', status: 'error' });
        } finally {
            setUploadingCategory(null);
            e.target.value = null; // reset input
        }
    };

    const handleDraftingFileDelete = async (category, fileId) => {
        if (!window.confirm("Delete this file?")) return;
        try {
            const res = await axios.delete(`${API_URL}/schedule-master/drafting-work/${selectedSurvey._id}/${category}/${fileId}`);
            if (res.data.success) {
                setDraftingFiles(res.data.data);
                toast({ title: 'File deleted', status: 'success' });
                fetchDrafts();
            }
        } catch (error) {
            toast({ title: 'Delete failed', status: 'error' });
        }
    };

    // Fetch Drafts and Topography Surveys
    const fetchDrafts = async () => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams();
            if (filterClient) queryParams.append('client', filterClient);
            if (filterSite) queryParams.append('site', filterSite);
            if (filterScheduleDate) queryParams.append('scheduleDate', filterScheduleDate);
            
            const docsRes = await axios.get(`${API_URL}/site-master/all-documents?${queryParams.toString()}`);
            if (docsRes.data.success) {
                setDocuments(docsRes.data.data);
            }

            // Fetch Topography Surveys
            const topoRes = await axios.get(`${API_URL}/schedule-master?scheduleType=TOPOGRAPHY SURVEY`);
            if (topoRes.data.success) {
                // Group Topography Surveys identical to InvoiceReport
                const rawTopo = topoRes.data.data;
                const topoGroupsObj = {};
                const groupedTopo = [];

                rawTopo.forEach(s => {
                    // Force group by individual mongo ID as requested by user
                    const groupId = s._id;
                    
                    const groupKey = `${s.client?._id}-${s.site?._id}-${groupId}`;
                    
                    if (!topoGroupsObj[groupKey]) {
                        topoGroupsObj[groupKey] = { ...s };
                        topoGroupsObj[groupKey].isMonthGroup = false; // Render them individually
                        topoGroupsObj[groupKey].groupedDates = [s.scheduleDate];
                    }
                });

                Object.values(topoGroupsObj).forEach(mg => {
                    mg.groupedDates.sort((a, b) => new Date(a) - new Date(b));
                    groupedTopo.push(mg);
                });
                
                // Sort the final array by scheduleDate descending
                groupedTopo.sort((a, b) => new Date(b.scheduleDate) - new Date(a.scheduleDate));

                setTopoSurveys(groupedTopo);
            }
        } catch (error) {
            toast({ title: 'Failed to fetch data', status: 'error', duration: 3000 });
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (docId, source, expenseId, newStatus, linkedDocumentId) => {
        try {
            const res = await axios.put(`${API_URL}/site-master/document-status`, {
                documentId: docId,
                source: source,
                expenseId: expenseId,
                newStatus: newStatus,
                linkedDocumentId: linkedDocumentId
            });
            if (res.data.success) {
                toast({ title: 'Status updated', status: 'success', duration: 2000 });
                fetchDrafts(); // Refresh to show new status
            }
        } catch (error) {
            toast({ title: 'Failed to update status', status: 'error', duration: 3000 });
        }
    };

    const handleRevisionUpload = async () => {
        if (!trackedDocId || !uploadTrackingFile) {
            toast({ title: 'Select a document and a file to upload', status: 'warning', duration: 2000 });
            return;
        }

        setUploadingRevision(true);
        try {
            const inProgressDocs = documents.filter(d => d.status === 'Drafting In Progress');
            const originalDoc = inProgressDocs.find(d => d._id === trackedDocId);
            
            // Determine the file name based on linked drafts
            const linkedDrafts = documents.filter(d => d.isDraft && d.linkedDocumentId === originalDoc._id);
            
            let newFileName = uploadTrackingFile.name; // Default: use uploaded file name (e.g., meet.pdf)
            
            if (linkedDrafts.length > 0) {
                // Find base name by looking at any existing draft and stripping (Rx)
                // Let's find the one that doesn't have (R...) or just strip it from the first one
                let firstDraftName = linkedDrafts[0].documentName;
                const lastDot = firstDraftName.lastIndexOf('.');
                const nameWithoutExt = lastDot === -1 ? firstDraftName : firstDraftName.substring(0, lastDot);
                const baseName = nameWithoutExt.replace(/\(R\d+\)$/, '').trim();
                const uploadedExt = uploadTrackingFile.name.split('.').pop();
                
                let maxRev = 0;
                linkedDrafts.forEach(d => {
                    const match = d.documentName.match(new RegExp(`\\(R(\\d+)\\)\\.`));
                    if (match) {
                        maxRev = Math.max(maxRev, parseInt(match[1]));
                    }
                });
                
                const nextRev = maxRev + 1;
                newFileName = `${baseName}(R${nextRev}).${uploadedExt}`;
            }
            
            const renamedFile = new File([uploadTrackingFile], newFileName, { type: uploadTrackingFile.type });

            const formData = new FormData();
            // Important: documentType must be appended BEFORE the document file for multer to use it!
            formData.append('documentType', originalDoc.documentType || 'docs');
            formData.append('source', originalDoc.source);
            formData.append('expenseId', originalDoc.expenseId || '');
            formData.append('clientId', originalDoc.client?._id || originalDoc.client);
            formData.append('client', originalDoc.client?._id || originalDoc.client); // backend multer expects 'client'
            formData.append('siteId', originalDoc.site?._id || originalDoc.site);
            formData.append('siteName', originalDoc.site?.siteName || 'unknown_site'); // backend multer expects 'siteName'
            formData.append('linkedDocumentId', originalDoc._id);
            formData.append('status', 'Under Review'); 
            
            formData.append('document', renamedFile);

            const res = await axios.post(`${API_URL}/site-master/upload-revision`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (res.data.success) {
                toast({ title: 'Revision uploaded successfully', status: 'success', duration: 2000 });
                // We no longer change the original document to 'Under Review'. It stays 'Drafting In Progress'.
                
                setUploadTrackingFile(null);
                setTrackedDocId(''); // reset selection
                fetchDrafts();
            }
        } catch (e) {
            toast({ title: 'Upload failed', status: 'error', duration: 3000 });
        } finally {
            setUploadingRevision(false);
        }
    };

    const fetchOptions = async () => {
        try {
            if (filterScheduleDate) {
                const res = await axios.get(`${API_URL}/schedule-master?date=${filterScheduleDate}`);
                if (res.data.success) {
                    const uniqueClients = [];
                    const uniqueSites = [];
                    res.data.data.forEach(sch => {
                        if (sch.client && !uniqueClients.find(c => c._id === sch.client._id)) {
                            uniqueClients.push(sch.client);
                        }
                        if (sch.site && !uniqueSites.find(s => s._id === sch.site._id)) {
                            // Attach the client ID so the dropdown filtering works perfectly
                            const siteObj = { ...sch.site, client: sch.client ? sch.client._id : null };
                            uniqueSites.push(siteObj);
                        }
                    });
                    setClientOptions(uniqueClients);
                    setSiteOptions(uniqueSites);
                }
            } else {
                const [clientsRes, sitesRes] = await Promise.all([
                    axios.get(`${API_URL}/client-master`),
                    axios.get(`${API_URL}/site-master`)
                ]);
                if (clientsRes.data.success) setClientOptions(clientsRes.data.data);
                if (sitesRes.data.success) setSiteOptions(sitesRes.data.data);
            }
        } catch(e) { console.error("Failed to fetch options", e); }
    };

    useEffect(() => {
        // Reset client and site selections when date changes so we don't query invalid combinations
        setFilterClient('');
        setFilterSite('');
        fetchOptions();
    }, [filterScheduleDate]);

    useEffect(() => {
        fetchDrafts();
    }, [filterClient, filterSite, filterScheduleDate]);

    const getFileIcon = (type) => {
        switch (type?.toLowerCase()) {
            case 'pdf': return FaFilePdf;
            case 'jpg': case 'jpeg': case 'png': case 'photo': return FaFileImage;
            case 'report': return FaCheckCircle;
            case 'data': return FaTasks;
            case 'drawing': return FaFolderOpen;
            default: return FaFileAlt;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Received': return 'blue';
            case 'Under Review': return 'orange';
            case 'Drafting In Progress': return 'teal';
            case 'Correction Pending': return 'red';
            case 'Approved': return 'green';
            case 'Completed': return 'purple';
            default: return 'gray';
        }
    };

    const handleDelete = async (id, source, expenseId) => {
        if (!window.confirm("Delete this document?")) return;
        try {
            await axios.delete(`${API_URL}/site-master/delete-document/${id}?source=${source}&expenseId=${expenseId || ''}`);
            toast({ title: 'Deleted successfully', status: 'success' });
            fetchDrafts();
        } catch(e) {
            toast({ title: 'Error deleting', status: 'error' });
        }
    };

    
    const filteredDocuments = documents.filter(doc => {
        if (filterSearch && !doc.documentName?.toLowerCase().includes(filterSearch.toLowerCase())) return false;
        if (filterStatus && doc.status !== filterStatus) return false;
        return true;
    });

    const allDocsTableDocs = filteredDocuments.filter(doc => !doc.isDraft);
    const trackingTableDocs = filteredDocuments.filter(doc => doc.isDraft && doc.status !== 'Completed');
    const finalTableDocs = filteredDocuments.filter(doc => doc.isDraft && doc.status === 'Completed' && !doc.inMail);
    const mailTableDocs = filteredDocuments.filter(doc => doc.isDraft && doc.status === 'Completed' && doc.inMail);

    const mailGroups = {};
    mailTableDocs.forEach(doc => {
        const folder = doc.mailFolderName || 'Unknown Mail';
        if (!mailGroups[folder]) mailGroups[folder] = [];
        mailGroups[folder].push(doc);
    });

    const handleToggleMailSelection = (doc) => {
        if (selectedDocsForMail.some(d => d.documentId === doc._id)) {
            setSelectedDocsForMail(prev => prev.filter(d => d.documentId !== doc._id));
        } else {
            setSelectedDocsForMail(prev => [...prev, { documentId: doc._id, source: doc.source, expenseId: doc.expenseId }]);
        }
    };

    const handleMoveToMail = async () => {
        if (selectedDocsForMail.length === 0) return;
        setIsMovingToMail(true);
        try {
            const res = await axios.post(`${API_URL}/site-master/move-to-mail`, { documentIds: selectedDocsForMail });
            if (res.data.success) {
                toast({ title: 'Moved to Mail', status: 'success' });
                setSelectedDocsForMail([]);
                fetchDrafts();
                setActiveTab(3); // Auto-switch to Mail tab
            }
        } catch (error) {
            toast({ title: 'Error moving to Mail', status: 'error' });
        } finally {
            setIsMovingToMail(false);
        }
    };

    const formatIST = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
            day: '2-digit', month: '2-digit', year: 'numeric'
        });
    };

    const formatDateTimeIST = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleString('en-GB', {
            timeZone: 'Asia/Kolkata',
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit', second: '2-digit',
            hour12: false
        }).replace(',', '');
    };

    const renderDocumentName = (name) => {
        if (!name) return 'N/A';
        const parts = name.split(/(\(R\d+\))/i);
        return parts.map((part, index) => {
            if (part.match(/^\(R\d+\)$/i)) {
                return <Text as="span" color="red.500" key={index}>{part}</Text>;
            }
            return part;
        });
    };

    return (
        <Box bg={bgColor} minH="calc(100vh - 80px)" p={{ base: 4, md: 8 }}>
            <Container maxW="container.xl" p={0}>
                {/* Header */}
                <Flex justify="space-between" align="center" mb={8} flexWrap="wrap" gap={4}>
                    <HStack spacing={4}>
                        <Box p={3} bg="brand.500" color="white" borderRadius="xl" boxShadow="md">
                            <Icon as={FaFolderOpen} w={6} h={6} />
                        </Box>
                        <VStack align="start" spacing={0}>
                            <Heading size="lg" color="gray.800">Drafting Work</Heading>
                            <Text color="gray.500" fontSize="sm">Manage drawings, tracking, and final submissions</Text>
                        </VStack>
                    </HStack>
                    <Button leftIcon={<FaUpload />} colorScheme="brand" borderRadius="xl" shadow="sm">
                        Upload Document
                    </Button>
                </Flex>

                <Card bg={cardBg} borderRadius="2xl" shadow="sm" border="1px solid" borderColor="gray.200">
                    
                    {activeTab !== 0 && (
                        <Flex gap={3} flexWrap="wrap" bg="white" p={4} m={4} mb={0} borderRadius="xl" shadow="sm" border="1px solid" borderColor="gray.100">
                            <Input value={filterSearch} onChange={e => setFilterSearch(e.target.value)} placeholder="Search documents..." bg="gray.50" borderRadius="md" maxW="250px" />
                            
                            <VStack align="start" spacing={0} maxW="150px">
                                <Text fontSize="xs" fontWeight="bold" color="gray.500">Schedule Date</Text>
                                <Input type="date" value={filterScheduleDate} onChange={e => setFilterScheduleDate(e.target.value)} bg="gray.50" borderRadius="md" />
                            </VStack>

                            <VStack align="start" spacing={0} maxW="180px">
                                <Text fontSize="xs" fontWeight="bold" color="gray.500">Client</Text>
                                <Select value={filterClient} onChange={e => setFilterClient(e.target.value)} placeholder="All Clients" bg="gray.50" borderRadius="md">
                                    {clientOptions.map(c => <option key={c._id} value={c._id}>{c.clientName}</option>)}
                                </Select>
                            </VStack>

                            <VStack align="start" spacing={0} maxW="180px">
                                <Text fontSize="xs" fontWeight="bold" color="gray.500">Site</Text>
                                <Select value={filterSite} onChange={e => setFilterSite(e.target.value)} placeholder="Select Site..." bg="gray.50" borderRadius="md">
                                    {siteOptions.filter(s => !filterClient || s.client === filterClient || s.client?._id === filterClient).map(s => <option key={s._id} value={s._id}>{s.siteName}</option>)}
                                </Select>
                            </VStack>

                            <VStack align="start" spacing={0} maxW="150px">
                                <Text fontSize="xs" fontWeight="bold" color="gray.500">Status</Text>
                                <Select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} placeholder="All Status" bg="gray.50" borderRadius="md">
                                    <option value="Received">Received</option>
                                    <option value="Under Review">Under Review</option>
                                    <option value="Drafting In Progress">Drafting In Progress</option>
                                    <option value="Correction Pending">Correction Pending</option>
                                    <option value="Approved">Approved</option>
                                    <option value="Completed">Completed</option>
                                </Select>
                            </VStack>
                        </Flex>
                    )}

                    <Tabs colorScheme="brand" variant="soft-rounded" p={4} index={activeTab} onChange={(index) => setActiveTab(index)}>
                        <TabList mb={4} gap={4} overflowX="auto" pb={2}>
                            <Tab borderRadius="xl" fontWeight="bold"><Icon as={FaMapMarkedAlt} mr={2} /> Topography Surveys</Tab>
                            <Tab borderRadius="xl" fontWeight="bold"><Icon as={FaFolderOpen} mr={2} /> All Documents</Tab>
                            <Tab borderRadius="xl" fontWeight="bold"><Icon as={FaTasks} mr={2} /> Tracking</Tab>
                            <Tab borderRadius="xl" fontWeight="bold"><Icon as={FaCheckCircle} mr={2} /> Final</Tab>
                            <Tab borderRadius="xl" fontWeight="bold"><Icon as={FaEnvelope} mr={2} /> Mail</Tab>
                        </TabList>

                        <TabPanels>
                            {/* SECTION 0: TOPOGRAPHY SURVEYS */}
                            <TabPanel p={0}>
                                {!selectedSurvey ? (
                                    <VStack spacing={6} align="stretch">
                                        <Box overflowX="auto" borderRadius="xl" border="1px solid" borderColor="gray.100">
                                            <Table variant="simple" sx={{ 'th, td': { whiteSpace: 'normal' } }}>
                                                <Thead bg="gray.50">
                                                    <Tr>
                                                        <Th>Client</Th>
                                                        <Th>Site Name</Th>
                                                        <Th>Schedule Date(s)</Th>
                                                        <Th>Operative Name</Th>
                                                        <Th>Drafting Status</Th>
                                                    </Tr>
                                                </Thead>
                                                <Tbody>
                                                    {topoSurveys.map((survey) => (
                                                        <Tr 
                                                            key={`${survey._id}`} 
                                                            _hover={{ bg: 'blue.50', cursor: 'pointer' }}
                                                            onClick={() => handleSurveyClick(survey)}
                                                        >
                                                            <Td fontWeight="bold" color="blue.600">{survey.client?.clientName || 'N/A'}</Td>
                                                            <Td fontWeight="bold" color="gray.700">
                                                                <VStack align="start" spacing={0}>
                                                                    <Text>{survey.site?.siteName || 'N/A'}</Text>
                                                                </VStack>
                                                            </Td>
                                                            <Td fontSize="sm" fontWeight="medium">
                                                                <Text>{formatIST(survey.scheduleDate)}</Text>
                                                            </Td>
                                                            <Td>
                                                                {survey.operative?.name ? (
                                                                    <HStack>
                                                                        <Avatar size="xs" name={survey.operative.name} bg="teal.500" />
                                                                        <Text fontWeight="bold">{survey.operative.name}</Text>
                                                                    </HStack>
                                                                ) : (
                                                                    <Text color="gray.400">Unassigned</Text>
                                                                )}
                                                            </Td>
                                                            <Td>
                                                                {(() => {
                                                                    const files = survey.draftingWorkFiles || {};
                                                                    let status = 'Collected All Files';
                                                                    let color = 'blue';

                                                                    if (files.finalCheckingFiles?.length > 0) { status = 'Final Checking'; color = 'green'; }
                                                                    else if (files.esurveyWorkFiles?.length > 0) { status = 'eSurvey Work'; color = 'purple'; }
                                                                    else if (files.liningDrawFiles?.length > 0) { status = 'Lining Draw'; color = 'teal'; }
                                                                    else if (files.convertedFiles?.length > 0) { status = 'Converted'; color = 'orange'; }

                                                                    return <Badge colorScheme={color} borderRadius="full">{status}</Badge>;
                                                                })()}
                                                            </Td>
                                                        </Tr>
                                                    ))}
                                                    {topoSurveys.length === 0 && (
                                                        <Tr><Td colSpan={5} textAlign="center" py={8} color="gray.500">No Topography Surveys found.</Td></Tr>
                                                    )}
                                                </Tbody>
                                            </Table>
                                        </Box>
                                    </VStack>
                                ) : (
                                    <Box p={4} border="1px solid" borderColor="gray.200" borderRadius="xl" bg="white" shadow="sm">
                                        <Flex justify="space-between" align="center" mb={6}>
                                            <HStack spacing={4}>
                                                <IconButton icon={<FaArrowLeft />} onClick={() => setSelectedSurvey(null)} borderRadius="full" aria-label="Back" />
                                                <VStack align="start" spacing={0}>
                                                    <Heading size="md" color="blue.700">{selectedSurvey.client?.clientName} - {selectedSurvey.site?.siteName}</Heading>
                                                    <Text fontSize="sm" color="gray.500">Drafting Workspace • Scheduled: {formatIST(selectedSurvey.scheduleDate)}</Text>
                                                </VStack>
                                            </HStack>
                                        </Flex>

                                        <Tabs variant="enclosed" colorScheme="blue">
                                            <TabList mb={4} overflowX="auto" whiteSpace="nowrap">
                                                <Tab fontWeight="bold" color="blue.600">1. Collected Files</Tab>
                                                <Tab fontWeight="bold" color="orange.600">2. Converted</Tab>
                                                <Tab fontWeight="bold" color="teal.600">3. Lining Draw</Tab>
                                                <Tab fontWeight="bold" color="purple.600">4. eSurvey Work</Tab>
                                                <Tab fontWeight="bold" color="green.600">5. Final Checking</Tab>
                                            </TabList>
                                            
                                            <TabPanels>
                                                {[
                                                    { key: 'collectedFiles', color: 'blue' },
                                                    { key: 'convertedFiles', color: 'orange' },
                                                    { key: 'liningDrawFiles', color: 'teal' },
                                                    { key: 'esurveyWorkFiles', color: 'purple' },
                                                    { key: 'finalCheckingFiles', color: 'green' }
                                                ].map((step, idx) => (
                                                    <TabPanel key={step.key} p={0}>
                                                        <Card border="1px solid" borderColor={`${step.color}.200`} shadow="none" borderRadius="xl" bg={`${step.color}.50`}>
                                                            <CardBody p={6}>
                                                                <VStack align="stretch" spacing={6}>
                                                                    
                                                                    {step.key !== 'collectedFiles' && (
                                                                        <VStack align="stretch" spacing={4}>
                                                                            {step.key === 'convertedFiles' && (
                                                                                <FormControl>
                                                                                    <FormLabel fontSize="sm" fontWeight="bold" color="orange.700">1. Select Original Collected File</FormLabel>
                                                                                    <Select 
                                                                                        placeholder="-- Select a received file to convert --" 
                                                                                        value={selectedCollectedFileForConversion} 
                                                                                        onChange={e => setSelectedCollectedFileForConversion(e.target.value)}
                                                                                        bg="white"
                                                                                        borderColor="orange.300"
                                                                                    >
                                                                                        {(surveyReceivedDocs || []).filter(d => d.status !== 'Done').map(doc => (
                                                                                            <option key={doc._id} value={doc._id}>{doc.name}</option>
                                                                                        ))}
                                                                                    </Select>
                                                                                </FormControl>
                                                                            )}
                                                                            
                                                                            <Box 
                                                                                p={6} 
                                                                                border="2px dashed" 
                                                                                borderColor={`${step.color}.300`} 
                                                                                borderRadius="xl" 
                                                                                bg="white" 
                                                                                textAlign="center" 
                                                                                position="relative" 
                                                                                _hover={(!selectedCollectedFileForConversion && step.key === 'convertedFiles') ? {} : { bg: `${step.color}.50` }} 
                                                                                transition="all 0.2s"
                                                                                opacity={(!selectedCollectedFileForConversion && step.key === 'convertedFiles') ? 0.5 : 1}
                                                                            >
                                                                                <Input 
                                                                                    type="file" 
                                                                                    multiple 
                                                                                    opacity={0} 
                                                                                    position="absolute" 
                                                                                    top={0} 
                                                                                    left={0} 
                                                                                    w="100%" 
                                                                                    h="100%" 
                                                                                    cursor={(!selectedCollectedFileForConversion && step.key === 'convertedFiles') ? 'not-allowed' : 'pointer'} 
                                                                                    onChange={(e) => handleDraftingFileUpload(e, step.key)} 
                                                                                    disabled={uploadingCategory === step.key || (!selectedCollectedFileForConversion && step.key === 'convertedFiles')} 
                                                                                />
                                                                                <Icon as={FaUpload} color={`${step.color}.500`} w={8} h={8} mb={2} />
                                                                                <Text fontSize="md" fontWeight="bold" color={`${step.color}.700`}>
                                                                                    {(!selectedCollectedFileForConversion && step.key === 'convertedFiles') ? 'Select a file above first' : 'Drag & Drop or Click to Upload'}
                                                                                </Text>
                                                                                {uploadingCategory === step.key && <Spinner size="md" color={`${step.color}.500`} mt={4} />}
                                                                            </Box>
                                                                        </VStack>
                                                                    )}

                                                                    <Box>
                                                                        <Text fontWeight="bold" mb={3} color="gray.700">Uploaded Documents</Text>
                                                                        <VStack align="stretch" spacing={3} maxH="400px" overflowY="auto" pr={2}>
                                                                            {(() => {
                                                                                let filesToRender = draftingFiles[step.key] || [];
                                                                                if (step.key === 'collectedFiles' && selectedSurvey) {
                                                                                    const receivedDocs = surveyReceivedDocs || [];
                                                                                    // Remove uniqueness check by url if it clashes, just use all receivedDocs directly
                                                                                    filesToRender = receivedDocs;
                                                                                }

                                                                                return (
                                                                                    <>
                                                                                        {filesToRender.map((file, fIdx) => (
                                                                                            <Flex key={file._id || fIdx} bg="white" p={3} borderRadius="lg" border="1px solid" borderColor="gray.200" align="center" justify="space-between" shadow="sm">
                                                                                                <HStack overflow="hidden" spacing={4} flex={1}>
                                                                                                    <Icon as={FaFilePdf} color="red.500" w={6} h={6} />
                                                                                                    <VStack align="start" spacing={0} flex={1} overflow="hidden">
                                                                                                        <Text fontSize="sm" fontWeight="bold" color="gray.700" isTruncated maxW="100%" title={file.name}>{file.name}</Text>
                                                                                                        <HStack spacing={1} mt={0.5}>
                                                                                                            <Icon as={FaClock} w={3} h={3} color="gray.400" />
                                                                                                            <Text fontSize="xs" color="gray.500" fontWeight="medium">
                                                                                                                {file.uploadedAt ? formatDateTimeIST(file.uploadedAt) : 'N/A'}
                                                                                                            </Text>
                                                                                                        </HStack>
                                                                                                    </VStack>
                                                                                                </HStack>
                                                                                                <HStack spacing={2} ml={4}>
                                                                                                    <Button size="sm" leftIcon={<FaEye />} colorScheme="blue" variant="outline" onClick={() => window.open(`${API_BASE_URL}${file.url}`, '_blank')}>View</Button>
                                                                                                    {(file._id && step.key !== 'collectedFiles') && <IconButton icon={<FaTrash />} size="sm" colorScheme="red" variant="ghost" onClick={() => handleDraftingFileDelete(step.key, file._id)} />}
                                                                                                </HStack>
                                                                                            </Flex>
                                                                                        ))}
                                                                                        {filesToRender.length === 0 && (
                                                                                            <Box p={8} textAlign="center" border="1px dashed" borderColor="gray.300" borderRadius="lg" bg="white">
                                                                                                <Text color="gray.500">No files have been uploaded to this stage yet.</Text>
                                                                                            </Box>
                                                                                        )}
                                                                                    </>
                                                                                );
                                                                            })()}
                                                                        </VStack>
                                                                    </Box>

                                                                </VStack>
                                                            </CardBody>
                                                        </Card>
                                                    </TabPanel>
                                                ))}
                                            </TabPanels>
                                        </Tabs>
                                    </Box>
                                )}
                            </TabPanel>
                            {/* SECTION 1: ALL DRAWING DOCUMENTS */}
                            <TabPanel p={0}>
                                <VStack spacing={6} align="stretch">

                                    <Box overflowX="auto" borderRadius="xl" border="1px solid" borderColor="gray.100">
                                        <Table variant="simple" sx={{ 'th, td': { whiteSpace: 'normal' } }}>
                                            <Thead bg="gray.50">
                                                <Tr>
                                                    <Th>Document</Th>
                                                    <Th>Client & Site</Th>
                                                    <Th>Schedule Dates</Th>
                                                    <Th>Status & Priority</Th>
                                                    <Th>Actions</Th>
                                                </Tr>
                                            </Thead>
                                            <Tbody>
                                                {!filterSite ? (
                                                    <Tr><Td colSpan={5} textAlign="center" py={8} color="gray.500">Please select a Client and Site to view documents</Td></Tr>
                                                ) : (
                                                    <>
                                                        {allDocsTableDocs.map((doc) => (
                                                            <Tr key={doc._id} _hover={{ bg: 'gray.50' }}>
                                                        <Td>
                                                            <HStack>
                                                                <Icon as={getFileIcon(doc.documentType)} color="gray.500" w={5} h={5} />
                                                                <Text fontWeight="bold" fontSize="sm">{renderDocumentName(doc.documentName)}</Text>
                                                            </HStack>
                                                        </Td>
                                                        <Td>
                                                            <VStack align="start" spacing={0}>
                                                                <Text fontSize="sm" fontWeight="bold">{doc.client?.clientName || 'N/A'}</Text>
                                                                <Text fontSize="xs" color="gray.500">{doc.site?.siteName || 'N/A'}</Text>
                                                            </VStack>
                                                        </Td>
                                                        <Td fontSize="sm" fontWeight="medium">
                                                            {formatDateTimeIST(doc.receivedDate)}
                                                        </Td>
                                                        <Td>
                                                            <HStack>
                                                                <Select 
                                                                    size="sm" 
                                                                    value={doc.status} 
                                                                    onChange={(e) => updateStatus(doc._id, doc.source, doc.expenseId, e.target.value, doc.linkedDocumentId)}
                                                                    borderRadius="full"
                                                                    bg={doc.status === 'Received' ? 'blue.50' : doc.status === 'Drafting In Progress' ? 'orange.50' : 'green.50'}
                                                                    fontWeight="bold"
                                                                    w="auto"
                                                                >
                                                                    <option value="Received">Received</option>
                                                                    <option value="Drafting In Progress">Drafting In Progress</option>
                                                                    <option value="Completed">Completed</option>
                                                                </Select>
                                                                <Badge colorScheme={doc.priority === 'High' ? 'red' : 'gray'} borderRadius="full">{doc.priority}</Badge>
                                                            </HStack>
                                                        </Td>
                                                        <Td>
                                                            <HStack spacing={2}>
                                                                <IconButton as="a" href={`${API_BASE_URL}${doc.documentUrl}`} target="_blank" size="sm" icon={<FaEye />} aria-label="View" colorScheme="blue" variant="ghost" />
                                                                {/* Only allow deletion if it's a drafting work, not a global site document (preventing accidental site file deletion) */}
                                                                {!['photo', 'report', 'data', 'drawing', 'document'].includes(doc.documentType) && (
                                                                    <IconButton size="sm" icon={<FaTrash />} aria-label="Delete" colorScheme="red" variant="ghost" onClick={() => handleDelete(doc._id, doc.source, doc.expenseId)} />
                                                                )}
                                                            </HStack>
                                                        </Td>
                                                    </Tr>
                                                ))}
                                                        {allDocsTableDocs.length === 0 && (
                                                            <Tr><Td colSpan={5} textAlign="center" py={4}>No raw documents found for this site</Td></Tr>
                                                        )}
                                                    </>
                                                )}
                                            </Tbody>
                                        </Table>
                                    </Box>
                                </VStack>
                            </TabPanel>

                            {/* SECTION 2: TRACKING */}
                            <TabPanel p={0}>
                                {(!filterScheduleDate || !filterClient || !filterSite) ? (
                                    <Box bg={cardBg} p={10} borderRadius="xl" shadow="sm" border="1px solid" borderColor="gray.100" textAlign="center">
                                        <Icon as={FaTasks} w={10} h={10} color="gray.300" mb={4} />
                                        <Heading size="md" color="gray.600" mb={2}>Select Filters to View Tracking</Heading>
                                        <Text color="gray.500">Please select a <b>Date</b>, <b>Client</b>, and <b>Site</b> from the dropdowns above to view and upload drafted documents.</Text>
                                    </Box>
                                ) : (
                                    <VStack spacing={6} align="stretch">
                                        <Box bg={cardBg} p={6} borderRadius="xl" shadow="sm" border="1px solid" borderColor="gray.100">
                                        <Heading size="sm" mb={4} color="brand.600">Select "Drafting In Progress" Document</Heading>
                                        <Select placeholder="Select a document being drafted..." value={trackedDocId} onChange={e => setTrackedDocId(e.target.value)} mb={6}>
                                            {filteredDocuments.filter(d => d.status === 'Drafting In Progress' && !d.isDraft).map(doc => (
                                                <option key={doc._id} value={doc._id}>{doc.documentName}</option>
                                            ))}
                                        </Select>

                                        {trackedDocId && (
                                            <Box p={4} bg="blue.50" borderRadius="md" border="1px dashed" borderColor="blue.200">
                                                <Text fontWeight="bold" mb={2}>Upload Draft / Revision</Text>
                                                <Text fontSize="sm" color="gray.600" mb={4}>
                                                    Uploading against a raw file uses your file's exact name. Uploading against an existing draft appends (R1), (R2).
                                                </Text>
                                                <HStack>
                                                    <Input 
                                                        type="file" 
                                                        bg="white" 
                                                        onChange={e => setUploadTrackingFile(e.target.files[0])} 
                                                    />
                                                    <Button 
                                                        colorScheme="brand" 
                                                        leftIcon={<FaUpload />} 
                                                        onClick={handleRevisionUpload}
                                                        isLoading={uploadingRevision}
                                                    >
                                                        Upload Revision
                                                    </Button>
                                                </HStack>
                                            </Box>
                                        )}
                                        {filteredDocuments.filter(d => d.status === 'Drafting In Progress').length === 0 && (
                                            <Text color="gray.500" fontSize="sm">No documents are currently marked as "Drafting In Progress" for the selected date, client, and site.</Text>
                                        )}
                                    </Box>

                                    <Box overflowX="auto" borderRadius="xl" border="1px solid" borderColor="gray.100">
                                        <Table variant="simple">
                                            <Thead bg="gray.50">
                                                <Tr>
                                                    <Th>Drafted Document</Th>
                                                    <Th>Uploaded Date</Th>
                                                    <Th>Status</Th>
                                                    <Th>Actions</Th>
                                                </Tr>
                                            </Thead>
                                            <Tbody>
                                                {trackingTableDocs.map((doc) => (
                                                    <Tr key={doc._id} _hover={{ bg: 'gray.50' }}>
                                                        <Td>
                                                            <HStack>
                                                                <Icon as={getFileIcon(doc.documentType)} color="gray.500" w={5} h={5} />
                                                                <Text fontWeight="bold" fontSize="sm">{renderDocumentName(doc.documentName)}</Text>
                                                            </HStack>
                                                        </Td>
                                                        <Td fontSize="sm">
                                                            {formatDateTimeIST(doc.receivedDate)}
                                                        </Td>
                                                        <Td>
                                                            <Select 
                                                                size="sm" 
                                                                value={doc.status} 
                                                                onChange={(e) => updateStatus(doc._id, doc.source, doc.expenseId, e.target.value, doc.linkedDocumentId)}
                                                                borderRadius="full"
                                                                bg={doc.status === 'Drafting In Progress' ? 'orange.50' : doc.status === 'Completed' ? 'purple.50' : 'blue.50'}
                                                                fontWeight="bold"
                                                                w="auto"
                                                            >
                                                                <option value="Drafting In Progress">Drafting In Progress</option>
                                                                <option value="Under Review">Under Review</option>
                                                                <option value="Completed">Completed</option>
                                                            </Select>
                                                        </Td>
                                                        <Td>
                                                            <HStack spacing={2}>
                                                                <IconButton as="a" href={`${API_BASE_URL}${doc.documentUrl}`} target="_blank" size="sm" icon={<FaEye />} aria-label="View" colorScheme="blue" variant="ghost" />
                                                                <IconButton size="sm" icon={<FaTrash />} aria-label="Delete" colorScheme="red" variant="ghost" onClick={() => handleDelete(doc._id, doc.source, doc.expenseId)} />
                                                            </HStack>
                                                        </Td>
                                                    </Tr>
                                                ))}
                                                {trackingTableDocs.length === 0 && (
                                                    <Tr><Td colSpan={4} textAlign="center" py={4}>No drafted documents uploaded yet.</Td></Tr>
                                                )}
                                            </Tbody>
                                        </Table>
                                    </Box>
                                </VStack>
                                )}
                            </TabPanel>

                            {/* SECTION 3: FINAL */}
                            <TabPanel p={0}>
                                <VStack spacing={6} align="stretch">
                                    {selectedDocsForMail.length > 0 && (
                                        <Flex justify="flex-end">
                                            <Button leftIcon={<FaEnvelope />} colorScheme="purple" onClick={handleMoveToMail} isLoading={isMovingToMail}>
                                                Move Selected to Mail Folder
                                            </Button>
                                        </Flex>
                                    )}
                                    <Box overflowX="auto" borderRadius="xl" border="1px solid" borderColor="gray.100">
                                        <Table variant="simple">
                                            <Thead bg="gray.50">
                                                <Tr>
                                                    <Th w="40px">Select</Th>
                                                    <Th>Final Document</Th>
                                                    <Th>Approved By</Th>
                                                    <Th>Approval Date</Th>
                                                    <Th>Version</Th>
                                                    <Th>Actions</Th>
                                                </Tr>
                                            </Thead>
                                            <Tbody>
                                                {finalTableDocs.map(doc => (
                                                    <Tr key={doc._id} _hover={{ bg: 'gray.50' }}>
                                                        <Td>
                                                            <Checkbox 
                                                                colorScheme="purple" 
                                                                isChecked={selectedDocsForMail.some(d => d.documentId === doc._id)} 
                                                                onChange={() => handleToggleMailSelection(doc)} 
                                                            />
                                                        </Td>
                                                        <Td>
                                                            <HStack>
                                                                <Icon as={FaCheckCircle} color="green.500" w={5} h={5} />
                                                                <VStack align="start" spacing={0}>
                                                                    <Text fontWeight="bold" fontSize="sm">{renderDocumentName(doc.documentName)}</Text>
                                                                    <Text fontSize="xs" color="gray.500">{doc.site?.siteName || 'N/A'} - {doc.client?.clientName || 'N/A'}</Text>
                                                                </VStack>
                                                            </HStack>
                                                        </Td>
                                                        <Td fontSize="sm">{doc.uploadedBy || 'Admin'}</Td>
                                                        <Td fontSize="sm" fontWeight="bold" color="green.600">{formatDateTimeIST(doc.approvalDate || doc.receivedDate)}</Td>
                                                        <Td><Badge colorScheme="purple" borderRadius="full">{doc.documentName.match(/\(R(\d+)\)/) ? `Revision ${doc.documentName.match(/\(R(\d+)\)/)[1]}` : 'v1.0'}</Badge></Td>
                                                        <Td>
                                                            <HStack spacing={2}>
                                                                <IconButton as="a" href={`${API_BASE_URL}${doc.documentUrl}`} target="_blank" size="sm" icon={<FaEye />} aria-label="View" colorScheme="blue" variant="ghost" />
                                                                <IconButton size="sm" icon={<FaTrash />} aria-label="Delete" colorScheme="red" variant="ghost" onClick={() => handleDelete(doc._id, doc.source, doc.expenseId)} />
                                                            </HStack>
                                                        </Td>
                                                    </Tr>
                                                ))}
                                                {finalTableDocs.length === 0 && <Tr><Td colSpan={6} textAlign="center" py={4}>No completed documents found.</Td></Tr>}
                                            </Tbody>
                                        </Table>
                                    </Box>
                                </VStack>
                            </TabPanel>

                            {/* SECTION 4: MAIL */}
                            <TabPanel p={0}>
                                <VStack spacing={6} align="stretch">
                                    <Box overflowX="auto" borderRadius="xl" border="1px solid" borderColor="gray.100">
                                        <Table variant="simple">
                                            <Thead bg="gray.50">
                                                <Tr>
                                                    <Th>Mailed Document</Th>
                                                    <Th>Approved By</Th>
                                                    <Th>Approval Date</Th>
                                                    <Th>Version</Th>
                                                    <Th>Actions</Th>
                                                </Tr>
                                            </Thead>
                                            <Tbody>
                                                {!filterScheduleDate || !filterClient || !filterSite ? (
                                                    <Tr><Td colSpan={5} textAlign="center" py={8} color="gray.500">Please select a Schedule Date, Client, and Site to view mail folder data</Td></Tr>
                                                ) : (
                                                    <>
                                                        {Object.entries(mailGroups).map(([folderName, docs]) => (
                                                            <React.Fragment key={folderName}>
                                                                <Tr bg="purple.50">
                                                                    <Td colSpan={5}>
                                                                        <HStack>
                                                                            <Icon as={FaEnvelope} color="purple.600" />
                                                                            <Text fontWeight="bold" color="purple.800">{folderName}</Text>
                                                                            <Badge colorScheme="purple">{docs.length} Files</Badge>
                                                                        </HStack>
                                                                    </Td>
                                                                </Tr>
                                                                {docs.map(doc => (
                                                                    <Tr key={doc._id} _hover={{ bg: 'gray.50' }}>
                                                                        <Td pl={10}>
                                                                            <HStack>
                                                                                <Icon as={FaFileAlt} color="gray.400" />
                                                                                <VStack align="start" spacing={0}>
                                                                                    <Text fontSize="sm" fontWeight="bold">{renderDocumentName(doc.documentName)}</Text>
                                                                                    <Text fontSize="xs" color="gray.500">{doc.site?.siteName || 'N/A'} - {doc.client?.clientName || 'N/A'}</Text>
                                                                                </VStack>
                                                                            </HStack>
                                                                        </Td>
                                                                        <Td fontSize="sm">{doc.uploadedBy || 'Admin'}</Td>
                                                                        <Td fontSize="sm" color="green.600">{formatDateTimeIST(doc.approvalDate || doc.receivedDate)}</Td>
                                                                        <Td><Badge colorScheme="gray" borderRadius="full">{doc.documentName.match(/\(R(\d+)\)/) ? `Revision ${doc.documentName.match(/\(R(\d+)\)/)[1]}` : 'v1.0'}</Badge></Td>
                                                                        <Td>
                                                                            <HStack spacing={2}>
                                                                                <IconButton as="a" href={`${API_BASE_URL}${doc.documentUrl}`} target="_blank" size="sm" icon={<FaEye />} aria-label="View" colorScheme="blue" variant="ghost" />
                                                                            </HStack>
                                                                        </Td>
                                                                    </Tr>
                                                                ))}
                                                            </React.Fragment>
                                                        ))}
                                                        {Object.keys(mailGroups).length === 0 && <Tr><Td colSpan={5} textAlign="center" py={4}>No documents in Mail folder.</Td></Tr>}
                                                    </>
                                                )}
                                            </Tbody>
                                        </Table>
                                    </Box>
                                </VStack>
                            </TabPanel>
                        </TabPanels>
                    </Tabs>
                </Card>
            </Container>
        </Box>
    );
};

export default AdminDraftingWork;
