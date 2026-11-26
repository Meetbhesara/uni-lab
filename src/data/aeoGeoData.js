/**
 * Centralized AEO (Answer Engine Optimization) & GEO (Generative Engine Optimization)
 * data source for uecivil.com (Unique Engineering & Survey).
 *
 * Every FAQ, comparison table, and technical guide here is rendered visibly on the UI
 * AND mirrored into JSON-LD schema + build-time static HTML for AI crawlers.
 */

export const COMPANY_ENTITY = {
    brandName: 'Unique Engineering & Survey',
    shortName: 'Unique Engineering',
    surveyDivision: 'Unique Survey',
    domain: 'https://uecivil.com',
    founder: 'Atul Kanak',
    phone: '+91 90991 60391',
    phoneRaw: '+919099160391',
    whatsapp: '919099160391',
    email: 'info@uecivil.com',
    streetAddress: 'A-206, Infinity Tower, Nr. Ramada Hotel, Prahladnagar',
    city: 'Ahmedabad',
    state: 'Gujarat',
    postalCode: '380015',
    country: 'India',
    fullAddress: 'A-206, Infinity Tower, Nr. Ramada Hotel, Prahladnagar, Ahmedabad 380015, Gujarat, India',
    udyamNumber: 'UDYAM-GJ-01-0569418',
    panNumber: 'AANHD0443B',
    hours: 'Open 24 Hours / 7 Days (24/7)',
    youtube: 'https://www.youtube.com/@UECIVIL',
    serviceAreas: ['Ahmedabad', 'Gandhinagar', 'Vadodara', 'Surat', 'Rajkot', 'Sanand', 'Dholera SIR', 'Gujarat', 'PAN India'],
};

export const HOME_AEO_FAQS = [
    {
        q: 'What land surveying services does Unique Survey provide in Ahmedabad and Gujarat?',
        a: 'Unique Survey (uecivil.com) provides Counter Survey (Contour Survey), Land Topography Survey, Point Marking & Boundary Demarcation, Dual-Frequency DGPS RTK Survey, Drone/UAV Aerial Mapping, Plot Layout Setting Out, and Road/Pipeline L-Section & X-Section Surveys across Ahmedabad, Gandhinagar, Dholera SIR, Vadodara, Surat, and Gujarat.',
        tag: 'Land Surveying',
    },
    {
        q: 'What is a Counter Survey (Contour Survey) and what deliverables do you get?',
        a: 'A Counter Survey (Contour Survey) maps ground points of equal elevation (Reduced Levels / RL) at 0.25m, 0.5m, or 1.0m intervals. Clients receive AutoCAD (.DWG/.DXF) contour drawings, spot RL grids, 3D TIN surface models, and cut-and-fill earthwork volume sheets for drainage and foundation planning.',
        tag: 'Contour Survey',
    },
    {
        q: 'What civil engineering laboratory testing instruments does Unique Engineering supply?',
        a: 'Unique Engineering supplies Compression Testing Machines (CTM 2000kN & 3000kN), concrete cube moulds, slump cones (IS:7320), aggregate impact value testers, soil Direct Shear & CBR apparatus, bitumen penetrometers, softening point kits, Sokkia/Bosch Auto Levels, Total Stations, and RTK DGPS units compliant with IS, BS, and ASTM standards.',
        tag: 'Lab Equipment',
    },
    {
        q: 'How does Point Marking & Boundary Demarcation prevent land disputes in Gujarat?',
        a: 'Point Marking combines sub-centimeter RTK DGPS and Electronic Total Station measurements to correlate government revenue records (Village Form 7/12, Tippan, TP Schemes, and City Survey maps) with true satellite coordinates and fix physical boundary pillars at exact plot corners.',
        tag: 'Point Marking',
    },
    {
        q: 'Do your testing instruments come with IS/ASTM compliance and calibration support?',
        a: 'Yes. All concrete, soil, aggregate, and bitumen lab instruments from Unique Engineering are built to IS, BS, and ASTM specifications and include manufacturer warranty, technical datasheets, and calibration certificate support for NABL, PWD, and third-party QA/QC labs.',
        tag: 'Calibration & QA',
    },
    {
        q: 'Where is Unique Engineering located and how quickly can I get a survey or equipment quote?',
        a: 'Headquartered at A-206, Infinity Tower, Nr. Ramada Hotel, Prahladnagar, Ahmedabad 380015, Gujarat. Call or WhatsApp +91 90991 60391 or email info@uecivil.com (available 24/7) for same-day equipment quotations or to schedule an on-site land survey team.',
        tag: 'Contact & Quotes',
    },
];

export const SURVEY_COMPARISON_ROWS = [
    {
        method: 'Counter Survey (Contour)',
        slug: 'contour-survey',
        accuracy: '±2–5 mm vertical (RL)',
        bestFor: 'Cut-fill earthwork, drainage slope, grading, hill/uneven plots',
        instruments: 'Total Station + Auto Level / DGPS',
        deliverables: 'AutoCAD .DWG/.DXF contours (0.25m–1m), TIN 3D, Cut-Fill sheet',
        turnaround: '1–3 Days',
    },
    {
        method: 'Land Topography Survey',
        slug: 'topography-survey',
        accuracy: '±2–5 mm positional',
        bestFor: 'Architectural design, factory/TP planning, as-built mapping',
        instruments: 'Reflectorless Total Station + RTK DGPS',
        deliverables: 'Full .DWG feature map, spot RLs, trees/poles/utilities, KMZ',
        turnaround: '1–4 Days',
    },
    {
        method: 'Point Marking & Demarcation',
        slug: 'point-marking',
        accuracy: '±5–10 mm (RTK / TS)',
        bestFor: '7/12 & TP boundary verification, corner pegging, dispute clarity',
        instruments: 'Dual-Freq RTK DGPS + Total Station',
        deliverables: 'Physical pegs/stone pillars, corner UTM table, possession sketch',
        turnaround: '1–2 Days',
    },
    {
        method: 'DGPS & RTK Geodetic Survey',
        slug: 'dgps-survey',
        accuracy: '±8 mm + 1 ppm RTK',
        bestFor: '5–500+ acre sites, solar parks, TBM fixing, long corridors',
        instruments: 'Multi-Constellation GNSS Base & Rover',
        deliverables: 'Permanent TBM pillars, WGS-84/UTM coordinates, .SHP & .DWG',
        turnaround: '1–3 Days',
    },
    {
        method: 'Drone / UAV Aerial Mapping',
        slug: 'drone-survey',
        accuracy: '2–5 cm (with DGPS GCP)',
        bestFor: 'Large townships, mining quarries, stockpiles, floodplains',
        instruments: 'Mapping UAV + DGPS Ground Control Points',
        deliverables: 'Orthomosaic GeoTIFF, DSM/DTM/DEM, .LAS point cloud, contours',
        turnaround: '2–5 Days',
    },
    {
        method: 'Road / Pipeline Alignment',
        slug: 'road-alignment',
        accuracy: '±2–3 mm level',
        bestFor: 'Highways, canals, sewer/water pipelines, ROW verification',
        instruments: 'Total Station + Digital Auto Level + DGPS',
        deliverables: 'L-Section & X-Section (10m/20m intervals), Mass Haul sheet',
        turnaround: '2–5 Days',
    },
];

export const LAB_STANDARDS_ROWS = [
    {
        category: 'Concrete & Cement Testing',
        slug: 'cement-concrete',
        keyEquipment: 'CTM 2000kN / 3000kN (Digital & Analogue), Cube Moulds (150mm), Slump Cone, Rebound Hammer',
        standards: 'IS:516, IS:14858, IS:7320, IS:1199, ASTM C39',
        applications: 'Compressive strength, workability, NDT site verification, RMC plants',
    },
    {
        category: 'Soil & Geotechnical Testing',
        slug: 'soil-testing',
        keyEquipment: 'Direct Shear Apparatus, CBR Test Machine, Proctor Compaction, Casagrande Liquid Limit, Core Cutter',
        standards: 'IS:2720 (Parts 5, 7, 13, 16, 29), ASTM D1883',
        applications: 'Bearing capacity, highway subgrade CBR, field dry density, foundation design',
    },
    {
        category: 'Aggregate Testing',
        slug: 'cement-concrete',
        keyEquipment: 'Aggregate Impact Value (AIV) Tester, Los Angeles Abrasion, Crushing Value, Sieve Shaker',
        standards: 'IS:2386 (Parts 1–4), IS:383, BS:812',
        applications: 'Road aggregate toughness, flakiness/elongation, gradation analysis',
    },
    {
        category: 'Bitumen & Asphalt Testing',
        slug: 'bitumen-testing',
        keyEquipment: 'Digital Bitumen Penetrometer, Ductility Machine, Ring & Ball Softening Point, Marshall Stability',
        standards: 'IS:1203, IS:1205, IS:1208, ASTM D5 / D36 / D6927',
        applications: 'VG-30/VG-40 grade checks, highway mix design, asphalt QA/QC labs',
    },
    {
        category: 'Survey & Measuring Instruments',
        slug: 'survey-instruments',
        keyEquipment: 'Electronic Total Station (1"/2"), Sokkia B40A & Bosch Auto Levels, RTK DGPS, Prism Poles',
        standards: 'ISO 17123 Optics & EDM Accuracy',
        applications: 'Site levelling, layout staking, contour mapping, infrastructure alignment',
    },
];

export const PRODUCT_AEO_FAQS = [
    {
        q: 'Which Compression Testing Machine capacity should I choose — 2000 kN or 3000 kN?',
        a: 'Choose a 2000 kN CTM for standard 150 mm concrete cubes up to M60–M70 grade (standard building & PWD labs). Choose a 3000 kN Digital CTM if you test high-strength concrete (M80+), bridge girders, or heavy cylindrical cores requiring extra load headroom per IS:516 and IS:14858.',
    },
    {
        q: 'Do Unique Engineering instruments comply with IS and ASTM testing standards?',
        a: 'Yes. Our concrete, soil, aggregate, and bitumen lab equipment is manufactured and supplied to match IS (Bureau of Indian Standards), BS, and ASTM specifications such as IS:516, IS:7320, IS:2720, IS:2386, and IS:1203, with optional calibration certificates.',
    },
    {
        q: 'Can I build a bulk lab setup quotation and get PAN-India delivery?',
        a: 'Yes. Add required instruments directly to your Enquiry Cart on uecivil.com, or call/WhatsApp +91 90991 60391 (info@uecivil.com). We supply complete NABL/RMC/college/highway site lab packages from Ahmedabad across Gujarat and all of India.',
    },
    {
        q: 'What is included in a standard Auto Level Survey Kit (Sokkia B40A / Bosch)?',
        a: 'A standard Auto Level set includes the calibrated optical Auto Level unit (24x–32x magnification), heavy-duty aluminum tripod, 5-meter telescopic aluminum levelling staff, plumb bob, and hard carrying case—ready for immediate site levelling.',
    },
];

export const TECHNICAL_GUIDES = [
    {
        slug: 'contour-survey-cut-fill-guide',
        category: 'Land Surveying Guide',
        badge: 'Most Read • Survey',
        badgeColor: 'orange',
        title: 'Counter Survey (Contour Survey) Guide: Intervals, Accuracy & Cut-Fill Volume',
        subtitle: 'How elevation contouring works in Ahmedabad & Gujarat for site grading, drainage design, and earthwork estimation.',
        readTime: '4 min read',
        updatedDate: '2026-11-25',
        standards: ['0.25m / 0.5m / 1.0m Intervals', 'AutoCAD .DWG / .DXF', '±2–5 mm RL Accuracy', 'TIN Cut & Fill'],
        directAnswer:
            'A Counter Survey (Contour Survey) maps ground points of equal elevation (Reduced Levels / RL) across a site using a Total Station, Auto Level, or RTK DGPS. Engineers use 0.25m to 1.0m contour plans to calculate exact cut-and-fill soil volumes, design rainwater drainage slopes, and set plinth foundation levels before construction.',
        keyFacts: [
            { label: 'Typical Contour Interval', value: '0.25 m (flat plots) to 1.0 m (large/hilly terrain)' },
            { label: 'Vertical Accuracy', value: '±2 mm to ±5 mm with Total Station & Auto Level' },
            { label: 'CAD Deliverables', value: 'AutoCAD .DWG, .DXF, Spot RL Grid, 3D TIN, Cut-Fill Excel' },
            { label: 'Turnaround Time', value: '1–3 working days for plots in Ahmedabad & Gujarat' },
        ],
        sections: [
            {
                heading: '1. When Do You Need a Counter (Contour) Survey?',
                body: 'Before excavation or architectural planning begins, a contour drawing reveals natural depressions, waterlogging zones, and elevation drops that are invisible to the naked eye.',
                bullets: [
                    'Residential, commercial, and industrial factory site grading & plinth height selection',
                    'Accurate earthwork Cut & Fill quantity billing for excavation contractors',
                    'Stormwater drainage, sewage slope, and canal hydraulic gradient design',
                    'Solar power parks and large township earth-balancing optimization',
                ],
            },
            {
                heading: '2. Recommended Contour Intervals by Project Type',
                body: 'Selecting the right grid spacing and contour interval prevents under-measuring earthwork quantities while keeping survey costs optimal:',
                bullets: [
                    '0.20 m – 0.25 m interval (5m–10m spot grid): Flat urban plots in Ahmedabad, factories, warehouses',
                    '0.50 m interval (10m–15m spot grid): Residential townships, commercial campuses, farmhouses',
                    '1.00 m – 2.00 m interval: Large industrial land banks (Dholera SIR, Sanand), quarries, hilly terrain',
                ],
            },
        ],
        comparisonTable: {
            caption: 'Contour Survey Method Comparison',
            headers: ['Method', 'Best Plot Size', 'Vertical Accuracy', 'Output Files'],
            rows: [
                ['Total Station + Auto Level', '0.5 to 50 Acres', '±2–5 mm', '.DWG, .DXF, RL Excel, Cut-Fill Report'],
                ['Dual-Freq RTK DGPS', '10 to 500+ Acres', '±10–15 mm', '.DWG, UTM CSV, .SHP, TBM Coordinates'],
                ['Drone UAV + DGPS GCP', '25 to 2,000+ Acres', '±3–5 cm', 'Orthomosaic GeoTIFF, DSM/DTM, .DWG Contours'],
            ],
        },
        faqs: [
            {
                q: 'What is the difference between a Counter Survey and a Contour Survey?',
                a: 'In Gujarat and across India, "Counter Survey" is a widely used local term for a "Contour Survey." Both refer to measuring ground Reduced Levels (RL) and plotting lines connecting equal elevations.',
            },
            {
                q: 'What benchmark (TBM) is used during a contour survey?',
                a: 'We establish a permanent Temporary Benchmark (TBM) on-site tied either to Mean Sea Level (MSL) via DGPS/GTS benchmarks or to an agreed fixed structure such as an adjoining road curb or compound plinth.',
            },
        ],
        ctaLabel: 'Book Contour Survey in Gujarat',
        ctaTo: '/services/contour-survey',
    },
    {
        slug: 'point-marking-7-12-demarcation-gujarat',
        category: 'Boundary & Revenue Guide',
        badge: 'Legal & Site Clarity',
        badgeColor: 'teal',
        title: 'Point Marking & 7/12 Revenue Boundary Demarcation in Gujarat',
        subtitle: 'How DGPS & Total Station correlation prevents encroachment and fixes exact plot corners on-site.',
        readTime: '4 min read',
        updatedDate: '2026-11-25',
        standards: ['Village Form 7/12 & Tippan', 'TP Scheme / Final Plot', 'RTK DGPS + Total Station', 'WGS-84 / UTM'],
        directAnswer:
            'Point Marking & Boundary Demarcation translates government revenue maps (Village Form 7/12, Tippan, City Survey CTS, and TP Final Plot drawings) onto physical ground using RTK DGPS and Electronic Total Stations. Surveyors stake exact corner coordinates with steel pegs or stone pillars to prevent encroachments and boundary disputes.',
        keyFacts: [
            { label: 'Records Correlated', value: '7/12, Tippan, DILR Sheet, TP Scheme (FP), NA Layout' },
            { label: 'Positional Accuracy', value: 'Sub-centimeter (±5–10 mm) between pegged corners' },
            { label: 'Physical Markers', value: 'Painted steel pegs, concrete pillars, or boundary stones' },
            { label: 'Deliverables', value: 'As-Possessed vs. Record Overlay .DWG & Corner UTM Table' },
        ],
        sections: [
            {
                heading: '1. Why Revenue Record Correlation Matters Before Buying or Fencing Land',
                body: 'Physical farm fences, compound walls, and old hedges frequently drift over decades. Superimposing official revenue Tippan/TP coordinates onto an as-built DGPS survey immediately reveals excess or shortage in possession area.',
                bullets: [
                    'Pre-purchase land due diligence for buyers, builders, and industrial investors',
                    'Resolving neighbor boundary overlaps before compound wall construction',
                    'Re-establishing missing corner stones on large agricultural or NA plots',
                    'Setting out Final Plot (FP) boundaries from municipal Town Planning (TP) schemes',
                ],
            },
            {
                heading: '2. Step-by-Step Point Marking Workflow at Unique Survey',
                body: 'Our field engineers follow a verifiable 4-stage workflow:',
                bullets: [
                    'Step 1 — Record Digitization: Digitize Tippan, 7/12, or TP Final Plot CAD coordinates.',
                    'Step 2 — Field Pickup: Survey existing hedges, roads, adjoining survey numbers, and nearby permanent markers using RTK DGPS.',
                    'Step 3 — Best-Fit / Coordinate Correlation: Overlay actual ground occupation against official revenue dimensions.',
                    'Step 4 — Physical Pegging & Report: Stake verified corners on-site and hand over a signed CAD overlay & coordinate table.',
                ],
            },
        ],
        comparisonTable: {
            caption: 'Point Marking vs. Plot Layout Setting Out',
            headers: ['Service', 'Reference Input', 'Primary Purpose', 'Output'],
            rows: [
                ['Boundary Point Marking', '7/12, Tippan, DILR, TP FP Map', 'Verify legal boundary & prevent disputes', 'Corner pillars + Record vs. Actual Overlay'],
                ['Plot Layout Setting Out', 'Approved Architect / NA Master Plan', 'Mark internal plots, roads, column grids', 'As-Staked Layout CAD + Individual plot pegs'],
            ],
        },
        faqs: [
            {
                q: 'Can Point Marking be done without existing boundary stones on site?',
                a: 'Yes. Using multi-constellation RTK DGPS and adjoining permanent survey reference features from revenue sheets, our team reconstructs and pegs the exact boundary corners.',
            },
            {
                q: 'Do you provide a Google Earth KMZ file with the demarcated boundary?',
                a: 'Yes. Every georeferenced DGPS boundary survey includes an AutoCAD .DWG file, UTM/Lat-Long corner coordinate table, and Google Earth .KMZ overlay.',
            },
        ],
        ctaLabel: 'Explore Point Marking Service',
        ctaTo: '/services/point-marking',
    },
    {
        slug: 'compression-testing-machine-ctm-buyer-guide',
        category: 'Concrete Lab Equipment Guide',
        badge: 'IS:516 & IS:14858',
        badgeColor: 'blue',
        title: 'Compression Testing Machine (CTM) Buyer Guide: 2000kN vs 3000kN (IS:516)',
        subtitle: 'How to select the right digital or semi-automatic CTM for concrete cube testing, RMC plants, and NABL labs.',
        readTime: '5 min read',
        updatedDate: '2026-11-25',
        standards: ['IS:516 (Part 1)', 'IS:14858:2000', 'ASTM C39', 'BS EN 12390-4'],
        directAnswer:
            'A Compression Testing Machine (CTM) measures the compressive strength of 150 mm concrete cubes and cylinders under controlled hydraulic loading per IS:516 and IS:14858. A 2000 kN CTM covers standard M15–M70 concrete mixes, while a 3000 kN Digital CTM is recommended for high-strength M80+ concrete, bridge girders, and NABL-accredited laboratories.',
        keyFacts: [
            { label: 'Standard Cube Size', value: '150 × 150 × 150 mm (and 100 mm / 70.6 mm mortar cubes)' },
            { label: 'Loading Rate (IS:516)', value: '140 kg/cm²/min (~5.2 kN/sec for 150 mm cube)' },
            { label: 'Accuracy Class', value: '±1% of indicated load from 10% to 100% capacity' },
            { label: 'Frame Styles', value: '4-Pillar Load Frame or Welded Channel Frame with Safety Guard' },
        ],
        sections: [
            {
                heading: '1. Digital vs. Analogue vs. Fully Automatic CTM',
                body: 'Choosing the right readout and pacing control depends on test volume and audit requirements:',
                bullets: [
                    'Analogue (Load Gauge): Economical dial-gauge machine for small site labs; requires manual valve pacing.',
                    'Digital Semi-Automatic: High-resolution digital peak-hold readout with pace-rate bar graph; ideal for contractors and RMC plants.',
                    'Servo / Microprocessor Automatic: Automated constant pace-rate loading with RS-232/USB data logging; preferred for NABL & third-party labs.',
                ],
            },
            {
                heading: '2. Essential Accessories for Complete IS:516 Concrete Testing',
                body: 'A CTM works as part of a complete concrete QA/QC workflow:',
                bullets: [
                    'Cast Iron 150 mm Concrete Cube Moulds (IS:10086) & Tamping Rod',
                    'Slump Cone Apparatus (IS:7320) for fresh concrete workability',
                    'Thermostatically Controlled Cube Curing Tank (27°C ± 2°C)',
                    'Digital Rebound Hammer (Schmidt Type) for in-situ NDT checks',
                ],
            },
        ],
        comparisonTable: {
            caption: '2000 kN vs. 3000 kN Compression Testing Machine Comparison',
            headers: ['Specification', '2000 kN CTM', '3000 kN CTM'],
            rows: [
                ['Max Load Capacity', '2000 kN (200 Tonne)', '3000 kN (300 Tonne)'],
                ['Max 150mm Cube Grade', 'Up to ~M75–M80', 'Up to M110+ (High-Strength / HSC)'],
                ['Best For', 'Building sites, RMC plants, PWD labs', 'Metro/Highway labs, NABL labs, precast'],
                ['Compliance', 'IS:14858, IS:516', 'IS:14858, IS:516, ASTM C39'],
            ],
        },
        faqs: [
            {
                q: 'What is the required loading rate for testing 150 mm concrete cubes under IS:516?',
                a: 'IS:516 specifies applying load without shock at a continuous rate of approximately 140 kg/cm² per minute (roughly 5.2 kN per second for a 150 × 150 mm cube face) until specimen failure.',
            },
            {
                q: 'Does Unique Engineering supply 150 mm cube moulds and curing tanks along with the CTM?',
                a: 'Yes. We supply complete concrete lab packages including CTM (2000kN/3000kN), heavy-duty cast iron 150mm cube moulds, slump cones, vibrating tables, and curing tanks with PAN-India dispatch from Ahmedabad.',
            },
        ],
        ctaLabel: 'View CTM & Concrete Equipment',
        ctaTo: '/products/compression-testing-machine',
    },
    {
        slug: 'civil-engineering-lab-setup-checklist-india',
        category: 'Lab Setup & QA/QC Guide',
        badge: 'Contractor & NABL',
        badgeColor: 'purple',
        title: 'Complete Civil Engineering Site & NABL Lab Equipment Checklist (IS Standards)',
        subtitle: 'Essential testing instruments for concrete, aggregate, soil, and bitumen QA/QC laboratories in India.',
        readTime: '5 min read',
        updatedDate: '2026-11-25',
        standards: ['IS:516 & IS:4031', 'IS:2386', 'IS:2720', 'IS:1203–1208'],
        directAnswer:
            'A standard civil engineering QA/QC site lab in India requires four core testing sections: Concrete & Cement (CTM 2000kN, cube moulds, slump cone, Vicat apparatus), Aggregate (AIV, crushing value, IS sieves, flakiness gauge), Soil (CBR, Direct Shear, Proctor compaction, core cutter, liquid limit), and Bitumen (penetrometer, softening point, ductility, Marshall stability) for road projects.',
        keyFacts: [
            { label: 'Core Modules', value: 'Concrete, Cement, Aggregate, Soil, Bitumen & Survey' },
            { label: 'Standard Compliance', value: 'IS, BS, and ASTM certified apparatus' },
            { label: 'Calibration Support', value: 'Traceable calibration & installation guidance available' },
            { label: 'Supply Coverage', value: 'Ahmedabad, Gujarat & PAN-India project delivery' },
        ],
        sections: [
            {
                heading: '1. Minimum Equipment for Building & RMC Concrete Labs',
                body: 'Every residential, commercial, or RMC quality lab starts with these mandatory instruments:',
                bullets: [
                    'Compression Testing Machine (2000 kN Digital) + 150 mm Cast Iron Cube Moulds (min. 12–24 nos.)',
                    'Slump Cone Apparatus (IS:7320) & Needle/Table Vibrator',
                    'Sieve Shaker + Brass/GI IS Sieves (20mm, 10mm, 4.75mm down to 75 micron)',
                    'Aggregate Impact Value (AIV) Apparatus, Flakiness & Elongation Gauges',
                    'Hot Air Oven (250°C), Digital Weighing Balances (10 kg / 30 kg), Cube Curing Tank',
                ],
            },
            {
                heading: '2. Additional Equipment for Highway, Road & Geotechnical Labs',
                body: 'NHAI, state PWD, and infrastructure contractors additionally require Soil and Bitumen testing lines:',
                bullets: [
                    'Soil Mechanics: California Bearing Ratio (CBR), Heavy/Light Proctor Compaction, Core Cutter, Sand Replacement, Direct Shear, Casagrande Liquid Limit',
                    'Bitumen & Asphalt: Standard/Digital Penetrometer (IS:1203), Ring & Ball Softening Point (IS:1205), Ductility Machine (IS:1208), Marshall Stability Apparatus, Centrifuge Extractor',
                    'Field Surveying: Electronic Total Station (1"/2"), Sokkia/Bosch Auto Level Set, RTK DGPS Receiver',
                ],
            },
        ],
        comparisonTable: {
            caption: 'Quick Lab Package Mapping by Project Type',
            headers: ['Project Type', 'Mandatory Lab Sections', 'Key Highlight Instruments'],
            rows: [
                ['Building / High-Rise Site Lab', 'Concrete + Aggregate + Survey', '2000kN CTM, Cube Moulds, Slump Cone, Auto Level'],
                ['RMC Plant QA Lab', 'Cement + Concrete + Aggregate', 'CTM, Vicat, Blaine Permeability, Silt Jar, Sieves'],
                ['Highway / Road / NHAI Lab', 'Concrete + Soil + Bitumen + Survey', '3000kN CTM, CBR, Marshall Stability, Penetrometer, Total Station'],
                ['Educational / College Lab', 'Full Civil Material & Geotech Suite', 'CTM, Direct Shear, Triaxial, AIV, Los Angeles Abrasion'],
            ],
        },
        faqs: [
            {
                q: 'Can Unique Engineering quote a complete turnkey site lab package?',
                a: 'Yes. Share your BOQ or tender equipment list via WhatsApp (+91 90991 60391) or info@uecivil.com, or add items to the Enquiry Cart on uecivil.com for a consolidated GST quotation.',
            },
            {
                q: 'Do you supply spare parts and replacement gauges for existing lab machines?',
                a: 'Yes, we supply CTM digital indicators, load cells, pressure gauges, proving rings, dial gauges, IS sieve meshes, and cube moulds across India.',
            },
        ],
        ctaLabel: 'Browse Full Equipment Catalog',
        ctaTo: '/products',
    },
];
