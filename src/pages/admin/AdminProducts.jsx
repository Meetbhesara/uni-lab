import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
    Box, Button, Table, Thead, Tbody, Tr, Th, Td, IconButton, useDisclosure,
    Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton,
    FormControl, FormLabel, Input, Textarea, Checkbox, Stack, useToast, Flex,
    Image, Badge, SimpleGrid, Text, InputGroup, InputLeftElement
} from '@chakra-ui/react';
import { FiPlus, FiEdit2, FiTrash2, FiUpload, FiSettings, FiImage, FiInfo, FiDollarSign, FiPackage, FiSearch } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/axios';

const AdminProducts = () => {
    const location = useLocation();
    const [products, setProducts] = useState([]);

    // Disable Input Spinners via CSS Check
    useEffect(() => {
        const style = document.createElement('style');
        style.innerHTML = `
            /* Chrome, Safari, Edge, Opera */
            input::-webkit-outer-spin-button,
            input::-webkit-inner-spin-button {
            -webkit-appearance: none;
            margin: 0;
            }
            /* Firefox */
            input[type=number] {
            -moz-appearance: textfield;
            }
        `;
        document.head.appendChild(style);
        return () => {
            document.head.removeChild(style);
        };
    }, []);
    const { isOpen, onOpen, onClose } = useDisclosure();

    const [editingProduct, setEditingProduct] = useState(null);

    // Super Admin Check
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const isSuperAdmin = user.email === 'super@admin.com' || user.email === 'iatulkanak@gmail.com';

    const getImageUrl = (path) => {
        if (!path) return 'https://via.placeholder.com/150';
        if (path.startsWith('http')) return path;
        const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
        return `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
    };

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        pdf: '',
        sellingPriceStart: '',
        sellingPriceEnd: '',
        purchasePrice: '',
        dealerPrice: '',
        vendor: '',
        details: [], // Array of { key: '', value: '' }
        alternativeNames: [] // Array of strings
    });

    // Separate state for file handling
    const [existingPhotos, setExistingPhotos] = useState([]); // URLs
    const [newPhotos, setNewPhotos] = useState([]); // File Objects

    const toast = useToast();

    useEffect(() => {
        fetchProducts();
    }, [location.pathname]);

    const fetchProducts = async (search = '') => {
        try {
            const res = await api.get(`/products${search ? `?search=${search}` : ''}`);
            setProducts(Array.isArray(res.data) ? res.data : (res.data.data || []));
        } catch (error) {
            console.error(error);
            toast({ title: "Failed to fetch products", status: "error" });
        }
    };

    const handleEdit = (product) => {
        setEditingProduct(product);
        // Transform details Map/Object to Array for form
        let detailsArray = [];
        if (product.details) {
            Object.entries(product.details).forEach(([key, value]) => {
                detailsArray.push({ key, value });
            });
        }

        setFormData({
            name: product.name,
            description: product.description || '',
            pdf: product.pdf || '',
            sellingPriceStart: product.sellingPriceStart || '',
            sellingPriceEnd: product.sellingPriceEnd || '',
            purchasePrice: product.purchasePrice || '',
            dealerPrice: product.dealerPrice || '',
            vendor: product.vendor || '',
            details: detailsArray,
            alternativeNames: product.alternativeNames || []
        });
        setExistingPhotos(product.images || product.photos || []);
        setNewPhotos([]);
        onOpen();
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this product?")) {
            try {
                await api.delete(`/products/${id}`);
                toast({ title: "Product Deleted", status: "success" });
                fetchProducts();
            } catch (error) {
                console.error(error);
                toast({ title: "Delete Failed", status: "error" });
            }
        }
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        // Validation: At least 1 image
        if (existingPhotos.length === 0 && newPhotos.length === 0) {
            toast({ title: "Validation Error", description: "At least 1 product image is required.", status: "error" });
            return;
        }

        const validDetails = formData.details.filter(d => d.key && d.key.trim() !== '');
        // Validation: At least 1 specification (REMOVED: Optional now)
        // if (validDetails.length === 0) {
        //     toast({ title: "Validation Error", description: "At least 1 technical specification is required.", status: "error" });
        //     return;
        // }

        // Validation: No negative prices
        if (Number(formData.sellingPriceStart) < 0 || Number(formData.sellingPriceEnd) < 0 || Number(formData.dealerPrice) < 0 || (Number(formData.purchasePrice) < 0 && formData.purchasePrice)) {
            toast({ title: "Validation Error", description: "Prices cannot be negative.", status: "error" });
            return;
        }

        if (Number(formData.sellingPriceStart) > Number(formData.sellingPriceEnd)) {
            toast({ title: "Validation Error", description: "Start Selling Price cannot be greater than End Selling Price.", status: "error" });
            return;
        }

        // Validation: price check logic removed as simplified

        // Construct FormData
        const data = new FormData();
        data.append('name', formData.name);
        data.append('description', formData.description || '');
        data.append('pdf', formData.pdf || '');
        if (formData.sellingPriceStart && String(formData.sellingPriceStart).trim() !== '') data.append('sellingPriceStart', formData.sellingPriceStart);
        if (formData.sellingPriceEnd && String(formData.sellingPriceEnd).trim() !== '') data.append('sellingPriceEnd', formData.sellingPriceEnd);
        // Append purchasePrice if it has a value (for update or create).
        // Since getProducts hides it for normal admin, formData.purchasePrice will be '' on edit.
        // We only append if user entered something (or it was populated for Super Admin).
        if (formData.purchasePrice && String(formData.purchasePrice).trim() !== '') data.append('purchasePrice', formData.purchasePrice);
        if (formData.dealerPrice && String(formData.dealerPrice).trim() !== '') data.append('dealerPrice', formData.dealerPrice);
        if (formData.vendor) data.append('vendor', formData.vendor);
        data.append('alternativeNames', JSON.stringify(formData.alternativeNames));

        // Convert details array back to Object and stringify for transport
        const detailsMap = {};
        validDetails.forEach(d => {
            detailsMap[d.key] = d.value;
        });
        data.append('details', JSON.stringify(detailsMap));

        // Append Existing Photos
        existingPhotos.forEach(photoUrl => {
            data.append('existingPhotos', photoUrl);
        });

        // Append New Files
        newPhotos.forEach(file => {
            data.append('images', file); // Use 'images' field name as per backend
        });

        try {
            const config = {
                headers: { 'Content-Type': 'multipart/form-data' }
            };

            if (editingProduct) {
                await api.put(`/products/${editingProduct._id || editingProduct.id}`, data, config);
                toast({ title: "Product Updated", status: "success", variant: "subtle" });
            } else {
                await api.post('/products', data, config);
                toast({ title: "Product Created", status: "success", variant: "subtle" });
            }
            onClose();
            // Reset
            setEditingProduct(null);
            setFormData({ name: '', description: '', pdf: '', sellingPriceStart: '', sellingPriceEnd: '', purchasePrice: '', dealerPrice: '', vendor: '', details: [], alternativeNames: [] });
            setExistingPhotos([]);
            setNewPhotos([]);
            fetchProducts();
        } catch (error) {
            console.error(error);
            toast({ title: "Operation Failed", description: error.response?.data?.message || "Unknown error", status: "error" });
        }
    };

    // Details Helpers
    const addDetailRow = () => {
        setFormData(prev => ({ ...prev, details: [...prev.details, { key: '', value: '' }] }));
    };

    const updateDetailRow = (index, field, value) => {
        const newDetails = [...formData.details];
        newDetails[index][field] = value;
        setFormData(prev => ({ ...prev, details: newDetails }));
    };

    const removeDetailRow = (index) => {
        const newDetails = formData.details.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, details: newDetails }));
    };

    // Photo Helpers
    const handleFileChange = (e) => {
        if (e.target.files) {
            setNewPhotos(prev => [...prev, ...Array.from(e.target.files)]);
        }
    };

    const removeNewPhoto = (index) => {
        setNewPhotos(prev => prev.filter((_, i) => i !== index));
    };

    const removeExistingPhoto = (index) => {
        setExistingPhotos(prev => prev.filter((_, i) => i !== index));
    };

    return (
        <Box
            p={6}
            bg="white"
            borderRadius="2xl"
            boxShadow="0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)"
        >
            <Flex justify="space-between" align="center" mb={10}>
                <Stack spacing={1}>
                    <Text fontSize="2xl" fontWeight="800" bgGradient="linear(to-r, brand.500, brand.700)" bgClip="text">
                        Product Inventory
                    </Text>
                    <Text fontSize="sm" color="gray.500">Manage your industrial product catalog with ease.</Text>
                </Stack>
                <Flex gap={4}>
                    <InputGroup>
                        <InputLeftElement pointerEvents='none' children={<FiSearch color='gray.300' />} />
                        <Input
                            placeholder='Search products...'
                            onChange={(e) => fetchProducts(e.target.value)}
                        />
                    </InputGroup>
                    <Button
                        leftIcon={<FiPlus />}
                        size="md"
                        borderRadius="xl"
                        boxShadow="lg"
                        px={8}
                        minW="fit-content"
                        onClick={() => {
                            setEditingProduct(null);
                            setFormData({ name: '', description: '', pdf: '', sellingPriceStart: '', sellingPriceEnd: '', purchasePrice: '', dealerPrice: '', vendor: '', details: [], alternativeNames: [] });
                            setExistingPhotos([]);
                            setNewPhotos([]);
                            onOpen();
                        }}
                    >
                        Add Product
                    </Button>
                </Flex>
            </Flex>

            <Box overflowX="auto" borderRadius="xl" border="1px" borderColor="gray.100">
                <Table variant="simple">
                    <Thead bg="gray.50">
                        <Tr>
                            <Th py={4}>Product Info</Th>
                            <Th py={4}>Vendor</Th>
                            <Th py={4}>Pricing</Th>
                            <Th py={4} textAlign="right">Actions</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {products.map((product) => (
                            <Tr key={product._id || product.id} _hover={{ bg: 'gray.50/50' }} transition="0.2s">
                                <Td>
                                    <Flex align="center" gap={4}>
                                        <Image
                                            src={getImageUrl(product.images?.[0] || product.photos?.[0])}
                                            boxSize="60px"
                                            objectFit="cover"
                                            borderRadius="xl"
                                            boxShadow="sm"
                                            fallbackSrc="https://via.placeholder.com/60?text=No+Img"
                                        />
                                        <Stack spacing={0}>
                                            <Text fontWeight="700" color="gray.800">{product.name}</Text>
                                            <Text fontSize="xs" color="gray.500" noOfLines={1} maxW="200px">
                                                {product.description || 'No description provided'}
                                            </Text>
                                        </Stack>
                                    </Flex>
                                </Td>
                                <Td>
                                    <Badge variant="subtle" colorScheme="blue" borderRadius="full" px={3}>
                                        {product.vendor || 'N/A'}
                                    </Badge>
                                </Td>
                                <Td>
                                    <Stack spacing={0}>
                                        <Text fontWeight="bold" color="brand.600">Sell: ₹{product.sellingPriceStart} - {product.sellingPriceEnd}</Text>
                                        <Text fontSize="xs" color="blue.500">Dealer: ₹{product.dealerPrice}</Text>
                                        {isSuperAdmin && (
                                            <Text fontSize="xs" color="gray.400">Buy: ₹{product.purchasePrice}</Text>
                                        )}
                                    </Stack>
                                </Td>
                                <Td textAlign="right">
                                    <Stack direction="row" spacing={2} justify="flex-end">
                                        <IconButton
                                            size="sm"
                                            variant="ghost"
                                            icon={<FiEdit2 />}
                                            aria-label="Edit"
                                            _hover={{ color: 'brand.500', bg: 'brand.50' }}
                                            onClick={() => handleEdit(product)}
                                        />
                                        <IconButton
                                            size="sm"
                                            variant="ghost"
                                            icon={<FiTrash2 />}
                                            colorScheme="red"
                                            aria-label="Delete"
                                            _hover={{ color: 'red.500', bg: 'red.50' }}
                                            onClick={() => handleDelete(product._id || product.id)}
                                        />
                                    </Stack>
                                </Td>
                            </Tr>
                        ))}
                    </Tbody>
                </Table>
                {products.length === 0 && (
                    <Flex p={20} flexDir="column" align="center" justify="center">
                        <Box color="gray.300" mb={4}><FiPackage size={48} /></Box>
                        <Text color="gray.500">No products found in your inventory.</Text>
                    </Flex>
                )}
            </Box>

            {/* Premium Add/Edit Modal */}
            <Modal isOpen={isOpen} onClose={onClose} size={{ base: 'full', md: '4xl' }} scrollBehavior="inside">
                <ModalOverlay backdropFilter="blur(8px)" bg="blackAlpha.600" />
                <ModalContent as="form" onSubmit={handleSubmit} borderRadius="2xl" overflow="hidden" boxShadow="2xl">
                    <ModalHeader p={0}>
                        <Box
                            bgGradient="linear(to-r, brand.600, brand.800)"
                            p={6}
                            color="white"
                        >
                            <Flex align="center" gap={3}>
                                <Box bg="whiteAlpha.200" p={2} borderRadius="lg">
                                    {editingProduct ? <FiEdit2 /> : <FiPlus />}
                                </Box>
                                <Stack spacing={0}>
                                    <Text fontSize="xl" fontWeight="800">
                                        {editingProduct ? 'Update Product Details' : 'Onboard New Product'}
                                    </Text>
                                    <Text fontSize="xs" color="whiteAlpha.700">Fill in all mandatory technical and commercial parameters.</Text>
                                </Stack>
                            </Flex>
                        </Box>
                    </ModalHeader>
                    <ModalCloseButton color="white" top={6} right={6} />

                    <ModalBody p={8} bg="gray.50/30">
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
                            {/* Left Column: Basic Info & Pricing */}
                            <Stack spacing={6}>
                                <Box bg="white" p={6} borderRadius="xl" boxShadow="sm" border="1px" borderColor="gray.100">
                                    <Flex align="center" gap={2} mb={4} color="brand.600">
                                        <FiInfo /> <Text fontWeight="700" fontSize="sm">BASIC INFORMATION</Text>
                                    </Flex>
                                    <Stack spacing={4}>
                                        <FormControl isRequired>
                                            <FormLabel fontSize="xs" fontWeight="700" color="gray.500">PRODUCT NAME</FormLabel>
                                            <Input
                                                variant="filled"
                                                placeholder="e.g. Centrifugal Pump X1"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            />
                                        </FormControl>



                                        <FormControl>
                                            <Flex justify="space-between" align="center" mb={2}>
                                                <FormLabel fontSize="xs" fontWeight="700" color="gray.500" mb={0}>ALTERNATIVE NAMES</FormLabel>
                                                <Button size="sm" colorScheme="blue" variant="outline" onClick={() => setFormData({ ...formData, alternativeNames: [...formData.alternativeNames, ''] })}>
                                                    + Add Name
                                                </Button>
                                            </Flex>
                                            <Stack spacing={2}>
                                                {formData.alternativeNames.map((altName, index) => (
                                                    <Flex key={index} gap={2}>
                                                        <Input
                                                            size="sm"
                                                            value={altName}
                                                            onChange={(e) => {
                                                                const newAltNames = [...formData.alternativeNames];
                                                                newAltNames[index] = e.target.value;
                                                                setFormData({ ...formData, alternativeNames: newAltNames });
                                                            }}
                                                            placeholder="Alias / Model No."
                                                        />
                                                        <IconButton
                                                            size="sm"
                                                            icon={<FiTrash2 />}
                                                            colorScheme="red"
                                                            variant="ghost"
                                                            onClick={() => {
                                                                const newAltNames = formData.alternativeNames.filter((_, i) => i !== index);
                                                                setFormData({ ...formData, alternativeNames: newAltNames });
                                                            }}
                                                        />
                                                    </Flex>
                                                ))}
                                            </Stack>
                                        </FormControl>

                                        <FormControl>
                                            <FormLabel fontSize="xs" fontWeight="700" color="gray.500">DESCRIPTION</FormLabel>
                                            <Textarea
                                                variant="filled"
                                                rows={4}
                                                placeholder="Key features and applications..."
                                                value={formData.description}
                                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            />
                                        </FormControl>

                                        {/* ISI Removed */}
                                    </Stack>
                                </Box>

                                <Box bg="white" p={6} borderRadius="xl" boxShadow="sm" border="1px" borderColor="gray.100">
                                    <Flex align="center" gap={2} mb={4} color="brand.600">
                                        <FiDollarSign /> <Text fontWeight="700" fontSize="sm">COMMERCIALS</Text>
                                    </Flex>
                                    <Stack spacing={4}>
                                        <SimpleGrid columns={2} spacing={4}>
                                            <FormControl isRequired>
                                                <FormLabel fontSize="xs" fontWeight="700" color="gray.500">SELLING PRICE (START)</FormLabel>
                                                <InputGroup size="md">
                                                    <InputLeftElement pointerEvents='none' children={<Text fontSize="sm" color="gray.400">₹</Text>} />
                                                    <Input type="number" onWheel={(e) => e.target.blur()} min={0} variant="filled" value={formData.sellingPriceStart} onChange={(e) => setFormData({ ...formData, sellingPriceStart: e.target.value })} />
                                                </InputGroup>
                                            </FormControl>
                                            <FormControl isRequired>
                                                <FormLabel fontSize="xs" fontWeight="700" color="gray.500">SELLING PRICE (END)</FormLabel>
                                                <InputGroup size="md">
                                                    <InputLeftElement pointerEvents='none' children={<Text fontSize="sm" color="gray.400">₹</Text>} />
                                                    <Input type="number" onWheel={(e) => e.target.blur()} min={0} variant="filled" value={formData.sellingPriceEnd} onChange={(e) => setFormData({ ...formData, sellingPriceEnd: e.target.value })} />
                                                </InputGroup>
                                            </FormControl>
                                        </SimpleGrid>
                                        <SimpleGrid columns={2} spacing={4}>
                                            <FormControl isRequired>
                                                <FormLabel fontSize="xs" fontWeight="700" color="gray.500">DEALER PRICE</FormLabel>
                                                <InputGroup size="md">
                                                    <InputLeftElement pointerEvents='none' children={<Text fontSize="sm" color="gray.400">₹</Text>} />
                                                    <Input type="number" onWheel={(e) => e.target.blur()} min={0} variant="filled" value={formData.dealerPrice} onChange={(e) => setFormData({ ...formData, dealerPrice: e.target.value })} />
                                                </InputGroup>
                                            </FormControl>
                                            <FormControl>
                                                <FormLabel fontSize="xs" fontWeight="700" color={isSuperAdmin ? "red.500" : "gray.500"}>
                                                    PURCHASE PRICE {isSuperAdmin ? "(Super Admin)" : "(Hidden on View)"}
                                                </FormLabel>
                                                <InputGroup size="md">
                                                    <InputLeftElement pointerEvents='none' children={<Text fontSize="sm" color="gray.400">₹</Text>} />
                                                    <Input
                                                        type="number"
                                                        onWheel={(e) => e.target.blur()}
                                                        min={0}
                                                        bg={isSuperAdmin ? "red.50" : "white"}
                                                        variant="filled"
                                                        value={formData.purchasePrice}
                                                        onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                                                        placeholder={!isSuperAdmin && editingProduct ? "Hidden (Enter to Update)" : "Enter Purchase Cost"}
                                                    />
                                                </InputGroup>
                                            </FormControl>
                                        </SimpleGrid>
                                        <FormControl isRequired>
                                            <FormLabel fontSize="xs" fontWeight="700" color="gray.500">PRIMARY VENDOR</FormLabel>
                                            <Input variant="filled" placeholder="Vendor Name" value={formData.vendor} onChange={(e) => setFormData({ ...formData, vendor: e.target.value })} />
                                        </FormControl>
                                    </Stack>
                                </Box>
                            </Stack>

                            {/* Right Column: Photos & Specs */}
                            <Stack spacing={6}>
                                <Box bg="white" p={6} borderRadius="xl" boxShadow="sm" border="1px" borderColor="gray.100">
                                    <Flex align="center" justify="space-between" mb={4}>
                                        <Flex align="center" gap={2} color="brand.600">
                                            <FiImage /> <Text fontWeight="700" fontSize="sm">IMAGE GALLERY</Text>
                                        </Flex>
                                        <Badge colorScheme="blue" variant="subtle" borderRadius="md">
                                            {existingPhotos.length + newPhotos.length} IMAGES
                                        </Badge>
                                    </Flex>

                                    <SimpleGrid columns={3} spacing={3} mb={4}>
                                        {/* File Upload Box */}
                                        <label style={{ cursor: 'pointer' }}>
                                            <Flex
                                                h="80px"
                                                border="2px dashed"
                                                borderColor="brand.200"
                                                borderRadius="xl"
                                                align="center"
                                                justify="center"
                                                color="brand.500"
                                                _hover={{ bg: 'brand.50', borderColor: 'brand.400' }}
                                                transition="0.2s"
                                            >
                                                <FiUpload size={20} />
                                            </Flex>
                                            <input
                                                type="file"
                                                multiple
                                                accept="image/*"
                                                onChange={handleFileChange}
                                                style={{ display: 'none' }}
                                            />
                                        </label>

                                        {/* Image Previews */}
                                        <AnimatePresence>
                                            {existingPhotos.map((photo, index) => (
                                                <motion.div
                                                    key={`existing-${index}`}
                                                    initial={{ opacity: 0, scale: 0.8 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.5 }}
                                                    style={{ position: 'relative' }}
                                                >
                                                    <Image src={getImageUrl(photo)} h="80px" w="full" objectFit="cover" borderRadius="xl" />
                                                    <IconButton
                                                        size="xs"
                                                        position="absolute"
                                                        top={1}
                                                        right={1}
                                                        icon={<FiTrash2 />}
                                                        colorScheme="red"
                                                        borderRadius="full"
                                                        onClick={() => removeExistingPhoto(index)}
                                                    />
                                                </motion.div>
                                            ))}
                                            {newPhotos.map((file, index) => (
                                                <motion.div
                                                    key={`new-${index}`}
                                                    initial={{ opacity: 0, scale: 0.8 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.5 }}
                                                    style={{ position: 'relative' }}
                                                >
                                                    <Box h="80px" w="full" bg="brand.50" borderRadius="xl" border="1px" borderColor="brand.200" overflow="hidden">
                                                        <Flex h="full" align="center" justify="center" flexDir="column" gap={1}>
                                                            <FiImage size={16} color="brand.500" />
                                                            <Text fontSize="8px" fontWeight="bold" noOfLines={1} px={2} textAlign="center">{file.name}</Text>
                                                        </Flex>
                                                    </Box>
                                                    <IconButton
                                                        size="xs"
                                                        position="absolute"
                                                        top={1}
                                                        right={1}
                                                        icon={<FiTrash2 />}
                                                        colorScheme="red"
                                                        borderRadius="full"
                                                        onClick={() => removeNewPhoto(index)}
                                                    />
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>
                                    </SimpleGrid>
                                    {existingPhotos.length + newPhotos.length === 0 && (
                                        <Text fontSize="xs" color="gray.400" textAlign="center" py={4} border="1px dashed" borderColor="gray.200" borderRadius="lg">
                                            No images uploaded. At least 1 is required.
                                        </Text>
                                    )}
                                </Box>

                                <Box bg="white" p={6} borderRadius="xl" boxShadow="sm" border="1px" borderColor="gray.100">
                                    <Flex align="center" justify="space-between" mb={4}>
                                        <Flex align="center" gap={2} color="brand.600">
                                            <FiSettings /> <Text fontWeight="700" fontSize="sm">TECHNICAL DEEP-DIVE</Text>
                                        </Flex>
                                        <Button size="sm" colorScheme="brand" variant="solid" onClick={addDetailRow}>
                                            + ADD SPECIFICATION
                                        </Button>
                                    </Flex>

                                    <Stack spacing={3} maxH="300px" overflowY="auto" pr={2}>
                                        <AnimatePresence>
                                            {formData.details.map((detail, index) => (
                                                <motion.div
                                                    key={index}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0, scale: 0.9 }}
                                                >
                                                    <Flex gap={2} bg="gray.50" p={2} borderRadius="lg" border="1px solid" borderColor="gray.100">
                                                        <Input
                                                            size="sm"
                                                            variant="unstyled"
                                                            placeholder="Prop (e.g. RPM)"
                                                            px={2}
                                                            fontWeight="700"
                                                            value={detail.key}
                                                            onChange={(e) => updateDetailRow(index, 'key', e.target.value)}
                                                        />
                                                        <Box w="1px" bg="gray.200" my={1} />
                                                        <Input
                                                            size="sm"
                                                            variant="unstyled"
                                                            placeholder="Value (e.g. 1500)"
                                                            px={2}
                                                            value={detail.value}
                                                            onChange={(e) => updateDetailRow(index, 'value', e.target.value)}
                                                        />
                                                        <IconButton
                                                            size="xs"
                                                            variant="ghost"
                                                            icon={<FiTrash2 />}
                                                            colorScheme="red"
                                                            onClick={() => removeDetailRow(index)}
                                                        />
                                                    </Flex>
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>
                                        {formData.details.length === 0 && (
                                            <Text fontSize="xs" color="gray.400" textAlign="center" py={8} border="1px dashed" borderColor="gray.200" borderRadius="lg">
                                                Click "ADD SPECIFICATION" to define product attributes.
                                            </Text>
                                        )}
                                    </Stack>
                                </Box>
                                <FormControl>
                                    <FormLabel fontSize="xs" fontWeight="700" color="gray.500">PDF BROCHURE LINK</FormLabel>
                                    <Input variant="filled" placeholder="https://..." value={formData.pdf} onChange={(e) => setFormData({ ...formData, pdf: e.target.value })} />
                                </FormControl>
                            </Stack>
                        </SimpleGrid>
                    </ModalBody>

                    <Box p={8} bg="white" borderTop="1px" borderColor="gray.100">
                        <SimpleGrid columns={2} spacing={4}>
                            <Button variant="outline" size="lg" borderRadius="xl" onClick={onClose}>
                                Cancel
                            </Button>
                            <Button type="submit" size="lg" borderRadius="xl" bgGradient="linear(to-r, brand.600, brand.700)" onClick={handleSubmit}>
                                {editingProduct ? 'Commit Changes' : 'Initialize Product'}
                            </Button>
                        </SimpleGrid>
                    </Box>
                </ModalContent>
            </Modal >
        </Box >
    );
};

export default AdminProducts;

