import React from 'react';
import { Box, Container, Heading, Text, VStack } from '@chakra-ui/react';

const About = () => {
    return (
        <Box>
            <Box bg="brand.900" color="white" py={{ base: 16, md: 24 }}>
                <Container maxW="6xl">
                    <Heading size={{ base: "xl", md: "2xl" }} mb={4}>Our Story</Heading>
                    <Text fontSize="lg" color="gray.300" maxW="2xl">
                        A decade of excellence in engineering solutions and equipment supply.
                    </Text>
                </Container>
            </Box>

            <Container maxW="6xl" py={{ base: 12, md: 20 }}>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={{ base: 10, md: 20 }} align="center">
                    <VStack spacing={6} align="start">
                        <Heading color="brand.700" size="lg">About Unique Engineering</Heading>
                        <Text fontSize="md" color="gray.600" lineHeight="tall">
                            Founded in 2010, Unique Engineering has been at the forefront of the civil and instrumental engineering sectors.
                            We pride ourselves on delivering state-of-the-art solutions and high-quality equipment to our clients across the nation.
                        </Text>
                        <Text fontSize="md" color="gray.600" lineHeight="tall">
                            Our mission is to bridge the gap between complex engineering challenges and practical, efficient solutions.
                            With a team of dedicated professionals, we ensure that every project we touch achieves its maximum potential.
                        </Text>
                    </VStack>
                    <Box
                        w="full"
                        h={{ base: "300px", md: "400px" }}
                        bg="gray.100"
                        borderRadius="2xl"
                        overflow="hidden"
                        position="relative"
                    >
                        <Image
                            src="https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&q=80&w=800"
                            alt="Engineering Excellence"
                            objectFit="cover"
                            w="full"
                            h="full"
                        />
                    </Box>
                </SimpleGrid>
            </Container>
        </Box>
    );
};

export default About;
