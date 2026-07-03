import React, { useState, useEffect } from 'react';
import {
    Box, Container, Heading, Text, Flex, VStack, HStack, Icon, Tabs, TabList, TabPanels, Tab, TabPanel, Button, Input, Select, Table, Thead, Tbody, Tr, Th, Td, Badge, IconButton, Card, CardBody, SimpleGrid, Progress, Avatar, Divider, useColorModeValue, useToast, Checkbox, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, useDisclosure, Spinner, FormControl, FormLabel
} from '@chakra-ui/react';
import {
    FaFolderOpen, FaUpload, FaSearch, FaFilter, FaEye, FaDownload, FaHistory, FaTasks, FaCheckCircle, FaClock, FaFilePdf, FaFileImage, FaFileAlt, FaTrash, FaEnvelope, FaMapMarkedAlt, FaArrowLeft
} from 'react-icons/fa';
import axios from 'axios';
import ModulePermissionBar from '../../components/admin/ModulePermissionBar';

// Use environment variable for real NAS deployment

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
const API_URL = API_BASE_URL.endsWith('/api') ? API_BASE_URL : `${API_BASE_URL}/api`;
const getCollectedDocCategory = (doc) => {
    const docType = (doc.documentType || '').toLowerCase();
    const docName = (doc.name || '').toLowerCase();
    
    // 1. Check documentType first
    if (docType.includes('photo') || docType.includes('image')) return 'Photos';
    if (docType.includes('report') || docType.includes('check')) return 'Reports';
    if (docType.includes('data') || docType.includes('csv') || docType.includes('txt') || docType.includes('tasks')) return 'Data';
    if (docType.includes('drawing') || docType.includes('dwg') || docType.includes('dxf')) return 'Drawing';

    // 2. Check filename extension
    const ext = docName.split('.').pop() || '';
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext)) return 'Photos';
    if (['dwg', 'dxf', 'dgn', 'dwf'].includes(ext)) return 'Drawing';
    if (['csv', 'xlsx', 'xls', 'txt', 'dat'].includes(ext)) return 'Data';
    if (['pdf', 'docx', 'doc'].includes(ext)) {
        if (docName.includes('report') || docName.includes('sheet') || docName.includes('check')) return 'Reports';
        if (docName.includes('drawing') || docName.includes('draft') || docName.includes('design') || docName.includes('line')) return 'Drawing';
        if (docName.includes('data') || docName.includes('point') || docName.includes('mark')) return 'Data';
        return 'Reports'; // Default for PDF/Word
    }

    return 'Reports'; // Default fallback
};

const AdminDraftingWork = ({ isInsideServices = false }) => {
    const bgColor = useColorModeValue('gray.50', 'gray.900');

    const cardBg = useColorModeValue('white', 'gray.800');
    const toast = useToast();

    const [documents, setDocuments] = useState([]);
    const [topoSurveys, setTopoSurveys] = useState([]);
    const [pointMarkings, setPointMarkings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [scheduleGroupToSelect, setScheduleGroupToSelect] = useState(null);

    const getSurveyDraftingStatus = (survey) => {
        const files = survey.draftingWorkFiles || {};
        let status = 'Pending';
        let color = 'gray';

        const hasCollected = (documents || []).some(d => {
            if (d.source !== 'EmployeeExpense') return false;
            if (!['Received', 'Done', 'Converted'].includes(d.status)) return false;
            
            const docClient = String(d.client?._id || d.client || '');
            const surClient = String(survey.client?._id || survey.client || '');
            if (docClient !== surClient) return false;
            
            const docSite = String(d.site?._id || d.site || '');
            const surSite = String(survey.site?._id || survey.site || '');
            if (docSite !== surSite) return false;

            if (String(d.expenseId) === String(survey._id) || String(d.scheduleId) === String(survey._id)) return true;

            if (!d.receivedDate && !d.uploadedAt && !d.createdAt) return false;
            if (!survey.scheduleDate) return false;
            const docDate = new Date(d.receivedDate || d.uploadedAt || d.createdAt).toISOString().split('T')[0];
            const surDate = new Date(survey.scheduleDate).toISOString().split('T')[0];
            
            return docDate === surDate;
        });

        if (files.mailFiles?.length > 0) { status = 'Mail'; color = 'red'; }
        else if (files.finalCheckingFiles?.length > 0) { status = 'Final Checking'; color = 'green'; }
        else if (files.esurveyWorkFiles?.length > 0) { status = 'eSurvey Work'; color = 'purple'; }
        else if (files.liningDrawFiles?.length > 0) { status = 'Lining Draw'; color = 'teal'; }
        else if (files.convertedFiles?.length > 0) { status = 'Converted'; color = 'orange'; }
        else if (files.collectedFiles?.length > 0 || hasCollected) { status = 'Collected Files'; color = 'blue'; }

        return { status, color };
    };
    
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
    const [selectedConvertedFileForLining, setSelectedConvertedFileForLining] = useState('');
    const [selectedLiningFileForEsurvey, setSelectedLiningFileForEsurvey] = useState('');
    const [draftingFiles, setDraftingFiles] = useState({});


    const handleSurveyClick = async (group) => {
        setScheduleGroupToSelect(group);
    };

    const handleSelectScheduleFromModal = async (group, survey) => {
        setSelectedGroup(group);
        setSelectedSurvey(survey);
        setDraftingFiles(survey.draftingWorkFiles || {});
        setSurveyReceivedDocs([]); // reset
        setScheduleGroupToSelect(null);
        
        if (survey.client?._id && survey.site?._id) {
            try {
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

    const handleScheduleChange = async (survey) => {
        setSelectedSurvey(survey);
        setDraftingFiles(survey.draftingWorkFiles || {});
        setSurveyReceivedDocs([]); // reset
        
        if (survey.client?._id && survey.site?._id) {
            try {
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

        if (category === 'liningDrawFiles' && !selectedConvertedFileForLining) {
            toast({ title: 'Please select a Converted File first', status: 'warning' });
            e.target.value = null;
            return;
        }

        if (category === 'esurveyWorkFiles' && !selectedLiningFileForEsurvey) {
            toast({ title: 'Please select a Lining Draw File first', status: 'warning' });
            e.target.value = null;
            return;
        }

        setUploadingCategory(category);
        const formData = new FormData();
        // MUST append text fields BEFORE files so backend Multer can read them for destination path!
        formData.append('clientShortId', selectedSurvey.client?.clientId || 'unknown');
        formData.append('siteSubfolder', `${selectedSurvey.site?.siteId || '0000'}-${(selectedSurvey.site?.siteName || 'unknown').replace(/\s+/g, '_')}`);
        
        if (category === 'convertedFiles' && selectedCollectedFileForConversion) {
            formData.append('originalFileId', selectedCollectedFileForConversion);
        }
        

        






        if (category === 'liningDrawFiles' && selectedConvertedFileForLining) {
            formData.append('originalFileId', selectedConvertedFileForLining);
        }

        if (category === 'esurveyWorkFiles' && selectedLiningFileForEsurvey) {
            formData.append('originalFileId', selectedLiningFileForEsurvey);
        }

        if (category === 'esurveyWorkFiles') {
            const existingFiles = [...(draftingFiles['esurveyWorkFiles'] || []).filter(d => d.originalFileId === selectedLiningFileForEsurvey)];
            const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

            Array.from(files).forEach((f) => {
                const dotIndex = f.name.lastIndexOf('.');
                const nameWithoutExt = dotIndex === -1 ? f.name : f.name.substring(0, dotIndex);
                const ext = dotIndex === -1 ? '' : f.name.substring(dotIndex);
                
                const cleanName = nameWithoutExt.replace(/\(R\d+\)$/i, '').trim();
                
                const regex = new RegExp(`^${escapeRegExp(cleanName)}(?:\\(R\\d+\\))?${escapeRegExp(ext)}$`, 'i');
                const matchingCount = existingFiles.filter(d => regex.test(d.name)).length;
                
                let newName = f.name;
                if (matchingCount > 0) {
                    newName = `${cleanName}(R${matchingCount})${ext}`;
                }
                
                const renamedFile = new File([f], newName, { type: f.type });
                existingFiles.push({ name: newName });
                
                formData.append(category, renamedFile);
            });
        } else {
            Array.from(files).forEach(f => formData.append(category, f));
        }

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
            if (e && e.target) e.target.value = null; // reset input
        }
    };

    const handleDraftingFileDelete = async (category, fileId) => {
        if (!window.confirm('Are you sure you want to delete this file?')) return;
        try {
            const res = await axios.delete(`${API_URL}/schedule-master/drafting-work/${selectedSurvey._id}/${category}/${fileId}`);
            if (res.data.success) {
                setDraftingFiles(res.data.data);
                toast({ title: 'File deleted', status: 'success' });
                fetchDrafts(); // Refresh main table
            }
        } catch (error) {
            toast({ title: 'Delete failed', status: 'error', description: error.message });
        }
    };

    const updateDraftingFileStatus = async (category, fileId, newStatus) => {
        try {
            const res = await axios.put(`${API_URL}/schedule-master/drafting-work-status/${selectedSurvey._id}/${category}/${fileId}`, { status: newStatus });
            if (res.data.success) {
                setDraftingFiles(res.data.data);
                toast({ title: 'Status updated', status: 'success' });
            }
        } catch (error) {
            toast({ title: 'Status update failed', status: 'error', description: error.message });
        }
    };

    // Fetch Drafts and Topography Surveys
    const fetchDrafts = async () => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams();
            if (filterClient) queryParams.append('client', filterClient);
            if (filterSite) queryParams.append('site', filterSite);
            
            const docsRes = await axios.get(`${API_URL}/site-master/all-documents?${queryParams.toString()}`);
            if (docsRes.data.success) {
                setDocuments(docsRes.data.data);
            }

            // Fetch Topography Surveys
            const topoRes = await axios.get(`${API_URL}/schedule-master?scheduleType=TOPOGRAPHY SURVEY`);
            if (topoRes.data.success) {
                const rawTopo = topoRes.data.data;
                const topoGroups = {};

                rawTopo.filter(s => s.dayStatus !== 'Rejected').forEach(s => {
                    if (filterClient && s.client?._id !== filterClient) return;
                    if (filterSite && s.site?._id !== filterSite) return;

                    const clientVal = s.client?._id || s.client || 'unknown-client';
                    const siteVal = s.site?._id || s.site || 'unknown-site';
                    const groupKey = `${clientVal}-${siteVal}`;
                    
                    if (!topoGroups[groupKey]) {
                        topoGroups[groupKey] = {
                            client: s.client,
                            site: s.site,
                            groupKey: groupKey,
                            schedules: []
                        };
                    }
                    topoGroups[groupKey].schedules.push(s);
                });

                const groupedTopo = Object.values(topoGroups).map(g => {
                    g.schedules.sort((a, b) => new Date(b.scheduleDate) - new Date(a.scheduleDate));
                    g.scheduleDate = g.schedules[0]?.scheduleDate;
                    return g;
                });
                
                groupedTopo.sort((a, b) => new Date(b.scheduleDate) - new Date(a.scheduleDate));
                setTopoSurveys(groupedTopo);
            }

            // Fetch Point Markings
            const pointRes = await axios.get(`${API_URL}/schedule-master?scheduleType=POINT MARKING`);
            if (pointRes.data.success) {
                const rawPoint = pointRes.data.data;
                const pointGroups = {};

                rawPoint.filter(s => s.dayStatus !== 'Rejected').forEach(s => {
                    if (filterClient && s.client?._id !== filterClient) return;
                    if (filterSite && s.site?._id !== filterSite) return;

                    const clientVal = s.client?._id || s.client || 'unknown-client';
                    const siteVal = s.site?._id || s.site || 'unknown-site';
                    const groupKey = `${clientVal}-${siteVal}`;
                    
                    if (!pointGroups[groupKey]) {
                        pointGroups[groupKey] = {
                            client: s.client,
                            site: s.site,
                            groupKey: groupKey,
                            schedules: []
                        };
                    }
                    pointGroups[groupKey].schedules.push(s);
                });

                const groupedPoint = Object.values(pointGroups).map(g => {
                    g.schedules.sort((a, b) => new Date(b.scheduleDate) - new Date(a.scheduleDate));
                    g.scheduleDate = g.schedules[0]?.scheduleDate;
                    return g;
                });
                
                groupedPoint.sort((a, b) => new Date(b.scheduleDate) - new Date(a.scheduleDate));
                setPointMarkings(groupedPoint);
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
            const [clientsRes, sitesRes] = await Promise.all([
                axios.get(`${API_URL}/client-master`),
                axios.get(`${API_URL}/site-master`)
            ]);
            if (clientsRes.data.success) setClientOptions(clientsRes.data.data);
            if (sitesRes.data.success) setSiteOptions(sitesRes.data.data);
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
                {!isInsideServices && <ModulePermissionBar moduleGroupKey="otherServicesGroup" subModuleFilterKey="draftingWork" />}
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
                </Flex>

                <Card bg={cardBg} borderRadius="2xl" shadow="sm" border="1px solid" borderColor="gray.200">
                    

                    <Tabs colorScheme="brand" variant="soft-rounded" p={4} index={activeTab} onChange={(index) => { setActiveTab(index); setSelectedSurvey(null); }}>
                        <TabList mb={4} gap={4} overflowX="auto" pb={2}>
                            <Tab borderRadius="xl" fontWeight="bold"><Icon as={FaMapMarkedAlt} mr={2} /> Topography Surveys</Tab>
                            <Tab borderRadius="xl" fontWeight="bold"><Icon as={FaMapMarkedAlt} mr={2} /> Point Marking</Tab>
                        </TabList>

                        <TabPanels>
                            {[{ title: 'Topography Surveys', list: topoSurveys }, { title: 'Point Markings', list: pointMarkings }].map((section, listIdx) => (
                                <TabPanel p={0} key={listIdx}>
                                    {!selectedSurvey ? (
                                        <VStack spacing={6} align="stretch">
                                            {loading ? (
                                                <Box textAlign="center" py={10}>
                                                    <Spinner size="xl" color="brand.500" thickness="4px" />
                                                    <Text mt={4} color="gray.500" fontWeight="bold">Fetching data...</Text>
                                                </Box>
                                            ) : (
                                            <Box overflow="hidden" w="full" borderRadius="xl" border="1px solid" borderColor="gray.100">
                                                <Table variant="simple" sx={{ 'th, td': { whiteSpace: 'normal', wordBreak: 'break-word' } }}>
                                                    <Thead bg="gray.50">
                                                        <Tr>
                                                            <Th>Client Name</Th>
                                                            <Th>Site Name</Th>
                                                            <Th whiteSpace="nowrap">Schedule Date(s)</Th>
                                                            <Th>Operative Name</Th>
                                                            <Th>Day Status</Th>
                                                            <Th>Drafting Status</Th>
                                                        </Tr>
                                                    </Thead>
                                                    <Tbody>
                                                        {section.list.map((group) => (
                                                            <Tr 
                                                                key={`${group.groupKey}`} 
                                                                _hover={{ bg: 'blue.50', cursor: 'pointer' }}
                                                                onClick={() => handleSurveyClick(group)}
                                                            >
                                                                <Td fontWeight="bold" color="blue.600">{group.client?.clientName || 'N/A'}</Td>
                                                                <Td fontWeight="bold" color="gray.700">
                                                                    <VStack align="start" spacing={0}>
                                                                        <Text>{group.site?.siteName || 'N/A'}</Text>
                                                                    </VStack>
                                                                </Td>
                                                                <Td fontSize="sm" fontWeight="medium">
                                                                    <VStack align="start" spacing={1}>
                                                                        {group.schedules.map(s => (
                                                                            <Text key={s._id} whiteSpace="nowrap">{formatIST(s.scheduleDate)}</Text>
                                                                        ))}
                                                                    </VStack>
                                                                </Td>
                                                                <Td>
                                                                    <VStack align="start" spacing={1.5}>
                                                                        {group.schedules.map(s => (
                                                                            s.operative?.name ? (
                                                                                <HStack key={s._id} spacing={1}>
                                                                                    <Avatar size="2xs" name={s.operative.name} bg="teal.500" />
                                                                                    <Text fontSize="xs" fontWeight="bold">{s.operative.name}</Text>
                                                                                </HStack>
                                                                            ) : (
                                                                                <Text key={s._id} fontSize="xs" color="gray.400">Unassigned</Text>
                                                                            )
                                                                        ))}
                                                                    </VStack>
                                                                </Td>
                                                                <Td>
                                                                    <VStack align="start" spacing={1.5}>
                                                                        {group.schedules.map(s => (
                                                                            <Badge key={s._id} colorScheme={s.dayStatus === 'Completed' ? 'green' : 'orange'} borderRadius="full" fontSize="2xs">
                                                                                {s.dayStatus || 'Scheduled'}
                                                                            </Badge>
                                                                        ))}
                                                                    </VStack>
                                                                </Td>
                                                                <Td>
                                                                    <VStack align="start" spacing={1.5}>
                                                                        {group.schedules.map(s => {
                                                                            const files = s.draftingWorkFiles || {};
                                                                            let status = 'Pending';
                                                                            let color = 'gray';

                                                                            const hasCollected = (documents || []).some(d => {
                                                                                if (d.source !== 'EmployeeExpense') return false;
                                                                                if (!['Received', 'Done', 'Converted'].includes(d.status)) return false;
                                                                                
                                                                                const docClient = String(d.client?._id || d.client || '');
                                                                                const surClient = String(s.client?._id || s.client || '');
                                                                                if (docClient !== surClient) return false;
                                                                                
                                                                                const docSite = String(d.site?._id || d.site || '');
                                                                                const surSite = String(s.site?._id || s.site || '');
                                                                                if (docSite !== surSite) return false;

                                                                                if (String(d.expenseId) === String(s._id) || String(d.scheduleId) === String(s._id)) return true;

                                                                                if (!d.receivedDate && !d.uploadedAt && !d.createdAt) return false;
                                                                                if (!s.scheduleDate) return false;
                                                                                const docDate = new Date(d.receivedDate || d.uploadedAt || d.createdAt).toISOString().split('T')[0];
                                                                                const surDate = new Date(s.scheduleDate).toISOString().split('T')[0];
                                                                                
                                                                                return docDate === surDate;
                                                                            });

                                                                            if (files.mailFiles?.length > 0) { status = 'Mail'; color = 'red'; }
                                                                            else if (files.finalCheckingFiles?.length > 0) { status = 'Final Checking'; color = 'green'; }
                                                                            else if (files.esurveyWorkFiles?.length > 0) { status = 'eSurvey Work'; color = 'purple'; }
                                                                            else if (files.liningDrawFiles?.length > 0) { status = 'Lining Draw'; color = 'teal'; }
                                                                            else if (files.convertedFiles?.length > 0) { status = 'Converted'; color = 'orange'; }
                                                                            else if (files.collectedFiles?.length > 0 || hasCollected) { status = 'Collected Files'; color = 'blue'; }

                                                                            const matches = (documents || []).filter(d => String(d.site?._id || d.site || '') === String(s.site?._id || s.site || ''));
                                                                            return (
                                                                                <Badge key={s._id} colorScheme={color} borderRadius="full" fontSize="2xs">
                                                                                    {status} {status === 'Pending' ? `(Docs:${documents?.length}, SiteMatch:${matches.length})` : ''}
                                                                                </Badge>
                                                                            );
                                                                        })}
                                                                    </VStack>
                                                                </Td>
                                                            </Tr>
                                                        ))}
                                                        {section.list.length === 0 && (
                                                            <Tr><Td colSpan={6} textAlign="center" py={8} color="gray.500">No {section.title} found.</Td></Tr>
                                                        )}
                                                    </Tbody>
                                                </Table>
                                            </Box>
                                            )}
                                        </VStack>
                                    ) : (
                                        <Box p={4} border="1px solid" borderColor="gray.200" borderRadius="xl" bg="white" shadow="sm">
                                            <Flex justify="space-between" align="center" mb={6} flexWrap="wrap" gap={4}>
                                                <HStack spacing={4}>
                                                    <IconButton icon={<FaArrowLeft />} onClick={() => { setSelectedSurvey(null); setSelectedGroup(null); }} borderRadius="full" aria-label="Back" />
                                                    <VStack align="start" spacing={0}>
                                                        <Heading size="md" color="blue.700">{selectedSurvey.client?.clientName} - {selectedSurvey.site?.siteName}</Heading>
                                                        <Text fontSize="sm" color="gray.500">Workspace • Active Job Date: {formatIST(selectedSurvey.scheduleDate)}</Text>
                                                    </VStack>
                                                </HStack>

                                                {selectedGroup && selectedGroup.schedules.length > 1 && (
                                                    <HStack spacing={2} bg="blue.50" p={2} borderRadius="xl" border="1px solid" borderColor="blue.100">
                                                        <Text fontSize="sm" fontWeight="bold" color="blue.700">Select Job / Schedule ID:</Text>
                                                        <Select
                                                            size="sm"
                                                            w="240px"
                                                            bg="white"
                                                            value={selectedSurvey._id}
                                                            onChange={e => {
                                                                const chosen = selectedGroup.schedules.find(s => s._id === e.target.value);
                                                                if (chosen) handleScheduleChange(chosen);
                                                            }}
                                                        >
                                                            {selectedGroup.schedules.map(s => (
                                                                <option key={s._id} value={s._id}>
                                                                    {formatIST(s.scheduleDate)} ({s.operative?.name || 'Unassigned'})
                                                                </option>
                                                            ))}
                                                        </Select>
                                                    </HStack>
                                                )}
                                            </Flex>

                                            <Tabs variant="enclosed" colorScheme="blue">
                                                <TabList mb={4} overflowX="auto" whiteSpace="nowrap">
                                                    <Tab fontWeight="bold" color="blue.600">1. Collected Files</Tab>
                                                    <Tab fontWeight="bold" color="orange.600">2. Converted</Tab>
                                                    <Tab fontWeight="bold" color="teal.600">3. Lining Draw</Tab>
                                                    <Tab fontWeight="bold" color="purple.600">4. eSurvey Work</Tab>
                                                    <Tab fontWeight="bold" color="green.600">5. Final Checking</Tab>
                                                    <Tab fontWeight="bold" color="red.600">6. Mail</Tab>
                                                </TabList>
                                                
                                                <TabPanels>
                                                    {[
                                                        { key: 'collectedFiles', color: 'blue' },
                                                        { key: 'convertedFiles', color: 'orange' },
                                                        { key: 'liningDrawFiles', color: 'teal' },
                                                        { key: 'esurveyWorkFiles', color: 'purple' },
                                                        { key: 'finalCheckingFiles', color: 'green' },
                                                        { key: 'mailFiles', color: 'red' }
                                                    ].map((step, idx) => (
                                                        <TabPanel key={step.key} p={0}>
                                                            <Card border="1px solid" borderColor={`${step.color}.200`} shadow="none" borderRadius="xl" bg={`${step.color}.50`}>
                                                                <CardBody p={6}>
                                                                    <VStack align="stretch" spacing={6}>
                                                                        
                                                                        {(step.key !== 'collectedFiles' && step.key !== 'finalCheckingFiles' && step.key !== 'mailFiles') && (
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
                                                                                            {(surveyReceivedDocs || []).filter(doc => getCollectedDocCategory(doc) !== 'Photos').map(doc => (
                                                                                                <option key={doc._id} value={doc._id}>{doc.name}</option>
                                                                                            ))}
                                                                                        </Select>
                                                                                    </FormControl>
                                                                                )}
                                                                                
                                                                                {step.key === 'liningDrawFiles' && (
                                                                                    <FormControl>
                                                                                        <FormLabel fontSize="sm" fontWeight="bold" color="teal.700">2. Select Converted File</FormLabel>
                                                                                        <Select 
                                                                                            placeholder="-- Select a converted file to draw lining --" 
                                                                                            value={selectedConvertedFileForLining} 
                                                                                            onChange={e => setSelectedConvertedFileForLining(e.target.value)}
                                                                                            bg="white"
                                                                                            borderColor="teal.300"
                                                                                        >
                                                                                            {(draftingFiles['convertedFiles'] || []).map(doc => (
                                                                                                <option key={doc._id} value={doc._id}>{doc.name}</option>
                                                                                            ))}
                                                                                        </Select>
                                                                                    </FormControl>
                                                                                )}
                                                                                
                                                                                {step.key === 'esurveyWorkFiles' && (
                                                                                    <FormControl>
                                                                                        <FormLabel fontSize="sm" fontWeight="bold" color="purple.700">3. Select Lining Draw File</FormLabel>
                                                                                        <Select 
                                                                                            placeholder="-- Select a lining draw file for eSurvey --" 
                                                                                            value={selectedLiningFileForEsurvey} 
                                                                                            onChange={e => setSelectedLiningFileForEsurvey(e.target.value)}
                                                                                            bg="white"
                                                                                            borderColor="purple.300"
                                                                                        >
                                                                                            {(draftingFiles['liningDrawFiles'] || []).filter(d => d.status === 'Approved').map(doc => (
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
                                                                                    _hover={((!selectedCollectedFileForConversion && step.key === 'convertedFiles') || (!selectedConvertedFileForLining && step.key === 'liningDrawFiles') || (!selectedLiningFileForEsurvey && step.key === 'esurveyWorkFiles')) ? {} : { bg: `${step.color}.50` }} 
                                                                                    transition="all 0.2s"
                                                                                    opacity={((!selectedCollectedFileForConversion && step.key === 'convertedFiles') || (!selectedConvertedFileForLining && step.key === 'liningDrawFiles') || (!selectedLiningFileForEsurvey && step.key === 'esurveyWorkFiles')) ? 0.5 : 1}
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
                                                                                        cursor={((!selectedCollectedFileForConversion && step.key === 'convertedFiles') || (!selectedConvertedFileForLining && step.key === 'liningDrawFiles') || (!selectedLiningFileForEsurvey && step.key === 'esurveyWorkFiles')) ? 'not-allowed' : 'pointer'} 
                                                                                        onChange={(e) => handleDraftingFileUpload(e, step.key)} 
                                                                                        disabled={uploadingCategory === step.key || (!selectedCollectedFileForConversion && step.key === 'convertedFiles') || (!selectedConvertedFileForLining && step.key === 'liningDrawFiles') || (!selectedLiningFileForEsurvey && step.key === 'esurveyWorkFiles')} 
                                                                                    />
                                                                                    <Icon as={FaUpload} color={`${step.color}.500`} w={8} h={8} mb={2} />
                                                                                    <Text fontSize="md" fontWeight="bold" color={`${step.color}.700`}>
                                                                                        {((!selectedCollectedFileForConversion && step.key === 'convertedFiles') || (!selectedConvertedFileForLining && step.key === 'liningDrawFiles') || (!selectedLiningFileForEsurvey && step.key === 'esurveyWorkFiles')) ? 'Select a file above first' : 'Drag & Drop or Click to Upload'}
                                                                                    </Text>
                                                                                    {uploadingCategory === step.key && <Spinner size="md" color={`${step.color}.500`} mt={4} />}
                                                                                </Box>
                                                                            </VStack>
                                                                        )}                                                                        <Box>
                                                                            <Text fontWeight="bold" mb={3} color="gray.700">Uploaded Documents</Text>
                                                                            {step.key === 'collectedFiles' ? (
                                                                                <VStack align="stretch" spacing={6} maxH="500px" overflowY="auto" pr={2}>
                                                                                    {['Photos', 'Reports', 'Data', 'Drawing'].map(cat => {
                                                                                        const catFiles = (surveyReceivedDocs || []).filter(d => getCollectedDocCategory(d) === cat);
                                                                                        let catColor = 'blue';
                                                                                        let catIcon = FaFileImage;
                                                                                        if (cat === 'Reports') { catColor = 'green'; catIcon = FaFilePdf; }
                                                                                        if (cat === 'Data') { catColor = 'purple'; catIcon = FaTasks; }
                                                                                        if (cat === 'Drawing') { catColor = 'teal'; catIcon = FaFolderOpen; }

                                                                                        return (
                                                                                            <Box key={cat} p={4} borderRadius="xl" bg="gray.50" border="1px solid" borderColor="gray.200">
                                                                                                <HStack mb={3} justify="space-between">
                                                                                                    <HStack spacing={2}>
                                                                                                        <Icon as={catIcon} color={`${catColor}.500`} w={5} h={5} />
                                                                                                        <Text fontWeight="extrabold" color={`${catColor}.700`}>{cat} ({catFiles.length})</Text>
                                                                                                    </HStack>
                                                                                                </HStack>
                                                                                                
                                                                                                {catFiles.length > 0 ? (
                                                                                                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                                                                                                        {catFiles.map((file, fIdx) => (
                                                                                                            <Flex key={file._id || fIdx} bg="white" p={3} borderRadius="lg" border="1px solid" borderColor="gray.200" align="center" justify="space-between" shadow="sm">
                                                                                                                <HStack overflow="hidden" spacing={3} flex={1}>
                                                                                                                    <Icon as={catIcon} color={`${catColor}.400`} w={5} h={5} />
                                                                                                                    <VStack align="start" spacing={0} flex={1} overflow="hidden">
                                                                                                                        <Text fontSize="xs" fontWeight="bold" color="gray.700" isTruncated maxW="100%" title={file.name}>
                                                                                                                            {file.name}
                                                                                                                        </Text>
                                                                                                                        <Text fontSize="2xs" color="gray.400">
                                                                                                                            Uploaded: {file.uploadedAt ? formatIST(file.uploadedAt) : 'N/A'}
                                                                                                                        </Text>
                                                                                                                    </VStack>
                                                                                                                </HStack>
                                                                                                                <IconButton 
                                                                                                                    as="a" 
                                                                                                                    href={`${API_BASE_URL}${file.url}`} 
                                                                                                                    target="_blank" 
                                                                                                                    icon={<FaEye />} 
                                                                                                                    size="xs" 
                                                                                                                    colorScheme="blue" 
                                                                                                                    variant="ghost" 
                                                                                                                    borderRadius="full" 
                                                                                                                    title="View"
                                                                                                                />
                                                                                                            </Flex>
                                                                                                        ))}
                                                                                                    </SimpleGrid>
                                                                                                ) : (
                                                                                                    <Text fontSize="xs" color="gray.400" fontStyle="italic" pl={7}>No {cat.toLowerCase()} uploaded yet.</Text>
                                                                                                )}
                                                                                            </Box>
                                                                                        );
                                                                                    })}
                                                                                </VStack>
                                                                            ) : (
                                                                                <VStack align="stretch" spacing={3} maxH="400px" overflowY="auto" pr={2}>
                                                                                    {(() => {
                                                                                        const filesToRender = draftingFiles[step.key] || [];
                                                                                        return (
                                                                                            <>
                                                                                                {filesToRender.map((file, fIdx) => (
                                                                                                    <Flex key={file._id || fIdx} bg="white" p={3} borderRadius="lg" border="1px solid" borderColor="gray.200" align="center" justify="space-between" shadow="sm">
                                                                                                        <HStack overflow="hidden" spacing={4} flex={1}>
                                                                                                            <Icon as={FaFilePdf} color="red.500" w={6} h={6} />
                                                                                                            <VStack align="start" spacing={0} flex={1} overflow="hidden">
                                                                                                                <Text fontSize="sm" fontWeight="bold" color="gray.700" isTruncated maxW="100%" title={file.name}>
                                                                                                                    {(() => {
                                                                                                                        const rMatch = file.name?.match(/(\(R\d+\))/i);
                                                                                                                        if (rMatch) {
                                                                                                                            const idx = file.name.indexOf(rMatch[0]);
                                                                                                                            return (
                                                                                                                                <>
                                                                                                                                    {file.name.substring(0, idx)}
                                                                                                                                    <Text as="span" color="red.500">{rMatch[0]}</Text>
                                                                                                                                    {file.name.substring(idx + rMatch[0].length)}
                                                                                                                                </>
                                                                                                                            );
                                                                                                                        }
                                                                                                                        return file.name;
                                                                                                                    })()}
                                                                                                                </Text>
                                                                                                                {step.key === 'convertedFiles' && file.originalFileId && (
                                                                                                                    <HStack spacing={1} mt={0.5} title={`Mapped to: ${surveyReceivedDocs?.find(d => d._id === file.originalFileId)?.name || 'Unknown File'}`}>
                                                                                                                        <Icon as={FaFileAlt} w={3} h={3} color="orange.400" />
                                                                                                                        <Text fontSize="xs" color="orange.600" fontWeight="bold" isTruncated maxW="100%">
                                                                                                                            Mapped: {surveyReceivedDocs?.find(d => d._id === file.originalFileId)?.name || 'Unknown File'}
                                                                                                                        </Text>
                                                                                                                    </HStack>
                                                                                                                )}
                                                                                                                {step.key === 'liningDrawFiles' && file.originalFileId && (
                                                                                                                    <HStack spacing={1} mt={0.5} title={`Mapped to: ${(draftingFiles['convertedFiles'] || []).find(d => d._id === file.originalFileId)?.name || 'Unknown File'}`}>
                                                                                                                        <Icon as={FaFileAlt} w={3} h={3} color="teal.400" />
                                                                                                                        <Text fontSize="xs" color="teal.600" fontWeight="bold" isTruncated maxW="100%">
                                                                                                                            Mapped: {(draftingFiles['convertedFiles'] || []).find(d => d._id === file.originalFileId)?.name || 'Unknown File'}
                                                                                                                        </Text>
                                                                                                                    </HStack>
                                                                                                                )}
                                                                                                                {step.key === 'esurveyWorkFiles' && file.originalFileId && (
                                                                                                                    <HStack spacing={1} mt={0.5} title={`Mapped to: ${(draftingFiles['liningDrawFiles'] || []).find(d => d._id === file.originalFileId)?.name || 'Unknown File'}`}>
                                                                                                                        <Icon as={FaFileAlt} w={3} h={3} color="purple.400" />
                                                                                                                        <Text fontSize="xs" color="purple.600" fontWeight="bold" isTruncated maxW="100%">
                                                                                                                            Mapped: {(draftingFiles['liningDrawFiles'] || []).find(d => d._id === file.originalFileId)?.name || 'Unknown File'}
                                                                                                                        </Text>
                                                                                                                    </HStack>
                                                                                                                )}
                                                                                                            </VStack>
                                                                                                        </HStack>
                                                                                                        
                                                                                                        <HStack spacing={1}>
                                                                                                            <Select 
                                                                                                                size="xs" 
                                                                                                                w="120px" 
                                                                                                                value={file.status || 'Pending'} 
                                                                                                                onChange={(e) => updateDraftingFileStatus(step.key, file._id, e.target.value)}
                                                                                                                bg="white"
                                                                                                                borderRadius="md"
                                                                                                            >
                                                                                                                <option value="Pending">Pending</option>
                                                                                                                <option value="Approved">Approved</option>
                                                                                                                <option value="Rejected">Rejected</option>
                                                                                                            </Select>
                                                                                                            <IconButton 
                                                                                                                as="a" 
                                                                                                                href={`${API_BASE_URL}${file.url}`} 
                                                                                                                target="_blank" 
                                                                                                                icon={<FaEye />} 
                                                                                                                size="sm" 
                                                                                                                colorScheme="blue" 
                                                                                                                variant="ghost" 
                                                                                                                borderRadius="full" 
                                                                                                                title="View"
                                                                                                            />
                                                                                                            <IconButton 
                                                                                                                icon={<FaTrash />} 
                                                                                                                size="sm" 
                                                                                                                colorScheme="red" 
                                                                                                                variant="ghost" 
                                                                                                                borderRadius="full" 
                                                                                                                onClick={() => handleDraftingFileDelete(step.key, file._id)}
                                                                                                                title="Delete"
                                                                                                            />
                                                                                                        </HStack>
                                                                                                    </Flex>
                                                                                                ))}
                                                                                                {filesToRender.length === 0 && (
                                                                                                    <Text fontSize="sm" color="gray.400" fontStyle="italic">No files in this category yet.</Text>
                                                                                                )}
                                                                                            </>
                                                                                        );
                                                                                    })()}
                                                                                </VStack>
                                                                            )}
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
                            ))}
                        </TabPanels>
                    </Tabs>
                </Card>

                {/* Schedule Selector Modal */}
                <Modal isOpen={!!scheduleGroupToSelect} onClose={() => setScheduleGroupToSelect(null)} size="lg" isCentered>
                    <ModalOverlay />
                    <ModalContent borderRadius="2xl">
                        <ModalHeader borderBottom="1px solid" borderColor="gray.100">
                            <VStack align="start" spacing={1}>
                                <Text fontSize="xs" color="gray.400" fontWeight="bold">SELECT JOB / SCHEDULE</Text>
                                <Heading size="md" color="blue.700">
                                    {scheduleGroupToSelect?.client?.clientName} - {scheduleGroupToSelect?.site?.siteName}
                                </Heading>
                            </VStack>
                        </ModalHeader>
                        <ModalCloseButton />
                        <ModalBody py={4}>
                            <VStack align="stretch" spacing={3}>
                                {scheduleGroupToSelect?.schedules.map((s, idx) => {
                                    const { status, color } = getSurveyDraftingStatus(s);
                                    return (
                                        <Box
                                            key={s._id}
                                            p={4}
                                            border="1px solid"
                                            borderColor="gray.200"
                                            borderRadius="xl"
                                            cursor="pointer"
                                            _hover={{ bg: 'blue.50', borderColor: 'blue.300', transform: 'translateY(-2px)' }}
                                            transition="all 0.2s"
                                            onClick={() => handleSelectScheduleFromModal(scheduleGroupToSelect, s)}
                                            shadow="sm"
                                        >
                                            <Flex justify="space-between" align="center">
                                                <VStack align="start" spacing={1}>
                                                    <Text fontWeight="bold" color="gray.800" fontSize="md">
                                                        {formatIST(s.scheduleDate)}
                                                    </Text>
                                                    <HStack spacing={1}>
                                                        <Avatar size="2xs" name={s.operative?.name} bg="teal.500" />
                                                        <Text fontSize="xs" color="gray.600" fontWeight="semibold">
                                                            {s.operative?.name || 'Unassigned'}
                                                        </Text>
                                                    </HStack>
                                                </VStack>
                                                <VStack align="end" spacing={1}>
                                                    <Badge colorScheme={s.dayStatus === 'Completed' ? 'green' : 'orange'} borderRadius="full" fontSize="2xs">
                                                        Day Status: {s.dayStatus || 'Scheduled'}
                                                    </Badge>
                                                    <Badge colorScheme={color} borderRadius="full" fontSize="2xs">
                                                        Drafting: {status}
                                                    </Badge>
                                                </VStack>
                                            </Flex>
                                        </Box>
                                    );
                                })}
                            </VStack>
                        </ModalBody>
                        <ModalFooter borderTop="1px solid" borderColor="gray.100">
                            <Button onClick={() => setScheduleGroupToSelect(null)} borderRadius="xl">
                                Cancel
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>
            </Container>
        </Box>
    );
};

export default AdminDraftingWork;
