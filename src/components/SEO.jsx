import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * SEO component to dynamically manage document head meta tags, canonical URL, and schema markup.
 */
const SEO = ({
  title,
  description,
  keywords,
  canonical,
  ogTitle,
  ogDescription,
  ogImage = 'https://uecivil.com/pwa-512x512.png',
  schema,
}) => {
  const location = useLocation();

  useEffect(() => {
    // 1. Update Title
    const finalTitle = title
      ? (title.toLowerCase().includes('uecivil') ? title : `${title} | uecivil.com`)
      : 'Unique Engineering | Civil Lab Instruments & Survey Solutions Ahmedabad — uecivil.com';
    document.title = finalTitle;

    // Helper to safely set or create meta tag
    const setMeta = (attr, key, content) => {
      if (!content) return;
      let el = document.querySelector(`meta[${attr}="${key}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    // 2. Set Meta Description
    if (description) {
      setMeta('name', 'description', description);
      setMeta('property', 'og:description', ogDescription || description);
      setMeta('name', 'twitter:description', ogDescription || description);
    }

    // 3. Set Meta Keywords
    if (keywords) {
      setMeta('name', 'keywords', keywords);
    }

    // 4. Set Open Graph & Twitter Titles and Images
    setMeta('name', 'title', finalTitle);
    setMeta('property', 'og:title', ogTitle || finalTitle);
    setMeta('name', 'twitter:title', ogTitle || finalTitle);

    if (ogImage) {
      setMeta('property', 'og:image', ogImage);
      setMeta('name', 'twitter:image', ogImage);
    }

    // 5. Canonical URL (Ensure exact self-referencing canonical for every route & query param)
    const finalCanonical = canonical || `https://uecivil.com${location.pathname}${location.search || ''}`;
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', finalCanonical);
    setMeta('property', 'og:url', finalCanonical);
    setMeta('name', 'twitter:url', finalCanonical);

    // Robots meta guarantee
    setMeta('name', 'robots', 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1');

    // 6. Optional Dynamic JSON-LD Schema
    let scriptTag = document.getElementById('dynamic-page-schema');
    if (schema) {
      if (!scriptTag) {
        scriptTag = document.createElement('script');
        scriptTag.id = 'dynamic-page-schema';
        scriptTag.type = 'application/ld+json';
        document.head.appendChild(scriptTag);
      }
      scriptTag.textContent = JSON.stringify(schema);
    } else if (scriptTag) {
      scriptTag.remove();
    }
  }, [title, description, keywords, canonical, ogTitle, ogDescription, ogImage, schema, location.pathname, location.search]);

  return null;
};

export default SEO;
