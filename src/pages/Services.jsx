import React, { useState, useEffect } from 'react';
import {
    Box, Container, Heading, Text, SimpleGrid, Icon, Stack, Flex, Button, Card, CardBody,
    Divider, FormControl, FormLabel, Input, VStack, useToast, Image, Badge, HStack, IconButton, Select,
    Tabs, TabList, TabPanels, Tab, TabPanel, Checkbox, Center,
    Table, Thead, Tbody, Tr, Th, Td, TableContainer, Tag, TagLabel, Wrap, WrapItem, Avatar,
    Popover, PopoverTrigger, PopoverContent, PopoverHeader, PopoverBody, PopoverArrow, PopoverCloseButton, Portal,
    useDisclosure, AlertDialog, AlertDialogBody, AlertDialogFooter, AlertDialogHeader, AlertDialogContent, AlertDialogOverlay,
    Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, Spacer, Menu, MenuButton, MenuList, MenuItem,
    NumberInput, NumberInputField, Spinner, Textarea, Alert, AlertIcon
} from '@chakra-ui/react';
import {
    FaRoad, FaHardHat, FaBuilding, FaRoute, FaTruck, FaCloudUploadAlt, FaFilePdf, FaFileImage, FaTrash, FaCheckCircle,
    FaUserTie, FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaIdCard, FaCamera,
    FaHandshake, FaFingerprint, FaIdBadge, FaMap, FaGlobe, FaTable, FaDownload, FaFileContract, FaFileInvoice,
    FaCalendarAlt, FaUsers, FaStar, FaEdit, FaEye, FaWrench, FaTag, FaFileInvoiceDollar, FaMapMarkedAlt, FaMoneyBillWave, FaTimes, FaFileAlt, FaUndo, FaListUl, FaChevronDown,
    FaSearch, FaCar, FaFolderOpen, FaCopy, FaPrint, FaFileExcel, FaPlus,
    FaChevronUp, FaChevronRight, FaChevronLeft, FaThLarge, FaList, FaLayerGroup, FaSitemap, FaImage, FaInfoCircle, FaCheck, FaBoxes, FaCube, FaCubes, FaFilter, FaSyncAlt, FaArrowRight, FaLink, FaUnlink, FaExternalLinkAlt, FaMicrochip, FaExclamationTriangle
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import AdminEmployeeExpenses from '../components/AdminEmployeeExpenses';
import EmployeeExpensesModule from '../pages/EmployeeExpensesModule';
import AdminSiteAllocation from '../components/AdminSiteAllocation';
import AdminDraftingWork from './admin/AdminDraftingWork';
import InvoiceReport from './admin/InvoiceReport';
import CompanyMaster from './admin/CompanyMaster';
import AdminLoginReportView from '../components/admin/AdminLoginReportView';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import { hasPermission } from '../utils/permissions';
import ModulePermissionBar from '../components/admin/ModulePermissionBar';


const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ? import.meta.env.VITE_API_BASE_URL.replace(/\/$/, '') : '';

export const getFileUrl = (docOrPath) => {
    if (!docOrPath) return '';
    let rawPath = typeof docOrPath === 'object' ? (docOrPath.url || '') : docOrPath;
    if (typeof rawPath !== 'string' || !rawPath) return '';
    if (rawPath.startsWith('http://') || rawPath.startsWith('https://') || rawPath.startsWith('blob:') || rawPath.startsWith('data:')) {
        return rawPath;
    }
    const cleanPath = rawPath.startsWith('/') ? rawPath : `/${rawPath}`;
    if (import.meta.env.VITE_API_BASE_URL) {
        const base = import.meta.env.VITE_API_BASE_URL.replace(/\/$/, '');
        if (base.endsWith('/api') && cleanPath.startsWith('/api/')) {
            return `${base}${cleanPath.slice(4)}`;
        }
        return `${base}${cleanPath}`;
    }
    return cleanPath;
};

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
    const [existingVehiclePhotos, setExistingVehiclePhotos] = useState([]);
    const [newVehiclePhotos, setNewVehiclePhotos] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [editId, setEditId] = useState(null);
    const [viewVehicle, setViewVehicle] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768 ? 'card' : 'table');
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
        const raw = val.replace(/\s/g, '').toUpperCase();
        let formatted = '';

        for (let i = 0; i < raw.length && i < 10; i++) {
            const char = raw[i];
            if (i < 2) {
                if (/[A-Z]/.test(char)) formatted += char;
                else break;
            }
            else if (i < 4) {
                if (/[0-9]/.test(char)) formatted += char;
                else break;
            }
            else if (i < 6) {
                if (/[A-Z]/.test(char)) formatted += char;
                else break;
            }
            else {
                if (/[0-9]/.test(char)) formatted += char;
                else break;
            }
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
        setNewVehiclePhotos(prev => [...prev, ...files]);
    };

    const removeExistingVehiclePhoto = (index) => {
        setExistingVehiclePhotos(prev => prev.filter((_, i) => i !== index));
    };

    const removeNewVehiclePhoto = (index) => {
        setNewVehiclePhotos(prev => prev.filter((_, i) => i !== index));
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
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

    const executeSave = async () => {
        onConfirmClose();
        setIsLoading(true);
        try {
            const data = new FormData();
            data.append('vehicleNumber', formData.vehicleNumber);
            data.append('vehicleName', formData.vehicleName);
            data.append('insuranceDate', formData.insuranceDate);
            data.append('pucDate', formData.pucDate);
            data.append('serviceDate', formData.serviceDate);
            data.append('logInName', formData.logInName);

            if (rcFile) data.append('rcBook', rcFile);
            if (insuranceFile) data.append('insurancePhoto', insuranceFile);
            if (pucFile) data.append('pucPhoto', pucFile);

            data.append('existingVehiclePhotos', JSON.stringify(existingVehiclePhotos));
            newVehiclePhotos.forEach(file => {
                data.append('vehiclePhotos', file);
            });

            let res;
            if (editId) {
                res = await api.put(`/vehicle-master/${editId}`, data);
            } else {
                res = await api.post('/vehicle-master', data);
            }

            if (res.data.success) {
                toast({
                    title: editId ? 'Vehicle Updated' : 'Vehicle Registered',
                    description: `Vehicle ${formData.vehicleNumber} successfully saved.`,
                    status: 'success',
                    duration: 3000
                });
                setFormData({
                    vehicleNumber: '',
                    vehicleName: '',
                    insuranceDate: '',
                    pucDate: '',
                    serviceDate: '',
                    logInName: user?.name || ''
                });
                setRcFile(null);
                setInsuranceFile(null);
                setPucFile(null);
                setExistingVehiclePhotos([]);
                setNewVehiclePhotos([]);
                setEditId(null);
                fetchVehicles();
            }
        } catch (err) {
            toast({
                title: 'Error Saving Vehicle',
                description: err.response?.data?.message || 'Something went wrong',
                status: 'error',
                duration: 4000
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this vehicle record?')) return;
        try {
            const res = await api.delete(`/vehicle-master/${id}`);
            if (res.data.success) {
                toast({ title: 'Vehicle Deleted', status: 'info', duration: 2000 });
                fetchVehicles();
            }
        } catch (err) {
            toast({ title: 'Delete Failed', description: err.response?.data?.message, status: 'error', duration: 3000 });
        }
    };

    const handleEdit = (v) => {
        setEditId(v._id);
        setFormData({
            vehicleNumber: v.vehicleNumber || '',
            vehicleName: v.vehicleName || '',
            insuranceDate: v.insuranceDate ? v.insuranceDate.substring(0, 10) : '',
            pucDate: v.pucDate ? v.pucDate.substring(0, 10) : '',
            serviceDate: v.serviceDate ? v.serviceDate.substring(0, 10) : '',
            logInName: v.logInName || user?.name || ''
        });
        setExistingVehiclePhotos(v.vehiclePhotos?.map(p => p.url) || []);
        setNewVehiclePhotos([]);
        setActiveTab(0);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <Box py={{ base: 4, md: 8 }} bg="gray.100" minH="100vh">
            <Container maxW="container.xl" px={{ base: 2, md: 4 }}>
                <Card variant="elevated" borderRadius="2xl" boxShadow="xl" bg="white" overflow="hidden" border="1px solid" borderColor="gray.200">
                    <Box bgGradient="linear(to-r, purple.700, purple.600)" p={{ base: 4, md: 6 }} color="white">
                        <Stack direction={{ base: "column", md: "row" }} justify="space-between" align={{ base: "stretch", md: "center" }} spacing={4}>
                            <Box>
                                <Heading size={{ base: "md", md: "lg" }} display="flex" alignItems="center">
                                    <Icon as={FaTruck} mr={3} /> {editId ? 'Edit Vehicle Record' : 'Vehicle Master'}
                                </Heading>
                                <Text fontSize={{ base: "xs", md: "sm" }} opacity={0.85} mt={1}>
                                    Fleet asset management, insurance, PUC & maintenance tracking
                                </Text>
                            </Box>
                            <HStack w={{ base: "full", md: "auto" }} spacing={2}>
                                <Input
                                    bg="white"
                                    color="gray.800"
                                    placeholder="Search Vehicle No, Name..."
                                    size="sm"
                                    borderRadius="xl"
                                    w={{ base: "full", md: "260px" }}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                <Button
                                    size="sm"
                                    colorScheme="green"
                                    leftIcon={<Icon as={FaTruck} />}
                                    flexShrink={0}
                                    onClick={() => {
                                        setEditId(null);
                                        setFormData({ vehicleNumber: '', vehicleName: '', insuranceDate: '', pucDate: '', serviceDate: '', logInName: user?.name || '' });
                                        setActiveTab(0);
                                    }}
                                    borderRadius="xl"
                                >
                                    + Add New
                                </Button>
                            </HStack>
                        </Stack>
                    </Box>

                    <CardBody p={{ base: 3, md: 8 }}>
                        <Tabs index={activeTab} onChange={(idx) => setActiveTab(idx)} colorScheme="purple" variant="soft-rounded">
                            <TabList
                                mb={6}
                                overflowX="auto"
                                overflowY="hidden"
                                whiteSpace="nowrap"
                                py={2}
                                px={1}
                                bg="gray.50"
                                borderRadius="2xl"
                                border="1px solid"
                                borderColor="gray.200"
                                sx={{
                                    WebkitOverflowScrolling: 'touch',
                                    scrollbarWidth: 'none',
                                    '&::-webkit-scrollbar': { display: 'none' }
                                }}
                            >
                                <Tab fontWeight="bold" fontSize="sm" borderRadius="xl" px={{ base: 4, md: 6 }} py={2.5} _selected={{ color: 'white', bg: 'purple.600', shadow: 'md' }}>
                                    {editId ? '✏️ Edit Form' : '📋 Register Form'}
                                </Tab>
                                <Tab fontWeight="bold" fontSize="sm" borderRadius="xl" px={{ base: 4, md: 6 }} py={2.5} _selected={{ color: 'white', bg: 'purple.600', shadow: 'md' }}>
                                    🚚 View Vehicles ({vehicles.length})
                                </Tab>
                            </TabList>

                            <TabPanels>
                                <TabPanel p={0}>
                                    <form onSubmit={handleSubmit}>
                                        <VStack spacing={6}>
                                            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} w="full">
                                                <FormControl isRequired>
                                                    <FormLabel fontWeight="bold" fontSize="sm">Vehicle Number</FormLabel>
                                                    <Box position="relative">
                                                        <Box
                                                            position="absolute"
                                                            left="16px"
                                                            top="12.5px"
                                                            color="gray.300"
                                                            fontSize="md"
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
                                                            size="md"
                                                            bg="transparent"
                                                            fontFamily="monospace"
                                                            letterSpacing="1px"
                                                            _placeholder={{ color: 'transparent' }}
                                                            maxLength={13}
                                                        />
                                                    </Box>
                                                </FormControl>
                                                <FormControl>
                                                    <FormLabel fontWeight="bold" fontSize="sm">Vehicle Name / Model</FormLabel>
                                                    <Input
                                                        name="vehicleName"
                                                        placeholder="Enter Vehicle Name (e.g. Tata Tipper)"
                                                        value={formData.vehicleName}
                                                        onChange={handleChange}
                                                        borderRadius="xl"
                                                        size="md"
                                                    />
                                                </FormControl>
                                            </SimpleGrid>

                                            <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={6} w="full">
                                                <FormControl>
                                                    <FormLabel fontWeight="bold" fontSize="sm">Insurance Expiry Date</FormLabel>
                                                    <Input
                                                        type="date"
                                                        name="insuranceDate"
                                                        value={formData.insuranceDate}
                                                        onChange={handleChange}
                                                        borderRadius="xl"
                                                        size="md"
                                                    />
                                                </FormControl>
                                                <FormControl>
                                                    <FormLabel fontWeight="bold" fontSize="sm">PUC Expiry Date</FormLabel>
                                                    <Input
                                                        type="date"
                                                        name="pucDate"
                                                        value={formData.pucDate}
                                                        onChange={handleChange}
                                                        borderRadius="xl"
                                                        size="md"
                                                    />
                                                </FormControl>
                                                <FormControl>
                                                    <FormLabel fontWeight="bold" fontSize="sm">Next Service Date</FormLabel>
                                                    <Input
                                                        type="date"
                                                        name="serviceDate"
                                                        value={formData.serviceDate}
                                                        onChange={handleChange}
                                                        borderRadius="xl"
                                                        size="md"
                                                    />
                                                </FormControl>
                                            </SimpleGrid>

                                            <FormControl w="full">
                                                <FormLabel fontWeight="bold" fontSize="sm">Vehicle Photos (Multi-Upload)</FormLabel>
                                                <Box
                                                    p={4}
                                                    border="2px dashed"
                                                    borderColor="purple.200"
                                                    borderRadius="xl"
                                                    bg="purple.50"
                                                    textAlign="center"
                                                    cursor="pointer"
                                                    onClick={() => document.getElementById('vehicle-photos-upload').click()}
                                                    _hover={{ bg: "purple.100", borderColor: "purple.400" }}
                                                >
                                                    <input
                                                        type="file"
                                                        id="vehicle-photos-upload"
                                                        hidden
                                                        multiple
                                                        onChange={handleVehiclePhotoChange}
                                                        accept="image/*"
                                                    />
                                                    <Icon as={FaCamera} w={6} h={6} color="purple.500" mb={1} />
                                                    <Text fontSize="xs" fontWeight="bold" color="purple.700">Tap / Click to Add Vehicle Photos</Text>
                                                </Box>

                                                {(existingVehiclePhotos.length > 0 || newVehiclePhotos.length > 0) && (
                                                    <SimpleGrid columns={{ base: 2, sm: 3, md: 4 }} spacing={3} mt={3}>
                                                        {existingVehiclePhotos.map((url, i) => (
                                                            <Box key={`existing-${i}`} position="relative" borderRadius="lg" overflow="hidden" border="1px solid" borderColor="purple.200">
                                                                <Image src={getFileUrl(url)} alt="Vehicle" w="full" h="80px" objectFit="cover" />
                                                                {i === 0 && (
                                                                    <Badge position="absolute" bottom={1} left={1} colorScheme="purple" fontSize="9px">Primary</Badge>
                                                                )}
                                                                <IconButton
                                                                    icon={<Icon as={FaTrash} />}
                                                                    size="xs"
                                                                    colorScheme="red"
                                                                    position="absolute"
                                                                    top={1} right={1}
                                                                    onClick={(e) => { e.stopPropagation(); removeExistingVehiclePhoto(i); }}
                                                                />
                                                            </Box>
                                                        ))}
                                                        {newVehiclePhotos.map((file, i) => {
                                                            const objUrl = URL.createObjectURL(file);
                                                            return (
                                                                <Box key={`new-${i}`} position="relative" borderRadius="lg" overflow="hidden" border="1px solid" borderColor="purple.200">
                                                                    <Image src={objUrl} alt="New Preview" w="full" h="80px" objectFit="cover" />
                                                                    <IconButton
                                                                        icon={<Icon as={FaTrash} />}
                                                                        size="xs"
                                                                        colorScheme="red"
                                                                        position="absolute"
                                                                        top={1} right={1}
                                                                        onClick={(e) => { e.stopPropagation(); removeNewVehiclePhoto(i); }}
                                                                    />
                                                                </Box>
                                                            );
                                                        })}
                                                    </SimpleGrid>
                                                )}
                                            </FormControl>

                                            <Divider />

                                            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} w="full">
                                                <FormControl>
                                                    <FormLabel fontWeight="bold" fontSize="sm">RC Book Photo/PDF</FormLabel>
                                                    <Box p={4} border="2px dashed" borderColor="pink.200" borderRadius="xl" bg="pink.50" textAlign="center" cursor="pointer" onClick={() => document.getElementById('rc-upload').click()} _hover={{ bg: "pink.100" }}>
                                                        <input type="file" id="rc-upload" hidden onChange={handleFileChange} accept="image/*,.pdf" />
                                                        <Icon as={FaCloudUploadAlt} w={6} h={6} color="pink.500" mb={1} />
                                                        <Text fontSize="xs" fontWeight="bold" color="pink.700">{rcFile ? rcFile.name : "Upload RC Book"}</Text>
                                                    </Box>
                                                </FormControl>
                                                <FormControl>
                                                    <FormLabel fontWeight="bold" fontSize="sm">Insurance Photo/PDF</FormLabel>
                                                    <Box p={4} border="2px dashed" borderColor="blue.200" borderRadius="xl" bg="blue.50" textAlign="center" cursor="pointer" onClick={() => document.getElementById('ins-upload').click()} _hover={{ bg: "blue.100" }}>
                                                        <input type="file" id="ins-upload" hidden onChange={(e) => setInsuranceFile(e.target.files[0])} accept="image/*,.pdf" />
                                                        <Icon as={FaCloudUploadAlt} w={6} h={6} color="blue.500" mb={1} />
                                                        <Text fontSize="xs" fontWeight="bold" color="blue.700">{insuranceFile ? insuranceFile.name : "Upload Insurance"}</Text>
                                                    </Box>
                                                </FormControl>
                                                <FormControl>
                                                    <FormLabel fontWeight="bold" fontSize="sm">PUC Photo/PDF</FormLabel>
                                                    <Box p={4} border="2px dashed" borderColor="green.200" borderRadius="xl" bg="green.50" textAlign="center" cursor="pointer" onClick={() => document.getElementById('puc-upload').click()} _hover={{ bg: "green.100" }}>
                                                        <input type="file" id="puc-upload" hidden onChange={(e) => setPucFile(e.target.files[0])} accept="image/*,.pdf" />
                                                        <Icon as={FaCloudUploadAlt} w={6} h={6} color="green.500" mb={1} />
                                                        <Text fontSize="xs" fontWeight="bold" color="green.700">{pucFile ? pucFile.name : "Upload PUC"}</Text>
                                                    </Box>
                                                </FormControl>
                                            </SimpleGrid>

                                            <Button
                                                size="lg"
                                                colorScheme="purple"
                                                w="full"
                                                borderRadius="xl"
                                                h="50px"
                                                type="submit"
                                                leftIcon={<FaTruck />}
                                                isLoading={isLoading}
                                                boxShadow="md"
                                            >
                                                {editId ? 'Update Vehicle Record' : 'Add Vehicle Record'}
                                            </Button>
                                            {editId && (
                                                <Button variant="outline" colorScheme="gray" borderRadius="xl" h="44px" w="full" onClick={() => {
                                                    setEditId(null);
                                                    setFormData({ vehicleNumber: '', vehicleName: '', insuranceDate: '', pucDate: '', serviceDate: '', logInName: user?.name || '' });
                                                    setRcFile(null); setInsuranceFile(null); setPucFile(null); setExistingVehiclePhotos([]); setNewVehiclePhotos([]);
                                                }}>
                                                    Cancel Edit
                                                </Button>
                                            )}
                                        </VStack>
                                    </form>
                                </TabPanel>

                                <TabPanel p={0}>
                                    <Box mt={2}>
                                        <Flex justify="space-between" align="center" mb={4} wrap="wrap" gap={3}>
                                            <Heading size="sm" color="purple.700" display="flex" alignItems="center">
                                                <Icon as={FaTruck} mr={2} /> Registered Fleet ({filteredVehicles.length})
                                            </Heading>

                                            <HStack spacing={1} bg="gray.100" p={1} borderRadius="xl" border="1px solid" borderColor="gray.200">
                                                <Button
                                                    size="xs"
                                                    variant={viewMode === 'card' ? 'solid' : 'ghost'}
                                                    colorScheme={viewMode === 'card' ? 'purple' : 'gray'}
                                                    leftIcon={<Icon as={FaThLarge} />}
                                                    borderRadius="lg"
                                                    fontWeight="bold"
                                                    onClick={() => setViewMode('card')}
                                                >
                                                    Cards
                                                </Button>
                                                <Button
                                                    size="xs"
                                                    variant={viewMode === 'table' ? 'solid' : 'ghost'}
                                                    colorScheme={viewMode === 'table' ? 'purple' : 'gray'}
                                                    leftIcon={<Icon as={FaTable} />}
                                                    borderRadius="lg"
                                                    fontWeight="bold"
                                                    onClick={() => setViewMode('table')}
                                                >
                                                    Table
                                                </Button>
                                            </HStack>
                                        </Flex>

                                        {viewMode === 'table' ? (
                                            <Box overflow="hidden" w="full" bg="white" borderRadius="2xl" boxShadow="sm" border="1px solid" borderColor="gray.200">
                                                <TableContainer overflowX="auto" sx={{ WebkitOverflowScrolling: 'touch' }}>
                                                    <Table variant="simple" size="sm">
                                                        <Thead bg="gray.50">
                                                            <Tr>
                                                                <Th fontSize="10px" fontWeight="black" color="gray.600" textAlign="center">IMAGE</Th>
                                                                <Th fontSize="10px" fontWeight="black" color="gray.600">VEHICLE NO</Th>
                                                                <Th fontSize="10px" fontWeight="black" color="gray.600">NAME / MODEL</Th>
                                                                <Th fontSize="10px" fontWeight="black" color="gray.600">NEXT SERVICE</Th>
                                                                <Th fontSize="10px" fontWeight="black" color="gray.600" textAlign="center">ACTIONS</Th>
                                                            </Tr>
                                                        </Thead>
                                                        <Tbody>
                                                            {filteredVehicles.map((v, idx) => (
                                                                <Tr key={v._id} bg={idx % 2 === 0 ? "white" : "gray.50"} _hover={{ bg: "purple.50" }} transition="background 0.2s">
                                                                    <Td textAlign="center" py={2}>
                                                                        {v.vehiclePhotos && v.vehiclePhotos[0]?.url ? (
                                                                            <Image
                                                                                src={getFileUrl(v.vehiclePhotos[0].url)}
                                                                                alt={v.vehicleNumber}
                                                                                w="42px"
                                                                                h="42px"
                                                                                borderRadius="lg"
                                                                                objectFit="cover"
                                                                                border="1px solid"
                                                                                borderColor="gray.200"
                                                                                mx="auto"
                                                                            />
                                                                        ) : (
                                                                            <Box w="42px" h="42px" bg="purple.50" borderRadius="lg" display="flex" alignItems="center" justifyContent="center" border="1px solid" borderColor="purple.100" mx="auto">
                                                                                <Icon as={FaTruck} color="purple.400" />
                                                                            </Box>
                                                                        )}
                                                                    </Td>
                                                                    <Td fontWeight="bold" color="purple.700" fontSize="xs">{v.vehicleNumber}</Td>
                                                                    <Td fontSize="xs" color="gray.700">{v.vehicleName || '—'}</Td>
                                                                    <Td>
                                                                        {v.serviceDate ? (
                                                                            <Badge colorScheme="red" variant="subtle" borderRadius="full" px={2} fontSize="10px">
                                                                                {v.serviceDate.substring(0, 10)}
                                                                            </Badge>
                                                                        ) : <Text fontSize="10px" color="gray.400">—</Text>}
                                                                    </Td>
                                                                    <Td textAlign="center">
                                                                        <HStack justify="center" spacing={1.5}>
                                                                            <IconButton aria-label="View" size="xs" colorScheme="teal" variant="solid" borderRadius="lg" icon={<Icon as={FaEye} />} onClick={() => setViewVehicle(v)} />
                                                                            <IconButton aria-label="Edit" size="xs" colorScheme="blue" variant="solid" borderRadius="lg" icon={<Icon as={FaEdit} />} onClick={() => handleEdit(v)} />
                                                                            <IconButton aria-label="Delete" size="xs" colorScheme="red" variant="ghost" borderRadius="lg" icon={<Icon as={FaTrash} />} onClick={() => handleDelete(v._id)} />
                                                                        </HStack>
                                                                    </Td>
                                                                </Tr>
                                                            ))}
                                                        </Tbody>
                                                    </Table>
                                                </TableContainer>
                                            </Box>
                                        ) : (
                                            <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} spacing={4}>
                                                {filteredVehicles.map(v => {
                                                    const primaryPhoto = v.vehiclePhotos && v.vehiclePhotos[0]?.url ? getFileUrl(v.vehiclePhotos[0].url) : null;
                                                    return (
                                                        <Card key={v._id} borderRadius="2xl" border="1.5px solid" borderColor="gray.200" bg="white" _hover={{ shadow: 'lg', borderColor: 'purple.400', transform: 'translateY(-2px)' }} transition="all 0.2s" overflow="hidden">
                                                            <CardBody p={4}>
                                                                <HStack spacing={3} mb={3}>
                                                                    {primaryPhoto ? (
                                                                        <Image src={primaryPhoto} alt={v.vehicleNumber} w="50px" h="50px" borderRadius="xl" objectFit="cover" border="2px solid" borderColor="purple.400" />
                                                                    ) : (
                                                                        <Avatar size="md" icon={<Icon as={FaTruck} />} borderRadius="xl" bg="purple.50" color="purple.500" border="2px solid" borderColor="purple.300" />
                                                                    )}
                                                                    <Box flex={1} minW={0}>
                                                                        <Text fontWeight="black" fontSize="sm" color="purple.800" isTruncated>{v.vehicleNumber}</Text>
                                                                        <Text fontSize="xs" color="gray.600" isTruncated>{v.vehicleName || 'Fleet Vehicle'}</Text>
                                                                    </Box>
                                                                </HStack>

                                                                <Box bg="purple.50" p={2.5} borderRadius="xl" border="1px solid" borderColor="purple.100" mb={3}>
                                                                    <SimpleGrid columns={2} spacing={2}>
                                                                        <Box>
                                                                            <Text fontSize="9px" color="gray.500" fontWeight="bold">NEXT SERVICE</Text>
                                                                            <Text fontSize="xs" fontWeight="bold" color="red.600">{v.serviceDate ? v.serviceDate.substring(0, 10) : 'N/A'}</Text>
                                                                        </Box>
                                                                        <Box>
                                                                            <Text fontSize="9px" color="gray.500" fontWeight="bold">INSURANCE</Text>
                                                                            <Text fontSize="xs" fontWeight="bold" color="purple.700">{v.insuranceDate ? v.insuranceDate.substring(0, 10) : 'N/A'}</Text>
                                                                        </Box>
                                                                    </SimpleGrid>
                                                                </Box>

                                                                <HStack spacing={2} pt={2} borderTop="1px solid" borderColor="gray.100">
                                                                    <Button flex={1} size="xs" colorScheme="teal" variant="solid" borderRadius="lg" leftIcon={<Icon as={FaEye} />} onClick={() => setViewVehicle(v)}>View</Button>
                                                                    <Button flex={1} size="xs" colorScheme="blue" variant="solid" borderRadius="lg" leftIcon={<Icon as={FaEdit} />} onClick={() => handleEdit(v)}>Edit</Button>
                                                                    <IconButton aria-label="Delete" size="xs" colorScheme="red" variant="ghost" borderRadius="lg" icon={<Icon as={FaTrash} />} onClick={() => handleDelete(v._id)} />
                                                                </HStack>
                                                            </CardBody>
                                                        </Card>
                                                    );
                                                })}
                                            </SimpleGrid>
                                        )}

                                        {filteredVehicles.length === 0 && (
                                            <Center p={8} bg="white" borderRadius="2xl" border="1px dashed" borderColor="gray.200">
                                                <VStack spacing={2}>
                                                    <Icon as={FaTruck} w={8} h={8} color="gray.300" />
                                                    <Text color="gray.500" fontSize="sm">No vehicles found matching "{searchQuery}"</Text>
                                                </VStack>
                                            </Center>
                                        )}
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
    const { user } = useAuth();
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
    const [selectedReportEmployee, setSelectedReportEmployee] = useState(null);
    const [attendanceDetailList, setAttendanceDetailList] = useState([]);
    const [attendanceDetailLoading, setAttendanceDetailLoading] = useState(false);

    const handleRowClick = async (emp) => {
        if (emp.status === 'Deactive') {
            const proceed = window.confirm(`Notice: ${emp.name} is DEACTIVATED.\n\nDo you want to view their attendance details?`);
            if (!proceed) return;
        }

        setSelectedReportEmployee(emp);
        setAttendanceDetailLoading(true);
        try {
            const res = await api.get(`/employee-master/${emp._id}/attendance-detail?month=${reportMonthFilter}`);
            if (res.data.success) {
                setAttendanceDetailList(res.data.data);
            }
        } catch (err) {
            console.error("Failed to fetch detailed attendance", err);
            setAttendanceDetailList([]);
        } finally {
            setAttendanceDetailLoading(false);
        }
    };

    const handleToggleShowInReport = async (empId, newValue) => {
        try {
            const res = await api.put(`/employee-master/${empId}`, { showInPaymentReport: newValue });
            if (res.data.success) {
                setEmployees(prev => prev.map(e => e._id === empId ? { ...e, showInPaymentReport: newValue } : e));
                toast({ title: 'Success', description: `Employee visibility updated.`, status: 'success', duration: 2000 });
            }
        } catch (err) {
            toast({ title: 'Error', description: 'Failed to update visibility', status: 'error', duration: 2000 });
        }
    };

    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768 ? 'card' : 'table');
    const [employeeViewSubTab, setEmployeeViewSubTab] = useState('active'); // 'active' or 'deactive'
    const { isOpen: isConfirmOpen, onOpen: onConfirmOpen, onClose: onConfirmClose } = useDisclosure();
    const cancelRef = React.useRef();

    const tabConfig = [
        { id: 'form', label: 'Form', permission: 'employeeMaster_form' },
        { id: 'view', label: 'View', permission: 'employeeMaster_view' },
        { id: 'payment', label: 'Payment Report', permission: 'employeeMaster_payment' },
        { id: 'adminReport', label: 'Admin Login Report', permission: 'employeeMaster_adminReport' },
    ].filter(tab => hasPermission(user, tab.permission, 'read'));
    const [employeeActiveTab, setEmployeeActiveTab] = useState(0);

    const [reportSearchQuery, setReportSearchQuery] = useState('');
    const [reportPaymentModeFilter, setReportPaymentModeFilter] = useState('All');
    const [reportPaymentStatusFilter, setReportPaymentStatusFilter] = useState('All');
    const [reportMonthFilter, setReportMonthFilter] = useState(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    });
    const [reportFoodFilter, setReportFoodFilter] = useState('All');
    // Cache of { [empId_month]: { present, absent, halfDay, totalRecorded } }
    const [attendanceCache, setAttendanceCache] = useState({});
    const [attendanceLoading, setAttendanceLoading] = useState(false);

    const fetchAttendanceSummaries = async (empList, month) => {
        if (!empList?.length || !month) return;
        setAttendanceLoading(true);
        try {
            const res = await api.post('/employee-master/attendance-summaries', {
                employeeIds: empList.map(e => e._id),
                month
            });
            if (res.data?.data) {
                const cache = {};
                Object.entries(res.data.data).forEach(([empId, summary]) => {
                    cache[`${empId}_${month}`] = summary;
                });
                setAttendanceCache(prev => ({ ...prev, ...cache }));
            }
        } catch (err) {
            console.error("Error fetching bulk attendance summaries:", err);
        } finally {
            setAttendanceLoading(false);
        }
    };

    const baseSearchedEmployees = employees.filter(emp =>
        emp.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.empId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.phone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.designation?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const activeEmployeesCount = baseSearchedEmployees.filter(emp => emp.status !== 'Deactive').length;
    const deactiveEmployeesCount = baseSearchedEmployees.filter(emp => emp.status === 'Deactive').length;

    const filteredEmployees = baseSearchedEmployees.filter(emp => {
        if (employeeViewSubTab === 'active') return emp.status !== 'Deactive';
        if (employeeViewSubTab === 'deactive') return emp.status === 'Deactive';
        return true;
    });

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

    useEffect(() => {
        if (employees.length > 0 && reportMonthFilter) {
            fetchAttendanceSummaries(employees, reportMonthFilter);
        }
    }, [employees, reportMonthFilter]);

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
                                onClick={(e) => { 
                                    e.stopPropagation(); 
                                    const docUrl = getFileUrl(existingDocs[field]);
                                    if (docUrl) window.open(docUrl, '_blank', 'noopener,noreferrer'); 
                                }}
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
        return emp.monthlyPayments?.find(p => p.month === month) || { paymentMode: 'Cash', paymentStatus: 'Pending', presentDays: null, absentDays: null, upad: 0, incentive: 0 };
    };

    // Returns total days in the given YYYY-MM string
    const getDaysInMonth = (monthStr) => {
        if (!monthStr) return 30;
        const [y, m] = monthStr.split('-').map(Number);
        return new Date(y, m, 0).getDate();
    };

    const exportPaymentReportToExcel = () => {
        const month = reportMonthFilter;
        const reportRows = employees.filter(emp => {
            const monthData = getMonthlyPayment(emp, month);
            const matchesSearch = emp.name?.toLowerCase().includes(reportSearchQuery.toLowerCase()) || emp.empId?.toLowerCase().includes(reportSearchQuery.toLowerCase());
            const matchesMode = reportPaymentModeFilter === 'All' || monthData.paymentMode === reportPaymentModeFilter;
            const matchesStatus = reportPaymentStatusFilter === 'All' || monthData.paymentStatus === reportPaymentStatusFilter;
            const matchesFood = reportFoodFilter === 'All' || emp.foodAllowance === reportFoodFilter;
            const isHidden = emp.showInPaymentReport === false;
            return matchesSearch && matchesMode && matchesStatus && matchesFood && !isHidden;
        });

        const totalSalary = reportRows.reduce((acc, emp) => acc + parseFloat(emp.salary || 0), 0);
        let totalPayable = 0;

        let tableHtml = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
        <head>
            <meta charset="utf-8" />
            <style>
                table { border-collapse: collapse; width: 100%; font-family: 'Segoe UI', Arial, sans-serif; }
                th { background-color: #1e3a8a; color: #ffffff; font-weight: bold; padding: 12px 10px; border: 1px solid #94a3b8; text-align: center; font-size: 12px; }
                td { padding: 8px 10px; border: 1px solid #cbd5e1; font-size: 11px; vertical-align: middle; }
                .row-even { background-color: #ffffff; }
                .row-odd { background-color: #f8fafc; }
                .row-done { background-color: #ecfdf5; }
                .row-deactive { background-color: #fef2f2; }
                .badge-green { background-color: #dcfce7; color: #15803d; font-weight: bold; padding: 4px 8px; border-radius: 4px; }
                .badge-orange { background-color: #fef9c3; color: #a16207; font-weight: bold; padding: 4px 8px; border-radius: 4px; }
                .badge-red { background-color: #fee2e2; color: #b91c1c; font-weight: bold; padding: 4px 8px; border-radius: 4px; }
                .money { font-weight: bold; color: #0f172a; text-align: right; }
                .title-banner { background-color: #0f172a; color: #f8fafc; font-size: 16px; font-weight: bold; padding: 15px; text-align: center; border: 2px solid #334155; }
            </style>
        </head>
        <body>
            <table>
                <tr>
                    <td colspan="17" class="title-banner">EMPLOYEE MONTHLY PAYMENT REPORT — ${month}</td>
                </tr>
                <tr>
                    <td colspan="17" style="background-color: #e2e8f0; font-weight: bold; padding: 8px; color: #1e293b;">Generated On: ${new Date().toLocaleDateString()} | Total Employees: ${reportRows.length}</td>
                </tr>
                <tr></tr>
                <tr>
                    <th>SR. NO.</th>
                    <th>Month</th>
                    <th>Employee ID</th>
                    <th>Employee Name</th>
                    <th>Bank A/C No</th>
                    <th>IFSC Code</th>
                    <th>Monthly Salary (₹)</th>
                    <th>Total Days</th>
                    <th>Present</th>
                    <th>Absent</th>
                    <th>Per Day Salary (₹)</th>
                    <th>UPAD (₹)</th>
                    <th>Incentive (₹)</th>
                    <th>Payable Salary (₹)</th>
                    <th>Payment Mode</th>
                    <th>Payment Status</th>
                    <th>Employee Status</th>
                </tr>
        `;

        reportRows.forEach((emp, idx) => {
            const monthData = getMonthlyPayment(emp, month);
            const totalDays = getDaysInMonth(month);
            const salary = parseFloat(emp.salary || 0);
            const perDay = totalDays > 0 ? (salary / totalDays) : 0;
            const attCache = attendanceCache[`${emp._id}_${month}`];
            const present = attCache ? attCache.present : (monthData.presentDays ?? totalDays);
            const absent = attCache ? attCache.absent : (monthData.absentDays ?? 0);
            const upad = monthData.upad ?? 0;
            const incentive = monthData.incentive ?? 0;
            const payable = (perDay * present) - upad + incentive;
            totalPayable += payable;

            const isDone = monthData.paymentStatus === 'Done';
            const isDeactive = emp.status === 'Deactive';
            const rowClass = isDeactive ? 'row-deactive' : isDone ? 'row-done' : (idx % 2 === 0 ? 'row-even' : 'row-odd');

            const payStatusBadge = isDone ? 'badge-green' : 'badge-orange';
            const empStatusBadge = isDeactive ? 'badge-red' : 'badge-green';

            tableHtml += `
                <tr class="${rowClass}">
                    <td style="text-align: center; font-weight: bold;">${idx + 1}</td>
                    <td style="text-align: center;">${month}</td>
                    <td style="text-align: center; font-weight: bold; color: #2563eb;">${emp.empId || ''}</td>
                    <td style="font-weight: bold;">${emp.name || ''}</td>
                    <td style="font-family: monospace;">&nbsp;${emp.bankDetails?.accountNumber || '—'}</td>
                    <td style="text-align: center;">${emp.bankDetails?.ifscCode || '—'}</td>
                    <td class="money">₹${salary.toLocaleString('en-IN')}</td>
                    <td style="text-align: center;">${totalDays}</td>
                    <td style="text-align: center; font-weight: bold; color: #16a34a;">${present}</td>
                    <td style="text-align: center; font-weight: bold; color: ${absent > 0 ? '#dc2626' : '#16a34a'};">${absent}</td>
                    <td class="money">₹${perDay.toFixed(2)}</td>
                    <td class="money" style="color: #9333ea;">₹${upad.toLocaleString('en-IN')}</td>
                    <td class="money" style="color: #16a34a;">₹${incentive.toLocaleString('en-IN')}</td>
                    <td class="money" style="font-size: 12px; color: #16a34a;">₹${payable.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                    <td style="text-align: center;">${monthData.paymentMode}</td>
                    <td style="text-align: center;"><span class="${payStatusBadge}">${monthData.paymentStatus}</span></td>
                    <td style="text-align: center;"><span class="${empStatusBadge}">${emp.status || 'Active'}</span></td>
                </tr>
            `;
        });

        tableHtml += `
                <tr style="background-color: #cbd5e1; font-weight: bold; font-size: 13px;">
                    <td colspan="6" style="text-align: right; padding: 10px; color: #0f172a;">TOTALS:</td>
                    <td class="money" style="font-size: 13px; color: #0f172a;">₹${totalSalary.toLocaleString('en-IN')}</td>
                    <td colspan="6"></td>
                    <td class="money" style="font-size: 13px; color: #15803d;">₹${totalPayable.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                    <td colspan="3"></td>
                </tr>
            </table>
        </body>
        </html>
        `;

        const blob = new Blob([tableHtml], { type: 'application/vnd.ms-excel;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `Employee_Payment_Report_${month}.xls`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const exportPaymentReportToCSV = () => {
        const month = reportMonthFilter;
        const reportRows = employees.filter(emp => {
            const monthData = getMonthlyPayment(emp, month);
            const matchesSearch = emp.name?.toLowerCase().includes(reportSearchQuery.toLowerCase()) || emp.empId?.toLowerCase().includes(reportSearchQuery.toLowerCase());
            const matchesMode = reportPaymentModeFilter === 'All' || monthData.paymentMode === reportPaymentModeFilter;
            const matchesStatus = reportPaymentStatusFilter === 'All' || monthData.paymentStatus === reportPaymentStatusFilter;
            const matchesFood = reportFoodFilter === 'All' || emp.foodAllowance === reportFoodFilter;
            const isHidden = emp.showInPaymentReport === false;
            return matchesSearch && matchesMode && matchesStatus && matchesFood && !isHidden;
        });

        const headers = ['SR. NO.', 'Month', 'Employee ID', 'Name', 'Bank A/C No', 'IFSC Code', 'Monthly Salary (INR)', 'Total Days', 'Present', 'Absent', 'Per Day Salary', 'UPAD', 'Incentive', 'Payable Salary', 'Payment Mode', 'Payment Status', 'Employee Status'];
        const rows = reportRows.map((emp, idx) => {
            const monthData = getMonthlyPayment(emp, month);
            const totalDays = getDaysInMonth(month);
            const salary = parseFloat(emp.salary || 0);
            const perDay = totalDays > 0 ? (salary / totalDays) : 0;
            const attCache = attendanceCache[`${emp._id}_${month}`];
            const present = attCache ? attCache.present : (monthData.presentDays ?? totalDays);
            const absent = attCache ? attCache.absent : (monthData.absentDays ?? 0);
            const upad = monthData.upad ?? 0;
            const incentive = monthData.incentive ?? 0;
            const payable = (perDay * present) - upad + incentive;
            return [
                idx + 1,
                month,
                emp.empId || '',
                emp.name || '',
                emp.bankDetails?.accountNumber || '',
                emp.bankDetails?.ifscCode || '',
                salary,
                totalDays,
                present,
                absent,
                perDay.toFixed(2),
                upad,
                incentive,
                payable.toFixed(2),
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

    const exportBankExcel = () => {
        const month = reportMonthFilter;
        const reportRows = employees.filter(emp => {
            const monthData = getMonthlyPayment(emp, month);
            const matchesSearch = emp.name?.toLowerCase().includes(reportSearchQuery.toLowerCase()) || emp.empId?.toLowerCase().includes(reportSearchQuery.toLowerCase());
            const matchesMode = reportPaymentModeFilter === 'All' || monthData.paymentMode === reportPaymentModeFilter;
            const matchesStatus = reportPaymentStatusFilter === 'All' || monthData.paymentStatus === reportPaymentStatusFilter;
            const matchesFood = reportFoodFilter === 'All' || emp.foodAllowance === reportFoodFilter;
            const isHidden = emp.showInPaymentReport === false;
            return matchesSearch && matchesMode && matchesStatus && matchesFood && !isHidden;
        });

        const validRows = reportRows.filter(emp => emp.bankDetails?.accountNumber);
        if (validRows.length === 0) {
            toast({
                title: "No Data",
                description: "No employees with bank details found in the current filtered list.",
                status: "warning",
                duration: 3000,
                position: "bottom-right",
                isClosable: true
            });
            return;
        }

        toast({
            title: "Exporting Bank Excel",
            description: `Exporting bank details for ${validRows.length} employees.`,
            status: "info",
            duration: 2000,
            position: "bottom-right",
            isClosable: true
        });

        // Format date as DD-MM-YYYY
        const today = new Date();
        const valueDate = today.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-');

        const debitAccount = '201000478211';

        // Helper to get short month name
        const getMonthName = (monthStr) => {
            if (!monthStr) return '';
            const [y, m] = monthStr.split('-');
            const date = new Date(y, parseInt(m) - 1, 1);
            return date.toLocaleString('en-US', { month: 'short' }).toUpperCase();
        };
        const getYear = (monthStr) => {
            if (!monthStr) return '';
            return monthStr.split('-')[0];
        };

        const yearMonth = month.replace('-', '');
        const narration = `Salary for ${getMonthName(month)} ${getYear(month)}`.slice(0, 20);

        const headersList = [
            { name: 'Transaction Type', width: 130, align: 'left' },
            { name: 'Beneficiary Code', width: 120, align: 'left' },
            { name: 'Value Date', width: 100, align: 'left' },
            { name: 'Debit A/C Number', width: 140, align: 'left' },
            { name: 'Transaction Amount', width: 130, align: 'left' },
            { name: 'Beneficiary Name', width: 180, align: 'left' },
            { name: 'Beneficiary A/c No.', width: 150, align: 'center' },
            { name: 'IFSC Code', width: 110, align: 'center' },
            { name: 'Bene Email ID', width: 180, align: 'left' },
            { name: 'bene Mobile No', width: 120, align: 'left' },
            { name: 'Customer Ref No.', width: 130, align: 'left' },
            { name: 'Payment Narration', width: 180, align: 'left' }
        ];

        let tableHtml = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
        <head>
            <meta charset="utf-8" />
            <style>
                table { border-collapse: collapse; width: 100%; font-family: Calibri, Arial, sans-serif; }
                th { background-color: #C55A11; color: #FFFFFF; font-weight: bold; border: 1px solid #7F7F7F; text-align: left; font-size: 11pt; padding: 12px 10px; white-space: normal; }
                td { border: 1px solid #7F7F7F; font-size: 11pt; padding: 8px 10px; vertical-align: middle; white-space: nowrap; color: #000000; text-align: left; }
                .text { mso-number-format:"\\@"; }
            </style>
        </head>
        <body>
            <table>
                <thead>
                    <tr>
                        ${headersList.map(h => `<th width="${h.width}" style="background-color: #C55A11; color: #FFFFFF; font-weight: bold; padding: 12px 10px; border: 1px solid #7F7F7F; text-align: ${h.align}; font-size: 11pt; white-space: normal;">${h.name}</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
        `;

        validRows.forEach((emp) => {
            const monthData = getMonthlyPayment(emp, month);
            const totalDays = getDaysInMonth(month);
            const salary = parseFloat(emp.salary || 0);
            const perDay = totalDays > 0 ? (salary / totalDays) : 0;
            const attCache = attendanceCache[`${emp._id}_${month}`];
            const present = attCache ? attCache.present : (monthData.presentDays ?? totalDays);
            const upad = monthData.upad ?? 0;
            const incentive = monthData.incentive ?? 0;
            const payable = (perDay * present) - upad + incentive;
            const amount = Math.round(payable);

            const bankAccount = emp.bankDetails?.accountNumber || '';
            const ifsc = emp.bankDetails?.ifscCode || '';
            const cleanEmpId = (emp.empId || '').replace(/[^a-zA-Z0-9]/g, '');
            const customerRef = `${yearMonth}${cleanEmpId}`.slice(0, 15);

            let txType = 'N';
            if (ifsc.toUpperCase().startsWith('INDB')) {
                txType = 'I';
            } else if (amount >= 200000) {
                txType = 'R';
            } else {
                txType = 'N';
            }

            let cleanPhone = emp.phone ? emp.phone.replace(/\D/g, '') : '';
            if (cleanPhone.startsWith('0')) {
                cleanPhone = cleanPhone.substring(1);
            }
            if (cleanPhone && !cleanPhone.startsWith('91')) {
                cleanPhone = '91' + cleanPhone;
            }
            cleanPhone = cleanPhone.slice(0, 12);

            const emailVal = emp.email ? emp.email.slice(0, 70) : '';

            tableHtml += `
                <tr>
                    <td>${txType}</td>
                    <td></td>
                    <td class="text">${valueDate}</td>
                    <td class="text">${debitAccount}</td>
                    <td style="font-weight: bold;" class="text">${amount}</td>
                    <td>${(emp.name || '').toUpperCase().slice(0, 35)}</td>
                    <td style="text-align: center;" class="text">${bankAccount}</td>
                    <td style="text-align: center;" class="text">${ifsc}</td>
                    <td>${emailVal}</td>
                    <td class="text">${cleanPhone}</td>
                    <td class="text">${customerRef}</td>
                    <td>${narration}</td>
                </tr>
            `;
        });

        tableHtml += `
                </tbody>
            </table>
        </body>
        </html>
        `;

        const blob = new Blob([tableHtml], { type: 'application/vnd.ms-excel;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `salary.xls`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const UpadInputCell = ({ empId, initialUpad, onSave }) => {
        const [val, setVal] = useState(initialUpad ?? 0);

        useEffect(() => {
            setVal(initialUpad ?? 0);
        }, [initialUpad]);

        const handleBlurOrSubmit = () => {
            const numVal = parseFloat(val) || 0;
            if (numVal !== (initialUpad ?? 0)) {
                onSave(empId, 'upad', numVal);
            }
        };

        return (
            <VStack spacing={1} align="center">
                <Text fontSize="9px" color="purple.600" fontWeight="extrabold" letterSpacing="0.5px">UPAD (₹)</Text>
                <Input
                    size="sm"
                    h="28px"
                    w="85px"
                    textAlign="center"
                    fontWeight="bold"
                    fontSize="xs"
                    color="purple.800"
                    bg="purple.50"
                    borderColor="purple.200"
                    borderRadius="lg"
                    _hover={{ borderColor: "purple.400", bg: "purple.100" }}
                    _focus={{ borderColor: "purple.600", bg: "white", boxShadow: "0 0 0 1px #805AD5" }}
                    value={val}
                    onChange={(e) => setVal(e.target.value)}
                    onBlur={handleBlurOrSubmit}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.target.blur();
                        }
                    }}
                />
            </VStack>
        );
    };

    const IncentiveInputCell = ({ empId, initialIncentive, onSave }) => {
        const [val, setVal] = useState(initialIncentive ?? 0);

        useEffect(() => {
            setVal(initialIncentive ?? 0);
        }, [initialIncentive]);

        const handleBlurOrSubmit = () => {
            const numVal = parseFloat(val) || 0;
            if (numVal !== (initialIncentive ?? 0)) {
                onSave(empId, 'incentive', numVal);
            }
        };

        return (
            <VStack spacing={1} align="center">
                <Text fontSize="9px" color="green.600" fontWeight="extrabold" letterSpacing="0.5px">INCENTIVE (₹)</Text>
                <Input
                    size="sm"
                    h="28px"
                    w="85px"
                    textAlign="center"
                    fontWeight="bold"
                    fontSize="xs"
                    color="green.800"
                    bg="green.50"
                    borderColor="green.200"
                    borderRadius="lg"
                    _hover={{ borderColor: "green.400", bg: "green.100" }}
                    _focus={{ borderColor: "green.600", bg: "white", boxShadow: "0 0 0 1px #38A169" }}
                    value={val}
                    onChange={(e) => setVal(e.target.value)}
                    onBlur={handleBlurOrSubmit}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.target.blur();
                        }
                    }}
                />
            </VStack>
        );
    };

    const handleUpdatePaymentField = async (employeeId, field, value) => {
        try {
            const res = await api.put(`/employee-master/${employeeId}/monthly-payment`, {
                month: reportMonthFilter,
                [field]: value
            });
            if (res.data.success) {
                toast.closeAll();
                toast({
                    title: "Updated",
                    description: field === 'upad' ? `UPAD saved as ₹${value.toLocaleString()}` : field === 'incentive' ? `Incentive saved as ₹${value.toLocaleString()}` : `Payment details updated.`,
                    status: "success",
                    duration: 1500,
                    position: "bottom-right",
                    isClosable: true
                });
                fetchEmployees();
            }
        } catch (error) {
            toast.closeAll();
            toast({ title: "Error", description: error.response?.data?.message || "Failed to update record", status: "error", duration: 3000, position: "bottom-right" });
        }
    };

    return (
        <Box py={{ base: 3, md: 5 }} bg="gray.100" minH="100vh">
            <Container maxW="100%" px={{ base: 2, md: 4 }}>
                <Card variant="elevated" borderRadius="2xl" boxShadow="xl" bg="white" overflow="hidden">
                    <Box bgGradient="linear(to-r, blue.700, blue.600)" p={{ base: 4, md: 6 }} color="white">
                        <Stack direction={{ base: "column", md: "row" }} justify="space-between" align={{ base: "stretch", md: "center" }} spacing={4}>
                            <Box>
                                <HStack spacing={2.5}>
                                    <Icon as={FaUserTie} fontSize={{ base: "xl", md: "2xl" }} color="blue.200" />
                                    <Heading size={{ base: "md", md: "lg" }}>{editId ? 'Edit Employee' : 'Employee Master'}</Heading>
                                </HStack>
                                <Text opacity={0.85} fontSize={{ base: "xs", md: "sm" }} mt={1}>
                                    Manage company employee records, documents & payouts
                                </Text>
                            </Box>
                            <Flex direction={{ base: "column", sm: "row" }} align="center" gap={2} w={{ base: "full", md: "auto" }}>
                                <Input
                                    bg="white"
                                    color="gray.800"
                                    placeholder="Search Name, ID, Phone..."
                                    size="sm"
                                    borderRadius="xl"
                                    w={{ base: "full", sm: "220px", md: "260px" }}
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
                                <Button
                                    colorScheme="green"
                                    size="sm"
                                    w={{ base: "full", sm: "auto" }}
                                    leftIcon={<Icon as={FaPlus} />}
                                    onClick={() => {
                                        handleSelectEmployee({ target: { value: '' } });
                                        const formIdx = tabConfig.findIndex(t => t.id === 'form');
                                        if (formIdx !== -1) setEmployeeActiveTab(formIdx);
                                    }}
                                    borderRadius="xl"
                                    fontWeight="bold"
                                    shadow="md"
                                >
                                    Add New
                                </Button>
                            </Flex>
                        </Stack>
                    </Box>
                    <CardBody p={{ base: 3, md: 5 }}>
                        {tabConfig.length === 0 ? (
                            <Center py={14} bg="white" borderRadius="2xl" border="1px dashed" borderColor="gray.200">
                                <VStack spacing={3}>
                                    <Icon as={FaUserTie} w={10} h={10} color="orange.400" />
                                    <Text fontSize="md" fontWeight="bold" color="gray.600">No Authorized Sections Available</Text>
                                    <Text fontSize="xs" color="gray.400">Please contact your administrator to grant access to employee master features.</Text>
                                </VStack>
                            </Center>
                        ) : (
                            <Tabs index={employeeActiveTab} onChange={(idx) => setEmployeeActiveTab(idx)} colorScheme="blue" variant="soft-rounded">
                                <TabList
                                    mb={6}
                                    overflowX="auto"
                                    py={2}
                                    px={{ base: 2, md: 3 }}
                                    bg="gray.50"
                                    borderRadius="2xl"
                                    border="1px solid"
                                    borderColor="gray.200"
                                    display="flex"
                                    justifyContent={{ base: "flex-start", md: "center" }}
                                    whiteSpace="nowrap"
                                    sx={{
                                        WebkitOverflowScrolling: 'touch',
                                        '&::-webkit-scrollbar': { display: 'none' },
                                        scrollbarWidth: 'none'
                                    }}
                                >
                                    {tabConfig.map((tab) => (
                                        <Tab
                                            key={tab.id}
                                            fontWeight="bold"
                                            fontSize={{ base: "xs", md: "sm" }}
                                            borderRadius="xl"
                                            px={{ base: 4, md: 6 }}
                                            py={{ base: 2, md: 2.5 }}
                                            flexShrink={0}
                                            _selected={{ color: 'white', bg: 'blue.600', shadow: 'md' }}
                                        >
                                            {tab.label}
                                        </Tab>
                                    ))}
                                </TabList>

                                <TabPanels>
                                    {/* ── Tab 1: Form ── */}
                                    {tabConfig.some(t => t.id === 'form') && (
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
                            )}

                                {/* ── Tab 2: View (List) ── */}
                                {tabConfig.some(t => t.id === 'view') && (
                                    <TabPanel p={0}>
                                        <Box mt={2}>
                                            {/* Controls Header: Sub-tabs + View Switcher */}
                                            <Flex
                                                direction={{ base: "column", md: "row" }}
                                                justify="space-between"
                                                align={{ base: "stretch", md: "center" }}
                                                mb={5}
                                                gap={3}
                                                bg="white"
                                                p={{ base: 3, md: 4 }}
                                                borderRadius="2xl"
                                                border="1px solid"
                                                borderColor="gray.200"
                                                shadow="xs"
                                            >
                                                {/* Sub-tabs: Active vs Deactive */}
                                                <HStack spacing={2} overflowX="auto" pb={{ base: 1, md: 0 }}>
                                                    <Button
                                                        size="sm"
                                                        borderRadius="xl"
                                                        colorScheme={employeeViewSubTab === 'active' ? 'blue' : 'gray'}
                                                        variant={employeeViewSubTab === 'active' ? 'solid' : 'ghost'}
                                                        onClick={() => setEmployeeViewSubTab('active')}
                                                        leftIcon={<Icon as={FaCheckCircle} />}
                                                        shadow={employeeViewSubTab === 'active' ? 'sm' : 'none'}
                                                        fontSize="xs"
                                                        fontWeight="bold"
                                                        px={4}
                                                    >
                                                        Active ({activeEmployeesCount})
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        borderRadius="xl"
                                                        colorScheme={employeeViewSubTab === 'deactive' ? 'red' : 'gray'}
                                                        variant={employeeViewSubTab === 'deactive' ? 'solid' : 'ghost'}
                                                        onClick={() => setEmployeeViewSubTab('deactive')}
                                                        leftIcon={<Icon as={FaTimes} />}
                                                        shadow={employeeViewSubTab === 'deactive' ? 'sm' : 'none'}
                                                        fontSize="xs"
                                                        fontWeight="bold"
                                                        px={4}
                                                    >
                                                        Deactive ({deactiveEmployeesCount})
                                                    </Button>
                                                </HStack>

                                                {/* Right: View Switcher (1 -> Cards, 2 -> Table) */}
                                                <Flex justify={{ base: "space-between", md: "flex-end" }} align="center" gap={3}>
                                                    <Text fontSize="xs" fontWeight="bold" color="gray.500" display={{ base: "block", sm: "none" }}>
                                                        View Mode:
                                                    </Text>
                                                    <HStack spacing={1} bg="gray.100" p={1} borderRadius="xl" border="1px solid" borderColor="gray.200">
                                                        <Button
                                                            size="sm"
                                                            borderRadius="lg"
                                                            colorScheme={viewMode === 'card' ? 'blue' : 'gray'}
                                                            variant={viewMode === 'card' ? 'solid' : 'ghost'}
                                                            onClick={() => setViewMode('card')}
                                                            leftIcon={<Icon as={FaThLarge} />}
                                                            fontSize="xs"
                                                            fontWeight="bold"
                                                            px={3.5}
                                                            shadow={viewMode === 'card' ? 'sm' : 'none'}
                                                        >
                                                            📱 Cards
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            borderRadius="lg"
                                                            colorScheme={viewMode === 'table' ? 'blue' : 'gray'}
                                                            variant={viewMode === 'table' ? 'solid' : 'ghost'}
                                                            onClick={() => setViewMode('table')}
                                                            leftIcon={<Icon as={FaList} />}
                                                            fontSize="xs"
                                                            fontWeight="bold"
                                                            px={3.5}
                                                            shadow={viewMode === 'table' ? 'sm' : 'none'}
                                                        >
                                                            📊 Table
                                                        </Button>
                                                    </HStack>
                                                </Flex>
                                            </Flex>

                                            {/* Option 1: Card View */}
                                            {viewMode === 'card' ? (
                                                <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} spacing={{ base: 3.5, md: 4 }}>
                                                    {filteredEmployees.map(emp => {
                                                        const isDeactive = emp.status === 'Deactive';
                                                        return (
                                                            <Card
                                                                key={emp._id}
                                                                borderRadius="2xl"
                                                                border="1.5px solid"
                                                                borderColor={isDeactive ? "red.200" : "gray.200"}
                                                                bg={isDeactive ? "red.50" : "white"}
                                                                _hover={{ shadow: 'lg', borderColor: isDeactive ? "red.400" : "blue.400", transform: 'translateY(-2px)' }}
                                                                transition="all 0.2s"
                                                                overflow="hidden"
                                                            >
                                                                <CardBody p={4}>
                                                                    {/* Header: Avatar + Name + ID + Status */}
                                                                    <Flex justify="space-between" align="flex-start" mb={3}>
                                                                        <HStack spacing={3} align="center" flex={1} mr={2}>
                                                                            <Avatar
                                                                                size="md"
                                                                                src={emp.photo ? getFileUrl(emp.photo) : undefined}
                                                                                name={emp.name}
                                                                                borderRadius="xl"
                                                                                border="2px solid"
                                                                                borderColor={isDeactive ? "red.400" : "blue.500"}
                                                                            />
                                                                            <Box flex={1} minW={0}>
                                                                                <Text fontWeight="black" fontSize="sm" color="gray.800" isTruncated>
                                                                                    {emp.name}
                                                                                </Text>
                                                                                <HStack spacing={1.5} mt={0.5} wrap="wrap">
                                                                                    <Badge colorScheme="blue" fontSize="9px" borderRadius="md" px={1.5}>
                                                                                        {emp.empId || 'EMP'}
                                                                                    </Badge>
                                                                                    {emp.designation && (
                                                                                        <Badge colorScheme="purple" variant="subtle" fontSize="9px" borderRadius="md" px={1.5} isTruncated maxW="120px">
                                                                                            {emp.designation}
                                                                                        </Badge>
                                                                                    )}
                                                                                </HStack>
                                                                            </Box>
                                                                        </HStack>
                                                                        <Badge
                                                                            colorScheme={isDeactive ? "red" : "green"}
                                                                            variant="solid"
                                                                            fontSize="9px"
                                                                            borderRadius="full"
                                                                            px={2}
                                                                            py={0.5}
                                                                        >
                                                                            {isDeactive ? 'Deactive' : 'Active'}
                                                                        </Badge>
                                                                    </Flex>

                                                                    {/* Details Grid */}
                                                                    <Box bg={isDeactive ? "white" : "gray.50"} p={2.5} borderRadius="xl" border="1px solid" borderColor={isDeactive ? "red.100" : "gray.100"} mb={3.5}>
                                                                        <SimpleGrid columns={2} spacing={2} mb={2}>
                                                                            <Box>
                                                                                <Text fontSize="9px" color="gray.400" fontWeight="bold">SALARY</Text>
                                                                                <Text fontSize="xs" fontWeight="black" color="green.700">
                                                                                    ₹{parseFloat(emp.salary || 0).toLocaleString()}/mo
                                                                                </Text>
                                                                            </Box>
                                                                            <Box>
                                                                                <Text fontSize="9px" color="gray.400" fontWeight="bold">FOOD ALLOWANCE</Text>
                                                                                <Text fontSize="10px" fontWeight="bold" color="gray.700">
                                                                                    {emp.foodAllowance === 'Without Food' ? '🚫 No Food' : '🍱 Food Inc.'}
                                                                                </Text>
                                                                            </Box>
                                                                        </SimpleGrid>
                                                                        <VStack align="stretch" spacing={1} pt={1} borderTop="1px dashed" borderColor="gray.200">
                                                                            {emp.phone && (
                                                                                <HStack fontSize="xs" color="gray.700" as="a" href={`tel:${emp.phone}`} _hover={{ color: "blue.600" }}>
                                                                                    <Icon as={FaPhoneAlt} color="blue.500" w={3} h={3} />
                                                                                    <Text fontSize="11px" fontWeight="medium">{emp.phone}</Text>
                                                                                </HStack>
                                                                            )}
                                                                            {emp.email && (
                                                                                <HStack fontSize="xs" color="gray.700" as="a" href={`mailto:${emp.email}`} _hover={{ color: "blue.600" }}>
                                                                                    <Icon as={FaEnvelope} color="blue.500" w={3} h={3} />
                                                                                    <Text fontSize="11px" fontWeight="medium" isTruncated>{emp.email}</Text>
                                                                                </HStack>
                                                                            )}
                                                                            {emp.bankDetails?.accountNumber && (
                                                                                <HStack fontSize="10px" color="gray.500">
                                                                                    <Text fontWeight="bold">🏦 A/C:</Text>
                                                                                    <Text fontFamily="mono">{emp.bankDetails.accountNumber}</Text>
                                                                                </HStack>
                                                                            )}
                                                                        </VStack>
                                                                    </Box>

                                                                    {/* Actions Footer */}
                                                                    <Flex justify="space-between" align="center" gap={2} pt={1}>
                                                                        <Button
                                                                            size="xs"
                                                                            colorScheme="teal"
                                                                            variant="solid"
                                                                            borderRadius="lg"
                                                                            leftIcon={<Icon as={FaEye} />}
                                                                            onClick={() => setViewEmployee(emp)}
                                                                            flex={1}
                                                                            h="30px"
                                                                            fontSize="11px"
                                                                            fontWeight="bold"
                                                                        >
                                                                            View
                                                                        </Button>
                                                                        <Button
                                                                            size="xs"
                                                                            colorScheme="blue"
                                                                            variant="solid"
                                                                            borderRadius="lg"
                                                                            leftIcon={<Icon as={FaEdit} />}
                                                                            onClick={() => handleSelectEmployee({ target: { value: emp._id } })}
                                                                            flex={1}
                                                                            h="30px"
                                                                            fontSize="11px"
                                                                            fontWeight="bold"
                                                                        >
                                                                            Edit
                                                                        </Button>
                                                                        <IconButton
                                                                            size="xs"
                                                                            colorScheme="red"
                                                                            variant="ghost"
                                                                            borderRadius="lg"
                                                                            icon={<Icon as={FaTrash} />}
                                                                            onClick={() => handleDelete(emp._id)}
                                                                            aria-label="Delete employee"
                                                                            h="30px"
                                                                            w="30px"
                                                                        />
                                                                    </Flex>
                                                                </CardBody>
                                                            </Card>
                                                        );
                                                    })}
                                                </SimpleGrid>
                                            ) : (
                                                /* Option 2: Table View */
                                                <Box overflow="hidden" w="full" bg="white" borderRadius="2xl" boxShadow="sm" border="1px solid" borderColor="gray.200">
                                                    <TableContainer overflowX="auto" sx={{ WebkitOverflowScrolling: 'touch' }}>
                                                        <Table variant="simple" size="sm">
                                                            <Thead bg="gray.50">
                                                                <Tr>
                                                                    <Th fontSize="10px" fontWeight="black" color="gray.600">ID</Th>
                                                                    <Th fontSize="10px" fontWeight="black" color="gray.600">EMPLOYEE</Th>
                                                                    <Th fontSize="10px" fontWeight="black" color="gray.600">DESIGNATION</Th>
                                                                    <Th fontSize="10px" fontWeight="black" color="gray.600">PHONE</Th>
                                                                    <Th fontSize="10px" fontWeight="black" color="gray.600">FOOD</Th>
                                                                    <Th fontSize="10px" fontWeight="black" color="gray.600" textAlign="center">ACTIONS</Th>
                                                                </Tr>
                                                            </Thead>
                                                            <Tbody>
                                                                {filteredEmployees.map((emp, idx) => {
                                                                    return (
                                                                        <Tr key={emp._id} bg={idx % 2 === 0 ? "white" : "gray.50"} _hover={{ bg: "blue.50" }} transition="background 0.2s">
                                                                            <Td fontWeight="bold" color="blue.600" fontSize="xs">{emp.empId || 'EMP'}</Td>
                                                                            <Td>
                                                                                <HStack spacing={2.5}>
                                                                                    <Avatar size="xs" src={emp.photo ? getFileUrl(emp.photo) : undefined} name={emp.name} />
                                                                                    <Box>
                                                                                        <Text fontWeight="bold" fontSize="xs" color="gray.800">{emp.name}</Text>
                                                                                        {emp.email && <Text fontSize="10px" color="gray.500">{emp.email}</Text>}
                                                                                    </Box>
                                                                                </HStack>
                                                                            </Td>
                                                                            <Td>
                                                                                {emp.designation ? (
                                                                                    <Badge colorScheme="purple" variant="subtle" borderRadius="full" px={2} fontSize="10px">
                                                                                        {emp.designation}
                                                                                    </Badge>
                                                                                ) : (
                                                                                    <Text fontSize="10px" color="gray.400">—</Text>
                                                                                )}
                                                                            </Td>
                                                                            <Td fontSize="xs" fontWeight="medium">{emp.phone || '—'}</Td>
                                                                            <Td>
                                                                                <Badge colorScheme={emp.foodAllowance === 'Without Food' ? 'gray' : 'green'} fontSize="9px" borderRadius="md">
                                                                                    {emp.foodAllowance === 'Without Food' ? 'No Food' : 'Food'}
                                                                                </Badge>
                                                                            </Td>
                                                                            <Td textAlign="center">
                                                                                <HStack justify="center" spacing={1.5}>
                                                                                    <IconButton aria-label="View" size="xs" colorScheme="teal" variant="solid" borderRadius="lg" icon={<Icon as={FaEye} />} onClick={() => setViewEmployee(emp)} />
                                                                                    <IconButton aria-label="Edit" size="xs" colorScheme="blue" variant="solid" borderRadius="lg" icon={<Icon as={FaEdit} />} onClick={() => handleSelectEmployee({ target: { value: emp._id } })} />
                                                                                    <IconButton aria-label="Delete" size="xs" colorScheme="red" variant="ghost" borderRadius="lg" icon={<Icon as={FaTrash} />} onClick={() => handleDelete(emp._id)} />
                                                                                </HStack>
                                                                            </Td>
                                                                        </Tr>
                                                                    );
                                                                })}
                                                            </Tbody>
                                                        </Table>
                                                    </TableContainer>
                                                </Box>
                                            )}

                                            {filteredEmployees.length === 0 && (
                                                <Center p={10} bg="white" borderRadius="2xl" border="1px dashed" borderColor="gray.200" mt={3}>
                                                    <VStack spacing={2}>
                                                        <Icon as={FaUsers} w={8} h={8} color="gray.300" />
                                                        <Text color="gray.500" fontSize="sm" fontWeight="medium">No employees found matching "{searchQuery}"</Text>
                                                    </VStack>
                                                </Center>
                                            )}
                                        </Box>
                                    </TabPanel>
                                )}

                                {/* ── Tab 3: Payment Report ── */}
                                {tabConfig.some(t => t.id === 'payment') && (
                                    <TabPanel p={0}>
                                    {(() => {
                                        const reportFiltered = employees.filter(emp => {
                                            const monthData = getMonthlyPayment(emp, reportMonthFilter);
                                            const matchesSearch = emp.name?.toLowerCase().includes(reportSearchQuery.toLowerCase()) || emp.empId?.toLowerCase().includes(reportSearchQuery.toLowerCase());
                                            const matchesMode = reportPaymentModeFilter === 'All' || monthData.paymentMode === reportPaymentModeFilter;
                                            const matchesPayStatus = reportPaymentStatusFilter === 'All' || monthData.paymentStatus === reportPaymentStatusFilter;
                                            const matchesFood = reportFoodFilter === 'All' || emp.foodAllowance === reportFoodFilter;
                                            const isHidden = emp.showInPaymentReport === false;
                                            return matchesSearch && matchesMode && matchesPayStatus && matchesFood && !isHidden;
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
                                                        <Text fontSize="10px" fontWeight="black" opacity={0.8} textTransform="uppercase">Staff Status</Text>
                                                        <Heading size="md" mt={1}>✅ {employees.filter(e => e.status === 'Active').length} Active</Heading>
                                                        <Text fontSize="10px" opacity={0.8} mt={1}>❌ Deactive: {employees.filter(e => e.status === 'Deactive').length} | Total: {employees.length}</Text>
                                                    </Box>
                                                </SimpleGrid>

                                                {/* Filter Bar */}
                                                <Box bg="gray.50" p={4} borderRadius="2xl" border="1px solid" borderColor="gray.100">
                                                    <Text fontSize="xs" fontWeight="bold" color="gray.500" mb={3} textTransform="uppercase">🔍 Filter & Export — {reportMonthFilter}</Text>
                                                    <SimpleGrid columns={{ base: 2, md: 5 }} spacing={3} alignItems="flex-end">
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
                                                    </SimpleGrid>
                                                    <HStack mt={3} spacing={2.5} justify="flex-end" wrap="wrap">
                                                        <Button leftIcon={<Icon as={FaFileExcel} />} colorScheme="green" variant="solid" borderRadius="xl" onClick={exportPaymentReportToExcel} size="sm" shadow="sm">
                                                            Export Colorful Excel (.xls)
                                                        </Button>
                                                        <Button leftIcon={<Icon as={FaFileExcel} />} colorScheme="orange" variant="solid" borderRadius="xl" onClick={exportBankExcel} size="sm" shadow="sm">
                                                            Download salary.xls
                                                        </Button>
                                                        <Button leftIcon={<Icon as={FaCopy} />} colorScheme="blue" variant="outline" borderRadius="xl" onClick={exportPaymentReportToCSV} size="sm">
                                                            Export CSV
                                                        </Button>
                                                        <Button leftIcon={<Icon as={FaPrint} />} colorScheme="purple" variant="solid" borderRadius="xl" onClick={() => window.print()} size="sm">
                                                            Print
                                                        </Button>
                                                    </HStack>
                                                </Box>

                                                {/* Integrated Table & Footer Container */}
                                                <Box bg="white" borderRadius="2xl" border="1px solid" borderColor="gray.200" boxShadow="sm" overflow="hidden">
                                                    <Box overflowX="auto" w="full" sx={{
                                                        '&::-webkit-scrollbar': { height: '8px' },
                                                        '&::-webkit-scrollbar-track': { bg: 'gray.50' },
                                                        '&::-webkit-scrollbar-thumb': { bg: 'blue.200', borderRadius: 'full' },
                                                        '&::-webkit-scrollbar-thumb:hover': { bg: 'blue.300' }
                                                    }}>
                                                        <Table variant="simple" size="sm" sx={{ 'th, td': { px: { base: 2, md: 2.5 }, py: 3 } }}>
                                                            <Thead>
                                                                <Tr bgGradient="linear(to-r, blue.600, blue.800)">
                                                                    <Th color="white" py={4} fontSize="10px" whiteSpace="nowrap">#</Th>
                                                                    <Th color="white" py={4} fontSize="10px" whiteSpace="nowrap">EMPLOYEE</Th>
                                                                    <Th color="white" py={4} fontSize="10px" whiteSpace="nowrap">BANK ACCOUNT DETAILS</Th>
                                                                    <Th color="white" py={4} fontSize="10px" whiteSpace="nowrap">SALARY / DAYS</Th>
                                                                    <Th color="white" py={4} fontSize="10px" textAlign="center" whiteSpace="nowrap">PRESENT</Th>
                                                                    <Th color="white" py={4} fontSize="10px" textAlign="center" whiteSpace="nowrap">PENDING</Th>
                                                                    <Th color="white" py={4} fontSize="10px" textAlign="center" whiteSpace="nowrap">ABSENT</Th>
                                                                    <Th color="white" py={4} fontSize="10px" textAlign="center" whiteSpace="nowrap">UPAD</Th>
                                                                    <Th color="white" py={4} fontSize="10px" textAlign="center" whiteSpace="nowrap">INCENTIVE</Th>
                                                                    <Th color="white" py={4} fontSize="10px" isNumeric whiteSpace="nowrap">PAYABLE</Th>
                                                                    <Th color="white" py={4} fontSize="10px" whiteSpace="nowrap">PAY TYPE</Th>
                                                                    <Th color="white" py={4} fontSize="10px" whiteSpace="nowrap">STATUS</Th>
                                                                </Tr>
                                                            </Thead>
                                                            <Tbody>
                                                                {reportFiltered.length === 0 ? (
                                                                    <Tr>
                                                                        <Td colSpan={12} textAlign="center" py={10} color="gray.400">
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
                                                                    const totalDays = getDaysInMonth(reportMonthFilter);
                                                                    const salary = parseFloat(emp.salary || 0);
                                                                    const perDay = totalDays > 0 ? salary / totalDays : 0;
                                                                    const upad = monthData.upad ?? 0;
                                                                    const incentive = monthData.incentive ?? 0;
                                                                    // Pull from real attendance cache
                                                                    const attCache = attendanceCache[`${emp._id}_${reportMonthFilter}`];
                                                                    const present = attCache ? attCache.present : null;
                                                                    const pending = attCache ? attCache.pending : null;
                                                                    const absent = attCache ? attCache.absent : null;
                                                                    const effectivePresent = present !== null ? present : totalDays;
                                                                    const payable = (perDay * effectivePresent) - upad + incentive;
                                                                    return (
                                                                        <Tr key={emp._id} bg={rowBg} _hover={{ bg: isDone ? 'green.100' : isDeactive ? 'red.100' : 'blue.50' }} transition="background 0.15s" onClick={() => handleRowClick(emp)} cursor="pointer">
                                                                            <Td fontSize="xs" fontWeight="bold" color="gray.500" whiteSpace="nowrap">{idx + 1}</Td>
                                                                            {/* Employee */}
                                                                            <Td py={3}>
                                                                                <HStack spacing={2.5}>
                                                                                    <Avatar size="sm" src={emp.photo?.url ? `${API_BASE_URL}${emp.photo.url}` : undefined} name={emp.name} />
                                                                                    <VStack align="start" spacing={0.5}>
                                                                                        <HStack spacing={1.5} wrap="wrap">
                                                                                            <Text fontSize="xs" fontWeight="bold" color="gray.800">{emp.name}</Text>
                                                                                            <Badge colorScheme="blue" variant="subtle" fontSize="9px">{emp.empId}</Badge>
                                                                                            {isDeactive ? (
                                                                                                <HStack spacing={1}>
                                                                                                    <Badge colorScheme="red" variant="solid" fontSize="8px" px={1.5} borderRadius="sm">Deactive</Badge>
                                                                                                    <Button size="xs" colorScheme={emp.showInPaymentReport !== false ? 'green' : 'gray'} variant="outline" height="18px" fontSize="9px" px={2} onClick={(e) => { e.stopPropagation(); handleToggleShowInReport(emp._id, emp.showInPaymentReport === false ? true : false); }}>
                                                                                                        {emp.showInPaymentReport !== false ? 'Hide from Report' : 'Show in Report'}
                                                                                                    </Button>
                                                                                                </HStack>
                                                                                            ) : null}
                                                                                        </HStack>
                                                                                        {emp.phone && <Text fontSize="10px" color="gray.500">📱 {emp.phone}</Text>}
                                                                                    </VStack>
                                                                                </HStack>
                                                                            </Td>
                                                                            {/* Bank Details */}
                                                                            <Td py={3}>
                                                                                {emp.bankDetails?.accountNumber || emp.bankDetails?.ifscCode ? (
                                                                                    <Box bg="whiteAlpha.800" p={2} borderRadius="lg" border="1px solid" borderColor="gray.200" minW="140px" shadow="2xs">
                                                                                        {emp.bankDetails?.bankName && (
                                                                                            <Text fontSize="10px" fontWeight="800" color="blue.600" textTransform="uppercase" mb={0.5}>
                                                                                                🏦 {emp.bankDetails.bankName}
                                                                                            </Text>
                                                                                        )}
                                                                                        <Text fontSize="xs" fontFamily="mono" fontWeight="800" color="gray.800" letterSpacing="0.5px">
                                                                                            A/C: {emp.bankDetails?.accountNumber || '—'}
                                                                                        </Text>
                                                                                        {emp.bankDetails?.ifscCode && (
                                                                                            <Badge colorScheme="purple" variant="subtle" fontSize="9px" borderRadius="sm" mt={1}>
                                                                                                IFSC: {emp.bankDetails.ifscCode}
                                                                                            </Badge>
                                                                                        )}
                                                                                    </Box>
                                                                                ) : (
                                                                                    <Badge colorScheme="orange" variant="subtle" fontSize="10px" py={1} px={2} borderRadius="md">
                                                                                        ⚠️ No Bank Details
                                                                                    </Badge>
                                                                                )}
                                                                            </Td>
                                                                            {/* Salary Breakdown */}
                                                                            <Td py={3}>
                                                                                <VStack align="stretch" spacing={1} minW="95px">
                                                                                    <HStack justify="space-between">
                                                                                        <Text fontSize="9px" color="gray.400" fontWeight="bold">SALARY</Text>
                                                                                        <Text fontSize="xs" fontWeight="black" color="green.700">₹{salary.toLocaleString()}</Text>
                                                                                    </HStack>
                                                                                    <HStack justify="space-between">
                                                                                        <Text fontSize="9px" color="gray.400" fontWeight="bold">TOTAL DAYS</Text>
                                                                                        <Badge colorScheme="gray" variant="subtle" fontSize="9px">{totalDays}d</Badge>
                                                                                    </HStack>
                                                                                    <HStack justify="space-between">
                                                                                        <Text fontSize="9px" color="gray.400" fontWeight="bold">PER DAY</Text>
                                                                                        <Text fontSize="xs" fontWeight="bold" color="blue.600">₹{perDay.toFixed(1)}</Text>
                                                                                    </HStack>
                                                                                </VStack>
                                                                            </Td>
                                                                            {/* Present — from real attendance */}
                                                                            <Td py={3} textAlign="center">
                                                                                {attendanceLoading ? (
                                                                                    <Badge colorScheme="gray" variant="subtle" fontSize="9px">…</Badge>
                                                                                ) : present !== null ? (
                                                                                    <Badge colorScheme="green" variant="solid" fontSize="xs" px={2.5} py={0.5} borderRadius="md">
                                                                                        {present}
                                                                                    </Badge>
                                                                                ) : (
                                                                                    <Badge colorScheme="gray" variant="outline" fontSize="9px">No Data</Badge>
                                                                                )}
                                                                            </Td>
                                                                            {/* Pending — from real attendance */}
                                                                            <Td py={3} textAlign="center">
                                                                                {attendanceLoading ? (
                                                                                    <Badge colorScheme="gray" variant="subtle" fontSize="9px">…</Badge>
                                                                                ) : isDeactive ? (
                                                                                    <Badge colorScheme="red" variant="solid" fontSize="xs" px={2.5} py={0.5} borderRadius="md">Deactive</Badge>
                                                                                ) : pending !== null ? (
                                                                                    <Badge colorScheme="orange" variant="solid" fontSize="xs" px={2.5} py={0.5} borderRadius="md">
                                                                                        {pending}
                                                                                    </Badge>
                                                                                ) : (
                                                                                    <Badge colorScheme="gray" variant="outline" fontSize="9px">No Data</Badge>
                                                                                )}
                                                                            </Td>
                                                                            {/* Absent — from real attendance */}
                                                                            <Td py={3} textAlign="center">
                                                                                {attendanceLoading ? (
                                                                                    <Badge colorScheme="gray" variant="subtle" fontSize="9px">…</Badge>
                                                                                ) : absent !== null ? (
                                                                                    <Badge colorScheme={absent > 0 ? 'red' : 'green'} variant="solid" fontSize="xs" px={2.5} py={0.5} borderRadius="md">
                                                                                        {absent}
                                                                                    </Badge>
                                                                                ) : (
                                                                                    <Badge colorScheme="gray" variant="outline" fontSize="9px">No Data</Badge>
                                                                                )}
                                                                            </Td>
                                                                            {/* UPAD - editable */}
                                                                            <Td py={3} onClick={(e) => e.stopPropagation()}>
                                                                                <UpadInputCell empId={emp._id} initialUpad={upad} onSave={handleUpdatePaymentField} />
                                                                            </Td>
                                                                            {/* INCENTIVE - editable */}
                                                                            <Td py={3} onClick={(e) => e.stopPropagation()}>
                                                                                <IncentiveInputCell empId={emp._id} initialIncentive={incentive} onSave={handleUpdatePaymentField} />
                                                                            </Td>
                                                                            {/* Payable */}
                                                                            <Td py={3} isNumeric>
                                                                                <VStack align="flex-end" spacing={0.5}>
                                                                                    <Text fontSize="9px" color="gray.400" fontWeight="bold">PAYABLE</Text>
                                                                                    <Text fontSize="sm" fontWeight="black" color={isDone ? 'green.600' : 'orange.600'}>
                                                                                        ₹{payable.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                                                                    </Text>
                                                                                </VStack>
                                                                            </Td>
                                                                            {/* Pay Mode */}
                                                                            <Td whiteSpace="nowrap" onClick={(e) => e.stopPropagation()}>
                                                                                <Select
                                                                                    size="xs"
                                                                                    borderRadius="lg"
                                                                                    value={monthData.paymentMode}
                                                                                    onChange={(e) => handleUpdatePaymentField(emp._id, 'paymentMode', e.target.value)}
                                                                                    onClick={(e) => e.stopPropagation()}
                                                                                    w="90px"
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
                                                                            {/* Pay Status */}
                                                                            <Td whiteSpace="nowrap" onClick={(e) => e.stopPropagation()}>
                                                                                <Select
                                                                                    size="xs"
                                                                                    borderRadius="lg"
                                                                                    value={monthData.paymentStatus}
                                                                                    onChange={(e) => handleUpdatePaymentField(emp._id, 'paymentStatus', e.target.value)}
                                                                                    onClick={(e) => e.stopPropagation()}
                                                                                    w="100px"
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
                                                                        </Tr>
                                                                    );
                                                                })}
                                                            </Tbody>
                                                        </Table>
                                                    </Box>

                                                    {reportFiltered.length > 0 && (
                                                        <Box bg="blue.50" p={3.5} borderTop="1px solid" borderColor="blue.100">
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
                                                </Box>
                                            </VStack>
                                        );
                                    })()}
                                </TabPanel>
                            )}

                            {/* ── Tab 4: Admin Login Report ── */}
                            {tabConfig.some(t => t.id === 'adminReport') && (
                                <TabPanel pt={6}>
                                    <AdminLoginReportView />
                                </TabPanel>
                            )}

                            </TabPanels>
                        </Tabs>
                    )}

                        {/* Standardized Employee View Modal */}
                        <Modal isOpen={!!viewEmployee} onClose={() => setViewEmployee(null)} size="4xl" isCentered motionPreset="slideInBottom">
                            <ModalOverlay backdropFilter="blur(8px) grayscale(40%)" bg="blackAlpha.600" />
                            <ModalContent borderRadius="3xl" overflow="hidden" boxShadow="2xl" border="1px solid" borderColor="whiteAlpha.300" m={{ base: 3, md: 6 }}>
                                <ModalHeader p={0}>
                                    <Box bgGradient="linear(to-r, blue.800, blue.600)" p={{ base: 4, md: 6 }} color="white">
                                        <HStack justify="space-between" spacing={4}>
                                            <HStack spacing={3}>
                                                <Avatar
                                                    size="lg"
                                                    src={viewEmployee?.photo ? getFileUrl(viewEmployee.photo) : undefined}
                                                    name={viewEmployee?.name}
                                                    borderRadius="xl"
                                                    border="2px solid white"
                                                />
                                                <VStack align="start" spacing={0.5}>
                                                    <Heading size="md">{viewEmployee?.name}</Heading>
                                                    <Text fontSize="xs" opacity={0.8}>{viewEmployee?.empId} • {viewEmployee?.designation || 'Employee'}</Text>
                                                </VStack>
                                            </HStack>
                                            <ModalCloseButton position="static" borderRadius="full" />
                                        </HStack>
                                    </Box>
                                </ModalHeader>

                                <ModalBody p={{ base: 4, md: 8 }}>
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
                                                    <Text fontSize="11px" fontWeight="black" color="purple.500" textTransform="uppercase" mb={3}>KYC & Bank Documents</Text>
                                                    <Wrap spacing={2.5}>
                                                        {[
                                                            { field: 'aadharCard', label: 'AADHAAR', icon: FaIdCard, color: 'purple' },
                                                            { field: 'panCard', label: 'PAN CARD', icon: FaIdCard, color: 'blue' },
                                                            { field: 'voterId', label: 'VOTER ID', icon: FaIdBadge, color: 'teal' },
                                                            { field: 'drivingLicense', label: 'LICENSE', icon: FaCar, color: 'green' }
                                                        ].map(({ field, label, icon: DocIcon, color }) => {
                                                            const docData = viewEmployee[field];
                                                            const docUrl = getFileUrl(docData);
                                                            if (!docUrl) return null;
                                                            return (
                                                                <Button
                                                                    key={field}
                                                                    as="a"
                                                                    href={docUrl}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    size="xs"
                                                                    colorScheme={color}
                                                                    variant="solid"
                                                                    leftIcon={<Icon as={DocIcon} />}
                                                                    rightIcon={<Icon as={FaExternalLinkAlt} fontSize="8px" />}
                                                                    borderRadius="lg"
                                                                    fontWeight="bold"
                                                                    px={3}
                                                                    py={2}
                                                                    shadow="xs"
                                                                    _hover={{ transform: 'translateY(-1px)', shadow: 'sm' }}
                                                                    onClick={(e) => {
                                                                        if (window.innerWidth < 768) {
                                                                            e.preventDefault();
                                                                            window.open(docUrl, '_blank', 'noopener,noreferrer');
                                                                        }
                                                                    }}
                                                                >
                                                                    {label}
                                                                </Button>
                                                            );
                                                        })}
                                                        {/* Bank Documents if any */}
                                                        {Array.isArray(viewEmployee.bankDocuments) && viewEmployee.bankDocuments.map((doc, idx) => {
                                                            const docUrl = getFileUrl(doc);
                                                            if (!docUrl) return null;
                                                            return (
                                                                <Button
                                                                    key={`bank-doc-${idx}`}
                                                                    as="a"
                                                                    href={docUrl}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    size="xs"
                                                                    colorScheme="orange"
                                                                    variant="solid"
                                                                    leftIcon={<Icon as={FaFilePdf} />}
                                                                    rightIcon={<Icon as={FaExternalLinkAlt} fontSize="8px" />}
                                                                    borderRadius="lg"
                                                                    fontWeight="bold"
                                                                    px={3}
                                                                    py={2}
                                                                    shadow="xs"
                                                                    _hover={{ transform: 'translateY(-1px)', shadow: 'sm' }}
                                                                    onClick={(e) => {
                                                                        if (window.innerWidth < 768) {
                                                                            e.preventDefault();
                                                                            window.open(docUrl, '_blank', 'noopener,noreferrer');
                                                                        }
                                                                    }}
                                                                >
                                                                    BANK DOC {idx + 1}
                                                                </Button>
                                                            );
                                                        })}
                                                        {!viewEmployee.aadharCard && !viewEmployee.panCard && !viewEmployee.voterId && !viewEmployee.drivingLicense && (!viewEmployee.bankDocuments || viewEmployee.bankDocuments.length === 0) && (
                                                            <Text fontSize="xs" color="gray.400" fontStyle="italic">
                                                                No KYC documents uploaded for this employee.
                                                            </Text>
                                                        )}
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

                        {/* Date-Wise Attendance Detail Modal */}
                        <Modal isOpen={!!selectedReportEmployee} onClose={() => setSelectedReportEmployee(null)} size="3xl" isCentered motionPreset="slideInBottom">
                            <ModalOverlay backdropFilter="blur(8px) grayscale(40%)" bg="blackAlpha.600" />
                            <ModalContent borderRadius="3xl" overflow="hidden" boxShadow="2xl" border="1px solid" borderColor="whiteAlpha.300">
                                <ModalHeader p={0}>
                                    <Box bgGradient="linear(to-r, purple.800, purple.600)" p={6} color="white">
                                        <HStack justify="space-between" spacing={4}>
                                            <HStack spacing={4}>
                                                <Avatar
                                                    size="md"
                                                    src={selectedReportEmployee?.photo?.url ? `${API_BASE_URL}${selectedReportEmployee.photo.url}` : undefined}
                                                    name={selectedReportEmployee?.name}
                                                    borderRadius="xl"
                                                    border="2px solid white"
                                                />
                                                <VStack align="start" spacing={0}>
                                                    <Heading size="sm">Attendance Detail: {selectedReportEmployee?.name}</Heading>
                                                    <Text fontSize="xs" opacity={0.8}>{selectedReportEmployee?.empId} • {reportMonthFilter}</Text>
                                                </VStack>
                                            </HStack>
                                            <ModalCloseButton position="static" borderRadius="full" />
                                        </HStack>
                                    </Box>
                                </ModalHeader>

                                <ModalBody p={6} maxH="60vh" overflowY="auto">
                                    {attendanceDetailLoading ? (
                                        <Center py={10}>
                                            <VStack spacing={3}>
                                                <Spinner size="xl" color="purple.500" thickness="4px" />
                                                <Text color="gray.500" fontSize="sm" fontWeight="bold">Fetching attendance records...</Text>
                                            </VStack>
                                        </Center>
                                    ) : (
                                        <Table variant="simple" size="sm">
                                            <Thead>
                                                <Tr bg="gray.100">
                                                    <Th fontSize="10px">DATE</Th>
                                                    <Th fontSize="10px">DAY</Th>
                                                    <Th fontSize="10px">ATTENDANCE</Th>
                                                    <Th fontSize="10px">SITES WORKED</Th>
                                                    <Th fontSize="10px">REMARK / NOTES</Th>
                                                </Tr>
                                            </Thead>
                                            <Tbody>
                                                {attendanceDetailList.length === 0 ? (
                                                    <Tr>
                                                        <Td colSpan={5} textAlign="center" py={6} color="gray.400">
                                                            No logs found for this month.
                                                        </Td>
                                                    </Tr>
                                                ) : (
                                                    attendanceDetailList.map((row) => {
                                                        const att = row.attendance;
                                                        const scheme = att === 'Present' ? 'green' : 
                                                                       att === 'Absent' ? 'red' : 
                                                                       att === 'Half Day' ? 'orange' : 
                                                                       att === 'Scheduled' ? 'blue' : 'gray';
                                                        return (
                                                            <Tr key={row.date} _hover={{ bg: "gray.50" }} transition="background 0.1s">
                                                                <Td fontSize="xs" fontWeight="semibold">{row.date.split('-')[2]}-{row.date.split('-')[1]}-{row.date.split('-')[0]}</Td>
                                                                <Td fontSize="xs" fontWeight="semibold" color="gray.600">{row.dayName}</Td>
                                                                <Td>
                                                                    <Badge colorScheme={scheme} variant="solid" fontSize="10px" px={2} py={0.5} borderRadius="md">
                                                                        {att}
                                                                    </Badge>
                                                                </Td>
                                                                <Td fontSize="xs" maxW="200px" isTruncated title={row.sites}>{row.sites || '—'}</Td>
                                                                <Td fontSize="xs" color="gray.600" maxW="250px" isTruncated title={row.remark}>{row.remark}</Td>
                                                            </Tr>
                                                        );
                                                    })
                                                )}
                                            </Tbody>
                                        </Table>
                                    )}
                                </ModalBody>
                                <ModalFooter bg="gray.50" justify="flex-end">
                                    <Button colorScheme="purple" px={10} borderRadius="full" shadow="lg" onClick={() => setSelectedReportEmployee(null)}>Close</Button>
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
        panCard: '',
        clientAddress: '',
        pincode: '',
        state: '',
        gstNo: '',
        msmeNo: ''
    });
    const [contactNumbers, setContactNumbers] = useState(['']);
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
            setFormData({ clientName: '', email: '', contactPersonName: '', panCard: '', clientAddress: '', pincode: '', state: '', gstNo: '', msmeNo: '' });
            setContactNumbers(['']);
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
                panCard: c.panCard || '',
                clientAddress: c.clientAddress || '',
                pincode: c.pincode || '',
                state: c.state || '',
                gstNo: c.gstNo || '',
                msmeNo: c.msmeNo || ''
            });
            setContactNumbers(c.contactNumbers?.length > 0 ? c.contactNumbers : (c.contactPerson?.phone ? [c.contactPerson.phone] : ['']));
            setActiveTab(0);
            window.scrollTo({ top: 0, behavior: 'smooth' });
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
                setFormData({ clientName: '', email: '', contactPersonName: '', panCard: '', clientAddress: '', pincode: '', state: '', gstNo: '', msmeNo: '' });
                setContactNumbers(['']);
                fetchNextId();
            }
        } catch (err) {
            toast({ title: 'Error', description: err.response?.data?.message || 'Delete failed', status: 'error', duration: 3000 });
        }
    };

    const handleContactNumberChange = (index, value) => {
        const newNumbers = [...contactNumbers];
        newNumbers[index] = value;
        setContactNumbers(newNumbers);
    };
    const addContactNumber = () => setContactNumbers([...contactNumbers, '']);
    const removeContactNumber = (index) => setContactNumbers(contactNumbers.filter((_, i) => i !== index));

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
                uploadData.append(key, formData[key] || '');
            });
            uploadData.append('contactNumbers', JSON.stringify(contactNumbers.filter(n => n.trim() !== '')));
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
                setFormData({ clientName: '', email: '', contactPersonName: '', panCard: '', clientAddress: '', pincode: '', state: '', gstNo: '', msmeNo: '' });
                setContactNumbers(['']);
                setFiles({ gstCert: null, msmeCert: null });
                setEditId('');
                fetchNextId();
                fetchClients();
            }
        } catch (error) {
            toast({ title: "Error", description: error.response?.data?.message || "Failed to save record", status: "error", duration: 3000 });
        } finally {
            setIsLoading(false);
        }
    };

    const FileUploadButton = ({ label, field, icon }) => (
        <FormControl>
            <FormLabel fontWeight="bold" fontSize="xs">{label}</FormLabel>
            <Box
                p={4} border="2px dashed" borderColor={files[field] ? "green.200" : "orange.200"}
                borderRadius="xl" bg={files[field] ? "green.50" : "orange.50"} textAlign="center" cursor="pointer"
                onClick={() => document.getElementById(`${field}-client-upload`).click()}
                _hover={{ bg: "orange.100", borderColor: "orange.400" }}
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
        <Box py={{ base: 4, md: 8 }} bg="gray.100" minH="100vh">
            <Container maxW="container.xl" px={{ base: 2, md: 4 }}>
                <Card variant="elevated" borderRadius="2xl" boxShadow="xl" bg="white" overflow="hidden" border="1px solid" borderColor="gray.200">
                    <Box bgGradient="linear(to-r, orange.700, orange.600)" p={{ base: 4, md: 6 }} color="white">
                        <Stack direction={{ base: "column", md: "row" }} justify="space-between" align={{ base: "stretch", md: "center" }} spacing={4}>
                            <Box>
                                <Heading size={{ base: "md", md: "lg" }} display="flex" alignItems="center">
                                    <Icon as={FaHandshake} mr={3} /> {editId ? 'Edit Client Record' : 'Client Master'}
                                </Heading>
                                <Text fontSize={{ base: "xs", md: "sm" }} opacity={0.85} mt={1}>
                                    Enterprise accounts, statutory documents, GST & contact management
                                </Text>
                            </Box>
                            <HStack w={{ base: "full", md: "auto" }} spacing={2}>
                                <Input
                                    bg="white"
                                    color="gray.800"
                                    placeholder="Search Client, ID, Phone..."
                                    size="sm"
                                    borderRadius="xl"
                                    w={{ base: "full", md: "260px" }}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                <Button
                                    size="sm"
                                    colorScheme="green"
                                    leftIcon={<Icon as={FaUserTie} />}
                                    flexShrink={0}
                                    onClick={() => {
                                        handleSelectClient({ target: { value: '' } });
                                        setActiveTab(0);
                                    }}
                                    borderRadius="xl"
                                >
                                    + Add New
                                </Button>
                            </HStack>
                        </Stack>
                    </Box>

                    <CardBody p={{ base: 3, md: 8 }}>
                        <Tabs index={activeTab} onChange={(idx) => setActiveTab(idx)} colorScheme="orange" variant="soft-rounded">
                            <TabList
                                mb={6}
                                overflowX="auto"
                                overflowY="hidden"
                                whiteSpace="nowrap"
                                py={2}
                                px={1}
                                bg="gray.50"
                                borderRadius="2xl"
                                border="1px solid"
                                borderColor="gray.200"
                                sx={{
                                    WebkitOverflowScrolling: 'touch',
                                    scrollbarWidth: 'none',
                                    '&::-webkit-scrollbar': { display: 'none' }
                                }}
                            >
                                <Tab fontWeight="bold" fontSize="sm" borderRadius="xl" px={{ base: 4, md: 6 }} py={2.5} _selected={{ color: 'white', bg: 'orange.600', shadow: 'md' }}>
                                    {editId ? '✏️ Edit Form' : '📋 Register Form'}
                                </Tab>
                                <Tab fontWeight="bold" fontSize="sm" borderRadius="xl" px={{ base: 4, md: 6 }} py={2.5} _selected={{ color: 'white', bg: 'orange.600', shadow: 'md' }}>
                                    👔 View Clients ({clients.length})
                                </Tab>
                            </TabList>

                            <TabPanels>
                                <TabPanel p={0}>
                                    <form onSubmit={handleSubmit} onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}>
                                        <HStack justify="space-between" align="flex-start" mb={4}>
                                            <VStack align="start" spacing={0.5}>
                                                <Heading size="sm" color="gray.700">Client Details</Heading>
                                                <Text fontSize="xs" color="gray.500">Fill in the basic client information</Text>
                                            </VStack>
                                            <HStack bg="orange.50" p={2} borderRadius="xl" border="1px dashed" borderColor="orange.300">
                                                <Icon as={FaFingerprint} color="orange.500" />
                                                <Text fontSize="xs" fontWeight="bold" color="orange.700">Ref: {nextId || 'Generating...'}</Text>
                                            </HStack>
                                        </HStack>

                                        <VStack spacing={6} align="stretch">
                                            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                                                <FormControl isRequired>
                                                    <FormLabel fontWeight="bold" fontSize="sm">Client Name</FormLabel>
                                                    <HStack bg="gray.50" p={1} borderRadius="xl" border="1px solid" borderColor="gray.200">
                                                        <Icon as={FaIdBadge} ml={3} color="orange.500" />
                                                        <Input name="clientName" variant="unstyled" p={2} placeholder="Company Name" value={formData.clientName} onChange={handleChange} />
                                                    </HStack>
                                                </FormControl>
                                                <FormControl>
                                                    <FormLabel fontWeight="bold" fontSize="sm">Billing Email Address</FormLabel>
                                                    <HStack bg="gray.50" p={1} borderRadius="xl" border="1px solid" borderColor="gray.200">
                                                        <Icon as={FaEnvelope} ml={3} color="orange.500" />
                                                        <Input name="email" type="email" variant="unstyled" p={2} placeholder="accounts@client.com" value={formData.email} onChange={handleChange} />
                                                    </HStack>
                                                </FormControl>
                                            </SimpleGrid>

                                            <FormControl>
                                                <FormLabel fontWeight="bold" fontSize="sm">Client Address</FormLabel>
                                                <HStack bg="gray.50" p={1} borderRadius="xl" border="1px solid" borderColor="gray.200">
                                                    <Icon as={FaMapMarkerAlt} ml={3} color="orange.500" />
                                                    <Input name="clientAddress" variant="unstyled" p={2} placeholder="Full address" value={formData.clientAddress} onChange={handleChange} />
                                                </HStack>
                                            </FormControl>

                                            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                                                <FormControl>
                                                    <FormLabel fontWeight="bold" fontSize="sm">Pincode</FormLabel>
                                                    <HStack bg="gray.50" p={1} borderRadius="xl" border="1px solid" borderColor="gray.200">
                                                        <Icon as={FaMapMarkerAlt} ml={3} color="orange.500" />
                                                        <Input name="pincode" variant="unstyled" p={2} placeholder="380015" value={formData.pincode || ''} onChange={handleChange} />
                                                    </HStack>
                                                </FormControl>
                                                <FormControl>
                                                    <FormLabel fontWeight="bold" fontSize="sm">State</FormLabel>
                                                    <HStack bg="gray.50" p={1} borderRadius="xl" border="1px solid" borderColor="gray.200">
                                                        <Icon as={FaGlobe} ml={3} color="orange.500" />
                                                        <Input name="state" variant="unstyled" p={2} placeholder="Gujarat" value={formData.state || ''} onChange={handleChange} />
                                                    </HStack>
                                                </FormControl>
                                            </SimpleGrid>

                                            <Divider />

                                            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
                                                <FormControl>
                                                    <FormLabel fontWeight="bold" fontSize="sm">GST Number</FormLabel>
                                                    <Input name="gstNo" placeholder="24AAAAA0000A1Z5" value={formData.gstNo || ''} onChange={handleChange} borderRadius="xl" size="md" />
                                                </FormControl>
                                                <FormControl>
                                                    <FormLabel fontWeight="bold" fontSize="sm">PAN Card</FormLabel>
                                                    <Input name="panCard" placeholder="ABCDE1234F" value={formData.panCard || ''} onChange={handleChange} borderRadius="xl" size="md" />
                                                </FormControl>
                                                <FormControl>
                                                    <FormLabel fontWeight="bold" fontSize="sm">MSME Number</FormLabel>
                                                    <Input name="msmeNo" placeholder="UDYAM-XX-00-0000000" value={formData.msmeNo || ''} onChange={handleChange} borderRadius="xl" size="md" />
                                                </FormControl>
                                            </SimpleGrid>

                                            <Divider />

                                            <Box bg="orange.50" p={4} borderRadius="xl" border="1px solid" borderColor="orange.200">
                                                <FormLabel fontWeight="bold" fontSize="sm" color="orange.800">Primary Contact Person</FormLabel>
                                                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                                                    <Input name="contactPersonName" placeholder="Full Name" value={formData.contactPersonName || ''} onChange={handleChange} borderRadius="xl" bg="white" size="md" />
                                                    <VStack align="stretch" spacing={2}>
                                                        {contactNumbers.map((num, i) => (
                                                            <HStack key={i}>
                                                                <Input placeholder="Phone Number" value={num} onChange={(e) => handleContactNumberChange(i, e.target.value)} borderRadius="xl" bg="white" size="md" />
                                                                {i > 0 && <IconButton icon={<FaTrash />} size="sm" colorScheme="red" variant="ghost" onClick={() => removeContactNumber(i)} />}
                                                            </HStack>
                                                        ))}
                                                        <Button size="xs" colorScheme="orange" variant="ghost" onClick={addContactNumber} alignSelf="flex-start">+ Add Phone Number</Button>
                                                    </VStack>
                                                </SimpleGrid>
                                            </Box>

                                            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                                                <FileUploadButton label="GST Certificate (PDF/Image)" field="gstCert" icon={FaFileAlt} />
                                                <FileUploadButton label="MSME Certificate (PDF/Image)" field="msmeCert" icon={FaFileAlt} />
                                            </SimpleGrid>

                                            <Button
                                                size="lg"
                                                colorScheme="orange"
                                                w="full"
                                                borderRadius="xl"
                                                h="50px"
                                                type="submit"
                                                leftIcon={<FaHandshake />}
                                                isLoading={isLoading}
                                                boxShadow="md"
                                            >
                                                {editId ? 'Update Client Record' : 'Save Client Profile'}
                                            </Button>
                                        </VStack>
                                    </form>
                                </TabPanel>

                                <TabPanel p={0}>
                                    <Box mt={2}>
                                        <Flex justify="space-between" align="center" mb={4} wrap="wrap" gap={3}>
                                            <Heading size="sm" color="orange.700" display="flex" alignItems="center">
                                                <Icon as={FaUserTie} mr={2} /> Registered Clients ({filteredClients.length})
                                            </Heading>

                                            <HStack spacing={1} bg="gray.100" p={1} borderRadius="xl" border="1px solid" borderColor="gray.200">
                                                <Button
                                                    size="xs"
                                                    variant={viewMode === 'card' ? 'solid' : 'ghost'}
                                                    colorScheme={viewMode === 'card' ? 'orange' : 'gray'}
                                                    leftIcon={<Icon as={FaThLarge} />}
                                                    borderRadius="lg"
                                                    fontWeight="bold"
                                                    onClick={() => setViewMode('card')}
                                                >
                                                    Cards
                                                </Button>
                                                <Button
                                                    size="xs"
                                                    variant={viewMode === 'table' ? 'solid' : 'ghost'}
                                                    colorScheme={viewMode === 'table' ? 'orange' : 'gray'}
                                                    leftIcon={<Icon as={FaTable} />}
                                                    borderRadius="lg"
                                                    fontWeight="bold"
                                                    onClick={() => setViewMode('table')}
                                                >
                                                    Table
                                                </Button>
                                            </HStack>
                                        </Flex>

                                        {viewMode === 'table' ? (
                                            <Box overflow="hidden" w="full" bg="white" borderRadius="2xl" boxShadow="sm" border="1px solid" borderColor="gray.200">
                                                <TableContainer overflowX="auto" sx={{ WebkitOverflowScrolling: 'touch' }}>
                                                    <Table variant="simple" size="sm">
                                                        <Thead bg="gray.50">
                                                            <Tr>
                                                                <Th fontSize="10px" fontWeight="black" color="gray.600">ID</Th>
                                                                <Th fontSize="10px" fontWeight="black" color="gray.600">CLIENT NAME</Th>
                                                                <Th fontSize="10px" fontWeight="black" color="gray.600">CONTACT PERSON</Th>
                                                                <Th fontSize="10px" fontWeight="black" color="gray.600">PHONE</Th>
                                                                <Th fontSize="10px" fontWeight="black" color="gray.600">GST NO</Th>
                                                                <Th fontSize="10px" fontWeight="black" color="gray.600" textAlign="center">ACTIONS</Th>
                                                            </Tr>
                                                        </Thead>
                                                        <Tbody>
                                                            {filteredClients.map((c, idx) => (
                                                                <Tr key={c._id} bg={idx % 2 === 0 ? "white" : "gray.50"} _hover={{ bg: "orange.50" }} transition="background 0.2s">
                                                                    <Td fontWeight="bold" color="orange.600" fontSize="xs">{c.clientId}</Td>
                                                                    <Td fontWeight="bold" fontSize="xs" color="gray.800">{c.clientName}</Td>
                                                                    <Td fontSize="xs" color="gray.700">{c.contactPersonName || c.contactPerson?.name || '—'}</Td>
                                                                    <Td fontSize="xs" fontWeight="medium">{c.contactPersonPhone || c.contactPerson?.phone || (c.contactNumbers && c.contactNumbers[0]) || '—'}</Td>
                                                                    <Td>
                                                                        {c.gstNo ? (
                                                                            <Badge colorScheme="blue" variant="subtle" borderRadius="md" fontSize="9px">
                                                                                {c.gstNo}
                                                                            </Badge>
                                                                        ) : <Text fontSize="10px" color="gray.400">—</Text>}
                                                                    </Td>
                                                                    <Td textAlign="center">
                                                                        <HStack justify="center" spacing={1.5}>
                                                                            <IconButton aria-label="View" size="xs" colorScheme="teal" variant="solid" borderRadius="lg" icon={<Icon as={FaEye} />} onClick={() => setViewClient(c)} />
                                                                            <IconButton aria-label="Edit" size="xs" colorScheme="blue" variant="solid" borderRadius="lg" icon={<Icon as={FaEdit} />} onClick={() => handleSelectClient({ target: { value: c._id } })} />
                                                                            <IconButton aria-label="Delete" size="xs" colorScheme="red" variant="ghost" borderRadius="lg" icon={<Icon as={FaTrash} />} onClick={() => handleDelete(c._id)} />
                                                                        </HStack>
                                                                    </Td>
                                                                </Tr>
                                                            ))}
                                                        </Tbody>
                                                    </Table>
                                                </TableContainer>
                                            </Box>
                                        ) : (
                                            <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} spacing={4}>
                                                {filteredClients.map(c => {
                                                    const phone = c.contactPersonPhone || c.contactPerson?.phone || (c.contactNumbers && c.contactNumbers[0]) || '';
                                                    return (
                                                        <Card key={c._id} borderRadius="2xl" border="1.5px solid" borderColor="gray.200" bg="white" _hover={{ shadow: 'lg', borderColor: 'orange.400', transform: 'translateY(-2px)' }} transition="all 0.2s" overflow="hidden">
                                                            <CardBody p={4}>
                                                                <HStack spacing={3} mb={3}>
                                                                    <Box p={2.5} bg="orange.50" borderRadius="xl" border="1px solid" borderColor="orange.200">
                                                                        <Icon as={FaUserTie} color="orange.600" w={5} h={5} />
                                                                    </Box>
                                                                    <Box flex={1} minW={0}>
                                                                        <Text fontWeight="black" fontSize="sm" color="gray.800" isTruncated>{c.clientName}</Text>
                                                                        <Badge colorScheme="orange" fontSize="9px" borderRadius="md" px={1.5}>
                                                                            {c.clientId}
                                                                        </Badge>
                                                                    </Box>
                                                                </HStack>

                                                                <Box bg="orange.50" p={2.5} borderRadius="xl" border="1px solid" borderColor="orange.100" mb={3}>
                                                                    <VStack align="stretch" spacing={1.5}>
                                                                        <HStack fontSize="xs" justify="space-between">
                                                                            <Text color="gray.500">Contact:</Text>
                                                                            <Text fontWeight="bold" color="gray.800" isTruncated maxW="150px">{c.contactPersonName || c.contactPerson?.name || '—'}</Text>
                                                                        </HStack>
                                                                        {phone && (
                                                                            <HStack fontSize="xs" justify="space-between">
                                                                                <Text color="gray.500">Phone:</Text>
                                                                                <Text as="a" href={`tel:${phone}`} fontWeight="bold" color="blue.600">{phone}</Text>
                                                                            </HStack>
                                                                        )}
                                                                        {c.email && (
                                                                            <HStack fontSize="xs" justify="space-between">
                                                                                <Text color="gray.500">Email:</Text>
                                                                                <Text as="a" href={`mailto:${c.email}`} color="blue.600" isTruncated maxW="160px">{c.email}</Text>
                                                                            </HStack>
                                                                        )}
                                                                    </VStack>
                                                                </Box>

                                                                <HStack spacing={2} pt={2} borderTop="1px solid" borderColor="gray.100">
                                                                    <Button flex={1} size="xs" colorScheme="teal" variant="solid" borderRadius="lg" leftIcon={<Icon as={FaEye} />} onClick={() => setViewClient(c)}>View</Button>
                                                                    <Button flex={1} size="xs" colorScheme="blue" variant="solid" borderRadius="lg" leftIcon={<Icon as={FaEdit} />} onClick={() => handleSelectClient({ target: { value: c._id } })}>Edit</Button>
                                                                    <IconButton aria-label="Delete" size="xs" colorScheme="red" variant="ghost" borderRadius="lg" icon={<Icon as={FaTrash} />} onClick={() => handleDelete(c._id)} />
                                                                </HStack>
                                                            </CardBody>
                                                        </Card>
                                                    );
                                                })}
                                            </SimpleGrid>
                                        )}

                                        {filteredClients.length === 0 && (
                                            <Center p={8} bg="white" borderRadius="2xl" border="1px dashed" borderColor="gray.200">
                                                <VStack spacing={2}>
                                                    <Icon as={FaUserTie} w={8} h={8} color="gray.300" />
                                                    <Text color="gray.500" fontSize="sm">No clients found matching "{searchQuery}"</Text>
                                                </VStack>
                                            </Center>
                                        )}
                                    </Box>
                                </TabPanel>
                            </TabPanels>
                        </Tabs>
                    </CardBody>
                </Card>
            </Container>

            <Modal isOpen={!!viewClient} onClose={() => setViewClient(null)} size="3xl" isCentered motionPreset="slideInBottom">
                <ModalOverlay backdropFilter="blur(8px) grayscale(40%)" bg="blackAlpha.600" />
                <ModalContent borderRadius="3xl" overflow="hidden" boxShadow="2xl" border="1px solid" borderColor="whiteAlpha.300" m={{ base: 3, md: 6 }}>
                    <ModalHeader p={0}>
                        <Box bgGradient="linear(to-r, orange.800, orange.600)" p={{ base: 4, md: 6 }} color="white">
                            <HStack justify="space-between">
                                <HStack spacing={3}>
                                    <Icon as={FaUserTie} w={7} h={7} />
                                    <VStack align="start" spacing={0}>
                                        <Heading size="md">{viewClient?.clientName}</Heading>
                                        <Text fontSize="xs" opacity={0.85}>{viewClient?.clientId} • Enterprise Client</Text>
                                    </VStack>
                                </HStack>
                                <ModalCloseButton position="static" borderRadius="full" />
                            </HStack>
                        </Box>
                    </ModalHeader>
                    <ModalBody p={{ base: 4, md: 8 }}>
                        {viewClient && (
                            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                                <VStack align="start" spacing={5}>
                                    <Box w="full" bg="orange.50" p={4} borderRadius="2xl" border="1px solid" borderColor="orange.100">
                                        <Text fontSize="10px" fontWeight="black" color="orange.600" textTransform="uppercase" mb={2}>Primary Contact</Text>
                                        <VStack align="start" spacing={2}>
                                            <HStack justify="space-between" w="full">
                                                <Text fontSize="xs" color="gray.600">Person:</Text>
                                                <Text fontSize="xs" fontWeight="bold">{viewClient.contactPersonName || viewClient.contactPerson?.name || 'N/A'}</Text>
                                            </HStack>
                                            <HStack justify="space-between" w="full">
                                                <Text fontSize="xs" color="gray.600">Phone:</Text>
                                                <Text fontSize="xs" fontWeight="bold" color="blue.600">{viewClient.contactNumbers?.length > 0 ? viewClient.contactNumbers.join(', ') : (viewClient.contactPersonPhone || viewClient.contactPerson?.phone || 'N/A')}</Text>
                                            </HStack>
                                            <HStack justify="space-between" w="full">
                                                <Text fontSize="xs" color="gray.600">Email:</Text>
                                                <Text fontSize="xs" fontWeight="bold">{viewClient.email || 'N/A'}</Text>
                                            </HStack>
                                        </VStack>
                                    </Box>

                                    <Box w="full" bg="green.50" p={4} borderRadius="2xl" border="1px solid" borderColor="green.100">
                                        <Text fontSize="10px" fontWeight="black" color="green.600" textTransform="uppercase" mb={2}>Location Details</Text>
                                        <VStack align="start" spacing={1.5}>
                                            <Text fontSize="xs" color="gray.800">{viewClient.clientAddress || 'Address not specified'}</Text>
                                            <HStack spacing={4} pt={1}>
                                                <Text fontSize="xs" color="gray.600">Pincode: <strong>{viewClient.pincode || 'N/A'}</strong></Text>
                                                <Text fontSize="xs" color="gray.600">State: <strong>{viewClient.state || 'N/A'}</strong></Text>
                                            </HStack>
                                        </VStack>
                                    </Box>
                                </VStack>

                                <VStack align="start" spacing={5}>
                                    <Box w="full" bg="blue.50" p={4} borderRadius="2xl" border="1px solid" borderColor="blue.100">
                                        <Text fontSize="10px" fontWeight="black" color="blue.600" textTransform="uppercase" mb={2}>Statutory Identifiers</Text>
                                        <VStack align="start" spacing={2}>
                                            <HStack justify="space-between" w="full"><Text fontSize="xs" color="gray.600">GST Number:</Text><Text fontSize="xs" fontWeight="bold">{viewClient.gstNo || 'N/A'}</Text></HStack>
                                            <HStack justify="space-between" w="full"><Text fontSize="xs" color="gray.600">PAN Card:</Text><Text fontSize="xs" fontWeight="bold">{viewClient.panCard || 'N/A'}</Text></HStack>
                                            <HStack justify="space-between" w="full"><Text fontSize="xs" color="gray.600">MSME Number:</Text><Text fontSize="xs" fontWeight="bold">{viewClient.msmeNo || 'N/A'}</Text></HStack>
                                        </VStack>
                                    </Box>

                                    <Box w="full" bg="purple.50" p={4} borderRadius="2xl" border="1px solid" borderColor="purple.100">
                                        <Text fontSize="10px" fontWeight="black" color="purple.600" textTransform="uppercase" mb={2}>Documents</Text>
                                        <Wrap spacing={2}>
                                            {viewClient.documents?.map((doc, idx) => {
                                                const docUrl = getFileUrl(doc.url);
                                                return (
                                                    <Button
                                                        key={idx}
                                                        as="a"
                                                        href={docUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        size="xs"
                                                        colorScheme="purple"
                                                        variant="solid"
                                                        leftIcon={<Icon as={FaFileAlt} />}
                                                        rightIcon={<Icon as={FaExternalLinkAlt} fontSize="8px" />}
                                                        borderRadius="lg"
                                                        fontWeight="bold"
                                                        onClick={(e) => {
                                                            if (window.innerWidth < 768) {
                                                                e.preventDefault();
                                                                window.open(docUrl, '_blank', 'noopener,noreferrer');
                                                            }
                                                        }}
                                                    >
                                                        {doc.type ? `${doc.type} CERT` : `DOC ${idx + 1}`}
                                                    </Button>
                                                );
                                            })}
                                            {(!viewClient.documents || viewClient.documents.length === 0) && (
                                                <Text fontSize="xs" color="gray.400" fontStyle="italic">No documents uploaded.</Text>
                                            )}
                                        </Wrap>
                                    </Box>
                                </VStack>
                            </SimpleGrid>
                        )}
                    </ModalBody>
                    <ModalFooter bg="gray.50">
                        <Button colorScheme="orange" px={10} borderRadius="full" shadow="md" onClick={() => setViewClient(null)}>Close</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

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
    const [viewMode, setViewMode] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768 ? 'card' : 'table');
    const [activeTab, setActiveTab] = useState(0);

    const [formData, setFormData] = useState({
        client: '',
        siteName: '',
        siteAddress: '',
        siteLocation: '',
        status: 'Active'
    });
    const [ledgerItems, setLedgerItems] = useState([]);
    const [ledgerDetailsMap, setLedgerDetailsMap] = useState({});
    const [currentLedgerForm, setCurrentLedgerForm] = useState({
        editingIndex: null,
        ledger: '',
        shortName: '',
        amount: '',
        hsnSac: ''
    });
    const [ledgerPopup, setLedgerPopup] = useState({ isOpen: false });
    const [contactPersons, setContactPersons] = useState([{ name: '', phone: '' }]);
    const [docs, setDocs] = useState(null);
    const [locationLoading, setLocationLoading] = useState(false);
    const [nextSiteId, setNextSiteId] = useState('');

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
                setClients(cRes.data.data);
            }
            if (eRes.data.success) setEmployees(eRes.data.data);
            if (lRes.data.success) {
                setLedgers(lRes.data.data);
                if (lRes.data.details) setLedgerDetailsMap(lRes.data.details);
            }
            await fetchSites(searchQuery);
        } catch (error) {
            console.error("Error fetching dependencies:", error);
        }
    };

    const handleLedgerNameChange = (name) => {
        const trimmedName = (name || '').trim();
        const caseKey = Object.keys(ledgerDetailsMap).find(k => k.toLowerCase() === trimmedName.toLowerCase());
        const matched = (trimmedName && ledgerDetailsMap[trimmedName]) 
            || (caseKey && ledgerDetailsMap[caseKey])
            || ledgerItems.find(item => item.ledger && item.ledger.trim().toLowerCase() === trimmedName.toLowerCase());

        setCurrentLedgerForm(prev => ({
            ...prev,
            ledger: name,
            shortName: matched?.shortName || '',
            amount: matched?.amount !== undefined && matched?.amount !== null && matched?.amount !== 0 ? matched.amount : '',
            hsnSac: matched?.hsnSac || ''
        }));
    };

    const handleAddOrUpdateLedgerItem = () => {
        if (!currentLedgerForm.ledger || !currentLedgerForm.ledger.trim()) {
            toast({ title: 'Ledger Name required', status: 'warning', duration: 2000 });
            return;
        }
        if (currentLedgerForm.amount === '' || currentLedgerForm.amount === null) {
            toast({ title: 'Amount required', status: 'warning', duration: 2000 });
            return;
        }

        const newItem = {
            ledger: currentLedgerForm.ledger.trim(),
            shortName: currentLedgerForm.shortName.trim(),
            amount: Number(currentLedgerForm.amount),
            hsnSac: currentLedgerForm.hsnSac.trim()
        };

        if (currentLedgerForm.editingIndex !== null) {
            setLedgerItems(prev => {
                const copy = [...prev];
                copy[currentLedgerForm.editingIndex] = newItem;
                return copy;
            });
        } else {
            setLedgerItems(prev => [...prev, newItem]);
        }

        setLedgerDetailsMap(prev => ({
            ...prev,
            [newItem.ledger]: {
                shortName: newItem.shortName,
                amount: newItem.amount,
                hsnSac: newItem.hsnSac
            }
        }));

        if (!ledgers.includes(newItem.ledger)) {
            setLedgers(prev => [...prev, newItem.ledger]);
        }

        setLedgerPopup({ isOpen: false });
        setCurrentLedgerForm({ editingIndex: null, ledger: '', shortName: '', amount: '', hsnSac: '' });
        toast({ title: 'Ledger item added', status: 'success', duration: 2000 });
    };

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
            toast({ title: 'No location set', description: 'Use the GPS button first', status: 'warning', duration: 2000 });
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
            const cleanedLedgers = ledgerItems.filter(li => li.ledger && li.ledger.trim() !== '' && li.amount !== '' && li.amount !== null);
            uploadData.append('ledgerItems', JSON.stringify(cleanedLedgers.map(item => ({
                ledger: item.ledger.trim(),
                shortName: item.shortName ? item.shortName.trim() : '',
                amount: Number(item.amount) || 0,
                hsnSac: item.hsnSac ? item.hsnSac.trim() : ''
            }))));
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
                setLedgerItems([]);
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
        const items = s.ledgerItems?.length > 0 ? s.ledgerItems.map(li => ({
            ledger: li.ledger || '',
            shortName: li.shortName || '',
            amount: li.amount || 0,
            hsnSac: li.hsnSac || ''
        })) : [];
        setLedgerItems(items);
        items.forEach(item => {
            if (item.ledger) {
                setLedgerDetailsMap(prev => ({
                    ...prev,
                    [item.ledger]: {
                        shortName: item.shortName,
                        amount: item.amount,
                        hsnSac: item.hsnSac
                    }
                }));
            }
        });
        setCurrentLedgerForm({ editingIndex: null, ledger: '', shortName: '', amount: '', hsnSac: '' });
        setContactPersons(s.contactPersons?.length > 0 ? s.contactPersons : [{ name: '', phone: '' }]);
        setActiveTab(0);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDeleteSite = async (id) => {
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

    return (
        <Box py={{ base: 4, md: 8 }} bg="gray.100" minH="100vh">
            <Container maxW="container.xl" px={{ base: 2, md: 4 }}>
                <Card variant="elevated" borderRadius="2xl" boxShadow="xl" bg="white" overflow="hidden" border="1px solid" borderColor="gray.200">
                    <Box bgGradient="linear(to-r, teal.700, teal.600)" p={{ base: 4, md: 6 }} color="white">
                        <Stack direction={{ base: "column", md: "row" }} justify="space-between" align={{ base: "stretch", md: "center" }} spacing={4}>
                            <Box>
                                <Heading size={{ base: "md", md: "lg" }} display="flex" alignItems="center">
                                    <Icon as={FaMap} mr={3} /> {editId ? 'Edit Site Record' : 'Site Master'}
                                </Heading>
                                <Text fontSize={{ base: "xs", md: "sm" }} opacity={0.85} mt={1}>
                                    Project sites, GPS locations, client allocations & ledger items
                                </Text>
                            </Box>
                            <HStack w={{ base: "full", md: "auto" }} spacing={2}>
                                <Box position="relative" w={{ base: "full", md: "260px" }}>
                                    <Input
                                        bg="white" 
                                        color="gray.800" 
                                        placeholder="Search Site, Client, Address..." 
                                        size="sm" 
                                        borderRadius="xl"
                                        pl={8}
                                        pr={searchQuery ? 8 : 3}
                                        value={searchQuery} 
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                    <Box position="absolute" left={2.5} top="50%" transform="translateY(-50%)" color="gray.400">
                                        <Icon as={FaSearch} fontSize="xs" />
                                    </Box>
                                    {searchQuery && (
                                        <IconButton
                                            aria-label="Clear search"
                                            icon={<FaTimes />}
                                            size="xs"
                                            variant="ghost"
                                            position="absolute"
                                            right={1}
                                            top="50%"
                                            transform="translateY(-50%)"
                                            color="gray.400"
                                            onClick={() => setSearchQuery('')}
                                        />
                                    )}
                                </Box>
                                <Button
                                    size="sm"
                                    colorScheme="green"
                                    leftIcon={<Icon as={FaMapMarkerAlt} />}
                                    flexShrink={0}
                                    onClick={() => {
                                        setEditId('');
                                        setFormData({ client: '', siteName: '', siteAddress: '', siteLocation: '', status: 'Active' });
                                        setLedgerItems([]);
                                        setContactPersons([{ name: '', phone: '' }]);
                                        setActiveTab(0);
                                    }}
                                    borderRadius="xl"
                                >
                                    + Add New
                                </Button>
                            </HStack>
                        </Stack>
                    </Box>

                    <CardBody p={{ base: 3, md: 8 }}>
                        <Tabs index={activeTab} onChange={(idx) => setActiveTab(idx)} colorScheme="teal" variant="soft-rounded">
                            <TabList
                                mb={6}
                                overflowX="auto"
                                overflowY="hidden"
                                whiteSpace="nowrap"
                                py={2}
                                px={1}
                                bg="gray.50"
                                borderRadius="2xl"
                                border="1px solid"
                                borderColor="gray.200"
                                sx={{
                                    WebkitOverflowScrolling: 'touch',
                                    scrollbarWidth: 'none',
                                    '&::-webkit-scrollbar': { display: 'none' }
                                }}
                            >
                                <Tab fontWeight="bold" fontSize="sm" borderRadius="xl" px={{ base: 4, md: 6 }} py={2.5} _selected={{ color: 'white', bg: 'teal.600', shadow: 'md' }}>
                                    {editId ? '✏️ Edit Form' : '📋 Register Form'}
                                </Tab>
                                <Tab fontWeight="bold" fontSize="sm" borderRadius="xl" px={{ base: 4, md: 6 }} py={2.5} _selected={{ color: 'white', bg: 'teal.600', shadow: 'md' }}>
                                    📍 View Sites ({allSites.length})
                                </Tab>
                            </TabList>

                            <TabPanels>
                                <TabPanel p={0}>
                                    <form onSubmit={handleSubmit} onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}>
                                        <VStack spacing={6} align="stretch">
                                            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                                                <FormControl isRequired>
                                                    <FormLabel fontWeight="bold" fontSize="sm">Select Client</FormLabel>
                                                    <Select name="client" placeholder="Choose Client" value={formData.client} onChange={handleChange} borderRadius="xl" size="md" bg="gray.50">
                                                        {clients.map(c => <option key={c._id} value={c._id}>{c.clientId} - {c.clientName}</option>)}
                                                    </Select>
                                                </FormControl>

                                                <FormControl isRequired>
                                                    <FormLabel fontWeight="bold" fontSize="sm">Site Name</FormLabel>
                                                    <Input name="siteName" placeholder="e.g. Ring Road Project Site" value={formData.siteName} onChange={handleChange} borderRadius="xl" size="md" />
                                                </FormControl>
                                            </SimpleGrid>

                                            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                                                <FormControl>
                                                    <FormLabel fontWeight="bold" fontSize="sm">Site Address</FormLabel>
                                                    <Input name="siteAddress" placeholder="Physical location/address" value={formData.siteAddress} onChange={handleChange} borderRadius="xl" size="md" />
                                                </FormControl>
                                                <FormControl>
                                                    <FormLabel fontWeight="bold" fontSize="sm">Status</FormLabel>
                                                    <Select name="status" value={formData.status} onChange={handleChange} borderRadius="xl" size="md" bg="gray.50">
                                                        <option value="Active">Active</option>
                                                        <option value="Inactive">Inactive</option>
                                                    </Select>
                                                </FormControl>
                                            </SimpleGrid>

                                            <FormControl>
                                                <FormLabel fontWeight="bold" fontSize="sm">Site GPS Coordinates</FormLabel>
                                                <HStack spacing={2}>
                                                    <Input
                                                        name="siteLocation"
                                                        placeholder="Latitude, Longitude (e.g. 23.0225, 72.5714)"
                                                        value={formData.siteLocation}
                                                        onChange={handleChange}
                                                        borderRadius="xl"
                                                        size="md"
                                                    />
                                                    <Button
                                                        type="button"
                                                        colorScheme="teal"
                                                        onClick={handleGetCurrentLocation}
                                                        isLoading={locationLoading}
                                                        borderRadius="xl"
                                                        size="md"
                                                        leftIcon={<Icon as={FaMapMarkerAlt} />}
                                                    >
                                                        GPS
                                                    </Button>
                                                    {formData.siteLocation && (
                                                        <Button
                                                            type="button"
                                                            colorScheme="blue"
                                                            onClick={handleOpenMap}
                                                            borderRadius="xl"
                                                            size="md"
                                                            leftIcon={<Icon as={FaMapMarkedAlt} />}
                                                        >
                                                            Map
                                                        </Button>
                                                    )}
                                                </HStack>
                                            </FormControl>

                                            <Box bg="teal.50" p={4} borderRadius="2xl" border="1px solid" borderColor="teal.200">
                                                <Flex justify="space-between" align="center" mb={3} wrap="wrap" gap={2}>
                                                    <Heading size="xs" color="teal.800" textTransform="uppercase">
                                                        💼 Ledger Accounts & Budget Allocation
                                                    </Heading>
                                                    <Button
                                                        size="xs"
                                                        colorScheme="teal"
                                                        leftIcon={<Icon as={FaPlus} />}
                                                        onClick={() => {
                                                            setCurrentLedgerForm({ editingIndex: null, ledger: '', shortName: '', amount: '', hsnSac: '' });
                                                            setLedgerPopup({ isOpen: true });
                                                        }}
                                                    >
                                                        + New Ledger
                                                    </Button>
                                                </Flex>

                                                <Box bg="white" p={3} borderRadius="xl" border="1px solid" borderColor="teal.200" mb={3}>
                                                    <Select
                                                        placeholder="— Select existing ledger to add —"
                                                        size="sm"
                                                        borderRadius="lg"
                                                        bg="gray.50"
                                                        value=""
                                                        onChange={(e) => {
                                                            const val = e.target.value;
                                                            if (!val) return;
                                                            if (val === '__CREATE_NEW__') {
                                                                setCurrentLedgerForm({ editingIndex: null, ledger: '', shortName: '', amount: '', hsnSac: '' });
                                                                setLedgerPopup({ isOpen: true });
                                                                e.target.value = '';
                                                                return;
                                                            }
                                                            const matched = ledgerDetailsMap[val] || null;
                                                            const newItem = {
                                                                ledger: val,
                                                                shortName: matched?.shortName || '',
                                                                amount: matched?.amount || 0,
                                                                hsnSac: matched?.hsnSac || ''
                                                            };
                                                            setLedgerItems(prev => [...prev, newItem]);
                                                            toast({ title: `Ledger "${val}" added`, status: 'success', duration: 2000 });
                                                            e.target.value = '';
                                                        }}
                                                    >
                                                        <option value="__CREATE_NEW__">➕ Create New Ledger</option>
                                                        <option disabled>──────────────────</option>
                                                        {Array.from(new Set([
                                                            ...ledgers,
                                                            ...ledgerItems.map(item => item.ledger).filter(Boolean)
                                                        ])).map((l, i) => <option key={i} value={l}>{l}</option>)}
                                                    </Select>
                                                </Box>

                                                {ledgerItems.length > 0 && (
                                                    <VStack spacing={1} align="stretch">
                                                        {ledgerItems.map((item, idx) => (
                                                            <Flex key={idx} bg="white" p={2} borderRadius="lg" align="center" gap={2} border="1px solid" borderColor="gray.100">
                                                                <Text flex={1} fontSize="xs" fontWeight="bold" color="gray.800">{item.ledger}</Text>
                                                                <Input
                                                                    w="100px"
                                                                    size="xs"
                                                                    type="number"
                                                                    fontWeight="bold"
                                                                    color="teal.700"
                                                                    textAlign="right"
                                                                    bg="teal.50"
                                                                    borderRadius="md"
                                                                    value={item.amount}
                                                                    onChange={(e) => setLedgerItems(prev => {
                                                                        const copy = [...prev];
                                                                        copy[idx] = { ...copy[idx], amount: e.target.value };
                                                                        return copy;
                                                                    })}
                                                                />
                                                                <IconButton
                                                                    icon={<FaEdit />}
                                                                    aria-label="Edit ledger"
                                                                    size="xs"
                                                                    colorScheme="blue"
                                                                    variant="ghost"
                                                                    onClick={() => {
                                                                        setCurrentLedgerForm({
                                                                            editingIndex: idx,
                                                                            ledger: item.ledger || '',
                                                                            shortName: item.shortName || '',
                                                                            amount: item.amount || '',
                                                                            hsnSac: item.hsnSac || ''
                                                                        });
                                                                        setLedgerPopup({ isOpen: true });
                                                                    }}
                                                                />
                                                                <IconButton
                                                                    icon={<FaTrash />}
                                                                    aria-label="Remove ledger"
                                                                    size="xs"
                                                                    colorScheme="red"
                                                                    variant="ghost"
                                                                    onClick={() => setLedgerItems(prev => prev.filter((_, i) => i !== idx))}
                                                                />
                                                            </Flex>
                                                        ))}
                                                    </VStack>
                                                )}
                                            </Box>

                                            <Box bg="blue.50" p={4} borderRadius="2xl" border="1px solid" borderColor="blue.100">
                                                <Flex justify="space-between" align="center" mb={3} wrap="wrap" gap={2}>
                                                    <Heading size="xs" color="blue.800" textTransform="uppercase">
                                                        👥 Site Contact Persons
                                                    </Heading>
                                                    <Button size="xs" colorScheme="blue" onClick={() => addArrayItem(setContactPersons, { name: '', phone: '' })}>+ Add Person</Button>
                                                </Flex>
                                                <VStack spacing={2} align="stretch">
                                                    {contactPersons.map((cp, idx) => (
                                                        <HStack key={idx} bg="white" p={2} borderRadius="lg" gap={2}>
                                                            <Input size="sm" placeholder="Full Name" value={cp.name} onChange={(e) => handleArrayChange(setContactPersons, idx, 'name', e.target.value)} />
                                                            <Input size="sm" placeholder="Phone Number" value={cp.phone} onChange={(e) => handleArrayChange(setContactPersons, idx, 'phone', e.target.value)} />
                                                            <IconButton size="sm" colorScheme="red" variant="ghost" icon={<FaTrash />} onClick={() => removeArrayItem(setContactPersons, idx)} />
                                                        </HStack>
                                                    ))}
                                                </VStack>
                                            </Box>

                                            <FormControl>
                                                <FormLabel fontWeight="bold" fontSize="sm">Site Documents & Drawings</FormLabel>
                                                <Box
                                                    p={4} border="2px dashed" borderColor="teal.200"
                                                    borderRadius="xl" bg="teal.50" textAlign="center" cursor="pointer"
                                                    onClick={() => document.getElementById('site-docs-upload').click()}
                                                    _hover={{ bg: "teal.100" }}
                                                >
                                                    <input type="file" id="site-docs-upload" hidden onChange={handleFileChange} multiple accept="image/*,.pdf,.doc,.docx" />
                                                    <Icon as={FaCloudUploadAlt} w={6} h={6} color="teal.500" mb={1} />
                                                    <Text fontSize="xs" fontWeight="bold" color="teal.700">
                                                        {docs ? `${docs.length} file(s) selected` : "Upload Site Files (Drawings, Maps, Reports)"}
                                                    </Text>
                                                </Box>
                                            </FormControl>

                                            <Button
                                                size="lg" colorScheme="teal" w="full" borderRadius="xl" h="50px"
                                                type="submit" leftIcon={<FaMap />} isLoading={isLoading} boxShadow="md"
                                            >
                                                {editId ? 'Update Site Record' : 'Save Master Site Profile'}
                                            </Button>
                                        </VStack>
                                    </form>
                                </TabPanel>

                                <TabPanel p={0}>
                                    <Box mt={2}>
                                        <Flex justify="space-between" align="center" mb={4} wrap="wrap" gap={3}>
                                            <Heading size="sm" color="teal.700" display="flex" alignItems="center">
                                                <Icon as={FaMapMarkerAlt} mr={2} /> Registered Sites ({filteredSites.length})
                                            </Heading>

                                            <HStack spacing={1} bg="gray.100" p={1} borderRadius="xl" border="1px solid" borderColor="gray.200">
                                                <Button
                                                    size="xs"
                                                    variant={viewMode === 'card' ? 'solid' : 'ghost'}
                                                    colorScheme={viewMode === 'card' ? 'teal' : 'gray'}
                                                    leftIcon={<Icon as={FaThLarge} />}
                                                    borderRadius="lg"
                                                    fontWeight="bold"
                                                    onClick={() => setViewMode('card')}
                                                >
                                                    Cards
                                                </Button>
                                                <Button
                                                    size="xs"
                                                    variant={viewMode === 'table' ? 'solid' : 'ghost'}
                                                    colorScheme={viewMode === 'table' ? 'teal' : 'gray'}
                                                    leftIcon={<Icon as={FaTable} />}
                                                    borderRadius="lg"
                                                    fontWeight="bold"
                                                    onClick={() => setViewMode('table')}
                                                >
                                                    Table
                                                </Button>
                                            </HStack>
                                        </Flex>

                                        <HStack mb={4} p={2} bg="teal.50" borderRadius="xl" border="1px solid" borderColor="teal.100" wrap="wrap" gap={2}>
                                            <Input
                                                size="sm"
                                                placeholder="Quick Search Sites..."
                                                bg="white"
                                                borderRadius="lg"
                                                w={{ base: "full", sm: "200px" }}
                                                value={tableSearch}
                                                onChange={(e) => setTableSearch(e.target.value)}
                                            />
                                            <Select
                                                size="sm"
                                                borderRadius="lg"
                                                bg="white"
                                                w={{ base: "full", sm: "200px" }}
                                                value={filterClientId}
                                                onChange={(e) => setFilterClientId(e.target.value)}
                                            >
                                                <option value="">All Clients</option>
                                                {clients.map(c => <option key={c._id} value={c._id}>{c.clientName}</option>)}
                                            </Select>
                                        </HStack>

                                        {viewMode === 'table' ? (
                                            <Box overflow="hidden" w="full" bg="white" borderRadius="2xl" boxShadow="sm" border="1px solid" borderColor="gray.200">
                                                <TableContainer overflowX="auto" sx={{ WebkitOverflowScrolling: 'touch' }}>
                                                    <Table variant="simple" size="sm">
                                                        <Thead bg="gray.50">
                                                            <Tr>
                                                                <Th fontSize="10px" fontWeight="black" color="gray.600">SITE NAME</Th>
                                                                <Th fontSize="10px" fontWeight="black" color="gray.600">CLIENT</Th>
                                                                <Th fontSize="10px" fontWeight="black" color="gray.600">LEDGERS (AMT)</Th>
                                                                <Th fontSize="10px" fontWeight="black" color="gray.600">STATUS</Th>
                                                                <Th fontSize="10px" fontWeight="black" color="gray.600">CONTACT(S)</Th>
                                                                <Th fontSize="10px" fontWeight="black" color="gray.600" textAlign="center">ACTIONS</Th>
                                                            </Tr>
                                                        </Thead>
                                                        <Tbody>
                                                            {filteredSites.map((s, idx) => (
                                                                <Tr key={s._id} bg={idx % 2 === 0 ? "white" : "gray.50"} _hover={{ bg: "teal.50" }} transition="background 0.2s">
                                                                    <Td fontWeight="bold" color="teal.700" fontSize="xs">{s.siteName}</Td>
                                                                    <Td fontSize="xs" color="gray.700">{s.client?.clientName || '—'}</Td>
                                                                    <Td>
                                                                        <VStack align="start" spacing={1}>
                                                                            {s.ledgerItems?.filter(li => li.ledger && li.amount).map((li, i) => (
                                                                                <Badge key={i} colorScheme="teal" variant="subtle" fontSize="9px">
                                                                                    {li.ledger} (₹{li.amount?.toLocaleString()})
                                                                                </Badge>
                                                                            ))}
                                                                            {(!s.ledgerItems || s.ledgerItems.filter(li => li.ledger && li.amount).length === 0) && <Text fontSize="10px" color="gray.400">—</Text>}
                                                                        </VStack>
                                                                    </Td>
                                                                    <Td>
                                                                        <Badge colorScheme={s.status === 'Active' ? 'green' : 'red'} variant="subtle" borderRadius="full" px={2} fontSize="9px">
                                                                            {s.status}
                                                                        </Badge>
                                                                    </Td>
                                                                    <Td>
                                                                        <VStack align="start" spacing={0}>
                                                                            {s.contactPersons?.slice(0, 1).map((cp, i) => (
                                                                                <Text key={i} fontSize="xs" fontWeight="bold">{cp.name} • {cp.phone}</Text>
                                                                            ))}
                                                                            {s.contactPersons?.length > 1 && <Text fontSize="10px" color="gray.500">+{s.contactPersons.length - 1} more</Text>}
                                                                        </VStack>
                                                                    </Td>
                                                                    <Td textAlign="center">
                                                                        <HStack justify="center" spacing={1.5}>
                                                                            <IconButton aria-label="View" size="xs" colorScheme="teal" variant="solid" borderRadius="lg" icon={<Icon as={FaEye} />} onClick={() => setViewSite(s)} />
                                                                            <IconButton aria-label="Edit" size="xs" colorScheme="blue" variant="solid" borderRadius="lg" icon={<Icon as={FaEdit} />} onClick={() => handleEditSite(s)} />
                                                                            <IconButton aria-label="Delete" size="xs" colorScheme="red" variant="ghost" borderRadius="lg" icon={<Icon as={FaTrash} />} onClick={() => handleDeleteSite(s._id)} />
                                                                        </HStack>
                                                                    </Td>
                                                                </Tr>
                                                            ))}
                                                        </Tbody>
                                                    </Table>
                                                </TableContainer>
                                            </Box>
                                        ) : (
                                            <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} spacing={4}>
                                                {filteredSites.map(s => (
                                                    <Card key={s._id} borderRadius="2xl" border="1.5px solid" borderColor="gray.200" bg="white" _hover={{ shadow: 'lg', borderColor: 'teal.400', transform: 'translateY(-2px)' }} transition="all 0.2s" overflow="hidden">
                                                        <CardBody p={4}>
                                                            <HStack spacing={3} mb={3}>
                                                                <Box p={2.5} bg="teal.50" borderRadius="xl" border="1px solid" borderColor="teal.200">
                                                                    <Icon as={FaMapMarkerAlt} color="teal.600" w={5} h={5} />
                                                                </Box>
                                                                <Box flex={1} minW={0}>
                                                                    <Text fontWeight="black" fontSize="sm" color="gray.800" isTruncated>{s.siteName}</Text>
                                                                    <Text fontSize="xs" color="gray.500" isTruncated>{s.client?.clientName || 'General Client'}</Text>
                                                                </Box>
                                                                <Badge colorScheme={s.status === 'Active' ? 'green' : 'red'} variant="subtle" borderRadius="full" fontSize="9px">
                                                                    {s.status}
                                                                </Badge>
                                                            </HStack>

                                                    <Box bg="teal.50" p={2.5} borderRadius="xl" border="1px solid" borderColor="teal.100" mb={3}>
                                                        <VStack align="stretch" spacing={1.5}>
                                                            <HStack fontSize="xs" justify="space-between">
                                                                <Text color="gray.500">Contacts:</Text>
                                                                <Text fontWeight="bold">{s.contactPersons?.length || 0} person(s)</Text>
                                                            </HStack>
                                                            {s.siteLocation && (
                                                                <HStack fontSize="xs" justify="space-between">
                                                                    <Text color="gray.500">Location:</Text>
                                                                    <Text as="a" href={s.siteLocation.startsWith('http') ? s.siteLocation : `https://www.google.com/maps?q=${s.siteLocation}`} target="_blank" color="blue.600" fontWeight="bold">Open Map 🗺️</Text>
                                                                </HStack>
                                                            )}
                                                        </VStack>
                                                    </Box>

                                                    <HStack spacing={2} pt={2} borderTop="1px solid" borderColor="gray.100">
                                                        <Button flex={1} size="xs" colorScheme="teal" variant="solid" borderRadius="lg" leftIcon={<Icon as={FaEye} />} onClick={() => setViewSite(s)}>View</Button>
                                                        <Button flex={1} size="xs" colorScheme="blue" variant="solid" borderRadius="lg" leftIcon={<Icon as={FaEdit} />} onClick={() => handleEditSite(s)}>Edit</Button>
                                                        <IconButton aria-label="Delete" size="xs" colorScheme="red" variant="ghost" borderRadius="lg" icon={<Icon as={FaTrash} />} onClick={() => handleDeleteSite(s._id)} />
                                                    </HStack>
                                                </CardBody>
                                            </Card>
                                        ))}
                                    </SimpleGrid>
                                )}

                                {filteredSites.length === 0 && (
                                    <Center p={8} bg="white" borderRadius="2xl" border="1px dashed" borderColor="gray.200">
                                        <VStack spacing={2}>
                                            <Icon as={FaMapMarkerAlt} w={8} h={8} color="gray.300" />
                                            <Text color="gray.500" fontSize="sm">No sites found matching "{searchQuery}"</Text>
                                        </VStack>
                                    </Center>
                                )}
                            </Box>
                        </TabPanel>
                    </TabPanels>
                </Tabs>
            </CardBody>
        </Card>
    </Container>

    {/* Standardized Site View Modal */}
    <Modal isOpen={!!viewSite} onClose={() => setViewSite(null)} size="3xl" isCentered motionPreset="slideInBottom">
        <ModalOverlay backdropFilter="blur(8px) grayscale(40%)" bg="blackAlpha.600" />
        <ModalContent borderRadius="3xl" overflow="hidden" boxShadow="2xl" border="1px solid" borderColor="whiteAlpha.300" m={{ base: 3, md: 6 }}>
            <ModalHeader p={0}>
                <Box bgGradient="linear(to-r, teal.800, teal.600)" p={{ base: 4, md: 6 }} color="white">
                    <HStack justify="space-between">
                        <HStack spacing={3}>
                            <Icon as={FaMapMarkerAlt} w={7} h={7} />
                            <VStack align="start" spacing={0}>
                                <Heading size="md">{viewSite?.siteName}</Heading>
                                <Text fontSize="xs" opacity={0.85}>{viewSite?.client?.clientName} • Project Site</Text>
                            </VStack>
                        </HStack>
                        <ModalCloseButton position="static" borderRadius="full" />
                    </HStack>
                </Box>
            </ModalHeader>
            <ModalBody p={{ base: 4, md: 8 }}>
                {viewSite && (
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                        <VStack align="start" spacing={5}>
                            <Box w="full" bg="teal.50" p={4} borderRadius="2xl" border="1px solid" borderColor="teal.100">
                                <Text fontSize="10px" fontWeight="black" color="teal.600" textTransform="uppercase" mb={2}>Site Information</Text>
                                <VStack align="start" spacing={2}>
                                    <Box>
                                        <Text fontSize="9px" color="teal.600" fontWeight="bold">ADDRESS</Text>
                                        <Text fontSize="xs" color="gray.800">{viewSite.siteAddress || 'N/A'}</Text>
                                    </Box>
                                    <Box>
                                        <Text fontSize="9px" color="teal.600" fontWeight="bold">GPS / LOCATION</Text>
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
                                        ) : <Text fontSize="xs" color="gray.500">N/A</Text>}
                                    </Box>
                                </VStack>
                            </Box>

                            <Box w="full" bg="orange.50" p={4} borderRadius="2xl" border="1px solid" borderColor="orange.100">
                                <Text fontSize="10px" fontWeight="black" color="orange.600" textTransform="uppercase" mb={2}>Ledgers & Budget</Text>
                                <VStack align="stretch" spacing={2}>
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
                                </VStack>
                            </Box>
                        </VStack>

                        <VStack align="start" spacing={5}>
                            <Box w="full" bg="purple.50" p={4} borderRadius="2xl" border="1px solid" borderColor="purple.100">
                                <Text fontSize="10px" fontWeight="black" color="purple.600" textTransform="uppercase" mb={2}>On-Site Contacts</Text>
                                <VStack align="stretch" spacing={2}>
                                    {viewSite.contactPersons?.map((cp, i) => (
                                        <HStack key={i} p={2.5} bg="white" borderRadius="xl" justify="space-between" border="1px solid" borderColor="purple.100">
                                            <Box>
                                                <Text fontSize="xs" fontWeight="bold" color="gray.800">{cp.name}</Text>
                                                <Text fontSize="xs" color="blue.600">{cp.phone}</Text>
                                            </Box>
                                            {cp.phone && (
                                                <IconButton as="a" href={`tel:${cp.phone}`} icon={<FaPhoneAlt />} size="xs" borderRadius="full" colorScheme="purple" variant="ghost" />
                                            )}
                                        </HStack>
                                    ))}
                                    {(!viewSite.contactPersons || viewSite.contactPersons.length === 0) && (
                                        <Text fontSize="xs" color="gray.400" fontStyle="italic">No contacts listed.</Text>
                                    )}
                                </VStack>
                            </Box>

                            <Box w="full" bg="gray.50" p={4} borderRadius="2xl" border="1px solid" borderColor="gray.200">
                                <Text fontSize="10px" fontWeight="black" color="teal.700" textTransform="uppercase" mb={2}>Site Documents</Text>
                                <Wrap spacing={2}>
                                    {viewSite.documents?.map((doc, idx) => {
                                        const docUrl = getFileUrl(doc.url);
                                        return (
                                            <Button
                                                key={idx}
                                                as="a"
                                                href={docUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                size="xs"
                                                colorScheme="teal"
                                                variant="solid"
                                                leftIcon={<Icon as={FaFileAlt} />}
                                                rightIcon={<Icon as={FaExternalLinkAlt} fontSize="8px" />}
                                                borderRadius="lg"
                                                fontWeight="bold"
                                                onClick={(e) => {
                                                    if (window.innerWidth < 768) {
                                                        e.preventDefault();
                                                        window.open(docUrl, '_blank', 'noopener,noreferrer');
                                                    }
                                                }}
                                            >
                                                {doc.name || `FILE ${idx + 1}`}
                                            </Button>
                                        );
                                    })}
                                    {(!viewSite.documents || viewSite.documents.length === 0) && (
                                        <Text fontSize="xs" color="gray.400" fontStyle="italic">No documents uploaded.</Text>
                                    )}
                                </Wrap>
                            </Box>
                        </VStack>
                    </SimpleGrid>
                )}
            </ModalBody>
            <ModalFooter bg="gray.50">
                <Button colorScheme="teal" px={10} borderRadius="full" shadow="md" onClick={() => setViewSite(null)}>Close</Button>
            </ModalFooter>
        </ModalContent>
    </Modal>

    {/* Ledger Add/Edit Popup Modal */}
    <Modal isOpen={ledgerPopup.isOpen} onClose={() => setLedgerPopup({ isOpen: false })} isCentered size="md">
        <ModalOverlay backdropFilter="blur(4px)" bg="blackAlpha.600" />
        <ModalContent borderRadius="2xl" overflow="hidden">
            <ModalHeader bgGradient="linear(to-r, teal.700, teal.600)" color="white" py={4}>
                <Heading size="sm">
                    {currentLedgerForm.editingIndex !== null ? 'Edit Ledger Item' : 'Add New Ledger Account'}
                </Heading>
            </ModalHeader>
            <ModalCloseButton color="white" />
            <ModalBody py={6}>
                <VStack spacing={4}>
                    <FormControl isRequired>
                        <FormLabel fontSize="xs" fontWeight="bold">Ledger Name</FormLabel>
                        <Input
                            placeholder="e.g. Earth Work, Piling Work"
                            value={currentLedgerForm.ledger}
                            onChange={(e) => setCurrentLedgerForm(prev => ({ ...prev, ledger: e.target.value }))}
                            borderRadius="lg"
                        />
                    </FormControl>
                    <FormControl>
                        <FormLabel fontSize="xs" fontWeight="bold">Short Name</FormLabel>
                        <Input
                            placeholder="e.g. EW, PW"
                            value={currentLedgerForm.shortName}
                            onChange={(e) => setCurrentLedgerForm(prev => ({ ...prev, shortName: e.target.value }))}
                            borderRadius="lg"
                        />
                    </FormControl>
                    <FormControl>
                        <FormLabel fontSize="xs" fontWeight="bold">Budget / Amount (₹)</FormLabel>
                        <Input
                            type="number"
                            placeholder="0.00"
                            value={currentLedgerForm.amount}
                            onChange={(e) => setCurrentLedgerForm(prev => ({ ...prev, amount: e.target.value }))}
                            borderRadius="lg"
                        />
                    </FormControl>
                    <FormControl>
                        <FormLabel fontSize="xs" fontWeight="bold">HSN / SAC Code</FormLabel>
                        <Input
                            placeholder="e.g. 9954"
                            value={currentLedgerForm.hsnSac}
                            onChange={(e) => setCurrentLedgerForm(prev => ({ ...prev, hsnSac: e.target.value }))}
                            borderRadius="lg"
                        />
                    </FormControl>
                </VStack>
            </ModalBody>
            <ModalFooter bg="gray.50" py={3}>
                <Button variant="ghost" mr={3} onClick={() => setLedgerPopup({ isOpen: false })} borderRadius="full" size="sm">
                    Cancel
                </Button>
                <Button
                    colorScheme="teal"
                    onClick={() => {
                        if (!currentLedgerForm.ledger.trim()) {
                            toast({ title: "Ledger name is required", status: "warning", duration: 2000 });
                            return;
                        }
                        const itemData = {
                            ledger: currentLedgerForm.ledger.trim(),
                            shortName: currentLedgerForm.shortName.trim(),
                            amount: parseFloat(currentLedgerForm.amount) || 0,
                            hsnSac: currentLedgerForm.hsnSac.trim()
                        };
                        if (currentLedgerForm.editingIndex !== null) {
                            setLedgerItems(prev => {
                                const copy = [...prev];
                                copy[currentLedgerForm.editingIndex] = itemData;
                                return copy;
                            });
                            toast({ title: "Ledger item updated", status: "success", duration: 2000 });
                        } else {
                            setLedgerItems(prev => [...prev, itemData]);
                            toast({ title: "Ledger item added", status: "success", duration: 2000 });
                        }
                        setLedgerPopup({ isOpen: false });
                    }}
                    borderRadius="full"
                    px={6}
                    size="sm"
                >
                    {currentLedgerForm.editingIndex !== null ? 'Save Changes' : 'Add Ledger'}
                </Button>
            </ModalFooter>
        </ModalContent>
    </Modal>
</Box>
);
};

const ScheduleMasterForm = () => {
    const toast = useToast();
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [clients, setClients] = useState([]);
    const [sites, setSites] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [instrList, setInstrList] = useState([]);
    const [instrumentGroups, setInstrumentGroups] = useState([]);
    const [schedules, setSchedules] = useState([]);
    const [isFetchingSchedules, setIsFetchingSchedules] = useState(false);
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

    // Permission-gated inner tabs
    const scheduleInnerTabs = [
        { key: 'scheduleMaster_form', label: 'Schedule Site Visit Form', icon: FaCalendarAlt, color: 'teal.600' },
        { key: 'scheduleMaster_view', label: 'Scheduler View', icon: FaListUl, color: 'gray.800' },
        { key: 'scheduleMaster_report', label: 'Site Allocation Report', icon: FaMapMarkedAlt, color: 'blue.600' },
    ].filter(t => hasPermission(user, t.key, 'read'));

    const [formData, setFormData] = useState({
        client: '', site: '', scheduleDate: '', endDate: '', includeSundays: false, workForAppley: '',
        operative: '', helpers: [], vehicle: '', instruments: [],
        notes: '', dayStatus: 'Scheduled',
        ledger: '', amount: 0, scheduleType: '', quantity: 0
    });
    const [selectedSiteLedgers, setSelectedSiteLedgers] = useState([]);
    const { isOpen: isCompOpen, onOpen: onCompOpen, onClose: onCompClose } = useDisclosure();
    const { isOpen: isNoLedgerOpen, onOpen: onNoLedgerOpen, onClose: onNoLedgerClose } = useDisclosure();
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
    const [rejectReason, setRejectReason] = useState('');
    const [isRejectLoading, setIsRejectLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            // Use allSettled so that a failure in one API call does not block
            // the others from loading (e.g. ledgers failing must NOT empty the clients list)
            const [cRes, eRes, vRes, iRes, lRes, igRes] = await Promise.allSettled([
                api.get('/client-master'),
                api.get('/employee-master'),
                api.get('/vehicle-master'),
                api.get('/instrument-master'),
                api.get('/site-master/ledgers'),
                api.get('/instrument-master/groups')
            ]);
            if (cRes.status === 'fulfilled' && cRes.value.data.success) setClients(cRes.value.data.data);
            else if (cRes.status === 'rejected') console.error('Failed to load clients:', cRes.reason);

            if (eRes.status === 'fulfilled' && eRes.value.data.success) setEmployees(eRes.value.data.data);
            else if (eRes.status === 'rejected') console.error('Failed to load employees:', eRes.reason);

            if (vRes.status === 'fulfilled' && vRes.value.data.success) setVehicles(vRes.value.data.data);
            else if (vRes.status === 'rejected') console.error('Failed to load vehicles:', vRes.reason);

            if (iRes.status === 'fulfilled' && iRes.value.data.success) setInstrList(iRes.value.data.data);
            else if (iRes.status === 'rejected') console.error('Failed to load instruments:', iRes.reason);

            if (lRes.status === 'fulfilled' && lRes.value.data.success) setLedgers(lRes.value.data.data);
            else if (lRes.status === 'rejected') console.error('Failed to load ledgers:', lRes.reason);
            
            if (igRes.status === 'fulfilled' && igRes.value.data.success) setInstrumentGroups(igRes.value.data.data);
            else if (igRes.status === 'rejected') console.error('Failed to load instrument groups:', igRes.reason);
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
                const siteLedgerItems = (currentSite.ledgerItems || []).filter(li => li.ledger && li.amount);
                setSelectedSiteLedgers(siteLedgerItems);
            }
        }
    }, [formData.site, sites]);

    useEffect(() => {
        if (!viewDate) return;
        const fetchSchedules = async () => {
            setIsFetchingSchedules(true);
            try {
                const res = await api.get(`/schedule-master?date=${viewDate}`);
                if (res.data.success) setSchedules(res.data.data);
            } catch (err) { console.error(err); } finally {
                setIsFetchingSchedules(false);
            }
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
        const siteLedgerItems = (s.ledgerItems || []).filter(li => li.ledger && li.amount);
        setSelectedSiteLedgers(siteLedgerItems);
        setSiteSearch('');
        setShowSiteList(false);
        // Warn immediately if this site has no configured ledgers
        if (siteLedgerItems.length === 0) {
            onNoLedgerOpen();
        }
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
        setRejectReason(''); // Always reset reason on open
        onRejectOpen();
    };

    const handleRejectConfirm = async () => {
        if (!rejectTargetId) return;
        if (!rejectReason.trim()) return;
        setIsRejectLoading(true);
        try {
            const res = await api.put(`/schedule-master/reject/${rejectTargetId}`, { rejectReason: rejectReason.trim() });
            if (res.data.success) {
                toast({ title: 'Schedule Rejected', description: `Reason: ${rejectReason.trim()}`, status: 'info' });
                onRejectClose();
                setRejectReason('');
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
                const targetViewDate = formData.scheduleDate;
                handleClear();
                if (targetViewDate) {
                    setViewDate(targetViewDate);
                }
                const res = await api.get(`/schedule-master?date=${targetViewDate || viewDate}`);
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
                        {scheduleInnerTabs.map(t => (
                            <Tab key={t.key} _selected={{ color: 'white', bg: t.color }} px={6} borderRadius="xl" fontWeight="bold" whiteSpace="nowrap">
                                <Icon as={t.icon} mr={2} /> {t.label}
                            </Tab>
                        ))}
                    </TabList>
                    <TabPanels>
                        {/* ── TAB 1: Form ── */}
                        {scheduleInnerTabs.some(t => t.key === 'scheduleMaster_form') && (<TabPanel p={0}>
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
                                            {!formData.site ? (
                                                <Box bg="gray.50" border="1px dashed" borderColor="gray.300" px={4} py={3} borderRadius="xl">
                                                    <Text fontSize="sm" color="gray.400">Select a site first</Text>
                                                </Box>
                                            ) : selectedSiteLedgers.length === 0 ? (
                                                <HStack bg="red.50" border="1px solid" borderColor="red.200" px={4} py={3} borderRadius="xl" justify="space-between">
                                                    <VStack align="start" spacing={0}>
                                                        <Text fontSize="xs" color="red.600" fontWeight="bold">⚠ No ledgers configured</Text>
                                                        <Text fontSize="10px" color="red.400">Add rates in Site Master first</Text>
                                                    </VStack>
                                                    <Button size="xs" colorScheme="red" variant="ghost" onClick={onNoLedgerOpen}>Details</Button>
                                                </HStack>
                                            ) : (
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
                                                    {selectedSiteLedgers.map((l, i) => (
                                                        <option key={i} value={l.ledger}>{l.ledger}</option>
                                                    ))}
                                                </Select>
                                            )}
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
                </TabPanel>)}

                {/* ── TAB 2: Schedule Viewer ── */}
                {scheduleInnerTabs.some(t => t.key === 'scheduleMaster_view') && (<TabPanel p={0}>
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
                            {isFetchingSchedules ? (
                                <Box textAlign="center" py={10}>
                                    <Spinner size="xl" color="teal.500" thickness="4px" />
                                    <Text mt={4} color="gray.500">Loading schedules...</Text>
                                </Box>
                            ) : schedules.length === 0 ? (
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
                                                <Th py={4} color="gray.500" fontSize="10px" maxW="200px">REJECT REASON</Th>
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
                                                                {(() => {
                                                                    let remainingInstIds = s.instruments.map(i => i._id || i);
                                                                    let groupsToRender = [];
                                                                    
                                                                    if (instrumentGroups && instrumentGroups.length > 0) {
                                                                        instrumentGroups.forEach(grp => {
                                                                            const groupInstIds = grp.instruments?.map(i => i._id || i) || [];
                                                                            if (groupInstIds.length > 0 && groupInstIds.every(id => remainingInstIds.includes(id))) {
                                                                                groupsToRender.push(grp);
                                                                                remainingInstIds = remainingInstIds.filter(id => !groupInstIds.includes(id));
                                                                            }
                                                                        });
                                                                    }
                                                                    
                                                                    const individualInstrumentsToRender = s.instruments.filter(inst => remainingInstIds.includes(inst._id || inst));
                                                                    
                                                                    return (
                                                                        <>
                                                                            {groupsToRender.map((grp, idx) => (
                                                                                <Text key={`grp-${idx}`} fontSize="xs" color="teal.600" fontWeight="bold">
                                                                                    {grp.groupId} {grp.name ? `- ${grp.name}` : ''} (Group)
                                                                                </Text>
                                                                            ))}
                                                                            {individualInstrumentsToRender.map((i, idx) => (
                                                                                <Text key={`inst-${idx}`} fontSize="xs" color="purple.600" fontWeight="bold">
                                                                                    {i.instrumentName} ({i.serialNo})
                                                                                </Text>
                                                                            ))}
                                                                        </>
                                                                    );
                                                                })()}
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
                                                    <Td py={3} maxW="200px">
                                                        {s.dayStatus === 'Rejected' && s.rejectReason ? (
                                                            <VStack align="start" spacing={0}>
                                                                <HStack spacing={1}>
                                                                    <Icon as={FaTimes} color="red.400" w={2.5} h={2.5} />
                                                                    <Text fontSize="10px" fontWeight="bold" color="red.500" textTransform="uppercase">Reason</Text>
                                                                </HStack>
                                                                <Text fontSize="xs" color="red.600" fontStyle="italic" noOfLines={2} title={s.rejectReason}>
                                                                    {s.rejectReason}
                                                                </Text>
                                                            </VStack>
                                                        ) : (
                                                            <Text fontSize="xs" color="gray.300">—</Text>
                                                        )}
                                                    </Td>
                                                    <Td py={3} onClick={(e) => e.stopPropagation()}>
                                                        <HStack spacing={2}>
                                                            {s.dayStatus === 'Scheduled' && !s.hasExpenses && (
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
                </TabPanel>)}

                {/* ── TAB 3: Site Allocation Report ── */}
                {scheduleInnerTabs.some(t => t.key === 'scheduleMaster_report') && (<TabPanel p={0}>
                    <AdminSiteAllocation />
                </TabPanel>)}
            </TabPanels>
        </Tabs>
    </Container>

            <ResourceAssignmentModal
                isOpen={isAssignOpen}
                onClose={onAssignClose}
                schedule={assignTarget}
                schedules={schedules}
                employees={employees}
                vehicles={vehicles}
                instruments={instrList}
                instrumentGroups={instrumentGroups}
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

            {/* ── No Site Ledger Warning Modal ── */}
            <Modal isOpen={isNoLedgerOpen} onClose={onNoLedgerClose} isCentered motionPreset="slideInBottom" size="md">
                <ModalOverlay backdropFilter="blur(8px)" bg="blackAlpha.600" />
                <ModalContent borderRadius="3xl" overflow="hidden" boxShadow="2xl">
                    <ModalHeader p={0}>
                        <Box bgGradient="linear(to-r, red.500, orange.500)" px={7} py={6} color="white">
                            <HStack spacing={4}>
                                <Box bg="whiteAlpha.200" p={3} borderRadius="2xl">
                                    <Icon as={FaTag} w={7} h={7} />
                                </Box>
                                <VStack align="start" spacing={0}>
                                    <Heading size="md">No Ledger Configured</Heading>
                                    <Text fontSize="sm" opacity={0.85}>This site has no rate / ledger set up yet</Text>
                                </VStack>
                            </HStack>
                        </Box>
                    </ModalHeader>
                    <ModalCloseButton color="white" top={5} right={5} borderRadius="full" />
                    <ModalBody px={7} py={6}>
                        <VStack spacing={5} align="stretch">
                            <Box p={4} bg="red.50" borderRadius="2xl" border="1px solid" borderColor="red.100">
                                <Text fontSize="xs" fontWeight="black" color="red.500" textTransform="uppercase" mb={3}>Selected Site Details</Text>
                                <VStack align="start" spacing={3}>
                                    <HStack>
                                        <Icon as={FaBuilding} color="gray.500" />
                                        <Box>
                                            <Text fontSize="10px" color="gray.400" fontWeight="bold" textTransform="uppercase">Client</Text>
                                            <Text fontWeight="bold" color="gray.800">{selectedClientName || '—'}</Text>
                                        </Box>
                                    </HStack>
                                    <HStack>
                                        <Icon as={FaMapMarkerAlt} color="gray.500" />
                                        <Box>
                                            <Text fontSize="10px" color="gray.400" fontWeight="bold" textTransform="uppercase">Site</Text>
                                            <Text fontWeight="bold" color="gray.800">{selectedSiteName || '—'}</Text>
                                        </Box>
                                    </HStack>
                                </VStack>
                            </Box>
                            <Box p={4} bg="orange.50" borderRadius="2xl" border="1px solid" borderColor="orange.100">
                                <HStack spacing={3} mb={2}>
                                    <Icon as={FaMoneyBillWave} color="orange.500" w={5} h={5} />
                                    <Text fontWeight="black" color="orange.700">Action Required</Text>
                                </HStack>
                                <Text fontSize="sm" color="gray.600" lineHeight="tall">
                                    This site has <strong>no ledger items or rates</strong> configured.
                                    You must add the service ledger type and the corresponding rate in
                                    <strong> Site Master</strong> before scheduling this site.
                                </Text>
                            </Box>
                            <Box p={4} bg="blue.50" borderRadius="2xl" border="1px solid" borderColor="blue.100">
                                <Text fontSize="xs" fontWeight="black" color="blue.600" textTransform="uppercase" mb={2}>How to Fix</Text>
                                <VStack align="start" spacing={2}>
                                    <HStack align="start">
                                        <Text fontSize="sm" color="blue.700" fontWeight="bold">1.</Text>
                                        <Text fontSize="sm" color="gray.700">Go to <strong>Site Master</strong> module</Text>
                                    </HStack>
                                    <HStack align="start">
                                        <Text fontSize="sm" color="blue.700" fontWeight="bold">2.</Text>
                                        <Text fontSize="sm" color="gray.700">Find client <strong>{selectedClientName}</strong> → site <strong>{selectedSiteName}</strong></Text>
                                    </HStack>
                                    <HStack align="start">
                                        <Text fontSize="sm" color="blue.700" fontWeight="bold">3.</Text>
                                        <Text fontSize="sm" color="gray.700">Click <strong>Edit</strong> and add a <strong>Ledger</strong> name and <strong>Rate (₹)</strong></Text>
                                    </HStack>
                                    <HStack align="start">
                                        <Text fontSize="sm" color="blue.700" fontWeight="bold">4.</Text>
                                        <Text fontSize="sm" color="gray.700">Save and come back here to schedule the site</Text>
                                    </HStack>
                                </VStack>
                            </Box>
                        </VStack>
                    </ModalBody>
                    <ModalFooter bg="gray.50" px={7} py={4}>
                        <Button colorScheme="red" borderRadius="full" shadow="md" onClick={onNoLedgerClose} w="full">
                            Understood — I'll Update Site Master
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* ── Reject Schedule Modal (with mandatory reason) ── */}
            <Modal
                isOpen={isRejectOpen}
                onClose={() => { onRejectClose(); setRejectReason(''); }}
                isCentered
                motionPreset="slideInBottom"
                size="md"
            >
                <ModalOverlay backdropFilter="blur(8px)" bg="blackAlpha.700" />
                <ModalContent borderRadius="3xl" overflow="hidden" boxShadow="2xl">
                    <ModalHeader p={0}>
                        <Box bgGradient="linear(to-r, red.500, red.700)" px={7} py={6} color="white">
                            <HStack spacing={4}>
                                <Box bg="whiteAlpha.200" p={3} borderRadius="2xl">
                                    <Icon as={FaTimes} w={6} h={6} />
                                </Box>
                                <VStack align="start" spacing={0}>
                                    <Heading size="md">Reject Schedule</Heading>
                                    <Text fontSize="sm" opacity={0.85}>This action cannot be undone</Text>
                                </VStack>
                            </HStack>
                        </Box>
                    </ModalHeader>
                    <ModalCloseButton color="white" top={5} right={5} borderRadius="full" onClick={() => setRejectReason('')} />
                    <ModalBody px={7} py={6}>
                        <VStack spacing={4} align="stretch">
                            <Box p={4} bg="red.50" borderRadius="2xl" border="1px solid" borderColor="red.100">
                                <HStack spacing={2} mb={1}>
                                    <Icon as={FaTimes} color="red.400" w={3} h={3} />
                                    <Text fontSize="xs" fontWeight="black" color="red.600" textTransform="uppercase">Warning</Text>
                                </HStack>
                                <Text fontSize="sm" color="gray.700">
                                    This will mark the schedule as <strong>Rejected</strong> and remove it from the active pipeline. All associated data checks will be run before rejection.
                                </Text>
                            </Box>
                            <Box>
                                <Text fontWeight="bold" fontSize="sm" color="gray.700" mb={2}>
                                    Rejection Reason <Text as="span" color="red.500">*</Text>
                                </Text>
                                <Textarea
                                    placeholder="Enter the reason for rejecting this schedule (required)..."
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                    borderRadius="xl"
                                    bg="gray.50"
                                    rows={4}
                                    resize="none"
                                    focusBorderColor="red.400"
                                    _placeholder={{ color: 'gray.400', fontSize: 'sm' }}
                                />
                                {rejectReason.trim().length === 0 && (
                                    <Text fontSize="xs" color="red.400" mt={1}>⚠ Reason is required to proceed</Text>
                                )}
                                {rejectReason.trim().length > 0 && (
                                    <Text fontSize="xs" color="green.500" mt={1}>✓ {rejectReason.trim().length} characters entered</Text>
                                )}
                            </Box>
                        </VStack>
                    </ModalBody>
                    <ModalFooter bg="gray.50" px={7} py={4}>
                        <HStack w="full" spacing={3}>
                            <Button
                                ref={cancelRejectRef}
                                variant="ghost"
                                borderRadius="full"
                                onClick={() => { onRejectClose(); setRejectReason(''); }}
                                flex={1}
                            >
                                Cancel
                            </Button>
                            <Button
                                colorScheme="red"
                                borderRadius="full"
                                shadow="md"
                                onClick={handleRejectConfirm}
                                isLoading={isRejectLoading}
                                isDisabled={!rejectReason.trim()}
                                leftIcon={<Icon as={FaTimes} />}
                                flex={1}
                            >
                                Confirm Reject
                            </Button>
                        </HStack>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
};

const ResourceAssignmentModal = ({ isOpen, onClose, schedule, schedules = [], employees, vehicles, instruments, instrumentGroups = [], onUpdate, isLoading, onPauseMonth, onResumeMonth, onCompleteMonth, onDeleteSchedule }) => {
    const [formData, setFormData] = useState({
        operative: '',
        helpers: [],
        vehicle: '',
        instruments: [],
        scheduleType: '',
        endDate: '',
        scheduleDate: ''
    });
    const [conflictWarning, setConflictWarning] = useState('');
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
            const today = new Date().toISOString().split('T')[0];
            const existingDate = schedule.scheduleDate
                ? new Date(schedule.scheduleDate).toISOString().split('T')[0]
                : today;
            setFormData({
                operative: schedule.operative?._id || schedule.operative || '',
                helpers: schedule.helpers?.map(h => h._id || h) || [],
                vehicle: schedule.vehicle?._id || schedule.vehicle || '',
                instruments: schedule.instruments?.map(i => i._id || i) || [],
                scheduleType: schedule.scheduleType || '',
                endDate: schedule.endDate ? new Date(schedule.endDate).toISOString().split('T')[0] : '',
                scheduleDate: existingDate
            });
            setRequiredToday(schedule.dayStatus !== 'Rejected');
        }
    }, [schedule, isOpen]);

    const handleHelperToggle = (id) => {
        if (!formData.operative || isCompleted || isRejected) return;
        setFormData(prev => ({
            ...prev,
            helpers: prev.helpers.includes(id) ? prev.helpers.filter(h => h !== id) : [...prev.helpers, id]
        }));
    };

    const handleInstrumentToggle = (id) => {
        if (!formData.operative || isCompleted || isRejected) return;
        setFormData(prev => ({
            ...prev,
            instruments: prev.instruments.includes(id) ? prev.instruments.filter(i => i !== id) : [...prev.instruments, id]
        }));
    };

    const handleGroupToggle = (groupId) => {
        if (!formData.operative || isCompleted || isRejected) return;
        const group = instrumentGroups.find(g => g._id === groupId);
        if (!group) return;
        const groupInstIds = group.instruments?.map(i => i._id || i) || [];
        if (groupInstIds.length === 0) return;
        
        setFormData(prev => {
            const current = prev.instruments || [];
            const allSelected = groupInstIds.every(id => current.includes(id));
            let newInstruments = [...current];
            if (allSelected) {
                newInstruments = newInstruments.filter(id => !groupInstIds.includes(id));
            } else {
                groupInstIds.forEach(id => {
                    if (!newInstruments.includes(id)) newInstruments.push(id);
                });
            }
            return { ...prev, instruments: newInstruments };
        });
    };

    const isCompleted = schedule?.dayStatus === 'Completed';
    const isPaused = schedule?.dayStatus === 'Paused';
    const isRejected = schedule?.dayStatus === 'Rejected';
    const isMonthType = schedule?.scheduleType === 'MONTH';
    const isResourceDisabled = isCompleted || isRejected || !formData.operative;

    return (
        <>
        <Modal isOpen={isOpen} onClose={onClose} size="xl">
            <ModalOverlay backdropFilter="blur(12px)" bg="blackAlpha.700" />
            <ModalContent borderRadius="3xl" overflow="hidden" boxShadow="2xl" border="1px solid" borderColor="whiteAlpha.300">
                <ModalHeader bgGradient={isRejected ? "linear(to-r, red.700, red.500)" : isCompleted ? "linear(to-r, gray.700, gray.500)" : "linear(to-r, blue.700, blue.500)"} color="white" py={5}>
                    <HStack spacing={4}>
                        <Box p={2} bg="whiteAlpha.300" borderRadius="xl">
                            <Icon as={FaUsers} w={6} h={6} />
                        </Box>
                        <VStack align="start" spacing={0}>
                            <Text fontSize="lg" fontWeight="black">{isRejected ? 'Schedule Rejected (Locked)' : isCompleted ? 'View Assigned Resources' : 'Assign Resources'}</Text>
                            <Text fontSize="xs" fontWeight="medium" opacity={0.9}>
                                {schedule?.client?.clientName} • {schedule?.site?.siteName}
                            </Text>
                            {schedule?.site?.contactPersons && schedule.site.contactPersons.length > 0 ? (
                                <Text fontSize="xs" fontWeight="bold" opacity={0.9} mt={1} color="yellow.300">
                                    <Icon as={FaPhoneAlt} mr={1} /> 
                                    {schedule.site.contactPersons[0].name} ({schedule.site.contactPersons[0].phone})
                                </Text>
                            ) : schedule?.site?.contactPhone ? (
                                <Text fontSize="xs" fontWeight="bold" opacity={0.9} mt={1} color="yellow.300">
                                    <Icon as={FaPhoneAlt} mr={1} /> 
                                    {schedule.site.contactPhone}
                                </Text>
                            ) : null}
                        </VStack>
                    </HStack>
                </ModalHeader>
                <ModalCloseButton color="white" borderRadius="full" mt={2} />
                <ModalBody p={8} bg="gray.50">
                    <VStack spacing={8} align="stretch">
                        {isRejected && (
                            <Box p={4} bg="red.50" borderRadius="2xl" border="1px solid" borderColor="red.200">
                                <HStack spacing={3}>
                                    <Icon as={FaTimes} color="red.500" w={5} h={5} />
                                    <VStack align="start" spacing={0}>
                                        <Text fontWeight="black" color="red.800" fontSize="sm">Schedule Marked as REJECTED</Text>
                                        <Text fontSize="xs" color="red.600">
                                            Reason: <strong>{schedule.rejectReason || 'No reason specified'}</strong>. Operative assignment is disabled for rejected schedules.
                                        </Text>
                                    </VStack>
                                </HStack>
                            </Box>
                        )}
                        {/* ── Schedule Date Picker ── */}
                        <FormControl isDisabled={isCompleted || isRejected}>
                            <FormLabel fontWeight="black" fontSize="xs" color="blue.600" textTransform="uppercase" mb={3} letterSpacing="wider">
                                <Icon as={FaCalendarAlt} mr={2} color="blue.500" /> Schedule Date
                            </FormLabel>
                            <Input
                                type="date"
                                value={formData.scheduleDate}
                                onChange={(e) => setFormData(prev => ({ ...prev, scheduleDate: e.target.value }))}
                                borderRadius="2xl"
                                bg="white"
                                border="2px solid"
                                borderColor="blue.200"
                                _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px var(--chakra-colors-blue-400)' }}
                                fontWeight="bold"
                                h="50px"
                                color="blue.700"
                            />
                        </FormControl>

                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                            <FormControl isDisabled={isCompleted || isRejected}>
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


                            <FormControl isDisabled={isCompleted || isRejected}>
                                <FormLabel fontWeight="black" fontSize="xs" color="blue.600" textTransform="uppercase" mb={3} letterSpacing="wider">
                                    <Icon as={FaStar} mr={2} color="yellow.500" /> Main Operative
                                </FormLabel>
                                <Select 
                                    value={formData.operative} 
                                    onChange={async (e) => {
                                        const newOp = e.target.value;
                                        setFormData(prev => ({ 
                                            ...prev, 
                                            operative: newOp,
                                            helpers: prev.helpers.filter(h => h !== newOp)
                                        }));
                                        if (newOp) {
                                            try {
                                                const res = await api.get(`/schedule-master/last-assignment/${newOp}`);
                                                if (res.data.success && res.data.data) {
                                                    const { helpers, vehicle, instruments } = res.data.data;

                                                    // Determine busy resources for today (ignoring current schedule & rejected)
                                                    let busyHelpers = new Set();
                                                    let busyVehicles = new Set();
                                                    let busyInstruments = new Set();

                                                    schedules.forEach(s => {
                                                        if (s._id !== schedule?._id && s.dayStatus !== 'Rejected') {
                                                            if (s.helpers) s.helpers.forEach(h => busyHelpers.add(h._id || h));
                                                            if (s.vehicle) busyVehicles.add(s.vehicle._id || s.vehicle);
                                                            if (s.instruments) s.instruments.forEach(i => busyInstruments.add(i._id || i));
                                                        }
                                                    });

                                                    const lastHelpers = helpers || [];
                                                    const availableHelpers = lastHelpers.filter(h => !busyHelpers.has(h._id || h));
                                                    const availableVehicle = vehicle && !busyVehicles.has(vehicle._id || vehicle) ? vehicle : null;
                                                    const lastInstruments = instruments || [];
                                                    const availableInstruments = lastInstruments.filter(i => !busyInstruments.has(i._id || i));

                                                    setFormData(prev => ({
                                                        ...prev,
                                                        helpers: availableHelpers.length > 0 ? availableHelpers : prev.helpers,
                                                        vehicle: availableVehicle || prev.vehicle,
                                                        instruments: availableInstruments.length > 0 ? availableInstruments : prev.instruments
                                                    }));
                                                }
                                            } catch (err) {
                                                console.error("Failed to fetch last assignment", err);
                                            }
                                        }
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

                        <FormControl isDisabled={isResourceDisabled}>
                            <FormLabel fontWeight="black" fontSize="xs" color="blue.600" textTransform="uppercase" mb={3} letterSpacing="wider" display="flex" flexWrap="wrap" alignItems="center">
                                <Icon as={FaUsers} mr={2} /> Helpers ({formData.helpers.length}) {!formData.operative && "(Select Operative First)"}
                                {formData.helpers.length > 0 && (
                                    <Text as="span" ml={1} color="gray.500" fontWeight="bold" textTransform="none" fontSize="10px">
                                        - {employees.filter(e => formData.helpers.includes(e._id)).map(e => e.name).join(', ')}
                                    </Text>
                                )}
                            </FormLabel>
                            <Menu closeOnSelect={false} matchWidth placement="bottom-start">
                                <MenuButton 
                                    as={Button} 
                                    w="100%" 
                                    h="50px" 
                                    borderRadius="2xl" 
                                    bg="white" 
                                    border="2px solid" 
                                    borderColor="gray.100" 
                                    _hover={{ bg: "gray.50" }} 
                                    _active={{ bg: "gray.100" }} 
                                    textAlign="left" 
                                    fontWeight="bold" 
                                    isDisabled={isResourceDisabled}
                                    rightIcon={<Icon as={FaChevronDown} color="gray.400" />}
                                >
                                    <Flex justify="space-between" align="center" w="100%">
                                        <Text fontWeight={formData.helpers.length > 0 ? "bold" : "normal"} color={formData.helpers.length > 0 ? "gray.800" : "gray.500"}>
                                            {formData.helpers.length > 0 
                                                ? `${formData.helpers.length} Helper(s) Selected` 
                                                : (formData.operative ? "Select Helpers" : "Select Operative First")}
                                        </Text>
                                    </Flex>
                                </MenuButton>
                                <MenuList maxH="220px" overflowY="auto" borderRadius="xl" p={2} zIndex={10} shadow="lg" border="1px solid" borderColor="gray.100">
                                    {employees.filter(e => (e.status !== 'Deactive' || formData.helpers.includes(e._id)) && e._id !== formData.operative).map(e => {
                                        const isSelected = formData.helpers.includes(e._id);
                                        return (
                                            <MenuItem 
                                                key={e._id} 
                                                onClick={(evt) => { 
                                                    evt.preventDefault(); 
                                                    !isResourceDisabled && handleHelperToggle(e._id); 
                                                }} 
                                                _hover={{ bg: "blue.50" }} 
                                                borderRadius="md" 
                                                mb={1}
                                                bg={isSelected ? "blue.50" : "transparent"}
                                            >
                                                <Checkbox 
                                                    isChecked={isSelected} 
                                                    colorScheme="blue" 
                                                    pointerEvents="none" 
                                                    mr={3} 
                                                />
                                                <Text fontSize="sm" fontWeight="bold" color={isSelected ? 'blue.800' : 'gray.700'}>{e.name}</Text>
                                            </MenuItem>
                                        );
                                    })}
                                    {employees.filter(e => (e.status !== 'Deactive' || formData.helpers.includes(e._id)) && e._id !== formData.operative).length === 0 && (
                                        <MenuItem isDisabled>No helpers available</MenuItem>
                                    )}
                                </MenuList>
                            </Menu>
                        </FormControl>

                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                            <FormControl isDisabled={isResourceDisabled}>
                                <FormLabel fontWeight="black" fontSize="xs" color="blue.600" textTransform="uppercase" mb={3} letterSpacing="wider" display="flex" flexWrap="wrap" alignItems="center">
                                    <Icon as={FaCar} mr={2} color="red.500" /> Assigned Vehicle
                                    {formData.vehicle && (
                                        <Text as="span" ml={1} color="gray.500" fontWeight="bold" textTransform="none" fontSize="10px">
                                            - {vehicles.find(v => v._id === formData.vehicle)?.vehicleNumber}
                                        </Text>
                                    )}
                                </FormLabel>
                                <Menu matchWidth placement="bottom-start">
                                    <MenuButton 
                                        as={Button} 
                                        w="100%" 
                                        h="50px" 
                                        borderRadius="2xl" 
                                        bg="white" 
                                        border="2px solid" 
                                        borderColor="gray.100" 
                                        _hover={{ bg: "gray.50" }} 
                                        _active={{ bg: "gray.100" }} 
                                        textAlign="left" 
                                        fontWeight="bold" 
                                        isDisabled={isResourceDisabled}
                                        rightIcon={<Icon as={FaChevronDown} color="gray.400" />}
                                    >
                                        <Flex justify="space-between" align="center" w="100%">
                                            <HStack spacing={3} overflow="hidden">
                                                {formData.vehicle && vehicles.find(v => v._id === formData.vehicle)?.vehiclePhotos?.length > 0 && (
                                                    <Image 
                                                        src={API_BASE_URL.replace('/api', '') + vehicles.find(v => v._id === formData.vehicle).vehiclePhotos[0].url} 
                                                        boxSize="30px" 
                                                        borderRadius="md" 
                                                        objectFit="cover" 
                                                    />
                                                )}
                                                <Text fontWeight={formData.vehicle ? "bold" : "normal"} color={formData.vehicle ? "gray.800" : "gray.500"} isTruncated>
                                                    {formData.vehicle 
                                                        ? `${vehicles.find(v => v._id === formData.vehicle)?.vehicleNumber} - ${vehicles.find(v => v._id === formData.vehicle)?.vehicleName}` 
                                                        : (formData.operative ? "Select Vehicle" : "Select Operative First")}
                                                </Text>
                                            </HStack>
                                        </Flex>
                                    </MenuButton>
                                    <MenuList maxH="250px" overflowY="auto" borderRadius="xl" p={2} zIndex={10} shadow="lg" border="1px solid" borderColor="gray.100">
                                        <MenuItem onClick={() => setFormData(prev => ({ ...prev, vehicle: '' }))} borderRadius="md" mb={1} _hover={{ bg: "gray.50" }}>
                                            <Text color="gray.500">None (Clear Selection)</Text>
                                        </MenuItem>
                                        {vehicles.map(v => {
                                            const isSelected = formData.vehicle === v._id;
                                            const photoUrl = v.vehiclePhotos && v.vehiclePhotos.length > 0 ? API_BASE_URL.replace('/api', '') + v.vehiclePhotos[0].url : null;
                                            return (
                                                <MenuItem 
                                                    key={v._id} 
                                                    onClick={() => setFormData(prev => ({ ...prev, vehicle: v._id }))} 
                                                    _hover={{ bg: "blue.50" }} 
                                                    borderRadius="md" 
                                                    mb={1}
                                                    bg={isSelected ? "blue.50" : "transparent"}
                                                >
                                                    <HStack spacing={3}>
                                                        {photoUrl ? (
                                                            <Image src={photoUrl} boxSize="40px" borderRadius="md" objectFit="cover" fallbackSrc="https://via.placeholder.com/40" />
                                                        ) : (
                                                            <Center boxSize="40px" borderRadius="md" bg="gray.100">
                                                                <Icon as={FaCar} color="gray.400" />
                                                            </Center>
                                                        )}
                                                        <VStack align="start" spacing={0}>
                                                            <Text fontSize="sm" fontWeight="bold" color={isSelected ? 'blue.800' : 'gray.700'}>{v.vehicleNumber}</Text>
                                                            <Text fontSize="xs" color="gray.500">{v.vehicleName}</Text>
                                                        </VStack>
                                                    </HStack>
                                                </MenuItem>
                                            );
                                        })}
                                    </MenuList>
                                </Menu>
                            </FormControl>

                            <FormControl isDisabled={isResourceDisabled}>
                                <FormLabel fontWeight="black" fontSize="xs" color="blue.600" textTransform="uppercase" mb={3} letterSpacing="wider" display="flex" flexWrap="wrap" alignItems="center">
                                    <Icon as={FaWrench} mr={2} color="orange.500" /> Instruments & Groups ({formData.instruments.length} selected) {!formData.operative && "(Select Operative First)"}
                                    {formData.instruments.length > 0 && (
                                        <Text as="span" ml={1} color="gray.500" fontWeight="bold" textTransform="none" fontSize="10px">
                                            - {instruments.filter(i => formData.instruments.includes(i._id)).map(i => i.serialNo || i.instrumentNumber || i.instrumentName).join(', ')}
                                        </Text>
                                    )}
                                </FormLabel>
                                
                                {instrumentGroups && instrumentGroups.length > 0 && (
                                    <Box maxH="140px" overflowY="auto" border="2px solid" borderColor="teal.100" borderRadius="2xl" p={3} bg={isResourceDisabled ? "gray.50" : "teal.50"} mb={3}>
                                        <VStack spacing={2} align="stretch">
                                            {instrumentGroups.map(grp => {
                                                const groupInstIds = grp.instruments?.map(i => i._id || i) || [];
                                                const isSelected = groupInstIds.length > 0 && groupInstIds.every(id => formData.instruments.includes(id));
                                                return (
                                                    <HStack 
                                                        key={grp._id} 
                                                        py={2} 
                                                        px={3} 
                                                        cursor={isResourceDisabled ? "not-allowed" : "pointer"} 
                                                        borderRadius="xl" 
                                                        bg={isSelected ? 'teal.100' : 'white'}
                                                        border="1px solid"
                                                        borderColor={isSelected ? 'teal.300' : 'transparent'}
                                                        _hover={isResourceDisabled ? {} : { bg: isSelected ? 'teal.200' : 'white', borderColor: 'teal.300' }} 
                                                        onClick={() => !isResourceDisabled && handleGroupToggle(grp._id)}
                                                        transition="all 0.2s"
                                                    >
                                                        <Checkbox 
                                                            isChecked={isSelected} 
                                                            colorScheme="teal" 
                                                            size="md" 
                                                            pointerEvents="none"
                                                            borderColor="gray.300" 
                                                            isDisabled={isResourceDisabled}
                                                        />
                                                        <VStack align="start" spacing={0}>
                                                            <Text fontSize="xs" fontWeight="bold" color={isSelected ? 'teal.800' : 'gray.700'}>
                                                                Group: {grp.groupId} {grp.name ? `- ${grp.name}` : ''}
                                                            </Text>
                                                            <Text fontSize="10px" color="gray.500" fontWeight="bold">
                                                                {groupInstIds.length} Instruments
                                                            </Text>
                                                        </VStack>
                                                    </HStack>
                                                );
                                            })}
                                        </VStack>
                                    </Box>
                                )}

                                <Box maxH="180px" overflowY="auto" border="2px solid" borderColor="gray.100" borderRadius="2xl" p={4} bg={isResourceDisabled ? "gray.50" : "white"}>
                                    <VStack spacing={2} align="stretch">
                                        {instruments.filter(inst => !inst.parentInstrumentId).map(inst => {
                                            const isSelected = formData.instruments.includes(inst._id);
                                            return (
                                                <HStack 
                                                    key={inst._id} 
                                                    py={2} 
                                                    px={3} 
                                                    cursor={isResourceDisabled ? "not-allowed" : "pointer"} 
                                                    borderRadius="xl" 
                                                    bg={isSelected ? 'orange.50' : 'gray.50'}
                                                    border="1px solid"
                                                    borderColor={isSelected ? 'orange.200' : 'transparent'}
                                                    _hover={isResourceDisabled ? {} : { bg: isSelected ? 'orange.100' : 'orange.50', borderColor: 'orange.200' }} 
                                                    onClick={() => !isResourceDisabled && handleInstrumentToggle(inst._id)}
                                                    transition="all 0.2s"
                                                >
                                                    <Checkbox 
                                                        isChecked={isSelected} 
                                                        colorScheme="orange" 
                                                        size="md" 
                                                        pointerEvents="none"
                                                        borderColor="gray.300" 
                                                        isDisabled={isResourceDisabled}
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
                                    bgGradient={isRejected ? "linear(to-r, gray.400, gray.400)" : "linear(to-r, blue.600, blue.400)"} 
                                    color="white" 
                                    isDisabled={isRejected}
                                    _hover={{ bgGradient: isRejected ? 'none' : 'linear(to-r, blue.700, blue.500)', transform: isRejected ? 'none' : 'translateY(-1px)', shadow: 'xl' }}
                                    _active={{ transform: 'translateY(0)' }}
                                    isLoading={isLoading} 
                                    onClick={() => {
                                        const payload = {
                                            ...formData,
                                            dayStatus: (schedule.dayStatus === 'Rejected' && formData.operative) ? 'Scheduled' : schedule.dayStatus,
                                            skipToday: !requiredToday,
                                            scheduleDate: formData.scheduleDate
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
    const { user } = useAuth();
    const toast = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [instruments, setInstruments] = useState([]);
    const [editId, setEditId] = useState(null);
    const [existingPhotos, setExistingPhotos] = useState([]);
    const [newPhotos, setNewPhotos] = useState([]);
    const [formChildren, setFormChildren] = useState([]);
    const [deletedChildIds, setDeletedChildIds] = useState([]);
    const { isOpen: isConfirmOpen, onOpen: onConfirmOpen, onClose: onConfirmClose } = useDisclosure();
    const cancelRef = React.useRef();
    const [activeTab, setActiveTab] = useState(0);

    // View & Filter States
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState('all'); // 'all', 'parents', 'children', 'grouped'
    const [viewLayout, setViewLayout] = useState('hierarchy'); // 'hierarchy', 'table', 'grid'
    const [expandedParents, setExpandedParents] = useState(new Set());
    const [viewInstrument, setViewInstrument] = useState(null);
    const [modalActivePhotoIndex, setModalActivePhotoIndex] = useState(0);
    const [lightboxPhoto, setLightboxPhoto] = useState(null);

    // Tab permissions
    const tabConfig = [
        { id: 'form', label: 'Instrument Form', permission: 'instrumentMaster_form', icon: FaWrench },
        { id: 'view', label: 'Registered Instruments', permission: 'instrumentMaster_view', icon: FaListUl },
        { id: 'groups', label: 'Instrument Groups', permission: 'instrumentMaster_groups', icon: FaLayerGroup }
    ].filter(t => hasPermission(user, t.permission, 'read'));

    const [formData, setFormData] = useState({ model: '', serialNo: '', instrumentName: '', notes: '', parentInstrumentId: null });

    // Group States
    const [groups, setGroups] = useState([]);
    const [groupEditId, setGroupEditId] = useState(null);
    const [groupNextId, setGroupNextId] = useState('');
    const [groupFormData, setGroupFormData] = useState({ name: '', instruments: [] });
    const [isGroupLoading, setIsGroupLoading] = useState(false);
    const [selectedInstrumentIds, setSelectedInstrumentIds] = useState([]);
    const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
    const [groupSearchQuery, setGroupSearchQuery] = useState('');

    const fetchInstruments = async () => {
        try {
            const res = await api.get('/instrument-master');
            if (res.data.success) {
                setInstruments(res.data.data);
            }
        } catch (err) { console.error('Fetch instruments error:', err); }
    };

    const fetchGroups = async () => {
        try {
            const res = await api.get('/instrument-master/groups');
            if (res.data.success) setGroups(res.data.data);
        } catch (err) { console.error('Fetch groups error:', err); }
    };

    const fetchNextGroupId = async () => {
        try {
            const res = await api.get('/instrument-master/groups/next-id');
            if (res.data.success) setGroupNextId(res.data.nextGroupId);
        } catch (err) { console.error('Fetch next group ID error:', err); }
    };

    useEffect(() => {
        fetchInstruments();
        fetchGroups();
        fetchNextGroupId();
    }, []);

    // Auto-expand all parents initially
    useEffect(() => {
        if (instruments.length > 0) {
            const parentsWithChildren = instruments
                .filter(i => !i.parentInstrumentId && instruments.some(c => String(c.parentInstrumentId) === String(i._id)))
                .map(i => i._id);
            setExpandedParents(new Set(parentsWithChildren));
        }
    }, [instruments.length]);

    const toggleParentExpand = (parentId) => {
        setExpandedParents(prev => {
            const next = new Set(prev);
            if (next.has(parentId)) next.delete(parentId);
            else next.add(parentId);
            return next;
        });
    };

    const expandAllParents = () => {
        const parentIds = instruments.filter(i => !i.parentInstrumentId).map(i => i._id);
        setExpandedParents(new Set(parentIds));
    };

    const collapseAllParents = () => {
        setExpandedParents(new Set());
    };

    // Form inputs handling
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePhotoChange = (e) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;
        setNewPhotos(prev => [...prev, ...files]);
    };

    const removeExistingPhoto = (index) => {
        setExistingPhotos(prev => prev.filter((_, i) => i !== index));
    };

    const removeNewPhoto = (index) => {
        setNewPhotos(prev => prev.filter((_, i) => i !== index));
    };

    // Dynamic Child Instruments Row Management in Same Form
    const handleAddChildRow = () => {
        setFormChildren(prev => [
            ...prev,
            {
                tempId: 'child_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
                _id: null,
                model: '',
                serialNo: '',
                instrumentName: '',
                notes: '',
                existingPhotos: [],
                photoFiles: [],
                photoPreviews: [],
                primaryType: null,
                primaryUrl: null,
                primaryName: null
            }
        ]);
    };

    const handleChildFieldChange = (tempId, field, value) => {
        setFormChildren(prev => prev.map(child => {
            if (child.tempId === tempId) {
                return { ...child, [field]: value };
            }
            return child;
        }));
    };

    const handleChildPhotoAdd = (tempId, e) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;
        
        const previews = files.map(f => URL.createObjectURL(f));

        setFormChildren(prev => prev.map(child => {
            if (child.tempId === tempId) {
                return {
                    ...child,
                    photoFiles: [...(child.photoFiles || []), ...files],
                    photoPreviews: [...(child.photoPreviews || []), ...previews]
                };
            }
            return child;
        }));
    };

    const handleChildSetPrimaryExistingPhoto = (tempId, photoIndex) => {
        setFormChildren(prev => prev.map(child => {
            if (child.tempId === tempId) {
                const arr = [...(child.existingPhotos || [])];
                const [item] = arr.splice(photoIndex, 1);
                arr.unshift(item);
                return {
                    ...child,
                    existingPhotos: arr,
                    primaryType: 'existing',
                    primaryUrl: item,
                    primaryName: null
                };
            }
            return child;
        }));
    };

    const handleChildSetPrimaryNewPhoto = (tempId, photoIndex) => {
        setFormChildren(prev => prev.map(child => {
            if (child.tempId === tempId) {
                const files = [...(child.photoFiles || [])];
                const previews = [...(child.photoPreviews || [])];
                const [f] = files.splice(photoIndex, 1);
                const [p] = previews.splice(photoIndex, 1);
                files.unshift(f);
                previews.unshift(p);
                return {
                    ...child,
                    photoFiles: files,
                    photoPreviews: previews,
                    primaryType: 'new',
                    primaryName: f.name,
                    primaryUrl: null
                };
            }
            return child;
        }));
    };

    const handleChildRemoveExistingPhoto = (tempId, photoUrl) => {
        setFormChildren(prev => prev.map(child => {
            if (child.tempId === tempId) {
                const updatedPhotos = (child.existingPhotos || []).filter(u => u !== photoUrl);
                return {
                    ...child,
                    existingPhotos: updatedPhotos
                };
            }
            return child;
        }));
    };

    const handleChildRemoveNewPhoto = (tempId, photoIndex) => {
        setFormChildren(prev => prev.map(child => {
            if (child.tempId === tempId) {
                const updatedFiles = (child.photoFiles || []).filter((_, i) => i !== photoIndex);
                const updatedPreviews = (child.photoPreviews || []).filter((_, i) => i !== photoIndex);
                return {
                    ...child,
                    photoFiles: updatedFiles,
                    photoPreviews: updatedPreviews
                };
            }
            return child;
        }));
    };

    const handleRemoveChildRow = (childItem) => {
        if (childItem._id) {
            setDeletedChildIds(prev => [...prev, childItem._id]);
        }
        setFormChildren(prev => prev.filter(c => c.tempId !== childItem.tempId));
    };

    // Edit and Clear
    const handleEdit = (inst) => {
        setEditId(inst._id);
        setFormData({
            model: inst.model || '',
            serialNo: inst.serialNo || '',
            instrumentName: inst.instrumentName || '',
            notes: inst.notes || '',
            parentInstrumentId: inst.parentInstrumentId || null
        });
        
        // Parent photos
        const instPhotosList = inst.photos?.map(p => p.url) || (inst.photo?.url ? [inst.photo.url] : []);
        // Place primary photo at index 0 if designated
        if (inst.photo?.url && instPhotosList.includes(inst.photo.url)) {
            const idx = instPhotosList.indexOf(inst.photo.url);
            if (idx > 0) {
                const [p] = instPhotosList.splice(idx, 1);
                instPhotosList.unshift(p);
            }
        }
        setExistingPhotos(instPhotosList);
        setNewPhotos([]);
        setDeletedChildIds([]);

        // Populate existing children into editable child cards with their photos & primary selection
        const existingChildList = instruments.filter(i => String(i.parentInstrumentId) === String(inst._id));
        setFormChildren(existingChildList.map(c => {
            const cPhotosList = c.photos?.map(p => p.url) || (c.photo?.url ? [c.photo.url] : []);
            if (c.photo?.url && cPhotosList.includes(c.photo.url)) {
                const pIdx = cPhotosList.indexOf(c.photo.url);
                if (pIdx > 0) {
                    const [pItem] = cPhotosList.splice(pIdx, 1);
                    cPhotosList.unshift(pItem);
                }
            }
            return {
                tempId: 'child_existing_' + c._id,
                _id: c._id,
                serialNo: c.serialNo || '',
                instrumentName: c.instrumentName || '',
                model: c.model || '',
                notes: c.notes || '',
                existingPhotos: cPhotosList,
                photoFiles: [],
                photoPreviews: [],
                primaryType: 'existing',
                primaryUrl: cPhotosList[0] || null,
                primaryName: null
            };
        }));

        const formTabIndex = tabConfig.findIndex(t => t.id === 'form');
        if (formTabIndex !== -1) {
            setActiveTab(formTabIndex);
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleClear = () => {
        setEditId(null);
        setFormData({ model: '', serialNo: '', instrumentName: '', notes: '', parentInstrumentId: null });
        setExistingPhotos([]);
        setNewPhotos([]);
        setFormChildren([]);
        setDeletedChildIds([]);
        const fileInput = document.getElementById('instr-photo-upload');
        if (fileInput) fileInput.value = '';
    };

    // Submit handler
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.serialNo.trim()) {
            toast({ title: 'Serial Number is required', status: 'warning', duration: 2500 });
            return;
        }
        onConfirmOpen();
    };

    const confirmSubmit = async () => {
        onConfirmClose();
        setIsLoading(true);
        try {
            // 1. Save/Update Parent Instrument
            const uploadData = new FormData();
            uploadData.append('model', formData.model || '');
            uploadData.append('serialNo', formData.serialNo.trim());
            uploadData.append('instrumentName', formData.instrumentName || '');
            if (formData.notes) uploadData.append('notes', formData.notes);
            if (formData.parentInstrumentId) uploadData.append('parentInstrumentId', formData.parentInstrumentId);
            
            if (existingPhotos.length > 0) {
                uploadData.append('primaryPhotoUrl', existingPhotos[0]);
            } else if (newPhotos.length > 0) {
                uploadData.append('primaryPhotoName', newPhotos[0].name);
            }
            newPhotos.forEach(file => uploadData.append('photos', file));
            existingPhotos.forEach(url => uploadData.append('existingPhotos', url));

            let response;
            if (editId) {
                response = await api.put(`/instrument-master/${editId}`, uploadData);
            } else {
                response = await api.post('/instrument-master', uploadData);
            }

            if (response.data.success) {
                const targetParentId = editId ? editId : (response.data.data ? response.data.data._id : null);
                let savedChildrenCount = 0;

                // 2. Delete any removed existing children
                if (deletedChildIds.length > 0) {
                    for (const dId of deletedChildIds) {
                        try {
                            await api.delete(`/instrument-master/${dId}`);
                        } catch (err) {
                            console.error('Failed to delete removed child:', err);
                        }
                    }
                }

                // 3. Save / Update child instruments with their photos & designated primary photos
                if (targetParentId && formChildren.length > 0) {
                    for (const child of formChildren) {
                        if (!child.serialNo || !child.serialNo.trim()) continue;
                        const childData = new FormData();
                        childData.append('serialNo', child.serialNo.trim());
                        if (child.model) childData.append('model', child.model.trim());
                        if (child.instrumentName) childData.append('instrumentName', child.instrumentName.trim());
                        if (child.notes) childData.append('notes', child.notes.trim());
                        childData.append('parentInstrumentId', targetParentId);

                        // Attach existing photos
                        if (child.existingPhotos && child.existingPhotos.length > 0) {
                            child.existingPhotos.forEach(url => childData.append('existingPhotos', url));
                        }

                        // Attach new photos
                        if (child.photoFiles && child.photoFiles.length > 0) {
                            child.photoFiles.forEach(file => childData.append('photos', file));
                        }

                        // Set Primary Photo Selection
                        if (child.primaryType === 'new' && child.photoFiles && child.photoFiles.length > 0) {
                            childData.append('primaryPhotoName', child.photoFiles[0].name);
                        } else if (child.existingPhotos && child.existingPhotos.length > 0) {
                            childData.append('primaryPhotoUrl', child.existingPhotos[0]);
                        } else if (child.photoFiles && child.photoFiles.length > 0) {
                            childData.append('primaryPhotoName', child.photoFiles[0].name);
                        }

                        try {
                            if (child._id) {
                                await api.put(`/instrument-master/${child._id}`, childData);
                            } else {
                                await api.post('/instrument-master', childData);
                            }
                            savedChildrenCount++;
                        } catch (err) {
                            console.error("Failed to save child instrument:", err);
                        }
                    }
                }

                toast({
                    title: editId ? 'Instrument Updated!' : 'Instrument Saved!',
                    description: savedChildrenCount > 0 
                        ? `Saved ${formData.instrumentName || formData.serialNo} with ${savedChildrenCount} child accessory records and photos.`
                        : response.data.message || 'Saved successfully.',
                    status: 'success',
                    duration: 3500,
                    isClosable: true
                });

                handleClear();
                fetchInstruments();
                fetchGroups();
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
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this instrument? If it has child instruments, they will become standalone.')) return;
        try {
            await api.delete(`/instrument-master/${id}`);
            toast({ title: 'Instrument Deleted', status: 'info', duration: 2500 });
            fetchInstruments();
            fetchGroups();
            if (editId === id) handleClear();
            if (viewInstrument?._id === id) setViewInstrument(null);
        } catch (err) {
            toast({ title: 'Error', description: err.response?.data?.message || 'Delete failed', status: 'error', duration: 3000 });
        }
    };

    // Group Management Functions
    const handleGroupChange = (e) => {
        const { name, value } = e.target;
        setGroupFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleGroupInstrumentToggle = (instId) => {
        setGroupFormData(prev => {
            const current = prev.instruments;
            if (current.includes(instId)) {
                return { ...prev, instruments: current.filter(id => id !== instId) };
            } else {
                return { ...prev, instruments: [...current, instId] };
            }
        });
    };

    const handleMainInstrumentToggle = (instId) => {
        setSelectedInstrumentIds(prev => {
            if (prev.includes(instId)) {
                return prev.filter(id => id !== instId);
            } else {
                return [...prev, instId];
            }
        });
    };

    const handleGroupClear = () => {
        setGroupEditId(null);
        setGroupFormData({ name: '', instruments: [] });
        setSelectedInstrumentIds([]);
        setIsGroupModalOpen(false);
        fetchNextGroupId();
    };

    const handleGroupEdit = (grp) => {
        setGroupEditId(grp._id);
        const mappedInsts = grp.instruments?.map(i => i._id || i) || [];
        setGroupFormData({
            name: grp.name || '',
            instruments: mappedInsts
        });
        setSelectedInstrumentIds(mappedInsts);
        setIsGroupModalOpen(true);
    };

    const handleStartCreateGroup = () => {
        if (selectedInstrumentIds.length === 0) {
            toast({ title: 'Select Instruments', description: 'Please select at least one instrument to group.', status: 'warning', duration: 2500 });
            return;
        }
        setGroupEditId(null);
        setGroupFormData({
            name: '',
            instruments: selectedInstrumentIds
        });
        fetchNextGroupId();
        setIsGroupModalOpen(true);
    };

    const handleGroupDelete = async (id) => {
        if (!window.confirm('Delete this instrument group?')) return;
        try {
            await api.delete(`/instrument-master/groups/${id}`);
            toast({ title: 'Group Deleted', status: 'info', duration: 2000 });
            fetchGroups();
            fetchInstruments();
            if (groupEditId === id) handleGroupClear();
        } catch (err) {
            toast({ title: 'Error', description: err.response?.data?.message || 'Delete failed', status: 'error', duration: 3000 });
        }
    };

    const handleGroupSubmit = async (e) => {
        e.preventDefault();
        if (!groupFormData.name.trim()) {
            toast({ title: 'Validation Error', description: 'Group name is required', status: 'warning', duration: 2000 });
            return;
        }
        setIsGroupLoading(true);
        try {
            if (groupEditId) {
                const res = await api.put(`/instrument-master/groups/${groupEditId}`, {
                    name: groupFormData.name,
                    instruments: groupFormData.instruments
                });
                if (res.data.success) {
                    toast({ title: 'Group Updated', status: 'success', duration: 2000 });
                    handleGroupClear();
                    fetchGroups();
                    fetchInstruments();
                }
            } else {
                const res = await api.post('/instrument-master/groups', {
                    name: groupFormData.name,
                    instruments: groupFormData.instruments
                });
                if (res.data.success) {
                    toast({ title: 'Group Created', status: 'success', duration: 2000 });
                    handleGroupClear();
                    fetchGroups();
                    fetchInstruments();
                }
            }
        } catch (err) {
            toast({ title: 'Error', description: err.response?.data?.message || 'Failed to save group', status: 'error', duration: 3000 });
        } finally {
            setIsGroupLoading(false);
        }
    };

    const getAvailableInstrumentsForGroup = () => {
        const otherGroupInstIds = groups
            .filter(g => g._id !== groupEditId)
            .flatMap(g => g.instruments?.map(i => i._id || i) || []);

        return instruments.filter(inst => !otherGroupInstIds.includes(inst._id));
    };

    // Helper counts and lookups
    const parentInstruments = instruments.filter(i => !i.parentInstrumentId);
    const childInstruments = instruments.filter(i => !!i.parentInstrumentId);
    const groupedInstrumentIds = new Set(groups.flatMap(g => g.instruments?.map(i => i._id || i) || []));

    const getParentOf = (child) => {
        if (!child.parentInstrumentId) return null;
        return instruments.find(i => String(i._id) === String(child.parentInstrumentId));
    };

    const getChildrenOf = (parentId) => {
        return instruments.filter(i => String(i.parentInstrumentId) === String(parentId));
    };

    const getGroupOf = (instId) => {
        return groups.find(g => g.instruments?.some(i => (i._id || i) === instId));
    };

    // Filter instruments for View tab
    const filteredInstruments = instruments.filter(inst => {
        const matchesSearch = searchQuery === '' || 
            (inst.serialNo && inst.serialNo.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (inst.instrumentName && inst.instrumentName.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (inst.model && inst.model.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (inst.notes && inst.notes.toLowerCase().includes(searchQuery.toLowerCase()));

        if (!matchesSearch) return false;

        if (filterCategory === 'parents') return !inst.parentInstrumentId;
        if (filterCategory === 'children') return !!inst.parentInstrumentId;
        if (filterCategory === 'grouped') return groupedInstrumentIds.has(inst._id);
        if (filterCategory === 'ungrouped') return !groupedInstrumentIds.has(inst._id);
        return true;
    });

    // Parent hierarchy list for Hierarchy View
    const filteredParentInstruments = parentInstruments.filter(p => {
        if (filterCategory === 'children') return false;
        
        const pChildren = getChildrenOf(p._id);
        const matchesParent = searchQuery === '' ||
            (p.serialNo && p.serialNo.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (p.instrumentName && p.instrumentName.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (p.model && p.model.toLowerCase().includes(searchQuery.toLowerCase()));
        
        const matchesChildren = pChildren.some(c => 
            (c.serialNo && c.serialNo.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (c.instrumentName && c.instrumentName.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (c.model && c.model.toLowerCase().includes(searchQuery.toLowerCase()))
        );

        if (!matchesParent && !matchesChildren) return false;

        if (filterCategory === 'grouped') return groupedInstrumentIds.has(p._id);
        if (filterCategory === 'ungrouped') return !groupedInstrumentIds.has(p._id);
        return true;
    });

    const orphanChildren = childInstruments.filter(c => !instruments.some(p => String(p._id) === String(c.parentInstrumentId)));

    const openViewModal = (inst) => {
        setViewInstrument(inst);
        setModalActivePhotoIndex(0);
    };

    return (
        <Box py={6} bg="gray.50" minH="100vh">
            <Container maxW="container.xl" px={{ base: 3, md: 6 }}>
                
                {/* ── Main Dashboard Header ── */}
                <Box
                    mb={6}
                    p={{ base: 5, md: 7 }}
                    borderRadius="2xl"
                    color="white"
                    bgGradient="linear(135deg, #1e3a8a 0%, #2563eb 50%, #3b82f6 100%)"
                    boxShadow="0 10px 25px -5px rgba(37, 99, 235, 0.3)"
                    position="relative"
                    overflow="hidden"
                >
                    <Box position="absolute" right="-20px" top="-20px" opacity={0.1}>
                        <Icon as={FaWrench} boxSize="180px" />
                    </Box>
                    <Flex justify="space-between" align={{ base: 'start', md: 'center' }} direction={{ base: 'column', md: 'row' }} gap={4} position="relative" zIndex={1}>
                        <HStack spacing={4}>
                            <Center boxSize="54px" borderRadius="xl" bg="whiteAlpha.200" backdropFilter="blur(8px)" border="1px solid" borderColor="whiteAlpha.300">
                                <Icon as={FaWrench} boxSize={6} color="white" />
                            </Center>
                            <VStack align="start" spacing={0}>
                                <Heading size="lg" fontWeight="extrabold" letterSpacing="tight">Instrument Master</Heading>
                                <Text fontSize="sm" opacity={0.9}>
                                    Register instruments, attach child accessories with photos, view kits, and manage groups.
                                </Text>
                            </VStack>
                        </HStack>

                        <HStack spacing={3} wrap="wrap">
                            <Tag size="lg" bg="whiteAlpha.200" color="white" borderRadius="full" px={4} py={2} border="1px solid" borderColor="whiteAlpha.300">
                                <Icon as={FaCube} mr={2} />
                                <Text fontWeight="bold">{instruments.length} Instruments</Text>
                            </Tag>
                            {editId && (
                                <Button
                                    size="sm"
                                    colorScheme="purple"
                                    bg="purple.500"
                                    _hover={{ bg: 'purple.400' }}
                                    leftIcon={<Icon as={FaPlus} />}
                                    borderRadius="full"
                                    px={4}
                                    onClick={handleClear}
                                    shadow="md"
                                >
                                    + Add New Instrument
                                </Button>
                            )}
                        </HStack>
                    </Flex>
                </Box>

                {/* ── Main Tab Navigation ── */}
                {tabConfig.length === 0 ? (
                    <Card borderRadius="2xl" p={10} textAlign="center" bg="white" shadow="sm">
                        <VStack spacing={3}>
                            <Icon as={FaWrench} boxSize={12} color="red.400" />
                            <Heading size="md" color="gray.700">Access Denied</Heading>
                            <Text fontSize="sm" color="gray.500">You do not have permission to view or manage the Instrument Master.</Text>
                        </VStack>
                    </Card>
                ) : (
                    <Tabs index={activeTab} onChange={(idx) => setActiveTab(idx)} variant="unstyled" isLazy>
                        <TabList
                            mb={6}
                            bg="white"
                            p={2}
                            borderRadius="2xl"
                            boxShadow="sm"
                            border="1px solid"
                            borderColor="gray.200"
                            gap={2}
                            overflowX="auto"
                        >
                            {tabConfig.map((t, idx) => {
                                const isSelected = activeTab === idx;
                                return (
                                    <Tab
                                        key={t.id}
                                        fontWeight="bold"
                                        fontSize="sm"
                                        borderRadius="xl"
                                        px={6}
                                        py={3}
                                        display="flex"
                                        alignItems="center"
                                        gap={2}
                                        color={isSelected ? 'white' : 'gray.600'}
                                        bg={isSelected ? 'blue.600' : 'transparent'}
                                        boxShadow={isSelected ? '0 4px 12px rgba(37, 99, 235, 0.3)' : 'none'}
                                        _hover={{ bg: isSelected ? 'blue.600' : 'gray.100' }}
                                        transition="all 0.2s"
                                    >
                                        <Icon as={t.icon} />
                                        {t.label}
                                        {t.id === 'view' && (
                                            <Badge ml={2} colorScheme={isSelected ? 'whiteAlpha' : 'blue'} borderRadius="full" px={2}>
                                                {instruments.length}
                                            </Badge>
                                        )}
                                        {t.id === 'groups' && (
                                            <Badge ml={2} colorScheme={isSelected ? 'whiteAlpha' : 'purple'} borderRadius="full" px={2}>
                                                {groups.length}
                                            </Badge>
                                        )}
                                    </Tab>
                                );
                            })}
                        </TabList>

                        <TabPanels>
                            {/* ══════════════════════════════════════════════════════════════ */}
                            {/* ── TAB 1: INSTRUMENT FORM (SEAMLESS EDIT & PHOTOS FOR PARENT & CHILDREN) ── */}
                            {/* ══════════════════════════════════════════════════════════════ */}
                            {tabConfig.some(t => t.id === 'form') && (
                                <TabPanel p={0}>
                                    <form onSubmit={handleSubmit}>
                                        <Card borderRadius="2xl" boxShadow="xl" bg="white" border="1px solid" borderColor="gray.200" overflow="hidden">
                                            
                                            {/* Form Card Header Banner */}
                                            <Box
                                                px={{ base: 6, md: 8 }}
                                                py={5}
                                                color="white"
                                                bgGradient={editId ? 'linear(to-r, purple.700, indigo.600)' : 'linear(to-r, blue.700, blue.600)'}
                                            >
                                                <Flex justify="space-between" align="center" wrap="wrap" gap={3}>
                                                    <HStack spacing={3}>
                                                        <Center boxSize="40px" borderRadius="lg" bg="whiteAlpha.200">
                                                            <Icon as={editId ? FaEdit : FaPlus} />
                                                        </Center>
                                                        <VStack align="start" spacing={0}>
                                                            <Heading size="md">
                                                                {editId ? 'Edit Instrument & Accessories' : 'Register New Instrument'}
                                                            </Heading>
                                                            <Text fontSize="xs" opacity={0.85}>
                                                                Serial number is required. Add photos and designate primary photo for parent and child accessories.
                                                            </Text>
                                                        </VStack>
                                                    </HStack>

                                                    {editId && (
                                                        <Badge colorScheme="purple" variant="solid" px={3} py={1} borderRadius="full" fontSize="xs">
                                                            EDITING: {formData.serialNo}
                                                        </Badge>
                                                    )}
                                                </Flex>
                                            </Box>

                                            <CardBody px={{ base: 6, md: 8 }} py={6}>
                                                <VStack spacing={7} align="stretch">

                                                    {/* Primary Specs Grid */}
                                                    <Box>
                                                        <Text fontSize="xs" fontWeight="bold" color="blue.600" textTransform="uppercase" letterSpacing="wider" mb={3}>
                                                            1. Instrument Details
                                                        </Text>
                                                        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={5}>
                                                            <FormControl isRequired>
                                                                <FormLabel fontWeight="bold" fontSize="sm" color="gray.700">
                                                                    <Icon as={FaTag} mr={1} color="orange.500" /> Serial No *
                                                                </FormLabel>
                                                                <Input
                                                                    name="serialNo"
                                                                    placeholder="e.g. SN-88291"
                                                                    value={formData.serialNo}
                                                                    onChange={handleChange}
                                                                    borderRadius="xl"
                                                                    bg="gray.50"
                                                                    border="1px solid"
                                                                    borderColor="gray.300"
                                                                    _focus={{ bg: 'white', borderColor: 'blue.500' }}
                                                                    fontWeight="semibold"
                                                                />
                                                            </FormControl>

                                                            <FormControl>
                                                                <FormLabel fontWeight="bold" fontSize="sm" color="gray.700">
                                                                    <Icon as={FaWrench} mr={1} color="blue.500" /> Instrument Name
                                                                </FormLabel>
                                                                <Input
                                                                    name="instrumentName"
                                                                    placeholder="e.g. Total Station TS-16"
                                                                    value={formData.instrumentName}
                                                                    onChange={handleChange}
                                                                    borderRadius="xl"
                                                                    bg="gray.50"
                                                                    border="1px solid"
                                                                    borderColor="gray.300"
                                                                    _focus={{ bg: 'white', borderColor: 'blue.500' }}
                                                                />
                                                            </FormControl>

                                                            <FormControl>
                                                                <FormLabel fontWeight="bold" fontSize="sm" color="gray.700">
                                                                    <Icon as={FaCube} mr={1} color="indigo.500" /> Model / Type
                                                                </FormLabel>
                                                                <Input
                                                                    name="model"
                                                                    placeholder="e.g. Leica Viva TS16"
                                                                    value={formData.model}
                                                                    onChange={handleChange}
                                                                    borderRadius="xl"
                                                                    bg="gray.50"
                                                                    border="1px solid"
                                                                    borderColor="gray.300"
                                                                    _focus={{ bg: 'white', borderColor: 'blue.500' }}
                                                                />
                                                            </FormControl>
                                                        </SimpleGrid>
                                                    </Box>

                                                    <Divider borderColor="gray.200" />

                                                    {/* Photo Gallery Upload Dropzone */}
                                                    <Box>
                                                        <Flex justify="space-between" align="center" mb={3}>
                                                            <Text fontSize="xs" fontWeight="bold" color="blue.600" textTransform="uppercase" letterSpacing="wider">
                                                                2. Parent Instrument Photos <Text as="span" color="gray.400" fontWeight="normal">(Optional)</Text>
                                                            </Text>
                                                            <Badge colorScheme="blue" borderRadius="full" px={3}>
                                                                {existingPhotos.length + newPhotos.length} Photo(s) Attached
                                                            </Badge>
                                                        </Flex>

                                                        {/* Upload Box */}
                                                        <Box
                                                            border="2px dashed"
                                                            borderColor="blue.300"
                                                            borderRadius="2xl"
                                                            p={5}
                                                            bg="blue.50"
                                                            cursor="pointer"
                                                            onClick={() => document.getElementById('instr-photo-upload').click()}
                                                            _hover={{ bg: 'blue.100', borderColor: 'blue.500' }}
                                                            transition="all 0.2s"
                                                            textAlign="center"
                                                        >
                                                            <input
                                                                type="file"
                                                                id="instr-photo-upload"
                                                                hidden
                                                                multiple
                                                                onChange={handlePhotoChange}
                                                                accept="image/*"
                                                            />
                                                            <HStack justify="center" spacing={3}>
                                                                <Center boxSize="40px" borderRadius="full" bg="blue.100" color="blue.600">
                                                                    <Icon as={FaCloudUploadAlt} boxSize={5} />
                                                                </Center>
                                                                <VStack align="start" spacing={0}>
                                                                    <Text fontSize="sm" fontWeight="bold" color="blue.800">
                                                                        Click to Upload Parent Instrument Photos
                                                                    </Text>
                                                                    <Text fontSize="xs" color="gray.500">
                                                                        PNG, JPG, WebP supported. The first photo is set as primary.
                                                                    </Text>
                                                                </VStack>
                                                            </HStack>
                                                        </Box>

                                                        {/* Photos Preview Grid */}
                                                        {(existingPhotos.length > 0 || newPhotos.length > 0) && (
                                                            <SimpleGrid columns={{ base: 2, sm: 3, md: 4, lg: 6 }} spacing={4} mt={4}>
                                                                {existingPhotos.map((url, i) => (
                                                                    <Box
                                                                        key={`existing-${i}`}
                                                                        position="relative"
                                                                        borderRadius="xl"
                                                                        overflow="hidden"
                                                                        border={i === 0 ? "2px solid" : "1px solid"}
                                                                        borderColor={i === 0 ? "blue.500" : "gray.300"}
                                                                        boxShadow="sm"
                                                                        bg="gray.100"
                                                                    >
                                                                        <Image
                                                                            src={`${API_BASE_URL}${url}`}
                                                                            alt="Inst"
                                                                            w="full"
                                                                            h="100px"
                                                                            objectFit="cover"
                                                                            cursor="pointer"
                                                                            onClick={() => setLightboxPhoto(`${API_BASE_URL}${url}`)}
                                                                        />
                                                                        {i === 0 ? (
                                                                            <Badge position="absolute" top={1.5} left={1.5} colorScheme="blue" fontSize="0.65rem" borderRadius="md" px={1.5} fontWeight="bold">
                                                                                ⭐ PRIMARY
                                                                            </Badge>
                                                                        ) : (
                                                                            <Button
                                                                                size="xs"
                                                                                position="absolute"
                                                                                bottom={1.5}
                                                                                left={1.5}
                                                                                colorScheme="blue"
                                                                                fontSize="0.65rem"
                                                                                h="20px"
                                                                                px={2}
                                                                                borderRadius="md"
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    const arr = [...existingPhotos];
                                                                                    const [item] = arr.splice(i, 1);
                                                                                    arr.unshift(item);
                                                                                    setExistingPhotos(arr);
                                                                                }}
                                                                            >
                                                                                Make Primary
                                                                            </Button>
                                                                        )}
                                                                        <IconButton
                                                                            aria-label="Remove Photo"
                                                                            icon={<Icon as={FaTrash} />}
                                                                            size="xs"
                                                                            colorScheme="red"
                                                                            position="absolute"
                                                                            top={1.5}
                                                                            right={1.5}
                                                                            borderRadius="full"
                                                                            onClick={(e) => { e.stopPropagation(); removeExistingPhoto(i); }}
                                                                        />
                                                                    </Box>
                                                                ))}

                                                                {newPhotos.map((file, i) => {
                                                                    const isAbsolutePrimary = i === 0 && existingPhotos.length === 0;
                                                                    const blobUrl = URL.createObjectURL(file);
                                                                    return (
                                                                        <Box
                                                                            key={`new-${i}`}
                                                                            position="relative"
                                                                            borderRadius="xl"
                                                                            overflow="hidden"
                                                                            border={isAbsolutePrimary ? "2px solid" : "1px solid"}
                                                                            borderColor={isAbsolutePrimary ? "green.500" : "gray.300"}
                                                                            boxShadow="sm"
                                                                            bg="gray.100"
                                                                        >
                                                                            <Image
                                                                                src={blobUrl}
                                                                                alt="New"
                                                                                w="full"
                                                                                h="100px"
                                                                                objectFit="cover"
                                                                                cursor="pointer"
                                                                                onClick={() => setLightboxPhoto(blobUrl)}
                                                                            />
                                                                            {isAbsolutePrimary ? (
                                                                                <Badge position="absolute" top={1.5} left={1.5} colorScheme="green" fontSize="0.65rem" borderRadius="md" px={1.5} fontWeight="bold">
                                                                                    ⭐ PRIMARY
                                                                                </Badge>
                                                                            ) : (
                                                                                <Button
                                                                                    size="xs"
                                                                                    position="absolute"
                                                                                    bottom={1.5}
                                                                                    left={1.5}
                                                                                    colorScheme="green"
                                                                                    fontSize="0.65rem"
                                                                                    h="20px"
                                                                                    px={2}
                                                                                    borderRadius="md"
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation();
                                                                                        const arr = [...newPhotos];
                                                                                        const [item] = arr.splice(i, 1);
                                                                                        arr.unshift(item);
                                                                                        setNewPhotos(arr);
                                                                                    }}
                                                                                >
                                                                                    Make Primary
                                                                                </Button>
                                                                            )}
                                                                            <IconButton
                                                                                aria-label="Remove Photo"
                                                                                icon={<Icon as={FaTrash} />}
                                                                                size="xs"
                                                                                colorScheme="red"
                                                                                position="absolute"
                                                                                top={1.5}
                                                                                right={1.5}
                                                                                borderRadius="full"
                                                                                onClick={(e) => { e.stopPropagation(); removeNewPhoto(i); }}
                                                                            />
                                                                        </Box>
                                                                    );
                                                                })}
                                                            </SimpleGrid>
                                                        )}
                                                    </Box>

                                                    <Divider borderColor="gray.200" />

                                                    {/* Notes */}
                                                    <Box>
                                                        <Text fontSize="xs" fontWeight="bold" color="blue.600" textTransform="uppercase" letterSpacing="wider" mb={2}>
                                                            3. Remarks & Notes <Text as="span" color="gray.400" fontWeight="normal">(Optional)</Text>
                                                        </Text>
                                                        <Textarea
                                                            name="notes"
                                                            placeholder="Calibration date, condition remarks, location..."
                                                            value={formData.notes}
                                                            onChange={handleChange}
                                                            borderRadius="xl"
                                                            bg="gray.50"
                                                            border="1px solid"
                                                            borderColor="gray.300"
                                                            rows={2}
                                                        />
                                                    </Box>

                                                    {/* ══════════════════════════════════════════════════════════════ */}
                                                    {/* ── 4. COMPLETE IN-FORM CHILD INSTRUMENTS WITH PRIMARY PHOTOS ── */}
                                                    {/* ══════════════════════════════════════════════════════════════ */}
                                                    <Box
                                                        p={{ base: 4, md: 6 }}
                                                        borderRadius="2xl"
                                                        border="1.5px solid"
                                                        borderColor="blue.200"
                                                        bg="blue.50"
                                                        boxShadow="sm"
                                                    >
                                                        <Flex justify="space-between" align={{ base: 'start', sm: 'center' }} direction={{ base: 'column', sm: 'row' }} gap={3} mb={4}>
                                                            <VStack align="start" spacing={0}>
                                                                <HStack>
                                                                    <Icon as={FaMicrochip} color="blue.600" boxSize={5} />
                                                                    <Heading size="sm" color="blue.900">
                                                                        Child Instruments & Accessories ({formChildren.length})
                                                                    </Heading>
                                                                </HStack>
                                                                <Text fontSize="xs" color="blue.700">
                                                                    Add, view, and edit child accessories with individual photos and primary photo selection.
                                                                </Text>
                                                            </VStack>
                                                            <Button
                                                                size="sm"
                                                                colorScheme="blue"
                                                                bg="blue.600"
                                                                _hover={{ bg: 'blue.700' }}
                                                                leftIcon={<Icon as={FaPlus} />}
                                                                onClick={handleAddChildRow}
                                                                borderRadius="xl"
                                                                px={4}
                                                                shadow="md"
                                                                fontWeight="bold"
                                                            >
                                                                + Add Child Instrument
                                                            </Button>
                                                        </Flex>

                                                        {/* Child Instruments Cards in Form */}
                                                        <VStack align="stretch" spacing={4}>
                                                            {formChildren.map((child, idx) => {
                                                                const totalChildPhotos = (child.existingPhotos?.length || 0) + (child.photoPreviews?.length || 0);

                                                                return (
                                                                    <Card
                                                                        key={child.tempId}
                                                                        p={4}
                                                                        bg="white"
                                                                        borderRadius="xl"
                                                                        border="1.5px solid"
                                                                        borderColor={child._id ? "blue.300" : "green.300"}
                                                                        boxShadow="sm"
                                                                    >
                                                                        <Flex justify="space-between" align="center" mb={3}>
                                                                            <HStack>
                                                                                <Badge colorScheme={child._id ? "blue" : "green"} borderRadius="md" px={2.5} py={0.5} fontWeight="bold">
                                                                                    {child._id ? `Child Accessory #${idx + 1}` : `New Child Row #${idx + 1}`}
                                                                                </Badge>
                                                                                <Text fontSize="xs" color="gray.500">
                                                                                    {child._id ? 'Saved in database (Editable)' : 'Ready to save with parent'}
                                                                                </Text>
                                                                            </HStack>
                                                                            <IconButton
                                                                                aria-label="Remove Child"
                                                                                icon={<Icon as={FaTrash} />}
                                                                                size="xs"
                                                                                colorScheme="red"
                                                                                variant="ghost"
                                                                                title="Remove Child Instrument"
                                                                                onClick={() => handleRemoveChildRow(child)}
                                                                            />
                                                                        </Flex>

                                                                        {/* Child Inputs Grid */}
                                                                        <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={3} mb={3}>
                                                                            <FormControl isRequired>
                                                                                <FormLabel fontSize="xs" fontWeight="bold" color="gray.700" mb={1}>
                                                                                    Child Serial No *
                                                                                </FormLabel>
                                                                                <Input
                                                                                    size="sm"
                                                                                    placeholder="e.g. SN-ACC-01"
                                                                                    value={child.serialNo}
                                                                                    onChange={(e) => handleChildFieldChange(child.tempId, 'serialNo', e.target.value)}
                                                                                    borderRadius="lg"
                                                                                    border="1px solid"
                                                                                    borderColor="blue.300"
                                                                                    fontWeight="semibold"
                                                                                    bg="blue.50"
                                                                                />
                                                                            </FormControl>
                                                                            <FormControl>
                                                                                <FormLabel fontSize="xs" fontWeight="bold" color="gray.700" mb={1}>
                                                                                    Child Instrument / Part Name
                                                                                </FormLabel>
                                                                                <Input
                                                                                    size="sm"
                                                                                    placeholder="e.g. Prism Pole, Battery Pack"
                                                                                    value={child.instrumentName}
                                                                                    onChange={(e) => handleChildFieldChange(child.tempId, 'instrumentName', e.target.value)}
                                                                                    borderRadius="lg"
                                                                                    bg="gray.50"
                                                                                />
                                                                            </FormControl>
                                                                            <FormControl>
                                                                                <FormLabel fontSize="xs" fontWeight="bold" color="gray.700" mb={1}>
                                                                                    Model / Specs (Optional)
                                                                                </FormLabel>
                                                                                <Input
                                                                                    size="sm"
                                                                                    placeholder="e.g. AP-20, GVP728"
                                                                                    value={child.model}
                                                                                    onChange={(e) => handleChildFieldChange(child.tempId, 'model', e.target.value)}
                                                                                    borderRadius="lg"
                                                                                    bg="gray.50"
                                                                                />
                                                                            </FormControl>
                                                                        </SimpleGrid>

                                                                        {/* Child Photos Section: Upload + Existing Photos + New Photos + Primary Selection */}
                                                                        <Box p={3} borderRadius="lg" bg="gray.50" border="1px dashed" borderColor="gray.300">
                                                                            <Flex justify="space-between" align="center" wrap="wrap" gap={2} mb={totalChildPhotos > 0 ? 3 : 0}>
                                                                                <HStack>
                                                                                    <Button
                                                                                        size="xs"
                                                                                        colorScheme="teal"
                                                                                        leftIcon={<Icon as={FaCamera} />}
                                                                                        onClick={() => document.getElementById(`child-file-${child.tempId}`).click()}
                                                                                        borderRadius="md"
                                                                                    >
                                                                                        Upload Child Photo(s)
                                                                                    </Button>
                                                                                    <input
                                                                                        type="file"
                                                                                        id={`child-file-${child.tempId}`}
                                                                                        hidden
                                                                                        multiple
                                                                                        accept="image/*"
                                                                                        onChange={(e) => handleChildPhotoAdd(child.tempId, e)}
                                                                                    />
                                                                                    <Text fontSize="xs" color="gray.600" fontWeight="medium">
                                                                                        {totalChildPhotos} photo(s) attached
                                                                                    </Text>
                                                                                </HStack>
                                                                                {totalChildPhotos > 1 && (
                                                                                    <Text fontSize="10px" color="blue.600" fontWeight="semibold">
                                                                                        Tip: Click "Make Primary" on any photo to set it as primary
                                                                                    </Text>
                                                                                )}
                                                                            </Flex>

                                                                            {/* Render All Photos for this Child with Primary Selection */}
                                                                            {totalChildPhotos > 0 && (
                                                                                <SimpleGrid columns={{ base: 2, sm: 3, md: 4, lg: 6 }} spacing={3} pt={1}>
                                                                                    {/* Existing Photos */}
                                                                                    {child.existingPhotos?.map((url, pIdx) => {
                                                                                        const isPrimary = (child.primaryType === 'existing' && pIdx === 0) ||
                                                                                                          (!child.primaryType && pIdx === 0) ||
                                                                                                          (child.primaryType === 'new' && (!child.photoFiles || child.photoFiles.length === 0) && pIdx === 0);

                                                                                        return (
                                                                                            <Box
                                                                                                key={`existing-${pIdx}`}
                                                                                                position="relative"
                                                                                                borderRadius="xl"
                                                                                                overflow="hidden"
                                                                                                border={isPrimary ? "2px solid" : "1px solid"}
                                                                                                borderColor={isPrimary ? "blue.500" : "gray.300"}
                                                                                                boxShadow={isPrimary ? "sm" : "xs"}
                                                                                                bg="gray.100"
                                                                                                h="95px"
                                                                                            >
                                                                                                <Image
                                                                                                    src={`${API_BASE_URL}${url}`}
                                                                                                    alt="Child Photo"
                                                                                                    w="full"
                                                                                                    h="full"
                                                                                                    objectFit="cover"
                                                                                                    cursor="pointer"
                                                                                                    onClick={() => setLightboxPhoto(`${API_BASE_URL}${url}`)}
                                                                                                />
                                                                                                {isPrimary ? (
                                                                                                    <Badge
                                                                                                        position="absolute"
                                                                                                        top={1.5}
                                                                                                        left={1.5}
                                                                                                        colorScheme="blue"
                                                                                                        fontSize="0.65rem"
                                                                                                        borderRadius="md"
                                                                                                        px={1.5}
                                                                                                        fontWeight="bold"
                                                                                                        boxShadow="sm"
                                                                                                    >
                                                                                                        ⭐ PRIMARY
                                                                                                    </Badge>
                                                                                                ) : (
                                                                                                    <Button
                                                                                                        size="xs"
                                                                                                        position="absolute"
                                                                                                        bottom={1.5}
                                                                                                        left={1.5}
                                                                                                        colorScheme="blue"
                                                                                                        fontSize="0.65rem"
                                                                                                        h="20px"
                                                                                                        px={1.5}
                                                                                                        borderRadius="md"
                                                                                                        shadow="sm"
                                                                                                        onClick={(e) => {
                                                                                                            e.stopPropagation();
                                                                                                            handleChildSetPrimaryExistingPhoto(child.tempId, pIdx);
                                                                                                        }}
                                                                                                    >
                                                                                                        Make Primary
                                                                                                    </Button>
                                                                                                )}
                                                                                                <IconButton
                                                                                                    aria-label="Remove photo"
                                                                                                    icon={<Icon as={FaTrash} />}
                                                                                                    size="xs"
                                                                                                    colorScheme="red"
                                                                                                    position="absolute"
                                                                                                    top={1.5}
                                                                                                    right={1.5}
                                                                                                    borderRadius="full"
                                                                                                    onClick={(e) => {
                                                                                                        e.stopPropagation();
                                                                                                        handleChildRemoveExistingPhoto(child.tempId, url);
                                                                                                    }}
                                                                                                />
                                                                                            </Box>
                                                                                        );
                                                                                    })}

                                                                                    {/* New Photos */}
                                                                                    {child.photoPreviews?.map((preview, pIdx) => {
                                                                                        const isPrimary = (child.primaryType === 'new' && pIdx === 0) ||
                                                                                                          (!child.primaryType && (!child.existingPhotos || child.existingPhotos.length === 0) && pIdx === 0);

                                                                                        return (
                                                                                            <Box
                                                                                                key={`new-${pIdx}`}
                                                                                                position="relative"
                                                                                                borderRadius="xl"
                                                                                                overflow="hidden"
                                                                                                border={isPrimary ? "2px solid" : "1px solid"}
                                                                                                borderColor={isPrimary ? "green.500" : "gray.300"}
                                                                                                boxShadow={isPrimary ? "sm" : "xs"}
                                                                                                bg="gray.100"
                                                                                                h="95px"
                                                                                            >
                                                                                                <Image
                                                                                                    src={preview}
                                                                                                    alt="New Child Photo"
                                                                                                    w="full"
                                                                                                    h="full"
                                                                                                    objectFit="cover"
                                                                                                    cursor="pointer"
                                                                                                    onClick={() => setLightboxPhoto(preview)}
                                                                                                />
                                                                                                {isPrimary ? (
                                                                                                    <Badge
                                                                                                        position="absolute"
                                                                                                        top={1.5}
                                                                                                        left={1.5}
                                                                                                        colorScheme="green"
                                                                                                        fontSize="0.65rem"
                                                                                                        borderRadius="md"
                                                                                                        px={1.5}
                                                                                                        fontWeight="bold"
                                                                                                        boxShadow="sm"
                                                                                                    >
                                                                                                        ⭐ PRIMARY
                                                                                                    </Badge>
                                                                                                ) : (
                                                                                                    <Button
                                                                                                        size="xs"
                                                                                                        position="absolute"
                                                                                                        bottom={1.5}
                                                                                                        left={1.5}
                                                                                                        colorScheme="green"
                                                                                                        fontSize="0.65rem"
                                                                                                        h="20px"
                                                                                                        px={1.5}
                                                                                                        borderRadius="md"
                                                                                                        shadow="sm"
                                                                                                        onClick={(e) => {
                                                                                                            e.stopPropagation();
                                                                                                            handleChildSetPrimaryNewPhoto(child.tempId, pIdx);
                                                                                                        }}
                                                                                                    >
                                                                                                        Make Primary
                                                                                                    </Button>
                                                                                                )}
                                                                                                <IconButton
                                                                                                    aria-label="Remove new photo"
                                                                                                    icon={<Icon as={FaTrash} />}
                                                                                                    size="xs"
                                                                                                    colorScheme="red"
                                                                                                    position="absolute"
                                                                                                    top={1.5}
                                                                                                    right={1.5}
                                                                                                    borderRadius="full"
                                                                                                    onClick={(e) => {
                                                                                                        e.stopPropagation();
                                                                                                        handleChildRemoveNewPhoto(child.tempId, pIdx);
                                                                                                    }}
                                                                                                />
                                                                                            </Box>
                                                                                        );
                                                                                    })}
                                                                                </SimpleGrid>
                                                                            )}
                                                                        </Box>
                                                                    </Card>
                                                                );
                                                            })}

                                                            {formChildren.length === 0 && (
                                                                <Box py={5} textAlign="center" bg="white" borderRadius="xl" border="1px dashed" borderColor="blue.300">
                                                                    <VStack spacing={2}>
                                                                        <Text fontSize="xs" color="gray.500">
                                                                            Need to attach accessories, batteries, or probes to this instrument?
                                                                        </Text>
                                                                        <Button
                                                                            size="xs"
                                                                            colorScheme="blue"
                                                                            variant="outline"
                                                                            leftIcon={<Icon as={FaPlus} />}
                                                                            onClick={handleAddChildRow}
                                                                            borderRadius="full"
                                                                        >
                                                                            + Add Child Instrument
                                                                        </Button>
                                                                    </VStack>
                                                                </Box>
                                                            )}

                                                            {formChildren.length > 0 && (
                                                                <Button
                                                                    size="sm"
                                                                    colorScheme="blue"
                                                                    variant="ghost"
                                                                    leftIcon={<Icon as={FaPlus} />}
                                                                    onClick={handleAddChildRow}
                                                                    alignSelf="start"
                                                                >
                                                                    + Add Another Child Instrument
                                                                </Button>
                                                            )}
                                                        </VStack>
                                                    </Box>

                                                    {/* Submit / Cancel Actions */}
                                                    <HStack spacing={4} pt={2}>
                                                        <Button
                                                            type="submit"
                                                            flex={1}
                                                            h="52px"
                                                            borderRadius="xl"
                                                            bgGradient={editId ? 'linear(to-r, purple.600, indigo.600)' : 'linear(to-r, blue.600, indigo.600)'}
                                                            color="white"
                                                            _hover={{ opacity: 0.9, transform: 'translateY(-1px)' }}
                                                            boxShadow="0 4px 14px rgba(37, 99, 235, 0.3)"
                                                            leftIcon={<Icon as={editId ? FaEdit : FaCheckCircle} />}
                                                            isLoading={isLoading}
                                                            loadingText="Saving Instrument & Accessories..."
                                                            fontWeight="bold"
                                                            fontSize="md"
                                                        >
                                                            {editId ? 'Update Instrument & Accessories' : 'Save Instrument & Accessories'}
                                                        </Button>

                                                        {editId && (
                                                            <Button
                                                                variant="outline"
                                                                colorScheme="gray"
                                                                borderRadius="xl"
                                                                h="52px"
                                                                px={8}
                                                                onClick={handleClear}
                                                            >
                                                                Cancel
                                                            </Button>
                                                        )}
                                                    </HStack>

                                                </VStack>
                                            </CardBody>
                                        </Card>
                                    </form>
                                </TabPanel>
                            )}

                            {/* ══════════════════════════════════════════════════════════════ */}
                            {/* ── TAB 2: REGISTERED INSTRUMENTS (HIERARCHY, TABLE, GRID) ── */}
                            {/* ══════════════════════════════════════════════════════════════ */}
                            {tabConfig.some(t => t.id === 'view') && (
                                <TabPanel p={0}>
                                    <VStack spacing={6} align="stretch">

                                        {/* ── Metrics Stats Summary Cards ── */}
                                        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
                                            <Card
                                                p={4}
                                                borderRadius="2xl"
                                                bg="white"
                                                border="1px solid"
                                                borderColor="blue.100"
                                                boxShadow="sm"
                                                _hover={{ transform: 'translateY(-2px)', shadow: 'md' }}
                                                transition="all 0.2s"
                                            >
                                                <HStack spacing={3}>
                                                    <Center boxSize="46px" borderRadius="xl" bg="blue.50" color="blue.600">
                                                        <Icon as={FaWrench} boxSize={5} />
                                                    </Center>
                                                    <VStack align="start" spacing={0}>
                                                        <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase">Total Equipment</Text>
                                                        <Heading size="md" color="blue.700">{instruments.length}</Heading>
                                                    </VStack>
                                                </HStack>
                                            </Card>

                                            <Card
                                                p={4}
                                                borderRadius="2xl"
                                                bg="white"
                                                border="1px solid"
                                                borderColor="indigo.100"
                                                boxShadow="sm"
                                                _hover={{ transform: 'translateY(-2px)', shadow: 'md' }}
                                                transition="all 0.2s"
                                            >
                                                <HStack spacing={3}>
                                                    <Center boxSize="46px" borderRadius="xl" bg="indigo.50" color="indigo.600">
                                                        <Icon as={FaBoxes} boxSize={5} />
                                                    </Center>
                                                    <VStack align="start" spacing={0}>
                                                        <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase">Parent Units</Text>
                                                        <Heading size="md" color="indigo.700">{parentInstruments.length}</Heading>
                                                    </VStack>
                                                </HStack>
                                            </Card>

                                            <Card
                                                p={4}
                                                borderRadius="2xl"
                                                bg="white"
                                                border="1px solid"
                                                borderColor="teal.100"
                                                boxShadow="sm"
                                                _hover={{ transform: 'translateY(-2px)', shadow: 'md' }}
                                                transition="all 0.2s"
                                            >
                                                <HStack spacing={3}>
                                                    <Center boxSize="46px" borderRadius="xl" bg="teal.50" color="teal.600">
                                                        <Icon as={FaMicrochip} boxSize={5} />
                                                    </Center>
                                                    <VStack align="start" spacing={0}>
                                                        <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase">Child Accessories</Text>
                                                        <Heading size="md" color="teal.700">{childInstruments.length}</Heading>
                                                    </VStack>
                                                </HStack>
                                            </Card>

                                            <Card
                                                p={4}
                                                borderRadius="2xl"
                                                bg="white"
                                                border="1px solid"
                                                borderColor="purple.100"
                                                boxShadow="sm"
                                                _hover={{ transform: 'translateY(-2px)', shadow: 'md' }}
                                                transition="all 0.2s"
                                            >
                                                <HStack spacing={3}>
                                                    <Center boxSize="46px" borderRadius="xl" bg="purple.50" color="purple.600">
                                                        <Icon as={FaLayerGroup} boxSize={5} />
                                                    </Center>
                                                    <VStack align="start" spacing={0}>
                                                        <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase">Active Groups</Text>
                                                        <Heading size="md" color="purple.700">{groups.length}</Heading>
                                                    </VStack>
                                                </HStack>
                                            </Card>
                                        </SimpleGrid>

                                        {/* ── Search & Filter Controls Suite ── */}
                                        <Card p={4} borderRadius="2xl" bg="white" border="1px solid" borderColor="gray.200" boxShadow="sm">
                                            <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
                                                
                                                {/* Search Box */}
                                                <Box flex={{ base: '1 1 100%', md: '1 1 320px' }}>
                                                    <HStack bg="gray.50" borderRadius="xl" px={3} py={1} border="1px solid" borderColor="gray.200">
                                                        <Icon as={FaSearch} color="gray.400" />
                                                        <Input
                                                            variant="unstyled"
                                                            placeholder="Search serial no, name, model, notes..."
                                                            value={searchQuery}
                                                            onChange={(e) => setSearchQuery(e.target.value)}
                                                            fontSize="sm"
                                                        />
                                                        {searchQuery && (
                                                            <IconButton
                                                                aria-label="Clear Search"
                                                                icon={<Icon as={FaTimes} />}
                                                                size="xs"
                                                                variant="ghost"
                                                                onClick={() => setSearchQuery('')}
                                                            />
                                                        )}
                                                    </HStack>
                                                </Box>

                                                {/* Filter Chips */}
                                                <HStack spacing={2} wrap="wrap" flex="1">
                                                    {[
                                                        { key: 'all', label: 'All Equipment', count: instruments.length },
                                                        { key: 'parents', label: 'Parents / Kits', count: parentInstruments.length },
                                                        { key: 'children', label: 'Child Accessories', count: childInstruments.length },
                                                        { key: 'grouped', label: 'In Groups', count: instruments.filter(i => groupedInstrumentIds.has(i._id)).length }
                                                    ].map(chip => {
                                                        const isSelected = filterCategory === chip.key;
                                                        return (
                                                            <Button
                                                                key={chip.key}
                                                                size="sm"
                                                                borderRadius="full"
                                                                fontSize="xs"
                                                                fontWeight="bold"
                                                                variant={isSelected ? 'solid' : 'ghost'}
                                                                colorScheme={isSelected ? 'blue' : 'gray'}
                                                                bg={isSelected ? 'blue.600' : 'gray.100'}
                                                                color={isSelected ? 'white' : 'gray.700'}
                                                                onClick={() => setFilterCategory(chip.key)}
                                                            >
                                                                {chip.label} ({chip.count})
                                                            </Button>
                                                        );
                                                    })}
                                                </HStack>

                                                {/* View Mode Toggle Buttons */}
                                                <HStack spacing={1} bg="gray.100" p={1} borderRadius="xl">
                                                    <IconButton
                                                        aria-label="Hierarchy View"
                                                        icon={<Icon as={FaSitemap} />}
                                                        size="sm"
                                                        variant={viewLayout === 'hierarchy' ? 'solid' : 'ghost'}
                                                        colorScheme={viewLayout === 'hierarchy' ? 'blue' : 'gray'}
                                                        onClick={() => setViewLayout('hierarchy')}
                                                        title="Parent-Child Hierarchy View"
                                                    />
                                                    <IconButton
                                                        aria-label="Table View"
                                                        icon={<Icon as={FaList} />}
                                                        size="sm"
                                                        variant={viewLayout === 'table' ? 'solid' : 'ghost'}
                                                        colorScheme={viewLayout === 'table' ? 'blue' : 'gray'}
                                                        onClick={() => setViewLayout('table')}
                                                        title="Data Table View"
                                                    />
                                                    <IconButton
                                                        aria-label="Grid Cards View"
                                                        icon={<Icon as={FaThLarge} />}
                                                        size="sm"
                                                        variant={viewLayout === 'grid' ? 'solid' : 'ghost'}
                                                        colorScheme={viewLayout === 'grid' ? 'blue' : 'gray'}
                                                        onClick={() => setViewLayout('grid')}
                                                        title="Visual Cards Grid"
                                                    />
                                                </HStack>
                                            </Flex>

                                            {/* Hierarchy View Quick Collapse / Expand Buttons */}
                                            {viewLayout === 'hierarchy' && (
                                                <Flex justify="space-between" align="center" mt={3} pt={3} borderTop="1px solid" borderColor="gray.100">
                                                    <Text fontSize="xs" color="gray.500">
                                                        Showing hierarchical kits and their child accessories with photos.
                                                    </Text>
                                                    <HStack spacing={2}>
                                                        <Button size="xs" variant="ghost" colorScheme="blue" onClick={expandAllParents}>
                                                            Expand All
                                                        </Button>
                                                        <Text color="gray.300">|</Text>
                                                        <Button size="xs" variant="ghost" colorScheme="gray" onClick={collapseAllParents}>
                                                            Collapse All
                                                        </Button>
                                                    </HStack>
                                                </Flex>
                                            )}
                                        </Card>

                                        {/* ── VIEW LAYOUT 1: HIERARCHY TREE VIEW (DEFAULT) ── */}
                                        {viewLayout === 'hierarchy' && (
                                            <VStack spacing={4} align="stretch">
                                                {filteredParentInstruments.map(parent => {
                                                    const parentPhoto = parent.photos?.[0]?.url || parent.photo?.url;
                                                    const parentChildren = getChildrenOf(parent._id);
                                                    const isExpanded = expandedParents.has(parent._id);
                                                    const groupInfo = getGroupOf(parent._id);

                                                    return (
                                                        <Card
                                                            key={parent._id}
                                                            borderRadius="2xl"
                                                            border="1px solid"
                                                            borderColor={isExpanded ? "blue.200" : "gray.200"}
                                                            bg="white"
                                                            boxShadow={isExpanded ? "md" : "sm"}
                                                            overflow="hidden"
                                                            transition="all 0.2s"
                                                        >
                                                            {/* Parent Card Header */}
                                                            <Box p={{ base: 4, md: 5 }}>
                                                                <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
                                                                    
                                                                    {/* Left: Thumbnail & Info */}
                                                                    <HStack spacing={4} flex="1" minW={{ base: '100%', sm: '320px' }}>
                                                                        {parentPhoto ? (
                                                                            <Box
                                                                                position="relative"
                                                                                boxSize="64px"
                                                                                borderRadius="xl"
                                                                                overflow="hidden"
                                                                                border="1px solid"
                                                                                borderColor="gray.200"
                                                                                cursor="pointer"
                                                                                onClick={() => setLightboxPhoto(`${API_BASE_URL}${parentPhoto}`)}
                                                                                flexShrink={0}
                                                                            >
                                                                                <Image
                                                                                    src={`${API_BASE_URL}${parentPhoto}`}
                                                                                    alt={parent.instrumentName}
                                                                                    boxSize="full"
                                                                                    objectFit="cover"
                                                                                    _hover={{ transform: 'scale(1.08)' }}
                                                                                    transition="transform 0.2s"
                                                                                />
                                                                                {parent.photos && parent.photos.length > 1 && (
                                                                                    <Badge position="absolute" bottom={0.5} right={0.5} colorScheme="blackAlpha" fontSize="0.55rem" borderRadius="sm">
                                                                                        📷 {parent.photos.length}
                                                                                    </Badge>
                                                                                )}
                                                                            </Box>
                                                                        ) : (
                                                                            <Center boxSize="64px" borderRadius="xl" bg="blue.50" color="blue.500" flexShrink={0} border="1px solid" borderColor="blue.100">
                                                                                <Icon as={FaWrench} boxSize={6} />
                                                                            </Center>
                                                                        )}

                                                                        <VStack align="start" spacing={1} flex="1">
                                                                            <HStack wrap="wrap" spacing={2}>
                                                                                <Heading size="sm" color="gray.800">
                                                                                    {parent.instrumentName || 'Unnamed Parent Unit'}
                                                                                </Heading>
                                                                                <Badge colorScheme="blue" px={2} py={0.5} borderRadius="md" fontWeight="bold">
                                                                                    {parent.serialNo}
                                                                                </Badge>
                                                                                {parent.model && (
                                                                                    <Tag size="sm" colorScheme="gray" variant="subtle" borderRadius="md">
                                                                                        Model: {parent.model}
                                                                                    </Tag>
                                                                                )}
                                                                                {groupInfo && (
                                                                                    <Badge colorScheme="purple" variant="subtle" borderRadius="md">
                                                                                        Group: {groupInfo.name}
                                                                                    </Badge>
                                                                                )}
                                                                            </HStack>

                                                                            {parent.notes && (
                                                                                <Text fontSize="xs" color="gray.600" noOfLines={1}>
                                                                                    📝 {parent.notes}
                                                                                </Text>
                                                                            )}
                                                                        </VStack>
                                                                    </HStack>

                                                                    {/* Right: Child Accessories Count Badge & Actions */}
                                                                    <HStack spacing={3}>
                                                                        <Button
                                                                            size="sm"
                                                                            colorScheme={parentChildren.length > 0 ? "blue" : "gray"}
                                                                            variant="subtle"
                                                                            borderRadius="full"
                                                                            px={3}
                                                                            leftIcon={<Icon as={FaMicrochip} />}
                                                                            rightIcon={<Icon as={isExpanded ? FaChevronUp : FaChevronDown} />}
                                                                            onClick={() => toggleParentExpand(parent._id)}
                                                                        >
                                                                            {parentChildren.length} Accessories
                                                                        </Button>

                                                                        <HStack spacing={1}>
                                                                            <IconButton
                                                                                aria-label="View Details"
                                                                                size="sm"
                                                                                colorScheme="blue"
                                                                                variant="ghost"
                                                                                icon={<Icon as={FaEye} />}
                                                                                onClick={() => openViewModal(parent)}
                                                                            />
                                                                            <IconButton
                                                                                aria-label="Edit"
                                                                                size="sm"
                                                                                colorScheme="blue"
                                                                                variant="ghost"
                                                                                icon={<Icon as={FaEdit} />}
                                                                                onClick={() => handleEdit(parent)}
                                                                            />
                                                                            <IconButton
                                                                                aria-label="Delete"
                                                                                size="sm"
                                                                                colorScheme="red"
                                                                                variant="ghost"
                                                                                icon={<Icon as={FaTrash} />}
                                                                                onClick={() => handleDelete(parent._id)}
                                                                            />
                                                                        </HStack>
                                                                    </HStack>
                                                                </Flex>
                                                            </Box>

                                                            {/* Expanded Nested Child Instruments Section */}
                                                            {isExpanded && (
                                                                <Box bg="gray.50" px={{ base: 4, md: 6 }} py={4} borderTop="1px solid" borderColor="gray.200">
                                                                    <Flex justify="space-between" align="center" mb={3}>
                                                                        <Text fontSize="xs" fontWeight="bold" color="blue.800" textTransform="uppercase" letterSpacing="wide">
                                                                            Attached Child Accessories ({parentChildren.length})
                                                                        </Text>
                                                                    </Flex>

                                                                    {parentChildren.length === 0 ? (
                                                                        <Box p={4} bg="white" borderRadius="xl" border="1px dashed" borderColor="gray.300" textAlign="center">
                                                                            <Text fontSize="xs" color="gray.500" fontStyle="italic" mb={2}>
                                                                                No child accessories attached to this instrument.
                                                                            </Text>
                                                                        </Box>
                                                                    ) : (
                                                                        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={3}>
                                                                            {parentChildren.map(child => {
                                                                                const childPhoto = child.photos?.[0]?.url || child.photo?.url;
                                                                                return (
                                                                                    <Card
                                                                                        key={child._id}
                                                                                        borderRadius="xl"
                                                                                        p={3}
                                                                                        bg="white"
                                                                                        border="1px solid"
                                                                                        borderColor="blue.100"
                                                                                        boxShadow="xs"
                                                                                        _hover={{ borderColor: 'blue.300', shadow: 'sm' }}
                                                                                        transition="all 0.2s"
                                                                                    >
                                                                                        <HStack spacing={3} align="center">
                                                                                            {childPhoto ? (
                                                                                                <Box
                                                                                                    boxSize="48px"
                                                                                                    borderRadius="lg"
                                                                                                    overflow="hidden"
                                                                                                    border="1px solid"
                                                                                                    borderColor="gray.200"
                                                                                                    cursor="pointer"
                                                                                                    onClick={() => setLightboxPhoto(`${API_BASE_URL}${childPhoto}`)}
                                                                                                    flexShrink={0}
                                                                                                >
                                                                                                    <Image
                                                                                                        src={`${API_BASE_URL}${childPhoto}`}
                                                                                                        alt={child.instrumentName}
                                                                                                        boxSize="full"
                                                                                                        objectFit="cover"
                                                                                                        _hover={{ transform: 'scale(1.1)' }}
                                                                                                        transition="transform 0.2s"
                                                                                                    />
                                                                                                </Box>
                                                                                            ) : (
                                                                                                <Center boxSize="48px" borderRadius="lg" bg="blue.50" color="blue.500" flexShrink={0}>
                                                                                                    <Icon as={FaMicrochip} />
                                                                                                </Center>
                                                                                            )}

                                                                                            <VStack align="start" spacing={0} flex={1}>
                                                                                                <Text fontWeight="bold" fontSize="sm" color="gray.800" noOfLines={1}>
                                                                                                    {child.instrumentName || 'Unnamed Child'}
                                                                                                </Text>
                                                                                                <HStack spacing={1}>
                                                                                                    <Badge colorScheme="blue" fontSize="0.65rem">{child.serialNo}</Badge>
                                                                                                    {child.model && (
                                                                                                        <Text fontSize="0.65rem" color="gray.500" noOfLines={1}>
                                                                                                            {child.model}
                                                                                                        </Text>
                                                                                                    )}
                                                                                                </HStack>
                                                                                            </VStack>

                                                                                            <HStack spacing={1}>
                                                                                                <IconButton
                                                                                                    aria-label="View Details"
                                                                                                    size="xs"
                                                                                                    colorScheme="teal"
                                                                                                    variant="ghost"
                                                                                                    icon={<Icon as={FaEye} />}
                                                                                                    onClick={() => openViewModal(child)}
                                                                                                    title="View Accessory Details"
                                                                                                />
                                                                                            </HStack>
                                                                                        </HStack>
                                                                                    </Card>
                                                                                );
                                                                            })}
                                                                        </SimpleGrid>
                                                                    )}
                                                                </Box>
                                                            )}
                                                        </Card>
                                                    );
                                                })}

                                                {orphanChildren.length > 0 && filterCategory !== 'parents' && (
                                                    <Box mt={4}>
                                                        <Text fontSize="xs" fontWeight="bold" color="orange.700" textTransform="uppercase" mb={3}>
                                                            Standalone Accessories ({orphanChildren.length})
                                                        </Text>
                                                        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={3}>
                                                            {orphanChildren.map(orphan => {
                                                                const orphanPhoto = orphan.photos?.[0]?.url || orphan.photo?.url;
                                                                return (
                                                                    <Card key={orphan._id} borderRadius="xl" p={3} bg="white" border="1px solid" borderColor="orange.200" boxShadow="xs">
                                                                        <HStack spacing={3}>
                                                                            {orphanPhoto ? (
                                                                                <Image
                                                                                    src={`${API_BASE_URL}${orphanPhoto}`}
                                                                                    alt={orphan.instrumentName}
                                                                                    boxSize="48px"
                                                                                    borderRadius="lg"
                                                                                    objectFit="cover"
                                                                                    cursor="pointer"
                                                                                    onClick={() => setLightboxPhoto(`${API_BASE_URL}${orphanPhoto}`)}
                                                                                />
                                                                            ) : (
                                                                                <Center boxSize="48px" borderRadius="lg" bg="orange.50" color="orange.500">
                                                                                    <Icon as={FaMicrochip} />
                                                                                </Center>
                                                                            )}
                                                                            <VStack align="start" spacing={0} flex={1}>
                                                                                <Text fontWeight="bold" fontSize="sm">{orphan.instrumentName || 'Unnamed'}</Text>
                                                                                <HStack spacing={1}>
                                                                                    <Badge colorScheme="orange" fontSize="xs">{orphan.serialNo}</Badge>
                                                                                    <Badge colorScheme="gray" fontSize="xs">Standalone</Badge>
                                                                                </HStack>
                                                                            </VStack>
                                                                            <HStack spacing={1}>
                                                                                <IconButton aria-label="View" size="xs" colorScheme="teal" variant="ghost" icon={<Icon as={FaEye} />} onClick={() => openViewModal(orphan)} />
                                                                                <IconButton aria-label="Delete" size="xs" colorScheme="red" variant="ghost" icon={<Icon as={FaTrash} />} onClick={() => handleDelete(orphan._id)} />
                                                                            </HStack>
                                                                        </HStack>
                                                                    </Card>
                                                                );
                                                            })}
                                                        </SimpleGrid>
                                                    </Box>
                                                )}

                                                {filteredParentInstruments.length === 0 && orphanChildren.length === 0 && (
                                                    <Card p={12} textAlign="center" borderRadius="2xl" bg="white" border="1px dashed" borderColor="gray.300">
                                                        <VStack spacing={3}>
                                                            <Center boxSize="60px" borderRadius="full" bg="gray.100" color="gray.400">
                                                                <Icon as={FaSearch} boxSize={6} />
                                                            </Center>
                                                            <Heading size="sm" color="gray.600">No Instruments Found</Heading>
                                                            <Text fontSize="xs" color="gray.400">
                                                                {searchQuery ? 'Try adjusting your search query or filter.' : 'Start by registering your first instrument in the Form tab.'}
                                                            </Text>
                                                        </VStack>
                                                    </Card>
                                                )}
                                            </VStack>
                                        )}

                                        {/* ── VIEW LAYOUT 2: DATA TABLE VIEW ── */}
                                        {viewLayout === 'table' && (
                                            <Box overflowX="auto" bg="white" borderRadius="2xl" boxShadow="sm" border="1px solid" borderColor="gray.200">
                                                <Table variant="simple" size="md">
                                                    <Thead bg="blue.50">
                                                        <Tr>
                                                            <Th color="blue.900" py={4}>Photo</Th>
                                                            <Th color="blue.900" py={4}>Type / Hierarchy</Th>
                                                            <Th color="blue.900" py={4}>Serial No</Th>
                                                            <Th color="blue.900" py={4}>Instrument Name</Th>
                                                            <Th color="blue.900" py={4}>Model</Th>
                                                            <Th color="blue.900" py={4}>Group</Th>
                                                            <Th color="blue.900" py={4} textAlign="center">Actions</Th>
                                                        </Tr>
                                                    </Thead>
                                                    <Tbody>
                                                        {filteredInstruments.map(inst => {
                                                            const mainPhoto = inst.photos?.[0]?.url || inst.photo?.url;
                                                            const parentOfInst = getParentOf(inst);
                                                            const groupInfo = getGroupOf(inst._id);
                                                            const childrenCount = getChildrenOf(inst._id).length;

                                                            return (
                                                                <Tr key={inst._id} _hover={{ bg: "blue.50" }} transition="all 0.15s">
                                                                    <Td py={3}>
                                                                        {mainPhoto ? (
                                                                            <Image
                                                                                src={`${API_BASE_URL}${mainPhoto}`}
                                                                                alt={inst.instrumentName}
                                                                                boxSize="44px"
                                                                                objectFit="cover"
                                                                                borderRadius="lg"
                                                                                cursor="pointer"
                                                                                onClick={() => setLightboxPhoto(`${API_BASE_URL}${mainPhoto}`)}
                                                                                fallback={<Center boxSize="44px" bg="gray.100" borderRadius="lg"><Icon as={FaWrench} color="gray.400" /></Center>}
                                                                            />
                                                                        ) : (
                                                                            <Center boxSize="44px" bg="gray.100" borderRadius="lg">
                                                                                <Icon as={inst.parentInstrumentId ? FaMicrochip : FaWrench} color="gray.400" />
                                                                            </Center>
                                                                        )}
                                                                    </Td>
                                                                    <Td py={3}>
                                                                        {inst.parentInstrumentId ? (
                                                                            <Badge colorScheme="orange" borderRadius="md" px={2} py={0.5} fontSize="0.7rem">
                                                                                Child of {parentOfInst?.serialNo || 'Parent'}
                                                                            </Badge>
                                                                        ) : (
                                                                            <Badge colorScheme="blue" borderRadius="md" px={2} py={0.5} fontSize="0.7rem">
                                                                                Parent ({childrenCount} Acc)
                                                                            </Badge>
                                                                        )}
                                                                    </Td>
                                                                    <Td py={3} fontWeight="bold" color="blue.700">
                                                                        {inst.serialNo || 'N/A'}
                                                                    </Td>
                                                                    <Td py={3} fontWeight="semibold">
                                                                        {inst.instrumentName || 'Unnamed'}
                                                                    </Td>
                                                                    <Td py={3} color="gray.600">
                                                                        {inst.model || '—'}
                                                                    </Td>
                                                                    <Td py={3}>
                                                                        {groupInfo ? (
                                                                            <Badge colorScheme="purple" borderRadius="md" px={2}>
                                                                                {groupInfo.name}
                                                                            </Badge>
                                                                        ) : (
                                                                            <Text fontSize="xs" color="gray.400">—</Text>
                                                                        )}
                                                                    </Td>
                                                                    <Td py={3} textAlign="center">
                                                                        <HStack justify="center" spacing={1}>
                                                                            <IconButton
                                                                                aria-label="View"
                                                                                size="sm"
                                                                                colorScheme="teal"
                                                                                variant="ghost"
                                                                                icon={<Icon as={FaEye} />}
                                                                                onClick={() => openViewModal(inst)}
                                                                            />
                                                                            <IconButton
                                                                                aria-label="Edit"
                                                                                size="sm"
                                                                                colorScheme="blue"
                                                                                variant="ghost"
                                                                                icon={<Icon as={FaEdit} />}
                                                                                onClick={() => handleEdit(inst)}
                                                                            />
                                                                            <IconButton
                                                                                aria-label="Delete"
                                                                                size="sm"
                                                                                colorScheme="red"
                                                                                variant="ghost"
                                                                                icon={<Icon as={FaTrash} />}
                                                                                onClick={() => handleDelete(inst._id)}
                                                                            />
                                                                        </HStack>
                                                                    </Td>
                                                                </Tr>
                                                            );
                                                        })}
                                                        {filteredInstruments.length === 0 && (
                                                            <Tr>
                                                                <Td colSpan={7} textAlign="center" py={12} color="gray.400">
                                                                    <VStack spacing={2}>
                                                                        <Icon as={FaWrench} boxSize={8} opacity={0.3} />
                                                                        <Text fontSize="sm">No instruments matching your filters.</Text>
                                                                    </VStack>
                                                                </Td>
                                                            </Tr>
                                                        )}
                                                    </Tbody>
                                                </Table>
                                            </Box>
                                        )}

                                        {/* ── VIEW LAYOUT 3: GRID CARDS VIEW ── */}
                                        {viewLayout === 'grid' && (
                                            <SimpleGrid columns={{ base: 1, sm: 2, lg: 3, xl: 4 }} spacing={4}>
                                                {filteredInstruments.map(inst => {
                                                    const mainPhoto = inst.photos?.[0]?.url || inst.photo?.url;
                                                    const parentOfInst = getParentOf(inst);
                                                    const groupInfo = getGroupOf(inst._id);
                                                    const childrenCount = getChildrenOf(inst._id).length;

                                                    return (
                                                        <Card
                                                            key={inst._id}
                                                            borderRadius="2xl"
                                                            overflow="hidden"
                                                            border="1px solid"
                                                            borderColor="gray.200"
                                                            bg="white"
                                                            boxShadow="sm"
                                                            _hover={{ transform: 'translateY(-3px)', shadow: 'lg', borderColor: 'blue.300' }}
                                                            transition="all 0.25s"
                                                        >
                                                            {/* Card Photo Header */}
                                                            <Box position="relative" h="150px" bg="gray.100">
                                                                {mainPhoto ? (
                                                                    <Image
                                                                        src={`${API_BASE_URL}${mainPhoto}`}
                                                                        alt={inst.instrumentName}
                                                                        w="full"
                                                                        h="full"
                                                                        objectFit="cover"
                                                                        cursor="pointer"
                                                                        onClick={() => setLightboxPhoto(`${API_BASE_URL}${mainPhoto}`)}
                                                                    />
                                                                ) : (
                                                                    <Center h="full" bgGradient="linear(135deg, blue.50, indigo.50)" color="blue.400">
                                                                        <Icon as={inst.parentInstrumentId ? FaMicrochip : FaWrench} boxSize={10} />
                                                                    </Center>
                                                                )}
                                                                <Badge
                                                                    position="absolute"
                                                                    top={3}
                                                                    left={3}
                                                                    colorScheme={inst.parentInstrumentId ? "orange" : "blue"}
                                                                    variant="solid"
                                                                    borderRadius="md"
                                                                    px={2}
                                                                    fontSize="0.65rem"
                                                                    boxShadow="sm"
                                                                >
                                                                    {inst.parentInstrumentId ? 'CHILD ACCESSORY' : 'PARENT UNIT'}
                                                                </Badge>
                                                                {inst.photos && inst.photos.length > 1 && (
                                                                    <Badge position="absolute" bottom={2} right={2} colorScheme="blackAlpha" borderRadius="md" px={1.5} fontSize="0.65rem">
                                                                        📷 {inst.photos.length} photos
                                                                    </Badge>
                                                                )}
                                                            </Box>

                                                            {/* Card Content */}
                                                            <Box p={4}>
                                                                <VStack align="start" spacing={2}>
                                                                    <Heading size="sm" color="gray.800" noOfLines={1}>
                                                                        {inst.instrumentName || 'Unnamed Instrument'}
                                                                    </Heading>
                                                                    <HStack spacing={2} wrap="wrap">
                                                                        <Badge colorScheme="blue" borderRadius="md" px={2}>{inst.serialNo}</Badge>
                                                                        {inst.model && <Text fontSize="xs" color="gray.500">{inst.model}</Text>}
                                                                    </HStack>

                                                                    {inst.parentInstrumentId && parentOfInst && (
                                                                        <Text fontSize="xs" color="orange.600" noOfLines={1}>
                                                                            ↳ Linked to: {parentOfInst.instrumentName || parentOfInst.serialNo}
                                                                        </Text>
                                                                    )}

                                                                    {!inst.parentInstrumentId && childrenCount > 0 && (
                                                                        <Text fontSize="xs" color="blue.600" fontWeight="bold">
                                                                            ⚡ {childrenCount} child accessories
                                                                        </Text>
                                                                    )}

                                                                    {groupInfo && (
                                                                        <Badge colorScheme="purple" fontSize="0.65rem" borderRadius="md">
                                                                            Group: {groupInfo.name}
                                                                        </Badge>
                                                                    )}

                                                                    <Divider my={1} />

                                                                    <HStack justify="space-between" w="full" pt={1}>
                                                                        <Button size="xs" colorScheme="teal" variant="ghost" leftIcon={<Icon as={FaEye} />} onClick={() => openViewModal(inst)}>
                                                                            View
                                                                        </Button>
                                                                        <HStack spacing={1}>
                                                                            <IconButton aria-label="Edit" size="xs" colorScheme="blue" variant="ghost" icon={<Icon as={FaEdit} />} onClick={() => handleEdit(inst)} />
                                                                            <IconButton aria-label="Delete" size="xs" colorScheme="red" variant="ghost" icon={<Icon as={FaTrash} />} onClick={() => handleDelete(inst._id)} />
                                                                        </HStack>
                                                                    </HStack>
                                                                </VStack>
                                                            </Box>
                                                        </Card>
                                                    );
                                                })}
                                            </SimpleGrid>
                                        )}

                                    </VStack>
                                </TabPanel>
                            )}

                            {/* ══════════════════════════════════════════════════════════════ */}
                            {/* ── TAB 3: INSTRUMENT GROUPS MANAGEMENT ── */}
                            {/* ══════════════════════════════════════════════════════════════ */}
                            {tabConfig.some(t => t.id === 'groups') && (
                                <TabPanel p={0}>
                                    <VStack spacing={6} align="stretch">

                                        {/* Instrument Selection & Group Creation Card */}
                                        <Card borderRadius="2xl" p={{ base: 5, md: 6 }} border="1px solid" borderColor="purple.200" bg="white" boxShadow="sm">
                                            <Flex justify="space-between" align={{ base: 'start', sm: 'center' }} direction={{ base: 'column', sm: 'row' }} gap={3} mb={4}>
                                                <VStack align="start" spacing={0}>
                                                    <Heading size="sm" color="purple.800">
                                                        Select Instruments to Create a Group
                                                    </Heading>
                                                    <Text fontSize="xs" color="gray.500">
                                                        Group survey kits, field units, or bundled instrument accessories together under an auto-generated Group ID.
                                                    </Text>
                                                </VStack>
                                                <Button
                                                    colorScheme="purple"
                                                    bg="purple.600"
                                                    _hover={{ bg: 'purple.700' }}
                                                    onClick={handleStartCreateGroup}
                                                    isDisabled={selectedInstrumentIds.length === 0}
                                                    borderRadius="xl"
                                                    px={6}
                                                    shadow="md"
                                                    leftIcon={<Icon as={FaPlus} />}
                                                >
                                                    Create Group ({selectedInstrumentIds.length})
                                                </Button>
                                            </Flex>

                                            {/* Search within available instruments */}
                                            <HStack mb={3} bg="gray.50" borderRadius="xl" px={3} py={1} border="1px solid" borderColor="gray.200">
                                                <Icon as={FaSearch} color="gray.400" />
                                                <Input
                                                    variant="unstyled"
                                                    placeholder="Filter available instruments for grouping..."
                                                    value={groupSearchQuery}
                                                    onChange={(e) => setGroupSearchQuery(e.target.value)}
                                                    fontSize="xs"
                                                />
                                            </HStack>

                                            {getAvailableInstrumentsForGroup().length === 0 ? (
                                                <Box py={6} textAlign="center" bg="gray.50" borderRadius="xl" border="1px dashed" borderColor="gray.300">
                                                    <Text fontSize="xs" color="gray.400" fontStyle="italic">
                                                        All instruments are currently assigned to groups or none exist.
                                                    </Text>
                                                </Box>
                                            ) : (
                                                <Box border="1px solid" borderColor="gray.200" borderRadius="xl" p={4} maxH="260px" overflowY="auto" bg="gray.50">
                                                    <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={3}>
                                                        {getAvailableInstrumentsForGroup()
                                                            .filter(inst => groupSearchQuery === '' ||
                                                                (inst.serialNo && inst.serialNo.toLowerCase().includes(groupSearchQuery.toLowerCase())) ||
                                                                (inst.instrumentName && inst.instrumentName.toLowerCase().includes(groupSearchQuery.toLowerCase())) ||
                                                                (inst.model && inst.model.toLowerCase().includes(groupSearchQuery.toLowerCase()))
                                                            )
                                                            .map(inst => {
                                                                const isChecked = selectedInstrumentIds.includes(inst._id);
                                                                const instPhoto = inst.photos?.[0]?.url || inst.photo?.url;
                                                                return (
                                                                    <Box
                                                                        key={inst._id}
                                                                        p={2.5}
                                                                        bg={isChecked ? "purple.50" : "white"}
                                                                        borderRadius="xl"
                                                                        border="1px solid"
                                                                        borderColor={isChecked ? "purple.400" : "gray.200"}
                                                                        cursor="pointer"
                                                                        onClick={() => handleMainInstrumentToggle(inst._id)}
                                                                        transition="all 0.15s"
                                                                    >
                                                                        <HStack spacing={3}>
                                                                            <Checkbox
                                                                                isChecked={isChecked}
                                                                                onChange={() => handleMainInstrumentToggle(inst._id)}
                                                                                colorScheme="purple"
                                                                            />
                                                                            {instPhoto ? (
                                                                                <Image src={`${API_BASE_URL}${instPhoto}`} alt="" boxSize="32px" borderRadius="md" objectFit="cover" />
                                                                            ) : (
                                                                                <Center boxSize="32px" borderRadius="md" bg="gray.100" color="gray.400">
                                                                                    <Icon as={FaWrench} boxSize={3} />
                                                                                </Center>
                                                                            )}
                                                                            <VStack align="start" spacing={0} flex={1}>
                                                                                <Text fontSize="xs" fontWeight="bold" noOfLines={1}>
                                                                                    {inst.instrumentName || 'Unnamed'}
                                                                                </Text>
                                                                                <Text fontSize="0.65rem" color="gray.500">
                                                                                    {inst.serialNo} {inst.model ? `| ${inst.model}` : ''}
                                                                                </Text>
                                                                            </VStack>
                                                                        </HStack>
                                                                    </Box>
                                                                );
                                                            })}
                                                    </SimpleGrid>
                                                </Box>
                                            )}
                                        </Card>

                                        {/* Groups List Table */}
                                        <Box overflowX="auto" border="1px solid" borderColor="gray.200" borderRadius="2xl" bg="white" boxShadow="sm">
                                            <Table variant="simple" size="md">
                                                <Thead bg="purple.50">
                                                    <Tr>
                                                        <Th color="purple.900" py={4}>Group ID</Th>
                                                        <Th color="purple.900" py={4}>Group Name</Th>
                                                        <Th color="purple.900" py={4}>Member Instruments</Th>
                                                        <Th color="purple.900" py={4} textAlign="center">Actions</Th>
                                                    </Tr>
                                                </Thead>
                                                <Tbody>
                                                    {groups.map(grp => (
                                                        <Tr key={grp._id} _hover={{ bg: "purple.50" }}>
                                                            <Td py={3}>
                                                                <Badge colorScheme="purple" borderRadius="md" px={2.5} py={1} fontWeight="bold">
                                                                    {grp.groupId}
                                                                </Badge>
                                                            </Td>
                                                            <Td py={3} fontWeight="bold" color="gray.800">
                                                                {grp.name}
                                                            </Td>
                                                            <Td py={3}>
                                                                <HStack spacing={1.5} wrap="wrap">
                                                                    {grp.instruments && grp.instruments.length > 0 ? (
                                                                        grp.instruments.map(inst => (
                                                                            <Tag key={inst._id} size="sm" colorScheme="gray" variant="solid" borderRadius="full" px={2.5}>
                                                                                {inst.instrumentName || 'Unnamed'} ({inst.serialNo})
                                                                            </Tag>
                                                                        ))
                                                                    ) : (
                                                                        <Text fontSize="xs" color="gray.400">Empty Group</Text>
                                                                    )}
                                                                </HStack>
                                                            </Td>
                                                            <Td py={3} textAlign="center">
                                                                <HStack justify="center" spacing={2}>
                                                                    <IconButton
                                                                        aria-label="Edit Group"
                                                                        icon={<Icon as={FaEdit} />}
                                                                        size="sm"
                                                                        colorScheme="purple"
                                                                        variant="ghost"
                                                                        onClick={() => handleGroupEdit(grp)}
                                                                    />
                                                                    <IconButton
                                                                        aria-label="Delete Group"
                                                                        icon={<Icon as={FaTrash} />}
                                                                        size="sm"
                                                                        colorScheme="red"
                                                                        variant="ghost"
                                                                        onClick={() => handleGroupDelete(grp._id)}
                                                                    />
                                                                </HStack>
                                                            </Td>
                                                        </Tr>
                                                    ))}
                                                    {groups.length === 0 && (
                                                        <Tr>
                                                            <Td colSpan={4} textAlign="center" py={10} color="gray.400">
                                                                <VStack spacing={2}>
                                                                    <Icon as={FaLayerGroup} boxSize={8} opacity={0.3} />
                                                                    <Text fontSize="sm">No instrument groups created yet.</Text>
                                                                </VStack>
                                                            </Td>
                                                        </Tr>
                                                    )}
                                                </Tbody>
                                            </Table>
                                        </Box>
                                    </VStack>
                                </TabPanel>
                            )}

                        </TabPanels>
                    </Tabs>
                )}

                {/* ══════════════════════════════════════════════════════════════ */}
                {/* ── MODAL: VIEW INSTRUMENT DETAILS & FULL PHOTO GALLERY ── */}
                {/* ══════════════════════════════════════════════════════════════ */}
                {viewInstrument && (
                    <Box
                        position="fixed" top={0} left={0} right={0} bottom={0}
                        bg="blackAlpha.700"
                        zIndex={10000}
                        display="flex" alignItems="center" justifyContent="center" p={{ base: 2, md: 4 }}
                        onClick={() => setViewInstrument(null)}
                        className="uni-modal-overlay"
                    >
                        <Box
                            bg="white" borderRadius="3xl" maxW="750px" w="full" boxShadow="2xl"
                            overflow="hidden" onClick={(e) => e.stopPropagation()}
                            maxH="90vh" display="flex" flexDirection="column"
                            className="uni-modal-box"
                        >
                            {/* Modal Header */}
                            <Box bgGradient="linear(to-r, blue.800, indigo.700)" p={6} color="white">
                                <Flex justify="space-between" align="center">
                                    <HStack spacing={4}>
                                        <Center boxSize="46px" borderRadius="xl" bg="whiteAlpha.200">
                                            <Icon as={viewInstrument.parentInstrumentId ? FaMicrochip : FaWrench} boxSize={6} />
                                        </Center>
                                        <VStack align="start" spacing={0}>
                                            <Heading size="md">{viewInstrument.instrumentName || 'Unnamed Instrument'}</Heading>
                                            <Text fontSize="xs" opacity={0.85}>
                                                Serial No: {viewInstrument.serialNo || 'N/A'} • Model: {viewInstrument.model || 'N/A'}
                                            </Text>
                                        </VStack>
                                    </HStack>

                                    <HStack spacing={2}>
                                        <Button
                                            size="sm"
                                            colorScheme="whiteAlpha"
                                            leftIcon={<Icon as={FaEdit} />}
                                            borderRadius="xl"
                                            onClick={() => {
                                                const inst = viewInstrument;
                                                setViewInstrument(null);
                                                handleEdit(inst);
                                            }}
                                        >
                                            Edit
                                        </Button>
                                        <IconButton
                                            aria-label="Close"
                                            icon={<Icon as={FaTimes} />}
                                            size="sm"
                                            variant="ghost"
                                            color="white"
                                            onClick={() => setViewInstrument(null)}
                                        />
                                    </HStack>
                                </Flex>
                            </Box>

                            {/* Modal Scrollable Body */}
                            <Box p={{ base: 5, md: 7 }} overflowY="auto" flex="1">
                                <VStack spacing={6} align="stretch">

                                    {/* Gallery & Photo Showcase */}
                                    {(() => {
                                        const allPhotos = viewInstrument.photos && viewInstrument.photos.length > 0
                                            ? viewInstrument.photos
                                            : (viewInstrument.photo ? [viewInstrument.photo] : []);
                                        
                                        const currentPhoto = allPhotos[modalActivePhotoIndex] || allPhotos[0];

                                        return (
                                            <Box>
                                                <Text fontSize="xs" fontWeight="bold" color="blue.600" textTransform="uppercase" letterSpacing="wider" mb={3}>
                                                    Photo Gallery ({allPhotos.length})
                                                </Text>
                                                {allPhotos.length > 0 ? (
                                                    <VStack spacing={3} align="stretch">
                                                        <Box
                                                            borderRadius="2xl"
                                                            overflow="hidden"
                                                            h="260px"
                                                            bg="gray.100"
                                                            border="1px solid"
                                                            borderColor="gray.200"
                                                            position="relative"
                                                            cursor="pointer"
                                                            onClick={() => setLightboxPhoto(`${API_BASE_URL}${currentPhoto.url}`)}
                                                        >
                                                            <Image
                                                                src={`${API_BASE_URL}${currentPhoto.url}`}
                                                                alt={viewInstrument.instrumentName}
                                                                w="full"
                                                                h="full"
                                                                objectFit="contain"
                                                                bg="blackAlpha.900"
                                                            />
                                                            <Badge position="absolute" bottom={3} right={3} colorScheme="blackAlpha" borderRadius="md" px={2} py={1}>
                                                                Click to Enlarge 🔍
                                                            </Badge>
                                                        </Box>

                                                        {allPhotos.length > 1 && (
                                                            <HStack spacing={2} overflowX="auto" py={1}>
                                                                {allPhotos.map((p, pIdx) => (
                                                                    <Box
                                                                        key={pIdx}
                                                                        boxSize="60px"
                                                                        borderRadius="xl"
                                                                        overflow="hidden"
                                                                        border={modalActivePhotoIndex === pIdx ? "2px solid" : "1px solid"}
                                                                        borderColor={modalActivePhotoIndex === pIdx ? "blue.500" : "gray.300"}
                                                                        cursor="pointer"
                                                                        onClick={() => setModalActivePhotoIndex(pIdx)}
                                                                        flexShrink={0}
                                                                    >
                                                                        <Image src={`${API_BASE_URL}${p.url}`} alt="" boxSize="full" objectFit="cover" />
                                                                    </Box>
                                                                ))}
                                                            </HStack>
                                                        )}
                                                    </VStack>
                                                ) : (
                                                    <Box p={6} bg="gray.50" borderRadius="2xl" border="1px dashed" borderColor="gray.300" textAlign="center">
                                                        <Text fontSize="xs" color="gray.400">No photos uploaded for this instrument.</Text>
                                                    </Box>
                                                )}
                                            </Box>
                                        );
                                    })()}

                                    {/* Specifications Grid */}
                                    <Box>
                                        <Text fontSize="xs" fontWeight="bold" color="blue.600" textTransform="uppercase" letterSpacing="wider" mb={3}>
                                            Equipment Specifications
                                        </Text>
                                        <SimpleGrid columns={{ base: 2, md: 3 }} spacing={4} bg="gray.50" p={4} borderRadius="2xl" border="1px solid" borderColor="gray.200">
                                            <VStack align="start" spacing={0}>
                                                <Text fontSize="10px" color="gray.500" textTransform="uppercase">Serial Number</Text>
                                                <Text fontSize="sm" fontWeight="bold" color="blue.700">{viewInstrument.serialNo || 'N/A'}</Text>
                                            </VStack>
                                            <VStack align="start" spacing={0}>
                                                <Text fontSize="10px" color="gray.500" textTransform="uppercase">Instrument Name</Text>
                                                <Text fontSize="sm" fontWeight="bold" color="gray.800">{viewInstrument.instrumentName || 'N/A'}</Text>
                                            </VStack>
                                            <VStack align="start" spacing={0}>
                                                <Text fontSize="10px" color="gray.500" textTransform="uppercase">Model</Text>
                                                <Text fontSize="sm" fontWeight="bold" color="gray.800">{viewInstrument.model || 'N/A'}</Text>
                                            </VStack>
                                            <VStack align="start" spacing={0}>
                                                <Text fontSize="10px" color="gray.500" textTransform="uppercase">Role</Text>
                                                <Badge colorScheme={viewInstrument.parentInstrumentId ? "orange" : "blue"} borderRadius="md">
                                                    {viewInstrument.parentInstrumentId ? 'Child Accessory' : 'Parent Unit'}
                                                </Badge>
                                            </VStack>
                                            <VStack align="start" spacing={0}>
                                                <Text fontSize="10px" color="gray.500" textTransform="uppercase">Group</Text>
                                                <Text fontSize="sm" fontWeight="bold" color="purple.700">
                                                    {getGroupOf(viewInstrument._id)?.name || 'None'}
                                                </Text>
                                            </VStack>
                                            <VStack align="start" spacing={0}>
                                                <Text fontSize="10px" color="gray.500" textTransform="uppercase">Created Date</Text>
                                                <Text fontSize="xs" color="gray.600">
                                                    {viewInstrument.createdAt ? new Date(viewInstrument.createdAt).toLocaleDateString() : 'N/A'}
                                                </Text>
                                            </VStack>
                                        </SimpleGrid>
                                    </Box>

                                    {/* Remarks & Notes */}
                                    <Box>
                                        <Text fontSize="xs" fontWeight="bold" color="blue.600" textTransform="uppercase" letterSpacing="wider" mb={2}>
                                            Notes & Remarks
                                        </Text>
                                        <Text fontSize="sm" bg="gray.50" p={4} borderRadius="xl" borderLeft="4px solid" borderColor="blue.400">
                                            {viewInstrument.notes || 'No specific notes recorded for this instrument.'}
                                        </Text>
                                    </Box>

                                    {/* Child Instruments (if Parent) */}
                                    {!viewInstrument.parentInstrumentId && (
                                        <Box>
                                            <Flex justify="space-between" align="center" mb={3}>
                                                <Text fontSize="xs" fontWeight="bold" color="blue.800" textTransform="uppercase" letterSpacing="wider">
                                                    Attached Child Instruments ({getChildrenOf(viewInstrument._id).length})
                                                </Text>
                                            </Flex>

                                            {getChildrenOf(viewInstrument._id).length === 0 ? (
                                                <Box p={4} bg="gray.50" borderRadius="xl" border="1px dashed" borderColor="gray.300" textAlign="center">
                                                    <Text fontSize="xs" color="gray.500" fontStyle="italic">No child accessories attached.</Text>
                                                </Box>
                                            ) : (
                                                <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={3}>
                                                    {getChildrenOf(viewInstrument._id).map(child => {
                                                        const childPhoto = child.photos?.[0]?.url || child.photo?.url;
                                                        return (
                                                            <Card key={child._id} borderRadius="xl" p={3} border="1px solid" borderColor="blue.100" bg="gray.50">
                                                                <HStack spacing={3}>
                                                                    {childPhoto ? (
                                                                        <Image
                                                                            src={`${API_BASE_URL}${childPhoto}`}
                                                                            alt={child.instrumentName}
                                                                            boxSize="44px"
                                                                            borderRadius="lg"
                                                                            objectFit="cover"
                                                                            cursor="pointer"
                                                                            onClick={() => setLightboxPhoto(`${API_BASE_URL}${childPhoto}`)}
                                                                        />
                                                                    ) : (
                                                                        <Center boxSize="44px" borderRadius="lg" bg="blue.100" color="blue.600">
                                                                            <Icon as={FaMicrochip} />
                                                                        </Center>
                                                                    )}
                                                                    <VStack align="start" spacing={0} flex={1}>
                                                                        <Text fontWeight="bold" fontSize="xs">{child.instrumentName || 'Unnamed'}</Text>
                                                                        <Text fontSize="10px" color="gray.500">{child.serialNo} {child.model ? `| ${child.model}` : ''}</Text>
                                                                    </VStack>
                                                                    <Button size="xs" colorScheme="teal" variant="ghost" onClick={() => openViewModal(child)}>
                                                                        View
                                                                    </Button>
                                                                </HStack>
                                                            </Card>
                                                        );
                                                    })}
                                                </SimpleGrid>
                                            )}
                                        </Box>
                                    )}

                                    {/* Parent Link (if Child) */}
                                    {viewInstrument.parentInstrumentId && getParentOf(viewInstrument) && (
                                        <Box>
                                            <Text fontSize="xs" fontWeight="bold" color="blue.700" textTransform="uppercase" letterSpacing="wider" mb={2}>
                                                Parent Equipment Unit
                                            </Text>
                                            <Card borderRadius="xl" p={4} bg="blue.50" border="1px solid" borderColor="blue.200">
                                                <Flex justify="space-between" align="center">
                                                    <HStack spacing={3}>
                                                        <Center boxSize="40px" borderRadius="lg" bg="blue.100" color="blue.600">
                                                            <Icon as={FaBoxes} />
                                                        </Center>
                                                        <VStack align="start" spacing={0}>
                                                            <Text fontWeight="bold" fontSize="sm">{getParentOf(viewInstrument).instrumentName || 'Parent Instrument'}</Text>
                                                            <Text fontSize="xs" color="gray.600">Serial: {getParentOf(viewInstrument).serialNo}</Text>
                                                        </VStack>
                                                    </HStack>
                                                    <Button size="xs" colorScheme="blue" onClick={() => openViewModal(getParentOf(viewInstrument))}>
                                                        View Parent
                                                    </Button>
                                                </Flex>
                                            </Card>
                                        </Box>
                                    )}

                                </VStack>
                            </Box>

                            {/* Modal Footer */}
                            <Box p={4} bg="gray.50" borderTop="1px solid" borderColor="gray.200" textAlign="right">
                                <Button colorScheme="blue" borderRadius="full" px={8} onClick={() => setViewInstrument(null)}>
                                    Close Spec Sheet
                                </Button>
                            </Box>
                        </Box>
                    </Box>
                )}

                {/* ══════════════════════════════════════════════════════════════ */}
                {/* ── MODAL: CREATE / EDIT GROUP ── */}
                {/* ══════════════════════════════════════════════════════════════ */}
                {isGroupModalOpen && (
                    <Box
                        position="fixed" top={0} left={0} right={0} bottom={0}
                        bg="blackAlpha.700"
                        zIndex={10000}
                        display="flex" alignItems="center" justifyContent="center" p={4}
                        onClick={handleGroupClear}
                        className="uni-modal-overlay"
                    >
                        <Box
                            bg="white" borderRadius="3xl" maxW="600px" w="full" boxShadow="2xl"
                            overflow="hidden" onClick={(e) => e.stopPropagation()}
                            className="uni-modal-box"
                        >
                            <Box bgGradient="linear(to-r, purple.800, purple.600)" p={6} color="white">
                                <Flex justify="space-between" align="center">
                                    <HStack spacing={4}>
                                        <Icon as={FaLayerGroup} boxSize={7} />
                                        <VStack align="start" spacing={0}>
                                            <Heading size="md">{groupEditId ? 'Edit Instrument Group' : 'Create Instrument Group'}</Heading>
                                            <Text fontSize="xs" opacity={0.85}>Group ID is auto-assigned. Set a friendly group name below.</Text>
                                        </VStack>
                                    </HStack>
                                    <IconButton aria-label="Close" icon={<Icon as={FaTimes} />} size="sm" variant="ghost" color="white" onClick={handleGroupClear} />
                                </Flex>
                            </Box>

                            <form onSubmit={handleGroupSubmit}>
                                <Box p={6}>
                                    <VStack spacing={5} align="stretch">
                                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                                            <FormControl isReadOnly>
                                                <FormLabel fontSize="sm" fontWeight="bold" color="gray.700">Group ID</FormLabel>
                                                <Input
                                                    value={groupEditId ? (groups.find(g => g._id === groupEditId)?.groupId || '') : groupNextId}
                                                    borderRadius="xl"
                                                    bg="gray.100"
                                                    fontWeight="bold"
                                                />
                                            </FormControl>
                                            <FormControl isRequired>
                                                <FormLabel fontSize="sm" fontWeight="bold" color="gray.700">Group Name</FormLabel>
                                                <Input
                                                    name="name"
                                                    value={groupFormData.name}
                                                    onChange={handleGroupChange}
                                                    placeholder="e.g. Total Station Survey Kit A"
                                                    borderRadius="xl"
                                                    bg="gray.50"
                                                />
                                            </FormControl>
                                        </SimpleGrid>

                                        <FormControl>
                                            <FormLabel fontSize="sm" fontWeight="bold" color="gray.700" mb={2}>
                                                Included Instruments ({groupFormData.instruments.length})
                                            </FormLabel>
                                            <Box border="1px solid" borderColor="gray.200" borderRadius="xl" p={4} maxH="220px" overflowY="auto" bg="gray.50">
                                                <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={3}>
                                                    {getAvailableInstrumentsForGroup().concat(
                                                        instruments.filter(inst => groupFormData.instruments.includes(inst._id) && !getAvailableInstrumentsForGroup().some(ai => ai._id === inst._id))
                                                    ).map(inst => {
                                                        const isChecked = groupFormData.instruments.includes(inst._id);
                                                        const instPhoto = inst.photos?.[0]?.url || inst.photo?.url;
                                                        return (
                                                            <Checkbox
                                                                key={inst._id}
                                                                isChecked={isChecked}
                                                                onChange={() => handleGroupInstrumentToggle(inst._id)}
                                                                colorScheme="purple"
                                                            >
                                                                <Text fontSize="xs">
                                                                    {inst.instrumentName || 'Unnamed'} ({inst.serialNo})
                                                                </Text>
                                                            </Checkbox>
                                                        );
                                                    })}
                                                </SimpleGrid>
                                            </Box>
                                        </FormControl>
                                    </VStack>
                                </Box>

                                <Box p={4} bg="gray.50" borderTop="1px solid" borderColor="gray.200">
                                    <HStack justify="flex-end" spacing={3}>
                                        <Button onClick={handleGroupClear} variant="ghost" borderRadius="full" px={6}>
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            colorScheme="purple"
                                            isLoading={isGroupLoading}
                                            borderRadius="full"
                                            px={8}
                                            shadow="md"
                                        >
                                            {groupEditId ? 'Update Group' : 'Save Group'}
                                        </Button>
                                    </HStack>
                                </Box>
                            </form>
                        </Box>
                    </Box>
                )}

                {/* ══════════════════════════════════════════════════════════════ */}
                {/* ── PHOTO LIGHTBOX MODAL (FULL RESOLUTION ZOOM) ── */}
                {/* ══════════════════════════════════════════════════════════════ */}
                {lightboxPhoto && (
                    <Box
                        position="fixed" top={0} left={0} right={0} bottom={0}
                        bg="blackAlpha.900"
                        zIndex={20000}
                        display="flex" alignItems="center" justifyContent="center" p={4}
                        onClick={() => setLightboxPhoto(null)}
                    >
                        <Box position="relative" maxW="90vw" maxH="90vh" onClick={(e) => e.stopPropagation()}>
                            <Image
                                src={lightboxPhoto}
                                alt="High Resolution Preview"
                                maxW="90vw"
                                maxH="85vh"
                                objectFit="contain"
                                borderRadius="2xl"
                                boxShadow="2xl"
                            />
                            <IconButton
                                aria-label="Close Lightbox"
                                icon={<Icon as={FaTimes} />}
                                size="md"
                                colorScheme="whiteAlpha"
                                position="absolute"
                                top={-4}
                                right={-4}
                                borderRadius="full"
                                bg="red.500"
                                color="white"
                                _hover={{ bg: 'red.600' }}
                                onClick={() => setLightboxPhoto(null)}
                            />
                        </Box>
                    </Box>
                )}

            </Container>

            {/* Confirmation Dialog */}
            <AlertDialog isOpen={isConfirmOpen} leastDestructiveRef={cancelRef} onClose={onConfirmClose} isCentered>
                <AlertDialogOverlay>
                    <AlertDialogContent borderRadius="2xl">
                        <AlertDialogHeader fontSize="lg" fontWeight="bold">Confirm Instrument Resource</AlertDialogHeader>
                        <AlertDialogBody>
                            Are you sure you want to {editId ? 'update' : 'save'} <strong>{formData.instrumentName || formData.serialNo}</strong>
                            {formChildren.length > 0 && ` along with ${formChildren.length} child accessory records and photos`}?
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

const SERVICES_TAB_KEY = 'services_active_tab_key';

const Services = () => {
    const { user } = useAuth();
    const isAdmin = user && user.isAdmin;
    const [searchParams, setSearchParams] = useSearchParams();
    const urlView = searchParams.get('view'); // 'masters' | 'public'
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const [adminViewMode, setAdminViewMode] = useState(() => {
        if (urlView === 'public') return 'public';
        return 'masters';
    });

    useEffect(() => {
        if (urlView === 'public') {
            setAdminViewMode('public');
        } else if (urlView === 'masters') {
            setAdminViewMode('masters');
        }
    }, [urlView]);

    const handleSwitchView = (mode) => {
        setAdminViewMode(mode);
        setSearchParams(prev => {
            const next = new URLSearchParams(prev);
            next.set('view', mode);
            return next;
        });
    };

    const adminServiceTabs = [
        { key: 'vehicleMaster', groupKey: 'vehicleMasterGroup', label: 'Vehicle Master', icon: FaTruck, colorScheme: 'purple', component: <VehicleMasterForm /> },
        { key: 'employeeMaster', groupKey: 'employeeMasterGroup', label: 'Employee Master', icon: FaUserTie, colorScheme: 'blue', component: <EmployeeMasterForm /> },
        { key: 'clientMaster', groupKey: 'clientMasterGroup', label: 'Client Master', icon: FaHandshake, colorScheme: 'orange', component: <ClientMasterForm /> },
        { key: 'siteMaster', groupKey: 'siteMasterGroup', label: 'Site Master', icon: FaMap, colorScheme: 'teal', component: <SiteMasterForm /> },
        { key: 'scheduleMaster', groupKey: 'scheduleMasterGroup', label: 'Scheduler', icon: FaCalendarAlt, colorScheme: 'green', component: <ScheduleMasterForm /> },
        { key: 'instrumentMaster', groupKey: 'instrumentMasterGroup', label: 'Instruments', icon: FaWrench, colorScheme: 'blue', component: <InstrumentMasterForm /> },
        { key: 'employeeExpense', groupKey: 'employeeExpenseGroup', label: 'Employee Ledger', icon: FaMoneyBillWave, colorScheme: 'blue', component: <EmployeeExpensesModule isInsideServices={true} /> },
        { key: 'draftingWork', groupKey: 'otherServicesGroup', subFilter: 'draftingWork', label: 'Drafting Work', icon: FaFolderOpen, colorScheme: 'purple', component: <AdminDraftingWork isInsideServices={true} /> },
        { key: 'invoiceReport', groupKey: 'otherServicesGroup', subFilter: 'invoiceReport', label: 'Invoice Report', icon: FaFileInvoiceDollar, colorScheme: 'blue', component: <InvoiceReport isInsideServices={true} /> },
        { key: 'companyMaster', groupKey: 'otherServicesGroup', subFilter: 'companyMaster', label: 'Our Companies', icon: FaBuilding, colorScheme: 'teal', component: <CompanyMaster /> },
    ].filter(t => hasPermission(user, t.key, 'read'));

    // Store tab KEY ('siteMaster', 'clientMaster', etc.) to avoid race conditions with permission loading
    const [activeTabKey, setActiveTabKey] = useState(() => {
        try {
            return localStorage.getItem(SERVICES_TAB_KEY) || 'vehicleMaster';
        } catch {
            return 'vehicleMaster';
        }
    });

    // Derive active index dynamically on render
    const matchingIndex = adminServiceTabs.findIndex(t => t.key === activeTabKey);
    const activeTabIndex = matchingIndex !== -1 ? matchingIndex : 0;

    const handleTabChange = (index) => {
        const selectedTab = adminServiceTabs[index];
        if (selectedTab) {
            setActiveTabKey(selectedTab.key);
            try {
                localStorage.setItem(SERVICES_TAB_KEY, selectedTab.key);
            } catch (e) {
                console.error('Error saving active tab', e);
            }
        }
    };

    return (
        <Box>
            {isAdmin ? (
                <Box bg="gray.100" minH="100vh" pt={{ base: 3, md: 6 }} pb={{ base: "110px", md: 12 }}>
                    <Container maxW="full" px={{ base: 2, xl: 6 }}>
                        {/* Top View Mode Switcher: Masters vs Public Service */}
                        <Flex 
                            mb={4} 
                            p={{ base: 2, md: 3 }} 
                            bg="white" 
                            borderRadius="2xl" 
                            boxShadow="sm" 
                            border="1px solid" 
                            borderColor="gray.200" 
                            align="center" 
                            justify="space-between"
                            flexWrap="wrap"
                            gap={2}
                        >
                            <HStack spacing={2}>
                                <Button
                                    size={{ base: "xs", sm: "sm" }}
                                    colorScheme="purple"
                                    variant={adminViewMode === 'masters' ? 'solid' : 'ghost'}
                                    leftIcon={<Icon as={FaSitemap} />}
                                    onClick={() => handleSwitchView('masters')}
                                    borderRadius="xl"
                                    fontWeight="bold"
                                    px={{ base: 3, sm: 4 }}
                                >
                                    Masters
                                </Button>
                                <Button
                                    size={{ base: "xs", sm: "sm" }}
                                    colorScheme="blue"
                                    variant={adminViewMode === 'public' ? 'solid' : 'ghost'}
                                    leftIcon={<Icon as={FaRoad} />}
                                    onClick={() => handleSwitchView('public')}
                                    borderRadius="xl"
                                    fontWeight="bold"
                                    px={{ base: 3, sm: 4 }}
                                >
                                    Public Service
                                </Button>
                            </HStack>

                            {adminViewMode === 'masters' && (
                                <HStack spacing={2}>
                                    {/* Active Master Badge on Mobile */}
                                    <Badge 
                                        display={{ base: 'inline-flex', md: 'none' }}
                                        colorScheme={adminServiceTabs[activeTabIndex]?.colorScheme || 'purple'} 
                                        px={2.5} 
                                        py={1} 
                                        borderRadius="full" 
                                        fontSize="10px"
                                        fontWeight="800"
                                    >
                                        {adminServiceTabs[activeTabIndex]?.label || 'Master'}
                                    </Badge>
                                    <Button 
                                        display={{ base: 'none', md: 'inline-flex' }}
                                        size="sm" 
                                        colorScheme="gray" 
                                        variant="outline" 
                                        leftIcon={<Icon as={isSidebarOpen ? FaChevronLeft : FaChevronRight} />}
                                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                                        borderRadius="lg"
                                    >
                                        {isSidebarOpen ? 'Hide Menu' : 'Show Menu'}
                                    </Button>
                                </HStack>
                            )}

                            {adminViewMode === 'public' && (
                                <Badge colorScheme="blue" px={3} py={1} borderRadius="full" fontSize="xs">
                                    👁️ Public Customer Preview
                                </Badge>
                            )}
                        </Flex>

                        {adminViewMode === 'public' ? (
                            <Box bg="white" borderRadius="3xl" overflow="hidden" boxShadow="md">
                                <CivilEngineeringServices />
                            </Box>
                        ) : adminServiceTabs.length === 0 ? (
                            <Box bg="white" p={10} borderRadius="2xl" textAlign="center" boxShadow="md">
                                <Text fontSize="lg" fontWeight="bold" color="gray.600">No Authorized Modules Available</Text>
                                <Text fontSize="sm" color="gray.400" mt={1}>Please contact your Super Admin if you require access to these administrative modules.</Text>
                            </Box>
                        ) : (
                            <>
                                {/* Mobile Horizontal Quick Scroll Bar for Masters (Top) */}
                                <Box 
                                    display={{ base: 'block', md: 'none' }} 
                                    mb={3} 
                                    overflowX="auto" 
                                    py={1}
                                    css={{
                                        '&::-webkit-scrollbar': { display: 'none' },
                                        scrollbarWidth: 'none'
                                    }}
                                >
                                    <HStack spacing={2} minW="max-content">
                                        {adminServiceTabs.map((t, idx) => {
                                            const isActive = idx === activeTabIndex;
                                            return (
                                                <Button
                                                    key={t.key}
                                                    size="xs"
                                                    borderRadius="full"
                                                    colorScheme={t.colorScheme}
                                                    variant={isActive ? 'solid' : 'outline'}
                                                    bg={isActive ? `${t.colorScheme}.500` : 'white'}
                                                    color={isActive ? 'white' : `${t.colorScheme}.600`}
                                                    borderColor={isActive ? `${t.colorScheme}.500` : 'gray.200'}
                                                    leftIcon={<Icon as={t.icon} />}
                                                    onClick={() => handleTabChange(idx)}
                                                    fontWeight={isActive ? '800' : '600'}
                                                    px={3}
                                                    py={1.5}
                                                    shadow={isActive ? 'sm' : 'none'}
                                                >
                                                    {t.label}
                                                </Button>
                                            );
                                        })}
                                    </HStack>
                                </Box>

                                {/* Main Tabs Area */}
                                <Tabs 
                                    index={activeTabIndex} 
                                    onChange={handleTabChange} 
                                    isLazy 
                                    variant="soft-rounded" 
                                    colorScheme="purple" 
                                    orientation="vertical" 
                                    w="full"
                                >
                                    {isSidebarOpen && (
                                        <TabList 
                                            display={{ base: 'none', md: 'flex' }}
                                            bg="white" 
                                            p={4} 
                                            borderRadius="2xl" 
                                            boxShadow="md" 
                                            mr={4} 
                                            minW="200px" 
                                            gap={2}
                                        >
                                            {adminServiceTabs.map((t) => (
                                                <Tab 
                                                    key={t.key} 
                                                    _selected={{ color: 'white', bg: `${t.colorScheme}.500`, shadow: 'md' }} 
                                                    px={5} 
                                                    py={3} 
                                                    fontWeight="bold" 
                                                    ml={0} 
                                                    textAlign="left" 
                                                    justifyContent="start"
                                                    borderRadius="xl"
                                                    transition="all 0.2s"
                                                >
                                                    <Icon as={t.icon} mr={2.5} /> {t.label}
                                                </Tab>
                                            ))}
                                        </TabList>
                                    )}

                                    <TabPanels flex={1} w="full" minW={0}>
                                        {adminServiceTabs.map((t) => (
                                            <TabPanel key={t.key} p={0} w="full">
                                                <ModulePermissionBar moduleGroupKey={t.groupKey} subModuleFilterKey={t.subFilter} />
                                                <Box w="full" overflowX="auto">
                                                    {t.component}
                                                </Box>
                                            </TabPanel>
                                        ))}
                                    </TabPanels>
                                </Tabs>

                                {/* Fixed Mobile Master Dock Navigation Bar (Bottom) */}
                                <Box
                                    display={{ base: 'block', md: 'none' }}
                                    position="fixed"
                                    bottom="0"
                                    left="0"
                                    right="0"
                                    zIndex="1300"
                                    bg="white"
                                    borderTop="1px solid"
                                    borderColor="gray.200"
                                    boxShadow="0 -4px 20px rgba(0, 0, 0, 0.12)"
                                    pb="env(safe-area-inset-bottom, 6px)"
                                    pt={1}
                                >
                                    <Flex
                                        overflowX="auto"
                                        px={2}
                                        py={1}
                                        gap={1}
                                        align="center"
                                        css={{
                                            '&::-webkit-scrollbar': { display: 'none' },
                                            scrollbarWidth: 'none',
                                            WebkitOverflowScrolling: 'touch'
                                        }}
                                    >
                                        {adminServiceTabs.map((t, idx) => {
                                            const isActive = idx === activeTabIndex;
                                            return (
                                                <Flex
                                                    key={t.key}
                                                    as="button"
                                                    direction="column"
                                                    align="center"
                                                    justify="center"
                                                    minW="64px"
                                                    flex="1"
                                                    py={1.5}
                                                    px={1}
                                                    borderRadius="xl"
                                                    bg={isActive ? `${t.colorScheme}.50` : 'transparent'}
                                                    color={isActive ? `${t.colorScheme}.600` : 'gray.400'}
                                                    border="none"
                                                    cursor="pointer"
                                                    onClick={() => handleTabChange(idx)}
                                                    transition="all 0.15s"
                                                    _active={{ transform: 'scale(0.93)' }}
                                                >
                                                    <Box
                                                        p={1.5}
                                                        borderRadius="lg"
                                                        bg={isActive ? `${t.colorScheme}.500` : 'transparent'}
                                                        color={isActive ? 'white' : 'inherit'}
                                                        transition="all 0.2s"
                                                        boxShadow={isActive ? 'sm' : 'none'}
                                                    >
                                                        <Icon as={t.icon} boxSize={4} />
                                                    </Box>
                                                    <Text
                                                        fontSize="9px"
                                                        fontWeight={isActive ? '800' : '600'}
                                                        lineHeight="1.1"
                                                        mt="2px"
                                                        whiteSpace="nowrap"
                                                        isTruncated
                                                        maxW="70px"
                                                    >
                                                        {t.label.replace(' Master', '').replace(' Form', '')}
                                                    </Text>
                                                </Flex>
                                            );
                                        })}
                                    </Flex>
                                </Box>
                            </>
                        )}
                    </Container>
                </Box>
            ) : (
                <CivilEngineeringServices />
            )}
        </Box>
    );
};

export default Services;
