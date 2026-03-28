import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Container, Stack, Heading, Text, Button, Badge, Flex, useToast, IconButton, Image, Spinner, SimpleGrid, Input, InputGroup, InputLeftElement, Modal, ModalOverlay, ModalContent, ModalBody, ModalCloseButton, Divider } from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { FaShoppingCart, FaChevronLeft, FaChevronRight, FaTrash } from 'react-icons/fa';
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
        image: "https://res.cloudinary.com/dlnvxu56m/image/upload/v1774181871/cat_cement.jpg"
    },
    {
        id: "SOIL TESTING EQUIPMENT",
        title: "Soil Testing Equipment",
        image: "https://res.cloudinary.com/dlnvxu56m/image/upload/v1774181874/cat_soil.jpg"
    },
    {
        id: "BITUMIN TESTING EQUPMENT",
        title: "Bitumen Testing Equipment",
        image: "https://res.cloudinary.com/dlnvxu56m/image/upload/v1774181875/cat_bitumin.jpg"
    },
    {
        id: "Construction Machinery",
        title: "Construction Machinery",
        image: "https://res.cloudinary.com/dlnvxu56m/image/upload/v1774181872/cat_construction.jpg"
    },
    {
        id: "SURVEY & MEASURING INSTRUMENT",
        title: "Survey & Measuring Instruments",
        image: "https://res.cloudinary.com/dlnvxu56m/image/upload/v1774182146/cat_survey.jpg"
    },
    {
        id: "SAFETY PRODUCTS",
        title: "Safety Products",
        image: "https://res.cloudinary.com/dlnvxu56m/image/upload/v1774181873/cat_safety.jpg"
    }
];

// Inject marquee keyframe once
const MARQUEE_STYLE_ID = 'product-marquee-style';
if (!document.getElementById(MARQUEE_STYLE_ID)) {
    const style = document.createElement('style');
    style.id = MARQUEE_STYLE_ID;
    style.innerHTML = `
        @keyframes marquee {
            0%   { transform: translateX(0); }
            100% { transform: translateX(-50%); }
        }
        .marquee-track {
            display: flex;
            width: max-content;
            animation: marquee 40s linear infinite;
        }
        .marquee-track:hover {
            animation-play-state: paused;
        }
    `;
    document.head.appendChild(style);
}

const ProductSlider = ({ products }) => {
    const navigate = useNavigate();
    // Double the list for seamless infinite loop
    const items = [...products, ...products];

    if (!products.length) return null;

    return (
        <Box
            overflow="hidden"
            w="100%"
            py={4}
            mb={4}
            position="relative"
        >
            {/* Fade edges */}
            <Box position="absolute" left={0} top={0} bottom={0} w="80px" zIndex={1}
                bgGradient="linear(to-r, white, transparent)" pointerEvents="none" />
            <Box position="absolute" right={0} top={0} bottom={0} w="80px" zIndex={1}
                bgGradient="linear(to-l, white, transparent)" pointerEvents="none" />

            <div className="marquee-track">
                {items.map((product, idx) => {
                    const imgSrc = getImageUrl(product.images?.[0] || product.photos?.[0]);
                    return (
                        <Box
                            key={`${product._id}-${idx}`}
                            mx={3}
                            flexShrink={0}
                            cursor="pointer"
                            borderRadius="xl"
                            overflow="hidden"
                            w="140px"
                            h="120px"
                            boxShadow="md"
                            border="2px solid"
                            borderColor="gray.100"
                            transition="all 0.3s"
                            _hover={{
                                transform: 'scale(1.07)',
                                boxShadow: '2xl',
                                borderColor: 'brand.400'
                            }}
                            onClick={() => navigate(`/products?category=${encodeURIComponent(product.category || '')}&highlight=${product._id}`)}
                        >
                            <Image
                                src={imgSrc}
                                alt={product.name}
                                w="100%"
                                h="100%"
                                objectFit="cover"
                                fallbackSrc="https://via.placeholder.com/140x120?text=No+Img"
                            />
                        </Box>
                    );
                })}
            </div>
        </Box>
    );
};

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

// Sticky Cart Sidebar Component — read-only selected items view
const CartSidebar = () => {
    const { cart } = useCart();

    const safeCart = Array.isArray(cart) ? cart : [];
    if (safeCart.length === 0) return null;

    return (
        <Box
            as={motion.div}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            position="sticky"
            top="100px"
            w="240px"
            flexShrink={0}
            borderRadius="2xl"
            border="2px solid"
            borderColor="orange.200"
            bg="white"
            boxShadow="xl"
            overflow="hidden"
        >
            {/* Header */}
            <Flex
                bg="linear-gradient(135deg, #f97316 0%, #ea580c 100%)"
                px={4} py={3}
                align="center"
                gap={2}
            >
                <FaShoppingCart color="white" size={14} />
                <Text fontWeight="800" color="white" fontSize="sm">Selected Items</Text>
                <Badge ml="auto" bg="white" color="orange.600" borderRadius="full" px={2} fontSize="xs">
                    {safeCart.length}
                </Badge>
            </Flex>

            {/* Items — read-only list */}
            <Stack spacing={0} maxH="420px" overflowY="auto">
                {safeCart.map((item, idx) => {
                    const product = item.productId || item.product || {};
                    const name = product.name || item.name || 'Product';
                    const qty = item.quantity || 1;
                    const img = product.images?.[0] || product.photos?.[0] || item.images?.[0] || '';
                    const imgSrc = img
                        ? (img.startsWith('http') ? img : `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001'}${img.startsWith('/') ? '' : '/'}${img}`)
                        : 'https://via.placeholder.com/36';

                    return (
                        <Flex
                            key={item._id || item.id || idx}
                            px={3} py={2}
                            align="center"
                            gap={3}
                            borderBottom="1px solid"
                            borderColor="gray.100"
                            _hover={{ bg: 'orange.50' }}
                            transition="background 0.2s"
                        >
                            <Image
                                src={imgSrc}
                                boxSize="36px"
                                borderRadius="md"
                                objectFit="cover"
                                fallbackSrc="https://via.placeholder.com/36"
                                flexShrink={0}
                            />
                            <Box flex={1} minW={0}>
                                <Text fontSize="xs" fontWeight="700" color="gray.800" noOfLines={2} lineHeight="1.3">
                                    {name}
                                </Text>
                                <Text fontSize="10px" color="orange.500" fontWeight="600" mt="1px">
                                    Qty: {qty}
                                </Text>
                            </Box>
                        </Flex>
                    );
                })}
            </Stack>
        </Box>
    );
};

const Products = () => {
    const location = useLocation();
    const { user } = useAuth();
    const searchParams = new URLSearchParams(location.search);
    const searchQuery = searchParams.get('search') || '';
    const urlCategory = searchParams.get('category') || '';
    const highlightId = searchParams.get('highlight') || '';
    const { addToCart, cart } = useCart();
    const toast = useToast();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeCategory, setActiveCategory] = useState(null);
    const [sliderProducts, setSliderProducts] = useState([]);
    const highlightRef = useRef(null);

    // If URL has a category param (from slider click), auto-select it
    useEffect(() => {
        if (urlCategory) {
            setActiveCategory(urlCategory);
        }
    }, [urlCategory]);

    // After products load, scroll to and briefly highlight the product
    useEffect(() => {
        if (highlightId && highlightRef.current) {
            setTimeout(() => {
                highlightRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 400);
        }
    }, [highlightId, products]);

    // Fetch all products for the slider (admin bypass not needed — public call fetches categorized ones)
    useEffect(() => {
        api.get('/products')
            .then(res => {
                const all = Array.isArray(res.data) ? res.data : (res.data.data || []);
                // Only include products that have at least one image
                setSliderProducts(all.filter(p => (p.images?.length || p.photos?.length)));
            })
            .catch(() => { });
    }, []);

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

    const safeCart = Array.isArray(cart) ? cart : [];
    const hasCartItems = safeCart.length > 0;

    // Open the cart drawer — trigger click on the Enquiry button in Header
    const handleOpenCart = () => {
        const enquiryBtn = document.getElementById('enquiry-cart-btn');
        if (enquiryBtn) enquiryBtn.click();
    };

    return (
        <Container maxW={hasCartItems ? '7xl' : '6xl'} py={10}>

        <Flex gap={6} align="flex-start">
            {/* Main Content */}
            <Box flex={1} minW={0}>

            {/* ── Infinite Product Image Slider — only on category home screen ── */}
            {!activeCategory && !searchQuery && <ProductSlider products={sliderProducts} />}

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
                                                ref={(product._id === highlightId || product.id === highlightId) ? highlightRef : null}
                                                p={{ base: 4, md: 8 }}
                                                bg="white"
                                                boxShadow={(product._id === highlightId || product.id === highlightId) ? '0 0 0 4px var(--chakra-colors-brand-400), 2xl' : 'sm'}
                                                borderRadius="3xl"
                                                border="2px solid"
                                                borderColor={(product._id === highlightId || product.id === highlightId) ? 'brand.400' : 'gray.100'}
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
            </Box>
            {/* Right Sticky Cart Sidebar */}
            <CartSidebar />
        </Flex>
        </Container>
    );
};

export default Products;
