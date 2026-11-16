import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { Box, Container, Stack, Heading, Text, Button, Badge, Flex, useToast, IconButton, Image, Spinner, SimpleGrid, Input, InputGroup, InputLeftElement, Modal, ModalOverlay, ModalContent, ModalBody, ModalCloseButton, Divider, VStack, Progress } from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { FaShoppingCart, FaChevronLeft, FaChevronRight, FaTrash } from 'react-icons/fa';
import { FiSettings, FiSearch, FiPlay, FiShare2 } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';
import SEO from '../components/SEO';

import { getImageUrl } from '../utils/imageUrl';

const MotionBox = motion.create(Box);

const PAGE_SIZE = 10;

export const PRODUCT_CATEGORIES = [
    {
        id: "CEMENT,CONCRETE & AGGREGAT TESTING EQUIPMENT",
        slug: "cement-concrete",
        title: "Cement, Concrete & Aggregate",
        image: "/api/uploads/products/images/cat_cement.jpg",
        seoKeywords: "cement testing equipment, compression testing machine, concrete cube mould, slump cone, aggregate testing apparatus ahmedabad"
    },
    {
        id: "SOIL TESTING EQUIPMENT",
        slug: "soil-testing",
        title: "Soil Testing Equipment",
        image: "/api/uploads/products/images/cat_soil.jpg",
        seoKeywords: "soil testing equipment gujarat, direct shear apparatus, core cutter, cbr test machine, casagrande liquid limit device"
    },
    {
        id: "BITUMIN TESTING EQUPMENT",
        slug: "bitumen-testing",
        title: "Bitumen Testing Equipment",
        image: "/api/uploads/products/images/cat_bitumin.jpg",
        seoKeywords: "bitumen testing equipment, ductility machine, bitumen penetrometer, softening point apparatus, marshall stability tester"
    },
    {
        id: "Construction Machinery",
        slug: "construction-machinery",
        title: "Construction Machinery",
        image: "/api/uploads/products/images/cat_construction.jpg",
        seoKeywords: "construction machinery, laboratory concrete mixer, cube curing tank, sieve shaker machine, core cutting machine"
    },
    {
        id: "SURVEY & MEASURING INSTRUMENT",
        slug: "survey-instruments",
        title: "Survey & Measuring Instruments",
        image: "/api/uploads/products/images/cat_survey.jpg",
        seoKeywords: "survey measuring instruments, total station ahmedabad, dgps rtk receiver, digital theodolite, auto level, leica sokkia topcon survey equipment"
    },
    {
        id: "SAFETY PRODUCTS",
        slug: "safety-products",
        title: "Safety Products",
        image: "/api/uploads/products/images/cat_safety.jpg",
        seoKeywords: "construction safety products, safety helmets, reflective jacket, safety shoes, site safety ppe"
    }
];


// Inject marquee keyframe once
const MARQUEE_STYLE_ID = 'product-marquee-style';
let styleEl = document.getElementById(MARQUEE_STYLE_ID);
if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = MARQUEE_STYLE_ID;
    document.head.appendChild(styleEl);
}
styleEl.innerHTML = `
    @keyframes marquee {
        0%   { transform: translateX(0); }
        100% { transform: translateX(-50%); }
    }
    .marquee-track {
        display: flex;
        width: max-content;
        animation-name: marquee;
        animation-timing-function: linear;
        animation-iteration-count: infinite;
        will-change: transform;
    }
    .marquee-track:hover {
        animation-play-state: paused;
    }
`;

const ProductSlider = ({ products }) => {
    const navigate = useNavigate();

    if (!products || !products.length) return null;

    // Ensure we have enough items so the base list spans well beyond screen width for seamless looping
    let baseList = [...products];
    while (baseList.length > 0 && baseList.length < 15) {
        baseList = [...baseList, ...products];
    }
    // Double the list for seamless infinite loop (0% to -50% translates exactly baseList width)
    const items = [...baseList, ...baseList];

    // Constant speed calculation:
    // Each item is 140px + 24px margins = 164px.
    // 5 seconds per item gives ~32.8 px/second — smooth, slow, and perfectly consistent
    // regardless of whether there are 5, 50, 100, or 500 products!
    const SECONDS_PER_ITEM = 5;
    const duration = baseList.length * SECONDS_PER_ITEM;

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

            <div className="marquee-track" style={{ animationDuration: `${duration}s` }}>
                {items.map((product, idx) => {
                    const imgSrc = getImageUrl(product.localImages?.[0] || product.images?.[0] || product.photos?.[0]);
                    const productId = product._id || product.id || `prod-${idx}`;
                    return (
                        <Box
                            key={`${productId}-${idx}`}
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
                            bg="white"
                            position="relative"
                            title={product.name}
                            transition="all 0.3s"
                            _hover={{
                                transform: 'scale(1.07)',
                                boxShadow: '2xl',
                                borderColor: 'brand.400'
                            }}
                            onClick={() => navigate(`/products?category=${encodeURIComponent(product.category || '')}&highlight=${product.slug || productId}`)}
                        >
                            <Image
                                src={imgSrc}
                                alt={product.name}
                                w="100%"
                                h="100%"
                                objectFit="cover"
                                fallback={
                                    <Flex w="100%" h="100%" bg="gray.50" align="center" justify="center" p={2} textAlign="center">
                                        <Text fontSize="xs" fontWeight="600" color="gray.600" noOfLines={3}>
                                            {product.name}
                                        </Text>
                                    </Flex>
                                }
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
                        loading="lazy"
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

// Sticky Cart Sidebar Component — Desktop sidebar + Mobile sticky floating bar
const CartSidebar = ({ onOpenCart }) => {
    const { cart } = useCart();
    const [isMobileExpanded, setIsMobileExpanded] = useState(false);

    const safeCart = Array.isArray(cart) ? cart : [];
    if (safeCart.length === 0) return null;

    const totalQty = safeCart.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);

    return (
        <>
            {/* ── DESKTOP STICKY SIDEBAR (Hidden on mobile) ── */}
            <Box
                display={{ base: 'none', lg: 'block' }}
                as={motion.div}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                position="sticky"
                top="90px"
                w="270px"
                flexShrink={0}
                borderRadius="2xl"
                border="2px solid"
                borderColor="orange.200"
                bg="white"
                boxShadow="2xl"
                overflow="hidden"
                zIndex={10}
            >
                {/* Header */}
                <Flex
                    bg="linear-gradient(135deg, #f97316 0%, #ea580c 100%)"
                    px={4} py={3.5}
                    align="center"
                    gap={2.5}
                >
                    <Flex w={7} h={7} bg="whiteAlpha.300" borderRadius="full" align="center" justify="center">
                        <FaShoppingCart color="white" size={13} />
                    </Flex>
                    <Box>
                        <Text fontWeight="800" color="white" fontSize="sm" lineHeight="1.1">Selected Items</Text>
                        <Text fontSize="10px" color="orange.100" fontWeight="600">{safeCart.length} product{safeCart.length > 1 ? 's' : ''} ({totalQty} total)</Text>
                    </Box>
                    <Badge ml="auto" bg="white" color="orange.600" borderRadius="full" px={2.5} py={0.5} fontSize="xs" fontWeight="800">
                        {totalQty}
                    </Badge>
                </Flex>

                {/* Items — read-only list */}
                <Stack spacing={0} maxH="380px" overflowY="auto">
                    {safeCart.map((item, idx) => {
                        const product = item.productId || item.product || {};
                        const name = product.name || item.name || 'Product';
                        const qty = item.quantity || 1;
                        const img = product.localImages?.[0] || product.images?.[0] || product.photos?.[0] || item.images?.[0] || '';
                        const imgSrc = getImageUrl(img);

                        return (
                            <Flex
                                key={item._id || item.id || idx}
                                px={3.5} py={2.5}
                                align="center"
                                gap={3}
                                borderBottom="1px solid"
                                borderColor="gray.100"
                                _hover={{ bg: 'orange.50' }}
                                transition="background 0.2s"
                            >
                                <Image
                                    src={imgSrc}
                                    boxSize="40px"
                                    borderRadius="lg"
                                    objectFit="cover"
                                    fallbackSrc="https://via.placeholder.com/40"
                                    flexShrink={0}
                                    border="1px solid"
                                    borderColor="gray.200"
                                />
                                <Box flex={1} minW={0}>
                                    <Text fontSize="xs" fontWeight="700" color="gray.800" noOfLines={2} lineHeight="1.3">
                                        {name}
                                    </Text>
                                    <Text fontSize="11px" color="orange.600" fontWeight="700" mt="1px">
                                        Qty: {qty}
                                    </Text>
                                </Box>
                            </Flex>
                        );
                    })}
                </Stack>

                {/* Footer Action Button */}
                <Box p={3} bg="gray.50" borderTop="1px solid" borderColor="gray.100">
                    <Button
                        w="full"
                        bg="orange.500"
                        _hover={{ bg: 'orange.600', transform: 'translateY(-1px)' }}
                        _active={{ bg: 'orange.700' }}
                        color="white"
                        size="sm"
                        borderRadius="xl"
                        fontWeight="bold"
                        onClick={onOpenCart}
                        rightIcon={<FaShoppingCart />}
                        shadow="md"
                    >
                        View & Submit Enquiry
                    </Button>
                </Box>
            </Box>

            {/* ── MOBILE STICKY FLOATING SELECTED ITEMS BAR (Static/Sticky on mobile while scrolling) ── */}
            <Box
                display={{ base: 'block', lg: 'none' }}
                position="fixed"
                bottom="14px"
                left="12px"
                right="12px"
                zIndex={999}
                borderRadius="2xl"
                bg="linear-gradient(135deg, #f97316 0%, #ea580c 100%)"
                boxShadow="0 10px 30px rgba(234, 88, 12, 0.45), 0 3px 10px rgba(0,0,0,0.2)"
                border="2px solid rgba(255, 255, 255, 0.3)"
                overflow="hidden"
                transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
            >
                {/* Expanded Items Drawer (Mobile) */}
                <AnimatePresence>
                    {isMobileExpanded && (
                        <MotionBox
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            bg="white"
                            borderBottom="1px solid"
                            borderColor="orange.100"
                            maxH="260px"
                            overflowY="auto"
                        >
                            <Box p={3}>
                                <Flex justify="space-between" align="center" mb={2} px={1}>
                                    <Text fontSize="xs" fontWeight="800" color="gray.800" textTransform="uppercase" letterSpacing="0.5px">
                                        Selected Items ({safeCart.length})
                                    </Text>
                                    <Text fontSize="xs" color="gray.500" fontWeight="600">
                                        Total Qty: {totalQty}
                                    </Text>
                                </Flex>
                                <Stack spacing={2}>
                                    {safeCart.map((item, idx) => {
                                        const product = item.productId || item.product || {};
                                        const name = product.name || item.name || 'Product';
                                        const qty = item.quantity || 1;
                                        const img = product.localImages?.[0] || product.images?.[0] || product.photos?.[0] || item.images?.[0] || '';
                                        const imgSrc = getImageUrl(img);

                                        return (
                                            <Flex
                                                key={`mobile-cart-${item._id || item.id || idx}`}
                                                p={2}
                                                bg="orange.50"
                                                borderRadius="xl"
                                                align="center"
                                                gap={3}
                                            >
                                                <Image
                                                    src={imgSrc}
                                                    boxSize="36px"
                                                    borderRadius="md"
                                                    objectFit="cover"
                                                    fallbackSrc="https://via.placeholder.com/36"
                                                    flexShrink={0}
                                                    bg="white"
                                                    border="1px solid"
                                                    borderColor="orange.200"
                                                />
                                                <Box flex={1} minW={0}>
                                                    <Text fontSize="xs" fontWeight="700" color="gray.800" noOfLines={1}>
                                                        {name}
                                                    </Text>
                                                    <Text fontSize="10px" color="orange.600" fontWeight="bold">
                                                        Qty: {qty}
                                                    </Text>
                                                </Box>
                                            </Flex>
                                        );
                                    })}
                                </Stack>
                            </Box>
                        </MotionBox>
                    )}
                </AnimatePresence>

                {/* Main Sticky Bottom Bar */}
                <Flex
                    px={3.5}
                    py={2.5}
                    align="center"
                    justify="space-between"
                    gap={2}
                >
                    {/* Left: Cart Icon + Count + Title */}
                    <Flex
                        align="center"
                        gap={2.5}
                        cursor="pointer"
                        onClick={() => setIsMobileExpanded(prev => !prev)}
                        flex={1}
                        minW={0}
                    >
                        <Flex
                            w={9}
                            h={9}
                            borderRadius="full"
                            bg="white"
                            align="center"
                            justify="center"
                            flexShrink={0}
                            shadow="sm"
                        >
                            <FaShoppingCart color="#ea580c" size={15} />
                        </Flex>

                        <Box minW={0}>
                            <Flex align="center" gap={1.5}>
                                <Text fontWeight="900" color="white" fontSize="xs" lineHeight="1.1">
                                    Selected Items
                                </Text>
                                <Badge bg="white" color="orange.600" borderRadius="full" px={1.5} fontSize="10px" fontWeight="900">
                                    {totalQty}
                                </Badge>
                            </Flex>
                            <Text fontSize="10px" color="orange.100" fontWeight="600" noOfLines={1}>
                                {isMobileExpanded ? 'Tap to collapse' : `${safeCart.length} item${safeCart.length > 1 ? 's' : ''} added · Tap to view`}
                            </Text>
                        </Box>
                    </Flex>

                    {/* Right: Action Buttons */}
                    <Flex align="center" gap={1.5} flexShrink={0}>
                        <IconButton
                            aria-label="Toggle items preview"
                            icon={isMobileExpanded ? <FaChevronRight style={{ transform: 'rotate(90deg)' }} /> : <FaChevronRight style={{ transform: 'rotate(-90deg)' }} />}
                            size="sm"
                            variant="ghost"
                            colorScheme="whiteAlpha"
                            color="white"
                            borderRadius="full"
                            onClick={() => setIsMobileExpanded(prev => !prev)}
                        />
                        <Button
                            bg="white"
                            color="orange.600"
                            _hover={{ bg: 'orange.50' }}
                            _active={{ bg: 'orange.100' }}
                            size="sm"
                            borderRadius="xl"
                            fontWeight="900"
                            fontSize="xs"
                            px={3.5}
                            h="34px"
                            shadow="md"
                            onClick={onOpenCart}
                        >
                            Enquire Now
                        </Button>
                    </Flex>
                </Flex>
            </Box>
        </>
    );
};

const Products = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { id: routeProductId } = useParams();
    const { user } = useAuth();
    const searchParams = new URLSearchParams(location.search);
    const searchQuery = searchParams.get('search') || '';
    const urlCategory = searchParams.get('category') || '';
    const highlightId = routeProductId || searchParams.get('highlight') || '';
    const { addToCart, cart } = useCart();
    const toast = useToast();
    const [products, setProducts] = useState([]);
    const [highlightProduct, setHighlightProduct] = useState(null);
    const [loading, setLoading] = useState(() => Boolean(urlCategory || searchQuery || highlightId));

    // Immediate synchronous resolution of initial category from URL so SEO canonical is never delayed or null on first render
    const initialCategory = () => {
        if (!urlCategory) return null;
        const found = PRODUCT_CATEGORIES.find(c => 
            c.slug.toLowerCase() === urlCategory.toLowerCase() || 
            c.id.toLowerCase() === urlCategory.toLowerCase() || 
            c.title.toLowerCase() === urlCategory.toLowerCase()
        );
        return found ? found.id : urlCategory;
    };
    const [activeCategory, setActiveCategory] = useState(initialCategory);
    const [sliderProducts, setSliderProducts] = useState([]);
    const highlightRef = useRef(null);
    const autoInquiryDoneRef = useRef(false);
    // In-memory cache for instant category switching (0ms roundtrip)
    const categoryCacheRef = useRef({});

    // Pagination / Incremental rendering state for blazing-fast initial load (<50ms)
    const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
    const loadMoreTriggerRef = useRef(null);

    // If URL has a category param (from slider click, sitemap slug, or back/forward navigation), auto-select it
    useEffect(() => {
        if (urlCategory) {
            const found = PRODUCT_CATEGORIES.find(c => 
                c.slug.toLowerCase() === urlCategory.toLowerCase() || 
                c.id.toLowerCase() === urlCategory.toLowerCase() || 
                c.title.toLowerCase() === urlCategory.toLowerCase()
            );
            setActiveCategory(found ? found.id : urlCategory);
        } else if (!searchQuery && !highlightId) {
            setActiveCategory(null);
        }
    }, [urlCategory, searchQuery, highlightId]);

    // If route has product ID (from /product/:id or ?highlight=id), fetch/sync highlightProduct and auto-resolve category
    useEffect(() => {
        autoInquiryDoneRef.current = false;
        if (!highlightId) {
            setHighlightProduct(null);
            return;
        }

        // Check if product is already in memory
        const foundInList = products.find(p => (p._id === highlightId || p.id === highlightId || (p.slug && p.slug.toLowerCase() === highlightId.toLowerCase())));
        if (foundInList) {
            setHighlightProduct(foundInList);
        }

        api.get(`/products/${highlightId}`)
            .then(res => {
                const prod = res.data;
                if (!prod || !prod._id) return;
                setHighlightProduct(prod);

                if (!activeCategory) {
                    let targetCat = null;
                    if (prod.category) {
                        const found = PRODUCT_CATEGORIES.find(c => 
                            c.id.toLowerCase() === prod.category.toLowerCase() || 
                            c.slug.toLowerCase() === prod.category.toLowerCase() || 
                            c.title.toLowerCase() === prod.category.toLowerCase()
                        );
                        targetCat = found ? found.id : prod.category;
                    }
                    if (!targetCat) {
                        const pName = (prod.name || '').toLowerCase();
                        if (pName.includes('soil') || pName.includes('shear') || pName.includes('cbr') || pName.includes('liquid limit')) {
                            targetCat = 'SOIL TESTING EQUIPMENT';
                        } else if (pName.includes('bitumen') || pName.includes('ductility') || pName.includes('penetrometer')) {
                            targetCat = 'BITUMIN TESTING EQUPMENT';
                        } else if (pName.includes('survey') || pName.includes('level') || pName.includes('total station') || pName.includes('theodolite')) {
                            targetCat = 'SURVEY & MEASURING INSTRUMENT';
                        } else if (pName.includes('safety') || pName.includes('helmet') || pName.includes('jacket')) {
                            targetCat = 'SAFETY PRODUCTS';
                        } else if (pName.includes('mixer') || pName.includes('machine') || pName.includes('shaker')) {
                            targetCat = 'Construction Machinery';
                        } else {
                            targetCat = 'CEMENT,CONCRETE & AGGREGAT TESTING EQUIPMENT';
                        }
                    }
                    setActiveCategory(targetCat);
                }
            })
            .catch(err => {
                console.warn('[Products] Could not auto-resolve product or category for product ID:', err.message);
            });
    }, [highlightId, activeCategory]);

    // Reset pagination when switching categories or running a new search
    useEffect(() => {
        setVisibleCount(PAGE_SIZE);
    }, [activeCategory, searchQuery]);

    // If highlightId is present, ensure visibleCount expands to show the highlighted item, scroll to it, and open inquiry
    useEffect(() => {
        if (highlightId && products.length > 0) {
            const targetIndex = products.findIndex(p => (p._id === highlightId || p.id === highlightId || (p.slug && p.slug.toLowerCase() === highlightId.toLowerCase())));
            if (targetIndex >= 0) {
                if (targetIndex >= visibleCount) {
                    setVisibleCount(targetIndex + 4);
                }
                const targetProduct = products[targetIndex];
                setTimeout(() => {
                    highlightRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    
                    if (!autoInquiryDoneRef.current && targetProduct) {
                        autoInquiryDoneRef.current = true;
                        // Add product to Enquiry Cart and open Enquiry Drawer
                        addToCart(targetProduct);
                        setTimeout(() => {
                            const enquiryBtn = document.getElementById('enquiry-cart-btn');
                            if (enquiryBtn) enquiryBtn.click();
                        }, 500);
                    }
                }, 400);
            }
        }
    }, [highlightId, products, visibleCount]);

    // Infinite scroll observer: automatically loads next batch when user scrolls near the end
    useEffect(() => {
        if (!loadMoreTriggerRef.current) return;
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && visibleCount < products.length) {
                setVisibleCount(prev => Math.min(prev + PAGE_SIZE, products.length));
            }
        }, { rootMargin: '350px' });

        observer.observe(loadMoreTriggerRef.current);
        return () => observer.disconnect();
    }, [products.length, visibleCount]);

    // Fetch all products for the slider (admin bypass not needed — public call fetches categorized ones)
    useEffect(() => {
        api.get('/products')
            .then(res => {
                const all = Array.isArray(res.data) ? res.data : (res.data.data || []);
                // Only include products that have at least one image
                setSliderProducts(all.filter(p => (p.localImages?.length || p.images?.length || p.photos?.length)));
            })
            .catch(() => { });
    }, []);

    const fetchProducts = async (search = '', category = null) => {
        const cacheKey = `${category || 'All'}__${search || ''}`;

        // If in cache and not searching, show instantly without network delay
        if (categoryCacheRef.current[cacheKey] && !search && !highlightId) {
            setProducts(categoryCacheRef.current[cacheKey]);
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            let url = `/products?`;
            if (search) url += `search=${encodeURIComponent(search)}&`;
            if (category && category !== 'All') url += `category=${encodeURIComponent(category)}`;

            const res = await api.get(url);
            let finalData = Array.isArray(res.data) ? res.data : (res.data.data || []);

            // If highlightId is present and not in finalData, fetch single product and prepend it
            if (highlightId && !finalData.some(p => (p._id === highlightId || p.id === highlightId || (p.slug && p.slug.toLowerCase() === highlightId.toLowerCase())))) {
                try {
                    const singleRes = await api.get(`/products/${highlightId}`);
                    if (singleRes.data && singleRes.data._id) {
                        finalData = [singleRes.data, ...finalData];
                    }
                } catch (_) {}
            }

            setProducts(finalData);

            // Store in cache for instant future retrieval
            if (!search && category && !highlightId) {
                categoryCacheRef.current[cacheKey] = finalData;
            }
        } catch (err) {
            console.error(err);
            toast({ title: "Failed to load products", status: "error" });
        } finally {
            setLoading(false);
        }
    };

    const handleCategoryClick = (catId) => {
        const catObj = PRODUCT_CATEGORIES.find(c => c.id === catId || c.slug === catId);
        const slug = catObj ? catObj.slug : encodeURIComponent(catId);
        setActiveCategory(catId);
        navigate(`/products?category=${slug}`);
        const cacheKey = `${catId}__`;
        if (categoryCacheRef.current[cacheKey]) {
            setProducts(categoryCacheRef.current[cacheKey]);
            setLoading(false);
        } else {
            setLoading(true);
            setProducts([]);
        }
    };

    useEffect(() => {
        // Only fetch if a category is selected or a search is active
        if (activeCategory || searchQuery) {
            fetchProducts(searchQuery, activeCategory);
        } else {
            setProducts([]); // Clear items if sitting on the main categories menu
            setLoading(false);
        }
    }, [location.pathname, location.search, activeCategory]);

    const handleAddToCart = (product) => {
        addToCart(product);
        toast({ title: "Added to Enquiry Cart", status: "success", duration: 2000 });
    };

    // Alternative names for highlighted product
    const altNames = Array.isArray(highlightProduct?.alternativeNames)
        ? highlightProduct.alternativeNames.filter(Boolean).map(n => n.trim())
        : [];

    // Compute dynamic SEO metadata for product, category, or search (Called unconditionally before any return)
    const currentCategoryObj = PRODUCT_CATEGORIES.find(c => c.id === activeCategory || c.slug === activeCategory);
    const seoTitle = highlightProduct
        ? `${highlightProduct.name.trim()}${altNames.length > 0 ? ` (${altNames.slice(0, 2).join(', ')})` : ''} | Unique Lab Instruments`
        : currentCategoryObj
        ? `${currentCategoryObj.title} | Civil Lab Equipment Ahmedabad`
        : searchQuery
        ? `Search: "${searchQuery}" | Civil Lab Equipment`
        : `Civil Lab Testing Instruments & Survey Equipment Catalog`;
    const seoDescription = highlightProduct
        ? `${highlightProduct.name.trim()}${altNames.length > 0 ? ` [Also: ${altNames.join(', ')}]` : ''} - ${highlightProduct.description || 'Civil engineering testing instrument by Unique Lab Instruments Ahmedabad'}. Certified standard quality with PAN India delivery, warranty & calibration.`
        : currentCategoryObj
        ? `Explore high-precision ${currentCategoryObj.title} by Unique Engineering (uecivil.com). Certified civil laboratory testing instruments, brochures & quotations in Gujarat.`
        : `Complete catalog of civil engineering testing instruments in Ahmedabad: Concrete, Soil, Bitumen, Construction Machinery, Survey Total Stations & PPE safety equipment.`;
    const seoKeywords = highlightProduct
        ? [
            highlightProduct.name.trim(),
            ...altNames,
            highlightProduct.category,
            'Unique Lab Instruments',
            'uecivil',
            'civil testing equipment ahmedabad',
            'buy lab testing equipment'
          ].filter(Boolean).join(', ')
        : currentCategoryObj
        ? `${currentCategoryObj.seoKeywords}, uecivil, unique lab instruments`
        : `civil lab instruments ahmedabad, concrete testing equipment, soil testing apparatus, bitumen testing machine, total station gujarat, uecivil`;
    const activeProductSlug = highlightProduct?.slug || highlightProduct?._id;
    const seoCanonical = highlightProduct
        ? `https://uecivil.com/products/${activeProductSlug}`
        : currentCategoryObj
        ? `https://uecivil.com/products?category=${currentCategoryObj.slug}`
        : `https://uecivil.com/products`;

    const targetImg = highlightProduct
        ? (highlightProduct.localImages?.[0] || highlightProduct.images?.[0] || highlightProduct.photos?.[0])
        : null;
    const seoOgImage = targetImg ? getImageUrl(targetImg) : 'https://uecivil.com/pwa-512x512.png';

    // Dynamic JSON-LD schema for Google AI, Gemini, and SEO rich snippets (Unconditional Hook)
    const productSchema = useMemo(() => {
        if (highlightProduct) {
            const activeProductSlug = highlightProduct.slug || highlightProduct._id;
            let details = highlightProduct.details;
            if (typeof details === 'string') {
                try { details = JSON.parse(details); } catch (e) {}
                if (typeof details === 'string') { try { details = JSON.parse(details); } catch (e) {} }
            }
            const specsProperties = (details && typeof details === 'object')
                ? Object.entries(details).map(([k, v]) => ({
                    "@type": "PropertyValue",
                    "name": String(k).trim(),
                    "value": String(v).trim()
                }))
                : [];

            const breadcrumbs = [
                { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://uecivil.com/" },
                { "@type": "ListItem", "position": 2, "name": "Civil Lab Products", "item": "https://uecivil.com/products" }
            ];

            if (currentCategoryObj) {
                breadcrumbs.push({
                    "@type": "ListItem",
                    "position": 3,
                    "name": currentCategoryObj.title,
                    "item": `https://uecivil.com/products?category=${currentCategoryObj.slug}`
                });
                breadcrumbs.push({
                    "@type": "ListItem",
                    "position": 4,
                    "name": highlightProduct.name.trim(),
                    "item": `https://uecivil.com/products/${activeProductSlug}`
                });
            } else {
                breadcrumbs.push({
                    "@type": "ListItem",
                    "position": 3,
                    "name": highlightProduct.name.trim(),
                    "item": `https://uecivil.com/products/${activeProductSlug}`
                });
            }

            return {
                "@context": "https://schema.org",
                "@graph": [
                    {
                        "@type": "Product",
                        "@id": `https://uecivil.com/products/${activeProductSlug}#product`,
                        "name": highlightProduct.name.trim(),
                        ...(altNames.length > 0 ? { "alternateName": altNames } : {}),
                        "description": highlightProduct.description || `${highlightProduct.name.trim()} - Civil engineering testing instrument by Unique Lab Instruments`,
                        "image": [seoOgImage],
                        "category": highlightProduct.category || "Civil Engineering Testing Equipment",
                        "brand": {
                            "@type": "Brand",
                            "name": "Unique Lab Instruments"
                        },
                        "manufacturer": {
                            "@type": "Organization",
                            "name": "Unique Engineering",
                            "url": "https://uecivil.com"
                        },
                        "offers": {
                            "@type": "Offer",
                            "url": `https://uecivil.com/products/${activeProductSlug}`,
                            "availability": "https://schema.org/InStock",
                            "itemCondition": "https://schema.org/NewCondition",
                            "priceCurrency": "INR"
                        },
                        ...(specsProperties.length > 0 ? { "additionalProperty": specsProperties } : {})
                    },
                    {
                        "@type": "BreadcrumbList",
                        "itemListElement": breadcrumbs
                    }
                ]
            };
        }

        const breadcrumbs = [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://uecivil.com/" },
            { "@type": "ListItem", "position": 2, "name": "Civil Lab Products", "item": "https://uecivil.com/products" }
        ];

        if (currentCategoryObj) {
            breadcrumbs.push({
                "@type": "ListItem",
                "position": 3,
                "name": currentCategoryObj.title,
                "item": `https://uecivil.com/products?category=${currentCategoryObj.slug}`
            });
        }

        const categoryFaqs = [
            {
                "@type": "Question",
                "name": `What civil engineering equipment is included under ${currentCategoryObj ? currentCategoryObj.title : 'our catalog'}?`,
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": currentCategoryObj
                        ? `Unique Engineering supplies certified ${currentCategoryObj.title} including ${currentCategoryObj.seoKeywords}. All machines come with manufacturer warranty and optional calibration certificates.`
                        : "Unique Engineering supplies complete laboratory testing equipment for concrete, soil, bitumen, aggregate, cement, total stations, auto levels, and construction machinery."
                }
            },
            {
                "@type": "Question",
                "name": "How to request a quotation or technical datasheet for testing equipment?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Add desired instruments to your inquiry cart on uecivil.com, call +91 90991 60391, or send an email to info@uecivil.com for immediate quotation and catalog delivery."
                }
            }
        ];

        return {
            "@context": "https://schema.org",
            "@graph": [
                {
                    "@type": "BreadcrumbList",
                    "itemListElement": breadcrumbs
                },
                {
                    "@type": "CollectionPage",
                    "name": seoTitle,
                    "description": seoDescription,
                    "url": seoCanonical
                },
                {
                    "@type": "FAQPage",
                    "mainEntity": categoryFaqs
                }
            ]
        };
    }, [highlightProduct, currentCategoryObj, seoTitle, seoDescription, seoCanonical, seoOgImage, altNames]);

    if (loading) {
        return (
            <Container maxW="6xl" py={10}>
                <SEO
                    title={seoTitle}
                    description={seoDescription}
                    keywords={seoKeywords}
                    canonical={seoCanonical}
                    ogImage={seoOgImage}
                    schema={productSchema}
                />
                <Flex justify="center" align="center" minH="50vh">
                    <Spinner size="xl" color="brand.500" />
                </Flex>
            </Container>
        );
    }

    const safeCart = Array.isArray(cart) ? cart : [];
    const hasCartItems = safeCart.length > 0;

    // Open the cart drawer — trigger click on the Enquiry button in Header
    const handleOpenCart = () => {
        const enquiryBtn = document.getElementById('enquiry-cart-btn');
        if (enquiryBtn) enquiryBtn.click();
    };

    return (
        <Container
            maxW={hasCartItems ? '7xl' : '6xl'}
            py={{ base: 6, md: 10 }}
            px={{ base: 4, sm: 6, md: 8 }}
            pb={hasCartItems ? { base: "115px", lg: 10 } : { base: 6, md: 10 }}
        >
            {/* Dynamic Category / Product SEO */}
            <SEO
                title={seoTitle}
                description={seoDescription}
                keywords={seoKeywords}
                canonical={seoCanonical}
                ogImage={seoOgImage}
                schema={productSchema}
            />

            <Flex direction={{ base: 'column', lg: 'row' }} gap={{ base: 6, lg: 8 }} align="flex-start" w="100%">
                {/* Main Content */}
                <Box flex={1} minW={0} w="100%">

                    {/* ── Infinite Product Image Slider — only on category home screen ── */}
                    {!activeCategory && !searchQuery && <ProductSlider products={sliderProducts} />}

                    <Heading
                        as="h1"
                        fontSize={{ base: '26px', sm: '32px', md: '40px' }}
                        fontWeight="900"
                        letterSpacing="tight"
                        color="brand.700"
                        mb={2}
                        lineHeight="1.2"
                        wordBreak="keep-all"
                    >
                        Our Products
                    </Heading>
                    <Text fontSize={{ base: 'sm', md: 'md' }} color="gray.500" mb={{ base: 5, md: 6 }}>
                        Browse our extensive catalog of quality equipment.
                    </Text>

                    {!activeCategory && !searchQuery ? (
                        <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} spacing={{ base: 4, md: 6 }} mb={8}>
                            {PRODUCT_CATEGORIES.map((cat) => (
                                <Box
                                    key={cat.id}
                                    borderRadius="2xl"
                                    cursor="pointer"
                                    overflow="hidden"
                                    position="relative"
                                    h={{ base: '200px', sm: '230px', md: '250px' }}
                                    boxShadow="md"
                                    _hover={{
                                        transform: 'translateY(-5px)',
                                        boxShadow: '2xl'
                                    }}
                                    transition="all 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
                                    onClick={() => handleCategoryClick(cat.id)}
                                >
                                    <Box
                                        position="absolute"
                                        top={0}
                                        left={0}
                                        right={0}
                                        bottom={0}
                                        backgroundImage={`url(${getImageUrl(cat.image)})`}
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
                                        p={{ base: 4, md: 6 }}
                                        position="relative"
                                        zIndex={1}
                                        textAlign="center"
                                    >
                                        <Heading size={{ base: 'sm', sm: 'md' }} color="white" lineHeight="1.4" fontWeight="800" letterSpacing="wide">
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
                                        navigate('/products');
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
                                <Flex 
                                    direction="column" 
                                    justify="center" 
                                    align="center" 
                                    minH="40vh" 
                                    gap={4} 
                                    py={12} 
                                    bg="white" 
                                    borderRadius="3xl" 
                                    shadow="sm" 
                                    border="1px solid" 
                                    borderColor="gray.100"
                                >
                                    <Spinner size="xl" thickness="4px" speed="0.65s" emptyColor="gray.200" color="orange.500" />
                                    <Text fontSize="md" fontWeight="bold" color="gray.700">Loading Products...</Text>
                                    <Text fontSize="xs" color="gray.400">Fetching equipment for {activeCategory || 'your search'}</Text>
                                </Flex>
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
                                            {products.slice(0, visibleCount).map((product, index) => (
                                                <motion.div
                                                    key={product._id || product.id}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    whileInView={{ opacity: 1, y: 0 }}
                                                    viewport={{ once: true }}
                                                    transition={{ duration: 0.4, delay: (index % PAGE_SIZE) * 0.05 }}
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
                                                                <ImageCarousel images={(product.localImages && product.localImages.length > 0) ? product.localImages : (product.images || product.photos || [])} />
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
                                                                        {/* Alternative names display for SEO & customer search clarity */}
                                                                        {product.alternativeNames && product.alternativeNames.filter(Boolean).length > 0 && (
                                                                            <Flex wrap="wrap" align="center" gap={1.5} mt={1}>
                                                                                <Text fontSize="11px" fontWeight="700" color="gray.500">
                                                                                    Also Known As:
                                                                                </Text>
                                                                                {product.alternativeNames.filter(Boolean).map((alt, aIdx) => (
                                                                                    <Badge key={aIdx} colorScheme="orange" variant="subtle" fontSize="10px" borderRadius="md" px={2} py={0.5}>
                                                                                        {alt.trim()}
                                                                                    </Badge>
                                                                                ))}
                                                                            </Flex>
                                                                        )}
                                                                    </Stack>
                                                                    <Flex align="center" gap={2}>
                                                                        {product.ISI && (
                                                                            <Badge colorScheme="green" variant="solid" borderRadius="lg" px={3} py={1} boxShadow="sm" fontSize="xs">
                                                                                ISI CERTIFIED
                                                                            </Badge>
                                                                        )}
                                                                        <IconButton
                                                                            aria-label="Share direct product link"
                                                                            icon={<FiShare2 />}
                                                                            size="sm"
                                                                            variant="ghost"
                                                                            colorScheme="orange"
                                                                            title="Copy Direct Product Link"
                                                                            onClick={() => {
                                                                                const prodUrl = `${window.location.origin}/products/${product.slug || product._id}`;
                                                                                navigator.clipboard.writeText(prodUrl);
                                                                                toast({
                                                                                    title: "Link Copied!",
                                                                                    description: `Direct link for ${product.name} copied to clipboard`,
                                                                                    status: "success",
                                                                                    duration: 2500,
                                                                                    isClosable: true
                                                                                });
                                                                            }}
                                                                        />
                                                                    </Flex>
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



                                                                {/* Videos & Video Links Section */}
                                                                {((product.localVideos && product.localVideos.length > 0) || (product.videoLinks && product.videoLinks.length > 0)) && (
                                                                    <Box
                                                                        bg="gray.50"
                                                                        p={5}
                                                                        borderRadius="2xl"
                                                                        border="1px solid"
                                                                        borderColor="gray.100"
                                                                    >
                                                                        <Flex align="center" gap={2} mb={4} color="brand.600">
                                                                            <FiPlay size={14} />
                                                                            <Text fontWeight="800" fontSize="xs" letterSpacing="widest">PRODUCT VIDEOS</Text>
                                                                        </Flex>
                                                                        <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4}>
                                                                            {/* Render Local Videos */}
                                                                            {(product.localVideos || []).map((videoPath, vidIndex) => (
                                                                                <Box key={`local-vid-${vidIndex}`} borderRadius="xl" overflow="hidden" border="1px solid" borderColor="gray.200" bg="black" position="relative">
                                                                                    <video
                                                                                        controls
                                                                                        style={{ width: '100%', maxHeight: '180px' }}
                                                                                        src={getImageUrl(videoPath)}
                                                                                    />
                                                                                </Box>
                                                                            ))}

                                                                            {/* Render External Video Links */}
                                                                            {(product.videoLinks || []).filter(link => link && link.trim() !== '').map((link, linkIndex) => {
                                                                                // Extract YouTube ID if applicable
                                                                                let embedUrl = link;
                                                                                const ytRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
                                                                                const match = link.match(ytRegex);
                                                                                if (match && match[1]) {
                                                                                    embedUrl = `https://www.youtube.com/embed/${match[1]}`;
                                                                                }

                                                                                const isYoutube = ytRegex.test(link);

                                                                                return (
                                                                                    <Box key={`link-vid-${linkIndex}`} borderRadius="xl" overflow="hidden" border="1px solid" borderColor="gray.200" bg="black" aspectRatio="16/9">
                                                                                        {isYoutube ? (
                                                                                            <iframe
                                                                                                width="100%"
                                                                                                height="100%"
                                                                                                src={embedUrl}
                                                                                                title={`Video ${linkIndex}`}
                                                                                                frameBorder="0"
                                                                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                                                                allowFullScreen
                                                                                            />
                                                                                        ) : (
                                                                                            <Flex h="full" align="center" justify="center" p={4} direction="column" gap={2} bg="gray.100">
                                                                                                <FiPlay size={24} color="brand.500" />
                                                                                                <Button size="xs" colorScheme="brand" variant="link" onClick={() => window.open(link, '_blank')}>
                                                                                                    Watch Video Link
                                                                                                </Button>
                                                                                            </Flex>
                                                                                        )}
                                                                                    </Box>
                                                                                );
                                                                            })}
                                                                        </SimpleGrid>
                                                                    </Box>
                                                                )}



                                                                {/* Action Bar */}
                                                                <Flex justify="space-between" align="center" pt={4} borderTop="1px" borderColor="gray.50">
                                                                    <Box>
                                                                        {(product.localPdf || product.pdf) && (
                                                                            <Button
                                                                                size="sm"
                                                                                variant="ghost"
                                                                                colorScheme="brand"
                                                                                leftIcon={<FiSearch />}
                                                                                onClick={() => window.open(getImageUrl(product.localPdf || product.pdf), '_blank')}
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
                                            ))}
                                        </Stack>
                                    )}

                                    {/* Incremental Load More Trigger / Fallback Button */}
                                    {visibleCount < products.length && (
                                        <Box ref={loadMoreTriggerRef} py={8} textAlign="center">
                                            <VStack spacing={3}>
                                                <Text fontSize="sm" color="gray.500" fontWeight="600">
                                                    Showing <b>{Math.min(visibleCount, products.length)}</b> of <b>{products.length}</b> products in {activeCategory || 'search'}
                                                </Text>
                                                <Progress 
                                                    value={(Math.min(visibleCount, products.length) / products.length) * 100} 
                                                    size="xs" 
                                                    colorScheme="orange" 
                                                    borderRadius="full" 
                                                    w="200px" 
                                                />
                                                <Button
                                                    size="md"
                                                    colorScheme="orange"
                                                    variant="outline"
                                                    borderRadius="xl"
                                                    onClick={() => setVisibleCount(prev => Math.min(prev + PAGE_SIZE, products.length))}
                                                >
                                                    Load More Products ({products.length - Math.min(visibleCount, products.length)} remaining)
                                                </Button>
                                            </VStack>
                                        </Box>
                                    )}
                                </>
                            )}
                        </Box>
                    )}
                </Box>
                {/* Right Sticky Cart Sidebar (Desktop & Mobile) */}
                <CartSidebar onOpenCart={handleOpenCart} />
            </Flex>
        </Container>
    );
};

export default Products;
