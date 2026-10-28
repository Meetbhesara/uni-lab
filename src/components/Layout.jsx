import React from 'react';
import { Box, Flex } from '@chakra-ui/react';
import Header from './Header';
import Footer from './Footer';

const Layout = ({ children }) => {
    return (
        <Flex direction="column" minH="100vh" w="100%" maxW="100vw" overflowX="hidden">
            <Header />
            <Box flex="1" w="100%" maxW="100vw" overflowX="hidden">
                {children}
            </Box>
            <Footer />
        </Flex>
    )
}

export default Layout;
