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
    const baseTitle = 'Unique Engineering | uecivil.com';
    const finalTitle = title ? `${title} | uecivil.com` : 'Unique Engineering | Civil Lab Instruments & Survey Solutions Ahmedabad — uecivil.com';
    document.title = finalTitle;

    // Helper to set or create meta tag
    const setMeta = (selector, attribute, value) => {
      if (!value) return;
      let el = document.querySelector(selector);
      if (!el) {
        el = document.createElement('meta');
        const [attrName] = selector.replace(/[\[\]']/g, '').split('=');
        if (selector.startsWith('meta[name=')) {
          el.setAttribute('name', attrName.replace('meta', ''));
        } else if (selector.startsWith('meta[property=')) {
          el.setAttribute('property', attrName.replace('meta', ''));
        }
        document.head.appendChild(el);
      }
      el.setAttribute(attribute, value);
    };

    // 2. Set Meta Description
    if (description) {
      setMeta('meta[name="description"]', 'content', description);
      setMeta('meta[property="og:description"]', 'content', ogDescription || description);
      setMeta('meta[name="twitter:description"]', 'content', ogDescription || description);
    }

    // 3. Set Meta Keywords
    if (keywords) {
      setMeta('meta[name="keywords"]', 'content', keywords);
    }

    // 4. Set Open Graph & Twitter Titles
    setMeta('meta[property="og:title"]', 'content', ogTitle || finalTitle);
    setMeta('meta[name="twitter:title"]', 'content', ogTitle || finalTitle);

    // 5. Canonical URL
    const finalCanonical = canonical || `https://uecivil.com${location.pathname}`;
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', finalCanonical);
    setMeta('meta[property="og:url"]', 'content', finalCanonical);

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
  }, [title, description, keywords, canonical, ogTitle, ogDescription, ogImage, schema, location.pathname]);

  return null;
};

export default SEO;
