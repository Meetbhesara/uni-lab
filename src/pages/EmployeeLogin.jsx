import React, { useState } from 'react';
import {
    Box, Container, Card, CardBody, VStack, Heading, Text, Input, Button,
    FormControl, FormLabel, HStack, Icon, PinInput, PinInputField,
    Alert, AlertIcon, AlertDescription, InputGroup, InputLeftElement,
    Divider
} from '@chakra-ui/react';
import { FaPhone, FaShieldAlt, FaHardHat, FaArrowRight, FaRedo } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api/axios';

const EmployeeLogin = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const sessionExpired = location.state?.reason === 'expired';
    const [step, setStep] = useState('phone'); // 'phone' | 'otp'
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [info, setInfo] = useState('');

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setError(''); setInfo('');
        const cleaned = phone.trim();
        if (!cleaned || cleaned.length < 10) {
            setError('Please enter a valid 10-digit phone number.');
            return;
        }
        setIsLoading(true);
        try {
            const res = await api.post('/employee-auth/send-otp', { phone: cleaned });
            if (res.data.success) {
                setInfo(res.data.msg);
                setStep('otp');
            }
        } catch (err) {
            const msg = err.response?.data?.msg || 'Something went wrong.';
            const status = err.response?.status;
            if (status === 401) {
                setError('🚫 Unauthorized. You are not registered as an employee.');
            } else {
                setError(msg);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        setError(''); setInfo('');
        if (otp.length < 6) { setError('Please enter the 6-digit OTP.'); return; }
        setIsLoading(true);
        try {
            const res = await api.post('/employee-auth/verify-otp', { phone: phone.trim(), otp });
            if (res.data.success) {
                localStorage.setItem('employeeToken', res.data.token);
                localStorage.setItem('employeeData', JSON.stringify(res.data.employee));
                navigate('/employee/profile');
            }
        } catch (err) {
            setError(err.response?.data?.msg || 'Invalid OTP. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Box
            minH="100vh"
            bgGradient="linear(135deg, gray.900 0%, blue.900 50%, gray.900 100%)"
            display="flex"
            alignItems="center"
            justifyContent="center"
            p={4}
            position="relative"
            overflow="hidden"
        >
            {/* Background decorations */}
            <Box position="absolute" top="-100px" right="-100px" w="400px" h="400px"
                borderRadius="full" bg="blue.800" opacity={0.15} />
            <Box position="absolute" bottom="-80px" left="-80px" w="300px" h="300px"
                borderRadius="full" bg="orange.700" opacity={0.1} />

            <Container maxW="420px" position="relative" zIndex={1}>
                <VStack spacing={6}>
                    {/* Logo / Header */}
                    <VStack spacing={2}>
                        <Box
                            w={16} h={16} borderRadius="2xl"
                            bgGradient="linear(to-br, orange.400, orange.600)"
                            display="flex" alignItems="center" justifyContent="center"
                            boxShadow="0 8px 32px rgba(251,146,60,0.4)"
                        >
                            <Icon as={FaHardHat} w={8} h={8} color="white" />
                        </Box>
                        <Heading size="xl" color="white" fontWeight="800" letterSpacing="-0.5px">
                            Employee Portal
                        </Heading>
                        <Text color="whiteAlpha.600" fontSize="sm">
                            Unique Engineering — Staff Access
                        </Text>
                    </VStack>

                    {/* Card */}
                    <Card w="full" borderRadius="2xl" bg="whiteAlpha.100" backdropFilter="blur(20px)"
                        border="1px solid" borderColor="whiteAlpha.200" boxShadow="0 20px 60px rgba(0,0,0,0.5)">
                        <CardBody p={8}>
                            {step === 'phone' ? (
                                <form onSubmit={handleSendOtp}>
                                    <VStack spacing={6} align="stretch">
                                        <VStack align="start" spacing={1}>
                                            <Heading size="md" color="white">Sign In</Heading>
                                            <Text fontSize="sm" color="whiteAlpha.600">Enter your registered phone number</Text>
                                        </VStack>

                                        {sessionExpired && (
                                            <Alert status="warning" borderRadius="xl" bg="orange.900" border="1px solid" borderColor="orange.700">
                                                <AlertIcon color="orange.300" />
                                                <AlertDescription color="orange.200" fontSize="sm">
                                                    Your session expired. Please login again.
                                                </AlertDescription>
                                            </Alert>
                                        )}

                                        {error && (
                                            <Alert status="error" borderRadius="xl" bg="red.900" border="1px solid" borderColor="red.700">
                                                <AlertIcon color="red.300" />
                                                <AlertDescription color="red.200" fontSize="sm">{error}</AlertDescription>
                                            </Alert>
                                        )}

                                        <FormControl>
                                            <FormLabel color="whiteAlpha.700" fontSize="sm" fontWeight="bold">Phone Number</FormLabel>
                                            <InputGroup>
                                                <InputLeftElement pointerEvents="none" h="50px">
                                                    <Icon as={FaPhone} color="whiteAlpha.400" />
                                                </InputLeftElement>
                                                <Input
                                                    type="tel"
                                                    placeholder="Enter your 10-digit number"
                                                    value={phone}
                                                    onChange={e => setPhone(e.target.value)}
                                                    maxLength={10}
                                                    h="50px"
                                                    bg="whiteAlpha.100"
                                                    border="1px solid"
                                                    borderColor="whiteAlpha.200"
                                                    color="white"
                                                    _placeholder={{ color: 'whiteAlpha.300' }}
                                                    _focus={{ borderColor: 'orange.400', boxShadow: '0 0 0 1px #F97316' }}
                                                    borderRadius="xl"
                                                    fontSize="lg"
                                                    letterSpacing="2px"
                                                />
                                            </InputGroup>
                                        </FormControl>

                                        <Button
                                            type="submit"
                                            h="50px"
                                            borderRadius="xl"
                                            bgGradient="linear(to-r, orange.500, orange.400)"
                                            color="white"
                                            fontWeight="bold"
                                            fontSize="md"
                                            rightIcon={<FaArrowRight />}
                                            isLoading={isLoading}
                                            loadingText="Checking..."
                                            _hover={{ bgGradient: 'linear(to-r, orange.600, orange.500)', transform: 'translateY(-1px)', boxShadow: '0 8px 24px rgba(251,146,60,0.4)' }}
                                            transition="all 0.2s"
                                        >
                                            Send OTP via WhatsApp
                                        </Button>
                                    </VStack>
                                </form>
                            ) : (
                                <VStack spacing={6} align="stretch">
                                    <VStack align="start" spacing={1}>
                                        <HStack>
                                            <Icon as={FaShieldAlt} color="green.400" />
                                            <Heading size="md" color="white">Verify OTP</Heading>
                                        </HStack>
                                        <Text fontSize="sm" color="whiteAlpha.600">{info}</Text>
                                    </VStack>

                                    {error && (
                                        <Alert status="error" borderRadius="xl" bg="red.900" border="1px solid" borderColor="red.700">
                                            <AlertIcon color="red.300" />
                                            <AlertDescription color="red.200" fontSize="sm">{error}</AlertDescription>
                                        </Alert>
                                    )}

                                    <FormControl>
                                        <FormLabel color="whiteAlpha.700" fontSize="sm" fontWeight="bold" mb={3}>Enter 6-Digit OTP</FormLabel>
                                        <HStack justify="center" spacing={2}>
                                            <PinInput
                                                otp
                                                size="lg"
                                                value={otp}
                                                onChange={val => setOtp(val)}
                                                onComplete={handleVerifyOtp}
                                            >
                                                {[1,2,3,4,5,6].map(i => (
                                                    <PinInputField
                                                        key={i}
                                                        bg="whiteAlpha.100"
                                                        border="1px solid"
                                                        borderColor="whiteAlpha.300"
                                                        color="white"
                                                        _focus={{ borderColor: 'orange.400', boxShadow: '0 0 0 1px #F97316' }}
                                                        borderRadius="xl"
                                                        fontWeight="bold"
                                                        fontSize="xl"
                                                        h="56px"
                                                        w="48px"
                                                    />
                                                ))}
                                            </PinInput>
                                        </HStack>
                                    </FormControl>

                                    <Button
                                        h="50px"
                                        borderRadius="xl"
                                        bgGradient="linear(to-r, green.500, green.400)"
                                        color="white"
                                        fontWeight="bold"
                                        isLoading={isLoading}
                                        loadingText="Verifying..."
                                        onClick={handleVerifyOtp}
                                        _hover={{ bgGradient: 'linear(to-r, green.600, green.500)', transform: 'translateY(-1px)', boxShadow: '0 8px 24px rgba(72,187,120,0.4)' }}
                                        transition="all 0.2s"
                                    >
                                        Verify & Login
                                    </Button>

                                    <Divider borderColor="whiteAlpha.200" />

                                    <HStack justify="center" spacing={2}>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            color="whiteAlpha.500"
                                            leftIcon={<FaRedo />}
                                            onClick={() => { setStep('phone'); setOtp(''); setError(''); setInfo(''); }}
                                            _hover={{ color: 'white' }}
                                        >
                                            Change number / Resend
                                        </Button>
                                    </HStack>
                                </VStack>
                            )}
                        </CardBody>
                    </Card>

                    <Text color="whiteAlpha.300" fontSize="xs">
                        Only registered employees can access this portal.
                    </Text>
                </VStack>
            </Container>
        </Box>
    );
};

export default EmployeeLogin;
