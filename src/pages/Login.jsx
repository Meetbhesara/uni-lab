import React, { useState } from 'react';
import { Box, Button, FormControl, FormLabel, Input, Heading, Text, useToast, Container, VStack } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const toast = useToast();
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleLogin = async (e) => {
        e.preventDefault();



        const result = await login(email, password);
        if (result.success) {
            const storedUser = JSON.parse(localStorage.getItem('user'));

            if (storedUser && storedUser.isAdmin) {
                toast({
                    title: 'Login Successful',
                    description: "Welcome to Admin Panel!",
                    status: 'success',
                    duration: 3000,
                    isClosable: true,
                });
                navigate('/admin/dashboard');
            } else {
                // For normal users, maybe redirect to home? 
                // The user said "remove admin login", maybe this page is ONLY for admin?
                // But I'll leave the else block to error out or redirect home. 
                // Assuming this page is /admin/login or similar usage.
                navigate('/');
            }
        } else {
            toast({
                title: 'Error',
                description: result.message || "Invalid credentials.",
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        }
    };

    return (
        <Container maxW={{ base: 'full', sm: 'container.sm' }} py={{ base: 6, md: 10 }} px={{ base: 4, md: 6 }}>
            <Box bg="white" p={{ base: 6, md: 8 }} borderRadius="lg" boxShadow="lg">
                <VStack spacing={4} align="stretch">
                    <Heading textAlign="center" size="lg">Admin Login</Heading>
                    <Text textAlign="center" color="gray.500">Sign in to manage enquiries and products</Text>

                    <form onSubmit={handleLogin}>
                        <VStack spacing={4}>
                            <FormControl id="email">
                                <FormLabel>Email address</FormLabel>
                                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" />
                            </FormControl>
                            <FormControl id="password">
                                <FormLabel>Password</FormLabel>
                                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter password" />
                            </FormControl>
                            <Button type="submit" colorScheme="brand" width="full" mt={4}>
                                Sign In
                            </Button>
                        </VStack>
                    </form>
                </VStack>
            </Box>
        </Container>
    );
};

export default Login;
