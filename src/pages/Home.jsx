import React from 'react';
import { Box, Heading, Text, Button, Container, SimpleGrid, Card, CardBody, Image, Stack, Flex } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { Link as RouterLink } from 'react-router-dom';
import { FaTools, FaCogs } from 'react-icons/fa';

const MotionBox = motion.create(Box);

const Home = () => {
    return (
        <Box>
            {/* Hero Section */}
            <Box
                bg="brand.900"
                color="white"
                py={{ base: 20, md: 32 }}
                position="relative"
                overflow="hidden"
            >
                <Box
                    position="absolute" top="0" left="0" right="0" bottom="0"
                    bgGradient="linear(to-br, brand.800, brand.900)"
                    opacity="0.9"
                    zIndex="0"
                />
                <Container maxW="6xl" position="relative" zIndex="1">
                    <MotionBox
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        textAlign="center"
                    >
                        <Heading as="h1" size={{ base: 'xl', md: '3xl' }} mb={4} fontWeight="extrabold" letterSpacing="tight">
                            Engineering <Text as="span" color="brand.300">Excellence</Text>
                        </Heading>
                        <Text fontSize="xl" color="gray.300" mb={8} maxW="2xl" mx="auto">
                            Premier solutions for Civil and Instrumental Engineering. We build the future with precision and quality.
                        </Text>
                        <Stack direction={{ base: 'column', md: 'row' }} spacing={4} justify="center">
                            <Button size="lg" colorScheme="orange" as={RouterLink} to="/products">
                                Explore Products
                            </Button>
                            <Button size="lg" variant="outline" borderColor="white" color="white" _hover={{ bg: 'whiteAlpha.200' }} as={RouterLink} to="/contact">
                                Contact Us
                            </Button>
                        </Stack>
                    </MotionBox>
                </Container>
            </Box>

            {/* Cards Section */}
            <Container maxW="6xl" py={20}>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10}>
                    {/* Services Card */}
                    <MotionBox
                        whileHover={{ y: -5 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Card height="100%" bg="white" borderColor="gray.100" borderWidth="1px">
                            <CardBody p={8}>
                                <Flex w={16} h={16} align="center" justify="center" bg="brand.50" rounded="full" mb={6} color="brand.500">
                                    <FaCogs size={28} />
                                </Flex>
                                <Heading size="md" mb={4}>Our Services</Heading>
                                <Text color="gray.600" mb={6}>
                                    Comprehensive engineering services tailored to your project needs. From consultation to execution, we ensure the highest standards.
                                </Text>
                                <Button variant="link" colorScheme="blue" as={RouterLink} to="/services">
                                    Learn More -&gt;
                                </Button>
                            </CardBody>
                        </Card>
                    </MotionBox>

                    {/* Products Card */}
                    <MotionBox
                        whileHover={{ y: -5 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Card height="100%" bg="brand.500" color="white">
                            <CardBody p={8}>
                                <Flex w={16} h={16} align="center" justify="center" bg="whiteAlpha.200" rounded="full" mb={6} color="white">
                                    <FaTools size={28} />
                                </Flex>
                                <Heading size="md" mb={4}>Our Products</Heading>
                                <Text color="blue.100" mb={6}>
                                    High-quality civil and instrumental equipment. Browse our catalog to find the exact tools for your success.
                                </Text>
                                <Button bg="white" color="brand.600" _hover={{ bg: 'gray.100' }} as={RouterLink} to="/products">
                                    View All Products
                                </Button>
                            </CardBody>
                        </Card>
                    </MotionBox>
                </SimpleGrid>
            </Container>
        </Box>
    );
};

export default Home;
