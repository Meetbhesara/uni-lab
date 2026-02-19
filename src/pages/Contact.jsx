import React from 'react';
import { Box, Container, Heading, Text, SimpleGrid, FormControl, FormLabel, Input, Textarea, Button, VStack, Flex, Stack } from '@chakra-ui/react';
import { FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';

const Contact = () => {
    return (
        <Container maxW="6xl" py={{ base: 10, md: 20 }}>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={{ base: 10, md: 16 }}>
                <VStack align="start" spacing={8}>
                    <Heading color="brand.700">Get in Touch</Heading>
                    <Text color="gray.600">
                        Have a question or need a custom quote? Fill out the form or reach us directly.
                    </Text>

                    <Stack spacing={6} w="full">
                        <Flex align="center" gap={4}>
                            <Box p={3} bg="brand.50" color="brand.500" borderRadius="full">
                                <FaPhone size={20} />
                            </Box>
                            <Box>
                                <Text fontWeight="bold" color="brand.800">Phone</Text>
                                <Text color="gray.600">+91 98765 43210</Text>
                            </Box>
                        </Flex>
                        <Flex align="center" gap={4}>
                            <Box p={3} bg="brand.50" color="brand.500" borderRadius="full">
                                <FaEnvelope size={20} />
                            </Box>
                            <Box>
                                <Text fontWeight="bold" color="brand.800">Email</Text>
                                <Text color="gray.600">contact@uniqueengineering.com</Text>
                            </Box>
                        </Flex>
                        <Flex align="center" gap={4}>
                            <Box p={3} bg="brand.50" color="brand.500" borderRadius="full">
                                <FaMapMarkerAlt size={20} />
                            </Box>
                            <Box>
                                <Text fontWeight="bold" color="brand.800">Address</Text>
                                <Text color="gray.600">123 Industrial Area, Engineering City, State, 400001</Text>
                            </Box>
                        </Flex>
                    </Stack>
                </VStack>

                <Box bg="white" p={8} borderRadius="xl" boxShadow="lg" borderWidth="1px" borderColor="gray.100">
                    <VStack spacing={4}>
                        <FormControl>
                            <FormLabel>Name</FormLabel>
                            <Input placeholder="Your Name" />
                        </FormControl>
                        <FormControl>
                            <FormLabel>Email</FormLabel>
                            <Input placeholder="Your Email" />
                        </FormControl>
                        <FormControl>
                            <FormLabel>Message</FormLabel>
                            <Textarea placeholder="How can we help you?" rows={4} />
                        </FormControl>
                        <Button colorScheme="orange" w="full" size="lg">Send Message</Button>
                    </VStack>
                </Box>
            </SimpleGrid>
        </Container>
    );
};

export default Contact;
