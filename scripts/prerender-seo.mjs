/**
 * Post-build static AEO/GEO prerender script for uecivil.com.
 *
 * Generates route-specific HTML files in `dist/` so non-JS AI crawlers
 * (GPTBot, PerplexityBot, ClaudeBot, Google-Extended, etc.) receive exact
 * `<title>`, `<meta>`, `<link rel="canonical">`, JSON-LD structured data,
 * and clean semantic HTML content for every public page, service, and guide.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
    COMPANY_ENTITY,
    HOME_AEO_FAQS,
    SURVEY_COMPARISON_ROWS,
    LAB_STANDARDS_ROWS,
    PRODUCT_AEO_FAQS,
    TECHNICAL_GUIDES,
} from '../src/data/aeoGeoData.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST_DIR = path.resolve(__dirname, '../dist');
const BASE_HTML_PATH = path.join(DIST_DIR, 'index.html');

const esc = (str = '') =>
    String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');

const renderNavHtml = () => `
<header>
  <p><strong>${esc(COMPANY_ENTITY.brandName)}</strong> — ${esc(COMPANY_ENTITY.domain)}</p>
  <nav aria-label="Main Navigation">
    <a href="/">Home</a> |
    <a href="/products">Products</a> |
    <a href="/services">Survey Services</a> |
    <a href="/guides">Engineering Guides &amp; FAQ</a> |
    <a href="/about">About Us</a> |
    <a href="/contact">Contact</a>
  </nav>
</header>`;

const renderFooterHtml = () => `
<footer>
  <p>${esc(COMPANY_ENTITY.fullAddress)} | Phone: ${esc(COMPANY_ENTITY.phone)} | Email: ${esc(COMPANY_ENTITY.email)} | MSME: ${esc(COMPANY_ENTITY.udyamNumber)}</p>
</footer>`;

const buildRoutePages = () => {
    const pages = [];

    // 1. Guides Index (/guides)
    pages.push({
        route: '/guides',
        title: 'Engineering Guides, Standards & FAQ | Counter Survey, CTM & Civil Lab Hub | uecivil.com',
        description:
            'Direct answers, IS/ASTM standards, survey comparison tables, and buyer guides for Counter (Contour) Survey, Point Marking, DGPS, Compression Testing Machines (CTM), Soil & Bitumen testing in Ahmedabad, Gujarat.',
        canonical: `${COMPANY_ENTITY.domain}/guides`,
        schema: {
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
                    name: 'Civil Engineering, Surveying & Lab Testing Guides — Unique Engineering',
                    url: `${COMPANY_ENTITY.domain}/guides`,
                },
                {
                    '@type': 'FAQPage',
                    mainEntity: [...HOME_AEO_FAQS, ...TECHNICAL_GUIDES.flatMap((g) => g.faqs)].map((f) => ({
                        '@type': 'Question',
                        name: f.q,
                        acceptedAnswer: { '@type': 'Answer', text: f.a },
                    })),
                },
            ],
        },
        bodyHtml: `
${renderNavHtml()}
<main>
  <h1>Technical Guides, IS/ASTM Standards &amp; Direct Answers</h1>
  <p>Verified civil engineering, land surveying, and laboratory testing guides by ${esc(COMPANY_ENTITY.brandName)} in Ahmedabad, Gujarat.</p>
  <section>
    <h2>Engineering Guides</h2>
    <ul>
      ${TECHNICAL_GUIDES.map(
          (g) => `<li><a href="/guides/${esc(g.slug)}"><strong>${esc(g.title)}</strong></a> — ${esc(g.directAnswer)}</li>`
      ).join('\n      ')}
    </ul>
  </section>
  <section>
    <h2>Land Surveying Methods Comparison</h2>
    <table>
      <thead><tr><th>Survey Type</th><th>Accuracy</th><th>Best Used For</th><th>Deliverables</th><th>Turnaround</th></tr></thead>
      <tbody>
        ${SURVEY_COMPARISON_ROWS.map(
            (r) => `<tr><td><a href="/services/${esc(r.slug)}">${esc(r.method)}</a></td><td>${esc(r.accuracy)}</td><td>${esc(r.bestFor)}</td><td>${esc(r.deliverables)}</td><td>${esc(r.turnaround)}</td></tr>`
        ).join('\n        ')}
      </tbody>
    </table>
  </section>
  <section>
    <h2>Frequently Asked Questions</h2>
    ${HOME_AEO_FAQS.map((f) => `<article><h3>${esc(f.q)}</h3><p>${esc(f.a)}</p></article>`).join('\n    ')}
  </section>
</main>
${renderFooterHtml()}`,
    });

    // 2. Individual Guide Pages (/guides/:slug)
    for (const guide of TECHNICAL_GUIDES) {
        pages.push({
            route: `/guides/${guide.slug}`,
            title: `${guide.title} | Unique Engineering`,
            description: guide.directAnswer,
            canonical: `${COMPANY_ENTITY.domain}/guides/${guide.slug}`,
            schema: {
                '@context': 'https://schema.org',
                '@graph': [
                    {
                        '@type': 'BreadcrumbList',
                        itemListElement: [
                            { '@type': 'ListItem', position: 1, name: 'Home', item: `${COMPANY_ENTITY.domain}/` },
                            { '@type': 'ListItem', position: 2, name: 'Engineering Guides & FAQ', item: `${COMPANY_ENTITY.domain}/guides` },
                            { '@type': 'ListItem', position: 3, name: guide.title, item: `${COMPANY_ENTITY.domain}/guides/${guide.slug}` },
                        ],
                    },
                    {
                        '@type': 'TechArticle',
                        headline: guide.title,
                        description: guide.directAnswer,
                        datePublished: guide.updatedDate,
                        dateModified: guide.updatedDate,
                        author: { '@type': 'Person', name: COMPANY_ENTITY.founder },
                        publisher: { '@type': 'Organization', name: COMPANY_ENTITY.brandName, url: COMPANY_ENTITY.domain },
                        mainEntityOfPage: `${COMPANY_ENTITY.domain}/guides/${guide.slug}`,
                    },
                    {
                        '@type': 'FAQPage',
                        mainEntity: guide.faqs.map((f) => ({
                            '@type': 'Question',
                            name: f.q,
                            acceptedAnswer: { '@type': 'Answer', text: f.a },
                        })),
                    },
                ],
            },
            bodyHtml: `
${renderNavHtml()}
<main>
  <article>
    <h1>${esc(guide.title)}</h1>
    <p>${esc(guide.subtitle)}</p>
    <section>
      <h2>Quick Direct Answer</h2>
      <p>${esc(guide.directAnswer)}</p>
    </section>
    <section>
      <h2>Key Specifications</h2>
      <ul>
        ${guide.keyFacts.map((kf) => `<li><strong>${esc(kf.label)}:</strong> ${esc(kf.value)}</li>`).join('\n        ')}
      </ul>
    </section>
    ${guide.sections
        .map(
            (s) => `<section>
      <h2>${esc(s.heading)}</h2>
      <p>${esc(s.body)}</p>
      <ul>${s.bullets.map((b) => `<li>${esc(b)}</li>`).join('')}</ul>
    </section>`
        )
        .join('\n    ')}
    ${
        guide.comparisonTable
            ? `<section>
      <h2>${esc(guide.comparisonTable.caption)}</h2>
      <table>
        <thead><tr>${guide.comparisonTable.headers.map((h) => `<th>${esc(h)}</th>`).join('')}</tr></thead>
        <tbody>${guide.comparisonTable.rows.map((r) => `<tr>${r.map((c) => `<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody>
      </table>
    </section>`
            : ''
    }
    <section>
      <h2>Frequently Asked Questions</h2>
      ${guide.faqs.map((f) => `<article><h3>${esc(f.q)}</h3><p>${esc(f.a)}</p></article>`).join('\n      ')}
    </section>
  </article>
</main>
${renderFooterHtml()}`,
        });
    }

    // 3. Services Index & Individual Service Pages (/services & /services/:slug)
    pages.push({
        route: '/services',
        title: 'Specialized Land Survey Services Ahmedabad | Counter Survey, Topography, Point Marking & DGPS',
        description:
            'Unique Survey (uecivil.com) — Land surveying solutions in Ahmedabad & Gujarat: Counter Survey (Contour), Topography, Point Marking Demarcation, DGPS & Drone Surveys.',
        canonical: `${COMPANY_ENTITY.domain}/services`,
        schema: {
            '@context': 'https://schema.org',
            '@graph': [
                {
                    '@type': 'BreadcrumbList',
                    itemListElement: [
                        { '@type': 'ListItem', position: 1, name: 'Home', item: `${COMPANY_ENTITY.domain}/` },
                        { '@type': 'ListItem', position: 2, name: 'Survey Services', item: `${COMPANY_ENTITY.domain}/services` },
                    ],
                },
                {
                    '@type': 'Service',
                    name: 'Land Surveying Services in Ahmedabad & Gujarat',
                    provider: { '@type': 'LocalBusiness', name: COMPANY_ENTITY.surveyDivision, url: COMPANY_ENTITY.domain },
                    areaServed: { '@type': 'State', name: 'Gujarat' },
                },
            ],
        },
        bodyHtml: `
${renderNavHtml()}
<main>
  <h1>Land Surveying &amp; Civil Engineering Services — Unique Survey</h1>
  <p>Certified Counter Survey (Contour), Land Topography, Point Marking &amp; Boundary Demarcation, DGPS RTK, Drone Mapping, Layout Setting Out, and Road Alignment across Gujarat.</p>
  <table>
    <thead><tr><th>Survey Service</th><th>Accuracy</th><th>Best For</th><th>Instruments</th><th>Deliverables</th><th>Turnaround</th></tr></thead>
    <tbody>
      ${SURVEY_COMPARISON_ROWS.map(
          (r) => `<tr><td><a href="/services/${esc(r.slug)}">${esc(r.method)}</a></td><td>${esc(r.accuracy)}</td><td>${esc(r.bestFor)}</td><td>${esc(r.instruments)}</td><td>${esc(r.deliverables)}</td><td>${esc(r.turnaround)}</td></tr>`
      ).join('\n      ')}
    </tbody>
  </table>
</main>
${renderFooterHtml()}`,
    });

    const extraSurveys = [
        ...SURVEY_COMPARISON_ROWS,
        {
            method: 'Plot Layout Setting Out & Subdivision',
            slug: 'layout-demarcation',
            accuracy: '±2–5 mm staking',
            bestFor: 'NA plotting schemes, internal roads, building column grids',
            instruments: 'Electronic Total Station + Auto Level',
            deliverables: 'As-staked AutoCAD layout, plot corner verification sheet',
            turnaround: '1–3 Days',
        },
    ];

    for (const s of extraSurveys) {
        pages.push({
            route: `/services/${s.slug}`,
            title: `${s.method} Ahmedabad & Gujarat | Unique Survey (uecivil.com)`,
            description: `${s.method} in Ahmedabad & Gujarat by Unique Survey. Accuracy: ${s.accuracy}. Instruments: ${s.instruments}. Deliverables: ${s.deliverables}. Call ${COMPANY_ENTITY.phone}.`,
            canonical: `${COMPANY_ENTITY.domain}/services/${s.slug}`,
            schema: {
                '@context': 'https://schema.org',
                '@graph': [
                    {
                        '@type': 'BreadcrumbList',
                        itemListElement: [
                            { '@type': 'ListItem', position: 1, name: 'Home', item: `${COMPANY_ENTITY.domain}/` },
                            { '@type': 'ListItem', position: 2, name: 'Survey Services', item: `${COMPANY_ENTITY.domain}/services` },
                            { '@type': 'ListItem', position: 3, name: s.method, item: `${COMPANY_ENTITY.domain}/services/${s.slug}` },
                        ],
                    },
                    {
                        '@type': 'Service',
                        name: s.method,
                        description: `${s.bestFor}. Deliverables: ${s.deliverables}.`,
                        provider: { '@type': 'LocalBusiness', name: COMPANY_ENTITY.surveyDivision, url: COMPANY_ENTITY.domain },
                        areaServed: { '@type': 'State', name: 'Gujarat' },
                    },
                ],
            },
            bodyHtml: `
${renderNavHtml()}
<main>
  <h1>${esc(s.method)} — Ahmedabad &amp; Gujarat</h1>
  <ul>
    <li><strong>Accuracy:</strong> ${esc(s.accuracy)}</li>
    <li><strong>Best For:</strong> ${esc(s.bestFor)}</li>
    <li><strong>Instruments:</strong> ${esc(s.instruments)}</li>
    <li><strong>Deliverables:</strong> ${esc(s.deliverables)}</li>
    <li><strong>Typical Turnaround:</strong> ${esc(s.turnaround)}</li>
  </ul>
</main>
${renderFooterHtml()}`,
        });
    }

    // 4. Products Index (/products)
    pages.push({
        route: '/products',
        title: 'Civil Engineering Lab Testing Instruments & Survey Equipment Ahmedabad | Unique Engineering',
        description:
            'Unique Engineering (uecivil.com) — Supplier of Compression Testing Machines (CTM 2000kN/3000kN), Cube Moulds, Soil CBR & Direct Shear, Bitumen Penetrometers, Sokkia Auto Levels & Total Stations.',
        canonical: `${COMPANY_ENTITY.domain}/products`,
        schema: {
            '@context': 'https://schema.org',
            '@graph': [
                {
                    '@type': 'BreadcrumbList',
                    itemListElement: [
                        { '@type': 'ListItem', position: 1, name: 'Home', item: `${COMPANY_ENTITY.domain}/` },
                        { '@type': 'ListItem', position: 2, name: 'Civil Lab Products', item: `${COMPANY_ENTITY.domain}/products` },
                    ],
                },
                {
                    '@type': 'CollectionPage',
                    name: 'Civil Lab Testing Equipment Catalog — Unique Engineering',
                    url: `${COMPANY_ENTITY.domain}/products`,
                },
                {
                    '@type': 'FAQPage',
                    mainEntity: PRODUCT_AEO_FAQS.map((f) => ({
                        '@type': 'Question',
                        name: f.q,
                        acceptedAnswer: { '@type': 'Answer', text: f.a },
                    })),
                },
            ],
        },
        bodyHtml: `
${renderNavHtml()}
<main>
  <h1>Civil Lab Testing Instruments &amp; Survey Equipment</h1>
  <table>
    <thead><tr><th>Testing Category</th><th>Key Equipment</th><th>Standards</th><th>Applications</th></tr></thead>
    <tbody>
      ${LAB_STANDARDS_ROWS.map(
          (r) => `<tr><td>${esc(r.category)}</td><td>${esc(r.keyEquipment)}</td><td>${esc(r.standards)}</td><td>${esc(r.applications)}</td></tr>`
      ).join('\n      ')}
    </tbody>
  </table>
  <section>
    <h2>Equipment Buyer FAQ</h2>
    ${PRODUCT_AEO_FAQS.map((f) => `<article><h3>${esc(f.q)}</h3><p>${esc(f.a)}</p></article>`).join('\n    ')}
  </section>
</main>
${renderFooterHtml()}`,
    });

    // 5. About (/about) & Contact (/contact)
    pages.push({
        route: '/about',
        title: 'About Unique Engineering & Survey | Civil Lab Instruments & Survey Solutions',
        description:
            'Learn about Unique Engineering & Survey (uecivil.com), founded by Atul Kanak in Prahladnagar, Ahmedabad, Gujarat — providing civil lab equipment and certified land surveys.',
        canonical: `${COMPANY_ENTITY.domain}/about`,
        schema: {
            '@context': 'https://schema.org',
            '@graph': [
                {
                    '@type': 'BreadcrumbList',
                    itemListElement: [
                        { '@type': 'ListItem', position: 1, name: 'Home', item: `${COMPANY_ENTITY.domain}/` },
                        { '@type': 'ListItem', position: 2, name: 'About Us', item: `${COMPANY_ENTITY.domain}/about` },
                    ],
                },
                {
                    '@type': 'AboutPage',
                    name: 'About Unique Engineering & Survey',
                    url: `${COMPANY_ENTITY.domain}/about`,
                },
            ],
        },
        bodyHtml: `
${renderNavHtml()}
<main>
  <h1>About Unique Engineering &amp; Survey</h1>
  <p>Founded by ${esc(COMPANY_ENTITY.founder)}, ${esc(COMPANY_ENTITY.brandName)} delivers certified land surveying (DGPS, Total Station, Contour, Point Marking, Drone Mapping) and IS/ASTM civil laboratory testing equipment from Ahmedabad across India.</p>
</main>
${renderFooterHtml()}`,
    });

    pages.push({
        route: '/contact',
        title: 'Contact & Office Location Ahmedabad | Unique Engineering & Survey',
        description: `Contact Unique Engineering & Survey at ${COMPANY_ENTITY.fullAddress}. Phone: ${COMPANY_ENTITY.phone}. Email: ${COMPANY_ENTITY.email}.`,
        canonical: `${COMPANY_ENTITY.domain}/contact`,
        schema: {
            '@context': 'https://schema.org',
            '@graph': [
                {
                    '@type': 'BreadcrumbList',
                    itemListElement: [
                        { '@type': 'ListItem', position: 1, name: 'Home', item: `${COMPANY_ENTITY.domain}/` },
                        { '@type': 'ListItem', position: 2, name: 'Contact', item: `${COMPANY_ENTITY.domain}/contact` },
                    ],
                },
                {
                    '@type': 'ContactPage',
                    name: 'Contact Unique Engineering & Survey',
                    url: `${COMPANY_ENTITY.domain}/contact`,
                },
            ],
        },
        bodyHtml: `
${renderNavHtml()}
<main>
  <h1>Contact Unique Engineering &amp; Survey</h1>
  <p><strong>Principal Consultant:</strong> ${esc(COMPANY_ENTITY.founder)}</p>
  <p><strong>Head Office:</strong> ${esc(COMPANY_ENTITY.fullAddress)}</p>
  <p><strong>Phone / WhatsApp:</strong> ${esc(COMPANY_ENTITY.phone)}</p>
  <p><strong>Email:</strong> ${esc(COMPANY_ENTITY.email)}</p>
  <p><strong>MSME Udyam:</strong> ${esc(COMPANY_ENTITY.udyamNumber)}</p>
</main>
${renderFooterHtml()}`,
    });

    return pages;
};

const injectRouteHtml = (baseHtml, page) => {
    let html = baseHtml;

    // 1. Replace <title>
    html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${esc(page.title)}</title>`);

    // 2. Replace primary meta title & description
    html = html.replace(
        /<meta name="title" content="[^"]*"\s*\/?>/i,
        `<meta name="title" content="${esc(page.title)}" />`
    );
    html = html.replace(
        /<meta name="description" content="[^"]*"\s*\/?>/i,
        `<meta name="description" content="${esc(page.description)}" />`
    );

    // 3. Replace OG & Twitter tags
    html = html.replace(/<meta property="og:url" content="[^"]*"\s*\/?>/i, `<meta property="og:url" content="${esc(page.canonical)}" />`);
    html = html.replace(/<meta property="og:title" content="[^"]*"\s*\/?>/i, `<meta property="og:title" content="${esc(page.title)}" />`);
    html = html.replace(/<meta property="og:description" content="[^"]*"\s*\/?>/i, `<meta property="og:description" content="${esc(page.description)}" />`);
    html = html.replace(/<meta name="twitter:url" content="[^"]*"\s*\/?>/i, `<meta name="twitter:url" content="${esc(page.canonical)}" />`);
    html = html.replace(/<meta name="twitter:title" content="[^"]*"\s*\/?>/i, `<meta name="twitter:title" content="${esc(page.title)}" />`);
    html = html.replace(/<meta name="twitter:description" content="[^"]*"\s*\/?>/i, `<meta name="twitter:description" content="${esc(page.description)}" />`);

    // 4. Inject route canonical link
    html = html.replace(
        '</head>',
        `  <link rel="canonical" href="${esc(page.canonical)}" />\n  </head>`
    );

    // 5. Replace JSON-LD block with route-specific JSON-LD
    html = html.replace(
        /<script type="application\/ld\+json">[\s\S]*?<\/script>/i,
        `<script type="application/ld+json">\n${JSON.stringify(page.schema, null, 2)}\n    </script>`
    );

    // 6. Replace <noscript> fallback with route-specific semantic HTML
    html = html.replace(
        /<noscript>[\s\S]*?<\/noscript>/i,
        `<noscript>${page.bodyHtml}\n    </noscript>`
    );

    // 7. Also place clean semantic HTML inside #root right before its closing tag
    // (Covered by fixed #app-splash-loader during initial JS boot, and replaced by React createRoot on mount;
    // directly readable by non-JS AI crawlers such as GPTBot, PerplexityBot, and ClaudeBot.)
    html = html.replace(
        /(<\/div>\s*)(<!-- Crawlable semantic fallback)/i,
        `  <div data-seo-prerender="true">${page.bodyHtml}</div>\n    $1$2`
    );

    return html;
};

const run = () => {
    if (!fs.existsSync(BASE_HTML_PATH)) {
        console.error('dist/index.html not found. Run vite build first.');
        process.exit(1);
    }

    const baseHtml = fs.readFileSync(BASE_HTML_PATH, 'utf8');
    const pages = buildRoutePages();

    for (const page of pages) {
        const relDir = page.route.replace(/^\/+/, '');
        const targetDir = path.join(DIST_DIR, relDir);
        fs.mkdirSync(targetDir, { recursive: true });
        const targetFile = path.join(targetDir, 'index.html');
        fs.writeFileSync(targetFile, injectRouteHtml(baseHtml, page), 'utf8');
    }

    // Add canonical link on root dist/index.html too
    const rootHtmlWithCanonical = baseHtml.includes('rel="canonical"')
        ? baseHtml
        : baseHtml.replace('</head>', `  <link rel="canonical" href="${COMPANY_ENTITY.domain}/" />\n  </head>`);
    fs.writeFileSync(BASE_HTML_PATH, rootHtmlWithCanonical, 'utf8');

    console.log(`[prerender-seo] Generated ${pages.length} static AEO/GEO HTML pages in dist/.`);
};

run();
