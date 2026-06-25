import React, { useState, useEffect } from 'react';
import {
    Box, Container, Heading, Text, SimpleGrid, Icon, Stack, Flex, Button, Card, CardBody,
    Divider, FormControl, FormLabel, Input, VStack, useToast, Image, Badge, HStack, IconButton, Select,
    Tabs, TabList, TabPanels, Tab, TabPanel, Checkbox, Center,
    Table, Thead, Tbody, Tr, Th, Td, TableContainer, Tag, TagLabel, Wrap, WrapItem, Avatar,
    Popover, PopoverTrigger, PopoverContent, PopoverHeader, PopoverBody, PopoverArrow, PopoverCloseButton, Portal,
    useDisclosure, AlertDialog, AlertDialogBody, AlertDialogFooter, AlertDialogHeader, AlertDialogContent, AlertDialogOverlay,
    Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, Spacer
} from '@chakra-ui/react';
import {
    FaRoad, FaHardHat, FaBuilding, FaRoute, FaTruck, FaCloudUploadAlt, FaFilePdf, FaFileImage, FaTrash, FaCheckCircle,
    FaUserTie, FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaIdCard, FaCamera,
    FaHandshake, FaFingerprint, FaIdBadge, FaMap,
    FaCalendarAlt, FaUsers, FaStar, FaEdit, FaEye, FaWrench, FaTag, FaFileInvoiceDollar, FaMapMarkedAlt, FaMoneyBillWave, FaTimes, FaFileAlt, FaUndo, FaListUl,
    FaSearch, FaCar, FaFolderOpen, FaCopy, FaPrint
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import AdminEmployeeExpenses from '../components/AdminEmployeeExpenses';
import EmployeeExpensesModule from '../pages/EmployeeExpensesModule';
import AdminSiteAllocation from '../components/AdminSiteAllocation';
import AdminDraftingWork from './admin/AdminDraftingWork';
import InvoiceReport from './admin/InvoiceReport';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

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
                            <Image borderRadius="3xl" src={`${API_BASE_URL}/uploads/local/construction.jpeg`} alt="Construction" objectFit="cover" h="400px" w="full" fallbackSrc="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80" />
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
    const [insuranceFile, setInsuranceFile] = useState(null);
    const [pucFile, setPucFile] = useState(null);
    const [vehiclePhotos, setVehiclePhotos] = useState([]);
    const [vehiclePhotoPreviews, setVehiclePhotoPreviews] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [editId, setEditId] = useState(null);
    const [viewVehicle, setViewVehicle] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState('table');
    const { isOpen: isConfirmOpen, onOpen: onConfirmOpen, onClose: onConfirmClose } = useDisclosure();
    const cancelRef = React.useRef();
    const [activeTab, setActiveTab] = useState(0);

    const filteredVehicles = vehicles.filter(v =>
        v.vehicleNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.vehicleName?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const [formData, setFormData] = useState({
        vehicleNumber: '',
        vehicleName: '',
        insuranceDate: '',
        pucDate: '',
        serviceDate: '',
        logInName: user?.name || ''
    });


    const fetchVehicles = async () => {
        try {
            const res = await api.get('/vehicle-master');
            if (res.data.success) setVehicles(res.data.data);
        } catch (err) { console.error("Failed to fetch vehicles", err); }
    };

    useEffect(() => {
        fetchVehicles();
    }, []);

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

    const handleVehiclePhotoChange = (e) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;
        setVehiclePhotos(prev => [...prev, ...files]);

        const newPreviews = files.map(file => URL.createObjectURL(file));
        setVehiclePhotoPreviews(prev => [...prev, ...newPreviews]);
    };

    const removeVehiclePhoto = (index) => {
        setVehiclePhotos(prev => prev.filter((_, i) => i !== index));
        setVehiclePhotoPreviews(prev => prev.filter((_, i) => i !== index));
    };


    const handleSubmit = async (e) => {
        e.preventDefault();

        // Strict pattern check (e.g. MH 12 AB 1234)
        const vNo = formData.vehicleNumber.trim();
        const vRegex = /^[A-Z]{2}\s\d{2}\s[A-Z]{1,2}\s\d{4}$/;

        if (!vRegex.test(vNo)) {
            toast({
                title: 'Format Error',
                description: 'Vehicle Number must be in MH 12 AB 1234 format',
                status: 'error',
                duration: 4000
            });
            return;
        }

        onConfirmOpen();
    };

    const confirmSubmit = async () => {
        onConfirmClose();
        setIsLoading(true);
        try {
            const uploadData = new FormData();
            Object.keys(formData).forEach(key => uploadData.append(key, formData[key]));
            if (rcFile) uploadData.append('rcBook', rcFile);
            if (insuranceFile) uploadData.append('insurancePhoto', insuranceFile);
            if (pucFile) uploadData.append('pucPhoto', pucFile);
            vehiclePhotos.forEach(file => uploadData.append('vehiclePhotos', file));

            let response;
            if (editId) {
                response = await api.put(`/vehicle-master/${editId}`, uploadData);
            } else {
                response = await api.post('/vehicle-master', uploadData);
            }

            if (response.data.success) {
                toast({ title: "Success", description: editId ? "Vehicle record updated successfully" : "Vehicle record stored successfully", status: "success", duration: 3000 });
                setFormData({ vehicleNumber: '', vehicleName: '', insuranceDate: '', pucDate: '', serviceDate: '', logInName: user?.name || '' });
                setRcFile(null);
                setInsuranceFile(null);
                setPucFile(null);
                setVehiclePhotos([]);
                setVehiclePhotoPreviews([]);
                setEditId(null);
                fetchVehicles();
            }
        } catch (error) {
            toast({ title: "Error", description: error.response?.data?.message || "Failed to store record", status: "error", duration: 3000 });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this vehicle record?')) return;
        try {
            await api.delete(`/vehicle-master/${id}`);
            toast({ title: 'Deleted', status: 'info', duration: 2000 });
            fetchVehicles();
            if (editId === id) setEditId(null);
        } catch (err) {
            toast({ title: 'Error', description: err.response?.data?.message || 'Delete failed', status: 'error', duration: 3000 });
        }
    };

    return (
        <Box py={10} bg="gray.100" minH="100vh">
            <Container maxW="container.md">
                <Card variant="elevated" borderRadius="2xl" boxShadow="2xl" bg="white" overflow="hidden">
                    <Box bg="purple.600" p={{ base: 5, md: 8 }} color="white">
                        <Stack direction={{ base: "column", md: "row" }} justify="space-between" align="center" spacing={4}>
                            <Box>
                                <Heading size="lg">{editId ? 'Edit Vehicle' : 'Vehicle Management'}</Heading>
                                <Text opacity={0.8} mt={1}>Admin Panel: Manage fleet assets and maintenance records</Text>
                            </Box>
                            <HStack w={{ base: "full", md: "auto" }} spacing={2}>
                                <Input
                                    bg="white" color="gray.800" placeholder="Search Vehicle No, Name..." size="md" borderRadius="xl"
                                    w={{ base: "full", md: "250px" }} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                <IconButton
                                    icon={<Icon as={viewMode === 'table' ? FaTruck : FaTruck} />}
                                    onClick={() => setViewMode(viewMode === 'table' ? 'card' : 'table')}
                                    borderRadius="xl" colorScheme="whiteAlpha" variant="solid" aria-label="Toggle View"
                                />
                                <Button
                                    colorScheme="green" leftIcon={<Icon as={FaTruck} />}
                                    onClick={() => {
                                        setEditId(null);
                                        setFormData({ vehicleNumber: '', vehicleName: '', insuranceDate: '', pucDate: '', serviceDate: '', logInName: user?.name || '' });
                                        setActiveTab(0);
                                    }} borderRadius="xl"
                                >
                                    Add New
                                </Button>
                            </HStack>
                        </Stack>
                    </Box>
                    <CardBody p={{ base: 4, md: 10 }}>
                        <Tabs index={activeTab} onChange={(idx) => setActiveTab(idx)} colorScheme="purple" variant="soft-rounded">
                            <TabList mb={6} justifyContent="center" bg="gray.50" p={2} borderRadius="2xl" border="1px solid" borderColor="gray.100">
                                <Tab fontWeight="bold" borderRadius="xl" px={6} py={3} _selected={{ color: 'white', bg: 'purple.500', shadow: 'md' }}>Form</Tab>
                                <Tab fontWeight="bold" borderRadius="xl" px={6} py={3} _selected={{ color: 'white', bg: 'purple.500', shadow: 'md' }}>View</Tab>
                            </TabList>
                            <TabPanels>
                                <TabPanel p={0}>
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

                                {/* Multiple Photos Upload for Vehicle */}
                                <FormControl>
                                    <FormLabel fontWeight="bold">Multiple Vehicle Photos</FormLabel>
                                    <Box
                                        p={6}
                                        border="2px dashed"
                                        borderColor="purple.200"
                                        borderRadius="xl"
                                        bg="purple.50"
                                        textAlign="center"
                                        cursor="pointer"
                                        onClick={() => document.getElementById('vehicle-photos-upload').click()}
                                        _hover={{ bg: "purple.100", borderColor: "purple.400" }}
                                    >
                                        <input type="file" id="vehicle-photos-upload" hidden multiple onChange={handleVehiclePhotoChange} accept="image/*" />
                                        <VStack spacing={2}>
                                            <Icon as={FaCloudUploadAlt} w={8} h={8} color="purple.500" />
                                            <Text fontSize="sm" fontWeight="bold" color="purple.700">Click to add multiple vehicle photos</Text>
                                        </VStack>
                                    </Box>
                                    {vehiclePhotoPreviews.length > 0 && (
                                        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={3} mt={4}>
                                            {vehiclePhotoPreviews.map((src, i) => (
                                                <Box key={i} position="relative" borderRadius="lg" overflow="hidden" border="1px solid" borderColor="purple.200">
                                                    <Image src={src} alt="Preview" w="full" h="100px" objectFit="cover" />
                                                    <IconButton
                                                        icon={<Icon as={FaTrash} />}
                                                        size="xs"
                                                        colorScheme="red"
                                                        position="absolute"
                                                        top={1} right={1}
                                                        onClick={(e) => { e.stopPropagation(); removeVehiclePhoto(i); }}
                                                    />
                                                </Box>
                                            ))}
                                        </SimpleGrid>
                                    )}
                                </FormControl>

                                <Divider />

                                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} w="full">
                                    <FormControl>
                                        <FormLabel fontWeight="bold">RC Book Photo/PDF</FormLabel>
                                        <Box p={6} border="2px dashed" borderColor="pink.200" borderRadius="xl" bg="pink.50" textAlign="center" cursor="pointer" onClick={() => document.getElementById('rc-upload').click()} _hover={{ bg: "pink.100", borderColor: "pink.400" }}>
                                            <input type="file" id="rc-upload" hidden onChange={handleFileChange} accept="image/*,.pdf" />
                                            <Icon as={FaCloudUploadAlt} w={8} h={8} color="pink.500" mb={3} />
                                            <Text fontSize="sm" fontWeight="bold" color="pink.700">{rcFile ? `Selected: ${rcFile.name}` : "Upload RC Book"}</Text>
                                        </Box>
                                    </FormControl>
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
                                    {editId ? 'Update Vehicle Record' : 'Add Vehicle Record'}
                                </Button>
                                {editId && (
                                    <Button variant="outline" colorScheme="gray" borderRadius="xl" h="60px" w="full" onClick={() => {
                                        setEditId(null);
                                        setFormData({ vehicleNumber: '', vehicleName: '', insuranceDate: '', pucDate: '', serviceDate: '', logInName: user?.name || '' });
                                        setRcFile(null); setInsuranceFile(null); setPucFile(null); setVehiclePhotos([]); setVehiclePhotoPreviews([]);
                                    }}>
                                        Cancel Edit
                                    </Button>
                                )}
                            </VStack>
                        </form>
                                </TabPanel>
                                <TabPanel p={0}>
                        {/* Vehicle List View */}
                        <Box mt={10}>
                            <Flex justify="space-between" align="center" mb={4}>
                                <Heading size="md" color="purple.700" display="flex" alignItems="center">
                                    <Icon as={FaTruck} mr={2} /> Registered Vehicles ({filteredVehicles.length})
                                </Heading>
                            </Flex>

                            {viewMode === 'table' ? (
                                <Box overflow="hidden" w="full" bg="white" borderRadius="xl" boxShadow="sm" border="1px solid" borderColor="gray.200">
                                    <Table variant="simple" sx={{ 'th, td': { whiteSpace: 'normal', wordBreak: 'break-word' } }}>
                                        <Thead bg="gray.50">
                                            <Tr>
                                                <Th textAlign="center" whiteSpace="nowrap">Image</Th>
                                                <Th whiteSpace="nowrap">Vehicle No</Th>
                                                <Th whiteSpace="nowrap">Name</Th>
                                                <Th whiteSpace="nowrap">Next Service</Th>
                                                <Th textAlign="center" whiteSpace="nowrap">Actions</Th>
                                            </Tr>
                                        </Thead>
                                        <Tbody>
                                            {filteredVehicles.map(v => (
                                                <Tr key={v._id} _hover={{ bg: "purple.50" }} transition="background 0.2s">
                                                    <Td textAlign="center" py={2}>
                                                        {v.vehiclePhotos && v.vehiclePhotos[0]?.url ? (
                                                            <Image
                                                                src={`${API_BASE_URL}${v.vehiclePhotos[0].url}`}
                                                                alt={v.vehicleNumber}
                                                                w="45px"
                                                                h="60px"
                                                                borderRadius="md"
                                                                objectFit="cover"
                                                                border="1px solid"
                                                                borderColor="gray.200"
                                                                mx="auto"
                                                            />
                                                        ) : (
                                                            <Box w="45px" h="60px" bg="purple.50" borderRadius="md" display="flex" alignItems="center" justifyContent="center" border="1px solid" borderColor="gray.100" mx="auto">
                                                                <Icon as={FaTruck} color="purple.400" />
                                                            </Box>
                                                        )}
                                                    </Td>
                                                    <Td fontWeight="bold" color="purple.600" whiteSpace="nowrap">{v.vehicleNumber}</Td>
                                                    <Td whiteSpace="nowrap">{v.vehicleName}</Td>
                                                    <Td whiteSpace="nowrap"><Badge colorScheme="red" variant="subtle" borderRadius="full" px={2}>{v.serviceDate?.substring(0, 10)}</Badge></Td>
                                                    <Td textAlign="center" whiteSpace="nowrap">
                                                        <HStack justify="center" spacing={1}>
                                                            <IconButton aria-label="View" size="sm" colorScheme="teal" variant="ghost" icon={<Icon as={FaEye} />} onClick={() => setViewVehicle(v)} />
                                                            <IconButton aria-label="Edit" size="sm" colorScheme="blue" variant="ghost" icon={<Icon as={FaEdit} />} onClick={() => {
                                                                setEditId(v._id);
                                                                setFormData({
                                                                    vehicleNumber: v.vehicleNumber || '',
                                                                    vehicleName: v.vehicleName || '',
                                                                    insuranceDate: v.insuranceDate ? v.insuranceDate.substring(0, 10) : '',
                                                                    pucDate: v.pucDate ? v.pucDate.substring(0, 10) : '',
                                                                    serviceDate: v.serviceDate ? v.serviceDate.substring(0, 10) : '',
                                                                    logInName: v.logInName || user?.name || ''
                                                                });
                                                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                                            }} />
                                                            <IconButton aria-label="Delete" size="sm" colorScheme="red" variant="ghost" icon={<Icon as={FaTrash} />} onClick={() => handleDelete(v._id)} />
                                                        </HStack>
                                                    </Td>
                                                </Tr>
                                            ))}
                                        </Tbody>
                                    </Table>
                                </Box>
                            ) : (
                                <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} spacing={4}>
                                    {filteredVehicles.map(v => (
                                        <Card key={v._id} borderRadius="xl" border="1px solid" borderColor="gray.100" _hover={{ shadow: 'md', borderColor: 'purple.300' }} transition="all 0.2s">
                                            <CardBody p={4}>
                                                <HStack spacing={4} mb={4}>
                                                    <Avatar
                                                        size="md"
                                                        src={v.vehiclePhotos && v.vehiclePhotos[0]?.url ? `${API_BASE_URL}${v.vehiclePhotos[0].url}` : undefined}
                                                        name={v.vehicleNumber}
                                                        icon={<Icon as={FaTruck} />}
                                                        borderRadius="lg"
                                                        bg="purple.50"
                                                        color="purple.500"
                                                    />
                                                    <Box flex={1}>
                                                        <Text fontWeight="bold" fontSize="md" noOfLines={1}>{v.vehicleNumber}</Text>
                                                        <Text fontSize="xs" color="gray.500">{v.vehicleName}</Text>
                                                    </Box>
                                                </HStack>
                                                <VStack align="stretch" spacing={2} mb={4}>
                                                    <HStack fontSize="xs" justify="space-between"><Text color="gray.500">Service Due:</Text><Text fontWeight="bold" color="red.500">{v.serviceDate?.substring(0, 10)}</Text></HStack>
                                                    <HStack fontSize="xs" justify="space-between"><Text color="gray.500">Insurance:</Text><Text fontWeight="bold">{v.insuranceDate?.substring(0, 10)}</Text></HStack>
                                                </VStack>
                                                <HStack justify="flex-end" spacing={2} pt={2} borderTop="1px solid" borderColor="gray.50">
                                                    <Button size="xs" colorScheme="teal" variant="ghost" leftIcon={<FaEye />} onClick={() => setViewVehicle(v)}>View</Button>
                                                    <Button size="xs" colorScheme="blue" variant="ghost" leftIcon={<FaEdit />} onClick={() => {
                                                        setEditId(v._id);
                                                        setFormData({
                                                            vehicleNumber: v.vehicleNumber || '',
                                                            vehicleName: v.vehicleName || '',
                                                            insuranceDate: v.insuranceDate ? v.insuranceDate.substring(0, 10) : '',
                                                            pucDate: v.pucDate ? v.pucDate.substring(0, 10) : '',
                                                            serviceDate: v.serviceDate ? v.serviceDate.substring(0, 10) : '',
                                                            logInName: v.logInName || user?.name || ''
                                                        });
                                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                                    }}>Edit</Button>
                                                </HStack>
                                            </CardBody>
                                        </Card>
                                    ))}
                                </SimpleGrid>
                            )}

                            {filteredVehicles.length === 0 && (
                                <Center p={10} bg="white" borderRadius="xl" border="1px dashed" borderColor="gray.200">
                                    <VStack spacing={2}>
                                        <Icon as={FaTruck} w={8} h={8} color="gray.300" />
                                        <Text color="gray.500">No vehicles found matching "{searchQuery}"</Text>
                                    </VStack>
                                </Center>
                            )}
                        </Box>

                        {/* Standardized Vehicle View Modal */}
                        <Modal isOpen={!!viewVehicle} onClose={() => setViewVehicle(null)} size="3xl" isCentered motionPreset="slideInBottom">
                            <ModalOverlay backdropFilter="blur(8px) grayscale(40%)" bg="blackAlpha.600" />
                            <ModalContent borderRadius="3xl" overflow="hidden" boxShadow="2xl" border="1px solid" borderColor="whiteAlpha.300">
                                <ModalHeader p={0}>
                                    <Box bgGradient="linear(to-r, purple.800, purple.600)" p={6} color="white">
                                        <HStack justify="space-between">
                                            <HStack spacing={4}>
                                                <Icon as={FaTruck} w={8} h={8} />
                                                <VStack align="start" spacing={0}>
                                                    <Heading size="md">{viewVehicle?.vehicleNumber}</Heading>
                                                    <Text fontSize="xs" opacity={0.8}>{viewVehicle?.vehicleName} • Asset Management</Text>
                                                </VStack>
                                            </HStack>
                                            <ModalCloseButton position="static" borderRadius="full" />
                                        </HStack>
                                    </Box>
                                </ModalHeader>
                                <ModalBody p={8}>
                                    {viewVehicle && (
                                        <>
                                            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
                                                <VStack align="start" spacing={5}>
                                                    <Box>
                                                        <Text fontSize="10px" fontWeight="black" color="purple.500" textTransform="uppercase" mb={1}>Maintenance Status</Text>
                                                        <VStack align="start" spacing={2}>
                                                            <HStack><Text fontSize="xs" color="gray.500">Insurance:</Text><Text fontSize="xs" fontWeight="bold">{viewVehicle.insuranceDate?.substring(0, 10)}</Text></HStack>
                                                            <HStack><Text fontSize="xs" color="gray.500">PUC Date:</Text><Text fontSize="xs" fontWeight="bold">{viewVehicle.pucDate?.substring(0, 10)}</Text></HStack>
                                                            <HStack><Text fontSize="xs" color="gray.500">Next Service:</Text><Text fontSize="xs" fontWeight="bold" color="red.500">{viewVehicle.serviceDate?.substring(0, 10)}</Text></HStack>
                                                        </VStack>
                                                    </Box>
                                                </VStack>
                                                <Box bg="purple.50" p={4} borderRadius="2xl">
                                                    <Text fontSize="10px" color="purple.600" fontWeight="black" mb={2}>Statutory Documents</Text>
                                                    <Wrap spacing={2}>
                                                        {['rcBook', 'insurancePhoto', 'pucPhoto'].map(doc => viewVehicle[doc]?.url && (
                                                            <Button key={doc} size="xs" colorScheme="purple" variant="subtle" leftIcon={<FaFilePdf />} onClick={() => window.open(`${API_BASE_URL}${viewVehicle[doc].url}`, '_blank')}>
                                                                {doc.replace('Photo', '').toUpperCase()}
                                                            </Button>
                                                        ))}
                                                    </Wrap>
                                                </Box>
                                            </SimpleGrid>

                                            <Box mt={8}>
                                                <Text fontSize="10px" fontWeight="black" color="purple.500" textTransform="uppercase" mb={3}>Vehicle Gallery ({viewVehicle.vehiclePhotos?.length || 0})</Text>
                                                <SimpleGrid columns={4} spacing={3}>
                                                    {viewVehicle.vehiclePhotos?.map((p, i) => (
                                                        <Box key={i} borderRadius="xl" overflow="hidden" boxShadow="sm" cursor="pointer" onClick={() => window.open(`${API_BASE_URL}${p.url}`, '_blank')} _hover={{ transform: 'scale(1.05)', boxShadow: 'md' }} transition="all 0.2s">
                                                            <Image src={`${API_BASE_URL}${p.url}`} alt="Vehicle" h="70px" w="full" objectFit="cover" />
                                                        </Box>
                                                    ))}
                                                    {(!viewVehicle.vehiclePhotos || viewVehicle.vehiclePhotos.length === 0) && <Text fontSize="xs" color="gray.400">No photos available.</Text>}
                                                </SimpleGrid>
                                            </Box>
                                        </>
                                    )}
                                </ModalBody>
                                <ModalFooter bg="gray.50">
                                    <Button colorScheme="purple" borderRadius="full" px={10} shadow="lg" onClick={() => setViewVehicle(null)}>Close</Button>
                                </ModalFooter>
                            </ModalContent>
                        </Modal>
                                </TabPanel>
                            </TabPanels>
                        </Tabs>
                    </CardBody>
                </Card>
            </Container>

            <AlertDialog isOpen={isConfirmOpen} leastDestructiveRef={cancelRef} onClose={onConfirmClose} isCentered>
                <AlertDialogOverlay>
                    <AlertDialogContent borderRadius="2xl">
                        <AlertDialogHeader fontSize="lg" fontWeight="bold">Confirm Vehicle Data</AlertDialogHeader>
                        <AlertDialogBody>
                            Are you sure you want to {editId ? 'update' : 'save'} the record for vehicle <strong>{formData.vehicleNumber}</strong>?
                        </AlertDialogBody>
                        <AlertDialogFooter>
                            <Button ref={cancelRef} onClick={onConfirmClose} borderRadius="full">Cancel</Button>
                            <Button colorScheme="purple" onClick={confirmSubmit} ml={3} borderRadius="full" px={10}>Confirm & Save</Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
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
        confirmAccountNumber: '',
        ifscCode: '',
        salary: '',
        designation: '',
        paymentMode: 'Cash',
        paymentStatus: 'Pending',
        foodAllowance: 'Food',
        status: 'Active',
    });
    const [files, setFiles] = useState({
        photo: null,
        aadharCard: null,
        panCard: null,
        voterId: null,
        drivingLicense: null,
        bankDocuments: []
    });
    const [photoPreview, setPhotoPreview] = useState(null);
    const [existingDocs, setExistingDocs] = useState({
        aadharCard: null,
        panCard: null,
        voterId: null,
        drivingLicense: null,
        bankDocuments: []
    });
    const [sameAsAddress, setSameAsAddress] = useState(false);
    const [bankVerified, setBankVerified] = useState(false);
    const [bankVerifying, setBankVerifying] = useState(false);
    const [accountVerified, setAccountVerified] = useState(false);
    const [accountVerifying, setAccountVerifying] = useState(false);
    const [employees, setEmployees] = useState([]);
    const [editId, setEditId] = useState('');
    const [viewEmployee, setViewEmployee] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState('table'); // 'table' or 'card'
    const { isOpen: isConfirmOpen, onOpen: onConfirmOpen, onClose: onConfirmClose } = useDisclosure();
    const cancelRef = React.useRef();

    const tabConfig = [
        { id: 'form', label: 'Form', permission: 'canViewForm' },
        { id: 'view', label: 'View', permission: 'canViewList' },
        { id: 'payment', label: 'Payment Report', permission: 'canViewList' },
    ];
    const [employeeActiveTab, setEmployeeActiveTab] = useState(0);

    const [reportSearchQuery, setReportSearchQuery] = useState('');
    const [reportPaymentModeFilter, setReportPaymentModeFilter] = useState('All');
    const [reportPaymentStatusFilter, setReportPaymentStatusFilter] = useState('All');
    const [reportMonthFilter, setReportMonthFilter] = useState(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    });
    const [reportFoodFilter, setReportFoodFilter] = useState('All');
    const [reportStatusFilter, setReportStatusFilter] = useState('All');

    const filteredEmployees = employees.filter(emp =>
        emp.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.empId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.phone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.designation?.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
                bankName: '', accountName: '', accountNumber: '', confirmAccountNumber: '', ifscCode: '',
                salary: '',
                designation: '',
                paymentMode: 'Cash',
                paymentStatus: 'Pending',
                foodAllowance: 'Food',
                status: 'Active',
            });
            setFiles({ photo: null, aadharCard: null, panCard: null, voterId: null, drivingLicense: null, bankDocuments: [] });
            setExistingDocs({ aadharCard: null, panCard: null, voterId: null, drivingLicense: null, bankDocuments: [] });
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
                confirmAccountNumber: emp.bankDetails?.accountNumber || '',
                ifscCode: emp.bankDetails?.ifscCode || '',
                salary: emp.salary || '',
                designation: emp.designation || '',
                paymentMode: emp.paymentMode || 'Cash',
                paymentStatus: emp.paymentStatus || 'Pending',
                foodAllowance: emp.foodAllowance || 'Food',
                status: emp.status || 'Active',
            });
            setPhotoPreview(emp.photo?.url ? `${API_BASE_URL}${emp.photo.url}` : null);
            setFiles({ photo: null, aadharCard: null, panCard: null, voterId: null, drivingLicense: null, bankDocuments: [] });
            setExistingDocs({
                aadharCard: emp.aadharCard || null,
                panCard: emp.panCard || null,
                voterId: emp.voterId || null,
                drivingLicense: emp.drivingLicense || null,
                bankDocuments: emp.bankDetails?.documents || []
            });
            if (emp.bankDetails?.ifscCode) setBankVerified(true);
            const formIdx = tabConfig.findIndex(t => t.id === 'form');
            if (formIdx !== -1) setEmployeeActiveTab(formIdx);
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
            if (['ifscCode', 'accountNumber', 'confirmAccountNumber'].includes(field)) {
                setBankVerified(false);
            }
        }
    };

    const handleFileChange = (e, field) => {
        if (field === 'bankDocuments') {
            const selectedFiles = Array.from(e.target.files);
            setFiles(prev => ({ ...prev, [field]: [...(prev[field] || []), ...selectedFiles] }));
        } else {
            const file = e.target.files[0];
            setFiles(prev => ({ ...prev, [field]: file }));
            if (field === 'photo' && file) {
                const reader = new FileReader();
                reader.onload = (ev) => setPhotoPreview(ev.target.result);
                reader.readAsDataURL(file);
            }
        }
    };

    const removeBankDocument = (index) => {
        setFiles(prev => {
            const newDocs = [...(prev.bankDocuments || [])];
            newDocs.splice(index, 1);
            return { ...prev, bankDocuments: newDocs };
        });
    };

    const removeExistingBankDoc = (index) => {
        setExistingDocs(prev => {
            const newDocs = [...(prev.bankDocuments || [])];
            newDocs.splice(index, 1);
            return { ...prev, bankDocuments: newDocs };
        });
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

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this employee record?')) return;
        try {
            const res = await api.delete(`/employee-master/${id}`);
            if (res.data.success) {
                toast({ title: 'Success', description: 'Employee record deleted', status: 'success', duration: 3000 });
                fetchEmployees();
            }
        } catch (err) {
            toast({ title: 'Error', description: err.response?.data?.message || 'Delete failed', status: 'error', duration: 3000 });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name || !formData.phone || !formData.salary || !formData.accountNumber) {
            toast({ title: 'Please fill all required fields, including Bank Account', status: 'error', duration: 3000 });
            return;
        }

        if (formData.accountNumber !== formData.confirmAccountNumber) {
            toast({ title: 'Account numbers do not match', status: 'error', duration: 3000 });
            return;
        }

        onConfirmOpen();
    };

    const confirmSubmit = async () => {
        onConfirmClose();
        setIsLoading(true);
        try {
            let currentEmpId = nextEmpId;
            if (!editId && !currentEmpId) {
                // Fetch next ID on the fly if it is empty to prevent sending empty empId
                const res = await api.get('/employee-master/next-id');
                if (res.data.success) {
                    currentEmpId = res.data.nextEmpId;
                    setNextEmpId(currentEmpId);
                }
            }

            const uploadData = new FormData();
            uploadData.append('name', formData.name);
            uploadData.append('email', formData.email);
            uploadData.append('phone', formData.phone);
            uploadData.append('addressLine1', JSON.stringify(formData.addressLine1));
            uploadData.append('addressLine2', JSON.stringify(formData.addressLine2));
            uploadData.append('emergencyContact', JSON.stringify(formData.emergencyContact));
            uploadData.append('empId', currentEmpId);
            uploadData.append('bankDetails', JSON.stringify({
                bankName: formData.bankName,
                accountName: formData.accountName,
                accountNumber: formData.accountNumber,
                ifscCode: formData.ifscCode,
            }));
            uploadData.append('salary', formData.salary);
            uploadData.append('designation', formData.designation);
            uploadData.append('paymentMode', formData.paymentMode || 'Cash');
            uploadData.append('paymentStatus', formData.paymentStatus || 'Pending');
            uploadData.append('foodAllowance', formData.foodAllowance || 'Food');
            uploadData.append('status', formData.status || 'Active');

            Object.keys(files).forEach(key => {
                if (Array.isArray(files[key])) {
                    files[key].forEach(f => uploadData.append(key, f));
                } else if (files[key]) {
                    uploadData.append(key, files[key]);
                }
            });

            if (editId) {
                uploadData.append('existingBankDocuments', JSON.stringify(existingDocs.bankDocuments || []));
            }

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
                    designation: '',
                    paymentMode: 'Cash',
                    paymentStatus: 'Pending',
                    foodAllowance: 'Food',
                    status: 'Active',
                });
                setFiles({ photo: null, aadharCard: null, panCard: null, voterId: null, drivingLicense: null, bankDocuments: [] });
                setExistingDocs({ aadharCard: null, panCard: null, voterId: null, drivingLicense: null, bankDocuments: [] });
                setPhotoPreview(null);
                setSameAsAddress(false);
                setBankVerified(false);
                setEditId('');
                fetchNextEmpId();
                fetchEmployees();
                const viewIdx = tabConfig.findIndex(t => t.id === 'view');
                if (viewIdx !== -1) setEmployeeActiveTab(viewIdx);
            }
        } catch (error) {
            toast({ title: "Error", description: error.response?.data?.message || "Failed to store record", status: "error", duration: 3000 });
        } finally {
            setIsLoading(false);
        }
    };

    const FileUploadInput = ({ label, field, icon }) => {
        const hasExisting = existingDocs && existingDocs[field] && existingDocs[field].url;
        const isPdf = hasExisting && existingDocs[field].name?.toLowerCase().endsWith('.pdf');

        return (
            <FormControl>
                <FormLabel fontWeight="bold" fontSize="sm">{label}</FormLabel>
                <VStack align="stretch" spacing={2}>
                    <Box
                        p={4}
                        border="2px dashed"
                        borderColor={files[field] ? "green.200" : hasExisting ? "purple.200" : "blue.100"}
                        borderRadius="xl"
                        bg={files[field] ? "green.50" : hasExisting ? "purple.50" : "blue.50"}
                        textAlign="center"
                        cursor="pointer"
                        onClick={() => document.getElementById(`${field}-upload`).click()}
                        _hover={{ bg: files[field] ? "green.100" : hasExisting ? "purple.100" : "blue.100", borderColor: "blue.300" }}
                        transition="all 0.2s"
                    >
                        <input type="file" id={`${field}-upload`} hidden onChange={(e) => handleFileChange(e, field)} accept="image/*,.pdf" />
                        <Icon as={icon || FaCloudUploadAlt} w={6} h={6} color={files[field] ? "green.500" : hasExisting ? "purple.500" : "blue.500"} mb={2} />
                        <Text fontSize="xs" fontWeight="bold" color={files[field] ? "green.700" : hasExisting ? "purple.700" : "blue.700"} noOfLines={1}>
                            {files[field] ? `✓ ${files[field].name}` : hasExisting ? `Replace ${label}` : `Upload ${label}`}
                        </Text>
                    </Box>

                    {hasExisting && !files[field] && (
                        <Box 
                            p={2} 
                            bg="white" 
                            borderRadius="xl" 
                            border="1px solid" 
                            borderColor="purple.100" 
                            boxShadow="xs"
                            display="flex"
                            alignItems="center"
                            justifyContent="space-between"
                        >
                            <HStack spacing={2} minW={0}>
                                <Icon as={isPdf ? FaFilePdf : FaFileImage} color={isPdf ? "red.400" : "purple.400"} />
                                <Text fontSize="10px" fontWeight="bold" color="gray.600" isTruncated maxW="120px">
                                    {existingDocs[field].name || `Current ${label}`}
                                </Text>
                            </HStack>
                            <Button 
                                size="xs" 
                                colorScheme="purple" 
                                variant="outline" 
                                h="24px"
                                borderRadius="lg"
                                leftIcon={<Icon as={FaEye} />}
                                onClick={(e) => { e.stopPropagation(); window.open(`${API_BASE_URL}${existingDocs[field].url}`, '_blank'); }}
                            >
                                View
                            </Button>
                        </Box>
                    )}
                </VStack>
            </FormControl>
        );
    };

    const getMonthlyPayment = (emp, month) => {
        return emp.monthlyPayments?.find(p => p.month === month) || { paymentMode: 'Cash', paymentStatus: 'Pending' };
    };

    const exportPaymentReportToCSV = () => {
        const month = reportMonthFilter;
        const reportRows = employees.filter(emp => {
            const monthData = getMonthlyPayment(emp, month);
            const matchesSearch = emp.name?.toLowerCase().includes(reportSearchQuery.toLowerCase()) || emp.empId?.toLowerCase().includes(reportSearchQuery.toLowerCase());
            const matchesMode = reportPaymentModeFilter === 'All' || monthData.paymentMode === reportPaymentModeFilter;
            const matchesStatus = reportPaymentStatusFilter === 'All' || monthData.paymentStatus === reportPaymentStatusFilter;
            const matchesFood = reportFoodFilter === 'All' || emp.foodAllowance === reportFoodFilter;
            const matchesEmpStatus = reportStatusFilter === 'All' || emp.status === reportStatusFilter;
            return matchesSearch && matchesMode && matchesStatus && matchesFood && matchesEmpStatus;
        });

        const headers = ['SR. NO.', 'Month', 'Employee ID', 'Name', 'Bank A/C No', 'IFSC Code', 'Monthly Salary (INR)', 'Food Allowance', 'Payment Mode', 'Payment Status', 'Employee Status'];
        const rows = reportRows.map((emp, idx) => {
            const monthData = getMonthlyPayment(emp, month);
            return [
                idx + 1,
                month,
                emp.empId || '',
                emp.name || '',
                emp.bankDetails?.accountNumber || '',
                emp.bankDetails?.ifscCode || '',
                emp.salary || 0,
                emp.foodAllowance || 'Food',
                monthData.paymentMode,
                monthData.paymentStatus,
                emp.status || 'Active',
            ];
        });

        // BOM for Excel UTF-8 support
        const BOM = '\uFEFF';
        const csvContent = BOM + [headers.join(','), ...rows.map(r => r.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `Employee_Payment_Report_${month}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleUpdatePaymentField = async (employeeId, field, value) => {
        try {
            const res = await api.put(`/employee-master/${employeeId}/monthly-payment`, {
                month: reportMonthFilter,
                [field]: value
            });
            if (res.data.success) {
                toast({ title: "Updated", description: `Changed payment ${field === 'paymentMode' ? 'mode' : 'status'} successfully.`, status: "success", duration: 2000 });
                fetchEmployees();
            }
        } catch (error) {
            toast({ title: "Error", description: error.response?.data?.message || "Failed to update record", status: "error", duration: 3000 });
        }
    };

    return (
        <Box py={5} bg="gray.100" minH="100vh">
            <Container maxW="100%" px={0}>
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
                                    placeholder="Search Name, ID, Phone..."
                                    size="md"
                                    borderRadius="xl"
                                    w={{ base: "full", md: "250px" }}
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        const viewIdx = tabConfig.findIndex(t => t.id === 'view');
                                        if (viewIdx !== -1 && employeeActiveTab !== viewIdx) {
                                            setEmployeeActiveTab(viewIdx);
                                        }
                                    }}
                                    onClick={() => {
                                        const viewIdx = tabConfig.findIndex(t => t.id === 'view');
                                        if (viewIdx !== -1 && employeeActiveTab !== viewIdx) {
                                            setEmployeeActiveTab(viewIdx);
                                        }
                                    }}
                                />
                                <IconButton
                                    icon={<Icon as={viewMode === 'table' ? FaUsers : FaUsers} />}
                                    onClick={() => setViewMode(viewMode === 'table' ? 'card' : 'table')}
                                    borderRadius="xl"
                                    colorScheme="whiteAlpha"
                                    variant="solid"
                                    aria-label="Toggle View"
                                />
                                <Button
                                    colorScheme="green"
                                    leftIcon={<Icon as={FaUsers} />}
                                    onClick={() => {
                                        handleSelectEmployee({ target: { value: '' } });
                                        const formIdx = tabConfig.findIndex(t => t.id === 'form');
                                        if (formIdx !== -1) setEmployeeActiveTab(formIdx);
                                    }}
                                    borderRadius="xl"
                                >
                                    Add New
                                </Button>
                            </HStack>
                        </Stack>
                    </Box>
                    <CardBody p={{ base: 4, md: 10 }}>
                        <Tabs index={employeeActiveTab} onChange={(idx) => setEmployeeActiveTab(idx)} colorScheme="blue" variant="soft-rounded">
                            <TabList mb={6} justifyContent="center" bg="gray.50" p={2} borderRadius="2xl" border="1px solid" borderColor="gray.100">
                                {tabConfig.map((tab, idx) => (
                                    <Tab key={tab.id} fontWeight="bold" borderRadius="xl" px={6} py={3} _selected={{ color: 'white', bg: 'blue.500', shadow: 'md' }}>
                                        {tab.label}
                                    </Tab>
                                ))}
                            </TabList>

                            <TabPanels>
                                {/* ── Tab 1: Form ── */}
                                <TabPanel p={0}>
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
                                                        <Input variant="unstyled" p={2} type="email" placeholder="email@company.com" value={formData.email} onChange={(e) => handleChange(e, 'email')} autoComplete="new-password" />
                                                    </HStack>
                                                </FormControl>
                                            </SimpleGrid>

                                            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mt={4}>
                                                <FormControl>
                                                    <FormLabel fontWeight="bold" fontSize="sm">🍽️ Food Allowance</FormLabel>
                                                    <Select
                                                        borderRadius="xl"
                                                        bg="green.50"
                                                        value={formData.foodAllowance || 'Food'}
                                                        onChange={(e) => handleChange(e, 'foodAllowance')}
                                                    >
                                                        <option value="Food">🍱 Food Included</option>
                                                        <option value="Without Food">🚫 Without Food</option>
                                                    </Select>
                                                </FormControl>
                                                <FormControl>
                                                    <FormLabel fontWeight="bold" fontSize="sm">👤 Employee Status</FormLabel>
                                                    <Select
                                                        borderRadius="xl"
                                                        bg={formData.status === 'Active' ? 'green.50' : 'red.50'}
                                                        value={formData.status || 'Active'}
                                                        onChange={(e) => handleChange(e, 'status')}
                                                    >
                                                        <option value="Active">✅ Active</option>
                                                        <option value="Deactive">❌ Deactive</option>
                                                    </Select>
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
                                    </SimpleGrid>
                                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mt={4}>
                                        <FormControl isRequired>
                                            <FormLabel fontWeight="bold" fontSize="sm">Account Number</FormLabel>
                                            <Input
                                                borderRadius="lg" bg="white" placeholder="Bank Account Number"
                                                value={formData.accountNumber} onChange={(e) => handleChange(e, 'accountNumber')}
                                                type="password"
                                            />
                                        </FormControl>
                                        <FormControl isRequired>
                                            <FormLabel fontWeight="bold" fontSize="sm">Confirm Account Number</FormLabel>
                                            <Input borderRadius="lg" bg="white" placeholder="Confirm Account Number" value={formData.confirmAccountNumber} onChange={(e) => handleChange(e, 'confirmAccountNumber')} type="text" />
                                        </FormControl>
                                    </SimpleGrid>

                                    <FormControl mt={6}>
                                        <FormLabel fontWeight="bold" fontSize="sm">Bank Documents (Passbook / Cancelled Cheque / Statement)</FormLabel>
                                        <Box p={4} border="2px dashed" borderColor="green.300" borderRadius="xl" bg="white" textAlign="center" cursor="pointer" onClick={() => document.getElementById('bankDocuments-upload').click()} _hover={{ bg: "green.50", borderColor: "green.500" }}>
                                            <input type="file" id="bankDocuments-upload" multiple hidden onChange={(e) => handleFileChange(e, 'bankDocuments')} accept="image/*,.pdf" />
                                            <Icon as={FaCloudUploadAlt} w={6} h={6} color="green.500" mb={2} />
                                            <Text fontSize="sm" fontWeight="bold" color="green.700">Click to upload bank documents</Text>
                                        </Box>
                                        
                                        {(existingDocs?.bankDocuments?.length > 0 || files?.bankDocuments?.length > 0) && (
                                            <VStack align="stretch" mt={3} spacing={2}>
                                                {existingDocs?.bankDocuments?.map((doc, idx) => (
                                                    <HStack key={`ex-${idx}`} p={2} bg="white" borderRadius="md" borderWidth="1px" justifyContent="space-between">
                                                        <Text fontSize="xs" noOfLines={1}>📎 {doc.name || 'Existing Document'}</Text>
                                                        <Button size="xs" colorScheme="red" variant="ghost" onClick={() => removeExistingBankDoc(idx)}><FaTrash /></Button>
                                                    </HStack>
                                                ))}
                                                {files?.bankDocuments?.map((file, idx) => (
                                                    <HStack key={`new-${idx}`} p={2} bg="green.50" borderRadius="md" borderWidth="1px" borderColor="green.200" justifyContent="space-between">
                                                        <Text fontSize="xs" noOfLines={1} color="green.800">📄 {file.name}</Text>
                                                        <Button size="xs" colorScheme="red" variant="ghost" onClick={() => removeBankDocument(idx)}><FaTrash /></Button>
                                                    </HStack>
                                                ))}
                                            </VStack>
                                        )}
                                    </FormControl>
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
                                </TabPanel>

                                {/* ── Tab 2: View (List) ── */}
                                <TabPanel p={0}>
                                    {/* Employee List View */}
                                    <Box mt={4}>
                            <Flex justify="space-between" align="center" mb={4}>
                                <Heading size="md" color="blue.700" display="flex" alignItems="center">
                                    <Icon as={FaUsers} mr={2} /> Registered Employees ({filteredEmployees.length})
                                </Heading>
                            </Flex>

                            {viewMode === 'table' ? (
                                <Box overflow="hidden" w="full" bg="white" borderRadius="xl" boxShadow="sm" border="1px solid" borderColor="gray.200">
                                    <Table variant="simple" sx={{ 'th, td': { whiteSpace: 'normal', wordBreak: 'break-word' } }}>
                                        <Thead bg="gray.50">
                                            <Tr>
                                                <Th whiteSpace="nowrap">ID</Th>
                                                <Th>Name</Th>
                                                <Th whiteSpace="nowrap">Designation</Th>
                                                <Th whiteSpace="nowrap">Phone</Th>
                                                <Th textAlign="center" whiteSpace="nowrap">Actions</Th>
                                            </Tr>
                                        </Thead>
                                        <Tbody>
                                            {filteredEmployees.map(emp => (
                                                <Tr key={emp._id} _hover={{ bg: "blue.50" }} transition="background 0.2s">
                                                    <Td fontWeight="bold" color="blue.600" whiteSpace="nowrap">{emp.empId}</Td>
                                                    <Td whiteSpace="normal" wordBreak="break-word">
                                                        <HStack spacing={3}>
                                                            <Avatar size="xs" src={emp.photo?.url ? `${API_BASE_URL}${emp.photo.url}` : undefined} name={emp.name} />
                                                            <Text fontWeight="semibold">{emp.name}</Text>
                                                        </HStack>
                                                    </Td>
                                                    <Td whiteSpace="nowrap"><Badge colorScheme="blue" variant="subtle" borderRadius="full" px={2}>{emp.designation}</Badge></Td>
                                                    <Td whiteSpace="nowrap">{emp.phone}</Td>
                                                    <Td textAlign="center" whiteSpace="nowrap">
                                                        <HStack justify="center" spacing={1}>
                                                            <IconButton aria-label="View" size="sm" colorScheme="teal" variant="ghost" icon={<Icon as={FaEye} />} onClick={() => setViewEmployee(emp)} />
                                                            <IconButton aria-label="Edit" size="sm" colorScheme="blue" variant="ghost" icon={<Icon as={FaEdit} />} onClick={() => handleSelectEmployee({ target: { value: emp._id } })} />
                                                            <IconButton aria-label="Delete" size="sm" colorScheme="red" variant="ghost" icon={<Icon as={FaTrash} />} onClick={() => handleDelete(emp._id)} />
                                                        </HStack>
                                                    </Td>
                                                </Tr>
                                            ))}
                                        </Tbody>
                                    </Table>
                                </Box>
                            ) : (
                                <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} spacing={4}>
                                    {filteredEmployees.map(emp => (
                                        <Card key={emp._id} borderRadius="xl" border="1px solid" borderColor="gray.100" _hover={{ shadow: 'md', borderColor: 'blue.300' }} transition="all 0.2s">
                                            <CardBody p={4}>
                                                <HStack spacing={4} mb={4}>
                                                    <Avatar size="md" src={emp.photo?.url ? `${API_BASE_URL}${emp.photo.url}` : undefined} name={emp.name} borderRadius="lg" />
                                                    <Box flex={1}>
                                                        <Text fontWeight="bold" fontSize="md" noOfLines={1}>{emp.name}</Text>
                                                        <Text fontSize="xs" color="gray.500">{emp.empId} • {emp.designation}</Text>
                                                    </Box>
                                                </HStack>
                                                <VStack align="stretch" spacing={2} mb={4}>
                                                    <HStack fontSize="xs"><Icon as={FaPhoneAlt} color="gray.400" /><Text>{emp.phone}</Text></HStack>
                                                    <HStack fontSize="xs"><Icon as={FaEnvelope} color="gray.400" /><Text noOfLines={1}>{emp.email || 'No email'}</Text></HStack>
                                                </VStack>
                                                <HStack justify="flex-end" spacing={2} pt={2} borderTop="1px solid" borderColor="gray.50">
                                                    <Button size="xs" colorScheme="teal" variant="ghost" leftIcon={<FaEye />} onClick={() => setViewEmployee(emp)}>View</Button>
                                                    <Button size="xs" colorScheme="blue" variant="ghost" leftIcon={<FaEdit />} onClick={() => handleSelectEmployee({ target: { value: emp._id } })}>Edit</Button>
                                                </HStack>
                                            </CardBody>
                                        </Card>
                                    ))}
                                </SimpleGrid>
                            )}

                            {filteredEmployees.length === 0 && (
                                <Center p={10} bg="white" borderRadius="xl" border="1px dashed" borderColor="gray.200">
                                    <VStack spacing={2}>
                                        <Icon as={FaUsers} w={8} h={8} color="gray.300" />
                                        <Text color="gray.500">No employees found matching "{searchQuery}"</Text>
                                    </VStack>
                                </Center>
                            )}
                                    </Box>
                                </TabPanel>

                                {/* ── Tab 3: Payment Report ── */}
                                <TabPanel p={0}>
                                    {(() => {
                                        const reportFiltered = employees.filter(emp => {
                                            const monthData = getMonthlyPayment(emp, reportMonthFilter);
                                            const matchesSearch = emp.name?.toLowerCase().includes(reportSearchQuery.toLowerCase()) || emp.empId?.toLowerCase().includes(reportSearchQuery.toLowerCase());
                                            const matchesMode = reportPaymentModeFilter === 'All' || monthData.paymentMode === reportPaymentModeFilter;
                                            const matchesPayStatus = reportPaymentStatusFilter === 'All' || monthData.paymentStatus === reportPaymentStatusFilter;
                                            const matchesFood = reportFoodFilter === 'All' || emp.foodAllowance === reportFoodFilter;
                                            const matchesEmpStatus = reportStatusFilter === 'All' || emp.status === reportStatusFilter;
                                            return matchesSearch && matchesMode && matchesPayStatus && matchesFood && matchesEmpStatus;
                                        });
                                        return (
                                            <VStack spacing={5} align="stretch" mt={4}>
                                                {/* Summary Stats */}
                                                <SimpleGrid columns={{ base: 2, md: 4 }} spacing={3}>
                                                    <Box bgGradient="linear(to-br, blue.500, blue.700)" p={4} borderRadius="2xl" color="white" boxShadow="md">
                                                        <Text fontSize="10px" fontWeight="black" opacity={0.8} textTransform="uppercase">Monthly Payout</Text>
                                                        <Heading size="md" mt={1}>₹{employees.reduce((a, e) => a + parseFloat(e.salary || 0), 0).toLocaleString()}</Heading>
                                                        <Text fontSize="10px" opacity={0.7} mt={1}>{employees.length} Employees · {reportMonthFilter}</Text>
                                                    </Box>
                                                    <Box bgGradient="linear(to-br, green.500, green.700)" p={4} borderRadius="2xl" color="white" boxShadow="md">
                                                        <Text fontSize="10px" fontWeight="black" opacity={0.8} textTransform="uppercase">Disbursed ✅</Text>
                                                        <Heading size="md" mt={1}>₹{employees.filter(e => getMonthlyPayment(e, reportMonthFilter).paymentStatus === 'Done').reduce((a, e) => a + parseFloat(e.salary || 0), 0).toLocaleString()}</Heading>
                                                        <Text fontSize="10px" opacity={0.7} mt={1}>{employees.filter(e => getMonthlyPayment(e, reportMonthFilter).paymentStatus === 'Done').length} Paid</Text>
                                                    </Box>
                                                    <Box bgGradient="linear(to-br, orange.400, orange.600)" p={4} borderRadius="2xl" color="white" boxShadow="md">
                                                        <Text fontSize="10px" fontWeight="black" opacity={0.8} textTransform="uppercase">Pending ⏳</Text>
                                                        <Heading size="md" mt={1}>₹{employees.filter(e => getMonthlyPayment(e, reportMonthFilter).paymentStatus !== 'Done').reduce((a, e) => a + parseFloat(e.salary || 0), 0).toLocaleString()}</Heading>
                                                        <Text fontSize="10px" opacity={0.7} mt={1}>{employees.filter(e => getMonthlyPayment(e, reportMonthFilter).paymentStatus !== 'Done').length} Pending</Text>
                                                    </Box>
                                                    <Box bgGradient="linear(to-br, purple.500, purple.700)" p={4} borderRadius="2xl" color="white" boxShadow="md">
                                                        <Text fontSize="10px" fontWeight="black" opacity={0.8} textTransform="uppercase">Active Staff</Text>
                                                        <Heading size="md" mt={1}>{employees.filter(e => e.status === 'Active').length}</Heading>
                                                        <Text fontSize="10px" opacity={0.7} mt={1}>🍱 Food: {employees.filter(e => e.foodAllowance === 'Food').length} | 🚫 No Food: {employees.filter(e => e.foodAllowance === 'Without Food').length}</Text>
                                                    </Box>
                                                </SimpleGrid>

                                                {/* Filter Bar */}
                                                <Box bg="gray.50" p={4} borderRadius="2xl" border="1px solid" borderColor="gray.100">
                                                    <Text fontSize="xs" fontWeight="bold" color="gray.500" mb={3} textTransform="uppercase">🔍 Filter & Export — {reportMonthFilter}</Text>
                                                    <SimpleGrid columns={{ base: 2, md: 6 }} spacing={3} alignItems="flex-end">
                                                        <Box>
                                                            <Text fontSize="10px" fontWeight="bold" color="gray.500" mb={1}>MONTH</Text>
                                                            <Input
                                                                type="month"
                                                                bg="white"
                                                                size="sm"
                                                                borderRadius="lg"
                                                                value={reportMonthFilter}
                                                                onChange={(e) => setReportMonthFilter(e.target.value)}
                                                            />
                                                        </Box>
                                                        <Box>
                                                            <Text fontSize="10px" fontWeight="bold" color="gray.500" mb={1}>SEARCH</Text>
                                                            <Input
                                                                bg="white"
                                                                placeholder="Name / ID..."
                                                                size="sm"
                                                                borderRadius="lg"
                                                                value={reportSearchQuery}
                                                                onChange={(e) => setReportSearchQuery(e.target.value)}
                                                            />
                                                        </Box>
                                                        <Box>
                                                            <Text fontSize="10px" fontWeight="bold" color="gray.500" mb={1}>PAY MODE</Text>
                                                            <Select bg="white" size="sm" borderRadius="lg" value={reportPaymentModeFilter} onChange={(e) => setReportPaymentModeFilter(e.target.value)}>
                                                                <option value="All">All Modes</option>
                                                                <option value="Cash">💵 Cash</option>
                                                                <option value="Cheque">✍️ Cheque</option>
                                                                <option value="UPI">📱 UPI</option>
                                                            </Select>
                                                        </Box>
                                                        <Box>
                                                            <Text fontSize="10px" fontWeight="bold" color="gray.500" mb={1}>PAY STATUS</Text>
                                                            <Select bg="white" size="sm" borderRadius="lg" value={reportPaymentStatusFilter} onChange={(e) => setReportPaymentStatusFilter(e.target.value)}>
                                                                <option value="All">All Status</option>
                                                                <option value="Pending">⏳ Pending</option>
                                                                <option value="Done">✅ Done</option>
                                                            </Select>
                                                        </Box>
                                                        <Box>
                                                            <Text fontSize="10px" fontWeight="bold" color="gray.500" mb={1}>FOOD</Text>
                                                            <Select bg="white" size="sm" borderRadius="lg" value={reportFoodFilter} onChange={(e) => setReportFoodFilter(e.target.value)}>
                                                                <option value="All">All</option>
                                                                <option value="Food">🍱 Food</option>
                                                                <option value="Without Food">🚫 No Food</option>
                                                            </Select>
                                                        </Box>
                                                        <Box>
                                                            <Text fontSize="10px" fontWeight="bold" color="gray.500" mb={1}>EMP STATUS</Text>
                                                            <Select bg="white" size="sm" borderRadius="lg" value={reportStatusFilter} onChange={(e) => setReportStatusFilter(e.target.value)}>
                                                                <option value="All">All</option>
                                                                <option value="Active">✅ Active</option>
                                                                <option value="Deactive">❌ Deactive</option>
                                                            </Select>
                                                        </Box>
                                                    </SimpleGrid>
                                                    <HStack mt={3} spacing={2} justify="flex-end">
                                                        <Button leftIcon={<Icon as={FaCopy} />} colorScheme="blue" variant="outline" borderRadius="xl" onClick={exportPaymentReportToCSV} size="sm">
                                                            Export CSV ({reportFiltered.length})
                                                        </Button>
                                                        <Button leftIcon={<Icon as={FaPrint} />} colorScheme="purple" variant="solid" borderRadius="xl" onClick={() => window.print()} size="sm">
                                                            Print
                                                        </Button>
                                                    </HStack>
                                                </Box>

                                                {/* Payment Report Table — no horizontal scroll */}
                                                <Box bg="white" borderRadius="2xl" border="1px solid" borderColor="gray.200" boxShadow="sm" overflow="hidden">
                                                    <Table variant="simple" size="sm">
                                                        <Thead>
                                                            <Tr bgGradient="linear(to-r, blue.600, blue.800)">
                                                                <Th color="white" py={4} fontSize="10px" whiteSpace="nowrap">#</Th>
                                                                <Th color="white" py={4} fontSize="10px" whiteSpace="nowrap">EMP ID</Th>
                                                                <Th color="white" py={4} fontSize="10px" whiteSpace="nowrap">NAME</Th>
                                                                <Th color="white" py={4} fontSize="10px" whiteSpace="nowrap">BANK A/C NO</Th>
                                                                <Th color="white" py={4} fontSize="10px" whiteSpace="nowrap">IFSC CODE</Th>
                                                                <Th color="white" py={4} fontSize="10px" isNumeric whiteSpace="nowrap">SALARY</Th>
                                                                <Th color="white" py={4} fontSize="10px" whiteSpace="nowrap">FOOD</Th>
                                                                <Th color="white" py={4} fontSize="10px" whiteSpace="nowrap">PAY TYPE</Th>
                                                                <Th color="white" py={4} fontSize="10px" whiteSpace="nowrap">STATUS</Th>
                                                                <Th color="white" py={4} fontSize="10px" textAlign="center" whiteSpace="nowrap">EMP STATUS</Th>
                                                            </Tr>
                                                        </Thead>
                                                        <Tbody>
                                                            {reportFiltered.length === 0 ? (
                                                                <Tr>
                                                                    <Td colSpan={10} textAlign="center" py={10} color="gray.400">
                                                                        <VStack spacing={2}>
                                                                            <Icon as={FaUsers} w={8} h={8} color="gray.200" />
                                                                            <Text fontSize="sm">No records match current filters</Text>
                                                                        </VStack>
                                                                    </Td>
                                                                </Tr>
                                                            ) : reportFiltered.map((emp, idx) => {
                                                                const monthData = getMonthlyPayment(emp, reportMonthFilter);
                                                                const isDone = monthData.paymentStatus === 'Done';
                                                                const isDeactive = emp.status === 'Deactive';
                                                                const rowBg = isDeactive ? 'red.50' : isDone ? 'green.50' : idx % 2 === 0 ? 'white' : 'gray.50';
                                                                return (
                                                                    <Tr key={emp._id} bg={rowBg} _hover={{ bg: isDone ? 'green.100' : isDeactive ? 'red.100' : 'blue.50' }} transition="background 0.15s">
                                                                        <Td fontSize="xs" fontWeight="bold" color="gray.500" whiteSpace="nowrap">{idx + 1}</Td>
                                                                        <Td fontSize="xs" fontWeight="bold" color="blue.600" whiteSpace="nowrap">{emp.empId}</Td>
                                                                        <Td>
                                                                            <HStack spacing={2}>
                                                                                <Avatar size="xs" src={emp.photo?.url ? `${API_BASE_URL}${emp.photo.url}` : undefined} name={emp.name} />
                                                                                <Text fontSize="xs" fontWeight="bold" whiteSpace="normal" wordBreak="break-word">{emp.name}</Text>
                                                                            </HStack>
                                                                        </Td>
                                                                        <Td fontSize="xs" color="gray.700" whiteSpace="nowrap">{emp.bankDetails?.accountNumber || '-'}</Td>
                                                                        <Td fontSize="xs" color="gray.700" whiteSpace="nowrap">{emp.bankDetails?.ifscCode || '-'}</Td>
                                                                        <Td isNumeric whiteSpace="nowrap">
                                                                            <Text fontSize="xs" fontWeight="black" color="green.700">₹{parseFloat(emp.salary || 0).toLocaleString()}</Text>
                                                                        </Td>
                                                                        <Td whiteSpace="nowrap">
                                                                            <Badge size="sm" colorScheme={emp.foodAllowance === 'Food' ? 'green' : 'gray'} borderRadius="full" px={2} fontSize="9px">
                                                                                {emp.foodAllowance === 'Food' ? '🍱 Food' : '🚫 No Food'}
                                                                            </Badge>
                                                                        </Td>
                                                                        <Td whiteSpace="nowrap">
                                                                            <Select
                                                                                size="xs"
                                                                                borderRadius="lg"
                                                                                value={monthData.paymentMode}
                                                                                onChange={(e) => handleUpdatePaymentField(emp._id, 'paymentMode', e.target.value)}
                                                                                w="100px"
                                                                                fontSize="xs"
                                                                                bg={monthData.paymentMode === 'UPI' ? 'purple.50' : monthData.paymentMode === 'Cheque' ? 'orange.50' : 'blue.50'}
                                                                                border="1px solid"
                                                                                borderColor={monthData.paymentMode === 'UPI' ? 'purple.200' : monthData.paymentMode === 'Cheque' ? 'orange.200' : 'blue.200'}
                                                                            >
                                                                                <option value="Cash">💵 Cash</option>
                                                                                <option value="Cheque">✍️ Cheque</option>
                                                                                <option value="UPI">📱 UPI</option>
                                                                            </Select>
                                                                        </Td>
                                                                        <Td whiteSpace="nowrap">
                                                                            <Select
                                                                                size="xs"
                                                                                borderRadius="lg"
                                                                                value={monthData.paymentStatus}
                                                                                onChange={(e) => handleUpdatePaymentField(emp._id, 'paymentStatus', e.target.value)}
                                                                                w="105px"
                                                                                fontSize="xs"
                                                                                fontWeight="bold"
                                                                                color={isDone ? 'green.700' : 'orange.700'}
                                                                                bg={isDone ? 'green.50' : 'orange.50'}
                                                                                border="1px solid"
                                                                                borderColor={isDone ? 'green.200' : 'orange.200'}
                                                                            >
                                                                                <option value="Pending">⏳ Pending</option>
                                                                                <option value="Done">✅ Done</option>
                                                                            </Select>
                                                                        </Td>
                                                                        <Td textAlign="center" whiteSpace="nowrap">
                                                                            <Badge
                                                                                colorScheme={isDeactive ? 'red' : 'green'}
                                                                                variant="solid"
                                                                                borderRadius="full"
                                                                                px={3}
                                                                                fontSize="9px"
                                                                            >
                                                                                {isDeactive ? '❌ Deactive' : '✅ Active'}
                                                                            </Badge>
                                                                        </Td>
                                                                    </Tr>
                                                                );
                                                            })}
                                                        </Tbody>
                                                    </Table>
                                                </Box>

                                                {reportFiltered.length > 0 && (
                                                    <Box bg="blue.50" p={3} borderRadius="xl" border="1px solid" borderColor="blue.100">
                                                        <HStack justify="space-between" wrap="wrap" spacing={4}>
                                                            <Text fontSize="xs" color="blue.700" fontWeight="bold">
                                                                Showing {reportFiltered.length} of {employees.length} employees · Month: {reportMonthFilter}
                                                            </Text>
                                                            <Text fontSize="xs" color="blue.700" fontWeight="bold">
                                                                Total: ₹{reportFiltered.reduce((a, e) => a + parseFloat(e.salary || 0), 0).toLocaleString()}
                                                            </Text>
                                                        </HStack>
                                                    </Box>
                                                )}
                                            </VStack>
                                        );
                                    })()}
                                </TabPanel>

                            </TabPanels>
                        </Tabs>

                        {/* Standardized Employee View Modal */}
                        <Modal isOpen={!!viewEmployee} onClose={() => setViewEmployee(null)} size="4xl" isCentered motionPreset="slideInBottom">
                            <ModalOverlay backdropFilter="blur(8px) grayscale(40%)" bg="blackAlpha.600" />
                            <ModalContent borderRadius="3xl" overflow="hidden" boxShadow="2xl" border="1px solid" borderColor="whiteAlpha.300">
                                <ModalHeader p={0}>
                                    <Box bgGradient="linear(to-r, blue.800, blue.600)" p={6} color="white">
                                        <HStack justify="space-between" spacing={4}>
                                            <HStack spacing={4}>
                                                <Avatar
                                                    size="lg"
                                                    src={viewEmployee?.photo?.url ? `${API_BASE_URL}${viewEmployee.photo.url}` : undefined}
                                                    name={viewEmployee?.name}
                                                    borderRadius="xl"
                                                    border="2px solid white"
                                                />
                                                <VStack align="start" spacing={0}>
                                                    <Heading size="md">{viewEmployee?.name}</Heading>
                                                    <Text fontSize="xs" opacity={0.8}>{viewEmployee?.empId} • {viewEmployee?.designation}</Text>
                                                </VStack>
                                            </HStack>
                                            <ModalCloseButton position="static" borderRadius="full" />
                                        </HStack>
                                    </Box>
                                </ModalHeader>

                                <ModalBody p={8}>
                                    {viewEmployee && (
                                        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10}>
                                            <VStack align="start" spacing={6}>
                                                <Box w="full">
                                                    <Text fontSize="11px" fontWeight="black" color="blue.500" textTransform="uppercase" mb={3}>Personal & Contact</Text>
                                                    <VStack align="start" spacing={3}>
                                                        <Box>
                                                            <Text fontSize="9px" color="gray.400" fontWeight="bold">PHONE</Text>
                                                            <Text fontSize="sm" fontWeight="bold" color="gray.700">{viewEmployee.phone}</Text>
                                                        </Box>
                                                        <Box>
                                                            <Text fontSize="9px" color="gray.400" fontWeight="bold">EMAIL</Text>
                                                            <Text fontSize="sm" color="gray.700">{viewEmployee.email || 'N/A'}</Text>
                                                        </Box>
                                                    </VStack>
                                                </Box>
                                                <Box bg="red.50" p={4} borderRadius="2xl" border="1px dashed" borderColor="red.200" w="full">
                                                    <Text fontSize="10px" color="red.600" fontWeight="black">EMERGENCY CONTACT</Text>
                                                    <Text fontSize="sm" fontWeight="bold" color="red.800">{viewEmployee.emergencyContact?.name}</Text>
                                                    <Text fontSize="xs" color="red.700">{viewEmployee.emergencyContact?.phone}</Text>
                                                </Box>
                                            </VStack>

                                            <VStack align="start" spacing={6}>
                                                <Box bg="green.50" p={4} borderRadius="2xl" w="full" border="1px solid" borderColor="green.100">
                                                    <Text fontSize="10px" color="green.600" fontWeight="black">GROSS SALARY (CTC)</Text>
                                                    <Text fontSize="2xl" fontWeight="black" color="green.800">₹{parseFloat(viewEmployee.salary || 0).toLocaleString()}</Text>
                                                </Box>
                                                <Box w="full">
                                                    <Text fontSize="11px" fontWeight="black" color="orange.500" textTransform="uppercase" mb={3}>Bank Details</Text>
                                                    <VStack align="start" spacing={3} bg="orange.50" p={4} borderRadius="xl">
                                                        <Box>
                                                            <Text fontSize="9px" color="orange.600" fontWeight="bold">BANK</Text>
                                                            <Text fontSize="xs" fontWeight="bold">{viewEmployee.bankDetails?.bankName || 'N/A'}</Text>
                                                        </Box>
                                                        <Box>
                                                            <Text fontSize="9px" color="orange.600" fontWeight="bold">A/C NUMBER</Text>
                                                            <Text fontSize="xs" fontWeight="bold">{viewEmployee.bankDetails?.accountNumber || 'N/A'}</Text>
                                                        </Box>
                                                        <Box>
                                                            <Text fontSize="9px" color="orange.600" fontWeight="bold">IFSC CODE</Text>
                                                            <Text fontSize="xs" color="blue.600" fontWeight="bold">{viewEmployee.bankDetails?.ifscCode || 'N/A'}</Text>
                                                        </Box>
                                                    </VStack>
                                                </Box>
                                            </VStack>

                                            <VStack align="start" spacing={6}>
                                                <Box w="full">
                                                    <Text fontSize="11px" fontWeight="black" color="cyan.500" textTransform="uppercase" mb={3}>Address Details</Text>
                                                    <VStack align="start" spacing={4}>
                                                        <Box>
                                                            <Text fontSize="9px" color="gray.400" fontWeight="bold">CURRENT ADDRESS</Text>
                                                            <Text fontSize="xs" lineHeight="1.6" color="gray.700">
                                                                {viewEmployee.addressLine1?.street}, {viewEmployee.addressLine1?.city} - {viewEmployee.addressLine1?.pincode}
                                                            </Text>
                                                        </Box>
                                                        <Box>
                                                            <Text fontSize="9px" color="gray.400" fontWeight="bold">PERMANENT ADDRESS</Text>
                                                            <Text fontSize="xs" lineHeight="1.6" color="gray.700">
                                                                {viewEmployee.addressLine2?.street || 'Same'}, {viewEmployee.addressLine2?.city} - {viewEmployee.addressLine2?.pincode}
                                                            </Text>
                                                        </Box>
                                                    </VStack>
                                                </Box>
                                                <Box w="full">
                                                    <Text fontSize="11px" fontWeight="black" color="purple.500" textTransform="uppercase" mb={3}>KYC Documents</Text>
                                                    <Wrap spacing={2}>
                                                        {['aadharCard', 'panCard', 'voterId', 'drivingLicense'].map(field => (
                                                            viewEmployee[field]?.url && (
                                                                <Button
                                                                    key={field} as="a" target="_blank" size="xs" colorScheme="purple" variant="subtle"
                                                                    href={`${API_BASE_URL}${viewEmployee[field].url}`}
                                                                    leftIcon={<Icon as={FaFileAlt} />}
                                                                    borderRadius="lg"
                                                                    _hover={{ transform: 'translateY(-2px)', boxShadow: 'sm' }}
                                                                >
                                                                    {field.replace('Card', '').replace('Id', ' ID').toUpperCase()}
                                                                </Button>
                                                            )
                                                        ))}
                                                    </Wrap>
                                                </Box>
                                            </VStack>
                                        </SimpleGrid>
                                    )}
                                </ModalBody>
                                <ModalFooter bg="gray.50">
                                    <Button colorScheme="blue" px={10} borderRadius="full" shadow="lg" onClick={() => setViewEmployee(null)}>Close Profile</Button>
                                </ModalFooter>
                            </ModalContent>
                        </Modal>

                        {/* Mandatory Submission Confirmation */}
                        <AlertDialog
                            isOpen={isConfirmOpen}
                            leastDestructiveRef={cancelRef}
                            onClose={onConfirmClose}
                            isCentered
                        >
                            <AlertDialogOverlay>
                                <AlertDialogContent borderRadius="2xl" mx={4}>
                                    <AlertDialogHeader fontSize="lg" fontWeight="bold">
                                        Confirm Employee Registration
                                    </AlertDialogHeader>
                                    <AlertDialogBody>
                                        Are you sure you want to {editId ? 'update' : 'register'} <strong>{formData.name}</strong>?
                                        <br /><br />
                                        Please ensure the <strong>Account Number</strong> and <strong>IFSC Code</strong> are correct as these cannot be easily changed later.
                                    </AlertDialogBody>
                                    <AlertDialogFooter>
                                        <Button ref={cancelRef} onClick={onConfirmClose} borderRadius="full">
                                            Go Back
                                        </Button>
                                        <Button colorScheme="blue" onClick={confirmSubmit} ml={3} borderRadius="full" px={10} shadow="md">
                                            Confirm & Save
                                        </Button>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialogOverlay>
                        </AlertDialog>

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
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState('table');
    const [viewClient, setViewClient] = useState(null);
    const { isOpen: isConfirmOpen, onOpen: onConfirmOpen, onClose: onConfirmClose } = useDisclosure();
    const cancelRef = React.useRef();
    const [activeTab, setActiveTab] = useState(0);

    const filteredClients = clients.filter(c =>
        c.clientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.clientId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.contactPersonPhone?.toLowerCase().includes(searchQuery.toLowerCase())
    );

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

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this client record?')) return;
        try {
            await api.delete(`/client-master/${id}`);
            toast({ title: 'Deleted', status: 'info', duration: 2000 });
            fetchClients();
            if (editId === id) {
                setEditId('');
                setFormData({ clientName: '', email: '', contactPersonName: '', contactPersonPhone: '', panCard: '', clientAddress: '', gstNo: '', msmeNo: '' });
                fetchNextId();
            }
        } catch (err) {
            toast({ title: 'Error', description: err.response?.data?.message || 'Delete failed', status: 'error', duration: 3000 });
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
        onConfirmOpen();
    };

    const confirmSubmit = async () => {
        onConfirmClose();
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
                    <Box bg="orange.600" p={{ base: 5, md: 8 }} color="white">
                        <Stack direction={{ base: "column", md: "row" }} justify="space-between" align="center" spacing={4}>
                            <Box>
                                <Heading size="lg">{editId ? 'Edit Client' : 'Client Management'}</Heading>
                                <Text opacity={0.8} mt={1}>Admin Panel: Manage enterprise clients and statutory documents</Text>
                            </Box>
                            <HStack w={{ base: "full", md: "auto" }} spacing={2}>
                                <Input
                                    bg="white" color="gray.800" placeholder="Search Client, ID, Phone..." size="md" borderRadius="xl"
                                    w={{ base: "full", md: "250px" }} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                <IconButton
                                    icon={<Icon as={viewMode === 'table' ? FaUserTie : FaUserTie} />}
                                    onClick={() => setViewMode(viewMode === 'table' ? 'card' : 'table')}
                                    borderRadius="xl" colorScheme="whiteAlpha" variant="solid" aria-label="Toggle View"
                                />
                                <Button
                                    colorScheme="green" leftIcon={<Icon as={FaUserTie} />}
                                    onClick={() => {
                                        handleSelectClient({ target: { value: '' } });
                                        setActiveTab(0);
                                    }} borderRadius="xl"
                                >
                                    Add New
                                </Button>
                            </HStack>
                        </Stack>
                    </Box>
                    <CardBody p={{ base: 5, md: 10 }}>
                        <Tabs index={activeTab} onChange={(idx) => setActiveTab(idx)} colorScheme="orange" variant="soft-rounded">
                            <TabList mb={6} justifyContent="center" bg="gray.50" p={2} borderRadius="2xl" border="1px solid" borderColor="gray.100">
                                <Tab fontWeight="bold" borderRadius="xl" px={6} py={3} _selected={{ color: 'white', bg: 'orange.500', shadow: 'md' }}>Form</Tab>
                                <Tab fontWeight="bold" borderRadius="xl" px={6} py={3} _selected={{ color: 'white', bg: 'orange.500', shadow: 'md' }}>View</Tab>
                            </TabList>
                            <TabPanels>
                                <TabPanel p={0}>
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
                                </TabPanel>
                                <TabPanel p={0}>
                        {/* Client List View */}
                        <Box mt={10}>
                            <Flex justify="space-between" align="center" mb={4}>
                                <Heading size="md" color="orange.700" display="flex" alignItems="center">
                                    <Icon as={FaUserTie} mr={2} /> Registered Clients ({filteredClients.length})
                                </Heading>
                            </Flex>

                            {viewMode === 'table' ? (
                                <Box overflow="hidden" w="full" bg="white" borderRadius="xl" boxShadow="sm" border="1px solid" borderColor="gray.200">
                                    <Table variant="simple" sx={{ 'th, td': { whiteSpace: 'normal', wordBreak: 'break-word' } }}>
                                        <Thead bg="gray.50">
                                            <Tr>
                                                <Th whiteSpace="nowrap">ID</Th>
                                                <Th>Client Name</Th>
                                                <Th>Contact Person</Th>
                                                <Th>GST No</Th>
                                                <Th textAlign="center">Actions</Th>
                                            </Tr>
                                        </Thead>
                                        <Tbody>
                                            {filteredClients.map(c => (
                                                <Tr key={c._id} _hover={{ bg: "orange.50" }} transition="background 0.2s">
                                                    <Td fontWeight="bold" color="orange.600" whiteSpace="nowrap">{c.clientId}</Td>
                                                    <Td fontWeight="semibold" whiteSpace="normal" wordBreak="break-word">{c.clientName}</Td>
                                                    <Td>
                                                        <VStack align="start" spacing={0}>
                                                            <Text fontSize="sm" fontWeight="bold">{c.contactPersonName || c.contactPerson?.name}</Text>
                                                            <Text fontSize="xs" color="gray.500">{c.contactPersonPhone || c.contactPerson?.phone}</Text>
                                                        </VStack>
                                                    </Td>
                                                    <Td><Badge colorScheme="blue" variant="subtle" borderRadius="md">{c.gstNo || 'N/A'}</Badge></Td>
                                                    <Td textAlign="center">
                                                        <HStack justify="center" spacing={1}>
                                                            <IconButton aria-label="View" size="sm" colorScheme="teal" variant="ghost" icon={<Icon as={FaEye} />} onClick={() => setViewClient(c)} />
                                                            <IconButton aria-label="Edit" size="sm" colorScheme="blue" variant="ghost" icon={<Icon as={FaEdit} />} onClick={() => handleSelectClient({ target: { value: c._id } })} />
                                                            <IconButton aria-label="Delete" size="sm" colorScheme="red" variant="ghost" icon={<Icon as={FaTrash} />} onClick={() => handleDelete(c._id)} />
                                                        </HStack>
                                                    </Td>
                                                </Tr>
                                            ))}
                                        </Tbody>
                                    </Table>
                                </Box>
                            ) : (
                                <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} spacing={4}>
                                    {filteredClients.map(c => (
                                        <Card key={c._id} borderRadius="xl" border="1px solid" borderColor="gray.100" _hover={{ shadow: 'md', borderColor: 'orange.300' }} transition="all 0.2s">
                                            <CardBody p={4}>
                                                <HStack spacing={4} mb={4}>
                                                    <Box p={2} bg="orange.50" borderRadius="lg"><Icon as={FaUserTie} color="orange.500" w={6} h={6} /></Box>
                                                    <Box flex={1}>
                                                        <Text fontWeight="bold" fontSize="md" noOfLines={1}>{c.clientName}</Text>
                                                        <Text fontSize="xs" color="gray.500">{c.clientId}</Text>
                                                    </Box>
                                                </HStack>
                                                <VStack align="stretch" spacing={2} mb={4}>
                                                    <HStack fontSize="xs"><Icon as={FaUserTie} color="gray.400" /><Text fontWeight="bold">{c.contactPersonName || c.contactPerson?.name}</Text></HStack>
                                                    <HStack fontSize="xs"><Icon as={FaPhoneAlt} color="gray.400" /><Text>{c.contactPersonPhone || c.contactPerson?.phone}</Text></HStack>
                                                    <HStack fontSize="xs"><Icon as={FaEnvelope} color="gray.400" /><Text noOfLines={1}>{c.email || 'No email'}</Text></HStack>
                                                </VStack>
                                                <HStack justify="flex-end" spacing={2} pt={2} borderTop="1px solid" borderColor="gray.50">
                                                    <Button size="xs" colorScheme="teal" variant="ghost" leftIcon={<FaEye />} onClick={() => setViewClient(c)}>View</Button>
                                                    <Button size="xs" colorScheme="blue" variant="ghost" leftIcon={<FaEdit />} onClick={() => handleSelectClient({ target: { value: c._id } })}>Edit</Button>
                                                </HStack>
                                            </CardBody>
                                        </Card>
                                    ))}
                                </SimpleGrid>
                            )}

                            {filteredClients.length === 0 && (
                                <Center p={10} bg="white" borderRadius="xl" border="1px dashed" borderColor="gray.200">
                                    <VStack spacing={2}>
                                        <Icon as={FaUserTie} w={8} h={8} color="gray.300" />
                                        <Text color="gray.500">No clients found matching "{searchQuery}"</Text>
                                    </VStack>
                                </Center>
                            )}
                        </Box>

                        {/* Standardized Client View Modal */}
                        <Modal isOpen={!!viewClient} onClose={() => setViewClient(null)} size="3xl" isCentered motionPreset="slideInBottom">
                            <ModalOverlay backdropFilter="blur(8px) grayscale(40%)" bg="blackAlpha.600" />
                            <ModalContent borderRadius="3xl" overflow="hidden" boxShadow="2xl" border="1px solid" borderColor="whiteAlpha.300">
                                <ModalHeader p={0}>
                                    <Box bgGradient="linear(to-r, orange.800, orange.600)" p={6} color="white">
                                        <HStack justify="space-between">
                                            <HStack spacing={4}>
                                                <Icon as={FaUserTie} w={8} h={8} />
                                                <VStack align="start" spacing={0}>
                                                    <Heading size="md">{viewClient?.clientName}</Heading>
                                                    <Text fontSize="xs" opacity={0.8}>{viewClient?.clientId} • Enterprise Client</Text>
                                                </VStack>
                                            </HStack>
                                            <ModalCloseButton position="static" borderRadius="full" />
                                        </HStack>
                                    </Box>
                                </ModalHeader>
                                <ModalBody p={8}>
                                    {viewClient && (
                                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10}>
                                            <VStack align="start" spacing={6}>
                                                <Box w="full">
                                                    <Text fontSize="10px" fontWeight="black" color="orange.500" textTransform="uppercase" mb={3}>Primary Contact</Text>
                                                    <VStack align="start" spacing={4} p={4} bg="orange.50" borderRadius="2xl" w="full">
                                                        <Box>
                                                            <Text fontSize="9px" color="orange.600" fontWeight="bold">CONTACT PERSON</Text>
                                                            <Text fontSize="sm" fontWeight="bold" color="gray.800">{viewClient.contactPersonName || viewClient.contactPerson?.name}</Text>
                                                        </Box>
                                                        <Box>
                                                            <Text fontSize="9px" color="orange.600" fontWeight="bold">PHONE NUMBER</Text>
                                                            <Text fontSize="sm" fontWeight="bold" color="gray.800">{viewClient.contactPersonPhone || viewClient.contactPerson?.phone}</Text>
                                                        </Box>
                                                        <Box>
                                                            <Text fontSize="9px" color="orange.600" fontWeight="bold">EMAIL ADDRESS</Text>
                                                            <Text fontSize="sm" color="gray.800">{viewClient.email || 'N/A'}</Text>
                                                        </Box>
                                                    </VStack>
                                                </Box>
                                            </VStack>

                                            <VStack align="start" spacing={6}>
                                                <Box w="full">
                                                    <Text fontSize="10px" fontWeight="black" color="blue.500" textTransform="uppercase" mb={3}>Statutory Info</Text>
                                                    <VStack align="start" spacing={4} p={4} bg="blue.50" borderRadius="2xl" w="full">
                                                        <Box>
                                                            <Text fontSize="9px" color="blue.600" fontWeight="bold">GST NUMBER</Text>
                                                            <Text fontSize="sm" fontWeight="bold" color="gray.800">{viewClient.gstNo || 'N/A'}</Text>
                                                        </Box>
                                                        <Box>
                                                            <Text fontSize="9px" color="blue.600" fontWeight="bold">PAN CARD</Text>
                                                            <Text fontSize="sm" fontWeight="bold" color="gray.800">{viewClient.panCard || 'N/A'}</Text>
                                                        </Box>
                                                    </VStack>
                                                </Box>
                                                <Box w="full">
                                                    <Text fontSize="10px" fontWeight="black" color="purple.500" textTransform="uppercase" mb={3}>Documents</Text>
                                                    <Wrap spacing={2}>
                                                        {viewClient.documents?.find(d => d.type === 'GST') && (
                                                            <Button as="a" target="_blank" href={`${API_BASE_URL}${viewClient.documents.find(d => d.type === 'GST').url}`} size="xs" colorScheme="purple" variant="subtle" leftIcon={<Icon as={FaFileAlt} />}>GST CERT</Button>
                                                        )}
                                                        {viewClient.documents?.find(d => d.type === 'MSME') && (
                                                            <Button as="a" target="_blank" href={`${API_BASE_URL}${viewClient.documents.find(d => d.type === 'MSME').url}`} size="xs" colorScheme="teal" variant="subtle" leftIcon={<Icon as={FaFileAlt} />}>MSME CERT</Button>
                                                        )}
                                                    </Wrap>
                                                </Box>
                                            </VStack>
                                        </SimpleGrid>
                                    )}
                                </ModalBody>
                                <ModalFooter bg="gray.50">
                                    <Button colorScheme="orange" px={10} borderRadius="full" shadow="lg" onClick={() => setViewClient(null)}>Close</Button>
                                </ModalFooter>
                            </ModalContent>
                        </Modal>
                                </TabPanel>
                            </TabPanels>
                        </Tabs>
                    </CardBody>
                </Card>
            </Container>

            <AlertDialog isOpen={isConfirmOpen} leastDestructiveRef={cancelRef} onClose={onConfirmClose} isCentered>
                <AlertDialogOverlay>
                    <AlertDialogContent borderRadius="2xl">
                        <AlertDialogHeader fontSize="lg" fontWeight="bold">Confirm Client Record</AlertDialogHeader>
                        <AlertDialogBody>
                            Are you sure you want to {editId ? 'update' : 'save'} <strong>{formData.clientName}</strong>?
                        </AlertDialogBody>
                        <AlertDialogFooter>
                            <Button ref={cancelRef} onClick={onConfirmClose} borderRadius="full">Cancel</Button>
                            <Button colorScheme="orange" onClick={confirmSubmit} ml={3} borderRadius="full" px={8}>Confirm & Save</Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
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
    const [allSites, setAllSites] = useState([]);
    const [filterClientId, setFilterClientId] = useState('');
    const [editId, setEditId] = useState('');
    const [viewSite, setViewSite] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [tableSearch, setTableSearch] = useState('');
    const [viewMode, setViewMode] = useState('table');
    const [activeTab, setActiveTab] = useState(0);

    const [formData, setFormData] = useState({
        client: '',
        siteName: '',
        siteAddress: '',
        siteLocation: '',
        status: 'Active'
    });
    const [ledgerItems, setLedgerItems] = useState([{ ledger: '', amount: '', isNew: false }]);
    const [contactPersons, setContactPersons] = useState([{ name: '', phone: '' }]);
    const [docs, setDocs] = useState(null);
    const [locationLoading, setLocationLoading] = useState(false);
    const [nextSiteId, setNextSiteId] = useState('');
    const [isNewLedger, setIsNewLedger] = useState(false);

    const fetchSites = async (q = '') => {
        try {
            const res = await api.get(`/site-master?search=${encodeURIComponent(q)}`);
            if (res.data.success) setAllSites(res.data.data);
        } catch (error) { console.error("Error fetching sites:", error); }
    };

    const fetchInitial = async () => {
        try {
            const [cRes, eRes, lRes] = await Promise.all([
                api.get('/client-master'),
                api.get('/employee-master'),
                api.get('/site-master/ledgers')
            ]);
            if (cRes.data.success) {
                const clientList = cRes.data.data;
                setClients(clientList);
                const defaultClient = clientList.find(c => c.clientId === '00001') || clientList[0];
                if (defaultClient && !filterClientId) setFilterClientId(defaultClient._id);
            }
            if (eRes.data.success) setEmployees(eRes.data.data);
            if (lRes.data.success) setLedgers(lRes.data.data);
            
            // Initial site fetch
            await fetchSites(searchQuery);
        } catch (error) {
            console.error("Error fetching dependencies:", error);
        }
    };

    // Debounced API search
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchSites(searchQuery);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleChange = async (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if (name === 'client' && value && !editId) {
            try {
                const res = await api.get(`/site-master/next-id/${value}`);
                if (res.data.success) setNextSiteId(res.data.nextId);
            } catch (err) { console.error('Failed to fetch next site ID', err); }
        } else if (name === 'client' && !value) {
            setNextSiteId('');
        }
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
            Object.keys(formData).forEach(key => {
                if (formData[key]) uploadData.append(key, formData[key]);
            });
            if (nextSiteId) uploadData.append('siteId', nextSiteId);
            const cleanedLedgers = ledgerItems.filter(li => li.ledger && li.ledger.trim() !== '' && li.amount);
            uploadData.append('ledgerItems', JSON.stringify(cleanedLedgers.map(item => ({ ledger: item.ledger, amount: item.amount }))));
            const cleanedContacts = contactPersons.filter(cp => cp.name.trim() || cp.phone.trim());
            uploadData.append('contactPersons', JSON.stringify(cleanedContacts));
            if (docs) {
                Array.from(docs).forEach(file => uploadData.append('docs', file));
            }

            let response;
            if (editId) {
                response = await api.put(`/site-master/${editId}`, uploadData);
            } else {
                response = await api.post('/site-master', uploadData);
            }

            if (response.data.success) {
                toast({ title: editId ? "Updated" : "Success", description: editId ? "Site record updated" : "Site record stored successfully", status: "success", duration: 3000 });
                setFormData({ client: '', siteName: '', siteAddress: '', siteLocation: '', status: 'Active' });
                setLedgerItems([{ ledger: '', amount: '', isNew: false }]);
                setContactPersons([{ name: '', phone: '' }]);
                setDocs(null);
                setEditId('');
                setNextSiteId('');
                fetchInitial();
            }
        } catch (error) {
            toast({ title: "Error", description: error.response?.data?.message || "Failed to store record", status: "error", duration: 3000 });
        } finally {
            setIsLoading(false);
        }
    };

    const handleEditSite = (s) => {
        setEditId(s._id);
        setFormData({
            client: s.client?._id || s.client || '',
            siteName: s.siteName || '',
            siteAddress: s.siteAddress || '',
            siteLocation: s.siteLocation || '',
            status: s.status || 'Active'
        });
        setLedgerItems(s.ledgerItems?.length > 0 ? s.ledgerItems.map(li => ({ ...li, isNew: false })) : [{ ledger: '', amount: '', isNew: false }]);
        setContactPersons(s.contactPersons?.length > 0 ? s.contactPersons : [{ name: '', phone: '' }]);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDeleteSite = async (id) => {
        console.log('handleDeleteSite triggered for ID:', id);
        if (!window.confirm('Delete this site record?')) return;
        try {
            await api.delete(`/site-master/${id}`);
            toast({ title: 'Deleted', status: 'info', duration: 2000 });
            fetchInitial();
            if (editId === id) setEditId('');
        } catch (err) {
            toast({ title: 'Error', description: err.response?.data?.message || 'Delete failed', status: 'error', duration: 3000 });
        }
    };

    const filteredSites = allSites.filter(s => {
        const q = tableSearch.toLowerCase();
        const matchesTableSearch = 
            !tableSearch ||
            s.siteName?.toLowerCase().includes(q) ||
            s.siteId?.toLowerCase().includes(q) ||
            s.siteAddress?.toLowerCase().includes(q) ||
            s.client?.clientName?.toLowerCase().includes(q);

        if (filterClientId) {
            const cId = s.client?._id || s.client;
            return cId === filterClientId && matchesTableSearch;
        }
        return matchesTableSearch;
    });

    useEffect(() => { fetchInitial(); }, []);

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

    return (
        <Box py={5} bg="gray.100" minH="100vh">
            <Container maxW="container.lg">
                <Card variant="elevated" borderRadius="2xl" boxShadow="2xl" bg="white" overflow="hidden">
                    <Box bg="teal.600" p={{ base: 5, md: 8 }} color="white">
                        <Stack direction={{ base: "column", md: "row" }} justify="space-between" align="center" spacing={4}>
                            <Box>
                                <Heading size="lg">{editId ? 'Edit Site' : 'Site Management'}</Heading>
                                <Text opacity={0.8} mt={1}>Admin Panel: Link project sites to clients and manage location details</Text>
                            </Box>
                            <HStack w={{ base: "full", md: "auto" }} spacing={2}>
                                <Box position="relative" w={{ base: "full", md: "300px" }}>
                                    <Input
                                        bg="white" 
                                        color="gray.800" 
                                        placeholder="Search by Name, ID, Address..." 
                                        size="md" 
                                        borderRadius="xl"
                                        pl={10}
                                        pr={searchQuery ? 10 : 4}
                                        value={searchQuery} 
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        boxShadow="inner"
                                    />
                                    <Box position="absolute" left={3} top="50%" transform="translateY(-50%)" color="gray.400">
                                        <Icon as={FaSearch} />
                                    </Box>
                                    {searchQuery && (
                                        <IconButton
                                            aria-label="Clear search"
                                            icon={<FaTimes />}
                                            size="xs"
                                            variant="ghost"
                                            position="absolute"
                                            right={2}
                                            top="50%"
                                            transform="translateY(-50%)"
                                            color="gray.400"
                                            _hover={{ color: 'red.500' }}
                                            onClick={() => setSearchQuery('')}
                                        />
                                    )}
                                </Box>
                                <IconButton
                                    icon={<Icon as={viewMode === 'table' ? FaListUl : FaMapMarkerAlt} />}
                                    onClick={() => setViewMode(viewMode === 'table' ? 'card' : 'table')}
                                    borderRadius="xl" colorScheme="whiteAlpha" variant="solid" aria-label="Toggle View"
                                />
                                <Button
                                    colorScheme="green" leftIcon={<Icon as={FaMapMarkerAlt} />}
                                    onClick={() => {
                                        setEditId('');
                                        setFormData({ client: '', siteName: '', siteAddress: '', siteLocation: '', ledger: '', amount: '' });
                                        setContactPersons([{ name: '', phone: '' }]);
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
                        <form onSubmit={handleSubmit} onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}>
                            <VStack spacing={6} align="stretch">
                                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
                                    <FormControl isRequired>
                                        <FormLabel fontWeight="bold">Select Client</FormLabel>
                                        <Select name="client" placeholder="Choose Client" value={formData.client} onChange={handleChange} borderRadius="xl" size="lg" bg="gray.50">
                                            {clients.map(c => <option key={c._id} value={c._id}>{c.clientId} - {c.clientName}</option>)}
                                        </Select>
                                    </FormControl>

                                    <FormControl>
                                        <FormLabel fontWeight="bold" fontSize="sm">Site ID (Generated)</FormLabel>
                                        <HStack bg="gray.50" p={1} borderRadius="xl" border="1px dashed" borderColor="gray.300">
                                            <Icon as={FaFingerprint} ml={2} color="teal.500" />
                                            <Input
                                                variant="unstyled"
                                                p={2}
                                                value={editId ? (allSites.find(s => s._id === editId)?.siteId || '') : (nextSiteId || 'NEW')}
                                                isReadOnly
                                                color="teal.700"
                                                fontWeight="bold"
                                            />
                                        </HStack>
                                    </FormControl>
                                </SimpleGrid>

                                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
                                    <FormControl isRequired>
                                        <FormLabel fontWeight="bold">Site Name</FormLabel>
                                        <HStack bg="gray.50" p={1} borderRadius="xl" border="1px solid" borderColor="gray.200">
                                            <Icon as={FaMap} ml={3} color="teal.500" />
                                            <Input name="siteName" variant="unstyled" p={2} placeholder="Construction Site Alpha" value={formData.siteName} onChange={handleChange} />
                                        </HStack>
                                    </FormControl>
                                    <FormControl>
                                        <FormLabel fontWeight="bold">Status</FormLabel>
                                        <Select name="status" value={formData.status} onChange={handleChange} borderRadius="xl" size="lg" bg="gray.50">
                                            <option value="Active">Active</option>
                                            <option value="Deactive">Deactive</option>
                                        </Select>
                                    </FormControl>
                                </SimpleGrid>

                                <Box p={6} bg="teal.50" borderRadius="2xl" border="1px solid" borderColor="teal.100">
                                    <HStack justify="space-between" mb={4}>
                                        <Heading size="sm" color="teal.700" display="flex" alignItems="center">
                                            <Icon as={FaFileInvoiceDollar} mr={2} /> Ledger Assignments
                                        </Heading>
                                        <Button size="xs" colorScheme="teal" onClick={() => addArrayItem(setLedgerItems, { ledger: '', amount: '', isNew: false })}>
                                            + Add Item
                                        </Button>
                                    </HStack>
                                    <VStack spacing={4} align="stretch">
                                        {ledgerItems.map((item, idx) => (
                                            <SimpleGrid key={idx} columns={{ base: 1, md: 3 }} spacing={4} bg="white" p={3} borderRadius="xl" shadow="sm">
                                                <FormControl>
                                                    {!item.isNew ? (
                                                        <Select
                                                            placeholder="Select Ledger"
                                                            value={item.ledger}
                                                            onChange={(e) => {
                                                                if (e.target.value === 'NEW_LEDGER_TRIGGER') {
                                                                    handleArrayChange(setLedgerItems, idx, 'isNew', true);
                                                                    handleArrayChange(setLedgerItems, idx, 'ledger', '');
                                                                } else {
                                                                    handleArrayChange(setLedgerItems, idx, 'ledger', e.target.value);
                                                                }
                                                            }}
                                                            borderRadius="lg"
                                                        >
                                                            {ledgers.map((l, i) => <option key={i} value={l}>{l}</option>)}
                                                            <option value="NEW_LEDGER_TRIGGER">+ Create New Ledger</option>
                                                        </Select>
                                                    ) : (
                                                        <HStack>
                                                            <Input
                                                                placeholder="Enter Ledger Name"
                                                                value={item.ledger}
                                                                onChange={(e) => handleArrayChange(setLedgerItems, idx, 'ledger', e.target.value)}
                                                                borderRadius="lg"
                                                                autoFocus
                                                            />
                                                            <IconButton
                                                                icon={<FaUndo />}
                                                                size="sm"
                                                                variant="ghost"
                                                                onClick={() => handleArrayChange(setLedgerItems, idx, 'isNew', false)}
                                                                title="Switch back to list"
                                                            />
                                                        </HStack>
                                                    )}
                                                </FormControl>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        placeholder="Amount"
                                                        value={item.amount}
                                                        onChange={(e) => handleArrayChange(setLedgerItems, idx, 'amount', e.target.value)}
                                                        borderRadius="lg"
                                                    />
                                                </FormControl>
                                                <HStack justify="flex-end">
                                                    <IconButton
                                                        icon={<FaTrash />}
                                                        colorScheme="red"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => removeArrayItem(setLedgerItems, idx)}
                                                        isDisabled={ledgerItems.length === 1}
                                                    />
                                                </HStack>
                                            </SimpleGrid>
                                        ))}
                                    </VStack>
                                </Box>

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
                                    {editId ? 'Update Site Record' : 'Save Master Site Profile'}
                                </Button>
                            </VStack>
                        </form>
                                </TabPanel>
                                <TabPanel p={0}>
                        {/* Site List View */}
                        <Box mt={10}>
                            <Flex justify="space-between" align="center" mb={4} flexWrap="wrap" gap={4}>
                                <Heading size="md" color="teal.700" display="flex" alignItems="center">
                                    <Icon as={FaMapMarkerAlt} mr={2} /> Registered Sites ({filteredSites.length})
                                </Heading>
                                <HStack spacing={3} bg="teal.50" p={2} borderRadius="2xl" border="1px solid" borderColor="teal.100">
                                    <Input
                                        size="sm"
                                        placeholder="Quick Search Table..."
                                        bg="white"
                                        borderRadius="xl"
                                        w="200px"
                                        value={tableSearch}
                                        onChange={(e) => setTableSearch(e.target.value)}
                                    />
                                    <Divider orientation="vertical" h="20px" borderColor="teal.200" />
                                    <Text fontSize="xs" fontWeight="bold" color="teal.700" whiteSpace="nowrap">Client Wise:</Text>
                                    <Select
                                        size="sm" borderRadius="xl" bg="white" w="200px"
                                        value={filterClientId} onChange={(e) => setFilterClientId(e.target.value)}
                                    >
                                        <option value="">All Clients</option>
                                        {clients.map(c => <option key={c._id} value={c._id}>{c.clientName}</option>)}
                                    </Select>
                                </HStack>
                            </Flex>

                            {viewMode === 'table' ? (
                                <Box overflow="hidden" w="full" bg="white" borderRadius="xl" boxShadow="sm" border="1px solid" borderColor="gray.200">
                                    <Table variant="simple" sx={{ 'th, td': { whiteSpace: 'normal', wordBreak: 'break-word' } }}>
                                        <Thead bg="gray.50">
                                            <Tr>
                                                <Th>Site Name</Th>
                                                <Th>Client</Th>
                                                <Th>Ledgers (Amt)</Th>
                                                <Th>Status</Th>
                                                <Th>Contact(s)</Th>
                                                <Th textAlign="center">Actions</Th>
                                            </Tr>
                                        </Thead>
                                        <Tbody>
                                            {filteredSites.map(s => (
                                                <Tr key={s._id} _hover={{ bg: "teal.50" }} transition="background 0.2s">
                                                    <Td fontWeight="bold" color="teal.600">{s.siteName}</Td>
                                                    <Td fontSize="sm">{s.client?.clientName}</Td>
                                                    <Td>
                                                        <VStack align="start" spacing={1}>
                                                            {s.ledgerItems?.filter(li => li.ledger && li.amount).map((li, idx) => (
                                                                <Badge key={idx} colorScheme="teal" variant="subtle" fontSize="10px">
                                                                    {li.ledger} (₹{li.amount?.toLocaleString()})
                                                                </Badge>
                                                            ))}
                                                            {(!s.ledgerItems || s.ledgerItems.filter(li => li.ledger && li.amount).length === 0) && <Text fontSize="xs" color="gray.400">No Ledgers</Text>}
                                                        </VStack>
                                                    </Td>
                                                    <Td>
                                                        <Badge colorScheme={s.status === 'Active' ? 'green' : 'red'} variant="subtle" borderRadius="full" px={2}>
                                                            {s.status}
                                                        </Badge>
                                                    </Td>
                                                    <Td>
                                                        <VStack align="start" spacing={0}>
                                                            {s.contactPersons?.slice(0, 1).map((cp, idx) => (
                                                                <Text key={idx} fontSize="xs" fontWeight="bold">{cp.name} • {cp.phone}</Text>
                                                            ))}
                                                            {s.contactPersons?.length > 1 && <Text fontSize="10px" color="gray.500">+{s.contactPersons.length - 1} more</Text>}
                                                        </VStack>
                                                    </Td>
                                                    <Td textAlign="center">
                                                        <HStack justify="center" spacing={1}>
                                                            <IconButton aria-label="View" size="sm" colorScheme="teal" variant="ghost" icon={<Icon as={FaEye} />} onClick={() => setViewSite(s)} />
                                                            <IconButton aria-label="Edit" size="sm" colorScheme="blue" variant="ghost" icon={<Icon as={FaEdit} />} onClick={() => {
                                                                setEditId(s._id);
                                                                setFormData({
                                                                    client: s.client?._id || s.client || '',
                                                                    siteName: s.siteName || '',
                                                                    siteAddress: s.siteAddress || '',
                                                                    siteLocation: s.siteLocation || '',
                                                                    status: s.status || 'Active'
                                                                });
                                                                setLedgerItems(s.ledgerItems?.length ? s.ledgerItems.map(li => ({ ...li, isNew: false })) : [{ ledger: '', amount: '', isNew: false }]);
                                                                setContactPersons(s.contactPersons?.length ? s.contactPersons : [{ name: '', phone: '' }]);
                                                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                                            }} />
                                                            <IconButton aria-label="Delete" size="sm" colorScheme="red" variant="ghost" icon={<Icon as={FaTrash} />} onClick={() => handleDeleteSite(s._id)} />
                                                        </HStack>
                                                    </Td>
                                                </Tr>
                                            ))}
                                        </Tbody>
                                    </Table>
                                </Box>
                            ) : (
                                <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} spacing={4}>
                                    {filteredSites.map(s => (
                                        <Card key={s._id} borderRadius="xl" border="1px solid" borderColor="gray.100" _hover={{ shadow: 'md', borderColor: 'teal.300' }} transition="all 0.2s">
                                            <CardBody p={4}>
                                                <HStack spacing={4} mb={4}>
                                                    <Box p={2} bg="teal.50" borderRadius="lg"><Icon as={FaMapMarkerAlt} color="teal.500" w={6} h={6} /></Box>
                                                    <Box flex={1}>
                                                        <Text fontWeight="bold" fontSize="md" noOfLines={1}>{s.siteName}</Text>
                                                        <Text fontSize="xs" color="gray.500">{s.client?.clientName}</Text>
                                                    </Box>
                                                    <Badge colorScheme={s.status === 'Active' ? 'green' : 'red'} variant="subtle" borderRadius="full">
                                                        {s.status}
                                                    </Badge>
                                                </HStack>
                                                <VStack align="stretch" spacing={2} mb={4}>
                                                    <HStack fontSize="xs" justify="space-between"><Text color="gray.500">Contacts:</Text><Text fontWeight="bold">{s.contactPersons?.length || 0}</Text></HStack>
                                                    <HStack fontSize="xs" justify="space-between" align="start">
                                                        <Text color="gray.500">Ledgers:</Text>
                                                        <VStack align="end" spacing={1}>
                                                            {s.ledgerItems?.filter(li => li.ledger && li.amount).slice(0, 2).map((li, i) => (
                                                                <Text key={i} fontWeight="bold" fontSize="10px">{li.ledger} (₹{li.amount})</Text>
                                                            ))}
                                                            {s.ledgerItems?.filter(li => li.ledger && li.amount).length > 2 && <Text fontSize="9px" color="teal.500">+{s.ledgerItems.filter(li => li.ledger && li.amount).length - 2} more</Text>}
                                                        </VStack>
                                                    </HStack>
                                                </VStack>
                                                <HStack justify="flex-end" spacing={2} pt={2} borderTop="1px solid" borderColor="gray.50">
                                                    <Button size="xs" colorScheme="teal" variant="ghost" leftIcon={<FaEye />} onClick={() => setViewSite(s)}>View</Button>
                                                    <Button size="xs" colorScheme="blue" variant="ghost" leftIcon={<FaEdit />} onClick={() => {
                                                        setEditId(s._id);
                                                        setFormData({
                                                            client: s.client?._id || s.client || '',
                                                            siteName: s.siteName || '',
                                                            siteAddress: s.siteAddress || '',
                                                            siteLocation: s.siteLocation || '',
                                                            status: s.status || 'Active'
                                                        });
                                                        setLedgerItems(s.ledgerItems?.length ? s.ledgerItems.map(li => ({ ...li, isNew: false })) : [{ ledger: '', amount: '', isNew: false }]);
                                                        setContactPersons(s.contactPersons?.length ? s.contactPersons : [{ name: '', phone: '' }]);
                                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                                    }}>Edit</Button>
                                                    <IconButton aria-label="Delete" size="xs" colorScheme="red" variant="ghost" icon={<Icon as={FaTrash} />} onClick={() => handleDeleteSite(s._id)} />
                                                </HStack>
                                            </CardBody>
                                        </Card>
                                    ))}
                                </SimpleGrid>
                            )}

                            {filteredSites.length === 0 && (
                                <Center p={10} bg="white" borderRadius="xl" border="1px dashed" borderColor="gray.200">
                                    <VStack spacing={2}>
                                        <Icon as={FaMapMarkerAlt} w={8} h={8} color="gray.300" />
                                        <Text color="gray.500">No sites found matching "{searchQuery}"</Text>
                                    </VStack>
                                </Center>
                            )}
                        </Box>

                        {/* Standardized Site View Modal */}
                        <Modal isOpen={!!viewSite} onClose={() => setViewSite(null)} size="3xl" isCentered motionPreset="slideInBottom">
                            <ModalOverlay backdropFilter="blur(8px) grayscale(40%)" bg="blackAlpha.600" />
                            <ModalContent borderRadius="3xl" overflow="hidden" boxShadow="2xl" border="1px solid" borderColor="whiteAlpha.300">
                                <ModalHeader p={0}>
                                    <Box bgGradient="linear(to-r, teal.800, teal.600)" p={6} color="white">
                                        <HStack justify="space-between">
                                            <HStack spacing={4}>
                                                <Icon as={FaMapMarkerAlt} w={8} h={8} />
                                                <VStack align="start" spacing={0}>
                                                    <Heading size="md">{viewSite?.siteName}</Heading>
                                                    <Text fontSize="xs" opacity={0.8}>{viewSite?.client?.clientName} • Project Location</Text>
                                                </VStack>
                                            </HStack>
                                            <ModalCloseButton position="static" borderRadius="full" />
                                        </HStack>
                                    </Box>
                                </ModalHeader>
                                <ModalBody p={8}>
                                    {viewSite && (
                                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10}>
                                            <VStack align="start" spacing={6}>
                                                <Box w="full">
                                                    <Text fontSize="10px" fontWeight="black" color="teal.500" textTransform="uppercase" mb={3}>Site Information</Text>
                                                    <VStack align="start" spacing={4} p={4} bg="teal.50" borderRadius="2xl" w="full">
                                                        <Box>
                                                            <Text fontSize="9px" color="teal.600" fontWeight="bold">SITE ADDRESS</Text>
                                                            <Text fontSize="sm" color="gray.800">{viewSite.siteAddress}</Text>
                                                        </Box>
                                                        <Box>
                                                            <Text fontSize="9px" color="teal.600" fontWeight="bold">LOCATION LINK</Text>
                                                            {viewSite.siteLocation ? (
                                                                <Button
                                                                    as="a"
                                                                    target="_blank"
                                                                    href={viewSite.siteLocation.startsWith('http') ? viewSite.siteLocation : `https://www.google.com/maps?q=${viewSite.siteLocation}`}
                                                                    size="xs"
                                                                    colorScheme="blue"
                                                                    variant="link"
                                                                    leftIcon={<Icon as={FaMapMarkedAlt} />}
                                                                >
                                                                    View on Google Maps
                                                                </Button>
                                                            ) : 'N/A'}
                                                        </Box>
                                                    </VStack>
                                                </Box>
                                                <Box w="full">
                                                    <Text fontSize="10px" fontWeight="black" color="orange.500" textTransform="uppercase" mb={3}>Financials & Ledgers</Text>
                                                    <VStack align="stretch" spacing={3} p={4} bg="orange.50" borderRadius="2xl" w="full">
                                                        {viewSite.ledgerItems?.filter(li => li.ledger && li.amount).map((li, idx) => (
                                                            <HStack key={idx} justify="space-between" borderBottom="1px dashed" borderColor="orange.200" pb={1}>
                                                                <Text fontSize="xs" color="gray.700">{li.ledger}</Text>
                                                                <Text fontSize="xs" fontWeight="bold">₹{li.amount?.toLocaleString()}</Text>
                                                            </HStack>
                                                        ))}
                                                        <HStack justify="space-between" pt={1}>
                                                            <Text fontSize="xs" fontWeight="black">TOTAL BUDGET</Text>
                                                            <Text fontSize="sm" fontWeight="black" color="orange.700">
                                                                ₹{viewSite.ledgerItems?.filter(li => li.ledger && li.amount).reduce((sum, li) => sum + (li.amount || 0), 0).toLocaleString()}
                                                            </Text>
                                                        </HStack>
                                                        {(!viewSite.ledgerItems || viewSite.ledgerItems.filter(li => li.ledger && li.amount).length === 0) && <Text fontSize="xs" color="gray.500">No ledgers assigned</Text>}
                                                    </VStack>
                                                </Box>
                                            </VStack>

                                            <VStack align="start" spacing={6}>
                                                <Box w="full">
                                                    <Text fontSize="10px" fontWeight="black" color="purple.500" textTransform="uppercase" mb={3}>On-Site Contacts</Text>
                                                    <VStack align="stretch" spacing={2}>
                                                        {viewSite.contactPersons?.map((cp, i) => (
                                                            <HStack key={i} p={3} bg="purple.50" borderRadius="xl" justify="space-between">
                                                                <VStack align="start" spacing={0}>
                                                                    <Text fontSize="sm" fontWeight="bold">{cp.name}</Text>
                                                                    <Text fontSize="xs" color="gray.500">{cp.phone}</Text>
                                                                </VStack>
                                                                <IconButton as="a" href={`tel:${cp.phone}`} icon={<FaPhoneAlt />} size="sm" borderRadius="full" colorScheme="purple" variant="ghost" />
                                                            </HStack>
                                                        ))}
                                                    </VStack>
                                                </Box>
                                                <Box w="full">
                                                    <VStack align="stretch" spacing={4}>
                                                        <Box>
                                                            <Text fontSize="10px" fontWeight="black" color="pink.500" textTransform="uppercase" mb={2}>Site Photos</Text>
                                                            <Wrap spacing={2}>
                                                                {viewSite.documents?.filter(doc => doc.url.includes('/photos/')).map((doc, i) => (
                                                                    <Button key={i} as="a" target="_blank" href={`${API_BASE_URL}${doc.url}`} size="xs" colorScheme="pink" variant="subtle" leftIcon={<Icon as={FaCamera} />}>{doc.name}</Button>
                                                                ))}
                                                                {viewSite.documents?.filter(doc => doc.url.includes('/photos/')).length === 0 && <Text fontSize="xs" color="gray.400 italic">No photos uploaded</Text>}
                                                            </Wrap>
                                                        </Box>
                                                        <Box>
                                                            <Text fontSize="10px" fontWeight="black" color="blue.500" textTransform="uppercase" mb={2}>Daily Reports</Text>
                                                            <Wrap spacing={2}>
                                                                {viewSite.documents?.filter(doc => doc.url.includes('/Daily_report/')).map((doc, i) => (
                                                                    <Button key={i} as="a" target="_blank" href={`${API_BASE_URL}${doc.url}`} size="xs" colorScheme="blue" variant="subtle" leftIcon={<Icon as={FaFilePdf} />}>{doc.name}</Button>
                                                                ))}
                                                                {viewSite.documents?.filter(doc => doc.url.includes('/Daily_report/')).length === 0 && <Text fontSize="xs" color="gray.400 italic">No reports uploaded</Text>}
                                                            </Wrap>
                                                        </Box>
                                                        <Box>
                                                            <Text fontSize="10px" fontWeight="black" color="teal.500" textTransform="uppercase" mb={2}>Project Data</Text>
                                                            <Wrap spacing={2}>
                                                                {viewSite.documents?.filter(doc => doc.url.includes('/data/')).map((doc, i) => (
                                                                    <Button key={i} as="a" target="_blank" href={`${API_BASE_URL}${doc.url}`} size="xs" colorScheme="teal" variant="subtle" leftIcon={<Icon as={FaFileAlt} />}>{doc.name}</Button>
                                                                ))}
                                                                {viewSite.documents?.filter(doc => doc.url.includes('/data/')).length === 0 && <Text fontSize="xs" color="gray.400 italic">No data files uploaded</Text>}
                                                            </Wrap>
                                                        </Box>
                                                    </VStack>
                                                </Box>
                                            </VStack>
                                        </SimpleGrid>
                                    )}
                                </ModalBody>
                                <ModalFooter bg="gray.50">
                                    <Button colorScheme="teal" px={10} borderRadius="full" shadow="lg" onClick={() => setViewSite(null)}>Close</Button>
                                </ModalFooter>
                            </ModalContent>
                        </Modal>
                                </TabPanel>
                            </TabPanels>
                        </Tabs>
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
    const [vehicles, setVehicles] = useState([]);
    const [instrList, setInstrList] = useState([]);
    const [schedules, setSchedules] = useState([]);
    const [ledgers, setLedgers] = useState([]);
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
        client: '', site: '', scheduleDate: '', endDate: '', includeSundays: false, workForAppley: '',
        operative: '', helpers: [], vehicle: '', instruments: [],
        notes: '', dayStatus: 'Scheduled',
        ledger: '', amount: 0, scheduleType: '', quantity: 0
    });
    const [selectedSiteLedgers, setSelectedSiteLedgers] = useState([]);
    const { isOpen: isCompOpen, onOpen: onCompOpen, onClose: onCompClose } = useDisclosure();
    const { isOpen: isAssignOpen, onOpen: onAssignOpen, onClose: onAssignClose } = useDisclosure();
    const [assignTarget, setAssignTarget] = useState(null);
    const [compFiles, setCompFiles] = useState({ photos: [], dailyReports: [], data: [] });
    const [compTarget, setCompTarget] = useState(null);
    const [isCompLoading, setIsCompLoading] = useState(false);
    const [isAssignLoading, setIsAssignLoading] = useState(false);
    
    // Reject Modal state
    const { isOpen: isRejectOpen, onOpen: onRejectOpen, onClose: onRejectClose } = useDisclosure();
    const cancelRejectRef = React.useRef();
    const [rejectTargetId, setRejectTargetId] = useState(null);
    const [isRejectLoading, setIsRejectLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [cRes, eRes, vRes, iRes, lRes] = await Promise.all([
                    api.get('/client-master'),
                    api.get('/employee-master'),
                    api.get('/vehicle-master'),
                    api.get('/instrument-master'),
                    api.get('/site-master/ledgers')
                ]);
                if (cRes.data.success) setClients(cRes.data.data);
                if (eRes.data.success) setEmployees(eRes.data.data);
                if (vRes.data.success) setVehicles(vRes.data.data);
                if (iRes.data.success) setInstrList(iRes.data.data);
                if (lRes.data.success) setLedgers(lRes.data.data);
            } catch (err) { console.error(err); }
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (!formData.client) { 
            setSites([]); 
            setSelectedSiteName(''); 
            setSiteSearch('');
            return; 
        }
        const fetchSites = async () => {
            try {
                const res = await api.get(`/schedule-master/sites-by-client/${formData.client}`);
                if (res.data.success) {
                    setSites(res.data.data);
                } else {
                    setSites([]);
                }
            } catch (err) { 
                console.error('Fetch Sites Error:', err);
                setSites([]);
            }
        };
        fetchSites();
    }, [formData.client]);

    // Automatically sync selected site's ledgers whenever the site or sites list updates
    useEffect(() => {
        if (formData.site && sites.length > 0) {
            const currentSite = sites.find(s => s._id === formData.site);
            if (currentSite) {
                setSelectedSiteLedgers(currentSite.ledgerItems || []);
            }
        }
    }, [formData.site, sites]);

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
        setSiteSearch(''); // Important: Reset site search when client changes
        setShowClientList(false);
        setSelectedSiteName('');
    };

    const selectSite = (s) => {
        setFormData(prev => ({ ...prev, site: s._id, ledger: '', amount: 0 }));
        setSelectedSiteName(s.siteName);
        setSelectedSiteLedgers(s.ledgerItems || []);
        setSiteSearch('');
        setShowSiteList(false);
    };

    const handleHelperToggle = (empId) => {
        setFormData(prev => {
            const exists = prev.helpers.includes(empId);
            return { ...prev, helpers: exists ? prev.helpers.filter(h => h !== empId) : [...prev.helpers, empId] };
        });
    };
    
    const handleInstrumentToggle = (id) => {
        setFormData(prev => {
            const exists = (prev.instruments || []).includes(id);
            return { ...prev, instruments: exists ? prev.instruments.filter(i => i !== id) : [...(prev.instruments || []), id] };
        });
    };



    const handleEdit = (schedule) => {
        setEditId(schedule._id);
        setSelectedClientName(schedule.client?.clientName || '');
        setSelectedSiteName(schedule.site?.siteName || '');
        const loadedOperative = schedule.operative?._id || schedule.operative || '';

        setFormData({
            client: schedule.client?._id || '',
            site: schedule.site?._id || '',
            scheduleDate: schedule.scheduleDate ? new Date(schedule.scheduleDate).toISOString().split('T')[0] : '',
            workForAppley: schedule.workForAppley || '',
            operative: schedule.operative?._id || schedule.operative || '',
            helpers: schedule.helpers?.map(h => h._id || h) || [],
            vehicle: schedule.vehicle?._id || schedule.vehicle || '',
            instruments: schedule.instruments?.map(i => i._id || i) || [],
            notes: schedule.notes || '',
            dayStatus: schedule.dayStatus || 'Scheduled',
            ledger: schedule.ledger || '',
            amount: schedule.amount || 0,
            scheduleType: schedule.scheduleType || '',
            quantity: schedule.quantity || 0
        });
        if (schedule.site) setSelectedSiteLedgers(schedule.site.ledgerItems || []);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleComplete = async (files = {}) => {
        if (!compTarget) return;
        setIsCompLoading(true);
        try {
            const hasFiles = (files.photos?.length > 0) || (files.dailyReports?.length > 0) || (files.data?.length > 0);
            
            let res;
            if (hasFiles) {
                const formData = new FormData();
                const siteName = compTarget.site?.siteName || '';
                const siteSub = siteName.trim().replace(/[^a-z0-9]/gi, '_').toLowerCase();
                const cShort = compTarget.client?.clientId || 'unknown';

                formData.append('clientShortId', cShort);
                formData.append('siteSubfolder', siteSub);

                if (files.photos) files.photos.forEach(f => formData.append('photos', f));
                if (files.dailyReports) files.dailyReports.forEach(f => formData.append('dailyReports', f));
                if (files.data) files.data.forEach(f => formData.append('data', f));

                res = await api.post(`/schedule-master/complete/${compTarget._id}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                // Regular POST for simple completion
                res = await api.post(`/schedule-master/complete/${compTarget._id}`, {});
            }

            if (res.data.success) {
                toast({ title: 'Success', description: 'Site visit completed!', status: 'success' });
                onCompClose();
                const sRes = await api.get(`/schedule-master?date=${viewDate}`);
                if (sRes.data.success) setSchedules(sRes.data.data);
            }
        } catch (err) {
            console.error(err);
            toast({ title: 'Error', description: err.response?.data?.message || 'Completion failed', status: 'error' });
        } finally {
            setIsCompLoading(false);
        }
    };

    const handleRejectClick = (id) => {
        setRejectTargetId(id);
        onRejectOpen();
    };

    const handleRejectConfirm = async () => {
        if (!rejectTargetId) return;
        setIsRejectLoading(true);
        try {
            const res = await api.put(`/schedule-master/reject/${rejectTargetId}`);
            if (res.data.success) {
                toast({ title: 'Schedule Rejected', status: 'info' });
                onRejectClose();
                const sRes = await api.get(`/schedule-master?date=${viewDate}`);
                if (sRes.data.success) setSchedules(sRes.data.data);
            }
        } catch (error) {
            toast({ title: 'Reject Failed', description: error.response?.data?.message, status: 'error' });
        } finally {
            setIsRejectLoading(false);
        }
    };

    const handleClear = () => {
        setEditId(null);
        setSelectedClientName('');
        setSelectedSiteName('');
        setSelectedSiteLedgers([]);
        setFormData({
            client: '', site: '', scheduleDate: '', endDate: '', includeSundays: false, workForAppley: '',
            operative: '', helpers: [], vehicle: '', instruments: [],
            notes: '', dayStatus: 'Scheduled',
            ledger: '', amount: 0, scheduleType: '', quantity: 0
        });
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
                toast({
                    title: editId ? 'Updated!' : 'Scheduled!',
                    description: response.data.message,
                    status: 'success',
                    duration: 3000
                });
                handleClear();
                const res = await api.get(`/schedule-master?date=${viewDate}`);
                if (res.data.success) setSchedules(res.data.data);
            }
        } catch (error) {
            console.error('Scheduler Error:', error);
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Operation failed',
                status: 'error',
                duration: 3000
            });
        } finally {
            setIsLoading(false);
        }
    };

    const filteredClients = clients.filter(c => c.clientName.toLowerCase().includes(clientSearch.toLowerCase()));
    const filteredSites = sites.filter(s => s.siteName.toLowerCase().includes(siteSearch.toLowerCase()));
    const statusColors = { Scheduled: 'blue', Completed: 'green', Rejected: 'red' };

    return (
        <Box py={5} bg="gray.100" minH="100vh">
            <Container maxW="container.xl">
                <Tabs variant="soft-rounded" colorScheme="blue" isLazy>
                    <TabList mb={6} bg="white" p={2} borderRadius="2xl" boxShadow="sm" overflowX="auto">
                        <Tab _selected={{ color: 'white', bg: 'teal.600' }} px={6} borderRadius="xl" fontWeight="bold" whiteSpace="nowrap"><Icon as={FaCalendarAlt} mr={2} /> Schedule Site Visit Form</Tab>
                        <Tab _selected={{ color: 'white', bg: 'gray.800' }} px={6} borderRadius="xl" fontWeight="bold" whiteSpace="nowrap"><Icon as={FaListUl} mr={2} /> Scheduler View</Tab>
                        <Tab _selected={{ color: 'white', bg: 'blue.600' }} px={6} borderRadius="xl" fontWeight="bold" whiteSpace="nowrap"><Icon as={FaMapMarkedAlt} mr={2} /> Site Allocation Report</Tab>
                    </TabList>
                    <TabPanels>
                        {/* ── TAB 1: Form ── */}
                        <TabPanel p={0}>
                            <Card borderRadius="2xl" boxShadow="xl" bg="white" overflow="hidden">
                        <Box bg={editId ? 'purple.600' : 'teal.600'} px={7} py={5} color="white">
                            <HStack justify="space-between">
                                <HStack>
                                    <Icon as={editId ? FaEdit : FaCalendarAlt} w={5} h={5} />
                                    <Heading size="md">{editId ? 'Edit Schedule' : 'Schedule Site Visit'}</Heading>
                                </HStack>
                                {editId && <Button size="xs" colorScheme="whiteAlpha" onClick={handleClear}>New Schedule</Button>}
                            </HStack>
                        </Box>
                        <CardBody px={7} py={6}>
                            <form onSubmit={handleSubmit}>
                                <VStack spacing={6} align="stretch">
                                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
                                        {/* Client Select */}
                                        <FormControl isRequired>
                                            <FormLabel fontWeight="bold" fontSize="sm" color="gray.700">Client</FormLabel>
                                            {selectedClientName && !showClientList ? (
                                                <HStack bg="orange.50" border="1px solid" borderColor="orange.200" px={4} py={3} borderRadius="xl" justify="space-between">
                                                    <Text fontWeight="bold" color="orange.700">{selectedClientName}</Text>
                                                    <Button size="xs" variant="ghost" colorScheme="orange" onClick={() => setShowClientList(true)}>Change</Button>
                                                </HStack>
                                            ) : (
                                                <Box position="relative">
                                                    <Input placeholder="🔍 Search client..." value={clientSearch} onChange={e => setClientSearch(e.target.value)} onFocus={() => setShowClientList(true)} borderRadius="xl" bg="gray.50" />
                                                    {showClientList && (
                                                        <Box position="absolute" zIndex={10} w="100%" bg="white" border="1px solid" borderColor="gray.200" borderRadius="xl" boxShadow="lg" maxH="200px" overflowY="auto" mt={1}>
                                                            {filteredClients.map(c => (
                                                                <Box key={c._id} px={4} py={2} cursor="pointer" _hover={{ bg: 'orange.50' }} onClick={() => selectClient(c)}>
                                                                    <Text fontSize="sm" fontWeight="bold">{c.clientName}</Text>
                                                                </Box>
                                                            ))}
                                                        </Box>
                                                    )}
                                                </Box>
                                            )}
                                        </FormControl>

                                        {/* Site Select */}
                                        <FormControl isRequired>
                                            <FormLabel fontWeight="bold" fontSize="sm" color="gray.700">Site (Active Only)</FormLabel>
                                            {!formData.client ? (
                                                <Box bg="gray.50" border="1px dashed" borderColor="gray.300" px={4} py={3} borderRadius="xl">
                                                    <Text fontSize="sm" color="gray.400">Select a client first</Text>
                                                </Box>
                                            ) : selectedSiteName && !showSiteList ? (
                                                <HStack bg="teal.50" border="1px solid" borderColor="teal.200" px={4} py={3} borderRadius="xl" justify="space-between">
                                                    <Text fontWeight="bold" color="teal.700">{selectedSiteName}</Text>
                                                    <Button size="xs" variant="ghost" colorScheme="teal" onClick={() => setShowSiteList(true)}>Change</Button>
                                                </HStack>
                                            ) : (
                                                <Box position="relative">
                                                    <Input placeholder="🔍 Search site..." value={siteSearch} onChange={e => setSiteSearch(e.target.value)} onFocus={() => setShowSiteList(true)} borderRadius="xl" bg="gray.50" />
                                                    {showSiteList && (
                                                        <Box position="absolute" zIndex={10} w="100%" bg="white" border="1px solid" borderColor="gray.200" borderRadius="xl" boxShadow="lg" maxH="200px" overflowY="auto" mt={1}>
                                                            {filteredSites.length > 0 ? (
                                                                filteredSites.map(s => (
                                                                    <Box key={s._id} px={4} py={2} cursor="pointer" _hover={{ bg: 'teal.50' }} onClick={() => selectSite(s)}>
                                                                        <Text fontSize="sm" fontWeight="bold">{s.siteName}</Text>
                                                                        <Text fontSize="xs" color="gray.400">{s.siteAddress}</Text>
                                                                    </Box>
                                                                ))
                                                            ) : (
                                                                <Box px={4} py={4} textAlign="center">
                                                                    <Text fontSize="sm" color="gray.500">
                                                                        {sites.length === 0 ? "No active sites found for this client" : "No sites match your search"}
                                                                    </Text>
                                                                </Box>
                                                            )}
                                                        </Box>
                                                    )}
                                                </Box>
                                            )}
                                        </FormControl>
                                    </SimpleGrid>

                                    <SimpleGrid columns={{ base: 1, md: 4 }} spacing={6}>
                                        <FormControl isRequired>
                                            <FormLabel fontWeight="bold" fontSize="sm" color="gray.700">Date</FormLabel>
                                            <Input type="date" name="scheduleDate" value={formData.scheduleDate} onChange={handleChange} borderRadius="xl" bg="gray.50" />
                                        </FormControl>
                                        <FormControl isRequired>
                                            <FormLabel fontWeight="bold" fontSize="sm" color="gray.700">Scheduler Status</FormLabel>
                                            <Select name="dayStatus" value={formData.dayStatus} onChange={handleChange} borderRadius="xl" bg="gray.50">
                                                <option value="Scheduled">Scheduled</option>
                                                <option value="Completed">Completed</option>
                                            </Select>
                                        </FormControl>
                                        <FormControl>
                                            <FormLabel fontWeight="bold" fontSize="sm" color="gray.700">Schedule Type</FormLabel>
                                            <Select name="scheduleType" value={formData.scheduleType} onChange={handleChange} borderRadius="xl" bg="gray.50" placeholder="Select Type">
                                                <option value="VISIT">VISIT</option>
                                                <option value="MONTH">MONTH</option>
                                                <option value="TOPOGRAPHY SURVEY">TOPOGRAPHY SURVEY</option>
                                                <option value="POINT MARKING">POINT MARKING</option>
                                            </Select>
                                        </FormControl>
                                        {formData.scheduleType === 'MONTH' && (
                                            <FormControl isRequired>
                                                <FormLabel fontWeight="bold" fontSize="sm" color="gray.700">End Date</FormLabel>
                                                <Input type="date" name="endDate" value={formData.endDate} onChange={handleChange} borderRadius="xl" bg="gray.50" />
                                            </FormControl>
                                        )}
                                        <FormControl>
                                            <FormLabel fontWeight="bold" fontSize="sm" color="gray.700">Site Ledger</FormLabel>
                                            <Select
                                                name="ledger"
                                                value={formData.ledger}
                                                onChange={(e) => {
                                                    const selected = selectedSiteLedgers.find(l => l.ledger === e.target.value);
                                                    setFormData(prev => ({ ...prev, ledger: e.target.value, amount: selected ? selected.amount : 0 }));
                                                }}
                                                borderRadius="xl"
                                                bg="gray.50"
                                                placeholder="Select Ledger"
                                            >
                                                {ledgers.map((l, i) => (
                                                    <option key={i} value={l}>{l}</option>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </SimpleGrid>

                                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                                        <FormControl>
                                            <FormLabel fontWeight="bold" fontSize="sm" color="gray.700">Contact / Apply Details</FormLabel>
                                            <Input name="workForAppley" placeholder="e.g. John Doe / Project Manager" value={formData.workForAppley} onChange={handleChange} borderRadius="xl" bg="gray.50" />
                                        </FormControl>
                                        <FormControl>
                                            <FormLabel fontWeight="bold" fontSize="sm" color="gray.700">Notes</FormLabel>
                                            <Input name="notes" placeholder="Optional notes..." value={formData.notes} onChange={handleChange} borderRadius="xl" bg="gray.50" />
                                        </FormControl>
                                    </SimpleGrid>

                                    <Button type="submit" colorScheme={editId ? 'purple' : 'teal'} h="56px" borderRadius="xl" leftIcon={<Icon as={FaCheckCircle} />} isLoading={isLoading} isDisabled={formData.dayStatus === 'Completed' && !editId}>
                                        {editId ? 'Update Schedule' : 'Confirm Schedule'}
                                    </Button>
                                </VStack>
                            </form>
                        </CardBody>
                    </Card>
                </TabPanel>

                {/* ── TAB 2: Schedule Viewer ── */}
                <TabPanel p={0}>
                    <Card borderRadius="2xl" boxShadow="xl" bg="white" overflow="hidden">
                        <Box bg="gray.800" px={7} py={5} color="white">
                            <HStack justify="space-between">
                                <HStack>
                                    <Icon as={FaListUl} w={5} h={5} />
                                    <Heading size="md">Scheduler Dashboard</Heading>
                                </HStack>
                                <Input type="date" value={viewDate} onChange={e => setViewDate(e.target.value)} borderRadius="full" bg="whiteAlpha.200" border="none" size="sm" w="150px" color="white" />
                            </HStack>
                        </Box>

                        <CardBody p={6}>
                            {schedules.length === 0 ? (
                                <Box textAlign="center" py={10}>
                                    <Text color="gray.400">No schedules found for {viewDate}</Text>
                                </Box>
                            ) : (
                                <TableContainer whiteSpace="normal" overflow="hidden" w="full">
                                    <Table variant="simple" size="sm" sx={{ 'td, th': { whiteSpace: 'normal', wordBreak: 'break-word' } }}>
                                        <Thead bg="gray.50">
                                            <Tr>
                                                <Th py={4} color="gray.500" fontSize="10px" whiteSpace="nowrap">DATE</Th>
                                                <Th py={4} color="gray.500" fontSize="10px">CLIENT & SITE</Th>
                                                <Th py={4} color="gray.500" fontSize="10px">OPERATIVE</Th>
                                                <Th py={4} color="gray.500" fontSize="10px">HELPER</Th>
                                                <Th py={4} color="gray.500" fontSize="10px">VEHICLE</Th>
                                                <Th py={4} color="gray.500" fontSize="10px">INSTRUMENT</Th>
                                                <Th py={4} color="gray.500" fontSize="10px">TYPE</Th>
                                                <Th py={4} color="gray.500" fontSize="10px">STATUS</Th>
                                                <Th py={4} color="gray.500" fontSize="10px">ACTIONS</Th>
                                            </Tr>
                                        </Thead>
                                        <Tbody>
                                            {schedules.map((s) => (
                                                <Tr 
                                                    key={s._id} 
                                                    _hover={{ bg: 'blue.50', transition: 'background 0.2s' }} 
                                                    cursor="pointer" 
                                                    onClick={() => { setAssignTarget(s); onAssignOpen(); }}
                                                >
                                                    <Td py={3} whiteSpace="nowrap">
                                                        <Text fontSize="sm" fontWeight="bold" color="gray.700">
                                                            {new Date(s.scheduleDate).toLocaleDateString('en-GB')}
                                                        </Text>
                                                    </Td>
                                                    <Td py={3}>
                                                        <VStack align="start" spacing={0}>
                                                            <Text fontWeight="bold" fontSize="sm" color="gray.800">{s.site?.siteName}</Text>
                                                            <Text fontSize="xs" color="gray.500">{s.client?.clientName}</Text>
                                                            {s.workForAppley && <Text fontSize="xs" color="purple.600" mt={1}>Work For Apply: {s.workForAppley}</Text>}
                                                        </VStack>
                                                    </Td>
                                                    <Td py={3}>
                                                        <Text fontSize="sm" fontWeight="bold">
                                                            {s.operative?.name || <Text as="span" color="red.400">Unassigned</Text>}
                                                        </Text>
                                                    </Td>
                                                    <Td py={3} maxW="150px">
                                                        {s.helpers?.length > 0 ? (
                                                            <VStack align="start" spacing={1}>
                                                                {s.helpers.map((h, idx) => (
                                                                    <Text key={idx} fontSize="xs" color="teal.600" fontWeight="bold">
                                                                        {h.name}
                                                                    </Text>
                                                                ))}
                                                            </VStack>
                                                        ) : (
                                                            <Text fontSize="xs" color="gray.400">--</Text>
                                                        )}
                                                    </Td>
                                                    <Td py={3} maxW="150px">
                                                        {s.vehicle ? (
                                                            <Text fontSize="xs" color="orange.600" fontWeight="bold">
                                                                {s.vehicle.vehicleName} ({s.vehicle.vehicleNumber})
                                                            </Text>
                                                        ) : (
                                                            <Text fontSize="xs" color="gray.400">--</Text>
                                                        )}
                                                    </Td>
                                                    <Td py={3} maxW="150px">
                                                        {s.instruments?.length > 0 ? (
                                                            <VStack align="start" spacing={1}>
                                                                {s.instruments.map((i, idx) => (
                                                                    <Text key={idx} fontSize="xs" color="purple.600" fontWeight="bold">
                                                                        {i.instrumentName} ({i.serialNo})
                                                                    </Text>
                                                                ))}
                                                            </VStack>
                                                        ) : (
                                                            <Text fontSize="xs" color="gray.400">--</Text>
                                                        )}
                                                    </Td>
                                                    <Td py={3}>
                                                        <VStack align="start" spacing={1}>
                                                            {s.scheduleType && <Badge colorScheme="purple" fontSize="9px">{s.scheduleType}</Badge>}
                                                            {s.scheduleType === 'MONTH' && s.monthGroupId && (
                                                                <Badge colorScheme="blue" fontSize="8px">Grp ID: {s.monthGroupId}</Badge>
                                                            )}
                                                        </VStack>
                                                    </Td>
                                                    <Td py={3}>
                                                        <Badge colorScheme={statusColors[s.dayStatus]} variant="solid">{s.dayStatus}</Badge>
                                                    </Td>
                                                    <Td py={3} onClick={(e) => e.stopPropagation()}>
                                                        <HStack spacing={2}>
                                                            {s.dayStatus === 'Scheduled' && (
                                                                <Button size="xs" colorScheme="red" leftIcon={<Icon as={FaTimes} />} onClick={() => handleRejectClick(s._id)}>Reject</Button>
                                                            )}
                                                        </HStack>
                                                    </Td>
                                                </Tr>
                                            ))}
                                        </Tbody>
                                    </Table>
                                </TableContainer>
                            )}
                        </CardBody>
                    </Card>
                </TabPanel>

                {/* ── TAB 3: Site Allocation Report ── */}
                <TabPanel p={0}>
                    <AdminSiteAllocation />
                </TabPanel>
            </TabPanels>
        </Tabs>
    </Container>

            <ResourceAssignmentModal
                isOpen={isAssignOpen}
                onClose={onAssignClose}
                schedule={assignTarget}
                employees={employees}
                vehicles={vehicles}
                instruments={instrList}
                onUpdate={async (payload) => {
                    setIsAssignLoading(true);
                    try {
                        const res = await api.put(`/schedule-master/${assignTarget._id}`, payload);
                        if (res.data.success) {
                            toast({ title: 'Resources Updated', status: 'success' });
                            onAssignClose();
                            const sRes = await api.get(`/schedule-master?date=${viewDate}`);
                            if (sRes.data.success) setSchedules(sRes.data.data);
                        }
                    } catch (err) {
                        toast({ title: 'Update Failed', description: err.response?.data?.message, status: 'error' });
                    } finally {
                        setIsAssignLoading(false);
                    }
                }}
                onDeleteSchedule={async () => {
                    setIsAssignLoading(true);
                    try {
                        const res = await api.delete(`/schedule-master/${assignTarget._id}`);
                        if (res.data.success) {
                            toast({ title: 'Schedule Cancelled for Today', status: 'success' });
                            onAssignClose();
                            const sRes = await api.get(`/schedule-master?date=${viewDate}`);
                            if (sRes.data.success) setSchedules(sRes.data.data);
                        }
                    } catch (err) {
                        toast({ title: 'Cancellation Failed', description: err.response?.data?.message, status: 'error' });
                    } finally {
                        setIsAssignLoading(false);
                    }
                }}
                isLoading={isAssignLoading}
                onPauseMonth={async (target) => {
                    try {
                        const res = await api.delete(`/schedule-master/pause-month/${target.client?._id || target.client}/${target.site?._id || target.site}/${target.monthGroupId}`);
                        if (res.data.success) {
                            toast({ title: 'Month Paused', description: res.data.message, status: 'success' });
                            onAssignClose();
                            const sRes = await api.get(`/schedule-master?date=${viewDate}`);
                            if (sRes.data.success) setSchedules(sRes.data.data);
                        }
                    } catch (err) {
                        toast({ title: 'Pause Failed', description: err.response?.data?.message || err.message, status: 'error' });
                    }
                }}
                onResumeMonth={async (target, newEndDate, includeSundays) => {
                    if (!newEndDate) return;
                    try {
                        const res = await api.post(`/schedule-master/resume-month`, {
                            client: target.client?._id || target.client,
                            site: target.site?._id || target.site,
                            endDate: newEndDate,
                            includeSundays: includeSundays,
                            workForAppley: target.workForAppley,
                            monthGroupId: target.monthGroupId,
                            operative: target.operative?._id || target.operative,
                            ledger: target.ledger,
                            amount: target.amount
                        });
                        if (res.data.success) {
                            toast({ title: 'Month Resumed', description: res.data.message, status: 'success' });
                            onAssignClose();
                            const sRes = await api.get(`/schedule-master?date=${viewDate}`);
                            if (sRes.data.success) setSchedules(sRes.data.data);
                        }
                    } catch (err) {
                        toast({ title: 'Resume Failed', description: err.response?.data?.message || err.message, status: 'error' });
                    }
                }}
                onCompleteMonth={async (target) => {
                    try {
                        const res = await api.put(`/schedule-master/end-month/${target.client?._id || target.client}/${target.site?._id || target.site}/${target.monthGroupId}`);
                        if (res.data.success) {
                            toast({ title: 'Contract Completed', description: res.data.message, status: 'success' });
                            onAssignClose();
                            const sRes = await api.get(`/schedule-master?date=${viewDate}`);
                            if (sRes.data.success) setSchedules(sRes.data.data);
                        }
                    } catch (err) {
                        toast({ title: 'Completion Failed', description: err.response?.data?.message || err.message, status: 'error' });
                    }
                }}
            />

            <CompletionModal
                isOpen={isCompOpen}
                onClose={onCompClose}
                schedule={compTarget}
                onComplete={handleComplete}
                isLoading={isCompLoading}
            />

            {/* Reject Confirmation AlertDialog */}
            <AlertDialog isOpen={isRejectOpen} leastDestructiveRef={cancelRejectRef} onClose={onRejectClose} isCentered>
                <AlertDialogOverlay backdropFilter="blur(5px)" bg="blackAlpha.600">
                    <AlertDialogContent borderRadius="2xl">
                        <AlertDialogHeader fontSize="lg" fontWeight="black" color="red.600">
                            Reject Schedule
                        </AlertDialogHeader>
                        <AlertDialogBody color="gray.600">
                            Are you sure you want to reject this schedule? This will mark the visit as rejected and cancel it from the active pipeline.
                        </AlertDialogBody>
                        <AlertDialogFooter>
                            <Button ref={cancelRejectRef} onClick={onRejectClose} borderRadius="full" variant="ghost">
                                Cancel
                            </Button>
                            <Button colorScheme="red" onClick={handleRejectConfirm} ml={3} isLoading={isRejectLoading} borderRadius="full" shadow="md">
                                Reject Schedule
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
        </Box>
    );
};

const ResourceAssignmentModal = ({ isOpen, onClose, schedule, employees, vehicles, instruments, onUpdate, isLoading, onPauseMonth, onResumeMonth, onCompleteMonth, onDeleteSchedule }) => {
    const [formData, setFormData] = useState({
        operative: '',
        helpers: [],
        vehicle: '',
        instruments: [],
        scheduleType: '',
        endDate: ''
    });
    const [requiredToday, setRequiredToday] = useState(true);
    const [showResumeInput, setShowResumeInput] = useState(false);
    const [resumeDate, setResumeDate] = useState('');
    const [resumeIncludeSundays, setResumeIncludeSundays] = useState(false);
    const { isOpen: isPauseOpen, onOpen: onPauseOpen, onClose: onPauseClose } = useDisclosure();
    const { isOpen: isCompleteOpen, onOpen: onCompleteOpen, onClose: onCompleteClose } = useDisclosure();
    const [completeText, setCompleteText] = useState('');
    const cancelPauseRef = React.useRef();
    const cancelCompleteRef = React.useRef();

    useEffect(() => {
        if (!isOpen) {
            setShowResumeInput(false);
            setResumeDate('');
            setResumeIncludeSundays(false);
            setCompleteText('');
        }
    }, [isOpen]);

    useEffect(() => {
        if (schedule) {
            setFormData({
                operative: schedule.operative?._id || schedule.operative || '',
                helpers: schedule.helpers?.map(h => h._id || h) || [],
                vehicle: schedule.vehicle?._id || schedule.vehicle || '',
                instruments: schedule.instruments?.map(i => i._id || i) || [],
                scheduleType: schedule.scheduleType || '',
                endDate: schedule.endDate ? new Date(schedule.endDate).toISOString().split('T')[0] : ''
            });
            setRequiredToday(schedule.dayStatus !== 'Rejected');
        }
    }, [schedule, isOpen]);

    const handleHelperToggle = (id) => {
        setFormData(prev => ({
            ...prev,
            helpers: prev.helpers.includes(id) ? prev.helpers.filter(h => h !== id) : [...prev.helpers, id]
        }));
    };

    const handleInstrumentToggle = (id) => {
        setFormData(prev => ({
            ...prev,
            instruments: prev.instruments.includes(id) ? prev.instruments.filter(i => i !== id) : [...prev.instruments, id]
        }));
    };

    const isCompleted = schedule?.dayStatus === 'Completed';
    const isPaused = schedule?.dayStatus === 'Paused';
    const isMonthType = schedule?.scheduleType === 'MONTH';

    return (
        <>
        <Modal isOpen={isOpen} onClose={onClose} size="xl">
            <ModalOverlay backdropFilter="blur(12px)" bg="blackAlpha.700" />
            <ModalContent borderRadius="3xl" overflow="hidden" boxShadow="2xl" border="1px solid" borderColor="whiteAlpha.300">
                <ModalHeader bgGradient={isCompleted ? "linear(to-r, gray.700, gray.500)" : "linear(to-r, blue.700, blue.500)"} color="white" py={5}>
                    <HStack spacing={4}>
                        <Box p={2} bg="whiteAlpha.300" borderRadius="xl">
                            <Icon as={FaUsers} w={6} h={6} />
                        </Box>
                        <VStack align="start" spacing={0}>
                            <Text fontSize="lg" fontWeight="black">{isCompleted ? 'View Assigned Resources' : 'Assign Resources'}</Text>
                            <Text fontSize="xs" fontWeight="medium" opacity={0.9}>
                                {schedule?.client?.clientName} • {schedule?.site?.siteName}
                            </Text>
                        </VStack>
                    </HStack>
                </ModalHeader>
                <ModalCloseButton color="white" borderRadius="full" mt={2} />
                <ModalBody p={8} bg="gray.50">
                    <VStack spacing={8} align="stretch">
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                            <FormControl isDisabled={isCompleted}>
                                <FormLabel fontWeight="black" fontSize="xs" color="blue.600" textTransform="uppercase" mb={3} letterSpacing="wider">
                                    <Icon as={FaListUl} mr={2} color="purple.500" /> Schedule Type
                                </FormLabel>
                                <Select 
                                    value={formData.scheduleType} 
                                    onChange={(e) => setFormData(prev => ({ ...prev, scheduleType: e.target.value }))}
                                    borderRadius="2xl" 
                                    bg="white" 
                                    border="2px solid"
                                    borderColor="gray.100"
                                    _focus={{ borderColor: 'purple.400', boxShadow: 'none' }}
                                    fontWeight="bold"
                                    h="50px"
                                    placeholder="Select Schedule Type"
                                >
                                    <option value="VISIT">VISIT</option>
                                    <option value="MONTH">MONTH</option>
                                    <option value="TOPOGRAPHY SURVEY">TOPOGRAPHY SURVEY</option>
                                    <option value="POINT MARKING">POINT MARKING</option>
                                </Select>
                            </FormControl>


                            <FormControl isDisabled={isCompleted}>
                                <FormLabel fontWeight="black" fontSize="xs" color="blue.600" textTransform="uppercase" mb={3} letterSpacing="wider">
                                    <Icon as={FaStar} mr={2} color="yellow.500" /> Main Operative
                                </FormLabel>
                                <Select 
                                    value={formData.operative} 
                                    onChange={(e) => {
                                        const newOp = e.target.value;
                                        setFormData(prev => ({ 
                                            ...prev, 
                                            operative: newOp,
                                            helpers: prev.helpers.filter(h => h !== newOp)
                                        }));
                                    }}
                                    borderRadius="2xl" 
                                    bg="white" 
                                    border="2px solid"
                                    borderColor="gray.100"
                                    _focus={{ borderColor: 'blue.400', boxShadow: 'none' }}
                                    placeholder="Select Primary Operative"
                                    fontWeight="bold"
                                    h="50px"
                                >
                                    {employees.filter(e => e.status !== 'Deactive' || e._id === formData.operative).map(e => (
                                        <option key={e._id} value={e._id}>{e.name}</option>
                                    ))}
                                </Select>
                            </FormControl>
                        </SimpleGrid>

                        {formData.scheduleType === 'MONTH' && (
                            <FormControl isDisabled={isCompleted} isRequired>
                                <FormLabel fontWeight="black" fontSize="xs" color="blue.600" textTransform="uppercase" mb={3} letterSpacing="wider">
                                    <Icon as={FaCalendarAlt} mr={2} color="red.500" /> Contract End Date
                                </FormLabel>
                                <Input 
                                    type="date"
                                    value={formData.endDate} 
                                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                                    borderRadius="2xl" 
                                    bg="white" 
                                    border="2px solid"
                                    borderColor="gray.100"
                                    _focus={{ borderColor: 'red.400', boxShadow: 'none' }}
                                    fontWeight="bold"
                                    h="50px"
                                />
                            </FormControl>
                        )}

                        <FormControl isDisabled={isCompleted}>
                            <FormLabel fontWeight="black" fontSize="xs" color="blue.600" textTransform="uppercase" mb={3} letterSpacing="wider">
                                <Icon as={FaUsers} mr={2} /> Helpers ({formData.helpers.length})
                            </FormLabel>
                            <Box maxH="180px" overflowY="auto" border="2px solid" borderColor="gray.100" borderRadius="2xl" p={4} bg="white">
                                <SimpleGrid columns={2} spacing={3}>
                                    {employees.filter(e => (e.status !== 'Deactive' || formData.helpers.includes(e._id)) && e._id !== formData.operative).map(e => {
                                        const isSelected = formData.helpers.includes(e._id);
                                        return (
                                            <HStack 
                                                key={e._id} 
                                                py={2} 
                                                px={3} 
                                                cursor="pointer" 
                                                borderRadius="xl" 
                                                bg={isSelected ? 'blue.50' : 'gray.50'}
                                                border="1px solid"
                                                borderColor={isSelected ? 'blue.200' : 'transparent'}
                                                _hover={isCompleted ? {} : { bg: isSelected ? 'blue.100' : 'blue.50', borderColor: 'blue.200' }} 
                                                onClick={() => !isCompleted && handleHelperToggle(e._id)}
                                                transition="all 0.2s"
                                            >
                                                <Checkbox 
                                                    isChecked={isSelected} 
                                                    colorScheme="blue" 
                                                    size="md" 
                                                    pointerEvents="none"
                                                    borderColor="gray.300" 
                                                />
                                                <Text fontSize="xs" fontWeight="bold" color={isSelected ? 'blue.800' : 'gray.700'}>{e.name}</Text>
                                            </HStack>
                                        );
                                    })}
                                </SimpleGrid>
                            </Box>
                        </FormControl>

                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                            <FormControl isDisabled={isCompleted}>
                                <FormLabel fontWeight="black" fontSize="xs" color="blue.600" textTransform="uppercase" mb={3} letterSpacing="wider">
                                    <Icon as={FaCar} mr={2} color="red.500" /> Assigned Vehicle
                                </FormLabel>
                                <Select 
                                    value={formData.vehicle} 
                                    onChange={(e) => setFormData(prev => ({ ...prev, vehicle: e.target.value }))}
                                    borderRadius="2xl" 
                                    bg="white" 
                                    border="2px solid"
                                    borderColor="gray.100"
                                    _focus={{ borderColor: 'blue.400', boxShadow: 'none' }}
                                    placeholder="Select Vehicle"
                                    fontWeight="bold"
                                    h="50px"
                                >
                                    {vehicles.map(v => <option key={v._id} value={v._id}>{v.vehicleNumber} - {v.vehicleName}</option>)}
                                </Select>
                            </FormControl>

                            <FormControl isDisabled={isCompleted}>
                                <FormLabel fontWeight="black" fontSize="xs" color="blue.600" textTransform="uppercase" mb={3} letterSpacing="wider">
                                    <Icon as={FaWrench} mr={2} color="orange.500" /> Instruments ({formData.instruments.length})
                                </FormLabel>
                                <Box maxH="180px" overflowY="auto" border="2px solid" borderColor="gray.100" borderRadius="2xl" p={4} bg="white">
                                    <VStack spacing={2} align="stretch">
                                        {instruments.map(inst => {
                                            const isSelected = formData.instruments.includes(inst._id);
                                            return (
                                                <HStack 
                                                    key={inst._id} 
                                                    py={2} 
                                                    px={3} 
                                                    cursor="pointer" 
                                                    borderRadius="xl" 
                                                    bg={isSelected ? 'orange.50' : 'gray.50'}
                                                    border="1px solid"
                                                    borderColor={isSelected ? 'orange.200' : 'transparent'}
                                                    _hover={isCompleted ? {} : { bg: isSelected ? 'orange.100' : 'orange.50', borderColor: 'orange.200' }} 
                                                    onClick={() => !isCompleted && handleInstrumentToggle(inst._id)}
                                                    transition="all 0.2s"
                                                >
                                                    <Checkbox 
                                                        isChecked={isSelected} 
                                                        colorScheme="orange" 
                                                        size="md" 
                                                        pointerEvents="none"
                                                        borderColor="gray.300" 
                                                    />
                                                    <VStack align="start" spacing={0}>
                                                        <Text fontSize="xs" fontWeight="bold" color={isSelected ? 'orange.800' : 'gray.700'}>
                                                            {inst.serialNo}
                                                        </Text>
                                                        <Text fontSize="10px" color="gray.500" fontWeight="bold">
                                                            {inst.instrumentName} ({inst.model || 'N/A'})
                                                        </Text>
                                                    </VStack>
                                                </HStack>
                                            );
                                        })}
                                    </VStack>
                                </Box>
                            </FormControl>
                        </SimpleGrid>
                        {isMonthType && !isCompleted && !isPaused && (
                            <Box bg="orange.50" p={4} borderRadius="xl" border="1px solid" borderColor="orange.200">
                                <Checkbox 
                                    colorScheme="orange" 
                                    size="md"
                                    isChecked={requiredToday}
                                    onChange={(e) => setRequiredToday(e.target.checked)}
                                >
                                    <Text fontWeight="bold" fontSize="sm" color="orange.800">
                                        Is this schedule required today?
                                    </Text>
                                    <Text fontSize="xs" color="orange.600">
                                        If unchecked, today's schedule is cancelled, but future days will still generate automatically.
                                    </Text>
                                </Checkbox>
                            </Box>
                        )}
                    </VStack>
                </ModalBody>
                <ModalFooter bg="white" py={4} borderTop="1px solid" borderColor="gray.100">
                    <Flex w="full" justify="space-between" align="center" wrap="wrap" gap={3}>
                        <Button variant="ghost" onClick={onClose} borderRadius="full" px={6}>Close</Button>
                        
                        <HStack spacing={3} flexWrap="wrap" justify="flex-end" flex={1}>
                            {!isCompleted && schedule?.scheduleType === 'MONTH' && !isPaused && (
                                <>
                                    <Button 
                                        colorScheme="green" 
                                        variant="outline" 
                                        borderRadius="full" 
                                        px={5}
                                        h="40px"
                                        onClick={onCompleteOpen}
                                    >
                                        Complete Contract
                                    </Button>
                                    <Button 
                                        colorScheme="red" 
                                        variant="outline" 
                                        borderRadius="full" 
                                        px={5}
                                        h="40px"
                                        onClick={onPauseOpen}
                                        isLoading={isLoading}
                                    >
                                        Pause
                                    </Button>
                                </>
                            )}
                            {!isCompleted && schedule?.scheduleType === 'MONTH' && isPaused && (
                                showResumeInput ? (
                                    <HStack bg="gray.50" p={2} borderRadius="xl" border="1px solid" borderColor="gray.200" flexWrap="wrap">
                                        <Input type="date" size="sm" value={resumeDate} onChange={e => setResumeDate(e.target.value)} borderRadius="md" bg="white" w="auto" />
                                        <Checkbox size="sm" colorScheme="green" isChecked={resumeIncludeSundays} onChange={e => setResumeIncludeSundays(e.target.checked)}>
                                            <Text fontSize="xs" fontWeight="bold">Include Sundays?</Text>
                                        </Checkbox>
                                        <Button colorScheme="green" size="sm" borderRadius="md" px={4} onClick={() => { onResumeMonth(schedule, resumeDate, resumeIncludeSundays); setShowResumeInput(false); }}>Confirm</Button>
                                        <Button size="sm" borderRadius="md" variant="ghost" onClick={() => setShowResumeInput(false)}>Cancel</Button>
                                    </HStack>
                                ) : (
                                    <Button 
                                        colorScheme="green" 
                                        variant="outline" 
                                        borderRadius="full" 
                                        px={5}
                                        h="40px"
                                        onClick={() => setShowResumeInput(true)}
                                        isLoading={isLoading}
                                    >
                                        Resume
                                    </Button>
                                )
                            )}
                            {!isCompleted && !isPaused && (
                                <Button 
                                    bgGradient="linear(to-r, blue.600, blue.400)" 
                                    color="white" 
                                    _hover={{ bgGradient: 'linear(to-r, blue.700, blue.500)', transform: 'translateY(-1px)', shadow: 'xl' }}
                                    _active={{ transform: 'translateY(0)' }}
                                    isLoading={isLoading} 
                                    onClick={() => {
                                        const payload = {
                                            ...formData,
                                            dayStatus: (schedule.dayStatus === 'Rejected' && formData.operative) ? 'Scheduled' : schedule.dayStatus,
                                            skipToday: !requiredToday
                                        };
                                        onUpdate(payload);
                                    }} 
                                    px={8} 
                                    h="40px"
                                    borderRadius="full"
                                    shadow="lg"
                                    transition="all 0.2s"
                                >
                                    Update
                                </Button>
                            )}
                        </HStack>
                    </Flex>
                </ModalFooter>
            </ModalContent>
        </Modal>

        <AlertDialog isOpen={isPauseOpen} leastDestructiveRef={cancelPauseRef} onClose={onPauseClose} isCentered>
            <AlertDialogOverlay backdropFilter="blur(5px)" bg="blackAlpha.600">
                <AlertDialogContent borderRadius="2xl">
                    <AlertDialogHeader fontSize="lg" fontWeight="black" color="red.600">
                        Pause Month Schedule
                    </AlertDialogHeader>
                    <AlertDialogBody color="gray.600">
                        Are you sure you want to pause this month schedule? All future uncompleted daily schedules for this site will be paused.
                    </AlertDialogBody>
                    <AlertDialogFooter>
                        <Button ref={cancelPauseRef} onClick={onPauseClose} borderRadius="full" variant="ghost">
                            Cancel
                        </Button>
                        <Button colorScheme="red" onClick={() => { onPauseMonth(schedule); onPauseClose(); }} ml={3} isLoading={isLoading} borderRadius="full" shadow="md">
                            Confirm Pause
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialogOverlay>
        </AlertDialog>

        <AlertDialog isOpen={isCompleteOpen} leastDestructiveRef={cancelCompleteRef} onClose={onCompleteClose} isCentered>
            <AlertDialogOverlay backdropFilter="blur(5px)" bg="blackAlpha.600">
                <AlertDialogContent borderRadius="2xl">
                    <AlertDialogHeader fontSize="lg" fontWeight="black" color="green.600">
                        Complete Month Contract
                    </AlertDialogHeader>
                    <AlertDialogBody color="gray.600">
                        <Text mb={4}>
                            Are you absolutely sure you want to <strong>COMPLETE</strong> this contract? This will permanently end the automatic generation of future schedules for this contract.
                        </Text>
                        <Text mb={2} fontSize="sm" fontWeight="bold">Type "COMPLETE" to confirm:</Text>
                        <Input 
                            value={completeText} 
                            onChange={(e) => setCompleteText(e.target.value)} 
                            placeholder="COMPLETE"
                            autoFocus
                            borderRadius="lg"
                        />
                    </AlertDialogBody>
                    <AlertDialogFooter>
                        <Button ref={cancelCompleteRef} onClick={onCompleteClose} borderRadius="full" variant="ghost">Cancel</Button>
                        <Button 
                            colorScheme="green" 
                            isDisabled={completeText !== 'COMPLETE'}
                            onClick={() => { onCompleteMonth(schedule); onCompleteClose(); }} 
                            ml={3} 
                            borderRadius="full" 
                            px={6}
                            shadow="md"
                        >
                            Complete Contract
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialogOverlay>
        </AlertDialog>
        </>
    );
};

const CompletionModal = ({ isOpen, onClose, schedule, onComplete, isLoading }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} size="md">
            <ModalOverlay backdropFilter="blur(10px)" bg="blackAlpha.700" />
            <ModalContent borderRadius="3xl" overflow="hidden">
                <ModalHeader bg="green.600" color="white" py={5}>
                    <HStack>
                        <Icon as={FaCheckCircle} />
                        <Text fontSize="lg">Mark Completion</Text>
                    </HStack>
                </ModalHeader>
                <ModalCloseButton color="white" mt={1} />
                <ModalBody p={8} textAlign="center">
                    <VStack spacing={4}>
                        <Box bg="green.50" p={5} borderRadius="2xl" w="full" border="1px solid" borderColor="green.100">
                            <Text fontSize="xs" color="green.600" fontWeight="black" textTransform="uppercase" mb={1}>Current Site Visit</Text>
                            <Text fontWeight="black" fontSize="lg" color="gray.800">{schedule?.client?.clientName}</Text>
                            <Text fontSize="md" fontWeight="bold" color="green.700">{schedule?.site?.siteName}</Text>
                        </Box>
                        <Text fontSize="sm" color="gray.500">Are you sure you want to mark this visit as completed?</Text>
                    </VStack>
                </ModalBody>
                <ModalFooter bg="gray.50" p={6}>
                    <Button variant="ghost" mr={3} onClick={onClose} borderRadius="full">Cancel</Button>
                    <Button
                        colorScheme="green"
                        onClick={() => onComplete({})}
                        isLoading={isLoading}
                        borderRadius="full"
                        px={8}
                        leftIcon={<Icon as={FaCheckCircle} />}
                        shadow="lg"
                    >
                        Mark Completed
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

const InstrumentMasterForm = () => {
    const toast = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [instruments, setInstruments] = useState([]);
    const [editId, setEditId] = useState(null);
    const [photoFiles, setPhotoFiles] = useState([]);
    const [photoPreviews, setPhotoPreviews] = useState([]);
    const { isOpen: isConfirmOpen, onOpen: onConfirmOpen, onClose: onConfirmClose } = useDisclosure();
    const cancelRef = React.useRef();
    const [activeTab, setActiveTab] = useState(0);

    const [formData, setFormData] = useState({ model: '', serialNo: '', instrumentName: '', notes: '' });

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
        const files = Array.from(e.target.files);
        if (!files.length) return;
        setPhotoFiles(prev => [...prev, ...files]);

        const newPreviews = files.map(file => URL.createObjectURL(file));
        setPhotoPreviews(prev => [...prev, ...newPreviews]);
    };

    const removePhoto = (index) => {
        setPhotoFiles(prev => prev.filter((_, i) => i !== index));
        setPhotoPreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleEdit = (inst) => {
        setEditId(inst._id);
        setFormData({
            model: inst.model || '',
            serialNo: inst.serialNo || '',
            instrumentName: inst.instrumentName || '',
            notes: inst.notes || ''
        });
        setPhotoPreviews(inst.photos?.map(p => `${API_BASE_URL}${p.url}`) || (inst.photo?.url ? [`${API_BASE_URL}${inst.photo.url}`] : []));
        setPhotoFiles([]);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleClear = () => {
        setEditId(null);
        setFormData({ model: '', serialNo: '', instrumentName: '', notes: '' });
        setPhotoFiles([]);
        setPhotoPreviews([]);
        document.getElementById('instr-photo-upload').value = '';
    };

    const [viewInstrument, setViewInstrument] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        onConfirmOpen();
    };

    const confirmSubmit = async () => {
        onConfirmClose();
        setIsLoading(true);
        try {
            const uploadData = new FormData();
            uploadData.append('model', formData.model);
            uploadData.append('serialNo', formData.serialNo);
            uploadData.append('instrumentName', formData.instrumentName);
            if (formData.notes) uploadData.append('notes', formData.notes);
            photoFiles.forEach(file => uploadData.append('photos', file));

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
            console.error('Instrument storage error:', error);
            const errMsg = error.response?.data?.message || error.message || 'Operation failed';
            toast({
                title: 'Error',
                description: errMsg,
                status: 'error',
                duration: 5000,
                isClosable: true
            });
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
                        <Text opacity={0.75} mt={1} fontSize="xs">Serial No is required. Instrument Name and Model are optional.</Text>
                    </Box>

                    <CardBody px={8} py={7}>
                        <Tabs index={activeTab} onChange={(idx) => setActiveTab(idx)} colorScheme="blue" variant="soft-rounded">
                            <TabList mb={6} justifyContent="center" bg="gray.50" p={2} borderRadius="2xl" border="1px solid" borderColor="gray.100">
                                <Tab fontWeight="bold" borderRadius="xl" px={6} py={3} _selected={{ color: 'white', bg: 'blue.500', shadow: 'md' }}>Form</Tab>
                                <Tab fontWeight="bold" borderRadius="xl" px={6} py={3} _selected={{ color: 'white', bg: 'blue.500', shadow: 'md' }}>View</Tab>
                            </TabList>
                            <TabPanels>
                                <TabPanel p={0}>
                        <form onSubmit={handleSubmit}>
                            <VStack spacing={6} align="stretch">

                                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={5}>
                                    <FormControl>
                                        <FormLabel fontWeight="bold" fontSize="sm" color="gray.700">
                                            <Icon as={FaTag} mr={1} color="blue.400" /> Model
                                        </FormLabel>
                                        <Input name="model" placeholder="e.g. TS-12" value={formData.model} onChange={handleChange} borderRadius="xl" bg="gray.50" />
                                    </FormControl>
                                    <FormControl isRequired>
                                        <FormLabel fontWeight="bold" fontSize="sm" color="gray.700">
                                            <Icon as={FaTag} mr={1} color="orange.400" /> Serial No
                                        </FormLabel>
                                        <Input name="serialNo" placeholder="e.g. SN-12345" value={formData.serialNo} onChange={handleChange} borderRadius="xl" bg="gray.50" />
                                    </FormControl>
                                    <FormControl>
                                        <FormLabel fontWeight="bold" fontSize="sm" color="gray.700">
                                            <Icon as={FaWrench} mr={1} color="blue.400" /> Instrument Name
                                        </FormLabel>
                                        <Input name="instrumentName" placeholder="e.g. Total Station" value={formData.instrumentName} onChange={handleChange} borderRadius="xl" bg="gray.50" />
                                    </FormControl>
                                </SimpleGrid>

                                {/* Multiple Photos Upload */}
                                <FormControl>
                                    <FormLabel fontWeight="bold" fontSize="sm" color="gray.700">
                                        📷 Instrument Photos <Text as="span" color="gray.400" fontWeight="normal">(optional)</Text>
                                    </FormLabel>
                                    <Box
                                        border="2px dashed"
                                        borderColor="blue.300"
                                        borderRadius="2xl"
                                        p={5}
                                        bg="blue.50"
                                        cursor="pointer"
                                        onClick={() => document.getElementById('instr-photo-upload').click()}
                                        _hover={{ bg: 'blue.100', borderColor: 'blue.400' }}
                                        transition="all 0.2s"
                                        textAlign="center"
                                    >
                                        <input type="file" id="instr-photo-upload" hidden multiple onChange={handlePhotoChange} accept="image/*" />
                                        <VStack spacing={2}>
                                            <Icon as={FaCloudUploadAlt} w={8} h={8} color="blue.400" />
                                            <Text fontSize="sm" fontWeight="bold" color="blue.700">Click to add multiple photos</Text>
                                        </VStack>
                                    </Box>

                                    {photoPreviews && photoPreviews.length > 0 && (
                                        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={3} mt={4}>
                                            {photoPreviews.map((src, i) => (
                                                <Box key={i} position="relative" borderRadius="lg" overflow="hidden" border="1px solid" borderColor="blue.200">
                                                    <Image src={src} alt="Preview" w="full" h="100px" objectFit="cover" />
                                                    <IconButton
                                                        aria-label="Remove Photo"
                                                        icon={<Icon as={FaTrash} />}
                                                        size="xs"
                                                        colorScheme="red"
                                                        position="absolute"
                                                        top={1} right={1}
                                                        onClick={(e) => { e.stopPropagation(); removePhoto(i); }}
                                                    />
                                                </Box>
                                            ))}
                                        </SimpleGrid>
                                    )}
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
                                </TabPanel>
                                <TabPanel p={0}>

                {/* Instrument Table List */}
                <Box mt={4}>
                    <HStack justify="space-between" mb={4}>
                        <Heading size="md" color="blue.700" display="flex" alignItems="center">
                            <Icon as={FaWrench} mr={2} /> Registered Instruments
                        </Heading>
                        <Tag colorScheme="blue" variant="subtle" borderRadius="full">{instruments.length} Total</Tag>
                    </HStack>
                    <Box overflow="hidden" w="full" bg="white" borderRadius="2xl" boxShadow="xl" border="1px solid" borderColor="gray.100">
                        <Table variant="simple" sx={{ 'th, td': { whiteSpace: 'normal', wordBreak: 'break-word' } }}>
                            <Thead bg="blue.50">
                                <Tr>
                                    <Th color="blue.700" py={4}>Photo</Th>
                                    <Th color="blue.700" py={4}>Serial No</Th>
                                    <Th color="blue.700" py={4}>Instrument Name</Th>
                                    <Th color="blue.700" py={4}>Model</Th>
                                    <Th color="blue.700" py={4} textAlign="center">Actions</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {instruments.map(inst => {
                                    const mainPhoto = inst.photos?.[0]?.url || inst.photo?.url;
                                    return (
                                        <Tr key={inst._id} _hover={{ bg: "blue.50" }} transition="all 0.2s">
                                            <Td py={2}>
                                                {mainPhoto ? (
                                                    <Image 
                                                        src={`${API_BASE_URL}${mainPhoto}`} 
                                                        alt={inst.instrumentName} 
                                                        boxSize="40px" 
                                                        objectFit="cover" 
                                                        borderRadius="lg" 
                                                        fallback={<Center boxSize="40px" bg="gray.100" borderRadius="lg"><Icon as={FaWrench} color="gray.400" /></Center>}
                                                    />
                                                ) : (
                                                    <Center boxSize="40px" bg="gray.100" borderRadius="lg">
                                                        <Icon as={FaWrench} color="gray.400" />
                                                    </Center>
                                                )}
                                            </Td>
                                            <Td fontWeight="bold" color="blue.600">{inst.serialNo || 'N/A'}</Td>
                                            <Td fontWeight="medium">{inst.instrumentName}</Td>
                                            <Td fontWeight="medium" color="gray.500">{inst.model || 'N/A'}</Td>
                                            <Td textAlign="center">
                                                <HStack justify="center" spacing={2}>
                                                    <IconButton
                                                        aria-label="View" size="sm" colorScheme="teal" variant="ghost" icon={<Icon as={FaEye} />}
                                                        onClick={() => setViewInstrument(inst)}
                                                    />
                                                    <IconButton
                                                        aria-label="Edit" size="sm" colorScheme="blue" variant="ghost" icon={<Icon as={FaEdit} />}
                                                        onClick={() => handleEdit(inst)}
                                                    />
                                                    <IconButton
                                                        aria-label="Delete" size="sm" colorScheme="red" variant="ghost" icon={<Icon as={FaTrash} />}
                                                        onClick={() => handleDelete(inst._id)}
                                                    />
                                                </HStack>
                                            </Td>
                                        </Tr>
                                    );
                                })}
                                {instruments.length === 0 && (
                                    <Tr>
                                        <Td colSpan={5} textAlign="center" py={10} color="gray.400">
                                            <VStack spacing={2}>
                                                <Icon as={FaWrench} w={8} h={8} opacity={0.2} />
                                                <Text>No instruments found.</Text>
                                            </VStack>
                                        </Td>
                                    </Tr>
                                )}
                            </Tbody>
                        </Table>
                    </Box>
                </Box>
                                </TabPanel>
                            </TabPanels>
                        </Tabs>
                    </CardBody>
                </Card>

                {/* View Instrument Modal */}
                {viewInstrument && (
                    <Box
                        position="fixed" top={0} left={0} right={0} bottom={0}
                        bg="blackAlpha.700"
                        zIndex={10000}
                        display="flex" alignItems="center" justifyContent="center" p={4}
                        onClick={() => setViewInstrument(null)}
                        className="uni-modal-overlay"
                    >
                        <Box
                            bg="white" borderRadius="3xl" maxW="600px" w="full" boxShadow="2xl"
                            overflow="hidden" onClick={(e) => e.stopPropagation()}
                            className="uni-modal-box"
                        >
                            <Box bgGradient="linear(to-r, blue.800, blue.600)" p={6} color="white">
                                <HStack justify="space-between">
                                    <HStack spacing={4}>
                                        <Icon as={FaWrench} w={8} h={8} />
                                        <VStack align="start" spacing={0}>
                                            <Heading size="md">{viewInstrument.instrumentName}</Heading>
                                            <Text fontSize="xs" opacity={0.8}>{viewInstrument.serialNo || 'No Serial No'} • Model: {viewInstrument.model || 'N/A'}</Text>
                                        </VStack>
                                    </HStack>
                                    <IconButton aria-label="Close" icon={<Icon as={FaTimes} />} size="md" variant="ghost" color="white" onClick={() => setViewInstrument(null)} />
                                </HStack>
                            </Box>

                            <Box p={8}>
                                <VStack align="start" spacing={6}>
                                    <Box w="full">
                                        <Text fontSize="10px" fontWeight="black" color="blue.500" textTransform="uppercase" mb={2}>Description / Notes</Text>
                                        <Text fontSize="sm" bg="gray.50" p={4} borderRadius="xl" borderLeft="4px solid" borderColor="blue.400">
                                            {viewInstrument.notes || 'No specific notes provided for this instrument.'}
                                        </Text>
                                    </Box>

                                    <Box w="full">
                                        <Text fontSize="10px" fontWeight="black" color="blue.500" textTransform="uppercase" mb={3}>Gallery ({viewInstrument.photos?.length || (viewInstrument.photo ? 1 : 0)})</Text>
                                        <SimpleGrid columns={3} spacing={3}>
                                            {viewInstrument.photos?.map((p, idx) => (
                                                <Box key={idx} borderRadius="xl" overflow="hidden" boxShadow="sm" border="1px solid" borderColor="gray.100" cursor="pointer" onClick={() => window.open(`${API_BASE_URL}${p.url}`, '_blank')}>
                                                    <Image src={`${API_BASE_URL}${p.url}`} alt="Inst" h="80px" w="full" objectFit="cover" _hover={{ transform: 'scale(1.1)' }} transition="transform 0.3s" />
                                                </Box>
                                            ))}
                                            {viewInstrument.photo && (
                                                <Box borderRadius="xl" overflow="hidden" boxShadow="sm" border="1px solid" borderColor="gray.100" cursor="pointer" onClick={() => window.open(`${API_BASE_URL}${viewInstrument.photo.url}`, '_blank')}>
                                                    <Image src={`${API_BASE_URL}${viewInstrument.photo.url}`} alt="Inst" h="80px" w="full" objectFit="cover" />
                                                </Box>
                                            )}
                                            {(!viewInstrument.photos?.length && !viewInstrument.photo) && (
                                                <Center gridColumn="span 3" py={4} border="1px dashed" borderColor="gray.200" borderRadius="xl">
                                                    <Text fontSize="xs" color="gray.400">No photos available</Text>
                                                </Center>
                                            )}
                                        </SimpleGrid>
                                    </Box>
                                </VStack>
                            </Box>
                            <Box p={5} bg="gray.50" textAlign="right">
                                <Button colorScheme="blue" borderRadius="full" px={10} shadow="lg" onClick={() => setViewInstrument(null)}>Close</Button>
                            </Box>
                        </Box>
                    </Box>
                )}
            </Container>

            <AlertDialog isOpen={isConfirmOpen} leastDestructiveRef={cancelRef} onClose={onConfirmClose} isCentered>
                <AlertDialogOverlay>
                    <AlertDialogContent borderRadius="2xl">
                        <AlertDialogHeader fontSize="lg" fontWeight="bold">Confirm Instrument Resource</AlertDialogHeader>
                        <AlertDialogBody>
                            Are you sure you want to {editId ? 'update' : 'save'} <strong>{formData.instrumentName}</strong>?
                        </AlertDialogBody>
                        <AlertDialogFooter>
                            <Button ref={cancelRef} onClick={onConfirmClose} borderRadius="full">Cancel</Button>
                            <Button colorScheme="blue" onClick={confirmSubmit} ml={3} borderRadius="full" px={8}>Confirm & Save</Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
        </Box>
    );
};

const ExpenseReportsTab = () => {
    const [employees, setEmployees] = useState([]);
    const [selectedId, setSelectedId] = useState('');
    const [reportType, setReportType] = useState('Ledger');

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
                    <HStack spacing={6} align="end">
                        <FormControl maxW="250px">
                            <FormLabel fontWeight="bold">Select Report Type</FormLabel>
                            <Select value={reportType} onChange={(e) => {
                                setReportType(e.target.value);
                                if (e.target.value === 'Food' || e.target.value === 'Fuel') setSelectedId('ALL');
                                else setSelectedId('');
                            }} bg="white">
                                <option value="Ledger">Employee Ledger</option>
                                <option value="Food">Global Food Report</option>
                                <option value="Fuel">Global Fuel Report</option>
                            </Select>
                        </FormControl>

                        <FormControl maxW="400px" isDisabled={reportType === 'Food' || reportType === 'Fuel'}>
                            <FormLabel fontWeight="bold">Select Employee</FormLabel>
                            <Select 
                                placeholder={(reportType === 'Food' || reportType === 'Fuel') ? "All Employees Included" : "-- Choose Employee --"} 
                                value={(reportType === 'Food' || reportType === 'Fuel') ? 'ALL' : selectedId} 
                                onChange={(e) => setSelectedId(e.target.value)} 
                                bg={(reportType === 'Food' || reportType === 'Fuel') ? 'gray.100' : 'white'}
                            >
                                {(reportType === 'Food' || reportType === 'Fuel') && <option value="ALL" hidden>All Employees</option>}
                                {employees.map(emp => <option key={emp._id} value={emp._id}>{emp.name}</option>)}
                            </Select>
                        </FormControl>
                    </HStack>
                </CardBody>
            </Card>

            {((selectedId && selectedId !== 'ALL') || reportType === 'Food' || reportType === 'Fuel') ? (
                <AdminEmployeeExpenses employeeId={(reportType === 'Food' || reportType === 'Fuel') ? 'ALL' : selectedId} employeeName={(reportType === 'Food' || reportType === 'Fuel') ? 'All Employees' : selectedName} externalReportType={reportType} />
            ) : (
                <Center p={10}><Text color="gray.500">Please select an employee to view their expense reports.</Text></Center>
            )}
        </Box>
    );
};

import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const Services = () => {
    const { user } = useAuth();
    const isAdmin = user && user.isAdmin;
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    return (
        <Box>
            {isAdmin ? (
                <Box bg="gray.100" minH="100vh" pt={10}>
                    <Container maxW="full" px={{ base: 2, xl: 6 }}>
                        <Flex mb={4} justify="flex-start">
                            <Button 
                                size="sm" 
                                colorScheme="purple" 
                                variant="outline" 
                                leftIcon={<Icon as={isSidebarOpen ? FaChevronLeft : FaChevronRight} />}
                                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                                bg="white"
                            >
                                {isSidebarOpen ? 'Hide Menu' : 'Show Menu'}
                            </Button>
                        </Flex>
                        <Tabs isLazy variant="soft-rounded" colorScheme="purple" orientation="vertical" w="full">
                            {isSidebarOpen && (
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
                                        <Icon as={FaCalendarAlt} mr={2} /> Scheduler
                                    </Tab>
                                    <Tab _selected={{ color: 'white', bg: 'blue.700' }} px={6} py={3} fontWeight="bold" ml={0} textAlign="left" justifyContent="start">
                                        <Icon as={FaWrench} mr={2} /> Instruments
                                    </Tab>
                                    <Tab _selected={{ color: 'white', bg: 'blue.600' }} px={6} py={3} fontWeight="bold" ml={0} textAlign="left" justifyContent="start">
                                        <Icon as={FaMoneyBillWave} mr={2} /> Employee Ledger
                                    </Tab>
                                    <Tab _selected={{ color: 'white', bg: 'purple.500' }} px={6} py={3} fontWeight="bold" ml={0} textAlign="left" justifyContent="start">
                                        <Icon as={FaFolderOpen} mr={2} /> Drafting Work
                                    </Tab>
                                    <Tab _selected={{ color: 'white', bg: 'blue.500' }} px={6} py={3} fontWeight="bold" ml={0} textAlign="left" justifyContent="start">
                                        <Icon as={FaFileInvoiceDollar} mr={2} /> Invoice Report
                                    </Tab>
                                </TabList>
                            )}

                            <TabPanels flex={1} w="full">
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
                                    <EmployeeExpensesModule />
                                </TabPanel>
                                <TabPanel p={0}>
                                    <AdminDraftingWork />
                                </TabPanel>
                                <TabPanel p={0}>
                                    <InvoiceReport />
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
