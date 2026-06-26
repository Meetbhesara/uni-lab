import React, { useState } from 'react';
import {
    Box, Container, Heading, Text, VStack, HStack, Flex, Icon,
    Button, Badge, SimpleGrid, Divider, Stack
} from '@chakra-ui/react';
import {
    FiPhone, FiMail, FiMapPin, FiClock, FiExternalLink,
    FiUser, FiNavigation
} from 'react-icons/fi';
import { motion } from 'framer-motion';

const MotionBox = motion.create(Box);

// ── Contact Info ─────────────────────────────────────────────────────────────
const CONTACT = {
    name: 'Atul Kanak',
    title: 'Founder & Principal Consultant',
    phone: '9099160391',
    phoneDisplay: '+91 90991 60391',
    email: 'atulkanak@uniquelabservices.com',
    whatsapp: '919099160391',
};

const LOCATIONS = [
    {
        id: 'office',
        label: 'HEAD OFFICE',
        name: 'Unique Lab & Services — Office',
        address: '123, Shyamal Cross Road, Satellite,\nAhmedabad, Gujarat – 380015',
        hours: 'Mon – Sat: 9:00 AM – 6:00 PM',
        color: 'brand',
        accentColor: '#0066cc',
        bgGradient: 'linear(to-br, brand.700, brand.900)',
        icon: FiNavigation,
        mapSrc: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3671.9!2d72.515!3d23.020!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjPCsDAxJzEyLjAiTiA3MsKwMzEnMDYuMCJF!5e0!3m2!1sen!2sin!4v1234567890',
        mapsLink: 'https://maps.google.com/?q=Shyamal+Cross+Road+Satellite+Ahmedabad',
        badge: 'Main Office',
    },
    {
        id: 'godown',
        label: 'INSTRUMENT GODOWN',
        name: 'Unique Lab — Lab Instrument Store',
        address: 'Survey No. 123, Nr. Industrial Area,\nAhmedabad, Gujarat',
        hours: 'Mon – Sat: 9:00 AM – 5:00 PM',
        color: 'orange',
        accentColor: '#FF8C00',
        bgGradient: 'linear(to-br, orange.500, orange.700)',
        icon: FiMapPin,
        mapSrc: 'https://maps.google.com/maps?ftid=0x395e9be3283a9f6b:0x73377009f64272e8&output=embed',
        mapsLink: 'https://maps.google.com/maps?ftid=0x395e9be3283a9f6b:0x73377009f64272e8',
        badge: 'Godown / Store',
    },
];

// ── Sub-components ────────────────────────────────────────────────────────────
const InfoRow = ({ icon, label, value, href }) => (
    <HStack spacing={4} align="flex-start">
        <Box
            p={2.5}
            bg="brand.50"
            color="brand.600"
            borderRadius="lg"
            flexShrink={0}
            mt="1px"
        >
            <Icon as={icon} w={4} h={4} />
        </Box>
        <Box>
            <Text fontSize="10px" fontWeight="bold" color="gray.400" textTransform="uppercase" letterSpacing="wider" mb={0.5}>
                {label}
            </Text>
            {href ? (
                <Text
                    as="a"
                    href={href}
                    fontSize="sm"
                    fontWeight="semibold"
                    color="brand.700"
                    _hover={{ color: 'brand.500', textDecoration: 'underline' }}
                    transition="color 0.2s"
                >
                    {value}
                </Text>
            ) : (
                <Text fontSize="sm" fontWeight="semibold" color="gray.700" whiteSpace="pre-line">
                    {value}
                </Text>
            )}
        </Box>
    </HStack>
);

const LocationCard = ({ loc, index }) => {
    const [mapLoaded, setMapLoaded] = useState(false);

    return (
        <MotionBox
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.15 }}
            bg="white"
            borderRadius="3xl"
            overflow="hidden"
            boxShadow="2xl"
            border="1px solid"
            borderColor="gray.100"
            _hover={{ boxShadow: '0 25px 50px rgba(0,0,0,0.12)', transform: 'translateY(-4px)' }}
            style={{ transition: 'all 0.3s ease' }}
        >
            {/* Card Header */}
            <Box bgGradient={loc.bgGradient} px={6} py={5}>
                <HStack justify="space-between" align="center">
                    <HStack spacing={3}>
                        <Box
                            p={2.5}
                            bg="whiteAlpha.200"
                            borderRadius="xl"
                            color="white"
                        >
                            <Icon as={loc.icon} w={5} h={5} />
                        </Box>
                        <Box>
                            <Text fontSize="9px" color="whiteAlpha.700" fontWeight="bold" letterSpacing="widest" textTransform="uppercase">
                                {loc.label}
                            </Text>
                            <Text color="white" fontWeight="bold" fontSize="md" lineHeight="short">
                                {loc.name}
                            </Text>
                        </Box>
                    </HStack>
                    <Badge
                        bg="whiteAlpha.200"
                        color="white"
                        borderRadius="full"
                        px={3}
                        py={1}
                        fontSize="9px"
                        fontWeight="bold"
                        border="1px solid"
                        borderColor="whiteAlpha.300"
                    >
                        {loc.badge}
                    </Badge>
                </HStack>
            </Box>

            {/* Google Map Embed */}
            <Box position="relative" h="260px" bg="gray.100">
                {!mapLoaded && (
                    <Flex
                        position="absolute"
                        inset={0}
                        align="center"
                        justify="center"
                        bg="gray.50"
                        zIndex={1}
                        direction="column"
                        gap={2}
                    >
                        <Icon as={FiMapPin} w={8} h={8} color="gray.300" />
                        <Text fontSize="xs" color="gray.400">Loading map...</Text>
                    </Flex>
                )}
                <Box
                    as="iframe"
                    src={loc.mapSrc}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title={`${loc.name} location map`}
                    onLoad={() => setMapLoaded(true)}
                    opacity={mapLoaded ? 1 : 0}
                    transition="opacity 0.4s"
                />
            </Box>

            {/* Info + Actions */}
            <Box p={6}>
                <VStack spacing={4} align="stretch">
                    <InfoRow
                        icon={FiMapPin}
                        label="Address"
                        value={loc.address}
                    />
                    <InfoRow
                        icon={FiClock}
                        label="Working Hours"
                        value={loc.hours}
                    />

                    <Divider borderColor="gray.100" />

                    <Button
                        as="a"
                        href={loc.mapsLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        size="md"
                        borderRadius="xl"
                        bg={loc.accentColor}
                        color="white"
                        _hover={{ opacity: 0.88, transform: 'translateY(-1px)', boxShadow: 'md' }}
                        leftIcon={<Icon as={FiExternalLink} />}
                        transition="all 0.2s"
                        w="full"
                    >
                        Open in Google Maps
                    </Button>
                </VStack>
            </Box>
        </MotionBox>
    );
};

// ── Main Page ────────────────────────────────────────────────────────────────
const Contact = () => {
    return (
        <Box bg="gray.50" minH="100vh">

            {/* ── Hero Banner ── */}
            <Box
                bgGradient="linear(to-r, brand.800, brand.900)"
                color="white"
                py={{ base: 20, md: 28 }}
                position="relative"
                overflow="hidden"
            >
                {/* Decorative blobs */}
                <Box position="absolute" top="-20%" right="-5%" w="400px" h="400px"
                    bg="brand.500" opacity="0.08" borderRadius="full" filter="blur(80px)" />
                <Box position="absolute" bottom="-30%" left="-5%" w="300px" h="300px"
                    bg="accent.500" opacity="0.07" borderRadius="full" filter="blur(60px)" />

                <Container maxW="6xl" position="relative" zIndex={1}>
                    <MotionBox initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                        <Badge colorScheme="orange" mb={4} px={3} py={1} borderRadius="full" fontSize="sm">
                            Contact Us
                        </Badge>
                        <Heading
                            size={{ base: '2xl', md: '3xl' }}
                            mb={4}
                            fontWeight="black"
                            letterSpacing="tight"
                        >
                            Get in Touch
                        </Heading>
                        <Text fontSize={{ base: 'md', md: 'xl' }} color="gray.300" maxW="2xl" lineHeight="tall">
                            Reach out directly to our team for inquiries about lab testing, land surveying, instrument sales, or any engineering consultation.
                        </Text>
                    </MotionBox>
                </Container>
            </Box>

            {/* ── Primary Contact Card (Atul Kanak) ── */}
            <Container maxW="6xl" py={{ base: 12, md: 16 }}>
                <MotionBox
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    bg="white"
                    borderRadius="3xl"
                    boxShadow="2xl"
                    border="1px solid"
                    borderColor="gray.100"
                    overflow="hidden"
                    mb={{ base: 10, md: 14 }}
                >
                    <Stack
                        direction={{ base: 'column', md: 'row' }}
                        spacing={0}
                    >
                        {/* Left: Identity */}
                        <Box
                            bgGradient="linear(to-br, brand.700, brand.900)"
                            px={{ base: 8, md: 12 }}
                            py={{ base: 10, md: 12 }}
                            minW={{ md: '320px' }}
                            display="flex"
                            flexDirection="column"
                            alignItems={{ base: 'center', md: 'flex-start' }}
                            textAlign={{ base: 'center', md: 'left' }}
                        >
                            {/* Avatar */}
                            <Box
                                w={20} h={20}
                                borderRadius="full"
                                bg="whiteAlpha.200"
                                border="3px solid"
                                borderColor="whiteAlpha.400"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                mb={4}
                            >
                                <Icon as={FiUser} w={9} h={9} color="white" />
                            </Box>

                            <Badge
                                bg="whiteAlpha.200"
                                color="white"
                                borderRadius="full"
                                px={3} py={1}
                                fontSize="9px"
                                fontWeight="bold"
                                letterSpacing="wider"
                                mb={3}
                                border="1px solid"
                                borderColor="whiteAlpha.300"
                            >
                                FOUNDER & DIRECTOR
                            </Badge>

                            <Heading size="xl" color="white" fontWeight="black" mb={1}>
                                {CONTACT.name}
                            </Heading>
                            <Text color="orange.300" fontWeight="bold" fontSize="sm" letterSpacing="wide">
                                {CONTACT.title}
                            </Text>

                            <Divider borderColor="whiteAlpha.200" my={6} />

                            <Text fontSize="sm" color="whiteAlpha.700" lineHeight="tall" fontStyle="italic">
                                "Accuracy is the foundation of every engineering decision. We deliver precision you can trust."
                            </Text>
                        </Box>

                        {/* Right: Contact Details */}
                        <Box flex={1} px={{ base: 8, md: 12 }} py={{ base: 10, md: 12 }}>
                            <Text
                                fontSize="xs"
                                fontWeight="bold"
                                color="gray.400"
                                textTransform="uppercase"
                                letterSpacing="widest"
                                mb={7}
                            >
                                Direct Contact Details
                            </Text>

                            <VStack spacing={6} align="stretch" mb={8}>
                                <InfoRow
                                    icon={FiPhone}
                                    label="Phone / WhatsApp"
                                    value={CONTACT.phoneDisplay}
                                    href={`tel:${CONTACT.phone}`}
                                />
                                <InfoRow
                                    icon={FiMail}
                                    label="Email Address"
                                    value={CONTACT.email}
                                    href={`mailto:${CONTACT.email}`}
                                />
                                <InfoRow
                                    icon={FiClock}
                                    label="Availability"
                                    value="Monday – Saturday, 9:00 AM – 6:00 PM"
                                />
                            </VStack>

                            <Divider borderColor="gray.100" mb={7} />

                            {/* CTA Buttons */}
                            <Flex gap={3} wrap="wrap">
                                <Button
                                    as="a"
                                    href={`tel:${CONTACT.phone}`}
                                    size="md"
                                    borderRadius="xl"
                                    bg="brand.500"
                                    color="white"
                                    _hover={{ bg: 'brand.600', transform: 'translateY(-1px)', boxShadow: 'md' }}
                                    leftIcon={<Icon as={FiPhone} />}
                                    transition="all 0.2s"
                                    px={6}
                                >
                                    Call Now
                                </Button>
                                <Button
                                    as="a"
                                    href={`https://wa.me/${CONTACT.whatsapp}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    size="md"
                                    borderRadius="xl"
                                    bg="#25D366"
                                    color="white"
                                    _hover={{ bg: '#1ebe5d', transform: 'translateY(-1px)', boxShadow: 'md' }}
                                    transition="all 0.2s"
                                    px={6}
                                >
                                    WhatsApp
                                </Button>
                                <Button
                                    as="a"
                                    href={`mailto:${CONTACT.email}`}
                                    size="md"
                                    borderRadius="xl"
                                    variant="outline"
                                    borderColor="brand.500"
                                    color="brand.600"
                                    _hover={{ bg: 'brand.50', transform: 'translateY(-1px)' }}
                                    leftIcon={<Icon as={FiMail} />}
                                    transition="all 0.2s"
                                    px={6}
                                >
                                    Send Email
                                </Button>
                            </Flex>
                        </Box>
                    </Stack>
                </MotionBox>

                {/* ── Section Title: Locations ── */}
                <VStack spacing={3} mb={10} textAlign="center">
                    <Badge colorScheme="brand" px={3} py={1} borderRadius="full" fontSize="sm">
                        Our Locations
                    </Badge>
                    <Heading size="lg" color="brand.800" fontWeight="bold">
                        Find Us on the Map
                    </Heading>
                    <Text color="gray.500" maxW="xl" fontSize="md">
                        We operate from two dedicated locations — our main office and instrument godown.
                    </Text>
                </VStack>

                {/* ── Two Location Cards ── */}
                <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
                    {LOCATIONS.map((loc, i) => (
                        <LocationCard key={loc.id} loc={loc} index={i} />
                    ))}
                </SimpleGrid>
            </Container>

            {/* ── Bottom CTA Strip ── */}
            <Box bgGradient="linear(to-r, brand.800, brand.900)" py={12} mt={4}>
                <Container maxW="4xl" textAlign="center">
                    <Heading size="lg" color="white" mb={3} fontWeight="bold">
                        Ready to Work Together?
                    </Heading>
                    <Text color="gray.300" mb={7} fontSize="md">
                        Call or WhatsApp us directly for the fastest response.
                    </Text>
                    <HStack spacing={4} justify="center" wrap="wrap">
                        <Button
                            as="a"
                            href={`tel:${CONTACT.phone}`}
                            size="lg"
                            bg="white"
                            color="brand.700"
                            fontWeight="bold"
                            borderRadius="xl"
                            leftIcon={<Icon as={FiPhone} />}
                            _hover={{ bg: 'gray.100', transform: 'translateY(-2px)', boxShadow: 'xl' }}
                            transition="all 0.2s"
                            px={8}
                        >
                            {CONTACT.phoneDisplay}
                        </Button>
                        <Button
                            as="a"
                            href={`https://wa.me/${CONTACT.whatsapp}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            size="lg"
                            bg="#25D366"
                            color="white"
                            fontWeight="bold"
                            borderRadius="xl"
                            _hover={{ bg: '#1ebe5d', transform: 'translateY(-2px)', boxShadow: 'xl' }}
                            transition="all 0.2s"
                            px={8}
                        >
                            Chat on WhatsApp
                        </Button>
                    </HStack>
                </Container>
            </Box>

        </Box>
    );
};

export default Contact;
