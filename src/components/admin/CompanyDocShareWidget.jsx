import React, { useState, useEffect } from 'react';
import {
    Box, Flex, HStack, VStack, Text, Heading, Button, IconButton,
    Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter,
    ModalCloseButton, useDisclosure, FormControl, FormLabel, Input, Select,
    Checkbox, Badge, Spinner, useToast, Icon, Tooltip, Divider, Textarea,
    SimpleGrid, Card, CardBody
} from '@chakra-ui/react';
import {
    FaWhatsapp, FaBuilding, FaQrcode, FaEye, FaCheckCircle,
    FaIdCard, FaFileInvoice, FaFileAlt, FaBook, FaFilePdf
} from 'react-icons/fa';
import { FiPhone, FiUser, FiSend, FiX, FiCheck, FiBriefcase } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { hasPermission } from '../../utils/permissions';
import api from '../../api/axios';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001')
    .replace(/\/api\/?$/, '')
    .replace(/\/$/, '');

const CompanyDocShareWidget = ({ isFloating = true, customButton = null }) => {
    const { user } = useAuth();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const toast = useToast();

    // Data states
    const [companies, setCompanies] = useState([]);
    const [globalCatalogs, setGlobalCatalogs] = useState([]);
    const [isLoadingData, setIsLoadingData] = useState(false);

    // Selection states
    const [selectedCompanyId, setSelectedCompanyId] = useState('');
    const [selectedCompany, setSelectedCompany] = useState(null);

    // Document checkbox states: key -> boolean
    const [selectedDocs, setSelectedDocs] = useState({
        gstDoc: false,
        udyamDoc: false,
        panCardDoc: false,
        paymentQrDoc: false,
        visitingCard: false,
        cancelledChequeDoc: false
    });

    // Company-wise Catalogs selection: Set of catalog _ids
    const [selectedCatalogs, setSelectedCatalogs] = useState(new Set());

    // Recipient & WhatsApp form states
    const [recipientPhone, setRecipientPhone] = useState('');
    const [recipientName, setRecipientName] = useState('');
    const [recipientCompanyName, setRecipientCompanyName] = useState('');
    const [recipientEmail, setRecipientEmail] = useState('');
    const [recipientGst, setRecipientGst] = useState('');
    const [recipientAddress, setRecipientAddress] = useState('');
    const [customMessage, setCustomMessage] = useState('');

    const [isCheckingPhone, setIsCheckingPhone] = useState(false);
    const [clientAutoFilled, setClientAutoFilled] = useState(false);
    const [isSending, setIsSending] = useState(false);

    // Fetch companies, types & catalogs when modal opens
    useEffect(() => {
        if (isOpen && user?.isAdmin) {
            fetchCompanies();
        }
    }, [isOpen, user?.isAdmin]);

    const fetchCompanies = async () => {
        setIsLoadingData(true);
        try {
            const [compRes, catRes] = await Promise.all([
                api.get('/company-master'),
                api.get('/catalogs').catch(() => ({ data: { data: [] } }))
            ]);

            const compList = compRes.data?.data || [];
            setCompanies(compList);
            setGlobalCatalogs(catRes.data?.data || []);

            if (compList.length === 1 && !selectedCompanyId) {
                setSelectedCompanyId(compList[0]._id);
                setSelectedCompany(compList[0]);
            }
        } catch (error) {
            console.error('Failed to load companies:', error);
            toast({
                title: 'Error loading companies',
                description: error.response?.data?.message || error.message,
                status: 'error',
                duration: 3000
            });
        } finally {
            setIsLoadingData(false);
        }
    };

    // Helper: Deduplicated Catalogs belonging to the selected company
    const getCompanyCatalogs = (comp) => {
        if (!comp) return [];
        const list = Array.isArray(comp.catalogs) && comp.catalogs.length > 0
            ? comp.catalogs
            : globalCatalogs.filter(cat =>
                comp.companyName &&
                cat.description &&
                cat.description.toLowerCase().includes(comp.companyName.toLowerCase().trim())
            );
        const seenUrls = new Set();
        const seenTitles = new Set();
        const unique = [];
        for (const c of list) {
            const url = c.url || c.pdfUrl;
            if (!url) continue;
            const cleanUrl = url.trim().toLowerCase();
            const cleanTitle = (c.title || '').trim().toLowerCase();
            if (seenUrls.has(cleanUrl) || seenTitles.has(cleanTitle)) continue;
            seenUrls.add(cleanUrl);
            seenTitles.add(cleanTitle);
            unique.push({
                _id: c._id || `cat_${cleanUrl}`,
                title: c.title || 'Product Catalog',
                url: url,
                pdfUrl: url,
                fileSize: c.fileSize || ''
            });
        }
        return unique;
    };

    const getFullDocUrl = (path) => {
        if (!path) return '';
        if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('blob:')) return path;
        const cleanPath = path.startsWith('/') ? path : '/' + path;
        return `${API_BASE_URL}${cleanPath}`;
    };

    // When company selection changes
    const handleCompanyChange = (compId) => {
        setSelectedCompanyId(compId);
        const comp = companies.find(c => c._id === compId) || null;
        setSelectedCompany(comp);
        resetDocSelections();
    };

    const resetDocSelections = () => {
        setSelectedDocs({
            gstDoc: false,
            udyamDoc: false,
            panCardDoc: false,
            paymentQrDoc: false,
            visitingCard: false,
            cancelledChequeDoc: false
        });
        setSelectedCatalogs(new Set());
    };

    // Toggle document checkbox
    const handleDocToggle = (docKey) => {
        setSelectedDocs(prev => ({ ...prev, [docKey]: !prev[docKey] }));
    };

    // Toggle catalog checkbox
    const handleCatalogToggle = (catId) => {
        setSelectedCatalogs(prev => {
            const next = new Set(prev);
            if (next.has(catId)) next.delete(catId);
            else next.add(catId);
            return next;
        });
    };

    // Select/Deselect statutory documents
    const handleSelectAllDocs = (select) => {
        if (!selectedCompany) return;
        setSelectedDocs({
            gstDoc: select && !!selectedCompany.gstDoc,
            udyamDoc: select && !!selectedCompany.udyamDoc,
            panCardDoc: select && !!selectedCompany.panCardDoc,
            paymentQrDoc: select && !!selectedCompany.paymentQrDoc,
            visitingCard: select && !!selectedCompany.visitingCard,
            cancelledChequeDoc: select && !!selectedCompany.cancelledChequeDoc
        });
    };

    // Select/Deselect all catalogs for current company
    const handleSelectAllCatalogs = (select) => {
        if (!selectedCompany) return;
        if (!select) {
            setSelectedCatalogs(new Set());
        } else {
            const compCats = getCompanyCatalogs(selectedCompany);
            setSelectedCatalogs(new Set(compCats.map(c => c._id)));
        }
    };

    // Select/Deselect both documents and catalogs
    const handleSelectAllTotal = (select) => {
        handleSelectAllDocs(select);
        handleSelectAllCatalogs(select);
    };

    // Selection counts
    const selectedDocCount = Object.values(selectedDocs).filter(Boolean).length;
    const selectedCatalogCount = selectedCatalogs.size;
    const totalSelectedCount = selectedDocCount + selectedCatalogCount;
    const currentCompanyCatalogs = getCompanyCatalogs(selectedCompany);

    // Live phone number lookup
    const handlePhoneChange = async (e) => {
        const rawDigits = e.target.value.replace(/\D/g, '');
        const clean10 = rawDigits.slice(-10);
        setRecipientPhone(clean10);

        if (clientAutoFilled) {
            setRecipientName('');
            setRecipientCompanyName('');
            setRecipientEmail('');
            setRecipientGst('');
            setRecipientAddress('');
            setClientAutoFilled(false);
        }

        if (clean10.length === 10) {
            setIsCheckingPhone(true);
            try {
                const res = await api.get(`/auth/phone/${clean10}`);
                const u = res.data?.user || res.data;
                if (u && (u._id || u.phone)) {
                    setRecipientName(u.name || u.contactPersonName || '');
                    setRecipientCompanyName(u.companyName || '');
                    setRecipientEmail(u.email && !u.email.includes('noemail') ? u.email : '');
                    setRecipientGst(u.gstNumber || '');
                    setRecipientAddress(u.address || u.clientAddress || '');
                    setClientAutoFilled(true);
                    toast({
                        title: '✓ Client Found!',
                        description: `Details auto-filled for ${u.name || u.companyName || 'Client'}.`,
                        status: 'info',
                        duration: 2500,
                        isClosable: true
                    });
                }
            } catch {
                // not found - manual entry
            } finally {
                setIsCheckingPhone(false);
            }
        }
    };

    // Format optional custom message (strictly no company profile or bank details text)
    const buildMessageText = (comp) => {
        if (customMessage.trim()) {
            return customMessage.trim();
        }
        return '';
    };

    const canWriteDocWhatsapp = hasPermission(user, 'docWhatsapp', 'write') ||
        (user?.permissions?.docWhatsapp === undefined && (user?.isSuperAdmin || hasPermission(user, 'enquiries', 'write')));

    // Dispatch via WhatsApp API
    const handleSendWhatsApp = async () => {
        if (!canWriteDocWhatsapp) {
            return toast({
                title: 'Permission Denied',
                description: 'You do not have write permission for Doc WhatsApp.',
                status: 'error',
                duration: 3000
            });
        }
        const cleanPhone = recipientPhone.replace(/\D/g, '').slice(-10);
        if (cleanPhone.length !== 10) {
            return toast({
                title: 'Invalid Mobile Number',
                description: 'Please enter a valid 10-digit mobile number.',
                status: 'warning',
                duration: 2500
            });
        }

        if (!selectedCompany) {
            return toast({
                title: 'Select a Company',
                description: 'Please select a company first.',
                status: 'warning',
                duration: 2500
            });
        }

        if (totalSelectedCount === 0) {
            return toast({
                title: 'No Documents or Catalogs Selected',
                description: 'Please select at least one document or catalog checkbox to send.',
                status: 'warning',
                duration: 2500
            });
        }

        const comp = selectedCompany;
        const filesToSend = [];
        const titlesToSend = [];

        // 1. Statutory Credentials
        if (selectedDocs.gstDoc && comp.gstDoc) {
            filesToSend.push(comp.gstDoc);
            titlesToSend.push(`GST Registration Certificate - ${comp.companyName}`);
        }
        if (selectedDocs.udyamDoc && comp.udyamDoc) {
            filesToSend.push(comp.udyamDoc);
            titlesToSend.push(`Udyam Registration Certificate - ${comp.companyName}`);
        }
        if (selectedDocs.panCardDoc && comp.panCardDoc) {
            filesToSend.push(comp.panCardDoc);
            titlesToSend.push(`PAN Card Document - ${comp.companyName}`);
        }
        if (selectedDocs.paymentQrDoc && comp.paymentQrDoc) {
            filesToSend.push(comp.paymentQrDoc);
            titlesToSend.push(`Official Payment QR Code - ${comp.companyName}`);
        }
        if (selectedDocs.visitingCard && comp.visitingCard) {
            filesToSend.push(comp.visitingCard);
            titlesToSend.push(`Company Visiting Card - ${comp.companyName}`);
        }
        if (selectedDocs.cancelledChequeDoc && comp.cancelledChequeDoc) {
            filesToSend.push(comp.cancelledChequeDoc);
            titlesToSend.push(`Cancelled Cheque - ${comp.companyName}`);
        }

        // 2. Company-Wise Product Catalogs
        currentCompanyCatalogs.forEach(cat => {
            if (selectedCatalogs.has(cat._id)) {
                const catUrl = cat.url || cat.pdfUrl;
                if (catUrl) {
                    filesToSend.push(catUrl);
                    titlesToSend.push(`${cat.title} - ${comp.companyName}`);
                }
            }
        });

        setIsSending(true);
        try {
            const messageCaption = buildMessageText(comp);
            const payload = {
                phone: cleanPhone,
                companyName: recipientCompanyName.trim() || comp.companyName,
                contactPersonName: recipientName.trim(),
                email: recipientEmail.trim(),
                gstNumber: recipientGst.trim().toUpperCase(),
                address: recipientAddress.trim(),
                pdfUrls: filesToSend,
                catalogTitles: titlesToSend,
                message: messageCaption,
                senderCompanyName: comp.companyName,
                senderCompanyId: comp._id,
                sentByName: user?.name || user?.contactPersonName || user?.email || 'Admin',
                sentById: user?.id || user?._id || null
            };

            const res = await api.post('/whatsapp/send-company-docs', payload);
            if (res.data?.success) {
                toast({
                    title: '🚀 Dispatched Successfully!',
                    description: `Sent ${filesToSend.length} item(s) (${selectedDocCount} document(s), ${selectedCatalogCount} catalog(s)) to +91 ${cleanPhone} on WhatsApp & synced with Google Contacts.`,
                    status: 'success',
                    duration: 4000,
                    isClosable: true
                });
                onClose();
                // Reset form
                setRecipientPhone('');
                setRecipientName('');
                setRecipientCompanyName('');
                setRecipientEmail('');
                setRecipientGst('');
                setRecipientAddress('');
                setCustomMessage('');
                resetDocSelections();
            } else {
                throw new Error(res.data?.error || 'Failed to dispatch WhatsApp message');
            }
        } catch (err) {
            console.error('WhatsApp send error:', err);
            toast({
                title: 'Send Failed',
                description: err.response?.data?.error || err.message,
                status: 'error',
                duration: 4000,
                isClosable: true
            });
        } finally {
            setIsSending(false);
        }
    };

    // Only render for admins with write access to Doc WhatsApp
    if (!user?.isAdmin || !canWriteDocWhatsapp) return null;

    // Document Definition List for mapping
    const docDefinitions = [
        {
            key: 'gstDoc',
            num: 1,
            label: 'GST Certificate',
            docPath: selectedCompany?.gstDoc,
            extra: selectedCompany?.gstin ? `GSTIN: ${selectedCompany.gstin}` : null,
            color: 'green',
            icon: FaFileInvoice
        },
        {
            key: 'udyamDoc',
            num: 2,
            label: 'Udyam Certificate',
            docPath: selectedCompany?.udyamDoc,
            extra: selectedCompany?.udyamNumber ? `Udyam: ${selectedCompany.udyamNumber}` : null,
            color: 'blue',
            icon: FaFileAlt
        },
        {
            key: 'panCardDoc',
            num: 3,
            label: 'PAN Card',
            docPath: selectedCompany?.panCardDoc,
            extra: selectedCompany?.panCardNumber ? `PAN: ${selectedCompany.panCardNumber}` : null,
            color: 'orange',
            icon: FaIdCard
        },
        {
            key: 'paymentQrDoc',
            num: 4,
            label: 'Payment QR Code',
            docPath: selectedCompany?.paymentQrDoc,
            extra: 'Official UPI / QR Code',
            color: 'teal',
            icon: FaQrcode
        },
        {
            key: 'visitingCard',
            num: 5,
            label: 'Visiting Card',
            docPath: selectedCompany?.visitingCard,
            extra: 'Business Contact Card',
            color: 'cyan',
            icon: FaIdCard
        },
        {
            key: 'cancelledChequeDoc',
            num: 6,
            label: 'Cancelled Cheque',
            docPath: selectedCompany?.cancelledChequeDoc,
            extra: selectedCompany?.bankDetails?.bankName || 'Bank Proof',
            color: 'red',
            icon: FaFileAlt
        }
    ];

    const availableUploadsCount = selectedCompany
        ? docDefinitions.filter(d => !!d.docPath).length
        : 0;

    return (
        <>
            {/* ── Trigger Button ── */}
            {customButton ? (
                React.cloneElement(customButton, { onClick: onOpen })
            ) : isFloating ? (
                <Box
                    position="fixed"
                    bottom={{ base: "74px", md: "24px" }}
                    right={{ base: "16px", md: "24px" }}
                    zIndex={990}
                >
                    <Tooltip label="Share Company Documents & Credentials via WhatsApp" placement="left" hasArrow>
                        <Button
                            onClick={onOpen}
                            bgGradient="linear(135deg, #25D366 0%, #128C7E 100%)"
                            color="white"
                            _hover={{
                                bgGradient: "linear(135deg, #22c35e 0%, #0d6d62 100%)",
                                transform: "translateY(-2px) scale(1.02)",
                                boxShadow: "0 10px 24px -4px rgba(37, 211, 102, 0.6)"
                            }}
                            _active={{ transform: "scale(0.98)" }}
                            shadow="0 6px 20px rgba(18, 140, 126, 0.45)"
                            borderRadius="full"
                            px={{ base: 3.5, md: 5 }}
                            h={{ base: "42px", md: "46px" }}
                            border="2px solid whiteAlpha.400"
                            leftIcon={
                                <HStack spacing={1}>
                                    <Icon as={FaBuilding} boxSize={{ base: 3.5, md: 4 }} />
                                    <Icon as={FaWhatsapp} boxSize={{ base: 4, md: 5 }} />
                                </HStack>
                            }
                            fontSize={{ base: "xs", md: "sm" }}
                            fontWeight="800"
                            letterSpacing="wide"
                            transition="all 0.2s"
                        >
                            <Text display={{ base: "none", sm: "inline" }}>Share Company Docs</Text>
                            <Text display={{ base: "inline", sm: "none" }}>Company Docs</Text>
                        </Button>
                    </Tooltip>
                </Box>
            ) : (
                <Button
                    size="sm"
                    colorScheme="whatsapp"
                    bg="#25D366"
                    color="white"
                    _hover={{ bg: "#128C7E" }}
                    leftIcon={<Icon as={FaWhatsapp} />}
                    onClick={onOpen}
                    borderRadius="lg"
                    fontWeight="bold"
                    fontSize="xs"
                >
                    Share Company Docs
                </Button>
            )}

            {/* ── Main Share Modal (Desktop GUI Overhaul) ── */}
            <Modal isOpen={isOpen} onClose={onClose} size="5xl" isCentered scrollBehavior="inside">
                <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(4px)" />
                <ModalContent
                    maxW={{ base: "98vw", xl: "1140px" }}
                    borderRadius="xl"
                    overflow="hidden"
                    boxShadow="2xl"
                    border="1px solid"
                    borderColor="gray.300"
                    my={{ base: 2, md: 4 }}
                >
                    {/* Compact Desktop Titlebar */}
                    <ModalHeader bgGradient="linear(to-r, #075E54, #128C7E)" color="white" py={3} px={5}>
                        <Flex justify="space-between" align="center" pr={8}>
                            <HStack spacing={3}>
                                <Flex w={8} h={8} bg="whiteAlpha.200" borderRadius="md" align="center" justify="center" border="1px solid whiteAlpha.300">
                                    <Icon as={FaWhatsapp} boxSize={5} color="#25D366" />
                                </Flex>
                                <Box>
                                    <HStack spacing={2}>
                                        <Heading fontSize="sm" fontWeight="800" letterSpacing="wide">
                                            Share Company Documents via WhatsApp
                                        </Heading>
                                        <Badge colorScheme="green" variant="solid" borderRadius="full" px={2} fontSize="9px">
                                            DESKTOP ERP CONSOLE
                                        </Badge>
                                    </HStack>
                                    <Text fontSize="11px" color="whiteAlpha.800" fontWeight="normal">
                                        Select Company → Check Documents → Dispatch Directly to Client via WhatsApp
                                    </Text>
                                </Box>
                            </HStack>
                        </Flex>
                    </ModalHeader>
                    <ModalCloseButton color="white" top={3} right={3} />

                    <ModalBody p={{ base: 3, md: 4 }} bg="gray.100">
                        <VStack spacing={3} align="stretch">

                            {/* ── TOP TOOLBAR: Step 1 (Company) ── */}
                            <Box
                                p={3}
                                bg="white"
                                borderRadius="lg"
                                border="1px solid"
                                borderColor="gray.300"
                                shadow="2xs"
                            >
                                <FormControl>
                                    <Flex justify="space-between" align="center" mb={1}>
                                        <HStack spacing={1.5}>
                                            <Badge colorScheme="blue" fontSize="9px" px={1.5} py={0.5} borderRadius="sm" fontWeight="bold">
                                                STEP 1
                                            </Badge>
                                            <FormLabel fontSize="xs" fontWeight="bold" color="gray.700" m={0}>
                                                SELECT COMPANY ({companies.length})
                                            </FormLabel>
                                        </HStack>
                                        <Icon as={FaBuilding} color="blue.500" boxSize={3.5} />
                                    </Flex>
                                    <Select
                                        value={selectedCompanyId}
                                        onChange={(e) => handleCompanyChange(e.target.value)}
                                        size="sm"
                                        borderRadius="md"
                                        bg="gray.50"
                                        fontWeight="semibold"
                                        borderColor="blue.200"
                                        _focus={{ borderColor: "blue.500", bg: "white" }}
                                    >
                                        <option value="">-- Choose Company to Share --</option>
                                        {companies.map((c) => (
                                            <option key={c._id} value={c._id}>
                                                {c.companyName} {c.gstin ? `[GST: ${c.gstin}]` : ''}
                                            </option>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Box>

                            {/* ── WORKSPACE SPLIT: Left = Documents (Step 2) | Right = Client & Message (Step 3) ── */}
                            {!selectedCompany ? (
                                <Box
                                    p={8}
                                    bg="white"
                                    borderRadius="lg"
                                    border="1px dashed"
                                    borderColor="gray.300"
                                    textAlign="center"
                                >
                                    <Icon as={FaBuilding} boxSize={8} color="gray.400" mb={2} />
                                    <Text fontSize="sm" fontWeight="bold" color="gray.700">
                                        Please select a Company above to begin sharing documents.
                                    </Text>
                                    <Text fontSize="xs" color="gray.500" mt={1}>
                                        Once selected, available credentials (GST, Udyam, PAN, Payment QR, Visiting Card, Cheque) and recipient fields will appear.
                                    </Text>
                                </Box>
                            ) : (
                                <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={3} alignItems="stretch">

                                    {/* ── LEFT PANE: STEP 2 - Document & Company-Wise Catalog Selection ── */}
                                    <Box
                                        p={3.5}
                                        bg="white"
                                        borderRadius="lg"
                                        border="1px solid"
                                        borderColor="gray.300"
                                        shadow="2xs"
                                        display="flex"
                                        flexDirection="column"
                                        gap={3}
                                    >
                                        {/* Main Step 2 Header with Total Selection & Select All / Clear All */}
                                        <Flex justify="space-between" align="center" pb={2} borderBottom="1px solid" borderColor="gray.200">
                                            <HStack spacing={2}>
                                                <Badge colorScheme="teal" borderRadius="sm" px={1.5} py={0.5} fontSize="9px" fontWeight="bold">
                                                    STEP 2
                                                </Badge>
                                                <Text fontSize="xs" fontWeight="extrabold" color="gray.800" letterSpacing="wide">
                                                    SELECT DOCUMENTS & CATALOGS ({totalSelectedCount}/{availableUploadsCount + currentCompanyCatalogs.length})
                                                </Text>
                                            </HStack>
                                            {(availableUploadsCount > 0 || currentCompanyCatalogs.length > 0) && (
                                                <HStack spacing={1}>
                                                    <Button size="2xs" colorScheme="teal" variant="ghost" onClick={() => handleSelectAllTotal(true)}>
                                                        Select All
                                                    </Button>
                                                    <Text fontSize="2xs" color="gray.300">|</Text>
                                                    <Button size="2xs" colorScheme="gray" variant="ghost" onClick={() => handleSelectAllTotal(false)}>
                                                        Clear All
                                                    </Button>
                                                </HStack>
                                            )}
                                        </Flex>

                                        {/* ── Section A: Company Credentials & Statutory Documents ── */}
                                        <Box>
                                            <Flex justify="space-between" align="center" mb={1.5}>
                                                <HStack spacing={1.5}>
                                                    <Icon as={FaFileInvoice} color="teal.600" boxSize={3} />
                                                    <Text fontSize="10px" fontWeight="bold" color="gray.600" textTransform="uppercase">
                                                        Credentials & Statutory Docs ({selectedDocCount}/{availableUploadsCount})
                                                    </Text>
                                                </HStack>
                                                {availableUploadsCount > 0 && (
                                                    <HStack spacing={1}>
                                                        <Button size="2xs" variant="link" colorScheme="teal" fontSize="10px" onClick={() => handleSelectAllDocs(true)}>
                                                            All
                                                        </Button>
                                                        <Text fontSize="2xs" color="gray.300">|</Text>
                                                        <Button size="2xs" variant="link" colorScheme="gray" fontSize="10px" onClick={() => handleSelectAllDocs(false)}>
                                                            Clear
                                                        </Button>
                                                    </HStack>
                                                )}
                                            </Flex>

                                            {availableUploadsCount === 0 ? (
                                                <Box p={2.5} bg="gray.50" borderRadius="md" border="1px dashed" borderColor="gray.300" textAlign="center">
                                                    <Text fontSize="2xs" color="gray.500">
                                                        No statutory credentials uploaded for this company.
                                                    </Text>
                                                </Box>
                                            ) : (
                                                <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={2}>
                                                    {docDefinitions.map((doc) => {
                                                        const isUploaded = !!doc.docPath;
                                                        const isChecked = selectedDocs[doc.key];

                                                        return (
                                                            <Box
                                                                key={doc.key}
                                                                p={2}
                                                                borderRadius="md"
                                                                bg={isChecked ? `${doc.color}.50` : isUploaded ? "gray.50" : "gray.100"}
                                                                border="1px solid"
                                                                borderColor={isChecked ? `${doc.color}.400` : isUploaded ? "gray.200" : "gray.200"}
                                                                cursor={isUploaded ? "pointer" : "not-allowed"}
                                                                opacity={isUploaded ? 1 : 0.55}
                                                                transition="all 0.15s"
                                                                _hover={isUploaded ? { borderColor: `${doc.color}.500`, shadow: "2xs" } : {}}
                                                                onClick={() => isUploaded && handleDocToggle(doc.key)}
                                                            >
                                                                <Flex justify="space-between" align="center">
                                                                    <Checkbox
                                                                        colorScheme={doc.color}
                                                                        isChecked={isChecked}
                                                                        isDisabled={!isUploaded}
                                                                        onClick={(e) => e.stopPropagation()}
                                                                        onChange={() => isUploaded && handleDocToggle(doc.key)}
                                                                        size="sm"
                                                                        flex={1}
                                                                    >
                                                                        <VStack align="start" spacing={0} ml={1}>
                                                                            <Text fontSize="xs" fontWeight="bold" color="gray.800" noOfLines={1}>
                                                                                {doc.num}. {doc.label}
                                                                            </Text>
                                                                            {doc.extra && (
                                                                                <Text fontSize="10px" color="gray.500" noOfLines={1}>
                                                                                    {doc.extra}
                                                                                </Text>
                                                                            )}
                                                                        </VStack>
                                                                    </Checkbox>

                                                                    {isUploaded ? (
                                                                        <Tooltip label="View / Download" fontSize="2xs">
                                                                            <IconButton
                                                                                size="xs"
                                                                                variant="ghost"
                                                                                colorScheme={doc.color}
                                                                                icon={<Icon as={FaEye} />}
                                                                                aria-label="Preview"
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    window.open(getFullDocUrl(doc.docPath), '_blank');
                                                                                }}
                                                                            />
                                                                        </Tooltip>
                                                                    ) : (
                                                                        <Badge fontSize="9px" colorScheme="gray" variant="subtle" px={1} py={0.5}>
                                                                            Missing
                                                                        </Badge>
                                                                    )}
                                                                </Flex>
                                                            </Box>
                                                        );
                                                    })}
                                                </SimpleGrid>
                                            )}
                                        </Box>

                                        {/* ── Section B: Company-Wise Product Catalogs & Brochures ── */}
                                        <Box pt={2} borderTop="1px solid" borderColor="gray.100">
                                            <Flex justify="space-between" align="center" mb={1.5}>
                                                <HStack spacing={1.5}>
                                                    <Icon as={FaBook} color="purple.600" boxSize={3} />
                                                    <Text fontSize="10px" fontWeight="bold" color="gray.600" textTransform="uppercase">
                                                        Product Catalogs for {selectedCompany.companyName} ({selectedCatalogCount}/{currentCompanyCatalogs.length})
                                                    </Text>
                                                </HStack>
                                                {currentCompanyCatalogs.length > 0 && (
                                                    <HStack spacing={1}>
                                                        <Button size="2xs" variant="link" colorScheme="purple" fontSize="10px" onClick={() => handleSelectAllCatalogs(true)}>
                                                            All
                                                        </Button>
                                                        <Text fontSize="2xs" color="gray.300">|</Text>
                                                        <Button size="2xs" variant="link" colorScheme="gray" fontSize="10px" onClick={() => handleSelectAllCatalogs(false)}>
                                                            Clear
                                                        </Button>
                                                    </HStack>
                                                )}
                                            </Flex>

                                            {currentCompanyCatalogs.length === 0 ? (
                                                <Box p={3} bg="purple.50" borderRadius="md" border="1px dashed" borderColor="purple.200" textAlign="center">
                                                    <Text fontSize="xs" color="purple.900" fontWeight="bold">
                                                        No product catalogs attached to {selectedCompany.companyName}.
                                                    </Text>
                                                    <Text fontSize="2xs" color="gray.500" mt={0.5}>
                                                        Attach product catalogs to this company in Company Master to share them via WhatsApp.
                                                    </Text>
                                                </Box>
                                            ) : (
                                                <Box maxH="170px" overflowY="auto" pr={1}>
                                                    <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={2}>
                                                        {currentCompanyCatalogs.map((cat, cIdx) => {
                                                            const isChecked = selectedCatalogs.has(cat._id);
                                                            const catUrl = cat.url || cat.pdfUrl;

                                                            return (
                                                                <Box
                                                                    key={cat._id || cIdx}
                                                                    p={2}
                                                                    borderRadius="md"
                                                                    bg={isChecked ? "purple.50" : "gray.50"}
                                                                    border="1px solid"
                                                                    borderColor={isChecked ? "purple.400" : "gray.200"}
                                                                    cursor="pointer"
                                                                    transition="all 0.15s"
                                                                    _hover={{ borderColor: "purple.500", shadow: "2xs" }}
                                                                    onClick={() => handleCatalogToggle(cat._id)}
                                                                >
                                                                    <Flex justify="space-between" align="center">
                                                                        <Checkbox
                                                                            colorScheme="purple"
                                                                            isChecked={isChecked}
                                                                            onClick={(e) => e.stopPropagation()}
                                                                            onChange={() => handleCatalogToggle(cat._id)}
                                                                            size="sm"
                                                                            flex={1}
                                                                        >
                                                                            <HStack spacing={1.5} ml={1}>
                                                                                <Icon as={FaFilePdf} color={isChecked ? "purple.600" : "red.500"} boxSize={3.5} />
                                                                                <VStack align="start" spacing={0}>
                                                                                    <Text fontSize="xs" fontWeight="bold" color="gray.800" noOfLines={1} title={cat.title}>
                                                                                        {cat.title}
                                                                                    </Text>
                                                                                    <Text fontSize="9px" color="gray.500">
                                                                                        {cat.fileSize ? `PDF • ${cat.fileSize}` : 'Product Catalog PDF'}
                                                                                    </Text>
                                                                                </VStack>
                                                                            </HStack>
                                                                        </Checkbox>

                                                                        {catUrl && (
                                                                            <Tooltip label="Preview Catalog PDF" fontSize="2xs">
                                                                                <IconButton
                                                                                    size="xs"
                                                                                    variant="ghost"
                                                                                    colorScheme="purple"
                                                                                    icon={<Icon as={FaEye} />}
                                                                                    aria-label="Preview Catalog"
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation();
                                                                                        window.open(getFullDocUrl(catUrl), '_blank');
                                                                                    }}
                                                                                />
                                                                            </Tooltip>
                                                                        )}
                                                                    </Flex>
                                                                </Box>
                                                            );
                                                        })}
                                                    </SimpleGrid>
                                                </Box>
                                            )}
                                        </Box>
                                    </Box>

                                    {/* ── RIGHT PANE: STEP 3 - Recipient Client Details & Custom Note ── */}
                                    <Box
                                        p={3.5}
                                        bg="white"
                                        borderRadius="lg"
                                        border="1px solid"
                                        borderColor={clientAutoFilled ? "green.400" : "gray.300"}
                                        shadow="2xs"
                                        display="flex"
                                        flexDirection="column"
                                    >
                                        <Flex justify="space-between" align="center" mb={2.5} pb={2} borderBottom="1px solid" borderColor="gray.100">
                                            <HStack spacing={2}>
                                                <Badge colorScheme="green" borderRadius="sm" px={1.5} py={0.5} fontSize="9px" fontWeight="bold">
                                                    STEP 3
                                                </Badge>
                                                <Text fontSize="xs" fontWeight="extrabold" color="gray.800" letterSpacing="wide">
                                                    RECIPIENT CLIENT DETAILS
                                                </Text>
                                            </HStack>
                                            {clientAutoFilled && (
                                                <Badge colorScheme="green" variant="solid" fontSize="10px" borderRadius="full" px={2}>
                                                    ✓ Client Auto-Filled
                                                </Badge>
                                            )}
                                        </Flex>

                                        <VStack spacing={2.5} align="stretch" flex={1}>
                                            {/* Row 1: WhatsApp Mobile + Contact Person Name */}
                                            <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={2}>
                                                <FormControl isRequired>
                                                    <FormLabel fontSize="11px" fontWeight="bold" color="gray.700" mb={1}>
                                                        WhatsApp Mobile Number
                                                    </FormLabel>
                                                    <HStack spacing={1}>
                                                        <Badge p={1} borderRadius="md" colorScheme="green" fontSize="xs">
                                                            +91
                                                        </Badge>
                                                        <Input
                                                            placeholder="9876543210"
                                                            value={recipientPhone}
                                                            onChange={handlePhoneChange}
                                                            maxLength={10}
                                                            type="tel"
                                                            size="sm"
                                                            borderRadius="md"
                                                            bg="gray.50"
                                                            fontWeight="bold"
                                                            fontFamily="monospace"
                                                            borderColor={recipientPhone.length === 10 ? "green.400" : "gray.300"}
                                                            _focus={{ borderColor: "green.500", bg: "white" }}
                                                        />
                                                        {isCheckingPhone && <Spinner size="xs" color="green.500" />}
                                                    </HStack>
                                                </FormControl>

                                                <FormControl>
                                                    <FormLabel fontSize="11px" fontWeight="bold" color="gray.700" mb={1}>
                                                        Contact Person Name
                                                    </FormLabel>
                                                    <Input
                                                        placeholder="e.g. Rajesh Shah"
                                                        value={recipientName}
                                                        onChange={(e) => setRecipientName(e.target.value)}
                                                        size="sm"
                                                        borderRadius="md"
                                                        bg="gray.50"
                                                        _focus={{ borderColor: "green.500", bg: "white" }}
                                                    />
                                                </FormControl>
                                            </SimpleGrid>

                                            {/* Row 2: Client Company Name + Email */}
                                            <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={2}>
                                                <FormControl>
                                                    <FormLabel fontSize="11px" fontWeight="bold" color="gray.700" mb={1}>
                                                        Client Company / Firm Name
                                                    </FormLabel>
                                                    <Input
                                                        placeholder="e.g. ABC Infrastructure Pvt Ltd"
                                                        value={recipientCompanyName}
                                                        onChange={(e) => setRecipientCompanyName(e.target.value)}
                                                        size="sm"
                                                        borderRadius="md"
                                                        bg="gray.50"
                                                        _focus={{ borderColor: "green.500", bg: "white" }}
                                                    />
                                                </FormControl>

                                                <FormControl>
                                                    <FormLabel fontSize="11px" fontWeight="bold" color="gray.700" mb={1}>
                                                        Client Email (Optional)
                                                    </FormLabel>
                                                    <Input
                                                        placeholder="client@example.com"
                                                        value={recipientEmail}
                                                        onChange={(e) => setRecipientEmail(e.target.value)}
                                                        size="sm"
                                                        borderRadius="md"
                                                        bg="gray.50"
                                                        type="email"
                                                        _focus={{ borderColor: "green.500", bg: "white" }}
                                                    />
                                                </FormControl>
                                            </SimpleGrid>

                                            {/* Custom Note (Checkboxes removed as requested!) */}
                                            <FormControl>
                                                <FormLabel fontSize="11px" fontWeight="bold" color="gray.700" mb={1}>
                                                    Custom Note / Greeting (Optional)
                                                </FormLabel>
                                                <Textarea
                                                    placeholder="Add an optional greeting or note for the client..."
                                                    value={customMessage}
                                                    onChange={(e) => setCustomMessage(e.target.value)}
                                                    size="sm"
                                                    rows={2}
                                                    borderRadius="md"
                                                    bg="gray.50"
                                                    fontSize="xs"
                                                    _focus={{ borderColor: "green.500", bg: "white" }}
                                                />
                                            </FormControl>

                                            {/* Live Dispatch Preview Chip */}
                                            <Box p={2} bg="green.50" borderRadius="md" border="1px solid" borderColor="green.200" mt="auto">
                                                <Flex justify="space-between" align="center" fontSize="11px" color="green.900" fontWeight="medium">
                                                    <Text>
                                                        Sending from: <strong>{selectedCompany.companyName}</strong>
                                                    </Text>
                                                    <Badge colorScheme="green" fontSize="10px">
                                                        {selectedDocCount} Doc{selectedDocCount === 1 ? '' : 's'} + {selectedCatalogCount} Catalog{selectedCatalogCount === 1 ? '' : 's'} selected
                                                    </Badge>
                                                </Flex>
                                            </Box>
                                        </VStack>
                                    </Box>

                                </SimpleGrid>
                            )}

                        </VStack>
                    </ModalBody>

                    {/* Compact Desktop Modal Footer */}
                    <ModalFooter bg="white" borderTop="1px solid" borderColor="gray.200" py={2.5} px={4}>
                        <Flex justify="space-between" align="center" w="full">
                            <Button variant="ghost" size="sm" onClick={onClose} borderRadius="md" color="gray.600">
                                Cancel
                            </Button>

                            <HStack spacing={3}>
                                {recipientPhone.length === 10 && totalSelectedCount > 0 && (
                                    <Text fontSize="xs" color="gray.600" display={{ base: "none", md: "inline" }}>
                                        Ready to dispatch ({totalSelectedCount} item{totalSelectedCount === 1 ? '' : 's'}) to <strong>+91 {recipientPhone}</strong>
                                    </Text>
                                )}
                                <Button
                                    colorScheme="whatsapp"
                                    bg="#25D366"
                                    color="white"
                                    _hover={{ bg: "#128C7E" }}
                                    leftIcon={<Icon as={FaWhatsapp} />}
                                    size="sm"
                                    borderRadius="md"
                                    px={5}
                                    fontWeight="bold"
                                    fontSize="xs"
                                    isLoading={isSending}
                                    loadingText="Dispatching via WhatsApp..."
                                    isDisabled={!selectedCompany || totalSelectedCount === 0 || recipientPhone.length !== 10}
                                    onClick={handleSendWhatsApp}
                                    shadow="sm"
                                >
                                    Send {totalSelectedCount > 0 ? `(${totalSelectedCount}) Item${totalSelectedCount > 1 ? 's' : ''}` : ''} via WhatsApp
                                </Button>
                            </HStack>
                        </Flex>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
};

export default CompanyDocShareWidget;

