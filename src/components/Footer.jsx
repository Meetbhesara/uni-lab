import React from 'react';
import { Box, Container, Stack, Text, Link, SimpleGrid, IconButton } from '@chakra-ui/react';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';

const Footer = () => {
    return (
        <Box bg="brand.800" color="gray.200">
            <Container as={Stack} maxW={'6xl'} py={10}>
                <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing={8}>
                    <Stack align={'flex-start'}>
                        <Text fontWeight={'bold'} fontSize={'lg'} mb={2}>Unique Engineering</Text>
                        <Text fontSize={'sm'}>Providing top-notch civil and instrumental engineering solutions since 2010.</Text>
                    </Stack>
                    <Stack align={'flex-start'}>
                        <Text fontWeight={'bold'} fontSize={'lg'} mb={2}>Company</Text>
                        <Link href={'/about'}>About Us</Link>
                        <Link href={'/contact'}>Contact Us</Link>
                        <Link href={'/products'}>Products</Link>
                    </Stack>
                    <Stack align={'flex-start'}>
                        <Text fontWeight={'bold'} fontSize={'lg'} mb={2}>Support</Text>
                        <Link href={'#'}>Help Center</Link>
                        <Link href={'#'}>Terms of Service</Link>
                        <Link href={'#'}>Privacy Policy</Link>
                    </Stack>
                    <Stack align={'flex-start'}>
                        <Text fontWeight={'bold'} fontSize={'lg'} mb={2}>Follow Us</Text>
                        <Stack direction={'row'} spacing={6}>
                            <IconButton aria-label="Facebook" icon={<FaFacebook />} variant="ghost" colorScheme="whiteAlpha" />
                            <IconButton aria-label="Twitter" icon={<FaTwitter />} variant="ghost" colorScheme="whiteAlpha" />
                            <IconButton aria-label="Instagram" icon={<FaInstagram />} variant="ghost" colorScheme="whiteAlpha" />
                        </Stack>
                    </Stack>
                </SimpleGrid>
                <Box pt={10} borderTopWidth={1} borderColor="brand.700" textAlign="center">
                    <Text fontSize={'sm'}>
                        © 2025 Unique Engineering. All rights reserved.
                    </Text>
                </Box>
            </Container>
        </Box>
    )
}

export default Footer;
