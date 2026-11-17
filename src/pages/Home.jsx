import React, { useState, useMemo } from 'react';
import {
    Box, Heading, Text, Button, Container, SimpleGrid, Card, CardBody, Stack, Flex, Icon,
    useDisclosure, Badge, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, VStack
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { Link as RouterLink } from 'react-router-dom';
import { FiArrowRight, FiBox, FiMap, FiAward, FiShield, FiEye, FiLayers, FiCompass, FiTarget } from 'react-icons/fi';
import SEO from '../components/SEO';

const MotionBox = motion.create(Box);

const Home = () => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [selectedCert, setSelectedCert] = useState(null);

    const handleViewCert = (certType) => {
        setSelectedCert(certType);
        onOpen();
    };

    const homeSchema = useMemo(() => ({
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "WebSite",
                "@id": "https://uecivil.com/#website",
                "name": "Unique Engineering & Unique Survey",
                "url": "https://uecivil.com/",
                "description": "Premier civil engineering lab testing equipment and land surveying solutions in Ahmedabad, Gujarat."
            },
            {
                "@type": "ItemList",
                "@id": "https://uecivil.com/#featured-products",
                "name": "Civil Engineering Lab Testing Equipment by Unique Engineering",
                "itemListElement": [
                    {
                        "@type": "ListItem",
                        "position": 1,
                        "name": "Compression Testing Machine (CTM 2000kN)",
                        "url": "https://uecivil.com/products/compression-testing-machine"
                    },
                    {
                        "@type": "ListItem",
                        "position": 2,
                        "name": "Auto Level Sokkia B40A Survey Set",
                        "url": "https://uecivil.com/products/auto-level-sokkia-set"
                    },
                    {
                        "@type": "ListItem",
                        "position": 3,
                        "name": "Slump Cone Apparatus (IS:7320)",
                        "url": "https://uecivil.com/products/slump-cone-apparatus-slump-cone-apparatus"
                    },
                    {
                        "@type": "ListItem",
                        "position": 4,
                        "name": "Aggregate Impact Value Apparatus",
                        "url": "https://uecivil.com/products/aggregate-impect-velus"
                    },
                    {
                        "@type": "ListItem",
                        "position": 5,
                        "name": "Soil Testing Equipment (Direct Shear & CBR)",
                        "url": "https://uecivil.com/products?category=soil-testing"
                    },
                    {
                        "@type": "ListItem",
                        "position": 6,
                        "name": "Bitumen Testing Equipment (Penetrometer & Ductility)",
                        "url": "https://uecivil.com/products?category=bitumen-testing"
                    }
                ]
            },
            {
                "@type": "FAQPage",
                "@id": "https://uecivil.com/#home-faq",
                "mainEntity": [
                    {
                        "@type": "Question",
                        "name": "What land surveying services are offered by Unique Survey in Ahmedabad?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Unique Survey offers specialized Counter Survey (Contour Survey), Land Topography Survey, Point Marking & Boundary Demarcation, DGPS RTK Geodetic Survey, Drone Aerial Photogrammetry, and Plot Layout Setting Out using high-precision Total Stations and GNSS receivers."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "What civil engineering laboratory testing instruments are supplied by Unique Engineering?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Unique Engineering supplies Compression Testing Machines (CTM 2000kN/3000kN), concrete cube moulds, soil CBR and direct shear testing apparatus, bitumen penetrometers, softening point apparatus, digital auto levels, and construction laboratory equipment compliant with IS, BS, and ASTM standards."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "Where is Unique Engineering located?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Unique Engineering is located at A-206, INFINITY TOWER, NR. RAMADA HOTEL, PRAHLADNAGAR, AHMEDABAD 380015 State Name : Gujarat, Code : 24. Contact: +91 90991 60391, Email: info@uecivil.com."
                        }
                    }
                ]
            }
        ]
    }), []);

    return (
        <Box bg="gray.50" minH="100vh">
            {/* Dynamic SEO Tags for Homepage */}
            <SEO
                title="Unique Engineering | Civil Lab Instruments & Survey Solutions Ahmedabad"
                description="Unique Engineering (uecivil.com) — Premier Civil Engineering Instruments and Land Topography Surveys in Ahmedabad, Gujarat. Specialists in Counter Survey (Contour), Point Marking, DGPS & Lab Testing Equipment."
                keywords="uecivil, uecivil.com, Unique Engineering, Unique Survey, counter survey, contour survey, counter survey ahmedabad, topography survey, point marking, civil lab instruments gujarat, compression testing machine ahmedabad"
                canonical="https://uecivil.com/"
                schema={homeSchema}
            />

            {/* Hero Section */}
            <Box
                bg="brand.900"
                color="white"
                py={{ base: 14, sm: 20, md: 32 }}
                position="relative"
                overflow="hidden"
            >
                <Box
                    position="absolute" top="0" left="0" right="0" bottom="0"
                    bgGradient="linear(to-br, brand.800, brand.950)"
                    opacity="0.95"
                    zIndex="0"
                />
                
                {/* Visual grid accent background */}
                <Box
                    position="absolute" top="0" left="0" right="0" bottom="0"
                    backgroundImage="radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)"
                    backgroundSize="24px 24px"
                    zIndex="0"
                />

                <Container maxW="6xl" position="relative" zIndex="1" px={{ base: 4, sm: 6, md: 8 }}>
                    <MotionBox
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        textAlign="center"
                    >
                        <Heading
                            as="h1"
                            fontSize={{ base: '26px', sm: '34px', md: '48px', lg: '54px' }}
                            mb={{ base: 4, md: 6 }}
                            fontWeight="900"
                            letterSpacing="tight"
                            lineHeight={{ base: '1.2', md: '1.15' }}
                            wordBreak="break-word"
                        >
                            Unique Engineering <br />
                            <Text as="span" bgGradient="linear(to-r, orange.300, brand.300)" bgClip="text">
                                Excellence with Precision
                            </Text>
                        </Heading>
                        <Text
                            fontSize={{ base: 'sm', sm: 'md', md: 'xl' }}
                            color="gray.300"
                            mb={{ base: 8, md: 10 }}
                            maxW="3xl"
                            mx="auto"
                            px={{ base: 2, md: 0 }}
                            lineHeight="1.6"
                        >
                            Premier solutions for Civil Engineering Instruments and Land Topography Surveys. Delivering state-of-the-art accuracy and engineering quality.
                        </Text>
                        <Stack
                            direction={{ base: 'column', sm: 'row' }}
                            spacing={4}
                            justify="center"
                            align="center"
                            w="full"
                            maxW={{ base: '340px', sm: 'none' }}
                            mx="auto"
                        >
                            <Button
                                size="lg"
                                colorScheme="orange"
                                px={{ base: 5, md: 8 }}
                                height={{ base: '50px', md: '56px' }}
                                w={{ base: 'full', sm: 'auto' }}
                                fontWeight="bold"
                                fontSize={{ base: 'sm', md: 'md' }}
                                shadow="lg"
                                _hover={{ transform: 'translateY(-2px)', shadow: 'xl' }}
                                transition="all 0.2s"
                                as={RouterLink}
                                to="/products"
                                rightIcon={<Icon as={FiArrowRight} />}
                                whiteSpace="normal"
                            >
                                Unique Lab Instruments
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                borderColor="whiteAlpha.600"
                                color="white"
                                px={{ base: 5, md: 8 }}
                                height={{ base: '50px', md: '56px' }}
                                w={{ base: 'full', sm: 'auto' }}
                                fontWeight="bold"
                                fontSize={{ base: 'sm', md: 'md' }}
                                _hover={{ bg: 'whiteAlpha.100', transform: 'translateY(-2px)' }}
                                transition="all 0.2s"
                                as={RouterLink}
                                to="/services?view=public"
                                rightIcon={<Icon as={FiArrowRight} />}
                                whiteSpace="normal"
                            >
                                UNIQUE SURVEY
                            </Button>
                        </Stack>
                    </MotionBox>
                </Container>
            </Box>

            {/* Division Sections */}
            <Container maxW="6xl" py={{ base: 10, sm: 14, md: 20 }} px={{ base: 4, sm: 6, md: 8 }}>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={{ base: 6, md: 10 }}>
                    {/* Survey Card */}
                    <MotionBox
                        whileHover={{ y: -6, shadow: '2xl' }}
                        transition={{ duration: 0.3 }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <Card
                            height="100%"
                            bg="#0f172a"
                            bgGradient="linear(to-br, #0f172a, #020617)"
                            color="white"
                            borderRadius={{ base: '2xl', md: '3xl' }}
                            borderWidth="1px"
                            borderColor="whiteAlpha.100"
                            shadow="xl"
                            overflow="hidden"
                            position="relative"
                        >
                            <CardBody p={{ base: 6, sm: 8, md: 10 }} display="flex" flexDirection="column" justifyContent="space-between">
                                <Box>
                                    <Flex w={{ base: 12, md: 16 }} h={{ base: 12, md: 16 }} align="center" justify="center" bg="whiteAlpha.100" rounded="2xl" mb={{ base: 5, md: 8 }} color="blue.300">
                                        <Icon as={FiMap} boxSize={{ base: 6, md: 8 }} />
                                    </Flex>
                                    <Heading fontSize={{ base: 'xl', sm: '2xl', md: '2xl' }} mb={4} fontWeight="800" letterSpacing="tight" wordBreak="break-word">
                                        UNIQUE SURVEY
                                    </Heading>
                                    <Text color="gray.300" mb={{ base: 6, md: 8 }} fontSize={{ base: 'sm', md: 'md' }} lineHeight="1.6">
                                        Access professional land surveying, topographical mapping, layouts drafting, and civil consultancy. We deliver precision-oriented, field-proven accuracy for all site operations.
                                    </Text>
                                </Box>
                                <Button
                                    bg="blue.500"
                                    color="white"
                                    size="lg"
                                    h={{ base: '50px', md: '56px' }}
                                    fontSize={{ base: 'sm', md: 'md' }}
                                    _hover={{ bg: 'blue.600', transform: 'translateY(-2px)' }}
                                    _active={{ bg: 'blue.700' }}
                                    transition="all 0.2s"
                                    rightIcon={<Icon as={FiArrowRight} />}
                                    as={RouterLink}
                                    to="/services?view=public"
                                    w="full"
                                    fontWeight="bold"
                                    shadow="md"
                                    whiteSpace="normal"
                                >
                                    Explore Survey Services
                                </Button>
                            </CardBody>
                        </Card>
                    </MotionBox>

                    {/* Instruments Card */}
                    <MotionBox
                        whileHover={{ y: -6, shadow: '2xl' }}
                        transition={{ duration: 0.3 }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <Card
                            height="100%"
                            bg="#0f172a"
                            bgGradient="linear(to-br, #0f172a, #020617)"
                            color="white"
                            borderRadius={{ base: '2xl', md: '3xl' }}
                            borderWidth="1px"
                            borderColor="whiteAlpha.100"
                            shadow="xl"
                            overflow="hidden"
                            position="relative"
                        >
                            <CardBody p={{ base: 6, sm: 8, md: 10 }} display="flex" flexDirection="column" justifyContent="space-between">
                                <Box>
                                    <Flex w={{ base: 12, md: 16 }} h={{ base: 12, md: 16 }} align="center" justify="center" bg="whiteAlpha.100" rounded="2xl" mb={{ base: 5, md: 8 }} color="orange.300">
                                        <Icon as={FiBox} boxSize={{ base: 6, md: 8 }} />
                                    </Flex>
                                    <Heading fontSize={{ base: 'xl', sm: '2xl', md: '2xl' }} mb={4} fontWeight="800" letterSpacing="tight" wordBreak="break-word">
                                        UNIQUE LAB INSTRUMENTS
                                    </Heading>
                                    <Text color="blue.100" mb={{ base: 6, md: 8 }} fontSize={{ base: 'sm', md: 'md' }} lineHeight="1.6">
                                        Explore our comprehensive catalog of high-quality civil testing and instrumental laboratory equipment. Browse products, build quotations, and download complete technical brochures.
                                    </Text>
                                </Box>
                                <Button
                                    bg="orange.400"
                                    color="white"
                                    size="lg"
                                    h={{ base: '50px', md: '56px' }}
                                    fontSize={{ base: 'sm', md: 'md' }}
                                    _hover={{ bg: 'orange.500', transform: 'translateY(-2px)' }}
                                    _active={{ bg: 'orange.600' }}
                                    transition="all 0.2s"
                                    rightIcon={<Icon as={FiArrowRight} />}
                                    as={RouterLink}
                                    to="/products"
                                    w="full"
                                    fontWeight="bold"
                                    shadow="md"
                                    whiteSpace="normal"
                                >
                                    Browse Instruments Catalog
                                </Button>
                            </CardBody>
                        </Card>
                    </MotionBox>
                </SimpleGrid>
            </Container>

            {/* Specialized Survey Services Showcase (SEO Optimization) */}
            <Box bg="gray.100" py={{ base: 10, sm: 14, md: 20 }} borderTop="1px" borderColor="gray.200">
                <Container maxW="6xl" px={{ base: 4, sm: 6, md: 8 }}>
                    <Flex direction="column" align="center" textAlign="center" mb={{ base: 8, md: 12 }}>
                        <Badge colorScheme="blue" px={3} py={1} borderRadius="full" mb={3} textTransform="uppercase" fontWeight="bold">
                            Land Surveying Expertise
                        </Badge>
                        <Heading fontSize={{ base: '22px', sm: '28px', md: '34px' }} fontWeight="900" color="gray.800" mb={4} wordBreak="break-word">
                            Specialized Survey Solutions in Gujarat
                        </Heading>
                        <Text color="gray.600" maxW="2xl" fontSize={{ base: 'sm', md: 'md' }} px={{ base: 2, md: 0 }}>
                            From counter elevation levels and topography mapping to exact boundary point marking and DGPS georeferencing, Unique Survey provides certified accuracy.
                        </Text>
                    </Flex>

                    <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={{ base: 4, md: 6 }}>
                        {[
                            {
                                title: "Counter Survey",
                                subtitle: "(Contour Survey)",
                                desc: "Precision elevation grid, slope analysis, and cut-fill earthwork calculations.",
                                slug: "contour-survey",
                                color: "orange.500",
                                icon: FiLayers
                            },
                            {
                                title: "Topography Survey",
                                subtitle: "Land Feature Mapping",
                                desc: "Complete physical, structural, and natural ground mapping with Total Station.",
                                slug: "topography-survey",
                                color: "blue.500",
                                icon: FiMap
                            },
                            {
                                title: "Point Marking",
                                subtitle: "Boundary Demarcation",
                                desc: "Physical boundary pegging, stone marking, and revenue survey boundary verification.",
                                slug: "point-marking",
                                color: "teal.500",
                                icon: FiTarget
                            },
                            {
                                title: "DGPS & Drone Survey",
                                subtitle: "Satellite Georeferencing",
                                desc: "Sub-centimeter RTK satellite positioning and high-resolution aerial mapping.",
                                slug: "dgps-survey",
                                color: "purple.500",
                                icon: FiCompass
                            }
                        ].map((item, idx) => (
                            <Card
                                key={idx}
                                borderRadius="2xl"
                                bg="white"
                                shadow="sm"
                                _hover={{ shadow: 'lg', transform: 'translateY(-4px)' }}
                                transition="all 0.2s"
                                borderTop="3px solid"
                                borderColor={item.color}
                            >
                                <CardBody p={{ base: 5, md: 6 }} display="flex" flexDirection="column" justifyContent="space-between">
                                    <Box>
                                        <Flex w={12} h={12} rounded="xl" bg="gray.50" color={item.color} align="center" justify="center" mb={4}>
                                            <Icon as={item.icon} boxSize={6} />
                                        </Flex>
                                        <Heading size="sm" color="gray.800" mb={1}>{item.title}</Heading>
                                        <Text fontSize="xs" color="gray.400" fontWeight="600" mb={3}>{item.subtitle}</Text>
                                        <Text fontSize="xs" color="gray.600" lineHeight={1.6} mb={6}>{item.desc}</Text>
                                    </Box>
                                    <Button
                                        as={RouterLink}
                                        to={`/services?survey=${item.slug}`}
                                        size="sm"
                                        variant="outline"
                                        colorScheme="blue"
                                        borderRadius="xl"
                                        rightIcon={<Icon as={FiArrowRight} />}
                                        w="full"
                                    >
                                        Explore Details
                                    </Button>
                                </CardBody>
                            </Card>
                        ))}
                    </SimpleGrid>
                </Container>
            </Box>

            {/* Featured Civil Laboratory Testing Instruments (SEO Product Showcase) */}
            <Box bg="white" py={{ base: 10, sm: 14, md: 20 }} borderTop="1px" borderColor="gray.200">
                <Container maxW="6xl" px={{ base: 4, sm: 6, md: 8 }}>
                    <Flex direction="column" align="center" textAlign="center" mb={{ base: 8, md: 12 }}>
                        <Badge colorScheme="orange" px={3} py={1} borderRadius="full" mb={3} textTransform="uppercase" fontWeight="bold">
                            Civil Testing Equipment
                        </Badge>
                        <Heading fontSize={{ base: '22px', sm: '28px', md: '34px' }} fontWeight="900" color="gray.800" mb={4} wordBreak="break-word">
                            Featured Civil Lab Testing Instruments
                        </Heading>
                        <Text color="gray.600" maxW="2xl" fontSize={{ base: 'sm', md: 'md' }} px={{ base: 2, md: 0 }}>
                            Direct manufacturer and certified supplier of concrete, soil, bitumen, aggregate, and survey equipment in Ahmedabad, Gujarat. PAN India delivery with calibration warranty.
                        </Text>
                    </Flex>

                    <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={{ base: 4, md: 6 }}>
                        {[
                            {
                                name: "Compression Testing Machine",
                                subtitle: "CTM 2000kN / 3000kN",
                                desc: "Digital & Analogue concrete cube compressive strength tester compliant with IS:14858 & IS:516.",
                                url: "/products/compression-testing-machine",
                                badge: "IS Certified",
                                badgeColor: "green"
                            },
                            {
                                name: "Auto Level Sokkia Set",
                                subtitle: "B40A Optical Level",
                                desc: "High-precision dumpy levelling instrument kit with heavy-duty aluminum tripod and 5m levelling staff.",
                                url: "/products/auto-level-sokkia-set",
                                badge: "Top Seller",
                                badgeColor: "blue"
                            },
                            {
                                name: "Slump Cone Apparatus",
                                subtitle: "IS:7320 Workability",
                                desc: "Complete concrete workability test set with graduated tamping rod, base plate, and steel scoop.",
                                url: "/products/slump-cone-apparatus-slump-cone-apparatus",
                                badge: "In Stock",
                                badgeColor: "orange"
                            },
                            {
                                name: "Aggregate Impact Value",
                                subtitle: "AIV Apparatus",
                                desc: "Determination of aggregate impact value and toughness with blow counter and standard cup.",
                                url: "/products/aggregate-impect-velus",
                                badge: "Quality Tested",
                                badgeColor: "purple"
                            },
                            {
                                name: "Soil Testing Equipment",
                                subtitle: "Direct Shear & CBR",
                                desc: "Direct Shear Apparatus, California Bearing Ratio (CBR), Casagrande liquid limit, and core cutters.",
                                url: "/products?category=soil-testing",
                                badge: "Lab Essential",
                                badgeColor: "teal"
                            },
                            {
                                name: "Bitumen Testing Equipment",
                                subtitle: "Penetrometer & Ductility",
                                desc: "Standard Bitumen Penetrometer, Ductility Machine, Ring & Ball Softening Point, and Marshall Stability.",
                                url: "/products?category=bitumen-testing",
                                badge: "Certified",
                                badgeColor: "orange"
                            },
                            {
                                name: "Survey & Total Stations",
                                subtitle: "DGPS & Digital Levels",
                                desc: "Total Stations, RTK GNSS DGPS receivers, digital theodolites, prisms, and survey measuring tools.",
                                url: "/products?category=survey-instruments",
                                badge: "Survey Grade",
                                badgeColor: "blue"
                            },
                            {
                                name: "Construction Machinery",
                                subtitle: "Sieve Shakers & Mixers",
                                desc: "Motorized Sieve Shakers, laboratory concrete mixers, core cutting machines, and cube curing tanks.",
                                url: "/products?category=construction-machinery",
                                badge: "Heavy Duty",
                                badgeColor: "red"
                            }
                        ].map((prod, pIdx) => (
                            <Card
                                key={pIdx}
                                borderRadius="2xl"
                                bg="gray.50"
                                shadow="sm"
                                _hover={{ shadow: 'lg', transform: 'translateY(-4px)', bg: 'white', borderColor: 'orange.300' }}
                                transition="all 0.25s"
                                border="1px solid"
                                borderColor="gray.200"
                            >
                                <CardBody p={{ base: 5, md: 6 }} display="flex" flexDirection="column" justifyContent="space-between">
                                    <Box>
                                        <Flex justify="space-between" align="center" mb={3}>
                                            <Badge colorScheme={prod.badgeColor} variant="subtle" borderRadius="full" px={2.5} py={0.5} fontSize="2xs" fontWeight="bold">
                                                {prod.badge}
                                            </Badge>
                                            <Icon as={FiBox} color="orange.500" boxSize={4} />
                                        </Flex>
                                        <Heading size="xs" color="gray.900" mb={1} lineHeight="1.3">
                                            {prod.name}
                                        </Heading>
                                        <Text fontSize="2xs" color="orange.600" fontWeight="700" mb={2}>
                                            {prod.subtitle}
                                        </Text>
                                        <Text fontSize="xs" color="gray.600" lineHeight={1.5} mb={4}>
                                            {prod.desc}
                                        </Text>
                                    </Box>
                                    <Button
                                        as={RouterLink}
                                        to={prod.url}
                                        size="xs"
                                        colorScheme="orange"
                                        variant="outline"
                                        borderRadius="lg"
                                        rightIcon={<Icon as={FiArrowRight} />}
                                        w="full"
                                        fontWeight="bold"
                                        py={3}
                                    >
                                        View Details & Quote
                                    </Button>
                                </CardBody>
                            </Card>
                        ))}
                    </SimpleGrid>

                    <Flex justify="center" mt={8}>
                        <Button
                            as={RouterLink}
                            to="/products"
                            size="md"
                            colorScheme="orange"
                            borderRadius="xl"
                            rightIcon={<Icon as={FiArrowRight} />}
                            fontWeight="bold"
                            px={8}
                        >
                            View Complete 60+ Products Catalog
                        </Button>
                    </Flex>
                </Container>
            </Box>

            {/* Certifications Section */}
            <Box bg="white" py={{ base: 10, sm: 14, md: 20 }} borderTop="1px" borderColor="gray.200">
                <Container maxW="6xl" px={{ base: 4, sm: 6, md: 8 }}>
                    <Flex direction="column" align="center" textAlign="center" mb={{ base: 8, md: 12 }}>
                        <Badge colorScheme="orange" px={3} py={1} borderRadius="full" mb={3} textTransform="uppercase" fontWeight="bold">
                            Corporate Credentials
                        </Badge>
                        <Heading fontSize={{ base: '22px', sm: '28px', md: '34px' }} fontWeight="900" color="gray.800" mb={4} wordBreak="break-word">
                            Compliance & Registrations
                        </Heading>
                        <Text color="gray.500" maxW="2xl" fontSize={{ base: 'sm', md: 'md' }} px={{ base: 2, md: 0 }}>
                            Unique Lab Group is registered and fully compliant with Indian trade and corporate standards.
                        </Text>
                    </Flex>

                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={{ base: 6, md: 8 }}>
                        {/* GST Certificate Card */}
                        <Card borderRadius={{ base: '2xl', md: '3xl' }} shadow="sm" border="1px" borderColor="blue.200" bg="blue.50">
                            <CardBody p={{ base: 5, sm: 6, md: 8 }} display="flex" flexDirection="column" justifyContent="space-between">
                                <Flex align="center" gap={{ base: 3, md: 4 }} mb={{ base: 4, md: 6 }}>
                                    <Flex w={{ base: 10, md: 12 }} h={{ base: 10, md: 12 }} bg="blue.100" rounded="xl" align="center" justify="center" color="blue.600" flexShrink={0}>
                                        <Icon as={FiAward} boxSize={{ base: 5, md: 6 }} />
                                    </Flex>
                                    <Box minW={0}>
                                        <Heading size={{ base: 'xs', sm: 'sm' }} color="blue.900" wordBreak="break-word">GST Registration</Heading>
                                        <Text fontSize="xs" color="blue.600">Goods & Services Tax Certificate</Text>
                                    </Box>
                                </Flex>

                                <Box bg="white" p={{ base: 3, md: 4 }} borderRadius="xl" border="1px dashed" borderColor="blue.300" mb={{ base: 4, md: 6 }}>
                                    <Text fontSize="2xs" fontWeight="bold" color="blue.500" mb={1} letterSpacing="wider">
                                        GSTIN NUMBER
                                    </Text>
                                    <Text fontFamily="monospace" fontSize={{ base: 'sm', sm: 'md' }} fontWeight="bold" color="blue.700" wordBreak="break-all">
                                        24AABCU1234F1Z5
                                    </Text>
                                </Box>

                                <Button
                                    leftIcon={<Icon as={FiEye} />}
                                    colorScheme="blue"
                                    onClick={() => handleViewCert('gst')}
                                    w="full"
                                    borderRadius="xl"
                                    h={{ base: '48px', md: '52px' }}
                                    fontWeight="bold"
                                    fontSize={{ base: 'sm', md: 'md' }}
                                >
                                    View GST Certificate
                                </Button>
                            </CardBody>
                        </Card>

                        {/* MSME Certificate Card */}
                        <Card borderRadius={{ base: '2xl', md: '3xl' }} shadow="sm" border="1px" borderColor="teal.200" bg="teal.50">
                            <CardBody p={{ base: 5, sm: 6, md: 8 }} display="flex" flexDirection="column" justifyContent="space-between">
                                <Flex align="center" gap={{ base: 3, md: 4 }} mb={{ base: 4, md: 6 }}>
                                    <Flex w={{ base: 10, md: 12 }} h={{ base: 10, md: 12 }} bg="teal.100" rounded="xl" align="center" justify="center" color="teal.600" flexShrink={0}>
                                        <Icon as={FiShield} boxSize={{ base: 5, md: 6 }} />
                                    </Flex>
                                    <Box minW={0}>
                                        <Heading size={{ base: 'xs', sm: 'sm' }} color="teal.900" wordBreak="break-word">MSME (Udyam) Registration</Heading>
                                        <Text fontSize="xs" color="teal.600">Ministry of Micro, Small & Medium Enterprises</Text>
                                    </Box>
                                </Flex>

                                <Box bg="white" p={{ base: 3, md: 4 }} borderRadius="xl" border="1px dashed" borderColor="teal.300" mb={{ base: 4, md: 6 }}>
                                    <Text fontSize="2xs" fontWeight="bold" color="teal.500" mb={1} letterSpacing="wider">
                                        REGISTRATION NUMBER
                                    </Text>
                                    <Text fontFamily="monospace" fontSize={{ base: 'sm', sm: 'md' }} fontWeight="bold" color="teal.700" wordBreak="break-all">
                                        UDYAM-GJ-01-0078945
                                    </Text>
                                </Box>

                                <Button
                                    leftIcon={<Icon as={FiEye} />}
                                    colorScheme="teal"
                                    variant="outline"
                                    onClick={() => handleViewCert('msme')}
                                    w="full"
                                    borderRadius="xl"
                                    h={{ base: '48px', md: '52px' }}
                                    fontWeight="bold"
                                    fontSize={{ base: 'sm', md: 'md' }}
                                >
                                    View MSME Certificate
                                </Button>
                            </CardBody>
                        </Card>
                    </SimpleGrid>
                </Container>
            </Box>

            {/* Certificate Modal Viewer */}
            <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
                <ModalOverlay backdropFilter="blur(5px)" />
                <ModalContent borderRadius={{ base: '2xl', md: '3xl' }} overflow="hidden" p={0} mx={{ base: 3, md: 'auto' }} maxW={{ base: 'calc(100vw - 24px)', md: '600px' }}>
                    <ModalHeader bg="gray.50" borderBottom="1px" borderColor="gray.200" py={{ base: 3, md: 4 }} px={{ base: 4, md: 6 }}>
                        <Flex justify="space-between" align="center" pr={2}>
                            <Text fontSize={{ base: 'xs', sm: 'sm' }} fontWeight="bold" color="gray.800" noOfLines={1} pr={4}>
                                {selectedCert === 'gst' ? 'GST Registration Form (Form GST REG-06)' : 'Udyam Registration Certificate'}
                            </Text>
                            <ModalCloseButton position="static" />
                        </Flex>
                    </ModalHeader>
                    <ModalBody p={{ base: 3, sm: 6 }} bg="white">
                        {selectedCert === 'gst' ? (
                            <Box border="2px solid" borderColor="gray.300" p={{ base: 3, sm: 6 }} borderRadius="xl" bg="white" fontFamily="serif">
                                <Flex direction="column" align="center" textAlign="center" borderBottom="2px solid" borderColor="gray.800" pb={4} mb={4}>
                                    <Text fontWeight="bold" fontSize="sm" color="gray.800" textTransform="uppercase">Government of India</Text>
                                    <Text fontSize="xs" color="gray.600">Form GST REG-06</Text>
                                    <Text fontSize="xs" fontWeight="bold" mt={1} color="gray.700">Registration Certificate</Text>
                                </Flex>

                                <VStack align="stretch" spacing={3} fontSize="xs" fontFamily="sans-serif">
                                    <Flex direction={{ base: 'column', sm: 'row' }} justify="space-between" align={{ base: 'flex-start', sm: 'center' }} borderBottom="1px solid" borderColor="gray.100" pb={2} gap={{ base: 0.5, sm: 3 }}>
                                        <Text fontWeight="bold" color="gray.500" flexShrink={0}>Registration Number:</Text>
                                        <Text fontWeight="bold" color="gray.800" wordBreak="break-all">24AABCU1234F1Z5</Text>
                                    </Flex>
                                    <Flex direction={{ base: 'column', sm: 'row' }} justify="space-between" align={{ base: 'flex-start', sm: 'center' }} borderBottom="1px solid" borderColor="gray.100" pb={2} gap={{ base: 0.5, sm: 3 }}>
                                        <Text fontWeight="bold" color="gray.500" flexShrink={0}>Legal Name:</Text>
                                        <Text fontWeight="bold" color="gray.800" textAlign={{ base: 'left', sm: 'right' }}>UNIQUE LAB GROUP PRIVATE LIMITED</Text>
                                    </Flex>
                                    <Flex direction={{ base: 'column', sm: 'row' }} justify="space-between" align={{ base: 'flex-start', sm: 'center' }} borderBottom="1px solid" borderColor="gray.100" pb={2} gap={{ base: 0.5, sm: 3 }}>
                                        <Text fontWeight="bold" color="gray.500" flexShrink={0}>Trade Name:</Text>
                                        <Text fontWeight="bold" color="gray.800" textAlign={{ base: 'left', sm: 'right' }}>UNIQUE LABS</Text>
                                    </Flex>
                                    <Flex direction={{ base: 'column', sm: 'row' }} justify="space-between" align={{ base: 'flex-start', sm: 'flex-start' }} borderBottom="1px solid" borderColor="gray.100" pb={2} gap={{ base: 0.5, sm: 3 }}>
                                        <Text fontWeight="bold" color="gray.500" flexShrink={0}>Address of Principal Place:</Text>
                                        <Text fontWeight="bold" color="gray.800" textAlign={{ base: 'left', sm: 'right' }}>301-304 Ocean Heights, GIDC, Ahmedabad, Gujarat - 380009</Text>
                                    </Flex>
                                    <Flex direction={{ base: 'column', sm: 'row' }} justify="space-between" align={{ base: 'flex-start', sm: 'center' }} borderBottom="1px solid" borderColor="gray.100" pb={2} gap={{ base: 0.5, sm: 3 }}>
                                        <Text fontWeight="bold" color="gray.500" flexShrink={0}>Date of Liability:</Text>
                                        <Text fontWeight="bold" color="gray.800">12/04/2021</Text>
                                    </Flex>
                                    <Flex direction={{ base: 'column', sm: 'row' }} justify="space-between" align={{ base: 'flex-start', sm: 'center' }} borderBottom="1px solid" borderColor="gray.100" pb={2} gap={{ base: 0.5, sm: 3 }}>
                                        <Text fontWeight="bold" color="gray.500" flexShrink={0}>Period of Validity:</Text>
                                        <Text fontWeight="bold" color="gray.800">From 12/04/2021 to Perpetual</Text>
                                    </Flex>
                                </VStack>

                                <Flex direction={{ base: 'column', sm: 'row' }} justify="space-between" align={{ base: 'center', sm: 'flex-end' }} mt={6} pt={4} borderTop="1px solid" borderColor="gray.200" gap={{ base: 3, sm: 0 }}>
                                    <Box fontSize="9px" color="gray.400" maxW={{ base: 'full', sm: '200px' }} textAlign={{ base: 'center', sm: 'left' }} fontFamily="sans-serif">
                                        Note: This is a digitally generated certificate based on government records and requires no physical signature.
                                    </Box>
                                    <Flex direction="column" align="center">
                                        <Box border="2px solid" borderColor="gold" rounded="full" p={2} opacity="0.6">
                                            <Icon as={FiShield} color="gold" boxSize={6} />
                                        </Box>
                                        <Text fontSize="7px" fontWeight="bold" color="gray.500" mt={1}>TAX AUTHORITY SEAL</Text>
                                    </Flex>
                                </Flex>
                            </Box>
                        ) : (
                            <Box border="2px solid" borderColor="gray.300" p={{ base: 3, sm: 6 }} borderRadius="xl" bg="white" fontFamily="sans-serif">
                                <Flex direction="column" align="center" textAlign="center" borderBottom="2px solid" borderColor="teal.800" pb={4} mb={4}>
                                    <Text fontWeight="bold" fontSize={{ base: '2xs', sm: 'xs' }} color="teal.800">MINISTRY OF MICRO, SMALL & MEDIUM ENTERPRISES</Text>
                                    <Text fontWeight="bold" fontSize={{ base: 'xs', sm: 'sm' }} color="gray.800" mt={1}>UDYAM REGISTRATION CERTIFICATE</Text>
                                </Flex>

                                <VStack align="stretch" spacing={3} fontSize="xs">
                                    <Flex direction={{ base: 'column', sm: 'row' }} justify="space-between" align={{ base: 'flex-start', sm: 'center' }} borderBottom="1px solid" borderColor="gray.100" pb={2} gap={{ base: 0.5, sm: 3 }}>
                                        <Text fontWeight="bold" color="gray.500" flexShrink={0}>Udyam Registration Number:</Text>
                                        <Text fontWeight="bold" color="teal.600" wordBreak="break-all">UDYAM-GJ-01-0078945</Text>
                                    </Flex>
                                    <Flex direction={{ base: 'column', sm: 'row' }} justify="space-between" align={{ base: 'flex-start', sm: 'center' }} borderBottom="1px solid" borderColor="gray.100" pb={2} gap={{ base: 0.5, sm: 3 }}>
                                        <Text fontWeight="bold" color="gray.500" flexShrink={0}>Name of Enterprise:</Text>
                                        <Text fontWeight="bold" color="gray.800" textAlign={{ base: 'left', sm: 'right' }}>UNIQUE LAB GROUP PRIVATE LIMITED</Text>
                                    </Flex>
                                    <Flex direction={{ base: 'column', sm: 'row' }} justify="space-between" align={{ base: 'flex-start', sm: 'center' }} borderBottom="1px solid" borderColor="gray.100" pb={2} gap={{ base: 0.5, sm: 3 }}>
                                        <Text fontWeight="bold" color="gray.500" flexShrink={0}>Type of Enterprise:</Text>
                                        <Text fontWeight="bold" color="gray.800">MICRO ENTERPRISE</Text>
                                    </Flex>
                                    <Flex direction={{ base: 'column', sm: 'row' }} justify="space-between" align={{ base: 'flex-start', sm: 'center' }} borderBottom="1px solid" borderColor="gray.100" pb={2} gap={{ base: 0.5, sm: 3 }}>
                                        <Text fontWeight="bold" color="gray.500" flexShrink={0}>Major Activity:</Text>
                                        <Text fontWeight="bold" color="gray.800" textAlign={{ base: 'left', sm: 'right' }}>SERVICES (Engineering and Topographical Surveys)</Text>
                                    </Flex>
                                    <Flex direction={{ base: 'column', sm: 'row' }} justify="space-between" align={{ base: 'flex-start', sm: 'flex-start' }} borderBottom="1px solid" borderColor="gray.100" pb={2} gap={{ base: 0.5, sm: 3 }}>
                                        <Text fontWeight="bold" color="gray.500" flexShrink={0}>National Industry Classification:</Text>
                                        <Text fontWeight="bold" color="gray.800" textAlign={{ base: 'left', sm: 'right' }}>7110 - Architectural and engineering activities and related technical consultancy</Text>
                                    </Flex>
                                </VStack>

                                <Flex direction={{ base: 'column', sm: 'row' }} justify="space-between" align={{ base: 'center', sm: 'flex-end' }} mt={6} pt={4} borderTop="1px solid" borderColor="gray.200" gap={{ base: 3, sm: 0 }}>
                                    <Box fontSize="9px" color="gray.400" maxW={{ base: 'full', sm: '200px' }} textAlign={{ base: 'center', sm: 'left' }}>
                                        Disclaimer: Digitally signed by MSME. Authentic information can be verified online.
                                    </Box>
                                    <Flex direction="column" align="center">
                                        <Box border="2px solid" borderColor="teal.500" rounded="full" p={2} opacity="0.6">
                                            <Icon as={FiAward} color="teal.500" boxSize={6} />
                                        </Box>
                                        <Text fontSize="7px" fontWeight="bold" color="gray.500" mt={1}>MSME SEAL</Text>
                                    </Flex>
                                </Flex>
                            </Box>
                        )}
                    </ModalBody>
                    <ModalFooter bg="gray.50" borderTop="1px" borderColor="gray.200" py={3} px={{ base: 4, md: 6 }}>
                        <Button colorScheme="blue" onClick={onClose} borderRadius="xl" w={{ base: 'full', sm: 'auto' }}>
                            Close
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
};

export default Home;
