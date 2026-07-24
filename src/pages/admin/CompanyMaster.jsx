import React, { useState, useEffect } from 'react';
import {
    Box, Container, Heading, Text, SimpleGrid, Icon, Stack, Flex, Button, Card, CardBody,
    Divider, FormControl, FormLabel, Input, VStack, useToast, Image, HStack, IconButton,
    Tabs, TabList, TabPanels, Tab, TabPanel, Center, Table, Thead, Tbody, Tr, Th, Td, Wrap,
    useDisclosure, AlertDialog, AlertDialogBody, AlertDialogFooter, AlertDialogHeader, AlertDialogContent, AlertDialogOverlay,
    Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
} from '@chakra-ui/react';
import { FaBuilding, FaCloudUploadAlt, FaTrash, FaEdit, FaEye } from 'react-icons/fa';
import api from '../../api/axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

const CompanyMaster = () => {
    const toast = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [logoFile, setLogoFile] = useState(null);
    const [udyamFile, setUdyamFile] = useState(null);
    const [panFile, setPanFile] = useState(null);
    const [gstFile, setGstFile] = useState(null);
    const [cancelledChequeFile, setCancelledChequeFile] = useState(null);
    const [stampFile, setStampFile] = useState(null);

    const [companies, setCompanies] = useState([]);
    const [editId, setEditId] = useState(null);
    const [viewCompanyModal, setViewCompanyModal] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState(0);

    const [existingDocs, setExistingDocs] = useState({
        logo: '', udyamDoc: '', panCardDoc: '', gstDoc: '', cancelledChequeDoc: '', companyStamp: ''
    });
    const [removeFlags, setRemoveFlags] = useState({
        logo: false, udyamDoc: false, panCardDoc: false, gstDoc: false, cancelledChequeDoc: false, companyStamp: false
    });

    const { isOpen: isConfirmOpen, onOpen: onConfirmOpen, onClose: onConfirmClose } = useDisclosure();
    const cancelRef = React.useRef();

    const resetFiles = () => {
        setLogoFile(null);
        setUdyamFile(null);
        setPanFile(null);
        setGstFile(null);
        setCancelledChequeFile(null);
        setStampFile(null);
        setExistingDocs({
            logo: '', udyamDoc: '', panCardDoc: '', gstDoc: '', cancelledChequeDoc: '', companyStamp: ''
        });
        setRemoveFlags({
            logo: false, udyamDoc: false, panCardDoc: false, gstDoc: false, cancelledChequeDoc: false, companyStamp: false
        });
    };

    const [formData, setFormData] = useState({
        companyName: '',
        address: '',
        state: '',
        pincode: '',
        udyamNumber: '',
        gstin: '',
        contactNo: '',
        email: '',
        panCardNumber: '',
        invoicePrefix: '',
        bankDetails: {
            accountHolderName: '',
            bankName: '',
            accountNumber: '',
            ifscCode: ''
        }
    });

    const fetchCompanies = async () => {
        try {
            const res = await api.get('/company-master');
            if (res.data.success) setCompanies(res.data.data);
        } catch (err) { console.error("Failed to fetch companies", err); }
    };

    useEffect(() => {
        fetchCompanies();
    }, []);

    const filteredCompanies = companies.filter(c =>
        c.companyName?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (['accountHolderName', 'bankName', 'accountNumber', 'ifscCode'].includes(name)) {
            setFormData(prev => ({
                ...prev,
                bankDetails: {
                    ...prev.bankDetails,
                    [name]: value
                }
            }));
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        onConfirmOpen();
    };

    const confirmSubmit = async () => {
        onConfirmClose();
        setIsLoading(true);
        try {
            const uploadData = new FormData();
            Object.keys(formData).forEach(key => {
                if (key === 'bankDetails') {
                    uploadData.append(key, JSON.stringify(formData[key]));
                } else {
                    uploadData.append(key, formData[key]);
                }
            });
            if (logoFile) uploadData.append('logo', logoFile);
            if (udyamFile) uploadData.append('udyamDoc', udyamFile);
            if (panFile) uploadData.append('panCardDoc', panFile);
            if (gstFile) uploadData.append('gstDoc', gstFile);
            if (cancelledChequeFile) uploadData.append('cancelledChequeDoc', cancelledChequeFile);
            if (stampFile) uploadData.append('companyStamp', stampFile);

            Object.keys(removeFlags).forEach(key => {
                if (removeFlags[key]) {
                    uploadData.append(`remove_${key}`, 'true');
                }
            });

            let response;
            if (editId) {
                response = await api.put(`/company-master/${editId}`, uploadData);
            } else {
                response = await api.post('/company-master', uploadData);
            }

            if (response.data.success) {
                toast({ title: "Success", description: "Company record saved successfully", status: "success", duration: 3000 });
                setFormData({
                    companyName: '', address: '', state: '', pincode: '', udyamNumber: '',
                    gstin: '', contactNo: '', email: '', panCardNumber: '', invoicePrefix: '',
                    bankDetails: { accountHolderName: '', bankName: '', accountNumber: '', ifscCode: '' }
                });
                resetFiles();
                setEditId(null);
                fetchCompanies();
            }
        } catch (error) {
            toast({ title: "Error", description: error.response?.data?.message || "Failed to store record", status: "error", duration: 3000 });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this company record?')) return;
        try {
            await api.delete(`/company-master/${id}`);
            toast({ title: 'Deleted', status: 'info', duration: 2000 });
            fetchCompanies();
            if (editId === id) setEditId(null);
        } catch (err) {
            toast({ title: 'Error', description: err.response?.data?.message || 'Delete failed', status: 'error', duration: 3000 });
        }
    };

    return (
        <Box py={10} bg="gray.100" minH="100vh">
            <Container maxW="container.md">
                <Card variant="elevated" borderRadius="2xl" boxShadow="2xl" bg="white" overflow="hidden">
                    <Box bg="teal.600" p={{ base: 5, md: 8 }} color="white">
                        <Stack direction={{ base: "column", md: "row" }} justify="space-between" align="center" spacing={4}>
                            <Box>
                                <Heading size="lg">{editId ? 'Edit Company' : 'Our Companies'}</Heading>
                                <Text opacity={0.8} mt={1}>Manage internal company details for invoicing</Text>
                            </Box>
                            <HStack w={{ base: "full", md: "auto" }} spacing={2}>
                                <Input
                                    bg="white" color="gray.800" placeholder="Search Company Name..." size="md" borderRadius="xl"
                                    w={{ base: "full", md: "250px" }} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                <Button
                                    colorScheme="green" leftIcon={<Icon as={FaBuilding} />}
                                    onClick={() => {
                                        setEditId(null);
                                        setFormData({
                                            companyName: '', address: '', state: '', pincode: '', udyamNumber: '',
                                            gstin: '', contactNo: '', email: '', panCardNumber: '',
                                            bankDetails: { accountHolderName: '', bankName: '', accountNumber: '', ifscCode: '' }
                                        });
                                        setActiveTab(0);
                                    }} borderRadius="xl"
                                >
                                    Add New
                                </Button>
                            </HStack>
                        </Stack>
                    </Box>
                    <CardBody p={{ base: 4, md: 10 }}>
                        <Tabs index={activeTab} onChange={(idx) => setActiveTab(idx)} colorScheme="teal" variant="soft-rounded">
                            <TabList mb={6} justifyContent="center" bg="gray.50" p={2} borderRadius="2xl" border="1px solid" borderColor="gray.100">
                                <Tab fontWeight="bold" borderRadius="xl" px={6} py={3} _selected={{ color: 'white', bg: 'teal.500', shadow: 'md' }}>Form</Tab>
                                <Tab fontWeight="bold" borderRadius="xl" px={6} py={3} _selected={{ color: 'white', bg: 'teal.500', shadow: 'md' }}>View</Tab>
                            </TabList>
                            <TabPanels>
                                <TabPanel p={0}>
                                    <form onSubmit={handleSubmit}>
                                        <VStack spacing={8}>
                                            {/* Company Basic Details */}
                                            <Box w="full">
                                                <Text fontSize="lg" fontWeight="bold" color="teal.600" mb={4}>Company Details</Text>
                                                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                                                    <FormControl isRequired>
                                                        <FormLabel fontWeight="bold">Company Name</FormLabel>
                                                        <Input name="companyName" value={formData.companyName} onChange={handleChange} placeholder="Company Name" borderRadius="xl" />
                                                    </FormControl>
                                                    <FormControl>
                                                        <FormLabel fontWeight="bold">Email</FormLabel>
                                                        <Input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email" borderRadius="xl" />
                                                    </FormControl>
                                                    <FormControl>
                                                        <FormLabel fontWeight="bold">Contact No</FormLabel>
                                                        <Input name="contactNo" value={formData.contactNo} onChange={handleChange} placeholder="Contact Number" borderRadius="xl" />
                                                    </FormControl>
                                                    <FormControl>
                                                        <FormLabel fontWeight="bold">State</FormLabel>
                                                        <Input name="state" value={formData.state} onChange={handleChange} placeholder="State" borderRadius="xl" />
                                                    </FormControl>
                                                    <FormControl>
                                                        <FormLabel fontWeight="bold">Pincode</FormLabel>
                                                        <Input name="pincode" value={formData.pincode} onChange={handleChange} placeholder="Pincode" borderRadius="xl" />
                                                    </FormControl>
                                                    <FormControl>
                                                        <FormLabel fontWeight="bold">Address</FormLabel>
                                                        <Input name="address" value={formData.address} onChange={handleChange} placeholder="Address" borderRadius="xl" />
                                                    </FormControl>
                                                </SimpleGrid>
                                            </Box>
                                            
                                            <Divider />

                                            {/* Registration Details */}
                                            <Box w="full">
                                                <Text fontSize="lg" fontWeight="bold" color="teal.600" mb={4}>Registration Details</Text>
                                                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
                                                    <FormControl>
                                                        <FormLabel fontWeight="bold">Udyam Number</FormLabel>
                                                        <Input name="udyamNumber" value={formData.udyamNumber} onChange={handleChange} placeholder="Udyam Number" borderRadius="xl" />
                                                    </FormControl>
                                                    <FormControl>
                                                        <FormLabel fontWeight="bold">GSTIN</FormLabel>
                                                        <Input name="gstin" value={formData.gstin} onChange={handleChange} placeholder="GSTIN" borderRadius="xl" />
                                                    </FormControl>
                                                    <FormControl>
                                                        <FormLabel fontWeight="bold">PAN Card Number</FormLabel>
                                                        <Input name="panCardNumber" value={formData.panCardNumber} onChange={handleChange} placeholder="PAN Card" borderRadius="xl" />
                                                    </FormControl>
                                                    <FormControl>
                                                        <FormLabel fontWeight="bold">Invoice Prefix (e.g. UE, ULI)</FormLabel>
                                                        <Input name="invoicePrefix" value={formData.invoicePrefix} onChange={handleChange} placeholder="Invoice Prefix (e.g. UE)" borderRadius="xl" />
                                                    </FormControl>
                                                </SimpleGrid>
                                            </Box>

                                            <Divider />

                                            {/* Bank Details */}
                                            <Box w="full">
                                                <Text fontSize="lg" fontWeight="bold" color="teal.600" mb={4}>Bank Details</Text>
                                                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                                                    <FormControl>
                                                        <FormLabel fontWeight="bold">Account Holder Name</FormLabel>
                                                        <Input name="accountHolderName" value={formData.bankDetails?.accountHolderName} onChange={handleChange} placeholder="A/C Holder Name" borderRadius="xl" />
                                                    </FormControl>
                                                    <FormControl>
                                                        <FormLabel fontWeight="bold">Bank Name</FormLabel>
                                                        <Input name="bankName" value={formData.bankDetails?.bankName} onChange={handleChange} placeholder="Bank Name" borderRadius="xl" />
                                                    </FormControl>
                                                    <FormControl>
                                                        <FormLabel fontWeight="bold">Account Number</FormLabel>
                                                        <Input name="accountNumber" value={formData.bankDetails?.accountNumber} onChange={handleChange} placeholder="Account Number" borderRadius="xl" />
                                                    </FormControl>
                                                    <FormControl>
                                                        <FormLabel fontWeight="bold">IFSC Code</FormLabel>
                                                        <Input name="ifscCode" value={formData.bankDetails?.ifscCode} onChange={handleChange} placeholder="IFSC Code" borderRadius="xl" />
                                                    </FormControl>
                                                </SimpleGrid>
                                            </Box>

                                            <Divider />

                                            {/* Documents & Attachments */}
                                            <Box w="full">
                                                <Text fontSize="lg" fontWeight="bold" color="teal.600" mb={4}>Company Documents & Attachments (Photo / PDF)</Text>
                                                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                                                    {/* 1. Logo */}
                                                    <FormControl>
                                                        <FormLabel fontWeight="bold" fontSize="xs">1. Company Logo (Photo/Image)</FormLabel>
                                                        {existingDocs.logo && !removeFlags.logo ? (
                                                            <HStack p={3} border="1px solid" borderColor="teal.200" borderRadius="xl" bg="teal.50" justify="space-between">
                                                                <HStack spacing={2}>
                                                                    <Image src={`${API_BASE_URL}${existingDocs.logo}`} w="32px" h="32px" objectFit="contain" />
                                                                    <Button size="xs" colorScheme="teal" variant="ghost" leftIcon={<Icon as={FaEye} />} onClick={() => window.open(`${API_BASE_URL}${existingDocs.logo}`, '_blank')}>View Logo</Button>
                                                                </HStack>
                                                                <IconButton size="xs" colorScheme="red" variant="ghost" icon={<Icon as={FaTrash} />} title="Remove Logo" onClick={() => setRemoveFlags(prev => ({ ...prev, logo: true }))} />
                                                            </HStack>
                                                        ) : (
                                                            <Box p={4} border="2px dashed" borderColor="teal.200" borderRadius="xl" bg="teal.50" textAlign="center" cursor="pointer" onClick={() => document.getElementById('logo-upload').click()} _hover={{ bg: "teal.100" }}>
                                                                <input type="file" id="logo-upload" hidden onChange={(e) => setLogoFile(e.target.files[0])} accept="image/*" />
                                                                <Icon as={FaCloudUploadAlt} w={6} h={6} color="teal.500" mb={1} />
                                                                <Text fontSize="xs" fontWeight="bold" color="teal.700">{logoFile ? `Selected: ${logoFile.name}` : "Upload Logo Image"}</Text>
                                                            </Box>
                                                        )}
                                                    </FormControl>

                                                    {/* 2. Company Stamp */}
                                                    <FormControl>
                                                        <FormLabel fontWeight="bold" fontSize="xs">2. Company Stamp / Seal (Photo/Image)</FormLabel>
                                                        {existingDocs.companyStamp && !removeFlags.companyStamp ? (
                                                            <HStack p={3} border="1px solid" borderColor="purple.200" borderRadius="xl" bg="purple.50" justify="space-between">
                                                                <HStack spacing={2}>
                                                                    <Image src={`${API_BASE_URL}${existingDocs.companyStamp}`} w="32px" h="32px" objectFit="contain" />
                                                                    <Button size="xs" colorScheme="purple" variant="ghost" leftIcon={<Icon as={FaEye} />} onClick={() => window.open(`${API_BASE_URL}${existingDocs.companyStamp}`, '_blank')}>View Stamp</Button>
                                                                </HStack>
                                                                <IconButton size="xs" colorScheme="red" variant="ghost" icon={<Icon as={FaTrash} />} title="Remove Stamp" onClick={() => setRemoveFlags(prev => ({ ...prev, companyStamp: true }))} />
                                                            </HStack>
                                                        ) : (
                                                            <Box p={4} border="2px dashed" borderColor="purple.200" borderRadius="xl" bg="purple.50" textAlign="center" cursor="pointer" onClick={() => document.getElementById('stamp-upload').click()} _hover={{ bg: "purple.100" }}>
                                                                <input type="file" id="stamp-upload" hidden onChange={(e) => setStampFile(e.target.files[0])} accept="image/*" />
                                                                <Icon as={FaCloudUploadAlt} w={6} h={6} color="purple.500" mb={1} />
                                                                <Text fontSize="xs" fontWeight="bold" color="purple.700">{stampFile ? `Selected: ${stampFile.name}` : "Upload Stamp Photo"}</Text>
                                                            </Box>
                                                        )}
                                                    </FormControl>

                                                    {/* 3. Udyam Doc */}
                                                    <FormControl>
                                                        <FormLabel fontWeight="bold" fontSize="xs">3. Udyam Registration (PDF / Photo)</FormLabel>
                                                        {existingDocs.udyamDoc && !removeFlags.udyamDoc ? (
                                                            <HStack p={3} border="1px solid" borderColor="blue.200" borderRadius="xl" bg="blue.50" justify="space-between">
                                                                <HStack spacing={2}>
                                                                    <Badge colorScheme="blue">Saved Udyam</Badge>
                                                                    <Button size="xs" colorScheme="blue" variant="ghost" leftIcon={<Icon as={FaEye} />} onClick={() => window.open(`${API_BASE_URL}${existingDocs.udyamDoc}`, '_blank')}>View File</Button>
                                                                </HStack>
                                                                <IconButton size="xs" colorScheme="red" variant="ghost" icon={<Icon as={FaTrash} />} title="Remove Udyam Doc" onClick={() => setRemoveFlags(prev => ({ ...prev, udyamDoc: true }))} />
                                                            </HStack>
                                                        ) : (
                                                            <Box p={4} border="2px dashed" borderColor="blue.200" borderRadius="xl" bg="blue.50" textAlign="center" cursor="pointer" onClick={() => document.getElementById('udyam-upload').click()} _hover={{ bg: "blue.100" }}>
                                                                <input type="file" id="udyam-upload" hidden onChange={(e) => setUdyamFile(e.target.files[0])} accept="image/*,.pdf" />
                                                                <Icon as={FaCloudUploadAlt} w={6} h={6} color="blue.500" mb={1} />
                                                                <Text fontSize="xs" fontWeight="bold" color="blue.700">{udyamFile ? `Selected: ${udyamFile.name}` : "Upload Udyam Document"}</Text>
                                                            </Box>
                                                        )}
                                                    </FormControl>

                                                    {/* 4. PAN Card Doc */}
                                                    <FormControl>
                                                        <FormLabel fontWeight="bold" fontSize="xs">4. PAN Card (Photo / PDF)</FormLabel>
                                                        {existingDocs.panCardDoc && !removeFlags.panCardDoc ? (
                                                            <HStack p={3} border="1px solid" borderColor="orange.200" borderRadius="xl" bg="orange.50" justify="space-between">
                                                                <HStack spacing={2}>
                                                                    <Badge colorScheme="orange">Saved PAN</Badge>
                                                                    <Button size="xs" colorScheme="orange" variant="ghost" leftIcon={<Icon as={FaEye} />} onClick={() => window.open(`${API_BASE_URL}${existingDocs.panCardDoc}`, '_blank')}>View File</Button>
                                                                </HStack>
                                                                <IconButton size="xs" colorScheme="red" variant="ghost" icon={<Icon as={FaTrash} />} title="Remove PAN Card" onClick={() => setRemoveFlags(prev => ({ ...prev, panCardDoc: true }))} />
                                                            </HStack>
                                                        ) : (
                                                            <Box p={4} border="2px dashed" borderColor="orange.200" borderRadius="xl" bg="orange.50" textAlign="center" cursor="pointer" onClick={() => document.getElementById('pan-upload').click()} _hover={{ bg: "orange.100" }}>
                                                                <input type="file" id="pan-upload" hidden onChange={(e) => setPanFile(e.target.files[0])} accept="image/*,.pdf" />
                                                                <Icon as={FaCloudUploadAlt} w={6} h={6} color="orange.500" mb={1} />
                                                                <Text fontSize="xs" fontWeight="bold" color="orange.700">{panFile ? `Selected: ${panFile.name}` : "Upload PAN Card"}</Text>
                                                            </Box>
                                                        )}
                                                    </FormControl>

                                                    {/* 5. GST Doc */}
                                                    <FormControl>
                                                        <FormLabel fontWeight="bold" fontSize="xs">5. GST Certificate (Photo / PDF)</FormLabel>
                                                        {existingDocs.gstDoc && !removeFlags.gstDoc ? (
                                                            <HStack p={3} border="1px solid" borderColor="green.200" borderRadius="xl" bg="green.50" justify="space-between">
                                                                <HStack spacing={2}>
                                                                    <Badge colorScheme="green">Saved GST</Badge>
                                                                    <Button size="xs" colorScheme="green" variant="ghost" leftIcon={<Icon as={FaEye} />} onClick={() => window.open(`${API_BASE_URL}${existingDocs.gstDoc}`, '_blank')}>View File</Button>
                                                                </HStack>
                                                                <IconButton size="xs" colorScheme="red" variant="ghost" icon={<Icon as={FaTrash} />} title="Remove GST Cert" onClick={() => setRemoveFlags(prev => ({ ...prev, gstDoc: true }))} />
                                                            </HStack>
                                                        ) : (
                                                            <Box p={4} border="2px dashed" borderColor="green.200" borderRadius="xl" bg="green.50" textAlign="center" cursor="pointer" onClick={() => document.getElementById('gst-upload').click()} _hover={{ bg: "green.100" }}>
                                                                <input type="file" id="gst-upload" hidden onChange={(e) => setGstFile(e.target.files[0])} accept="image/*,.pdf" />
                                                                <Icon as={FaCloudUploadAlt} w={6} h={6} color="green.500" mb={1} />
                                                                <Text fontSize="xs" fontWeight="bold" color="green.700">{gstFile ? `Selected: ${gstFile.name}` : "Upload GST Certificate"}</Text>
                                                            </Box>
                                                        )}
                                                    </FormControl>

                                                    {/* 6. Cancelled Cheque Doc */}
                                                    <FormControl>
                                                        <FormLabel fontWeight="bold" fontSize="xs">6. Cancelled Cheque (Photo / PDF)</FormLabel>
                                                        {existingDocs.cancelledChequeDoc && !removeFlags.cancelledChequeDoc ? (
                                                            <HStack p={3} border="1px solid" borderColor="red.200" borderRadius="xl" bg="red.50" justify="space-between">
                                                                <HStack spacing={2}>
                                                                    <Badge colorScheme="red">Saved Cheque</Badge>
                                                                    <Button size="xs" colorScheme="red" variant="ghost" leftIcon={<Icon as={FaEye} />} onClick={() => window.open(`${API_BASE_URL}${existingDocs.cancelledChequeDoc}`, '_blank')}>View File</Button>
                                                                </HStack>
                                                                <IconButton size="xs" colorScheme="red" variant="ghost" icon={<Icon as={FaTrash} />} title="Remove Cheque" onClick={() => setRemoveFlags(prev => ({ ...prev, cancelledChequeDoc: true }))} />
                                                            </HStack>
                                                        ) : (
                                                            <Box p={4} border="2px dashed" borderColor="red.200" borderRadius="xl" bg="red.50" textAlign="center" cursor="pointer" onClick={() => document.getElementById('cheque-upload').click()} _hover={{ bg: "red.100" }}>
                                                                <input type="file" id="cheque-upload" hidden onChange={(e) => setCancelledChequeFile(e.target.files[0])} accept="image/*,.pdf" />
                                                                <Icon as={FaCloudUploadAlt} w={6} h={6} color="red.500" mb={1} />
                                                                <Text fontSize="xs" fontWeight="bold" color="red.700">{cancelledChequeFile ? `Selected: ${cancelledChequeFile.name}` : "Upload Cancelled Cheque"}</Text>
                                                            </Box>
                                                        )}
                                                    </FormControl>
                                                </SimpleGrid>
                                            </Box>

                                            <Button size="lg" colorScheme="teal" w="full" borderRadius="xl" h="60px" type="submit" leftIcon={<FaBuilding />} isLoading={isLoading} boxShadow="lg">
                                                {editId ? 'Update Company Record' : 'Save Company Record'}
                                            </Button>
                                            {editId && (
                                                <Button variant="outline" colorScheme="gray" borderRadius="xl" h="60px" w="full" onClick={() => {
                                                    setEditId(null);
                                                    setFormData({
                                                        companyName: '', address: '', state: '', pincode: '', udyamNumber: '',
                                                        gstin: '', contactNo: '', email: '', panCardNumber: '',
                                                        bankDetails: { accountHolderName: '', bankName: '', accountNumber: '', ifscCode: '' }
                                                    });
                                                    setLogoFile(null);
                                                }}>
                                                    Cancel Edit
                                                </Button>
                                            )}
                                        </VStack>
                                    </form>
                                </TabPanel>
                                <TabPanel p={0}>
                                    <Box mt={10}>
                                        <Table variant="simple">
                                            <Thead bg="gray.50">
                                                <Tr>
                                                    <Th>Logo / Stamp</Th>
                                                    <Th>Company Name</Th>
                                                    <Th>GSTIN / PAN</Th>
                                                    <Th>Uploaded Documents</Th>
                                                    <Th textAlign="center">Actions</Th>
                                                </Tr>
                                            </Thead>
                                            <Tbody>
                                                {filteredCompanies.map(c => (
                                                    <Tr key={c._id}>
                                                        <Td>
                                                            <HStack spacing={2}>
                                                                {c.logo ? <Image src={`${API_BASE_URL}${c.logo}`} w="36px" h="36px" objectFit="contain" title="Logo" /> : <Icon as={FaBuilding} />}
                                                                {c.companyStamp && <Image src={`${API_BASE_URL}${c.companyStamp}`} w="36px" h="36px" objectFit="contain" title="Stamp" />}
                                                            </HStack>
                                                        </Td>
                                                        <Td fontWeight="bold" color="teal.600">
                                                            <VStack align="start" spacing={0}>
                                                                <Text fontSize="xs" fontWeight="bold">{c.companyName}</Text>
                                                                {c.invoicePrefix && <Badge colorScheme="purple" fontSize="9px">{c.invoicePrefix}</Badge>}
                                                            </VStack>
                                                        </Td>
                                                        <Td>
                                                            <VStack align="start" spacing={0}>
                                                                <Text fontSize="xs">GST: {c.gstin || '—'}</Text>
                                                                <Text fontSize="10px" color="gray.500">PAN: {c.panCardNumber || '—'}</Text>
                                                            </VStack>
                                                        </Td>
                                                        <Td>
                                                            <Wrap spacing={1}>
                                                                {c.udyamDoc && (
                                                                    <Button size="xs" colorScheme="blue" variant="subtle" leftIcon={<Icon as={FaEye} />} onClick={() => window.open(`${API_BASE_URL}${c.udyamDoc}`, '_blank')}>
                                                                        Udyam
                                                                    </Button>
                                                                )}
                                                                {c.panCardDoc && (
                                                                    <Button size="xs" colorScheme="orange" variant="subtle" leftIcon={<Icon as={FaEye} />} onClick={() => window.open(`${API_BASE_URL}${c.panCardDoc}`, '_blank')}>
                                                                        PAN Card
                                                                    </Button>
                                                                )}
                                                                {c.gstDoc && (
                                                                    <Button size="xs" colorScheme="green" variant="subtle" leftIcon={<Icon as={FaEye} />} onClick={() => window.open(`${API_BASE_URL}${c.gstDoc}`, '_blank')}>
                                                                        GST Cert
                                                                    </Button>
                                                                )}
                                                                {c.cancelledChequeDoc && (
                                                                    <Button size="xs" colorScheme="red" variant="subtle" leftIcon={<Icon as={FaEye} />} onClick={() => window.open(`${API_BASE_URL}${c.cancelledChequeDoc}`, '_blank')}>
                                                                        Cheque
                                                                    </Button>
                                                                )}
                                                                {c.companyStamp && (
                                                                    <Button size="xs" colorScheme="purple" variant="subtle" leftIcon={<Icon as={FaEye} />} onClick={() => window.open(`${API_BASE_URL}${c.companyStamp}`, '_blank')}>
                                                                        Stamp
                                                                    </Button>
                                                                )}
                                                            </Wrap>
                                                        </Td>
                                                        <Td textAlign="center">
                                                            <HStack justify="center">
                                                                <IconButton size="sm" colorScheme="teal" variant="ghost" icon={<Icon as={FaEye} />} title="View Company Details" onClick={() => setViewCompanyModal(c)} />
                                                                <IconButton size="sm" colorScheme="blue" variant="ghost" icon={<Icon as={FaEdit} />} onClick={() => {
                                                                    setEditId(c._id);
                                                                    setExistingDocs({
                                                                        logo: c.logo || '',
                                                                        udyamDoc: c.udyamDoc || '',
                                                                        panCardDoc: c.panCardDoc || '',
                                                                        gstDoc: c.gstDoc || '',
                                                                        cancelledChequeDoc: c.cancelledChequeDoc || '',
                                                                        companyStamp: c.companyStamp || ''
                                                                    });
                                                                    setRemoveFlags({
                                                                        logo: false, udyamDoc: false, panCardDoc: false, gstDoc: false, cancelledChequeDoc: false, companyStamp: false
                                                                    });
                                                                    setFormData({
                                                                        companyName: c.companyName || '',
                                                                        address: c.address || '',
                                                                        state: c.state || '',
                                                                        pincode: c.pincode || '',
                                                                        udyamNumber: c.udyamNumber || '',
                                                                        gstin: c.gstin || '',
                                                                        contactNo: c.contactNo || '',
                                                                        email: c.email || '',
                                                                        panCardNumber: c.panCardNumber || '',
                                                                        invoicePrefix: c.invoicePrefix || '',
                                                                        bankDetails: {
                                                                            accountHolderName: c.bankDetails?.accountHolderName || '',
                                                                            bankName: c.bankDetails?.bankName || '',
                                                                            accountNumber: c.bankDetails?.accountNumber || '',
                                                                            ifscCode: c.bankDetails?.ifscCode || ''
                                                                        }
                                                                    });
                                                                    setActiveTab(0);
                                                                }} />
                                                                <IconButton size="sm" colorScheme="red" variant="ghost" icon={<Icon as={FaTrash} />} onClick={() => handleDelete(c._id)} />
                                                            </HStack>
                                                        </Td>
                                                    </Tr>
                                                ))}
                                            </Tbody>
                                        </Table>
                                    </Box>
                                </TabPanel>
                            </TabPanels>
                        </Tabs>
                    </CardBody>
                </Card>
            </Container>

            {/* ── View Company Details Modal ── */}
            <Modal isOpen={Boolean(viewCompanyModal)} onClose={() => setViewCompanyModal(null)} size="2xl" isCentered scrollBehavior="inside">
                <ModalOverlay backdropFilter="blur(6px)" bg="blackAlpha.600" />
                <ModalContent borderRadius="3xl" overflow="hidden" boxShadow="2xl">
                    <ModalHeader bg="teal.600" color="white" p={6}>
                        <HStack spacing={4}>
                            {viewCompanyModal?.logo ? (
                                <Image src={`${API_BASE_URL}${viewCompanyModal.logo}`} w="48px" h="48px" objectFit="contain" bg="white" p={1} borderRadius="lg" />
                            ) : (
                                <Icon as={FaBuilding} w={8} h={8} />
                            )}
                            <VStack align="start" spacing={0}>
                                <Heading size="md" color="white">{viewCompanyModal?.companyName}</Heading>
                                <Text fontSize="xs" opacity={0.9}>Invoice Prefix: <b>{viewCompanyModal?.invoicePrefix || 'UE'}</b></Text>
                            </VStack>
                        </HStack>
                    </ModalHeader>
                    <ModalCloseButton color="white" top={6} right={6} />
                    <ModalBody p={6}>
                        {viewCompanyModal && (
                            <VStack spacing={6} align="stretch">
                                {/* Basic Company Info */}
                                <Box bg="gray.50" p={4} borderRadius="2xl" border="1px solid" borderColor="gray.200">
                                    <Text fontSize="xs" fontWeight="black" color="teal.700" textTransform="uppercase" mb={3}>📍 Company Profile</Text>
                                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3} fontSize="xs">
                                        <Box><Text color="gray.500">Address:</Text><Text fontWeight="bold">{viewCompanyModal.address || '—'}</Text></Box>
                                        <Box><Text color="gray.500">State & Pincode:</Text><Text fontWeight="bold">{viewCompanyModal.state || '—'} - {viewCompanyModal.pincode || '—'}</Text></Box>
                                        <Box><Text color="gray.500">Email:</Text><Text fontWeight="bold">{viewCompanyModal.email || '—'}</Text></Box>
                                        <Box><Text color="gray.500">Contact No:</Text><Text fontWeight="bold">{viewCompanyModal.contactNo || '—'}</Text></Box>
                                    </SimpleGrid>
                                </Box>

                                {/* Registration Numbers */}
                                <Box bg="purple.50" p={4} borderRadius="2xl" border="1px solid" borderColor="purple.200">
                                    <Text fontSize="xs" fontWeight="black" color="purple.700" textTransform="uppercase" mb={3}>📋 Registration & Tax Numbers</Text>
                                    <SimpleGrid columns={{ base: 1, md: 3 }} spacing={3} fontSize="xs">
                                        <Box><Text color="purple.600">GSTIN / UIN:</Text><Text fontWeight="extrabold">{viewCompanyModal.gstin || '—'}</Text></Box>
                                        <Box><Text color="purple.600">PAN Card No:</Text><Text fontWeight="extrabold">{viewCompanyModal.panCardNumber || '—'}</Text></Box>
                                        <Box><Text color="purple.600">Udyam No:</Text><Text fontWeight="extrabold">{viewCompanyModal.udyamNumber || '—'}</Text></Box>
                                    </SimpleGrid>
                                </Box>

                                {/* Bank Details */}
                                <Box bg="blue.50" p={4} borderRadius="2xl" border="1px solid" borderColor="blue.200">
                                    <Text fontSize="xs" fontWeight="black" color="blue.700" textTransform="uppercase" mb={3}>🏦 Bank Account Details</Text>
                                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3} fontSize="xs">
                                        <Box><Text color="blue.600">Account Holder Name:</Text><Text fontWeight="bold">{viewCompanyModal.bankDetails?.accountHolderName || '—'}</Text></Box>
                                        <Box><Text color="blue.600">Bank Name:</Text><Text fontWeight="bold">{viewCompanyModal.bankDetails?.bankName || '—'}</Text></Box>
                                        <Box><Text color="blue.600">Account Number:</Text><Text fontWeight="bold">{viewCompanyModal.bankDetails?.accountNumber || '—'}</Text></Box>
                                        <Box><Text color="blue.600">IFSC Code:</Text><Text fontWeight="bold">{viewCompanyModal.bankDetails?.ifscCode || '—'}</Text></Box>
                                    </SimpleGrid>
                                </Box>

                                {/* Document Attachments */}
                                <Box bg="teal.50" p={4} borderRadius="2xl" border="1px solid" borderColor="teal.200">
                                    <Text fontSize="xs" fontWeight="black" color="teal.800" textTransform="uppercase" mb={3}>📁 Uploaded Documents & Stamp</Text>
                                    <Wrap spacing={3}>
                                        {viewCompanyModal.logo && (
                                            <Button size="sm" colorScheme="teal" variant="solid" leftIcon={<Icon as={FaEye} />} onClick={() => window.open(`${API_BASE_URL}${viewCompanyModal.logo}`, '_blank')}>
                                                View Logo Image
                                            </Button>
                                        )}
                                        {viewCompanyModal.companyStamp && (
                                            <Button size="sm" colorScheme="purple" variant="solid" leftIcon={<Icon as={FaEye} />} onClick={() => window.open(`${API_BASE_URL}${viewCompanyModal.companyStamp}`, '_blank')}>
                                                View Company Stamp
                                            </Button>
                                        )}
                                        {viewCompanyModal.udyamDoc && (
                                            <Button size="sm" colorScheme="blue" variant="solid" leftIcon={<Icon as={FaEye} />} onClick={() => window.open(`${API_BASE_URL}${viewCompanyModal.udyamDoc}`, '_blank')}>
                                                View Udyam Certificate
                                            </Button>
                                        )}
                                        {viewCompanyModal.panCardDoc && (
                                            <Button size="sm" colorScheme="orange" variant="solid" leftIcon={<Icon as={FaEye} />} onClick={() => window.open(`${API_BASE_URL}${viewCompanyModal.panCardDoc}`, '_blank')}>
                                                View PAN Card
                                            </Button>
                                        )}
                                        {viewCompanyModal.gstDoc && (
                                            <Button size="sm" colorScheme="green" variant="solid" leftIcon={<Icon as={FaEye} />} onClick={() => window.open(`${API_BASE_URL}${viewCompanyModal.gstDoc}`, '_blank')}>
                                                View GST Certificate
                                            </Button>
                                        )}
                                        {viewCompanyModal.cancelledChequeDoc && (
                                            <Button size="sm" colorScheme="red" variant="solid" leftIcon={<Icon as={FaEye} />} onClick={() => window.open(`${API_BASE_URL}${viewCompanyModal.cancelledChequeDoc}`, '_blank')}>
                                                View Cancelled Cheque
                                            </Button>
                                        )}
                                    </Wrap>
                                </Box>
                            </VStack>
                        )}
                    </ModalBody>
                    <ModalFooter bg="gray.50">
                        <Button borderRadius="full" onClick={() => setViewCompanyModal(null)}>Close</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
            
            <AlertDialog isOpen={isConfirmOpen} leastDestructiveRef={cancelRef} onClose={onConfirmClose} isCentered>
                <AlertDialogOverlay>
                    <AlertDialogContent borderRadius="2xl">
                        <AlertDialogHeader fontSize="lg" fontWeight="bold">Confirm Company Data</AlertDialogHeader>
                        <AlertDialogBody>
                            Are you sure you want to {editId ? 'update' : 'save'} the record for <strong>{formData.companyName}</strong>?
                        </AlertDialogBody>
                        <AlertDialogFooter>
                            <Button ref={cancelRef} onClick={onConfirmClose} borderRadius="full">Cancel</Button>
                            <Button colorScheme="teal" onClick={confirmSubmit} ml={3} borderRadius="full" px={10}>Confirm & Save</Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
        </Box>
    );
};

export default CompanyMaster;
