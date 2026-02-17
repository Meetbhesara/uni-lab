export const DEMO_PRODUCTS = [
    { _id: 'prod_A101', name: 'Industrial Valve', category: 'Valves', price: 1500, stock: 50, image: 'https://placehold.co/50x50?text=Valve' },
    { _id: 'prod_B202', name: 'Pipe Fitting 2"', category: 'Fittings', price: 300, stock: 200, image: 'https://placehold.co/50x50?text=Fit' },
    { _id: 'prod_C303', name: 'Heavy Duty Centrifugal Pump', category: 'Pumps', price: 15000, stock: 5, image: 'https://placehold.co/50x50?text=Pump' },
    { _id: 'prod_D404', name: 'Safety Goggles', category: 'Safety', price: 250, stock: 500, image: 'https://placehold.co/50x50?text=Safe' },
    { _id: 'prod_E505', name: 'Hydraulic Cylinder', category: 'Hydraulics', price: 8000, stock: 12, image: 'https://placehold.co/50x50?text=Hyd' },
    { _id: 'prod_F606', name: 'Pressure Gauge', category: 'Instrumentation', price: 1200, stock: 30, image: 'https://placehold.co/50x50?text=Gau' }
];

export const DEMO_ENQUIRIES = [
    {
        _id: 'enq_101',
        type: 'enquiry',
        Name: 'Rahul Kumar',
        email: 'rahul.k@example.com',
        phone: '9876543210',
        status: 'Pending',
        createdAt: new Date().toISOString(),
        products: [
            { productId: { _id: 'prod_A101', name: 'Industrial Valve', image: 'https://placehold.co/50x50?text=Valve' }, quantity: 10 },
            { productId: { _id: 'prod_B202', name: 'Pipe Fitting 2"', image: 'https://placehold.co/50x50?text=Fit' }, quantity: 50 }
        ]
    },
    {
        _id: 'enq_102',
        type: 'enquiry',
        Name: 'Sita Engineering Works',
        email: 'procurement@sita-eng.com',
        phone: '022-24567890',
        status: 'Processed', // Already quoted
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        products: [{ productId: { _id: 'prod_C303', name: 'Heavy Duty Centrifugal Pump', image: 'https://placehold.co/50x50?text=Pump' }, quantity: 25 }],
        message: 'Requesting urgent quotation. Delivery required by next Friday.'
    },
    {
        _id: 'enq_103',
        type: 'enquiry', // Can be general text enquiry too
        Name: 'Global Tech Industries',
        email: 'contact@globaltech.in',
        phone: '9123456789',
        status: 'Pending',
        createdAt: new Date(Date.now() - 250000000).toISOString(),
        products: [],
        message: 'Bulk Order Inquiry: We are looking to partner for long-term supply of fasteners. Please provide your best rates for SS304 Hex Bolts M12x50.'
    },
    {
        _id: 'enq_104',
        type: 'enquiry',
        Name: 'Priya Singh',
        email: 'priya.singh88@yahoo.com',
        phone: '8877665544',
        status: 'Rejected',
        createdAt: new Date().toISOString(),
        products: [
            { productId: { _id: 'prod_D404', name: 'Safety Goggles', image: 'https://placehold.co/50x50?text=Safe' }, quantity: 100 }
        ]
    }
];

export const DEMO_QUOTATIONS = [
    {
        _id: 'qt_201',
        enquiry: {
            _id: 'enq_102',
            Name: 'Sita Engineering Works',
            email: 'procurement@sita-eng.com'
        },
        status: 'Sent',
        createdAt: new Date().toISOString(),
        items: [
            {
                product: { _id: 'prod_C303', name: 'Heavy Duty Centrifugal Pump', image: 'https://placehold.co/50x50?text=Pump' },
                quantity: 25,
                price: 15000,
                gst: 18,
                amount: 442500 // (15000 * 25) * 1.18
            }
        ],
        totalAmount: 442500,
        pdfPath: '/uploads/quotes/qt_201.pdf'
    }
];
