import React from 'react';
import { Box, Container, Stack, Text, Link, SimpleGrid, HStack, VStack, Flex, Icon, Divider } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaCheckCircle } from 'react-icons/fa';

const scrollToTop = () => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
};

const Footer = () => {
    return (
        <Box bg="#0B132B" color="gray.300" pt={14} pb={8} borderTop="1px solid" borderColor="whiteAlpha.100">
            <Container maxW="7xl">
                <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={10} mb={12}>
                    {/* Column 1: Brand & Contact */}
                    <Stack spacing={4} align="flex-start">
                        <Box>
                            <Text fontWeight="900" fontSize="xl" color="white" letterSpacing="tight">
                                Unique Engineering
                            </Text>
                            <Text fontSize="xs" fontWeight="bold" color="orange.400" letterSpacing="wider" textTransform="uppercase">
                                Unique Survey & Lab Instruments
                            </Text>
                        </Box>
                        <Text fontSize="xs" color="gray.400" lineHeight={1.7}>
                            Premier civil engineering testing equipment provider and certified land surveying consultancy based in Ahmedabad, Gujarat. Operating across India.
                        </Text>
                        <VStack spacing={2} align="flex-start" pt={1}>
                            <HStack spacing={2} fontSize="xs" color="gray.300">
                                <Icon as={FaMapMarkerAlt} color="orange.400" />
                                <Text>Shyamal Cross Road, Satellite, Ahmedabad, Gujarat</Text>
                            </HStack>
                            <HStack spacing={2} fontSize="xs" color="gray.300">
                                <Icon as={FaPhoneAlt} color="green.400" />
                                <Link href="tel:+919099160391" _hover={{ color: "white" }}>+91 90991 60391</Link>
                            </HStack>
                            <HStack spacing={2} fontSize="xs" color="gray.300">
                                <Icon as={FaEnvelope} color="blue.400" />
                                <Link href="mailto:atulkanak@uniquelabservices.com" _hover={{ color: "white" }}>atulkanak@uniquelabservices.com</Link>
                            </HStack>
                        </VStack>
                    </Stack>

                    {/* Column 2: Survey Solutions */}
                    <Stack spacing={3} align="flex-start">
                        <Text fontWeight="bold" fontSize="sm" color="white" textTransform="uppercase" letterSpacing="wider">
                            Land Survey Services
                        </Text>
                        <Link as={RouterLink} to="/services?view=public&survey=contour-survey" onClick={scrollToTop} fontSize="xs" color="gray.400" _hover={{ color: "orange.300" }}>
                            Counter Survey (Contour Survey)
                        </Link>
                        <Link as={RouterLink} to="/services?view=public&survey=topography-survey" onClick={scrollToTop} fontSize="xs" color="gray.400" _hover={{ color: "orange.300" }}>
                            Land Topography Survey
                        </Link>
                        <Link as={RouterLink} to="/services?view=public&survey=point-marking" onClick={scrollToTop} fontSize="xs" color="gray.400" _hover={{ color: "orange.300" }}>
                            Point Marking & Demarcation
                        </Link>
                        <Link as={RouterLink} to="/services?view=public&survey=dgps-survey" onClick={scrollToTop} fontSize="xs" color="gray.400" _hover={{ color: "orange.300" }}>
                            DGPS & RTK Geodetic Survey
                        </Link>
                        <Link as={RouterLink} to="/services?view=public&survey=drone-survey" onClick={scrollToTop} fontSize="xs" color="gray.400" _hover={{ color: "orange.300" }}>
                            Drone / UAV Aerial Mapping
                        </Link>
                        <Link as={RouterLink} to="/services?view=public&survey=layout-demarcation" onClick={scrollToTop} fontSize="xs" color="gray.400" _hover={{ color: "orange.300" }}>
                            Plot Layout Setting Out
                        </Link>
                        <Link as={RouterLink} to="/services?view=public&survey=road-alignment" onClick={scrollToTop} fontSize="xs" color="gray.400" _hover={{ color: "orange.300" }}>
                            Road & Pipeline Alignment Survey
                        </Link>
                    </Stack>

                    {/* Column 3: Lab Product Categories */}
                    <Stack spacing={3} align="flex-start">
                        <Text fontWeight="bold" fontSize="sm" color="white" textTransform="uppercase" letterSpacing="wider">
                            Testing Equipment
                        </Text>
                        <Link as={RouterLink} to="/products?category=cement-concrete" onClick={scrollToTop} fontSize="xs" color="gray.400" _hover={{ color: "orange.300" }}>
                            Cement, Concrete & Aggregate
                        </Link>
                        <Link as={RouterLink} to="/products?category=soil-testing" onClick={scrollToTop} fontSize="xs" color="gray.400" _hover={{ color: "orange.300" }}>
                            Soil Testing Equipment
                        </Link>
                        <Link as={RouterLink} to="/products?category=bitumen-testing" onClick={scrollToTop} fontSize="xs" color="gray.400" _hover={{ color: "orange.300" }}>
                            Bitumen Testing Equipment
                        </Link>
                        <Link as={RouterLink} to="/products?category=survey-instruments" onClick={scrollToTop} fontSize="xs" color="gray.400" _hover={{ color: "orange.300" }}>
                            Survey & Measuring Instruments
                        </Link>
                        <Link as={RouterLink} to="/products?category=construction-machinery" onClick={scrollToTop} fontSize="xs" color="gray.400" _hover={{ color: "orange.300" }}>
                            Construction Machinery
                        </Link>
                        <Link as={RouterLink} to="/products?category=safety-products" onClick={scrollToTop} fontSize="xs" color="gray.400" _hover={{ color: "orange.300" }}>
                            Site Safety & PPE Products
                        </Link>
                    </Stack>

                    {/* Column 4: Quick Links & Credential */}
                    <Stack spacing={3} align="flex-start">
                        <Text fontWeight="bold" fontSize="sm" color="white" textTransform="uppercase" letterSpacing="wider">
                            Company & Legal
                        </Text>
                        <Link as={RouterLink} to="/about" onClick={scrollToTop} fontSize="xs" color="gray.400" _hover={{ color: "orange.300" }}>
                            About Unique Engineering
                        </Link>
                        <Link as={RouterLink} to="/contact" onClick={scrollToTop} fontSize="xs" color="gray.400" _hover={{ color: "orange.300" }}>
                            Contact & Office Locations
                        </Link>
                        <Link as={RouterLink} to="/products" onClick={scrollToTop} fontSize="xs" color="gray.400" _hover={{ color: "orange.300" }}>
                            Online Quotation Builder
                        </Link>
                        <Box mt={3} p={3} bg="whiteAlpha.100" borderRadius="xl" border="1px dashed" borderColor="whiteAlpha.200" w="full">
                            <HStack spacing={1.5} color="green.300" fontSize="2xs" fontWeight="bold">
                                <Icon as={FaCheckCircle} />
                                <Text>MSME Registered Enterprise</Text>
                            </HStack>
                            <Text fontSize="2xs" color="gray.400" mt={0.5}>
                                UDYAM-GJ-01-0569418
                            </Text>
                            <Text fontSize="2xs" color="gray.500" mt={1}>
                                Domain: <Text as="span" color="orange.300" fontWeight="bold">uecivil.com</Text>
                            </Text>
                        </Box>
                    </Stack>
                </SimpleGrid>

                <Divider borderColor="whiteAlpha.100" my={6} />

                <Flex direction={{ base: 'column', md: 'row' }} justify="space-between" align="center" gap={4}>
                    <Text fontSize="xs" color="gray.500">
                        © {new Date().getFullYear()} Unique Engineering (uecivil.com). All rights reserved.
                    </Text>
                    <HStack spacing={6} fontSize="xs" color="gray.400">
                        <Link as={RouterLink} to="/services?view=public" onClick={scrollToTop} _hover={{ color: "white" }}>Surveying</Link>
                        <Link as={RouterLink} to="/products" onClick={scrollToTop} _hover={{ color: "white" }}>Equipment</Link>
                        <Link as={RouterLink} to="/contact" onClick={scrollToTop} _hover={{ color: "white" }}>Support</Link>
                    </HStack>
                </Flex>
            </Container>
        </Box>
    );
};

export default Footer;

