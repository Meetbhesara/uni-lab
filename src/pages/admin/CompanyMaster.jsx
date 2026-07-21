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
    const [companies, setCompanies] = useState([]);
    const [editId, setEditId] = useState(null);
    const [viewCompany, setViewCompany] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState(0);

    const { isOpen: isConfirmOpen, onOpen: onConfirmOpen, onClose: onConfirmClose } = useDisclosure();
    const cancelRef = React.useRef();

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

    const handleFileChange = (e) => setLogoFile(e.target.files[0]);

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
                    gstin: '', contactNo: '', email: '', panCardNumber: '',
                    bankDetails: { accountHolderName: '', bankName: '', accountNumber: '', ifscCode: '' }
                });
                setLogoFile(null);
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

                                            <FormControl>
                                                <FormLabel fontWeight="bold">Company Logo</FormLabel>
                                                <Box p={6} border="2px dashed" borderColor="teal.200" borderRadius="xl" bg="teal.50" textAlign="center" cursor="pointer" onClick={() => document.getElementById('logo-upload').click()} _hover={{ bg: "teal.100", borderColor: "teal.400" }}>
                                                    <input type="file" id="logo-upload" hidden onChange={handleFileChange} accept="image/*" />
                                                    <Icon as={FaCloudUploadAlt} w={8} h={8} color="teal.500" mb={3} />
                                                    <Text fontSize="sm" fontWeight="bold" color="teal.700">{logoFile ? `Selected: ${logoFile.name}` : "Upload Logo Image"}</Text>
                                                </Box>
                                            </FormControl>

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
                                                    <Th>Logo</Th>
                                                    <Th>Company Name</Th>
                                                    <Th>GSTIN</Th>
                                                    <Th>Contact</Th>
                                                    <Th textAlign="center">Actions</Th>
                                                </Tr>
                                            </Thead>
                                            <Tbody>
                                                {filteredCompanies.map(c => (
                                                    <Tr key={c._id}>
                                                        <Td>
                                                            {c.logo ? <Image src={`${API_BASE_URL}${c.logo}`} w="40px" h="40px" objectFit="contain" /> : <Icon as={FaBuilding} />}
                                                        </Td>
                                                        <Td fontWeight="bold" color="teal.600">{c.companyName}</Td>
                                                        <Td>{c.gstin}</Td>
                                                        <Td>{c.contactNo}</Td>
                                                        <Td textAlign="center">
                                                            <HStack justify="center">
                                                                <IconButton size="sm" colorScheme="blue" variant="ghost" icon={<Icon as={FaEdit} />} onClick={() => {
                                                                    setEditId(c._id);
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
