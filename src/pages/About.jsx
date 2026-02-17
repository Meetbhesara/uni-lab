import React from 'react';
import { Box, Container, Heading, Text, VStack } from '@chakra-ui/react';

const About = () => {
    return (
        <Container maxW="4xl" py={20}>
            <VStack spacing={8} align="start">
                <Heading color="brand.700">About Unique Engineering</Heading>
                <Text fontSize="lg" color="gray.700">
                    Founded in 2010, Unique Engineering has been at the forefront of the civil and instrumental engineering sectors.
                    We pride ourselves on delivering state-of-the-art solutions and high-quality equipment to our clients across the nation.
                </Text>
                <Text fontSize="lg" color="gray.700">
                    Our mission is to bridge the gap between complex engineering challenges and practical, efficient solutions.
                    With a team of dedicated professionals, we ensure that every project we touch achieves its maximum potential.
                </Text>
                <Box w="full" h="300px" bg="gray.200" borderRadius="xl">
                    {/* Placeholder for About Image */}
                    <Box w="full" h="full" display="flex" alignItems="center" justifyContent="center" color="gray.500">
                        Company Image
                    </Box>
                </Box>
            </VStack>
        </Container>
    );
};

export default About;
