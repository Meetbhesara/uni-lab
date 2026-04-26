import React, { useState, useEffect } from 'react';
import {
    Box, Container, Heading, Text, SimpleGrid, Icon, Stack, Flex, Button, Card, CardBody,
    Divider, FormControl, FormLabel, Input, VStack, useToast, Image, Badge, HStack, IconButton, Select,
    Tabs, TabList, TabPanels, Tab, TabPanel, Checkbox, Center,
    Table, Thead, Tbody, Tr, Th, Td, TableContainer, Tag, TagLabel, Wrap, WrapItem
} from '@chakra-ui/react';
import { 
    FaRoad, FaHardHat, FaBuilding, FaRoute, FaTruck, FaCloudUploadAlt, FaFilePdf, FaFileImage, FaTrash, FaCheckCircle,
    FaUserTie, FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaIdCard, FaCamera,
    FaHandshake, FaFingerprint, FaIdBadge, FaMap,
    FaCalendarAlt, FaUsers, FaStar, FaEdit, FaEye, FaWrench, FaTag, FaFileInvoiceDollar, FaMapMarkedAlt, FaMoneyBillWave
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import AdminEmployeeExpenses from '../components/AdminEmployeeExpenses';
import AdminSiteAllocation from '../components/AdminSiteAllocation';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const CivilEngineeringServices = () => {
    const navigate = useNavigate();
    const services = [
        { title: "Road Infrastructure", description: "Expert design and construction of national highways and state roads.", icon: FaRoad, color: "blue.500" },
        { title: "Industrial Construction", description: "Turnkey solutions for industrial complexes and manufacturing units.", icon: FaBuilding, color: "orange.500" },
        { title: "Structural Engineering", description: "Advanced structural analysis and earthquake-resistant design.", icon: FaHardHat, color: "red.500" },
        { title: "Specialized Surveys", description: "Precision site surveying and geotechnical investigation.", icon: FaRoute, color: "cyan.500" }
    ];

    return (
        <Box py={20} bg="gray.50">
            <Container maxW="container.xl">
                <Stack spacing={4} as={Container} maxW={'3xl'} textAlign={'center'} mb={12}>
                    <Heading fontSize={{ base: '3xl', md: '5xl' }} fontWeight={'bold'} color="brand.800">Our Civil Engineering Services</Heading>
                    <Text color={'gray.600'} fontSize={{ base: 'sm', sm: 'lg' }}>Providing world-class infrastructure solutions with precision engineering.</Text>
                </Stack>

                <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={10}>
                    {services.map((service, index) => (
                        <Card key={index} height="full" borderRadius="2xl" overflow="hidden" borderTop="4px solid" borderColor={service.color} variant="elevated" bg="white">
                            <CardBody p={8}>
                                <Flex w={16} h={16} align={'center'} justify={'center'} color={'white'} rounded={'xl'} bg={service.color} mb={6} boxShadow="lg">
                                    <Icon as={service.icon} w={8} h={8} />
                                </Flex>
                                <Heading size="md" mb={4} color="brand.900">{service.title}</Heading>
                                <Text color={'gray.600'} lineHeight={1.6}>{service.description}</Text>
                            </CardBody>
                        </Card>
                    ))}
                </SimpleGrid>

                <Box mt={20} p={{ base: 8, md: 12 }} bg="white" borderRadius="3xl" boxShadow="2xl">
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10} align={'center'}>
                        <Box textAlign="left">
                            <Badge colorScheme="orange" mb={4} px={3} py={1} borderRadius="full">Expertise</Badge>
                            <Heading size="xl" mb={6} color="brand.800">Precision Engineering</Heading>
                            <Text color="gray.600" mb={6} fontSize="lg">Over 25+ years of delivering excellence in civil construction and instrumental surveying.</Text>
                            <VStack align="start" spacing={4}>
                                {["Certified ISO 9001:2015", "Sustainable Construction", "Advanced Safety Protocols"].map((item, i) => (
                                    <HStack key={i}><Icon as={FaCheckCircle} color="brand.500" /><Text fontWeight="600" color="gray.700">{item}</Text></HStack>
                                ))}
                            </VStack>
                            <Button mt={10} colorScheme="orange" size="lg" px={10} borderRadius="xl" boxShadow="lg">Consult Now</Button>
                        </Box>
                        <Box>
                            <Image borderRadius="3xl" src="http://localhost:5001/uploads/local/construction.jpeg" alt="Construction" objectFit="cover" h="400px" w="full" fallbackSrc="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80" />
                        </Box>
                    </SimpleGrid>
                </Box>

                {/* Employee Portal Banner */}
                <Box
                    mt={16}
                    borderRadius="2xl"
                    overflow="hidden"
                    bgGradient="linear(135deg, gray.900 0%, blue.900 60%, gray.800 100%)"
                    position="relative"
                >
                    <Box
                        position="absolute" top={0} right={0} bottom={0} w="40%"
                        bgGradient="linear(to-l, orange.900, transparent)" opacity={0.4}
                    />
                    <HStack
                        justify="space-between"
                        align="center"
                        px={{ base: 6, md: 12 }}
                        py={8}
                        flexWrap="wrap"
                        gap={4}
                        position="relative"
                        zIndex={1}
                    >
                        <HStack spacing={4}>
                            <Box
                                w={12} h={12} borderRadius="xl"
                                bgGradient="linear(to-br, orange.400, orange.600)"
                                display="flex" alignItems="center" justifyContent="center"
                                boxShadow="0 4px 16px rgba(251,146,60,0.4)" flexShrink={0}
                            >
                                <Icon as={FaHardHat} w={6} h={6} color="white" />
                            </Box>
                            <Box>
                                <Text color="white" fontWeight="bold" fontSize={{ base: 'md', md: 'lg' }}>
                                    Employee Portal
                                </Text>
                                <Text color="whiteAlpha.600" fontSize="sm">
                                    Field staff? Access your profile &amp; documents here
                                </Text>
                            </Box>
                        </HStack>
                        <Button
                            onClick={() => navigate('/employee/login')}
                            bgGradient="linear(to-r, orange.500, orange.400)"
                            color="white"
                            fontWeight="bold"
                            px={8}
                            h="46px"
                            borderRadius="xl"
                            rightIcon={<Icon as={FaUserTie} />}
                            _hover={{ bgGradient: 'linear(to-r, orange.600, orange.500)', transform: 'translateY(-2px)', boxShadow: '0 8px 24px rgba(251,146,60,0.4)' }}
                            transition="all 0.2s"
                            flexShrink={0}
                        >
                            Employee Login
                        </Button>
                    </HStack>
                </Box>

            </Container>
        </Box>
    );
};

const VehicleMasterForm = () => {
    const toast = useToast();
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [rcFile, setRcFile] = useState(null);
    const [formData, setFormData] = useState({
        vehicleNumber: '',
        vehicleName: '',
        insuranceDate: '',
        pucDate: '',
        serviceDate: '',
        logInName: user?.name || ''
    });

    const formatVehicleNumber = (val) => {
        // Strip all spaces and non-alphanumeric chars
        const raw = val.replace(/\s/g, '').toUpperCase();
        let formatted = '';

        for (let i = 0; i < raw.length && i < 10; i++) {
            const char = raw[i];
            
            // Positions 0-1: Characters only
            if (i < 2) {
                if (/[A-Z]/.test(char)) formatted += char;
                else break; // Reject rest if invalid character at this position
            }
            // Positions 2-3: Numbers only
            else if (i < 4) {
                if (/[0-9]/.test(char)) formatted += char;
                else break;
            }
            // Positions 4-5: Characters only
            else if (i < 6) {
                if (/[A-Z]/.test(char)) formatted += char;
                else break;
            }
            // Positions 6-9: Numbers only
            else {
                if (/[0-9]/.test(char)) formatted += char;
                else break;
            }

            // Auto-spacing after 2nd, 4th, and 6th character
            if ((formatted.length === 2 || formatted.length === 5 || formatted.length === 8) && i < 9) {
                formatted += ' ';
            }
        }
        return formatted.trim();
    };

    const handleChange = (e) => {
        let { name, value } = e.target;
        if (name === 'vehicleNumber') {
            value = formatVehicleNumber(value);
        }
        setFormData({ ...formData, [name]: value });
    };
    const handleFileChange = (e) => setRcFile(e.target.files[0]);
    const [insuranceFile, setInsuranceFile] = useState(null);
    const [pucFile, setPucFile] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const uploadData = new FormData();
            Object.keys(formData).forEach(key => uploadData.append(key, formData[key]));
            if (rcFile) uploadData.append('rcBook', rcFile);
            if (insuranceFile) uploadData.append('insurancePhoto', insuranceFile);
            if (pucFile) uploadData.append('pucPhoto', pucFile);
            
            const response = await api.post('/vehicle-master', uploadData);

            if (response.data.success) {
                toast({ title: "Success", description: "Vehicle record stored successfully", status: "success", duration: 3000 });
                setFormData({ vehicleNumber: '', vehicleName: '', insuranceDate: '', pucDate: '', serviceDate: '', logInName: user?.name || '' });
                setRcFile(null);
                setInsuranceFile(null);
                setPucFile(null);
            }
        } catch (error) {
            toast({ title: "Error", description: error.response?.data?.message || "Failed to store record", status: "error", duration: 3000 });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Box py={10} bg="gray.100" minH="100vh">
            <Container maxW="container.md">
                <Card variant="elevated" borderRadius="2xl" boxShadow="2xl" bg="white" overflow="hidden">
                    <Box bg="purple.600" p={8} color="white">
                        <Heading size="lg">Vehicle Management</Heading>
                        <Text opacity={0.8} mt={1}>Admin Panel: Manage vehicle compliance and service schedules</Text>
                    </Box>
                    <CardBody p={10}>
                        <form onSubmit={handleSubmit}>
                            <VStack spacing={8}>
                                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8} w="full">
                                    <FormControl isRequired>
                                        <FormLabel fontWeight="bold">Vehicle Number</FormLabel>
                                        <Box position="relative">
                                            {/* Mask Background (XX NN XX NNNN) */}
                                            <Box 
                                                position="absolute" 
                                                left="16px" 
                                                top="12.5px" 
                                                color="gray.300" 
                                                fontSize="lg" 
                                                fontFamily="monospace" 
                                                pointerEvents="none"
                                                letterSpacing="1px"
                                            >
                                                {Array.from("XX 00 XX 0000").map((char, index) => (
                                                    <Text as="span" key={index} opacity={index < formData.vehicleNumber.length ? 0 : 1}>{char}</Text>
                                                ))}
                                            </Box>
                                            <Input 
                                                name="vehicleNumber" 
                                                placeholder="" 
                                                value={formData.vehicleNumber} 
                                                onChange={handleChange}
                                                borderRadius="xl"
                                                size="lg"
                                                bg="transparent"
                                                fontFamily="monospace"
                                                letterSpacing="1px"
                                                _placeholder={{ color: 'transparent' }}
                                                maxLength={13}
                                            />
                                        </Box>
                                    </FormControl>
                                    <FormControl>
                                        <FormLabel fontWeight="bold">Vehicle Name</FormLabel>
                                        <Input 
                                            name="vehicleName" 
                                            placeholder="Enter Vehicle Name (e.g. Tata Tipper)" 
                                            value={formData.vehicleName} 
                                            onChange={handleChange}
                                            borderRadius="xl"
                                            size="lg"
                                        />
                                    </FormControl>
                                </SimpleGrid>

                                <FormControl>
                                    <FormLabel fontWeight="bold">RC Book (PDF or Image)</FormLabel>
                                    <Box 
                                        p={8} 
                                        border="2px dashed" 
                                        borderColor="purple.200" 
                                        borderRadius="2xl" 
                                        bg="purple.50"
                                        textAlign="center"
                                        cursor="pointer"
                                        onClick={() => document.getElementById('rc-upload').click()}
                                        _hover={{ bg: "purple.100", borderColor: "purple.400" }}
                                    >
                                        <input type="file" id="rc-upload" hidden onChange={handleFileChange} accept="image/*,.pdf" />
                                        <Icon as={FaCloudUploadAlt} w={10} h={10} color="purple.500" mb={3} />
                                        <Text fontWeight="bold" color="purple.700">
                                            {rcFile ? `Selected: ${rcFile.name}` : "Upload RC Book Photo/PDF"}
                                        </Text>
                                    </Box>
                                </FormControl>

                                <Divider />

                                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} w="full">
                                    <FormControl>
                                        <FormLabel fontWeight="bold">Insurance Date</FormLabel>
                                        <Input type="date" name="insuranceDate" value={formData.insuranceDate} onChange={handleChange} variant="filled" borderRadius="lg" bg="gray.50" _focus={{ bg: "white", borderColor: "purple.400" }} />
                                    </FormControl>
                                    <FormControl>
                                        <FormLabel fontWeight="bold">PUC Date</FormLabel>
                                        <Input type="date" name="pucDate" value={formData.pucDate} onChange={handleChange} variant="filled" borderRadius="lg" bg="gray.50" _focus={{ bg: "white", borderColor: "purple.400" }} />
                                    </FormControl>
                                    <FormControl>
                                        <FormLabel fontWeight="bold">Service Date</FormLabel>
                                        <Input type="date" name="serviceDate" value={formData.serviceDate} onChange={handleChange} variant="filled" borderRadius="lg" bg="gray.50" _focus={{ bg: "white", borderColor: "purple.400" }} />
                                    </FormControl>
                                </SimpleGrid>

                                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} w="full">
                                    <FormControl>
                                        <FormLabel fontWeight="bold">Insurance Photo/PDF</FormLabel>
                                        <Box p={6} border="2px dashed" borderColor="blue.200" borderRadius="xl" bg="blue.50" textAlign="center" cursor="pointer" onClick={() => document.getElementById('ins-upload').click()} _hover={{ bg: "blue.100", borderColor: "blue.400" }}>
                                            <input type="file" id="ins-upload" hidden onChange={(e) => setInsuranceFile(e.target.files[0])} accept="image/*,.pdf" />
                                            <Icon as={FaCloudUploadAlt} w={8} h={8} color="blue.500" mb={3} />
                                            <Text fontSize="sm" fontWeight="bold" color="blue.700">{insuranceFile ? `Selected: ${insuranceFile.name}` : "Upload Insurance"}</Text>
                                        </Box>
                                    </FormControl>
                                    <FormControl>
                                        <FormLabel fontWeight="bold">PUC Photo/PDF</FormLabel>
                                        <Box p={6} border="2px dashed" borderColor="green.200" borderRadius="xl" bg="green.50" textAlign="center" cursor="pointer" onClick={() => document.getElementById('puc-upload').click()} _hover={{ bg: "green.100", borderColor: "green.400" }}>
                                            <input type="file" id="puc-upload" hidden onChange={(e) => setPucFile(e.target.files[0])} accept="image/*,.pdf" />
                                            <Icon as={FaCloudUploadAlt} w={8} h={8} color="green.500" mb={3} />
                                            <Text fontSize="sm" fontWeight="bold" color="green.700">{pucFile ? `Selected: ${pucFile.name}` : "Upload PUC"}</Text>
                                        </Box>
                                    </FormControl>
                                </SimpleGrid>

                                <Box w="full" bg="gray.50" p={4} borderRadius="xl">
                                    <Text fontSize="sm" color="gray.600">
                                        Logged in as: <Text as="span" fontWeight="bold" color="purple.700">{user?.name || 'Admin'}</Text>
                                    </Text>
                                </Box>

                                <Button 
                                    size="lg" 
                                    colorScheme="purple" 
                                    w="full" 
                                    borderRadius="xl" 
                                    h="60px"
                                    type="submit"
                                    leftIcon={<FaTruck />}
                                    isLoading={isLoading}
                                    boxShadow="lg"
                                >
                                    Update Vehicle Record
                                </Button>
                            </VStack>
                        </form>
                    </CardBody>
                </Card>
            </Container>
        </Box>
    );
};

const EmployeeMasterForm = () => {
    const toast = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [pincodeLoading1, setPincodeLoading1] = useState(false);
    const [pincodeLoading2, setPincodeLoading2] = useState(false);
    const [nextEmpId, setNextEmpId] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        addressLine1: { street: '', city: '', pincode: '' },
        addressLine2: { street: '', city: '', pincode: '' },
        emergencyContact: { name: '', phone: '' },
        bankName: '',
        accountName: '',
        accountNumber: '',
        ifscCode: '',
        salary: '',
        designation: '',
    });
    const [files, setFiles] = useState({
        photo: null,
        aadharCard: null,
        panCard: null,
        voterId: null,
        drivingLicense: null
    });
    const [photoPreview, setPhotoPreview] = useState(null);
    const [sameAsAddress, setSameAsAddress] = useState(false);
    const [bankVerified, setBankVerified] = useState(false);
    const [bankVerifying, setBankVerifying] = useState(false);

    const [employees, setEmployees] = useState([]);
    const [editId, setEditId] = useState('');

    const fetchNextEmpId = async () => {
        try {
            const res = await api.get('/employee-master/next-id');
            if (res.data.success) setNextEmpId(res.data.nextEmpId);
        } catch (err) { console.error('Failed to fetch next emp id', err); }
    };

    const fetchEmployees = async () => {
        try {
            const res = await api.get('/employee-master');
            if (res.data.success) setEmployees(res.data.data);
        } catch (err) { console.error(err); }
    };

    useEffect(() => {
        fetchNextEmpId();
        fetchEmployees();
    }, []);

    const handleSelectEmployee = (e) => {
        const id = e.target.value;
        setEditId(id);
        if (!id) {
            setFormData({
                name: '', email: '', phone: '',
                addressLine1: { street: '', city: '', pincode: '' },
                addressLine2: { street: '', city: '', pincode: '' },
                emergencyContact: { name: '', phone: '' },
                bankName: '', accountName: '', accountNumber: '', ifscCode: '',
                salary: '',
                designation: ''
            });
            setFiles({ photo: null, aadharCard: null, panCard: null, voterId: null, drivingLicense: null });
            setPhotoPreview(null);
            setSameAsAddress(false);
            setBankVerified(false);
            fetchNextEmpId();
            return;
        }

        const emp = employees.find(e => e._id === id);
        if (emp) {
            setNextEmpId(emp.empId);
            setFormData({
                name: emp.name || '',
                email: emp.email || '',
                phone: emp.phone || '',
                addressLine1: emp.addressLine1 || { street: '', city: '', pincode: '' },
                addressLine2: emp.addressLine2 || { street: '', city: '', pincode: '' },
                emergencyContact: emp.emergencyContact || { name: '', phone: '' },
                bankName: emp.bankDetails?.bankName || '',
                accountName: emp.bankDetails?.accountName || '',
                accountNumber: emp.bankDetails?.accountNumber || '',
                ifscCode: emp.bankDetails?.ifscCode || '',
                salary: emp.salary || '',
                designation: emp.designation || '',
            });
            setPhotoPreview(emp.photo?.url ? `http://localhost:5001${emp.photo.url}` : null);
            setFiles({ photo: null, aadharCard: null, panCard: null, voterId: null, drivingLicense: null });
            if (emp.bankDetails?.ifscCode) setBankVerified(true);
        }
    };

    const fetchCityByPincode = async (pincode, addressField, setLoadingFn) => {
        if (pincode.length !== 6) return;
        setLoadingFn(true);
        try {
            const res = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
            const data = await res.json();
            if (data[0].Status === 'Success') {
                const city = data[0].PostOffice[0].District;
                setFormData(prev => ({
                    ...prev,
                    [addressField]: { ...prev[addressField], city }
                }));
                if (sameAsAddress && addressField === 'addressLine1') {
                    setFormData(prev => ({
                        ...prev,
                        addressLine2: { ...prev.addressLine2, city }
                    }));
                }
            }
        } catch (err) {
            console.log('Pincode lookup failed', err);
        } finally {
            setLoadingFn(false);
        }
    };

    const handleChange = (e, field, subfield) => {
        const { value } = e.target;
        if (subfield) {
            setFormData(prev => ({
                ...prev,
                [field]: { ...prev[field], [subfield]: value }
            }));
            if (sameAsAddress && field === 'addressLine1') {
                setFormData(prev => ({
                    ...prev,
                    addressLine2: { ...prev.addressLine2, [subfield]: value }
                }));
            }
            if (subfield === 'pincode') {
                const setter = field === 'addressLine1' ? setPincodeLoading1 : setPincodeLoading2;
                if (value.length === 6) fetchCityByPincode(value, field, setter);
            }
        } else {
            setFormData(prev => ({ ...prev, [field]: value }));
            if (field === 'ifscCode') setBankVerified(false);
        }
    };

    const handleFileChange = (e, field) => {
        const file = e.target.files[0];
        setFiles(prev => ({ ...prev, [field]: file }));
        if (field === 'photo' && file) {
            const reader = new FileReader();
            reader.onload = (ev) => setPhotoPreview(ev.target.result);
            reader.readAsDataURL(file);
        }
    };

    const handleCheckboxChange = (e) => {
        const checked = e.target.checked;
        setSameAsAddress(checked);
        if (checked) {
            setFormData(prev => ({
                ...prev,
                addressLine2: { ...prev.addressLine1 }
            }));
        }
    };

    const handleVerifyBank = async () => {
        if (!formData.ifscCode || formData.ifscCode.length < 11) {
            toast({ title: 'Enter valid IFSC code (11 chars)', status: 'warning', duration: 2000 });
            return;
        }
        setBankVerifying(true);
        try {
            const res = await fetch(`https://ifsc.razorpay.com/${formData.ifscCode.toUpperCase()}`);
            if (res.ok) {
                const data = await res.json();
                setFormData(prev => ({ ...prev, bankName: data.BANK }));
                setBankVerified(true);
                toast({ title: 'Bank Verified ✓', description: `${data.BANK} - ${data.BRANCH}`, status: 'success', duration: 3000 });
            } else {
                setBankVerified(false);
                toast({ title: 'Invalid IFSC Code', status: 'error', duration: 2000 });
            }
        } catch {
            toast({ title: 'Verification failed', status: 'error', duration: 2000 });
        } finally {
            setBankVerifying(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const uploadData = new FormData();
            uploadData.append('name', formData.name);
            uploadData.append('email', formData.email);
            uploadData.append('phone', formData.phone);
            uploadData.append('addressLine1', JSON.stringify(formData.addressLine1));
            uploadData.append('addressLine2', JSON.stringify(formData.addressLine2));
            uploadData.append('emergencyContact', JSON.stringify(formData.emergencyContact));
            uploadData.append('empId', nextEmpId);
            uploadData.append('bankDetails', JSON.stringify({
                bankName: formData.bankName,
                accountName: formData.accountName,
                accountNumber: formData.accountNumber,
                ifscCode: formData.ifscCode,
            }));
            uploadData.append('salary', formData.salary);
            uploadData.append('designation', formData.designation);
            
            Object.keys(files).forEach(key => {
                if (files[key]) uploadData.append(key, files[key]);
            });

            let response;
            if (editId) {
                response = await api.put(`/employee-master/${editId}`, uploadData);
            } else {
                response = await api.post('/employee-master', uploadData);
            }

            if (response.data.success) {
                toast({ title: editId ? "Updated" : "Success", description: editId ? "Employee record updated successfully" : "Employee record stored successfully", status: "success", duration: 3000 });
                setFormData({
                    name: '',
                    email: '',
                    phone: '',
                    addressLine1: { street: '', city: '', pincode: '' },
                    addressLine2: { street: '', city: '', pincode: '' },
                    emergencyContact: { name: '', phone: '' },
                    bankName: '',
                    accountName: '',
                    accountNumber: '',
                    ifscCode: '',
                    salary: '',
                    designation: ''
                });
                setFiles({ photo: null, aadharCard: null, panCard: null, voterId: null, drivingLicense: null });
                setPhotoPreview(null);
                setSameAsAddress(false);
                setBankVerified(false);
                setEditId('');
                fetchNextEmpId();
                fetchEmployees();
            }
        } catch (error) {
            toast({ title: "Error", description: error.response?.data?.message || "Failed to store record", status: "error", duration: 3000 });
        } finally {
            setIsLoading(false);
        }
    };

    const FileUploadInput = ({ label, field, icon }) => (
        <FormControl>
            <FormLabel fontWeight="bold" fontSize="sm">{label}</FormLabel>
            <Box 
                p={4} 
                border="2px dashed" 
                borderColor={files[field] ? "green.200" : "blue.100"} 
                borderRadius="xl" 
                bg={files[field] ? "green.50" : "blue.50"}
                textAlign="center"
                cursor="pointer"
                onClick={() => document.getElementById(`${field}-upload`).click()}
                _hover={{ bg: files[field] ? "green.100" : "blue.100", borderColor: "blue.300" }}
                transition="all 0.2s"
            >
                <input type="file" id={`${field}-upload`} hidden onChange={(e) => handleFileChange(e, field)} accept="image/*,.pdf" />
                <Icon as={icon || FaCloudUploadAlt} w={6} h={6} color={files[field] ? "green.500" : "blue.500"} mb={2} />
                <Text fontSize="xs" fontWeight="bold" color={files[field] ? "green.700" : "blue.700"} noOfLines={1}>
                    {files[field] ? `✓ ${files[field].name}` : `Upload ${label}`}
                </Text>
            </Box>
        </FormControl>
    );

    return (
        <Box py={5} bg="gray.100" minH="100vh">
            <Container maxW="container.lg">
                <Card variant="elevated" borderRadius="2xl" boxShadow="2xl" bg="white" overflow="hidden">
                    <Box bg="blue.600" p={{ base: 5, md: 8 }} color="white">
                        <Stack direction={{ base: "column", md: "row" }} justify="space-between" align="center" spacing={4}>
                            <Box>
                                <Heading size="lg">{editId ? 'Edit Employee' : 'Employee Management'}</Heading>
                                <Text opacity={0.8} mt={1}>Admin Panel: Manage company employee records and documents</Text>
                            </Box>
                            <HStack w={{ base: "full", md: "auto" }} spacing={2}>
                                <Input 
                                    bg="white" 
                                    color="gray.800" 
                                    placeholder="Search ID (e.g. 0001)" 
                                    size="md" 
                                    borderRadius="xl"
                                    w="200px"
                                    onChange={(e) => {
                                        const val = e.target.value.trim();
                                        if (val.length >= 2) {
                                            const found = employees.find(emp => emp.empId.includes(val));
                                            if (found) handleSelectEmployee({ target: { value: found._id } });
                                        }
                                    }}
                                />
                                <Button 
                                    colorScheme="green" 
                                    leftIcon={<Icon as={FaUsers} />} 
                                    onClick={() => handleSelectEmployee({ target: { value: '' } })}
                                    borderRadius="xl"
                                >
                                    New Employee
                                </Button>
                            </HStack>
                        </Stack>
                    </Box>
                    <CardBody p={{ base: 4, md: 10 }}>
                        <form onSubmit={handleSubmit} onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}>
                            <VStack spacing={8} align="stretch">

                                {/* ── Section 1: Basic Info + Photo ── */}
                                <Box>
                                    <Heading size="sm" mb={4} color="blue.700" display="flex" alignItems="center">
                                        <Icon as={FaUserTie} mr={2} /> Employee Information
                                    </Heading>
                                    <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4} alignItems="flex-start">
                                        {/* Photo Upload */}
                                        <Box textAlign="center">
                                            <FormLabel fontWeight="bold" fontSize="sm" textAlign="left">Employee Photo</FormLabel>
                                            <Box
                                                w="110px"
                                                h="140px"
                                                mx="auto"
                                                borderRadius="xl"
                                                border="3px dashed"
                                                borderColor={photoPreview ? "green.400" : "blue.300"}
                                                bg={photoPreview ? "transparent" : "blue.50"}
                                                display="flex"
                                                alignItems="center"
                                                justifyContent="center"
                                                cursor="pointer"
                                                overflow="hidden"
                                                onClick={() => document.getElementById('photo-upload').click()}
                                                _hover={{ borderColor: "blue.500", bg: "blue.100" }}
                                                transition="all 0.2s"
                                            >
                                                <input type="file" id="photo-upload" hidden onChange={(e) => handleFileChange(e, 'photo')} accept="image/*" />
                                                {photoPreview
                                                    ? <Image src={photoPreview} alt="Preview" w="full" h="full" objectFit="cover" />
                                                    : <VStack spacing={1}><Icon as={FaCamera} w={6} h={6} color="blue.400" /><Text fontSize="9px" color="blue.500" fontWeight="bold">Upload Photo</Text></VStack>
                                                }
                                            </Box>
                                            <Box mt={2}>
                                                <Text fontSize="xs" fontWeight="bold" color="purple.600">ID: {nextEmpId || '####'}</Text>
                                            </Box>
                                        </Box>

                                        {/* Name, Salary, Email, Phone */}
                                        <Box gridColumn={{ md: 'span 3' }}>
                                            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={4}>
                                                <FormControl isRequired>
                                                    <FormLabel fontWeight="bold" fontSize="sm">Employee Name</FormLabel>
                                                    <HStack bg="gray.50" p={1} borderRadius="xl" border="1px solid" borderColor="gray.200">
                                                        <Icon as={FaUserTie} ml={2} color="blue.500" />
                                                        <Input variant="unstyled" p={2} placeholder="Full Name" value={formData.name} onChange={(e) => handleChange(e, 'name')} />
                                                    </HStack>
                                                </FormControl>
                                                <FormControl isRequired>
                                                    <FormLabel fontWeight="bold" fontSize="sm">Monthly Salary (₹)</FormLabel>
                                                    <HStack bg="gray.50" p={1} borderRadius="xl" border="1px solid" borderColor="gray.200">
                                                        <Icon as={FaMoneyBillWave} ml={2} color="green.500" />
                                                        <Input variant="unstyled" type="number" p={2} placeholder="e.g. 25000" value={formData.salary} onChange={(e) => handleChange(e, 'salary')} />
                                                    </HStack>
                                                </FormControl>
                                                <FormControl>
                                                    <FormLabel fontWeight="bold" fontSize="sm">Designation / Role</FormLabel>
                                                    <HStack bg="gray.50" p={1} borderRadius="xl" border="1px solid" borderColor="gray.200">
                                                        <Icon as={FaIdBadge} ml={2} color="blue.500" />
                                                        <Input variant="unstyled" p={2} placeholder="e.g. Site Engineer" value={formData.designation} onChange={(e) => handleChange(e, 'designation')} />
                                                    </HStack>
                                                </FormControl>
                                            </SimpleGrid>
                                            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                                                <FormControl isRequired>
                                                    <FormLabel fontWeight="bold" fontSize="sm">Phone Number</FormLabel>
                                                    <HStack bg="gray.50" p={1} borderRadius="xl" border="1px solid" borderColor="gray.200">
                                                        <Icon as={FaPhoneAlt} ml={2} color="blue.500" />
                                                        <Input variant="unstyled" p={2} placeholder="Mobile No" value={formData.phone} onChange={(e) => handleChange(e, 'phone')} />
                                                    </HStack>
                                                </FormControl>
                                                <FormControl>
                                                    <FormLabel fontWeight="bold" fontSize="sm">Email Address</FormLabel>
                                                    <HStack bg="gray.50" p={1} borderRadius="xl" border="1px solid" borderColor="gray.200">
                                                        <Icon as={FaEnvelope} ml={2} color="blue.500" />
                                                        <Input variant="unstyled" p={2} type="email" placeholder="email@company.com" value={formData.email} onChange={(e) => handleChange(e, 'email')} />
                                                    </HStack>
                                                </FormControl>
                                            </SimpleGrid>

                                            {/* Primary Address inside name section */}
                                            <Box mt={4} p={4} bg="blue.50" borderRadius="xl" border="1px solid" borderColor="blue.100">
                                                <Text fontWeight="bold" fontSize="sm" color="blue.700" mb={3} display="flex" alignItems="center">
                                                    <Icon as={FaMapMarkerAlt} mr={1} /> Primary Address
                                                </Text>
                                                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={3}>
                                                    <FormControl gridColumn={{ md: 'span 3' }}>
                                                        <Input borderRadius="lg" bg="white" placeholder="Street / Building / Area" value={formData.addressLine1.street} onChange={(e) => handleChange(e, 'addressLine1', 'street')} />
                                                    </FormControl>
                                                    <FormControl>
                                                        <Input
                                                            borderRadius="lg" bg="white"
                                                            placeholder="Pincode"
                                                            maxLength={6}
                                                            value={formData.addressLine1.pincode}
                                                            onChange={(e) => handleChange(e, 'addressLine1', 'pincode')}
                                                        />
                                                        {pincodeLoading1 && <Text fontSize="xs" color="blue.500" mt={1}>Fetching city...</Text>}
                                                    </FormControl>
                                                    <FormControl>
                                                        <Input borderRadius="lg" bg="white" placeholder="City (auto-filled)" value={formData.addressLine1.city} onChange={(e) => handleChange(e, 'addressLine1', 'city')} />
                                                    </FormControl>
                                                </SimpleGrid>
                                            </Box>
                                        </Box>
                                    </SimpleGrid>
                                </Box>

                                <Divider />

                                {/* ── Section 2: Identification & Documents (no photo) ── */}
                                <Box>
                                    <Heading size="sm" mb={4} color="blue.700" display="flex" alignItems="center">
                                        <Icon as={FaIdCard} mr={2} /> Identification &amp; Documents
                                    </Heading>
                                    <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
                                        <FileUploadInput label="Aadhar Card" field="aadharCard" />
                                        <FileUploadInput label="PAN Card" field="panCard" />
                                        <FileUploadInput label="Voter ID" field="voterId" />
                                        <FileUploadInput label="Driving License" field="drivingLicense" />
                                    </SimpleGrid>
                                </Box>

                                <Divider />

                                {/* ── Section 3: Secondary Address ── */}
                                <Box p={5} border="1px dashed" borderColor="blue.200" borderRadius="2xl" bg="blue.50">
                                    <HStack justify="space-between" mb={4}>
                                        <Heading size="sm" color="blue.700" display="flex" alignItems="center">
                                            <Icon as={FaMapMarkerAlt} mr={2} /> Secondary Address
                                        </Heading>
                                        <Checkbox colorScheme="blue" fontWeight="600" isChecked={sameAsAddress} onChange={handleCheckboxChange}>
                                            Same as Primary
                                        </Checkbox>
                                    </HStack>
                                    {!sameAsAddress && (
                                        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={3}>
                                            <FormControl gridColumn={{ md: 'span 3' }}>
                                                <Input borderRadius="lg" bg="white" placeholder="Street / Building / Area" value={formData.addressLine2.street} onChange={(e) => handleChange(e, 'addressLine2', 'street')} />
                                            </FormControl>
                                            <FormControl>
                                                <Input
                                                    borderRadius="lg" bg="white"
                                                    placeholder="Pincode"
                                                    maxLength={6}
                                                    value={formData.addressLine2.pincode}
                                                    onChange={(e) => handleChange(e, 'addressLine2', 'pincode')}
                                                />
                                                {pincodeLoading2 && <Text fontSize="xs" color="blue.500" mt={1}>Fetching city...</Text>}
                                            </FormControl>
                                            <FormControl>
                                                <Input borderRadius="lg" bg="white" placeholder="City (auto-filled)" value={formData.addressLine2.city} onChange={(e) => handleChange(e, 'addressLine2', 'city')} />
                                            </FormControl>
                                        </SimpleGrid>
                                    )}
                                </Box>

                                <Divider />

                                {/* ── Section 4: Bank Details ── */}
                                <Box p={5} bg="green.50" borderRadius="2xl" border="1px solid" borderColor="green.200">
                                    <Heading size="sm" mb={4} color="green.700" display="flex" alignItems="center">
                                        <Icon as={FaIdBadge} mr={2} /> Bank Details
                                    </Heading>
                                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                                        <FormControl>
                                            <FormLabel fontWeight="bold" fontSize="sm">IFSC Code</FormLabel>
                                            <HStack>
                                                <Input
                                                    borderRadius="lg" bg="white"
                                                    placeholder="e.g. SBIN0001234"
                                                    value={formData.ifscCode}
                                                    onChange={(e) => handleChange(e, 'ifscCode')}
                                                    textTransform="uppercase"
                                                    maxLength={11}
                                                />
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    colorScheme={bankVerified ? 'green' : 'blue'}
                                                    onClick={handleVerifyBank}
                                                    isLoading={bankVerifying}
                                                    minW="80px"
                                                >
                                                    {bankVerified ? '✓ Verified' : 'Verify'}
                                                </Button>
                                            </HStack>
                                        </FormControl>
                                        <FormControl>
                                            <FormLabel fontWeight="bold" fontSize="sm">Bank Name</FormLabel>
                                            <Input borderRadius="lg" bg="white" placeholder="Auto-filled on verify" value={formData.bankName} onChange={(e) => handleChange(e, 'bankName')} readOnly={bankVerified} />
                                        </FormControl>
                                        <FormControl>
                                            <FormLabel fontWeight="bold" fontSize="sm">Account Holder Name</FormLabel>
                                            <Input borderRadius="lg" bg="white" placeholder="Name as per bank" value={formData.accountName} onChange={(e) => handleChange(e, 'accountName')} />
                                        </FormControl>
                                        <FormControl>
                                            <FormLabel fontWeight="bold" fontSize="sm">Account Number</FormLabel>
                                            <Input borderRadius="lg" bg="white" placeholder="Bank Account Number" value={formData.accountNumber} onChange={(e) => handleChange(e, 'accountNumber')} type="password" />
                                        </FormControl>
                                    </SimpleGrid>
                                </Box>

                                <Divider />

                                {/* ── Section 5: Emergency Contact ── */}
                                <Box>
                                    <Heading size="sm" mb={4} color="red.600" display="flex" alignItems="center">
                                        <Icon as={FaPhoneAlt} mr={2} /> Emergency Contact Information
                                    </Heading>
                                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                                        <FormControl>
                                            <FormLabel fontWeight="bold">Contact Person Name</FormLabel>
                                            <Input borderRadius="xl" placeholder="Full Name" value={formData.emergencyContact.name} onChange={(e) => handleChange(e, 'emergencyContact', 'name')} />
                                        </FormControl>
                                        <FormControl>
                                            <FormLabel fontWeight="bold">Contact Phone Number</FormLabel>
                                            <Input borderRadius="xl" placeholder="Mobile Number" value={formData.emergencyContact.phone} onChange={(e) => handleChange(e, 'emergencyContact', 'phone')} />
                                        </FormControl>
                                    </SimpleGrid>
                                </Box>

                                <Button 
                                    size="lg" 
                                    colorScheme="blue" 
                                    w="full" 
                                    borderRadius="xl" 
                                    h="60px"
                                    type="submit"
                                    leftIcon={<FaIdBadge />}
                                    isLoading={isLoading}
                                    boxShadow="lg"
                                >
                                    {editId ? 'Update Employee Record' : 'Save Employee Record'}
                                </Button>
                            </VStack>
                        </form>
                    </CardBody>
                </Card>
            </Container>
        </Box>
    );
};

const ClientMasterForm = () => {
    const toast = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [nextId, setNextId] = useState('');
    const [clients, setClients] = useState([]);
    const [editId, setEditId] = useState('');
    const [formData, setFormData] = useState({
        clientName: '',
        email: '',
        contactPersonName: '',
        contactPersonPhone: '',
        panCard: '',
        clientAddress: '',
        gstNo: '',
        msmeNo: ''
    });
    const [files, setFiles] = useState({
        gstCert: null,
        msmeCert: null
    });

    const fetchNextId = async () => {
        try {
            const res = await api.get('/client-master/next-id');
            if (res.data.success) setNextId(res.data.nextId);
        } catch (err) { console.error(err); }
    };

    const fetchClients = async () => {
        try {
            const res = await api.get('/client-master');
            if (res.data.success) setClients(res.data.data);
        } catch (err) { console.error(err); }
    };

    useEffect(() => {
        fetchNextId();
        fetchClients();
    }, []);

    const handleSelectClient = (e) => {
        const id = e.target.value;
        setEditId(id);
        if (!id) {
            setFormData({ clientName: '', email: '', contactPersonName: '', contactPersonPhone: '', panCard: '', clientAddress: '', gstNo: '', msmeNo: '' });
            setFiles({ gstCert: null, msmeCert: null });
            fetchNextId();
            return;
        }
        const c = clients.find(x => x._id === id);
        if (c) {
            setNextId(c.clientId || '');
            setFormData({
                clientName: c.clientName || '',
                email: c.email || '',
                contactPersonName: c.contactPerson?.name || '',
                contactPersonPhone: c.contactPerson?.phone || '',
                panCard: c.panCard || '',
                clientAddress: c.clientAddress || '',
                gstNo: c.gstNo || '',
                msmeNo: c.msmeNo || ''
            });
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e, field) => {
        setFiles(prev => ({ ...prev, [field]: e.target.files[0] }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const uploadData = new FormData();
            uploadData.append('clientId', nextId);
            Object.keys(formData).forEach(key => {
                if (formData[key]) uploadData.append(key, formData[key]);
            });
            if (files.gstCert) uploadData.append('gstCert', files.gstCert);
            if (files.msmeCert) uploadData.append('msmeCert', files.msmeCert);

            let response;
            if (editId) {
                response = await api.put(`/client-master/${editId}`, uploadData);
            } else {
                response = await api.post('/client-master', uploadData);
            }

            if (response.data.success) {
                toast({ title: editId ? "Updated" : "Success", description: editId ? "Client updated successfully" : "Client record stored successfully", status: "success", duration: 3000 });
                setFormData({ clientName: '', email: '', contactPersonName: '', contactPersonPhone: '', panCard: '', clientAddress: '', gstNo: '', msmeNo: '' });
                setFiles({ gstCert: null, msmeCert: null });
                setEditId('');
                fetchNextId();
                fetchClients();
            }
        } catch (error) {
            toast({ title: "Error", description: error.response?.data?.message || "Failed to store record", status: "error", duration: 3000 });
        } finally {
            setIsLoading(false);
        }
    };

    const FileUpload = ({ label, field, icon }) => (
        <FormControl>
            <FormLabel fontWeight="bold" fontSize="sm">{label}</FormLabel>
            <Box 
                p={4} border="2px dashed" borderColor={files[field] ? "green.200" : "orange.100"} 
                borderRadius="xl" bg={files[field] ? "green.50" : "orange.50"} textAlign="center" cursor="pointer"
                onClick={() => document.getElementById(`${field}-client-upload`).click()}
                _hover={{ bg: "orange.100", borderColor: "orange.300" }}
            >
                <input type="file" id={`${field}-client-upload`} hidden onChange={(e) => handleFileChange(e, field)} accept="image/*,.pdf" />
                <Icon as={icon || FaCloudUploadAlt} w={6} h={6} color="orange.500" mb={1} />
                <Text fontSize="xs" fontWeight="bold" color="orange.700" noOfLines={1}>
                    {files[field] ? files[field].name : `Upload ${label}`}
                </Text>
            </Box>
        </FormControl>
    );

    return (
        <Box py={5} bg="gray.100" minH="100vh">
            <Container maxW="container.lg">
                <Card variant="elevated" borderRadius="2xl" boxShadow="2xl" bg="white" overflow="hidden">
                    <Box bg="orange.500" p={8} color="white">
                        <Flex justify="space-between" align="center" flexWrap="wrap" gap={4}>
                            <Box>
                                <Heading size="lg">{editId ? 'Edit Client' : 'Client Management'}</Heading>
                                <Text opacity={0.8} mt={1}>Admin Panel: Manage corporate clients and statutory registration details</Text>
                            </Box>
                            <Box w={{ base: "full", md: "300px" }}>
                                <Select bg="white" color="gray.800" placeholder="-- Create New Client --" value={editId} onChange={handleSelectClient} size="md" borderRadius="xl">
                                    {clients.map(c => <option key={c._id} value={c._id}>{c.clientId || 'N/A'} - {c.clientName}</option>)}
                                </Select>
                            </Box>
                        </Flex>
                    </Box>
                    <CardBody p={{ base: 5, md: 10 }}>
                        <form onSubmit={handleSubmit} onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}>
                            <VStack spacing={8} align="stretch">
                                <FormControl isRequired>
                                    <FormLabel fontWeight="bold">Client Name</FormLabel>
                                    <HStack bg="gray.50" p={1} borderRadius="xl" border="1px solid" borderColor="gray.200">
                                        <Icon as={FaIdBadge} ml={3} color="orange.500" />
                                        <Input name="clientName" variant="unstyled" p={2} placeholder="Company Name" value={formData.clientName} onChange={handleChange} />
                                    </HStack>
                                </FormControl>
                                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
                                <FormControl>
                                    <FormLabel fontWeight="bold" fontSize="sm">Reference No (Auto Generated)</FormLabel>
                                    <HStack bg="gray.50" p={1} borderRadius="xl" border="1px dashed" borderColor="gray.300">
                                        <Icon as={FaFingerprint} ml={2} color="orange.500" />
                                        <Input variant="unstyled" p={2} value={nextId || 'Generating...'} isReadOnly color="orange.700" fontWeight="bold" />
                                    </HStack>
                                </FormControl>
                                </SimpleGrid>

                                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
                                    <FormControl>
                                        <FormLabel fontWeight="bold">Billing Email Address</FormLabel>
                                        <HStack bg="gray.50" p={1} borderRadius="xl" border="1px solid" borderColor="gray.200">
                                            <Icon as={FaEnvelope} ml={3} color="orange.500" />
                                            <Input name="email" type="email" variant="unstyled" p={2} placeholder="accounts@client.com" value={formData.email} onChange={handleChange} />
                                        </HStack>
                                    </FormControl>
                                    <FormControl>
                                        <FormLabel fontWeight="bold">PAN Card Number</FormLabel>
                                        <HStack bg="gray.50" p={1} borderRadius="xl" border="1px solid" borderColor="gray.200">
                                            <Icon as={FaIdCard} ml={3} color="orange.500" />
                                            <Input name="panCard" variant="unstyled" p={2} placeholder="ABCDE1234F" textTransform="uppercase" maxLength={10} value={formData.panCard} onChange={handleChange} />
                                        </HStack>
                                    </FormControl>
                                </SimpleGrid>
                                <FormControl>
                                    <FormLabel fontWeight="bold">Client Address</FormLabel>
                                    <HStack bg="gray.50" p={1} borderRadius="xl" border="1px solid" borderColor="gray.200">
                                        <Icon as={FaMapMarkerAlt} ml={3} color="orange.500" />
                                        <Input name="clientAddress" variant="unstyled" p={2} placeholder="Full address" value={formData.clientAddress} onChange={handleChange} />
                                    </HStack>
                                </FormControl>

                                <Divider />

                                <Box>
                                    <Heading size="sm" mb={6} color="orange.700" display="flex" alignItems="center">
                                        <Icon as={FaIdBadge} mr={2} /> Primary Contact Person
                                    </Heading>
                                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
                                        <FormControl>
                                            <FormLabel fontWeight="bold">Contact Person Name</FormLabel>
                                            <Input name="contactPersonName" borderRadius="xl" placeholder="Full Name" value={formData.contactPersonName} onChange={handleChange} />
                                        </FormControl>
                                        <FormControl>
                                            <FormLabel fontWeight="bold">Contact Phone Number</FormLabel>
                                            <Input name="contactPersonPhone" borderRadius="xl" placeholder="Mobile Number" value={formData.contactPersonPhone} onChange={handleChange} />
                                        </FormControl>
                                    </SimpleGrid>
                                </Box>

                                <Divider />

                                <Box>
                                    <Heading size="sm" mb={6} color="orange.700" display="flex" alignItems="center">
                                        <Icon as={FaIdCard} mr={2} /> Statutory Details (GST & MSME)
                                    </Heading>
                                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8} mb={6}>
                                        <FormControl>
                                            <FormLabel fontWeight="bold">GST Number</FormLabel>
                                            <Input name="gstNo" borderRadius="xl" placeholder="27XXXXX0000X1ZX" value={formData.gstNo} onChange={handleChange} />
                                        </FormControl>
                                        <FormControl>
                                            <FormLabel fontWeight="bold">MSME Number</FormLabel>
                                            <Input name="msmeNo" borderRadius="xl" placeholder="UDYAM-XX-00-0000000" value={formData.msmeNo} onChange={handleChange} />
                                        </FormControl>
                                    </SimpleGrid>
                                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
                                        <FileUpload label="GST Certificate" field="gstCert" />
                                        <FileUpload label="MSME Certificate" field="msmeCert" />
                                    </SimpleGrid>
                                </Box>

                                <Button 
                                    size="lg" colorScheme="orange" w="full" borderRadius="xl" h="60px"
                                    type="submit" leftIcon={<FaHandshake />} isLoading={isLoading} boxShadow="lg" mt={4}
                                >
                                    {editId ? 'Update Client Record' : 'Save Client Record'}
                                </Button>
                            </VStack>
                        </form>
                    </CardBody>
                </Card>
            </Container>
        </Box>
    );
};

const SiteMasterForm = () => {
    const toast = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [clients, setClients] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [ledgers, setLedgers] = useState([]);
    const [ledgerSites, setLedgerSites] = useState([]);
    
    const [formData, setFormData] = useState({
        client: '',
        siteName: '',
        siteAddress: '',
        siteLocation: '',
        ledger: '',
        amount: '',
    });
    const [contactPersons, setContactPersons] = useState([{ name: '', phone: '' }]);
    const [docs, setDocs] = useState(null);
    const [locationLoading, setLocationLoading] = useState(false);

    useEffect(() => {
        if (!formData.ledger || !ledgers.includes(formData.ledger)) {
            setLedgerSites([]);
            return;
        }
        const fetchLedgerData = async () => {
            try {
                const res = await api.get(`/site-master/by-ledger/${encodeURIComponent(formData.ledger)}`);
                if (res.data.success) setLedgerSites(res.data.data);
            } catch (err) { console.error(err); }
        };
        fetchLedgerData();
    }, [formData.ledger, ledgers]);

    useEffect(() => {
        const fetchInitial = async () => {
            try {
                const [cRes, eRes, lRes] = await Promise.all([
                    api.get('/client-master'),
                    api.get('/employee-master'),
                    api.get('/site-master/ledgers')
                ]);
                if (cRes.data.success) setClients(cRes.data.data);
                if (eRes.data.success) setEmployees(eRes.data.data);
                if (lRes.data.success) setLedgers(lRes.data.data);
            } catch (error) {
                console.error("Error fetching dependencies:", error);
            }
        };
        fetchInitial();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => setDocs(e.target.files);

    const handleArrayChange = (setFn, index, field, value) => {
        setFn(prev => {
            const next = [...prev];
            if (field === null) next[index] = value;
            else next[index][field] = value;
            return next;
        });
    };
    const addArrayItem = (setFn, blankItem) => setFn(prev => [...prev, blankItem]);
    const removeArrayItem = (setFn, index) => setFn(prev => prev.filter((_, i) => i !== index));

    const handleGetCurrentLocation = () => {
        if (!navigator.geolocation) {
            toast({ title: 'Geolocation not supported', status: 'warning', duration: 2000 });
            return;
        }
        setLocationLoading(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const coords = `${pos.coords.latitude},${pos.coords.longitude}`;
                setFormData(prev => ({ ...prev, siteLocation: coords }));
                setLocationLoading(false);
                toast({ title: 'Location captured', description: coords, status: 'success', duration: 2000 });
            },
            (err) => {
                setLocationLoading(false);
                toast({ title: 'Could not get location', description: err.message, status: 'error', duration: 3000 });
            }
        );
    };

    const handleOpenMap = () => {
        if (!formData.siteLocation) {
            toast({ title: 'No location set', description: 'Use the pin button to get GPS coordinates first', status: 'warning', duration: 2000 });
            return;
        }
        const [lat, lng] = formData.siteLocation.split(',');
        window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const uploadData = new FormData();
            Object.keys(formData).forEach(key => uploadData.append(key, formData[key]));
            const cleanedContacts = contactPersons.filter(cp => cp.name.trim() || cp.phone.trim());
            uploadData.append('contactPersons', JSON.stringify(cleanedContacts));
            if (docs) {
                Array.from(docs).forEach(file => uploadData.append('docs', file));
            }
            const response = await api.post('/site-master', uploadData);
            if (response.data.success) {
                toast({ title: "Success", description: "Site record stored successfully", status: "success", duration: 3000 });
                setFormData({ client: '', siteName: '', siteAddress: '', siteLocation: '', ledger: '', amount: '' });
                setContactPersons([{ name: '', phone: '' }]);
                setDocs(null);
                // Refresh ledgers
                const lRes = await api.get('/site-master/ledgers');
                if (lRes.data.success) setLedgers(lRes.data.data);
            }
        } catch (error) {
            toast({ title: "Error", description: error.response?.data?.message || "Failed to store record", status: "error", duration: 3000 });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Box py={5} bg="gray.100" minH="100vh">
            <Container maxW="container.lg">
                <Card variant="elevated" borderRadius="2xl" boxShadow="2xl" bg="white" overflow="hidden">
                    <Box bg="teal.500" p={{ base: 5, md: 8 }} color="white">
                        <Heading size="lg">Site Management</Heading>
                        <Text opacity={0.8} mt={1}>Admin Panel: Link project sites to clients and manage location details</Text>
                    </Box>
                    <CardBody p={{ base: 4, md: 10 }}>
                        <form onSubmit={handleSubmit} onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}>
                            <VStack spacing={6} align="stretch">
                                <FormControl>
                                    <FormLabel fontWeight="bold">Select Client</FormLabel>
                                    <Select name="client" placeholder="Choose Client" value={formData.client} onChange={handleChange} borderRadius="xl" size="lg" bg="gray.50">
                                        {clients.map(c => <option key={c._id} value={c._id}>{c.clientName}</option>)}
                                    </Select>
                                </FormControl>

                                <FormControl isRequired>
                                    <FormLabel fontWeight="bold">Site Name</FormLabel>
                                    <HStack bg="gray.50" p={1} borderRadius="xl" border="1px solid" borderColor="gray.200">
                                        <Icon as={FaMap} ml={3} color="teal.500" />
                                        <Input name="siteName" variant="unstyled" p={2} placeholder="Construction Site Alpha" value={formData.siteName} onChange={handleChange} />
                                    </HStack>
                                </FormControl>

                                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                                    <FormControl>
                                        <FormLabel fontWeight="bold">Site Ledger (Category)</FormLabel>
                                        <HStack bg="gray.50" p={1} borderRadius="xl" border="1px solid" borderColor="gray.200">
                                            <Icon as={FaFileInvoiceDollar} ml={3} color="teal.500" />
                                            <Input 
                                                name="ledger" 
                                                list="site-ledgers" 
                                                variant="unstyled" 
                                                p={2} 
                                                placeholder="Select or Create Ledger" 
                                                value={formData.ledger} 
                                                onChange={handleChange} 
                                            />
                                            <datalist id="site-ledgers">
                                                {ledgers.map((l, i) => <option key={i} value={l} />)}
                                            </datalist>
                                        </HStack>
                                    </FormControl>
                                    <FormControl>
                                        <FormLabel fontWeight="bold">Budget / Amount (₹)</FormLabel>
                                        <HStack bg="gray.50" p={1} borderRadius="xl" border="1px solid" borderColor="gray.200">
                                            <Icon as={FaMoneyBillWave} ml={3} color="teal.500" />
                                            <Input name="amount" type="number" variant="unstyled" p={2} placeholder="e.g. 500000" value={formData.amount} onChange={handleChange} />
                                        </HStack>
                                    </FormControl>
                                </SimpleGrid>

                                {ledgerSites.length > 0 && (
                                    <Box p={4} bg="teal.50" borderRadius="xl" border="1px solid" borderColor="teal.200">
                                        <Text fontWeight="bold" fontSize="sm" color="teal.700" mb={2}>
                                            Existing Sites in Ledger "{formData.ledger}":
                                        </Text>
                                        <VStack align="stretch" spacing={2}>
                                            {ledgerSites.map((s, i) => (
                                                <HStack key={i} justify="space-between" bg="white" p={2} borderRadius="md" shadow="sm">
                                                    <Text fontSize="xs" fontWeight="bold">{s.siteName}</Text>
                                                    <Text fontSize="xs" color="gray.600">Amt: ₹{s.amount?.toLocaleString()}</Text>
                                                </HStack>
                                            ))}
                                            <HStack justify="space-between" pt={1} borderTop="1px solid" borderColor="teal.100">
                                                <Text fontSize="xs" fontWeight="bold">Total Ledger Amount:</Text>
                                                <Text fontSize="xs" fontWeight="bold" color="teal.600">
                                                    ₹{ledgerSites.reduce((sum, s) => sum + (s.amount || 0), 0).toLocaleString()}
                                                </Text>
                                            </HStack>
                                        </VStack>
                                    </Box>
                                )}

                                {/* ── GPS Location Field ── */}
                                <FormControl>
                                    <FormLabel fontWeight="bold" display="flex" alignItems="center">
                                        <Icon as={FaMapMarkerAlt} mr={2} color="teal.500" /> Site Address Location
                                    </FormLabel>
                                    <HStack spacing={2}>
                                        <Input
                                            name="siteLocation"
                                            borderRadius="xl"
                                            placeholder="Manually enter address or click location button"
                                            value={formData.siteLocation}
                                            onChange={handleChange}
                                            bg="gray.50"
                                            fontSize="sm"
                                        />
                                        <Button
                                            type="button"
                                            colorScheme="teal"
                                            variant="outline"
                                            onClick={handleGetCurrentLocation}
                                            isLoading={locationLoading}
                                            minW={{ base: '44px', md: '120px' }}
                                            borderRadius="xl"
                                            title="Get my current GPS location"
                                        >
                                            <Icon as={FaMapMarkerAlt} display={{ base: 'block', md: 'none' }} />
                                            <Text display={{ base: 'none', md: 'block' }}>📍 Get GPS</Text>
                                        </Button>
                                        <Button
                                            type="button"
                                            colorScheme="blue"
                                            onClick={handleOpenMap}
                                            minW={{ base: '44px', md: '120px' }}
                                            borderRadius="xl"
                                            title="View on Google Maps"
                                        >
                                            <Icon as={FaMapMarkedAlt} display={{ base: 'block', md: 'none' }} />
                                            <Text display={{ base: 'none', md: 'block' }}>🗺️ View Map</Text>
                                        </Button>
                                    </HStack>
                                    {formData.siteLocation && (
                                        <HStack mt={2} p={2} bg="teal.50" borderRadius="lg" border="1px solid" borderColor="teal.200" cursor="pointer" onClick={handleOpenMap} _hover={{ bg: 'teal.100' }}>
                                            <Icon as={FaMapMarkerAlt} color="teal.500" />
                                            <Text fontSize="sm" color="teal.700" fontWeight="600">{formData.siteLocation}</Text>
                                            <Text fontSize="xs" color="teal.500" ml="auto">Click to open in Google Maps →</Text>
                                        </HStack>
                                    )}
                                </FormControl>

                                <Divider opacity={0.5} />

                                {/* ── Contact Persons ── */}
                                <Box bg="blue.50" p={5} borderRadius="xl" border="1px solid" borderColor="blue.100">
                                    <HStack justify="space-between" mb={4} flexWrap="wrap" gap={2}>
                                        <Heading size="sm" color="blue.700" display="flex" alignItems="center">
                                            <Icon as={FaIdBadge} mr={2} /> Site Contact Persons
                                        </Heading>
                                        <Button type="button" size="xs" colorScheme="blue" onClick={() => addArrayItem(setContactPersons, { name: '', phone: '' })}>+ Add Person</Button>
                                    </HStack>
                                    <VStack spacing={3} align="stretch">
                                        {contactPersons.map((cp, idx) => (
                                            <HStack key={idx} bg="white" p={2} borderRadius="lg" shadow="sm" flexWrap={{ base: 'wrap', md: 'nowrap' }} gap={2}>
                                                <Input size="sm" placeholder="Full Name" value={cp.name} onChange={(e) => handleArrayChange(setContactPersons, idx, 'name', e.target.value)} />
                                                <Input size="sm" placeholder="Phone Number" value={cp.phone} onChange={(e) => handleArrayChange(setContactPersons, idx, 'phone', e.target.value)} />
                                                <IconButton size="sm" colorScheme="red" variant="ghost" icon={<FaTrash />} onClick={() => removeArrayItem(setContactPersons, idx)} />
                                            </HStack>
                                        ))}
                                    </VStack>
                                </Box>

                                <Divider opacity={0.5} />

                                <FormControl>
                                    <FormLabel fontWeight="bold">Site Documents (Maps / Permits)</FormLabel>
                                    <Box 
                                        p={6} border="2px dashed" borderColor="teal.100" 
                                        borderRadius="xl" bg="teal.50" textAlign="center" cursor="pointer"
                                        onClick={() => document.getElementById('site-docs-upload').click()}
                                        _hover={{ bg: "teal.100", borderColor: "teal.300" }}
                                    >
                                        <input type="file" id="site-docs-upload" hidden onChange={handleFileChange} multiple accept="image/*,.pdf,.doc,.docx" />
                                        <Icon as={FaCloudUploadAlt} w={6} h={6} color="teal.500" mb={1} />
                                        <Text fontSize="xs" fontWeight="bold" color="teal.700">
                                            {docs ? `${docs.length} file(s) selected` : "Upload Site Related Files"}
                                        </Text>
                                    </Box>
                                </FormControl>

                                <Button 
                                    size="lg" colorScheme="teal" w="full" borderRadius="xl" h="60px"
                                    type="submit" leftIcon={<FaMap />} isLoading={isLoading} boxShadow="lg" mt={2}
                                >
                                    Save Master Site Profile
                                </Button>
                            </VStack>
                        </form>
                    </CardBody>
                </Card>
            </Container>
        </Box>
    );
};

const ScheduleMasterForm = () => {
    const toast = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [clients, setClients] = useState([]);
    const [sites, setSites] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [schedules, setSchedules] = useState([]);
    const [viewDate, setViewDate] = useState(new Date().toISOString().split('T')[0]);
    const [editId, setEditId] = useState(null);

    // Search states
    const [clientSearch, setClientSearch] = useState('');
    const [siteSearch, setSiteSearch] = useState('');
    const [empSearch, setEmpSearch] = useState('');
    const [showClientList, setShowClientList] = useState(false);
    const [showSiteList, setShowSiteList] = useState(false);
    const [selectedClientName, setSelectedClientName] = useState('');
    const [selectedSiteName, setSelectedSiteName] = useState('');

    const [formData, setFormData] = useState({
        client: '', site: '', scheduleDate: '', workForAppley: '',
        operativeNames: [], helpers: [], notes: '', status: 'scheduled'
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [cRes, eRes] = await Promise.all([
                    api.get('/client-master'),
                    api.get('/employee-master')
                ]);
                if (cRes.data.success) setClients(cRes.data.data);
                if (eRes.data.success) setEmployees(eRes.data.data);
            } catch (err) { console.error(err); }
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (!formData.client) { setSites([]); setSelectedSiteName(''); return; }
        const fetchSites = async () => {
            try {
                const res = await api.get(`/schedule-master/sites-by-client/${formData.client}`);
                if (res.data.success) setSites(res.data.data);
            } catch (err) { console.error(err); }
        };
        fetchSites();
    }, [formData.client]);

    useEffect(() => {
        if (!viewDate) return;
        const fetchSchedules = async () => {
            try {
                const res = await api.get(`/schedule-master?date=${viewDate}`);
                if (res.data.success) setSchedules(res.data.data);
            } catch (err) { console.error(err); }
        };
        fetchSchedules();
    }, [viewDate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const selectClient = (c) => {
        setFormData(prev => ({ ...prev, client: c._id, site: '' }));
        setSelectedClientName(c.clientName);
        setClientSearch('');
        setShowClientList(false);
        setSelectedSiteName('');
    };

    const selectSite = (s) => {
        setFormData(prev => ({ ...prev, site: s._id }));
        setSelectedSiteName(s.siteName);
        setSiteSearch('');
        setShowSiteList(false);
    };

    const handleHelperToggle = (empId) => {
        setFormData(prev => {
            const exists = prev.helpers.includes(empId);
            return { ...prev, helpers: exists ? prev.helpers.filter(h => h !== empId) : [...prev.helpers, empId] };
        });
    };

    const handleOperativeToggle = (empId) => {
        setFormData(prev => {
            const exists = prev.operativeNames.includes(empId);
            return { ...prev, operativeNames: exists ? prev.operativeNames.filter(h => h !== empId) : [...prev.operativeNames, empId] };
        });
    };

    const handleEdit = (schedule) => {
        setEditId(schedule._id);
        setSelectedClientName(schedule.client?.clientName || '');
        setSelectedSiteName(schedule.site?.siteName || '');
        const loadedOperatives = schedule.operativeNames?.map(op => op._id) || [];
        if (loadedOperatives.length === 0 && schedule.operativeName) {
            loadedOperatives.push(schedule.operativeName._id || schedule.operativeName);
        }
        
        setFormData({
            client: schedule.client?._id || '',
            site: schedule.site?._id || '',
            scheduleDate: schedule.scheduleDate ? new Date(schedule.scheduleDate).toISOString().split('T')[0] : '',
            workForAppley: schedule.workForAppley || schedule.contactPerson || '',
            operativeNames: loadedOperatives,
            helpers: schedule.helpers?.map(h => h._id) || [],
            notes: schedule.notes || '',
            status: schedule.status || 'scheduled'
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleClear = () => {
        setEditId(null);
        setSelectedClientName(''); setSelectedSiteName('');
        setFormData({ client: '', site: '', scheduleDate: '', workForAppley: '', operativeNames: [], helpers: [], notes: '', status: 'scheduled' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const payload = { ...formData };
            let response;
            if (editId) {
                response = await api.put(`/schedule-master/${editId}`, payload);
            } else {
                response = await api.post('/schedule-master', payload);
            }
            if (response.data.success) {
                toast({ title: editId ? 'Updated!' : 'Scheduled!', description: response.data.message, status: 'success', duration: 3000 });
                handleClear();
                const res = await api.get(`/schedule-master?date=${viewDate}`);
                if (res.data.success) setSchedules(res.data.data);
            }
        } catch (error) {
            toast({ title: 'Error', description: error.response?.data?.message || 'Operation failed', status: 'error', duration: 3000 });
        } finally { setIsLoading(false); }
    };

    const filteredClients = clients.filter(c => c.clientName.toLowerCase().includes(clientSearch.toLowerCase()));
    const filteredSites = sites.filter(s => s.siteName.toLowerCase().includes(siteSearch.toLowerCase()));
    const filteredEmployees = employees.filter(e => e.name.toLowerCase().includes(empSearch.toLowerCase()));
    const statusColors = { scheduled: 'blue', 'in-progress': 'orange', completed: 'green', cancelled: 'red' };
    const statusIcons = { scheduled: '📅', 'in-progress': '⚙️', completed: '✅', cancelled: '❌' };

    return (
        <Box py={5} bg="gray.100" minH="100vh">
            <Container maxW="container.xl">
                <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6} alignItems="start">

                    {/* ── LEFT: Form ── */}
                    <Card borderRadius="2xl" boxShadow="xl" bg="white" overflow="hidden">
                        <Box bg={editId ? 'purple.600' : 'green.600'} px={7} py={5} color="white">
                            <HStack>
                                <Icon as={editId ? FaEdit : FaCalendarAlt} w={5} h={5} />
                                <Heading size="md">{editId ? 'Edit Schedule' : 'Schedule a Site Visit'}</Heading>
                            </HStack>
                            <Text opacity={0.75} mt={1} fontSize="xs">Only Client, Site & Date are mandatory. Fill others anytime via Edit.</Text>
                        </Box>
                        <CardBody px={7} py={6}>
                            <form onSubmit={handleSubmit}>
                                <VStack spacing={5} align="stretch">

                                    {/* --- Client Search --- */}
                                    <FormControl isRequired>
                                        <FormLabel fontWeight="bold" fontSize="sm" color="gray.700">
                                            <Icon as={FaBuilding} mr={1} color="orange.400" /> Client
                                        </FormLabel>
                                        {selectedClientName && !showClientList ? (
                                            <HStack bg="orange.50" border="1px solid" borderColor="orange.200" px={4} py={2} borderRadius="xl" justify="space-between">
                                                <Text fontWeight="bold" fontSize="sm" color="orange.700">{selectedClientName}</Text>
                                                <Button type="button" size="xs" variant="ghost" colorScheme="orange" onClick={() => { setShowClientList(true); setClientSearch(''); }}>Change</Button>
                                            </HStack>
                                        ) : (
                                            <Box position="relative">
                                                <Input
                                                    placeholder="🔍 Search client by name..."
                                                    value={clientSearch}
                                                    onChange={e => { setClientSearch(e.target.value); setShowClientList(true); }}
                                                    onFocus={() => setShowClientList(true)}
                                                    borderRadius="xl" bg="gray.50"
                                                />
                                                {showClientList && (
                                                    <Box position="absolute" zIndex={10} w="100%" bg="white" border="1px solid" borderColor="gray.200" borderRadius="xl" boxShadow="lg" maxH="200px" overflowY="auto" mt={1}>
                                                        {filteredClients.length === 0 ? (
                                                            <Text p={3} fontSize="sm" color="gray.400">No clients found</Text>
                                                        ) : filteredClients.map(c => (
                                                            <Box key={c._id} px={4} py={2} cursor="pointer" _hover={{ bg: 'orange.50' }} onClick={() => selectClient(c)}>
                                                                <Text fontSize="sm" fontWeight="bold">{c.clientName}</Text>
                                                                {c.email && <Text fontSize="xs" color="gray.400">{c.email}</Text>}
                                                            </Box>
                                                        ))}
                                                    </Box>
                                                )}
                                            </Box>
                                        )}
                                    </FormControl>

                                    {/* --- Site Search --- */}
                                    <FormControl isRequired>
                                        <FormLabel fontWeight="bold" fontSize="sm" color="gray.700">
                                            <Icon as={FaMap} mr={1} color="teal.400" /> Site
                                        </FormLabel>
                                        {!formData.client ? (
                                            <Box bg="gray.50" border="1px dashed" borderColor="gray.300" px={4} py={3} borderRadius="xl">
                                                <Text fontSize="sm" color="gray.400">Select a client first to view sites</Text>
                                            </Box>
                                        ) : selectedSiteName && !showSiteList ? (
                                            <HStack bg="teal.50" border="1px solid" borderColor="teal.200" px={4} py={2} borderRadius="xl" justify="space-between">
                                                <Text fontWeight="bold" fontSize="sm" color="teal.700">{selectedSiteName}</Text>
                                                <Button size="xs" variant="ghost" colorScheme="teal" onClick={() => { setShowSiteList(true); setSiteSearch(''); }}>Change</Button>
                                            </HStack>
                                        ) : (
                                            <Box position="relative">
                                                <Input
                                                    placeholder="🔍 Search site by name..."
                                                    value={siteSearch}
                                                    onChange={e => { setSiteSearch(e.target.value); setShowSiteList(true); }}
                                                    onFocus={() => setShowSiteList(true)}
                                                    borderRadius="xl" bg="gray.50"
                                                    isDisabled={!formData.client}
                                                />
                                                {showSiteList && (
                                                    <Box position="absolute" zIndex={10} w="100%" bg="white" border="1px solid" borderColor="gray.200" borderRadius="xl" boxShadow="lg" maxH="200px" overflowY="auto" mt={1}>
                                                        {filteredSites.length === 0 ? (
                                                            <Text p={3} fontSize="sm" color="gray.400">No sites found for this client</Text>
                                                        ) : filteredSites.map(s => (
                                                            <Box key={s._id} px={4} py={2} cursor="pointer" _hover={{ bg: 'teal.50' }} onClick={() => selectSite(s)}>
                                                                <Text fontSize="sm" fontWeight="bold">{s.siteName}</Text>
                                                                {s.siteAddress && <Text fontSize="xs" color="gray.400">{s.siteAddress}</Text>}
                                                            </Box>
                                                        ))}
                                                    </Box>
                                                )}
                                            </Box>
                                        )}
                                    </FormControl>

                                    <SimpleGrid columns={2} spacing={4}>
                                        <FormControl isRequired>
                                            <FormLabel fontWeight="bold" fontSize="sm" color="gray.700">📅 Date</FormLabel>
                                            <Input type="date" name="scheduleDate" value={formData.scheduleDate} onChange={handleChange} borderRadius="xl" bg="gray.50" />
                                        </FormControl>
                                        <FormControl>
                                            <FormLabel fontWeight="bold" fontSize="sm" color="gray.700">🔄 Status</FormLabel>
                                            <Select name="status" value={formData.status} onChange={handleChange} borderRadius="xl" bg="gray.50">
                                                <option value="scheduled">Scheduled</option>
                                                <option value="in-progress">In Progress</option>
                                                <option value="completed">Completed</option>
                                                <option value="cancelled">Cancelled</option>
                                            </Select>
                                        </FormControl>
                                    </SimpleGrid>

                                    <FormControl>
                                        <FormLabel fontWeight="bold" fontSize="sm" color="gray.700">📞 work for Apply</FormLabel>
                                        <Input name="workForAppley" placeholder="On-site contact name" value={formData.workForAppley} onChange={handleChange} borderRadius="xl" bg="gray.50" />
                                    </FormControl>

                                    <Divider />

                                    {/* operativeNames with search (combo with Helpers maybe?) */}
                                    <FormControl>
                                        <FormLabel fontWeight="bold" fontSize="sm" color="gray.700">
                                            <Icon as={FaStar} color="yellow.400" mr={1} /> Operative Names
                                            {formData.operativeNames.length > 0 && <Tag ml={2} size="sm" colorScheme="purple">{formData.operativeNames.length} selected</Tag>}
                                        </FormLabel>
                                        <Input
                                            placeholder="🔍 Filter operatives..."
                                            value={empSearch}
                                            onChange={e => setEmpSearch(e.target.value)}
                                            borderRadius="xl" bg="gray.50" mb={2} size="sm"
                                        />
                                        <Box maxH="150px" overflowY="auto" border="1px solid" borderColor="gray.200" borderRadius="xl" p={2} bg="gray.50">
                                            {filteredEmployees.length === 0 && <Text fontSize="xs" color="gray.400" p={2}>No employees match</Text>}
                                            {filteredEmployees.map(e => (
                                                <HStack key={e._id} py={1} px={2} cursor="pointer" borderRadius="lg" _hover={{ bg: 'purple.50' }} onClick={() => handleOperativeToggle(e._id)}>
                                                    <Checkbox isChecked={formData.operativeNames.includes(e._id)} onChange={() => handleOperativeToggle(e._id)} colorScheme="purple" pointerEvents="none" />
                                                    <Text fontSize="sm">{e.name} <Text as="span" color="gray.400" fontSize="xs">({e.phone})</Text></Text>
                                                </HStack>
                                            ))}
                                        </Box>
                                    </FormControl>

                                    {/* Helpers with search */}
                                    <FormControl>
                                        <FormLabel fontWeight="bold" fontSize="sm" color="gray.700">
                                            <Icon as={FaUsers} color="blue.400" mr={1} /> Helpers
                                            {formData.helpers.length > 0 && <Tag ml={2} size="sm" colorScheme="blue">{formData.helpers.length} selected</Tag>}
                                        </FormLabel>
                                        <Input
                                            placeholder="🔍 Filter helpers..."
                                            value={empSearch}
                                            onChange={e => setEmpSearch(e.target.value)}
                                            borderRadius="xl" bg="gray.50" mb={2} size="sm"
                                        />
                                        <Box maxH="150px" overflowY="auto" border="1px solid" borderColor="gray.200" borderRadius="xl" p={2} bg="gray.50">
                                            {filteredEmployees.length === 0 && <Text fontSize="xs" color="gray.400" p={2}>No employees match</Text>}
                                            {filteredEmployees.map(e => (
                                                <HStack key={e._id} py={1} px={2} cursor="pointer" borderRadius="lg" _hover={{ bg: 'blue.50' }} onClick={() => handleHelperToggle(e._id)}>
                                                    <Checkbox isChecked={formData.helpers.includes(e._id)} onChange={() => handleHelperToggle(e._id)} colorScheme="blue" pointerEvents="none" />
                                                    <Text fontSize="sm">{e.name} <Text as="span" color="gray.400" fontSize="xs">({e.phone})</Text></Text>
                                                </HStack>
                                            ))}
                                        </Box>
                                    </FormControl>

                                    <FormControl>
                                        <FormLabel fontWeight="bold" fontSize="sm" color="gray.700">📝 Notes</FormLabel>
                                        <Input name="notes" placeholder="Any additional notes..." value={formData.notes} onChange={handleChange} borderRadius="xl" bg="gray.50" />
                                    </FormControl>

                                    <HStack spacing={3} pt={1}>
                                        <Button type="submit" colorScheme={editId ? 'purple' : 'green'} flex={1} borderRadius="xl" h="48px"
                                            leftIcon={<Icon as={editId ? FaEdit : FaCalendarAlt} />} isLoading={isLoading}>
                                            {editId ? 'Update Schedule' : 'Create Schedule'}
                                        </Button>
                                        {editId && (
                                            <Button variant="outline" colorScheme="gray" borderRadius="xl" h="48px" onClick={handleClear}>Cancel</Button>
                                        )}
                                    </HStack>
                                </VStack>
                            </form>
                        </CardBody>
                    </Card>

                    {/* ── RIGHT: Date Viewer ── */}
                    <Card borderRadius="2xl" boxShadow="xl" bg="white" overflow="hidden">
                        <Box bg="gray.800" px={7} py={5} color="white">
                            <HStack justify="space-between">
                                <HStack>
                                    <Icon as={FaEye} w={5} h={5} />
                                    <Heading size="md">Schedule Viewer</Heading>
                                </HStack>
                                <Tag colorScheme="whiteAlpha" borderRadius="full" size="sm">{schedules.length} records</Tag>
                            </HStack>
                            <Text opacity={0.6} mt={1} fontSize="xs">Browse schedules by date — click Edit to load into the form</Text>
                        </Box>

                        <Box px={7} py={4} bg="gray.50" borderBottom="1px solid" borderColor="gray.100">
                            <FormControl>
                                <FormLabel fontWeight="bold" fontSize="xs" color="gray.500" mb={1}>SELECT DATE</FormLabel>
                                <Input type="date" value={viewDate} onChange={e => setViewDate(e.target.value)} borderRadius="xl" bg="white" size="sm" />
                            </FormControl>
                        </Box>

                        <CardBody px={5} py={4} maxH="700px" overflowY="auto">
                            {schedules.length === 0 ? (
                                <Box textAlign="center" py={14}>
                                    <Icon as={FaCalendarAlt} w={12} h={12} color="gray.200" />
                                    <Text color="gray.300" mt={4} fontWeight="bold">No schedules for this date</Text>
                                </Box>
                            ) : (
                                <VStack spacing={4} align="stretch">
                                    {schedules.map((s, idx) => (
                                        <Box key={s._id} borderRadius="xl" border="1px solid" borderColor="gray.100" overflow="hidden" boxShadow="sm" _hover={{ boxShadow: 'md', transform: 'translateY(-1px)' }} transition="all 0.2s">

                                            {/* Card Header */}
                                            <Box bg={`${statusColors[s.status] || 'gray'}.50`} px={4} py={3} borderBottom="1px solid" borderColor={`${statusColors[s.status] || 'gray'}.100`}>
                                                <HStack justify="space-between">
                                                    <HStack spacing={2}>
                                                        <Text fontSize="lg">{statusIcons[s.status] || '📅'}</Text>
                                                        <VStack align="start" spacing={0}>
                                                            <Text fontWeight="bold" fontSize="sm" lineHeight={1.2}>#{idx + 1} — {s.site?.siteName || '—'}</Text>
                                                            <Text fontSize="xs" color="gray.500">{s.site?.siteAddress || ''}</Text>
                                                        </VStack>
                                                    </HStack>
                                                    <HStack>
                                                        <Tag size="sm" colorScheme={statusColors[s.status] || 'gray'} borderRadius="full" fontWeight="bold">
                                                            <TagLabel textTransform="capitalize">{s.status}</TagLabel>
                                                        </Tag>
                                                        <Button size="xs" colorScheme="purple" borderRadius="lg" leftIcon={<FaEdit />} onClick={() => handleEdit(s)}>Edit</Button>
                                                    </HStack>
                                                </HStack>
                                            </Box>

                                            {/* Card Body */}
                                            <Box px={4} py={3} bg="white">
                                                <SimpleGrid columns={2} spacing={3}>

                                                    {/* Client */}
                                                    <Box>
                                                        <Text fontSize="10px" fontWeight="bold" color="gray.400" textTransform="uppercase" letterSpacing="wide" mb={0.5}>Client</Text>
                                                        <HStack spacing={1}>
                                                            <Icon as={FaBuilding} color="orange.400" w={3} h={3} />
                                                            <Text fontSize="sm" fontWeight="semibold" color="gray.700">{s.client?.clientName || '—'}</Text>
                                                        </HStack>
                                                    </Box>

                                                    {/* Contact */}
                                                    {(s.workForAppley || s.contactPerson) && (
                                                        <Box>
                                                            <Text fontSize="10px" fontWeight="bold" color="gray.400" textTransform="uppercase" letterSpacing="wide" mb={0.5}>work for Apply</Text>
                                                            <HStack spacing={1}>
                                                                <Icon as={FaPhoneAlt} color="green.400" w={3} h={3} />
                                                                <Text fontSize="sm" fontWeight="semibold" color="gray.700">{s.workForAppley || s.contactPerson}</Text>
                                                            </HStack>
                                                        </Box>
                                                    )}

                                                    {/* operativeNames */}
                                                    {(s.operativeNames?.length > 0 || s.operativeName) && (
                                                        <Box mt={3} gridColumn="span 2">
                                                            <Text fontSize="10px" fontWeight="bold" color="gray.400" textTransform="uppercase" letterSpacing="wide" mb={1.5}>
                                                                ⭐ Operative Names ({[...(s.operativeNames || []), ...(s.operativeName ? [s.operativeName] : [])].length})
                                                            </Text>
                                                            <Wrap spacing={2}>
                                                                {[...(s.operativeNames || []), ...(s.operativeName ? [s.operativeName] : [])].map(op => (
                                                                    <WrapItem key={op._id}>
                                                                        <HStack spacing={1} bg="yellow.50" px={2} py={1} borderRadius="lg" display="inline-flex" border="1px solid" borderColor="yellow.200">
                                                                            <Icon as={FaStar} color="yellow.500" w={3} h={3} />
                                                                            <Text fontSize="sm" fontWeight="bold" color="yellow.700">{op.name}</Text>
                                                                            <Text fontSize="xs" color="gray.500">· {op.phone}</Text>
                                                                        </HStack>
                                                                    </WrapItem>
                                                                ))}
                                                            </Wrap>
                                                        </Box>
                                                    )}
                                                </SimpleGrid>

                                                {/* Helpers */}
                                                {s.helpers?.length > 0 && (
                                                    <Box mt={3}>
                                                        <Text fontSize="10px" fontWeight="bold" color="gray.400" textTransform="uppercase" letterSpacing="wide" mb={1.5}>
                                                            👷 Helpers ({s.helpers.length})
                                                        </Text>
                                                        <Wrap spacing={1}>
                                                            {s.helpers.map(h => (
                                                                <WrapItem key={h._id}>
                                                                    <Tag size="sm" colorScheme="blue" borderRadius="full" variant="subtle">
                                                                        <TagLabel fontWeight="semibold">{h.name}</TagLabel>
                                                                    </Tag>
                                                                </WrapItem>
                                                            ))}
                                                        </Wrap>
                                                    </Box>
                                                )}

                                                {/* Notes */}
                                                {s.notes && (
                                                    <Box mt={3} bg="gray.50" px={3} py={2} borderRadius="lg" borderLeft="3px solid" borderColor="gray.300">
                                                        <Text fontSize="10px" fontWeight="bold" color="gray.400" textTransform="uppercase" mb={0.5}>Notes</Text>
                                                        <Text fontSize="xs" color="gray.600">{s.notes}</Text>
                                                    </Box>
                                                )}
                                            </Box>
                                        </Box>
                                    ))}
                                </VStack>
                            )}
                        </CardBody>
                    </Card>

                </SimpleGrid>
            </Container>
        </Box>
    );
};

const InstrumentMasterForm = () => {
    const toast = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [instruments, setInstruments] = useState([]);
    const [editId, setEditId] = useState(null);
    const [photoFile, setPhotoFile] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [formData, setFormData] = useState({ refNo: '', instrumentName: '', notes: '' });

    const fetchInstruments = async () => {
        try {
            const res = await api.get('/instrument-master');
            if (res.data.success) setInstruments(res.data.data);
        } catch (err) { console.error(err); }
    };

    useEffect(() => { fetchInstruments(); }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setPhotoFile(file);
        setPhotoPreview(URL.createObjectURL(file));
    };

    const handleEdit = (inst) => {
        setEditId(inst._id);
        setFormData({ refNo: inst.refNo, instrumentName: inst.instrumentName, notes: inst.notes || '' });
        setPhotoPreview(inst.photo?.url ? `http://localhost:5001${inst.photo.url}` : null);
        setPhotoFile(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleClear = () => {
        setEditId(null);
        setFormData({ refNo: '', instrumentName: '', notes: '' });
        setPhotoFile(null);
        setPhotoPreview(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const uploadData = new FormData();
            uploadData.append('refNo', formData.refNo);
            uploadData.append('instrumentName', formData.instrumentName);
            if (formData.notes) uploadData.append('notes', formData.notes);
            if (photoFile) uploadData.append('photo', photoFile);

            let response;
            if (editId) {
                response = await api.put(`/instrument-master/${editId}`, uploadData);
            } else {
                response = await api.post('/instrument-master', uploadData);
            }
            if (response.data.success) {
                toast({ title: editId ? 'Updated!' : 'Saved!', description: response.data.message, status: 'success', duration: 3000 });
                handleClear();
                fetchInstruments();
            }
        } catch (error) {
            toast({ title: 'Error', description: error.response?.data?.message || 'Operation failed', status: 'error', duration: 3000 });
        } finally { setIsLoading(false); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this instrument?')) return;
        try {
            await api.delete(`/instrument-master/${id}`);
            toast({ title: 'Deleted', status: 'info', duration: 2000 });
            fetchInstruments();
            if (editId === id) handleClear();
        } catch (err) {
            toast({ title: 'Error', description: err.response?.data?.message || 'Delete failed', status: 'error', duration: 3000 });
        }
    };

    return (
        <Box py={8} bg="gray.100" minH="100vh">
            <Container maxW="container.md">
                <Card borderRadius="2xl" boxShadow="xl" bg="white" overflow="hidden">
                    <Box px={8} py={6} color="white"
                        bgGradient={editId ? 'linear(to-r, purple.600, purple.400)' : 'linear(to-r, blue.700, blue.500)'}>
                        <HStack>
                            <Icon as={FaWrench} w={5} h={5} />
                            <Heading size="md">{editId ? 'Edit Instrument' : 'Add Instrument'}</Heading>
                        </HStack>
                        <Text opacity={0.75} mt={1} fontSize="xs">Instrument Name is required. Ref No is optional.</Text>
                    </Box>

                    <CardBody px={8} py={7}>
                        <form onSubmit={handleSubmit}>
                            <VStack spacing={6} align="stretch">

                                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
                                    <FormControl>
                                        <FormLabel fontWeight="bold" fontSize="sm" color="gray.700">
                                            <Icon as={FaTag} mr={1} color="blue.400" /> Reference No
                                        </FormLabel>
                                        <Input name="refNo" placeholder="e.g. INST-2024-001" value={formData.refNo} onChange={handleChange} borderRadius="xl" bg="gray.50" />
                                    </FormControl>
                                    <FormControl isRequired>
                                        <FormLabel fontWeight="bold" fontSize="sm" color="gray.700">
                                            <Icon as={FaWrench} mr={1} color="blue.400" /> Instrument Name
                                        </FormLabel>
                                        <Input name="instrumentName" placeholder="e.g. Total Station" value={formData.instrumentName} onChange={handleChange} borderRadius="xl" bg="gray.50" />
                                    </FormControl>
                                </SimpleGrid>

                                {/* Photo Upload — updates live on selection and when editing */}
                                <FormControl>
                                    <FormLabel fontWeight="bold" fontSize="sm" color="gray.700">
                                        📷 Instrument Photo <Text as="span" color="gray.400" fontWeight="normal">(optional)</Text>
                                    </FormLabel>
                                    <Box
                                        border="2px dashed"
                                        borderColor={photoPreview ? 'blue.300' : 'gray.200'}
                                        borderRadius="2xl"
                                        p={5}
                                        bg={photoPreview ? 'blue.50' : 'gray.50'}
                                        cursor="pointer"
                                        onClick={() => document.getElementById('instr-photo-upload').click()}
                                        _hover={{ borderColor: 'blue.400', bg: 'blue.50' }}
                                        transition="all 0.2s"
                                        textAlign="center"
                                    >
                                        <input type="file" id="instr-photo-upload" hidden accept="image/*" onChange={handlePhotoChange} />
                                        {photoPreview ? (
                                            <Box>
                                                <Image
                                                    src={photoPreview}
                                                    alt="Preview"
                                                    maxH="220px"
                                                    mx="auto"
                                                    borderRadius="xl"
                                                    objectFit="cover"
                                                    boxShadow="md"
                                                />
                                                <HStack justify="center" mt={3} spacing={1}>
                                                    <Icon as={FaCamera} color="blue.500" w={3} h={3} />
                                                    <Text fontSize="xs" color="blue.600" fontWeight="bold">Click to change photo</Text>
                                                </HStack>
                                            </Box>
                                        ) : (
                                            <Box py={8}>
                                                <Icon as={FaCamera} w={10} h={10} color="gray.300" />
                                                <Text fontSize="sm" color="gray.400" mt={3}>Click to upload instrument photo</Text>
                                                <Text fontSize="xs" color="gray.300" mt={1}>JPG, PNG — up to 5MB</Text>
                                            </Box>
                                        )}
                                    </Box>
                                </FormControl>

                                <FormControl>
                                    <FormLabel fontWeight="bold" fontSize="sm" color="gray.700">
                                        📝 Notes <Text as="span" color="gray.400" fontWeight="normal">(optional)</Text>
                                    </FormLabel>
                                    <Input
                                        name="notes"
                                        placeholder="Calibration date, condition, remarks..."
                                        value={formData.notes}
                                        onChange={handleChange}
                                        borderRadius="xl"
                                        bg="gray.50"
                                    />
                                </FormControl>

                                <HStack spacing={3} pt={1}>
                                    <Button
                                        type="submit" flex={1} h="50px" borderRadius="xl"
                                        bgGradient={editId ? 'linear(to-r, purple.500, purple.400)' : 'linear(to-r, blue.600, blue.500)'}
                                        color="white" _hover={{ opacity: 0.9 }} boxShadow="md"
                                        leftIcon={<Icon as={editId ? FaEdit : FaWrench} />}
                                        isLoading={isLoading}
                                    >
                                        {editId ? 'Update Instrument' : 'Save Instrument'}
                                    </Button>
                                    {editId && (
                                        <Button variant="outline" colorScheme="gray" borderRadius="xl" h="50px" px={8} onClick={handleClear}>
                                            Cancel
                                        </Button>
                                    )}
                                </HStack>

                            </VStack>
                        </form>
                    </CardBody>
                </Card>
            </Container>
        </Box>
    );
};

const ExpenseReportsTab = () => {
    const [employees, setEmployees] = useState([]);
    const [selectedId, setSelectedId] = useState('');
    
    useEffect(() => {
        const fetchEmp = async () => {
            try {
                const res = await api.get('/employee-master');
                if (res.data.success) setEmployees(res.data.data);
            } catch (err) { console.error(err); }
        };
        fetchEmp();
    }, []);

    const selectedName = employees.find(e => e._id === selectedId)?.name || '';

    return (
        <Box>
            <Card mb={6} borderRadius="2xl" boxShadow="sm">
                <CardBody p={6}>
                    <FormControl maxW="400px">
                        <FormLabel fontWeight="bold">Select Employee to View Report</FormLabel>
                        <Select placeholder="-- Choose Employee --" value={selectedId} onChange={(e) => setSelectedId(e.target.value)} bg="white">
                            {employees.map(emp => <option key={emp._id} value={emp._id}>{emp.name}</option>)}
                        </Select>
                    </FormControl>
                </CardBody>
            </Card>
            
            {selectedId ? (
                <AdminEmployeeExpenses employeeId={selectedId} employeeName={selectedName} />
            ) : (
                <Center p={10}><Text color="gray.500">Please select an employee to view their expense reports.</Text></Center>
            )}
        </Box>
    );
};

const Services = () => {
    const { user } = useAuth();
    const isAdmin = user && user.isAdmin;
    return (
        <Box>
            {isAdmin ? (
                <Box bg="gray.100" minH="100vh" pt={10}>
                    <Container maxW="full" px={{ base: 2, xl: 6 }}>
                        <Tabs variant="soft-rounded" colorScheme="purple" orientation="vertical" w="full">
                            <TabList bg="white" p={4} borderRadius="2xl" boxShadow="md" mr={4} minW="180px" gap={2}>
                                <Tab _selected={{ color: 'white', bg: 'purple.500' }} px={8} py={3} fontWeight="bold" ml={0} textAlign="left" justifyContent="start">
                                    <Icon as={FaTruck} mr={2} /> Vehicle Master
                                </Tab>
                                <Tab _selected={{ color: 'white', bg: 'blue.500' }} px={8} py={3} fontWeight="bold" ml={0} textAlign="left" justifyContent="start">
                                    <Icon as={FaUserTie} mr={2} /> Employee Master
                                </Tab>
                                <Tab _selected={{ color: 'white', bg: 'orange.500' }} px={8} py={3} fontWeight="bold" ml={0} textAlign="left" justifyContent="start">
                                    <Icon as={FaHandshake} mr={2} /> Client Master
                                </Tab>
                                <Tab _selected={{ color: 'white', bg: 'teal.500' }} px={8} py={3} fontWeight="bold" ml={0} textAlign="left" justifyContent="start">
                                    <Icon as={FaMap} mr={2} /> Site Master
                                </Tab>
                                <Tab _selected={{ color: 'white', bg: 'green.500' }} px={6} py={3} fontWeight="bold" ml={0} textAlign="left" justifyContent="start">
                                    <Icon as={FaCalendarAlt} mr={2} /> Schedule
                                </Tab>
                                <Tab _selected={{ color: 'white', bg: 'blue.700' }} px={6} py={3} fontWeight="bold" ml={0} textAlign="left" justifyContent="start">
                                    <Icon as={FaWrench} mr={2} /> Instruments
                                </Tab>
                                <Tab _selected={{ color: 'white', bg: 'purple.800' }} px={6} py={3} fontWeight="bold" ml={0} textAlign="left" justifyContent="start">
                                    <Icon as={FaFileInvoiceDollar} mr={2} /> Expense Reports
                                </Tab>
                                <Tab _selected={{ color: 'white', bg: 'teal.700' }} px={6} py={3} fontWeight="bold" ml={0} textAlign="left" justifyContent="start">
                                    <Icon as={FaMapMarkedAlt} mr={2} /> Site Allocation
                                </Tab>
                            </TabList>

                            <TabPanels flex={1}>
                                <TabPanel p={0}>
                                    <VehicleMasterForm />
                                </TabPanel>
                                <TabPanel p={0}>
                                    <EmployeeMasterForm />
                                </TabPanel>
                                <TabPanel p={0}>
                                    <ClientMasterForm />
                                </TabPanel>
                                <TabPanel p={0}>
                                    <SiteMasterForm />
                                </TabPanel>
                                <TabPanel p={0}>
                                    <ScheduleMasterForm />
                                </TabPanel>
                                <TabPanel p={0}>
                                    <InstrumentMasterForm />
                                </TabPanel>
                                <TabPanel p={0}>
                                    <ExpenseReportsTab />
                                </TabPanel>
                                <TabPanel p={0} overflowX="auto">
                                    <AdminSiteAllocation />
                                </TabPanel>
                            </TabPanels>
                        </Tabs>
                    </Container>
                </Box>
            ) : (
                <CivilEngineeringServices />
            )}
        </Box>
    );
};

export default Services;
