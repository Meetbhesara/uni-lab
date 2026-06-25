import React from 'react';
import {
    Box,
    Container,
    Heading,
    Text,
    VStack,
    SimpleGrid,
    Image,
    Flex,
    Icon,
    Badge,
    Stack,
    Divider,
    Button,
    List,
    ListItem,
    ListIcon
} from '@chakra-ui/react';
import { FiPhone, FiUser, FiShield, FiCpu, FiCheckSquare, FiCheckCircle, FiShoppingCart } from 'react-icons/fi';
import { Link as RouterLink } from 'react-router-dom';
import { motion } from 'framer-motion';

const MotionBox = motion.create(Box);

const About = () => {
    return (
        <Box bg="gray.50" minH="100vh">
            {/* Hero Banner */}
            <Box 
                bgGradient="linear(to-r, brand.800, brand.900)" 
                color="white" 
                py={{ base: 20, md: 24 }}
                position="relative"
                overflow="hidden"
            >
                <Box
                    position="absolute"
                    top="-10%"
                    right="-10%"
                    w="400px"
                    h="400px"
                    bg="brand.500"
                    opacity="0.1"
                    borderRadius="full"
                    filter="blur(80px)"
                />
                
                <Container maxW="6xl" position="relative" zIndex={1}>
                    <Badge colorScheme="orange" mb={4} px={3} py={1} borderRadius="full" fontSize="sm">
                        About Unique Lab & Services
                    </Badge>
                    <Heading size={{ base: "xl", md: "2xl" }} mb={4} fontWeight="black" letterSpacing="tight">
                        Unique Lab & Services
                    </Heading>
                    <Text fontSize="xl" color="gray.300" maxW="3xl" fontWeight="normal" lineHeight="tall">
                        Engineering inspection, land surveying, and quality instrument supplies.
                    </Text>
                </Container>
            </Box>

            {/* Core Divisions & Instrument Sales */}
            <Container maxW="6xl" py={{ base: 16, md: 24 }}>
                <VStack spacing={20}>
                    
                    {/* Section 1: Land Surveying & Mapping */}
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={{ base: 12, md: 16 }} alignItems="center">
                        <VStack spacing={6} align="start">
                            <Badge colorScheme="blue" px={3} py={1} borderRadius="md" fontSize="xs" fontWeight="bold">
                                GEOSPATIAL DIVISION
                            </Badge>
                            <Heading color="brand.700" size="lg" fontWeight="bold">
                                Advanced Land Surveying & Mapping
                            </Heading>
                            <Text fontSize="md" color="gray.600" lineHeight="tall">
                                We provide highly accurate topographic, boundary, and contour surveys. Our engineering team converts raw field coordinates into detailed CAD drafting profiles, contour models, and alignment designs.
                            </Text>

                            <Box w="full">
                                <Text fontWeight="bold" fontSize="sm" color="brand.800" mb={3}>
                                    Core Surveying Instruments:
                                </Text>
                                <List spacing={3}>
                                    <ListItem fontSize="sm" color="gray.600">
                                        <ListIcon as={FiCheckCircle} color="accent.500" />
                                        <strong>DGPS (Differential GPS):</strong> High-precision satellite receiver system for establishing geodetic control points and reference coordinates.
                                    </ListItem>
                                    <ListItem fontSize="sm" color="gray.600">
                                        <ListIcon as={FiCheckCircle} color="accent.500" />
                                        <strong>Total Station:</strong> Electronic/optical instrument used for precise angle measurements, distance tracking, and topographic mapping.
                                    </ListItem>
                                    <ListItem fontSize="sm" color="gray.600">
                                        <ListIcon as={FiCheckCircle} color="accent.500" />
                                        <strong>Auto Level:</strong> Optical level used for establishing elevations, vertical grade matching, and accurate leveling datum.
                                    </ListItem>
                                </List>
                            </Box>
                        </VStack>

                        <MotionBox
                            w="full"
                            h={{ base: "320px", md: "400px" }}
                            bg="white"
                            borderRadius="2xl"
                            overflow="hidden"
                            boxShadow="2xl"
                            whileHover={{ scale: 1.02 }}
                            transition={{ duration: 0.3 }}
                        >
                            <Image
                                src="/about-survey.png"
                                alt="Land Surveying Total Station Tripod Instrument"
                                objectFit="cover"
                                w="full"
                                h="full"
                            />
                        </MotionBox>
                    </SimpleGrid>


                    {/* Section 3: Material & Equipment Supplies (SOLD ITEMS) */}
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={{ base: 12, md: 16 }} alignItems="center">
                        <VStack spacing={6} align="start">
                            <Badge colorScheme="orange" px={3} py={1} borderRadius="md" fontSize="xs" fontWeight="bold">
                                EQUIPMENT SALES & SUPPLIES
                            </Badge>
                            <Heading color="brand.700" size="lg" fontWeight="bold">
                                Premium Laboratory Instruments & Material Supplies
                            </Heading>
                            <Text fontSize="md" color="gray.600" lineHeight="tall">
                                Beyond laboratory testing, we are direct suppliers and sellers of certified civil engineering testing instruments and laboratory consumables. We provide developers, contractors, and other laboratories with highly calibrated, code-compliant equipment.
                            </Text>

                            <Box w="full">
                                <Text fontWeight="bold" fontSize="sm" color="brand.800" mb={3}>
                                    Equipment & Materials We Sell:
                                </Text>
                                <List spacing={2} mb={6}>
                                    <ListItem fontSize="sm" color="gray.600">
                                        <ListIcon as={FiCheckCircle} color="accent.500" />
                                        Calibrated Compressive Strength Testers & CTM Accessories.
                                    </ListItem>
                                    <ListItem fontSize="sm" color="gray.600">
                                        <ListIcon as={FiCheckCircle} color="accent.500" />
                                        Geotechnical soil testing kits, sieve shakers, and soil hydrometers.
                                    </ListItem>
                                    <ListItem fontSize="sm" color="gray.600">
                                        <ListIcon as={FiCheckCircle} color="accent.500" />
                                        Non-Destructive Testing (NDT) instruments, rebound hammers, and UPV sensors.
                                    </ListItem>
                                </List>
                                <Button 
                                    as={RouterLink}
                                    to="/products"
                                    variant="solid" 
                                    bg="brand.500"
                                    _hover={{ bg: "brand.600" }}
                                    leftIcon={<Icon as={FiShoppingCart} />}
                                    borderRadius="xl"
                                >
                                    Browse Product Catalog
                                </Button>
                            </Box>
                        </VStack>

                        <MotionBox
                            w="full"
                            h={{ base: "320px", md: "400px" }}
                            bg="white"
                            borderRadius="2xl"
                            overflow="hidden"
                            boxShadow="2xl"
                            whileHover={{ scale: 1.02 }}
                            transition={{ duration: 0.3 }}
                        >
                            <Image
                                src="/about-supplies.png"
                                alt="Laboratory Testing Equipment for Sale"
                                objectFit="cover"
                                w="full"
                                h="full"
                            />
                        </MotionBox>
                    </SimpleGrid>

                </VStack>
            </Container>

            {/* Leadership Profile: Atul Kanak */}
            <Box bg="white" py={{ base: 16, md: 24 }} borderY="1px solid" borderColor="gray.100">
                <Container maxW="5xl">
                    <VStack spacing={12}>
                        <VStack spacing={3} textAlign="center">
                            <Heading size="lg" color="brand.700" fontWeight="bold">
                                Leadership Profile
                            </Heading>
                            <Text color="gray.500" maxW="xl">
                                Directing structural safety, surveying accuracy, and testing compliance.
                            </Text>
                        </VStack>

                        <Stack 
                            direction={{ base: 'column', md: 'row' }} 
                            spacing={{ base: 8, md: 16 }} 
                            align="center"
                            bg="gray.50"
                            p={{ base: 8, md: 12 }}
                            borderRadius="3xl"
                            boxShadow="lg"
                            border="1px solid"
                            borderColor="gray.200"
                            w="full"
                        >
                            {/* Profile Image Wrapper */}
                            <Flex 
                                direction="column" 
                                align="center" 
                                minW={{ base: "180px", md: "240px" }}
                            >
                                <Box
                                    w={{ base: "140px", md: "180px" }}
                                    h={{ base: "140px", md: "180px" }}
                                    borderRadius="full"
                                    bg="brand.500"
                                    color="white"
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                    boxShadow="xl"
                                    mb={4}
                                    border="4px solid white"
                                >
                                    <Icon as={FiUser} w={20} h={20} />
                                </Box>
                                <Badge colorScheme="brand" px={3} py={1} borderRadius="full">
                                    FOUNDER & DIRECTOR
                                </Badge>
                            </Flex>

                            {/* Details */}
                            <VStack align="start" spacing={5} maxW="2xl" w="full">
                                <Box>
                                    <Heading size="xl" color="brand.800" fontWeight="black" mb={1}>
                                        ATUL KANAK
                                    </Heading>
                                    <Text fontSize="md" color="accent.500" fontWeight="bold" letterSpacing="widest">
                                        Principal Consultant & Engineering Analyst
                                    </Text>
                                </Box>

                                <Divider borderColor="gray.300" />

                                <Text fontSize="md" color="gray.600" lineHeight="relaxed" fontStyle="italic">
                                    "Accuracy is the foundation of structural engineering. By utilizing state-of-the-art DGPS receivers for surveying and supplying premium testing apparatus to other laboratories, we build a foundation of quality safety."
                                </Text>

                                <Divider borderColor="gray.300" />

                                <VStack align="start" spacing={3} w="full">
                                    <Text fontSize="sm" fontWeight="bold" color="gray.500" letterSpacing="wider">
                                        DIRECT CONTACT DETAILS
                                    </Text>
                                    <Flex 
                                        direction={{ base: 'column', sm: 'row' }} 
                                        gap={4} 
                                        w="full"
                                    >
                                        <Button 
                                            as="a"
                                            href="tel:9099160391"
                                            variant="solid" 
                                            leftIcon={<Icon as={FiPhone} />}
                                            px={6}
                                            borderRadius="xl"
                                            bg="brand.500"
                                            _hover={{ bg: "brand.600" }}
                                        >
                                            +91 90991 60391
                                        </Button>
                                    </Flex>
                                </VStack>
                            </VStack>
                        </Stack>
                    </VStack>
                </Container>
            </Box>
        </Box>
    );
};

export default About;
