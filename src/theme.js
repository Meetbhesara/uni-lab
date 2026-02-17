import { extendTheme } from '@chakra-ui/react';

const colors = {
    brand: {
        50: '#e6f6ff',
        100: '#b3d9ff',
        200: '#80bdff',
        300: '#4da0ff',
        400: '#1a84ff',
        500: '#0066cc', // Primary Navy-ish Blue
        600: '#004d99',
        700: '#003366',
        800: '#001a33',
        900: '#000000',
    },
    accent: {
        500: '#FF8C00', // Industrial Orange
        600: '#E67600',
    },
    slate: {
        500: '#64748b', // Steel
        800: '#1e293b', // Dark Steel
        900: '#0f172a',
    }
};

const fonts = {
    heading: `'Inter', sans-serif`,
    body: `'Inter', sans-serif`,
};

const theme = extendTheme({
    colors,
    fonts,
    styles: {
        global: {
            body: {
                bg: 'gray.50',
                color: 'slate.900',
            },
            '::selection': {
                bg: 'brand.500',
                color: 'white',
            },
        },
    },
    components: {
        Button: {
            variants: {
                solid: {
                    bg: 'brand.500',
                    color: 'white',
                    _hover: {
                        bg: 'brand.600',
                        transform: 'translateY(-1px)',
                        boxShadow: 'md',
                    },
                    _active: {
                        bg: 'brand.700',
                    },
                },
                outline: {
                    borderColor: 'brand.500',
                    color: 'brand.500',
                    _hover: {
                        bg: 'brand.50',
                    },
                },
                accent: {
                    bg: 'accent.500',
                    color: 'white',
                    _hover: {
                        bg: 'accent.600',
                        transform: 'translateY(-1px)',
                        boxShadow: 'md',
                    },
                }
            },
        },
        Card: {
            baseStyle: {
                container: {
                    boxShadow: 'xl',
                    borderRadius: 'xl',
                    overflow: 'hidden',
                    transition: 'all 0.3s',
                    _hover: {
                        transform: 'translateY(-5px)',
                        boxShadow: '2xl',
                    }
                }
            }
        }
    },
});

export default theme;
