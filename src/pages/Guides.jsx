import React, { useMemo, useState } from 'react';
import {
    Box, Container, Heading, Text, Badge, SimpleGrid, Card, CardBody, Stack, Flex, Icon,
    Button, HStack, VStack, Table, Thead, Tbody, Tr, Th, Td, TableContainer,
    Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon,
    Breadcrumb, BreadcrumbItem, BreadcrumbLink, Tag, Divider
} from '@chakra-ui/react';
import { Link as RouterLink, useParams, useNavigate } from 'react-router-dom';
import {
    FiArrowRight, FiArrowLeft, FiBookOpen, FiCheckCircle, FiClock, FiCompass,
    FiAward, FiPhone, FiMessageCircle, FiLayers
} from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import SEO from '../components/SEO';
import {
    COMPANY_ENTITY,
    TECHNICAL_GUIDES,
    SURVEY_COMPARISON_ROWS,
    LAB_STANDARDS_ROWS,
    HOME_AEO_FAQS,
} from '../data/aeoGeoData';

const Guides = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [selectedCategory, setSelectedCategory] = useState('all');

    const activeGuide = useMemo(
        () => (slug ? TECHNICAL_GUIDES.find((g) => g.slug === slug) : null),
        [slug]
    );

    const filteredGuides = useMemo(() => {
        if (selectedCategory === 'all') return TECHNICAL_GUIDES;
        return TECHNICAL_GUIDES.filter((g) =>
            g.category.toLowerCase().includes(selectedCategory.toLowerCase())
        );
    }, [selectedCategory]);

    // Build route-specific AEO/GEO Schema (TechArticle + FAQPage + BreadcrumbList)
    const guidesSchema = useMemo(() => {
        if (activeGuide) {
            return {
                '@context': 'https://schema.org',
                '@graph': [
                    {
                        '@type': 'BreadcrumbList',
                        itemListElement: [
                            { '@type': 'ListItem', position: 1, name: 'Home', item: `${COMPANY_ENTITY.domain}/` },
                            { '@type': 'ListItem', position: 2, name: 'Engineering Guides & FAQ', item: `${COMPANY_ENTITY.domain}/guides` },
                            { '@type': 'ListItem', position: 3, name: activeGuide.title, item: `${COMPANY_ENTITY.domain}/guides/${activeGuide.slug}` },
                        ],
                    },
                    {
                        '@type': 'TechArticle',
                        '@id': `${COMPANY_ENTITY.domain}/guides/${activeGuide.slug}#article`,
                        headline: activeGuide.title,
                        description: activeGuide.directAnswer,
                        datePublished: activeGuide.updatedDate,
                        dateModified: activeGuide.updatedDate,
                        author: {
                            '@type': 'Person',
                            name: COMPANY_ENTITY.founder,
                        },
                        publisher: {
                            '@type': 'Organization',
                            name: COMPANY_ENTITY.brandName,
                            url: COMPANY_ENTITY.domain,
                            logo: {
                                '@type': 'ImageObject',
                                url: `${COMPANY_ENTITY.domain}/pwa-512x512.png`,
                            },
                        },
                        mainEntityOfPage: `${COMPANY_ENTITY.domain}/guides/${activeGuide.slug}`,
                    },
                    {
                        '@type': 'FAQPage',
                        mainEntity: activeGuide.faqs.map((f) => ({
                            '@type': 'Question',
                            name: f.q,
                            acceptedAnswer: {
                                '@type': 'Answer',
                                text: f.a,
                            },
                        })),
                    },
                ],
            };
        }

        const allFaqs = [
            ...HOME_AEO_FAQS,
            ...TECHNICAL_GUIDES.flatMap((g) => g.faqs),
        ];

        return {
            '@context': 'https://schema.org',
            '@graph': [
                {
                    '@type': 'BreadcrumbList',
                    itemListElement: [
                        { '@type': 'ListItem', position: 1, name: 'Home', item: `${COMPANY_ENTITY.domain}/` },
                        { '@type': 'ListItem', position: 2, name: 'Engineering Guides & FAQ', item: `${COMPANY_ENTITY.domain}/guides` },
                    ],
                },
                {
                    '@type': 'CollectionPage',
                    '@id': `${COMPANY_ENTITY.domain}/guides#webpage`,
                    name: 'Civil Engineering, Surveying & Lab Testing Guides — Unique Engineering',
                    description: 'Technical guides, IS/ASTM standards, survey comparison tables, and direct answers on Counter Survey, Point Marking, CTM 2000kN/3000kN, and Civil Lab setup in Gujarat.',
                    url: `${COMPANY_ENTITY.domain}/guides`,
                },
                {
                    '@type': 'FAQPage',
                    mainEntity: allFaqs.map((f) => ({
                        '@type': 'Question',
                        name: f.q,
                        acceptedAnswer: {
                            '@type': 'Answer',
                            text: f.a,
                        },
                    })),
                },
            ],
        };
    }, [activeGuide]);

    // ── Single Guide View ──────────────────────────────────────────────────────
    if (activeGuide) {
        const otherGuides = TECHNICAL_GUIDES.filter((g) => g.slug !== activeGuide.slug);

        return (
            <Box bg="gray.50" minH="100vh">
                <SEO
                    title={`${activeGuide.title} | Unique Engineering`}
                    description={activeGuide.directAnswer}
                    keywords={`${activeGuide.title}, ${activeGuide.standards.join(', ')}, Unique Engineering, Unique Survey, Ahmedabad, Gujarat, uecivil`}
                    canonical={`${COMPANY_ENTITY.domain}/guides/${activeGuide.slug}`}
                    schema={guidesSchema}
                />

                {/* Hero Banner */}
                <Box bgGradient="linear(to-br, brand.800, brand.900)" color="white" py={{ base: 10, md: 16 }}>
                    <Container maxW="5xl" px={{ base: 4, md: 8 }}>
                        <Breadcrumb fontSize="xs" color="gray.300" mb={4} separator="›">
                            <BreadcrumbItem>
                                <BreadcrumbLink as={RouterLink} to="/">Home</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbItem>
                                <BreadcrumbLink as={RouterLink} to="/guides">Guides & FAQ</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbItem isCurrentPage>
                                <BreadcrumbLink color="orange.300" fontWeight="bold" noOfLines={1}>
                                    {activeGuide.category}
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                        </Breadcrumb>

                        <HStack spacing={3} mb={4} flexWrap="wrap">
                            <Badge colorScheme={activeGuide.badgeColor} px={3} py={1} borderRadius="full" fontSize="xs">
                                {activeGuide.badge}
                            </Badge>
                            <HStack fontSize="xs" color="gray.300" spacing={1.5}>
                                <Icon as={FiClock} />
                                <Text>{activeGuide.readTime}</Text>
                            </HStack>
                            <Text fontSize="xs" color="gray.400">Updated: {activeGuide.updatedDate}</Text>
                        </HStack>

                        <Heading as="h1" fontSize={{ base: '2xl', md: '4xl' }} fontWeight="900" lineHeight="1.2" mb={4}>
                            {activeGuide.title}
                        </Heading>
                        <Text fontSize={{ base: 'sm', md: 'lg' }} color="gray.300" maxW="3xl" lineHeight="1.6">
                            {activeGuide.subtitle}
                        </Text>

                        <HStack spacing={2} mt={5} flexWrap="wrap">
                            {activeGuide.standards.map((std, i) => (
                                <Tag key={i} size="sm" bg="whiteAlpha.200" color="white" borderRadius="full" px={3}>
                                    {std}
                                </Tag>
                            ))}
                        </HStack>
                    </Container>
                </Box>

                <Container maxW="5xl" py={{ base: 8, md: 12 }} px={{ base: 4, md: 8 }}>
                    <Button
                        leftIcon={<FiArrowLeft />}
                        variant="ghost"
                        colorScheme="brand"
                        size="sm"
                        mb={6}
                        onClick={() => navigate('/guides')}
                    >
                        Back to All Engineering Guides
                    </Button>

                    {/* Direct AEO Quick Answer Callout */}
                    <Box
                        bg="white"
                        borderRadius="2xl"
                        p={{ base: 5, md: 7 }}
                        mb={8}
                        shadow="md"
                        borderLeft="5px solid"
                        borderColor="orange.500"
                    >
                        <HStack spacing={2} mb={2}>
                            <Badge colorScheme="orange" borderRadius="full" px={2.5} py={0.5} fontSize="2xs">
                                QUICK DIRECT ANSWER
                            </Badge>
                            <Text fontSize="xs" color="gray.500" fontWeight="600">
                                Verified by {COMPANY_ENTITY.brandName}
                            </Text>
                        </HStack>
                        <Text fontSize={{ base: 'sm', md: 'md' }} color="gray.800" fontWeight="600" lineHeight="1.75">
                            {activeGuide.directAnswer}
                        </Text>
                    </Box>

                    {/* Key Technical Specs Grid */}
                    <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4} mb={10}>
                        {activeGuide.keyFacts.map((fact, idx) => (
                            <Box key={idx} bg="white" p={4} borderRadius="xl" border="1px solid" borderColor="gray.200" shadow="xs">
                                <Text fontSize="2xs" fontWeight="800" color="brand.600" textTransform="uppercase" letterSpacing="wider" mb={1}>
                                    {fact.label}
                                </Text>
                                <Text fontSize="sm" fontWeight="700" color="gray.800">
                                    {fact.value}
                                </Text>
                            </Box>
                        ))}
                    </SimpleGrid>

                    {/* Guide Detailed Sections */}
                    <VStack spacing={8} align="stretch" mb={10}>
                        {activeGuide.sections.map((sec, idx) => (
                            <Box key={idx} bg="white" p={{ base: 5, md: 8 }} borderRadius="2xl" border="1px solid" borderColor="gray.200" shadow="sm">
                                <Heading as="h2" size="md" color="brand.800" mb={3} fontWeight="800">
                                    {sec.heading}
                                </Heading>
                                <Text fontSize="sm" color="gray.700" lineHeight="1.75" mb={4}>
                                    {sec.body}
                                </Text>
                                <VStack align="start" spacing={2.5}>
                                    {sec.bullets.map((b, bIdx) => (
                                        <HStack key={bIdx} align="start" spacing={2.5}>
                                            <Icon as={FiCheckCircle} color="green.500" mt={1} flexShrink={0} />
                                            <Text fontSize="sm" color="gray.700" lineHeight="1.6">{b}</Text>
                                        </HStack>
                                    ))}
                                </VStack>
                            </Box>
                        ))}
                    </VStack>

                    {/* Structured Comparison Table */}
                    {activeGuide.comparisonTable && (
                        <Box bg="white" p={{ base: 5, md: 8 }} borderRadius="2xl" border="1px solid" borderColor="gray.200" shadow="sm" mb={10}>
                            <Heading as="h2" size="md" color="brand.800" mb={4} fontWeight="800">
                                {activeGuide.comparisonTable.caption}
                            </Heading>
                            <TableContainer>
                                <Table variant="simple" size="sm">
                                    <Thead bg="gray.50">
                                        <Tr>
                                            {activeGuide.comparisonTable.headers.map((h, i) => (
                                                <Th key={i} color="brand.800" fontSize="xs" py={3}>{h}</Th>
                                            ))}
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                        {activeGuide.comparisonTable.rows.map((row, rIdx) => (
                                            <Tr key={rIdx} _hover={{ bg: 'gray.50' }}>
                                                {row.map((cell, cIdx) => (
                                                    <Td key={cIdx} fontSize="xs" fontWeight={cIdx === 0 ? '700' : '500'} color={cIdx === 0 ? 'brand.700' : 'gray.700'} whiteSpace="normal">
                                                        {cell}
                                                    </Td>
                                                ))}
                                            </Tr>
                                        ))}
                                    </Tbody>
                                </Table>
                            </TableContainer>
                        </Box>
                    )}

                    {/* Guide FAQs */}
                    <Box bg="white" p={{ base: 5, md: 8 }} borderRadius="2xl" border="1px solid" borderColor="gray.200" shadow="sm" mb={10}>
                        <Heading as="h2" size="md" color="brand.800" mb={4} fontWeight="800">
                            Frequently Asked Questions
                        </Heading>
                        <Accordion allowMultiple defaultIndex={[0]}>
                            {activeGuide.faqs.map((faq, idx) => (
                                <AccordionItem key={idx} border="1px solid" borderColor="gray.200" borderRadius="xl" mb={3} overflow="hidden">
                                    <AccordionButton bg="gray.50" _expanded={{ bg: 'brand.50', color: 'brand.800' }} py={3.5} px={4}>
                                        <Box flex="1" textAlign="left" fontWeight="700" fontSize="sm">
                                            {faq.q}
                                        </Box>
                                        <AccordionIcon />
                                    </AccordionButton>
                                    <AccordionPanel pb={4} pt={3} px={4} fontSize="sm" color="gray.700" lineHeight="1.7">
                                        {faq.a}
                                    </AccordionPanel>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </Box>

                    {/* CTA Box */}
                    <Box bgGradient="linear(to-r, brand.800, brand.900)" color="white" p={{ base: 6, md: 8 }} borderRadius="2xl" shadow="xl" mb={12}>
                        <Flex direction={{ base: 'column', md: 'row' }} align={{ base: 'start', md: 'center' }} justify="space-between" gap={5}>
                            <Box>
                                <Text fontSize="xs" fontWeight="bold" color="orange.300" textTransform="uppercase" mb={1}>
                                    Need Expert Assistance in Gujarat or PAN-India?
                                </Text>
                                <Heading size="md" mb={1}>{COMPANY_ENTITY.brandName}</Heading>
                                <Text fontSize="xs" color="gray.300">
                                    {COMPANY_ENTITY.fullAddress} • {COMPANY_ENTITY.phone}
                                </Text>
                            </Box>
                            <HStack spacing={3} flexWrap="wrap">
                                <Button
                                    as={RouterLink}
                                    to={activeGuide.ctaTo}
                                    colorScheme="orange"
                                    size="md"
                                    borderRadius="xl"
                                    rightIcon={<FiArrowRight />}
                                >
                                    {activeGuide.ctaLabel}
                                </Button>
                                <Button
                                    as="a"
                                    href={`https://wa.me/${COMPANY_ENTITY.whatsapp}?text=${encodeURIComponent(`Hi Unique Engineering, I read your guide "${activeGuide.title}" on uecivil.com and need a quote.`)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    bg="#25D366"
                                    color="white"
                                    _hover={{ bg: '#1ebe5d' }}
                                    leftIcon={<FaWhatsapp />}
                                    size="md"
                                    borderRadius="xl"
                                >
                                    WhatsApp Us
                                </Button>
                            </HStack>
                        </Flex>
                    </Box>

                    {/* More Guides */}
                    <Heading size="md" color="gray.800" mb={4}>More Technical Guides</Heading>
                    <SimpleGrid columns={{ base: 1, md: 3 }} spacing={5}>
                        {otherGuides.map((g) => (
                            <Card key={g.slug} borderRadius="2xl" bg="white" border="1px solid" borderColor="gray.200" _hover={{ shadow: 'md', borderColor: 'brand.300' }} transition="all 0.2s">
                                <CardBody p={5} display="flex" flexDirection="column" justifyContent="space-between">
                                    <Box>
                                        <Badge colorScheme={g.badgeColor} fontSize="2xs" mb={2} borderRadius="full" px={2}>
                                            {g.category}
                                        </Badge>
                                        <Heading size="xs" color="gray.800" mb={2} lineHeight="1.4">{g.title}</Heading>
                                        <Text fontSize="xs" color="gray.600" noOfLines={3} mb={4}>{g.directAnswer}</Text>
                                    </Box>
                                    <Button as={RouterLink} to={`/guides/${g.slug}`} size="xs" colorScheme="brand" variant="outline" rightIcon={<FiArrowRight />} borderRadius="lg">
                                        Read Guide
                                    </Button>
                                </CardBody>
                            </Card>
                        ))}
                    </SimpleGrid>
                </Container>
            </Box>
        );
    }

    // ── Guides Hub Index View ──────────────────────────────────────────────────
    return (
        <Box bg="gray.50" minH="100vh">
            <SEO
                title="Engineering Guides, Standards & FAQ | Counter Survey, CTM & Civil Lab Hub"
                description="Direct answers, IS/ASTM standards, survey comparison tables, and buyer guides for Counter (Contour) Survey, Point Marking, DGPS, Compression Testing Machines (CTM), Soil & Bitumen testing in Ahmedabad, Gujarat."
                keywords="counter survey guide, contour survey earthwork, point marking 7/12 gujarat, compression testing machine buyer guide IS 516, civil lab setup checklist, uecivil guides"
                canonical={`${COMPANY_ENTITY.domain}/guides`}
                schema={guidesSchema}
            />

            {/* Hero */}
            <Box bgGradient="linear(to-br, brand.800, brand.900)" color="white" py={{ base: 12, md: 20 }}>
                <Container maxW="6xl" px={{ base: 4, md: 8 }} textAlign="center">
                    <Badge colorScheme="orange" px={3.5} py={1} borderRadius="full" mb={4} fontSize="xs" fontWeight="800">
                        CIVIL ENGINEERING KNOWLEDGE & FAQ HUB
                    </Badge>
                    <Heading as="h1" fontSize={{ base: '2xl', sm: '3xl', md: '5xl' }} fontWeight="900" mb={4} lineHeight="1.15">
                        Technical Guides, Standards &{' '}
                        <Text as="span" color="orange.300">Direct Answers</Text>
                    </Heading>
                    <Text fontSize={{ base: 'sm', md: 'lg' }} color="gray.300" maxW="3xl" mx="auto" lineHeight="1.6" mb={6}>
                        Verified engineering specifications, IS/ASTM testing standards, surveying method comparisons, and clear answers prepared by Unique Engineering & Survey, Ahmedabad.
                    </Text>
                    <HStack justify="center" spacing={2} flexWrap="wrap">
                        {[
                            { id: 'all', label: `All Guides (${TECHNICAL_GUIDES.length})` },
                            { id: 'Survey', label: 'Surveying & Boundary' },
                            { id: 'Lab', label: 'Lab Equipment & IS Standards' },
                        ].map((tab) => (
                            <Button
                                key={tab.id}
                                size="sm"
                                borderRadius="full"
                                colorScheme={selectedCategory === tab.id ? 'orange' : 'whiteAlpha'}
                                variant={selectedCategory === tab.id ? 'solid' : 'outline'}
                                color="white"
                                onClick={() => setSelectedCategory(tab.id)}
                            >
                                {tab.label}
                            </Button>
                        ))}
                    </HStack>
                </Container>
            </Box>

            <Container maxW="6xl" py={{ base: 10, md: 16 }} px={{ base: 4, md: 8 }}>
                {/* Technical Guides Grid */}
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={7} mb={16}>
                    {filteredGuides.map((guide) => (
                        <Card
                            key={guide.slug}
                            borderRadius="3xl"
                            bg="white"
                            border="1px solid"
                            borderColor="gray.200"
                            shadow="md"
                            _hover={{ shadow: 'xl', transform: 'translateY(-4px)', borderColor: 'brand.300' }}
                            transition="all 0.25s ease"
                        >
                            <CardBody p={{ base: 6, md: 8 }} display="flex" flexDirection="column" justifyContent="space-between">
                                <Box>
                                    <Flex justify="space-between" align="center" mb={3} gap={2} flexWrap="wrap">
                                        <Badge colorScheme={guide.badgeColor} px={3} py={1} borderRadius="full" fontSize="2xs" fontWeight="bold">
                                            {guide.badge}
                                        </Badge>
                                        <HStack fontSize="xs" color="gray.400">
                                            <Icon as={FiClock} />
                                            <Text>{guide.readTime}</Text>
                                        </HStack>
                                    </Flex>

                                    <Heading as="h2" size="md" color="brand.800" mb={2} lineHeight="1.35">
                                        {guide.title}
                                    </Heading>
                                    <Text fontSize="xs" color="gray.500" fontWeight="600" mb={4}>
                                        {guide.subtitle}
                                    </Text>

                                    {/* Direct Answer Box */}
                                    <Box bg="gray.50" p={4} borderRadius="xl" borderLeft="3px solid" borderColor="orange.400" mb={5}>
                                        <Text fontSize="2xs" fontWeight="800" color="orange.600" mb={1} letterSpacing="wider">
                                            QUICK ANSWER
                                        </Text>
                                        <Text fontSize="xs" color="gray.700" lineHeight="1.65">
                                            {guide.directAnswer}
                                        </Text>
                                    </Box>

                                    <HStack spacing={2} flexWrap="wrap" mb={5}>
                                        {guide.standards.map((std, i) => (
                                            <Tag key={i} size="sm" colorScheme="blue" variant="subtle" borderRadius="md" fontSize="10px">
                                                {std}
                                            </Tag>
                                        ))}
                                    </HStack>
                                </Box>

                                <Button
                                    as={RouterLink}
                                    to={`/guides/${guide.slug}`}
                                    colorScheme="brand"
                                    size="md"
                                    borderRadius="xl"
                                    rightIcon={<FiArrowRight />}
                                    w="full"
                                    fontWeight="bold"
                                >
                                    Read Full Guide & Specs
                                </Button>
                            </CardBody>
                        </Card>
                    ))}
                </SimpleGrid>

                {/* Survey Method Comparison Table */}
                <Box bg="white" p={{ base: 5, md: 8 }} borderRadius="3xl" border="1px solid" borderColor="gray.200" shadow="sm" mb={12}>
                    <Flex direction={{ base: 'column', md: 'row' }} justify="space-between" align={{ base: 'start', md: 'center' }} mb={6} gap={3}>
                        <Box>
                            <Badge colorScheme="blue" mb={2} borderRadius="full" px={3}>SURVEYING MATRIX</Badge>
                            <Heading as="h2" size="lg" color="brand.800">Land Surveying Methods Comparison</Heading>
                            <Text fontSize="sm" color="gray.600" mt={1}>
                                Accuracy, instruments, deliverables, and turnaround times by Unique Survey (Ahmedabad & Gujarat).
                            </Text>
                        </Box>
                        <Button as={RouterLink} to="/services" size="sm" colorScheme="blue" variant="outline" borderRadius="xl" rightIcon={<FiArrowRight />}>
                            View All Services
                        </Button>
                    </Flex>
                    <TableContainer>
                        <Table variant="simple" size="sm">
                            <Thead bg="gray.50">
                                <Tr>
                                    <Th>Survey Type</Th>
                                    <Th>Accuracy</Th>
                                    <Th>Best Used For</Th>
                                    <Th>Deliverables</Th>
                                    <Th>Turnaround</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {SURVEY_COMPARISON_ROWS.map((row) => (
                                    <Tr key={row.slug} _hover={{ bg: 'blue.50' }}>
                                        <Td fontWeight="700" color="brand.700" whiteSpace="normal">
                                            <RouterLink to={`/services/${row.slug}`}>{row.method}</RouterLink>
                                        </Td>
                                        <Td fontSize="xs" fontWeight="600" color="green.700" whiteSpace="nowrap">{row.accuracy}</Td>
                                        <Td fontSize="xs" color="gray.700" whiteSpace="normal">{row.bestFor}</Td>
                                        <Td fontSize="xs" color="gray.600" whiteSpace="normal">{row.deliverables}</Td>
                                        <Td fontSize="xs" fontWeight="700" color="orange.600" whiteSpace="nowrap">{row.turnaround}</Td>
                                    </Tr>
                                ))}
                            </Tbody>
                        </Table>
                    </TableContainer>
                </Box>

                {/* Civil Lab Standards Reference Table */}
                <Box bg="white" p={{ base: 5, md: 8 }} borderRadius="3xl" border="1px solid" borderColor="gray.200" shadow="sm" mb={12}>
                    <Flex direction={{ base: 'column', md: 'row' }} justify="space-between" align={{ base: 'start', md: 'center' }} mb={6} gap={3}>
                        <Box>
                            <Badge colorScheme="orange" mb={2} borderRadius="full" px={3}>IS / BS / ASTM STANDARDS</Badge>
                            <Heading as="h2" size="lg" color="brand.800">Civil Lab Testing Equipment & Standards</Heading>
                            <Text fontSize="sm" color="gray.600" mt={1}>
                                Core instruments supplied by Unique Engineering with manufacturer warranty and calibration support.
                            </Text>
                        </Box>
                        <Button as={RouterLink} to="/products" size="sm" colorScheme="orange" variant="outline" borderRadius="xl" rightIcon={<FiArrowRight />}>
                            Browse Equipment
                        </Button>
                    </Flex>
                    <TableContainer>
                        <Table variant="simple" size="sm">
                            <Thead bg="gray.50">
                                <Tr>
                                    <Th>Testing Category</Th>
                                    <Th>Key Instruments</Th>
                                    <Th>Standards</Th>
                                    <Th>Primary Applications</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {LAB_STANDARDS_ROWS.map((row, idx) => (
                                    <Tr key={idx} _hover={{ bg: 'orange.50' }}>
                                        <Td fontWeight="700" color="brand.700" whiteSpace="normal">
                                            <RouterLink to={`/products?category=${row.slug}`}>{row.category}</RouterLink>
                                        </Td>
                                        <Td fontSize="xs" color="gray.700" whiteSpace="normal">{row.keyEquipment}</Td>
                                        <Td fontSize="xs" fontWeight="700" color="blue.700" whiteSpace="normal">{row.standards}</Td>
                                        <Td fontSize="xs" color="gray.600" whiteSpace="normal">{row.applications}</Td>
                                    </Tr>
                                ))}
                            </Tbody>
                        </Table>
                    </TableContainer>
                </Box>

                {/* Master FAQ Accordion */}
                <Box bg="white" p={{ base: 6, md: 10 }} borderRadius="3xl" border="1px solid" borderColor="gray.200" shadow="sm">
                    <Box textAlign="center" mb={8}>
                        <Badge colorScheme="purple" px={3} py={1} borderRadius="full" mb={2}>DIRECT ANSWERS (AEO)</Badge>
                        <Heading as="h2" size="lg" color="gray.800">Frequently Asked Questions</Heading>
                        <Text fontSize="sm" color="gray.500" mt={1}>
                            Clear, factual answers for engineers, contractors, builders, and property owners.
                        </Text>
                    </Box>
                    <Accordion allowMultiple defaultIndex={[0]}>
                        {HOME_AEO_FAQS.map((item, idx) => (
                            <AccordionItem key={idx} border="1px solid" borderColor="gray.200" borderRadius="xl" mb={3} overflow="hidden">
                                <AccordionButton bg="gray.50" _expanded={{ bg: 'brand.50', color: 'brand.800' }} py={4} px={5}>
                                    <HStack flex="1" textAlign="left" spacing={3}>
                                        <Badge colorScheme="blue" fontSize="2xs" borderRadius="md" flexShrink={0}>
                                            {item.tag}
                                        </Badge>
                                        <Text fontWeight="700" fontSize="sm">{item.q}</Text>
                                    </HStack>
                                    <AccordionIcon />
                                </AccordionButton>
                                <AccordionPanel pb={4} pt={3} px={5} fontSize="sm" color="gray.700" lineHeight="1.7">
                                    {item.a}
                                </AccordionPanel>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </Box>
            </Container>
        </Box>
    );
};

export default Guides;
