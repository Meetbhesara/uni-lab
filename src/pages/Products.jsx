import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Box, Container, Stack, Heading, Text, Button, Badge, Flex, useToast, IconButton, Image, Spinner, SimpleGrid, Input, InputGroup, InputLeftElement, Modal, ModalOverlay, ModalContent, ModalBody, ModalCloseButton } from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { FaShoppingCart, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { FiSettings, FiSearch } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';

const getImageUrl = (path) => {
    if (!path) return 'https://via.placeholder.com/150';
    if (path.startsWith('http')) return path;
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
    return `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
};

const PRODUCT_CATEGORIES = [
    {
        id: "CEMENT,CONCRETE & AGGREGAT TESTING EQUIPMENT",
        title: "Cement, Concrete & Aggregate",
        image: "https://images.unsplash.com/photo-1541888086925-920a0bda7e3f?q=80&w=800&auto=format&fit=crop"
    },
    {
        id: "SOIL TESTING EQUIPMENT",
        title: "Soil Testing Equipment",
        image: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?q=80&w=800&auto=format&fit=crop"
    },
    {
        id: "BITUMIN TESTING EQUPMENT",
        title: "Bitumen Testing Equipment",
        image: "https://images.unsplash.com/photo-1580216447883-93f8e02d8e4c?q=80&w=800&auto=format&fit=crop"
    },
    {
        id: "Construction Machinery",
        title: "Construction Machinery",
        image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=800&auto=format&fit=crop"
    },
    {
        id: "SURVEY & MEASURING INSTRUMENT",
        title: "Survey & Measuring Instruments",
        image: "https://images.unsplash.com/photo-1582208035318-47b2c58da7ff?q=80&w=800&auto=format&fit=crop"
    }
];

const ImageCarousel = ({ images }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const nextImage = () => {
        if (images.length > 0)
            setCurrentIndex((prev) => (prev + 1) % images.length);
    };

    const prevImage = () => {
        if (images.length > 0)
            setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    const [isModalOpen, setIsModalOpen] = useState(false);

    if (!images || images.length === 0) return <Box bg="gray.100" h={{ base: "250px", md: "300px" }} w={{ base: "100%", md: "400px" }} flexShrink={0} borderRadius="lg" />;

    // Ensure images are strings
    const validImages = images.filter(img => typeof img === 'string' && img.length > 0);

    if (validImages.length === 0) return <Box bg="gray.100" h={{ base: "250px", md: "300px" }} w={{ base: "100%", md: "400px" }} flexShrink={0} borderRadius="lg" />;

    return (
        <>
            <Box position="relative" h={{ base: "250px", md: "300px" }} w={{ base: "100%", md: "400px" }} overflow="hidden" borderRadius="lg" flexShrink={0} cursor="pointer" onClick={() => setIsModalOpen(true)}>
                <AnimatePresence mode="wait">
                    <motion.img
                        key={currentIndex}
                        src={getImageUrl(validImages[currentIndex])}
                        initial={{ opacity: 0, x: 100 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        transition={{ duration: 0.3 }}
                        style={{ width: '100%', height: '100%', objectFit: 'contain', position: 'absolute', backgroundColor: '#f7fafc' }}
                    />
                </AnimatePresence>

                {validImages.length > 1 && (
                    <>
                        <IconButton
                            aria-label="Previous Image"
                            icon={<FaChevronLeft />}
                            position="absolute" left="2" top="50%" transform="translateY(-50%)"
                            colorScheme="blackAlpha" size="sm" rounded="full"
                            onClick={(e) => { e.stopPropagation(); prevImage(); }}
                            zIndex={2}
                        />
                        <IconButton
                            aria-label="Next Image"
                            icon={<FaChevronRight />}
                            position="absolute" right="2" top="50%" transform="translateY(-50%)"
                            colorScheme="blackAlpha" size="sm" rounded="full"
                            onClick={(e) => { e.stopPropagation(); nextImage(); }}
                            zIndex={2}
                        />
                        <Flex position="absolute" bottom="2" width="100%" justify="center" gap={1} zIndex={2}>
                            {validImages.map((_, idx) => (
                                <Box
                                    key={idx}
                                    w="8px" h="8px"
                                    bg={idx === currentIndex ? "white" : "whiteAlpha.500"}
                                    borderRadius="full"
                                />
                            ))}
                        </Flex>
                    </>
                )}
            </Box>

            {/* Fullscreen Image Modal */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} size="6xl" isCentered>
                <ModalOverlay backdropFilter="blur(10px)" bg="blackAlpha.800" />
                <ModalContent bg="transparent" boxShadow="none" my={0}>
                    <ModalCloseButton color="white" top={4} right={4} size="lg" zIndex={10} bg="blackAlpha.400" _hover={{ bg: 'blackAlpha.600' }} />
                    <ModalBody p={0} display="flex" justifyContent="center" alignItems="center" position="relative" h="90vh">
                        <Image
                            src={getImageUrl(validImages[currentIndex])}
                            maxH="100%"
                            maxW="100%"
                            objectFit="contain"
                            borderRadius="lg"
                            bg="white"
                        />
                        {validImages.length > 1 && (
                            <>
                                <IconButton
                                    aria-label="Previous Image"
                                    icon={<FaChevronLeft />}
                                    position="absolute" left="4" top="50%" transform="translateY(-50%)"
                                    colorScheme="blackAlpha" size="lg" rounded="full"
                                    onClick={(e) => { e.stopPropagation(); prevImage(); }}
                                    zIndex={2}
                                />
                                <IconButton
                                    aria-label="Next Image"
                                    icon={<FaChevronRight />}
                                    position="absolute" right="4" top="50%" transform="translateY(-50%)"
                                    colorScheme="blackAlpha" size="lg" rounded="full"
                                    onClick={(e) => { e.stopPropagation(); nextImage(); }}
                                    zIndex={2}
                                />
                            </>
                        )}
                    </ModalBody>
                </ModalContent>
            </Modal>
        </>
    );
};

const Products = () => {
    const location = useLocation();
    const { user } = useAuth();
    // Parse search query from URL
    const searchParams = new URLSearchParams(location.search);
    const searchQuery = searchParams.get('search') || '';
    const { addToCart } = useCart();
    const toast = useToast();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeCategory, setActiveCategory] = useState(null);

    const fetchProducts = async (search = '', category = null) => {
        const cacheKey = `products_v2_${search}_${category}`;
        const cachedData = sessionStorage.getItem(cacheKey);

        if (cachedData) {
            try {
                setProducts(JSON.parse(cachedData));
                setLoading(false);
                return;
            } catch (e) {
                console.error("Cache parsing error", e);
            }
        }

        try {
            let url = `/products?`;
            if (search) url += `search=${search}&`;
            if (category && category !== 'All') url += `category=${encodeURIComponent(category)}`;

            const res = await api.get(url);
            let finalData = Array.isArray(res.data) ? res.data : (res.data.data || []);
            setProducts(finalData);
            sessionStorage.setItem(cacheKey, JSON.stringify(finalData));
        } catch (err) {
            console.error(err);
            toast({ title: "Failed to load products", status: "error" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Only fetch if a category is selected or a search is active
        if (activeCategory || searchQuery) {
            fetchProducts(searchQuery, activeCategory);
        } else {
            setProducts([]); // Clear items if sitting on the main categories menu
        }
    }, [location.pathname, location.search, activeCategory]);

    const handleAddToCart = (product) => {
        addToCart(product);
        toast({ title: "Added to Enquiry Cart", status: "success", duration: 2000 });
    };

    if (loading) {
        return <Flex justify="center" align="center" minH="50vh"><Spinner size="xl" color="brand.500" /></Flex>
    }

    return (
        <Container maxW="6xl" py={12}>
            <Heading mb={2} color="brand.700">Our Products</Heading>
            <Text color="gray.500" mb={6}>Browse our extensive catalog of quality equipment.</Text>

            {!activeCategory && !searchQuery ? (
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} mb={8}>
                    {PRODUCT_CATEGORIES.map((cat) => (
                        <Box
                            key={cat.id}
                            borderRadius="2xl"
                            cursor="pointer"
                            overflow="hidden"
                            position="relative"
                            h="250px"
                            boxShadow="md"
                            _hover={{
                                transform: 'translateY(-5px)',
                                boxShadow: '2xl'
                            }}
                            transition="all 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
                            onClick={() => setActiveCategory(cat.id)}
                        >
                            <Box
                                position="absolute"
                                top={0}
                                left={0}
                                right={0}
                                bottom={0}
                                backgroundImage={`url(${cat.image})`}
                                backgroundSize="cover"
                                backgroundPosition="center"
                                transition="transform 0.6s"
                                _hover={{ transform: 'scale(1.05)' }}
                            />
                            <Box
                                position="absolute"
                                top={0}
                                left={0}
                                right={0}
                                bottom={0}
                                bgGradient="linear(to-t, blackAlpha.900 0%, blackAlpha.500 50%, transparent 100%)"
                            />
                            <Flex
                                direction="column"
                                align="center"
                                justify="flex-end"
                                h="100%"
                                p={6}
                                position="relative"
                                zIndex={1}
                                textAlign="center"
                            >
                                <Heading size="md" color="white" lineHeight="1.4" fontWeight="800" letterSpacing="wide">
                                    {cat.title}
                                </Heading>
                            </Flex>
                        </Box>
                    ))}
                </SimpleGrid>
            ) : (
                <Box>
                    <Flex mb={6} justify="space-between" align="center" wrap="wrap" gap={4}>
                        <Button
                            leftIcon={<FaChevronLeft />}
                            onClick={() => {
                                setActiveCategory(null);
                                if (searchQuery) window.history.pushState({}, '', '/products');
                            }}
                            variant="ghost"
                            colorScheme="brand"
                        >
                            Back to Categories
                        </Button>
                        <Badge colorScheme="blue" fontSize="md" p={2} borderRadius="md">
                            {activeCategory || `Search: ${searchQuery}`}
                        </Badge>
                    </Flex>

                    {loading ? (
                        <Flex justify="center" align="center" minH="30vh"><Spinner size="xl" color="brand.500" /></Flex>
                    ) : (
                        <>
                            {/* Sticky Search Bar REMOVED - Moved to Header */}
                            {searchQuery && (
                                <Text mb={4} color="gray.500">Showing results for: <b>{searchQuery}</b> ({products.length} found)</Text>
                            )}

                            {products.length === 0 ? (
                                <Text>No products found.</Text>
                            ) : (
                                <Stack spacing={8}>
                                    {products.map((product, index) => (
                                        <motion.div
                                            key={product._id || product.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ duration: 0.5, delay: index * 0.1 }}
                                        >
                                            <Box
                                                p={{ base: 4, md: 8 }}
                                                bg="white"
                                                boxShadow="sm"
                                                borderRadius="3xl"
                                                border="1px"
                                                borderColor="gray.100"
                                                _hover={{ boxShadow: '2xl', borderColor: 'brand.100' }}
                                                transition="0.4s cubic-bezier(0.4, 0, 0.2, 1)"
                                                position="relative"
                                                overflow="hidden"
                                            >
                                                <Flex direction={{ base: 'column', md: 'row' }} gap={{ base: 6, md: 10 }} align="start">
                                                    {/* Image Carousel with Premium Feel */}
                                                    <Box flexShrink={0} w={{ base: '100%', md: '380px' }}>
                                                        <ImageCarousel images={product.images || product.photos || []} />
                                                    </Box>

                                                    {/* Product Details Section */}
                                                    <Stack flex={1} spacing={5} width="100%">
                                                        <Flex justify="space-between" align="start">
                                                            <Stack spacing={1}>
                                                                <Badge colorScheme="brand" variant="subtle" borderRadius="full" px={3} w="fit-content" fontSize="10px" fontWeight="800">
                                                                    UNI-BC PRODUCT
                                                                </Badge>
                                                                <Heading size="lg" color="slate.800" fontWeight="800" letterSpacing="tight">
                                                                    {product.name}
                                                                </Heading>
                                                            </Stack>
                                                            {product.ISI && (
                                                                <Badge colorScheme="green" variant="solid" borderRadius="lg" px={3} py={1} boxShadow="sm" fontSize="xs">
                                                                    ISI CERTIFIED
                                                                </Badge>
                                                            )}
                                                        </Flex>

                                                        <Text color="gray.600" fontSize="md" lineHeight="tall" fontWeight="500">
                                                            {product.description || "High-performance equipment engineered for industrial excellence and durability."}
                                                        </Text>

                                                        {/* Technical Specifications - Modern Grid */}
                                                        {(() => {
                                                            let details = product.details;
                                                            // Robust parse if it's a string
                                                            if (typeof details === 'string') {
                                                                try { details = JSON.parse(details); } catch (e) { }
                                                                if (typeof details === 'string') { try { details = JSON.parse(details); } catch (e) { } }
                                                            }

                                                            if (details && typeof details === 'object' && Object.keys(details).length > 0) {
                                                                return (
                                                                    <Box
                                                                        bg="gray.50"
                                                                        p={5}
                                                                        borderRadius="2xl"
                                                                        border="1px solid"
                                                                        borderColor="gray.100"
                                                                    >
                                                                        <Flex align="center" gap={2} mb={4} color="brand.600">
                                                                            <FiSettings size={14} />
                                                                            <Text fontWeight="800" fontSize="xs" letterSpacing="widest">TECHNICAL SPECIFICATIONS</Text>
                                                                        </Flex>
                                                                        <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4}>
                                                                            {Object.entries(details).map(([key, value]) => (
                                                                                <Flex key={key} align="center" gap={3} p={2} bg="white" borderRadius="xl" boxShadow="xs">
                                                                                    <Box boxSize="2px" bg="brand.500" borderRadius="full" />
                                                                                    <Box>
                                                                                        <Text fontSize="10px" fontWeight="800" color="gray.400" textTransform="uppercase">{key}</Text>
                                                                                        <Text fontSize="sm" fontWeight="700" color="slate.800">{value}</Text>
                                                                                    </Box>
                                                                                </Flex>
                                                                            ))}
                                                                        </SimpleGrid>
                                                                    </Box>
                                                                );
                                                            }
                                                            return null;
                                                        })()}



                                                        {/* Action Bar */}
                                                        <Flex justify="space-between" align="center" pt={4} borderTop="1px" borderColor="gray.50">
                                                            <Box>
                                                                {product.pdf && (
                                                                    <Button
                                                                        size="sm"
                                                                        variant="ghost"
                                                                        colorScheme="brand"
                                                                        leftIcon={<FiSearch />}
                                                                        onClick={() => window.open(product.pdf, '_blank')}
                                                                        _hover={{ bg: 'brand.50' }}
                                                                    >
                                                                        Technical Brochure
                                                                    </Button>
                                                                )}
                                                            </Box>

                                                            <Button
                                                                size="lg"
                                                                px={10}
                                                                borderRadius="xl"
                                                                leftIcon={<FaShoppingCart />}
                                                                bgGradient="linear(to-r, accent.500, accent.600)"
                                                                color="white"
                                                                _hover={{
                                                                    bgGradient: "linear(to-r, accent.600, accent.700)",
                                                                    transform: "translateY(-2px)",
                                                                    boxShadow: "xl"
                                                                }}
                                                                variant="solid"
                                                                onClick={() => handleAddToCart(product)}
                                                                width={{ base: 'full', md: 'auto' }}
                                                            >
                                                                Add to Enquiry
                                                            </Button>
                                                        </Flex>
                                                    </Stack>
                                                </Flex>
                                            </Box>
                                        </motion.div>
                                    ))
                                    }
                                </Stack>
                            )}
                        </>
                    )}
                </Box>
            )}
        </Container>
    );
};

export default Products;
