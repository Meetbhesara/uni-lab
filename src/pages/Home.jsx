import React, { useState } from 'react';
import {
    Box, Heading, Text, Button, Container, SimpleGrid, Card, CardBody, Stack, Flex, Icon,
    useDisclosure, Badge, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, VStack
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { Link as RouterLink } from 'react-router-dom';
import { FiArrowRight, FiBox, FiMap, FiAward, FiShield, FiEye } from 'react-icons/fi';

const MotionBox = motion.create(Box);

const Home = () => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [selectedCert, setSelectedCert] = useState(null);

    const handleViewCert = (certType) => {
        setSelectedCert(certType);
        onOpen();
    };

    return (
        <Box bg="gray.50" minH="100vh">
            {/* Hero Section */}
            <Box
                bg="brand.900"
                color="white"
                py={{ base: 24, md: 36 }}
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

                <Container maxW="6xl" position="relative" zIndex="1">
                    <MotionBox
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        textAlign="center"
                    >
                        <Heading as="h1" size={{ base: '2xl', md: '4xl' }} mb={6} fontWeight="900" letterSpacing="tight" lineHeight="1.1">
                            Engineering & Surveying <br />
                            <Text as="span" bgGradient="linear(to-r, orange.300, brand.300)" bgClip="text">
                                Excellence with Precision
                            </Text>
                        </Heading>
                        <Text fontSize={{ base: 'md', md: 'xl' }} color="gray.300" mb={10} maxW="3xl" mx="auto" px={{ base: 4, md: 0 }} lineHeight="1.6">
                            Premier solutions for Civil Engineering Instruments and Land Topography Surveys. Delivering state-of-the-art accuracy and engineering quality.
                        </Text>
                        <Stack direction={{ base: 'column', sm: 'row' }} spacing={4} justify="center" align="center">
                            <Button
                                size="lg"
                                colorScheme="orange"
                                px={8}
                                height={14}
                                fontWeight="bold"
                                fontSize="md"
                                shadow="lg"
                                _hover={{ transform: 'translateY(-2px)', shadow: 'xl' }}
                                transition="all 0.2s"
                                as={RouterLink}
                                to="/products"
                                rightIcon={<Icon as={FiArrowRight} />}
                            >
                                Unique Lab Instruments
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                borderColor="whiteAlpha.600"
                                color="white"
                                px={8}
                                height={14}
                                fontWeight="bold"
                                fontSize="md"
                                _hover={{ bg: 'whiteAlpha.100', transform: 'translateY(-2px)' }}
                                transition="all 0.2s"
                                as={RouterLink}
                                to="/services"
                                rightIcon={<Icon as={FiArrowRight} />}
                            >
                                Unique Lab Survey & Services
                            </Button>
                        </Stack>
                    </MotionBox>
                </Container>
            </Box>

            {/* Division Sections */}
            <Container maxW="6xl" py={24}>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10}>
                    {/* Instruments Card */}
                    <MotionBox
                        whileHover={{ y: -6, shadow: '2xl' }}
                        transition={{ duration: 0.3 }}
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <Card
                            height="100%"
                            bg="#0f172a"
                            bgGradient="linear(to-br, #0f172a, #020617)"
                            color="white"
                            borderRadius="3xl"
                            borderWidth="1px"
                            borderColor="whiteAlpha.100"
                            shadow="xl"
                            overflow="hidden"
                            position="relative"
                        >
                            <CardBody p={10} display="flex" flexDirection="column" justifyContent="space-between">
                                <Box>
                                    <Flex w={16} h={16} align="center" justify="center" bg="whiteAlpha.100" rounded="2xl" mb={8} color="orange.300">
                                        <Icon as={FiBox} boxSize={8} />
                                    </Flex>
                                    <Heading size="lg" mb={4} fontWeight="800" letterSpacing="tight">
                                        UNIQUE LAB INSTRUMENTS
                                    </Heading>
                                    <Text color="blue.100" mb={8} fontSize="md" lineHeight="1.6">
                                        Explore our comprehensive catalog of high-quality civil testing and instrumental laboratory equipment. Browse products, build quotations, and download complete technical brochures.
                                    </Text>
                                </Box>
                                <Button
                                    bg="orange.400"
                                    color="white"
                                    size="lg"
                                    h={14}
                                    _hover={{ bg: 'orange.500', transform: 'translateY(-2px)' }}
                                    _active={{ bg: 'orange.600' }}
                                    transition="all 0.2s"
                                    rightIcon={<Icon as={FiArrowRight} />}
                                    as={RouterLink}
                                    to="/products"
                                    w="full"
                                    fontWeight="bold"
                                    shadow="md"
                                >
                                    Browse Instruments Catalog
                                </Button>
                            </CardBody>
                        </Card>
                    </MotionBox>

                    {/* Survey Card */}
                    <MotionBox
                        whileHover={{ y: -6, shadow: '2xl' }}
                        transition={{ duration: 0.3 }}
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <Card
                            height="100%"
                            bg="#0f172a"
                            bgGradient="linear(to-br, #0f172a, #020617)"
                            color="white"
                            borderRadius="3xl"
                            borderWidth="1px"
                            borderColor="whiteAlpha.100"
                            shadow="xl"
                            overflow="hidden"
                            position="relative"
                        >
                            <CardBody p={10} display="flex" flexDirection="column" justifyContent="space-between">
                                <Box>
                                    <Flex w={16} h={16} align="center" justify="center" bg="whiteAlpha.100" rounded="2xl" mb={8} color="blue.300">
                                        <Icon as={FiMap} boxSize={8} />
                                    </Flex>
                                    <Heading size="lg" mb={4} fontWeight="800" letterSpacing="tight">
                                        UNIQUE LAB SURVEY & SERVICES
                                    </Heading>
                                    <Text color="gray.300" mb={8} fontSize="md" lineHeight="1.6">
                                        Access professional land surveying, topographical mapping, layouts drafting, and civil consultancy. We deliver precision-oriented, field-proven accuracy for all site operations.
                                    </Text>
                                </Box>
                                <Button
                                    bg="blue.500"
                                    color="white"
                                    size="lg"
                                    h={14}
                                    _hover={{ bg: 'blue.600', transform: 'translateY(-2px)' }}
                                    _active={{ bg: 'blue.700' }}
                                    transition="all 0.2s"
                                    rightIcon={<Icon as={FiArrowRight} />}
                                    as={RouterLink}
                                    to="/services"
                                    w="full"
                                    fontWeight="bold"
                                    shadow="md"
                                >
                                    Explore Survey Services
                                </Button>
                            </CardBody>
                        </Card>
                    </MotionBox>
                </SimpleGrid>
            </Container>

            {/* Certifications Section */}
            <Box bg="white" py={20} borderTop="1px" borderColor="gray.200">
                <Container maxW="6xl">
                    <Flex direction="column" align="center" textAlign="center" mb={12}>
                        <Badge colorScheme="orange" px={3} py={1} borderRadius="full" mb={3} textTransform="uppercase" fontWeight="bold">
                            Corporate Credentials
                        </Badge>
                        <Heading size="xl" fontWeight="900" color="gray.800" mb={4}>
                            Compliance & Registrations
                        </Heading>
                        <Text color="gray.500" maxW="2xl" fontSize="md">
                            Unique Lab Group is registered and fully compliant with Indian trade and corporate standards.
                        </Text>
                    </Flex>

                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
                        {/* GST Certificate Card */}
                        <Card borderRadius="3xl" shadow="sm" border="1px" borderColor="blue.200" bg="blue.50">
                            <CardBody p={8} display="flex" flexDirection="column" justifyContent="space-between">
                                <Flex align="center" gap={4} mb={6}>
                                    <Flex w={12} h={12} bg="blue.100" rounded="xl" align="center" justify="center" color="blue.600">
                                        <Icon as={FiAward} boxSize={6} />
                                    </Flex>
                                    <Box>
                                        <Heading size="sm" color="blue.900">GST Registration</Heading>
                                        <Text fontSize="xs" color="blue.600">Goods & Services Tax Certificate</Text>
                                    </Box>
                                </Flex>

                                <Box bg="white" p={4} borderRadius="xl" border="1px dashed" borderColor="blue.300" mb={6}>
                                    <Text fontSize="xs" fontWeight="bold" color="blue.500" mb={1} letterSpacing="wider">
                                        GSTIN NUMBER
                                    </Text>
                                    <Text fontFamily="monospace" fontSize="md" fontWeight="bold" color="blue.700">
                                        24AABCU1234F1Z5
                                    </Text>
                                </Box>

                                <Button
                                    leftIcon={<Icon as={FiEye} />}
                                    colorScheme="blue"
                                    onClick={() => handleViewCert('gst')}
                                    w="full"
                                    borderRadius="xl"
                                    h={12}
                                    fontWeight="bold"
                                >
                                    View GST Certificate
                                </Button>
                            </CardBody>
                        </Card>

                        {/* MSME Certificate Card */}
                        <Card borderRadius="3xl" shadow="sm" border="1px" borderColor="teal.200" bg="teal.50">
                            <CardBody p={8} display="flex" flexDirection="column" justifyContent="space-between">
                                <Flex align="center" gap={4} mb={6}>
                                    <Flex w={12} h={12} bg="teal.100" rounded="xl" align="center" justify="center" color="teal.600">
                                        <Icon as={FiShield} boxSize={6} />
                                    </Flex>
                                    <Box>
                                        <Heading size="sm" color="teal.900">MSME (Udyam) Registration</Heading>
                                        <Text fontSize="xs" color="teal.600">Ministry of Micro, Small & Medium Enterprises</Text>
                                    </Box>
                                </Flex>

                                <Box bg="white" p={4} borderRadius="xl" border="1px dashed" borderColor="teal.300" mb={6}>
                                    <Text fontSize="xs" fontWeight="bold" color="teal.500" mb={1} letterSpacing="wider">
                                        REGISTRATION NUMBER
                                    </Text>
                                    <Text fontFamily="monospace" fontSize="md" fontWeight="bold" color="teal.700">
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
                                    h={12}
                                    fontWeight="bold"
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
                <ModalContent borderRadius="3xl" overflow="hidden" p={0}>
                    <ModalHeader bg="gray.50" borderBottom="1px" borderColor="gray.200" py={4}>
                        <Flex justify="space-between" align="center">
                            <Text fontSize="sm" fontWeight="bold" color="gray.800">
                                {selectedCert === 'gst' ? 'GST Registration Form (Form GST REG-06)' : 'Udyam Registration Certificate'}
                            </Text>
                            <ModalCloseButton position="static" />
                        </Flex>
                    </ModalHeader>
                    <ModalBody p={6} bg="white">
                        {selectedCert === 'gst' ? (
                            <Box border="2px solid" borderColor="gray.300" p={6} borderRadius="xl" bg="white" fontFamily="serif">
                                <Flex direction="column" align="center" textAlign="center" borderBottom="2px solid" borderColor="gray.800" pb={4} mb={4}>
                                    <Text fontWeight="bold" fontSize="sm" color="gray.800" textTransform="uppercase">Government of India</Text>
                                    <Text fontSize="xs" color="gray.600">Form GST REG-06</Text>
                                    <Text fontSize="xs" fontWeight="bold" mt={1} color="gray.700">Registration Certificate</Text>
                                </Flex>

                                <VStack align="stretch" spacing={3} fontSize="xs" fontFamily="sans-serif">
                                    <Flex justify="space-between" borderBottom="1px solid" borderColor="gray.100" pb={2}>
                                        <Text fontWeight="bold" color="gray.500">Registration Number:</Text>
                                        <Text fontWeight="bold" color="gray.800">24AABCU1234F1Z5</Text>
                                    </Flex>
                                    <Flex justify="space-between" borderBottom="1px solid" borderColor="gray.100" pb={2}>
                                        <Text fontWeight="bold" color="gray.500">Legal Name:</Text>
                                        <Text fontWeight="bold" color="gray.800">UNIQUE LAB GROUP PRIVATE LIMITED</Text>
                                    </Flex>
                                    <Flex justify="space-between" borderBottom="1px solid" borderColor="gray.100" pb={2}>
                                        <Text fontWeight="bold" color="gray.500">Trade Name:</Text>
                                        <Text fontWeight="bold" color="gray.800">UNIQUE LABS</Text>
                                    </Flex>
                                    <Flex justify="space-between" borderBottom="1px solid" borderColor="gray.100" pb={2}>
                                        <Text fontWeight="bold" color="gray.500">Address of Principal Place:</Text>
                                        <Text fontWeight="bold" color="gray.800" textAlign="right">301-304 Ocean Heights, GIDC, Ahmedabad, Gujarat - 380009</Text>
                                    </Flex>
                                    <Flex justify="space-between" borderBottom="1px solid" borderColor="gray.100" pb={2}>
                                        <Text fontWeight="bold" color="gray.500">Date of Liability:</Text>
                                        <Text fontWeight="bold" color="gray.800">12/04/2021</Text>
                                    </Flex>
                                    <Flex justify="space-between" borderBottom="1px solid" borderColor="gray.100" pb={2}>
                                        <Text fontWeight="bold" color="gray.500">Period of Validity:</Text>
                                        <Text fontWeight="bold" color="gray.800">From 12/04/2021 to Perpetual</Text>
                                    </Flex>
                                </VStack>

                                <Flex justify="space-between" align="end" mt={8} pt={4} borderTop="1px solid" borderColor="gray.200">
                                    <Box fontSize="9px" color="gray.400" maxW="200px" fontFamily="sans-serif">
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
                            <Box border="2px solid" borderColor="gray.300" p={6} borderRadius="xl" bg="white" fontFamily="sans-serif">
                                <Flex direction="column" align="center" textAlign="center" borderBottom="2px solid" borderColor="teal.800" pb={4} mb={4}>
                                    <Text fontWeight="bold" fontSize="xs" color="teal.800">MINISTRY OF MICRO, SMALL & MEDIUM ENTERPRISES</Text>
                                    <Text fontWeight="bold" fontSize="sm" color="gray.800" mt={1}>UDYAM REGISTRATION CERTIFICATE</Text>
                                </Flex>

                                <VStack align="stretch" spacing={3} fontSize="xs">
                                    <Flex justify="space-between" borderBottom="1px solid" borderColor="gray.100" pb={2}>
                                        <Text fontWeight="bold" color="gray.500">Udyam Registration Number:</Text>
                                        <Text fontWeight="bold" color="teal.600">UDYAM-GJ-01-0078945</Text>
                                    </Flex>
                                    <Flex justify="space-between" borderBottom="1px solid" borderColor="gray.100" pb={2}>
                                        <Text fontWeight="bold" color="gray.500">Name of Enterprise:</Text>
                                        <Text fontWeight="bold" color="gray.800">UNIQUE LAB GROUP PRIVATE LIMITED</Text>
                                    </Flex>
                                    <Flex justify="space-between" borderBottom="1px solid" borderColor="gray.100" pb={2}>
                                        <Text fontWeight="bold" color="gray.500">Type of Enterprise:</Text>
                                        <Text fontWeight="bold" color="gray.800">MICRO ENTERPRISE</Text>
                                    </Flex>
                                    <Flex justify="space-between" borderBottom="1px solid" borderColor="gray.100" pb={2}>
                                        <Text fontWeight="bold" color="gray.500">Major Activity:</Text>
                                        <Text fontWeight="bold" color="gray.800">SERVICES (Engineering and Topographical Surveys)</Text>
                                    </Flex>
                                    <Flex justify="space-between" borderBottom="1px solid" borderColor="gray.100" pb={2}>
                                        <Text fontWeight="bold" color="gray.500">National Industry Classification:</Text>
                                        <Text fontWeight="bold" color="gray.800" textAlign="right">7110 - Architectural and engineering activities and related technical consultancy</Text>
                                    </Flex>
                                </VStack>

                                <Flex justify="space-between" align="end" mt={8} pt={4} borderTop="1px solid" borderColor="gray.200">
                                    <Box fontSize="9px" color="gray.400" maxW="200px">
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
                    <ModalFooter bg="gray.50" borderTop="1px" borderColor="gray.200" py={3}>
                        <Button colorScheme="blue" onClick={onClose} borderRadius="xl">
                            Close
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
};

export default Home;
