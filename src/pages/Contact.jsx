import React from 'react';
import { Box, Container, Heading, Text, SimpleGrid, FormControl, FormLabel, Input, Textarea, Button, VStack, Flex, Stack } from '@chakra-ui/react';
import { FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';

const Contact = () => {
    return (
        <Box>
            <Box bg="brand.900" color="white" py={{ base: 16, md: 24 }}>
                <Container maxW="6xl">
                    <Heading size={{ base: "xl", md: "2xl" }} mb={4}>Get in Touch</Heading>
                    <Text fontSize="lg" color="gray.300" maxW="2xl">
                        Have questions? Our team is here to help with your engineering needs.
                    </Text>
                </Container>
            </Box>

            <Container maxW="6xl" py={{ base: 12, md: 20 }}>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={{ base: 10, md: 20 }}>
                    <VStack align="start" spacing={10}>
                        <Stack spacing={6}>
                            <Heading color="brand.700" size="lg">Contact Information</Heading>
                            <Text color="gray.600">
                                Reach out to us via any of the channels below. We typically respond within 24 hours.
                            </Text>
                        </Stack>

                        <Stack spacing={6} w="full">
                            <Flex align="center" gap={4}>
                                <Box p={3} bg="brand.50" color="brand.600" borderRadius="lg">
                                    <FaPhone size={20} />
                                </Box>
                                <Box>
                                    <Text fontWeight="bold">Call Us</Text>
                                    <Text color="gray.600">+91 98765 43210</Text>
                                </Box>
                            </Flex>

                            <Flex align="center" gap={4}>
                                <Box p={3} bg="brand.50" color="brand.600" borderRadius="lg">
                                    <FaEnvelope size={20} />
                                </Box>
                                <Box>
                                    <Text fontWeight="bold">Email Us</Text>
                                    <Text color="gray.600">contact@uniqueengineering.com</Text>
                                </Box>
                            </Flex>

                            <Flex align="center" gap={4}>
                                <Box p={3} bg="brand.50" color="brand.600" borderRadius="lg">
                                    <FaMapMarkerAlt size={20} />
                                </Box>
                                <Box>
                                    <Text fontWeight="bold">Visit Us</Text>
                                    <Text color="gray.600">123 Engineering Park, Sector 5, Industrial Area, Gujarat</Text>
                                </Box>
                            </Flex>
                        </Stack>
                    </VStack>

                    <Box bg="white" p={{ base: 6, md: 10 }} borderRadius="3xl" boxShadow="2xl" border="1px" borderColor="gray.100">
                        <VStack spacing={6}>
                            <Heading size="md" w="full">Send a Message</Heading>
                            <FormControl>
                                <FormLabel fontSize="sm" fontWeight="bold">FULL NAME</FormLabel>
                                <Input variant="filled" placeholder="Your Name" size="lg" borderRadius="xl" />
                            </FormControl>
                            <FormControl>
                                <FormLabel fontSize="sm" fontWeight="bold">EMAIL ADDRESS</FormLabel>
                                <Input variant="filled" type="email" placeholder="email@example.com" size="lg" borderRadius="xl" />
                            </FormControl>
                            <FormControl>
                                <FormLabel fontSize="sm" fontWeight="bold">MESSAGE</FormLabel>
                                <Textarea variant="filled" placeholder="How can we help?" rows={5} borderRadius="xl" />
                            </FormControl>
                            <Button colorScheme="brand" size="lg" w="full" borderRadius="xl">
                                Send Message
                            </Button>
                        </VStack>
                    </Box>
                </SimpleGrid>
            </Container>
        </Box>
    );
};

export default Contact;
